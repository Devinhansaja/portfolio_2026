/* ============================================================
   Portfolio admin panel
   - Edits everything in data.js through forms
   - Uploads images / videos / PDFs (images are resized in the browser)
   - Publishes all changes to GitHub in one commit; Vercel then redeploys
   ============================================================ */
(() => {
  "use strict";

  // ---------- Small helpers ----------
  const $ = (s, el = document) => el.querySelector(s);
  function h(tag, props = {}, ...kids) {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(props || {})) {
      if (v == null || v === false) continue;
      if (k === "class") el.className = v;
      else if (k === "text") el.textContent = v;
      else if (k === "value") el.value = v;
      else if (k.startsWith("on") && typeof v === "function") el.addEventListener(k.slice(2).toLowerCase(), v);
      else if (k in el && typeof v !== "string") el[k] = v;
      else el.setAttribute(k, v === true ? "" : v);
    }
    for (const kid of kids.flat(Infinity)) if (kid != null && kid !== false) el.append(kid instanceof Node ? kid : String(kid));
    return el;
  }
  const clone = (o) => JSON.parse(JSON.stringify(o));
  const slug = (s) =>
    String(s).toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40);
  const fmtTime = (sec) => `${Math.floor(sec / 60)}:${String(Math.round(sec % 60)).padStart(2, "0")}`;
  const mb = (n) => (n / 1048576).toFixed(1) + " MB";
  let uid = 0;

  function toast(msg, type = "ok", ms = 5000) {
    const t = h("div", { class: `toast ${type}` });
    if (msg instanceof Node) t.append(msg);
    else t.textContent = msg;
    $("#toasts").append(t);
    setTimeout(() => t.remove(), ms);
  }
  function busy(on, text = "Working…") {
    $("#busy").hidden = !on;
    $("#busy-text").textContent = text;
  }

  // ---------- State ----------
  let data = clone(typeof PORTFOLIO !== "undefined" ? PORTFOLIO : {});
  const pending = new Map(); // site path -> { blob, url } — new files not published yet
  const published = new Map(); // site path -> { url } — published this session (live site may still be deploying)
  const openSet = new Set(); // which list items are expanded
  let dirty = false;
  let current = "profile";

  // ---------- GitHub settings (kept only in this browser) ----------
  const S_KEY = "portfolio-admin-github";
  const DRAFT_KEY = "portfolio-admin-draft";
  const store = {
    get(k) {
      try {
        return JSON.parse(localStorage.getItem(k));
      } catch {
        return null;
      }
    },
    set(k, v) {
      try {
        localStorage.setItem(k, JSON.stringify(v));
      } catch {}
    },
    del(k) {
      try {
        localStorage.removeItem(k);
      } catch {}
    },
  };
  let gh = store.get(S_KEY) || { owner: "", repo: "", branch: "main", dir: "", token: "" };
  let ghOk = false; // true once we've loaded content from GitHub successfully
  let ghError = ""; // last GitHub error, shown so problems are easy to fix
  // "server": live site with /api login (GitHub details come from the server, kept in memory only)
  // "local":  no /api (e.g. a local test server) — GitHub token is entered by hand in Publish settings
  let mode = "local";
  const connected = () => !!(gh.owner && gh.repo && gh.token);
  const repoPath = (p) => (gh.dir ? gh.dir.replace(/^\/+|\/+$/g, "") + "/" : "") + p;

  async function api(path, opts = {}) {
    const res = await fetch(`https://api.github.com/repos/${encodeURIComponent(gh.owner)}/${encodeURIComponent(gh.repo)}${path}`, {
      method: opts.method || "GET",
      body: opts.body ? JSON.stringify(opts.body) : undefined,
      headers: {
        Authorization: `Bearer ${gh.token}`,
        Accept: opts.accept || "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        ...(opts.body ? { "Content-Type": "application/json" } : {}),
      },
    });
    if (!res.ok) {
      let msg = `GitHub error ${res.status}`;
      try {
        msg += ": " + (await res.json()).message;
      } catch {}
      if (res.status === 401) msg += " — the token is wrong or expired.";
      if (res.status === 404) msg += " — check the username, repository, branch and that the token can access this repo.";
      if (res.status === 403) msg += " — the token needs Contents: Read and write permission.";
      throw new Error(msg);
    }
    return opts.raw ? res.text() : res.json();
  }

  const parseDataJs = (text) => new Function(`${text}\n;return PORTFOLIO;`)();
  const serialize = () =>
    "// Portfolio content. Edit it with the admin panel (admin.html), or carefully by hand.\n" +
    `const PORTFOLIO = ${JSON.stringify(data, null, 2)};\n`;

  async function loadFromGitHub() {
    const text = await api(`/contents/${repoPath("data.js").split("/").map(encodeURIComponent).join("/")}?ref=${encodeURIComponent(gh.branch || "main")}`, {
      accept: "application/vnd.github.raw+json",
      raw: true,
    });
    data = parseDataJs(text);
    ghOk = true;
  }

  const blobToB64 = (blob) =>
    new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(String(r.result).split(",")[1] || "");
      r.onerror = () => reject(r.error);
      r.readAsDataURL(blob);
    });

  const isUsed = (path) => JSON.stringify(data).includes(JSON.stringify(path));

  async function publish() {
    if (!connected()) return toast("Connect GitHub first (Publish settings).", "error");
    const branch = gh.branch || "main";
    try {
      const files = [...pending].filter(([p]) => isUsed(p));
      busy(true, "Uploading files…");
      const tree = [];
      let n = 0;
      for (const [path, f] of files) {
        busy(true, `Uploading file ${++n} of ${files.length} (${mb(f.blob.size)})…`);
        const blob = await api("/git/blobs", { method: "POST", body: { content: await blobToB64(f.blob), encoding: "base64" } });
        tree.push({ path: repoPath(path), mode: "100644", type: "blob", sha: blob.sha });
      }
      busy(true, "Saving content…");
      const dataBlob = await api("/git/blobs", {
        method: "POST",
        body: { content: await blobToB64(new Blob([serialize()], { type: "text/javascript" })), encoding: "base64" },
      });
      tree.push({ path: repoPath("data.js"), mode: "100644", type: "blob", sha: dataBlob.sha });
      const ref = await api(`/git/ref/heads/${encodeURIComponent(branch)}`);
      const head = await api(`/git/commits/${ref.object.sha}`);
      const newTree = await api("/git/trees", { method: "POST", body: { base_tree: head.tree.sha, tree } });
      const commit = await api("/git/commits", {
        method: "POST",
        body: { message: `Update portfolio content (admin panel)${files.length ? ` + ${files.length} file(s)` : ""}`, tree: newTree.sha, parents: [ref.object.sha] },
      });
      await api(`/git/refs/heads/${encodeURIComponent(branch)}`, { method: "PATCH", body: { sha: commit.sha } });
      for (const [p, f] of pending) published.set(p, { url: f.url });
      pending.clear();
      dirty = false;
      store.del(DRAFT_KEY);
      updateStatus();
      render();
      toast(
        h("div", {}, "Published! Your site will update in about a minute. ",
          h("a", { href: `https://github.com/${gh.owner}/${gh.repo}/commit/${commit.sha}`, target: "_blank", rel: "noopener", text: "View commit ↗" })),
        "ok",
        9000
      );
    } catch (e) {
      toast(e.message, "error", 12000);
    } finally {
      busy(false);
    }
  }

  function download() {
    const a = h("a", { href: URL.createObjectURL(new Blob([serialize()], { type: "text/javascript" })), download: "data.js" });
    document.body.append(a);
    a.click();
    a.remove();
    if (pending.size) toast("Note: uploaded files are not inside data.js. Use Publish (GitHub) to save uploads.", "info", 8000);
  }

  // ---------- Uploads ----------
  const resolve = (p) => (p && (pending.get(p) || published.get(p))?.url) || p;

  async function shrinkImage(file, maxW) {
    if (!/^image\/(png|jpe?g|webp)$/i.test(file.type)) return { blob: file, ext: file.name.split(".").pop().toLowerCase() };
    const bmp = await createImageBitmap(file);
    const scale = Math.min(1, maxW / bmp.width);
    const c = h("canvas", { width: Math.round(bmp.width * scale), height: Math.round(bmp.height * scale) });
    c.getContext("2d").drawImage(bmp, 0, 0, c.width, c.height);
    const blob = await new Promise((r) => c.toBlob(r, "image/webp", 0.86));
    // keep the original if it was already smaller
    return blob && blob.size < file.size ? { blob, ext: "webp" } : { blob: file, ext: file.name.split(".").pop().toLowerCase() };
  }

  function addPending(blob, name, ext) {
    const path = `assets/uploads/${slug(name) || "file"}-${Date.now().toString(36)}.${ext}`;
    pending.set(path, { blob, url: URL.createObjectURL(blob) });
    return path;
  }

  async function uploadFile(file, def) {
    if (file.size > 95 * 1048576) throw new Error(`${file.name} is ${mb(file.size)}. GitHub allows up to 95 MB per file — compress it first.`);
    const base = file.name.replace(/\.[^.]+$/, "");
    if (def.type === "image") {
      const { blob, ext } = await shrinkImage(file, def.maxW || 1600);
      return addPending(blob, base, ext);
    }
    if (def.type === "video" && file.size > 25 * 1048576)
      toast(`${file.name} is ${mb(file.size)}. Large videos load slowly — try to keep reels under 20 MB.`, "info", 9000);
    return addPending(file, base, file.name.split(".").pop().toLowerCase());
  }

  // Grab a frame from a video for its cover image, plus its length
  function videoInfo(file) {
    return new Promise((resolveP) => {
      const v = h("video", { muted: true, playsInline: true, preload: "auto", src: URL.createObjectURL(file) });
      const done = (poster) => resolveP({ poster, duration: v.duration || 0 });
      v.onloadedmetadata = () => (v.currentTime = Math.min(1.5, (v.duration || 3) / 3));
      v.onseeked = () => {
        const w = Math.min(720, v.videoWidth || 720);
        const c = h("canvas", { width: w, height: Math.round(((v.videoHeight || 1280) * w) / (v.videoWidth || 720)) });
        c.getContext("2d").drawImage(v, 0, 0, c.width, c.height);
        c.toBlob((b) => done(b), "image/jpeg", 0.82);
      };
      v.onerror = () => done(null);
      setTimeout(() => done(null), 15000);
    });
  }

  // ---------- Field editors ----------
  const COLORS = [
    ["#1558C9", "Blue"],
    ["#D4FF24", "Lime"],
  ];

  function field(def, obj, ctx) {
    const id = "f" + ++uid;
    const set = (v) => {
      obj[def.key] = v;
      changed();
      ctx.retitle && ctx.retitle();
    };
    const val = obj[def.key];
    let control;
    switch (def.type) {
      case "textarea":
        control = h("textarea", { id, rows: def.rows || 3, value: val ?? "", onInput: (e) => set(e.target.value) });
        break;
      case "number":
        control = h("input", { id, type: "number", value: val ?? 0, onInput: (e) => set(e.target.value === "" ? 0 : Number(e.target.value)) });
        break;
      case "toggle":
        control = h("label", { class: "toggle" }, h("input", { id, type: "checkbox", checked: !!val, onChange: (e) => set(e.target.checked) }), h("span"));
        break;
      case "select":
        control = h(
          "select",
          { id, onChange: (e) => set(e.target.value) },
          def.options.map(([v, l]) => h("option", { value: v, text: l, selected: (val || "") === v }))
        );
        break;
      case "color": {
        control = h("div", { class: "swatches" });
        const draw = () =>
          control.replaceChildren(
            ...COLORS.map(([c, name]) =>
              h("button", {
                type: "button", title: name, "aria-label": name, class: (obj[def.key] || "").toLowerCase() === c.toLowerCase() ? "on" : "",
                style: `background:${c}`, onClick: () => { set(c); draw(); },
              })
            )
          );
        draw();
        break;
      }
      case "tags":
        control = tagsEditor(def, obj);
        break;
      case "image":
      case "video":
      case "file":
        control = mediaEditor(def, obj, ctx);
        break;
      case "list":
        if (!Array.isArray(obj[def.key])) obj[def.key] = [];
        control = listEditor(def, obj[def.key], `${ctx.scope}/${def.key}`);
        break;
      default: {
        const listId = def.suggest ? id + "-dl" : null;
        control = h("input", { id, type: def.type || "text", value: val ?? "", placeholder: def.placeholder || "", list: listId, onInput: (e) => set(e.target.value) });
        if (def.suggest) control = h("div", {}, control, h("datalist", { id: listId }, def.suggest().map((s) => h("option", { value: s }))));
      }
    }
    return h("div", { class: "field" }, h("label", { for: id, text: def.label }), control, def.hint ? h("p", { class: "hint", text: def.hint }) : null);
  }

  function tagsEditor(def, obj) {
    if (!Array.isArray(obj[def.key])) obj[def.key] = [];
    const arr = obj[def.key];
    const box = h("div", { class: "tags-ed" });
    const add = () => {
      const v = input.value.trim().replace(/,$/, "");
      if (v) {
        arr.push(v);
        input.value = "";
        changed();
        draw();
      }
      input.focus();
    };
    const input = h("input", {
      placeholder: "Type, then press Enter",
      "aria-label": def.label,
      onKeydown: (e) => {
        if (e.key === "Enter" || e.key === ",") {
          e.preventDefault();
          add();
        } else if (e.key === "Backspace" && !input.value && arr.length) {
          arr.pop();
          changed();
          draw();
          input.focus();
        }
      },
      onBlur: () => input.value.trim() && add(),
    });
    const draw = () =>
      box.replaceChildren(
        ...arr.map((t, i) =>
          h("span", { class: "chip" }, t, h("button", { type: "button", title: `Remove ${t}`, text: "×", onClick: () => { arr.splice(i, 1); changed(); draw(); } }))
        ),
        input
      );
    draw();
    return box;
  }

  function mediaEditor(def, obj, ctx) {
    const box = h("div", { class: "media-ed" });
    const fileInput = h("input", {
      type: "file",
      hidden: true,
      accept: def.accept || (def.type === "image" ? "image/*" : def.type === "video" ? "video/*" : "*/*"),
      onChange: async (e) => {
        const f = e.target.files[0];
        e.target.value = "";
        if (!f) return;
        try {
          busy(true, `Preparing ${f.name}…`);
          obj[def.key] = await uploadFile(f, def);
          if (def.type === "video") {
            const info = await videoInfo(f);
            if (def.posterKey && info.poster) obj[def.posterKey] = addPending(info.poster, f.name.replace(/\.[^.]+$/, "") + "-cover", "jpg");
            if (def.lengthKey && info.duration) obj[def.lengthKey] = fmtTime(info.duration);
          }
          changed();
          ctx.rerender ? ctx.rerender() : draw();
          toast(`${f.name} added. Click Publish to save it to the site.`, "info");
        } catch (err) {
          toast(err.message, "error", 9000);
        } finally {
          busy(false);
        }
      },
    });
    const draw = () => {
      const path = obj[def.key] || "";
      const src = resolve(path);
      let thumb;
      if (!path) thumb = h("div", { class: "media-thumb empty", text: def.type === "video" ? "No video" : def.type === "image" ? "No image" : "No file" });
      else if (def.type === "image") thumb = h("div", { class: "media-thumb" }, h("img", { src, alt: "" }));
      else if (def.type === "video") thumb = h("div", { class: "media-thumb" }, h("video", { src, muted: true, controls: true, preload: "metadata", playsInline: true }));
      else thumb = h("div", { class: "media-thumb" }, h("a", { href: src, target: "_blank", rel: "noopener", text: "Open file ↗" }));
      box.replaceChildren(
        thumb,
        h(
          "div",
          { class: "media-side" },
          h(
            "div",
            { class: "btns" },
            h("button", { type: "button", class: "blue sm", text: path ? "Replace…" : "Upload…", onClick: () => fileInput.click() }),
            path ? h("button", { type: "button", class: "ghost sm danger", text: "Remove", onClick: () => { obj[def.key] = ""; changed(); draw(); ctx.retitle && ctx.retitle(); } }) : null
          ),
          h("input", {
            value: path, placeholder: "assets/… or https://…", "aria-label": `${def.label} path`,
            onChange: (e) => { obj[def.key] = e.target.value.trim(); changed(); draw(); ctx.retitle && ctx.retitle(); },
          }),
          pending.has(path) ? h("span", { class: "badge", text: "New — not published yet" }) : null,
          fileInput
        )
      );
    };
    draw();
    return box;
  }

  function listEditor(def, arr, scope) {
    const wrap = h("div", { class: "list" });
    const rerender = () => render();
    const titleOf = (item, i) => (def.title ? def.title(item) : "") || `${def.singular || "Item"} ${i + 1}`;
    arr.forEach((item, i) => {
      const key = `${scope}/${i}`;
      const thumbPath = def.thumb ? def.thumb(item) : "";
      const titleEl = h("span", { class: "li-title", text: titleOf(item, i) });
      const tool = (label, title, fn, disabled) =>
        h("button", {
          type: "button", class: "icon", text: label, title, "aria-label": title, disabled: !!disabled,
          onClick: (e) => { e.preventDefault(); e.stopPropagation(); fn(); },
        });
      const move = (d) => {
        const j = i + d;
        [arr[i], arr[j]] = [arr[j], arr[i]];
        const wasOpen = openSet.has(key);
        openSet.delete(key);
        if (wasOpen) openSet.add(`${scope}/${j}`);
        changed();
        rerender();
      };
      const summary = h(
        "summary",
        {},
        h("span", { class: "li-idx", text: String(i + 1).padStart(2, "0") }),
        thumbPath ? h("img", { class: "li-thumb", src: resolve(thumbPath), alt: "" }) : null,
        titleEl,
        h(
          "span",
          { class: "li-tools" },
          tool("↑", "Move up", () => move(-1), i === 0),
          tool("↓", "Move down", () => move(1), i === arr.length - 1),
          tool("⧉", "Duplicate", () => { arr.splice(i + 1, 0, clone(item)); changed(); rerender(); }),
          tool("✕", "Delete", () => {
            if (!confirm(`Delete "${titleOf(item, i)}"?`)) return;
            arr.splice(i, 1);
            [...openSet].filter((k) => k.startsWith(scope + "/")).forEach((k) => openSet.delete(k));
            changed();
            rerender();
          })
        )
      );
      const ctx = { scope: key, rerender, retitle: () => (titleEl.textContent = titleOf(item, i)) };
      const det = h("details", { class: "item", open: openSet.has(key) }, summary);
      det.addEventListener("toggle", () => {
        if (det.open) {
          openSet.add(key);
          if (!det.querySelector(".item-body")) det.append(h("div", { class: "item-body" }, def.fields.map((f) => field(f, item, ctx))));
        } else openSet.delete(key);
      });
      if (det.open) det.append(h("div", { class: "item-body" }, def.fields.map((f) => field(f, item, ctx))));
      wrap.append(det);
    });
    wrap.append(
      h("button", {
        type: "button", class: "ghost add-btn", text: `+ Add ${def.singular || "item"}`,
        onClick: () => {
          arr.push(def.make ? def.make() : Object.fromEntries(def.fields.map((f) => [f.key, f.type === "tags" || f.type === "list" ? [] : ""])));
          openSet.add(`${scope}/${arr.length - 1}`);
          changed();
          rerender();
        },
      })
    );
    return wrap;
  }

  // ---------- What can be edited ----------
  const T = (key, label, extra = {}) => ({ key, label, ...extra });
  const categories = () => [...new Set((data.projects || []).map((p) => p.category).filter(Boolean))];

  const SECTIONS = [
    {
      id: "profile", label: "Profile", icon: "👤", anchor: "#top",
      note: "Your name, intro and photo at the top of the site.",
      fields: [
        T("fullName", "Full name", { hint: "Used in the browser tab title." }),
        T("firstName", "First name", { hint: "Big hero text and the logo." }),
        T("lastName", "Last name"),
        T("roles", "Roles", { type: "tags", hint: "They rotate under your name. The first one is also used in the browser tab title." }),
        T("tagline", "Short intro", { type: "textarea" }),
        T("location", "Location"),
        T("available", 'Show "Available for work"', { type: "toggle" }),
        T("photo", "Hero photo", { type: "image", maxW: 1000, hint: "A photo with a transparent background looks best." }),
        T("cvLink", "CV (PDF)", { type: "file", accept: "application/pdf", hint: "Used by the Download CV button." }),
        T("quote", "Quote card (About section)", { type: "textarea" }),
      ],
    },
    {
      id: "loader", label: "Loading screen", icon: "⏳", anchor: "#top", obj: "loader",
      note: "The short animation before the site appears. The last word of line 1 gets “clicked”. The preview skips it — check it on the live site.",
      fields: [
        T("enabled", "Show the loading screen", { type: "toggle" }),
        T("line1", "Line 1 (words appear one by one)"),
        T("line2", "Line 2", { hint: "Leave empty to skip this line." }),
        T("line3", "Line 3 (typed out, big)"),
        T("handle", "Handle (top right)", { placeholder: "@yourname" }),
      ],
    },
    {
      id: "stats", label: "Hero stats", icon: "📊", anchor: "#top",
      note: "The three numbers under the hero.",
      list: {
        key: "stats", singular: "stat",
        title: (s) => `${s.value ?? ""}${s.suffix || ""} ${s.label || ""}`.trim(),
        make: () => ({ value: 0, suffix: "+", label: "" }),
        fields: [T("value", "Number", { type: "number" }), T("suffix", "After the number", { placeholder: "+" }), T("label", "Label")],
      },
    },
    {
      id: "reels", label: "Reels", icon: "🎬", anchor: "#reels",
      note: "Vertical 9:16 videos. The cover image and length fill in automatically when you upload a video. Keep each video under about 20 MB.",
      list: {
        key: "reels", singular: "reel", title: (r) => r.title, thumb: (r) => r.poster,
        make: () => ({ title: "New reel", client: "", length: "", video: "", poster: "" }),
        fields: [
          T("title", "Title"),
          T("client", "Client / brand"),
          T("video", "Video file", { type: "video", accept: "video/mp4,video/webm,video/quicktime", posterKey: "poster", lengthKey: "length" }),
          T("poster", "Cover image", { type: "image", maxW: 720 }),
          T("length", "Length", { placeholder: "0:45" }),
        ],
      },
    },
    {
      id: "films", label: "Wedding films", icon: "🎞️", anchor: ".film-grid",
      note: "Landscape (16:9) videos shown under the reels, played right on the page. Leave the list empty to hide them.",
      list: {
        key: "films", singular: "film", title: (f) => f.title, thumb: (f) => f.poster,
        make: () => ({ title: "New film", client: "", length: "", video: "", poster: "" }),
        fields: [
          T("title", "Title"),
          T("client", "Client / brand"),
          T("video", "Video file", { type: "video", accept: "video/mp4,video/webm,video/quicktime", posterKey: "poster", lengthKey: "length" }),
          T("poster", "Cover image", { type: "image", maxW: 1280 }),
          T("length", "Length", { placeholder: "4:20" }),
        ],
      },
    },
    {
      id: "youtube", label: "YouTube videos", icon: "▶️", anchor: ".yt-head",
      note: "Long-form videos shown under the reels. Paste a normal YouTube link — the thumbnail appears automatically. If the link has a playlist, a “Full series” link is added.",
      list: {
        key: "youtube", singular: "video", title: (v) => v.title,
        make: () => ({ title: "", channel: "", url: "" }),
        fields: [
          T("url", "YouTube link", { type: "url", placeholder: "https://www.youtube.com/watch?v=…" }),
          T("title", "Title"),
          T("channel", "Channel / series"),
        ],
      },
    },
    {
      id: "photos", label: "Photography", icon: "📸", anchor: "#photos",
      note: "The photo gallery. Upload your best shots — they're resized automatically. Visitors can click a photo to see it big. Leave the list empty to hide the section.",
      fields: [
        T("photos", "Photos", {
          type: "list", singular: "photo", title: (ph) => ph.caption || ph.category, thumb: (ph) => ph.src,
          make: () => ({ src: "", caption: "", category: "" }),
          fields: [
            T("src", "Photo", { type: "image", maxW: 1800 }),
            T("caption", "Caption", { placeholder: "Wedding — Leshika & Chathura" }),
            T("category", "Category", { placeholder: "Weddings / Portraits / Events / Fashion" }),
          ],
        }),
        T("photoLink", "“See more” link", { type: "url", placeholder: "https://www.facebook.com/…", hint: "Shown under the gallery, e.g. your Focus Photography page. Leave empty to hide." }),
      ],
    },
    {
      id: "photoshoots", label: "Photoshoots", icon: "📷", anchor: ".shoots-sec",
      note: "Each shoot is a frame on the site whose photos change by themselves. Upload the shoot's best photos (they're resized automatically). Shown only while the Photography gallery is empty.",
      list: {
        key: "photoshoots", singular: "shoot", title: (s) => s.title, thumb: (s) => s.photos && s.photos[0] && (s.photos[0].src || s.photos[0]),
        make: () => ({ title: "New shoot", category: "", url: "", photos: [] }),
        fields: [
          T("title", "Shoot name", { placeholder: "Wedding — Leshika & Chathura" }),
          T("category", "Type", { placeholder: "Portrait shoot / Event coverage / Wedding" }),
          T("url", "Facebook post link", { type: "url", placeholder: "https://www.facebook.com/…", hint: "Optional. Adds a “Facebook ↗” link under the frame." }),
          T("photos", "Photos", {
            type: "list", singular: "Photo", thumb: (p) => p.src,
            make: () => ({ src: "" }),
            fields: [T("src", "Photo", { type: "image", maxW: 1600 })],
          }),
        ],
      },
    },
    {
      id: "pages", label: "Facebook pages", icon: "📘", anchor: "#pages",
      note: "Pages you manage, shown as cards with the page logo. Clicking a card opens the page on Facebook.",
      list: {
        key: "pages", singular: "page", title: (p) => p.name, thumb: (p) => p.logo,
        make: () => ({ name: "", url: "", logo: "" }),
        fields: [
          T("name", "Page name"),
          T("url", "Facebook page link", { type: "url", placeholder: "https://www.facebook.com/…" }),
          T("logo", "Page logo", { type: "image", maxW: 400, hint: "A square logo or profile picture looks best." }),
        ],
      },
    },
    {
      id: "projects", label: "Web & design", icon: "🗂️", anchor: "#work",
      note: "Cards in “Work that speaks”. Filter tabs are made automatically from the categories.",
      list: {
        key: "projects", singular: "project", title: (p) => p.title, thumb: (p) => p.image,
        make: () => ({ title: "New project", category: "Websites", year: "", role: "", description: "", tags: [], live: "", liveLabel: "Visit site", embed: "", github: "", image: "", color: "#1558C9" }),
        fields: [
          T("title", "Title"),
          T("category", "Category (filter tab)", { suggest: categories }),
          T("year", "Year"),
          T("role", "Your role"),
          T("description", "Description", { type: "textarea" }),
          T("tags", "Tags / tech", { type: "tags" }),
          T("image", "Image / screenshot", { type: "image", maxW: 1400 }),
          T("imagePos", "Image focus", { type: "select", options: [["", "Top (default)"], ["center", "Center"], ["center 70%", "Lower middle"], ["bottom", "Bottom"]] }),
          T("live", "Website / live link", { type: "url", placeholder: "https://…" }),
          T("liveLabel", "Link text", { placeholder: "Visit site" }),
          T("embed", "Live preview URL", { type: "url", placeholder: "https://…", hint: "Shows the real website inside the card. Only works if that site allows embedding — otherwise leave empty and the image is shown." }),
          T("github", "GitHub link", { type: "url", placeholder: "https://github.com/…" }),
          T("color", "Accent colour", { type: "color" }),
        ],
      },
    },
    {
      id: "compare", label: "Wireframe slider", icon: "🪄", anchor: ".compare-sec",
      note: "“From wireframe to real”. Use two images of the same size. Add more than one to get tabs. Leave empty to hide the section.",
      list: {
        key: "compare", singular: "site", title: (c) => c.name, thumb: (c) => c.real,
        make: () => ({ name: "", url: "", sketch: "", real: "" }),
        fields: [
          T("name", "Site name"),
          T("url", "Website link", { type: "url" }),
          T("sketch", "Wireframe image", { type: "image", maxW: 1600 }),
          T("real", "Final design image", { type: "image", maxW: 1600 }),
        ],
      },
    },
    {
      id: "clients", label: "Clients", icon: "🤝", anchor: ".clients",
      note: "Logos in the “Been part of the bigger picture” strip, which keeps moving left to right. Square logos look best.",
      list: {
        key: "clients", singular: "client", title: (c) => c.name, thumb: (c) => c.logo,
        make: () => ({ name: "", logo: "" }),
        fields: [T("name", "Company name"), T("logo", "Logo", { type: "image", maxW: 300 })],
      },
    },
    {
      id: "skills", label: "Skills & tools", icon: "🧰", anchor: "#about",
      fields: [T("skills", "Skills", { type: "tags", hint: "Put the most important first — they also lead the scrolling banner under the hero." }), T("tools", "Tools I use", { type: "tags" })],
    },
    {
      id: "process", label: "Process steps", icon: "🔢", anchor: "#about",
      list: { key: "process", singular: "step", title: (p) => p.title, make: () => ({ title: "", text: "" }), fields: [T("title", "Step title"), T("text", "Description", { type: "textarea", rows: 2 })] },
    },
    {
      id: "journey", label: "Journey", icon: "🧭", anchor: "#journey", note: "Your work experience timeline.",
      list: {
        key: "journey", singular: "role", title: (j) => [j.role, j.company].filter(Boolean).join(" — "),
        make: () => ({ period: "", role: "", company: "", logo: "", text: "" }),
        fields: [
          T("period", "Period", { placeholder: "2024 — Present" }),
          T("role", "Job title"),
          T("company", "Company"),
          T("logo", "Company logo", { type: "image", maxW: 300, hint: "Optional. A square logo looks best." }),
          T("text", "What you did", { type: "textarea" }),
        ],
      },
    },
    {
      id: "contact", label: "Contact", icon: "✉️", anchor: "#contact", obj: "contact",
      fields: [
        T("email", "Email", { type: "email" }),
        T("phone", "Phone"),
        T("whatsapp", "WhatsApp number", { hint: "Digits only with country code, e.g. 94703766481." }),
        T("socials", "Social links", { type: "list", singular: "link", title: (s) => s.name, make: () => ({ name: "", url: "" }), fields: [T("name", "Name"), T("url", "Link", { type: "url" })] }),
      ],
    },
    { sep: true },
    {
      id: "education", label: "Education", icon: "🎓", anchor: "#about", note: "Hidden on the site while this list is empty.",
      list: { key: "education", singular: "entry", title: (e) => e.title, make: () => ({ period: "", title: "", place: "" }), fields: [T("period", "Period"), T("title", "Course / qualification"), T("place", "School / institute")] },
    },
    {
      id: "awards", label: "Achievements", icon: "🏆", anchor: "#awards", note: "Hidden on the site while this list is empty.",
      list: { key: "awards", singular: "achievement", title: (a) => a.title, make: () => ({ badge: "", title: "", org: "" }), fields: [T("badge", "Badge (right side)", { placeholder: "1st Dan" }), T("title", "Title"), T("org", "Details")] },
    },
    { sep: true },
    { id: "settings", label: "Publish settings", icon: "⚙️", custom: renderSettings },
  ];

  // ---------- Rendering ----------
  function renderNav() {
    $("#nav").replaceChildren(
      ...SECTIONS.map((s) => {
        if (s.sep) return h("hr");
        const count = s.list && Array.isArray(data[s.list.key]) ? data[s.list.key].length : null;
        return h(
          "button",
          { type: "button", class: s.id === current ? "active" : "", "aria-current": s.id === current ? "page" : null, onClick: () => show(s.id) },
          h("span", { text: s.icon, "aria-hidden": "true" }),
          s.label,
          count != null ? h("span", { class: "count", text: count }) : null
        );
      })
    );
  }

  function show(id) {
    current = id;
    render();
    $("#editor").scrollTop = 0;
    const s = SECTIONS.find((x) => x.id === id);
    if (s && s.anchor) scrollPreview(s.anchor);
  }

  function render() {
    renderNav();
    const s = SECTIONS.find((x) => x.id === current);
    const ed = $("#editor");
    const keepScroll = ed.scrollTop;
    const kids = [h("h1", { class: "sec-title", text: s.label })];
    if (s.note) kids.push(h("p", { class: "sec-note", text: s.note }));
    if (s.custom) kids.push(s.custom());
    else if (s.list) {
      if (!Array.isArray(data[s.list.key])) data[s.list.key] = [];
      // older data kept client names as plain text
      if (s.list.key === "clients") data.clients = data.clients.map((c) => (typeof c === "string" ? { name: c, logo: "" } : c));
      kids.push(listEditor(s.list, data[s.list.key], s.id));
    } else {
      const target = s.obj ? (data[s.obj] = data[s.obj] || {}) : data;
      kids.push(h("div", { class: "card" }, s.fields.map((f) => field(f, target, { scope: s.id, rerender: render }))));
    }
    ed.replaceChildren(...kids);
    ed.scrollTop = keepScroll;
  }

  function renderSettings() {
    if (mode === "server")
      return h(
        "div",
        {},
        ghOk
          ? h("div", { class: "okbox", text: `Signed in. Publishing to ${gh.owner}/${gh.repo} (${gh.branch || "main"}); Vercel updates the site after each Publish.` })
          : h(
              "div",
              { class: "warn" },
              h("b", { text: "Signed in, but GitHub didn't accept the connection." }),
              h("div", { style: "margin:6px 0 8px;font-family:var(--mono);font-size:12px", text: ghError || "No details." }),
              h(
                "ul",
                { style: "margin-left:18px;display:grid;gap:4px" },
                h("li", { text: "401 / Bad credentials → GITHUB_TOKEN is wrong, deleted or still the placeholder text. Make a new token and replace it in Vercel." }),
                h("li", { text: "403 / Resource not accessible → the token needs Repository access to this repo and Contents: Read and write." }),
                h("li", { text: `404 / Not Found → check GITHUB_REPO is exactly ${gh.owner || "owner"}/${gh.repo || "repo"} and the token can see that repo.` }),
                h("li", { text: "After changing anything in Vercel: Deployments → ⋯ → Redeploy, then sign in again." })
              ),
              h("button", {
                type: "button", class: "primary", style: "margin-top:10px", text: "Try again",
                onClick: async () => {
                  try {
                    busy(true, "Connecting to GitHub…");
                    const keep = dirty ? data : null; // don't lose edits made while disconnected
                    await loadFromGitHub();
                    if (keep) data = keep;
                    ghError = "";
                    updateStatus();
                    render();
                    refreshPreview(true);
                    toast("Connected to GitHub.");
                  } catch (e) {
                    ghError = e.message;
                    render();
                  } finally {
                    busy(false);
                  }
                },
              })
            ),
        h(
          "div",
          { class: "card" },
          h("p", { class: "sec-note", text: "Login and GitHub access are set in Vercel → your project → Settings → Environment Variables:" }),
          h(
            "ul",
            { class: "steps" },
            h("li", {}, h("b", { text: "Change password: " }), "delete ADMIN_PASSWORD_HASH in Vercel and redeploy — this page then shows the setup wizard again. Everyone gets logged out."),
            h("li", {}, h("b", { text: "New GitHub token: " }), "replace GITHUB_TOKEN and redeploy."),
            h("li", {}, "Sessions last 12 hours.")
          ),
          h("button", { type: "button", class: "ghost danger", text: "Log out", onClick: logout })
        )
      );
    const form = { ...gh };
    const inp = (key, label, extra = {}) =>
      h("div", { class: "field" }, h("label", { for: "gh-" + key, text: label }), h("input", { id: "gh-" + key, value: form[key] || "", ...extra, onInput: (e) => (form[key] = e.target.value.trim()) }), extra.hintText ? h("p", { class: "hint", text: extra.hintText }) : null);
    return h(
      "div",
      {},
      connected() && ghOk
        ? h("div", { class: "okbox", text: `Connected to ${gh.owner}/${gh.repo} (${gh.branch || "main"}). Publish saves your changes there and Vercel updates the site.` })
        : h("div", { class: "warn", text: "Not connected yet. You can still edit and use Download, but uploads and Publish need GitHub." }),
      h(
        "div",
        { class: "card" },
        h("p", { class: "sec-note", text: "One-time setup:" }),
        h(
          "ol",
          { class: "steps" },
          h("li", {}, h("b", { text: "Put this website folder on GitHub" }), " (one repository, e.g. ", h("code", { text: "Devinhansaja/portfolio" }), ") and import that repository in Vercel."),
          h("li", {}, h("b", { text: "Create a token: " }), h("a", { href: "https://github.com/settings/personal-access-tokens/new", target: "_blank", rel: "noopener", text: "GitHub → Fine-grained token ↗" }), ". Repository access: ", h("b", { text: "Only select repositories" }), " → your portfolio repo. Permissions: ", h("b", { text: "Contents → Read and write" }), "."),
          h("li", {}, h("b", { text: "Fill in the form below" }), " and click Connect.")
        ),
        h("div", { class: "row2" }, inp("owner", "GitHub username", { placeholder: "Devinhansaja" }), inp("repo", "Repository name", { placeholder: "portfolio" })),
        h("div", { class: "row2" }, inp("branch", "Branch", { placeholder: "main" }), inp("dir", "Folder inside the repo", { placeholder: "(leave empty)", hintText: "Only if the site files are not at the top of the repo." })),
        inp("token", "Token", { type: "password", autocomplete: "off", placeholder: "github_pat_…" }),
        h("p", { class: "hint", text: "The token is saved only in this browser. Don't connect on a shared or public computer." }),
        h(
          "div",
          { class: "btns", style: "display:flex;gap:8px;margin-top:12px" },
          h("button", {
            type: "button", class: "primary", text: "Connect & load content",
            onClick: async () => {
              const prev = gh;
              gh = { owner: form.owner, repo: form.repo, branch: form.branch || "main", dir: form.dir || "", token: form.token };
              try {
                if (dirty && !confirm("Loading from GitHub replaces your unpublished edits here. Continue?")) {
                  gh = prev;
                  return;
                }
                busy(true, "Connecting to GitHub…");
                await api("");
                await loadFromGitHub();
                store.set(S_KEY, gh);
                pending.clear();
                dirty = false;
                store.del(DRAFT_KEY);
                updateStatus();
                render();
                refreshPreview(true);
                toast(`Connected to ${gh.owner}/${gh.repo}. Content loaded.`);
              } catch (e) {
                gh = prev;
                ghOk = false;
                toast(e.message, "error", 12000);
              } finally {
                busy(false);
              }
            },
          }),
          connected()
            ? h("button", {
                type: "button", class: "ghost danger", text: "Disconnect",
                onClick: () => { store.del(S_KEY); gh = { owner: "", repo: "", branch: "main", dir: "", token: "" }; ghOk = false; updateStatus(); render(); toast("Disconnected. The token was removed from this browser.", "info"); },
              })
            : null
        )
      )
    );
  }

  function updateStatus() {
    const st = $("#status");
    const on = connected() && ghOk;
    st.replaceChildren(
      ...[
        h("span", { class: "dot" + (on ? " on" : "") }),
        on
          ? `GitHub: ${gh.owner}/${gh.repo} (${gh.branch || "main"})`
          : mode === "server"
          ? `GitHub not connected — ${ghError ? ghError.replace(/^GitHub error /, "") : "open Publish settings"}`
          : "Not connected — open Publish settings",
        dirty ? h("span", { class: "dirty", text: `● Unpublished changes${pending.size ? ` · ${pending.size} new file(s)` : ""}` }) : null,
      ].filter(Boolean)
    );
    $("#btn-publish").disabled = !(on && dirty);
    $("#btn-publish").title = on
      ? "Save all changes to the live site"
      : mode === "server"
      ? "GitHub isn't connected — open Publish settings to see why"
      : "Connect GitHub in Publish settings first";
  }

  // ---------- Change tracking, draft, preview ----------
  let draftTimer;
  function changed() {
    dirty = true;
    updateStatus();
    refreshPreview();
    clearTimeout(draftTimer);
    draftTimer = setTimeout(() => store.set(DRAFT_KEY, { data, at: Date.now() }), 600);
    // keep nav counts fresh without a full re-render
    clearTimeout(changed.navTimer);
    changed.navTimer = setTimeout(renderNav, 300);
  }

  const pv = $("#pv");
  function previewData() {
    let json = JSON.stringify(data);
    for (const [p, f] of [...pending, ...published]) json = json.split(JSON.stringify(p)).join(JSON.stringify(f.url));
    return JSON.parse(json);
  }
  let pvTimer;
  function refreshPreview(now) {
    clearTimeout(pvTimer);
    pvTimer = setTimeout(() => {
      window.ADMIN_PREVIEW_DATA = previewData();
      let y = 0;
      try {
        y = pv.contentWindow.scrollY;
      } catch {}
      pv.onload = () => {
        try {
          pv.contentWindow.scrollTo({ top: y, behavior: "instant" });
        } catch {}
      };
      if (!pv.getAttribute("src")) pv.src = "index.html#admin-preview";
      else pv.contentWindow.location.reload();
    }, now ? 0 : 700);
  }
  function scrollPreview(anchor) {
    try {
      const doc = pv.contentDocument;
      const el = anchor === "#top" ? null : doc.querySelector(anchor);
      pv.contentWindow.scrollTo({ top: el ? el.getBoundingClientRect().top + pv.contentWindow.scrollY - 70 : 0, behavior: "smooth" });
    } catch {}
  }

  // ---------- Top bar buttons ----------
  $("#btn-publish").addEventListener("click", publish);
  $("#btn-download").addEventListener("click", download);
  $("#btn-preview").addEventListener("click", () => {
    const narrow = matchMedia("(max-width: 1100px)").matches;
    document.body.classList.toggle(narrow ? "show-preview" : "no-preview");
  });
  $("#pv-device").addEventListener("click", (e) => {
    const m = $("#pv-wrap").classList.toggle("mobile");
    e.target.textContent = m ? "Desktop" : "Mobile";
  });
  $("#pv-reload").addEventListener("click", () => refreshPreview(true));
  addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
      e.preventDefault();
      connected() && ghOk ? dirty && publish() : download();
    }
  });
  addEventListener("beforeunload", (e) => {
    if (dirty) {
      e.preventDefault();
      e.returnValue = "";
    }
  });

  // ---------- Login (live site) ----------
  async function logout() {
    if (dirty && !confirm("You have unpublished changes. Log out anyway?")) return;
    try {
      await fetch("/api/logout", { method: "POST", credentials: "same-origin" });
    } catch {}
    dirty = false;
    location.reload();
  }
  $("#btn-logout").addEventListener("click", logout);

  function showLogin() {
    $("#auth").hidden = false;
    $("#login-form").hidden = false;
    $("#setup").hidden = true;
    $("#l-email").focus();
  }
  $("#login-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const err = $("#l-error");
    err.textContent = "";
    $("#l-submit").disabled = true;
    try {
      const r = await fetch("/api/login", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: $("#l-email").value, password: $("#l-pass").value }),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j.error || `Login failed (${r.status}).`);
      $("#l-pass").value = "";
      await boot();
    } catch (ex) {
      err.textContent = ex.message;
      $("#l-pass").select();
    } finally {
      $("#l-submit").disabled = false;
    }
  });

  // ---------- First-time setup wizard (runs only in this browser; nothing is sent anywhere) ----------
  const toB64 = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf)));
  const rand = (n) => crypto.getRandomValues(new Uint8Array(n));
  async function hashPassword(pw) {
    const iter = 210000;
    const salt = rand(16);
    const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(pw), "PBKDF2", false, ["deriveBits"]);
    const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", salt, iterations: iter, hash: "SHA-256" }, key, 256);
    return `pbkdf2$${iter}$${toB64(salt)}$${toB64(bits)}`;
  }

  function showSetup(missingKeys) {
    $("#auth").hidden = false;
    $("#login-form").hidden = true;
    const box = $("#setup");
    box.hidden = false;
    $(".auth-card").classList.add("wide");
    const onlyGithub = missingKeys.every((k) => k.startsWith("GITHUB"));
    const f = (id, label, type = "text", extra = {}) =>
      h("div", { class: "field" }, h("label", { for: id, text: label }), h("input", { id, type, ...extra }));
    const err = h("p", { class: "auth-error", role: "alert" });
    const out = h("div");
    box.replaceChildren(
      ...[
        h("h1", { class: "auth-title", text: "Set up admin login" }),
        h("p", { class: "sec-note", text: `The login isn't set up on this site yet (missing in Vercel: ${missingKeys.join(", ")}). This wizard creates the values — everything happens in this browser and nothing is sent anywhere.` }),
        onlyGithub ? h("div", { class: "warn", text: "Only the GitHub settings are missing. Add GITHUB_TOKEN and GITHUB_REPO in Vercel (see step 2 below), then redeploy." }) : null,
        h("p", { class: "step-h" }, h("span", { text: "1" }), "Choose your login"),
        f("s-email", "Admin email", "email", { value: "devinhansaja100@gmail.com", autocomplete: "username" }),
        h("div", { class: "row2" }, f("s-pass", "Password (min 10 characters)", "password", { autocomplete: "new-password" }), f("s-pass2", "Repeat password", "password", { autocomplete: "new-password" })),
        f("s-repo", "GitHub repository (owner/name)", "text", { value: "Devinhansaja/portfolio_2026" }),
        err,
        h("button", {
          type: "button", class: "primary wide", text: "Create login values",
          onClick: async () => {
            err.textContent = "";
            const email = $("#s-email").value.trim(), pw = $("#s-pass").value, pw2 = $("#s-pass2").value, repo = $("#s-repo").value.trim();
            if (!/^\S+@\S+\.\S+$/.test(email)) return (err.textContent = "Enter a valid email.");
            if (pw.length < 10) return (err.textContent = "Use a password of at least 10 characters.");
            if (pw !== pw2) return (err.textContent = "The passwords don't match.");
            if (!/^[\w.-]+\/[\w.-]+$/.test(repo)) return (err.textContent = "Repository should look like owner/name.");
            busy(true, "Creating your login values…");
            try {
              renderEnvStep(out, { email, repo, hash: await hashPassword(pw), session: toB64(rand(32)) });
            } catch (ex) {
              err.textContent = "Couldn't create the values: " + ex.message;
            } finally {
              busy(false);
            }
          },
        }),
        out,
      ].filter(Boolean)
    );
  }

  function renderEnvStep(out, v) {
    const vars = [
      ["ADMIN_EMAIL", v.email],
      ["ADMIN_PASSWORD_HASH", v.hash],
      ["SESSION_SECRET", v.session],
      ["GITHUB_REPO", v.repo],
      ["GITHUB_BRANCH", "main"],
      ["GITHUB_TOKEN", "← paste your GitHub fine-grained token here"],
    ];
    const text = vars.map(([k, val]) => `${k}=${val}`).join("\n");
    out.replaceChildren(
      h("p", { class: "step-h" }, h("span", { text: "2" }), "Add these in Vercel"),
      h(
        "ol",
        { class: "steps" },
        h("li", {}, "Vercel → your project → ", h("b", { text: "Settings → Environment Variables" }), "."),
        h("li", {}, "Add each line below as a variable (name on the left of =, value on the right) and tick ", h("b", { text: "Production" }), ". Tip: Vercel lets you paste the whole block at once."),
        h("li", {}, "For ", h("b", { text: "GITHUB_TOKEN" }), " use a ", h("a", { href: "https://github.com/settings/personal-access-tokens/new", target: "_blank", rel: "noopener", text: "fine-grained token ↗" }), " with access to only this repo and ", h("b", { text: "Contents: Read and write" }), "."),
        h("li", {}, h("b", { text: "Save" }), ", then ", h("b", { text: "Deployments" }), " → ⋯ on the latest one → ", h("b", { text: "Redeploy" }), ". Reload this page and sign in with your email and password.")
      ),
      h("div", { class: "envbox", text }),
      h("div", { class: "warn", text: "These values are secret. Don't share them, post them, or commit them to GitHub. This page won't show them again after you reload." }),
      h("button", {
        type: "button", class: "primary wide", text: "Copy all",
        onClick: async (e) => {
          try {
            await navigator.clipboard.writeText(text);
            e.target.textContent = "Copied ✓";
          } catch {
            toast("Copy didn't work — select the text above and copy it by hand.", "error");
          }
        },
      })
    );
  }

  // ---------- Start ----------
  async function boot() {
    let r = null;
    try {
      r = await fetch("/api/session", { cache: "no-store", credentials: "same-origin" });
    } catch {}
    const isJson = r && (r.headers.get("content-type") || "").includes("application/json");
    if (r && isJson && r.status === 200) {
      const s = await r.json();
      mode = "server";
      gh = { owner: s.owner, repo: s.repo, branch: s.branch || "main", dir: s.dir || "", token: s.token }; // memory only
      $("#auth").hidden = true;
      $("#btn-logout").hidden = false;
      return startEditor();
    }
    if (r && isJson && r.status === 401) {
      mode = "server";
      return showLogin();
    }
    if (r && isJson && r.status === 503) {
      mode = "server";
      const s = await r.json();
      return showSetup(s.missing || []);
    }
    // no /api here (e.g. local test server): old manual-token mode
    mode = "local";
    return startEditor();
  }

  async function startEditor() {
    if (connected()) {
      try {
        busy(true, "Loading content from GitHub…");
        await loadFromGitHub();
      } catch (e) {
        ghOk = false;
        ghError = e.message;
        toast(`Could not load from GitHub — showing the site's current content. ${e.message}`, "error", 12000);
        if (mode === "server") current = "settings"; // open the page that explains the error
      } finally {
        busy(false);
      }
    }
    const draft = store.get(DRAFT_KEY);
    if (draft && draft.data && JSON.stringify(draft.data) !== JSON.stringify(data)) {
      const when = new Date(draft.at).toLocaleString();
      if (confirm(`You have unpublished edits from ${when}. Restore them?\n(Files you uploaded but didn't publish can't be restored.)`)) {
        data = draft.data;
        dirty = true;
      } else store.del(DRAFT_KEY);
    }
    updateStatus();
    render();
    refreshPreview(true);
  }

  boot();
})();

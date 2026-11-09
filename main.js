(() => {
  // Inside the admin panel's live preview, use the unsaved data from the admin page.
  const PREVIEW = (() => {
    try {
      return location.hash === "#admin-preview" && window.parent !== window ? window.parent.ADMIN_PREVIEW_DATA : null;
    } catch {
      return null;
    }
  })();
  const D = PREVIEW || PORTFOLIO;
  // Make sure every list exists, so an empty list in the admin panel never breaks the page.
  ["roles", "stats", "projects", "clients", "awards", "education", "skills", "tools", "process", "journey", "reels", "films", "editTools", "youtube", "pages", "compare", "photos", "photoshoots"].forEach(
    (k) => (D[k] = Array.isArray(D[k]) ? D[k] : [])
  );
  D.contact = D.contact || {};
  D.contact.socials = Array.isArray(D.contact.socials) ? D.contact.socials : [];
  D.roles.length || D.roles.push("");
  ["firstName", "lastName", "tagline", "location", "quote", "cvLink"].forEach((k) => (D[k] = D[k] || ""));
  ["email", "phone", "whatsapp"].forEach((k) => (D.contact[k] = D.contact[k] || ""));
  const app = document.getElementById("app");
  const layer = document.getElementById("cursor-layer");
  // The preview skips the intro animation so edits show straight away.
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches || !!PREVIEW;

  const esc = (s = "") =>
    String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const pad = (n) => String(n).padStart(2, "0");
  const fullName = D.fullName || `${D.firstName} ${D.lastName}`;
  const categories = D.categories || [...new Set(D.projects.map((p) => p.category))];

  // ---------- Cursor helpers ----------
  const CURSOR_NAMES = ["Design", "Code", "Ads", "Video", "UX", "SEO", "Motion", "Deploy"];
  const CURSOR_COLORS = ["#EF233C", "#DFE5EB", "#ff4a5f", "#DFE5EB", "#EF233C", "#ffffff", "#c81d33", "#DFE5EB"];
  const labelText = (hex) => (/^#(DFE5EB|ffffff)$/i.test(hex) ? "#111217" : "#fff");
  const ARROW =
    '<svg viewBox="0 0 24 24" width="22" height="22"><path d="M4 2.5l15 8.2-6.6 1.8-3 6.6z" fill="currentColor" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/></svg>';

  const CROSS =
    '<svg viewBox="0 0 24 24" width="24" height="24"><path d="M12 1v22M1 12h22" stroke="#000" stroke-width="4.5" stroke-linecap="round"/><path d="M12 1v22M1 12h22" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/></svg>';

  // type: "arrow" (pointer) or "cross" (crosshair used for drawing boxes)
  function makeCursor(i = Math.floor(Math.random() * 8), withLabel = true, type = "arrow", parent = layer) {
    const el = document.createElement("div");
    el.className = "gc" + (type === "cross" ? " cross" : "");
    el.style.color = CURSOR_COLORS[i % 8];
    el.innerHTML = (type === "cross" ? CROSS : ARROW) + (withLabel ? `<span style="background:${CURSOR_COLORS[i % 8]};color:${labelText(CURSOR_COLORS[i % 8])}">${CURSOR_NAMES[i % 8]}</span>` : "");
    parent.appendChild(el);
    return el;
  }
  // translate3d keeps cursor movement on the GPU so it stays at the screen's full frame rate
  const pos = (c, x, y) => (c.style.transform = `translate3d(${x}px, ${y}px, 0)`);
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const easeOut = (t) => 1 - Math.pow(1 - t, 3);
  const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  function tween(ms, fn, ease = easeOut) {
    return new Promise((res) => {
      const t0 = performance.now();
      const step = (now) => {
        const p = Math.min((now - t0) / ms, 1);
        fn(ease(p));
        p < 1 ? requestAnimationFrame(step) : res();
      };
      requestAnimationFrame(step);
    });
  }
  function edgePoint() {
    const w = innerWidth, h = innerHeight, side = Math.floor(Math.random() * 4);
    if (side === 0) return [Math.random() * w, -40];
    if (side === 1) return [w + 40, Math.random() * h];
    if (side === 2) return [Math.random() * w, h + 40];
    return [-40, Math.random() * h];
  }

  // ---------- Render ----------
  document.getElementById("logo").innerHTML = `${esc(D.firstName.toUpperCase())}<b>.</b>`;
  document.getElementById("nav-status").textContent = D.available ? "Available for work" : "Booked";
  document.title = `${fullName} | ${D.roles[0]}`;

  const portrait = D.photo
    ? `<img src="${esc(D.photo)}" alt="${esc(fullName)}" />`
    : `<svg viewBox="0 0 400 520" class="silhouette" role="img" aria-label="Photo placeholder">
        <defs>
          <linearGradient id="rim" x1="0" x2="1"><stop offset="0" stop-color="#EF233C"/><stop offset=".45" stop-color="#1d2027"/><stop offset="1" stop-color="#DFE5EB" stop-opacity=".3"/></linearGradient>
          <linearGradient id="fade" x1="0" y1="0" x2="0" y2="1"><stop offset=".7" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#111217"/></linearGradient>
        </defs>
        <path d="M166 220h68v100h-68z" fill="url(#rim)"/>
        <circle cx="200" cy="160" r="82" fill="url(#rim)"/>
        <path d="M10 520C14 380 80 300 200 296S386 380 390 520z" fill="url(#rim)"/>
        <rect width="400" height="520" fill="url(#fade)"/>
        <text x="200" y="470" text-anchor="middle" fill="#8a8a93" font-family="JetBrains Mono" font-size="14">your photo here</text>
      </svg>`;

  const projectCard = (p, i) => `
    <article class="card b" data-cat="${esc(p.category)}" style="--c:${esc(p.color || (i % 2 ? "#DFE5EB" : "#EF233C"))}">
      <div class="thumb">${p.image ? `<img src="${esc(p.image)}" alt="${esc(p.title)}" loading="lazy"${p.imagePos ? ` style="object-position:${esc(p.imagePos)}"` : ""}>` : mock(p)}
        ${
          p.embed
            ? `<div class="embed"><iframe src="${esc(p.embed)}" title="${esc(p.title)} — live preview" loading="lazy" tabindex="-1" aria-hidden="true" scrolling="no"></iframe></div>
               <button class="preview-btn" type="button" data-embed="${esc(p.embed)}" data-url="${esc(p.live || p.embed)}" data-title="${esc(p.title)}"><i></i>Live preview</button>`
            : ""
        }
        <span class="chip mono">${esc(p.category)}</span>
      </div>
      <div class="card-body">
        <div class="card-head">
          <span class="num">${pad(i + 1)}</span>
          <div>
            <h3>${esc(p.title)}</h3>
            <p class="mono meta">${esc(p.role)}${p.year ? ` · ${esc(p.year)}` : ""}</p>
          </div>
        </div>
        <p class="desc">${esc(p.description)}</p>
        <ul class="tags">${p.tags.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>
        <div class="links">
          ${p.live ? `<a href="${esc(p.live)}" target="_blank" rel="noopener">${esc(p.liveLabel || "Live demo")} ↗</a>` : ""}
          ${p.github ? `<a href="${esc(p.github)}" target="_blank" rel="noopener">GitHub ↗</a>` : ""}
        </div>
      </div>
    </article>`;

  // ---------- YouTube (long-form) ----------
  // Works with watch?v=, youtu.be/, /shorts/, /embed/ and playlist links
  function ytInfo(url) {
    try {
      const u = new URL(url);
      let id = u.searchParams.get("v") || "";
      if (!id && /youtu\.be$/.test(u.hostname)) id = u.pathname.slice(1);
      if (!id) id = (u.pathname.match(/\/(?:shorts|embed|live)\/([\w-]{6,})/) || [])[1] || "";
      return { id: id.replace(/[^\w-]/g, ""), list: (u.searchParams.get("list") || "").replace(/[^\w-]/g, "") };
    } catch {
      return { id: "", list: "" };
    }
  }
  // ---------- Landscape films (e.g. wedding films), played right in the card ----------
  const filmsBlock = () => `
    <div class="yt-head"><h3 class="b">Wedding <em>films</em></h3></div>
    <div class="film-grid">
      ${D.films
        .map(
          (f) => `<article class="film-card b">
        <video src="${esc(f.video)}" poster="${esc(f.poster)}" controls playsinline preload="none"></video>
        <div class="yt-body"><strong>${esc(f.title)}</strong><span class="mono">${esc([f.client, f.length].filter(Boolean).join(" · "))}</span></div>
      </article>`
        )
        .join("")}
    </div>`;

  // Facebook post link from a normal post link, an embed link or the whole <iframe> embed code
  function fbPostHref(u = "") {
    u = String(u).trim();
    const m = /plugins\/post\.php\?href=([^&"'\s]+)/.exec(u);
    if (m) return decodeURIComponent(m[1]);
    return /^https:\/\/(www\.|web\.|m\.)?facebook\.com\//.test(u) ? u : "";
  }

  // Photoshoots: each one is a frame whose photos change by themselves
  const shoots = D.photoshoots
    .map((s) => ({
      ...s,
      href: fbPostHref(s.url),
      photos: (Array.isArray(s.photos) ? s.photos : []).map((p) => (typeof p === "string" ? p : p && p.src)).filter(Boolean),
    }))
    .filter((s) => s.photos.length);

  // ---------- Logo strips (clients, editing tools): they keep moving from left to right ----------
  function clientStrip(items = D.clients) {
    const list = items
      .map((c) => (typeof c === "string" ? { name: c, logo: "" } : c || {}))
      .filter((c) => c.name || c.logo);
    if (!list.length) return "";
    // repeat short lists so the strip is always wider than the screen
    let half = [...list];
    while (half.length < 10) half = half.concat(list);
    const item = (c, hidden) => `<span class="client"${hidden ? ' aria-hidden="true"' : ""}>
        ${c.logo ? `<img src="${esc(c.logo)}" alt="${hidden ? "" : esc(c.name)}" loading="lazy" />` : `<i class="ini">${esc((c.name || "?").trim()[0])}</i>`}
        ${c.name ? `<span class="nm">${esc(c.name)}</span>` : ""}
      </span>`;
    return `<div class="logo-marquee b" style="--dur:${half.length * 4.5}s">
      <div class="logo-track">${half.map((c, i) => item(c, i >= list.length)).join("")}${half.map((c) => item(c, true)).join("")}</div>
    </div>`;
  }

  function youtubeBlock() {
    const vids = D.youtube.map((v) => ({ ...v, ...ytInfo(v.url) })).filter((v) => v.id || v.list);
    if (!vids.length) return "";
    const series = vids.find((v) => v.list);
    return `
    <div class="yt-head">
      <h3 class="b">Long-form on <em>YouTube</em></h3>
      ${series ? `<a class="yt-series b" href="https://www.youtube.com/playlist?list=${series.list}" target="_blank" rel="noopener">Full series ↗</a>` : ""}
    </div>
    <div class="yt-grid">
      ${vids
        .map(
          (v) => `<article class="yt-card b">
        <button class="yt-thumb" type="button" data-id="${v.id}" data-list="${v.list}" aria-label="Play ${esc(v.title)}">
          ${v.id ? `<img src="https://i.ytimg.com/vi/${v.id}/hqdefault.jpg" alt="" loading="lazy" />` : ""}
          <span class="yt-play" aria-hidden="true"><svg viewBox="0 0 68 48" width="62" height="44"><path d="M66.5 7.7a8.5 8.5 0 0 0-6-6C55.3.3 34 .3 34 .3S12.7.3 7.5 1.7a8.5 8.5 0 0 0-6 6C.2 12.9.2 24 .2 24s0 11.1 1.3 16.3a8.5 8.5 0 0 0 6 6c5.2 1.4 26.5 1.4 26.5 1.4s21.3 0 26.5-1.4a8.5 8.5 0 0 0 6-6c1.3-5.2 1.3-16.3 1.3-16.3s0-11.1-1.3-16.3z" fill="#f00"/><path d="M27 34l18-10-18-10z" fill="#fff"/></svg></span>
        </button>
        <div class="yt-body">
          <strong>${esc(v.title)}</strong>
          <span class="mono">${esc(v.channel || "")}</span>
          <a href="${esc(v.url)}" target="_blank" rel="noopener">Watch on YouTube ↗</a>
        </div>
      </article>`
        )
        .join("")}
    </div>`;
  }

  function mock(p) {
    const k =
      {
        Websites: "web", "Web Apps": "app", "Mobile Apps": "phone", Marketing: "chart",
        Video: "video", "Photo & Video": "video", "UI/UX": "phone", "Graphic Design": "poster",
      }[p.category] || "web";
    if (k === "poster")
      return `<div class="mock mock-poster"><div class="pst"><b></b><s></s><s></s><u></u></div><div class="pst"><u></u><b></b><s></s></div><div class="pst"><s></s><b></b><s></s><u></u></div></div>`;
    if (k === "web")
      return `<div class="mock mock-web"><div class="bar"><i></i><i></i><i></i></div><div class="hero-b"><b></b><s></s><s class="short"></s><em></em></div><div class="row"><u></u><u></u><u></u></div></div>`;
    if (k === "app")
      return `<div class="mock mock-app"><aside><i></i><i></i><i></i><i></i></aside><div class="main"><div class="kpis"><u></u><u></u><u></u></div><div class="bars">${[40, 65, 50, 80, 60, 95, 75].map((h) => `<i style="height:${h}%"></i>`).join("")}</div></div></div>`;
    if (k === "chart")
      return `<div class="mock mock-chart"><strong>${esc(p.metric || "+300%")}</strong><span class="mono">campaign result</span><svg viewBox="0 0 200 60" preserveAspectRatio="none"><path d="M0 55 L30 48 L60 50 L90 35 L120 38 L150 18 L200 4" fill="none" stroke="currentColor" stroke-width="3"/></svg></div>`;
    if (k === "video")
      return `<div class="mock mock-video"><div class="play">▶</div><div class="tl"><i></i></div></div>`;
    return `<div class="mock mock-phone"><div class="ph"><b></b><s></s><s></s><u></u></div><div class="ph"><u></u><s></s><s></s><b></b></div></div>`;
  }

  app.innerHTML = `
  <!-- HERO -->
  <section class="hero" id="top">
    <div class="hero-bg-word b" aria-hidden="true">PORTFOLIO</div>
    <div class="hero-left">
      <p class="mono kicker b">${esc(D.roles.join(" / "))}</p>
      <p class="hello b">Hello, I'm</p>
      <h1 class="b">${esc(D.firstName.toUpperCase())}<br/>${esc(D.lastName.toUpperCase())}<b>.</b></h1>
      <p class="hero-role b"><span id="role-rotator">${esc(D.roles[0])}</span></p>
      <p class="hero-tag b">${esc(D.tagline)}</p>
      <div class="hero-btns b">
        <a href="#reels" class="btn">Watch my work →</a>
        <a href="${esc(D.cvLink)}" class="btn ghost" download>Download CV</a>
      </div>
      <p class="mono loc b">📍 ${esc(D.location)}</p>
    </div>
    <div class="portrait b">${portrait}</div>
    <div class="hero-stats">
      ${D.stats
        .map(
          (s) => `<div class="stat b"><strong><span class="count" data-to="${s.value}">0</span>${esc(s.suffix)}</strong><span>${esc(s.label)}</span></div>`
        )
        .join("")}
    </div>
    <a href="#reels" class="scroll-hint mono b">scroll ↓</a>
  </section>

  <!-- MARQUEE -->
  <div class="marquee" aria-hidden="true"><div class="track">
    ${[...D.skills, ...D.skills].map((s) => `<span>${esc(s)}</span><i>✦</i>`).join("")}
  </div></div>

  <!-- REELS / VIDEO ADS -->
  ${D.reels.length || D.films.length || D.youtube.length ? `
  <section class="section reels-sec" id="reels">
    <div class="sec-head">
      <div>
        <p class="mono label b">Video editing</p>
        <h2 class="b">REELS THAT<br/><em>STOP THE SCROLL.</em></h2>
      </div>
      <p class="sec-note b">Short-form ads and promos I edited — motion graphics, AI visuals and Sinhala / English copy. Click any reel to watch it with sound.</p>
    </div>
    <div class="reels">
      ${D.reels
        .map(
          (r, i) => `<button class="reel b" type="button" data-i="${i}" aria-label="Play ${esc(r.title)}">
        <video src="${esc(r.video)}" poster="${esc(r.poster)}" muted loop playsinline preload="none" aria-hidden="true"${r.focus ? ` style="object-position:${esc(r.focus)}"` : ""}></video>
        <span class="reel-play" aria-hidden="true">▶</span>
        <span class="reel-info"><strong>${esc(r.title)}</strong><span class="mono">${esc(r.client)} · ${esc(r.length)}</span></span>
      </button>`
        )
        .join("")}
    </div>
    ${D.editTools.length ? `<div class="tools-block"><p class="mono tools-label b">Tools I edit with</p>${clientStrip(D.editTools)}</div>` : ""}
    ${D.films.length ? filmsBlock() : ""}
    ${D.youtube.length ? youtubeBlock() : ""}
  </section>` : ""}

  <!-- PHOTOGRAPHY -->
  ${D.photos.length ? `
  <section class="section photos-sec" id="photos">
    <div class="sec-head">
      <div>
        <p class="mono label b">Photography</p>
        <h2 class="b">MOMENTS,<br/><em>FRAMED.</em></h2>
      </div>
      <p class="sec-note b">Weddings, portraits, events and fashion — shot and edited for Focus Photography and clients. Click a photo to see it bigger.</p>
    </div>
    <div class="ph-grid">
      ${D.photos
        .map(
          (ph, i) => `<button class="photo-tile b" type="button" data-i="${i}" aria-label="Open photo${ph.caption ? ": " + esc(ph.caption) : ""}">
        <img src="${esc(ph.src)}" alt="${esc(ph.caption || "Photo")}" loading="lazy" />
        ${ph.caption || ph.category ? `<span class="ph-cap">${ph.category ? `<span class="mono">${esc(ph.category)}</span>` : ""}${esc(ph.caption || "")}</span>` : ""}
      </button>`
        )
        .join("")}
      ${D.photoLink ? `<a class="photo-more b" href="${esc(D.photoLink)}" target="_blank" rel="noopener"><strong>See more</strong><span>on Facebook ↗</span></a>` : ""}
    </div>
  </section>` : ""}

  <!-- PHOTOSHOOTS (Facebook posts) -->
  ${!D.photos.length && shoots.length ? `
  <section class="section shoots-sec" id="photos">
    <div class="sec-head">
      <div>
        <p class="mono label b">Photography</p>
        <h2 class="b">PHOTO<em>SHOOTS.</em></h2>
      </div>
      <div class="shoots-side">
        <p class="sec-note b">Shoots by Focus Photography — portraits, lifestyle and events. Click a frame to see every photo.</p>
        ${D.photoLink ? `<a class="shoots-link b" href="${esc(D.photoLink)}" target="_blank" rel="noopener">See all on Facebook ↗</a>` : ""}
      </div>
    </div>
    <div class="shoot-grid">
      ${shoots
        .map(
          (s, i) => `<article class="shoot b">
        <button class="shoot-frame" type="button" data-i="${i}" aria-label="See the ${esc(s.title)} photos">
          ${s.photos.map((p, j) => `<img src="${esc(p)}" alt="" loading="lazy"${j === 0 ? ' class="on"' : ""} />`).join("")}
          <span class="shoot-count mono">${s.photos.length} photos</span>
          ${s.photos.length > 1 ? `<span class="shoot-dots" aria-hidden="true">${s.photos.map((_, j) => `<i${j === 0 ? ' class="on"' : ""}></i>`).join("")}</span>` : ""}
        </button>
        <div class="shoot-info">
          <div><strong>${esc(s.title)}</strong>${s.category ? `<span class="mono">${esc(s.category)}</span>` : ""}</div>
          ${s.href ? `<a href="${esc(s.href)}" target="_blank" rel="noopener">Facebook ↗</a>` : ""}
        </div>
      </article>`
        )
        .join("")}
    </div>
  </section>` : ""}

  <!-- FACEBOOK PAGES I MANAGE -->
  ${D.pages && D.pages.length ? `
  <section class="section pages-sec" id="pages">
    <div class="sec-head">
      <div>
        <p class="mono label b">Social media</p>
        <h2 class="b">PAGES I<br/><em>GROW & MANAGE.</em></h2>
      </div>
      <p class="sec-note b">Facebook pages I run — content, creatives, campaigns and community. Click a page to see it on Facebook.</p>
    </div>
    <div class="fb-grid">
      ${D.pages
        .map(
          (p) => `<a class="fb-card b" href="${esc(p.url)}" target="_blank" rel="noopener">
        <div class="fb-cover"${p.logo ? ` style="--logo:url('${esc(p.logo)}')"` : ""}>
          <span class="fb-logo">${p.logo ? `<img src="${esc(p.logo)}" alt="${esc(p.name)} logo" loading="lazy" />` : `<i>${esc((p.name || "?").trim()[0])}</i>`}<b aria-hidden="true">f</b></span>
        </div>
        <div class="fb-foot"><div><strong>${esc(p.name)}</strong><span class="mono">Facebook page</span></div><span class="fb-open">Open page ↗</span></div>
      </a>`
        )
        .join("")}
    </div>
  </section>` : ""}

  <!-- WORK -->
  <section class="section" id="work">
    <div class="sec-head">
      <div>
        <p class="mono label b">Web & design</p>
        <h2 class="b">WEB &amp; <em>DESIGN.</em></h2>
      </div>
      <p class="sec-note b">Websites, apps and design work — the other side of what I do.</p>
    </div>
    <div class="filters b" role="tablist">
      <button class="active" data-f="all">All</button>
      ${categories.map((c) => `<button data-f="${esc(c)}">${esc(c)}</button>`).join("")}
    </div>
    <div class="grid">${D.projects.map(projectCard).join("")}</div>
  </section>

  <!-- CLIENTS -->
  ${D.clients.length ? `
  <section class="clients">
    <p class="mono label b">Been part of the bigger picture</p>
    ${clientStrip()}
  </section>` : ""}

  <!-- AWARDS (only shown when data.js has an "awards" list) -->
  ${D.awards && D.awards.length ? `
  <section class="section awards" id="awards">
    <div class="aw-left">
      <p class="mono label b">Achievements & memberships</p>
      <h2 class="b">MORE THAN<br/><em>JUST WORK.</em></h2>
      <div class="aw-count b">
        <svg viewBox="0 0 40 80" class="laurel"><path d="M30 75C8 60 4 30 18 6M18 20c-8-2-12-8-12-14 6 2 11 6 12 14zm-4 18c-8 0-13-5-14-11 7 0 12 4 14 11zm2 18c-7 2-13-1-16-6 7-2 13 0 16 6z" fill="currentColor"/></svg>
        <strong><span class="count" data-to="${D.awardsCount || D.awards.length}">0</span></strong>
        <svg viewBox="0 0 40 80" class="laurel flip"><path d="M30 75C8 60 4 30 18 6M18 20c-8-2-12-8-12-14 6 2 11 6 12 14zm-4 18c-8 0-13-5-14-11 7 0 12 4 14 11zm2 18c-7 2-13-1-16-6 7-2 13 0 16 6z" fill="currentColor"/></svg>
      </div>
      <p class="mono b">achievements & memberships</p>
    </div>
    <ol class="aw-list">
      ${D.awards
        .map(
          (a, i) => `<li class="b"><span class="mono idx">${pad(i + 1)}</span><div><h3>${esc(a.title)}</h3><p>${esc(a.org)}</p></div><span class="yr">${esc(a.badge || a.year)}</span></li>`
        )
        .join("")}
    </ol>
  </section>` : ""}

  <!-- BEFORE / AFTER (real sites: wireframe sketch vs live design) -->
  ${D.compare && D.compare.length ? `
  <section class="section compare-sec">
    <div class="sec-head">
      <div>
        <p class="mono label b">A look under the surface</p>
        <h2 class="b">FROM WIREFRAME.<br/><em>TO REAL.</em></h2>
      </div>
      <p class="sec-note b">Drag the handle — every site I design starts as a wireframe of boxes and lines, and ends as something people love to use.</p>
    </div>
    ${
      D.compare.length > 1
        ? `<div class="cmp-tabs b" role="tablist" aria-label="Choose a website">
      ${D.compare.map((c, i) => `<button type="button" role="tab" aria-selected="${i === 0}" data-i="${i}">${esc(c.name)}</button>`).join("")}
    </div>`
        : ""
    }
    <div class="compare b" id="compare" style="--pos:50%">
      <img class="cmp-layer final" src="${esc(D.compare[0].real)}" alt="${esc(D.compare[0].name)} — final website" />
      <div class="cmp-layer wire"><img src="${esc(D.compare[0].sketch)}" alt="${esc(D.compare[0].name)} — wireframe sketch" /></div>
      <div class="cmp-handle"><span>⟷</span></div>
      <span class="cmp-tag l mono">wireframe</span><span class="cmp-tag r mono">final</span>
      <input type="range" min="0" max="100" value="50" aria-label="Compare wireframe and final design" />
    </div>
    <p class="cmp-caption b"><span id="cmp-name">${esc(D.compare[0].name)}</span><a id="cmp-link" href="${esc(D.compare[0].url)}" target="_blank" rel="noopener">Visit site ↗</a></p>
  </section>` : ""}

  <!-- ABOUT -->
  <section class="section about" id="about">
    <p class="mono label b">Behind the work</p>
    <h2 class="b">NOT JUST EDITS.<br/>IT'S HOW I <em>TELL THE STORY.</em></h2>
    <div class="about-grid">
      <div class="col">
        ${
          D.education && D.education.length
            ? `<h4 class="mono b">Education</h4>
        ${D.education.map((e) => `<div class="edu b"><span class="mono">${esc(e.period)}</span><strong>${esc(e.title)}</strong><p>${esc(e.place)}</p></div>`).join("")}`
            : ""
        }
        <h4 class="mono b">Skills</h4>
        <ul class="tags big b">${D.skills.map((s) => `<li>${esc(s)}</li>`).join("")}</ul>
        <h4 class="mono b">Tools I use</h4>
        <ul class="tags b">${D.tools.map((s) => `<li>${esc(s)}</li>`).join("")}</ul>
      </div>
      <div class="col process">
        <h4 class="mono b">From idea to launch</h4>
        ${D.process.map((p, i) => `<div class="step b"><span class="n">${pad(i + 1)}</span><div><strong>${esc(p.title)}</strong><p>${esc(p.text)}</p></div></div>`).join("")}
      </div>
      <blockquote class="quote b">
        <span class="q">“</span>
        <p>${esc(D.quote)}</p>
        <cite>${esc(D.firstName)}</cite>
      </blockquote>
    </div>
  </section>

  <!-- JOURNEY -->
  <section class="section journey" id="journey">
    <div class="sec-head">
      <div>
        <p class="mono label b">The journey</p>
        <h2 class="b">KEEP MOVING.<br/><em>KEEP BUILDING.</em></h2>
      </div>
      <div class="wins b"><strong>LITTLE WINS.</strong><strong><em>BIG DREAMS.</em></strong></div>
    </div>
    <div class="timeline">
      ${D.journey
        .map(
          (j) => `<div class="tl-item b">
        <div class="tl-top">
          ${j.logo ? `<img class="tl-logo" src="${esc(j.logo)}" alt="${esc(j.company)} logo" loading="lazy" />` : ""}
          <div class="tl-title"><h3>${esc(j.role)}</h3><p class="mono co">${esc(j.company)}</p></div>
          <span class="mono when">${esc(j.period)}</span>
        </div>
        ${j.text ? `<p class="tl-text">${esc(j.text)}</p>` : ""}
      </div>`
        )
        .join("")}
    </div>
  </section>

  <!-- CONTACT -->
  <section class="section contact" id="contact">
    <div class="ct-left">
      <p class="mono label b">Your next project</p>
      <h2 class="b">LET'S WORK<br/><em>TOGETHER.</em></h2>
      <p class="sec-note b">Have an idea, a business to grow or a website to build? Tell me about it — I usually reply within 24 hours.</p>
    </div>
    <div class="ct-right">
      <ul class="ct-rows">
        <li class="b"><span class="mono">Email</span><a href="mailto:${esc(D.contact.email)}">${esc(D.contact.email)}</a></li>
        <li class="b"><span class="mono">Phone</span><a href="tel:${esc(D.contact.phone.replace(/\s/g, ""))}">${esc(D.contact.phone)}</a></li>
        <li class="b"><span class="mono">WhatsApp</span><a href="https://wa.me/${esc(D.contact.whatsapp)}" target="_blank" rel="noopener">Chat on WhatsApp ↗</a></li>
        <li class="b"><span class="mono">Location</span><span>${esc(D.location)}</span></li>
      </ul>
      <div class="socials b">${D.contact.socials.map((s) => `<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.name)}</a>`).join("")}</div>
    </div>
  </section>

  <footer class="foot">
    <span class="logo">${esc(D.firstName.toUpperCase())}<b>.</b></span>
    <span class="mono">© ${new Date().getFullYear()} ${esc(fullName)} — built by many little cursors.</span>
    <a href="#top" class="mono">back to top ↑</a>
  </footer>`;

  // Hide the menu link of a section that isn't shown
  if (!document.getElementById("photos")) document.querySelector('.nav-links a[href="#photos"]')?.remove();

  // Number the sections in the order they appear (01 / Video editing, 02 / Photography, ...)
  let secNo = 0;
  document.querySelectorAll(".section .label").forEach((l) => {
    if (l.closest(".sec-head, .aw-left, .about, .ct-left")) l.textContent = `${pad(++secNo)} / ${l.textContent.replace(/^\d+\s*\/\s*/, "")}`;
  });


  // ---------- Build engine: cursors arrive one after another; each builds ONE element, then leaves ----------
  // Each cursor's label says what it is doing (e.g. "Writing name", "Placing photo").
  const queue = [];
  let inFlight = 0, pumping = false;
  let idleWaiters = [];
  const isIdle = () => !queue.length && !inFlight;
  const whenIdle = () => (isIdle() ? Promise.resolve() : new Promise((r) => idleWaiters.push(r)));
  const checkIdle = () => isIdle() && idleWaiters.splice(0).forEach((r) => r());

  function enqueue(el) {
    if (el.dataset.q) return;
    el.dataset.q = "1";
    queue.push(el);
    if (!pumping) pump();
  }
  function pump() {
    pumping = queue.length > 0;
    if (!pumping) return checkIdle();
    // next = reading order: top to bottom, then left to right
    queue.sort((a, b) => {
      const ra = a.getBoundingClientRect(), rb = b.getBoundingClientRect();
      return Math.abs(ra.top - rb.top) > 12 ? ra.top - rb.top : ra.left - rb.left;
    });
    inFlight++;
    drawBuild(queue.shift()).finally(() => {
      inFlight--;
      checkIdle();
    });
    setTimeout(pump, 160); // the next cursor comes in a moment later
  }

  // What each cursor says it is doing
  const ACTIONS = [
    [".logo", "Adding logo"], [".nav-links", "Adding menu"], [".nav-cta", "Adding status"],
    [".kicker", "Writing roles"], [".hello", "Writing greeting"], [".hero h1", "Writing name"],
    [".hero-role", "Adding role"], [".hero-tag", "Writing intro"], [".hero-btns", "Adding buttons"],
    [".loc", "Adding location"], [".hero-bg-word", "Placing title"], [".portrait", "Placing photo"],
    [".stat", "Adding stat"], [".scroll-hint", "Adding scroll hint"], [".label", "Adding label"],
    ["h2", "Writing heading"], [".sec-note", "Writing text"], [".filters", "Adding filters"],
    [".card", "Adding project"], [".reel", "Adding reel"], [".yt-head h3", "Writing heading"],
    [".yt-series", "Adding link"], [".yt-card", "Embedding video"], [".fb-card", "Adding page"],
    [".tools-block .logo-marquee", "Adding tools"], [".logo-marquee", "Adding client logos"], [".tools-label", "Adding label"], [".shoot", "Placing photoshoot"], [".shoots-link", "Adding link"], [".film-card", "Placing film"], [".cmp-tabs", "Adding tabs"], [".compare", "Placing slider"],
    [".cmp-caption", "Adding link"], [".col h4", "Adding title"], [".edu", "Adding education"],
    [".tags", "Adding tags"], [".step", "Adding step"], [".quote", "Adding quote"],
    [".wins", "Writing tagline"], [".tl-item", "Adding experience"], [".ct-rows li", "Adding contact"],
    [".socials", "Adding socials"], [".aw-list li", "Adding award"],
    [".aw-count", "Adding counter"], [".marquee", "Adding banner"],
    [".photo-tile", "Placing photo"], [".photo-more", "Adding link"],
  ];
  const describe = (el) => (ACTIONS.find(([sel]) => el.matches(sel)) || [, "Building"])[1];

  // Elements that first appear as a grey placeholder box, then the real content fades in
  const MEDIA = ".portrait, .card, .compare, .hero-bg-word, .quote, .reel, .fb-card, .yt-card, .photo-tile, .film-card, .shoot";
  const drawLayer = document.getElementById("draw-layer");
  let colorIdx = 0;

  // A crosshair cursor glides in, presses at the top-left corner and drags the frame out to full size
  // (like drawing a frame in Figma). The content is revealed as the frame grows, then the cursor leaves.
  async function drawBuild(el) {
    if (el.classList.contains("built")) return; // already shown (e.g. intro skipped)
    const r = el.getBoundingClientRect();
    if (reduceMotion || r.width < 2 || r.bottom < -40 || r.top > innerHeight + 40 || r.left > innerWidth) return reveal(el);

    const fixed = !!el.closest(".nav");
    const host = fixed ? layer : drawLayer;
    const x0 = r.left + (fixed ? 0 : scrollX);
    const y0 = r.top + (fixed ? 0 : scrollY);
    const W = r.width, H = r.height;
    if (!fixed && (parseFloat(drawLayer.style.height) || 0) < y0 + H + 40)
      drawLayer.style.height = document.documentElement.scrollHeight + "px";
    const media = el.matches(MEDIA);

    // 1. cursor (labelled with its job) glides in to the start corner
    const c = makeCursor(colorIdx++ % 8, true, "cross", host);
    c.querySelector("span").textContent = describe(el);
    const sx = x0 - 70 - Math.random() * 160, sy = y0 - 50 - Math.random() * 110;
    pos(c, sx, sy);
    c.style.opacity = "0";
    await tween(220, (e) => {
      pos(c, sx + (x0 - sx) * e, sy + (y0 - sy) * e);
      c.style.opacity = String(Math.min(1, e * 2.5));
    });

    // 2. mouse down -> drag the frame to full size
    c.classList.add("down");
    const box = document.createElement("div");
    box.className = "dbox" + (media ? " fill" : "");
    box.innerHTML = "<i></i><i></i><i></i><i></i><b></b>";
    box.style.left = x0 + "px";
    box.style.top = y0 + "px";
    host.appendChild(box);
    const size = box.querySelector("b");
    el.classList.add(media ? "drawing-media" : "drawing");
    await tween(
      270 + Math.min(300, (W + H) / 4.5),
      (e) => {
        const w = W * e, h = H * e;
        box.style.width = w + "px";
        box.style.height = h + "px";
        size.textContent = `${Math.round(w)} × ${Math.round(h)}`;
        pos(c, x0 + w, y0 + h);
        if (!media) el.style.clipPath = `inset(0 ${W - w}px ${H - h}px 0)`;
      },
      easeInOut
    );

    // 3. release -> content appears, frame fades
    c.classList.remove("down");
    el.style.clipPath = "";
    el.classList.remove("drawing", "drawing-media");
    reveal(el);
    box.classList.add("done");
    setTimeout(() => box.remove(), 800);

    // 4. job done — the cursor drifts away and disappears
    const ex = x0 + W + 50 + Math.random() * 120, ey = y0 + H + 30 + Math.random() * 80;
    await wait(110);
    await tween(
      260,
      (e) => {
        pos(c, x0 + W + (ex - x0 - W) * e, y0 + H + (ey - y0 - H) * e);
        c.style.opacity = String(1 - e);
      },
      (t) => t * t
    );
    c.remove();
  }

  function reveal(el) {
    el.classList.add("built");
    el.querySelectorAll(".count").forEach(countUp);
    if (el.classList.contains("count")) countUp(el);
  }

  function countUp(el) {
    if (el.dataset.done) return;
    el.dataset.done = "1";
    const to = +el.dataset.to;
    if (reduceMotion) return (el.textContent = to);
    const t0 = performance.now();
    const step = (t) => {
      const p = Math.min((t - t0) / 1200, 1);
      el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  const io = new IntersectionObserver(
    (entries) =>
      entries.forEach((e) => {
        if (e.isIntersecting) {
          enqueue(e.target);
          io.unobserve(e.target);
        }
      }),
    { threshold: 0.15, rootMargin: "0px 0px -6% 0px" }
  );

  // ---------- Intro: cursors arrive, rulers + guides appear, then the hero gets drawn ----------
  const guides = document.getElementById("guides");
  const skipBtn = document.querySelector(".intro-skip");
  let started = false, skipped = false;
  const swarm = [];

  function startBuilding() {
    if (started) return;
    started = true;
    document.body.classList.add("ready");
    document.querySelectorAll(".b").forEach((el) => io.observe(el));
  }

  function endIntro() {
    document.body.classList.remove("designing");
    skipBtn.remove();
    setTimeout(() => (guides.innerHTML = ""), 700);
  }

  function drawGuides() {
    const xs = new Set(), ys = new Set();
    const rect = (s) => document.querySelector(s)?.getBoundingClientRect();
    const hl = rect(".hero-left"), pt = rect(".portrait"), h1 = rect(".hero h1"), nav = rect(".nav");
    if (hl) xs.add(Math.round(hl.left));
    if (pt && pt.width) { xs.add(Math.round(pt.left)); xs.add(Math.round(pt.right)); }
    if (nav) ys.add(Math.round(nav.bottom));
    if (h1) ys.add(Math.round(h1.top));
    if (pt && pt.width) ys.add(Math.round(pt.top));
    let d = 0;
    xs.forEach((x) => guides.insertAdjacentHTML("beforeend", `<i class="gv" style="left:${x}px;animation-delay:${(d += 60)}ms"></i>`));
    ys.forEach((y) => guides.insertAdjacentHTML("beforeend", `<i class="gh" style="top:${y}px;animation-delay:${(d += 60)}ms"></i>`));
  }

  async function runIntro() {
    document.body.classList.add("designing");
    const SETUP_JOBS = ["Opening timeline", "Colour grading", "Picking music", "Adding captions", "Syncing the cut"];
    for (let i = 0; i < 14; i++) {
      const c = makeCursor(i, i % 3 === 0, i % 4 === 0 ? "arrow" : "cross");
      const lab = c.querySelector("span");
      if (lab) lab.textContent = SETUP_JOBS[(i / 3) % SETUP_JOBS.length | 0];
      const [x, y] = edgePoint();
      pos(c, x, y);
      swarm.push(c);
    }
    const scatter = (t) =>
      swarm.forEach((c) => {
        c.style.transition = `transform ${t + Math.random() * 0.4}s cubic-bezier(.3,.7,.3,1)`;
        pos(c, innerWidth * (0.08 + Math.random() * 0.84), innerHeight * (0.12 + Math.random() * 0.76));
      });
    await wait(40);
    scatter(0.65);
    await wait(650);
    if (skipped) return;
    document.body.classList.add("rulers");
    drawGuides();
    scatter(0.5);
    await wait(600);
    if (skipped) return;
    leaveSwarm();
    startBuilding();
    await wait(300); // let the first elements reach the queue
    await Promise.race([whenIdle(), wait(15000)]);
    if (!skipped) endIntro();
  }

  // ---------- Loading screen: words blur in, camera zooms, a hand clicks, then "You found him|" ----------
  async function runLoader() {
    const el = document.getElementById("loader");
    if (!el) return;
    const L = D.loader || {};
    if (L.enabled === false || reduceMotion) return el.remove();

    const stage = el.querySelector(".ld-stage");
    const line = el.querySelector(".ld-line");
    const hand = el.querySelector(".ld-hand");
    el.querySelector(".ld-handle .mono").textContent = L.handle || "";
    if (!L.handle) el.querySelector(".ld-handle").remove();

    let skip = false;
    const doSkip = () => (skip = true);
    el.querySelector(".ld-skip").addEventListener("click", doSkip);
    const onKey = (e) => ["Escape", "Enter", " "].includes(e.key) && doSkip();
    addEventListener("keydown", onKey);
    // waits that end early when the visitor skips
    const sleep = async (ms) => {
      const end = performance.now() + ms;
      while (!skip && performance.now() < end) await wait(Math.min(40, end - performance.now()));
    };

    const words = (text) => {
      line.replaceChildren(...String(text).trim().split(/\s+/).map((w) => Object.assign(document.createElement("span"), { className: "w", textContent: w })));
      return [...line.children];
    };
    // camera move: scale the stage and pull the focus word toward the centre, with a touch of motion blur
    let cur = "translate3d(0,0,0) scale(1)";
    const zoom = async (scale, focus, dur, pull = 0.75) => {
      let dx = 0, dy = 0;
      if (focus) {
        const cx = stage.offsetWidth / 2, cy = stage.offsetHeight / 2;
        dx = -(focus.offsetLeft + focus.offsetWidth / 2 - cx) * scale * pull;
        dy = -(focus.offsetTop + focus.offsetHeight / 2 - cy) * scale * pull;
      }
      const to = `translate3d(${dx}px, ${dy}px, 0) scale(${scale})`;
      if (!dur) {
        stage.style.transform = cur = to;
        return;
      }
      const a = stage.animate(
        [{ transform: cur, filter: "blur(0px)" }, { filter: "blur(2.5px)", offset: 0.5 }, { transform: to, filter: "blur(0px)" }],
        { duration: dur, easing: "cubic-bezier(.7,0,.2,1)", fill: "forwards" }
      );
      await a.finished.catch(() => {});
      stage.style.transform = cur = to;
      a.cancel();
    };
    const moveHand = (x, y, dur, ease = "cubic-bezier(.2,.8,.2,1)") => {
      const from = hand.style.transform || `translate3d(${innerWidth * 0.8}px, ${innerHeight * 1.05}px, 0)`;
      const to = `translate3d(${x}px, ${y}px, 0)`;
      hand.style.opacity = 1;
      const a = hand.animate([{ transform: from }, { transform: to }], { duration: dur, easing: ease, fill: "forwards" });
      return a.finished.catch(() => {}).then(() => {
        hand.style.transform = to;
        a.cancel();
      });
    };

    el.classList.add("on");
    await Promise.race([document.fonts ? document.fonts.ready : null, wait(900)]);
    await sleep(380);

    // 1) "Tired of generic websites?" — word by word, zoom to the last word, hand clicks it
    const w1 = words(L.line1 || "Tired of generic websites?");
    for (const w of w1) {
      if (skip) break;
      w.classList.add("in");
      await sleep(230);
    }
    const target = w1[w1.length - 1];
    if (!skip) await zoom(2.3, target, 620);
    if (!skip) {
      const r = target.getBoundingClientRect();
      await moveHand(r.left + r.width * 0.55, r.top + r.height * 0.6, 520);
      hand.classList.add("press");
      target.classList.add("hit");
      await sleep(200);
      hand.classList.remove("press");
      await sleep(180);
    }

    // 2) second line appears small, the hand leaves, the camera pushes in
    if (!skip && L.line2 !== "") {
      await zoom(1, null, 0);
      const w2 = words(L.line2 || "Looking for a developer who designs?");
      moveHand(innerWidth * 0.15, innerHeight * 1.1, 520, "cubic-bezier(.5,0,.75,0)");
      for (const w of w2) {
        if (skip) break;
        w.classList.add("in");
        await sleep(45);
      }
      await sleep(380);
      if (!skip) await zoom(1.7, w2[Math.floor(w2.length / 2)], 900, 0.3);
    }

    // 3) typewriter, big, then the camera pulls back
    if (!skip) {
      hand.style.opacity = 0;
      await zoom(1.9, null, 0);
      const text = L.line3 || "You found him.";
      const span = document.createElement("span");
      const caret = Object.assign(document.createElement("i"), { className: "ld-caret" });
      line.replaceChildren(span, caret);
      for (let i = 1; i <= text.length && !skip; i++) {
        span.textContent = text.slice(0, i);
        await sleep(text[i - 1] === " " ? 40 : 75);
      }
      await sleep(420);
      if (!skip) await zoom(1, null, 650);
      await sleep(250);
    }

    removeEventListener("keydown", onKey);
    el.classList.add("done");
    setTimeout(() => el.remove(), 700);
  }

  function leaveSwarm() {
    swarm.splice(0).forEach((c) => {
      const [ex, ey] = edgePoint();
      c.style.transition = "transform .6s cubic-bezier(.5,0,.75,0), opacity .6s";
      pos(c, ex, ey);
      c.style.opacity = 0;
      setTimeout(() => c.remove(), 650);
    });
  }

  skipBtn.addEventListener("click", () => {
    skipped = true;
    leaveSwarm();
    document.querySelectorAll(".b").forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.top < innerHeight) {
        el.dataset.q = "1";
        reveal(el);
      }
    });
    startBuilding();
    endIntro();
  });

  // ---------- Smooth scrolling (Lenis) ----------
  let lenis = null;
  if (!reduceMotion && typeof Lenis === "function") {
    lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 1, smoothWheel: true });
    const raf = (t) => {
      lenis.raf(t);
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
    lenis.stop(); // stays locked until the intro hands over
    // in-page links glide instead of jumping
    document.addEventListener("click", (e) => {
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;
      const id = a.getAttribute("href");
      const target = id === "#top" ? 0 : id.length > 1 && document.querySelector(id);
      if (target === false || target === null) return;
      e.preventDefault();
      lenis.scrollTo(target, { offset: target === 0 ? 0 : -64, duration: 1.4 });
    });
  }
  const lockScroll = (on) => lenis && (on ? lenis.stop() : lenis.start());
  // pause smooth scrolling while a popup (website viewer / video player) is open
  document.querySelectorAll("dialog").forEach((d) => {
    d.setAttribute("data-lenis-prevent", "");
    d.addEventListener("close", () => lockScroll(false));
    new MutationObserver(() => d.open && lockScroll(true)).observe(d, { attributes: true, attributeFilter: ["open"] });
  });
  const _startBuilding = startBuilding;
  startBuilding = () => {
    _startBuilding();
    lockScroll(false);
  };

  if (reduceMotion) {
    document.getElementById("loader")?.remove();
    document.querySelectorAll(".b").forEach((el) => reveal(el));
    skipBtn.remove();
    startBuilding();
  } else {
    runLoader().then(runIntro);
  }


  // ---------- Role rotator ----------
  const rot = document.getElementById("role-rotator");
  let ri = 0;
  if (D.roles.length > 1 && !reduceMotion)
    setInterval(() => {
      rot.classList.add("out");
      setTimeout(() => {
        ri = (ri + 1) % D.roles.length;
        rot.textContent = D.roles[ri];
        rot.classList.remove("out");
      }, 300);
    }, 2600);

  // ---------- Filters ----------
  const btns = document.querySelectorAll(".filters button");
  btns.forEach((b) =>
    b.addEventListener("click", () => {
      btns.forEach((x) => x.classList.toggle("active", x === b));
      const f = b.dataset.f;
      document.querySelectorAll(".card").forEach((card) => {
        const show = f === "all" || card.dataset.cat === f;
        card.hidden = !show;
        if (show) {
          card.classList.remove("built");
          delete card.dataset.q;
          requestAnimationFrame(() => enqueue(card));
        }
      });
    })
  );

  // ---------- Live website previews ----------
  // Each card shows the real site in a scaled-down iframe (rendered at 1280px wide).
  const EMBED_W = 1280;
  const ro = new ResizeObserver((entries) =>
    entries.forEach((e) => e.target.style.setProperty("--s", e.contentRect.width / EMBED_W))
  );
  document.querySelectorAll(".embed").forEach((el) => ro.observe(el));

  // Clicking "Live preview" opens the site full-size in a browser-style window.
  const viewer = document.getElementById("viewer");
  const vFrame = viewer.querySelector("iframe");
  const openViewer = (btn) => {
    vFrame.src = btn.dataset.embed;
    vFrame.title = btn.dataset.title + " — live site";
    viewer.querySelector(".v-url").textContent = btn.dataset.url.replace(/^https?:\/\//, "").replace(/\/$/, "");
    viewer.querySelector(".v-open").href = btn.dataset.url;
    viewer.showModal();
  };
  document.querySelectorAll(".preview-btn").forEach((b) => b.addEventListener("click", () => openViewer(b)));
  document.querySelectorAll(".embed").forEach((el) =>
    el.addEventListener("click", () => openViewer(el.parentElement.querySelector(".preview-btn")))
  );
  viewer.querySelector(".v-close").addEventListener("click", () => viewer.close());
  viewer.addEventListener("click", (e) => e.target === viewer && viewer.close());
  viewer.addEventListener("close", () => (vFrame.src = "about:blank"));

  // ---------- Reels: hover preview + full player ----------
  const reelViewer = document.getElementById("reel-viewer");
  if (D.reels && D.reels.length) {
    const rv = reelViewer.querySelector("video");
    let cur = 0;
    const show = (i) => {
      cur = (i + D.reels.length) % D.reels.length;
      const r = D.reels[cur];
      rv.poster = r.poster;
      rv.src = r.video;
      reelViewer.classList.toggle("wide", !!r.wide); // landscape videos play full width
      reelViewer.querySelector(".rv-title").textContent = r.title;
      reelViewer.querySelector(".rv-count").textContent = `${cur + 1} / ${D.reels.length}`;
      rv.play().catch(() => {});
    };
    // Autoplay (muted, looping) while a reel is on screen; pause when it scrolls away
    const visible = new Set();
    const playCard = (el) =>
      el.querySelector("video").play().then(() => el.classList.add("playing")).catch(() => {});
    const pauseCard = (el) => {
      el.querySelector("video").pause();
      el.classList.remove("playing");
    };
    const reelIO = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            visible.add(e.target);
            if (!reelViewer.open) playCard(e.target);
          } else {
            visible.delete(e.target);
            pauseCard(e.target);
          }
        }),
      { threshold: 0.35 }
    );
    document.querySelectorAll(".reel").forEach((el) => {
      if (!reduceMotion) reelIO.observe(el);
      el.addEventListener("click", () => {
        document.querySelectorAll(".reel").forEach(pauseCard);
        show(+el.dataset.i);
        reelViewer.showModal();
      });
    });
    reelViewer.querySelector(".rv-prev").addEventListener("click", () => show(cur - 1));
    reelViewer.querySelector(".rv-next").addEventListener("click", () => show(cur + 1));
    reelViewer.querySelector(".rv-close").addEventListener("click", () => reelViewer.close());
    reelViewer.addEventListener("click", (e) => e.target === reelViewer && reelViewer.close());
    reelViewer.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") show(cur - 1);
      if (e.key === "ArrowRight") show(cur + 1);
    });
    reelViewer.addEventListener("close", () => {
      rv.pause();
      rv.removeAttribute("src");
      rv.load();
      visible.forEach(playCard); // resume the on-screen previews
    });
  }

  // ---------- Photo lightbox (gallery and photoshoots) ----------
  const phViewer = document.getElementById("photo-viewer");
  let pvList = [], pi = 0;
  const pvImg = phViewer.querySelector("img");
  function showPhoto(i) {
    pi = (i + pvList.length) % pvList.length;
    const ph = pvList[pi];
    pvImg.src = ph.src;
    pvImg.alt = ph.caption || "Photo";
    phViewer.querySelector(".pv-cap").textContent = ph.caption || "";
    phViewer.querySelector(".pv-count").textContent = `${pi + 1} / ${pvList.length}`;
  }
  function openPhotos(list, i = 0) {
    pvList = list;
    showPhoto(i);
    phViewer.showModal();
  }
  phViewer.querySelector(".pv-prev").addEventListener("click", () => showPhoto(pi - 1));
  phViewer.querySelector(".pv-next").addEventListener("click", () => showPhoto(pi + 1));
  phViewer.querySelector(".pv-close").addEventListener("click", () => phViewer.close());
  phViewer.addEventListener("click", (e) => e.target === phViewer && phViewer.close());
  phViewer.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") showPhoto(pi - 1);
    if (e.key === "ArrowRight") showPhoto(pi + 1);
  });
  document.querySelectorAll(".photo-tile").forEach((b) =>
    b.addEventListener("click", () =>
      openPhotos(D.photos.map((ph) => ({ src: ph.src, caption: [ph.category, ph.caption].filter(Boolean).join(" — ") })), +b.dataset.i)
    )
  );

  // ---------- Photoshoots: each frame changes its photo every few seconds ----------
  const frames = [...document.querySelectorAll(".shoot-frame")];
  frames.forEach((f, n) => {
    const s = shoots[+f.dataset.i];
    const imgs = [...f.querySelectorAll("img")];
    const dots = [...f.querySelectorAll(".shoot-dots i")];
    let cur = 0, onScreen = false, hover = false;
    const go = (k) => {
      imgs[cur].classList.remove("on");
      dots[cur] && dots[cur].classList.remove("on");
      cur = (k + imgs.length) % imgs.length;
      imgs[cur].classList.add("on");
      dots[cur] && dots[cur].classList.add("on");
    };
    if (imgs.length > 1 && !reduceMotion) {
      // frames start at different moments so they don't all change together
      setTimeout(() => setInterval(() => onScreen && !hover && !document.hidden && go(cur + 1), 5500), n * 1100);
      new IntersectionObserver(([e]) => (onScreen = e.isIntersecting), { threshold: 0.2 }).observe(f);
      f.addEventListener("pointerenter", () => (hover = true));
      f.addEventListener("pointerleave", () => (hover = false));
    }
    f.addEventListener("click", () =>
      openPhotos(s.photos.map((src, j) => ({ src, caption: `${s.title}${s.category ? " — " + s.category : ""}` })), cur)
    );
  });

  // ---------- Films: only one plays at a time ----------
  document.querySelectorAll(".film-card video").forEach((v) =>
    v.addEventListener("play", () =>
      document.querySelectorAll(".film-card video").forEach((o) => o !== v && o.pause())
    )
  );

  // ---------- YouTube: load the player only when the visitor clicks ----------
  document.querySelectorAll(".yt-thumb").forEach((b) =>
    b.addEventListener("click", () => {
      const { id, list } = b.dataset;
      const f = document.createElement("iframe");
      f.className = "yt-frame";
      f.src = id
        ? `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0${list ? `&list=${list}` : ""}`
        : `https://www.youtube-nocookie.com/embed/videoseries?list=${list}&autoplay=1&rel=0`;
      f.title = b.getAttribute("aria-label").replace(/^Play /, "");
      f.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
      f.allowFullscreen = true;
      f.referrerPolicy = "strict-origin-when-cross-origin";
      b.replaceWith(f);
      // stop the muted reel previews while a YouTube video plays
      document.querySelectorAll(".reel video").forEach((v) => v.pause());
    })
  );

  // ---------- Before / after compare ----------
  const cmp = document.getElementById("compare");
  if (cmp) {
    const range = cmp.querySelector("input");
    const setPos = (v) => {
      range.value = v;
      cmp.style.setProperty("--pos", v + "%");
    };
    range.addEventListener("input", () => setPos(range.value));

    // Little sweep so visitors see it can be dragged
    const sweep = () =>
      !reduceMotion &&
      tween(1400, (e) => setPos(50 + Math.sin(e * Math.PI * 2) * 30), easeInOut).then(() => setPos(50));
    new IntersectionObserver((en, o) => {
      if (en[0].isIntersecting) {
        o.disconnect();
        setTimeout(sweep, 900);
      }
    }, { threshold: 0.6 }).observe(cmp);

    // Tabs switch which website is shown
    const finalImg = cmp.querySelector(".final");
    const wireImg = cmp.querySelector(".wire img");
    const tabs = document.querySelectorAll(".cmp-tabs button");
    tabs.forEach((t) =>
      t.addEventListener("click", () => {
        const c = D.compare[+t.dataset.i];
        tabs.forEach((x) => x.setAttribute("aria-selected", x === t));
        cmp.classList.add("swap");
        setTimeout(() => {
          finalImg.src = c.real;
          finalImg.alt = `${c.name} — final website`;
          wireImg.src = c.sketch;
          wireImg.alt = `${c.name} — wireframe sketch`;
          document.getElementById("cmp-name").textContent = c.name;
          document.getElementById("cmp-link").href = c.url;
          cmp.classList.remove("swap");
          sweep();
        }, 250);
      })
    );
  }

  // ---------- Hero spotlight follows the mouse ----------
  const hero = document.querySelector(".hero");
  hero.addEventListener("pointermove", (e) => {
    const r = hero.getBoundingClientRect();
    hero.style.setProperty("--mx", e.clientX - r.left + "px");
    hero.style.setProperty("--my", e.clientY - r.top + "px");
  });
})();

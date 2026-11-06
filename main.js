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
  ["roles", "stats", "projects", "clients", "awards", "education", "skills", "tools", "process", "journey", "reels", "pages", "compare"].forEach(
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
  const CURSOR_COLORS = ["#1558C9", "#D4FF24", "#2a6ee6", "#D4FF24", "#1558C9", "#e9ffa0", "#2a6ee6", "#D4FF24"];
  const labelText = (hex) => (/^#(D4FF24|e9ffa0)$/i.test(hex) ? "#030407" : "#fff");
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
  const pos = (c, x, y) => (c.style.transform = `translate(${x}px, ${y}px)`);
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
          <linearGradient id="rim" x1="0" x2="1"><stop offset="0" stop-color="#1558C9"/><stop offset=".45" stop-color="#0c1220"/><stop offset="1" stop-color="#D4FF24" stop-opacity=".3"/></linearGradient>
          <linearGradient id="fade" x1="0" y1="0" x2="0" y2="1"><stop offset=".7" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#030407"/></linearGradient>
        </defs>
        <path d="M166 220h68v100h-68z" fill="url(#rim)"/>
        <circle cx="200" cy="160" r="82" fill="url(#rim)"/>
        <path d="M10 520C14 380 80 300 200 296S386 380 390 520z" fill="url(#rim)"/>
        <rect width="400" height="520" fill="url(#fade)"/>
        <text x="200" y="470" text-anchor="middle" fill="#8a8a93" font-family="JetBrains Mono" font-size="14">your photo here</text>
      </svg>`;

  const projectCard = (p, i) => `
    <article class="card b" data-cat="${esc(p.category)}" style="--c:${esc(p.color || (i % 2 ? "#D4FF24" : "#1558C9"))}">
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
        <a href="#work" class="btn">View my work →</a>
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
  ${D.reels && D.reels.length ? `
  <section class="section reels-sec" id="reels">
    <div class="sec-head">
      <div>
        <p class="mono label b">01 / Video & ads</p>
        <h2 class="b">REELS THAT<br/><em>STOP THE SCROLL.</em></h2>
      </div>
      <p class="sec-note b">Short-form ads and promos I edited — motion graphics, AI visuals and Sinhala / English copy. Click any reel to watch it with sound.</p>
    </div>
    <div class="reels">
      ${D.reels
        .map(
          (r, i) => `<button class="reel b" type="button" data-i="${i}" aria-label="Play ${esc(r.title)}">
        <video src="${esc(r.video)}" poster="${esc(r.poster)}" muted loop playsinline preload="none" aria-hidden="true"></video>
        <span class="reel-play" aria-hidden="true">▶</span>
        <span class="reel-info"><strong>${esc(r.title)}</strong><span class="mono">${esc(r.client)} · ${esc(r.length)}</span></span>
      </button>`
        )
        .join("")}
    </div>
  </section>` : ""}

  <!-- WORK -->
  <section class="section" id="work">
    <div class="sec-head">
      <div>
        <p class="mono label b">02 / Selected work</p>
        <h2 class="b">WORK THAT <em>SPEAKS.</em></h2>
      </div>
      <p class="sec-note b">A few projects I'm proud of — from code and campaigns to brand design, photo and video.</p>
    </div>
    <div class="filters b" role="tablist">
      <button class="active" data-f="all">All</button>
      ${categories.map((c) => `<button data-f="${esc(c)}">${esc(c)}</button>`).join("")}
    </div>
    <div class="grid">${D.projects.map(projectCard).join("")}</div>
  </section>

  <!-- FACEBOOK PAGES I MANAGE -->
  ${D.pages && D.pages.length ? `
  <section class="section pages-sec" id="pages">
    <div class="sec-head">
      <div>
        <p class="mono label b">03 / Social media</p>
        <h2 class="b">PAGES I<br/><em>GROW & MANAGE.</em></h2>
      </div>
      <p class="sec-note b">Facebook pages I run — content, creatives, campaigns and community. Live previews, straight from Facebook.</p>
    </div>
    <div class="fb-grid">
      ${D.pages
        .map(
          (p) => `<article class="fb-card b">
        <div class="fb-frame">
          <div class="fb-fallback" aria-hidden="true"><span>f</span><strong>${esc(p.name)}</strong></div>
          <iframe src="https://www.facebook.com/plugins/page.php?href=${encodeURIComponent(p.url)}&tabs=&width=500&height=230&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=true"
            title="${esc(p.name)} on Facebook" loading="lazy" scrolling="no" allow="encrypted-media; clipboard-write"
            onload="this.parentElement.classList.add('loaded')"></iframe>
        </div>
        <div class="fb-foot"><strong>${esc(p.name)}</strong><a href="${esc(p.url)}" target="_blank" rel="noopener">Open page ↗</a></div>
      </article>`
        )
        .join("")}
    </div>
  </section>` : ""}

  <!-- CLIENTS -->
  <section class="clients">
    <p class="mono label b">Been part of the bigger picture</p>
    <div class="logos">${D.clients.map((c) => `<span class="b">${esc(c)}</span>`).join("")}</div>
  </section>

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
        <p class="mono label b">04 / A look under the surface</p>
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
    <p class="mono label b">05 / Behind the code</p>
    <h2 class="b">NOT JUST CODE.<br/>IT'S HOW I <em>TELL THE STORY.</em></h2>
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
        <h4 class="mono b">Tech stack & tools</h4>
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
        <p class="mono label b">06 / The journey</p>
        <h2 class="b">KEEP MOVING.<br/><em>KEEP BUILDING.</em></h2>
      </div>
      <div class="wins b"><strong>LITTLE WINS.</strong><strong><em>BIG DREAMS.</em></strong></div>
    </div>
    <div class="timeline">
      ${D.journey
        .map(
          (j) => `<div class="tl-item b"><span class="mono when">${esc(j.period)}</span><div><h3>${esc(j.role)}</h3><p class="mono co">${esc(j.company)}</p><p>${esc(j.text)}</p></div></div>`
        )
        .join("")}
    </div>
  </section>

  <!-- CONTACT -->
  <section class="section contact" id="contact">
    <div class="ct-left">
      <p class="mono label b">07 / Your next project</p>
      <h2 class="b">LET'S WORK<br/><em>TOGETHER.</em></h2>
      <p class="sec-note b">Have an idea, a business to grow or a website to build? Tell me about it — I usually reply within 24 hours.</p>
      <ul class="ct-rows">
        <li class="b"><span class="mono">Email</span><a href="mailto:${esc(D.contact.email)}">${esc(D.contact.email)}</a></li>
        <li class="b"><span class="mono">Phone</span><a href="tel:${esc(D.contact.phone.replace(/\s/g, ""))}">${esc(D.contact.phone)}</a></li>
        <li class="b"><span class="mono">WhatsApp</span><a href="https://wa.me/${esc(D.contact.whatsapp)}" target="_blank" rel="noopener">Chat on WhatsApp ↗</a></li>
        <li class="b"><span class="mono">Location</span><span>${esc(D.location)}</span></li>
      </ul>
      <div class="socials b">${D.contact.socials.map((s) => `<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.name)}</a>`).join("")}</div>
    </div>
    <form class="ct-form b" id="ct-form">
      <div class="feel"><strong>MAKE IT</strong><strong><em>FEEL REAL.</em></strong></div>
      <label>Name<input name="name" required autocomplete="name" /></label>
      <label>Email<input name="email" type="email" required autocomplete="email" /></label>
      <label>Project type
        <select name="type"><option>Website / Web App</option><option>Mobile App</option><option>UI/UX Design</option><option>Graphic Design / Branding</option><option>Photo & Video</option><option>Social Media Marketing</option><option>Other</option></select>
      </label>
      <label>Message<textarea name="msg" rows="4" required></textarea></label>
      <button class="btn" type="submit">Send message →</button>
    </form>
  </section>

  <footer class="foot">
    <span class="logo">${esc(D.firstName.toUpperCase())}<b>.</b></span>
    <span class="mono">© ${new Date().getFullYear()} ${esc(fullName)} — built by many little cursors.</span>
    <a href="#top" class="mono">back to top ↑</a>
  </footer>`;


  // ---------- Build-with-cursors engine ----------
  const queue = [];
  let running = false;

  function enqueue(el) {
    if (el.dataset.q) return;
    el.dataset.q = "1";
    queue.push(el);
    if (!running) pump();
  }
  function pump() {
    running = queue.length > 0;
    if (!running) return;
    // build visible elements top-to-bottom
    queue.sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top);
    drawBuild(queue.shift());
    setTimeout(pump, 110);
  }

  // Elements that first appear as a grey placeholder box, then the real content fades in
  const MEDIA = ".portrait, .card, .compare, .hero-bg-word, .quote, .reel, .fb-card";
  const drawLayer = document.getElementById("draw-layer");

  // A crosshair cursor presses at the top-left corner and drags the box out to full size,
  // like drawing a frame in a design tool. The content is revealed as the box grows.
  async function drawBuild(el) {
    const r = el.getBoundingClientRect();
    if (reduceMotion || r.width < 2 || r.bottom < -40 || r.top > innerHeight + 40) return reveal(el);

    const fixed = !!el.closest(".nav");
    const host = fixed ? layer : drawLayer;
    if (!fixed) drawLayer.style.height = document.documentElement.scrollHeight + "px";
    const x0 = r.left + (fixed ? 0 : scrollX);
    const y0 = r.top + (fixed ? 0 : scrollY);
    const W = r.width, H = r.height;
    const media = el.matches(MEDIA);

    // 1. cursor glides to the start corner
    const c = makeCursor(undefined, Math.random() < 0.5, "cross", host);
    const sx = x0 - 60 - Math.random() * 180, sy = y0 - 40 - Math.random() * 120;
    pos(c, sx, sy);
    await tween(300, (e) => pos(c, sx + (x0 - sx) * e, sy + (y0 - sy) * e));

    // 2. mouse down -> drag to resize
    c.classList.add("down");
    const box = document.createElement("div");
    box.className = "dbox" + (media ? " fill" : "");
    box.innerHTML = "<i></i><i></i><i></i><i></i><b></b>";
    host.appendChild(box);
    const size = box.querySelector("b");
    el.classList.add(media ? "drawing-media" : "drawing");
    const dur = 420 + Math.min(520, (W + H) / 3);
    await tween(
      dur,
      (e) => {
        const w = W * e, h = H * e;
        box.style.cssText = `left:${x0}px;top:${y0}px;width:${w}px;height:${h}px`;
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

    // 4. cursor leaves
    const ex = x0 + W + 60 + Math.random() * 160, ey = y0 + H + 30 + Math.random() * 90;
    await wait(120);
    await tween(
      380,
      (e) => {
        pos(c, x0 + W + (ex - x0 - W) * e, y0 + H + (ey - y0 - H) * e);
        c.style.opacity = 1 - e;
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
    for (let i = 0; i < 14; i++) {
      const c = makeCursor(i, i % 3 === 0, i % 4 === 0 ? "arrow" : "cross");
      const [x, y] = edgePoint();
      pos(c, x, y);
      swarm.push(c);
    }
    const scatter = (t) =>
      swarm.forEach((c) => {
        c.style.transition = `transform ${t + Math.random() * 0.4}s cubic-bezier(.3,.7,.3,1)`;
        pos(c, innerWidth * (0.08 + Math.random() * 0.84), innerHeight * (0.12 + Math.random() * 0.76));
      });
    await wait(60);
    scatter(0.7);
    await wait(800);
    if (skipped) return;
    document.body.classList.add("rulers");
    drawGuides();
    scatter(0.5);
    await wait(700);
    if (skipped) return;
    leaveSwarm();
    startBuilding();
    await wait(3600);
    if (!skipped) endIntro();
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

  if (reduceMotion) {
    document.querySelectorAll(".b").forEach((el) => reveal(el));
    skipBtn.remove();
    startBuilding();
  } else {
    runIntro();
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

  // ---------- Contact form -> opens email app ----------
  document.getElementById("ct-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const f = new FormData(e.target);
    const subject = `${f.get("type")} enquiry from ${f.get("name")}`;
    const body = `${f.get("msg")}\n\n— ${f.get("name")} (${f.get("email")})`;
    location.href = `mailto:${D.contact.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });

  // ---------- Hero spotlight follows the mouse ----------
  const hero = document.querySelector(".hero");
  hero.addEventListener("pointermove", (e) => {
    const r = hero.getBoundingClientRect();
    hero.style.setProperty("--mx", e.clientX - r.left + "px");
    hero.style.setProperty("--my", e.clientY - r.top + "px");
  });
})();

// Situs publik — tema, nav, dan render konten per halaman
(function () {
  const S = Store;

  // --- Tema
  function applyTheme(t) {
    document.documentElement.dataset.theme = t;
    localStorage.setItem("portofolio_refin_theme", t);
    document.querySelectorAll(".theme-btn").forEach((b) => {
      b.textContent = t === "light" ? "🌙" : "☀️";
      b.setAttribute("aria-label", "Ganti tema " + (t === "light" ? "gelap" : "terang"));
    });
  }
  applyTheme(localStorage.getItem("portofolio_refin_theme") || "dark");
  document.addEventListener("click", (e) => {
    if (e.target.closest(".theme-btn")) {
      applyTheme(document.documentElement.dataset.theme === "light" ? "dark" : "light");
    }
  });

  // --- Nav mobile
  const burger = document.querySelector(".burger");
  if (burger) burger.addEventListener("click", () => document.querySelector(".nav-links").classList.toggle("open"));

  // --- Util
  const esc = (s = "") =>
    s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  fmtID = (iso) => {
    if (!iso) return "";
    const d = new Date(iso + (iso.length === 10 ? "T00:00:00" : ""));
    if (isNaN(d)) return iso;
    return d.toLocaleDateString("id-ID", { month: "short", year: "numeric" });
  };
  const TYPE_LABEL = { magang: "Magang", organisasi: "Organisasi", proyek: "Proyek", lomba: "Lomba" };
  const qs = new URLSearchParams(location.search);
  const p = () => S.profile.get();

  function linkHTML(p) {
    const s = p.socials || {};
    return Object.entries(s).filter(([, v]) => v)
      .map(([k, v]) => `<a href="${esc(v)}" target="_blank" rel="noopener" class="pill">${k === "github" ? "GitHub" : k === "linkedin" ? "LinkedIn" : "Instagram"}</a>`).join("");
  }

  // --- Ekspos helper ke window (dipakai admin)
  window.Ref = { esc, fmtID, TYPE_LABEL, profile: p, linkHTML, qs };

  // ================= RENDERER =================
  const R = {};

  R.home = function () {
    const pr = p();
    const exps = S.list("experiences", { publikOnly: true }).slice(0, 3);
    const skills = S.list("skills", { publikOnly: true });
    const pros = S.list("projects", { publikOnly: true }).slice(0, 3);
    document.getElementById("hero-tagline").textContent = pr.tagline || "";
    document.getElementById("hero-name").textContent = pr.name || "";
    document.querySelectorAll("[data-profile-name]").forEach((el) => (el.textContent = pr.name));
    if (pr.avatar_url) document.getElementById("hero-avatar").src = pr.avatar_url, document.getElementById("hero-avatar").alt = "Foto profil " + pr.name;
    const cv = document.getElementById("btn-cv");
    if (cv) {
      if (pr.cv_url) { cv.href = pr.cv_url; cv.download = "cv-refin.pdf"; }
      else { cv.href = "#", cv.classList.add("disabled"), cv.title = "CV belum diunggah"; }
    }
    document.getElementById("card-pengalaman").innerHTML = exps.map((x) => expCard(x, pr)).join("");
    const kategori = ["Bahasa Pemrograman", "Framework", "Tools"];
    document.getElementById("card-skill").innerHTML = kategori.map((k) => `
      <div class="card card-hover card-body">
        <span class="pill pill-solid">${esc(k)}</span>
        <p class="text-soft" style="margin:10px 0 0">${esc(skills.filter((s) => s.category === k).map((s) => s.name).join(" · ") || "—")}</p>
      </div>`).join("");
    document.getElementById("card-proyek").innerHTML = pros.map((x) => `
      <article class="card card-hover">
        ${x.cover_url ? `<img src="${esc(x.cover_url)}" alt="Proyek ${esc(x.title)}" class="card-media" loading="lazy">` : ""}
        <div class="card-body">
          <h3>${esc(x.title)}</h3>
          <p class="text-soft">${esc(x.summary)}</p>
          <div>${(x.stack || []).map((s) => `<span class="pill">${esc(s)}</span>`).join(" ")}</div>
        </div>
      </article>`).join("");
  };

  function expCard(x, pr) {
    const cover = S.photos.coverOf(x);
    return `<article class="card card-hover">
      ${cover ? `<a href="pengalaman.html?id=${x.id}" tabindex="-1"><img src="${esc(cover)}" class="card-media" alt="Foto pengalaman ${esc(x.title)}" loading="lazy"></a>` : ""}
      <div class="card-body">
        <div class="t-meta">
          <span class="pill">${TYPE_LABEL[x.type] || x.type}</span>
          <span>${fmtID(x.start_date)} – ${x.end_date ? fmtID(x.end_date) : "Sekarang"}</span>
        </div>
        <h3><a href="pengalaman.html?id=${esc(x.id)}" style="color:inherit">${esc(x.title)}</a></h3>
        <p class="text-soft">${esc(x.organization)}</p>
        <a href="pengalaman.html?id=${esc(x.id)}" class="btn btn-ghost btn-sm">Detail →</a>
      </div>
    </article>`;
  }

  R.tentang = function () {
    const pr = p();
    document.getElementById("tentang-avatar").src = pr.avatar_url;
    document.getElementById("tentang-avatar").alt = "Foto profil " + pr.name;
    document.getElementById("tentang-bio").textContent = pr.bio;
    document.getElementById("tentang-info").innerHTML = [
      ["Nama", pr.name], ["NIM", esc(pr.nim)], ["Prodi", "Teknik Informatika"],
      ["Kampus", "Institut Teknologi Sumatera (ITERA)"], ["Lokasi", pr.location || "—"],
      ["Email", `<a href="mailto:${esc(pr.email)}">${esc(pr.email)}</a>`]
    ].map(([k, v]) => `<div class="row" style="display:flex;justify-content:space-between;gap:14px;padding:10px 0;border-bottom:1px solid var(--border)"><b class="muted" style="min-width:110px">${k}</b><span>${v}</span></div>`).join("");
    document.getElementById("tentang-social").innerHTML = linkHTML(pr);
  };

  R.skill = function () {
    const kat = ["Bahasa Pemrograman", "Framework", "Tools", "Soft Skill"];
    const skills = S.list("skills", { publikOnly: true });
    document.getElementById("skill-list").innerHTML = kat
      .map((k) => {
        const rows = skills.filter((s) => s.category === k);
        if (!rows.length) return "";
        return `<section style="margin-bottom:38px">
          <h3>${esc(k)}</h3>
          ${rows.map((s) => `
            <div class="skill-row">
              <div style="display:flex;justify-content:space-between;font-size:14px;margin-bottom:5px">
                <b>${esc(s.name)}</b><span class="muted">${s.level}/5</span>
              </div>
              <div class="skill-track"><div class="skill-fill" data-lv="${Math.round((s.level / 5) * 100)}"></div></div>
            </div>`).join("")}
        </section>`;
      }).join("");
    requestAnimationFrame(() => document.querySelectorAll(".skill-fill").forEach((el) => (el.style.width = el.dataset.lv + "%")));
  };

  R.proyek = function () {
    const pros = S.list("projects", { publikOnly: true });
    document.getElementById("proyek-list").innerHTML = pros.map((x) => `
      <article class="card card-hover">
        ${x.cover_url ? `<img src="${esc(x.cover_url)}" class="card-media" alt="Proyek ${esc(x.title)}" loading="lazy">` : `<div class="card-media" style="background:var(--gradient)"></div>`}
        <div class="card-body">
          <h3>${esc(x.title)}</h3>
          <p class="text-soft">${esc(x.summary)}</p>
          <div style="margin:12px 0">${(x.stack || []).map((s) => `<span class="pill">${esc(s)}</span>`).join(" ")}</div>
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            ${x.demo_url ? `<a class="btn btn-primary btn-sm" href="${esc(x.demo_url)}" target="_blank" rel="noopener">Demo</a>` : ""}
            ${x.repo_url ? `<a class="btn btn-ghost btn-sm" href="${esc(x.repo_url)}" target="_blank" rel="noopener">Repositori</a>` : ""}
          </div>
        </div>
      </article>`).join("") || `<p class="muted">Belum ada proyek publik.</p>`;
  };

  R.pengalaman = function () {
    const id = qs.get("id");
    if (id) return detailPengalaman(id);
    const exps = S.list("experiences", { publikOnly: true });
    const filters = ["semua", ...new Set(exps.map((x) => x.type))];
    const bar = document.getElementById("filter-bar");
    bar.innerHTML = filters.map((f, i) =>
      `<button data-f="${f}" class="${i === 0 ? "active" : ""}">${f === "semua" ? "Semua" : TYPE_LABEL[f]}</button>`).join("");
    bar.addEventListener("click", (e) => {
      const b = e.target.closest("button"); if (!b) return;
      bar.querySelectorAll("button").forEach((x) => x.classList.remove("active"));
      b.classList.add("active");
      renderTL(b.dataset.f);
    });
    function renderTL(f) {
      const items = f === "semua" ? exps : exps.filter((x) => x.type === f);
      document.getElementById("timeline").innerHTML = items.map((x) => {
        return `<div class="t-item card card-body card-hover">
          <div class="t-meta">
            <span class="pill">${TYPE_LABEL[x.type]}</span>
            <span>${fmtID(x.start_date)} – ${x.end_date ? fmtID(x.end_date) : "Sekarang"}</span>
            ${x.location ? `<span>· ${esc(x.location)}</span>` : ""}
          </div>
          <h3 style="margin-top:4px"><a href="pengalaman.html?id=${esc(x.id)}" style="color:inherit">${esc(x.title)}</a></h3>
          <p class="muted" style="font-size:14px">${esc(x.organization)}</p>
          <p class="text-soft">${esc(x.description)}</p>
          <a class="btn btn-ghost btn-sm" href="pengalaman.html?id=${esc(x.id)}">Buka detail →</a>
        </div>`;
      }).join("") || `<p class="muted">Tidak ada pengalaman dengan filter ini.</p>`;
    }
    renderTL("semua");
  };

  function detailPengalaman(id) {
    const x = S.get("experiences", id);
    const wrap = document.getElementById("detail-wrap");
    const listWrap = document.getElementById("timeline-section");
    if (!x || x.status === "draft") {
      listWrap && (listWrap.style.display = "");
      wrap.style.display = "none";
      R.tentang && void 0;
      locationSearchFallback();
      return;
    }
    listWrap && (listWrap.style.display = "none");
    wrap.style.display = "";
    const pr = p();
    const gal = (x.photos || []).map((ph) => `
      <figure style="margin:0"><img src="${esc(ph.url)}" alt="${esc(ph.caption || "Foto pengalaman " + x.title)}"
        loading="lazy" style="border-radius:12px;border:1px solid var(--border)">
      <figcaption class="muted" style="font-size:13px;margin-top:6px">${esc(ph.caption || "Tanpa caption")}</figcaption></figure>`).join("");
    wrap.innerHTML = `
      <a class="btn btn-ghost btn-sm" href="pengalaman.html">← Kembali ke timeline</a>
      <div class="hero-grid section" style="padding-top:26px">
        <div>
          <div class="t-meta">
            <span class="pill pill-solid">${TYPE_LABEL[x.type] || x.type}</span>
            <span>${fmtID(x.start_date)} – ${x.end_date ? fmtID(x.end_date) : "Sekarang"}</span>
            ${x.location ? `<span>· ${esc(x.location)}</span>` : ""}
          </div>
          <h1 style="margin-top:8px">${esc(x.title)}</h1>
          <p class="muted">${esc(x.organization)}</p>
          <p class="text-soft">${esc(x.description)}</p>
          ${x.link ? `<a class="btn btn-primary btn-sm" href="${esc(x.link)}" target="_blank" rel="noopener">Tautan terkait</a>` : ""}
        </div>
        <div>${S.photos.coverOf(x) ? `<img class="avatar-lg" style="border-radius:var(--radius);aspect-ratio:4/3" src="${esc(S.photos.coverOf(x))}"
          alt="Foto sampul ${esc(x.title)}">` : ""}</div>
      </div>
      ${x.achievements?.length ? `<section class="section" style="padding-top:0">
          <h3>Pencapaian</h3>
          <ul class="text-soft">${x.achievements.map((a) => `<li>${esc(a)}</li>`).join("")}</ul>
        </section>` : ""}
      ${x.photos?.length ? `<section class="section" style="padding-top:0">
          <h3>Galeri Foto</h3>
          <div class="gal-grid gal-grid-static" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:14px">${gal}</div>
        </section>` : ""}
      <div class="section" style="padding-top:0">
        <h3>Skill relevan</h3>
        <div>${skillChips(x)}</div>
      </div>`;
  }

  function skillChips(x) {
    const all = S.list("skills", { publikOnly: true });
    const linked = all.filter((s) => s.link_exp === x.id);
    const show = linked.length ? linked : all.slice(0, 6);
    return show.map((s) => `<span class="pill">${esc(s.name)}</span>`).join(" ");
  }

  function locationSearchFallback() {
    // jika id tidak ada, render timeline biasa
    if (typeof R.__tlFallback === "undefined") {
      R.__tlFallback = true;
      const wrap = document.getElementById("detail-wrap");
      if (wrap && qs.get("id")) {
        // tandai pesan error halaman pengalaman
      }
    }
  }

  R.galeri = function () {
    const items = [];
    S.list("experiences", { publikOnly: true }).forEach((x) => {
      (x.photos || []).sort((a, b) => a.sort_order - b.sort_order)
        .forEach((ph) => items.push({ ...ph, exp: x }));
    });
    const grid = document.getElementById("gal-grid");
    grid.innerHTML = items.map((ph, i) => `
      <figure class="gal-item" tabindex="0" data-i="${i}" style="margin:0">
        <img src="${esc(ph.url)}" alt="${esc(ph.caption || "Foto pengalaman " + ph.exp.title)}" loading="lazy">
        <figcaption class="gal-cap">${esc(ph.caption || "")} <b style="opacity:.8">· ${esc(ph.exp.title)}</b></figcaption>
      </figure>`).join("") || `<p class="muted">Belum ada foto.</p>`;
    lightbox(items);
  };

  function lightbox(items) {
    const lb = document.getElementById("lightbox");
    const img = document.getElementById("lb-img");
    const cap = document.getElementById("lb-cap");
    let i = 0;
    const show = () => {
      const ph = items[i];
      img.src = ph.url;
      img.alt = ph.caption || "Foto pengalaman " + ph.exp.title;
      cap.textContent = (ph.caption ? ph.caption + " — " : "") + ph.exp.title;
      lb.classList.add("open");
    };
    const move = (d) => { i = (i + d + items.length) % items.length; show(); };
    document.getElementById("gal-grid").addEventListener("click", (e) => {
      const f = e.target.closest(".gal-item");
      if (f) { i = +f.dataset.i; show(); }
    });
    document.getElementById("gal-grid").addEventListener("keydown", (e) => {
      const f = e.target.closest(".gal-item");
      if (f && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); i = +f.dataset.i; show(); }
    });
    lb.querySelector(".lb-close").onclick = () => lb.classList.remove("open");
    lb.querySelector(".lb-prev").onclick = (e) => { e.stopPropagation(); move(-1); };
    lb.querySelector(".lb-next").onclick = (e) => { e.stopPropagation(); move(1); };
    lb.addEventListener("click", (e) => { if (e.target === lb) lb.classList.remove("open"); });
    document.addEventListener("keydown", (e) => {
      if (!lb.classList.contains("open")) return;
      if (e.key === "Escape") lb.classList.remove("open");
      if (e.key === "ArrowLeft") move(-1);
      if (e.key === "ArrowRight") move(1);
    });
  }

  R.kontak = function () {
    const form = document.getElementById("form-kontak");
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const f = new FormData(form);
      if (f.get("website")) return; // honeypot
      const name = (f.get("name") || "").trim();
      const email = (f.get("email") || "").trim();
      const message = (f.get("message") || "").trim();
      if (!name || !email || !message || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
        alert("Mohon isi nama, email valid, dan pesan."); return;
      }
      S.messages.add({ name, email, message });
      form.reset();
      const ok = document.getElementById("kontak-ok");
      ok.hidden = false;
      setTimeout(() => (ok.hidden = true), 5000);
    });
  };

  // --- Boot
  document.addEventListener("DOMContentLoaded", () => {
    S.init();
    const page = document.body.dataset.page;
    const foot = document.getElementById("foot-year");
    if (foot) foot.textContent = new Date().getFullYear();
    // nama di nav/footer
    document.querySelectorAll("[data-nav-name]").forEach((el) => (el.textContent = p().name));
    if (R[page]) R[page]();
  });
})();

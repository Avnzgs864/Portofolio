// Dashboard CMS — login, tab, CRUD pengalaman/skill/proyek, foto, pesan, profil
(function () {
  const esc = (s = "") => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const fmt = (iso) => {
    if (!iso) return "";
    const d = new Date(iso + (iso.length === 10 ? "T00:00:00" : ""));
    return isNaN(d) ? iso : d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
  };
  const TYPE_LABEL = { magang: "Magang", organisasi: "Organisasi", proyek: "Proyek", lomba: "Lomba" };
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const MODAL = $("#modal");
  const toast = (msg, ok = true) => {
    const t = $("#toast");
    t.textContent = msg;
    t.className = "toast show " + (ok ? "ok" : "err");
    clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove("show"), 2600);
  };

  // ---------- AUTH ----------
  function guard() {
    const authed = Store.isAuthed();
    $("#login-view").style.display = authed ? "none" : "";
    $("#admin-view").style.display = authed ? "" : "none";
    return authed;
  }

  $("#form-login").addEventListener("submit", (e) => {
    e.preventDefault();
    const f = new FormData(e.target);
    if (Store.login(f.get("email") || "", f.get("password") || "")) {
      guard(); boot();
      toast("Berhasil masuk. Selamat datang!", true);
    } else toast("Email atau password salah", false);
  });
  $("#btn-logout").addEventListener("click", (e) => { e.preventDefault(); Store.logout(); guard(); $("#form-login").reset(); });

  // ---------- TAB ----------
  $$("[data-tab]").forEach((a) => a.addEventListener("click", (e) => {
    e.preventDefault();
    const tab = a.dataset.tab;
    $$("[data-tab]").forEach((x) => x.classList.toggle("active", x === a));
    $$("[data-view]").forEach((v) => (v.hidden = v.dataset.view !== tab));
    if (tab === "msg") renderMsgs();
  }));

  function show(view) { $(`[data-tab="${view}"]`)?.click(); }

  function closeModal() { MODAL.classList.remove("open"); MODAL.removeEventListener("click", modalOutside); }
  function openModal(html) {
    $("#modal-box").innerHTML = html;
    MODAL.classList.add("open");
    MODAL.addEventListener("click", modalOutside);
  }
  function modalOutside(e) { if (e.target === MODAL) closeModal(); }
  document.addEventListener("keydown", (e) => e.key === "Escape" && closeModal());

  $("#modal").addEventListener("click", (e) => {
    const b = e.target.closest("[data-close]");
    if (b) closeModal();
  });

  // ---------- DASHBOARD ----------
  function renderStats() {
    const db = Store.db();
    const unread = Store.messages.unread();
    const cards = [
      ["Pengalaman", db.experiences.length],
      ["Foto", db.experiences.reduce((n, x) => n + (x.photos || []).length, 0)],
      ["Skill", db.skills.length],
      ["Proyek", db.projects.length],
      ["Pesan belum dibaca", unread]
    ];
    $("#stats").innerHTML = cards.map(([k, v]) => `<div class="stat"><b>${v}</b><span>${k}</span></div>`).join("");
    const badge = $("#msg-badge");
    badge.style.display = unread ? "" : "none";
    badge.textContent = unread;
  }

  // ---------- PENGALAMAN ----------
  function renderExp() {
    const rows = Store.list("experiences").map((x) => {
      const cover = (x.photos || []).find((p) => p.is_cover) || (x.photos || [])[0];
      return `<tr>
        <td>${cover ? `<img class="thumb-sm" src="${esc(cover.url)}" alt="Sampul ${esc(x.title)}">` : `<div class="thumb-sm"></div>`}</td>
        <td><b>${esc(x.title)}</b><br><span class="muted" style="font-size:12px">${esc(x.organization)}</span></td>
        <td><span class="pill">${TYPE_LABEL[x.type] || esc(x.type)}</span></td>
        <td style="font-size:13px">${fmt(x.start_date)} – ${x.end_date ? fmt(x.end_date) : "kini"}</td>
        <td>${x.status === "draft" ? `<span class="pill pill-warn">Draft</span>` : `<span class="pill pill-ok">Publik</span>`}</td>
        <td><div class="row-actions">
          <button class="btn btn-ghost btn-sm" data-edit="${esc(x.id)}">Edit</button>
          <button class="btn btn-ghost btn-sm" data-act="toggle" data-id="${esc(x.id)}">${x.status === "draft" ? "📢" : "🔒"}</button>
          <button class="btn btn-danger btn-sm" data-del="${esc(x.id)}">Hapus</button>
        </div></td>
      </tr>`;
    }).join("");
    $("#exp-list").innerHTML = rows
      ? `<table class="list"><thead><th>Sam.</th><th>Pengalaman</th><th>Tipe</th><th>Periode</th><th>Status</th><th>Aksi</th></thead><tbody>${rows}</tbody></table>`
      : `<p class="muted">Belum ada pengalaman. Klik "+ Pengalaman Baru".</p>`;
  }

  function expForm(x = {}) {
    const isEdit = !!x.id;
    const photos = (x.photos || []).slice().sort((a, b) => a.sort_order - b.sort_order);
    openModal(`
      <div class="modal-head"><h2 style="margin:0">${isEdit ? "Edit" : "Tambah"} Pengalaman</h2>
        <button class="btn btn-ghost btn-sm" data-close>✕ Tutup</button></div>
      <form id="form-exp" class="form" data-id="${esc(x.id || "")}">
        <div class="grid-form">
          <label>Posisi / Judul *
            <input name="title" required value="${esc(x.title)}">
          </label>
          <label>Organisasi / Tempat *
            <input name="organization" required value="${esc(x.organization)}">
          </label>
          <label>Tipe *
            <select name="type">
              ${Object.entries(TYPE_LABEL).map(([v, l]) => `<option value="${v}" ${x.type === v ? "selected" : ""}>${l}</option>`).join("")}
            </select>
          </label>
          <label> lokasi
            <input name="location" value="${esc(x.location)}">
          </label>
          <label>Tanggal Mulai *
            <input name="start_date" type="date" required value="${esc(x.start_date)}">
          </label>
          <label>Tanggal Selesai (kosong = masih berjalan)
            <input name="end_date" type="date" value="${esc(x.end_date)}">
          </label>
          <label class="full">Deskripsi
            <textarea name="description">${esc(x.description)}</textarea>
          </label>
          <label class="full">Pencapaian (satu per baris)
            <textarea name="achievements">${esc((x.achievements || []).join("\n"))}</textarea>
          </label>
          <label class="full">Tautan terkait (opsional)
            <input name="link" type="url" value="${esc(x.link)}">
          </label>
          <label>Status
            <select name="status">
              <option value="publik" ${x.status !== "draft" ? "selected" : ""}>Publik</option>
              <option value="draft" ${x.status === "draft" ? "selected" : ""}>Draft</option>
            </select>
          </label>
        </div>
        <div>
          <b> Foto Pengalaman</b>
          <p class="muted" style="font-size:13px;margin:4px 0 10px">JPG/PNG/WebP maks 5 MB — otomatis dikompres. Klik ikon ★ untuk jadikan sampul.</p>
          <div class="dropzone" id="dz">Tarik & lepas foto di sini, atau klik untuk pilih berkas<input type="file" id="file-photos" accept="image/jpeg,image/png,image/webp" multiple hidden></div>
          <div class="photo-grid" id="photo-grid" style="margin-top:12px">
            ${photos.map((p) => photoCell(p)).join("")}
          </div>
        </div>
        <div style="display:flex;gap:10px;justify-content:flex-end">
          <button type="button" class="btn btn-ghost" data-close>Batal</button>
          <button type="submit" class="btn btn-primary">💾 Simpan sebagai Draft/Publik</button>
        </div>
      </form>
    `);
    wireExpForm();
  }

  function photoCell(p) {
    return `<div class="photo-cell">
      ${p.is_cover ? `<span class="badge-cover">Sampul</span>` : ""}
      <img src="${esc(p.url)}" alt="${esc(p.caption || "Foto pengalaman")}">
      <div class="cap">${esc(p.caption || "Tanpa caption")}</div>
      <input class="pcap" type="text" placeholder="Caption…" value="${esc(p.caption)}" data-pid="${esc(p.id)}" style="width:100%;border:none;border-top:1px solid var(--border);border-radius:0;padding:7px 8px;background:var(--surface-2);font-size:12px">
      <div class="photo-tools">
        <button data-star="${esc(p.id)}" title="Jadikan sampul" class="${p.is_cover ? "on" : ""}">★</button>
        <button data-left="${esc(p.id)}" title="Geser kiri">←</button>
        <button data-right="${esc(p.id)}" title="Geser kanan">→</button>
        <button data-rm="${esc(p.id)}" title="Hapus foto" style="color:var(--danger)">🗑</button>
      </div>
    </div>`;
  }

  // state foto di form aktif
  let formPhotos = [];

  function collectFormPhotos(expID) {
    const grid = $("#photo-grid");
    $$(".photo-cell", grid).forEach((cell, i) => {
      const pid = cell.querySelector(".pcap").dataset.pid;
      const cap = cell.querySelector(".pcap").value.trim();
      const photo = formPhotos.find((p) => p.id === pid) || {};
      photo.caption = cap;
      photo.is_cover = !!cell.querySelector(".badge-cover");
      photo.sort_order = i + 1;
    });
  }

  function wireExpForm() {
    const id = $("#form-exp").dataset.id;
    formPhotos = id ? structuredClone(Store.get("experiences", id).photos || []) : [];

    // dropzone
    const dz = $("#dz"), inp = $("#file-photos");
    dz.addEventListener("click", () => inp.click());
    ["dragover", "dragenter"].forEach((ev) => dz.addEventListener(ev, (e) => { e.preventDefault(); dz.classList.add("drag"); }));
    ["dragleave", "drop"].forEach((ev) => dz.addEventListener(ev, (e) => { e.preventDefault(); dz.classList.remove("drag"); }));
    dz.addEventListener("drop", (e) => handleFiles(e.dataTransfer.files));
    inp.addEventListener("change", () => handleFiles(inp.files));

    async function handleFiles(files) {
      for (const f of files) {
        if (!/image\/(jpe?g|png|webp)/.test(f.type)) { toast("Format harus JPG/PNG/WebP: " + f.name, false); continue; }
        if (f.size > 5 * 1024 * 1024) { toast("Maksimal 5 MB: " + f.name, false); continue; }
        try {
          const url = await compressImage(f);
          formPhotos.push({ id: Store.uid(), url, caption: "", is_cover: false, sort_order: 99 });
        } catch { toast("Gagal membaca foto " + f.name, false); }
      }
      refreshPhotoGrid();
      inp.value = "";
    }

    function refreshPhotoGrid() {
      const ps = currentSorted();
      $("#photo-grid").innerHTML = ps.map((p) => photoCell(p)).join("");
    }
    window._refreshPhotoGrid = refreshPhotoGrid;
    window._currentSorted = currentSorted;
    function currentSorted() {
      return formPhotos.slice().sort((a, b) => a.sort_order - b.sort_order);
    }

    $("#photo-grid").addEventListener("click", (e) => {
      const b = e.target.closest("button"); if (!b) return;
      const ps = currentSorted();
      if (b.dataset.star) formPhotos.forEach((p) => (p.is_cover = p.id === b.dataset.star));
      if (b.dataset.left || b.dataset.right) {
        const pid = b.dataset.left || b.dataset.right;
        const idx = ps.findIndex((p) => p.id === pid);
        const swap = b.dataset.left ? idx - 1 : idx + 1;
        if (swap >= 0 && swap < ps.length) {
          [ps[idx].sort_order, ps[swap].sort_order] = [ps[swap].sort_order, ps[idx].sort_order];
        }
      }
      if (b.dataset.rm) formPhotos = formPhotos.filter((p) => p.id !== b.dataset.rm);
      refreshPhotoGrid();
    });
    $("#photo-grid").addEventListener("input", (e) => {
      if (e.target.classList.contains("pcap")) {
        const p = formPhotos.find((x) => x.id === e.target.dataset.pid);
        if (p) p.caption = e.target.value;
      }
    });

    $("#form-exp").addEventListener("submit", (e) => {
      e.preventDefault();
      const f = new FormData(e.target);
      const data = {
        title: f.get("title").trim(),
        organization: f.get("organization").trim(),
        type: f.get("type"),
        location: (f.get("location") || "").trim(),
        start_date: f.get("start_date"),
        end_date: f.get("end_date") || "",
        description: (f.get("description") || "").trim(),
        achievements: (f.get("achievements") || "").split("\n").map((s) => s.trim()).filter(Boolean),
        link: (f.get("link") || "").trim(),
        status: f.get("status")
      };
      if (data.end_date && data.end_date < data.start_date) {
        toast("Tanggal selesai tidak boleh sebelum tanggal mulai", false); return;
      }
      let expID = id;
      if (id) {
        Store.update("experiences", id, data);
      } else {
        expID = Store.insert("experiences", { ...data, photos: [] }).id;
      }
      // sinkron foto
      const exp = Store.get("experiences", expID);
      const keepIDs = new Set(formPhotos.map((p) => p.id));
      (exp.photos || []).forEach((p) => { if (!keepIDs.has(p.id)) Store.photos.remove(expID, p.id); });
      const ps = currentSorted();
      ps.forEach((p, i) => {
        const patch = { id: p.id, url: p.url, caption: p.caption, is_cover: p.is_cover, sort_order: i + 1 };
        if (exp.photos.some((q) => q.id === p.id)) Store.photos.update(expID, p.id, patch);
        else Store.photos.add(expID, patch);
      });
      Store.photos.setCover(expID, ps.find((p) => p.is_cover)?.id || ps[0]?.id);
      closeModal();
      renderExp(); renderStats();
      toast(id ? "Pengalaman diperbarui" : "Pengalaman ditambahkan");
    });
  }

  document.addEventListener("click", (e) => {
    const act = e.target.closest("[data-act]");
    if (act) {
      if (act.dataset.act === "new-exp") expForm();
      if (act.dataset.act === "new-skill") skillForm();
      if (act.dataset.act === "new-proj") projForm();
      if (act.dataset.act === "toggle") {
        const x = Store.get("experiences", act.dataset.id);
        Store.update("experiences", x.id, { status: x.status === "draft" ? "publik" : "draft" });
        renderExp(); renderStats();
        toast(x.status === "draft" ? "Status → Publik" : "Status → Draft");
      }
    }
    const ed = e.target.closest("[data-edit]");
    if (ed) expForm(Store.get("experiences", ed.dataset.edit));
    const del = e.target.closest("[data-del]");
    if (del && confirm("Hapus pengalaman ini (termasuk foto-fotonya)?")) {
      Store.remove("experiences", del.dataset.del);
      renderExp(); renderStats(); toast("Pengalaman dihapus");
    }
  });

  // ---------- SKILL ----------
  function renderSkill() {
    const exps = Store.list("experiences");
    const rows = Store.list("skills").map((s) => `<tr>
      <td><b>${esc(s.name)}</b></td>
      <td><span class="pill">${esc(s.category)}</span></td>
      <td>${s.level}/5</td>
      <td style="font-size:13px">${esc(exps.find((x) => x.id === s.link_exp)?.title || "—")}</td>
      <td><div class="row-actions">
        <button class="btn btn-ghost btn-sm" data-sk-edit="${esc(s.id)}">Edit</button>
        <button class="btn btn-danger btn-sm" data-sk-del="${esc(s.id)}">Hapus</button>
      </div></td>
    </tr>`).join("");
    $("#skill-list").innerHTML = rows
      ? `<table class="list"><thead><th>Nama</th><th>Kategori</th><th>Level</th><th>Dikaitkan ke</th><th>Aksi</th></thead><tbody>${rows}</tbody></table>`
      : `<p class="muted">Belum ada skill.</p>`;
  }

  function skillForm(s = {}) {
    const exps = Store.list("experiences");
    openModal(`
      <div class="modal-head"><h2 style="margin:0">${s.id ? "Edit" : "Tambah"} Skill</h2>
        <button class="btn btn-ghost btn-sm" data-close>✕ Tutup</button></div>
      <form id="form-skill" class="form" data-id="${esc(s.id || "")}">
        <div class="grid-form">
          <label>Nama Skill *
            <input name="name" required value="${esc(s.name)}">
          </label>
          <label>Kategori *
            <select name="category">
              ${["Bahasa Pemrograman", "Framework", "Tools", "Soft Skill"].map((c) => `<option ${s.category === c ? "selected" : ""}>${c}</option>`).join("")}
            </select>
          </label>
          <label>Level (1–5) *
            <input name="level" type="number" min="1" max="5" required value="${esc(s.level || 3)}">
          </label>
          <label>Dikaitkan ke Pengalaman
            <select name="link_exp">
              <option value="">— tidak ada —</option>
              ${exps.map((x) => `<option value="${esc(x.id)}" ${s.link_exp === x.id ? "selected" : ""}>${esc(x.title)}</option>`).join("")}
            </select>
          </label>
        </div>
        <div style="display:flex;gap:10px;justify-content:flex-end">
          <button type="button" class="btn btn-ghost" data-close>Batal</button>
          <button type="submit" class="btn btn-primary">💾 Simpan</button>
        </div>
      </form>
    `);
    $("#form-skill").addEventListener("submit", (e) => {
      e.preventDefault();
      const f = new FormData(e.target);
      const data = {
        name: f.get("name").trim(),
        category: f.get("category"),
        level: Math.max(1, Math.min(5, +f.get("level") || 3)),
        link_exp: f.get("link_exp") || ""
      };
      if (s.id) Store.update("skills", s.id, data);
      else Store.insert("skills", data);
      closeModal(); renderSkill(); renderStats();
      toast(s.id ? "Skill diperbarui" : "Skill ditambahkan");
    });
  }

  // ---------- PROYEK ----------
  function renderProj() {
    const rows = Store.list("projects").map((x) => `<tr>
      <td>${x.cover_url ? `<img class="thumb-sm" src="${esc(x.cover_url)}" alt="Sampul ${esc(x.title)}">` : `<div class="thumb-sm"></div>`}</td>
      <td><b>${esc(x.title)}</b><br><span class="muted" style="font-size:12px">${esc((x.stack || []).join(", "))}</span></td>
      <td>${x.status === "draft" ? `<span class="pill pill-warn">Draft</span>` : `<span class="pill pill-ok">Publik</span>`}</td>
      <td><div class="row-actions">
        <button class="btn btn-ghost btn-sm" data-pj-edit="${esc(x.id)}">Edit</button>
        <button class="btn btn-ghost btn-sm" data-pj-act="toggle" data-id="${esc(x.id)}">${x.status === "draft" ? "📢" : "🔒"}</button>
        <button class="btn btn-danger btn-sm" data-pj-del="${esc(x.id)}">Hapus</button>
      </div></td>
    </tr>`).join("");
    $("#proj-list").innerHTML = rows
      ? `<table class="list"><thead><th>Sampul</th><th>Proyek</th><th>Status</th><th>Aksi</th></thead><tbody>${rows}</tbody></table>`
      : `<p class="muted">Belum ada proyek.</p>`;
  }

  function projForm(x = {}) {
    openModal(`
      <div class="modal-head"><h2 style="margin:0">${x.id ? "Edit" : "Tambah"} Proyek</h2>
        <button class="btn btn-ghost btn-sm" data-close>✕ Tutup</button></div>
      <form id="form-proj" class="form" data-id="${esc(x.id || "")}">
        <div class="grid-form">
          <label>Judul *
            <input name="title" required value="${esc(x.title)}">
          </label>
          <label>Stack Teknologi (pisahkan koma)
            <input name="stack" value="${esc((x.stack || []).join(", "))}">
          </label>
          <label class="full">Ringkasan
            <textarea name="summary">${esc(x.summary)}</textarea>
          </label>
          <label>URL Demo
            <input name="demo_url" type="url" value="${esc(x.demo_url)}">
          </label>
          <label>URL Repositori
            <input name="repo_url" type="url" value="${esc(x.repo_url)}">
          </label>
          <label>Foto Sampul
            <input name="cover_file" type="file" accept="image/jpeg,image/png,image/webp">
            <img id="cover-preview" src="${esc(x.cover_url)}" alt="Pratinjau sampul" style="margin-top:8px;border-radius:8px;display:${x.cover_url ? "" : "none"};max-height:130px">
          </label>
          <label>Status
            <select name="status">
              <option value="publik" ${x.status !== "draft" ? "selected" : ""}>Publik</option>
              <option value="draft" ${x.status === "draft" ? "selected" : ""}>Draft</option>
            </select>
          </label>
        </div>
        <div style="display:flex;gap:10px;justify-content:flex-end">
          <button type="button" class="btn btn-ghost" data-close>Batal</button>
          <button type="submit" class="btn btn-primary">💾 Simpan</button>
        </div>
      </form>
    `);
    let coverURL = x.cover_url || "";
    $("#cover-preview").src = coverURL;
    $("#form-proj").querySelector("[name=cover_file]").addEventListener("change", async (e) => {
      const f = e.target.files[0];
      if (!f) return;
      if (f.size > 5 * 1024 * 1024) { toast("Maksimal 5 MB", false); return; }
      coverURL = await compressImage(f);
      const pv = $("#cover-preview"); pv.src = coverURL; pv.style.display = "";
    });
    $("#form-proj").addEventListener("submit", (e) => {
      e.preventDefault();
      const f = new FormData(e.target);
      const data = {
        title: f.get("title").trim(),
        summary: (f.get("summary") || "").trim(),
        stack: (f.get("stack") || "").split(",").map((s) => s.trim()).filter(Boolean),
        demo_url: (f.get("demo_url") || "").trim(),
        repo_url: (f.get("repo_url") || "").trim(),
        cover_url: coverURL,
        status: f.get("status")
      };
      if (x.id) Store.update("projects", x.id, data);
      else Store.insert("projects", data);
      closeModal(); renderProj(); renderStats();
      toast(x.id ? "Proyek diperbarui" : "Proyek ditambahkan");
    });
  }

  document.addEventListener("click", (e) => {
    const s = e.target.closest("[data-sk-edit],[data-sk-del]");
    if (s) {
      if (s.dataset.skEdit) skillForm(Store.get("skills", s.dataset.skEdit));
      else if (confirm("Hapus skill ini?")) { Store.remove("skills", s.dataset.skDel); renderSkill(); renderStats(); toast("Skill dihapus"); }
    }
    const p = e.target.closest("[data-pj-edit],[data-pj-del],[data-pj-act]");
    if (p) {
      if (p.dataset.pjEdit) projForm(Store.get("projects", p.dataset.pjEdit));
      else if (p.dataset.pjDel && confirm("Hapus proyek ini?")) { Store.remove("projects", p.dataset.pjDel); renderProj(); renderStats(); toast("Proyek dihapus"); }
      else if (p.dataset.pjAct === "toggle") {
        const x = Store.get("projects", p.dataset.id);
        Store.update("projects", x.id, { status: x.status === "draft" ? "publik" : "draft" });
        renderProj(); toast(x.status === "draft" ? "Status → Publik" : "Status → Draft");
      }
    }
  });

  // ---------- PESAN ----------
  function renderMsgs() {
    const msgs = Store.list("messages").slice().sort((a, b) => b.created_at.localeCompare(a.created_at));
    $("#msg-list").innerHTML = msgs.length
      ? msgs.map((m) => `<div class="inbox-item" data-msg="${esc(m.id)}">
          <div style="display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;align-items:center">
            <div><b class="${m.read ? "" : "msg-unread"}">${esc(m.name)}</b> <span class="muted">&lt;${esc(m.email)}&gt;</span></div>
            <span class="muted" style="font-size:12px">${new Date(m.created_at).toLocaleString("id-ID")}</span>
          </div>
          <p style="margin:6px 0 0" class="text-soft">${esc(m.message)}</p>
        </div>`).join("")
      : `<p class="muted" style="padding:18px">Belum ada pesan masuk.</p>`;
    $$(".inbox-item").forEach((el) => el.addEventListener("click", () => {
      Store.update("messages", el.dataset.msg, { read: true });
      renderMsgs(); renderStats();
    }));
  }

  // ---------- PROFIL ----------
  function renderProfil() {
    const p = Store.profile.get();
    const form = $("#form-profil");
    ["name", "nim", "tagline", "bio", "email", "location"].forEach((k) => (form[k].value = p[k] || ""));
    form.github.value = p.socials?.github || "";
    form.linkedin.value = p.socials?.linkedin || "";
    form.instagram.value = p.socials?.instagram || "";
  }

  $("#form-profil").addEventListener("submit", async (e) => {
    e.preventDefault();
    const f = new FormData(e.target);
    const patch = {
      name: (f.get("name") || "").trim(),
      nim: (f.get("nim") || "").trim(),
      tagline: (f.get("tagline") || "").trim(),
      bio: (f.get("bio") || "").trim(),
      email: (f.get("email") || "").trim(),
      location: (f.get("location") || "").trim(),
      socials: { ...Store.profile.get().socials, github: f.get("github"), linkedin: f.get("linkedin"), instagram: f.get("instagram") }
    };
    const av = f.get("avatar_file");
    if (av && av.size) {
      if (av.size > 5 * 1024 * 1024) { toast("Foto profil maksimal 5 MB", false); return; }
      patch.avatar_url = await compressImage(av);
    }
    const cv = f.get("cv_file");
    if (cv && cv.size) {
      if (cv.size > 2 * 1024 * 1024) { toast("CV PDF maksimal 2 MB (localStorage terbatas)", false); return; }
      patch.cv_url = await readAsDataURL(cv);
    }
    Store.profile.update(patch);
    toast("Profil tersimpan — situs publik otomatis terbarui");
  });

  // ---------- helpers ----------
  function readAsDataURL(file) {
    return new Promise((res, rej) => {
      const r = new FileReader();
      r.onload = () => res(r.result);
      r.onerror = rej;
      r.readAsDataURL(file);
    });
  }
  function compressImage(file, maxDim = 1280, q = 0.82) {
    return readAsDataURL(file).then((dataURL) => new Promise((res, rej) => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
        const c = document.createElement("canvas");
        c.width = Math.round(img.width * scale);
        c.height = Math.round(img.height * scale);
        c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
        res(c.toDataURL("image/webp", q));
      };
      img.onerror = rej;
      img.src = dataURL;
    }));
  }

  // ---------- BOOT ----------
  function boot() {
    renderStats(); renderExp(); renderSkill(); renderProj(); renderProfil(); renderMsgs();
  }

  document.addEventListener("DOMContentLoaded", () => {
    Store.init();
    if (guard()) boot();
  });
})();

// Seed data awal — Refin Agus Saputra (124140126), Teknik Informatika ITERA
// Foto placeholder = SVG ungu; ganti lewat dashboard admin (upload asli).

const ph = (label, seed = 1) =>
  "data:image/svg+xml;utf8," + encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="rgb(76,29,149)"/>
    <stop offset=".55" stop-color="rgb(124,58,237)"/>
    <stop offset="1" stop-color="rgb(192,132,252)"/>
  </linearGradient></defs>
  <rect width="800" height="500" fill="url(#g)"/>
  <circle cx="${120 + seed * 137 % 560}" cy="${190}" r="150" fill="rgba(15,9,32,.25)"/>
  <text x="50%" y="52%" text-anchor="middle" font-family="sans-serif" font-size="30"
    font-weight="bold" fill="rgba(255,255,255,.92)">${label}</text>
</svg>`);

const SEED = {
  profile: {
    name: "Refin Agus Saputra",
    nim: "124140126",
    tagline: "Mahasiswa Teknik Informatika — Institut Teknologi Sumatera",
    bio:
      "Saya Refin Agus Saputra, NIM 124140126, mahasiswa Teknik Informatika Institut Teknologi Sumatera (ITERA) " +
      "yang tertarik pada pengembangan web dan rekayasa perangkat lunak. Menyukai memecahkan masalah " +
      "lewat kode, belajar teknologi baru, dan berkolaborasi dalam tim proyek.",
    email: "refin.124140126@students.itera.ac.id",
    location: "Lampung, Indonesia",
    avatar_url: ph("Refin Agus Saputra", 9),
    cv_url: "",
    socials: {
      github: "https://github.com/",
      linkedin: "https://www.linkedin.com/",
      instagram: "https://www.instagram.com/"
    }
  },
  experiences: [
    {
      id: "exp-magang",
      title: "Software Engineering Intern",
      organization: "PT Teknologi Nusantara",
      type: "magang",
      start_date: "2026-07-01",
      end_date: "2026-10-01",
      location: "Bandar Lampung (Hybrid)",
      description:
        "Magang sebagai software engineering intern: membantu membangun fitur aplikasi internal, menulis unit test, dan praktik code review bersama tim senior.",
      achievements: [
        "Membangun modul CRUD internal yang dipakai tim operasional",
        "Menulis 40+ unit test dengan coverage naik dari 30% ke 70%"
      ],
      link: "",
      status: "publik",
      sort_order: 1,
      photos: [
        { id: "ph1", url: ph("Workstation", 1), caption: "Meja kerja saat magang", is_cover: true, sort_order: 1 },
        { id: "ph2", url: ph("Tim Agile", 2), caption: "Daily standup bersama tim", is_cover: false, sort_order: 2 }
      ]
    },
    {
      id: "exp-proyek-siakad",
      title: "Proyek Mini SIAKAD",
      organization: "Tugas Besar Teknik Informatika ITERA",
      type: "proyek",
      start_date: "2025-10-01",
      end_date: "2025-12-01",
      location: "Institut Teknologi Sumatera",
      description:
        "Proyek sistem informasi akademik mini (web) bersama tim: manajemen mata kuliah, nilai, dan jadwal dengan peran admin/dosen/mahasiswa.",
      achievements: ["Peran: backend & basis data (skema + REST API)"],
      link: "",
      status: "publik",
      sort_order: 2,
      photos: [
        { id: "ph3", url: ph("SIAKAD Mini", 3), caption: "Tampilan dashboard SIAKAD", is_cover: true, sort_order: 1 },
        { id: "ph4", url: ph("Tim Proyek", 4), caption: "Diskusi desain basis data", is_cover: false, sort_order: 2 }
      ]
    },
    {
      id: "exp-organisasi",
      title: "Anggota Divisi Media & Teknologi",
      organization: "Himpunan Mahasiswa Teknik Informatika ITERA",
      type: "organisasi",
      start_date: "2025-02-01",
      end_date: "",
      location: "Institut Teknologi Sumatera",
      description:
        "Mengelola situs & konten digital himpunan: website informasi kegiatan, dokumentasi acara, dan automasi pengumuman lewat grup mahasiswa.",
      achievements: ["Setup website himpunan + dokumentasi 6 kegiatan"],
      link: "",
      status: "publik",
      sort_order: 3,
      photos: [
        { id: "ph5", url: ph("Kegiatan Himpunan", 5), caption: "Dokumentasi acara teknologi", is_cover: true, sort_order: 1 }
      ]
    },
    {
      id: "exp-lomba",
      title: "Finalis Lomba Pemrograman",
      organization: "Kompetisi CP Antar-Mahasiswa",
      type: "lomba",
      start_date: "2026-03-01",
      end_date: "2026-03-02",
      location: "Online",
      description:
        "Kompetisi pemrograman kompetitif: algoritma, struktur data, problem solving 5 jam. Lolos ke babak final (top 10).",
      achievements: ["Top 10 final dari 200+ peserta"],
      link: "",
      status: "publik",
      sort_order: 4,
      photos: [
        { id: "ph6", url: ph("Final CP", 6), caption: "Babak final kompetisi", is_cover: true, sort_order: 1 }
      ]
    }
  ],
  skills: [
    { id: "sk-js", name: "JavaScript", category: "Bahasa Pemrograman", level: 4, icon: "", link_exp: "" },
    { id: "sk-py", name: "Python", category: "Bahasa Pemrograman", level: 4, icon: "", link_exp: "" },
    { id: "sk-c", name: "C", category: "Bahasa Pemrograman", level: 3, icon: "", link_exp: "" },
    { id: "sk-sql", name: "SQL", category: "Bahasa Pemrograman", level: 3, icon: "", link_exp: "" },
    { id: "sk-html", name: "HTML & CSS", category: "Bahasa Pemrograman", level: 4, icon: "", link_exp: "" },
    { id: "sk-node", name: "Node.js & Express", category: "Framework", level: 3, icon: "", link_exp: "" },
    { id: "sk-git", name: "Git & GitHub", category: "Tools", level: 4, icon: "", link_exp: "" },
    { id: "sk-vscode", name: "VS Code", category: "Tools", level: 5, icon: "", link_exp: "" },
    { id: "sk-pt", name: "Packet Tracer", category: "Tools", level: 3, icon: "", link_exp: "" },
    { id: "sk-team", name: "Kerja Tim", category: "Soft Skill", level: 4, icon: "", link_exp: "" },
    { id: "sk-time", name: "Manajemen Waktu", category: "Soft Skill", level: 4, icon: "", link_exp: "" },
    { id: "sk-engage", name: "Public Speaking", category: "Soft Skill", level: 3, icon: "", link_exp: "" }
  ],
  skill_links: [],
  projects: [
    {
      id: "pj-siakad",
      title: "SIAKAD Mini",
      summary: "Sistem informasi akademik mini: jadwal, nilai, manajemen mata kuliah. Node.js + SQLite + frontend sederhana.",
      cover_url: ph("SIAKAD Mini", 3),
      stack: ["Node.js", "Express", "SQLite"],
      demo_url: "", repo_url: "",
      status: "publik", sort_order: 1
    },
    {
      id: "pj-reminder",
      title: "Task Reminder WhatsApp",
      summary: "Pengingat tugas otomatis ke WhatsApp dengan Express, node-cron, dan Twilio API.",
      cover_url: ph("Task Reminder WA", 7),
      stack: ["Node.js", "Twilio", "node-cron"],
      demo_url: "", repo_url: "",
      status: "publik", sort_order: 2
    },
    {
      id: "pj-jarkom",
      title: "Simulasi Jaringan Packet Tracer",
      summary: "Topologi LAN/VLAN routing statis & dinamis untuk mata kuliah jaringan komputer.",
      cover_url: ph("Jaringan Komputer", 8),
      stack: ["Cisco Packet Tracer", "VLAN", "OSPF"],
      demo_url: "", repo_url: "",
      status: "publik", sort_order: 3
    }
  ],
  messages: [
    {
      id: "m1",
      name: "Budi Santoso",
      email: "budi@contoh.com",
      message: "Halo Refin, saya lihat portofolio kamu. Ada minat magang frontend semester depan? Hubungi saya ya.",
      created_at: "2026-10-20T09:30:00Z",
      read: false
    }
  ],
  auth: { email: "refin@itera.ac.id", password_hash: "" } // password default: refin124140126 (hash dibuat store.js saat load)
};
if (typeof module !== "undefined") module.exports = { SEED };

# Portfolio Refin Agus Saputra

Website portofolio dengan CMS mandiri (localStorage), tema ungu, sesuai PRD v1.0.

Tentang pemilik: Refin Agus Saputra (NIM 124140126), Mahasiswa Teknik Informatika,
Institut Teknologi Sumatera.

## Jalankan

Buka `index.html` langsung di browser, atau jalankan server statis:

```bash
npx serve .
```

## Admin (CMS)

Buka `admin.html`, login dengan:

- Email: `refin@itera.ac.id`
- Password: `refin124140126`

Di dashboard admin, Refin bisa tambah/edit/hapus pengalaman (plus foto per
pengalaman), skill, proyek, profil, serta membaca pesan dari formulir kontak —
semua tersimpan di browser (localStorage), tanpa menyentuh kode.

## Struktur

- `index.html` — Beranda (hero, pengalaman, skill, proyek)
- `tentang.html` — Tentang
- `skill.html` — Skill
- `proyek.html` — Proyek
- `pengalaman.html` — Timeline + filter + detail pengalaman
- `galeri.html` — Galeri foto + lightbox
- `kontak.html` — Formulir kontak
- `admin.html` — Dashboard CMS (login)
- `assets/css/style.css` — Design system ungu
- `assets/js/seed.js` — Data awal
- `assets/js/store.js` — Data layer localStorage
- `assets/js/app.js` — Logika situs publik
- `assets/js/admin.js` — Logika dashboard

## Catatan

Foto Contoh adalah placeholder bawaan; ganti lewat menu Media / Pengalaman di
dashboard admin.

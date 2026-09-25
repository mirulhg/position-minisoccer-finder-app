# Position & Role Finder Minisoccer

Onboarding → kuesioner gaya bermain → hasil posisi & role, plus Catat
Pertandingan, riwayat profil, dan kelola akun (Lampiran C.5 PRD, Fase 1-4).
Alur inti (onboarding→kuesioner→hasil) berjalan penuh di browser dan
tersimpan di IndexedDB tanpa perlu akun. Fitur yang butuh Supabase (login,
riwayat, sinkronisasi pertandingan) otomatis tampil "belum tersedia" kalau
kredensial belum dikonfigurasi — lihat bagian Konfigurasi di bawah. Login
sendiri saat ini masih dimatikan lewat feature flag (`ACCOUNT_LOGIN_ENABLED`
di `src/features/auth/config.ts`).

## Menjalankan proyek

```bash
npm install
npm run dev
```

Perintah lain:

- `npm run build` — type-check (`tsc -b`) lalu build produksi.
- `npm run lint` — oxlint.
- `npm run test` — jalankan test suite (`node:test` lewat `tsx`).
- `npm run preview` — pratinjau hasil build.

## Konfigurasi (opsional)

Fitur Fase 2-3 (login, riwayat, sinkronisasi Catat Pertandingan) butuh
Supabase. Salin `.env.example` ke `.env.local` lalu isi `VITE_SUPABASE_URL`
dan `VITE_SUPABASE_PUBLISHABLE_KEY`. Tanpa ini, alur Fase 1
(onboarding→kuesioner→hasil) tetap berjalan penuh.

## Dokumentasi lebih lanjut

- `Docs/CLAUDE.md` — aturan kerja untuk siapa pun (manusia atau AI) yang
  mengedit kode di repo ini.
- `Docs/PRD-Minisoccer-Position-Role-Finder.md` — spesifikasi produk
  lengkap (Lampiran C.5).
- `Docs/UI-UX-Principal.md` & `Docs/UI-Animation-Principal.md` — prinsip
  desain dan animasi yang dipakai sebagai acuan review.
- [`CHANGELOG.md`](CHANGELOG.md) — riwayat perubahan tiap fase/fitur/fix.
- [`ROADMAP.md`](ROADMAP.md) — ide dan rencana yang belum dikerjakan,
  termasuk rencana kalibrasi Fase 0.
- `plans/` — rencana perbaikan UI/animasi yang dieksekusi lewat skill
  `improve-animations`.

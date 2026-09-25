# Changelog

Position & Role Finder Minisoccer

Dokumen ini direkonstruksi dari catatan kerja Cowork/Claude yang sebelumnya
**hanya** tersimpan di project knowledge (folder `claude/` yang disebut di
banyak prompt, tidak pernah masuk git). Tujuannya supaya riwayat keputusan
ini ikut ter-*version-control* dan bisa dibaca siapa pun yang membuka repo,
bukan cuma yang punya akses ke sesi Claude ini.

Urutan: terbaru di atas. Tanggal mengikuti yang tercatat di catatan asli
(hasil verifikasi baca-kode langsung, bukan tanggal commit git yang sebenarnya
— kalau mau presisi, cocokkan dengan `git log`).

## 2026-09-24 — Perapian besar-besaran badge posisi/role & kartu profil

Rangkaian revisi cepat berdasarkan review visual Amirul terhadap hasil
"Perbaikan warna role & position" (lihat 2026-09-23):

- **RoleCard**: caption `<h3>` nama role dihapus, badge posisi+role
  dipindah naik sejajar skor.
- **Rollback**: perubahan di atas ternyata salah sasaran — yang dimaksud
  Amirul adalah kartu profil (Bagikan kartu profil), bukan `RoleCard.tsx`
  di layar Hasil. `RoleCard.tsx` dikembalikan ke struktur semula.
- **AlternativePosition**: teks nama posisi (`<h3>`) dihapus, badge
  dipindah naik menggantikannya; lalu dirapikan lagi supaya sejajar dan
  seragam gaya dengan `MainPositionHeader`.
- **MainPositionHeader**: badge diringkas jadi elemen kecil bergaya tombol
  berisi kode posisi saja (mis. "ST"); headline diganti ke nama Inggris saja
  (`POSITION_ENGLISH_NAMES`), bukan gabungan Indonesia/Inggris.
- **PositionBadge / RoleBadge**: format diringkas jadi Inggris saja — kata
  depan "posisi"/"role" dihapus, nama Indonesia di `PositionBadge` dihapus.
- **AllRolesList**: sempat diseragamkan supaya sama dengan `RoleCard`
  (menampilkan `PositionBadge` + `RoleBadge`), lalu — setelah dilihat
  hasilnya — **semua badge dihapus lagi**, dikembalikan ke teks polos.
  (Perubahan ini khusus `AllRolesList`; `RoleCard` tidak ikut disentuh.)
- **Kartu profil (Bagikan kartu profil / `profile-card-canvas.ts`)**:
  - Warna disamakan ke palet brand-ink/neutral, teks posisi diganti ke
    Inggris saja (sebelumnya masih pakai token warna legacy pra-rebrand
    dan `POSITION_NAMES` Indonesia — satu-satunya bagian yang belum
    tersentuh sepanjang rangkaian perbaikan warna/bahasa sesi ini).
  - Badge kode posisi & role berwarna ditambahkan, menyamakan gaya visual
    dengan layar Hasil.
- **RoleCard posisi alternatif via tab**: ditambahkan tab/toggle
  "Posisi Utama" / "Posisi Alternatif" di atas grid RoleCard (default aktif:
  Posisi Utama), dengan animasi transisi (`motion` + `useTransition` +
  `Suspense`) — sebelumnya posisi alternatif tidak punya RoleCard sama sekali.
- Backlog dicatat ulang: kandidat kuat untuk update berikutnya adalah
  **input identitas sederhana** (simpan hasil tanpa login) dan **versi
  Bahasa Inggris (i18n)** — lihat `ROADMAP.md`.

## 2026-09-23 — Warna role/position, loading state, revisi rebranding

- **Loading state**: skeleton (untuk konten list/card seperti riwayat) dan
  ikon bola berputar (untuk aksi sesaat: submit login, submit Catat
  Pertandingan, unduh, hapus data) — dibatasi hanya ke titik yang benar-benar
  memanggil Supabase. Aset bola reuse `public/icons/008-football.svg`
  (SVG yang sama juga dipakai sebagai icon pilar "Duel").
- **Revisi warna area posisi**: 4 hex baru per kelompok kode posisi —
  ST `#DC052D`, DM/CM/WM `#047C4C`, CB/FB `#0066B2`, GK `#E6A100`.
  Pengelompokan 7 `PositionCode` → 4 `PositionArea` (`POSITION_AREA`) tidak
  berubah. Kontras WCAG dihitung ulang: 3 dari 4 area sekarang pakai teks
  putih (Gelandang berbalik arah dari skema lama yang wajib teks gelap).
- Badge "posisi [KODE] Inggris/Indonesia" + "role [KODE] Nama" ditambahkan
  di layar Hasil (RoleCard, MainPositionHeader, AlternativePosition,
  AllRolesList) dan Riwayat & Bandingkan (HistoryScreen, ComparisonPanel).
  Istilah Inggris posisi (Striker, Center Back, dst.) adalah field baru yang
  belum ada sebelumnya di kode.
- Catatan diberikan di `prompt-rebranding-warna.md` bahwa tabel warna
  area posisi lama di dokumen itu sudah usang — 4 warna brand utama
  (Ink/Primary/Cyan/Green) tidak terpengaruh, itu sistem terpisah.

## 2026-09-22 – 2026-09-23 — Fix kebocoran sesi Supabase (pentest)

- Amirul menjalankan pentest lewat sesi Claude Code terpisah. Hasil: fondasi
  keamanan solid (RLS lengkap & benar, tidak ada IDOR, tidak ada sink XSS,
  tidak ada secret bocor, `npm audit` 0 kerentanan).
- **Satu temuan medium**: `SaveResultSection.tsx` otomatis meng-upload hasil
  kuesioner ke akun Supabase yang sedang aktif tanpa konfirmasi dan tanpa
  menampilkan sedang login sebagai siapa. Karena sesi Supabase persisten
  lintas kunjungan (terpisah dari IndexedDB app), di perangkat bersama
  (warnet/tablet keluarga) hasil kuesioner pemain baru bisa otomatis
  tersimpan ke akun pemain sebelumnya.
- **Perbaikan (3 lapis, sisi client saja)**:
  1. Auto-migrasi diubah jadi butuh konfirmasi eksplisit yang menampilkan
     email/identitas akun yang sedang login.
  2. `RestartButton` ("Mulai Ulang dari Awal") ditambah `signOut()`.
  3. Mekanisme auto-reset 30 hari (lihat 2026-09-20) ikut memanggil
     `signOut()` sebagai jaring pengaman tambahan.

## 2026-09-21 — Catatan tugas (loading state & warna role/position direncanakan)

Dua item dicatat untuk dibahas lebih lanjut dan disusun jadi prompt siap
tempel: loading state (skeleton/ball spinner) dan perbaikan warna
role/position. Keduanya rampung disusun 23 September (lihat entri di atas).

## 2026-09-20 — Icon pilar & blok kuesioner, perbaikan "jalan buntu" reset

- **Icon 5 pilar atribut** (Fisik, Teknik, Taktik, Duel, Mental) dipasang di
  layar Hasil menggunakan 10 SVG siluet yang sudah disiapkan di
  `public/icons/`.
- **Icon blok kuesioner** dipasang di layar transisi `BlockTransition`
  untuk 5 dari 6 blok (Fisik, Menyerang, Bertahan, Teknik, Mental) —
  blok "Kiper" sengaja belum diberi icon dulu; `002-speed.svg` tidak jadi
  dipakai.
- **Perbaikan "jalan buntu" reset**: sebelumnya pemain yang berhenti di
  tengah onboarding/kuesioner tidak punya jalan untuk mulai dari nol kecuali
  menyelesaikan seluruh sisa alur dulu (`RestartButton` cuma ada di layar
  Hasil). Ditambahkan: tombol reset manual di kuesioner (bukan di onboarding
  — direvisi hari yang sama setelah dilihat hasilnya, karena onboarding
  sendiri sudah "awal") dan auto-reset progres yang tidak disentuh selama
  30 hari.

## 2026-09-19 — Audit mandiri & tiga perbaikan bug

Amirul meminta audit read-only menyeluruh ("cek dan test sendiri apa yang
menjanggal"). Seluruh `src/` dibaca file per file, tiap temuan diverifikasi
dua kali sebelum dilaporkan.

- **Temuan 1 (nyata, diperbaiki)**: langkah 2 tie-breaker Tahap 6
  ("kesesuaian dengan posisi yang pernah dimainkan pemain") tidak pernah
  benar-benar di-*wire* meski data pertandingan (`matches`) sudah tersedia
  sejak Fase 3 — `TieBreakContext` tidak pernah menerima data pertandingan
  di semua call site. Diperbaiki: data riwayat pertandingan disambungkan ke
  `pickMainPosition`.
- **Temuan 2 (diperbaiki)**: jawaban "Tergantung situasi" pada pertanyaan
  trade-off ternyata tidak benar-benar netral (bobot 75/25 dengan satu
  arah). Diubah jadi 50/50.
- **Temuan 3 (didokumentasikan, tidak diimplementasikan)**: PRD menyebut
  "penilaian diri pasca-laga" sebagai "faktor kalibrasi global" tapi tidak
  pernah mendefinisikan rumusnya di bagian mana pun. Diputuskan: jangan
  mengarang rumus baru — ditandai TODO eksplisit di kode, menunggu
  kalibrasi Fase 0 (lihat `ROADMAP.md`).
- **Temuan 4**: konstanta osilasi tak terpakai dirapikan (digabung ke
  perbaikan Temuan 1, satu file yang sama).
- Diskusi referensi akademik untuk Fase 0 Kalibrasi juga dimulai tanggal
  ini — lihat `ROADMAP.md`.

## 2026-09-18 — Fix header Authorization di analytics.ts

Tiga penyebab yang menumpuk, ketiganya diperbaiki:
1. **Kode**: `src/lib/analytics.ts` mengirim publishable key Supabase lewat
   header `Authorization: Bearer`, padahal key baru (`sb_publishable_...`)
   bukan JWT dan hanya boleh lewat header `apikey`. Diperbaiki di commit
   `1095984 fix: jangan kirim publishable key lewat header Authorization di
   analytics.ts`.
2. **Skema database live kosong total** — migration `0001`–`0003` ternyata
   belum pernah diterapkan ke project Supabase yang aktif. Dijalankan
   manual lewat SQL Editor.
3. **Antrean IndexedDB lokal** (`analyticsQueue`) berisi event lama yang
   gagal terkirim, otomatis dicoba ulang tiap reload. Dibersihkan manual
   lewat DevTools.

> **Catatan proses**: setiap ada migration SQL baru, **wajib** diterapkan
> manual ke Supabase live lewat SQL Editor — commit ke repo saja tidak
> otomatis menjalankannya di database sungguhan. Ini sudah dua kali jadi
> sumber bug tersembunyi.

## 2026-09-17 — Fase 1 (MVP) terverifikasi

- Fase 1: onboarding → kuesioner gaya bermain (50 pertanyaan) → hasil
  posisi & role, berjalan penuh di browser (IndexedDB), tanpa akun/login.
- Pipeline scoring 6 tahap, konfigurasi 17 role (PRD sempat menyebut "16
  Role" di taksonomi tapi tabel bobot & gate berisi 17 baris — dipakai 17
  sesuai tabel lengkap), placeholder kalibrasi (mean=50/stdev=15,
  tinggi ~168cm SD 7cm) — semua diverifikasi langsung ke repo, bukan
  laporan lisan. `npx tsc -b --noEmit` bersih.
  Commit: "feat: bangun fase 1 position role finder minisoccer".
- Project Supabase dibuat sebagai prasyarat Fase 2.

## Fase 2 — Akun & Login, Riwayat, Kartu Profil

- Backend: Supabase (dipilih dari beberapa opsi: Supabase/Firebase/
  custom/mock).
- Auth MVP: Google OAuth + Email magic link. OTP nomor HP (FR-01 literal)
  ditunda — butuh provider SMS berbayar terpisah.
- Data lokal (IndexedDB) tetap disimpan sebagai cache offline setelah
  migrasi ke akun (ditandai `syncedAt`), tidak dihapus.
- Kartu profil digambar pakai Canvas API bawaan (bukan library baru).
- Env var Supabase memakai istilah "publishable key" (`sb_publishable_...`),
  bukan lagi "anon key" — `VITE_SUPABASE_URL` dan
  `VITE_SUPABASE_PUBLISHABLE_KEY`.

## Fase 3 — Catat Pertandingan, Blending, Confidence Tumbuh

- Fase 1 ternyata sudah menyiapkan tiga mesin inti Fase 3 secara
  forward-compatible (`blendWithMatchStats`, `computeConfidence`,
  `shouldSwitchMainPosition`) — Fase 3 murni mengintegrasikan, bukan
  menulis ulang algoritma.
- Tabel baru `matches` (migration `0003`), field baru di
  `attribute_profiles`. `attribute_profiles` tetap satu baris baru per
  rekalkulasi (INSERT, bukan UPDATE) — ini yang jadi riwayat profil.
- Notifikasi perubahan posisi: banner in-app sekali tampil (PRD menolak
  push notification penuh).
- Input pertandingan offline-first, reuse pola queue IndexedDB dari
  `analytics.ts`.

## Fase 4 — Contoh Pemain Pro, Bandingkan, Tes Ulang, Ekspor & Hapus Data

- **Bug laten ditemukan & diperbaiki**: alur retake kuesioner untuk pemain
  yang sudah login selalu memanggil jalur simpan-pertama-kali (membuang
  akumulasi statistik pertandingan/S_i), bertentangan dengan desain migration
  0003 sendiri.
- "Contoh Pemain Pro": deskripsi teks gaya main per role (bukan foto/logo
  pemain — ditolak PRD karena risiko hak cipta), reuse pola field
  `description` yang sudah ada di `ROLE_METADATA`.
- **Hapus Data**: menghapus seluruh data profil (players + attribute_profiles
  + role_scores + matches) lewat cascade + satu policy RLS DELETE baru.
  Akun login (auth.users) tetap ada — bukan penghapusan akun penuh
  (penghapusan akun sungguhan butuh Supabase Admin API/Edge Function, di
  luar pola kerja proyek saat ini; dilakukan manual oleh Amirul lewat
  Dashboard kalau diminta, PRD memberi waktu ≤30 hari).
- Retake & Bandingkan murni orkestrasi UI di atas pipeline yang sudah ada,
  tanpa algoritma baru.
- Tidak dikerjakan di fase ini: dashboard admin (FR-21), peer rating
  (FR-22), rekomendasi latihan (FR-23), perbandingan lintas-pemain
  (semuanya ditunda/ditolak — lihat `ROADMAP.md`).

## Tanpa tanggal pasti tercatat (kemungkinan besar 20–24 September 2026)

Rangkaian polish UI/animasi menggunakan library `motion` (dulu Framer
Motion), dikerjakan menyusul fitur-fitur di atas:

- Animasi staggered entrance + count-up angka untuk rincian 5 pilar
  (`PillarBreakdown`), dengan `aria-hidden` + teks `sr-only` untuk
  aksesibilitas screen reader.
- Enter-animation untuk radar 5 pilar (`PillarRadar`): grid fade-in, area
  skor "tumbuh" dari titik pusat, icon pilar fade-in + scale berurutan.
- Count-up untuk skor utama di layar Hasil.
- Enter/exit animation untuk semua dialog/modal di aplikasi.
- Expand/collapse animation untuk toggle "Ketuk untuk detail" (RoleCard/
  WhyBlock) dan untuk "Lihat semua role" (`AllRolesList` diubah dari
  `<details>` native ke state React terkontrol supaya bisa pakai animasi
  exit yang sama).
- Animasi staggered entrance + exit untuk `BlockTransition` (layar jeda
  antar-blok kuesioner), sekalian menambal `Button.tsx` yang belum punya
  tap-feedback.
- Polish interaktivitas alur kuesioner (`ChoiceCard`, `NumberStepper`,
  transisi antar-halaman) — bagian yang paling lama dilihat pemain (50
  pertanyaan).
- Dialog "Panduan & Dokumentasi" ditambahkan (dibuka lewat satu tombol di
  step "Profil Fisik" onboarding), pakai ulang pola accordion & dialog yang
  sudah ada.
- Footer kredit developer ("dev.myrules", font Alex Brush) + nomor versi
  app (dari `package.json`, font Fira Code) ditambahkan di semua tampilan.

---

*Dokumen ini disusun ulang dari catatan kerja yang sebelumnya cuma ada di
project knowledge Claude, bukan dari `git log` — kalau butuh tanggal/commit
yang presisi, cocokkan tiap entri dengan riwayat commit sungguhan. Untuk
perubahan berikutnya, sebaiknya entri baru ditambahkan langsung ke sini
setiap fitur/fix selesai, supaya tidak perlu direkonstruksi ulang lagi.*

# Roadmap

Position & Role Finder Minisoccer

Berisi ide/rencana yang **belum dikerjakan**, direkonstruksi dari catatan
backlog dan temuan audit yang sebelumnya hanya ada di project knowledge
Claude (lihat catatan di `CHANGELOG.md`). Tujuannya supaya ide-ide ini tidak
hanya "hidup di chat" dan bisa jadi acuan bersama untuk sesi kerja
berikutnya.

## Kandidat kuat untuk update berikutnya

Ditandai Amirul (24 September 2026) sebagai kemungkinan dikerjakan di update
selanjutnya — belum pasti, belum jadi prompt siap tempel, butuh pembahasan
scope lebih lanjut sebelum dieksekusi.

- **Input identitas sederhana untuk menyimpan hasil** — versi ringkas dari
  ide "simpan profil lengkap tanpa autentikasi" di bawah. Bukan "profil
  lengkap", cukup identitas sederhana (mis. nama) untuk
  menyimpan/menandai hasil kuesioner, tanpa proses login/autentikasi.
  Belum ada keputusan field apa saja yang termasuk "identitas sederhana"
  (nama saja? nama + sesuatu lain?).
- **Versi Bahasa Inggris (i18n)** — UI aplikasi saat ini seluruhnya
  Bahasa Indonesia (mis. "Rincian pilar", "Fisik", "Teknik", "Taktik",
  "Duel", "Mental"). Belum ada keputusan pendekatan i18n (library seperti
  i18next/react-intl vs. dictionary manual sederhana), default bahasa, dan
  cara switch bahasa ditampilkan ke pengguna.

## Ide tercatat, belum jadi prioritas

Dicatat supaya tidak hilang, belum ada spesifikasi teknis — perlu dibahas
detail (skema data, cakupan, keterkaitan dengan fase yang sudah ada) sebelum
dieksekusi.

- **Dashboard Mode** dengan tabel & grafik (kemungkinan riwayat skor/pilar
  pemain dari waktu ke waktu), melengkapi tampilan hasil per-sesi yang sudah
  ada (radar + rincian pilar). Belum ada keputusan sumber data (riwayat per
  pemain? agregat semua pemain?), jenis grafik, dan apakah ini halaman baru
  atau tab tambahan.
- **Simpan profil lengkap pemain tanpa autentikasi**, data masuk ke
  database. Versi yang lebih besar dari "input identitas sederhana" di
  atas. Belum ada keputusan: field apa saja yang termasuk "profil lengkap",
  cara mengidentifikasi/memisahkan data antar pemain tanpa akun (device id?
  kode unik yang digenerate?), dan implikasinya terhadap Fase 2 (Akun &
  Riwayat) — perlu dicek konsistensinya sebelum dieksekusi.
- **Tampilkan posisi alternatif di kartu profil** ("Bagikan kartu profil").
  Kartu profil sekarang cuma menampilkan satu posisi (posisi utama)
  beserta daftar top role-nya, padahal layar Hasil sudah menampilkan posisi
  alternatif berdampingan dengan posisi utama. Belum ada keputusan:
  - Posisi alternatif mana yang ditampilkan (cuma peringkat #1, atau lebih?).
  - Data apa yang ikut ditampilkan (kode+nama saja, atau skornya juga?).
  - Dampak ke layout kartu (`CARD_WIDTH`/`CARD_HEIGHT`) — kemungkinan perlu
    penyesuaian layout, bukan cuma elemen tambahan kecil.
  - Konsistensi gaya badge dengan perubahan warna/badge yang sudah berjalan
    di layar Hasil.

## Item teknis yang belum tuntas

Ditandai eksplisit sebagai TODO di kode atau di dokumen kerja — sengaja
belum diimplementasikan, bukan terlewat begitu saja.

- **"Penilaian diri pasca-laga" (faktor kalibrasi global)** — PRD menyebut
  field ini di tabel tapi tidak pernah mendefinisikan rumus apa pun untuk
  "faktor kalibrasi global" di bagian mana pun. Keputusan sadar: jangan
  mengarang rumus baru di luar scope PRD. Kolom `matches.penilaian_diri`
  tetap disimpan tapi belum dipakai — menunggu Fase 0 Kalibrasi (lihat di
  bawah) untuk menentukan rumusnya berdasarkan data nyata, bukan tebakan.
  (`src/features/matches/schema.ts`,
  `src/features/scoring/pipeline/match-stats-conversion.ts`)
- **Placeholder normalisasi kohort** — mean=50/stdev=15 untuk semua atribut
  & posisi, dan tinggi ~168cm SD 7cm untuk penyesuaian JMP/STR, masih
  seragam untuk semua orang. Diganti setelah Fase 0 Tahap C (norma kohort
  spesifik-role) punya data cukup.
  (`src/features/scoring/config/scoring-config.defaults.ts`)

## Fase 0 — Kalibrasi (berjalan menyusul, bukan mendahului MVP)

PRD menyebut Fase 0 sebagai ketergantungan kritis sebelum MVP — tapi Fase
1–4 sudah selesai duluan tanpa Fase 0 (bukan masalah besar karena bobot
scoring tersimpan di `scoring_configs`, tidak di-hardcode, jadi tetap mudah
diganti nanti). **Status: rencana sudah disusun, menunggu Amirul mulai
eksekusi Tahap A.**

Rujukan akademik: Koo & Li (2016, standar interpretasi ICC), disertasi
Subagyo Irianto (2024, UNY — jadi template struktur & metode statistik),
Manzi dkk. (2025, norma T-score spesifik per role), Álvarez-Kurogi dkk.
(2019, ekspektasi realistis akurasi kuesioner psikologis).

| Tahap | Tujuan | Kebutuhan | Estimasi waktu |
| --- | --- | --- | --- |
| **A — Validitas Isi** | Pastikan tiap item kuesioner benar-benar relevan mengukur atribut yang dituju, lewat penilaian ahli (Aiken's V) | 5 pelatih, tidak butuh pemain/data aplikasi — bisa mulai kapan saja | Paling murah, mulai duluan |
| **B — Reliabilitas Test-Retest** | Buktikan kuesioner konsisten kalau pemain sama mengisi dua kali dalam jangka pendek (ICC) | ~30 pemain amatir, isi 2x dengan jeda 1-2 minggu, target ICC ≥ 0,70 | 3-4 minggu |
| **C — Norma Kohort Spesifik-Role** | Ganti placeholder seragam dengan norma nyata, spesifik per posisi | Volume pemain sungguhan dari versi live (bukan studi terkontrol) | Tidak ada target tetap — jalan sendiri seiring pertumbuhan pengguna |

**Urutan disarankan**: Tahap A dulu (paling murah) → Tahap B menyusul
setelah item lolos Tahap A ditentukan → Tahap C jalan sendiri di latar
belakang begitu pengguna live bertambah.

Fitur **"Unduh data"** (Fase 4) bisa langsung dipakai untuk Tahap B — pemain
uji tinggal unduh datanya sendiri dua kali (setelah attempt 1 dan attempt 2)
untuk dihitung ICC-nya.

## Ditolak / ditunda secara sadar

Dicatat supaya tidak diusulkan ulang tanpa konteks kenapa sebelumnya
diputuskan begini.

| Item | Status | Alasan |
| --- | --- | --- |
| Foto/logo pemain pro asli untuk "Contoh Pemain Pro" | Ditolak | Risiko hak cipta — diganti deskripsi teks gaya main per role |
| Dashboard admin (FR-21) | Ditunda (S) | Di luar scope Fase 1-4 |
| Peer rating (FR-22) | Ditunda ke V1 | — |
| Rekomendasi latihan (FR-23) | Ditunda ke V2 | — |
| Perbandingan lintas-pemain / leaderboard | Ditolak PRD | — |
| Push notification penuh | Ditolak | Cukup banner in-app sekali tampil |
| OTP nomor HP (FR-01 literal) | Ditunda | Butuh provider SMS berbayar (Twilio dkk) — di luar auth MVP (Google OAuth + email magic link) |
| Penghapusan akun total otomatis | Ditunda | Butuh Supabase Admin API (service_role key) lewat Edge Function — infrastruktur baru di luar pola kerja proyek saat ini (masih SQL Editor manual). Kalau ada yang minta, prosesnya manual oleh Amirul lewat Supabase Dashboard (PRD memberi waktu ≤30 hari) |

---

*Dokumen ini hidup — update begitu ada keputusan baru dari sesi kerja
berikutnya, jangan biarkan ide-ide baru cuma tersimpan di chat lagi.*

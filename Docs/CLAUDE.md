# Aturan Proyek Front-End React

Dokumen ini adalah kontrak kerja. Setiap kode yang kamu tulis di repo ini harus lolos
semua aturan di bawah. Kalau ada aturan yang bertabrakan dengan permintaanku,
berhenti dan tanya — jangan diam-diam melanggar.

---

## 0. Prinsip Utama

1. **Kode yang membosankan menang.** Pilih solusi paling sederhana yang bekerja.
   Abstraksi baru harus dibayar dengan minimal 3 pemakaian nyata, bukan antisipasi.
2. **Baca sebelum menulis.** Sebelum membuat file/komponen/util baru, cari dulu apakah
   sudah ada yang serupa. Kalau ada, pakai atau perluas. Dilarang membuat duplikat.
3. **Diff kecil.** Satu tugas = satu perubahan fokus. Jangan reformat, rename, atau
   "rapikan" file yang tidak diminta.
4. **Jangan mengarang.** Kalau tidak tahu bentuk API, nama field, atau struktur data —
   berhenti dan tanya. Dilarang menebak lalu menulis mock diam-diam.
5. **Jangan menambah dependency tanpa izin.** Sebutkan nama paket, alasan, ukuran,
   dan alternatif tanpa paket. Tunggu persetujuan.
6. **Selesai berarti selesai.** Tidak ada `TODO`, `// implement later`, fungsi kosong,
   atau fitur yang cuma tampilan tanpa logika. Kalau belum bisa selesai, laporkan.

---

## 1. Struktur Folder

Feature-first, bukan type-first. Kode yang berubah bersamaan harus duduk bersamaan.

```
src/
├── app/                    # entry, router, provider global
│   ├── router.tsx
│   └── providers.tsx
├── features/               # inti aplikasi
│   └── auth/
│       ├── components/     # komponen khusus fitur ini
│       ├── hooks/
│       ├── api/            # query & mutation fitur ini
│       ├── types.ts
│       └── index.ts        # SATU-SATUNYA pintu keluar fitur
├── components/
│   ├── ui/                 # primitif tanpa logika bisnis: Button, Input, Dialog
│   └── layout/             # Header, Sidebar, PageShell
├── hooks/                  # hook lintas fitur saja
├── lib/                    # klien http, konfigurasi library pihak ketiga
├── utils/                  # fungsi murni, tanpa import React
└── types/                  # tipe yang benar-benar global
```

### Aturan keras
- **Fitur tidak boleh mengimpor internal fitur lain.** Hanya lewat `features/x/index.ts`.
  Kalau butuh saling impor dalam, berarti keduanya satu fitur — gabungkan.
- `components/ui/` haram tahu soal domain. Tidak boleh ada `<UserCard>` di sana.
- Barrel file (`index.ts`) hanya di level fitur. Jangan bikin `index.ts` di setiap folder —
  itu memperlambat build dan merusak tree-shaking.
- Kalau sebuah komponen cuma dipakai oleh satu komponen induk, taruh di sebelahnya.
  Jangan langsung naikkan ke folder global.

---

## 2. Penamaan

| Hal | Aturan | Contoh |
|---|---|---|
| File komponen | PascalCase | `UserProfile.tsx` |
| File non-komponen | kebab-case | `format-currency.ts` |
| Folder | kebab-case | `order-history/` |
| Hook | `use` + camelCase | `useOrderTotal` |
| Boolean | `is` / `has` / `can` / `should` | `isLoading`, `canEdit` |
| Handler di komponen | `handleX` | `handleSubmit` |
| Prop handler | `onX` | `onSubmit` |
| Konstanta | SCREAMING_SNAKE | `MAX_UPLOAD_SIZE` |
| Tipe/Interface | PascalCase, tanpa prefix `I` | `Order`, bukan `IOrder` |

Nama harus mendeskripsikan **maksud**, bukan bentuk teknis. `userNotifications`,
bukan `webhookPayloadArray`.

Dilarang: `data`, `item`, `temp`, `res`, `obj`, `handleClick2`, `NewButton`, `ButtonV2`,
`utils.ts` sebagai tempat sampah.

---

## 3. Komponen

### Batas ukuran
- Maksimal **150 baris** per file komponen. Lewat dari itu, pecah.
- Maksimal **3 level nesting JSX** yang bercabang kondisional. Lewat itu, ekstrak.
- Satu file = satu komponen yang diekspor. Sub-komponen kecil boleh serumah kalau
  benar-benar hanya dipakai di file itu.

### Bentuk komponen
```tsx
// Urutan wajib di dalam komponen:
// 1. hooks
// 2. derived values
// 3. handlers
// 4. early returns (loading / error / empty)
// 5. JSX utama

export function OrderSummary({ orderId, onCancel }: OrderSummaryProps) {
  const { data: order, isPending, error } = useOrder(orderId);

  const total = order ? calculateTotal(order.items) : 0;

  function handleCancel() {
    onCancel(orderId);
  }

  if (isPending) return <OrderSummarySkeleton />;
  if (error) return <ErrorState error={error} />;
  if (!order.items.length) return <EmptyOrderState />;

  return ( /* ... */ );
}
```

### Props
- Selalu ada tipe eksplisit. Nama tipe = `NamaKomponenProps`.
- **Maksimal 5 prop.** Lebih dari itu biasanya tanda komponen mengerjakan dua hal.
- Dilarang `...props` sembarangan kecuali di primitif `components/ui/`.
- Dilarang prop boolean untuk mengubah tampilan secara drastis
  (`<Card isModal isCompact isInline>`). Buat komponen terpisah atau gunakan `variant`.
- Untuk komposisi, utamakan `children` dan slot daripada prop konfigurasi berlapis.

### Yang dilarang di komponen
- Fetch langsung di dalam komponen. Bungkus jadi hook di `features/x/api/`.
- Definisi komponen di dalam komponen (bikin remount tiap render).
- Logika bisnis di JSX. Hitung dulu di atas, taruh hasilnya di variabel bernama.
- `index` sebagai `key` pada list yang bisa berubah urutan/terhapus.

---

## 4. State

Naik tangga ini secara berurutan. Jangan lompat ke atas tanpa alasan.

1. **Turunkan (derive).** Bisa dihitung dari state lain? Hitung saja saat render.
   Jangan simpan.
2. **`useState` lokal.** Default untuk hampir semua hal.
3. **Angkat ke induk terdekat.** Bukan ke global.
4. **URL / search params.** Untuk filter, tab aktif, pagination, query pencarian —
   agar bisa di-share dan di-refresh.
5. **`useReducer`.** Saat beberapa state saling terkait dan transisinya punya aturan.
6. **Context.** Hanya untuk hal yang jarang berubah: tema, sesi, locale.
   Context yang sering berubah = seluruh subtree ikut render.
7. **Store global (Zustand / Redux Toolkit).** Pilihan terakhir, untuk state klien
   yang benar-benar lintas halaman.

### Server state ≠ client state
Data dari server **wajib** dikelola library server-state (TanStack Query / RTK Query).
Dilarang menyalin respons server ke `useState` lalu menyinkronkannya manual.

### `useEffect`
Aturan default: **jangan pakai.** `useEffect` hanya untuk sinkronisasi dengan sistem
di luar React (langganan event, timer, integrasi library non-React).

Dilarang keras:
- `useEffect` untuk menghitung state turunan.
- `useEffect` untuk fetching (pakai library server-state).
- `useEffect` yang hanya memanggil `setState` dari prop.
- `useEffect` untuk mereset state saat prop berubah — pakai `key` pada komponen.

Setiap `useEffect` yang kamu tulis wajib punya komentar satu baris berisi sistem
eksternal apa yang sedang disinkronkan. Kalau tidak bisa menulis komentar itu,
berarti effect-nya tidak perlu.

---

## 5. Data & Async

- Semua panggilan jaringan lewat satu klien terpusat di `lib/api-client.ts`.
  Tidak ada `fetch()` telanjang tersebar.
- Query key terstruktur dan konsisten: `['orders', orderId]`, bukan string acak.
- **Setiap tampilan async wajib punya empat keadaan:** loading, error, empty, success.
  Kalau salah satu belum ada, komponen belum selesai.
- Loading pakai skeleton yang menyerupai bentuk konten aslinya, bukan teks "Loading...".
- Pesan error menjelaskan apa yang gagal dan apa langkah berikutnya. Tidak minta maaf,
  tidak samar. `console.log` bukan penanganan error.
- Mutasi harus menangani status pending (tombol disabled) dan invalidasi cache terkait.

---

## 6. TypeScript

- `strict: true`. Tidak ada pengecualian.
- **`any` dilarang.** Kalau tipe belum diketahui, pakai `unknown` lalu persempit.
- `as` hanya boleh untuk const assertion. Type assertion untuk membungkam error dilarang.
- Data dari luar (API, form, localStorage, env) divalidasi runtime dengan Zod,
  lalu tipenya diturunkan dari skema (`z.infer`). Jangan tulis interface ganda.
- Utamakan union sempit daripada string bebas:
  `status: 'draft' | 'sent' | 'paid'`, bukan `status: string`.
- Dilarang `@ts-ignore` tanpa komentar alasan dan nomor isu.

---

## 7. Styling

- Satu sistem styling saja untuk seluruh proyek. Tidak dicampur.
- **Semua nilai visual berasal dari token** (warna, spasi, radius, ukuran font, shadow).
  Dilarang nilai sembarang seperti `w-[347px]`, `mt-[13px]`, `#3B82F6` langsung di JSX.
  Kalau token yang dibutuhkan belum ada, tambahkan ke konfigurasi tema dulu.
- Spasi mengikuti skala 4px. Tidak ada angka ganjil.
- Class Tailwind panjang: kalau satu elemen punya >12 utility class dan berulang
  di 3 tempat, ekstrak jadi komponen — bukan jadi `@apply`.
- Mobile-first. Tulis gaya dasar untuk layar kecil, baru tambahkan breakpoint.
- Dilarang `!important` dan `z-index` acak. Definisikan skala z-index di token.
- Dilarang styling inline `style={{}}` kecuali nilainya benar-benar dinamis dari runtime.

### Larangan visual (ini penanda paling jelas kode hasil generate)
- Gradien ungu-ke-pink sebagai dekorasi default.
- `rounded-2xl` + `shadow-lg` diseragamkan ke semua elemen tanpa memandang hierarki.
- Emoji sebagai ikon di UI produksi.
- Label ALL-CAPS dengan letter-spacing lebar di atas setiap heading.
- Panah `→` ditempel di akhir teks tombol.
- Konten dipotong-potong jadi kartu identik semua.
- Animasi fade-and-slide-up di setiap section, hover transition di setiap kartu.
- Glassmorphism tanpa alasan.

Efek visual boleh ada, tapi **satu momen saja** yang menonjol. Sisanya tenang.

---

## 8. Form

- Pakai satu library form (React Hook Form) + Zod. Tidak ada form manual dengan
  belasan `useState`.
- Skema validasi hidup di `features/x/schema.ts` dan dipakai bersama oleh form dan API.
- Error tampil di bawah field terkait, terhubung lewat `aria-describedby`.
- Tombol submit disabled saat pending, teksnya berubah menjadi keadaan berjalan
  ("Menyimpan…"), lalu konsisten dengan hasilnya ("Tersimpan").
- Jangan reset form sebelum mutasi sukses.

---

## 9. Aksesibilitas (batas minimum, bukan bonus)

- Elemen semantik: `<button>` untuk aksi, `<a>` untuk navigasi. Tidak ada
  `<div onClick>`.
- Semua input punya `<label>` yang terhubung. Placeholder bukan label.
- Fokus keyboard terlihat jelas. Jangan hapus outline tanpa menggantinya.
- Kontras teks minimal 4.5:1.
- Target sentuh minimal 44×44px.
- Gambar bermakna punya `alt`; gambar dekoratif `alt=""`.
- Modal: fokus terkunci di dalam, `Esc` menutup, fokus kembali ke pemicu.
- Hormati `prefers-reduced-motion`.

---

## 10. Performa

Optimalkan hanya setelah ada bukti. Tapi hindari kesalahan struktural sejak awal:

- Route dipecah dengan lazy loading. Komponen berat (editor, chart, peta) juga.
- Jangan `memo`/`useMemo`/`useCallback` sebagai kebiasaan. Pakai kalau ada masalah
  terukur, dan sebutkan alasannya di komentar.
- List panjang (>100 item) pakai virtualisasi.
- Gambar: format modern, `width`/`height` eksplisit untuk cegah layout shift,
  `loading="lazy"` untuk yang di bawah lipatan.
- Jangan impor seluruh library untuk satu fungsi.

---

## 11. Komentar & Dokumentasi

- Komentar menjelaskan **kenapa**, bukan **apa**.
  Buruk: `// set loading ke true`
  Baik: `// API mengembalikan 202 lalu polling; tunggu status final sebelum invalidasi`
- Dilarang komentar hiasan (`// ===== SECTION =====`), banner ASCII, atau komentar
  yang mengulang nama fungsi.
- Dilarang JSDoc yang cuma menuliskan ulang tipe TypeScript.
- README diperbarui hanya kalau cara menjalankan proyek berubah.

---

## 12. Git

- Conventional commits: `feat:`, `fix:`, `refactor:`, `chore:`, `docs:`, `test:`.
- Subjek maksimal 72 karakter, kalimat perintah, huruf kecil.
- Satu commit = satu perubahan logis. Jangan campur refactor dengan fitur.
- Dilarang menyebut AI di pesan commit.

---

## 13. Larangan Spesifik (katalog AI-slop)

Kode dianggap gagal review kalau mengandung:

- File komponen 400 baris berisi state, fetch, tipe, helper, dan JSX sekaligus.
- Data dummy hardcoded di dalam komponen tanpa diminta.
- Wrapper yang tidak menambah apa pun (`<MyButton>` yang cuma meneruskan props ke `<button>`).
- Folder atau abstraksi untuk kebutuhan yang belum ada.
- `useState` untuk nilai yang bisa dihitung dari state lain.
- `try/catch` yang menelan error tanpa menampilkan apa pun ke pengguna.
- Penanganan error generik "Something went wrong" untuk semua kasus.
- Nama variabel berakhiran angka (`data2`, `handleSubmit3`).
- Kode mati, import tak terpakai, atau state yang tidak pernah dibaca.
- Menulis ulang file yang sudah ada padahal cukup mengubah beberapa baris.
- Menambahkan library untuk hal yang bisa diselesaikan 10 baris kode.
- Fitur yang tidak diminta ("aku sekalian tambahkan dark mode ya").

---

## 14. Definition of Done

Sebelum melaporkan tugas selesai, verifikasi sendiri:

- [ ] `tsc --noEmit` bersih
- [ ] Lint bersih, tanpa disable komentar baru
- [ ] Tidak ada `any`, `console.log`, atau `TODO` yang tertinggal
- [ ] Empat keadaan async lengkap (loading / error / empty / success)
- [ ] Bisa dioperasikan penuh dengan keyboard
- [ ] Rapi di lebar 375px dan 1440px
- [ ] Tidak ada nilai visual sembarang di luar token
- [ ] Tidak ada file/dependency baru yang tidak disepakati
- [ ] Diff hanya menyentuh yang relevan dengan tugas

---

## 15. Cara Kerja Denganku

- **Rencana dulu.** Untuk tugas menyentuh >2 file, tulis rencana singkat
  (file apa, kenapa) dan tunggu persetujuan sebelum menulis kode.
- **Laporkan, bukan tebak.** Kalau ada ambiguitas, ajukan pertanyaan konkret
  dengan opsi yang jelas — bukan asumsi diam-diam.
- **Sebutkan pelanggaran.** Kalau kamu terpaksa melanggar aturan di dokumen ini,
  katakan aturan mana dan kenapa.
- **Jangan menjilat.** Kalau permintaanku buruk secara teknis, bilang, sertakan
  alasannya, lalu tawarkan alternatif.
- **Ringkasan akhir maksimal 5 baris.** Sebutkan apa yang berubah dan apa yang
  perlu kuperiksa. Tanpa perayaan, tanpa emoji.

---

## 16. Pembagian Peran: Cowork & Claude Code

Proyek ini dikerjakan lewat dua asisten dengan peran yang **tidak boleh tercampur**.
Ini bukan preferensi gaya kerja, tapi kontrak: agar Amirul bisa mengikuti dan
memahami setiap tahapan, bukan menerima kode sebagai kotak hitam.

### Cowork — analisis & perencanaan, TIDAK menyentuh kode

- Menganalisis kebutuhan, kondisi proyek saat ini, dan dokumen terkait (PRD,
  CLAUDE.md ini, hasil test sebelumnya).
- Membuat **laporan singkat**: apa yang perlu dikerjakan, urutan prioritas,
  bagian yang berisiko atau ambigu.
- Memberi **penilaian eksplisit**: mana pendekatan yang baik untuk proyek ini,
  mana yang sebaiknya dihindari, dan kenapa — bukan cuma daftar opsi netral.
- Menyusun **prompt siap-pakai** untuk Claude Code: jelas, spesifik, menyebut
  file/fitur yang relevan, dan konsisten dengan aturan di dokumen ini.
  Cowork tidak menulis, mengedit, atau menjalankan kode di repo ini — bahkan
  untuk "contoh singkat" atau "sekalian saja".
- Menyertakan **ekspektasi hasil test** setiap kali memberi prompt: apa yang
  seharusnya terjadi kalau implementasinya benar, dan apa yang jadi tanda kalau
  ada yang salah. Ini supaya Amirul tahu apa yang harus dicek saat mencoba
  hasilnya sendiri, bukan sekadar "sudah selesai, coba saja".

### Claude Code — satu-satunya yang menyentuh kode

- Menerima prompt yang diteruskan Amirul dari Cowork.
- Membuat/mengubah file, menjalankan perintah, dan mengimplementasikan sesuai
  aturan teknis di dokumen ini (struktur folder, state, TypeScript, styling, dst).
- Kalau prompt dari Cowork ambigu atau bertabrakan dengan aturan di dokumen ini,
  berhenti dan tanya balik — sesuai Prinsip Utama #4 dan Bagian 15.

### Alur kerja

1. Amirul minta sesuatu ke Cowork.
2. Cowork menganalisis → memberi laporan singkat (temuan, rekomendasi, risiko).
3. Cowork menyusun prompt lengkap untuk Claude Code.
4. Amirul menyalin prompt tersebut ke Claude Code dan menjalankannya.
5. Cowork menyebutkan hasil yang diharapkan dan apa yang perlu ditest Amirul.
6. Amirul melaporkan hasil test balik ke Cowork bila perlu evaluasi atau
   iterasi lanjutan.

### Kenapa dipisah begini

Supaya Amirul mengikuti setiap tahapan dan paham alasannya, dan supaya ada
tahap evaluasi rencana **sebelum** kode ditulis — bukan hanya audit setelahnya.

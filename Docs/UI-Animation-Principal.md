---
name: ui-animation-principal
description: Prinsip motion/animation design pada UI web dan aplikasi dari sumber-sumber yang paling sering dijadikan rujukan industri — 12 Prinsip Animasi Disney (Thomas & Johnston), Val Head (Designing Interface Animation), Rachel Nabors (Animation at Work), Google Material Design Motion Guidelines, Issara Willenskomer (UX in Motion), Pasquale D'Silva (Animation Principles for the Web), dan Emil Kowalski (animations.dev, Sonner, Vaul — praktik implementasi animasi modern di CSS/JS/React). Gunakan skill ini setiap kali diminta menjelaskan, mengevaluasi, atau memberi rekomendasi soal animasi/transisi UI — termasuk saat diminta "review animasi ini", "kenapa transisi ini terasa kaku", "berapa durasi animasi yang pas", memilih easing curve, merancang micro-interaction, page transition, loading state, spring animation, gesture-driven UI, atau membahas motion design dan prefers-reduced-motion secara umum.
---

# UI Animation Principal — Rujukan Prinsip Animasi dari Para Ahli

Skill ini adalah rangkuman kerja dari prinsip motion design UI yang paling banyak dikutip di industri. Gunakan sebagai kerangka acuan saat menjelaskan konsep, meninjau animasi/transisi, atau memberi rekomendasi — bukan pengganti penilaian kontekstual terhadap kebutuhan produk yang sedang dibahas.

## Kapan menggunakan skill ini
- Menjelaskan atau mengajarkan konsep motion design
- Meninjau/mengkritik animasi, transisi, atau micro-interaction yang sudah ada
- Menjawab "kenapa animasi ini terasa kaku/mengganggu/lambat"
- Memberi rekomendasi durasi, easing, atau urutan animasi (choreography)
- Menulis atau meninjau kode CSS/JS animasi (transition, keyframes, spring, dsb.)

## 1. 12 Prinsip Animasi Disney — Thomas & Johnston (The Illusion of Life)
Fondasi hampir semua panduan motion UI modern.

| Prinsip | Inti |
|---|---|
| Easing (slow in/out) | Gerakan alami dimulai pelan, cepat di tengah, lalu melambat lagi — bukan linear. |
| Anticipation | Beri ancang-ancang kecil sebelum aksi utama agar tidak mengejutkan pengguna. |
| Follow through & overlap | Elemen tidak berhenti bersamaan; bagian yang menempel bergerak sedikit lebih lama. |
| Arcs | Gerakan alami mengikuti lintasan lengkung, bukan garis lurus kaku. |
| Staging | Arahkan perhatian pengguna ke satu hal penting dalam satu waktu. |
| Timing | Durasi gerakan menentukan kesan berat/ringan suatu elemen. |
| Exaggeration | Sedikit dilebihkan agar perubahan terasa jelas tanpa berlebihan. |

## 2. Val Head — Designing Interface Animation
- **Punya tujuan** — setiap gerakan menjawab: apa yang berubah, ke mana, dan mengapa.
- **Choreography** — urutan animasi (mana yang muncul duluan) membentuk hierarki visual.
- **Duration kontekstual** — elemen kecil bergerak singkat; elemen besar butuh durasi sedikit lebih lama.

## 3. Rachel Nabors — Animation at Work
- **Hubungan spasial** — animasi menunjukkan dari mana elemen muncul dan ke mana ia pergi.
- **Mengurangi beban kognitif** — transisi halus membantu otak melacak perubahan state.
- **Feedback langsung** — animasi mengonfirmasi bahwa input pengguna diterima sistem.

## 4. Google Material Design — Motion Guidelines
- **Informative** — motion menjelaskan apa yang terjadi, bukan sekadar mempercantik.
- **Focused** — mengarahkan perhatian, bukan mengalihkannya.
- **Expressive** — punya karakter selaras brand, tetap fungsional.
- **Standard easing curves** — kurva easing konsisten dipakai berulang agar produk terasa kohesif.

## 5. Issara Willenskomer — UX in Motion (12 Principles for UI Animation)
- **Parenting** — elemen "anak" bergerak mengikuti elemen "induk" agar hierarki terlihat jelas (contoh: sub-menu mengikuti arah menu utama).
- **Transformation** — objek yang berubah bentuk/posisi terasa lebih mulus jika morphing, bukan langsung hilang-muncul.

## 6. Pasquale D'Silva — Animation Principles for the Web
- **Terasa seperti fisika nyata** — gunakan easing, bukan linear, agar terasa hidup.
- **Jangan animasikan semuanya** — animasi berlebihan merusak kepercayaan pengguna pada kecepatan dan kejelasan produk.

## 7. Emil Kowalski — animations.dev, Sonner, Vaul
Design engineer, pembuat library Sonner & Vaul, penulis kursus *animations.dev* dan tulisan *"Great Animations"*. Suaranya lebih kontemporer dan berbasis praktik implementasi (CSS/JS/React) dibanding sumber-sumber teori di atas — kontribusi khasnya adalah soal *restraint*: tahu kapan sebuah elemen **tidak** perlu dianimasikan sama sekali.

- **Restraint** — interaksi berfrekuensi tinggi (mengetik, scroll) dan aksi yang dipicu keyboard sebaiknya tidak dianimasikan.
- **Durasi lebih pendek dari kebanyakan sumber lain** — animasi UI idealnya di bawah 300ms; 180ms sering terasa lebih responsif daripada 400ms.
- **Easing kuat, bukan bawaan browser** — hindari `ease`/`ease-in-out` default CSS yang lemah, gunakan custom cubic-bezier atau spring physics.
- **Animasikan `transform` dan `opacity` saja** — hindari menganimasikan properti layout (`width`, `height`, `top`, `left`) karena mahal secara performa dan bisa terasa patah-patah.
- **Transform-origin mengikuti sumber pemicu** — misalnya dropdown/menu harus muncul dari arah tombol yang mengekliknya, bukan dari tengah layar.
- **Interruptible** — jika pengguna berinteraksi lagi di tengah animasi, transisi harus bisa dibatalkan/diarahkan ulang secara natural, bukan menunggu animasi lama selesai.

## Checklist Praktis (diulang di semua sumber)
- **Durasi ideal**: 200–300ms untuk transisi kecil (Kowalski bahkan menyarankan 180ms untuk kontrol UI umum agar terasa responsif); di atas 300–500ms mulai terasa lambat, di bawah 100ms nyaris tidak terlihat.
- **Easing > linear**: gerakan linear terasa "robotic"; gunakan ease-in-out, custom cubic-bezier, atau spring — hindari easing bawaan browser yang lemah.
- **Utamakan `transform` dan `opacity`**: hindari menganimasikan properti layout (`width`, `height`, `top`, `left`) untuk performa dan kehalusan.
- **Motion sebagai fungsi, bukan dekorasi**: jika animasi dihilangkan, pengguna seharusnya tetap paham apa yang terjadi.
- **Tahu kapan tidak animasi**: interaksi berfrekuensi tinggi atau aksi via keyboard sebaiknya instan, tanpa animasi.
- **Hormati `prefers-reduced-motion`**: sediakan versi animasi minimal/tanpa gerakan untuk pengguna yang sensitif terhadap motion (standar aksesibilitas W3C).

## Cara memakai saat memberi feedback
Kaitkan temuan spesifik ke prinsip yang relevan, alih-alih menyebut prinsip secara abstrak. Contoh pola:

> "Modal ini muncul dan hilang secara instan tanpa easing — terasa kaku (melanggar prinsip Easing/Disney). Tambahkan transisi 250ms dengan ease-out saat muncul dan ease-in saat menutup."

> "Sub-menu ini tidak mengikuti arah tombol pemicunya (melanggar prinsip Parenting — Willenskomer). Animasikan agar muncul dari posisi tombol, bukan dari tengah layar."

> "Shortcut keyboard ini memicu transisi 300ms sebelum aksinya jalan — menurut prinsip restraint Kowalski, aksi via keyboard sebaiknya instan tanpa animasi supaya terasa responsif."

Prioritaskan prinsip yang paling relevan dengan konteks yang dibahas; tidak semua prinsip perlu disebut di setiap review.

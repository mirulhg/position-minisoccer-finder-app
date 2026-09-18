# Verifikasi RLS — dijalankan manual oleh Amirul

Tidak bisa dijalankan dari sandbox pengembangan ini karena belum ada project
Supabase hidup (kredensial ada di `.env.local` milik Amirul). Langkah di
bawah memakai REST API asli lewat `curl` dengan anon key + JWT sungguhan —
jalur akses yang sama persis dengan yang dipakai aplikasi, bukan simulasi
lewat SQL Editor (yang berjalan sebagai `postgres`/owner dan bisa melewati
RLS secara tidak sengaja kalau salah setup).

## 1. Siapkan dua akun uji

Jalankan app (`npm run dev`), selesaikan alur onboarding→kuesioner→hasil dua
kali di dua sesi/browser berbeda (mis. satu normal, satu private window),
login dengan dua email berbeda (Pemain A dan Pemain B), lalu klik
**"Simpan hasil ini"** di masing-masing supaya migrasi ke Supabase berjalan.

## 2. Ambil access token tiap pemain

Di console DevTools browser masing-masing sesi (setelah login):

```js
const { data } = await window.supabase?.auth.getSession()
  ?? (await import('/src/lib/supabase.ts')).supabase.auth.getSession();
console.log(data.session.access_token);
```

Atau lebih mudah: buka Application → Local Storage di DevTools, cari key
`sb-<project-ref>-auth-token`, salin field `access_token`.

## 3. Ambil id profil Pemain A

Di Supabase Studio → Table Editor → `attribute_profiles`, cari baris milik
Pemain A (kolom `player_id` = uid Pemain A), salin `id`-nya.

## 4. Coba baca profil Pemain A memakai token Pemain B

```bash
curl -s "$VITE_SUPABASE_URL/rest/v1/attribute_profiles?id=eq.<PROFILE_A_ID>" \
  -H "apikey: $VITE_SUPABASE_PUBLISHABLE_KEY" \
  -H "Authorization: Bearer <PLAYER_B_ACCESS_TOKEN>"
```

**Harus mengembalikan `[]`** (array kosong). Kalau baris Pemain A ikut
muncul, policy `attribute_profiles select own` bocor — cek ulang migrasi
`0001_init.sql` sudah benar-benar dijalankan dan RLS aktif
(`select relrowsecurity from pg_class where relname = 'attribute_profiles';`
harus `true`).

## 5. Coba tulis role_scores ke profil Pemain A memakai token Pemain B

```bash
curl -s -X POST "$VITE_SUPABASE_URL/rest/v1/role_scores" \
  -H "apikey: $VITE_SUPABASE_PUBLISHABLE_KEY" \
  -H "Authorization: Bearer <PLAYER_B_ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"profile_id": "<PROFILE_A_ID>", "role_code": "CB-ST", "base": 50, "gate": 1, "fit": 50}'
```

**Harus gagal** (HTTP 401/403, atau body berisi pesan kebijakan RLS
ditolak) — bukan `201 Created`.

## 6. Sebagai pembanding, ulangi langkah 4 dengan token Pemain A sendiri

```bash
curl -s "$VITE_SUPABASE_URL/rest/v1/attribute_profiles?id=eq.<PROFILE_A_ID>" \
  -H "apikey: $VITE_SUPABASE_PUBLISHABLE_KEY" \
  -H "Authorization: Bearer <PLAYER_A_ACCESS_TOKEN>"
```

Ini **harus mengembalikan baris profilnya sendiri** — membuktikan policy
tidak mengunci semua akses, hanya akses lintas-pengguna.

## 7. (Fase 3) Tabel `matches` — jalankan `0003_matches_and_profile_history.sql` dulu

Pastikan migrasi `0003` sudah diterapkan sebelum langkah ini (tabel `matches`
harus ada). Pakai token Pemain A dan Pemain B dari langkah 1-2.

### 7a. Pemain A mencatat satu pertandingan

```bash
curl -s -X POST "$VITE_SUPABASE_URL/rest/v1/matches" \
  -H "apikey: $VITE_SUPABASE_PUBLISHABLE_KEY" \
  -H "Authorization: Bearer <PLAYER_A_ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d '{"menit_bermain": 40, "posisi_dimainkan": "CM", "tekel_berhasil": 3}'
```

**Harus `201 Created`** dan mengembalikan baris dengan `player_id` = uid
Pemain A (server mengisi `player_id` dari `with check (player_id = auth.uid())`
— kalau kamu kirim `player_id` pemain lain di body, insert-nya tetap ditolak
karena `with check` memeriksa nilai yang benar-benar disimpan). Salin `id`
baris ini sebagai `<MATCH_A_ID>`.

### 7b. Pemain B mencoba membaca pertandingan Pemain A

```bash
curl -s "$VITE_SUPABASE_URL/rest/v1/matches?id=eq.<MATCH_A_ID>" \
  -H "apikey: $VITE_SUPABASE_PUBLISHABLE_KEY" \
  -H "Authorization: Bearer <PLAYER_B_ACCESS_TOKEN>"
```

**Harus mengembalikan `[]`**.

### 7c. Pemain B mencoba menyisipkan pertandingan atas nama Pemain A

```bash
curl -s -X POST "$VITE_SUPABASE_URL/rest/v1/matches" \
  -H "apikey: $VITE_SUPABASE_PUBLISHABLE_KEY" \
  -H "Authorization: Bearer <PLAYER_B_ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"player_id": "<UID_PLAYER_A>", "menit_bermain": 40, "posisi_dimainkan": "ST", "gol": 5}'
```

**Harus gagal** (403, kebijakan `matches insert own` menolak karena
`player_id` yang dikirim ≠ `auth.uid()` token Pemain B).

### 7d. Pemain B mencoba menghapus pertandingan Pemain A

```bash
curl -s -X DELETE "$VITE_SUPABASE_URL/rest/v1/matches?id=eq.<MATCH_A_ID>" \
  -H "apikey: $VITE_SUPABASE_PUBLISHABLE_KEY" \
  -H "Authorization: Bearer <PLAYER_B_ACCESS_TOKEN>"
```

**Harus tidak menghapus apa pun** (`204` tapi 0 baris terpengaruh — cek lagi
dengan token Pemain A bahwa baris `<MATCH_A_ID>` masih ada).

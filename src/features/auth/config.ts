/**
 * Feature flag sementara — nonaktifkan pintu masuk login/pembuatan akun
 * baru dulu sampai keamanan RLS dan alur akun lebih matang untuk dipakai
 * publik. Sesi yang SUDAH ada (mis. untuk testing lokal) tetap jalan
 * normal — ini cuma menyembunyikan tombol "Simpan hasil ini" untuk
 * pengguna baru yang belum login. Ganti ke `true` kapan saja untuk
 * mengaktifkan kembali, tidak perlu ubah kode lain.
 */
export const ACCOUNT_LOGIN_ENABLED = false;

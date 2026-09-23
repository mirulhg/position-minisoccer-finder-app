export interface SaveResultDecisionInput {
  /** Ada sesi Supabase aktif di perangkat ini — TIDAK berarti otomatis boleh migrasi, lihat komentar di bawah. */
  hasSession: boolean;
  /** Pemain sudah menekan "Ya, simpan ke akun ini" secara eksplisit untuk sesi Hasil ini. */
  hasConfirmed: boolean;
}

export type SaveResultAction = 'show-confirmation' | 'run-migration' | 'none';

/**
 * Perbaikan temuan pentest (kebocoran sesi Supabase, September 2026): sesi
 * `persistSession` bertahan lintas kunjungan browser — di perangkat
 * bersama, pemain baru yang belum login bisa hasil kuesionernya ter-upload
 * diam-diam ke akun pemain sebelumnya kalau migrasi jalan otomatis hanya
 * karena sesi terdeteksi. Aturannya sekarang: migrasi (`run-migration`)
 * HANYA boleh kalau ADA sesi aktif DAN pemain sudah konfirmasi eksplisit —
 * tidak pernah otomatis. Dipisah jadi fungsi murni (bukan logic inline di
 * JSX SaveResultSection.tsx) supaya bisa dites lewat `node:test` yang sudah
 * ada di proyek ini tanpa menambah dependency testing-library/jsdom baru.
 * JANGAN ubah aturan ini supaya "otomatis" lagi tanpa sadar konteksnya.
 */
export function decideSaveResultAction({ hasSession, hasConfirmed }: SaveResultDecisionInput): SaveResultAction {
  if (!hasSession) return 'none';
  return hasConfirmed ? 'run-migration' : 'show-confirmation';
}

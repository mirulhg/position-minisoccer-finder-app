// Jaring pengaman: progres onboarding/kuesioner yang ditinggal terlalu lama
// dianggap basi dan dibersihkan otomatis saat aplikasi dibuka lagi, supaya
// pemain tidak "terjebak" melanjutkan sesi yang mungkin sudah tidak relevan.
export const STALE_PROGRESS_MS = 30 * 24 * 60 * 60 * 1000;

export function isProgressStale(lastActivityAt: number | undefined, now: number): boolean {
  if (lastActivityAt === undefined) return false;
  return now - lastActivityAt > STALE_PROGRESS_MS;
}

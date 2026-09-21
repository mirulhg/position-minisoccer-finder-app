/**
 * Footer app-wide — dipasang sekali di root (`src/App.tsx`), muncul di
 * semua tampilan lewat satu titik, bukan ditempel manual per-screen.
 * Sengaja tidak muncul di layar transisi sesaat (mis. BlockTransition) —
 * cukup di level tampilan/halaman utama.
 */
export function AppFooter() {
  return (
    <footer className="flex items-baseline justify-center gap-2 border-t border-neutral-200 px-4 py-3 text-xs text-neutral-500">
      <span>Developed by</span>
      {/* Font script butuh ukuran sedikit lebih besar dari teks sekitarnya (text-xs) supaya tetap terbaca jelas. */}
      <span className="font-script text-sm text-neutral-600">dev.myrules</span>
      <span aria-hidden="true" className="text-neutral-300">
        ·
      </span>
      <span className="font-mono text-neutral-500">v{__APP_VERSION__}</span>
    </footer>
  );
}

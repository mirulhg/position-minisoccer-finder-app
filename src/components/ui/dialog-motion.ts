import type { Transition } from 'motion/react';

/**
 * Nilai animasi enter/exit bersama untuk pola "confirm inline" di aplikasi
 * ini (RestartButton, AccountScreen, SaveResultSection) — bukan overlay/
 * modal (tidak ada backdrop, tidak `position: fixed`), tapi tetap butuh
 * transisi masuk/keluar yang konsisten saat konten di tempatnya berganti.
 */
export const DIALOG_TRANSITION: Transition = { duration: 0.22, ease: 'easeOut' };

export const DIALOG_HIDDEN = { opacity: 0, scale: 0.95, y: 8 };
export const DIALOG_VISIBLE = { opacity: 1, scale: 1, y: 0 };

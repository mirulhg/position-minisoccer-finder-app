import type { Transition } from 'motion/react';

/**
 * Nilai animasi expand/collapse bersama untuk toggle "Ketuk untuk detail"
 * (RoleCard, WhyBlock) — beda dari dialog-motion.ts (fade+scale+geser untuk
 * konten yang mengganti tempat), ini accordion: tinggi 0↔auto + opacity.
 */
export const COLLAPSIBLE_TRANSITION: Transition = { duration: 0.28, ease: 'easeInOut' };
export const CHEVRON_TRANSITION: Transition = { duration: 0.2, ease: 'easeInOut' };

export const COLLAPSIBLE_HIDDEN = { height: 0, opacity: 0 };
export const COLLAPSIBLE_VISIBLE = { height: 'auto', opacity: 1 };

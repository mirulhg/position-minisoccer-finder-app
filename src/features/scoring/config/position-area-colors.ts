import type { PositionCode } from '../types';

export type PositionArea = 'Penyerang' | 'Gelandang' | 'Bek' | 'Kiper';

/**
 * 7 `PositionCode` dikelompokkan ke 4 area posisi — pemetaan ini sebelumnya
 * hanya tersirat lewat teks `POSITION_NAMES` (mis. "Bek Tengah", "Gelandang
 * Sayap"), belum pernah jadi field/config eksplisit di kode manapun.
 */
export const POSITION_AREA: Record<PositionCode, PositionArea> = {
  GK: 'Kiper',
  CB: 'Bek',
  FB: 'Bek',
  DM: 'Gelandang',
  CM: 'Gelandang',
  WM: 'Gelandang',
  ST: 'Penyerang',
};

export interface PositionAreaColor {
  bg: string;
  /** Warna teks di atas `bg` — dipasangkan manual per area, kontrasnya sudah dicek (jangan ditukar). */
  text: string;
}

/**
 * Warna badge per area posisi — dipakai `PositionBadge`/`RoleBadge`
 * (src/components/ui/). Pasangan teks dicek manual terhadap WCAG AA teks
 * normal (≥4.5:1): putih untuk Penyerang (5.1:1), Gelandang (5.3:1), dan
 * Bek (5.9:1) — brand-ink di ketiganya gagal (±2.9–3.3:1). Kiper satu-
 * satunya yang wajib teks gelap ('#38003C' = brand-ink, 7.7:1) karena putih
 * gagal total di sana (2.2:1). JANGAN ditukar pasangannya.
 */
export const POSITION_AREA_COLORS: Record<PositionArea, PositionAreaColor> = {
  Penyerang: { bg: '#DC052D', text: '#FFFFFF' },
  Gelandang: { bg: '#047C4C', text: '#FFFFFF' },
  Bek: { bg: '#0066B2', text: '#FFFFFF' },
  Kiper: { bg: '#E6A100', text: '#38003C' },
};

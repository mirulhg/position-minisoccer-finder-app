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
 * Warna badge/aksen per area posisi (rebrand, lihat
 * prompt-fix-audit-temuan-19sept.md di project Cowork) — BELUM dipakai di
 * UI manapun saat file ini ditambahkan: tidak ada badge/tag kelompok posisi
 * yang sudah ada di kode (RoleCard/AllRolesList/MainPositionHeader/
 * AlternativePosition/PitchTap semuanya menampilkan nama posisi sebagai
 * teks polos, tanpa badge berwarna per area) — lihat laporan pengerjaan.
 * Disiapkan supaya siap dipakai begitu ada keputusan UI terpisah untuk
 * menampilkannya, tanpa perlu redefinisi warna nanti. Teks gelap di sini
 * ('#38003C') adalah brand-ink — dipasangkan ke Gelandang/Kiper karena
 * teks putih gagal kontras di kedua warna itu; JANGAN ditukar pasangannya.
 */
export const POSITION_AREA_COLORS: Record<PositionArea, PositionAreaColor> = {
  Penyerang: { bg: '#E63946', text: '#FFFFFF' },
  Gelandang: { bg: '#F4A261', text: '#38003C' },
  Bek: { bg: '#1D3557', text: '#FFFFFF' },
  Kiper: { bg: '#2EC4B6', text: '#38003C' },
};

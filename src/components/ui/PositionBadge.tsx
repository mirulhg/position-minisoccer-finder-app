import type { ReactNode } from 'react';
import {
  POSITION_AREA,
  POSITION_AREA_COLORS,
  POSITION_ENGLISH_NAMES,
  type PositionCode,
} from '../../features/scoring';

interface AreaBadgeProps {
  position: PositionCode;
  children: ReactNode;
}

/**
 * Chip dasar berwarna area posisi — dipakai bersama `PositionBadge` dan
 * `RoleBadge` supaya tampil konsisten saat berdampingan. Warna lewat inline
 * style karena nilainya datang dari config runtime `POSITION_AREA_COLORS`,
 * bukan token Tailwind.
 */
export function AreaBadge({ position, children }: AreaBadgeProps) {
  const color = POSITION_AREA_COLORS[POSITION_AREA[position]];

  return (
    <span
      className="inline-block max-w-full rounded-full px-3 py-1 text-xs font-medium"
      style={{ backgroundColor: color.bg, color: color.text }}
    >
      {children}
    </span>
  );
}

interface PositionBadgeProps {
  position: PositionCode;
}

export function PositionBadge({ position }: PositionBadgeProps) {
  return (
    <AreaBadge position={position}>
      [{position}] {POSITION_ENGLISH_NAMES[position]}
    </AreaBadge>
  );
}

interface PositionCodeBadgeProps {
  position: PositionCode;
}

/**
 * Varian ringkas `AreaBadge` — hanya kode posisi (mis. "ST"), bergaya tombol
 * (rounded-lg, bukan pill teks panjang) untuk dipasang di sebelah headline
 * besar. Reuse warna area yang sama, markup terpisah dari `PositionBadge`.
 */
export function PositionCodeBadge({ position }: PositionCodeBadgeProps) {
  const color = POSITION_AREA_COLORS[POSITION_AREA[position]];

  return (
    <span
      className="inline-block rounded-lg px-4 py-1.5 text-sm font-bold"
      style={{ backgroundColor: color.bg, color: color.text }}
    >
      {position}
    </span>
  );
}

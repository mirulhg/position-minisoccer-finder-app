import { useReducedMotion } from 'motion/react';

type BallSpinnerSize = 'sm' | 'md';

interface BallSpinnerProps {
  size?: BallSpinnerSize;
  className?: string;
}

const SIZE_CLASSES: Record<BallSpinnerSize, string> = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
};

/**
 * Indikator loading untuk aksi tombol yang menunggu Supabase. Memakai ulang
 * ikon pilar "Duel" (siluet hitam) apa adanya — aksen brand diberikan lewat
 * cakram putih + ring cyan di wrapper, bukan dengan mengubah file SVG-nya.
 * Teks sr-only jadi label sesungguhnya; ikonnya murni dekoratif.
 */
export function BallSpinner({ size = 'sm', className = '' }: BallSpinnerProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <span role="status" className={`inline-flex shrink-0 items-center ${className}`}>
      <span className="inline-flex rounded-full bg-white p-0.5 ring-2 ring-brand-cyan">
        <img
          src="/icons/008-football.svg"
          alt=""
          aria-hidden="true"
          className={`${SIZE_CLASSES[size]} ${shouldReduceMotion ? '' : 'animate-spin'}`}
        />
      </span>
      <span className="sr-only">Memuat...</span>
    </span>
  );
}

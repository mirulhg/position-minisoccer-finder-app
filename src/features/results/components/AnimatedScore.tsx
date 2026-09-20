import { useEffect } from 'react';
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from 'motion/react';

interface AnimatedScoreProps {
  value: number;
  /** Durasi count-up dalam detik — default 0.8s (rincian pilar). Skor yang lebih menonjol/penting boleh sedikit lebih lama. */
  duration?: number;
}

/**
 * Angka ini berubah-ubah selama animasi count-up — `aria-hidden` di sini,
 * pembaca layar membaca nilai final lewat elemen `sr-only` terpisah di
 * pemanggil (lihat PillarBreakdown.tsx, MainPositionHeader.tsx, RoleCard.tsx,
 * AlternativePosition.tsx).
 */
export function AnimatedScore({ value, duration = 0.8 }: AnimatedScoreProps) {
  const shouldReduceMotion = useReducedMotion();
  const motionValue = useMotionValue(0);
  const rounded = useTransform(motionValue, (latest) => Math.round(latest));

  useEffect(() => {
    if (shouldReduceMotion) {
      motionValue.set(value);
      return;
    }
    const controls = animate(motionValue, value, { duration, ease: 'easeOut' });
    return controls.stop;
  }, [value, duration, motionValue, shouldReduceMotion]);

  return <motion.span aria-hidden="true">{rounded}</motion.span>;
}

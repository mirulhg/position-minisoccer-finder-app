import { motion, useReducedMotion } from 'motion/react';
import { PILLARS, type Pillar } from '../../scoring';
import { PILLAR_ICON_PATHS } from '../config/pillar-icons';

interface PillarRadarProps {
  values: Record<Pillar, number>;
}

const SIZE = 280;
const CENTER = SIZE / 2;
const MAX_RADIUS = CENTER - 48;
const RING_COUNT = 4;
const ICON_SIZE = 26;
const LABEL_ANCHOR_RADIUS = MAX_RADIUS + 20;

// SVG tidak bisa memakai class Tailwind untuk atribut paint; nilai di bawah
// disalin dari token warna di tailwind.config.ts (neutral-200, brand-green —
// dipakai sebagai fill/tint+stroke dekoratif, BUKAN warna teks, sesuai
// batasan brand-green di tailwind.config.ts).
const GRID_COLOR = '#e2e1de';
const FILL_COLOR = '#00FF85';
const STROKE_COLOR = '#00FF85';

function pointFor(index: number, radius: number): [number, number] {
  const angle = -Math.PI / 2 + (index * 2 * Math.PI) / PILLARS.length;
  return [CENTER + radius * Math.cos(angle), CENTER + radius * Math.sin(angle)];
}

function polygonPoints(radiusByIndex: number[]): string {
  return radiusByIndex.map((radius, index) => pointFor(index, radius).join(',')).join(' ');
}

// Titik mulai animasi bentuk data & icon — sesudah grid selesai fade-in.
// Interval stagger icon disamakan dengan PillarBreakdown.tsx (0.08s per baris).
const SHAPE_DELAY = 0.15;
const ICON_STAGGER_INTERVAL = 0.08;

/** Radar 5 pilar — SVG buatan tangan, tanpa library chart (PRD Lampiran C.6). */
export function PillarRadar({ values }: PillarRadarProps) {
  const shouldReduceMotion = useReducedMotion();
  const valueRadii = PILLARS.map((pillar) => (Math.max(0, Math.min(100, values[pillar])) / 100) * MAX_RADIUS);

  return (
    <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="w-full max-w-xs" role="img" aria-label="Radar lima pilar atribut">
      <motion.g
        initial={shouldReduceMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      >
        {Array.from({ length: RING_COUNT }, (_, ringIndex) => {
          const radius = (MAX_RADIUS * (ringIndex + 1)) / RING_COUNT;
          return (
            <polygon
              key={ringIndex}
              points={polygonPoints(PILLARS.map(() => radius))}
              fill="none"
              stroke={GRID_COLOR}
            />
          );
        })}

        {PILLARS.map((_, index) => {
          const [x, y] = pointFor(index, MAX_RADIUS);
          return <line key={index} x1={CENTER} y1={CENTER} x2={x} y2={y} stroke={GRID_COLOR} />;
        })}
      </motion.g>

      <motion.polygon
        points={polygonPoints(valueRadii)}
        fill={FILL_COLOR}
        fillOpacity={0.25}
        stroke={STROKE_COLOR}
        strokeWidth={2}
        style={{ transformBox: 'view-box', transformOrigin: `${CENTER}px ${CENTER}px` }}
        initial={shouldReduceMotion ? false : { scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.7, ease: 'easeOut', delay: SHAPE_DELAY }}
      />

      {PILLARS.map((pillar, index) => {
        const [anchorX, anchorY] = pointFor(index, LABEL_ANCHOR_RADIUS);
        return (
          <motion.image
            key={pillar}
            href={PILLAR_ICON_PATHS[pillar]}
            x={anchorX - ICON_SIZE / 2}
            y={anchorY - ICON_SIZE / 2}
            width={ICON_SIZE}
            height={ICON_SIZE}
            style={{ transformBox: 'view-box', transformOrigin: `${anchorX}px ${anchorY}px` }}
            initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35, ease: 'easeOut', delay: SHAPE_DELAY + index * ICON_STAGGER_INTERVAL }}
          >
            <title>
              {pillar} ({Math.round(values[pillar])})
            </title>
          </motion.image>
        );
      })}
    </svg>
  );
}

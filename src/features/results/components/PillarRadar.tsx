import { PILLARS, type Pillar } from '../../scoring';

interface PillarRadarProps {
  values: Record<Pillar, number>;
}

const SIZE = 280;
const CENTER = SIZE / 2;
const MAX_RADIUS = CENTER - 48;
const RING_COUNT = 4;

// SVG tidak bisa memakai class Tailwind untuk atribut paint; nilai di bawah
// disalin dari token warna di tailwind.config.ts (primary-500/600, neutral-200).
const GRID_COLOR = '#e2e1de';
const FILL_COLOR = '#3a9142';
const STROKE_COLOR = '#2c7433';

function pointFor(index: number, radius: number): [number, number] {
  const angle = -Math.PI / 2 + (index * 2 * Math.PI) / PILLARS.length;
  return [CENTER + radius * Math.cos(angle), CENTER + radius * Math.sin(angle)];
}

function polygonPoints(radiusByIndex: number[]): string {
  return radiusByIndex.map((radius, index) => pointFor(index, radius).join(',')).join(' ');
}

/** Radar 5 pilar — SVG buatan tangan, tanpa library chart (PRD Lampiran C.6). */
export function PillarRadar({ values }: PillarRadarProps) {
  const valueRadii = PILLARS.map((pillar) => (Math.max(0, Math.min(100, values[pillar])) / 100) * MAX_RADIUS);

  return (
    <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="w-full max-w-xs" role="img" aria-label="Radar lima pilar atribut">
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

      <polygon
        points={polygonPoints(valueRadii)}
        fill={FILL_COLOR}
        fillOpacity={0.25}
        stroke={STROKE_COLOR}
        strokeWidth={2}
      />

      {PILLARS.map((pillar, index) => {
        const [labelX, labelY] = pointFor(index, MAX_RADIUS + 24);
        return (
          <text
            key={pillar}
            x={labelX}
            y={labelY}
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-neutral-600 text-[11px]"
          >
            {pillar} ({Math.round(values[pillar])})
          </text>
        );
      })}
    </svg>
  );
}

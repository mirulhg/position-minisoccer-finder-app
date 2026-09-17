import { POSITION_NAMES, type PositionCode } from '../../../features/scoring';

interface PitchTapProps {
  selected: PositionCode | null;
  onSelect: (position: PositionCode) => void;
}

interface PitchButtonProps {
  position: PositionCode;
  selected: boolean;
  onSelect: (position: PositionCode) => void;
}

function PitchButton({ position, selected, onSelect }: PitchButtonProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(position)}
      aria-pressed={selected}
      className={`min-h-touch min-w-touch flex flex-col items-center justify-center rounded-sm border-2 px-3 py-2 text-xs font-medium transition-colors ${
        selected
          ? 'border-white bg-white text-primary-800'
          : 'border-white/60 bg-primary-700/40 text-white hover:bg-primary-700/70'
      }`}
    >
      <span className="text-sm font-semibold">{position}</span>
      <span className="text-[10px] leading-tight">{POSITION_NAMES[position]}</span>
    </button>
  );
}

/** Ilustrasi lapangan sederhana yang bisa ditap untuk memilih posisi biasa. */
export function PitchTap({ selected, onSelect }: PitchTapProps) {
  return (
    <div
      className="relative flex aspect-3/4 flex-col justify-between gap-3 rounded-md bg-primary-600 p-4"
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-4 border-2 border-white/40" />
      <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/40" />

      <div className="relative flex justify-center">
        <PitchButton position="ST" selected={selected === 'ST'} onSelect={onSelect} />
      </div>
      <div className="relative flex justify-center gap-3">
        <PitchButton position="WM" selected={selected === 'WM'} onSelect={onSelect} />
        <PitchButton position="CM" selected={selected === 'CM'} onSelect={onSelect} />
        <PitchButton position="WM" selected={selected === 'WM'} onSelect={onSelect} />
      </div>
      <div className="relative flex justify-center">
        <PitchButton position="DM" selected={selected === 'DM'} onSelect={onSelect} />
      </div>
      <div className="relative flex justify-center gap-3">
        <PitchButton position="FB" selected={selected === 'FB'} onSelect={onSelect} />
        <PitchButton position="CB" selected={selected === 'CB'} onSelect={onSelect} />
        <PitchButton position="FB" selected={selected === 'FB'} onSelect={onSelect} />
      </div>
      <div className="relative flex justify-center">
        <PitchButton position="GK" selected={selected === 'GK'} onSelect={onSelect} />
      </div>
    </div>
  );
}

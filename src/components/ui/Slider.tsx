interface SliderProps {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit: string;
  onChange: (value: number) => void;
  errorId?: string;
}

export function Slider({ id, label, value, min, max, step = 1, unit, onChange, errorId }: SliderProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between">
        <label htmlFor={id} className="text-sm font-medium text-neutral-700">
          {label}
        </label>
        <span className="text-2xl font-semibold text-neutral-900">
          {value}
          <span className="ml-1 text-sm font-normal text-neutral-500">{unit}</span>
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        aria-describedby={errorId}
        className="h-11 w-full cursor-pointer accent-brand-primary"
      />
    </div>
  );
}

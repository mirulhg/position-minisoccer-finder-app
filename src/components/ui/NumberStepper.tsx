interface NumberStepperProps {
  label: string;
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
}

export function NumberStepper({ label, value, min = 0, max = 20, onChange }: NumberStepperProps) {
  function handleDecrease() {
    onChange(Math.max(min, value - 1));
  }

  function handleIncrease() {
    onChange(Math.min(max, value + 1));
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <p className="text-center text-base text-neutral-700">{label}</p>
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={handleDecrease}
          disabled={value <= min}
          aria-label="Kurangi"
          className="min-h-touch min-w-touch flex items-center justify-center rounded-full border border-neutral-300 text-2xl text-neutral-700 disabled:text-neutral-300"
        >
          −
        </button>
        <span className="w-16 text-center text-4xl font-semibold text-neutral-900" aria-live="polite">
          {value}
        </span>
        <button
          type="button"
          onClick={handleIncrease}
          disabled={value >= max}
          aria-label="Tambah"
          className="min-h-touch min-w-touch flex items-center justify-center rounded-full border border-neutral-300 text-2xl text-neutral-700 disabled:text-neutral-300"
        >
          +
        </button>
      </div>
    </div>
  );
}

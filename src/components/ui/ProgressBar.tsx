interface ProgressBarProps {
  /** 0-100. */
  percent: number;
  label: string;
}

export function ProgressBar({ percent, label }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, percent));

  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(clamped)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-200"
    >
      <div
        className="h-full rounded-full bg-primary-600 transition-[width] duration-200"
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}

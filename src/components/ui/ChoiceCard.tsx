import type { ReactNode } from 'react';

interface ChoiceCardProps {
  selected: boolean;
  onSelect: () => void;
  children: ReactNode;
}

export function ChoiceCard({ selected, onSelect, children }: ChoiceCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`min-h-touch w-full rounded-md border px-4 py-4 text-left text-base transition-colors ${
        selected
          ? 'border-primary-600 bg-primary-50 text-primary-800 font-medium'
          : 'border-neutral-200 bg-white text-neutral-700 hover:border-primary-300'
      }`}
    >
      {children}
    </button>
  );
}

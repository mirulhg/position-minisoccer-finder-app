import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
  errorId?: string;
}

export function Input({ label, id, errorId, className = '', ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-medium text-neutral-700">
        {label}
      </label>
      <input
        id={id}
        aria-describedby={errorId}
        className={`min-h-touch rounded-md border border-neutral-300 px-3 text-base text-neutral-900 focus-visible:border-primary-500 ${className}`}
        {...props}
      />
    </div>
  );
}

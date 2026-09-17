import type { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  children: ReactNode;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: 'bg-primary-600 text-white hover:bg-primary-700 disabled:bg-neutral-300',
  secondary: 'bg-white text-primary-700 border border-primary-300 hover:bg-primary-50 disabled:text-neutral-400 disabled:border-neutral-200',
  ghost: 'bg-transparent text-neutral-600 hover:bg-neutral-100 disabled:text-neutral-300',
};

export function Button({ variant = 'primary', className = '', children, ...props }: ButtonProps) {
  return (
    <button
      type="button"
      className={`min-h-touch min-w-touch inline-flex items-center justify-center gap-2 rounded-md px-5 py-3 text-base font-medium transition-colors disabled:cursor-not-allowed ${VARIANT_CLASSES[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

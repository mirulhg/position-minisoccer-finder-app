import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { motion, useReducedMotion, type Transition } from 'motion/react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';

// `motion.button` redefines drag/animation event handlers with its own
// gesture-related signatures — Omit here keeps `ButtonProps` compatible with
// both `ButtonHTMLAttributes` (for plain DOM props like `disabled`/`form`)
// and `motion.button`'s prop types, same conflict as any HTML-attrs spread
// onto a motion component.
type NativeButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'onDrag' | 'onDragStart' | 'onDragEnd' | 'onAnimationStart' | 'onAnimationEnd' | 'onAnimationIteration'
>;

interface ButtonProps extends NativeButtonProps {
  variant?: ButtonVariant;
  children: ReactNode;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: 'bg-brand-ink text-white hover:bg-brand-primary disabled:bg-neutral-300',
  secondary: 'bg-white text-brand-ink border border-brand-ink hover:bg-brand-primary/8 disabled:text-neutral-400 disabled:border-neutral-200',
  ghost: 'bg-transparent text-neutral-600 hover:bg-neutral-100 disabled:text-neutral-300',
};

const TAP_TRANSITION: Transition = { duration: 0.1 };

export function Button({ variant = 'primary', className = '', children, ...props }: ButtonProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.button
      type="button"
      whileTap={shouldReduceMotion ? undefined : { scale: 0.97 }}
      transition={TAP_TRANSITION}
      className={`min-h-touch min-w-touch inline-flex items-center justify-center gap-2 rounded-md px-5 py-3 text-base font-medium transition-colors disabled:cursor-not-allowed ${VARIANT_CLASSES[variant]} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
}

import type { ReactNode } from 'react';
import { AnimatePresence, motion, useReducedMotion, type Transition } from 'motion/react';

interface ChoiceCardProps {
  selected: boolean;
  onSelect: () => void;
  children: ReactNode;
}

const TAP_TRANSITION: Transition = { duration: 0.1 };
const INDICATOR_TRANSITION: Transition = { duration: 0.15, ease: 'easeOut' };

export function ChoiceCard({ selected, onSelect, children }: ChoiceCardProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
      transition={TAP_TRANSITION}
      className={`min-h-touch w-full rounded-md px-4 py-4 text-left text-base transition-colors ${
        selected
          ? 'border-2 border-brand-primary bg-brand-primary/8 text-brand-ink font-medium'
          : 'border border-neutral-200 bg-white text-neutral-700 hover:border-brand-primary/50'
      }`}
    >
      <span className="flex items-center justify-between gap-3">
        <span>{children}</span>
        <AnimatePresence initial={false}>
          {selected && (
            <motion.span
              aria-hidden="true"
              initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={shouldReduceMotion ? undefined : { opacity: 0, scale: 0.5 }}
              transition={INDICATOR_TRANSITION}
              className="h-3 w-3 shrink-0 rounded-full bg-brand-primary"
            />
          )}
        </AnimatePresence>
      </span>
    </motion.button>
  );
}

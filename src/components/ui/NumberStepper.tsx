import { motion, useReducedMotion, type Transition } from 'motion/react';

interface NumberStepperProps {
  label: string;
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
}

const BUTTON_TAP_TRANSITION: Transition = { duration: 0.1 };
const VALUE_PULSE_TRANSITION: Transition = { duration: 0.15, ease: 'easeOut' };

export function NumberStepper({ label, value, min = 0, max = 20, onChange }: NumberStepperProps) {
  const shouldReduceMotion = useReducedMotion();

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
        <motion.button
          type="button"
          onClick={handleDecrease}
          disabled={value <= min}
          aria-label="Kurangi"
          whileTap={shouldReduceMotion ? undefined : { scale: 0.9 }}
          transition={BUTTON_TAP_TRANSITION}
          className="min-h-touch min-w-touch flex items-center justify-center rounded-full border border-neutral-300 text-2xl text-neutral-700 disabled:text-neutral-300"
        >
          −
        </motion.button>
        <span className="w-16 text-center text-4xl font-semibold text-neutral-900" aria-live="polite">
          <motion.span
            key={value}
            initial={shouldReduceMotion ? false : { scale: 1.15 }}
            animate={{ scale: 1 }}
            transition={VALUE_PULSE_TRANSITION}
            style={{ display: 'inline-block' }}
          >
            {value}
          </motion.span>
        </span>
        <motion.button
          type="button"
          onClick={handleIncrease}
          disabled={value >= max}
          aria-label="Tambah"
          whileTap={shouldReduceMotion ? undefined : { scale: 0.9 }}
          transition={BUTTON_TAP_TRANSITION}
          className="min-h-touch min-w-touch flex items-center justify-center rounded-full border border-neutral-300 text-2xl text-neutral-700 disabled:text-neutral-300"
        >
          +
        </motion.button>
      </div>
    </div>
  );
}

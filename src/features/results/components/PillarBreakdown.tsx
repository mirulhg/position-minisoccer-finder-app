import { motion, useReducedMotion, type Variants } from 'motion/react';
import { Card } from '../../../components/ui/Card';
import { PILLARS, type Pillar } from '../../scoring';
import { PILLAR_ICON_PATHS } from '../config/pillar-icons';
import { AnimatedScore } from './AnimatedScore';

interface PillarBreakdownProps {
  values: Record<Pillar, number>;
}

const container: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const item: Variants = {
  hidden: { opacity: 0, x: -8 },
  show: { opacity: 1, x: 0, transition: { duration: 0.35, ease: 'easeOut' } },
};

export function PillarBreakdown({ values }: PillarBreakdownProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <Card>
      <h3 className="text-base font-semibold text-neutral-900">Rincian pilar</h3>
      <motion.ul
        className="mt-3 flex flex-col gap-3"
        variants={container}
        initial={shouldReduceMotion ? 'show' : 'hidden'}
        animate="show"
      >
        {PILLARS.map((pillar) => {
          const score = Math.round(values[pillar]);
          return (
            <motion.li key={pillar} className="flex justify-between text-sm text-neutral-700" variants={item}>
              <span className="flex items-center gap-2">
                <img src={PILLAR_ICON_PATHS[pillar]} alt={pillar} className="h-6 w-6" />
                {pillar}
              </span>
              <span className="font-medium">
                <AnimatedScore value={score} />
                <span className="sr-only">{score}</span>
              </span>
            </motion.li>
          );
        })}
      </motion.ul>
    </Card>
  );
}

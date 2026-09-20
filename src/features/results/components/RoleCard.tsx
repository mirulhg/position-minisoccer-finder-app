import { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Card } from '../../../components/ui/Card';
import {
  CHEVRON_TRANSITION,
  COLLAPSIBLE_HIDDEN,
  COLLAPSIBLE_TRANSITION,
  COLLAPSIBLE_VISIBLE,
} from '../../../components/ui/collapsible-motion';
import { ROLE_METADATA, type RoleScore } from '../../scoring';
import { AnimatedScore } from './AnimatedScore';

interface RoleCardProps {
  roleScore: RoleScore;
}

export function RoleCard({ roleScore }: RoleCardProps) {
  const metadata = ROLE_METADATA[roleScore.role];
  const fit = Math.round(roleScore.fit);
  const [isExpanded, setIsExpanded] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  return (
    <Card>
      <div className="flex items-baseline justify-between gap-2">
        <h3 className="text-base font-semibold text-neutral-900">{metadata.name}</h3>
        <span className="text-lg font-semibold text-primary-700">
          <AnimatedScore value={fit} />
          <span className="sr-only">{fit}</span>
        </span>
      </div>
      <p className="mt-1 text-sm text-neutral-600">{metadata.description}</p>

      <button
        type="button"
        onClick={() => setIsExpanded((prev) => !prev)}
        aria-expanded={isExpanded}
        className="mt-2 flex items-center gap-1 text-xs font-medium text-neutral-500 hover:text-neutral-700"
      >
        {isExpanded ? 'Sembunyikan detail' : 'Ketuk untuk detail'}
        <motion.span animate={{ rotate: isExpanded ? 180 : 0 }} transition={CHEVRON_TRANSITION} aria-hidden="true">
          ▾
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            key="role-detail"
            style={{ overflow: 'hidden' }}
            initial={shouldReduceMotion ? false : COLLAPSIBLE_HIDDEN}
            animate={COLLAPSIBLE_VISIBLE}
            exit={shouldReduceMotion ? undefined : COLLAPSIBLE_HIDDEN}
            transition={COLLAPSIBLE_TRANSITION}
          >
            <p className="mt-2 text-xs text-neutral-500">
              <span className="font-medium text-neutral-600">Gaya main mirip:</span> {metadata.proExample}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

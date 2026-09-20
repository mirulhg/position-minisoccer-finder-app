import { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Card } from '../../../components/ui/Card';
import {
  CHEVRON_TRANSITION,
  COLLAPSIBLE_HIDDEN,
  COLLAPSIBLE_TRANSITION,
  COLLAPSIBLE_VISIBLE,
} from '../../../components/ui/collapsible-motion';
import { ATTRIBUTE_LABELS, rankAttributesDescending, type AttributeVector } from '../../scoring';

interface WhyBlockProps {
  attributes: AttributeVector;
}

export function WhyBlock({ attributes }: WhyBlockProps) {
  const entries = rankAttributesDescending(attributes);
  const strongest = entries.slice(0, 3);
  const weakest = entries.slice(-2).reverse();
  const [isExpanded, setIsExpanded] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  return (
    <Card>
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-base font-semibold text-neutral-900">Kenapa rekomendasi ini?</h3>
        <button
          type="button"
          onClick={() => setIsExpanded((prev) => !prev)}
          aria-expanded={isExpanded}
          className="flex items-center gap-1 text-xs font-medium text-neutral-500 hover:text-neutral-700"
        >
          {isExpanded ? 'Sembunyikan detail' : 'Ketuk untuk detail'}
          <motion.span animate={{ rotate: isExpanded ? 180 : 0 }} transition={CHEVRON_TRANSITION} aria-hidden="true">
            ▾
          </motion.span>
        </button>
      </div>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            key="why-detail"
            style={{ overflow: 'hidden' }}
            initial={shouldReduceMotion ? false : COLLAPSIBLE_HIDDEN}
            animate={COLLAPSIBLE_VISIBLE}
            exit={shouldReduceMotion ? undefined : COLLAPSIBLE_HIDDEN}
            transition={COLLAPSIBLE_TRANSITION}
          >
            <div className="mt-3 flex flex-col gap-3">
              <div>
                <p className="text-sm font-medium text-primary-700">Kekuatan utama</p>
                <ul className="mt-1 flex flex-col gap-1">
                  {strongest.map(([attribute, value]) => (
                    <li key={attribute} className="flex justify-between text-sm text-neutral-700">
                      <span>{ATTRIBUTE_LABELS[attribute]}</span>
                      <span className="font-medium">{Math.round(value)}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-sm font-medium text-danger-600">Perlu diperhatikan</p>
                <ul className="mt-1 flex flex-col gap-1">
                  {weakest.map(([attribute, value]) => (
                    <li key={attribute} className="flex justify-between text-sm text-neutral-700">
                      <span>{ATTRIBUTE_LABELS[attribute]}</span>
                      <span className="font-medium">{Math.round(value)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

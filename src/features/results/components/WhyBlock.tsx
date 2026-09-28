import { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Card } from '../../../components/ui/Card';
import {
  CHEVRON_TRANSITION,
  COLLAPSIBLE_HIDDEN,
  COLLAPSIBLE_TRANSITION,
  COLLAPSIBLE_VISIBLE,
} from '../../../components/ui/collapsible-motion';
import { useTranslation } from '../../../i18n';
import { rankAttributesDescending, type AttributeVector } from '../../scoring';
import { AttributeLabel } from './AttributeLabel';

interface WhyBlockProps {
  attributes: AttributeVector;
}

export function WhyBlock({ attributes }: WhyBlockProps) {
  const { t } = useTranslation();
  const entries = rankAttributesDescending(attributes);
  const strongest = entries.slice(0, 3);
  const weakest = entries.slice(-2).reverse();
  const [isExpanded, setIsExpanded] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  return (
    <Card>
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-base font-semibold text-neutral-900">{t.results.whyBlock.title}</h3>
        <button
          type="button"
          onClick={() => setIsExpanded((prev) => !prev)}
          aria-expanded={isExpanded}
          className="flex items-center gap-1 text-xs font-medium text-neutral-500 hover:text-neutral-700"
        >
          {isExpanded ? t.results.whyBlock.hideDetail : t.results.whyBlock.showDetail}
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
                <p className="text-sm font-medium text-brand-ink">{t.results.whyBlock.strengths}</p>
                <ul className="mt-1 flex flex-col gap-1">
                  {strongest.map(([attribute, value]) => (
                    <li key={attribute} className="flex justify-between text-sm text-neutral-700">
                      <span>
                        <AttributeLabel code={attribute} />
                      </span>
                      <span className="font-medium">{Math.round(value)}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-sm font-medium text-danger-600">{t.results.whyBlock.watchFor}</p>
                <ul className="mt-1 flex flex-col gap-1">
                  {weakest.map(([attribute, value]) => (
                    <li key={attribute} className="flex justify-between text-sm text-neutral-700">
                      <span>
                        <AttributeLabel code={attribute} />
                      </span>
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

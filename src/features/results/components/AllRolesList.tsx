import { useId, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import {
  CHEVRON_TRANSITION,
  COLLAPSIBLE_HIDDEN,
  COLLAPSIBLE_TRANSITION,
  COLLAPSIBLE_VISIBLE,
} from '../../../components/ui/collapsible-motion';
import { ROLE_METADATA, type RoleScore } from '../../scoring';

interface AllRolesListProps {
  roleScores: RoleScore[];
}

function LockIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      className="h-4 w-4 shrink-0"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="4.5" y="9" width="11" height="7.5" rx="1.5" />
      <path d="M7 9V6.5a3 3 0 0 1 6 0V9" />
    </svg>
  );
}

/**
 * FR-13 — semua role beserta skornya, terurut menurun, role terkunci gate
 * ditandai. Daftar sekunder, jadi disembunyikan di balik toggle supaya tidak
 * mengalihkan perhatian dari hasil utama (aesthetic-minimalist). Dulu pakai
 * `<details>/<summary>` native (otomatis full keyboard-accessible tanpa JS
 * tambahan), sekarang diganti state React + AnimatePresence supaya animasi
 * expand/collapse-nya sama persis dengan toggle "Ketuk untuk detail" di
 * RoleCard/WhyBlock (`<details>` tidak bisa dianimasikan exit-nya lewat
 * Motion — buka/tutupnya dikontrol browser, bukan unmount React).
 */
export function AllRolesList({ roleScores }: AllRolesListProps) {
  const sorted = [...roleScores].sort((a, b) => b.fit - a.fit);
  const [isExpanded, setIsExpanded] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const listId = useId();

  return (
    <div className="rounded-md border border-neutral-200 bg-white">
      <button
        type="button"
        onClick={() => setIsExpanded((prev) => !prev)}
        aria-expanded={isExpanded}
        aria-controls={listId}
        className="flex min-h-touch w-full items-center gap-1 rounded-md px-4 py-3 text-sm font-medium text-neutral-700"
      >
        Lihat semua role
        <motion.span animate={{ rotate: isExpanded ? 90 : 0 }} transition={CHEVRON_TRANSITION} aria-hidden="true">
          ▸
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            key="all-roles-detail"
            id={listId}
            style={{ overflow: 'hidden' }}
            initial={shouldReduceMotion ? false : COLLAPSIBLE_HIDDEN}
            animate={COLLAPSIBLE_VISIBLE}
            exit={shouldReduceMotion ? undefined : COLLAPSIBLE_HIDDEN}
            transition={COLLAPSIBLE_TRANSITION}
          >
            <ul className="flex flex-col divide-y divide-neutral-100 border-t border-neutral-200">
              {sorted.map((score) => {
                const metadata = ROLE_METADATA[score.role];
                const isLocked = score.gate < 1;

                return (
                  <li key={score.role} className="flex min-h-touch items-center justify-between gap-3 px-4 py-3">
                    <span className="text-sm font-medium text-neutral-800">{metadata.name}</span>
                    <div className="flex items-center gap-2">
                      {isLocked && (
                        <span className="flex items-center gap-1 rounded-full bg-neutral-100 px-2 py-1 text-xs font-medium text-neutral-600">
                          <LockIcon />
                          Syarat belum terpenuhi
                        </span>
                      )}
                      <span className="text-sm font-semibold text-neutral-900">{Math.round(score.fit)}</span>
                    </div>
                  </li>
                );
              })}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

import { Suspense, useState, useTransition } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Card } from '../../../components/ui/Card';
import { DIALOG_HIDDEN, DIALOG_TRANSITION, DIALOG_VISIBLE } from '../../../components/ui/dialog-motion';
import type { RoleScore } from '../../scoring';
import { RoleCard } from './RoleCard';

type PositionTab = 'main' | 'alternative';

interface RoleTabsSectionProps {
  mainRoles: RoleScore[];
  alternativeRoles: RoleScore[];
  hasAlternative: boolean;
}

const ROLE_GRID_CLASSNAME = 'grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6';

function RoleCardGrid({ roles }: { roles: RoleScore[] }) {
  if (roles.length === 0) {
    return <p className="text-sm text-neutral-500">Belum ada role kandidat untuk posisi ini.</p>;
  }

  return (
    <div className={ROLE_GRID_CLASSNAME}>
      {roles.map((roleScore) => (
        <RoleCard key={roleScore.role} roleScore={roleScore} />
      ))}
    </div>
  );
}

/** Placeholder Suspense — meniru bentuk `RoleCard` (badge + skor + deskripsi). */
function RoleCardSkeleton() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className={`${ROLE_GRID_CLASSNAME} ${shouldReduceMotion ? '' : 'animate-pulse'}`} role="status">
      <span className="sr-only">Memuat role…</span>
      {Array.from({ length: 2 }, (_, index) => (
        <Card key={index}>
          <div className="flex items-baseline justify-between gap-2">
            <div className="h-4 w-24 rounded-xs bg-neutral-200" />
            <div className="h-5 w-8 rounded-xs bg-neutral-200" />
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            <div className="h-6 w-16 rounded-full bg-neutral-200" />
            <div className="h-6 w-28 rounded-full bg-neutral-200" />
          </div>
          <div className="mt-2 h-4 w-full rounded-xs bg-neutral-200" />
          <div className="mt-1 h-4 w-2/3 rounded-xs bg-neutral-200" />
        </Card>
      ))}
    </div>
  );
}

interface TabButtonProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
}

function TabButton({ label, isActive, onClick }: TabButtonProps) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      onClick={onClick}
      className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
        isActive ? 'bg-brand-ink text-white' : 'text-neutral-500 hover:text-neutral-700'
      }`}
    >
      {label}
    </button>
  );
}

/**
 * Tab "Posisi Utama" / "Posisi Alternatif" di atas grid RoleCard — kalau
 * tidak ada posisi alternatif (`hasAlternative` false), tab disembunyikan
 * dan grid role posisi utama tampil apa adanya seperti sebelum tab ini ada.
 */
export function RoleTabsSection({ mainRoles, alternativeRoles, hasAlternative }: RoleTabsSectionProps) {
  const [activeTab, setActiveTab] = useState<PositionTab>('main');
  const [isPending, startTransition] = useTransition();
  const shouldReduceMotion = useReducedMotion();

  if (!hasAlternative) {
    return <RoleCardGrid roles={mainRoles} />;
  }

  function selectTab(tab: PositionTab) {
    startTransition(() => setActiveTab(tab));
  }

  const activeRoles = activeTab === 'main' ? mainRoles : alternativeRoles;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-center">
        <div role="tablist" className="inline-flex gap-1 rounded-full bg-neutral-100 p-1">
          <TabButton label="Posisi Utama" isActive={activeTab === 'main'} onClick={() => selectTab('main')} />
          <TabButton
            label="Posisi Alternatif"
            isActive={activeTab === 'alternative'}
            onClick={() => selectTab('alternative')}
          />
        </div>
      </div>

      <Suspense fallback={<RoleCardSkeleton />}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={shouldReduceMotion ? false : DIALOG_HIDDEN}
            animate={DIALOG_VISIBLE}
            exit={shouldReduceMotion ? undefined : DIALOG_HIDDEN}
            transition={DIALOG_TRANSITION}
            style={{ opacity: isPending ? 0.6 : 1 }}
          >
            <RoleCardGrid roles={activeRoles} />
          </motion.div>
        </AnimatePresence>
      </Suspense>
    </div>
  );
}

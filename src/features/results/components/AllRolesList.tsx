import { ROLE_METADATA, POSITION_NAMES, type RoleScore } from '../../scoring';

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
 * ditandai. Daftar sekunder, jadi disembunyikan di balik `<details>` supaya
 * tidak mengalihkan perhatian dari hasil utama (aesthetic-minimalist).
 * `<details>/<summary>` dipakai karena sudah bisa dioperasikan penuh lewat
 * keyboard (Enter/Space) tanpa JS tambahan.
 */
export function AllRolesList({ roleScores }: AllRolesListProps) {
  const sorted = [...roleScores].sort((a, b) => b.fit - a.fit);

  return (
    <details className="rounded-md border border-neutral-200 bg-white">
      <summary className="min-h-touch cursor-pointer rounded-md px-4 py-3 text-sm font-medium text-neutral-700">
        Lihat semua role
      </summary>
      <ul className="flex flex-col divide-y divide-neutral-100 border-t border-neutral-200">
        {sorted.map((score) => {
          const metadata = ROLE_METADATA[score.role];
          const isLocked = score.gate < 1;

          return (
            <li key={score.role} className="flex min-h-touch items-center justify-between gap-3 px-4 py-3">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-neutral-800">{metadata.name}</span>
                <span className="text-xs text-neutral-500">{POSITION_NAMES[metadata.position]}</span>
              </div>
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
    </details>
  );
}

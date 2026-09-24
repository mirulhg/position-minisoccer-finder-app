import { Card } from '../../../components/ui/Card';
import { PositionBadge } from '../../../components/ui/PositionBadge';
import { RoleBadge } from '../../../components/ui/RoleBadge';
import { PILLARS, computePillarAverages, type PositionCode, type RoleCode } from '../../scoring';
import type { ComparisonProfile } from '../lib/fetch-profiles-for-comparison';

interface ComparisonPanelProps {
  profiles: [ComparisonProfile, ComparisonProfile];
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}

function formatSignedDiff(diff: number): string {
  const rounded = Math.round(diff);
  if (rounded === 0) return '±0';
  return rounded > 0 ? `+${rounded}` : `${rounded}`;
}

/** FR-19 — bandingkan dua entri riwayat sendiri. Warna/label sama seperti PillarRadar/ATTRIBUTE_LABELS, tidak ada skema baru. */
export function ComparisonPanel({ profiles }: ComparisonPanelProps) {
  // Terlama dulu (kiri) supaya "berubah menjadi" terbaca alami dari kiri ke kanan.
  const [older, newer] = [...profiles].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  ) as [ComparisonProfile, ComparisonProfile];

  const olderAverages = computePillarAverages(older.attributes);
  const newerAverages = computePillarAverages(newer.attributes);

  return (
    <Card>
      <h3 className="text-base font-semibold text-neutral-900">Perbandingan</h3>

      <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-xs text-neutral-400">{formatDate(older.createdAt)}</p>
          <p className="mt-1 font-semibold text-neutral-900">
            {older.mainPosition ? <PositionBadge position={older.mainPosition as PositionCode} /> : '-'}
          </p>
          <p className="mt-1 text-neutral-600">
            {older.mainRole ? <RoleBadge role={older.mainRole as RoleCode} /> : '-'}
          </p>
        </div>
        <div>
          <p className="text-xs text-neutral-400">{formatDate(newer.createdAt)}</p>
          <p className="mt-1 font-semibold text-neutral-900">
            {newer.mainPosition ? <PositionBadge position={newer.mainPosition as PositionCode} /> : '-'}
          </p>
          <p className="mt-1 text-neutral-600">
            {newer.mainRole ? <RoleBadge role={newer.mainRole as RoleCode} /> : '-'}
          </p>
        </div>
      </div>

      <div className="mt-4 flex justify-between text-sm">
        <span className="text-neutral-600">Confidence</span>
        <span className="font-medium text-neutral-900">
          {Math.round(older.confidence * 100)}% → {Math.round(newer.confidence * 100)}%{' '}
          <span className="text-neutral-500">
            ({formatSignedDiff((newer.confidence - older.confidence) * 100)} poin)
          </span>
        </span>
      </div>

      <div className="mt-4 flex flex-col gap-2">
        <p className="text-sm font-medium text-neutral-700">Rata-rata per pilar</p>
        {PILLARS.map((pillar) => {
          const diff = newerAverages[pillar] - olderAverages[pillar];
          return (
            <div key={pillar} className="flex justify-between text-sm text-neutral-700">
              <span>{pillar}</span>
              <span>
                {Math.round(olderAverages[pillar])} → {Math.round(newerAverages[pillar])}{' '}
                <span className={diff >= 0 ? 'text-primary-700' : 'text-danger-600'}>({formatSignedDiff(diff)})</span>
              </span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

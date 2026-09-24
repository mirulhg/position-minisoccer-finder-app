import { useEffect, useState } from 'react';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { PositionBadge } from '../../../components/ui/PositionBadge';
import { supabase } from '../../../lib/supabase';
import { useAuthSession } from '../../auth';
import { POSITION_NAMES } from '../../scoring';
import { fetchProfileHistory, type ProfileHistoryEntry } from '../lib/fetch-profile-history';
import { fetchProfilesForComparison, type ComparisonProfile } from '../lib/fetch-profiles-for-comparison';
import { ComparisonPanel } from './ComparisonPanel';
import { HistorySkeleton } from './HistorySkeleton';
import { PositionChangeBanner } from './PositionChangeBanner';

interface HistoryScreenProps {
  onBack: () => void;
  onManageAccount: () => void;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}

/**
 * Layar 5 (FR-17) — garis waktu vertikal versi profil, terbaru di atas.
 * Sesi dibaca di sini (bukan di AppRouter) supaya `@supabase/supabase-js`
 * hanya ikut ter-bundle ke chunk lazy layar ini/hasil, bukan ke chunk awal
 * yang dimuat semua pengunjung sebelum login.
 */
export function HistoryScreen({ onBack, onManageAccount }: HistoryScreenProps) {
  const { session, isLoading: isSessionLoading } = useAuthSession();
  const [entries, setEntries] = useState<ProfileHistoryEntry[] | null>(null);
  const [error, setError] = useState<string | null>(
    supabase ? null : 'Supabase belum dikonfigurasi.',
  );

  // FR-19 — mode "Bandingkan": pemain pilih maksimal 2 entri riwayat.
  const [isComparing, setIsComparing] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [comparisonProfiles, setComparisonProfiles] = useState<[ComparisonProfile, ComparisonProfile] | null>(null);
  const [comparisonError, setComparisonError] = useState<string | null>(null);
  const [isLoadingComparison, setIsLoadingComparison] = useState(false);

  function toggleSelected(id: string) {
    setComparisonProfiles(null);
    setComparisonError(null);
    setSelectedIds((current) => {
      if (current.includes(id)) return current.filter((entryId) => entryId !== id);
      if (current.length >= 2) return current;
      return [...current, id];
    });
  }

  function handleToggleCompareMode() {
    setIsComparing((current) => !current);
    setSelectedIds([]);
    setComparisonProfiles(null);
    setComparisonError(null);
  }

  async function handleCompare() {
    if (!supabase || selectedIds.length !== 2) return;
    setIsLoadingComparison(true);
    setComparisonError(null);
    try {
      const result = await fetchProfilesForComparison(supabase, selectedIds);
      if (result.length !== 2) {
        setComparisonError('Salah satu profil yang dipilih tidak ditemukan lagi.');
        return;
      }
      setComparisonProfiles([result[0], result[1]]);
    } catch (fetchError) {
      setComparisonError(fetchError instanceof Error ? fetchError.message : 'Gagal memuat perbandingan.');
    } finally {
      setIsLoadingComparison(false);
    }
  }

  useEffect(() => {
    // Sinkronisasi dengan Supabase: riwayat dimuat sekali saat layar dibuka.
    if (!supabase || !session) return;
    let isMounted = true;
    fetchProfileHistory(supabase, session.user.id)
      .then((result) => {
        if (isMounted) setEntries(result);
      })
      .catch((fetchError) => {
        if (isMounted) setError(fetchError instanceof Error ? fetchError.message : 'Gagal memuat riwayat.');
      });
    return () => {
      isMounted = false;
    };
  }, [session]);

  const backButton = (
    <Button variant="ghost" onClick={onBack} className="self-start">
      Kembali ke hasil
    </Button>
  );

  if (isSessionLoading) {
    return (
      <div className="mx-auto flex w-full max-w-md flex-col gap-4 px-4 py-8">
        {backButton}
        <p className="text-neutral-500">Memuat…</p>
      </div>
    );
  }

  // Layar ini hanya dinavigasi lewat tombol yang mensyaratkan sesi aktif
  // (lihat SaveResultSection) — kondisi ini jaga-jaga saja, mis. sesi
  // berakhir tepat saat layar dibuka.
  if (!session) {
    return (
      <div className="mx-auto flex w-full max-w-md flex-col gap-4 px-4 py-8">
        {backButton}
        <p className="text-neutral-500">Masuk dulu untuk melihat riwayat profilmu.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-4 px-4 py-8">
      {backButton}
      <h1 className="text-2xl font-semibold text-neutral-900">Riwayat profil</h1>

      <PositionChangeBanner />

      {error && (
        <p role="alert" className="text-sm text-danger-600">
          {error}
        </p>
      )}
      {!error && entries === null && <HistorySkeleton />}
      {entries !== null && entries.length === 0 && <p className="text-neutral-500">Belum ada riwayat tersimpan.</p>}

      {entries !== null && entries.length > 0 && (
        <>
          {entries.length === 1 && (
            <p className="text-sm text-neutral-500">
              Riwayat akan bertambah setelah kamu mengulang tes atau mencatat pertandingan.
            </p>
          )}

          {entries.length > 1 && (
            <div className="flex items-center justify-between">
              <Button variant="ghost" onClick={handleToggleCompareMode} className="text-sm">
                {isComparing ? 'Batal bandingkan' : 'Bandingkan dua versi'}
              </Button>
              {isComparing && (
                <p className="text-xs text-neutral-500">{selectedIds.length}/2 dipilih</p>
              )}
            </div>
          )}

          {isComparing && selectedIds.length === 2 && !comparisonProfiles && (
            <Button variant="secondary" onClick={handleCompare} disabled={isLoadingComparison} className="w-full">
              {isLoadingComparison ? 'Memuat…' : 'Bandingkan'}
            </Button>
          )}

          {comparisonError && (
            <p role="alert" className="text-sm text-danger-600">
              {comparisonError}
            </p>
          )}

          {comparisonProfiles && <ComparisonPanel profiles={comparisonProfiles} />}

          <ol className="flex flex-col gap-3 border-l-2 border-neutral-200 pl-4">
            {entries.map((entry, index) => {
              const previous = entries[index + 1];
              const isSelected = selectedIds.includes(entry.id);
              const isSelectionDisabled = isComparing && !isSelected && selectedIds.length >= 2;
              return (
                <li key={entry.id} className="relative">
                  <span className="absolute -left-5.25 top-1.5 h-3 w-3 rounded-full bg-primary-600" />
                  <Card
                    className={isComparing ? 'cursor-pointer' : undefined}
                    onClick={isComparing && !isSelectionDisabled ? () => toggleSelected(entry.id) : undefined}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-xs text-neutral-400">{formatDate(entry.createdAt)}</p>
                        <p className="mt-1 text-lg font-semibold text-neutral-900">
                          {POSITION_NAMES[entry.mainPosition.position]}
                        </p>
                        <p className="text-sm text-neutral-600">Skor {Math.round(entry.mainPosition.score)}</p>
                        <div className="mt-2">
                          <PositionBadge position={entry.mainPosition.position} />
                        </div>
                      </div>
                      {isComparing && (
                        <input
                          type="checkbox"
                          checked={isSelected}
                          disabled={isSelectionDisabled}
                          onChange={() => toggleSelected(entry.id)}
                          className="mt-1 h-5 w-5"
                          aria-label={`Pilih versi ${formatDate(entry.createdAt)} untuk dibandingkan`}
                        />
                      )}
                    </div>
                    {previous && (
                      <p className="mt-1 text-xs text-neutral-500">
                        {entry.mainPosition.position === previous.mainPosition.position
                          ? 'Posisi utama tidak berubah dari versi sebelumnya.'
                          : `Berubah dari ${POSITION_NAMES[previous.mainPosition.position]}.`}
                      </p>
                    )}
                  </Card>
                </li>
              );
            })}
          </ol>
        </>
      )}

      <div className="border-t border-neutral-200 pt-4">
        <Button variant="ghost" onClick={onManageAccount} className="w-full text-sm">
          Kelola akun & data
        </Button>
      </div>
    </div>
  );
}

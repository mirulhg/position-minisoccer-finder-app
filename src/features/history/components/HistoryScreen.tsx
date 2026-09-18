import { useEffect, useState } from 'react';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { supabase } from '../../../lib/supabase';
import { useAuthSession } from '../../auth';
import { POSITION_NAMES } from '../../scoring';
import { fetchProfileHistory, type ProfileHistoryEntry } from '../lib/fetch-profile-history';
import { PositionChangeBanner } from './PositionChangeBanner';

interface HistoryScreenProps {
  onBack: () => void;
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
export function HistoryScreen({ onBack }: HistoryScreenProps) {
  const { session, isLoading: isSessionLoading } = useAuthSession();
  const [entries, setEntries] = useState<ProfileHistoryEntry[] | null>(null);
  const [error, setError] = useState<string | null>(
    supabase ? null : 'Supabase belum dikonfigurasi.',
  );

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
      {!error && entries === null && <p className="text-neutral-500">Memuat riwayat…</p>}
      {entries !== null && entries.length === 0 && <p className="text-neutral-500">Belum ada riwayat tersimpan.</p>}

      {entries !== null && entries.length > 0 && (
        <>
          {entries.length === 1 && (
            <p className="text-sm text-neutral-500">
              Riwayat akan bertambah setelah kamu mengulang tes atau mencatat pertandingan.
            </p>
          )}
          <ol className="flex flex-col gap-3 border-l-2 border-neutral-200 pl-4">
            {entries.map((entry, index) => {
              const previous = entries[index + 1];
              return (
                <li key={entry.id} className="relative">
                  <span className="absolute -left-5.25 top-1.5 h-3 w-3 rounded-full bg-primary-600" />
                  <Card>
                    <p className="text-xs text-neutral-400">{formatDate(entry.createdAt)}</p>
                    <p className="mt-1 text-lg font-semibold text-neutral-900">
                      {POSITION_NAMES[entry.mainPosition.position]}
                    </p>
                    <p className="text-sm text-neutral-600">Skor {Math.round(entry.mainPosition.score)}</p>
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
    </div>
  );
}

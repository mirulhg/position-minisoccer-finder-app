import { useEffect, useState } from 'react';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { supabase } from '../../../lib/supabase';
import { POSITION_NAMES } from '../../scoring';
import { fetchProfileHistory, type ProfileHistoryEntry } from '../lib/fetch-profile-history';

interface HistoryScreenProps {
  userId: string;
  onBack: () => void;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}

/** Layar 5 (FR-17) — garis waktu vertikal versi profil, terbaru di atas. */
export function HistoryScreen({ userId, onBack }: HistoryScreenProps) {
  const [entries, setEntries] = useState<ProfileHistoryEntry[] | null>(null);
  const [error, setError] = useState<string | null>(
    supabase ? null : 'Supabase belum dikonfigurasi.',
  );

  useEffect(() => {
    // Sinkronisasi dengan Supabase: riwayat dimuat sekali saat layar dibuka.
    // Layar ini hanya bisa dibuka lewat tombol yang sudah mensyaratkan sesi
    // aktif, jadi `supabase` seharusnya selalu terkonfigurasi di sini.
    if (!supabase) return;
    let isMounted = true;
    fetchProfileHistory(supabase, userId)
      .then((result) => {
        if (isMounted) setEntries(result);
      })
      .catch((fetchError) => {
        if (isMounted) setError(fetchError instanceof Error ? fetchError.message : 'Gagal memuat riwayat.');
      });
    return () => {
      isMounted = false;
    };
  }, [userId]);

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-4 px-4 py-8">
      <Button variant="ghost" onClick={onBack} className="self-start">
        Kembali ke hasil
      </Button>
      <h1 className="text-2xl font-semibold text-neutral-900">Riwayat profil</h1>

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
                  <span className="absolute -left-[21px] top-1.5 h-3 w-3 rounded-full bg-primary-600" />
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

import { useState } from 'react';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { dbClear } from '../../../lib/db';
import { supabase } from '../../../lib/supabase';
import { signOut, useAuthSession } from '../../auth';
import { deleteAllPlayerData } from '../lib/delete-player-data';
import { exportPlayerData } from '../lib/export-player-data';

interface AccountScreenProps {
  onBack: () => void;
  /** Dipanggil setelah "Hapus semua data" sukses (data terhapus + sesi keluar) — pemanggil mengarahkan balik ke onboarding. */
  onDataDeleted: () => void;
}

type DeleteState = 'idle' | 'confirming' | 'deleting' | 'error';

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * FR-20 (wajib) — pemain mengunduh atau menghapus seluruh datanya. Sesi
 * dibaca di sini (bukan di AppRouter), pola sama seperti HistoryScreen:
 * `@supabase/supabase-js` hanya ikut ter-bundle ke chunk lazy layar ini.
 */
export function AccountScreen({ onBack, onDataDeleted }: AccountScreenProps) {
  const { session, isLoading: isSessionLoading } = useAuthSession();
  const [exportError, setExportError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [deleteState, setDeleteState] = useState<DeleteState>('idle');
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const backButton = (
    <Button variant="ghost" onClick={onBack} className="self-start">
      Kembali
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

  if (!supabase || !session) {
    return (
      <div className="mx-auto flex w-full max-w-md flex-col gap-4 px-4 py-8">
        {backButton}
        <p className="text-neutral-500">Masuk dulu untuk mengelola akun dan datamu.</p>
      </div>
    );
  }

  const client = supabase;
  const userId = session.user.id;

  async function handleExport() {
    setExportError(null);
    setIsExporting(true);
    try {
      const data = await exportPlayerData(client, userId);
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `data-pemain-${todayIsoDate()}.json`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      setExportError(error instanceof Error ? error.message : 'Gagal mengunduh data.');
    } finally {
      setIsExporting(false);
    }
  }

  async function handleConfirmDelete() {
    setDeleteState('deleting');
    setDeleteError(null);
    try {
      await deleteAllPlayerData(client, userId);
      await Promise.all([dbClear('onboardingProfile'), dbClear('answers')]);
      await signOut(client);
      onDataDeleted();
    } catch (error) {
      setDeleteState('error');
      setDeleteError(error instanceof Error ? error.message : 'Gagal menghapus data.');
    }
  }

  async function handleSignOut() {
    await signOut(client);
    onBack();
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-4 px-4 py-8">
      {backButton}
      <h1 className="text-2xl font-semibold text-neutral-900">Kelola akun & data</h1>

      <Card>
        <h2 className="text-base font-semibold text-neutral-900">Unduh data saya</h2>
        <p className="mt-1 text-sm text-neutral-600">
          Berkas JSON berisi seluruh riwayat profil, skor role, dan pertandingan yang tersimpan di akunmu.
        </p>
        <Button variant="secondary" onClick={handleExport} disabled={isExporting} className="mt-3 w-full">
          {isExporting ? 'Menyiapkan berkas…' : 'Unduh data saya'}
        </Button>
        {exportError && (
          <p role="alert" className="mt-2 text-sm text-danger-600">
            {exportError}
          </p>
        )}
      </Card>

      <Card>
        <h2 className="text-base font-semibold text-neutral-900">Keluar</h2>
        <p className="mt-1 text-sm text-neutral-600">Keluar dari akun ini di perangkat ini.</p>
        <Button variant="ghost" onClick={handleSignOut} className="mt-3 w-full">
          Keluar
        </Button>
      </Card>

      <Card className="border-danger-200">
        <h2 className="text-base font-semibold text-neutral-900">Hapus semua data</h2>

        {(deleteState === 'idle' || deleteState === 'error') && (
          <>
            <p className="mt-1 text-sm text-neutral-600">
              Menghapus seluruh riwayat profil dan pertandingan yang tersimpan di akunmu secara permanen.
            </p>
            <button
              type="button"
              onClick={() => setDeleteState('confirming')}
              className="mt-3 min-h-touch w-full rounded-md border border-danger-300 px-4 text-sm font-medium text-danger-600 hover:bg-danger-50"
            >
              Hapus semua data
            </button>
          </>
        )}

        {(deleteState === 'confirming' || deleteState === 'deleting') && (
          <div className="mt-1 flex flex-col gap-3">
            <p className="text-sm text-neutral-700">
              Ini akan menghapus SEMUA data tersimpan di akunmu (riwayat profil, semua pertandingan) secara permanen.
              Akun login kamu tetap ada, tapi kamu harus mulai dari nol lagi.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setDeleteState('idle')}
                disabled={deleteState === 'deleting'}
                className="min-h-touch min-w-touch flex-1 rounded-md border border-neutral-300 px-4 text-sm font-medium text-neutral-700 hover:bg-neutral-100 disabled:cursor-not-allowed disabled:text-neutral-300"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={deleteState === 'deleting'}
                className="min-h-touch min-w-touch flex-1 rounded-md bg-danger-600 px-4 text-sm font-medium text-white hover:bg-danger-700 disabled:cursor-not-allowed disabled:bg-neutral-300"
              >
                {deleteState === 'deleting' ? 'Menghapus…' : 'Ya, hapus semua data'}
              </button>
            </div>
          </div>
        )}

        {deleteError && (
          <p role="alert" className="mt-2 text-sm text-danger-600">
            {deleteError}
          </p>
        )}
      </Card>
    </div>
  );
}

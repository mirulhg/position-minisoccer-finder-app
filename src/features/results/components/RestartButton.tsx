import { useState } from 'react';
import { Button } from '../../../components/ui/Button';
import { dbClear } from '../../../lib/db';

interface RestartButtonProps {
  onRestart: () => void;
}

/**
 * Aksi destruktif — sengaja tidak menonjol (bukan CTA utama) dan butuh
 * konfirmasi inline sebelum jalan (Nielsen "Error prevention"). Hanya
 * menghapus IndexedDB lokal lewat `dbClear`; tidak memanggil Supabase sama
 * sekali, jadi hasil yang sudah disimpan ke akun (lewat "Simpan hasil ini")
 * tetap aman.
 */
export function RestartButton({ onRestart }: RestartButtonProps) {
  const [isConfirming, setIsConfirming] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  async function handleConfirm() {
    setIsClearing(true);
    await Promise.all([dbClear('onboardingProfile'), dbClear('answers')]);
    onRestart();
  }

  if (isConfirming) {
    return (
      <div className="flex flex-col items-center gap-3 text-center">
        <p className="max-w-xs text-sm text-neutral-600">
          Yakin? Jawaban lokal akan dihapus. Ini hanya menghapus data kuesioner
          di perangkat ini — kalau kamu sudah menyimpan hasil ke akun, data di
          akunmu tidak ikut terhapus.
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setIsConfirming(false)}
            disabled={isClearing}
            className="min-h-touch min-w-touch rounded-md border border-neutral-300 px-4 text-sm font-medium text-neutral-700 hover:bg-neutral-100 disabled:cursor-not-allowed disabled:text-neutral-300"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isClearing}
            className="min-h-touch min-w-touch rounded-md bg-danger-600 px-4 text-sm font-medium text-white hover:bg-danger-700 disabled:cursor-not-allowed disabled:bg-neutral-300"
          >
            {isClearing ? 'Menghapus…' : 'Ya, hapus'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center">
      <Button variant="ghost" onClick={() => setIsConfirming(true)} className="text-sm">
        Mulai ulang dari awal
      </Button>
    </div>
  );
}

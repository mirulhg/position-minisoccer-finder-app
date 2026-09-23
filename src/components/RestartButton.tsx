import { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Button } from './ui/Button';
import { signOut } from '../features/auth';
import { dbClear } from '../lib/db';
import { supabase } from '../lib/supabase';
import { DIALOG_HIDDEN, DIALOG_TRANSITION, DIALOG_VISIBLE } from './ui/dialog-motion';

interface RestartButtonProps {
  onRestart: () => void;
}

/**
 * Aksi destruktif — sengaja tidak menonjol (bukan CTA utama) dan butuh
 * konfirmasi inline sebelum jalan (Nielsen "Error prevention"). Menghapus
 * IndexedDB lokal lewat `dbClear` — hasil yang sudah disimpan ke akun
 * (lewat "Simpan hasil ini") tetap aman di Supabase, cuma jejak lokalnya
 * yang hilang. Juga memanggil `signOut()` (temuan pentest: sesi Supabase
 * yang tertinggal aktif di perangkat bersama bisa membuat pemain BERIKUTNYA
 * — yang mengisi kuesioner dari awal tanpa login — hasilnya ter-upload
 * diam-diam ke akun pemain sebelumnya kalau sesi lama itu tidak ikut
 * dibersihkan di sini).
 */
export function RestartButton({ onRestart }: RestartButtonProps) {
  const [isConfirming, setIsConfirming] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  async function handleConfirm() {
    setIsClearing(true);
    await Promise.all([dbClear('onboardingProfile'), dbClear('answers'), dbClear('meta')]);
    if (supabase) {
      // Kegagalan signOut() (mis. offline) TIDAK boleh menghalangi restart —
      // pembersihan lokal di atas sudah cukup untuk mengembalikan app ke
      // keadaan awal; sesi Supabase yang gagal dibersihkan cuma dicatat.
      await signOut(supabase).catch((error) => {
        console.warn('Gagal keluar dari sesi Supabase saat mulai ulang:', error);
      });
    }
    onRestart();
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      {isConfirming ? (
        <motion.div
          key="confirming"
          className="flex flex-col items-center gap-3 text-center"
          initial={shouldReduceMotion ? false : DIALOG_HIDDEN}
          animate={DIALOG_VISIBLE}
          exit={shouldReduceMotion ? undefined : DIALOG_HIDDEN}
          transition={DIALOG_TRANSITION}
        >
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
        </motion.div>
      ) : (
        <motion.div
          key="idle"
          className="flex justify-center"
          initial={shouldReduceMotion ? false : DIALOG_HIDDEN}
          animate={DIALOG_VISIBLE}
          exit={shouldReduceMotion ? undefined : DIALOG_HIDDEN}
          transition={DIALOG_TRANSITION}
        >
          <Button variant="ghost" onClick={() => setIsConfirming(true)} className="text-sm">
            Mulai ulang dari awal
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

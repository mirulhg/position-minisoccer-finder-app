import { useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Button } from '../../../components/ui/Button';
import { DIALOG_HIDDEN, DIALOG_TRANSITION, DIALOG_VISIBLE } from '../../../components/ui/dialog-motion';
import { useTranslation } from '../../../i18n';
import { useAuthSession } from '../../auth';
import { drawProfileCard, shareProfileCard, type ProfileCardData } from '../lib/profile-card-canvas';
import { ShareCardForm } from './ShareCardForm';

interface ResultActionsProps {
  cardData: ProfileCardData;
  onLogMatch: () => void;
}

/**
 * "Bagikan kartu profil" (FR-18) aktif untuk siapa saja: canvas 1080x1350
 * di-render lalu dibagikan lewat Web Share API, fallback unduh PNG. "Catat
 * pertandingan" (FR-14, Fase 3) butuh akun — `matches.player_id` mengacu ke
 * `players`, jadi tombolnya nonaktif dengan keterangan sampai pemain login
 * dan menyimpan hasil (lihat `SaveResultSection`).
 */
export function ResultActions({ cardData, onLogMatch }: ResultActionsProps) {
  const { t } = useTranslation();
  const { session } = useAuthSession();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  async function handleShare(data: ProfileCardData) {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setError(null);
    setIsSharing(true);
    try {
      drawProfileCard(canvas, data, t.results.profileCard);
      await shareProfileCard(canvas, 'kartu-profil-minisoccer.png');
    } catch (shareError) {
      setError(shareError instanceof Error ? shareError.message : t.results.resultActions.shareCardError);
    } finally {
      setIsSharing(false);
    }
  }

  function handleSubmitForm({ name, jerseyNumber }: { name: string; jerseyNumber: number | undefined }) {
    setIsFormOpen(false);
    // Nama kosong = pakai displayName bawaan (sesi login / fallback generik).
    void handleShare({ ...cardData, displayName: name || cardData.displayName, jerseyNumber });
  }

  function handleSkipForm() {
    setIsFormOpen(false);
    void handleShare(cardData);
  }

  return (
    <div className="flex flex-col gap-2">
      <canvas ref={canvasRef} className="hidden" aria-hidden="true" />
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={isFormOpen ? 'form' : 'button'}
          initial={shouldReduceMotion ? false : DIALOG_HIDDEN}
          animate={DIALOG_VISIBLE}
          exit={shouldReduceMotion ? undefined : DIALOG_HIDDEN}
          transition={DIALOG_TRANSITION}
        >
          {isFormOpen ? (
            <ShareCardForm onSkip={handleSkipForm} onSubmit={handleSubmitForm} />
          ) : (
            <Button variant="secondary" onClick={() => setIsFormOpen(true)} disabled={isSharing} className="w-full">
              {isSharing ? t.results.resultActions.preparingCard : t.results.resultActions.shareCard}
            </Button>
          )}
        </motion.div>
      </AnimatePresence>
      {error && (
        <p role="alert" className="text-sm text-danger-600">
          {error}
        </p>
      )}
      {session ? (
        <Button variant="secondary" onClick={onLogMatch} className="w-full">
          {t.results.resultActions.logMatch}
        </Button>
      ) : (
        <Button
          variant="secondary"
          disabled
          className="w-full"
          title={t.results.resultActions.logMatchDisabledTitle}
        >
          {t.results.resultActions.logMatchDisabledLabel}
        </Button>
      )}
    </div>
  );
}

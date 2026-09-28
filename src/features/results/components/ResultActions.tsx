import { useRef, useState } from 'react';
import { Button } from '../../../components/ui/Button';
import { useTranslation } from '../../../i18n';
import { useAuthSession } from '../../auth';
import { drawProfileCard, shareProfileCard, type ProfileCardData } from '../lib/profile-card-canvas';

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

  async function handleShare() {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setError(null);
    setIsSharing(true);
    try {
      drawProfileCard(canvas, cardData, t.results.profileCard);
      await shareProfileCard(canvas, 'kartu-profil-minisoccer.png');
    } catch (shareError) {
      setError(shareError instanceof Error ? shareError.message : t.results.resultActions.shareCardError);
    } finally {
      setIsSharing(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <canvas ref={canvasRef} className="hidden" aria-hidden="true" />
      <Button variant="secondary" onClick={handleShare} disabled={isSharing} className="w-full">
        {isSharing ? t.results.resultActions.preparingCard : t.results.resultActions.shareCard}
      </Button>
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

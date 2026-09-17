import { useRef, useState } from 'react';
import { Button } from '../../../components/ui/Button';
import { drawProfileCard, shareProfileCard, type ProfileCardData } from '../lib/profile-card-canvas';

interface ResultActionsProps {
  cardData: ProfileCardData;
}

/**
 * "Catat pertandingan pertama" tetap nonaktif — itu Fase 3 (blending),
 * bukan bagian tugas ini. "Bagikan kartu profil" (FR-18) sudah aktif:
 * canvas 1080x1350 di-render lalu dibagikan lewat Web Share API, fallback
 * unduh PNG kalau browser tidak mendukung.
 */
export function ResultActions({ cardData }: ResultActionsProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleShare() {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setError(null);
    setIsSharing(true);
    try {
      drawProfileCard(canvas, cardData);
      await shareProfileCard(canvas, 'kartu-profil-minisoccer.png');
    } catch (shareError) {
      setError(shareError instanceof Error ? shareError.message : 'Gagal membagikan kartu profil.');
    } finally {
      setIsSharing(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <canvas ref={canvasRef} className="hidden" aria-hidden="true" />
      <Button variant="secondary" onClick={handleShare} disabled={isSharing} className="w-full">
        {isSharing ? 'Menyiapkan kartu…' : 'Bagikan kartu profil'}
      </Button>
      {error && (
        <p role="alert" className="text-sm text-danger-600">
          {error}
        </p>
      )}
      <Button variant="secondary" disabled className="w-full" title="Segera hadir">
        Catat pertandingan pertama — segera hadir
      </Button>
    </div>
  );
}

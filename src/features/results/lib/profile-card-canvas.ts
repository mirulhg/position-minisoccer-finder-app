export interface ProfileCardData {
  displayName: string;
  positionName: string;
  positionScore: number;
  roles: { name: string; fit: number }[];
  topAttributes: { label: string; value: number }[];
}

const CARD_WIDTH = 1080;
const CARD_HEIGHT = 1350;

// Canvas tidak bisa memakai class Tailwind — nilai di bawah disalin dari
// token warna di tailwind.config.ts (primary-600/700, neutral-50/900/600).
const COLOR_BACKGROUND = '#fafafa';
const COLOR_HEADER = '#245c2a';
const COLOR_PRIMARY = '#2c7433';
const COLOR_TEXT_DARK = '#1a1815';
const COLOR_TEXT_MUTED = '#5b5851';
const COLOR_WHITE = '#ffffff';
const FONT_FAMILY = 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';

/** FR-18 — kartu profil 1080x1350 untuk dibagikan. Menggambar ke canvas yang diberikan (bukan membuat sendiri) agar mudah diuji dengan canvas offscreen. */
export function drawProfileCard(canvas: HTMLCanvasElement, data: ProfileCardData): void {
  canvas.width = CARD_WIDTH;
  canvas.height = CARD_HEIGHT;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context tidak tersedia di browser ini.');

  ctx.fillStyle = COLOR_BACKGROUND;
  ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);

  ctx.fillStyle = COLOR_HEADER;
  ctx.fillRect(0, 0, CARD_WIDTH, 260);

  ctx.fillStyle = COLOR_WHITE;
  ctx.font = `400 32px ${FONT_FAMILY}`;
  ctx.fillText('Position & Role Finder Minisoccer', 60, 80);
  ctx.font = `700 64px ${FONT_FAMILY}`;
  ctx.fillText(data.displayName, 60, 180);

  ctx.fillStyle = COLOR_TEXT_MUTED;
  ctx.font = `400 36px ${FONT_FAMILY}`;
  ctx.fillText('Posisi utama', 60, 340);

  ctx.fillStyle = COLOR_TEXT_DARK;
  ctx.font = `700 88px ${FONT_FAMILY}`;
  ctx.fillText(data.positionName, 60, 440);
  ctx.fillStyle = COLOR_PRIMARY;
  ctx.font = `700 48px ${FONT_FAMILY}`;
  ctx.fillText(String(Math.round(data.positionScore)), 60, 500);

  let y = 620;
  for (const role of data.roles) {
    ctx.fillStyle = COLOR_TEXT_DARK;
    ctx.font = `700 40px ${FONT_FAMILY}`;
    ctx.fillText(role.name, 60, y);
    ctx.fillStyle = COLOR_PRIMARY;
    ctx.fillText(String(Math.round(role.fit)), CARD_WIDTH - 160, y);
    y += 70;
  }

  y += 40;
  ctx.fillStyle = COLOR_TEXT_MUTED;
  ctx.font = `400 34px ${FONT_FAMILY}`;
  ctx.fillText('Kekuatan utama', 60, y);
  y += 60;

  for (const attribute of data.topAttributes) {
    ctx.fillStyle = COLOR_TEXT_DARK;
    ctx.font = `400 38px ${FONT_FAMILY}`;
    ctx.fillText(attribute.label, 60, y);
    ctx.fillStyle = COLOR_PRIMARY;
    ctx.font = `700 38px ${FONT_FAMILY}`;
    ctx.fillText(String(Math.round(attribute.value)), CARD_WIDTH - 160, y);
    y += 70;
  }
}

/** `canvas.toBlob` → Web Share API kalau didukung, fallback unduh PNG. */
export async function shareProfileCard(canvas: HTMLCanvasElement, fileName: string): Promise<void> {
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
  if (!blob) throw new Error('Gagal membuat gambar kartu profil.');

  const file = new File([blob], fileName, { type: 'image/png' });

  if (navigator.canShare?.({ files: [file] })) {
    await navigator.share({ files: [file], title: 'Kartu profil minisoccer' });
    return;
  }

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

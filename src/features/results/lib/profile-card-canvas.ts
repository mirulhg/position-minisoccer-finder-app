import {
  POSITION_AREA,
  POSITION_AREA_COLORS,
  ROLE_METADATA,
  type PositionCode,
  type RoleCode,
} from '../../scoring';

export interface ProfileCardData {
  displayName: string;
  positionName: string;
  positionScore: number;
  position: PositionCode;
  roles: { name: string; fit: number; role: RoleCode }[];
  topAttributes: { label: string; value: number }[];
}

const CARD_WIDTH = 1080;
const CARD_HEIGHT = 1350;

// Canvas tidak bisa memakai class Tailwind — nilai di bawah disalin dari
// token warna di tailwind.config.ts (brand-ink, neutral-50/900/600).
const COLOR_BACKGROUND = '#fafafa';
const COLOR_HEADER = '#38003C';
const COLOR_TEXT_DARK = '#1a1815';
const COLOR_TEXT_MUTED = '#5b5851';
const COLOR_WHITE = '#ffffff';
const FONT_FAMILY = 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';

// Chip berwarna area posisi, meniru PositionCodeBadge/RoleBadge (yang pakai
// Tailwind rounded-lg/rounded-full) — Canvas tidak bisa reuse komponen React,
// jadi digambar ulang manual lewat rounded-rect. Ukuran discale naik dari
// badge layar (px-4 py-1.5 / px-3 py-1) karena kartu diekspor pada resolusi
// 1080x1350, jauh lebih tinggi dari ukuran tampil di layar.
const CODE_CHIP_FONT_SIZE = 34;
const CODE_CHIP_PADDING_X = 20;
const CODE_CHIP_PADDING_Y = 10;
const CODE_CHIP_RADIUS = 10;

const ROLE_CHIP_FONT_SIZE = 30;
const ROLE_CHIP_PADDING_X = 18;
const ROLE_CHIP_PADDING_Y = 9;
const ROLE_CHIP_RADIUS = 10;

function drawRoundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number): void {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.arcTo(x + width, y, x + width, y + radius, radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.arcTo(x + width, y + height, x + width - radius, y + height, radius);
  ctx.lineTo(x + radius, y + height);
  ctx.arcTo(x, y + height, x, y + height - radius, radius);
  ctx.lineTo(x, y + radius);
  ctx.arcTo(x, y, x + radius, y, radius);
  ctx.closePath();
}

interface ChipMetrics {
  width: number;
  height: number;
}

/** Chip kode posisi saja (mis. "ST"), meniru `PositionCodeBadge`. */
function drawCodeChip(
  ctx: CanvasRenderingContext2D,
  code: string,
  x: number,
  y: number,
  bgColor: string,
  textColor: string,
): ChipMetrics {
  ctx.save();
  ctx.font = `700 ${CODE_CHIP_FONT_SIZE}px ${FONT_FAMILY}`;
  const width = ctx.measureText(code).width + CODE_CHIP_PADDING_X * 2;
  const height = CODE_CHIP_FONT_SIZE + CODE_CHIP_PADDING_Y * 2;

  ctx.fillStyle = bgColor;
  drawRoundedRect(ctx, x, y, width, height, CODE_CHIP_RADIUS);
  ctx.fill();

  ctx.fillStyle = textColor;
  ctx.textBaseline = 'middle';
  ctx.fillText(code, x + CODE_CHIP_PADDING_X, y + height / 2);
  ctx.restore();

  return { width, height };
}

/** Chip format "[KODE] Nama", meniru `RoleBadge` — lebar menyesuaikan isi label. */
function drawLabeledChip(
  ctx: CanvasRenderingContext2D,
  label: string,
  x: number,
  y: number,
  bgColor: string,
  textColor: string,
): ChipMetrics {
  ctx.save();
  ctx.font = `700 ${ROLE_CHIP_FONT_SIZE}px ${FONT_FAMILY}`;
  const width = ctx.measureText(label).width + ROLE_CHIP_PADDING_X * 2;
  const height = ROLE_CHIP_FONT_SIZE + ROLE_CHIP_PADDING_Y * 2;

  ctx.fillStyle = bgColor;
  drawRoundedRect(ctx, x, y, width, height, ROLE_CHIP_RADIUS);
  ctx.fill();

  ctx.fillStyle = textColor;
  ctx.textBaseline = 'middle';
  ctx.fillText(label, x + ROLE_CHIP_PADDING_X, y + height / 2);
  ctx.restore();

  return { width, height };
}

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
  const positionNameWidth = ctx.measureText(data.positionName).width;

  const positionAreaColor = POSITION_AREA_COLORS[POSITION_AREA[data.position]];
  drawCodeChip(ctx, data.position, 60 + positionNameWidth + 28, 380, positionAreaColor.bg, positionAreaColor.text);

  ctx.fillStyle = COLOR_TEXT_DARK;
  ctx.font = `700 48px ${FONT_FAMILY}`;
  ctx.fillText(String(Math.round(data.positionScore)), 60, 500);

  let y = 620;
  for (const role of data.roles) {
    const roleAreaColor = POSITION_AREA_COLORS[POSITION_AREA[ROLE_METADATA[role.role].position]];
    const roleLabel = `[${role.role.split('-')[1]}] ${role.name}`;
    drawLabeledChip(ctx, roleLabel, 60, y - 35, roleAreaColor.bg, roleAreaColor.text);

    ctx.fillStyle = COLOR_TEXT_DARK;
    ctx.font = `700 40px ${FONT_FAMILY}`;
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
    ctx.fillStyle = COLOR_TEXT_DARK;
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

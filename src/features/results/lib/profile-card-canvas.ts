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
  /** null kalau hasil ini tidak punya posisi alternatif — kolom kanan & section role alternatif di-skip, bukan digambar kosong. */
  alternativePosition: { name: string; score: number; position: PositionCode } | null;
  roles: { name: string; fit: number; role: RoleCode }[];
  /** Kosong kalau tidak ada posisi alternatif (lihat `alternativePosition`) — bukan dipaksa berisi data palsu. */
  alternativeRoles: { name: string; fit: number; role: RoleCode }[];
  topAttributes: { label: string; value: number }[];
}

const CARD_WIDTH = 1080;

// CARD_HEIGHT dihitung dinamis di drawProfileCard (bukan konstanta tetap)
// karena kartu jadi lebih tinggi kalau ada section role posisi alternatif,
// dan lebih pendek lagi kalau tidak ada posisi alternatif sama sekali.
const HEADER_HEIGHT = 260;
const ROLE_LIST_START_Y = 620;
const ROLE_ROW_HEIGHT = 70;
const SECTION_LABEL_GAP = 40;
const SECTION_CONTENT_GAP = 60;
// Footer kredit menggantikan padding bawah polos yang dulu ada di sini —
// jarak dari section terakhir ke baseline footer, lalu dari footer ke tepi kartu.
const FOOTER_TOP_GAP = ROLE_ROW_HEIGHT;
const FOOTER_BOTTOM_PADDING = 90;

const CARD_SIDE_MARGIN = 60;
const POSITION_COLUMN_GAP = 40;
const POSITION_COLUMN_WIDTH = (CARD_WIDTH - CARD_SIDE_MARGIN * 2 - POSITION_COLUMN_GAP) / 2;

const POSITION_NAME_START_FONT_SIZE = 60;
const POSITION_NAME_MIN_FONT_SIZE = 40;
const POSITION_SCORE_START_FONT_SIZE = 48;
const POSITION_SCORE_MIN_FONT_SIZE = 32;
const POSITION_CODE_MIN_FONT_SIZE = 23;

// Canvas tidak bisa memakai class Tailwind — nilai di bawah disalin dari
// token warna di tailwind.config.ts (brand-ink, neutral-50/900/600).
const COLOR_BACKGROUND = '#fafafa';
const COLOR_HEADER = '#38003C';
const COLOR_TEXT_DARK = '#1a1815';
const COLOR_TEXT_MUTED = '#5b5851'; // neutral-600
const COLOR_TEXT_MUTED_LIGHT = '#79766e'; // neutral-500 — "Developed by" & versi di footer (AppFooter pakai text-neutral-500)
const COLOR_WHITE = '#ffffff';
const FONT_FAMILY = 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';

// Footer kredit developer, meniru `AppFooter.tsx` persis (teks, urutan,
// warna) — font kustomnya (Alex Brush, Fira Code) sama dengan yang dimuat
// index.html lewat <link> Google Fonts untuk AppFooter itu sendiri.
const FOOTER_FONT_SIZE = 28; // setara text-xs (12px) di layar, skala sama dengan chip role (30px/text-xs)
const FOOTER_SCRIPT_FONT_SIZE = 36; // setara text-sm (14px) — "dev.myrules" sedikit lebih besar, sama seperti di AppFooter
const FOOTER_GAP = 20;
const FOOTER_SCRIPT_FONT_FAMILY = '"Alex Brush", cursive';
const FOOTER_MONO_FONT_FAMILY = '"Fira Code", ui-monospace, SFMono-Regular, monospace';

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
const ROLE_CHIP_MIN_FONT_SIZE = 20;
const ROLE_CHIP_PADDING_X = 18;
const ROLE_CHIP_PADDING_Y = 9;
const ROLE_CHIP_RADIUS = 10;
// Lebar maksimum chip label role — dari margin kiri sampai sebelum kolom
// angka fit di kanan (CARD_WIDTH - 160), dikurangi jarak aman ke kolom itu.
const ROLE_CHIP_MAX_WIDTH = CARD_WIDTH - 160 - CARD_SIDE_MARGIN - 40;

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

interface FittedText {
  text: string;
  fontSize: number;
}

/**
 * Turunkan font size 1px demi 1px sampai `text` muat di `maxWidth` pada
 * `startFontSize`, tapi tidak pernah di bawah `minFontSize`. Kalau di
 * `minFontSize` pun masih kepanjangan (nama sangat panjang), potong dengan
 * ellipsis sebagai upaya terakhir — teks TIDAK PERNAH melebar keluar `maxWidth`.
 */
function fitTextToWidth(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  startFontSize: number,
  minFontSize: number,
  fontWeight: number,
): FittedText {
  let fontSize = startFontSize;
  ctx.font = `${fontWeight} ${fontSize}px ${FONT_FAMILY}`;

  while (ctx.measureText(text).width > maxWidth && fontSize > minFontSize) {
    fontSize -= 1;
    ctx.font = `${fontWeight} ${fontSize}px ${FONT_FAMILY}`;
  }

  if (ctx.measureText(text).width <= maxWidth) {
    return { text, fontSize };
  }

  let truncated = text;
  while (truncated.length > 1 && ctx.measureText(`${truncated}…`).width > maxWidth) {
    truncated = truncated.slice(0, -1);
  }
  return { text: `${truncated}…`, fontSize };
}

/** Chip kode posisi saja (mis. "ST"), meniru `PositionCodeBadge`. */
function drawCodeChip(
  ctx: CanvasRenderingContext2D,
  code: string,
  x: number,
  y: number,
  bgColor: string,
  textColor: string,
  fontSize: number = CODE_CHIP_FONT_SIZE,
): ChipMetrics {
  ctx.save();
  ctx.font = `700 ${fontSize}px ${FONT_FAMILY}`;
  const width = ctx.measureText(code).width + CODE_CHIP_PADDING_X * 2;
  const height = fontSize + CODE_CHIP_PADDING_Y * 2;

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
  fontSize: number = ROLE_CHIP_FONT_SIZE,
): ChipMetrics {
  ctx.save();
  ctx.font = `700 ${fontSize}px ${FONT_FAMILY}`;
  const width = ctx.measureText(label).width + ROLE_CHIP_PADDING_X * 2;
  const height = fontSize + ROLE_CHIP_PADDING_Y * 2;

  ctx.fillStyle = bgColor;
  drawRoundedRect(ctx, x, y, width, height, ROLE_CHIP_RADIUS);
  ctx.fill();

  ctx.fillStyle = textColor;
  ctx.textBaseline = 'middle';
  ctx.fillText(label, x + ROLE_CHIP_PADDING_X, y + height / 2);
  ctx.restore();

  return { width, height };
}

interface PositionColumnData {
  label: string;
  name: string;
  position: PositionCode;
  score: number;
}

/**
 * Satu kolom blok posisi (label → nama → chip kode → skor), dipakai identik
 * untuk posisi utama (kolom kiri) maupun alternatif (kolom kanan) — cuma
 * datanya beda, urutan & style elemen sama persis.
 */
function drawPositionColumn(ctx: CanvasRenderingContext2D, data: PositionColumnData, x: number): void {
  let y = 340;
  ctx.fillStyle = COLOR_TEXT_MUTED;
  ctx.font = `400 36px ${FONT_FAMILY}`;
  ctx.fillText(data.label, x, y);

  y += 80;
  const fittedName = fitTextToWidth(
    ctx,
    data.name,
    POSITION_COLUMN_WIDTH,
    POSITION_NAME_START_FONT_SIZE,
    POSITION_NAME_MIN_FONT_SIZE,
    700,
  );
  ctx.fillStyle = COLOR_TEXT_DARK;
  ctx.font = `700 ${fittedName.fontSize}px ${FONT_FAMILY}`;
  ctx.fillText(fittedName.text, x, y);

  y += 40;
  const areaColor = POSITION_AREA_COLORS[POSITION_AREA[data.position]];
  const fittedCode = fitTextToWidth(
    ctx,
    data.position,
    POSITION_COLUMN_WIDTH - CODE_CHIP_PADDING_X * 2,
    CODE_CHIP_FONT_SIZE,
    POSITION_CODE_MIN_FONT_SIZE,
    700,
  );
  const chipMetrics = drawCodeChip(ctx, fittedCode.text, x, y, areaColor.bg, areaColor.text, fittedCode.fontSize);

  y += chipMetrics.height + 50;
  const fittedScore = fitTextToWidth(
    ctx,
    String(Math.round(data.score)),
    POSITION_COLUMN_WIDTH,
    POSITION_SCORE_START_FONT_SIZE,
    POSITION_SCORE_MIN_FONT_SIZE,
    700,
  );
  ctx.fillStyle = COLOR_TEXT_DARK;
  ctx.font = `700 ${fittedScore.fontSize}px ${FONT_FAMILY}`;
  ctx.fillText(fittedScore.text, x, y);
}

interface RoleRow {
  name: string;
  fit: number;
  role: RoleCode;
}

/**
 * Satu daftar role (chip "[KODE] Nama" + angka fit di kanan), dipakai identik
 * untuk daftar role posisi utama maupun alternatif — reuse apa adanya, cuma
 * `roles` & `startY` beda. Mengembalikan y setelah baris terakhir.
 */
function drawRoleList(ctx: CanvasRenderingContext2D, roles: RoleRow[], startY: number): number {
  let y = startY;
  for (const role of roles) {
    const roleAreaColor = POSITION_AREA_COLORS[POSITION_AREA[ROLE_METADATA[role.role].position]];
    const fittedLabel = fitTextToWidth(
      ctx,
      `[${role.role.split('-')[1]}] ${role.name}`,
      ROLE_CHIP_MAX_WIDTH,
      ROLE_CHIP_FONT_SIZE,
      ROLE_CHIP_MIN_FONT_SIZE,
      700,
    );
    drawLabeledChip(
      ctx,
      fittedLabel.text,
      CARD_SIDE_MARGIN,
      y - 35,
      roleAreaColor.bg,
      roleAreaColor.text,
      fittedLabel.fontSize,
    );

    ctx.fillStyle = COLOR_TEXT_DARK;
    ctx.font = `700 40px ${FONT_FAMILY}`;
    ctx.fillText(String(Math.round(role.fit)), CARD_WIDTH - 160, y);
    y += ROLE_ROW_HEIGHT;
  }
  return y;
}

// Font kustom footer (Alex Brush, Fira Code) dimuat lewat <link> Google Fonts
// di index.html — sama seperti yang dipakai AppFooter.tsx di layar (font
// itu jadi otomatis diminta browser saat halaman pertama kali render, dan
// AppFooter sendiri SELALU tampil di setiap layar app, jadi pada saat user
// sempat mengklik "Bagikan kartu profil" font ini praktis sudah termuat).
// `drawProfileCard` di bawah TETAP sinkron (pemanggilnya di ResultActions.tsx
// tidak meng-await-nya) — jadi di sini fontnya diminta se-dini mungkin lewat
// document.fonts.load() (fire-and-forget) saat modul ini diimpor, lalu
// dicek sinkron lewat document.fonts.check() tepat sebelum menggambar teks
// footer: kalau sudah termuat pakai font aslinya, kalau belum (sangat
// jarang) fallback ke keluarga generic (cursive/monospace) supaya TIDAK
// diam-diam jatuh ke font default sans-serif tanpa terlihat bedanya sama
// sekali — bukan skenario ideal, tapi tanpa mengubah ResultActions.tsx jadi
// async ini best-effort paling aman.
if (typeof document !== 'undefined' && 'fonts' in document) {
  document.fonts.load(`400 ${FOOTER_SCRIPT_FONT_SIZE}px "Alex Brush"`).catch(() => {});
  document.fonts.load(`400 ${FOOTER_FONT_SIZE}px "Fira Code"`).catch(() => {});
}

function isFontLoaded(family: string, size: number): boolean {
  if (typeof document === 'undefined' || !('fonts' in document)) return false;
  try {
    return document.fonts.check(`400 ${size}px ${family}`);
  } catch {
    return false;
  }
}

/** Footer kredit developer, meniru `AppFooter.tsx` persis — dipusatkan secara horizontal di paling bawah kartu. */
function drawFooter(ctx: CanvasRenderingContext2D, footerY: number): void {
  const scriptFamily = isFontLoaded('"Alex Brush"', FOOTER_SCRIPT_FONT_SIZE) ? FOOTER_SCRIPT_FONT_FAMILY : 'cursive';
  const monoFamily = isFontLoaded('"Fira Code"', FOOTER_FONT_SIZE) ? FOOTER_MONO_FONT_FAMILY : 'monospace';

  const segments = [
    { text: 'Developed by', font: `400 ${FOOTER_FONT_SIZE}px ${FONT_FAMILY}`, color: COLOR_TEXT_MUTED_LIGHT },
    { text: 'dev.myrules', font: `400 ${FOOTER_SCRIPT_FONT_SIZE}px ${scriptFamily}`, color: COLOR_TEXT_MUTED },
    { text: '·', font: `400 ${FOOTER_FONT_SIZE}px ${FONT_FAMILY}`, color: COLOR_TEXT_MUTED_LIGHT },
    { text: `v${__APP_VERSION__}`, font: `400 ${FOOTER_FONT_SIZE}px ${monoFamily}`, color: COLOR_TEXT_MUTED_LIGHT },
  ];

  ctx.textBaseline = 'alphabetic';
  const widths = segments.map((segment) => {
    ctx.font = segment.font;
    return ctx.measureText(segment.text).width;
  });
  const totalWidth = widths.reduce((sum, width) => sum + width, 0) + FOOTER_GAP * (segments.length - 1);

  let x = (CARD_WIDTH - totalWidth) / 2;
  segments.forEach((segment, index) => {
    ctx.font = segment.font;
    ctx.fillStyle = segment.color;
    ctx.fillText(segment.text, x, footerY);
    x += widths[index] + FOOTER_GAP;
  });
}

/** FR-18 — kartu profil untuk dibagikan (lebar tetap 1080, tinggi menyesuaikan konten — lebih tinggi kalau ada section role posisi alternatif). Menggambar ke canvas yang diberikan (bukan membuat sendiri) agar mudah diuji dengan canvas offscreen. */
export function drawProfileCard(canvas: HTMLCanvasElement, data: ProfileCardData): void {
  const hasAlternativeRoles = data.alternativePosition !== null && data.alternativeRoles.length > 0;

  // Hitung tinggi kartu di muka (bukan sambil menggambar) — mengeset
  // canvas.height membersihkan kanvas, jadi tidak bisa dihitung belakangan.
  const mainRoleListEndY = ROLE_LIST_START_Y + data.roles.length * ROLE_ROW_HEIGHT;
  let nextSectionY = mainRoleListEndY;
  let altRoleLabelY = 0;
  let altRoleListStartY = 0;
  if (hasAlternativeRoles) {
    altRoleLabelY = nextSectionY + SECTION_LABEL_GAP;
    altRoleListStartY = altRoleLabelY + SECTION_CONTENT_GAP;
    nextSectionY = altRoleListStartY + data.alternativeRoles.length * ROLE_ROW_HEIGHT;
  }
  const kekuatanLabelY = nextSectionY + SECTION_LABEL_GAP;
  const attrStartY = kekuatanLabelY + SECTION_CONTENT_GAP;
  const attrEndY = attrStartY + data.topAttributes.length * ROLE_ROW_HEIGHT;
  const footerY = attrEndY + FOOTER_TOP_GAP;
  const cardHeight = footerY + FOOTER_BOTTOM_PADDING;

  canvas.width = CARD_WIDTH;
  canvas.height = cardHeight;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context tidak tersedia di browser ini.');

  ctx.fillStyle = COLOR_BACKGROUND;
  ctx.fillRect(0, 0, CARD_WIDTH, cardHeight);

  ctx.fillStyle = COLOR_HEADER;
  ctx.fillRect(0, 0, CARD_WIDTH, HEADER_HEIGHT);

  ctx.fillStyle = COLOR_WHITE;
  ctx.font = `400 32px ${FONT_FAMILY}`;
  ctx.fillText('Position & Role Finder Minisoccer', 60, 80);
  ctx.font = `700 64px ${FONT_FAMILY}`;
  ctx.fillText(data.displayName, 60, 180);

  drawPositionColumn(
    ctx,
    { label: 'Posisi utama', name: data.positionName, position: data.position, score: data.positionScore },
    CARD_SIDE_MARGIN,
  );

  if (data.alternativePosition) {
    drawPositionColumn(
      ctx,
      {
        label: 'Posisi alternatif',
        name: data.alternativePosition.name,
        position: data.alternativePosition.position,
        score: data.alternativePosition.score,
      },
      CARD_SIDE_MARGIN + POSITION_COLUMN_WIDTH + POSITION_COLUMN_GAP,
    );
  }

  drawRoleList(ctx, data.roles, ROLE_LIST_START_Y);

  if (hasAlternativeRoles) {
    ctx.fillStyle = COLOR_TEXT_MUTED;
    ctx.font = `400 34px ${FONT_FAMILY}`;
    ctx.fillText('Role terbaik — Posisi Alternatif', CARD_SIDE_MARGIN, altRoleLabelY);
    drawRoleList(ctx, data.alternativeRoles, altRoleListStartY);
  }

  ctx.fillStyle = COLOR_TEXT_MUTED;
  ctx.font = `400 34px ${FONT_FAMILY}`;
  ctx.fillText('Kekuatan utama', 60, kekuatanLabelY);

  let y = attrStartY;
  for (const attribute of data.topAttributes) {
    ctx.fillStyle = COLOR_TEXT_DARK;
    ctx.font = `400 38px ${FONT_FAMILY}`;
    ctx.fillText(attribute.label, 60, y);
    ctx.fillStyle = COLOR_TEXT_DARK;
    ctx.font = `700 38px ${FONT_FAMILY}`;
    ctx.fillText(String(Math.round(attribute.value)), CARD_WIDTH - 160, y);
    y += ROLE_ROW_HEIGHT;
  }

  drawFooter(ctx, footerY);
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

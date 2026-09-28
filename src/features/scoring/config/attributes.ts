import type { FieldAttributeCode, GoalkeeperAttributeCode, Pillar } from '../types';

export const FIELD_ATTRIBUTE_CODES: readonly FieldAttributeCode[] = [
  'PAC', 'ACC', 'STA', 'STR', 'AGI', 'JMP',
  'FTC', 'DRB', 'PSS', 'LPS', 'FIN', 'LSH', 'CRS', 'WFT',
  'OPS', 'DPS', 'VIS', 'PRS', 'WRK',
  'TKL', 'AER', 'ANT',
  'CMP', 'AGG', 'LDR',
];

export const GOALKEEPER_ATTRIBUTE_CODES: readonly GoalkeeperAttributeCode[] = [
  'GK-REF', 'GK-POS', 'GK-DIS', 'GK-SWP', 'GK-CMD',
];

export const ATTRIBUTE_LABELS: Record<FieldAttributeCode | GoalkeeperAttributeCode, string> = {
  PAC: 'Kecepatan Puncak',
  ACC: 'Akselerasi',
  STA: 'Stamina',
  STR: 'Kekuatan Badan',
  AGI: 'Kelincahan',
  JMP: 'Jangkauan Udara',
  FTC: 'Kontrol Pertama',
  DRB: 'Dribel',
  PSS: 'Umpan Pendek',
  LPS: 'Umpan Jauh & Terobosan',
  FIN: 'Penyelesaian Akhir',
  LSH: 'Tendangan Jarak Jauh',
  CRS: 'Umpan Silang',
  WFT: 'Kaki Lemah',
  OPS: 'Positioning Menyerang',
  DPS: 'Positioning Bertahan',
  VIS: 'Visi & Keputusan',
  PRS: 'Intensitas Pressing',
  WRK: 'Work Rate Dua Arah',
  TKL: 'Tekel & Intersep',
  AER: 'Duel Udara',
  ANT: 'Antisipasi',
  CMP: 'Ketenangan',
  AGG: 'Agresivitas',
  LDR: 'Komunikasi',
  'GK-REF': 'Refleks',
  'GK-POS': 'Penempatan Posisi',
  'GK-DIS': 'Distribusi',
  'GK-SWP': 'Berani Keluar',
  'GK-CMD': 'Menguasai Kotak',
};

/** Versi Inggris `ATTRIBUTE_LABELS` — dipakai lewat `useLocalizedAttributeLabel` (src/i18n), tidak menggantikan default Indonesia. */
export const ATTRIBUTE_LABELS_EN: Record<FieldAttributeCode | GoalkeeperAttributeCode, string> = {
  PAC: 'Top Speed',
  ACC: 'Acceleration',
  STA: 'Stamina',
  STR: 'Body Strength',
  AGI: 'Agility',
  JMP: 'Aerial Reach',
  FTC: 'First Touch',
  DRB: 'Dribbling',
  PSS: 'Short Passing',
  LPS: 'Long & Through Passing',
  FIN: 'Finishing',
  LSH: 'Long Shots',
  CRS: 'Crossing',
  WFT: 'Weak Foot',
  OPS: 'Attacking Positioning',
  DPS: 'Defensive Positioning',
  VIS: 'Vision & Decision Making',
  PRS: 'Pressing Intensity',
  WRK: 'Two-Way Work Rate',
  TKL: 'Tackling & Interceptions',
  AER: 'Aerial Duels',
  ANT: 'Anticipation',
  CMP: 'Composure',
  AGG: 'Aggression',
  LDR: 'Communication',
  'GK-REF': 'Reflexes',
  'GK-POS': 'Positioning',
  'GK-DIS': 'Distribution',
  'GK-SWP': 'Sweeping',
  'GK-CMD': 'Commanding the Box',
};

/** Lima pilar untuk radar hasil (FR-12) dan deteksi jawaban tidak konsisten. */
export const ATTRIBUTE_PILLARS: Record<FieldAttributeCode, Pillar> = {
  PAC: 'Fisik', ACC: 'Fisik', STA: 'Fisik', STR: 'Fisik', AGI: 'Fisik', JMP: 'Fisik',
  FTC: 'Teknik', DRB: 'Teknik', PSS: 'Teknik', LPS: 'Teknik', FIN: 'Teknik', LSH: 'Teknik', CRS: 'Teknik', WFT: 'Teknik',
  OPS: 'Taktik', DPS: 'Taktik', VIS: 'Taktik', PRS: 'Taktik', WRK: 'Taktik',
  TKL: 'Duel', AER: 'Duel', ANT: 'Duel',
  CMP: 'Mental', AGG: 'Mental', LDR: 'Mental',
};

export const PILLARS: readonly Pillar[] = ['Fisik', 'Teknik', 'Taktik', 'Duel', 'Mental'];

/** Versi Inggris nama pilar — `Pillar` sendiri tetap dalam Bahasa Indonesia (dipakai sebagai key di seluruh pipeline scoring). */
export const PILLAR_LABELS_EN: Record<Pillar, string> = {
  Fisik: 'Physical',
  Teknik: 'Technique',
  Taktik: 'Tactics',
  Duel: 'Duels',
  Mental: 'Mental',
};

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

/** Lima pilar untuk radar hasil (FR-12) dan deteksi jawaban tidak konsisten. */
export const ATTRIBUTE_PILLARS: Record<FieldAttributeCode, Pillar> = {
  PAC: 'Fisik', ACC: 'Fisik', STA: 'Fisik', STR: 'Fisik', AGI: 'Fisik', JMP: 'Fisik',
  FTC: 'Teknik', DRB: 'Teknik', PSS: 'Teknik', LPS: 'Teknik', FIN: 'Teknik', LSH: 'Teknik', CRS: 'Teknik', WFT: 'Teknik',
  OPS: 'Taktik', DPS: 'Taktik', VIS: 'Taktik', PRS: 'Taktik', WRK: 'Taktik',
  TKL: 'Duel', AER: 'Duel', ANT: 'Duel',
  CMP: 'Mental', AGG: 'Mental', LDR: 'Mental',
};

export const PILLARS: readonly Pillar[] = ['Fisik', 'Teknik', 'Taktik', 'Duel', 'Mental'];

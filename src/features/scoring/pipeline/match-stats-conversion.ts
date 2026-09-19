import type { AttributeCode, AttributeVector, PositionCode } from '../types';
import { normalizeToCohort } from './stage4-normalize';
import type { MatchCountVector, MatchStatsVector } from './stage3-blend';

/**
 * Satu baris `matches` (PRD "Statistik pertandingan yang diinput"), sudah
 * dalam bentuk camelCase — pemetaan dari/ke kolom snake_case Supabase
 * dilakukan di features/matches, bukan di sini (modul ini murni, tanpa tahu
 * soal Supabase).
 *
 * TODO Fase 0 kalibrasi: `penilaian_diri` (kolom `matches.penilaian_diri`,
 * tabel PRD "Statistik pertandingan yang diinput") SENGAJA belum ada di
 * sini/`FIELD_MAPPINGS` — PRD menyebutnya berpengaruh ke "faktor kalibrasi
 * global" tanpa pernah mendefinisikan rumusnya di bagian manapun. Field ini
 * tetap dikumpulkan dan disimpan ke database (lihat matches/schema.ts) agar
 * datanya tersedia begitu Fase 0 Kalibrasi mendefinisikan rumusnya —
 * pola yang sama dengan `DEFAULT_COHORT_STATS`. Jangan mengarang formula
 * baru untuk ini sekarang.
 */
export interface MatchRecord {
  menitBermain: number;
  posisiDimainkan: PositionCode;
  gol?: number | null;
  assist?: number | null;
  peluangDiciptakan?: number | null;
  tekelBerhasil?: number | null;
  intersep?: number | null;
  duelUdaraMenang?: number | null;
  kehilanganBola?: number | null;
  pelanggaran?: number | null;
  cleanSheet?: boolean | null;
}

export interface MatchStatsConversionResult {
  /** S_i per atribut yang terjangkau statistik. */
  stats: MatchStatsVector;
  /** n_i — jumlah pertandingan yang memberi data untuk atribut itu. */
  counts: MatchCountVector;
  /** V — proporsi field statistik yang terisi, dirata-rata per pertandingan. */
  dataCompleteness: number;
}

type OptionalNumericField =
  | 'gol'
  | 'assist'
  | 'peluangDiciptakan'
  | 'tekelBerhasil'
  | 'intersep'
  | 'duelUdaraMenang'
  | 'kehilanganBola'
  | 'pelanggaran';

interface FieldMapping {
  field: OptionalNumericField;
  attributes: AttributeCode[];
  /** kehilangan_bola: makin banyak kehilangan bola, makin rendah FTC/CMP — pola sama seperti item terbalik Q30 di kuesioner. */
  reversed?: boolean;
}

/**
 * Pemetaan field → atribut persis Tabel "Statistik pertandingan yang
 * diinput" di PRD. `pelanggaran → AGG` sengaja TIDAK dibalik: PRD menyebut
 * "dua arah" tanpa merinci, tapi item kuesioner Q25 mengukur sinyal yang
 * identik (pelanggaran rata-rata → AGG 1,0, tidak terbalik) — mengikuti itu
 * demi konsistensi, bukan tebakan baru.
 */
const FIELD_MAPPINGS: FieldMapping[] = [
  { field: 'gol', attributes: ['FIN', 'OPS'] },
  { field: 'assist', attributes: ['VIS', 'LPS', 'CRS'] },
  { field: 'peluangDiciptakan', attributes: ['VIS', 'OPS'] },
  { field: 'tekelBerhasil', attributes: ['TKL', 'ANT'] },
  { field: 'intersep', attributes: ['ANT', 'DPS'] },
  { field: 'duelUdaraMenang', attributes: ['AER', 'JMP'] },
  { field: 'kehilanganBola', attributes: ['FTC', 'CMP'], reversed: true },
  { field: 'pelanggaran', attributes: ['AGG'] },
];

const OPTIONAL_FIELDS: OptionalNumericField[] = FIELD_MAPPINGS.map((m) => m.field);

function buildAttributeToFieldsIndex(): Map<AttributeCode, { field: OptionalNumericField; reversed?: boolean }[]> {
  const index = new Map<AttributeCode, { field: OptionalNumericField; reversed?: boolean }[]>();
  for (const mapping of FIELD_MAPPINGS) {
    for (const attribute of mapping.attributes) {
      const list = index.get(attribute) ?? [];
      list.push({ field: mapping.field, reversed: mapping.reversed });
      index.set(attribute, list);
    }
  }
  return index;
}

const ATTRIBUTE_TO_FIELDS = buildAttributeToFieldsIndex();

/**
 * Rate per-40-menit gabungan (pool bersama): pertandingan yang mengisi
 * SALAH SATU field terkait atribut ini diikutsertakan; nilai semua field
 * terkait yang terisi dijumlahkan, menit dijumlahkan sekali per
 * pertandingan (bukan per field) — PRD tidak merinci bobot antar-field
 * untuk atribut dengan >1 sumber (mis. VIS dari assist & peluang
 * diciptakan), jadi tidak mengarang bobot baru.
 */
function computePooledRate(
  matches: MatchRecord[],
  fields: { field: OptionalNumericField; reversed?: boolean }[],
): { rate: number; matchCount: number } | null {
  const relevantMatches = matches.filter((match) => fields.some(({ field }) => match[field] != null));
  if (relevantMatches.length === 0) return null;

  let sumValues = 0;
  let sumMinutes = 0;
  for (const match of relevantMatches) {
    sumMinutes += match.menitBermain;
    for (const { field } of fields) {
      const value = match[field];
      if (typeof value === 'number') sumValues += value;
    }
  }
  if (sumMinutes <= 0) return null;

  return { rate: (40 * sumValues) / sumMinutes, matchCount: relevantMatches.length };
}

/** clean_sheet (boolean, khusus GK) bukan "per 40 menit" — proporsi pertandingan GK yang bersih, sudah dalam skala 0-100. */
function computeCleanSheetRate(matches: MatchRecord[]): { rate: number; matchCount: number } | null {
  const gkMatches = matches.filter((m) => m.posisiDimainkan === 'GK' && m.cleanSheet !== null && m.cleanSheet !== undefined);
  if (gkMatches.length === 0) return null;
  const cleanCount = gkMatches.filter((m) => m.cleanSheet === true).length;
  return { rate: (cleanCount / gkMatches.length) * 100, matchCount: gkMatches.length };
}

/** menit_bermain → STA: rata-rata menit per pertandingan (bukan rate, karena menit sendiri jadi pembagi rate lain). */
function computeStaminaRate(matches: MatchRecord[]): { rate: number; matchCount: number } {
  const totalMinutes = matches.reduce((sum, m) => sum + m.menitBermain, 0);
  return { rate: totalMinutes / matches.length, matchCount: matches.length };
}

function computeDataCompleteness(matches: MatchRecord[]): number {
  const ratios = matches.map((match) => {
    // clean_sheet ditangani terpisah dari OPTIONAL_FIELDS (bukan angka),
    // hanya relevan untuk pertandingan sebagai kiper — tidak dihitung
    // sebagai field "bisa diisi" untuk pemain non-kiper.
    const fields: (keyof MatchRecord)[] =
      match.posisiDimainkan === 'GK' ? [...OPTIONAL_FIELDS, 'cleanSheet'] : OPTIONAL_FIELDS;
    const filledCount = fields.filter((field) => match[field] !== null && match[field] !== undefined).length;
    return fields.length === 0 ? 1 : filledCount / fields.length;
  });
  return ratios.reduce((sum, r) => sum + r, 0) / ratios.length;
}

/**
 * Tahap 3 (bagian S_i) — konversi statistik pertandingan mentah jadi nilai
 * atribut 0-100 + jumlah pertandingan penyumbang. Memakai kembali
 * `normalizeToCohort` (Tahap 4, `DEFAULT_COHORT_STATS`) persis seperti yang
 * dipakai untuk Q_i — TIDAK mengarang tabel persentil kohort baru. Ditandai
 * TODO Fase 0 kalibrasi lewat komentar di `normalizeToCohort` sendiri.
 */
export function convertMatchesToAttributeStats(matches: MatchRecord[]): MatchStatsConversionResult {
  if (matches.length === 0) return { stats: {}, counts: {}, dataCompleteness: 0 };

  const rawRates: AttributeVector = {};
  const counts: MatchCountVector = {};
  const reversedAttributes = new Set<AttributeCode>();

  for (const [attribute, fields] of ATTRIBUTE_TO_FIELDS) {
    const pooled = computePooledRate(matches, fields);
    if (!pooled) continue;
    rawRates[attribute] = pooled.rate;
    counts[attribute] = pooled.matchCount;
    if (fields.some((f) => f.reversed)) reversedAttributes.add(attribute);
  }

  const stamina = computeStaminaRate(matches);
  rawRates.STA = stamina.rate;
  counts.STA = stamina.matchCount;

  const cleanSheet = computeCleanSheetRate(matches);
  if (cleanSheet) {
    rawRates['GK-REF'] = cleanSheet.rate;
    rawRates['GK-POS'] = cleanSheet.rate;
    counts['GK-REF'] = cleanSheet.matchCount;
    counts['GK-POS'] = cleanSheet.matchCount;
  }

  const normalized = normalizeToCohort(rawRates);

  const stats: MatchStatsVector = {};
  for (const attribute of Object.keys(normalized) as AttributeCode[]) {
    const value = normalized[attribute];
    if (value === undefined) continue;
    stats[attribute] = reversedAttributes.has(attribute) ? 100 - value : value;
  }

  return { stats, counts, dataCompleteness: computeDataCompleteness(matches) };
}

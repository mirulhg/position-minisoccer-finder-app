export type ConfidenceLabel = 'Awal' | 'Cukup' | 'Solid';

export interface ConsistencyPair {
  /** Nilai item 0-100 setelah konversi Tahap 1, sudah memperhitungkan reversed. */
  original: number;
  duplicate: number;
}

/**
 * Skor keandalan responden `R = 1 - (rata-rata selisih absolut / 100)` dari
 * tiga pasang pertanyaan pengecekan konsistensi (Q03/Q40, Q12/Q41, Q23/Q42).
 */
export function computeReliability(pairs: ConsistencyPair[]): number {
  if (pairs.length === 0) return 1;
  const averageDiff =
    pairs.reduce((sum, pair) => sum + Math.abs(pair.original - pair.duplicate), 0) / pairs.length;
  return 1 - averageDiff / 100;
}

/**
 * `C = 0,35·R + 0,45·(N/(N+6)) + 0,20·V`. Fase 1 belum punya pertandingan
 * (`N=0`) atau statistik terisi (`V=0`), sehingga suku kedua dan ketiga
 * selalu 0 dan `C = 0,35·R` — nilai maksimum 0,35, di bawah ambang 0,4,
 * sehingga label selalu "Awal". Ini sesuai rumus PRD, bukan bug.
 */
export function computeConfidence(reliability: number, matchCount = 0, dataCompleteness = 0): number {
  const matchTerm = 0.45 * (matchCount / (matchCount + 6));
  const completenessTerm = 0.2 * dataCompleteness;
  return 0.35 * reliability + matchTerm + completenessTerm;
}

export function getConfidenceLabel(confidence: number): ConfidenceLabel {
  if (confidence >= 0.7) return 'Solid';
  if (confidence >= 0.4) return 'Cukup';
  return 'Awal';
}

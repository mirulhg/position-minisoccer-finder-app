import type { AttributeCode, AttributeVector } from '../types';
import { BLENDING_K } from '../config/global-constants';

/** Jumlah pertandingan yang memberi data untuk satu atribut. */
export type MatchCountVector = Partial<Record<AttributeCode, number>>;
export type MatchStatsVector = Partial<Record<AttributeCode, number>>;

/**
 * Tahap 3 — Blending Kuesioner + Statistik: `A_i = (1-λ_i)·Q_i + λ_i·S_i`,
 * `λ_i = n_i / (n_i + k)`. Fase 1 belum punya statistik pertandingan
 * (`matchStats`/`matchCounts` kosong), sehingga `n_i = 0` untuk semua
 * atribut dan `A_i = Q_i` persis — hasil yang benar dari rumus ini, bukan
 * jalan pintas. Fase 3 tinggal memanggil fungsi ini dengan data pertandingan
 * nyata tanpa mengubah tahap manapun setelahnya.
 */
export function blendWithMatchStats(
  questionnaireAttributes: AttributeVector,
  matchStats: MatchStatsVector = {},
  matchCounts: MatchCountVector = {},
): AttributeVector {
  const blended: AttributeVector = { ...questionnaireAttributes };

  for (const attribute of Object.keys(questionnaireAttributes) as AttributeCode[]) {
    const qValue = questionnaireAttributes[attribute];
    if (qValue === undefined) continue;

    const n = matchCounts[attribute] ?? 0;
    const sValue = matchStats[attribute];
    if (n <= 0 || sValue === undefined) {
      blended[attribute] = qValue;
      continue;
    }

    const lambda = n / (n + BLENDING_K);
    blended[attribute] = (1 - lambda) * qValue + lambda * sValue;
  }

  return blended;
}

import type { AttributeCode, AttributeVector } from '../types';
import { DEFAULT_COHORT_STATS, type CohortAttributeStats } from '../config/scoring-config.defaults';

/**
 * Tahap 4 — Normalisasi Kohort: `Ã_i = 50 + 10·(A_i - μ_i)/σ_i`, dipotong ke
 * [1, 99]. Memakai `DEFAULT_COHORT_STATS` (placeholder Fase 0) karena
 * sampel pengguna nyata masih di bawah ambang kohort 200.
 */
export function normalizeToCohort(
  attributes: AttributeVector,
  cohortStats: Record<AttributeCode, CohortAttributeStats> = DEFAULT_COHORT_STATS,
): AttributeVector {
  const normalized: AttributeVector = {};

  for (const attribute of Object.keys(attributes) as AttributeCode[]) {
    const value = attributes[attribute];
    if (value === undefined) continue;

    const stats = cohortStats[attribute];
    const raw = 50 + (10 * (value - stats.mean)) / stats.stdev;
    normalized[attribute] = Math.max(1, Math.min(99, raw));
  }

  return normalized;
}

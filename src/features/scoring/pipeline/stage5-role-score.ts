import type { AttributeVector, RoleCode } from '../types';
import { ROLE_WEIGHTS } from '../config/role-weights';

/**
 * Tahap 5 — Skor Kecocokan Role: `Base_r = (Σ w_ri · Ã_i) / (Σ w_ri)`.
 */
export function computeBaseRoleScores(attributes: AttributeVector): Record<RoleCode, number> {
  const scores: Partial<Record<RoleCode, number>> = {};

  for (const role of Object.keys(ROLE_WEIGHTS) as RoleCode[]) {
    const weights = ROLE_WEIGHTS[role];
    let weightSum = 0;
    let weightedValueSum = 0;

    for (const [attribute, weight] of Object.entries(weights)) {
      const value = attributes[attribute as keyof AttributeVector];
      if (value === undefined || weight === undefined) continue;
      weightSum += weight;
      weightedValueSum += weight * value;
    }

    scores[role] = weightSum > 0 ? weightedValueSum / weightSum : 0;
  }

  return scores as Record<RoleCode, number>;
}

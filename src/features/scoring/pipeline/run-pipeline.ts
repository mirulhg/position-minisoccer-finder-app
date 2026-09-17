import type { AttributeVector, PhysicalProfile, PositionCode, PositionScore, RoleScore } from '../types';
import type { ItemContribution } from './stage2-aggregate';
import { aggregateToAttributes, applyPhysicalAdjustments } from './stage2-aggregate';
import { blendWithMatchStats } from './stage3-blend';
import { normalizeToCohort } from './stage4-normalize';
import { computeBaseRoleScores } from './stage5-role-score';
import { computePositionScores, computeRoleScores, pickMainPosition } from './stage6-gate-tiebreak';
import { computeConfidence, computeReliability, getConfidenceLabel, type ConfidenceLabel, type ConsistencyPair } from './confidence';

export interface ScoringInput {
  itemContributions: ItemContribution[];
  physical: PhysicalProfile;
  usualPosition: PositionCode | null;
  consistencyPairs: ConsistencyPair[];
}

export interface ScoringResult {
  attributes: AttributeVector;
  roleScores: RoleScore[];
  positionScores: PositionScore[];
  mainPosition: PositionScore;
  confidence: number;
  confidenceLabel: ConfidenceLabel;
}

/** Menjalankan Tahap 1 (hasil konversi, lewat `itemContributions`) sampai Tahap 6 berurutan. */
export function computeScoringResult(input: ScoringInput): ScoringResult {
  const rawAttributes = aggregateToAttributes(input.itemContributions);
  const physicallyAdjusted = applyPhysicalAdjustments(rawAttributes, input.physical);
  const blended = blendWithMatchStats(physicallyAdjusted);
  const normalized = normalizeToCohort(blended);

  const baseScores = computeBaseRoleScores(normalized);
  const roleScores = computeRoleScores(normalized, baseScores);
  const positionScores = computePositionScores(roleScores);
  const mainPosition = pickMainPosition(positionScores, {
    roleScores,
    usualPosition: input.usualPosition,
  });

  const reliability = computeReliability(input.consistencyPairs);
  const confidence = computeConfidence(reliability);

  return {
    attributes: normalized,
    roleScores,
    positionScores,
    mainPosition,
    confidence,
    confidenceLabel: getConfidenceLabel(confidence),
  };
}

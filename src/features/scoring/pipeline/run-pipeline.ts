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
  /**
   * Q_i murni setelah penyesuaian fisik, SEBELUM blending (Tahap 3) dan
   * normalisasi kohort (Tahap 4) — persis parameter `questionnaireAttributes`
   * yang diterima `blendWithMatchStats`. Diekspos (baru dipakai mulai Fase 3)
   * supaya rekalkulasi pasca-pertandingan bisa mem-blend ulang Q_i yang sama
   * dengan `matchStats` yang baru, tanpa mengulang kuesioner. Nilai ini TIDAK
   * berubah antar rekalkulasi kecuali pemain mengulang kuesioner — hanya
   * `attributes` (hasil blend+normalize) yang berubah. Tidak ada tahap yang
   * ditulis ulang untuk mengekspos ini, cuma nilai lokal yang sudah dihitung.
   */
  questionnaireAttributes: AttributeVector;
  roleScores: RoleScore[];
  positionScores: PositionScore[];
  mainPosition: PositionScore;
  /**
   * R — skor keandalan responden dari pengecekan konsistensi. Diekspos (baru
   * dipakai mulai Fase 3) supaya rekalkulasi setelah pertandingan baru bisa
   * memanggil `computeConfidence(reliability, matchCount, dataCompleteness)`
   * dengan R yang sama seperti kuesioner terakhir, tanpa menghitung ulang R
   * dari confidence — nilai yang sudah dihitung di bawah cuma ditambahkan ke
   * hasil, rumusnya sendiri tidak berubah.
   */
  reliability: number;
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
    questionnaireAttributes: physicallyAdjusted,
    roleScores,
    positionScores,
    mainPosition,
    reliability,
    confidence,
    confidenceLabel: getConfidenceLabel(confidence),
  };
}

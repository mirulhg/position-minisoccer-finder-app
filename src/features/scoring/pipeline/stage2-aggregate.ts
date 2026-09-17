import type { AttributeCode, AttributeVector, PhysicalProfile } from '../types';
import { normalPercentile } from '../lib/normal-distribution';
import {
  DEFAULT_BMI_STATS,
  DEFAULT_HEIGHT_CM_STATS,
} from '../config/scoring-config.defaults';
import { PHYSICAL_ADJUSTMENT_CAP } from '../config/global-constants';

export interface ItemContribution {
  attribute: AttributeCode;
  weight: number;
  value: number;
}

/**
 * Tahap 2 — Agregasi ke Atribut. `Q_i = (Σ ω_ij · v_j) / (Σ ω_ij)` per atribut.
 */
export function aggregateToAttributes(contributions: ItemContribution[]): AttributeVector {
  const sums: Partial<Record<AttributeCode, { weightSum: number; weightedValueSum: number }>> = {};

  for (const { attribute, weight, value } of contributions) {
    const entry = sums[attribute] ?? (sums[attribute] = { weightSum: 0, weightedValueSum: 0 });
    entry.weightSum += weight;
    entry.weightedValueSum += weight * value;
  }

  const result: AttributeVector = {};
  for (const attribute of Object.keys(sums) as AttributeCode[]) {
    const entry = sums[attribute];
    if (entry && entry.weightSum > 0) {
      result[attribute] = entry.weightedValueSum / entry.weightSum;
    }
  }
  return result;
}

function clampDelta(delta: number): number {
  return Math.max(-PHYSICAL_ADJUSTMENT_CAP, Math.min(PHYSICAL_ADJUSTMENT_CAP, delta));
}

/**
 * Tahap 2 — penyesuaian JMP dari persentil tinggi badan dan STR dari
 * persentil BMI, keduanya dibatasi ±12 poin dari nilai kuesioner murni
 * (Lampiran B, "Batas penyesuaian fisik").
 */
export function applyPhysicalAdjustments(
  attributes: AttributeVector,
  physical: PhysicalProfile,
): AttributeVector {
  const adjusted = { ...attributes };

  const heightPercentile = normalPercentile(
    physical.heightCm,
    DEFAULT_HEIGHT_CM_STATS.mean,
    DEFAULT_HEIGHT_CM_STATS.stdev,
  );
  const qJmp = attributes.JMP ?? 50;
  const jmpRaw = 0.6 * qJmp + 0.4 * (heightPercentile * 100);
  adjusted.JMP = qJmp + clampDelta(jmpRaw - qJmp);

  const bmi = physical.weightKg / (physical.heightCm / 100) ** 2;
  const bmiPercentile = normalPercentile(bmi, DEFAULT_BMI_STATS.mean, DEFAULT_BMI_STATS.stdev);
  const qStr = attributes.STR ?? 50;
  const strRaw = 0.6 * qStr + 0.4 * (bmiPercentile * 100);
  adjusted.STR = qStr + clampDelta(strRaw - qStr);

  return adjusted;
}

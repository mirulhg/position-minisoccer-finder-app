import { ATTRIBUTE_PILLARS, PILLARS, type AttributeVector, type Pillar } from '../../scoring';

export function computePillarAverages(attributes: AttributeVector): Record<Pillar, number> {
  const sums: Record<Pillar, { total: number; count: number }> = {
    Fisik: { total: 0, count: 0 },
    Teknik: { total: 0, count: 0 },
    Taktik: { total: 0, count: 0 },
    Duel: { total: 0, count: 0 },
    Mental: { total: 0, count: 0 },
  };

  for (const [attribute, pillar] of Object.entries(ATTRIBUTE_PILLARS)) {
    const value = attributes[attribute as keyof AttributeVector];
    if (value === undefined) continue;
    sums[pillar].total += value;
    sums[pillar].count += 1;
  }

  const averages = {} as Record<Pillar, number>;
  for (const pillar of PILLARS) {
    averages[pillar] = sums[pillar].count > 0 ? sums[pillar].total / sums[pillar].count : 0;
  }
  return averages;
}

import { z } from 'zod';
import type { FieldErrors, FieldValues, Resolver } from 'react-hook-form';

export const physicalProfileSchema = z.object({
  heightCm: z.number().min(100, 'Tinggi minimal 100 cm').max(230, 'Tinggi maksimal 230 cm'),
  weightKg: z.number().min(30, 'Berat minimal 30 kg').max(150, 'Berat maksimal 150 kg'),
  age: z.number().int().min(10, 'Usia minimal 10 tahun').max(70, 'Usia maksimal 70 tahun'),
  dominantFoot: z.enum(['kiri', 'kanan', 'keduanya']),
});

export type PhysicalProfileFormValues = z.infer<typeof physicalProfileSchema>;

export const positionCodeSchema = z.enum(['GK', 'CB', 'FB', 'DM', 'CM', 'WM', 'ST']);

export const positionPreferenceSchema = z.object({
  usualPosition: positionCodeSchema.nullable(),
  willingGoalkeeper: z.boolean(),
});

export type PositionPreferenceValues = z.infer<typeof positionPreferenceSchema>;

export const onboardingProfileSchema = physicalProfileSchema.merge(positionPreferenceSchema);
export type OnboardingProfile = z.infer<typeof onboardingProfileSchema>;

/**
 * Resolver Zod kecil buatan sendiri, bukan `@hookform/resolvers` (paket
 * terpisah yang belum disetujui) — validasinya cukup 10 baris (CLAUDE.md §5).
 */
export function createZodResolver<T extends FieldValues>(schema: z.ZodType<T>): Resolver<T> {
  return async (values) => {
    const result = schema.safeParse(values);
    if (result.success) {
      return { values: result.data, errors: {} };
    }

    const errors: Record<string, { type: string; message: string }> = {};
    for (const issue of result.error.issues) {
      const key = issue.path.join('.');
      if (!errors[key]) errors[key] = { type: issue.code, message: issue.message };
    }
    return { values: {}, errors: errors as FieldErrors<T> };
  };
}

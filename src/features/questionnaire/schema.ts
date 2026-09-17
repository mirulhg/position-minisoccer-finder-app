import { z } from 'zod';

/** Bentuk minimum jawaban yang dipulihkan dari IndexedDB (FR-06). */
export const storedAnswerSchema = z.object({
  questionId: z.string(),
  value: z.union([z.number(), z.string()]),
  answeredAt: z.string(),
});

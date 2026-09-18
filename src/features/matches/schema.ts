import { z } from 'zod';

const positionCodeSchema = z.enum(['GK', 'CB', 'FB', 'DM', 'CM', 'WM', 'ST']);

/**
 * FR-14 — dua field pertama wajib (menit bermain, posisi dimainkan), semua
 * field setelah itu opsional (boleh dilewati), sesuai tabel "Statistik
 * pertandingan yang diinput" di PRD.
 */
export const matchInputSchema = z.object({
  menitBermain: z.number().int().min(1, 'Menit bermain minimal 1').max(90, 'Menit bermain maksimal 90'),
  posisiDimainkan: positionCodeSchema,
  gol: z.number().int().min(0).nullable(),
  assist: z.number().int().min(0).nullable(),
  peluangDiciptakan: z.number().int().min(0).nullable(),
  tekelBerhasil: z.number().int().min(0).nullable(),
  intersep: z.number().int().min(0).nullable(),
  duelUdaraMenang: z.number().int().min(0).nullable(),
  kehilanganBola: z.number().int().min(0).nullable(),
  pelanggaran: z.number().int().min(0).nullable(),
  cleanSheet: z.boolean().nullable(),
  penilaianDiri: z.number().int().min(1).max(5).nullable(),
});

export type MatchInputValues = z.infer<typeof matchInputSchema>;

export const EMPTY_MATCH_INPUT: MatchInputValues = {
  menitBermain: 40,
  posisiDimainkan: 'CM',
  gol: null,
  assist: null,
  peluangDiciptakan: null,
  tekelBerhasil: null,
  intersep: null,
  duelUdaraMenang: null,
  kehilanganBola: null,
  pelanggaran: null,
  cleanSheet: null,
  penilaianDiri: null,
};

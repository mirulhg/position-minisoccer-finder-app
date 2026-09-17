import { FIELD_ATTRIBUTE_CODES, GOALKEEPER_ATTRIBUTE_CODES } from './attributes';
import type { AttributeCode } from '../types';

export interface CohortAttributeStats {
  mean: number;
  stdev: number;
}

// TODO: ganti setelah Fase 0 kalibrasi panel pelatih (lihat PRD bagian Roadmap
// Rilis). Sampel pengguna nyata masih 0, jauh di bawah ambang kohort 200 di
// PRD Lampiran B, sehingga Tahap 4 (normalisasi kohort) memakai mean=50 dan
// stdev=15 seragam untuk seluruh atribut sebagai titik awal netral (skor 50
// pada input rata-rata Likert 1-5 = 3 menghasilkan Ã ≈ 50).
// Atribut kiper (GK-REF..GK-CMD) ditambahkan dengan nilai default yang sama
// karena PRD hanya menyebut "25 atribut" secara eksplisit — perluasan ini
// diperlukan agar Tahap 4-6 juga berjalan untuk pemain yang bersedia kiper.
const DEFAULT_MEAN = 50;
const DEFAULT_STDEV = 15;

export const DEFAULT_COHORT_STATS: Record<AttributeCode, CohortAttributeStats> = Object.fromEntries(
  [...FIELD_ATTRIBUTE_CODES, ...GOALKEEPER_ATTRIBUTE_CODES].map((code) => [
    code,
    { mean: DEFAULT_MEAN, stdev: DEFAULT_STDEV },
  ]),
) as Record<AttributeCode, CohortAttributeStats>;

// TODO: ganti setelah Fase 0 kalibrasi panel pelatih. Kurva normal kasar
// untuk tinggi badan pria dewasa Indonesia (asumsi ~168cm, SD 7cm) dipakai
// untuk menghitung P(tinggi) pada penyesuaian JMP di Tahap 2. Tidak ada data
// BMI di PRD; mean/stdev BMI di bawah adalah asumsi kasar rentang dewasa
// aktif (perlu disesuaikan bersama panel pelatih).
export const DEFAULT_HEIGHT_CM_STATS: CohortAttributeStats = { mean: 168, stdev: 7 };
export const DEFAULT_BMI_STATS: CohortAttributeStats = { mean: 23, stdev: 3 };

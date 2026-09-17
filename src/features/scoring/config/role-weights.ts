import type { RoleWeightMap } from '../types';

/**
 * Lampiran B — Matriks Bobot Role Penuh. Skala 0-5; atribut dengan bobot 0
 * dihilangkan dari map (tidak relevan, tidak ikut pembagi Base_r).
 *
 * PRD menyebut "16 role" di bagian taksonomi, tapi tabel bobot ini berisi 17
 * baris (termasuk GK-SS dan GK-SK). 17 dipakai di sini karena tabel bobot
 * yang lengkap — bagian taksonomi PRD perlu dikoreksi di sesi penyusunan PRD.
 */
export const ROLE_WEIGHTS: RoleWeightMap = {
  'CB-ST': {
    PAC: 2, ACC: 2, STA: 3, STR: 5, AGI: 2, JMP: 4, FTC: 2, DRB: 1, PSS: 3, LPS: 2,
    LSH: 0, WFT: 1, OPS: 0, DPS: 5, VIS: 2, PRS: 4, WRK: 3, TKL: 5, AER: 5, ANT: 4,
    CMP: 4, AGG: 4, LDR: 3,
  },
  'CB-BP': {
    PAC: 2, ACC: 2, STA: 3, STR: 4, AGI: 2, JMP: 4, FTC: 4, DRB: 2, PSS: 5, LPS: 5,
    LSH: 1, WFT: 3, OPS: 1, DPS: 5, VIS: 4, PRS: 3, WRK: 3, TKL: 4, AER: 5, ANT: 4,
    CMP: 5, AGG: 3, LDR: 4,
  },
  'CB-CV': {
    PAC: 5, ACC: 4, STA: 3, STR: 3, AGI: 3, JMP: 3, FTC: 3, DRB: 1, PSS: 3, LPS: 2,
    WFT: 2, DPS: 5, VIS: 3, PRS: 3, WRK: 3, TKL: 4, AER: 4, ANT: 5, CMP: 4, AGG: 2, LDR: 3,
  },
  'FB-DF': {
    PAC: 3, ACC: 3, STA: 4, STR: 3, AGI: 3, JMP: 2, FTC: 3, DRB: 2, PSS: 3, LPS: 2,
    CRS: 2, WFT: 3, OPS: 2, DPS: 5, VIS: 2, PRS: 4, WRK: 4, TKL: 5, AER: 3, ANT: 4,
    CMP: 3, AGG: 3, LDR: 2,
  },
  'FB-WB': {
    PAC: 4, ACC: 4, STA: 5, STR: 3, AGI: 4, JMP: 2, FTC: 3, DRB: 4, PSS: 3, LPS: 2,
    FIN: 1, LSH: 1, CRS: 5, WFT: 3, OPS: 4, DPS: 3, VIS: 3, PRS: 4, WRK: 5, TKL: 3,
    AER: 2, ANT: 3, CMP: 3, AGG: 3, LDR: 2,
  },
  'FB-IV': {
    PAC: 3, ACC: 3, STA: 4, STR: 3, AGI: 3, JMP: 2, FTC: 4, DRB: 3, PSS: 4, LPS: 3,
    LSH: 1, CRS: 2, WFT: 3, OPS: 3, DPS: 4, VIS: 4, PRS: 4, WRK: 4, TKL: 4, AER: 3,
    ANT: 4, CMP: 4, AGG: 3, LDR: 2,
  },
  'DM-AN': {
    PAC: 2, ACC: 2, STA: 4, STR: 4, AGI: 3, JMP: 3, FTC: 4, DRB: 2, PSS: 5, LPS: 3,
    LSH: 2, WFT: 3, OPS: 1, DPS: 5, VIS: 4, PRS: 5, WRK: 4, TKL: 5, AER: 3, ANT: 5,
    CMP: 4, AGG: 4, LDR: 4,
  },
  'DM-RG': {
    PAC: 2, ACC: 2, STA: 3, STR: 3, AGI: 3, JMP: 2, FTC: 5, DRB: 2, PSS: 5, LPS: 5,
    FIN: 1, LSH: 3, CRS: 1, WFT: 4, OPS: 2, DPS: 4, VIS: 5, PRS: 3, WRK: 3, TKL: 3,
    AER: 2, ANT: 4, CMP: 5, AGG: 2, LDR: 3,
  },
  'CM-B2B': {
    PAC: 3, ACC: 3, STA: 5, STR: 3, AGI: 3, JMP: 2, FTC: 4, DRB: 3, PSS: 4, LPS: 3,
    FIN: 3, LSH: 3, CRS: 2, WFT: 3, OPS: 3, DPS: 4, VIS: 4, PRS: 4, WRK: 5, TKL: 4,
    AER: 3, ANT: 3, CMP: 3, AGG: 3, LDR: 3,
  },
  'CM-AP': {
    PAC: 3, ACC: 4, STA: 3, STR: 2, AGI: 4, JMP: 1, FTC: 5, DRB: 4, PSS: 5, LPS: 4,
    FIN: 3, LSH: 4, CRS: 2, WFT: 4, OPS: 5, DPS: 2, VIS: 5, PRS: 3, WRK: 3, TKL: 2,
    AER: 2, ANT: 4, CMP: 4, AGG: 2, LDR: 3,
  },
  'WM-TW': {
    PAC: 5, ACC: 5, STA: 4, STR: 2, AGI: 5, JMP: 1, FTC: 4, DRB: 5, PSS: 3, LPS: 2,
    FIN: 2, LSH: 2, CRS: 5, WFT: 3, OPS: 4, DPS: 2, VIS: 3, PRS: 4, WRK: 4, TKL: 2,
    AER: 1, ANT: 3, CMP: 3, AGG: 2, LDR: 2,
  },
  'WM-IW': {
    PAC: 4, ACC: 5, STA: 4, STR: 2, AGI: 5, JMP: 1, FTC: 4, DRB: 5, PSS: 3, LPS: 2,
    FIN: 4, LSH: 5, CRS: 3, WFT: 2, OPS: 4, DPS: 2, VIS: 3, PRS: 4, WRK: 4, TKL: 2,
    AER: 1, ANT: 3, CMP: 4, AGG: 2, LDR: 2,
  },
  'ST-PO': {
    PAC: 3, ACC: 4, STA: 2, STR: 3, AGI: 4, JMP: 2, FTC: 4, DRB: 2, PSS: 2, LPS: 1,
    FIN: 5, LSH: 3, CRS: 1, WFT: 3, OPS: 5, DPS: 1, VIS: 3, PRS: 4, WRK: 2, TKL: 1,
    AER: 3, ANT: 3, CMP: 4, AGG: 2, LDR: 2,
  },
  'ST-TM': {
    PAC: 2, ACC: 2, STA: 2, STR: 5, AGI: 2, JMP: 5, FTC: 5, DRB: 2, PSS: 4, LPS: 2,
    FIN: 4, LSH: 2, CRS: 1, WFT: 3, OPS: 4, DPS: 1, VIS: 4, PRS: 3, WRK: 2, TKL: 1,
    AER: 5, ANT: 3, CMP: 4, AGG: 4, LDR: 3,
  },
  'ST-PF': {
    PAC: 4, ACC: 4, STA: 5, STR: 4, AGI: 3, JMP: 2, FTC: 3, DRB: 2, PSS: 3, LPS: 1,
    FIN: 4, LSH: 2, CRS: 1, WFT: 3, OPS: 4, DPS: 2, VIS: 2, PRS: 5, WRK: 5, TKL: 2,
    AER: 3, ANT: 4, CMP: 3, AGG: 5, LDR: 3,
  },
  'GK-SS': {
    'GK-REF': 5, 'GK-POS': 5, 'GK-DIS': 2, 'GK-SWP': 1, 'GK-CMD': 4,
    ANT: 3, CMP: 4, LDR: 4, FTC: 1, PSS: 1, JMP: 4, AGI: 4,
  },
  'GK-SK': {
    'GK-REF': 4, 'GK-POS': 4, 'GK-DIS': 5, 'GK-SWP': 5, 'GK-CMD': 4,
    ANT: 5, CMP: 4, LDR: 4, FTC: 4, PSS: 4, JMP: 3, AGI: 4,
  },
};

import type { RoleGateConfig } from '../types';

/** Lampiran B — Ambang Gate per Role. */
export const ROLE_GATE_THRESHOLDS: RoleGateConfig = {
  'GK-SS': [{ attribute: 'GK-REF', minValue: 55 }, { attribute: 'GK-POS', minValue: 55 }],
  'GK-SK': [{ attribute: 'GK-SWP', minValue: 55 }, { attribute: 'GK-DIS', minValue: 50 }],
  'CB-ST': [{ attribute: 'TKL', minValue: 55 }, { attribute: 'STR', minValue: 50 }],
  'CB-BP': [{ attribute: 'PSS', minValue: 55 }, { attribute: 'CMP', minValue: 55 }],
  'CB-CV': [{ attribute: 'PAC', minValue: 55 }, { attribute: 'ANT', minValue: 55 }],
  'FB-DF': [{ attribute: 'DPS', minValue: 55 }, { attribute: 'TKL', minValue: 50 }],
  'FB-WB': [{ attribute: 'STA', minValue: 60 }, { attribute: 'CRS', minValue: 50 }],
  'FB-IV': [{ attribute: 'PSS', minValue: 50 }, { attribute: 'VIS', minValue: 50 }],
  'DM-AN': [{ attribute: 'DPS', minValue: 60 }, { attribute: 'TKL', minValue: 55 }],
  'DM-RG': [{ attribute: 'PSS', minValue: 60 }, { attribute: 'VIS', minValue: 60 }],
  'CM-B2B': [{ attribute: 'STA', minValue: 60 }],
  'CM-AP': [{ attribute: 'VIS', minValue: 60 }, { attribute: 'OPS', minValue: 55 }],
  'WM-TW': [{ attribute: 'DRB', minValue: 55 }, { attribute: 'PAC', minValue: 55 }],
  'WM-IW': [{ attribute: 'DRB', minValue: 50 }, { attribute: 'FIN', minValue: 50 }],
  'ST-PO': [{ attribute: 'FIN', minValue: 55 }, { attribute: 'OPS', minValue: 50 }],
  'ST-TM': [{ attribute: 'STR', minValue: 60 }, { attribute: 'AER', minValue: 55 }],
  'ST-PF': [{ attribute: 'PRS', minValue: 60 }, { attribute: 'STA', minValue: 55 }],
};

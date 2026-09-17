export type FieldAttributeCode =
  | 'PAC' | 'ACC' | 'STA' | 'STR' | 'AGI' | 'JMP'
  | 'FTC' | 'DRB' | 'PSS' | 'LPS' | 'FIN' | 'LSH' | 'CRS' | 'WFT'
  | 'OPS' | 'DPS' | 'VIS' | 'PRS' | 'WRK'
  | 'TKL' | 'AER' | 'ANT'
  | 'CMP' | 'AGG' | 'LDR';

export type GoalkeeperAttributeCode =
  | 'GK-REF' | 'GK-POS' | 'GK-DIS' | 'GK-SWP' | 'GK-CMD';

export type AttributeCode = FieldAttributeCode | GoalkeeperAttributeCode;

export type Pillar = 'Fisik' | 'Teknik' | 'Taktik' | 'Duel' | 'Mental';

export type FieldRoleCode =
  | 'CB-ST' | 'CB-BP' | 'CB-CV'
  | 'FB-DF' | 'FB-WB' | 'FB-IV'
  | 'DM-AN' | 'DM-RG'
  | 'CM-B2B' | 'CM-AP'
  | 'WM-TW' | 'WM-IW'
  | 'ST-PO' | 'ST-TM' | 'ST-PF';

export type GoalkeeperRoleCode = 'GK-SS' | 'GK-SK';

export type RoleCode = FieldRoleCode | GoalkeeperRoleCode;

export type PositionCode = 'GK' | 'CB' | 'FB' | 'DM' | 'CM' | 'WM' | 'ST';

export type DominantFoot = 'kiri' | 'kanan' | 'keduanya';

export interface PhysicalProfile {
  heightCm: number;
  weightKg: number;
  age: number;
  dominantFoot: DominantFoot;
}

/** Nilai atribut 0-100, satu entri per AttributeCode yang relevan. */
export type AttributeVector = Partial<Record<AttributeCode, number>>;

export interface RoleWeightMap {
  [role: string]: Partial<Record<AttributeCode, number>>;
}

export interface GateThreshold {
  attribute: AttributeCode;
  minValue: number;
}

export interface RoleGateConfig {
  [role: string]: GateThreshold[];
}

export interface RoleScore {
  role: RoleCode;
  base: number;
  gate: number;
  fit: number;
}

export interface PositionScore {
  position: PositionCode;
  score: number;
  bestRole: RoleCode;
  secondRole: RoleCode | null;
}

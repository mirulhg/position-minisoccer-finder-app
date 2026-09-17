export type {
  AttributeCode,
  FieldAttributeCode,
  GoalkeeperAttributeCode,
  AttributeVector,
  Pillar,
  RoleCode,
  PositionCode,
  DominantFoot,
  PhysicalProfile,
  RoleScore,
  PositionScore,
} from './types';

export { ATTRIBUTE_LABELS, ATTRIBUTE_PILLARS, PILLARS, FIELD_ATTRIBUTE_CODES, GOALKEEPER_ATTRIBUTE_CODES } from './config/attributes';
export { ROLE_METADATA, POSITION_NAMES, ALL_ROLE_CODES } from './config/role-metadata';

export { convertLikert, convertFrequency, convertTradeOff, type TradeOffChoice } from './pipeline/stage1-item-score';
export type { ItemContribution } from './pipeline/stage2-aggregate';
export type { ConsistencyPair, ConfidenceLabel } from './pipeline/confidence';
export type { ScoringInput, ScoringResult } from './pipeline/run-pipeline';
export { computeScoringResult } from './pipeline/run-pipeline';
export { FREQUENCY_SATURATION_K } from './config/global-constants';

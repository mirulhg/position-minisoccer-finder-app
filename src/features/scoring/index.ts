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
export { FREQUENCY_SATURATION_K, SCORING_CONFIG_VERSION } from './config/global-constants';
export {
  computePositionScores,
  pickMainPosition,
  computeRoleScores,
  shouldSwitchMainPosition,
  type TieBreakContext,
} from './pipeline/stage6-gate-tiebreak';
export { computeBaseRoleScores } from './pipeline/stage5-role-score';
export { normalizeToCohort } from './pipeline/stage4-normalize';
export { blendWithMatchStats, type MatchStatsVector, type MatchCountVector } from './pipeline/stage3-blend';
export { computeConfidence, getConfidenceLabel } from './pipeline/confidence';
export {
  convertMatchesToAttributeStats,
  type MatchRecord,
  type MatchStatsConversionResult,
} from './pipeline/match-stats-conversion';
export { toPlainAttributeMap } from './lib/attribute-vector';
export { computePillarAverages } from './lib/pillar-averages';
export { rankAttributesDescending } from './lib/attribute-ranking';

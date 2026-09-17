import {
  QUESTION_BANK,
  getQuestionsExcludingKeeperBlock,
  CONSISTENCY_CHECK_QUESTION_IDS,
  type AnswerValue,
  type Question,
} from '../../questionnaire';
import {
  convertLikert,
  convertFrequency,
  convertTradeOff,
  FREQUENCY_SATURATION_K,
  type ItemContribution,
  type ConsistencyPair,
  type PositionCode,
  type PhysicalProfile,
  type ScoringInput,
  type TradeOffChoice,
} from '../../scoring';

function convertQuestionToContributions(question: Question, value: AnswerValue): ItemContribution[] {
  if (question.type === 'L') {
    return question.contributions.map((c) => ({
      attribute: c.attribute,
      weight: c.weight,
      value: convertLikert(value as 1 | 2 | 3 | 4 | 5, c.reversed),
    }));
  }

  if (question.type === 'F') {
    return question.contributions.map((c) => ({
      attribute: c.attribute,
      weight: c.weight,
      value: convertFrequency(value as number, FREQUENCY_SATURATION_K, c.reversed),
    }));
  }

  if (question.type === 'T') {
    const choice = value as TradeOffChoice;
    const contributions: ItemContribution[] = [];
    for (const option of question.left) {
      contributions.push({ attribute: option.attribute, weight: option.weight, value: convertTradeOff(choice, 'left') });
    }
    for (const option of question.right) {
      contributions.push({ attribute: option.attribute, weight: option.weight, value: convertTradeOff(choice, 'right') });
    }
    return contributions;
  }

  // Tipe 'C' (pengecekan konsistensi) tidak masuk agregasi Tahap 2 — hanya
  // dipakai untuk skor keandalan R (lihat buildConsistencyPairs).
  return [];
}

function buildConsistencyPairs(answers: Record<string, AnswerValue>): ConsistencyPair[] {
  const pairs: ConsistencyPair[] = [];

  for (const duplicateId of CONSISTENCY_CHECK_QUESTION_IDS) {
    const duplicateQuestion = QUESTION_BANK.find((q) => q.id === duplicateId);
    if (!duplicateQuestion || duplicateQuestion.type !== 'C') continue;

    const originalQuestion = QUESTION_BANK.find((q) => q.id === duplicateQuestion.pairId);
    const originalValue = answers[duplicateQuestion.pairId];
    const duplicateValue = answers[duplicateId];
    if (!originalQuestion || originalQuestion.type !== 'L' || originalValue === undefined || duplicateValue === undefined) {
      continue;
    }

    pairs.push({
      original: convertLikert(originalValue as 1 | 2 | 3 | 4 | 5, false),
      duplicate: convertLikert(duplicateValue as 1 | 2 | 3 | 4 | 5, duplicateQuestion.reversed),
    });
  }

  return pairs;
}

export function buildScoringInput(
  answers: Record<string, AnswerValue>,
  physical: PhysicalProfile,
  usualPosition: PositionCode | null,
  willingGoalkeeper: boolean,
): ScoringInput {
  const activeQuestions = willingGoalkeeper ? QUESTION_BANK : getQuestionsExcludingKeeperBlock();

  const itemContributions: ItemContribution[] = [];
  for (const question of activeQuestions) {
    const value = answers[question.id];
    if (value === undefined) continue;
    itemContributions.push(...convertQuestionToContributions(question, value));
  }

  return {
    itemContributions,
    physical,
    usualPosition,
    consistencyPairs: buildConsistencyPairs(answers),
  };
}

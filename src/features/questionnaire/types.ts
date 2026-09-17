import type { AttributeCode } from '../scoring';

export type QuestionBlock = 1 | 2 | 3 | 4 | 5 | 6;

export const BLOCK_NAMES: Record<QuestionBlock, string> = {
  1: 'Fisik',
  2: 'Menyerang',
  3: 'Bertahan',
  4: 'Teknik',
  5: 'Mental',
  6: 'Kiper',
};

export interface AttributeContribution {
  attribute: AttributeCode;
  weight: number;
  reversed?: boolean;
}

export interface LikertQuestion {
  id: string;
  type: 'L';
  block: QuestionBlock;
  text: string;
  contributions: AttributeContribution[];
}

export interface FrequencyQuestion {
  id: string;
  type: 'F';
  block: QuestionBlock;
  text: string;
  contributions: AttributeContribution[];
  /** Konstanta kejenuhan `k`; default 3 (Lampiran B) kalau tidak diisi. */
  saturationK?: number;
}

export interface TradeOffOption {
  attribute: AttributeCode;
  weight: number;
}

export interface TradeOffQuestion {
  id: string;
  type: 'T';
  block: QuestionBlock;
  text: string;
  leftLabel: string;
  rightLabel: string;
  left: TradeOffOption[];
  right: TradeOffOption[];
}

export interface ConsistencyQuestion {
  id: string;
  type: 'C';
  block: QuestionBlock;
  text: string;
  /** ID pertanyaan Likert yang diulang untuk cek konsistensi (mis. "Q03"). */
  pairId: string;
  attribute: AttributeCode;
  reversed?: boolean;
}

export type Question = LikertQuestion | FrequencyQuestion | TradeOffQuestion | ConsistencyQuestion;

export type LikertAnswerValue = 1 | 2 | 3 | 4 | 5;
export type FrequencyAnswerValue = number;
export type TradeOffAnswerValue = 'left' | 'right' | 'situational';

export type AnswerValue = LikertAnswerValue | FrequencyAnswerValue | TradeOffAnswerValue;

export interface QuestionnaireAnswer {
  questionId: string;
  value: AnswerValue;
  answeredAt: string;
}

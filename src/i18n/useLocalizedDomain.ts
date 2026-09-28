import {
  ATTRIBUTE_LABELS,
  ATTRIBUTE_LABELS_EN,
  PILLAR_LABELS_EN,
  ROLE_METADATA,
  ROLE_METADATA_EN,
  type AttributeCode,
  type Pillar,
  type RoleCode,
} from '../features/scoring';
// Deep import langsung ke config/types (BUKAN lewat barrel
// `../features/questionnaire`) — barrel itu juga mengekspor
// `QuestionnaireFlow` (dan seluruh chunk lazy-nya). `i18n` dimuat eager di
// root (`App.tsx`), jadi kalau file ini import dari barrel, seluruh chunk
// kuesioner ikut tertarik ke bundle awal (lihat komentar serupa di
// `features/results/components/SaveResultSection.tsx`).
import { QUESTION_BANK_EN } from '../features/questionnaire/config/questions.en';
import { BLOCK_NAMES, BLOCK_NAMES_EN, type Question, type QuestionBlock } from '../features/questionnaire/types';
import type { Language } from './types';
import { useTranslation } from './useTranslation';

/**
 * ATTRIBUTE_LABELS/ROLE_METADATA/PILLARS/QUESTION_BANK/BLOCK_NAMES adalah
 * data domain di-key oleh kode (attribute/role/pillar/question id/block),
 * bukan string UI biasa — helper-helper di file ini membaca `language` dari
 * Context yang sama dengan `useTranslation` (satu sumber kebenaran bahasa
 * aktif) untuk memilih dictionary Indonesia/Inggris yang tepat.
 */

/** Versi non-hook `useLocalizedAttributeLabel` — dipakai di tempat yang tidak bisa memanggil hook langsung (mis. di dalam `.map()` dalam `useMemo`), `language` diambil sekali di top-level komponen lalu diteruskan ke sini. */
export function getLocalizedAttributeLabel(code: AttributeCode, language: Language): string {
  return language === 'en' ? ATTRIBUTE_LABELS_EN[code] : ATTRIBUTE_LABELS[code];
}

export function useLocalizedAttributeLabel(code: AttributeCode): string {
  const { language } = useTranslation();
  return getLocalizedAttributeLabel(code, language);
}

export function useLocalizedPillarLabel(pillar: Pillar): string {
  const { language } = useTranslation();
  return language === 'en' ? PILLAR_LABELS_EN[pillar] : pillar;
}

export interface LocalizedRoleMetadata {
  name: string;
  description: string;
  proExample: string;
}

export function useLocalizedRoleMetadata(roleCode: RoleCode): LocalizedRoleMetadata {
  const { language } = useTranslation();
  const base = ROLE_METADATA[roleCode];
  if (language === 'en') {
    const en = ROLE_METADATA_EN[roleCode];
    return { name: base.name, description: en.description, proExample: en.proExample };
  }
  return { name: base.name, description: base.description, proExample: base.proExample };
}

export function useLocalizedBlockName(block: QuestionBlock): string {
  const { language } = useTranslation();
  return language === 'en' ? BLOCK_NAMES_EN[block] : BLOCK_NAMES[block];
}

/**
 * `text`/`leftLabel`/`rightLabel` terlokalisasi dari sebuah `Question` —
 * field lain (contributions, attribute, weight, dst) tidak berubah per
 * bahasa, jadi diteruskan apa adanya dari `question` yang diberikan.
 * Fallback ke Indonesia (bukan crash/undefined) kalau `QUESTION_BANK_EN`
 * kebetulan belum punya entri untuk `question.id` — kelengkapan 50 id
 * divalidasi lewat test (`questions.en.test.ts`), helper ini murni jaring
 * pengaman runtime kalau validasi itu somehow terlewat.
 */
export function useLocalizedQuestion(question: Question): Question {
  const { language } = useTranslation();
  if (language !== 'en') return question;

  const localized = QUESTION_BANK_EN[question.id];
  if (!localized) {
    if (import.meta.env.DEV) {
      console.warn(`[i18n] QUESTION_BANK_EN kehilangan entri untuk pertanyaan "${question.id}" — fallback ke teks Indonesia.`);
    }
    return question;
  }

  if (question.type === 'T') {
    return {
      ...question,
      text: localized.text,
      leftLabel: localized.leftLabel ?? question.leftLabel,
      rightLabel: localized.rightLabel ?? question.rightLabel,
    };
  }

  return { ...question, text: localized.text };
}

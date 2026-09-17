import { useEffect, useState } from 'react';
import { dbGetAll, dbPut } from '../../../lib/db';
import { QUESTION_BANK, getQuestionsExcludingKeeperBlock } from '../config/questions';
import { storedAnswerSchema } from '../schema';
import type { AnswerValue, Question } from '../types';

export function useQuestionnaireSession(willingGoalkeeper: boolean) {
  const questions: Question[] = willingGoalkeeper ? QUESTION_BANK : getQuestionsExcludingKeeperBlock();

  const [isLoading, setIsLoading] = useState(true);
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({});
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // Memulihkan jawaban tersimpan dari IndexedDB; posisi terakhir diturunkan
    // dari jawaban itu sendiri (pertanyaan pertama yang belum terjawab),
    // bukan penanda progres terpisah — satu sumber kebenaran (FR-06).
    let isMounted = true;

    dbGetAll<unknown>('answers').then((storedAnswers) => {
      if (!isMounted) return;

      const loaded: Record<string, AnswerValue> = {};
      for (const raw of storedAnswers) {
        const parsed = storedAnswerSchema.safeParse(raw);
        if (parsed.success) loaded[parsed.data.questionId] = parsed.data.value as AnswerValue;
      }

      const firstUnanswered = questions.findIndex((question) => !(question.id in loaded));
      setAnswers(loaded);
      setCurrentIndex(firstUnanswered === -1 ? questions.length : firstUnanswered);
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
    };
    // Hanya sekali saat sesi dibuka; `questions` tetap sama sepanjang sesi
    // karena willingGoalkeeper tidak berubah setelah onboarding.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isComplete = currentIndex >= questions.length;

  async function submitPage(pageQuestionIds: string[], values: Record<string, AnswerValue>): Promise<void> {
    const answeredAt = new Date().toISOString();
    await Promise.all(
      pageQuestionIds.map((id) => dbPut('answers', id, { questionId: id, value: values[id], answeredAt })),
    );
    setAnswers((prev) => ({ ...prev, ...values }));
    setCurrentIndex((prev) => prev + pageQuestionIds.length);
  }

  function goBackPage(pageLength: number): void {
    setCurrentIndex((prev) => Math.max(0, prev - pageLength));
  }

  return {
    isLoading,
    questions,
    answers,
    currentIndex,
    isComplete,
    submitPage,
    goBackPage,
  };
}

import { useState } from 'react';
import { Button } from '../../../components/ui/Button';
import { RestartButton } from '../../../components/RestartButton';
import { useTranslation } from '../../../i18n';
import { QuestionCard } from './QuestionCard';
import type { AnswerValue, Question } from '../types';

interface QuestionPageProps {
  questions: Question[];
  initialAnswers: Record<string, AnswerValue>;
  onSubmit: (values: Record<string, AnswerValue>) => void;
  onBack: (() => void) | null;
  onRestart: () => void;
}

export function QuestionPage({ questions, initialAnswers, onSubmit, onBack, onRestart }: QuestionPageProps) {
  const { t } = useTranslation();
  const [draft, setDraft] = useState<Record<string, AnswerValue>>(() => {
    const seeded: Record<string, AnswerValue> = {};
    for (const question of questions) {
      if (initialAnswers[question.id] !== undefined) {
        seeded[question.id] = initialAnswers[question.id];
      } else if (question.type === 'F') {
        // NumberStepper menampilkan 0 sebagai default visual, dan bagi pemain
        // awam "0 yang tertampil = tidak pernah melakukannya" adalah jawaban
        // sah — status terjawab di state harus sinkron dengan itu sejak awal,
        // bukan menunggu tombol +/− ditekan (kalau tidak, "Lanjut" disabled
        // tanpa alasan yang terlihat).
        seeded[question.id] = 0;
      }
    }
    return seeded;
  });

  const canSubmit = questions.every((question) => draft[question.id] !== undefined);

  function handleAnswerChange(questionId: string, value: AnswerValue) {
    setDraft((prev) => ({ ...prev, [questionId]: value }));
  }

  return (
    <div className="flex min-h-[calc(100dvh-4rem)] flex-col gap-8 px-4 py-6 lg:grid lg:grid-cols-2 lg:gap-6 lg:[&>*:last-child]:col-span-2">
      {questions.map((question) => (
        <QuestionCard
          key={question.id}
          question={question}
          value={draft[question.id]}
          onChange={(value) => handleAnswerChange(question.id, value)}
        />
      ))}

      <div className="mt-auto flex flex-col gap-4 pt-6">
        <div className="flex gap-3">
          {onBack && (
            <Button variant="secondary" onClick={onBack} className="flex-1">
              {t.common.back}
            </Button>
          )}
          <Button onClick={() => onSubmit(draft)} disabled={!canSubmit} className="flex-1">
            {t.common.next}
          </Button>
        </div>
        <RestartButton onRestart={onRestart} />
      </div>
    </div>
  );
}

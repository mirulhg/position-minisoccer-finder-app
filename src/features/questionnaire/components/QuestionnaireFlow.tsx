import { useEffect, useState } from 'react';
import { ProgressBar } from '../../../components/ui/ProgressBar';
import { useMediaQuery } from '../../../hooks/useMediaQuery';
import { useQuestionnaireSession } from '../hooks/useQuestionnaireSession';
import { BlockTransition } from './BlockTransition';
import { QuestionPage } from './QuestionPage';
import type { AnswerValue, Question, QuestionBlock } from '../types';

interface QuestionnaireFlowProps {
  willingGoalkeeper: boolean;
  onComplete: (answers: Record<string, AnswerValue>) => void;
}

function buildPage(questions: Question[], startIndex: number, pageSize: number): Question[] {
  if (startIndex >= questions.length) return [];
  const block = questions[startIndex].block;
  const page: Question[] = [];
  for (let i = startIndex; i < questions.length && page.length < pageSize; i += 1) {
    if (questions[i].block !== block) break;
    page.push(questions[i]);
  }
  return page;
}

export function QuestionnaireFlow({ willingGoalkeeper, onComplete }: QuestionnaireFlowProps) {
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const { isLoading, questions, answers, currentIndex, isComplete, submitPage, goBackPage } =
    useQuestionnaireSession(willingGoalkeeper);
  const [transitionDismissedAt, setTransitionDismissedAt] = useState(-1);

  useEffect(() => {
    // Meneruskan status selesai ke parent saat sesi dipulihkan dari
    // IndexedDB dalam keadaan sudah lengkap (dibuka kembali setelah pernah
    // menyelesaikan seluruh pertanyaan sebelum sempat pindah layar).
    if (!isLoading && isComplete) onComplete(answers);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, isComplete]);

  if (isLoading) {
    return <p className="text-center text-neutral-500">Memuat kuesioner…</p>;
  }

  if (isComplete) {
    return null;
  }

  const pageSize = isDesktop ? 3 : 1;
  const page = buildPage(questions, currentIndex, pageSize);
  const previousBlock: QuestionBlock | null = currentIndex > 0 ? questions[currentIndex - 1].block : null;
  const enteringNewBlock = previousBlock !== null && previousBlock !== page[0].block;
  const showTransition = enteringNewBlock && transitionDismissedAt !== currentIndex;

  if (showTransition) {
    return <BlockTransition block={page[0].block} onContinue={() => setTransitionDismissedAt(currentIndex)} />;
  }

  function handleSubmitPage(values: Record<string, AnswerValue>) {
    submitPage(page.map((q) => q.id), values);
  }

  function handleBack() {
    goBackPage(page.length);
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <div className="px-4 pt-4">
        <ProgressBar percent={(currentIndex / questions.length) * 100} label="Progres kuesioner" />
      </div>
      <QuestionPage
        key={page.map((q) => q.id).join(',')}
        questions={page}
        initialAnswers={answers}
        onSubmit={handleSubmitPage}
        onBack={currentIndex > 0 ? handleBack : null}
      />
    </div>
  );
}

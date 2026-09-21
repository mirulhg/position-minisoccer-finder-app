import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion, type Transition } from 'motion/react';
import { ProgressBar } from '../../../components/ui/ProgressBar';
import { useMediaQuery } from '../../../hooks/useMediaQuery';
import { trackEvent } from '../../../lib/analytics';
import { useQuestionnaireSession } from '../hooks/useQuestionnaireSession';
import { BlockTransition } from './BlockTransition';
import { QuestionPage } from './QuestionPage';
import type { AnswerValue, Question, QuestionBlock } from '../types';

interface QuestionnaireFlowProps {
  willingGoalkeeper: boolean;
  onComplete: (answers: Record<string, AnswerValue>) => void;
  onRestart: () => void;
}

const PAGE_TRANSITION: Transition = { duration: 0.22, ease: 'easeOut' };
const PAGE_HIDDEN_ENTER = { opacity: 0, x: 16 };
const PAGE_HIDDEN_EXIT = { opacity: 0, x: -16 };
const PAGE_VISIBLE = { opacity: 1, x: 0 };

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

export function QuestionnaireFlow({ willingGoalkeeper, onComplete, onRestart }: QuestionnaireFlowProps) {
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const { isLoading, questions, answers, currentIndex, isComplete, submitPage, goBackPage } =
    useQuestionnaireSession(willingGoalkeeper);
  const [transitionDismissedAt, setTransitionDismissedAt] = useState(-1);
  const shouldReduceMotion = useReducedMotion();

  const pageSize = isDesktop ? 3 : 1;
  const page = buildPage(questions, currentIndex, pageSize);
  const previousBlock: QuestionBlock | null = currentIndex > 0 ? questions[currentIndex - 1].block : null;
  const enteringNewBlock = previousBlock !== null && page.length > 0 && previousBlock !== page[0].block;
  const showTransition = enteringNewBlock && transitionDismissedAt !== currentIndex;
  const pageKey = page.map((q) => q.id).join(',');

  useEffect(() => {
    // Meneruskan status selesai ke parent saat sesi dipulihkan dari
    // IndexedDB dalam keadaan sudah lengkap (dibuka kembali setelah pernah
    // menyelesaikan seluruh pertanyaan sebelum sempat pindah layar).
    if (!isLoading && isComplete) {
      trackEvent('questionnaire_completed');
      onComplete(answers);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, isComplete]);

  useEffect(() => {
    // Instrumentasi funnel (NFR Observabilitas): satu event per pertanyaan
    // yang benar-benar tampil (bukan saat layar transisi blok), fire-and-forget.
    if (isLoading || isComplete || showTransition || page.length === 0) return;
    for (let i = 0; i < page.length; i += 1) {
      trackEvent('questionnaire_question_viewed', {
        question_id: page[i].id,
        index: currentIndex + i,
        total: questions.length,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, isComplete, showTransition, pageKey]);

  if (isLoading) {
    return <p className="text-center text-neutral-500">Memuat kuesioner…</p>;
  }

  if (isComplete) {
    return null;
  }

  function handleSubmitPage(values: Record<string, AnswerValue>) {
    submitPage(page.map((q) => q.id), values);
  }

  function handleBack() {
    goBackPage(page.length);
  }

  return (
    // AnimatePresence terluar ini murni untuk transisi keluar-masuk
    // BlockTransition <-> layar pertanyaan (exit fade+scale saat "Lanjut"
    // BlockTransition diklik) — terpisah dari AnimatePresence di dalam
    // untuk transisi antar-halaman pertanyaan, supaya keduanya tidak saling
    // ganggu kunci/exit masing-masing.
    <AnimatePresence mode="wait">
      {showTransition ? (
        <BlockTransition
          key="block-transition"
          block={page[0].block}
          onContinue={() => setTransitionDismissedAt(currentIndex)}
        />
      ) : (
        <div key="question-page" className="flex min-h-dvh flex-col">
          <div className="px-4 pt-4">
            <ProgressBar percent={(currentIndex / questions.length) * 100} label="Progres kuesioner" />
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={pageKey}
              initial={shouldReduceMotion ? false : PAGE_HIDDEN_ENTER}
              animate={PAGE_VISIBLE}
              exit={shouldReduceMotion ? undefined : PAGE_HIDDEN_EXIT}
              transition={PAGE_TRANSITION}
            >
              <QuestionPage
                questions={page}
                initialAnswers={answers}
                onSubmit={handleSubmitPage}
                onBack={currentIndex > 0 ? handleBack : null}
                onRestart={onRestart}
              />
            </motion.div>
          </AnimatePresence>
        </div>
      )}
    </AnimatePresence>
  );
}

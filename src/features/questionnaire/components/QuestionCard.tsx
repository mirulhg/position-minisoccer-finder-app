import { ChoiceCard } from '../../../components/ui/ChoiceCard';
import { NumberStepper } from '../../../components/ui/NumberStepper';
import type { AnswerValue, Question } from '../types';

interface QuestionCardProps {
  question: Question;
  value: AnswerValue | undefined;
  onChange: (value: AnswerValue) => void;
}

const LIKERT_LABELS = ['Hampir tidak pernah', 'Jarang', 'Kadang-kadang', 'Sering', 'Hampir selalu'] as const;

export function QuestionCard({ question, value, onChange }: QuestionCardProps) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-lg leading-snug text-neutral-900">{question.text}</p>

      {(question.type === 'L' || question.type === 'C') && (
        <div className="flex flex-col gap-2">
          {LIKERT_LABELS.map((label, index) => {
            const optionValue = index + 1;
            return (
              <ChoiceCard key={optionValue} selected={value === optionValue} onSelect={() => onChange(optionValue)}>
                {label}
              </ChoiceCard>
            );
          })}
        </div>
      )}

      {question.type === 'F' && (
        <NumberStepper
          label="Berapa kali per pertandingan?"
          value={typeof value === 'number' ? value : 0}
          onChange={onChange}
        />
      )}

      {question.type === 'T' && (
        <div className="flex flex-col gap-2">
          <ChoiceCard selected={value === 'left'} onSelect={() => onChange('left')}>
            {question.leftLabel}
          </ChoiceCard>
          <ChoiceCard selected={value === 'situational'} onSelect={() => onChange('situational')}>
            Tergantung situasi
          </ChoiceCard>
          <ChoiceCard selected={value === 'right'} onSelect={() => onChange('right')}>
            {question.rightLabel}
          </ChoiceCard>
        </div>
      )}
    </div>
  );
}

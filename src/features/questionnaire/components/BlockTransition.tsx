import { Button } from '../../../components/ui/Button';
import type { QuestionBlock } from '../types';
import { BLOCK_NAMES } from '../types';

interface BlockTransitionProps {
  block: QuestionBlock;
  onContinue: () => void;
}

export function BlockTransition({ block, onContinue }: BlockTransitionProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-4 text-center">
      <p className="text-sm font-medium text-neutral-400">Blok berikutnya</p>
      <h2 className="text-3xl font-semibold text-neutral-900">{BLOCK_NAMES[block]}</h2>
      <Button onClick={onContinue}>Lanjut</Button>
    </div>
  );
}

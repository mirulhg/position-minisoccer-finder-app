import { Button } from '../../../components/ui/Button';
import { BLOCK_ICON_PATHS } from '../config/block-icons';
import type { QuestionBlock } from '../types';
import { BLOCK_NAMES } from '../types';

interface BlockTransitionProps {
  block: QuestionBlock;
  onContinue: () => void;
}

export function BlockTransition({ block, onContinue }: BlockTransitionProps) {
  const iconPath = BLOCK_ICON_PATHS[block];

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-4 text-center">
      <p className="text-sm font-medium text-neutral-400">Blok berikutnya</p>
      {iconPath && <img src={iconPath} alt="" className="h-16 w-16" />}
      <h2 className="text-3xl font-semibold text-neutral-900">{BLOCK_NAMES[block]}</h2>
      <Button onClick={onContinue}>Lanjut</Button>
    </div>
  );
}

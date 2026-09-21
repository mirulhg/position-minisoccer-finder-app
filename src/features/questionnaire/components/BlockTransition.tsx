import { motion, useReducedMotion, type Variants } from 'motion/react';
import { Button } from '../../../components/ui/Button';
import { BLOCK_ICON_PATHS } from '../config/block-icons';
import type { QuestionBlock } from '../types';
import { BLOCK_NAMES } from '../types';

interface BlockTransitionProps {
  block: QuestionBlock;
  onContinue: () => void;
}

/** Container mengontrol urutan reveal 4 anaknya lewat `staggerChildren` — bukan delay manual per elemen. */
const CONTAINER_VARIANTS: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const LABEL_VARIANTS: Variants = {
  hidden: { opacity: 0, y: -8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.2, ease: 'easeOut' } },
};

const ICON_VARIANTS: Variants = {
  hidden: { opacity: 0, scale: 0.5 },
  visible: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 15 } },
};

const NAME_VARIANTS: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' } },
};

const BUTTON_VARIANTS: Variants = NAME_VARIANTS;

export function BlockTransition({ block, onContinue }: BlockTransitionProps) {
  const iconPath = BLOCK_ICON_PATHS[block];
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      className="flex flex-1 flex-col items-center justify-center gap-6 px-4 text-center"
      variants={CONTAINER_VARIANTS}
      initial={shouldReduceMotion ? false : 'hidden'}
      animate="visible"
      exit={shouldReduceMotion ? undefined : { opacity: 0, scale: 0.98, transition: { duration: 0.18, ease: 'easeOut' } }}
    >
      <motion.p variants={LABEL_VARIANTS} className="text-sm font-medium text-neutral-400">
        Blok berikutnya
      </motion.p>
      {iconPath && <motion.img variants={ICON_VARIANTS} src={iconPath} alt="" className="h-16 w-16" />}
      <motion.h2 variants={NAME_VARIANTS} className="text-3xl font-semibold text-neutral-900">
        {BLOCK_NAMES[block]}
      </motion.h2>
      <motion.div variants={BUTTON_VARIANTS}>
        <Button onClick={onContinue}>Lanjut</Button>
      </motion.div>
    </motion.div>
  );
}

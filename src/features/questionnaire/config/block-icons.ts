import type { QuestionBlock } from '../types';

export const BLOCK_ICON_PATHS: Partial<Record<QuestionBlock, string>> = {
  1: '/icons/001-strength.svg', // Fisik
  2: '/icons/sword.svg', // Menyerang
  3: '/icons/005-defence.svg', // Bertahan
  4: '/icons/006-kicking-ball.svg', // Teknik
  5: '/icons/010-mind.svg', // Mental
  // 6 (Kiper) sengaja tidak dipetakan — belum ada icon untuk blok ini.
};

import { PositionCodeBadge } from '../../../components/ui/PositionBadge';
import { POSITION_ENGLISH_NAMES, type PositionScore } from '../../scoring';
import { AnimatedScore } from './AnimatedScore';

interface AlternativePositionProps {
  positionScore: PositionScore;
}

export function AlternativePosition({ positionScore }: AlternativePositionProps) {
  const score = Math.round(positionScore.score);

  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <p className="text-xs text-neutral-500 sm:text-sm">Posisi alternatifmu</p>
      <h2 className="text-2xl font-semibold leading-tight text-neutral-900 sm:text-3xl">
        {POSITION_ENGLISH_NAMES[positionScore.position]}
      </h2>
      <PositionCodeBadge position={positionScore.position} />
      <div className="flex flex-col items-center gap-1">
        <span className="text-2xl font-semibold text-neutral-900">
          <AnimatedScore value={score} />
          <span className="sr-only">{score}</span>
        </span>
      </div>
    </div>
  );
}

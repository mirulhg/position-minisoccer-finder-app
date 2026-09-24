import { Card } from '../../../components/ui/Card';
import { PositionBadge } from '../../../components/ui/PositionBadge';
import type { PositionScore } from '../../scoring';
import { AnimatedScore } from './AnimatedScore';

interface AlternativePositionProps {
  positionScore: PositionScore;
}

export function AlternativePosition({ positionScore }: AlternativePositionProps) {
  const score = Math.round(positionScore.score);

  return (
    <Card>
      <p className="text-sm text-neutral-500">Posisi alternatif</p>
      <div className="mt-1 flex items-center justify-between">
        <PositionBadge position={positionScore.position} />
        <span className="text-lg font-semibold text-neutral-900">
          <AnimatedScore value={score} />
          <span className="sr-only">{score}</span>
        </span>
      </div>
    </Card>
  );
}

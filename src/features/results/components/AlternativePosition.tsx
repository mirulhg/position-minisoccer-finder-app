import { Card } from '../../../components/ui/Card';
import { POSITION_NAMES, type PositionScore } from '../../scoring';

interface AlternativePositionProps {
  positionScore: PositionScore;
}

export function AlternativePosition({ positionScore }: AlternativePositionProps) {
  return (
    <Card>
      <p className="text-sm text-neutral-500">Posisi alternatif</p>
      <div className="mt-1 flex items-baseline justify-between">
        <h3 className="text-lg font-semibold text-neutral-900">{POSITION_NAMES[positionScore.position]}</h3>
        <span className="text-lg font-semibold text-primary-700">{Math.round(positionScore.score)}</span>
      </div>
    </Card>
  );
}

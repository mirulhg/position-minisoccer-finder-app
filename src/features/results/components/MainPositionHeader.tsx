import { POSITION_NAMES, type ConfidenceLabel, type PositionScore } from '../../scoring';

interface MainPositionHeaderProps {
  positionScore: PositionScore;
  confidenceLabel: ConfidenceLabel;
}

export function MainPositionHeader({ positionScore, confidenceLabel }: MainPositionHeaderProps) {
  return (
    <div className="flex flex-col gap-2 text-center">
      <p className="text-sm text-neutral-500">Posisi utamamu</p>
      <h1 className="text-4xl font-semibold text-neutral-900">{POSITION_NAMES[positionScore.position]}</h1>
      <div className="flex items-center justify-center gap-2">
        <span className="text-2xl font-semibold text-primary-700">{Math.round(positionScore.score)}</span>
        <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-600">
          Confidence: {confidenceLabel}
        </span>
      </div>
    </div>
  );
}

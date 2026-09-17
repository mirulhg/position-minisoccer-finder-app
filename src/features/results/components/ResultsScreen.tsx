import { useMemo } from 'react';
import type { AnswerValue } from '../../questionnaire';
import { computeScoringResult, type PhysicalProfile, type PositionCode } from '../../scoring';
import { buildScoringInput } from '../lib/answers-to-scoring-input';
import { computePillarAverages } from '../lib/pillar-averages';
import { MainPositionHeader } from './MainPositionHeader';
import { RoleCard } from './RoleCard';
import { WhyBlock } from './WhyBlock';
import { PillarRadar } from './PillarRadar';
import { AlternativePosition } from './AlternativePosition';
import { DisabledCallouts } from './DisabledCallouts';

interface ResultsScreenProps {
  answers: Record<string, AnswerValue>;
  physical: PhysicalProfile;
  usualPosition: PositionCode | null;
  willingGoalkeeper: boolean;
}

export function ResultsScreen({ answers, physical, usualPosition, willingGoalkeeper }: ResultsScreenProps) {
  const result = useMemo(() => {
    const input = buildScoringInput(answers, physical, usualPosition, willingGoalkeeper);
    return computeScoringResult(input);
  }, [answers, physical, usualPosition, willingGoalkeeper]);

  const topRolesInMainPosition = useMemo(() => {
    return result.roleScores
      .filter((score) => score.role === result.mainPosition.bestRole || score.role === result.mainPosition.secondRole)
      .sort((a, b) => b.fit - a.fit);
  }, [result]);

  const alternativePosition = useMemo(() => {
    return [...result.positionScores]
      .filter((score) => score.position !== result.mainPosition.position)
      .sort((a, b) => b.score - a.score)[0];
  }, [result]);

  const pillarAverages = useMemo(() => computePillarAverages(result.attributes), [result]);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-4 py-8 md:grid md:grid-cols-2 md:gap-6">
      <div className="md:col-span-2">
        <MainPositionHeader positionScore={result.mainPosition} confidenceLabel={result.confidenceLabel} />
      </div>

      {topRolesInMainPosition.map((roleScore) => (
        <RoleCard key={roleScore.role} roleScore={roleScore} />
      ))}

      <div className="md:col-span-2">
        <WhyBlock attributes={result.attributes} />
      </div>

      <div className="md:col-span-2 flex justify-center">
        <PillarRadar values={pillarAverages} />
      </div>

      {alternativePosition && (
        <div className="md:col-span-2">
          <AlternativePosition positionScore={alternativePosition} />
        </div>
      )}

      <div className="md:col-span-2">
        <DisabledCallouts />
      </div>
    </div>
  );
}

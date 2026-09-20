import { useEffect, useMemo } from 'react';
import { trackEvent } from '../../../lib/analytics';
import { deriveDisplayName, useAuthSession } from '../../auth';
import { PositionChangeBanner } from '../../history';
import type { AnswerValue } from '../../questionnaire';
import {
  ATTRIBUTE_LABELS,
  POSITION_NAMES,
  ROLE_METADATA,
  computePillarAverages,
  computeScoringResult,
  rankAttributesDescending,
  type PhysicalProfile,
  type PositionCode,
} from '../../scoring';
import { buildScoringInput } from '../lib/answers-to-scoring-input';
import { MainPositionHeader } from './MainPositionHeader';
import { RoleCard } from './RoleCard';
import { WhyBlock } from './WhyBlock';
import { PillarRadar } from './PillarRadar';
import { PillarBreakdown } from './PillarBreakdown';
import { AlternativePosition } from './AlternativePosition';
import { AllRolesList } from './AllRolesList';
import { SaveResultSection } from './SaveResultSection';
import { ResultActions } from './ResultActions';
import { RestartButton } from '../../../components/RestartButton';

interface ResultsScreenProps {
  answers: Record<string, AnswerValue>;
  physical: PhysicalProfile;
  usualPosition: PositionCode | null;
  willingGoalkeeper: boolean;
  onViewHistory: () => void;
  onRestart: () => void;
  onLogMatch: () => void;
}

export function ResultsScreen({
  answers,
  physical,
  usualPosition,
  willingGoalkeeper,
  onViewHistory,
  onRestart,
  onLogMatch,
}: ResultsScreenProps) {
  const { session } = useAuthSession();

  const result = useMemo(() => {
    const input = buildScoringInput(answers, physical, usualPosition, willingGoalkeeper);
    return computeScoringResult(input);
  }, [answers, physical, usualPosition, willingGoalkeeper]);

  useEffect(() => {
    // Instrumentasi funnel (NFR Observabilitas), fire-and-forget.
    trackEvent('results_viewed', {
      position: result.mainPosition.position,
      confidence_label: result.confidenceLabel,
    });
  }, [result]);

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

  const onboardingProfile = { ...physical, usualPosition, willingGoalkeeper };

  const cardData = useMemo(() => {
    const topAttributes = rankAttributesDescending(result.attributes)
      .slice(0, 3)
      .map(([attribute, value]) => ({ label: ATTRIBUTE_LABELS[attribute], value }));

    return {
      displayName: session ? deriveDisplayName(session.user) : 'Pemain Minisoccer',
      positionName: POSITION_NAMES[result.mainPosition.position],
      positionScore: result.mainPosition.score,
      roles: topRolesInMainPosition.map((score) => ({ name: ROLE_METADATA[score.role].name, fit: score.fit })),
      topAttributes,
    };
  }, [result, session, topRolesInMainPosition]);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-4 py-8 md:grid md:grid-cols-2 md:gap-6">
      <div className="md:col-span-2">
        <PositionChangeBanner />
      </div>

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

      <div className="md:col-span-2">
        <PillarBreakdown values={pillarAverages} />
      </div>

      {alternativePosition && (
        <div className="md:col-span-2">
          <AlternativePosition positionScore={alternativePosition} />
        </div>
      )}

      <div className="md:col-span-2">
        <AllRolesList roleScores={result.roleScores} />
      </div>

      <div className="md:col-span-2">
        <SaveResultSection profile={onboardingProfile} scoringResult={result} onViewHistory={onViewHistory} />
      </div>

      <div className="md:col-span-2">
        <ResultActions cardData={cardData} onLogMatch={onLogMatch} />
      </div>

      <div className="md:col-span-2 border-t border-neutral-200 pt-6">
        <RestartButton onRestart={onRestart} />
      </div>
    </div>
  );
}

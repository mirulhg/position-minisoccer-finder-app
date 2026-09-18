import { useEffect, useState } from 'react';
import { trackEvent } from '../../../lib/analytics';
import { PhysicalProfileForm } from './PhysicalProfileForm';
import { PositionPreferenceStep } from './PositionPreferenceStep';
import { useOnboardingProfile } from '../hooks/useOnboardingProfile';
import type { OnboardingProfile, PhysicalProfileFormValues } from '../schema';

interface OnboardingFlowProps {
  onComplete: (profile: OnboardingProfile) => void;
}

type OnboardingStep = 'physical' | 'position';

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const { profile, isLoading, saveProfile } = useOnboardingProfile();
  const [step, setStep] = useState<OnboardingStep>('physical');

  useEffect(() => {
    // Instrumentasi funnel (NFR Observabilitas): dikirim fire-and-forget,
    // tidak pernah mem-block render langkah onboarding.
    if (!isLoading) trackEvent('onboarding_step_viewed', { step });
  }, [step, isLoading]);

  if (isLoading) {
    return <p className="text-center text-neutral-500">Memuat profil…</p>;
  }

  function handlePhysicalSubmit(values: PhysicalProfileFormValues) {
    saveProfile(values);
    setStep('position');
  }

  async function handlePositionSubmit(values: { usualPosition: OnboardingProfile['usualPosition']; willingGoalkeeper: boolean }) {
    await saveProfile(values);
    const merged = { ...profile, ...values };
    trackEvent('onboarding_completed');
    onComplete(merged as OnboardingProfile);
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-6 px-4 py-8">
      {step === 'physical' && (
        <>
          <h1 className="text-2xl font-semibold text-neutral-900">Profil fisik</h1>
          <PhysicalProfileForm defaultValues={profile ?? undefined} onSubmit={handlePhysicalSubmit} />
        </>
      )}
      {step === 'position' && (
        <PositionPreferenceStep
          defaultValues={profile ?? undefined}
          onSubmit={handlePositionSubmit}
          onBack={() => setStep('physical')}
        />
      )}
    </div>
  );
}

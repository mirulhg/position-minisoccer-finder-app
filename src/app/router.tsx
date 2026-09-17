import { useEffect, useState } from 'react';
import { dbGet } from '../lib/db';
import { useAuthSession } from '../features/auth';
import { OnboardingFlow, onboardingProfileSchema, type OnboardingProfile } from '../features/onboarding';
import { QuestionnaireFlow, type AnswerValue } from '../features/questionnaire';
import { ResultsScreen } from '../features/results';
import { HistoryScreen } from '../features/history';

type Screen = 'onboarding' | 'questionnaire' | 'results' | 'history';

export function AppRouter() {
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [screen, setScreen] = useState<Screen>('onboarding');
  const [profile, setProfile] = useState<OnboardingProfile | null>(null);
  const [answers, setAnswers] = useState<Record<string, AnswerValue> | null>(null);
  // Sesi Supabase hanya dipakai untuk membuka layar riwayat (FR-17) —
  // alur onboarding→kuesioner→hasil di bawah TIDAK pernah dikunci oleh
  // status login (PRD Lampiran C.1/C.5: aktivasi tidak boleh terhambat
  // pendaftaran). Login ditawarkan inline di layar hasil, bukan di sini.
  const { session } = useAuthSession();

  useEffect(() => {
    // Sinkronisasi satu kali dengan IndexedDB saat aplikasi dibuka: kalau
    // profil onboarding sudah lengkap, lewati layar onboarding dan langsung
    // ke kuesioner — kuesioner memulihkan posisi terakhirnya sendiri (FR-06).
    dbGet<unknown>('onboardingProfile', 'profile').then((stored) => {
      const parsed = onboardingProfileSchema.safeParse(stored);
      if (parsed.success) {
        setProfile(parsed.data);
        setScreen('questionnaire');
      }
      setIsBootstrapping(false);
    });
  }, []);

  function handleOnboardingComplete(completedProfile: OnboardingProfile) {
    setProfile(completedProfile);
    setScreen('questionnaire');
  }

  function handleQuestionnaireComplete(finalAnswers: Record<string, AnswerValue>) {
    setAnswers(finalAnswers);
    setScreen('results');
  }

  if (isBootstrapping) {
    return <p className="p-8 text-center text-neutral-500">Memuat…</p>;
  }

  if (screen === 'onboarding') {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />;
  }

  if (screen === 'questionnaire' && profile) {
    return <QuestionnaireFlow willingGoalkeeper={profile.willingGoalkeeper} onComplete={handleQuestionnaireComplete} />;
  }

  if (screen === 'results' && profile && answers) {
    return (
      <ResultsScreen
        answers={answers}
        physical={profile}
        usualPosition={profile.usualPosition}
        willingGoalkeeper={profile.willingGoalkeeper}
        onViewHistory={() => setScreen('history')}
      />
    );
  }

  if (screen === 'history' && session) {
    return <HistoryScreen userId={session.user.id} onBack={() => setScreen('results')} />;
  }

  return null;
}

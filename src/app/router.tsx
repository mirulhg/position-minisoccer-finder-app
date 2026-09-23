import { lazy, Suspense, useEffect, useState } from 'react';
import { dbClear, dbGet } from '../lib/db';
import { isProgressStale } from './lib/stale-progress';
import type { OnboardingProfile } from '../features/onboarding';
import type { AnswerValue } from '../features/questionnaire';

// Setiap layar dimuat sebagai chunk terpisah (CLAUDE.md §10) — pengunjung
// baru yang belum sampai ke kuesioner/hasil tidak perlu mengunduh kode
// hasil, riwayat, atau (lewat fitur itu) @supabase/supabase-js sama sekali.
const OnboardingFlow = lazy(() =>
  import('../features/onboarding').then((m) => ({ default: m.OnboardingFlow })),
);
const QuestionnaireFlow = lazy(() =>
  import('../features/questionnaire').then((m) => ({ default: m.QuestionnaireFlow })),
);
const ResultsScreen = lazy(() => import('../features/results').then((m) => ({ default: m.ResultsScreen })));
const HistoryScreen = lazy(() => import('../features/history').then((m) => ({ default: m.HistoryScreen })));
const MatchInputScreen = lazy(() => import('../features/matches').then((m) => ({ default: m.MatchInputScreen })));
const AccountScreen = lazy(() => import('../features/account').then((m) => ({ default: m.AccountScreen })));

type Screen = 'onboarding' | 'questionnaire' | 'results' | 'history' | 'match-input' | 'account';

function LoadingFallback() {
  return <p className="p-8 text-center text-neutral-500">Memuat…</p>;
}

export function AppRouter() {
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [screen, setScreen] = useState<Screen>('onboarding');
  const [profile, setProfile] = useState<OnboardingProfile | null>(null);
  const [answers, setAnswers] = useState<Record<string, AnswerValue> | null>(null);

  useEffect(() => {
    // Sinkronisasi satu kali dengan IndexedDB saat aplikasi dibuka: kalau
    // profil onboarding sudah lengkap, lewati layar onboarding dan langsung
    // ke kuesioner — kuesioner memulihkan posisi terakhirnya sendiri (FR-06).
    // `onboardingProfileSchema` diambil lewat import dinamis (bukan import
    // statis) supaya modul fitur onboarding — termasuk `OnboardingFlow` yang
    // di-lazy() di atas — tidak ikut tertarik ke chunk awal (lihat peringatan
    // Rollup "ineffective dynamic import" kalau dua cara impor dicampur).
    // Sebelum itu, jaring pengaman: kalau progres terakhir sudah ditinggal
    // >30 hari (STALE_PROGRESS_MS), bersihkan IndexedDB lebih dulu supaya
    // bootstrap di atas membaca `onboardingProfile` yang sudah kosong dan
    // otomatis mulai dari onboarding — tidak ada UI yang perlu dirender atau
    // dikonfirmasi di sini. Sesi Supabase yang tertinggal juga ikut
    // dibersihkan (temuan pentest — sama seperti RestartButton, jaring
    // pengaman 30 hari ini juga titik dimana pemain berikutnya di perangkat
    // yang sama bisa mulai dari nol; kalau sesi lama tidak dibersihkan,
    // hasil kuesioner pemain baru itu bisa ter-upload diam-diam ke akun
    // lama). `import('../lib/supabase')` dinamis, bukan statis di atas —
    // supaya @supabase/supabase-js tidak ikut ke bundle awal buat pengunjung
    // yang progresnya tidak basi sama sekali (lihat komentar lazy() di atas).
    dbGet<number>('meta', 'lastActivityAt')
      .then((lastActivityAt) => {
        if (!isProgressStale(lastActivityAt, Date.now())) return Promise.resolve();
        return Promise.all([
          dbClear('onboardingProfile'),
          dbClear('answers'),
          dbClear('meta'),
          import('../lib/supabase').then(({ supabase }) => {
            if (!supabase) return;
            return import('../features/auth').then(({ signOut }) =>
              signOut(supabase).catch((error) => {
                console.warn('Gagal keluar dari sesi Supabase saat auto-reset progres basi:', error);
              }),
            );
          }),
        ]).then(() => {});
      })
      .then(() =>
        Promise.all([dbGet<unknown>('onboardingProfile', 'profile'), import('../features/onboarding')]),
      )
      .then(([stored, { onboardingProfileSchema }]) => {
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

  function handleRestart() {
    // IndexedDB sudah dikosongkan oleh RestartButton sebelum ini dipanggil;
    // di sini cukup mengembalikan state React ke titik awal.
    setProfile(null);
    setAnswers(null);
    setScreen('onboarding');
  }

  function handleDataDeleted() {
    // FR-20 — AccountScreen sudah menghapus data Supabase + IndexedDB +
    // sesi sebelum memanggil ini; di sini cukup mengembalikan state React
    // ke titik awal, sama seperti handleRestart.
    setProfile(null);
    setAnswers(null);
    setScreen('onboarding');
  }

  if (isBootstrapping) {
    return <LoadingFallback />;
  }

  return (
    <Suspense fallback={<LoadingFallback />}>
      {screen === 'onboarding' && <OnboardingFlow onComplete={handleOnboardingComplete} />}

      {screen === 'questionnaire' && profile && (
        <QuestionnaireFlow
          willingGoalkeeper={profile.willingGoalkeeper}
          onComplete={handleQuestionnaireComplete}
          onRestart={handleRestart}
        />
      )}

      {screen === 'results' && profile && answers && (
        <ResultsScreen
          answers={answers}
          physical={profile}
          usualPosition={profile.usualPosition}
          willingGoalkeeper={profile.willingGoalkeeper}
          onViewHistory={() => setScreen('history')}
          onRestart={handleRestart}
          onLogMatch={() => setScreen('match-input')}
        />
      )}

      {screen === 'history' && (
        <HistoryScreen onBack={() => setScreen('results')} onManageAccount={() => setScreen('account')} />
      )}

      {screen === 'match-input' && (
        <MatchInputScreen onDone={() => setScreen('results')} onBack={() => setScreen('results')} />
      )}

      {screen === 'account' && (
        <AccountScreen onBack={() => setScreen('history')} onDataDeleted={handleDataDeleted} />
      )}
    </Suspense>
  );
}

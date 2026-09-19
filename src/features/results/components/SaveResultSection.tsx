import { useEffect, useRef, useState } from 'react';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { dbGet, markSynced } from '../../../lib/db';
import { isSupabaseConfigured, supabase } from '../../../lib/supabase';
import { ACCOUNT_LOGIN_ENABLED, deriveDisplayName, LoginForm, migrateLocalProfileToSupabase, useAuthSession } from '../../auth';
// Deep import, bukan lewat barrel `../../matches` — lihat komentar di
// features/matches/index.ts (menghindari menarik MatchInputScreen dan
// dependensinya ke chunk layar hasil).
import { retakeQuestionnaire } from '../../matches/lib/recalculate-profile';
import type { OnboardingProfile } from '../../onboarding';
import type { ScoringResult } from '../../scoring';

interface SaveResultSectionProps {
  profile: OnboardingProfile;
  scoringResult: ScoringResult;
  onViewHistory: () => void;
}

type MigrationState = 'idle' | 'migrating' | 'done' | 'error';

/**
 * "Simpan hasil ini" di layar hasil — satu-satunya tempat login ditawarkan
 * (PRD Lampiran C.5: alur Fase 1 tanpa akun tetap berjalan penuh, login
 * tidak dipaksa di depan). Migrasi berjalan sekali otomatis begitu sesi
 * Supabase terdeteksi, termasuk setelah reload penuh akibat redirect
 * OAuth/magic-link.
 */
export function SaveResultSection({ profile, scoringResult, onViewHistory }: SaveResultSectionProps) {
  const { session, isLoading: isSessionLoading } = useAuthSession();
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [migrationState, setMigrationState] = useState<MigrationState>('idle');
  const [migrationError, setMigrationError] = useState<string | null>(null);
  const hasStartedMigration = useRef(false);

  useEffect(() => {
    // Sinkronisasi dengan sesi Supabase Auth: begitu sesi muncul (bisa lewat
    // redirect penuh dari OAuth/magic-link), jalankan migrasi lokal→akun
    // sekali saja, ditandai lewat ref supaya efek berikutnya tidak mengulang.
    if (!session || !supabase || hasStartedMigration.current) return;
    hasStartedMigration.current = true;
    let isActive = true;
    const activeSession = session;
    const client = supabase;

    async function migrate() {
      const marker = await dbGet<{ syncedAt?: string }>('onboardingProfile', 'profile');
      if (marker?.syncedAt) {
        if (isActive) setMigrationState('done');
        return;
      }

      if (isActive) setMigrationState('migrating');
      try {
        const displayName = deriveDisplayName(activeSession.user);
        const userId = activeSession.user.id;

        // FR-19 — pemain yang sudah punya ≥1 baris riwayat menekan "Mulai
        // ulang dari awal" lalu isi kuesioner lagi: itu tes ulang, bukan
        // simpan pertama kali. `migrateLocalProfileToSupabase` menghitung
        // scoringResult murni dari kuesioner (tanpa S_i) — memanggilnya di
        // sini akan diam-diam membuang seluruh akumulasi statistik
        // pertandingan (bertentangan dengan migrasi 0003: "jawaban baru
        // menggantikan Q_i sepenuhnya, sementara S_i tetap terakumulasi").
        // `retakeQuestionnaire` mem-blend ulang Q_i baru ini dengan S_i yang
        // sudah ada lewat pipeline yang sama seperti rekalkulasi pasca-
        // pertandingan.
        const { data: existingProfiles, error: existingProfilesError } = await client
          .from('attribute_profiles')
          .select('id')
          .eq('player_id', userId)
          .limit(1);
        if (existingProfilesError) {
          throw new Error(`Gagal memeriksa riwayat profil: ${existingProfilesError.message}`);
        }

        if (existingProfiles && existingProfiles.length > 0) {
          await retakeQuestionnaire(client, { userId, displayName, profile, scoringResult });
        } else {
          await migrateLocalProfileToSupabase(client, {
            userId,
            displayName,
            profile,
            scoringResult,
          });
        }

        await markSynced('onboardingProfile', 'profile');
        if (isActive) setMigrationState('done');
      } catch (error) {
        if (isActive) {
          setMigrationState('error');
          setMigrationError(error instanceof Error ? error.message : 'Gagal menyimpan hasil.');
        }
      }
    }

    migrate();
    return () => {
      isActive = false;
    };
  }, [session, profile, scoringResult]);

  if (!isSupabaseConfigured) return null;

  if (isSessionLoading) return null;

  if (migrationState === 'done') {
    return (
      <Card>
        <p className="text-sm font-medium text-primary-700">Tersimpan ke akunmu</p>
        <p className="mt-1 text-sm text-neutral-600">
          Riwayat akan bertambah setelah kamu mengulang tes atau mencatat pertandingan.
        </p>
        <Button variant="ghost" onClick={onViewHistory} className="mt-2 w-full">
          Lihat riwayat
        </Button>
      </Card>
    );
  }

  if (migrationState === 'migrating') {
    return (
      <Card>
        <p className="text-sm text-neutral-600">Menyimpan hasil ke akunmu…</p>
      </Card>
    );
  }

  if (migrationState === 'error') {
    return (
      <Card>
        <p role="alert" className="text-sm text-danger-600">
          {migrationError}
        </p>
      </Card>
    );
  }

  if (session) return null;

  if (emailSent) {
    return (
      <Card>
        <p className="text-sm text-neutral-700">Cek email kamu — tautan masuk sudah dikirim.</p>
      </Card>
    );
  }

  if (showLoginForm) {
    return (
      <Card>
        <LoginForm onEmailSent={() => setEmailSent(true)} />
      </Card>
    );
  }

  if (!ACCOUNT_LOGIN_ENABLED) {
    return (
      <div className="flex flex-col items-center gap-1 text-center">
        <Button variant="secondary" disabled className="w-full">
          Simpan hasil ini
        </Button>
        <p className="text-xs text-neutral-500">Segera hadir — fitur akun sedang disempurnakan keamanannya.</p>
      </div>
    );
  }

  return (
    <Button variant="secondary" onClick={() => setShowLoginForm(true)} className="w-full">
      Simpan hasil ini
    </Button>
  );
}

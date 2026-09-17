import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../../../lib/database.types';
import type { OnboardingProfile } from '../../onboarding';
import type { AttributeVector, ScoringResult } from '../../scoring';

/**
 * Harus sama dengan `versi` yang di-seed di
 * supabase/migrations/0001_init.sql — Fase 2 baru punya satu baris
 * scoring_configs (placeholder Fase 0), belum ada mekanisme pilih versi.
 */
export const SCORING_CONFIG_VERSION = 'fase0-placeholder';

export interface MigrateLocalProfileInput {
  userId: string;
  displayName: string;
  profile: OnboardingProfile;
  scoringResult: ScoringResult;
}

export interface MigrateLocalProfileResult {
  playerId: string;
  profileId: string;
}

function toPlainAttributeMap(attributes: AttributeVector): Record<string, number> {
  const plain: Record<string, number> = {};
  for (const [attribute, value] of Object.entries(attributes)) {
    if (value !== undefined) plain[attribute] = value;
  }
  return plain;
}

/**
 * Migrasi sekali-jalan dari profil lokal (IndexedDB, sudah dihitung lewat
 * mesin scoring Fase 1) ke akun Supabase. Dependency Supabase disuntik lewat
 * parameter supaya fungsi ini bisa diuji tanpa client sungguhan — lihat
 * migrate-local-profile.test.ts. Tidak menyentuh IndexedDB sama sekali;
 * pemanggil (hook di UI) yang bertanggung jawab memanggil `markSynced`
 * setelah fungsi ini sukses.
 */
export async function migrateLocalProfileToSupabase(
  supabase: SupabaseClient<Database>,
  input: MigrateLocalProfileInput,
): Promise<MigrateLocalProfileResult> {
  const { userId, displayName, profile, scoringResult } = input;

  const { error: playerError } = await supabase.from('players').upsert({
    id: userId,
    nama: displayName,
    tinggi_cm: profile.heightCm,
    berat_kg: profile.weightKg,
    usia: profile.age,
    kaki_dominan: profile.dominantFoot,
    bersedia_kiper: profile.willingGoalkeeper,
  });
  if (playerError) throw new Error(`Gagal menyimpan data pemain: ${playerError.message}`);

  const { data: insertedProfile, error: profileError } = await supabase
    .from('attribute_profiles')
    .insert({
      player_id: userId,
      atribut: toPlainAttributeMap(scoringResult.attributes),
      confidence: scoringResult.confidence,
      versi_konfigurasi: SCORING_CONFIG_VERSION,
      posisi_biasa: profile.usualPosition,
    })
    .select('id')
    .single();
  if (profileError || !insertedProfile) {
    throw new Error(`Gagal menyimpan profil atribut: ${profileError?.message ?? 'tidak ada baris dikembalikan'}`);
  }

  const profileId = insertedProfile.id;

  const { error: roleScoresError } = await supabase.from('role_scores').insert(
    scoringResult.roleScores.map((score) => ({
      profile_id: profileId,
      role_code: score.role,
      base: score.base,
      gate: score.gate,
      fit: score.fit,
    })),
  );
  if (roleScoresError) throw new Error(`Gagal menyimpan skor role: ${roleScoresError.message}`);

  return { playerId: userId, profileId };
}

import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../../../lib/database.types';
import type { OnboardingProfile } from '../../onboarding';
import {
  SCORING_CONFIG_VERSION,
  blendWithMatchStats,
  computeBaseRoleScores,
  computeConfidence,
  computePositionScores,
  computeRoleScores,
  convertMatchesToAttributeStats,
  normalizeToCohort,
  pickMainPosition,
  shouldSwitchMainPosition,
  toPlainAttributeMap,
  type AttributeVector,
  type MatchRecord,
  type PositionCode,
  type PositionScore,
  type RoleScore,
  type ScoringResult,
} from '../../scoring';

export interface RecalculateProfileInput {
  userId: string;
}

export interface RecalculateProfileResult {
  profileId: string;
  mainPosition: PositionScore;
  positionChanged: boolean;
}

/** Baris `attribute_profiles` sebelumnya, dipakai sebagai basis peredam osilasi — `null` kalau ini baris pertama pemain. */
export interface PreviousProfileForRecalculation {
  id: string;
  posisiUtamaCode: PositionCode | null;
  roleScores: RoleScore[];
}

export interface ApplyProfileRecalculationInput {
  userId: string;
  questionnaireAttributes: AttributeVector;
  reliability: number;
  usualPosition: PositionCode | null;
  matches: MatchRecord[];
  latestProfile: PreviousProfileForRecalculation | null;
}

function toMatchRecord(row: Database['public']['Tables']['matches']['Row']): MatchRecord {
  return {
    menitBermain: row.menit_bermain,
    posisiDimainkan: row.posisi_dimainkan as PositionCode,
    gol: row.gol,
    assist: row.assist,
    peluangDiciptakan: row.peluang_diciptakan,
    tekelBerhasil: row.tekel_berhasil,
    intersep: row.intersep,
    duelUdaraMenang: row.duel_udara_menang,
    kehilanganBola: row.kehilangan_bola,
    pelanggaran: row.pelanggaran,
    cleanSheet: row.clean_sheet,
  };
}

function toRoleScores(rows: Database['public']['Tables']['role_scores']['Row'][], profileId: string): RoleScore[] {
  return rows
    .filter((row) => row.profile_id === profileId)
    .map((row) => ({ role: row.role_code as RoleScore['role'], base: row.base, gate: row.gate, fit: row.fit }));
}

/**
 * Inti pipeline "blend → normalize → role score → posisi utama → peredam
 * osilasi → insert attribute_profiles+role_scores" — dipakai baik oleh
 * `recalculateProfile` (Q_i/reliability dari baris terakhir, dipicu
 * pertandingan baru) maupun `retakeQuestionnaire` (Q_i/reliability dari
 * kuesioner yang BARU SAJA diisi ulang, lihat FR-19). Murni ekstraksi dari
 * `recalculateProfile` — TIDAK mengubah rumus/urutan `blendWithMatchStats`,
 * `computeConfidence`, atau `shouldSwitchMainPosition` sama sekali.
 */
async function applyProfileRecalculation(
  supabase: SupabaseClient<Database>,
  input: ApplyProfileRecalculationInput,
): Promise<RecalculateProfileResult> {
  const { userId, questionnaireAttributes, reliability, usualPosition, matches, latestProfile } = input;

  const { stats, counts, dataCompleteness } = convertMatchesToAttributeStats(matches);

  const blended = blendWithMatchStats(questionnaireAttributes, stats, counts);
  const normalized = normalizeToCohort(blended);

  const baseScores = computeBaseRoleScores(normalized);
  const roleScores = computeRoleScores(normalized, baseScores);
  const positionScores = computePositionScores(roleScores);

  const rawCandidate = pickMainPosition(positionScores, { roleScores, usualPosition });

  // Peredam osilasi (PRD): posisi utama hanya berganti kalau kandidat baru
  // unggul ≥4 poin selama DUA rekalkulasi berturut-turut — rekalkulasi
  // sebelumnya (`latestProfile` yang sudah ada) DAN rekalkulasi ini
  // (`positionScores`, baru saja dihitung). Kalau belum ada baris
  // sebelumnya sama sekali, tidak ada dasar untuk meredam, jadi kandidat
  // mentah langsung dipakai.
  let mainPosition = rawCandidate;
  if (latestProfile?.posisiUtamaCode) {
    const currentMainPosition = latestProfile.posisiUtamaCode;
    const recentCandidateScores: [PositionScore[], PositionScore[]] = [
      computePositionScores(latestProfile.roleScores),
      positionScores,
    ];

    const allowedToSwitch = shouldSwitchMainPosition(currentMainPosition, recentCandidateScores);
    if (!allowedToSwitch) {
      mainPosition =
        positionScores.find((score) => score.position === currentMainPosition) ?? rawCandidate;
    }
  }

  const positionChanged = Boolean(
    latestProfile?.posisiUtamaCode && latestProfile.posisiUtamaCode !== mainPosition.position,
  );

  const confidence = computeConfidence(reliability, matches.length, dataCompleteness);

  const { data: insertedProfile, error: insertProfileError } = await supabase
    .from('attribute_profiles')
    .insert({
      player_id: userId,
      atribut: toPlainAttributeMap(normalized),
      atribut_kuesioner: toPlainAttributeMap(questionnaireAttributes),
      reliability,
      confidence,
      versi_konfigurasi: SCORING_CONFIG_VERSION,
      posisi_biasa: usualPosition,
      posisi_utama_code: mainPosition.position,
      role_utama_code: mainPosition.bestRole,
      position_changed: positionChanged,
      change_acknowledged_at: null,
    })
    .select('id')
    .single();
  if (insertProfileError || !insertedProfile) {
    throw new Error(`Gagal menyimpan profil baru: ${insertProfileError?.message ?? 'tidak ada baris dikembalikan'}`);
  }

  const { error: insertRoleScoresError } = await supabase.from('role_scores').insert(
    roleScores.map((score) => ({
      profile_id: insertedProfile.id,
      role_code: score.role,
      base: score.base,
      gate: score.gate,
      fit: score.fit,
    })),
  );
  if (insertRoleScoresError) throw new Error(`Gagal menyimpan skor role baru: ${insertRoleScoresError.message}`);

  return { profileId: insertedProfile.id, mainPosition, positionChanged };
}

async function fetchLatestProfileForRecalculation(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<{
  latestProfile: PreviousProfileForRecalculation & {
    questionnaireAttributes: AttributeVector;
    reliability: number;
    usualPosition: PositionCode | null;
  };
} | null> {
  const { data: recentProfiles, error: profilesError } = await supabase
    .from('attribute_profiles')
    .select('id, atribut_kuesioner, atribut, reliability, posisi_biasa, posisi_utama_code')
    .eq('player_id', userId)
    .order('dibuat_pada', { ascending: false })
    .limit(1);
  if (profilesError) throw new Error(`Gagal memuat profil terakhir: ${profilesError.message}`);
  if (!recentProfiles || recentProfiles.length === 0) return null;

  const [row] = recentProfiles;
  if (row.reliability === null) {
    throw new Error('Baris profil terbaru belum punya nilai reliability — migrasi 0003 belum diterapkan dengan benar.');
  }

  const { data: roleScoreRows, error: roleScoresError } = await supabase
    .from('role_scores')
    .select('profile_id, role_code, base, gate, fit')
    .in('profile_id', [row.id]);
  if (roleScoresError) throw new Error(`Gagal memuat skor role: ${roleScoresError.message}`);

  return {
    latestProfile: {
      id: row.id,
      posisiUtamaCode: (row.posisi_utama_code as PositionCode | null) ?? null,
      roleScores: toRoleScores(roleScoreRows ?? [], row.id),
      questionnaireAttributes: (row.atribut_kuesioner ?? row.atribut) as AttributeVector,
      reliability: row.reliability,
      usualPosition: (row.posisi_biasa as PositionCode | null) ?? null,
    },
  };
}

async function fetchMatches(supabase: SupabaseClient<Database>, userId: string): Promise<MatchRecord[]> {
  const { data: matchRows, error: matchesError } = await supabase
    .from('matches')
    .select(
      'menit_bermain, posisi_dimainkan, gol, assist, peluang_diciptakan, tekel_berhasil, intersep, duel_udara_menang, kehilangan_bola, pelanggaran, clean_sheet',
    )
    .eq('player_id', userId);
  if (matchesError) throw new Error(`Gagal memuat pertandingan: ${matchesError.message}`);

  return (matchRows ?? []).map((row) => toMatchRecord(row as Database['public']['Tables']['matches']['Row']));
}

/**
 * FR-15 — rekalkulasi profil setelah pertandingan baru disimpan. Melanjutkan
 * pipeline yang sudah ada dari Tahap 3 (`blendWithMatchStats`) — TIDAK
 * menulis ulang Tahap 3/4/5/6 atau peredam osilasi, hanya memanggilnya
 * dengan data pertandingan nyata. INSERT baris baru (bukan UPDATE), sesuai
 * PRD: "Satu baris per rekalkulasi; inilah riwayat profil." Wrapper tipis
 * di atas `applyProfileRecalculation`: Q_i/reliability/posisi biasa datang
 * dari baris `attribute_profiles` TERAKHIR (kuesioner tidak diulang di sini
 * — untuk itu lihat `retakeQuestionnaire`).
 */
export async function recalculateProfile(
  supabase: SupabaseClient<Database>,
  input: RecalculateProfileInput,
): Promise<RecalculateProfileResult> {
  const { userId } = input;

  const found = await fetchLatestProfileForRecalculation(supabase, userId);
  if (!found) {
    throw new Error('Belum ada profil atribut untuk pemain ini — selesaikan kuesioner dan simpan hasil dulu.');
  }
  const { latestProfile } = found;

  const matches = await fetchMatches(supabase, userId);

  return applyProfileRecalculation(supabase, {
    userId,
    questionnaireAttributes: latestProfile.questionnaireAttributes,
    reliability: latestProfile.reliability,
    usualPosition: latestProfile.usualPosition,
    matches,
    latestProfile: {
      id: latestProfile.id,
      posisiUtamaCode: latestProfile.posisiUtamaCode,
      roleScores: latestProfile.roleScores,
    },
  });
}

export interface RetakeQuestionnaireInput {
  userId: string;
  displayName: string;
  profile: OnboardingProfile;
  scoringResult: ScoringResult;
}

/**
 * FR-19 — pemain yang SUDAH punya riwayat (≥1 baris `attribute_profiles`)
 * mengulang kuesioner. Beda dengan `migrateLocalProfileToSupabase` (dipakai
 * untuk simpan PERTAMA KALI, `computeScoringResult` murni tanpa S_i): fungsi
 * ini mem-blend Q_i/reliability BARU dari kuesioner yang baru saja diisi
 * dengan S_i yang sudah terakumulasi dari seluruh riwayat pertandingan
 * pemain — sesuai PRD/migrasi 0003: "jawaban baru menggantikan Q_i
 * sepenuhnya, sementara S_i tetap terakumulasi". `usualPosition` yang
 * dipakai adalah nilai yang BARU SAJA dipilih ulang di form onboarding
 * (`profile.usualPosition`), bukan nilai dari baris lama — inilah
 * "skenario gaya main lain": tidak perlu UI/skema tambahan, cukup pastikan
 * nilai baru ini yang dipakai untuk blending ulang.
 */
export async function retakeQuestionnaire(
  supabase: SupabaseClient<Database>,
  input: RetakeQuestionnaireInput,
): Promise<RecalculateProfileResult> {
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

  const found = await fetchLatestProfileForRecalculation(supabase, userId);
  if (!found) {
    throw new Error(
      'retakeQuestionnaire hanya untuk pemain yang sudah punya riwayat profil — pakai migrateLocalProfileToSupabase untuk simpan pertama kali.',
    );
  }
  const { latestProfile } = found;

  const matches = await fetchMatches(supabase, userId);

  return applyProfileRecalculation(supabase, {
    userId,
    questionnaireAttributes: scoringResult.questionnaireAttributes,
    reliability: scoringResult.reliability,
    usualPosition: profile.usualPosition,
    matches,
    latestProfile: {
      id: latestProfile.id,
      posisiUtamaCode: latestProfile.posisiUtamaCode,
      roleScores: latestProfile.roleScores,
    },
  });
}

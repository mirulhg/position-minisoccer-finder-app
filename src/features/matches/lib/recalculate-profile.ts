import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../../../lib/database.types';
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
} from '../../scoring';

export interface RecalculateProfileInput {
  userId: string;
}

export interface RecalculateProfileResult {
  profileId: string;
  mainPosition: PositionScore;
  positionChanged: boolean;
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
 * FR-15 — rekalkulasi profil setelah pertandingan baru disimpan. Melanjutkan
 * pipeline yang sudah ada dari Tahap 3 (`blendWithMatchStats`) — TIDAK
 * menulis ulang Tahap 3/4/5/6 atau peredam osilasi, hanya memanggilnya
 * dengan data pertandingan nyata. INSERT baris baru (bukan UPDATE), sesuai
 * PRD: "Satu baris per rekalkulasi; inilah riwayat profil."
 */
export async function recalculateProfile(
  supabase: SupabaseClient<Database>,
  input: RecalculateProfileInput,
): Promise<RecalculateProfileResult> {
  const { userId } = input;

  const { data: recentProfiles, error: profilesError } = await supabase
    .from('attribute_profiles')
    .select('id, atribut_kuesioner, atribut, reliability, posisi_biasa, posisi_utama_code')
    .eq('player_id', userId)
    .order('dibuat_pada', { ascending: false })
    .limit(1);
  if (profilesError) throw new Error(`Gagal memuat profil terakhir: ${profilesError.message}`);
  if (!recentProfiles || recentProfiles.length === 0) {
    throw new Error('Belum ada profil atribut untuk pemain ini — selesaikan kuesioner dan simpan hasil dulu.');
  }

  const [latestProfile] = recentProfiles;

  if (latestProfile.reliability === null) {
    throw new Error('Baris profil terbaru belum punya nilai reliability — migrasi 0003 belum diterapkan dengan benar.');
  }
  const questionnaireAttributes = (latestProfile.atribut_kuesioner ?? latestProfile.atribut) as AttributeVector;

  const { data: roleScoreRows, error: roleScoresError } = await supabase
    .from('role_scores')
    .select('profile_id, role_code, base, gate, fit')
    .in('profile_id', [latestProfile.id]);
  if (roleScoresError) throw new Error(`Gagal memuat skor role: ${roleScoresError.message}`);

  const { data: matchRows, error: matchesError } = await supabase
    .from('matches')
    .select(
      'menit_bermain, posisi_dimainkan, gol, assist, peluang_diciptakan, tekel_berhasil, intersep, duel_udara_menang, kehilangan_bola, pelanggaran, clean_sheet',
    )
    .eq('player_id', userId);
  if (matchesError) throw new Error(`Gagal memuat pertandingan: ${matchesError.message}`);

  const matches = (matchRows ?? []).map((row) =>
    toMatchRecord(row as Database['public']['Tables']['matches']['Row']),
  );
  const { stats, counts, dataCompleteness } = convertMatchesToAttributeStats(matches);

  const blended = blendWithMatchStats(questionnaireAttributes, stats, counts);
  const normalized = normalizeToCohort(blended);

  const baseScores = computeBaseRoleScores(normalized);
  const roleScores = computeRoleScores(normalized, baseScores);
  const positionScores = computePositionScores(roleScores);

  const usualPosition = (latestProfile.posisi_biasa as PositionCode | null) ?? null;
  const rawCandidate = pickMainPosition(positionScores, { roleScores, usualPosition });

  // Peredam osilasi (PRD): posisi utama hanya berganti kalau kandidat baru
  // unggul ≥4 poin selama DUA rekalkulasi berturut-turut — rekalkulasi
  // sebelumnya (baris `latestProfile` yang sudah ada) DAN rekalkulasi ini
  // (`positionScores`, baru saja dihitung dari data pertandingan baru).
  // Kalau belum ada baris sebelumnya sama sekali, tidak ada dasar untuk
  // meredam, jadi kandidat mentah langsung dipakai.
  let mainPosition = rawCandidate;
  if (latestProfile.posisi_utama_code) {
    const currentMainPosition = latestProfile.posisi_utama_code as PositionCode;
    const previousRoleScores = toRoleScores(roleScoreRows ?? [], latestProfile.id);
    const recentCandidateScores: [PositionScore[], PositionScore[]] = [
      computePositionScores(previousRoleScores),
      positionScores,
    ];

    const allowedToSwitch = shouldSwitchMainPosition(currentMainPosition, recentCandidateScores);
    if (!allowedToSwitch) {
      mainPosition =
        positionScores.find((score) => score.position === currentMainPosition) ?? rawCandidate;
    }
  }

  const positionChanged = Boolean(
    latestProfile.posisi_utama_code && latestProfile.posisi_utama_code !== mainPosition.position,
  );

  const confidence = computeConfidence(latestProfile.reliability, matches.length, dataCompleteness);

  const { data: insertedProfile, error: insertProfileError } = await supabase
    .from('attribute_profiles')
    .insert({
      player_id: userId,
      atribut: toPlainAttributeMap(normalized),
      atribut_kuesioner: toPlainAttributeMap(questionnaireAttributes),
      reliability: latestProfile.reliability,
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

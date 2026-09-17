import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../../../lib/database.types';
import { computePositionScores, pickMainPosition, type PositionScore, type RoleScore } from '../../scoring';

export interface ProfileHistoryEntry {
  id: string;
  createdAt: string;
  confidence: number;
  mainPosition: PositionScore;
}

/**
 * FR-17 — riwayat profil, terbaru di atas, minimal 10 versi terakhir.
 * Posisi utama per versi dihitung ulang lewat fungsi Tahap 6 yang sudah ada
 * (`computePositionScores`/`pickMainPosition`), bukan logika baru — hanya
 * `role_scores` yang tersimpan yang diberi bentuk ulang jadi `RoleScore[]`.
 */
export async function fetchProfileHistory(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<ProfileHistoryEntry[]> {
  const { data: profiles, error: profilesError } = await supabase
    .from('attribute_profiles')
    .select('id, dibuat_pada, confidence, posisi_biasa')
    .eq('player_id', userId)
    .order('dibuat_pada', { ascending: false })
    .limit(10);
  if (profilesError) throw new Error(`Gagal memuat riwayat profil: ${profilesError.message}`);
  if (!profiles || profiles.length === 0) return [];

  const profileIds = profiles.map((profile) => profile.id);
  const { data: roleScoreRows, error: roleScoresError } = await supabase
    .from('role_scores')
    .select('profile_id, role_code, base, gate, fit')
    .in('profile_id', profileIds);
  if (roleScoresError) throw new Error(`Gagal memuat skor role: ${roleScoresError.message}`);

  return profiles.map((profile) => {
    const roleScores: RoleScore[] = (roleScoreRows ?? [])
      .filter((row) => row.profile_id === profile.id)
      .map((row) => ({
        role: row.role_code as RoleScore['role'],
        base: row.base,
        gate: row.gate,
        fit: row.fit,
      }));

    const positionScores = computePositionScores(roleScores);
    const mainPosition = pickMainPosition(positionScores, {
      roleScores,
      usualPosition: (profile.posisi_biasa as PositionScore['position'] | null) ?? null,
    });

    return {
      id: profile.id,
      createdAt: profile.dibuat_pada,
      confidence: profile.confidence,
      mainPosition,
    };
  });
}

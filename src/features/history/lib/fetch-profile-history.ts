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
 *
 * Posisi utama: baris Fase 3+ punya `posisi_utama_code` tersimpan — itu
 * keputusan FINAL setelah peredam osilasi (`shouldSwitchMainPosition`),
 * yang tidak bisa direkonstruksi ulang dari `role_scores` saja (butuh tahu
 * posisi baris sebelumnya). Baris pra-Fase-3 (`posisi_utama_code` null)
 * fallback ke `pickMainPosition` seperti sebelumnya — sah karena peredam
 * osilasi memang belum pernah aktif sebelum Fase 3 (baru satu kali hitung).
 */
export async function fetchProfileHistory(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<ProfileHistoryEntry[]> {
  const { data: profiles, error: profilesError } = await supabase
    .from('attribute_profiles')
    .select('id, dibuat_pada, confidence, posisi_biasa, posisi_utama_code')
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
    const storedPosition = positionScores.find((score) => score.position === profile.posisi_utama_code);
    const mainPosition =
      storedPosition ??
      // `matches` SENGAJA tidak diisi di sini (langkah 2 tie-break selalu
      // seri, fallback ke langkah 3 seperti sebelumnya). Ini merekonstruksi
      // posisi utama baris LAMA pra-Fase-3 — menyuntikkan jumlah
      // pertandingan pemain SAAT INI tidak akurat secara historis, karena
      // pertandingan itu kemungkinan dicatat SETELAH baris riwayat ini
      // dibuat.
      pickMainPosition(positionScores, {
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

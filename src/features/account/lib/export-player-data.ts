import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../../../lib/database.types';

export interface PlayerDataExport {
  exported_at: string;
  player: Database['public']['Tables']['players']['Row'] | null;
  attribute_profiles: Database['public']['Tables']['attribute_profiles']['Row'][];
  role_scores: Database['public']['Tables']['role_scores']['Row'][];
  matches: Database['public']['Tables']['matches']['Row'][];
}

/**
 * FR-20 — pemain mengunduh seluruh datanya. Empat query lewat SELECT RLS
 * yang sudah ada (players/attribute_profiles/matches: `= auth.uid()`,
 * role_scores: lewat attribute_profiles induknya) — tidak perlu policy baru.
 */
export async function exportPlayerData(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<PlayerDataExport> {
  const { data: player, error: playerError } = await supabase
    .from('players')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  if (playerError) throw new Error(`Gagal memuat data pemain: ${playerError.message}`);

  const { data: attributeProfiles, error: profilesError } = await supabase
    .from('attribute_profiles')
    .select('*')
    .eq('player_id', userId);
  if (profilesError) throw new Error(`Gagal memuat riwayat profil: ${profilesError.message}`);

  const profileIds = (attributeProfiles ?? []).map((profile) => profile.id);
  const { data: roleScores, error: roleScoresError } =
    profileIds.length === 0
      ? { data: [] as Database['public']['Tables']['role_scores']['Row'][], error: null }
      : await supabase.from('role_scores').select('*').in('profile_id', profileIds);
  if (roleScoresError) throw new Error(`Gagal memuat skor role: ${roleScoresError.message}`);

  const { data: matches, error: matchesError } = await supabase.from('matches').select('*').eq('player_id', userId);
  if (matchesError) throw new Error(`Gagal memuat pertandingan: ${matchesError.message}`);

  return {
    exported_at: new Date().toISOString(),
    player: player ?? null,
    attribute_profiles: attributeProfiles ?? [],
    role_scores: roleScores ?? [],
    matches: matches ?? [],
  };
}

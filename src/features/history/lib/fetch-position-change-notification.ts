import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../../../lib/database.types';
import { POSITION_NAMES, type PositionCode } from '../../scoring';

export interface PositionChangeNotification {
  profileId: string;
  positionName: string;
}

/**
 * FR-16 — notifikasi HANYA in-app, ditampilkan sekali saat pemain membuka
 * aplikasi berikutnya (PRD Lampiran C.4 menolak push notification penuh).
 * Baris `attribute_profiles` dengan `position_changed = true` dan
 * `change_acknowledged_at` masih null adalah notifikasi yang belum dilihat.
 */
export async function fetchUnacknowledgedPositionChange(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<PositionChangeNotification | null> {
  const { data, error } = await supabase
    .from('attribute_profiles')
    .select('id, posisi_utama_code')
    .eq('player_id', userId)
    .eq('position_changed', true)
    .is('change_acknowledged_at', null)
    .order('dibuat_pada', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(`Gagal memuat notifikasi perubahan posisi: ${error.message}`);
  if (!data || !data.posisi_utama_code) return null;

  return {
    profileId: data.id,
    positionName: POSITION_NAMES[data.posisi_utama_code as PositionCode],
  };
}

export async function acknowledgePositionChange(supabase: SupabaseClient<Database>, profileId: string): Promise<void> {
  const { error } = await supabase
    .from('attribute_profiles')
    .update({ change_acknowledged_at: new Date().toISOString() })
    .eq('id', profileId);
  if (error) throw new Error(`Gagal menandai notifikasi terbaca: ${error.message}`);
}

import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../../../lib/database.types';

/**
 * FR-20 — hapus SELURUH data profil pemain (players + attribute_profiles +
 * role_scores + matches) lewat satu DELETE, dibantu cascade yang sudah ada
 * di migrasi 0001/0003 (`on delete cascade`) plus policy DELETE baru di
 * migrasi 0004. Akun login (auth.users) SENGAJA tidak disentuh — hapus akun
 * sungguhan butuh service_role key, di luar scope Fase 4 (lihat migrasi
 * 0004). Pemanggil bertanggung jawab sign-out + bersihkan cache lokal
 * sesudah ini sukses.
 */
export async function deleteAllPlayerData(supabase: SupabaseClient<Database>, userId: string): Promise<void> {
  const { error } = await supabase.from('players').delete().eq('id', userId);
  if (error) throw new Error(`Gagal menghapus data pemain: ${error.message}`);
}

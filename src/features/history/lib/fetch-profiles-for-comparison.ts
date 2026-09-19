import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../../../lib/database.types';
import type { AttributeVector, PositionCode, RoleCode } from '../../scoring';

export interface ComparisonProfile {
  id: string;
  createdAt: string;
  confidence: number;
  attributes: AttributeVector;
  mainPosition: PositionCode | null;
  mainRole: RoleCode | null;
}

/**
 * FR-19 — dipanggil hanya saat mode "Bandingkan" dibuka di layar riwayat,
 * dengan id 1-2 entri yang dipilih pemain. `fetchProfileHistory` SENGAJA
 * tidak menarik `atribut` untuk semua entri riwayat sekaligus (riwayat bisa
 * sampai 10 baris, dan atribut cuma dibutuhkan saat perbandingan benar-benar
 * dibuka) — fungsi ini mengambil kolom yang lebih berat itu secara terpisah,
 * hanya untuk id yang diminta.
 */
export async function fetchProfilesForComparison(
  supabase: SupabaseClient<Database>,
  profileIds: string[],
): Promise<ComparisonProfile[]> {
  if (profileIds.length === 0) return [];

  const { data, error } = await supabase
    .from('attribute_profiles')
    .select('id, atribut, dibuat_pada, confidence, posisi_utama_code, role_utama_code')
    .in('id', profileIds);
  if (error) throw new Error(`Gagal memuat profil untuk dibandingkan: ${error.message}`);

  return (data ?? []).map((row) => ({
    id: row.id,
    createdAt: row.dibuat_pada,
    confidence: row.confidence,
    attributes: row.atribut as AttributeVector,
    mainPosition: (row.posisi_utama_code as PositionCode | null) ?? null,
    mainRole: (row.role_utama_code as RoleCode | null) ?? null,
  }));
}

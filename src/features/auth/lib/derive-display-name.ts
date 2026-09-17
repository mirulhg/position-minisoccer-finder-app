import type { User } from '@supabase/supabase-js';

/**
 * Fase 1 tidak mengumpulkan nama pemain, jadi nama untuk `players.nama`
 * diturunkan dari sesi login supaya alur masuk tetap ≤3 langkah (FR-01) —
 * tidak ada langkah form nama tambahan.
 */
export function deriveDisplayName(user: User): string {
  const metadataName = user.user_metadata?.full_name;
  if (typeof metadataName === 'string' && metadataName.trim().length > 0) return metadataName.trim();
  if (user.email) return user.email.split('@')[0];
  return 'Pemain';
}

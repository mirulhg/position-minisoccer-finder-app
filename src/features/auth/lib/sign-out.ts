import type { SupabaseClient } from '@supabase/supabase-js';

/** Keluar dari sesi Supabase Auth. Dependency disuntik lewat parameter, sama seperti fungsi auth lain di sini. */
export async function signOut(supabase: SupabaseClient): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(`Gagal keluar: ${error.message}`);
}

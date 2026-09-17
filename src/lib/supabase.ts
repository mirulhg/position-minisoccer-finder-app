import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * `false` selama `.env.local` belum diisi (lihat `.env.example`). Fitur
 * Fase 2 (login, migrasi, riwayat) harus mengecek ini dan tampil sebagai
 * "belum tersedia" alih-alih membuat client yang bakal gagal — alur Fase 1
 * (onboarding→kuesioner→hasil) wajib tetap jalan tanpa kredensial sama
 * sekali, termasuk sampai ke layar hasil.
 */
export const isSupabaseConfigured = Boolean(url && anonKey);

/**
 * Sesi disimpan otomatis oleh supabase-js (persistSession default true) dan
 * OAuth/magic-link redirect diurai otomatis dari URL (detectSessionInUrl
 * default true) — keduanya cukup untuk kebutuhan Fase 2, tidak perlu
 * konfigurasi tambahan. `null` kalau kredensial belum diisi.
 */
export const supabase: SupabaseClient<Database> | null = isSupabaseConfigured
  ? createClient<Database>(url, anonKey)
  : null;

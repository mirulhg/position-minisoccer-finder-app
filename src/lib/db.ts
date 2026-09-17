import { openDB, type IDBPDatabase } from 'idb';

const DB_NAME = 'msf-db';
const DB_VERSION = 1;

export type StoreName = 'onboardingProfile' | 'answers';

const STORE_NAMES: StoreName[] = ['onboardingProfile', 'answers'];

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDb(): Promise<IDBPDatabase> {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        for (const name of STORE_NAMES) {
          if (!db.objectStoreNames.contains(name)) db.createObjectStore(name);
        }
      },
    });
  }
  return dbPromise;
}

/**
 * Wrapper tipis di atas `idb` — penyimpanan lokal untuk jawaban kuesioner
 * dan profil onboarding (PRD Lampiran C.6: IndexedDB, bukan localStorage).
 * Nilai yang dibaca balik divalidasi dengan Zod di masing-masing fitur.
 */
export async function dbGet<T>(store: StoreName, key: string): Promise<T | undefined> {
  const db = await getDb();
  return db.get(store, key);
}

export async function dbPut(store: StoreName, key: string, value: unknown): Promise<void> {
  const db = await getDb();
  await db.put(store, value, key);
}

export async function dbGetAll<T>(store: StoreName): Promise<T[]> {
  const db = await getDb();
  return db.getAll(store);
}

export async function dbClear(store: StoreName): Promise<void> {
  const db = await getDb();
  await db.clear(store);
}

/**
 * Menandai satu record sudah dikirim ke Supabase, tanpa menghapusnya —
 * IndexedDB tetap jadi cache offline setelah migrasi (Fase 2). Dipanggil
 * sekali per record setelah `migrateLocalProfileToSupabase` berhasil,
 * supaya percobaan migrasi berikutnya tidak insert dobel.
 */
export async function markSynced(store: StoreName, key: string): Promise<void> {
  const existing = await dbGet<Record<string, unknown>>(store, key);
  if (!existing) return;
  await dbPut(store, key, { ...existing, syncedAt: new Date().toISOString() });
}


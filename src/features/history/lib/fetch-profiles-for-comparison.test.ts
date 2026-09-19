/// <reference types="node" />
import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../../../lib/database.types';
import { fetchProfilesForComparison } from './fetch-profiles-for-comparison';

type AttributeProfileRow = Database['public']['Tables']['attribute_profiles']['Row'];

function createFakeSupabase(rows: Partial<AttributeProfileRow>[]): SupabaseClient<Database> {
  return {
    from(table: string) {
      if (table !== 'attribute_profiles') throw new Error(`Tabel tidak terduga di fake: ${table}`);
      return {
        select: () => ({
          in: (_column: string, ids: string[]) =>
            Promise.resolve({ data: rows.filter((row) => ids.includes(row.id as string)), error: null }),
        }),
      };
    },
  } as unknown as SupabaseClient<Database>;
}

test('fetchProfilesForComparison: mengembalikan [] tanpa memanggil Supabase kalau tidak ada id diminta', async () => {
  const supabase = createFakeSupabase([{ id: 'never-called' }]);
  const result = await fetchProfilesForComparison(supabase, []);
  assert.deepEqual(result, []);
});

test('fetchProfilesForComparison: memetakan kolom snake_case ke bentuk camelCase, hanya untuk id yang diminta', async () => {
  const supabase = createFakeSupabase([
    {
      id: 'profile-1',
      atribut: { TKL: 77, STR: 71 },
      dibuat_pada: '2026-01-01T00:00:00Z',
      confidence: 0.62,
      posisi_utama_code: 'CB',
      role_utama_code: 'CB-ST',
    },
    {
      id: 'profile-2',
      atribut: { TKL: 40, STR: 50 },
      dibuat_pada: '2026-02-01T00:00:00Z',
      confidence: 0.7,
      posisi_utama_code: null,
      role_utama_code: null,
    },
    { id: 'profile-not-requested', atribut: {}, dibuat_pada: '2026-03-01T00:00:00Z', confidence: 0.9 },
  ]);

  const result = await fetchProfilesForComparison(supabase, ['profile-1', 'profile-2']);

  assert.equal(result.length, 2);
  assert.deepEqual(result[0], {
    id: 'profile-1',
    createdAt: '2026-01-01T00:00:00Z',
    confidence: 0.62,
    attributes: { TKL: 77, STR: 71 },
    mainPosition: 'CB',
    mainRole: 'CB-ST',
  });
  assert.deepEqual(result[1], {
    id: 'profile-2',
    createdAt: '2026-02-01T00:00:00Z',
    confidence: 0.7,
    attributes: { TKL: 40, STR: 50 },
    mainPosition: null,
    mainRole: null,
  });
});

test('fetchProfilesForComparison: melempar error yang jelas kalau query gagal', async () => {
  const supabase = {
    from() {
      return { select: () => ({ in: () => Promise.resolve({ data: null, error: { message: 'timeout' } }) }) };
    },
  } as unknown as SupabaseClient<Database>;

  await assert.rejects(
    () => fetchProfilesForComparison(supabase, ['profile-1']),
    /Gagal memuat profil untuk dibandingkan: timeout/,
  );
});

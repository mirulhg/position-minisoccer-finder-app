/// <reference types="node" />
import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../../../lib/database.types';
import { exportPlayerData } from './export-player-data';

interface FakeTables {
  player: Record<string, unknown> | null;
  attributeProfiles: Record<string, unknown>[];
  roleScores: Record<string, unknown>[];
  matches: Record<string, unknown>[];
}

function createFakeSupabase(tables: FakeTables): SupabaseClient<Database> {
  return {
    from(table: string) {
      if (table === 'players') {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: () => Promise.resolve({ data: tables.player, error: null }),
            }),
          }),
        };
      }
      if (table === 'attribute_profiles') {
        return {
          select: () => ({
            eq: () => Promise.resolve({ data: tables.attributeProfiles, error: null }),
          }),
        };
      }
      if (table === 'role_scores') {
        return {
          select: () => ({
            in: () => Promise.resolve({ data: tables.roleScores, error: null }),
          }),
        };
      }
      if (table === 'matches') {
        return {
          select: () => ({
            eq: () => Promise.resolve({ data: tables.matches, error: null }),
          }),
        };
      }
      throw new Error(`Tabel tidak terduga di fake: ${table}`);
    },
  } as unknown as SupabaseClient<Database>;
}

test('exportPlayerData: menggabungkan keempat tabel jadi satu objek dengan exported_at', async () => {
  const supabase = createFakeSupabase({
    player: { id: 'user-1', nama: 'Rizky' },
    attributeProfiles: [{ id: 'profile-1' }, { id: 'profile-2' }],
    roleScores: [{ profile_id: 'profile-1', role_code: 'CB-ST' }],
    matches: [{ id: 'match-1' }],
  });

  const before = Date.now();
  const result = await exportPlayerData(supabase, 'user-1');
  const after = Date.now();

  assert.deepEqual(result.player, { id: 'user-1', nama: 'Rizky' });
  assert.deepEqual(result.attribute_profiles, [{ id: 'profile-1' }, { id: 'profile-2' }]);
  assert.deepEqual(result.role_scores, [{ profile_id: 'profile-1', role_code: 'CB-ST' }]);
  assert.deepEqual(result.matches, [{ id: 'match-1' }]);

  const exportedAt = new Date(result.exported_at).getTime();
  assert.ok(exportedAt >= before && exportedAt <= after);
});

test('exportPlayerData: tidak query role_scores kalau belum ada attribute_profiles sama sekali', async () => {
  let roleScoresQueried = false;
  const supabase = {
    from(table: string) {
      if (table === 'players') {
        return { select: () => ({ eq: () => ({ maybeSingle: () => Promise.resolve({ data: null, error: null }) }) }) };
      }
      if (table === 'attribute_profiles') {
        return { select: () => ({ eq: () => Promise.resolve({ data: [], error: null }) }) };
      }
      if (table === 'role_scores') {
        roleScoresQueried = true;
        return { select: () => ({ in: () => Promise.resolve({ data: [], error: null }) }) };
      }
      if (table === 'matches') {
        return { select: () => ({ eq: () => Promise.resolve({ data: [], error: null }) }) };
      }
      throw new Error(`Tabel tidak terduga: ${table}`);
    },
  } as unknown as SupabaseClient<Database>;

  const result = await exportPlayerData(supabase, 'user-1');

  assert.equal(roleScoresQueried, false);
  assert.deepEqual(result.role_scores, []);
});

test('exportPlayerData: melempar error yang jelas kalau salah satu query gagal', async () => {
  const supabase = {
    from(table: string) {
      if (table === 'players') {
        return {
          select: () => ({
            eq: () => ({ maybeSingle: () => Promise.resolve({ data: null, error: { message: 'timeout' } }) }),
          }),
        };
      }
      throw new Error(`Tabel tidak terduga: ${table}`);
    },
  } as unknown as SupabaseClient<Database>;

  await assert.rejects(() => exportPlayerData(supabase, 'user-1'), /Gagal memuat data pemain: timeout/);
});

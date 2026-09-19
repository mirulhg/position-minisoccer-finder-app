/// <reference types="node" />
import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../../../lib/database.types';
import { deleteAllPlayerData } from './delete-player-data';

test('deleteAllPlayerData: menghapus baris players milik userId', async () => {
  const calls: { table: string; column: string; value: string }[] = [];
  const supabase = {
    from(table: string) {
      return {
        delete: () => ({
          eq: (column: string, value: string) => {
            calls.push({ table, column, value });
            return Promise.resolve({ error: null });
          },
        }),
      };
    },
  } as unknown as SupabaseClient<Database>;

  await deleteAllPlayerData(supabase, 'user-1');

  assert.deepEqual(calls, [{ table: 'players', column: 'id', value: 'user-1' }]);
});

test('deleteAllPlayerData: melempar error yang jelas kalau delete gagal', async () => {
  const supabase = {
    from() {
      return { delete: () => ({ eq: () => Promise.resolve({ error: { message: 'RLS ditolak' } }) }) };
    },
  } as unknown as SupabaseClient<Database>;

  await assert.rejects(() => deleteAllPlayerData(supabase, 'user-1'), /Gagal menghapus data pemain: RLS ditolak/);
});

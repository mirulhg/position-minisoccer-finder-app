/// <reference types="node" />
import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../../../lib/database.types';
import type { OnboardingProfile } from '../../onboarding';
import { SCORING_CONFIG_VERSION, type ScoringResult } from '../../scoring';
import { migrateLocalProfileToSupabase } from './migrate-local-profile';

interface FakeCall {
  table: string;
  op: 'upsert' | 'insert';
  payload: unknown;
}

interface FakeResponses {
  playersError?: string;
  profileInsert?: { data: { id: string } | null; error?: string };
  roleScoresError?: string;
}

function createFakeSupabase(responses: FakeResponses, calls: FakeCall[]): SupabaseClient<Database> {
  return {
    from(table: string) {
      return {
        upsert(payload: unknown) {
          calls.push({ table, op: 'upsert', payload });
          return Promise.resolve({ error: responses.playersError ? { message: responses.playersError } : null });
        },
        insert(payload: unknown) {
          calls.push({ table, op: 'insert', payload });
          if (table === 'role_scores') {
            return Promise.resolve({
              error: responses.roleScoresError ? { message: responses.roleScoresError } : null,
            });
          }
          return {
            select() {
              return {
                single() {
                  const result = responses.profileInsert ?? { data: { id: 'profile-1' } };
                  return Promise.resolve({
                    data: result.data,
                    error: result.error ? { message: result.error } : null,
                  });
                },
              };
            },
          };
        },
      };
    },
  } as unknown as SupabaseClient<Database>;
}

const FAKE_PROFILE: OnboardingProfile = {
  heightCm: 178,
  weightKg: 74,
  age: 24,
  dominantFoot: 'kanan',
  usualPosition: 'CB',
  willingGoalkeeper: false,
};

const FAKE_SCORING_RESULT: ScoringResult = {
  attributes: { TKL: 77, STR: 71, FIN: 38 },
  questionnaireAttributes: { TKL: 75, STR: 70, FIN: 40 },
  roleScores: [
    { role: 'CB-ST', base: 69, gate: 1, fit: 69 },
    { role: 'CM-B2B', base: 66.5, gate: 1, fit: 66.5 },
  ],
  positionScores: [{ position: 'CB', score: 69, bestRole: 'CB-ST', secondRole: null }],
  mainPosition: { position: 'CB', score: 69, bestRole: 'CB-ST', secondRole: null },
  reliability: 0.86,
  confidence: 0.3,
  confidenceLabel: 'Awal',
};

test('migrateLocalProfileToSupabase mengirim payload yang benar ke tiga tabel', async () => {
  const calls: FakeCall[] = [];
  const supabase = createFakeSupabase({}, calls);

  const result = await migrateLocalProfileToSupabase(supabase, {
    userId: 'user-1',
    displayName: 'Rizky',
    profile: FAKE_PROFILE,
    scoringResult: FAKE_SCORING_RESULT,
  });

  assert.deepEqual(result, { playerId: 'user-1', profileId: 'profile-1' });

  const playersCall = calls.find((c) => c.table === 'players');
  assert.deepEqual(playersCall?.payload, {
    id: 'user-1',
    nama: 'Rizky',
    tinggi_cm: 178,
    berat_kg: 74,
    usia: 24,
    kaki_dominan: 'kanan',
    bersedia_kiper: false,
  });

  const profileCall = calls.find((c) => c.table === 'attribute_profiles');
  assert.deepEqual(profileCall?.payload, {
    player_id: 'user-1',
    atribut: { TKL: 77, STR: 71, FIN: 38 },
    atribut_kuesioner: { TKL: 75, STR: 70, FIN: 40 },
    reliability: 0.86,
    confidence: 0.3,
    versi_konfigurasi: SCORING_CONFIG_VERSION,
    posisi_biasa: 'CB',
    posisi_utama_code: 'CB',
    role_utama_code: 'CB-ST',
  });

  const roleScoresCall = calls.find((c) => c.table === 'role_scores');
  assert.deepEqual(roleScoresCall?.payload, [
    { profile_id: 'profile-1', role_code: 'CB-ST', base: 69, gate: 1, fit: 69 },
    { profile_id: 'profile-1', role_code: 'CM-B2B', base: 66.5, gate: 1, fit: 66.5 },
  ]);
});

test('migrateLocalProfileToSupabase melempar error yang jelas kalau players gagal', async () => {
  const supabase = createFakeSupabase({ playersError: 'kolom usia tidak valid' }, []);

  await assert.rejects(
    () =>
      migrateLocalProfileToSupabase(supabase, {
        userId: 'user-1',
        displayName: 'Rizky',
        profile: FAKE_PROFILE,
        scoringResult: FAKE_SCORING_RESULT,
      }),
    /Gagal menyimpan data pemain: kolom usia tidak valid/,
  );
});

test('migrateLocalProfileToSupabase melempar error kalau attribute_profiles tidak mengembalikan id', async () => {
  const supabase = createFakeSupabase({ profileInsert: { data: null, error: 'unique violation' } }, []);

  await assert.rejects(
    () =>
      migrateLocalProfileToSupabase(supabase, {
        userId: 'user-1',
        displayName: 'Rizky',
        profile: FAKE_PROFILE,
        scoringResult: FAKE_SCORING_RESULT,
      }),
    /Gagal menyimpan profil atribut: unique violation/,
  );
});

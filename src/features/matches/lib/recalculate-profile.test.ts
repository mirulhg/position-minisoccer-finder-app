/// <reference types="node" />
import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../../../lib/database.types';
import {
  computeBaseRoleScores,
  computeRoleScores,
  normalizeToCohort,
  FIELD_ATTRIBUTE_CODES,
  type AttributeVector,
  type RoleScore,
} from '../../scoring';
import { recalculateProfile } from './recalculate-profile';

type AttributeProfileRow = Database['public']['Tables']['attribute_profiles']['Row'];
type RoleScoreRow = Database['public']['Tables']['role_scores']['Row'];
type MatchRow = Database['public']['Tables']['matches']['Row'];

interface FakeConfig {
  attributeProfilesRows: Partial<AttributeProfileRow>[];
  roleScoreRows?: Partial<RoleScoreRow>[];
  matchRows?: Partial<MatchRow>[];
}

interface RecordedInsert {
  table: string;
  payload: unknown;
}

function createFakeSupabase(config: FakeConfig, inserts: RecordedInsert[]): SupabaseClient<Database> {
  return {
    from(table: string) {
      if (table === 'attribute_profiles') {
        return {
          select: () => ({
            eq: () => ({
              order: () => ({
                limit: (n: number) =>
                  Promise.resolve({ data: config.attributeProfilesRows.slice(0, n), error: null }),
              }),
            }),
          }),
          insert: (payload: unknown) => {
            inserts.push({ table: 'attribute_profiles', payload });
            return {
              select: () => ({
                single: () => Promise.resolve({ data: { id: 'new-profile-id' }, error: null }),
              }),
            };
          },
        };
      }
      if (table === 'role_scores') {
        return {
          select: () => ({
            in: () => Promise.resolve({ data: config.roleScoreRows ?? [], error: null }),
          }),
          insert: (payload: unknown) => {
            inserts.push({ table: 'role_scores', payload });
            return Promise.resolve({ error: null });
          },
        };
      }
      if (table === 'matches') {
        return {
          select: () => ({
            eq: () => Promise.resolve({ data: config.matchRows ?? [], error: null }),
          }),
        };
      }
      throw new Error(`Tabel tidak terduga di fake: ${table}`);
    },
  } as unknown as SupabaseClient<Database>;
}

const QUESTIONNAIRE_ATTRIBUTES = { TKL: 77, STR: 71, FIN: 38 };

// Atribut ekstrem yang dibuat khusus untuk pengujian peredam osilasi: ST
// menang telak (gap >> 4 poin) atas CB lewat gate Tahap 6 yang nyata
// (bukan skor palsu) — dicek manual dengan menjalankan pipeline: ST ≈ 48.2
// vs CB ≈ 17.5.
const ST_LEANING_ATTRIBUTES: AttributeVector = Object.fromEntries(
  FIELD_ATTRIBUTE_CODES.map((code) => {
    if (['FIN', 'OPS', 'STR', 'AER', 'JMP', 'PRS', 'STA', 'FTC'].includes(code)) return [code, 100];
    if (
      ['TKL', 'DPS', 'ANT', 'PSS', 'CMP', 'AGG', 'LDR', 'VIS', 'WRK', 'LPS', 'DRB', 'CRS', 'PAC', 'ACC', 'AGI'].includes(
        code,
      )
    )
      return [code, 0];
    return [code, 50];
  }),
);

// CB menang (gap positif atas ST) lewat gate nyata — dicek manual: CB ≈
// 63.1 vs ST ≈ 48.7.
const CB_LEANING_ATTRIBUTES: AttributeVector = Object.fromEntries(
  FIELD_ATTRIBUTE_CODES.map((code) => {
    if (['TKL', 'STR', 'DPS', 'AER', 'ANT', 'CMP', 'AGG', 'LDR', 'PRS', 'WRK'].includes(code)) return [code, 100];
    if (['FIN', 'OPS', 'DRB', 'CRS', 'PAC', 'ACC', 'AGI', 'LSH', 'VIS', 'FTC', 'PSS', 'LPS'].includes(code))
      return [code, 0];
    return [code, 50];
  }),
);

function roleScoreRowsFor(profileId: string, attributes: AttributeVector): Partial<RoleScoreRow>[] {
  const normalized = normalizeToCohort(attributes);
  const base = computeBaseRoleScores(normalized);
  const roleScores: RoleScore[] = computeRoleScores(normalized, base);
  return roleScores.map((score) => ({
    profile_id: profileId,
    role_code: score.role,
    base: score.base,
    gate: score.gate,
    fit: score.fit,
  }));
}

test('recalculateProfile: tanpa pertandingan dan tanpa profil sebelumnya, langsung pakai kandidat mentah (tidak ada dasar meredam)', async () => {
  const inserts: RecordedInsert[] = [];
  const supabase = createFakeSupabase(
    {
      attributeProfilesRows: [
        {
          id: 'profile-1',
          atribut_kuesioner: QUESTIONNAIRE_ATTRIBUTES,
          atribut: QUESTIONNAIRE_ATTRIBUTES,
          reliability: 0.9,
          posisi_biasa: 'CB',
          posisi_utama_code: 'CB',
        },
      ],
      roleScoreRows: [],
      matchRows: [],
    },
    inserts,
  );

  const result = await recalculateProfile(supabase, { userId: 'user-1' });

  assert.equal(result.profileId, 'new-profile-id');
  assert.equal(result.positionChanged, result.mainPosition.position !== 'CB');

  const profileInsert = inserts.find((i) => i.table === 'attribute_profiles');
  const payload = profileInsert?.payload as Record<string, unknown>;
  assert.equal(payload.player_id, 'user-1');
  assert.equal(payload.reliability, 0.9);
  assert.equal(payload.posisi_biasa, 'CB');
  assert.equal(payload.confidence, 0.35 * 0.9); // N=0, V=0 (tidak ada pertandingan)

  // Tanpa pertandingan, blend adalah passthrough — atribut baru = normalizeToCohort(Q_i) persis.
  const expectedTkl = normalizeToCohort(QUESTIONNAIRE_ATTRIBUTES).TKL;
  assert.equal((payload.atribut as Record<string, number>).TKL, expectedTkl);
  assert.deepEqual(payload.atribut_kuesioner, QUESTIONNAIRE_ATTRIBUTES);

  const roleScoresInsert = inserts.find((i) => i.table === 'role_scores');
  if (!roleScoresInsert) throw new Error('role_scores tidak pernah di-insert');
  assert.equal((roleScoresInsert.payload as unknown[]).length, 17);
});

test('recalculateProfile: baris terbaru pra-Fase-3 (posisi_utama_code null) melewati peredam osilasi', async () => {
  const inserts: RecordedInsert[] = [];
  const supabase = createFakeSupabase(
    {
      attributeProfilesRows: [
        {
          id: 'profile-1',
          atribut_kuesioner: QUESTIONNAIRE_ATTRIBUTES,
          atribut: QUESTIONNAIRE_ATTRIBUTES,
          reliability: 0.9,
          posisi_biasa: null,
          posisi_utama_code: null,
        },
        { id: 'profile-0', posisi_utama_code: null },
      ],
      roleScoreRows: [],
      matchRows: [],
    },
    inserts,
  );

  const result = await recalculateProfile(supabase, { userId: 'user-1' });
  // posisi_utama_code lama null -> positionChanged dianggap false (tidak ada baseline untuk dibandingkan).
  assert.equal(result.positionChanged, false);
});

test('recalculateProfile: peredam osilasi — kandidat baru unggul ≥4 poin pada rekalkulasi sebelumnya DAN sekarang -> posisi utama berganti', async () => {
  const inserts: RecordedInsert[] = [];
  const supabase = createFakeSupabase(
    {
      attributeProfilesRows: [
        {
          id: 'profile-1',
          // Q_i pertandingan ini: sama-sama condong ST seperti rekalkulasi
          // sebelumnya (positionScores rekalkulasi sebelumnya diinjeksi
          // lewat roleScoreRows di bawah, bukan dari baris ini).
          atribut_kuesioner: ST_LEANING_ATTRIBUTES,
          atribut: ST_LEANING_ATTRIBUTES,
          reliability: 0.9,
          posisi_biasa: 'CB',
          posisi_utama_code: 'CB',
        },
      ],
      // role_scores milik profile-1 = rekalkulasi SEBELUM pertandingan ini —
      // sudah menunjukkan ST unggul jauh dari CB.
      roleScoreRows: roleScoreRowsFor('profile-1', ST_LEANING_ATTRIBUTES),
      matchRows: [],
    },
    inserts,
  );

  const result = await recalculateProfile(supabase, { userId: 'user-1' });

  // Tanpa pertandingan, blend adalah passthrough, jadi rekalkulasi SEKARANG
  // juga memakai ST_LEANING_ATTRIBUTES -> ST unggul jauh lagi di sini juga.
  // Kedua rekalkulasi berturut-turut memenuhi ambang ≥4 poin -> beralih.
  assert.equal(result.mainPosition.position, 'ST');
  assert.equal(result.positionChanged, true);
});

test('recalculateProfile: peredam osilasi — kandidat baru baru unggul ≥4 poin pada rekalkulasi sekarang saja -> posisi utama BELUM berganti', async () => {
  const inserts: RecordedInsert[] = [];
  const supabase = createFakeSupabase(
    {
      attributeProfilesRows: [
        {
          id: 'profile-1',
          // Q_i pertandingan ini condong ST secara tiba-tiba.
          atribut_kuesioner: ST_LEANING_ATTRIBUTES,
          atribut: ST_LEANING_ATTRIBUTES,
          reliability: 0.9,
          posisi_biasa: 'CB',
          posisi_utama_code: 'CB',
        },
      ],
      // Tapi role_scores milik profile-1 (rekalkulasi SEBELUM pertandingan
      // ini) masih menunjukkan CB unggul -> belum ada persistensi dua
      // rekalkulasi berturut-turut.
      roleScoreRows: roleScoreRowsFor('profile-1', CB_LEANING_ATTRIBUTES),
      matchRows: [],
    },
    inserts,
  );

  const result = await recalculateProfile(supabase, { userId: 'user-1' });

  // Skor mentah rekalkulasi ini sudah menunjuk ST, tapi peredam osilasi
  // menahannya karena rekalkulasi sebelumnya belum menunjukkan hal yang
  // sama -> posisi utama tetap CB.
  assert.equal(result.mainPosition.position, 'CB');
  assert.equal(result.positionChanged, false);
});

test('recalculateProfile: melempar error kalau belum ada profil sama sekali', async () => {
  const supabase = createFakeSupabase({ attributeProfilesRows: [] }, []);
  await assert.rejects(() => recalculateProfile(supabase, { userId: 'user-1' }), /Belum ada profil atribut/);
});

test('recalculateProfile: melempar error kalau reliability baris terbaru null', async () => {
  const supabase = createFakeSupabase(
    { attributeProfilesRows: [{ id: 'profile-1', atribut_kuesioner: QUESTIONNAIRE_ATTRIBUTES, reliability: null }] },
    [],
  );
  await assert.rejects(() => recalculateProfile(supabase, { userId: 'user-1' }), /reliability/);
});

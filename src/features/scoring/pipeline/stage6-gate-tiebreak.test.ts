/// <reference types="node" />
import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { PositionScore, RoleScore } from '../types';
import type { MatchRecord } from './match-stats-conversion';
import { pickMainPosition, type TieBreakContext } from './stage6-gate-tiebreak';

function positionScore(position: PositionScore['position'], score: number, bestRole: RoleScore['role']): PositionScore {
  return { position, score, bestRole, secondRole: null };
}

function roleScore(role: RoleScore['role'], gate: number): RoleScore {
  return { role, base: 50, gate, fit: 50 * gate };
}

function match(posisiDimainkan: MatchRecord['posisiDimainkan']): MatchRecord {
  return { menitBermain: 40, posisiDimainkan };
}

test('pickMainPosition: tie-break selesai di langkah 1 (gate margin beda) — perilaku lama, tidak berubah', () => {
  const positionScores = [positionScore('CB', 50, 'CB-ST'), positionScore('ST', 49, 'ST-PO')];
  const ctx: TieBreakContext = {
    roleScores: [roleScore('CB-ST', 0.9), roleScore('ST-PO', 0.5)],
    usualPosition: null,
    // Match count sengaja dibuat berlawanan dengan hasil yang diharapkan —
    // membuktikan langkah 1 (gate margin) yang menentukan, bukan langkah 2.
    matches: [match('ST'), match('ST'), match('ST')],
  };

  const result = pickMainPosition(positionScores, ctx);
  assert.equal(result.position, 'CB');
});

test('pickMainPosition: gate margin SAMA, jumlah pertandingan BEDA -> menang yang lebih banyak match (langkah 2 baru)', () => {
  const positionScores = [positionScore('CB', 50, 'CB-ST'), positionScore('ST', 49, 'ST-PO')];
  const ctx: TieBreakContext = {
    roleScores: [roleScore('CB-ST', 0.8), roleScore('ST-PO', 0.8)],
    usualPosition: null,
    // ST menang jumlah pertandingan meski skor mentahnya lebih rendah dan
    // rarity ST lebih rendah dari CB (POSITION_RARITY: CB=2, ST=0) — kalau
    // langkah 2 tidak jalan, hasilnya akan CB lewat langkah 3.
    matches: [match('CB'), match('ST'), match('ST'), match('ST')],
  };

  const result = pickMainPosition(positionScores, ctx);
  assert.equal(result.position, 'ST');
});

test('pickMainPosition: gate margin SAMA dan jumlah pertandingan SAMA -> lanjut ke langkah 3 (rarity), hasil tidak berubah', () => {
  const positionScores = [positionScore('ST', 50, 'ST-PO'), positionScore('CB', 49, 'CB-ST')];
  const baseCtx = {
    roleScores: [roleScore('ST-PO', 0.8), roleScore('CB-ST', 0.8)],
    usualPosition: null as PositionScore['position'] | null,
  };

  // Kasus 1: jumlah pertandingan sama-sama 2 (bukan 0 vs 0).
  const withEqualMatches = pickMainPosition(positionScores, {
    ...baseCtx,
    matches: [match('ST'), match('ST'), match('CB'), match('CB')],
  });
  // POSITION_RARITY: CB=2, ST=0 -> CB menang lewat langkah 3, walau ST
  // adalah kandidat "top" mentah di atas.
  assert.equal(withEqualMatches.position, 'CB');

  // Kasus 2: `matches` tidak dikirim sama sekali (0 vs 0) -> hasil sama.
  const withoutMatches = pickMainPosition(positionScores, baseCtx);
  assert.equal(withoutMatches.position, 'CB');
});

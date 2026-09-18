/// <reference types="node" />
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { convertMatchesToAttributeStats, type MatchRecord } from './match-stats-conversion';

test('convertMatchesToAttributeStats: pertandingan kosong menghasilkan vektor kosong', () => {
  const result = convertMatchesToAttributeStats([]);
  assert.deepEqual(result, { stats: {}, counts: {}, dataCompleteness: 0 });
});

test('convertMatchesToAttributeStats: satu field ke satu atribut (TKL dari tekel_berhasil)', () => {
  const matches: MatchRecord[] = [
    { menitBermain: 40, posisiDimainkan: 'CB', tekelBerhasil: 4 },
    { menitBermain: 40, posisiDimainkan: 'CB', tekelBerhasil: 2 },
  ];
  const result = convertMatchesToAttributeStats(matches);

  // rate = 40 * (4+2) / (40+40) = 3 tekel/40 menit -> normalizeToCohort(3) dengan mean=50,stdev=15
  const expectedTkl = 50 + (10 * (3 - 50)) / 15;
  assert.equal(result.stats.TKL, Math.max(1, Math.min(99, expectedTkl)));
  assert.equal(result.counts.TKL, 2);
});

test('convertMatchesToAttributeStats: pool bersama untuk atribut dengan >1 sumber field (ANT dari tekel_berhasil + intersep)', () => {
  const matches: MatchRecord[] = [
    { menitBermain: 40, posisiDimainkan: 'CB', tekelBerhasil: 2, intersep: null },
    { menitBermain: 40, posisiDimainkan: 'CB', tekelBerhasil: null, intersep: 3 },
  ];
  const result = convertMatchesToAttributeStats(matches);

  // Kedua pertandingan relevan untuk ANT (masing-masing mengisi salah satu field).
  // rate = 40 * (2+3) / (40+40) = 2.5
  const expectedAnt = 50 + (10 * (2.5 - 50)) / 15;
  assert.equal(result.stats.ANT, Math.max(1, Math.min(99, expectedAnt)));
  assert.equal(result.counts.ANT, 2);
});

test('convertMatchesToAttributeStats: kehilangan_bola dibalik untuk FTC dan CMP', () => {
  const matches: MatchRecord[] = [{ menitBermain: 40, posisiDimainkan: 'CM', kehilanganBola: 20 }];
  const result = convertMatchesToAttributeStats(matches);

  const rawNormalized = 50 + (10 * (20 - 50)) / 15;
  const expected = 100 - Math.max(1, Math.min(99, rawNormalized));
  assert.equal(result.stats.FTC, expected);
  assert.equal(result.stats.CMP, expected);
});

test('convertMatchesToAttributeStats: pelanggaran ke AGG tidak dibalik (konsisten Q25)', () => {
  const few: MatchRecord[] = [{ menitBermain: 40, posisiDimainkan: 'CB', pelanggaran: 1 }];
  const many: MatchRecord[] = [{ menitBermain: 40, posisiDimainkan: 'CB', pelanggaran: 5 }];
  const fewResult = convertMatchesToAttributeStats(few);
  const manyResult = convertMatchesToAttributeStats(many);

  assert.ok((manyResult.stats.AGG ?? 0) > (fewResult.stats.AGG ?? 0));
});

test('convertMatchesToAttributeStats: clean sheet hanya dihitung dari pertandingan kiper', () => {
  const matches: MatchRecord[] = [
    { menitBermain: 40, posisiDimainkan: 'GK', cleanSheet: true },
    { menitBermain: 40, posisiDimainkan: 'GK', cleanSheet: false },
    { menitBermain: 40, posisiDimainkan: 'CB', gol: 1 },
  ];
  const result = convertMatchesToAttributeStats(matches);

  // proporsi 1/2 * 100 = 50 -> normalizeToCohort(50) = 50 tepat (mean=50)
  assert.equal(result.stats['GK-REF'], 50);
  assert.equal(result.stats['GK-POS'], 50);
  assert.equal(result.counts['GK-REF'], 2);
});

test('convertMatchesToAttributeStats: STA dari rata-rata menit per pertandingan', () => {
  const matches: MatchRecord[] = [
    { menitBermain: 30, posisiDimainkan: 'CM' },
    { menitBermain: 40, posisiDimainkan: 'CM' },
  ];
  const result = convertMatchesToAttributeStats(matches);

  const expected = 50 + (10 * (35 - 50)) / 15;
  assert.equal(result.stats.STA, Math.max(1, Math.min(99, expected)));
  assert.equal(result.counts.STA, 2);
});

test('convertMatchesToAttributeStats: dataCompleteness rata-rata proporsi field terisi, clean_sheet hanya relevan untuk kiper', () => {
  const matches: MatchRecord[] = [
    // Non-kiper: 8 field opsional numerik berlaku, 1 terisi -> 1/8
    { menitBermain: 40, posisiDimainkan: 'CB', gol: 1 },
    // Kiper: 8 field numerik + clean_sheet = 9 berlaku, 1 (clean_sheet) terisi -> 1/9
    { menitBermain: 40, posisiDimainkan: 'GK', cleanSheet: true },
  ];
  const result = convertMatchesToAttributeStats(matches);

  const expected = (1 / 8 + 1 / 9) / 2;
  assert.ok(Math.abs(result.dataCompleteness - expected) < 1e-9);
});

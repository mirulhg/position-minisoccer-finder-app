/// <reference types="node" />
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { convertFrequency, convertLikert, convertTradeOff } from './stage1-item-score';

test('convertTradeOff: "situational" mengembalikan 50/50 — netral, tidak bias ke sisi kiri', () => {
  assert.equal(convertTradeOff('situational', 'left'), 50);
  assert.equal(convertTradeOff('situational', 'right'), 50);
});

test('convertTradeOff: pilihan eksplisit tetap 100/0, tidak berubah', () => {
  assert.equal(convertTradeOff('left', 'left'), 100);
  assert.equal(convertTradeOff('left', 'right'), 0);
  assert.equal(convertTradeOff('right', 'right'), 100);
  assert.equal(convertTradeOff('right', 'left'), 0);
});

test('convertLikert: skala 1-5 -> 0-100, dibalik kalau reversed', () => {
  assert.equal(convertLikert(1), 0);
  assert.equal(convertLikert(5), 100);
  assert.equal(convertLikert(3), 50);
  assert.equal(convertLikert(1, true), 100);
  assert.equal(convertLikert(5, true), 0);
});

test('convertFrequency: saturasi menuju 100 seiring n membesar, dibalik kalau reversed', () => {
  assert.equal(convertFrequency(0, 3), 0);
  assert.equal(convertFrequency(3, 3), 50);
  assert.equal(convertFrequency(0, 3, true), 100);
});

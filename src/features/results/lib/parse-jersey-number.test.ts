/// <reference types="node" />
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseJerseyNumber } from './parse-jersey-number';

test('parseJerseyNumber: kosong atau spasi -> valid tanpa nomor', () => {
  assert.deepEqual(parseJerseyNumber(''), { isValid: true, value: undefined });
  assert.deepEqual(parseJerseyNumber('  '), { isValid: true, value: undefined });
});

test('parseJerseyNumber: 1-99 diterima', () => {
  assert.deepEqual(parseJerseyNumber('1'), { isValid: true, value: 1 });
  assert.deepEqual(parseJerseyNumber(' 10 '), { isValid: true, value: 10 });
  assert.deepEqual(parseJerseyNumber('99'), { isValid: true, value: 99 });
});

test('parseJerseyNumber: di luar rentang atau bukan angka bulat ditolak', () => {
  for (const raw of ['0', '00', '07', '100', '150', 'abc', '12a', '3.5', '-5']) {
    assert.deepEqual(parseJerseyNumber(raw), { isValid: false }, raw);
  }
});

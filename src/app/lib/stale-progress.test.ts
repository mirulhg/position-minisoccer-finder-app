/// <reference types="node" />
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isProgressStale, STALE_PROGRESS_MS } from './stale-progress';

const NOW = Date.parse('2026-09-20T00:00:00.000Z');

test('isProgressStale: aktivitas 1 hari lalu -> progres TETAP dipertahankan', () => {
  const oneDayAgo = NOW - 24 * 60 * 60 * 1000;
  assert.equal(isProgressStale(oneDayAgo, NOW), false);
});

test('isProgressStale: aktivitas lebih dari 30 hari lalu -> progres dianggap basi', () => {
  const overThirtyDaysAgo = NOW - (STALE_PROGRESS_MS + 1);
  assert.equal(isProgressStale(overThirtyDaysAgo, NOW), true);
});

test('isProgressStale: tepat di ambang 30 hari -> belum dianggap basi (strictly greater than)', () => {
  const exactlyThirtyDaysAgo = NOW - STALE_PROGRESS_MS;
  assert.equal(isProgressStale(exactlyThirtyDaysAgo, NOW), false);
});

test('isProgressStale: tidak ada lastActivityAt (pemain baru) -> tidak pernah dianggap basi', () => {
  assert.equal(isProgressStale(undefined, NOW), false);
});

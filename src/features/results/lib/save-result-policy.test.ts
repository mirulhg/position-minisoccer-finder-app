/// <reference types="node" />
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { decideSaveResultAction } from './save-result-policy';

test('decideSaveResultAction: sesi ada tapi belum dikonfirmasi -> tampilkan konfirmasi, migrasi TIDAK boleh jalan', () => {
  const action = decideSaveResultAction({ hasSession: true, hasConfirmed: false });
  assert.equal(action, 'show-confirmation');
  assert.notEqual(action, 'run-migration');
});

test('decideSaveResultAction: sesi ada DAN sudah dikonfirmasi -> migrasi boleh jalan', () => {
  assert.equal(decideSaveResultAction({ hasSession: true, hasConfirmed: true }), 'run-migration');
});

test('decideSaveResultAction: tidak ada sesi (guest) -> tidak ada migrasi, tidak ada UI konfirmasi, terlepas dari hasConfirmed', () => {
  assert.equal(decideSaveResultAction({ hasSession: false, hasConfirmed: false }), 'none');
  assert.equal(decideSaveResultAction({ hasSession: false, hasConfirmed: true }), 'none');
});

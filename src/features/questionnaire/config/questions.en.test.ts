/// <reference types="node" />
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { QUESTION_BANK } from './questions';
import { QUESTION_BANK_EN } from './questions.en';

test('QUESTION_BANK_EN: punya entri untuk SEMUA id di QUESTION_BANK (Q01-Q50), tidak ada yang terlewat', () => {
  const missingIds = QUESTION_BANK.map((question) => question.id).filter((id) => !(id in QUESTION_BANK_EN));
  assert.deepEqual(missingIds, []);
});

test('QUESTION_BANK_EN: tidak ada entri "hantu" untuk id yang sudah tidak ada di QUESTION_BANK', () => {
  const knownIds = new Set(QUESTION_BANK.map((question) => question.id));
  const staleIds = Object.keys(QUESTION_BANK_EN).filter((id) => !knownIds.has(id));
  assert.deepEqual(staleIds, []);
});

test('QUESTION_BANK_EN: setiap pertanyaan tipe trade-off (T) punya leftLabel & rightLabel Inggris', () => {
  const missingLabels = QUESTION_BANK.filter((question) => question.type === 'T')
    .filter((question) => {
      const localized = QUESTION_BANK_EN[question.id];
      return !localized?.leftLabel || !localized?.rightLabel;
    })
    .map((question) => question.id);
  assert.deepEqual(missingLabels, []);
});

test('QUESTION_BANK_EN: setiap entri punya text non-kosong', () => {
  const blankText = Object.entries(QUESTION_BANK_EN)
    .filter(([, localized]) => !localized.text || localized.text.trim() === '')
    .map(([id]) => id);
  assert.deepEqual(blankText, []);
});

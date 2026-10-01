export type JerseyNumberParseResult = { isValid: true; value: number | undefined } | { isValid: false };

/** Kosong = tidak diisi (valid, tanpa nomor). Selain itu hanya angka bulat 1-99; "007", "0", "150", "12abc", "3.5" ditolak. */
export function parseJerseyNumber(raw: string): JerseyNumberParseResult {
  const trimmed = raw.trim();
  if (trimmed === '') return { isValid: true, value: undefined };
  if (!/^\d{1,2}$/.test(trimmed) || trimmed.length > 1 && trimmed.startsWith('0')) return { isValid: false };
  const value = Number(trimmed);
  return value >= 1 && value <= 99 ? { isValid: true, value } : { isValid: false };
}

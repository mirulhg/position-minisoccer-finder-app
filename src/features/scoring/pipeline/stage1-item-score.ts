/**
 * Tahap 1 — Skor Item Mentah. Setiap fungsi mengembalikan nilai 0-100.
 * Rumus persis dari PRD bagian "Spesifikasi Algoritma Scoring".
 */

export function convertLikert(answer: 1 | 2 | 3 | 4 | 5, reversed = false): number {
  const value = (answer - 1) * 25;
  return reversed ? 100 - value : value;
}

export function convertFrequency(n: number, saturationK: number, reversed = false): number {
  const value = 100 * (n / (n + saturationK));
  return reversed ? 100 - value : value;
}

export type TradeOffChoice = 'left' | 'right' | 'situational';

/**
 * Nilai untuk atribut yang ditempatkan pada satu sisi (`left`/`right`) dari
 * pertanyaan trade-off. "Tergantung situasi" diperhalus jadi 75/25 (PRD
 * Tahap 1) — 75 untuk sisi kiri, 25 untuk sisi kanan, konsisten di semua
 * pertanyaan trade-off.
 */
export function convertTradeOff(choice: TradeOffChoice, side: 'left' | 'right'): number {
  if (choice === 'situational') return side === 'left' ? 75 : 25;
  if (choice === side) return 100;
  return 0;
}

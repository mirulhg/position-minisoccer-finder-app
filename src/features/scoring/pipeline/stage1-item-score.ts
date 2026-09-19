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
 * pertanyaan trade-off. PRD (bagian "Spesifikasi Algoritma Scoring", Tahap
 * 1) menyebut "Tergantung situasi" diperhalus jadi 75/25, tapi tidak pernah
 * menentukan sisi mana yang dapat 75 — implementasi sebelumnya memberi 75
 * ke sisi kiri secara tidak sengaja (murni urutan parameter di kode, bukan
 * pilihan pemain), sehingga selalu menguntungkan atribut yang kebetulan
 * ditulis di sisi kiri. Diubah ke 50/50 (keputusan Amirul, 19 September
 * 2026) sebagai realisasi paling jujur dari "netral" — kedua sisi dapat
 * nilai yang sama persis, tidak ada bias arah. Penyimpangan dari angka
 * literal PRD didokumentasikan di sini, PRD sendiri tidak diubah.
 */
export function convertTradeOff(choice: TradeOffChoice, side: 'left' | 'right'): number {
  if (choice === 'situational') return 50;
  if (choice === side) return 100;
  return 0;
}

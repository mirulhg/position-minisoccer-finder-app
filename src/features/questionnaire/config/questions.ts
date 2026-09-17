import type { Question } from '../types';

/**
 * Lampiran A — Bank Pertanyaan Kuesioner. Q01-Q42 wajib, Q43-Q50 (Blok
 * Kiper) hanya ditampilkan jika pemain bersedia jadi kiper (FR-05).
 */
export const QUESTION_BANK: Question[] = [
  // Blok 1 — Fisik
  { id: 'Q01', type: 'L', block: 1, text: 'Saat adu lari 20 meter memperebutkan bola, seberapa sering Anda menang?', contributions: [{ attribute: 'PAC', weight: 1.0 }] },
  { id: 'Q02', type: 'L', block: 1, text: 'Dalam lima meter pertama dari berhenti, Anda lebih cepat dari kebanyakan lawan.', contributions: [{ attribute: 'ACC', weight: 1.0 }, { attribute: 'AGI', weight: 0.5 }] },
  { id: 'Q03', type: 'L', block: 1, text: 'Di 10 menit terakhir pertandingan, intensitas lari Anda tetap tinggi.', contributions: [{ attribute: 'STA', weight: 1.0 }] },
  { id: 'Q04', type: 'F', block: 1, text: 'Berapa kali dalam satu pertandingan Anda merasa harus berjalan karena kehabisan napas?', contributions: [{ attribute: 'STA', weight: 1.0, reversed: true }] },
  { id: 'Q05', type: 'T', block: 1, text: 'Saat berbenturan badan dengan lawan, Anda biasanya...', leftLabel: 'Bertahan tegak', rightLabel: 'Terdorong', left: [{ attribute: 'STR', weight: 1.0 }], right: [] },
  { id: 'Q06', type: 'L', block: 1, text: 'Saat harus berbalik arah mendadak, Anda gerakannya cepat dan seimbang.', contributions: [{ attribute: 'AGI', weight: 1.0 }] },
  { id: 'Q07', type: 'F', block: 1, text: 'Dalam duel bola atas, berapa kali per pertandingan Anda menang?', contributions: [{ attribute: 'AER', weight: 1.0 }, { attribute: 'JMP', weight: 0.5 }] },
  { id: 'Q08', type: 'L', block: 1, text: 'Anda merasa lompatan Anda tinggi dibanding pemain seukuran Anda.', contributions: [{ attribute: 'JMP', weight: 1.0 }] },
  { id: 'Q09', type: 'L', block: 1, text: 'Setelah menyerang, seberapa cepat Anda kembali ke posisi bertahan?', contributions: [{ attribute: 'WRK', weight: 1.0 }, { attribute: 'STA', weight: 0.5 }] },

  // Blok 2 — Menyerang
  { id: 'Q10', type: 'F', block: 2, text: 'Berapa gol rata-rata Anda cetak per pertandingan?', contributions: [{ attribute: 'FIN', weight: 1.0 }] },
  { id: 'Q11', type: 'L', block: 2, text: 'Saat berhadapan satu lawan satu dengan kiper, Anda biasanya tenang dan menyelesaikan.', contributions: [{ attribute: 'FIN', weight: 1.0 }, { attribute: 'CMP', weight: 0.5 }] },
  { id: 'Q12', type: 'F', block: 2, text: 'Berapa kali per pertandingan Anda melewati lawan dengan dribel?', contributions: [{ attribute: 'DRB', weight: 1.0 }] },
  { id: 'Q13', type: 'T', block: 2, text: 'Saat bola di kaki di ruang sempit, Anda lebih memilih...', leftLabel: 'Menggiring keluar', rightLabel: 'Mengoper cepat', left: [{ attribute: 'DRB', weight: 1.0 }], right: [{ attribute: 'PSS', weight: 1.0 }] },
  { id: 'Q14', type: 'L', block: 2, text: 'Anda sering menemukan diri berada di ruang kosong tanpa dijaga.', contributions: [{ attribute: 'OPS', weight: 1.0 }] },
  { id: 'Q15', type: 'F', block: 2, text: 'Berapa assist rata-rata Anda per pertandingan?', contributions: [{ attribute: 'VIS', weight: 1.0 }, { attribute: 'LPS', weight: 0.5 }] },
  { id: 'Q16', type: 'L', block: 2, text: 'Anda sering melihat umpan yang tidak dilihat rekan lain.', contributions: [{ attribute: 'VIS', weight: 1.0 }] },
  { id: 'Q17', type: 'L', block: 2, text: 'Dari luar kotak penalti, tembakan Anda cukup mengancam.', contributions: [{ attribute: 'LSH', weight: 1.0 }] },
  { id: 'Q18', type: 'T', block: 2, text: 'Saat berada di sayap dengan ruang, Anda lebih memilih...', leftLabel: 'Umpan silang', rightLabel: 'Memotong ke dalam', left: [{ attribute: 'CRS', weight: 1.0 }], right: [{ attribute: 'LSH', weight: 0.5 }] },
  { id: 'Q19', type: 'L', block: 2, text: 'Dengan kaki non-dominan, Anda cukup nyaman mengontrol dan mengoper.', contributions: [{ attribute: 'WFT', weight: 1.0 }] },

  // Blok 3 — Bertahan
  { id: 'Q20', type: 'F', block: 3, text: 'Berapa kali per pertandingan Anda merebut bola dengan tekel bersih?', contributions: [{ attribute: 'TKL', weight: 1.0 }] },
  { id: 'Q21', type: 'T', block: 3, text: 'Saat lawan membawa bola ke arah Anda, Anda cenderung...', leftLabel: 'Menjemput lebih dulu', rightLabel: 'Menunggu dan menahan', left: [{ attribute: 'AGG', weight: 1.0 }], right: [{ attribute: 'DPS', weight: 1.0 }] },
  { id: 'Q22', type: 'L', block: 3, text: 'Anda sering memotong umpan sebelum sampai ke tujuan.', contributions: [{ attribute: 'ANT', weight: 1.0 }, { attribute: 'TKL', weight: 0.5 }] },
  { id: 'Q23', type: 'L', block: 3, text: 'Saat tim kehilangan bola, Anda tahu persis harus berdiri di mana.', contributions: [{ attribute: 'DPS', weight: 1.0 }] },
  { id: 'Q24', type: 'L', block: 3, text: 'Seberapa sering Anda menekan pemegang bola lawan segera setelah kehilangan bola?', contributions: [{ attribute: 'PRS', weight: 1.0 }] },
  { id: 'Q25', type: 'F', block: 3, text: 'Berapa pelanggaran rata-rata yang Anda lakukan per pertandingan?', contributions: [{ attribute: 'AGG', weight: 1.0 }] },
  { id: 'Q26', type: 'L', block: 3, text: 'Anda bisa membaca ke mana serangan lawan akan mengarah.', contributions: [{ attribute: 'ANT', weight: 1.0 }] },
  { id: 'Q27', type: 'T', block: 3, text: 'Saat tim unggul dan harus bertahan, Anda merasa...', leftLabel: 'Nyaman', rightLabel: 'Gelisah, ingin maju', left: [{ attribute: 'DPS', weight: 1.0 }], right: [{ attribute: 'OPS', weight: 0.5 }] },
  { id: 'Q28', type: 'L', block: 3, text: 'Anda mengejar lawan yang lolos meskipun peluang mengejarnya kecil.', contributions: [{ attribute: 'WRK', weight: 1.0 }, { attribute: 'AGG', weight: 0.5 }] },

  // Blok 4 — Teknik
  { id: 'Q29', type: 'L', block: 4, text: 'Saat menerima umpan keras dalam tekanan, sentuhan pertama Anda tetap terkendali.', contributions: [{ attribute: 'FTC', weight: 1.0 }] },
  { id: 'Q30', type: 'F', block: 4, text: 'Berapa kali per pertandingan Anda kehilangan bola karena kontrol buruk?', contributions: [{ attribute: 'FTC', weight: 1.0, reversed: true }] },
  { id: 'Q31', type: 'L', block: 4, text: 'Umpan pendek Anda sampai ke rekan dengan akurat.', contributions: [{ attribute: 'PSS', weight: 1.0 }] },
  { id: 'Q32', type: 'L', block: 4, text: 'Anda mampu memindahkan permainan dengan umpan panjang yang akurat.', contributions: [{ attribute: 'LPS', weight: 1.0 }] },
  { id: 'Q33', type: 'T', block: 4, text: 'Saat punya dua pilihan umpan, Anda memutuskan...', leftLabel: 'Cepat dan sederhana', rightLabel: 'Menunggu opsi terbaik', left: [{ attribute: 'PSS', weight: 0.5 }], right: [{ attribute: 'VIS', weight: 1.0 }] },
  { id: 'Q34', type: 'L', block: 4, text: 'Saat membawa bola sambil dikejar, Anda tetap tenang dan terkendali.', contributions: [{ attribute: 'FTC', weight: 0.5 }, { attribute: 'CMP', weight: 1.0 }] },
  { id: 'Q35', type: 'L', block: 4, text: 'Anda nyaman menerima bola membelakangi gawang dengan bek menempel.', contributions: [{ attribute: 'STR', weight: 0.5 }, { attribute: 'FTC', weight: 1.0 }] },

  // Blok 5 — Mental & Konsistensi
  { id: 'Q36', type: 'L', block: 5, text: 'Saat tim tertinggal di menit akhir, permainan Anda tetap tenang.', contributions: [{ attribute: 'CMP', weight: 1.0 }] },
  { id: 'Q37', type: 'L', block: 5, text: 'Anda sering mengarahkan posisi rekan setim dengan suara.', contributions: [{ attribute: 'LDR', weight: 1.0 }] },
  { id: 'Q38', type: 'L', block: 5, text: 'Setelah melakukan kesalahan fatal, Anda cepat bangkit dan fokus lagi.', contributions: [{ attribute: 'CMP', weight: 1.0 }] },
  { id: 'Q39', type: 'L', block: 5, text: 'Anda berani masuk ke duel 50-50 meskipun berisiko cedera.', contributions: [{ attribute: 'AGG', weight: 1.0 }] },
  { id: 'Q40', type: 'C', block: 5, text: 'Anda masih bisa berlari kencang di menit-menit akhir.', pairId: 'Q03', attribute: 'STA' },
  { id: 'Q41', type: 'C', block: 5, text: 'Menggiring melewati lawan adalah kekuatan Anda.', pairId: 'Q12', attribute: 'DRB' },
  { id: 'Q42', type: 'C', block: 5, text: 'Anda kadang bingung harus menjaga siapa saat bertahan.', pairId: 'Q23', attribute: 'DPS', reversed: true },

  // Blok Kiper — opsional
  { id: 'Q43', type: 'L', block: 6, text: 'Pada tembakan jarak dekat mendadak, reaksi Anda cepat.', contributions: [{ attribute: 'GK-REF', weight: 1.0 }] },
  { id: 'Q44', type: 'L', block: 6, text: 'Anda tahu di mana harus berdiri untuk mempersempit sudut tembak.', contributions: [{ attribute: 'GK-POS', weight: 1.0 }] },
  { id: 'Q45', type: 'F', block: 6, text: 'Berapa kali per pertandingan Anda keluar kotak menyapu bola?', contributions: [{ attribute: 'GK-SWP', weight: 1.0 }] },
  { id: 'Q46', type: 'T', block: 6, text: 'Saat bola dioper mundur ke Anda, Anda...', leftLabel: 'Menyapu jauh', rightLabel: 'Membangun serangan dengan umpan', left: [], right: [{ attribute: 'GK-DIS', weight: 1.0 }] },
  { id: 'Q47', type: 'L', block: 6, text: 'Anda memerintah barisan pertahanan dengan suara.', contributions: [{ attribute: 'GK-CMD', weight: 1.0 }, { attribute: 'LDR', weight: 0.5 }] },
  { id: 'Q48', type: 'L', block: 6, text: 'Pada umpan silang tinggi ke kotak, Anda berani keluar menghalau.', contributions: [{ attribute: 'GK-CMD', weight: 1.0 }, { attribute: 'JMP', weight: 0.5 }] },
  { id: 'Q49', type: 'L', block: 6, text: 'Lemparan dan umpan kaki Anda memulai serangan balik dengan baik.', contributions: [{ attribute: 'GK-DIS', weight: 1.0 }] },
  { id: 'Q50', type: 'L', block: 6, text: 'Anda nyaman bermain jauh di depan garis gawang.', contributions: [{ attribute: 'GK-SWP', weight: 1.0 }] },
];

export const CONSISTENCY_CHECK_QUESTION_IDS = ['Q40', 'Q41', 'Q42'] as const;

export function getQuestionsExcludingKeeperBlock(): Question[] {
  return QUESTION_BANK.filter((q) => q.block !== 6);
}

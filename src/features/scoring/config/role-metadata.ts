import type { PositionCode, RoleCode } from '../types';

export interface RoleMetadata {
  name: string;
  position: PositionCode;
  /** Perilaku khas di lapangan, bahasa awam — Taksonomi Posisi & Role di PRD. */
  description: string;
}

export const ROLE_METADATA: Record<RoleCode, RoleMetadata> = {
  'GK-SS': { name: 'Shot Stopper', position: 'GK', description: 'Bertahan di garis, mengandalkan refleks dan penempatan, jarang keluar kotak.' },
  'GK-SK': { name: 'Sweeper Keeper', position: 'GK', description: 'Berani keluar jauh menyapu bola, ikut membangun serangan dengan kaki.' },
  'CB-ST': { name: 'Stopper', position: 'CB', description: 'Menjemput lawan lebih dulu, agresif duel badan dan udara, main sederhana.' },
  'CB-BP': { name: 'Ball-Playing Defender', position: 'CB', description: 'Tenang membawa bola keluar dari belakang, umpan menembus lini.' },
  'CB-CV': { name: 'Cover Defender', position: 'CB', description: 'Menjaga kedalaman, membaca umpan terobosan, mengandalkan kecepatan pulih.' },
  'FB-DF': { name: 'Defensive Fullback', position: 'FB', description: 'Jarang naik, fokus menutup sayap dan menahan winger lawan.' },
  'FB-WB': { name: 'Attacking Wingback', position: 'FB', description: 'Naik-turun sepanjang sayap, memberi lebar dan umpan silang.' },
  'FB-IV': { name: 'Inverted Fullback', position: 'FB', description: 'Masuk ke dalam saat menyerang, menambah pemain di tengah.' },
  'DM-AN': { name: 'Anchor', position: 'DM', description: 'Berdiri di depan bek, memutus serangan, memberi umpan pendek aman.' },
  'DM-RG': { name: 'Deep-Lying Playmaker', position: 'DM', description: 'Mengatur tempo dari dalam, umpan jauh mengubah arah serangan.' },
  'CM-B2B': { name: 'Box-to-Box', position: 'CM', description: 'Berlari dari kotak ke kotak, terlibat bertahan dan menyerang, stamina tinggi.' },
  'CM-AP': { name: 'Advanced Playmaker', position: 'CM', description: 'Beroperasi di antara lini lawan, mencari celah dan umpan kunci.' },
  'WM-TW': { name: 'Touchline Winger', position: 'WM', description: 'Menempel garis, melewati lawan satu lawan satu, umpan silang.' },
  'WM-IW': { name: 'Inverted Winger', position: 'WM', description: 'Memotong ke dalam dari sayap ke kaki kuat, menembak dari sudut sempit.' },
  'ST-PO': { name: 'Poacher', position: 'ST', description: 'Menunggu di kotak penalti, gerakan pendek, penyelesaian cepat satu-dua sentuhan.' },
  'ST-TM': { name: 'Target Man', position: 'ST', description: 'Menahan bola membelakangi gawang, memenangkan duel, menjadi titik tumpu.' },
  'ST-PF': { name: 'Pressing Forward', position: 'ST', description: 'Menekan bek lawan tanpa henti, memaksa kesalahan, gerakan tanpa bola intens.' },
};

export const POSITION_NAMES: Record<PositionCode, string> = {
  GK: 'Kiper',
  CB: 'Bek Tengah',
  FB: 'Bek Sayap',
  DM: 'Gelandang Bertahan',
  CM: 'Gelandang Tengah',
  WM: 'Gelandang Sayap',
  ST: 'Penyerang',
};

export const ALL_ROLE_CODES = Object.keys(ROLE_METADATA) as RoleCode[];

/**
 * Kelangkaan posisi di populasi amatir untuk tie-breaker langkah ketiga
 * (PRD: "kiper dan bek tengah lebih langka, diberi prioritas ringan").
 * Skala ordinal sederhana, bukan hasil kalibrasi statistik.
 */
export const POSITION_RARITY: Record<PositionCode, number> = {
  GK: 2,
  CB: 2,
  FB: 1,
  DM: 1,
  CM: 0,
  WM: 0,
  ST: 0,
};

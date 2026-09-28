import type { PositionCode, RoleCode } from '../types';

export interface RoleMetadata {
  name: string;
  position: PositionCode;
  /** Perilaku khas di lapangan, bahasa awam — Taksonomi Posisi & Role di PRD. */
  description: string;
  /**
   * "Contoh Pemain Pro" — deskripsi gaya main archetypal, BUKAN nama pemain
   * profesional sungguhan dan bukan foto/logo (risiko hak cipta/hak citra,
   * sudah ditolak PRD). Pola sama seperti `description`: generik, tidak
   * menyebut nama siapa pun — mis. "Bek yang menjemput lawan jauh dari
   * gawang".
   */
  proExample: string;
}

export const ROLE_METADATA: Record<RoleCode, RoleMetadata> = {
  'GK-SS': {
    name: 'Shot Stopper',
    position: 'GK',
    description: 'Bertahan di garis, mengandalkan refleks dan penempatan, jarang keluar kotak.',
    proExample: 'Kiper yang lebih sering dipuji karena penyelamatan reflek satu lawan satu daripada penguasaan area.',
  },
  'GK-SK': {
    name: 'Sweeper Keeper',
    position: 'GK',
    description: 'Berani keluar jauh menyapu bola, ikut membangun serangan dengan kaki.',
    proExample: 'Kiper yang berdiri jauh di luar kotak penalti untuk menyapu bola di belakang lini pertahanan.',
  },
  'CB-ST': {
    name: 'Stopper',
    position: 'CB',
    description: 'Menjemput lawan lebih dulu, agresif duel badan dan udara, main sederhana.',
    proExample: 'Bek yang menjemput lawan jauh dari gawang, menang duel udara, main sederhana tanpa ambil risiko.',
  },
  'CB-BP': {
    name: 'Ball-Playing Defender',
    position: 'CB',
    description: 'Tenang membawa bola keluar dari belakang, umpan menembus lini.',
    proExample: 'Bek yang tenang menguasai bola di bawah tekanan dan memulai serangan lewat umpan menembus lini tengah.',
  },
  'CB-CV': {
    name: 'Cover Defender',
    position: 'CB',
    description: 'Menjaga kedalaman, membaca umpan terobosan, mengandalkan kecepatan pulih.',
    proExample: 'Bek cepat yang menutup ruang di belakang rekannya dan memotong umpan terobosan sebelum jadi peluang.',
  },
  'FB-DF': {
    name: 'Defensive Fullback',
    position: 'FB',
    description: 'Jarang naik, fokus menutup sayap dan menahan winger lawan.',
    proExample: 'Bek sayap yang jarang ikut menyerang, fokus penuh menutup ruang dan menahan winger lawan satu lawan satu.',
  },
  'FB-WB': {
    name: 'Attacking Wingback',
    position: 'FB',
    description: 'Naik-turun sepanjang sayap, memberi lebar dan umpan silang.',
    proExample: 'Bek sayap dengan stamina besar, naik-turun sepanjang laga untuk memberi lebar dan umpan silang.',
  },
  'FB-IV': {
    name: 'Inverted Fullback',
    position: 'FB',
    description: 'Masuk ke dalam saat menyerang, menambah pemain di tengah.',
    proExample: 'Bek sayap yang bergeser masuk ke tengah saat timnya menguasai bola, menambah opsi umpan di lini tengah.',
  },
  'DM-AN': {
    name: 'Anchor',
    position: 'DM',
    description: 'Berdiri di depan bek, memutus serangan, memberi umpan pendek aman.',
    proExample: 'Gelandang bertahan yang jarang naik, berdiri tetap di depan lini belakang untuk memutus serangan lawan.',
  },
  'DM-RG': {
    name: 'Deep-Lying Playmaker',
    position: 'DM',
    description: 'Mengatur tempo dari dalam, umpan jauh mengubah arah serangan.',
    proExample: 'Gelandang yang mengatur tempo permainan dari area dalam, umpan jauhnya mengubah arah serangan tim.',
  },
  'CM-B2B': {
    name: 'Box-to-Box',
    position: 'CM',
    description: 'Berlari dari kotak ke kotak, terlibat bertahan dan menyerang, stamina tinggi.',
    proExample: 'Gelandang stamina tinggi yang berlari dari kotak penalti sendiri ke kotak penalti lawan sepanjang laga.',
  },
  'CM-AP': {
    name: 'Advanced Playmaker',
    position: 'CM',
    description: 'Beroperasi di antara lini lawan, mencari celah dan umpan kunci.',
    proExample: 'Gelandang kreatif yang beroperasi di celah antar lini lawan, mencari ruang untuk umpan kunci.',
  },
  'WM-TW': {
    name: 'Touchline Winger',
    position: 'WM',
    description: 'Menempel garis, melewati lawan satu lawan satu, umpan silang.',
    proExample: 'Winger yang menempel garis sisi lapangan, melewati bek lawan satu lawan satu lalu mengirim umpan silang.',
  },
  'WM-IW': {
    name: 'Inverted Winger',
    position: 'WM',
    description: 'Memotong ke dalam dari sayap ke kaki kuat, menembak dari sudut sempit.',
    proExample: 'Winger berkaki berlawanan yang memotong ke dalam dari sayap untuk menembak dengan kaki kuatnya.',
  },
  'ST-PO': {
    name: 'Poacher',
    position: 'ST',
    description: 'Menunggu di kotak penalti, gerakan pendek, penyelesaian cepat satu-dua sentuhan.',
    proExample: 'Penyerang yang jarang jauh dari kotak penalti, mengandalkan naluri posisi dan penyelesaian satu sentuhan.',
  },
  'ST-TM': {
    name: 'Target Man',
    position: 'ST',
    description: 'Menahan bola membelakangi gawang, memenangkan duel, menjadi titik tumpu.',
    proExample: 'Penyerang bertubuh besar yang menahan bola membelakangi gawang dan jadi titik tumpu serangan tim.',
  },
  'ST-PF': {
    name: 'Pressing Forward',
    position: 'ST',
    description: 'Menekan bek lawan tanpa henti, memaksa kesalahan, gerakan tanpa bola intens.',
    proExample: 'Penyerang yang menekan bek lawan tanpa henti sejak bola hilang, memaksa kesalahan di area berbahaya.',
  },
};

/**
 * Versi Inggris `description` & `proExample` dari `ROLE_METADATA`, dipakai
 * lewat `useLocalizedRoleMetadata` (src/i18n) — dictionary paralel mengikuti
 * pola `POSITION_NAMES`/`POSITION_ENGLISH_NAMES` di bawah, bukan field
 * tambahan di `ROLE_METADATA` itu sendiri supaya bentuk `ROLE_METADATA`
 * (dipakai file lain seperti profile-card-canvas.ts) tidak berubah.
 */
export const ROLE_METADATA_EN: Record<RoleCode, { description: string; proExample: string }> = {
  'GK-SS': {
    description: 'Stays on the line, relies on reflexes and positioning, rarely leaves the box.',
    proExample: 'A keeper praised more for reflex one-on-one saves than for commanding the area.',
  },
  'GK-SK': {
    description: 'Confidently sweeps up behind the defense and helps build attacks with the ball at feet.',
    proExample: 'A keeper who stands well outside the penalty box to sweep up balls behind the defensive line.',
  },
  'CB-ST': {
    description: 'Steps up to meet attackers first, aggressive in ground and aerial duels, keeps it simple.',
    proExample: 'A defender who meets attackers far from goal, wins aerial duels, and plays simple without taking risks.',
  },
  'CB-BP': {
    description: 'Calmly carries the ball out from the back, passes that break through the lines.',
    proExample: 'A defender who stays composed on the ball under pressure and starts attacks with line-breaking passes.',
  },
  'CB-CV': {
    description: 'Holds depth, reads through balls, relies on recovery speed.',
    proExample: 'A quick defender who covers the space behind teammates and cuts out through balls before they become chances.',
  },
  'FB-DF': {
    description: 'Rarely joins the attack, focused on shutting down the flank and containing the opposing winger.',
    proExample: 'A fullback who rarely attacks, fully focused on closing space and containing the opposing winger one-on-one.',
  },
  'FB-WB': {
    description: 'Bombs up and down the flank, provides width and crosses.',
    proExample: 'A high-stamina fullback who runs up and down all match to provide width and deliver crosses.',
  },
  'FB-IV': {
    description: 'Tucks inside during attacks, adding an extra body in midfield.',
    proExample: 'A fullback who drifts inside when his team has the ball, adding a passing option in midfield.',
  },
  'DM-AN': {
    description: 'Sits in front of the back line, breaks up attacks, plays safe short passes.',
    proExample: 'A defensive midfielder who rarely advances, staying put in front of the back line to break up attacks.',
  },
  'DM-RG': {
    description: 'Dictates tempo from deep, long passes that switch the point of attack.',
    proExample: 'A midfielder who controls the tempo from deep areas, whose long passes switch the direction of attack.',
  },
  'CM-B2B': {
    description: 'Runs box to box, involved in both defense and attack, high stamina.',
    proExample: 'A high-stamina midfielder who runs from his own box to the opposition box throughout the match.',
  },
  'CM-AP': {
    description: 'Operates between the opposition lines, looking for pockets of space and key passes.',
    proExample: 'A creative midfielder who operates in the gaps between opposition lines, hunting space for key passes.',
  },
  'WM-TW': {
    description: 'Hugs the touchline, beats defenders one-on-one, delivers crosses.',
    proExample: 'A winger who hugs the touchline, beats fullbacks one-on-one, and whips in crosses.',
  },
  'WM-IW': {
    description: 'Cuts inside from the wing onto his strong foot, shoots from tight angles.',
    proExample: 'An opposite-footed winger who cuts inside from the flank to shoot with his strong foot.',
  },
  'ST-PO': {
    description: 'Lurks in the penalty box, short movements, quick one- or two-touch finishing.',
    proExample: 'A forward who rarely strays far from the penalty box, relying on instinctive positioning and one-touch finishing.',
  },
  'ST-TM': {
    description: 'Holds the ball up with his back to goal, wins duels, becomes the focal point.',
    proExample: 'A big forward who holds the ball up with his back to goal and becomes the focal point of the attack.',
  },
  'ST-PF': {
    description: 'Presses defenders relentlessly, forces mistakes, constant movement off the ball.',
    proExample: 'A forward who presses defenders relentlessly the moment the ball is lost, forcing mistakes in dangerous areas.',
  },
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

/** Istilah Inggris posisi — ditampilkan berdampingan dengan `POSITION_NAMES` di `PositionBadge`. */
export const POSITION_ENGLISH_NAMES: Record<PositionCode, string> = {
  GK: 'Goalkeeper',
  CB: 'Center Back',
  FB: 'Fullback',
  DM: 'Defensive Midfielder',
  CM: 'Central Midfielder',
  WM: 'Winger',
  ST: 'Striker',
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

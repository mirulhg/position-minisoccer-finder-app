import type { Dictionary } from '../types';

export const id: Dictionary = {
  common: {
    back: 'Kembali',
    next: 'Lanjut',
    restart: {
      trigger: 'Mulai ulang dari awal',
      confirmMessage:
        'Yakin? Jawaban lokal akan dihapus. Ini hanya menghapus data kuesioner di perangkat ini — kalau kamu sudah menyimpan hasil ke akun, data di akunmu tidak ikut terhapus.',
      cancel: 'Batal',
      confirm: 'Ya, hapus',
      confirming: 'Menghapus…',
    },
  },
  questionnaire: {
    likertLabels: ['Hampir tidak pernah', 'Jarang', 'Kadang-kadang', 'Sering', 'Hampir selalu'],
    frequencyLabel: 'Berapa kali per pertandingan?',
    tradeOffSituational: 'Tergantung situasi',
    loading: 'Memuat kuesioner…',
    progressLabel: 'Progres kuesioner',
    nextBlockLabel: 'Blok berikutnya',
  },
  results: {
    mainPosition: {
      label: 'Posisi utamamu',
    },
    alternativePosition: {
      label: 'Posisi alternatifmu',
    },
    confidence: {
      prefix: 'Confidence: ',
      early: 'Awal',
      moderate: 'Cukup',
      solid: 'Solid',
    },
    roleTabs: {
      main: 'Posisi Utama',
      alternative: 'Posisi Alternatif',
      empty: 'Belum ada role kandidat untuk posisi ini.',
      loading: 'Memuat role…',
    },
    roleCard: {
      showDetail: 'Ketuk untuk detail',
      hideDetail: 'Sembunyikan detail',
      playStyleLike: 'Gaya main mirip:',
    },
    allRoles: {
      toggle: 'Lihat semua role',
      gateNotMet: 'Syarat belum terpenuhi',
    },
    whyBlock: {
      title: 'Kenapa rekomendasi ini?',
      showDetail: 'Ketuk untuk detail',
      hideDetail: 'Sembunyikan detail',
      strengths: 'Kekuatan utama',
      watchFor: 'Perlu diperhatikan',
    },
    pillarRadar: {
      ariaLabel: 'Radar lima pilar atribut',
    },
    pillarBreakdown: {
      title: 'Rincian pilar',
    },
    resultActions: {
      preparingCard: 'Menyiapkan kartu…',
      shareCard: 'Bagikan kartu profil',
      shareCardError: 'Gagal membagikan kartu profil.',
      logMatch: 'Catat pertandingan',
      logMatchDisabledLabel: 'Catat pertandingan — simpan hasil dulu',
      logMatchDisabledTitle: 'Simpan hasil dulu untuk mencatat pertandingan',
    },
    positionChangeBanner: {
      messageBefore: 'Posisi utamamu berubah jadi ',
      messageAfter: ' setelah pertandingan terbaru.',
      acknowledge: 'Mengerti',
    },
    saveResult: {
      savedTitle: 'Tersimpan ke akunmu',
      savedDescription: 'Riwayat akan bertambah setelah kamu mengulang tes atau mencatat pertandingan.',
      viewHistory: 'Lihat riwayat',
      saving: 'Menyimpan hasil ke akunmu…',
      checkHistoryError: (message) => `Gagal memeriksa riwayat profil: ${message}`,
      defaultSaveError: 'Gagal menyimpan hasil.',
      confirmPrefix: 'Simpan ke akunmu? Kamu sedang masuk sebagai',
      confirmFallbackAccount: 'akun ini',
      notMe: 'Bukan saya',
      confirmSave: 'Ya, simpan ke akun ini',
      emailSent: 'Cek email kamu — tautan masuk sudah dikirim.',
      saveDisabledLabel: 'Simpan hasil ini',
      saveComingSoon: 'Segera hadir — fitur akun sedang disempurnakan keamanannya.',
      saveCta: 'Simpan hasil ini',
    },
    profileCard: {
      mainPositionLabel: 'Posisi utama',
      alternativePositionLabel: 'Posisi alternatif',
      alternativeRolesSectionLabel: 'Role terbaik — Posisi Alternatif',
      topAttributesSectionLabel: 'Kekuatan utama',
      defaultDisplayName: 'Pemain Minisoccer',
      shareForm: {
        title: 'Personalisasi kartu',
        subtitle: 'Boleh dikosongkan — kartu tetap bisa dibagikan.',
        nameLabel: 'Nama',
        namePlaceholder: 'mis. Rizky',
        jerseyNumberLabel: 'Nomor punggung favorit',
        jerseyNumberHint: 'Angka 1-99',
        jerseyNumberInvalid: 'Isi angka bulat 1 sampai 99, atau kosongkan.',
        skip: 'Lewati',
        share: 'Bagikan',
      },
    },
  },
};

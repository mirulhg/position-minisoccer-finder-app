export type Language = 'id' | 'en';

/**
 * Kontrak bentuk data terjemahan UI, nested per screen/komponen. `id.ts` dan
 * `en.ts` sama-sama harus mengimplementasikan tipe ini persis (bukan
 * `Partial<Dictionary>` atau `Record<string, string>`) — itu yang membuat
 * TypeScript gagal compile kalau salah satu bahasa kehilangan satu key.
 */
export interface Dictionary {
  /** Teks generik dipakai berulang lintas fitur (kuesioner, layar Hasil, dan berpotensi layar lain nanti) — bukan spesifik satu screen/komponen. */
  common: {
    back: string;
    next: string;
    restart: {
      /** Tombol pemicu ("Mulai ulang dari awal") — dipakai di RestartButton, muncul di kuesioner maupun Layar Hasil. */
      trigger: string;
      confirmMessage: string;
      cancel: string;
      confirm: string;
      confirming: string;
    };
  };
  questionnaire: {
    /** 5 label skala Likert, urutan tetap index 0-4 = nilai 1-5. */
    likertLabels: readonly [string, string, string, string, string];
    /** Label NumberStepper untuk pertanyaan tipe frequency ('F'). */
    frequencyLabel: string;
    /** Opsi tengah pertanyaan trade-off ('T'). */
    tradeOffSituational: string;
    loading: string;
    /** aria-label ProgressBar. */
    progressLabel: string;
    /** Label di atas nama blok pada BlockTransition. */
    nextBlockLabel: string;
  };
  results: {
    mainPosition: {
      /** "Posisi utamamu" di atas nama posisi utama (MainPositionHeader). */
      label: string;
    };
    alternativePosition: {
      /** "Posisi alternatifmu" di atas nama posisi alternatif (AlternativePosition). */
      label: string;
    };
    confidence: {
      /** Prefix sebelum label confidence, mis. "Confidence: ". */
      prefix: string;
      early: string;
      moderate: string;
      solid: string;
    };
    roleTabs: {
      main: string;
      alternative: string;
      /** RoleCardGrid saat daftar role kosong. */
      empty: string;
      /** Teks sr-only saat RoleCardSkeleton tampil (Suspense fallback). */
      loading: string;
    };
    roleCard: {
      showDetail: string;
      hideDetail: string;
      /** Label sebelum `proExample`, mis. "Gaya main mirip:". */
      playStyleLike: string;
    };
    allRoles: {
      /** Tombol toggle daftar semua role. */
      toggle: string;
      /** Badge role yang gate-nya belum terpenuhi. */
      gateNotMet: string;
    };
    whyBlock: {
      title: string;
      showDetail: string;
      hideDetail: string;
      strengths: string;
      watchFor: string;
    };
    pillarRadar: {
      ariaLabel: string;
    };
    pillarBreakdown: {
      title: string;
    };
    resultActions: {
      preparingCard: string;
      shareCard: string;
      shareCardError: string;
      logMatch: string;
      logMatchDisabledLabel: string;
      logMatchDisabledTitle: string;
    };
    positionChangeBanner: {
      /** Bagian kalimat sebelum & sesudah nama posisi (dirender bold terpisah) — mis. "Posisi utamamu berubah jadi " + <b>nama</b> + " setelah pertandingan terbaru.". */
      messageBefore: string;
      messageAfter: string;
      acknowledge: string;
    };
    saveResult: {
      savedTitle: string;
      savedDescription: string;
      viewHistory: string;
      saving: string;
      checkHistoryError: (message: string) => string;
      defaultSaveError: string;
      confirmPrefix: string;
      confirmFallbackAccount: string;
      notMe: string;
      confirmSave: string;
      emailSent: string;
      saveDisabledLabel: string;
      saveComingSoon: string;
      saveCta: string;
    };
    /** Label yang digambar di dalam kartu profil PNG (Canvas, bukan HTML) — dikirim ke `drawProfileCard` lewat `ProfileCardStrings`. */
    profileCard: {
      mainPositionLabel: string;
      alternativePositionLabel: string;
      alternativeRolesSectionLabel: string;
      topAttributesSectionLabel: string;
      /** Fallback `displayName` kalau belum login — dipakai di ResultsScreen saat membangun `cardData`. */
      defaultDisplayName: string;
    };
  };
}

import type { Dictionary } from '../types';

export const en: Dictionary = {
  common: {
    back: 'Back',
    next: 'Next',
    restart: {
      trigger: 'Start over',
      confirmMessage:
        "Are you sure? Your local answers will be deleted. This only removes the questionnaire data on this device — if you've already saved your result to your account, your account data stays intact.",
      cancel: 'Cancel',
      confirm: 'Yes, delete',
      confirming: 'Deleting…',
    },
  },
  questionnaire: {
    likertLabels: ['Almost never', 'Rarely', 'Sometimes', 'Often', 'Almost always'],
    frequencyLabel: 'How many times per match?',
    tradeOffSituational: 'Depends on the situation',
    loading: 'Loading questionnaire…',
    progressLabel: 'Questionnaire progress',
    nextBlockLabel: 'Next block',
  },
  results: {
    mainPosition: {
      label: 'Your main position',
    },
    alternativePosition: {
      label: 'Your alternative position',
    },
    confidence: {
      prefix: 'Confidence: ',
      early: 'Early',
      moderate: 'Moderate',
      solid: 'Solid',
    },
    roleTabs: {
      main: 'Main Position',
      alternative: 'Alternative Position',
      empty: 'No candidate roles for this position yet.',
      loading: 'Loading roles…',
    },
    roleCard: {
      showDetail: 'Tap for detail',
      hideDetail: 'Hide detail',
      playStyleLike: 'Play style like:',
    },
    allRoles: {
      toggle: 'See all roles',
      gateNotMet: 'Requirements not met',
    },
    whyBlock: {
      title: 'Why this recommendation?',
      showDetail: 'Tap for detail',
      hideDetail: 'Hide detail',
      strengths: 'Top strengths',
      watchFor: 'Needs attention',
    },
    pillarRadar: {
      ariaLabel: 'Five-pillar attribute radar',
    },
    pillarBreakdown: {
      title: 'Pillar breakdown',
    },
    resultActions: {
      preparingCard: 'Preparing card…',
      shareCard: 'Share profile card',
      shareCardError: 'Failed to share the profile card.',
      logMatch: 'Log a match',
      logMatchDisabledLabel: 'Log a match — save your result first',
      logMatchDisabledTitle: 'Save your result first to log a match',
    },
    positionChangeBanner: {
      messageBefore: 'Your main position changed to ',
      messageAfter: ' after your latest match.',
      acknowledge: 'Got it',
    },
    saveResult: {
      savedTitle: 'Saved to your account',
      savedDescription: 'Your history grows every time you retake the test or log a match.',
      viewHistory: 'View history',
      saving: 'Saving your result to your account…',
      checkHistoryError: (message) => `Failed to check your profile history: ${message}`,
      defaultSaveError: 'Failed to save your result.',
      confirmPrefix: 'Save to your account? You are currently signed in as',
      confirmFallbackAccount: 'this account',
      notMe: "That's not me",
      confirmSave: 'Yes, save to this account',
      emailSent: 'Check your email — a sign-in link has been sent.',
      saveDisabledLabel: 'Save this result',
      saveComingSoon: 'Coming soon — account features are still being hardened.',
      saveCta: 'Save this result',
    },
    profileCard: {
      mainPositionLabel: 'Main Position',
      alternativePositionLabel: 'Alternative Position',
      alternativeRolesSectionLabel: 'Best Roles — Alternative Position',
      topAttributesSectionLabel: 'Top strengths',
      defaultDisplayName: 'Minisoccer Player',
      shareForm: {
        title: 'Personalize your card',
        subtitle: 'Optional — you can share the card without filling these in.',
        nameLabel: 'Name',
        namePlaceholder: 'e.g. Rizky',
        jerseyNumberLabel: 'Favorite jersey number',
        jerseyNumberHint: 'A number from 1 to 99',
        jerseyNumberInvalid: 'Enter a whole number from 1 to 99, or leave it empty.',
        skip: 'Skip',
        share: 'Share',
      },
    },
  },
};

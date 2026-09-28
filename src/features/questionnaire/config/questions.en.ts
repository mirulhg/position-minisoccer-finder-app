/**
 * Versi Inggris `text`/`leftLabel`/`rightLabel` dari `QUESTION_BANK` — dipakai
 * lewat `useLocalizedQuestion` (src/i18n), tidak menggantikan default
 * Indonesia. Data domain di-key oleh `id` pertanyaan (Q01-Q50), pola sama
 * seperti `ROLE_METADATA_EN`/`ATTRIBUTE_LABELS_EN`. Hanya field yang berubah
 * per bahasa yang dimasukkan di sini — `contributions`/`attribute`/`weight`/
 * dll tidak berubah per bahasa, jadi tetap dibaca dari `QUESTION_BANK`.
 */
export interface LocalizedQuestionText {
  text: string;
  leftLabel?: string;
  rightLabel?: string;
}

export const QUESTION_BANK_EN: Record<string, LocalizedQuestionText> = {
  // Block 1 — Physical
  Q01: { text: 'When racing 20 meters for the ball, how often do you win it?' },
  Q02: { text: "In the first five meters from a standing start, you're faster than most opponents." },
  Q03: { text: 'In the last 10 minutes of a match, your running intensity stays high.' },
  Q04: { text: "How many times in a match do you feel you have to walk because you're out of breath?" },
  Q05: { text: 'When you collide with an opponent, you usually...', leftLabel: 'Stay upright', rightLabel: 'Get knocked back' },
  Q06: { text: 'When you have to change direction suddenly, your movement is quick and balanced.' },
  Q07: { text: 'In aerial duels, how many times per match do you win the ball?' },
  Q08: { text: 'You feel your jump is high compared to players your size.' },
  Q09: { text: 'After attacking, how quickly do you get back into a defensive position?' },

  // Block 2 — Attacking
  Q10: { text: 'On average, how many goals do you score per match?' },
  Q11: { text: "When it's one-on-one with the keeper, you're usually calm and finish it." },
  Q12: { text: 'How many times per match do you dribble past an opponent?' },
  Q13: { text: 'When you have the ball in tight space, you prefer to...', leftLabel: 'Dribble out of it', rightLabel: 'Pass it quickly' },
  Q14: { text: 'You often find yourself in open space unmarked.' },
  Q15: { text: 'On average, how many assists do you make per match?' },
  Q16: { text: "You often spot passes that your teammates don't see." },
  Q17: { text: 'From outside the penalty box, your shots are fairly threatening.' },
  Q18: { text: "When you're out wide with space, you prefer to...", leftLabel: 'Cross the ball', rightLabel: 'Cut inside' },
  Q19: { text: "With your weaker foot, you're comfortable controlling and passing." },

  // Block 3 — Defending
  Q20: { text: 'How many times per match do you win the ball with a clean tackle?' },
  Q21: {
    text: 'When an opponent is running at you with the ball, you tend to...',
    leftLabel: 'Close them down first',
    rightLabel: 'Wait and hold your ground',
  },
  Q22: { text: 'You often intercept passes before they reach their target.' },
  Q23: { text: 'When your team loses the ball, you know exactly where to stand.' },
  Q24: { text: 'How often do you press the opponent on the ball right after losing possession?' },
  Q25: { text: 'On average, how many fouls do you commit per match?' },
  Q26: { text: "You can read where the opponent's attack is heading." },
  Q27: {
    text: 'When your team is ahead and has to defend, you feel...',
    leftLabel: 'Comfortable',
    rightLabel: 'Restless, wanting to push forward',
  },
  Q28: { text: "You chase down an opponent who's broken free even when the odds of catching them are slim." },

  // Block 4 — Technique
  Q29: { text: 'When you receive a hard pass under pressure, your first touch stays controlled.' },
  Q30: { text: 'How many times per match do you lose the ball due to poor control?' },
  Q31: { text: 'Your short passes reach your teammates accurately.' },
  Q32: { text: 'You are able to switch play with an accurate long pass.' },
  Q33: {
    text: 'When you have two passing options, you decide to...',
    leftLabel: 'Play it quick and simple',
    rightLabel: 'Wait for the best option',
  },
  Q34: { text: 'When carrying the ball while being chased, you stay calm and in control.' },
  Q35: { text: "You're comfortable receiving the ball with your back to goal while marked." },

  // Block 5 — Mental & Consistency
  Q36: { text: 'When your team is behind late in the match, you keep your composure.' },
  Q37: { text: "You often direct your teammates' positioning with your voice." },
  Q38: { text: 'After making a costly mistake, you bounce back and refocus quickly.' },
  Q39: { text: "You're willing to go into 50-50 challenges even at the risk of injury." },
  Q40: { text: 'You can still sprint at full pace in the final minutes.' },
  Q41: { text: 'Dribbling past opponents is one of your strengths.' },
  Q42: { text: 'You sometimes get confused about who to mark while defending.' },

  // Goalkeeper Block — optional
  Q43: { text: 'On sudden close-range shots, your reaction is quick.' },
  Q44: { text: 'You know where to stand to narrow the shooting angle.' },
  Q45: { text: 'How many times per match do you come off your line to sweep up the ball?' },
  Q46: {
    text: 'When the ball is passed back to you, you...',
    leftLabel: 'Clear it long',
    rightLabel: 'Build the attack with a pass',
  },
  Q47: { text: 'You command your defensive line with your voice.' },
  Q48: { text: "On high crosses into the box, you're confident coming out to clear them." },
  Q49: { text: 'Your throws and kicks start counterattacks well.' },
  Q50: { text: "You're comfortable playing far off your goal line." },
};

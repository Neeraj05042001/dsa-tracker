// ─── SM2 Spaced Repetition — 4-rating system ─────────────────────────────────
//
// Ratings:
//   1 = Again  — complete blank, restart
//   2 = Hard   — remembered with difficulty
//   3 = Good   — correct with some effort
//   4 = Easy   — instant recall
//
// Based on SuperMemo SM2 algorithm with 4-level adaptation.

export type SM2Rating = 1 | 2 | 3 | 4;

export interface SM2State {
  interval: number;       // days until next review
  repetitions: number;    // consecutive successful reviews
  ease_factor: number;    // multiplier (min 1.3)
  next_review: string;    // ISO date string
}

const MIN_EASE = 1.3;
const MAX_EASE = 3.5;

function clampEase(e: number): number {
  return Math.min(MAX_EASE, Math.max(MIN_EASE, e));
}

function addDays(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + Math.max(1, Math.round(days)));
  return d.toISOString().split("T")[0];
}

export function calculateSM2(current: SM2State, rating: SM2Rating): SM2State {
  let { interval, repetitions, ease_factor } = current;

  if (rating === 1) {
    // Again — full reset, back to day 1
    repetitions = 0;
    interval = 1;
    ease_factor = clampEase(ease_factor - 0.2);
  } else if (rating === 2) {
    // Hard — reset reps, short interval, ease drops
    repetitions = 0;
    interval = Math.max(1, Math.ceil(interval * 0.5));
    ease_factor = clampEase(ease_factor - 0.15);
  } else if (rating === 3) {
    // Good — standard SM2 progression
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 6;
    } else {
      interval = Math.ceil(interval * ease_factor);
    }
    repetitions += 1;
    ease_factor = clampEase(ease_factor + 0.1 - (5 - 3) * (0.08 + (5 - 3) * 0.02));
    // Above simplifies to: ease_factor unchanged for q=3 (net 0 change)
    // Keeping explicit for clarity
  } else {
    // Easy — accelerated interval, ease boost
    if (repetitions === 0) {
      interval = 4;
    } else if (repetitions === 1) {
      interval = 9;
    } else {
      interval = Math.ceil(interval * ease_factor * 1.3);
    }
    repetitions += 1;
    ease_factor = clampEase(ease_factor + 0.15);
  }

  return {
    interval,
    repetitions,
    ease_factor: Math.round(ease_factor * 100) / 100,
    next_review: addDays(interval),
  };
}

// Human-readable descriptions for the rating buttons
export const RATING_META: Record<SM2Rating, {
  label: string;
  sublabel: string;
  color: string;
  accent: string;
  key: string;
}> = {
  1: {
    label: "Again",
    sublabel: "Complete blank",
    color: "var(--hard)",
    accent: "color-mix(in srgb, var(--hard) 15%, transparent)",
    key: "1",
  },
  2: {
    label: "Hard",
    sublabel: "With difficulty",
    color: "var(--medium)",
    accent: "color-mix(in srgb, var(--medium) 15%, transparent)",
    key: "2",
  },
  3: {
    label: "Good",
    sublabel: "Recalled correctly",
    color: "var(--accent)",
    accent: "color-mix(in srgb, var(--accent) 15%, transparent)",
    key: "3",
  },
  4: {
    label: "Easy",
    sublabel: "Instant recall",
    color: "var(--easy)",
    accent: "color-mix(in srgb, var(--easy) 15%, transparent)",
    key: "4",
  },
};
/**
 * NV-1100-P5 — SM-2 Engine
 *
 * Canonical SuperMemo 2 (SM-2) implementation.
 * Deterministic, local-first, audit-friendly.
 *
 * Reference: Piotr Wozniak, "Optimization of repetition spacing in the
 * practice of learning" (1990). The algorithm is reproduced here without
 * modification; no proprietary variants, no mastery inference.
 *
 * Each review item stores the SM-2 state:
 *   {
 *     id: string,
 *     type: 'flashcard' | 'artifact',
 *     repetitions: number,    // n (number of successful reviews in a row)
 *     interval: number,       // I (in days)
 *     easeFactor: number,     // EF, floor at 1.3
 *     lastReviewed: string,   // ISO datetime
 *     nextReview: string,     // ISO datetime
 *     reviewHistory: []       // chronological list of past reviews
 *   }
 *
 * Quality grades: 0, 1, 2, 3, 4, 5
 *   5 = perfect, 4 = correct + hesitation, 3 = correct + difficulty,
 *   2 = incorrect but familiar, 1 = incorrect, 0 = complete blackout
 *
 * SM-2 transition rules (verbatim from Wozniak 1990):
 *   if quality >= 3:
 *     if repetitions == 0:  interval = 1
 *     elif repetitions == 1: interval = 6
 *     else:                  interval = round(previousInterval * easeFactor)
 *     repetitions += 1
 *   else:
 *     repetitions = 0
 *     interval = 1
 *   easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
 *   if easeFactor < 1.3: easeFactor = 1.3
 */

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const MIN_EASE = 1.3;
const DEFAULT_EASE = 2.5;
const MAX_INTERVAL_DAYS = 36500; // 100 years; practical cap to prevent JS Date overflow

function makeInitialState(id, type) {
  return {
    id: String(id),
    type: type || 'flashcard',
    repetitions: 0,
    interval: 0,
    easeFactor: DEFAULT_EASE,
    lastReviewed: null,
    nextReview: null,
    reviewHistory: []
  };
}

function clampQuality(q) {
  const n = Number(q);
  if (!Number.isFinite(n)) return null;
  if (n < 0) return 0;
  if (n > 5) return 5;
  return Math.floor(n);
}

function computeNextInterval(prevInterval, repetitions, easeFactor, quality) {
  if (quality >= 3) {
    if (repetitions === 0) return 1;
    if (repetitions === 1) return 6;
    return Math.min(MAX_INTERVAL_DAYS, Math.max(1, Math.round(prevInterval * easeFactor)));
  }
  return 1;
}

function computeEaseFactor(prevEase, quality) {
  const next = prevEase + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (next < MIN_EASE) return MIN_EASE;
  return Math.round(next * 1000) / 1000;
}

function isoNow() {
  return new Date().toISOString();
}

function addDays(iso, days) {
  const d = new Date(iso);
  d.setTime(d.getTime() + days * MS_PER_DAY);
  return d.toISOString();
}

function isValidId(id) {
  return typeof id === 'string' && id.length > 0;
}

function isValidType(t) {
  return t === 'flashcard' || t === 'artifact';
}

export const SM2 = {
  MIN_EASE,
  DEFAULT_EASE,
  MAX_INTERVAL_DAYS,
  makeInitialState,
  clampQuality,
  computeNextInterval,
  computeEaseFactor,
  addDays,
  isoNow,

  isValidId,
  isValidType,

  /**
   * Create a new review item.
   * @param {string} id
   * @param {'flashcard'|'artifact'} type
   * @returns {object} initial state
   */
  create(id, type) {
    if (!isValidId(id)) {
      throw new Error('SM2.create: id must be a non-empty string');
    }
    if (type !== undefined && !isValidType(type)) {
      throw new Error('SM2.create: type must be "flashcard" or "artifact"');
    }
    return makeInitialState(id, type || 'flashcard');
  },

  /**
   * Apply a single review and return the new state.
   * Pure function: does not mutate input.
   * @param {object} state - current review item state
   * @param {number} quality - 0..5
   * @param {string} [nowIso] - override for "now" (used in tests)
   * @returns {object} new state
   */
  review(state, quality, nowIso) {
    if (!state || typeof state !== 'object') {
      throw new Error('SM2.review: state must be an object');
    }
    const q = clampQuality(quality);
    if (q === null) {
      throw new Error('SM2.review: quality must be a number');
    }
    const now = nowIso || isoNow();
    const prevInterval = state.interval || 0;
    const prevReps = state.repetitions || 0;
    const prevEase = Number(state.easeFactor) || DEFAULT_EASE;

    let nextReps, nextInterval;
    if (q >= 3) {
      nextReps = prevReps + 1;
      nextInterval = computeNextInterval(prevInterval, nextReps - 1, prevEase, q);
    } else {
      nextReps = 0;
      nextInterval = 1;
    }
    const nextEase = computeEaseFactor(prevEase, q);

    const historyEntry = {
      timestamp: now,
      quality: q,
      interval: nextInterval,
      easeFactor: nextEase,
      repetitions: nextReps
    };

    return {
      id: state.id,
      type: state.type || 'flashcard',
      repetitions: nextReps,
      interval: nextInterval,
      easeFactor: nextEase,
      lastReviewed: now,
      nextReview: addDays(now, nextInterval),
      reviewHistory: [...(state.reviewHistory || []), historyEntry]
    };
  },

  /**
   * Predict the next review state without applying it (for previews).
   * @param {object} state
   * @param {number} quality
   * @param {string} [nowIso]
   * @returns {object} predicted next state
   */
  preview(state, quality, nowIso) {
    return SM2.review(state, quality, nowIso);
  },

  /**
   * Check if an item is due (or overdue) at a given moment.
   * Items with no nextReview (never reviewed) are not "due" — they are
   * "new" and only become due after the first explicit review.
   * @param {object} state
   * @param {string} [nowIso]
   * @returns {boolean}
   */
  isDue(state, nowIso) {
    if (!state || !state.nextReview) return false;
    const now = new Date(nowIso || isoNow()).getTime();
    const next = new Date(state.nextReview).getTime();
    return now >= next;
  },

  /**
   * Check if an item is overdue at a given moment.
   * Overdue = past the day boundary of nextReview.
   * @param {object} state
   * @param {string} [nowIso]
   * @returns {boolean}
   */
  isOverdue(state, nowIso) {
    if (!state || !state.nextReview) return false;
    const now = new Date(nowIso || isoNow());
    const next = new Date(state.nextReview);
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const startOfNextDay = new Date(next.getFullYear(), next.getMonth(), next.getDate()).getTime();
    return startOfNextDay < startOfToday;
  },

  /**
   * Check if an item is scheduled for today (due today, not overdue).
   * @param {object} state
   * @param {string} [nowIso]
   * @returns {boolean}
   */
  isDueToday(state, nowIso) {
    if (!state || !state.nextReview) return false;
    const now = new Date(nowIso || isoNow());
    const next = new Date(state.nextReview);
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const startOfNextDay = new Date(next.getFullYear(), next.getMonth(), next.getDate()).getTime();
    return startOfNextDay === startOfToday;
  }
};

export default SM2;

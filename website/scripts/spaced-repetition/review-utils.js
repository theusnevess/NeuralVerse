/**
 * NV-1100-P5 — Review Utilities
 *
 * Pure helper functions used by the scheduler, queue, dashboard, and
 * controller. No I/O. No side effects.
 */

import { SM2 } from './sm2-engine.js';

export const REVIEW_TYPE = Object.freeze({
  FLASHCARD: 'flashcard',
  ARTIFACT: 'artifact'
});

export const QUALITY = Object.freeze({
  BLACKOUT: 0,
  INCORRECT: 1,
  FAMILIAR_WRONG: 2,
  CORRECT_DIFFICULT: 3,
  CORRECT_HESITANT: 4,
  PERFECT: 5
});

export const UI_GRADE_LABELS = Object.freeze({
  0: 'Again',
  1: 'Wrong',
  2: 'Hard',
  3: 'Good',
  4: 'Easy',
  5: 'Perfect'
});

export const REVIEW_STATUS = Object.freeze({
  NEVER: 'never',
  DUE_TODAY: 'due-today',
  OVERDUE: 'overdue',
  UPCOMING: 'upcoming',
  REVIEWED_TODAY: 'reviewed-today'
});

export function statusOf(state, nowIso) {
  if (!state || !state.lastReviewed) return REVIEW_STATUS.NEVER;
  const now = new Date(nowIso || new Date().toISOString());
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const last = state.lastReviewed ? new Date(state.lastReviewed) : null;
  if (last) {
    const startOfLastDay = new Date(last.getFullYear(), last.getMonth(), last.getDate()).getTime();
    if (startOfLastDay === startOfToday) return REVIEW_STATUS.REVIEWED_TODAY;
  }
  if (SM2.isOverdue(state, nowIso)) return REVIEW_STATUS.OVERDUE;
  if (SM2.isDueToday(state, nowIso)) return REVIEW_STATUS.DUE_TODAY;
  return REVIEW_STATUS.UPCOMING;
}

export function formatRelative(iso, nowIso) {
  if (!iso) return 'Never';
  const now = new Date(nowIso || new Date().toISOString());
  const target = new Date(iso);
  const diffMs = target.getTime() - now.getTime();
  const diffDays = Math.round(diffMs / (24 * 60 * 60 * 1000));
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays === -1) return 'Yesterday';
  if (diffDays < -1) return `${Math.abs(diffDays)} days ago`;
  if (diffDays < 7) return `In ${diffDays} days`;
  if (diffDays < 30) return `In ${Math.round(diffDays / 7)} weeks`;
  return target.toLocaleDateString();
}

export function safeJSONParse(raw, fallback) {
  if (raw === null || raw === undefined) return fallback;
  try {
    return JSON.parse(raw);
  } catch (e) {
    return fallback;
  }
}

export function makeReviewId(type, entityId) {
  return `${type}:${entityId}`;
}

export function parseReviewId(reviewId) {
  if (typeof reviewId !== 'string') return null;
  const idx = reviewId.indexOf(':');
  if (idx === -1) return null;
  return { type: reviewId.slice(0, idx), entityId: reviewId.slice(idx + 1) };
}

export function todayBounds(nowIso) {
  const now = new Date(nowIso || new Date().toISOString());
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const end = start + 24 * 60 * 60 * 1000;
  return { start, end, startIso: new Date(start).toISOString(), endIso: new Date(end).toISOString() };
}

export function isToday(iso, nowIso) {
  if (!iso) return false;
  const { start, end } = todayBounds(nowIso);
  const t = new Date(iso).getTime();
  return t >= start && t < end;
}

export function clampInt(n, min, max) {
  const v = Math.floor(Number(n));
  if (!Number.isFinite(v)) return min;
  if (v < min) return min;
  if (v > max) return max;
  return v;
}

export const DEFAULT_PREFERENCES = Object.freeze({
  enabled: true,
  dailyLimit: 50,
  showOverdueFirst: true,
  includeArtifacts: true,
  includeFlashcards: true
});

export function mergePreferences(current, incoming) {
  if (!incoming || typeof incoming !== 'object') return { ...DEFAULT_PREFERENCES, ...(current || {}) };
  const merged = { ...DEFAULT_PREFERENCES, ...(current || {}), ...incoming };
  if (typeof merged.dailyLimit === 'number') {
    merged.dailyLimit = clampInt(merged.dailyLimit, 1, 1000);
  }
  return merged;
}

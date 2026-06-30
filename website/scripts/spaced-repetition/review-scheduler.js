/**
 * NV-1100-P5 — Review Scheduler
 *
 * High-level API that combines the SM-2 engine, storage, and preferences
 * to schedule reviews. All methods are pure with respect to the storage
 * layer: each call that mutates state explicitly reads, updates, and writes
 * the schedule via ReviewStorage.
 *
 * Public surface (also exposed via window.NeuralVerse.reviewScheduler):
 *   initialize()                  - ensure defaults; return readiness
 *   getPreferences()              - returns preferences
 *   setPreferences(patch)         - merge patch into preferences
 *   ensureItem(id, type)          - create if missing; return state
 *   gradeItem(id, type, quality)  - apply SM-2, persist, return new state
 *   getItem(id, type)             - return current state (or null)
 *   getItemByReviewId(reviewId)   - same, by composite id
 *   removeItem(id, type)          - drop from schedule
 *   resetSchedule()               - clear schedule + history
 */

import { SM2 } from './sm2-engine.js';
import { ReviewStorage } from './review-storage.js';
import { makeReviewId, DEFAULT_PREFERENCES } from './review-utils.js';

export function createReviewScheduler() {
  let initialized = false;
  const listeners = new Set();

  function notify(event) {
    listeners.forEach((cb) => {
      try { cb(event); } catch (e) { /* swallow listener errors */ }
    });
  }

  function initialize() {
    if (initialized) return { ready: true, preferences: ReviewStorage.loadPreferences() };
    const prefs = ReviewStorage.loadPreferences();
    initialized = true;
    notify({ type: 'initialized', preferences: prefs });
    return { ready: true, preferences: prefs };
  }

  function getPreferences() {
    return ReviewStorage.loadPreferences();
  }

  function setPreferences(patch) {
    const next = ReviewStorage.savePreferences(patch);
    notify({ type: 'preferences-updated', preferences: next ? ReviewStorage.loadPreferences() : null });
    return next;
  }

  function ensureItem(id, type) {
    if (!SM2.isValidId(id)) {
      throw new Error('createReviewScheduler.ensureItem: invalid id');
    }
    const reviewId = makeReviewId(type || 'flashcard', id);
    const existing = ReviewStorage.getItem(reviewId);
    if (existing) return existing;
    const state = SM2.create(reviewId, type || 'flashcard');
    state.entityId = id;
    state.type = type || 'flashcard';
    ReviewStorage.upsertItem(state);
    notify({ type: 'item-ensured', reviewId, state });
    return state;
  }

  function getItem(id, type) {
    const reviewId = makeReviewId(type || 'flashcard', id);
    return ReviewStorage.getItem(reviewId);
  }

  function getItemByReviewId(reviewId) {
    return ReviewStorage.getItem(reviewId);
  }

  function gradeItem(id, type, quality, nowIso) {
    if (!SM2.isValidId(id)) {
      throw new Error('createReviewScheduler.gradeItem: invalid id');
    }
    const reviewId = makeReviewId(type || 'flashcard', id);
    let current = ReviewStorage.getItem(reviewId);
    if (!current) {
      current = SM2.create(reviewId, type || 'flashcard');
      current.entityId = id;
      current.type = type || 'flashcard';
    }
    const next = SM2.review(current, quality, nowIso);
    next.entityId = id;
    next.type = type || 'flashcard';
    ReviewStorage.upsertItem(next);
    const historyEvent = {
      reviewId,
      entityId: id,
      type: type || 'flashcard',
      timestamp: next.lastReviewed,
      quality: SM2.clampQuality(quality),
      interval: next.interval,
      easeFactor: next.easeFactor,
      repetitions: next.repetitions
    };
    ReviewStorage.appendHistory(historyEvent);
    notify({ type: 'item-reviewed', reviewId, state: next, historyEvent });
    return next;
  }

  function removeItem(id, type) {
    const reviewId = makeReviewId(type || 'flashcard', id);
    ReviewStorage.removeItem(reviewId);
    notify({ type: 'item-removed', reviewId });
  }

  function resetSchedule() {
    ReviewStorage.resetSchedule();
    notify({ type: 'schedule-reset' });
  }

  function getAll() {
    return ReviewStorage.loadSchedule();
  }

  function getHistory() {
    return ReviewStorage.loadHistory();
  }

  function subscribe(cb) {
    listeners.add(cb);
    return () => listeners.delete(cb);
  }

  return {
    initialize,
    getPreferences,
    setPreferences,
    ensureItem,
    getItem,
    getItemByReviewId,
    gradeItem,
    removeItem,
    resetSchedule,
    getAll,
    getHistory,
    subscribe
  };
}

export const REVIEW_SCHEDULER_FACTORY = createReviewScheduler;

export default createReviewScheduler;

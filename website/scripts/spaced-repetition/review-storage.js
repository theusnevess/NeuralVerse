/**
 * NV-1100-P5 — Review Storage
 *
 * Local-first persistence for review state.
 * Storage keys:
 *   nv_review_schedule    -> { [reviewId]: state }
 *   nv_review_history     -> [event, ...]  (chronological, never truncated)
 *   nv_review_preferences -> { enabled, dailyLimit, ... }
 *
 * Uses the NeuralVerse StorageAdapter when present, falls back to localStorage.
 * The persistence layer (NV-1100-P1) is the canonical owner of export/import;
 * this module only writes raw keys. The persistence layer has been extended to
 * recognize the review keys as part of P5.
 */

import { safeJSONParse, DEFAULT_PREFERENCES, mergePreferences } from './review-utils.js';

const KEY_SCHEDULE = 'nv_review_schedule';
const KEY_HISTORY = 'nv_review_history';
const KEY_PREFERENCES = 'nv_review_preferences';

function getStorage() {
  if (typeof window !== 'undefined' && window.NeuralVerse && window.NeuralVerse.StorageAdapter) {
    return window.NeuralVerse.StorageAdapter;
  }
  if (typeof localStorage !== 'undefined') {
    return {
      getItem: (k) => localStorage.getItem(k),
      setItem: (k, v) => localStorage.setItem(k, v),
      removeItem: (k) => localStorage.removeItem(k),
      keys: () => {
        const out = [];
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k) out.push(k);
        }
        return out;
      }
    };
  }
  return null;
}

function safeGet(storage, key, fallback) {
  if (!storage) return fallback;
  const raw = storage.getItem(key);
  if (raw === null || raw === undefined) return fallback;
  return safeJSONParse(raw, fallback);
}

function safeSet(storage, key, value) {
  if (!storage) return false;
  try {
    storage.setItem(key, JSON.stringify(value));
    return true;
  } catch (e) {
    return false;
  }
}

export const ReviewStorage = {
  KEYS: Object.freeze({
    SCHEDULE: KEY_SCHEDULE,
    HISTORY: KEY_HISTORY,
    PREFERENCES: KEY_PREFERENCES
  }),

  loadSchedule() {
    return safeGet(getStorage(), KEY_SCHEDULE, {}) || {};
  },

  saveSchedule(schedule) {
    if (!schedule || typeof schedule !== 'object') return false;
    return safeSet(getStorage(), KEY_SCHEDULE, schedule);
  },

  getItem(reviewId) {
    const sched = this.loadSchedule();
    return sched[reviewId] || null;
  },

  upsertItem(state) {
    if (!state || !state.id) return false;
    const sched = this.loadSchedule();
    // Use the state.id (which is the composite reviewId like "flashcard:fc-1")
    // This is set by the scheduler when it creates the state via makeReviewId.
    sched[state.id] = state;
    this.saveSchedule(sched);
    return true;
  },

  removeItem(reviewId) {
    const sched = this.loadSchedule();
    if (sched[reviewId]) {
      delete sched[reviewId];
      this.saveSchedule(sched);
    }
  },

  loadHistory() {
    return safeGet(getStorage(), KEY_HISTORY, []) || [];
  },

  appendHistory(event) {
    if (!event || typeof event !== 'object') return false;
    const history = this.loadHistory();
    history.push(event);
    return safeSet(getStorage(), KEY_HISTORY, history);
  },

  saveHistory(history) {
    if (!Array.isArray(history)) return false;
    return safeSet(getStorage(), KEY_HISTORY, history);
  },

  loadPreferences() {
    return mergePreferences(safeGet(getStorage(), KEY_PREFERENCES, {}), {});
  },

  savePreferences(prefs) {
    const merged = mergePreferences(prefs, prefs);
    return safeSet(getStorage(), KEY_PREFERENCES, merged);
  },

  resetAll() {
    const s = getStorage();
    if (!s) return false;
    s.removeItem(KEY_SCHEDULE);
    s.removeItem(KEY_HISTORY);
    return true;
  },

  resetSchedule() {
    const s = getStorage();
    if (!s) return false;
    s.removeItem(KEY_SCHEDULE);
    s.removeItem(KEY_HISTORY);
    return true;
  },

  /**
   * Export all review state as a plain object. Used by the persistence layer
   * (NV-1100-P1) for backup bundles.
   */
  exportAll() {
    return {
      [KEY_SCHEDULE]: this.loadSchedule(),
      [KEY_HISTORY]: this.loadHistory(),
      [KEY_PREFERENCES]: this.loadPreferences()
    };
  },

  /**
   * Replace all review state from a bundle (replace mode).
   */
  importReplace(bundle) {
    if (!bundle || typeof bundle !== 'object') return false;
    const s = getStorage();
    if (!s) return false;
    if (bundle[KEY_SCHEDULE] && typeof bundle[KEY_SCHEDULE] === 'object') {
      s.setItem(KEY_SCHEDULE, JSON.stringify(bundle[KEY_SCHEDULE]));
    } else {
      s.removeItem(KEY_SCHEDULE);
    }
    if (Array.isArray(bundle[KEY_HISTORY])) {
      s.setItem(KEY_HISTORY, JSON.stringify(bundle[KEY_HISTORY]));
    } else {
      s.removeItem(KEY_HISTORY);
    }
    if (bundle[KEY_PREFERENCES] && typeof bundle[KEY_PREFERENCES] === 'object') {
      s.setItem(KEY_PREFERENCES, JSON.stringify(bundle[KEY_PREFERENCES]));
    } else {
      s.removeItem(KEY_PREFERENCES);
    }
    return true;
  },

  /**
   * Merge review state from a bundle (merge mode).
   * - Schedule: union of review IDs; on conflict keep entry with newer lastReviewed.
   * - History: union of events, deduplicated by (reviewId, timestamp, quality).
   * - Preferences: deep merge with current.
   */
  importMerge(bundle) {
    if (!bundle || typeof bundle !== 'object') return false;
    const currentSchedule = this.loadSchedule();
    const incomingSchedule = bundle[KEY_SCHEDULE] || {};
    const mergedSchedule = { ...currentSchedule };
    for (const [id, state] of Object.entries(incomingSchedule)) {
      if (!state || typeof state !== 'object') continue;
      const existing = mergedSchedule[id];
      if (!existing) {
        mergedSchedule[id] = state;
        continue;
      }
      const existingTime = existing.lastReviewed ? new Date(existing.lastReviewed).getTime() : 0;
      const incomingTime = state.lastReviewed ? new Date(state.lastReviewed).getTime() : 0;
      if (incomingTime >= existingTime) {
        mergedSchedule[id] = state;
      }
    }
    this.saveSchedule(mergedSchedule);

    const currentHistory = this.loadHistory();
    const incomingHistory = Array.isArray(bundle[KEY_HISTORY]) ? bundle[KEY_HISTORY] : [];
    const seen = new Set();
    const mergedHistory = [];
    for (const evt of [...currentHistory, ...incomingHistory]) {
      if (!evt || typeof evt !== 'object') continue;
      const key = `${evt.reviewId || ''}|${evt.timestamp || ''}|${evt.quality ?? ''}`;
      if (seen.has(key)) continue;
      seen.add(key);
      mergedHistory.push(evt);
    }
    mergedHistory.sort((a, b) => {
      const ta = a.timestamp ? new Date(a.timestamp).getTime() : 0;
      const tb = b.timestamp ? new Date(b.timestamp).getTime() : 0;
      return ta - tb;
    });
    this.saveHistory(mergedHistory);

    const incomingPrefs = bundle[KEY_PREFERENCES];
    if (incomingPrefs) {
      const mergedPrefs = mergePreferences(this.loadPreferences(), incomingPrefs);
      this.savePreferences(mergedPrefs);
    }
    return true;
  }
};

export default ReviewStorage;

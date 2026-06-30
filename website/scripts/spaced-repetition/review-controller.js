/**
 * NV-1100-P5 — Review Controller
 *
 * UI orchestration for review interactions:
 *   - Start / continue / skip review session
 *   - Grade current item
 *   - Surface review badges in workspace and learning
 *   - Refresh queue and dashboard after each action
 *
 * Does not perform any mastery inference or competence scoring.
 */

import { createReviewScheduler } from './review-scheduler.js';
import { createReviewQueue } from './review-queue.js';
import { ReviewStorage } from './review-storage.js';
import { SM2 } from './sm2-engine.js';
import { makeReviewId, REVIEW_STATUS, statusOf, todayBounds } from './review-utils.js';

let _controller = null;

export function createReviewController(options) {
  const opts = options || {};
  const scheduler = opts.scheduler || createReviewScheduler();
  const queue = opts.queue || createReviewQueue();
  const root = opts.root || (typeof document !== 'undefined' ? document.body : null);
  let session = null;

  function ensureSession() {
    if (session) return session;
    const prefs = scheduler.getPreferences();
    const schedule = scheduler.getAll();
    const { activeItems } = queue.activeSessionItems(schedule, { preferences: prefs });
    session = {
      items: [...activeItems],
      index: 0,
      startedAt: new Date().toISOString(),
      gradedCount: 0
    };
    if (session.items.length === 0) return session;
    const first = session.items[0];
    scheduler.ensureItem(first.entityId || first.id, first.type);
    return session;
  }

  function startSession() {
    session = null;
    return ensureSession();
  }

  function currentItem() {
    ensureSession();
    if (!session) return null;
    return session.items[session.index] || null;
  }

  function gradeCurrent(quality) {
    ensureSession();
    if (!session) return { ok: false, reason: 'no-active-session' };
    const item = session.items[session.index];
    if (!item) return { ok: false, reason: 'no-current-item' };
    const entityId = item.entityId || item.id.replace(/^[^:]+:/, '');
    const next = scheduler.gradeItem(entityId, item.type, quality);
    session.gradedCount += 1;
    session.index += 1;
    return { ok: true, next, finished: session.index >= session.items.length };
  }

  function skipCurrent() {
    ensureSession();
    if (!session) return { ok: false };
    const item = session.items[session.index];
    if (!item) return { ok: false };
    session.index += 1;
    return { ok: true, finished: session.index >= session.items.length, skipped: item };
  }

  function endSession() {
    session = null;
  }

  function getBadgeFor(reviewId) {
    const state = scheduler.getItemByReviewId(reviewId);
    if (!state) return REVIEW_STATUS.NEVER;
    return statusOf(state);
  }

  function renderBadge(container, reviewId, options) {
    if (!root || !container) return;
    const status = getBadgeFor(reviewId);
    const label = (options && options.label) || 'Review';
    const labels = {
      [REVIEW_STATUS.NEVER]: `${label}: not scheduled`,
      [REVIEW_STATUS.DUE_TODAY]: `${label}: due today`,
      [REVIEW_STATUS.OVERDUE]: `${label}: overdue`,
      [REVIEW_STATUS.UPCOMING]: `${label}: scheduled`,
      [REVIEW_STATUS.REVIEWED_TODAY]: `${label}: reviewed today`
    };
    container.textContent = labels[status] || `${label}: ${status}`;
    container.setAttribute('data-review-status', status);
    container.setAttribute('aria-label', labels[status] || status);
  }

  function renderMetadata(container, reviewId) {
    if (!root || !container) return;
    const state = scheduler.getItemByReviewId(reviewId);
    if (!state) {
      container.textContent = '';
      return;
    }
    const fmt = (iso) => {
      if (!iso) return 'Never';
      try {
        return new Date(iso).toLocaleString();
      } catch (e) { return iso; }
    };
    const parts = [
      `Last Review: ${fmt(state.lastReviewed)}`,
      `Next Review: ${fmt(state.nextReview)}`,
      `Ease Factor: ${(Number(state.easeFactor) || 0).toFixed(2)}`,
      `Interval: ${state.interval || 0} days`,
      `Repetitions: ${state.repetitions || 0}`
    ];
    container.textContent = parts.join(' · ');
  }

  return {
    scheduler,
    queue,
    startSession,
    ensureSession,
    currentItem,
    gradeCurrent,
    skipCurrent,
    endSession,
    getBadgeFor,
    renderBadge,
    renderMetadata,
    getStatusOf: statusOf
  };
}

export function getReviewController() {
  if (!_controller) _controller = createReviewController();
  return _controller;
}

export const REVIEW_CONTROLLER_FACTORY = createReviewController;

export default createReviewController;

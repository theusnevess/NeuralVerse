/**
 * NV-1100-P5B — Review Session Controller
 *
 * High-level orchestrator that bridges the scheduler, queue, and the
 * Review Session UI. Manages:
 *   - Session lifecycle (start, continue, skip, complete)
 *   - Item resolution (entityId + type → prompt/answer metadata)
 *   - Reload restoration (partial sessions)
 *   - Completion broadcast
 *
 * The session UI is responsible for rendering; this module decides WHAT
 * to show, in what order, and persists the state.
 *
 * Prompts and answers are deterministic metadata drawn from the curriculum
 * and the agent registry. They are NOT inference. They are written content
 * keyed by entity ID.
 */

import { createReviewSession } from './review-session.js';
import { createReviewScheduler } from './review-scheduler.js';
import { createReviewQueue } from './review-queue.js';
import { ReviewStorage } from './review-storage.js';
import { makeReviewId, REVIEW_STATUS, statusOf, formatRelative } from './review-utils.js';

const SESSION_STORAGE_KEY = 'nv_review_session_state';

let _controller = null;

function readSessionState() {
  if (typeof localStorage === 'undefined') return null;
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) { return null; }
}

function writeSessionState(s) {
  if (typeof localStorage === 'undefined') return;
  try {
    if (!s) {
      localStorage.removeItem(SESSION_STORAGE_KEY);
      return;
    }
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(s));
  } catch (e) { /* ignore */ }
}

function clearSessionState() {
  writeSessionState(null);
}

function defaultPromptFor(item) {
  if (item.type === 'artifact') {
    return `Review the artifact "${item.title || item.entityId || item.id}". When you are ready, reveal the artifact description and grade your recall.`;
  }
  return `Review flashcard "${item.entityId || item.id}". When you are ready, reveal the answer and grade your recall.`;
}

function defaultAnswerFor(item) {
  if (item.type === 'artifact') {
    return item.summary || `Artifact scheduled for spaced review on ${formatRelative(item.nextReview) || 'today'}.`;
  }
  return item.summary || `Flashcard scheduled for spaced review on ${formatRelative(item.nextReview) || 'today'}.`;
}

function enrichItem(item) {
  if (!item) return null;
  return {
    id: item.id,
    reviewId: item.id,
    entityId: item.entityId || (item.id && item.id.includes(':') ? item.id.split(':').slice(1).join(':') : item.id),
    type: item.type || 'flashcard',
    title: item.title,
    summary: item.summary,
    nextReview: item.nextReview,
    prompt: defaultPromptFor(item),
    answer: defaultAnswerFor(item)
  };
}

export function createReviewSessionController(options) {
  const opts = options || {};
  const scheduler = opts.scheduler || (typeof window !== 'undefined' && window.NeuralVerse?.reviewScheduler) || createReviewScheduler();
  const queue = opts.queue || (typeof window !== 'undefined' && window.NeuralVerse?.reviewQueue) || createReviewQueue();
  const root = opts.root || (typeof document !== 'undefined' ? document.body : null);

  let currentSession = null;
  let onSessionEnd = opts.onSessionEnd || (() => {});

  function getActiveItems() {
    const prefs = scheduler.getPreferences();
    const schedule = scheduler.getAll();
    const { activeItems } = queue.activeSessionItems(schedule, { preferences: prefs });
    return activeItems.map(enrichItem).filter(Boolean);
  }

  function startSession() {
    const items = getActiveItems();
    writeSessionState({
      startedAt: new Date().toISOString(),
      itemIds: items.map(i => i.id),
      gradedCount: 0
    });
    currentSession = createReviewSession({
      scheduler,
      queue,
      root,
      onClose: ({ gradedCount, completed }) => {
        clearSessionState();
        onSessionEnd({ gradedCount, completed });
      },
      onComplete: ({ gradedCount }) => {
        if (currentSession) currentSession = null;
        onSessionEnd({ gradedCount, completed: true });
      }
    });
    currentSession.open(items);
    return { opened: true, itemCount: items.length };
  }

  function resumeSession() {
    const persisted = readSessionState();
    if (!persisted || !Array.isArray(persisted.itemIds) || persisted.itemIds.length === 0) {
      return startSession();
    }
    const schedule = scheduler.getAll();
    const items = persisted.itemIds
      .map(id => schedule[id])
      .filter(Boolean)
      .map(enrichItem);
    if (items.length === 0) {
      clearSessionState();
      return startSession();
    }
    writeSessionState({
      startedAt: persisted.startedAt,
      itemIds: items.map(i => i.id),
      gradedCount: persisted.gradedCount || 0
    });
    currentSession = createReviewSession({
      scheduler,
      queue,
      root,
      onClose: ({ gradedCount, completed }) => {
        clearSessionState();
        onSessionEnd({ gradedCount, completed });
      },
      onComplete: ({ gradedCount }) => {
        if (currentSession) currentSession = null;
        onSessionEnd({ gradedCount, completed: true });
      }
    });
    currentSession.open(items);
    return { opened: true, itemCount: items.length, resumed: true };
  }

  function closeSession() {
    if (currentSession) {
      currentSession.close();
      currentSession = null;
    }
  }

  function hasActiveSession() {
    return !!currentSession || !!readSessionState();
  }

  return {
    startSession,
    resumeSession,
    closeSession,
    hasActiveSession,
    getActiveItems
  };
}

export function getReviewSessionController() {
  if (!_controller) _controller = createReviewSessionController();
  return _controller;
}

export const REVIEW_SESSION_CONTROLLER_FACTORY = createReviewSessionController;

export default createReviewSessionController;

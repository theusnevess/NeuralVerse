/**
 * NV-1100-P5B — Review Session UI
 *
 * Interactive review session overlay. Pure UI orchestration:
 *   - Renders a session in a target container (modal overlay or inline).
 *   - Owns prompt, reveal, and quality-grading affordances.
 *   - Drives keyboard shortcuts (Space, 0–5, Enter, Arrow Right, Escape).
 *   - Surfaces progress (item X of N), session-complete state.
 *
 * Governance:
 *   - No mastery, proficiency, XP, streaks, or scores.
 *   - Quality labels match the SM-2 contract exactly.
 *   - All copy is informational; no motivational language.
 *
 * The engine schedules. The session presents. The learner evaluates.
 */

import { SM2 } from './sm2-engine.js';
import { makeReviewId, statusOf, REVIEW_STATUS, formatRelative } from './review-utils.js';

const QUALITY_LABELS = Object.freeze({
  0: 'Complete blackout',
  1: 'Incorrect',
  2: 'Difficult recall',
  3: 'Correct with effort',
  4: 'Correct',
  5: 'Perfect recall'
});

const QUALITY_KEYS = ['0', '1', '2', '3', '4', '5'];

function el(tag, attrs, ...children) {
  const node = document.createElement(tag);
  if (attrs) {
    for (const [k, v] of Object.entries(attrs)) {
      if (v === null || v === undefined || v === false) continue;
      if (k === 'class') node.className = v;
      else if (k === 'dataset') Object.assign(node.dataset, v);
      else if (k.startsWith('on') && typeof v === 'function') {
        node.addEventListener(k.slice(2).toLowerCase(), v);
      } else if (k === 'html') {
        node.innerHTML = v;
      } else {
        node.setAttribute(k, v);
      }
    }
  }
  for (const c of children) {
    if (c === null || c === undefined || c === false) continue;
    if (typeof c === 'string' || typeof c === 'number') node.appendChild(document.createTextNode(String(c)));
    else node.appendChild(c);
  }
  return node;
}

function safeFocus(node) {
  if (!node) return;
  try { node.focus({ preventScroll: false }); } catch (e) { /* ignore */ }
}

export function createReviewSession(options) {
  const opts = options || {};
  const scheduler = opts.scheduler;
  const queue = opts.queue;
  if (!scheduler) throw new Error('createReviewSession: scheduler is required');
  if (!queue) throw new Error('createReviewSession: queue is required');

  const root = opts.root || (typeof document !== 'undefined' ? document.body : null);
  const onClose = opts.onClose || (() => {});
  const onComplete = opts.onComplete || (() => {});

  const overlay = el('div', {
    class: 'nv-review-session-overlay',
    role: 'dialog',
    'aria-modal': 'true',
    'aria-labelledby': 'nv-review-session-title',
    'aria-describedby': 'nv-review-session-progress',
    hidden: true
  });

  const liveRegion = el('div', {
    class: 'nv-sr-only',
    'aria-live': 'polite',
    'aria-atomic': 'true',
    id: 'nv-review-session-live'
  });

  const title = el('h2', { class: 'nv-review-session__title', id: 'nv-review-session-title' }, 'Review Session');
  const progressLabel = el('p', { class: 'nv-review-session__progress', id: 'nv-review-session-progress' }, '');
  const progressBar = el('div', {
    class: 'nv-review-session__progress-bar',
    role: 'progressbar',
    'aria-valuemin': '0',
    'aria-valuemax': '100',
    'aria-valuenow': '0',
    'aria-label': 'Session progress'
  });
  const progressFill = el('div', { class: 'nv-review-session__progress-fill' });
  progressBar.appendChild(progressFill);

  const itemMeta = el('p', { class: 'nv-review-session__item-meta' });

  const promptBlock = el('section', { class: 'nv-review-session__block nv-review-session__prompt' });
  const promptLabel = el('p', { class: 'nv-review-session__label' }, 'Prompt');
  const promptText = el('p', { class: 'nv-review-session__prompt-text', tabindex: '0' }, '');

  const answerBlock = el('section', { class: 'nv-review-session__block nv-review-session__answer', hidden: true });
  const answerLabel = el('p', { class: 'nv-review-session__label' }, 'Answer');
  const answerText = el('p', { class: 'nv-review-session__answer-text' }, '');

  const revealButton = el('button', {
    type: 'button',
    class: 'nv-button',
    'data-variant': 'primary',
    'data-action': 'reveal',
    'aria-keyshortcuts': 'Space'
  }, 'Reveal Answer');

  const qualityLabel = el('p', { class: 'nv-review-session__quality-label' }, 'How well did you recall this?');
  const qualityGroup = el('div', {
    class: 'nv-review-session__quality-group',
    role: 'radiogroup',
    'aria-label': 'Recall quality'
  });
  const qualityButtons = [];
  for (let q = 0; q <= 5; q++) {
    const btn = el('button', {
      type: 'button',
      class: 'nv-button nv-review-session__quality-btn',
      'data-variant': 'secondary',
      'data-quality': String(q),
      'aria-keyshortcuts': String(q),
      'aria-pressed': 'false',
      tabindex: '-1',
      disabled: true
    }, `${q} · ${QUALITY_LABELS[q]}`);
    qualityButtons.push(btn);
    qualityGroup.appendChild(btn);
  }

  const submitButton = el('button', {
    type: 'button',
    class: 'nv-button',
    'data-variant': 'primary',
    'data-action': 'submit',
    disabled: true
  }, 'Submit');

  const nextButton = el('button', {
    type: 'button',
    class: 'nv-button',
    'data-variant': 'secondary',
    'data-action': 'next',
    hidden: true,
    'aria-keyshortcuts': 'ArrowRight'
  }, 'Next');

  const actionsBar = el('div', { class: 'nv-review-session__actions' });
  const skipButton = el('button', {
    type: 'button',
    class: 'nv-button',
    'data-variant': 'ghost',
    'data-action': 'skip'
  }, 'Skip');
  const exitButton = el('button', {
    type: 'button',
    class: 'nv-button',
    'data-variant': 'ghost',
    'data-action': 'exit'
  }, 'Exit Session');
  actionsBar.appendChild(skipButton);
  actionsBar.appendChild(exitButton);

  promptBlock.appendChild(promptLabel);
  promptBlock.appendChild(promptText);
  answerBlock.appendChild(answerLabel);
  answerBlock.appendChild(answerText);

  const gradeBar = el('div', { class: 'nv-review-session__grade', hidden: true });
  gradeBar.appendChild(qualityLabel);
  gradeBar.appendChild(qualityGroup);
  gradeBar.appendChild(submitButton);
  gradeBar.appendChild(nextButton);

  const completeBlock = el('section', { class: 'nv-review-session__complete', hidden: true });
  const completeTitle = el('h3', { class: 'nv-review-session__complete-title' }, 'Review Session Complete');
  const completeList = el('ul', { class: 'nv-review-session__complete-list' });
  const completeReturn = el('button', {
    type: 'button',
    class: 'nv-button',
    'data-variant': 'primary',
    'data-action': 'return'
  }, 'Return to Workspace');
  completeBlock.appendChild(completeTitle);
  completeBlock.appendChild(completeList);
  completeBlock.appendChild(completeReturn);

  const dialog = el('div', { class: 'nv-review-session' });
  dialog.appendChild(title);
  dialog.appendChild(progressLabel);
  dialog.appendChild(progressBar);
  dialog.appendChild(itemMeta);
  dialog.appendChild(promptBlock);
  dialog.appendChild(revealButton);
  dialog.appendChild(answerBlock);
  dialog.appendChild(gradeBar);
  dialog.appendChild(actionsBar);
  dialog.appendChild(completeBlock);
  dialog.appendChild(liveRegion);
  overlay.appendChild(dialog);

  const state = {
    items: [],
    index: 0,
    startedAt: null,
    revealed: false,
    selectedQuality: null,
    gradedCount: 0,
    completed: false
  };

  function setProgress() {
    const total = state.items.length;
    const current = Math.min(state.index + 1, total);
    progressLabel.textContent = total > 0 ? `Review ${current} of ${total}` : 'No items to review';
    const pct = total > 0 ? Math.round((state.gradedCount / total) * 100) : 0;
    progressBar.setAttribute('aria-valuenow', String(pct));
    progressFill.style.width = `${pct}%`;
  }

  function setLive(text) {
    liveRegion.textContent = '';
    // Force re-announce by re-setting after a tick
    setTimeout(() => { liveRegion.textContent = text; }, 30);
  }

  function renderItem() {
    if (state.completed) return renderComplete();
    const item = state.items[state.index];
    if (!item) return renderComplete();
    state.revealed = false;
    state.selectedQuality = null;
    itemMeta.textContent = `Item ${state.index + 1} of ${state.items.length} · ${item.type === 'artifact' ? 'Artifact' : 'Flashcard'}`;
    promptText.textContent = item.prompt || '(No prompt available for this item.)';
    answerText.textContent = item.answer || '(No answer recorded.)';
    answerBlock.hidden = true;
    revealButton.hidden = false;
    revealButton.disabled = false;
    gradeBar.hidden = true;
    qualityButtons.forEach(b => { b.disabled = true; b.setAttribute('aria-pressed', 'false'); b.tabIndex = -1; });
    submitButton.disabled = true;
    nextButton.hidden = true;
    setProgress();
    setLive(`Item ${state.index + 1} of ${state.items.length}. Press Space to reveal answer.`);
    setTimeout(() => safeFocus(revealButton), 50);
  }

  function renderComplete() {
    state.completed = true;
    promptBlock.hidden = true;
    answerBlock.hidden = true;
    revealButton.hidden = true;
    gradeBar.hidden = true;
    actionsBar.hidden = true;
    completeBlock.hidden = false;
    completeList.innerHTML = '';
    const items = state.gradedCount;
    const remaining = scheduler.getAll() ? Object.values(scheduler.getAll()).filter(s => statusOf(s) === REVIEW_STATUS.DUE_TODAY || statusOf(s) === REVIEW_STATUS.OVERDUE).length : 0;
    const upcoming = scheduler.getAll() ? Object.values(scheduler.getAll()).filter(s => statusOf(s) === REVIEW_STATUS.UPCOMING).length : 0;
    const li1 = el('li', null, `Items reviewed: ${items}`);
    const li2 = el('li', null, `Remaining due today: ${remaining}`);
    const li3 = el('li', null, `Upcoming reviews: ${upcoming}`);
    completeList.appendChild(li1);
    completeList.appendChild(li2);
    completeList.appendChild(li3);
    setProgress();
    setLive(`Session complete. ${items} items reviewed. ${remaining} remaining due today.`);
    setTimeout(() => safeFocus(completeReturn), 50);
    onComplete({ gradedCount: state.gradedCount });
  }

  function reveal() {
    if (state.revealed) return;
    state.revealed = true;
    answerBlock.hidden = false;
    revealButton.hidden = true;
    gradeBar.hidden = false;
    qualityButtons.forEach(b => { b.disabled = false; b.tabIndex = 0; });
    submitButton.disabled = true;
    setLive('Answer revealed. Select a quality grade 0 through 5, then press Enter or Submit.');
    setTimeout(() => safeFocus(qualityButtons[3]), 50);
  }

  function selectQuality(q) {
    if (!state.revealed) return;
    state.selectedQuality = q;
    qualityButtons.forEach(b => b.setAttribute('aria-pressed', String(parseInt(b.dataset.quality, 10) === q)));
    submitButton.disabled = false;
    setLive(`Quality ${q} selected: ${QUALITY_LABELS[q]}. Press Enter to submit.`);
  }

  function grade() {
    if (state.selectedQuality === null || !state.revealed) return;
    const item = state.items[state.index];
    if (!item) return;
    const entityId = item.entityId || (item.reviewId ? item.reviewId.split(':').slice(1).join(':') : item.id);
    const next = scheduler.gradeItem(entityId, item.type, state.selectedQuality);
    state.gradedCount += 1;
    setProgress();
    if (state.index + 1 >= state.items.length) {
      renderComplete();
    } else {
      state.index += 1;
      nextButton.hidden = false;
      gradeBar.hidden = true;
      answerBlock.hidden = true;
      submitButton.disabled = true;
      setLive(`Item graded. Press Arrow Right or click Next for the next item.`);
      setTimeout(() => safeFocus(nextButton), 50);
    }
    return next;
  }

  function nextItem() {
    if (state.index + 1 < state.items.length && state.gradedCount > 0) {
      state.index += 1;
      renderItem();
    } else {
      renderComplete();
    }
  }

  function skip() {
    if (state.completed) return;
    if (state.index + 1 >= state.items.length) {
      renderComplete();
    } else {
      state.index += 1;
      renderItem();
    }
  }

  function exit(confirmed) {
    if (!confirmed) {
      const confirmOverlay = el('div', { class: 'nv-review-session-confirm', role: 'alertdialog', 'aria-modal': 'true', 'aria-labelledby': 'nv-confirm-title' });
      const confirmTitle = el('h3', { id: 'nv-confirm-title' }, 'Exit Session?');
      const confirmText = el('p', null, 'You can return to the dashboard and resume later. Skipped items remain in the queue.');
      const confirmActions = el('div', { class: 'nv-cluster nv-cluster--gap-sm' });
      const cancelBtn = el('button', { type: 'button', class: 'nv-button', 'data-variant': 'secondary' }, 'Cancel');
      const exitBtn = el('button', { type: 'button', class: 'nv-button', 'data-variant': 'primary' }, 'Exit');
      confirmActions.appendChild(cancelBtn);
      confirmActions.appendChild(exitBtn);
      confirmOverlay.appendChild(confirmTitle);
      confirmOverlay.appendChild(confirmText);
      confirmOverlay.appendChild(confirmActions);
      cancelBtn.addEventListener('click', () => confirmOverlay.remove());
      exitBtn.addEventListener('click', () => { confirmOverlay.remove(); doClose(); });
      overlay.appendChild(confirmOverlay);
      setTimeout(() => safeFocus(exitBtn), 30);
      return;
    }
    doClose();
  }

  function doClose() {
    overlay.hidden = true;
    if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
    document.removeEventListener('keydown', onKeyDown, true);
    onClose({ gradedCount: state.gradedCount, completed: state.completed });
  }

  function onKeyDown(e) {
    if (overlay.hidden) return;
    const tag = (e.target && e.target.tagName) || '';
    if (tag === 'INPUT' || tag === 'TEXTAREA' || (e.target && e.target.isContentEditable)) return;
    if (state.completed) {
      if (e.key === 'Escape' || e.key === 'Enter') { e.preventDefault(); doClose(); }
      return;
    }
    if (e.key === ' ' || e.code === 'Space') {
      e.preventDefault();
      if (!state.revealed) reveal();
      return;
    }
    if (QUALITY_KEYS.includes(e.key)) {
      if (state.revealed) {
        e.preventDefault();
        selectQuality(parseInt(e.key, 10));
      }
      return;
    }
    if (e.key === 'Enter') {
      if (state.revealed && state.selectedQuality !== null) {
        e.preventDefault();
        grade();
      }
      return;
    }
    if (e.key === 'ArrowRight' && !nextButton.hidden) {
      e.preventDefault();
      nextItem();
      return;
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      exit(false);
      return;
    }
  }

  // Event wiring
  revealButton.addEventListener('click', reveal);
  qualityButtons.forEach(b => {
    b.addEventListener('click', () => selectQuality(parseInt(b.dataset.quality, 10)));
  });
  submitButton.addEventListener('click', grade);
  nextButton.addEventListener('click', nextItem);
  skipButton.addEventListener('click', skip);
  exitButton.addEventListener('click', () => exit(false));
  completeReturn.addEventListener('click', doClose);

  function open(itemsArg) {
    state.items = Array.isArray(itemsArg) ? [...itemsArg] : [];
    state.index = 0;
    state.gradedCount = 0;
    state.completed = false;
    state.revealed = false;
    state.selectedQuality = null;
    state.startedAt = new Date().toISOString();
    overlay.hidden = false;
    if (!overlay.parentNode && root) root.appendChild(overlay);
    if (!overlay.parentNode) document.body.appendChild(overlay);
    document.addEventListener('keydown', onKeyDown, true);
    if (state.items.length === 0) {
      renderComplete();
    } else {
      renderItem();
    }
    setLive(`Review session started with ${state.items.length} item${state.items.length === 1 ? '' : 's'}.`);
  }

  return {
    open,
    close: doClose,
    getState: () => ({ ...state }),
    isOpen: () => !overlay.hidden
  };
}

export const REVIEW_SESSION_QUALITY_LABELS = QUALITY_LABELS;

export default createReviewSession;

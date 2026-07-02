/**
 * NV-1100-P5B — Review Settings Controller
 *
 * Binds the Review Preferences card in the Settings page to the scheduler.
 * Persists dailyLimit, showOverdueFirst, includeArtifacts, includeFlashcards.
 * Provides a confirmation dialog before reset.
 *
 * The reset dialog is deterministic; it never silently deletes data.
 */

import { DEFAULT_PREFERENCES } from './review-utils.js';

function el(tag, attrs, ...children) {
  const node = document.createElement(tag);
  if (attrs) {
    for (const [k, v] of Object.entries(attrs)) {
      if (v === null || v === undefined || v === false) continue;
      if (k === 'class') node.className = v;
      else if (k === 'dataset') Object.assign(node.dataset, v);
      else if (k.startsWith('on') && typeof v === 'function') node.addEventListener(k.slice(2).toLowerCase(), v);
      else node.setAttribute(k, v);
    }
  }
  for (const c of children) {
    if (c === null || c === undefined || c === false) continue;
    if (typeof c === 'string' || typeof c === 'number') node.appendChild(document.createTextNode(String(c)));
    else node.appendChild(c);
  }
  return node;
}

export function createReviewSettingsController(options) {
  const opts = options || {};
  const scheduler = opts.scheduler || (typeof window !== 'undefined' && window.NeuralVerse?.reviewScheduler);
  const root = opts.root || (typeof document !== 'undefined' ? document.body : null);

  function loadPrefsIntoUI() {
    if (!root || !scheduler) return;
    const prefs = { ...DEFAULT_PREFERENCES, ...(scheduler.getPreferences() || {}) };
    const daily = root.querySelector('[data-review-pref="dailyLimit"]');
    if (daily) daily.value = String(prefs.dailyLimit);
    const showOverdue = root.querySelector('[data-review-pref="showOverdueFirst"]');
    if (showOverdue) showOverdue.checked = !!prefs.showOverdueFirst;
    const includeArt = root.querySelector('[data-review-pref="includeArtifacts"]');
    if (includeArt) includeArt.checked = !!prefs.includeArtifacts;
    const includeFlash = root.querySelector('[data-review-pref="includeFlashcards"]');
    if (includeFlash) includeFlash.checked = !!prefs.includeFlashcards;
  }

  function wirePrefInputs() {
    if (!root || !scheduler) return;
    const inputs = root.querySelectorAll('[data-review-pref]');
    inputs.forEach(input => {
      if (input.dataset.reviewWired === '1') return;
      input.dataset.reviewWired = '1';
      const key = input.dataset.reviewPref;
      const eventName = input.type === 'checkbox' ? 'change' : 'input';
      input.addEventListener(eventName, () => {
        const current = scheduler.getPreferences() || {};
        const patch = { ...current };
        if (input.type === 'checkbox') {
          patch[key] = !!input.checked;
        } else if (input.type === 'number') {
          let v = parseInt(input.value, 10);
          if (isNaN(v)) v = DEFAULT_PREFERENCES[key] || 50;
          if (v < 1) v = 1;
          if (v > 1000) v = 1000;
          patch[key] = v;
        } else {
          patch[key] = input.value;
        }
        scheduler.setPreferences(patch);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('nv:reviewupdated'));
        }
      });
    });
  }

  function showResetConfirm() {
    if (!root || !scheduler) return;
    const previouslyFocused = document.activeElement;
    const overlay = el('div', {
      class: 'nv-reset-confirm-overlay',
      role: 'alertdialog',
      'aria-modal': 'true',
      'aria-labelledby': 'nv-reset-confirm-title',
      'aria-describedby': 'nv-reset-confirm-desc'
    });
    const dialog = el('div', { class: 'nv-reset-confirm-dialog' });
    const title = el('h3', { id: 'nv-reset-confirm-title' }, 'Reset Review Schedule?');
    const desc = el('p', { id: 'nv-reset-confirm-desc' }, 'This removes all scheduled reviews and review history. Bookmarks, notes, collections, progress, highlights and personalization remain unchanged.');
    const actions = el('div', { class: 'nv-cluster nv-cluster--gap-sm' });
    const cancelBtn = el('button', { type: 'button', class: 'nv-button', 'data-variant': 'secondary' }, 'Cancel');
    const resetBtn = el('button', { type: 'button', class: 'nv-button', 'data-variant': 'danger' }, 'Reset');
    actions.appendChild(cancelBtn);
    actions.appendChild(resetBtn);
    dialog.appendChild(title);
    dialog.appendChild(desc);
    dialog.appendChild(actions);
    overlay.appendChild(dialog);

    function close() {
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
      document.removeEventListener('keydown', onKey, true);
      if (previouslyFocused && typeof previouslyFocused.focus === 'function') {
        try { previouslyFocused.focus(); } catch (e) {}
      }
    }
    function onKey(e) {
      if (e.key === 'Escape') { e.preventDefault(); close(); }
      else if (e.key === 'Enter') { e.preventDefault(); doReset(); }
      else if (e.key === 'Tab') {
        const focusable = [cancelBtn, resetBtn];
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        const activeIsInDialog = overlay.contains(document.activeElement);
        if (!activeIsInDialog) {
          e.preventDefault();
          first.focus();
        } else if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
    function doReset() {
      // Snapshot unrelated personalization keys to verify they survive
      const unrelatedBefore = {
        bookmarks: localStorage.getItem('nv_personalization_bookmarks'),
        notes: localStorage.getItem('nv_personalization_notes'),
        progress: localStorage.getItem('neuralverse.progress.v1')
      };
      scheduler.resetSchedule();
      // After reset, verify unrelated keys untouched
      const unrelatedAfter = {
        bookmarks: localStorage.getItem('nv_personalization_bookmarks'),
        notes: localStorage.getItem('nv_personalization_notes'),
        progress: localStorage.getItem('neuralverse.progress.v1')
      };
      const preserved = Object.keys(unrelatedBefore).every(k => unrelatedBefore[k] === unrelatedAfter[k]);
      const statusEl = root.querySelector('[data-status="review-reset-status"]');
      if (statusEl) {
        statusEl.textContent = preserved ? 'Review schedule reset. Other data preserved.' : 'Review schedule reset (warning: some unrelated data changed).';
        statusEl.style.display = 'block';
        setTimeout(() => { statusEl.style.display = 'none'; statusEl.textContent = ''; }, 4000);
      }
      close();
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('nv:reviewupdated'));
      }
    }

    cancelBtn.addEventListener('click', close);
    resetBtn.addEventListener('click', doReset);
    document.addEventListener('keydown', onKey, true);

    if (root) root.appendChild(overlay);
    else document.body.appendChild(overlay);
    setTimeout(() => { try { resetBtn.focus(); } catch (e) {} }, 30);
  }

  function wireResetButton() {
    if (!root || !scheduler) return;
    const resetBtn = root.querySelector('[data-review-action="reset"]');
    if (resetBtn && resetBtn.dataset.reviewWired !== '1') {
      resetBtn.dataset.reviewWired = '1';
      resetBtn.addEventListener('click', (e) => { e.preventDefault(); showResetConfirm(); });
    }
  }

  function init() {
    loadPrefsIntoUI();
    wirePrefInputs();
    wireResetButton();
  }

  return { init, loadPrefsIntoUI, wirePrefInputs, wireResetButton, showResetConfirm };
}

export const REVIEW_SETTINGS_CONTROLLER_FACTORY = createReviewSettingsController;

export default createReviewSettingsController;

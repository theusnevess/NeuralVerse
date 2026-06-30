/**
 * NV-1100-P6 — Verification Controller
 *
 * Bridges the verification engine + storage + UI. Wires the rendered card
 * to the engine, persists history, and surfaces the result panel.
 *
 * Does not infer mastery. The learner always controls review scheduling.
 */

import { verifyAnswer } from './verification-engine.js';
import { VerificationStorage } from './verification-storage.js';
import { renderVerificationCard, renderVerificationResult, renderVerificationHistoryList } from './verification-ui.js';
import { safeText } from './answer-normalizer.js';

let _controller = null;

export function createVerificationController(options) {
  const opts = options || {};
  const storage = opts.storage || (typeof window !== 'undefined' && window.NeuralVerse?.verificationStorage) || VerificationStorage;
  const root = opts.root || (typeof document !== 'undefined' ? document.body : null);

  function registerItem(item) {
    if (!item || !item.id) return false;
    return storage.saveItem(item);
  }

  function getItem(id) {
    return storage.getItem(id);
  }

  function verifyItem(id, actual) {
    const item = storage.getItem(id);
    if (!item) {
      return {
        status: 'invalid',
        matchesExpected: false,
        needsRetry: false,
        partiallyCheckable: false,
        message: 'Verification item is not registered.',
        details: { reason: 'unknown-item' },
        timestamp: new Date().toISOString()
      };
    }
    const result = verifyAnswer({
      type: item.type,
      expected: item.expected,
      actual: typeof actual === 'string' ? actual : safeText(actual),
      options: item.options || {},
      feedback: item.feedback || {}
    });
    try {
      storage.appendHistory({
        itemId: id,
        artifactId: item.artifactId || null,
        status: result.status,
        timestamp: result.timestamp,
        type: item.type,
        details: { partial: result.partiallyCheckable }
      });
    } catch (e) { /* non-fatal */ }
    return result;
  }

  function getHistory(itemId) {
    if (!itemId) return storage.loadHistory();
    return storage.getHistoryForItem(itemId);
  }

  function clearHistory(itemId) {
    if (!itemId) return storage.clearHistory();
    const remaining = storage.loadHistory().filter(e => e.itemId !== itemId);
    return VerificationStorage.importReplace({
      [VerificationStorage.KEYS.HISTORY]: remaining,
      [VerificationStorage.KEYS.ITEMS]: storage.loadItems()
    });
  }

  function mountCard(item, container) {
    if (!item || !container) return null;
    container.innerHTML = renderVerificationCard(item);
    const card = container.querySelector(`[data-verification-card][data-verification-id="${item.id}"]`);
    if (!card) return null;
    wireCard(card, item);
    return card;
  }

  function wireCard(card, item) {
    if (!card || card.dataset.wired === '1') return;
    card.dataset.wired = '1';
    const checkBtn = card.querySelector('[data-verification-action="check"]');
    const tryAgainBtn = card.querySelector('[data-verification-action="try-again"]');
    const addToReviewBtn = card.querySelector('[data-verification-action="add-to-review"]');
    const input = card.querySelector('[data-verification-input]');
    const result = card.querySelector('[data-verification-result]');
    const live = card.querySelector(`[data-verification-live]`);

    function showResult(r) {
      result.innerHTML = renderVerificationResult(r);
      result.hidden = false;
      if (r.status === 'match') {
        tryAgainBtn.hidden = true;
        if (addToReviewBtn) addToReviewBtn.hidden = false;
      } else {
        tryAgainBtn.hidden = false;
        if (addToReviewBtn) addToReviewBtn.hidden = false;
      }
      if (live) {
        live.textContent = '';
        setTimeout(() => { live.textContent = r.message || ''; }, 30);
      }
    }

    function doCheck() {
      const actual = input ? input.value : '';
      const r = verifyItem(item.id, actual);
      showResult(r);
    }

    function doTryAgain() {
      if (input) {
        input.value = '';
        input.focus();
      }
      result.hidden = true;
      tryAgainBtn.hidden = true;
      if (addToReviewBtn) addToReviewBtn.hidden = true;
    }

    function doAddToReview() {
      const scheduler = typeof window !== 'undefined' ? window.NeuralVerse?.reviewScheduler : null;
      if (!scheduler) {
        if (live) live.textContent = 'Review scheduler not available.';
        return;
      }
      const artifactId = item.artifactId || item.id;
      try {
        scheduler.ensureItem(artifactId, 'artifact');
        if (live) live.textContent = 'Added to review queue.';
      } catch (e) {
        if (live) live.textContent = 'Could not add to review queue.';
      }
    }

    if (checkBtn) checkBtn.addEventListener('click', doCheck);
    if (tryAgainBtn) tryAgainBtn.addEventListener('click', doTryAgain);
    if (addToReviewBtn) addToReviewBtn.addEventListener('click', doAddToReview);
    if (input) {
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
          e.preventDefault();
          doCheck();
        }
      });
    }
  }

  function mountHistory(container, itemId, options) {
    if (!container) return;
    const history = itemId ? getHistory(itemId) : storage.loadHistory();
    container.innerHTML = renderVerificationHistoryList(history, options);
  }

  return {
    registerItem,
    getItem,
    verifyItem,
    getHistory,
    clearHistory,
    mountCard,
    mountHistory,
    storage
  };
}

export function getVerificationController() {
  if (!_controller) _controller = createVerificationController();
  return _controller;
}

export const VERIFICATION_CONTROLLER_FACTORY = createVerificationController;

export default createVerificationController;

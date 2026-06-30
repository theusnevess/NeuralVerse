/**
 * NV-1100-P6 — Verification UI
 *
 * Pure rendering helpers for the verification card and result panel.
 * Returns HTML strings; safe by construction (uses escapeHtml for all
 * user-controlled values).
 */

import { escapeHtml, sanitizeForHtml, isSafeStatus } from './answer-normalizer.js';

function safeMsg(s) {
  if (typeof s !== 'string') return '';
  return sanitizeForHtml(s);
}

function safeStatus(s) {
  return isSafeStatus(s) ? s : 'invalid';
}

export function renderVerificationCard(item) {
  if (!item || !item.id) return '';
  const id = escapeHtml(item.id);
  const prompt = safeMsg(item.prompt || 'Practice question');
  const expected = safeMsg(item.expected || '');
  const type = escapeHtml(item.type || 'normalized_text');
  const placeholder = escapeHtml(item.placeholder || 'Type your answer here…');
  return `<section class="nv-verification-card" data-verification-card data-verification-id="${id}" data-verification-type="${type}" aria-labelledby="nv-verification-prompt-${id}">
    <header class="nv-verification-card__header">
      <h3 class="nv-verification-card__title" id="nv-verification-prompt-${id}">Practice Check</h3>
      <p class="nv-verification-card__prompt">${prompt}</p>
    </header>
    <div class="nv-verification-card__body">
      <label class="nv-verification-card__label" for="nv-verification-input-${id}">Your answer</label>
      <textarea id="nv-verification-input-${id}" class="nv-verification-card__input" data-verification-input rows="3" placeholder="${placeholder}" aria-describedby="nv-verification-help-${id}"></textarea>
      <p class="nv-verification-card__help" id="nv-verification-help-${id}">Type your answer and press Check.</p>
    </div>
    <div class="nv-verification-card__actions">
      <button type="button" class="nv-button" data-variant="primary" data-verification-action="check" data-verification-id="${id}" aria-label="Check answer">Check Answer</button>
      <button type="button" class="nv-button" data-variant="secondary" data-verification-action="try-again" data-verification-id="${id}" hidden aria-label="Try again">Try Again</button>
      <button type="button" class="nv-button" data-variant="secondary" data-verification-action="add-to-review" data-verification-id="${id}" hidden aria-label="Add to review queue">Add To Review</button>
    </div>
    <div class="nv-verification-card__result" data-verification-result data-verification-id="${id}" role="status" aria-live="polite" aria-atomic="true" hidden></div>
    <span class="nv-sr-only" data-verification-live="${id}" aria-live="polite" aria-atomic="true"></span>
  </section>`;
}

export function renderVerificationResult(result) {
  if (!result || typeof result !== 'object') return '';
  const status = safeStatus(result.status);
  const message = safeMsg(result.message || '');
  const cls = `nv-verification-result nv-verification-result--${status}`;
  return `<div class="${cls}" data-verification-result-status="${status}" role="status">
    <p class="nv-verification-result__message">${message}</p>
  </div>`;
}

export function renderVerificationHistoryList(history, options) {
  const opts = options || {};
  const list = Array.isArray(history) ? history : [];
  if (list.length === 0) {
    return `<p class="nv-muted" data-verification-history-empty>No verification attempts recorded.</p>`;
  }
  const limit = opts.limit || list.length;
  const items = list.slice(-limit).reverse();
  const rows = items.map(e => {
    const ts = e.timestamp ? new Date(e.timestamp).toLocaleString() : 'Unknown';
    const status = safeStatus(e.status);
    return `<li class="nv-verification-history-item" data-verification-history-item data-verification-status="${status}">
      <span class="nv-verification-history-item__time">${escapeHtml(ts)}</span>
      <span class="nv-verification-history-item__status nv-verification-history-item__status--${status}">${escapeHtml(status.replace('_', ' '))}</span>
    </li>`;
  }).join('');
  return `<ul class="nv-verification-history-list" data-verification-history-list aria-label="Verification history">${rows}</ul>`;
}

export const VERIFICATION_UI = Object.freeze({
  renderVerificationCard,
  renderVerificationResult,
  renderVerificationHistoryList
});

export default VERIFICATION_UI;

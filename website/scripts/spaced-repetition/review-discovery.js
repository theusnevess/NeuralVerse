/**
 * NV-1100-P5C — Review Discovery
 *
 * Lightweight review-aware navigation and search helpers.
 *
 * Provides:
 *   - "View Due Artifacts" / "View Scheduled" / "View Reviewed Today" / "View Upcoming"
 *     filter logic for artifact lists (transient; not persisted).
 *   - Search shortcuts: when a query matches review-related keywords, return
 *     up to 5 boosted review shortcut cards that do not overwhelm curriculum results.
 *   - Knowledge graph hover overlay: small panel that surfaces the review badge
 *     state for an artifact node (presentation only; no topology change).
 *
 * No new persistence keys. No new schemas. No mastery or scoring.
 */

import { statusOf, REVIEW_STATUS, makeReviewId, formatRelative } from './review-utils.js';
import { getBadgeState, BADGE_STATE, BADGE_LABELS } from './review-badge-renderer.js';

export const REVIEW_SEARCH_QUERIES = Object.freeze([
  'due reviews', 'review due', 'review today', 'overdue', 'scheduled review',
  'flashcards due', 'reviews', "today's reviews", 'review session', 'review now'
]);

const REVIEW_KEYWORDS = new Set([
  'review', 'reviews', 'due', 'overdue', 'today', 'scheduled', 'flashcards', 'flashcard'
]);

function safeText(s) {
  return String(s == null ? '' : s);
}

function tokenize(q) {
  return String(q || '').toLowerCase().split(/\s+/).filter(Boolean);
}

export function isReviewQuery(query) {
  const tokens = tokenize(query);
  if (tokens.length === 0) return false;
  let hits = 0;
  for (const t of tokens) if (REVIEW_KEYWORDS.has(t)) hits++;
  return hits >= 1 && REVIEW_SEARCH_QUERIES.some(q => q.toLowerCase() === String(query || '').toLowerCase().trim());
}

export function getReviewShortcuts(scheduler, options) {
  const opts = options || {};
  const limit = Math.max(1, Math.min(5, Number(opts.limit) || 5));
  if (!scheduler) return [];
  const schedule = scheduler.getAll();
  const now = opts.nowIso || new Date().toISOString();
  const items = Object.values(schedule);
  const buckets = { due: [], upcoming: [], reviewedToday: [], new: [] };
  for (const s of items) {
    if (s.type !== 'flashcard' && s.type !== 'artifact') continue;
    const st = statusOf(s, now);
    if (st === REVIEW_STATUS.OVERDUE || st === REVIEW_STATUS.DUE_TODAY) buckets.due.push(s);
    else if (st === REVIEW_STATUS.UPCOMING) buckets.upcoming.push(s);
    else if (st === REVIEW_STATUS.REVIEWED_TODAY) buckets.reviewedToday.push(s);
    else if (st === REVIEW_STATUS.NEVER) buckets.new.push(s);
  }
  const ordered = [...buckets.due, ...buckets.upcoming, ...buckets.reviewedToday, ...buckets.new];
  return ordered.slice(0, limit).map(s => ({
    id: s.id,
    type: s.type,
    title: s.title || s.id,
    summary: s.summary || '',
    badgeState: getBadgeStateForSchedule(s, now),
    nextReview: s.nextReview,
    lastReviewed: s.lastReviewed,
    entityId: s.entityId || (s.id.includes(':') ? s.id.split(':').slice(1).join(':') : s.id)
  }));
}

function getBadgeStateForSchedule(s, nowIso) {
  const status = statusOf(s, nowIso);
  if (status === REVIEW_STATUS.OVERDUE || status === REVIEW_STATUS.DUE_TODAY) return BADGE_STATE.DUE;
  if (status === REVIEW_STATUS.REVIEWED_TODAY) return BADGE_STATE.REVIEWED_TODAY;
  if (status === REVIEW_STATUS.UPCOMING) return BADGE_STATE.SCHEDULED;
  return BADGE_STATE.NONE;
}

export function renderReviewShortcutCard(shortcut, options) {
  const opts = options || {};
  const title = safeText(shortcut.title);
  const summary = safeText(shortcut.summary);
  const badge = BADGE_LABELS[shortcut.badgeState] || 'Scheduled';
  const href = shortcut.type === 'artifact'
    ? `#/content/${encodeURIComponent(shortcut.entityId || shortcut.id)}`
    : '#/workspace';
  return `<article class="nv-card nv-review-shortcut" data-review-shortcut data-review-id="${safeText(shortcut.id)}" data-review-type="${safeText(shortcut.type)}" role="article" aria-labelledby="nv-review-shortcut-${safeText(shortcut.id)}">
    <header class="nv-review-shortcut__header">
      <h3 id="nv-review-shortcut-${safeText(shortcut.id)}" class="nv-review-shortcut__title">${title}</h3>
      <span class="nv-badge nv-review-shortcut__badge" data-review-badge-state="${safeText(shortcut.badgeState)}">${badge}</span>
    </header>
    <p class="nv-review-shortcut__summary">${summary || 'Scheduled for spaced repetition review.'}</p>
    <footer class="nv-review-shortcut__footer">
      <a href="${href}" class="nv-button" data-variant="secondary" aria-label="Open ${title}">Open</a>
    </footer>
  </article>`;
}

export function renderReviewShortcutsSection(scheduler, options) {
  const opts = options || {};
  const limit = opts.limit || 5;
  const shortcuts = getReviewShortcuts(scheduler, { limit });
  if (shortcuts.length === 0) {
    return `<section class="nv-review-shortcuts" data-review-shortcuts-section role="region" aria-label="Review shortcuts">
      <h2 class="nv-review-shortcuts__title">Due Reviews</h2>
      <p class="nv-muted">No review items due right now.</p>
    </section>`;
  }
  const cards = shortcuts.map(s => renderReviewShortcutCard(s, opts)).join('');
  const totalDue = shortcuts.filter(s => s.badgeState === BADGE_STATE.DUE).length;
  const summary = `${totalDue} item${totalDue === 1 ? '' : 's'} require${totalDue === 1 ? 's' : ''} review today.`;
  return `<section class="nv-review-shortcuts" data-review-shortcuts-section role="region" aria-label="Review shortcuts">
    <header class="nv-review-shortcuts__header">
      <h2 class="nv-review-shortcuts__title">Due Reviews</h2>
      <p class="nv-review-shortcuts__summary">${summary}</p>
    </header>
    <div class="nv-review-shortcuts__list">${cards}</div>
    <footer class="nv-review-shortcuts__footer">
      <a href="#/workspace" class="nv-button" data-variant="primary" aria-label="Open review session on workspace">Open Review Session</a>
    </footer>
  </section>`;
}

export function getDueArtifacts(scheduler, options) {
  const opts = options || {};
  if (!scheduler) return [];
  const schedule = scheduler.getAll();
  const now = opts.nowIso || new Date().toISOString();
  const items = Object.values(schedule)
    .filter(s => s.type === 'artifact')
    .filter(s => {
      const st = statusOf(s, now);
      return st === REVIEW_STATUS.OVERDUE || st === REVIEW_STATUS.DUE_TODAY;
    });
  return items.map(s => ({
    id: s.id,
    entityId: s.entityId || (s.id.includes(':') ? s.id.split(':').slice(1).join(':') : s.id),
    type: 'artifact',
    title: s.title || s.id,
    summary: s.summary || '',
    nextReview: s.nextReview,
    lastReviewed: s.lastReviewed
  }));
}

export function renderDueArtifactsList(scheduler, options) {
  const opts = options || {};
  const due = getDueArtifacts(scheduler, opts);
  if (due.length === 0) {
    return `<div class="nv-review-due-list" data-review-due-list data-empty="true">
      <p class="nv-muted">No artifacts require review today.</p>
    </div>`;
  }
  const items = due.map(a => `<li class="nv-review-due-item" data-review-due-item data-review-target-id="${safeText(a.entityId)}" data-review-target-type="artifact">
    <a href="#/content/${encodeURIComponent(a.entityId)}" class="nv-review-due-item__link">${safeText(a.title)}</a>
    <span class="nv-review-due-item__next">Next: ${safeText(formatRelative(a.nextReview))}</span>
  </li>`).join('');
  return `<ul class="nv-review-due-list" data-review-due-list aria-label="Artifacts due for review">${items}</ul>`;
}

export function buildReviewSearchShortcuts(scheduler, options) {
  const opts = options || {};
  if (!isReviewQuery(opts.query || '')) return [];
  const shortcuts = getReviewShortcuts(scheduler, { limit: opts.limit || 5 });
  return shortcuts.map(s => ({
    type: 'review-shortcut',
    id: s.id,
    title: s.title,
    summary: s.summary,
    badgeState: s.badgeState,
    href: s.type === 'artifact' ? `#/content/${encodeURIComponent(s.entityId || s.id)}` : '#/workspace',
    boost: 0.6,
    source: 'review-discovery'
  }));
}

export function renderGraphHoverPanel(artifactId, type, scheduler) {
  const id = safeText(artifactId);
  if (!id || !scheduler) return '';
  const state = getBadgeState(id, type, scheduler);
  if (state === BADGE_STATE.NONE) return '';
  const label = BADGE_LABELS[state];
  return `<div class="nv-graph-review-hover" data-graph-review-hover role="tooltip" aria-label="Review status: ${label}">${label}</div>`;
}

export function attachGraphHover(rootEl, scheduler, options) {
  const opts = options || {};
  if (!rootEl || !scheduler) return () => {};
  const hover = document.createElement('div');
  hover.className = 'nv-graph-review-hover-layer';
  hover.hidden = true;
  rootEl.appendChild(hover);
  function onOver(e) {
    const node = e.target.closest('[data-node-id]');
    if (!node) { hover.hidden = true; return; }
    const id = node.getAttribute('data-node-id');
    const type = node.getAttribute('data-node-type') || 'artifact';
    const state = getBadgeState(id, type, scheduler);
    if (state === BADGE_STATE.NONE) { hover.hidden = true; return; }
    hover.innerHTML = renderGraphHoverPanel(id, type, scheduler);
    const rect = node.getBoundingClientRect();
    const rootRect = rootEl.getBoundingClientRect();
    hover.style.left = (rect.left - rootRect.left + rect.width / 2) + 'px';
    hover.style.top = (rect.top - rootRect.top - 8) + 'px';
    hover.hidden = false;
  }
  function onOut(e) {
    const node = e.target.closest('[data-node-id]');
    if (node) hover.hidden = true;
  }
  rootEl.addEventListener('mouseover', onOver);
  rootEl.addEventListener('mouseout', onOut);
  return () => {
    rootEl.removeEventListener('mouseover', onOver);
    rootEl.removeEventListener('mouseout', onOut);
    if (hover.parentNode) hover.parentNode.removeChild(hover);
  };
}

export const REVIEW_DISCOVERY = {
  REVIEW_SEARCH_QUERIES,
  isReviewQuery, getReviewShortcuts, renderReviewShortcutCard, renderReviewShortcutsSection,
  getDueArtifacts, renderDueArtifactsList, buildReviewSearchShortcuts,
  renderGraphHoverPanel, attachGraphHover
};

export default REVIEW_DISCOVERY;

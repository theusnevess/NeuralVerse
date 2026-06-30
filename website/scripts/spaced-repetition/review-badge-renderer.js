/**
 * NV-1100-P5C — Review Badge Renderer
 *
 * Stateless helpers for rendering deterministic review badges and
 * action buttons for artifacts. All decisions are derived from the
 * scheduler's deterministic state — no mastery inference.
 *
 * Badge priority (highest first):
 *   Review Due > Reviewed Today > Scheduled > No Review Scheduled
 *
 * The renderer is presentation-only. The scheduler is the source of truth.
 */

import { statusOf, formatRelative, REVIEW_STATUS, makeReviewId } from './review-utils.js';

export const BADGE_STATE = Object.freeze({
  DUE: 'due',
  REVIEWED_TODAY: 'reviewed-today',
  SCHEDULED: 'scheduled',
  NONE: 'none'
});

export const BADGE_LABELS = Object.freeze({
  [BADGE_STATE.DUE]: 'Review Due',
  [BADGE_STATE.REVIEWED_TODAY]: 'Reviewed Today',
  [BADGE_STATE.SCHEDULED]: 'Scheduled',
  [BADGE_STATE.NONE]: 'No Review Scheduled'
});

export const BADGE_VARIANTS = Object.freeze({
  [BADGE_STATE.DUE]: 'warning',
  [BADGE_STATE.REVIEWED_TODAY]: 'success',
  [BADGE_STATE.SCHEDULED]: 'neutral',
  [BADGE_STATE.NONE]: 'muted'
});

export const ACTION_LABELS = Object.freeze({
  due: 'Review Now',
  scheduled: 'Review Early',
  'reviewed-today': 'Reviewed Today',
  none: 'Add To Review Queue'
});

function safeText(s) {
  return String(s == null ? '' : s);
}

function formatDate(iso) {
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString();
  } catch (e) { return '—'; }
}

function isTodayIso(iso) {
  if (!iso) return false;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return false;
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
}

export function getBadgeState(artifactId, type, scheduler, nowIso) {
  const id = safeText(artifactId);
  if (!id || !scheduler) return BADGE_STATE.NONE;
  const reviewId = makeReviewId(type || 'artifact', id);
  const state = scheduler.getItemByReviewId(reviewId);
  if (!state) return BADGE_STATE.NONE;
  const status = statusOf(state, nowIso);
  if (status === REVIEW_STATUS.OVERDUE || status === REVIEW_STATUS.DUE_TODAY) return BADGE_STATE.DUE;
  if (status === REVIEW_STATUS.REVIEWED_TODAY) return BADGE_STATE.REVIEWED_TODAY;
  if (status === REVIEW_STATUS.UPCOMING) return BADGE_STATE.SCHEDULED;
  return BADGE_STATE.NONE;
}

export function renderBadge(artifactId, type, scheduler, options) {
  const opts = options || {};
  const state = getBadgeState(artifactId, type, scheduler, opts.nowIso);
  const label = BADGE_LABELS[state];
  const variant = BADGE_VARIANTS[state];
  const ariaLabel = opts.ariaLabel || `Review status: ${label}`;
  return `<span class="nv-badge nv-review-badge" data-review-badge data-review-badge-state="${state}" data-review-variant="${variant}" role="status" aria-label="${ariaLabel}">${label}</span>`;
}

export function renderActionButton(artifactId, type, scheduler, options) {
  const opts = options || {};
  const state = getBadgeState(artifactId, type, scheduler, opts.nowIso);
  const actionKey = state === BADGE_STATE.DUE ? 'due'
    : state === BADGE_STATE.SCHEDULED ? 'scheduled'
    : state === BADGE_STATE.REVIEWED_TODAY ? 'reviewed-today'
    : 'none';
  const label = ACTION_LABELS[actionKey];
  const disabled = actionKey === 'reviewed-today' ? ' disabled aria-disabled="true"' : '';
  const aria = actionKey === 'reviewed-today'
    ? `Review action: ${label} (informational only)`
    : `Review action: ${label}`;
  return `<button type="button" class="nv-button nv-review-action" data-review-action data-review-state="${actionKey}" data-review-target-id="${safeText(artifactId)}" data-review-target-type="${safeText(type || 'artifact')}" aria-label="${aria}"${disabled}>${label}</button>`;
}

export function renderMetadataRows(artifactId, type, scheduler) {
  const id = safeText(artifactId);
  if (!id || !scheduler) {
    return [
      { label: 'Review Status', value: '—' },
      { label: 'Next Review', value: '—' },
      { label: 'Last Review', value: '—' },
      { label: 'Repetitions', value: '—' },
      { label: 'Interval', value: '—' },
      { label: 'Ease Factor', value: '—' }
    ];
  }
  const reviewId = makeReviewId(type || 'artifact', id);
  const state = scheduler.getItemByReviewId(reviewId);
  if (!state) {
    return [
      { label: 'Review Status', value: 'No review scheduled' },
      { label: 'Next Review', value: '—' },
      { label: 'Last Review', value: '—' },
      { label: 'Repetitions', value: '—' },
      { label: 'Interval', value: '—' },
      { label: 'Ease Factor', value: '—' }
    ];
  }
  const status = statusOf(state);
  let statusText = 'No review scheduled';
  if (status === REVIEW_STATUS.OVERDUE) statusText = 'Overdue';
  else if (status === REVIEW_STATUS.DUE_TODAY) statusText = 'Due today';
  else if (status === REVIEW_STATUS.REVIEWED_TODAY) statusText = 'Reviewed today';
  else if (status === REVIEW_STATUS.UPCOMING) statusText = 'Scheduled';

  return [
    { label: 'Review Status', value: statusText },
    { label: 'Next Review', value: formatDate(state.nextReview) },
    { label: 'Last Review', value: formatDate(state.lastReviewed) },
    { label: 'Repetitions', value: safeText(state.repetitions || 0) },
    { label: 'Interval', value: `${safeText(state.interval || 0)} days` },
    { label: 'Ease Factor', value: (Number(state.easeFactor) || 0).toFixed(2) }
  ];
}

export function renderMetadataPanel(artifactId, type, scheduler, options) {
  const opts = options || {};
  const heading = opts.heading || 'Review';
  const rows = renderMetadataRows(artifactId, type, scheduler);
  const rowHtml = rows.map(r => `
    <div class="nv-review-meta-row">
      <dt>${safeText(r.label)}</dt>
      <dd>${safeText(r.value)}</dd>
    </div>
  `).join('');
  return `<section class="nv-review-meta-panel" data-review-meta data-review-target-id="${safeText(artifactId)}" data-review-target-type="${safeText(type || 'artifact')}" aria-labelledby="nv-review-meta-heading-${safeText(artifactId)}">
    <h3 id="nv-review-meta-heading-${safeText(artifactId)}" class="nv-review-meta-panel__title">${safeText(heading)}</h3>
    <dl class="nv-review-meta-panel__list">${rowHtml}</dl>
  </section>`;
}

export function renderBadgeAndAction(artifactId, type, scheduler, options) {
  const badge = renderBadge(artifactId, type, scheduler, options);
  const action = renderActionButton(artifactId, type, scheduler, options);
  return `<div class="nv-review-badge-group" data-review-group>${badge}${action}</div>`;
}

export const REVIEW_BADGE_RENDERER = {
  BADGE_STATE, BADGE_LABELS, BADGE_VARIANTS, ACTION_LABELS,
  getBadgeState, renderBadge, renderActionButton, renderMetadataRows, renderMetadataPanel, renderBadgeAndAction
};

export default REVIEW_BADGE_RENDERER;

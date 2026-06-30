/**
 * NV-1100-P5 — Review Dashboard
 *
 * Renders the workspace "Today's Reviews" card and any review dashboard
 * surfaces. All rendering is non-invasive: it queries existing DOM
 * containers, never injects if they are missing.
 */

import { createReviewQueue } from './review-queue.js';
import { createReviewScheduler } from './review-scheduler.js';
import { formatRelative, REVIEW_STATUS, todayBounds } from './review-utils.js';

export function createReviewDashboard() {
  const queue = createReviewQueue();
  const scheduler = createReviewScheduler();

  function getElements(root) {
    const r = root || (typeof document !== 'undefined' ? document.body : null);
    return {
      card: r.querySelector('[data-review-dashboard]'),
      dueToday: r.querySelector('[data-review-dashboard-due-today]'),
      overdue: r.querySelector('[data-review-dashboard-overdue]'),
      reviewedToday: r.querySelector('[data-review-dashboard-reviewed-today]'),
      nextReview: r.querySelector('[data-review-dashboard-next]'),
      nextItem: r.querySelector('[data-review-dashboard-next-item]'),
      nextTime: r.querySelector('[data-review-dashboard-next-time]'),
      startAction: r.querySelector('[data-review-dashboard-start]'),
      continueAction: r.querySelector('[data-review-dashboard-continue]'),
      skipAction: r.querySelector('[data-review-dashboard-skip]'),
      upcomingList: r.querySelector('[data-review-dashboard-upcoming]'),
      emptyState: r.querySelector('[data-review-dashboard-empty]')
    };
  }

  function render(root, options) {
    const els = getElements(root);
    if (!els.card) return { rendered: false };
    const prefs = scheduler.getPreferences();
    const schedule = scheduler.getAll();
    const summary = queue.summary(schedule, { preferences: prefs });
    const list = queue.listFromSchedule(schedule, { preferences: prefs });
    const next = summary.nextScheduled;

    if (els.dueToday) els.dueToday.textContent = String(summary.dueToday);
    if (els.overdue) els.overdue.textContent = String(summary.overdue);
    if (els.reviewedToday) els.reviewedToday.textContent = String(summary.reviewedToday);
    if (els.nextItem) {
      els.nextItem.textContent = next ? (next.id || next.entityId || 'Item') : 'Nothing scheduled';
    }
    if (els.nextTime) {
      els.nextTime.textContent = next && next.nextReview ? formatRelative(next.nextReview) : '—';
    }
    if (els.upcomingList) {
      const upcoming = list.buckets.upcoming.slice(0, 5);
      els.upcomingList.innerHTML = '';
      if (upcoming.length === 0) {
        const li = document.createElement('li');
        li.className = 'nv-muted';
        li.textContent = 'No upcoming reviews scheduled.';
        els.upcomingList.appendChild(li);
      } else {
        for (const item of upcoming) {
          const li = document.createElement('li');
          li.textContent = `${item.id} — ${formatRelative(item.nextReview)}`;
          els.upcomingList.appendChild(li);
        }
      }
    }
    if (els.emptyState) {
      const isEmpty = summary.overdue === 0 && summary.dueToday === 0;
      els.emptyState.hidden = !isEmpty;
    }
    if (els.startAction) {
      els.startAction.disabled = !next;
      els.startAction.setAttribute('aria-label', next ? `Start review session with ${list.ordered.length} item(s)` : 'No items to review');
    }
    return { rendered: true, summary, list };
  }

  return { render, queue, scheduler };
}

export const REVIEW_DASHBOARD_FACTORY = createReviewDashboard;

export default createReviewDashboard;

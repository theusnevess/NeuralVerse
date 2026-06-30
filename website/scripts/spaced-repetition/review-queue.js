/**
 * NV-1100-P5 — Review Queue
 *
 * Generates deterministic, stable-sorted review queues from the schedule.
 * Categories:
 *   - overdue:   nextReview strictly before the start of today
 *   - dueToday:  nextReview on today's date
 *   - upcoming:  nextReview after today
 *   - reviewedToday: lastReviewed on today's date
 *   - new:       lastReviewed is null
 *
 * Ordering: nextReview ASC, lastReviewed ASC, id ASC
 */

import { SM2 } from './sm2-engine.js';
import { statusOf, REVIEW_STATUS, todayBounds } from './review-utils.js';

function stableCompare(a, b) {
  if (a.nextReview !== b.nextReview) {
    return a.nextReview < b.nextReview ? -1 : 1;
  }
  const al = a.lastReviewed || '';
  const bl = b.lastReviewed || '';
  if (al !== bl) return al < bl ? -1 : 1;
  if (a.id !== b.id) return a.id < b.id ? -1 : 1;
  return 0;
}

export function createReviewQueue() {
  function listFromSchedule(schedule, options) {
    const nowIso = (options && options.nowIso) || new Date().toISOString();
    const prefs = (options && options.preferences) || {};
    const includeFlashcards = prefs.includeFlashcards !== false;
    const includeArtifacts = prefs.includeArtifacts !== false;
    const dailyLimit = Number(prefs.dailyLimit) > 0 ? Math.floor(prefs.dailyLimit) : Infinity;
    const showOverdueFirst = prefs.showOverdueFirst !== false;

    const all = Object.values(schedule || {})
      .filter((s) => s && s.id)
      .filter((s) => (s.type === 'flashcard' && includeFlashcards) || (s.type === 'artifact' && includeArtifacts));

    const buckets = {
      overdue: [],
      dueToday: [],
      upcoming: [],
      reviewedToday: [],
      new: []
    };

    for (const s of all) {
      const status = statusOf(s, nowIso);
      // statusOf returns 'never' for items with no lastReviewed; the queue
      // tracks those in the `new` bucket.
      const bucketKey = status === 'never' ? 'new' : status;
      if (buckets[bucketKey]) buckets[bucketKey].push(s);
    }

    Object.values(buckets).forEach((arr) => arr.sort(stableCompare));

    const ordered = [];
    if (showOverdueFirst) {
      ordered.push(...buckets.overdue);
      ordered.push(...buckets.dueToday);
      ordered.push(...buckets.reviewedToday);
      ordered.push(...buckets.new);
      ordered.push(...buckets.upcoming);
    } else {
      ordered.push(...buckets.dueToday);
      ordered.push(...buckets.overdue);
      ordered.push(...buckets.reviewedToday);
      ordered.push(...buckets.new);
      ordered.push(...buckets.upcoming);
    }

    const capped = Number.isFinite(dailyLimit) ? ordered.slice(0, dailyLimit) : ordered;
    return { buckets, ordered: capped, total: ordered.length, capped: ordered.length > capped.length };
  }

  function summary(schedule, options) {
    const result = listFromSchedule(schedule, options);
    const { end } = todayBounds(options && options.nowIso);
    const now = new Date((options && options.nowIso) || new Date().toISOString()).getTime();
    const upcomingSoon = result.buckets.upcoming.filter((s) => {
      if (!s.nextReview) return false;
      const t = new Date(s.nextReview).getTime();
      return t >= end && t < end + 7 * 24 * 60 * 60 * 1000;
    });
    return {
      dueToday: result.buckets.dueToday.length,
      overdue: result.buckets.overdue.length,
      reviewedToday: result.buckets.reviewedToday.length,
      newCount: result.buckets.new.length,
      upcomingSoon: upcomingSoon.length,
      totalScheduled: Object.values(schedule || {}).length,
      nextScheduled: result.ordered[0] || null,
      generatedAt: new Date(now).toISOString()
    };
  }

  function activeSessionItems(schedule, options) {
    const { ordered, buckets } = listFromSchedule(schedule, options);
    return {
      activeItems: ordered,
      overdue: buckets.overdue,
      dueToday: buckets.dueToday
    };
  }

  return { listFromSchedule, summary, activeSessionItems, REVIEW_STATUS };
}

export const REVIEW_QUEUE_FACTORY = createReviewQueue;

export default createReviewQueue;

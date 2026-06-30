/**
 * Semantic Learning Intelligence — Review Bridge
 * Connects semantic engine to the Spaced Repetition system (P5).
 * Informational only. No mastery inference.
 *
 * NV-1100-P9
 */
(function () {
  'use strict';

  function getScheduler() {
    return window.NeuralVerse?.reviewScheduler || null;
  }

  function getQueue() {
    return window.NeuralVerse?.reviewQueue || null;
  }

  function getDueReviews(conceptId) {
    var scheduler = getScheduler();
    if (!scheduler) return [];

    var schedule = scheduler.getAll();
    var result = [];
    var reviewIds = Object.keys(schedule);
    for (var i = 0; i < reviewIds.length; i++) {
      var reviewId = reviewIds[i];
      var state = schedule[reviewId];
      if (!state) continue;

      // Check if review ID contains the concept ID
      if (reviewId.indexOf(conceptId) !== -1) {
        result.push({
          id: reviewId,
          name: reviewId,
          type: 'review',
          reason: 'Review associated with concept: ' + conceptId,
          relationship: 'review_association',
          isDue: state.nextReview ? new Date(state.nextReview) <= new Date() : false,
          nextReview: state.nextReview,
          deterministic: true
        });
      }
    }
    return result;
  }

  function getReviewSummary(conceptId) {
    var reviews = getDueReviews(conceptId);
    var dueCount = 0;
    for (var i = 0; i < reviews.length; i++) {
      if (reviews[i].isDue) dueCount++;
    }
    return {
      conceptId: conceptId,
      totalReviews: reviews.length,
      dueReviews: dueCount,
      deterministic: true
    };
  }

  window.NeuralVerse = window.NeuralVerse || {};
  window.NeuralVerse.SemanticReviewBridge = {
    getDueReviews: getDueReviews,
    getReviewSummary: getReviewSummary
  };
})();

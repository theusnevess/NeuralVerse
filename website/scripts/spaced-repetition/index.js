/**
 * NV-1100-P5 — Spaced Repetition Engine
 *
 * Entry point. Wires the SM-2 engine, scheduler, queue, controller, and
 * dashboard. Exposes them under window.NeuralVerse.
 */

import { SM2 } from './sm2-engine.js';
import { createReviewScheduler } from './review-scheduler.js';
import { createReviewQueue } from './review-queue.js';
import { createReviewController } from './review-controller.js';
import { createReviewDashboard } from './review-dashboard.js';
import { createReviewSession } from './review-session.js';
import { createReviewSessionController } from './review-session-controller.js';
import { createReviewSettingsController } from './review-settings-controller.js';
import * as ReviewBadgeRenderer from './review-badge-renderer.js';
import * as ReviewDiscovery from './review-discovery.js';
import { ReviewStorage } from './review-storage.js';
import {
  REVIEW_TYPE,
  QUALITY,
  UI_GRADE_LABELS,
  REVIEW_STATUS,
  statusOf,
  formatRelative,
  makeReviewId,
  parseReviewId,
  todayBounds,
  isToday,
  DEFAULT_PREFERENCES
} from './review-utils.js';

let _installed = false;

export function installSpacedRepetition(options) {
  if (_installed && (!options || !options.force)) {
    return {
      sm2Engine: SM2,
      reviewScheduler: window.NeuralVerse?.reviewScheduler,
      reviewQueue: window.NeuralVerse?.reviewQueue,
      reviewController: window.NeuralVerse?.reviewController,
      reviewDashboard: window.NeuralVerse?.reviewDashboard,
      reviewSession: window.NeuralVerse?.reviewSession,
      reviewSessionController: window.NeuralVerse?.reviewSessionController,
      reviewBadgeRenderer: ReviewBadgeRenderer,
      reviewDiscovery: ReviewDiscovery,
      reviewStorage: ReviewStorage
    };
  }
  const scheduler = createReviewScheduler();
  const queue = createReviewQueue();
  const controller = createReviewController({ scheduler, queue });
  const dashboard = createReviewDashboard();
  const sessionController = createReviewSessionController({ scheduler, queue });

  if (typeof window !== 'undefined') {
    window.NeuralVerse = window.NeuralVerse || {};
    window.NeuralVerse.sm2Engine = SM2;
    window.NeuralVerse.reviewScheduler = scheduler;
    window.NeuralVerse.reviewQueue = queue;
    window.NeuralVerse.reviewController = controller;
    window.NeuralVerse.reviewDashboard = dashboard;
    window.NeuralVerse.reviewSession = createReviewSession;
    window.NeuralVerse.reviewSessionController = sessionController;
    window.NeuralVerse.reviewBadgeRenderer = ReviewBadgeRenderer;
    window.NeuralVerse.reviewDiscovery = ReviewDiscovery;
    window.NeuralVerse.reviewStorage = ReviewStorage;
  }

  scheduler.initialize();
  _installed = true;

  return {
    sm2Engine: SM2,
    reviewScheduler: scheduler,
    reviewQueue: queue,
    reviewController: controller,
    reviewDashboard: dashboard,
    reviewSession: createReviewSession,
    reviewSessionController: sessionController,
    reviewBadgeRenderer: ReviewBadgeRenderer,
    reviewDiscovery: ReviewDiscovery,
    reviewStorage: ReviewStorage
  };
}

export {
  SM2,
  ReviewStorage,
  ReviewBadgeRenderer,
  ReviewDiscovery,
  REVIEW_TYPE,
  QUALITY,
  UI_GRADE_LABELS,
  REVIEW_STATUS,
  statusOf,
  formatRelative,
  makeReviewId,
  parseReviewId,
  todayBounds,
  isToday,
  DEFAULT_PREFERENCES,
  createReviewScheduler,
  createReviewQueue,
  createReviewController,
  createReviewDashboard,
  createReviewSession,
  createReviewSessionController,
  createReviewSettingsController
};

export default installSpacedRepetition;

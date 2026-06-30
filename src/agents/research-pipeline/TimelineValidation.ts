/**
 * NV-1400-D2-OPT-04 — Timeline Validation Layer
 *
 * Deterministic validation for research timeline metadata.
 * Returns structured errors, never exceptions for expected validation failures.
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import type {
  ResearchTimelineEvent,
  ResearchTimeline,
  ResearchArtifactWithTimeline,
  ResearchTimelineValidationError,
  ResearchTimelineValidationResult,
  ResearchTimelineInput,
} from './ResearchAgentContract.ts';

import {
  CANONICAL_TIMELINE_EVENT_TYPES,
} from './ResearchAgentContract.ts';

// ---------------------------------------------------------------------------
// Validation Error Codes
// ---------------------------------------------------------------------------

export const TIMELINE_VALIDATION_CODES = {
  TIMELINE_UNKNOWN_EVENT: 'TIMELINE_UNKNOWN_EVENT',
  TIMELINE_DUPLICATE_EVENT: 'TIMELINE_DUPLICATE_EVENT',
  TIMELINE_INVALID_DATE: 'TIMELINE_INVALID_DATE',
  TIMELINE_INVALID_ORDER: 'TIMELINE_INVALID_ORDER',
  TIMELINE_MISSING_REFERENCE: 'TIMELINE_MISSING_REFERENCE',
  TIMELINE_MISSING_PROVENANCE: 'TIMELINE_MISSING_PROVENANCE',
  TIMELINE_INVALID_STATUS: 'TIMELINE_INVALID_STATUS',
  TIMELINE_EMPTY: 'TIMELINE_EMPTY',
  TIMELINE_UNSUPPORTED_EVENT: 'TIMELINE_UNSUPPORTED_EVENT',
  TIMELINE_BROKEN_SEQUENCE: 'TIMELINE_BROKEN_SEQUENCE',
} as const;

// ---------------------------------------------------------------------------
// Event Validation
// ---------------------------------------------------------------------------

/**
 * Validates a single timeline event.
 * Pure function. No side effects.
 */
export function validateTimelineEvent(
  event: ResearchTimelineEvent,
): readonly ResearchTimelineValidationError[] {
  const errors: ResearchTimelineValidationError[] = [];

  if (!event.eventId || event.eventId.trim() === '') {
    errors.push({
      code: TIMELINE_VALIDATION_CODES.TIMELINE_MISSING_REFERENCE,
      message: 'Timeline event is missing an event ID.',
      field: 'eventId',
      eventId: event.eventId,
    });
  }

  if (!CANONICAL_TIMELINE_EVENT_TYPES.includes(event.eventType)) {
    errors.push({
      code: TIMELINE_VALIDATION_CODES.TIMELINE_UNKNOWN_EVENT,
      message: `Timeline event has unknown event type: "${event.eventType}".`,
      field: 'eventType',
      eventId: event.eventId,
    });
  }

  if (!event.referenceId || event.referenceId.trim() === '') {
    errors.push({
      code: TIMELINE_VALIDATION_CODES.TIMELINE_MISSING_REFERENCE,
      message: 'Timeline event is missing a reference ID.',
      field: 'referenceId',
      eventId: event.eventId,
    });
  }

  if (!event.title || event.title.trim() === '') {
    errors.push({
      code: TIMELINE_VALIDATION_CODES.TIMELINE_MISSING_REFERENCE,
      message: 'Timeline event is missing a title.',
      field: 'title',
      eventId: event.eventId,
    });
  }

  if (typeof event.publicationYear !== 'number' || event.publicationYear < 0) {
    errors.push({
      code: TIMELINE_VALIDATION_CODES.TIMELINE_INVALID_DATE,
      message: 'Timeline event has invalid publication year.',
      field: 'publicationYear',
      eventId: event.eventId,
    });
  }

  if (event.publicationMonth !== undefined && (event.publicationMonth < 1 || event.publicationMonth > 12)) {
    errors.push({
      code: TIMELINE_VALIDATION_CODES.TIMELINE_INVALID_DATE,
      message: 'Timeline event has invalid publication month.',
      field: 'publicationMonth',
      eventId: event.eventId,
    });
  }

  if (event.publicationDay !== undefined && (event.publicationDay < 1 || event.publicationDay > 31)) {
    errors.push({
      code: TIMELINE_VALIDATION_CODES.TIMELINE_INVALID_DATE,
      message: 'Timeline event has invalid publication day.',
      field: 'publicationDay',
      eventId: event.eventId,
    });
  }

  if (!event.provenance || typeof event.provenance !== 'object') {
    errors.push({
      code: TIMELINE_VALIDATION_CODES.TIMELINE_MISSING_PROVENANCE,
      message: 'Timeline event is missing provenance.',
      field: 'provenance',
      eventId: event.eventId,
    });
  } else {
    if (!event.provenance.rationale || event.provenance.rationale.trim() === '') {
      errors.push({
        code: TIMELINE_VALIDATION_CODES.TIMELINE_MISSING_PROVENANCE,
        message: 'Timeline event provenance is missing rationale.',
        field: 'provenance.rationale',
        eventId: event.eventId,
      });
    }
    if (!event.provenance.source || event.provenance.source.trim() === '') {
      errors.push({
        code: TIMELINE_VALIDATION_CODES.TIMELINE_MISSING_PROVENANCE,
        message: 'Timeline event provenance is missing source.',
        field: 'provenance.source',
        eventId: event.eventId,
      });
    }
  }

  if (!event.governanceStatus || event.governanceStatus.trim() === '') {
    errors.push({
      code: TIMELINE_VALIDATION_CODES.TIMELINE_INVALID_STATUS,
      message: 'Timeline event is missing governance status.',
      field: 'governanceStatus',
      eventId: event.eventId,
    });
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Timeline Validation
// ---------------------------------------------------------------------------

/**
 * Validates a timeline for structural integrity.
 * Pure function. No side effects.
 */
export function validateTimeline(
  timeline: ResearchTimeline,
): readonly ResearchTimelineValidationError[] {
  const errors: ResearchTimelineValidationError[] = [];

  if (!timeline.timelineId || timeline.timelineId.trim() === '') {
    errors.push({
      code: TIMELINE_VALIDATION_CODES.TIMELINE_MISSING_REFERENCE,
      message: 'Timeline is missing a timeline ID.',
      field: 'timelineId',
    });
  }

  // Check for empty timeline
  if (!timeline.events || timeline.events.length === 0) {
    errors.push({
      code: TIMELINE_VALIDATION_CODES.TIMELINE_EMPTY,
      message: 'Timeline has no events.',
      field: 'events',
    });
  }

  if (!timeline.nodes || timeline.nodes.length === 0) {
    errors.push({
      code: TIMELINE_VALIDATION_CODES.TIMELINE_EMPTY,
      message: 'Timeline has no nodes.',
      field: 'nodes',
    });
  }

  // Validate all events
  if (timeline.events) {
    for (const event of timeline.events) {
      errors.push(...validateTimelineEvent(event));
    }
  }

  // Check for duplicate events
  if (timeline.events) {
    const seenEvents = new Set<string>();
    for (const event of timeline.events) {
      if (seenEvents.has(event.eventId)) {
        errors.push({
          code: TIMELINE_VALIDATION_CODES.TIMELINE_DUPLICATE_EVENT,
          message: `Duplicate event ID: "${event.eventId}".`,
          eventId: event.eventId,
        });
      }
      seenEvents.add(event.eventId);
    }
  }

  // Check for chronological ordering
  if (timeline.events && timeline.events.length > 1) {
    for (let i = 1; i < timeline.events.length; i++) {
      const prev = timeline.events[i - 1];
      const curr = timeline.events[i];

      if (curr.publicationYear < prev.publicationYear) {
        errors.push({
          code: TIMELINE_VALIDATION_CODES.TIMELINE_INVALID_ORDER,
          message: `Event "${curr.eventId}" has earlier publication year than "${prev.eventId}".`,
          eventId: curr.eventId,
        });
      }
    }
  }

  // Check for broken sequence (nodes should match events)
  if (timeline.events && timeline.nodes) {
    if (timeline.events.length !== timeline.nodes.length) {
      errors.push({
        code: TIMELINE_VALIDATION_CODES.TIMELINE_BROKEN_SEQUENCE,
        message: 'Timeline events and nodes have different counts.',
      });
    }
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Artifact Validation
// ---------------------------------------------------------------------------

/**
 * Validates a research artifact with timeline.
 * Pure function. No side effects.
 */
export function validateResearchArtifactWithTimeline(
  artifact: ResearchArtifactWithTimeline,
): ResearchTimelineValidationResult {
  const errors: ResearchTimelineValidationError[] = [];

  if (!artifact.artifactId || artifact.artifactId.trim() === '') {
    errors.push({
      code: TIMELINE_VALIDATION_CODES.TIMELINE_MISSING_REFERENCE,
      message: 'Research artifact is missing an artifact ID.',
      field: 'artifactId',
    });
  }

  // Validate timeline
  errors.push(...validateTimeline(artifact.timeline));

  // Validate trace
  if (!artifact.timelineTrace || typeof artifact.timelineTrace !== 'object') {
    errors.push({
      code: TIMELINE_VALIDATION_CODES.TIMELINE_MISSING_PROVENANCE,
      message: 'Research artifact is missing timeline trace.',
      field: 'timelineTrace',
    });
  } else {
    if (artifact.timelineTrace.deterministic !== true) {
      errors.push({
        code: TIMELINE_VALIDATION_CODES.TIMELINE_MISSING_PROVENANCE,
        message: 'Timeline trace must declare deterministic: true.',
        field: 'timelineTrace.deterministic',
      });
    }
    if (artifact.timelineTrace.randomUsed !== false) {
      errors.push({
        code: TIMELINE_VALIDATION_CODES.TIMELINE_MISSING_PROVENANCE,
        message: 'Timeline trace must declare randomUsed: false.',
        field: 'timelineTrace.randomUsed',
      });
    }
    if (artifact.timelineTrace.timeDependency !== false) {
      errors.push({
        code: TIMELINE_VALIDATION_CODES.TIMELINE_MISSING_PROVENANCE,
        message: 'Timeline trace must declare timeDependency: false.',
        field: 'timelineTrace.timeDependency',
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'timeline_composition',
  };
}

// ---------------------------------------------------------------------------
// Input Validation
// ---------------------------------------------------------------------------

/**
 * Validates research timeline input.
 * Pure function. No side effects.
 */
export function validateTimelineInput(
  input: ResearchTimelineInput,
): readonly ResearchTimelineValidationError[] {
  const errors: ResearchTimelineValidationError[] = [];

  if (!input.conceptId || input.conceptId.trim() === '') {
    errors.push({
      code: TIMELINE_VALIDATION_CODES.TIMELINE_MISSING_REFERENCE,
      message: 'Timeline input is missing concept ID.',
      field: 'conceptId',
    });
  }

  if (!input.conceptLabel || input.conceptLabel.trim() === '') {
    errors.push({
      code: TIMELINE_VALIDATION_CODES.TIMELINE_MISSING_REFERENCE,
      message: 'Timeline input is missing concept label.',
      field: 'conceptLabel',
    });
  }

  if (!input.events || input.events.length === 0) {
    errors.push({
      code: TIMELINE_VALIDATION_CODES.TIMELINE_EMPTY,
      message: 'Timeline input has no events.',
      field: 'events',
    });
  } else {
    for (const event of input.events) {
      errors.push(...validateTimelineEvent(event));
    }
  }

  return errors;
}

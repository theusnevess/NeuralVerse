/**
 * NV-1400-D2-OPT-04 — Research Timeline Orchestration Kernel
 *
 * Deterministic orchestration functions for research timeline metadata.
 * Produces timelines, events, nodes, and traces.
 *
 * This module never:
 * - Infers chronology
 * - Retrieves papers
 * - Generates text
 * - Calls external APIs
 * - Creates inferred ordering
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import type {
  ResearchTimelineEvent,
  ResearchTimelineNode,
  ResearchTimeline,
  ResearchTimelineDecision,
  ResearchTimelineTrace,
  ResearchTimelineInput,
  ResearchArtifactWithTimeline,
  ResearchTimelineEventType,
  ResearchTimelineProvenance,
  ResearchChronologicalReference,
  ResearchGovernanceStatus,
} from './ResearchAgentContract.ts';

import {
  CANONICAL_TIMELINE_EVENT_TYPES,
} from './ResearchAgentContract.ts';

// ---------------------------------------------------------------------------
// Timeline Event Composition
// ---------------------------------------------------------------------------

/**
 * Composes a timeline event.
 * Pure function. No side effects.
 */
export function composeTimelineEvent(
  eventId: string,
  eventType: ResearchTimelineEventType,
  referenceId: string,
  title: string,
  publicationYear: number,
  provenance: ResearchTimelineProvenance,
  governanceStatus: ResearchGovernanceStatus,
  publicationMonth?: number,
  publicationDay?: number,
): ResearchTimelineEvent {
  return {
    eventId,
    eventType,
    referenceId,
    title,
    publicationYear,
    publicationMonth,
    publicationDay,
    provenance,
    governanceStatus,
  };
}

// ---------------------------------------------------------------------------
// Timeline Provenance Composition
// ---------------------------------------------------------------------------

/**
 * Composes timeline provenance.
 * Pure function. No side effects.
 */
export function composeTimelineProvenance(
  referenceId: string,
  eventType: ResearchTimelineEventType,
  source: string,
  governanceStatus: ResearchGovernanceStatus,
  publicationYear: number,
  rationale: string,
  publicationMonth?: number,
  publicationDay?: number,
): ResearchTimelineProvenance {
  return {
    referenceId,
    eventType,
    source,
    governanceStatus,
    publicationYear,
    publicationMonth,
    publicationDay,
    rationale,
  };
}

// ---------------------------------------------------------------------------
// Timeline Node Composition
// ---------------------------------------------------------------------------

/**
 * Composes a timeline node from an event.
 * Pure function. No side effects.
 */
export function composeTimelineNode(
  nodeId: string,
  event: ResearchTimelineEvent,
): ResearchTimelineNode {
  return {
    nodeId,
    referenceId: event.referenceId,
    title: event.title,
    eventType: event.eventType,
    publicationYear: event.publicationYear,
    publicationMonth: event.publicationMonth,
    publicationDay: event.publicationDay,
    governanceStatus: event.governanceStatus,
  };
}

// ---------------------------------------------------------------------------
// Timeline Composition
// ---------------------------------------------------------------------------

/**
 * Composes a timeline from events.
 * Pure function. No side effects.
 */
export function composeTimeline(
  timelineId: string,
  events: readonly ResearchTimelineEvent[],
): ResearchTimeline {
  const sortedEvents = _sortEventsChronologically(events);
  const nodes = sortedEvents.map((event, index) =>
    composeTimelineNode(`node-${index}`, event),
  );

  return {
    timelineId,
    events: [...sortedEvents],
    nodes: [...nodes],
    deterministic: true,
    generatedFrom: 'deterministic_timeline_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Research Timeline Composition
// ---------------------------------------------------------------------------

/**
 * Composes research timeline from an input.
 * Pure function. No side effects.
 */
export function composeResearchTimeline(
  input: ResearchTimelineInput,
): ResearchArtifactWithTimeline {
  const decisions = _composeDecisions(input);

  const trace: ResearchTimelineTrace = {
    traceId: `_timeline_trace_${input.conceptId}`,
    eventCount: input.events.length,
    validatedCount: decisions.filter((d) => d.validationPassed).length,
    invalidCount: decisions.filter((d) => !d.validationPassed).length,
    decisions,
    deterministic: true,
    generatedFrom: 'deterministic_timeline_kernel',
    randomUsed: false,
    timeDependency: false,
  };

  const timeline = composeTimeline(
    `_timeline_${input.conceptId}`,
    input.events,
  );

  return {
    artifactId: `_timeline_artifact_${input.conceptId}`,
    artifactType: 'concept',
    timeline,
    timelineTrace: trace,
  };
}

/**
 * Composes timeline decisions from input events.
 * Pure function. No side effects.
 */
function _composeDecisions(
  input: ResearchTimelineInput,
): readonly ResearchTimelineDecision[] {
  return input.events.map((event) => {
    const validationErrors = _validateEventForDecision(event);
    const validationPassed = validationErrors.length === 0;

    return {
      decisionId: `_decision_${event.eventId}`,
      eventId: event.eventId,
      eventType: event.eventType,
      validationPassed,
      validationErrors,
    };
  });
}

/**
 * Validates an event for decision composition.
 * Returns validation error codes.
 */
function _validateEventForDecision(event: ResearchTimelineEvent): readonly string[] {
  const errors: string[] = [];

  if (!CANONICAL_TIMELINE_EVENT_TYPES.includes(event.eventType)) {
    errors.push('TIMELINE_UNKNOWN_EVENT');
  }

  if (!event.referenceId || event.referenceId.trim() === '') {
    errors.push('TIMELINE_MISSING_REFERENCE');
  }

  if (!event.title || event.title.trim() === '') {
    errors.push('TIMELINE_MISSING_REFERENCE');
  }

  if (typeof event.publicationYear !== 'number' || event.publicationYear < 0) {
    errors.push('TIMELINE_INVALID_DATE');
  }

  if (event.publicationMonth !== undefined && (event.publicationMonth < 1 || event.publicationMonth > 12)) {
    errors.push('TIMELINE_INVALID_DATE');
  }

  if (event.publicationDay !== undefined && (event.publicationDay < 1 || event.publicationDay > 31)) {
    errors.push('TIMELINE_INVALID_DATE');
  }

  if (!event.provenance || !event.provenance.rationale || event.provenance.rationale.trim() === '') {
    errors.push('TIMELINE_MISSING_PROVENANCE');
  }

  if (!event.governanceStatus || event.governanceStatus.trim() === '') {
    errors.push('TIMELINE_INVALID_STATUS');
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Chronological Sorting
// ---------------------------------------------------------------------------

/**
 * Sorts events chronologically.
 * Deterministic ordering based on publicationYear, publicationMonth, publicationDay.
 * Pure function. No side effects.
 */
function _sortEventsChronologically(
  events: readonly ResearchTimelineEvent[],
): readonly ResearchTimelineEvent[] {
  return [...events].sort((a, b) => {
    // Primary sort by publicationYear
    if (a.publicationYear !== b.publicationYear) {
      return a.publicationYear - b.publicationYear;
    }

    // Secondary sort by publicationMonth (if available)
    const aMonth = a.publicationMonth ?? 0;
    const bMonth = b.publicationMonth ?? 0;
    if (aMonth !== bMonth) {
      return aMonth - bMonth;
    }

    // Tertiary sort by publicationDay (if available)
    const aDay = a.publicationDay ?? 0;
    const bDay = b.publicationDay ?? 0;
    if (aDay !== bDay) {
      return aDay - bDay;
    }

    // Final sort by eventId for deterministic ordering
    return a.eventId.localeCompare(b.eventId);
  });
}

// ---------------------------------------------------------------------------
// Timeline Trace Composition
// ---------------------------------------------------------------------------

/**
 * Composes a timeline trace.
 * Pure function. No side effects.
 */
export function composeTimelineTrace(
  traceId: string,
  decisions: readonly ResearchTimelineDecision[],
): ResearchTimelineTrace {
  return {
    traceId,
    eventCount: decisions.length,
    validatedCount: decisions.filter((d) => d.validationPassed).length,
    invalidCount: decisions.filter((d) => !d.validationPassed).length,
    decisions: [...decisions],
    deterministic: true,
    generatedFrom: 'deterministic_timeline_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Chronological Reference Helpers
// ---------------------------------------------------------------------------

/**
 * Composes a chronological reference.
 * Pure function. No side effects.
 */
export function composeChronologicalReference(
  referenceId: string,
  publicationYear: number,
  publicationMonth?: number,
  publicationDay?: number,
): ResearchChronologicalReference {
  return {
    referenceId,
    publicationYear,
    publicationMonth,
    publicationDay,
  };
}

/**
 * Compares two chronological references.
 * Returns negative if a is earlier, positive if b is earlier.
 * Pure function. No side effects.
 */
export function compareChronologicalReferences(
  a: ResearchChronologicalReference,
  b: ResearchChronologicalReference,
): number {
  if (a.publicationYear !== b.publicationYear) {
    return a.publicationYear - b.publicationYear;
  }

  const aMonth = a.publicationMonth ?? 0;
  const bMonth = b.publicationMonth ?? 0;
  if (aMonth !== bMonth) {
    return aMonth - bMonth;
  }

  const aDay = a.publicationDay ?? 0;
  const bDay = b.publicationDay ?? 0;
  if (aDay !== bDay) {
    return aDay - bDay;
  }

  return a.referenceId.localeCompare(b.referenceId);
}

// ---------------------------------------------------------------------------
// Event Type Helpers
// ---------------------------------------------------------------------------

/**
 * Checks if a timeline event type is supported (in canonical event types).
 */
export function isSupportedTimelineEventType(eventType: string): eventType is ResearchTimelineEventType {
  return CANONICAL_TIMELINE_EVENT_TYPES.includes(eventType as ResearchTimelineEventType);
}

/**
 * Returns all canonical timeline event types.
 */
export function getCanonicalTimelineEventTypes(): readonly ResearchTimelineEventType[] {
  return CANONICAL_TIMELINE_EVENT_TYPES;
}

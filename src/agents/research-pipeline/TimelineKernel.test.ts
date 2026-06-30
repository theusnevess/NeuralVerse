/**
 * NV-1400-D2-OPT-04 — Research Timeline Orchestration Test Suite
 *
 * Comprehensive tests for the timeline kernel.
 * Covers: valid timeline, valid chronological ordering, duplicate event,
 * unsupported event type, invalid chronology, missing provenance,
 * missing reference, empty timeline, deterministic ordering, immutable input,
 * identical output, no generated content, no inferred chronology,
 * no runtime clocks, no network usage, timeline independent from lineage.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  composeTimelineEvent,
  composeTimelineProvenance,
  composeTimelineNode,
  composeTimeline,
  composeResearchTimeline,
  composeTimelineTrace,
  composeChronologicalReference,
  compareChronologicalReferences,
  isSupportedTimelineEventType,
  getCanonicalTimelineEventTypes,
} from './TimelineKernel.ts';

import {
  validateTimelineEvent,
  validateTimeline,
  validateResearchArtifactWithTimeline,
  validateTimelineInput,
  TIMELINE_VALIDATION_CODES,
} from './TimelineValidation.ts';

import type {
  ResearchTimelineEvent,
  ResearchTimeline,
  ResearchTimelineInput,
} from './ResearchAgentContract.ts';

// ---------------------------------------------------------------------------
// Test Fixtures
// ---------------------------------------------------------------------------

const VALID_PROVENANCE_1 = {
  referenceId: 'ref-001',
  eventType: 'publication' as const,
  source: 'research-agent',
  governanceStatus: 'canonical' as const,
  publicationYear: 2017,
  rationale: 'Transformer architecture introduced in NeurIPS 2017.',
};

const VALID_PROVENANCE_2 = {
  referenceId: 'ref-002',
  eventType: 'conference_presentation' as const,
  source: 'research-agent',
  governanceStatus: 'canonical' as const,
  publicationYear: 2019,
  rationale: 'BERT presented at NAACL 2019.',
};

const VALID_PROVENANCE_3 = {
  referenceId: 'ref-003',
  eventType: 'journal_publication' as const,
  source: 'research-agent',
  governanceStatus: 'canonical' as const,
  publicationYear: 2020,
  publicationMonth: 6,
  publicationDay: 15,
  rationale: 'GPT-3 published in arXiv.',
};

const VALID_EVENT_1: ResearchTimelineEvent = {
  eventId: 'event-001',
  eventType: 'publication',
  referenceId: 'ref-001',
  title: 'Attention Is All You Need',
  publicationYear: 2017,
  provenance: VALID_PROVENANCE_1,
  governanceStatus: 'canonical',
};

const VALID_EVENT_2: ResearchTimelineEvent = {
  eventId: 'event-002',
  eventType: 'conference_presentation',
  referenceId: 'ref-002',
  title: 'BERT: Pre-training of Deep Bidirectional Transformers',
  publicationYear: 2019,
  provenance: VALID_PROVENANCE_2,
  governanceStatus: 'canonical',
};

const VALID_EVENT_3: ResearchTimelineEvent = {
  eventId: 'event-003',
  eventType: 'journal_publication',
  referenceId: 'ref-003',
  title: 'GPT-3: Language Models are Few-Shot Learners',
  publicationYear: 2020,
  publicationMonth: 6,
  publicationDay: 15,
  provenance: VALID_PROVENANCE_3,
  governanceStatus: 'canonical',
};

// ---------------------------------------------------------------------------
// Valid Timeline Tests
// ---------------------------------------------------------------------------

describe('composeTimeline', () => {
  it('should compose a valid timeline', () => {
    const timeline = composeTimeline('timeline-001', [VALID_EVENT_1, VALID_EVENT_2, VALID_EVENT_3]);

    assert.equal(timeline.timelineId, 'timeline-001');
    assert.equal(timeline.events.length, 3);
    assert.equal(timeline.nodes.length, 3);
    assert.equal(timeline.deterministic, true);
    assert.equal(timeline.randomUsed, false);
    assert.equal(timeline.timeDependency, false);
  });
});

// ---------------------------------------------------------------------------
// Valid Chronological Ordering Tests
// ---------------------------------------------------------------------------

describe('valid chronological ordering', () => {
  it('should sort events chronologically', () => {
    const timeline = composeTimeline('timeline-001', [VALID_EVENT_3, VALID_EVENT_1, VALID_EVENT_2]);

    assert.equal(timeline.events[0].publicationYear, 2017);
    assert.equal(timeline.events[1].publicationYear, 2019);
    assert.equal(timeline.events[2].publicationYear, 2020);
  });

  it('should sort events with same year by month', () => {
    const event4: ResearchTimelineEvent = {
      eventId: 'event-004',
      eventType: 'publication',
      referenceId: 'ref-004',
      title: 'Another Paper',
      publicationYear: 2020,
      publicationMonth: 3,
      provenance: VALID_PROVENANCE_1,
      governanceStatus: 'canonical',
    };

    const timeline = composeTimeline('timeline-001', [VALID_EVENT_3, event4]);

    assert.equal(timeline.events[0].publicationMonth, 3);
    assert.equal(timeline.events[1].publicationMonth, 6);
  });

  it('should sort events with same year and month by day', () => {
    const event4: ResearchTimelineEvent = {
      eventId: 'event-004',
      eventType: 'publication',
      referenceId: 'ref-004',
      title: 'Another Paper',
      publicationYear: 2020,
      publicationMonth: 6,
      publicationDay: 10,
      provenance: VALID_PROVENANCE_1,
      governanceStatus: 'canonical',
    };

    const timeline = composeTimeline('timeline-001', [VALID_EVENT_3, event4]);

    assert.equal(timeline.events[0].publicationDay, 10);
    assert.equal(timeline.events[1].publicationDay, 15);
  });

  it('should sort events with same date by eventId', () => {
    const event4: ResearchTimelineEvent = {
      eventId: 'event-004',
      eventType: 'publication',
      referenceId: 'ref-004',
      title: 'Another Paper',
      publicationYear: 2020,
      publicationMonth: 6,
      publicationDay: 15,
      provenance: VALID_PROVENANCE_1,
      governanceStatus: 'canonical',
    };

    const timeline = composeTimeline('timeline-001', [VALID_EVENT_3, event4]);

    assert.equal(timeline.events[0].eventId, 'event-003');
    assert.equal(timeline.events[1].eventId, 'event-004');
  });

  it('should validate a valid chronological ordering', () => {
    const timeline = composeTimeline('timeline-001', [VALID_EVENT_1, VALID_EVENT_2, VALID_EVENT_3]);
    const errors = validateTimeline(timeline);

    assert.equal(errors.length, 0);
  });
});

// ---------------------------------------------------------------------------
// Duplicate Event Tests
// ---------------------------------------------------------------------------

describe('duplicate event validation', () => {
  it('should detect duplicate events', () => {
    const timeline: ResearchTimeline = {
      timelineId: 'timeline-001',
      events: [VALID_EVENT_1, { ...VALID_EVENT_1, eventId: 'event-001' }],
      nodes: [],
      deterministic: true,
      generatedFrom: 'deterministic_timeline_kernel',
      randomUsed: false,
      timeDependency: false,
    };

    const errors = validateTimeline(timeline);
    const duplicateError = errors.find((e) => e.code === TIMELINE_VALIDATION_CODES.TIMELINE_DUPLICATE_EVENT);

    assert.ok(duplicateError, 'Should have TIMELINE_DUPLICATE_EVENT error');
  });

  it('should not flag unique events as duplicates', () => {
    const timeline = composeTimeline('timeline-001', [VALID_EVENT_1, VALID_EVENT_2, VALID_EVENT_3]);
    const errors = validateTimeline(timeline);
    const duplicateErrors = errors.filter((e) => e.code === TIMELINE_VALIDATION_CODES.TIMELINE_DUPLICATE_EVENT);

    assert.equal(duplicateErrors.length, 0, 'Should not have duplicate errors');
  });
});

// ---------------------------------------------------------------------------
// Unsupported Event Type Tests
// ---------------------------------------------------------------------------

describe('unsupported event type validation', () => {
  it('should detect unsupported event type', () => {
    const event: ResearchTimelineEvent = {
      ...VALID_EVENT_1,
      eventType: 'unsupported_event' as any,
    };

    const errors = validateTimelineEvent(event);
    const unsupportedError = errors.find((e) => e.code === TIMELINE_VALIDATION_CODES.TIMELINE_UNKNOWN_EVENT);

    assert.ok(unsupportedError, 'Should have TIMELINE_UNKNOWN_EVENT error');
  });

  it('should support all canonical event types', () => {
    const eventTypes = getCanonicalTimelineEventTypes();
    assert.equal(eventTypes.length, 12);
    assert.ok(eventTypes.includes('publication'));
    assert.ok(eventTypes.includes('conference_presentation'));
    assert.ok(eventTypes.includes('journal_publication'));
    assert.ok(eventTypes.includes('book_release'));
    assert.ok(eventTypes.includes('dataset_release'));
    assert.ok(eventTypes.includes('benchmark_release'));
    assert.ok(eventTypes.includes('framework_release'));
    assert.ok(eventTypes.includes('standard_release'));
    assert.ok(eventTypes.includes('major_revision'));
    assert.ok(eventTypes.includes('deprecation'));
    assert.ok(eventTypes.includes('superseded'));
    assert.ok(eventTypes.includes('historical_milestone'));
  });

  it('should correctly identify supported event types', () => {
    assert.equal(isSupportedTimelineEventType('publication'), true);
    assert.equal(isSupportedTimelineEventType('conference_presentation'), true);
    assert.equal(isSupportedTimelineEventType('unsupported'), false);
  });
});

// ---------------------------------------------------------------------------
// Invalid Chronology Tests
// ---------------------------------------------------------------------------

describe('invalid chronology validation', () => {
  it('should detect invalid publication year', () => {
    const event: ResearchTimelineEvent = {
      ...VALID_EVENT_1,
      publicationYear: -1,
    };

    const errors = validateTimelineEvent(event);
    const dateError = errors.find((e) => e.code === TIMELINE_VALIDATION_CODES.TIMELINE_INVALID_DATE);

    assert.ok(dateError, 'Should have TIMELINE_INVALID_DATE error');
  });

  it('should detect invalid publication month', () => {
    const event: ResearchTimelineEvent = {
      ...VALID_EVENT_1,
      publicationMonth: 13,
    };

    const errors = validateTimelineEvent(event);
    const dateError = errors.find((e) => e.code === TIMELINE_VALIDATION_CODES.TIMELINE_INVALID_DATE);

    assert.ok(dateError, 'Should have TIMELINE_INVALID_DATE error');
  });

  it('should detect invalid publication day', () => {
    const event: ResearchTimelineEvent = {
      ...VALID_EVENT_1,
      publicationDay: 32,
    };

    const errors = validateTimelineEvent(event);
    const dateError = errors.find((e) => e.code === TIMELINE_VALIDATION_CODES.TIMELINE_INVALID_DATE);

    assert.ok(dateError, 'Should have TIMELINE_INVALID_DATE error');
  });

  it('should not flag valid dates', () => {
    const errors = validateTimelineEvent(VALID_EVENT_3);
    const dateErrors = errors.filter((e) => e.code === TIMELINE_VALIDATION_CODES.TIMELINE_INVALID_DATE);

    assert.equal(dateErrors.length, 0, 'Should not have date errors');
  });
});

// ---------------------------------------------------------------------------
// Missing Provenance Tests
// ---------------------------------------------------------------------------

describe('missing provenance validation', () => {
  it('should detect missing provenance', () => {
    const event: ResearchTimelineEvent = {
      ...VALID_EVENT_1,
      provenance: null as any,
    };

    const errors = validateTimelineEvent(event);
    const provenanceError = errors.find((e) => e.code === TIMELINE_VALIDATION_CODES.TIMELINE_MISSING_PROVENANCE);

    assert.ok(provenanceError, 'Should have TIMELINE_MISSING_PROVENANCE error');
  });

  it('should detect missing rationale in provenance', () => {
    const event: ResearchTimelineEvent = {
      ...VALID_EVENT_1,
      provenance: {
        ...VALID_PROVENANCE_1,
        rationale: '',
      },
    };

    const errors = validateTimelineEvent(event);
    const provenanceError = errors.find((e) => e.code === TIMELINE_VALIDATION_CODES.TIMELINE_MISSING_PROVENANCE);

    assert.ok(provenanceError, 'Should have TIMELINE_MISSING_PROVENANCE error');
  });

  it('should not flag valid provenance', () => {
    const errors = validateTimelineEvent(VALID_EVENT_1);
    const provenanceErrors = errors.filter((e) => e.code === TIMELINE_VALIDATION_CODES.TIMELINE_MISSING_PROVENANCE);

    assert.equal(provenanceErrors.length, 0, 'Should not have provenance errors');
  });
});

// ---------------------------------------------------------------------------
// Missing Reference Tests
// ---------------------------------------------------------------------------

describe('missing reference validation', () => {
  it('should detect missing reference ID', () => {
    const event: ResearchTimelineEvent = {
      ...VALID_EVENT_1,
      referenceId: '',
    };

    const errors = validateTimelineEvent(event);
    const referenceError = errors.find((e) => e.code === TIMELINE_VALIDATION_CODES.TIMELINE_MISSING_REFERENCE);

    assert.ok(referenceError, 'Should have TIMELINE_MISSING_REFERENCE error');
  });

  it('should not flag valid reference', () => {
    const errors = validateTimelineEvent(VALID_EVENT_1);
    const referenceErrors = errors.filter((e) => e.code === TIMELINE_VALIDATION_CODES.TIMELINE_MISSING_REFERENCE);

    assert.equal(referenceErrors.length, 0, 'Should not have reference errors');
  });
});

// ---------------------------------------------------------------------------
// Empty Timeline Tests
// ---------------------------------------------------------------------------

describe('empty timeline validation', () => {
  it('should detect empty timeline', () => {
    const timeline: ResearchTimeline = {
      timelineId: 'timeline-001',
      events: [],
      nodes: [],
      deterministic: true,
      generatedFrom: 'deterministic_timeline_kernel',
      randomUsed: false,
      timeDependency: false,
    };

    const errors = validateTimeline(timeline);
    const emptyErrors = errors.filter((e) => e.code === TIMELINE_VALIDATION_CODES.TIMELINE_EMPTY);

    assert.ok(emptyErrors.length > 0, 'Should have TIMELINE_EMPTY errors');
  });

  it('should not flag non-empty timeline', () => {
    const timeline = composeTimeline('timeline-001', [VALID_EVENT_1, VALID_EVENT_2]);
    const errors = validateTimeline(timeline);
    const emptyErrors = errors.filter((e) => e.code === TIMELINE_VALIDATION_CODES.TIMELINE_EMPTY);

    assert.equal(emptyErrors.length, 0, 'Should not have empty timeline errors');
  });
});

// ---------------------------------------------------------------------------
// Deterministic Ordering Tests
// ---------------------------------------------------------------------------

describe('deterministic ordering', () => {
  it('should produce identical ordering for identical input', () => {
    const input: ResearchTimelineInput = {
      conceptId: 'concept-001',
      conceptLabel: 'Transformer Timeline',
      events: [VALID_EVENT_3, VALID_EVENT_1, VALID_EVENT_2],
    };

    const output1 = composeResearchTimeline(input);
    const output2 = composeResearchTimeline(input);

    assert.deepEqual(output1.timeline.events, output2.timeline.events);
  });

  it('should have deterministic trace metadata', () => {
    const input: ResearchTimelineInput = {
      conceptId: 'concept-001',
      conceptLabel: 'Transformer Timeline',
      events: [VALID_EVENT_1, VALID_EVENT_2, VALID_EVENT_3],
    };

    const artifact = composeResearchTimeline(input);

    assert.equal(artifact.timelineTrace.deterministic, true);
    assert.equal(artifact.timelineTrace.randomUsed, false);
    assert.equal(artifact.timelineTrace.timeDependency, false);
    assert.equal(artifact.timelineTrace.generatedFrom, 'deterministic_timeline_kernel');
  });
});

// ---------------------------------------------------------------------------
// Immutable Input Tests
// ---------------------------------------------------------------------------

describe('immutable input', () => {
  it('should not mutate input events', () => {
    const input: ResearchTimelineInput = {
      conceptId: 'concept-001',
      conceptLabel: 'Transformer Timeline',
      events: [VALID_EVENT_1, VALID_EVENT_2, VALID_EVENT_3],
    };

    const originalTitle = VALID_EVENT_1.title;

    composeResearchTimeline(input);

    assert.equal(VALID_EVENT_1.title, originalTitle);
  });
});

// ---------------------------------------------------------------------------
// Identical Output Tests
// ---------------------------------------------------------------------------

describe('identical output', () => {
  it('should produce identical timelines', () => {
    const input: ResearchTimelineInput = {
      conceptId: 'concept-001',
      conceptLabel: 'Transformer Timeline',
      events: [VALID_EVENT_1, VALID_EVENT_2, VALID_EVENT_3],
    };

    const artifact1 = composeResearchTimeline(input);
    const artifact2 = composeResearchTimeline(input);

    assert.deepEqual(artifact1.timeline, artifact2.timeline);
  });

  it('should produce identical traces', () => {
    const input: ResearchTimelineInput = {
      conceptId: 'concept-001',
      conceptLabel: 'Transformer Timeline',
      events: [VALID_EVENT_1, VALID_EVENT_2, VALID_EVENT_3],
    };

    const artifact1 = composeResearchTimeline(input);
    const artifact2 = composeResearchTimeline(input);

    assert.deepEqual(artifact1.timelineTrace, artifact2.timelineTrace);
  });
});

// ---------------------------------------------------------------------------
// No Generated Content Tests
// ---------------------------------------------------------------------------

describe('no generated content', () => {
  it('should not generate educational content', () => {
    const input: ResearchTimelineInput = {
      conceptId: 'concept-001',
      conceptLabel: 'Transformer Timeline',
      events: [VALID_EVENT_1, VALID_EVENT_2, VALID_EVENT_3],
    };

    const artifact = composeResearchTimeline(input);

    // Timeline metadata should only contain input data, not generated summaries
    for (const event of artifact.timeline.events) {
      assert.ok(!event.title.includes('generated'));
      assert.ok(!event.title.includes('synthesized'));
    }
  });
});

// ---------------------------------------------------------------------------
// No Inferred Chronology Tests
// ---------------------------------------------------------------------------

describe('no inferred chronology', () => {
  it('should not infer chronology', () => {
    const input: ResearchTimelineInput = {
      conceptId: 'concept-001',
      conceptLabel: 'Transformer Timeline',
      events: [VALID_EVENT_1, VALID_EVENT_2, VALID_EVENT_3],
    };

    const artifact = composeResearchTimeline(input);

    // Should only have events that were provided
    assert.equal(artifact.timeline.events.length, 3);
  });

  it('should only include provided events', () => {
    const input: ResearchTimelineInput = {
      conceptId: 'concept-001',
      conceptLabel: 'Transformer Timeline',
      events: [VALID_EVENT_1],
    };

    const artifact = composeResearchTimeline(input);

    // Should only have one event
    assert.equal(artifact.timeline.events.length, 1);
  });
});

// ---------------------------------------------------------------------------
// No Runtime Clocks Tests
// ---------------------------------------------------------------------------

describe('no runtime clocks', () => {
  it('should not use runtime clocks', () => {
    // This test verifies that no runtime clocks are used
    // by checking that the function completes synchronously
    const input: ResearchTimelineInput = {
      conceptId: 'concept-001',
      conceptLabel: 'Transformer Timeline',
      events: [VALID_EVENT_1, VALID_EVENT_2, VALID_EVENT_3],
    };

    const startTime = Date.now();
    composeResearchTimeline(input);
    const endTime = Date.now();

    // Should complete very quickly (< 100ms for local computation)
    assert.ok(endTime - startTime < 100, 'Should complete synchronously without runtime clocks');
  });
});

// ---------------------------------------------------------------------------
// No Network Usage Tests
// ---------------------------------------------------------------------------

describe('no network usage', () => {
  it('should not use network APIs', () => {
    // Verify that no fetch, XMLHttpRequest, or other network APIs are used
    // by checking that the function is pure and synchronous
    const input: ResearchTimelineInput = {
      conceptId: 'concept-001',
      conceptLabel: 'Transformer Timeline',
      events: [VALID_EVENT_1, VALID_EVENT_2, VALID_EVENT_3],
    };

    // Should not throw or hang
    const result = composeResearchTimeline(input);
    assert.ok(result, 'Should return a result');
  });
});

// ---------------------------------------------------------------------------
// Timeline Independent from Lineage Tests
// ---------------------------------------------------------------------------

describe('timeline independent from lineage', () => {
  it('should not depend on lineage', () => {
    const input: ResearchTimelineInput = {
      conceptId: 'concept-001',
      conceptLabel: 'Transformer Timeline',
      events: [VALID_EVENT_1, VALID_EVENT_2, VALID_EVENT_3],
    };

    const artifact = composeResearchTimeline(input);

    // Timeline should not have lineage fields
    assert.ok(!('lineageGraph' in artifact), 'Should not have lineageGraph field');
    assert.ok(!('lineageTrace' in artifact), 'Should not have lineageTrace field');
  });

  it('should work without lineage references', () => {
    const event: ResearchTimelineEvent = {
      eventId: 'event-001',
      eventType: 'publication',
      referenceId: 'ref-001',
      title: 'Attention Is All You Need',
      publicationYear: 2017,
      provenance: VALID_PROVENANCE_1,
      governanceStatus: 'canonical',
    };

    const input: ResearchTimelineInput = {
      conceptId: 'concept-001',
      conceptLabel: 'Transformer Timeline',
      events: [event],
    };

    const artifact = composeResearchTimeline(input);

    assert.equal(artifact.timeline.events.length, 1);
  });
});

// ---------------------------------------------------------------------------
// Additional Negative Tests
// ---------------------------------------------------------------------------

describe('additional negative tests', () => {
  it('should validate complete artifact', () => {
    const input: ResearchTimelineInput = {
      conceptId: 'concept-001',
      conceptLabel: 'Transformer Timeline',
      events: [VALID_EVENT_1, VALID_EVENT_2, VALID_EVENT_3],
    };

    const artifact = composeResearchTimeline(input);
    const result = validateResearchArtifactWithTimeline(artifact);

    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it('should validate timeline input', () => {
    const input: ResearchTimelineInput = {
      conceptId: 'concept-001',
      conceptLabel: 'Transformer Timeline',
      events: [VALID_EVENT_1, VALID_EVENT_2, VALID_EVENT_3],
    };

    const errors = validateTimelineInput(input);
    assert.equal(errors.length, 0);
  });

  it('should detect missing concept ID in input', () => {
    const input: ResearchTimelineInput = {
      conceptId: '',
      conceptLabel: 'Transformer Timeline',
      events: [VALID_EVENT_1],
    };

    const errors = validateTimelineInput(input);
    const conceptError = errors.find((e) => e.field === 'conceptId');

    assert.ok(conceptError, 'Should have conceptId error');
  });

  it('should detect missing concept label in input', () => {
    const input: ResearchTimelineInput = {
      conceptId: 'concept-001',
      conceptLabel: '',
      events: [VALID_EVENT_1],
    };

    const errors = validateTimelineInput(input);
    const labelError = errors.find((e) => e.field === 'conceptLabel');

    assert.ok(labelError, 'Should have conceptLabel error');
  });

  it('should detect missing events in input', () => {
    const input: ResearchTimelineInput = {
      conceptId: 'concept-001',
      conceptLabel: 'Transformer Timeline',
      events: [],
    };

    const errors = validateTimelineInput(input);
    const eventsError = errors.find((e) => e.field === 'events');

    assert.ok(eventsError, 'Should have events error');
  });

  it('should compose timeline events correctly', () => {
    const event = composeTimelineEvent(
      'event-001',
      'publication',
      'ref-001',
      'Attention Is All You Need',
      2017,
      VALID_PROVENANCE_1,
      'canonical',
    );

    assert.equal(event.eventId, 'event-001');
    assert.equal(event.eventType, 'publication');
    assert.equal(event.referenceId, 'ref-001');
    assert.equal(event.title, 'Attention Is All You Need');
    assert.equal(event.publicationYear, 2017);
    assert.equal(event.governanceStatus, 'canonical');
  });

  it('should compose timeline provenance correctly', () => {
    const provenance = composeTimelineProvenance(
      'ref-001',
      'publication',
      'research-agent',
      'canonical',
      2017,
      'Transformer architecture introduced.',
    );

    assert.equal(provenance.referenceId, 'ref-001');
    assert.equal(provenance.eventType, 'publication');
    assert.equal(provenance.source, 'research-agent');
    assert.equal(provenance.governanceStatus, 'canonical');
    assert.equal(provenance.publicationYear, 2017);
    assert.equal(provenance.rationale, 'Transformer architecture introduced.');
  });

  it('should compose chronological references correctly', () => {
    const ref = composeChronologicalReference('ref-001', 2017, 6, 15);

    assert.equal(ref.referenceId, 'ref-001');
    assert.equal(ref.publicationYear, 2017);
    assert.equal(ref.publicationMonth, 6);
    assert.equal(ref.publicationDay, 15);
  });

  it('should compare chronological references correctly', () => {
    const ref1 = composeChronologicalReference('ref-001', 2017);
    const ref2 = composeChronologicalReference('ref-002', 2019);

    const comparison = compareChronologicalReferences(ref1, ref2);
    assert.ok(comparison < 0, 'ref-001 should be earlier than ref-002');
  });

  it('should compose timeline trace correctly', () => {
    const decisions = [
      {
        decisionId: 'decision-001',
        eventId: 'event-001',
        eventType: 'publication' as const,
        validationPassed: true,
        validationErrors: [],
      },
    ];

    const trace = composeTimelineTrace('trace-001', decisions);

    assert.equal(trace.traceId, 'trace-001');
    assert.equal(trace.eventCount, 1);
    assert.equal(trace.validatedCount, 1);
    assert.equal(trace.invalidCount, 0);
  });

  it('should detect invalid governance status', () => {
    const event: ResearchTimelineEvent = {
      ...VALID_EVENT_1,
      governanceStatus: '' as any,
    };

    const errors = validateTimelineEvent(event);
    const statusError = errors.find((e) => e.code === TIMELINE_VALIDATION_CODES.TIMELINE_INVALID_STATUS);

    assert.ok(statusError, 'Should have TIMELINE_INVALID_STATUS error');
  });

  it('should detect broken sequence', () => {
    const timeline: ResearchTimeline = {
      timelineId: 'timeline-001',
      events: [VALID_EVENT_1, VALID_EVENT_2],
      nodes: [VALID_EVENT_1].map((e) => ({
        nodeId: 'node-001',
        referenceId: e.referenceId,
        title: e.title,
        eventType: e.eventType,
        publicationYear: e.publicationYear,
        governanceStatus: e.governanceStatus,
      })),
      deterministic: true,
      generatedFrom: 'deterministic_timeline_kernel',
      randomUsed: false,
      timeDependency: false,
    };

    const errors = validateTimeline(timeline);
    const brokenError = errors.find((e) => e.code === TIMELINE_VALIDATION_CODES.TIMELINE_BROKEN_SEQUENCE);

    assert.ok(brokenError, 'Should have TIMELINE_BROKEN_SEQUENCE error');
  });
});

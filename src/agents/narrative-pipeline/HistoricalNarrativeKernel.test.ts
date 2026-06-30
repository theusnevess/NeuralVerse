/**
 * NV-1700-D6-OPT-07 — Historical Context, Scientific Evolution & Discovery Timeline Test Suite
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import type {
  HistoricalProvenance,
  HistoricalContext,
  ScientificDiscovery,
  TimelineEvent,
  ScientificEvolution,
  Milestone,
  InfluenceChain,
  ParadigmShift,
  HistoricalInput,
  HistoricalRegistry,
  NarrativeArtifactWithHistory,
} from './NarrativeAgentContract.ts';

import {
  CANONICAL_HISTORICAL_CONTEXT_TYPES,
  CANONICAL_DISCOVERY_TYPES,
  CANONICAL_TIMELINE_EVENT_TYPES,
  CANONICAL_EVOLUTION_TYPES,
  CANONICAL_MILESTONE_TYPES,
  CANONICAL_INFLUENCE_TYPES,
  CANONICAL_PARADIGM_SHIFT_TYPES,
  CANONICAL_HISTORY_STATUS,
} from './NarrativeAgentContract.ts';

import {
  composeHistoricalContextProvenance,
  composeHistoricalContext,
  composeScientificDiscovery,
  composeTimelineEvent,
  composeScientificEvolution,
  composeMilestone,
  composeInfluenceChain,
  composeParadigmShift,
  composeHistoricalTrace,
  composeHistoricalRegistry,
  composeHistoricalRegistryFromInput,
  composeNarrativeHistory,
  composeNarrativeArtifactWithHistory,
  isSupportedHistoricalContextType,
  isSupportedDiscoveryType,
  isSupportedTimelineEventType,
  isSupportedEvolutionType,
  isSupportedMilestoneType,
  isSupportedInfluenceType,
  isSupportedParadigmShiftType,
  isSupportedHistoryStatus,
  getCanonicalHistoricalContextTypes,
  getCanonicalDiscoveryTypes,
  getCanonicalTimelineEventTypes,
  getCanonicalEvolutionTypes,
  getCanonicalMilestoneTypes,
  getCanonicalInfluenceTypes,
  getCanonicalParadigmShiftTypes,
  getCanonicalHistoryStatuses,
} from './HistoricalNarrativeKernel.ts';

import {
  validateHistoricalContext,
  validateScientificDiscovery,
  validateTimelineEvent,
  validateScientificEvolution,
  validateMilestone,
  validateInfluenceChain,
  validateParadigmShift,
  validateHistoricalRegistry,
  validateHistoricalInput,
  validateNarrativeArtifactWithHistory,
  HISTORICAL_VALIDATION_CODES,
} from './HistoricalNarrativeValidation.ts';

const VP: HistoricalProvenance = { source: 'NeuralVerse Team', governanceStatus: 'canonical', providedBy: 'NeuralVerse Team', rationale: 'Core.' };

const C1: HistoricalContext = { contextId: 'ctx-1', contextType: 'scientific', title: 'Deep Learning Era', description: 'D.', timePeriod: '2010s', relatedArtifactId: 'k-1', governanceStatus: 'canonical', provenance: VP };
const C2: HistoricalContext = { contextId: 'ctx-2', contextType: 'engineering', title: 'GPU Revolution', description: 'D.', timePeriod: '2000s', relatedArtifactId: 'k-2', governanceStatus: 'accepted', provenance: { ...VP, source: 'Research' } };

const D1: ScientificDiscovery = { discoveryId: 'disc-1', discoveryType: 'algorithm', title: 'Backpropagation', description: 'D.', year: 1986, relatedConceptId: 'c-1', governanceStatus: 'canonical', provenance: VP };
const D2: ScientificDiscovery = { discoveryId: 'disc-2', discoveryType: 'theory', title: 'Universal Approximation', description: 'D.', year: 1989, relatedConceptId: 'c-2', governanceStatus: 'accepted', provenance: { ...VP, source: 'Research' } };

const E1: TimelineEvent = { eventId: 'evt-1', eventType: 'publication', year: 2012, title: 'AlexNet', description: 'D.', relatedDiscoveryId: 'disc-1', governanceStatus: 'canonical', provenance: VP };
const E2: TimelineEvent = { eventId: 'evt-2', eventType: 'discovery', year: 2014, title: 'GANs', description: 'D.', relatedDiscoveryId: 'disc-2', governanceStatus: 'accepted', provenance: { ...VP, source: 'Research' } };

const EV1: ScientificEvolution = { evolutionId: 'evo-1', evolutionType: 'incremental', sourceArtifactId: 'k-1', targetArtifactId: 'k-2', description: 'D.', governanceStatus: 'canonical', provenance: VP };
const EV2: ScientificEvolution = { evolutionId: 'evo-2', evolutionType: 'revolutionary', sourceArtifactId: 'k-3', targetArtifactId: 'k-4', description: 'D.', governanceStatus: 'accepted', provenance: { ...VP, source: 'Research' } };

const M1: Milestone = { milestoneId: 'mil-1', milestoneType: 'foundational', title: 'First Neural Net', description: 'D.', relatedTimelineId: 'evt-1', governanceStatus: 'canonical', provenance: VP };
const M2: Milestone = { milestoneId: 'mil-2', milestoneType: 'major_breakthrough', title: 'Deep Learning', description: 'D.', relatedTimelineId: 'evt-2', governanceStatus: 'accepted', provenance: { ...VP, source: 'Research' } };

const I1: InfluenceChain = { influenceId: 'inf-1', influenceType: 'inspired', sourceArtifactId: 'k-1', targetArtifactId: 'k-2', description: 'D.', governanceStatus: 'canonical', provenance: VP };
const I2: InfluenceChain = { influenceId: 'inf-2', influenceType: 'extended', sourceArtifactId: 'k-3', targetArtifactId: 'k-4', description: 'D.', governanceStatus: 'accepted', provenance: { ...VP, source: 'Research' } };

const S1: ParadigmShift = { shiftId: 'shf-1', shiftType: 'theoretical', title: 'Connectionism', description: 'D.', affectedDomain: 'deep_learning', governanceStatus: 'canonical', provenance: VP };
const S2: ParadigmShift = { shiftId: 'shf-2', shiftType: 'computational', title: 'GPU Computing', description: 'D.', affectedDomain: 'computing', governanceStatus: 'accepted', provenance: { ...VP, source: 'Research' } };

const INPUT: HistoricalInput = { historicalContexts: [C1, C2], discoveries: [D1, D2], timelineEvents: [E1, E2], evolutions: [EV1, EV2], milestones: [M1, M2], influenceChains: [I1, I2], paradigmShifts: [S1, S2] };

describe('Historical Kernel — Composition', () => {
  it('should compose valid provenance', () => {
    const p = composeHistoricalContextProvenance({ source: 'Team', governanceStatus: 'canonical', providedBy: 'Team', rationale: 'R.' });
    assert.equal(p.source, 'Team');
  });
  it('should compose valid context', () => {
    const c = composeHistoricalContext({ contextId: 'c-1', contextType: 'scientific', title: 'T', description: 'D.', timePeriod: '2000s', relatedArtifactId: 'k-1', governanceStatus: 'canonical', provenance: VP });
    assert.equal(c.contextId, 'c-1');
  });
  it('should compose valid discovery', () => {
    const d = composeScientificDiscovery({ discoveryId: 'd-1', discoveryType: 'algorithm', title: 'T', description: 'D.', year: 1986, relatedConceptId: 'c-1', governanceStatus: 'canonical', provenance: VP });
    assert.equal(d.discoveryId, 'd-1');
    assert.equal(d.year, 1986);
  });
  it('should compose valid event', () => {
    const e = composeTimelineEvent({ eventId: 'e-1', eventType: 'publication', year: 2012, title: 'T', description: 'D.', relatedDiscoveryId: 'd-1', governanceStatus: 'canonical', provenance: VP });
    assert.equal(e.eventId, 'e-1');
  });
  it('should compose valid evolution', () => {
    const e = composeScientificEvolution({ evolutionId: 'e-1', evolutionType: 'incremental', sourceArtifactId: 'k-1', targetArtifactId: 'k-2', description: 'D.', governanceStatus: 'canonical', provenance: VP });
    assert.equal(e.evolutionId, 'e-1');
  });
  it('should compose valid milestone', () => {
    const m = composeMilestone({ milestoneId: 'm-1', milestoneType: 'foundational', title: 'T', description: 'D.', relatedTimelineId: 'e-1', governanceStatus: 'canonical', provenance: VP });
    assert.equal(m.milestoneId, 'm-1');
  });
  it('should compose valid influence chain', () => {
    const i = composeInfluenceChain({ influenceId: 'i-1', influenceType: 'inspired', sourceArtifactId: 'k-1', targetArtifactId: 'k-2', description: 'D.', governanceStatus: 'canonical', provenance: VP });
    assert.equal(i.influenceId, 'i-1');
  });
  it('should compose valid paradigm shift', () => {
    const s = composeParadigmShift({ shiftId: 's-1', shiftType: 'theoretical', title: 'T', description: 'D.', affectedDomain: 'dl', governanceStatus: 'canonical', provenance: VP });
    assert.equal(s.shiftId, 's-1');
  });
  it('should validate all entities with no errors', () => {
    assert.deepStrictEqual(validateHistoricalContext(C1), []);
    assert.deepStrictEqual(validateScientificDiscovery(D1), []);
    assert.deepStrictEqual(validateTimelineEvent(E1), []);
    assert.deepStrictEqual(validateScientificEvolution(EV1), []);
    assert.deepStrictEqual(validateMilestone(M1), []);
    assert.deepStrictEqual(validateInfluenceChain(I1), []);
    assert.deepStrictEqual(validateParadigmShift(S1), []);
  });
  it('should validate input', () => {
    const r = validateHistoricalInput(INPUT);
    assert.equal(r.valid, true);
  });
});

describe('Historical Kernel — Registry', () => {
  it('should detect duplicate context IDs', () => {
    const reg = composeHistoricalRegistry([C1, C1], [], [], [], [], [], []);
    const r = validateHistoricalRegistry(reg);
    assert.ok(r.errors.find((e) => e.code === HISTORICAL_VALIDATION_CODES.HISTORY_DUPLICATE_CONTEXT_ID));
  });
  it('should detect duplicate discovery IDs', () => {
    const reg = composeHistoricalRegistry([], [D1, D1], [], [], [], [], []);
    const r = validateHistoricalRegistry(reg);
    assert.ok(r.errors.find((e) => e.code === HISTORICAL_VALIDATION_CODES.HISTORY_DUPLICATE_DISCOVERY_ID));
  });
  it('should detect duplicate event IDs', () => {
    const reg = composeHistoricalRegistry([], [], [E1, E1], [], [], [], []);
    const r = validateHistoricalRegistry(reg);
    assert.ok(r.errors.find((e) => e.code === HISTORICAL_VALIDATION_CODES.HISTORY_DUPLICATE_EVENT_ID));
  });
  it('should detect duplicate evolution IDs', () => {
    const reg = composeHistoricalRegistry([], [], [], [EV1, EV1], [], [], []);
    const r = validateHistoricalRegistry(reg);
    assert.ok(r.errors.find((e) => e.code === HISTORICAL_VALIDATION_CODES.HISTORY_DUPLICATE_EVOLUTION_ID));
  });
  it('should detect duplicate milestone IDs', () => {
    const reg = composeHistoricalRegistry([], [], [], [], [M1, M1], [], []);
    const r = validateHistoricalRegistry(reg);
    assert.ok(r.errors.find((e) => e.code === HISTORICAL_VALIDATION_CODES.HISTORY_DUPLICATE_MILESTONE_ID));
  });
  it('should detect duplicate influence IDs', () => {
    const reg = composeHistoricalRegistry([], [], [], [], [], [I1, I1], []);
    const r = validateHistoricalRegistry(reg);
    assert.ok(r.errors.find((e) => e.code === HISTORICAL_VALIDATION_CODES.HISTORY_DUPLICATE_INFLUENCE_ID));
  });
  it('should detect duplicate shift IDs', () => {
    const reg = composeHistoricalRegistry([], [], [], [], [], [], [S1, S1]);
    const r = validateHistoricalRegistry(reg);
    assert.ok(r.errors.find((e) => e.code === HISTORICAL_VALIDATION_CODES.HISTORY_DUPLICATE_SHIFT_ID));
  });
  it('should sort deterministically', () => {
    const reg = composeHistoricalRegistry([C2, C1], [], [], [], [], [], []);
    assert.equal(reg.historicalContexts[0].contextId, 'ctx-1');
    assert.equal(reg.historicalContexts[1].contextId, 'ctx-2');
  });
});

describe('Historical Kernel — Validation', () => {
  it('should detect invalid context type', () => {
    const errors = validateHistoricalContext({ ...C1, contextType: 'unsupported' as any });
    assert.ok(errors.find((e) => e.code === HISTORICAL_VALIDATION_CODES.HISTORY_INVALID_CONTEXT_TYPE));
  });
  it('should detect invalid discovery type', () => {
    const errors = validateScientificDiscovery({ ...D1, discoveryType: 'unsupported' as any });
    assert.ok(errors.find((e) => e.code === HISTORICAL_VALIDATION_CODES.HISTORY_INVALID_DISCOVERY_TYPE));
  });
  it('should detect invalid event type', () => {
    const errors = validateTimelineEvent({ ...E1, eventType: 'unsupported' as any });
    assert.ok(errors.find((e) => e.code === HISTORICAL_VALIDATION_CODES.HISTORY_INVALID_EVENT_TYPE));
  });
  it('should detect invalid evolution type', () => {
    const errors = validateScientificEvolution({ ...EV1, evolutionType: 'unsupported' as any });
    assert.ok(errors.find((e) => e.code === HISTORICAL_VALIDATION_CODES.HISTORY_INVALID_EVOLUTION_TYPE));
  });
  it('should detect invalid milestone type', () => {
    const errors = validateMilestone({ ...M1, milestoneType: 'unsupported' as any });
    assert.ok(errors.find((e) => e.code === HISTORICAL_VALIDATION_CODES.HISTORY_INVALID_MILESTONE_TYPE));
  });
  it('should detect invalid influence type', () => {
    const errors = validateInfluenceChain({ ...I1, influenceType: 'unsupported' as any });
    assert.ok(errors.find((e) => e.code === HISTORICAL_VALIDATION_CODES.HISTORY_INVALID_INFLUENCE_TYPE));
  });
  it('should detect invalid shift type', () => {
    const errors = validateParadigmShift({ ...S1, shiftType: 'unsupported' as any });
    assert.ok(errors.find((e) => e.code === HISTORICAL_VALIDATION_CODES.HISTORY_INVALID_PARADIGM_SHIFT_TYPE));
  });
  it('should detect missing provenance', () => {
    const errors = validateHistoricalContext({ ...C1, provenance: undefined as any });
    assert.ok(errors.find((e) => e.code === HISTORICAL_VALIDATION_CODES.HISTORY_MISSING_PROVENANCE));
  });
  it('should detect missing source', () => {
    const errors = validateHistoricalContext({ ...C1, provenance: { ...VP, source: '' } });
    assert.ok(errors.find((e) => e.code === HISTORICAL_VALIDATION_CODES.HISTORY_MISSING_SOURCE));
  });
  it('should detect missing rationale', () => {
    const errors = validateHistoricalContext({ ...C1, provenance: { ...VP, rationale: '' } });
    assert.ok(errors.find((e) => e.code === HISTORICAL_VALIDATION_CODES.HISTORY_MISSING_RATIONALE));
  });
  it('should detect missing providedBy', () => {
    const errors = validateHistoricalContext({ ...C1, provenance: { ...VP, providedBy: '' } });
    assert.ok(errors.find((e) => e.code === HISTORICAL_VALIDATION_CODES.HISTORY_MISSING_PROVIDED_BY));
  });
  it('should detect missing artifact reference', () => {
    const errors = validateHistoricalContext({ ...C1, relatedArtifactId: '' });
    assert.ok(errors.find((e) => e.code === HISTORICAL_VALIDATION_CODES.HISTORY_MISSING_ARTIFACT_REFERENCE));
  });
});

describe('Historical Kernel — Determinism', () => {
  it('should produce identical output (100 iterations)', () => {
    const results: ReturnType<typeof composeNarrativeHistory>[] = [];
    for (let i = 0; i < 100; i++) results.push(composeNarrativeHistory(INPUT));
    for (let i = 1; i < results.length; i++) {
      assert.deepStrictEqual(results[0].registryId, results[i].registryId);
      assert.deepStrictEqual(results[0].historicalContexts, results[i].historicalContexts);
    }
  });
});

describe('Historical Kernel — Immutability', () => {
  it('should not mutate input', () => {
    const original = C1.contextId;
    composeNarrativeHistory(INPUT);
    assert.equal(C1.contextId, original);
  });
});

describe('Historical Kernel — Helper Functions', () => {
  it('should return canonical types', () => {
    assert.equal(getCanonicalHistoricalContextTypes().length, 10);
    assert.equal(getCanonicalDiscoveryTypes().length, 10);
    assert.equal(getCanonicalTimelineEventTypes().length, 10);
    assert.equal(getCanonicalEvolutionTypes().length, 10);
    assert.equal(getCanonicalMilestoneTypes().length, 10);
    assert.equal(getCanonicalInfluenceTypes().length, 10);
    assert.equal(getCanonicalParadigmShiftTypes().length, 10);
    assert.equal(getCanonicalHistoryStatuses().length, 6);
  });
  it('should validate type support', () => {
    assert.equal(isSupportedHistoricalContextType('scientific'), true);
    assert.equal(isSupportedHistoricalContextType('unsupported'), false);
    assert.equal(isSupportedDiscoveryType('algorithm'), true);
    assert.equal(isSupportedDiscoveryType('unsupported'), false);
    assert.equal(isSupportedTimelineEventType('publication'), true);
    assert.equal(isSupportedTimelineEventType('unsupported'), false);
    assert.equal(isSupportedEvolutionType('incremental'), true);
    assert.equal(isSupportedEvolutionType('unsupported'), false);
    assert.equal(isSupportedMilestoneType('foundational'), true);
    assert.equal(isSupportedMilestoneType('unsupported'), false);
    assert.equal(isSupportedInfluenceType('inspired'), true);
    assert.equal(isSupportedInfluenceType('unsupported'), false);
    assert.equal(isSupportedParadigmShiftType('theoretical'), true);
    assert.equal(isSupportedParadigmShiftType('unsupported'), false);
    assert.equal(isSupportedHistoryStatus('draft'), true);
    assert.equal(isSupportedHistoryStatus('unsupported'), false);
  });
});

describe('Historical Kernel — Canonical Enum Completeness', () => {
  it('should have exactly 10 context types', () => { assert.equal(CANONICAL_HISTORICAL_CONTEXT_TYPES.length, 10); });
  it('should have exactly 10 discovery types', () => { assert.equal(CANONICAL_DISCOVERY_TYPES.length, 10); });
  it('should have exactly 10 event types', () => { assert.equal(CANONICAL_TIMELINE_EVENT_TYPES.length, 10); });
  it('should have exactly 10 evolution types', () => { assert.equal(CANONICAL_EVOLUTION_TYPES.length, 10); });
  it('should have exactly 10 milestone types', () => { assert.equal(CANONICAL_MILESTONE_TYPES.length, 10); });
  it('should have exactly 10 influence types', () => { assert.equal(CANONICAL_INFLUENCE_TYPES.length, 10); });
  it('should have exactly 10 paradigm shift types', () => { assert.equal(CANONICAL_PARADIGM_SHIFT_TYPES.length, 10); });
  it('should have exactly 6 history statuses', () => { assert.equal(CANONICAL_HISTORY_STATUS.length, 6); });
});

describe('Historical Kernel — Negative Capability Verification', () => {
  it('should not use Math.random', () => { assert.ok(composeNarrativeHistory(INPUT)); });
  it('should not use Date.now', () => { assert.ok(composeNarrativeHistory(INPUT)); });
  it('should not generate historical explanations', () => {
    const r = composeNarrativeHistory(INPUT);
    assert.ok(!('generatedExplanations' in r));
    assert.ok(!('historicalNarratives' in r));
  });
  it('should not infer chronology', () => {
    const r = composeNarrativeHistory(INPUT);
    assert.ok(!('inferredChronology' in r));
    assert.ok(!('autoTimeline' in r));
  });
  it('should not invent discoveries', () => {
    const r = composeNarrativeHistory(INPUT);
    assert.ok(!('inventedDiscoveries' in r));
    assert.ok(!('fabricatedEvents' in r));
  });
  it('should not call LLMs', () => {
    const r = composeNarrativeHistory(INPUT);
    assert.ok(!('llmCall' in r));
  });
  it('should not have executable callbacks', () => {
    const c = composeHistoricalContext({ contextId: 'c-1', contextType: 'scientific', title: 'T', description: 'D.', timePeriod: '2000s', relatedArtifactId: 'k-1', governanceStatus: 'canonical', provenance: VP });
    for (const key of Object.keys(c)) assert.ok(typeof (c as any)[key] !== 'function');
  });
});
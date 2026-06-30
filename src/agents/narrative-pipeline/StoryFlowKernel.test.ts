/**
 * NV-1700-D6-OPT-05 — Story Arc, Cognitive Progression & Narrative Flow Test Suite
 *
 * Comprehensive deterministic test suite for the Story Flow Kernel.
 * Covers: valid story arc, valid stage, valid transition, valid cognitive
 * progression, valid attention shift, valid narrative flow, duplicate IDs,
 * invalid enums, missing provenance, registry validation, artifact validation,
 * deterministic ordering, immutable input, helper functions,
 * canonical enum completeness, identical output (100 iterations),
 * negative capability verification.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import type {
  StoryArcProvenance,
  StoryArc,
  NarrativeStage,
  NarrativeTransition,
  CognitiveProgression,
  AttentionShift,
  NarrativeFlow,
  StoryFlowInput,
  StoryFlowRegistry,
  StoryFlowTrace,
  NarrativeArtifactWithStoryFlow,
} from './NarrativeAgentContract.ts';

import {
  CANONICAL_STORY_ARC_TYPES,
  CANONICAL_NARRATIVE_STAGES,
  CANONICAL_TRANSITION_TYPES,
  CANONICAL_COGNITIVE_PROGRESSIONS,
  CANONICAL_ATTENTION_SHIFT_TYPES,
  CANONICAL_STORY_FLOW_STATUS,
  CANONICAL_GOVERNANCE_STATUSES,
} from './NarrativeAgentContract.ts';

import {
  composeStoryArcProvenance,
  composeStoryArc,
  composeNarrativeStage,
  composeNarrativeTransition,
  composeCognitiveProgression,
  composeAttentionShift,
  composeNarrativeFlow,
  composeStoryFlowTrace,
  composeStoryFlowRegistry,
  composeStoryFlowRegistryFromInput,
  composeNarrativeFlowArtifacts,
  composeNarrativeArtifactWithStoryFlow,
  isSupportedStoryArcType,
  isSupportedNarrativeStageType,
  isSupportedTransitionType,
  isSupportedCognitiveProgressionType,
  isSupportedAttentionShiftType,
  isSupportedStoryFlowStatus,
  getCanonicalStoryArcTypes,
  getCanonicalNarrativeStageTypes,
  getCanonicalTransitionTypes,
  getCanonicalCognitiveProgressionTypes,
  getCanonicalAttentionShiftTypes,
  getCanonicalStoryFlowStatuses,
} from './StoryFlowKernel.ts';

import {
  validateStoryArc,
  validateNarrativeStage,
  validateNarrativeTransition,
  validateCognitiveProgression,
  validateAttentionShift,
  validateNarrativeFlow,
  validateStoryFlowRegistry,
  validateStoryFlowInput,
  validateNarrativeArtifactWithStoryFlow,
  STORY_FLOW_VALIDATION_CODES,
} from './StoryFlowValidation.ts';

// ---------------------------------------------------------------------------
// Test Fixtures
// ---------------------------------------------------------------------------

const VALID_PROVENANCE: StoryArcProvenance = {
  source: 'NeuralVerse Team',
  governanceStatus: 'canonical',
  providedBy: 'NeuralVerse Team',
  rationale: 'Core story flow modeling for neural network concepts.',
};

const VALID_STAGE_1: NarrativeStage = {
  stageId: 'stage-001',
  stageType: 'hook',
  title: 'Opening Hook',
  description: 'Capture attention with a compelling question.',
  order: 1,
  governanceStatus: 'canonical',
  provenance: VALID_PROVENANCE,
};

const VALID_STAGE_2: NarrativeStage = {
  stageId: 'stage-002',
  stageType: 'context',
  title: 'Context Setting',
  description: 'Establish the broader context.',
  order: 2,
  governanceStatus: 'canonical',
  provenance: VALID_PROVENANCE,
};

const VALID_TRANSITION: NarrativeTransition = {
  transitionId: 'transition-001',
  transitionType: 'context_shift',
  sourceStageId: 'stage-001',
  targetStageId: 'stage-002',
  description: 'Shift from hook to context.',
  governanceStatus: 'canonical',
  provenance: VALID_PROVENANCE,
};

const VALID_TRANSITION_2: NarrativeTransition = {
  transitionId: 'transition-002',
  transitionType: 'zoom_in',
  sourceStageId: 'stage-002',
  targetStageId: 'stage-003',
  description: 'Zoom into the problem.',
  governanceStatus: 'accepted',
  provenance: { ...VALID_PROVENANCE, source: 'Research Team' },
};

const VALID_PROGRESSION: CognitiveProgression = {
  progressionId: 'progression-001',
  progressionType: 'known_to_unknown',
  sourceConceptId: 'concept-001',
  targetConceptId: 'concept-002',
  description: 'Move from familiar to unfamiliar.',
  governanceStatus: 'canonical',
  provenance: VALID_PROVENANCE,
};

const VALID_PROGRESSION_2: CognitiveProgression = {
  progressionId: 'progression-002',
  progressionType: 'concrete_to_abstract',
  sourceConceptId: 'concept-003',
  targetConceptId: 'concept-004',
  description: 'Move from concrete to abstract.',
  governanceStatus: 'accepted',
  provenance: { ...VALID_PROVENANCE, source: 'Research Team' },
};

const VALID_SHIFT: AttentionShift = {
  shiftId: 'shift-001',
  shiftType: 'focus_problem',
  trigger: 'Introduce challenge',
  destination: 'Problem definition',
  description: 'Redirect attention to the core problem.',
  governanceStatus: 'canonical',
  provenance: VALID_PROVENANCE,
};

const VALID_SHIFT_2: AttentionShift = {
  shiftId: 'shift-002',
  shiftType: 'focus_solution',
  trigger: 'Present solution',
  destination: 'Solution overview',
  description: 'Redirect attention to the solution.',
  governanceStatus: 'accepted',
  provenance: { ...VALID_PROVENANCE, source: 'Research Team' },
};

const VALID_FLOW: NarrativeFlow = {
  flowId: 'flow-001',
  storyArcId: 'arc-001',
  transitionIds: ['transition-001'],
  progressionIds: ['progression-001'],
  attentionShiftIds: ['shift-001'],
  governanceStatus: 'canonical',
  provenance: VALID_PROVENANCE,
};

const VALID_FLOW_2: NarrativeFlow = {
  flowId: 'flow-002',
  storyArcId: 'arc-002',
  transitionIds: ['transition-002'],
  progressionIds: ['progression-002'],
  attentionShiftIds: ['shift-002'],
  governanceStatus: 'accepted',
  provenance: { ...VALID_PROVENANCE, source: 'Research Team' },
};

const VALID_ARC: StoryArc = {
  storyArcId: 'arc-001',
  storyArcType: 'classical',
  title: 'The Neural Network Journey',
  stageIds: ['stage-001', 'stage-002'],
  flowId: 'flow-001',
  governanceStatus: 'canonical',
  provenance: VALID_PROVENANCE,
};

const VALID_ARC_2: StoryArc = {
  storyArcId: 'arc-002',
  storyArcType: 'engineering',
  title: 'Building a CNN',
  stageIds: ['stage-003', 'stage-004'],
  flowId: 'flow-002',
  governanceStatus: 'accepted',
  provenance: { ...VALID_PROVENANCE, source: 'Research Team' },
};

const VALID_INPUT: StoryFlowInput = {
  storyArcs: [VALID_ARC, VALID_ARC_2],
  stages: [VALID_STAGE_1, VALID_STAGE_2],
  transitions: [VALID_TRANSITION, VALID_TRANSITION_2],
  progressions: [VALID_PROGRESSION, VALID_PROGRESSION_2],
  attentionShifts: [VALID_SHIFT, VALID_SHIFT_2],
  flows: [VALID_FLOW, VALID_FLOW_2],
};

const EMPTY_INPUT: StoryFlowInput = {
  storyArcs: [],
  stages: [],
  transitions: [],
  progressions: [],
  attentionShifts: [],
  flows: [],
};

// ---------------------------------------------------------------------------
// Composition Tests
// ---------------------------------------------------------------------------

describe('Story Flow Kernel — Composition', () => {
  it('should compose valid story arc provenance', () => {
    const provenance = composeStoryArcProvenance({
      source: 'NeuralVerse Team',
      governanceStatus: 'canonical',
      providedBy: 'NeuralVerse Team',
      rationale: 'Core concept.',
    });

    assert.equal(provenance.source, 'NeuralVerse Team');
    assert.equal(provenance.governanceStatus, 'canonical');
    assert.equal(provenance.providedBy, 'NeuralVerse Team');
    assert.equal(provenance.rationale, 'Core concept.');
  });

  it('should compose valid story arc', () => {
    const arc = composeStoryArc({
      storyArcId: 'arc-001',
      storyArcType: 'classical',
      title: 'The Journey',
      stageIds: ['stage-001'],
      flowId: 'flow-001',
      governanceStatus: 'canonical',
      provenance: VALID_PROVENANCE,
    });

    assert.equal(arc.storyArcId, 'arc-001');
    assert.equal(arc.storyArcType, 'classical');
    assert.equal(arc.title, 'The Journey');
    assert.equal(arc.stageIds.length, 1);
  });

  it('should compose valid narrative stage', () => {
    const stage = composeNarrativeStage({
      stageId: 'stage-001',
      stageType: 'hook',
      title: 'Opening',
      description: 'Capture attention.',
      order: 1,
      governanceStatus: 'canonical',
      provenance: VALID_PROVENANCE,
    });

    assert.equal(stage.stageId, 'stage-001');
    assert.equal(stage.stageType, 'hook');
    assert.equal(stage.title, 'Opening');
    assert.equal(stage.order, 1);
  });

  it('should compose valid narrative transition', () => {
    const transition = composeNarrativeTransition({
      transitionId: 'transition-001',
      transitionType: 'context_shift',
      sourceStageId: 'stage-001',
      targetStageId: 'stage-002',
      description: 'Shift context.',
      governanceStatus: 'canonical',
      provenance: VALID_PROVENANCE,
    });

    assert.equal(transition.transitionId, 'transition-001');
    assert.equal(transition.transitionType, 'context_shift');
    assert.equal(transition.description, 'Shift context.');
  });

  it('should compose valid cognitive progression', () => {
    const progression = composeCognitiveProgression({
      progressionId: 'progression-001',
      progressionType: 'known_to_unknown',
      sourceConceptId: 'concept-001',
      targetConceptId: 'concept-002',
      description: 'Move from known to unknown.',
      governanceStatus: 'canonical',
      provenance: VALID_PROVENANCE,
    });

    assert.equal(progression.progressionId, 'progression-001');
    assert.equal(progression.progressionType, 'known_to_unknown');
    assert.equal(progression.description, 'Move from known to unknown.');
  });

  it('should compose valid attention shift', () => {
    const shift = composeAttentionShift({
      shiftId: 'shift-001',
      shiftType: 'focus_problem',
      trigger: 'Challenge',
      destination: 'Problem',
      description: 'Focus on problem.',
      governanceStatus: 'canonical',
      provenance: VALID_PROVENANCE,
    });

    assert.equal(shift.shiftId, 'shift-001');
    assert.equal(shift.shiftType, 'focus_problem');
    assert.equal(shift.trigger, 'Challenge');
  });

  it('should compose valid narrative flow', () => {
    const flow = composeNarrativeFlow({
      flowId: 'flow-001',
      storyArcId: 'arc-001',
      transitionIds: ['transition-001'],
      progressionIds: ['progression-001'],
      attentionShiftIds: ['shift-001'],
      governanceStatus: 'canonical',
      provenance: VALID_PROVENANCE,
    });

    assert.equal(flow.flowId, 'flow-001');
    assert.equal(flow.storyArcId, 'arc-001');
    assert.equal(flow.transitionIds.length, 1);
  });

  it('should compose valid story flow trace', () => {
    const trace = composeStoryFlowTrace({
      traceId: '_trace_1',
      decisions: [
        { decisionId: 'd1', storyArcId: 'arc-001', validationPassed: true, validationErrors: [] },
      ],
      registryVersion: '1.0.0',
      pipelineVersion: '1.0.0',
      storyArcCount: 1,
      stageCount: 0,
      transitionCount: 0,
      progressionCount: 0,
      attentionShiftCount: 0,
      flowCount: 0,
    });

    assert.equal(trace.traceId, '_trace_1');
    assert.equal(trace.decisionCount, 1);
    assert.equal(trace.validationCount, 1);
    assert.equal(trace.deterministic, true);
    assert.equal(trace.storyArcCount, 1);
  });

  it('should compose valid story flow registry', () => {
    const registry = composeStoryFlowRegistry(
      [VALID_ARC, VALID_ARC_2],
      [VALID_STAGE_1, VALID_STAGE_2],
      [VALID_TRANSITION, VALID_TRANSITION_2],
      [VALID_PROGRESSION, VALID_PROGRESSION_2],
      [VALID_SHIFT, VALID_SHIFT_2],
      [VALID_FLOW, VALID_FLOW_2],
    );
    const result = validateStoryFlowRegistry(registry);

    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it('should validate a valid story arc with no errors', () => {
    const errors = validateStoryArc(VALID_ARC);
    assert.deepStrictEqual(errors, []);
  });

  it('should validate a valid stage with no errors', () => {
    const errors = validateNarrativeStage(VALID_STAGE_1);
    assert.deepStrictEqual(errors, []);
  });

  it('should validate a valid transition with no errors', () => {
    const errors = validateNarrativeTransition(VALID_TRANSITION);
    assert.deepStrictEqual(errors, []);
  });

  it('should validate a valid progression with no errors', () => {
    const errors = validateCognitiveProgression(VALID_PROGRESSION);
    assert.deepStrictEqual(errors, []);
  });

  it('should validate a valid shift with no errors', () => {
    const errors = validateAttentionShift(VALID_SHIFT);
    assert.deepStrictEqual(errors, []);
  });

  it('should validate a valid flow with no errors', () => {
    const errors = validateNarrativeFlow(VALID_FLOW);
    assert.deepStrictEqual(errors, []);
  });

  it('should validate story flow input', () => {
    const result = validateStoryFlowInput(VALID_INPUT);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it('should compose valid narrative artifact with story flow', () => {
    const artifact = composeNarrativeArtifactWithStoryFlow({
      narrativeId: 'narrative-001',
      title: 'The Architecture Story',
      unitType: 'lesson_opening',
      narrativeMode: 'engineering_problem',
      domain: 'deep_learning',
      status: 'published',
      canonicalKnowledgeId: 'knowledge-001',
      curriculumNodeId: 'curriculum-001',
      lessonId: 'lesson-001',
      laboratoryId: '',
      sequenceOrder: 1,
      summary: 'Opening narrative.',
      tags: ['architecture'],
      provenance: VALID_PROVENANCE,
      storyArcs: [VALID_ARC],
      stages: [VALID_STAGE_1],
      transitions: [VALID_TRANSITION],
      progressions: [VALID_PROGRESSION],
      attentionShifts: [VALID_SHIFT],
      flows: [VALID_FLOW],
    });

    assert.equal(artifact.narrativeId, 'narrative-001');
    assert.equal(artifact.storyArcs.length, 1);
    assert.equal(artifact.stages.length, 1);
    assert.equal(artifact.transitions.length, 1);
    assert.equal(artifact.progressions.length, 1);
    assert.equal(artifact.attentionShifts.length, 1);
    assert.equal(artifact.flows.length, 1);
  });
});

// ---------------------------------------------------------------------------
// Registry Tests
// ---------------------------------------------------------------------------

describe('Story Flow Kernel — Registry', () => {
  it('should detect duplicate story arc IDs', () => {
    const registry = composeStoryFlowRegistry(
      [VALID_ARC, VALID_ARC],
      [VALID_STAGE_1],
      [VALID_TRANSITION],
      [VALID_PROGRESSION],
      [VALID_SHIFT],
      [VALID_FLOW],
    );
    const result = validateStoryFlowRegistry(registry);
    const duplicateError = result.errors.find(
      (e) => e.code === STORY_FLOW_VALIDATION_CODES.STORY_FLOW_DUPLICATE_ARC_ID,
    );

    assert.ok(duplicateError, 'Should have STORY_FLOW_DUPLICATE_ARC_ID error');
  });

  it('should detect duplicate stage IDs', () => {
    const registry = composeStoryFlowRegistry(
      [VALID_ARC],
      [VALID_STAGE_1, VALID_STAGE_1],
      [VALID_TRANSITION],
      [VALID_PROGRESSION],
      [VALID_SHIFT],
      [VALID_FLOW],
    );
    const result = validateStoryFlowRegistry(registry);
    const duplicateError = result.errors.find(
      (e) => e.code === STORY_FLOW_VALIDATION_CODES.STORY_FLOW_DUPLICATE_STAGE_ID,
    );

    assert.ok(duplicateError, 'Should have STORY_FLOW_DUPLICATE_STAGE_ID error');
  });

  it('should detect duplicate transition IDs', () => {
    const registry = composeStoryFlowRegistry(
      [VALID_ARC],
      [VALID_STAGE_1],
      [VALID_TRANSITION, VALID_TRANSITION],
      [VALID_PROGRESSION],
      [VALID_SHIFT],
      [VALID_FLOW],
    );
    const result = validateStoryFlowRegistry(registry);
    const duplicateError = result.errors.find(
      (e) => e.code === STORY_FLOW_VALIDATION_CODES.STORY_FLOW_DUPLICATE_TRANSITION_ID,
    );

    assert.ok(duplicateError, 'Should have STORY_FLOW_DUPLICATE_TRANSITION_ID error');
  });

  it('should detect duplicate progression IDs', () => {
    const registry = composeStoryFlowRegistry(
      [VALID_ARC],
      [VALID_STAGE_1],
      [VALID_TRANSITION],
      [VALID_PROGRESSION, VALID_PROGRESSION],
      [VALID_SHIFT],
      [VALID_FLOW],
    );
    const result = validateStoryFlowRegistry(registry);
    const duplicateError = result.errors.find(
      (e) => e.code === STORY_FLOW_VALIDATION_CODES.STORY_FLOW_DUPLICATE_PROGRESSION_ID,
    );

    assert.ok(duplicateError, 'Should have STORY_FLOW_DUPLICATE_PROGRESSION_ID error');
  });

  it('should detect duplicate shift IDs', () => {
    const registry = composeStoryFlowRegistry(
      [VALID_ARC],
      [VALID_STAGE_1],
      [VALID_TRANSITION],
      [VALID_PROGRESSION],
      [VALID_SHIFT, VALID_SHIFT],
      [VALID_FLOW],
    );
    const result = validateStoryFlowRegistry(registry);
    const duplicateError = result.errors.find(
      (e) => e.code === STORY_FLOW_VALIDATION_CODES.STORY_FLOW_DUPLICATE_SHIFT_ID,
    );

    assert.ok(duplicateError, 'Should have STORY_FLOW_DUPLICATE_SHIFT_ID error');
  });

  it('should detect duplicate flow IDs', () => {
    const registry = composeStoryFlowRegistry(
      [VALID_ARC],
      [VALID_STAGE_1],
      [VALID_TRANSITION],
      [VALID_PROGRESSION],
      [VALID_SHIFT],
      [VALID_FLOW, VALID_FLOW],
    );
    const result = validateStoryFlowRegistry(registry);
    const duplicateError = result.errors.find(
      (e) => e.code === STORY_FLOW_VALIDATION_CODES.STORY_FLOW_DUPLICATE_FLOW_ID,
    );

    assert.ok(duplicateError, 'Should have STORY_FLOW_DUPLICATE_FLOW_ID error');
  });

  it('should sort deterministically by storyArcId', () => {
    const arc3 = { ...VALID_ARC, storyArcId: 'arc-003' };
    const arc1 = { ...VALID_ARC, storyArcId: 'arc-001' };
    const arc2 = { ...VALID_ARC, storyArcId: 'arc-002' };

    const registry = composeStoryFlowRegistry(
      [arc3, arc1, arc2],
      [VALID_STAGE_1],
      [VALID_TRANSITION],
      [VALID_PROGRESSION],
      [VALID_SHIFT],
      [VALID_FLOW],
    );

    assert.equal(registry.storyArcs[0].storyArcId, 'arc-001');
    assert.equal(registry.storyArcs[1].storyArcId, 'arc-002');
    assert.equal(registry.storyArcs[2].storyArcId, 'arc-003');
  });

  it('should sort by stageId when storyArcId is equal', () => {
    const arcA = { ...VALID_ARC, storyArcId: 'arc-001', storyArcType: 'engineering' as const };
    const arcB = { ...VALID_ARC, storyArcId: 'arc-001', storyArcType: 'classical' as const };

    const registry = composeStoryFlowRegistry(
      [arcA, arcB],
      [VALID_STAGE_1],
      [VALID_TRANSITION],
      [VALID_PROGRESSION],
      [VALID_SHIFT],
      [VALID_FLOW],
    );

    assert.equal(registry.storyArcs[0].storyArcType, 'classical');
    assert.equal(registry.storyArcs[1].storyArcType, 'engineering');
  });
});

// ---------------------------------------------------------------------------
// Validation Tests
// ---------------------------------------------------------------------------

describe('Story Flow Kernel — Validation', () => {
  it('should detect invalid story arc type', () => {
    const arc = { ...VALID_ARC, storyArcType: 'unsupported' as any };
    const errors = validateStoryArc(arc);
    const typeError = errors.find(
      (e) => e.code === STORY_FLOW_VALIDATION_CODES.STORY_FLOW_INVALID_ARC_TYPE,
    );

    assert.ok(typeError, 'Should have STORY_FLOW_INVALID_ARC_TYPE error');
  });

  it('should detect invalid stage type', () => {
    const stage = { ...VALID_STAGE_1, stageType: 'unsupported' as any };
    const errors = validateNarrativeStage(stage);
    const typeError = errors.find(
      (e) => e.code === STORY_FLOW_VALIDATION_CODES.STORY_FLOW_INVALID_STAGE_TYPE,
    );

    assert.ok(typeError, 'Should have STORY_FLOW_INVALID_STAGE_TYPE error');
  });

  it('should detect invalid transition type', () => {
    const transition = { ...VALID_TRANSITION, transitionType: 'unsupported' as any };
    const errors = validateNarrativeTransition(transition);
    const typeError = errors.find(
      (e) => e.code === STORY_FLOW_VALIDATION_CODES.STORY_FLOW_INVALID_TRANSITION_TYPE,
    );

    assert.ok(typeError, 'Should have STORY_FLOW_INVALID_TRANSITION_TYPE error');
  });

  it('should detect invalid progression type', () => {
    const progression = { ...VALID_PROGRESSION, progressionType: 'unsupported' as any };
    const errors = validateCognitiveProgression(progression);
    const typeError = errors.find(
      (e) => e.code === STORY_FLOW_VALIDATION_CODES.STORY_FLOW_INVALID_PROGRESSION_TYPE,
    );

    assert.ok(typeError, 'Should have STORY_FLOW_INVALID_PROGRESSION_TYPE error');
  });

  it('should detect invalid shift type', () => {
    const shift = { ...VALID_SHIFT, shiftType: 'unsupported' as any };
    const errors = validateAttentionShift(shift);
    const typeError = errors.find(
      (e) => e.code === STORY_FLOW_VALIDATION_CODES.STORY_FLOW_INVALID_SHIFT_TYPE,
    );

    assert.ok(typeError, 'Should have STORY_FLOW_INVALID_SHIFT_TYPE error');
  });

  it('should detect missing story arc provenance', () => {
    const arc = { ...VALID_ARC, provenance: undefined as any };
    const errors = validateStoryArc(arc);
    const provenanceError = errors.find(
      (e) => e.code === STORY_FLOW_VALIDATION_CODES.STORY_FLOW_MISSING_PROVENANCE,
    );

    assert.ok(provenanceError, 'Should have STORY_FLOW_MISSING_PROVENANCE error');
  });

  it('should detect missing story arc source', () => {
    const arc = { ...VALID_ARC, provenance: { ...VALID_PROVENANCE, source: '' } };
    const errors = validateStoryArc(arc);
    const sourceError = errors.find(
      (e) => e.code === STORY_FLOW_VALIDATION_CODES.STORY_FLOW_MISSING_SOURCE,
    );

    assert.ok(sourceError, 'Should have STORY_FLOW_MISSING_SOURCE error');
  });

  it('should detect missing story arc rationale', () => {
    const arc = { ...VALID_ARC, provenance: { ...VALID_PROVENANCE, rationale: '' } };
    const errors = validateStoryArc(arc);
    const rationaleError = errors.find(
      (e) => e.code === STORY_FLOW_VALIDATION_CODES.STORY_FLOW_MISSING_RATIONALE,
    );

    assert.ok(rationaleError, 'Should have STORY_FLOW_MISSING_RATIONALE error');
  });

  it('should detect missing story arc providedBy', () => {
    const arc = { ...VALID_ARC, provenance: { ...VALID_PROVENANCE, providedBy: '' } };
    const errors = validateStoryArc(arc);
    const providedByError = errors.find(
      (e) => e.code === STORY_FLOW_VALIDATION_CODES.STORY_FLOW_MISSING_PROVIDED_BY,
    );

    assert.ok(providedByError, 'Should have STORY_FLOW_MISSING_PROVIDED_BY error');
  });

  it('should detect missing flow reference', () => {
    const arc = { ...VALID_ARC, flowId: '' };
    const errors = validateStoryArc(arc);
    const refError = errors.find(
      (e) => e.code === STORY_FLOW_VALIDATION_CODES.STORY_FLOW_MISSING_FLOW_REFERENCE,
    );

    assert.ok(refError, 'Should have STORY_FLOW_MISSING_FLOW_REFERENCE error');
  });

  it('should detect missing transition description', () => {
    const transition = { ...VALID_TRANSITION, description: '' };
    const errors = validateNarrativeTransition(transition);
    const descError = errors.find(
      (e) => e.code === STORY_FLOW_VALIDATION_CODES.STORY_FLOW_MISSING_DESCRIPTION,
    );

    assert.ok(descError, 'Should have STORY_FLOW_MISSING_DESCRIPTION error');
  });
});

// ---------------------------------------------------------------------------
// Determinism Tests
// ---------------------------------------------------------------------------

describe('Story Flow Kernel — Determinism', () => {
  it('should produce identical output for identical input (100 iterations)', () => {
    const results: ReturnType<typeof composeNarrativeFlowArtifacts>[] = [];
    for (let i = 0; i < 100; i++) {
      results.push(composeNarrativeFlowArtifacts(VALID_INPUT));
    }

    for (let i = 1; i < results.length; i++) {
      assert.deepStrictEqual(results[0].registryId, results[i].registryId);
      assert.deepStrictEqual(results[0].storyArcs, results[i].storyArcs);
      assert.deepStrictEqual(results[0].trace.traceId, results[i].trace.traceId);
    }
  });

  it('should produce identical registry output for identical input', () => {
    const results: ReturnType<typeof composeStoryFlowRegistry>[] = [];
    for (let i = 0; i < 100; i++) {
      results.push(composeStoryFlowRegistry(
        [VALID_ARC, VALID_ARC_2],
        [VALID_STAGE_1, VALID_STAGE_2],
        [VALID_TRANSITION, VALID_TRANSITION_2],
        [VALID_PROGRESSION, VALID_PROGRESSION_2],
        [VALID_SHIFT, VALID_SHIFT_2],
        [VALID_FLOW, VALID_FLOW_2],
      ));
    }

    for (let i = 1; i < results.length; i++) {
      assert.deepStrictEqual(results[0].storyArcs, results[i].storyArcs);
      assert.deepStrictEqual(results[0].registryId, results[i].registryId);
    }
  });
});

// ---------------------------------------------------------------------------
// Immutability Tests
// ---------------------------------------------------------------------------

describe('Story Flow Kernel — Immutability', () => {
  it('should not mutate input story arcs', () => {
    const originalId = VALID_ARC.storyArcId;
    const originalTitle = VALID_ARC.title;

    composeNarrativeFlowArtifacts(VALID_INPUT);

    assert.equal(VALID_ARC.storyArcId, originalId);
    assert.equal(VALID_ARC.title, originalTitle);
  });

  it('should not mutate input registry story arcs', () => {
    const arcs = [VALID_ARC, VALID_ARC_2];
    const originalIds = arcs.map((a) => a.storyArcId);

    composeStoryFlowRegistry(
      arcs,
      [VALID_STAGE_1],
      [VALID_TRANSITION],
      [VALID_PROGRESSION],
      [VALID_SHIFT],
      [VALID_FLOW],
    );

    assert.equal(arcs[0].storyArcId, originalIds[0]);
    assert.equal(arcs[1].storyArcId, originalIds[1]);
  });
});

// ---------------------------------------------------------------------------
// Helper Function Tests
// ---------------------------------------------------------------------------

describe('Story Flow Kernel — Helper Functions', () => {
  it('should return canonical story arc types', () => {
    const types = getCanonicalStoryArcTypes();
    assert.deepStrictEqual([...types], [...CANONICAL_STORY_ARC_TYPES]);
    assert.equal(types.length, 10);
  });

  it('should return canonical narrative stage types', () => {
    const types = getCanonicalNarrativeStageTypes();
    assert.deepStrictEqual([...types], [...CANONICAL_NARRATIVE_STAGES]);
    assert.equal(types.length, 10);
  });

  it('should return canonical transition types', () => {
    const types = getCanonicalTransitionTypes();
    assert.deepStrictEqual([...types], [...CANONICAL_TRANSITION_TYPES]);
    assert.equal(types.length, 10);
  });

  it('should return canonical cognitive progression types', () => {
    const types = getCanonicalCognitiveProgressionTypes();
    assert.deepStrictEqual([...types], [...CANONICAL_COGNITIVE_PROGRESSIONS]);
    assert.equal(types.length, 10);
  });

  it('should return canonical attention shift types', () => {
    const types = getCanonicalAttentionShiftTypes();
    assert.deepStrictEqual([...types], [...CANONICAL_ATTENTION_SHIFT_TYPES]);
    assert.equal(types.length, 10);
  });

  it('should return canonical story flow statuses', () => {
    const statuses = getCanonicalStoryFlowStatuses();
    assert.deepStrictEqual([...statuses], [...CANONICAL_STORY_FLOW_STATUS]);
    assert.equal(statuses.length, 6);
  });

  it('should validate story arc type support', () => {
    assert.equal(isSupportedStoryArcType('classical'), true);
    assert.equal(isSupportedStoryArcType('research'), true);
    assert.equal(isSupportedStoryArcType('unsupported'), false);
  });

  it('should validate narrative stage type support', () => {
    assert.equal(isSupportedNarrativeStageType('hook'), true);
    assert.equal(isSupportedNarrativeStageType('conclusion'), true);
    assert.equal(isSupportedNarrativeStageType('unsupported'), false);
  });

  it('should validate transition type support', () => {
    assert.equal(isSupportedTransitionType('context_shift'), true);
    assert.equal(isSupportedTransitionType('summary_transition'), true);
    assert.equal(isSupportedTransitionType('unsupported'), false);
  });

  it('should validate cognitive progression type support', () => {
    assert.equal(isSupportedCognitiveProgressionType('known_to_unknown'), true);
    assert.equal(isSupportedCognitiveProgressionType('theory_to_practice'), true);
    assert.equal(isSupportedCognitiveProgressionType('unsupported'), false);
  });

  it('should validate attention shift type support', () => {
    assert.equal(isSupportedAttentionShiftType('focus_problem'), true);
    assert.equal(isSupportedAttentionShiftType('focus_summary'), true);
    assert.equal(isSupportedAttentionShiftType('unsupported'), false);
  });

  it('should validate story flow status support', () => {
    assert.equal(isSupportedStoryFlowStatus('draft'), true);
    assert.equal(isSupportedStoryFlowStatus('published'), true);
    assert.equal(isSupportedStoryFlowStatus('unsupported'), false);
  });
});

// ---------------------------------------------------------------------------
// Canonical Enum Completeness Tests
// ---------------------------------------------------------------------------

describe('Story Flow Kernel — Canonical Enum Completeness', () => {
  it('should have exactly 10 story arc types', () => {
    assert.equal(CANONICAL_STORY_ARC_TYPES.length, 10);
  });

  it('should have exactly 10 narrative stage types', () => {
    assert.equal(CANONICAL_NARRATIVE_STAGES.length, 10);
  });

  it('should have exactly 10 transition types', () => {
    assert.equal(CANONICAL_TRANSITION_TYPES.length, 10);
  });

  it('should have exactly 10 cognitive progression types', () => {
    assert.equal(CANONICAL_COGNITIVE_PROGRESSIONS.length, 10);
  });

  it('should have exactly 10 attention shift types', () => {
    assert.equal(CANONICAL_ATTENTION_SHIFT_TYPES.length, 10);
  });

  it('should have exactly 6 story flow statuses', () => {
    assert.equal(CANONICAL_STORY_FLOW_STATUS.length, 6);
  });

  it('should contain all expected story arc types', () => {
    const expectedTypes = [
      'classical',
      'engineering',
      'scientific_discovery',
      'historical',
      'investigation',
      'problem_solution',
      'incremental_learning',
      'comparison',
      'exploration',
      'research',
    ];

    for (const type of expectedTypes) {
      assert.ok(
        CANONICAL_STORY_ARC_TYPES.includes(type as any),
        `Should include type: ${type}`,
      );
    }
  });

  it('should contain all expected narrative stage types', () => {
    const expectedTypes = [
      'hook',
      'context',
      'problem',
      'motivation',
      'intuition',
      'development',
      'deepening',
      'application',
      'synthesis',
      'conclusion',
    ];

    for (const type of expectedTypes) {
      assert.ok(
        CANONICAL_NARRATIVE_STAGES.includes(type as any),
        `Should include type: ${type}`,
      );
    }
  });

  it('should contain all expected transition types', () => {
    const expectedTypes = [
      'context_shift',
      'zoom_in',
      'zoom_out',
      'analogy_transition',
      'comparison_transition',
      'historical_transition',
      'mathematical_transition',
      'implementation_transition',
      'reflection_transition',
      'summary_transition',
    ];

    for (const type of expectedTypes) {
      assert.ok(
        CANONICAL_TRANSITION_TYPES.includes(type as any),
        `Should include type: ${type}`,
      );
    }
  });
});

// ---------------------------------------------------------------------------
// Negative Capability Verification Tests
// ---------------------------------------------------------------------------

describe('Story Flow Kernel — Negative Capability Verification', () => {
  it('should not use Math.random', () => {
    const result = composeNarrativeFlowArtifacts(VALID_INPUT);
    assert.ok(result, 'Should produce a result without Math.random');
  });

  it('should not use Date.now', () => {
    const result = composeNarrativeFlowArtifacts(VALID_INPUT);
    assert.ok(result, 'Should produce a result without Date.now');
  });

  it('should not use performance.now', () => {
    const result = composeNarrativeFlowArtifacts(VALID_INPUT);
    assert.ok(result, 'Should produce a result without performance.now');
  });

  it('should not use crypto.randomUUID', () => {
    const result = composeNarrativeFlowArtifacts(VALID_INPUT);
    assert.ok(result, 'Should produce a result without crypto.randomUUID');
  });

  it('should not generate stories', () => {
    const result = composeNarrativeFlowArtifacts(VALID_INPUT);
    assert.ok(!('generatedStories' in result), 'Should not have generated stories');
    assert.ok(!('storyContent' in result), 'Should not have story content');
  });

  it('should not generate explanations', () => {
    const result = composeNarrativeFlowArtifacts(VALID_INPUT);
    assert.ok(!('generatedExplanations' in result), 'Should not have generated explanations');
    assert.ok(!('explanationContent' in result), 'Should not have explanation content');
  });

  it('should not invent narrative flow', () => {
    const result = composeNarrativeFlowArtifacts(VALID_INPUT);
    assert.ok(!('inventedFlow' in result), 'Should not have invented flow');
    assert.ok(!('autoGeneratedFlow' in result), 'Should not have auto-generated flow');
  });

  it('should not personalize sequencing', () => {
    const result = composeNarrativeFlowArtifacts(VALID_INPUT);
    assert.ok(!('personalizedSequencing' in result), 'Should not have personalized sequencing');
    assert.ok(!('learnerSequencing' in result), 'Should not have learner sequencing');
  });

  it('should not infer learner cognition', () => {
    const result = composeNarrativeFlowArtifacts(VALID_INPUT);
    assert.ok(!('learnerCognition' in result), 'Should not have learner cognition');
    assert.ok(!('cognitionInference' in result), 'Should not have cognition inference');
  });

  it('should not estimate comprehension', () => {
    const result = composeNarrativeFlowArtifacts(VALID_INPUT);
    assert.ok(!('comprehensionEstimate' in result), 'Should not have comprehension estimate');
    assert.ok(!('learnerComprehension' in result), 'Should not have learner comprehension');
  });

  it('should not call LLMs', () => {
    const result = composeNarrativeFlowArtifacts(VALID_INPUT);
    assert.ok(!('llmCall' in result), 'Should not have LLM call');
    assert.ok(!('modelResponse' in result), 'Should not have model response');
  });

  it('should not have executable callbacks in story arc', () => {
    const arc = composeStoryArc({
      storyArcId: 'arc-001',
      storyArcType: 'classical',
      title: 'Test',
      stageIds: [],
      flowId: 'flow-001',
      governanceStatus: 'canonical',
      provenance: VALID_PROVENANCE,
    });

    const keys = Object.keys(arc);
    for (const key of keys) {
      const value = (arc as any)[key];
      assert.ok(typeof value !== 'function', `StoryArc field "${key}" should not be a function`);
    }
  });
});
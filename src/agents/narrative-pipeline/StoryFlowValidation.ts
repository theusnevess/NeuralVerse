/**
 * NV-1700-D6-OPT-05 — Story Flow Validation Layer
 *
 * Deterministic validation for story flow metadata.
 * Returns structured errors, never exceptions for expected validation failures.
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import type {
  StoryArc,
  NarrativeStage,
  NarrativeTransition,
  CognitiveProgression,
  AttentionShift,
  NarrativeFlow,
  StoryFlowRegistry,
  StoryFlowInput,
  NarrativeArtifactWithStoryFlow,
  StoryFlowValidationError,
  StoryArcValidationResult,
  NarrativeStageValidationResult,
  NarrativeTransitionValidationResult,
  CognitiveProgressionValidationResult,
  AttentionShiftValidationResult,
  NarrativeFlowValidationResult,
  StoryFlowRegistryValidationResult,
  StoryFlowInputValidationResult,
  NarrativeArtifactWithStoryFlowValidationResult,
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

// ---------------------------------------------------------------------------
// Validation Error Codes
// ---------------------------------------------------------------------------

export const STORY_FLOW_VALIDATION_CODES = {
  STORY_FLOW_DUPLICATE_ARC_ID: 'STORY_FLOW_DUPLICATE_ARC_ID',
  STORY_FLOW_DUPLICATE_STAGE_ID: 'STORY_FLOW_DUPLICATE_STAGE_ID',
  STORY_FLOW_DUPLICATE_TRANSITION_ID: 'STORY_FLOW_DUPLICATE_TRANSITION_ID',
  STORY_FLOW_DUPLICATE_PROGRESSION_ID: 'STORY_FLOW_DUPLICATE_PROGRESSION_ID',
  STORY_FLOW_DUPLICATE_SHIFT_ID: 'STORY_FLOW_DUPLICATE_SHIFT_ID',
  STORY_FLOW_DUPLICATE_FLOW_ID: 'STORY_FLOW_DUPLICATE_FLOW_ID',
  STORY_FLOW_INVALID_ARC_TYPE: 'STORY_FLOW_INVALID_ARC_TYPE',
  STORY_FLOW_INVALID_STAGE_TYPE: 'STORY_FLOW_INVALID_STAGE_TYPE',
  STORY_FLOW_INVALID_TRANSITION_TYPE: 'STORY_FLOW_INVALID_TRANSITION_TYPE',
  STORY_FLOW_INVALID_PROGRESSION_TYPE: 'STORY_FLOW_INVALID_PROGRESSION_TYPE',
  STORY_FLOW_INVALID_SHIFT_TYPE: 'STORY_FLOW_INVALID_SHIFT_TYPE',
  STORY_FLOW_INVALID_GOVERNANCE_STATUS: 'STORY_FLOW_INVALID_GOVERNANCE_STATUS',
  STORY_FLOW_MISSING_PROVENANCE: 'STORY_FLOW_MISSING_PROVENANCE',
  STORY_FLOW_MISSING_SOURCE: 'STORY_FLOW_MISSING_SOURCE',
  STORY_FLOW_MISSING_RATIONALE: 'STORY_FLOW_MISSING_RATIONALE',
  STORY_FLOW_MISSING_PROVIDED_BY: 'STORY_FLOW_MISSING_PROVIDED_BY',
  STORY_FLOW_MISSING_ARC_ID: 'STORY_FLOW_MISSING_ARC_ID',
  STORY_FLOW_MISSING_TITLE: 'STORY_FLOW_MISSING_TITLE',
  STORY_FLOW_MISSING_FLOW_REFERENCE: 'STORY_FLOW_MISSING_FLOW_REFERENCE',
  STORY_FLOW_MISSING_STAGE_ID: 'STORY_FLOW_MISSING_STAGE_ID',
  STORY_FLOW_MISSING_TRANSITION_ID: 'STORY_FLOW_MISSING_TRANSITION_ID',
  STORY_FLOW_MISSING_PROGRESSION_ID: 'STORY_FLOW_MISSING_PROGRESSION_ID',
  STORY_FLOW_MISSING_SHIFT_ID: 'STORY_FLOW_MISSING_SHIFT_ID',
  STORY_FLOW_MISSING_FLOW_ID: 'STORY_FLOW_MISSING_FLOW_ID',
  STORY_FLOW_MISSING_DESCRIPTION: 'STORY_FLOW_MISSING_DESCRIPTION',
  STORY_FLOW_EMPTY_REGISTRY: 'STORY_FLOW_EMPTY_REGISTRY',
  STORY_FLOW_INVALID_TRACE: 'STORY_FLOW_INVALID_TRACE',
  STORY_FLOW_TRACE_RANDOM_USED: 'STORY_FLOW_TRACE_RANDOM_USED',
  STORY_FLOW_TRACE_TIME_DEPENDENCY: 'STORY_FLOW_TRACE_TIME_DEPENDENCY',
} as const;

// ---------------------------------------------------------------------------
// Single Story Arc Validation
// ---------------------------------------------------------------------------

/**
 * Validates a single story arc against canonical invariants.
 * Pure function. No side effects.
 */
export function validateStoryArc(
  arc: StoryArc,
): readonly StoryFlowValidationError[] {
  const errors: StoryFlowValidationError[] = [];

  if (!arc.storyArcId || arc.storyArcId.trim() === '') {
    errors.push({
      code: STORY_FLOW_VALIDATION_CODES.STORY_FLOW_MISSING_ARC_ID,
      message: 'Story arc is missing an arc ID.',
      field: 'storyArcId',
      storyArcId: arc.storyArcId,
    });
  }

  if (!arc.title || arc.title.trim() === '') {
    errors.push({
      code: STORY_FLOW_VALIDATION_CODES.STORY_FLOW_MISSING_TITLE,
      message: 'Story arc is missing a title.',
      field: 'title',
      storyArcId: arc.storyArcId,
    });
  }

  if (!CANONICAL_STORY_ARC_TYPES.includes(arc.storyArcType)) {
    errors.push({
      code: STORY_FLOW_VALIDATION_CODES.STORY_FLOW_INVALID_ARC_TYPE,
      message: `Story arc has unsupported type: "${arc.storyArcType}".`,
      field: 'storyArcType',
      storyArcId: arc.storyArcId,
    });
  }

  if (!CANONICAL_GOVERNANCE_STATUSES.includes(arc.governanceStatus)) {
    errors.push({
      code: STORY_FLOW_VALIDATION_CODES.STORY_FLOW_INVALID_GOVERNANCE_STATUS,
      message: `Story arc has invalid governance status: "${arc.governanceStatus}".`,
      field: 'governanceStatus',
      storyArcId: arc.storyArcId,
    });
  }

  if (!arc.provenance) {
    errors.push({
      code: STORY_FLOW_VALIDATION_CODES.STORY_FLOW_MISSING_PROVENANCE,
      message: 'Story arc is missing provenance.',
      field: 'provenance',
      storyArcId: arc.storyArcId,
    });
  } else {
    if (!arc.provenance.source || arc.provenance.source.trim() === '') {
      errors.push({
        code: STORY_FLOW_VALIDATION_CODES.STORY_FLOW_MISSING_SOURCE,
        message: 'Story arc provenance is missing a source.',
        field: 'provenance.source',
        storyArcId: arc.storyArcId,
      });
    }

    if (!arc.provenance.rationale || arc.provenance.rationale.trim() === '') {
      errors.push({
        code: STORY_FLOW_VALIDATION_CODES.STORY_FLOW_MISSING_RATIONALE,
        message: 'Story arc provenance is missing a rationale.',
        field: 'provenance.rationale',
        storyArcId: arc.storyArcId,
      });
    }

    if (!arc.provenance.providedBy || arc.provenance.providedBy.trim() === '') {
      errors.push({
        code: STORY_FLOW_VALIDATION_CODES.STORY_FLOW_MISSING_PROVIDED_BY,
        message: 'Story arc provenance is missing providedBy.',
        field: 'provenance.providedBy',
        storyArcId: arc.storyArcId,
      });
    }
  }

  if (!arc.flowId || arc.flowId.trim() === '') {
    errors.push({
      code: STORY_FLOW_VALIDATION_CODES.STORY_FLOW_MISSING_FLOW_REFERENCE,
      message: 'Story arc is missing a flow reference.',
      field: 'flowId',
      storyArcId: arc.storyArcId,
    });
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Single Narrative Stage Validation
// ---------------------------------------------------------------------------

/**
 * Validates a single narrative stage against canonical invariants.
 * Pure function. No side effects.
 */
export function validateNarrativeStage(
  stage: NarrativeStage,
): readonly StoryFlowValidationError[] {
  const errors: StoryFlowValidationError[] = [];

  if (!stage.stageId || stage.stageId.trim() === '') {
    errors.push({
      code: STORY_FLOW_VALIDATION_CODES.STORY_FLOW_MISSING_STAGE_ID,
      message: 'Narrative stage is missing a stage ID.',
      field: 'stageId',
      stageId: stage.stageId,
    });
  }

  if (!stage.title || stage.title.trim() === '') {
    errors.push({
      code: STORY_FLOW_VALIDATION_CODES.STORY_FLOW_MISSING_TITLE,
      message: 'Narrative stage is missing a title.',
      field: 'title',
      stageId: stage.stageId,
    });
  }

  if (!CANONICAL_NARRATIVE_STAGES.includes(stage.stageType)) {
    errors.push({
      code: STORY_FLOW_VALIDATION_CODES.STORY_FLOW_INVALID_STAGE_TYPE,
      message: `Narrative stage has unsupported type: "${stage.stageType}".`,
      field: 'stageType',
      stageId: stage.stageId,
    });
  }

  if (!stage.provenance) {
    errors.push({
      code: STORY_FLOW_VALIDATION_CODES.STORY_FLOW_MISSING_PROVENANCE,
      message: 'Narrative stage is missing provenance.',
      field: 'provenance',
      stageId: stage.stageId,
    });
  } else {
    if (!stage.provenance.source || stage.provenance.source.trim() === '') {
      errors.push({
        code: STORY_FLOW_VALIDATION_CODES.STORY_FLOW_MISSING_SOURCE,
        message: 'Narrative stage provenance is missing a source.',
        field: 'provenance.source',
        stageId: stage.stageId,
      });
    }

    if (!stage.provenance.rationale || stage.provenance.rationale.trim() === '') {
      errors.push({
        code: STORY_FLOW_VALIDATION_CODES.STORY_FLOW_MISSING_RATIONALE,
        message: 'Narrative stage provenance is missing a rationale.',
        field: 'provenance.rationale',
        stageId: stage.stageId,
      });
    }

    if (!stage.provenance.providedBy || stage.provenance.providedBy.trim() === '') {
      errors.push({
        code: STORY_FLOW_VALIDATION_CODES.STORY_FLOW_MISSING_PROVIDED_BY,
        message: 'Narrative stage provenance is missing providedBy.',
        field: 'provenance.providedBy',
        stageId: stage.stageId,
      });
    }
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Single Narrative Transition Validation
// ---------------------------------------------------------------------------

/**
 * Validates a single narrative transition against canonical invariants.
 * Pure function. No side effects.
 */
export function validateNarrativeTransition(
  transition: NarrativeTransition,
): readonly StoryFlowValidationError[] {
  const errors: StoryFlowValidationError[] = [];

  if (!transition.transitionId || transition.transitionId.trim() === '') {
    errors.push({
      code: STORY_FLOW_VALIDATION_CODES.STORY_FLOW_MISSING_TRANSITION_ID,
      message: 'Narrative transition is missing a transition ID.',
      field: 'transitionId',
      transitionId: transition.transitionId,
    });
  }

  if (!transition.description || transition.description.trim() === '') {
    errors.push({
      code: STORY_FLOW_VALIDATION_CODES.STORY_FLOW_MISSING_DESCRIPTION,
      message: 'Narrative transition is missing a description.',
      field: 'description',
      transitionId: transition.transitionId,
    });
  }

  if (!CANONICAL_TRANSITION_TYPES.includes(transition.transitionType)) {
    errors.push({
      code: STORY_FLOW_VALIDATION_CODES.STORY_FLOW_INVALID_TRANSITION_TYPE,
      message: `Narrative transition has unsupported type: "${transition.transitionType}".`,
      field: 'transitionType',
      transitionId: transition.transitionId,
    });
  }

  if (!transition.provenance) {
    errors.push({
      code: STORY_FLOW_VALIDATION_CODES.STORY_FLOW_MISSING_PROVENANCE,
      message: 'Narrative transition is missing provenance.',
      field: 'provenance',
      transitionId: transition.transitionId,
    });
  } else {
    if (!transition.provenance.source || transition.provenance.source.trim() === '') {
      errors.push({
        code: STORY_FLOW_VALIDATION_CODES.STORY_FLOW_MISSING_SOURCE,
        message: 'Narrative transition provenance is missing a source.',
        field: 'provenance.source',
        transitionId: transition.transitionId,
      });
    }

    if (!transition.provenance.rationale || transition.provenance.rationale.trim() === '') {
      errors.push({
        code: STORY_FLOW_VALIDATION_CODES.STORY_FLOW_MISSING_RATIONALE,
        message: 'Narrative transition provenance is missing a rationale.',
        field: 'provenance.rationale',
        transitionId: transition.transitionId,
      });
    }

    if (!transition.provenance.providedBy || transition.provenance.providedBy.trim() === '') {
      errors.push({
        code: STORY_FLOW_VALIDATION_CODES.STORY_FLOW_MISSING_PROVIDED_BY,
        message: 'Narrative transition provenance is missing providedBy.',
        field: 'provenance.providedBy',
        transitionId: transition.transitionId,
      });
    }
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Single Cognitive Progression Validation
// ---------------------------------------------------------------------------

/**
 * Validates a single cognitive progression against canonical invariants.
 * Pure function. No side effects.
 */
export function validateCognitiveProgression(
  progression: CognitiveProgression,
): readonly StoryFlowValidationError[] {
  const errors: StoryFlowValidationError[] = [];

  if (!progression.progressionId || progression.progressionId.trim() === '') {
    errors.push({
      code: STORY_FLOW_VALIDATION_CODES.STORY_FLOW_MISSING_PROGRESSION_ID,
      message: 'Cognitive progression is missing a progression ID.',
      field: 'progressionId',
      progressionId: progression.progressionId,
    });
  }

  if (!progression.description || progression.description.trim() === '') {
    errors.push({
      code: STORY_FLOW_VALIDATION_CODES.STORY_FLOW_MISSING_DESCRIPTION,
      message: 'Cognitive progression is missing a description.',
      field: 'description',
      progressionId: progression.progressionId,
    });
  }

  if (!CANONICAL_COGNITIVE_PROGRESSIONS.includes(progression.progressionType)) {
    errors.push({
      code: STORY_FLOW_VALIDATION_CODES.STORY_FLOW_INVALID_PROGRESSION_TYPE,
      message: `Cognitive progression has unsupported type: "${progression.progressionType}".`,
      field: 'progressionType',
      progressionId: progression.progressionId,
    });
  }

  if (!progression.provenance) {
    errors.push({
      code: STORY_FLOW_VALIDATION_CODES.STORY_FLOW_MISSING_PROVENANCE,
      message: 'Cognitive progression is missing provenance.',
      field: 'provenance',
      progressionId: progression.progressionId,
    });
  } else {
    if (!progression.provenance.source || progression.provenance.source.trim() === '') {
      errors.push({
        code: STORY_FLOW_VALIDATION_CODES.STORY_FLOW_MISSING_SOURCE,
        message: 'Cognitive progression provenance is missing a source.',
        field: 'provenance.source',
        progressionId: progression.progressionId,
      });
    }

    if (!progression.provenance.rationale || progression.provenance.rationale.trim() === '') {
      errors.push({
        code: STORY_FLOW_VALIDATION_CODES.STORY_FLOW_MISSING_RATIONALE,
        message: 'Cognitive progression provenance is missing a rationale.',
        field: 'provenance.rationale',
        progressionId: progression.progressionId,
      });
    }

    if (!progression.provenance.providedBy || progression.provenance.providedBy.trim() === '') {
      errors.push({
        code: STORY_FLOW_VALIDATION_CODES.STORY_FLOW_MISSING_PROVIDED_BY,
        message: 'Cognitive progression provenance is missing providedBy.',
        field: 'provenance.providedBy',
        progressionId: progression.progressionId,
      });
    }
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Single Attention Shift Validation
// ---------------------------------------------------------------------------

/**
 * Validates a single attention shift against canonical invariants.
 * Pure function. No side effects.
 */
export function validateAttentionShift(
  shift: AttentionShift,
): readonly StoryFlowValidationError[] {
  const errors: StoryFlowValidationError[] = [];

  if (!shift.shiftId || shift.shiftId.trim() === '') {
    errors.push({
      code: STORY_FLOW_VALIDATION_CODES.STORY_FLOW_MISSING_SHIFT_ID,
      message: 'Attention shift is missing a shift ID.',
      field: 'shiftId',
      shiftId: shift.shiftId,
    });
  }

  if (!shift.description || shift.description.trim() === '') {
    errors.push({
      code: STORY_FLOW_VALIDATION_CODES.STORY_FLOW_MISSING_DESCRIPTION,
      message: 'Attention shift is missing a description.',
      field: 'description',
      shiftId: shift.shiftId,
    });
  }

  if (!CANONICAL_ATTENTION_SHIFT_TYPES.includes(shift.shiftType)) {
    errors.push({
      code: STORY_FLOW_VALIDATION_CODES.STORY_FLOW_INVALID_SHIFT_TYPE,
      message: `Attention shift has unsupported type: "${shift.shiftType}".`,
      field: 'shiftType',
      shiftId: shift.shiftId,
    });
  }

  if (!shift.provenance) {
    errors.push({
      code: STORY_FLOW_VALIDATION_CODES.STORY_FLOW_MISSING_PROVENANCE,
      message: 'Attention shift is missing provenance.',
      field: 'provenance',
      shiftId: shift.shiftId,
    });
  } else {
    if (!shift.provenance.source || shift.provenance.source.trim() === '') {
      errors.push({
        code: STORY_FLOW_VALIDATION_CODES.STORY_FLOW_MISSING_SOURCE,
        message: 'Attention shift provenance is missing a source.',
        field: 'provenance.source',
        shiftId: shift.shiftId,
      });
    }

    if (!shift.provenance.rationale || shift.provenance.rationale.trim() === '') {
      errors.push({
        code: STORY_FLOW_VALIDATION_CODES.STORY_FLOW_MISSING_RATIONALE,
        message: 'Attention shift provenance is missing a rationale.',
        field: 'provenance.rationale',
        shiftId: shift.shiftId,
      });
    }

    if (!shift.provenance.providedBy || shift.provenance.providedBy.trim() === '') {
      errors.push({
        code: STORY_FLOW_VALIDATION_CODES.STORY_FLOW_MISSING_PROVIDED_BY,
        message: 'Attention shift provenance is missing providedBy.',
        field: 'provenance.providedBy',
        shiftId: shift.shiftId,
      });
    }
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Narrative Flow Validation
// ---------------------------------------------------------------------------

/**
 * Validates a narrative flow against canonical invariants.
 * Pure function. No side effects.
 */
export function validateNarrativeFlow(
  flow: NarrativeFlow,
): readonly StoryFlowValidationError[] {
  const errors: StoryFlowValidationError[] = [];

  if (!flow.flowId || flow.flowId.trim() === '') {
    errors.push({
      code: STORY_FLOW_VALIDATION_CODES.STORY_FLOW_MISSING_FLOW_ID,
      message: 'Narrative flow is missing a flow ID.',
      field: 'flowId',
      flowId: flow.flowId,
    });
  }

  if (!flow.storyArcId || flow.storyArcId.trim() === '') {
    errors.push({
      code: STORY_FLOW_VALIDATION_CODES.STORY_FLOW_MISSING_FLOW_REFERENCE,
      message: 'Narrative flow is missing a story arc reference.',
      field: 'storyArcId',
      flowId: flow.flowId,
    });
  }

  if (!flow.provenance) {
    errors.push({
      code: STORY_FLOW_VALIDATION_CODES.STORY_FLOW_MISSING_PROVENANCE,
      message: 'Narrative flow is missing provenance.',
      field: 'provenance',
      flowId: flow.flowId,
    });
  } else {
    if (!flow.provenance.source || flow.provenance.source.trim() === '') {
      errors.push({
        code: STORY_FLOW_VALIDATION_CODES.STORY_FLOW_MISSING_SOURCE,
        message: 'Narrative flow provenance is missing a source.',
        field: 'provenance.source',
        flowId: flow.flowId,
      });
    }

    if (!flow.provenance.rationale || flow.provenance.rationale.trim() === '') {
      errors.push({
        code: STORY_FLOW_VALIDATION_CODES.STORY_FLOW_MISSING_RATIONALE,
        message: 'Narrative flow provenance is missing a rationale.',
        field: 'provenance.rationale',
        flowId: flow.flowId,
      });
    }

    if (!flow.provenance.providedBy || flow.provenance.providedBy.trim() === '') {
      errors.push({
        code: STORY_FLOW_VALIDATION_CODES.STORY_FLOW_MISSING_PROVIDED_BY,
        message: 'Narrative flow provenance is missing providedBy.',
        field: 'provenance.providedBy',
        flowId: flow.flowId,
      });
    }
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Story Flow Registry Validation
// ---------------------------------------------------------------------------

/**
 * Validates a story flow registry against canonical invariants.
 * Pure function. No side effects.
 */
export function validateStoryFlowRegistry(
  registry: StoryFlowRegistry,
): StoryFlowRegistryValidationResult {
  const errors: StoryFlowValidationError[] = [];

  if (!registry.registryId || registry.registryId.trim() === '') {
    errors.push({
      code: STORY_FLOW_VALIDATION_CODES.STORY_FLOW_EMPTY_REGISTRY,
      message: 'Story flow registry is missing a registry ID.',
      field: 'registryId',
    });
  }

  if (registry.deterministic !== true) {
    errors.push({
      code: STORY_FLOW_VALIDATION_CODES.STORY_FLOW_INVALID_TRACE,
      message: 'Story flow registry must declare deterministic: true.',
      field: 'deterministic',
    });
  }

  if (registry.randomUsed !== false) {
    errors.push({
      code: STORY_FLOW_VALIDATION_CODES.STORY_FLOW_TRACE_RANDOM_USED,
      message: 'Story flow registry must declare randomUsed: false.',
      field: 'randomUsed',
    });
  }

  if (registry.timeDependency !== false) {
    errors.push({
      code: STORY_FLOW_VALIDATION_CODES.STORY_FLOW_TRACE_TIME_DEPENDENCY,
      message: 'Story flow registry must declare timeDependency: false.',
      field: 'timeDependency',
    });
  }

  // Check for duplicate story arc IDs
  const seenArcIds = new Set<string>();
  for (const arc of registry.storyArcs) {
    if (seenArcIds.has(arc.storyArcId)) {
      errors.push({
        code: STORY_FLOW_VALIDATION_CODES.STORY_FLOW_DUPLICATE_ARC_ID,
        message: `Duplicate story arc ID: "${arc.storyArcId}".`,
        storyArcId: arc.storyArcId,
      });
    }
    seenArcIds.add(arc.storyArcId);
  }

  // Check for duplicate stage IDs
  const seenStageIds = new Set<string>();
  for (const stage of registry.stages) {
    if (seenStageIds.has(stage.stageId)) {
      errors.push({
        code: STORY_FLOW_VALIDATION_CODES.STORY_FLOW_DUPLICATE_STAGE_ID,
        message: `Duplicate stage ID: "${stage.stageId}".`,
        stageId: stage.stageId,
      });
    }
    seenStageIds.add(stage.stageId);
  }

  // Check for duplicate transition IDs
  const seenTransitionIds = new Set<string>();
  for (const transition of registry.transitions) {
    if (seenTransitionIds.has(transition.transitionId)) {
      errors.push({
        code: STORY_FLOW_VALIDATION_CODES.STORY_FLOW_DUPLICATE_TRANSITION_ID,
        message: `Duplicate transition ID: "${transition.transitionId}".`,
        transitionId: transition.transitionId,
      });
    }
    seenTransitionIds.add(transition.transitionId);
  }

  // Check for duplicate progression IDs
  const seenProgressionIds = new Set<string>();
  for (const progression of registry.progressions) {
    if (seenProgressionIds.has(progression.progressionId)) {
      errors.push({
        code: STORY_FLOW_VALIDATION_CODES.STORY_FLOW_DUPLICATE_PROGRESSION_ID,
        message: `Duplicate progression ID: "${progression.progressionId}".`,
        progressionId: progression.progressionId,
      });
    }
    seenProgressionIds.add(progression.progressionId);
  }

  // Check for duplicate shift IDs
  const seenShiftIds = new Set<string>();
  for (const shift of registry.attentionShifts) {
    if (seenShiftIds.has(shift.shiftId)) {
      errors.push({
        code: STORY_FLOW_VALIDATION_CODES.STORY_FLOW_DUPLICATE_SHIFT_ID,
        message: `Duplicate shift ID: "${shift.shiftId}".`,
        shiftId: shift.shiftId,
      });
    }
    seenShiftIds.add(shift.shiftId);
  }

  // Check for duplicate flow IDs
  const seenFlowIds = new Set<string>();
  for (const flow of registry.flows) {
    if (seenFlowIds.has(flow.flowId)) {
      errors.push({
        code: STORY_FLOW_VALIDATION_CODES.STORY_FLOW_DUPLICATE_FLOW_ID,
        message: `Duplicate flow ID: "${flow.flowId}".`,
        flowId: flow.flowId,
      });
    }
    seenFlowIds.add(flow.flowId);
  }

  // Validate each entity
  for (const arc of registry.storyArcs) {
    errors.push(...validateStoryArc(arc));
  }

  for (const stage of registry.stages) {
    errors.push(...validateNarrativeStage(stage));
  }

  for (const transition of registry.transitions) {
    errors.push(...validateNarrativeTransition(transition));
  }

  for (const progression of registry.progressions) {
    errors.push(...validateCognitiveProgression(progression));
  }

  for (const shift of registry.attentionShifts) {
    errors.push(...validateAttentionShift(shift));
  }

  for (const flow of registry.flows) {
    errors.push(...validateNarrativeFlow(flow));
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'story_flow_registry_composition',
  };
}

// ---------------------------------------------------------------------------
// Story Flow Input Validation
// ---------------------------------------------------------------------------

/**
 * Validates story flow input against canonical invariants.
 * Pure function. No side effects.
 */
export function validateStoryFlowInput(
  input: StoryFlowInput,
): StoryFlowInputValidationResult {
  const errors: StoryFlowValidationError[] = [];

  for (const arc of input.storyArcs) {
    errors.push(...validateStoryArc(arc));
  }

  for (const stage of input.stages) {
    errors.push(...validateNarrativeStage(stage));
  }

  for (const transition of input.transitions) {
    errors.push(...validateNarrativeTransition(transition));
  }

  for (const progression of input.progressions) {
    errors.push(...validateCognitiveProgression(progression));
  }

  for (const shift of input.attentionShifts) {
    errors.push(...validateAttentionShift(shift));
  }

  for (const flow of input.flows) {
    errors.push(...validateNarrativeFlow(flow));
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'story_flow_input_composition',
  };
}

// ---------------------------------------------------------------------------
// Narrative Artifact With Story Flow Validation
// ---------------------------------------------------------------------------

/**
 * Validates a narrative artifact with story flow against canonical invariants.
 * Pure function. No side effects.
 */
export function validateNarrativeArtifactWithStoryFlow(
  artifact: NarrativeArtifactWithStoryFlow,
): NarrativeArtifactWithStoryFlowValidationResult {
  const errors: StoryFlowValidationError[] = [];

  if (!artifact.narrativeId || artifact.narrativeId.trim() === '') {
    errors.push({
      code: STORY_FLOW_VALIDATION_CODES.STORY_FLOW_MISSING_ARC_ID,
      message: 'Narrative artifact with story flow is missing a narrative ID.',
      field: 'narrativeId',
    });
  }

  for (const arc of artifact.storyArcs) {
    errors.push(...validateStoryArc(arc));
  }

  for (const stage of artifact.stages) {
    errors.push(...validateNarrativeStage(stage));
  }

  for (const transition of artifact.transitions) {
    errors.push(...validateNarrativeTransition(transition));
  }

  for (const progression of artifact.progressions) {
    errors.push(...validateCognitiveProgression(progression));
  }

  for (const shift of artifact.attentionShifts) {
    errors.push(...validateAttentionShift(shift));
  }

  for (const flow of artifact.flows) {
    errors.push(...validateNarrativeFlow(flow));
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'narrative_artifact_with_story_flow_composition',
  };
}

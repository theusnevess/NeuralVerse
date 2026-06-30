/**
 * NV-1700-D6-OPT-05 — Story Arc, Cognitive Progression & Narrative Flow Kernel
 *
 * Deterministic orchestration functions for story flow metadata.
 * Produces story arcs, stages, transitions, progressions, shifts, and registries.
 *
 * This module never:
 * - Generates stories
 * - Generates explanations
 * - Invents narrative flow
 * - Personalizes sequencing
 * - Infers learner cognition
 * - Estimates comprehension
 * - Executes storytelling
 * - Calls LLMs
 * - Calls external APIs
 * - Mutates knowledge
 *
 * Story flow metadata only.
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import type {
  StoryArcProvenance,
  NarrativeGovernanceStatus,
  StoryArcType,
  NarrativeStageType,
  TransitionType,
  CognitiveProgressionType,
  AttentionShiftType,
  StoryFlowStatus,
  StoryArc,
  NarrativeStage,
  NarrativeTransition,
  CognitiveProgression,
  AttentionShift,
  NarrativeFlow,
  StoryFlowDecision,
  StoryFlowTrace,
  StoryFlowRegistry,
  StoryFlowRegistryMetadata,
  StoryFlowInput,
  NarrativeUnitType,
  NarrativeMode,
  NarrativeDomain,
  NarrativeStatus,
  NarrativeProvenance,
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

// ---------------------------------------------------------------------------
// Story Arc Provenance Composition
// ---------------------------------------------------------------------------

/**
 * Composes story arc provenance from provided parameters.
 * Pure function. No side effects.
 */
export function composeStoryArcProvenance(params: {
  readonly source: string;
  readonly governanceStatus: NarrativeGovernanceStatus;
  readonly providedBy: string;
  readonly rationale: string;
}): StoryArcProvenance {
  return {
    source: params.source,
    governanceStatus: params.governanceStatus,
    providedBy: params.providedBy,
    rationale: params.rationale,
  };
}

// ---------------------------------------------------------------------------
// Story Arc Composition
// ---------------------------------------------------------------------------

/**
 * Composes a story arc from provided parameters.
 * Pure function. No side effects.
 */
export function composeStoryArc(params: {
  readonly storyArcId: string;
  readonly storyArcType: StoryArcType;
  readonly title: string;
  readonly stageIds: readonly string[];
  readonly flowId: string;
  readonly governanceStatus: NarrativeGovernanceStatus;
  readonly provenance: StoryArcProvenance;
}): StoryArc {
  return {
    storyArcId: params.storyArcId,
    storyArcType: params.storyArcType,
    title: params.title,
    stageIds: [...params.stageIds],
    flowId: params.flowId,
    governanceStatus: params.governanceStatus,
    provenance: params.provenance,
  };
}

// ---------------------------------------------------------------------------
// Narrative Stage Composition
// ---------------------------------------------------------------------------

/**
 * Composes a narrative stage from provided parameters.
 * Pure function. No side effects.
 */
export function composeNarrativeStage(params: {
  readonly stageId: string;
  readonly stageType: NarrativeStageType;
  readonly title: string;
  readonly description: string;
  readonly order: number;
  readonly governanceStatus: NarrativeGovernanceStatus;
  readonly provenance: StoryArcProvenance;
}): NarrativeStage {
  return {
    stageId: params.stageId,
    stageType: params.stageType,
    title: params.title,
    description: params.description,
    order: params.order,
    governanceStatus: params.governanceStatus,
    provenance: params.provenance,
  };
}

// ---------------------------------------------------------------------------
// Narrative Transition Composition
// ---------------------------------------------------------------------------

/**
 * Composes a narrative transition from provided parameters.
 * Pure function. No side effects.
 */
export function composeNarrativeTransition(params: {
  readonly transitionId: string;
  readonly transitionType: TransitionType;
  readonly sourceStageId: string;
  readonly targetStageId: string;
  readonly description: string;
  readonly governanceStatus: NarrativeGovernanceStatus;
  readonly provenance: StoryArcProvenance;
}): NarrativeTransition {
  return {
    transitionId: params.transitionId,
    transitionType: params.transitionType,
    sourceStageId: params.sourceStageId,
    targetStageId: params.targetStageId,
    description: params.description,
    governanceStatus: params.governanceStatus,
    provenance: params.provenance,
  };
}

// ---------------------------------------------------------------------------
// Cognitive Progression Composition
// ---------------------------------------------------------------------------

/**
 * Composes a cognitive progression from provided parameters.
 * Pure function. No side effects.
 */
export function composeCognitiveProgression(params: {
  readonly progressionId: string;
  readonly progressionType: CognitiveProgressionType;
  readonly sourceConceptId: string;
  readonly targetConceptId: string;
  readonly description: string;
  readonly governanceStatus: NarrativeGovernanceStatus;
  readonly provenance: StoryArcProvenance;
}): CognitiveProgression {
  return {
    progressionId: params.progressionId,
    progressionType: params.progressionType,
    sourceConceptId: params.sourceConceptId,
    targetConceptId: params.targetConceptId,
    description: params.description,
    governanceStatus: params.governanceStatus,
    provenance: params.provenance,
  };
}

// ---------------------------------------------------------------------------
// Attention Shift Composition
// ---------------------------------------------------------------------------

/**
 * Composes an attention shift from provided parameters.
 * Pure function. No side effects.
 */
export function composeAttentionShift(params: {
  readonly shiftId: string;
  readonly shiftType: AttentionShiftType;
  readonly trigger: string;
  readonly destination: string;
  readonly description: string;
  readonly governanceStatus: NarrativeGovernanceStatus;
  readonly provenance: StoryArcProvenance;
}): AttentionShift {
  return {
    shiftId: params.shiftId,
    shiftType: params.shiftType,
    trigger: params.trigger,
    destination: params.destination,
    description: params.description,
    governanceStatus: params.governanceStatus,
    provenance: params.provenance,
  };
}

// ---------------------------------------------------------------------------
// Narrative Flow Composition
// ---------------------------------------------------------------------------

/**
 * Composes a narrative flow from provided parameters.
 * Pure function. No side effects.
 */
export function composeNarrativeFlow(params: {
  readonly flowId: string;
  readonly storyArcId: string;
  readonly transitionIds: readonly string[];
  readonly progressionIds: readonly string[];
  readonly attentionShiftIds: readonly string[];
  readonly governanceStatus: NarrativeGovernanceStatus;
  readonly provenance: StoryArcProvenance;
}): NarrativeFlow {
  return {
    flowId: params.flowId,
    storyArcId: params.storyArcId,
    transitionIds: [...params.transitionIds],
    progressionIds: [...params.progressionIds],
    attentionShiftIds: [...params.attentionShiftIds],
    governanceStatus: params.governanceStatus,
    provenance: params.provenance,
  };
}

// ---------------------------------------------------------------------------
// Story Flow Decision Composition
// ---------------------------------------------------------------------------

/**
 * Composes a story flow decision from validation results.
 * Pure function. No side effects.
 */
function _composeStoryFlowDecision(
  storyArcId: string,
  validationPassed: boolean,
  validationErrors: readonly string[],
): StoryFlowDecision {
  return {
    decisionId: `_decision_${storyArcId}`,
    storyArcId,
    validationPassed,
    validationErrors,
  };
}

// ---------------------------------------------------------------------------
// Story Flow Trace Composition
// ---------------------------------------------------------------------------

/**
 * Composes a story flow trace from decisions and metadata.
 * Pure function. No side effects.
 */
export function composeStoryFlowTrace(params: {
  readonly traceId: string;
  readonly decisions: readonly StoryFlowDecision[];
  readonly registryVersion: string;
  readonly pipelineVersion: string;
  readonly storyArcCount: number;
  readonly stageCount: number;
  readonly transitionCount: number;
  readonly progressionCount: number;
  readonly attentionShiftCount: number;
  readonly flowCount: number;
}): StoryFlowTrace {
  return {
    traceId: params.traceId,
    decisionCount: params.decisions.length,
    validationCount: params.decisions.filter((d) => d.validationPassed).length,
    storyArcCount: params.storyArcCount,
    stageCount: params.stageCount,
    transitionCount: params.transitionCount,
    progressionCount: params.progressionCount,
    attentionShiftCount: params.attentionShiftCount,
    flowCount: params.flowCount,
    registryVersion: params.registryVersion,
    pipelineVersion: params.pipelineVersion,
    compositionMetadata: {},
    deterministicMetadata: {},
    deterministic: true,
    generatedFrom: 'deterministic_story_flow_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Narrative Artifact With Story Flow Composition
// ---------------------------------------------------------------------------

/**
 * Composes a narrative artifact with applied story flow.
 * Pure function. No side effects.
 */
export function composeNarrativeArtifactWithStoryFlow(params: {
  readonly narrativeId: string;
  readonly title: string;
  readonly unitType: NarrativeUnitType;
  readonly narrativeMode: NarrativeMode;
  readonly domain: NarrativeDomain;
  readonly status: NarrativeStatus;
  readonly canonicalKnowledgeId: string;
  readonly curriculumNodeId: string;
  readonly lessonId: string;
  readonly laboratoryId: string;
  readonly sequenceOrder: number;
  readonly summary: string;
  readonly tags: readonly string[];
  readonly provenance: NarrativeProvenance;
  readonly storyArcs: readonly StoryArc[];
  readonly stages: readonly NarrativeStage[];
  readonly transitions: readonly NarrativeTransition[];
  readonly progressions: readonly CognitiveProgression[];
  readonly attentionShifts: readonly AttentionShift[];
  readonly flows: readonly NarrativeFlow[];
}): NarrativeArtifactWithStoryFlow {
  return {
    narrativeId: params.narrativeId,
    title: params.title,
    unitType: params.unitType,
    narrativeMode: params.narrativeMode,
    domain: params.domain,
    status: params.status,
    canonicalKnowledgeId: params.canonicalKnowledgeId,
    curriculumNodeId: params.curriculumNodeId,
    lessonId: params.lessonId,
    laboratoryId: params.laboratoryId,
    sequenceOrder: params.sequenceOrder,
    summary: params.summary,
    tags: [...params.tags],
    provenance: params.provenance,
    storyArcs: [...params.storyArcs],
    stages: [...params.stages],
    transitions: [...params.transitions],
    progressions: [...params.progressions],
    attentionShifts: [...params.attentionShifts],
    flows: [...params.flows],
  };
}

// ---------------------------------------------------------------------------
// Deterministic Sort Comparators
// ---------------------------------------------------------------------------

/**
 * Deterministic comparator for story arcs.
 * Sorts by storyArcId, then storyArcType, then title.
 * Pure function. No side effects.
 */
function _compareStoryArc(a: StoryArc, b: StoryArc): number {
  if (a.storyArcId < b.storyArcId) return -1;
  if (a.storyArcId > b.storyArcId) return 1;

  if (a.storyArcType < b.storyArcType) return -1;
  if (a.storyArcType > b.storyArcType) return 1;

  if (a.title < b.title) return -1;
  if (a.title > b.title) return 1;

  return 0;
}

/**
 * Deterministic comparator for narrative stages.
 * Sorts by stageId, then order.
 * Pure function. No side effects.
 */
function _compareStage(a: NarrativeStage, b: NarrativeStage): number {
  if (a.stageId < b.stageId) return -1;
  if (a.stageId > b.stageId) return 1;

  if (a.order < b.order) return -1;
  if (a.order > b.order) return 1;

  return 0;
}

/**
 * Deterministic comparator for transitions.
 * Sorts by transitionId, then transitionType.
 * Pure function. No side effects.
 */
function _compareTransition(a: NarrativeTransition, b: NarrativeTransition): number {
  if (a.transitionId < b.transitionId) return -1;
  if (a.transitionId > b.transitionId) return 1;

  if (a.transitionType < b.transitionType) return -1;
  if (a.transitionType > b.transitionType) return 1;

  return 0;
}

/**
 * Deterministic comparator for cognitive progressions.
 * Sorts by progressionId, then progressionType.
 * Pure function. No side effects.
 */
function _compareProgression(a: CognitiveProgression, b: CognitiveProgression): number {
  if (a.progressionId < b.progressionId) return -1;
  if (a.progressionId > b.progressionId) return 1;

  if (a.progressionType < b.progressionType) return -1;
  if (a.progressionType > b.progressionType) return 1;

  return 0;
}

/**
 * Deterministic comparator for attention shifts.
 * Sorts by shiftId, then shiftType.
 * Pure function. No side effects.
 */
function _compareShift(a: AttentionShift, b: AttentionShift): number {
  if (a.shiftId < b.shiftId) return -1;
  if (a.shiftId > b.shiftId) return 1;

  if (a.shiftType < b.shiftType) return -1;
  if (a.shiftType > b.shiftType) return 1;

  return 0;
}

/**
 * Deterministic comparator for narrative flows.
 * Sorts by flowId.
 * Pure function. No side effects.
 */
function _compareFlow(a: NarrativeFlow, b: NarrativeFlow): number {
  if (a.flowId < b.flowId) return -1;
  if (a.flowId > b.flowId) return 1;

  return 0;
}

// ---------------------------------------------------------------------------
// Story Flow Registry Composition
// ---------------------------------------------------------------------------

/**
 * Composes a story flow registry from input data.
 * Pure function. No side effects.
 * Deterministic ordering for all collections.
 */
export function composeStoryFlowRegistry(
  storyArcs: readonly StoryArc[],
  stages: readonly NarrativeStage[],
  transitions: readonly NarrativeTransition[],
  progressions: readonly CognitiveProgression[],
  attentionShifts: readonly AttentionShift[],
  flows: readonly NarrativeFlow[],
): StoryFlowRegistry {
  const sortedStoryArcs = [...storyArcs].sort(_compareStoryArc);
  const sortedStages = [...stages].sort(_compareStage);
  const sortedTransitions = [...transitions].sort(_compareTransition);
  const sortedProgressions = [...progressions].sort(_compareProgression);
  const sortedShifts = [...attentionShifts].sort(_compareShift);
  const sortedFlows = [...flows].sort(_compareFlow);

  const metadata: StoryFlowRegistryMetadata = {
    registryId: `_story_flow_registry_${sortedStoryArcs.length}`,
    storyArcCount: sortedStoryArcs.length,
    stageCount: sortedStages.length,
    transitionCount: sortedTransitions.length,
    progressionCount: sortedProgressions.length,
    attentionShiftCount: sortedShifts.length,
    flowCount: sortedFlows.length,
  };

  return {
    registryId: metadata.registryId,
    storyArcs: sortedStoryArcs,
    stages: sortedStages,
    transitions: sortedTransitions,
    progressions: sortedProgressions,
    attentionShifts: sortedShifts,
    flows: sortedFlows,
    metadata,
    trace: {
      traceId: `_story_flow_trace_${sortedStoryArcs.length}`,
      decisionCount: 0,
      validationCount: 0,
      storyArcCount: sortedStoryArcs.length,
      stageCount: sortedStages.length,
      transitionCount: sortedTransitions.length,
      progressionCount: sortedProgressions.length,
      attentionShiftCount: sortedShifts.length,
      flowCount: sortedFlows.length,
      registryVersion: '1.0.0',
      pipelineVersion: '1.0.0',
      compositionMetadata: {},
      deterministicMetadata: {},
      deterministic: true,
      generatedFrom: 'deterministic_story_flow_kernel',
      randomUsed: false,
      timeDependency: false,
    },
    deterministic: true,
    generatedFrom: 'deterministic_story_flow_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Story Flow Registry From Input Composition
// ---------------------------------------------------------------------------

/**
 * Composes a story flow registry from an input.
 * Pure function. No side effects.
 */
export function composeStoryFlowRegistryFromInput(
  input: StoryFlowInput,
): StoryFlowRegistry {
  return composeStoryFlowRegistry(
    input.storyArcs,
    input.stages,
    input.transitions,
    input.progressions,
    input.attentionShifts,
    input.flows,
  );
}

// ---------------------------------------------------------------------------
// Narrative Flow Artifacts Composition (Main Entry Point)
// ---------------------------------------------------------------------------

/**
 * Composes a complete story flow registry from an input.
 * Pure function. No side effects.
 */
export function composeNarrativeFlowArtifacts(
  input: StoryFlowInput,
): StoryFlowRegistry {
  const decisions = input.storyArcs.map((arc) => {
    const errors = _validateStoryArcForDecision(arc);
    return _composeStoryFlowDecision(arc.storyArcId, errors.length === 0, errors);
  });

  const registry = composeStoryFlowRegistry(
    input.storyArcs,
    input.stages,
    input.transitions,
    input.progressions,
    input.attentionShifts,
    input.flows,
  );

  return {
    ...registry,
    trace: composeStoryFlowTrace({
      traceId: `_story_flow_trace_${input.storyArcs.length}`,
      decisions,
      registryVersion: '1.0.0',
      pipelineVersion: '1.0.0',
      storyArcCount: input.storyArcs.length,
      stageCount: input.stages.length,
      transitionCount: input.transitions.length,
      progressionCount: input.progressions.length,
      attentionShiftCount: input.attentionShifts.length,
      flowCount: input.flows.length,
    }),
  };
}

/**
 * Validates a story arc for decision composition.
 * Pure function. No side effects.
 */
function _validateStoryArcForDecision(
  arc: StoryArc,
): readonly string[] {
  const errors: string[] = [];

  if (!arc.storyArcId || arc.storyArcId.trim() === '') {
    errors.push('STORY_FLOW_MISSING_ARC_ID');
  }

  if (!arc.title || arc.title.trim() === '') {
    errors.push('STORY_FLOW_MISSING_TITLE');
  }

  if (!CANONICAL_STORY_ARC_TYPES.includes(arc.storyArcType)) {
    errors.push('STORY_FLOW_INVALID_ARC_TYPE');
  }

  if (!CANONICAL_GOVERNANCE_STATUSES.includes(arc.governanceStatus)) {
    errors.push('STORY_FLOW_INVALID_GOVERNANCE_STATUS');
  }

  if (!arc.provenance) {
    errors.push('STORY_FLOW_MISSING_PROVENANCE');
  }

  if (!arc.flowId || arc.flowId.trim() === '') {
    errors.push('STORY_FLOW_MISSING_FLOW_REFERENCE');
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Helper Functions — Type Guards
// ---------------------------------------------------------------------------

/**
 * Checks if a string is a supported story arc type.
 */
export function isSupportedStoryArcType(
  storyArcType: string,
): storyArcType is StoryArcType {
  return CANONICAL_STORY_ARC_TYPES.includes(storyArcType as StoryArcType);
}

/**
 * Checks if a string is a supported narrative stage type.
 */
export function isSupportedNarrativeStageType(
  stageType: string,
): stageType is NarrativeStageType {
  return CANONICAL_NARRATIVE_STAGES.includes(stageType as NarrativeStageType);
}

/**
 * Checks if a string is a supported transition type.
 */
export function isSupportedTransitionType(
  transitionType: string,
): transitionType is TransitionType {
  return CANONICAL_TRANSITION_TYPES.includes(transitionType as TransitionType);
}

/**
 * Checks if a string is a supported cognitive progression type.
 */
export function isSupportedCognitiveProgressionType(
  progressionType: string,
): progressionType is CognitiveProgressionType {
  return CANONICAL_COGNITIVE_PROGRESSIONS.includes(progressionType as CognitiveProgressionType);
}

/**
 * Checks if a string is a supported attention shift type.
 */
export function isSupportedAttentionShiftType(
  shiftType: string,
): shiftType is AttentionShiftType {
  return CANONICAL_ATTENTION_SHIFT_TYPES.includes(shiftType as AttentionShiftType);
}

/**
 * Checks if a string is a supported story flow status.
 */
export function isSupportedStoryFlowStatus(
  status: string,
): status is StoryFlowStatus {
  return CANONICAL_STORY_FLOW_STATUS.includes(status as StoryFlowStatus);
}

// ---------------------------------------------------------------------------
// Helper Functions — Canonical Getters
// ---------------------------------------------------------------------------

/**
 * Returns the canonical story arc types.
 */
export function getCanonicalStoryArcTypes(): readonly StoryArcType[] {
  return CANONICAL_STORY_ARC_TYPES;
}

/**
 * Returns the canonical narrative stage types.
 */
export function getCanonicalNarrativeStageTypes(): readonly NarrativeStageType[] {
  return CANONICAL_NARRATIVE_STAGES;
}

/**
 * Returns the canonical transition types.
 */
export function getCanonicalTransitionTypes(): readonly TransitionType[] {
  return CANONICAL_TRANSITION_TYPES;
}

/**
 * Returns the canonical cognitive progression types.
 */
export function getCanonicalCognitiveProgressionTypes(): readonly CognitiveProgressionType[] {
  return CANONICAL_COGNITIVE_PROGRESSIONS;
}

/**
 * Returns the canonical attention shift types.
 */
export function getCanonicalAttentionShiftTypes(): readonly AttentionShiftType[] {
  return CANONICAL_ATTENTION_SHIFT_TYPES;
}

/**
 * Returns the canonical story flow statuses.
 */
export function getCanonicalStoryFlowStatuses(): readonly StoryFlowStatus[] {
  return CANONICAL_STORY_FLOW_STATUS;
}

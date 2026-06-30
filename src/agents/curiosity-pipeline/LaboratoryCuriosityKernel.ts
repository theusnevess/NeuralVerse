/**
 * NV-2100-D9-OPT-08 — Laboratory Curiosity Kernel
 *
 * Deterministic orchestration functions for laboratory curiosity metadata.
 * Produces laboratory challenges, what-if prompts, experiment curiosities, traces, and registries.
 *
 * This module never:
 * - Generates challenges
 * - Generates experiments
 * - Simulates laboratories
 * - Executes reasoning
 * - Invokes the Laboratory Agent
 * - Accesses filesystem
 * - Performs network requests
 * - Calls external APIs
 *
 * Laboratory curiosity metadata only.
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import type {
  LaboratoryChallenge,
  WhatIfPrompt,
  ExperimentCuriosity,
  ExplorationRelationship,
  ExplorationRegistry,
  ExplorationRegistryMetadata,
  ExplorationInput,
  LaboratoryCuriosityProvenance,
  LaboratoryCuriosityDecision,
  LaboratoryCuriosityTrace,
  CuriosityArtifactWithExploration,
  LabChallengeType,
  WhatsIfType,
  ExperimentType,
  ExplorationObjective,
  ExplorationStatus,
  CuriosityGovernance,
} from './CuriosityAgentContract.ts';

import {
  CANONICAL_LAB_CHALLENGE_TYPES,
  CANONICAL_WHATS_IF_TYPES,
  CANONICAL_EXPERIMENT_TYPES,
  CANONICAL_EXPLORATION_OBJECTIVES,
  CANONICAL_EXPLORATION_STATUS,
  CANONICAL_CURIOSITY_GOVERNANCE,
} from './CuriosityAgentContract.ts';

// ---------------------------------------------------------------------------
// Laboratory Curiosity Provenance Composition
// ---------------------------------------------------------------------------

/**
 * Composes laboratory curiosity provenance from provided parameters.
 * Pure function. No side effects.
 */
export function composeLaboratoryCuriosityProvenance(params: {
  readonly provider: string;
  readonly source: string;
  readonly rationale: string;
  readonly version: string;
}): LaboratoryCuriosityProvenance {
  return {
    provider: params.provider,
    source: params.source,
    rationale: params.rationale,
    version: params.version,
  };
}

// ---------------------------------------------------------------------------
// Laboratory Curiosity Decision Composition
// ---------------------------------------------------------------------------

/**
 * Composes a laboratory curiosity decision from validation results.
 * Pure function. No side effects.
 */
function _composeLaboratoryCuriosityDecision(
  profileId: string,
  validationPassed: boolean,
  validationErrors: readonly string[],
): LaboratoryCuriosityDecision {
  return {
    decisionId: `_decision_${profileId}`,
    profileId,
    validationPassed,
    validationErrors,
  };
}

// ---------------------------------------------------------------------------
// Laboratory Curiosity Trace Composition
// ---------------------------------------------------------------------------

/**
 * Composes a laboratory curiosity trace from metadata.
 * Pure function. No side effects.
 */
export function composeLaboratoryCuriosityTrace(params: {
  readonly traceId: string;
}): LaboratoryCuriosityTrace {
  return {
    traceId: params.traceId,
    generatedFrom: 'deterministic_laboratory_curiosity_kernel',
    deterministic: true,
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Laboratory Challenge Composition
// ---------------------------------------------------------------------------

/**
 * Composes a laboratory challenge from provided parameters.
 * Pure function. No side effects.
 */
export function composeLaboratoryChallenge(params: {
  readonly challengeId: string;
  readonly title: string;
  readonly challengeType: LabChallengeType;
  readonly challengeDescription: string;
  readonly expectedOutcome: string;
  readonly difficultyLevel: string;
  readonly conceptIds: readonly string[];
  readonly status: ExplorationStatus;
  readonly governance: CuriosityGovernance;
  readonly provenance: LaboratoryCuriosityProvenance;
  readonly trace: LaboratoryCuriosityTrace;
}): LaboratoryChallenge {
  return {
    challengeId: params.challengeId,
    title: params.title,
    challengeType: params.challengeType,
    challengeDescription: params.challengeDescription,
    expectedOutcome: params.expectedOutcome,
    difficultyLevel: params.difficultyLevel,
    conceptIds: [...params.conceptIds],
    status: params.status,
    governance: params.governance,
    provenance: params.provenance,
    trace: params.trace,
  };
}

// ---------------------------------------------------------------------------
// What-If Prompt Composition
// ---------------------------------------------------------------------------

/**
 * Composes a what-if prompt from provided parameters.
 * Pure function. No side effects.
 */
export function composeWhatIfPrompt(params: {
  readonly promptId: string;
  readonly title: string;
  readonly promptType: WhatsIfType;
  readonly promptDescription: string;
  readonly expectedInsight: string;
  readonly conceptIds: readonly string[];
  readonly status: ExplorationStatus;
  readonly governance: CuriosityGovernance;
  readonly provenance: LaboratoryCuriosityProvenance;
  readonly trace: LaboratoryCuriosityTrace;
}): WhatIfPrompt {
  return {
    promptId: params.promptId,
    title: params.title,
    promptType: params.promptType,
    promptDescription: params.promptDescription,
    expectedInsight: params.expectedInsight,
    conceptIds: [...params.conceptIds],
    status: params.status,
    governance: params.governance,
    provenance: params.provenance,
    trace: params.trace,
  };
}

// ---------------------------------------------------------------------------
// Experiment Curiosity Composition
// ---------------------------------------------------------------------------

/**
 * Composes an experiment curiosity from provided parameters.
 * Pure function. No side effects.
 */
export function composeExperimentCuriosity(params: {
  readonly experimentId: string;
  readonly title: string;
  readonly experimentType: ExperimentType;
  readonly experimentDescription: string;
  readonly hypothesis: string;
  readonly expectedResult: string;
  readonly conceptIds: readonly string[];
  readonly status: ExplorationStatus;
  readonly governance: CuriosityGovernance;
  readonly provenance: LaboratoryCuriosityProvenance;
  readonly trace: LaboratoryCuriosityTrace;
}): ExperimentCuriosity {
  return {
    experimentId: params.experimentId,
    title: params.title,
    experimentType: params.experimentType,
    experimentDescription: params.experimentDescription,
    hypothesis: params.hypothesis,
    expectedResult: params.expectedResult,
    conceptIds: [...params.conceptIds],
    status: params.status,
    governance: params.governance,
    provenance: params.provenance,
    trace: params.trace,
  };
}

// ---------------------------------------------------------------------------
// Exploration Relationship Composition
// ---------------------------------------------------------------------------

/**
 * Composes an exploration relationship from provided parameters.
 * Pure function. No side effects.
 */
export function composeExplorationRelationship(params: {
  readonly relationshipId: string;
  readonly sourceProfileId: string;
  readonly targetProfileId: string;
  readonly relationshipType: string;
  readonly description: string;
  readonly provenance: LaboratoryCuriosityProvenance;
}): ExplorationRelationship {
  return {
    relationshipId: params.relationshipId,
    sourceProfileId: params.sourceProfileId,
    targetProfileId: params.targetProfileId,
    relationshipType: params.relationshipType,
    description: params.description,
    provenance: params.provenance,
  };
}

// ---------------------------------------------------------------------------
// Deterministic Sort Comparator for Challenges
// ---------------------------------------------------------------------------

/**
 * Deterministic comparator for laboratory challenges.
 * Sorts by challengeId, then challengeType, then title.
 * Pure function. No side effects.
 */
function _compareLaboratoryChallenge(
  a: LaboratoryChallenge,
  b: LaboratoryChallenge,
): number {
  if (a.challengeId < b.challengeId) return -1;
  if (a.challengeId > b.challengeId) return 1;

  if (a.challengeType < b.challengeType) return -1;
  if (a.challengeType > b.challengeType) return 1;

  if (a.title < b.title) return -1;
  if (a.title > b.title) return 1;

  return 0;
}

// ---------------------------------------------------------------------------
// Deterministic Sort Comparator for Prompts
// ---------------------------------------------------------------------------

/**
 * Deterministic comparator for what-if prompts.
 * Sorts by promptId.
 * Pure function. No side effects.
 */
function _compareWhatIfPrompt(
  a: WhatIfPrompt,
  b: WhatIfPrompt,
): number {
  if (a.promptId < b.promptId) return -1;
  if (a.promptId > b.promptId) return 1;

  return 0;
}

// ---------------------------------------------------------------------------
// Deterministic Sort Comparator for Experiments
// ---------------------------------------------------------------------------

/**
 * Deterministic comparator for experiment curiosities.
 * Sorts by experimentId.
 * Pure function. No side effects.
 */
function _compareExperimentCuriosity(
  a: ExperimentCuriosity,
  b: ExperimentCuriosity,
): number {
  if (a.experimentId < b.experimentId) return -1;
  if (a.experimentId > b.experimentId) return 1;

  return 0;
}

// ---------------------------------------------------------------------------
// Deterministic Sort Comparator for Relationships
// ---------------------------------------------------------------------------

/**
 * Deterministic comparator for exploration relationships.
 * Sorts by relationshipId.
 * Pure function. No side effects.
 */
function _compareExplorationRelationship(
  a: ExplorationRelationship,
  b: ExplorationRelationship,
): number {
  if (a.relationshipId < b.relationshipId) return -1;
  if (a.relationshipId > b.relationshipId) return 1;

  return 0;
}

// ---------------------------------------------------------------------------
// Exploration Registry Composition
// ---------------------------------------------------------------------------

/**
 * Composes an exploration registry from challenges, prompts, experiments, and relationships.
 * Pure function. No side effects.
 * Deterministic ordering: challengeId → challengeType → title.
 */
export function composeExplorationRegistry(
  challenges: readonly LaboratoryChallenge[],
  prompts: readonly WhatIfPrompt[],
  experiments: readonly ExperimentCuriosity[],
  relationships: readonly ExplorationRelationship[],
): ExplorationRegistry {
  const sortedChallenges = [...challenges].sort(_compareLaboratoryChallenge);
  const sortedPrompts = [...prompts].sort(_compareWhatIfPrompt);
  const sortedExperiments = [...experiments].sort(_compareExperimentCuriosity);
  const sortedRelationships = [...relationships].sort(_compareExplorationRelationship);

  const metadata: ExplorationRegistryMetadata = {
    registryId: `_registry_${sortedChallenges.length}_${sortedPrompts.length}_${sortedExperiments.length}_${sortedRelationships.length}`,
    version: '1.0.0',
    challengeCount: sortedChallenges.length,
    promptCount: sortedPrompts.length,
    experimentCount: sortedExperiments.length,
    relationshipCount: sortedRelationships.length,
  };

  return {
    registryId: metadata.registryId,
    challenges: sortedChallenges,
    prompts: sortedPrompts,
    experiments: sortedExperiments,
    relationships: sortedRelationships,
    metadata,
    trace: {
      traceId: `_trace_${sortedChallenges.length}_${sortedPrompts.length}_${sortedExperiments.length}_${sortedRelationships.length}`,
      generatedFrom: 'deterministic_laboratory_curiosity_kernel',
      deterministic: true,
      randomUsed: false,
      timeDependency: false,
    },
    deterministic: true,
    generatedFrom: 'deterministic_laboratory_curiosity_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Exploration Registry From Input Composition
// ---------------------------------------------------------------------------

/**
 * Composes an exploration registry from an input.
 * Pure function. No side effects.
 */
export function composeExplorationRegistryFromInput(
  input: ExplorationInput,
): ExplorationRegistry {
  return composeExplorationRegistry(input.challenges, input.prompts, input.experiments, input.relationships);
}

// ---------------------------------------------------------------------------
// Exploration Artifacts Composition (Main Entry Point)
// ---------------------------------------------------------------------------

/**
 * Composes a complete exploration registry from an input.
 * Pure function. No side effects.
 */
export function composeExplorationArtifacts(
  input: ExplorationInput,
): ExplorationRegistry {
  const registry = composeExplorationRegistry(input.challenges, input.prompts, input.experiments, input.relationships);

  return {
    ...registry,
    trace: composeLaboratoryCuriosityTrace({
      traceId: `_trace_${input.challenges.length}_${input.prompts.length}_${input.experiments.length}_${input.relationships.length}`,
    }),
  };
}

// ---------------------------------------------------------------------------
// Curiosity Artifact With Exploration Composition
// ---------------------------------------------------------------------------

/**
 * Composes a curiosity artifact with exploration from provided parameters.
 * Pure function. No side effects.
 */
export function composeCuriosityArtifactWithExploration(params: {
  readonly curiosityId: string;
  readonly title: string;
  readonly challenges: readonly LaboratoryChallenge[];
  readonly prompts: readonly WhatIfPrompt[];
  readonly experiments: readonly ExperimentCuriosity[];
  readonly relationships: readonly ExplorationRelationship[];
  readonly provenance: LaboratoryCuriosityProvenance;
}): CuriosityArtifactWithExploration {
  return {
    curiosityId: params.curiosityId,
    title: params.title,
    challenges: [...params.challenges],
    prompts: [...params.prompts],
    experiments: [...params.experiments],
    relationships: [...params.relationships],
    provenance: params.provenance,
  };
}

// ---------------------------------------------------------------------------
// Helper Functions — Type Guards
// ---------------------------------------------------------------------------

/**
 * Checks if a string is a supported laboratory challenge type.
 */
export function isSupportedLaboratoryChallengeType(
  challengeType: string,
): challengeType is LabChallengeType {
  return CANONICAL_LAB_CHALLENGE_TYPES.includes(challengeType as LabChallengeType);
}

/**
 * Checks if a string is a supported what-if type.
 */
export function isSupportedWhatIfType(
  promptType: string,
): promptType is WhatsIfType {
  return CANONICAL_WHATS_IF_TYPES.includes(promptType as WhatsIfType);
}

/**
 * Checks if a string is a supported experiment type.
 */
export function isSupportedExperimentType(
  experimentType: string,
): experimentType is ExperimentType {
  return CANONICAL_EXPERIMENT_TYPES.includes(experimentType as ExperimentType);
}

/**
 * Checks if a string is a supported exploration objective.
 */
export function isSupportedExplorationObjective(
  objective: string,
): objective is ExplorationObjective {
  return CANONICAL_EXPLORATION_OBJECTIVES.includes(objective as ExplorationObjective);
}

/**
 * Checks if a string is a supported exploration status.
 */
export function isSupportedExplorationStatus(
  status: string,
): status is ExplorationStatus {
  return CANONICAL_EXPLORATION_STATUS.includes(status as ExplorationStatus);
}

/**
 * Checks if a string is a supported exploration governance.
 */
export function isSupportedExplorationGovernance(
  governance: string,
): governance is CuriosityGovernance {
  return CANONICAL_CURIOSITY_GOVERNANCE.includes(governance as CuriosityGovernance);
}

// ---------------------------------------------------------------------------
// Helper Functions — Canonical Getters
// ---------------------------------------------------------------------------

/**
 * Returns the canonical laboratory challenge types.
 */
export function getCanonicalLaboratoryChallengeTypes(): readonly LabChallengeType[] {
  return [...CANONICAL_LAB_CHALLENGE_TYPES];
}

/**
 * Returns the canonical what-if types.
 */
export function getCanonicalWhatIfTypes(): readonly WhatsIfType[] {
  return [...CANONICAL_WHATS_IF_TYPES];
}

/**
 * Returns the canonical experiment types.
 */
export function getCanonicalExperimentTypes(): readonly ExperimentType[] {
  return [...CANONICAL_EXPERIMENT_TYPES];
}

/**
 * Returns the canonical exploration objectives.
 */
export function getCanonicalExplorationObjectives(): readonly ExplorationObjective[] {
  return [...CANONICAL_EXPLORATION_OBJECTIVES];
}

/**
 * Returns the canonical exploration statuses.
 */
export function getCanonicalExplorationStatuses(): readonly ExplorationStatus[] {
  return [...CANONICAL_EXPLORATION_STATUS];
}

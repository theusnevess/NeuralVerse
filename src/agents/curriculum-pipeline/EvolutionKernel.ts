/**
 * NV-1500-D3-OPT-08 — Curriculum Evolution & Version Governance Kernel
 *
 * Deterministic orchestration functions for curriculum evolution and version governance.
 * Produces evolution registries, traces, and artifacts.
 *
 * This module never:
 * - Modifies curriculum
 * - Rewrites curriculum
 * - Merges curriculum
 * - Migrates curriculum
 * - Generates curriculum
 * - Infers educational changes
 * - Recommends curriculum changes
 * - Selects canonical version
 * - Performs governance voting
 * - Edits dependencies
 * - Edits roadmap
 * - Edits progression
 * - Edits learning paths
 * - Executes migrations
 * - Calls external APIs
 * - Calls LLMs
 * - Accesses network
 * - Accesses filesystem
 * - Accesses databases
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import type {
  CurriculumVersionType,
  CurriculumLifecycleState,
  CurriculumEvolutionRelation,
  CurriculumVersion,
  CurriculumLifecycleRecord,
  CurriculumEvolutionRecord,
  CurriculumEvolutionRegistry,
  CurriculumEvolutionDecision,
  CurriculumEvolutionTrace,
  CurriculumEvolutionInput,
  CurriculumEvolutionProvenance,
  CurriculumArtifactWithEvolution,
  CurriculumGovernanceStatus,
} from './CurriculumAgentContract.ts';

import {
  CANONICAL_CURRICULUM_VERSION_TYPES,
  CANONICAL_CURRICULUM_LIFECYCLE,
  CANONICAL_EVOLUTION_RELATIONS,
  CANONICAL_GOVERNANCE_STATUSES,
} from './CurriculumAgentContract.ts';

// ---------------------------------------------------------------------------
// Canonical Version Type Helpers
// ---------------------------------------------------------------------------

/**
 * Checks if a version type is supported (in canonical version types).
 */
export function isSupportedVersionType(
  type: string,
): type is CurriculumVersionType {
  return CANONICAL_CURRICULUM_VERSION_TYPES.includes(type as CurriculumVersionType);
}

/**
 * Returns the canonical version types.
 */
export function getCanonicalVersionTypes(): readonly CurriculumVersionType[] {
  return CANONICAL_CURRICULUM_VERSION_TYPES;
}

// ---------------------------------------------------------------------------
// Canonical Lifecycle State Helpers
// ---------------------------------------------------------------------------

/**
 * Checks if a lifecycle state is supported (in canonical lifecycle states).
 */
export function isSupportedLifecycleState(
  state: string,
): state is CurriculumLifecycleState {
  return CANONICAL_CURRICULUM_LIFECYCLE.includes(state as CurriculumLifecycleState);
}

/**
 * Returns the canonical lifecycle states.
 */
export function getCanonicalLifecycleStates(): readonly CurriculumLifecycleState[] {
  return CANONICAL_CURRICULUM_LIFECYCLE;
}

// ---------------------------------------------------------------------------
// Canonical Evolution Relation Helpers
// ---------------------------------------------------------------------------

/**
 * Checks if an evolution relation is supported (in canonical evolution relations).
 */
export function isSupportedEvolutionRelation(
  relation: string,
): relation is CurriculumEvolutionRelation {
  return CANONICAL_EVOLUTION_RELATIONS.includes(relation as CurriculumEvolutionRelation);
}

/**
 * Returns the canonical evolution relations.
 */
export function getCanonicalEvolutionRelations(): readonly CurriculumEvolutionRelation[] {
  return CANONICAL_EVOLUTION_RELATIONS;
}

// ---------------------------------------------------------------------------
// Governance Status Helpers
// ---------------------------------------------------------------------------

/**
 * Checks if a governance status is supported.
 */
export function isSupportedEvolutionGovernanceStatus(
  status: string,
): status is CurriculumGovernanceStatus {
  return CANONICAL_GOVERNANCE_STATUSES.includes(status as CurriculumGovernanceStatus);
}

// ---------------------------------------------------------------------------
// Order Helpers
// ---------------------------------------------------------------------------

/**
 * Returns the canonical order index for a version type.
 * Lower index means earlier type.
 */
function _getVersionTypeOrder(versionType: CurriculumVersionType): number {
  const index = CANONICAL_CURRICULUM_VERSION_TYPES.indexOf(versionType);
  return index === -1 ? -1 : index;
}

/**
 * Returns the canonical order index for a lifecycle state.
 * Lower index means earlier state.
 */
function _getLifecycleStateOrder(state: CurriculumLifecycleState): number {
  const index = CANONICAL_CURRICULUM_LIFECYCLE.indexOf(state);
  return index === -1 ? -1 : index;
}

/**
 * Returns the canonical order index for an evolution relation.
 * Lower index means earlier relation.
 */
function _getEvolutionRelationOrder(relation: CurriculumEvolutionRelation): number {
  const index = CANONICAL_EVOLUTION_RELATIONS.indexOf(relation);
  return index === -1 ? -1 : index;
}

// ---------------------------------------------------------------------------
// Compose Curriculum Version
// ---------------------------------------------------------------------------

/**
 * Composes a curriculum version from provided parameters.
 * Pure function. No side effects.
 */
export function composeCurriculumVersion(params: {
  readonly versionId: string;
  readonly versionType: CurriculumVersionType;
  readonly versionNumber: string;
  readonly lifecycleState: CurriculumLifecycleState;
  readonly source: string;
  readonly governanceStatus: CurriculumGovernanceStatus;
  readonly rationale: string;
  readonly providedBy: string;
}): CurriculumVersion {
  return {
    versionId: params.versionId,
    versionType: params.versionType,
    versionNumber: params.versionNumber,
    lifecycleState: params.lifecycleState,
    source: params.source,
    governanceStatus: params.governanceStatus,
    rationale: params.rationale,
    providedBy: params.providedBy,
  };
}

// ---------------------------------------------------------------------------
// Compose Lifecycle Record
// ---------------------------------------------------------------------------

/**
 * Composes a curriculum lifecycle record from provided parameters.
 * Pure function. No side effects.
 */
export function composeLifecycleRecord(params: {
  readonly lifecycleId: string;
  readonly versionId: string;
  readonly previousState: CurriculumLifecycleState | null;
  readonly newState: CurriculumLifecycleState;
  readonly transitionReason: string;
  readonly source: string;
  readonly governanceStatus: CurriculumGovernanceStatus;
  readonly rationale: string;
  readonly providedBy: string;
}): CurriculumLifecycleRecord {
  return {
    lifecycleId: params.lifecycleId,
    versionId: params.versionId,
    previousState: params.previousState,
    newState: params.newState,
    transitionReason: params.transitionReason,
    source: params.source,
    governanceStatus: params.governanceStatus,
    rationale: params.rationale,
    providedBy: params.providedBy,
  };
}

// ---------------------------------------------------------------------------
// Compose Evolution Record
// ---------------------------------------------------------------------------

/**
 * Composes a curriculum evolution record from provided parameters.
 * Pure function. No side effects.
 */
export function composeEvolutionRecord(params: {
  readonly relationId: string;
  readonly sourceVersionId: string;
  readonly targetVersionId: string;
  readonly relationType: CurriculumEvolutionRelation;
  readonly source: string;
  readonly governanceStatus: CurriculumGovernanceStatus;
  readonly rationale: string;
  readonly providedBy: string;
}): CurriculumEvolutionRecord {
  return {
    relationId: params.relationId,
    sourceVersionId: params.sourceVersionId,
    targetVersionId: params.targetVersionId,
    relationType: params.relationType,
    source: params.source,
    governanceStatus: params.governanceStatus,
    rationale: params.rationale,
    providedBy: params.providedBy,
  };
}

// ---------------------------------------------------------------------------
// Compose Evolution Provenance
// ---------------------------------------------------------------------------

/**
 * Composes evolution provenance from a registry.
 * Pure function. No side effects.
 */
export function composeEvolutionProvenance(
  registry: CurriculumEvolutionRegistry,
): CurriculumEvolutionProvenance {
  return {
    registryId: registry.registryId,
    source: 'curriculum-evolution-kernel',
    governanceStatus: 'canonical',
    rationale: 'Evolution and version governance provenance.',
    providedBy: 'curriculum-board',
  };
}

// ---------------------------------------------------------------------------
// Deterministic Sorting
// ---------------------------------------------------------------------------

/**
 * Sorts versions deterministically by versionId, then lifecycleState, then relationType.
 */
function _sortVersionsDeterministically(
  versions: readonly CurriculumVersion[],
): readonly CurriculumVersion[] {
  return [...versions].sort((a, b) => {
    const idCompare = a.versionId.localeCompare(b.versionId);
    if (idCompare !== 0) return idCompare;
    const stateCompare = _getLifecycleStateOrder(a.lifecycleState) - _getLifecycleStateOrder(b.lifecycleState);
    if (stateCompare !== 0) return stateCompare;
    const typeCompare = _getVersionTypeOrder(a.versionType) - _getVersionTypeOrder(b.versionType);
    if (typeCompare !== 0) return typeCompare;
    return a.versionNumber.localeCompare(b.versionNumber);
  });
}

/**
 * Sorts lifecycle records deterministically by versionId, then lifecycleId.
 */
function _sortLifecycleRecordsDeterministically(
  records: readonly CurriculumLifecycleRecord[],
): readonly CurriculumLifecycleRecord[] {
  return [...records].sort((a, b) => {
    const versionCompare = a.versionId.localeCompare(b.versionId);
    if (versionCompare !== 0) return versionCompare;
    return a.lifecycleId.localeCompare(b.lifecycleId);
  });
}

/**
 * Sorts evolution records deterministically by sourceVersionId, then targetVersionId, then relationType, then relationId.
 */
function _sortEvolutionRecordsDeterministically(
  records: readonly CurriculumEvolutionRecord[],
): readonly CurriculumEvolutionRecord[] {
  return [...records].sort((a, b) => {
    const sourceCompare = a.sourceVersionId.localeCompare(b.sourceVersionId);
    if (sourceCompare !== 0) return sourceCompare;
    const targetCompare = a.targetVersionId.localeCompare(b.targetVersionId);
    if (targetCompare !== 0) return targetCompare;
    const relationCompare = _getEvolutionRelationOrder(a.relationType) - _getEvolutionRelationOrder(b.relationType);
    if (relationCompare !== 0) return relationCompare;
    return a.relationId.localeCompare(b.relationId);
  });
}

// ---------------------------------------------------------------------------
// Compose Evolution Decisions
// ---------------------------------------------------------------------------

/**
 * Composes decisions for versions.
 * Pure function. No side effects.
 */
function _composeVersionDecisions(
  versions: readonly CurriculumVersion[],
): readonly CurriculumEvolutionDecision[] {
  return versions.map((version) => {
    const validationErrors = _validateVersionForDecision(version);
    return {
      decisionId: `_decision_version_${version.versionId}`,
      decisionType: 'version' as const,
      entityId: version.versionId,
      validationPassed: validationErrors.length === 0,
      validationErrors,
    };
  });
}

/**
 * Composes decisions for lifecycle records.
 * Pure function. No side effects.
 */
function _composeLifecycleDecisions(
  records: readonly CurriculumLifecycleRecord[],
): readonly CurriculumEvolutionDecision[] {
  return records.map((record) => {
    const validationErrors = _validateLifecycleForDecision(record);
    return {
      decisionId: `_decision_lifecycle_${record.lifecycleId}`,
      decisionType: 'lifecycle' as const,
      entityId: record.lifecycleId,
      validationPassed: validationErrors.length === 0,
      validationErrors,
    };
  });
}

/**
 * Composes decisions for evolution records.
 * Pure function. No side effects.
 */
function _composeEvolutionDecisions(
  records: readonly CurriculumEvolutionRecord[],
): readonly CurriculumEvolutionDecision[] {
  return records.map((record) => {
    const validationErrors = _validateEvolutionForDecision(record);
    return {
      decisionId: `_decision_evolution_${record.relationId}`,
      decisionType: 'evolution' as const,
      entityId: record.relationId,
      validationPassed: validationErrors.length === 0,
      validationErrors,
    };
  });
}

/**
 * Validates a version for decision composition.
 * Returns validation error codes.
 */
function _validateVersionForDecision(version: CurriculumVersion): readonly string[] {
  const errors: string[] = [];

  if (!version.versionId || version.versionId.trim() === '') {
    errors.push('EVOLUTION_MISSING_VERSION_ID');
  }

  if (!isSupportedVersionType(version.versionType)) {
    errors.push('EVOLUTION_UNKNOWN_VERSION');
  }

  if (!version.versionNumber || version.versionNumber.trim() === '') {
    errors.push('EVOLUTION_MISSING_VERSION_NUMBER');
  }

  if (!isSupportedLifecycleState(version.lifecycleState)) {
    errors.push('EVOLUTION_UNKNOWN_STATE');
  }

  if (!version.source || version.source.trim() === '') {
    errors.push('EVOLUTION_MISSING_SOURCE');
  }

  if (!isSupportedEvolutionGovernanceStatus(version.governanceStatus)) {
    errors.push('EVOLUTION_INVALID_STATUS');
  }

  if (!version.rationale || version.rationale.trim() === '') {
    errors.push('EVOLUTION_MISSING_RATIONALE');
  }

  if (!version.providedBy || version.providedBy.trim() === '') {
    errors.push('EVOLUTION_MISSING_PROVIDED_BY');
  }

  return errors;
}

/**
 * Validates a lifecycle record for decision composition.
 * Returns validation error codes.
 */
function _validateLifecycleForDecision(record: CurriculumLifecycleRecord): readonly string[] {
  const errors: string[] = [];

  if (!record.lifecycleId || record.lifecycleId.trim() === '') {
    errors.push('EVOLUTION_MISSING_LIFECYCLE_ID');
  }

  if (!record.versionId || record.versionId.trim() === '') {
    errors.push('EVOLUTION_MISSING_VERSION_ID');
  }

  if (record.previousState !== null && !isSupportedLifecycleState(record.previousState)) {
    errors.push('EVOLUTION_UNKNOWN_STATE');
  }

  if (!isSupportedLifecycleState(record.newState)) {
    errors.push('EVOLUTION_UNKNOWN_STATE');
  }

  if (!record.transitionReason || record.transitionReason.trim() === '') {
    errors.push('EVOLUTION_MISSING_TRANSITION_REASON');
  }

  if (!record.source || record.source.trim() === '') {
    errors.push('EVOLUTION_MISSING_SOURCE');
  }

  if (!isSupportedEvolutionGovernanceStatus(record.governanceStatus)) {
    errors.push('EVOLUTION_INVALID_STATUS');
  }

  if (!record.rationale || record.rationale.trim() === '') {
    errors.push('EVOLUTION_MISSING_RATIONALE');
  }

  if (!record.providedBy || record.providedBy.trim() === '') {
    errors.push('EVOLUTION_MISSING_PROVIDED_BY');
  }

  return errors;
}

/**
 * Validates an evolution record for decision composition.
 * Returns validation error codes.
 */
function _validateEvolutionForDecision(record: CurriculumEvolutionRecord): readonly string[] {
  const errors: string[] = [];

  if (!record.relationId || record.relationId.trim() === '') {
    errors.push('EVOLUTION_MISSING_RELATION_ID');
  }

  if (!record.sourceVersionId || record.sourceVersionId.trim() === '') {
    errors.push('EVOLUTION_MISSING_SOURCE_VERSION');
  }

  if (!record.targetVersionId || record.targetVersionId.trim() === '') {
    errors.push('EVOLUTION_MISSING_TARGET_VERSION');
  }

  if (record.sourceVersionId === record.targetVersionId) {
    errors.push('EVOLUTION_SELF_REFERENCE');
  }

  if (!isSupportedEvolutionRelation(record.relationType)) {
    errors.push('EVOLUTION_UNKNOWN_RELATION');
  }

  if (!record.source || record.source.trim() === '') {
    errors.push('EVOLUTION_MISSING_SOURCE');
  }

  if (!isSupportedEvolutionGovernanceStatus(record.governanceStatus)) {
    errors.push('EVOLUTION_INVALID_STATUS');
  }

  if (!record.rationale || record.rationale.trim() === '') {
    errors.push('EVOLUTION_MISSING_RATIONALE');
  }

  if (!record.providedBy || record.providedBy.trim() === '') {
    errors.push('EVOLUTION_MISSING_PROVIDED_BY');
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Compose Curriculum Evolution
// ---------------------------------------------------------------------------

/**
 * Composes a curriculum evolution registry from an input.
 * Pure function. No side effects.
 * Versions sorted by versionId, then lifecycleState, then versionType, then versionNumber.
 * Lifecycle records sorted by versionId, then lifecycleId.
 * Evolution records sorted by sourceVersionId, then targetVersionId, then relationType, then relationId.
 */
export function composeCurriculumEvolution(
  input: CurriculumEvolutionInput,
): CurriculumEvolutionRegistry {
  const sortedVersions = _sortVersionsDeterministically(input.versions);
  const sortedLifecycleRecords = _sortLifecycleRecordsDeterministically(input.lifecycleRecords);
  const sortedEvolutionRecords = _sortEvolutionRecordsDeterministically(input.evolutionRecords);

  return {
    registryId: input.registryId,
    versions: sortedVersions,
    lifecycleRecords: sortedLifecycleRecords,
    evolutionRecords: sortedEvolutionRecords,
    versionCount: sortedVersions.length,
    lifecycleCount: sortedLifecycleRecords.length,
    evolutionCount: sortedEvolutionRecords.length,
    deterministic: true,
    generatedFrom: 'deterministic_evolution_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Compose Evolution Registry
// ---------------------------------------------------------------------------

/**
 * Composes an evolution registry from parameters.
 * Pure function. No side effects.
 * All records sorted deterministically.
 */
export function composeEvolutionRegistry(params: {
  readonly registryId: string;
  readonly versions: readonly CurriculumVersion[];
  readonly lifecycleRecords: readonly CurriculumLifecycleRecord[];
  readonly evolutionRecords: readonly CurriculumEvolutionRecord[];
}): CurriculumEvolutionRegistry {
  const sortedVersions = _sortVersionsDeterministically(params.versions);
  const sortedLifecycleRecords = _sortLifecycleRecordsDeterministically(params.lifecycleRecords);
  const sortedEvolutionRecords = _sortEvolutionRecordsDeterministically(params.evolutionRecords);

  return {
    registryId: params.registryId,
    versions: sortedVersions,
    lifecycleRecords: sortedLifecycleRecords,
    evolutionRecords: sortedEvolutionRecords,
    versionCount: sortedVersions.length,
    lifecycleCount: sortedLifecycleRecords.length,
    evolutionCount: sortedEvolutionRecords.length,
    deterministic: true,
    generatedFrom: 'deterministic_evolution_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Compose Evolution Trace
// ---------------------------------------------------------------------------

/**
 * Composes a trace for an evolution registry.
 * Pure function. No side effects.
 */
export function composeEvolutionTrace(
  registryId: string,
  versions: readonly CurriculumVersion[],
  lifecycleRecords: readonly CurriculumLifecycleRecord[],
  evolutionRecords: readonly CurriculumEvolutionRecord[],
): CurriculumEvolutionTrace {
  const versionDecisions = _composeVersionDecisions(versions);
  const lifecycleDecisions = _composeLifecycleDecisions(lifecycleRecords);
  const evolutionDecisions = _composeEvolutionDecisions(evolutionRecords);
  const allDecisions = [...versionDecisions, ...lifecycleDecisions, ...evolutionDecisions];

  return {
    traceId: `_trace_evo_${registryId}`,
    registryId,
    versionCount: versions.length,
    lifecycleCount: lifecycleRecords.length,
    evolutionCount: evolutionRecords.length,
    decisionsCount: allDecisions.length,
    validatedCount: allDecisions.filter((d) => d.validationPassed).length,
    invalidCount: allDecisions.filter((d) => !d.validationPassed).length,
    decisions: allDecisions,
    deterministic: true,
    generatedFrom: 'deterministic_evolution_kernel',
    randomUsed: false,
    timeDependency: false,
    curriculumMutated: false,
  };
}

// ---------------------------------------------------------------------------
// Compose Curriculum Artifact With Evolution
// ---------------------------------------------------------------------------

/**
 * Composes a curriculum artifact containing evolution registry, trace, and validation.
 * Pure function. No side effects.
 */
export function composeCurriculumArtifactWithEvolution(params: {
  readonly artifactId: string;
  readonly evolutionRegistry: CurriculumEvolutionRegistry;
  readonly evolutionTrace: CurriculumEvolutionTrace;
  readonly validation: CurriculumArtifactWithEvolution['validation'];
}): CurriculumArtifactWithEvolution {
  return {
    artifactId: params.artifactId,
    evolutionRegistry: params.evolutionRegistry,
    evolutionTrace: params.evolutionTrace,
    validation: params.validation,
    deterministic: true,
    generatedFrom: 'deterministic_evolution_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}

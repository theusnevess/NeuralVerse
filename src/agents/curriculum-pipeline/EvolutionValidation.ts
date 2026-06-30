/**
 * NV-1500-D3-OPT-08 — Curriculum Evolution & Version Governance Validation Layer
 *
 * Deterministic validation for curriculum evolution and version governance structures.
 * Returns structured errors, never exceptions for expected validation failures.
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import type {
  CurriculumVersion,
  CurriculumLifecycleRecord,
  CurriculumEvolutionRecord,
  CurriculumEvolutionRegistry,
  CurriculumArtifactWithEvolution,
  CurriculumEvolutionInput,
  CurriculumEvolutionValidationError,
  CurriculumEvolutionValidationResult,
} from './CurriculumAgentContract.ts';

import {
  CANONICAL_CURRICULUM_VERSION_TYPES,
  CANONICAL_CURRICULUM_LIFECYCLE,
  CANONICAL_EVOLUTION_RELATIONS,
  CANONICAL_GOVERNANCE_STATUSES,
} from './CurriculumAgentContract.ts';

// ---------------------------------------------------------------------------
// Validation Error Codes
// ---------------------------------------------------------------------------

export const EVOLUTION_VALIDATION_CODES = {
  EVOLUTION_UNKNOWN_VERSION: 'EVOLUTION_UNKNOWN_VERSION',
  EVOLUTION_UNKNOWN_STATE: 'EVOLUTION_UNKNOWN_STATE',
  EVOLUTION_UNKNOWN_RELATION: 'EVOLUTION_UNKNOWN_RELATION',
  EVOLUTION_DUPLICATE_VERSION: 'EVOLUTION_DUPLICATE_VERSION',
  EVOLUTION_DUPLICATE_RELATION: 'EVOLUTION_DUPLICATE_RELATION',
  EVOLUTION_SELF_REFERENCE: 'EVOLUTION_SELF_REFERENCE',
  EVOLUTION_INVALID_REFERENCE: 'EVOLUTION_INVALID_REFERENCE',
  EVOLUTION_INVALID_SUCCESSOR: 'EVOLUTION_INVALID_SUCCESSOR',
  EVOLUTION_INVALID_LIFECYCLE: 'EVOLUTION_INVALID_LIFECYCLE',
  EVOLUTION_MULTIPLE_ACTIVE: 'EVOLUTION_MULTIPLE_ACTIVE',
  EVOLUTION_RETIRED_HAS_SUCCESSOR: 'EVOLUTION_RETIRED_HAS_SUCCESSOR',
  EVOLUTION_REJECTED_HAS_RELATION: 'EVOLUTION_REJECTED_HAS_RELATION',
  EVOLUTION_MISSING_SOURCE: 'EVOLUTION_MISSING_SOURCE',
  EVOLUTION_MISSING_PROVENANCE: 'EVOLUTION_MISSING_PROVENANCE',
  EVOLUTION_EMPTY_REGISTRY: 'EVOLUTION_EMPTY_REGISTRY',
  EVOLUTION_INVALID_STATUS: 'EVOLUTION_INVALID_STATUS',
  EVOLUTION_TRACE_NOT_DETERMINISTIC: 'EVOLUTION_TRACE_NOT_DETERMINISTIC',
  EVOLUTION_TRACE_RANDOM_USED: 'EVOLUTION_TRACE_RANDOM_USED',
  EVOLUTION_TRACE_TIME_DEPENDENCY: 'EVOLUTION_TRACE_TIME_DEPENDENCY',
  EVOLUTION_TRACE_CURRICULUM_MUTATED: 'EVOLUTION_TRACE_CURRICULUM_MUTATED',
  EVOLUTION_MISSING_VERSION_ID: 'EVOLUTION_MISSING_VERSION_ID',
  EVOLUTION_MISSING_VERSION_NUMBER: 'EVOLUTION_MISSING_VERSION_NUMBER',
  EVOLUTION_MISSING_LIFECYCLE_ID: 'EVOLUTION_MISSING_LIFECYCLE_ID',
  EVOLUTION_MISSING_RELATION_ID: 'EVOLUTION_MISSING_RELATION_ID',
  EVOLUTION_MISSING_SOURCE_VERSION: 'EVOLUTION_MISSING_SOURCE_VERSION',
  EVOLUTION_MISSING_TARGET_VERSION: 'EVOLUTION_MISSING_TARGET_VERSION',
  EVOLUTION_MISSING_TRANSITION_REASON: 'EVOLUTION_MISSING_TRANSITION_REASON',
  EVOLUTION_MISSING_RATIONALE: 'EVOLUTION_MISSING_RATIONALE',
  EVOLUTION_MISSING_PROVIDED_BY: 'EVOLUTION_MISSING_PROVIDED_BY',
  EVOLUTION_MISSING_REGISTRY_ID: 'EVOLUTION_MISSING_REGISTRY_ID',
} as const;

// ---------------------------------------------------------------------------
// Curriculum Version Validation
// ---------------------------------------------------------------------------

/**
 * Validates a single curriculum version against canonical invariants.
 * Pure function. No side effects.
 */
export function validateCurriculumVersion(
  version: CurriculumVersion,
  existingVersionIds: readonly string[],
): readonly CurriculumEvolutionValidationError[] {
  const errors: CurriculumEvolutionValidationError[] = [];

  if (!version.versionId || version.versionId.trim() === '') {
    errors.push({
      code: EVOLUTION_VALIDATION_CODES.EVOLUTION_MISSING_VERSION_ID,
      message: 'Curriculum version is missing a version ID.',
      field: 'versionId',
      versionId: version.versionId,
    });
  }

  // Duplicate version check
  if (version.versionId && existingVersionIds.includes(version.versionId)) {
    errors.push({
      code: EVOLUTION_VALIDATION_CODES.EVOLUTION_DUPLICATE_VERSION,
      message: `Duplicate curriculum version ID: "${version.versionId}".`,
      field: 'versionId',
      versionId: version.versionId,
    });
  }

  if (!CANONICAL_CURRICULUM_VERSION_TYPES.includes(version.versionType)) {
    errors.push({
      code: EVOLUTION_VALIDATION_CODES.EVOLUTION_UNKNOWN_VERSION,
      message: `Curriculum version has unsupported version type: "${version.versionType}".`,
      field: 'versionType',
      versionId: version.versionId,
    });
  }

  if (!version.versionNumber || version.versionNumber.trim() === '') {
    errors.push({
      code: EVOLUTION_VALIDATION_CODES.EVOLUTION_MISSING_VERSION_NUMBER,
      message: 'Curriculum version is missing a version number.',
      field: 'versionNumber',
      versionId: version.versionId,
    });
  }

  if (!CANONICAL_CURRICULUM_LIFECYCLE.includes(version.lifecycleState)) {
    errors.push({
      code: EVOLUTION_VALIDATION_CODES.EVOLUTION_UNKNOWN_STATE,
      message: `Curriculum version has unsupported lifecycle state: "${version.lifecycleState}".`,
      field: 'lifecycleState',
      versionId: version.versionId,
    });
  }

  if (!version.source || version.source.trim() === '') {
    errors.push({
      code: EVOLUTION_VALIDATION_CODES.EVOLUTION_MISSING_SOURCE,
      message: 'Curriculum version is missing a source.',
      field: 'source',
      versionId: version.versionId,
    });
  }

  if (!CANONICAL_GOVERNANCE_STATUSES.includes(version.governanceStatus)) {
    errors.push({
      code: EVOLUTION_VALIDATION_CODES.EVOLUTION_INVALID_STATUS,
      message: `Curriculum version has invalid governance status: "${version.governanceStatus}".`,
      field: 'governanceStatus',
      versionId: version.versionId,
    });
  }

  if (!version.rationale || version.rationale.trim() === '') {
    errors.push({
      code: EVOLUTION_VALIDATION_CODES.EVOLUTION_MISSING_RATIONALE,
      message: 'Curriculum version is missing a rationale.',
      field: 'rationale',
      versionId: version.versionId,
    });
  }

  if (!version.providedBy || version.providedBy.trim() === '') {
    errors.push({
      code: EVOLUTION_VALIDATION_CODES.EVOLUTION_MISSING_PROVIDED_BY,
      message: 'Curriculum version is missing a providedBy.',
      field: 'providedBy',
      versionId: version.versionId,
    });
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Lifecycle Record Validation
// ---------------------------------------------------------------------------

/**
 * Validates a single lifecycle record against canonical invariants.
 * Pure function. No side effects.
 */
export function validateLifecycleRecord(
  record: CurriculumLifecycleRecord,
  existingLifecycleIds: readonly string[],
  existingVersionIds: readonly string[],
): readonly CurriculumEvolutionValidationError[] {
  const errors: CurriculumEvolutionValidationError[] = [];

  if (!record.lifecycleId || record.lifecycleId.trim() === '') {
    errors.push({
      code: EVOLUTION_VALIDATION_CODES.EVOLUTION_MISSING_LIFECYCLE_ID,
      message: 'Curriculum lifecycle record is missing a lifecycle ID.',
      field: 'lifecycleId',
      lifecycleId: record.lifecycleId,
    });
  }

  // Duplicate lifecycle check
  if (record.lifecycleId && existingLifecycleIds.includes(record.lifecycleId)) {
    errors.push({
      code: EVOLUTION_VALIDATION_CODES.EVOLUTION_DUPLICATE_VERSION,
      message: `Duplicate lifecycle record ID: "${record.lifecycleId}".`,
      field: 'lifecycleId',
      lifecycleId: record.lifecycleId,
    });
  }

  if (!record.versionId || record.versionId.trim() === '') {
    errors.push({
      code: EVOLUTION_VALIDATION_CODES.EVOLUTION_MISSING_VERSION_ID,
      message: 'Curriculum lifecycle record is missing a version ID.',
      field: 'versionId',
      lifecycleId: record.lifecycleId,
    });
  }

  // Version existence check
  if (record.versionId && !existingVersionIds.includes(record.versionId)) {
    errors.push({
      code: EVOLUTION_VALIDATION_CODES.EVOLUTION_INVALID_REFERENCE,
      message: `Curriculum lifecycle record references non-existent version: "${record.versionId}".`,
      field: 'versionId',
      lifecycleId: record.lifecycleId,
    });
  }

  if (record.previousState !== null && !CANONICAL_CURRICULUM_LIFECYCLE.includes(record.previousState)) {
    errors.push({
      code: EVOLUTION_VALIDATION_CODES.EVOLUTION_UNKNOWN_STATE,
      message: `Curriculum lifecycle record has unsupported previous state: "${record.previousState}".`,
      field: 'previousState',
      lifecycleId: record.lifecycleId,
    });
  }

  if (!CANONICAL_CURRICULUM_LIFECYCLE.includes(record.newState)) {
    errors.push({
      code: EVOLUTION_VALIDATION_CODES.EVOLUTION_UNKNOWN_STATE,
      message: `Curriculum lifecycle record has unsupported new state: "${record.newState}".`,
      field: 'newState',
      lifecycleId: record.lifecycleId,
    });
  }

  if (!record.transitionReason || record.transitionReason.trim() === '') {
    errors.push({
      code: EVOLUTION_VALIDATION_CODES.EVOLUTION_MISSING_TRANSITION_REASON,
      message: 'Curriculum lifecycle record is missing a transition reason.',
      field: 'transitionReason',
      lifecycleId: record.lifecycleId,
    });
  }

  if (!record.source || record.source.trim() === '') {
    errors.push({
      code: EVOLUTION_VALIDATION_CODES.EVOLUTION_MISSING_SOURCE,
      message: 'Curriculum lifecycle record is missing a source.',
      field: 'source',
      lifecycleId: record.lifecycleId,
    });
  }

  if (!CANONICAL_GOVERNANCE_STATUSES.includes(record.governanceStatus)) {
    errors.push({
      code: EVOLUTION_VALIDATION_CODES.EVOLUTION_INVALID_STATUS,
      message: `Curriculum lifecycle record has invalid governance status: "${record.governanceStatus}".`,
      field: 'governanceStatus',
      lifecycleId: record.lifecycleId,
    });
  }

  if (!record.rationale || record.rationale.trim() === '') {
    errors.push({
      code: EVOLUTION_VALIDATION_CODES.EVOLUTION_MISSING_RATIONALE,
      message: 'Curriculum lifecycle record is missing a rationale.',
      field: 'rationale',
      lifecycleId: record.lifecycleId,
    });
  }

  if (!record.providedBy || record.providedBy.trim() === '') {
    errors.push({
      code: EVOLUTION_VALIDATION_CODES.EVOLUTION_MISSING_PROVIDED_BY,
      message: 'Curriculum lifecycle record is missing a providedBy.',
      field: 'providedBy',
      lifecycleId: record.lifecycleId,
    });
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Evolution Record Validation
// ---------------------------------------------------------------------------

/**
 * Validates a single evolution record against canonical invariants.
 * Pure function. No side effects.
 */
export function validateEvolutionRecord(
  record: CurriculumEvolutionRecord,
  existingRelationIds: readonly string[],
  existingVersionIds: readonly string[],
): readonly CurriculumEvolutionValidationError[] {
  const errors: CurriculumEvolutionValidationError[] = [];

  if (!record.relationId || record.relationId.trim() === '') {
    errors.push({
      code: EVOLUTION_VALIDATION_CODES.EVOLUTION_MISSING_RELATION_ID,
      message: 'Curriculum evolution record is missing a relation ID.',
      field: 'relationId',
      relationId: record.relationId,
    });
  }

  // Duplicate relation check
  if (record.relationId && existingRelationIds.includes(record.relationId)) {
    errors.push({
      code: EVOLUTION_VALIDATION_CODES.EVOLUTION_DUPLICATE_RELATION,
      message: `Duplicate evolution relation ID: "${record.relationId}".`,
      field: 'relationId',
      relationId: record.relationId,
    });
  }

  if (!record.sourceVersionId || record.sourceVersionId.trim() === '') {
    errors.push({
      code: EVOLUTION_VALIDATION_CODES.EVOLUTION_MISSING_SOURCE_VERSION,
      message: 'Curriculum evolution record is missing a source version ID.',
      field: 'sourceVersionId',
      relationId: record.relationId,
    });
  }

  if (!record.targetVersionId || record.targetVersionId.trim() === '') {
    errors.push({
      code: EVOLUTION_VALIDATION_CODES.EVOLUTION_MISSING_TARGET_VERSION,
      message: 'Curriculum evolution record is missing a target version ID.',
      field: 'targetVersionId',
      relationId: record.relationId,
    });
  }

  // Self-reference check
  if (record.sourceVersionId && record.targetVersionId && record.sourceVersionId === record.targetVersionId) {
    errors.push({
      code: EVOLUTION_VALIDATION_CODES.EVOLUTION_SELF_REFERENCE,
      message: `Curriculum evolution record references itself: "${record.sourceVersionId}" -> "${record.targetVersionId}".`,
      field: 'sourceVersionId',
      relationId: record.relationId,
    });
  }

  // Source version existence check
  if (record.sourceVersionId && !existingVersionIds.includes(record.sourceVersionId)) {
    errors.push({
      code: EVOLUTION_VALIDATION_CODES.EVOLUTION_INVALID_REFERENCE,
      message: `Curriculum evolution record references non-existent source version: "${record.sourceVersionId}".`,
      field: 'sourceVersionId',
      relationId: record.relationId,
    });
  }

  // Target version existence check
  if (record.targetVersionId && !existingVersionIds.includes(record.targetVersionId)) {
    errors.push({
      code: EVOLUTION_VALIDATION_CODES.EVOLUTION_INVALID_REFERENCE,
      message: `Curriculum evolution record references non-existent target version: "${record.targetVersionId}".`,
      field: 'targetVersionId',
      relationId: record.relationId,
    });
  }

  if (!CANONICAL_EVOLUTION_RELATIONS.includes(record.relationType)) {
    errors.push({
      code: EVOLUTION_VALIDATION_CODES.EVOLUTION_UNKNOWN_RELATION,
      message: `Curriculum evolution record has unsupported relation type: "${record.relationType}".`,
      field: 'relationType',
      relationId: record.relationId,
    });
  }

  if (!record.source || record.source.trim() === '') {
    errors.push({
      code: EVOLUTION_VALIDATION_CODES.EVOLUTION_MISSING_SOURCE,
      message: 'Curriculum evolution record is missing a source.',
      field: 'source',
      relationId: record.relationId,
    });
  }

  if (!CANONICAL_GOVERNANCE_STATUSES.includes(record.governanceStatus)) {
    errors.push({
      code: EVOLUTION_VALIDATION_CODES.EVOLUTION_INVALID_STATUS,
      message: `Curriculum evolution record has invalid governance status: "${record.governanceStatus}".`,
      field: 'governanceStatus',
      relationId: record.relationId,
    });
  }

  if (!record.rationale || record.rationale.trim() === '') {
    errors.push({
      code: EVOLUTION_VALIDATION_CODES.EVOLUTION_MISSING_RATIONALE,
      message: 'Curriculum evolution record is missing a rationale.',
      field: 'rationale',
      relationId: record.relationId,
    });
  }

  if (!record.providedBy || record.providedBy.trim() === '') {
    errors.push({
      code: EVOLUTION_VALIDATION_CODES.EVOLUTION_MISSING_PROVIDED_BY,
      message: 'Curriculum evolution record is missing a providedBy.',
      field: 'providedBy',
      relationId: record.relationId,
    });
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Evolution Registry Validation
// ---------------------------------------------------------------------------

/**
 * Validates a curriculum evolution registry against canonical invariants.
 * Pure function. No side effects.
 */
export function validateEvolutionRegistry(
  registry: CurriculumEvolutionRegistry,
): CurriculumEvolutionValidationResult {
  const errors: CurriculumEvolutionValidationError[] = [];

  if (!registry.registryId || registry.registryId.trim() === '') {
    errors.push({
      code: EVOLUTION_VALIDATION_CODES.EVOLUTION_MISSING_REGISTRY_ID,
      message: 'Curriculum evolution registry is missing a registry ID.',
      field: 'registryId',
    });
  }

  // Empty registry check
  if (registry.versions.length === 0 && registry.lifecycleRecords.length === 0 && registry.evolutionRecords.length === 0) {
    errors.push({
      code: EVOLUTION_VALIDATION_CODES.EVOLUTION_EMPTY_REGISTRY,
      message: 'Curriculum evolution registry has no versions, lifecycle records, or evolution records.',
      field: 'versions',
    });
  }

  // Collect existing IDs for reference validation
  const existingVersionIds = registry.versions.map((v) => v.versionId);
  const existingLifecycleIds = registry.lifecycleRecords.map((l) => l.lifecycleId);
  const existingRelationIds = registry.evolutionRecords.map((e) => e.relationId);

  // Duplicate version ID check
  const seenVersionIds = new Set<string>();
  for (const version of registry.versions) {
    if (seenVersionIds.has(version.versionId)) {
      errors.push({
        code: EVOLUTION_VALIDATION_CODES.EVOLUTION_DUPLICATE_VERSION,
        message: `Duplicate version ID: "${version.versionId}".`,
        versionId: version.versionId,
      });
    }
    seenVersionIds.add(version.versionId);
  }

  // Duplicate lifecycle ID check
  const seenLifecycleIds = new Set<string>();
  for (const record of registry.lifecycleRecords) {
    if (seenLifecycleIds.has(record.lifecycleId)) {
      errors.push({
        code: EVOLUTION_VALIDATION_CODES.EVOLUTION_DUPLICATE_VERSION,
        message: `Duplicate lifecycle record ID: "${record.lifecycleId}".`,
        lifecycleId: record.lifecycleId,
      });
    }
    seenLifecycleIds.add(record.lifecycleId);
  }

  // Duplicate evolution relation ID check
  const seenRelationIds = new Set<string>();
  for (const record of registry.evolutionRecords) {
    if (seenRelationIds.has(record.relationId)) {
      errors.push({
        code: EVOLUTION_VALIDATION_CODES.EVOLUTION_DUPLICATE_RELATION,
        message: `Duplicate evolution relation ID: "${record.relationId}".`,
        relationId: record.relationId,
      });
    }
    seenRelationIds.add(record.relationId);
  }

  // Validate each version (exclude current version from duplicate check)
  for (const version of registry.versions) {
    const otherVersionIds = existingVersionIds.filter((id) => id !== version.versionId);
    errors.push(...validateCurriculumVersion(version, otherVersionIds));
  }

  // Validate each lifecycle record (exclude current record from duplicate check)
  for (const record of registry.lifecycleRecords) {
    const otherLifecycleIds = existingLifecycleIds.filter((id) => id !== record.lifecycleId);
    errors.push(...validateLifecycleRecord(record, otherLifecycleIds, existingVersionIds));
  }

  // Validate each evolution record (exclude current record from duplicate check)
  for (const record of registry.evolutionRecords) {
    const otherRelationIds = existingRelationIds.filter((id) => id !== record.relationId);
    errors.push(...validateEvolutionRecord(record, otherRelationIds, existingVersionIds));
  }

  // Business rule: Multiple active versions check
  const activeVersions = registry.versions.filter((v) => v.lifecycleState === 'active');
  if (activeVersions.length > 1) {
    errors.push({
      code: EVOLUTION_VALIDATION_CODES.EVOLUTION_MULTIPLE_ACTIVE,
      message: `Multiple active versions detected: ${activeVersions.map((v) => v.versionId).join(', ')}.`,
    });
  }

  // Business rule: Retired versions should not have successor relations
  const retiredVersions = new Set(
    registry.versions.filter((v) => v.lifecycleState === 'retired').map((v) => v.versionId),
  );
  for (const record of registry.evolutionRecords) {
    if (retiredVersions.has(record.sourceVersionId) && record.relationType === 'supersedes') {
      errors.push({
        code: EVOLUTION_VALIDATION_CODES.EVOLUTION_RETIRED_HAS_SUCCESSOR,
        message: `Retired version "${record.sourceVersionId}" has a supersedes relation.`,
        relationId: record.relationId,
      });
    }
  }

  // Business rule: Rejected versions should not have outgoing evolution relations
  const rejectedVersions = new Set(
    registry.versions.filter((v) => v.lifecycleState === 'rejected').map((v) => v.versionId),
  );
  for (const record of registry.evolutionRecords) {
    if (rejectedVersions.has(record.sourceVersionId)) {
      errors.push({
        code: EVOLUTION_VALIDATION_CODES.EVOLUTION_REJECTED_HAS_RELATION,
        message: `Rejected version "${record.sourceVersionId}" has an outgoing evolution relation.`,
        relationId: record.relationId,
      });
    }
  }

  // Deterministic metadata check
  if (registry.deterministic !== true) {
    errors.push({
      code: EVOLUTION_VALIDATION_CODES.EVOLUTION_TRACE_NOT_DETERMINISTIC,
      message: 'Curriculum evolution registry must declare deterministic: true.',
      field: 'deterministic',
    });
  }

  if (registry.randomUsed !== false) {
    errors.push({
      code: EVOLUTION_VALIDATION_CODES.EVOLUTION_TRACE_RANDOM_USED,
      message: 'Curriculum evolution registry must declare randomUsed: false.',
      field: 'randomUsed',
    });
  }

  if (registry.timeDependency !== false) {
    errors.push({
      code: EVOLUTION_VALIDATION_CODES.EVOLUTION_TRACE_TIME_DEPENDENCY,
      message: 'Curriculum evolution registry must declare timeDependency: false.',
      field: 'timeDependency',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'curriculum_evolution_version_governance',
  };
}

// ---------------------------------------------------------------------------
// Artifact With Evolution Validation
// ---------------------------------------------------------------------------

/**
 * Validates a curriculum artifact with evolution against canonical invariants.
 * Pure function. No side effects.
 */
export function validateCurriculumArtifactWithEvolution(
  artifact: CurriculumArtifactWithEvolution,
): CurriculumEvolutionValidationResult {
  const errors: CurriculumEvolutionValidationError[] = [];

  if (!artifact.artifactId || artifact.artifactId.trim() === '') {
    errors.push({
      code: EVOLUTION_VALIDATION_CODES.EVOLUTION_MISSING_PROVENANCE,
      message: 'Curriculum artifact is missing an artifact ID.',
      field: 'artifactId',
    });
  }

  // Validate evolution registry
  if (artifact.evolutionRegistry) {
    const registryResult = validateEvolutionRegistry(artifact.evolutionRegistry);
    errors.push(...registryResult.errors);
  }

  // Deterministic metadata check
  if (artifact.deterministic !== true) {
    errors.push({
      code: EVOLUTION_VALIDATION_CODES.EVOLUTION_TRACE_NOT_DETERMINISTIC,
      message: 'Curriculum artifact must declare deterministic: true.',
      field: 'deterministic',
    });
  }

  if (artifact.randomUsed !== false) {
    errors.push({
      code: EVOLUTION_VALIDATION_CODES.EVOLUTION_TRACE_RANDOM_USED,
      message: 'Curriculum artifact must declare randomUsed: false.',
      field: 'randomUsed',
    });
  }

  if (artifact.timeDependency !== false) {
    errors.push({
      code: EVOLUTION_VALIDATION_CODES.EVOLUTION_TRACE_TIME_DEPENDENCY,
      message: 'Curriculum artifact must declare timeDependency: false.',
      field: 'timeDependency',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'curriculum_evolution_version_governance',
  };
}

// ---------------------------------------------------------------------------
// Evolution Input Validation
// ---------------------------------------------------------------------------

/**
 * Validates curriculum evolution input against canonical invariants.
 * Pure function. No side effects.
 */
export function validateEvolutionInput(
  input: CurriculumEvolutionInput,
): readonly CurriculumEvolutionValidationError[] {
  const errors: CurriculumEvolutionValidationError[] = [];

  if (!input.registryId || input.registryId.trim() === '') {
    errors.push({
      code: EVOLUTION_VALIDATION_CODES.EVOLUTION_MISSING_REGISTRY_ID,
      message: 'Curriculum evolution input is missing a registry ID.',
      field: 'registryId',
    });
  }

  if (!input.versions || input.versions.length === 0) {
    if (!input.lifecycleRecords || input.lifecycleRecords.length === 0) {
      if (!input.evolutionRecords || input.evolutionRecords.length === 0) {
        errors.push({
          code: EVOLUTION_VALIDATION_CODES.EVOLUTION_EMPTY_REGISTRY,
          message: 'Curriculum evolution input has no versions, lifecycle records, or evolution records.',
          field: 'versions',
        });
      }
    }
  } else {
    const allVersionIds = input.versions.map((v) => v.versionId);
    for (const version of input.versions) {
      const otherVersionIds = allVersionIds.filter((id) => id !== version.versionId);
      errors.push(...validateCurriculumVersion(version, otherVersionIds));
    }
  }

  if (input.lifecycleRecords && input.lifecycleRecords.length > 0) {
    const existingVersionIds = input.versions.map((v) => v.versionId);
    const allLifecycleIds = input.lifecycleRecords.map((l) => l.lifecycleId);
    for (const record of input.lifecycleRecords) {
      const otherLifecycleIds = allLifecycleIds.filter((id) => id !== record.lifecycleId);
      errors.push(...validateLifecycleRecord(record, otherLifecycleIds, existingVersionIds));
    }
  }

  if (input.evolutionRecords && input.evolutionRecords.length > 0) {
    const existingVersionIds = input.versions.map((v) => v.versionId);
    const allRelationIds = input.evolutionRecords.map((e) => e.relationId);
    for (const record of input.evolutionRecords) {
      const otherRelationIds = allRelationIds.filter((id) => id !== record.relationId);
      errors.push(...validateEvolutionRecord(record, otherRelationIds, existingVersionIds));
    }
  }

  return errors;
}

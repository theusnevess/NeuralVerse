/**
 * NV-1700-D5-OPT-05 — Version Validation Layer
 *
 * Deterministic validation for version history metadata.
 * Returns structured errors, never exceptions for expected validation failures.
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import type {
  KnowledgeVersion,
  EditorialRevision,
  VersionRelationship,
  VersionRegistry,
  VersionTrace,
  VersionInput,
  KnowledgeArtifactWithVersionHistory,
  VersionValidationError,
  KnowledgeVersionValidationResult,
  EditorialRevisionValidationResult,
  VersionRelationshipValidationResult,
  VersionRegistryValidationResult,
  VersionInputValidationResult,
  VersionTraceValidationResult,
  KnowledgeArtifactWithVersionHistoryValidationResult,
} from './KnowledgeAgentContract.ts';

import {
  CANONICAL_VERSION_TYPES,
  CANONICAL_EDITORIAL_ACTIONS,
  CANONICAL_EDITORIAL_LIFECYCLE,
  CANONICAL_VERSION_STATUS,
  CANONICAL_GOVERNANCE_STATUSES,
} from './KnowledgeAgentContract.ts';

// ---------------------------------------------------------------------------
// Validation Error Codes
// ---------------------------------------------------------------------------

export const VERSION_VALIDATION_CODES = {
  VERSION_DUPLICATE_VERSION: 'VERSION_DUPLICATE_VERSION',
  VERSION_DUPLICATE_REVISION: 'VERSION_DUPLICATE_REVISION',
  VERSION_DUPLICATE_RELATIONSHIP: 'VERSION_DUPLICATE_RELATIONSHIP',
  VERSION_UNKNOWN_VERSION_TYPE: 'VERSION_UNKNOWN_VERSION_TYPE',
  VERSION_UNKNOWN_EDITORIAL_ACTION: 'VERSION_UNKNOWN_EDITORIAL_ACTION',
  VERSION_UNKNOWN_LIFECYCLE: 'VERSION_UNKNOWN_LIFECYCLE',
  VERSION_UNKNOWN_STATUS: 'VERSION_UNKNOWN_STATUS',
  VERSION_INVALID_GOVERNANCE: 'VERSION_INVALID_GOVERNANCE',
  VERSION_MISSING_PROVENANCE: 'VERSION_MISSING_PROVENANCE',
  VERSION_MISSING_SOURCE: 'VERSION_MISSING_SOURCE',
  VERSION_MISSING_RATIONALE: 'VERSION_MISSING_RATIONALE',
  VERSION_MISSING_PROVIDED_BY: 'VERSION_MISSING_PROVIDED_BY',
  VERSION_INVALID_VERSION_REFERENCE: 'VERSION_INVALID_VERSION_REFERENCE',
  VERSION_SELF_REFERENCE: 'VERSION_SELF_REFERENCE',
  VERSION_INVALID_LIFECYCLE_TRANSITION: 'VERSION_INVALID_LIFECYCLE_TRANSITION',
  VERSION_MISSING_ARTIFACT: 'VERSION_MISSING_ARTIFACT',
  VERSION_EMPTY_REGISTRY: 'VERSION_EMPTY_REGISTRY',
  VERSION_INVALID_TRACE: 'VERSION_INVALID_TRACE',
  VERSION_MISSING_VERSION_ID: 'VERSION_MISSING_VERSION_ID',
  VERSION_MISSING_KNOWLEDGE_ID: 'VERSION_MISSING_KNOWLEDGE_ID',
  VERSION_MISSING_VERSION_NUMBER: 'VERSION_MISSING_VERSION_NUMBER',
  VERSION_MISSING_REVISION_ID: 'VERSION_MISSING_REVISION_ID',
  VERSION_MISSING_VERSION_REFERENCE: 'VERSION_MISSING_VERSION_REFERENCE',
  VERSION_MISSING_RELATIONSHIP_ID: 'VERSION_MISSING_RELATIONSHIP_ID',
  VERSION_MISSING_SOURCE_VERSION: 'VERSION_MISSING_SOURCE_VERSION',
  VERSION_MISSING_TARGET_VERSION: 'VERSION_MISSING_TARGET_VERSION',
  VERSION_MISSING_TITLE: 'VERSION_MISSING_TITLE',
  VERSION_MISSING_DESCRIPTION: 'VERSION_MISSING_DESCRIPTION',
  VERSION_INVALID_REGISTRY: 'VERSION_INVALID_REGISTRY',
} as const;

// ---------------------------------------------------------------------------
// Single Knowledge Version Validation
// ---------------------------------------------------------------------------

/**
 * Validates a single knowledge version against canonical invariants.
 * Pure function. No side effects.
 */
export function validateKnowledgeVersion(
  version: KnowledgeVersion,
): readonly VersionValidationError[] {
  const errors: VersionValidationError[] = [];

  if (!version.versionId || version.versionId.trim() === '') {
    errors.push({
      code: VERSION_VALIDATION_CODES.VERSION_MISSING_VERSION_ID,
      message: 'Knowledge version is missing a version ID.',
      field: 'versionId',
      id: version.versionId,
    });
  }

  if (!version.knowledgeId || version.knowledgeId.trim() === '') {
    errors.push({
      code: VERSION_VALIDATION_CODES.VERSION_MISSING_KNOWLEDGE_ID,
      message: 'Knowledge version is missing a knowledge ID.',
      field: 'knowledgeId',
      id: version.versionId,
    });
  }

  if (!version.versionNumber || version.versionNumber.trim() === '') {
    errors.push({
      code: VERSION_VALIDATION_CODES.VERSION_MISSING_VERSION_NUMBER,
      message: 'Knowledge version is missing a version number.',
      field: 'versionNumber',
      id: version.versionId,
    });
  }

  if (!CANONICAL_VERSION_TYPES.includes(version.versionType)) {
    errors.push({
      code: VERSION_VALIDATION_CODES.VERSION_UNKNOWN_VERSION_TYPE,
      message: `Knowledge version has unsupported type: "${version.versionType}".`,
      field: 'versionType',
      id: version.versionId,
    });
  }

  if (!CANONICAL_VERSION_STATUS.includes(version.status)) {
    errors.push({
      code: VERSION_VALIDATION_CODES.VERSION_UNKNOWN_STATUS,
      message: `Knowledge version has unsupported status: "${version.status}".`,
      field: 'status',
      id: version.versionId,
    });
  }

  if (!CANONICAL_EDITORIAL_LIFECYCLE.includes(version.lifecycle)) {
    errors.push({
      code: VERSION_VALIDATION_CODES.VERSION_UNKNOWN_LIFECYCLE,
      message: `Knowledge version has unsupported lifecycle: "${version.lifecycle}".`,
      field: 'lifecycle',
      id: version.versionId,
    });
  }

  if (!version.title || version.title.trim() === '') {
    errors.push({
      code: VERSION_VALIDATION_CODES.VERSION_MISSING_TITLE,
      message: 'Knowledge version is missing a title.',
      field: 'title',
      id: version.versionId,
    });
  }

  if (!version.provenance) {
    errors.push({
      code: VERSION_VALIDATION_CODES.VERSION_MISSING_PROVENANCE,
      message: 'Knowledge version is missing provenance.',
      field: 'provenance',
      id: version.versionId,
    });
  } else {
    if (!version.provenance.source || version.provenance.source.trim() === '') {
      errors.push({
        code: VERSION_VALIDATION_CODES.VERSION_MISSING_SOURCE,
        message: 'Version provenance is missing a source.',
        field: 'provenance.source',
        id: version.versionId,
      });
    }

    if (!version.provenance.rationale || version.provenance.rationale.trim() === '') {
      errors.push({
        code: VERSION_VALIDATION_CODES.VERSION_MISSING_RATIONALE,
        message: 'Version provenance is missing a rationale.',
        field: 'provenance.rationale',
        id: version.versionId,
      });
    }

    if (!version.provenance.providedBy || version.provenance.providedBy.trim() === '') {
      errors.push({
        code: VERSION_VALIDATION_CODES.VERSION_MISSING_PROVIDED_BY,
        message: 'Version provenance is missing providedBy.',
        field: 'provenance.providedBy',
        id: version.versionId,
      });
    }

    if (!CANONICAL_GOVERNANCE_STATUSES.includes(version.provenance.governanceStatus)) {
      errors.push({
        code: VERSION_VALIDATION_CODES.VERSION_INVALID_GOVERNANCE,
        message: `Version provenance has invalid governance status: "${version.provenance.governanceStatus}".`,
        field: 'provenance.governanceStatus',
        id: version.versionId,
      });
    }
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Editorial Revision Validation
// ---------------------------------------------------------------------------

/**
 * Validates a single editorial revision against canonical invariants.
 * Pure function. No side effects.
 */
export function validateEditorialRevision(
  revision: EditorialRevision,
): readonly VersionValidationError[] {
  const errors: VersionValidationError[] = [];

  if (!revision.revisionId || revision.revisionId.trim() === '') {
    errors.push({
      code: VERSION_VALIDATION_CODES.VERSION_MISSING_REVISION_ID,
      message: 'Editorial revision is missing a revision ID.',
      field: 'revisionId',
      id: revision.revisionId,
    });
  }

  if (!revision.versionId || revision.versionId.trim() === '') {
    errors.push({
      code: VERSION_VALIDATION_CODES.VERSION_MISSING_VERSION_REFERENCE,
      message: 'Editorial revision is missing a version ID.',
      field: 'versionId',
      id: revision.revisionId,
    });
  }

  if (!revision.knowledgeId || revision.knowledgeId.trim() === '') {
    errors.push({
      code: VERSION_VALIDATION_CODES.VERSION_MISSING_KNOWLEDGE_ID,
      message: 'Editorial revision is missing a knowledge ID.',
      field: 'knowledgeId',
      id: revision.revisionId,
    });
  }

  if (!CANONICAL_EDITORIAL_ACTIONS.includes(revision.editorialAction)) {
    errors.push({
      code: VERSION_VALIDATION_CODES.VERSION_UNKNOWN_EDITORIAL_ACTION,
      message: `Editorial revision has unsupported action: "${revision.editorialAction}".`,
      field: 'editorialAction',
      id: revision.revisionId,
    });
  }

  if (!CANONICAL_VERSION_STATUS.includes(revision.status)) {
    errors.push({
      code: VERSION_VALIDATION_CODES.VERSION_UNKNOWN_STATUS,
      message: `Editorial revision has unsupported status: "${revision.status}".`,
      field: 'status',
      id: revision.revisionId,
    });
  }

  if (!revision.provenance) {
    errors.push({
      code: VERSION_VALIDATION_CODES.VERSION_MISSING_PROVENANCE,
      message: 'Editorial revision is missing provenance.',
      field: 'provenance',
      id: revision.revisionId,
    });
  } else {
    if (!revision.provenance.source || revision.provenance.source.trim() === '') {
      errors.push({
        code: VERSION_VALIDATION_CODES.VERSION_MISSING_SOURCE,
        message: 'Revision provenance is missing a source.',
        field: 'provenance.source',
        id: revision.revisionId,
      });
    }

    if (!revision.provenance.rationale || revision.provenance.rationale.trim() === '') {
      errors.push({
        code: VERSION_VALIDATION_CODES.VERSION_MISSING_RATIONALE,
        message: 'Revision provenance is missing a rationale.',
        field: 'provenance.rationale',
        id: revision.revisionId,
      });
    }

    if (!revision.provenance.providedBy || revision.provenance.providedBy.trim() === '') {
      errors.push({
        code: VERSION_VALIDATION_CODES.VERSION_MISSING_PROVIDED_BY,
        message: 'Revision provenance is missing providedBy.',
        field: 'provenance.providedBy',
        id: revision.revisionId,
      });
    }
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Version Relationship Validation
// ---------------------------------------------------------------------------

/**
 * Validates a single version relationship against canonical invariants.
 * Pure function. No side effects.
 */
export function validateVersionRelationship(
  relationship: VersionRelationship,
): readonly VersionValidationError[] {
  const errors: VersionValidationError[] = [];

  if (!relationship.relationshipId || relationship.relationshipId.trim() === '') {
    errors.push({
      code: VERSION_VALIDATION_CODES.VERSION_MISSING_RELATIONSHIP_ID,
      message: 'Version relationship is missing a relationship ID.',
      field: 'relationshipId',
      id: relationship.relationshipId,
    });
  }

  if (!relationship.sourceVersionId || relationship.sourceVersionId.trim() === '') {
    errors.push({
      code: VERSION_VALIDATION_CODES.VERSION_MISSING_SOURCE_VERSION,
      message: 'Version relationship is missing a source version ID.',
      field: 'sourceVersionId',
      id: relationship.relationshipId,
    });
  }

  if (!relationship.targetVersionId || relationship.targetVersionId.trim() === '') {
    errors.push({
      code: VERSION_VALIDATION_CODES.VERSION_MISSING_TARGET_VERSION,
      message: 'Version relationship is missing a target version ID.',
      field: 'targetVersionId',
      id: relationship.relationshipId,
    });
  }

  if (relationship.sourceVersionId === relationship.targetVersionId) {
    errors.push({
      code: VERSION_VALIDATION_CODES.VERSION_SELF_REFERENCE,
      message: 'Version relationship references itself.',
      field: 'targetVersionId',
      id: relationship.relationshipId,
    });
  }

  if (!CANONICAL_VERSION_STATUS.includes(relationship.status)) {
    errors.push({
      code: VERSION_VALIDATION_CODES.VERSION_UNKNOWN_STATUS,
      message: `Version relationship has unsupported status: "${relationship.status}".`,
      field: 'status',
      id: relationship.relationshipId,
    });
  }

  if (!relationship.provenance) {
    errors.push({
      code: VERSION_VALIDATION_CODES.VERSION_MISSING_PROVENANCE,
      message: 'Version relationship is missing provenance.',
      field: 'provenance',
      id: relationship.relationshipId,
    });
  } else {
    if (!relationship.provenance.source || relationship.provenance.source.trim() === '') {
      errors.push({
        code: VERSION_VALIDATION_CODES.VERSION_MISSING_SOURCE,
        message: 'Relationship provenance is missing a source.',
        field: 'provenance.source',
        id: relationship.relationshipId,
      });
    }

    if (!relationship.provenance.rationale || relationship.provenance.rationale.trim() === '') {
      errors.push({
        code: VERSION_VALIDATION_CODES.VERSION_MISSING_RATIONALE,
        message: 'Relationship provenance is missing a rationale.',
        field: 'provenance.rationale',
        id: relationship.relationshipId,
      });
    }

    if (!relationship.provenance.providedBy || relationship.provenance.providedBy.trim() === '') {
      errors.push({
        code: VERSION_VALIDATION_CODES.VERSION_MISSING_PROVIDED_BY,
        message: 'Relationship provenance is missing providedBy.',
        field: 'provenance.providedBy',
        id: relationship.relationshipId,
      });
    }
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Version Registry Validation
// ---------------------------------------------------------------------------

/**
 * Validates a version registry against canonical invariants.
 * Pure function. No side effects.
 */
export function validateVersionRegistry(
  registry: VersionRegistry,
): VersionRegistryValidationResult {
  const errors: VersionValidationError[] = [];

  if (!registry.registryId || registry.registryId.trim() === '') {
    errors.push({
      code: VERSION_VALIDATION_CODES.VERSION_INVALID_REGISTRY,
      message: 'Registry is missing a registry ID.',
      field: 'registryId',
    });
  }

  if (!registry.versions || registry.versions.length === 0) {
    errors.push({
      code: VERSION_VALIDATION_CODES.VERSION_EMPTY_REGISTRY,
      message: 'Registry has no versions.',
      field: 'versions',
    });
  }

  if (registry.deterministic !== true) {
    errors.push({
      code: VERSION_VALIDATION_CODES.VERSION_INVALID_TRACE,
      message: 'Registry must declare deterministic: true.',
      field: 'deterministic',
    });
  }

  if (registry.randomUsed !== false) {
    errors.push({
      code: VERSION_VALIDATION_CODES.VERSION_INVALID_TRACE,
      message: 'Registry must declare randomUsed: false.',
      field: 'randomUsed',
    });
  }

  if (registry.timeDependency !== false) {
    errors.push({
      code: VERSION_VALIDATION_CODES.VERSION_INVALID_TRACE,
      message: 'Registry must declare timeDependency: false.',
      field: 'timeDependency',
    });
  }

  // Check for duplicate version IDs
  const seenVersionIds = new Set<string>();
  for (const version of registry.versions) {
    if (seenVersionIds.has(version.versionId)) {
      errors.push({
        code: VERSION_VALIDATION_CODES.VERSION_DUPLICATE_VERSION,
        message: `Duplicate version ID: "${version.versionId}".`,
        id: version.versionId,
      });
    }
    seenVersionIds.add(version.versionId);
  }

  // Check for duplicate revision IDs
  const seenRevisionIds = new Set<string>();
  for (const revision of registry.revisions) {
    if (seenRevisionIds.has(revision.revisionId)) {
      errors.push({
        code: VERSION_VALIDATION_CODES.VERSION_DUPLICATE_REVISION,
        message: `Duplicate revision ID: "${revision.revisionId}".`,
        id: revision.revisionId,
      });
    }
    seenRevisionIds.add(revision.revisionId);
  }

  // Check for duplicate relationship IDs
  const seenRelationshipIds = new Set<string>();
  for (const relationship of registry.relationships) {
    if (seenRelationshipIds.has(relationship.relationshipId)) {
      errors.push({
        code: VERSION_VALIDATION_CODES.VERSION_DUPLICATE_RELATIONSHIP,
        message: `Duplicate relationship ID: "${relationship.relationshipId}".`,
        id: relationship.relationshipId,
      });
    }
    seenRelationshipIds.add(relationship.relationshipId);
  }

  // Validate each version
  for (const version of registry.versions) {
    errors.push(...validateKnowledgeVersion(version));
  }

  // Validate each revision
  for (const revision of registry.revisions) {
    errors.push(...validateEditorialRevision(revision));
  }

  // Validate each relationship
  for (const relationship of registry.relationships) {
    errors.push(...validateVersionRelationship(relationship));
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'version_registry_composition',
  };
}

// ---------------------------------------------------------------------------
// Version Input Validation
// ---------------------------------------------------------------------------

/**
 * Validates version input against canonical invariants.
 * Pure function. No side effects.
 */
export function validateVersionInput(
  input: VersionInput,
): VersionInputValidationResult {
  const errors: VersionValidationError[] = [];

  if (!input.versions || input.versions.length === 0) {
    errors.push({
      code: VERSION_VALIDATION_CODES.VERSION_EMPTY_REGISTRY,
      message: 'Input has no versions.',
      field: 'versions',
    });
  } else {
    for (const version of input.versions) {
      errors.push(...validateKnowledgeVersion(version));
    }
  }

  for (const revision of input.revisions) {
    errors.push(...validateEditorialRevision(revision));
  }

  for (const relationship of input.relationships) {
    errors.push(...validateVersionRelationship(relationship));
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'version_input_composition',
  };
}

// ---------------------------------------------------------------------------
// Version Trace Validation
// ---------------------------------------------------------------------------

/**
 * Validates a version trace against canonical invariants.
 * Pure function. No side effects.
 */
export function validateVersionTrace(
  trace: VersionTrace,
): VersionTraceValidationResult {
  const errors: VersionValidationError[] = [];

  if (!trace.traceId || trace.traceId.trim() === '') {
    errors.push({
      code: VERSION_VALIDATION_CODES.VERSION_INVALID_TRACE,
      message: 'Version trace is missing a trace ID.',
      field: 'traceId',
    });
  }

  if (trace.deterministic !== true) {
    errors.push({
      code: VERSION_VALIDATION_CODES.VERSION_INVALID_TRACE,
      message: 'Version trace must declare deterministic: true.',
      field: 'deterministic',
    });
  }

  if (trace.randomUsed !== false) {
    errors.push({
      code: VERSION_VALIDATION_CODES.VERSION_INVALID_TRACE,
      message: 'Version trace must declare randomUsed: false.',
      field: 'randomUsed',
    });
  }

  if (trace.timeDependency !== false) {
    errors.push({
      code: VERSION_VALIDATION_CODES.VERSION_INVALID_TRACE,
      message: 'Version trace must declare timeDependency: false.',
      field: 'timeDependency',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'version_trace_composition',
  };
}

// ---------------------------------------------------------------------------
// Knowledge Artifact With Version History Validation
// ---------------------------------------------------------------------------

/**
 * Validates a knowledge artifact with version history against canonical invariants.
 * Pure function. No side effects.
 */
export function validateKnowledgeArtifactWithVersions(
  artifact: KnowledgeArtifactWithVersionHistory,
): KnowledgeArtifactWithVersionHistoryValidationResult {
  const errors: VersionValidationError[] = [];

  if (!artifact.knowledgeId || artifact.knowledgeId.trim() === '') {
    errors.push({
      code: VERSION_VALIDATION_CODES.VERSION_MISSING_KNOWLEDGE_ID,
      message: 'Knowledge artifact is missing a knowledge ID.',
      field: 'knowledgeId',
      id: artifact.knowledgeId,
    });
  }

  if (!artifact.title || artifact.title.trim() === '') {
    errors.push({
      code: VERSION_VALIDATION_CODES.VERSION_MISSING_TITLE,
      message: 'Knowledge artifact is missing a title.',
      field: 'title',
      id: artifact.knowledgeId,
    });
  }

  if (!artifact.provenance) {
    errors.push({
      code: VERSION_VALIDATION_CODES.VERSION_MISSING_PROVENANCE,
      message: 'Knowledge artifact is missing provenance.',
      field: 'provenance',
      id: artifact.knowledgeId,
    });
  } else {
    if (!artifact.provenance.source || artifact.provenance.source.trim() === '') {
      errors.push({
        code: VERSION_VALIDATION_CODES.VERSION_MISSING_SOURCE,
        message: 'Knowledge artifact provenance is missing a source.',
        field: 'provenance.source',
        id: artifact.knowledgeId,
      });
    }

    if (!artifact.provenance.rationale || artifact.provenance.rationale.trim() === '') {
      errors.push({
        code: VERSION_VALIDATION_CODES.VERSION_MISSING_RATIONALE,
        message: 'Knowledge artifact provenance is missing a rationale.',
        field: 'provenance.rationale',
        id: artifact.knowledgeId,
      });
    }

    if (!artifact.provenance.providedBy || artifact.provenance.providedBy.trim() === '') {
      errors.push({
        code: VERSION_VALIDATION_CODES.VERSION_MISSING_PROVIDED_BY,
        message: 'Knowledge artifact provenance is missing providedBy.',
        field: 'provenance.providedBy',
        id: artifact.knowledgeId,
      });
    }
  }

  // Validate each version
  for (const version of artifact.versions) {
    errors.push(...validateKnowledgeVersion(version));
  }

  // Validate each revision
  for (const revision of artifact.revisions) {
    errors.push(...validateEditorialRevision(revision));
  }

  // Validate each relationship
  for (const relationship of artifact.relationships) {
    errors.push(...validateVersionRelationship(relationship));
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'knowledge_artifact_with_version_history_composition',
  };
}

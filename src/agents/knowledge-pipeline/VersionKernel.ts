/**
 * NV-1700-D5-OPT-05 — Version History & Editorial Evolution Kernel
 *
 * Deterministic orchestration functions for version history metadata.
 * Produces versions, revisions, relationships, traces, and registries.
 *
 * This module never:
 * - Edits documents
 * - Rewrites knowledge
 * - Merges versions
 * - Compares text
 * - Generates diffs
 * - Performs synchronization
 * - Integrates with Git
 * - Integrates with Obsidian APIs
 * - Executes publishing
 * - Infers better versions
 * - Infers quality
 * - Mutates history
 * - Calls LLMs
 * - Calls external APIs
 *
 * Version history metadata only.
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import type {
  KnowledgeVersion,
  EditorialRevision,
  VersionRelationship,
  VersionProvenance,
  VersionTrace,
  VersionRegistry,
  VersionRegistryMetadata,
  VersionInput,
  VersionType,
  EditorialAction,
  EditorialLifecycle,
  VersionStatus,
  KnowledgeGovernanceStatus,
  KnowledgeArtifactWithVersionHistory,
} from './KnowledgeAgentContract.ts';

import {
  CANONICAL_VERSION_TYPES,
  CANONICAL_EDITORIAL_ACTIONS,
  CANONICAL_EDITORIAL_LIFECYCLE,
  CANONICAL_VERSION_STATUS,
  CANONICAL_GOVERNANCE_STATUSES,
} from './KnowledgeAgentContract.ts';

// ---------------------------------------------------------------------------
// Version Provenance Composition
// ---------------------------------------------------------------------------

/**
 * Composes version provenance from provided parameters.
 * Pure function. No side effects.
 */
export function composeVersionProvenance(params: {
  readonly source: string;
  readonly governanceStatus: KnowledgeGovernanceStatus;
  readonly providedBy: string;
  readonly rationale: string;
}): VersionProvenance {
  return {
    source: params.source,
    governanceStatus: params.governanceStatus,
    providedBy: params.providedBy,
    rationale: params.rationale,
  };
}

// ---------------------------------------------------------------------------
// Knowledge Version Composition
// ---------------------------------------------------------------------------

/**
 * Composes a knowledge version from provided parameters.
 * Pure function. No side effects.
 */
export function composeKnowledgeVersion(params: {
  readonly versionId: string;
  readonly knowledgeId: string;
  readonly versionNumber: string;
  readonly versionType: VersionType;
  readonly status: VersionStatus;
  readonly lifecycle: EditorialLifecycle;
  readonly title: string;
  readonly description: string;
  readonly tags: readonly string[];
  readonly provenance: VersionProvenance;
}): KnowledgeVersion {
  return {
    versionId: params.versionId,
    knowledgeId: params.knowledgeId,
    versionNumber: params.versionNumber,
    versionType: params.versionType,
    status: params.status,
    lifecycle: params.lifecycle,
    title: params.title,
    description: params.description,
    tags: [...params.tags],
    provenance: params.provenance,
  };
}

// ---------------------------------------------------------------------------
// Editorial Revision Composition
// ---------------------------------------------------------------------------

/**
 * Composes an editorial revision from provided parameters.
 * Pure function. No side effects.
 */
export function composeEditorialRevision(params: {
  readonly revisionId: string;
  readonly versionId: string;
  readonly knowledgeId: string;
  readonly editorialAction: EditorialAction;
  readonly description: string;
  readonly status: VersionStatus;
  readonly provenance: VersionProvenance;
}): EditorialRevision {
  return {
    revisionId: params.revisionId,
    versionId: params.versionId,
    knowledgeId: params.knowledgeId,
    editorialAction: params.editorialAction,
    description: params.description,
    status: params.status,
    provenance: params.provenance,
  };
}

// ---------------------------------------------------------------------------
// Version Relationship Composition
// ---------------------------------------------------------------------------

/**
 * Composes a version relationship from provided parameters.
 * Pure function. No side effects.
 */
export function composeVersionRelationship(params: {
  readonly relationshipId: string;
  readonly sourceVersionId: string;
  readonly targetVersionId: string;
  readonly relationshipType: string;
  readonly description: string;
  readonly status: VersionStatus;
  readonly provenance: VersionProvenance;
}): VersionRelationship {
  return {
    relationshipId: params.relationshipId,
    sourceVersionId: params.sourceVersionId,
    targetVersionId: params.targetVersionId,
    relationshipType: params.relationshipType,
    description: params.description,
    status: params.status,
    provenance: params.provenance,
  };
}

// ---------------------------------------------------------------------------
// Version Trace Composition
// ---------------------------------------------------------------------------

/**
 * Composes a version trace from metadata.
 * Pure function. No side effects.
 */
export function composeVersionTrace(params: {
  readonly traceId: string;
  readonly decisionCount: number;
  readonly validationCount: number;
  readonly registryVersion: string;
  readonly compositionVersion: string;
}): VersionTrace {
  return {
    traceId: params.traceId,
    decisionCount: params.decisionCount,
    validationCount: params.validationCount,
    registryVersion: params.registryVersion,
    compositionVersion: params.compositionVersion,
    deterministic: true,
    generatedFrom: 'deterministic_version_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Deterministic Sort Comparators
// ---------------------------------------------------------------------------

/**
 * Deterministic comparator for knowledge versions.
 * Sorts by versionId, then knowledgeId, then versionNumber.
 * Pure function. No side effects.
 */
function _compareKnowledgeVersion(
  a: KnowledgeVersion,
  b: KnowledgeVersion,
): number {
  if (a.versionId < b.versionId) return -1;
  if (a.versionId > b.versionId) return 1;

  if (a.knowledgeId < b.knowledgeId) return -1;
  if (a.knowledgeId > b.knowledgeId) return 1;

  if (a.versionNumber < b.versionNumber) return -1;
  if (a.versionNumber > b.versionNumber) return 1;

  return 0;
}

/**
 * Deterministic comparator for editorial revisions.
 * Sorts by revisionId, then versionId, then knowledgeId.
 * Pure function. No side effects.
 */
function _compareEditorialRevision(
  a: EditorialRevision,
  b: EditorialRevision,
): number {
  if (a.revisionId < b.revisionId) return -1;
  if (a.revisionId > b.revisionId) return 1;

  if (a.versionId < b.versionId) return -1;
  if (a.versionId > b.versionId) return 1;

  if (a.knowledgeId < b.knowledgeId) return -1;
  if (a.knowledgeId > b.knowledgeId) return 1;

  return 0;
}

/**
 * Deterministic comparator for version relationships.
 * Sorts by relationshipId, then sourceVersionId, then targetVersionId.
 * Pure function. No side effects.
 */
function _compareVersionRelationship(
  a: VersionRelationship,
  b: VersionRelationship,
): number {
  if (a.relationshipId < b.relationshipId) return -1;
  if (a.relationshipId > b.relationshipId) return 1;

  if (a.sourceVersionId < b.sourceVersionId) return -1;
  if (a.sourceVersionId > b.sourceVersionId) return 1;

  if (a.targetVersionId < b.targetVersionId) return -1;
  if (a.targetVersionId > b.targetVersionId) return 1;

  return 0;
}

// ---------------------------------------------------------------------------
// Version Registry Composition
// ---------------------------------------------------------------------------

/**
 * Composes a version registry from versions, revisions, and relationships.
 * Pure function. No side effects.
 * Deterministic ordering for all collections.
 */
export function composeVersionRegistry(
  versions: readonly KnowledgeVersion[],
  revisions: readonly EditorialRevision[],
  relationships: readonly VersionRelationship[],
): VersionRegistry {
  const sortedVersions = [...versions].sort(_compareKnowledgeVersion);
  const sortedRevisions = [...revisions].sort(_compareEditorialRevision);
  const sortedRelationships = [...relationships].sort(_compareVersionRelationship);

  const versionTypes = new Set(sortedVersions.map((v) => v.versionType));

  const metadata: VersionRegistryMetadata = {
    registryId: `_registry_${sortedVersions.length}_${sortedRevisions.length}_${sortedRelationships.length}`,
    versionCount: sortedVersions.length,
    revisionCount: sortedRevisions.length,
    relationshipCount: sortedRelationships.length,
    versionTypeCount: versionTypes.size,
  };

  return {
    registryId: metadata.registryId,
    versions: sortedVersions,
    revisions: sortedRevisions,
    relationships: sortedRelationships,
    metadata,
    trace: {
      traceId: `_trace_${sortedVersions.length}_${sortedRevisions.length}_${sortedRelationships.length}`,
      decisionCount: 0,
      validationCount: 0,
      registryVersion: '1.0.0',
      compositionVersion: '1.0.0',
      deterministic: true,
      generatedFrom: 'deterministic_version_kernel',
      randomUsed: false,
      timeDependency: false,
    },
    deterministic: true,
    generatedFrom: 'deterministic_version_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Version Registry From Input Composition
// ---------------------------------------------------------------------------

/**
 * Composes a version registry from an input.
 * Pure function. No side effects.
 */
export function composeVersionRegistryFromInput(
  input: VersionInput,
): VersionRegistry {
  return composeVersionRegistry(
    input.versions,
    input.revisions,
    input.relationships,
  );
}

// ---------------------------------------------------------------------------
// Knowledge Versions Composition (Main Entry Point)
// ---------------------------------------------------------------------------

/**
 * Composes a complete version registry from an input.
 * Pure function. No side effects.
 */
export function composeKnowledgeVersions(
  input: VersionInput,
): VersionRegistry {
  let decisionCount = 0;
  let validationCount = 0;

  for (const version of input.versions) {
    decisionCount++;
    const errors = _validateVersionForDecision(version);
    if (errors.length === 0) validationCount++;
  }

  for (const revision of input.revisions) {
    decisionCount++;
    const errors = _validateRevisionForDecision(revision);
    if (errors.length === 0) validationCount++;
  }

  for (const relationship of input.relationships) {
    decisionCount++;
    const errors = _validateRelationshipForDecision(relationship);
    if (errors.length === 0) validationCount++;
  }

  const registry = composeVersionRegistry(
    input.versions,
    input.revisions,
    input.relationships,
  );

  return {
    ...registry,
    trace: composeVersionTrace({
      traceId: `_trace_${input.versions.length}_${input.revisions.length}_${input.relationships.length}`,
      decisionCount,
      validationCount,
      registryVersion: '1.0.0',
      compositionVersion: '1.0.0',
    }),
  };
}

/**
 * Validates a knowledge version for decision composition.
 * Pure function. No side effects.
 */
function _validateVersionForDecision(
  version: KnowledgeVersion,
): readonly string[] {
  const errors: string[] = [];

  if (!version.versionId || version.versionId.trim() === '') {
    errors.push('VERSION_MISSING_VERSION_ID');
  }

  if (!version.knowledgeId || version.knowledgeId.trim() === '') {
    errors.push('VERSION_MISSING_KNOWLEDGE_ID');
  }

  if (!version.versionNumber || version.versionNumber.trim() === '') {
    errors.push('VERSION_MISSING_VERSION_NUMBER');
  }

  if (!CANONICAL_VERSION_TYPES.includes(version.versionType)) {
    errors.push('VERSION_UNKNOWN_VERSION_TYPE');
  }

  if (!CANONICAL_VERSION_STATUS.includes(version.status)) {
    errors.push('VERSION_UNKNOWN_STATUS');
  }

  if (!CANONICAL_EDITORIAL_LIFECYCLE.includes(version.lifecycle)) {
    errors.push('VERSION_UNKNOWN_LIFECYCLE');
  }

  if (!version.provenance) {
    errors.push('VERSION_MISSING_PROVENANCE');
  }

  return errors;
}

/**
 * Validates an editorial revision for decision composition.
 * Pure function. No side effects.
 */
function _validateRevisionForDecision(
  revision: EditorialRevision,
): readonly string[] {
  const errors: string[] = [];

  if (!revision.revisionId || revision.revisionId.trim() === '') {
    errors.push('VERSION_MISSING_REVISION_ID');
  }

  if (!revision.versionId || revision.versionId.trim() === '') {
    errors.push('VERSION_MISSING_VERSION_REFERENCE');
  }

  if (!revision.knowledgeId || revision.knowledgeId.trim() === '') {
    errors.push('VERSION_MISSING_KNOWLEDGE_ID');
  }

  if (!CANONICAL_EDITORIAL_ACTIONS.includes(revision.editorialAction)) {
    errors.push('VERSION_UNKNOWN_EDITORIAL_ACTION');
  }

  if (!CANONICAL_VERSION_STATUS.includes(revision.status)) {
    errors.push('VERSION_UNKNOWN_STATUS');
  }

  if (!revision.provenance) {
    errors.push('VERSION_MISSING_PROVENANCE');
  }

  return errors;
}

/**
 * Validates a version relationship for decision composition.
 * Pure function. No side effects.
 */
function _validateRelationshipForDecision(
  relationship: VersionRelationship,
): readonly string[] {
  const errors: string[] = [];

  if (!relationship.relationshipId || relationship.relationshipId.trim() === '') {
    errors.push('VERSION_MISSING_RELATIONSHIP_ID');
  }

  if (!relationship.sourceVersionId || relationship.sourceVersionId.trim() === '') {
    errors.push('VERSION_MISSING_SOURCE_VERSION');
  }

  if (!relationship.targetVersionId || relationship.targetVersionId.trim() === '') {
    errors.push('VERSION_MISSING_TARGET_VERSION');
  }

  if (relationship.sourceVersionId === relationship.targetVersionId) {
    errors.push('VERSION_SELF_REFERENCE');
  }

  if (!CANONICAL_VERSION_STATUS.includes(relationship.status)) {
    errors.push('VERSION_UNKNOWN_STATUS');
  }

  if (!relationship.provenance) {
    errors.push('VERSION_MISSING_PROVENANCE');
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Knowledge Artifact With Version History Composition
// ---------------------------------------------------------------------------

/**
 * Composes a knowledge artifact with version history from provided parameters.
 * Pure function. No side effects.
 */
export function composeKnowledgeArtifactWithVersions(params: {
  readonly knowledgeId: string;
  readonly title: string;
  readonly versions: readonly KnowledgeVersion[];
  readonly revisions: readonly EditorialRevision[];
  readonly relationships: readonly VersionRelationship[];
  readonly provenance: VersionProvenance;
}): KnowledgeArtifactWithVersionHistory {
  return {
    knowledgeId: params.knowledgeId,
    title: params.title,
    versions: [...params.versions],
    revisions: [...params.revisions],
    relationships: [...params.relationships],
    provenance: params.provenance,
  };
}

// ---------------------------------------------------------------------------
// Helper Functions — Type Guards
// ---------------------------------------------------------------------------

/**
 * Checks if a string is a supported version type.
 */
export function isSupportedVersionType(
  versionType: string,
): versionType is VersionType {
  return CANONICAL_VERSION_TYPES.includes(versionType as VersionType);
}

/**
 * Checks if a string is a supported editorial action.
 */
export function isSupportedEditorialAction(
  editorialAction: string,
): editorialAction is EditorialAction {
  return CANONICAL_EDITORIAL_ACTIONS.includes(editorialAction as EditorialAction);
}

/**
 * Checks if a string is a supported editorial lifecycle.
 */
export function isSupportedEditorialLifecycle(
  lifecycle: string,
): lifecycle is EditorialLifecycle {
  return CANONICAL_EDITORIAL_LIFECYCLE.includes(lifecycle as EditorialLifecycle);
}

/**
 * Checks if a string is a supported version status.
 */
export function isSupportedVersionStatus(
  status: string,
): status is VersionStatus {
  return CANONICAL_VERSION_STATUS.includes(status as VersionStatus);
}

/**
 * Checks if a string is a supported governance status.
 */
export function isSupportedVersionGovernanceStatus(
  governanceStatus: string,
): governanceStatus is KnowledgeGovernanceStatus {
  if (governanceStatus === 'accepted') {
    return true;
  }
  return CANONICAL_GOVERNANCE_STATUSES.includes(
    governanceStatus as KnowledgeGovernanceStatus,
  );
}

// ---------------------------------------------------------------------------
// Helper Functions — Canonical Getters
// ---------------------------------------------------------------------------

/**
 * Returns the canonical version types.
 */
export function getCanonicalVersionTypes(): readonly VersionType[] {
  return CANONICAL_VERSION_TYPES;
}

/**
 * Returns the canonical editorial actions.
 */
export function getCanonicalEditorialActions(): readonly EditorialAction[] {
  return CANONICAL_EDITORIAL_ACTIONS;
}

/**
 * Returns the canonical editorial lifecycle states.
 */
export function getCanonicalEditorialLifecycle(): readonly EditorialLifecycle[] {
  return CANONICAL_EDITORIAL_LIFECYCLE;
}

/**
 * Returns the canonical version statuses.
 */
export function getCanonicalVersionStatuses(): readonly VersionStatus[] {
  return CANONICAL_VERSION_STATUS;
}

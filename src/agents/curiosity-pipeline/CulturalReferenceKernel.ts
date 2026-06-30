/**
 * NV-2100-D9-OPT-04 — Cultural Reference Kernel
 *
 * Deterministic orchestration functions for cultural reference metadata.
 * Produces cultural reference profiles, context references, traces, and registries.
 *
 * This module never:
 * - Searches the internet
 * - Retrieves news
 * - Detects trends
 * - Recommends references
 * - Generates analogies
 * - Chooses references automatically
 * - Accesses filesystem
 * - Performs network requests
 * - Calls external APIs
 *
 * Cultural reference metadata only.
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import type {
  CulturalReferenceProfile,
  CurrentContextReference,
  ReferenceRelationship,
  ReferenceGovernance,
  CulturalReferenceRegistry,
  CulturalReferenceRegistryMetadata,
  CulturalReferenceInput,
  CulturalReferenceProvenance,
  CulturalReferenceDecision,
  CulturalReferenceTrace,
  CuriosityArtifactWithCulturalReferences,
  ReferenceDomain,
  ReferenceRecency,
  ReferencePurpose,
  ReferenceValidity,
  ContextSensitivity,
  ReferenceStatus,
  CuriosityReviewStatus,
  CuriosityGovernance,
} from './CuriosityAgentContract.ts';

import {
  CANONICAL_REFERENCE_DOMAINS,
  CANONICAL_REFERENCE_RECENCY,
  CANONICAL_REFERENCE_PURPOSE,
  CANONICAL_REFERENCE_VALIDITY,
  CANONICAL_CONTEXT_SENSITIVITY,
  CANONICAL_REFERENCE_STATUS,
  CANONICAL_CURIOSITY_GOVERNANCE,
} from './CuriosityAgentContract.ts';

// ---------------------------------------------------------------------------
// Cultural Reference Provenance Composition
// ---------------------------------------------------------------------------

/**
 * Composes cultural reference provenance from provided parameters.
 * Pure function. No side effects.
 */
export function composeCulturalReferenceProvenance(params: {
  readonly provider: string;
  readonly source: string;
  readonly rationale: string;
  readonly version: string;
}): CulturalReferenceProvenance {
  return {
    provider: params.provider,
    source: params.source,
    rationale: params.rationale,
    version: params.version,
  };
}

// ---------------------------------------------------------------------------
// Cultural Reference Decision Composition
// ---------------------------------------------------------------------------

/**
 * Composes a cultural reference decision from validation results.
 * Pure function. No side effects.
 */
function _composeCulturalReferenceDecision(
  profileId: string,
  validationPassed: boolean,
  validationErrors: readonly string[],
): CulturalReferenceDecision {
  return {
    decisionId: `_decision_${profileId}`,
    profileId,
    validationPassed,
    validationErrors,
  };
}

// ---------------------------------------------------------------------------
// Cultural Reference Trace Composition
// ---------------------------------------------------------------------------

/**
 * Composes a cultural reference trace from metadata.
 * Pure function. No side effects.
 */
export function composeCulturalReferenceTrace(params: {
  readonly traceId: string;
}): CulturalReferenceTrace {
  return {
    traceId: params.traceId,
    generatedFrom: 'deterministic_cultural_reference_kernel',
    deterministic: true,
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Cultural Reference Profile Composition
// ---------------------------------------------------------------------------

/**
 * Composes a cultural reference profile from provided parameters.
 * Pure function. No side effects.
 */
export function composeCulturalReferenceProfile(params: {
  readonly id: string;
  readonly title: string;
  readonly referenceDomain: ReferenceDomain;
  readonly referenceRecency: ReferenceRecency;
  readonly referencePurpose: ReferencePurpose;
  readonly referenceValidity: ReferenceValidity;
  readonly contextSensitivity: ContextSensitivity;
  readonly conceptIds: readonly string[];
  readonly status: ReferenceStatus;
  readonly governance: CuriosityGovernance;
  readonly provenance: CulturalReferenceProvenance;
  readonly trace: CulturalReferenceTrace;
}): CulturalReferenceProfile {
  return {
    id: params.id,
    title: params.title,
    referenceDomain: params.referenceDomain,
    referenceRecency: params.referenceRecency,
    referencePurpose: params.referencePurpose,
    referenceValidity: params.referenceValidity,
    contextSensitivity: params.contextSensitivity,
    conceptIds: [...params.conceptIds],
    status: params.status,
    governance: params.governance,
    provenance: params.provenance,
    trace: params.trace,
  };
}

// ---------------------------------------------------------------------------
// Current Context Reference Composition
// ---------------------------------------------------------------------------

/**
 * Composes a current context reference from provided parameters.
 * Pure function. No side effects.
 */
export function composeCurrentContextReference(params: {
  readonly referenceId: string;
  readonly referenceDomain: ReferenceDomain;
  readonly referenceRecency: ReferenceRecency;
  readonly contextSensitivity: ContextSensitivity;
  readonly validityPeriod: string;
  readonly lastVerified: string;
  readonly provenance: CulturalReferenceProvenance;
}): CurrentContextReference {
  const normalizedDomain = _normalizeReferenceDomain(params.referenceDomain);
  return {
    referenceId: params.referenceId,
    referenceDomain: normalizedDomain as ReferenceDomain,
    referenceRecency: params.referenceRecency,
    contextSensitivity: params.contextSensitivity,
    validityPeriod: params.validityPeriod,
    lastVerified: params.lastVerified,
    provenance: params.provenance,
  };
}

function _normalizeReferenceDomain(domain: ReferenceDomain): string {
  if (domain === 'technology_history') {
    return 'technology';
  }
  return domain;
}

// ---------------------------------------------------------------------------
// Reference Governance Composition
// ---------------------------------------------------------------------------

/**
 * Composes reference governance from provided parameters.
 * Pure function. No side effects.
 */
export function composeReferenceGovernance(params: {
  readonly educationalJustification: string;
  readonly pedagogicalPurpose: string;
  readonly reviewStatus: CuriosityReviewStatus;
  readonly contextSensitivity: ContextSensitivity;
  readonly reviewRequired: boolean;
}): ReferenceGovernance {
  return {
    educationalJustification: params.educationalJustification,
    pedagogicalPurpose: params.pedagogicalPurpose,
    reviewStatus: params.reviewStatus,
    contextSensitivity: params.contextSensitivity,
    reviewRequired: params.reviewRequired,
  };
}

// ---------------------------------------------------------------------------
// Reference Relationship Composition
// ---------------------------------------------------------------------------

/**
 * Composes a reference relationship from provided parameters.
 * Pure function. No side effects.
 */
export function composeReferenceRelationship(params: {
  readonly relationshipId: string;
  readonly sourceProfileId: string;
  readonly targetProfileId: string;
  readonly relationshipType: string;
  readonly description: string;
  readonly provenance: CulturalReferenceProvenance;
}): ReferenceRelationship {
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
// Deterministic Sort Comparator for Profiles
// ---------------------------------------------------------------------------

/**
 * Deterministic comparator for cultural reference profiles.
 * Sorts by id, then referenceDomain, then title.
 * Pure function. No side effects.
 */
function _compareCulturalReferenceProfile(
  a: CulturalReferenceProfile,
  b: CulturalReferenceProfile,
): number {
  if (a.id < b.id) return -1;
  if (a.id > b.id) return 1;

  if (a.referenceDomain < b.referenceDomain) return -1;
  if (a.referenceDomain > b.referenceDomain) return 1;

  if (a.title < b.title) return -1;
  if (a.title > b.title) return 1;

  return 0;
}

// ---------------------------------------------------------------------------
// Deterministic Sort Comparator for Context References
// ---------------------------------------------------------------------------

/**
 * Deterministic comparator for current context references.
 * Sorts by referenceId.
 * Pure function. No side effects.
 */
function _compareCurrentContextReference(
  a: CurrentContextReference,
  b: CurrentContextReference,
): number {
  if (a.referenceId < b.referenceId) return -1;
  if (a.referenceId > b.referenceId) return 1;

  return 0;
}

// ---------------------------------------------------------------------------
// Deterministic Sort Comparator for Relationships
// ---------------------------------------------------------------------------

/**
 * Deterministic comparator for reference relationships.
 * Sorts by relationshipId.
 * Pure function. No side effects.
 */
function _compareReferenceRelationship(
  a: ReferenceRelationship,
  b: ReferenceRelationship,
): number {
  if (a.relationshipId < b.relationshipId) return -1;
  if (a.relationshipId > b.relationshipId) return 1;

  return 0;
}

// ---------------------------------------------------------------------------
// Cultural Reference Registry Composition
// ---------------------------------------------------------------------------

/**
 * Composes a cultural reference registry from profiles, context references, relationships, and governance.
 * Pure function. No side effects.
 * Deterministic ordering: id → referenceDomain → title.
 */
export function composeCulturalReferenceRegistry(
  profiles: readonly CulturalReferenceProfile[],
  contextReferences: readonly CurrentContextReference[],
  relationships: readonly ReferenceRelationship[],
  governance: ReferenceGovernance,
): CulturalReferenceRegistry {
  const sortedProfiles = [...profiles].sort(_compareCulturalReferenceProfile);
  const sortedContextReferences = [...contextReferences].sort(_compareCurrentContextReference);
  const sortedRelationships = [...relationships].sort(_compareReferenceRelationship);

  const metadata: CulturalReferenceRegistryMetadata = {
    registryId: `_registry_${sortedProfiles.length}_${sortedContextReferences.length}_${sortedRelationships.length}`,
    version: '1.0.0',
    profileCount: sortedProfiles.length,
    contextReferenceCount: sortedContextReferences.length,
    relationshipCount: sortedRelationships.length,
  };

  return {
    registryId: metadata.registryId,
    profiles: sortedProfiles,
    contextReferences: sortedContextReferences,
    relationships: sortedRelationships,
    governance,
    metadata,
    trace: {
      traceId: `_trace_${sortedProfiles.length}_${sortedContextReferences.length}_${sortedRelationships.length}`,
      generatedFrom: 'deterministic_cultural_reference_kernel',
      deterministic: true,
      randomUsed: false,
      timeDependency: false,
    },
    deterministic: true,
    generatedFrom: 'deterministic_cultural_reference_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Cultural Reference Registry From Input Composition
// ---------------------------------------------------------------------------

/**
 * Composes a cultural reference registry from an input.
 * Pure function. No side effects.
 */
export function composeCulturalReferenceRegistryFromInput(
  input: CulturalReferenceInput,
): CulturalReferenceRegistry {
  return composeCulturalReferenceRegistry(input.profiles, input.contextReferences, input.relationships, input.governance);
}

// ---------------------------------------------------------------------------
// Curiosity Cultural References Composition (Main Entry Point)
// ---------------------------------------------------------------------------

/**
 * Composes a complete cultural reference registry from an input.
 * Pure function. No side effects.
 */
export function composeCuriosityCulturalReferences(
  input: CulturalReferenceInput,
): CulturalReferenceRegistry {
  const registry = composeCulturalReferenceRegistry(input.profiles, input.contextReferences, input.relationships, input.governance);

  return {
    ...registry,
    trace: composeCulturalReferenceTrace({
      traceId: `_trace_${input.profiles.length}_${input.contextReferences.length}_${input.relationships.length}`,
    }),
  };
}

// ---------------------------------------------------------------------------
// Curiosity Artifact With Cultural References Composition
// ---------------------------------------------------------------------------

/**
 * Composes a curiosity artifact with cultural references from provided parameters.
 * Pure function. No side effects.
 */
export function composeCuriosityArtifactWithCulturalReferences(params: {
  readonly curiosityId: string;
  readonly title: string;
  readonly profiles: readonly CulturalReferenceProfile[];
  readonly contextReferences: readonly CurrentContextReference[];
  readonly relationships: readonly ReferenceRelationship[];
  readonly governance: ReferenceGovernance;
  readonly provenance: CulturalReferenceProvenance;
}): CuriosityArtifactWithCulturalReferences {
  return {
    curiosityId: params.curiosityId,
    title: params.title,
    profiles: [...params.profiles],
    contextReferences: [...params.contextReferences],
    relationships: [...params.relationships],
    governance: params.governance,
    provenance: params.provenance,
  };
}

// ---------------------------------------------------------------------------
// Helper Functions — Type Guards
// ---------------------------------------------------------------------------

/**
 * Checks if a string is a supported reference domain.
 */
export function isSupportedReferenceDomain(
  domain: string,
): domain is ReferenceDomain {
  return CANONICAL_REFERENCE_DOMAINS.includes(domain as ReferenceDomain);
}

/**
 * Checks if a string is a supported reference recency.
 */
export function isSupportedReferenceRecency(
  recency: string,
): recency is ReferenceRecency {
  return CANONICAL_REFERENCE_RECENCY.includes(recency as ReferenceRecency);
}

/**
 * Checks if a string is a supported reference purpose.
 */
export function isSupportedReferencePurpose(
  purpose: string,
): purpose is ReferencePurpose {
  return CANONICAL_REFERENCE_PURPOSE.includes(purpose as ReferencePurpose);
}

/**
 * Checks if a string is a supported reference validity.
 */
export function isSupportedReferenceValidity(
  validity: string,
): validity is ReferenceValidity {
  return CANONICAL_REFERENCE_VALIDITY.includes(validity as ReferenceValidity);
}

/**
 * Checks if a string is a supported context sensitivity.
 */
export function isSupportedContextSensitivity(
  sensitivity: string,
): sensitivity is ContextSensitivity {
  return CANONICAL_CONTEXT_SENSITIVITY.includes(sensitivity as ContextSensitivity);
}

/**
 * Checks if a string is a supported reference status.
 */
export function isSupportedReferenceStatus(
  status: string,
): status is ReferenceStatus {
  return CANONICAL_REFERENCE_STATUS.includes(status as ReferenceStatus);
}

/**
 * Checks if a string is a supported reference governance.
 */
export function isSupportedReferenceGovernance(
  governance: string,
): governance is CuriosityGovernance {
  return CANONICAL_CURIOSITY_GOVERNANCE.includes(governance as CuriosityGovernance);
}

// ---------------------------------------------------------------------------
// Helper Functions — Canonical Getters
// ---------------------------------------------------------------------------

/**
 * Returns the canonical reference domains.
 */
export function getCanonicalReferenceDomains(): readonly ReferenceDomain[] {
  return [...CANONICAL_REFERENCE_DOMAINS];
}

/**
 * Returns the canonical reference recency values.
 */
export function getCanonicalReferenceRecency(): readonly ReferenceRecency[] {
  return [...CANONICAL_REFERENCE_RECENCY];
}

/**
 * Returns the canonical reference purposes.
 */
export function getCanonicalReferencePurposes(): readonly ReferencePurpose[] {
  return [...CANONICAL_REFERENCE_PURPOSE];
}

/**
 * Returns the canonical reference validity values.
 */
export function getCanonicalReferenceValidity(): readonly ReferenceValidity[] {
  return [...CANONICAL_REFERENCE_VALIDITY];
}

/**
 * Returns the canonical context sensitivity values.
 */
export function getCanonicalContextSensitivity(): readonly ContextSensitivity[] {
  return [...CANONICAL_CONTEXT_SENSITIVITY];
}

/**
 * Returns the canonical reference statuses.
 */
export function getCanonicalReferenceStatuses(): readonly ReferenceStatus[] {
  return [...CANONICAL_REFERENCE_STATUS];
}

/**
 * NV-2100-D9-OPT-03 — Curiosity Humor Kernel
 *
 * Deterministic orchestration functions for curiosity humor metadata.
 * Produces humor profiles, references, traces, and registries.
 *
 * This module never:
 * - Generates humor
 * - Creates jokes
 * - Produces sarcasm
 * - Creates memes
 * - Rewrites narrative
 * - Creates educational text
 * - Invokes LLMs
 * - Accesses filesystem
 * - Performs network requests
 * - Calls external APIs
 *
 * Curiosity humor metadata only.
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import type {
  HumorProfile,
  HumorReference,
  HumorRelationship,
  HumorGovernance,
  HumorRegistry,
  HumorRegistryMetadata,
  HumorInput,
  CuriosityHumorProvenance,
  CuriosityHumorDecision,
  CuriosityHumorTrace,
  CuriosityArtifactWithHumor,
  HumorType,
  ReferenceType,
  HumorObjective,
  HumorIntensity,
  HumorSafetyLevel,
  HumorStatus,
  CuriosityReviewStatus,
  CuriosityGovernance,
} from './CuriosityAgentContract.ts';

import {
  CANONICAL_HUMOR_TYPES,
  CANONICAL_REFERENCE_TYPES,
  CANONICAL_HUMOR_OBJECTIVES,
  CANONICAL_HUMOR_INTENSITY,
  CANONICAL_HUMOR_SAFETY_LEVELS,
  CANONICAL_HUMOR_STATUS,
  CANONICAL_CURIOSITY_GOVERNANCE,
} from './CuriosityAgentContract.ts';

// ---------------------------------------------------------------------------
// Curiosity Humor Provenance Composition
// ---------------------------------------------------------------------------

/**
 * Composes curiosity humor provenance from provided parameters.
 * Pure function. No side effects.
 */
export function composeCuriosityHumorProvenance(params: {
  readonly provider: string;
  readonly source: string;
  readonly rationale: string;
  readonly version: string;
}): CuriosityHumorProvenance {
  return {
    provider: params.provider,
    source: params.source,
    rationale: params.rationale,
    version: params.version,
  };
}

// ---------------------------------------------------------------------------
// Curiosity Humor Decision Composition
// ---------------------------------------------------------------------------

/**
 * Composes a curiosity humor decision from validation results.
 * Pure function. No side effects.
 */
function _composeCuriosityHumorDecision(
  profileId: string,
  validationPassed: boolean,
  validationErrors: readonly string[],
): CuriosityHumorDecision {
  return {
    decisionId: `_decision_${profileId}`,
    profileId,
    validationPassed,
    validationErrors,
  };
}

// ---------------------------------------------------------------------------
// Curiosity Humor Trace Composition
// ---------------------------------------------------------------------------

/**
 * Composes a curiosity humor trace from metadata.
 * Pure function. No side effects.
 */
export function composeCuriosityHumorTrace(params: {
  readonly traceId: string;
}): CuriosityHumorTrace {
  return {
    traceId: params.traceId,
    generatedFrom: 'deterministic_curiosity_humor_kernel',
    deterministic: true,
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Humor Profile Composition
// ---------------------------------------------------------------------------

/**
 * Composes a humor profile from provided parameters.
 * Pure function. No side effects.
 */
export function composeHumorProfile(params: {
  readonly id: string;
  readonly title: string;
  readonly humorType: HumorType;
  readonly referenceType: ReferenceType;
  readonly humorObjective: HumorObjective;
  readonly humorIntensity: HumorIntensity;
  readonly safetyLevel: HumorSafetyLevel;
  readonly conceptIds: readonly string[];
  readonly status: HumorStatus;
  readonly governance: CuriosityGovernance;
  readonly provenance: CuriosityHumorProvenance;
  readonly trace: CuriosityHumorTrace;
}): HumorProfile {
  return {
    id: params.id,
    title: params.title,
    humorType: params.humorType,
    referenceType: params.referenceType,
    humorObjective: params.humorObjective,
    humorIntensity: params.humorIntensity,
    safetyLevel: params.safetyLevel,
    conceptIds: [...params.conceptIds],
    status: params.status,
    governance: params.governance,
    provenance: params.provenance,
    trace: params.trace,
  };
}

// ---------------------------------------------------------------------------
// Humor Reference Composition
// ---------------------------------------------------------------------------

/**
 * Composes a humor reference from provided parameters.
 * Pure function. No side effects.
 */
export function composeHumorReference(params: {
  readonly referenceId: string;
  readonly referenceType: ReferenceType;
  readonly referenceTitle: string;
  readonly referenceReason: string;
  readonly educationalPurpose: string;
}): HumorReference {
  return {
    referenceId: params.referenceId,
    referenceType: params.referenceType,
    referenceTitle: params.referenceTitle,
    referenceReason: params.referenceReason,
    educationalPurpose: params.educationalPurpose,
  };
}

// ---------------------------------------------------------------------------
// Humor Relationship Composition
// ---------------------------------------------------------------------------

/**
 * Composes a humor relationship from provided parameters.
 * Pure function. No side effects.
 */
export function composeHumorRelationship(params: {
  readonly relationshipId: string;
  readonly sourceProfileId: string;
  readonly targetProfileId: string;
  readonly relationshipType: string;
  readonly description: string;
  readonly provenance: CuriosityHumorProvenance;
}): HumorRelationship {
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
// Humor Governance Composition
// ---------------------------------------------------------------------------

/**
 * Composes humor governance from provided parameters.
 * Pure function. No side effects.
 */
export function composeHumorGovernance(params: {
  readonly educationalJustification: string;
  readonly pedagogicalPurpose: string;
  readonly reviewStatus: CuriosityReviewStatus;
  readonly safetyLevel: HumorSafetyLevel;
  readonly reviewRequired: boolean;
}): HumorGovernance {
  return {
    educationalJustification: params.educationalJustification,
    pedagogicalPurpose: params.pedagogicalPurpose,
    reviewStatus: params.reviewStatus,
    safetyLevel: params.safetyLevel,
    reviewRequired: params.reviewRequired,
  };
}

// ---------------------------------------------------------------------------
// Deterministic Sort Comparator for Profiles
// ---------------------------------------------------------------------------

/**
 * Deterministic comparator for humor profiles.
 * Sorts by id, then humorType, then title.
 * Pure function. No side effects.
 */
function _compareHumorProfile(
  a: HumorProfile,
  b: HumorProfile,
): number {
  if (a.id < b.id) return -1;
  if (a.id > b.id) return 1;

  if (a.humorType < b.humorType) return -1;
  if (a.humorType > b.humorType) return 1;

  if (a.title < b.title) return -1;
  if (a.title > b.title) return 1;

  return 0;
}

// ---------------------------------------------------------------------------
// Deterministic Sort Comparator for References
// ---------------------------------------------------------------------------

/**
 * Deterministic comparator for humor references.
 * Sorts by referenceId.
 * Pure function. No side effects.
 */
function _compareHumorReference(
  a: HumorReference,
  b: HumorReference,
): number {
  if (a.referenceId < b.referenceId) return -1;
  if (a.referenceId > b.referenceId) return 1;

  return 0;
}

// ---------------------------------------------------------------------------
// Deterministic Sort Comparator for Relationships
// ---------------------------------------------------------------------------

/**
 * Deterministic comparator for humor relationships.
 * Sorts by relationshipId.
 * Pure function. No side effects.
 */
function _compareHumorRelationship(
  a: HumorRelationship,
  b: HumorRelationship,
): number {
  if (a.relationshipId < b.relationshipId) return -1;
  if (a.relationshipId > b.relationshipId) return 1;

  return 0;
}

// ---------------------------------------------------------------------------
// Humor Registry Composition
// ---------------------------------------------------------------------------

/**
 * Composes a humor registry from profiles, references, relationships, and governance.
 * Pure function. No side effects.
 * Deterministic ordering: id → humorType → title.
 */
export function composeHumorRegistry(
  profiles: readonly HumorProfile[],
  references: readonly HumorReference[],
  relationships: readonly HumorRelationship[],
  governance: HumorGovernance,
): HumorRegistry {
  const sortedProfiles = [...profiles].sort(_compareHumorProfile);
  const sortedReferences = [...references].sort(_compareHumorReference);
  const sortedRelationships = [...relationships].sort(_compareHumorRelationship);

  const metadata: HumorRegistryMetadata = {
    registryId: `_registry_${sortedProfiles.length}_${sortedReferences.length}_${sortedRelationships.length}`,
    version: '1.0.0',
    profileCount: sortedProfiles.length,
    referenceCount: sortedReferences.length,
    relationshipCount: sortedRelationships.length,
  };

  return {
    registryId: metadata.registryId,
    profiles: sortedProfiles,
    references: sortedReferences,
    relationships: sortedRelationships,
    governance,
    metadata,
    trace: {
      traceId: `_trace_${sortedProfiles.length}_${sortedReferences.length}_${sortedRelationships.length}`,
      generatedFrom: 'deterministic_curiosity_humor_kernel',
      deterministic: true,
      randomUsed: false,
      timeDependency: false,
    },
    deterministic: true,
    generatedFrom: 'deterministic_curiosity_humor_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Humor Registry From Input Composition
// ---------------------------------------------------------------------------

/**
 * Composes a humor registry from an input.
 * Pure function. No side effects.
 */
export function composeHumorRegistryFromInput(
  input: HumorInput,
): HumorRegistry {
  return composeHumorRegistry(input.profiles, input.references, input.relationships, input.governance);
}

// ---------------------------------------------------------------------------
// Curiosity Humor Composition (Main Entry Point)
// ---------------------------------------------------------------------------

/**
 * Composes a complete humor registry from an input.
 * Pure function. No side effects.
 */
export function composeCuriosityHumor(
  input: HumorInput,
): HumorRegistry {
  const registry = composeHumorRegistry(input.profiles, input.references, input.relationships, input.governance);

  return {
    ...registry,
    trace: composeCuriosityHumorTrace({
      traceId: `_trace_${input.profiles.length}_${input.references.length}_${input.relationships.length}`,
    }),
  };
}

// ---------------------------------------------------------------------------
// Curiosity Artifact With Humor Composition
// ---------------------------------------------------------------------------

/**
 * Composes a curiosity artifact with humor from provided parameters.
 * Pure function. No side effects.
 */
export function composeCuriosityArtifactWithHumor(params: {
  readonly curiosityId: string;
  readonly title: string;
  readonly profile: HumorProfile;
  readonly references: readonly HumorReference[];
  readonly relationships: readonly HumorRelationship[];
  readonly governance: HumorGovernance;
  readonly provenance: CuriosityHumorProvenance;
}): CuriosityArtifactWithHumor {
  return {
    curiosityId: params.curiosityId,
    title: params.title,
    profile: params.profile,
    references: [...params.references],
    relationships: [...params.relationships],
    governance: params.governance,
    provenance: params.provenance,
  };
}

// ---------------------------------------------------------------------------
// Helper Functions — Type Guards
// ---------------------------------------------------------------------------

/**
 * Checks if a string is a supported humor type.
 */
export function isSupportedHumorType(
  humorType: string,
): humorType is HumorType {
  return CANONICAL_HUMOR_TYPES.includes(humorType as HumorType);
}

/**
 * Checks if a string is a supported reference type.
 */
export function isSupportedReferenceType(
  referenceType: string,
): referenceType is ReferenceType {
  return CANONICAL_REFERENCE_TYPES.includes(referenceType as ReferenceType);
}

/**
 * Checks if a string is a supported humor objective.
 */
export function isSupportedHumorObjective(
  objective: string,
): objective is HumorObjective {
  return CANONICAL_HUMOR_OBJECTIVES.includes(objective as HumorObjective);
}

/**
 * Checks if a string is a supported humor intensity.
 */
export function isSupportedHumorIntensity(
  intensity: string,
): intensity is HumorIntensity {
  return CANONICAL_HUMOR_INTENSITY.includes(intensity as HumorIntensity);
}

/**
 * Checks if a string is a supported humor safety level.
 */
export function isSupportedHumorSafetyLevel(
  safetyLevel: string,
): safetyLevel is HumorSafetyLevel {
  return CANONICAL_HUMOR_SAFETY_LEVELS.includes(safetyLevel as HumorSafetyLevel);
}

/**
 * Checks if a string is a supported humor status.
 */
export function isSupportedHumorStatus(
  status: string,
): status is HumorStatus {
  return CANONICAL_HUMOR_STATUS.includes(status as HumorStatus);
}

/**
 * Checks if a string is a supported humor governance.
 */
export function isSupportedHumorGovernance(
  governance: string,
): governance is CuriosityGovernance {
  return CANONICAL_CURIOSITY_GOVERNANCE.includes(governance as CuriosityGovernance);
}

// ---------------------------------------------------------------------------
// Helper Functions — Canonical Getters
// ---------------------------------------------------------------------------

/**
 * Returns the canonical humor types.
 */
export function getCanonicalHumorTypes(): readonly HumorType[] {
  return [...CANONICAL_HUMOR_TYPES];
}

/**
 * Returns the canonical reference types.
 */
export function getCanonicalReferenceTypes(): readonly ReferenceType[] {
  return [...CANONICAL_REFERENCE_TYPES];
}

/**
 * Returns the canonical humor objectives.
 */
export function getCanonicalHumorObjectives(): readonly HumorObjective[] {
  return [...CANONICAL_HUMOR_OBJECTIVES];
}

/**
 * Returns the canonical humor intensity values.
 */
export function getCanonicalHumorIntensity(): readonly HumorIntensity[] {
  return [...CANONICAL_HUMOR_INTENSITY];
}

/**
 * Returns the canonical humor safety levels.
 */
export function getCanonicalHumorSafetyLevels(): readonly HumorSafetyLevel[] {
  return [...CANONICAL_HUMOR_SAFETY_LEVELS];
}

/**
 * Returns the canonical humor statuses.
 */
export function getCanonicalHumorStatuses(): readonly HumorStatus[] {
  return [...CANONICAL_HUMOR_STATUS];
}

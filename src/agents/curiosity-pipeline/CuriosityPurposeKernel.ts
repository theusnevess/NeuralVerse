/**
 * NV-2100-D9-OPT-02 — Curiosity Purpose Kernel
 *
 * Deterministic orchestration functions for curiosity educational purpose metadata.
 * Produces curiosity purpose profiles, traces, and registries.
 *
 * This module never:
 * - Generates curiosity content
 * - Creates educational content
 * - Produces humor
 * - Rewrites narrative
 * - Personalizes content
 * - Invokes LLMs
 * - Accesses filesystem
 * - Performs network requests
 * - Calls external APIs
 *
 * Curiosity purpose metadata only.
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import type {
  CuriosityPurposeProfile,
  CuriosityPurposeProvenance,
  CuriosityPurposeDecision,
  CuriosityPurposeTrace,
  CuriosityPurposeRegistry,
  CuriosityPurposeRegistryMetadata,
  CuriosityPurposeInput,
  CuriosityPurposeRelationship,
  CuriosityArtifactWithPurpose,
  CuriosityOutputType,
  EducationalPurpose,
  EmotionalTone,
  DeliveryContext,
  AudienceLevel,
  CuriosityPurposeStatus,
  CuriosityGovernance,
} from './CuriosityAgentContract.ts';

import {
  CANONICAL_CURIOSITY_OUTPUT_TYPES,
  CANONICAL_EDUCATIONAL_PURPOSES,
  CANONICAL_EMOTIONAL_TONES,
  CANONICAL_DELIVERY_CONTEXTS,
  CANONICAL_AUDIENCE_LEVELS,
  CANONICAL_CURIOSITY_PURPOSE_STATUS,
  CANONICAL_CURIOSITY_GOVERNANCE,
} from './CuriosityAgentContract.ts';

// ---------------------------------------------------------------------------
// Curiosity Purpose Provenance Composition
// ---------------------------------------------------------------------------

/**
 * Composes curiosity purpose provenance from provided parameters.
 * Pure function. No side effects.
 */
export function composeCuriosityPurposeProvenance(params: {
  readonly provider: string;
  readonly source: string;
  readonly rationale: string;
  readonly version: string;
}): CuriosityPurposeProvenance {
  return {
    provider: params.provider,
    source: params.source,
    rationale: params.rationale,
    version: params.version,
  };
}

// ---------------------------------------------------------------------------
// Curiosity Purpose Decision Composition
// ---------------------------------------------------------------------------

/**
 * Composes a curiosity purpose decision from validation results.
 * Pure function. No side effects.
 */
function _composeCuriosityPurposeDecision(
  profileId: string,
  validationPassed: boolean,
  validationErrors: readonly string[],
): CuriosityPurposeDecision {
  return {
    decisionId: `_decision_${profileId}`,
    profileId,
    validationPassed,
    validationErrors,
  };
}

// ---------------------------------------------------------------------------
// Curiosity Purpose Trace Composition
// ---------------------------------------------------------------------------

/**
 * Composes a curiosity purpose trace from metadata.
 * Pure function. No side effects.
 */
export function composeCuriosityPurposeTrace(params: {
  readonly traceId: string;
}): CuriosityPurposeTrace {
  return {
    traceId: params.traceId,
    generatedFrom: 'deterministic_curiosity_purpose_kernel',
    deterministic: true,
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Curiosity Purpose Profile Composition
// ---------------------------------------------------------------------------

/**
 * Composes a curiosity purpose profile from provided parameters.
 * Pure function. No side effects.
 */
export function composeCuriosityPurposeProfile(params: {
  readonly id: string;
  readonly title: string;
  readonly outputType: CuriosityOutputType;
  readonly educationalPurpose: EducationalPurpose;
  readonly emotionalTone: EmotionalTone;
  readonly deliveryContext: DeliveryContext;
  readonly audienceLevel: AudienceLevel;
  readonly conceptIds: readonly string[];
  readonly status: CuriosityPurposeStatus;
  readonly governance: CuriosityGovernance;
  readonly provenance: CuriosityPurposeProvenance;
  readonly trace: CuriosityPurposeTrace;
}): CuriosityPurposeProfile {
  return {
    id: params.id,
    title: params.title,
    outputType: params.outputType,
    educationalPurpose: params.educationalPurpose,
    emotionalTone: params.emotionalTone,
    deliveryContext: params.deliveryContext,
    audienceLevel: params.audienceLevel,
    conceptIds: [...params.conceptIds],
    status: params.status,
    governance: params.governance,
    provenance: params.provenance,
    trace: params.trace,
  };
}

// ---------------------------------------------------------------------------
// Curiosity Purpose Relationship Composition
// ---------------------------------------------------------------------------

/**
 * Composes a curiosity purpose relationship from provided parameters.
 * Pure function. No side effects.
 */
export function composeCuriosityPurposeRelationship(params: {
  readonly relationshipId: string;
  readonly sourceProfileId: string;
  readonly targetProfileId: string;
  readonly relationshipType: string;
  readonly description: string;
  readonly provenance: CuriosityPurposeProvenance;
}): CuriosityPurposeRelationship {
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
// Deterministic Sort Comparator
// ---------------------------------------------------------------------------

/**
 * Deterministic comparator for curiosity purpose profiles.
 * Sorts by id, then outputType, then title.
 * Pure function. No side effects.
 */
function _compareCuriosityPurposeProfile(
  a: CuriosityPurposeProfile,
  b: CuriosityPurposeProfile,
): number {
  if (a.id < b.id) return -1;
  if (a.id > b.id) return 1;

  if (a.outputType < b.outputType) return -1;
  if (a.outputType > b.outputType) return 1;

  if (a.title < b.title) return -1;
  if (a.title > b.title) return 1;

  return 0;
}

// ---------------------------------------------------------------------------
// Deterministic Sort Comparator for Relationships
// ---------------------------------------------------------------------------

/**
 * Deterministic comparator for curiosity purpose relationships.
 * Sorts by relationshipId.
 * Pure function. No side effects.
 */
function _compareCuriosityPurposeRelationship(
  a: CuriosityPurposeRelationship,
  b: CuriosityPurposeRelationship,
): number {
  if (a.relationshipId < b.relationshipId) return -1;
  if (a.relationshipId > b.relationshipId) return 1;

  return 0;
}

// ---------------------------------------------------------------------------
// Curiosity Purpose Registry Composition
// ---------------------------------------------------------------------------

/**
 * Composes a curiosity purpose registry from profiles and relationships.
 * Pure function. No side effects.
 * Deterministic ordering: id → outputType → title.
 */
export function composeCuriosityPurposeRegistry(
  profiles: readonly CuriosityPurposeProfile[],
  relationships: readonly CuriosityPurposeRelationship[],
): CuriosityPurposeRegistry {
  const sortedProfiles = [...profiles].sort(_compareCuriosityPurposeProfile);
  const sortedRelationships = [...relationships].sort(_compareCuriosityPurposeRelationship);

  const metadata: CuriosityPurposeRegistryMetadata = {
    registryId: `_registry_${sortedProfiles.length}_${sortedRelationships.length}`,
    version: '1.0.0',
    profileCount: sortedProfiles.length,
    relationshipCount: sortedRelationships.length,
  };

  return {
    registryId: metadata.registryId,
    profiles: sortedProfiles,
    relationships: sortedRelationships,
    metadata,
    trace: {
      traceId: `_trace_${sortedProfiles.length}_${sortedRelationships.length}`,
      generatedFrom: 'deterministic_curiosity_purpose_kernel',
      deterministic: true,
      randomUsed: false,
      timeDependency: false,
    },
    deterministic: true,
    generatedFrom: 'deterministic_curiosity_purpose_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Curiosity Purpose Registry From Input Composition
// ---------------------------------------------------------------------------

/**
 * Composes a curiosity purpose registry from an input.
 * Pure function. No side effects.
 */
export function composeCuriosityPurposeRegistryFromInput(
  input: CuriosityPurposeInput,
): CuriosityPurposeRegistry {
  return composeCuriosityPurposeRegistry(input.profiles, input.relationships);
}

// ---------------------------------------------------------------------------
// Curiosity Purposes Composition (Main Entry Point)
// ---------------------------------------------------------------------------

/**
 * Composes a complete curiosity purpose registry from an input.
 * Pure function. No side effects.
 */
export function composeCuriosityPurposes(
  input: CuriosityPurposeInput,
): CuriosityPurposeRegistry {
  const registry = composeCuriosityPurposeRegistry(input.profiles, input.relationships);

  return {
    ...registry,
    trace: composeCuriosityPurposeTrace({
      traceId: `_trace_${input.profiles.length}_${input.relationships.length}`,
    }),
  };
}

// ---------------------------------------------------------------------------
// Curiosity Artifact With Purpose Composition
// ---------------------------------------------------------------------------

/**
 * Composes a curiosity artifact with purpose from provided parameters.
 * Pure function. No side effects.
 */
export function composeCuriosityArtifactWithPurpose(params: {
  readonly curiosityId: string;
  readonly title: string;
  readonly profile: CuriosityPurposeProfile;
  readonly relationships: readonly CuriosityPurposeRelationship[];
  readonly provenance: CuriosityPurposeProvenance;
}): CuriosityArtifactWithPurpose {
  return {
    curiosityId: params.curiosityId,
    title: params.title,
    profile: params.profile,
    relationships: [...params.relationships],
    provenance: params.provenance,
  };
}

// ---------------------------------------------------------------------------
// Helper Functions — Type Guards
// ---------------------------------------------------------------------------

/**
 * Checks if a string is a supported curiosity output type.
 */
export function isSupportedCuriosityOutputType(
  outputType: string,
): outputType is CuriosityOutputType {
  return CANONICAL_CURIOSITY_OUTPUT_TYPES.includes(outputType as CuriosityOutputType);
}

/**
 * Checks if a string is a supported educational purpose.
 */
export function isSupportedEducationalPurpose(
  purpose: string,
): purpose is EducationalPurpose {
  return CANONICAL_EDUCATIONAL_PURPOSES.includes(purpose as EducationalPurpose);
}

/**
 * Checks if a string is a supported emotional tone.
 */
export function isSupportedEmotionalTone(
  tone: string,
): tone is EmotionalTone {
  return CANONICAL_EMOTIONAL_TONES.includes(tone as EmotionalTone);
}

/**
 * Checks if a string is a supported delivery context.
 */
export function isSupportedDeliveryContext(
  context: string,
): context is DeliveryContext {
  return CANONICAL_DELIVERY_CONTEXTS.includes(context as DeliveryContext);
}

/**
 * Checks if a string is a supported audience level.
 */
export function isSupportedAudienceLevel(
  level: string,
): level is AudienceLevel {
  return CANONICAL_AUDIENCE_LEVELS.includes(level as AudienceLevel);
}

/**
 * Checks if a string is a supported curiosity purpose status.
 */
export function isSupportedCuriosityPurposeStatus(
  status: string,
): status is CuriosityPurposeStatus {
  return CANONICAL_CURIOSITY_PURPOSE_STATUS.includes(status as CuriosityPurposeStatus);
}

/**
 * Checks if a string is a supported curiosity governance.
 */
export function isSupportedCuriosityPurposeGovernance(
  governance: string,
): governance is CuriosityGovernance {
  return CANONICAL_CURIOSITY_GOVERNANCE.includes(governance as CuriosityGovernance);
}

// ---------------------------------------------------------------------------
// Helper Functions — Canonical Getters
// ---------------------------------------------------------------------------

/**
 * Returns the canonical curiosity output types.
 */
export function getCanonicalCuriosityOutputTypes(): readonly CuriosityOutputType[] {
  return [...CANONICAL_CURIOSITY_OUTPUT_TYPES];
}

/**
 * Returns the canonical educational purposes.
 */
export function getCanonicalEducationalPurposes(): readonly EducationalPurpose[] {
  return [...CANONICAL_EDUCATIONAL_PURPOSES];
}

/**
 * Returns the canonical emotional tones.
 */
export function getCanonicalEmotionalTones(): readonly EmotionalTone[] {
  return [...CANONICAL_EMOTIONAL_TONES];
}

/**
 * Returns the canonical delivery contexts.
 */
export function getCanonicalDeliveryContexts(): readonly DeliveryContext[] {
  return [...CANONICAL_DELIVERY_CONTEXTS];
}

/**
 * Returns the canonical audience levels.
 */
export function getCanonicalAudienceLevels(): readonly AudienceLevel[] {
  return [...CANONICAL_AUDIENCE_LEVELS];
}

/**
 * Returns the canonical curiosity purpose statuses.
 */
export function getCanonicalCuriosityPurposeStatuses(): readonly CuriosityPurposeStatus[] {
  return [...CANONICAL_CURIOSITY_PURPOSE_STATUS];
}

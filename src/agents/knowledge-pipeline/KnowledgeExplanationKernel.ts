/**
 * D10-OPT-02 — Multi-Level Explanation Kernel
 *
 * Deterministic orchestration functions for explanation metadata.
 * Produces explanation profiles, relationships, traces, and registries.
 *
 * This module never:
 * - Generates explanations
 * - Invokes LLMs
 * - Performs automatic summarization
 * - Rewrites text
 * - Personalizes content
 * - Generates narratives
 * - Accesses filesystem
 * - Performs network requests
 *
 * Explanation metadata only.
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import type {
  KnowledgeExplanationProfile,
  KnowledgeExplanationProvenance,
  KnowledgeExplanationDecision,
  KnowledgeExplanationTrace,
  KnowledgeExplanationRegistry,
  KnowledgeExplanationRegistryMetadata,
  KnowledgeExplanationInput,
  KnowledgeExplanationRelationship,
  KnowledgeArtifactWithExplanations,
  ExplanationLevel,
  ExplanationFormat,
  ExplanationPurpose,
  AudienceLevel,
  ExplanationStatus,
  ExplanationGovernance,
} from './KnowledgeAgentContract.ts';

import {
  CANONICAL_EXPLANATION_LEVELS,
  CANONICAL_EXPLANATION_FORMATS,
  CANONICAL_EXPLANATION_PURPOSES,
  CANONICAL_AUDIENCE_LEVELS,
  CANONICAL_EXPLANATION_STATUS,
  CANONICAL_EXPLANATION_GOVERNANCE,
} from './KnowledgeAgentContract.ts';

// ---------------------------------------------------------------------------
// Explanation Provenance Composition
// ---------------------------------------------------------------------------

export function composeKnowledgeExplanationProvenance(params: {
  readonly source: string;
  readonly provider: string;
  readonly rationale: string;
  readonly governance: ExplanationGovernance;
}): KnowledgeExplanationProvenance {
  return {
    source: params.source,
    provider: params.provider,
    rationale: params.rationale,
    governance: params.governance,
  };
}

// ---------------------------------------------------------------------------
// Explanation Decision Composition
// ---------------------------------------------------------------------------

function _composeExplanationDecision(
  profileId: string,
  conceptId: string,
  validationPassed: boolean,
  validationErrors: readonly string[],
): KnowledgeExplanationDecision {
  return {
    decisionId: `_decision_${profileId}`,
    profileId,
    conceptId,
    validationPassed,
    validationErrors,
  };
}

// ---------------------------------------------------------------------------
// Explanation Trace Composition
// ---------------------------------------------------------------------------

export function composeKnowledgeExplanationTrace(params: {
  readonly traceId: string;
  readonly decisions: readonly KnowledgeExplanationDecision[];
  readonly registryVersion: string;
  readonly compositionVersion: string;
}): KnowledgeExplanationTrace {
  return {
    traceId: params.traceId,
    decisionCount: params.decisions.length,
    validationCount: params.decisions.filter((d) => d.validationPassed).length,
    registryVersion: params.registryVersion,
    compositionVersion: params.compositionVersion,
    decisions: params.decisions,
    deterministic: true,
    generatedFrom: 'deterministic_explanation_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Explanation Profile Composition
// ---------------------------------------------------------------------------

export function composeKnowledgeExplanationProfile(params: {
  readonly profileId: string;
  readonly conceptId: string;
  readonly level: ExplanationLevel;
  readonly format: ExplanationFormat;
  readonly purpose: ExplanationPurpose;
  readonly audienceLevel: AudienceLevel;
  readonly status: ExplanationStatus;
  readonly governance: ExplanationGovernance;
  readonly title: string;
  readonly summary: string;
  readonly tags: readonly string[];
  readonly prerequisiteProfileIds: readonly string[];
  readonly provenance: KnowledgeExplanationProvenance;
}): KnowledgeExplanationProfile {
  return {
    profileId: params.profileId,
    conceptId: params.conceptId,
    level: params.level,
    format: params.format,
    purpose: params.purpose,
    audienceLevel: params.audienceLevel,
    status: params.status,
    governance: params.governance,
    title: params.title,
    summary: params.summary,
    tags: [...params.tags],
    prerequisiteProfileIds: [...params.prerequisiteProfileIds],
    provenance: params.provenance,
  };
}

// ---------------------------------------------------------------------------
// Explanation Relationship Composition
// ---------------------------------------------------------------------------

export function composeKnowledgeExplanationRelationship(params: {
  readonly relationshipId: string;
  readonly sourceProfileId: string;
  readonly targetProfileId: string;
  readonly conceptId: string;
  readonly relationshipType: 'prerequisite' | 'extension' | 'alternative' | 'complement';
  readonly description: string;
  readonly provenance: KnowledgeExplanationProvenance;
}): KnowledgeExplanationRelationship {
  return {
    relationshipId: params.relationshipId,
    sourceProfileId: params.sourceProfileId,
    targetProfileId: params.targetProfileId,
    conceptId: params.conceptId,
    relationshipType: params.relationshipType,
    description: params.description,
    provenance: params.provenance,
  };
}

// ---------------------------------------------------------------------------
// Deterministic Sort Comparator
// ---------------------------------------------------------------------------

function _compareExplanationProfile(
  a: KnowledgeExplanationProfile,
  b: KnowledgeExplanationProfile,
): number {
  if (a.conceptId < b.conceptId) return -1;
  if (a.conceptId > b.conceptId) return 1;

  const levelOrder = CANONICAL_EXPLANATION_LEVELS.indexOf(a.level) - CANONICAL_EXPLANATION_LEVELS.indexOf(b.level);
  if (levelOrder !== 0) return levelOrder;

  if (a.profileId < b.profileId) return -1;
  if (a.profileId > b.profileId) return 1;

  return 0;
}

function _compareExplanationRelationship(
  a: KnowledgeExplanationRelationship,
  b: KnowledgeExplanationRelationship,
): number {
  if (a.relationshipId < b.relationshipId) return -1;
  if (a.relationshipId > b.relationshipId) return 1;

  return 0;
}

// ---------------------------------------------------------------------------
// Explanation Registry Composition
// ---------------------------------------------------------------------------

export function composeKnowledgeExplanationRegistry(
  profiles: readonly KnowledgeExplanationProfile[],
  relationships: readonly KnowledgeExplanationRelationship[],
): KnowledgeExplanationRegistry {
  const sortedProfiles = [...profiles].sort(_compareExplanationProfile);
  const sortedRelationships = [...relationships].sort(_compareExplanationRelationship);

  const concepts = new Set(sortedProfiles.map((p) => p.conceptId));
  const levels = new Set(sortedProfiles.map((p) => p.level));

  const metadata: KnowledgeExplanationRegistryMetadata = {
    registryId: `_registry_${sortedProfiles.length}`,
    profileCount: sortedProfiles.length,
    relationshipCount: sortedRelationships.length,
    levelCount: levels.size,
    conceptCount: concepts.size,
  };

  return {
    registryId: metadata.registryId,
    profiles: sortedProfiles,
    relationships: sortedRelationships,
    metadata,
    trace: {
      traceId: `_trace_${sortedProfiles.length}`,
      decisionCount: 0,
      validationCount: 0,
      registryVersion: '1.0.0',
      compositionVersion: '1.0.0',
      decisions: [],
      deterministic: true,
      generatedFrom: 'deterministic_explanation_kernel',
      randomUsed: false,
      timeDependency: false,
    },
    deterministic: true,
    generatedFrom: 'deterministic_explanation_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Explanation Registry From Input Composition
// ---------------------------------------------------------------------------

export function composeKnowledgeExplanationRegistryFromInput(
  input: KnowledgeExplanationInput,
): KnowledgeExplanationRegistry {
  return composeKnowledgeExplanationRegistry(input.profiles, input.relationships);
}

// ---------------------------------------------------------------------------
// Explanation Composition (Main Entry Point)
// ---------------------------------------------------------------------------

export function composeKnowledgeExplanations(
  input: KnowledgeExplanationInput,
): KnowledgeExplanationRegistry {
  const decisions = input.profiles.map((profile) => {
    const errors = _validateExplanationForDecision(profile);
    return _composeExplanationDecision(profile.profileId, profile.conceptId, errors.length === 0, errors);
  });

  const registry = composeKnowledgeExplanationRegistry(input.profiles, input.relationships);

  return {
    ...registry,
    trace: composeKnowledgeExplanationTrace({
      traceId: `_trace_${input.profiles.length}`,
      decisions,
      registryVersion: '1.0.0',
      compositionVersion: '1.0.0',
    }),
  };
}

function _validateExplanationForDecision(
  profile: KnowledgeExplanationProfile,
): readonly string[] {
  const errors: string[] = [];

  if (!profile.profileId || profile.profileId.trim() === '') {
    errors.push('EXPLANATION_MISSING_PROFILE_ID');
  }

  if (!profile.title || profile.title.trim() === '') {
    errors.push('EXPLANATION_MISSING_TITLE');
  }

  if (!profile.conceptId || profile.conceptId.trim() === '') {
    errors.push('EXPLANATION_MISSING_CONCEPT_REFERENCE');
  }

  if (!CANONICAL_EXPLANATION_LEVELS.includes(profile.level)) {
    errors.push('EXPLANATION_INVALID_LEVEL');
  }

  if (!CANONICAL_EXPLANATION_FORMATS.includes(profile.format)) {
    errors.push('EXPLANATION_INVALID_FORMAT');
  }

  if (!CANONICAL_EXPLANATION_PURPOSES.includes(profile.purpose)) {
    errors.push('EXPLANATION_INVALID_PURPOSE');
  }

  if (!CANONICAL_AUDIENCE_LEVELS.includes(profile.audienceLevel)) {
    errors.push('EXPLANATION_INVALID_AUDIENCE');
  }

  if (!CANONICAL_EXPLANATION_STATUS.includes(profile.status)) {
    errors.push('EXPLANATION_INVALID_STATUS');
  }

  if (!CANONICAL_EXPLANATION_GOVERNANCE.includes(profile.governance)) {
    errors.push('EXPLANATION_INVALID_GOVERNANCE');
  }

  if (!profile.provenance) {
    errors.push('EXPLANATION_MISSING_PROVENANCE');
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Artifact With Explanations Composition
// ---------------------------------------------------------------------------

export function composeKnowledgeArtifactWithExplanations(params: {
  readonly conceptId: string;
  readonly conceptTitle: string;
  readonly profiles: readonly KnowledgeExplanationProfile[];
  readonly relationships: readonly KnowledgeExplanationRelationship[];
  readonly provenance: KnowledgeExplanationProvenance;
}): KnowledgeArtifactWithExplanations {
  return {
    conceptId: params.conceptId,
    conceptTitle: params.conceptTitle,
    profiles: [...params.profiles],
    relationships: [...params.relationships],
    provenance: params.provenance,
  };
}

// ---------------------------------------------------------------------------
// Helper Functions — Type Guards
// ---------------------------------------------------------------------------

export function isSupportedExplanationLevel(
  value: string,
): value is ExplanationLevel {
  return CANONICAL_EXPLANATION_LEVELS.includes(value as ExplanationLevel);
}

export function isSupportedExplanationFormat(
  value: string,
): value is ExplanationFormat {
  return CANONICAL_EXPLANATION_FORMATS.includes(value as ExplanationFormat);
}

export function isSupportedExplanationPurpose(
  value: string,
): value is ExplanationPurpose {
  return CANONICAL_EXPLANATION_PURPOSES.includes(value as ExplanationPurpose);
}

export function isSupportedAudienceLevel(
  value: string,
): value is AudienceLevel {
  return CANONICAL_AUDIENCE_LEVELS.includes(value as AudienceLevel);
}

export function isSupportedExplanationStatus(
  value: string,
): value is ExplanationStatus {
  return CANONICAL_EXPLANATION_STATUS.includes(value as ExplanationStatus);
}

export function isSupportedExplanationGovernance(
  value: string,
): value is ExplanationGovernance {
  return CANONICAL_EXPLANATION_GOVERNANCE.includes(value as ExplanationGovernance);
}

// ---------------------------------------------------------------------------
// Helper Functions — Canonical Getters
// ---------------------------------------------------------------------------

export function getCanonicalExplanationLevels(): readonly ExplanationLevel[] {
  return CANONICAL_EXPLANATION_LEVELS;
}

export function getCanonicalExplanationFormats(): readonly ExplanationFormat[] {
  return CANONICAL_EXPLANATION_FORMATS;
}

export function getCanonicalExplanationPurposes(): readonly ExplanationPurpose[] {
  return CANONICAL_EXPLANATION_PURPOSES;
}

export function getCanonicalAudienceLevels(): readonly AudienceLevel[] {
  return CANONICAL_AUDIENCE_LEVELS;
}

export function getCanonicalExplanationStatuses(): readonly ExplanationStatus[] {
  return CANONICAL_EXPLANATION_STATUS;
}

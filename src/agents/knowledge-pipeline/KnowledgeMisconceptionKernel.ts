/**
 * D10-OPT-13 — Misconception Registry Kernel
 *
 * Deterministic orchestration functions for misconception metadata.
 * Produces misconception profiles, relationships, traces, and registries.
 *
 * This module never:
 * - Detects misconceptions
 * - Diagnoses learners
 * - Evaluates answers
 * - Grades
 * - Performs adaptive remediation
 * - Generates feedback
 * - Profiles students
 * - Infers misconceptions automatically
 * - Traces knowledge
 * - Performs educational reasoning
 * - Invokes LLMs
 * - Accesses filesystem
 * - Performs network requests
 *
 * Misconception metadata only.
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import type {
  KnowledgeMisconceptionProfile,
  KnowledgeMisconceptionProvenance,
  KnowledgeMisconceptionDecision,
  KnowledgeMisconceptionTrace,
  KnowledgeMisconceptionRegistry,
  KnowledgeMisconceptionRegistryMetadata,
  KnowledgeMisconceptionInput,
  KnowledgeMisconceptionRelationship,
  KnowledgeArtifactWithMisconceptions,
  MisconceptionType,
  MisconceptionSeverity,
  CorrectiveStrategy,
  MisconceptionVisibility,
  MisconceptionStatus,
  MisconceptionGovernance,
} from './KnowledgeAgentContract.ts';

import {
  CANONICAL_MISCONCEPTION_TYPES,
  CANONICAL_MISCONCEPTION_SEVERITY,
  CANONICAL_CORRECTIVE_STRATEGIES,
  CANONICAL_MISCONCEPTION_STATUS,
  CANONICAL_MISCONCEPTION_VISIBILITY,
  CANONICAL_MISCONCEPTION_GOVERNANCE,
} from './KnowledgeAgentContract.ts';

// ---------------------------------------------------------------------------
// Misconception Provenance Composition
// ---------------------------------------------------------------------------

export function composeKnowledgeMisconceptionProvenance(params: {
  readonly source: string;
  readonly provider: string;
  readonly rationale: string;
  readonly governance: MisconceptionGovernance;
}): KnowledgeMisconceptionProvenance {
  return {
    source: params.source,
    provider: params.provider,
    rationale: params.rationale,
    governance: params.governance,
  };
}

// ---------------------------------------------------------------------------
// Misconception Decision Composition
// ---------------------------------------------------------------------------

function _composeMisconceptionDecision(
  misconceptionId: string,
  conceptId: string,
  validationPassed: boolean,
  validationErrors: readonly string[],
): KnowledgeMisconceptionDecision {
  return {
    decisionId: `_decision_${misconceptionId}`,
    misconceptionId,
    conceptId,
    validationPassed,
    validationErrors,
  };
}

// ---------------------------------------------------------------------------
// Misconception Trace Composition
// ---------------------------------------------------------------------------

export function composeKnowledgeMisconceptionTrace(params: {
  readonly traceId: string;
  readonly decisions: readonly KnowledgeMisconceptionDecision[];
  readonly registryVersion: string;
  readonly compositionVersion: string;
}): KnowledgeMisconceptionTrace {
  return {
    traceId: params.traceId,
    decisionCount: params.decisions.length,
    validationCount: params.decisions.filter((d) => d.validationPassed).length,
    registryVersion: params.registryVersion,
    compositionVersion: params.compositionVersion,
    decisions: params.decisions,
    deterministic: true,
    generatedFrom: 'deterministic_misconception_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Misconception Profile Composition
// ---------------------------------------------------------------------------

export function composeKnowledgeMisconceptionProfile(params: {
  readonly misconceptionId: string;
  readonly conceptId: string;
  readonly title: string;
  readonly misconceptionType: MisconceptionType;
  readonly severity: MisconceptionSeverity;
  readonly correctiveStrategy: CorrectiveStrategy;
  readonly visibility: MisconceptionVisibility;
  readonly status: MisconceptionStatus;
  readonly governance: MisconceptionGovernance;
  readonly description: string;
  readonly commonCause: string;
  readonly references: readonly string[];
  readonly tags: readonly string[];
  readonly provenance: KnowledgeMisconceptionProvenance;
}): KnowledgeMisconceptionProfile {
  return {
    misconceptionId: params.misconceptionId,
    conceptId: params.conceptId,
    title: params.title,
    misconceptionType: params.misconceptionType,
    severity: params.severity,
    correctiveStrategy: params.correctiveStrategy,
    visibility: params.visibility,
    status: params.status,
    governance: params.governance,
    description: params.description,
    commonCause: params.commonCause,
    references: [...params.references],
    tags: [...params.tags],
    provenance: params.provenance,
  };
}

// ---------------------------------------------------------------------------
// Misconception Relationship Composition
// ---------------------------------------------------------------------------

export function composeKnowledgeMisconceptionRelationship(params: {
  readonly relationshipId: string;
  readonly sourceMisconceptionId: string;
  readonly targetMisconceptionId: string;
  readonly relationshipType: 'prerequisite' | 'extension' | 'alternative' | 'complement';
  readonly description: string;
  readonly provenance: KnowledgeMisconceptionProvenance;
}): KnowledgeMisconceptionRelationship {
  return {
    relationshipId: params.relationshipId,
    sourceMisconceptionId: params.sourceMisconceptionId,
    targetMisconceptionId: params.targetMisconceptionId,
    relationshipType: params.relationshipType,
    description: params.description,
    provenance: params.provenance,
  };
}

// ---------------------------------------------------------------------------
// Deterministic Sort Comparator
// ---------------------------------------------------------------------------

function _compareKnowledgeMisconceptionProfile(
  a: KnowledgeMisconceptionProfile,
  b: KnowledgeMisconceptionProfile,
): number {
  if (a.conceptId < b.conceptId) return -1;
  if (a.conceptId > b.conceptId) return 1;

  if (a.misconceptionType < b.misconceptionType) return -1;
  if (a.misconceptionType > b.misconceptionType) return 1;

  if (a.severity < b.severity) return -1;
  if (a.severity > b.severity) return 1;

  if (a.misconceptionId < b.misconceptionId) return -1;
  if (a.misconceptionId > b.misconceptionId) return 1;

  return 0;
}

function _compareKnowledgeMisconceptionRelationship(
  a: KnowledgeMisconceptionRelationship,
  b: KnowledgeMisconceptionRelationship,
): number {
  if (a.relationshipId < b.relationshipId) return -1;
  if (a.relationshipId > b.relationshipId) return 1;

  return 0;
}

// ---------------------------------------------------------------------------
// Misconception Registry Composition
// ---------------------------------------------------------------------------

export function composeKnowledgeMisconceptionRegistry(
  profiles: readonly KnowledgeMisconceptionProfile[],
  relationships: readonly KnowledgeMisconceptionRelationship[],
): KnowledgeMisconceptionRegistry {
  const sortedProfiles = [...profiles].sort(_compareKnowledgeMisconceptionProfile);
  const sortedRelationships = [...relationships].sort(_compareKnowledgeMisconceptionRelationship);

  const concepts = new Set(sortedProfiles.map((p) => p.conceptId));
  const types = new Set(sortedProfiles.map((p) => p.misconceptionType));

  const metadata: KnowledgeMisconceptionRegistryMetadata = {
    registryId: `_registry_${sortedProfiles.length}`,
    misconceptionCount: sortedProfiles.length,
    relationshipCount: sortedRelationships.length,
    conceptCount: concepts.size,
    typeCount: types.size,
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
      generatedFrom: 'deterministic_misconception_kernel',
      randomUsed: false,
      timeDependency: false,
    },
    deterministic: true,
    generatedFrom: 'deterministic_misconception_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Misconception Registry From Input Composition
// ---------------------------------------------------------------------------

export function composeKnowledgeMisconceptionRegistryFromInput(
  input: KnowledgeMisconceptionInput,
): KnowledgeMisconceptionRegistry {
  return composeKnowledgeMisconceptionRegistry(input.profiles, input.relationships);
}

// ---------------------------------------------------------------------------
// Misconception Composition (Main Entry Point)
// ---------------------------------------------------------------------------

export function composeKnowledgeMisconceptions(
  input: KnowledgeMisconceptionInput,
): KnowledgeMisconceptionRegistry {
  const decisions = input.profiles.map((profile) => {
    const errors = _validateMisconceptionForDecision(profile);
    return _composeMisconceptionDecision(profile.misconceptionId, profile.conceptId, errors.length === 0, errors);
  });

  const registry = composeKnowledgeMisconceptionRegistry(input.profiles, input.relationships);

  return {
    ...registry,
    trace: composeKnowledgeMisconceptionTrace({
      traceId: `_trace_${input.profiles.length}`,
      decisions,
      registryVersion: '1.0.0',
      compositionVersion: '1.0.0',
    }),
  };
}

function _validateMisconceptionForDecision(
  profile: KnowledgeMisconceptionProfile,
): readonly string[] {
  const errors: string[] = [];

  if (!profile.misconceptionId || profile.misconceptionId.trim() === '') {
    errors.push('MISCONCEPTION_MISSING_PROFILE_ID');
  }

  if (!profile.title || profile.title.trim() === '') {
    errors.push('MISCONCEPTION_MISSING_TITLE');
  }

  if (!profile.conceptId || profile.conceptId.trim() === '') {
    errors.push('MISCONCEPTION_MISSING_CONCEPT_REFERENCE');
  }

  if (!CANONICAL_MISCONCEPTION_TYPES.includes(profile.misconceptionType)) {
    errors.push('MISCONCEPTION_INVALID_TYPE');
  }

  if (!CANONICAL_MISCONCEPTION_SEVERITY.includes(profile.severity)) {
    errors.push('MISCONCEPTION_INVALID_SEVERITY');
  }

  if (!CANONICAL_CORRECTIVE_STRATEGIES.includes(profile.correctiveStrategy)) {
    errors.push('MISCONCEPTION_INVALID_CORRECTIVE_STRATEGY');
  }

  if (!CANONICAL_MISCONCEPTION_VISIBILITY.includes(profile.visibility)) {
    errors.push('MISCONCEPTION_INVALID_VISIBILITY');
  }

  if (!CANONICAL_MISCONCEPTION_STATUS.includes(profile.status)) {
    errors.push('MISCONCEPTION_INVALID_STATUS');
  }

  if (!CANONICAL_MISCONCEPTION_GOVERNANCE.includes(profile.governance)) {
    errors.push('MISCONCEPTION_INVALID_GOVERNANCE');
  }

  if (!profile.provenance) {
    errors.push('MISCONCEPTION_MISSING_PROVENANCE');
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Artifact With Misconceptions Composition
// ---------------------------------------------------------------------------

export function composeKnowledgeArtifactWithMisconceptions(params: {
  readonly conceptId: string;
  readonly conceptTitle: string;
  readonly profiles: readonly KnowledgeMisconceptionProfile[];
  readonly relationships: readonly KnowledgeMisconceptionRelationship[];
  readonly provenance: KnowledgeMisconceptionProvenance;
}): KnowledgeArtifactWithMisconceptions {
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

export function isSupportedMisconceptionType(
  value: string,
): value is MisconceptionType {
  return CANONICAL_MISCONCEPTION_TYPES.includes(value as MisconceptionType);
}

export function isSupportedMisconceptionSeverity(
  value: string,
): value is MisconceptionSeverity {
  return CANONICAL_MISCONCEPTION_SEVERITY.includes(value as MisconceptionSeverity);
}

export function isSupportedCorrectiveStrategy(
  value: string,
): value is CorrectiveStrategy {
  return CANONICAL_CORRECTIVE_STRATEGIES.includes(value as CorrectiveStrategy);
}

export function isSupportedMisconceptionVisibility(
  value: string,
): value is MisconceptionVisibility {
  return CANONICAL_MISCONCEPTION_VISIBILITY.includes(value as MisconceptionVisibility);
}

export function isSupportedMisconceptionStatus(
  value: string,
): value is MisconceptionStatus {
  return CANONICAL_MISCONCEPTION_STATUS.includes(value as MisconceptionStatus);
}

export function isSupportedMisconceptionGovernance(
  value: string,
): value is MisconceptionGovernance {
  return CANONICAL_MISCONCEPTION_GOVERNANCE.includes(value as MisconceptionGovernance);
}

// ---------------------------------------------------------------------------
// Helper Functions — Canonical Getters
// ---------------------------------------------------------------------------

export function getCanonicalMisconceptionTypes(): readonly MisconceptionType[] {
  return CANONICAL_MISCONCEPTION_TYPES;
}

export function getCanonicalMisconceptionSeverities(): readonly MisconceptionSeverity[] {
  return CANONICAL_MISCONCEPTION_SEVERITY;
}

export function getCanonicalCorrectiveStrategies(): readonly CorrectiveStrategy[] {
  return CANONICAL_CORRECTIVE_STRATEGIES;
}

export function getCanonicalMisconceptionVisibility(): readonly MisconceptionVisibility[] {
  return CANONICAL_MISCONCEPTION_VISIBILITY;
}

export function getCanonicalMisconceptionStatuses(): readonly MisconceptionStatus[] {
  return CANONICAL_MISCONCEPTION_STATUS;
}

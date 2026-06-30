/**
 * D10-OPT-05 — Progressive Examples, Canonical Example Modeling Kernel
 *
 * Deterministic orchestration functions for example metadata.
 * Produces example profiles, relationships, traces, and registries.
 *
 * This module never:
 * - Generates examples
 * - Generates exercises
 * - Generates worked solutions
 * - Generates code
 * - Performs educational reasoning
 * - Performs adaptive sequencing
 * - Performs automatic progression
 * - Tutors learners
 * - Invokes LLMs
 * - Accesses filesystem
 * - Performs network requests
 *
 * Example metadata only.
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import type {
  KnowledgeExampleProfile,
  KnowledgeExampleProvenance,
  KnowledgeExampleDecision,
  KnowledgeExampleTrace,
  KnowledgeExampleRegistry,
  KnowledgeExampleRegistryMetadata,
  KnowledgeExampleInput,
  KnowledgeExampleRelationship,
  KnowledgeArtifactWithExamples,
  ExampleType,
  ExampleLevel,
  ProgressiveStage,
  ExampleVisibility,
  ExampleStatus,
  ExampleGovernance,
} from './KnowledgeAgentContract.ts';

import {
  CANONICAL_EXAMPLE_TYPES,
  CANONICAL_EXAMPLE_LEVELS,
  CANONICAL_PROGRESSIVE_STAGES,
  CANONICAL_EXAMPLE_STATUS,
  CANONICAL_EXAMPLE_VISIBILITY,
  CANONICAL_EXAMPLE_GOVERNANCE,
} from './KnowledgeAgentContract.ts';

// ---------------------------------------------------------------------------
// Example Provenance Composition
// ---------------------------------------------------------------------------

export function composeKnowledgeExampleProvenance(params: {
  readonly source: string;
  readonly provider: string;
  readonly rationale: string;
  readonly governance: ExampleGovernance;
}): KnowledgeExampleProvenance {
  return {
    source: params.source,
    provider: params.provider,
    rationale: params.rationale,
    governance: params.governance,
  };
}

// ---------------------------------------------------------------------------
// Example Decision Composition
// ---------------------------------------------------------------------------

function _composeExampleDecision(
  exampleId: string,
  conceptId: string,
  validationPassed: boolean,
  validationErrors: readonly string[],
): KnowledgeExampleDecision {
  return {
    decisionId: `_decision_${exampleId}`,
    exampleId,
    conceptId,
    validationPassed,
    validationErrors,
  };
}

// ---------------------------------------------------------------------------
// Example Trace Composition
// ---------------------------------------------------------------------------

export function composeKnowledgeExampleTrace(params: {
  readonly traceId: string;
  readonly decisions: readonly KnowledgeExampleDecision[];
  readonly registryVersion: string;
  readonly compositionVersion: string;
}): KnowledgeExampleTrace {
  return {
    traceId: params.traceId,
    decisionCount: params.decisions.length,
    validationCount: params.decisions.filter((d) => d.validationPassed).length,
    registryVersion: params.registryVersion,
    compositionVersion: params.compositionVersion,
    decisions: params.decisions,
    deterministic: true,
    generatedFrom: 'deterministic_example_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Example Profile Composition
// ---------------------------------------------------------------------------

export function composeKnowledgeExampleProfile(params: {
  readonly exampleId: string;
  readonly conceptId: string;
  readonly title: string;
  readonly exampleType: ExampleType;
  readonly exampleLevel: ExampleLevel;
  readonly progressiveStage: ProgressiveStage;
  readonly visibility: ExampleVisibility;
  readonly status: ExampleStatus;
  readonly governance: ExampleGovernance;
  readonly tags: readonly string[];
  readonly representationIds: readonly string[];
  readonly orderIndex: number;
  readonly provenance: KnowledgeExampleProvenance;
}): KnowledgeExampleProfile {
  return {
    exampleId: params.exampleId,
    conceptId: params.conceptId,
    title: params.title,
    exampleType: params.exampleType,
    exampleLevel: params.exampleLevel,
    progressiveStage: params.progressiveStage,
    visibility: params.visibility,
    status: params.status,
    governance: params.governance,
    tags: [...params.tags],
    representationIds: [...params.representationIds],
    orderIndex: params.orderIndex,
    provenance: params.provenance,
  };
}

// ---------------------------------------------------------------------------
// Example Relationship Composition
// ---------------------------------------------------------------------------

export function composeKnowledgeExampleRelationship(params: {
  readonly relationshipId: string;
  readonly sourceExampleId: string;
  readonly targetExampleId: string;
  readonly conceptId: string;
  readonly relationshipType: 'prerequisite' | 'extension' | 'progression' | 'comparison';
  readonly description: string;
  readonly provenance: KnowledgeExampleProvenance;
}): KnowledgeExampleRelationship {
  return {
    relationshipId: params.relationshipId,
    sourceExampleId: params.sourceExampleId,
    targetExampleId: params.targetExampleId,
    conceptId: params.conceptId,
    relationshipType: params.relationshipType,
    description: params.description,
    provenance: params.provenance,
  };
}

// ---------------------------------------------------------------------------
// Deterministic Sort Comparator
// ---------------------------------------------------------------------------

function _compareKnowledgeExampleProfile(
  a: KnowledgeExampleProfile,
  b: KnowledgeExampleProfile,
): number {
  if (a.conceptId < b.conceptId) return -1;
  if (a.conceptId > b.conceptId) return 1;

  const stageOrder = CANONICAL_PROGRESSIVE_STAGES.indexOf(a.progressiveStage) - CANONICAL_PROGRESSIVE_STAGES.indexOf(b.progressiveStage);
  if (stageOrder !== 0) return stageOrder;

  if (a.orderIndex < b.orderIndex) return -1;
  if (a.orderIndex > b.orderIndex) return 1;

  if (a.exampleId < b.exampleId) return -1;
  if (a.exampleId > b.exampleId) return 1;

  return 0;
}

function _compareKnowledgeExampleRelationship(
  a: KnowledgeExampleRelationship,
  b: KnowledgeExampleRelationship,
): number {
  if (a.relationshipId < b.relationshipId) return -1;
  if (a.relationshipId > b.relationshipId) return 1;

  return 0;
}

// ---------------------------------------------------------------------------
// Example Registry Composition
// ---------------------------------------------------------------------------

export function composeKnowledgeExampleRegistry(
  profiles: readonly KnowledgeExampleProfile[],
  relationships: readonly KnowledgeExampleRelationship[],
): KnowledgeExampleRegistry {
  const sortedProfiles = [...profiles].sort(_compareKnowledgeExampleProfile);
  const sortedRelationships = [...relationships].sort(_compareKnowledgeExampleRelationship);

  const concepts = new Set(sortedProfiles.map((p) => p.conceptId));
  const levels = new Set(sortedProfiles.map((p) => p.exampleLevel));

  const metadata: KnowledgeExampleRegistryMetadata = {
    registryId: `_registry_${sortedProfiles.length}`,
    exampleCount: sortedProfiles.length,
    relationshipCount: sortedRelationships.length,
    conceptCount: concepts.size,
    levelCount: levels.size,
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
      generatedFrom: 'deterministic_example_kernel',
      randomUsed: false,
      timeDependency: false,
    },
    deterministic: true,
    generatedFrom: 'deterministic_example_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Example Registry From Input Composition
// ---------------------------------------------------------------------------

export function composeKnowledgeExampleRegistryFromInput(
  input: KnowledgeExampleInput,
): KnowledgeExampleRegistry {
  return composeKnowledgeExampleRegistry(input.profiles, input.relationships);
}

// ---------------------------------------------------------------------------
// Example Composition (Main Entry Point)
// ---------------------------------------------------------------------------

export function composeKnowledgeExamples(
  input: KnowledgeExampleInput,
): KnowledgeExampleRegistry {
  const decisions = input.profiles.map((profile) => {
    const errors = _validateExampleForDecision(profile);
    return _composeExampleDecision(profile.exampleId, profile.conceptId, errors.length === 0, errors);
  });

  const registry = composeKnowledgeExampleRegistry(input.profiles, input.relationships);

  return {
    ...registry,
    trace: composeKnowledgeExampleTrace({
      traceId: `_trace_${input.profiles.length}`,
      decisions,
      registryVersion: '1.0.0',
      compositionVersion: '1.0.0',
    }),
  };
}

function _validateExampleForDecision(
  profile: KnowledgeExampleProfile,
): readonly string[] {
  const errors: string[] = [];

  if (!profile.exampleId || profile.exampleId.trim() === '') {
    errors.push('EXAMPLE_MISSING_PROFILE_ID');
  }

  if (!profile.title || profile.title.trim() === '') {
    errors.push('EXAMPLE_MISSING_TITLE');
  }

  if (!profile.conceptId || profile.conceptId.trim() === '') {
    errors.push('EXAMPLE_MISSING_CONCEPT_REFERENCE');
  }

  if (!CANONICAL_EXAMPLE_TYPES.includes(profile.exampleType)) {
    errors.push('EXAMPLE_INVALID_TYPE');
  }

  if (!CANONICAL_EXAMPLE_LEVELS.includes(profile.exampleLevel)) {
    errors.push('EXAMPLE_INVALID_LEVEL');
  }

  if (!CANONICAL_PROGRESSIVE_STAGES.includes(profile.progressiveStage)) {
    errors.push('EXAMPLE_INVALID_STAGE');
  }

  if (!CANONICAL_EXAMPLE_VISIBILITY.includes(profile.visibility)) {
    errors.push('EXAMPLE_INVALID_VISIBILITY');
  }

  if (!CANONICAL_EXAMPLE_STATUS.includes(profile.status)) {
    errors.push('EXAMPLE_INVALID_STATUS');
  }

  if (!CANONICAL_EXAMPLE_GOVERNANCE.includes(profile.governance)) {
    errors.push('EXAMPLE_INVALID_GOVERNANCE');
  }

  if (!profile.provenance) {
    errors.push('EXAMPLE_MISSING_PROVENANCE');
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Artifact With Examples Composition
// ---------------------------------------------------------------------------

export function composeKnowledgeArtifactWithExamples(params: {
  readonly conceptId: string;
  readonly conceptTitle: string;
  readonly profiles: readonly KnowledgeExampleProfile[];
  readonly relationships: readonly KnowledgeExampleRelationship[];
  readonly provenance: KnowledgeExampleProvenance;
}): KnowledgeArtifactWithExamples {
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

export function isSupportedExampleType(
  value: string,
): value is ExampleType {
  return CANONICAL_EXAMPLE_TYPES.includes(value as ExampleType);
}

export function isSupportedExampleLevel(
  value: string,
): value is ExampleLevel {
  return CANONICAL_EXAMPLE_LEVELS.includes(value as ExampleLevel);
}

export function isSupportedProgressiveStage(
  value: string,
): value is ProgressiveStage {
  return CANONICAL_PROGRESSIVE_STAGES.includes(value as ProgressiveStage);
}

export function isSupportedExampleVisibility(
  value: string,
): value is ExampleVisibility {
  return CANONICAL_EXAMPLE_VISIBILITY.includes(value as ExampleVisibility);
}

export function isSupportedExampleStatus(
  value: string,
): value is ExampleStatus {
  return CANONICAL_EXAMPLE_STATUS.includes(value as ExampleStatus);
}

export function isSupportedExampleGovernance(
  value: string,
): value is ExampleGovernance {
  return CANONICAL_EXAMPLE_GOVERNANCE.includes(value as ExampleGovernance);
}

// ---------------------------------------------------------------------------
// Helper Functions — Canonical Getters
// ---------------------------------------------------------------------------

export function getCanonicalExampleTypes(): readonly ExampleType[] {
  return CANONICAL_EXAMPLE_TYPES;
}

export function getCanonicalExampleLevels(): readonly ExampleLevel[] {
  return CANONICAL_EXAMPLE_LEVELS;
}

export function getCanonicalProgressiveStages(): readonly ProgressiveStage[] {
  return CANONICAL_PROGRESSIVE_STAGES;
}

export function getCanonicalExampleVisibility(): readonly ExampleVisibility[] {
  return CANONICAL_EXAMPLE_VISIBILITY;
}

export function getCanonicalExampleStatuses(): readonly ExampleStatus[] {
  return CANONICAL_EXAMPLE_STATUS;
}

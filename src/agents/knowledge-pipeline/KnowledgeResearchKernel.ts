/**
 * D10-OPT-10 — Research Provenance Kernel
 *
 * Deterministic orchestration functions for research metadata.
 * Produces research profiles, relationships, traces, and registries.
 *
 * This module never:
 * - Searches papers
 * - Looks up DOIs
 * - Makes CrossRef requests
 * - Makes PubMed requests
 * - Makes Semantic Scholar requests
 * - Makes OpenAlex requests
 * - Makes Google Scholar requests
 * - Parses citations
 * - Performs bibliographic lookup
 * - Generates bibliographies automatically
 * - Formats citations automatically
 * - Evaluates research
 * - Ranks papers
 * - Scores evidence
 * - Invokes LLMs
 * - Accesses filesystem
 * - Performs network requests
 *
 * Research metadata only.
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import type {
  KnowledgeResearchProfile,
  KnowledgeResearchProvenance,
  KnowledgeResearchDecision,
  KnowledgeResearchTrace,
  KnowledgeResearchRegistry,
  KnowledgeResearchRegistryMetadata,
  KnowledgeResearchInput,
  KnowledgeResearchRelationship,
  KnowledgeArtifactWithResearch,
  ResearchSourceType,
  EvidenceLevel,
  ResearchCitationType as CitationType,
  ResearchVisibility,
  ResearchStatus,
  ResearchGovernance,
} from './KnowledgeAgentContract.ts';

import {
  CANONICAL_RESEARCH_SOURCE_TYPES,
  CANONICAL_EVIDENCE_LEVELS,
  CANONICAL_RESEARCH_CITATION_TYPES as CANONICAL_CITATION_TYPES,
  CANONICAL_RESEARCH_STATUS,
  CANONICAL_RESEARCH_VISIBILITY,
  CANONICAL_RESEARCH_GOVERNANCE,
} from './KnowledgeAgentContract.ts';

// ---------------------------------------------------------------------------
// Research Provenance Composition
// ---------------------------------------------------------------------------

export function composeKnowledgeResearchProvenance(params: {
  readonly source: string;
  readonly provider: string;
  readonly rationale: string;
  readonly governance: ResearchGovernance;
}): KnowledgeResearchProvenance {
  return {
    source: params.source,
    provider: params.provider,
    rationale: params.rationale,
    governance: params.governance,
  };
}

// ---------------------------------------------------------------------------
// Research Decision Composition
// ---------------------------------------------------------------------------

function _composeResearchDecision(
  researchId: string,
  conceptId: string,
  validationPassed: boolean,
  validationErrors: readonly string[],
): KnowledgeResearchDecision {
  return {
    decisionId: `_decision_${researchId}`,
    researchId,
    conceptId,
    validationPassed,
    validationErrors,
  };
}

// ---------------------------------------------------------------------------
// Research Trace Composition
// ---------------------------------------------------------------------------

export function composeKnowledgeResearchTrace(params: {
  readonly traceId: string;
  readonly decisions: readonly KnowledgeResearchDecision[];
  readonly registryVersion: string;
  readonly compositionVersion: string;
}): KnowledgeResearchTrace {
  return {
    traceId: params.traceId,
    decisionCount: params.decisions.length,
    validationCount: params.decisions.filter((d) => d.validationPassed).length,
    registryVersion: params.registryVersion,
    compositionVersion: params.compositionVersion,
    decisions: params.decisions,
    deterministic: true,
    generatedFrom: 'deterministic_research_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Research Profile Composition
// ---------------------------------------------------------------------------

export function composeKnowledgeResearchProfile(params: {
  readonly researchId: string;
  readonly conceptId: string;
  readonly title: string;
  readonly researchSourceType: ResearchSourceType;
  readonly evidenceLevel: EvidenceLevel;
  readonly citationType: CitationType;
  readonly publicationYear: number;
  readonly doiReference: string;
  readonly authors: readonly string[];
  readonly publisher: string;
  readonly visibility: ResearchVisibility;
  readonly status: ResearchStatus;
  readonly governance: ResearchGovernance;
  readonly tags: readonly string[];
  readonly provenance: KnowledgeResearchProvenance;
}): KnowledgeResearchProfile {
  return {
    researchId: params.researchId,
    conceptId: params.conceptId,
    title: params.title,
    researchSourceType: params.researchSourceType,
    evidenceLevel: params.evidenceLevel,
    citationType: params.citationType,
    publicationYear: params.publicationYear,
    doiReference: params.doiReference,
    authors: [...params.authors],
    publisher: params.publisher,
    visibility: params.visibility,
    status: params.status,
    governance: params.governance,
    tags: [...params.tags],
    provenance: params.provenance,
  };
}

// ---------------------------------------------------------------------------
// Research Relationship Composition
// ---------------------------------------------------------------------------

export function composeKnowledgeResearchRelationship(params: {
  readonly relationshipId: string;
  readonly sourceResearchId: string;
  readonly targetResearchId: string;
  readonly relationshipType: 'prerequisite' | 'extension' | 'alternative' | 'complement';
  readonly description: string;
  readonly provenance: KnowledgeResearchProvenance;
}): KnowledgeResearchRelationship {
  return {
    relationshipId: params.relationshipId,
    sourceResearchId: params.sourceResearchId,
    targetResearchId: params.targetResearchId,
    relationshipType: params.relationshipType,
    description: params.description,
    provenance: params.provenance,
  };
}

// ---------------------------------------------------------------------------
// Deterministic Sort Comparator
// ---------------------------------------------------------------------------

function _compareKnowledgeResearchProfile(
  a: KnowledgeResearchProfile,
  b: KnowledgeResearchProfile,
): number {
  if (a.conceptId < b.conceptId) return -1;
  if (a.conceptId > b.conceptId) return 1;

  if (a.researchSourceType < b.researchSourceType) return -1;
  if (a.researchSourceType > b.researchSourceType) return 1;

  if (a.publicationYear < b.publicationYear) return -1;
  if (a.publicationYear > b.publicationYear) return 1;

  if (a.researchId < b.researchId) return -1;
  if (a.researchId > b.researchId) return 1;

  return 0;
}

function _compareKnowledgeResearchRelationship(
  a: KnowledgeResearchRelationship,
  b: KnowledgeResearchRelationship,
): number {
  if (a.relationshipId < b.relationshipId) return -1;
  if (a.relationshipId > b.relationshipId) return 1;

  return 0;
}

// ---------------------------------------------------------------------------
// Research Registry Composition
// ---------------------------------------------------------------------------

export function composeKnowledgeResearchRegistry(
  profiles: readonly KnowledgeResearchProfile[],
  relationships: readonly KnowledgeResearchRelationship[],
): KnowledgeResearchRegistry {
  const sortedProfiles = [...profiles].sort(_compareKnowledgeResearchProfile);
  const sortedRelationships = [...relationships].sort(_compareKnowledgeResearchRelationship);

  const concepts = new Set(sortedProfiles.map((p) => p.conceptId));
  const sourceTypes = new Set(sortedProfiles.map((p) => p.researchSourceType));

  const metadata: KnowledgeResearchRegistryMetadata = {
    registryId: `_registry_${sortedProfiles.length}`,
    researchCount: sortedProfiles.length,
    relationshipCount: sortedRelationships.length,
    conceptCount: concepts.size,
    sourceTypeCount: sourceTypes.size,
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
      generatedFrom: 'deterministic_research_kernel',
      randomUsed: false,
      timeDependency: false,
    },
    deterministic: true,
    generatedFrom: 'deterministic_research_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Research Registry From Input Composition
// ---------------------------------------------------------------------------

export function composeKnowledgeResearchRegistryFromInput(
  input: KnowledgeResearchInput,
): KnowledgeResearchRegistry {
  return composeKnowledgeResearchRegistry(input.profiles, input.relationships);
}

// ---------------------------------------------------------------------------
// Research Composition (Main Entry Point)
// ---------------------------------------------------------------------------

export function composeKnowledgeResearch(
  input: KnowledgeResearchInput,
): KnowledgeResearchRegistry {
  const decisions = input.profiles.map((profile) => {
    const errors = _validateResearchForDecision(profile);
    return _composeResearchDecision(profile.researchId, profile.conceptId, errors.length === 0, errors);
  });

  const registry = composeKnowledgeResearchRegistry(input.profiles, input.relationships);

  return {
    ...registry,
    trace: composeKnowledgeResearchTrace({
      traceId: `_trace_${input.profiles.length}`,
      decisions,
      registryVersion: '1.0.0',
      compositionVersion: '1.0.0',
    }),
  };
}

function _validateResearchForDecision(
  profile: KnowledgeResearchProfile,
): readonly string[] {
  const errors: string[] = [];

  if (!profile.researchId || profile.researchId.trim() === '') {
    errors.push('RESEARCH_MISSING_PROFILE_ID');
  }

  if (!profile.title || profile.title.trim() === '') {
    errors.push('RESEARCH_MISSING_TITLE');
  }

  if (!profile.conceptId || profile.conceptId.trim() === '') {
    errors.push('RESEARCH_MISSING_CONCEPT_REFERENCE');
  }

  if (!CANONICAL_RESEARCH_SOURCE_TYPES.includes(profile.researchSourceType)) {
    errors.push('RESEARCH_INVALID_SOURCE');
  }

  if (!CANONICAL_EVIDENCE_LEVELS.includes(profile.evidenceLevel)) {
    errors.push('RESEARCH_INVALID_EVIDENCE');
  }

  if (!CANONICAL_CITATION_TYPES.includes(profile.citationType)) {
    errors.push('RESEARCH_INVALID_CITATION');
  }

  if (!CANONICAL_RESEARCH_VISIBILITY.includes(profile.visibility)) {
    errors.push('RESEARCH_INVALID_VISIBILITY');
  }

  if (!CANONICAL_RESEARCH_STATUS.includes(profile.status)) {
    errors.push('RESEARCH_INVALID_STATUS');
  }

  if (!CANONICAL_RESEARCH_GOVERNANCE.includes(profile.governance)) {
    errors.push('RESEARCH_INVALID_GOVERNANCE');
  }

  if (!profile.provenance) {
    errors.push('RESEARCH_MISSING_PROVENANCE');
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Artifact With Research Composition
// ---------------------------------------------------------------------------

export function composeKnowledgeArtifactWithResearch(params: {
  readonly conceptId: string;
  readonly conceptTitle: string;
  readonly profiles: readonly KnowledgeResearchProfile[];
  readonly relationships: readonly KnowledgeResearchRelationship[];
  readonly provenance: KnowledgeResearchProvenance;
}): KnowledgeArtifactWithResearch {
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

export function isSupportedResearchSourceType(
  value: string,
): value is ResearchSourceType {
  return CANONICAL_RESEARCH_SOURCE_TYPES.includes(value as ResearchSourceType);
}

export function isSupportedEvidenceLevel(
  value: string,
): value is EvidenceLevel {
  return CANONICAL_EVIDENCE_LEVELS.includes(value as EvidenceLevel);
}

export function isSupportedCitationType(
  value: string,
): value is CitationType {
  return CANONICAL_CITATION_TYPES.includes(value as CitationType);
}

export function isSupportedResearchVisibility(
  value: string,
): value is ResearchVisibility {
  return CANONICAL_RESEARCH_VISIBILITY.includes(value as ResearchVisibility);
}

export function isSupportedResearchStatus(
  value: string,
): value is ResearchStatus {
  return CANONICAL_RESEARCH_STATUS.includes(value as ResearchStatus);
}

export function isSupportedResearchGovernance(
  value: string,
): value is ResearchGovernance {
  return CANONICAL_RESEARCH_GOVERNANCE.includes(value as ResearchGovernance);
}

// ---------------------------------------------------------------------------
// Helper Functions — Canonical Getters
// ---------------------------------------------------------------------------

export function getCanonicalResearchSourceTypes(): readonly ResearchSourceType[] {
  return CANONICAL_RESEARCH_SOURCE_TYPES;
}

export function getCanonicalEvidenceLevels(): readonly EvidenceLevel[] {
  return CANONICAL_EVIDENCE_LEVELS;
}

export function getCanonicalCitationTypes(): readonly CitationType[] {
  return CANONICAL_CITATION_TYPES;
}

export function getCanonicalResearchVisibility(): readonly ResearchVisibility[] {
  return CANONICAL_RESEARCH_VISIBILITY;
}

export function getCanonicalResearchStatuses(): readonly ResearchStatus[] {
  return CANONICAL_RESEARCH_STATUS;
}

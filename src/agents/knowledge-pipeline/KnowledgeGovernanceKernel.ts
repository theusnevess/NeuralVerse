/**
 * D10-OPT-16 — Continuous Governance Kernel
 *
 * Deterministic orchestration functions for governance metadata.
 * Produces governance profiles, relationships, traces, and registries.
 *
 * This module never:
 * - Executes governance
 * - Reviews knowledge
 * - Approves content
 * - Modifies artifacts
 * - Performs workflow execution
 * - Uses approval engines
 * - Uses review engines
 * - Assigns editors
 * - Uses notification engines
 * - Uses task schedulers
 * - Automates reviews
 * - Publishes content
 * - Modifies artifacts
 * - Rewrites knowledge
 * - Performs automatic governance
 * - Monitors continuously
 * - Invokes LLMs
 * - Accesses filesystem
 * - Performs network requests
 *
 * Governance metadata only.
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import type {
  KnowledgeGovernanceProfile,
  KnowledgeGovernanceProvenance,
  KnowledgeGovernanceDecision,
  KnowledgeGovernanceTrace,
  KnowledgeGovernanceRegistry,
  KnowledgeGovernanceRegistryMetadata,
  KnowledgeGovernanceInput,
  KnowledgeGovernanceRelationship,
  KnowledgeArtifactWithGovernance,
  GovernanceStage,
  GovernanceEvent,
  ReviewLevel,
  GovernanceVisibility,
  GovernanceStatus,
  GovernancePolicy,
} from './KnowledgeAgentContract.ts';

import {
  CANONICAL_GOVERNANCE_STAGES,
  CANONICAL_GOVERNANCE_EVENTS,
  CANONICAL_REVIEW_LEVELS,
  CANONICAL_GOVERNANCE_STATUS,
  CANONICAL_GOVERNANCE_VISIBILITY,
  CANONICAL_GOVERNANCE_POLICY,
} from './KnowledgeAgentContract.ts';

// ---------------------------------------------------------------------------
// Governance Provenance Composition
// ---------------------------------------------------------------------------

export function composeKnowledgeGovernanceProvenance(params: {
  readonly source: string;
  readonly provider: string;
  readonly rationale: string;
  readonly governance: GovernancePolicy;
}): KnowledgeGovernanceProvenance {
  return {
    source: params.source,
    provider: params.provider,
    rationale: params.rationale,
    governance: params.governance,
  };
}

// ---------------------------------------------------------------------------
// Governance Decision Composition
// ---------------------------------------------------------------------------

function _composeGovernanceDecision(
  governanceId: string,
  conceptId: string,
  validationPassed: boolean,
  validationErrors: readonly string[],
): KnowledgeGovernanceDecision {
  return {
    decisionId: `_decision_${governanceId}`,
    governanceId,
    conceptId,
    validationPassed,
    validationErrors,
  };
}

// ---------------------------------------------------------------------------
// Governance Trace Composition
// ---------------------------------------------------------------------------

export function composeKnowledgeGovernanceTrace(params: {
  readonly traceId: string;
  readonly decisions: readonly KnowledgeGovernanceDecision[];
  readonly registryVersion: string;
  readonly compositionVersion: string;
}): KnowledgeGovernanceTrace {
  return {
    traceId: params.traceId,
    decisionCount: params.decisions.length,
    validationCount: params.decisions.filter((d) => d.validationPassed).length,
    registryVersion: params.registryVersion,
    compositionVersion: params.compositionVersion,
    decisions: params.decisions,
    deterministic: true,
    generatedFrom: 'deterministic_governance_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Governance Profile Composition
// ---------------------------------------------------------------------------

export function composeKnowledgeGovernanceProfile(params: {
  readonly governanceId: string;
  readonly conceptId: string;
  readonly title: string;
  readonly governanceStage: GovernanceStage;
  readonly reviewLevel: ReviewLevel;
  readonly governanceEvent: GovernanceEvent;
  readonly visibility: GovernanceVisibility;
  readonly status: GovernanceStatus;
  readonly policy: GovernancePolicy;
  readonly reviewReference: string;
  readonly approvalReference: string;
  readonly tags: readonly string[];
  readonly provenance: KnowledgeGovernanceProvenance;
}): KnowledgeGovernanceProfile {
  return {
    governanceId: params.governanceId,
    conceptId: params.conceptId,
    title: params.title,
    governanceStage: params.governanceStage,
    reviewLevel: params.reviewLevel,
    governanceEvent: params.governanceEvent,
    visibility: params.visibility,
    status: params.status,
    policy: params.policy,
    reviewReference: params.reviewReference,
    approvalReference: params.approvalReference,
    tags: [...params.tags],
    provenance: params.provenance,
  };
}

// ---------------------------------------------------------------------------
// Governance Relationship Composition
// ---------------------------------------------------------------------------

export function composeKnowledgeGovernanceRelationship(params: {
  readonly relationshipId: string;
  readonly sourceGovernanceId: string;
  readonly targetGovernanceId: string;
  readonly relationshipType: 'prerequisite' | 'extension' | 'alternative' | 'complement';
  readonly description: string;
  readonly provenance: KnowledgeGovernanceProvenance;
}): KnowledgeGovernanceRelationship {
  return {
    relationshipId: params.relationshipId,
    sourceGovernanceId: params.sourceGovernanceId,
    targetGovernanceId: params.targetGovernanceId,
    relationshipType: params.relationshipType,
    description: params.description,
    provenance: params.provenance,
  };
}

// ---------------------------------------------------------------------------
// Deterministic Sort Comparator
// ---------------------------------------------------------------------------

function _compareKnowledgeGovernanceProfile(
  a: KnowledgeGovernanceProfile,
  b: KnowledgeGovernanceProfile,
): number {
  if (a.conceptId < b.conceptId) return -1;
  if (a.conceptId > b.conceptId) return 1;

  if (a.governanceStage < b.governanceStage) return -1;
  if (a.governanceStage > b.governanceStage) return 1;

  if (a.reviewLevel < b.reviewLevel) return -1;
  if (a.reviewLevel > b.reviewLevel) return 1;

  if (a.governanceId < b.governanceId) return -1;
  if (a.governanceId > b.governanceId) return 1;

  return 0;
}

function _compareKnowledgeGovernanceRelationship(
  a: KnowledgeGovernanceRelationship,
  b: KnowledgeGovernanceRelationship,
): number {
  if (a.relationshipId < b.relationshipId) return -1;
  if (a.relationshipId > b.relationshipId) return 1;

  return 0;
}

// ---------------------------------------------------------------------------
// Governance Registry Composition
// ---------------------------------------------------------------------------

export function composeKnowledgeGovernanceRegistry(
  profiles: readonly KnowledgeGovernanceProfile[],
  relationships: readonly KnowledgeGovernanceRelationship[],
): KnowledgeGovernanceRegistry {
  const sortedProfiles = [...profiles].sort(_compareKnowledgeGovernanceProfile);
  const sortedRelationships = [...relationships].sort(_compareKnowledgeGovernanceRelationship);

  const concepts = new Set(sortedProfiles.map((p) => p.conceptId));
  const stages = new Set(sortedProfiles.map((p) => p.governanceStage));

  const metadata: KnowledgeGovernanceRegistryMetadata = {
    registryId: `_registry_${sortedProfiles.length}`,
    governanceCount: sortedProfiles.length,
    relationshipCount: sortedRelationships.length,
    conceptCount: concepts.size,
    stageCount: stages.size,
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
      generatedFrom: 'deterministic_governance_kernel',
      randomUsed: false,
      timeDependency: false,
    },
    deterministic: true,
    generatedFrom: 'deterministic_governance_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Governance Registry From Input Composition
// ---------------------------------------------------------------------------

export function composeKnowledgeGovernanceRegistryFromInput(
  input: KnowledgeGovernanceInput,
): KnowledgeGovernanceRegistry {
  return composeKnowledgeGovernanceRegistry(input.profiles, input.relationships);
}

// ---------------------------------------------------------------------------
// Governance Composition (Main Entry Point)
// ---------------------------------------------------------------------------

export function composeKnowledgeGovernance(
  input: KnowledgeGovernanceInput,
): KnowledgeGovernanceRegistry {
  const decisions = input.profiles.map((profile) => {
    const errors = _validateGovernanceForDecision(profile);
    return _composeGovernanceDecision(profile.governanceId, profile.conceptId, errors.length === 0, errors);
  });

  const registry = composeKnowledgeGovernanceRegistry(input.profiles, input.relationships);

  return {
    ...registry,
    trace: composeKnowledgeGovernanceTrace({
      traceId: `_trace_${input.profiles.length}`,
      decisions,
      registryVersion: '1.0.0',
      compositionVersion: '1.0.0',
    }),
  };
}

function _validateGovernanceForDecision(
  profile: KnowledgeGovernanceProfile,
): readonly string[] {
  const errors: string[] = [];

  if (!profile.governanceId || profile.governanceId.trim() === '') {
    errors.push('GOVERNANCE_MISSING_PROFILE_ID');
  }

  if (!profile.title || profile.title.trim() === '') {
    errors.push('GOVERNANCE_MISSING_TITLE');
  }

  if (!profile.conceptId || profile.conceptId.trim() === '') {
    errors.push('GOVERNANCE_MISSING_CONCEPT_REFERENCE');
  }

  if (!CANONICAL_GOVERNANCE_STAGES.includes(profile.governanceStage)) {
    errors.push('GOVERNANCE_INVALID_STAGE');
  }

  if (!CANONICAL_GOVERNANCE_EVENTS.includes(profile.governanceEvent)) {
    errors.push('GOVERNANCE_INVALID_EVENT');
  }

  if (!CANONICAL_REVIEW_LEVELS.includes(profile.reviewLevel)) {
    errors.push('GOVERNANCE_INVALID_REVIEW');
  }

  if (!CANONICAL_GOVERNANCE_VISIBILITY.includes(profile.visibility)) {
    errors.push('GOVERNANCE_INVALID_VISIBILITY');
  }

  if (!CANONICAL_GOVERNANCE_STATUS.includes(profile.status)) {
    errors.push('GOVERNANCE_INVALID_STATUS');
  }

  if (!CANONICAL_GOVERNANCE_POLICY.includes(profile.policy)) {
    errors.push('GOVERNANCE_INVALID_POLICY');
  }

  if (!profile.provenance) {
    errors.push('GOVERNANCE_MISSING_PROVENANCE');
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Artifact With Governance Composition
// ---------------------------------------------------------------------------

export function composeKnowledgeArtifactWithGovernance(params: {
  readonly conceptId: string;
  readonly conceptTitle: string;
  readonly profiles: readonly KnowledgeGovernanceProfile[];
  readonly relationships: readonly KnowledgeGovernanceRelationship[];
  readonly provenance: KnowledgeGovernanceProvenance;
}): KnowledgeArtifactWithGovernance {
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

export function isSupportedGovernanceStage(
  value: string,
): value is GovernanceStage {
  return CANONICAL_GOVERNANCE_STAGES.includes(value as GovernanceStage);
}

export function isSupportedGovernanceEvent(
  value: string,
): value is GovernanceEvent {
  return CANONICAL_GOVERNANCE_EVENTS.includes(value as GovernanceEvent);
}

export function isSupportedReviewLevel(
  value: string,
): value is ReviewLevel {
  return CANONICAL_REVIEW_LEVELS.includes(value as ReviewLevel);
}

export function isSupportedGovernanceVisibility(
  value: string,
): value is GovernanceVisibility {
  return CANONICAL_GOVERNANCE_VISIBILITY.includes(value as GovernanceVisibility);
}

export function isSupportedGovernanceStatus(
  value: string,
): value is GovernanceStatus {
  return CANONICAL_GOVERNANCE_STATUS.includes(value as GovernanceStatus);
}

export function isSupportedGovernancePolicy(
  value: string,
): value is GovernancePolicy {
  return CANONICAL_GOVERNANCE_POLICY.includes(value as GovernancePolicy);
}

// ---------------------------------------------------------------------------
// Helper Functions — Canonical Getters
// ---------------------------------------------------------------------------

export function getCanonicalGovernanceStages(): readonly GovernanceStage[] {
  return CANONICAL_GOVERNANCE_STAGES;
}

export function getCanonicalGovernanceEvents(): readonly GovernanceEvent[] {
  return CANONICAL_GOVERNANCE_EVENTS;
}

export function getCanonicalReviewLevels(): readonly ReviewLevel[] {
  return CANONICAL_REVIEW_LEVELS;
}

export function getCanonicalGovernanceVisibility(): readonly GovernanceVisibility[] {
  return CANONICAL_GOVERNANCE_VISIBILITY;
}

export function getCanonicalGovernanceStatuses(): readonly GovernanceStatus[] {
  return CANONICAL_GOVERNANCE_STATUS;
}

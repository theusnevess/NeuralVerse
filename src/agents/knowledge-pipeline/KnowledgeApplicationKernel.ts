/**
 * D10-OPT-11 — Application Metadata Kernel
 *
 * Deterministic orchestration functions for application metadata.
 * Produces application profiles, relationships, traces, and registries.
 *
 * This module never:
 * - Executes applications
 * - Recommends technologies
 * - Generates projects
 * - Produces implementation plans
 * - Executes code
 * - Runs containers
 * - Uses Docker
 * - Uses Kubernetes
 * - Uses Terraform
 * - Provisions cloud resources
 * - Recommends frameworks
 * - Plans implementations
 * - Executes workflows
 * - Invokes LLMs
 * - Accesses filesystem
 * - Performs network requests
 *
 * Application metadata only.
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import type {
  KnowledgeApplicationProfile,
  KnowledgeApplicationProvenance,
  KnowledgeApplicationDecision,
  KnowledgeApplicationTrace,
  KnowledgeApplicationRegistry,
  KnowledgeApplicationRegistryMetadata,
  KnowledgeApplicationInput,
  KnowledgeApplicationRelationship,
  KnowledgeArtifactWithApplications,
  ApplicationType,
  ApplicationObjective,
  ApplicationDomain,
  ApplicationVisibility,
  ApplicationStatus,
  ApplicationGovernance,
} from './KnowledgeAgentContract.ts';

import {
  CANONICAL_APPLICATION_TYPES,
  CANONICAL_APPLICATION_OBJECTIVES,
  CANONICAL_APPLICATION_DOMAINS,
  CANONICAL_APPLICATION_STATUS,
  CANONICAL_APPLICATION_VISIBILITY,
  CANONICAL_APPLICATION_GOVERNANCE,
} from './KnowledgeAgentContract.ts';

// ---------------------------------------------------------------------------
// Application Provenance Composition
// ---------------------------------------------------------------------------

export function composeKnowledgeApplicationProvenance(params: {
  readonly source: string;
  readonly provider: string;
  readonly rationale: string;
  readonly governance: ApplicationGovernance;
}): KnowledgeApplicationProvenance {
  return {
    source: params.source,
    provider: params.provider,
    rationale: params.rationale,
    governance: params.governance,
  };
}

// ---------------------------------------------------------------------------
// Application Decision Composition
// ---------------------------------------------------------------------------

function _composeApplicationDecision(
  applicationId: string,
  conceptId: string,
  validationPassed: boolean,
  validationErrors: readonly string[],
): KnowledgeApplicationDecision {
  return {
    decisionId: `_decision_${applicationId}`,
    applicationId,
    conceptId,
    validationPassed,
    validationErrors,
  };
}

// ---------------------------------------------------------------------------
// Application Trace Composition
// ---------------------------------------------------------------------------

export function composeKnowledgeApplicationTrace(params: {
  readonly traceId: string;
  readonly decisions: readonly KnowledgeApplicationDecision[];
  readonly registryVersion: string;
  readonly compositionVersion: string;
}): KnowledgeApplicationTrace {
  return {
    traceId: params.traceId,
    decisionCount: params.decisions.length,
    validationCount: params.decisions.filter((d) => d.validationPassed).length,
    registryVersion: params.registryVersion,
    compositionVersion: params.compositionVersion,
    decisions: params.decisions,
    deterministic: true,
    generatedFrom: 'deterministic_application_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Application Profile Composition
// ---------------------------------------------------------------------------

export function composeKnowledgeApplicationProfile(params: {
  readonly applicationId: string;
  readonly conceptId: string;
  readonly title: string;
  readonly applicationType: ApplicationType;
  readonly applicationObjective: ApplicationObjective;
  readonly applicationDomain: ApplicationDomain;
  readonly industrySector: string;
  readonly deploymentContext: string;
  readonly implementationScope: string;
  readonly visibility: ApplicationVisibility;
  readonly status: ApplicationStatus;
  readonly governance: ApplicationGovernance;
  readonly tags: readonly string[];
  readonly provenance: KnowledgeApplicationProvenance;
}): KnowledgeApplicationProfile {
  return {
    applicationId: params.applicationId,
    conceptId: params.conceptId,
    title: params.title,
    applicationType: params.applicationType,
    applicationObjective: params.applicationObjective,
    applicationDomain: params.applicationDomain,
    industrySector: params.industrySector,
    deploymentContext: params.deploymentContext,
    implementationScope: params.implementationScope,
    visibility: params.visibility,
    status: params.status,
    governance: params.governance,
    tags: [...params.tags],
    provenance: params.provenance,
  };
}

// ---------------------------------------------------------------------------
// Application Relationship Composition
// ---------------------------------------------------------------------------

export function composeKnowledgeApplicationRelationship(params: {
  readonly relationshipId: string;
  readonly sourceApplicationId: string;
  readonly targetApplicationId: string;
  readonly relationshipType: 'prerequisite' | 'extension' | 'alternative' | 'complement';
  readonly description: string;
  readonly provenance: KnowledgeApplicationProvenance;
}): KnowledgeApplicationRelationship {
  return {
    relationshipId: params.relationshipId,
    sourceApplicationId: params.sourceApplicationId,
    targetApplicationId: params.targetApplicationId,
    relationshipType: params.relationshipType,
    description: params.description,
    provenance: params.provenance,
  };
}

// ---------------------------------------------------------------------------
// Deterministic Sort Comparator
// ---------------------------------------------------------------------------

function _compareKnowledgeApplicationProfile(
  a: KnowledgeApplicationProfile,
  b: KnowledgeApplicationProfile,
): number {
  if (a.conceptId < b.conceptId) return -1;
  if (a.conceptId > b.conceptId) return 1;

  if (a.applicationDomain < b.applicationDomain) return -1;
  if (a.applicationDomain > b.applicationDomain) return 1;

  if (a.applicationType < b.applicationType) return -1;
  if (a.applicationType > b.applicationType) return 1;

  if (a.applicationId < b.applicationId) return -1;
  if (a.applicationId > b.applicationId) return 1;

  return 0;
}

function _compareKnowledgeApplicationRelationship(
  a: KnowledgeApplicationRelationship,
  b: KnowledgeApplicationRelationship,
): number {
  if (a.relationshipId < b.relationshipId) return -1;
  if (a.relationshipId > b.relationshipId) return 1;

  return 0;
}

// ---------------------------------------------------------------------------
// Application Registry Composition
// ---------------------------------------------------------------------------

export function composeKnowledgeApplicationRegistry(
  profiles: readonly KnowledgeApplicationProfile[],
  relationships: readonly KnowledgeApplicationRelationship[],
): KnowledgeApplicationRegistry {
  const sortedProfiles = [...profiles].sort(_compareKnowledgeApplicationProfile);
  const sortedRelationships = [...relationships].sort(_compareKnowledgeApplicationRelationship);

  const concepts = new Set(sortedProfiles.map((p) => p.conceptId));
  const domains = new Set(sortedProfiles.map((p) => p.applicationDomain));

  const metadata: KnowledgeApplicationRegistryMetadata = {
    registryId: `_registry_${sortedProfiles.length}`,
    applicationCount: sortedProfiles.length,
    relationshipCount: sortedRelationships.length,
    conceptCount: concepts.size,
    domainCount: domains.size,
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
      generatedFrom: 'deterministic_application_kernel',
      randomUsed: false,
      timeDependency: false,
    },
    deterministic: true,
    generatedFrom: 'deterministic_application_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Application Registry From Input Composition
// ---------------------------------------------------------------------------

export function composeKnowledgeApplicationRegistryFromInput(
  input: KnowledgeApplicationInput,
): KnowledgeApplicationRegistry {
  return composeKnowledgeApplicationRegistry(input.profiles, input.relationships);
}

// ---------------------------------------------------------------------------
// Application Composition (Main Entry Point)
// ---------------------------------------------------------------------------

export function composeKnowledgeApplications(
  input: KnowledgeApplicationInput,
): KnowledgeApplicationRegistry {
  const decisions = input.profiles.map((profile) => {
    const errors = _validateApplicationForDecision(profile);
    return _composeApplicationDecision(profile.applicationId, profile.conceptId, errors.length === 0, errors);
  });

  const registry = composeKnowledgeApplicationRegistry(input.profiles, input.relationships);

  return {
    ...registry,
    trace: composeKnowledgeApplicationTrace({
      traceId: `_trace_${input.profiles.length}`,
      decisions,
      registryVersion: '1.0.0',
      compositionVersion: '1.0.0',
    }),
  };
}

function _validateApplicationForDecision(
  profile: KnowledgeApplicationProfile,
): readonly string[] {
  const errors: string[] = [];

  if (!profile.applicationId || profile.applicationId.trim() === '') {
    errors.push('APPLICATION_MISSING_PROFILE_ID');
  }

  if (!profile.title || profile.title.trim() === '') {
    errors.push('APPLICATION_MISSING_TITLE');
  }

  if (!profile.conceptId || profile.conceptId.trim() === '') {
    errors.push('APPLICATION_MISSING_CONCEPT_REFERENCE');
  }

  if (!CANONICAL_APPLICATION_TYPES.includes(profile.applicationType)) {
    errors.push('APPLICATION_INVALID_TYPE');
  }

  if (!CANONICAL_APPLICATION_OBJECTIVES.includes(profile.applicationObjective)) {
    errors.push('APPLICATION_INVALID_OBJECTIVE');
  }

  if (!CANONICAL_APPLICATION_DOMAINS.includes(profile.applicationDomain)) {
    errors.push('APPLICATION_INVALID_DOMAIN');
  }

  if (!CANONICAL_APPLICATION_VISIBILITY.includes(profile.visibility)) {
    errors.push('APPLICATION_INVALID_VISIBILITY');
  }

  if (!CANONICAL_APPLICATION_STATUS.includes(profile.status)) {
    errors.push('APPLICATION_INVALID_STATUS');
  }

  if (!CANONICAL_APPLICATION_GOVERNANCE.includes(profile.governance)) {
    errors.push('APPLICATION_INVALID_GOVERNANCE');
  }

  if (!profile.provenance) {
    errors.push('APPLICATION_MISSING_PROVENANCE');
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Artifact With Applications Composition
// ---------------------------------------------------------------------------

export function composeKnowledgeArtifactWithApplications(params: {
  readonly conceptId: string;
  readonly conceptTitle: string;
  readonly profiles: readonly KnowledgeApplicationProfile[];
  readonly relationships: readonly KnowledgeApplicationRelationship[];
  readonly provenance: KnowledgeApplicationProvenance;
}): KnowledgeArtifactWithApplications {
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

export function isSupportedApplicationType(
  value: string,
): value is ApplicationType {
  return CANONICAL_APPLICATION_TYPES.includes(value as ApplicationType);
}

export function isSupportedApplicationObjective(
  value: string,
): value is ApplicationObjective {
  return CANONICAL_APPLICATION_OBJECTIVES.includes(value as ApplicationObjective);
}

export function isSupportedApplicationDomain(
  value: string,
): value is ApplicationDomain {
  return CANONICAL_APPLICATION_DOMAINS.includes(value as ApplicationDomain);
}

export function isSupportedApplicationVisibility(
  value: string,
): value is ApplicationVisibility {
  return CANONICAL_APPLICATION_VISIBILITY.includes(value as ApplicationVisibility);
}

export function isSupportedApplicationStatus(
  value: string,
): value is ApplicationStatus {
  return CANONICAL_APPLICATION_STATUS.includes(value as ApplicationStatus);
}

export function isSupportedApplicationGovernance(
  value: string,
): value is ApplicationGovernance {
  return CANONICAL_APPLICATION_GOVERNANCE.includes(value as ApplicationGovernance);
}

// ---------------------------------------------------------------------------
// Helper Functions — Canonical Getters
// ---------------------------------------------------------------------------

export function getCanonicalApplicationTypes(): readonly ApplicationType[] {
  return CANONICAL_APPLICATION_TYPES;
}

export function getCanonicalApplicationObjectives(): readonly ApplicationObjective[] {
  return CANONICAL_APPLICATION_OBJECTIVES;
}

export function getCanonicalApplicationDomains(): readonly ApplicationDomain[] {
  return CANONICAL_APPLICATION_DOMAINS;
}

export function getCanonicalApplicationVisibility(): readonly ApplicationVisibility[] {
  return CANONICAL_APPLICATION_VISIBILITY;
}

export function getCanonicalApplicationStatuses(): readonly ApplicationStatus[] {
  return CANONICAL_APPLICATION_STATUS;
}

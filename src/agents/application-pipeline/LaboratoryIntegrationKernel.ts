/**
 * NV-1900-D7-OPT-06 — Laboratory Application Integration Kernel
 *
 * Deterministic orchestration functions for laboratory integration metadata.
 * Produces integrations, evidence references, relationships, traces, and registries.
 *
 * This module never:
 * - Executes laboratories
 * - Creates laboratories
 * - Schedules laboratories
 * - Evaluates laboratory results
 * - Stores educational content
 * - Generates markdown
 * - Accesses filesystem
 * - Performs network requests
 * - Calls external APIs
 *
 * Laboratory integration metadata only.
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import type {
  ApplicationLaboratoryIntegration,
  LaboratoryIntegrationProvenance,
  LaboratoryEvidenceReference,
  LaboratoryIntegrationRelationship,
  LaboratoryIntegrationDecision,
  LaboratoryIntegrationTrace,
  LaboratoryIntegrationRegistry,
  LaboratoryIntegrationRegistryMetadata,
  LaboratoryIntegrationInput,
  LaboratoryIntegrationType,
  LaboratoryMappingType,
  LaboratoryObjectiveType,
  LaboratoryEvidenceType,
  LaboratoryIntegrationStatus,
  ApplicationGovernanceStatus,
  ApplicationNode,
  ApplicationArtifactWithLaboratories,
} from './ApplicationAgentContract.ts';

import {
  CANONICAL_LABORATORY_INTEGRATION_TYPES,
  CANONICAL_LABORATORY_MAPPING_TYPES,
  CANONICAL_LABORATORY_OBJECTIVE_TYPES,
  CANONICAL_LABORATORY_EVIDENCE_TYPES,
  CANONICAL_LABORATORY_INTEGRATION_STATUS,
  CANONICAL_APPLICATION_GOVERNANCE,
} from './ApplicationAgentContract.ts';

// ---------------------------------------------------------------------------
// Laboratory Integration Provenance Composition
// ---------------------------------------------------------------------------

export function composeLaboratoryIntegrationProvenance(params: {
  readonly providedBy: string;
  readonly rationale: string;
  readonly reviewedBy: string;
  readonly reviewDate: string;
  readonly governanceStatus: ApplicationGovernanceStatus;
}): LaboratoryIntegrationProvenance {
  return {
    providedBy: params.providedBy,
    rationale: params.rationale,
    reviewedBy: params.reviewedBy,
    reviewDate: params.reviewDate,
    governanceStatus: params.governanceStatus,
  };
}

// ---------------------------------------------------------------------------
// Application Laboratory Integration Composition
// ---------------------------------------------------------------------------

export function composeApplicationLaboratoryIntegration(params: {
  readonly integrationId: string;
  readonly title: string;
  readonly description: string;
  readonly applicationArtifactId: string;
  readonly knowledgeArtifactId: string;
  readonly laboratoryId: string;
  readonly integrationType: LaboratoryIntegrationType;
  readonly mappingType: LaboratoryMappingType;
  readonly objectiveType: LaboratoryObjectiveType;
  readonly status: LaboratoryIntegrationStatus;
  readonly provenance: LaboratoryIntegrationProvenance;
}): ApplicationLaboratoryIntegration {
  return {
    integrationId: params.integrationId,
    title: params.title,
    description: params.description,
    applicationArtifactId: params.applicationArtifactId,
    knowledgeArtifactId: params.knowledgeArtifactId,
    laboratoryId: params.laboratoryId,
    integrationType: params.integrationType,
    mappingType: params.mappingType,
    objectiveType: params.objectiveType,
    status: params.status,
    provenance: params.provenance,
  };
}

// ---------------------------------------------------------------------------
// Laboratory Evidence Reference Composition
// ---------------------------------------------------------------------------

export function composeLaboratoryEvidenceReference(params: {
  readonly evidenceId: string;
  readonly integrationId: string;
  readonly evidenceType: LaboratoryEvidenceType;
  readonly description: string;
  readonly laboratoryArtifactReference: string;
  readonly provenance: LaboratoryIntegrationProvenance;
}): LaboratoryEvidenceReference {
  return {
    evidenceId: params.evidenceId,
    integrationId: params.integrationId,
    evidenceType: params.evidenceType,
    description: params.description,
    laboratoryArtifactReference: params.laboratoryArtifactReference,
    provenance: params.provenance,
  };
}

// ---------------------------------------------------------------------------
// Laboratory Integration Relationship Composition
// ---------------------------------------------------------------------------

export function composeLaboratoryIntegrationRelationship(params: {
  readonly relationshipId: string;
  readonly sourceIntegrationId: string;
  readonly targetIntegrationId: string;
  readonly relationshipType: string;
  readonly provenance: LaboratoryIntegrationProvenance;
}): LaboratoryIntegrationRelationship {
  return {
    relationshipId: params.relationshipId,
    sourceIntegrationId: params.sourceIntegrationId,
    targetIntegrationId: params.targetIntegrationId,
    relationshipType: params.relationshipType,
    provenance: params.provenance,
  };
}

// ---------------------------------------------------------------------------
// Laboratory Integration Decision Composition
// ---------------------------------------------------------------------------

function _composeLaboratoryIntegrationDecision(
  integrationId: string,
  validationPassed: boolean,
  validationErrors: readonly string[],
): LaboratoryIntegrationDecision {
  return {
    decisionId: `_decision_${integrationId}`,
    integrationId,
    validationPassed,
    validationErrors,
  };
}

// ---------------------------------------------------------------------------
// Laboratory Integration Trace Composition
// ---------------------------------------------------------------------------

export function composeLaboratoryIntegrationTrace(params: {
  readonly traceId: string;
  readonly decisions: readonly LaboratoryIntegrationDecision[];
  readonly registryVersion: string;
  readonly compositionVersion: string;
}): LaboratoryIntegrationTrace {
  return {
    traceId: params.traceId,
    decisionCount: params.decisions.length,
    validationCount: params.decisions.filter((d) => d.validationPassed).length,
    registryVersion: params.registryVersion,
    compositionVersion: params.compositionVersion,
    decisions: params.decisions,
    deterministic: true,
    generatedFrom: 'deterministic_laboratory_integration_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Deterministic Sort Comparators
// ---------------------------------------------------------------------------

function _compareIntegration(
  a: ApplicationLaboratoryIntegration,
  b: ApplicationLaboratoryIntegration,
): number {
  if (a.integrationId < b.integrationId) return -1;
  if (a.integrationId > b.integrationId) return 1;
  if (a.integrationType < b.integrationType) return -1;
  if (a.integrationType > b.integrationType) return 1;
  if (a.title < b.title) return -1;
  if (a.title > b.title) return 1;
  return 0;
}

function _compareEvidence(
  a: LaboratoryEvidenceReference,
  b: LaboratoryEvidenceReference,
): number {
  if (a.integrationId < b.integrationId) return -1;
  if (a.integrationId > b.integrationId) return 1;
  if (a.evidenceType < b.evidenceType) return -1;
  if (a.evidenceType > b.evidenceType) return 1;
  if (a.evidenceId < b.evidenceId) return -1;
  if (a.evidenceId > b.evidenceId) return 1;
  return 0;
}

function _compareRelationship(
  a: LaboratoryIntegrationRelationship,
  b: LaboratoryIntegrationRelationship,
): number {
  if (a.sourceIntegrationId < b.sourceIntegrationId) return -1;
  if (a.sourceIntegrationId > b.sourceIntegrationId) return 1;
  if (a.relationshipId < b.relationshipId) return -1;
  if (a.relationshipId > b.relationshipId) return 1;
  return 0;
}

// ---------------------------------------------------------------------------
// Laboratory Integration Registry Composition
// ---------------------------------------------------------------------------

export function composeLaboratoryIntegrationRegistry(
  integrations: readonly ApplicationLaboratoryIntegration[],
  evidenceReferences: readonly LaboratoryEvidenceReference[],
  relationships: readonly LaboratoryIntegrationRelationship[],
): LaboratoryIntegrationRegistry {
  const sortedIntegrations = [...integrations].sort(_compareIntegration);
  const sortedEvidence = [...evidenceReferences].sort(_compareEvidence);
  const sortedRelationships = [...relationships].sort(_compareRelationship);

  const types = new Set(sortedIntegrations.map((i) => i.integrationType));

  const metadata: LaboratoryIntegrationRegistryMetadata = {
    registryId: `_registry_${sortedIntegrations.length}_${sortedEvidence.length}_${sortedRelationships.length}`,
    integrationCount: sortedIntegrations.length,
    evidenceCount: sortedEvidence.length,
    relationshipCount: sortedRelationships.length,
    typeCount: types.size,
  };

  return {
    registryId: metadata.registryId,
    integrations: sortedIntegrations,
    evidenceReferences: sortedEvidence,
    relationships: sortedRelationships,
    metadata,
    trace: {
      traceId: `_trace_${sortedIntegrations.length}`,
      decisionCount: 0,
      validationCount: 0,
      registryVersion: '1.0.0',
      compositionVersion: '1.0.0',
      decisions: [],
      deterministic: true,
      generatedFrom: 'deterministic_laboratory_integration_kernel',
      randomUsed: false,
      timeDependency: false,
    },
    deterministic: true,
    generatedFrom: 'deterministic_laboratory_integration_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Laboratory Integration Registry From Input Composition
// ---------------------------------------------------------------------------

export function composeLaboratoryIntegrationRegistryFromInput(
  input: LaboratoryIntegrationInput,
): LaboratoryIntegrationRegistry {
  return composeLaboratoryIntegrationRegistry(
    input.integrations,
    input.evidenceReferences,
    input.relationships,
  );
}

// ---------------------------------------------------------------------------
// Laboratory Integration Composition (Main Entry Point)
// ---------------------------------------------------------------------------

export function composeApplicationLaboratoryIntegrations(
  input: LaboratoryIntegrationInput,
): LaboratoryIntegrationRegistry {
  const decisions = input.integrations.map((integration) => {
    const errors = _validateIntegrationForDecision(integration);
    return _composeLaboratoryIntegrationDecision(integration.integrationId, errors.length === 0, errors);
  });

  const registry = composeLaboratoryIntegrationRegistry(
    input.integrations,
    input.evidenceReferences,
    input.relationships,
  );

  return {
    ...registry,
    trace: composeLaboratoryIntegrationTrace({
      traceId: `_trace_${input.integrations.length}`,
      decisions,
      registryVersion: '1.0.0',
      compositionVersion: '1.0.0',
    }),
  };
}

// ---------------------------------------------------------------------------
// Application Artifact with Laboratories Composition
// ---------------------------------------------------------------------------

export function composeApplicationArtifactWithLaboratories(params: {
  readonly applicationNode: ApplicationNode;
  readonly laboratoryIntegrationRegistry: LaboratoryIntegrationRegistry;
}): ApplicationArtifactWithLaboratories {
  return {
    applicationNode: { ...params.applicationNode },
    laboratoryIntegrationRegistry: { ...params.laboratoryIntegrationRegistry },
    deterministic: true,
    generatedFrom: 'deterministic_laboratory_integration_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Laboratory Integration Decision Validation
// ---------------------------------------------------------------------------

function _validateIntegrationForDecision(
  integration: ApplicationLaboratoryIntegration,
): readonly string[] {
  const errors: string[] = [];

  if (!integration.integrationId || integration.integrationId.trim() === '') {
    errors.push('LAB_INTEGRATION_MISSING_INTEGRATION_ID');
  }

  if (!integration.title || integration.title.trim() === '') {
    errors.push('LAB_INTEGRATION_MISSING_TITLE');
  }

  if (!CANONICAL_LABORATORY_INTEGRATION_TYPES.includes(integration.integrationType)) {
    errors.push('LAB_INTEGRATION_INVALID_TYPE');
  }

  if (!CANONICAL_LABORATORY_MAPPING_TYPES.includes(integration.mappingType)) {
    errors.push('LAB_INTEGRATION_INVALID_MAPPING');
  }

  if (!CANONICAL_LABORATORY_OBJECTIVE_TYPES.includes(integration.objectiveType)) {
    errors.push('LAB_INTEGRATION_INVALID_OBJECTIVE');
  }

  if (!CANONICAL_LABORATORY_INTEGRATION_STATUS.includes(integration.status)) {
    errors.push('LAB_INTEGRATION_INVALID_STATUS');
  }

  if (!integration.provenance) {
    errors.push('LAB_INTEGRATION_MISSING_PROVENANCE');
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Helper Functions — Type Guards
// ---------------------------------------------------------------------------

export function isSupportedLaboratoryIntegrationType(
  integrationType: string,
): integrationType is LaboratoryIntegrationType {
  return CANONICAL_LABORATORY_INTEGRATION_TYPES.includes(integrationType as LaboratoryIntegrationType);
}

export function isSupportedLaboratoryMappingType(
  mappingType: string,
): mappingType is LaboratoryMappingType {
  return CANONICAL_LABORATORY_MAPPING_TYPES.includes(mappingType as LaboratoryMappingType);
}

export function isSupportedLaboratoryObjectiveType(
  objectiveType: string,
): objectiveType is LaboratoryObjectiveType {
  return CANONICAL_LABORATORY_OBJECTIVE_TYPES.includes(objectiveType as LaboratoryObjectiveType);
}

export function isSupportedLaboratoryEvidenceType(
  evidenceType: string,
): evidenceType is LaboratoryEvidenceType {
  return CANONICAL_LABORATORY_EVIDENCE_TYPES.includes(evidenceType as LaboratoryEvidenceType);
}

export function isSupportedLaboratoryIntegrationStatus(
  status: string,
): status is LaboratoryIntegrationStatus {
  return CANONICAL_LABORATORY_INTEGRATION_STATUS.includes(status as LaboratoryIntegrationStatus);
}

export function isSupportedLaboratoryIntegrationGovernance(
  governanceStatus: string,
): governanceStatus is ApplicationGovernanceStatus {
  return CANONICAL_APPLICATION_GOVERNANCE.includes(
    governanceStatus as ApplicationGovernanceStatus,
  );
}

// ---------------------------------------------------------------------------
// Helper Functions — Canonical Getters
// ---------------------------------------------------------------------------

export function getCanonicalLaboratoryIntegrationTypes(): readonly LaboratoryIntegrationType[] {
  return CANONICAL_LABORATORY_INTEGRATION_TYPES;
}

export function getCanonicalLaboratoryMappingTypes(): readonly LaboratoryMappingType[] {
  return CANONICAL_LABORATORY_MAPPING_TYPES;
}

export function getCanonicalLaboratoryObjectiveTypes(): readonly LaboratoryObjectiveType[] {
  return CANONICAL_LABORATORY_OBJECTIVE_TYPES;
}

export function getCanonicalLaboratoryEvidenceTypes(): readonly LaboratoryEvidenceType[] {
  return CANONICAL_LABORATORY_EVIDENCE_TYPES;
}

export function getCanonicalLaboratoryIntegrationStatuses(): readonly LaboratoryIntegrationStatus[] {
  return CANONICAL_LABORATORY_INTEGRATION_STATUS;
}

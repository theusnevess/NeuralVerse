/**
 * NV-1900-D7-OPT-06 — Laboratory Integration Validation Layer
 *
 * Deterministic validation for laboratory integration metadata.
 * Returns structured errors, never exceptions for expected validation failures.
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import type {
  ApplicationLaboratoryIntegration,
  LaboratoryEvidenceReference,
  LaboratoryIntegrationRelationship,
  LaboratoryIntegrationRegistry,
  LaboratoryIntegrationTrace,
  LaboratoryIntegrationInput,
  LaboratoryIntegrationValidationError,
  LaboratoryIntegrationRegistryValidationResult,
  LaboratoryIntegrationInputValidationResult,
  LaboratoryIntegrationTraceValidationResult,
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
// Validation Error Codes
// ---------------------------------------------------------------------------

export const LAB_INTEGRATION_VALIDATION_CODES = {
  LAB_INTEGRATION_DUPLICATE_ID: 'LAB_INTEGRATION_DUPLICATE_ID',
  LAB_INTEGRATION_DUPLICATE_TITLE: 'LAB_INTEGRATION_DUPLICATE_TITLE',
  LAB_INTEGRATION_EVIDENCE_DUPLICATE_ID: 'LAB_INTEGRATION_EVIDENCE_DUPLICATE_ID',
  LAB_INTEGRATION_RELATIONSHIP_DUPLICATE_ID: 'LAB_INTEGRATION_RELATIONSHIP_DUPLICATE_ID',
  LAB_INTEGRATION_INVALID_TYPE: 'LAB_INTEGRATION_INVALID_TYPE',
  LAB_INTEGRATION_INVALID_MAPPING: 'LAB_INTEGRATION_INVALID_MAPPING',
  LAB_INTEGRATION_INVALID_OBJECTIVE: 'LAB_INTEGRATION_INVALID_OBJECTIVE',
  LAB_INTEGRATION_INVALID_EVIDENCE: 'LAB_INTEGRATION_INVALID_EVIDENCE',
  LAB_INTEGRATION_INVALID_STATUS: 'LAB_INTEGRATION_INVALID_STATUS',
  LAB_INTEGRATION_INVALID_GOVERNANCE: 'LAB_INTEGRATION_INVALID_GOVERNANCE',
  LAB_INTEGRATION_MISSING_PROVENANCE: 'LAB_INTEGRATION_MISSING_PROVENANCE',
  LAB_INTEGRATION_MISSING_PROVIDER: 'LAB_INTEGRATION_MISSING_PROVIDER',
  LAB_INTEGRATION_MISSING_RATIONALE: 'LAB_INTEGRATION_MISSING_RATIONALE',
  LAB_INTEGRATION_MISSING_APPLICATION_REFERENCE: 'LAB_INTEGRATION_MISSING_APPLICATION_REFERENCE',
  LAB_INTEGRATION_MISSING_KNOWLEDGE_REFERENCE: 'LAB_INTEGRATION_MISSING_KNOWLEDGE_REFERENCE',
  LAB_INTEGRATION_MISSING_LABORATORY_REFERENCE: 'LAB_INTEGRATION_MISSING_LABORATORY_REFERENCE',
  LAB_INTEGRATION_MISSING_INTEGRATION_ID: 'LAB_INTEGRATION_MISSING_INTEGRATION_ID',
  LAB_INTEGRATION_MISSING_TITLE: 'LAB_INTEGRATION_MISSING_TITLE',
  LAB_INTEGRATION_SELF_RELATIONSHIP: 'LAB_INTEGRATION_SELF_RELATIONSHIP',
  LAB_INTEGRATION_EMPTY_REGISTRY: 'LAB_INTEGRATION_EMPTY_REGISTRY',
  LAB_INTEGRATION_INVALID_TRACE: 'LAB_INTEGRATION_INVALID_TRACE',
  LAB_INTEGRATION_REGISTRY_INCONSISTENCY: 'LAB_INTEGRATION_REGISTRY_INCONSISTENCY',
} as const;

// ---------------------------------------------------------------------------
// Single Integration Validation
// ---------------------------------------------------------------------------

export function validateApplicationLaboratoryIntegration(
  integration: ApplicationLaboratoryIntegration,
): readonly LaboratoryIntegrationValidationError[] {
  const errors: LaboratoryIntegrationValidationError[] = [];

  if (!integration.integrationId || integration.integrationId.trim() === '') {
    errors.push({
      code: LAB_INTEGRATION_VALIDATION_CODES.LAB_INTEGRATION_MISSING_INTEGRATION_ID,
      message: 'Application laboratory integration is missing an integration ID.',
      field: 'integrationId',
      integrationId: integration.integrationId,
    });
  }

  if (!integration.title || integration.title.trim() === '') {
    errors.push({
      code: LAB_INTEGRATION_VALIDATION_CODES.LAB_INTEGRATION_MISSING_TITLE,
      message: 'Application laboratory integration is missing a title.',
      field: 'title',
      integrationId: integration.integrationId,
    });
  }

  if (!CANONICAL_LABORATORY_INTEGRATION_TYPES.includes(integration.integrationType)) {
    errors.push({
      code: LAB_INTEGRATION_VALIDATION_CODES.LAB_INTEGRATION_INVALID_TYPE,
      message: `Application laboratory integration has unsupported type: "${integration.integrationType}".`,
      field: 'integrationType',
      integrationId: integration.integrationId,
    });
  }

  if (!CANONICAL_LABORATORY_MAPPING_TYPES.includes(integration.mappingType)) {
    errors.push({
      code: LAB_INTEGRATION_VALIDATION_CODES.LAB_INTEGRATION_INVALID_MAPPING,
      message: `Application laboratory integration has unsupported mapping type: "${integration.mappingType}".`,
      field: 'mappingType',
      integrationId: integration.integrationId,
    });
  }

  if (!CANONICAL_LABORATORY_OBJECTIVE_TYPES.includes(integration.objectiveType)) {
    errors.push({
      code: LAB_INTEGRATION_VALIDATION_CODES.LAB_INTEGRATION_INVALID_OBJECTIVE,
      message: `Application laboratory integration has unsupported objective type: "${integration.objectiveType}".`,
      field: 'objectiveType',
      integrationId: integration.integrationId,
    });
  }

  if (!CANONICAL_LABORATORY_INTEGRATION_STATUS.includes(integration.status)) {
    errors.push({
      code: LAB_INTEGRATION_VALIDATION_CODES.LAB_INTEGRATION_INVALID_STATUS,
      message: `Application laboratory integration has unsupported status: "${integration.status}".`,
      field: 'status',
      integrationId: integration.integrationId,
    });
  }

  if (!integration.applicationArtifactId || integration.applicationArtifactId.trim() === '') {
    errors.push({
      code: LAB_INTEGRATION_VALIDATION_CODES.LAB_INTEGRATION_MISSING_APPLICATION_REFERENCE,
      message: 'Application laboratory integration is missing applicationArtifactId.',
      field: 'applicationArtifactId',
      integrationId: integration.integrationId,
    });
  }

  if (!integration.knowledgeArtifactId || integration.knowledgeArtifactId.trim() === '') {
    errors.push({
      code: LAB_INTEGRATION_VALIDATION_CODES.LAB_INTEGRATION_MISSING_KNOWLEDGE_REFERENCE,
      message: 'Application laboratory integration is missing knowledgeArtifactId.',
      field: 'knowledgeArtifactId',
      integrationId: integration.integrationId,
    });
  }

  if (!integration.laboratoryId || integration.laboratoryId.trim() === '') {
    errors.push({
      code: LAB_INTEGRATION_VALIDATION_CODES.LAB_INTEGRATION_MISSING_LABORATORY_REFERENCE,
      message: 'Application laboratory integration is missing laboratoryId.',
      field: 'laboratoryId',
      integrationId: integration.integrationId,
    });
  }

  if (!integration.provenance) {
    errors.push({
      code: LAB_INTEGRATION_VALIDATION_CODES.LAB_INTEGRATION_MISSING_PROVENANCE,
      message: 'Application laboratory integration is missing provenance.',
      field: 'provenance',
      integrationId: integration.integrationId,
    });
  } else {
    if (!integration.provenance.providedBy || integration.provenance.providedBy.trim() === '') {
      errors.push({
        code: LAB_INTEGRATION_VALIDATION_CODES.LAB_INTEGRATION_MISSING_PROVIDER,
        message: 'Integration provenance is missing providedBy.',
        field: 'provenance.providedBy',
        integrationId: integration.integrationId,
      });
    }

    if (!integration.provenance.rationale || integration.provenance.rationale.trim() === '') {
      errors.push({
        code: LAB_INTEGRATION_VALIDATION_CODES.LAB_INTEGRATION_MISSING_RATIONALE,
        message: 'Integration provenance is missing rationale.',
        field: 'provenance.rationale',
        integrationId: integration.integrationId,
      });
    }

    if (!CANONICAL_APPLICATION_GOVERNANCE.includes(integration.provenance.governanceStatus)) {
      errors.push({
        code: LAB_INTEGRATION_VALIDATION_CODES.LAB_INTEGRATION_INVALID_GOVERNANCE,
        message: `Integration provenance has invalid governance status: "${integration.provenance.governanceStatus}".`,
        field: 'provenance.governanceStatus',
        integrationId: integration.integrationId,
      });
    }
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Laboratory Evidence Reference Validation
// ---------------------------------------------------------------------------

export function validateLaboratoryEvidenceReference(
  evidence: LaboratoryEvidenceReference,
): readonly LaboratoryIntegrationValidationError[] {
  const errors: LaboratoryIntegrationValidationError[] = [];

  if (!evidence.evidenceId || evidence.evidenceId.trim() === '') {
    errors.push({
      code: LAB_INTEGRATION_VALIDATION_CODES.LAB_INTEGRATION_EVIDENCE_DUPLICATE_ID,
      message: 'Laboratory evidence reference is missing an evidence ID.',
      field: 'evidenceId',
      evidenceId: evidence.evidenceId,
    });
  }

  if (!evidence.integrationId || evidence.integrationId.trim() === '') {
    errors.push({
      code: LAB_INTEGRATION_VALIDATION_CODES.LAB_INTEGRATION_EVIDENCE_DUPLICATE_ID,
      message: 'Laboratory evidence reference is missing an integration ID.',
      field: 'integrationId',
      evidenceId: evidence.evidenceId,
    });
  }

  if (!CANONICAL_LABORATORY_EVIDENCE_TYPES.includes(evidence.evidenceType)) {
    errors.push({
      code: LAB_INTEGRATION_VALIDATION_CODES.LAB_INTEGRATION_INVALID_EVIDENCE,
      message: `Laboratory evidence reference has unsupported type: "${evidence.evidenceType}".`,
      field: 'evidenceType',
      evidenceId: evidence.evidenceId,
    });
  }

  if (!evidence.provenance) {
    errors.push({
      code: LAB_INTEGRATION_VALIDATION_CODES.LAB_INTEGRATION_MISSING_PROVENANCE,
      message: 'Laboratory evidence reference is missing provenance.',
      field: 'provenance',
      evidenceId: evidence.evidenceId,
    });
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Laboratory Integration Relationship Validation
// ---------------------------------------------------------------------------

export function validateLaboratoryIntegrationRelationship(
  relationship: LaboratoryIntegrationRelationship,
  allIntegrationIds: readonly string[],
): readonly LaboratoryIntegrationValidationError[] {
  const errors: LaboratoryIntegrationValidationError[] = [];

  if (!relationship.relationshipId || relationship.relationshipId.trim() === '') {
    errors.push({
      code: LAB_INTEGRATION_VALIDATION_CODES.LAB_INTEGRATION_RELATIONSHIP_DUPLICATE_ID,
      message: 'Laboratory integration relationship is missing a relationship ID.',
      field: 'relationshipId',
      relationshipId: relationship.relationshipId,
    });
  }

  if (relationship.sourceIntegrationId === relationship.targetIntegrationId) {
    errors.push({
      code: LAB_INTEGRATION_VALIDATION_CODES.LAB_INTEGRATION_SELF_RELATIONSHIP,
      message: `Laboratory integration relationship references itself: "${relationship.sourceIntegrationId}".`,
      field: 'sourceIntegrationId',
      integrationId: relationship.sourceIntegrationId,
    });
  }

  if (relationship.sourceIntegrationId && !allIntegrationIds.includes(relationship.sourceIntegrationId)) {
    errors.push({
      code: LAB_INTEGRATION_VALIDATION_CODES.LAB_INTEGRATION_RELATIONSHIP_DUPLICATE_ID,
      message: `Laboratory integration relationship references unknown source: "${relationship.sourceIntegrationId}".`,
      field: 'sourceIntegrationId',
      integrationId: relationship.sourceIntegrationId,
    });
  }

  if (relationship.targetIntegrationId && !allIntegrationIds.includes(relationship.targetIntegrationId)) {
    errors.push({
      code: LAB_INTEGRATION_VALIDATION_CODES.LAB_INTEGRATION_RELATIONSHIP_DUPLICATE_ID,
      message: `Laboratory integration relationship references unknown target: "${relationship.targetIntegrationId}".`,
      field: 'targetIntegrationId',
      integrationId: relationship.targetIntegrationId,
    });
  }

  if (!relationship.provenance) {
    errors.push({
      code: LAB_INTEGRATION_VALIDATION_CODES.LAB_INTEGRATION_MISSING_PROVENANCE,
      message: 'Laboratory integration relationship is missing provenance.',
      field: 'provenance',
    });
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Laboratory Integration Registry Validation
// ---------------------------------------------------------------------------

export function validateLaboratoryIntegrationRegistry(
  registry: LaboratoryIntegrationRegistry,
): LaboratoryIntegrationRegistryValidationResult {
  const errors: LaboratoryIntegrationValidationError[] = [];

  if (!registry.registryId || registry.registryId.trim() === '') {
    errors.push({
      code: LAB_INTEGRATION_VALIDATION_CODES.LAB_INTEGRATION_EMPTY_REGISTRY,
      message: 'Registry is missing a registry ID.',
      field: 'registryId',
    });
  }

  if (!registry.integrations || registry.integrations.length === 0) {
    errors.push({
      code: LAB_INTEGRATION_VALIDATION_CODES.LAB_INTEGRATION_EMPTY_REGISTRY,
      message: 'Registry has no integrations.',
      field: 'integrations',
    });
  }

  if (registry.deterministic !== true) {
    errors.push({
      code: LAB_INTEGRATION_VALIDATION_CODES.LAB_INTEGRATION_INVALID_TRACE,
      message: 'Registry must declare deterministic: true.',
      field: 'deterministic',
    });
  }

  if (registry.randomUsed !== false) {
    errors.push({
      code: LAB_INTEGRATION_VALIDATION_CODES.LAB_INTEGRATION_INVALID_TRACE,
      message: 'Registry must declare randomUsed: false.',
      field: 'randomUsed',
    });
  }

  if (registry.timeDependency !== false) {
    errors.push({
      code: LAB_INTEGRATION_VALIDATION_CODES.LAB_INTEGRATION_INVALID_TRACE,
      message: 'Registry must declare timeDependency: false.',
      field: 'timeDependency',
    });
  }

  // Duplicate integration IDs
  const seenIds = new Set<string>();
  for (const int of registry.integrations) {
    if (seenIds.has(int.integrationId)) {
      errors.push({
        code: LAB_INTEGRATION_VALIDATION_CODES.LAB_INTEGRATION_DUPLICATE_ID,
        message: `Duplicate integration ID: "${int.integrationId}".`,
        integrationId: int.integrationId,
      });
    }
    seenIds.add(int.integrationId);
  }

  // Duplicate integration titles
  const seenTitles = new Set<string>();
  for (const int of registry.integrations) {
    if (seenTitles.has(int.title)) {
      errors.push({
        code: LAB_INTEGRATION_VALIDATION_CODES.LAB_INTEGRATION_DUPLICATE_TITLE,
        message: `Duplicate integration title: "${int.title}".`,
        field: 'title',
        integrationId: int.integrationId,
      });
    }
    seenTitles.add(int.title);
  }

  // Duplicate evidence IDs
  const seenEvIds = new Set<string>();
  for (const ev of registry.evidenceReferences) {
    if (seenEvIds.has(ev.evidenceId)) {
      errors.push({
        code: LAB_INTEGRATION_VALIDATION_CODES.LAB_INTEGRATION_EVIDENCE_DUPLICATE_ID,
        message: `Duplicate evidence ID: "${ev.evidenceId}".`,
        evidenceId: ev.evidenceId,
      });
    }
    seenEvIds.add(ev.evidenceId);
  }

  // Duplicate relationship IDs
  const seenRelIds = new Set<string>();
  for (const rel of registry.relationships) {
    if (seenRelIds.has(rel.relationshipId)) {
      errors.push({
        code: LAB_INTEGRATION_VALIDATION_CODES.LAB_INTEGRATION_RELATIONSHIP_DUPLICATE_ID,
        message: `Duplicate relationship ID: "${rel.relationshipId}".`,
        relationshipId: rel.relationshipId,
      });
    }
    seenRelIds.add(rel.relationshipId);
  }

  // Validate each integration
  for (const int of registry.integrations) {
    errors.push(...validateApplicationLaboratoryIntegration(int));
  }

  // Validate each evidence reference
  for (const ev of registry.evidenceReferences) {
    errors.push(...validateLaboratoryEvidenceReference(ev));
  }

  // Validate relationships
  const allIntegrationIds = registry.integrations.map((i) => i.integrationId);
  for (const rel of registry.relationships) {
    errors.push(...validateLaboratoryIntegrationRelationship(rel, allIntegrationIds));
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'laboratory_integration_registry_composition',
  };
}

// ---------------------------------------------------------------------------
// Laboratory Integration Input Validation
// ---------------------------------------------------------------------------

export function validateLaboratoryIntegrationInput(
  input: LaboratoryIntegrationInput,
): LaboratoryIntegrationInputValidationResult {
  const errors: LaboratoryIntegrationValidationError[] = [];

  if (!input.integrations || input.integrations.length === 0) {
    errors.push({
      code: LAB_INTEGRATION_VALIDATION_CODES.LAB_INTEGRATION_EMPTY_REGISTRY,
      message: 'Input has no integrations.',
      field: 'integrations',
    });
  } else {
    for (const int of input.integrations) {
      errors.push(...validateApplicationLaboratoryIntegration(int));
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'laboratory_integration_input_composition',
  };
}

// ---------------------------------------------------------------------------
// Laboratory Integration Trace Validation
// ---------------------------------------------------------------------------

export function validateLaboratoryIntegrationTrace(
  trace: LaboratoryIntegrationTrace,
): LaboratoryIntegrationTraceValidationResult {
  const errors: LaboratoryIntegrationValidationError[] = [];

  if (!trace.traceId || trace.traceId.trim() === '') {
    errors.push({
      code: LAB_INTEGRATION_VALIDATION_CODES.LAB_INTEGRATION_INVALID_TRACE,
      message: 'Laboratory integration trace is missing a trace ID.',
      field: 'traceId',
    });
  }

  if (trace.deterministic !== true) {
    errors.push({
      code: LAB_INTEGRATION_VALIDATION_CODES.LAB_INTEGRATION_INVALID_TRACE,
      message: 'Laboratory integration trace must declare deterministic: true.',
      field: 'deterministic',
    });
  }

  if (trace.randomUsed !== false) {
    errors.push({
      code: LAB_INTEGRATION_VALIDATION_CODES.LAB_INTEGRATION_INVALID_TRACE,
      message: 'Laboratory integration trace must declare randomUsed: false.',
      field: 'randomUsed',
    });
  }

  if (trace.timeDependency !== false) {
    errors.push({
      code: LAB_INTEGRATION_VALIDATION_CODES.LAB_INTEGRATION_INVALID_TRACE,
      message: 'Laboratory integration trace must declare timeDependency: false.',
      field: 'timeDependency',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'laboratory_integration_trace_composition',
  };
}

// ---------------------------------------------------------------------------
// Application Artifact with Laboratories Validation
// ---------------------------------------------------------------------------

export function validateApplicationArtifactWithLaboratories(
  registry: LaboratoryIntegrationRegistry,
): readonly LaboratoryIntegrationValidationError[] {
  const errors: LaboratoryIntegrationValidationError[] = [];
  const registryResult = validateLaboratoryIntegrationRegistry(registry);
  errors.push(...registryResult.errors);
  return errors;
}

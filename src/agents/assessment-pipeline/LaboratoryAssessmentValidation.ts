/**
 * NV-2000-D8-OPT-07 — Laboratory Assessment Validation Layer
 *
 * Deterministic validation for the Laboratory Assessment Kernel.
 * Returns structured errors, never exceptions for expected validation failures.
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import {
  type AssessmentArtifactWithLaboratories,
  type AssessmentArtifactWithLaboratoriesValidationResult,
  type AssessmentGovernanceLevel,
  type AssessmentLaboratoryIntegration,
  type LaboratoryAssessmentInput,
  type LaboratoryAssessmentInputValidationResult,
  type LaboratoryAssessmentProvenance,
  type LaboratoryAssessmentRegistry,
  type LaboratoryAssessmentRegistryValidationResult,
  type LaboratoryAssessmentRelationship,
  type LaboratoryAssessmentStatus,
  type LaboratoryAssessmentTrace,
  type LaboratoryAssessmentTraceValidationResult,
  type LaboratoryAssessmentValidationError,
  type LaboratoryAssessmentType,
  type LaboratoryEvidenceReference,
  type LaboratoryEvidenceType,
  type LaboratoryMappingType,
  type LaboratoryObjective,
  type LaboratoryObjectiveType,
  CANONICAL_ASSESSMENT_GOVERNANCE,
  CANONICAL_LAB_ASSESSMENT_STATUS,
  CANONICAL_LAB_ASSESSMENT_TYPES,
  CANONICAL_LAB_EVIDENCE_TYPES,
  CANONICAL_LAB_MAPPING_TYPES,
  CANONICAL_LAB_OBJECTIVE_TYPES,
} from './AssessmentAgentContract.ts';

// ============================================================================
// VALIDATION CODES — Stable forever (24 codes)
// ============================================================================

export const LAB_ASSESSMENT_VALIDATION_CODES = {
  LAB_ASSESSMENT_DUPLICATE_ID: 'LAB_ASSESSMENT_DUPLICATE_ID',
  LAB_ASSESSMENT_DUPLICATE_TITLE: 'LAB_ASSESSMENT_DUPLICATE_TITLE',
  LAB_EVIDENCE_DUPLICATE_ID: 'LAB_EVIDENCE_DUPLICATE_ID',
  LAB_OBJECTIVE_DUPLICATE_ID: 'LAB_OBJECTIVE_DUPLICATE_ID',
  LAB_RELATIONSHIP_DUPLICATE_ID: 'LAB_RELATIONSHIP_DUPLICATE_ID',
  LAB_INVALID_TYPE: 'LAB_INVALID_TYPE',
  LAB_INVALID_OBJECTIVE: 'LAB_INVALID_OBJECTIVE',
  LAB_INVALID_EVIDENCE: 'LAB_INVALID_EVIDENCE',
  LAB_INVALID_MAPPING: 'LAB_INVALID_MAPPING',
  LAB_INVALID_STATUS: 'LAB_INVALID_STATUS',
  LAB_INVALID_GOVERNANCE: 'LAB_INVALID_GOVERNANCE',
  LAB_MISSING_PROVENANCE: 'LAB_MISSING_PROVENANCE',
  LAB_MISSING_PROVIDER: 'LAB_MISSING_PROVIDER',
  LAB_MISSING_RATIONALE: 'LAB_MISSING_RATIONALE',
  LAB_MISSING_ASSESSMENT_REFERENCE: 'LAB_MISSING_ASSESSMENT_REFERENCE',
  LAB_MISSING_LABORATORY_REFERENCE: 'LAB_MISSING_LABORATORY_REFERENCE',
  LAB_MISSING_INTEGRATION_ID: 'LAB_MISSING_INTEGRATION_ID',
  LAB_MISSING_TITLE: 'LAB_MISSING_TITLE',
  LAB_SELF_RELATIONSHIP: 'LAB_SELF_RELATIONSHIP',
  LAB_EMPTY_REGISTRY: 'LAB_EMPTY_REGISTRY',
  LAB_INVALID_TRACE: 'LAB_INVALID_TRACE',
  LAB_REGISTRY_INCONSISTENCY: 'LAB_REGISTRY_INCONSISTENCY',
  LAB_INVALID_CONFIGURATION: 'LAB_INVALID_CONFIGURATION',
  LAB_INVALID_REFERENCE: 'LAB_INVALID_REFERENCE',
} as const;

// ============================================================================
// VALIDATION FUNCTIONS — Pure, never throw
// ============================================================================

/**
 * Validate a LaboratoryEvidenceReference.
 */
export function validateLaboratoryEvidenceReference(
  ref: LaboratoryEvidenceReference,
): readonly LaboratoryAssessmentValidationError[] {
  const errors: LaboratoryAssessmentValidationError[] = [];

  if (!ref.id || ref.id.trim() === '') {
    errors.push({
      code: LAB_ASSESSMENT_VALIDATION_CODES.LAB_EVIDENCE_DUPLICATE_ID,
      message: 'Evidence reference is missing a valid id.',
      field: 'id',
    });
  }

  if (!ref.evidenceType || !CANONICAL_LAB_EVIDENCE_TYPES.includes(ref.evidenceType)) {
    errors.push({
      code: LAB_ASSESSMENT_VALIDATION_CODES.LAB_INVALID_EVIDENCE,
      message: `Invalid evidence type: ${String(ref.evidenceType)}`,
      field: 'evidenceType',
      entityId: ref.id,
    });
  }

  if (!ref.laboratoryActivityId || ref.laboratoryActivityId.trim() === '') {
    errors.push({
      code: LAB_ASSESSMENT_VALIDATION_CODES.LAB_MISSING_LABORATORY_REFERENCE,
      message: 'Evidence reference is missing laboratoryActivityId.',
      field: 'laboratoryActivityId',
      entityId: ref.id,
    });
  }

  return errors;
}

/**
 * Validate a LaboratoryObjective.
 */
export function validateLaboratoryObjective(
  obj: LaboratoryObjective,
): readonly LaboratoryAssessmentValidationError[] {
  const errors: LaboratoryAssessmentValidationError[] = [];

  if (!obj.id || obj.id.trim() === '') {
    errors.push({
      code: LAB_ASSESSMENT_VALIDATION_CODES.LAB_OBJECTIVE_DUPLICATE_ID,
      message: 'Objective is missing a valid id.',
      field: 'id',
    });
  }

  if (!obj.objectiveType || !CANONICAL_LAB_OBJECTIVE_TYPES.includes(obj.objectiveType)) {
    errors.push({
      code: LAB_ASSESSMENT_VALIDATION_CODES.LAB_INVALID_OBJECTIVE,
      message: `Invalid objective type: ${String(obj.objectiveType)}`,
      field: 'objectiveType',
      entityId: obj.id,
    });
  }

  return errors;
}

/**
 * Validate a single AssessmentLaboratoryIntegration.
 * Returns structured errors. Never throws. Deterministic.
 */
export function validateAssessmentLaboratoryIntegration(
  integration: AssessmentLaboratoryIntegration,
): readonly LaboratoryAssessmentValidationError[] {
  const errors: LaboratoryAssessmentValidationError[] = [];

  if (!integration || typeof integration !== 'object') {
    errors.push({
      code: LAB_ASSESSMENT_VALIDATION_CODES.LAB_MISSING_INTEGRATION_ID,
      message: 'Integration is null or not an object.',
    });
    return errors;
  }

  if (!integration.id || typeof integration.id !== 'string' || integration.id.trim() === '') {
    errors.push({
      code: LAB_ASSESSMENT_VALIDATION_CODES.LAB_MISSING_INTEGRATION_ID,
      message: 'Integration is missing a valid id.',
      field: 'id',
      entityId: integration.id ?? 'unknown',
    });
  }

  if (!integration.title || typeof integration.title !== 'string' || integration.title.trim() === '') {
    errors.push({
      code: LAB_ASSESSMENT_VALIDATION_CODES.LAB_MISSING_TITLE,
      message: 'Integration is missing a valid title.',
      field: 'title',
      entityId: integration.id,
    });
  }

  if (!integration.labAssessmentType || !CANONICAL_LAB_ASSESSMENT_TYPES.includes(integration.labAssessmentType)) {
    errors.push({
      code: LAB_ASSESSMENT_VALIDATION_CODES.LAB_INVALID_TYPE,
      message: `Invalid lab assessment type: ${String(integration.labAssessmentType)}`,
      field: 'labAssessmentType',
      entityId: integration.id,
    });
  }

  if (!integration.mappingType || !CANONICAL_LAB_MAPPING_TYPES.includes(integration.mappingType)) {
    errors.push({
      code: LAB_ASSESSMENT_VALIDATION_CODES.LAB_INVALID_MAPPING,
      message: `Invalid mapping type: ${String(integration.mappingType)}`,
      field: 'mappingType',
      entityId: integration.id,
    });
  }

  if (!integration.laboratoryActivityId || integration.laboratoryActivityId.trim() === '') {
    errors.push({
      code: LAB_ASSESSMENT_VALIDATION_CODES.LAB_MISSING_LABORATORY_REFERENCE,
      message: 'Integration is missing laboratoryActivityId.',
      field: 'laboratoryActivityId',
      entityId: integration.id,
    });
  }

  if (!integration.objectives || !Array.isArray(integration.objectives)) {
    errors.push({
      code: LAB_ASSESSMENT_VALIDATION_CODES.LAB_INVALID_CONFIGURATION,
      message: 'Integration is missing objectives array.',
      field: 'objectives',
      entityId: integration.id,
    });
  } else {
    for (const obj of integration.objectives) {
      const objErrors = validateLaboratoryObjective(obj);
      errors.push(...objErrors);
    }
  }

  if (!integration.evidenceReferences || !Array.isArray(integration.evidenceReferences)) {
    errors.push({
      code: LAB_ASSESSMENT_VALIDATION_CODES.LAB_INVALID_CONFIGURATION,
      message: 'Integration is missing evidenceReferences array.',
      field: 'evidenceReferences',
      entityId: integration.id,
    });
  } else {
    for (const ref of integration.evidenceReferences) {
      const refErrors = validateLaboratoryEvidenceReference(ref);
      errors.push(...refErrors);
    }
  }

  if (!integration.conceptIds || !Array.isArray(integration.conceptIds) || integration.conceptIds.length === 0) {
    errors.push({
      code: LAB_ASSESSMENT_VALIDATION_CODES.LAB_MISSING_ASSESSMENT_REFERENCE,
      message: 'Integration is missing conceptIds.',
      field: 'conceptIds',
      entityId: integration.id,
    });
  }

  if (!integration.status || !CANONICAL_LAB_ASSESSMENT_STATUS.includes(integration.status)) {
    errors.push({
      code: LAB_ASSESSMENT_VALIDATION_CODES.LAB_INVALID_STATUS,
      message: `Invalid status: ${String(integration.status)}`,
      field: 'status',
      entityId: integration.id,
    });
  }

  if (!integration.governance || !CANONICAL_ASSESSMENT_GOVERNANCE.includes(integration.governance)) {
    errors.push({
      code: LAB_ASSESSMENT_VALIDATION_CODES.LAB_INVALID_GOVERNANCE,
      message: `Invalid governance: ${String(integration.governance)}`,
      field: 'governance',
      entityId: integration.id,
    });
  }

  if (!integration.provenance || typeof integration.provenance !== 'object') {
    errors.push({
      code: LAB_ASSESSMENT_VALIDATION_CODES.LAB_MISSING_PROVENANCE,
      message: 'Integration is missing provenance.',
      field: 'provenance',
      entityId: integration.id,
    });
  } else {
    if (!integration.provenance.provider || integration.provenance.provider.trim() === '') {
      errors.push({
        code: LAB_ASSESSMENT_VALIDATION_CODES.LAB_MISSING_PROVIDER,
        message: 'Provenance is missing a valid provider.',
        field: 'provenance.provider',
        entityId: integration.id,
      });
    }
    if (!integration.provenance.rationale || integration.provenance.rationale.trim() === '') {
      errors.push({
        code: LAB_ASSESSMENT_VALIDATION_CODES.LAB_MISSING_RATIONALE,
        message: 'Provenance is missing a valid rationale.',
        field: 'provenance.rationale',
        entityId: integration.id,
      });
    }
  }

  if (!integration.trace || typeof integration.trace !== 'object') {
    errors.push({
      code: LAB_ASSESSMENT_VALIDATION_CODES.LAB_INVALID_TRACE,
      message: 'Integration is missing trace metadata.',
      field: 'trace',
      entityId: integration.id,
    });
  } else {
    if (integration.trace.deterministic !== true) {
      errors.push({
        code: LAB_ASSESSMENT_VALIDATION_CODES.LAB_INVALID_TRACE,
        message: 'Trace must declare deterministic: true.',
        field: 'trace.deterministic',
        entityId: integration.id,
      });
    }
    if (integration.trace.randomUsed !== false) {
      errors.push({
        code: LAB_ASSESSMENT_VALIDATION_CODES.LAB_INVALID_TRACE,
        message: 'Trace must declare randomUsed: false.',
        field: 'trace.randomUsed',
        entityId: integration.id,
      });
    }
    if (integration.trace.timeDependency !== false) {
      errors.push({
        code: LAB_ASSESSMENT_VALIDATION_CODES.LAB_INVALID_TRACE,
        message: 'Trace must declare timeDependency: false.',
        field: 'trace.timeDependency',
        entityId: integration.id,
      });
    }
  }

  return errors;
}

/**
 * Validate a LaboratoryAssessmentRelationship.
 * Returns structured errors. Never throws. Deterministic.
 */
export function validateLaboratoryAssessmentRelationship(
  rel: LaboratoryAssessmentRelationship,
): readonly LaboratoryAssessmentValidationError[] {
  const errors: LaboratoryAssessmentValidationError[] = [];

  if (!rel.id || rel.id.trim() === '') {
    errors.push({
      code: LAB_ASSESSMENT_VALIDATION_CODES.LAB_RELATIONSHIP_DUPLICATE_ID,
      message: 'Relationship is missing a valid id.',
      field: 'id',
    });
  }

  if (!rel.sourceIntegrationId || rel.sourceIntegrationId.trim() === '') {
    errors.push({
      code: LAB_ASSESSMENT_VALIDATION_CODES.LAB_MISSING_ASSESSMENT_REFERENCE,
      message: 'Relationship is missing sourceIntegrationId.',
      field: 'sourceIntegrationId',
      entityId: rel.id,
    });
  }

  if (!rel.targetIntegrationId || rel.targetIntegrationId.trim() === '') {
    errors.push({
      code: LAB_ASSESSMENT_VALIDATION_CODES.LAB_MISSING_ASSESSMENT_REFERENCE,
      message: 'Relationship is missing targetIntegrationId.',
      field: 'targetIntegrationId',
      entityId: rel.id,
    });
  }

  if (
    rel.sourceIntegrationId &&
    rel.targetIntegrationId &&
    rel.sourceIntegrationId === rel.targetIntegrationId
  ) {
    errors.push({
      code: LAB_ASSESSMENT_VALIDATION_CODES.LAB_SELF_RELATIONSHIP,
      message: 'Relationship cannot reference itself (source equals target).',
      field: 'sourceIntegrationId',
      entityId: rel.id,
    });
  }

  return errors;
}

/**
 * Validate a LaboratoryAssessmentRegistry.
 * Returns structured errors. Never throws. Deterministic.
 */
export function validateLaboratoryAssessmentRegistry(
  registry: LaboratoryAssessmentRegistry,
): LaboratoryAssessmentRegistryValidationResult {
  const errors: LaboratoryAssessmentValidationError[] = [];

  if (!registry || typeof registry !== 'object') {
    errors.push({
      code: LAB_ASSESSMENT_VALIDATION_CODES.LAB_EMPTY_REGISTRY,
      message: 'Registry is null or not an object.',
    });
    return {
      valid: false,
      errors,
      nodeResults: [],
      checkedAt: 'laboratory_assessment_registry_validation',
    };
  }

  if (!registry.nodes || !Array.isArray(registry.nodes)) {
    errors.push({
      code: LAB_ASSESSMENT_VALIDATION_CODES.LAB_EMPTY_REGISTRY,
      message: 'Registry is missing nodes array.',
      field: 'nodes',
    });
    return {
      valid: false,
      errors,
      nodeResults: [],
      checkedAt: 'laboratory_assessment_registry_validation',
    };
  }

  if (registry.nodes.length === 0) {
    errors.push({
      code: LAB_ASSESSMENT_VALIDATION_CODES.LAB_EMPTY_REGISTRY,
      message: 'Registry has no nodes.',
      field: 'nodes',
    });
    return {
      valid: false,
      errors,
      nodeResults: [],
      checkedAt: 'laboratory_assessment_registry_validation',
    };
  }

  const nodeResults = registry.nodes.map((node) => {
    const nodeErrors = validateAssessmentLaboratoryIntegration(node);
    return {
      valid: nodeErrors.length === 0,
      errors: nodeErrors,
      checkedAt: 'laboratory_assessment_node_validation' as const,
    };
  });

  for (const result of nodeResults) {
    errors.push(...result.errors);
  }

  const idSet = new Set<string>();
  const titleSet = new Set<string>();
  for (const node of registry.nodes) {
    if (idSet.has(node.id)) {
      errors.push({
        code: LAB_ASSESSMENT_VALIDATION_CODES.LAB_ASSESSMENT_DUPLICATE_ID,
        message: `Duplicate integration id: ${node.id}`,
        field: 'id',
        entityId: node.id,
      });
    }
    idSet.add(node.id);

    if (titleSet.has(node.title)) {
      errors.push({
        code: LAB_ASSESSMENT_VALIDATION_CODES.LAB_ASSESSMENT_DUPLICATE_TITLE,
        message: `Duplicate integration title: ${node.title}`,
        field: 'title',
        entityId: node.id,
      });
    }
    titleSet.add(node.title);
  }

  if (!registry.metadata || typeof registry.metadata !== 'object') {
    errors.push({
      code: LAB_ASSESSMENT_VALIDATION_CODES.LAB_REGISTRY_INCONSISTENCY,
      message: 'Registry is missing metadata.',
      field: 'metadata',
    });
  } else {
    if (registry.metadata.nodeCount !== registry.nodes.length) {
      errors.push({
        code: LAB_ASSESSMENT_VALIDATION_CODES.LAB_REGISTRY_INCONSISTENCY,
        message: `Metadata nodeCount (${registry.metadata.nodeCount}) does not match actual node count (${registry.nodes.length}).`,
        field: 'metadata.nodeCount',
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    nodeResults,
    checkedAt: 'laboratory_assessment_registry_validation',
  };
}

/**
 * Validate a LaboratoryAssessmentInput.
 * Returns structured errors. Never throws. Deterministic.
 */
export function validateLaboratoryAssessmentInput(
  input: LaboratoryAssessmentInput,
): LaboratoryAssessmentInputValidationResult {
  const errors: LaboratoryAssessmentValidationError[] = [];

  if (!input || typeof input !== 'object') {
    errors.push({
      code: LAB_ASSESSMENT_VALIDATION_CODES.LAB_EMPTY_REGISTRY,
      message: 'Input is null or not an object.',
    });
    return {
      valid: false,
      errors,
      checkedAt: 'laboratory_assessment_input_validation',
    };
  }

  if (!input.nodes || !Array.isArray(input.nodes)) {
    errors.push({
      code: LAB_ASSESSMENT_VALIDATION_CODES.LAB_EMPTY_REGISTRY,
      message: 'Input is missing nodes array.',
      field: 'nodes',
    });
    return {
      valid: false,
      errors,
      checkedAt: 'laboratory_assessment_input_validation',
    };
  }

  if (input.nodes.length === 0) {
    errors.push({
      code: LAB_ASSESSMENT_VALIDATION_CODES.LAB_EMPTY_REGISTRY,
      message: 'Input has no nodes.',
      field: 'nodes',
    });
    return {
      valid: false,
      errors,
      checkedAt: 'laboratory_assessment_input_validation',
    };
  }

  for (const node of input.nodes) {
    const nodeErrors = validateAssessmentLaboratoryIntegration(node);
    errors.push(...nodeErrors);
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'laboratory_assessment_input_validation',
  };
}

/**
 * Validate a LaboratoryAssessmentTrace.
 * Returns structured errors. Never throws. Deterministic.
 */
export function validateLaboratoryAssessmentTrace(
  trace: LaboratoryAssessmentTrace,
): LaboratoryAssessmentTraceValidationResult {
  const errors: LaboratoryAssessmentValidationError[] = [];

  if (!trace || typeof trace !== 'object') {
    errors.push({
      code: LAB_ASSESSMENT_VALIDATION_CODES.LAB_INVALID_TRACE,
      message: 'Trace is null or not an object.',
    });
    return {
      valid: false,
      errors,
      checkedAt: 'laboratory_assessment_trace_validation',
    };
  }

  if (!trace.traceId || typeof trace.traceId !== 'string' || trace.traceId.trim() === '') {
    errors.push({
      code: LAB_ASSESSMENT_VALIDATION_CODES.LAB_INVALID_TRACE,
      message: 'Trace is missing a valid traceId.',
      field: 'traceId',
    });
  }

  if (trace.deterministic !== true) {
    errors.push({
      code: LAB_ASSESSMENT_VALIDATION_CODES.LAB_INVALID_TRACE,
      message: 'Trace must declare deterministic: true.',
      field: 'deterministic',
    });
  }

  if (trace.randomUsed !== false) {
    errors.push({
      code: LAB_ASSESSMENT_VALIDATION_CODES.LAB_INVALID_TRACE,
      message: 'Trace must declare randomUsed: false.',
      field: 'randomUsed',
    });
  }

  if (trace.timeDependency !== false) {
    errors.push({
      code: LAB_ASSESSMENT_VALIDATION_CODES.LAB_INVALID_TRACE,
      message: 'Trace must declare timeDependency: false.',
      field: 'timeDependency',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'laboratory_assessment_trace_validation',
  };
}

/**
 * Validate an AssessmentArtifactWithLaboratories.
 * Returns structured errors. Never throws. Deterministic.
 */
export function validateAssessmentArtifactWithLaboratories(
  artifact: AssessmentArtifactWithLaboratories,
): AssessmentArtifactWithLaboratoriesValidationResult {
  const errors: LaboratoryAssessmentValidationError[] = [];

  if (!artifact || typeof artifact !== 'object') {
    errors.push({
      code: LAB_ASSESSMENT_VALIDATION_CODES.LAB_MISSING_ASSESSMENT_REFERENCE,
      message: 'Artifact is null or not an object.',
    });
    return {
      valid: false,
      errors,
      checkedAt: 'artifact_laboratory_validation',
    };
  }

  if (!artifact.artifactId || artifact.artifactId.trim() === '') {
    errors.push({
      code: LAB_ASSESSMENT_VALIDATION_CODES.LAB_MISSING_ASSESSMENT_REFERENCE,
      message: 'Artifact is missing a valid artifactId.',
      field: 'artifactId',
    });
  }

  if (!artifact.artifactTitle || artifact.artifactTitle.trim() === '') {
    errors.push({
      code: LAB_ASSESSMENT_VALIDATION_CODES.LAB_MISSING_TITLE,
      message: 'Artifact is missing a valid artifactTitle.',
      field: 'artifactTitle',
    });
  }

  if (!artifact.laboratories || !Array.isArray(artifact.laboratories)) {
    errors.push({
      code: LAB_ASSESSMENT_VALIDATION_CODES.LAB_MISSING_PROVENANCE,
      message: 'Artifact is missing laboratories array.',
      field: 'laboratories',
    });
  } else {
    for (const integration of artifact.laboratories) {
      const intErrors = validateAssessmentLaboratoryIntegration(integration);
      errors.push(...intErrors);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'artifact_laboratory_validation',
  };
}

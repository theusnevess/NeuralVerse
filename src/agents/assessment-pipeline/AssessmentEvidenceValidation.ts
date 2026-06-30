/**
 * NV-2000-D8-OPT-14 — Assessment Evidence & Governance Layer Validation
 *
 * Deterministic validation for the Assessment Evidence Kernel.
 * Returns structured errors, never exceptions for expected validation failures.
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import {
  type AssessmentArtifactWithEvidence,
  type AssessmentArtifactWithEvidenceValidationResult,
  type AssessmentEvidence,
  type AssessmentEvidenceProvenance,
  type AssessmentEvidenceTrace,
  type AssessmentGovernanceLevel,
  type EvidenceAuditMetadata,
  type EvidenceConfidenceLevel,
  type EvidenceGovernance,
  type EvidenceGovernanceLevel,
  type EvidenceInput,
  type EvidenceInputValidationResult,
  type EvidenceReference,
  type EvidenceRegistry,
  type EvidenceRegistryValidationResult,
  type EvidenceRelationship,
  type EvidenceSource,
  type EvidenceStatus,
  type EvidenceTraceType,
  type EvidenceTraceValidationResult,
  type EvidenceType,
  type EvidenceValidationError,
  type EvidenceValidationResult,
  CANONICAL_ASSESSMENT_GOVERNANCE,
  CANONICAL_EVIDENCE_CONFIDENCE_LEVELS,
  CANONICAL_EVIDENCE_GOVERNANCE_LEVELS,
  CANONICAL_EVIDENCE_SOURCES,
  CANONICAL_EVIDENCE_STATUS,
  CANONICAL_EVIDENCE_TRACE_TYPES,
  CANONICAL_EVIDENCE_TYPES,
} from './AssessmentAgentContract.ts';

// ============================================================================
// VALIDATION CODES — Stable forever (24 codes)
// ============================================================================

export const EVIDENCE_VALIDATION_CODES = {
  EVIDENCE_DUPLICATE_ID: 'EVIDENCE_DUPLICATE_ID',
  EVIDENCE_DUPLICATE_TITLE: 'EVIDENCE_DUPLICATE_TITLE',
  EVIDENCE_REFERENCE_DUPLICATE_ID: 'EVIDENCE_REFERENCE_DUPLICATE_ID',
  EVIDENCE_RELATIONSHIP_DUPLICATE_ID: 'EVIDENCE_RELATIONSHIP_DUPLICATE_ID',
  EVIDENCE_GOVERNANCE_DUPLICATE_ID: 'EVIDENCE_GOVERNANCE_DUPLICATE_ID',
  EVIDENCE_INVALID_TYPE: 'EVIDENCE_INVALID_TYPE',
  EVIDENCE_INVALID_SOURCE: 'EVIDENCE_INVALID_SOURCE',
  EVIDENCE_INVALID_CONFIDENCE: 'EVIDENCE_INVALID_CONFIDENCE',
  EVIDENCE_INVALID_GOVERNANCE: 'EVIDENCE_INVALID_GOVERNANCE',
  EVIDENCE_INVALID_TRACE: 'EVIDENCE_INVALID_TRACE',
  EVIDENCE_INVALID_STATUS: 'EVIDENCE_INVALID_STATUS',
  EVIDENCE_MISSING_PROVENANCE: 'EVIDENCE_MISSING_PROVENANCE',
  EVIDENCE_MISSING_PROVIDER: 'EVIDENCE_MISSING_PROVIDER',
  EVIDENCE_MISSING_RATIONALE: 'EVIDENCE_MISSING_RATIONALE',
  EVIDENCE_MISSING_ASSESSMENT_REFERENCE: 'EVIDENCE_MISSING_ASSESSMENT_REFERENCE',
  EVIDENCE_MISSING_EVIDENCE_REFERENCE: 'EVIDENCE_MISSING_EVIDENCE_REFERENCE',
  EVIDENCE_MISSING_EVIDENCE_ID: 'EVIDENCE_MISSING_EVIDENCE_ID',
  EVIDENCE_MISSING_TITLE: 'EVIDENCE_MISSING_TITLE',
  EVIDENCE_SELF_RELATIONSHIP: 'EVIDENCE_SELF_RELATIONSHIP',
  EVIDENCE_EMPTY_REGISTRY: 'EVIDENCE_EMPTY_REGISTRY',
  EVIDENCE_INVALID_AUDIT: 'EVIDENCE_INVALID_AUDIT',
  EVIDENCE_REGISTRY_INCONSISTENCY: 'EVIDENCE_REGISTRY_INCONSISTENCY',
  EVIDENCE_INVALID_CONFIGURATION: 'EVIDENCE_INVALID_CONFIGURATION',
  EVIDENCE_INVALID_REFERENCE: 'EVIDENCE_INVALID_REFERENCE',
} as const;

// ============================================================================
// VALIDATION FUNCTIONS — Pure, never throw
// ============================================================================

/**
 * Validate an EvidenceReference.
 */
export function validateEvidenceReference(
  reference: EvidenceReference,
): readonly EvidenceValidationError[] {
  const errors: EvidenceValidationError[] = [];

  if (!reference.id || reference.id.trim() === '') {
    errors.push({
      code: EVIDENCE_VALIDATION_CODES.EVIDENCE_REFERENCE_DUPLICATE_ID,
      message: 'Evidence reference is missing a valid id.',
      field: 'id',
    });
  }

  if (!reference.evidenceType || !CANONICAL_EVIDENCE_TYPES.includes(reference.evidenceType)) {
    errors.push({
      code: EVIDENCE_VALIDATION_CODES.EVIDENCE_INVALID_TYPE,
      message: `Invalid evidence type: ${String(reference.evidenceType)}`,
      field: 'evidenceType',
      entityId: reference.id,
    });
  }

  if (!reference.source || !CANONICAL_EVIDENCE_SOURCES.includes(reference.source)) {
    errors.push({
      code: EVIDENCE_VALIDATION_CODES.EVIDENCE_INVALID_SOURCE,
      message: `Invalid evidence source: ${String(reference.source)}`,
      field: 'source',
      entityId: reference.id,
    });
  }

  return errors;
}

/**
 * Validate an EvidenceRelationship.
 */
export function validateEvidenceRelationship(
  relationship: EvidenceRelationship,
): readonly EvidenceValidationError[] {
  const errors: EvidenceValidationError[] = [];

  if (!relationship.id || relationship.id.trim() === '') {
    errors.push({
      code: EVIDENCE_VALIDATION_CODES.EVIDENCE_RELATIONSHIP_DUPLICATE_ID,
      message: 'Evidence relationship is missing a valid id.',
      field: 'id',
    });
  }

  if (!relationship.sourceEvidenceId || relationship.sourceEvidenceId.trim() === '') {
    errors.push({
      code: EVIDENCE_VALIDATION_CODES.EVIDENCE_MISSING_EVIDENCE_REFERENCE,
      message: 'Evidence relationship is missing sourceEvidenceId.',
      field: 'sourceEvidenceId',
      entityId: relationship.id,
    });
  }

  if (!relationship.targetEvidenceId || relationship.targetEvidenceId.trim() === '') {
    errors.push({
      code: EVIDENCE_VALIDATION_CODES.EVIDENCE_MISSING_EVIDENCE_REFERENCE,
      message: 'Evidence relationship is missing targetEvidenceId.',
      field: 'targetEvidenceId',
      entityId: relationship.id,
    });
  }

  if (relationship.sourceEvidenceId && relationship.targetEvidenceId &&
      relationship.sourceEvidenceId === relationship.targetEvidenceId) {
    errors.push({
      code: EVIDENCE_VALIDATION_CODES.EVIDENCE_SELF_RELATIONSHIP,
      message: 'Evidence relationship cannot reference itself.',
      field: 'targetEvidenceId',
      entityId: relationship.id,
    });
  }

  return errors;
}

/**
 * Validate an EvidenceGovernance.
 */
export function validateEvidenceGovernance(
  governance: EvidenceGovernance,
): readonly EvidenceValidationError[] {
  const errors: EvidenceValidationError[] = [];

  if (!governance.id || governance.id.trim() === '') {
    errors.push({
      code: EVIDENCE_VALIDATION_CODES.EVIDENCE_GOVERNANCE_DUPLICATE_ID,
      message: 'Evidence governance is missing a valid id.',
      field: 'id',
    });
  }

  if (!governance.governanceLevel || !CANONICAL_EVIDENCE_GOVERNANCE_LEVELS.includes(governance.governanceLevel)) {
    errors.push({
      code: EVIDENCE_VALIDATION_CODES.EVIDENCE_INVALID_GOVERNANCE,
      message: `Invalid governance level: ${String(governance.governanceLevel)}`,
      field: 'governanceLevel',
      entityId: governance.id,
    });
  }

  if (!governance.rationale || governance.rationale.trim() === '') {
    errors.push({
      code: EVIDENCE_VALIDATION_CODES.EVIDENCE_MISSING_RATIONALE,
      message: 'Evidence governance is missing a valid rationale.',
      field: 'rationale',
      entityId: governance.id,
    });
  }

  return errors;
}

/**
 * Validate an EvidenceAuditMetadata.
 */
export function validateEvidenceAuditMetadata(
  audit: EvidenceAuditMetadata,
): readonly EvidenceValidationError[] {
  const errors: EvidenceValidationError[] = [];

  if (!audit.id || audit.id.trim() === '') {
    errors.push({
      code: EVIDENCE_VALIDATION_CODES.EVIDENCE_INVALID_AUDIT,
      message: 'Evidence audit metadata is missing a valid id.',
      field: 'id',
    });
  }

  if (!audit.auditedBy || audit.auditedBy.trim() === '') {
    errors.push({
      code: EVIDENCE_VALIDATION_CODES.EVIDENCE_INVALID_AUDIT,
      message: 'Evidence audit metadata is missing auditedBy.',
      field: 'auditedBy',
      entityId: audit.id,
    });
  }

  if (!audit.auditedAt || audit.auditedAt.trim() === '') {
    errors.push({
      code: EVIDENCE_VALIDATION_CODES.EVIDENCE_INVALID_AUDIT,
      message: 'Evidence audit metadata is missing auditedAt.',
      field: 'auditedAt',
      entityId: audit.id,
    });
  }

  if (!audit.confidenceLevel || !CANONICAL_EVIDENCE_CONFIDENCE_LEVELS.includes(audit.confidenceLevel)) {
    errors.push({
      code: EVIDENCE_VALIDATION_CODES.EVIDENCE_INVALID_CONFIDENCE,
      message: `Invalid confidence level: ${String(audit.confidenceLevel)}`,
      field: 'confidenceLevel',
      entityId: audit.id,
    });
  }

  if (!audit.traceType || !CANONICAL_EVIDENCE_TRACE_TYPES.includes(audit.traceType)) {
    errors.push({
      code: EVIDENCE_VALIDATION_CODES.EVIDENCE_INVALID_TRACE,
      message: `Invalid trace type: ${String(audit.traceType)}`,
      field: 'traceType',
      entityId: audit.id,
    });
  }

  return errors;
}

/**
 * Validate an AssessmentEvidence.
 */
export function validateAssessmentEvidence(
  evidence: AssessmentEvidence,
): readonly EvidenceValidationError[] {
  const errors: EvidenceValidationError[] = [];

  if (!evidence.id || evidence.id.trim() === '') {
    errors.push({
      code: EVIDENCE_VALIDATION_CODES.EVIDENCE_MISSING_EVIDENCE_ID,
      message: 'Evidence is missing a valid id.',
      field: 'id',
    });
  }

  if (!evidence.title || evidence.title.trim() === '') {
    errors.push({
      code: EVIDENCE_VALIDATION_CODES.EVIDENCE_MISSING_TITLE,
      message: 'Evidence is missing a valid title.',
      field: 'title',
      entityId: evidence.id,
    });
  }

  if (!evidence.evidenceType || !CANONICAL_EVIDENCE_TYPES.includes(evidence.evidenceType)) {
    errors.push({
      code: EVIDENCE_VALIDATION_CODES.EVIDENCE_INVALID_TYPE,
      message: `Invalid evidence type: ${String(evidence.evidenceType)}`,
      field: 'evidenceType',
      entityId: evidence.id,
    });
  }

  if (!evidence.source || !CANONICAL_EVIDENCE_SOURCES.includes(evidence.source)) {
    errors.push({
      code: EVIDENCE_VALIDATION_CODES.EVIDENCE_INVALID_SOURCE,
      message: `Invalid evidence source: ${String(evidence.source)}`,
      field: 'source',
      entityId: evidence.id,
    });
  }

  if (!evidence.confidenceLevel || !CANONICAL_EVIDENCE_CONFIDENCE_LEVELS.includes(evidence.confidenceLevel)) {
    errors.push({
      code: EVIDENCE_VALIDATION_CODES.EVIDENCE_INVALID_CONFIDENCE,
      message: `Invalid confidence level: ${String(evidence.confidenceLevel)}`,
      field: 'confidenceLevel',
      entityId: evidence.id,
    });
  }

  if (!evidence.references || !Array.isArray(evidence.references) || evidence.references.length === 0) {
    errors.push({
      code: EVIDENCE_VALIDATION_CODES.EVIDENCE_MISSING_EVIDENCE_REFERENCE,
      message: 'Evidence is missing references array.',
      field: 'references',
      entityId: evidence.id,
    });
  } else {
    for (const reference of evidence.references) {
      const refErrors = validateEvidenceReference(reference);
      errors.push(...refErrors);
    }
  }

  if (!evidence.relationships || !Array.isArray(evidence.relationships)) {
    errors.push({
      code: EVIDENCE_VALIDATION_CODES.EVIDENCE_MISSING_EVIDENCE_REFERENCE,
      message: 'Evidence is missing relationships array.',
      field: 'relationships',
      entityId: evidence.id,
    });
  } else {
    for (const relationship of evidence.relationships) {
      const relErrors = validateEvidenceRelationship(relationship);
      errors.push(...relErrors);
    }
  }

  if (!evidence.governance || typeof evidence.governance !== 'object') {
    errors.push({
      code: EVIDENCE_VALIDATION_CODES.EVIDENCE_INVALID_GOVERNANCE,
      message: 'Evidence is missing governance.',
      field: 'governance',
      entityId: evidence.id,
    });
  } else {
    const govErrors = validateEvidenceGovernance(evidence.governance);
    errors.push(...govErrors);
  }

  if (!evidence.auditMetadata || typeof evidence.auditMetadata !== 'object') {
    errors.push({
      code: EVIDENCE_VALIDATION_CODES.EVIDENCE_INVALID_AUDIT,
      message: 'Evidence is missing audit metadata.',
      field: 'auditMetadata',
      entityId: evidence.id,
    });
  } else {
    const auditErrors = validateEvidenceAuditMetadata(evidence.auditMetadata);
    errors.push(...auditErrors);
  }

  if (!evidence.conceptIds || !Array.isArray(evidence.conceptIds) || evidence.conceptIds.length === 0) {
    errors.push({
      code: EVIDENCE_VALIDATION_CODES.EVIDENCE_MISSING_ASSESSMENT_REFERENCE,
      message: 'Evidence is missing conceptIds.',
      field: 'conceptIds',
      entityId: evidence.id,
    });
  }

  if (!evidence.status || !CANONICAL_EVIDENCE_STATUS.includes(evidence.status)) {
    errors.push({
      code: EVIDENCE_VALIDATION_CODES.EVIDENCE_INVALID_STATUS,
      message: `Invalid status: ${String(evidence.status)}`,
      field: 'status',
      entityId: evidence.id,
    });
  }

  if (!evidence.assessmentGovernance || !CANONICAL_ASSESSMENT_GOVERNANCE.includes(evidence.assessmentGovernance)) {
    errors.push({
      code: EVIDENCE_VALIDATION_CODES.EVIDENCE_INVALID_GOVERNANCE,
      message: `Invalid assessment governance: ${String(evidence.assessmentGovernance)}`,
      field: 'assessmentGovernance',
      entityId: evidence.id,
    });
  }

  if (!evidence.provenance || typeof evidence.provenance !== 'object') {
    errors.push({
      code: EVIDENCE_VALIDATION_CODES.EVIDENCE_MISSING_PROVENANCE,
      message: 'Evidence is missing provenance.',
      field: 'provenance',
      entityId: evidence.id,
    });
  } else {
    if (!evidence.provenance.provider || evidence.provenance.provider.trim() === '') {
      errors.push({
        code: EVIDENCE_VALIDATION_CODES.EVIDENCE_MISSING_PROVIDER,
        message: 'Provenance is missing a valid provider.',
        field: 'provenance.provider',
        entityId: evidence.id,
      });
    }
    if (!evidence.provenance.rationale || evidence.provenance.rationale.trim() === '') {
      errors.push({
        code: EVIDENCE_VALIDATION_CODES.EVIDENCE_MISSING_RATIONALE,
        message: 'Provenance is missing a valid rationale.',
        field: 'provenance.rationale',
        entityId: evidence.id,
      });
    }
  }

  if (!evidence.trace || typeof evidence.trace !== 'object') {
    errors.push({
      code: EVIDENCE_VALIDATION_CODES.EVIDENCE_INVALID_TRACE,
      message: 'Evidence is missing trace metadata.',
      field: 'trace',
      entityId: evidence.id,
    });
  } else {
    if (evidence.trace.deterministic !== true) {
      errors.push({
        code: EVIDENCE_VALIDATION_CODES.EVIDENCE_INVALID_TRACE,
        message: 'Trace must declare deterministic: true.',
        field: 'trace.deterministic',
        entityId: evidence.id,
      });
    }
    if (evidence.trace.randomUsed !== false) {
      errors.push({
        code: EVIDENCE_VALIDATION_CODES.EVIDENCE_INVALID_TRACE,
        message: 'Trace must declare randomUsed: false.',
        field: 'trace.randomUsed',
        entityId: evidence.id,
      });
    }
    if (evidence.trace.timeDependency !== false) {
      errors.push({
        code: EVIDENCE_VALIDATION_CODES.EVIDENCE_INVALID_TRACE,
        message: 'Trace must declare timeDependency: false.',
        field: 'trace.timeDependency',
        entityId: evidence.id,
      });
    }
  }

  return errors;
}

/**
 * Validate an EvidenceRegistry.
 */
export function validateEvidenceRegistry(
  registry: EvidenceRegistry,
): EvidenceRegistryValidationResult {
  const errors: EvidenceValidationError[] = [];

  if (!registry || typeof registry !== 'object') {
    errors.push({
      code: EVIDENCE_VALIDATION_CODES.EVIDENCE_EMPTY_REGISTRY,
      message: 'Registry is null or not an object.',
    });
    return {
      valid: false,
      errors,
      nodeResults: [],
      checkedAt: 'evidence_registry_validation',
    };
  }

  if (!registry.nodes || !Array.isArray(registry.nodes)) {
    errors.push({
      code: EVIDENCE_VALIDATION_CODES.EVIDENCE_EMPTY_REGISTRY,
      message: 'Registry is missing nodes array.',
      field: 'nodes',
    });
    return {
      valid: false,
      errors,
      nodeResults: [],
      checkedAt: 'evidence_registry_validation',
    };
  }

  if (registry.nodes.length === 0) {
    errors.push({
      code: EVIDENCE_VALIDATION_CODES.EVIDENCE_EMPTY_REGISTRY,
      message: 'Registry has no nodes.',
      field: 'nodes',
    });
    return {
      valid: false,
      errors,
      nodeResults: [],
      checkedAt: 'evidence_registry_validation',
    };
  }

  const nodeResults = registry.nodes.map((node) => {
    const nodeErrors = validateAssessmentEvidence(node);
    return {
      valid: nodeErrors.length === 0,
      errors: nodeErrors,
      checkedAt: 'evidence_node_validation' as const,
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
        code: EVIDENCE_VALIDATION_CODES.EVIDENCE_DUPLICATE_ID,
        message: `Duplicate evidence id: ${node.id}`,
        field: 'id',
        entityId: node.id,
      });
    }
    idSet.add(node.id);

    if (titleSet.has(node.title)) {
      errors.push({
        code: EVIDENCE_VALIDATION_CODES.EVIDENCE_DUPLICATE_TITLE,
        message: `Duplicate evidence title: ${node.title}`,
        field: 'title',
        entityId: node.id,
      });
    }
    titleSet.add(node.title);
  }

  if (!registry.metadata || typeof registry.metadata !== 'object') {
    errors.push({
      code: EVIDENCE_VALIDATION_CODES.EVIDENCE_REGISTRY_INCONSISTENCY,
      message: 'Registry is missing metadata.',
      field: 'metadata',
    });
  } else {
    if (registry.metadata.nodeCount !== registry.nodes.length) {
      errors.push({
        code: EVIDENCE_VALIDATION_CODES.EVIDENCE_REGISTRY_INCONSISTENCY,
        message: `Metadata nodeCount (${registry.metadata.nodeCount}) does not match actual node count (${registry.nodes.length}).`,
        field: 'metadata.nodeCount',
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    nodeResults,
    checkedAt: 'evidence_registry_validation',
  };
}

/**
 * Validate an EvidenceInput.
 */
export function validateEvidenceInput(
  input: EvidenceInput,
): EvidenceInputValidationResult {
  const errors: EvidenceValidationError[] = [];

  if (!input || typeof input !== 'object') {
    errors.push({
      code: EVIDENCE_VALIDATION_CODES.EVIDENCE_EMPTY_REGISTRY,
      message: 'Input is null or not an object.',
    });
    return {
      valid: false,
      errors,
      checkedAt: 'evidence_input_validation',
    };
  }

  if (!input.nodes || !Array.isArray(input.nodes)) {
    errors.push({
      code: EVIDENCE_VALIDATION_CODES.EVIDENCE_EMPTY_REGISTRY,
      message: 'Input is missing nodes array.',
      field: 'nodes',
    });
    return {
      valid: false,
      errors,
      checkedAt: 'evidence_input_validation',
    };
  }

  if (input.nodes.length === 0) {
    errors.push({
      code: EVIDENCE_VALIDATION_CODES.EVIDENCE_EMPTY_REGISTRY,
      message: 'Input has no nodes.',
      field: 'nodes',
    });
    return {
      valid: false,
      errors,
      checkedAt: 'evidence_input_validation',
    };
  }

  for (const node of input.nodes) {
    const nodeErrors = validateAssessmentEvidence(node);
    errors.push(...nodeErrors);
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'evidence_input_validation',
  };
}

/**
 * Validate an AssessmentEvidenceTrace.
 */
export function validateEvidenceTrace(
  trace: AssessmentEvidenceTrace,
): EvidenceTraceValidationResult {
  const errors: EvidenceValidationError[] = [];

  if (!trace || typeof trace !== 'object') {
    errors.push({
      code: EVIDENCE_VALIDATION_CODES.EVIDENCE_INVALID_TRACE,
      message: 'Trace is null or not an object.',
    });
    return {
      valid: false,
      errors,
      checkedAt: 'evidence_trace_validation',
    };
  }

  if (!trace.traceId || trace.traceId.trim() === '') {
    errors.push({
      code: EVIDENCE_VALIDATION_CODES.EVIDENCE_INVALID_TRACE,
      message: 'Trace is missing a valid traceId.',
      field: 'traceId',
    });
  }

  if (trace.deterministic !== true) {
    errors.push({
      code: EVIDENCE_VALIDATION_CODES.EVIDENCE_INVALID_TRACE,
      message: 'Trace must declare deterministic: true.',
      field: 'deterministic',
    });
  }

  if (trace.randomUsed !== false) {
    errors.push({
      code: EVIDENCE_VALIDATION_CODES.EVIDENCE_INVALID_TRACE,
      message: 'Trace must declare randomUsed: false.',
      field: 'randomUsed',
    });
  }

  if (trace.timeDependency !== false) {
    errors.push({
      code: EVIDENCE_VALIDATION_CODES.EVIDENCE_INVALID_TRACE,
      message: 'Trace must declare timeDependency: false.',
      field: 'timeDependency',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'evidence_trace_validation',
  };
}

/**
 * Validate an AssessmentArtifactWithEvidence.
 */
export function validateAssessmentArtifactWithEvidence(
  artifact: AssessmentArtifactWithEvidence,
): AssessmentArtifactWithEvidenceValidationResult {
  const errors: EvidenceValidationError[] = [];

  if (!artifact || typeof artifact !== 'object') {
    errors.push({
      code: EVIDENCE_VALIDATION_CODES.EVIDENCE_MISSING_ASSESSMENT_REFERENCE,
      message: 'Artifact is null or not an object.',
    });
    return {
      valid: false,
      errors,
      checkedAt: 'artifact_evidence_validation',
    };
  }

  if (!artifact.artifactId || artifact.artifactId.trim() === '') {
    errors.push({
      code: EVIDENCE_VALIDATION_CODES.EVIDENCE_MISSING_ASSESSMENT_REFERENCE,
      message: 'Artifact is missing a valid artifactId.',
      field: 'artifactId',
    });
  }

  if (!artifact.artifactTitle || artifact.artifactTitle.trim() === '') {
    errors.push({
      code: EVIDENCE_VALIDATION_CODES.EVIDENCE_MISSING_TITLE,
      message: 'Artifact is missing a valid artifactTitle.',
      field: 'artifactTitle',
    });
  }

  if (!artifact.evidence || !Array.isArray(artifact.evidence)) {
    errors.push({
      code: EVIDENCE_VALIDATION_CODES.EVIDENCE_MISSING_EVIDENCE_REFERENCE,
      message: 'Artifact is missing evidence array.',
      field: 'evidence',
    });
  } else {
    for (const evidence of artifact.evidence) {
      const evidenceErrors = validateAssessmentEvidence(evidence);
      errors.push(...evidenceErrors);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'artifact_evidence_validation',
  };
}

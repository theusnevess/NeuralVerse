/**
 * NV-2000-D8-OPT-09 — Engineering Case Assessment Validation Layer
 *
 * Deterministic validation for the Engineering Case Assessment Kernel.
 * Returns structured errors, never exceptions for expected validation failures.
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import {
  type AssessmentArtifactWithEngineeringCases,
  type AssessmentArtifactWithEngineeringCasesValidationResult,
  type AssessmentGovernanceLevel,
  type EngineeringCaseAssessment,
  type EngineeringCaseAssessmentProvenance,
  type EngineeringCaseAssessmentTrace,
  type EngineeringCaseInput,
  type EngineeringCaseInputValidationResult,
  type EngineeringCaseRegistry,
  type EngineeringCaseRegistryValidationResult,
  type EngineeringCaseRelationship,
  type EngineeringCaseStatus,
  type EngineeringCaseTraceValidationResult,
  type EngineeringCaseType,
  type EngineeringCaseValidationError,
  type EngineeringConstraint,
  type EngineeringConstraintType,
  type EngineeringDecisionReference,
  type EngineeringDecisionType,
  type EngineeringEvidence,
  type EngineeringEvidenceType,
  CANONICAL_ASSESSMENT_GOVERNANCE,
  CANONICAL_ENGINEERING_CASE_STATUS,
  CANONICAL_ENGINEERING_CASE_TYPES,
  CANONICAL_ENGINEERING_CONSTRAINT_TYPES,
  CANONICAL_ENGINEERING_DECISION_TYPES,
  CANONICAL_ENGINEERING_EVIDENCE_TYPES,
} from './AssessmentAgentContract.ts';

// ============================================================================
// VALIDATION CODES — Stable forever (24 codes)
// ============================================================================

export const ENGINEERING_CASE_VALIDATION_CODES = {
  ENGINEERING_CASE_DUPLICATE_ID: 'ENGINEERING_CASE_DUPLICATE_ID',
  ENGINEERING_CASE_DUPLICATE_TITLE: 'ENGINEERING_CASE_DUPLICATE_TITLE',
  ENGINEERING_DECISION_DUPLICATE_ID: 'ENGINEERING_DECISION_DUPLICATE_ID',
  ENGINEERING_CONSTRAINT_DUPLICATE_ID: 'ENGINEERING_CONSTRAINT_DUPLICATE_ID',
  ENGINEERING_EVIDENCE_DUPLICATE_ID: 'ENGINEERING_EVIDENCE_DUPLICATE_ID',
  ENGINEERING_INVALID_CASE_TYPE: 'ENGINEERING_INVALID_CASE_TYPE',
  ENGINEERING_INVALID_DECISION: 'ENGINEERING_INVALID_DECISION',
  ENGINEERING_INVALID_CONSTRAINT: 'ENGINEERING_INVALID_CONSTRAINT',
  ENGINEERING_INVALID_EVIDENCE: 'ENGINEERING_INVALID_EVIDENCE',
  ENGINEERING_INVALID_STATUS: 'ENGINEERING_INVALID_STATUS',
  ENGINEERING_INVALID_GOVERNANCE: 'ENGINEERING_INVALID_GOVERNANCE',
  ENGINEERING_MISSING_PROVENANCE: 'ENGINEERING_MISSING_PROVENANCE',
  ENGINEERING_MISSING_PROVIDER: 'ENGINEERING_MISSING_PROVIDER',
  ENGINEERING_MISSING_RATIONALE: 'ENGINEERING_MISSING_RATIONALE',
  ENGINEERING_MISSING_ASSESSMENT_REFERENCE: 'ENGINEERING_MISSING_ASSESSMENT_REFERENCE',
  ENGINEERING_MISSING_CASE_REFERENCE: 'ENGINEERING_MISSING_CASE_REFERENCE',
  ENGINEERING_MISSING_CASE_ID: 'ENGINEERING_MISSING_CASE_ID',
  ENGINEERING_MISSING_TITLE: 'ENGINEERING_MISSING_TITLE',
  ENGINEERING_SELF_RELATIONSHIP: 'ENGINEERING_SELF_RELATIONSHIP',
  ENGINEERING_EMPTY_REGISTRY: 'ENGINEERING_EMPTY_REGISTRY',
  ENGINEERING_INVALID_TRACE: 'ENGINEERING_INVALID_TRACE',
  ENGINEERING_REGISTRY_INCONSISTENCY: 'ENGINEERING_REGISTRY_INCONSISTENCY',
  ENGINEERING_INVALID_CONFIGURATION: 'ENGINEERING_INVALID_CONFIGURATION',
  ENGINEERING_INVALID_REFERENCE: 'ENGINEERING_INVALID_REFERENCE',
} as const;

// ============================================================================
// VALIDATION FUNCTIONS — Pure, never throw
// ============================================================================

/**
 * Validate an EngineeringDecisionReference.
 */
export function validateEngineeringDecisionReference(
  ref: EngineeringDecisionReference,
): readonly EngineeringCaseValidationError[] {
  const errors: EngineeringCaseValidationError[] = [];

  if (!ref.id || ref.id.trim() === '') {
    errors.push({
      code: ENGINEERING_CASE_VALIDATION_CODES.ENGINEERING_DECISION_DUPLICATE_ID,
      message: 'Decision reference is missing a valid id.',
      field: 'id',
    });
  }

  if (!ref.decisionType || !CANONICAL_ENGINEERING_DECISION_TYPES.includes(ref.decisionType)) {
    errors.push({
      code: ENGINEERING_CASE_VALIDATION_CODES.ENGINEERING_INVALID_DECISION,
      message: `Invalid decision type: ${String(ref.decisionType)}`,
      field: 'decisionType',
      entityId: ref.id,
    });
  }

  return errors;
}

/**
 * Validate an EngineeringConstraint.
 */
export function validateEngineeringConstraint(
  constraint: EngineeringConstraint,
): readonly EngineeringCaseValidationError[] {
  const errors: EngineeringCaseValidationError[] = [];

  if (!constraint.id || constraint.id.trim() === '') {
    errors.push({
      code: ENGINEERING_CASE_VALIDATION_CODES.ENGINEERING_CONSTRAINT_DUPLICATE_ID,
      message: 'Constraint is missing a valid id.',
      field: 'id',
    });
  }

  if (!constraint.constraintType || !CANONICAL_ENGINEERING_CONSTRAINT_TYPES.includes(constraint.constraintType)) {
    errors.push({
      code: ENGINEERING_CASE_VALIDATION_CODES.ENGINEERING_INVALID_CONSTRAINT,
      message: `Invalid constraint type: ${String(constraint.constraintType)}`,
      field: 'constraintType',
      entityId: constraint.id,
    });
  }

  return errors;
}

/**
 * Validate an EngineeringEvidence.
 */
export function validateEngineeringEvidence(
  evidence: EngineeringEvidence,
): readonly EngineeringCaseValidationError[] {
  const errors: EngineeringCaseValidationError[] = [];

  if (!evidence.id || evidence.id.trim() === '') {
    errors.push({
      code: ENGINEERING_CASE_VALIDATION_CODES.ENGINEERING_EVIDENCE_DUPLICATE_ID,
      message: 'Evidence is missing a valid id.',
      field: 'id',
    });
  }

  if (!evidence.evidenceType || !CANONICAL_ENGINEERING_EVIDENCE_TYPES.includes(evidence.evidenceType)) {
    errors.push({
      code: ENGINEERING_CASE_VALIDATION_CODES.ENGINEERING_INVALID_EVIDENCE,
      message: `Invalid evidence type: ${String(evidence.evidenceType)}`,
      field: 'evidenceType',
      entityId: evidence.id,
    });
  }

  return errors;
}

/**
 * Validate a single EngineeringCaseAssessment.
 * Returns structured errors. Never throws. Deterministic.
 */
export function validateEngineeringCaseAssessment(
  caseAssessment: EngineeringCaseAssessment,
): readonly EngineeringCaseValidationError[] {
  const errors: EngineeringCaseValidationError[] = [];

  if (!caseAssessment || typeof caseAssessment !== 'object') {
    errors.push({
      code: ENGINEERING_CASE_VALIDATION_CODES.ENGINEERING_MISSING_CASE_ID,
      message: 'Case assessment is null or not an object.',
    });
    return errors;
  }

  if (!caseAssessment.id || typeof caseAssessment.id !== 'string' || caseAssessment.id.trim() === '') {
    errors.push({
      code: ENGINEERING_CASE_VALIDATION_CODES.ENGINEERING_MISSING_CASE_ID,
      message: 'Case assessment is missing a valid id.',
      field: 'id',
      entityId: caseAssessment.id ?? 'unknown',
    });
  }

  if (!caseAssessment.title || typeof caseAssessment.title !== 'string' || caseAssessment.title.trim() === '') {
    errors.push({
      code: ENGINEERING_CASE_VALIDATION_CODES.ENGINEERING_MISSING_TITLE,
      message: 'Case assessment is missing a valid title.',
      field: 'title',
      entityId: caseAssessment.id,
    });
  }

  if (!caseAssessment.caseType || !CANONICAL_ENGINEERING_CASE_TYPES.includes(caseAssessment.caseType)) {
    errors.push({
      code: ENGINEERING_CASE_VALIDATION_CODES.ENGINEERING_INVALID_CASE_TYPE,
      message: `Invalid case type: ${String(caseAssessment.caseType)}`,
      field: 'caseType',
      entityId: caseAssessment.id,
    });
  }

  if (!caseAssessment.scenario || caseAssessment.scenario.trim() === '') {
    errors.push({
      code: ENGINEERING_CASE_VALIDATION_CODES.ENGINEERING_INVALID_CONFIGURATION,
      message: 'Case assessment is missing scenario.',
      field: 'scenario',
      entityId: caseAssessment.id,
    });
  }

  if (!caseAssessment.decisions || !Array.isArray(caseAssessment.decisions)) {
    errors.push({
      code: ENGINEERING_CASE_VALIDATION_CODES.ENGINEERING_INVALID_CONFIGURATION,
      message: 'Case assessment is missing decisions array.',
      field: 'decisions',
      entityId: caseAssessment.id,
    });
  } else {
    for (const decision of caseAssessment.decisions) {
      const decisionErrors = validateEngineeringDecisionReference(decision);
      errors.push(...decisionErrors);
    }
  }

  if (!caseAssessment.constraints || !Array.isArray(caseAssessment.constraints)) {
    errors.push({
      code: ENGINEERING_CASE_VALIDATION_CODES.ENGINEERING_INVALID_CONFIGURATION,
      message: 'Case assessment is missing constraints array.',
      field: 'constraints',
      entityId: caseAssessment.id,
    });
  } else {
    for (const constraint of caseAssessment.constraints) {
      const constraintErrors = validateEngineeringConstraint(constraint);
      errors.push(...constraintErrors);
    }
  }

  if (!caseAssessment.evidence || !Array.isArray(caseAssessment.evidence)) {
    errors.push({
      code: ENGINEERING_CASE_VALIDATION_CODES.ENGINEERING_INVALID_CONFIGURATION,
      message: 'Case assessment is missing evidence array.',
      field: 'evidence',
      entityId: caseAssessment.id,
    });
  } else {
    for (const evidence of caseAssessment.evidence) {
      const evidenceErrors = validateEngineeringEvidence(evidence);
      errors.push(...evidenceErrors);
    }
  }

  if (!caseAssessment.conceptIds || !Array.isArray(caseAssessment.conceptIds) || caseAssessment.conceptIds.length === 0) {
    errors.push({
      code: ENGINEERING_CASE_VALIDATION_CODES.ENGINEERING_MISSING_ASSESSMENT_REFERENCE,
      message: 'Case assessment is missing conceptIds.',
      field: 'conceptIds',
      entityId: caseAssessment.id,
    });
  }

  if (!caseAssessment.status || !CANONICAL_ENGINEERING_CASE_STATUS.includes(caseAssessment.status)) {
    errors.push({
      code: ENGINEERING_CASE_VALIDATION_CODES.ENGINEERING_INVALID_STATUS,
      message: `Invalid status: ${String(caseAssessment.status)}`,
      field: 'status',
      entityId: caseAssessment.id,
    });
  }

  if (!caseAssessment.governance || !CANONICAL_ASSESSMENT_GOVERNANCE.includes(caseAssessment.governance)) {
    errors.push({
      code: ENGINEERING_CASE_VALIDATION_CODES.ENGINEERING_INVALID_GOVERNANCE,
      message: `Invalid governance: ${String(caseAssessment.governance)}`,
      field: 'governance',
      entityId: caseAssessment.id,
    });
  }

  if (!caseAssessment.provenance || typeof caseAssessment.provenance !== 'object') {
    errors.push({
      code: ENGINEERING_CASE_VALIDATION_CODES.ENGINEERING_MISSING_PROVENANCE,
      message: 'Case assessment is missing provenance.',
      field: 'provenance',
      entityId: caseAssessment.id,
    });
  } else {
    if (!caseAssessment.provenance.provider || caseAssessment.provenance.provider.trim() === '') {
      errors.push({
        code: ENGINEERING_CASE_VALIDATION_CODES.ENGINEERING_MISSING_PROVIDER,
        message: 'Provenance is missing a valid provider.',
        field: 'provenance.provider',
        entityId: caseAssessment.id,
      });
    }
    if (!caseAssessment.provenance.rationale || caseAssessment.provenance.rationale.trim() === '') {
      errors.push({
        code: ENGINEERING_CASE_VALIDATION_CODES.ENGINEERING_MISSING_RATIONALE,
        message: 'Provenance is missing a valid rationale.',
        field: 'provenance.rationale',
        entityId: caseAssessment.id,
      });
    }
  }

  if (!caseAssessment.trace || typeof caseAssessment.trace !== 'object') {
    errors.push({
      code: ENGINEERING_CASE_VALIDATION_CODES.ENGINEERING_INVALID_TRACE,
      message: 'Case assessment is missing trace metadata.',
      field: 'trace',
      entityId: caseAssessment.id,
    });
  } else {
    if (caseAssessment.trace.deterministic !== true) {
      errors.push({
        code: ENGINEERING_CASE_VALIDATION_CODES.ENGINEERING_INVALID_TRACE,
        message: 'Trace must declare deterministic: true.',
        field: 'trace.deterministic',
        entityId: caseAssessment.id,
      });
    }
    if (caseAssessment.trace.randomUsed !== false) {
      errors.push({
        code: ENGINEERING_CASE_VALIDATION_CODES.ENGINEERING_INVALID_TRACE,
        message: 'Trace must declare randomUsed: false.',
        field: 'trace.randomUsed',
        entityId: caseAssessment.id,
      });
    }
    if (caseAssessment.trace.timeDependency !== false) {
      errors.push({
        code: ENGINEERING_CASE_VALIDATION_CODES.ENGINEERING_INVALID_TRACE,
        message: 'Trace must declare timeDependency: false.',
        field: 'trace.timeDependency',
        entityId: caseAssessment.id,
      });
    }
  }

  return errors;
}

/**
 * Validate an EngineeringCaseRelationship.
 * Returns structured errors. Never throws. Deterministic.
 */
export function validateEngineeringCaseRelationship(
  rel: EngineeringCaseRelationship,
): readonly EngineeringCaseValidationError[] {
  const errors: EngineeringCaseValidationError[] = [];

  if (!rel.id || rel.id.trim() === '') {
    errors.push({
      code: ENGINEERING_CASE_VALIDATION_CODES.ENGINEERING_INVALID_REFERENCE,
      message: 'Relationship is missing a valid id.',
      field: 'id',
    });
  }

  if (!rel.sourceCaseId || rel.sourceCaseId.trim() === '') {
    errors.push({
      code: ENGINEERING_CASE_VALIDATION_CODES.ENGINEERING_MISSING_CASE_REFERENCE,
      message: 'Relationship is missing sourceCaseId.',
      field: 'sourceCaseId',
      entityId: rel.id,
    });
  }

  if (!rel.targetCaseId || rel.targetCaseId.trim() === '') {
    errors.push({
      code: ENGINEERING_CASE_VALIDATION_CODES.ENGINEERING_MISSING_CASE_REFERENCE,
      message: 'Relationship is missing targetCaseId.',
      field: 'targetCaseId',
      entityId: rel.id,
    });
  }

  if (
    rel.sourceCaseId &&
    rel.targetCaseId &&
    rel.sourceCaseId === rel.targetCaseId
  ) {
    errors.push({
      code: ENGINEERING_CASE_VALIDATION_CODES.ENGINEERING_SELF_RELATIONSHIP,
      message: 'Relationship cannot reference itself (source equals target).',
      field: 'sourceCaseId',
      entityId: rel.id,
    });
  }

  return errors;
}

/**
 * Validate an EngineeringCaseRegistry.
 * Returns structured errors. Never throws. Deterministic.
 */
export function validateEngineeringCaseRegistry(
  registry: EngineeringCaseRegistry,
): EngineeringCaseRegistryValidationResult {
  const errors: EngineeringCaseValidationError[] = [];

  if (!registry || typeof registry !== 'object') {
    errors.push({
      code: ENGINEERING_CASE_VALIDATION_CODES.ENGINEERING_EMPTY_REGISTRY,
      message: 'Registry is null or not an object.',
    });
    return {
      valid: false,
      errors,
      nodeResults: [],
      checkedAt: 'engineering_case_registry_validation',
    };
  }

  if (!registry.nodes || !Array.isArray(registry.nodes)) {
    errors.push({
      code: ENGINEERING_CASE_VALIDATION_CODES.ENGINEERING_EMPTY_REGISTRY,
      message: 'Registry is missing nodes array.',
      field: 'nodes',
    });
    return {
      valid: false,
      errors,
      nodeResults: [],
      checkedAt: 'engineering_case_registry_validation',
    };
  }

  if (registry.nodes.length === 0) {
    errors.push({
      code: ENGINEERING_CASE_VALIDATION_CODES.ENGINEERING_EMPTY_REGISTRY,
      message: 'Registry has no nodes.',
      field: 'nodes',
    });
    return {
      valid: false,
      errors,
      nodeResults: [],
      checkedAt: 'engineering_case_registry_validation',
    };
  }

  const nodeResults = registry.nodes.map((node) => {
    const nodeErrors = validateEngineeringCaseAssessment(node);
    return {
      valid: nodeErrors.length === 0,
      errors: nodeErrors,
      checkedAt: 'engineering_case_node_validation' as const,
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
        code: ENGINEERING_CASE_VALIDATION_CODES.ENGINEERING_CASE_DUPLICATE_ID,
        message: `Duplicate case id: ${node.id}`,
        field: 'id',
        entityId: node.id,
      });
    }
    idSet.add(node.id);

    if (titleSet.has(node.title)) {
      errors.push({
        code: ENGINEERING_CASE_VALIDATION_CODES.ENGINEERING_CASE_DUPLICATE_TITLE,
        message: `Duplicate case title: ${node.title}`,
        field: 'title',
        entityId: node.id,
      });
    }
    titleSet.add(node.title);
  }

  if (!registry.metadata || typeof registry.metadata !== 'object') {
    errors.push({
      code: ENGINEERING_CASE_VALIDATION_CODES.ENGINEERING_REGISTRY_INCONSISTENCY,
      message: 'Registry is missing metadata.',
      field: 'metadata',
    });
  } else {
    if (registry.metadata.nodeCount !== registry.nodes.length) {
      errors.push({
        code: ENGINEERING_CASE_VALIDATION_CODES.ENGINEERING_REGISTRY_INCONSISTENCY,
        message: `Metadata nodeCount (${registry.metadata.nodeCount}) does not match actual node count (${registry.nodes.length}).`,
        field: 'metadata.nodeCount',
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    nodeResults,
    checkedAt: 'engineering_case_registry_validation',
  };
}

/**
 * Validate an EngineeringCaseInput.
 * Returns structured errors. Never throws. Deterministic.
 */
export function validateEngineeringCaseInput(
  input: EngineeringCaseInput,
): EngineeringCaseInputValidationResult {
  const errors: EngineeringCaseValidationError[] = [];

  if (!input || typeof input !== 'object') {
    errors.push({
      code: ENGINEERING_CASE_VALIDATION_CODES.ENGINEERING_EMPTY_REGISTRY,
      message: 'Input is null or not an object.',
    });
    return {
      valid: false,
      errors,
      checkedAt: 'engineering_case_input_validation',
    };
  }

  if (!input.nodes || !Array.isArray(input.nodes)) {
    errors.push({
      code: ENGINEERING_CASE_VALIDATION_CODES.ENGINEERING_EMPTY_REGISTRY,
      message: 'Input is missing nodes array.',
      field: 'nodes',
    });
    return {
      valid: false,
      errors,
      checkedAt: 'engineering_case_input_validation',
    };
  }

  if (input.nodes.length === 0) {
    errors.push({
      code: ENGINEERING_CASE_VALIDATION_CODES.ENGINEERING_EMPTY_REGISTRY,
      message: 'Input has no nodes.',
      field: 'nodes',
    });
    return {
      valid: false,
      errors,
      checkedAt: 'engineering_case_input_validation',
    };
  }

  for (const node of input.nodes) {
    const nodeErrors = validateEngineeringCaseAssessment(node);
    errors.push(...nodeErrors);
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'engineering_case_input_validation',
  };
}

/**
 * Validate an EngineeringCaseAssessmentTrace.
 * Returns structured errors. Never throws. Deterministic.
 */
export function validateEngineeringCaseAssessmentTrace(
  trace: EngineeringCaseAssessmentTrace,
): EngineeringCaseTraceValidationResult {
  const errors: EngineeringCaseValidationError[] = [];

  if (!trace || typeof trace !== 'object') {
    errors.push({
      code: ENGINEERING_CASE_VALIDATION_CODES.ENGINEERING_INVALID_TRACE,
      message: 'Trace is null or not an object.',
    });
    return {
      valid: false,
      errors,
      checkedAt: 'engineering_case_trace_validation',
    };
  }

  if (!trace.traceId || typeof trace.traceId !== 'string' || trace.traceId.trim() === '') {
    errors.push({
      code: ENGINEERING_CASE_VALIDATION_CODES.ENGINEERING_INVALID_TRACE,
      message: 'Trace is missing a valid traceId.',
      field: 'traceId',
    });
  }

  if (trace.deterministic !== true) {
    errors.push({
      code: ENGINEERING_CASE_VALIDATION_CODES.ENGINEERING_INVALID_TRACE,
      message: 'Trace must declare deterministic: true.',
      field: 'deterministic',
    });
  }

  if (trace.randomUsed !== false) {
    errors.push({
      code: ENGINEERING_CASE_VALIDATION_CODES.ENGINEERING_INVALID_TRACE,
      message: 'Trace must declare randomUsed: false.',
      field: 'randomUsed',
    });
  }

  if (trace.timeDependency !== false) {
    errors.push({
      code: ENGINEERING_CASE_VALIDATION_CODES.ENGINEERING_INVALID_TRACE,
      message: 'Trace must declare timeDependency: false.',
      field: 'timeDependency',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'engineering_case_trace_validation',
  };
}

/**
 * Validate an AssessmentArtifactWithEngineeringCases.
 * Returns structured errors. Never throws. Deterministic.
 */
export function validateAssessmentArtifactWithEngineeringCases(
  artifact: AssessmentArtifactWithEngineeringCases,
): AssessmentArtifactWithEngineeringCasesValidationResult {
  const errors: EngineeringCaseValidationError[] = [];

  if (!artifact || typeof artifact !== 'object') {
    errors.push({
      code: ENGINEERING_CASE_VALIDATION_CODES.ENGINEERING_MISSING_ASSESSMENT_REFERENCE,
      message: 'Artifact is null or not an object.',
    });
    return {
      valid: false,
      errors,
      checkedAt: 'artifact_engineering_case_validation',
    };
  }

  if (!artifact.artifactId || artifact.artifactId.trim() === '') {
    errors.push({
      code: ENGINEERING_CASE_VALIDATION_CODES.ENGINEERING_MISSING_ASSESSMENT_REFERENCE,
      message: 'Artifact is missing a valid artifactId.',
      field: 'artifactId',
    });
  }

  if (!artifact.artifactTitle || artifact.artifactTitle.trim() === '') {
    errors.push({
      code: ENGINEERING_CASE_VALIDATION_CODES.ENGINEERING_MISSING_TITLE,
      message: 'Artifact is missing a valid artifactTitle.',
      field: 'artifactTitle',
    });
  }

  if (!artifact.engineeringCases || !Array.isArray(artifact.engineeringCases)) {
    errors.push({
      code: ENGINEERING_CASE_VALIDATION_CODES.ENGINEERING_MISSING_PROVENANCE,
      message: 'Artifact is missing engineeringCases array.',
      field: 'engineeringCases',
    });
  } else {
    for (const caseAssessment of artifact.engineeringCases) {
      const caseErrors = validateEngineeringCaseAssessment(caseAssessment);
      errors.push(...caseErrors);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'artifact_engineering_case_validation',
  };
}

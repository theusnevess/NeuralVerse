/**
 * NV-2000-D8-OPT-11 — Engineering Constraint Analysis Validation Layer
 *
 * Deterministic validation for the Constraint Analysis Kernel.
 * Returns structured errors, never exceptions for expected validation failures.
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import {
  type AssessmentArtifactWithConstraints,
  type AssessmentArtifactWithConstraintsValidationResult,
  type AssessmentGovernanceLevel,
  type ConstraintAnalysisStatus,
  type ConstraintAssessmentProvenance,
  type ConstraintAssessmentTrace,
  type ConstraintCategory,
  type ConstraintCategoryType,
  type ConstraintInput,
  type ConstraintInputValidationResult,
  type ConstraintReasoning,
  type ConstraintReasoningType,
  type ConstraintRegistry,
  type ConstraintRegistryValidationResult,
  type ConstraintRelationship,
  type ConstraintSeverity,
  type ConstraintSeverityLevel,
  type ConstraintTraceValidationResult,
  type ConstraintValidationError,
  type ConstraintValidationResult,
  type EngineeringConstraintAnalysisType,
  type EngineeringConstraintAssessment,
  CANONICAL_ASSESSMENT_GOVERNANCE,
  CANONICAL_CONSTRAINT_ANALYSIS_STATUS,
  CANONICAL_CONSTRAINT_CATEGORY_TYPES,
  CANONICAL_CONSTRAINT_REASONING_TYPES,
  CANONICAL_CONSTRAINT_SEVERITY_LEVELS,
  CANONICAL_ENGINEERING_CONSTRAINT_ANALYSIS_TYPES,
} from './AssessmentAgentContract.ts';

// ============================================================================
// VALIDATION CODES — Stable forever (25 codes)
// ============================================================================

export const CONSTRAINT_VALIDATION_CODES = {
  CONSTRAINT_DUPLICATE_ID: 'CONSTRAINT_DUPLICATE_ID',
  CONSTRAINT_DUPLICATE_TITLE: 'CONSTRAINT_DUPLICATE_TITLE',
  CONSTRAINT_CATEGORY_DUPLICATE_ID: 'CONSTRAINT_CATEGORY_DUPLICATE_ID',
  CONSTRAINT_SEVERITY_DUPLICATE_ID: 'CONSTRAINT_SEVERITY_DUPLICATE_ID',
  CONSTRAINT_REASONING_DUPLICATE_ID: 'CONSTRAINT_REASONING_DUPLICATE_ID',
  CONSTRAINT_INVALID_TYPE: 'CONSTRAINT_INVALID_TYPE',
  CONSTRAINT_INVALID_CATEGORY: 'CONSTRAINT_INVALID_CATEGORY',
  CONSTRAINT_INVALID_SEVERITY: 'CONSTRAINT_INVALID_SEVERITY',
  CONSTRAINT_INVALID_REASONING: 'CONSTRAINT_INVALID_REASONING',
  CONSTRAINT_INVALID_STATUS: 'CONSTRAINT_INVALID_STATUS',
  CONSTRAINT_INVALID_GOVERNANCE: 'CONSTRAINT_INVALID_GOVERNANCE',
  CONSTRAINT_MISSING_PROVENANCE: 'CONSTRAINT_MISSING_PROVENANCE',
  CONSTRAINT_MISSING_PROVIDER: 'CONSTRAINT_MISSING_PROVIDER',
  CONSTRAINT_MISSING_RATIONALE: 'CONSTRAINT_MISSING_RATIONALE',
  CONSTRAINT_MISSING_ASSESSMENT_REFERENCE: 'CONSTRAINT_MISSING_ASSESSMENT_REFERENCE',
  CONSTRAINT_MISSING_CONSTRAINT_ID: 'CONSTRAINT_MISSING_CONSTRAINT_ID',
  CONSTRAINT_MISSING_TITLE: 'CONSTRAINT_MISSING_TITLE',
  CONSTRAINT_SELF_RELATIONSHIP: 'CONSTRAINT_SELF_RELATIONSHIP',
  CONSTRAINT_EMPTY_REGISTRY: 'CONSTRAINT_EMPTY_REGISTRY',
  CONSTRAINT_INVALID_TRACE: 'CONSTRAINT_INVALID_TRACE',
  CONSTRAINT_REGISTRY_INCONSISTENCY: 'CONSTRAINT_REGISTRY_INCONSISTENCY',
  CONSTRAINT_INVALID_CONFIGURATION: 'CONSTRAINT_INVALID_CONFIGURATION',
  CONSTRAINT_INVALID_REFERENCE: 'CONSTRAINT_INVALID_REFERENCE',
  CONSTRAINT_DUPLICATE_RELATIONSHIP: 'CONSTRAINT_DUPLICATE_RELATIONSHIP',
  CONSTRAINT_EMPTY_ARRAY: 'CONSTRAINT_EMPTY_ARRAY',
} as const;

// ============================================================================
// VALIDATION FUNCTIONS — Pure, never throw
// ============================================================================

/**
 * Validate a ConstraintCategory.
 */
export function validateConstraintCategory(
  category: ConstraintCategory,
): readonly ConstraintValidationError[] {
  const errors: ConstraintValidationError[] = [];

  if (!category.id || category.id.trim() === '') {
    errors.push({
      code: CONSTRAINT_VALIDATION_CODES.CONSTRAINT_CATEGORY_DUPLICATE_ID,
      message: 'Category is missing a valid id.',
      field: 'id',
    });
  }

  if (!category.categoryType || !CANONICAL_CONSTRAINT_CATEGORY_TYPES.includes(category.categoryType)) {
    errors.push({
      code: CONSTRAINT_VALIDATION_CODES.CONSTRAINT_INVALID_CATEGORY,
      message: `Invalid category type: ${String(category.categoryType)}`,
      field: 'categoryType',
      entityId: category.id,
    });
  }

  return errors;
}

/**
 * Validate a ConstraintSeverity.
 */
export function validateConstraintSeverity(
  severity: ConstraintSeverity,
): readonly ConstraintValidationError[] {
  const errors: ConstraintValidationError[] = [];

  if (!severity.id || severity.id.trim() === '') {
    errors.push({
      code: CONSTRAINT_VALIDATION_CODES.CONSTRAINT_SEVERITY_DUPLICATE_ID,
      message: 'Severity is missing a valid id.',
      field: 'id',
    });
  }

  if (!severity.severityLevel || !CANONICAL_CONSTRAINT_SEVERITY_LEVELS.includes(severity.severityLevel)) {
    errors.push({
      code: CONSTRAINT_VALIDATION_CODES.CONSTRAINT_INVALID_SEVERITY,
      message: `Invalid severity level: ${String(severity.severityLevel)}`,
      field: 'severityLevel',
      entityId: severity.id,
    });
  }

  return errors;
}

/**
 * Validate a ConstraintReasoning.
 */
export function validateConstraintReasoning(
  reasoning: ConstraintReasoning,
): readonly ConstraintValidationError[] {
  const errors: ConstraintValidationError[] = [];

  if (!reasoning.id || reasoning.id.trim() === '') {
    errors.push({
      code: CONSTRAINT_VALIDATION_CODES.CONSTRAINT_REASONING_DUPLICATE_ID,
      message: 'Reasoning is missing a valid id.',
      field: 'id',
    });
  }

  if (!reasoning.reasoningType || !CANONICAL_CONSTRAINT_REASONING_TYPES.includes(reasoning.reasoningType)) {
    errors.push({
      code: CONSTRAINT_VALIDATION_CODES.CONSTRAINT_INVALID_REASONING,
      message: `Invalid reasoning type: ${String(reasoning.reasoningType)}`,
      field: 'reasoningType',
      entityId: reasoning.id,
    });
  }

  return errors;
}

/**
 * Validate a single EngineeringConstraintAssessment.
 * Returns structured errors. Never throws. Deterministic.
 */
export function validateEngineeringConstraintAssessment(
  assessment: EngineeringConstraintAssessment,
): readonly ConstraintValidationError[] {
  const errors: ConstraintValidationError[] = [];

  if (!assessment || typeof assessment !== 'object') {
    errors.push({
      code: CONSTRAINT_VALIDATION_CODES.CONSTRAINT_MISSING_CONSTRAINT_ID,
      message: 'Assessment is null or not an object.',
    });
    return errors;
  }

  if (!assessment.id || typeof assessment.id !== 'string' || assessment.id.trim() === '') {
    errors.push({
      code: CONSTRAINT_VALIDATION_CODES.CONSTRAINT_MISSING_CONSTRAINT_ID,
      message: 'Assessment is missing a valid id.',
      field: 'id',
      entityId: assessment.id ?? 'unknown',
    });
  }

  if (!assessment.title || typeof assessment.title !== 'string' || assessment.title.trim() === '') {
    errors.push({
      code: CONSTRAINT_VALIDATION_CODES.CONSTRAINT_MISSING_TITLE,
      message: 'Assessment is missing a valid title.',
      field: 'title',
      entityId: assessment.id,
    });
  }

  if (!assessment.constraintType || !CANONICAL_ENGINEERING_CONSTRAINT_ANALYSIS_TYPES.includes(assessment.constraintType)) {
    errors.push({
      code: CONSTRAINT_VALIDATION_CODES.CONSTRAINT_INVALID_TYPE,
      message: `Invalid constraint type: ${String(assessment.constraintType)}`,
      field: 'constraintType',
      entityId: assessment.id,
    });
  }

  if (!assessment.categories || !Array.isArray(assessment.categories) || assessment.categories.length === 0) {
    errors.push({
      code: CONSTRAINT_VALIDATION_CODES.CONSTRAINT_INVALID_CONFIGURATION,
      message: 'Assessment is missing categories array.',
      field: 'categories',
      entityId: assessment.id,
    });
  } else {
    for (const category of assessment.categories) {
      const categoryErrors = validateConstraintCategory(category);
      errors.push(...categoryErrors);
    }
  }

  if (!assessment.severities || !Array.isArray(assessment.severities) || assessment.severities.length === 0) {
    errors.push({
      code: CONSTRAINT_VALIDATION_CODES.CONSTRAINT_INVALID_CONFIGURATION,
      message: 'Assessment is missing severities array.',
      field: 'severities',
      entityId: assessment.id,
    });
  } else {
    for (const severity of assessment.severities) {
      const severityErrors = validateConstraintSeverity(severity);
      errors.push(...severityErrors);
    }
  }

  if (!assessment.reasoningTypes || !Array.isArray(assessment.reasoningTypes) || assessment.reasoningTypes.length === 0) {
    errors.push({
      code: CONSTRAINT_VALIDATION_CODES.CONSTRAINT_INVALID_CONFIGURATION,
      message: 'Assessment is missing reasoningTypes array.',
      field: 'reasoningTypes',
      entityId: assessment.id,
    });
  } else {
    for (const reasoning of assessment.reasoningTypes) {
      const reasoningErrors = validateConstraintReasoning(reasoning);
      errors.push(...reasoningErrors);
    }
  }

  if (!assessment.conceptIds || !Array.isArray(assessment.conceptIds) || assessment.conceptIds.length === 0) {
    errors.push({
      code: CONSTRAINT_VALIDATION_CODES.CONSTRAINT_MISSING_ASSESSMENT_REFERENCE,
      message: 'Assessment is missing conceptIds.',
      field: 'conceptIds',
      entityId: assessment.id,
    });
  }

  if (!assessment.status || !CANONICAL_CONSTRAINT_ANALYSIS_STATUS.includes(assessment.status)) {
    errors.push({
      code: CONSTRAINT_VALIDATION_CODES.CONSTRAINT_INVALID_STATUS,
      message: `Invalid status: ${String(assessment.status)}`,
      field: 'status',
      entityId: assessment.id,
    });
  }

  if (!assessment.governance || !CANONICAL_ASSESSMENT_GOVERNANCE.includes(assessment.governance)) {
    errors.push({
      code: CONSTRAINT_VALIDATION_CODES.CONSTRAINT_INVALID_GOVERNANCE,
      message: `Invalid governance: ${String(assessment.governance)}`,
      field: 'governance',
      entityId: assessment.id,
    });
  }

  if (!assessment.provenance || typeof assessment.provenance !== 'object') {
    errors.push({
      code: CONSTRAINT_VALIDATION_CODES.CONSTRAINT_MISSING_PROVENANCE,
      message: 'Assessment is missing provenance.',
      field: 'provenance',
      entityId: assessment.id,
    });
  } else {
    if (!assessment.provenance.provider || assessment.provenance.provider.trim() === '') {
      errors.push({
        code: CONSTRAINT_VALIDATION_CODES.CONSTRAINT_MISSING_PROVIDER,
        message: 'Provenance is missing a valid provider.',
        field: 'provenance.provider',
        entityId: assessment.id,
      });
    }
    if (!assessment.provenance.rationale || assessment.provenance.rationale.trim() === '') {
      errors.push({
        code: CONSTRAINT_VALIDATION_CODES.CONSTRAINT_MISSING_RATIONALE,
        message: 'Provenance is missing a valid rationale.',
        field: 'provenance.rationale',
        entityId: assessment.id,
      });
    }
  }

  if (!assessment.trace || typeof assessment.trace !== 'object') {
    errors.push({
      code: CONSTRAINT_VALIDATION_CODES.CONSTRAINT_INVALID_TRACE,
      message: 'Assessment is missing trace metadata.',
      field: 'trace',
      entityId: assessment.id,
    });
  } else {
    if (assessment.trace.deterministic !== true) {
      errors.push({
        code: CONSTRAINT_VALIDATION_CODES.CONSTRAINT_INVALID_TRACE,
        message: 'Trace must declare deterministic: true.',
        field: 'trace.deterministic',
        entityId: assessment.id,
      });
    }
    if (assessment.trace.randomUsed !== false) {
      errors.push({
        code: CONSTRAINT_VALIDATION_CODES.CONSTRAINT_INVALID_TRACE,
        message: 'Trace must declare randomUsed: false.',
        field: 'trace.randomUsed',
        entityId: assessment.id,
      });
    }
    if (assessment.trace.timeDependency !== false) {
      errors.push({
        code: CONSTRAINT_VALIDATION_CODES.CONSTRAINT_INVALID_TRACE,
        message: 'Trace must declare timeDependency: false.',
        field: 'trace.timeDependency',
        entityId: assessment.id,
      });
    }
  }

  return errors;
}

/**
 * Validate a ConstraintRelationship.
 * Returns structured errors. Never throws. Deterministic.
 */
export function validateConstraintRelationship(
  rel: ConstraintRelationship,
): readonly ConstraintValidationError[] {
  const errors: ConstraintValidationError[] = [];

  if (!rel.id || rel.id.trim() === '') {
    errors.push({
      code: CONSTRAINT_VALIDATION_CODES.CONSTRAINT_INVALID_REFERENCE,
      message: 'Relationship is missing a valid id.',
      field: 'id',
    });
  }

  if (!rel.sourceConstraintId || rel.sourceConstraintId.trim() === '') {
    errors.push({
      code: CONSTRAINT_VALIDATION_CODES.CONSTRAINT_INVALID_REFERENCE,
      message: 'Relationship is missing sourceConstraintId.',
      field: 'sourceConstraintId',
      entityId: rel.id,
    });
  }

  if (!rel.targetConstraintId || rel.targetConstraintId.trim() === '') {
    errors.push({
      code: CONSTRAINT_VALIDATION_CODES.CONSTRAINT_INVALID_REFERENCE,
      message: 'Relationship is missing targetConstraintId.',
      field: 'targetConstraintId',
      entityId: rel.id,
    });
  }

  if (
    rel.sourceConstraintId &&
    rel.targetConstraintId &&
    rel.sourceConstraintId === rel.targetConstraintId
  ) {
    errors.push({
      code: CONSTRAINT_VALIDATION_CODES.CONSTRAINT_SELF_RELATIONSHIP,
      message: 'Relationship cannot reference itself (source equals target).',
      field: 'sourceConstraintId',
      entityId: rel.id,
    });
  }

  return errors;
}

/**
 * Validate a ConstraintRegistry.
 * Returns structured errors. Never throws. Deterministic.
 */
export function validateConstraintRegistry(
  registry: ConstraintRegistry,
): ConstraintRegistryValidationResult {
  const errors: ConstraintValidationError[] = [];

  if (!registry || typeof registry !== 'object') {
    errors.push({
      code: CONSTRAINT_VALIDATION_CODES.CONSTRAINT_EMPTY_REGISTRY,
      message: 'Registry is null or not an object.',
    });
    return {
      valid: false,
      errors,
      nodeResults: [],
      checkedAt: 'constraint_registry_validation',
    };
  }

  if (!registry.nodes || !Array.isArray(registry.nodes)) {
    errors.push({
      code: CONSTRAINT_VALIDATION_CODES.CONSTRAINT_EMPTY_REGISTRY,
      message: 'Registry is missing nodes array.',
      field: 'nodes',
    });
    return {
      valid: false,
      errors,
      nodeResults: [],
      checkedAt: 'constraint_registry_validation',
    };
  }

  if (registry.nodes.length === 0) {
    errors.push({
      code: CONSTRAINT_VALIDATION_CODES.CONSTRAINT_EMPTY_REGISTRY,
      message: 'Registry has no nodes.',
      field: 'nodes',
    });
    return {
      valid: false,
      errors,
      nodeResults: [],
      checkedAt: 'constraint_registry_validation',
    };
  }

  const nodeResults = registry.nodes.map((node) => {
    const nodeErrors = validateEngineeringConstraintAssessment(node);
    return {
      valid: nodeErrors.length === 0,
      errors: nodeErrors,
      checkedAt: 'constraint_node_validation' as const,
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
        code: CONSTRAINT_VALIDATION_CODES.CONSTRAINT_DUPLICATE_ID,
        message: `Duplicate constraint id: ${node.id}`,
        field: 'id',
        entityId: node.id,
      });
    }
    idSet.add(node.id);

    if (titleSet.has(node.title)) {
      errors.push({
        code: CONSTRAINT_VALIDATION_CODES.CONSTRAINT_DUPLICATE_TITLE,
        message: `Duplicate constraint title: ${node.title}`,
        field: 'title',
        entityId: node.id,
      });
    }
    titleSet.add(node.title);
  }

  if (!registry.metadata || typeof registry.metadata !== 'object') {
    errors.push({
      code: CONSTRAINT_VALIDATION_CODES.CONSTRAINT_REGISTRY_INCONSISTENCY,
      message: 'Registry is missing metadata.',
      field: 'metadata',
    });
  } else {
    if (registry.metadata.nodeCount !== registry.nodes.length) {
      errors.push({
        code: CONSTRAINT_VALIDATION_CODES.CONSTRAINT_REGISTRY_INCONSISTENCY,
        message: `Metadata nodeCount (${registry.metadata.nodeCount}) does not match actual node count (${registry.nodes.length}).`,
        field: 'metadata.nodeCount',
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    nodeResults,
    checkedAt: 'constraint_registry_validation',
  };
}

/**
 * Validate a ConstraintInput.
 * Returns structured errors. Never throws. Deterministic.
 */
export function validateConstraintInput(
  input: ConstraintInput,
): ConstraintInputValidationResult {
  const errors: ConstraintValidationError[] = [];

  if (!input || typeof input !== 'object') {
    errors.push({
      code: CONSTRAINT_VALIDATION_CODES.CONSTRAINT_EMPTY_REGISTRY,
      message: 'Input is null or not an object.',
    });
    return {
      valid: false,
      errors,
      checkedAt: 'constraint_input_validation',
    };
  }

  if (!input.nodes || !Array.isArray(input.nodes)) {
    errors.push({
      code: CONSTRAINT_VALIDATION_CODES.CONSTRAINT_EMPTY_REGISTRY,
      message: 'Input is missing nodes array.',
      field: 'nodes',
    });
    return {
      valid: false,
      errors,
      checkedAt: 'constraint_input_validation',
    };
  }

  if (input.nodes.length === 0) {
    errors.push({
      code: CONSTRAINT_VALIDATION_CODES.CONSTRAINT_EMPTY_REGISTRY,
      message: 'Input has no nodes.',
      field: 'nodes',
    });
    return {
      valid: false,
      errors,
      checkedAt: 'constraint_input_validation',
    };
  }

  for (const node of input.nodes) {
    const nodeErrors = validateEngineeringConstraintAssessment(node);
    errors.push(...nodeErrors);
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'constraint_input_validation',
  };
}

/**
 * Validate a ConstraintAssessmentTrace.
 * Returns structured errors. Never throws. Deterministic.
 */
export function validateConstraintTrace(
  trace: ConstraintAssessmentTrace,
): ConstraintTraceValidationResult {
  const errors: ConstraintValidationError[] = [];

  if (!trace || typeof trace !== 'object') {
    errors.push({
      code: CONSTRAINT_VALIDATION_CODES.CONSTRAINT_INVALID_TRACE,
      message: 'Trace is null or not an object.',
    });
    return {
      valid: false,
      errors,
      checkedAt: 'constraint_trace_validation',
    };
  }

  if (!trace.traceId || typeof trace.traceId !== 'string' || trace.traceId.trim() === '') {
    errors.push({
      code: CONSTRAINT_VALIDATION_CODES.CONSTRAINT_INVALID_TRACE,
      message: 'Trace is missing a valid traceId.',
      field: 'traceId',
    });
  }

  if (trace.deterministic !== true) {
    errors.push({
      code: CONSTRAINT_VALIDATION_CODES.CONSTRAINT_INVALID_TRACE,
      message: 'Trace must declare deterministic: true.',
      field: 'deterministic',
    });
  }

  if (trace.randomUsed !== false) {
    errors.push({
      code: CONSTRAINT_VALIDATION_CODES.CONSTRAINT_INVALID_TRACE,
      message: 'Trace must declare randomUsed: false.',
      field: 'randomUsed',
    });
  }

  if (trace.timeDependency !== false) {
    errors.push({
      code: CONSTRAINT_VALIDATION_CODES.CONSTRAINT_INVALID_TRACE,
      message: 'Trace must declare timeDependency: false.',
      field: 'timeDependency',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'constraint_trace_validation',
  };
}

/**
 * Validate an AssessmentArtifactWithConstraints.
 * Returns structured errors. Never throws. Deterministic.
 */
export function validateAssessmentArtifactWithConstraints(
  artifact: AssessmentArtifactWithConstraints,
): AssessmentArtifactWithConstraintsValidationResult {
  const errors: ConstraintValidationError[] = [];

  if (!artifact || typeof artifact !== 'object') {
    errors.push({
      code: CONSTRAINT_VALIDATION_CODES.CONSTRAINT_MISSING_ASSESSMENT_REFERENCE,
      message: 'Artifact is null or not an object.',
    });
    return {
      valid: false,
      errors,
      checkedAt: 'artifact_constraint_validation',
    };
  }

  if (!artifact.artifactId || artifact.artifactId.trim() === '') {
    errors.push({
      code: CONSTRAINT_VALIDATION_CODES.CONSTRAINT_MISSING_ASSESSMENT_REFERENCE,
      message: 'Artifact is missing a valid artifactId.',
      field: 'artifactId',
    });
  }

  if (!artifact.artifactTitle || artifact.artifactTitle.trim() === '') {
    errors.push({
      code: CONSTRAINT_VALIDATION_CODES.CONSTRAINT_MISSING_TITLE,
      message: 'Artifact is missing a valid artifactTitle.',
      field: 'artifactTitle',
    });
  }

  if (!artifact.constraints || !Array.isArray(artifact.constraints)) {
    errors.push({
      code: CONSTRAINT_VALIDATION_CODES.CONSTRAINT_MISSING_PROVENANCE,
      message: 'Artifact is missing constraints array.',
      field: 'constraints',
    });
  } else {
    for (const constraint of artifact.constraints) {
      const constraintErrors = validateEngineeringConstraintAssessment(constraint);
      errors.push(...constraintErrors);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'artifact_constraint_validation',
  };
}

/**
 * NV-2000-D8-OPT-13 — Portfolio-Oriented Evaluation Validation Layer
 *
 * Deterministic validation for the Portfolio-Oriented Evaluation Kernel.
 * Returns structured errors, never exceptions for expected validation failures.
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import {
  type AssessmentArtifactWithPortfolio,
  type AssessmentArtifactWithPortfolioValidationResult,
  type AssessmentGovernanceLevel,
  type PortfolioArtifactReference,
  type PortfolioArtifactType,
  type PortfolioCompetencyEvidence,
  type PortfolioCompetencyType,
  type PortfolioEvaluation,
  type PortfolioEvaluationProvenance,
  type PortfolioEvaluationStatus,
  type PortfolioEvaluationTrace,
  type PortfolioEvaluationType,
  type PortfolioInput,
  type PortfolioInputValidationResult,
  type PortfolioRegistry,
  type PortfolioRegistryValidationResult,
  type PortfolioRelationship,
  type PortfolioShowcaseClassification,
  type PortfolioTraceValidationResult,
  type PortfolioValidationError,
  type PortfolioValidationResult,
  type ShowcaseLevel,
  CANONICAL_ASSESSMENT_GOVERNANCE,
  CANONICAL_PORTFOLIO_ARTIFACT_TYPES,
  CANONICAL_PORTFOLIO_COMPETENCY_TYPES,
  CANONICAL_PORTFOLIO_EVALUATION_STATUS,
  CANONICAL_PORTFOLIO_EVALUATION_TYPES,
  CANONICAL_SHOWCASE_LEVELS,
} from './AssessmentAgentContract.ts';

// ============================================================================
// VALIDATION CODES — Stable forever (24 codes)
// ============================================================================

export const PORTFOLIO_VALIDATION_CODES = {
  PORTFOLIO_DUPLICATE_ID: 'PORTFOLIO_DUPLICATE_ID',
  PORTFOLIO_DUPLICATE_TITLE: 'PORTFOLIO_DUPLICATE_TITLE',
  PORTFOLIO_ARTIFACT_DUPLICATE_ID: 'PORTFOLIO_ARTIFACT_DUPLICATE_ID',
  PORTFOLIO_COMPETENCY_DUPLICATE_ID: 'PORTFOLIO_COMPETENCY_DUPLICATE_ID',
  PORTFOLIO_SHOWCASE_DUPLICATE_ID: 'PORTFOLIO_SHOWCASE_DUPLICATE_ID',
  PORTFOLIO_INVALID_TYPE: 'PORTFOLIO_INVALID_TYPE',
  PORTFOLIO_INVALID_ARTIFACT: 'PORTFOLIO_INVALID_ARTIFACT',
  PORTFOLIO_INVALID_COMPETENCY: 'PORTFOLIO_INVALID_COMPETENCY',
  PORTFOLIO_INVALID_SHOWCASE: 'PORTFOLIO_INVALID_SHOWCASE',
  PORTFOLIO_INVALID_STATUS: 'PORTFOLIO_INVALID_STATUS',
  PORTFOLIO_INVALID_GOVERNANCE: 'PORTFOLIO_INVALID_GOVERNANCE',
  PORTFOLIO_MISSING_PROVENANCE: 'PORTFOLIO_MISSING_PROVENANCE',
  PORTFOLIO_MISSING_PROVIDER: 'PORTFOLIO_MISSING_PROVIDER',
  PORTFOLIO_MISSING_RATIONALE: 'PORTFOLIO_MISSING_RATIONALE',
  PORTFOLIO_MISSING_ASSESSMENT_REFERENCE: 'PORTFOLIO_MISSING_ASSESSMENT_REFERENCE',
  PORTFOLIO_MISSING_PORTFOLIO_REFERENCE: 'PORTFOLIO_MISSING_PORTFOLIO_REFERENCE',
  PORTFOLIO_MISSING_PORTFOLIO_ID: 'PORTFOLIO_MISSING_PORTFOLIO_ID',
  PORTFOLIO_MISSING_TITLE: 'PORTFOLIO_MISSING_TITLE',
  PORTFOLIO_SELF_RELATIONSHIP: 'PORTFOLIO_SELF_RELATIONSHIP',
  PORTFOLIO_EMPTY_REGISTRY: 'PORTFOLIO_EMPTY_REGISTRY',
  PORTFOLIO_INVALID_TRACE: 'PORTFOLIO_INVALID_TRACE',
  PORTFOLIO_REGISTRY_INCONSISTENCY: 'PORTFOLIO_REGISTRY_INCONSISTENCY',
  PORTFOLIO_INVALID_CONFIGURATION: 'PORTFOLIO_INVALID_CONFIGURATION',
  PORTFOLIO_INVALID_REFERENCE: 'PORTFOLIO_INVALID_REFERENCE',
} as const;

// ============================================================================
// VALIDATION FUNCTIONS — Pure, never throw
// ============================================================================

/**
 * Validate a PortfolioArtifactReference.
 */
export function validatePortfolioArtifactReference(
  artifact: PortfolioArtifactReference,
): readonly PortfolioValidationError[] {
  const errors: PortfolioValidationError[] = [];

  if (!artifact.id || artifact.id.trim() === '') {
    errors.push({
      code: PORTFOLIO_VALIDATION_CODES.PORTFOLIO_ARTIFACT_DUPLICATE_ID,
      message: 'Artifact reference is missing a valid id.',
      field: 'id',
    });
  }

  if (!artifact.artifactType || !CANONICAL_PORTFOLIO_ARTIFACT_TYPES.includes(artifact.artifactType)) {
    errors.push({
      code: PORTFOLIO_VALIDATION_CODES.PORTFOLIO_INVALID_ARTIFACT,
      message: `Invalid artifact type: ${String(artifact.artifactType)}`,
      field: 'artifactType',
      entityId: artifact.id,
    });
  }

  return errors;
}

/**
 * Validate a PortfolioCompetencyEvidence.
 */
export function validatePortfolioCompetencyEvidence(
  competency: PortfolioCompetencyEvidence,
): readonly PortfolioValidationError[] {
  const errors: PortfolioValidationError[] = [];

  if (!competency.id || competency.id.trim() === '') {
    errors.push({
      code: PORTFOLIO_VALIDATION_CODES.PORTFOLIO_COMPETENCY_DUPLICATE_ID,
      message: 'Competency evidence is missing a valid id.',
      field: 'id',
    });
  }

  if (!competency.competencyType || !CANONICAL_PORTFOLIO_COMPETENCY_TYPES.includes(competency.competencyType)) {
    errors.push({
      code: PORTFOLIO_VALIDATION_CODES.PORTFOLIO_INVALID_COMPETENCY,
      message: `Invalid competency type: ${String(competency.competencyType)}`,
      field: 'competencyType',
      entityId: competency.id,
    });
  }

  return errors;
}

/**
 * Validate a PortfolioShowcaseClassification.
 */
export function validatePortfolioShowcaseClassification(
  showcase: PortfolioShowcaseClassification,
): readonly PortfolioValidationError[] {
  const errors: PortfolioValidationError[] = [];

  if (!showcase.id || showcase.id.trim() === '') {
    errors.push({
      code: PORTFOLIO_VALIDATION_CODES.PORTFOLIO_SHOWCASE_DUPLICATE_ID,
      message: 'Showcase classification is missing a valid id.',
      field: 'id',
    });
  }

  if (!showcase.showcaseLevel || !CANONICAL_SHOWCASE_LEVELS.includes(showcase.showcaseLevel)) {
    errors.push({
      code: PORTFOLIO_VALIDATION_CODES.PORTFOLIO_INVALID_SHOWCASE,
      message: `Invalid showcase level: ${String(showcase.showcaseLevel)}`,
      field: 'showcaseLevel',
      entityId: showcase.id,
    });
  }

  return errors;
}

/**
 * Validate a single PortfolioEvaluation.
 * Returns structured errors. Never throws. Deterministic.
 */
export function validatePortfolioEvaluation(
  evaluation: PortfolioEvaluation,
): readonly PortfolioValidationError[] {
  const errors: PortfolioValidationError[] = [];

  if (!evaluation || typeof evaluation !== 'object') {
    errors.push({
      code: PORTFOLIO_VALIDATION_CODES.PORTFOLIO_MISSING_PORTFOLIO_ID,
      message: 'Evaluation is null or not an object.',
    });
    return errors;
  }

  if (!evaluation.id || typeof evaluation.id !== 'string' || evaluation.id.trim() === '') {
    errors.push({
      code: PORTFOLIO_VALIDATION_CODES.PORTFOLIO_MISSING_PORTFOLIO_ID,
      message: 'Evaluation is missing a valid id.',
      field: 'id',
      entityId: evaluation.id ?? 'unknown',
    });
  }

  if (!evaluation.title || typeof evaluation.title !== 'string' || evaluation.title.trim() === '') {
    errors.push({
      code: PORTFOLIO_VALIDATION_CODES.PORTFOLIO_MISSING_TITLE,
      message: 'Evaluation is missing a valid title.',
      field: 'title',
      entityId: evaluation.id,
    });
  }

  if (!evaluation.evaluationType || !CANONICAL_PORTFOLIO_EVALUATION_TYPES.includes(evaluation.evaluationType)) {
    errors.push({
      code: PORTFOLIO_VALIDATION_CODES.PORTFOLIO_INVALID_TYPE,
      message: `Invalid evaluation type: ${String(evaluation.evaluationType)}`,
      field: 'evaluationType',
      entityId: evaluation.id,
    });
  }

  if (!evaluation.artifacts || !Array.isArray(evaluation.artifacts) || evaluation.artifacts.length === 0) {
    errors.push({
      code: PORTFOLIO_VALIDATION_CODES.PORTFOLIO_INVALID_CONFIGURATION,
      message: 'Evaluation is missing artifacts array.',
      field: 'artifacts',
      entityId: evaluation.id,
    });
  } else {
    for (const artifact of evaluation.artifacts) {
      const artifactErrors = validatePortfolioArtifactReference(artifact);
      errors.push(...artifactErrors);
    }
  }

  if (!evaluation.competencies || !Array.isArray(evaluation.competencies) || evaluation.competencies.length === 0) {
    errors.push({
      code: PORTFOLIO_VALIDATION_CODES.PORTFOLIO_INVALID_CONFIGURATION,
      message: 'Evaluation is missing competencies array.',
      field: 'competencies',
      entityId: evaluation.id,
    });
  } else {
    for (const competency of evaluation.competencies) {
      const competencyErrors = validatePortfolioCompetencyEvidence(competency);
      errors.push(...competencyErrors);
    }
  }

  if (!evaluation.showcaseClassifications || !Array.isArray(evaluation.showcaseClassifications) || evaluation.showcaseClassifications.length === 0) {
    errors.push({
      code: PORTFOLIO_VALIDATION_CODES.PORTFOLIO_INVALID_CONFIGURATION,
      message: 'Evaluation is missing showcaseClassifications array.',
      field: 'showcaseClassifications',
      entityId: evaluation.id,
    });
  } else {
    for (const showcase of evaluation.showcaseClassifications) {
      const showcaseErrors = validatePortfolioShowcaseClassification(showcase);
      errors.push(...showcaseErrors);
    }
  }

  if (!evaluation.conceptIds || !Array.isArray(evaluation.conceptIds) || evaluation.conceptIds.length === 0) {
    errors.push({
      code: PORTFOLIO_VALIDATION_CODES.PORTFOLIO_MISSING_ASSESSMENT_REFERENCE,
      message: 'Evaluation is missing conceptIds.',
      field: 'conceptIds',
      entityId: evaluation.id,
    });
  }

  if (!evaluation.status || !CANONICAL_PORTFOLIO_EVALUATION_STATUS.includes(evaluation.status)) {
    errors.push({
      code: PORTFOLIO_VALIDATION_CODES.PORTFOLIO_INVALID_STATUS,
      message: `Invalid status: ${String(evaluation.status)}`,
      field: 'status',
      entityId: evaluation.id,
    });
  }

  if (!evaluation.governance || !CANONICAL_ASSESSMENT_GOVERNANCE.includes(evaluation.governance)) {
    errors.push({
      code: PORTFOLIO_VALIDATION_CODES.PORTFOLIO_INVALID_GOVERNANCE,
      message: `Invalid governance: ${String(evaluation.governance)}`,
      field: 'governance',
      entityId: evaluation.id,
    });
  }

  if (!evaluation.provenance || typeof evaluation.provenance !== 'object') {
    errors.push({
      code: PORTFOLIO_VALIDATION_CODES.PORTFOLIO_MISSING_PROVENANCE,
      message: 'Evaluation is missing provenance.',
      field: 'provenance',
      entityId: evaluation.id,
    });
  } else {
    if (!evaluation.provenance.provider || evaluation.provenance.provider.trim() === '') {
      errors.push({
        code: PORTFOLIO_VALIDATION_CODES.PORTFOLIO_MISSING_PROVIDER,
        message: 'Provenance is missing a valid provider.',
        field: 'provenance.provider',
        entityId: evaluation.id,
      });
    }
    if (!evaluation.provenance.rationale || evaluation.provenance.rationale.trim() === '') {
      errors.push({
        code: PORTFOLIO_VALIDATION_CODES.PORTFOLIO_MISSING_RATIONALE,
        message: 'Provenance is missing a valid rationale.',
        field: 'provenance.rationale',
        entityId: evaluation.id,
      });
    }
  }

  if (!evaluation.trace || typeof evaluation.trace !== 'object') {
    errors.push({
      code: PORTFOLIO_VALIDATION_CODES.PORTFOLIO_INVALID_TRACE,
      message: 'Evaluation is missing trace metadata.',
      field: 'trace',
      entityId: evaluation.id,
    });
  } else {
    if (evaluation.trace.deterministic !== true) {
      errors.push({
        code: PORTFOLIO_VALIDATION_CODES.PORTFOLIO_INVALID_TRACE,
        message: 'Trace must declare deterministic: true.',
        field: 'trace.deterministic',
        entityId: evaluation.id,
      });
    }
    if (evaluation.trace.randomUsed !== false) {
      errors.push({
        code: PORTFOLIO_VALIDATION_CODES.PORTFOLIO_INVALID_TRACE,
        message: 'Trace must declare randomUsed: false.',
        field: 'trace.randomUsed',
        entityId: evaluation.id,
      });
    }
    if (evaluation.trace.timeDependency !== false) {
      errors.push({
        code: PORTFOLIO_VALIDATION_CODES.PORTFOLIO_INVALID_TRACE,
        message: 'Trace must declare timeDependency: false.',
        field: 'trace.timeDependency',
        entityId: evaluation.id,
      });
    }
  }

  return errors;
}

/**
 * Validate a PortfolioRelationship.
 * Returns structured errors. Never throws. Deterministic.
 */
export function validatePortfolioRelationship(
  rel: PortfolioRelationship,
): readonly PortfolioValidationError[] {
  const errors: PortfolioValidationError[] = [];

  if (!rel.id || rel.id.trim() === '') {
    errors.push({
      code: PORTFOLIO_VALIDATION_CODES.PORTFOLIO_INVALID_REFERENCE,
      message: 'Relationship is missing a valid id.',
      field: 'id',
    });
  }

  if (!rel.sourceEvaluationId || rel.sourceEvaluationId.trim() === '') {
    errors.push({
      code: PORTFOLIO_VALIDATION_CODES.PORTFOLIO_INVALID_REFERENCE,
      message: 'Relationship is missing sourceEvaluationId.',
      field: 'sourceEvaluationId',
      entityId: rel.id,
    });
  }

  if (!rel.targetEvaluationId || rel.targetEvaluationId.trim() === '') {
    errors.push({
      code: PORTFOLIO_VALIDATION_CODES.PORTFOLIO_INVALID_REFERENCE,
      message: 'Relationship is missing targetEvaluationId.',
      field: 'targetEvaluationId',
      entityId: rel.id,
    });
  }

  if (
    rel.sourceEvaluationId &&
    rel.targetEvaluationId &&
    rel.sourceEvaluationId === rel.targetEvaluationId
  ) {
    errors.push({
      code: PORTFOLIO_VALIDATION_CODES.PORTFOLIO_SELF_RELATIONSHIP,
      message: 'Relationship cannot reference itself (source equals target).',
      field: 'sourceEvaluationId',
      entityId: rel.id,
    });
  }

  return errors;
}

/**
 * Validate a PortfolioRegistry.
 * Returns structured errors. Never throws. Deterministic.
 */
export function validatePortfolioRegistry(
  registry: PortfolioRegistry,
): PortfolioRegistryValidationResult {
  const errors: PortfolioValidationError[] = [];

  if (!registry || typeof registry !== 'object') {
    errors.push({
      code: PORTFOLIO_VALIDATION_CODES.PORTFOLIO_EMPTY_REGISTRY,
      message: 'Registry is null or not an object.',
    });
    return {
      valid: false,
      errors,
      nodeResults: [],
      checkedAt: 'portfolio_registry_validation',
    };
  }

  if (!registry.nodes || !Array.isArray(registry.nodes)) {
    errors.push({
      code: PORTFOLIO_VALIDATION_CODES.PORTFOLIO_EMPTY_REGISTRY,
      message: 'Registry is missing nodes array.',
      field: 'nodes',
    });
    return {
      valid: false,
      errors,
      nodeResults: [],
      checkedAt: 'portfolio_registry_validation',
    };
  }

  if (registry.nodes.length === 0) {
    errors.push({
      code: PORTFOLIO_VALIDATION_CODES.PORTFOLIO_EMPTY_REGISTRY,
      message: 'Registry has no nodes.',
      field: 'nodes',
    });
    return {
      valid: false,
      errors,
      nodeResults: [],
      checkedAt: 'portfolio_registry_validation',
    };
  }

  const nodeResults = registry.nodes.map((node) => {
    const nodeErrors = validatePortfolioEvaluation(node);
    return {
      valid: nodeErrors.length === 0,
      errors: nodeErrors,
      checkedAt: 'portfolio_node_validation' as const,
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
        code: PORTFOLIO_VALIDATION_CODES.PORTFOLIO_DUPLICATE_ID,
        message: `Duplicate portfolio evaluation id: ${node.id}`,
        field: 'id',
        entityId: node.id,
      });
    }
    idSet.add(node.id);

    if (titleSet.has(node.title)) {
      errors.push({
        code: PORTFOLIO_VALIDATION_CODES.PORTFOLIO_DUPLICATE_TITLE,
        message: `Duplicate portfolio evaluation title: ${node.title}`,
        field: 'title',
        entityId: node.id,
      });
    }
    titleSet.add(node.title);
  }

  if (!registry.metadata || typeof registry.metadata !== 'object') {
    errors.push({
      code: PORTFOLIO_VALIDATION_CODES.PORTFOLIO_REGISTRY_INCONSISTENCY,
      message: 'Registry is missing metadata.',
      field: 'metadata',
    });
  } else {
    if (registry.metadata.nodeCount !== registry.nodes.length) {
      errors.push({
        code: PORTFOLIO_VALIDATION_CODES.PORTFOLIO_REGISTRY_INCONSISTENCY,
        message: `Metadata nodeCount (${registry.metadata.nodeCount}) does not match actual node count (${registry.nodes.length}).`,
        field: 'metadata.nodeCount',
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    nodeResults,
    checkedAt: 'portfolio_registry_validation',
  };
}

/**
 * Validate a PortfolioInput.
 * Returns structured errors. Never throws. Deterministic.
 */
export function validatePortfolioInput(
  input: PortfolioInput,
): PortfolioInputValidationResult {
  const errors: PortfolioValidationError[] = [];

  if (!input || typeof input !== 'object') {
    errors.push({
      code: PORTFOLIO_VALIDATION_CODES.PORTFOLIO_EMPTY_REGISTRY,
      message: 'Input is null or not an object.',
    });
    return {
      valid: false,
      errors,
      checkedAt: 'portfolio_input_validation',
    };
  }

  if (!input.nodes || !Array.isArray(input.nodes)) {
    errors.push({
      code: PORTFOLIO_VALIDATION_CODES.PORTFOLIO_EMPTY_REGISTRY,
      message: 'Input is missing nodes array.',
      field: 'nodes',
    });
    return {
      valid: false,
      errors,
      checkedAt: 'portfolio_input_validation',
    };
  }

  if (input.nodes.length === 0) {
    errors.push({
      code: PORTFOLIO_VALIDATION_CODES.PORTFOLIO_EMPTY_REGISTRY,
      message: 'Input has no nodes.',
      field: 'nodes',
    });
    return {
      valid: false,
      errors,
      checkedAt: 'portfolio_input_validation',
    };
  }

  for (const node of input.nodes) {
    const nodeErrors = validatePortfolioEvaluation(node);
    errors.push(...nodeErrors);
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'portfolio_input_validation',
  };
}

/**
 * Validate a PortfolioEvaluationTrace.
 * Returns structured errors. Never throws. Deterministic.
 */
export function validatePortfolioTrace(
  trace: PortfolioEvaluationTrace,
): PortfolioTraceValidationResult {
  const errors: PortfolioValidationError[] = [];

  if (!trace || typeof trace !== 'object') {
    errors.push({
      code: PORTFOLIO_VALIDATION_CODES.PORTFOLIO_INVALID_TRACE,
      message: 'Trace is null or not an object.',
    });
    return {
      valid: false,
      errors,
      checkedAt: 'portfolio_trace_validation',
    };
  }

  if (!trace.traceId || typeof trace.traceId !== 'string' || trace.traceId.trim() === '') {
    errors.push({
      code: PORTFOLIO_VALIDATION_CODES.PORTFOLIO_INVALID_TRACE,
      message: 'Trace is missing a valid traceId.',
      field: 'traceId',
    });
  }

  if (trace.deterministic !== true) {
    errors.push({
      code: PORTFOLIO_VALIDATION_CODES.PORTFOLIO_INVALID_TRACE,
      message: 'Trace must declare deterministic: true.',
      field: 'deterministic',
    });
  }

  if (trace.randomUsed !== false) {
    errors.push({
      code: PORTFOLIO_VALIDATION_CODES.PORTFOLIO_INVALID_TRACE,
      message: 'Trace must declare randomUsed: false.',
      field: 'randomUsed',
    });
  }

  if (trace.timeDependency !== false) {
    errors.push({
      code: PORTFOLIO_VALIDATION_CODES.PORTFOLIO_INVALID_TRACE,
      message: 'Trace must declare timeDependency: false.',
      field: 'timeDependency',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'portfolio_trace_validation',
  };
}

/**
 * Validate an AssessmentArtifactWithPortfolio.
 * Returns structured errors. Never throws. Deterministic.
 */
export function validateAssessmentArtifactWithPortfolio(
  artifact: AssessmentArtifactWithPortfolio,
): AssessmentArtifactWithPortfolioValidationResult {
  const errors: PortfolioValidationError[] = [];

  if (!artifact || typeof artifact !== 'object') {
    errors.push({
      code: PORTFOLIO_VALIDATION_CODES.PORTFOLIO_MISSING_ASSESSMENT_REFERENCE,
      message: 'Artifact is null or not an object.',
    });
    return {
      valid: false,
      errors,
      checkedAt: 'artifact_portfolio_validation',
    };
  }

  if (!artifact.artifactId || artifact.artifactId.trim() === '') {
    errors.push({
      code: PORTFOLIO_VALIDATION_CODES.PORTFOLIO_MISSING_ASSESSMENT_REFERENCE,
      message: 'Artifact is missing a valid artifactId.',
      field: 'artifactId',
    });
  }

  if (!artifact.artifactTitle || artifact.artifactTitle.trim() === '') {
    errors.push({
      code: PORTFOLIO_VALIDATION_CODES.PORTFOLIO_MISSING_TITLE,
      message: 'Artifact is missing a valid artifactTitle.',
      field: 'artifactTitle',
    });
  }

  if (!artifact.portfolioEvaluations || !Array.isArray(artifact.portfolioEvaluations)) {
    errors.push({
      code: PORTFOLIO_VALIDATION_CODES.PORTFOLIO_MISSING_PROVENANCE,
      message: 'Artifact is missing portfolioEvaluations array.',
      field: 'portfolioEvaluations',
    });
  } else {
    for (const evaluation of artifact.portfolioEvaluations) {
      const evaluationErrors = validatePortfolioEvaluation(evaluation);
      errors.push(...evaluationErrors);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'artifact_portfolio_validation',
  };
}

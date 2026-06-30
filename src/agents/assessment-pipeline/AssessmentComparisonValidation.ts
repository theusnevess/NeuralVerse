/**
 * NV-2000-D8-OPT-10 — Comparison Validation Layer
 *
 * Deterministic validation for the Comparison Kernel.
 * Returns structured errors, never exceptions for expected validation failures.
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import {
  type AssessmentArtifactWithComparisons,
  type AssessmentArtifactWithComparisonsValidationResult,
  type AssessmentGovernanceLevel,
  type ComparativeAssessment,
  type ComparativeAssessmentStatus,
  type ComparisonAssessmentProvenance,
  type ComparisonAssessmentTrace,
  type ComparisonDimensionEntry,
  type ComparisonInput,
  type ComparisonInputValidationResult,
  type ComparisonReasoningType,
  type ComparisonRegistry,
  type ComparisonRegistryValidationResult,
  type ComparisonRelationship,
  type ComparisonTraceValidationResult,
  type ComparisonValidationError,
  type ComparisonValidationResult,
  type DecisionContext,
  type DecisionContextType,
  type TradeOffEvaluation,
  type TradeOffType,
  CANONICAL_ASSESSMENT_GOVERNANCE,
  CANONICAL_COMPARISON_DIMENSIONS,
  CANONICAL_COMPARISON_REASONING_TYPES,
  CANONICAL_COMPARATIVE_ASSESSMENT_STATUS,
  CANONICAL_DECISION_CONTEXT_TYPES,
  CANONICAL_TRADE_OFF_TYPES,
} from './AssessmentAgentContract.ts';

// ============================================================================
// VALIDATION CODES — Stable forever (25 codes)
// ============================================================================

export const COMPARISON_VALIDATION_CODES = {
  COMPARISON_DUPLICATE_ID: 'COMPARISON_DUPLICATE_ID',
  COMPARISON_DUPLICATE_TITLE: 'COMPARISON_DUPLICATE_TITLE',
  DIMENSION_DUPLICATE_ID: 'DIMENSION_DUPLICATE_ID',
  TRADE_OFF_DUPLICATE_ID: 'TRADE_OFF_DUPLICATE_ID',
  DECISION_CONTEXT_DUPLICATE_ID: 'DECISION_CONTEXT_DUPLICATE_ID',
  COMPARISON_INVALID_REASONING: 'COMPARISON_INVALID_REASONING',
  COMPARISON_INVALID_DIMENSION: 'COMPARISON_INVALID_DIMENSION',
  COMPARISON_INVALID_TRADE_OFF: 'COMPARISON_INVALID_TRADE_OFF',
  COMPARISON_INVALID_CONTEXT: 'COMPARISON_INVALID_CONTEXT',
  COMPARISON_INVALID_DECISION_CONTEXT: 'COMPARISON_INVALID_DECISION_CONTEXT',
  COMPARISON_INVALID_STATUS: 'COMPARISON_INVALID_STATUS',
  COMPARISON_INVALID_GOVERNANCE: 'COMPARISON_INVALID_GOVERNANCE',
  COMPARISON_MISSING_PROVENANCE: 'COMPARISON_MISSING_PROVENANCE',
  COMPARISON_MISSING_PROVIDER: 'COMPARISON_MISSING_PROVIDER',
  COMPARISON_MISSING_RATIONALE: 'COMPARISON_MISSING_RATIONALE',
  COMPARISON_MISSING_ASSESSMENT_REFERENCE: 'COMPARISON_MISSING_ASSESSMENT_REFERENCE',
  COMPARISON_MISSING_COMPARISON_ID: 'COMPARISON_MISSING_COMPARISON_ID',
  COMPARISON_MISSING_TITLE: 'COMPARISON_MISSING_TITLE',
  COMPARISON_SELF_RELATIONSHIP: 'COMPARISON_SELF_RELATIONSHIP',
  COMPARISON_EMPTY_REGISTRY: 'COMPARISON_EMPTY_REGISTRY',
  COMPARISON_INVALID_TRACE: 'COMPARISON_INVALID_TRACE',
  COMPARISON_REGISTRY_INCONSISTENCY: 'COMPARISON_REGISTRY_INCONSISTENCY',
  COMPARISON_INVALID_CONFIGURATION: 'COMPARISON_INVALID_CONFIGURATION',
  COMPARISON_INVALID_REFERENCE: 'COMPARISON_INVALID_REFERENCE',
  COMPARISON_DUPLICATE_RELATIONSHIP: 'COMPARISON_DUPLICATE_RELATIONSHIP',
} as const;

// ============================================================================
// VALIDATION FUNCTIONS — Pure, never throw
// ============================================================================

/**
 * Validate a ComparisonDimensionEntry.
 */
export function validateComparisonDimension(
  dim: ComparisonDimensionEntry,
): readonly ComparisonValidationError[] {
  const errors: ComparisonValidationError[] = [];

  if (!dim.id || dim.id.trim() === '') {
    errors.push({
      code: COMPARISON_VALIDATION_CODES.DIMENSION_DUPLICATE_ID,
      message: 'Dimension is missing a valid id.',
      field: 'id',
    });
  }

  if (!dim.dimension || !CANONICAL_COMPARISON_DIMENSIONS.includes(dim.dimension)) {
    errors.push({
      code: COMPARISON_VALIDATION_CODES.COMPARISON_INVALID_DIMENSION,
      message: `Invalid dimension: ${String(dim.dimension)}`,
      field: 'dimension',
      entityId: dim.id,
    });
  }

  return errors;
}

/**
 * Validate a TradeOffEvaluation.
 */
export function validateTradeOffEvaluation(
  tradeOff: TradeOffEvaluation,
): readonly ComparisonValidationError[] {
  const errors: ComparisonValidationError[] = [];

  if (!tradeOff.id || tradeOff.id.trim() === '') {
    errors.push({
      code: COMPARISON_VALIDATION_CODES.TRADE_OFF_DUPLICATE_ID,
      message: 'Trade-off is missing a valid id.',
      field: 'id',
    });
  }

  if (!tradeOff.tradeOffType || !CANONICAL_TRADE_OFF_TYPES.includes(tradeOff.tradeOffType)) {
    errors.push({
      code: COMPARISON_VALIDATION_CODES.COMPARISON_INVALID_TRADE_OFF,
      message: `Invalid trade-off type: ${String(tradeOff.tradeOffType)}`,
      field: 'tradeOffType',
      entityId: tradeOff.id,
    });
  }

  return errors;
}

/**
 * Validate a DecisionContext.
 */
export function validateDecisionContext(
  context: DecisionContext,
): readonly ComparisonValidationError[] {
  const errors: ComparisonValidationError[] = [];

  if (!context.id || context.id.trim() === '') {
    errors.push({
      code: COMPARISON_VALIDATION_CODES.DECISION_CONTEXT_DUPLICATE_ID,
      message: 'Decision context is missing a valid id.',
      field: 'id',
    });
  }

  if (!context.contextType || !CANONICAL_DECISION_CONTEXT_TYPES.includes(context.contextType)) {
    errors.push({
      code: COMPARISON_VALIDATION_CODES.COMPARISON_INVALID_CONTEXT,
      message: `Invalid decision context type: ${String(context.contextType)}`,
      field: 'contextType',
      entityId: context.id,
    });
  }

  return errors;
}

/**
 * Validate a single ComparativeAssessment.
 * Returns structured errors. Never throws. Deterministic.
 */
export function validateComparativeAssessment(
  assessment: ComparativeAssessment,
): readonly ComparisonValidationError[] {
  const errors: ComparisonValidationError[] = [];

  if (!assessment || typeof assessment !== 'object') {
    errors.push({
      code: COMPARISON_VALIDATION_CODES.COMPARISON_MISSING_COMPARISON_ID,
      message: 'Assessment is null or not an object.',
    });
    return errors;
  }

  if (!assessment.id || typeof assessment.id !== 'string' || assessment.id.trim() === '') {
    errors.push({
      code: COMPARISON_VALIDATION_CODES.COMPARISON_MISSING_COMPARISON_ID,
      message: 'Assessment is missing a valid id.',
      field: 'id',
      entityId: assessment.id ?? 'unknown',
    });
  }

  if (!assessment.title || typeof assessment.title !== 'string' || assessment.title.trim() === '') {
    errors.push({
      code: COMPARISON_VALIDATION_CODES.COMPARISON_MISSING_TITLE,
      message: 'Assessment is missing a valid title.',
      field: 'title',
      entityId: assessment.id,
    });
  }

  if (!assessment.reasoningType || !CANONICAL_COMPARISON_REASONING_TYPES.includes(assessment.reasoningType)) {
    errors.push({
      code: COMPARISON_VALIDATION_CODES.COMPARISON_INVALID_REASONING,
      message: `Invalid reasoning type: ${String(assessment.reasoningType)}`,
      field: 'reasoningType',
      entityId: assessment.id,
    });
  }

  if (!assessment.dimensions || !Array.isArray(assessment.dimensions)) {
    errors.push({
      code: COMPARISON_VALIDATION_CODES.COMPARISON_INVALID_CONFIGURATION,
      message: 'Assessment is missing dimensions array.',
      field: 'dimensions',
      entityId: assessment.id,
    });
  } else {
    for (const dim of assessment.dimensions) {
      const dimErrors = validateComparisonDimension(dim);
      errors.push(...dimErrors);
    }
  }

  if (!assessment.tradeOffs || !Array.isArray(assessment.tradeOffs)) {
    errors.push({
      code: COMPARISON_VALIDATION_CODES.COMPARISON_INVALID_CONFIGURATION,
      message: 'Assessment is missing tradeOffs array.',
      field: 'tradeOffs',
      entityId: assessment.id,
    });
  } else {
    for (const tradeOff of assessment.tradeOffs) {
      const tradeOffErrors = validateTradeOffEvaluation(tradeOff);
      errors.push(...tradeOffErrors);
    }
  }

  if (!assessment.decisionContext || typeof assessment.decisionContext !== 'object') {
    errors.push({
      code: COMPARISON_VALIDATION_CODES.COMPARISON_INVALID_CONFIGURATION,
      message: 'Assessment is missing decisionContext.',
      field: 'decisionContext',
      entityId: assessment.id,
    });
  } else {
    const contextErrors = validateDecisionContext(assessment.decisionContext);
    errors.push(...contextErrors);
  }

  if (!assessment.alternatives || !Array.isArray(assessment.alternatives) || assessment.alternatives.length === 0) {
    errors.push({
      code: COMPARISON_VALIDATION_CODES.COMPARISON_MISSING_ASSESSMENT_REFERENCE,
      message: 'Assessment is missing alternatives.',
      field: 'alternatives',
      entityId: assessment.id,
    });
  }

  if (!assessment.conceptIds || !Array.isArray(assessment.conceptIds) || assessment.conceptIds.length === 0) {
    errors.push({
      code: COMPARISON_VALIDATION_CODES.COMPARISON_MISSING_ASSESSMENT_REFERENCE,
      message: 'Assessment is missing conceptIds.',
      field: 'conceptIds',
      entityId: assessment.id,
    });
  }

  if (!assessment.status || !CANONICAL_COMPARATIVE_ASSESSMENT_STATUS.includes(assessment.status)) {
    errors.push({
      code: COMPARISON_VALIDATION_CODES.COMPARISON_INVALID_STATUS,
      message: `Invalid status: ${String(assessment.status)}`,
      field: 'status',
      entityId: assessment.id,
    });
  }

  if (!assessment.governance || !CANONICAL_ASSESSMENT_GOVERNANCE.includes(assessment.governance)) {
    errors.push({
      code: COMPARISON_VALIDATION_CODES.COMPARISON_INVALID_GOVERNANCE,
      message: `Invalid governance: ${String(assessment.governance)}`,
      field: 'governance',
      entityId: assessment.id,
    });
  }

  if (!assessment.provenance || typeof assessment.provenance !== 'object') {
    errors.push({
      code: COMPARISON_VALIDATION_CODES.COMPARISON_MISSING_PROVENANCE,
      message: 'Assessment is missing provenance.',
      field: 'provenance',
      entityId: assessment.id,
    });
  } else {
    if (!assessment.provenance.provider || assessment.provenance.provider.trim() === '') {
      errors.push({
        code: COMPARISON_VALIDATION_CODES.COMPARISON_MISSING_PROVIDER,
        message: 'Provenance is missing a valid provider.',
        field: 'provenance.provider',
        entityId: assessment.id,
      });
    }
    if (!assessment.provenance.rationale || assessment.provenance.rationale.trim() === '') {
      errors.push({
        code: COMPARISON_VALIDATION_CODES.COMPARISON_MISSING_RATIONALE,
        message: 'Provenance is missing a valid rationale.',
        field: 'provenance.rationale',
        entityId: assessment.id,
      });
    }
  }

  if (!assessment.trace || typeof assessment.trace !== 'object') {
    errors.push({
      code: COMPARISON_VALIDATION_CODES.COMPARISON_INVALID_TRACE,
      message: 'Assessment is missing trace metadata.',
      field: 'trace',
      entityId: assessment.id,
    });
  } else {
    if (assessment.trace.deterministic !== true) {
      errors.push({
        code: COMPARISON_VALIDATION_CODES.COMPARISON_INVALID_TRACE,
        message: 'Trace must declare deterministic: true.',
        field: 'trace.deterministic',
        entityId: assessment.id,
      });
    }
    if (assessment.trace.randomUsed !== false) {
      errors.push({
        code: COMPARISON_VALIDATION_CODES.COMPARISON_INVALID_TRACE,
        message: 'Trace must declare randomUsed: false.',
        field: 'trace.randomUsed',
        entityId: assessment.id,
      });
    }
    if (assessment.trace.timeDependency !== false) {
      errors.push({
        code: COMPARISON_VALIDATION_CODES.COMPARISON_INVALID_TRACE,
        message: 'Trace must declare timeDependency: false.',
        field: 'trace.timeDependency',
        entityId: assessment.id,
      });
    }
  }

  return errors;
}

/**
 * Validate a ComparisonRelationship.
 * Returns structured errors. Never throws. Deterministic.
 */
export function validateComparisonRelationship(
  rel: ComparisonRelationship,
): readonly ComparisonValidationError[] {
  const errors: ComparisonValidationError[] = [];

  if (!rel.id || rel.id.trim() === '') {
    errors.push({
      code: COMPARISON_VALIDATION_CODES.COMPARISON_INVALID_REFERENCE,
      message: 'Relationship is missing a valid id.',
      field: 'id',
    });
  }

  if (!rel.sourceComparisonId || rel.sourceComparisonId.trim() === '') {
    errors.push({
      code: COMPARISON_VALIDATION_CODES.COMPARISON_MISSING_ASSESSMENT_REFERENCE,
      message: 'Relationship is missing sourceComparisonId.',
      field: 'sourceComparisonId',
      entityId: rel.id,
    });
  }

  if (!rel.targetComparisonId || rel.targetComparisonId.trim() === '') {
    errors.push({
      code: COMPARISON_VALIDATION_CODES.COMPARISON_MISSING_ASSESSMENT_REFERENCE,
      message: 'Relationship is missing targetComparisonId.',
      field: 'targetComparisonId',
      entityId: rel.id,
    });
  }

  if (
    rel.sourceComparisonId &&
    rel.targetComparisonId &&
    rel.sourceComparisonId === rel.targetComparisonId
  ) {
    errors.push({
      code: COMPARISON_VALIDATION_CODES.COMPARISON_SELF_RELATIONSHIP,
      message: 'Relationship cannot reference itself (source equals target).',
      field: 'sourceComparisonId',
      entityId: rel.id,
    });
  }

  return errors;
}

/**
 * Validate a ComparisonRegistry.
 * Returns structured errors. Never throws. Deterministic.
 */
export function validateComparisonRegistry(
  registry: ComparisonRegistry,
): ComparisonRegistryValidationResult {
  const errors: ComparisonValidationError[] = [];

  if (!registry || typeof registry !== 'object') {
    errors.push({
      code: COMPARISON_VALIDATION_CODES.COMPARISON_EMPTY_REGISTRY,
      message: 'Registry is null or not an object.',
    });
    return {
      valid: false,
      errors,
      nodeResults: [],
      checkedAt: 'comparison_registry_validation',
    };
  }

  if (!registry.nodes || !Array.isArray(registry.nodes)) {
    errors.push({
      code: COMPARISON_VALIDATION_CODES.COMPARISON_EMPTY_REGISTRY,
      message: 'Registry is missing nodes array.',
      field: 'nodes',
    });
    return {
      valid: false,
      errors,
      nodeResults: [],
      checkedAt: 'comparison_registry_validation',
    };
  }

  if (registry.nodes.length === 0) {
    errors.push({
      code: COMPARISON_VALIDATION_CODES.COMPARISON_EMPTY_REGISTRY,
      message: 'Registry has no nodes.',
      field: 'nodes',
    });
    return {
      valid: false,
      errors,
      nodeResults: [],
      checkedAt: 'comparison_registry_validation',
    };
  }

  const nodeResults = registry.nodes.map((node) => {
    const nodeErrors = validateComparativeAssessment(node);
    return {
      valid: nodeErrors.length === 0,
      errors: nodeErrors,
      checkedAt: 'comparison_node_validation' as const,
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
        code: COMPARISON_VALIDATION_CODES.COMPARISON_DUPLICATE_ID,
        message: `Duplicate comparison id: ${node.id}`,
        field: 'id',
        entityId: node.id,
      });
    }
    idSet.add(node.id);

    if (titleSet.has(node.title)) {
      errors.push({
        code: COMPARISON_VALIDATION_CODES.COMPARISON_DUPLICATE_TITLE,
        message: `Duplicate comparison title: ${node.title}`,
        field: 'title',
        entityId: node.id,
      });
    }
    titleSet.add(node.title);
  }

  if (!registry.metadata || typeof registry.metadata !== 'object') {
    errors.push({
      code: COMPARISON_VALIDATION_CODES.COMPARISON_REGISTRY_INCONSISTENCY,
      message: 'Registry is missing metadata.',
      field: 'metadata',
    });
  } else {
    if (registry.metadata.nodeCount !== registry.nodes.length) {
      errors.push({
        code: COMPARISON_VALIDATION_CODES.COMPARISON_REGISTRY_INCONSISTENCY,
        message: `Metadata nodeCount (${registry.metadata.nodeCount}) does not match actual node count (${registry.nodes.length}).`,
        field: 'metadata.nodeCount',
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    nodeResults,
    checkedAt: 'comparison_registry_validation',
  };
}

/**
 * Validate a ComparisonInput.
 * Returns structured errors. Never throws. Deterministic.
 */
export function validateComparisonInput(
  input: ComparisonInput,
): ComparisonInputValidationResult {
  const errors: ComparisonValidationError[] = [];

  if (!input || typeof input !== 'object') {
    errors.push({
      code: COMPARISON_VALIDATION_CODES.COMPARISON_EMPTY_REGISTRY,
      message: 'Input is null or not an object.',
    });
    return {
      valid: false,
      errors,
      checkedAt: 'comparison_input_validation',
    };
  }

  if (!input.nodes || !Array.isArray(input.nodes)) {
    errors.push({
      code: COMPARISON_VALIDATION_CODES.COMPARISON_EMPTY_REGISTRY,
      message: 'Input is missing nodes array.',
      field: 'nodes',
    });
    return {
      valid: false,
      errors,
      checkedAt: 'comparison_input_validation',
    };
  }

  if (input.nodes.length === 0) {
    errors.push({
      code: COMPARISON_VALIDATION_CODES.COMPARISON_EMPTY_REGISTRY,
      message: 'Input has no nodes.',
      field: 'nodes',
    });
    return {
      valid: false,
      errors,
      checkedAt: 'comparison_input_validation',
    };
  }

  for (const node of input.nodes) {
    const nodeErrors = validateComparativeAssessment(node);
    errors.push(...nodeErrors);
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'comparison_input_validation',
  };
}

/**
 * Validate a ComparisonAssessmentTrace.
 * Returns structured errors. Never throws. Deterministic.
 */
export function validateComparisonTrace(
  trace: ComparisonAssessmentTrace,
): ComparisonTraceValidationResult {
  const errors: ComparisonValidationError[] = [];

  if (!trace || typeof trace !== 'object') {
    errors.push({
      code: COMPARISON_VALIDATION_CODES.COMPARISON_INVALID_TRACE,
      message: 'Trace is null or not an object.',
    });
    return {
      valid: false,
      errors,
      checkedAt: 'comparison_trace_validation',
    };
  }

  if (!trace.traceId || typeof trace.traceId !== 'string' || trace.traceId.trim() === '') {
    errors.push({
      code: COMPARISON_VALIDATION_CODES.COMPARISON_INVALID_TRACE,
      message: 'Trace is missing a valid traceId.',
      field: 'traceId',
    });
  }

  if (trace.deterministic !== true) {
    errors.push({
      code: COMPARISON_VALIDATION_CODES.COMPARISON_INVALID_TRACE,
      message: 'Trace must declare deterministic: true.',
      field: 'deterministic',
    });
  }

  if (trace.randomUsed !== false) {
    errors.push({
      code: COMPARISON_VALIDATION_CODES.COMPARISON_INVALID_TRACE,
      message: 'Trace must declare randomUsed: false.',
      field: 'randomUsed',
    });
  }

  if (trace.timeDependency !== false) {
    errors.push({
      code: COMPARISON_VALIDATION_CODES.COMPARISON_INVALID_TRACE,
      message: 'Trace must declare timeDependency: false.',
      field: 'timeDependency',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'comparison_trace_validation',
  };
}

/**
 * Validate an AssessmentArtifactWithComparisons.
 * Returns structured errors. Never throws. Deterministic.
 */
export function validateAssessmentArtifactWithComparisons(
  artifact: AssessmentArtifactWithComparisons,
): AssessmentArtifactWithComparisonsValidationResult {
  const errors: ComparisonValidationError[] = [];

  if (!artifact || typeof artifact !== 'object') {
    errors.push({
      code: COMPARISON_VALIDATION_CODES.COMPARISON_MISSING_ASSESSMENT_REFERENCE,
      message: 'Artifact is null or not an object.',
    });
    return {
      valid: false,
      errors,
      checkedAt: 'artifact_comparison_validation',
    };
  }

  if (!artifact.artifactId || artifact.artifactId.trim() === '') {
    errors.push({
      code: COMPARISON_VALIDATION_CODES.COMPARISON_MISSING_ASSESSMENT_REFERENCE,
      message: 'Artifact is missing a valid artifactId.',
      field: 'artifactId',
    });
  }

  if (!artifact.artifactTitle || artifact.artifactTitle.trim() === '') {
    errors.push({
      code: COMPARISON_VALIDATION_CODES.COMPARISON_MISSING_TITLE,
      message: 'Artifact is missing a valid artifactTitle.',
      field: 'artifactTitle',
    });
  }

  if (!artifact.comparisons || !Array.isArray(artifact.comparisons)) {
    errors.push({
      code: COMPARISON_VALIDATION_CODES.COMPARISON_MISSING_PROVENANCE,
      message: 'Artifact is missing comparisons array.',
      field: 'comparisons',
    });
  } else {
    for (const comparison of artifact.comparisons) {
      const compErrors = validateComparativeAssessment(comparison);
      errors.push(...compErrors);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'artifact_comparison_validation',
  };
}

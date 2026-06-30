/**
 * NV-2000-D8-OPT-06 — Feedback Validation Layer
 *
 * Deterministic validation for the Feedback Kernel.
 * Returns structured errors, never exceptions for expected validation failures.
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import {
  type AssessmentArtifactWithFeedback,
  type AssessmentArtifactWithFeedbackValidationResult,
  type AssessmentFeedback,
  type AssessmentGovernanceLevel,
  type FeedbackDeliveryType,
  type FeedbackExplanation,
  type FeedbackInput,
  type FeedbackInputValidationResult,
  type FeedbackObjective,
  type FeedbackPriority,
  type FeedbackProvenance,
  type FeedbackReference,
  type FeedbackRegistry,
  type FeedbackRegistryValidationResult,
  type FeedbackRelationship,
  type FeedbackStatus,
  type FeedbackTone,
  type FeedbackTrace,
  type FeedbackTraceValidationResult,
  type FeedbackValidationError,
  type FeedbackType,
  CANONICAL_ASSESSMENT_GOVERNANCE,
  CANONICAL_FEEDBACK_DELIVERY_TYPES,
  CANONICAL_FEEDBACK_OBJECTIVES,
  CANONICAL_FEEDBACK_PRIORITY,
  CANONICAL_FEEDBACK_STATUS,
  CANONICAL_FEEDBACK_TONES,
  CANONICAL_FEEDBACK_TYPES,
} from './AssessmentAgentContract.ts';

// ============================================================================
// VALIDATION CODES — Stable forever (24 codes)
// ============================================================================

export const FEEDBACK_VALIDATION_CODES = {
  FEEDBACK_DUPLICATE_ID: 'FEEDBACK_DUPLICATE_ID',
  FEEDBACK_DUPLICATE_TITLE: 'FEEDBACK_DUPLICATE_TITLE',
  EXPLANATION_DUPLICATE_ID: 'EXPLANATION_DUPLICATE_ID',
  REFERENCE_DUPLICATE_ID: 'REFERENCE_DUPLICATE_ID',
  RELATIONSHIP_DUPLICATE_ID: 'RELATIONSHIP_DUPLICATE_ID',
  FEEDBACK_INVALID_TYPE: 'FEEDBACK_INVALID_TYPE',
  FEEDBACK_INVALID_OBJECTIVE: 'FEEDBACK_INVALID_OBJECTIVE',
  FEEDBACK_INVALID_TONE: 'FEEDBACK_INVALID_TONE',
  FEEDBACK_INVALID_DELIVERY: 'FEEDBACK_INVALID_DELIVERY',
  FEEDBACK_INVALID_PRIORITY: 'FEEDBACK_INVALID_PRIORITY',
  FEEDBACK_INVALID_STATUS: 'FEEDBACK_INVALID_STATUS',
  FEEDBACK_INVALID_GOVERNANCE: 'FEEDBACK_INVALID_GOVERNANCE',
  FEEDBACK_MISSING_PROVENANCE: 'FEEDBACK_MISSING_PROVENANCE',
  FEEDBACK_MISSING_PROVIDER: 'FEEDBACK_MISSING_PROVIDER',
  FEEDBACK_MISSING_RATIONALE: 'FEEDBACK_MISSING_RATIONALE',
  FEEDBACK_MISSING_ASSESSMENT_REFERENCE: 'FEEDBACK_MISSING_ASSESSMENT_REFERENCE',
  FEEDBACK_MISSING_FEEDBACK_ID: 'FEEDBACK_MISSING_FEEDBACK_ID',
  FEEDBACK_MISSING_TITLE: 'FEEDBACK_MISSING_TITLE',
  FEEDBACK_MISSING_EXPLANATION: 'FEEDBACK_MISSING_EXPLANATION',
  FEEDBACK_SELF_RELATIONSHIP: 'FEEDBACK_SELF_RELATIONSHIP',
  FEEDBACK_EMPTY_REGISTRY: 'FEEDBACK_EMPTY_REGISTRY',
  FEEDBACK_INVALID_TRACE: 'FEEDBACK_INVALID_TRACE',
  FEEDBACK_REGISTRY_INCONSISTENCY: 'FEEDBACK_REGISTRY_INCONSISTENCY',
  FEEDBACK_INVALID_CONFIGURATION: 'FEEDBACK_INVALID_CONFIGURATION',
} as const;

// ============================================================================
// VALIDATION FUNCTIONS — Pure, never throw
// ============================================================================

/**
 * Validate a FeedbackExplanation.
 */
export function validateFeedbackExplanation(
  explanation: FeedbackExplanation,
): readonly FeedbackValidationError[] {
  const errors: FeedbackValidationError[] = [];

  if (!explanation.id || explanation.id.trim() === '') {
    errors.push({
      code: FEEDBACK_VALIDATION_CODES.EXPLANATION_DUPLICATE_ID,
      message: 'Explanation is missing a valid id.',
      field: 'id',
    });
  }

  if (!explanation.explanationType || explanation.explanationType.trim() === '') {
    errors.push({
      code: FEEDBACK_VALIDATION_CODES.FEEDBACK_INVALID_CONFIGURATION,
      message: 'Explanation is missing a valid explanationType.',
      field: 'explanationType',
      entityId: explanation.id,
    });
  }

  return errors;
}

/**
 * Validate a FeedbackReference.
 */
export function validateFeedbackReference(
  reference: FeedbackReference,
): readonly FeedbackValidationError[] {
  const errors: FeedbackValidationError[] = [];

  if (!reference.id || reference.id.trim() === '') {
    errors.push({
      code: FEEDBACK_VALIDATION_CODES.REFERENCE_DUPLICATE_ID,
      message: 'Reference is missing a valid id.',
      field: 'id',
    });
  }

  if (!reference.referenceType || reference.referenceType.trim() === '') {
    errors.push({
      code: FEEDBACK_VALIDATION_CODES.FEEDBACK_INVALID_CONFIGURATION,
      message: 'Reference is missing a valid referenceType.',
      field: 'referenceType',
      entityId: reference.id,
    });
  }

  return errors;
}

/**
 * Validate a single AssessmentFeedback.
 * Returns structured errors. Never throws. Deterministic.
 */
export function validateAssessmentFeedback(
  feedback: AssessmentFeedback,
): readonly FeedbackValidationError[] {
  const errors: FeedbackValidationError[] = [];

  if (!feedback || typeof feedback !== 'object') {
    errors.push({
      code: FEEDBACK_VALIDATION_CODES.FEEDBACK_MISSING_FEEDBACK_ID,
      message: 'Feedback is null or not an object.',
    });
    return errors;
  }

  if (!feedback.id || typeof feedback.id !== 'string' || feedback.id.trim() === '') {
    errors.push({
      code: FEEDBACK_VALIDATION_CODES.FEEDBACK_MISSING_FEEDBACK_ID,
      message: 'Feedback is missing a valid id.',
      field: 'id',
      entityId: feedback.id ?? 'unknown',
    });
  }

  if (!feedback.title || typeof feedback.title !== 'string' || feedback.title.trim() === '') {
    errors.push({
      code: FEEDBACK_VALIDATION_CODES.FEEDBACK_MISSING_TITLE,
      message: 'Feedback is missing a valid title.',
      field: 'title',
      entityId: feedback.id,
    });
  }

  if (!feedback.feedbackType || !CANONICAL_FEEDBACK_TYPES.includes(feedback.feedbackType)) {
    errors.push({
      code: FEEDBACK_VALIDATION_CODES.FEEDBACK_INVALID_TYPE,
      message: `Invalid feedback type: ${String(feedback.feedbackType)}`,
      field: 'feedbackType',
      entityId: feedback.id,
    });
  }

  if (!feedback.objective || !CANONICAL_FEEDBACK_OBJECTIVES.includes(feedback.objective)) {
    errors.push({
      code: FEEDBACK_VALIDATION_CODES.FEEDBACK_INVALID_OBJECTIVE,
      message: `Invalid feedback objective: ${String(feedback.objective)}`,
      field: 'objective',
      entityId: feedback.id,
    });
  }

  if (!feedback.tone || !CANONICAL_FEEDBACK_TONES.includes(feedback.tone)) {
    errors.push({
      code: FEEDBACK_VALIDATION_CODES.FEEDBACK_INVALID_TONE,
      message: `Invalid feedback tone: ${String(feedback.tone)}`,
      field: 'tone',
      entityId: feedback.id,
    });
  }

  if (!feedback.deliveryType || !CANONICAL_FEEDBACK_DELIVERY_TYPES.includes(feedback.deliveryType)) {
    errors.push({
      code: FEEDBACK_VALIDATION_CODES.FEEDBACK_INVALID_DELIVERY,
      message: `Invalid feedback delivery type: ${String(feedback.deliveryType)}`,
      field: 'deliveryType',
      entityId: feedback.id,
    });
  }

  if (!feedback.content || feedback.content.trim() === '') {
    errors.push({
      code: FEEDBACK_VALIDATION_CODES.FEEDBACK_INVALID_CONFIGURATION,
      message: 'Feedback is missing content.',
      field: 'content',
      entityId: feedback.id,
    });
  }

  if (!feedback.explanation || typeof feedback.explanation !== 'object') {
    errors.push({
      code: FEEDBACK_VALIDATION_CODES.FEEDBACK_MISSING_EXPLANATION,
      message: 'Feedback is missing explanation.',
      field: 'explanation',
      entityId: feedback.id,
    });
  } else {
    const explanationErrors = validateFeedbackExplanation(feedback.explanation);
    errors.push(...explanationErrors);
  }

  if (!feedback.references || !Array.isArray(feedback.references)) {
    errors.push({
      code: FEEDBACK_VALIDATION_CODES.FEEDBACK_INVALID_CONFIGURATION,
      message: 'Feedback is missing references array.',
      field: 'references',
      entityId: feedback.id,
    });
  } else {
    for (const ref of feedback.references) {
      const refErrors = validateFeedbackReference(ref);
      errors.push(...refErrors);
    }
  }

  if (!feedback.conceptIds || !Array.isArray(feedback.conceptIds) || feedback.conceptIds.length === 0) {
    errors.push({
      code: FEEDBACK_VALIDATION_CODES.FEEDBACK_MISSING_ASSESSMENT_REFERENCE,
      message: 'Feedback is missing conceptIds.',
      field: 'conceptIds',
      entityId: feedback.id,
    });
  }

  if (!feedback.priority || !CANONICAL_FEEDBACK_PRIORITY.includes(feedback.priority)) {
    errors.push({
      code: FEEDBACK_VALIDATION_CODES.FEEDBACK_INVALID_PRIORITY,
      message: `Invalid feedback priority: ${String(feedback.priority)}`,
      field: 'priority',
      entityId: feedback.id,
    });
  }

  if (!feedback.status || !CANONICAL_FEEDBACK_STATUS.includes(feedback.status)) {
    errors.push({
      code: FEEDBACK_VALIDATION_CODES.FEEDBACK_INVALID_STATUS,
      message: `Invalid feedback status: ${String(feedback.status)}`,
      field: 'status',
      entityId: feedback.id,
    });
  }

  if (!feedback.governance || !CANONICAL_ASSESSMENT_GOVERNANCE.includes(feedback.governance)) {
    errors.push({
      code: FEEDBACK_VALIDATION_CODES.FEEDBACK_INVALID_GOVERNANCE,
      message: `Invalid governance: ${String(feedback.governance)}`,
      field: 'governance',
      entityId: feedback.id,
    });
  }

  if (!feedback.provenance || typeof feedback.provenance !== 'object') {
    errors.push({
      code: FEEDBACK_VALIDATION_CODES.FEEDBACK_MISSING_PROVENANCE,
      message: 'Feedback is missing provenance.',
      field: 'provenance',
      entityId: feedback.id,
    });
  } else {
    if (!feedback.provenance.provider || feedback.provenance.provider.trim() === '') {
      errors.push({
        code: FEEDBACK_VALIDATION_CODES.FEEDBACK_MISSING_PROVIDER,
        message: 'Provenance is missing a valid provider.',
        field: 'provenance.provider',
        entityId: feedback.id,
      });
    }
    if (!feedback.provenance.rationale || feedback.provenance.rationale.trim() === '') {
      errors.push({
        code: FEEDBACK_VALIDATION_CODES.FEEDBACK_MISSING_RATIONALE,
        message: 'Provenance is missing a valid rationale.',
        field: 'provenance.rationale',
        entityId: feedback.id,
      });
    }
  }

  if (!feedback.trace || typeof feedback.trace !== 'object') {
    errors.push({
      code: FEEDBACK_VALIDATION_CODES.FEEDBACK_INVALID_TRACE,
      message: 'Feedback is missing trace metadata.',
      field: 'trace',
      entityId: feedback.id,
    });
  } else {
    if (feedback.trace.deterministic !== true) {
      errors.push({
        code: FEEDBACK_VALIDATION_CODES.FEEDBACK_INVALID_TRACE,
        message: 'Trace must declare deterministic: true.',
        field: 'trace.deterministic',
        entityId: feedback.id,
      });
    }
    if (feedback.trace.randomUsed !== false) {
      errors.push({
        code: FEEDBACK_VALIDATION_CODES.FEEDBACK_INVALID_TRACE,
        message: 'Trace must declare randomUsed: false.',
        field: 'trace.randomUsed',
        entityId: feedback.id,
      });
    }
    if (feedback.trace.timeDependency !== false) {
      errors.push({
        code: FEEDBACK_VALIDATION_CODES.FEEDBACK_INVALID_TRACE,
        message: 'Trace must declare timeDependency: false.',
        field: 'trace.timeDependency',
        entityId: feedback.id,
      });
    }
  }

  return errors;
}

/**
 * Validate a FeedbackRelationship.
 * Returns structured errors. Never throws. Deterministic.
 */
export function validateFeedbackRelationship(
  rel: FeedbackRelationship,
): readonly FeedbackValidationError[] {
  const errors: FeedbackValidationError[] = [];

  if (!rel.id || rel.id.trim() === '') {
    errors.push({
      code: FEEDBACK_VALIDATION_CODES.RELATIONSHIP_DUPLICATE_ID,
      message: 'Relationship is missing a valid id.',
      field: 'id',
    });
  }

  if (!rel.sourceFeedbackId || rel.sourceFeedbackId.trim() === '') {
    errors.push({
      code: FEEDBACK_VALIDATION_CODES.FEEDBACK_MISSING_ASSESSMENT_REFERENCE,
      message: 'Relationship is missing sourceFeedbackId.',
      field: 'sourceFeedbackId',
      entityId: rel.id,
    });
  }

  if (!rel.targetFeedbackId || rel.targetFeedbackId.trim() === '') {
    errors.push({
      code: FEEDBACK_VALIDATION_CODES.FEEDBACK_MISSING_ASSESSMENT_REFERENCE,
      message: 'Relationship is missing targetFeedbackId.',
      field: 'targetFeedbackId',
      entityId: rel.id,
    });
  }

  if (
    rel.sourceFeedbackId &&
    rel.targetFeedbackId &&
    rel.sourceFeedbackId === rel.targetFeedbackId
  ) {
    errors.push({
      code: FEEDBACK_VALIDATION_CODES.FEEDBACK_SELF_RELATIONSHIP,
      message: 'Relationship cannot reference itself (source equals target).',
      field: 'sourceFeedbackId',
      entityId: rel.id,
    });
  }

  return errors;
}

/**
 * Validate a FeedbackRegistry.
 * Returns structured errors. Never throws. Deterministic.
 */
export function validateFeedbackRegistry(
  registry: FeedbackRegistry,
): FeedbackRegistryValidationResult {
  const errors: FeedbackValidationError[] = [];

  if (!registry || typeof registry !== 'object') {
    errors.push({
      code: FEEDBACK_VALIDATION_CODES.FEEDBACK_EMPTY_REGISTRY,
      message: 'Registry is null or not an object.',
    });
    return {
      valid: false,
      errors,
      nodeResults: [],
      checkedAt: 'feedback_registry_validation',
    };
  }

  if (!registry.nodes || !Array.isArray(registry.nodes)) {
    errors.push({
      code: FEEDBACK_VALIDATION_CODES.FEEDBACK_EMPTY_REGISTRY,
      message: 'Registry is missing nodes array.',
      field: 'nodes',
    });
    return {
      valid: false,
      errors,
      nodeResults: [],
      checkedAt: 'feedback_registry_validation',
    };
  }

  if (registry.nodes.length === 0) {
    errors.push({
      code: FEEDBACK_VALIDATION_CODES.FEEDBACK_EMPTY_REGISTRY,
      message: 'Registry has no nodes.',
      field: 'nodes',
    });
    return {
      valid: false,
      errors,
      nodeResults: [],
      checkedAt: 'feedback_registry_validation',
    };
  }

  const nodeResults = registry.nodes.map((node) => {
    const nodeErrors = validateAssessmentFeedback(node);
    return {
      valid: nodeErrors.length === 0,
      errors: nodeErrors,
      checkedAt: 'feedback_node_validation' as const,
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
        code: FEEDBACK_VALIDATION_CODES.FEEDBACK_DUPLICATE_ID,
        message: `Duplicate feedback id: ${node.id}`,
        field: 'id',
        entityId: node.id,
      });
    }
    idSet.add(node.id);

    if (titleSet.has(node.title)) {
      errors.push({
        code: FEEDBACK_VALIDATION_CODES.FEEDBACK_DUPLICATE_TITLE,
        message: `Duplicate feedback title: ${node.title}`,
        field: 'title',
        entityId: node.id,
      });
    }
    titleSet.add(node.title);
  }

  if (!registry.metadata || typeof registry.metadata !== 'object') {
    errors.push({
      code: FEEDBACK_VALIDATION_CODES.FEEDBACK_REGISTRY_INCONSISTENCY,
      message: 'Registry is missing metadata.',
      field: 'metadata',
    });
  } else {
    if (registry.metadata.nodeCount !== registry.nodes.length) {
      errors.push({
        code: FEEDBACK_VALIDATION_CODES.FEEDBACK_REGISTRY_INCONSISTENCY,
        message: `Metadata nodeCount (${registry.metadata.nodeCount}) does not match actual node count (${registry.nodes.length}).`,
        field: 'metadata.nodeCount',
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    nodeResults,
    checkedAt: 'feedback_registry_validation',
  };
}

/**
 * Validate a FeedbackInput.
 * Returns structured errors. Never throws. Deterministic.
 */
export function validateFeedbackInput(
  input: FeedbackInput,
): FeedbackInputValidationResult {
  const errors: FeedbackValidationError[] = [];

  if (!input || typeof input !== 'object') {
    errors.push({
      code: FEEDBACK_VALIDATION_CODES.FEEDBACK_EMPTY_REGISTRY,
      message: 'Input is null or not an object.',
    });
    return {
      valid: false,
      errors,
      checkedAt: 'feedback_input_validation',
    };
  }

  if (!input.nodes || !Array.isArray(input.nodes)) {
    errors.push({
      code: FEEDBACK_VALIDATION_CODES.FEEDBACK_EMPTY_REGISTRY,
      message: 'Input is missing nodes array.',
      field: 'nodes',
    });
    return {
      valid: false,
      errors,
      checkedAt: 'feedback_input_validation',
    };
  }

  if (input.nodes.length === 0) {
    errors.push({
      code: FEEDBACK_VALIDATION_CODES.FEEDBACK_EMPTY_REGISTRY,
      message: 'Input has no nodes.',
      field: 'nodes',
    });
    return {
      valid: false,
      errors,
      checkedAt: 'feedback_input_validation',
    };
  }

  for (const node of input.nodes) {
    const nodeErrors = validateAssessmentFeedback(node);
    errors.push(...nodeErrors);
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'feedback_input_validation',
  };
}

/**
 * Validate a FeedbackTrace.
 * Returns structured errors. Never throws. Deterministic.
 */
export function validateFeedbackTrace(
  trace: FeedbackTrace,
): FeedbackTraceValidationResult {
  const errors: FeedbackValidationError[] = [];

  if (!trace || typeof trace !== 'object') {
    errors.push({
      code: FEEDBACK_VALIDATION_CODES.FEEDBACK_INVALID_TRACE,
      message: 'Trace is null or not an object.',
    });
    return {
      valid: false,
      errors,
      checkedAt: 'feedback_trace_validation',
    };
  }

  if (!trace.traceId || typeof trace.traceId !== 'string' || trace.traceId.trim() === '') {
    errors.push({
      code: FEEDBACK_VALIDATION_CODES.FEEDBACK_INVALID_TRACE,
      message: 'Trace is missing a valid traceId.',
      field: 'traceId',
    });
  }

  if (trace.deterministic !== true) {
    errors.push({
      code: FEEDBACK_VALIDATION_CODES.FEEDBACK_INVALID_TRACE,
      message: 'Trace must declare deterministic: true.',
      field: 'deterministic',
    });
  }

  if (trace.randomUsed !== false) {
    errors.push({
      code: FEEDBACK_VALIDATION_CODES.FEEDBACK_INVALID_TRACE,
      message: 'Trace must declare randomUsed: false.',
      field: 'randomUsed',
    });
  }

  if (trace.timeDependency !== false) {
    errors.push({
      code: FEEDBACK_VALIDATION_CODES.FEEDBACK_INVALID_TRACE,
      message: 'Trace must declare timeDependency: false.',
      field: 'timeDependency',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'feedback_trace_validation',
  };
}

/**
 * Validate an AssessmentArtifactWithFeedback.
 * Returns structured errors. Never throws. Deterministic.
 */
export function validateAssessmentArtifactWithFeedback(
  artifact: AssessmentArtifactWithFeedback,
): AssessmentArtifactWithFeedbackValidationResult {
  const errors: FeedbackValidationError[] = [];

  if (!artifact || typeof artifact !== 'object') {
    errors.push({
      code: FEEDBACK_VALIDATION_CODES.FEEDBACK_MISSING_ASSESSMENT_REFERENCE,
      message: 'Artifact is null or not an object.',
    });
    return {
      valid: false,
      errors,
      checkedAt: 'artifact_feedback_validation',
    };
  }

  if (!artifact.artifactId || artifact.artifactId.trim() === '') {
    errors.push({
      code: FEEDBACK_VALIDATION_CODES.FEEDBACK_MISSING_ASSESSMENT_REFERENCE,
      message: 'Artifact is missing a valid artifactId.',
      field: 'artifactId',
    });
  }

  if (!artifact.artifactTitle || artifact.artifactTitle.trim() === '') {
    errors.push({
      code: FEEDBACK_VALIDATION_CODES.FEEDBACK_MISSING_TITLE,
      message: 'Artifact is missing a valid artifactTitle.',
      field: 'artifactTitle',
    });
  }

  if (!artifact.feedback || !Array.isArray(artifact.feedback)) {
    errors.push({
      code: FEEDBACK_VALIDATION_CODES.FEEDBACK_MISSING_PROVENANCE,
      message: 'Artifact is missing feedback array.',
      field: 'feedback',
    });
  } else {
    for (const fb of artifact.feedback) {
      const fbErrors = validateAssessmentFeedback(fb);
      errors.push(...fbErrors);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'artifact_feedback_validation',
  };
}

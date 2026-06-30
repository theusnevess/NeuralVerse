/**
 * NV-2000-D8-OPT-08 — Visual Assessment Validation Layer
 *
 * Deterministic validation for the Visual Assessment Kernel.
 * Returns structured errors, never exceptions for expected validation failures.
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import {
  type AssessmentArtifactWithVisualAssets,
  type AssessmentArtifactWithVisualAssetsValidationResult,
  type AssessmentVisualArtifact,
  type MultimodalEvidence,
  type MultimodalEvidenceType,
  type VisualAssessmentInput,
  type VisualAssessmentInputValidationResult,
  type VisualAssessmentProvenance,
  type VisualAssessmentRegistry,
  type VisualAssessmentRegistryValidationResult,
  type VisualAssessmentRelationship,
  type VisualAssessmentStatus,
  type VisualAssessmentTask,
  type VisualAssessmentTrace,
  type VisualAssessmentTraceValidationResult,
  type VisualAssessmentType,
  type VisualAssessmentValidationError,
  type VisualGovernanceLevel,
  type VisualAssessmentReference,
  type VisualResourceType,
  type VisualTaskType,
  CANONICAL_MULTIMODAL_EVIDENCE_TYPES,
  CANONICAL_VISUAL_ASSESSMENT_STATUS,
  CANONICAL_VISUAL_ASSESSMENT_TYPES,
  CANONICAL_VISUAL_GOVERNANCE_LEVELS,
  CANONICAL_VISUAL_RESOURCE_TYPES,
  CANONICAL_VISUAL_TASK_TYPES,
} from './AssessmentAgentContract.ts';

// ============================================================================
// VALIDATION CODES — Stable forever (24 codes)
// ============================================================================

export const VISUAL_ASSESSMENT_VALIDATION_CODES = {
  VISUAL_ASSESSMENT_DUPLICATE_ID: 'VISUAL_ASSESSMENT_DUPLICATE_ID',
  VISUAL_ASSESSMENT_DUPLICATE_TITLE: 'VISUAL_ASSESSMENT_DUPLICATE_TITLE',
  VISUAL_REFERENCE_DUPLICATE_ID: 'VISUAL_REFERENCE_DUPLICATE_ID',
  VISUAL_TASK_DUPLICATE_ID: 'VISUAL_TASK_DUPLICATE_ID',
  MULTIMODAL_EVIDENCE_DUPLICATE_ID: 'MULTIMODAL_EVIDENCE_DUPLICATE_ID',
  VISUAL_INVALID_TYPE: 'VISUAL_INVALID_TYPE',
  VISUAL_INVALID_RESOURCE: 'VISUAL_INVALID_RESOURCE',
  VISUAL_INVALID_TASK: 'VISUAL_INVALID_TASK',
  VISUAL_INVALID_EVIDENCE: 'VISUAL_INVALID_EVIDENCE',
  VISUAL_INVALID_GOVERNANCE: 'VISUAL_INVALID_GOVERNANCE',
  VISUAL_INVALID_STATUS: 'VISUAL_INVALID_STATUS',
  VISUAL_MISSING_PROVENANCE: 'VISUAL_MISSING_PROVENANCE',
  VISUAL_MISSING_PROVIDER: 'VISUAL_MISSING_PROVIDER',
  VISUAL_MISSING_RATIONALE: 'VISUAL_MISSING_RATIONALE',
  VISUAL_MISSING_ASSESSMENT_REFERENCE: 'VISUAL_MISSING_ASSESSMENT_REFERENCE',
  VISUAL_MISSING_VISUAL_REFERENCE: 'VISUAL_MISSING_VISUAL_REFERENCE',
  VISUAL_MISSING_VISUAL_ID: 'VISUAL_MISSING_VISUAL_ID',
  VISUAL_MISSING_TITLE: 'VISUAL_MISSING_TITLE',
  VISUAL_SELF_RELATIONSHIP: 'VISUAL_SELF_RELATIONSHIP',
  VISUAL_EMPTY_REGISTRY: 'VISUAL_EMPTY_REGISTRY',
  VISUAL_INVALID_TRACE: 'VISUAL_INVALID_TRACE',
  VISUAL_REGISTRY_INCONSISTENCY: 'VISUAL_REGISTRY_INCONSISTENCY',
  VISUAL_INVALID_CONFIGURATION: 'VISUAL_INVALID_CONFIGURATION',
  VISUAL_INVALID_REFERENCE: 'VISUAL_INVALID_REFERENCE',
} as const;

// ============================================================================
// VALIDATION FUNCTIONS — Pure, never throw
// ============================================================================

/**
 * Validate a VisualAssessmentReference.
 */
export function validateVisualAssessmentReference(
  ref: VisualAssessmentReference,
): readonly VisualAssessmentValidationError[] {
  const errors: VisualAssessmentValidationError[] = [];

  if (!ref.id || ref.id.trim() === '') {
    errors.push({
      code: VISUAL_ASSESSMENT_VALIDATION_CODES.VISUAL_REFERENCE_DUPLICATE_ID,
      message: 'Visual reference is missing a valid id.',
      field: 'id',
    });
  }

  if (!ref.resourceType || !CANONICAL_VISUAL_RESOURCE_TYPES.includes(ref.resourceType)) {
    errors.push({
      code: VISUAL_ASSESSMENT_VALIDATION_CODES.VISUAL_INVALID_RESOURCE,
      message: `Invalid resource type: ${String(ref.resourceType)}`,
      field: 'resourceType',
      entityId: ref.id,
    });
  }

  if (!ref.resourceUri || ref.resourceUri.trim() === '') {
    errors.push({
      code: VISUAL_ASSESSMENT_VALIDATION_CODES.VISUAL_INVALID_REFERENCE,
      message: 'Visual reference is missing resourceUri.',
      field: 'resourceUri',
      entityId: ref.id,
    });
  }

  return errors;
}

/**
 * Validate a VisualAssessmentTask.
 */
export function validateVisualAssessmentTask(
  task: VisualAssessmentTask,
): readonly VisualAssessmentValidationError[] {
  const errors: VisualAssessmentValidationError[] = [];

  if (!task.id || task.id.trim() === '') {
    errors.push({
      code: VISUAL_ASSESSMENT_VALIDATION_CODES.VISUAL_TASK_DUPLICATE_ID,
      message: 'Task is missing a valid id.',
      field: 'id',
    });
  }

  if (!task.taskType || !CANONICAL_VISUAL_TASK_TYPES.includes(task.taskType)) {
    errors.push({
      code: VISUAL_ASSESSMENT_VALIDATION_CODES.VISUAL_INVALID_TASK,
      message: `Invalid task type: ${String(task.taskType)}`,
      field: 'taskType',
      entityId: task.id,
    });
  }

  return errors;
}

/**
 * Validate a MultimodalEvidence.
 */
export function validateMultimodalEvidence(
  evidence: MultimodalEvidence,
): readonly VisualAssessmentValidationError[] {
  const errors: VisualAssessmentValidationError[] = [];

  if (!evidence.id || evidence.id.trim() === '') {
    errors.push({
      code: VISUAL_ASSESSMENT_VALIDATION_CODES.MULTIMODAL_EVIDENCE_DUPLICATE_ID,
      message: 'Evidence is missing a valid id.',
      field: 'id',
    });
  }

  if (!evidence.evidenceType || !CANONICAL_MULTIMODAL_EVIDENCE_TYPES.includes(evidence.evidenceType)) {
    errors.push({
      code: VISUAL_ASSESSMENT_VALIDATION_CODES.VISUAL_INVALID_EVIDENCE,
      message: `Invalid evidence type: ${String(evidence.evidenceType)}`,
      field: 'evidenceType',
      entityId: evidence.id,
    });
  }

  return errors;
}

/**
 * Validate a single AssessmentVisualArtifact.
 * Returns structured errors. Never throws. Deterministic.
 */
export function validateAssessmentVisualArtifact(
  artifact: AssessmentVisualArtifact,
): readonly VisualAssessmentValidationError[] {
  const errors: VisualAssessmentValidationError[] = [];

  if (!artifact || typeof artifact !== 'object') {
    errors.push({
      code: VISUAL_ASSESSMENT_VALIDATION_CODES.VISUAL_MISSING_VISUAL_ID,
      message: 'Artifact is null or not an object.',
    });
    return errors;
  }

  if (!artifact.id || typeof artifact.id !== 'string' || artifact.id.trim() === '') {
    errors.push({
      code: VISUAL_ASSESSMENT_VALIDATION_CODES.VISUAL_MISSING_VISUAL_ID,
      message: 'Artifact is missing a valid id.',
      field: 'id',
      entityId: artifact.id ?? 'unknown',
    });
  }

  if (!artifact.title || typeof artifact.title !== 'string' || artifact.title.trim() === '') {
    errors.push({
      code: VISUAL_ASSESSMENT_VALIDATION_CODES.VISUAL_MISSING_TITLE,
      message: 'Artifact is missing a valid title.',
      field: 'title',
      entityId: artifact.id,
    });
  }

  if (!artifact.visualAssessmentType || !CANONICAL_VISUAL_ASSESSMENT_TYPES.includes(artifact.visualAssessmentType)) {
    errors.push({
      code: VISUAL_ASSESSMENT_VALIDATION_CODES.VISUAL_INVALID_TYPE,
      message: `Invalid visual assessment type: ${String(artifact.visualAssessmentType)}`,
      field: 'visualAssessmentType',
      entityId: artifact.id,
    });
  }

  if (!artifact.visualReferences || !Array.isArray(artifact.visualReferences)) {
    errors.push({
      code: VISUAL_ASSESSMENT_VALIDATION_CODES.VISUAL_INVALID_CONFIGURATION,
      message: 'Artifact is missing visualReferences array.',
      field: 'visualReferences',
      entityId: artifact.id,
    });
  } else {
    for (const ref of artifact.visualReferences) {
      const refErrors = validateVisualAssessmentReference(ref);
      errors.push(...refErrors);
    }
  }

  if (!artifact.tasks || !Array.isArray(artifact.tasks)) {
    errors.push({
      code: VISUAL_ASSESSMENT_VALIDATION_CODES.VISUAL_INVALID_CONFIGURATION,
      message: 'Artifact is missing tasks array.',
      field: 'tasks',
      entityId: artifact.id,
    });
  } else {
    for (const task of artifact.tasks) {
      const taskErrors = validateVisualAssessmentTask(task);
      errors.push(...taskErrors);
    }
  }

  if (!artifact.evidence || !Array.isArray(artifact.evidence)) {
    errors.push({
      code: VISUAL_ASSESSMENT_VALIDATION_CODES.VISUAL_INVALID_CONFIGURATION,
      message: 'Artifact is missing evidence array.',
      field: 'evidence',
      entityId: artifact.id,
    });
  } else {
    for (const ev of artifact.evidence) {
      const evErrors = validateMultimodalEvidence(ev);
      errors.push(...evErrors);
    }
  }

  if (!artifact.conceptIds || !Array.isArray(artifact.conceptIds) || artifact.conceptIds.length === 0) {
    errors.push({
      code: VISUAL_ASSESSMENT_VALIDATION_CODES.VISUAL_MISSING_ASSESSMENT_REFERENCE,
      message: 'Artifact is missing conceptIds.',
      field: 'conceptIds',
      entityId: artifact.id,
    });
  }

  if (!artifact.status || !CANONICAL_VISUAL_ASSESSMENT_STATUS.includes(artifact.status)) {
    errors.push({
      code: VISUAL_ASSESSMENT_VALIDATION_CODES.VISUAL_INVALID_STATUS,
      message: `Invalid status: ${String(artifact.status)}`,
      field: 'status',
      entityId: artifact.id,
    });
  }

  if (!artifact.governance || !CANONICAL_VISUAL_GOVERNANCE_LEVELS.includes(artifact.governance)) {
    errors.push({
      code: VISUAL_ASSESSMENT_VALIDATION_CODES.VISUAL_INVALID_GOVERNANCE,
      message: `Invalid governance: ${String(artifact.governance)}`,
      field: 'governance',
      entityId: artifact.id,
    });
  }

  if (!artifact.provenance || typeof artifact.provenance !== 'object') {
    errors.push({
      code: VISUAL_ASSESSMENT_VALIDATION_CODES.VISUAL_MISSING_PROVENANCE,
      message: 'Artifact is missing provenance.',
      field: 'provenance',
      entityId: artifact.id,
    });
  } else {
    if (!artifact.provenance.provider || artifact.provenance.provider.trim() === '') {
      errors.push({
        code: VISUAL_ASSESSMENT_VALIDATION_CODES.VISUAL_MISSING_PROVIDER,
        message: 'Provenance is missing a valid provider.',
        field: 'provenance.provider',
        entityId: artifact.id,
      });
    }
    if (!artifact.provenance.rationale || artifact.provenance.rationale.trim() === '') {
      errors.push({
        code: VISUAL_ASSESSMENT_VALIDATION_CODES.VISUAL_MISSING_RATIONALE,
        message: 'Provenance is missing a valid rationale.',
        field: 'provenance.rationale',
        entityId: artifact.id,
      });
    }
  }

  if (!artifact.trace || typeof artifact.trace !== 'object') {
    errors.push({
      code: VISUAL_ASSESSMENT_VALIDATION_CODES.VISUAL_INVALID_TRACE,
      message: 'Artifact is missing trace metadata.',
      field: 'trace',
      entityId: artifact.id,
    });
  } else {
    if (artifact.trace.deterministic !== true) {
      errors.push({
        code: VISUAL_ASSESSMENT_VALIDATION_CODES.VISUAL_INVALID_TRACE,
        message: 'Trace must declare deterministic: true.',
        field: 'trace.deterministic',
        entityId: artifact.id,
      });
    }
    if (artifact.trace.randomUsed !== false) {
      errors.push({
        code: VISUAL_ASSESSMENT_VALIDATION_CODES.VISUAL_INVALID_TRACE,
        message: 'Trace must declare randomUsed: false.',
        field: 'trace.randomUsed',
        entityId: artifact.id,
      });
    }
    if (artifact.trace.timeDependency !== false) {
      errors.push({
        code: VISUAL_ASSESSMENT_VALIDATION_CODES.VISUAL_INVALID_TRACE,
        message: 'Trace must declare timeDependency: false.',
        field: 'trace.timeDependency',
        entityId: artifact.id,
      });
    }
  }

  return errors;
}

/**
 * Validate a VisualAssessmentRelationship.
 * Returns structured errors. Never throws. Deterministic.
 */
export function validateVisualAssessmentRelationship(
  rel: VisualAssessmentRelationship,
): readonly VisualAssessmentValidationError[] {
  const errors: VisualAssessmentValidationError[] = [];

  if (!rel.id || rel.id.trim() === '') {
    errors.push({
      code: VISUAL_ASSESSMENT_VALIDATION_CODES.VISUAL_REFERENCE_DUPLICATE_ID,
      message: 'Relationship is missing a valid id.',
      field: 'id',
    });
  }

  if (!rel.sourceArtifactId || rel.sourceArtifactId.trim() === '') {
    errors.push({
      code: VISUAL_ASSESSMENT_VALIDATION_CODES.VISUAL_MISSING_ASSESSMENT_REFERENCE,
      message: 'Relationship is missing sourceArtifactId.',
      field: 'sourceArtifactId',
      entityId: rel.id,
    });
  }

  if (!rel.targetArtifactId || rel.targetArtifactId.trim() === '') {
    errors.push({
      code: VISUAL_ASSESSMENT_VALIDATION_CODES.VISUAL_MISSING_ASSESSMENT_REFERENCE,
      message: 'Relationship is missing targetArtifactId.',
      field: 'targetArtifactId',
      entityId: rel.id,
    });
  }

  if (
    rel.sourceArtifactId &&
    rel.targetArtifactId &&
    rel.sourceArtifactId === rel.targetArtifactId
  ) {
    errors.push({
      code: VISUAL_ASSESSMENT_VALIDATION_CODES.VISUAL_SELF_RELATIONSHIP,
      message: 'Relationship cannot reference itself (source equals target).',
      field: 'sourceArtifactId',
      entityId: rel.id,
    });
  }

  return errors;
}

/**
 * Validate a VisualAssessmentRegistry.
 * Returns structured errors. Never throws. Deterministic.
 */
export function validateVisualAssessmentRegistry(
  registry: VisualAssessmentRegistry,
): VisualAssessmentRegistryValidationResult {
  const errors: VisualAssessmentValidationError[] = [];

  if (!registry || typeof registry !== 'object') {
    errors.push({
      code: VISUAL_ASSESSMENT_VALIDATION_CODES.VISUAL_EMPTY_REGISTRY,
      message: 'Registry is null or not an object.',
    });
    return {
      valid: false,
      errors,
      nodeResults: [],
      checkedAt: 'visual_assessment_registry_validation',
    };
  }

  if (!registry.nodes || !Array.isArray(registry.nodes)) {
    errors.push({
      code: VISUAL_ASSESSMENT_VALIDATION_CODES.VISUAL_EMPTY_REGISTRY,
      message: 'Registry is missing nodes array.',
      field: 'nodes',
    });
    return {
      valid: false,
      errors,
      nodeResults: [],
      checkedAt: 'visual_assessment_registry_validation',
    };
  }

  if (registry.nodes.length === 0) {
    errors.push({
      code: VISUAL_ASSESSMENT_VALIDATION_CODES.VISUAL_EMPTY_REGISTRY,
      message: 'Registry has no nodes.',
      field: 'nodes',
    });
    return {
      valid: false,
      errors,
      nodeResults: [],
      checkedAt: 'visual_assessment_registry_validation',
    };
  }

  const nodeResults = registry.nodes.map((node) => {
    const nodeErrors = validateAssessmentVisualArtifact(node);
    return {
      valid: nodeErrors.length === 0,
      errors: nodeErrors,
      checkedAt: 'visual_assessment_node_validation' as const,
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
        code: VISUAL_ASSESSMENT_VALIDATION_CODES.VISUAL_ASSESSMENT_DUPLICATE_ID,
        message: `Duplicate visual artifact id: ${node.id}`,
        field: 'id',
        entityId: node.id,
      });
    }
    idSet.add(node.id);

    if (titleSet.has(node.title)) {
      errors.push({
        code: VISUAL_ASSESSMENT_VALIDATION_CODES.VISUAL_ASSESSMENT_DUPLICATE_TITLE,
        message: `Duplicate visual artifact title: ${node.title}`,
        field: 'title',
        entityId: node.id,
      });
    }
    titleSet.add(node.title);
  }

  if (!registry.metadata || typeof registry.metadata !== 'object') {
    errors.push({
      code: VISUAL_ASSESSMENT_VALIDATION_CODES.VISUAL_REGISTRY_INCONSISTENCY,
      message: 'Registry is missing metadata.',
      field: 'metadata',
    });
  } else {
    if (registry.metadata.nodeCount !== registry.nodes.length) {
      errors.push({
        code: VISUAL_ASSESSMENT_VALIDATION_CODES.VISUAL_REGISTRY_INCONSISTENCY,
        message: `Metadata nodeCount (${registry.metadata.nodeCount}) does not match actual node count (${registry.nodes.length}).`,
        field: 'metadata.nodeCount',
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    nodeResults,
    checkedAt: 'visual_assessment_registry_validation',
  };
}

/**
 * Validate a VisualAssessmentInput.
 * Returns structured errors. Never throws. Deterministic.
 */
export function validateVisualAssessmentInput(
  input: VisualAssessmentInput,
): VisualAssessmentInputValidationResult {
  const errors: VisualAssessmentValidationError[] = [];

  if (!input || typeof input !== 'object') {
    errors.push({
      code: VISUAL_ASSESSMENT_VALIDATION_CODES.VISUAL_EMPTY_REGISTRY,
      message: 'Input is null or not an object.',
    });
    return {
      valid: false,
      errors,
      checkedAt: 'visual_assessment_input_validation',
    };
  }

  if (!input.nodes || !Array.isArray(input.nodes)) {
    errors.push({
      code: VISUAL_ASSESSMENT_VALIDATION_CODES.VISUAL_EMPTY_REGISTRY,
      message: 'Input is missing nodes array.',
      field: 'nodes',
    });
    return {
      valid: false,
      errors,
      checkedAt: 'visual_assessment_input_validation',
    };
  }

  if (input.nodes.length === 0) {
    errors.push({
      code: VISUAL_ASSESSMENT_VALIDATION_CODES.VISUAL_EMPTY_REGISTRY,
      message: 'Input has no nodes.',
      field: 'nodes',
    });
    return {
      valid: false,
      errors,
      checkedAt: 'visual_assessment_input_validation',
    };
  }

  for (const node of input.nodes) {
    const nodeErrors = validateAssessmentVisualArtifact(node);
    errors.push(...nodeErrors);
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'visual_assessment_input_validation',
  };
}

/**
 * Validate a VisualAssessmentTrace.
 * Returns structured errors. Never throws. Deterministic.
 */
export function validateVisualAssessmentTrace(
  trace: VisualAssessmentTrace,
): VisualAssessmentTraceValidationResult {
  const errors: VisualAssessmentValidationError[] = [];

  if (!trace || typeof trace !== 'object') {
    errors.push({
      code: VISUAL_ASSESSMENT_VALIDATION_CODES.VISUAL_INVALID_TRACE,
      message: 'Trace is null or not an object.',
    });
    return {
      valid: false,
      errors,
      checkedAt: 'visual_assessment_trace_validation',
    };
  }

  if (!trace.traceId || typeof trace.traceId !== 'string' || trace.traceId.trim() === '') {
    errors.push({
      code: VISUAL_ASSESSMENT_VALIDATION_CODES.VISUAL_INVALID_TRACE,
      message: 'Trace is missing a valid traceId.',
      field: 'traceId',
    });
  }

  if (trace.deterministic !== true) {
    errors.push({
      code: VISUAL_ASSESSMENT_VALIDATION_CODES.VISUAL_INVALID_TRACE,
      message: 'Trace must declare deterministic: true.',
      field: 'deterministic',
    });
  }

  if (trace.randomUsed !== false) {
    errors.push({
      code: VISUAL_ASSESSMENT_VALIDATION_CODES.VISUAL_INVALID_TRACE,
      message: 'Trace must declare randomUsed: false.',
      field: 'randomUsed',
    });
  }

  if (trace.timeDependency !== false) {
    errors.push({
      code: VISUAL_ASSESSMENT_VALIDATION_CODES.VISUAL_INVALID_TRACE,
      message: 'Trace must declare timeDependency: false.',
      field: 'timeDependency',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'visual_assessment_trace_validation',
  };
}

/**
 * Validate an AssessmentArtifactWithVisualAssets.
 * Returns structured errors. Never throws. Deterministic.
 */
export function validateAssessmentArtifactWithVisualAssets(
  artifact: AssessmentArtifactWithVisualAssets,
): AssessmentArtifactWithVisualAssetsValidationResult {
  const errors: VisualAssessmentValidationError[] = [];

  if (!artifact || typeof artifact !== 'object') {
    errors.push({
      code: VISUAL_ASSESSMENT_VALIDATION_CODES.VISUAL_MISSING_ASSESSMENT_REFERENCE,
      message: 'Artifact is null or not an object.',
    });
    return {
      valid: false,
      errors,
      checkedAt: 'artifact_visual_validation',
    };
  }

  if (!artifact.artifactId || artifact.artifactId.trim() === '') {
    errors.push({
      code: VISUAL_ASSESSMENT_VALIDATION_CODES.VISUAL_MISSING_ASSESSMENT_REFERENCE,
      message: 'Artifact is missing a valid artifactId.',
      field: 'artifactId',
    });
  }

  if (!artifact.artifactTitle || artifact.artifactTitle.trim() === '') {
    errors.push({
      code: VISUAL_ASSESSMENT_VALIDATION_CODES.VISUAL_MISSING_TITLE,
      message: 'Artifact is missing a valid artifactTitle.',
      field: 'artifactTitle',
    });
  }

  if (!artifact.visualAssets || !Array.isArray(artifact.visualAssets)) {
    errors.push({
      code: VISUAL_ASSESSMENT_VALIDATION_CODES.VISUAL_MISSING_PROVENANCE,
      message: 'Artifact is missing visualAssets array.',
      field: 'visualAssets',
    });
  } else {
    for (const va of artifact.visualAssets) {
      const vaErrors = validateAssessmentVisualArtifact(va);
      errors.push(...vaErrors);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'artifact_visual_validation',
  };
}

/**
 * NV-2000-D8-OPT-05 — Misconception Validation Layer
 *
 * Deterministic validation for the Misconception Kernel.
 * Returns structured errors, never exceptions for expected validation failures.
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import {
  type AssessmentArtifactWithMisconceptions,
  type AssessmentArtifactWithMisconceptionsValidationResult,
  type AssessmentGovernanceLevel,
  type AssessmentMisconception,
  type MisconceptionCause,
  type MisconceptionInput,
  type MisconceptionInputValidationResult,
  type MisconceptionProvenance,
  type MisconceptionRegistry,
  type MisconceptionRegistryValidationResult,
  type MisconceptionRelationship,
  type MisconceptionSeverity,
  type MisconceptionStatus,
  type MisconceptionTrace,
  type MisconceptionTraceValidationResult,
  type MisconceptionValidationError,
  type MisconceptionType,
  type RemediationPriority,
  type RemediationStrategy,
  type RemediationType,
  CANONICAL_ASSESSMENT_GOVERNANCE,
  CANONICAL_MISCONCEPTION_CAUSES,
  CANONICAL_MISCONCEPTION_SEVERITY,
  CANONICAL_MISCONCEPTION_STATUS,
  CANONICAL_MISCONCEPTION_TYPES,
  CANONICAL_REMEDIATION_PRIORITY,
  CANONICAL_REMEDIATION_TYPES,
} from './AssessmentAgentContract.ts';

// ============================================================================
// VALIDATION CODES — Stable forever (24 codes)
// ============================================================================

export const MISCONCEPTION_VALIDATION_CODES = {
  MISCONCEPTION_DUPLICATE_ID: 'MISCONCEPTION_DUPLICATE_ID',
  MISCONCEPTION_DUPLICATE_TITLE: 'MISCONCEPTION_DUPLICATE_TITLE',
  CAUSE_DUPLICATE_ID: 'CAUSE_DUPLICATE_ID',
  REMEDIATION_DUPLICATE_ID: 'REMEDIATION_DUPLICATE_ID',
  RELATIONSHIP_DUPLICATE_ID: 'RELATIONSHIP_DUPLICATE_ID',
  MISCONCEPTION_INVALID_TYPE: 'MISCONCEPTION_INVALID_TYPE',
  MISCONCEPTION_INVALID_CAUSE: 'MISCONCEPTION_INVALID_CAUSE',
  MISCONCEPTION_INVALID_REMEDIATION: 'MISCONCEPTION_INVALID_REMEDIATION',
  MISCONCEPTION_INVALID_PRIORITY: 'MISCONCEPTION_INVALID_PRIORITY',
  MISCONCEPTION_INVALID_SEVERITY: 'MISCONCEPTION_INVALID_SEVERITY',
  MISCONCEPTION_INVALID_STATUS: 'MISCONCEPTION_INVALID_STATUS',
  MISCONCEPTION_INVALID_GOVERNANCE: 'MISCONCEPTION_INVALID_GOVERNANCE',
  MISCONCEPTION_MISSING_PROVENANCE: 'MISCONCEPTION_MISSING_PROVENANCE',
  MISCONCEPTION_MISSING_PROVIDER: 'MISCONCEPTION_MISSING_PROVIDER',
  MISCONCEPTION_MISSING_RATIONALE: 'MISCONCEPTION_MISSING_RATIONALE',
  MISCONCEPTION_MISSING_ASSESSMENT_REFERENCE: 'MISCONCEPTION_MISSING_ASSESSMENT_REFERENCE',
  MISCONCEPTION_MISSING_CONCEPT_REFERENCE: 'MISCONCEPTION_MISSING_CONCEPT_REFERENCE',
  MISCONCEPTION_MISSING_MISCONCEPTION_ID: 'MISCONCEPTION_MISSING_MISCONCEPTION_ID',
  MISCONCEPTION_MISSING_TITLE: 'MISCONCEPTION_MISSING_TITLE',
  MISCONCEPTION_SELF_RELATIONSHIP: 'MISCONCEPTION_SELF_RELATIONSHIP',
  MISCONCEPTION_EMPTY_REGISTRY: 'MISCONCEPTION_EMPTY_REGISTRY',
  MISCONCEPTION_INVALID_TRACE: 'MISCONCEPTION_INVALID_TRACE',
  MISCONCEPTION_REGISTRY_INCONSISTENCY: 'MISCONCEPTION_REGISTRY_INCONSISTENCY',
  MISCONCEPTION_INVALID_CONFIGURATION: 'MISCONCEPTION_INVALID_CONFIGURATION',
} as const;

// ============================================================================
// VALIDATION FUNCTIONS — Pure, never throw
// ============================================================================

/**
 * Validate a RemediationStrategy.
 */
export function validateRemediationStrategy(
  strategy: RemediationStrategy,
): readonly MisconceptionValidationError[] {
  const errors: MisconceptionValidationError[] = [];

  if (!strategy.id || strategy.id.trim() === '') {
    errors.push({
      code: MISCONCEPTION_VALIDATION_CODES.REMEDIATION_DUPLICATE_ID,
      message: 'Remediation strategy is missing a valid id.',
      field: 'id',
    });
  }

  if (!strategy.title || strategy.title.trim() === '') {
    errors.push({
      code: MISCONCEPTION_VALIDATION_CODES.MISCONCEPTION_MISSING_TITLE,
      message: 'Remediation strategy is missing a valid title.',
      field: 'title',
      entityId: strategy.id,
    });
  }

  if (!strategy.remediationType || !CANONICAL_REMEDIATION_TYPES.includes(strategy.remediationType)) {
    errors.push({
      code: MISCONCEPTION_VALIDATION_CODES.MISCONCEPTION_INVALID_REMEDIATION,
      message: `Invalid remediation type: ${String(strategy.remediationType)}`,
      field: 'remediationType',
      entityId: strategy.id,
    });
  }

  if (!strategy.priority || !CANONICAL_REMEDIATION_PRIORITY.includes(strategy.priority)) {
    errors.push({
      code: MISCONCEPTION_VALIDATION_CODES.MISCONCEPTION_INVALID_PRIORITY,
      message: `Invalid remediation priority: ${String(strategy.priority)}`,
      field: 'priority',
      entityId: strategy.id,
    });
  }

  return errors;
}

/**
 * Validate a single AssessmentMisconception.
 * Returns structured errors. Never throws. Deterministic.
 */
export function validateAssessmentMisconception(
  misconception: AssessmentMisconception,
): readonly MisconceptionValidationError[] {
  const errors: MisconceptionValidationError[] = [];

  if (!misconception || typeof misconception !== 'object') {
    errors.push({
      code: MISCONCEPTION_VALIDATION_CODES.MISCONCEPTION_MISSING_MISCONCEPTION_ID,
      message: 'Misconception is null or not an object.',
    });
    return errors;
  }

  if (!misconception.id || typeof misconception.id !== 'string' || misconception.id.trim() === '') {
    errors.push({
      code: MISCONCEPTION_VALIDATION_CODES.MISCONCEPTION_MISSING_MISCONCEPTION_ID,
      message: 'Misconception is missing a valid id.',
      field: 'id',
      entityId: misconception.id ?? 'unknown',
    });
  }

  if (!misconception.title || typeof misconception.title !== 'string' || misconception.title.trim() === '') {
    errors.push({
      code: MISCONCEPTION_VALIDATION_CODES.MISCONCEPTION_MISSING_TITLE,
      message: 'Misconception is missing a valid title.',
      field: 'title',
      entityId: misconception.id,
    });
  }

  if (!misconception.misconceptionType || !CANONICAL_MISCONCEPTION_TYPES.includes(misconception.misconceptionType)) {
    errors.push({
      code: MISCONCEPTION_VALIDATION_CODES.MISCONCEPTION_INVALID_TYPE,
      message: `Invalid misconception type: ${String(misconception.misconceptionType)}`,
      field: 'misconceptionType',
      entityId: misconception.id,
    });
  }

  if (!misconception.causes || !Array.isArray(misconception.causes)) {
    errors.push({
      code: MISCONCEPTION_VALIDATION_CODES.MISCONCEPTION_INVALID_CONFIGURATION,
      message: 'Misconception is missing causes array.',
      field: 'causes',
      entityId: misconception.id,
    });
  } else {
    for (const cause of misconception.causes) {
      if (!CANONICAL_MISCONCEPTION_CAUSES.includes(cause)) {
        errors.push({
          code: MISCONCEPTION_VALIDATION_CODES.MISCONCEPTION_INVALID_CAUSE,
          message: `Invalid misconception cause: ${String(cause)}`,
          field: 'causes',
          entityId: misconception.id,
        });
      }
    }
  }

  if (!misconception.severity || !CANONICAL_MISCONCEPTION_SEVERITY.includes(misconception.severity)) {
    errors.push({
      code: MISCONCEPTION_VALIDATION_CODES.MISCONCEPTION_INVALID_SEVERITY,
      message: `Invalid severity: ${String(misconception.severity)}`,
      field: 'severity',
      entityId: misconception.id,
    });
  }

  if (!misconception.conceptIds || !Array.isArray(misconception.conceptIds) || misconception.conceptIds.length === 0) {
    errors.push({
      code: MISCONCEPTION_VALIDATION_CODES.MISCONCEPTION_MISSING_CONCEPT_REFERENCE,
      message: 'Misconception is missing conceptIds.',
      field: 'conceptIds',
      entityId: misconception.id,
    });
  }

  if (!misconception.remediationStrategies || !Array.isArray(misconception.remediationStrategies)) {
    errors.push({
      code: MISCONCEPTION_VALIDATION_CODES.MISCONCEPTION_INVALID_CONFIGURATION,
      message: 'Misconception is missing remediationStrategies array.',
      field: 'remediationStrategies',
      entityId: misconception.id,
    });
  } else {
    for (const strategy of misconception.remediationStrategies) {
      const strategyErrors = validateRemediationStrategy(strategy);
      errors.push(...strategyErrors);
    }
  }

  if (!misconception.status || !CANONICAL_MISCONCEPTION_STATUS.includes(misconception.status)) {
    errors.push({
      code: MISCONCEPTION_VALIDATION_CODES.MISCONCEPTION_INVALID_STATUS,
      message: `Invalid status: ${String(misconception.status)}`,
      field: 'status',
      entityId: misconception.id,
    });
  }

  if (!misconception.governance || !CANONICAL_ASSESSMENT_GOVERNANCE.includes(misconception.governance)) {
    errors.push({
      code: MISCONCEPTION_VALIDATION_CODES.MISCONCEPTION_INVALID_GOVERNANCE,
      message: `Invalid governance: ${String(misconception.governance)}`,
      field: 'governance',
      entityId: misconception.id,
    });
  }

  if (!misconception.provenance || typeof misconception.provenance !== 'object') {
    errors.push({
      code: MISCONCEPTION_VALIDATION_CODES.MISCONCEPTION_MISSING_PROVENANCE,
      message: 'Misconception is missing provenance.',
      field: 'provenance',
      entityId: misconception.id,
    });
  } else {
    if (!misconception.provenance.provider || misconception.provenance.provider.trim() === '') {
      errors.push({
        code: MISCONCEPTION_VALIDATION_CODES.MISCONCEPTION_MISSING_PROVIDER,
        message: 'Provenance is missing a valid provider.',
        field: 'provenance.provider',
        entityId: misconception.id,
      });
    }
    if (!misconception.provenance.rationale || misconception.provenance.rationale.trim() === '') {
      errors.push({
        code: MISCONCEPTION_VALIDATION_CODES.MISCONCEPTION_MISSING_RATIONALE,
        message: 'Provenance is missing a valid rationale.',
        field: 'provenance.rationale',
        entityId: misconception.id,
      });
    }
  }

  if (!misconception.trace || typeof misconception.trace !== 'object') {
    errors.push({
      code: MISCONCEPTION_VALIDATION_CODES.MISCONCEPTION_INVALID_TRACE,
      message: 'Misconception is missing trace metadata.',
      field: 'trace',
      entityId: misconception.id,
    });
  } else {
    if (misconception.trace.deterministic !== true) {
      errors.push({
        code: MISCONCEPTION_VALIDATION_CODES.MISCONCEPTION_INVALID_TRACE,
        message: 'Trace must declare deterministic: true.',
        field: 'trace.deterministic',
        entityId: misconception.id,
      });
    }
    if (misconception.trace.randomUsed !== false) {
      errors.push({
        code: MISCONCEPTION_VALIDATION_CODES.MISCONCEPTION_INVALID_TRACE,
        message: 'Trace must declare randomUsed: false.',
        field: 'trace.randomUsed',
        entityId: misconception.id,
      });
    }
    if (misconception.trace.timeDependency !== false) {
      errors.push({
        code: MISCONCEPTION_VALIDATION_CODES.MISCONCEPTION_INVALID_TRACE,
        message: 'Trace must declare timeDependency: false.',
        field: 'trace.timeDependency',
        entityId: misconception.id,
      });
    }
  }

  return errors;
}

/**
 * Validate a MisconceptionRelationship.
 * Returns structured errors. Never throws. Deterministic.
 */
export function validateMisconceptionRelationship(
  rel: MisconceptionRelationship,
): readonly MisconceptionValidationError[] {
  const errors: MisconceptionValidationError[] = [];

  if (!rel.id || rel.id.trim() === '') {
    errors.push({
      code: MISCONCEPTION_VALIDATION_CODES.RELATIONSHIP_DUPLICATE_ID,
      message: 'Relationship is missing a valid id.',
      field: 'id',
    });
  }

  if (!rel.sourceMisconceptionId || rel.sourceMisconceptionId.trim() === '') {
    errors.push({
      code: MISCONCEPTION_VALIDATION_CODES.MISCONCEPTION_MISSING_ASSESSMENT_REFERENCE,
      message: 'Relationship is missing sourceMisconceptionId.',
      field: 'sourceMisconceptionId',
      entityId: rel.id,
    });
  }

  if (!rel.targetMisconceptionId || rel.targetMisconceptionId.trim() === '') {
    errors.push({
      code: MISCONCEPTION_VALIDATION_CODES.MISCONCEPTION_MISSING_ASSESSMENT_REFERENCE,
      message: 'Relationship is missing targetMisconceptionId.',
      field: 'targetMisconceptionId',
      entityId: rel.id,
    });
  }

  if (
    rel.sourceMisconceptionId &&
    rel.targetMisconceptionId &&
    rel.sourceMisconceptionId === rel.targetMisconceptionId
  ) {
    errors.push({
      code: MISCONCEPTION_VALIDATION_CODES.MISCONCEPTION_SELF_RELATIONSHIP,
      message: 'Relationship cannot reference itself (source equals target).',
      field: 'sourceMisconceptionId',
      entityId: rel.id,
    });
  }

  return errors;
}

/**
 * Validate a MisconceptionRegistry.
 * Returns structured errors. Never throws. Deterministic.
 */
export function validateMisconceptionRegistry(
  registry: MisconceptionRegistry,
): MisconceptionRegistryValidationResult {
  const errors: MisconceptionValidationError[] = [];

  if (!registry || typeof registry !== 'object') {
    errors.push({
      code: MISCONCEPTION_VALIDATION_CODES.MISCONCEPTION_EMPTY_REGISTRY,
      message: 'Registry is null or not an object.',
    });
    return {
      valid: false,
      errors,
      nodeResults: [],
      checkedAt: 'misconception_registry_validation',
    };
  }

  if (!registry.nodes || !Array.isArray(registry.nodes)) {
    errors.push({
      code: MISCONCEPTION_VALIDATION_CODES.MISCONCEPTION_EMPTY_REGISTRY,
      message: 'Registry is missing nodes array.',
      field: 'nodes',
    });
    return {
      valid: false,
      errors,
      nodeResults: [],
      checkedAt: 'misconception_registry_validation',
    };
  }

  if (registry.nodes.length === 0) {
    errors.push({
      code: MISCONCEPTION_VALIDATION_CODES.MISCONCEPTION_EMPTY_REGISTRY,
      message: 'Registry has no nodes.',
      field: 'nodes',
    });
    return {
      valid: false,
      errors,
      nodeResults: [],
      checkedAt: 'misconception_registry_validation',
    };
  }

  const nodeResults = registry.nodes.map((node) => {
    const nodeErrors = validateAssessmentMisconception(node);
    return {
      valid: nodeErrors.length === 0,
      errors: nodeErrors,
      checkedAt: 'misconception_node_validation' as const,
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
        code: MISCONCEPTION_VALIDATION_CODES.MISCONCEPTION_DUPLICATE_ID,
        message: `Duplicate misconception id: ${node.id}`,
        field: 'id',
        entityId: node.id,
      });
    }
    idSet.add(node.id);

    if (titleSet.has(node.title)) {
      errors.push({
        code: MISCONCEPTION_VALIDATION_CODES.MISCONCEPTION_DUPLICATE_TITLE,
        message: `Duplicate misconception title: ${node.title}`,
        field: 'title',
        entityId: node.id,
      });
    }
    titleSet.add(node.title);
  }

  if (!registry.metadata || typeof registry.metadata !== 'object') {
    errors.push({
      code: MISCONCEPTION_VALIDATION_CODES.MISCONCEPTION_REGISTRY_INCONSISTENCY,
      message: 'Registry is missing metadata.',
      field: 'metadata',
    });
  } else {
    if (registry.metadata.nodeCount !== registry.nodes.length) {
      errors.push({
        code: MISCONCEPTION_VALIDATION_CODES.MISCONCEPTION_REGISTRY_INCONSISTENCY,
        message: `Metadata nodeCount (${registry.metadata.nodeCount}) does not match actual node count (${registry.nodes.length}).`,
        field: 'metadata.nodeCount',
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    nodeResults,
    checkedAt: 'misconception_registry_validation',
  };
}

/**
 * Validate a MisconceptionInput.
 * Returns structured errors. Never throws. Deterministic.
 */
export function validateMisconceptionInput(
  input: MisconceptionInput,
): MisconceptionInputValidationResult {
  const errors: MisconceptionValidationError[] = [];

  if (!input || typeof input !== 'object') {
    errors.push({
      code: MISCONCEPTION_VALIDATION_CODES.MISCONCEPTION_EMPTY_REGISTRY,
      message: 'Input is null or not an object.',
    });
    return {
      valid: false,
      errors,
      checkedAt: 'misconception_input_validation',
    };
  }

  if (!input.nodes || !Array.isArray(input.nodes)) {
    errors.push({
      code: MISCONCEPTION_VALIDATION_CODES.MISCONCEPTION_EMPTY_REGISTRY,
      message: 'Input is missing nodes array.',
      field: 'nodes',
    });
    return {
      valid: false,
      errors,
      checkedAt: 'misconception_input_validation',
    };
  }

  if (input.nodes.length === 0) {
    errors.push({
      code: MISCONCEPTION_VALIDATION_CODES.MISCONCEPTION_EMPTY_REGISTRY,
      message: 'Input has no nodes.',
      field: 'nodes',
    });
    return {
      valid: false,
      errors,
      checkedAt: 'misconception_input_validation',
    };
  }

  for (const node of input.nodes) {
    const nodeErrors = validateAssessmentMisconception(node);
    errors.push(...nodeErrors);
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'misconception_input_validation',
  };
}

/**
 * Validate a MisconceptionTrace.
 * Returns structured errors. Never throws. Deterministic.
 */
export function validateMisconceptionTrace(
  trace: MisconceptionTrace,
): MisconceptionTraceValidationResult {
  const errors: MisconceptionValidationError[] = [];

  if (!trace || typeof trace !== 'object') {
    errors.push({
      code: MISCONCEPTION_VALIDATION_CODES.MISCONCEPTION_INVALID_TRACE,
      message: 'Trace is null or not an object.',
    });
    return {
      valid: false,
      errors,
      checkedAt: 'misconception_trace_validation',
    };
  }

  if (!trace.traceId || typeof trace.traceId !== 'string' || trace.traceId.trim() === '') {
    errors.push({
      code: MISCONCEPTION_VALIDATION_CODES.MISCONCEPTION_INVALID_TRACE,
      message: 'Trace is missing a valid traceId.',
      field: 'traceId',
    });
  }

  if (trace.deterministic !== true) {
    errors.push({
      code: MISCONCEPTION_VALIDATION_CODES.MISCONCEPTION_INVALID_TRACE,
      message: 'Trace must declare deterministic: true.',
      field: 'deterministic',
    });
  }

  if (trace.randomUsed !== false) {
    errors.push({
      code: MISCONCEPTION_VALIDATION_CODES.MISCONCEPTION_INVALID_TRACE,
      message: 'Trace must declare randomUsed: false.',
      field: 'randomUsed',
    });
  }

  if (trace.timeDependency !== false) {
    errors.push({
      code: MISCONCEPTION_VALIDATION_CODES.MISCONCEPTION_INVALID_TRACE,
      message: 'Trace must declare timeDependency: false.',
      field: 'timeDependency',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'misconception_trace_validation',
  };
}

/**
 * Validate an AssessmentArtifactWithMisconceptions.
 * Returns structured errors. Never throws. Deterministic.
 */
export function validateAssessmentArtifactWithMisconceptions(
  artifact: AssessmentArtifactWithMisconceptions,
): AssessmentArtifactWithMisconceptionsValidationResult {
  const errors: MisconceptionValidationError[] = [];

  if (!artifact || typeof artifact !== 'object') {
    errors.push({
      code: MISCONCEPTION_VALIDATION_CODES.MISCONCEPTION_MISSING_ASSESSMENT_REFERENCE,
      message: 'Artifact is null or not an object.',
    });
    return {
      valid: false,
      errors,
      checkedAt: 'artifact_misconception_validation',
    };
  }

  if (!artifact.artifactId || artifact.artifactId.trim() === '') {
    errors.push({
      code: MISCONCEPTION_VALIDATION_CODES.MISCONCEPTION_MISSING_ASSESSMENT_REFERENCE,
      message: 'Artifact is missing a valid artifactId.',
      field: 'artifactId',
    });
  }

  if (!artifact.artifactTitle || artifact.artifactTitle.trim() === '') {
    errors.push({
      code: MISCONCEPTION_VALIDATION_CODES.MISCONCEPTION_MISSING_TITLE,
      message: 'Artifact is missing a valid artifactTitle.',
      field: 'artifactTitle',
    });
  }

  if (!artifact.misconceptions || !Array.isArray(artifact.misconceptions)) {
    errors.push({
      code: MISCONCEPTION_VALIDATION_CODES.MISCONCEPTION_MISSING_PROVENANCE,
      message: 'Artifact is missing misconceptions array.',
      field: 'misconceptions',
    });
  } else {
    for (const misconception of artifact.misconceptions) {
      const misconceptionErrors = validateAssessmentMisconception(misconception);
      errors.push(...misconceptionErrors);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'artifact_misconception_validation',
  };
}

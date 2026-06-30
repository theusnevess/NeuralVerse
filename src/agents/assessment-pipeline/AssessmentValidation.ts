/**
 * NV-2000-D8-OPT-01 — Assessment Validation Layer
 *
 * Deterministic validation for the Assessment Pipeline.
 * Returns structured errors, never exceptions for expected validation failures.
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import {
  type AssessmentInput,
  type AssessmentNode,
  type AssessmentNodeValidationResult,
  type AssessmentRegistry,
  type AssessmentRegistryValidationResult,
  type AssessmentInputValidationResult,
  type AssessmentTrace,
  type AssessmentTraceValidationResult,
  type AssessmentValidationError,
  type AssessmentValidationResult,
  CANONICAL_ASSESSMENT_ARTIFACT_TYPES,
  CANONICAL_ASSESSMENT_DOMAINS,
  CANONICAL_ASSESSMENT_GOVERNANCE,
  CANONICAL_ASSESSMENT_STATUS,
} from './AssessmentAgentContract.ts';

// ============================================================================
// VALIDATION CODES — Stable forever
// ============================================================================

export const VALIDATION_CODES = {
  ASSESSMENT_DUPLICATE_ID: 'ASSESSMENT_DUPLICATE_ID',
  ASSESSMENT_DUPLICATE_TITLE: 'ASSESSMENT_DUPLICATE_TITLE',
  ASSESSMENT_INVALID_ARTIFACT_TYPE: 'ASSESSMENT_INVALID_ARTIFACT_TYPE',
  ASSESSMENT_INVALID_DOMAIN: 'ASSESSMENT_INVALID_DOMAIN',
  ASSESSMENT_INVALID_STATUS: 'ASSESSMENT_INVALID_STATUS',
  ASSESSMENT_INVALID_GOVERNANCE: 'ASSESSMENT_INVALID_GOVERNANCE',
  ASSESSMENT_MISSING_PROVENANCE: 'ASSESSMENT_MISSING_PROVENANCE',
  ASSESSMENT_MISSING_RATIONALE: 'ASSESSMENT_MISSING_RATIONALE',
  ASSESSMENT_MISSING_PROVIDER: 'ASSESSMENT_MISSING_PROVIDER',
  ASSESSMENT_MISSING_TRACE: 'ASSESSMENT_MISSING_TRACE',
  ASSESSMENT_MISSING_ASSESSMENT_ID: 'ASSESSMENT_MISSING_ASSESSMENT_ID',
  ASSESSMENT_MISSING_TITLE: 'ASSESSMENT_MISSING_TITLE',
  ASSESSMENT_EMPTY_REGISTRY: 'ASSESSMENT_EMPTY_REGISTRY',
  ASSESSMENT_INVALID_TRACE: 'ASSESSMENT_INVALID_TRACE',
  ASSESSMENT_REGISTRY_INCONSISTENCY: 'ASSESSMENT_REGISTRY_INCONSISTENCY',
} as const;

// ============================================================================
// VALIDATION FUNCTIONS — Pure, never throw
// ============================================================================

/**
 * Validate a single AssessmentNode.
 *
 * Returns structured errors. Never throws. Deterministic.
 */
export function validateAssessmentNode(
  node: AssessmentNode,
): readonly AssessmentValidationError[] {
  const errors: AssessmentValidationError[] = [];

  if (!node || typeof node !== 'object') {
    errors.push({
      code: VALIDATION_CODES.ASSESSMENT_MISSING_ASSESSMENT_ID,
      message: 'Node is null or not an object.',
    });
    return errors;
  }

  if (!node.id || typeof node.id !== 'string' || node.id.trim() === '') {
    errors.push({
      code: VALIDATION_CODES.ASSESSMENT_MISSING_ASSESSMENT_ID,
      message: 'Node is missing a valid id.',
      field: 'id',
      entityId: node.id ?? 'unknown',
    });
  }

  if (!node.title || typeof node.title !== 'string' || node.title.trim() === '') {
    errors.push({
      code: VALIDATION_CODES.ASSESSMENT_MISSING_TITLE,
      message: 'Node is missing a valid title.',
      field: 'title',
      entityId: node.id,
    });
  }

  if (
    !node.artifactType ||
    !CANONICAL_ASSESSMENT_ARTIFACT_TYPES.includes(node.artifactType)
  ) {
    errors.push({
      code: VALIDATION_CODES.ASSESSMENT_INVALID_ARTIFACT_TYPE,
      message: `Invalid artifact type: ${String(node.artifactType)}`,
      field: 'artifactType',
      entityId: node.id,
    });
  }

  if (!node.domain || !CANONICAL_ASSESSMENT_DOMAINS.includes(node.domain)) {
    errors.push({
      code: VALIDATION_CODES.ASSESSMENT_INVALID_DOMAIN,
      message: `Invalid domain: ${String(node.domain)}`,
      field: 'domain',
      entityId: node.id,
    });
  }

  if (!node.status || !CANONICAL_ASSESSMENT_STATUS.includes(node.status)) {
    errors.push({
      code: VALIDATION_CODES.ASSESSMENT_INVALID_STATUS,
      message: `Invalid status: ${String(node.status)}`,
      field: 'status',
      entityId: node.id,
    });
  }

  if (
    !node.governance ||
    !CANONICAL_ASSESSMENT_GOVERNANCE.includes(node.governance)
  ) {
    errors.push({
      code: VALIDATION_CODES.ASSESSMENT_INVALID_GOVERNANCE,
      message: `Invalid governance: ${String(node.governance)}`,
      field: 'governance',
      entityId: node.id,
    });
  }

  if (!node.provenance || typeof node.provenance !== 'object') {
    errors.push({
      code: VALIDATION_CODES.ASSESSMENT_MISSING_PROVENANCE,
      message: 'Node is missing provenance.',
      field: 'provenance',
      entityId: node.id,
    });
  } else {
    if (
      !node.provenance.provider ||
      typeof node.provenance.provider !== 'string' ||
      node.provenance.provider.trim() === ''
    ) {
      errors.push({
        code: VALIDATION_CODES.ASSESSMENT_MISSING_PROVIDER,
        message: 'Provenance is missing a valid provider.',
        field: 'provenance.provider',
        entityId: node.id,
      });
    }
    if (
      !node.provenance.rationale ||
      typeof node.provenance.rationale !== 'string' ||
      node.provenance.rationale.trim() === ''
    ) {
      errors.push({
        code: VALIDATION_CODES.ASSESSMENT_MISSING_RATIONALE,
        message: 'Provenance is missing a valid rationale.',
        field: 'provenance.rationale',
        entityId: node.id,
      });
    }
  }

  if (!node.trace || typeof node.trace !== 'object') {
    errors.push({
      code: VALIDATION_CODES.ASSESSMENT_MISSING_TRACE,
      message: 'Node is missing trace metadata.',
      field: 'trace',
      entityId: node.id,
    });
  } else {
    if (node.trace.deterministic !== true) {
      errors.push({
        code: VALIDATION_CODES.ASSESSMENT_INVALID_TRACE,
        message: 'Trace must declare deterministic: true.',
        field: 'trace.deterministic',
        entityId: node.id,
      });
    }
    if (node.trace.randomUsed !== false) {
      errors.push({
        code: VALIDATION_CODES.ASSESSMENT_INVALID_TRACE,
        message: 'Trace must declare randomUsed: false.',
        field: 'trace.randomUsed',
        entityId: node.id,
      });
    }
    if (node.trace.timeDependency !== false) {
      errors.push({
        code: VALIDATION_CODES.ASSESSMENT_INVALID_TRACE,
        message: 'Trace must declare timeDependency: false.',
        field: 'trace.timeDependency',
        entityId: node.id,
      });
    }
  }

  return errors;
}

/**
 * Validate an AssessmentRegistry.
 *
 * Returns structured errors. Never throws. Deterministic.
 */
export function validateAssessmentRegistry(
  registry: AssessmentRegistry,
): AssessmentRegistryValidationResult {
  const errors: AssessmentValidationError[] = [];

  if (!registry || typeof registry !== 'object') {
    errors.push({
      code: VALIDATION_CODES.ASSESSMENT_EMPTY_REGISTRY,
      message: 'Registry is null or not an object.',
    });
    return {
      valid: false,
      errors,
      nodeResults: [],
      checkedAt: 'registry_validation',
    };
  }

  if (!registry.nodes || !Array.isArray(registry.nodes)) {
    errors.push({
      code: VALIDATION_CODES.ASSESSMENT_EMPTY_REGISTRY,
      message: 'Registry is missing nodes array.',
      field: 'nodes',
    });
    return {
      valid: false,
      errors,
      nodeResults: [],
      checkedAt: 'registry_validation',
    };
  }

  if (registry.nodes.length === 0) {
    errors.push({
      code: VALIDATION_CODES.ASSESSMENT_EMPTY_REGISTRY,
      message: 'Registry has no nodes.',
      field: 'nodes',
    });
    return {
      valid: false,
      errors,
      nodeResults: [],
      checkedAt: 'registry_validation',
    };
  }

  const nodeResults = registry.nodes.map((node) => {
    const nodeErrors = validateAssessmentNode(node);
    return {
      valid: nodeErrors.length === 0,
      errors: nodeErrors,
      nodeId: node.id,
      checkedAt: 'node_validation' as const,
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
        code: VALIDATION_CODES.ASSESSMENT_DUPLICATE_ID,
        message: `Duplicate node id: ${node.id}`,
        field: 'id',
        entityId: node.id,
      });
    }
    idSet.add(node.id);

    if (titleSet.has(node.title)) {
      errors.push({
        code: VALIDATION_CODES.ASSESSMENT_DUPLICATE_TITLE,
        message: `Duplicate node title: ${node.title}`,
        field: 'title',
        entityId: node.id,
      });
    }
    titleSet.add(node.title);
  }

  if (!registry.metadata || typeof registry.metadata !== 'object') {
    errors.push({
      code: VALIDATION_CODES.ASSESSMENT_REGISTRY_INCONSISTENCY,
      message: 'Registry is missing metadata.',
      field: 'metadata',
    });
  } else {
    if (registry.metadata.nodeCount !== registry.nodes.length) {
      errors.push({
        code: VALIDATION_CODES.ASSESSMENT_REGISTRY_INCONSISTENCY,
        message: `Metadata nodeCount (${registry.metadata.nodeCount}) does not match actual node count (${registry.nodes.length}).`,
        field: 'metadata.nodeCount',
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    nodeResults,
    checkedAt: 'registry_validation',
  };
}

/**
 * Validate an AssessmentInput.
 *
 * Returns structured errors. Never throws. Deterministic.
 */
export function validateAssessmentInput(
  input: AssessmentInput,
): AssessmentInputValidationResult {
  const errors: AssessmentValidationError[] = [];

  if (!input || typeof input !== 'object') {
    errors.push({
      code: VALIDATION_CODES.ASSESSMENT_EMPTY_REGISTRY,
      message: 'Input is null or not an object.',
    });
    return {
      valid: false,
      errors,
      checkedAt: 'input_validation',
    };
  }

  if (!input.nodes || !Array.isArray(input.nodes)) {
    errors.push({
      code: VALIDATION_CODES.ASSESSMENT_EMPTY_REGISTRY,
      message: 'Input is missing nodes array.',
      field: 'nodes',
    });
    return {
      valid: false,
      errors,
      checkedAt: 'input_validation',
    };
  }

  if (input.nodes.length === 0) {
    errors.push({
      code: VALIDATION_CODES.ASSESSMENT_EMPTY_REGISTRY,
      message: 'Input has no nodes.',
      field: 'nodes',
    });
    return {
      valid: false,
      errors,
      checkedAt: 'input_validation',
    };
  }

  for (const node of input.nodes) {
    const nodeErrors = validateAssessmentNode(node);
    errors.push(...nodeErrors);
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'input_validation',
  };
}

/**
 * Validate an AssessmentTrace.
 *
 * Returns structured errors. Never throws. Deterministic.
 */
export function validateAssessmentTrace(
  trace: AssessmentTrace,
): AssessmentTraceValidationResult {
  const errors: AssessmentValidationError[] = [];

  if (!trace || typeof trace !== 'object') {
    errors.push({
      code: VALIDATION_CODES.ASSESSMENT_INVALID_TRACE,
      message: 'Trace is null or not an object.',
    });
    return {
      valid: false,
      errors,
      checkedAt: 'trace_validation',
    };
  }

  if (!trace.traceId || typeof trace.traceId !== 'string' || trace.traceId.trim() === '') {
    errors.push({
      code: VALIDATION_CODES.ASSESSMENT_INVALID_TRACE,
      message: 'Trace is missing a valid traceId.',
      field: 'traceId',
    });
  }

  if (trace.deterministic !== true) {
    errors.push({
      code: VALIDATION_CODES.ASSESSMENT_INVALID_TRACE,
      message: 'Trace must declare deterministic: true.',
      field: 'deterministic',
    });
  }

  if (trace.randomUsed !== false) {
    errors.push({
      code: VALIDATION_CODES.ASSESSMENT_INVALID_TRACE,
      message: 'Trace must declare randomUsed: false.',
      field: 'randomUsed',
    });
  }

  if (trace.timeDependency !== false) {
    errors.push({
      code: VALIDATION_CODES.ASSESSMENT_INVALID_TRACE,
      message: 'Trace must declare timeDependency: false.',
      field: 'timeDependency',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'trace_validation',
  };
}

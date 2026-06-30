/**
 * NV-2000-D8-OPT-03 — Verification Validation Layer
 *
 * Deterministic validation for the Verification Kernel.
 * Returns structured errors, never exceptions for expected validation failures.
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import {
  type AssessmentArtifactWithVerification,
  type AssessmentArtifactWithVerificationValidationResult,
  type VerificationInput,
  type VerificationInputValidationResult,
  type VerificationRegistry,
  type VerificationRegistryValidationResult,
  type VerificationRule,
  type VerificationRuleValidationResult,
  type VerificationTrace,
  type VerificationTraceValidationResult,
  type VerificationValidationError,
  CANONICAL_ASSESSMENT_GOVERNANCE,
  CANONICAL_MATCHING_STRATEGIES,
  CANONICAL_RESPONSE_TYPES,
  CANONICAL_VERIFICATION_STATUS,
  CANONICAL_VERIFICATION_TYPES,
} from './AssessmentAgentContract.ts';

// ============================================================================
// VALIDATION CODES — Stable forever
// ============================================================================

export const VERIFICATION_VALIDATION_CODES = {
  VERIFICATION_DUPLICATE_ID: 'VERIFICATION_DUPLICATE_ID',
  VERIFICATION_DUPLICATE_TITLE: 'VERIFICATION_DUPLICATE_TITLE',
  VERIFICATION_INVALID_TYPE: 'VERIFICATION_INVALID_TYPE',
  VERIFICATION_INVALID_RESPONSE_TYPE: 'VERIFICATION_INVALID_RESPONSE_TYPE',
  VERIFICATION_INVALID_MATCHING_STRATEGY: 'VERIFICATION_INVALID_MATCHING_STRATEGY',
  VERIFICATION_INVALID_RESULT: 'VERIFICATION_INVALID_RESULT',
  VERIFICATION_INVALID_STATUS: 'VERIFICATION_INVALID_STATUS',
  VERIFICATION_INVALID_GOVERNANCE: 'VERIFICATION_INVALID_GOVERNANCE',
  VERIFICATION_MISSING_EXPECTED_ANSWER: 'VERIFICATION_MISSING_EXPECTED_ANSWER',
  VERIFICATION_MISSING_PROVENANCE: 'VERIFICATION_MISSING_PROVENANCE',
  VERIFICATION_MISSING_PROVIDER: 'VERIFICATION_MISSING_PROVIDER',
  VERIFICATION_MISSING_RATIONALE: 'VERIFICATION_MISSING_RATIONALE',
  VERIFICATION_MISSING_RULE_ID: 'VERIFICATION_MISSING_RULE_ID',
  VERIFICATION_MISSING_ASSESSMENT_REFERENCE: 'VERIFICATION_MISSING_ASSESSMENT_REFERENCE',
  VERIFICATION_MISSING_RESPONSE: 'VERIFICATION_MISSING_RESPONSE',
  VERIFICATION_EMPTY_REGISTRY: 'VERIFICATION_EMPTY_REGISTRY',
  VERIFICATION_INVALID_TRACE: 'VERIFICATION_INVALID_TRACE',
  VERIFICATION_REGISTRY_INCONSISTENCY: 'VERIFICATION_REGISTRY_INCONSISTENCY',
  VERIFICATION_UNSUPPORTED_CONFIGURATION: 'VERIFICATION_UNSUPPORTED_CONFIGURATION',
  VERIFICATION_INVALID_RULE: 'VERIFICATION_INVALID_RULE',
} as const;

// ============================================================================
// VALIDATION FUNCTIONS — Pure, never throw
// ============================================================================

/**
 * Validate a single VerificationRule.
 * Returns structured errors. Never throws. Deterministic.
 */
export function validateVerificationRule(
  rule: VerificationRule,
): readonly VerificationValidationError[] {
  const errors: VerificationValidationError[] = [];

  if (!rule || typeof rule !== 'object') {
    errors.push({
      code: VERIFICATION_VALIDATION_CODES.VERIFICATION_MISSING_RULE_ID,
      message: 'Rule is null or not an object.',
    });
    return errors;
  }

  if (!rule.id || typeof rule.id !== 'string' || rule.id.trim() === '') {
    errors.push({
      code: VERIFICATION_VALIDATION_CODES.VERIFICATION_MISSING_RULE_ID,
      message: 'Rule is missing a valid id.',
      field: 'id',
      entityId: rule.id ?? 'unknown',
    });
  }

  if (!rule.title || typeof rule.title !== 'string' || rule.title.trim() === '') {
    errors.push({
      code: VERIFICATION_VALIDATION_CODES.VERIFICATION_INVALID_RULE,
      message: 'Rule is missing a valid title.',
      field: 'title',
      entityId: rule.id,
    });
  }

  if (
    !rule.verificationType ||
    !CANONICAL_VERIFICATION_TYPES.includes(rule.verificationType)
  ) {
    errors.push({
      code: VERIFICATION_VALIDATION_CODES.VERIFICATION_INVALID_TYPE,
      message: `Invalid verification type: ${String(rule.verificationType)}`,
      field: 'verificationType',
      entityId: rule.id,
    });
  }

  if (
    !rule.responseType ||
    !CANONICAL_RESPONSE_TYPES.includes(rule.responseType)
  ) {
    errors.push({
      code: VERIFICATION_VALIDATION_CODES.VERIFICATION_INVALID_RESPONSE_TYPE,
      message: `Invalid response type: ${String(rule.responseType)}`,
      field: 'responseType',
      entityId: rule.id,
    });
  }

  if (
    !rule.matchingStrategy ||
    !CANONICAL_MATCHING_STRATEGIES.includes(rule.matchingStrategy)
  ) {
    errors.push({
      code: VERIFICATION_VALIDATION_CODES.VERIFICATION_INVALID_MATCHING_STRATEGY,
      message: `Invalid matching strategy: ${String(rule.matchingStrategy)}`,
      field: 'matchingStrategy',
      entityId: rule.id,
    });
  }

  if (!rule.expectedAnswer || rule.expectedAnswer.length === 0) {
    errors.push({
      code: VERIFICATION_VALIDATION_CODES.VERIFICATION_MISSING_EXPECTED_ANSWER,
      message: 'Rule is missing expectedAnswer.',
      field: 'expectedAnswer',
      entityId: rule.id,
    });
  }

  if (!rule.status || !CANONICAL_VERIFICATION_STATUS.includes(rule.status)) {
    errors.push({
      code: VERIFICATION_VALIDATION_CODES.VERIFICATION_INVALID_STATUS,
      message: `Invalid status: ${String(rule.status)}`,
      field: 'status',
      entityId: rule.id,
    });
  }

  if (
    !rule.governance ||
    !CANONICAL_ASSESSMENT_GOVERNANCE.includes(rule.governance)
  ) {
    errors.push({
      code: VERIFICATION_VALIDATION_CODES.VERIFICATION_INVALID_GOVERNANCE,
      message: `Invalid governance: ${String(rule.governance)}`,
      field: 'governance',
      entityId: rule.id,
    });
  }

  if (!rule.provenance || typeof rule.provenance !== 'object') {
    errors.push({
      code: VERIFICATION_VALIDATION_CODES.VERIFICATION_MISSING_PROVENANCE,
      message: 'Rule is missing provenance.',
      field: 'provenance',
      entityId: rule.id,
    });
  } else {
    if (
      !rule.provenance.provider ||
      typeof rule.provenance.provider !== 'string' ||
      rule.provenance.provider.trim() === ''
    ) {
      errors.push({
        code: VERIFICATION_VALIDATION_CODES.VERIFICATION_MISSING_PROVIDER,
        message: 'Provenance is missing a valid provider.',
        field: 'provenance.provider',
        entityId: rule.id,
      });
    }
    if (
      !rule.provenance.rationale ||
      typeof rule.provenance.rationale !== 'string' ||
      rule.provenance.rationale.trim() === ''
    ) {
      errors.push({
        code: VERIFICATION_VALIDATION_CODES.VERIFICATION_MISSING_RATIONALE,
        message: 'Provenance is missing a valid rationale.',
        field: 'provenance.rationale',
        entityId: rule.id,
      });
    }
  }

  if (!rule.trace || typeof rule.trace !== 'object') {
    errors.push({
      code: VERIFICATION_VALIDATION_CODES.VERIFICATION_INVALID_TRACE,
      message: 'Rule is missing trace metadata.',
      field: 'trace',
      entityId: rule.id,
    });
  } else {
    if (rule.trace.deterministic !== true) {
      errors.push({
        code: VERIFICATION_VALIDATION_CODES.VERIFICATION_INVALID_TRACE,
        message: 'Trace must declare deterministic: true.',
        field: 'trace.deterministic',
        entityId: rule.id,
      });
    }
    if (rule.trace.randomUsed !== false) {
      errors.push({
        code: VERIFICATION_VALIDATION_CODES.VERIFICATION_INVALID_TRACE,
        message: 'Trace must declare randomUsed: false.',
        field: 'trace.randomUsed',
        entityId: rule.id,
      });
    }
    if (rule.trace.timeDependency !== false) {
      errors.push({
        code: VERIFICATION_VALIDATION_CODES.VERIFICATION_INVALID_TRACE,
        message: 'Trace must declare timeDependency: false.',
        field: 'trace.timeDependency',
        entityId: rule.id,
      });
    }
  }

  return errors;
}

/**
 * Validate a VerificationRegistry.
 * Returns structured errors. Never throws. Deterministic.
 */
export function validateVerificationRegistry(
  registry: VerificationRegistry,
): VerificationRegistryValidationResult {
  const errors: VerificationValidationError[] = [];

  if (!registry || typeof registry !== 'object') {
    errors.push({
      code: VERIFICATION_VALIDATION_CODES.VERIFICATION_EMPTY_REGISTRY,
      message: 'Registry is null or not an object.',
    });
    return {
      valid: false,
      errors,
      nodeResults: [],
      checkedAt: 'verification_registry_validation',
    };
  }

  if (!registry.nodes || !Array.isArray(registry.nodes)) {
    errors.push({
      code: VERIFICATION_VALIDATION_CODES.VERIFICATION_EMPTY_REGISTRY,
      message: 'Registry is missing nodes array.',
      field: 'nodes',
    });
    return {
      valid: false,
      errors,
      nodeResults: [],
      checkedAt: 'verification_registry_validation',
    };
  }

  if (registry.nodes.length === 0) {
    errors.push({
      code: VERIFICATION_VALIDATION_CODES.VERIFICATION_EMPTY_REGISTRY,
      message: 'Registry has no nodes.',
      field: 'nodes',
    });
    return {
      valid: false,
      errors,
      nodeResults: [],
      checkedAt: 'verification_registry_validation',
    };
  }

  const nodeResults = registry.nodes.map((node) => {
    const nodeErrors = validateVerificationRule(node);
    return {
      valid: nodeErrors.length === 0,
      errors: nodeErrors,
      ruleId: node.id,
      checkedAt: 'verification_rule_validation' as const,
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
        code: VERIFICATION_VALIDATION_CODES.VERIFICATION_DUPLICATE_ID,
        message: `Duplicate rule id: ${node.id}`,
        field: 'id',
        entityId: node.id,
      });
    }
    idSet.add(node.id);

    if (titleSet.has(node.title)) {
      errors.push({
        code: VERIFICATION_VALIDATION_CODES.VERIFICATION_DUPLICATE_TITLE,
        message: `Duplicate rule title: ${node.title}`,
        field: 'title',
        entityId: node.id,
      });
    }
    titleSet.add(node.title);
  }

  if (!registry.metadata || typeof registry.metadata !== 'object') {
    errors.push({
      code: VERIFICATION_VALIDATION_CODES.VERIFICATION_REGISTRY_INCONSISTENCY,
      message: 'Registry is missing metadata.',
      field: 'metadata',
    });
  } else {
    if (registry.metadata.nodeCount !== registry.nodes.length) {
      errors.push({
        code: VERIFICATION_VALIDATION_CODES.VERIFICATION_REGISTRY_INCONSISTENCY,
        message: `Metadata nodeCount (${registry.metadata.nodeCount}) does not match actual node count (${registry.nodes.length}).`,
        field: 'metadata.nodeCount',
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    nodeResults,
    checkedAt: 'verification_registry_validation',
  };
}

/**
 * Validate a VerificationInput.
 * Returns structured errors. Never throws. Deterministic.
 */
export function validateVerificationInput(
  input: VerificationInput,
): VerificationInputValidationResult {
  const errors: VerificationValidationError[] = [];

  if (!input || typeof input !== 'object') {
    errors.push({
      code: VERIFICATION_VALIDATION_CODES.VERIFICATION_EMPTY_REGISTRY,
      message: 'Input is null or not an object.',
    });
    return {
      valid: false,
      errors,
      checkedAt: 'verification_input_validation',
    };
  }

  if (!input.nodes || !Array.isArray(input.nodes)) {
    errors.push({
      code: VERIFICATION_VALIDATION_CODES.VERIFICATION_EMPTY_REGISTRY,
      message: 'Input is missing nodes array.',
      field: 'nodes',
    });
    return {
      valid: false,
      errors,
      checkedAt: 'verification_input_validation',
    };
  }

  if (input.nodes.length === 0) {
    errors.push({
      code: VERIFICATION_VALIDATION_CODES.VERIFICATION_EMPTY_REGISTRY,
      message: 'Input has no nodes.',
      field: 'nodes',
    });
    return {
      valid: false,
      errors,
      checkedAt: 'verification_input_validation',
    };
  }

  for (const node of input.nodes) {
    const nodeErrors = validateVerificationRule(node);
    errors.push(...nodeErrors);
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'verification_input_validation',
  };
}

/**
 * Validate a VerificationTrace.
 * Returns structured errors. Never throws. Deterministic.
 */
export function validateVerificationTrace(
  trace: VerificationTrace,
): VerificationTraceValidationResult {
  const errors: VerificationValidationError[] = [];

  if (!trace || typeof trace !== 'object') {
    errors.push({
      code: VERIFICATION_VALIDATION_CODES.VERIFICATION_INVALID_TRACE,
      message: 'Trace is null or not an object.',
    });
    return {
      valid: false,
      errors,
      checkedAt: 'verification_trace_validation',
    };
  }

  if (
    !trace.traceId ||
    typeof trace.traceId !== 'string' ||
    trace.traceId.trim() === ''
  ) {
    errors.push({
      code: VERIFICATION_VALIDATION_CODES.VERIFICATION_INVALID_TRACE,
      message: 'Trace is missing a valid traceId.',
      field: 'traceId',
    });
  }

  if (trace.deterministic !== true) {
    errors.push({
      code: VERIFICATION_VALIDATION_CODES.VERIFICATION_INVALID_TRACE,
      message: 'Trace must declare deterministic: true.',
      field: 'deterministic',
    });
  }

  if (trace.randomUsed !== false) {
    errors.push({
      code: VERIFICATION_VALIDATION_CODES.VERIFICATION_INVALID_TRACE,
      message: 'Trace must declare randomUsed: false.',
      field: 'randomUsed',
    });
  }

  if (trace.timeDependency !== false) {
    errors.push({
      code: VERIFICATION_VALIDATION_CODES.VERIFICATION_INVALID_TRACE,
      message: 'Trace must declare timeDependency: false.',
      field: 'timeDependency',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'verification_trace_validation',
  };
}

/**
 * Validate an AssessmentArtifactWithVerification.
 * Returns structured errors. Never throws. Deterministic.
 */
export function validateAssessmentArtifactWithVerification(
  artifact: AssessmentArtifactWithVerification,
): AssessmentArtifactWithVerificationValidationResult {
  const errors: VerificationValidationError[] = [];

  if (!artifact || typeof artifact !== 'object') {
    errors.push({
      code: VERIFICATION_VALIDATION_CODES.VERIFICATION_MISSING_ASSESSMENT_REFERENCE,
      message: 'Artifact is null or not an object.',
    });
    return {
      valid: false,
      errors,
      checkedAt: 'artifact_verification_validation',
    };
  }

  if (
    !artifact.artifactId ||
    typeof artifact.artifactId !== 'string' ||
    artifact.artifactId.trim() === ''
  ) {
    errors.push({
      code: VERIFICATION_VALIDATION_CODES.VERIFICATION_MISSING_ASSESSMENT_REFERENCE,
      message: 'Artifact is missing a valid artifactId.',
      field: 'artifactId',
    });
  }

  if (
    !artifact.artifactTitle ||
    typeof artifact.artifactTitle !== 'string' ||
    artifact.artifactTitle.trim() === ''
  ) {
    errors.push({
      code: VERIFICATION_VALIDATION_CODES.VERIFICATION_MISSING_ASSESSMENT_REFERENCE,
      message: 'Artifact is missing a valid artifactTitle.',
      field: 'artifactTitle',
    });
  }

  if (!artifact.verificationRule || typeof artifact.verificationRule !== 'object') {
    errors.push({
      code: VERIFICATION_VALIDATION_CODES.VERIFICATION_MISSING_PROVENANCE,
      message: 'Artifact is missing verificationRule.',
      field: 'verificationRule',
    });
  } else {
    const ruleErrors = validateVerificationRule(artifact.verificationRule);
    errors.push(...ruleErrors);
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'artifact_verification_validation',
  };
}

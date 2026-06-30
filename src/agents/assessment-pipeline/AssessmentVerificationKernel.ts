/**
 * NV-2000-D8-OPT-03 — Deterministic Verification Kernel
 *
 * Pure deterministic compose functions and verification logic for the
 * Assessment Pipeline. Implements answer verification only.
 *
 * Guarantees:
 * - Same inputs always produce identical outputs.
 * - No global mutable state reads.
 * - No random values.
 * - No time dependency.
 * - Canonical order is always preserved.
 * - No scoring, no mastery, no feedback.
 *
 * Deterministic. No Math.random. No Date.now.
 */

import {
  type AssessmentArtifactWithVerification,
  type AssessmentGovernanceLevel,
  type LearnerResponse,
  type MatchingStrategy,
  type ResponseType,
  type VerificationDecision,
  type VerificationInput,
  type VerificationProvenance,
  type VerificationRegistry,
  type VerificationRegistryMetadata,
  type VerificationRelationship,
  type VerificationResult,
  type VerificationResultType,
  type VerificationRule,
  type VerificationStatus,
  type VerificationTrace,
  type VerificationType,
  CANONICAL_ASSESSMENT_GOVERNANCE,
  CANONICAL_MATCHING_STRATEGIES,
  CANONICAL_RESPONSE_TYPES,
  CANONICAL_VERIFICATION_RESULT_TYPES,
  CANONICAL_VERIFICATION_STATUS,
  CANONICAL_VERIFICATION_TYPES,
} from './AssessmentAgentContract.ts';

// ============================================================================
// HELPER FUNCTIONS — Canonical lookups and type guards
// ============================================================================

/**
 * Type guard: is the value a supported verification type?
 */
export function isSupportedVerificationType(
  value: string,
): value is VerificationType {
  return CANONICAL_VERIFICATION_TYPES.includes(value as VerificationType);
}

/**
 * Type guard: is the value a supported response type?
 */
export function isSupportedResponseType(
  value: string,
): value is ResponseType {
  return CANONICAL_RESPONSE_TYPES.includes(value as ResponseType);
}

/**
 * Type guard: is the value a supported matching strategy?
 */
export function isSupportedMatchingStrategy(
  value: string,
): value is MatchingStrategy {
  return CANONICAL_MATCHING_STRATEGIES.includes(value as MatchingStrategy);
}

/**
 * Type guard: is the value a supported verification result type?
 */
export function isSupportedVerificationResult(
  value: string,
): value is VerificationResultType {
  return CANONICAL_VERIFICATION_RESULT_TYPES.includes(
    value as VerificationResultType,
  );
}

/**
 * Type guard: is the value a supported verification status?
 */
export function isSupportedVerificationStatus(
  value: string,
): value is VerificationStatus {
  return CANONICAL_VERIFICATION_STATUS.includes(value as VerificationStatus);
}

/**
 * Type guard: is the value a supported verification governance level?
 */
export function isSupportedVerificationGovernance(
  value: string,
): value is AssessmentGovernanceLevel {
  return CANONICAL_ASSESSMENT_GOVERNANCE.includes(
    value as AssessmentGovernanceLevel,
  );
}

/**
 * Returns a copy of canonical verification types.
 */
export function getCanonicalVerificationTypes(): readonly VerificationType[] {
  return [...CANONICAL_VERIFICATION_TYPES];
}

/**
 * Returns a copy of canonical response types.
 */
export function getCanonicalResponseTypes(): readonly ResponseType[] {
  return [...CANONICAL_RESPONSE_TYPES];
}

/**
 * Returns a copy of canonical matching strategies.
 */
export function getCanonicalMatchingStrategies(): readonly MatchingStrategy[] {
  return [...CANONICAL_MATCHING_STRATEGIES];
}

/**
 * Returns a copy of canonical verification result types.
 */
export function getCanonicalVerificationResultTypes(): readonly VerificationResultType[] {
  return [...CANONICAL_VERIFICATION_RESULT_TYPES];
}

/**
 * Returns a copy of canonical verification statuses.
 */
export function getCanonicalVerificationStatuses(): readonly VerificationStatus[] {
  return [...CANONICAL_VERIFICATION_STATUS];
}

// ============================================================================
// COMPOSE FUNCTIONS — Pure deterministic composition
// ============================================================================

/**
 * Deterministic ID generator.
 */
function _deterministicId(prefix: string, parts: readonly string[]): string {
  const slug = parts
    .join('-')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 60);
  return `${prefix}-${slug}`;
}

/**
 * Compose an immutable VerificationProvenance.
 */
export function composeVerificationProvenance(params: {
  readonly provider: string;
  readonly source: string;
  readonly reviewStatus: VerificationStatus;
  readonly reviewDate: string;
  readonly version: string;
  readonly rationale: string;
}): VerificationProvenance {
  return {
    provider: params.provider,
    source: params.source,
    reviewStatus: params.reviewStatus,
    reviewDate: params.reviewDate,
    version: params.version,
    rationale: params.rationale,
  };
}

/**
 * Compose an immutable VerificationTrace.
 */
export function composeVerificationTrace(params: {
  readonly traceId: string;
}): VerificationTrace {
  return {
    traceId: params.traceId,
    deterministic: true,
    generatedFrom: 'deterministic_verification_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}

/**
 * Compose an immutable VerificationRule.
 */
export function composeVerificationRule(params: {
  readonly id: string;
  readonly title: string;
  readonly verificationType: VerificationType;
  readonly responseType: ResponseType;
  readonly matchingStrategy: MatchingStrategy;
  readonly expectedAnswer: readonly string[];
  readonly status: VerificationStatus;
  readonly governance: AssessmentGovernanceLevel;
  readonly provenance: VerificationProvenance;
}): VerificationRule {
  const traceId = _deterministicId('verification-rule', [params.id]);
  const trace = composeVerificationTrace({ traceId });

  return {
    id: params.id,
    title: params.title,
    verificationType: params.verificationType,
    responseType: params.responseType,
    matchingStrategy: params.matchingStrategy,
    expectedAnswer: [...params.expectedAnswer],
    status: params.status,
    governance: params.governance,
    provenance: params.provenance,
    trace,
  };
}

/**
 * Compose an immutable LearnerResponse.
 */
export function composeLearnerResponse(params: {
  readonly responseId: string;
  readonly ruleId: string;
  readonly responseType: ResponseType;
  readonly submittedAnswer: readonly string[];
  readonly timestamp?: string;
}): LearnerResponse {
  return {
    responseId: params.responseId,
    ruleId: params.ruleId,
    responseType: params.responseType,
    submittedAnswer: [...params.submittedAnswer],
    ...(params.timestamp !== undefined ? { timestamp: params.timestamp } : {}),
  };
}

/**
 * Compose an immutable VerificationRelationship.
 */
export function composeVerificationRelationship(params: {
  readonly id: string;
  readonly sourceRuleId: string;
  readonly targetRuleId: string;
  readonly relationshipType: string;
  readonly rationale: string;
}): VerificationRelationship {
  return {
    id: params.id,
    sourceRuleId: params.sourceRuleId,
    targetRuleId: params.targetRuleId,
    relationshipType: params.relationshipType,
    rationale: params.rationale,
  };
}

/**
 * Compose immutable VerificationRegistryMetadata.
 */
export function _composeVerificationRegistryMetadata(
  nodes: readonly VerificationRule[],
): VerificationRegistryMetadata {
  const sortedIds = [...nodes].map((n) => n.id).sort();
  const registryId = _deterministicId('verification-registry', sortedIds);

  return {
    registryId,
    version: '1.0.0',
    nodeCount: nodes.length,
    generatedFrom: 'deterministic_verification_kernel',
    deterministic: true,
    randomUsed: false,
    timeDependency: false,
  };
}

/**
 * Compose an immutable VerificationRegistry from pre-composed rules.
 */
export function composeVerificationRegistry(
  nodes: readonly VerificationRule[],
): VerificationRegistry {
  const sortedNodes = [...nodes].sort((a, b) => a.id.localeCompare(b.id));
  const metadata = _composeVerificationRegistryMetadata(sortedNodes);

  return {
    metadata,
    nodes: sortedNodes,
  };
}

/**
 * Compose an immutable VerificationRegistry from a VerificationInput.
 */
export function composeVerificationRegistryFromInput(
  input: VerificationInput,
): VerificationRegistry {
  return composeVerificationRegistry(input.nodes);
}

/**
 * Compose a deterministic VerificationResult for a rule and response.
 */
export function composeVerification(params: {
  readonly rule: VerificationRule;
  readonly response: LearnerResponse;
  readonly result: VerificationResultType;
  readonly matched: boolean;
  readonly reason: string;
}): VerificationResult {
  const traceId = _deterministicId('verification-result', [
    params.rule.id,
    params.response.responseId,
  ]);
  const trace = composeVerificationTrace({ traceId });

  return {
    ruleId: params.rule.id,
    result: params.result,
    matched: params.matched,
    reason: params.reason,
    trace,
  };
}

/**
 * Compose an assessment artifact enriched with a verification rule.
 */
export function composeAssessmentArtifactWithVerification(params: {
  readonly artifactId: string;
  readonly artifactTitle: string;
  readonly verificationRule: VerificationRule;
}): AssessmentArtifactWithVerification {
  return {
    artifactId: params.artifactId,
    artifactTitle: params.artifactTitle,
    verificationRule: params.verificationRule,
  };
}

// ============================================================================
// VERIFICATION FUNCTIONS — Deterministic answer verification
// ============================================================================

/**
 * Normalize a string for comparison based on strategy.
 */
function _normalizeForStrategy(
  value: string,
  strategy: MatchingStrategy,
): string {
  switch (strategy) {
    case 'case_insensitive':
      return value.toLowerCase();
    case 'normalized':
      return value
        .toLowerCase()
        .trim()
        .replace(/\s+/g, ' ');
    default:
      return value;
  }
}

/**
 * Verify exact match.
 */
export function verifyExactMatch(
  expected: readonly string[],
  submitted: readonly string[],
  strategy: MatchingStrategy,
): VerificationResultType {
  if (submitted.length === 0) {
    return 'missing_response';
  }
  if (expected.length !== submitted.length) {
    return 'incorrect';
  }
  for (let i = 0; i < expected.length; i++) {
    const e = _normalizeForStrategy(expected[i], strategy);
    const s = _normalizeForStrategy(submitted[i], strategy);
    if (e !== s) {
      return 'incorrect';
    }
  }
  return 'correct';
}

/**
 * Verify ordered match (sequence must match exactly).
 */
export function verifyOrderedMatch(
  expected: readonly string[],
  submitted: readonly string[],
  strategy: MatchingStrategy,
): VerificationResultType {
  return verifyExactMatch(expected, submitted, strategy);
}

/**
 * Verify unordered match (same elements, any order).
 */
export function verifyUnorderedMatch(
  expected: readonly string[],
  submitted: readonly string[],
  strategy: MatchingStrategy,
): VerificationResultType {
  if (submitted.length === 0) {
    return 'missing_response';
  }
  if (expected.length !== submitted.length) {
    if (submitted.length < expected.length) {
      return 'incomplete';
    }
    return 'incorrect';
  }
  const normalizedExpected = [...expected]
    .map((e) => _normalizeForStrategy(e, strategy))
    .sort();
  const normalizedSubmitted = [...submitted]
    .map((s) => _normalizeForStrategy(s, strategy))
    .sort();
  for (let i = 0; i < normalizedExpected.length; i++) {
    if (normalizedExpected[i] !== normalizedSubmitted[i]) {
      return 'incorrect';
    }
  }
  return 'correct';
}

/**
 * Verify multiple selection (subset matching).
 */
export function verifyMultipleSelection(
  expected: readonly string[],
  submitted: readonly string[],
  strategy: MatchingStrategy,
): VerificationResultType {
  if (submitted.length === 0) {
    return 'missing_response';
  }
  const normalizedExpected = new Set(
    expected.map((e) => _normalizeForStrategy(e, strategy)),
  );
  const normalizedSubmitted = submitted.map((s) =>
    _normalizeForStrategy(s, strategy),
  );
  let allCorrect = true;
  for (const s of normalizedSubmitted) {
    if (!normalizedExpected.has(s)) {
      allCorrect = false;
      break;
    }
  }
  if (!allCorrect) {
    return 'incorrect';
  }
  if (normalizedSubmitted.length === normalizedExpected.size) {
    return 'correct';
  }
  return 'partially_correct';
}

/**
 * Verify boolean.
 */
export function verifyBoolean(
  expected: readonly string[],
  submitted: readonly string[],
): VerificationResultType {
  if (submitted.length === 0) {
    return 'missing_response';
  }
  if (submitted.length !== 1) {
    return 'invalid_format';
  }
  const e = expected[0]?.toLowerCase();
  const s = submitted[0]?.toLowerCase();
  if (e === s) {
    return 'correct';
  }
  return 'incorrect';
}

/**
 * Verify numeric.
 */
export function verifyNumeric(
  expected: readonly string[],
  submitted: readonly string[],
  strategy: MatchingStrategy,
): VerificationResultType {
  if (submitted.length === 0) {
    return 'missing_response';
  }
  if (submitted.length !== 1) {
    return 'invalid_format';
  }
  const expectedNum = Number(expected[0]);
  const submittedNum = Number(submitted[0]);
  if (isNaN(submittedNum)) {
    return 'invalid_format';
  }
  if (strategy === 'numeric_tolerance') {
    const tolerance = 0.001;
    if (Math.abs(expectedNum - submittedNum) <= tolerance) {
      return 'correct';
    }
    return 'incorrect';
  }
  if (expectedNum === submittedNum) {
    return 'correct';
  }
  return 'incorrect';
}

/**
 * Verify range (response must be within expected bounds).
 */
export function verifyRange(
  expected: readonly string[],
  submitted: readonly string[],
): VerificationResultType {
  if (submitted.length === 0) {
    return 'missing_response';
  }
  if (expected.length < 2) {
    return 'unsupported';
  }
  const min = Number(expected[0]);
  const max = Number(expected[1]);
  const submittedNum = Number(submitted[0]);
  if (isNaN(submittedNum) || isNaN(min) || isNaN(max)) {
    return 'invalid_format';
  }
  if (submittedNum >= min && submittedNum <= max) {
    return 'correct';
  }
  return 'incorrect';
}

/**
 * Verify mapping (key-value pair matching).
 */
export function verifyMapping(
  expected: readonly string[],
  submitted: readonly string[],
  strategy: MatchingStrategy,
): VerificationResultType {
  if (submitted.length === 0) {
    return 'missing_response';
  }
  const expectedMap = new Map<string, string>();
  for (const pair of expected) {
    const [key, value] = pair.split('=>').map((s) => s.trim());
    if (key !== undefined && value !== undefined) {
      expectedMap.set(_normalizeForStrategy(key, strategy), value);
    }
  }
  const submittedMap = new Map<string, string>();
  for (const pair of submitted) {
    const [key, value] = pair.split('=>').map((s) => s.trim());
    if (key !== undefined && value !== undefined) {
      submittedMap.set(_normalizeForStrategy(key, strategy), value);
    }
  }
  if (submittedMap.size !== expectedMap.size) {
    return 'incorrect';
  }
  for (const [key, value] of expectedMap) {
    if (submittedMap.get(key) !== value) {
      return 'incorrect';
    }
  }
  return 'correct';
}

/**
 * Verify structured response (structural comparison).
 */
export function verifyStructuredResponse(
  expected: readonly string[],
  submitted: readonly string[],
): VerificationResultType {
  if (submitted.length === 0) {
    return 'missing_response';
  }
  if (expected.length === 0) {
    return 'unsupported';
  }
  const expectedSorted = [...expected].sort();
  const submittedSorted = [...submitted].sort();
  if (expectedSorted.length !== submittedSorted.length) {
    return 'incomplete';
  }
  for (let i = 0; i < expectedSorted.length; i++) {
    if (expectedSorted[i] !== submittedSorted[i]) {
      return 'incorrect';
    }
  }
  return 'correct';
}

/**
 * Main verification entry point.
 * Dispatches to the appropriate verification function based on rule type.
 */
export function verifyAssessmentResponse(
  rule: VerificationRule,
  response: LearnerResponse,
): VerificationResult {
  let result: VerificationResultType;
  let matched: boolean;
  let reason: string;

  if (response.submittedAnswer.length === 0) {
    result = 'missing_response';
    matched = false;
    reason = 'No response submitted.';
  } else {
    switch (rule.verificationType) {
      case 'exact_match':
      case 'ordered_match':
        result = verifyExactMatch(
          rule.expectedAnswer,
          response.submittedAnswer,
          rule.matchingStrategy,
        );
        matched = result === 'correct';
        reason = `Exact/ordered match: ${result}.`;
        break;
      case 'unordered_match':
        result = verifyUnorderedMatch(
          rule.expectedAnswer,
          response.submittedAnswer,
          rule.matchingStrategy,
        );
        matched = result === 'correct';
        reason = `Unordered match: ${result}.`;
        break;
      case 'multiple_selection':
        result = verifyMultipleSelection(
          rule.expectedAnswer,
          response.submittedAnswer,
          rule.matchingStrategy,
        );
        matched = result === 'correct';
        reason = `Multiple selection: ${result}.`;
        break;
      case 'boolean':
        result = verifyBoolean(
          rule.expectedAnswer,
          response.submittedAnswer,
        );
        matched = result === 'correct';
        reason = `Boolean: ${result}.`;
        break;
      case 'numeric':
        result = verifyNumeric(
          rule.expectedAnswer,
          response.submittedAnswer,
          rule.matchingStrategy,
        );
        matched = result === 'correct';
        reason = `Numeric: ${result}.`;
        break;
      case 'range':
        result = verifyRange(
          rule.expectedAnswer,
          response.submittedAnswer,
        );
        matched = result === 'correct';
        reason = `Range: ${result}.`;
        break;
      case 'mapping':
        result = verifyMapping(
          rule.expectedAnswer,
          response.submittedAnswer,
          rule.matchingStrategy,
        );
        matched = result === 'correct';
        reason = `Mapping: ${result}.`;
        break;
      case 'structured_response':
        result = verifyStructuredResponse(
          rule.expectedAnswer,
          response.submittedAnswer,
        );
        matched = result === 'correct';
        reason = `Structured response: ${result}.`;
        break;
      case 'relationship':
        result = verifyUnorderedMatch(
          rule.expectedAnswer,
          response.submittedAnswer,
          rule.matchingStrategy,
        );
        matched = result === 'correct';
        reason = `Relationship: ${result}.`;
        break;
      default:
        result = 'unsupported';
        matched = false;
        reason = `Unsupported verification type: ${String(rule.verificationType)}.`;
        break;
    }
  }

  const traceId = _deterministicId('verification-result', [
    rule.id,
    response.responseId,
  ]);
  const trace = composeVerificationTrace({ traceId });

  return {
    ruleId: rule.id,
    result,
    matched,
    reason,
    trace,
  };
}

// ============================================================================
// COMPOSE — Registry validation helpers
// ============================================================================

/**
 * Compose a complete VerificationRuleValidationResult for a rule.
 */
export function _composeVerificationRuleValidation(
  rule: VerificationRule,
): import('./AssessmentAgentContract.ts').VerificationRuleValidationResult {
  const errors: import('./AssessmentAgentContract.ts').VerificationValidationError[] = [];

  if (!rule.id || rule.id.trim() === '') {
    errors.push({
      code: 'VERIFICATION_MISSING_RULE_ID',
      message: 'Rule is missing a valid id.',
      field: 'id',
    });
  }
  if (!rule.title || rule.title.trim() === '') {
    errors.push({
      code: 'VERIFICATION_MISSING_RULE_ID',
      message: 'Rule is missing a valid title.',
      field: 'title',
      entityId: rule.id,
    });
  }
  if (!CANONICAL_VERIFICATION_TYPES.includes(rule.verificationType)) {
    errors.push({
      code: 'VERIFICATION_INVALID_TYPE',
      message: `Invalid verification type: ${String(rule.verificationType)}`,
      field: 'verificationType',
      entityId: rule.id,
    });
  }
  if (!CANONICAL_RESPONSE_TYPES.includes(rule.responseType)) {
    errors.push({
      code: 'VERIFICATION_INVALID_RESPONSE_TYPE',
      message: `Invalid response type: ${String(rule.responseType)}`,
      field: 'responseType',
      entityId: rule.id,
    });
  }
  if (!CANONICAL_MATCHING_STRATEGIES.includes(rule.matchingStrategy)) {
    errors.push({
      code: 'VERIFICATION_INVALID_MATCHING_STRATEGY',
      message: `Invalid matching strategy: ${String(rule.matchingStrategy)}`,
      field: 'matchingStrategy',
      entityId: rule.id,
    });
  }
  if (!rule.expectedAnswer || rule.expectedAnswer.length === 0) {
    errors.push({
      code: 'VERIFICATION_MISSING_EXPECTED_ANSWER',
      message: 'Rule is missing expectedAnswer.',
      field: 'expectedAnswer',
      entityId: rule.id,
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    ruleId: rule.id,
    checkedAt: 'verification_rule_validation',
  };
}

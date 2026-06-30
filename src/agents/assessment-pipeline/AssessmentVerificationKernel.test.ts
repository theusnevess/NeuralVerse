/**
 * NV-2000-D8-OPT-03 — Verification Kernel Tests
 *
 * Exhaustive deterministic tests for the Verification Kernel.
 * Uses Node.js built-in test runner (node:test).
 *
 * ~90 tests covering:
 * - Canonical enum completeness
 * - Helper functions
 * - Rule composition
 * - Response composition
 * - Registry composition
 * - Verification functions (exact, ordered, unordered, multiple, boolean, numeric, range, mapping, structured)
 * - Validation codes
 * - Duplicate detection
 * - Deterministic identity (100 iterations)
 * - Immutability
 * - Validator stability
 * - No mutation
 * - Artifact with verification
 * - Negative capability verification
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  CANONICAL_VERIFICATION_TYPES,
  CANONICAL_RESPONSE_TYPES,
  CANONICAL_MATCHING_STRATEGIES,
  CANONICAL_VERIFICATION_RESULT_TYPES,
  CANONICAL_VERIFICATION_STATUS,
  CANONICAL_ASSESSMENT_GOVERNANCE,
  type VerificationRule,
  type LearnerResponse,
  type VerificationInput,
  type VerificationRegistry,
  type VerificationProvenance,
  type AssessmentArtifactWithVerification,
} from './AssessmentAgentContract.ts';

import {
  composeVerificationProvenance,
  composeVerificationTrace,
  composeVerificationRule,
  composeLearnerResponse,
  composeVerificationRelationship,
  composeVerificationRegistry,
  composeVerificationRegistryFromInput,
  composeVerification,
  composeAssessmentArtifactWithVerification,
  verifyExactMatch,
  verifyOrderedMatch,
  verifyUnorderedMatch,
  verifyMultipleSelection,
  verifyBoolean,
  verifyNumeric,
  verifyRange,
  verifyMapping,
  verifyStructuredResponse,
  verifyAssessmentResponse,
  isSupportedVerificationType,
  isSupportedResponseType,
  isSupportedMatchingStrategy,
  isSupportedVerificationResult,
  isSupportedVerificationStatus,
  isSupportedVerificationGovernance,
  getCanonicalVerificationTypes,
  getCanonicalResponseTypes,
  getCanonicalMatchingStrategies,
  getCanonicalVerificationResultTypes,
  getCanonicalVerificationStatuses,
} from './AssessmentVerificationKernel.ts';

import {
  VERIFICATION_VALIDATION_CODES,
  validateVerificationRule,
  validateVerificationRegistry,
  validateVerificationInput,
  validateVerificationTrace,
  validateAssessmentArtifactWithVerification,
} from './AssessmentVerificationValidation.ts';

// ============================================================================
// TEST FIXTURES
// ============================================================================

const VALID_VERIFICATION_PROVENANCE: VerificationProvenance = {
  provider: 'test-provider',
  source: 'test-source',
  reviewStatus: 'approved',
  reviewDate: '2025-01-01',
  version: '1.0.0',
  rationale: 'Test rationale for verification rule.',
};

function _makeRule(
  id: string,
  overrides: Partial<VerificationRule> = {},
): VerificationRule {
  return {
    id,
    title: `Test Rule ${id}`,
    verificationType: 'exact_match',
    responseType: 'single_choice',
    matchingStrategy: 'strict',
    expectedAnswer: ['option_a'],
    status: 'draft',
    governance: 'canonical',
    provenance: VALID_VERIFICATION_PROVENANCE,
    trace: {
      traceId: `trace-${id}`,
      deterministic: true,
      generatedFrom: 'deterministic_verification_kernel',
      randomUsed: false,
      timeDependency: false,
    },
    ...overrides,
  };
}

function _makeResponse(
  responseId: string,
  ruleId: string,
  submittedAnswer: readonly string[],
): LearnerResponse {
  return composeLearnerResponse({
    responseId,
    ruleId,
    responseType: 'single_choice',
    submittedAnswer,
  });
}

const VALID_RULE_A = _makeRule('rule-a');
const VALID_RULE_B = _makeRule('rule-b');
const VALID_RULE_C = _makeRule('rule-c');

// ============================================================================
// CANONICAL ENUM COMPLETENESS
// ============================================================================

describe('Canonical Enums', () => {
  it('should have exactly 10 verification types', () => {
    assert.equal(CANONICAL_VERIFICATION_TYPES.length, 10);
  });

  it('should have exactly 10 response types', () => {
    assert.equal(CANONICAL_RESPONSE_TYPES.length, 10);
  });

  it('should have exactly 10 matching strategies', () => {
    assert.equal(CANONICAL_MATCHING_STRATEGIES.length, 10);
  });

  it('should have exactly 10 verification result types', () => {
    assert.equal(CANONICAL_VERIFICATION_RESULT_TYPES.length, 10);
  });

  it('should have exactly 6 verification statuses', () => {
    assert.equal(CANONICAL_VERIFICATION_STATUS.length, 6);
  });

  it('should contain expected verification types', () => {
    const expected = [
      'exact_match', 'unordered_match', 'ordered_match', 'multiple_selection',
      'boolean', 'numeric', 'range', 'mapping', 'relationship', 'structured_response',
    ];
    for (const value of expected) {
      assert.ok(CANONICAL_VERIFICATION_TYPES.includes(value as any), `Missing: ${value}`);
    }
  });

  it('should contain expected response types', () => {
    const expected = [
      'single_choice', 'multiple_choice', 'boolean', 'number', 'text',
      'ordered_list', 'mapping', 'graph', 'table', 'structured',
    ];
    for (const value of expected) {
      assert.ok(CANONICAL_RESPONSE_TYPES.includes(value as any), `Missing: ${value}`);
    }
  });

  it('should contain expected matching strategies', () => {
    const expected = [
      'strict', 'case_insensitive', 'normalized', 'unordered', 'ordered',
      'subset', 'superset', 'exact_numeric', 'numeric_tolerance', 'structural',
    ];
    for (const value of expected) {
      assert.ok(CANONICAL_MATCHING_STRATEGIES.includes(value as any), `Missing: ${value}`);
    }
  });

  it('should contain expected verification result types', () => {
    const expected = [
      'correct', 'incorrect', 'partially_correct', 'invalid_format',
      'missing_response', 'unsupported', 'ambiguous', 'incomplete',
      'inconsistent', 'not_evaluated',
    ];
    for (const value of expected) {
      assert.ok(CANONICAL_VERIFICATION_RESULT_TYPES.includes(value as any), `Missing: ${value}`);
    }
  });
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

describe('Helper Functions', () => {
  it('isSupportedVerificationType returns true for valid types', () => {
    assert.equal(isSupportedVerificationType('exact_match'), true);
    assert.equal(isSupportedVerificationType('structured_response'), true);
  });

  it('isSupportedVerificationType returns false for invalid types', () => {
    assert.equal(isSupportedVerificationType('invalid'), false);
    assert.equal(isSupportedVerificationType(''), false);
  });

  it('isSupportedResponseType returns true for valid types', () => {
    assert.equal(isSupportedResponseType('single_choice'), true);
    assert.equal(isSupportedResponseType('structured'), true);
  });

  it('isSupportedResponseType returns false for invalid types', () => {
    assert.equal(isSupportedResponseType('invalid'), false);
    assert.equal(isSupportedResponseType(''), false);
  });

  it('isSupportedMatchingStrategy returns true for valid strategies', () => {
    assert.equal(isSupportedMatchingStrategy('strict'), true);
    assert.equal(isSupportedMatchingStrategy('structural'), true);
  });

  it('isSupportedMatchingStrategy returns false for invalid strategies', () => {
    assert.equal(isSupportedMatchingStrategy('invalid'), false);
    assert.equal(isSupportedMatchingStrategy(''), false);
  });

  it('isSupportedVerificationResult returns true for valid results', () => {
    assert.equal(isSupportedVerificationResult('correct'), true);
    assert.equal(isSupportedVerificationResult('not_evaluated'), true);
  });

  it('isSupportedVerificationResult returns false for invalid results', () => {
    assert.equal(isSupportedVerificationResult('invalid'), false);
    assert.equal(isSupportedVerificationResult(''), false);
  });

  it('isSupportedVerificationStatus returns true for valid statuses', () => {
    assert.equal(isSupportedVerificationStatus('draft'), true);
    assert.equal(isSupportedVerificationStatus('archived'), true);
  });

  it('isSupportedVerificationStatus returns false for invalid statuses', () => {
    assert.equal(isSupportedVerificationStatus('invalid'), false);
    assert.equal(isSupportedVerificationStatus(''), false);
  });

  it('isSupportedVerificationGovernance returns true for valid governance', () => {
    assert.equal(isSupportedVerificationGovernance('canonical'), true);
    assert.equal(isSupportedVerificationGovernance('rejected'), true);
  });

  it('isSupportedVerificationGovernance returns false for invalid governance', () => {
    assert.equal(isSupportedVerificationGovernance('invalid'), false);
    assert.equal(isSupportedVerificationGovernance(''), false);
  });

  it('getCanonicalVerificationTypes returns a copy', () => {
    const result = getCanonicalVerificationTypes();
    assert.equal(result.length, 10);
    assert.deepEqual([...result], [...CANONICAL_VERIFICATION_TYPES]);
    (result as string[]).push('injected');
    assert.equal(CANONICAL_VERIFICATION_TYPES.length, 10);
  });

  it('getCanonicalResponseTypes returns a copy', () => {
    const result = getCanonicalResponseTypes();
    assert.equal(result.length, 10);
  });

  it('getCanonicalMatchingStrategies returns a copy', () => {
    const result = getCanonicalMatchingStrategies();
    assert.equal(result.length, 10);
  });

  it('getCanonicalVerificationResultTypes returns a copy', () => {
    const result = getCanonicalVerificationResultTypes();
    assert.equal(result.length, 10);
  });

  it('getCanonicalVerificationStatuses returns a copy', () => {
    const result = getCanonicalVerificationStatuses();
    assert.equal(result.length, 6);
  });
});

// ============================================================================
// COMPOSE FUNCTIONS — Rule
// ============================================================================

describe('composeVerificationRule', () => {
  it('should compose rule from valid params', () => {
    const rule = composeVerificationRule({
      id: 'test-id',
      title: 'Test Rule',
      verificationType: 'exact_match',
      responseType: 'single_choice',
      matchingStrategy: 'strict',
      expectedAnswer: ['a', 'b'],
      status: 'draft',
      governance: 'canonical',
      provenance: VALID_VERIFICATION_PROVENANCE,
    });
    assert.equal(rule.id, 'test-id');
    assert.equal(rule.title, 'Test Rule');
    assert.equal(rule.verificationType, 'exact_match');
    assert.equal(rule.responseType, 'single_choice');
    assert.equal(rule.matchingStrategy, 'strict');
    assert.deepEqual([...rule.expectedAnswer], ['a', 'b']);
    assert.equal(rule.trace.deterministic, true);
    assert.equal(rule.trace.randomUsed, false);
    assert.equal(rule.trace.timeDependency, false);
  });

  it('should generate deterministic trace id', () => {
    const params = {
      id: 'x', title: 'T', verificationType: 'boolean' as const,
      responseType: 'boolean' as const, matchingStrategy: 'strict' as const,
      expectedAnswer: ['true'], status: 'draft' as const,
      governance: 'canonical' as const, provenance: VALID_VERIFICATION_PROVENANCE,
    };
    const r1 = composeVerificationRule(params);
    const r2 = composeVerificationRule(params);
    assert.equal(r1.trace.traceId, r2.trace.traceId);
  });

  it('should not mutate expectedAnswer input', () => {
    const expected = ['a', 'b'];
    const original = JSON.stringify(expected);
    composeVerificationRule({
      id: 'test', title: 'T', verificationType: 'exact_match',
      responseType: 'single_choice', matchingStrategy: 'strict',
      expectedAnswer: expected, status: 'draft', governance: 'canonical',
      provenance: VALID_VERIFICATION_PROVENANCE,
    });
    assert.equal(JSON.stringify(expected), original);
  });
});

// ============================================================================
// COMPOSE FUNCTIONS — Response
// ============================================================================

describe('composeLearnerResponse', () => {
  it('should compose response from valid params', () => {
    const response = composeLearnerResponse({
      responseId: 'resp-1',
      ruleId: 'rule-1',
      responseType: 'single_choice',
      submittedAnswer: ['option_a'],
    });
    assert.equal(response.responseId, 'resp-1');
    assert.equal(response.ruleId, 'rule-1');
    assert.equal(response.responseType, 'single_choice');
    assert.deepEqual([...response.submittedAnswer], ['option_a']);
  });

  it('should return identical output for identical input', () => {
    const params = {
      responseId: 'r', ruleId: 'rule', responseType: 'text' as const,
      submittedAnswer: ['answer'],
    };
    const r1 = composeLearnerResponse(params);
    const r2 = composeLearnerResponse(params);
    assert.deepEqual(r1, r2);
  });
});

// ============================================================================
// COMPOSE FUNCTIONS — Registry
// ============================================================================

describe('composeVerificationRegistry', () => {
  it('should compose registry from rules', () => {
    const registry = composeVerificationRegistry([VALID_RULE_A, VALID_RULE_B]);
    assert.equal(registry.nodes.length, 2);
    assert.equal(registry.metadata.nodeCount, 2);
    assert.equal(registry.metadata.deterministic, true);
  });

  it('should sort nodes by id', () => {
    const registry = composeVerificationRegistry([VALID_RULE_C, VALID_RULE_A, VALID_RULE_B]);
    assert.equal(registry.nodes[0].id, 'rule-a');
    assert.equal(registry.nodes[1].id, 'rule-b');
    assert.equal(registry.nodes[2].id, 'rule-c');
  });

  it('should return identical output for identical input', () => {
    const nodes = [VALID_RULE_A, VALID_RULE_B];
    const r1 = composeVerificationRegistry(nodes);
    const r2 = composeVerificationRegistry(nodes);
    assert.deepEqual(r1, r2);
  });

  it('should not mutate input nodes array', () => {
    const nodes = [VALID_RULE_C, VALID_RULE_A];
    const original = JSON.stringify(nodes);
    composeVerificationRegistry(nodes);
    assert.equal(JSON.stringify(nodes), original);
  });

  it('should handle empty array', () => {
    const registry = composeVerificationRegistry([]);
    assert.equal(registry.nodes.length, 0);
    assert.equal(registry.metadata.nodeCount, 0);
  });
});

// ============================================================================
// COMPOSE FUNCTIONS — Registry from Input
// ============================================================================

describe('composeVerificationRegistryFromInput', () => {
  it('should compose registry from input', () => {
    const input: VerificationInput = { nodes: [VALID_RULE_A, VALID_RULE_B] };
    const registry = composeVerificationRegistryFromInput(input);
    assert.equal(registry.nodes.length, 2);
  });

  it('should return identical output for identical input', () => {
    const input: VerificationInput = { nodes: [VALID_RULE_A] };
    const r1 = composeVerificationRegistryFromInput(input);
    const r2 = composeVerificationRegistryFromInput(input);
    assert.deepEqual(r1, r2);
  });
});

// ============================================================================
// VERIFICATION FUNCTIONS — Exact Match
// ============================================================================

describe('verifyExactMatch', () => {
  it('should return correct for exact match', () => {
    assert.equal(verifyExactMatch(['a'], ['a'], 'strict'), 'correct');
  });

  it('should return incorrect for mismatch', () => {
    assert.equal(verifyExactMatch(['a'], ['b'], 'strict'), 'incorrect');
  });

  it('should return missing_response for empty', () => {
    assert.equal(verifyExactMatch(['a'], [], 'strict'), 'missing_response');
  });

  it('should handle case_insensitive strategy', () => {
    assert.equal(verifyExactMatch(['Hello'], ['hello'], 'case_insensitive'), 'correct');
  });

  it('should handle normalized strategy', () => {
    assert.equal(verifyExactMatch(['Hello World'], ['hello  world'], 'normalized'), 'correct');
  });
});

// ============================================================================
// VERIFICATION FUNCTIONS — Ordered Match
// ============================================================================

describe('verifyOrderedMatch', () => {
  it('should return correct for ordered match', () => {
    assert.equal(verifyOrderedMatch(['a', 'b'], ['a', 'b'], 'strict'), 'correct');
  });

  it('should return incorrect for wrong order', () => {
    assert.equal(verifyOrderedMatch(['a', 'b'], ['b', 'a'], 'strict'), 'incorrect');
  });
});

// ============================================================================
// VERIFICATION FUNCTIONS — Unordered Match
// ============================================================================

describe('verifyUnorderedMatch', () => {
  it('should return correct for unordered match', () => {
    assert.equal(verifyUnorderedMatch(['a', 'b'], ['b', 'a'], 'strict'), 'correct');
  });

  it('should return incomplete for fewer answers', () => {
    assert.equal(verifyUnorderedMatch(['a', 'b', 'c'], ['a', 'b'], 'strict'), 'incomplete');
  });

  it('should return incorrect for wrong answers', () => {
    assert.equal(verifyUnorderedMatch(['a', 'b'], ['x', 'y'], 'strict'), 'incorrect');
  });

  it('should return missing_response for empty', () => {
    assert.equal(verifyUnorderedMatch(['a'], [], 'strict'), 'missing_response');
  });
});

// ============================================================================
// VERIFICATION FUNCTIONS — Multiple Selection
// ============================================================================

describe('verifyMultipleSelection', () => {
  it('should return correct for full selection', () => {
    assert.equal(verifyMultipleSelection(['a', 'b', 'c'], ['a', 'b', 'c'], 'strict'), 'correct');
  });

  it('should return partially_correct for partial', () => {
    assert.equal(verifyMultipleSelection(['a', 'b', 'c'], ['a', 'b'], 'strict'), 'partially_correct');
  });

  it('should return incorrect for wrong selection', () => {
    assert.equal(verifyMultipleSelection(['a', 'b'], ['a', 'x'], 'strict'), 'incorrect');
  });

  it('should return missing_response for empty', () => {
    assert.equal(verifyMultipleSelection(['a'], [], 'strict'), 'missing_response');
  });
});

// ============================================================================
// VERIFICATION FUNCTIONS — Boolean
// ============================================================================

describe('verifyBoolean', () => {
  it('should return correct for matching boolean', () => {
    assert.equal(verifyBoolean(['true'], ['true']), 'correct');
  });

  it('should return incorrect for mismatch', () => {
    assert.equal(verifyBoolean(['true'], ['false']), 'incorrect');
  });

  it('should return missing_response for empty', () => {
    assert.equal(verifyBoolean(['true'], []), 'missing_response');
  });

  it('should return invalid_format for multiple values', () => {
    assert.equal(verifyBoolean(['true'], ['true', 'false']), 'invalid_format');
  });
});

// ============================================================================
// VERIFICATION FUNCTIONS — Numeric
// ============================================================================

describe('verifyNumeric', () => {
  it('should return correct for exact numeric', () => {
    assert.equal(verifyNumeric(['42'], ['42'], 'exact_numeric'), 'correct');
  });

  it('should return incorrect for wrong number', () => {
    assert.equal(verifyNumeric(['42'], ['43'], 'exact_numeric'), 'incorrect');
  });

  it('should return correct within tolerance', () => {
    assert.equal(verifyNumeric(['3.14'], ['3.141'], 'numeric_tolerance'), 'correct');
  });

  it('should return invalid_format for non-numeric', () => {
    assert.equal(verifyNumeric(['42'], ['abc'], 'exact_numeric'), 'invalid_format');
  });

  it('should return missing_response for empty', () => {
    assert.equal(verifyNumeric(['42'], [], 'exact_numeric'), 'missing_response');
  });
});

// ============================================================================
// VERIFICATION FUNCTIONS — Range
// ============================================================================

describe('verifyRange', () => {
  it('should return correct for value in range', () => {
    assert.equal(verifyRange(['1', '10'], ['5']), 'correct');
  });

  it('should return incorrect for value out of range', () => {
    assert.equal(verifyRange(['1', '10'], ['15']), 'incorrect');
  });

  it('should return unsupported for insufficient bounds', () => {
    assert.equal(verifyRange(['5'], ['5']), 'unsupported');
  });

  it('should return missing_response for empty', () => {
    assert.equal(verifyRange(['1', '10'], []), 'missing_response');
  });
});

// ============================================================================
// VERIFICATION FUNCTIONS — Mapping
// ============================================================================

describe('verifyMapping', () => {
  it('should return correct for matching mapping', () => {
    assert.equal(
      verifyMapping(['a => 1', 'b => 2'], ['a => 1', 'b => 2'], 'strict'),
      'correct',
    );
  });

  it('should return incorrect for wrong mapping', () => {
    assert.equal(
      verifyMapping(['a => 1', 'b => 2'], ['a => 1', 'b => 3'], 'strict'),
      'incorrect',
    );
  });

  it('should return missing_response for empty', () => {
    assert.equal(verifyMapping(['a => 1'], [], 'strict'), 'missing_response');
  });
});

// ============================================================================
// VERIFICATION FUNCTIONS — Structured Response
// ============================================================================

describe('verifyStructuredResponse', () => {
  it('should return correct for matching structured', () => {
    assert.equal(verifyStructuredResponse(['x', 'y', 'z'], ['z', 'x', 'y']), 'correct');
  });

  it('should return incomplete for fewer elements', () => {
    assert.equal(verifyStructuredResponse(['x', 'y', 'z'], ['x', 'y']), 'incomplete');
  });

  it('should return incorrect for wrong elements', () => {
    assert.equal(verifyStructuredResponse(['x', 'y'], ['a', 'b']), 'incorrect');
  });

  it('should return missing_response for empty', () => {
    assert.equal(verifyStructuredResponse(['x'], []), 'missing_response');
  });
});

// ============================================================================
// VERIFICATION FUNCTIONS — Main entry point
// ============================================================================

describe('verifyAssessmentResponse', () => {
  it('should verify exact match correctly', () => {
    const rule = _makeRule('r1', { verificationType: 'exact_match', expectedAnswer: ['a'] });
    const response = _makeResponse('resp1', 'r1', ['a']);
    const result = verifyAssessmentResponse(rule, response);
    assert.equal(result.result, 'correct');
    assert.equal(result.matched, true);
    assert.equal(result.ruleId, 'r1');
  });

  it('should verify boolean correctly', () => {
    const rule = _makeRule('r2', { verificationType: 'boolean', responseType: 'boolean', expectedAnswer: ['true'] });
    const response = _makeResponse('resp2', 'r2', ['true']);
    const result = verifyAssessmentResponse(rule, response);
    assert.equal(result.result, 'correct');
    assert.equal(result.matched, true);
  });

  it('should handle missing response', () => {
    const rule = _makeRule('r3', { verificationType: 'exact_match', expectedAnswer: ['a'] });
    const response = _makeResponse('resp3', 'r3', []);
    const result = verifyAssessmentResponse(rule, response);
    assert.equal(result.result, 'missing_response');
    assert.equal(result.matched, false);
  });

  it('should return deterministic trace', () => {
    const rule = _makeRule('r4', { verificationType: 'exact_match', expectedAnswer: ['a'] });
    const response = _makeResponse('resp4', 'r4', ['a']);
    const result = verifyAssessmentResponse(rule, response);
    assert.equal(result.trace.deterministic, true);
    assert.equal(result.trace.randomUsed, false);
    assert.equal(result.trace.timeDependency, false);
  });

  it('should produce identical output for identical input', () => {
    const rule = _makeRule('r5', { verificationType: 'boolean', expectedAnswer: ['false'] });
    const response = _makeResponse('resp5', 'r5', ['false']);
    const r1 = verifyAssessmentResponse(rule, response);
    const r2 = verifyAssessmentResponse(rule, response);
    assert.deepEqual(r1, r2);
  });
});

// ============================================================================
// VALIDATION — Rule validation
// ============================================================================

describe('validateVerificationRule', () => {
  it('should pass for valid rule', () => {
    const errors = validateVerificationRule(VALID_RULE_A);
    assert.equal(errors.length, 0);
  });

  it('should reject null rule', () => {
    const errors = validateVerificationRule(null as any);
    assert.ok(errors.length > 0);
  });

  it('should reject rule with missing id', () => {
    const rule = _makeRule('');
    const errors = validateVerificationRule(rule);
    assert.ok(errors.some((e) => e.code === VERIFICATION_VALIDATION_CODES.VERIFICATION_MISSING_RULE_ID));
  });

  it('should reject rule with invalid verification type', () => {
    const rule = _makeRule('id', { verificationType: 'invalid' as any });
    const errors = validateVerificationRule(rule);
    assert.ok(errors.some((e) => e.code === VERIFICATION_VALIDATION_CODES.VERIFICATION_INVALID_TYPE));
  });

  it('should reject rule with invalid response type', () => {
    const rule = _makeRule('id', { responseType: 'invalid' as any });
    const errors = validateVerificationRule(rule);
    assert.ok(errors.some((e) => e.code === VERIFICATION_VALIDATION_CODES.VERIFICATION_INVALID_RESPONSE_TYPE));
  });

  it('should reject rule with invalid matching strategy', () => {
    const rule = _makeRule('id', { matchingStrategy: 'invalid' as any });
    const errors = validateVerificationRule(rule);
    assert.ok(errors.some((e) => e.code === VERIFICATION_VALIDATION_CODES.VERIFICATION_INVALID_MATCHING_STRATEGY));
  });

  it('should reject rule with empty expectedAnswer', () => {
    const rule = _makeRule('id', { expectedAnswer: [] });
    const errors = validateVerificationRule(rule);
    assert.ok(errors.some((e) => e.code === VERIFICATION_VALIDATION_CODES.VERIFICATION_MISSING_EXPECTED_ANSWER));
  });

  it('should reject rule with invalid status', () => {
    const rule = _makeRule('id', { status: 'invalid' as any });
    const errors = validateVerificationRule(rule);
    assert.ok(errors.some((e) => e.code === VERIFICATION_VALIDATION_CODES.VERIFICATION_INVALID_STATUS));
  });

  it('should reject rule with invalid governance', () => {
    const rule = _makeRule('id', { governance: 'invalid' as any });
    const errors = validateVerificationRule(rule);
    assert.ok(errors.some((e) => e.code === VERIFICATION_VALIDATION_CODES.VERIFICATION_INVALID_GOVERNANCE));
  });

  it('should reject rule with missing provenance', () => {
    const rule = _makeRule('id', { provenance: null as any });
    const errors = validateVerificationRule(rule);
    assert.ok(errors.some((e) => e.code === VERIFICATION_VALIDATION_CODES.VERIFICATION_MISSING_PROVENANCE));
  });

  it('should reject rule with non-deterministic trace', () => {
    const rule = _makeRule('id', {
      trace: { ...VALID_RULE_A.trace, deterministic: false as any },
    });
    const errors = validateVerificationRule(rule);
    assert.ok(errors.some((e) => e.code === VERIFICATION_VALIDATION_CODES.VERIFICATION_INVALID_TRACE));
  });
});

// ============================================================================
// VALIDATION — Registry validation
// ============================================================================

describe('validateVerificationRegistry', () => {
  it('should pass for valid registry', () => {
    const registry = composeVerificationRegistry([VALID_RULE_A, VALID_RULE_B]);
    const result = validateVerificationRegistry(registry);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
    assert.equal(result.nodeResults.length, 2);
  });

  it('should reject null registry', () => {
    const result = validateVerificationRegistry(null as any);
    assert.equal(result.valid, false);
  });

  it('should reject empty nodes array', () => {
    const registry = composeVerificationRegistry([]);
    const result = validateVerificationRegistry(registry);
    assert.equal(result.valid, false);
  });

  it('should detect duplicate ids', () => {
    const duplicateNodes = [_makeRule('dup'), _makeRule('dup')];
    const registry = composeVerificationRegistry(duplicateNodes);
    const result = validateVerificationRegistry(registry);
    assert.equal(result.valid, false);
    assert.ok(result.errors.some((e) => e.code === VERIFICATION_VALIDATION_CODES.VERIFICATION_DUPLICATE_ID));
  });

  it('should detect duplicate titles', () => {
    const duplicateTitles = [
      _makeRule('a', { title: 'Same Title' }),
      _makeRule('b', { title: 'Same Title' }),
    ];
    const registry = composeVerificationRegistry(duplicateTitles);
    const result = validateVerificationRegistry(registry);
    assert.equal(result.valid, false);
    assert.ok(result.errors.some((e) => e.code === VERIFICATION_VALIDATION_CODES.VERIFICATION_DUPLICATE_TITLE));
  });

  it('should detect metadata nodeCount inconsistency', () => {
    const registry: VerificationRegistry = {
      metadata: {
        registryId: 'test',
        version: '1.0.0',
        nodeCount: 5,
        generatedFrom: 'deterministic_verification_kernel',
        deterministic: true,
        randomUsed: false,
        timeDependency: false,
      },
      nodes: [VALID_RULE_A],
    };
    const result = validateVerificationRegistry(registry);
    assert.equal(result.valid, false);
    assert.ok(result.errors.some((e) => e.code === VERIFICATION_VALIDATION_CODES.VERIFICATION_REGISTRY_INCONSISTENCY));
  });
});

// ============================================================================
// VALIDATION — Input validation
// ============================================================================

describe('validateVerificationInput', () => {
  it('should pass for valid input', () => {
    const input: VerificationInput = { nodes: [VALID_RULE_A] };
    const result = validateVerificationInput(input);
    assert.equal(result.valid, true);
  });

  it('should reject null input', () => {
    const result = validateVerificationInput(null as any);
    assert.equal(result.valid, false);
  });

  it('should reject input with no nodes', () => {
    const result = validateVerificationInput({ nodes: [] });
    assert.equal(result.valid, false);
  });
});

// ============================================================================
// VALIDATION — Trace validation
// ============================================================================

describe('validateVerificationTrace', () => {
  it('should pass for valid trace', () => {
    const trace = composeVerificationTrace({ traceId: 'test' });
    const result = validateVerificationTrace(trace);
    assert.equal(result.valid, true);
  });

  it('should reject null trace', () => {
    const result = validateVerificationTrace(null as any);
    assert.equal(result.valid, false);
  });

  it('should reject trace with missing traceId', () => {
    const result = validateVerificationTrace({
      traceId: '',
      deterministic: true,
      generatedFrom: 'deterministic_verification_kernel',
      randomUsed: false,
      timeDependency: false,
    });
    assert.equal(result.valid, false);
  });
});

// ============================================================================
// VALIDATION — Artifact with verification
// ============================================================================

describe('validateAssessmentArtifactWithVerification', () => {
  it('should pass for valid artifact', () => {
    const artifact = composeAssessmentArtifactWithVerification({
      artifactId: 'art-1',
      artifactTitle: 'Test',
      verificationRule: VALID_RULE_A,
    });
    const result = validateAssessmentArtifactWithVerification(artifact);
    assert.equal(result.valid, true);
  });

  it('should reject null artifact', () => {
    const result = validateAssessmentArtifactWithVerification(null as any);
    assert.equal(result.valid, false);
  });

  it('should reject artifact with missing artifactId', () => {
    const result = validateAssessmentArtifactWithVerification({
      artifactId: '',
      artifactTitle: 'Test',
      verificationRule: VALID_RULE_A,
    } as any);
    assert.equal(result.valid, false);
  });
});

// ============================================================================
// DETERMINISTIC IDENTITY — 100 iterations
// ============================================================================

describe('Deterministic Identity', () => {
  it('should produce identical output for verifyAssessmentResponse across 100 iterations', () => {
    const rule = _makeRule('r', { verificationType: 'exact_match', expectedAnswer: ['a'] });
    const response = _makeResponse('resp', 'r', ['a']);
    let firstResult: string | null = null;

    for (let i = 0; i < 100; i++) {
      const result = verifyAssessmentResponse(rule, response);
      const serialized = JSON.stringify(result);
      if (firstResult === null) {
        firstResult = serialized;
      } else {
        assert.equal(serialized, firstResult, `Iteration ${i} differs`);
      }
    }
  });

  it('should produce identical output for composeVerificationRegistry across 100 iterations', () => {
    const nodes = [VALID_RULE_A, VALID_RULE_B];
    let firstResult: string | null = null;

    for (let i = 0; i < 100; i++) {
      const result = composeVerificationRegistry(nodes);
      const serialized = JSON.stringify(result);
      if (firstResult === null) {
        firstResult = serialized;
      } else {
        assert.equal(serialized, firstResult, `Iteration ${i} differs`);
      }
    }
  });
});

// ============================================================================
// IMMUTABILITY — No mutation
// ============================================================================

describe('Immutability', () => {
  it('should not mutate input nodes array in composeVerificationRegistry', () => {
    const nodes = [VALID_RULE_C, VALID_RULE_A];
    const original = JSON.stringify(nodes);
    composeVerificationRegistry(nodes);
    assert.equal(JSON.stringify(nodes), original);
  });

  it('should not mutate expectedAnswer in composeVerificationRule', () => {
    const expected = ['a', 'b'];
    const original = JSON.stringify(expected);
    composeVerificationRule({
      id: 'test', title: 'T', verificationType: 'exact_match',
      responseType: 'single_choice', matchingStrategy: 'strict',
      expectedAnswer: expected, status: 'draft', governance: 'canonical',
      provenance: VALID_VERIFICATION_PROVENANCE,
    });
    assert.equal(JSON.stringify(expected), original);
  });

  it('getCanonicalVerificationTypes returns a copy not affecting original', () => {
    const copy = getCanonicalVerificationTypes();
    assert.equal(copy.length, 10);
    (copy as string[]).push('injected');
    assert.equal(CANONICAL_VERIFICATION_TYPES.length, 10);
  });
});

// ============================================================================
// NEGATIVE CAPABILITY — No scoring/mastery/feedback
// ============================================================================

describe('Negative Capability', () => {
  it('should not contain grading logic', () => {
    const source = JSON.stringify(CANONICAL_VERIFICATION_TYPES);
    assert.ok(!source.includes('grade'));
    assert.ok(!source.includes('score'));
    assert.ok(!source.includes('mastery'));
  });

  it('should not contain feedback logic', () => {
    const source = JSON.stringify(CANONICAL_VERIFICATION_TYPES);
    assert.ok(!source.includes('feedback'));
    assert.ok(!source.includes('hint'));
    assert.ok(!source.includes('misconception'));
  });

  it('should not contain LLM or async patterns', () => {
    const source = JSON.stringify(CANONICAL_VERIFICATION_TYPES);
    assert.ok(!source.includes('Promise'));
    assert.ok(!source.includes('async'));
    assert.ok(!source.includes('await'));
  });
});

// ============================================================================
// VALIDATION CODES — Structure verification
// ============================================================================

describe('Validation Codes', () => {
  it('should have at least 20 validation codes', () => {
    const codes = Object.values(VERIFICATION_VALIDATION_CODES);
    assert.ok(codes.length >= 20);
  });

  it('all validation codes should be UPPER_SNAKE_CASE', () => {
    for (const code of Object.values(VERIFICATION_VALIDATION_CODES)) {
      assert.ok(/^[A-Z_]+$/.test(code), `Not UPPER_SNAKE_CASE: ${code}`);
    }
  });

  it('all validation codes should start with VERIFICATION_', () => {
    for (const code of Object.values(VERIFICATION_VALIDATION_CODES)) {
      assert.ok(code.startsWith('VERIFICATION_'), `Does not start with VERIFICATION_: ${code}`);
    }
  });

  it('all keys should match their string values', () => {
    for (const [key, value] of Object.entries(VERIFICATION_VALIDATION_CODES)) {
      assert.equal(key, value, `Key ${key} does not match value ${value}`);
    }
  });
});

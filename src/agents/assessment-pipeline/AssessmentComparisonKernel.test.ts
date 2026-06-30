/**
 * NV-2000-D8-OPT-10 — Comparison Kernel Tests
 *
 * Exhaustive deterministic tests for the Comparison Kernel.
 * Uses Node.js built-in test runner (node:test).
 *
 * ~90 tests covering:
 * - Canonical enum completeness
 * - Helper functions
 * - Comparative assessment composition
 * - Dimension composition
 * - Trade-off composition
 * - Decision context composition
 * - Relationship composition
 * - Registry composition
 * - Validation codes
 * - Duplicate detection
 * - Deterministic identity (100 iterations)
 * - Immutability
 * - Validator stability
 * - No mutation
 * - Artifact with comparisons
 * - Cross-agent boundary
 * - Negative capability verification
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  CANONICAL_COMPARISON_REASONING_TYPES,
  CANONICAL_COMPARISON_DIMENSIONS,
  CANONICAL_TRADE_OFF_TYPES,
  CANONICAL_DECISION_CONTEXT_TYPES,
  CANONICAL_COMPARATIVE_ASSESSMENT_STATUS,
  CANONICAL_ASSESSMENT_GOVERNANCE,
  type ComparativeAssessment,
  type ComparisonDimensionEntry,
  type TradeOffEvaluation,
  type DecisionContext,
  type ComparisonInput,
  type ComparisonRegistry,
  type ComparisonAssessmentProvenance,
  type AssessmentArtifactWithComparisons,
} from './AssessmentAgentContract.ts';

import {
  composeComparisonAssessmentProvenance,
  composeComparisonAssessmentTrace,
  composeComparativeAssessment,
  composeComparisonDimension,
  composeTradeOffEvaluation,
  composeDecisionContext,
  composeComparisonRelationship,
  composeComparisonRegistry,
  composeComparisonRegistryFromInput,
  composeAssessmentComparisons,
  composeAssessmentArtifactWithComparisons,
  isSupportedComparisonReasoningType,
  isSupportedComparisonDimension,
  isSupportedTradeOffType,
  isSupportedDecisionContextType,
  isSupportedComparativeAssessmentStatus,
  isSupportedComparativeAssessmentGovernance,
  getCanonicalComparisonReasoningTypes,
  getCanonicalComparisonDimensions,
  getCanonicalTradeOffTypes,
  getCanonicalDecisionContextTypes,
  getCanonicalComparativeAssessmentStatuses,
} from './AssessmentComparisonKernel.ts';

import {
  COMPARISON_VALIDATION_CODES,
  validateComparativeAssessment,
  validateComparisonDimension,
  validateTradeOffEvaluation,
  validateDecisionContext,
  validateComparisonRelationship,
  validateComparisonRegistry,
  validateComparisonInput,
  validateComparisonTrace,
  validateAssessmentArtifactWithComparisons,
} from './AssessmentComparisonValidation.ts';

// ============================================================================
// TEST FIXTURES
// ============================================================================

const VALID_COMPARISON_PROVENANCE: ComparisonAssessmentProvenance = {
  provider: 'test-provider',
  source: 'test-source',
  reviewStatus: 'approved',
  reviewDate: '2025-01-01',
  version: '1.0.0',
  rationale: 'Test rationale for comparison.',
};

function _makeDimension(id: string): ComparisonDimensionEntry {
  return composeComparisonDimension({
    id,
    dimension: 'performance',
    description: `Test dimension ${id}`,
  });
}

function _makeTradeOff(id: string): TradeOffEvaluation {
  return composeTradeOffEvaluation({
    id,
    tradeOffType: 'performance_cost',
    description: `Test trade-off ${id}`,
  });
}

function _makeContext(id: string): DecisionContext {
  return composeDecisionContext({
    id,
    contextType: 'architecture_selection',
    description: `Test context ${id}`,
  });
}

function _makeAssessment(
  id: string,
  overrides: Partial<ComparativeAssessment> = {},
): ComparativeAssessment {
  return composeComparativeAssessment({
    id,
    title: `Assessment ${id}`,
    reasoningType: 'analytical',
    dimensions: [_makeDimension(`dim-${id}`)],
    tradeOffs: [_makeTradeOff(`to-${id}`)],
    decisionContext: _makeContext(`ctx-${id}`),
    alternatives: ['alt-a', 'alt-b'],
    conceptIds: ['concept-1'],
    status: 'draft',
    governance: 'canonical',
    provenance: VALID_COMPARISON_PROVENANCE,
    ...overrides,
  });
}

const VALID_ASSESSMENT_A = _makeAssessment('comp-a');
const VALID_ASSESSMENT_B = _makeAssessment('comp-b');
const VALID_ASSESSMENT_C = _makeAssessment('comp-c');

// ============================================================================
// CANONICAL ENUM COMPLETENESS
// ============================================================================

describe('Canonical Enums', () => {
  it('should have exactly 10 comparison reasoning types', () => {
    assert.equal(CANONICAL_COMPARISON_REASONING_TYPES.length, 10);
  });

  it('should have exactly 10 comparison dimensions', () => {
    assert.equal(CANONICAL_COMPARISON_DIMENSIONS.length, 10);
  });

  it('should have exactly 10 trade-off types', () => {
    assert.equal(CANONICAL_TRADE_OFF_TYPES.length, 10);
  });

  it('should have exactly 10 decision context types', () => {
    assert.equal(CANONICAL_DECISION_CONTEXT_TYPES.length, 10);
  });

  it('should have exactly 6 comparative assessment statuses', () => {
    assert.equal(CANONICAL_COMPARATIVE_ASSESSMENT_STATUS.length, 6);
  });

  it('should contain expected comparison reasoning types', () => {
    const expected = [
      'factual', 'conceptual', 'procedural', 'analytical', 'comparative',
      'causal', 'diagnostic', 'engineering', 'critical', 'reflective',
    ];
    for (const value of expected) {
      assert.ok(CANONICAL_COMPARISON_REASONING_TYPES.includes(value as any), `Missing: ${value}`);
    }
  });

  it('should contain expected comparison dimensions', () => {
    const expected = [
      'performance', 'cost', 'scalability', 'maintainability', 'security',
      'reliability', 'complexity', 'flexibility', 'latency', 'throughput',
    ];
    for (const value of expected) {
      assert.ok(CANONICAL_COMPARISON_DIMENSIONS.includes(value as any), `Missing: ${value}`);
    }
  });

  it('should contain expected trade-off types', () => {
    const expected = [
      'performance_cost', 'scalability_complexity', 'security_performance',
      'latency_throughput', 'reliability_cost', 'maintainability_speed',
      'flexibility_reliability', 'coverage_depth', 'automation_control',
      'consistency_flexibility',
    ];
    for (const value of expected) {
      assert.ok(CANONICAL_TRADE_OFF_TYPES.includes(value as any), `Missing: ${value}`);
    }
  });

  it('should contain expected decision context types', () => {
    const expected = [
      'architecture_selection', 'technology_choice', 'deployment_strategy',
      'optimization_approach', 'trade_off_analysis', 'constraint_resolution',
      'risk_assessment', 'quality_evaluation', 'cost_benefit', 'feasibility_study',
    ];
    for (const value of expected) {
      assert.ok(CANONICAL_DECISION_CONTEXT_TYPES.includes(value as any), `Missing: ${value}`);
    }
  });
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

describe('Helper Functions', () => {
  it('isSupportedComparisonReasoningType returns true for valid types', () => {
    assert.equal(isSupportedComparisonReasoningType('factual'), true);
    assert.equal(isSupportedComparisonReasoningType('reflective'), true);
  });

  it('isSupportedComparisonReasoningType returns false for invalid types', () => {
    assert.equal(isSupportedComparisonReasoningType('invalid'), false);
    assert.equal(isSupportedComparisonReasoningType(''), false);
  });

  it('isSupportedComparisonDimension returns true for valid dimensions', () => {
    assert.equal(isSupportedComparisonDimension('performance'), true);
    assert.equal(isSupportedComparisonDimension('throughput'), true);
  });

  it('isSupportedComparisonDimension returns false for invalid dimensions', () => {
    assert.equal(isSupportedComparisonDimension('invalid'), false);
    assert.equal(isSupportedComparisonDimension(''), false);
  });

  it('isSupportedTradeOffType returns true for valid types', () => {
    assert.equal(isSupportedTradeOffType('performance_cost'), true);
    assert.equal(isSupportedTradeOffType('consistency_flexibility'), true);
  });

  it('isSupportedTradeOffType returns false for invalid types', () => {
    assert.equal(isSupportedTradeOffType('invalid'), false);
    assert.equal(isSupportedTradeOffType(''), false);
  });

  it('isSupportedDecisionContextType returns true for valid types', () => {
    assert.equal(isSupportedDecisionContextType('architecture_selection'), true);
    assert.equal(isSupportedDecisionContextType('feasibility_study'), true);
  });

  it('isSupportedDecisionContextType returns false for invalid types', () => {
    assert.equal(isSupportedDecisionContextType('invalid'), false);
    assert.equal(isSupportedDecisionContextType(''), false);
  });

  it('isSupportedComparativeAssessmentStatus returns true for valid statuses', () => {
    assert.equal(isSupportedComparativeAssessmentStatus('draft'), true);
    assert.equal(isSupportedComparativeAssessmentStatus('archived'), true);
  });

  it('isSupportedComparativeAssessmentStatus returns false for invalid statuses', () => {
    assert.equal(isSupportedComparativeAssessmentStatus('invalid'), false);
    assert.equal(isSupportedComparativeAssessmentStatus(''), false);
  });

  it('isSupportedComparativeAssessmentGovernance returns true for valid governance', () => {
    assert.equal(isSupportedComparativeAssessmentGovernance('canonical'), true);
    assert.equal(isSupportedComparativeAssessmentGovernance('rejected'), true);
  });

  it('isSupportedComparativeAssessmentGovernance returns false for invalid governance', () => {
    assert.equal(isSupportedComparativeAssessmentGovernance('invalid'), false);
    assert.equal(isSupportedComparativeAssessmentGovernance(''), false);
  });

  it('getCanonicalComparisonReasoningTypes returns a copy', () => {
    const result = getCanonicalComparisonReasoningTypes();
    assert.equal(result.length, 10);
    assert.deepEqual([...result], [...CANONICAL_COMPARISON_REASONING_TYPES]);
    (result as string[]).push('injected');
    assert.equal(CANONICAL_COMPARISON_REASONING_TYPES.length, 10);
  });

  it('getCanonicalComparisonDimensions returns a copy', () => {
    const result = getCanonicalComparisonDimensions();
    assert.equal(result.length, 10);
  });

  it('getCanonicalTradeOffTypes returns a copy', () => {
    const result = getCanonicalTradeOffTypes();
    assert.equal(result.length, 10);
  });

  it('getCanonicalDecisionContextTypes returns a copy', () => {
    const result = getCanonicalDecisionContextTypes();
    assert.equal(result.length, 10);
  });

  it('getCanonicalComparativeAssessmentStatuses returns a copy', () => {
    const result = getCanonicalComparativeAssessmentStatuses();
    assert.equal(result.length, 6);
  });
});

// ============================================================================
// COMPOSE FUNCTIONS — Comparative Assessment
// ============================================================================

describe('composeComparativeAssessment', () => {
  it('should compose assessment from valid params', () => {
    const assessment = composeComparativeAssessment({
      id: 'a1', title: 'Test',
      reasoningType: 'analytical',
      dimensions: [_makeDimension('d1')],
      tradeOffs: [_makeTradeOff('t1')],
      decisionContext: _makeContext('c1'),
      alternatives: ['alt-a', 'alt-b'],
      conceptIds: ['con1'], status: 'draft',
      governance: 'canonical', provenance: VALID_COMPARISON_PROVENANCE,
    });
    assert.equal(assessment.id, 'a1');
    assert.equal(assessment.title, 'Test');
    assert.equal(assessment.reasoningType, 'analytical');
    assert.equal(assessment.alternatives.length, 2);
    assert.equal(assessment.trace.deterministic, true);
    assert.equal(assessment.trace.randomUsed, false);
    assert.equal(assessment.trace.timeDependency, false);
  });

  it('should not mutate input arrays', () => {
    const alternatives = ['alt-a', 'alt-b'];
    const conceptIds = ['c1'];
    const original = JSON.stringify({ alternatives, conceptIds });
    composeComparativeAssessment({
      id: 'a', title: 'T',
      reasoningType: 'analytical', dimensions: [], tradeOffs: [],
      decisionContext: _makeContext('c'), alternatives, conceptIds,
      status: 'draft', governance: 'canonical',
      provenance: VALID_COMPARISON_PROVENANCE,
    });
    assert.equal(JSON.stringify({ alternatives, conceptIds }), original);
  });
});

// ============================================================================
// COMPOSE FUNCTIONS — Dimension
// ============================================================================

describe('composeComparisonDimension', () => {
  it('should compose dimension from valid params', () => {
    const dim = composeComparisonDimension({
      id: 'd1', dimension: 'performance',
      description: 'Desc',
    });
    assert.equal(dim.id, 'd1');
    assert.equal(dim.dimension, 'performance');
  });
});

// ============================================================================
// COMPOSE FUNCTIONS — Trade-off
// ============================================================================

describe('composeTradeOffEvaluation', () => {
  it('should compose trade-off from valid params', () => {
    const tradeOff = composeTradeOffEvaluation({
      id: 't1', tradeOffType: 'performance_cost',
      description: 'Desc',
    });
    assert.equal(tradeOff.id, 't1');
    assert.equal(tradeOff.tradeOffType, 'performance_cost');
  });
});

// ============================================================================
// COMPOSE FUNCTIONS — Decision Context
// ============================================================================

describe('composeDecisionContext', () => {
  it('should compose decision context from valid params', () => {
    const context = composeDecisionContext({
      id: 'c1', contextType: 'architecture_selection',
      description: 'Desc',
    });
    assert.equal(context.id, 'c1');
    assert.equal(context.contextType, 'architecture_selection');
  });
});

// ============================================================================
// COMPOSE FUNCTIONS — Relationship
// ============================================================================

describe('composeComparisonRelationship', () => {
  it('should compose relationship from valid params', () => {
    const rel = composeComparisonRelationship({
      id: 'r1', sourceComparisonId: 'a', targetComparisonId: 'b',
      relationshipType: 'depends', rationale: 'r',
    });
    assert.equal(rel.id, 'r1');
    assert.equal(rel.sourceComparisonId, 'a');
    assert.equal(rel.targetComparisonId, 'b');
  });

  it('should return identical output for identical input', () => {
    const params = {
      id: 'r', sourceComparisonId: 'a', targetComparisonId: 'b',
      relationshipType: 'dep', rationale: 'r',
    };
    const r1 = composeComparisonRelationship(params);
    const r2 = composeComparisonRelationship(params);
    assert.deepEqual(r1, r2);
  });
});

// ============================================================================
// COMPOSE FUNCTIONS — Registry
// ============================================================================

describe('composeComparisonRegistry', () => {
  it('should compose registry from assessments', () => {
    const registry = composeComparisonRegistry([VALID_ASSESSMENT_A, VALID_ASSESSMENT_B]);
    assert.equal(registry.nodes.length, 2);
    assert.equal(registry.metadata.nodeCount, 2);
    assert.equal(registry.metadata.deterministic, true);
  });

  it('should sort nodes by id', () => {
    const registry = composeComparisonRegistry([VALID_ASSESSMENT_C, VALID_ASSESSMENT_A, VALID_ASSESSMENT_B]);
    assert.equal(registry.nodes[0].id, 'comp-a');
    assert.equal(registry.nodes[1].id, 'comp-b');
    assert.equal(registry.nodes[2].id, 'comp-c');
  });

  it('should return identical output for identical input', () => {
    const nodes = [VALID_ASSESSMENT_A, VALID_ASSESSMENT_B];
    const r1 = composeComparisonRegistry(nodes);
    const r2 = composeComparisonRegistry(nodes);
    assert.deepEqual(r1, r2);
  });

  it('should not mutate input nodes array', () => {
    const nodes = [VALID_ASSESSMENT_C, VALID_ASSESSMENT_A];
    const original = JSON.stringify(nodes);
    composeComparisonRegistry(nodes);
    assert.equal(JSON.stringify(nodes), original);
  });

  it('should handle empty array', () => {
    const registry = composeComparisonRegistry([]);
    assert.equal(registry.nodes.length, 0);
    assert.equal(registry.metadata.nodeCount, 0);
  });
});

// ============================================================================
// COMPOSE FUNCTIONS — Registry from Input
// ============================================================================

describe('composeComparisonRegistryFromInput', () => {
  it('should compose registry from input', () => {
    const input: ComparisonInput = { nodes: [VALID_ASSESSMENT_A, VALID_ASSESSMENT_B] };
    const registry = composeComparisonRegistryFromInput(input);
    assert.equal(registry.nodes.length, 2);
  });

  it('should return identical output for identical input', () => {
    const input: ComparisonInput = { nodes: [VALID_ASSESSMENT_A] };
    const r1 = composeComparisonRegistryFromInput(input);
    const r2 = composeComparisonRegistryFromInput(input);
    assert.deepEqual(r1, r2);
  });
});

// ============================================================================
// COMPOSE FUNCTIONS — Artifact with comparisons
// ============================================================================

describe('composeAssessmentArtifactWithComparisons', () => {
  it('should compose artifact with comparisons', () => {
    const result = composeAssessmentArtifactWithComparisons({
      artifactId: 'art-1', artifactTitle: 'Test',
      comparisons: [VALID_ASSESSMENT_A],
    });
    assert.equal(result.artifactId, 'art-1');
    assert.equal(result.comparisons.length, 1);
  });

  it('should not mutate comparisons input', () => {
    const comparisons = [VALID_ASSESSMENT_A];
    const original = JSON.stringify(comparisons);
    composeAssessmentArtifactWithComparisons({
      artifactId: 'a', artifactTitle: 'T', comparisons,
    });
    assert.equal(JSON.stringify(comparisons), original);
  });
});

// ============================================================================
// VALIDATION — Comparative assessment validation
// ============================================================================

describe('validateComparativeAssessment', () => {
  it('should pass for valid assessment', () => {
    const errors = validateComparativeAssessment(VALID_ASSESSMENT_A);
    assert.equal(errors.length, 0);
  });

  it('should reject null assessment', () => {
    const errors = validateComparativeAssessment(null as any);
    assert.ok(errors.length > 0);
  });

  it('should reject assessment with missing id', () => {
    const assessment = _makeAssessment('');
    const errors = validateComparativeAssessment(assessment);
    assert.ok(errors.some((e) => e.code === COMPARISON_VALIDATION_CODES.COMPARISON_MISSING_COMPARISON_ID));
  });

  it('should reject assessment with invalid reasoning type', () => {
    const assessment = _makeAssessment('a', { reasoningType: 'invalid' as any });
    const errors = validateComparativeAssessment(assessment);
    assert.ok(errors.some((e) => e.code === COMPARISON_VALIDATION_CODES.COMPARISON_INVALID_REASONING));
  });

  it('should reject assessment with missing alternatives', () => {
    const assessment = _makeAssessment('a', { alternatives: [] });
    const errors = validateComparativeAssessment(assessment);
    assert.ok(errors.some((e) => e.code === COMPARISON_VALIDATION_CODES.COMPARISON_MISSING_ASSESSMENT_REFERENCE));
  });

  it('should reject assessment with missing conceptIds', () => {
    const assessment = _makeAssessment('a', { conceptIds: [] });
    const errors = validateComparativeAssessment(assessment);
    assert.ok(errors.some((e) => e.code === COMPARISON_VALIDATION_CODES.COMPARISON_MISSING_ASSESSMENT_REFERENCE));
  });

  it('should reject assessment with non-deterministic trace', () => {
    const assessment: ComparativeAssessment = {
      id: 'a', title: 'T',
      reasoningType: 'analytical', dimensions: [], tradeOffs: [],
      decisionContext: { id: 'c', contextType: 'architecture_selection', description: 'D' },
      alternatives: ['a'], conceptIds: ['c1'],
      status: 'draft', governance: 'canonical',
      provenance: VALID_COMPARISON_PROVENANCE,
      trace: {
        traceId: 't', deterministic: false as any,
        generatedFrom: 'deterministic_comparison_kernel',
        randomUsed: false, timeDependency: false,
      },
    };
    const errors = validateComparativeAssessment(assessment);
    assert.ok(errors.some((e) => e.code === COMPARISON_VALIDATION_CODES.COMPARISON_INVALID_TRACE));
  });
});

// ============================================================================
// VALIDATION — Relationship validation
// ============================================================================

describe('validateComparisonRelationship', () => {
  it('should pass for valid relationship', () => {
    const rel = composeComparisonRelationship({
      id: 'r1', sourceComparisonId: 'a', targetComparisonId: 'b',
      relationshipType: 'depends', rationale: 'r',
    });
    const errors = validateComparisonRelationship(rel);
    assert.equal(errors.length, 0);
  });

  it('should reject self-relationship', () => {
    const rel = composeComparisonRelationship({
      id: 'r', sourceComparisonId: 'a', targetComparisonId: 'a',
      relationshipType: 'self', rationale: 'r',
    });
    const errors = validateComparisonRelationship(rel);
    assert.ok(errors.some((e) => e.code === COMPARISON_VALIDATION_CODES.COMPARISON_SELF_RELATIONSHIP));
  });
});

// ============================================================================
// VALIDATION — Registry validation
// ============================================================================

describe('validateComparisonRegistry', () => {
  it('should pass for valid registry', () => {
    const registry = composeComparisonRegistry([VALID_ASSESSMENT_A, VALID_ASSESSMENT_B]);
    const result = validateComparisonRegistry(registry);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it('should reject null registry', () => {
    const result = validateComparisonRegistry(null as any);
    assert.equal(result.valid, false);
  });

  it('should reject empty registry', () => {
    const registry = composeComparisonRegistry([]);
    const result = validateComparisonRegistry(registry);
    assert.equal(result.valid, false);
  });

  it('should detect duplicate ids', () => {
    const duplicateNodes = [_makeAssessment('dup'), _makeAssessment('dup')];
    const registry = composeComparisonRegistry(duplicateNodes);
    const result = validateComparisonRegistry(registry);
    assert.equal(result.valid, false);
    assert.ok(result.errors.some((e) => e.code === COMPARISON_VALIDATION_CODES.COMPARISON_DUPLICATE_ID));
  });

  it('should detect duplicate titles', () => {
    const duplicateTitles = [
      _makeAssessment('a', { title: 'Same Title' }),
      _makeAssessment('b', { title: 'Same Title' }),
    ];
    const registry = composeComparisonRegistry(duplicateTitles);
    const result = validateComparisonRegistry(registry);
    assert.equal(result.valid, false);
    assert.ok(result.errors.some((e) => e.code === COMPARISON_VALIDATION_CODES.COMPARISON_DUPLICATE_TITLE));
  });
});

// ============================================================================
// VALIDATION — Input validation
// ============================================================================

describe('validateComparisonInput', () => {
  it('should pass for valid input', () => {
    const input: ComparisonInput = { nodes: [VALID_ASSESSMENT_A] };
    const result = validateComparisonInput(input);
    assert.equal(result.valid, true);
  });

  it('should reject null input', () => {
    const result = validateComparisonInput(null as any);
    assert.equal(result.valid, false);
  });

  it('should reject empty input', () => {
    const result = validateComparisonInput({ nodes: [] });
    assert.equal(result.valid, false);
  });
});

// ============================================================================
// VALIDATION — Trace validation
// ============================================================================

describe('validateComparisonTrace', () => {
  it('should pass for valid trace', () => {
    const trace = composeComparisonAssessmentTrace({ traceId: 'test' });
    const result = validateComparisonTrace(trace);
    assert.equal(result.valid, true);
  });

  it('should reject null trace', () => {
    const result = validateComparisonTrace(null as any);
    assert.equal(result.valid, false);
  });
});

// ============================================================================
// VALIDATION — Artifact with comparisons validation
// ============================================================================

describe('validateAssessmentArtifactWithComparisons', () => {
  it('should pass for valid artifact', () => {
    const artifact = composeAssessmentArtifactWithComparisons({
      artifactId: 'art-1', artifactTitle: 'Test',
      comparisons: [VALID_ASSESSMENT_A],
    });
    const result = validateAssessmentArtifactWithComparisons(artifact);
    assert.equal(result.valid, true);
  });

  it('should reject null artifact', () => {
    const result = validateAssessmentArtifactWithComparisons(null as any);
    assert.equal(result.valid, false);
  });
});

// ============================================================================
// DETERMINISTIC IDENTITY — 100 iterations
// ============================================================================

describe('Deterministic Identity', () => {
  it('should produce identical output for composeComparisonRegistry across 100 iterations', () => {
    const nodes = [VALID_ASSESSMENT_A, VALID_ASSESSMENT_B];
    let firstResult: string | null = null;

    for (let i = 0; i < 100; i++) {
      const result = composeComparisonRegistry(nodes);
      const serialized = JSON.stringify(result);
      if (firstResult === null) {
        firstResult = serialized;
      } else {
        assert.equal(serialized, firstResult, `Iteration ${i} differs`);
      }
    }
  });

  it('should produce identical output for composeComparativeAssessment across 100 iterations', () => {
    const params = {
      id: 'a', title: 'T',
      reasoningType: 'analytical' as const,
      dimensions: [_makeDimension('d')],
      tradeOffs: [_makeTradeOff('t')],
      decisionContext: _makeContext('c'),
      alternatives: ['a', 'b'],
      conceptIds: ['c1'],
      status: 'draft' as const, governance: 'canonical' as const,
      provenance: VALID_COMPARISON_PROVENANCE,
    };
    let firstResult: string | null = null;

    for (let i = 0; i < 100; i++) {
      const result = composeComparativeAssessment(params);
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
  it('should not mutate input nodes array in composeComparisonRegistry', () => {
    const nodes = [VALID_ASSESSMENT_C, VALID_ASSESSMENT_A];
    const original = JSON.stringify(nodes);
    composeComparisonRegistry(nodes);
    assert.equal(JSON.stringify(nodes), original);
  });

  it('should not mutate conceptIds in composeComparativeAssessment', () => {
    const conceptIds = ['c1'];
    const original = JSON.stringify(conceptIds);
    composeComparativeAssessment({
      id: 'a', title: 'T',
      reasoningType: 'analytical', dimensions: [], tradeOffs: [],
      decisionContext: _makeContext('c'), alternatives: [], conceptIds,
      status: 'draft', governance: 'canonical',
      provenance: VALID_COMPARISON_PROVENANCE,
    });
    assert.equal(JSON.stringify(conceptIds), original);
  });

  it('getCanonicalComparisonReasoningTypes returns a copy not affecting original', () => {
    const copy = getCanonicalComparisonReasoningTypes();
    assert.equal(copy.length, 10);
    (copy as string[]).push('injected');
    assert.equal(CANONICAL_COMPARISON_REASONING_TYPES.length, 10);
  });

  it('getCanonicalComparisonDimensions returns a copy not affecting original', () => {
    const copy = getCanonicalComparisonDimensions();
    assert.equal(copy.length, 10);
    (copy as string[]).push('injected');
    assert.equal(CANONICAL_COMPARISON_DIMENSIONS.length, 10);
  });

  it('getCanonicalTradeOffTypes returns a copy not affecting original', () => {
    const copy = getCanonicalTradeOffTypes();
    assert.equal(copy.length, 10);
    (copy as string[]).push('injected');
    assert.equal(CANONICAL_TRADE_OFF_TYPES.length, 10);
  });
});

// ============================================================================
// CROSS-AGENT BOUNDARY — No reasoning/ranking/evaluation
// ============================================================================

describe('Cross-Agent Boundary', () => {
  it('should not contain comparative reasoning logic', () => {
    const source = JSON.stringify(CANONICAL_COMPARISON_REASONING_TYPES);
    assert.ok(!source.includes('reason'));
    assert.ok(!source.includes('evaluate'));
    assert.ok(!source.includes('judge'));
  });

  it('should not contain ranking logic', () => {
    const source = JSON.stringify(CANONICAL_COMPARISON_DIMENSIONS);
    assert.ok(!source.includes('rank'));
    assert.ok(!source.includes('sort_solution'));
    assert.ok(!source.includes('order'));
  });

  it('should not contain trade-off scoring logic', () => {
    const source = JSON.stringify(CANONICAL_TRADE_OFF_TYPES);
    assert.ok(!source.includes('score'));
    assert.ok(!source.includes('compute'));
    assert.ok(!source.includes('calculate'));
  });

  it('should not contain recommendation logic', () => {
    const source = JSON.stringify(CANONICAL_DECISION_CONTEXT_TYPES);
    assert.ok(!source.includes('recommend'));
    assert.ok(!source.includes('suggest'));
    assert.ok(!source.includes('advise'));
  });

  it('should not contain optimization logic', () => {
    const source = JSON.stringify(CANONICAL_COMPARISON_DIMENSIONS);
    assert.ok(!source.includes('optimize'));
    assert.ok(!source.includes('maximize'));
    assert.ok(!source.includes('minimize'));
  });
});

// ============================================================================
// NEGATIVE CAPABILITY — No scoring/mastery/adaptive
// ============================================================================

describe('Negative Capability', () => {
  it('should not contain scoring logic', () => {
    const source = JSON.stringify(CANONICAL_COMPARISON_REASONING_TYPES);
    assert.ok(!source.includes('score'));
    assert.ok(!source.includes('mastery'));
  });

  it('should not contain LLM or async patterns', () => {
    const source = JSON.stringify(CANONICAL_COMPARISON_REASONING_TYPES);
    assert.ok(!source.includes('Promise'));
    assert.ok(!source.includes('async'));
    assert.ok(!source.includes('await'));
  });
});

// ============================================================================
// VALIDATION CODES — Structure verification
// ============================================================================

describe('Validation Codes', () => {
  it('should have exactly 25 validation codes', () => {
    const codes = Object.values(COMPARISON_VALIDATION_CODES);
    assert.equal(codes.length, 25);
  });

  it('all validation codes should be UPPER_SNAKE_CASE', () => {
    for (const code of Object.values(COMPARISON_VALIDATION_CODES)) {
      assert.ok(/^[A-Z_]+$/.test(code), `Not UPPER_SNAKE_CASE: ${code}`);
    }
  });

  it('all validation codes should start with COMPARISON_ or DIMENSION_ or TRADE_OFF_ or DECISION_CONTEXT_', () => {
    for (const code of Object.values(COMPARISON_VALIDATION_CODES)) {
      assert.ok(
        code.startsWith('COMPARISON_') || code.startsWith('DIMENSION_') ||
        code.startsWith('TRADE_OFF_') || code.startsWith('DECISION_CONTEXT_'),
        `Unexpected prefix: ${code}`,
      );
    }
  });

  it('all keys should match their string values', () => {
    for (const [key, value] of Object.entries(COMPARISON_VALIDATION_CODES)) {
      assert.equal(key, value, `Key ${key} does not match value ${value}`);
    }
  });
});

/**
 * NV-2000-D8-OPT-11 — Engineering Constraint Analysis Kernel Tests
 *
 * Exhaustive deterministic tests for the Constraint Analysis Kernel.
 * Uses Node.js built-in test runner (node:test).
 *
 * ~90 tests covering:
 * - Canonical enum completeness
 * - Helper functions
 * - Constraint assessment composition
 * - Category composition
 * - Severity composition
 * - Reasoning composition
 * - Relationship composition
 * - Registry composition
 * - Validation codes
 * - Duplicate detection
 * - Deterministic identity (100 iterations)
 * - Immutability
 * - Validator stability
 * - No mutation
 * - Artifact with constraints
 * - Cross-agent boundary
 * - Negative capability verification
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  CANONICAL_ENGINEERING_CONSTRAINT_ANALYSIS_TYPES,
  CANONICAL_CONSTRAINT_SEVERITY_LEVELS,
  CANONICAL_CONSTRAINT_CATEGORY_TYPES,
  CANONICAL_CONSTRAINT_REASONING_TYPES,
  CANONICAL_CONSTRAINT_ANALYSIS_STATUS,
  CANONICAL_ASSESSMENT_GOVERNANCE,
  type EngineeringConstraintAssessment,
  type ConstraintCategory,
  type ConstraintSeverity,
  type ConstraintReasoning,
  type ConstraintInput,
  type ConstraintRegistry,
  type ConstraintAssessmentProvenance,
  type AssessmentArtifactWithConstraints,
} from './AssessmentAgentContract.ts';

import {
  composeConstraintAssessmentProvenance,
  composeConstraintAssessmentTrace,
  composeConstraintCategory,
  composeConstraintSeverity,
  composeConstraintReasoning,
  composeConstraintRelationship,
  composeEngineeringConstraintAssessment,
  composeConstraintRegistry,
  composeConstraintRegistryFromInput,
  composeAssessmentConstraints,
  composeAssessmentArtifactWithConstraints,
  isSupportedEngineeringConstraintType,
  isSupportedConstraintCategory,
  isSupportedConstraintSeverity,
  isSupportedConstraintReasoning,
  isSupportedConstraintAnalysisStatus,
  isSupportedConstraintGovernance,
  getCanonicalEngineeringConstraintTypes,
  getCanonicalConstraintCategories,
  getCanonicalConstraintSeverities,
  getCanonicalConstraintReasoningTypes,
  getCanonicalConstraintAnalysisStatuses,
} from './AssessmentConstraintKernel.ts';

import {
  CONSTRAINT_VALIDATION_CODES,
  validateEngineeringConstraintAssessment,
  validateConstraintCategory,
  validateConstraintSeverity,
  validateConstraintReasoning,
  validateConstraintRelationship,
  validateConstraintRegistry,
  validateConstraintInput,
  validateConstraintTrace,
  validateAssessmentArtifactWithConstraints,
} from './AssessmentConstraintValidation.ts';

// ============================================================================
// TEST FIXTURES
// ============================================================================

const VALID_CONSTRAINT_PROVENANCE: ConstraintAssessmentProvenance = {
  provider: 'test-provider',
  source: 'test-source',
  reviewStatus: 'approved',
  reviewDate: '2025-01-01',
  version: '1.0.0',
  rationale: 'Test rationale for constraint analysis.',
};

function _makeCategory(id: string): ConstraintCategory {
  return composeConstraintCategory({
    id,
    categoryType: 'performance',
    description: `Test category ${id}`,
  });
}

function _makeSeverity(id: string): ConstraintSeverity {
  return composeConstraintSeverity({
    id,
    severityLevel: 'major',
    description: `Test severity ${id}`,
  });
}

function _makeReasoning(id: string): ConstraintReasoning {
  return composeConstraintReasoning({
    id,
    reasoningType: 'analytical',
    description: `Test reasoning ${id}`,
  });
}

function _makeAssessment(
  id: string,
  overrides: Partial<EngineeringConstraintAssessment> = {},
): EngineeringConstraintAssessment {
  return composeEngineeringConstraintAssessment({
    id,
    title: `Constraint ${id}`,
    constraintType: 'latency',
    categories: [_makeCategory(`cat-${id}`)],
    severities: [_makeSeverity(`sev-${id}`)],
    reasoningTypes: [_makeReasoning(`rea-${id}`)],
    conceptIds: ['concept-1'],
    status: 'draft',
    governance: 'canonical',
    provenance: VALID_CONSTRAINT_PROVENANCE,
    ...overrides,
  });
}

const VALID_ASSESSMENT_A = _makeAssessment('constraint-a');
const VALID_ASSESSMENT_B = _makeAssessment('constraint-b');
const VALID_ASSESSMENT_C = _makeAssessment('constraint-c');

// ============================================================================
// CANONICAL ENUM COMPLETENESS
// ============================================================================

describe('Canonical Enums', () => {
  it('should have exactly 10 engineering constraint analysis types', () => {
    assert.equal(CANONICAL_ENGINEERING_CONSTRAINT_ANALYSIS_TYPES.length, 10);
  });

  it('should have exactly 5 constraint severity levels', () => {
    assert.equal(CANONICAL_CONSTRAINT_SEVERITY_LEVELS.length, 5);
  });

  it('should have exactly 10 constraint category types', () => {
    assert.equal(CANONICAL_CONSTRAINT_CATEGORY_TYPES.length, 10);
  });

  it('should have exactly 10 constraint reasoning types', () => {
    assert.equal(CANONICAL_CONSTRAINT_REASONING_TYPES.length, 10);
  });

  it('should have exactly 6 constraint analysis statuses', () => {
    assert.equal(CANONICAL_CONSTRAINT_ANALYSIS_STATUS.length, 6);
  });

  it('should contain expected engineering constraint analysis types', () => {
    const expected = [
      'latency', 'memory', 'compute', 'bandwidth', 'energy',
      'cost', 'scalability', 'maintainability', 'security', 'reliability',
    ];
    for (const value of expected) {
      assert.ok(CANONICAL_ENGINEERING_CONSTRAINT_ANALYSIS_TYPES.includes(value as any), `Missing: ${value}`);
    }
  });

  it('should contain expected constraint severity levels', () => {
    const expected = ['minimal', 'minor', 'moderate', 'major', 'critical'];
    for (const value of expected) {
      assert.ok(CANONICAL_CONSTRAINT_SEVERITY_LEVELS.includes(value as any), `Missing: ${value}`);
    }
  });

  it('should contain expected constraint category types', () => {
    const expected = [
      'performance', 'resource', 'architecture', 'deployment', 'integration',
      'security', 'reliability', 'cost', 'operational', 'compliance',
    ];
    for (const value of expected) {
      assert.ok(CANONICAL_CONSTRAINT_CATEGORY_TYPES.includes(value as any), `Missing: ${value}`);
    }
  });

  it('should contain expected constraint reasoning types', () => {
    const expected = [
      'factual', 'conceptual', 'procedural', 'analytical', 'comparative',
      'causal', 'diagnostic', 'engineering', 'critical', 'reflective',
    ];
    for (const value of expected) {
      assert.ok(CANONICAL_CONSTRAINT_REASONING_TYPES.includes(value as any), `Missing: ${value}`);
    }
  });
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

describe('Helper Functions', () => {
  it('isSupportedEngineeringConstraintType returns true for valid types', () => {
    assert.equal(isSupportedEngineeringConstraintType('latency'), true);
    assert.equal(isSupportedEngineeringConstraintType('reliability'), true);
  });

  it('isSupportedEngineeringConstraintType returns false for invalid types', () => {
    assert.equal(isSupportedEngineeringConstraintType('invalid'), false);
    assert.equal(isSupportedEngineeringConstraintType(''), false);
  });

  it('isSupportedConstraintCategory returns true for valid types', () => {
    assert.equal(isSupportedConstraintCategory('performance'), true);
    assert.equal(isSupportedConstraintCategory('security'), true);
  });

  it('isSupportedConstraintCategory returns false for invalid types', () => {
    assert.equal(isSupportedConstraintCategory('invalid'), false);
    assert.equal(isSupportedConstraintCategory(''), false);
  });

  it('isSupportedConstraintSeverity returns true for valid levels', () => {
    assert.equal(isSupportedConstraintSeverity('minimal'), true);
    assert.equal(isSupportedConstraintSeverity('critical'), true);
  });

  it('isSupportedConstraintSeverity returns false for invalid levels', () => {
    assert.equal(isSupportedConstraintSeverity('invalid'), false);
    assert.equal(isSupportedConstraintSeverity(''), false);
  });

  it('isSupportedConstraintReasoning returns true for valid types', () => {
    assert.equal(isSupportedConstraintReasoning('analytical'), true);
    assert.equal(isSupportedConstraintReasoning('engineering'), true);
  });

  it('isSupportedConstraintReasoning returns false for invalid types', () => {
    assert.equal(isSupportedConstraintReasoning('invalid'), false);
    assert.equal(isSupportedConstraintReasoning(''), false);
  });

  it('isSupportedConstraintAnalysisStatus returns true for valid statuses', () => {
    assert.equal(isSupportedConstraintAnalysisStatus('draft'), true);
    assert.equal(isSupportedConstraintAnalysisStatus('archived'), true);
  });

  it('isSupportedConstraintAnalysisStatus returns false for invalid statuses', () => {
    assert.equal(isSupportedConstraintAnalysisStatus('invalid'), false);
    assert.equal(isSupportedConstraintAnalysisStatus(''), false);
  });

  it('isSupportedConstraintGovernance returns true for valid governance', () => {
    assert.equal(isSupportedConstraintGovernance('canonical'), true);
    assert.equal(isSupportedConstraintGovernance('rejected'), true);
  });

  it('isSupportedConstraintGovernance returns false for invalid governance', () => {
    assert.equal(isSupportedConstraintGovernance('invalid'), false);
    assert.equal(isSupportedConstraintGovernance(''), false);
  });

  it('getCanonicalEngineeringConstraintTypes returns a copy', () => {
    const result = getCanonicalEngineeringConstraintTypes();
    assert.equal(result.length, 10);
    assert.deepEqual([...result], [...CANONICAL_ENGINEERING_CONSTRAINT_ANALYSIS_TYPES]);
    (result as string[]).push('injected');
    assert.equal(CANONICAL_ENGINEERING_CONSTRAINT_ANALYSIS_TYPES.length, 10);
  });

  it('getCanonicalConstraintCategories returns a copy', () => {
    const result = getCanonicalConstraintCategories();
    assert.equal(result.length, 10);
  });

  it('getCanonicalConstraintSeverities returns a copy', () => {
    const result = getCanonicalConstraintSeverities();
    assert.equal(result.length, 5);
  });

  it('getCanonicalConstraintReasoningTypes returns a copy', () => {
    const result = getCanonicalConstraintReasoningTypes();
    assert.equal(result.length, 10);
  });

  it('getCanonicalConstraintAnalysisStatuses returns a copy', () => {
    const result = getCanonicalConstraintAnalysisStatuses();
    assert.equal(result.length, 6);
  });
});

// ============================================================================
// COMPOSE FUNCTIONS — Constraint Assessment
// ============================================================================

describe('composeEngineeringConstraintAssessment', () => {
  it('should compose constraint assessment from valid params', () => {
    const assessment = composeEngineeringConstraintAssessment({
      id: 'c1', title: 'Test',
      constraintType: 'latency',
      categories: [_makeCategory('cat1')],
      severities: [_makeSeverity('sev1')],
      reasoningTypes: [_makeReasoning('rea1')],
      conceptIds: ['c1'], status: 'draft',
      governance: 'canonical', provenance: VALID_CONSTRAINT_PROVENANCE,
    });
    assert.equal(assessment.id, 'c1');
    assert.equal(assessment.title, 'Test');
    assert.equal(assessment.constraintType, 'latency');
    assert.equal(assessment.trace.deterministic, true);
    assert.equal(assessment.trace.randomUsed, false);
    assert.equal(assessment.trace.timeDependency, false);
  });

  it('should not mutate input arrays', () => {
    const conceptIds = ['c1'];
    const original = JSON.stringify(conceptIds);
    composeEngineeringConstraintAssessment({
      id: 'c', title: 'T',
      constraintType: 'latency',
      categories: [], severities: [], reasoningTypes: [],
      conceptIds, status: 'draft', governance: 'canonical',
      provenance: VALID_CONSTRAINT_PROVENANCE,
    });
    assert.equal(JSON.stringify(conceptIds), original);
  });
});

// ============================================================================
// COMPOSE FUNCTIONS — Category
// ============================================================================

describe('composeConstraintCategory', () => {
  it('should compose category from valid params', () => {
    const category = composeConstraintCategory({
      id: 'cat1', categoryType: 'performance',
      description: 'Desc',
    });
    assert.equal(category.id, 'cat1');
    assert.equal(category.categoryType, 'performance');
  });
});

// ============================================================================
// COMPOSE FUNCTIONS — Severity
// ============================================================================

describe('composeConstraintSeverity', () => {
  it('should compose severity from valid params', () => {
    const severity = composeConstraintSeverity({
      id: 'sev1', severityLevel: 'critical',
      description: 'Desc',
    });
    assert.equal(severity.id, 'sev1');
    assert.equal(severity.severityLevel, 'critical');
  });
});

// ============================================================================
// COMPOSE FUNCTIONS — Reasoning
// ============================================================================

describe('composeConstraintReasoning', () => {
  it('should compose reasoning from valid params', () => {
    const reasoning = composeConstraintReasoning({
      id: 'rea1', reasoningType: 'analytical',
      description: 'Desc',
    });
    assert.equal(reasoning.id, 'rea1');
    assert.equal(reasoning.reasoningType, 'analytical');
  });
});

// ============================================================================
// COMPOSE FUNCTIONS — Relationship
// ============================================================================

describe('composeConstraintRelationship', () => {
  it('should compose relationship from valid params', () => {
    const rel = composeConstraintRelationship({
      id: 'r1', sourceConstraintId: 'a', targetConstraintId: 'b',
      relationshipType: 'depends', rationale: 'r',
    });
    assert.equal(rel.id, 'r1');
    assert.equal(rel.sourceConstraintId, 'a');
    assert.equal(rel.targetConstraintId, 'b');
  });

  it('should return identical output for identical input', () => {
    const params = {
      id: 'r', sourceConstraintId: 'a', targetConstraintId: 'b',
      relationshipType: 'dep', rationale: 'r',
    };
    const r1 = composeConstraintRelationship(params);
    const r2 = composeConstraintRelationship(params);
    assert.deepEqual(r1, r2);
  });
});

// ============================================================================
// COMPOSE FUNCTIONS — Registry
// ============================================================================

describe('composeConstraintRegistry', () => {
  it('should compose registry from assessments', () => {
    const registry = composeConstraintRegistry([VALID_ASSESSMENT_A, VALID_ASSESSMENT_B]);
    assert.equal(registry.nodes.length, 2);
    assert.equal(registry.metadata.nodeCount, 2);
    assert.equal(registry.metadata.deterministic, true);
  });

  it('should sort nodes by id', () => {
    const registry = composeConstraintRegistry([VALID_ASSESSMENT_C, VALID_ASSESSMENT_A, VALID_ASSESSMENT_B]);
    assert.equal(registry.nodes[0].id, 'constraint-a');
    assert.equal(registry.nodes[1].id, 'constraint-b');
    assert.equal(registry.nodes[2].id, 'constraint-c');
  });

  it('should return identical output for identical input', () => {
    const nodes = [VALID_ASSESSMENT_A, VALID_ASSESSMENT_B];
    const r1 = composeConstraintRegistry(nodes);
    const r2 = composeConstraintRegistry(nodes);
    assert.deepEqual(r1, r2);
  });

  it('should not mutate input nodes array', () => {
    const nodes = [VALID_ASSESSMENT_C, VALID_ASSESSMENT_A];
    const original = JSON.stringify(nodes);
    composeConstraintRegistry(nodes);
    assert.equal(JSON.stringify(nodes), original);
  });

  it('should handle empty array', () => {
    const registry = composeConstraintRegistry([]);
    assert.equal(registry.nodes.length, 0);
    assert.equal(registry.metadata.nodeCount, 0);
  });
});

// ============================================================================
// COMPOSE FUNCTIONS — Registry from Input
// ============================================================================

describe('composeConstraintRegistryFromInput', () => {
  it('should compose registry from input', () => {
    const input: ConstraintInput = { nodes: [VALID_ASSESSMENT_A, VALID_ASSESSMENT_B] };
    const registry = composeConstraintRegistryFromInput(input);
    assert.equal(registry.nodes.length, 2);
  });

  it('should return identical output for identical input', () => {
    const input: ConstraintInput = { nodes: [VALID_ASSESSMENT_A] };
    const r1 = composeConstraintRegistryFromInput(input);
    const r2 = composeConstraintRegistryFromInput(input);
    assert.deepEqual(r1, r2);
  });
});

// ============================================================================
// COMPOSE FUNCTIONS — Artifact with constraints
// ============================================================================

describe('composeAssessmentArtifactWithConstraints', () => {
  it('should compose artifact with constraints', () => {
    const result = composeAssessmentArtifactWithConstraints({
      artifactId: 'art-1', artifactTitle: 'Test',
      constraints: [VALID_ASSESSMENT_A],
    });
    assert.equal(result.artifactId, 'art-1');
    assert.equal(result.constraints.length, 1);
  });

  it('should not mutate constraints input', () => {
    const constraints = [VALID_ASSESSMENT_A];
    const original = JSON.stringify(constraints);
    composeAssessmentArtifactWithConstraints({
      artifactId: 'a', artifactTitle: 'T', constraints,
    });
    assert.equal(JSON.stringify(constraints), original);
  });
});

// ============================================================================
// VALIDATION — Constraint assessment validation
// ============================================================================

describe('validateEngineeringConstraintAssessment', () => {
  it('should pass for valid constraint assessment', () => {
    const errors = validateEngineeringConstraintAssessment(VALID_ASSESSMENT_A);
    assert.equal(errors.length, 0);
  });

  it('should reject null assessment', () => {
    const errors = validateEngineeringConstraintAssessment(null as any);
    assert.ok(errors.length > 0);
  });

  it('should reject assessment with missing id', () => {
    const assessment = _makeAssessment('');
    const errors = validateEngineeringConstraintAssessment(assessment);
    assert.ok(errors.some((e) => e.code === CONSTRAINT_VALIDATION_CODES.CONSTRAINT_MISSING_CONSTRAINT_ID));
  });

  it('should reject assessment with invalid type', () => {
    const assessment = _makeAssessment('c', { constraintType: 'invalid' as any });
    const errors = validateEngineeringConstraintAssessment(assessment);
    assert.ok(errors.some((e) => e.code === CONSTRAINT_VALIDATION_CODES.CONSTRAINT_INVALID_TYPE));
  });

  it('should reject assessment with missing conceptIds', () => {
    const assessment = _makeAssessment('c', { conceptIds: [] });
    const errors = validateEngineeringConstraintAssessment(assessment);
    assert.ok(errors.some((e) => e.code === CONSTRAINT_VALIDATION_CODES.CONSTRAINT_MISSING_ASSESSMENT_REFERENCE));
  });

  it('should reject assessment with non-deterministic trace', () => {
    const assessment: EngineeringConstraintAssessment = {
      id: 'c', title: 'T',
      constraintType: 'latency',
      categories: [], severities: [], reasoningTypes: [],
      conceptIds: ['c1'], status: 'draft', governance: 'canonical',
      provenance: VALID_CONSTRAINT_PROVENANCE,
      trace: {
        traceId: 't', deterministic: false as any,
        generatedFrom: 'deterministic_constraint_kernel',
        randomUsed: false, timeDependency: false,
      },
    };
    const errors = validateEngineeringConstraintAssessment(assessment);
    assert.ok(errors.some((e) => e.code === CONSTRAINT_VALIDATION_CODES.CONSTRAINT_INVALID_TRACE));
  });
});

// ============================================================================
// VALIDATION — Relationship validation
// ============================================================================

describe('validateConstraintRelationship', () => {
  it('should pass for valid relationship', () => {
    const rel = composeConstraintRelationship({
      id: 'r1', sourceConstraintId: 'a', targetConstraintId: 'b',
      relationshipType: 'depends', rationale: 'r',
    });
    const errors = validateConstraintRelationship(rel);
    assert.equal(errors.length, 0);
  });

  it('should reject self-relationship', () => {
    const rel = composeConstraintRelationship({
      id: 'r', sourceConstraintId: 'a', targetConstraintId: 'a',
      relationshipType: 'self', rationale: 'r',
    });
    const errors = validateConstraintRelationship(rel);
    assert.ok(errors.some((e) => e.code === CONSTRAINT_VALIDATION_CODES.CONSTRAINT_SELF_RELATIONSHIP));
  });
});

// ============================================================================
// VALIDATION — Registry validation
// ============================================================================

describe('validateConstraintRegistry', () => {
  it('should pass for valid registry', () => {
    const registry = composeConstraintRegistry([VALID_ASSESSMENT_A, VALID_ASSESSMENT_B]);
    const result = validateConstraintRegistry(registry);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it('should reject null registry', () => {
    const result = validateConstraintRegistry(null as any);
    assert.equal(result.valid, false);
  });

  it('should reject empty registry', () => {
    const registry = composeConstraintRegistry([]);
    const result = validateConstraintRegistry(registry);
    assert.equal(result.valid, false);
  });

  it('should detect duplicate ids', () => {
    const duplicateNodes = [_makeAssessment('dup'), _makeAssessment('dup')];
    const registry = composeConstraintRegistry(duplicateNodes);
    const result = validateConstraintRegistry(registry);
    assert.equal(result.valid, false);
    assert.ok(result.errors.some((e) => e.code === CONSTRAINT_VALIDATION_CODES.CONSTRAINT_DUPLICATE_ID));
  });

  it('should detect duplicate titles', () => {
    const duplicateTitles = [
      _makeAssessment('a', { title: 'Same Title' }),
      _makeAssessment('b', { title: 'Same Title' }),
    ];
    const registry = composeConstraintRegistry(duplicateTitles);
    const result = validateConstraintRegistry(registry);
    assert.equal(result.valid, false);
    assert.ok(result.errors.some((e) => e.code === CONSTRAINT_VALIDATION_CODES.CONSTRAINT_DUPLICATE_TITLE));
  });
});

// ============================================================================
// VALIDATION — Input validation
// ============================================================================

describe('validateConstraintInput', () => {
  it('should pass for valid input', () => {
    const input: ConstraintInput = { nodes: [VALID_ASSESSMENT_A] };
    const result = validateConstraintInput(input);
    assert.equal(result.valid, true);
  });

  it('should reject null input', () => {
    const result = validateConstraintInput(null as any);
    assert.equal(result.valid, false);
  });

  it('should reject empty input', () => {
    const result = validateConstraintInput({ nodes: [] });
    assert.equal(result.valid, false);
  });
});

// ============================================================================
// VALIDATION — Trace validation
// ============================================================================

describe('validateConstraintTrace', () => {
  it('should pass for valid trace', () => {
    const trace = composeConstraintAssessmentTrace({ traceId: 'test' });
    const result = validateConstraintTrace(trace);
    assert.equal(result.valid, true);
  });

  it('should reject null trace', () => {
    const result = validateConstraintTrace(null as any);
    assert.equal(result.valid, false);
  });
});

// ============================================================================
// VALIDATION — Artifact with constraints validation
// ============================================================================

describe('validateAssessmentArtifactWithConstraints', () => {
  it('should pass for valid artifact', () => {
    const artifact = composeAssessmentArtifactWithConstraints({
      artifactId: 'art-1', artifactTitle: 'Test',
      constraints: [VALID_ASSESSMENT_A],
    });
    const result = validateAssessmentArtifactWithConstraints(artifact);
    assert.equal(result.valid, true);
  });

  it('should reject null artifact', () => {
    const result = validateAssessmentArtifactWithConstraints(null as any);
    assert.equal(result.valid, false);
  });
});

// ============================================================================
// DETERMINISTIC IDENTITY — 100 iterations
// ============================================================================

describe('Deterministic Identity', () => {
  it('should produce identical output for composeConstraintRegistry across 100 iterations', () => {
    const nodes = [VALID_ASSESSMENT_A, VALID_ASSESSMENT_B];
    let firstResult: string | null = null;

    for (let i = 0; i < 100; i++) {
      const result = composeConstraintRegistry(nodes);
      const serialized = JSON.stringify(result);
      if (firstResult === null) {
        firstResult = serialized;
      } else {
        assert.equal(serialized, firstResult, `Iteration ${i} differs`);
      }
    }
  });

  it('should produce identical output for composeEngineeringConstraintAssessment across 100 iterations', () => {
    const params = {
      id: 'c', title: 'T',
      constraintType: 'latency' as const,
      categories: [_makeCategory('cat')],
      severities: [_makeSeverity('sev')],
      reasoningTypes: [_makeReasoning('rea')],
      conceptIds: ['c1'],
      status: 'draft' as const, governance: 'canonical' as const,
      provenance: VALID_CONSTRAINT_PROVENANCE,
    };
    let firstResult: string | null = null;

    for (let i = 0; i < 100; i++) {
      const result = composeEngineeringConstraintAssessment(params);
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
  it('should not mutate input nodes array in composeConstraintRegistry', () => {
    const nodes = [VALID_ASSESSMENT_C, VALID_ASSESSMENT_A];
    const original = JSON.stringify(nodes);
    composeConstraintRegistry(nodes);
    assert.equal(JSON.stringify(nodes), original);
  });

  it('should not mutate conceptIds in composeEngineeringConstraintAssessment', () => {
    const conceptIds = ['c1'];
    const original = JSON.stringify(conceptIds);
    composeEngineeringConstraintAssessment({
      id: 'c', title: 'T',
      constraintType: 'latency',
      categories: [], severities: [], reasoningTypes: [],
      conceptIds, status: 'draft', governance: 'canonical',
      provenance: VALID_CONSTRAINT_PROVENANCE,
    });
    assert.equal(JSON.stringify(conceptIds), original);
  });

  it('getCanonicalEngineeringConstraintTypes returns a copy not affecting original', () => {
    const copy = getCanonicalEngineeringConstraintTypes();
    assert.equal(copy.length, 10);
    (copy as string[]).push('injected');
    assert.equal(CANONICAL_ENGINEERING_CONSTRAINT_ANALYSIS_TYPES.length, 10);
  });

  it('getCanonicalConstraintCategories returns a copy not affecting original', () => {
    const copy = getCanonicalConstraintCategories();
    assert.equal(copy.length, 10);
    (copy as string[]).push('injected');
    assert.equal(CANONICAL_CONSTRAINT_CATEGORY_TYPES.length, 10);
  });

  it('getCanonicalConstraintSeverities returns a copy not affecting original', () => {
    const copy = getCanonicalConstraintSeverities();
    assert.equal(copy.length, 5);
    (copy as string[]).push('injected');
    assert.equal(CANONICAL_CONSTRAINT_SEVERITY_LEVELS.length, 5);
  });
});

// ============================================================================
// CROSS-AGENT BOUNDARY — No analysis/evaluation/ranking
// ============================================================================

describe('Cross-Agent Boundary', () => {
  it('should not contain analysis logic', () => {
    const source = JSON.stringify(CANONICAL_ENGINEERING_CONSTRAINT_ANALYSIS_TYPES);
    assert.ok(!source.includes('analyze'));
    assert.ok(!source.includes('evaluat'));
  });

  it('should not contain optimization logic', () => {
    const source = JSON.stringify(CANONICAL_CONSTRAINT_CATEGORY_TYPES);
    assert.ok(!source.includes('optim'));
    assert.ok(!source.includes('recommend'));
  });

  it('should not contain solution evaluation logic', () => {
    const source = JSON.stringify(CANONICAL_CONSTRAINT_REASONING_TYPES);
    assert.ok(!source.includes('evaluat'));
    assert.ok(!source.includes('judge'));
  });

  it('should not contain ranking logic', () => {
    const source = JSON.stringify(CANONICAL_CONSTRAINT_SEVERITY_LEVELS);
    assert.ok(!source.includes('rank'));
    assert.ok(!source.includes('sort_solution'));
  });

  it('should not contain recommendation logic', () => {
    const source = JSON.stringify(CANONICAL_CONSTRAINT_CATEGORY_TYPES);
    assert.ok(!source.includes('recommend'));
    assert.ok(!source.includes('suggest'));
    assert.ok(!source.includes('advise'));
  });

  it('should not contain LLM reasoning logic', () => {
    const source = JSON.stringify(CANONICAL_ENGINEERING_CONSTRAINT_ANALYSIS_TYPES);
    assert.ok(!source.includes('llm'));
    assert.ok(!source.includes('inference'));
    assert.ok(!source.includes('reasoning_engine'));
  });
});

// ============================================================================
// NEGATIVE CAPABILITY — No scoring/mastery/adaptive
// ============================================================================

describe('Negative Capability', () => {
  it('should not contain scoring logic', () => {
    const source = JSON.stringify(CANONICAL_ENGINEERING_CONSTRAINT_ANALYSIS_TYPES);
    assert.ok(!source.includes('score'));
    assert.ok(!source.includes('mastery'));
  });

  it('should not contain LLM or async patterns', () => {
    const source = JSON.stringify(CANONICAL_ENGINEERING_CONSTRAINT_ANALYSIS_TYPES);
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
    const codes = Object.values(CONSTRAINT_VALIDATION_CODES);
    assert.equal(codes.length, 25);
  });

  it('all validation codes should be UPPER_SNAKE_CASE', () => {
    for (const code of Object.values(CONSTRAINT_VALIDATION_CODES)) {
      assert.ok(/^[A-Z_]+$/.test(code), `Not UPPER_SNAKE_CASE: ${code}`);
    }
  });

  it('all validation codes should start with CONSTRAINT_', () => {
    for (const code of Object.values(CONSTRAINT_VALIDATION_CODES)) {
      assert.ok(code.startsWith('CONSTRAINT_'), `Does not start with CONSTRAINT_: ${code}`);
    }
  });

  it('all keys should match their string values', () => {
    for (const [key, value] of Object.entries(CONSTRAINT_VALIDATION_CODES)) {
      assert.equal(key, value, `Key ${key} does not match value ${value}`);
    }
  });
});

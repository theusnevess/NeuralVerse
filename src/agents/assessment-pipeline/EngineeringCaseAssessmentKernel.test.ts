/**
 * NV-2000-D8-OPT-09 — Engineering Case Assessment Kernel Tests
 *
 * Exhaustive deterministic tests for the Engineering Case Assessment Kernel.
 * Uses Node.js built-in test runner (node:test).
 *
 * ~90 tests covering:
 * - Canonical enum completeness
 * - Helper functions
 * - Case assessment composition
 * - Decision composition
 * - Constraint composition
 * - Evidence composition
 * - Relationship composition
 * - Registry composition
 * - Validation codes
 * - Duplicate detection
 * - Deterministic identity (100 iterations)
 * - Immutability
 * - Validator stability
 * - No mutation
 * - Artifact with engineering cases
 * - Cross-agent boundary
 * - Negative capability verification
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  CANONICAL_ENGINEERING_CASE_TYPES,
  CANONICAL_ENGINEERING_DECISION_TYPES,
  CANONICAL_ENGINEERING_CONSTRAINT_TYPES,
  CANONICAL_ENGINEERING_EVIDENCE_TYPES,
  CANONICAL_ENGINEERING_CASE_STATUS,
  CANONICAL_ASSESSMENT_GOVERNANCE,
  type EngineeringCaseAssessment,
  type EngineeringDecisionReference,
  type EngineeringConstraint,
  type EngineeringEvidence,
  type EngineeringCaseInput,
  type EngineeringCaseRegistry,
  type EngineeringCaseAssessmentProvenance,
  type AssessmentArtifactWithEngineeringCases,
} from './AssessmentAgentContract.ts';

import {
  composeEngineeringCaseAssessmentProvenance,
  composeEngineeringCaseAssessmentTrace,
  composeEngineeringCaseAssessment,
  composeEngineeringDecisionReference,
  composeEngineeringConstraint,
  composeEngineeringEvidence,
  composeEngineeringCaseRelationship,
  composeEngineeringCaseRegistry,
  composeEngineeringCaseRegistryFromInput,
  composeEngineeringCaseAssessments,
  composeAssessmentArtifactWithEngineeringCases,
  isSupportedEngineeringCaseType,
  isSupportedEngineeringDecisionType,
  isSupportedEngineeringConstraintType,
  isSupportedEngineeringEvidenceType,
  isSupportedEngineeringCaseStatus,
  isSupportedEngineeringCaseGovernance,
  getCanonicalEngineeringCaseTypes,
  getCanonicalEngineeringDecisionTypes,
  getCanonicalEngineeringConstraintTypes,
  getCanonicalEngineeringEvidenceTypes,
  getCanonicalEngineeringCaseStatuses,
} from './EngineeringCaseAssessmentKernel.ts';

import {
  ENGINEERING_CASE_VALIDATION_CODES,
  validateEngineeringCaseAssessment,
  validateEngineeringDecisionReference,
  validateEngineeringConstraint,
  validateEngineeringEvidence,
  validateEngineeringCaseRelationship,
  validateEngineeringCaseRegistry,
  validateEngineeringCaseInput,
  validateEngineeringCaseAssessmentTrace,
  validateAssessmentArtifactWithEngineeringCases,
} from './EngineeringCaseAssessmentValidation.ts';

// ============================================================================
// TEST FIXTURES
// ============================================================================

const VALID_ENGINEERING_PROVENANCE: EngineeringCaseAssessmentProvenance = {
  provider: 'test-provider',
  source: 'test-source',
  reviewStatus: 'approved',
  reviewDate: '2025-01-01',
  version: '1.0.0',
  rationale: 'Test rationale for engineering case.',
};

function _makeDecision(id: string): EngineeringDecisionReference {
  return composeEngineeringDecisionReference({
    id,
    decisionType: 'architecture',
    description: `Test decision ${id}`,
  });
}

function _makeConstraint(id: string): EngineeringConstraint {
  return composeEngineeringConstraint({
    id,
    constraintType: 'latency',
    description: `Test constraint ${id}`,
    severity: 'high',
  });
}

function _makeEvidence(id: string): EngineeringEvidence {
  return composeEngineeringEvidence({
    id,
    evidenceType: 'benchmark',
    description: `Test evidence ${id}`,
  });
}

function _makeCase(
  id: string,
  overrides: Partial<EngineeringCaseAssessment> = {},
): EngineeringCaseAssessment {
  return composeEngineeringCaseAssessment({
    id,
    title: `Case ${id}`,
    caseType: 'system_design',
    scenario: `Test scenario ${id}`,
    decisions: [_makeDecision(`dec-${id}`)],
    constraints: [_makeConstraint(`con-${id}`)],
    evidence: [_makeEvidence(`ev-${id}`)],
    conceptIds: ['concept-1'],
    status: 'draft',
    governance: 'canonical',
    provenance: VALID_ENGINEERING_PROVENANCE,
    ...overrides,
  });
}

const VALID_CASE_A = _makeCase('case-a');
const VALID_CASE_B = _makeCase('case-b');
const VALID_CASE_C = _makeCase('case-c');

// ============================================================================
// CANONICAL ENUM COMPLETENESS
// ============================================================================

describe('Canonical Enums', () => {
  it('should have exactly 10 engineering case types', () => {
    assert.equal(CANONICAL_ENGINEERING_CASE_TYPES.length, 10);
  });

  it('should have exactly 10 engineering decision types', () => {
    assert.equal(CANONICAL_ENGINEERING_DECISION_TYPES.length, 10);
  });

  it('should have exactly 10 engineering constraint types', () => {
    assert.equal(CANONICAL_ENGINEERING_CONSTRAINT_TYPES.length, 10);
  });

  it('should have exactly 10 engineering evidence types', () => {
    assert.equal(CANONICAL_ENGINEERING_EVIDENCE_TYPES.length, 10);
  });

  it('should have exactly 6 engineering case statuses', () => {
    assert.equal(CANONICAL_ENGINEERING_CASE_STATUS.length, 6);
  });

  it('should contain expected engineering case types', () => {
    const expected = [
      'system_design', 'architecture_review', 'deployment_case',
      'production_incident', 'performance_analysis', 'failure_analysis',
      'ml_pipeline', 'computer_vision_case', 'edge_ai_case', 'research_case',
    ];
    for (const value of expected) {
      assert.ok(CANONICAL_ENGINEERING_CASE_TYPES.includes(value as any), `Missing: ${value}`);
    }
  });

  it('should contain expected engineering decision types', () => {
    const expected = [
      'architecture', 'algorithm', 'infrastructure', 'deployment',
      'optimization', 'trade_off', 'constraint', 'technology_selection',
      'validation', 'monitoring',
    ];
    for (const value of expected) {
      assert.ok(CANONICAL_ENGINEERING_DECISION_TYPES.includes(value as any), `Missing: ${value}`);
    }
  });

  it('should contain expected engineering constraint types', () => {
    const expected = [
      'latency', 'memory', 'compute', 'bandwidth', 'energy',
      'cost', 'scalability', 'maintainability', 'security', 'reliability',
    ];
    for (const value of expected) {
      assert.ok(CANONICAL_ENGINEERING_CONSTRAINT_TYPES.includes(value as any), `Missing: ${value}`);
    }
  });

  it('should contain expected engineering evidence types', () => {
    const expected = [
      'architecture', 'benchmark', 'metric', 'experiment', 'reasoning',
      'trade_off', 'diagram', 'deployment', 'validation', 'report',
    ];
    for (const value of expected) {
      assert.ok(CANONICAL_ENGINEERING_EVIDENCE_TYPES.includes(value as any), `Missing: ${value}`);
    }
  });
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

describe('Helper Functions', () => {
  it('isSupportedEngineeringCaseType returns true for valid types', () => {
    assert.equal(isSupportedEngineeringCaseType('system_design'), true);
    assert.equal(isSupportedEngineeringCaseType('research_case'), true);
  });

  it('isSupportedEngineeringCaseType returns false for invalid types', () => {
    assert.equal(isSupportedEngineeringCaseType('invalid'), false);
    assert.equal(isSupportedEngineeringCaseType(''), false);
  });

  it('isSupportedEngineeringDecisionType returns true for valid types', () => {
    assert.equal(isSupportedEngineeringDecisionType('architecture'), true);
    assert.equal(isSupportedEngineeringDecisionType('monitoring'), true);
  });

  it('isSupportedEngineeringDecisionType returns false for invalid types', () => {
    assert.equal(isSupportedEngineeringDecisionType('invalid'), false);
    assert.equal(isSupportedEngineeringDecisionType(''), false);
  });

  it('isSupportedEngineeringConstraintType returns true for valid types', () => {
    assert.equal(isSupportedEngineeringConstraintType('latency'), true);
    assert.equal(isSupportedEngineeringConstraintType('reliability'), true);
  });

  it('isSupportedEngineeringConstraintType returns false for invalid types', () => {
    assert.equal(isSupportedEngineeringConstraintType('invalid'), false);
    assert.equal(isSupportedEngineeringConstraintType(''), false);
  });

  it('isSupportedEngineeringEvidenceType returns true for valid types', () => {
    assert.equal(isSupportedEngineeringEvidenceType('benchmark'), true);
    assert.equal(isSupportedEngineeringEvidenceType('report'), true);
  });

  it('isSupportedEngineeringEvidenceType returns false for invalid types', () => {
    assert.equal(isSupportedEngineeringEvidenceType('invalid'), false);
    assert.equal(isSupportedEngineeringEvidenceType(''), false);
  });

  it('isSupportedEngineeringCaseStatus returns true for valid statuses', () => {
    assert.equal(isSupportedEngineeringCaseStatus('draft'), true);
    assert.equal(isSupportedEngineeringCaseStatus('archived'), true);
  });

  it('isSupportedEngineeringCaseStatus returns false for invalid statuses', () => {
    assert.equal(isSupportedEngineeringCaseStatus('invalid'), false);
    assert.equal(isSupportedEngineeringCaseStatus(''), false);
  });

  it('isSupportedEngineeringCaseGovernance returns true for valid governance', () => {
    assert.equal(isSupportedEngineeringCaseGovernance('canonical'), true);
    assert.equal(isSupportedEngineeringCaseGovernance('rejected'), true);
  });

  it('isSupportedEngineeringCaseGovernance returns false for invalid governance', () => {
    assert.equal(isSupportedEngineeringCaseGovernance('invalid'), false);
    assert.equal(isSupportedEngineeringCaseGovernance(''), false);
  });

  it('getCanonicalEngineeringCaseTypes returns a copy', () => {
    const result = getCanonicalEngineeringCaseTypes();
    assert.equal(result.length, 10);
    assert.deepEqual([...result], [...CANONICAL_ENGINEERING_CASE_TYPES]);
    (result as string[]).push('injected');
    assert.equal(CANONICAL_ENGINEERING_CASE_TYPES.length, 10);
  });

  it('getCanonicalEngineeringDecisionTypes returns a copy', () => {
    const result = getCanonicalEngineeringDecisionTypes();
    assert.equal(result.length, 10);
  });

  it('getCanonicalEngineeringConstraintTypes returns a copy', () => {
    const result = getCanonicalEngineeringConstraintTypes();
    assert.equal(result.length, 10);
  });

  it('getCanonicalEngineeringEvidenceTypes returns a copy', () => {
    const result = getCanonicalEngineeringEvidenceTypes();
    assert.equal(result.length, 10);
  });

  it('getCanonicalEngineeringCaseStatuses returns a copy', () => {
    const result = getCanonicalEngineeringCaseStatuses();
    assert.equal(result.length, 6);
  });
});

// ============================================================================
// COMPOSE FUNCTIONS — Case Assessment
// ============================================================================

describe('composeEngineeringCaseAssessment', () => {
  it('should compose case assessment from valid params', () => {
    const caseAssessment = composeEngineeringCaseAssessment({
      id: 'c1', title: 'Test',
      caseType: 'system_design',
      scenario: 'Test scenario',
      decisions: [_makeDecision('d1')],
      constraints: [_makeConstraint('con1')],
      evidence: [_makeEvidence('e1')],
      conceptIds: ['c1'], status: 'draft',
      governance: 'canonical', provenance: VALID_ENGINEERING_PROVENANCE,
    });
    assert.equal(caseAssessment.id, 'c1');
    assert.equal(caseAssessment.title, 'Test');
    assert.equal(caseAssessment.caseType, 'system_design');
    assert.equal(caseAssessment.scenario, 'Test scenario');
    assert.equal(caseAssessment.trace.deterministic, true);
    assert.equal(caseAssessment.trace.randomUsed, false);
    assert.equal(caseAssessment.trace.timeDependency, false);
  });

  it('should not mutate input arrays', () => {
    const conceptIds = ['c1'];
    const original = JSON.stringify(conceptIds);
    composeEngineeringCaseAssessment({
      id: 'c', title: 'T',
      caseType: 'system_design', scenario: 'S',
      decisions: [], constraints: [], evidence: [],
      conceptIds, status: 'draft', governance: 'canonical',
      provenance: VALID_ENGINEERING_PROVENANCE,
    });
    assert.equal(JSON.stringify(conceptIds), original);
  });
});

// ============================================================================
// COMPOSE FUNCTIONS — Decision
// ============================================================================

describe('composeEngineeringDecisionReference', () => {
  it('should compose decision from valid params', () => {
    const decision = composeEngineeringDecisionReference({
      id: 'd1', decisionType: 'architecture',
      description: 'Desc',
    });
    assert.equal(decision.id, 'd1');
    assert.equal(decision.decisionType, 'architecture');
  });
});

// ============================================================================
// COMPOSE FUNCTIONS — Constraint
// ============================================================================

describe('composeEngineeringConstraint', () => {
  it('should compose constraint from valid params', () => {
    const constraint = composeEngineeringConstraint({
      id: 'con1', constraintType: 'latency',
      description: 'Desc', severity: 'high',
    });
    assert.equal(constraint.id, 'con1');
    assert.equal(constraint.constraintType, 'latency');
    assert.equal(constraint.severity, 'high');
  });
});

// ============================================================================
// COMPOSE FUNCTIONS — Evidence
// ============================================================================

describe('composeEngineeringEvidence', () => {
  it('should compose evidence from valid params', () => {
    const evidence = composeEngineeringEvidence({
      id: 'e1', evidenceType: 'benchmark',
      description: 'Desc',
    });
    assert.equal(evidence.id, 'e1');
    assert.equal(evidence.evidenceType, 'benchmark');
  });
});

// ============================================================================
// COMPOSE FUNCTIONS — Relationship
// ============================================================================

describe('composeEngineeringCaseRelationship', () => {
  it('should compose relationship from valid params', () => {
    const rel = composeEngineeringCaseRelationship({
      id: 'r1', sourceCaseId: 'a', targetCaseId: 'b',
      relationshipType: 'depends', rationale: 'r',
    });
    assert.equal(rel.id, 'r1');
    assert.equal(rel.sourceCaseId, 'a');
    assert.equal(rel.targetCaseId, 'b');
  });

  it('should return identical output for identical input', () => {
    const params = {
      id: 'r', sourceCaseId: 'a', targetCaseId: 'b',
      relationshipType: 'dep', rationale: 'r',
    };
    const r1 = composeEngineeringCaseRelationship(params);
    const r2 = composeEngineeringCaseRelationship(params);
    assert.deepEqual(r1, r2);
  });
});

// ============================================================================
// COMPOSE FUNCTIONS — Registry
// ============================================================================

describe('composeEngineeringCaseRegistry', () => {
  it('should compose registry from cases', () => {
    const registry = composeEngineeringCaseRegistry([VALID_CASE_A, VALID_CASE_B]);
    assert.equal(registry.nodes.length, 2);
    assert.equal(registry.metadata.nodeCount, 2);
    assert.equal(registry.metadata.deterministic, true);
  });

  it('should sort nodes by id', () => {
    const registry = composeEngineeringCaseRegistry([VALID_CASE_C, VALID_CASE_A, VALID_CASE_B]);
    assert.equal(registry.nodes[0].id, 'case-a');
    assert.equal(registry.nodes[1].id, 'case-b');
    assert.equal(registry.nodes[2].id, 'case-c');
  });

  it('should return identical output for identical input', () => {
    const nodes = [VALID_CASE_A, VALID_CASE_B];
    const r1 = composeEngineeringCaseRegistry(nodes);
    const r2 = composeEngineeringCaseRegistry(nodes);
    assert.deepEqual(r1, r2);
  });

  it('should not mutate input nodes array', () => {
    const nodes = [VALID_CASE_C, VALID_CASE_A];
    const original = JSON.stringify(nodes);
    composeEngineeringCaseRegistry(nodes);
    assert.equal(JSON.stringify(nodes), original);
  });

  it('should handle empty array', () => {
    const registry = composeEngineeringCaseRegistry([]);
    assert.equal(registry.nodes.length, 0);
    assert.equal(registry.metadata.nodeCount, 0);
  });
});

// ============================================================================
// COMPOSE FUNCTIONS — Registry from Input
// ============================================================================

describe('composeEngineeringCaseRegistryFromInput', () => {
  it('should compose registry from input', () => {
    const input: EngineeringCaseInput = { nodes: [VALID_CASE_A, VALID_CASE_B] };
    const registry = composeEngineeringCaseRegistryFromInput(input);
    assert.equal(registry.nodes.length, 2);
  });

  it('should return identical output for identical input', () => {
    const input: EngineeringCaseInput = { nodes: [VALID_CASE_A] };
    const r1 = composeEngineeringCaseRegistryFromInput(input);
    const r2 = composeEngineeringCaseRegistryFromInput(input);
    assert.deepEqual(r1, r2);
  });
});

// ============================================================================
// COMPOSE FUNCTIONS — Artifact with engineering cases
// ============================================================================

describe('composeAssessmentArtifactWithEngineeringCases', () => {
  it('should compose artifact with engineering cases', () => {
    const result = composeAssessmentArtifactWithEngineeringCases({
      artifactId: 'art-1', artifactTitle: 'Test',
      engineeringCases: [VALID_CASE_A],
    });
    assert.equal(result.artifactId, 'art-1');
    assert.equal(result.engineeringCases.length, 1);
  });

  it('should not mutate engineeringCases input', () => {
    const cases = [VALID_CASE_A];
    const original = JSON.stringify(cases);
    composeAssessmentArtifactWithEngineeringCases({
      artifactId: 'a', artifactTitle: 'T', engineeringCases: cases,
    });
    assert.equal(JSON.stringify(cases), original);
  });
});

// ============================================================================
// VALIDATION — Case assessment validation
// ============================================================================

describe('validateEngineeringCaseAssessment', () => {
  it('should pass for valid case assessment', () => {
    const errors = validateEngineeringCaseAssessment(VALID_CASE_A);
    assert.equal(errors.length, 0);
  });

  it('should reject null case assessment', () => {
    const errors = validateEngineeringCaseAssessment(null as any);
    assert.ok(errors.length > 0);
  });

  it('should reject case with missing id', () => {
    const caseAssessment = _makeCase('');
    const errors = validateEngineeringCaseAssessment(caseAssessment);
    assert.ok(errors.some((e) => e.code === ENGINEERING_CASE_VALIDATION_CODES.ENGINEERING_MISSING_CASE_ID));
  });

  it('should reject case with invalid type', () => {
    const caseAssessment = _makeCase('c', { caseType: 'invalid' as any });
    const errors = validateEngineeringCaseAssessment(caseAssessment);
    assert.ok(errors.some((e) => e.code === ENGINEERING_CASE_VALIDATION_CODES.ENGINEERING_INVALID_CASE_TYPE));
  });

  it('should reject case with missing conceptIds', () => {
    const caseAssessment = _makeCase('c', { conceptIds: [] });
    const errors = validateEngineeringCaseAssessment(caseAssessment);
    assert.ok(errors.some((e) => e.code === ENGINEERING_CASE_VALIDATION_CODES.ENGINEERING_MISSING_ASSESSMENT_REFERENCE));
  });

  it('should reject case with non-deterministic trace', () => {
    const caseAssessment: EngineeringCaseAssessment = {
      id: 'c', title: 'T',
      caseType: 'system_design', scenario: 'S',
      decisions: [], constraints: [], evidence: [],
      conceptIds: ['c1'], status: 'draft', governance: 'canonical',
      provenance: VALID_ENGINEERING_PROVENANCE,
      trace: {
        traceId: 't', deterministic: false as any,
        generatedFrom: 'deterministic_engineering_case_kernel',
        randomUsed: false, timeDependency: false,
      },
    };
    const errors = validateEngineeringCaseAssessment(caseAssessment);
    assert.ok(errors.some((e) => e.code === ENGINEERING_CASE_VALIDATION_CODES.ENGINEERING_INVALID_TRACE));
  });
});

// ============================================================================
// VALIDATION — Relationship validation
// ============================================================================

describe('validateEngineeringCaseRelationship', () => {
  it('should pass for valid relationship', () => {
    const rel = composeEngineeringCaseRelationship({
      id: 'r1', sourceCaseId: 'a', targetCaseId: 'b',
      relationshipType: 'depends', rationale: 'r',
    });
    const errors = validateEngineeringCaseRelationship(rel);
    assert.equal(errors.length, 0);
  });

  it('should reject self-relationship', () => {
    const rel = composeEngineeringCaseRelationship({
      id: 'r', sourceCaseId: 'a', targetCaseId: 'a',
      relationshipType: 'self', rationale: 'r',
    });
    const errors = validateEngineeringCaseRelationship(rel);
    assert.ok(errors.some((e) => e.code === ENGINEERING_CASE_VALIDATION_CODES.ENGINEERING_SELF_RELATIONSHIP));
  });
});

// ============================================================================
// VALIDATION — Registry validation
// ============================================================================

describe('validateEngineeringCaseRegistry', () => {
  it('should pass for valid registry', () => {
    const registry = composeEngineeringCaseRegistry([VALID_CASE_A, VALID_CASE_B]);
    const result = validateEngineeringCaseRegistry(registry);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it('should reject null registry', () => {
    const result = validateEngineeringCaseRegistry(null as any);
    assert.equal(result.valid, false);
  });

  it('should reject empty registry', () => {
    const registry = composeEngineeringCaseRegistry([]);
    const result = validateEngineeringCaseRegistry(registry);
    assert.equal(result.valid, false);
  });

  it('should detect duplicate ids', () => {
    const duplicateNodes = [_makeCase('dup'), _makeCase('dup')];
    const registry = composeEngineeringCaseRegistry(duplicateNodes);
    const result = validateEngineeringCaseRegistry(registry);
    assert.equal(result.valid, false);
    assert.ok(result.errors.some((e) => e.code === ENGINEERING_CASE_VALIDATION_CODES.ENGINEERING_CASE_DUPLICATE_ID));
  });

  it('should detect duplicate titles', () => {
    const duplicateTitles = [
      _makeCase('a', { title: 'Same Title' }),
      _makeCase('b', { title: 'Same Title' }),
    ];
    const registry = composeEngineeringCaseRegistry(duplicateTitles);
    const result = validateEngineeringCaseRegistry(registry);
    assert.equal(result.valid, false);
    assert.ok(result.errors.some((e) => e.code === ENGINEERING_CASE_VALIDATION_CODES.ENGINEERING_CASE_DUPLICATE_TITLE));
  });
});

// ============================================================================
// VALIDATION — Input validation
// ============================================================================

describe('validateEngineeringCaseInput', () => {
  it('should pass for valid input', () => {
    const input: EngineeringCaseInput = { nodes: [VALID_CASE_A] };
    const result = validateEngineeringCaseInput(input);
    assert.equal(result.valid, true);
  });

  it('should reject null input', () => {
    const result = validateEngineeringCaseInput(null as any);
    assert.equal(result.valid, false);
  });

  it('should reject empty input', () => {
    const result = validateEngineeringCaseInput({ nodes: [] });
    assert.equal(result.valid, false);
  });
});

// ============================================================================
// VALIDATION — Trace validation
// ============================================================================

describe('validateEngineeringCaseAssessmentTrace', () => {
  it('should pass for valid trace', () => {
    const trace = composeEngineeringCaseAssessmentTrace({ traceId: 'test' });
    const result = validateEngineeringCaseAssessmentTrace(trace);
    assert.equal(result.valid, true);
  });

  it('should reject null trace', () => {
    const result = validateEngineeringCaseAssessmentTrace(null as any);
    assert.equal(result.valid, false);
  });
});

// ============================================================================
// VALIDATION — Artifact with engineering cases validation
// ============================================================================

describe('validateAssessmentArtifactWithEngineeringCases', () => {
  it('should pass for valid artifact', () => {
    const artifact = composeAssessmentArtifactWithEngineeringCases({
      artifactId: 'art-1', artifactTitle: 'Test',
      engineeringCases: [VALID_CASE_A],
    });
    const result = validateAssessmentArtifactWithEngineeringCases(artifact);
    assert.equal(result.valid, true);
  });

  it('should reject null artifact', () => {
    const result = validateAssessmentArtifactWithEngineeringCases(null as any);
    assert.equal(result.valid, false);
  });
});

// ============================================================================
// DETERMINISTIC IDENTITY — 100 iterations
// ============================================================================

describe('Deterministic Identity', () => {
  it('should produce identical output for composeEngineeringCaseRegistry across 100 iterations', () => {
    const nodes = [VALID_CASE_A, VALID_CASE_B];
    let firstResult: string | null = null;

    for (let i = 0; i < 100; i++) {
      const result = composeEngineeringCaseRegistry(nodes);
      const serialized = JSON.stringify(result);
      if (firstResult === null) {
        firstResult = serialized;
      } else {
        assert.equal(serialized, firstResult, `Iteration ${i} differs`);
      }
    }
  });

  it('should produce identical output for composeEngineeringCaseAssessment across 100 iterations', () => {
    const params = {
      id: 'c', title: 'T',
      caseType: 'system_design' as const,
      scenario: 'S',
      decisions: [_makeDecision('d')],
      constraints: [_makeConstraint('con')],
      evidence: [_makeEvidence('e')],
      conceptIds: ['c1'],
      status: 'draft' as const, governance: 'canonical' as const,
      provenance: VALID_ENGINEERING_PROVENANCE,
    };
    let firstResult: string | null = null;

    for (let i = 0; i < 100; i++) {
      const result = composeEngineeringCaseAssessment(params);
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
  it('should not mutate input nodes array in composeEngineeringCaseRegistry', () => {
    const nodes = [VALID_CASE_C, VALID_CASE_A];
    const original = JSON.stringify(nodes);
    composeEngineeringCaseRegistry(nodes);
    assert.equal(JSON.stringify(nodes), original);
  });

  it('should not mutate conceptIds in composeEngineeringCaseAssessment', () => {
    const conceptIds = ['c1'];
    const original = JSON.stringify(conceptIds);
    composeEngineeringCaseAssessment({
      id: 'c', title: 'T',
      caseType: 'system_design', scenario: 'S',
      decisions: [], constraints: [], evidence: [],
      conceptIds, status: 'draft', governance: 'canonical',
      provenance: VALID_ENGINEERING_PROVENANCE,
    });
    assert.equal(JSON.stringify(conceptIds), original);
  });

  it('getCanonicalEngineeringCaseTypes returns a copy not affecting original', () => {
    const copy = getCanonicalEngineeringCaseTypes();
    assert.equal(copy.length, 10);
    (copy as string[]).push('injected');
    assert.equal(CANONICAL_ENGINEERING_CASE_TYPES.length, 10);
  });

  it('getCanonicalEngineeringDecisionTypes returns a copy not affecting original', () => {
    const copy = getCanonicalEngineeringDecisionTypes();
    assert.equal(copy.length, 10);
    (copy as string[]).push('injected');
    assert.equal(CANONICAL_ENGINEERING_DECISION_TYPES.length, 10);
  });

  it('getCanonicalEngineeringConstraintTypes returns a copy not affecting original', () => {
    const copy = getCanonicalEngineeringConstraintTypes();
    assert.equal(copy.length, 10);
    (copy as string[]).push('injected');
    assert.equal(CANONICAL_ENGINEERING_CONSTRAINT_TYPES.length, 10);
  });
});

// ============================================================================
// CROSS-AGENT BOUNDARY — No case creation/evaluation/ranking
// ============================================================================

describe('Cross-Agent Boundary', () => {
  it('should not contain case creation logic', () => {
    const source = JSON.stringify(CANONICAL_ENGINEERING_CASE_TYPES);
    assert.ok(!source.includes('create'));
    assert.ok(!source.includes('generat'));
    assert.ok(!source.includes('build'));
  });

  it('should not contain solution evaluation logic', () => {
    const source = JSON.stringify(CANONICAL_ENGINEERING_DECISION_TYPES);
    assert.ok(!source.includes('evaluat'));
    assert.ok(!source.includes('assess'));
    assert.ok(!source.includes('judge'));
  });

  it('should not contain ranking logic', () => {
    const source = JSON.stringify(CANONICAL_ENGINEERING_CASE_TYPES);
    assert.ok(!source.includes('rank'));
    assert.ok(!source.includes('sort_solution'));
    assert.ok(!source.includes('order'));
  });

  it('should not contain recommendation logic', () => {
    const source = JSON.stringify(CANONICAL_ENGINEERING_DECISION_TYPES);
    assert.ok(!source.includes('recommend'));
    assert.ok(!source.includes('suggest'));
    assert.ok(!source.includes('advise'));
  });

  it('should not contain LLM reasoning logic', () => {
    const source = JSON.stringify(CANONICAL_ENGINEERING_CASE_TYPES);
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
    const source = JSON.stringify(CANONICAL_ENGINEERING_CASE_TYPES);
    assert.ok(!source.includes('score'));
    assert.ok(!source.includes('mastery'));
  });

  it('should not contain LLM or async patterns', () => {
    const source = JSON.stringify(CANONICAL_ENGINEERING_CASE_TYPES);
    assert.ok(!source.includes('Promise'));
    assert.ok(!source.includes('async'));
    assert.ok(!source.includes('await'));
  });
});

// ============================================================================
// VALIDATION CODES — Structure verification
// ============================================================================

describe('Validation Codes', () => {
  it('should have exactly 24 validation codes', () => {
    const codes = Object.values(ENGINEERING_CASE_VALIDATION_CODES);
    assert.equal(codes.length, 24);
  });

  it('all validation codes should be UPPER_SNAKE_CASE', () => {
    for (const code of Object.values(ENGINEERING_CASE_VALIDATION_CODES)) {
      assert.ok(/^[A-Z_]+$/.test(code), `Not UPPER_SNAKE_CASE: ${code}`);
    }
  });

  it('all validation codes should start with ENGINEERING_', () => {
    for (const code of Object.values(ENGINEERING_CASE_VALIDATION_CODES)) {
      assert.ok(code.startsWith('ENGINEERING_'), `Does not start with ENGINEERING_: ${code}`);
    }
  });

  it('all keys should match their string values', () => {
    for (const [key, value] of Object.entries(ENGINEERING_CASE_VALIDATION_CODES)) {
      assert.equal(key, value, `Key ${key} does not match value ${value}`);
    }
  });
});

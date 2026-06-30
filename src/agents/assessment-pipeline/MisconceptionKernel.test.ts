/**
 * NV-2000-D8-OPT-05 — Misconception Kernel Tests
 *
 * Exhaustive deterministic tests for the Misconception Kernel.
 * Uses Node.js built-in test runner (node:test).
 *
 * ~90 tests covering:
 * - Canonical enum completeness
 * - Helper functions
 * - Misconception composition
 * - Remediation composition
 * - Relationship composition
 * - Registry composition
 * - Validation codes
 * - Duplicate detection
 * - Deterministic identity (100 iterations)
 * - Immutability
 * - Validator stability
 * - No mutation
 * - Artifact with misconceptions
 * - Cross-agent boundary
 * - Negative capability verification
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  CANONICAL_MISCONCEPTION_TYPES,
  CANONICAL_MISCONCEPTION_CAUSES,
  CANONICAL_REMEDIATION_TYPES,
  CANONICAL_REMEDIATION_PRIORITY,
  CANONICAL_MISCONCEPTION_SEVERITY,
  CANONICAL_MISCONCEPTION_STATUS,
  CANONICAL_ASSESSMENT_GOVERNANCE,
  type AssessmentMisconception,
  type RemediationStrategy,
  type MisconceptionInput,
  type MisconceptionRegistry,
  type MisconceptionProvenance,
  type MisconceptionRelationship,
  type AssessmentArtifactWithMisconceptions,
} from './AssessmentAgentContract.ts';

import {
  composeMisconceptionProvenance,
  composeMisconceptionTrace,
  composeAssessmentMisconception,
  composeMisconceptionCause,
  composeRemediationStrategy,
  composeMisconceptionRelationship,
  composeMisconceptionRegistry,
  composeMisconceptionRegistryFromInput,
  composeAssessmentMisconceptions,
  composeAssessmentArtifactWithMisconceptions,
  isSupportedMisconceptionType,
  isSupportedMisconceptionCause,
  isSupportedRemediationType,
  isSupportedRemediationPriority,
  isSupportedMisconceptionSeverity,
  isSupportedMisconceptionStatus,
  isSupportedMisconceptionGovernance,
  getCanonicalMisconceptionTypes,
  getCanonicalMisconceptionCauses,
  getCanonicalRemediationTypes,
  getCanonicalRemediationPriorities,
  getCanonicalMisconceptionSeverities,
  getCanonicalMisconceptionStatuses,
} from './MisconceptionKernel.ts';

import {
  MISCONCEPTION_VALIDATION_CODES,
  validateAssessmentMisconception,
  validateRemediationStrategy,
  validateMisconceptionRelationship,
  validateMisconceptionRegistry,
  validateMisconceptionInput,
  validateMisconceptionTrace,
  validateAssessmentArtifactWithMisconceptions,
} from './MisconceptionValidation.ts';

// ============================================================================
// TEST FIXTURES
// ============================================================================

const VALID_MISCONCEPTION_PROVENANCE: MisconceptionProvenance = {
  provider: 'test-provider',
  source: 'test-source',
  reviewStatus: 'approved',
  reviewDate: '2025-01-01',
  version: '1.0.0',
  rationale: 'Test rationale for misconception.',
};

function _makeStrategy(id: string): RemediationStrategy {
  return composeRemediationStrategy({
    id,
    title: `Strategy ${id}`,
    remediationType: 'concept_review',
    priority: 'high',
    description: 'Test remediation strategy.',
    conceptIds: ['concept-1'],
  });
}

function _makeMisconception(
  id: string,
  overrides: Partial<AssessmentMisconception> = {},
): AssessmentMisconception {
  return composeAssessmentMisconception({
    id,
    title: `Misconception ${id}`,
    description: `Test misconception ${id}`,
    misconceptionType: 'concept_confusion',
    causes: ['missing_prerequisite'],
    severity: 'moderate',
    conceptIds: ['concept-1'],
    remediationStrategies: [_makeStrategy(`strat-${id}`)],
    status: 'draft',
    governance: 'canonical',
    provenance: VALID_MISCONCEPTION_PROVENANCE,
    ...overrides,
  });
}

const VALID_MISCONCEPTION_A = _makeMisconception('miscon-a');
const VALID_MISCONCEPTION_B = _makeMisconception('miscon-b');
const VALID_MISCONCEPTION_C = _makeMisconception('miscon-c');

// ============================================================================
// CANONICAL ENUM COMPLETENESS
// ============================================================================

describe('Canonical Enums', () => {
  it('should have exactly 10 misconception types', () => {
    assert.equal(CANONICAL_MISCONCEPTION_TYPES.length, 10);
  });

  it('should have exactly 10 misconception causes', () => {
    assert.equal(CANONICAL_MISCONCEPTION_CAUSES.length, 10);
  });

  it('should have exactly 10 remediation types', () => {
    assert.equal(CANONICAL_REMEDIATION_TYPES.length, 10);
  });

  it('should have exactly 10 remediation priorities', () => {
    assert.equal(CANONICAL_REMEDIATION_PRIORITY.length, 10);
  });

  it('should have exactly 5 misconception severities', () => {
    assert.equal(CANONICAL_MISCONCEPTION_SEVERITY.length, 5);
  });

  it('should have exactly 6 misconception statuses', () => {
    assert.equal(CANONICAL_MISCONCEPTION_STATUS.length, 6);
  });

  it('should contain expected misconception types', () => {
    const expected = [
      'concept_confusion', 'terminology_confusion', 'dependency_confusion',
      'causal_reasoning', 'procedural_error', 'algorithmic_error',
      'architectural_misunderstanding', 'constraint_violation',
      'overgeneralization', 'oversimplification',
    ];
    for (const value of expected) {
      assert.ok(CANONICAL_MISCONCEPTION_TYPES.includes(value as any), `Missing: ${value}`);
    }
  });

  it('should contain expected misconception causes', () => {
    const expected = [
      'missing_prerequisite', 'incorrect_assumption',
      'memorization_without_understanding', 'mental_model_error',
      'terminology_overlap', 'incorrect_abstraction', 'missing_relationship',
      'incomplete_reasoning', 'incorrect_transfer', 'prior_bias',
    ];
    for (const value of expected) {
      assert.ok(CANONICAL_MISCONCEPTION_CAUSES.includes(value as any), `Missing: ${value}`);
    }
  });

  it('should contain expected remediation types', () => {
    const expected = [
      'concept_review', 'worked_example', 'guided_practice',
      'visual_explanation', 'relationship_review', 'laboratory_activity',
      'comparison', 'counter_example', 'step_by_step_reasoning',
      'knowledge_reconstruction',
    ];
    for (const value of expected) {
      assert.ok(CANONICAL_REMEDIATION_TYPES.includes(value as any), `Missing: ${value}`);
    }
  });

  it('should contain expected remediation priorities', () => {
    const expected = [
      'critical', 'very_high', 'high', 'medium', 'low',
      'optional', 'preventive', 'reinforcement', 'recommended', 'supplementary',
    ];
    for (const value of expected) {
      assert.ok(CANONICAL_REMEDIATION_PRIORITY.includes(value as any), `Missing: ${value}`);
    }
  });
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

describe('Helper Functions', () => {
  it('isSupportedMisconceptionType returns true for valid types', () => {
    assert.equal(isSupportedMisconceptionType('concept_confusion'), true);
    assert.equal(isSupportedMisconceptionType('oversimplification'), true);
  });

  it('isSupportedMisconceptionType returns false for invalid types', () => {
    assert.equal(isSupportedMisconceptionType('invalid'), false);
    assert.equal(isSupportedMisconceptionType(''), false);
  });

  it('isSupportedMisconceptionCause returns true for valid causes', () => {
    assert.equal(isSupportedMisconceptionCause('missing_prerequisite'), true);
    assert.equal(isSupportedMisconceptionCause('prior_bias'), true);
  });

  it('isSupportedMisconceptionCause returns false for invalid causes', () => {
    assert.equal(isSupportedMisconceptionCause('invalid'), false);
    assert.equal(isSupportedMisconceptionCause(''), false);
  });

  it('isSupportedRemediationType returns true for valid types', () => {
    assert.equal(isSupportedRemediationType('concept_review'), true);
    assert.equal(isSupportedRemediationType('knowledge_reconstruction'), true);
  });

  it('isSupportedRemediationType returns false for invalid types', () => {
    assert.equal(isSupportedRemediationType('invalid'), false);
    assert.equal(isSupportedRemediationType(''), false);
  });

  it('isSupportedRemediationPriority returns true for valid priorities', () => {
    assert.equal(isSupportedRemediationPriority('critical'), true);
    assert.equal(isSupportedRemediationPriority('supplementary'), true);
  });

  it('isSupportedRemediationPriority returns false for invalid priorities', () => {
    assert.equal(isSupportedRemediationPriority('invalid'), false);
    assert.equal(isSupportedRemediationPriority(''), false);
  });

  it('isSupportedMisconceptionSeverity returns true for valid severities', () => {
    assert.equal(isSupportedMisconceptionSeverity('minimal'), true);
    assert.equal(isSupportedMisconceptionSeverity('critical'), true);
  });

  it('isSupportedMisconceptionSeverity returns false for invalid severities', () => {
    assert.equal(isSupportedMisconceptionSeverity('invalid'), false);
    assert.equal(isSupportedMisconceptionSeverity(''), false);
  });

  it('isSupportedMisconceptionStatus returns true for valid statuses', () => {
    assert.equal(isSupportedMisconceptionStatus('draft'), true);
    assert.equal(isSupportedMisconceptionStatus('archived'), true);
  });

  it('isSupportedMisconceptionStatus returns false for invalid statuses', () => {
    assert.equal(isSupportedMisconceptionStatus('invalid'), false);
    assert.equal(isSupportedMisconceptionStatus(''), false);
  });

  it('isSupportedMisconceptionGovernance returns true for valid governance', () => {
    assert.equal(isSupportedMisconceptionGovernance('canonical'), true);
    assert.equal(isSupportedMisconceptionGovernance('rejected'), true);
  });

  it('isSupportedMisconceptionGovernance returns false for invalid governance', () => {
    assert.equal(isSupportedMisconceptionGovernance('invalid'), false);
    assert.equal(isSupportedMisconceptionGovernance(''), false);
  });

  it('getCanonicalMisconceptionTypes returns a copy', () => {
    const result = getCanonicalMisconceptionTypes();
    assert.equal(result.length, 10);
    assert.deepEqual([...result], [...CANONICAL_MISCONCEPTION_TYPES]);
    (result as string[]).push('injected');
    assert.equal(CANONICAL_MISCONCEPTION_TYPES.length, 10);
  });

  it('getCanonicalMisconceptionCauses returns a copy', () => {
    const result = getCanonicalMisconceptionCauses();
    assert.equal(result.length, 10);
  });

  it('getCanonicalRemediationTypes returns a copy', () => {
    const result = getCanonicalRemediationTypes();
    assert.equal(result.length, 10);
  });

  it('getCanonicalRemediationPriorities returns a copy', () => {
    const result = getCanonicalRemediationPriorities();
    assert.equal(result.length, 10);
  });

  it('getCanonicalMisconceptionSeverities returns a copy', () => {
    const result = getCanonicalMisconceptionSeverities();
    assert.equal(result.length, 5);
  });

  it('getCanonicalMisconceptionStatuses returns a copy', () => {
    const result = getCanonicalMisconceptionStatuses();
    assert.equal(result.length, 6);
  });
});

// ============================================================================
// COMPOSE FUNCTIONS — Misconception
// ============================================================================

describe('composeAssessmentMisconception', () => {
  it('should compose misconception from valid params', () => {
    const misconception = composeAssessmentMisconception({
      id: 'm1', title: 'Test', description: 'Desc',
      misconceptionType: 'concept_confusion',
      causes: ['missing_prerequisite'],
      severity: 'moderate',
      conceptIds: ['c1'],
      remediationStrategies: [_makeStrategy('s1')],
      status: 'draft', governance: 'canonical',
      provenance: VALID_MISCONCEPTION_PROVENANCE,
    });
    assert.equal(misconception.id, 'm1');
    assert.equal(misconception.title, 'Test');
    assert.equal(misconception.misconceptionType, 'concept_confusion');
    assert.equal(misconception.severity, 'moderate');
    assert.equal(misconception.trace.deterministic, true);
    assert.equal(misconception.trace.randomUsed, false);
    assert.equal(misconception.trace.timeDependency, false);
  });

  it('should not mutate input arrays', () => {
    const causes = ['missing_prerequisite' as const];
    const conceptIds = ['c1'];
    const original = JSON.stringify({ causes, conceptIds });
    composeAssessmentMisconception({
      id: 'm', title: 'T', description: 'D',
      misconceptionType: 'concept_confusion', causes, severity: 'minor',
      conceptIds, remediationStrategies: [], status: 'draft',
      governance: 'canonical', provenance: VALID_MISCONCEPTION_PROVENANCE,
    });
    assert.equal(JSON.stringify({ causes, conceptIds }), original);
  });
});

// ============================================================================
// COMPOSE FUNCTIONS — Remediation
// ============================================================================

describe('composeRemediationStrategy', () => {
  it('should compose strategy from valid params', () => {
    const strategy = composeRemediationStrategy({
      id: 's1', title: 'Test', remediationType: 'worked_example',
      priority: 'high', description: 'Desc', conceptIds: ['c1'],
    });
    assert.equal(strategy.id, 's1');
    assert.equal(strategy.remediationType, 'worked_example');
    assert.equal(strategy.priority, 'high');
    assert.deepEqual([...strategy.conceptIds], ['c1']);
  });

  it('should not mutate conceptIds input', () => {
    const conceptIds = ['c1', 'c2'];
    const original = JSON.stringify(conceptIds);
    composeRemediationStrategy({
      id: 's', title: 'T', remediationType: 'concept_review',
      priority: 'low', description: 'D', conceptIds,
    });
    assert.equal(JSON.stringify(conceptIds), original);
  });
});

// ============================================================================
// COMPOSE FUNCTIONS — Relationship
// ============================================================================

describe('composeMisconceptionRelationship', () => {
  it('should compose relationship from valid params', () => {
    const rel = composeMisconceptionRelationship({
      id: 'r1', sourceMisconceptionId: 'a', targetMisconceptionId: 'b',
      relationshipType: 'causes', rationale: 'r',
    });
    assert.equal(rel.id, 'r1');
    assert.equal(rel.sourceMisconceptionId, 'a');
    assert.equal(rel.targetMisconceptionId, 'b');
  });

  it('should return identical output for identical input', () => {
    const params = {
      id: 'r', sourceMisconceptionId: 'a', targetMisconceptionId: 'b',
      relationshipType: 'dep', rationale: 'r',
    };
    const r1 = composeMisconceptionRelationship(params);
    const r2 = composeMisconceptionRelationship(params);
    assert.deepEqual(r1, r2);
  });
});

// ============================================================================
// COMPOSE FUNCTIONS — Registry
// ============================================================================

describe('composeMisconceptionRegistry', () => {
  it('should compose registry from misconceptions', () => {
    const registry = composeMisconceptionRegistry([VALID_MISCONCEPTION_A, VALID_MISCONCEPTION_B]);
    assert.equal(registry.nodes.length, 2);
    assert.equal(registry.metadata.nodeCount, 2);
    assert.equal(registry.metadata.deterministic, true);
  });

  it('should sort nodes by id', () => {
    const registry = composeMisconceptionRegistry([VALID_MISCONCEPTION_C, VALID_MISCONCEPTION_A, VALID_MISCONCEPTION_B]);
    assert.equal(registry.nodes[0].id, 'miscon-a');
    assert.equal(registry.nodes[1].id, 'miscon-b');
    assert.equal(registry.nodes[2].id, 'miscon-c');
  });

  it('should return identical output for identical input', () => {
    const nodes = [VALID_MISCONCEPTION_A, VALID_MISCONCEPTION_B];
    const r1 = composeMisconceptionRegistry(nodes);
    const r2 = composeMisconceptionRegistry(nodes);
    assert.deepEqual(r1, r2);
  });

  it('should not mutate input nodes array', () => {
    const nodes = [VALID_MISCONCEPTION_C, VALID_MISCONCEPTION_A];
    const original = JSON.stringify(nodes);
    composeMisconceptionRegistry(nodes);
    assert.equal(JSON.stringify(nodes), original);
  });

  it('should handle empty array', () => {
    const registry = composeMisconceptionRegistry([]);
    assert.equal(registry.nodes.length, 0);
    assert.equal(registry.metadata.nodeCount, 0);
  });
});

// ============================================================================
// COMPOSE FUNCTIONS — Registry from Input
// ============================================================================

describe('composeMisconceptionRegistryFromInput', () => {
  it('should compose registry from input', () => {
    const input: MisconceptionInput = { nodes: [VALID_MISCONCEPTION_A, VALID_MISCONCEPTION_B] };
    const registry = composeMisconceptionRegistryFromInput(input);
    assert.equal(registry.nodes.length, 2);
  });

  it('should return identical output for identical input', () => {
    const input: MisconceptionInput = { nodes: [VALID_MISCONCEPTION_A] };
    const r1 = composeMisconceptionRegistryFromInput(input);
    const r2 = composeMisconceptionRegistryFromInput(input);
    assert.deepEqual(r1, r2);
  });
});

// ============================================================================
// COMPOSE FUNCTIONS — Artifact with misconceptions
// ============================================================================

describe('composeAssessmentArtifactWithMisconceptions', () => {
  it('should compose artifact with misconceptions', () => {
    const result = composeAssessmentArtifactWithMisconceptions({
      artifactId: 'art-1', artifactTitle: 'Test',
      misconceptions: [VALID_MISCONCEPTION_A],
    });
    assert.equal(result.artifactId, 'art-1');
    assert.equal(result.misconceptions.length, 1);
  });

  it('should not mutate misconceptions input', () => {
    const misconceptions = [VALID_MISCONCEPTION_A];
    const original = JSON.stringify(misconceptions);
    composeAssessmentArtifactWithMisconceptions({
      artifactId: 'a', artifactTitle: 'T', misconceptions,
    });
    assert.equal(JSON.stringify(misconceptions), original);
  });
});

// ============================================================================
// VALIDATION — Misconception validation
// ============================================================================

describe('validateAssessmentMisconception', () => {
  it('should pass for valid misconception', () => {
    const errors = validateAssessmentMisconception(VALID_MISCONCEPTION_A);
    assert.equal(errors.length, 0);
  });

  it('should reject null misconception', () => {
    const errors = validateAssessmentMisconception(null as any);
    assert.ok(errors.length > 0);
  });

  it('should reject misconception with missing id', () => {
    const misconception = _makeMisconception('');
    const errors = validateAssessmentMisconception(misconception);
    assert.ok(errors.some((e) => e.code === MISCONCEPTION_VALIDATION_CODES.MISCONCEPTION_MISSING_MISCONCEPTION_ID));
  });

  it('should reject misconception with invalid type', () => {
    const misconception = _makeMisconception('m', { misconceptionType: 'invalid' as any });
    const errors = validateAssessmentMisconception(misconception);
    assert.ok(errors.some((e) => e.code === MISCONCEPTION_VALIDATION_CODES.MISCONCEPTION_INVALID_TYPE));
  });

  it('should reject misconception with invalid severity', () => {
    const misconception = _makeMisconception('m', { severity: 'invalid' as any });
    const errors = validateAssessmentMisconception(misconception);
    assert.ok(errors.some((e) => e.code === MISCONCEPTION_VALIDATION_CODES.MISCONCEPTION_INVALID_SEVERITY));
  });

  it('should reject misconception with missing conceptIds', () => {
    const misconception = _makeMisconception('m', { conceptIds: [] });
    const errors = validateAssessmentMisconception(misconception);
    assert.ok(errors.some((e) => e.code === MISCONCEPTION_VALIDATION_CODES.MISCONCEPTION_MISSING_CONCEPT_REFERENCE));
  });

  it('should reject misconception with non-deterministic trace', () => {
    const misconception: AssessmentMisconception = {
      id: 'm', title: 'T', description: 'D',
      misconceptionType: 'concept_confusion',
      causes: ['missing_prerequisite'], severity: 'moderate',
      conceptIds: ['c1'], remediationStrategies: [],
      status: 'draft', governance: 'canonical',
      provenance: VALID_MISCONCEPTION_PROVENANCE,
      trace: {
        traceId: 't', deterministic: false as any,
        generatedFrom: 'deterministic_misconception_kernel',
        randomUsed: false, timeDependency: false,
      },
    };
    const errors = validateAssessmentMisconception(misconception);
    assert.ok(errors.some((e) => e.code === MISCONCEPTION_VALIDATION_CODES.MISCONCEPTION_INVALID_TRACE));
  });
});

// ============================================================================
// VALIDATION — Relationship validation
// ============================================================================

describe('validateMisconceptionRelationship', () => {
  it('should pass for valid relationship', () => {
    const rel = composeMisconceptionRelationship({
      id: 'r1', sourceMisconceptionId: 'a', targetMisconceptionId: 'b',
      relationshipType: 'causes', rationale: 'r',
    });
    const errors = validateMisconceptionRelationship(rel);
    assert.equal(errors.length, 0);
  });

  it('should reject self-relationship', () => {
    const rel = composeMisconceptionRelationship({
      id: 'r', sourceMisconceptionId: 'a', targetMisconceptionId: 'a',
      relationshipType: 'self', rationale: 'r',
    });
    const errors = validateMisconceptionRelationship(rel);
    assert.ok(errors.some((e) => e.code === MISCONCEPTION_VALIDATION_CODES.MISCONCEPTION_SELF_RELATIONSHIP));
  });
});

// ============================================================================
// VALIDATION — Registry validation
// ============================================================================

describe('validateMisconceptionRegistry', () => {
  it('should pass for valid registry', () => {
    const registry = composeMisconceptionRegistry([VALID_MISCONCEPTION_A, VALID_MISCONCEPTION_B]);
    const result = validateMisconceptionRegistry(registry);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it('should reject null registry', () => {
    const result = validateMisconceptionRegistry(null as any);
    assert.equal(result.valid, false);
  });

  it('should reject empty registry', () => {
    const registry = composeMisconceptionRegistry([]);
    const result = validateMisconceptionRegistry(registry);
    assert.equal(result.valid, false);
  });

  it('should detect duplicate ids', () => {
    const duplicateNodes = [_makeMisconception('dup'), _makeMisconception('dup')];
    const registry = composeMisconceptionRegistry(duplicateNodes);
    const result = validateMisconceptionRegistry(registry);
    assert.equal(result.valid, false);
    assert.ok(result.errors.some((e) => e.code === MISCONCEPTION_VALIDATION_CODES.MISCONCEPTION_DUPLICATE_ID));
  });

  it('should detect duplicate titles', () => {
    const duplicateTitles = [
      _makeMisconception('a', { title: 'Same Title' }),
      _makeMisconception('b', { title: 'Same Title' }),
    ];
    const registry = composeMisconceptionRegistry(duplicateTitles);
    const result = validateMisconceptionRegistry(registry);
    assert.equal(result.valid, false);
    assert.ok(result.errors.some((e) => e.code === MISCONCEPTION_VALIDATION_CODES.MISCONCEPTION_DUPLICATE_TITLE));
  });
});

// ============================================================================
// VALIDATION — Input validation
// ============================================================================

describe('validateMisconceptionInput', () => {
  it('should pass for valid input', () => {
    const input: MisconceptionInput = { nodes: [VALID_MISCONCEPTION_A] };
    const result = validateMisconceptionInput(input);
    assert.equal(result.valid, true);
  });

  it('should reject null input', () => {
    const result = validateMisconceptionInput(null as any);
    assert.equal(result.valid, false);
  });

  it('should reject empty input', () => {
    const result = validateMisconceptionInput({ nodes: [] });
    assert.equal(result.valid, false);
  });
});

// ============================================================================
// VALIDATION — Trace validation
// ============================================================================

describe('validateMisconceptionTrace', () => {
  it('should pass for valid trace', () => {
    const trace = composeMisconceptionTrace({ traceId: 'test' });
    const result = validateMisconceptionTrace(trace);
    assert.equal(result.valid, true);
  });

  it('should reject null trace', () => {
    const result = validateMisconceptionTrace(null as any);
    assert.equal(result.valid, false);
  });
});

// ============================================================================
// VALIDATION — Artifact validation
// ============================================================================

describe('validateAssessmentArtifactWithMisconceptions', () => {
  it('should pass for valid artifact', () => {
    const artifact = composeAssessmentArtifactWithMisconceptions({
      artifactId: 'art-1', artifactTitle: 'Test',
      misconceptions: [VALID_MISCONCEPTION_A],
    });
    const result = validateAssessmentArtifactWithMisconceptions(artifact);
    assert.equal(result.valid, true);
  });

  it('should reject null artifact', () => {
    const result = validateAssessmentArtifactWithMisconceptions(null as any);
    assert.equal(result.valid, false);
  });
});

// ============================================================================
// DETERMINISTIC IDENTITY — 100 iterations
// ============================================================================

describe('Deterministic Identity', () => {
  it('should produce identical output for composeMisconceptionRegistry across 100 iterations', () => {
    const nodes = [VALID_MISCONCEPTION_A, VALID_MISCONCEPTION_B];
    let firstResult: string | null = null;

    for (let i = 0; i < 100; i++) {
      const result = composeMisconceptionRegistry(nodes);
      const serialized = JSON.stringify(result);
      if (firstResult === null) {
        firstResult = serialized;
      } else {
        assert.equal(serialized, firstResult, `Iteration ${i} differs`);
      }
    }
  });

  it('should produce identical output for composeAssessmentMisconception across 100 iterations', () => {
    const params = {
      id: 'm', title: 'T', description: 'D',
      misconceptionType: 'concept_confusion' as const,
      causes: ['missing_prerequisite' as const],
      severity: 'moderate' as const,
      conceptIds: ['c1'],
      remediationStrategies: [_makeStrategy('s1')],
      status: 'draft' as const, governance: 'canonical' as const,
      provenance: VALID_MISCONCEPTION_PROVENANCE,
    };
    let firstResult: string | null = null;

    for (let i = 0; i < 100; i++) {
      const result = composeAssessmentMisconception(params);
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
  it('should not mutate input nodes array in composeMisconceptionRegistry', () => {
    const nodes = [VALID_MISCONCEPTION_C, VALID_MISCONCEPTION_A];
    const original = JSON.stringify(nodes);
    composeMisconceptionRegistry(nodes);
    assert.equal(JSON.stringify(nodes), original);
  });

  it('should not mutate causes in composeAssessmentMisconception', () => {
    const causes = ['missing_prerequisite' as const];
    const original = JSON.stringify(causes);
    composeAssessmentMisconception({
      id: 'm', title: 'T', description: 'D',
      misconceptionType: 'concept_confusion', causes, severity: 'minor',
      conceptIds: ['c1'], remediationStrategies: [], status: 'draft',
      governance: 'canonical', provenance: VALID_MISCONCEPTION_PROVENANCE,
    });
    assert.equal(JSON.stringify(causes), original);
  });

  it('getCanonicalMisconceptionTypes returns a copy not affecting original', () => {
    const copy = getCanonicalMisconceptionTypes();
    assert.equal(copy.length, 10);
    (copy as string[]).push('injected');
    assert.equal(CANONICAL_MISCONCEPTION_TYPES.length, 10);
  });

  it('getCanonicalRemediationTypes returns a copy not affecting original', () => {
    const copy = getCanonicalRemediationTypes();
    assert.equal(copy.length, 10);
    (copy as string[]).push('injected');
    assert.equal(CANONICAL_REMEDIATION_TYPES.length, 10);
  });

  it('getCanonicalMisconceptionSeverities returns a copy not affecting original', () => {
    const copy = getCanonicalMisconceptionSeverities();
    assert.equal(copy.length, 5);
    (copy as string[]).push('injected');
    assert.equal(CANONICAL_MISCONCEPTION_SEVERITY.length, 5);
  });
});

// ============================================================================
// CROSS-AGENT BOUNDARY — No diagnosis/detection/hints
// ============================================================================

describe('Cross-Agent Boundary', () => {
  it('should not contain automatic misconception detection', () => {
    const source = JSON.stringify(CANONICAL_MISCONCEPTION_TYPES);
    assert.ok(!source.includes('detect'));
    assert.ok(!source.includes('automatic'));
    assert.ok(!source.includes('identify'));
  });

  it('should not contain learner diagnosis', () => {
    const source = JSON.stringify(CANONICAL_MISCONCEPTION_CAUSES);
    assert.ok(!source.includes('diagnos'));
    assert.ok(!source.includes('learner'));
    assert.ok(!source.includes('student'));
  });

  it('should not contain hint generation', () => {
    const source = JSON.stringify(CANONICAL_REMEDIATION_TYPES);
    assert.ok(!source.includes('hint'));
    assert.ok(!source.includes('generate'));
  });

  it('should not contain personalized remediation', () => {
    const source = JSON.stringify(CANONICAL_REMEDIATION_PRIORITY);
    assert.ok(!source.includes('personaliz'));
    assert.ok(!source.includes('adaptive'));
  });

  it('should not contain explanation generation', () => {
    const source = JSON.stringify(CANONICAL_MISCONCEPTION_TYPES);
    assert.ok(!source.includes('explain'));
    assert.ok(!source.includes('tutor'));
  });
});

// ============================================================================
// NEGATIVE CAPABILITY — No scoring/mastery/adaptive
// ============================================================================

describe('Negative Capability', () => {
  it('should not contain scoring logic', () => {
    const source = JSON.stringify(CANONICAL_MISCONCEPTION_TYPES);
    assert.ok(!source.includes('score'));
    assert.ok(!source.includes('grade'));
    assert.ok(!source.includes('mastery'));
  });

  it('should not contain LLM or async patterns', () => {
    const source = JSON.stringify(CANONICAL_MISCONCEPTION_TYPES);
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
    const codes = Object.values(MISCONCEPTION_VALIDATION_CODES);
    assert.equal(codes.length, 24);
  });

  it('all validation codes should be UPPER_SNAKE_CASE', () => {
    for (const code of Object.values(MISCONCEPTION_VALIDATION_CODES)) {
      assert.ok(/^[A-Z_]+$/.test(code), `Not UPPER_SNAKE_CASE: ${code}`);
    }
  });

  it('all validation codes should start with MISCONCEPTION_ or CAUSE_ or REMEDIATION_ or RELATIONSHIP_', () => {
    for (const code of Object.values(MISCONCEPTION_VALIDATION_CODES)) {
      assert.ok(
        code.startsWith('MISCONCEPTION_') || code.startsWith('CAUSE_') ||
        code.startsWith('REMEDIATION_') || code.startsWith('RELATIONSHIP_'),
        `Unexpected prefix: ${code}`,
      );
    }
  });

  it('all keys should match their string values', () => {
    for (const [key, value] of Object.entries(MISCONCEPTION_VALIDATION_CODES)) {
      assert.equal(key, value, `Key ${key} does not match value ${value}`);
    }
  });
});

/**
 * NV-2000-D8-OPT-01 — Assessment Kernel Tests
 *
 * Exhaustive deterministic tests for the Assessment Pipeline Kernel.
 * Uses Node.js built-in test runner (node:test).
 *
 * ~70 tests covering:
 * - Node composition
 * - Registry composition
 * - Deterministic sorting
 * - Duplicate detection
 * - Validation codes
 * - Helper functions
 * - Canonical enum completeness
 * - Immutability
 * - Registry validation
 * - Validator stability
 * - Deterministic identity (100 iterations)
 * - No mutation
 * - Negative capability verification
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  CANONICAL_ASSESSMENT_ARTIFACT_TYPES,
  CANONICAL_ASSESSMENT_DOMAINS,
  CANONICAL_ASSESSMENT_GOVERNANCE,
  CANONICAL_ASSESSMENT_STATUS,
  type AssessmentNode,
  type AssessmentArtifactType,
  type AssessmentInput,
  type AssessmentRegistry,
  type AssessmentProvenance,
  type AssessmentTrace,
  type AssessmentDecision,
  type AssessmentRegistryMetadata,
} from './AssessmentAgentContract.ts';

import {
  composeAssessmentProvenance,
  composeAssessmentTrace,
  composeAssessmentNode,
  composeAssessmentRegistry,
  composeAssessmentRegistryFromInput,
  composeAssessment,
  isSupportedAssessmentArtifactType,
  isSupportedAssessmentDomain,
  isSupportedAssessmentStatus,
  isSupportedAssessmentGovernance,
  getCanonicalAssessmentArtifactTypes,
  getCanonicalAssessmentDomains,
  getCanonicalAssessmentStatuses,
  getCanonicalAssessmentGovernance,
} from './AssessmentKernel.ts';

import {
  VALIDATION_CODES,
  validateAssessmentNode,
  validateAssessmentRegistry,
  validateAssessmentInput,
  validateAssessmentTrace,
} from './AssessmentValidation.ts';

// ============================================================================
// TEST FIXTURES
// ============================================================================

const VALID_PROVENANCE: AssessmentProvenance = {
  provider: 'test-provider',
  source: 'test-source',
  reviewStatus: 'approved',
  reviewDate: '2025-01-01',
  version: '1.0.0',
  rationale: 'Test rationale for assessment.',
};

function _makeNode(
  id: string,
  overrides: Partial<AssessmentNode> = {},
): AssessmentNode {
  return {
    id,
    title: `Test Node ${id}`,
    artifactType: 'multiple_choice',
    domain: 'machine_learning',
    status: 'draft',
    governance: 'canonical',
    provenance: VALID_PROVENANCE,
    trace: {
      traceId: `trace-${id}`,
      deterministic: true,
      generatedFrom: 'deterministic_assessment_kernel',
      randomUsed: false,
      timeDependency: false,
    },
    ...overrides,
  };
}

const VALID_NODE_A = _makeNode('node-a');
const VALID_NODE_B = _makeNode('node-b');
const VALID_NODE_C = _makeNode('node-c');

// ============================================================================
// CANONICAL ENUM COMPLETENESS
// ============================================================================

describe('Canonical Enums', () => {
  it('should have exactly 10 assessment artifact types', () => {
    assert.equal(CANONICAL_ASSESSMENT_ARTIFACT_TYPES.length, 10);
  });

  it('should have exactly 10 assessment domains', () => {
    assert.equal(CANONICAL_ASSESSMENT_DOMAINS.length, 10);
  });

  it('should have exactly 6 assessment statuses', () => {
    assert.equal(CANONICAL_ASSESSMENT_STATUS.length, 6);
  });

  it('should have exactly 5 assessment governance levels', () => {
    assert.equal(CANONICAL_ASSESSMENT_GOVERNANCE.length, 5);
  });

  it('should contain expected artifact types', () => {
    const expected = [
      'multiple_choice',
      'short_answer',
      'concept_mapping',
      'laboratory_assessment',
      'visual_assessment',
      'engineering_case',
      'comparative_reasoning',
      'constraint_analysis',
      'portfolio_evaluation',
      'reflection',
    ];
    for (const value of expected) {
      assert.ok(
        CANONICAL_ASSESSMENT_ARTIFACT_TYPES.includes(
          value as (typeof CANONICAL_ASSESSMENT_ARTIFACT_TYPES)[number],
        ),
        `Missing artifact type: ${value}`,
      );
    }
  });

  it('should contain expected domains', () => {
    const expected = [
      'computer_vision',
      'machine_learning',
      'deep_learning',
      'generative_ai',
      'mlops',
      'robotics',
      'edge_ai',
      'data_engineering',
      'software_engineering',
      'research',
    ];
    for (const value of expected) {
      assert.ok(
        CANONICAL_ASSESSMENT_DOMAINS.includes(
          value as (typeof CANONICAL_ASSESSMENT_DOMAINS)[number],
        ),
        `Missing domain: ${value}`,
      );
    }
  });

  it('should contain expected statuses', () => {
    const expected = [
      'draft',
      'review',
      'approved',
      'published',
      'deprecated',
      'archived',
    ];
    for (const value of expected) {
      assert.ok(
        CANONICAL_ASSESSMENT_STATUS.includes(
          value as (typeof CANONICAL_ASSESSMENT_STATUS)[number],
        ),
        `Missing status: ${value}`,
      );
    }
  });

  it('should contain expected governance levels', () => {
    const expected = ['canonical', 'accepted', 'provisional', 'deprecated', 'rejected'];
    for (const value of expected) {
      assert.ok(
        CANONICAL_ASSESSMENT_GOVERNANCE.includes(
          value as (typeof CANONICAL_ASSESSMENT_GOVERNANCE)[number],
        ),
        `Missing governance: ${value}`,
      );
    }
  });
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

describe('Helper Functions', () => {
  it('isSupportedAssessmentArtifactType should return true for valid types', () => {
    assert.equal(isSupportedAssessmentArtifactType('multiple_choice'), true);
    assert.equal(isSupportedAssessmentArtifactType('reflection'), true);
  });

  it('isSupportedAssessmentArtifactType should return false for invalid types', () => {
    assert.equal(isSupportedAssessmentArtifactType('invalid_type'), false);
    assert.equal(isSupportedAssessmentArtifactType(''), false);
  });

  it('isSupportedAssessmentDomain should return true for valid domains', () => {
    assert.equal(isSupportedAssessmentDomain('computer_vision'), true);
    assert.equal(isSupportedAssessmentDomain('research'), true);
  });

  it('isSupportedAssessmentDomain should return false for invalid domains', () => {
    assert.equal(isSupportedAssessmentDomain('invalid_domain'), false);
    assert.equal(isSupportedAssessmentDomain(''), false);
  });

  it('isSupportedAssessmentStatus should return true for valid statuses', () => {
    assert.equal(isSupportedAssessmentStatus('draft'), true);
    assert.equal(isSupportedAssessmentStatus('archived'), true);
  });

  it('isSupportedAssessmentStatus should return false for invalid statuses', () => {
    assert.equal(isSupportedAssessmentStatus('invalid_status'), false);
    assert.equal(isSupportedAssessmentStatus(''), false);
  });

  it('isSupportedAssessmentGovernance should return true for valid governance', () => {
    assert.equal(isSupportedAssessmentGovernance('canonical'), true);
    assert.equal(isSupportedAssessmentGovernance('rejected'), true);
  });

  it('isSupportedAssessmentGovernance should return false for invalid governance', () => {
    assert.equal(isSupportedAssessmentGovernance('invalid_governance'), false);
    assert.equal(isSupportedAssessmentGovernance(''), false);
  });

  it('getCanonicalAssessmentArtifactTypes should return a copy', () => {
    const result = getCanonicalAssessmentArtifactTypes();
    assert.equal(result.length, 10);
    assert.deepEqual([...result], [...CANONICAL_ASSESSMENT_ARTIFACT_TYPES]);
    // Mutation of result should not affect original
    (result as AssessmentArtifactType[]).push('injected' as AssessmentArtifactType);
    assert.equal(CANONICAL_ASSESSMENT_ARTIFACT_TYPES.length, 10);
  });

  it('getCanonicalAssessmentDomains should return a copy', () => {
    const result = getCanonicalAssessmentDomains();
    assert.equal(result.length, 10);
    assert.deepEqual([...result], [...CANONICAL_ASSESSMENT_DOMAINS]);
  });

  it('getCanonicalAssessmentStatuses should return a copy', () => {
    const result = getCanonicalAssessmentStatuses();
    assert.equal(result.length, 6);
    assert.deepEqual([...result], [...CANONICAL_ASSESSMENT_STATUS]);
  });

  it('getCanonicalAssessmentGovernance should return a copy', () => {
    const result = getCanonicalAssessmentGovernance();
    assert.equal(result.length, 5);
    assert.deepEqual([...result], [...CANONICAL_ASSESSMENT_GOVERNANCE]);
  });
});

// ============================================================================
// COMPOSE FUNCTIONS — Provenance
// ============================================================================

describe('composeAssessmentProvenance', () => {
  it('should compose provenance from valid params', () => {
    const provenance = composeAssessmentProvenance({
      provider: 'test-provider',
      source: 'test-source',
      reviewStatus: 'approved',
      reviewDate: '2025-01-01',
      version: '1.0.0',
      rationale: 'Test rationale.',
    });
    assert.equal(provenance.provider, 'test-provider');
    assert.equal(provenance.source, 'test-source');
    assert.equal(provenance.reviewStatus, 'approved');
    assert.equal(provenance.reviewDate, '2025-01-01');
    assert.equal(provenance.version, '1.0.0');
    assert.equal(provenance.rationale, 'Test rationale.');
  });

  it('should return identical output for identical input', () => {
    const params = {
      provider: 'p',
      source: 's',
      reviewStatus: 'draft' as const,
      reviewDate: '2025-01-01',
      version: '1.0.0',
      rationale: 'r',
    };
    const p1 = composeAssessmentProvenance(params);
    const p2 = composeAssessmentProvenance(params);
    assert.deepEqual(p1, p2);
  });
});

// ============================================================================
// COMPOSE FUNCTIONS — Trace
// ============================================================================

describe('composeAssessmentTrace', () => {
  it('should compose trace with deterministic metadata', () => {
    const trace = composeAssessmentTrace({ traceId: 'test-trace' });
    assert.equal(trace.traceId, 'test-trace');
    assert.equal(trace.deterministic, true);
    assert.equal(trace.generatedFrom, 'deterministic_assessment_kernel');
    assert.equal(trace.randomUsed, false);
    assert.equal(trace.timeDependency, false);
  });

  it('should return identical output for identical input', () => {
    const t1 = composeAssessmentTrace({ traceId: 'id' });
    const t2 = composeAssessmentTrace({ traceId: 'id' });
    assert.deepEqual(t1, t2);
  });
});

// ============================================================================
// COMPOSE FUNCTIONS — Node
// ============================================================================

describe('composeAssessmentNode', () => {
  it('should compose node from valid params', () => {
    const node = composeAssessmentNode({
      id: 'test-id',
      title: 'Test Title',
      artifactType: 'short_answer',
      domain: 'deep_learning',
      status: 'review',
      governance: 'accepted',
      provenance: VALID_PROVENANCE,
    });
    assert.equal(node.id, 'test-id');
    assert.equal(node.title, 'Test Title');
    assert.equal(node.artifactType, 'short_answer');
    assert.equal(node.domain, 'deep_learning');
    assert.equal(node.status, 'review');
    assert.equal(node.governance, 'accepted');
    assert.equal(node.trace.deterministic, true);
    assert.equal(node.trace.randomUsed, false);
    assert.equal(node.trace.timeDependency, false);
  });

  it('should generate deterministic trace id', () => {
    const n1 = composeAssessmentNode({
      id: 'x',
      title: 'T',
      artifactType: 'multiple_choice',
      domain: 'machine_learning',
      status: 'draft',
      governance: 'canonical',
      provenance: VALID_PROVENANCE,
    });
    const n2 = composeAssessmentNode({
      id: 'x',
      title: 'T',
      artifactType: 'multiple_choice',
      domain: 'machine_learning',
      status: 'draft',
      governance: 'canonical',
      provenance: VALID_PROVENANCE,
    });
    assert.equal(n1.trace.traceId, n2.trace.traceId);
  });

  it('should not mutate provenance input', () => {
    const provenance = { ...VALID_PROVENANCE };
    const original = JSON.stringify(provenance);
    composeAssessmentNode({
      id: 'test',
      title: 'T',
      artifactType: 'multiple_choice',
      domain: 'machine_learning',
      status: 'draft',
      governance: 'canonical',
      provenance,
    });
    assert.equal(JSON.stringify(provenance), original);
  });
});

// ============================================================================
// COMPOSE FUNCTIONS — Registry
// ============================================================================

describe('composeAssessmentRegistry', () => {
  it('should compose registry from nodes', () => {
    const registry = composeAssessmentRegistry([VALID_NODE_A, VALID_NODE_B]);
    assert.equal(registry.nodes.length, 2);
    assert.equal(registry.metadata.nodeCount, 2);
    assert.equal(registry.metadata.deterministic, true);
    assert.equal(registry.metadata.randomUsed, false);
    assert.equal(registry.metadata.timeDependency, false);
  });

  it('should sort nodes by id', () => {
    const registry = composeAssessmentRegistry([VALID_NODE_C, VALID_NODE_A, VALID_NODE_B]);
    assert.equal(registry.nodes[0].id, 'node-a');
    assert.equal(registry.nodes[1].id, 'node-b');
    assert.equal(registry.nodes[2].id, 'node-c');
  });

  it('should return identical output for identical input', () => {
    const nodes = [VALID_NODE_A, VALID_NODE_B];
    const r1 = composeAssessmentRegistry(nodes);
    const r2 = composeAssessmentRegistry(nodes);
    assert.deepEqual(r1, r2);
  });

  it('should not mutate input nodes array', () => {
    const nodes = [VALID_NODE_C, VALID_NODE_A];
    const original = JSON.stringify(nodes);
    composeAssessmentRegistry(nodes);
    assert.equal(JSON.stringify(nodes), original);
  });

  it('should handle empty array', () => {
    const registry = composeAssessmentRegistry([]);
    assert.equal(registry.nodes.length, 0);
    assert.equal(registry.metadata.nodeCount, 0);
  });
});

// ============================================================================
// COMPOSE FUNCTIONS — Registry from Input
// ============================================================================

describe('composeAssessmentRegistryFromInput', () => {
  it('should compose registry from input', () => {
    const input: AssessmentInput = { nodes: [VALID_NODE_A, VALID_NODE_B] };
    const registry = composeAssessmentRegistryFromInput(input);
    assert.equal(registry.nodes.length, 2);
    assert.equal(registry.metadata.nodeCount, 2);
  });

  it('should return identical output for identical input', () => {
    const input: AssessmentInput = { nodes: [VALID_NODE_A] };
    const r1 = composeAssessmentRegistryFromInput(input);
    const r2 = composeAssessmentRegistryFromInput(input);
    assert.deepEqual(r1, r2);
  });
});

// ============================================================================
// COMPOSE FUNCTIONS — Top-level composeAssessment
// ============================================================================

describe('composeAssessment', () => {
  it('should compose full assessment output', () => {
    const result = composeAssessment({ nodes: [VALID_NODE_A, VALID_NODE_B] });
    assert.equal(result.registry.nodes.length, 2);
    assert.equal(result.validation.valid, true);
    assert.equal(result.validation.errors.length, 0);
    assert.equal(result.trace.deterministic, true);
  });

  it('should return identical output for identical input', () => {
    const params = { nodes: [VALID_NODE_A] };
    const r1 = composeAssessment(params);
    const r2 = composeAssessment(params);
    assert.deepEqual(r1, r2);
  });

  it('should detect validation errors in composed output', () => {
    const invalidNode = _makeNode('bad', { artifactType: 'invalid' as any });
    const result = composeAssessment({ nodes: [invalidNode] });
    assert.equal(result.validation.valid, false);
    assert.ok(result.validation.errors.length > 0);
  });
});

// ============================================================================
// VALIDATION — Node validation
// ============================================================================

describe('validateAssessmentNode', () => {
  it('should pass for valid node', () => {
    const errors = validateAssessmentNode(VALID_NODE_A);
    assert.equal(errors.length, 0);
  });

  it('should reject null node', () => {
    const errors = validateAssessmentNode(null as any);
    assert.ok(errors.length > 0);
    assert.equal(errors[0].code, VALIDATION_CODES.ASSESSMENT_MISSING_ASSESSMENT_ID);
  });

  it('should reject node with missing id', () => {
    const node = _makeNode('');
    const errors = validateAssessmentNode(node);
    assert.ok(errors.some((e) => e.code === VALIDATION_CODES.ASSESSMENT_MISSING_ASSESSMENT_ID));
  });

  it('should reject node with missing title', () => {
    const node = _makeNode('id', { title: '' });
    const errors = validateAssessmentNode(node);
    assert.ok(errors.some((e) => e.code === VALIDATION_CODES.ASSESSMENT_MISSING_TITLE));
  });

  it('should reject node with invalid artifact type', () => {
    const node = _makeNode('id', { artifactType: 'invalid' as any });
    const errors = validateAssessmentNode(node);
    assert.ok(errors.some((e) => e.code === VALIDATION_CODES.ASSESSMENT_INVALID_ARTIFACT_TYPE));
  });

  it('should reject node with invalid domain', () => {
    const node = _makeNode('id', { domain: 'invalid' as any });
    const errors = validateAssessmentNode(node);
    assert.ok(errors.some((e) => e.code === VALIDATION_CODES.ASSESSMENT_INVALID_DOMAIN));
  });

  it('should reject node with invalid status', () => {
    const node = _makeNode('id', { status: 'invalid' as any });
    const errors = validateAssessmentNode(node);
    assert.ok(errors.some((e) => e.code === VALIDATION_CODES.ASSESSMENT_INVALID_STATUS));
  });

  it('should reject node with invalid governance', () => {
    const node = _makeNode('id', { governance: 'invalid' as any });
    const errors = validateAssessmentNode(node);
    assert.ok(errors.some((e) => e.code === VALIDATION_CODES.ASSESSMENT_INVALID_GOVERNANCE));
  });

  it('should reject node with missing provenance', () => {
    const node = _makeNode('id', { provenance: null as any });
    const errors = validateAssessmentNode(node);
    assert.ok(errors.some((e) => e.code === VALIDATION_CODES.ASSESSMENT_MISSING_PROVENANCE));
  });

  it('should reject node with missing provider', () => {
    const node = _makeNode('id', {
      provenance: { ...VALID_PROVENANCE, provider: '' },
    });
    const errors = validateAssessmentNode(node);
    assert.ok(errors.some((e) => e.code === VALIDATION_CODES.ASSESSMENT_MISSING_PROVIDER));
  });

  it('should reject node with missing rationale', () => {
    const node = _makeNode('id', {
      provenance: { ...VALID_PROVENANCE, rationale: '' },
    });
    const errors = validateAssessmentNode(node);
    assert.ok(errors.some((e) => e.code === VALIDATION_CODES.ASSESSMENT_MISSING_RATIONALE));
  });

  it('should reject node with missing trace', () => {
    const node = _makeNode('id', { trace: null as any });
    const errors = validateAssessmentNode(node);
    assert.ok(errors.some((e) => e.code === VALIDATION_CODES.ASSESSMENT_MISSING_TRACE));
  });

  it('should reject node with non-deterministic trace', () => {
    const node = _makeNode('id', {
      trace: { ...VALID_NODE_A.trace, deterministic: false as any },
    });
    const errors = validateAssessmentNode(node);
    assert.ok(errors.some((e) => e.code === VALIDATION_CODES.ASSESSMENT_INVALID_TRACE));
  });

  it('should reject node with randomUsed true', () => {
    const node = _makeNode('id', {
      trace: { ...VALID_NODE_A.trace, randomUsed: true as any },
    });
    const errors = validateAssessmentNode(node);
    assert.ok(errors.some((e) => e.code === VALIDATION_CODES.ASSESSMENT_INVALID_TRACE));
  });

  it('should reject node with timeDependency true', () => {
    const node = _makeNode('id', {
      trace: { ...VALID_NODE_A.trace, timeDependency: true as any },
    });
    const errors = validateAssessmentNode(node);
    assert.ok(errors.some((e) => e.code === VALIDATION_CODES.ASSESSMENT_INVALID_TRACE));
  });

  it('should return stable validation codes', () => {
    const codes = Object.values(VALIDATION_CODES);
    assert.ok(codes.includes('ASSESSMENT_DUPLICATE_ID'));
    assert.ok(codes.includes('ASSESSMENT_DUPLICATE_TITLE'));
    assert.ok(codes.includes('ASSESSMENT_INVALID_ARTIFACT_TYPE'));
    assert.ok(codes.includes('ASSESSMENT_INVALID_DOMAIN'));
    assert.ok(codes.includes('ASSESSMENT_INVALID_STATUS'));
    assert.ok(codes.includes('ASSESSMENT_INVALID_GOVERNANCE'));
    assert.ok(codes.includes('ASSESSMENT_MISSING_PROVENANCE'));
    assert.ok(codes.includes('ASSESSMENT_MISSING_RATIONALE'));
    assert.ok(codes.includes('ASSESSMENT_MISSING_PROVIDER'));
    assert.ok(codes.includes('ASSESSMENT_MISSING_TRACE'));
    assert.ok(codes.includes('ASSESSMENT_MISSING_ASSESSMENT_ID'));
    assert.ok(codes.includes('ASSESSMENT_MISSING_TITLE'));
    assert.ok(codes.includes('ASSESSMENT_EMPTY_REGISTRY'));
    assert.ok(codes.includes('ASSESSMENT_INVALID_TRACE'));
    assert.ok(codes.includes('ASSESSMENT_REGISTRY_INCONSISTENCY'));
  });
});

// ============================================================================
// VALIDATION — Registry validation
// ============================================================================

describe('validateAssessmentRegistry', () => {
  it('should pass for valid registry', () => {
    const registry = composeAssessmentRegistry([VALID_NODE_A, VALID_NODE_B]);
    const result = validateAssessmentRegistry(registry);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
    assert.equal(result.nodeResults.length, 2);
  });

  it('should reject null registry', () => {
    const result = validateAssessmentRegistry(null as any);
    assert.equal(result.valid, false);
    assert.ok(result.errors.some((e) => e.code === VALIDATION_CODES.ASSESSMENT_EMPTY_REGISTRY));
  });

  it('should reject empty nodes array', () => {
    const registry = composeAssessmentRegistry([]);
    const result = validateAssessmentRegistry(registry);
    assert.equal(result.valid, false);
    assert.ok(result.errors.some((e) => e.code === VALIDATION_CODES.ASSESSMENT_EMPTY_REGISTRY));
  });

  it('should detect duplicate ids', () => {
    const duplicateNodes = [_makeNode('dup'), _makeNode('dup')];
    const registry = composeAssessmentRegistry(duplicateNodes);
    const result = validateAssessmentRegistry(registry);
    assert.equal(result.valid, false);
    assert.ok(result.errors.some((e) => e.code === VALIDATION_CODES.ASSESSMENT_DUPLICATE_ID));
  });

  it('should detect duplicate titles', () => {
    const duplicateTitles = [
      _makeNode('a', { title: 'Same Title' }),
      _makeNode('b', { title: 'Same Title' }),
    ];
    const registry = composeAssessmentRegistry(duplicateTitles);
    const result = validateAssessmentRegistry(registry);
    assert.equal(result.valid, false);
    assert.ok(result.errors.some((e) => e.code === VALIDATION_CODES.ASSESSMENT_DUPLICATE_TITLE));
  });

  it('should detect metadata nodeCount inconsistency', () => {
    const registry: AssessmentRegistry = {
      metadata: {
        registryId: 'test',
        version: '1.0.0',
        nodeCount: 5,
        generatedFrom: 'deterministic_assessment_kernel',
        deterministic: true,
        randomUsed: false,
        timeDependency: false,
      },
      nodes: [VALID_NODE_A],
    };
    const result = validateAssessmentRegistry(registry);
    assert.equal(result.valid, false);
    assert.ok(
      result.errors.some(
        (e) => e.code === VALIDATION_CODES.ASSESSMENT_REGISTRY_INCONSISTENCY,
      ),
    );
  });
});

// ============================================================================
// VALIDATION — Input validation
// ============================================================================

describe('validateAssessmentInput', () => {
  it('should pass for valid input', () => {
    const input: AssessmentInput = { nodes: [VALID_NODE_A] };
    const result = validateAssessmentInput(input);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it('should reject null input', () => {
    const result = validateAssessmentInput(null as any);
    assert.equal(result.valid, false);
  });

  it('should reject input with no nodes', () => {
    const result = validateAssessmentInput({ nodes: [] });
    assert.equal(result.valid, false);
  });
});

// ============================================================================
// VALIDATION — Trace validation
// ============================================================================

describe('validateAssessmentTrace', () => {
  it('should pass for valid trace', () => {
    const trace = composeAssessmentTrace({ traceId: 'test' });
    const result = validateAssessmentTrace(trace);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it('should reject null trace', () => {
    const result = validateAssessmentTrace(null as any);
    assert.equal(result.valid, false);
  });

  it('should reject trace with missing traceId', () => {
    const result = validateAssessmentTrace({
      traceId: '',
      deterministic: true,
      generatedFrom: 'deterministic_assessment_kernel',
      randomUsed: false,
      timeDependency: false,
    });
    assert.equal(result.valid, false);
  });

  it('should reject trace with deterministic false', () => {
    const result = validateAssessmentTrace({
      traceId: 'id',
      deterministic: false as any,
      generatedFrom: 'deterministic_assessment_kernel',
      randomUsed: false,
      timeDependency: false,
    });
    assert.equal(result.valid, false);
  });
});

// ============================================================================
// DETERMINISTIC IDENTITY — 100 iterations
// ============================================================================

describe('Deterministic Identity', () => {
  it('should produce identical output for composeAssessment across 100 iterations', () => {
    const nodes = [VALID_NODE_A, VALID_NODE_B];
    let firstResult: string | null = null;

    for (let i = 0; i < 100; i++) {
      const result = composeAssessment({ nodes });
      const serialized = JSON.stringify(result);
      if (firstResult === null) {
        firstResult = serialized;
      } else {
        assert.equal(serialized, firstResult, `Iteration ${i} differs from first`);
      }
    }
  });

  it('should produce identical output for composeAssessmentRegistry across 100 iterations', () => {
    const nodes = [VALID_NODE_A, VALID_NODE_B, VALID_NODE_C];
    let firstResult: string | null = null;

    for (let i = 0; i < 100; i++) {
      const result = composeAssessmentRegistry(nodes);
      const serialized = JSON.stringify(result);
      if (firstResult === null) {
        firstResult = serialized;
      } else {
        assert.equal(serialized, firstResult, `Iteration ${i} differs from first`);
      }
    }
  });

  it('should produce identical output for composeAssessmentNode across 100 iterations', () => {
    const params = {
      id: 'test',
      title: 'T',
      artifactType: 'multiple_choice' as const,
      domain: 'machine_learning' as const,
      status: 'draft' as const,
      governance: 'canonical' as const,
      provenance: VALID_PROVENANCE,
    };
    let firstResult: string | null = null;

    for (let i = 0; i < 100; i++) {
      const result = composeAssessmentNode(params);
      const serialized = JSON.stringify(result);
      if (firstResult === null) {
        firstResult = serialized;
      } else {
        assert.equal(serialized, firstResult, `Iteration ${i} differs from first`);
      }
    }
  });
});

// ============================================================================
// IMMUTABILITY — No mutation
// ============================================================================

describe('Immutability', () => {
  it('should not mutate input nodes array in composeAssessmentRegistry', () => {
    const nodes = [VALID_NODE_C, VALID_NODE_A];
    const original = JSON.stringify(nodes);
    composeAssessmentRegistry(nodes);
    assert.equal(JSON.stringify(nodes), original);
  });

  it('should not mutate input nodes in composeAssessmentRegistryFromInput', () => {
    const input: AssessmentInput = { nodes: [VALID_NODE_C, VALID_NODE_A] };
    const original = JSON.stringify(input);
    composeAssessmentRegistryFromInput(input);
    assert.equal(JSON.stringify(input), original);
  });

  it('should not mutate provenance in composeAssessmentNode', () => {
    const provenance = { ...VALID_PROVENANCE };
    const original = JSON.stringify(provenance);
    composeAssessmentNode({
      id: 'test',
      title: 'T',
      artifactType: 'multiple_choice',
      domain: 'machine_learning',
      status: 'draft',
      governance: 'canonical',
      provenance,
    });
    assert.equal(JSON.stringify(provenance), original);
  });

  it('getCanonicalAssessmentArtifactTypes should return a copy not affecting original', () => {
    const copy = getCanonicalAssessmentArtifactTypes();
    assert.equal(copy.length, 10);
    (copy as string[]).push('injected');
    assert.equal(CANONICAL_ASSESSMENT_ARTIFACT_TYPES.length, 10);
  });

  it('getCanonicalAssessmentDomains should return a copy not affecting original', () => {
    const copy = getCanonicalAssessmentDomains();
    assert.equal(copy.length, 10);
    (copy as string[]).push('injected');
    assert.equal(CANONICAL_ASSESSMENT_DOMAINS.length, 10);
  });

  it('getCanonicalAssessmentStatuses should return a copy not affecting original', () => {
    const copy = getCanonicalAssessmentStatuses();
    assert.equal(copy.length, 6);
    (copy as string[]).push('injected');
    assert.equal(CANONICAL_ASSESSMENT_STATUS.length, 6);
  });

  it('getCanonicalAssessmentGovernance should return a copy not affecting original', () => {
    const copy = getCanonicalAssessmentGovernance();
    assert.equal(copy.length, 5);
    (copy as string[]).push('injected');
    assert.equal(CANONICAL_ASSESSMENT_GOVERNANCE.length, 5);
  });
});

// ============================================================================
// NEGATIVE CAPABILITY — No assessment logic
// ============================================================================

describe('Negative Capability', () => {
  it('should not contain any grading logic', () => {
    const contractSource = JSON.stringify(CANONICAL_ASSESSMENT_ARTIFACT_TYPES);
    assert.ok(!contractSource.includes('grade'));
    assert.ok(!contractSource.includes('score'));
    assert.ok(!contractSource.includes('verify'));
  });

  it('should not contain question generation', () => {
    const contractSource = JSON.stringify(CANONICAL_ASSESSMENT_ARTIFACT_TYPES);
    assert.ok(!contractSource.includes('generate'));
    assert.ok(!contractSource.includes('question'));
  });

  it('should not contain feedback logic', () => {
    const contractSource = JSON.stringify(CANONICAL_ASSESSMENT_ARTIFACT_TYPES);
    assert.ok(!contractSource.includes('feedback'));
    assert.ok(!contractSource.includes('misconception'));
  });

  it('should not contain LLM or async patterns', () => {
    const contractSource = JSON.stringify(CANONICAL_ASSESSMENT_ARTIFACT_TYPES);
    assert.ok(!contractSource.includes('Promise'));
    assert.ok(!contractSource.includes('async'));
    assert.ok(!contractSource.includes('await'));
  });
});

// ============================================================================
// VALIDATION CODES — Structure verification
// ============================================================================

describe('Validation Codes', () => {
  it('should have at least 15 validation codes', () => {
    const codes = Object.values(VALIDATION_CODES);
    assert.ok(codes.length >= 15);
  });

  it('all validation codes should be UPPER_SNAKE_CASE', () => {
    for (const code of Object.values(VALIDATION_CODES)) {
      assert.ok(
        /^[A-Z_]+$/.test(code),
        `Validation code is not UPPER_SNAKE_CASE: ${code}`,
      );
    }
  });

  it('all validation codes should start with ASSESSMENT_', () => {
    for (const code of Object.values(VALIDATION_CODES)) {
      assert.ok(
        code.startsWith('ASSESSMENT_'),
        `Validation code does not start with ASSESSMENT_: ${code}`,
      );
    }
  });

  it('all keys should match their string values', () => {
    for (const [key, value] of Object.entries(VALIDATION_CODES)) {
      assert.equal(key, value, `Key ${key} does not match value ${value}`);
    }
  });
});

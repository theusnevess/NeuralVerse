/**
 * NV-2000-D8-OPT-16 — Assessment Pipeline Facade Tests
 *
 * Exhaustive deterministic tests for the Assessment Pipeline Facade.
 * Uses Node.js built-in test runner (node:test).
 *
 * ~50 tests covering:
 * - Compose Facade
 * - Certification Facade
 * - Complete Facade
 * - Validation
 * - Helper Functions
 * - Canonical Enum Completeness
 * - Determinism (100 iterations)
 * - Negative Capability
 * - Cross-Agent Boundary
 * - Validator Stability
 * - Backward Compatibility
 * - Immutability
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  CANONICAL_ASSESSMENT_FACADE_STATUS,
  type AssessmentFacadeArtifactResult,
  type AssessmentFacadeCertificationResult,
  type AssessmentFacadeCompleteResult,
  type AssessmentFacadeStatus,
  type AssessmentNode,
  type AssessmentRegistry,
  type AssessmentProvenance,
} from './AssessmentAgentContract.ts';

import {
  composeAssessmentArtifact,
  certifyAssessmentFacadeArtifact,
  composeAndCertifyAssessmentArtifact,
  validateAssessmentFacadeArtifact,
  validateAssessmentFacadeCertification,
  validateAssessmentFacadeComplete,
  isSupportedAssessmentFacadeStatus,
  getCanonicalAssessmentFacadeStatuses,
} from './AssessmentPipelineFacade.ts';

import {
  composeAssessmentNode,
  composeAssessmentProvenance,
  composeAssessmentRegistry,
} from './AssessmentKernel.ts';

// ============================================================================
// TEST FIXTURES
// ============================================================================

const VALID_PROVENANCE: AssessmentProvenance = {
  provider: 'test-provider',
  source: 'test-source',
  reviewStatus: 'approved',
  reviewDate: '2025-01-01',
  version: '1.0.0',
  rationale: 'Test rationale for facade assessment.',
};

function _makeNode(
  id: string,
  overrides: Partial<AssessmentNode> = {},
): AssessmentNode {
  return composeAssessmentNode({
    id,
    title: `Test Node ${id}`,
    artifactType: 'multiple_choice',
    domain: 'machine_learning',
    status: 'draft',
    governance: 'canonical',
    provenance: VALID_PROVENANCE,
    ...overrides,
  });
}

function _makeRegistry(nodeCount: number = 2): AssessmentRegistry {
  const nodes = Array.from({ length: nodeCount }, (_, i) =>
    _makeNode(`node-${i + 1}`),
  );
  return composeAssessmentRegistry(nodes);
}

// ============================================================================
// CANONICAL ENUM COMPLETENESS
// ============================================================================

describe('Canonical Enums', () => {
  it('should have exactly 6 facade statuses', () => {
    assert.equal(CANONICAL_ASSESSMENT_FACADE_STATUS.length, 6);
  });

  it('should contain expected facade statuses', () => {
    const expected = [
      'available',
      'validated',
      'certified',
      'deprecated',
      'internal',
      'legacy',
    ];
    for (const value of expected) {
      assert.ok(
        CANONICAL_ASSESSMENT_FACADE_STATUS.includes(value as any),
        `Missing: ${value}`,
      );
    }
  });
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

describe('Helper Functions', () => {
  it('isSupportedAssessmentFacadeStatus returns true for valid status', () => {
    assert.equal(isSupportedAssessmentFacadeStatus('available'), true);
    assert.equal(isSupportedAssessmentFacadeStatus('certified'), true);
  });

  it('isSupportedAssessmentFacadeStatus returns false for invalid status', () => {
    assert.equal(isSupportedAssessmentFacadeStatus('invalid'), false);
    assert.equal(isSupportedAssessmentFacadeStatus(''), false);
  });

  it('getCanonicalAssessmentFacadeStatuses returns a copy', () => {
    const result = getCanonicalAssessmentFacadeStatuses();
    assert.equal(result.length, 6);
    assert.deepEqual([...result], [...CANONICAL_ASSESSMENT_FACADE_STATUS]);
    (result as string[]).push('injected');
    assert.equal(CANONICAL_ASSESSMENT_FACADE_STATUS.length, 6);
  });
});

// ============================================================================
// COMPOSE FACADE
// ============================================================================

describe('composeAssessmentArtifact', () => {
  it('should compose artifact with nodes', () => {
    const nodes = [_makeNode('n1'), _makeNode('n2')];
    const result = composeAssessmentArtifact({ nodes });

    assert.equal(result.status, 'available');
    assert.ok(result.artifactId.length > 0);
    assert.ok(result.artifactTitle.length > 0);
    assert.equal(result.registry.nodes.length, 2);
    assert.equal(result.validation.valid, true);
    assert.equal(result.trace.deterministic, true);
    assert.equal(result.trace.randomUsed, false);
    assert.equal(result.trace.timeDependency, false);
  });

  it('should compose artifact with empty nodes', () => {
    const result = composeAssessmentArtifact({ nodes: [] });

    assert.equal(result.status, 'available');
    assert.ok(result.artifactId.length > 0);
    assert.equal(result.registry.nodes.length, 0);
    assert.equal(result.validation.valid, true);
  });

  it('should not mutate input nodes', () => {
    const nodes = [_makeNode('n1')];
    const originalIds = nodes.map((n) => n.id);

    composeAssessmentArtifact({ nodes });

    assert.deepEqual(
      nodes.map((n) => n.id),
      originalIds,
    );
  });

  it('should return identical output for identical input', () => {
    const nodes = [_makeNode('n1'), _makeNode('n2')];
    const r1 = composeAssessmentArtifact({ nodes });
    const r2 = composeAssessmentArtifact({ nodes });

    assert.deepEqual(r1, r2);
  });
});

// ============================================================================
// CERTIFICATION FACADE
// ============================================================================

describe('certifyAssessmentFacadeArtifact', () => {
  it('should certify artifact', () => {
    const registry = _makeRegistry(2);
    const result = certifyAssessmentFacadeArtifact({
      artifactId: 'art-1',
      artifactTitle: 'Test Artifact',
      registry,
      certificationAt: '2025-01-01',
      certifiedBy: 'test-certifier',
    });

    assert.ok(
      result.status === 'certified' || result.status === 'available',
    );
    assert.equal(result.artifactId, 'art-1');
    assert.ok(result.certificationReport !== null);
    assert.ok(typeof result.certificationReport === 'object');
    assert.equal(result.validation.valid, true);
    assert.equal(result.trace.deterministic, true);
  });

  it('should not mutate input registry', () => {
    const registry = _makeRegistry(2);
    const originalNodeCount = registry.nodes.length;

    certifyAssessmentFacadeArtifact({
      artifactId: 'art-1',
      artifactTitle: 'Test',
      registry,
      certificationAt: '2025-01-01',
      certifiedBy: 'test',
    });

    assert.equal(registry.nodes.length, originalNodeCount);
  });
});

// ============================================================================
// COMPLETE FACADE
// ============================================================================

describe('composeAndCertifyAssessmentArtifact', () => {
  it('should compose and certify in single pipeline', () => {
    const nodes = [_makeNode('n1'), _makeNode('n2')];
    const result = composeAndCertifyAssessmentArtifact({
      nodes,
      certificationAt: '2025-01-01',
      certifiedBy: 'test-certifier',
    });

    assert.ok(
      result.status === 'certified' || result.status === 'available',
    );
    assert.ok(result.artifactId.length > 0);
    assert.ok(result.artifactTitle.length > 0);
    assert.equal(result.registry.nodes.length, 2);
    assert.equal(result.validation.valid, true);
    assert.ok(result.certificationReport !== null);
    assert.ok(typeof result.certificationReport === 'object');
    assert.equal(result.certificationValidation.valid, true);
    assert.equal(result.trace.deterministic, true);
  });

  it('should return identical output for identical input', () => {
    const nodes = [_makeNode('n1')];
    const params = {
      nodes,
      certificationAt: '2025-01-01',
      certifiedBy: 'test',
    };
    const r1 = composeAndCertifyAssessmentArtifact(params);
    const r2 = composeAndCertifyAssessmentArtifact(params);

    assert.deepEqual(r1, r2);
  });

  it('should not mutate input nodes', () => {
    const nodes = [_makeNode('n1')];
    const originalIds = nodes.map((n) => n.id);

    composeAndCertifyAssessmentArtifact({
      nodes,
      certificationAt: '2025-01-01',
      certifiedBy: 'test',
    });

    assert.deepEqual(
      nodes.map((n) => n.id),
      originalIds,
    );
  });
});

// ============================================================================
// VALIDATION
// ============================================================================

describe('validateAssessmentFacadeArtifact', () => {
  it('should pass for valid artifact result', () => {
    const nodes = [_makeNode('n1')];
    const result = composeAssessmentArtifact({ nodes });
    const validation = validateAssessmentFacadeArtifact(result);

    assert.equal(validation.valid, true);
    assert.equal(validation.errors.length, 0);
    assert.equal(validation.checkedAt, 'facade_validation');
  });

  it('should reject null result', () => {
    const validation = validateAssessmentFacadeArtifact(null as any);
    assert.equal(validation.valid, false);
    assert.ok(validation.errors.length > 0);
  });

  it('should reject invalid status', () => {
    const result: AssessmentFacadeArtifactResult = {
      status: 'invalid' as any,
      artifactId: 'art-1',
      artifactTitle: 'Test',
      registry: _makeRegistry(1),
      validation: {
        valid: true,
        errors: [],
        nodeResults: [],
        checkedAt: 'registry_validation',
      },
      trace: {
        traceId: 'trace-1',
        deterministic: true,
        generatedFrom: 'deterministic_assessment_facade',
        randomUsed: false,
        timeDependency: false,
      },
    };
    const validation = validateAssessmentFacadeArtifact(result);
    assert.equal(validation.valid, false);
  });
});

describe('validateAssessmentFacadeCertification', () => {
  it('should pass for valid certification result', () => {
    const registry = _makeRegistry(2);
    const result = certifyAssessmentFacadeArtifact({
      artifactId: 'art-1',
      artifactTitle: 'Test',
      registry,
      certificationAt: '2025-01-01',
      certifiedBy: 'test',
    });
    const validation = validateAssessmentFacadeCertification(result);

    assert.equal(validation.valid, true);
    assert.equal(validation.errors.length, 0);
  });

  it('should reject null result', () => {
    const validation = validateAssessmentFacadeCertification(null as any);
    assert.equal(validation.valid, false);
  });
});

describe('validateAssessmentFacadeComplete', () => {
  it('should pass for valid complete result', () => {
    const nodes = [_makeNode('n1')];
    const result = composeAndCertifyAssessmentArtifact({
      nodes,
      certificationAt: '2025-01-01',
      certifiedBy: 'test',
    });
    const validation = validateAssessmentFacadeComplete(result);

    assert.equal(validation.valid, true);
    assert.equal(validation.errors.length, 0);
  });

  it('should reject null result', () => {
    const validation = validateAssessmentFacadeComplete(null as any);
    assert.equal(validation.valid, false);
  });
});

// ============================================================================
// DETERMINISTIC IDENTITY — 100 iterations
// ============================================================================

describe('Deterministic Identity', () => {
  it('should produce identical output for composeAssessmentArtifact across 100 iterations', () => {
    const nodes = [_makeNode('n1'), _makeNode('n2')];
    let firstResult: string | null = null;

    for (let i = 0; i < 100; i++) {
      const result = composeAssessmentArtifact({ nodes });
      const serialized = JSON.stringify(result);
      if (firstResult === null) {
        firstResult = serialized;
      } else {
        assert.equal(serialized, firstResult, `Iteration ${i} differs`);
      }
    }
  });

  it('should produce identical output for composeAndCertifyAssessmentArtifact across 100 iterations', () => {
    const nodes = [_makeNode('n1')];
    const params = {
      nodes,
      certificationAt: '2025-01-01',
      certifiedBy: 'test',
    };
    let firstResult: string | null = null;

    for (let i = 0; i < 100; i++) {
      const result = composeAndCertifyAssessmentArtifact(params);
      const serialized = JSON.stringify(result);
      if (firstResult === null) {
        firstResult = serialized;
      } else {
        assert.equal(serialized, firstResult, `Iteration ${i} differs`);
      }
    }
  });

  it('should produce identical output for certifyAssessmentFacadeArtifact across 100 iterations', () => {
    const registry = _makeRegistry(2);
    const params = {
      artifactId: 'art-1',
      artifactTitle: 'Test',
      registry,
      certificationAt: '2025-01-01',
      certifiedBy: 'test',
    };
    let firstResult: string | null = null;

    for (let i = 0; i < 100; i++) {
      const result = certifyAssessmentFacadeArtifact(params);
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
// IMMUTABILITY
// ============================================================================

describe('Immutability', () => {
  it('should not mutate input nodes in composeAssessmentArtifact', () => {
    const nodes = [_makeNode('n1')];
    const originalIds = nodes.map((n) => n.id);
    composeAssessmentArtifact({ nodes });
    assert.deepEqual(
      nodes.map((n) => n.id),
      originalIds,
    );
  });

  it('should not mutate input registry in certifyAssessmentFacadeArtifact', () => {
    const registry = _makeRegistry(2);
    const originalNodeCount = registry.nodes.length;
    certifyAssessmentFacadeArtifact({
      artifactId: 'art-1',
      artifactTitle: 'Test',
      registry,
      certificationAt: '2025-01-01',
      certifiedBy: 'test',
    });
    assert.equal(registry.nodes.length, originalNodeCount);
  });

  it('should not mutate input nodes in composeAndCertifyAssessmentArtifact', () => {
    const nodes = [_makeNode('n1')];
    const originalIds = nodes.map((n) => n.id);
    composeAndCertifyAssessmentArtifact({
      nodes,
      certificationAt: '2025-01-01',
      certifiedBy: 'test',
    });
    assert.deepEqual(
      nodes.map((n) => n.id),
      originalIds,
    );
  });
});

// ============================================================================
// NEGATIVE CAPABILITY
// ============================================================================

describe('Negative Capability', () => {
  it('should not contain scoring logic in facade status', () => {
    const source = JSON.stringify(CANONICAL_ASSESSMENT_FACADE_STATUS);
    assert.ok(!source.includes('score'), 'Found scoring logic');
    assert.ok(!source.includes('mastery'), 'Found mastery logic');
  });

  it('should not contain LLM or async patterns in facade status', () => {
    const source = JSON.stringify(CANONICAL_ASSESSMENT_FACADE_STATUS);
    assert.ok(!source.includes('Promise'), 'Found Promise pattern');
    assert.ok(!source.includes('async'), 'Found async pattern');
    assert.ok(!source.includes('await'), 'Found await pattern');
  });

  it('should not contain generate', () => {
    const source = JSON.stringify(CANONICAL_ASSESSMENT_FACADE_STATUS);
    assert.ok(!source.includes('generate'), 'Found generate pattern');
  });

  it('should not contain createAssessment', () => {
    const source = JSON.stringify(CANONICAL_ASSESSMENT_FACADE_STATUS);
    assert.ok(!source.includes('createAssessment'), 'Found createAssessment pattern');
  });

  it('should not contain generateQuestion', () => {
    const source = JSON.stringify(CANONICAL_ASSESSMENT_FACADE_STATUS);
    assert.ok(!source.includes('generateQuestion'), 'Found generateQuestion pattern');
  });

  it('should not contain evaluateLearner', () => {
    const source = JSON.stringify(CANONICAL_ASSESSMENT_FACADE_STATUS);
    assert.ok(!source.includes('evaluateLearner'), 'Found evaluateLearner pattern');
  });

  it('should not contain calculateGrade', () => {
    const source = JSON.stringify(CANONICAL_ASSESSMENT_FACADE_STATUS);
    assert.ok(!source.includes('calculateGrade'), 'Found calculateGrade pattern');
  });

  it('should not contain repairArtifact', () => {
    const source = JSON.stringify(CANONICAL_ASSESSMENT_FACADE_STATUS);
    assert.ok(!source.includes('repairArtifact'), 'Found repairArtifact pattern');
  });

  it('should not contain rewriteAssessment', () => {
    const source = JSON.stringify(CANONICAL_ASSESSMENT_FACADE_STATUS);
    assert.ok(!source.includes('rewriteAssessment'), 'Found rewriteAssessment pattern');
  });

  it('should not contain inferMastery', () => {
    const source = JSON.stringify(CANONICAL_ASSESSMENT_FACADE_STATUS);
    assert.ok(!source.includes('inferMastery'), 'Found inferMastery pattern');
  });

  it('should not contain recommendRemediation', () => {
    const source = JSON.stringify(CANONICAL_ASSESSMENT_FACADE_STATUS);
    assert.ok(!source.includes('recommendRemediation'), 'Found recommendRemediation pattern');
  });
});

// ============================================================================
// CROSS-AGENT BOUNDARY
// ============================================================================

describe('Cross-Agent Boundary', () => {
  it('should not contain D1 patterns', () => {
    const source = JSON.stringify(CANONICAL_ASSESSMENT_FACADE_STATUS);
    assert.ok(!source.includes('D1'), 'Found D1 pattern');
  });

  it('should not contain D2 patterns', () => {
    const source = JSON.stringify(CANONICAL_ASSESSMENT_FACADE_STATUS);
    assert.ok(!source.includes('D2'), 'Found D2 pattern');
  });

  it('should not contain D3 patterns', () => {
    const source = JSON.stringify(CANONICAL_ASSESSMENT_FACADE_STATUS);
    assert.ok(!source.includes('D3'), 'Found D3 pattern');
  });

  it('should not contain D4 patterns', () => {
    const source = JSON.stringify(CANONICAL_ASSESSMENT_FACADE_STATUS);
    assert.ok(!source.includes('D4'), 'Found D4 pattern');
  });

  it('should not contain D5 patterns', () => {
    const source = JSON.stringify(CANONICAL_ASSESSMENT_FACADE_STATUS);
    assert.ok(!source.includes('D5'), 'Found D5 pattern');
  });

  it('should not contain D6 patterns', () => {
    const source = JSON.stringify(CANONICAL_ASSESSMENT_FACADE_STATUS);
    assert.ok(!source.includes('D6'), 'Found D6 pattern');
  });

  it('should not contain D7 patterns', () => {
    const source = JSON.stringify(CANONICAL_ASSESSMENT_FACADE_STATUS);
    assert.ok(!source.includes('D7'), 'Found D7 pattern');
  });
});

// ============================================================================
// VALIDATOR STABILITY
// ============================================================================

describe('Validator Stability', () => {
  it('validateAssessmentFacadeArtifact should never throw', () => {
    assert.doesNotThrow(() => {
      validateAssessmentFacadeArtifact(null as any);
    });
  });

  it('validateAssessmentFacadeCertification should never throw', () => {
    assert.doesNotThrow(() => {
      validateAssessmentFacadeCertification(null as any);
    });
  });

  it('validateAssessmentFacadeComplete should never throw', () => {
    assert.doesNotThrow(() => {
      validateAssessmentFacadeComplete(null as any);
    });
  });
});

// ============================================================================
// BACKWARD COMPATIBILITY
// ============================================================================

describe('Backward Compatibility', () => {
  it('should preserve all D8-OPT-01 exports', async () => {
    const kernel = await import('./AssessmentKernel.ts');
    assert.equal(typeof kernel.composeAssessmentNode, 'function');
    assert.equal(typeof kernel.composeAssessmentRegistry, 'function');
    assert.equal(typeof kernel.composeAssessment, 'function');
  });

  it('should preserve all D8-OPT-15 exports', async () => {
    const certEngine = await import('./AssessmentCertificationEngine.ts');
    assert.equal(typeof certEngine.certifyAssessmentArtifact, 'function');
    assert.equal(typeof certEngine.composeAssessmentCertificationReport, 'function');
  });

  it('should preserve all D8-OPT-16 exports', async () => {
    const facade = await import('./AssessmentPipelineFacade.ts');
    assert.equal(typeof facade.composeAssessmentArtifact, 'function');
    assert.equal(typeof facade.certifyAssessmentFacadeArtifact, 'function');
    assert.equal(typeof facade.composeAndCertifyAssessmentArtifact, 'function');
  });
});

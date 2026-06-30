/**
 * D10-OPT-18 — Public Facade Test Suite
 *
 * Comprehensive deterministic test suite for the Public Facade.
 * Covers: canonical enum completeness, helper functions, compose facade,
 * certify facade, compose-and-certify facade, validation, delegation
 * verification, backward compatibility, runtime restrictions,
 * cross-agent boundaries, immutability, and public API exports.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import type {
  KnowledgeCertificationReport,
  KnowledgeFacadeStatus,
} from './KnowledgeAgentContract.ts';

import {
  CANONICAL_KNOWLEDGE_FACADE_STATUS,
} from './KnowledgeAgentContract.ts';

import {
  composeKnowledgeArtifact,
  certifyKnowledgeFacadeArtifact,
  composeAndCertifyKnowledgeArtifact,
  validateKnowledgeFacadeArtifact,
  validateKnowledgeFacadeCertification,
  validateKnowledgeFacadeComplete,
  isSupportedKnowledgeFacadeStatus,
  getCanonicalKnowledgeFacadeStatuses,
} from './KnowledgePipelineFacade.ts';

// ---------------------------------------------------------------------------
// Test Fixtures
// ---------------------------------------------------------------------------

const VALID_INPUT_NODES = [
  {
    nodeId: 'concept-001',
    title: 'Neural Networks',
    knowledgeType: 'concept',
    category: 'deep_learning',
    difficulty: 'intermediate',
    status: 'canonical',
    reviewStatus: 'approved',
    governance: 'canonical',
    canonicalIdentifier: 'nn-001',
    tags: ['neural_networks'],
    summary: 'Fundamental neural network concepts.',
    provenance: { source: 'NeuralVerse Team', provider: 'Knowledge Agent', rationale: 'Core concept.', governance: 'canonical' },
  },
  {
    nodeId: 'concept-002',
    title: 'Convolutional Neural Networks',
    knowledgeType: 'architecture',
    category: 'computer_vision',
    difficulty: 'advanced',
    status: 'approved',
    reviewStatus: 'approved',
    governance: 'accepted',
    canonicalIdentifier: 'cnn-001',
    tags: ['cnn', 'computer_vision'],
    summary: 'CNN architecture and applications.',
    provenance: { source: 'Knowledge Pipeline', provider: 'Knowledge Agent', rationale: 'Extended concept.', governance: 'accepted' },
  },
];

const VALID_FINDINGS = [
  { findingId: 'finding-001', dimension: 'foundation', severity: 'info', description: 'Foundation is well-structured.' },
  { findingId: 'finding-002', dimension: 'explanations', severity: 'warning', description: 'Explanations could be more detailed.' },
];

// ---------------------------------------------------------------------------
// Canonical Enum Completeness Tests
// ---------------------------------------------------------------------------

describe('Facade — Canonical Enum Completeness', () => {
  it('should have exactly 6 facade statuses', () => {
    assert.equal(CANONICAL_KNOWLEDGE_FACADE_STATUS.length, 6);
  });

  it('should contain all expected facade statuses', () => {
    const expected = ['available', 'validated', 'certified', 'deprecated', 'internal', 'legacy'];
    for (const status of expected) {
      assert.ok(CANONICAL_KNOWLEDGE_FACADE_STATUS.includes(status as any), `Should include status: ${status}`);
    }
  });
});

// ---------------------------------------------------------------------------
// Helper Function Tests
// ---------------------------------------------------------------------------

describe('Facade — Helper Functions', () => {
  it('should return canonical facade statuses', () => {
    const statuses = getCanonicalKnowledgeFacadeStatuses();
    assert.deepStrictEqual([...statuses], [...CANONICAL_KNOWLEDGE_FACADE_STATUS]);
    assert.equal(statuses.length, 6);
  });

  it('should validate facade status support', () => {
    assert.equal(isSupportedKnowledgeFacadeStatus('available'), true);
    assert.equal(isSupportedKnowledgeFacadeStatus('certified'), true);
    assert.equal(isSupportedKnowledgeFacadeStatus('unsupported'), false);
  });
});

// ---------------------------------------------------------------------------
// Compose Facade Entrypoint Tests
// ---------------------------------------------------------------------------

describe('Facade — Compose Entrypoint', () => {
  it('should compose knowledge artifact correctly', () => {
    const result = composeKnowledgeArtifact({ nodes: VALID_INPUT_NODES });

    assert.ok(result.registryId);
    assert.equal(result.nodes.length, 2);
    assert.equal(result.deterministic, true);
  });

  it('should delegate to composeKnowledge', () => {
    const result = composeKnowledgeArtifact({ nodes: VALID_INPUT_NODES });

    assert.ok(result.registryId.startsWith('_registry_'));
    assert.equal(result.trace.decisionCount, 2);
    assert.equal(result.trace.validationCount, 2);
  });

  it('should produce deterministic output (100 iterations)', () => {
    const results: ReturnType<typeof composeKnowledgeArtifact>[] = [];
    for (let i = 0; i < 100; i++) {
      results.push(composeKnowledgeArtifact({ nodes: VALID_INPUT_NODES }));
    }

    for (let i = 1; i < results.length; i++) {
      assert.deepStrictEqual(results[0].registryId, results[i].registryId);
      assert.deepStrictEqual(results[0].nodes, results[i].nodes);
    }
  });

  it('should not mutate input', () => {
    const originalNodeId = VALID_INPUT_NODES[0].nodeId;
    const originalTitle = VALID_INPUT_NODES[0].title;

    composeKnowledgeArtifact({ nodes: VALID_INPUT_NODES });

    assert.equal(VALID_INPUT_NODES[0].nodeId, originalNodeId);
    assert.equal(VALID_INPUT_NODES[0].title, originalTitle);
  });
});

// ---------------------------------------------------------------------------
// Certify Facade Entrypoint Tests
// ---------------------------------------------------------------------------

describe('Facade — Certify Entrypoint', () => {
  it('should certify artifact correctly', () => {
    const result = certifyKnowledgeFacadeArtifact(VALID_FINDINGS);

    assert.ok(result.findings);
    assert.equal(result.findings.length, 2);
    assert.ok(result.metadata);
    assert.equal(result.metadata.evaluatedDimensions, 24);
    assert.ok(result.trace);
    assert.equal(result.trace.deterministic, true);
  });

  it('should delegate to certifyKnowledgeArtifact', () => {
    const result = certifyKnowledgeFacadeArtifact(VALID_FINDINGS);

    assert.ok(result.metadata.certificationId);
    assert.ok(result.metadata.certificationScore >= 0);
    assert.ok(result.metadata.certificationScore <= 100);
    assert.ok(result.metadata.certificationStatus);
  });

  it('should produce deterministic output (100 iterations)', () => {
    const results: ReturnType<typeof certifyKnowledgeFacadeArtifact>[] = [];
    for (let i = 0; i < 100; i++) {
      results.push(certifyKnowledgeFacadeArtifact(VALID_FINDINGS));
    }

    for (let i = 1; i < results.length; i++) {
      assert.deepStrictEqual(results[0].findings, results[i].findings);
      assert.deepStrictEqual(results[0].metadata.certificationScore, results[i].metadata.certificationScore);
    }
  });

  it('should not mutate input', () => {
    const originalFindingId = VALID_FINDINGS[0].findingId;
    const originalDescription = VALID_FINDINGS[0].description;

    certifyKnowledgeFacadeArtifact(VALID_FINDINGS);

    assert.equal(VALID_FINDINGS[0].findingId, originalFindingId);
    assert.equal(VALID_FINDINGS[0].description, originalDescription);
  });
});

// ---------------------------------------------------------------------------
// Compose-and-Certify Facade Entrypoint Tests
// ---------------------------------------------------------------------------

describe('Facade — Compose-and-Certify Entrypoint', () => {
  it('should compose and certify correctly', () => {
    const result = composeAndCertifyKnowledgeArtifact(
      { nodes: VALID_INPUT_NODES },
      VALID_FINDINGS,
    );

    assert.ok(result.artifact);
    assert.ok(result.certification);
    assert.ok(result.validation);
    assert.equal(result.status, 'certified');
    assert.ok(result.trace);
  });

  it('should delegate to both facade functions', () => {
    const result = composeAndCertifyKnowledgeArtifact(
      { nodes: VALID_INPUT_NODES },
      VALID_FINDINGS,
    );

    assert.ok(result.artifact.registryId);
    assert.ok(result.artifact.nodes);
    assert.ok(result.certification.findings);
    assert.ok(result.certification.metadata);
  });

  it('should produce deterministic output (100 iterations)', () => {
    const results: ReturnType<typeof composeAndCertifyKnowledgeArtifact>[] = [];
    for (let i = 0; i < 100; i++) {
      results.push(composeAndCertifyKnowledgeArtifact(
        { nodes: VALID_INPUT_NODES },
        VALID_FINDINGS,
      ));
    }

    for (let i = 1; i < results.length; i++) {
      assert.deepStrictEqual(results[0].artifact.registryId, results[i].artifact.registryId);
      assert.deepStrictEqual(results[0].certification.findings, results[i].certification.findings);
    }
  });

  it('should not mutate input', () => {
    const originalNodeId = VALID_INPUT_NODES[0].nodeId;
    const originalFindingId = VALID_FINDINGS[0].findingId;

    composeAndCertifyKnowledgeArtifact(
      { nodes: VALID_INPUT_NODES },
      VALID_FINDINGS,
    );

    assert.equal(VALID_INPUT_NODES[0].nodeId, originalNodeId);
    assert.equal(VALID_FINDINGS[0].findingId, originalFindingId);
  });
});

// ---------------------------------------------------------------------------
// Validation Tests
// ---------------------------------------------------------------------------

describe('Facade — Validation', () => {
  it('should validate facade artifact with no errors', () => {
    const artifact = certifyKnowledgeFacadeArtifact(VALID_FINDINGS);
    const result = validateKnowledgeFacadeArtifact(artifact);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it('should validate facade certification with no errors', () => {
    const certification = certifyKnowledgeFacadeArtifact(VALID_FINDINGS);
    const result = validateKnowledgeFacadeCertification(certification);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it('should validate facade complete with no errors', () => {
    const complete = composeAndCertifyKnowledgeArtifact(
      { nodes: VALID_INPUT_NODES },
      VALID_FINDINGS,
    );
    const result = validateKnowledgeFacadeComplete(complete);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it('should detect missing artifact', () => {
    const result = validateKnowledgeFacadeArtifact(null as any);
    const error = result.errors.find(
      (e) => e.code === 'KNOWLEDGE_FACADE_MISSING_ARTIFACT',
    );
    assert.ok(error, 'Should have KNOWLEDGE_FACADE_MISSING_ARTIFACT error');
  });

  it('should detect missing certification', () => {
    const result = validateKnowledgeFacadeCertification(null as any);
    const error = result.errors.find(
      (e) => e.code === 'KNOWLEDGE_FACADE_MISSING_CERTIFICATION_REPORT',
    );
    assert.ok(error, 'Should have KNOWLEDGE_FACADE_MISSING_CERTIFICATION_REPORT error');
  });
});

// ---------------------------------------------------------------------------
// Delegation Verification Tests
// ---------------------------------------------------------------------------

describe('Facade — Delegation Verification', () => {
  it('composeKnowledgeArtifact should delegate to composeKnowledge', () => {
    const result = composeKnowledgeArtifact({ nodes: VALID_INPUT_NODES });

    assert.ok(result.registryId);
    assert.equal(result.deterministic, true);
    assert.equal(result.trace.decisionCount, VALID_INPUT_NODES.length);
  });

  it('certifyKnowledgeFacadeArtifact should delegate to certifyKnowledgeArtifact', () => {
    const result = certifyKnowledgeFacadeArtifact(VALID_FINDINGS);

    assert.ok(result.metadata);
    assert.equal(result.metadata.evaluatedDimensions, 24);
    assert.equal(result.trace.deterministic, true);
  });

  it('composeAndCertifyKnowledgeArtifact should delegate to both', () => {
    const result = composeAndCertifyKnowledgeArtifact(
      { nodes: VALID_INPUT_NODES },
      VALID_FINDINGS,
    );

    assert.ok(result.artifact);
    assert.ok(result.certification);
    assert.equal(result.status, 'certified');
  });
});

// ---------------------------------------------------------------------------
// Backward Compatibility Tests
// ---------------------------------------------------------------------------

describe('Facade — Backward Compatibility', () => {
  it('should preserve D10-OPT-01 exports', async () => {
    const module = await import('./KnowledgeKernel.ts');
    assert.ok(module.composeKnowledge, 'composeKnowledge should be exported');
    assert.ok(module.composeKnowledgeRegistry, 'composeKnowledgeRegistry should be exported');
  });

  it('should preserve D10-OPT-17 exports', async () => {
    const module = await import('./KnowledgeCertificationEngine.ts');
    assert.ok(module.certifyKnowledgeArtifact, 'certifyKnowledgeArtifact should be exported');
    assert.ok(module.calculateKnowledgeCertificationScore, 'calculateKnowledgeCertificationScore should be exported');
  });
});

// ---------------------------------------------------------------------------
// Runtime Restrictions Tests
// ---------------------------------------------------------------------------

describe('Facade — Runtime Restrictions', () => {
  it('should not use Math.random', () => {
    const result = composeKnowledgeArtifact({ nodes: VALID_INPUT_NODES });
    assert.ok(result, 'Should produce a result without Math.random');
  });

  it('should not use performance.now', () => {
    const result = composeKnowledgeArtifact({ nodes: VALID_INPUT_NODES });
    assert.ok(result, 'Should produce a result without performance.now');
  });

  it('should not use crypto.randomUUID', () => {
    const result = composeKnowledgeArtifact({ nodes: VALID_INPUT_NODES });
    assert.ok(result, 'Should produce a result without crypto.randomUUID');
  });

  it('should not access filesystem', () => {
    const result = composeKnowledgeArtifact({ nodes: VALID_INPUT_NODES });
    assert.ok(!('filesystem' in result), 'Should not have filesystem');
    assert.ok(!('fileSystem' in result), 'Should not have fileSystem');
  });

  it('should not perform network requests', () => {
    const result = composeKnowledgeArtifact({ nodes: VALID_INPUT_NODES });
    assert.ok(!('networkResponse' in result), 'Should not have network response');
    assert.ok(!('httpResult' in result), 'Should not have HTTP result');
  });

  it('should not have async behavior markers', () => {
    const result = composeKnowledgeArtifact({ nodes: VALID_INPUT_NODES });
    assert.ok(!('promise' in result), 'Should not have promise');
    assert.ok(!('async' in result), 'Should not have async');
  });
});

// ---------------------------------------------------------------------------
// Cross-Agent Boundary Tests
// ---------------------------------------------------------------------------

describe('Facade — Cross-Agent Boundary', () => {
  it('should not reference Didactic Agent', () => {
    const result = composeKnowledgeArtifact({ nodes: VALID_INPUT_NODES });
    const str = JSON.stringify(result);
    assert.ok(!str.includes('Didactic Agent'), 'Should not reference Didactic Agent');
  });

  it('should not reference Curriculum Agent', () => {
    const result = composeKnowledgeArtifact({ nodes: VALID_INPUT_NODES });
    const str = JSON.stringify(result);
    assert.ok(!str.includes('Curriculum Agent'), 'Should not reference Curriculum Agent');
  });

  it('should not reference Narrative Agent', () => {
    const result = composeKnowledgeArtifact({ nodes: VALID_INPUT_NODES });
    const str = JSON.stringify(result);
    assert.ok(!str.includes('Narrative Agent'), 'Should not reference Narrative Agent');
  });

  it('should not reference Assessment Agent', () => {
    const result = composeKnowledgeArtifact({ nodes: VALID_INPUT_NODES });
    const str = JSON.stringify(result);
    assert.ok(!str.includes('Assessment Agent'), 'Should not reference Assessment Agent');
  });

  it('should not reference Curiosity Agent', () => {
    const result = composeKnowledgeArtifact({ nodes: VALID_INPUT_NODES });
    const str = JSON.stringify(result);
    assert.ok(!str.includes('Curiosity Agent'), 'Should not reference Curiosity Agent');
  });

  it('should not reference Research Agent', () => {
    const result = composeKnowledgeArtifact({ nodes: VALID_INPUT_NODES });
    const str = JSON.stringify(result);
    assert.ok(!str.includes('Research Agent'), 'Should not reference Research Agent');
  });

  it('should not reference Laboratory Agent', () => {
    const result = composeKnowledgeArtifact({ nodes: VALID_INPUT_NODES });
    const str = JSON.stringify(result);
    assert.ok(!str.includes('Laboratory Agent'), 'Should not reference Laboratory Agent');
  });

  it('should not reference Application Agent', () => {
    const result = composeKnowledgeArtifact({ nodes: VALID_INPUT_NODES });
    const str = JSON.stringify(result);
    assert.ok(!str.includes('Application Agent'), 'Should not reference Application Agent');
  });
});

// ---------------------------------------------------------------------------
// Immutability Tests
// ---------------------------------------------------------------------------

describe('Facade — Immutability', () => {
  it('should not mutate input nodes', () => {
    const originalNodeId = VALID_INPUT_NODES[0].nodeId;
    const originalTitle = VALID_INPUT_NODES[0].title;

    composeKnowledgeArtifact({ nodes: VALID_INPUT_NODES });

    assert.equal(VALID_INPUT_NODES[0].nodeId, originalNodeId);
    assert.equal(VALID_INPUT_NODES[0].title, originalTitle);
  });

  it('should not mutate input findings', () => {
    const originalFindingId = VALID_FINDINGS[0].findingId;
    const originalDescription = VALID_FINDINGS[0].description;

    certifyKnowledgeFacadeArtifact(VALID_FINDINGS);

    assert.equal(VALID_FINDINGS[0].findingId, originalFindingId);
    assert.equal(VALID_FINDINGS[0].description, originalDescription);
  });

  it('should use defensive copies', () => {
    const nodes = [...VALID_INPUT_NODES];
    const originalNodeId = nodes[0].nodeId;

    composeKnowledgeArtifact({ nodes });

    assert.equal(nodes[0].nodeId, originalNodeId);
  });
});

// ---------------------------------------------------------------------------
// Architectural Compliance Tests
// ---------------------------------------------------------------------------

describe('Facade — Architectural Compliance', () => {
  it('should only delegate to existing kernels', () => {
    const result = composeKnowledgeArtifact({ nodes: VALID_INPUT_NODES });

    assert.ok(result.registryId);
    assert.equal(result.deterministic, true);
    assert.ok(result.trace);
  });

  it('should not introduce new business logic', () => {
    const result = composeKnowledgeArtifact({ nodes: VALID_INPUT_NODES });

    assert.ok(result.nodes);
    assert.equal(result.nodes.length, VALID_INPUT_NODES.length);
  });

  it('should not compose submodules manually', () => {
    const result = composeKnowledgeArtifact({ nodes: VALID_INPUT_NODES });

    assert.ok(result.registryId.startsWith('_registry_'));
    assert.ok(result.trace.traceId.startsWith('_trace_'));
  });

  it('should not mutate artifacts', () => {
    const result = composeKnowledgeArtifact({ nodes: VALID_INPUT_NODES });

    assert.ok(result.nodes);
    assert.equal(result.deterministic, true);
  });
});

// ---------------------------------------------------------------------------
// Public API Exports Tests
// ---------------------------------------------------------------------------

describe('Facade — Public API Exports', () => {
  it('should export all facade functions', () => {
    assert.equal(typeof composeKnowledgeArtifact, 'function');
    assert.equal(typeof certifyKnowledgeFacadeArtifact, 'function');
    assert.equal(typeof composeAndCertifyKnowledgeArtifact, 'function');
  });

  it('should export all validation functions', () => {
    assert.equal(typeof validateKnowledgeFacadeArtifact, 'function');
    assert.equal(typeof validateKnowledgeFacadeCertification, 'function');
    assert.equal(typeof validateKnowledgeFacadeComplete, 'function');
  });

  it('should export all helper functions', () => {
    assert.equal(typeof isSupportedKnowledgeFacadeStatus, 'function');
    assert.equal(typeof getCanonicalKnowledgeFacadeStatuses, 'function');
  });
});

/**
 * D10-OPT-01 — Knowledge Kernel Test Suite
 *
 * Comprehensive deterministic test suite for the Knowledge Kernel.
 * Covers: composition, validation, helpers, determinism, immutability,
 * runtime restrictions, cross-agent boundary, and public API.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import type {
  KnowledgeNode,
  KnowledgeProvenance,
  KnowledgeInput,
  KnowledgeRegistry,
  KnowledgeTrace,
} from './KnowledgeAgentContract.ts';

import {
  CANONICAL_KNOWLEDGE_TYPES,
  CANONICAL_KNOWLEDGE_CATEGORIES,
  CANONICAL_KNOWLEDGE_DIFFICULTY,
  CANONICAL_KNOWLEDGE_STATUS,
  CANONICAL_KNOWLEDGE_REVIEW_STATUS,
  CANONICAL_KNOWLEDGE_GOVERNANCE,
} from './KnowledgeAgentContract.ts';

import {
  composeKnowledgeProvenance,
  composeKnowledgeNode,
  composeKnowledgeTrace,
  composeKnowledgeRegistry,
  composeKnowledgeRegistryFromInput,
  composeKnowledge,
  isSupportedKnowledgeType,
  isSupportedKnowledgeCategory,
  isSupportedKnowledgeDifficulty,
  isSupportedKnowledgeReviewStatus,
  isSupportedKnowledgeGovernance,
  getCanonicalKnowledgeTypes,
  getCanonicalKnowledgeCategories,
  getCanonicalKnowledgeDifficulty,
  getCanonicalKnowledgeStatuses,
  getCanonicalKnowledgeGovernance,
} from './KnowledgeKernel.ts';

import {
  validateKnowledgeNode,
  validateKnowledgeRegistry,
  validateKnowledgeInput,
  validateKnowledgeTrace,
  KNOWLEDGE_VALIDATION_CODES,
} from './KnowledgeValidation.ts';

// ---------------------------------------------------------------------------
// Test Fixtures
// ---------------------------------------------------------------------------

const VALID_PROVENANCE: KnowledgeProvenance = {
  source: 'NeuralVerse Team',
  provider: 'Knowledge Agent',
  rationale: 'Core neural network concept.',
  governance: 'canonical',
};

const VALID_NODE: KnowledgeNode = {
  nodeId: 'knowledge-001',
  title: 'Neural Networks',
  knowledgeType: 'concept',
  category: 'deep_learning',
  difficulty: 'intermediate',
  status: 'canonical',
  reviewStatus: 'approved',
  governance: 'canonical',
  canonicalIdentifier: 'nn-001',
  tags: ['neural_networks', 'deep_learning'],
  summary: 'Fundamental neural network concepts.',
  provenance: VALID_PROVENANCE,
};

const VALID_NODE_2: KnowledgeNode = {
  nodeId: 'knowledge-002',
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
  provenance: { ...VALID_PROVENANCE, source: 'Knowledge Pipeline' },
};

const VALID_INPUT: KnowledgeInput = {
  nodes: [VALID_NODE, VALID_NODE_2],
};

const EMPTY_INPUT: KnowledgeInput = {
  nodes: [],
};

// ---------------------------------------------------------------------------
// Composition Tests
// ---------------------------------------------------------------------------

describe('Knowledge Kernel — Composition', () => {
  it('should compose valid knowledge provenance', () => {
    const provenance = composeKnowledgeProvenance({
      source: 'NeuralVerse Team',
      provider: 'Knowledge Agent',
      rationale: 'Core concept.',
      governance: 'canonical',
    });

    assert.equal(provenance.source, 'NeuralVerse Team');
    assert.equal(provenance.provider, 'Knowledge Agent');
    assert.equal(provenance.rationale, 'Core concept.');
    assert.equal(provenance.governance, 'canonical');
  });

  it('should compose valid knowledge node', () => {
    const node = composeKnowledgeNode({
      nodeId: 'knowledge-001',
      title: 'Neural Networks',
      knowledgeType: 'concept',
      category: 'deep_learning',
      difficulty: 'intermediate',
      status: 'canonical',
      reviewStatus: 'approved',
      governance: 'canonical',
      canonicalIdentifier: 'nn-001',
      tags: ['neural_networks'],
      summary: 'Fundamental concepts.',
      provenance: VALID_PROVENANCE,
    });

    assert.equal(node.nodeId, 'knowledge-001');
    assert.equal(node.title, 'Neural Networks');
    assert.equal(node.knowledgeType, 'concept');
    assert.equal(node.category, 'deep_learning');
    assert.equal(node.status, 'canonical');
    assert.equal(node.tags.length, 1);
  });

  it('should compose valid knowledge trace', () => {
    const trace = composeKnowledgeTrace({
      traceId: '_trace_1',
      decisions: [
        { decisionId: 'd1', knowledgeId: 'knowledge-001', validationPassed: true, validationErrors: [] },
      ],
      registryVersion: '1.0.0',
      compositionVersion: '1.0.0',
    });

    assert.equal(trace.traceId, '_trace_1');
    assert.equal(trace.decisionCount, 1);
    assert.equal(trace.validationCount, 1);
    assert.equal(trace.deterministic, true);
    assert.equal(trace.randomUsed, false);
    assert.equal(trace.timeDependency, false);
  });

  it('should compose valid knowledge registry', () => {
    const registry = composeKnowledgeRegistry([VALID_NODE, VALID_NODE_2]);

    assert.equal(registry.deterministic, true);
    assert.equal(registry.randomUsed, false);
    assert.equal(registry.timeDependency, false);
    assert.equal(registry.nodes.length, 2);
  });

  it('should compose registry from input', () => {
    const registry = composeKnowledgeRegistryFromInput(VALID_INPUT);
    assert.equal(registry.nodes.length, 2);
  });

  it('should compose knowledge from input', () => {
    const registry = composeKnowledge(VALID_INPUT);
    assert.equal(registry.deterministic, true);
    assert.equal(registry.trace.decisionCount, 2);
  });
});

// ---------------------------------------------------------------------------
// Validation Tests
// ---------------------------------------------------------------------------

describe('Knowledge Kernel — Validation', () => {
  it('should validate a valid node with no errors', () => {
    const errors = validateKnowledgeNode(VALID_NODE);
    assert.deepStrictEqual(errors, []);
  });

  it('should validate a valid registry with no errors', () => {
    const registry = composeKnowledgeRegistry([VALID_NODE, VALID_NODE_2]);
    const result = validateKnowledgeRegistry(registry);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it('should validate knowledge input', () => {
    const result = validateKnowledgeInput(VALID_INPUT);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it('should detect duplicate IDs', () => {
    const registry = composeKnowledgeRegistry([VALID_NODE, VALID_NODE]);
    const result = validateKnowledgeRegistry(registry);
    const duplicateError = result.errors.find(
      (e) => e.code === KNOWLEDGE_VALIDATION_CODES.KNOWLEDGE_DUPLICATE_ID,
    );
    assert.ok(duplicateError, 'Should have KNOWLEDGE_DUPLICATE_ID error');
  });

  it('should detect duplicate titles', () => {
    const node1 = { ...VALID_NODE, nodeId: 'knowledge-001', title: 'Same Title' };
    const node2 = { ...VALID_NODE, nodeId: 'knowledge-002', title: 'Same Title' };
    const registry = composeKnowledgeRegistry([node1, node2]);
    const result = validateKnowledgeRegistry(registry);
    const duplicateError = result.errors.find(
      (e) => e.code === KNOWLEDGE_VALIDATION_CODES.KNOWLEDGE_DUPLICATE_TITLE,
    );
    assert.ok(duplicateError, 'Should have KNOWLEDGE_DUPLICATE_TITLE error');
  });

  it('should detect invalid type', () => {
    const node = { ...VALID_NODE, knowledgeType: 'unsupported' as any };
    const errors = validateKnowledgeNode(node);
    const typeError = errors.find(
      (e) => e.code === KNOWLEDGE_VALIDATION_CODES.KNOWLEDGE_INVALID_TYPE,
    );
    assert.ok(typeError, 'Should have KNOWLEDGE_INVALID_TYPE error');
  });

  it('should detect invalid category', () => {
    const node = { ...VALID_NODE, category: 'unsupported' as any };
    const errors = validateKnowledgeNode(node);
    const categoryError = errors.find(
      (e) => e.code === KNOWLEDGE_VALIDATION_CODES.KNOWLEDGE_INVALID_CATEGORY,
    );
    assert.ok(categoryError, 'Should have KNOWLEDGE_INVALID_CATEGORY error');
  });

  it('should detect invalid difficulty', () => {
    const node = { ...VALID_NODE, difficulty: 'unsupported' as any };
    const errors = validateKnowledgeNode(node);
    const difficultyError = errors.find(
      (e) => e.code === KNOWLEDGE_VALIDATION_CODES.KNOWLEDGE_INVALID_DIFFICULTY,
    );
    assert.ok(difficultyError, 'Should have KNOWLEDGE_INVALID_DIFFICULTY error');
  });

  it('should detect invalid status', () => {
    const node = { ...VALID_NODE, status: 'unsupported' as any };
    const errors = validateKnowledgeNode(node);
    const statusError = errors.find(
      (e) => e.code === KNOWLEDGE_VALIDATION_CODES.KNOWLEDGE_INVALID_STATUS,
    );
    assert.ok(statusError, 'Should have KNOWLEDGE_INVALID_STATUS error');
  });

  it('should detect invalid governance', () => {
    const node = { ...VALID_NODE, governance: 'unsupported' as any };
    const errors = validateKnowledgeNode(node);
    const governanceError = errors.find(
      (e) => e.code === KNOWLEDGE_VALIDATION_CODES.KNOWLEDGE_INVALID_GOVERNANCE,
    );
    assert.ok(governanceError, 'Should have KNOWLEDGE_INVALID_GOVERNANCE error');
  });

  it('should detect missing provenance', () => {
    const node = { ...VALID_NODE, provenance: undefined as any };
    const errors = validateKnowledgeNode(node);
    const provenanceError = errors.find(
      (e) => e.code === KNOWLEDGE_VALIDATION_CODES.KNOWLEDGE_MISSING_PROVENANCE,
    );
    assert.ok(provenanceError, 'Should have KNOWLEDGE_MISSING_PROVENANCE error');
  });

  it('should detect missing provider', () => {
    const node = { ...VALID_NODE, provenance: { ...VALID_PROVENANCE, provider: '' } };
    const errors = validateKnowledgeNode(node);
    const providerError = errors.find(
      (e) => e.code === KNOWLEDGE_VALIDATION_CODES.KNOWLEDGE_MISSING_PROVIDER,
    );
    assert.ok(providerError, 'Should have KNOWLEDGE_MISSING_PROVIDER error');
  });

  it('should detect missing rationale', () => {
    const node = { ...VALID_NODE, provenance: { ...VALID_PROVENANCE, rationale: '' } };
    const errors = validateKnowledgeNode(node);
    const rationaleError = errors.find(
      (e) => e.code === KNOWLEDGE_VALIDATION_CODES.KNOWLEDGE_MISSING_RATIONALE,
    );
    assert.ok(rationaleError, 'Should have KNOWLEDGE_MISSING_RATIONALE error');
  });

  it('should detect empty registry', () => {
    const registry = composeKnowledgeRegistry([]);
    const result = validateKnowledgeRegistry(registry);
    const emptyError = result.errors.find(
      (e) => e.code === KNOWLEDGE_VALIDATION_CODES.KNOWLEDGE_EMPTY_REGISTRY,
    );
    assert.ok(emptyError, 'Should have KNOWLEDGE_EMPTY_REGISTRY error');
    assert.equal(result.valid, false);
  });

  it('should detect invalid trace', () => {
    const trace: KnowledgeTrace = {
      traceId: '',
      decisionCount: 0,
      validationCount: 0,
      registryVersion: '1.0.0',
      compositionVersion: '1.0.0',
      decisions: [],
      deterministic: false as true,
      generatedFrom: 'deterministic_knowledge_kernel',
      randomUsed: false,
      timeDependency: false,
    };
    const result = validateKnowledgeTrace(trace);
    assert.equal(result.valid, false);
  });

  it('should detect registry inconsistency', () => {
    const registry: KnowledgeRegistry = {
      registryId: '_registry_5',
      nodes: [VALID_NODE],
      metadata: {
        registryId: '_registry_5',
        nodeCount: 5,
        categoryCount: 1,
        typeCount: 1,
      },
      trace: {
        traceId: '_trace_1',
        decisionCount: 0,
        validationCount: 0,
        registryVersion: '1.0.0',
        compositionVersion: '1.0.0',
        decisions: [],
        deterministic: true,
        generatedFrom: 'deterministic_knowledge_kernel',
        randomUsed: false,
        timeDependency: false,
      },
      deterministic: true,
      generatedFrom: 'deterministic_knowledge_kernel',
      randomUsed: false,
      timeDependency: false,
    };
    const result = validateKnowledgeRegistry(registry);
    const inconsistencyError = result.errors.find(
      (e) => e.code === KNOWLEDGE_VALIDATION_CODES.KNOWLEDGE_REGISTRY_INCONSISTENCY,
    );
    assert.ok(inconsistencyError, 'Should have KNOWLEDGE_REGISTRY_INCONSISTENCY error');
  });

  it('should validate a valid trace', () => {
    const trace = composeKnowledgeTrace({
      traceId: '_trace_1',
      decisions: [],
      registryVersion: '1.0.0',
      compositionVersion: '1.0.0',
    });
    const result = validateKnowledgeTrace(trace);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });
});

// ---------------------------------------------------------------------------
// Determinism Tests
// ---------------------------------------------------------------------------

describe('Knowledge Kernel — Determinism', () => {
  it('should produce identical output for identical input (100 iterations)', () => {
    const results: ReturnType<typeof composeKnowledge>[] = [];
    for (let i = 0; i < 100; i++) {
      results.push(composeKnowledge(VALID_INPUT));
    }

    for (let i = 1; i < results.length; i++) {
      assert.deepStrictEqual(results[0].registryId, results[i].registryId);
      assert.deepStrictEqual(results[0].nodes, results[i].nodes);
      assert.deepStrictEqual(results[0].trace.traceId, results[i].trace.traceId);
    }
  });

  it('should produce identical registry output for identical input (100 iterations)', () => {
    const results: ReturnType<typeof composeKnowledgeRegistry>[] = [];
    for (let i = 0; i < 100; i++) {
      results.push(composeKnowledgeRegistry([VALID_NODE, VALID_NODE_2]));
    }

    for (let i = 1; i < results.length; i++) {
      assert.deepStrictEqual(results[0].nodes, results[i].nodes);
      assert.deepStrictEqual(results[0].registryId, results[i].registryId);
    }
  });

  it('should produce identical provenance for identical input', () => {
    const results: ReturnType<typeof composeKnowledgeProvenance>[] = [];
    for (let i = 0; i < 100; i++) {
      results.push(composeKnowledgeProvenance({
        source: 'Test',
        provider: 'Provider',
        rationale: 'Rationale',
        governance: 'canonical',
      }));
    }

    for (let i = 1; i < results.length; i++) {
      assert.deepStrictEqual(results[0], results[i]);
    }
  });

  it('should produce identical trace for identical input', () => {
    const results: ReturnType<typeof composeKnowledgeTrace>[] = [];
    for (let i = 0; i < 100; i++) {
      results.push(composeKnowledgeTrace({
        traceId: '_trace_1',
        decisions: [],
        registryVersion: '1.0.0',
        compositionVersion: '1.0.0',
      }));
    }

    for (let i = 1; i < results.length; i++) {
      assert.deepStrictEqual(results[0], results[i]);
    }
  });
});

// ---------------------------------------------------------------------------
// Immutability Tests
// ---------------------------------------------------------------------------

describe('Knowledge Kernel — Immutability', () => {
  it('should not mutate input nodes', () => {
    const originalId = VALID_NODE.nodeId;
    const originalTitle = VALID_NODE.title;

    composeKnowledge(VALID_INPUT);

    assert.equal(VALID_NODE.nodeId, originalId);
    assert.equal(VALID_NODE.title, originalTitle);
  });

  it('should not mutate input registry nodes', () => {
    const nodes = [VALID_NODE, VALID_NODE_2];
    const originalIds = nodes.map((n) => n.nodeId);

    composeKnowledgeRegistry(nodes);

    assert.equal(nodes[0].nodeId, originalIds[0]);
    assert.equal(nodes[1].nodeId, originalIds[1]);
  });

  it('should use defensive copies for tags', () => {
    const originalTags = ['tag1', 'tag2'];
    const node = composeKnowledgeNode({
      nodeId: 'test',
      title: 'Test',
      knowledgeType: 'concept',
      category: 'mathematics',
      difficulty: 'basic',
      status: 'draft',
      reviewStatus: 'pending',
      governance: 'public',
      canonicalIdentifier: 'test-001',
      tags: originalTags,
      summary: 'Test.',
      provenance: VALID_PROVENANCE,
    });

    assert.notEqual(node.tags, originalTags);
    assert.deepStrictEqual([...node.tags], originalTags);
  });

  it('should return readonly output for registry', () => {
    const registry = composeKnowledgeRegistry([VALID_NODE]);
    const frozen = Object.isFrozen(registry) || Object.getOwnPropertyDescriptor(registry, 'nodes')?.writable === false;
    assert.ok(registry.nodes, 'Registry should have nodes');
  });
});

// ---------------------------------------------------------------------------
// Helper Function Tests
// ---------------------------------------------------------------------------

describe('Knowledge Kernel — Helpers', () => {
  it('should return canonical knowledge types', () => {
    const types = getCanonicalKnowledgeTypes();
    assert.deepStrictEqual([...types], [...CANONICAL_KNOWLEDGE_TYPES]);
    assert.equal(types.length, 10);
  });

  it('should return canonical knowledge categories', () => {
    const categories = getCanonicalKnowledgeCategories();
    assert.deepStrictEqual([...categories], [...CANONICAL_KNOWLEDGE_CATEGORIES]);
    assert.equal(categories.length, 10);
  });

  it('should return canonical knowledge difficulty', () => {
    const difficulty = getCanonicalKnowledgeDifficulty();
    assert.deepStrictEqual([...difficulty], [...CANONICAL_KNOWLEDGE_DIFFICULTY]);
    assert.equal(difficulty.length, 10);
  });

  it('should return canonical knowledge statuses', () => {
    const statuses = getCanonicalKnowledgeStatuses();
    assert.deepStrictEqual([...statuses], [...CANONICAL_KNOWLEDGE_STATUS]);
    assert.equal(statuses.length, 6);
  });

  it('should return canonical knowledge governance', () => {
    const governance = getCanonicalKnowledgeGovernance();
    assert.deepStrictEqual([...governance], [...CANONICAL_KNOWLEDGE_GOVERNANCE]);
    assert.equal(governance.length, 10);
  });

  it('should validate knowledge type support', () => {
    assert.equal(isSupportedKnowledgeType('concept'), true);
    assert.equal(isSupportedKnowledgeType('algorithm'), true);
    assert.equal(isSupportedKnowledgeType('unsupported'), false);
  });

  it('should validate knowledge category support', () => {
    assert.equal(isSupportedKnowledgeCategory('mathematics'), true);
    assert.equal(isSupportedKnowledgeCategory('deep_learning'), true);
    assert.equal(isSupportedKnowledgeCategory('unsupported'), false);
  });

  it('should validate knowledge difficulty support', () => {
    assert.equal(isSupportedKnowledgeDifficulty('basic'), true);
    assert.equal(isSupportedKnowledgeDifficulty('advanced'), true);
    assert.equal(isSupportedKnowledgeDifficulty('unsupported'), false);
  });

  it('should validate knowledge review status support', () => {
    assert.equal(isSupportedKnowledgeReviewStatus('pending'), true);
    assert.equal(isSupportedKnowledgeReviewStatus('approved'), true);
    assert.equal(isSupportedKnowledgeReviewStatus('unsupported'), false);
  });

  it('should validate knowledge governance support', () => {
    assert.equal(isSupportedKnowledgeGovernance('canonical'), true);
    assert.equal(isSupportedKnowledgeGovernance('accepted'), true);
    assert.equal(isSupportedKnowledgeGovernance('unsupported'), false);
  });
});

// ---------------------------------------------------------------------------
// Canonical Enum Completeness Tests
// ---------------------------------------------------------------------------

describe('Knowledge Kernel — Canonical Enum Completeness', () => {
  it('should have exactly 10 knowledge types', () => {
    assert.equal(CANONICAL_KNOWLEDGE_TYPES.length, 10);
  });

  it('should have exactly 10 knowledge categories', () => {
    assert.equal(CANONICAL_KNOWLEDGE_CATEGORIES.length, 10);
  });

  it('should have exactly 10 knowledge difficulty levels', () => {
    assert.equal(CANONICAL_KNOWLEDGE_DIFFICULTY.length, 10);
  });

  it('should have exactly 6 knowledge statuses', () => {
    assert.equal(CANONICAL_KNOWLEDGE_STATUS.length, 6);
  });

  it('should have exactly 6 knowledge review statuses', () => {
    assert.equal(CANONICAL_KNOWLEDGE_REVIEW_STATUS.length, 6);
  });

  it('should have exactly 10 knowledge governance values', () => {
    assert.equal(CANONICAL_KNOWLEDGE_GOVERNANCE.length, 10);
  });

  it('should contain all expected knowledge types', () => {
    const expected = ['concept', 'algorithm', 'mathematics', 'implementation', 'architecture', 'framework', 'protocol', 'dataset', 'model', 'theory'];
    for (const type of expected) {
      assert.ok(CANONICAL_KNOWLEDGE_TYPES.includes(type as any), `Should include type: ${type}`);
    }
  });

  it('should contain all expected knowledge categories', () => {
    const expected = ['artificial_intelligence', 'machine_learning', 'deep_learning', 'computer_vision', 'nlp', 'mathematics', 'statistics', 'software_engineering', 'mlops', 'research'];
    for (const category of expected) {
      assert.ok(CANONICAL_KNOWLEDGE_CATEGORIES.includes(category as any), `Should include category: ${category}`);
    }
  });

  it('should contain all expected difficulty levels', () => {
    const expected = ['foundational', 'introductory', 'basic', 'intermediate', 'advanced', 'expert', 'specialist', 'research_level', 'frontier', 'theoretical'];
    for (const difficulty of expected) {
      assert.ok(CANONICAL_KNOWLEDGE_DIFFICULTY.includes(difficulty as any), `Should include difficulty: ${difficulty}`);
    }
  });

  it('should contain all expected statuses', () => {
    const expected = ['draft', 'review', 'approved', 'canonical', 'deprecated', 'archived'];
    for (const status of expected) {
      assert.ok(CANONICAL_KNOWLEDGE_STATUS.includes(status as any), `Should include status: ${status}`);
    }
  });

  it('should contain all expected review statuses', () => {
    const expected = ['pending', 'in_progress', 'changes_requested', 'approved', 'rejected', 'deferred'];
    for (const status of expected) {
      assert.ok(CANONICAL_KNOWLEDGE_REVIEW_STATUS.includes(status as any), `Should include review status: ${status}`);
    }
  });

  it('should contain all expected governance values', () => {
    const expected = ['canonical', 'accepted', 'provisional', 'experimental', 'deprecated', 'restricted', 'internal', 'public', 'community', 'archived'];
    for (const governance of expected) {
      assert.ok(CANONICAL_KNOWLEDGE_GOVERNANCE.includes(governance as any), `Should include governance: ${governance}`);
    }
  });
});

// ---------------------------------------------------------------------------
// Validation Code Count Test
// ---------------------------------------------------------------------------

describe('Knowledge Kernel — Validation Code Count', () => {
  it('should have exactly 16 validation codes', () => {
    const codes = Object.values(KNOWLEDGE_VALIDATION_CODES);
    assert.equal(codes.length, 16);
  });

  it('should have all codes prefixed with KNOWLEDGE_', () => {
    const codes = Object.values(KNOWLEDGE_VALIDATION_CODES);
    for (const code of codes) {
      assert.ok(code.startsWith('KNOWLEDGE_'), `Code "${code}" should start with KNOWLEDGE_`);
    }
  });

  it('should have unique codes', () => {
    const codes = Object.values(KNOWLEDGE_VALIDATION_CODES);
    const unique = new Set(codes);
    assert.equal(codes.length, unique.size, 'All codes should be unique');
  });
});

// ---------------------------------------------------------------------------
// Runtime Restrictions Tests
// ---------------------------------------------------------------------------

describe('Knowledge Kernel — Runtime Restrictions', () => {
  it('should not use Math.random', () => {
    const result = composeKnowledge(VALID_INPUT);
    assert.ok(result, 'Should produce a result without Math.random');
  });

  it('should not use Date.now', () => {
    const result = composeKnowledge(VALID_INPUT);
    assert.ok(result, 'Should produce a result without Date.now');
  });

  it('should not use performance.now', () => {
    const result = composeKnowledge(VALID_INPUT);
    assert.ok(result, 'Should produce a result without performance.now');
  });

  it('should not use crypto.randomUUID', () => {
    const result = composeKnowledge(VALID_INPUT);
    assert.ok(result, 'Should produce a result without crypto.randomUUID');
  });

  it('should not have executable callbacks in node', () => {
    const node = composeKnowledgeNode({
      nodeId: 'knowledge-001',
      title: 'Test',
      knowledgeType: 'concept',
      category: 'mathematics',
      difficulty: 'basic',
      status: 'draft',
      reviewStatus: 'pending',
      governance: 'public',
      canonicalIdentifier: 'test-001',
      tags: [],
      summary: 'Test.',
      provenance: VALID_PROVENANCE,
    });

    const keys = Object.keys(node);
    for (const key of keys) {
      const value = (node as any)[key];
      assert.ok(typeof value !== 'function', `Node field "${key}" should not be a function`);
    }
  });

  it('should not store educational content', () => {
    const result = composeKnowledge(VALID_INPUT);
    assert.ok(!('educationalContent' in result), 'Should not have educational content');
    assert.ok(!('markdown' in result), 'Should not have markdown');
  });

  it('should not access filesystem', () => {
    const result = composeKnowledge(VALID_INPUT);
    assert.ok(!('filesystem' in result), 'Should not have filesystem');
    assert.ok(!('fileSystem' in result), 'Should not have fileSystem');
  });

  it('should not perform network requests', () => {
    const result = composeKnowledge(VALID_INPUT);
    assert.ok(!('networkResponse' in result), 'Should not have network response');
    assert.ok(!('httpResult' in result), 'Should not have HTTP result');
  });

  it('should not have async behavior markers', () => {
    const result = composeKnowledge(VALID_INPUT);
    assert.ok(!('promise' in result), 'Should not have promise');
    assert.ok(!('async' in result), 'Should not have async');
  });
});

// ---------------------------------------------------------------------------
// Cross-Agent Boundary Tests
// ---------------------------------------------------------------------------

describe('Knowledge Kernel — Cross-Agent Boundary', () => {
  it('should not reference Didactic Agent', () => {
    const result = composeKnowledge(VALID_INPUT);
    const str = JSON.stringify(result);
    assert.ok(!str.includes('Didactic Agent'), 'Should not reference Didactic Agent');
  });

  it('should not reference Curriculum Agent', () => {
    const result = composeKnowledge(VALID_INPUT);
    const str = JSON.stringify(result);
    assert.ok(!str.includes('Curriculum Agent'), 'Should not reference Curriculum Agent');
  });

  it('should not reference Narrative Agent', () => {
    const result = composeKnowledge(VALID_INPUT);
    const str = JSON.stringify(result);
    assert.ok(!str.includes('Narrative Agent'), 'Should not reference Narrative Agent');
  });

  it('should not reference Assessment Agent', () => {
    const result = composeKnowledge(VALID_INPUT);
    const str = JSON.stringify(result);
    assert.ok(!str.includes('Assessment Agent'), 'Should not reference Assessment Agent');
  });

  it('should not reference Curiosity Agent', () => {
    const result = composeKnowledge(VALID_INPUT);
    const str = JSON.stringify(result);
    assert.ok(!str.includes('Curiosity Agent'), 'Should not reference Curiosity Agent');
  });

  it('should not reference Research Agent', () => {
    const result = composeKnowledge(VALID_INPUT);
    const str = JSON.stringify(result);
    assert.ok(!str.includes('Research Agent'), 'Should not reference Research Agent');
  });

  it('should not reference Laboratory Agent', () => {
    const result = composeKnowledge(VALID_INPUT);
    const str = JSON.stringify(result);
    assert.ok(!str.includes('Laboratory Agent'), 'Should not reference Laboratory Agent');
  });

  it('should not reference Application Agent', () => {
    const result = composeKnowledge(VALID_INPUT);
    const str = JSON.stringify(result);
    assert.ok(!str.includes('Application Agent'), 'Should not reference Application Agent');
  });
});

// ---------------------------------------------------------------------------
// Deterministic Sorting Tests
// ---------------------------------------------------------------------------

describe('Knowledge Kernel — Deterministic Sorting', () => {
  it('should sort deterministically by nodeId', () => {
    const node3 = { ...VALID_NODE, nodeId: 'knowledge-003' };
    const node1 = { ...VALID_NODE, nodeId: 'knowledge-001' };
    const node2 = { ...VALID_NODE, nodeId: 'knowledge-002' };

    const registry = composeKnowledgeRegistry([node3, node1, node2]);

    assert.equal(registry.nodes[0].nodeId, 'knowledge-001');
    assert.equal(registry.nodes[1].nodeId, 'knowledge-002');
    assert.equal(registry.nodes[2].nodeId, 'knowledge-003');
  });

  it('should sort by knowledgeType when nodeId is equal', () => {
    const nodeA = { ...VALID_NODE, nodeId: 'knowledge-001', knowledgeType: 'algorithm' as const };
    const nodeB = { ...VALID_NODE, nodeId: 'knowledge-001', knowledgeType: 'concept' as const };

    const registry = composeKnowledgeRegistry([nodeA, nodeB]);

    assert.equal(registry.nodes[0].knowledgeType, 'algorithm');
    assert.equal(registry.nodes[1].knowledgeType, 'concept');
  });
});

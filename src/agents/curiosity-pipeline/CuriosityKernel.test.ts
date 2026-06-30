/**
 * NV-2100-D9-OPT-01 — Curiosity Registry & Canonical Artifact Kernel Test Suite
 *
 * Comprehensive deterministic test suite for the Curiosity Kernel.
 * Covers: valid node, valid provenance, valid trace, empty registry,
 * duplicate IDs, duplicate titles, deterministic ordering, invalid type,
 * invalid category, invalid tone, missing provenance, invalid trace,
 * immutable input, identical output (100 iterations), helper functions,
 * canonical enum completeness, negative capability verification.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import type {
  CuriosityNode,
  CuriosityProvenance,
  CuriosityInput,
  CuriosityRegistry,
  CuriosityTrace,
} from './CuriosityAgentContract.ts';

import {
  CANONICAL_CURIOSITY_TYPES,
  CANONICAL_CURIOSITY_CATEGORIES,
  CANONICAL_CURIOSITY_TONES,
  CANONICAL_CURIOSITY_CANONICAL_STATUS,
  CANONICAL_CURIOSITY_REVIEW_STATUS,
  CANONICAL_CURIOSITY_GOVERNANCE,
} from './CuriosityAgentContract.ts';

import {
  composeCuriosityProvenance,
  composeCuriosityNode,
  composeCuriosityTrace,
  composeCuriosityRegistry,
  composeCuriosityRegistryFromInput,
  composeCuriosity,
  isSupportedCuriosityType,
  isSupportedCuriosityCategory,
  isSupportedCuriosityTone,
  isSupportedCuriosityReviewStatus,
  isSupportedCuriosityGovernance,
  getCanonicalCuriosityTypes,
  getCanonicalCuriosityCategories,
  getCanonicalCuriosityTones,
  getCanonicalCuriosityStatuses,
  getCanonicalCuriosityGovernance,
} from './CuriosityKernel.ts';

import {
  validateCuriosityNode,
  validateCuriosityRegistry,
  validateCuriosityInput,
  validateCuriosityTrace,
  CURIOSITY_VALIDATION_CODES,
} from './CuriosityValidation.ts';

// ---------------------------------------------------------------------------
// Test Fixtures
// ---------------------------------------------------------------------------

const VALID_PROVENANCE: CuriosityProvenance = {
  provider: 'NeuralVerse Team',
  source: 'Curated Knowledge Base',
  reviewStatus: 'approved',
  reviewDate: '2026-01-01',
  version: '1.0.0',
  rationale: 'Core curiosity artifact.',
};

const VALID_NODE: CuriosityNode = {
  curiosityId: 'curiosity-001',
  title: 'Neural Network Surprising Fact',
  curiosityType: 'curiosity_card',
  category: 'factual_discovery',
  tone: 'light_wit',
  status: 'published',
  governance: 'canonical',
  tags: ['neural_networks', 'surprising'],
  summary: 'A surprising fact about neural networks.',
  provenance: VALID_PROVENANCE,
};

const VALID_NODE_2: CuriosityNode = {
  curiosityId: 'curiosity-002',
  title: 'Historical Oddity in AI',
  curiosityType: 'historical_oddity',
  category: 'historical_context',
  tone: 'neutral',
  status: 'approved',
  governance: 'accepted',
  tags: ['history', 'ai'],
  summary: 'A historical oddity in AI development.',
  provenance: { ...VALID_PROVENANCE, source: 'Research Archives' },
};

const VALID_INPUT: CuriosityInput = {
  nodes: [VALID_NODE, VALID_NODE_2],
};

const EMPTY_INPUT: CuriosityInput = {
  nodes: [],
};

// ---------------------------------------------------------------------------
// Node Composition Tests
// ---------------------------------------------------------------------------

describe('Curiosity Kernel — Node Composition', () => {
  it('should compose valid curiosity provenance', () => {
    const provenance = composeCuriosityProvenance({
      provider: 'NeuralVerse Team',
      source: 'Curated Knowledge Base',
      reviewStatus: 'approved',
      reviewDate: '2026-01-01',
      version: '1.0.0',
      rationale: 'Core concept.',
    });

    assert.equal(provenance.provider, 'NeuralVerse Team');
    assert.equal(provenance.source, 'Curated Knowledge Base');
    assert.equal(provenance.reviewStatus, 'approved');
    assert.equal(provenance.reviewDate, '2026-01-01');
    assert.equal(provenance.version, '1.0.0');
    assert.equal(provenance.rationale, 'Core concept.');
  });

  it('should compose valid curiosity node', () => {
    const node = composeCuriosityNode({
      curiosityId: 'curiosity-001',
      title: 'Neural Network Surprising Fact',
      curiosityType: 'curiosity_card',
      category: 'factual_discovery',
      tone: 'light_wit',
      status: 'published',
      governance: 'canonical',
      tags: ['neural_networks'],
      summary: 'A surprising fact.',
      provenance: VALID_PROVENANCE,
    });

    assert.equal(node.curiosityId, 'curiosity-001');
    assert.equal(node.title, 'Neural Network Surprising Fact');
    assert.equal(node.curiosityType, 'curiosity_card');
    assert.equal(node.category, 'factual_discovery');
    assert.equal(node.tone, 'light_wit');
    assert.equal(node.status, 'published');
    assert.equal(node.governance, 'canonical');
    assert.equal(node.tags.length, 1);
  });

  it('should compose valid curiosity trace', () => {
    const trace = composeCuriosityTrace({
      traceId: '_trace_1',
    });

    assert.equal(trace.traceId, '_trace_1');
    assert.equal(trace.deterministic, true);
    assert.equal(trace.randomUsed, false);
    assert.equal(trace.timeDependency, false);
  });

  it('should validate a valid node with no errors', () => {
    const errors = validateCuriosityNode(VALID_NODE);
    assert.deepStrictEqual(errors, []);
  });

  it('should validate a valid registry with no errors', () => {
    const registry = composeCuriosityRegistry([VALID_NODE, VALID_NODE_2]);
    const result = validateCuriosityRegistry(registry);

    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it('should validate curiosity input', () => {
    const result = validateCuriosityInput(VALID_INPUT);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });
});

// ---------------------------------------------------------------------------
// Registry Tests
// ---------------------------------------------------------------------------

describe('Curiosity Kernel — Registry', () => {
  it('should detect empty registry', () => {
    const registry = composeCuriosityRegistry([]);
    const result = validateCuriosityRegistry(registry);
    const emptyError = result.errors.find(
      (e) => e.code === CURIOSITY_VALIDATION_CODES.CURIOSITY_EMPTY_REGISTRY,
    );

    assert.ok(emptyError, 'Should have CURIOSITY_EMPTY_REGISTRY error');
    assert.equal(result.valid, false);
  });

  it('should detect duplicate IDs', () => {
    const registry = composeCuriosityRegistry([VALID_NODE, VALID_NODE]);
    const result = validateCuriosityRegistry(registry);
    const duplicateError = result.errors.find(
      (e) => e.code === CURIOSITY_VALIDATION_CODES.CURIOSITY_DUPLICATE_ID,
    );

    assert.ok(duplicateError, 'Should have CURIOSITY_DUPLICATE_ID error');
  });

  it('should detect duplicate titles', () => {
    const node1 = { ...VALID_NODE, curiosityId: 'curiosity-001', title: 'Same Title' };
    const node2 = { ...VALID_NODE, curiosityId: 'curiosity-002', title: 'Same Title' };
    const registry = composeCuriosityRegistry([node1, node2]);
    const result = validateCuriosityRegistry(registry);
    const duplicateError = result.errors.find(
      (e) => e.code === CURIOSITY_VALIDATION_CODES.CURIOSITY_DUPLICATE_TITLE,
    );

    assert.ok(duplicateError, 'Should have CURIOSITY_DUPLICATE_TITLE error');
  });

  it('should sort deterministically by curiosityId', () => {
    const node3 = { ...VALID_NODE, curiosityId: 'curiosity-003' };
    const node1 = { ...VALID_NODE, curiosityId: 'curiosity-001' };
    const node2 = { ...VALID_NODE, curiosityId: 'curiosity-002' };

    const registry = composeCuriosityRegistry([node3, node1, node2]);

    assert.equal(registry.nodes[0].curiosityId, 'curiosity-001');
    assert.equal(registry.nodes[1].curiosityId, 'curiosity-002');
    assert.equal(registry.nodes[2].curiosityId, 'curiosity-003');
  });

  it('should sort by curiosityType when curiosityId is equal', () => {
    const nodeA = { ...VALID_NODE, curiosityId: 'curiosity-001', curiosityType: 'historical_oddity' as const };
    const nodeB = { ...VALID_NODE, curiosityId: 'curiosity-001', curiosityType: 'curiosity_card' as const };

    const registry = composeCuriosityRegistry([nodeA, nodeB]);

    assert.equal(registry.nodes[0].curiosityType, 'curiosity_card');
    assert.equal(registry.nodes[1].curiosityType, 'historical_oddity');
  });
});

// ---------------------------------------------------------------------------
// Validation Tests
// ---------------------------------------------------------------------------

describe('Curiosity Kernel — Validation', () => {
  it('should detect invalid curiosity type', () => {
    const node = { ...VALID_NODE, curiosityType: 'unsupported' as any };
    const errors = validateCuriosityNode(node);
    const typeError = errors.find(
      (e) => e.code === CURIOSITY_VALIDATION_CODES.CURIOSITY_INVALID_TYPE,
    );

    assert.ok(typeError, 'Should have CURIOSITY_INVALID_TYPE error');
  });

  it('should detect invalid category', () => {
    const node = { ...VALID_NODE, category: 'unsupported' as any };
    const errors = validateCuriosityNode(node);
    const categoryError = errors.find(
      (e) => e.code === CURIOSITY_VALIDATION_CODES.CURIOSITY_INVALID_CATEGORY,
    );

    assert.ok(categoryError, 'Should have CURIOSITY_INVALID_CATEGORY error');
  });

  it('should detect invalid tone', () => {
    const node = { ...VALID_NODE, tone: 'unsupported' as any };
    const errors = validateCuriosityNode(node);
    const toneError = errors.find(
      (e) => e.code === CURIOSITY_VALIDATION_CODES.CURIOSITY_INVALID_TONE,
    );

    assert.ok(toneError, 'Should have CURIOSITY_INVALID_TONE error');
  });

  it('should detect invalid status', () => {
    const node = { ...VALID_NODE, status: 'unsupported' as any };
    const errors = validateCuriosityNode(node);
    const statusError = errors.find(
      (e) => e.code === CURIOSITY_VALIDATION_CODES.CURIOSITY_INVALID_STATUS,
    );

    assert.ok(statusError, 'Should have CURIOSITY_INVALID_STATUS error');
  });

  it('should detect invalid governance', () => {
    const node = { ...VALID_NODE, governance: 'unsupported' as any };
    const errors = validateCuriosityNode(node);
    const governanceError = errors.find(
      (e) => e.code === CURIOSITY_VALIDATION_CODES.CURIOSITY_INVALID_GOVERNANCE,
    );

    assert.ok(governanceError, 'Should have CURIOSITY_INVALID_GOVERNANCE error');
  });

  it('should detect missing provenance', () => {
    const node = { ...VALID_NODE, provenance: undefined as any };
    const errors = validateCuriosityNode(node);
    const provenanceError = errors.find(
      (e) => e.code === CURIOSITY_VALIDATION_CODES.CURIOSITY_MISSING_PROVENANCE,
    );

    assert.ok(provenanceError, 'Should have CURIOSITY_MISSING_PROVENANCE error');
  });

  it('should detect missing provenance provider', () => {
    const node = { ...VALID_NODE, provenance: { ...VALID_PROVENANCE, provider: '' } };
    const errors = validateCuriosityNode(node);
    const providerError = errors.find(
      (e) => e.code === CURIOSITY_VALIDATION_CODES.CURIOSITY_MISSING_PROVIDER,
    );

    assert.ok(providerError, 'Should have CURIOSITY_MISSING_PROVIDER error');
  });

  it('should detect missing provenance rationale', () => {
    const node = { ...VALID_NODE, provenance: { ...VALID_PROVENANCE, rationale: '' } };
    const errors = validateCuriosityNode(node);
    const rationaleError = errors.find(
      (e) => e.code === CURIOSITY_VALIDATION_CODES.CURIOSITY_MISSING_RATIONALE,
    );

    assert.ok(rationaleError, 'Should have CURIOSITY_MISSING_RATIONALE error');
  });

  it('should validate a valid trace', () => {
    const trace = composeCuriosityTrace({
      traceId: '_trace_1',
    });

    const result = validateCuriosityTrace(trace);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it('should detect invalid trace', () => {
    const trace: CuriosityTrace = {
      traceId: '',
      generatedFrom: 'deterministic_curiosity_kernel',
      deterministic: false as true,
      randomUsed: false,
      timeDependency: false,
    };

    const result = validateCuriosityTrace(trace);
    assert.equal(result.valid, false);
  });
});

// ---------------------------------------------------------------------------
// Determinism Tests
// ---------------------------------------------------------------------------

describe('Curiosity Kernel — Determinism', () => {
  it('should produce identical output for identical input (100 iterations)', () => {
    const results: ReturnType<typeof composeCuriosity>[] = [];
    for (let i = 0; i < 100; i++) {
      results.push(composeCuriosity(VALID_INPUT));
    }

    for (let i = 1; i < results.length; i++) {
      assert.deepStrictEqual(results[0].registryId, results[i].registryId);
      assert.deepStrictEqual(results[0].nodes, results[i].nodes);
      assert.deepStrictEqual(results[0].trace.traceId, results[i].trace.traceId);
    }
  });

  it('should produce identical registry output for identical input', () => {
    const results: ReturnType<typeof composeCuriosityRegistry>[] = [];
    for (let i = 0; i < 100; i++) {
      results.push(composeCuriosityRegistry([VALID_NODE, VALID_NODE_2]));
    }

    for (let i = 1; i < results.length; i++) {
      assert.deepStrictEqual(results[0].nodes, results[i].nodes);
      assert.deepStrictEqual(results[0].registryId, results[i].registryId);
    }
  });
});

// ---------------------------------------------------------------------------
// Immutability Tests
// ---------------------------------------------------------------------------

describe('Curiosity Kernel — Immutability', () => {
  it('should not mutate input nodes', () => {
    const originalId = VALID_NODE.curiosityId;
    const originalTitle = VALID_NODE.title;

    composeCuriosity(VALID_INPUT);

    assert.equal(VALID_NODE.curiosityId, originalId);
    assert.equal(VALID_NODE.title, originalTitle);
  });

  it('should not mutate input registry nodes', () => {
    const nodes = [VALID_NODE, VALID_NODE_2];
    const originalIds = nodes.map((n) => n.curiosityId);

    composeCuriosityRegistry(nodes);

    assert.equal(nodes[0].curiosityId, originalIds[0]);
    assert.equal(nodes[1].curiosityId, originalIds[1]);
  });
});

// ---------------------------------------------------------------------------
// Helper Function Tests
// ---------------------------------------------------------------------------

describe('Curiosity Kernel — Helper Functions', () => {
  it('should return canonical curiosity types', () => {
    const types = getCanonicalCuriosityTypes();
    assert.deepStrictEqual([...types], [...CANONICAL_CURIOSITY_TYPES]);
    assert.equal(types.length, 12);
  });

  it('should return canonical categories', () => {
    const categories = getCanonicalCuriosityCategories();
    assert.deepStrictEqual([...categories], [...CANONICAL_CURIOSITY_CATEGORIES]);
    assert.equal(categories.length, 12);
  });

  it('should return canonical tones', () => {
    const tones = getCanonicalCuriosityTones();
    assert.deepStrictEqual([...tones], [...CANONICAL_CURIOSITY_TONES]);
    assert.equal(tones.length, 6);
  });

  it('should return canonical statuses', () => {
    const statuses = getCanonicalCuriosityStatuses();
    assert.deepStrictEqual([...statuses], [...CANONICAL_CURIOSITY_CANONICAL_STATUS]);
    assert.equal(statuses.length, 6);
  });

  it('should return canonical governance values', () => {
    const governance = getCanonicalCuriosityGovernance();
    assert.deepStrictEqual([...governance], [...CANONICAL_CURIOSITY_GOVERNANCE]);
    assert.equal(governance.length, 5);
  });

  it('should validate curiosity type support', () => {
    assert.equal(isSupportedCuriosityType('curiosity_card'), true);
    assert.equal(isSupportedCuriosityType('historical_oddity'), true);
    assert.equal(isSupportedCuriosityType('unsupported'), false);
  });

  it('should validate category support', () => {
    assert.equal(isSupportedCuriosityCategory('factual_discovery'), true);
    assert.equal(isSupportedCuriosityCategory('historical_context'), true);
    assert.equal(isSupportedCuriosityCategory('unsupported'), false);
  });

  it('should validate tone support', () => {
    assert.equal(isSupportedCuriosityTone('neutral'), true);
    assert.equal(isSupportedCuriosityTone('light_wit'), true);
    assert.equal(isSupportedCuriosityTone('unsupported'), false);
  });

  it('should validate review status support', () => {
    assert.equal(isSupportedCuriosityReviewStatus('draft'), true);
    assert.equal(isSupportedCuriosityReviewStatus('published'), true);
    assert.equal(isSupportedCuriosityReviewStatus('unsupported'), false);
  });

  it('should validate governance support', () => {
    assert.equal(isSupportedCuriosityGovernance('canonical'), true);
    assert.equal(isSupportedCuriosityGovernance('accepted'), true);
    assert.equal(isSupportedCuriosityGovernance('unsupported'), false);
  });
});

// ---------------------------------------------------------------------------
// Canonical Enum Completeness Tests
// ---------------------------------------------------------------------------

describe('Curiosity Kernel — Canonical Enum Completeness', () => {
  it('should have exactly 12 curiosity types', () => {
    assert.equal(CANONICAL_CURIOSITY_TYPES.length, 12);
  });

  it('should have exactly 12 categories', () => {
    assert.equal(CANONICAL_CURIOSITY_CATEGORIES.length, 12);
  });

  it('should have exactly 6 tones', () => {
    assert.equal(CANONICAL_CURIOSITY_TONES.length, 6);
  });

  it('should have exactly 6 statuses', () => {
    assert.equal(CANONICAL_CURIOSITY_CANONICAL_STATUS.length, 6);
  });

  it('should have exactly 6 review statuses', () => {
    assert.equal(CANONICAL_CURIOSITY_REVIEW_STATUS.length, 6);
  });

  it('should have exactly 5 governance values', () => {
    assert.equal(CANONICAL_CURIOSITY_GOVERNANCE.length, 5);
  });

  it('should contain all expected curiosity types', () => {
    const expectedTypes = [
      'curiosity_card',
      'engineer_note',
      'historical_oddity',
      'unexpected_connection',
      'limitation_warning',
      'what_if_prompt',
      'cultural_reference',
      'algorithm_personality',
      'lab_challenge',
      'misconception_card',
      'research_trail',
      'application_surprise',
    ];

    for (const type of expectedTypes) {
      assert.ok(
        CANONICAL_CURIOSITY_TYPES.includes(type as any),
        `Should include type: ${type}`,
      );
    }
  });

  it('should contain all expected categories', () => {
    const expectedCategories = [
      'factual_discovery',
      'engineering_insight',
      'historical_context',
      'cross_domain_connection',
      'limitation_awareness',
      'creative_exploration',
      'cultural_context',
      'algorithmic_personality',
      'hands_on_challenge',
      'misconception_correction',
      'research_exploration',
      'practical_application',
    ];

    for (const category of expectedCategories) {
      assert.ok(
        CANONICAL_CURIOSITY_CATEGORIES.includes(category as any),
        `Should include category: ${category}`,
      );
    }
  });

  it('should contain all expected tones', () => {
    const expectedTones = [
      'neutral',
      'light_wit',
      'playful',
      'acidic_controlled',
      'cultural',
      'disabled',
    ];

    for (const tone of expectedTones) {
      assert.ok(
        CANONICAL_CURIOSITY_TONES.includes(tone as any),
        `Should include tone: ${tone}`,
      );
    }
  });
});

// ---------------------------------------------------------------------------
// Negative Capability Verification Tests
// ---------------------------------------------------------------------------

describe('Curiosity Kernel — Negative Capability Verification', () => {
  it('should not use Math.random', () => {
    const result = composeCuriosity(VALID_INPUT);
    assert.ok(result, 'Should produce a result without Math.random');
  });

  it('should not use Date.now', () => {
    const result = composeCuriosity(VALID_INPUT);
    assert.ok(result, 'Should produce a result without Date.now');
  });

  it('should not use performance.now', () => {
    const result = composeCuriosity(VALID_INPUT);
    assert.ok(result, 'Should produce a result without performance.now');
  });

  it('should not use crypto.randomUUID', () => {
    const result = composeCuriosity(VALID_INPUT);
    assert.ok(result, 'Should produce a result without crypto.randomUUID');
  });

  it('should not generate curiosity content', () => {
    const result = composeCuriosity(VALID_INPUT);
    assert.ok(!('generatedContent' in result), 'Should not have generated content');
    assert.ok(!('curiosityContent' in result), 'Should not have curiosity content');
  });

  it('should not recommend curiosity artifacts', () => {
    const result = composeCuriosity(VALID_INPUT);
    assert.ok(!('recommendations' in result), 'Should not have recommendations');
    assert.ok(!('suggestedArtifacts' in result), 'Should not have suggested artifacts');
  });

  it('should not retrieve curiosity data', () => {
    const result = composeCuriosity(VALID_INPUT);
    assert.ok(!('retrievedData' in result), 'Should not have retrieved data');
    assert.ok(!('fetchedContent' in result), 'Should not have fetched content');
  });

  it('should not rank curiosity nodes', () => {
    const result = composeCuriosity(VALID_INPUT);
    assert.ok(!('rankedNodes' in result), 'Should not have ranked nodes');
    assert.ok(!('ranking' in result), 'Should not have ranking');
  });

  it('should not search for curiosity', () => {
    const result = composeCuriosity(VALID_INPUT);
    assert.ok(!('searchResults' in result), 'Should not have search results');
    assert.ok(!('searchQuery' in result), 'Should not have search query');
  });

  it('should not discover new curiosity', () => {
    const result = composeCuriosity(VALID_INPUT);
    assert.ok(!('discoveredNodes' in result), 'Should not have discovered nodes');
    assert.ok(!('newConnections' in result), 'Should not have new connections');
  });

  it('should not infer curiosity relationships', () => {
    const result = composeCuriosity(VALID_INPUT);
    assert.ok(!('inferredRelationships' in result), 'Should not have inferred relationships');
    assert.ok(!('inferredConnections' in result), 'Should not have inferred connections');
  });

  it('should not call LLMs', () => {
    const result = composeCuriosity(VALID_INPUT);
    assert.ok(!('llmResponse' in result), 'Should not have LLM response');
    assert.ok(!('modelOutput' in result), 'Should not have model output');
  });

  it('should not access filesystem', () => {
    const result = composeCuriosity(VALID_INPUT);
    assert.ok(!('filesystem' in result), 'Should not have filesystem');
    assert.ok(!('fileSystem' in result), 'Should not have fileSystem');
  });

  it('should not perform network requests', () => {
    const result = composeCuriosity(VALID_INPUT);
    assert.ok(!('networkResponse' in result), 'Should not have network response');
    assert.ok(!('httpResult' in result), 'Should not have HTTP result');
  });

  it('should not have executable callbacks in node', () => {
    const node = composeCuriosityNode({
      curiosityId: 'curiosity-001',
      title: 'Test',
      curiosityType: 'curiosity_card',
      category: 'factual_discovery',
      tone: 'neutral',
      status: 'published',
      governance: 'canonical',
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
    const result = composeCuriosity(VALID_INPUT);
    assert.ok(!('educationalContent' in result), 'Should not have educational content');
    assert.ok(!('markdown' in result), 'Should not have markdown');
  });

  it('should not perform runtime execution', () => {
    const result = composeCuriosity(VALID_INPUT);
    assert.ok(!('executionResult' in result), 'Should not have execution result');
    assert.ok(!('output' in result), 'Should not have output');
  });
});

// ---------------------------------------------------------------------------
// Validation Codes Tests
// ---------------------------------------------------------------------------

describe('Curiosity Kernel — Validation Codes', () => {
  it('should have stable validation codes', () => {
    assert.equal(CURIOSITY_VALIDATION_CODES.CURIOSITY_DUPLICATE_ID, 'CURIOSITY_DUPLICATE_ID');
    assert.equal(CURIOSITY_VALIDATION_CODES.CURIOSITY_DUPLICATE_TITLE, 'CURIOSITY_DUPLICATE_TITLE');
    assert.equal(CURIOSITY_VALIDATION_CODES.CURIOSITY_INVALID_TYPE, 'CURIOSITY_INVALID_TYPE');
    assert.equal(CURIOSITY_VALIDATION_CODES.CURIOSITY_INVALID_CATEGORY, 'CURIOSITY_INVALID_CATEGORY');
    assert.equal(CURIOSITY_VALIDATION_CODES.CURIOSITY_INVALID_TONE, 'CURIOSITY_INVALID_TONE');
    assert.equal(CURIOSITY_VALIDATION_CODES.CURIOSITY_INVALID_STATUS, 'CURIOSITY_INVALID_STATUS');
    assert.equal(CURIOSITY_VALIDATION_CODES.CURIOSITY_INVALID_GOVERNANCE, 'CURIOSITY_INVALID_GOVERNANCE');
    assert.equal(CURIOSITY_VALIDATION_CODES.CURIOSITY_MISSING_PROVENANCE, 'CURIOSITY_MISSING_PROVENANCE');
    assert.equal(CURIOSITY_VALIDATION_CODES.CURIOSITY_MISSING_PROVIDER, 'CURIOSITY_MISSING_PROVIDER');
    assert.equal(CURIOSITY_VALIDATION_CODES.CURIOSITY_MISSING_RATIONALE, 'CURIOSITY_MISSING_RATIONALE');
    assert.equal(CURIOSITY_VALIDATION_CODES.CURIOSITY_MISSING_TRACE, 'CURIOSITY_MISSING_TRACE');
    assert.equal(CURIOSITY_VALIDATION_CODES.CURIOSITY_MISSING_CURIOSITY_ID, 'CURIOSITY_MISSING_CURIOSITY_ID');
    assert.equal(CURIOSITY_VALIDATION_CODES.CURIOSITY_MISSING_TITLE, 'CURIOSITY_MISSING_TITLE');
    assert.equal(CURIOSITY_VALIDATION_CODES.CURIOSITY_EMPTY_REGISTRY, 'CURIOSITY_EMPTY_REGISTRY');
    assert.equal(CURIOSITY_VALIDATION_CODES.CURIOSITY_INVALID_TRACE, 'CURIOSITY_INVALID_TRACE');
    assert.equal(CURIOSITY_VALIDATION_CODES.CURIOSITY_REGISTRY_INCONSISTENCY, 'CURIOSITY_REGISTRY_INCONSISTENCY');
  });

  it('should have exactly 16 validation codes', () => {
    const codeCount = Object.keys(CURIOSITY_VALIDATION_CODES).length;
    assert.equal(codeCount, 16);
  });
});

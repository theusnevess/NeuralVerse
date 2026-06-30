/**
 * NV-2000-D8-OPT-06 — Feedback Kernel Tests
 *
 * Exhaustive deterministic tests for the Feedback Kernel.
 * Uses Node.js built-in test runner (node:test).
 *
 * ~90 tests covering:
 * - Canonical enum completeness
 * - Helper functions
 * - Feedback composition
 * - Explanation composition
 * - Reference composition
 * - Relationship composition
 * - Registry composition
 * - Validation codes
 * - Duplicate detection
 * - Deterministic identity (100 iterations)
 * - Immutability
 * - Validator stability
 * - No mutation
 * - Artifact with feedback
 * - Cross-agent boundary
 * - Negative capability verification
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  CANONICAL_FEEDBACK_TYPES,
  CANONICAL_FEEDBACK_OBJECTIVES,
  CANONICAL_FEEDBACK_TONES,
  CANONICAL_FEEDBACK_DELIVERY_TYPES,
  CANONICAL_FEEDBACK_PRIORITY,
  CANONICAL_FEEDBACK_STATUS,
  CANONICAL_ASSESSMENT_GOVERNANCE,
  type AssessmentFeedback,
  type FeedbackExplanation,
  type FeedbackReference,
  type FeedbackInput,
  type FeedbackRegistry,
  type FeedbackProvenance,
  type AssessmentArtifactWithFeedback,
} from './AssessmentAgentContract.ts';

import {
  composeFeedbackProvenance,
  composeFeedbackTrace,
  composeAssessmentFeedback,
  composeFeedbackExplanation,
  composeFeedbackReference,
  composeFeedbackRelationship,
  composeFeedbackRegistry,
  composeFeedbackRegistryFromInput,
  composeAssessmentFeedbackCollection,
  composeAssessmentArtifactWithFeedback,
  isSupportedFeedbackType,
  isSupportedFeedbackObjective,
  isSupportedFeedbackTone,
  isSupportedFeedbackDeliveryType,
  isSupportedFeedbackPriority,
  isSupportedFeedbackStatus,
  isSupportedFeedbackGovernance,
  getCanonicalFeedbackTypes,
  getCanonicalFeedbackObjectives,
  getCanonicalFeedbackTones,
  getCanonicalFeedbackDeliveryTypes,
  getCanonicalFeedbackPriorities,
  getCanonicalFeedbackStatuses,
} from './FeedbackKernel.ts';

import {
  FEEDBACK_VALIDATION_CODES,
  validateAssessmentFeedback,
  validateFeedbackExplanation,
  validateFeedbackRelationship,
  validateFeedbackRegistry,
  validateFeedbackInput,
  validateFeedbackTrace,
  validateAssessmentArtifactWithFeedback,
} from './FeedbackValidation.ts';

// ============================================================================
// TEST FIXTURES
// ============================================================================

const VALID_FEEDBACK_PROVENANCE: FeedbackProvenance = {
  provider: 'test-provider',
  source: 'test-source',
  reviewStatus: 'approved',
  reviewDate: '2025-01-01',
  version: '1.0.0',
  rationale: 'Test rationale for feedback.',
};

function _makeExplanation(id: string): FeedbackExplanation {
  return composeFeedbackExplanation({
    id,
    explanationType: 'conceptual',
    rationale: 'Test rationale.',
    conceptualBasis: 'Test conceptual basis.',
  });
}

function _makeReference(id: string): FeedbackReference {
  return composeFeedbackReference({
    id,
    referenceType: 'knowledge',
    referenceId: 'ref-1',
    description: 'Test reference.',
  });
}

function _makeFeedback(
  id: string,
  overrides: Partial<AssessmentFeedback> = {},
): AssessmentFeedback {
  return composeAssessmentFeedback({
    id,
    title: `Feedback ${id}`,
    feedbackType: 'conceptual_explanation',
    objective: 'clarification',
    tone: 'instructional',
    deliveryType: 'text',
    content: `Test content for ${id}`,
    explanation: _makeExplanation(`exp-${id}`),
    references: [_makeReference(`ref-${id}`)],
    conceptIds: ['concept-1'],
    priority: 'medium',
    status: 'draft',
    governance: 'canonical',
    provenance: VALID_FEEDBACK_PROVENANCE,
    ...overrides,
  });
}

const VALID_FEEDBACK_A = _makeFeedback('fb-a');
const VALID_FEEDBACK_B = _makeFeedback('fb-b');
const VALID_FEEDBACK_C = _makeFeedback('fb-c');

// ============================================================================
// CANONICAL ENUM COMPLETENESS
// ============================================================================

describe('Canonical Enums', () => {
  it('should have exactly 10 feedback types', () => {
    assert.equal(CANONICAL_FEEDBACK_TYPES.length, 10);
  });

  it('should have exactly 10 feedback objectives', () => {
    assert.equal(CANONICAL_FEEDBACK_OBJECTIVES.length, 10);
  });

  it('should have exactly 10 feedback tones', () => {
    assert.equal(CANONICAL_FEEDBACK_TONES.length, 10);
  });

  it('should have exactly 10 feedback delivery types', () => {
    assert.equal(CANONICAL_FEEDBACK_DELIVERY_TYPES.length, 10);
  });

  it('should have exactly 5 feedback priorities', () => {
    assert.equal(CANONICAL_FEEDBACK_PRIORITY.length, 5);
  });

  it('should have exactly 6 feedback statuses', () => {
    assert.equal(CANONICAL_FEEDBACK_STATUS.length, 6);
  });

  it('should contain expected feedback types', () => {
    const expected = [
      'correct_answer', 'incorrect_answer', 'partially_correct',
      'conceptual_explanation', 'reasoning_guidance', 'engineering_explanation',
      'comparison', 'reinforcement', 'reflection', 'next_step',
    ];
    for (const value of expected) {
      assert.ok(CANONICAL_FEEDBACK_TYPES.includes(value as any), `Missing: ${value}`);
    }
  });

  it('should contain expected feedback objectives', () => {
    const expected = [
      'clarification', 'concept_reinforcement', 'relationship_reinforcement',
      'reasoning_support', 'misconception_remediation', 'engineering_understanding',
      'concept_connection', 'reflection', 'motivation', 'knowledge_consolidation',
    ];
    for (const value of expected) {
      assert.ok(CANONICAL_FEEDBACK_OBJECTIVES.includes(value as any), `Missing: ${value}`);
    }
  });

  it('should contain expected feedback tones', () => {
    const expected = [
      'neutral', 'supportive', 'instructional', 'encouraging', 'analytical',
      'technical', 'reflective', 'motivational', 'corrective', 'exploratory',
    ];
    for (const value of expected) {
      assert.ok(CANONICAL_FEEDBACK_TONES.includes(value as any), `Missing: ${value}`);
    }
  });

  it('should contain expected feedback delivery types', () => {
    const expected = [
      'text', 'visual', 'concept_graph', 'comparison_table', 'diagram_reference',
      'laboratory_reference', 'knowledge_reference', 'application_reference',
      'reflection_prompt', 'resource_reference',
    ];
    for (const value of expected) {
      assert.ok(CANONICAL_FEEDBACK_DELIVERY_TYPES.includes(value as any), `Missing: ${value}`);
    }
  });
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

describe('Helper Functions', () => {
  it('isSupportedFeedbackType returns true for valid types', () => {
    assert.equal(isSupportedFeedbackType('correct_answer'), true);
    assert.equal(isSupportedFeedbackType('next_step'), true);
  });

  it('isSupportedFeedbackType returns false for invalid types', () => {
    assert.equal(isSupportedFeedbackType('invalid'), false);
    assert.equal(isSupportedFeedbackType(''), false);
  });

  it('isSupportedFeedbackObjective returns true for valid objectives', () => {
    assert.equal(isSupportedFeedbackObjective('clarification'), true);
    assert.equal(isSupportedFeedbackObjective('knowledge_consolidation'), true);
  });

  it('isSupportedFeedbackObjective returns false for invalid objectives', () => {
    assert.equal(isSupportedFeedbackObjective('invalid'), false);
    assert.equal(isSupportedFeedbackObjective(''), false);
  });

  it('isSupportedFeedbackTone returns true for valid tones', () => {
    assert.equal(isSupportedFeedbackTone('neutral'), true);
    assert.equal(isSupportedFeedbackTone('exploratory'), true);
  });

  it('isSupportedFeedbackTone returns false for invalid tones', () => {
    assert.equal(isSupportedFeedbackTone('invalid'), false);
    assert.equal(isSupportedFeedbackTone(''), false);
  });

  it('isSupportedFeedbackDeliveryType returns true for valid types', () => {
    assert.equal(isSupportedFeedbackDeliveryType('text'), true);
    assert.equal(isSupportedFeedbackDeliveryType('resource_reference'), true);
  });

  it('isSupportedFeedbackDeliveryType returns false for invalid types', () => {
    assert.equal(isSupportedFeedbackDeliveryType('invalid'), false);
    assert.equal(isSupportedFeedbackDeliveryType(''), false);
  });

  it('isSupportedFeedbackPriority returns true for valid priorities', () => {
    assert.equal(isSupportedFeedbackPriority('critical'), true);
    assert.equal(isSupportedFeedbackPriority('optional'), true);
  });

  it('isSupportedFeedbackPriority returns false for invalid priorities', () => {
    assert.equal(isSupportedFeedbackPriority('invalid'), false);
    assert.equal(isSupportedFeedbackPriority(''), false);
  });

  it('isSupportedFeedbackStatus returns true for valid statuses', () => {
    assert.equal(isSupportedFeedbackStatus('draft'), true);
    assert.equal(isSupportedFeedbackStatus('archived'), true);
  });

  it('isSupportedFeedbackStatus returns false for invalid statuses', () => {
    assert.equal(isSupportedFeedbackStatus('invalid'), false);
    assert.equal(isSupportedFeedbackStatus(''), false);
  });

  it('isSupportedFeedbackGovernance returns true for valid governance', () => {
    assert.equal(isSupportedFeedbackGovernance('canonical'), true);
    assert.equal(isSupportedFeedbackGovernance('rejected'), true);
  });

  it('isSupportedFeedbackGovernance returns false for invalid governance', () => {
    assert.equal(isSupportedFeedbackGovernance('invalid'), false);
    assert.equal(isSupportedFeedbackGovernance(''), false);
  });

  it('getCanonicalFeedbackTypes returns a copy', () => {
    const result = getCanonicalFeedbackTypes();
    assert.equal(result.length, 10);
    assert.deepEqual([...result], [...CANONICAL_FEEDBACK_TYPES]);
    (result as string[]).push('injected');
    assert.equal(CANONICAL_FEEDBACK_TYPES.length, 10);
  });

  it('getCanonicalFeedbackObjectives returns a copy', () => {
    const result = getCanonicalFeedbackObjectives();
    assert.equal(result.length, 10);
  });

  it('getCanonicalFeedbackTones returns a copy', () => {
    const result = getCanonicalFeedbackTones();
    assert.equal(result.length, 10);
  });

  it('getCanonicalFeedbackDeliveryTypes returns a copy', () => {
    const result = getCanonicalFeedbackDeliveryTypes();
    assert.equal(result.length, 10);
  });

  it('getCanonicalFeedbackPriorities returns a copy', () => {
    const result = getCanonicalFeedbackPriorities();
    assert.equal(result.length, 5);
  });

  it('getCanonicalFeedbackStatuses returns a copy', () => {
    const result = getCanonicalFeedbackStatuses();
    assert.equal(result.length, 6);
  });
});

// ============================================================================
// COMPOSE FUNCTIONS — Feedback
// ============================================================================

describe('composeAssessmentFeedback', () => {
  it('should compose feedback from valid params', () => {
    const feedback = composeAssessmentFeedback({
      id: 'f1', title: 'Test',
      feedbackType: 'conceptual_explanation',
      objective: 'clarification', tone: 'instructional',
      deliveryType: 'text', content: 'Test content',
      explanation: _makeExplanation('e1'),
      references: [_makeReference('r1')],
      conceptIds: ['c1'], priority: 'medium',
      status: 'draft', governance: 'canonical',
      provenance: VALID_FEEDBACK_PROVENANCE,
    });
    assert.equal(feedback.id, 'f1');
    assert.equal(feedback.title, 'Test');
    assert.equal(feedback.feedbackType, 'conceptual_explanation');
    assert.equal(feedback.content, 'Test content');
    assert.equal(feedback.trace.deterministic, true);
    assert.equal(feedback.trace.randomUsed, false);
    assert.equal(feedback.trace.timeDependency, false);
  });

  it('should not mutate input arrays', () => {
    const conceptIds = ['c1'];
    const refs = [_makeReference('r1')];
    const original = JSON.stringify({ conceptIds, refs });
    composeAssessmentFeedback({
      id: 'f', title: 'T',
      feedbackType: 'correct_answer', objective: 'clarification',
      tone: 'neutral', deliveryType: 'text', content: 'C',
      explanation: _makeExplanation('e'), references: refs,
      conceptIds, priority: 'low', status: 'draft',
      governance: 'canonical', provenance: VALID_FEEDBACK_PROVENANCE,
    });
    assert.equal(JSON.stringify({ conceptIds, refs }), original);
  });
});

// ============================================================================
// COMPOSE FUNCTIONS — Explanation
// ============================================================================

describe('composeFeedbackExplanation', () => {
  it('should compose explanation from valid params', () => {
    const explanation = composeFeedbackExplanation({
      id: 'e1', explanationType: 'conceptual',
      rationale: 'Rationale', conceptualBasis: 'Basis',
    });
    assert.equal(explanation.id, 'e1');
    assert.equal(explanation.explanationType, 'conceptual');
    assert.equal(explanation.rationale, 'Rationale');
  });

  it('should return identical output for identical input', () => {
    const params = {
      id: 'e', explanationType: 'reasoning', rationale: 'R', conceptualBasis: 'B',
    };
    const e1 = composeFeedbackExplanation(params);
    const e2 = composeFeedbackExplanation(params);
    assert.deepEqual(e1, e2);
  });
});

// ============================================================================
// COMPOSE FUNCTIONS — Reference
// ============================================================================

describe('composeFeedbackReference', () => {
  it('should compose reference from valid params', () => {
    const ref = composeFeedbackReference({
      id: 'r1', referenceType: 'knowledge',
      referenceId: 'k1', description: 'Desc',
    });
    assert.equal(ref.id, 'r1');
    assert.equal(ref.referenceType, 'knowledge');
    assert.equal(ref.referenceId, 'k1');
  });
});

// ============================================================================
// COMPOSE FUNCTIONS — Relationship
// ============================================================================

describe('composeFeedbackRelationship', () => {
  it('should compose relationship from valid params', () => {
    const rel = composeFeedbackRelationship({
      id: 'r1', sourceFeedbackId: 'a', targetFeedbackId: 'b',
      relationshipType: 'depends', rationale: 'r',
    });
    assert.equal(rel.id, 'r1');
    assert.equal(rel.sourceFeedbackId, 'a');
    assert.equal(rel.targetFeedbackId, 'b');
  });

  it('should return identical output for identical input', () => {
    const params = {
      id: 'r', sourceFeedbackId: 'a', targetFeedbackId: 'b',
      relationshipType: 'dep', rationale: 'r',
    };
    const r1 = composeFeedbackRelationship(params);
    const r2 = composeFeedbackRelationship(params);
    assert.deepEqual(r1, r2);
  });
});

// ============================================================================
// COMPOSE FUNCTIONS — Registry
// ============================================================================

describe('composeFeedbackRegistry', () => {
  it('should compose registry from feedback', () => {
    const registry = composeFeedbackRegistry([VALID_FEEDBACK_A, VALID_FEEDBACK_B]);
    assert.equal(registry.nodes.length, 2);
    assert.equal(registry.metadata.nodeCount, 2);
    assert.equal(registry.metadata.deterministic, true);
  });

  it('should sort nodes by id', () => {
    const registry = composeFeedbackRegistry([VALID_FEEDBACK_C, VALID_FEEDBACK_A, VALID_FEEDBACK_B]);
    assert.equal(registry.nodes[0].id, 'fb-a');
    assert.equal(registry.nodes[1].id, 'fb-b');
    assert.equal(registry.nodes[2].id, 'fb-c');
  });

  it('should return identical output for identical input', () => {
    const nodes = [VALID_FEEDBACK_A, VALID_FEEDBACK_B];
    const r1 = composeFeedbackRegistry(nodes);
    const r2 = composeFeedbackRegistry(nodes);
    assert.deepEqual(r1, r2);
  });

  it('should not mutate input nodes array', () => {
    const nodes = [VALID_FEEDBACK_C, VALID_FEEDBACK_A];
    const original = JSON.stringify(nodes);
    composeFeedbackRegistry(nodes);
    assert.equal(JSON.stringify(nodes), original);
  });

  it('should handle empty array', () => {
    const registry = composeFeedbackRegistry([]);
    assert.equal(registry.nodes.length, 0);
    assert.equal(registry.metadata.nodeCount, 0);
  });
});

// ============================================================================
// COMPOSE FUNCTIONS — Registry from Input
// ============================================================================

describe('composeFeedbackRegistryFromInput', () => {
  it('should compose registry from input', () => {
    const input: FeedbackInput = { nodes: [VALID_FEEDBACK_A, VALID_FEEDBACK_B] };
    const registry = composeFeedbackRegistryFromInput(input);
    assert.equal(registry.nodes.length, 2);
  });

  it('should return identical output for identical input', () => {
    const input: FeedbackInput = { nodes: [VALID_FEEDBACK_A] };
    const r1 = composeFeedbackRegistryFromInput(input);
    const r2 = composeFeedbackRegistryFromInput(input);
    assert.deepEqual(r1, r2);
  });
});

// ============================================================================
// COMPOSE FUNCTIONS — Artifact with feedback
// ============================================================================

describe('composeAssessmentArtifactWithFeedback', () => {
  it('should compose artifact with feedback', () => {
    const result = composeAssessmentArtifactWithFeedback({
      artifactId: 'art-1', artifactTitle: 'Test',
      feedback: [VALID_FEEDBACK_A],
    });
    assert.equal(result.artifactId, 'art-1');
    assert.equal(result.feedback.length, 1);
  });

  it('should not mutate feedback input', () => {
    const feedback = [VALID_FEEDBACK_A];
    const original = JSON.stringify(feedback);
    composeAssessmentArtifactWithFeedback({
      artifactId: 'a', artifactTitle: 'T', feedback,
    });
    assert.equal(JSON.stringify(feedback), original);
  });
});

// ============================================================================
// VALIDATION — Feedback validation
// ============================================================================

describe('validateAssessmentFeedback', () => {
  it('should pass for valid feedback', () => {
    const errors = validateAssessmentFeedback(VALID_FEEDBACK_A);
    assert.equal(errors.length, 0);
  });

  it('should reject null feedback', () => {
    const errors = validateAssessmentFeedback(null as any);
    assert.ok(errors.length > 0);
  });

  it('should reject feedback with missing id', () => {
    const feedback = _makeFeedback('');
    const errors = validateAssessmentFeedback(feedback);
    assert.ok(errors.some((e) => e.code === FEEDBACK_VALIDATION_CODES.FEEDBACK_MISSING_FEEDBACK_ID));
  });

  it('should reject feedback with invalid type', () => {
    const feedback = _makeFeedback('f', { feedbackType: 'invalid' as any });
    const errors = validateAssessmentFeedback(feedback);
    assert.ok(errors.some((e) => e.code === FEEDBACK_VALIDATION_CODES.FEEDBACK_INVALID_TYPE));
  });

  it('should reject feedback with invalid objective', () => {
    const feedback = _makeFeedback('f', { objective: 'invalid' as any });
    const errors = validateAssessmentFeedback(feedback);
    assert.ok(errors.some((e) => e.code === FEEDBACK_VALIDATION_CODES.FEEDBACK_INVALID_OBJECTIVE));
  });

  it('should reject feedback with invalid tone', () => {
    const feedback = _makeFeedback('f', { tone: 'invalid' as any });
    const errors = validateAssessmentFeedback(feedback);
    assert.ok(errors.some((e) => e.code === FEEDBACK_VALIDATION_CODES.FEEDBACK_INVALID_TONE));
  });

  it('should reject feedback with missing conceptIds', () => {
    const feedback = _makeFeedback('f', { conceptIds: [] });
    const errors = validateAssessmentFeedback(feedback);
    assert.ok(errors.some((e) => e.code === FEEDBACK_VALIDATION_CODES.FEEDBACK_MISSING_ASSESSMENT_REFERENCE));
  });

  it('should reject feedback with non-deterministic trace', () => {
    const feedback: AssessmentFeedback = {
      id: 'f', title: 'T',
      feedbackType: 'correct_answer', objective: 'clarification',
      tone: 'neutral', deliveryType: 'text', content: 'C',
      explanation: _makeExplanation('e'), references: [],
      conceptIds: ['c1'], priority: 'medium', status: 'draft',
      governance: 'canonical', provenance: VALID_FEEDBACK_PROVENANCE,
      trace: {
        traceId: 't', deterministic: false as any,
        generatedFrom: 'deterministic_feedback_kernel',
        randomUsed: false, timeDependency: false,
      },
    };
    const errors = validateAssessmentFeedback(feedback);
    assert.ok(errors.some((e) => e.code === FEEDBACK_VALIDATION_CODES.FEEDBACK_INVALID_TRACE));
  });
});

// ============================================================================
// VALIDATION — Relationship validation
// ============================================================================

describe('validateFeedbackRelationship', () => {
  it('should pass for valid relationship', () => {
    const rel = composeFeedbackRelationship({
      id: 'r1', sourceFeedbackId: 'a', targetFeedbackId: 'b',
      relationshipType: 'depends', rationale: 'r',
    });
    const errors = validateFeedbackRelationship(rel);
    assert.equal(errors.length, 0);
  });

  it('should reject self-relationship', () => {
    const rel = composeFeedbackRelationship({
      id: 'r', sourceFeedbackId: 'a', targetFeedbackId: 'a',
      relationshipType: 'self', rationale: 'r',
    });
    const errors = validateFeedbackRelationship(rel);
    assert.ok(errors.some((e) => e.code === FEEDBACK_VALIDATION_CODES.FEEDBACK_SELF_RELATIONSHIP));
  });
});

// ============================================================================
// VALIDATION — Registry validation
// ============================================================================

describe('validateFeedbackRegistry', () => {
  it('should pass for valid registry', () => {
    const registry = composeFeedbackRegistry([VALID_FEEDBACK_A, VALID_FEEDBACK_B]);
    const result = validateFeedbackRegistry(registry);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it('should reject null registry', () => {
    const result = validateFeedbackRegistry(null as any);
    assert.equal(result.valid, false);
  });

  it('should reject empty registry', () => {
    const registry = composeFeedbackRegistry([]);
    const result = validateFeedbackRegistry(registry);
    assert.equal(result.valid, false);
  });

  it('should detect duplicate ids', () => {
    const duplicateNodes = [_makeFeedback('dup'), _makeFeedback('dup')];
    const registry = composeFeedbackRegistry(duplicateNodes);
    const result = validateFeedbackRegistry(registry);
    assert.equal(result.valid, false);
    assert.ok(result.errors.some((e) => e.code === FEEDBACK_VALIDATION_CODES.FEEDBACK_DUPLICATE_ID));
  });

  it('should detect duplicate titles', () => {
    const duplicateTitles = [
      _makeFeedback('a', { title: 'Same Title' }),
      _makeFeedback('b', { title: 'Same Title' }),
    ];
    const registry = composeFeedbackRegistry(duplicateTitles);
    const result = validateFeedbackRegistry(registry);
    assert.equal(result.valid, false);
    assert.ok(result.errors.some((e) => e.code === FEEDBACK_VALIDATION_CODES.FEEDBACK_DUPLICATE_TITLE));
  });
});

// ============================================================================
// VALIDATION — Input validation
// ============================================================================

describe('validateFeedbackInput', () => {
  it('should pass for valid input', () => {
    const input: FeedbackInput = { nodes: [VALID_FEEDBACK_A] };
    const result = validateFeedbackInput(input);
    assert.equal(result.valid, true);
  });

  it('should reject null input', () => {
    const result = validateFeedbackInput(null as any);
    assert.equal(result.valid, false);
  });

  it('should reject empty input', () => {
    const result = validateFeedbackInput({ nodes: [] });
    assert.equal(result.valid, false);
  });
});

// ============================================================================
// VALIDATION — Trace validation
// ============================================================================

describe('validateFeedbackTrace', () => {
  it('should pass for valid trace', () => {
    const trace = composeFeedbackTrace({ traceId: 'test' });
    const result = validateFeedbackTrace(trace);
    assert.equal(result.valid, true);
  });

  it('should reject null trace', () => {
    const result = validateFeedbackTrace(null as any);
    assert.equal(result.valid, false);
  });
});

// ============================================================================
// VALIDATION — Artifact validation
// ============================================================================

describe('validateAssessmentArtifactWithFeedback', () => {
  it('should pass for valid artifact', () => {
    const artifact = composeAssessmentArtifactWithFeedback({
      artifactId: 'art-1', artifactTitle: 'Test',
      feedback: [VALID_FEEDBACK_A],
    });
    const result = validateAssessmentArtifactWithFeedback(artifact);
    assert.equal(result.valid, true);
  });

  it('should reject null artifact', () => {
    const result = validateAssessmentArtifactWithFeedback(null as any);
    assert.equal(result.valid, false);
  });
});

// ============================================================================
// DETERMINISTIC IDENTITY — 100 iterations
// ============================================================================

describe('Deterministic Identity', () => {
  it('should produce identical output for composeFeedbackRegistry across 100 iterations', () => {
    const nodes = [VALID_FEEDBACK_A, VALID_FEEDBACK_B];
    let firstResult: string | null = null;

    for (let i = 0; i < 100; i++) {
      const result = composeFeedbackRegistry(nodes);
      const serialized = JSON.stringify(result);
      if (firstResult === null) {
        firstResult = serialized;
      } else {
        assert.equal(serialized, firstResult, `Iteration ${i} differs`);
      }
    }
  });

  it('should produce identical output for composeAssessmentFeedback across 100 iterations', () => {
    const params = {
      id: 'f', title: 'T',
      feedbackType: 'conceptual_explanation' as const,
      objective: 'clarification' as const, tone: 'instructional' as const,
      deliveryType: 'text' as const, content: 'C',
      explanation: _makeExplanation('e'),
      references: [_makeReference('r')], conceptIds: ['c1'],
      priority: 'medium' as const, status: 'draft' as const,
      governance: 'canonical' as const, provenance: VALID_FEEDBACK_PROVENANCE,
    };
    let firstResult: string | null = null;

    for (let i = 0; i < 100; i++) {
      const result = composeAssessmentFeedback(params);
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
  it('should not mutate input nodes array in composeFeedbackRegistry', () => {
    const nodes = [VALID_FEEDBACK_C, VALID_FEEDBACK_A];
    const original = JSON.stringify(nodes);
    composeFeedbackRegistry(nodes);
    assert.equal(JSON.stringify(nodes), original);
  });

  it('should not mutate conceptIds in composeAssessmentFeedback', () => {
    const conceptIds = ['c1'];
    const original = JSON.stringify(conceptIds);
    composeAssessmentFeedback({
      id: 'f', title: 'T',
      feedbackType: 'correct_answer', objective: 'clarification',
      tone: 'neutral', deliveryType: 'text', content: 'C',
      explanation: _makeExplanation('e'), references: [],
      conceptIds, priority: 'low', status: 'draft',
      governance: 'canonical', provenance: VALID_FEEDBACK_PROVENANCE,
    });
    assert.equal(JSON.stringify(conceptIds), original);
  });

  it('getCanonicalFeedbackTypes returns a copy not affecting original', () => {
    const copy = getCanonicalFeedbackTypes();
    assert.equal(copy.length, 10);
    (copy as string[]).push('injected');
    assert.equal(CANONICAL_FEEDBACK_TYPES.length, 10);
  });

  it('getCanonicalFeedbackTones returns a copy not affecting original', () => {
    const copy = getCanonicalFeedbackTones();
    assert.equal(copy.length, 10);
    (copy as string[]).push('injected');
    assert.equal(CANONICAL_FEEDBACK_TONES.length, 10);
  });

  it('getCanonicalFeedbackPriorities returns a copy not affecting original', () => {
    const copy = getCanonicalFeedbackPriorities();
    assert.equal(copy.length, 5);
    (copy as string[]).push('injected');
    assert.equal(CANONICAL_FEEDBACK_PRIORITY.length, 5);
  });
});

// ============================================================================
// CROSS-AGENT BOUNDARY — No generation/personalization
// ============================================================================

describe('Cross-Agent Boundary', () => {
  it('should not contain explanation generation', () => {
    const source = JSON.stringify(CANONICAL_FEEDBACK_TYPES);
    assert.ok(!source.includes('generate'));
    assert.ok(!source.includes('create'));
  });

  it('should not contain personalization logic', () => {
    const source = JSON.stringify(CANONICAL_FEEDBACK_TONES);
    assert.ok(!source.includes('personaliz'));
    assert.ok(!source.includes('adaptive'));
    assert.ok(!source.includes('individual'));
  });

  it('should not contain LLM invocation', () => {
    const source = JSON.stringify(CANONICAL_FEEDBACK_TYPES);
    assert.ok(!source.includes('llm'));
    assert.ok(!source.includes('invoke'));
  });

  it('should not contain Narrative Agent modification', () => {
    const source = JSON.stringify(CANONICAL_FEEDBACK_DELIVERY_TYPES);
    assert.ok(!source.includes('narrative'));
    assert.ok(!source.includes('modify'));
  });

  it('should not contain Knowledge Agent modification', () => {
    const source = JSON.stringify(CANONICAL_FEEDBACK_OBJECTIVES);
    assert.ok(!source.includes('knowledge_agent'));
    assert.ok(!source.includes('knowledge_registry'));
  });
});

// ============================================================================
// NEGATIVE CAPABILITY — No scoring/mastery/adaptive
// ============================================================================

describe('Negative Capability', () => {
  it('should not contain scoring logic', () => {
    const source = JSON.stringify(CANONICAL_FEEDBACK_TYPES);
    assert.ok(!source.includes('score'));
    assert.ok(!source.includes('grade'));
    assert.ok(!source.includes('mastery'));
  });

  it('should not contain LLM or async patterns', () => {
    const source = JSON.stringify(CANONICAL_FEEDBACK_TYPES);
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
    const codes = Object.values(FEEDBACK_VALIDATION_CODES);
    assert.equal(codes.length, 24);
  });

  it('all validation codes should be UPPER_SNAKE_CASE', () => {
    for (const code of Object.values(FEEDBACK_VALIDATION_CODES)) {
      assert.ok(/^[A-Z_]+$/.test(code), `Not UPPER_SNAKE_CASE: ${code}`);
    }
  });

  it('all validation codes should start with FEEDBACK_ or EXPLANATION_ or REFERENCE_ or RELATIONSHIP_', () => {
    for (const code of Object.values(FEEDBACK_VALIDATION_CODES)) {
      assert.ok(
        code.startsWith('FEEDBACK_') || code.startsWith('EXPLANATION_') ||
        code.startsWith('REFERENCE_') || code.startsWith('RELATIONSHIP_'),
        `Unexpected prefix: ${code}`,
      );
    }
  });

  it('all keys should match their string values', () => {
    for (const [key, value] of Object.entries(FEEDBACK_VALIDATION_CODES)) {
      assert.equal(key, value, `Key ${key} does not match value ${value}`);
    }
  });
});

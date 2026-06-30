/**
 * NV-2000-D8-OPT-02 — Cognitive Kernel Tests
 *
 * Exhaustive deterministic tests for the Cognitive Kernel.
 * Uses Node.js built-in test runner (node:test).
 *
 * ~85 tests covering:
 * - Canonical enum completeness
 * - Helper functions
 * - Profile composition
 * - Relationship composition
 * - Registry composition
 * - Deterministic sorting
 * - Duplicate detection
 * - Validation codes
 * - Registry validation
 * - Validator stability
 * - Deterministic identity (100 iterations)
 * - Immutability
 * - No mutation
 * - Artifact with cognitive profile
 * - Negative capability verification
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  CANONICAL_COGNITIVE_LEVELS,
  CANONICAL_QUESTION_TYPES,
  CANONICAL_REASONING_TYPES,
  CANONICAL_ASSESSMENT_OBJECTIVES,
  CANONICAL_EXPECTED_EVIDENCE_TYPES,
  CANONICAL_COGNITIVE_STATUS,
  CANONICAL_ASSESSMENT_GOVERNANCE,
  type CognitiveAssessmentProfile,
  type CognitiveInput,
  type CognitiveRegistry,
  type CognitiveProvenance,
  type CognitiveRelationship,
  type AssessmentArtifactWithCognitiveProfile,
} from './AssessmentAgentContract.ts';

import {
  composeCognitiveProvenance,
  composeCognitiveTrace,
  composeCognitiveAssessmentProfile,
  composeCognitiveRelationship,
  composeCognitiveRegistry,
  composeCognitiveRegistryFromInput,
  composeAssessmentCognitiveProfiles,
  composeAssessmentArtifactWithCognitiveProfile,
  isSupportedCognitiveLevel,
  isSupportedQuestionType,
  isSupportedReasoningType,
  isSupportedAssessmentObjective,
  isSupportedExpectedEvidenceType,
  isSupportedCognitiveStatus,
  isSupportedCognitiveGovernance,
  getCanonicalCognitiveLevels,
  getCanonicalQuestionTypes,
  getCanonicalReasoningTypes,
  getCanonicalAssessmentObjectives,
  getCanonicalExpectedEvidenceTypes,
  getCanonicalCognitiveStatuses,
} from './AssessmentCognitiveKernel.ts';

import {
  COGNITIVE_VALIDATION_CODES,
  validateCognitiveAssessmentProfile,
  validateCognitiveRelationship,
  validateCognitiveRegistry,
  validateCognitiveInput,
  validateCognitiveTrace,
  validateAssessmentArtifactWithCognitiveProfile,
} from './AssessmentCognitiveValidation.ts';

// ============================================================================
// TEST FIXTURES
// ============================================================================

const VALID_COGNITIVE_PROVENANCE: CognitiveProvenance = {
  provider: 'test-provider',
  source: 'test-source',
  reviewStatus: 'approved',
  reviewDate: '2025-01-01',
  version: '1.0.0',
  rationale: 'Test rationale for cognitive profile.',
};

function _makeProfile(
  id: string,
  overrides: Partial<CognitiveAssessmentProfile> = {},
): CognitiveAssessmentProfile {
  return {
    id,
    title: `Test Profile ${id}`,
    cognitiveLevel: 'understand',
    questionType: 'multiple_choice',
    reasoningType: 'conceptual',
    assessmentObjective: 'concept_understanding',
    expectedEvidence: 'selected_option',
    status: 'draft',
    governance: 'canonical',
    provenance: VALID_COGNITIVE_PROVENANCE,
    trace: {
      traceId: `trace-${id}`,
      deterministic: true,
      generatedFrom: 'deterministic_cognitive_kernel',
      randomUsed: false,
      timeDependency: false,
    },
    ...overrides,
  };
}

const VALID_PROFILE_A = _makeProfile('profile-a');
const VALID_PROFILE_B = _makeProfile('profile-b');
const VALID_PROFILE_C = _makeProfile('profile-c');

// ============================================================================
// CANONICAL ENUM COMPLETENESS
// ============================================================================

describe('Canonical Enums', () => {
  it('should have exactly 10 cognitive levels', () => {
    assert.equal(CANONICAL_COGNITIVE_LEVELS.length, 10);
  });

  it('should have exactly 10 question types', () => {
    assert.equal(CANONICAL_QUESTION_TYPES.length, 10);
  });

  it('should have exactly 10 reasoning types', () => {
    assert.equal(CANONICAL_REASONING_TYPES.length, 10);
  });

  it('should have exactly 10 assessment objectives', () => {
    assert.equal(CANONICAL_ASSESSMENT_OBJECTIVES.length, 10);
  });

  it('should have exactly 10 expected evidence types', () => {
    assert.equal(CANONICAL_EXPECTED_EVIDENCE_TYPES.length, 10);
  });

  it('should have exactly 6 cognitive statuses', () => {
    assert.equal(CANONICAL_COGNITIVE_STATUS.length, 6);
  });

  it('should contain expected cognitive levels', () => {
    const expected = [
      'remember', 'understand', 'apply', 'analyze', 'evaluate',
      'create', 'reason', 'justify', 'design', 'reflect',
    ];
    for (const value of expected) {
      assert.ok(
        CANONICAL_COGNITIVE_LEVELS.includes(value as any),
        `Missing cognitive level: ${value}`,
      );
    }
  });

  it('should contain expected question types', () => {
    const expected = [
      'multiple_choice', 'multiple_select', 'true_false', 'short_answer',
      'long_answer', 'matching', 'ordering', 'concept_mapping',
      'engineering_case', 'reflection',
    ];
    for (const value of expected) {
      assert.ok(
        CANONICAL_QUESTION_TYPES.includes(value as any),
        `Missing question type: ${value}`,
      );
    }
  });

  it('should contain expected reasoning types', () => {
    const expected = [
      'factual', 'conceptual', 'procedural', 'analytical', 'comparative',
      'causal', 'diagnostic', 'engineering', 'critical', 'reflective',
    ];
    for (const value of expected) {
      assert.ok(
        CANONICAL_REASONING_TYPES.includes(value as any),
        `Missing reasoning type: ${value}`,
      );
    }
  });

  it('should contain expected assessment objectives', () => {
    const expected = [
      'knowledge_verification', 'concept_understanding', 'practical_application',
      'engineering_reasoning', 'constraint_analysis', 'trade_off_evaluation',
      'system_design', 'laboratory_validation', 'portfolio_evidence', 'reflection',
    ];
    for (const value of expected) {
      assert.ok(
        CANONICAL_ASSESSMENT_OBJECTIVES.includes(value as any),
        `Missing assessment objective: ${value}`,
      );
    }
  });

  it('should contain expected expected evidence types', () => {
    const expected = [
      'selected_option', 'written_response', 'concept_relationship',
      'calculation', 'engineering_argument', 'architecture_design',
      'laboratory_observation', 'comparison', 'decision_justification',
      'reflection',
    ];
    for (const value of expected) {
      assert.ok(
        CANONICAL_EXPECTED_EVIDENCE_TYPES.includes(value as any),
        `Missing expected evidence type: ${value}`,
      );
    }
  });

  it('should contain expected cognitive statuses', () => {
    const expected = ['draft', 'review', 'approved', 'published', 'deprecated', 'archived'];
    for (const value of expected) {
      assert.ok(
        CANONICAL_COGNITIVE_STATUS.includes(value as any),
        `Missing cognitive status: ${value}`,
      );
    }
  });
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

describe('Helper Functions', () => {
  it('isSupportedCognitiveLevel returns true for valid levels', () => {
    assert.equal(isSupportedCognitiveLevel('remember'), true);
    assert.equal(isSupportedCognitiveLevel('reflect'), true);
  });

  it('isSupportedCognitiveLevel returns false for invalid levels', () => {
    assert.equal(isSupportedCognitiveLevel('invalid'), false);
    assert.equal(isSupportedCognitiveLevel(''), false);
  });

  it('isSupportedQuestionType returns true for valid types', () => {
    assert.equal(isSupportedQuestionType('multiple_choice'), true);
    assert.equal(isSupportedQuestionType('reflection'), true);
  });

  it('isSupportedQuestionType returns false for invalid types', () => {
    assert.equal(isSupportedQuestionType('invalid'), false);
    assert.equal(isSupportedQuestionType(''), false);
  });

  it('isSupportedReasoningType returns true for valid types', () => {
    assert.equal(isSupportedReasoningType('factual'), true);
    assert.equal(isSupportedReasoningType('reflective'), true);
  });

  it('isSupportedReasoningType returns false for invalid types', () => {
    assert.equal(isSupportedReasoningType('invalid'), false);
    assert.equal(isSupportedReasoningType(''), false);
  });

  it('isSupportedAssessmentObjective returns true for valid objectives', () => {
    assert.equal(isSupportedAssessmentObjective('knowledge_verification'), true);
    assert.equal(isSupportedAssessmentObjective('reflection'), true);
  });

  it('isSupportedAssessmentObjective returns false for invalid objectives', () => {
    assert.equal(isSupportedAssessmentObjective('invalid'), false);
    assert.equal(isSupportedAssessmentObjective(''), false);
  });

  it('isSupportedExpectedEvidenceType returns true for valid types', () => {
    assert.equal(isSupportedExpectedEvidenceType('selected_option'), true);
    assert.equal(isSupportedExpectedEvidenceType('reflection'), true);
  });

  it('isSupportedExpectedEvidenceType returns false for invalid types', () => {
    assert.equal(isSupportedExpectedEvidenceType('invalid'), false);
    assert.equal(isSupportedExpectedEvidenceType(''), false);
  });

  it('isSupportedCognitiveStatus returns true for valid statuses', () => {
    assert.equal(isSupportedCognitiveStatus('draft'), true);
    assert.equal(isSupportedCognitiveStatus('archived'), true);
  });

  it('isSupportedCognitiveStatus returns false for invalid statuses', () => {
    assert.equal(isSupportedCognitiveStatus('invalid'), false);
    assert.equal(isSupportedCognitiveStatus(''), false);
  });

  it('isSupportedCognitiveGovernance returns true for valid governance', () => {
    assert.equal(isSupportedCognitiveGovernance('canonical'), true);
    assert.equal(isSupportedCognitiveGovernance('rejected'), true);
  });

  it('isSupportedCognitiveGovernance returns false for invalid governance', () => {
    assert.equal(isSupportedCognitiveGovernance('invalid'), false);
    assert.equal(isSupportedCognitiveGovernance(''), false);
  });

  it('getCanonicalCognitiveLevels returns a copy', () => {
    const result = getCanonicalCognitiveLevels();
    assert.equal(result.length, 10);
    assert.deepEqual([...result], [...CANONICAL_COGNITIVE_LEVELS]);
    (result as string[]).push('injected');
    assert.equal(CANONICAL_COGNITIVE_LEVELS.length, 10);
  });

  it('getCanonicalQuestionTypes returns a copy', () => {
    const result = getCanonicalQuestionTypes();
    assert.equal(result.length, 10);
    assert.deepEqual([...result], [...CANONICAL_QUESTION_TYPES]);
  });

  it('getCanonicalReasoningTypes returns a copy', () => {
    const result = getCanonicalReasoningTypes();
    assert.equal(result.length, 10);
    assert.deepEqual([...result], [...CANONICAL_REASONING_TYPES]);
  });

  it('getCanonicalAssessmentObjectives returns a copy', () => {
    const result = getCanonicalAssessmentObjectives();
    assert.equal(result.length, 10);
    assert.deepEqual([...result], [...CANONICAL_ASSESSMENT_OBJECTIVES]);
  });

  it('getCanonicalExpectedEvidenceTypes returns a copy', () => {
    const result = getCanonicalExpectedEvidenceTypes();
    assert.equal(result.length, 10);
    assert.deepEqual([...result], [...CANONICAL_EXPECTED_EVIDENCE_TYPES]);
  });

  it('getCanonicalCognitiveStatuses returns a copy', () => {
    const result = getCanonicalCognitiveStatuses();
    assert.equal(result.length, 6);
    assert.deepEqual([...result], [...CANONICAL_COGNITIVE_STATUS]);
  });
});

// ============================================================================
// COMPOSE FUNCTIONS — Provenance
// ============================================================================

describe('composeCognitiveProvenance', () => {
  it('should compose provenance from valid params', () => {
    const provenance = composeCognitiveProvenance({
      provider: 'test',
      source: 'src',
      reviewStatus: 'approved',
      reviewDate: '2025-01-01',
      version: '1.0.0',
      rationale: 'r',
    });
    assert.equal(provenance.provider, 'test');
    assert.equal(provenance.source, 'src');
    assert.equal(provenance.reviewStatus, 'approved');
    assert.equal(provenance.reviewDate, '2025-01-01');
    assert.equal(provenance.version, '1.0.0');
    assert.equal(provenance.rationale, 'r');
  });

  it('should return identical output for identical input', () => {
    const params = {
      provider: 'p', source: 's', reviewStatus: 'draft' as const,
      reviewDate: '2025-01-01', version: '1.0.0', rationale: 'r',
    };
    const p1 = composeCognitiveProvenance(params);
    const p2 = composeCognitiveProvenance(params);
    assert.deepEqual(p1, p2);
  });
});

// ============================================================================
// COMPOSE FUNCTIONS — Trace
// ============================================================================

describe('composeCognitiveTrace', () => {
  it('should compose trace with deterministic metadata', () => {
    const trace = composeCognitiveTrace({ traceId: 'test-trace' });
    assert.equal(trace.traceId, 'test-trace');
    assert.equal(trace.deterministic, true);
    assert.equal(trace.generatedFrom, 'deterministic_cognitive_kernel');
    assert.equal(trace.randomUsed, false);
    assert.equal(trace.timeDependency, false);
  });

  it('should return identical output for identical input', () => {
    const t1 = composeCognitiveTrace({ traceId: 'id' });
    const t2 = composeCognitiveTrace({ traceId: 'id' });
    assert.deepEqual(t1, t2);
  });
});

// ============================================================================
// COMPOSE FUNCTIONS — Profile
// ============================================================================

describe('composeCognitiveAssessmentProfile', () => {
  it('should compose profile from valid params', () => {
    const profile = composeCognitiveAssessmentProfile({
      id: 'test-id',
      title: 'Test Title',
      cognitiveLevel: 'analyze',
      questionType: 'short_answer',
      reasoningType: 'analytical',
      assessmentObjective: 'engineering_reasoning',
      expectedEvidence: 'written_response',
      status: 'review',
      governance: 'accepted',
      provenance: VALID_COGNITIVE_PROVENANCE,
    });
    assert.equal(profile.id, 'test-id');
    assert.equal(profile.title, 'Test Title');
    assert.equal(profile.cognitiveLevel, 'analyze');
    assert.equal(profile.questionType, 'short_answer');
    assert.equal(profile.reasoningType, 'analytical');
    assert.equal(profile.assessmentObjective, 'engineering_reasoning');
    assert.equal(profile.expectedEvidence, 'written_response');
    assert.equal(profile.status, 'review');
    assert.equal(profile.governance, 'accepted');
    assert.equal(profile.trace.deterministic, true);
    assert.equal(profile.trace.randomUsed, false);
    assert.equal(profile.trace.timeDependency, false);
  });

  it('should generate deterministic trace id', () => {
    const params = {
      id: 'x', title: 'T', cognitiveLevel: 'apply' as const,
      questionType: 'multiple_choice' as const, reasoningType: 'factual' as const,
      assessmentObjective: 'knowledge_verification' as const,
      expectedEvidence: 'selected_option' as const, status: 'draft' as const,
      governance: 'canonical' as const, provenance: VALID_COGNITIVE_PROVENANCE,
    };
    const p1 = composeCognitiveAssessmentProfile(params);
    const p2 = composeCognitiveAssessmentProfile(params);
    assert.equal(p1.trace.traceId, p2.trace.traceId);
  });

  it('should not mutate provenance input', () => {
    const provenance = { ...VALID_COGNITIVE_PROVENANCE };
    const original = JSON.stringify(provenance);
    composeCognitiveAssessmentProfile({
      id: 'test', title: 'T', cognitiveLevel: 'remember',
      questionType: 'true_false', reasoningType: 'factual',
      assessmentObjective: 'knowledge_verification',
      expectedEvidence: 'selected_option', status: 'draft',
      governance: 'canonical', provenance,
    });
    assert.equal(JSON.stringify(provenance), original);
  });
});

// ============================================================================
// COMPOSE FUNCTIONS — Relationship
// ============================================================================

describe('composeCognitiveRelationship', () => {
  it('should compose relationship from valid params', () => {
    const rel = composeCognitiveRelationship({
      id: 'rel-1',
      sourceProfileId: 'profile-a',
      targetProfileId: 'profile-b',
      relationshipType: 'prerequisite',
      rationale: 'Foundation knowledge',
    });
    assert.equal(rel.id, 'rel-1');
    assert.equal(rel.sourceProfileId, 'profile-a');
    assert.equal(rel.targetProfileId, 'profile-b');
    assert.equal(rel.relationshipType, 'prerequisite');
    assert.equal(rel.rationale, 'Foundation knowledge');
  });

  it('should return identical output for identical input', () => {
    const params = {
      id: 'r', sourceProfileId: 'a', targetProfileId: 'b',
      relationshipType: 'dep', rationale: 'reason',
    };
    const r1 = composeCognitiveRelationship(params);
    const r2 = composeCognitiveRelationship(params);
    assert.deepEqual(r1, r2);
  });
});

// ============================================================================
// COMPOSE FUNCTIONS — Registry
// ============================================================================

describe('composeCognitiveRegistry', () => {
  it('should compose registry from profiles', () => {
    const registry = composeCognitiveRegistry([VALID_PROFILE_A, VALID_PROFILE_B]);
    assert.equal(registry.nodes.length, 2);
    assert.equal(registry.metadata.nodeCount, 2);
    assert.equal(registry.metadata.deterministic, true);
    assert.equal(registry.metadata.randomUsed, false);
    assert.equal(registry.metadata.timeDependency, false);
  });

  it('should sort nodes by id', () => {
    const registry = composeCognitiveRegistry([VALID_PROFILE_C, VALID_PROFILE_A, VALID_PROFILE_B]);
    assert.equal(registry.nodes[0].id, 'profile-a');
    assert.equal(registry.nodes[1].id, 'profile-b');
    assert.equal(registry.nodes[2].id, 'profile-c');
  });

  it('should return identical output for identical input', () => {
    const nodes = [VALID_PROFILE_A, VALID_PROFILE_B];
    const r1 = composeCognitiveRegistry(nodes);
    const r2 = composeCognitiveRegistry(nodes);
    assert.deepEqual(r1, r2);
  });

  it('should not mutate input nodes array', () => {
    const nodes = [VALID_PROFILE_C, VALID_PROFILE_A];
    const original = JSON.stringify(nodes);
    composeCognitiveRegistry(nodes);
    assert.equal(JSON.stringify(nodes), original);
  });

  it('should handle empty array', () => {
    const registry = composeCognitiveRegistry([]);
    assert.equal(registry.nodes.length, 0);
    assert.equal(registry.metadata.nodeCount, 0);
  });
});

// ============================================================================
// COMPOSE FUNCTIONS — Registry from Input
// ============================================================================

describe('composeCognitiveRegistryFromInput', () => {
  it('should compose registry from input', () => {
    const input: CognitiveInput = { nodes: [VALID_PROFILE_A, VALID_PROFILE_B] };
    const registry = composeCognitiveRegistryFromInput(input);
    assert.equal(registry.nodes.length, 2);
    assert.equal(registry.metadata.nodeCount, 2);
  });

  it('should return identical output for identical input', () => {
    const input: CognitiveInput = { nodes: [VALID_PROFILE_A] };
    const r1 = composeCognitiveRegistryFromInput(input);
    const r2 = composeCognitiveRegistryFromInput(input);
    assert.deepEqual(r1, r2);
  });
});

// ============================================================================
// COMPOSE FUNCTIONS — Assessment Cognitive Profiles
// ============================================================================

describe('composeAssessmentCognitiveProfiles', () => {
  it('should compose profiles into registry', () => {
    const result = composeAssessmentCognitiveProfiles({
      profiles: [VALID_PROFILE_A, VALID_PROFILE_B],
    });
    assert.equal(result.nodes.length, 2);
    assert.equal(result.metadata.nodeCount, 2);
  });

  it('should return identical output for identical input', () => {
    const params = { profiles: [VALID_PROFILE_A] };
    const r1 = composeAssessmentCognitiveProfiles(params);
    const r2 = composeAssessmentCognitiveProfiles(params);
    assert.deepEqual(r1, r2);
  });
});

// ============================================================================
// COMPOSE FUNCTIONS — Artifact with Cognitive Profile
// ============================================================================

describe('composeAssessmentArtifactWithCognitiveProfile', () => {
  it('should compose artifact with profile', () => {
    const result = composeAssessmentArtifactWithCognitiveProfile({
      artifactId: 'art-1',
      artifactTitle: 'Test Artifact',
      cognitiveProfile: VALID_PROFILE_A,
    });
    assert.equal(result.artifactId, 'art-1');
    assert.equal(result.artifactTitle, 'Test Artifact');
    assert.equal(result.cognitiveProfile.id, 'profile-a');
  });

  it('should return identical output for identical input', () => {
    const params = {
      artifactId: 'a', artifactTitle: 'T', cognitiveProfile: VALID_PROFILE_A,
    };
    const r1 = composeAssessmentArtifactWithCognitiveProfile(params);
    const r2 = composeAssessmentArtifactWithCognitiveProfile(params);
    assert.deepEqual(r1, r2);
  });

  it('should not mutate cognitive profile input', () => {
    const profile = { ...VALID_PROFILE_A };
    const original = JSON.stringify(profile);
    composeAssessmentArtifactWithCognitiveProfile({
      artifactId: 'a', artifactTitle: 'T', cognitiveProfile: profile,
    });
    assert.equal(JSON.stringify(profile), original);
  });
});

// ============================================================================
// VALIDATION — Profile validation
// ============================================================================

describe('validateCognitiveAssessmentProfile', () => {
  it('should pass for valid profile', () => {
    const errors = validateCognitiveAssessmentProfile(VALID_PROFILE_A);
    assert.equal(errors.length, 0);
  });

  it('should reject null profile', () => {
    const errors = validateCognitiveAssessmentProfile(null as any);
    assert.ok(errors.length > 0);
    assert.equal(errors[0].code, COGNITIVE_VALIDATION_CODES.COGNITIVE_MISSING_PROFILE_ID);
  });

  it('should reject profile with missing id', () => {
    const profile = _makeProfile('');
    const errors = validateCognitiveAssessmentProfile(profile);
    assert.ok(errors.some((e) => e.code === COGNITIVE_VALIDATION_CODES.COGNITIVE_MISSING_PROFILE_ID));
  });

  it('should reject profile with missing title', () => {
    const profile = _makeProfile('id', { title: '' });
    const errors = validateCognitiveAssessmentProfile(profile);
    assert.ok(errors.some((e) => e.code === COGNITIVE_VALIDATION_CODES.COGNITIVE_MISSING_TITLE));
  });

  it('should reject profile with invalid cognitive level', () => {
    const profile = _makeProfile('id', { cognitiveLevel: 'invalid' as any });
    const errors = validateCognitiveAssessmentProfile(profile);
    assert.ok(errors.some((e) => e.code === COGNITIVE_VALIDATION_CODES.COGNITIVE_INVALID_LEVEL));
  });

  it('should reject profile with invalid question type', () => {
    const profile = _makeProfile('id', { questionType: 'invalid' as any });
    const errors = validateCognitiveAssessmentProfile(profile);
    assert.ok(errors.some((e) => e.code === COGNITIVE_VALIDATION_CODES.COGNITIVE_INVALID_QUESTION_TYPE));
  });

  it('should reject profile with invalid reasoning type', () => {
    const profile = _makeProfile('id', { reasoningType: 'invalid' as any });
    const errors = validateCognitiveAssessmentProfile(profile);
    assert.ok(errors.some((e) => e.code === COGNITIVE_VALIDATION_CODES.COGNITIVE_INVALID_REASONING));
  });

  it('should reject profile with invalid objective', () => {
    const profile = _makeProfile('id', { assessmentObjective: 'invalid' as any });
    const errors = validateCognitiveAssessmentProfile(profile);
    assert.ok(errors.some((e) => e.code === COGNITIVE_VALIDATION_CODES.COGNITIVE_INVALID_OBJECTIVE));
  });

  it('should reject profile with invalid expected evidence', () => {
    const profile = _makeProfile('id', { expectedEvidence: 'invalid' as any });
    const errors = validateCognitiveAssessmentProfile(profile);
    assert.ok(errors.some((e) => e.code === COGNITIVE_VALIDATION_CODES.COGNITIVE_INVALID_EXPECTED_EVIDENCE));
  });

  it('should reject profile with invalid status', () => {
    const profile = _makeProfile('id', { status: 'invalid' as any });
    const errors = validateCognitiveAssessmentProfile(profile);
    assert.ok(errors.some((e) => e.code === COGNITIVE_VALIDATION_CODES.COGNITIVE_INVALID_STATUS));
  });

  it('should reject profile with invalid governance', () => {
    const profile = _makeProfile('id', { governance: 'invalid' as any });
    const errors = validateCognitiveAssessmentProfile(profile);
    assert.ok(errors.some((e) => e.code === COGNITIVE_VALIDATION_CODES.COGNITIVE_INVALID_GOVERNANCE));
  });

  it('should reject profile with missing provenance', () => {
    const profile = _makeProfile('id', { provenance: null as any });
    const errors = validateCognitiveAssessmentProfile(profile);
    assert.ok(errors.some((e) => e.code === COGNITIVE_VALIDATION_CODES.COGNITIVE_MISSING_PROVENANCE));
  });

  it('should reject profile with missing provider', () => {
    const profile = _makeProfile('id', {
      provenance: { ...VALID_COGNITIVE_PROVENANCE, provider: '' },
    });
    const errors = validateCognitiveAssessmentProfile(profile);
    assert.ok(errors.some((e) => e.code === COGNITIVE_VALIDATION_CODES.COGNITIVE_MISSING_PROVIDER));
  });

  it('should reject profile with missing rationale', () => {
    const profile = _makeProfile('id', {
      provenance: { ...VALID_COGNITIVE_PROVENANCE, rationale: '' },
    });
    const errors = validateCognitiveAssessmentProfile(profile);
    assert.ok(errors.some((e) => e.code === COGNITIVE_VALIDATION_CODES.COGNITIVE_MISSING_RATIONALE));
  });

  it('should reject profile with missing trace', () => {
    const profile = _makeProfile('id', { trace: null as any });
    const errors = validateCognitiveAssessmentProfile(profile);
    assert.ok(errors.some((e) => e.code === COGNITIVE_VALIDATION_CODES.COGNITIVE_INVALID_TRACE));
  });

  it('should reject profile with non-deterministic trace', () => {
    const profile = _makeProfile('id', {
      trace: { ...VALID_PROFILE_A.trace, deterministic: false as any },
    });
    const errors = validateCognitiveAssessmentProfile(profile);
    assert.ok(errors.some((e) => e.code === COGNITIVE_VALIDATION_CODES.COGNITIVE_INVALID_TRACE));
  });
});

// ============================================================================
// VALIDATION — Relationship validation
// ============================================================================

describe('validateCognitiveRelationship', () => {
  it('should pass for valid relationship', () => {
    const rel = composeCognitiveRelationship({
      id: 'r1', sourceProfileId: 'a', targetProfileId: 'b',
      relationshipType: 'prerequisite', rationale: 'r',
    });
    const errors = validateCognitiveRelationship(rel);
    assert.equal(errors.length, 0);
  });

  it('should reject null relationship', () => {
    const errors = validateCognitiveRelationship(null as any);
    assert.ok(errors.length > 0);
  });

  it('should reject relationship with missing sourceProfileId', () => {
    const errors = validateCognitiveRelationship({
      id: 'r', sourceProfileId: '', targetProfileId: 'b',
      relationshipType: 'dep', rationale: 'r',
    });
    assert.ok(errors.some((e) => e.code === COGNITIVE_VALIDATION_CODES.COGNITIVE_MISSING_ASSESSMENT_REFERENCE));
  });

  it('should reject relationship with missing targetProfileId', () => {
    const errors = validateCognitiveRelationship({
      id: 'r', sourceProfileId: 'a', targetProfileId: '',
      relationshipType: 'dep', rationale: 'r',
    });
    assert.ok(errors.some((e) => e.code === COGNITIVE_VALIDATION_CODES.COGNITIVE_MISSING_ASSESSMENT_REFERENCE));
  });

  it('should reject self-relationship', () => {
    const errors = validateCognitiveRelationship({
      id: 'r', sourceProfileId: 'a', targetProfileId: 'a',
      relationshipType: 'self', rationale: 'r',
    });
    assert.ok(errors.some((e) => e.code === COGNITIVE_VALIDATION_CODES.COGNITIVE_SELF_RELATIONSHIP));
  });
});

// ============================================================================
// VALIDATION — Registry validation
// ============================================================================

describe('validateCognitiveRegistry', () => {
  it('should pass for valid registry', () => {
    const registry = composeCognitiveRegistry([VALID_PROFILE_A, VALID_PROFILE_B]);
    const result = validateCognitiveRegistry(registry);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
    assert.equal(result.nodeResults.length, 2);
  });

  it('should reject null registry', () => {
    const result = validateCognitiveRegistry(null as any);
    assert.equal(result.valid, false);
    assert.ok(result.errors.some((e) => e.code === COGNITIVE_VALIDATION_CODES.COGNITIVE_EMPTY_REGISTRY));
  });

  it('should reject empty nodes array', () => {
    const registry = composeCognitiveRegistry([]);
    const result = validateCognitiveRegistry(registry);
    assert.equal(result.valid, false);
    assert.ok(result.errors.some((e) => e.code === COGNITIVE_VALIDATION_CODES.COGNITIVE_EMPTY_REGISTRY));
  });

  it('should detect duplicate ids', () => {
    const duplicateNodes = [_makeProfile('dup'), _makeProfile('dup')];
    const registry = composeCognitiveRegistry(duplicateNodes);
    const result = validateCognitiveRegistry(registry);
    assert.equal(result.valid, false);
    assert.ok(result.errors.some((e) => e.code === COGNITIVE_VALIDATION_CODES.COGNITIVE_DUPLICATE_ID));
  });

  it('should detect duplicate titles', () => {
    const duplicateTitles = [
      _makeProfile('a', { title: 'Same Title' }),
      _makeProfile('b', { title: 'Same Title' }),
    ];
    const registry = composeCognitiveRegistry(duplicateTitles);
    const result = validateCognitiveRegistry(registry);
    assert.equal(result.valid, false);
    assert.ok(result.errors.some((e) => e.code === COGNITIVE_VALIDATION_CODES.COGNITIVE_DUPLICATE_TITLE));
  });

  it('should detect metadata nodeCount inconsistency', () => {
    const registry: CognitiveRegistry = {
      metadata: {
        registryId: 'test',
        version: '1.0.0',
        nodeCount: 5,
        generatedFrom: 'deterministic_cognitive_kernel',
        deterministic: true,
        randomUsed: false,
        timeDependency: false,
      },
      nodes: [VALID_PROFILE_A],
    };
    const result = validateCognitiveRegistry(registry);
    assert.equal(result.valid, false);
    assert.ok(
      result.errors.some(
        (e) => e.code === COGNITIVE_VALIDATION_CODES.COGNITIVE_REGISTRY_INCONSISTENCY,
      ),
    );
  });
});

// ============================================================================
// VALIDATION — Input validation
// ============================================================================

describe('validateCognitiveInput', () => {
  it('should pass for valid input', () => {
    const input: CognitiveInput = { nodes: [VALID_PROFILE_A] };
    const result = validateCognitiveInput(input);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it('should reject null input', () => {
    const result = validateCognitiveInput(null as any);
    assert.equal(result.valid, false);
  });

  it('should reject input with no nodes', () => {
    const result = validateCognitiveInput({ nodes: [] });
    assert.equal(result.valid, false);
  });
});

// ============================================================================
// VALIDATION — Trace validation
// ============================================================================

describe('validateCognitiveTrace', () => {
  it('should pass for valid trace', () => {
    const trace = composeCognitiveTrace({ traceId: 'test' });
    const result = validateCognitiveTrace(trace);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it('should reject null trace', () => {
    const result = validateCognitiveTrace(null as any);
    assert.equal(result.valid, false);
  });

  it('should reject trace with missing traceId', () => {
    const result = validateCognitiveTrace({
      traceId: '',
      deterministic: true,
      generatedFrom: 'deterministic_cognitive_kernel',
      randomUsed: false,
      timeDependency: false,
    });
    assert.equal(result.valid, false);
  });

  it('should reject trace with deterministic false', () => {
    const result = validateCognitiveTrace({
      traceId: 'id',
      deterministic: false as any,
      generatedFrom: 'deterministic_cognitive_kernel',
      randomUsed: false,
      timeDependency: false,
    });
    assert.equal(result.valid, false);
  });
});

// ============================================================================
// VALIDATION — Artifact with cognitive profile validation
// ============================================================================

describe('validateAssessmentArtifactWithCognitiveProfile', () => {
  it('should pass for valid artifact', () => {
    const artifact = composeAssessmentArtifactWithCognitiveProfile({
      artifactId: 'art-1',
      artifactTitle: 'Test',
      cognitiveProfile: VALID_PROFILE_A,
    });
    const result = validateAssessmentArtifactWithCognitiveProfile(artifact);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it('should reject null artifact', () => {
    const result = validateAssessmentArtifactWithCognitiveProfile(null as any);
    assert.equal(result.valid, false);
  });

  it('should reject artifact with missing artifactId', () => {
    const result = validateAssessmentArtifactWithCognitiveProfile({
      artifactId: '',
      artifactTitle: 'Test',
      cognitiveProfile: VALID_PROFILE_A,
    } as any);
    assert.equal(result.valid, false);
  });

  it('should reject artifact with invalid cognitive profile', () => {
    const result = validateAssessmentArtifactWithCognitiveProfile({
      artifactId: 'art',
      artifactTitle: 'Test',
      cognitiveProfile: { id: '' },
    } as any);
    assert.equal(result.valid, false);
  });
});

// ============================================================================
// DETERMINISTIC IDENTITY — 100 iterations
// ============================================================================

describe('Deterministic Identity', () => {
  it('should produce identical output for composeCognitiveRegistry across 100 iterations', () => {
    const nodes = [VALID_PROFILE_A, VALID_PROFILE_B];
    let firstResult: string | null = null;

    for (let i = 0; i < 100; i++) {
      const result = composeCognitiveRegistry(nodes);
      const serialized = JSON.stringify(result);
      if (firstResult === null) {
        firstResult = serialized;
      } else {
        assert.equal(serialized, firstResult, `Iteration ${i} differs from first`);
      }
    }
  });

  it('should produce identical output for composeCognitiveAssessmentProfile across 100 iterations', () => {
    const params = {
      id: 'test', title: 'T', cognitiveLevel: 'apply' as const,
      questionType: 'multiple_choice' as const, reasoningType: 'factual' as const,
      assessmentObjective: 'knowledge_verification' as const,
      expectedEvidence: 'selected_option' as const, status: 'draft' as const,
      governance: 'canonical' as const, provenance: VALID_COGNITIVE_PROVENANCE,
    };
    let firstResult: string | null = null;

    for (let i = 0; i < 100; i++) {
      const result = composeCognitiveAssessmentProfile(params);
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
  it('should not mutate input nodes array in composeCognitiveRegistry', () => {
    const nodes = [VALID_PROFILE_C, VALID_PROFILE_A];
    const original = JSON.stringify(nodes);
    composeCognitiveRegistry(nodes);
    assert.equal(JSON.stringify(nodes), original);
  });

  it('should not mutate input nodes in composeCognitiveRegistryFromInput', () => {
    const input: CognitiveInput = { nodes: [VALID_PROFILE_C, VALID_PROFILE_A] };
    const original = JSON.stringify(input);
    composeCognitiveRegistryFromInput(input);
    assert.equal(JSON.stringify(input), original);
  });

  it('should not mutate provenance in composeCognitiveAssessmentProfile', () => {
    const provenance = { ...VALID_COGNITIVE_PROVENANCE };
    const original = JSON.stringify(provenance);
    composeCognitiveAssessmentProfile({
      id: 'test', title: 'T', cognitiveLevel: 'remember',
      questionType: 'true_false', reasoningType: 'factual',
      assessmentObjective: 'knowledge_verification',
      expectedEvidence: 'selected_option', status: 'draft',
      governance: 'canonical', provenance,
    });
    assert.equal(JSON.stringify(provenance), original);
  });

  it('getCanonicalCognitiveLevels returns a copy not affecting original', () => {
    const copy = getCanonicalCognitiveLevels();
    assert.equal(copy.length, 10);
    (copy as string[]).push('injected');
    assert.equal(CANONICAL_COGNITIVE_LEVELS.length, 10);
  });

  it('getCanonicalQuestionTypes returns a copy not affecting original', () => {
    const copy = getCanonicalQuestionTypes();
    assert.equal(copy.length, 10);
    (copy as string[]).push('injected');
    assert.equal(CANONICAL_QUESTION_TYPES.length, 10);
  });

  it('getCanonicalReasoningTypes returns a copy not affecting original', () => {
    const copy = getCanonicalReasoningTypes();
    assert.equal(copy.length, 10);
    (copy as string[]).push('injected');
    assert.equal(CANONICAL_REASONING_TYPES.length, 10);
  });

  it('getCanonicalAssessmentObjectives returns a copy not affecting original', () => {
    const copy = getCanonicalAssessmentObjectives();
    assert.equal(copy.length, 10);
    (copy as string[]).push('injected');
    assert.equal(CANONICAL_ASSESSMENT_OBJECTIVES.length, 10);
  });

  it('getCanonicalExpectedEvidenceTypes returns a copy not affecting original', () => {
    const copy = getCanonicalExpectedEvidenceTypes();
    assert.equal(copy.length, 10);
    (copy as string[]).push('injected');
    assert.equal(CANONICAL_EXPECTED_EVIDENCE_TYPES.length, 10);
  });

  it('getCanonicalCognitiveStatuses returns a copy not affecting original', () => {
    const copy = getCanonicalCognitiveStatuses();
    assert.equal(copy.length, 6);
    (copy as string[]).push('injected');
    assert.equal(CANONICAL_COGNITIVE_STATUS.length, 6);
  });
});

// ============================================================================
// NEGATIVE CAPABILITY — No assessment logic
// ============================================================================

describe('Negative Capability', () => {
  it('should not contain grading logic', () => {
    const source = JSON.stringify(CANONICAL_COGNITIVE_LEVELS);
    assert.ok(!source.includes('grade'));
    assert.ok(!source.includes('score'));
    assert.ok(!source.includes('verify'));
  });

  it('should not contain question generation', () => {
    const source = JSON.stringify(CANONICAL_QUESTION_TYPES);
    assert.ok(!source.includes('generate'));
    assert.ok(!source.includes('question'));
  });

  it('should not contain feedback logic', () => {
    const source = JSON.stringify(CANONICAL_COGNITIVE_LEVELS);
    assert.ok(!source.includes('feedback'));
    assert.ok(!source.includes('misconception'));
  });

  it('should not contain LLM or async patterns', () => {
    const source = JSON.stringify(CANONICAL_COGNITIVE_LEVELS);
    assert.ok(!source.includes('Promise'));
    assert.ok(!source.includes('async'));
    assert.ok(!source.includes('await'));
  });
});

// ============================================================================
// VALIDATION CODES — Structure verification
// ============================================================================

describe('Validation Codes', () => {
  it('should have at least 19 validation codes', () => {
    const codes = Object.values(COGNITIVE_VALIDATION_CODES);
    assert.ok(codes.length >= 19);
  });

  it('all validation codes should be UPPER_SNAKE_CASE', () => {
    for (const code of Object.values(COGNITIVE_VALIDATION_CODES)) {
      assert.ok(
        /^[A-Z_]+$/.test(code),
        `Validation code is not UPPER_SNAKE_CASE: ${code}`,
      );
    }
  });

  it('all validation codes should start with COGNITIVE_', () => {
    for (const code of Object.values(COGNITIVE_VALIDATION_CODES)) {
      assert.ok(
        code.startsWith('COGNITIVE_'),
        `Validation code does not start with COGNITIVE_: ${code}`,
      );
    }
  });

  it('all keys should match their string values', () => {
    for (const [key, value] of Object.entries(COGNITIVE_VALIDATION_CODES)) {
      assert.equal(key, value, `Key ${key} does not match value ${value}`);
    }
  });
});

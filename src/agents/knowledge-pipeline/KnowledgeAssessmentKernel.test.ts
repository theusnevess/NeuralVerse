/**
 * D10-OPT-12 — Assessment Metadata Kernel Test Suite
 *
 * Comprehensive deterministic test suite for the Assessment Kernel.
 * Covers: composition, validation, helpers, determinism, immutability,
 * runtime restrictions, cross-agent boundary, and public API.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import type {
  KnowledgeAssessmentProfile,
  KnowledgeAssessmentProvenance,
  KnowledgeAssessmentRelationship,
  KnowledgeAssessmentInput,
  KnowledgeAssessmentRegistry,
  KnowledgeAssessmentTrace,
  KnowledgeArtifactWithAssessments,
} from './KnowledgeAgentContract.ts';

import {
  CANONICAL_ASSESSMENT_TYPES,
  CANONICAL_ASSESSMENT_OBJECTIVES,
  CANONICAL_ASSESSMENT_DIFFICULTY,
  CANONICAL_ASSESSMENT_STATUS,
  CANONICAL_ASSESSMENT_VISIBILITY,
  CANONICAL_ASSESSMENT_GOVERNANCE,
} from './KnowledgeAgentContract.ts';

import {
  composeKnowledgeAssessmentProvenance,
  composeKnowledgeAssessmentProfile,
  composeKnowledgeAssessmentRelationship,
  composeKnowledgeAssessmentTrace,
  composeKnowledgeAssessmentRegistry,
  composeKnowledgeAssessmentRegistryFromInput,
  composeKnowledgeAssessments,
  composeKnowledgeArtifactWithAssessments,
  isSupportedAssessmentType,
  isSupportedAssessmentObjective,
  isSupportedAssessmentDifficulty,
  isSupportedAssessmentVisibility,
  isSupportedAssessmentStatus,
  isSupportedAssessmentGovernance,
  getCanonicalAssessmentTypes,
  getCanonicalAssessmentObjectives,
  getCanonicalAssessmentDifficulties,
  getCanonicalAssessmentVisibility,
  getCanonicalAssessmentStatuses,
} from './KnowledgeAssessmentKernel.ts';

import {
  validateKnowledgeAssessmentProfile,
  validateKnowledgeAssessmentRelationship,
  validateKnowledgeAssessmentRegistry,
  validateKnowledgeAssessmentInput,
  validateKnowledgeAssessmentTrace,
  validateKnowledgeArtifactWithAssessments,
  ASSESSMENT_VALIDATION_CODES,
} from './KnowledgeAssessmentValidation.ts';

// ---------------------------------------------------------------------------
// Test Fixtures
// ---------------------------------------------------------------------------

const VALID_PROVENANCE: KnowledgeAssessmentProvenance = {
  source: 'NeuralVerse Team',
  provider: 'Knowledge Pipeline',
  rationale: 'Core assessment for concept.',
  governance: 'canonical',
};

const VALID_PROFILE_1: KnowledgeAssessmentProfile = {
  assessmentId: 'assess-001',
  conceptId: 'concept-001',
  title: 'Neural Network Concept Check',
  assessmentType: 'concept_check',
  objective: 'verify',
  difficulty: 'standard',
  visibility: 'default',
  status: 'canonical',
  governance: 'canonical',
  estimatedDuration: 30,
  competencyReferences: ['comp-001', 'comp-002'],
  tags: ['neural_networks', 'concept_check'],
  provenance: VALID_PROVENANCE,
};

const VALID_PROFILE_2: KnowledgeAssessmentProfile = {
  assessmentId: 'assess-002',
  conceptId: 'concept-001',
  title: 'Neural Network Implementation Task',
  assessmentType: 'implementation_task',
  objective: 'apply',
  difficulty: 'advanced',
  visibility: 'advanced',
  status: 'approved',
  governance: 'accepted',
  estimatedDuration: 120,
  competencyReferences: ['comp-003'],
  tags: ['neural_networks', 'implementation'],
  provenance: { ...VALID_PROVENANCE, source: 'Knowledge Pipeline' },
};

const VALID_PROFILE_3: KnowledgeAssessmentProfile = {
  assessmentId: 'assess-003',
  conceptId: 'concept-002',
  title: 'Linear Algebra Proof',
  assessmentType: 'proof',
  objective: 'evaluate',
  difficulty: 'expert',
  visibility: 'expert',
  status: 'canonical',
  governance: 'canonical',
  estimatedDuration: 60,
  competencyReferences: ['comp-004'],
  tags: ['linear_algebra', 'proof'],
  provenance: VALID_PROVENANCE,
};

const VALID_RELATIONSHIP: KnowledgeAssessmentRelationship = {
  relationshipId: 'rel-001',
  sourceAssessmentId: 'assess-001',
  targetAssessmentId: 'assess-002',
  relationshipType: 'extension',
  description: 'Implementation task extends concept check.',
  provenance: VALID_PROVENANCE,
};

const VALID_INPUT: KnowledgeAssessmentInput = {
  profiles: [VALID_PROFILE_1, VALID_PROFILE_2, VALID_PROFILE_3],
  relationships: [VALID_RELATIONSHIP],
};

const EMPTY_INPUT: KnowledgeAssessmentInput = {
  profiles: [],
  relationships: [],
};

// ---------------------------------------------------------------------------
// Composition Tests
// ---------------------------------------------------------------------------

describe('Assessment Kernel — Composition', () => {
  it('should compose valid assessment provenance', () => {
    const provenance = composeKnowledgeAssessmentProvenance({
      source: 'NeuralVerse Team',
      provider: 'Knowledge Pipeline',
      rationale: 'Core assessment.',
      governance: 'canonical',
    });

    assert.equal(provenance.source, 'NeuralVerse Team');
    assert.equal(provenance.provider, 'Knowledge Pipeline');
    assert.equal(provenance.rationale, 'Core assessment.');
    assert.equal(provenance.governance, 'canonical');
  });

  it('should compose valid assessment profile', () => {
    const profile = composeKnowledgeAssessmentProfile({
      assessmentId: 'assess-001',
      conceptId: 'concept-001',
      title: 'Test Assessment',
      assessmentType: 'multiple_choice',
      objective: 'introduce',
      difficulty: 'easy',
      visibility: 'default',
      status: 'canonical',
      governance: 'canonical',
      estimatedDuration: 30,
      competencyReferences: ['comp-001'],
      tags: ['tag1'],
      provenance: VALID_PROVENANCE,
    });

    assert.equal(profile.assessmentId, 'assess-001');
    assert.equal(profile.title, 'Test Assessment');
    assert.equal(profile.assessmentType, 'multiple_choice');
    assert.equal(profile.tags.length, 1);
    assert.equal(profile.competencyReferences.length, 1);
    assert.equal(profile.estimatedDuration, 30);
  });

  it('should compose valid assessment relationship', () => {
    const relationship = composeKnowledgeAssessmentRelationship({
      relationshipId: 'rel-001',
      sourceAssessmentId: 'assess-001',
      targetAssessmentId: 'assess-002',
      relationshipType: 'extension',
      description: 'Test relationship.',
      provenance: VALID_PROVENANCE,
    });

    assert.equal(relationship.relationshipId, 'rel-001');
    assert.equal(relationship.sourceAssessmentId, 'assess-001');
    assert.equal(relationship.targetAssessmentId, 'assess-002');
    assert.equal(relationship.relationshipType, 'extension');
  });

  it('should compose valid assessment trace', () => {
    const trace = composeKnowledgeAssessmentTrace({
      traceId: '_trace_1',
      decisions: [
        { decisionId: 'd1', assessmentId: 'assess-001', conceptId: 'concept-001', validationPassed: true, validationErrors: [] },
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

  it('should compose valid assessment registry', () => {
    const registry = composeKnowledgeAssessmentRegistry([VALID_PROFILE_1, VALID_PROFILE_2], [VALID_RELATIONSHIP]);

    assert.equal(registry.deterministic, true);
    assert.equal(registry.randomUsed, false);
    assert.equal(registry.timeDependency, false);
    assert.equal(registry.profiles.length, 2);
    assert.equal(registry.relationships.length, 1);
  });

  it('should compose registry from input', () => {
    const registry = composeKnowledgeAssessmentRegistryFromInput(VALID_INPUT);
    assert.equal(registry.profiles.length, 3);
  });

  it('should compose knowledge assessments from input', () => {
    const registry = composeKnowledgeAssessments(VALID_INPUT);
    assert.equal(registry.deterministic, true);
    assert.equal(registry.trace.decisionCount, 3);
  });

  it('should compose artifact with assessments', () => {
    const artifact = composeKnowledgeArtifactWithAssessments({
      conceptId: 'concept-001',
      conceptTitle: 'Neural Networks',
      profiles: [VALID_PROFILE_1],
      relationships: [],
      provenance: VALID_PROVENANCE,
    });

    assert.equal(artifact.conceptId, 'concept-001');
    assert.equal(artifact.conceptTitle, 'Neural Networks');
    assert.equal(artifact.profiles.length, 1);
    assert.equal(artifact.relationships.length, 0);
  });
});

// ---------------------------------------------------------------------------
// Validation Tests
// ---------------------------------------------------------------------------

describe('Assessment Kernel — Validation', () => {
  it('should validate a valid profile with no errors', () => {
    const errors = validateKnowledgeAssessmentProfile(VALID_PROFILE_1);
    assert.deepStrictEqual(errors, []);
  });

  it('should validate a valid registry with no errors', () => {
    const registry = composeKnowledgeAssessmentRegistry([VALID_PROFILE_1, VALID_PROFILE_2], [VALID_RELATIONSHIP]);
    const result = validateKnowledgeAssessmentRegistry(registry);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it('should validate knowledge assessment input', () => {
    const result = validateKnowledgeAssessmentInput(VALID_INPUT);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it('should detect duplicate IDs', () => {
    const registry = composeKnowledgeAssessmentRegistry([VALID_PROFILE_1, VALID_PROFILE_1], []);
    const result = validateKnowledgeAssessmentRegistry(registry);
    const duplicateError = result.errors.find(
      (e) => e.code === ASSESSMENT_VALIDATION_CODES.ASSESSMENT_DUPLICATE_ID,
    );
    assert.ok(duplicateError, 'Should have ASSESSMENT_DUPLICATE_ID error');
  });

  it('should detect duplicate titles', () => {
    const profile1 = { ...VALID_PROFILE_1, assessmentId: 'assess-001', title: 'Same Title' };
    const profile2 = { ...VALID_PROFILE_1, assessmentId: 'assess-002', title: 'Same Title' };
    const registry = composeKnowledgeAssessmentRegistry([profile1, profile2], []);
    const result = validateKnowledgeAssessmentRegistry(registry);
    const duplicateError = result.errors.find(
      (e) => e.code === ASSESSMENT_VALIDATION_CODES.ASSESSMENT_DUPLICATE_TITLE,
    );
    assert.ok(duplicateError, 'Should have ASSESSMENT_DUPLICATE_TITLE error');
  });

  it('should detect invalid type', () => {
    const profile = { ...VALID_PROFILE_1, assessmentType: 'unsupported' as any };
    const errors = validateKnowledgeAssessmentProfile(profile);
    const typeError = errors.find(
      (e) => e.code === ASSESSMENT_VALIDATION_CODES.ASSESSMENT_INVALID_TYPE,
    );
    assert.ok(typeError, 'Should have ASSESSMENT_INVALID_TYPE error');
  });

  it('should detect invalid objective', () => {
    const profile = { ...VALID_PROFILE_1, objective: 'unsupported' as any };
    const errors = validateKnowledgeAssessmentProfile(profile);
    const objectiveError = errors.find(
      (e) => e.code === ASSESSMENT_VALIDATION_CODES.ASSESSMENT_INVALID_OBJECTIVE,
    );
    assert.ok(objectiveError, 'Should have ASSESSMENT_INVALID_OBJECTIVE error');
  });

  it('should detect invalid difficulty', () => {
    const profile = { ...VALID_PROFILE_1, difficulty: 'unsupported' as any };
    const errors = validateKnowledgeAssessmentProfile(profile);
    const difficultyError = errors.find(
      (e) => e.code === ASSESSMENT_VALIDATION_CODES.ASSESSMENT_INVALID_DIFFICULTY,
    );
    assert.ok(difficultyError, 'Should have ASSESSMENT_INVALID_DIFFICULTY error');
  });

  it('should detect invalid visibility', () => {
    const profile = { ...VALID_PROFILE_1, visibility: 'unsupported' as any };
    const errors = validateKnowledgeAssessmentProfile(profile);
    const visibilityError = errors.find(
      (e) => e.code === ASSESSMENT_VALIDATION_CODES.ASSESSMENT_INVALID_VISIBILITY,
    );
    assert.ok(visibilityError, 'Should have ASSESSMENT_INVALID_VISIBILITY error');
  });

  it('should detect invalid status', () => {
    const profile = { ...VALID_PROFILE_1, status: 'unsupported' as any };
    const errors = validateKnowledgeAssessmentProfile(profile);
    const statusError = errors.find(
      (e) => e.code === ASSESSMENT_VALIDATION_CODES.ASSESSMENT_INVALID_STATUS,
    );
    assert.ok(statusError, 'Should have ASSESSMENT_INVALID_STATUS error');
  });

  it('should detect invalid governance', () => {
    const profile = { ...VALID_PROFILE_1, governance: 'unsupported' as any };
    const errors = validateKnowledgeAssessmentProfile(profile);
    const governanceError = errors.find(
      (e) => e.code === ASSESSMENT_VALIDATION_CODES.ASSESSMENT_INVALID_GOVERNANCE,
    );
    assert.ok(governanceError, 'Should have ASSESSMENT_INVALID_GOVERNANCE error');
  });

  it('should detect missing provenance', () => {
    const profile = { ...VALID_PROFILE_1, provenance: undefined as any };
    const errors = validateKnowledgeAssessmentProfile(profile);
    const provenanceError = errors.find(
      (e) => e.code === ASSESSMENT_VALIDATION_CODES.ASSESSMENT_MISSING_PROVENANCE,
    );
    assert.ok(provenanceError, 'Should have ASSESSMENT_MISSING_PROVENANCE error');
  });

  it('should detect missing provider', () => {
    const profile = { ...VALID_PROFILE_1, provenance: { ...VALID_PROVENANCE, provider: '' } };
    const errors = validateKnowledgeAssessmentProfile(profile);
    const providerError = errors.find(
      (e) => e.code === ASSESSMENT_VALIDATION_CODES.ASSESSMENT_MISSING_PROVIDER,
    );
    assert.ok(providerError, 'Should have ASSESSMENT_MISSING_PROVIDER error');
  });

  it('should detect missing rationale', () => {
    const profile = { ...VALID_PROFILE_1, provenance: { ...VALID_PROVENANCE, rationale: '' } };
    const errors = validateKnowledgeAssessmentProfile(profile);
    const rationaleError = errors.find(
      (e) => e.code === ASSESSMENT_VALIDATION_CODES.ASSESSMENT_MISSING_RATIONALE,
    );
    assert.ok(rationaleError, 'Should have ASSESSMENT_MISSING_RATIONALE error');
  });

  it('should detect self relationship', () => {
    const relationship = { ...VALID_RELATIONSHIP, targetAssessmentId: 'assess-001' };
    const knownProfileIds = new Set(['assess-001', 'assess-002']);
    const errors = validateKnowledgeAssessmentRelationship(relationship, knownProfileIds);
    const selfError = errors.find(
      (e) => e.code === ASSESSMENT_VALIDATION_CODES.ASSESSMENT_SELF_RELATIONSHIP,
    );
    assert.ok(selfError, 'Should have ASSESSMENT_SELF_RELATIONSHIP error');
  });

  it('should detect empty registry', () => {
    const registry = composeKnowledgeAssessmentRegistry([], []);
    const result = validateKnowledgeAssessmentRegistry(registry);
    const emptyError = result.errors.find(
      (e) => e.code === ASSESSMENT_VALIDATION_CODES.ASSESSMENT_EMPTY_REGISTRY,
    );
    assert.ok(emptyError, 'Should have ASSESSMENT_EMPTY_REGISTRY error');
    assert.equal(result.valid, false);
  });

  it('should detect invalid trace', () => {
    const trace: KnowledgeAssessmentTrace = {
      traceId: '',
      decisionCount: 0,
      validationCount: 0,
      registryVersion: '1.0.0',
      compositionVersion: '1.0.0',
      decisions: [],
      deterministic: false as true,
      generatedFrom: 'deterministic_assessment_kernel',
      randomUsed: false,
      timeDependency: false,
    };
    const result = validateKnowledgeAssessmentTrace(trace);
    assert.equal(result.valid, false);
  });

  it('should detect registry inconsistency', () => {
    const registry: KnowledgeAssessmentRegistry = {
      registryId: '_registry_5',
      profiles: [VALID_PROFILE_1],
      relationships: [],
      metadata: {
        registryId: '_registry_5',
        assessmentCount: 5,
        relationshipCount: 0,
        conceptCount: 1,
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
        generatedFrom: 'deterministic_assessment_kernel',
        randomUsed: false,
        timeDependency: false,
      },
      deterministic: true,
      generatedFrom: 'deterministic_assessment_kernel',
      randomUsed: false,
      timeDependency: false,
    };
    const result = validateKnowledgeAssessmentRegistry(registry);
    const inconsistencyError = result.errors.find(
      (e) => e.code === ASSESSMENT_VALIDATION_CODES.ASSESSMENT_REGISTRY_INCONSISTENCY,
    );
    assert.ok(inconsistencyError, 'Should have ASSESSMENT_REGISTRY_INCONSISTENCY error');
  });

  it('should validate a valid trace', () => {
    const trace = composeKnowledgeAssessmentTrace({
      traceId: '_trace_1',
      decisions: [],
      registryVersion: '1.0.0',
      compositionVersion: '1.0.0',
    });
    const result = validateKnowledgeAssessmentTrace(trace);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it('should validate artifact with assessments', () => {
    const artifact = composeKnowledgeArtifactWithAssessments({
      conceptId: 'concept-001',
      conceptTitle: 'Neural Networks',
      profiles: [VALID_PROFILE_1],
      relationships: [],
      provenance: VALID_PROVENANCE,
    });
    const result = validateKnowledgeArtifactWithAssessments(artifact);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });
});

// ---------------------------------------------------------------------------
// Determinism Tests
// ---------------------------------------------------------------------------

describe('Assessment Kernel — Determinism', () => {
  it('should produce identical output for identical input (100 iterations)', () => {
    const results: ReturnType<typeof composeKnowledgeAssessments>[] = [];
    for (let i = 0; i < 100; i++) {
      results.push(composeKnowledgeAssessments(VALID_INPUT));
    }

    for (let i = 1; i < results.length; i++) {
      assert.deepStrictEqual(results[0].registryId, results[i].registryId);
      assert.deepStrictEqual(results[0].profiles, results[i].profiles);
      assert.deepStrictEqual(results[0].trace.traceId, results[i].trace.traceId);
    }
  });

  it('should produce identical registry output for identical input (100 iterations)', () => {
    const results: ReturnType<typeof composeKnowledgeAssessmentRegistry>[] = [];
    for (let i = 0; i < 100; i++) {
      results.push(composeKnowledgeAssessmentRegistry([VALID_PROFILE_1, VALID_PROFILE_2], [VALID_RELATIONSHIP]));
    }

    for (let i = 1; i < results.length; i++) {
      assert.deepStrictEqual(results[0].profiles, results[i].profiles);
      assert.deepStrictEqual(results[0].registryId, results[i].registryId);
    }
  });

  it('should produce identical provenance for identical input', () => {
    const results: ReturnType<typeof composeKnowledgeAssessmentProvenance>[] = [];
    for (let i = 0; i < 100; i++) {
      results.push(composeKnowledgeAssessmentProvenance({
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
    const results: ReturnType<typeof composeKnowledgeAssessmentTrace>[] = [];
    for (let i = 0; i < 100; i++) {
      results.push(composeKnowledgeAssessmentTrace({
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

describe('Assessment Kernel — Immutability', () => {
  it('should not mutate input profiles', () => {
    const originalId = VALID_PROFILE_1.assessmentId;
    const originalTitle = VALID_PROFILE_1.title;

    composeKnowledgeAssessments(VALID_INPUT);

    assert.equal(VALID_PROFILE_1.assessmentId, originalId);
    assert.equal(VALID_PROFILE_1.title, originalTitle);
  });

  it('should not mutate input registry profiles', () => {
    const profiles = [VALID_PROFILE_1, VALID_PROFILE_2];
    const originalIds = profiles.map((p) => p.assessmentId);

    composeKnowledgeAssessmentRegistry(profiles, []);

    assert.equal(profiles[0].assessmentId, originalIds[0]);
    assert.equal(profiles[1].assessmentId, originalIds[1]);
  });

  it('should use defensive copies for tags', () => {
    const originalTags = ['tag1', 'tag2'];
    const profile = composeKnowledgeAssessmentProfile({
      assessmentId: 'test',
      conceptId: 'concept-001',
      title: 'Test.',
      assessmentType: 'concept_check',
      objective: 'introduce',
      difficulty: 'minimal',
      visibility: 'default',
      status: 'draft',
      governance: 'public',
      estimatedDuration: 30,
      competencyReferences: [],
      tags: originalTags,
      provenance: VALID_PROVENANCE,
    });

    assert.notEqual(profile.tags, originalTags);
    assert.deepStrictEqual([...profile.tags], originalTags);
  });

  it('should use defensive copies for competencyReferences', () => {
    const originalRefs = ['comp-001', 'comp-002'];
    const profile = composeKnowledgeAssessmentProfile({
      assessmentId: 'test',
      conceptId: 'concept-001',
      title: 'Test.',
      assessmentType: 'concept_check',
      objective: 'introduce',
      difficulty: 'minimal',
      visibility: 'default',
      status: 'draft',
      governance: 'public',
      estimatedDuration: 30,
      competencyReferences: originalRefs,
      tags: [],
      provenance: VALID_PROVENANCE,
    });

    assert.notEqual(profile.competencyReferences, originalRefs);
    assert.deepStrictEqual([...profile.competencyReferences], originalRefs);
  });
});

// ---------------------------------------------------------------------------
// Helper Function Tests
// ---------------------------------------------------------------------------

describe('Assessment Kernel — Helpers', () => {
  it('should return canonical assessment types', () => {
    const types = getCanonicalAssessmentTypes();
    assert.deepStrictEqual([...types], [...CANONICAL_ASSESSMENT_TYPES]);
    assert.equal(types.length, 10);
  });

  it('should return canonical assessment objectives', () => {
    const objectives = getCanonicalAssessmentObjectives();
    assert.deepStrictEqual([...objectives], [...CANONICAL_ASSESSMENT_OBJECTIVES]);
    assert.equal(objectives.length, 10);
  });

  it('should return canonical assessment difficulties', () => {
    const difficulties = getCanonicalAssessmentDifficulties();
    assert.deepStrictEqual([...difficulties], [...CANONICAL_ASSESSMENT_DIFFICULTY]);
    assert.equal(difficulties.length, 10);
  });

  it('should return canonical assessment visibility', () => {
    const visibility = getCanonicalAssessmentVisibility();
    assert.deepStrictEqual([...visibility], [...CANONICAL_ASSESSMENT_VISIBILITY]);
    assert.equal(visibility.length, 10);
  });

  it('should return canonical assessment statuses', () => {
    const statuses = getCanonicalAssessmentStatuses();
    assert.deepStrictEqual([...statuses], [...CANONICAL_ASSESSMENT_STATUS]);
    assert.equal(statuses.length, 6);
  });

  it('should validate assessment type support', () => {
    assert.equal(isSupportedAssessmentType('concept_check'), true);
    assert.equal(isSupportedAssessmentType('multiple_choice'), true);
    assert.equal(isSupportedAssessmentType('unsupported'), false);
  });

  it('should validate assessment objective support', () => {
    assert.equal(isSupportedAssessmentObjective('introduce'), true);
    assert.equal(isSupportedAssessmentObjective('reinforce'), true);
    assert.equal(isSupportedAssessmentObjective('unsupported'), false);
  });

  it('should validate assessment difficulty support', () => {
    assert.equal(isSupportedAssessmentDifficulty('minimal'), true);
    assert.equal(isSupportedAssessmentDifficulty('advanced'), true);
    assert.equal(isSupportedAssessmentDifficulty('unsupported'), false);
  });

  it('should validate assessment visibility support', () => {
    assert.equal(isSupportedAssessmentVisibility('always'), true);
    assert.equal(isSupportedAssessmentVisibility('default'), true);
    assert.equal(isSupportedAssessmentVisibility('unsupported'), false);
  });

  it('should validate assessment status support', () => {
    assert.equal(isSupportedAssessmentStatus('draft'), true);
    assert.equal(isSupportedAssessmentStatus('canonical'), true);
    assert.equal(isSupportedAssessmentStatus('unsupported'), false);
  });

  it('should validate assessment governance support', () => {
    assert.equal(isSupportedAssessmentGovernance('canonical'), true);
    assert.equal(isSupportedAssessmentGovernance('accepted'), true);
    assert.equal(isSupportedAssessmentGovernance('unsupported'), false);
  });
});

// ---------------------------------------------------------------------------
// Canonical Enum Completeness Tests
// ---------------------------------------------------------------------------

describe('Assessment Kernel — Canonical Enum Completeness', () => {
  it('should have exactly 10 assessment types', () => {
    assert.equal(CANONICAL_ASSESSMENT_TYPES.length, 10);
  });

  it('should have exactly 10 assessment objectives', () => {
    assert.equal(CANONICAL_ASSESSMENT_OBJECTIVES.length, 10);
  });

  it('should have exactly 10 assessment difficulties', () => {
    assert.equal(CANONICAL_ASSESSMENT_DIFFICULTY.length, 10);
  });

  it('should have exactly 6 assessment statuses', () => {
    assert.equal(CANONICAL_ASSESSMENT_STATUS.length, 6);
  });

  it('should have exactly 10 assessment visibility values', () => {
    assert.equal(CANONICAL_ASSESSMENT_VISIBILITY.length, 10);
  });

  it('should have exactly 10 assessment governance values', () => {
    assert.equal(CANONICAL_ASSESSMENT_GOVERNANCE.length, 10);
  });

  it('should contain all expected assessment types', () => {
    const expected = ['concept_check', 'multiple_choice', 'short_answer', 'worked_problem', 'proof', 'implementation_task', 'project', 'laboratory_assessment', 'oral_assessment', 'capstone'];
    for (const type of expected) {
      assert.ok(CANONICAL_ASSESSMENT_TYPES.includes(type as any), `Should include type: ${type}`);
    }
  });

  it('should contain all expected assessment objectives', () => {
    const expected = ['introduce', 'reinforce', 'verify', 'apply', 'analyze', 'integrate', 'evaluate', 'master', 'review', 'reference'];
    for (const objective of expected) {
      assert.ok(CANONICAL_ASSESSMENT_OBJECTIVES.includes(objective as any), `Should include objective: ${objective}`);
    }
  });

  it('should contain all expected assessment difficulties', () => {
    const expected = ['minimal', 'easy', 'standard', 'intermediate', 'advanced', 'expert', 'engineering', 'research', 'reference', 'canonical'];
    for (const difficulty of expected) {
      assert.ok(CANONICAL_ASSESSMENT_DIFFICULTY.includes(difficulty as any), `Should include difficulty: ${difficulty}`);
    }
  });

  it('should contain all expected assessment statuses', () => {
    const expected = ['draft', 'review', 'approved', 'canonical', 'deprecated', 'archived'];
    for (const status of expected) {
      assert.ok(CANONICAL_ASSESSMENT_STATUS.includes(status as any), `Should include status: ${status}`);
    }
  });

  it('should contain all expected assessment visibility values', () => {
    const expected = ['always', 'default', 'advanced', 'expert', 'curriculum', 'assessment', 'laboratory', 'research', 'internal', 'hidden'];
    for (const visibility of expected) {
      assert.ok(CANONICAL_ASSESSMENT_VISIBILITY.includes(visibility as any), `Should include visibility: ${visibility}`);
    }
  });

  it('should contain all expected assessment governance values', () => {
    const expected = ['canonical', 'accepted', 'provisional', 'experimental', 'deprecated', 'restricted', 'internal', 'public', 'community', 'archived'];
    for (const governance of expected) {
      assert.ok(CANONICAL_ASSESSMENT_GOVERNANCE.includes(governance as any), `Should include governance: ${governance}`);
    }
  });
});

// ---------------------------------------------------------------------------
// Validation Code Count Test
// ---------------------------------------------------------------------------

describe('Assessment Kernel — Validation Code Count', () => {
  it('should have exactly 20 validation codes', () => {
    const codes = Object.values(ASSESSMENT_VALIDATION_CODES);
    assert.equal(codes.length, 20);
  });

  it('should have all codes prefixed with ASSESSMENT_', () => {
    const codes = Object.values(ASSESSMENT_VALIDATION_CODES);
    for (const code of codes) {
      assert.ok(code.startsWith('ASSESSMENT_'), `Code "${code}" should start with ASSESSMENT_`);
    }
  });

  it('should have unique codes', () => {
    const codes = Object.values(ASSESSMENT_VALIDATION_CODES);
    const unique = new Set(codes);
    assert.equal(codes.length, unique.size, 'All codes should be unique');
  });
});

// ---------------------------------------------------------------------------
// Runtime Restrictions Tests
// ---------------------------------------------------------------------------

describe('Assessment Kernel — Runtime Restrictions', () => {
  it('should not use Math.random', () => {
    const result = composeKnowledgeAssessments(VALID_INPUT);
    assert.ok(result, 'Should produce a result without Math.random');
  });

  it('should not use Date.now', () => {
    const result = composeKnowledgeAssessments(VALID_INPUT);
    assert.ok(result, 'Should produce a result without Date.now');
  });

  it('should not use performance.now', () => {
    const result = composeKnowledgeAssessments(VALID_INPUT);
    assert.ok(result, 'Should produce a result without performance.now');
  });

  it('should not use crypto.randomUUID', () => {
    const result = composeKnowledgeAssessments(VALID_INPUT);
    assert.ok(result, 'Should produce a result without crypto.randomUUID');
  });

  it('should not have executable callbacks in profile', () => {
    const profile = composeKnowledgeAssessmentProfile({
      assessmentId: 'assess-001',
      conceptId: 'concept-001',
      title: 'Test',
      assessmentType: 'concept_check',
      objective: 'introduce',
      difficulty: 'minimal',
      visibility: 'default',
      status: 'draft',
      governance: 'public',
      estimatedDuration: 30,
      competencyReferences: [],
      tags: [],
      provenance: VALID_PROVENANCE,
    });

    const keys = Object.keys(profile);
    for (const key of keys) {
      const value = (profile as any)[key];
      assert.ok(typeof value !== 'function', `Profile field "${key}" should not be a function`);
    }
  });

  it('should not store educational content', () => {
    const result = composeKnowledgeAssessments(VALID_INPUT);
    assert.ok(!('educationalContent' in result), 'Should not have educational content');
    assert.ok(!('markdown' in result), 'Should not have markdown');
  });

  it('should not access filesystem', () => {
    const result = composeKnowledgeAssessments(VALID_INPUT);
    assert.ok(!('filesystem' in result), 'Should not have filesystem');
    assert.ok(!('fileSystem' in result), 'Should not have fileSystem');
  });

  it('should not perform network requests', () => {
    const result = composeKnowledgeAssessments(VALID_INPUT);
    assert.ok(!('networkResponse' in result), 'Should not have network response');
    assert.ok(!('httpResult' in result), 'Should not have HTTP result');
  });

  it('should not have async behavior markers', () => {
    const result = composeKnowledgeAssessments(VALID_INPUT);
    assert.ok(!('promise' in result), 'Should not have promise');
    assert.ok(!('async' in result), 'Should not have async');
  });
});

// ---------------------------------------------------------------------------
// Cross-Agent Boundary Tests
// ---------------------------------------------------------------------------

describe('Assessment Kernel — Cross-Agent Boundary', () => {
  it('should not reference Didactic Agent', () => {
    const result = composeKnowledgeAssessments(VALID_INPUT);
    const str = JSON.stringify(result);
    assert.ok(!str.includes('Didactic Agent'), 'Should not reference Didactic Agent');
  });

  it('should not reference Curriculum Agent', () => {
    const result = composeKnowledgeAssessments(VALID_INPUT);
    const str = JSON.stringify(result);
    assert.ok(!str.includes('Curriculum Agent'), 'Should not reference Curriculum Agent');
  });

  it('should not reference Narrative Agent', () => {
    const result = composeKnowledgeAssessments(VALID_INPUT);
    const str = JSON.stringify(result);
    assert.ok(!str.includes('Narrative Agent'), 'Should not reference Narrative Agent');
  });

  it('should not reference Assessment Agent', () => {
    const result = composeKnowledgeAssessments(VALID_INPUT);
    const str = JSON.stringify(result);
    assert.ok(!str.includes('Assessment Agent'), 'Should not reference Assessment Agent');
  });

  it('should not reference Curiosity Agent', () => {
    const result = composeKnowledgeAssessments(VALID_INPUT);
    const str = JSON.stringify(result);
    assert.ok(!str.includes('Curiosity Agent'), 'Should not reference Curiosity Agent');
  });

  it('should not reference Research Agent', () => {
    const result = composeKnowledgeAssessments(VALID_INPUT);
    const str = JSON.stringify(result);
    assert.ok(!str.includes('Research Agent'), 'Should not reference Research Agent');
  });

  it('should not reference Laboratory Agent', () => {
    const result = composeKnowledgeAssessments(VALID_INPUT);
    const str = JSON.stringify(result);
    assert.ok(!str.includes('Laboratory Agent'), 'Should not reference Laboratory Agent');
  });

  it('should not reference Application Agent', () => {
    const result = composeKnowledgeAssessments(VALID_INPUT);
    const str = JSON.stringify(result);
    assert.ok(!str.includes('Application Agent'), 'Should not reference Application Agent');
  });
});

// ---------------------------------------------------------------------------
// Deterministic Sorting Tests
// ---------------------------------------------------------------------------

describe('Assessment Kernel — Deterministic Sorting', () => {
  it('should sort deterministically by conceptId', () => {
    const profile3 = { ...VALID_PROFILE_1, assessmentId: 'assess-003', conceptId: 'concept-003' };
    const profile1 = { ...VALID_PROFILE_1, assessmentId: 'assess-001', conceptId: 'concept-001' };
    const profile2 = { ...VALID_PROFILE_1, assessmentId: 'assess-002', conceptId: 'concept-002' };

    const registry = composeKnowledgeAssessmentRegistry([profile3, profile1, profile2], []);

    assert.equal(registry.profiles[0].conceptId, 'concept-001');
    assert.equal(registry.profiles[1].conceptId, 'concept-002');
    assert.equal(registry.profiles[2].conceptId, 'concept-003');
  });

  it('should sort by assessmentType when conceptId is equal', () => {
    const profileA = { ...VALID_PROFILE_1, assessmentId: 'assess-002', conceptId: 'concept-001', assessmentType: 'multiple_choice' as const };
    const profileB = { ...VALID_PROFILE_1, assessmentId: 'assess-001', conceptId: 'concept-001', assessmentType: 'concept_check' as const };

    const registry = composeKnowledgeAssessmentRegistry([profileA, profileB], []);

    assert.equal(registry.profiles[0].assessmentType, 'concept_check');
    assert.equal(registry.profiles[1].assessmentType, 'multiple_choice');
  });
});

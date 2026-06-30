/**
 * D10-OPT-05 — Progressive Examples, Canonical Example Modeling Kernel Test Suite
 *
 * Comprehensive deterministic test suite for the Example Kernel.
 * Covers: composition, validation, helpers, determinism, immutability,
 * runtime restrictions, cross-agent boundary, and public API.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import type {
  KnowledgeExampleProfile,
  KnowledgeExampleProvenance,
  KnowledgeExampleRelationship,
  KnowledgeExampleInput,
  KnowledgeExampleRegistry,
  KnowledgeExampleTrace,
  KnowledgeArtifactWithExamples,
} from './KnowledgeAgentContract.ts';

import {
  CANONICAL_EXAMPLE_TYPES,
  CANONICAL_EXAMPLE_LEVELS,
  CANONICAL_PROGRESSIVE_STAGES,
  CANONICAL_EXAMPLE_STATUS,
  CANONICAL_EXAMPLE_VISIBILITY,
  CANONICAL_EXAMPLE_GOVERNANCE,
} from './KnowledgeAgentContract.ts';

import {
  composeKnowledgeExampleProvenance,
  composeKnowledgeExampleProfile,
  composeKnowledgeExampleRelationship,
  composeKnowledgeExampleTrace,
  composeKnowledgeExampleRegistry,
  composeKnowledgeExampleRegistryFromInput,
  composeKnowledgeExamples,
  composeKnowledgeArtifactWithExamples,
  isSupportedExampleType,
  isSupportedExampleLevel,
  isSupportedProgressiveStage,
  isSupportedExampleVisibility,
  isSupportedExampleStatus,
  isSupportedExampleGovernance,
  getCanonicalExampleTypes,
  getCanonicalExampleLevels,
  getCanonicalProgressiveStages,
  getCanonicalExampleVisibility,
  getCanonicalExampleStatuses,
} from './KnowledgeExampleKernel.ts';

import {
  validateKnowledgeExampleProfile,
  validateKnowledgeExampleRelationship,
  validateKnowledgeExampleRegistry,
  validateKnowledgeExampleInput,
  validateKnowledgeExampleTrace,
  validateKnowledgeArtifactWithExamples,
  EXAMPLE_VALIDATION_CODES,
} from './KnowledgeExampleValidation.ts';

// ---------------------------------------------------------------------------
// Test Fixtures
// ---------------------------------------------------------------------------

const VALID_PROVENANCE: KnowledgeExampleProvenance = {
  source: 'NeuralVerse Team',
  provider: 'Example Agent',
  rationale: 'Core example for neural network concept.',
  governance: 'canonical',
};

const VALID_PROFILE_1: KnowledgeExampleProfile = {
  exampleId: 'ex-001',
  conceptId: 'concept-001',
  title: 'Neural Networks — Definition Example',
  exampleType: 'definition_example',
  exampleLevel: 'introductory',
  progressiveStage: 'recognition',
  visibility: 'default',
  status: 'canonical',
  governance: 'canonical',
  tags: ['neural_networks', 'definition'],
  representationIds: ['rep-001'],
  orderIndex: 1,
  provenance: VALID_PROVENANCE,
};

const VALID_PROFILE_2: KnowledgeExampleProfile = {
  exampleId: 'ex-002',
  conceptId: 'concept-001',
  title: 'Neural Networks — Worked Example',
  exampleType: 'worked_example',
  exampleLevel: 'elementary',
  progressiveStage: 'understanding',
  visibility: 'default',
  status: 'approved',
  governance: 'accepted',
  tags: ['neural_networks', 'worked'],
  representationIds: ['rep-002'],
  orderIndex: 2,
  provenance: { ...VALID_PROVENANCE, source: 'Knowledge Pipeline' },
};

const VALID_PROFILE_3: KnowledgeExampleProfile = {
  exampleId: 'ex-003',
  conceptId: 'concept-002',
  title: 'Linear Algebra — Mathematical Example',
  exampleType: 'mathematical_example',
  exampleLevel: 'intermediate',
  progressiveStage: 'application',
  visibility: 'advanced',
  status: 'canonical',
  governance: 'canonical',
  tags: ['linear_algebra', 'mathematics'],
  representationIds: [],
  orderIndex: 1,
  provenance: VALID_PROVENANCE,
};

const VALID_RELATIONSHIP: KnowledgeExampleRelationship = {
  relationshipId: 'rel-001',
  sourceExampleId: 'ex-001',
  targetExampleId: 'ex-002',
  conceptId: 'concept-001',
  relationshipType: 'progression',
  description: 'Worked example progresses from definition example.',
  provenance: VALID_PROVENANCE,
};

const VALID_INPUT: KnowledgeExampleInput = {
  profiles: [VALID_PROFILE_1, VALID_PROFILE_2, VALID_PROFILE_3],
  relationships: [VALID_RELATIONSHIP],
};

const EMPTY_INPUT: KnowledgeExampleInput = {
  profiles: [],
  relationships: [],
};

// ---------------------------------------------------------------------------
// Composition Tests
// ---------------------------------------------------------------------------

describe('Example Kernel — Composition', () => {
  it('should compose valid example provenance', () => {
    const provenance = composeKnowledgeExampleProvenance({
      source: 'NeuralVerse Team',
      provider: 'Example Agent',
      rationale: 'Core example.',
      governance: 'canonical',
    });

    assert.equal(provenance.source, 'NeuralVerse Team');
    assert.equal(provenance.provider, 'Example Agent');
    assert.equal(provenance.rationale, 'Core example.');
    assert.equal(provenance.governance, 'canonical');
  });

  it('should compose valid example profile', () => {
    const profile = composeKnowledgeExampleProfile({
      exampleId: 'ex-001',
      conceptId: 'concept-001',
      title: 'Test Profile',
      exampleType: 'definition_example',
      exampleLevel: 'introductory',
      progressiveStage: 'recognition',
      visibility: 'default',
      status: 'canonical',
      governance: 'canonical',
      tags: ['tag1'],
      representationIds: ['rep-001'],
      orderIndex: 1,
      provenance: VALID_PROVENANCE,
    });

    assert.equal(profile.exampleId, 'ex-001');
    assert.equal(profile.conceptId, 'concept-001');
    assert.equal(profile.exampleType, 'definition_example');
    assert.equal(profile.tags.length, 1);
    assert.equal(profile.representationIds.length, 1);
    assert.equal(profile.orderIndex, 1);
  });

  it('should compose valid example relationship', () => {
    const relationship = composeKnowledgeExampleRelationship({
      relationshipId: 'rel-001',
      sourceExampleId: 'ex-001',
      targetExampleId: 'ex-002',
      conceptId: 'concept-001',
      relationshipType: 'progression',
      description: 'Test relationship.',
      provenance: VALID_PROVENANCE,
    });

    assert.equal(relationship.relationshipId, 'rel-001');
    assert.equal(relationship.sourceExampleId, 'ex-001');
    assert.equal(relationship.targetExampleId, 'ex-002');
    assert.equal(relationship.relationshipType, 'progression');
  });

  it('should compose valid example trace', () => {
    const trace = composeKnowledgeExampleTrace({
      traceId: '_trace_1',
      decisions: [
        { decisionId: 'd1', exampleId: 'ex-001', conceptId: 'concept-001', validationPassed: true, validationErrors: [] },
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

  it('should compose valid example registry', () => {
    const registry = composeKnowledgeExampleRegistry([VALID_PROFILE_1, VALID_PROFILE_2], [VALID_RELATIONSHIP]);

    assert.equal(registry.deterministic, true);
    assert.equal(registry.randomUsed, false);
    assert.equal(registry.timeDependency, false);
    assert.equal(registry.profiles.length, 2);
    assert.equal(registry.relationships.length, 1);
  });

  it('should compose registry from input', () => {
    const registry = composeKnowledgeExampleRegistryFromInput(VALID_INPUT);
    assert.equal(registry.profiles.length, 3);
  });

  it('should compose knowledge examples from input', () => {
    const registry = composeKnowledgeExamples(VALID_INPUT);
    assert.equal(registry.deterministic, true);
    assert.equal(registry.trace.decisionCount, 3);
  });

  it('should compose artifact with examples', () => {
    const artifact = composeKnowledgeArtifactWithExamples({
      conceptId: 'concept-001',
      conceptTitle: 'Neural Networks',
      profiles: [VALID_PROFILE_1, VALID_PROFILE_2],
      relationships: [VALID_RELATIONSHIP],
      provenance: VALID_PROVENANCE,
    });

    assert.equal(artifact.conceptId, 'concept-001');
    assert.equal(artifact.conceptTitle, 'Neural Networks');
    assert.equal(artifact.profiles.length, 2);
    assert.equal(artifact.relationships.length, 1);
  });
});

// ---------------------------------------------------------------------------
// Validation Tests
// ---------------------------------------------------------------------------

describe('Example Kernel — Validation', () => {
  it('should validate a valid profile with no errors', () => {
    const errors = validateKnowledgeExampleProfile(VALID_PROFILE_1);
    assert.deepStrictEqual(errors, []);
  });

  it('should validate a valid registry with no errors', () => {
    const registry = composeKnowledgeExampleRegistry([VALID_PROFILE_1, VALID_PROFILE_2], [VALID_RELATIONSHIP]);
    const result = validateKnowledgeExampleRegistry(registry);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it('should validate knowledge example input', () => {
    const result = validateKnowledgeExampleInput(VALID_INPUT);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it('should detect duplicate IDs', () => {
    const registry = composeKnowledgeExampleRegistry([VALID_PROFILE_1, VALID_PROFILE_1], []);
    const result = validateKnowledgeExampleRegistry(registry);
    const duplicateError = result.errors.find(
      (e) => e.code === EXAMPLE_VALIDATION_CODES.EXAMPLE_DUPLICATE_ID,
    );
    assert.ok(duplicateError, 'Should have EXAMPLE_DUPLICATE_ID error');
  });

  it('should detect duplicate titles', () => {
    const profile1 = { ...VALID_PROFILE_1, exampleId: 'ex-001', title: 'Same Title' };
    const profile2 = { ...VALID_PROFILE_1, exampleId: 'ex-002', title: 'Same Title' };
    const registry = composeKnowledgeExampleRegistry([profile1, profile2], []);
    const result = validateKnowledgeExampleRegistry(registry);
    const duplicateError = result.errors.find(
      (e) => e.code === EXAMPLE_VALIDATION_CODES.EXAMPLE_DUPLICATE_TITLE,
    );
    assert.ok(duplicateError, 'Should have EXAMPLE_DUPLICATE_TITLE error');
  });

  it('should detect invalid type', () => {
    const profile = { ...VALID_PROFILE_1, exampleType: 'unsupported' as any };
    const errors = validateKnowledgeExampleProfile(profile);
    const typeError = errors.find(
      (e) => e.code === EXAMPLE_VALIDATION_CODES.EXAMPLE_INVALID_TYPE,
    );
    assert.ok(typeError, 'Should have EXAMPLE_INVALID_TYPE error');
  });

  it('should detect invalid level', () => {
    const profile = { ...VALID_PROFILE_1, exampleLevel: 'unsupported' as any };
    const errors = validateKnowledgeExampleProfile(profile);
    const levelError = errors.find(
      (e) => e.code === EXAMPLE_VALIDATION_CODES.EXAMPLE_INVALID_LEVEL,
    );
    assert.ok(levelError, 'Should have EXAMPLE_INVALID_LEVEL error');
  });

  it('should detect invalid progressive stage', () => {
    const profile = { ...VALID_PROFILE_1, progressiveStage: 'unsupported' as any };
    const errors = validateKnowledgeExampleProfile(profile);
    const stageError = errors.find(
      (e) => e.code === EXAMPLE_VALIDATION_CODES.EXAMPLE_INVALID_STAGE,
    );
    assert.ok(stageError, 'Should have EXAMPLE_INVALID_STAGE error');
  });

  it('should detect invalid visibility', () => {
    const profile = { ...VALID_PROFILE_1, visibility: 'unsupported' as any };
    const errors = validateKnowledgeExampleProfile(profile);
    const visibilityError = errors.find(
      (e) => e.code === EXAMPLE_VALIDATION_CODES.EXAMPLE_INVALID_VISIBILITY,
    );
    assert.ok(visibilityError, 'Should have EXAMPLE_INVALID_VISIBILITY error');
  });

  it('should detect invalid status', () => {
    const profile = { ...VALID_PROFILE_1, status: 'unsupported' as any };
    const errors = validateKnowledgeExampleProfile(profile);
    const statusError = errors.find(
      (e) => e.code === EXAMPLE_VALIDATION_CODES.EXAMPLE_INVALID_STATUS,
    );
    assert.ok(statusError, 'Should have EXAMPLE_INVALID_STATUS error');
  });

  it('should detect invalid governance', () => {
    const profile = { ...VALID_PROFILE_1, governance: 'unsupported' as any };
    const errors = validateKnowledgeExampleProfile(profile);
    const governanceError = errors.find(
      (e) => e.code === EXAMPLE_VALIDATION_CODES.EXAMPLE_INVALID_GOVERNANCE,
    );
    assert.ok(governanceError, 'Should have EXAMPLE_INVALID_GOVERNANCE error');
  });

  it('should detect missing provenance', () => {
    const profile = { ...VALID_PROFILE_1, provenance: undefined as any };
    const errors = validateKnowledgeExampleProfile(profile);
    const provenanceError = errors.find(
      (e) => e.code === EXAMPLE_VALIDATION_CODES.EXAMPLE_MISSING_PROVENANCE,
    );
    assert.ok(provenanceError, 'Should have EXAMPLE_MISSING_PROVENANCE error');
  });

  it('should detect missing provider', () => {
    const profile = { ...VALID_PROFILE_1, provenance: { ...VALID_PROVENANCE, provider: '' } };
    const errors = validateKnowledgeExampleProfile(profile);
    const providerError = errors.find(
      (e) => e.code === EXAMPLE_VALIDATION_CODES.EXAMPLE_MISSING_PROVIDER,
    );
    assert.ok(providerError, 'Should have EXAMPLE_MISSING_PROVIDER error');
  });

  it('should detect missing rationale', () => {
    const profile = { ...VALID_PROFILE_1, provenance: { ...VALID_PROVENANCE, rationale: '' } };
    const errors = validateKnowledgeExampleProfile(profile);
    const rationaleError = errors.find(
      (e) => e.code === EXAMPLE_VALIDATION_CODES.EXAMPLE_MISSING_RATIONALE,
    );
    assert.ok(rationaleError, 'Should have EXAMPLE_MISSING_RATIONALE error');
  });

  it('should detect self relationship', () => {
    const relationship = { ...VALID_RELATIONSHIP, targetExampleId: 'ex-001' };
    const knownProfileIds = new Set(['ex-001', 'ex-002']);
    const errors = validateKnowledgeExampleRelationship(relationship, knownProfileIds);
    const selfError = errors.find(
      (e) => e.code === EXAMPLE_VALIDATION_CODES.EXAMPLE_SELF_RELATIONSHIP,
    );
    assert.ok(selfError, 'Should have EXAMPLE_SELF_RELATIONSHIP error');
  });

  it('should detect empty registry', () => {
    const registry = composeKnowledgeExampleRegistry([], []);
    const result = validateKnowledgeExampleRegistry(registry);
    const emptyError = result.errors.find(
      (e) => e.code === EXAMPLE_VALIDATION_CODES.EXAMPLE_EMPTY_REGISTRY,
    );
    assert.ok(emptyError, 'Should have EXAMPLE_EMPTY_REGISTRY error');
    assert.equal(result.valid, false);
  });

  it('should detect invalid trace', () => {
    const trace: KnowledgeExampleTrace = {
      traceId: '',
      decisionCount: 0,
      validationCount: 0,
      registryVersion: '1.0.0',
      compositionVersion: '1.0.0',
      decisions: [],
      deterministic: false as true,
      generatedFrom: 'deterministic_example_kernel',
      randomUsed: false,
      timeDependency: false,
    };
    const result = validateKnowledgeExampleTrace(trace);
    assert.equal(result.valid, false);
  });

  it('should detect registry inconsistency', () => {
    const registry: KnowledgeExampleRegistry = {
      registryId: '_registry_5',
      profiles: [VALID_PROFILE_1],
      relationships: [],
      metadata: {
        registryId: '_registry_5',
        exampleCount: 5,
        relationshipCount: 0,
        conceptCount: 1,
        levelCount: 1,
      },
      trace: {
        traceId: '_trace_1',
        decisionCount: 0,
        validationCount: 0,
        registryVersion: '1.0.0',
        compositionVersion: '1.0.0',
        decisions: [],
        deterministic: true,
        generatedFrom: 'deterministic_example_kernel',
        randomUsed: false,
        timeDependency: false,
      },
      deterministic: true,
      generatedFrom: 'deterministic_example_kernel',
      randomUsed: false,
      timeDependency: false,
    };
    const result = validateKnowledgeExampleRegistry(registry);
    const inconsistencyError = result.errors.find(
      (e) => e.code === EXAMPLE_VALIDATION_CODES.EXAMPLE_REGISTRY_INCONSISTENCY,
    );
    assert.ok(inconsistencyError, 'Should have EXAMPLE_REGISTRY_INCONSISTENCY error');
  });

  it('should validate a valid trace', () => {
    const trace = composeKnowledgeExampleTrace({
      traceId: '_trace_1',
      decisions: [],
      registryVersion: '1.0.0',
      compositionVersion: '1.0.0',
    });
    const result = validateKnowledgeExampleTrace(trace);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it('should validate artifact with examples', () => {
    const artifact = composeKnowledgeArtifactWithExamples({
      conceptId: 'concept-001',
      conceptTitle: 'Neural Networks',
      profiles: [VALID_PROFILE_1, VALID_PROFILE_2],
      relationships: [VALID_RELATIONSHIP],
      provenance: VALID_PROVENANCE,
    });
    const result = validateKnowledgeArtifactWithExamples(artifact);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });
});

// ---------------------------------------------------------------------------
// Determinism Tests
// ---------------------------------------------------------------------------

describe('Example Kernel — Determinism', () => {
  it('should produce identical output for identical input (100 iterations)', () => {
    const results: ReturnType<typeof composeKnowledgeExamples>[] = [];
    for (let i = 0; i < 100; i++) {
      results.push(composeKnowledgeExamples(VALID_INPUT));
    }

    for (let i = 1; i < results.length; i++) {
      assert.deepStrictEqual(results[0].registryId, results[i].registryId);
      assert.deepStrictEqual(results[0].profiles, results[i].profiles);
      assert.deepStrictEqual(results[0].trace.traceId, results[i].trace.traceId);
    }
  });

  it('should produce identical registry output for identical input (100 iterations)', () => {
    const results: ReturnType<typeof composeKnowledgeExampleRegistry>[] = [];
    for (let i = 0; i < 100; i++) {
      results.push(composeKnowledgeExampleRegistry([VALID_PROFILE_1, VALID_PROFILE_2], [VALID_RELATIONSHIP]));
    }

    for (let i = 1; i < results.length; i++) {
      assert.deepStrictEqual(results[0].profiles, results[i].profiles);
      assert.deepStrictEqual(results[0].registryId, results[i].registryId);
    }
  });

  it('should produce identical provenance for identical input', () => {
    const results: ReturnType<typeof composeKnowledgeExampleProvenance>[] = [];
    for (let i = 0; i < 100; i++) {
      results.push(composeKnowledgeExampleProvenance({
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
    const results: ReturnType<typeof composeKnowledgeExampleTrace>[] = [];
    for (let i = 0; i < 100; i++) {
      results.push(composeKnowledgeExampleTrace({
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

describe('Example Kernel — Immutability', () => {
  it('should not mutate input profiles', () => {
    const originalId = VALID_PROFILE_1.exampleId;
    const originalTitle = VALID_PROFILE_1.title;

    composeKnowledgeExamples(VALID_INPUT);

    assert.equal(VALID_PROFILE_1.exampleId, originalId);
    assert.equal(VALID_PROFILE_1.title, originalTitle);
  });

  it('should not mutate input registry profiles', () => {
    const profiles = [VALID_PROFILE_1, VALID_PROFILE_2];
    const originalIds = profiles.map((p) => p.exampleId);

    composeKnowledgeExampleRegistry(profiles, []);

    assert.equal(profiles[0].exampleId, originalIds[0]);
    assert.equal(profiles[1].exampleId, originalIds[1]);
  });

  it('should use defensive copies for tags', () => {
    const originalTags = ['tag1', 'tag2'];
    const profile = composeKnowledgeExampleProfile({
      exampleId: 'test',
      conceptId: 'concept-001',
      title: 'Test.',
      exampleType: 'definition_example',
      exampleLevel: 'introductory',
      progressiveStage: 'recognition',
      visibility: 'default',
      status: 'draft',
      governance: 'public',
      tags: originalTags,
      representationIds: [],
      orderIndex: 1,
      provenance: VALID_PROVENANCE,
    });

    assert.notEqual(profile.tags, originalTags);
    assert.deepStrictEqual([...profile.tags], originalTags);
  });

  it('should use defensive copies for representationIds', () => {
    const originalRefs = ['rep-001', 'rep-002'];
    const profile = composeKnowledgeExampleProfile({
      exampleId: 'test',
      conceptId: 'concept-001',
      title: 'Test.',
      exampleType: 'definition_example',
      exampleLevel: 'introductory',
      progressiveStage: 'recognition',
      visibility: 'default',
      status: 'draft',
      governance: 'public',
      tags: [],
      representationIds: originalRefs,
      orderIndex: 1,
      provenance: VALID_PROVENANCE,
    });

    assert.notEqual(profile.representationIds, originalRefs);
    assert.deepStrictEqual([...profile.representationIds], originalRefs);
  });
});

// ---------------------------------------------------------------------------
// Helper Function Tests
// ---------------------------------------------------------------------------

describe('Example Kernel — Helpers', () => {
  it('should return canonical example types', () => {
    const types = getCanonicalExampleTypes();
    assert.deepStrictEqual([...types], [...CANONICAL_EXAMPLE_TYPES]);
    assert.equal(types.length, 10);
  });

  it('should return canonical example levels', () => {
    const levels = getCanonicalExampleLevels();
    assert.deepStrictEqual([...levels], [...CANONICAL_EXAMPLE_LEVELS]);
    assert.equal(levels.length, 10);
  });

  it('should return canonical progressive stages', () => {
    const stages = getCanonicalProgressiveStages();
    assert.deepStrictEqual([...stages], [...CANONICAL_PROGRESSIVE_STAGES]);
    assert.equal(stages.length, 10);
  });

  it('should return canonical example visibility', () => {
    const visibility = getCanonicalExampleVisibility();
    assert.deepStrictEqual([...visibility], [...CANONICAL_EXAMPLE_VISIBILITY]);
    assert.equal(visibility.length, 10);
  });

  it('should return canonical example statuses', () => {
    const statuses = getCanonicalExampleStatuses();
    assert.deepStrictEqual([...statuses], [...CANONICAL_EXAMPLE_STATUS]);
    assert.equal(statuses.length, 6);
  });

  it('should validate example type support', () => {
    assert.equal(isSupportedExampleType('definition_example'), true);
    assert.equal(isSupportedExampleType('worked_example'), true);
    assert.equal(isSupportedExampleType('unsupported'), false);
  });

  it('should validate example level support', () => {
    assert.equal(isSupportedExampleLevel('introductory'), true);
    assert.equal(isSupportedExampleLevel('advanced'), true);
    assert.equal(isSupportedExampleLevel('unsupported'), false);
  });

  it('should validate progressive stage support', () => {
    assert.equal(isSupportedProgressiveStage('recognition'), true);
    assert.equal(isSupportedProgressiveStage('application'), true);
    assert.equal(isSupportedProgressiveStage('unsupported'), false);
  });

  it('should validate example visibility support', () => {
    assert.equal(isSupportedExampleVisibility('always'), true);
    assert.equal(isSupportedExampleVisibility('default'), true);
    assert.equal(isSupportedExampleVisibility('unsupported'), false);
  });

  it('should validate example status support', () => {
    assert.equal(isSupportedExampleStatus('draft'), true);
    assert.equal(isSupportedExampleStatus('canonical'), true);
    assert.equal(isSupportedExampleStatus('unsupported'), false);
  });

  it('should validate example governance support', () => {
    assert.equal(isSupportedExampleGovernance('canonical'), true);
    assert.equal(isSupportedExampleGovernance('accepted'), true);
    assert.equal(isSupportedExampleGovernance('unsupported'), false);
  });
});

// ---------------------------------------------------------------------------
// Canonical Enum Completeness Tests
// ---------------------------------------------------------------------------

describe('Example Kernel — Canonical Enum Completeness', () => {
  it('should have exactly 10 example types', () => {
    assert.equal(CANONICAL_EXAMPLE_TYPES.length, 10);
  });

  it('should have exactly 10 example levels', () => {
    assert.equal(CANONICAL_EXAMPLE_LEVELS.length, 10);
  });

  it('should have exactly 10 progressive stages', () => {
    assert.equal(CANONICAL_PROGRESSIVE_STAGES.length, 10);
  });

  it('should have exactly 6 example statuses', () => {
    assert.equal(CANONICAL_EXAMPLE_STATUS.length, 6);
  });

  it('should have exactly 10 example visibility values', () => {
    assert.equal(CANONICAL_EXAMPLE_VISIBILITY.length, 10);
  });

  it('should have exactly 10 example governance values', () => {
    assert.equal(CANONICAL_EXAMPLE_GOVERNANCE.length, 10);
  });

  it('should contain all expected example types', () => {
    const expected = ['definition_example', 'worked_example', 'visual_example', 'mathematical_example', 'algorithm_example', 'implementation_example', 'engineering_example', 'counterexample', 'application_example', 'historical_example'];
    for (const type of expected) {
      assert.ok(CANONICAL_EXAMPLE_TYPES.includes(type as any), `Should include type: ${type}`);
    }
  });

  it('should contain all expected example levels', () => {
    const expected = ['introductory', 'elementary', 'intermediate', 'advanced', 'expert', 'research', 'engineering', 'comparative', 'integration', 'mastery'];
    for (const level of expected) {
      assert.ok(CANONICAL_EXAMPLE_LEVELS.includes(level as any), `Should include level: ${level}`);
    }
  });

  it('should contain all expected progressive stages', () => {
    const expected = ['recognition', 'understanding', 'interpretation', 'application', 'analysis', 'integration', 'optimization', 'generalization', 'transfer', 'mastery'];
    for (const stage of expected) {
      assert.ok(CANONICAL_PROGRESSIVE_STAGES.includes(stage as any), `Should include stage: ${stage}`);
    }
  });

  it('should contain all expected example statuses', () => {
    const expected = ['draft', 'review', 'approved', 'canonical', 'deprecated', 'archived'];
    for (const status of expected) {
      assert.ok(CANONICAL_EXAMPLE_STATUS.includes(status as any), `Should include status: ${status}`);
    }
  });

  it('should contain all expected example visibility values', () => {
    const expected = ['always', 'default', 'advanced', 'expert', 'curriculum', 'assessment', 'laboratory', 'research', 'internal', 'hidden'];
    for (const visibility of expected) {
      assert.ok(CANONICAL_EXAMPLE_VISIBILITY.includes(visibility as any), `Should include visibility: ${visibility}`);
    }
  });

  it('should contain all expected example governance values', () => {
    const expected = ['canonical', 'accepted', 'provisional', 'experimental', 'deprecated', 'restricted', 'internal', 'public', 'community', 'archived'];
    for (const governance of expected) {
      assert.ok(CANONICAL_EXAMPLE_GOVERNANCE.includes(governance as any), `Should include governance: ${governance}`);
    }
  });
});

// ---------------------------------------------------------------------------
// Validation Code Count Test
// ---------------------------------------------------------------------------

describe('Example Kernel — Validation Code Count', () => {
  it('should have exactly 20 validation codes', () => {
    const codes = Object.values(EXAMPLE_VALIDATION_CODES);
    assert.equal(codes.length, 20);
  });

  it('should have all codes prefixed with EXAMPLE_', () => {
    const codes = Object.values(EXAMPLE_VALIDATION_CODES);
    for (const code of codes) {
      assert.ok(code.startsWith('EXAMPLE_'), `Code "${code}" should start with EXAMPLE_`);
    }
  });

  it('should have unique codes', () => {
    const codes = Object.values(EXAMPLE_VALIDATION_CODES);
    const unique = new Set(codes);
    assert.equal(codes.length, unique.size, 'All codes should be unique');
  });
});

// ---------------------------------------------------------------------------
// Runtime Restrictions Tests
// ---------------------------------------------------------------------------

describe('Example Kernel — Runtime Restrictions', () => {
  it('should not use Math.random', () => {
    const result = composeKnowledgeExamples(VALID_INPUT);
    assert.ok(result, 'Should produce a result without Math.random');
  });

  it('should not use Date.now', () => {
    const result = composeKnowledgeExamples(VALID_INPUT);
    assert.ok(result, 'Should produce a result without Date.now');
  });

  it('should not use performance.now', () => {
    const result = composeKnowledgeExamples(VALID_INPUT);
    assert.ok(result, 'Should produce a result without performance.now');
  });

  it('should not use crypto.randomUUID', () => {
    const result = composeKnowledgeExamples(VALID_INPUT);
    assert.ok(result, 'Should produce a result without crypto.randomUUID');
  });

  it('should not have executable callbacks in profile', () => {
    const profile = composeKnowledgeExampleProfile({
      exampleId: 'ex-001',
      conceptId: 'concept-001',
      title: 'Test',
      exampleType: 'definition_example',
      exampleLevel: 'introductory',
      progressiveStage: 'recognition',
      visibility: 'default',
      status: 'draft',
      governance: 'public',
      tags: [],
      representationIds: [],
      orderIndex: 1,
      provenance: VALID_PROVENANCE,
    });

    const keys = Object.keys(profile);
    for (const key of keys) {
      const value = (profile as any)[key];
      assert.ok(typeof value !== 'function', `Profile field "${key}" should not be a function`);
    }
  });

  it('should not store educational content', () => {
    const result = composeKnowledgeExamples(VALID_INPUT);
    assert.ok(!('educationalContent' in result), 'Should not have educational content');
    assert.ok(!('markdown' in result), 'Should not have markdown');
  });

  it('should not access filesystem', () => {
    const result = composeKnowledgeExamples(VALID_INPUT);
    assert.ok(!('filesystem' in result), 'Should not have filesystem');
    assert.ok(!('fileSystem' in result), 'Should not have fileSystem');
  });

  it('should not perform network requests', () => {
    const result = composeKnowledgeExamples(VALID_INPUT);
    assert.ok(!('networkResponse' in result), 'Should not have network response');
    assert.ok(!('httpResult' in result), 'Should not have HTTP result');
  });

  it('should not have async behavior markers', () => {
    const result = composeKnowledgeExamples(VALID_INPUT);
    assert.ok(!('promise' in result), 'Should not have promise');
    assert.ok(!('async' in result), 'Should not have async');
  });
});

// ---------------------------------------------------------------------------
// Cross-Agent Boundary Tests
// ---------------------------------------------------------------------------

describe('Example Kernel — Cross-Agent Boundary', () => {
  it('should not reference Didactic Agent', () => {
    const result = composeKnowledgeExamples(VALID_INPUT);
    const str = JSON.stringify(result);
    assert.ok(!str.includes('Didactic Agent'), 'Should not reference Didactic Agent');
  });

  it('should not reference Curriculum Agent', () => {
    const result = composeKnowledgeExamples(VALID_INPUT);
    const str = JSON.stringify(result);
    assert.ok(!str.includes('Curriculum Agent'), 'Should not reference Curriculum Agent');
  });

  it('should not reference Narrative Agent', () => {
    const result = composeKnowledgeExamples(VALID_INPUT);
    const str = JSON.stringify(result);
    assert.ok(!str.includes('Narrative Agent'), 'Should not reference Narrative Agent');
  });

  it('should not reference Assessment Agent', () => {
    const result = composeKnowledgeExamples(VALID_INPUT);
    const str = JSON.stringify(result);
    assert.ok(!str.includes('Assessment Agent'), 'Should not reference Assessment Agent');
  });

  it('should not reference Curiosity Agent', () => {
    const result = composeKnowledgeExamples(VALID_INPUT);
    const str = JSON.stringify(result);
    assert.ok(!str.includes('Curiosity Agent'), 'Should not reference Curiosity Agent');
  });

  it('should not reference Research Agent', () => {
    const result = composeKnowledgeExamples(VALID_INPUT);
    const str = JSON.stringify(result);
    assert.ok(!str.includes('Research Agent'), 'Should not reference Research Agent');
  });

  it('should not reference Laboratory Agent', () => {
    const result = composeKnowledgeExamples(VALID_INPUT);
    const str = JSON.stringify(result);
    assert.ok(!str.includes('Laboratory Agent'), 'Should not reference Laboratory Agent');
  });

  it('should not reference Application Agent', () => {
    const result = composeKnowledgeExamples(VALID_INPUT);
    const str = JSON.stringify(result);
    assert.ok(!str.includes('Application Agent'), 'Should not reference Application Agent');
  });
});

// ---------------------------------------------------------------------------
// Deterministic Sorting Tests
// ---------------------------------------------------------------------------

describe('Example Kernel — Deterministic Sorting', () => {
  it('should sort deterministically by conceptId', () => {
    const profile3 = { ...VALID_PROFILE_1, exampleId: 'ex-003', conceptId: 'concept-003' };
    const profile1 = { ...VALID_PROFILE_1, exampleId: 'ex-001', conceptId: 'concept-001' };
    const profile2 = { ...VALID_PROFILE_1, exampleId: 'ex-002', conceptId: 'concept-002' };

    const registry = composeKnowledgeExampleRegistry([profile3, profile1, profile2], []);

    assert.equal(registry.profiles[0].conceptId, 'concept-001');
    assert.equal(registry.profiles[1].conceptId, 'concept-002');
    assert.equal(registry.profiles[2].conceptId, 'concept-003');
  });

  it('should sort by progressiveStage when conceptId is equal', () => {
    const profileA = { ...VALID_PROFILE_1, exampleId: 'ex-002', conceptId: 'concept-001', progressiveStage: 'understanding' as const };
    const profileB = { ...VALID_PROFILE_1, exampleId: 'ex-001', conceptId: 'concept-001', progressiveStage: 'recognition' as const };

    const registry = composeKnowledgeExampleRegistry([profileA, profileB], []);

    assert.equal(registry.profiles[0].progressiveStage, 'recognition');
    assert.equal(registry.profiles[1].progressiveStage, 'understanding');
  });
});

/**
 * D10-OPT-14 — Semantic Connectivity Kernel Test Suite
 *
 * Comprehensive deterministic test suite for the Connectivity Kernel.
 * Covers: composition, validation, helpers, determinism, immutability,
 * runtime restrictions, cross-agent boundary, and public API.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import type {
  KnowledgeConnectivityProfile,
  KnowledgeConnectivityProvenance,
  KnowledgeConnectivityRelationship,
  KnowledgeConnectivityInput,
  KnowledgeConnectivityRegistry,
  KnowledgeConnectivityTrace,
  KnowledgeArtifactWithConnectivity,
} from './KnowledgeAgentContract.ts';

import {
  CANONICAL_CONNECTIVITY_TYPES,
  CANONICAL_CONNECTIVITY_STRENGTH,
  CANONICAL_CONNECTIVITY_SCOPE,
  CANONICAL_CONNECTIVITY_STATUS,
  CANONICAL_CONNECTIVITY_VISIBILITY,
  CANONICAL_CONNECTIVITY_GOVERNANCE,
} from './KnowledgeAgentContract.ts';

import {
  composeKnowledgeConnectivityProvenance,
  composeKnowledgeConnectivityProfile,
  composeKnowledgeConnectivityRelationship,
  composeKnowledgeConnectivityTrace,
  composeKnowledgeConnectivityRegistry,
  composeKnowledgeConnectivityRegistryFromInput,
  composeKnowledgeConnectivity,
  composeKnowledgeArtifactWithConnectivity,
  isSupportedConnectivityType,
  isSupportedConnectivityStrength,
  isSupportedConnectivityScope,
  isSupportedConnectivityVisibility,
  isSupportedConnectivityStatus,
  isSupportedConnectivityGovernance,
  getCanonicalConnectivityTypes,
  getCanonicalConnectivityStrengths,
  getCanonicalConnectivityScopes,
  getCanonicalConnectivityVisibility,
  getCanonicalConnectivityStatuses,
} from './KnowledgeConnectivityKernel.ts';

import {
  validateKnowledgeConnectivityProfile,
  validateKnowledgeConnectivityRelationship,
  validateKnowledgeConnectivityRegistry,
  validateKnowledgeConnectivityInput,
  validateKnowledgeConnectivityTrace,
  validateKnowledgeArtifactWithConnectivity,
  CONNECTIVITY_VALIDATION_CODES,
} from './KnowledgeConnectivityValidation.ts';

// ---------------------------------------------------------------------------
// Test Fixtures
// ---------------------------------------------------------------------------

const VALID_PROVENANCE: KnowledgeConnectivityProvenance = {
  source: 'NeuralVerse Team',
  provider: 'Connectivity Agent',
  rationale: 'Core connectivity for concepts.',
  governance: 'canonical',
};

const VALID_PROFILE_1: KnowledgeConnectivityProfile = {
  relationshipId: 'conn-001',
  sourceConceptId: 'concept-001',
  targetConceptId: 'concept-002',
  relationshipType: 'prerequisite',
  relationshipStrength: 'strong',
  scope: 'domain',
  visibility: 'default',
  status: 'canonical',
  governance: 'canonical',
  description: 'Neural networks require linear algebra.',
  bidirectional: false,
  tags: ['neural_networks', 'linear_algebra'],
  provenance: VALID_PROVENANCE,
};

const VALID_PROFILE_2: KnowledgeConnectivityProfile = {
  relationshipId: 'conn-002',
  sourceConceptId: 'concept-001',
  targetConceptId: 'concept-003',
  relationshipType: 'extends',
  relationshipStrength: 'moderate',
  scope: 'cross_domain',
  visibility: 'advanced',
  status: 'approved',
  governance: 'accepted',
  description: 'Deep learning extends neural networks.',
  bidirectional: false,
  tags: ['deep_learning', 'neural_networks'],
  provenance: { ...VALID_PROVENANCE, source: 'Knowledge Pipeline' },
};

const VALID_PROFILE_3: KnowledgeConnectivityProfile = {
  relationshipId: 'conn-003',
  sourceConceptId: 'concept-002',
  targetConceptId: 'concept-003',
  relationshipType: 'related_to',
  relationshipStrength: 'weak',
  scope: 'local',
  visibility: 'expert',
  status: 'canonical',
  governance: 'canonical',
  description: 'Linear algebra relates to deep learning.',
  bidirectional: true,
  tags: ['linear_algebra', 'deep_learning'],
  provenance: VALID_PROVENANCE,
};

const VALID_RELATIONSHIP: KnowledgeConnectivityRelationship = {
  relationshipId: 'rel-001',
  sourceRelationshipId: 'conn-001',
  targetRelationshipId: 'conn-002',
  relationshipType: 'extension',
  description: 'Deep learning extends prerequisite relationship.',
  provenance: VALID_PROVENANCE,
};

const VALID_INPUT: KnowledgeConnectivityInput = {
  profiles: [VALID_PROFILE_1, VALID_PROFILE_2, VALID_PROFILE_3],
  relationships: [VALID_RELATIONSHIP],
};

const EMPTY_INPUT: KnowledgeConnectivityInput = {
  profiles: [],
  relationships: [],
};

// ---------------------------------------------------------------------------
// Composition Tests
// ---------------------------------------------------------------------------

describe('Connectivity Kernel — Composition', () => {
  it('should compose valid connectivity provenance', () => {
    const provenance = composeKnowledgeConnectivityProvenance({
      source: 'NeuralVerse Team',
      provider: 'Connectivity Agent',
      rationale: 'Core connectivity.',
      governance: 'canonical',
    });

    assert.equal(provenance.source, 'NeuralVerse Team');
    assert.equal(provenance.provider, 'Connectivity Agent');
    assert.equal(provenance.rationale, 'Core connectivity.');
    assert.equal(provenance.governance, 'canonical');
  });

  it('should compose valid connectivity profile', () => {
    const profile = composeKnowledgeConnectivityProfile({
      relationshipId: 'conn-001',
      sourceConceptId: 'concept-001',
      targetConceptId: 'concept-002',
      relationshipType: 'prerequisite',
      relationshipStrength: 'strong',
      scope: 'domain',
      visibility: 'default',
      status: 'canonical',
      governance: 'canonical',
      description: 'Test connectivity.',
      bidirectional: false,
      tags: ['tag1'],
      provenance: VALID_PROVENANCE,
    });

    assert.equal(profile.relationshipId, 'conn-001');
    assert.equal(profile.sourceConceptId, 'concept-001');
    assert.equal(profile.targetConceptId, 'concept-002');
    assert.equal(profile.relationshipType, 'prerequisite');
    assert.equal(profile.tags.length, 1);
  });

  it('should compose valid connectivity relationship', () => {
    const relationship = composeKnowledgeConnectivityRelationship({
      relationshipId: 'rel-001',
      sourceRelationshipId: 'conn-001',
      targetRelationshipId: 'conn-002',
      relationshipType: 'extension',
      description: 'Test relationship.',
      provenance: VALID_PROVENANCE,
    });

    assert.equal(relationship.relationshipId, 'rel-001');
    assert.equal(relationship.sourceRelationshipId, 'conn-001');
    assert.equal(relationship.targetRelationshipId, 'conn-002');
    assert.equal(relationship.relationshipType, 'extension');
  });

  it('should compose valid connectivity trace', () => {
    const trace = composeKnowledgeConnectivityTrace({
      traceId: '_trace_1',
      decisions: [
        { decisionId: 'd1', relationshipId: 'conn-001', sourceConceptId: 'concept-001', targetConceptId: 'concept-002', validationPassed: true, validationErrors: [] },
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

  it('should compose valid connectivity registry', () => {
    const registry = composeKnowledgeConnectivityRegistry([VALID_PROFILE_1, VALID_PROFILE_2], [VALID_RELATIONSHIP]);

    assert.equal(registry.deterministic, true);
    assert.equal(registry.randomUsed, false);
    assert.equal(registry.timeDependency, false);
    assert.equal(registry.profiles.length, 2);
    assert.equal(registry.relationships.length, 1);
  });

  it('should compose registry from input', () => {
    const registry = composeKnowledgeConnectivityRegistryFromInput(VALID_INPUT);
    assert.equal(registry.profiles.length, 3);
  });

  it('should compose knowledge connectivity from input', () => {
    const registry = composeKnowledgeConnectivity(VALID_INPUT);
    assert.equal(registry.deterministic, true);
    assert.equal(registry.trace.decisionCount, 3);
  });

  it('should compose artifact with connectivity', () => {
    const artifact = composeKnowledgeArtifactWithConnectivity({
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

describe('Connectivity Kernel — Validation', () => {
  it('should validate a valid profile with no errors', () => {
    const errors = validateKnowledgeConnectivityProfile(VALID_PROFILE_1);
    assert.deepStrictEqual(errors, []);
  });

  it('should validate a valid registry with no errors', () => {
    const registry = composeKnowledgeConnectivityRegistry([VALID_PROFILE_1, VALID_PROFILE_2], [VALID_RELATIONSHIP]);
    const result = validateKnowledgeConnectivityRegistry(registry);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it('should validate knowledge connectivity input', () => {
    const result = validateKnowledgeConnectivityInput(VALID_INPUT);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it('should detect duplicate IDs', () => {
    const registry = composeKnowledgeConnectivityRegistry([VALID_PROFILE_1, VALID_PROFILE_1], []);
    const result = validateKnowledgeConnectivityRegistry(registry);
    const duplicateError = result.errors.find(
      (e) => e.code === CONNECTIVITY_VALIDATION_CODES.CONNECTIVITY_DUPLICATE_ID,
    );
    assert.ok(duplicateError, 'Should have CONNECTIVITY_DUPLICATE_ID error');
  });

  it('should detect duplicate titles', () => {
    const profile1 = { ...VALID_PROFILE_1, relationshipId: 'conn-001' };
    const profile2 = { ...VALID_PROFILE_1, relationshipId: 'conn-002' };
    const registry = composeKnowledgeConnectivityRegistry([profile1, profile2], []);
    const result = validateKnowledgeConnectivityRegistry(registry);
    const duplicateError = result.errors.find(
      (e) => e.code === CONNECTIVITY_VALIDATION_CODES.CONNECTIVITY_DUPLICATE_TITLE,
    );
    assert.ok(duplicateError, 'Should have CONNECTIVITY_DUPLICATE_TITLE error');
  });

  it('should detect invalid type', () => {
    const profile = { ...VALID_PROFILE_1, relationshipType: 'unsupported' as any };
    const errors = validateKnowledgeConnectivityProfile(profile);
    const typeError = errors.find(
      (e) => e.code === CONNECTIVITY_VALIDATION_CODES.CONNECTIVITY_INVALID_TYPE,
    );
    assert.ok(typeError, 'Should have CONNECTIVITY_INVALID_TYPE error');
  });

  it('should detect invalid strength', () => {
    const profile = { ...VALID_PROFILE_1, relationshipStrength: 'unsupported' as any };
    const errors = validateKnowledgeConnectivityProfile(profile);
    const strengthError = errors.find(
      (e) => e.code === CONNECTIVITY_VALIDATION_CODES.CONNECTIVITY_INVALID_STRENGTH,
    );
    assert.ok(strengthError, 'Should have CONNECTIVITY_INVALID_STRENGTH error');
  });

  it('should detect invalid scope', () => {
    const profile = { ...VALID_PROFILE_1, scope: 'unsupported' as any };
    const errors = validateKnowledgeConnectivityProfile(profile);
    const scopeError = errors.find(
      (e) => e.code === CONNECTIVITY_VALIDATION_CODES.CONNECTIVITY_INVALID_SCOPE,
    );
    assert.ok(scopeError, 'Should have CONNECTIVITY_INVALID_SCOPE error');
  });

  it('should detect invalid visibility', () => {
    const profile = { ...VALID_PROFILE_1, visibility: 'unsupported' as any };
    const errors = validateKnowledgeConnectivityProfile(profile);
    const visibilityError = errors.find(
      (e) => e.code === CONNECTIVITY_VALIDATION_CODES.CONNECTIVITY_INVALID_VISIBILITY,
    );
    assert.ok(visibilityError, 'Should have CONNECTIVITY_INVALID_VISIBILITY error');
  });

  it('should detect invalid status', () => {
    const profile = { ...VALID_PROFILE_1, status: 'unsupported' as any };
    const errors = validateKnowledgeConnectivityProfile(profile);
    const statusError = errors.find(
      (e) => e.code === CONNECTIVITY_VALIDATION_CODES.CONNECTIVITY_INVALID_STATUS,
    );
    assert.ok(statusError, 'Should have CONNECTIVITY_INVALID_STATUS error');
  });

  it('should detect invalid governance', () => {
    const profile = { ...VALID_PROFILE_1, governance: 'unsupported' as any };
    const errors = validateKnowledgeConnectivityProfile(profile);
    const governanceError = errors.find(
      (e) => e.code === CONNECTIVITY_VALIDATION_CODES.CONNECTIVITY_INVALID_GOVERNANCE,
    );
    assert.ok(governanceError, 'Should have CONNECTIVITY_INVALID_GOVERNANCE error');
  });

  it('should detect missing provenance', () => {
    const profile = { ...VALID_PROFILE_1, provenance: undefined as any };
    const errors = validateKnowledgeConnectivityProfile(profile);
    const provenanceError = errors.find(
      (e) => e.code === CONNECTIVITY_VALIDATION_CODES.CONNECTIVITY_MISSING_PROVENANCE,
    );
    assert.ok(provenanceError, 'Should have CONNECTIVITY_MISSING_PROVENANCE error');
  });

  it('should detect missing provider', () => {
    const profile = { ...VALID_PROFILE_1, provenance: { ...VALID_PROVENANCE, provider: '' } };
    const errors = validateKnowledgeConnectivityProfile(profile);
    const providerError = errors.find(
      (e) => e.code === CONNECTIVITY_VALIDATION_CODES.CONNECTIVITY_MISSING_PROVIDER,
    );
    assert.ok(providerError, 'Should have CONNECTIVITY_MISSING_PROVIDER error');
  });

  it('should detect missing rationale', () => {
    const profile = { ...VALID_PROFILE_1, provenance: { ...VALID_PROVENANCE, rationale: '' } };
    const errors = validateKnowledgeConnectivityProfile(profile);
    const rationaleError = errors.find(
      (e) => e.code === CONNECTIVITY_VALIDATION_CODES.CONNECTIVITY_MISSING_RATIONALE,
    );
    assert.ok(rationaleError, 'Should have CONNECTIVITY_MISSING_RATIONALE error');
  });

  it('should detect self relationship', () => {
    const relationship = { ...VALID_RELATIONSHIP, targetRelationshipId: 'conn-001' };
    const knownProfileIds = new Set(['conn-001', 'conn-002']);
    const errors = validateKnowledgeConnectivityRelationship(relationship, knownProfileIds);
    const selfError = errors.find(
      (e) => e.code === CONNECTIVITY_VALIDATION_CODES.CONNECTIVITY_SELF_RELATIONSHIP,
    );
    assert.ok(selfError, 'Should have CONNECTIVITY_SELF_RELATIONSHIP error');
  });

  it('should detect empty registry', () => {
    const registry = composeKnowledgeConnectivityRegistry([], []);
    const result = validateKnowledgeConnectivityRegistry(registry);
    const emptyError = result.errors.find(
      (e) => e.code === CONNECTIVITY_VALIDATION_CODES.CONNECTIVITY_EMPTY_REGISTRY,
    );
    assert.ok(emptyError, 'Should have CONNECTIVITY_EMPTY_REGISTRY error');
    assert.equal(result.valid, false);
  });

  it('should detect invalid trace', () => {
    const trace: KnowledgeConnectivityTrace = {
      traceId: '',
      decisionCount: 0,
      validationCount: 0,
      registryVersion: '1.0.0',
      compositionVersion: '1.0.0',
      decisions: [],
      deterministic: false as true,
      generatedFrom: 'deterministic_connectivity_kernel',
      randomUsed: false,
      timeDependency: false,
    };
    const result = validateKnowledgeConnectivityTrace(trace);
    assert.equal(result.valid, false);
  });

  it('should detect registry inconsistency', () => {
    const registry: KnowledgeConnectivityRegistry = {
      registryId: '_registry_5',
      profiles: [VALID_PROFILE_1],
      relationships: [],
      metadata: {
        registryId: '_registry_5',
        relationshipCount: 5,
        higherOrderRelationshipCount: 0,
        conceptCount: 2,
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
        generatedFrom: 'deterministic_connectivity_kernel',
        randomUsed: false,
        timeDependency: false,
      },
      deterministic: true,
      generatedFrom: 'deterministic_connectivity_kernel',
      randomUsed: false,
      timeDependency: false,
    };
    const result = validateKnowledgeConnectivityRegistry(registry);
    const inconsistencyError = result.errors.find(
      (e) => e.code === CONNECTIVITY_VALIDATION_CODES.CONNECTIVITY_REGISTRY_INCONSISTENCY,
    );
    assert.ok(inconsistencyError, 'Should have CONNECTIVITY_REGISTRY_INCONSISTENCY error');
  });

  it('should validate a valid trace', () => {
    const trace = composeKnowledgeConnectivityTrace({
      traceId: '_trace_1',
      decisions: [],
      registryVersion: '1.0.0',
      compositionVersion: '1.0.0',
    });
    const result = validateKnowledgeConnectivityTrace(trace);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it('should validate artifact with connectivity', () => {
    const artifact = composeKnowledgeArtifactWithConnectivity({
      conceptId: 'concept-001',
      conceptTitle: 'Neural Networks',
      profiles: [VALID_PROFILE_1],
      relationships: [],
      provenance: VALID_PROVENANCE,
    });
    const result = validateKnowledgeArtifactWithConnectivity(artifact);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });
});

// ---------------------------------------------------------------------------
// Determinism Tests
// ---------------------------------------------------------------------------

describe('Connectivity Kernel — Determinism', () => {
  it('should produce identical output for identical input (100 iterations)', () => {
    const results: ReturnType<typeof composeKnowledgeConnectivity>[] = [];
    for (let i = 0; i < 100; i++) {
      results.push(composeKnowledgeConnectivity(VALID_INPUT));
    }

    for (let i = 1; i < results.length; i++) {
      assert.deepStrictEqual(results[0].registryId, results[i].registryId);
      assert.deepStrictEqual(results[0].profiles, results[i].profiles);
      assert.deepStrictEqual(results[0].trace.traceId, results[i].trace.traceId);
    }
  });

  it('should produce identical registry output for identical input (100 iterations)', () => {
    const results: ReturnType<typeof composeKnowledgeConnectivityRegistry>[] = [];
    for (let i = 0; i < 100; i++) {
      results.push(composeKnowledgeConnectivityRegistry([VALID_PROFILE_1, VALID_PROFILE_2], [VALID_RELATIONSHIP]));
    }

    for (let i = 1; i < results.length; i++) {
      assert.deepStrictEqual(results[0].profiles, results[i].profiles);
      assert.deepStrictEqual(results[0].registryId, results[i].registryId);
    }
  });

  it('should produce identical provenance for identical input', () => {
    const results: ReturnType<typeof composeKnowledgeConnectivityProvenance>[] = [];
    for (let i = 0; i < 100; i++) {
      results.push(composeKnowledgeConnectivityProvenance({
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
    const results: ReturnType<typeof composeKnowledgeConnectivityTrace>[] = [];
    for (let i = 0; i < 100; i++) {
      results.push(composeKnowledgeConnectivityTrace({
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

describe('Connectivity Kernel — Immutability', () => {
  it('should not mutate input profiles', () => {
    const originalId = VALID_PROFILE_1.relationshipId;
    const originalDescription = VALID_PROFILE_1.description;

    composeKnowledgeConnectivity(VALID_INPUT);

    assert.equal(VALID_PROFILE_1.relationshipId, originalId);
    assert.equal(VALID_PROFILE_1.description, originalDescription);
  });

  it('should not mutate input registry profiles', () => {
    const profiles = [VALID_PROFILE_1, VALID_PROFILE_2];
    const originalIds = profiles.map((p) => p.relationshipId);

    composeKnowledgeConnectivityRegistry(profiles, []);

    assert.equal(profiles[0].relationshipId, originalIds[0]);
    assert.equal(profiles[1].relationshipId, originalIds[1]);
  });

  it('should use defensive copies for tags', () => {
    const originalTags = ['tag1', 'tag2'];
    const profile = composeKnowledgeConnectivityProfile({
      relationshipId: 'test',
      sourceConceptId: 'concept-001',
      targetConceptId: 'concept-002',
      relationshipType: 'prerequisite',
      relationshipStrength: 'moderate',
      scope: 'local',
      visibility: 'default',
      status: 'draft',
      governance: 'public',
      description: 'Test.',
      bidirectional: false,
      tags: originalTags,
      provenance: VALID_PROVENANCE,
    });

    assert.notEqual(profile.tags, originalTags);
    assert.deepStrictEqual([...profile.tags], originalTags);
  });
});

// ---------------------------------------------------------------------------
// Helper Function Tests
// ---------------------------------------------------------------------------

describe('Connectivity Kernel — Helpers', () => {
  it('should return canonical connectivity types', () => {
    const types = getCanonicalConnectivityTypes();
    assert.deepStrictEqual([...types], [...CANONICAL_CONNECTIVITY_TYPES]);
    assert.equal(types.length, 10);
  });

  it('should return canonical connectivity strengths', () => {
    const strengths = getCanonicalConnectivityStrengths();
    assert.deepStrictEqual([...strengths], [...CANONICAL_CONNECTIVITY_STRENGTH]);
    assert.equal(strengths.length, 10);
  });

  it('should return canonical connectivity scopes', () => {
    const scopes = getCanonicalConnectivityScopes();
    assert.deepStrictEqual([...scopes], [...CANONICAL_CONNECTIVITY_SCOPE]);
    assert.equal(scopes.length, 10);
  });

  it('should return canonical connectivity visibility', () => {
    const visibility = getCanonicalConnectivityVisibility();
    assert.deepStrictEqual([...visibility], [...CANONICAL_CONNECTIVITY_VISIBILITY]);
    assert.equal(visibility.length, 10);
  });

  it('should return canonical connectivity statuses', () => {
    const statuses = getCanonicalConnectivityStatuses();
    assert.deepStrictEqual([...statuses], [...CANONICAL_CONNECTIVITY_STATUS]);
    assert.equal(statuses.length, 6);
  });

  it('should validate connectivity type support', () => {
    assert.equal(isSupportedConnectivityType('prerequisite'), true);
    assert.equal(isSupportedConnectivityType('depends_on'), true);
    assert.equal(isSupportedConnectivityType('unsupported'), false);
  });

  it('should validate connectivity strength support', () => {
    assert.equal(isSupportedConnectivityStrength('minimal'), true);
    assert.equal(isSupportedConnectivityStrength('strong'), true);
    assert.equal(isSupportedConnectivityStrength('unsupported'), false);
  });

  it('should validate connectivity scope support', () => {
    assert.equal(isSupportedConnectivityScope('local'), true);
    assert.equal(isSupportedConnectivityScope('global'), true);
    assert.equal(isSupportedConnectivityScope('unsupported'), false);
  });

  it('should validate connectivity visibility support', () => {
    assert.equal(isSupportedConnectivityVisibility('always'), true);
    assert.equal(isSupportedConnectivityVisibility('default'), true);
    assert.equal(isSupportedConnectivityVisibility('unsupported'), false);
  });

  it('should validate connectivity status support', () => {
    assert.equal(isSupportedConnectivityStatus('draft'), true);
    assert.equal(isSupportedConnectivityStatus('canonical'), true);
    assert.equal(isSupportedConnectivityStatus('unsupported'), false);
  });

  it('should validate connectivity governance support', () => {
    assert.equal(isSupportedConnectivityGovernance('canonical'), true);
    assert.equal(isSupportedConnectivityGovernance('accepted'), true);
    assert.equal(isSupportedConnectivityGovernance('unsupported'), false);
  });
});

// ---------------------------------------------------------------------------
// Canonical Enum Completeness Tests
// ---------------------------------------------------------------------------

describe('Connectivity Kernel — Canonical Enum Completeness', () => {
  it('should have exactly 10 connectivity types', () => {
    assert.equal(CANONICAL_CONNECTIVITY_TYPES.length, 10);
  });

  it('should have exactly 10 connectivity strengths', () => {
    assert.equal(CANONICAL_CONNECTIVITY_STRENGTH.length, 10);
  });

  it('should have exactly 10 connectivity scopes', () => {
    assert.equal(CANONICAL_CONNECTIVITY_SCOPE.length, 10);
  });

  it('should have exactly 6 connectivity statuses', () => {
    assert.equal(CANONICAL_CONNECTIVITY_STATUS.length, 6);
  });

  it('should have exactly 10 connectivity visibility values', () => {
    assert.equal(CANONICAL_CONNECTIVITY_VISIBILITY.length, 10);
  });

  it('should have exactly 10 connectivity governance values', () => {
    assert.equal(CANONICAL_CONNECTIVITY_GOVERNANCE.length, 10);
  });

  it('should contain all expected connectivity types', () => {
    const expected = ['prerequisite', 'depends_on', 'extends', 'specializes', 'generalizes', 'related_to', 'contrasts_with', 'supports', 'derived_from', 'equivalent_to'];
    for (const type of expected) {
      assert.ok(CANONICAL_CONNECTIVITY_TYPES.includes(type as any), `Should include type: ${type}`);
    }
  });

  it('should contain all expected connectivity strengths', () => {
    const expected = ['minimal', 'weak', 'moderate', 'strong', 'very_strong', 'fundamental', 'engineering', 'research', 'canonical', 'mandatory'];
    for (const strength of expected) {
      assert.ok(CANONICAL_CONNECTIVITY_STRENGTH.includes(strength as any), `Should include strength: ${strength}`);
    }
  });

  it('should contain all expected connectivity scopes', () => {
    const expected = ['local', 'module', 'domain', 'discipline', 'cross_domain', 'curriculum', 'research', 'engineering', 'global', 'canonical'];
    for (const scope of expected) {
      assert.ok(CANONICAL_CONNECTIVITY_SCOPE.includes(scope as any), `Should include scope: ${scope}`);
    }
  });

  it('should contain all expected connectivity statuses', () => {
    const expected = ['draft', 'review', 'approved', 'canonical', 'deprecated', 'archived'];
    for (const status of expected) {
      assert.ok(CANONICAL_CONNECTIVITY_STATUS.includes(status as any), `Should include status: ${status}`);
    }
  });

  it('should contain all expected connectivity visibility values', () => {
    const expected = ['always', 'default', 'advanced', 'expert', 'curriculum', 'assessment', 'laboratory', 'research', 'internal', 'hidden'];
    for (const visibility of expected) {
      assert.ok(CANONICAL_CONNECTIVITY_VISIBILITY.includes(visibility as any), `Should include visibility: ${visibility}`);
    }
  });

  it('should contain all expected connectivity governance values', () => {
    const expected = ['canonical', 'accepted', 'provisional', 'experimental', 'deprecated', 'restricted', 'internal', 'public', 'community', 'archived'];
    for (const governance of expected) {
      assert.ok(CANONICAL_CONNECTIVITY_GOVERNANCE.includes(governance as any), `Should include governance: ${governance}`);
    }
  });
});

// ---------------------------------------------------------------------------
// Validation Code Count Test
// ---------------------------------------------------------------------------

describe('Connectivity Kernel — Validation Code Count', () => {
  it('should have exactly 20 validation codes', () => {
    const codes = Object.values(CONNECTIVITY_VALIDATION_CODES);
    assert.equal(codes.length, 20);
  });

  it('should have all codes prefixed with CONNECTIVITY_', () => {
    const codes = Object.values(CONNECTIVITY_VALIDATION_CODES);
    for (const code of codes) {
      assert.ok(code.startsWith('CONNECTIVITY_'), `Code "${code}" should start with CONNECTIVITY_`);
    }
  });

  it('should have unique codes', () => {
    const codes = Object.values(CONNECTIVITY_VALIDATION_CODES);
    const unique = new Set(codes);
    assert.equal(codes.length, unique.size, 'All codes should be unique');
  });
});

// ---------------------------------------------------------------------------
// Runtime Restrictions Tests
// ---------------------------------------------------------------------------

describe('Connectivity Kernel — Runtime Restrictions', () => {
  it('should not use Math.random', () => {
    const result = composeKnowledgeConnectivity(VALID_INPUT);
    assert.ok(result, 'Should produce a result without Math.random');
  });

  it('should not use Date.now', () => {
    const result = composeKnowledgeConnectivity(VALID_INPUT);
    assert.ok(result, 'Should produce a result without Date.now');
  });

  it('should not use performance.now', () => {
    const result = composeKnowledgeConnectivity(VALID_INPUT);
    assert.ok(result, 'Should produce a result without performance.now');
  });

  it('should not use crypto.randomUUID', () => {
    const result = composeKnowledgeConnectivity(VALID_INPUT);
    assert.ok(result, 'Should produce a result without crypto.randomUUID');
  });

  it('should not have executable callbacks in profile', () => {
    const profile = composeKnowledgeConnectivityProfile({
      relationshipId: 'conn-001',
      sourceConceptId: 'concept-001',
      targetConceptId: 'concept-002',
      relationshipType: 'prerequisite',
      relationshipStrength: 'moderate',
      scope: 'local',
      visibility: 'default',
      status: 'draft',
      governance: 'public',
      description: 'Test.',
      bidirectional: false,
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
    const result = composeKnowledgeConnectivity(VALID_INPUT);
    assert.ok(!('educationalContent' in result), 'Should not have educational content');
    assert.ok(!('markdown' in result), 'Should not have markdown');
  });

  it('should not access filesystem', () => {
    const result = composeKnowledgeConnectivity(VALID_INPUT);
    assert.ok(!('filesystem' in result), 'Should not have filesystem');
    assert.ok(!('fileSystem' in result), 'Should not have fileSystem');
  });

  it('should not perform network requests', () => {
    const result = composeKnowledgeConnectivity(VALID_INPUT);
    assert.ok(!('networkResponse' in result), 'Should not have network response');
    assert.ok(!('httpResult' in result), 'Should not have HTTP result');
  });

  it('should not have async behavior markers', () => {
    const result = composeKnowledgeConnectivity(VALID_INPUT);
    assert.ok(!('promise' in result), 'Should not have promise');
    assert.ok(!('async' in result), 'Should not have async');
  });
});

// ---------------------------------------------------------------------------
// Cross-Agent Boundary Tests
// ---------------------------------------------------------------------------

describe('Connectivity Kernel — Cross-Agent Boundary', () => {
  it('should not reference Didactic Agent', () => {
    const result = composeKnowledgeConnectivity(VALID_INPUT);
    const str = JSON.stringify(result);
    assert.ok(!str.includes('Didactic Agent'), 'Should not reference Didactic Agent');
  });

  it('should not reference Curriculum Agent', () => {
    const result = composeKnowledgeConnectivity(VALID_INPUT);
    const str = JSON.stringify(result);
    assert.ok(!str.includes('Curriculum Agent'), 'Should not reference Curriculum Agent');
  });

  it('should not reference Narrative Agent', () => {
    const result = composeKnowledgeConnectivity(VALID_INPUT);
    const str = JSON.stringify(result);
    assert.ok(!str.includes('Narrative Agent'), 'Should not reference Narrative Agent');
  });

  it('should not reference Assessment Agent', () => {
    const result = composeKnowledgeConnectivity(VALID_INPUT);
    const str = JSON.stringify(result);
    assert.ok(!str.includes('Assessment Agent'), 'Should not reference Assessment Agent');
  });

  it('should not reference Curiosity Agent', () => {
    const result = composeKnowledgeConnectivity(VALID_INPUT);
    const str = JSON.stringify(result);
    assert.ok(!str.includes('Curiosity Agent'), 'Should not reference Curiosity Agent');
  });

  it('should not reference Research Agent', () => {
    const result = composeKnowledgeConnectivity(VALID_INPUT);
    const str = JSON.stringify(result);
    assert.ok(!str.includes('Research Agent'), 'Should not reference Research Agent');
  });

  it('should not reference Laboratory Agent', () => {
    const result = composeKnowledgeConnectivity(VALID_INPUT);
    const str = JSON.stringify(result);
    assert.ok(!str.includes('Laboratory Agent'), 'Should not reference Laboratory Agent');
  });

  it('should not reference Application Agent', () => {
    const result = composeKnowledgeConnectivity(VALID_INPUT);
    const str = JSON.stringify(result);
    assert.ok(!str.includes('Application Agent'), 'Should not reference Application Agent');
  });
});

// ---------------------------------------------------------------------------
// Deterministic Sorting Tests
// ---------------------------------------------------------------------------

describe('Connectivity Kernel — Deterministic Sorting', () => {
  it('should sort deterministically by sourceConceptId', () => {
    const profile3 = { ...VALID_PROFILE_1, relationshipId: 'conn-003', sourceConceptId: 'concept-003' };
    const profile1 = { ...VALID_PROFILE_1, relationshipId: 'conn-001', sourceConceptId: 'concept-001' };
    const profile2 = { ...VALID_PROFILE_1, relationshipId: 'conn-002', sourceConceptId: 'concept-002' };

    const registry = composeKnowledgeConnectivityRegistry([profile3, profile1, profile2], []);

    assert.equal(registry.profiles[0].sourceConceptId, 'concept-001');
    assert.equal(registry.profiles[1].sourceConceptId, 'concept-002');
    assert.equal(registry.profiles[2].sourceConceptId, 'concept-003');
  });

  it('should sort by relationshipType when sourceConceptId is equal', () => {
    const profileA = { ...VALID_PROFILE_1, relationshipId: 'conn-002', sourceConceptId: 'concept-001', relationshipType: 'extends' as const };
    const profileB = { ...VALID_PROFILE_1, relationshipId: 'conn-001', sourceConceptId: 'concept-001', relationshipType: 'prerequisite' as const };

    const registry = composeKnowledgeConnectivityRegistry([profileA, profileB], []);

    assert.equal(registry.profiles[0].relationshipType, 'prerequisite');
    assert.equal(registry.profiles[1].relationshipType, 'extends');
  });
});

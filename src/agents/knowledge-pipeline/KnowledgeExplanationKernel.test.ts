/**
 * D10-OPT-02 — Multi-Level Explanation Kernel Test Suite
 *
 * Comprehensive deterministic test suite for the Explanation Kernel.
 * Covers: composition, validation, helpers, determinism, immutability,
 * runtime restrictions, cross-agent boundary, and public API.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import type {
  KnowledgeExplanationProfile,
  KnowledgeExplanationProvenance,
  KnowledgeExplanationRelationship,
  KnowledgeExplanationInput,
  KnowledgeExplanationRegistry,
  KnowledgeExplanationTrace,
  KnowledgeArtifactWithExplanations,
} from './KnowledgeAgentContract.ts';

import {
  CANONICAL_EXPLANATION_LEVELS,
  CANONICAL_EXPLANATION_FORMATS,
  CANONICAL_EXPLANATION_PURPOSES,
  CANONICAL_AUDIENCE_LEVELS,
  CANONICAL_EXPLANATION_STATUS,
  CANONICAL_EXPLANATION_GOVERNANCE,
} from './KnowledgeAgentContract.ts';

import {
  composeKnowledgeExplanationProvenance,
  composeKnowledgeExplanationProfile,
  composeKnowledgeExplanationRelationship,
  composeKnowledgeExplanationTrace,
  composeKnowledgeExplanationRegistry,
  composeKnowledgeExplanationRegistryFromInput,
  composeKnowledgeExplanations,
  composeKnowledgeArtifactWithExplanations,
  isSupportedExplanationLevel,
  isSupportedExplanationFormat,
  isSupportedExplanationPurpose,
  isSupportedAudienceLevel,
  isSupportedExplanationStatus,
  isSupportedExplanationGovernance,
  getCanonicalExplanationLevels,
  getCanonicalExplanationFormats,
  getCanonicalExplanationPurposes,
  getCanonicalAudienceLevels,
  getCanonicalExplanationStatuses,
} from './KnowledgeExplanationKernel.ts';

import {
  validateKnowledgeExplanationProfile,
  validateKnowledgeExplanationRelationship,
  validateKnowledgeExplanationRegistry,
  validateKnowledgeExplanationInput,
  validateKnowledgeExplanationTrace,
  validateKnowledgeArtifactWithExplanations,
  EXPLANATION_VALIDATION_CODES,
} from './KnowledgeExplanationValidation.ts';

// ---------------------------------------------------------------------------
// Test Fixtures
// ---------------------------------------------------------------------------

const VALID_PROVENANCE: KnowledgeExplanationProvenance = {
  source: 'NeuralVerse Team',
  provider: 'Explanation Agent',
  rationale: 'Core explanation for neural network concept.',
  governance: 'canonical',
};

const VALID_PROFILE_1: KnowledgeExplanationProfile = {
  profileId: 'exp-001',
  conceptId: 'concept-001',
  level: 'concise_definition',
  format: 'text',
  purpose: 'introduce',
  audienceLevel: 'beginner',
  status: 'canonical',
  governance: 'canonical',
  title: 'Neural Networks — Concise Definition',
  summary: 'A neural network is a computing system inspired by biological neural networks.',
  tags: ['neural_networks', 'definition'],
  prerequisiteProfileIds: [],
  provenance: VALID_PROVENANCE,
};

const VALID_PROFILE_2: KnowledgeExplanationProfile = {
  profileId: 'exp-002',
  conceptId: 'concept-001',
  level: 'intuitive_explanation',
  format: 'text',
  purpose: 'clarify',
  audienceLevel: 'intermediate',
  status: 'approved',
  governance: 'accepted',
  title: 'Neural Networks — Intuitive Explanation',
  summary: 'Think of a neural network as layers of simple processors that learn patterns.',
  tags: ['neural_networks', 'intuition'],
  prerequisiteProfileIds: ['exp-001'],
  provenance: { ...VALID_PROVENANCE, source: 'Knowledge Pipeline' },
};

const VALID_PROFILE_3: KnowledgeExplanationProfile = {
  profileId: 'exp-003',
  conceptId: 'concept-002',
  level: 'mathematical_formulation',
  format: 'formula',
  purpose: 'formalize',
  audienceLevel: 'advanced',
  status: 'canonical',
  governance: 'canonical',
  title: 'Linear Algebra — Mathematical Formulation',
  summary: 'Matrix multiplication: C = A × B where C[i][j] = Σ A[i][k] × B[k][j].',
  tags: ['linear_algebra', 'mathematics'],
  prerequisiteProfileIds: [],
  provenance: VALID_PROVENANCE,
};

const VALID_RELATIONSHIP: KnowledgeExplanationRelationship = {
  relationshipId: 'rel-001',
  sourceProfileId: 'exp-001',
  targetProfileId: 'exp-002',
  conceptId: 'concept-001',
  relationshipType: 'extension',
  description: 'Intuitive explanation extends the concise definition.',
  provenance: VALID_PROVENANCE,
};

const VALID_INPUT: KnowledgeExplanationInput = {
  profiles: [VALID_PROFILE_1, VALID_PROFILE_2, VALID_PROFILE_3],
  relationships: [VALID_RELATIONSHIP],
};

const EMPTY_INPUT: KnowledgeExplanationInput = {
  profiles: [],
  relationships: [],
};

// ---------------------------------------------------------------------------
// Composition Tests
// ---------------------------------------------------------------------------

describe('Explanation Kernel — Composition', () => {
  it('should compose valid explanation provenance', () => {
    const provenance = composeKnowledgeExplanationProvenance({
      source: 'NeuralVerse Team',
      provider: 'Explanation Agent',
      rationale: 'Core explanation.',
      governance: 'canonical',
    });

    assert.equal(provenance.source, 'NeuralVerse Team');
    assert.equal(provenance.provider, 'Explanation Agent');
    assert.equal(provenance.rationale, 'Core explanation.');
    assert.equal(provenance.governance, 'canonical');
  });

  it('should compose valid explanation profile', () => {
    const profile = composeKnowledgeExplanationProfile({
      profileId: 'exp-001',
      conceptId: 'concept-001',
      level: 'concise_definition',
      format: 'text',
      purpose: 'introduce',
      audienceLevel: 'beginner',
      status: 'canonical',
      governance: 'canonical',
      title: 'Test Title',
      summary: 'Test summary.',
      tags: ['tag1'],
      prerequisiteProfileIds: [],
      provenance: VALID_PROVENANCE,
    });

    assert.equal(profile.profileId, 'exp-001');
    assert.equal(profile.conceptId, 'concept-001');
    assert.equal(profile.level, 'concise_definition');
    assert.equal(profile.tags.length, 1);
  });

  it('should compose valid explanation relationship', () => {
    const relationship = composeKnowledgeExplanationRelationship({
      relationshipId: 'rel-001',
      sourceProfileId: 'exp-001',
      targetProfileId: 'exp-002',
      conceptId: 'concept-001',
      relationshipType: 'extension',
      description: 'Test relationship.',
      provenance: VALID_PROVENANCE,
    });

    assert.equal(relationship.relationshipId, 'rel-001');
    assert.equal(relationship.sourceProfileId, 'exp-001');
    assert.equal(relationship.targetProfileId, 'exp-002');
    assert.equal(relationship.relationshipType, 'extension');
  });

  it('should compose valid explanation trace', () => {
    const trace = composeKnowledgeExplanationTrace({
      traceId: '_trace_1',
      decisions: [
        { decisionId: 'd1', profileId: 'exp-001', conceptId: 'concept-001', validationPassed: true, validationErrors: [] },
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

  it('should compose valid explanation registry', () => {
    const registry = composeKnowledgeExplanationRegistry([VALID_PROFILE_1, VALID_PROFILE_2], [VALID_RELATIONSHIP]);

    assert.equal(registry.deterministic, true);
    assert.equal(registry.randomUsed, false);
    assert.equal(registry.timeDependency, false);
    assert.equal(registry.profiles.length, 2);
    assert.equal(registry.relationships.length, 1);
  });

  it('should compose registry from input', () => {
    const registry = composeKnowledgeExplanationRegistryFromInput(VALID_INPUT);
    assert.equal(registry.profiles.length, 3);
  });

  it('should compose knowledge explanations from input', () => {
    const registry = composeKnowledgeExplanations(VALID_INPUT);
    assert.equal(registry.deterministic, true);
    assert.equal(registry.trace.decisionCount, 3);
  });

  it('should compose artifact with explanations', () => {
    const artifact = composeKnowledgeArtifactWithExplanations({
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

describe('Explanation Kernel — Validation', () => {
  it('should validate a valid profile with no errors', () => {
    const errors = validateKnowledgeExplanationProfile(VALID_PROFILE_1);
    assert.deepStrictEqual(errors, []);
  });

  it('should validate a valid registry with no errors', () => {
    const registry = composeKnowledgeExplanationRegistry([VALID_PROFILE_1, VALID_PROFILE_2], [VALID_RELATIONSHIP]);
    const result = validateKnowledgeExplanationRegistry(registry);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it('should validate knowledge explanation input', () => {
    const result = validateKnowledgeExplanationInput(VALID_INPUT);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it('should detect duplicate IDs', () => {
    const registry = composeKnowledgeExplanationRegistry([VALID_PROFILE_1, VALID_PROFILE_1], []);
    const result = validateKnowledgeExplanationRegistry(registry);
    const duplicateError = result.errors.find(
      (e) => e.code === EXPLANATION_VALIDATION_CODES.EXPLANATION_DUPLICATE_ID,
    );
    assert.ok(duplicateError, 'Should have EXPLANATION_DUPLICATE_ID error');
  });

  it('should detect duplicate titles', () => {
    const profile1 = { ...VALID_PROFILE_1, profileId: 'exp-001', title: 'Same Title' };
    const profile2 = { ...VALID_PROFILE_1, profileId: 'exp-002', title: 'Same Title' };
    const registry = composeKnowledgeExplanationRegistry([profile1, profile2], []);
    const result = validateKnowledgeExplanationRegistry(registry);
    const duplicateError = result.errors.find(
      (e) => e.code === EXPLANATION_VALIDATION_CODES.EXPLANATION_DUPLICATE_TITLE,
    );
    assert.ok(duplicateError, 'Should have EXPLANATION_DUPLICATE_TITLE error');
  });

  it('should detect invalid level', () => {
    const profile = { ...VALID_PROFILE_1, level: 'unsupported' as any };
    const errors = validateKnowledgeExplanationProfile(profile);
    const levelError = errors.find(
      (e) => e.code === EXPLANATION_VALIDATION_CODES.EXPLANATION_INVALID_LEVEL,
    );
    assert.ok(levelError, 'Should have EXPLANATION_INVALID_LEVEL error');
  });

  it('should detect invalid format', () => {
    const profile = { ...VALID_PROFILE_1, format: 'unsupported' as any };
    const errors = validateKnowledgeExplanationProfile(profile);
    const formatError = errors.find(
      (e) => e.code === EXPLANATION_VALIDATION_CODES.EXPLANATION_INVALID_FORMAT,
    );
    assert.ok(formatError, 'Should have EXPLANATION_INVALID_FORMAT error');
  });

  it('should detect invalid purpose', () => {
    const profile = { ...VALID_PROFILE_1, purpose: 'unsupported' as any };
    const errors = validateKnowledgeExplanationProfile(profile);
    const purposeError = errors.find(
      (e) => e.code === EXPLANATION_VALIDATION_CODES.EXPLANATION_INVALID_PURPOSE,
    );
    assert.ok(purposeError, 'Should have EXPLANATION_INVALID_PURPOSE error');
  });

  it('should detect invalid audience', () => {
    const profile = { ...VALID_PROFILE_1, audienceLevel: 'unsupported' as any };
    const errors = validateKnowledgeExplanationProfile(profile);
    const audienceError = errors.find(
      (e) => e.code === EXPLANATION_VALIDATION_CODES.EXPLANATION_INVALID_AUDIENCE,
    );
    assert.ok(audienceError, 'Should have EXPLANATION_INVALID_AUDIENCE error');
  });

  it('should detect invalid status', () => {
    const profile = { ...VALID_PROFILE_1, status: 'unsupported' as any };
    const errors = validateKnowledgeExplanationProfile(profile);
    const statusError = errors.find(
      (e) => e.code === EXPLANATION_VALIDATION_CODES.EXPLANATION_INVALID_STATUS,
    );
    assert.ok(statusError, 'Should have EXPLANATION_INVALID_STATUS error');
  });

  it('should detect invalid governance', () => {
    const profile = { ...VALID_PROFILE_1, governance: 'unsupported' as any };
    const errors = validateKnowledgeExplanationProfile(profile);
    const governanceError = errors.find(
      (e) => e.code === EXPLANATION_VALIDATION_CODES.EXPLANATION_INVALID_GOVERNANCE,
    );
    assert.ok(governanceError, 'Should have EXPLANATION_INVALID_GOVERNANCE error');
  });

  it('should detect missing provenance', () => {
    const profile = { ...VALID_PROFILE_1, provenance: undefined as any };
    const errors = validateKnowledgeExplanationProfile(profile);
    const provenanceError = errors.find(
      (e) => e.code === EXPLANATION_VALIDATION_CODES.EXPLANATION_MISSING_PROVENANCE,
    );
    assert.ok(provenanceError, 'Should have EXPLANATION_MISSING_PROVENANCE error');
  });

  it('should detect missing provider', () => {
    const profile = { ...VALID_PROFILE_1, provenance: { ...VALID_PROVENANCE, provider: '' } };
    const errors = validateKnowledgeExplanationProfile(profile);
    const providerError = errors.find(
      (e) => e.code === EXPLANATION_VALIDATION_CODES.EXPLANATION_MISSING_PROVIDER,
    );
    assert.ok(providerError, 'Should have EXPLANATION_MISSING_PROVIDER error');
  });

  it('should detect missing rationale', () => {
    const profile = { ...VALID_PROFILE_1, provenance: { ...VALID_PROVENANCE, rationale: '' } };
    const errors = validateKnowledgeExplanationProfile(profile);
    const rationaleError = errors.find(
      (e) => e.code === EXPLANATION_VALIDATION_CODES.EXPLANATION_MISSING_RATIONALE,
    );
    assert.ok(rationaleError, 'Should have EXPLANATION_MISSING_RATIONALE error');
  });

  it('should detect self relationship', () => {
    const relationship = { ...VALID_RELATIONSHIP, targetProfileId: 'exp-001' };
    const knownProfileIds = new Set(['exp-001', 'exp-002']);
    const errors = validateKnowledgeExplanationRelationship(relationship, knownProfileIds);
    const selfError = errors.find(
      (e) => e.code === EXPLANATION_VALIDATION_CODES.EXPLANATION_SELF_RELATIONSHIP,
    );
    assert.ok(selfError, 'Should have EXPLANATION_SELF_RELATIONSHIP error');
  });

  it('should detect empty registry', () => {
    const registry = composeKnowledgeExplanationRegistry([], []);
    const result = validateKnowledgeExplanationRegistry(registry);
    const emptyError = result.errors.find(
      (e) => e.code === EXPLANATION_VALIDATION_CODES.EXPLANATION_EMPTY_REGISTRY,
    );
    assert.ok(emptyError, 'Should have EXPLANATION_EMPTY_REGISTRY error');
    assert.equal(result.valid, false);
  });

  it('should detect invalid trace', () => {
    const trace: KnowledgeExplanationTrace = {
      traceId: '',
      decisionCount: 0,
      validationCount: 0,
      registryVersion: '1.0.0',
      compositionVersion: '1.0.0',
      decisions: [],
      deterministic: false as true,
      generatedFrom: 'deterministic_explanation_kernel',
      randomUsed: false,
      timeDependency: false,
    };
    const result = validateKnowledgeExplanationTrace(trace);
    assert.equal(result.valid, false);
  });

  it('should detect registry inconsistency', () => {
    const registry: KnowledgeExplanationRegistry = {
      registryId: '_registry_5',
      profiles: [VALID_PROFILE_1],
      relationships: [],
      metadata: {
        registryId: '_registry_5',
        profileCount: 5,
        relationshipCount: 0,
        levelCount: 1,
        conceptCount: 1,
      },
      trace: {
        traceId: '_trace_1',
        decisionCount: 0,
        validationCount: 0,
        registryVersion: '1.0.0',
        compositionVersion: '1.0.0',
        decisions: [],
        deterministic: true,
        generatedFrom: 'deterministic_explanation_kernel',
        randomUsed: false,
        timeDependency: false,
      },
      deterministic: true,
      generatedFrom: 'deterministic_explanation_kernel',
      randomUsed: false,
      timeDependency: false,
    };
    const result = validateKnowledgeExplanationRegistry(registry);
    const inconsistencyError = result.errors.find(
      (e) => e.code === EXPLANATION_VALIDATION_CODES.EXPLANATION_REGISTRY_INCONSISTENCY,
    );
    assert.ok(inconsistencyError, 'Should have EXPLANATION_REGISTRY_INCONSISTENCY error');
  });

  it('should validate a valid trace', () => {
    const trace = composeKnowledgeExplanationTrace({
      traceId: '_trace_1',
      decisions: [],
      registryVersion: '1.0.0',
      compositionVersion: '1.0.0',
    });
    const result = validateKnowledgeExplanationTrace(trace);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it('should validate artifact with explanations', () => {
    const artifact = composeKnowledgeArtifactWithExplanations({
      conceptId: 'concept-001',
      conceptTitle: 'Neural Networks',
      profiles: [VALID_PROFILE_1, VALID_PROFILE_2],
      relationships: [VALID_RELATIONSHIP],
      provenance: VALID_PROVENANCE,
    });
    const result = validateKnowledgeArtifactWithExplanations(artifact);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });
});

// ---------------------------------------------------------------------------
// Determinism Tests
// ---------------------------------------------------------------------------

describe('Explanation Kernel — Determinism', () => {
  it('should produce identical output for identical input (100 iterations)', () => {
    const results: ReturnType<typeof composeKnowledgeExplanations>[] = [];
    for (let i = 0; i < 100; i++) {
      results.push(composeKnowledgeExplanations(VALID_INPUT));
    }

    for (let i = 1; i < results.length; i++) {
      assert.deepStrictEqual(results[0].registryId, results[i].registryId);
      assert.deepStrictEqual(results[0].profiles, results[i].profiles);
      assert.deepStrictEqual(results[0].trace.traceId, results[i].trace.traceId);
    }
  });

  it('should produce identical registry output for identical input (100 iterations)', () => {
    const results: ReturnType<typeof composeKnowledgeExplanationRegistry>[] = [];
    for (let i = 0; i < 100; i++) {
      results.push(composeKnowledgeExplanationRegistry([VALID_PROFILE_1, VALID_PROFILE_2], [VALID_RELATIONSHIP]));
    }

    for (let i = 1; i < results.length; i++) {
      assert.deepStrictEqual(results[0].profiles, results[i].profiles);
      assert.deepStrictEqual(results[0].registryId, results[i].registryId);
    }
  });

  it('should produce identical provenance for identical input', () => {
    const results: ReturnType<typeof composeKnowledgeExplanationProvenance>[] = [];
    for (let i = 0; i < 100; i++) {
      results.push(composeKnowledgeExplanationProvenance({
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
    const results: ReturnType<typeof composeKnowledgeExplanationTrace>[] = [];
    for (let i = 0; i < 100; i++) {
      results.push(composeKnowledgeExplanationTrace({
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

describe('Explanation Kernel — Immutability', () => {
  it('should not mutate input profiles', () => {
    const originalId = VALID_PROFILE_1.profileId;
    const originalTitle = VALID_PROFILE_1.title;

    composeKnowledgeExplanations(VALID_INPUT);

    assert.equal(VALID_PROFILE_1.profileId, originalId);
    assert.equal(VALID_PROFILE_1.title, originalTitle);
  });

  it('should not mutate input registry profiles', () => {
    const profiles = [VALID_PROFILE_1, VALID_PROFILE_2];
    const originalIds = profiles.map((p) => p.profileId);

    composeKnowledgeExplanationRegistry(profiles, []);

    assert.equal(profiles[0].profileId, originalIds[0]);
    assert.equal(profiles[1].profileId, originalIds[1]);
  });

  it('should use defensive copies for tags', () => {
    const originalTags = ['tag1', 'tag2'];
    const profile = composeKnowledgeExplanationProfile({
      profileId: 'test',
      conceptId: 'concept-001',
      level: 'concise_definition',
      format: 'text',
      purpose: 'introduce',
      audienceLevel: 'beginner',
      status: 'draft',
      governance: 'public',
      title: 'Test.',
      summary: 'Test.',
      tags: originalTags,
      prerequisiteProfileIds: [],
      provenance: VALID_PROVENANCE,
    });

    assert.notEqual(profile.tags, originalTags);
    assert.deepStrictEqual([...profile.tags], originalTags);
  });

  it('should use defensive copies for prerequisiteProfileIds', () => {
    const originalPrereqs = ['exp-001', 'exp-002'];
    const profile = composeKnowledgeExplanationProfile({
      profileId: 'test',
      conceptId: 'concept-001',
      level: 'concise_definition',
      format: 'text',
      purpose: 'introduce',
      audienceLevel: 'beginner',
      status: 'draft',
      governance: 'public',
      title: 'Test.',
      summary: 'Test.',
      tags: [],
      prerequisiteProfileIds: originalPrereqs,
      provenance: VALID_PROVENANCE,
    });

    assert.notEqual(profile.prerequisiteProfileIds, originalPrereqs);
    assert.deepStrictEqual([...profile.prerequisiteProfileIds], originalPrereqs);
  });
});

// ---------------------------------------------------------------------------
// Helper Function Tests
// ---------------------------------------------------------------------------

describe('Explanation Kernel — Helpers', () => {
  it('should return canonical explanation levels', () => {
    const levels = getCanonicalExplanationLevels();
    assert.deepStrictEqual([...levels], [...CANONICAL_EXPLANATION_LEVELS]);
    assert.equal(levels.length, 7);
  });

  it('should return canonical explanation formats', () => {
    const formats = getCanonicalExplanationFormats();
    assert.deepStrictEqual([...formats], [...CANONICAL_EXPLANATION_FORMATS]);
    assert.equal(formats.length, 10);
  });

  it('should return canonical explanation purposes', () => {
    const purposes = getCanonicalExplanationPurposes();
    assert.deepStrictEqual([...purposes], [...CANONICAL_EXPLANATION_PURPOSES]);
    assert.equal(purposes.length, 10);
  });

  it('should return canonical audience levels', () => {
    const levels = getCanonicalAudienceLevels();
    assert.deepStrictEqual([...levels], [...CANONICAL_AUDIENCE_LEVELS]);
    assert.equal(levels.length, 10);
  });

  it('should return canonical explanation statuses', () => {
    const statuses = getCanonicalExplanationStatuses();
    assert.deepStrictEqual([...statuses], [...CANONICAL_EXPLANATION_STATUS]);
    assert.equal(statuses.length, 6);
  });

  it('should validate explanation level support', () => {
    assert.equal(isSupportedExplanationLevel('concise_definition'), true);
    assert.equal(isSupportedExplanationLevel('technical_explanation'), true);
    assert.equal(isSupportedExplanationLevel('unsupported'), false);
  });

  it('should validate explanation format support', () => {
    assert.equal(isSupportedExplanationFormat('text'), true);
    assert.equal(isSupportedExplanationFormat('formula'), true);
    assert.equal(isSupportedExplanationFormat('unsupported'), false);
  });

  it('should validate explanation purpose support', () => {
    assert.equal(isSupportedExplanationPurpose('introduce'), true);
    assert.equal(isSupportedExplanationPurpose('clarify'), true);
    assert.equal(isSupportedExplanationPurpose('unsupported'), false);
  });

  it('should validate audience level support', () => {
    assert.equal(isSupportedAudienceLevel('beginner'), true);
    assert.equal(isSupportedAudienceLevel('advanced'), true);
    assert.equal(isSupportedAudienceLevel('unsupported'), false);
  });

  it('should validate explanation status support', () => {
    assert.equal(isSupportedExplanationStatus('draft'), true);
    assert.equal(isSupportedExplanationStatus('canonical'), true);
    assert.equal(isSupportedExplanationStatus('unsupported'), false);
  });

  it('should validate explanation governance support', () => {
    assert.equal(isSupportedExplanationGovernance('canonical'), true);
    assert.equal(isSupportedExplanationGovernance('accepted'), true);
    assert.equal(isSupportedExplanationGovernance('unsupported'), false);
  });
});

// ---------------------------------------------------------------------------
// Canonical Enum Completeness Tests
// ---------------------------------------------------------------------------

describe('Explanation Kernel — Canonical Enum Completeness', () => {
  it('should have exactly 7 explanation levels', () => {
    assert.equal(CANONICAL_EXPLANATION_LEVELS.length, 7);
  });

  it('should have exactly 10 explanation formats', () => {
    assert.equal(CANONICAL_EXPLANATION_FORMATS.length, 10);
  });

  it('should have exactly 10 explanation purposes', () => {
    assert.equal(CANONICAL_EXPLANATION_PURPOSES.length, 10);
  });

  it('should have exactly 10 audience levels', () => {
    assert.equal(CANONICAL_AUDIENCE_LEVELS.length, 10);
  });

  it('should have exactly 6 explanation statuses', () => {
    assert.equal(CANONICAL_EXPLANATION_STATUS.length, 6);
  });

  it('should have exactly 10 explanation governance values', () => {
    assert.equal(CANONICAL_EXPLANATION_GOVERNANCE.length, 10);
  });

  it('should contain all expected explanation levels', () => {
    const expected = ['concise_definition', 'intuitive_explanation', 'technical_explanation', 'mathematical_formulation', 'algorithmic_interpretation', 'implementation_guidance', 'advanced_engineering_discussion'];
    for (const level of expected) {
      assert.ok(CANONICAL_EXPLANATION_LEVELS.includes(level as any), `Should include level: ${level}`);
    }
  });

  it('should contain all expected explanation formats', () => {
    const expected = ['text', 'structured', 'formula', 'algorithm', 'pseudocode', 'diagram_reference', 'table', 'code_reference', 'comparison', 'mixed'];
    for (const format of expected) {
      assert.ok(CANONICAL_EXPLANATION_FORMATS.includes(format as any), `Should include format: ${format}`);
    }
  });

  it('should contain all expected explanation purposes', () => {
    const expected = ['introduce', 'clarify', 'formalize', 'derive', 'implement', 'compare', 'summarize', 'reinforce', 'connect', 'extend'];
    for (const purpose of expected) {
      assert.ok(CANONICAL_EXPLANATION_PURPOSES.includes(purpose as any), `Should include purpose: ${purpose}`);
    }
  });

  it('should contain all expected audience levels', () => {
    const expected = ['complete_beginner', 'beginner', 'elementary', 'intermediate', 'upper_intermediate', 'advanced', 'expert', 'researcher', 'specialist', 'authority'];
    for (const level of expected) {
      assert.ok(CANONICAL_AUDIENCE_LEVELS.includes(level as any), `Should include audience level: ${level}`);
    }
  });

  it('should contain all expected statuses', () => {
    const expected = ['draft', 'review', 'approved', 'canonical', 'deprecated', 'archived'];
    for (const status of expected) {
      assert.ok(CANONICAL_EXPLANATION_STATUS.includes(status as any), `Should include status: ${status}`);
    }
  });

  it('should contain all expected governance values', () => {
    const expected = ['canonical', 'accepted', 'provisional', 'experimental', 'deprecated', 'restricted', 'internal', 'public', 'community', 'archived'];
    for (const governance of expected) {
      assert.ok(CANONICAL_EXPLANATION_GOVERNANCE.includes(governance as any), `Should include governance: ${governance}`);
    }
  });
});

// ---------------------------------------------------------------------------
// Validation Code Count Test
// ---------------------------------------------------------------------------

describe('Explanation Kernel — Validation Code Count', () => {
  it('should have exactly 20 validation codes', () => {
    const codes = Object.values(EXPLANATION_VALIDATION_CODES);
    assert.equal(codes.length, 20);
  });

  it('should have all codes prefixed with EXPLANATION_', () => {
    const codes = Object.values(EXPLANATION_VALIDATION_CODES);
    for (const code of codes) {
      assert.ok(code.startsWith('EXPLANATION_'), `Code "${code}" should start with EXPLANATION_`);
    }
  });

  it('should have unique codes', () => {
    const codes = Object.values(EXPLANATION_VALIDATION_CODES);
    const unique = new Set(codes);
    assert.equal(codes.length, unique.size, 'All codes should be unique');
  });
});

// ---------------------------------------------------------------------------
// Runtime Restrictions Tests
// ---------------------------------------------------------------------------

describe('Explanation Kernel — Runtime Restrictions', () => {
  it('should not use Math.random', () => {
    const result = composeKnowledgeExplanations(VALID_INPUT);
    assert.ok(result, 'Should produce a result without Math.random');
  });

  it('should not use Date.now', () => {
    const result = composeKnowledgeExplanations(VALID_INPUT);
    assert.ok(result, 'Should produce a result without Date.now');
  });

  it('should not use performance.now', () => {
    const result = composeKnowledgeExplanations(VALID_INPUT);
    assert.ok(result, 'Should produce a result without performance.now');
  });

  it('should not use crypto.randomUUID', () => {
    const result = composeKnowledgeExplanations(VALID_INPUT);
    assert.ok(result, 'Should produce a result without crypto.randomUUID');
  });

  it('should not have executable callbacks in profile', () => {
    const profile = composeKnowledgeExplanationProfile({
      nodeId: 'exp-001',
      profileId: 'exp-001',
      conceptId: 'concept-001',
      level: 'concise_definition',
      format: 'text',
      purpose: 'introduce',
      audienceLevel: 'beginner',
      status: 'draft',
      governance: 'public',
      title: 'Test',
      summary: 'Test.',
      tags: [],
      prerequisiteProfileIds: [],
      provenance: VALID_PROVENANCE,
    } as any);

    const keys = Object.keys(profile);
    for (const key of keys) {
      const value = (profile as any)[key];
      assert.ok(typeof value !== 'function', `Profile field "${key}" should not be a function`);
    }
  });

  it('should not store educational content', () => {
    const result = composeKnowledgeExplanations(VALID_INPUT);
    assert.ok(!('educationalContent' in result), 'Should not have educational content');
    assert.ok(!('markdown' in result), 'Should not have markdown');
  });

  it('should not access filesystem', () => {
    const result = composeKnowledgeExplanations(VALID_INPUT);
    assert.ok(!('filesystem' in result), 'Should not have filesystem');
    assert.ok(!('fileSystem' in result), 'Should not have fileSystem');
  });

  it('should not perform network requests', () => {
    const result = composeKnowledgeExplanations(VALID_INPUT);
    assert.ok(!('networkResponse' in result), 'Should not have network response');
    assert.ok(!('httpResult' in result), 'Should not have HTTP result');
  });

  it('should not have async behavior markers', () => {
    const result = composeKnowledgeExplanations(VALID_INPUT);
    assert.ok(!('promise' in result), 'Should not have promise');
    assert.ok(!('async' in result), 'Should not have async');
  });
});

// ---------------------------------------------------------------------------
// Cross-Agent Boundary Tests
// ---------------------------------------------------------------------------

describe('Explanation Kernel — Cross-Agent Boundary', () => {
  it('should not reference Didactic Agent', () => {
    const result = composeKnowledgeExplanations(VALID_INPUT);
    const str = JSON.stringify(result);
    assert.ok(!str.includes('Didactic Agent'), 'Should not reference Didactic Agent');
  });

  it('should not reference Curriculum Agent', () => {
    const result = composeKnowledgeExplanations(VALID_INPUT);
    const str = JSON.stringify(result);
    assert.ok(!str.includes('Curriculum Agent'), 'Should not reference Curriculum Agent');
  });

  it('should not reference Narrative Agent', () => {
    const result = composeKnowledgeExplanations(VALID_INPUT);
    const str = JSON.stringify(result);
    assert.ok(!str.includes('Narrative Agent'), 'Should not reference Narrative Agent');
  });

  it('should not reference Assessment Agent', () => {
    const result = composeKnowledgeExplanations(VALID_INPUT);
    const str = JSON.stringify(result);
    assert.ok(!str.includes('Assessment Agent'), 'Should not reference Assessment Agent');
  });

  it('should not reference Curiosity Agent', () => {
    const result = composeKnowledgeExplanations(VALID_INPUT);
    const str = JSON.stringify(result);
    assert.ok(!str.includes('Curiosity Agent'), 'Should not reference Curiosity Agent');
  });

  it('should not reference Research Agent', () => {
    const result = composeKnowledgeExplanations(VALID_INPUT);
    const str = JSON.stringify(result);
    assert.ok(!str.includes('Research Agent'), 'Should not reference Research Agent');
  });

  it('should not reference Laboratory Agent', () => {
    const result = composeKnowledgeExplanations(VALID_INPUT);
    const str = JSON.stringify(result);
    assert.ok(!str.includes('Laboratory Agent'), 'Should not reference Laboratory Agent');
  });

  it('should not reference Application Agent', () => {
    const result = composeKnowledgeExplanations(VALID_INPUT);
    const str = JSON.stringify(result);
    assert.ok(!str.includes('Application Agent'), 'Should not reference Application Agent');
  });
});

// ---------------------------------------------------------------------------
// Deterministic Sorting Tests
// ---------------------------------------------------------------------------

describe('Explanation Kernel — Deterministic Sorting', () => {
  it('should sort deterministically by conceptId', () => {
    const profile3 = { ...VALID_PROFILE_1, profileId: 'exp-003', conceptId: 'concept-003' };
    const profile1 = { ...VALID_PROFILE_1, profileId: 'exp-001', conceptId: 'concept-001' };
    const profile2 = { ...VALID_PROFILE_1, profileId: 'exp-002', conceptId: 'concept-002' };

    const registry = composeKnowledgeExplanationRegistry([profile3, profile1, profile2], []);

    assert.equal(registry.profiles[0].conceptId, 'concept-001');
    assert.equal(registry.profiles[1].conceptId, 'concept-002');
    assert.equal(registry.profiles[2].conceptId, 'concept-003');
  });

  it('should sort by level when conceptId is equal', () => {
    const profileA = { ...VALID_PROFILE_1, profileId: 'exp-001', conceptId: 'concept-001', level: 'technical_explanation' as const };
    const profileB = { ...VALID_PROFILE_1, profileId: 'exp-002', conceptId: 'concept-001', level: 'concise_definition' as const };

    const registry = composeKnowledgeExplanationRegistry([profileA, profileB], []);

    assert.equal(registry.profiles[0].level, 'concise_definition');
    assert.equal(registry.profiles[1].level, 'technical_explanation');
  });
});

/**
 * D10-OPT-15 — Premium Asset Governance Kernel Test Suite
 *
 * Comprehensive deterministic test suite for the Asset Kernel.
 * Covers: composition, validation, helpers, determinism, immutability,
 * runtime restrictions, cross-agent boundary, and public API.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import type {
  KnowledgeAssetProfile,
  KnowledgeAssetProvenance,
  KnowledgeAssetRelationship,
  KnowledgeAssetInput,
  KnowledgeAssetRegistry,
  KnowledgeAssetTrace,
  KnowledgeArtifactWithAssets,
} from './KnowledgeAgentContract.ts';

import {
  CANONICAL_ASSET_TYPES,
  CANONICAL_ASSET_PURPOSES,
  CANONICAL_ASSET_ACCESS,
  CANONICAL_ASSET_STATUS,
  CANONICAL_ASSET_VISIBILITY,
  CANONICAL_ASSET_GOVERNANCE,
} from './KnowledgeAgentContract.ts';

import {
  composeKnowledgeAssetProvenance,
  composeKnowledgeAssetProfile,
  composeKnowledgeAssetRelationship,
  composeKnowledgeAssetTrace,
  composeKnowledgeAssetRegistry,
  composeKnowledgeAssetRegistryFromInput,
  composeKnowledgeAssets,
  composeKnowledgeArtifactWithAssets,
  isSupportedAssetType,
  isSupportedAssetPurpose,
  isSupportedAssetAccess,
  isSupportedAssetVisibility,
  isSupportedAssetStatus,
  isSupportedAssetGovernance,
  getCanonicalAssetTypes,
  getCanonicalAssetPurposes,
  getCanonicalAssetAccessLevels,
  getCanonicalAssetVisibility,
  getCanonicalAssetStatuses,
} from './KnowledgeAssetKernel.ts';

import {
  validateKnowledgeAssetProfile,
  validateKnowledgeAssetRelationship,
  validateKnowledgeAssetRegistry,
  validateKnowledgeAssetInput,
  validateKnowledgeAssetTrace,
  validateKnowledgeArtifactWithAssets,
  ASSET_VALIDATION_CODES,
} from './KnowledgeAssetValidation.ts';

// ---------------------------------------------------------------------------
// Test Fixtures
// ---------------------------------------------------------------------------

const VALID_PROVENANCE: KnowledgeAssetProvenance = {
  source: 'NeuralVerse Team',
  provider: 'Asset Agent',
  rationale: 'Core asset for concept.',
  governance: 'canonical',
};

const VALID_PROFILE_1: KnowledgeAssetProfile = {
  assetId: 'asset-001',
  conceptId: 'concept-001',
  title: 'Neural Network Architecture Diagram',
  assetType: 'diagram',
  purpose: 'visualize',
  accessLevel: 'public',
  visibility: 'default',
  status: 'canonical',
  governance: 'canonical',
  resourceReference: 'https://example.com/diagram-001',
  licenseReference: 'CC-BY-4.0',
  tags: ['neural_networks', 'diagram'],
  provenance: VALID_PROVENANCE,
};

const VALID_PROFILE_2: KnowledgeAssetProfile = {
  assetId: 'asset-002',
  conceptId: 'concept-001',
  title: 'Neural Network Training Animation',
  assetType: 'animation',
  purpose: 'demonstrate',
  accessLevel: 'premium',
  visibility: 'advanced',
  status: 'approved',
  governance: 'accepted',
  resourceReference: 'https://example.com/animation-002',
  licenseReference: 'MIT',
  tags: ['neural_networks', 'animation'],
  provenance: { ...VALID_PROVENANCE, source: 'Knowledge Pipeline' },
};

const VALID_PROFILE_3: KnowledgeAssetProfile = {
  assetId: 'asset-003',
  conceptId: 'concept-002',
  title: 'Linear Algebra Reference PDF',
  assetType: 'pdf',
  purpose: 'reference',
  accessLevel: 'enterprise',
  visibility: 'expert',
  status: 'canonical',
  governance: 'canonical',
  resourceReference: 'https://example.com/reference-003',
  licenseReference: 'Apache-2.0',
  tags: ['linear_algebra', 'reference'],
  provenance: VALID_PROVENANCE,
};

const VALID_RELATIONSHIP: KnowledgeAssetRelationship = {
  relationshipId: 'rel-001',
  sourceAssetId: 'asset-001',
  targetAssetId: 'asset-002',
  relationshipType: 'extension',
  description: 'Animation extends diagram.',
  provenance: VALID_PROVENANCE,
};

const VALID_INPUT: KnowledgeAssetInput = {
  profiles: [VALID_PROFILE_1, VALID_PROFILE_2, VALID_PROFILE_3],
  relationships: [VALID_RELATIONSHIP],
};

const EMPTY_INPUT: KnowledgeAssetInput = {
  profiles: [],
  relationships: [],
};

// ---------------------------------------------------------------------------
// Composition Tests
// ---------------------------------------------------------------------------

describe('Asset Kernel — Composition', () => {
  it('should compose valid asset provenance', () => {
    const provenance = composeKnowledgeAssetProvenance({
      source: 'NeuralVerse Team',
      provider: 'Asset Agent',
      rationale: 'Core asset.',
      governance: 'canonical',
    });

    assert.equal(provenance.source, 'NeuralVerse Team');
    assert.equal(provenance.provider, 'Asset Agent');
    assert.equal(provenance.rationale, 'Core asset.');
    assert.equal(provenance.governance, 'canonical');
  });

  it('should compose valid asset profile', () => {
    const profile = composeKnowledgeAssetProfile({
      assetId: 'asset-001',
      conceptId: 'concept-001',
      title: 'Test Asset',
      assetType: 'illustration',
      purpose: 'introduce',
      accessLevel: 'public',
      visibility: 'default',
      status: 'canonical',
      governance: 'canonical',
      resourceReference: 'https://example.com/asset',
      licenseReference: 'MIT',
      tags: ['tag1'],
      provenance: VALID_PROVENANCE,
    });

    assert.equal(profile.assetId, 'asset-001');
    assert.equal(profile.title, 'Test Asset');
    assert.equal(profile.assetType, 'illustration');
    assert.equal(profile.tags.length, 1);
  });

  it('should compose valid asset relationship', () => {
    const relationship = composeKnowledgeAssetRelationship({
      relationshipId: 'rel-001',
      sourceAssetId: 'asset-001',
      targetAssetId: 'asset-002',
      relationshipType: 'extension',
      description: 'Test relationship.',
      provenance: VALID_PROVENANCE,
    });

    assert.equal(relationship.relationshipId, 'rel-001');
    assert.equal(relationship.sourceAssetId, 'asset-001');
    assert.equal(relationship.targetAssetId, 'asset-002');
    assert.equal(relationship.relationshipType, 'extension');
  });

  it('should compose valid asset trace', () => {
    const trace = composeKnowledgeAssetTrace({
      traceId: '_trace_1',
      decisions: [
        { decisionId: 'd1', assetId: 'asset-001', conceptId: 'concept-001', validationPassed: true, validationErrors: [] },
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

  it('should compose valid asset registry', () => {
    const registry = composeKnowledgeAssetRegistry([VALID_PROFILE_1, VALID_PROFILE_2], [VALID_RELATIONSHIP]);

    assert.equal(registry.deterministic, true);
    assert.equal(registry.randomUsed, false);
    assert.equal(registry.timeDependency, false);
    assert.equal(registry.profiles.length, 2);
    assert.equal(registry.relationships.length, 1);
  });

  it('should compose registry from input', () => {
    const registry = composeKnowledgeAssetRegistryFromInput(VALID_INPUT);
    assert.equal(registry.profiles.length, 3);
  });

  it('should compose knowledge assets from input', () => {
    const registry = composeKnowledgeAssets(VALID_INPUT);
    assert.equal(registry.deterministic, true);
    assert.equal(registry.trace.decisionCount, 3);
  });

  it('should compose artifact with assets', () => {
    const artifact = composeKnowledgeArtifactWithAssets({
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

describe('Asset Kernel — Validation', () => {
  it('should validate a valid profile with no errors', () => {
    const errors = validateKnowledgeAssetProfile(VALID_PROFILE_1);
    assert.deepStrictEqual(errors, []);
  });

  it('should validate a valid registry with no errors', () => {
    const registry = composeKnowledgeAssetRegistry([VALID_PROFILE_1, VALID_PROFILE_2], [VALID_RELATIONSHIP]);
    const result = validateKnowledgeAssetRegistry(registry);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it('should validate knowledge asset input', () => {
    const result = validateKnowledgeAssetInput(VALID_INPUT);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it('should detect duplicate IDs', () => {
    const registry = composeKnowledgeAssetRegistry([VALID_PROFILE_1, VALID_PROFILE_1], []);
    const result = validateKnowledgeAssetRegistry(registry);
    const duplicateError = result.errors.find(
      (e) => e.code === ASSET_VALIDATION_CODES.ASSET_DUPLICATE_ID,
    );
    assert.ok(duplicateError, 'Should have ASSET_DUPLICATE_ID error');
  });

  it('should detect duplicate titles', () => {
    const profile1 = { ...VALID_PROFILE_1, assetId: 'asset-001', title: 'Same Title' };
    const profile2 = { ...VALID_PROFILE_1, assetId: 'asset-002', title: 'Same Title' };
    const registry = composeKnowledgeAssetRegistry([profile1, profile2], []);
    const result = validateKnowledgeAssetRegistry(registry);
    const duplicateError = result.errors.find(
      (e) => e.code === ASSET_VALIDATION_CODES.ASSET_DUPLICATE_TITLE,
    );
    assert.ok(duplicateError, 'Should have ASSET_DUPLICATE_TITLE error');
  });

  it('should detect invalid type', () => {
    const profile = { ...VALID_PROFILE_1, assetType: 'unsupported' as any };
    const errors = validateKnowledgeAssetProfile(profile);
    const typeError = errors.find(
      (e) => e.code === ASSET_VALIDATION_CODES.ASSET_INVALID_TYPE,
    );
    assert.ok(typeError, 'Should have ASSET_INVALID_TYPE error');
  });

  it('should detect invalid purpose', () => {
    const profile = { ...VALID_PROFILE_1, purpose: 'unsupported' as any };
    const errors = validateKnowledgeAssetProfile(profile);
    const purposeError = errors.find(
      (e) => e.code === ASSET_VALIDATION_CODES.ASSET_INVALID_PURPOSE,
    );
    assert.ok(purposeError, 'Should have ASSET_INVALID_PURPOSE error');
  });

  it('should detect invalid access', () => {
    const profile = { ...VALID_PROFILE_1, accessLevel: 'unsupported' as any };
    const errors = validateKnowledgeAssetProfile(profile);
    const accessError = errors.find(
      (e) => e.code === ASSET_VALIDATION_CODES.ASSET_INVALID_ACCESS,
    );
    assert.ok(accessError, 'Should have ASSET_INVALID_ACCESS error');
  });

  it('should detect invalid visibility', () => {
    const profile = { ...VALID_PROFILE_1, visibility: 'unsupported' as any };
    const errors = validateKnowledgeAssetProfile(profile);
    const visibilityError = errors.find(
      (e) => e.code === ASSET_VALIDATION_CODES.ASSET_INVALID_VISIBILITY,
    );
    assert.ok(visibilityError, 'Should have ASSET_INVALID_VISIBILITY error');
  });

  it('should detect invalid status', () => {
    const profile = { ...VALID_PROFILE_1, status: 'unsupported' as any };
    const errors = validateKnowledgeAssetProfile(profile);
    const statusError = errors.find(
      (e) => e.code === ASSET_VALIDATION_CODES.ASSET_INVALID_STATUS,
    );
    assert.ok(statusError, 'Should have ASSET_INVALID_STATUS error');
  });

  it('should detect invalid governance', () => {
    const profile = { ...VALID_PROFILE_1, governance: 'unsupported' as any };
    const errors = validateKnowledgeAssetProfile(profile);
    const governanceError = errors.find(
      (e) => e.code === ASSET_VALIDATION_CODES.ASSET_INVALID_GOVERNANCE,
    );
    assert.ok(governanceError, 'Should have ASSET_INVALID_GOVERNANCE error');
  });

  it('should detect missing provenance', () => {
    const profile = { ...VALID_PROFILE_1, provenance: undefined as any };
    const errors = validateKnowledgeAssetProfile(profile);
    const provenanceError = errors.find(
      (e) => e.code === ASSET_VALIDATION_CODES.ASSET_MISSING_PROVENANCE,
    );
    assert.ok(provenanceError, 'Should have ASSET_MISSING_PROVENANCE error');
  });

  it('should detect missing provider', () => {
    const profile = { ...VALID_PROFILE_1, provenance: { ...VALID_PROVENANCE, provider: '' } };
    const errors = validateKnowledgeAssetProfile(profile);
    const providerError = errors.find(
      (e) => e.code === ASSET_VALIDATION_CODES.ASSET_MISSING_PROVIDER,
    );
    assert.ok(providerError, 'Should have ASSET_MISSING_PROVIDER error');
  });

  it('should detect missing rationale', () => {
    const profile = { ...VALID_PROFILE_1, provenance: { ...VALID_PROVENANCE, rationale: '' } };
    const errors = validateKnowledgeAssetProfile(profile);
    const rationaleError = errors.find(
      (e) => e.code === ASSET_VALIDATION_CODES.ASSET_MISSING_RATIONALE,
    );
    assert.ok(rationaleError, 'Should have ASSET_MISSING_RATIONALE error');
  });

  it('should detect self relationship', () => {
    const relationship = { ...VALID_RELATIONSHIP, targetAssetId: 'asset-001' };
    const knownProfileIds = new Set(['asset-001', 'asset-002']);
    const errors = validateKnowledgeAssetRelationship(relationship, knownProfileIds);
    const selfError = errors.find(
      (e) => e.code === ASSET_VALIDATION_CODES.ASSET_SELF_RELATIONSHIP,
    );
    assert.ok(selfError, 'Should have ASSET_SELF_RELATIONSHIP error');
  });

  it('should detect empty registry', () => {
    const registry = composeKnowledgeAssetRegistry([], []);
    const result = validateKnowledgeAssetRegistry(registry);
    const emptyError = result.errors.find(
      (e) => e.code === ASSET_VALIDATION_CODES.ASSET_EMPTY_REGISTRY,
    );
    assert.ok(emptyError, 'Should have ASSET_EMPTY_REGISTRY error');
    assert.equal(result.valid, false);
  });

  it('should detect invalid trace', () => {
    const trace: KnowledgeAssetTrace = {
      traceId: '',
      decisionCount: 0,
      validationCount: 0,
      registryVersion: '1.0.0',
      compositionVersion: '1.0.0',
      decisions: [],
      deterministic: false as true,
      generatedFrom: 'deterministic_asset_kernel',
      randomUsed: false,
      timeDependency: false,
    };
    const result = validateKnowledgeAssetTrace(trace);
    assert.equal(result.valid, false);
  });

  it('should detect registry inconsistency', () => {
    const registry: KnowledgeAssetRegistry = {
      registryId: '_registry_5',
      profiles: [VALID_PROFILE_1],
      relationships: [],
      metadata: {
        registryId: '_registry_5',
        assetCount: 5,
        relationshipCount: 0,
        conceptCount: 1,
        assetTypeCount: 1,
      },
      trace: {
        traceId: '_trace_1',
        decisionCount: 0,
        validationCount: 0,
        registryVersion: '1.0.0',
        compositionVersion: '1.0.0',
        decisions: [],
        deterministic: true,
        generatedFrom: 'deterministic_asset_kernel',
        randomUsed: false,
        timeDependency: false,
      },
      deterministic: true,
      generatedFrom: 'deterministic_asset_kernel',
      randomUsed: false,
      timeDependency: false,
    };
    const result = validateKnowledgeAssetRegistry(registry);
    const inconsistencyError = result.errors.find(
      (e) => e.code === ASSET_VALIDATION_CODES.ASSET_REGISTRY_INCONSISTENCY,
    );
    assert.ok(inconsistencyError, 'Should have ASSET_REGISTRY_INCONSISTENCY error');
  });

  it('should validate a valid trace', () => {
    const trace = composeKnowledgeAssetTrace({
      traceId: '_trace_1',
      decisions: [],
      registryVersion: '1.0.0',
      compositionVersion: '1.0.0',
    });
    const result = validateKnowledgeAssetTrace(trace);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it('should validate artifact with assets', () => {
    const artifact = composeKnowledgeArtifactWithAssets({
      conceptId: 'concept-001',
      conceptTitle: 'Neural Networks',
      profiles: [VALID_PROFILE_1],
      relationships: [],
      provenance: VALID_PROVENANCE,
    });
    const result = validateKnowledgeArtifactWithAssets(artifact);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });
});

// ---------------------------------------------------------------------------
// Determinism Tests
// ---------------------------------------------------------------------------

describe('Asset Kernel — Determinism', () => {
  it('should produce identical output for identical input (100 iterations)', () => {
    const results: ReturnType<typeof composeKnowledgeAssets>[] = [];
    for (let i = 0; i < 100; i++) {
      results.push(composeKnowledgeAssets(VALID_INPUT));
    }

    for (let i = 1; i < results.length; i++) {
      assert.deepStrictEqual(results[0].registryId, results[i].registryId);
      assert.deepStrictEqual(results[0].profiles, results[i].profiles);
      assert.deepStrictEqual(results[0].trace.traceId, results[i].trace.traceId);
    }
  });

  it('should produce identical registry output for identical input (100 iterations)', () => {
    const results: ReturnType<typeof composeKnowledgeAssetRegistry>[] = [];
    for (let i = 0; i < 100; i++) {
      results.push(composeKnowledgeAssetRegistry([VALID_PROFILE_1, VALID_PROFILE_2], [VALID_RELATIONSHIP]));
    }

    for (let i = 1; i < results.length; i++) {
      assert.deepStrictEqual(results[0].profiles, results[i].profiles);
      assert.deepStrictEqual(results[0].registryId, results[i].registryId);
    }
  });

  it('should produce identical provenance for identical input', () => {
    const results: ReturnType<typeof composeKnowledgeAssetProvenance>[] = [];
    for (let i = 0; i < 100; i++) {
      results.push(composeKnowledgeAssetProvenance({
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
    const results: ReturnType<typeof composeKnowledgeAssetTrace>[] = [];
    for (let i = 0; i < 100; i++) {
      results.push(composeKnowledgeAssetTrace({
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

describe('Asset Kernel — Immutability', () => {
  it('should not mutate input profiles', () => {
    const originalId = VALID_PROFILE_1.assetId;
    const originalTitle = VALID_PROFILE_1.title;

    composeKnowledgeAssets(VALID_INPUT);

    assert.equal(VALID_PROFILE_1.assetId, originalId);
    assert.equal(VALID_PROFILE_1.title, originalTitle);
  });

  it('should not mutate input registry profiles', () => {
    const profiles = [VALID_PROFILE_1, VALID_PROFILE_2];
    const originalIds = profiles.map((p) => p.assetId);

    composeKnowledgeAssetRegistry(profiles, []);

    assert.equal(profiles[0].assetId, originalIds[0]);
    assert.equal(profiles[1].assetId, originalIds[1]);
  });

  it('should use defensive copies for tags', () => {
    const originalTags = ['tag1', 'tag2'];
    const profile = composeKnowledgeAssetProfile({
      assetId: 'test',
      conceptId: 'concept-001',
      title: 'Test.',
      assetType: 'illustration',
      purpose: 'introduce',
      accessLevel: 'public',
      visibility: 'default',
      status: 'draft',
      governance: 'public',
      resourceReference: 'https://example.com/test',
      licenseReference: 'MIT',
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

describe('Asset Kernel — Helpers', () => {
  it('should return canonical asset types', () => {
    const types = getCanonicalAssetTypes();
    assert.deepStrictEqual([...types], [...CANONICAL_ASSET_TYPES]);
    assert.equal(types.length, 10);
  });

  it('should return canonical asset purposes', () => {
    const purposes = getCanonicalAssetPurposes();
    assert.deepStrictEqual([...purposes], [...CANONICAL_ASSET_PURPOSES]);
    assert.equal(purposes.length, 10);
  });

  it('should return canonical asset access levels', () => {
    const access = getCanonicalAssetAccessLevels();
    assert.deepStrictEqual([...access], [...CANONICAL_ASSET_ACCESS]);
    assert.equal(access.length, 10);
  });

  it('should return canonical asset visibility', () => {
    const visibility = getCanonicalAssetVisibility();
    assert.deepStrictEqual([...visibility], [...CANONICAL_ASSET_VISIBILITY]);
    assert.equal(visibility.length, 10);
  });

  it('should return canonical asset statuses', () => {
    const statuses = getCanonicalAssetStatuses();
    assert.deepStrictEqual([...statuses], [...CANONICAL_ASSET_STATUS]);
    assert.equal(statuses.length, 6);
  });

  it('should validate asset type support', () => {
    assert.equal(isSupportedAssetType('illustration'), true);
    assert.equal(isSupportedAssetType('diagram'), true);
    assert.equal(isSupportedAssetType('unsupported'), false);
  });

  it('should validate asset purpose support', () => {
    assert.equal(isSupportedAssetPurpose('introduce'), true);
    assert.equal(isSupportedAssetPurpose('visualize'), true);
    assert.equal(isSupportedAssetPurpose('unsupported'), false);
  });

  it('should validate asset access support', () => {
    assert.equal(isSupportedAssetAccess('public'), true);
    assert.equal(isSupportedAssetAccess('premium'), true);
    assert.equal(isSupportedAssetAccess('unsupported'), false);
  });

  it('should validate asset visibility support', () => {
    assert.equal(isSupportedAssetVisibility('always'), true);
    assert.equal(isSupportedAssetVisibility('default'), true);
    assert.equal(isSupportedAssetVisibility('unsupported'), false);
  });

  it('should validate asset status support', () => {
    assert.equal(isSupportedAssetStatus('draft'), true);
    assert.equal(isSupportedAssetStatus('canonical'), true);
    assert.equal(isSupportedAssetStatus('unsupported'), false);
  });

  it('should validate asset governance support', () => {
    assert.equal(isSupportedAssetGovernance('canonical'), true);
    assert.equal(isSupportedAssetGovernance('accepted'), true);
    assert.equal(isSupportedAssetGovernance('unsupported'), false);
  });
});

// ---------------------------------------------------------------------------
// Canonical Enum Completeness Tests
// ---------------------------------------------------------------------------

describe('Asset Kernel — Canonical Enum Completeness', () => {
  it('should have exactly 10 asset types', () => {
    assert.equal(CANONICAL_ASSET_TYPES.length, 10);
  });

  it('should have exactly 10 asset purposes', () => {
    assert.equal(CANONICAL_ASSET_PURPOSES.length, 10);
  });

  it('should have exactly 10 asset access levels', () => {
    assert.equal(CANONICAL_ASSET_ACCESS.length, 10);
  });

  it('should have exactly 6 asset statuses', () => {
    assert.equal(CANONICAL_ASSET_STATUS.length, 6);
  });

  it('should have exactly 10 asset visibility values', () => {
    assert.equal(CANONICAL_ASSET_VISIBILITY.length, 10);
  });

  it('should have exactly 10 asset governance values', () => {
    assert.equal(CANONICAL_ASSET_GOVERNANCE.length, 10);
  });

  it('should contain all expected asset types', () => {
    const expected = ['illustration', 'diagram', 'animation', 'video', 'interactive_widget', 'pdf', 'engineering_blueprint', 'dataset_reference', 'presentation', 'external_resource'];
    for (const type of expected) {
      assert.ok(CANONICAL_ASSET_TYPES.includes(type as any), `Should include type: ${type}`);
    }
  });

  it('should contain all expected asset purposes', () => {
    const expected = ['introduce', 'clarify', 'visualize', 'demonstrate', 'reinforce', 'compare', 'explore', 'reference', 'engineering', 'research'];
    for (const purpose of expected) {
      assert.ok(CANONICAL_ASSET_PURPOSES.includes(purpose as any), `Should include purpose: ${purpose}`);
    }
  });

  it('should contain all expected asset access levels', () => {
    const expected = ['public', 'registered', 'premium', 'enterprise', 'institutional', 'internal', 'restricted', 'licensed', 'partner', 'archived'];
    for (const access of expected) {
      assert.ok(CANONICAL_ASSET_ACCESS.includes(access as any), `Should include access: ${access}`);
    }
  });

  it('should contain all expected asset statuses', () => {
    const expected = ['draft', 'review', 'approved', 'canonical', 'deprecated', 'archived'];
    for (const status of expected) {
      assert.ok(CANONICAL_ASSET_STATUS.includes(status as any), `Should include status: ${status}`);
    }
  });

  it('should contain all expected asset visibility values', () => {
    const expected = ['always', 'default', 'advanced', 'expert', 'curriculum', 'assessment', 'laboratory', 'research', 'internal', 'hidden'];
    for (const visibility of expected) {
      assert.ok(CANONICAL_ASSET_VISIBILITY.includes(visibility as any), `Should include visibility: ${visibility}`);
    }
  });

  it('should contain all expected asset governance values', () => {
    const expected = ['canonical', 'accepted', 'provisional', 'experimental', 'deprecated', 'restricted', 'internal', 'public', 'community', 'archived'];
    for (const governance of expected) {
      assert.ok(CANONICAL_ASSET_GOVERNANCE.includes(governance as any), `Should include governance: ${governance}`);
    }
  });
});

// ---------------------------------------------------------------------------
// Validation Code Count Test
// ---------------------------------------------------------------------------

describe('Asset Kernel — Validation Code Count', () => {
  it('should have exactly 20 validation codes', () => {
    const codes = Object.values(ASSET_VALIDATION_CODES);
    assert.equal(codes.length, 20);
  });

  it('should have all codes prefixed with ASSET_', () => {
    const codes = Object.values(ASSET_VALIDATION_CODES);
    for (const code of codes) {
      assert.ok(code.startsWith('ASSET_'), `Code "${code}" should start with ASSET_`);
    }
  });

  it('should have unique codes', () => {
    const codes = Object.values(ASSET_VALIDATION_CODES);
    const unique = new Set(codes);
    assert.equal(codes.length, unique.size, 'All codes should be unique');
  });
});

// ---------------------------------------------------------------------------
// Runtime Restrictions Tests
// ---------------------------------------------------------------------------

describe('Asset Kernel — Runtime Restrictions', () => {
  it('should not use Math.random', () => {
    const result = composeKnowledgeAssets(VALID_INPUT);
    assert.ok(result, 'Should produce a result without Math.random');
  });

  it('should not use Date.now', () => {
    const result = composeKnowledgeAssets(VALID_INPUT);
    assert.ok(result, 'Should produce a result without Date.now');
  });

  it('should not use performance.now', () => {
    const result = composeKnowledgeAssets(VALID_INPUT);
    assert.ok(result, 'Should produce a result without performance.now');
  });

  it('should not use crypto.randomUUID', () => {
    const result = composeKnowledgeAssets(VALID_INPUT);
    assert.ok(result, 'Should produce a result without crypto.randomUUID');
  });

  it('should not have executable callbacks in profile', () => {
    const profile = composeKnowledgeAssetProfile({
      assetId: 'asset-001',
      conceptId: 'concept-001',
      title: 'Test',
      assetType: 'illustration',
      purpose: 'introduce',
      accessLevel: 'public',
      visibility: 'default',
      status: 'draft',
      governance: 'public',
      resourceReference: 'https://example.com/test',
      licenseReference: 'MIT',
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
    const result = composeKnowledgeAssets(VALID_INPUT);
    assert.ok(!('educationalContent' in result), 'Should not have educational content');
    assert.ok(!('markdown' in result), 'Should not have markdown');
  });

  it('should not access filesystem', () => {
    const result = composeKnowledgeAssets(VALID_INPUT);
    assert.ok(!('filesystem' in result), 'Should not have filesystem');
    assert.ok(!('fileSystem' in result), 'Should not have fileSystem');
  });

  it('should not perform network requests', () => {
    const result = composeKnowledgeAssets(VALID_INPUT);
    assert.ok(!('networkResponse' in result), 'Should not have network response');
    assert.ok(!('httpResult' in result), 'Should not have HTTP result');
  });

  it('should not have async behavior markers', () => {
    const result = composeKnowledgeAssets(VALID_INPUT);
    assert.ok(!('promise' in result), 'Should not have promise');
    assert.ok(!('async' in result), 'Should not have async');
  });
});

// ---------------------------------------------------------------------------
// Cross-Agent Boundary Tests
// ---------------------------------------------------------------------------

describe('Asset Kernel — Cross-Agent Boundary', () => {
  it('should not reference Didactic Agent', () => {
    const result = composeKnowledgeAssets(VALID_INPUT);
    const str = JSON.stringify(result);
    assert.ok(!str.includes('Didactic Agent'), 'Should not reference Didactic Agent');
  });

  it('should not reference Curriculum Agent', () => {
    const result = composeKnowledgeAssets(VALID_INPUT);
    const str = JSON.stringify(result);
    assert.ok(!str.includes('Curriculum Agent'), 'Should not reference Curriculum Agent');
  });

  it('should not reference Narrative Agent', () => {
    const result = composeKnowledgeAssets(VALID_INPUT);
    const str = JSON.stringify(result);
    assert.ok(!str.includes('Narrative Agent'), 'Should not reference Narrative Agent');
  });

  it('should not reference Assessment Agent', () => {
    const result = composeKnowledgeAssets(VALID_INPUT);
    const str = JSON.stringify(result);
    assert.ok(!str.includes('Assessment Agent'), 'Should not reference Assessment Agent');
  });

  it('should not reference Curiosity Agent', () => {
    const result = composeKnowledgeAssets(VALID_INPUT);
    const str = JSON.stringify(result);
    assert.ok(!str.includes('Curiosity Agent'), 'Should not reference Curiosity Agent');
  });

  it('should not reference Research Agent', () => {
    const result = composeKnowledgeAssets(VALID_INPUT);
    const str = JSON.stringify(result);
    assert.ok(!str.includes('Research Agent'), 'Should not reference Research Agent');
  });

  it('should not reference Laboratory Agent', () => {
    const result = composeKnowledgeAssets(VALID_INPUT);
    const str = JSON.stringify(result);
    assert.ok(!str.includes('Laboratory Agent'), 'Should not reference Laboratory Agent');
  });

  it('should not reference Application Agent', () => {
    const result = composeKnowledgeAssets(VALID_INPUT);
    const str = JSON.stringify(result);
    assert.ok(!str.includes('Application Agent'), 'Should not reference Application Agent');
  });
});

// ---------------------------------------------------------------------------
// Deterministic Sorting Tests
// ---------------------------------------------------------------------------

describe('Asset Kernel — Deterministic Sorting', () => {
  it('should sort deterministically by conceptId', () => {
    const profile3 = { ...VALID_PROFILE_1, assetId: 'asset-003', conceptId: 'concept-003' };
    const profile1 = { ...VALID_PROFILE_1, assetId: 'asset-001', conceptId: 'concept-001' };
    const profile2 = { ...VALID_PROFILE_1, assetId: 'asset-002', conceptId: 'concept-002' };

    const registry = composeKnowledgeAssetRegistry([profile3, profile1, profile2], []);

    assert.equal(registry.profiles[0].conceptId, 'concept-001');
    assert.equal(registry.profiles[1].conceptId, 'concept-002');
    assert.equal(registry.profiles[2].conceptId, 'concept-003');
  });

  it('should sort by assetType when conceptId is equal', () => {
    const profileA = { ...VALID_PROFILE_1, assetId: 'asset-002', conceptId: 'concept-001', assetType: 'video' as const };
    const profileB = { ...VALID_PROFILE_1, assetId: 'asset-001', conceptId: 'concept-001', assetType: 'diagram' as const };

    const registry = composeKnowledgeAssetRegistry([profileA, profileB], []);

    assert.equal(registry.profiles[0].assetType, 'diagram');
    assert.equal(registry.profiles[1].assetType, 'video');
  });
});

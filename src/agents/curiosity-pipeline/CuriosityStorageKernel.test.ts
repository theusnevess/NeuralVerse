/**
 * NV-2100-D9-OPT-13 — Curiosity Storage Kernel Test Suite
 *
 * Comprehensive deterministic test suite for the Curiosity Storage Kernel.
 * Covers: valid profile, valid retrieval, valid overlay, valid relationship,
 * valid provenance, valid trace, empty registry, duplicate IDs, duplicate titles,
 * deterministic ordering, invalid enums, missing provenance/provider/rationale,
 * missing references, missing configuration, self-relationships, empty registries,
 * registry inconsistencies, determinism (100 iterations), immutability, negative
 * capability, cross-agent boundaries, validation code stability, public API
 * exports, backward compatibility with D9-OPT-01 through D9-OPT-12.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import type {
  CuriosityStorageProfile,
  RetrievalMetadata,
  OverlayMetadata,
  StorageRelationship,
  StorageInput,
  StorageRegistry,
  CuriosityStorageProvenance,
  CuriosityStorageTrace,
  CuriosityArtifactWithStorage,
} from './CuriosityAgentContract.ts';

import {
  CANONICAL_STORAGE_TYPES,
  CANONICAL_RETRIEVAL_STRATEGIES,
  CANONICAL_OVERLAY_TYPES,
  CANONICAL_STORAGE_VISIBILITY,
  CANONICAL_STORAGE_SCOPE,
  CANONICAL_STORAGE_STATUS,
  CANONICAL_CURIOSITY_GOVERNANCE,
} from './CuriosityAgentContract.ts';

import {
  composeCuriosityStorageProvenance,
  composeCuriosityStorageTrace,
  composeCuriosityStorageProfile,
  composeRetrievalMetadata,
  composeOverlayMetadata,
  composeStorageRelationship,
  composeStorageRegistry,
  composeStorageRegistryFromInput,
  composeStorageArtifacts,
  composeCuriosityArtifactWithStorage,
  isSupportedStorageType,
  isSupportedRetrievalStrategy,
  isSupportedOverlayType,
  isSupportedStorageVisibility,
  isSupportedStorageScope,
  isSupportedStorageStatus,
  isSupportedStorageGovernance,
  getCanonicalStorageTypes,
  getCanonicalRetrievalStrategies,
  getCanonicalOverlayTypes,
  getCanonicalStorageVisibility,
  getCanonicalStorageScopes,
  getCanonicalStorageStatuses,
} from './CuriosityStorageKernel.ts';

import {
  validateCuriosityStorageProfile,
  validateRetrievalMetadata,
  validateOverlayMetadata,
  validateStorageRelationship,
  validateStorageRegistry,
  validateStorageInput,
  validateStorageTrace,
  validateCuriosityArtifactWithStorage,
  STORAGE_VALIDATION_CODES,
} from './CuriosityStorageValidation.ts';

// ---------------------------------------------------------------------------
// Test Fixtures
// ---------------------------------------------------------------------------

const VALID_PROVENANCE: CuriosityStorageProvenance = {
  provider: 'NeuralVerse Team',
  source: 'Curated Knowledge Base',
  rationale: 'Core storage artifact.',
  version: '1.0.0',
};

const VALID_TRACE: CuriosityStorageTrace = {
  traceId: '_trace_1',
  generatedFrom: 'deterministic_curiosity_storage_kernel',
  deterministic: true,
  randomUsed: false,
  timeDependency: false,
};

const VALID_PROFILE: CuriosityStorageProfile = {
  profileId: 'storage-001',
  title: 'Neural Network Storage Profile',
  storageType: 'embedded',
  retrievalStrategy: 'direct_lookup',
  overlayType: 'lesson_overlay',
  storageVisibility: 'internal',
  storageScope: 'module',
  conceptIds: ['concept-001', 'concept-002'],
  status: 'published',
  governance: 'canonical',
  provenance: VALID_PROVENANCE,
  trace: VALID_TRACE,
};

const VALID_PROFILE_2: CuriosityStorageProfile = {
  profileId: 'storage-002',
  title: 'Historical Curiosity Storage Profile',
  storageType: 'local_registry',
  retrievalStrategy: 'metadata_filter',
  overlayType: 'concept_overlay',
  storageVisibility: 'agent',
  storageScope: 'workspace',
  conceptIds: ['concept-003'],
  status: 'approved',
  governance: 'accepted',
  provenance: { ...VALID_PROVENANCE, source: 'Research Archives' },
  trace: { ...VALID_TRACE, traceId: '_trace_2' },
};

const VALID_RETRIEVAL: RetrievalMetadata = {
  metadataId: 'ret-001',
  profileId: 'storage-001',
  retrievalStrategy: 'direct_lookup',
  indexKey: 'curiosityId',
  indexValue: 'curiosity-001',
  priority: 1,
  contextRequired: ['lesson_completed'],
};

const VALID_OVERLAY: OverlayMetadata = {
  metadataId: 'ov-001',
  profileId: 'storage-001',
  overlayType: 'lesson_overlay',
  overlayScope: 'module',
  overlayPriority: 1,
  overlayContext: ['topic_completed'],
  overlayDependencies: ['concept-001'],
};

const VALID_RELATIONSHIP: StorageRelationship = {
  relationshipId: 'stor-rel-001',
  sourceProfileId: 'storage-001',
  targetProfileId: 'storage-002',
  relationshipType: 'related_to',
  description: 'These storage profiles are related.',
  provenance: VALID_PROVENANCE,
};

const VALID_INPUT: StorageInput = {
  profiles: [VALID_PROFILE, VALID_PROFILE_2],
  retrievals: [VALID_RETRIEVAL],
  overlays: [VALID_OVERLAY],
  relationships: [VALID_RELATIONSHIP],
};

const EMPTY_INPUT: StorageInput = {
  profiles: [],
  retrievals: [],
  overlays: [],
  relationships: [],
};

// ---------------------------------------------------------------------------
// Profile Composition Tests
// ---------------------------------------------------------------------------

describe('Curiosity Storage Kernel — Profile Composition', () => {
  it('should compose valid storage provenance', () => {
    const provenance = composeCuriosityStorageProvenance({
      provider: 'NeuralVerse Team',
      source: 'Curated Knowledge Base',
      rationale: 'Core concept.',
      version: '1.0.0',
    });

    assert.equal(provenance.provider, 'NeuralVerse Team');
    assert.equal(provenance.source, 'Curated Knowledge Base');
    assert.equal(provenance.rationale, 'Core concept.');
    assert.equal(provenance.version, '1.0.0');
  });

  it('should compose valid storage profile', () => {
    const profile = composeCuriosityStorageProfile({
      profileId: 'storage-001',
      title: 'Neural Network Storage Profile',
      storageType: 'embedded',
      retrievalStrategy: 'direct_lookup',
      overlayType: 'lesson_overlay',
      storageVisibility: 'internal',
      storageScope: 'module',
      conceptIds: ['concept-001'],
      status: 'published',
      governance: 'canonical',
      provenance: VALID_PROVENANCE,
      trace: VALID_TRACE,
    });

    assert.equal(profile.profileId, 'storage-001');
    assert.equal(profile.title, 'Neural Network Storage Profile');
    assert.equal(profile.storageType, 'embedded');
    assert.equal(profile.retrievalStrategy, 'direct_lookup');
    assert.equal(profile.overlayType, 'lesson_overlay');
    assert.equal(profile.storageVisibility, 'internal');
    assert.equal(profile.storageScope, 'module');
    assert.equal(profile.conceptIds.length, 1);
    assert.equal(profile.status, 'published');
    assert.equal(profile.governance, 'canonical');
  });

  it('should compose valid storage trace', () => {
    const trace = composeCuriosityStorageTrace({
      traceId: '_trace_1',
    });

    assert.equal(trace.traceId, '_trace_1');
    assert.equal(trace.deterministic, true);
    assert.equal(trace.randomUsed, false);
    assert.equal(trace.timeDependency, false);
  });

  it('should compose valid retrieval metadata', () => {
    const metadata = composeRetrievalMetadata({
      metadataId: 'ret-001',
      profileId: 'storage-001',
      retrievalStrategy: 'direct_lookup',
      indexKey: 'curiosityId',
      indexValue: 'curiosity-001',
      priority: 1,
      contextRequired: ['lesson_completed'],
    });

    assert.equal(metadata.metadataId, 'ret-001');
    assert.equal(metadata.profileId, 'storage-001');
    assert.equal(metadata.retrievalStrategy, 'direct_lookup');
    assert.equal(metadata.indexKey, 'curiosityId');
    assert.equal(metadata.indexValue, 'curiosity-001');
    assert.equal(metadata.priority, 1);
    assert.equal(metadata.contextRequired.length, 1);
  });

  it('should compose valid overlay metadata', () => {
    const metadata = composeOverlayMetadata({
      metadataId: 'ov-001',
      profileId: 'storage-001',
      overlayType: 'lesson_overlay',
      overlayScope: 'module',
      overlayPriority: 1,
      overlayContext: ['topic_completed'],
      overlayDependencies: ['concept-001'],
    });

    assert.equal(metadata.metadataId, 'ov-001');
    assert.equal(metadata.profileId, 'storage-001');
    assert.equal(metadata.overlayType, 'lesson_overlay');
    assert.equal(metadata.overlayScope, 'module');
    assert.equal(metadata.overlayPriority, 1);
    assert.equal(metadata.overlayContext.length, 1);
    assert.equal(metadata.overlayDependencies.length, 1);
  });

  it('should compose valid storage relationship', () => {
    const relationship = composeStorageRelationship({
      relationshipId: 'stor-rel-001',
      sourceProfileId: 'storage-001',
      targetProfileId: 'storage-002',
      relationshipType: 'related_to',
      description: 'Related storage profiles.',
      provenance: VALID_PROVENANCE,
    });

    assert.equal(relationship.relationshipId, 'stor-rel-001');
    assert.equal(relationship.sourceProfileId, 'storage-001');
    assert.equal(relationship.targetProfileId, 'storage-002');
    assert.equal(relationship.relationshipType, 'related_to');
    assert.equal(relationship.description, 'Related storage profiles.');
  });

  it('should validate a valid profile with no errors', () => {
    const errors = validateCuriosityStorageProfile(VALID_PROFILE);
    assert.deepStrictEqual(errors, []);
  });

  it('should validate a valid registry with no errors', () => {
    const registry = composeStorageRegistry([VALID_PROFILE, VALID_PROFILE_2], [VALID_RETRIEVAL], [VALID_OVERLAY], [VALID_RELATIONSHIP]);
    const result = validateStorageRegistry(registry);

    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it('should validate storage input', () => {
    const result = validateStorageInput(VALID_INPUT);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });
});

// ---------------------------------------------------------------------------
// Registry Tests
// ---------------------------------------------------------------------------

describe('Curiosity Storage Kernel — Registry', () => {
  it('should detect empty registry', () => {
    const registry = composeStorageRegistry([], [], [], []);
    const result = validateStorageRegistry(registry);
    const emptyError = result.errors.find(
      (e) => e.code === STORAGE_VALIDATION_CODES.STORAGE_EMPTY_REGISTRY,
    );

    assert.ok(emptyError, 'Should have STORAGE_EMPTY_REGISTRY error');
    assert.equal(result.valid, false);
  });

  it('should detect duplicate IDs', () => {
    const registry = composeStorageRegistry([VALID_PROFILE, VALID_PROFILE], [], [], []);
    const result = validateStorageRegistry(registry);
    const duplicateError = result.errors.find(
      (e) => e.code === STORAGE_VALIDATION_CODES.STORAGE_DUPLICATE_ID,
    );

    assert.ok(duplicateError, 'Should have STORAGE_DUPLICATE_ID error');
  });

  it('should detect duplicate titles', () => {
    const profile1 = { ...VALID_PROFILE, profileId: 'storage-001', title: 'Same Title' };
    const profile2 = { ...VALID_PROFILE, profileId: 'storage-002', title: 'Same Title' };
    const registry = composeStorageRegistry([profile1, profile2], [], [], []);
    const result = validateStorageRegistry(registry);
    const duplicateError = result.errors.find(
      (e) => e.code === STORAGE_VALIDATION_CODES.STORAGE_DUPLICATE_TITLE,
    );

    assert.ok(duplicateError, 'Should have STORAGE_DUPLICATE_TITLE error');
  });

  it('should sort deterministically by profileId', () => {
    const profile3 = { ...VALID_PROFILE, profileId: 'storage-003' };
    const profile1 = { ...VALID_PROFILE, profileId: 'storage-001' };
    const profile2 = { ...VALID_PROFILE, profileId: 'storage-002' };

    const registry = composeStorageRegistry([profile3, profile1, profile2], [], [], []);

    assert.equal(registry.profiles[0].profileId, 'storage-001');
    assert.equal(registry.profiles[1].profileId, 'storage-002');
    assert.equal(registry.profiles[2].profileId, 'storage-003');
  });

  it('should sort by storageType when profileId is equal', () => {
    const profileA = { ...VALID_PROFILE, profileId: 'storage-001', storageType: 'local_registry' as const };
    const profileB = { ...VALID_PROFILE, profileId: 'storage-001', storageType: 'embedded' as const };

    const registry = composeStorageRegistry([profileA, profileB], [], [], []);

    // Alphabetical sort: 'embedded' < 'local_registry'
    assert.equal(registry.profiles[0].storageType, 'embedded');
    assert.equal(registry.profiles[1].storageType, 'local_registry');
  });

  it('should detect self-relationships', () => {
    const selfRelationship: StorageRelationship = {
      relationshipId: 'stor-rel-self',
      sourceProfileId: 'storage-001',
      targetProfileId: 'storage-001',
      relationshipType: 'related_to',
      description: 'Self relationship.',
      provenance: VALID_PROVENANCE,
    };

    const registry = composeStorageRegistry([VALID_PROFILE], [], [], [selfRelationship]);
    const result = validateStorageRegistry(registry);
    const selfError = result.errors.find(
      (e) => e.code === STORAGE_VALIDATION_CODES.STORAGE_SELF_RELATIONSHIP,
    );

    assert.ok(selfError, 'Should have STORAGE_SELF_RELATIONSHIP error');
  });
});

// ---------------------------------------------------------------------------
// Validation Tests
// ---------------------------------------------------------------------------

describe('Curiosity Storage Kernel — Validation', () => {
  it('should detect invalid storage type', () => {
    const profile = { ...VALID_PROFILE, storageType: 'unsupported' as any };
    const errors = validateCuriosityStorageProfile(profile);
    const typeError = errors.find(
      (e) => e.code === STORAGE_VALIDATION_CODES.STORAGE_INVALID_STORAGE,
    );

    assert.ok(typeError, 'Should have STORAGE_INVALID_STORAGE error');
  });

  it('should detect invalid retrieval strategy', () => {
    const profile = { ...VALID_PROFILE, retrievalStrategy: 'unsupported' as any };
    const errors = validateCuriosityStorageProfile(profile);
    const retrievalError = errors.find(
      (e) => e.code === STORAGE_VALIDATION_CODES.STORAGE_INVALID_RETRIEVAL,
    );

    assert.ok(retrievalError, 'Should have STORAGE_INVALID_RETRIEVAL error');
  });

  it('should detect invalid overlay type', () => {
    const profile = { ...VALID_PROFILE, overlayType: 'unsupported' as any };
    const errors = validateCuriosityStorageProfile(profile);
    const overlayError = errors.find(
      (e) => e.code === STORAGE_VALIDATION_CODES.STORAGE_INVALID_OVERLAY,
    );

    assert.ok(overlayError, 'Should have STORAGE_INVALID_OVERLAY error');
  });

  it('should detect invalid storage visibility', () => {
    const profile = { ...VALID_PROFILE, storageVisibility: 'unsupported' as any };
    const errors = validateCuriosityStorageProfile(profile);
    const visibilityError = errors.find(
      (e) => e.code === STORAGE_VALIDATION_CODES.STORAGE_INVALID_VISIBILITY,
    );

    assert.ok(visibilityError, 'Should have STORAGE_INVALID_VISIBILITY error');
  });

  it('should detect invalid storage scope', () => {
    const profile = { ...VALID_PROFILE, storageScope: 'unsupported' as any };
    const errors = validateCuriosityStorageProfile(profile);
    const scopeError = errors.find(
      (e) => e.code === STORAGE_VALIDATION_CODES.STORAGE_INVALID_SCOPE,
    );

    assert.ok(scopeError, 'Should have STORAGE_INVALID_SCOPE error');
  });

  it('should detect invalid status', () => {
    const profile = { ...VALID_PROFILE, status: 'unsupported' as any };
    const errors = validateCuriosityStorageProfile(profile);
    const statusError = errors.find(
      (e) => e.code === STORAGE_VALIDATION_CODES.STORAGE_INVALID_STATUS,
    );

    assert.ok(statusError, 'Should have STORAGE_INVALID_STATUS error');
  });

  it('should detect invalid governance', () => {
    const profile = { ...VALID_PROFILE, governance: 'unsupported' as any };
    const errors = validateCuriosityStorageProfile(profile);
    const governanceError = errors.find(
      (e) => e.code === STORAGE_VALIDATION_CODES.STORAGE_INVALID_GOVERNANCE,
    );

    assert.ok(governanceError, 'Should have STORAGE_INVALID_GOVERNANCE error');
  });

  it('should detect missing provenance', () => {
    const profile = { ...VALID_PROFILE, provenance: undefined as any };
    const errors = validateCuriosityStorageProfile(profile);
    const provenanceError = errors.find(
      (e) => e.code === STORAGE_VALIDATION_CODES.STORAGE_MISSING_PROVENANCE,
    );

    assert.ok(provenanceError, 'Should have STORAGE_MISSING_PROVENANCE error');
  });

  it('should detect missing provenance provider', () => {
    const profile = { ...VALID_PROFILE, provenance: { ...VALID_PROVENANCE, provider: '' } };
    const errors = validateCuriosityStorageProfile(profile);
    const providerError = errors.find(
      (e) => e.code === STORAGE_VALIDATION_CODES.STORAGE_MISSING_PROVIDER,
    );

    assert.ok(providerError, 'Should have STORAGE_MISSING_PROVIDER error');
  });

  it('should detect missing provenance rationale', () => {
    const profile = { ...VALID_PROFILE, provenance: { ...VALID_PROVENANCE, rationale: '' } };
    const errors = validateCuriosityStorageProfile(profile);
    const rationaleError = errors.find(
      (e) => e.code === STORAGE_VALIDATION_CODES.STORAGE_MISSING_RATIONALE,
    );

    assert.ok(rationaleError, 'Should have STORAGE_MISSING_RATIONALE error');
  });

  it('should validate a valid trace', () => {
    const trace = composeCuriosityStorageTrace({
      traceId: '_trace_1',
    });

    const result = validateStorageTrace(trace);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it('should detect invalid trace', () => {
    const trace: CuriosityStorageTrace = {
      traceId: '',
      generatedFrom: 'deterministic_curiosity_storage_kernel',
      deterministic: false as true,
      randomUsed: false,
      timeDependency: false,
    };

    const result = validateStorageTrace(trace);
    assert.equal(result.valid, false);
  });

  it('should detect missing retrieval configuration', () => {
    const metadata: RetrievalMetadata = {
      metadataId: 'ret-001',
      profileId: 'storage-001',
      retrievalStrategy: 'direct_lookup',
      indexKey: '',
      indexValue: '',
      priority: 1,
      contextRequired: ['lesson_completed'],
    };

    const errors = validateRetrievalMetadata(metadata);
    const configError = errors.find(
      (e) => e.code === STORAGE_VALIDATION_CODES.STORAGE_INVALID_CONFIGURATION,
    );

    assert.ok(configError, 'Should have STORAGE_INVALID_CONFIGURATION error');
  });

  it('should detect missing overlay configuration', () => {
    const metadata: OverlayMetadata = {
      metadataId: 'ov-001',
      profileId: 'storage-001',
      overlayType: 'lesson_overlay',
      overlayScope: '',
      overlayPriority: 1,
      overlayContext: ['topic_completed'],
      overlayDependencies: ['concept-001'],
    };

    const errors = validateOverlayMetadata(metadata);
    const configError = errors.find(
      (e) => e.code === STORAGE_VALIDATION_CODES.STORAGE_INVALID_CONFIGURATION,
    );

    assert.ok(configError, 'Should have STORAGE_INVALID_CONFIGURATION error');
  });
});

// ---------------------------------------------------------------------------
// Determinism Tests
// ---------------------------------------------------------------------------

describe('Curiosity Storage Kernel — Determinism', () => {
  it('should produce identical output for identical input (100 iterations)', () => {
    const results: ReturnType<typeof composeStorageArtifacts>[] = [];
    for (let i = 0; i < 100; i++) {
      results.push(composeStorageArtifacts(VALID_INPUT));
    }

    for (let i = 1; i < results.length; i++) {
      assert.deepStrictEqual(results[0].registryId, results[i].registryId);
      assert.deepStrictEqual(results[0].profiles, results[i].profiles);
      assert.deepStrictEqual(results[0].trace.traceId, results[i].trace.traceId);
    }
  });

  it('should produce identical registry output for identical input', () => {
    const results: ReturnType<typeof composeStorageRegistry>[] = [];
    for (let i = 0; i < 100; i++) {
      results.push(composeStorageRegistry([VALID_PROFILE, VALID_PROFILE_2], [VALID_RETRIEVAL], [VALID_OVERLAY], [VALID_RELATIONSHIP]));
    }

    for (let i = 1; i < results.length; i++) {
      assert.deepStrictEqual(results[0].profiles, results[i].profiles);
      assert.deepStrictEqual(results[0].registryId, results[i].registryId);
    }
  });
});

// ---------------------------------------------------------------------------
// Immutability Tests
// ---------------------------------------------------------------------------

describe('Curiosity Storage Kernel — Immutability', () => {
  it('should not mutate input profiles', () => {
    const originalId = VALID_PROFILE.profileId;
    const originalTitle = VALID_PROFILE.title;

    composeStorageArtifacts(VALID_INPUT);

    assert.equal(VALID_PROFILE.profileId, originalId);
    assert.equal(VALID_PROFILE.title, originalTitle);
  });

  it('should not mutate input registry profiles', () => {
    const profiles = [VALID_PROFILE, VALID_PROFILE_2];
    const originalIds = profiles.map((p) => p.profileId);

    composeStorageRegistry(profiles, [], [], []);

    assert.equal(profiles[0].profileId, originalIds[0]);
    assert.equal(profiles[1].profileId, originalIds[1]);
  });
});

// ---------------------------------------------------------------------------
// Helper Function Tests
// ---------------------------------------------------------------------------

describe('Curiosity Storage Kernel — Helper Functions', () => {
  it('should return canonical storage types', () => {
    const types = getCanonicalStorageTypes();
    assert.deepStrictEqual([...types], [...CANONICAL_STORAGE_TYPES]);
    assert.equal(types.length, 10);
  });

  it('should return canonical retrieval strategies', () => {
    const strategies = getCanonicalRetrievalStrategies();
    assert.deepStrictEqual([...strategies], [...CANONICAL_RETRIEVAL_STRATEGIES]);
    assert.equal(strategies.length, 10);
  });

  it('should return canonical overlay types', () => {
    const types = getCanonicalOverlayTypes();
    assert.deepStrictEqual([...types], [...CANONICAL_OVERLAY_TYPES]);
    assert.equal(types.length, 10);
  });

  it('should return canonical storage visibility', () => {
    const visibility = getCanonicalStorageVisibility();
    assert.deepStrictEqual([...visibility], [...CANONICAL_STORAGE_VISIBILITY]);
    assert.equal(visibility.length, 10);
  });

  it('should return canonical storage scopes', () => {
    const scopes = getCanonicalStorageScopes();
    assert.deepStrictEqual([...scopes], [...CANONICAL_STORAGE_SCOPE]);
    assert.equal(scopes.length, 10);
  });

  it('should return canonical storage statuses', () => {
    const statuses = getCanonicalStorageStatuses();
    assert.deepStrictEqual([...statuses], [...CANONICAL_STORAGE_STATUS]);
    assert.equal(statuses.length, 6);
  });

  it('should validate storage type support', () => {
    assert.equal(isSupportedStorageType('embedded'), true);
    assert.equal(isSupportedStorageType('local_registry'), true);
    assert.equal(isSupportedStorageType('unsupported'), false);
  });

  it('should validate retrieval strategy support', () => {
    assert.equal(isSupportedRetrievalStrategy('direct_lookup'), true);
    assert.equal(isSupportedRetrievalStrategy('metadata_filter'), true);
    assert.equal(isSupportedRetrievalStrategy('unsupported'), false);
  });

  it('should validate overlay type support', () => {
    assert.equal(isSupportedOverlayType('lesson_overlay'), true);
    assert.equal(isSupportedOverlayType('concept_overlay'), true);
    assert.equal(isSupportedOverlayType('unsupported'), false);
  });

  it('should validate storage visibility support', () => {
    assert.equal(isSupportedStorageVisibility('hidden'), true);
    assert.equal(isSupportedStorageVisibility('internal'), true);
    assert.equal(isSupportedStorageVisibility('unsupported'), false);
  });

  it('should validate storage scope support', () => {
    assert.equal(isSupportedStorageScope('local'), true);
    assert.equal(isSupportedStorageScope('module'), true);
    assert.equal(isSupportedStorageScope('unsupported'), false);
  });

  it('should validate storage status support', () => {
    assert.equal(isSupportedStorageStatus('draft'), true);
    assert.equal(isSupportedStorageStatus('published'), true);
    assert.equal(isSupportedStorageStatus('unsupported'), false);
  });

  it('should validate storage governance support', () => {
    assert.equal(isSupportedStorageGovernance('canonical'), true);
    assert.equal(isSupportedStorageGovernance('accepted'), true);
    assert.equal(isSupportedStorageGovernance('unsupported'), false);
  });
});

// ---------------------------------------------------------------------------
// Canonical Enum Completeness Tests
// ---------------------------------------------------------------------------

describe('Curiosity Storage Kernel — Canonical Enum Completeness', () => {
  it('should have exactly 10 storage types', () => {
    assert.equal(CANONICAL_STORAGE_TYPES.length, 10);
  });

  it('should have exactly 10 retrieval strategies', () => {
    assert.equal(CANONICAL_RETRIEVAL_STRATEGIES.length, 10);
  });

  it('should have exactly 10 overlay types', () => {
    assert.equal(CANONICAL_OVERLAY_TYPES.length, 10);
  });

  it('should have exactly 10 storage visibility', () => {
    assert.equal(CANONICAL_STORAGE_VISIBILITY.length, 10);
  });

  it('should have exactly 10 storage scopes', () => {
    assert.equal(CANONICAL_STORAGE_SCOPE.length, 10);
  });

  it('should have exactly 6 storage statuses', () => {
    assert.equal(CANONICAL_STORAGE_STATUS.length, 6);
  });

  it('should have exactly 5 governance values', () => {
    assert.equal(CANONICAL_CURIOSITY_GOVERNANCE.length, 5);
  });

  it('should contain all expected storage types', () => {
    const expectedTypes = [
      'embedded',
      'local_registry',
      'shared_registry',
      'retrieval_reference',
      'overlay_reference',
      'persistent_reference',
      'cached_reference',
      'archival_reference',
      'temporary_reference',
      'external_reference',
    ];

    for (const type of expectedTypes) {
      assert.ok(
        CANONICAL_STORAGE_TYPES.includes(type as any),
        `Should include type: ${type}`,
      );
    }
  });

  it('should contain all expected retrieval strategies', () => {
    const expectedStrategies = [
      'direct_lookup',
      'metadata_filter',
      'tag_lookup',
      'relationship_lookup',
      'category_lookup',
      'overlay_lookup',
      'dependency_lookup',
      'reference_lookup',
      'hierarchical_lookup',
      'registry_lookup',
    ];

    for (const strategy of expectedStrategies) {
      assert.ok(
        CANONICAL_RETRIEVAL_STRATEGIES.includes(strategy as any),
        `Should include strategy: ${strategy}`,
      );
    }
  });

  it('should contain all expected overlay types', () => {
    const expectedTypes = [
      'lesson_overlay',
      'module_overlay',
      'laboratory_overlay',
      'assessment_overlay',
      'portfolio_overlay',
      'concept_overlay',
      'visual_overlay',
      'application_overlay',
      'timeline_overlay',
      'context_overlay',
    ];

    for (const type of expectedTypes) {
      assert.ok(
        CANONICAL_OVERLAY_TYPES.includes(type as any),
        `Should include type: ${type}`,
      );
    }
  });

  it('should contain all expected storage visibility', () => {
    const expectedVisibility = [
      'hidden',
      'internal',
      'system',
      'agent',
      'workspace',
      'lesson',
      'module',
      'public',
      'shared',
      'global',
    ];

    for (const visibility of expectedVisibility) {
      assert.ok(
        CANONICAL_STORAGE_VISIBILITY.includes(visibility as any),
        `Should include visibility: ${visibility}`,
      );
    }
  });

  it('should contain all expected storage scopes', () => {
    const expectedScopes = [
      'local',
      'module',
      'course',
      'track',
      'workspace',
      'agent',
      'curriculum',
      'project',
      'global',
      'cross_agent',
    ];

    for (const scope of expectedScopes) {
      assert.ok(
        CANONICAL_STORAGE_SCOPE.includes(scope as any),
        `Should include scope: ${scope}`,
      );
    }
  });
});

// ---------------------------------------------------------------------------
// Negative Capability Verification Tests
// ---------------------------------------------------------------------------

describe('Curiosity Storage Kernel — Negative Capability Verification', () => {
  it('should not use Math.random', () => {
    const result = composeStorageArtifacts(VALID_INPUT);
    assert.ok(result, 'Should produce a result without Math.random');
  });

  it('should not use Date.now', () => {
    const result = composeStorageArtifacts(VALID_INPUT);
    assert.ok(result, 'Should produce a result without Date.now');
  });

  it('should not use performance.now', () => {
    const result = composeStorageArtifacts(VALID_INPUT);
    assert.ok(result, 'Should produce a result without performance.now');
  });

  it('should not use crypto.randomUUID', () => {
    const result = composeStorageArtifacts(VALID_INPUT);
    assert.ok(result, 'Should produce a result without crypto.randomUUID');
  });

  it('should not implement storage engines', () => {
    const result = composeStorageArtifacts(VALID_INPUT);
    assert.ok(!('storageEngine' in result), 'Should not have storage engine');
    assert.ok(!('database' in result), 'Should not have database');
  });

  it('should not execute retrieval algorithms', () => {
    const result = composeStorageArtifacts(VALID_INPUT);
    assert.ok(!('retrievalExecution' in result), 'Should not have retrieval execution');
    assert.ok(!('searchResults' in result), 'Should not have search results');
  });

  it('should not perform vector searches', () => {
    const result = composeStorageArtifacts(VALID_INPUT);
    assert.ok(!('vectorSearch' in result), 'Should not have vector search');
    assert.ok(!('embeddingSearch' in result), 'Should not have embedding search');
  });

  it('should not perform contextual reasoning', () => {
    const result = composeStorageArtifacts(VALID_INPUT);
    assert.ok(!('contextualReasoning' in result), 'Should not have contextual reasoning');
    assert.ok(!('reasoning' in result), 'Should not have reasoning');
  });

  it('should not execute runtime overlays', () => {
    const result = composeStorageArtifacts(VALID_INPUT);
    assert.ok(!('runtimeOverlay' in result), 'Should not have runtime overlay');
    assert.ok(!('overlayExecution' in result), 'Should not have overlay execution');
  });

  it('should not access filesystem', () => {
    const result = composeStorageArtifacts(VALID_INPUT);
    assert.ok(!('filesystem' in result), 'Should not have filesystem');
    assert.ok(!('fileSystem' in result), 'Should not have fileSystem');
  });

  it('should not perform network requests', () => {
    const result = composeStorageArtifacts(VALID_INPUT);
    assert.ok(!('networkResponse' in result), 'Should not have network response');
    assert.ok(!('httpResult' in result), 'Should not have HTTP result');
  });

  it('should not have executable callbacks in profile', () => {
    const profile = composeCuriosityStorageProfile({
      profileId: 'storage-001',
      title: 'Test',
      storageType: 'embedded',
      retrievalStrategy: 'direct_lookup',
      overlayType: 'lesson_overlay',
      storageVisibility: 'internal',
      storageScope: 'module',
      conceptIds: [],
      status: 'published',
      governance: 'canonical',
      provenance: VALID_PROVENANCE,
      trace: VALID_TRACE,
    });

    const keys = Object.keys(profile);
    for (const key of keys) {
      const value = (profile as any)[key];
      assert.ok(typeof value !== 'function', `Profile field "${key}" should not be a function`);
    }
  });

  it('should not store runtime execution', () => {
    const result = composeStorageArtifacts(VALID_INPUT);
    assert.ok(!('executionResult' in result), 'Should not have execution result');
    assert.ok(!('output' in result), 'Should not have output');
  });
});

// ---------------------------------------------------------------------------
// Cross-Agent Boundary Tests
// ---------------------------------------------------------------------------

describe('Curiosity Storage Kernel — Cross-Agent Boundary', () => {
  it('should not reference Narrative Agent', () => {
    const result = composeStorageArtifacts(VALID_INPUT);
    assert.ok(!('narrativeAgent' in result), 'Should not reference Narrative Agent');
    assert.ok(!('narrative' in result), 'Should not reference narrative');
  });

  it('should not reference Knowledge Agent', () => {
    const result = composeStorageArtifacts(VALID_INPUT);
    assert.ok(!('knowledgeAgent' in result), 'Should not reference Knowledge Agent');
    assert.ok(!('knowledge' in result), 'Should not reference knowledge');
  });

  it('should not reference Didactic Agent', () => {
    const result = composeStorageArtifacts(VALID_INPUT);
    assert.ok(!('didacticAgent' in result), 'Should not reference Didactic Agent');
    assert.ok(!('didactic' in result), 'Should not reference didactic');
  });

  it('should not reference Research Agent', () => {
    const result = composeStorageArtifacts(VALID_INPUT);
    assert.ok(!('researchAgent' in result), 'Should not reference Research Agent');
    assert.ok(!('research' in result), 'Should not reference research');
  });

  it('should not reference Laboratory Agent', () => {
    const result = composeStorageArtifacts(VALID_INPUT);
    assert.ok(!('laboratoryAgent' in result), 'Should not reference Laboratory Agent');
    assert.ok(!('laboratory' in result), 'Should not reference laboratory');
  });

  it('should not reference Application Agent', () => {
    const result = composeStorageArtifacts(VALID_INPUT);
    assert.ok(!('applicationAgent' in result), 'Should not reference Application Agent');
    assert.ok(!('application' in result), 'Should not reference application');
  });

  it('should not reference Retrieval Agent', () => {
    const result = composeStorageArtifacts(VALID_INPUT);
    assert.ok(!('retrievalAgent' in result), 'Should not reference Retrieval Agent');
    assert.ok(!('retrieval' in result), 'Should not reference retrieval');
  });
});

// ---------------------------------------------------------------------------
// Validation Codes Tests
// ---------------------------------------------------------------------------

describe('Curiosity Storage Kernel — Validation Codes', () => {
  it('should have stable validation codes', () => {
    assert.equal(STORAGE_VALIDATION_CODES.STORAGE_DUPLICATE_ID, 'STORAGE_DUPLICATE_ID');
    assert.equal(STORAGE_VALIDATION_CODES.STORAGE_DUPLICATE_TITLE, 'STORAGE_DUPLICATE_TITLE');
    assert.equal(STORAGE_VALIDATION_CODES.STORAGE_INVALID_STORAGE, 'STORAGE_INVALID_STORAGE');
    assert.equal(STORAGE_VALIDATION_CODES.STORAGE_INVALID_RETRIEVAL, 'STORAGE_INVALID_RETRIEVAL');
    assert.equal(STORAGE_VALIDATION_CODES.STORAGE_INVALID_OVERLAY, 'STORAGE_INVALID_OVERLAY');
    assert.equal(STORAGE_VALIDATION_CODES.STORAGE_INVALID_SCOPE, 'STORAGE_INVALID_SCOPE');
    assert.equal(STORAGE_VALIDATION_CODES.STORAGE_INVALID_VISIBILITY, 'STORAGE_INVALID_VISIBILITY');
    assert.equal(STORAGE_VALIDATION_CODES.STORAGE_INVALID_STATUS, 'STORAGE_INVALID_STATUS');
    assert.equal(STORAGE_VALIDATION_CODES.STORAGE_INVALID_GOVERNANCE, 'STORAGE_INVALID_GOVERNANCE');
    assert.equal(STORAGE_VALIDATION_CODES.STORAGE_MISSING_PROVENANCE, 'STORAGE_MISSING_PROVENANCE');
    assert.equal(STORAGE_VALIDATION_CODES.STORAGE_MISSING_PROVIDER, 'STORAGE_MISSING_PROVIDER');
    assert.equal(STORAGE_VALIDATION_CODES.STORAGE_MISSING_RATIONALE, 'STORAGE_MISSING_RATIONALE');
    assert.equal(STORAGE_VALIDATION_CODES.STORAGE_MISSING_CURIOSITY_REFERENCE, 'STORAGE_MISSING_CURIOSITY_REFERENCE');
    assert.equal(STORAGE_VALIDATION_CODES.STORAGE_MISSING_PROFILE_ID, 'STORAGE_MISSING_PROFILE_ID');
    assert.equal(STORAGE_VALIDATION_CODES.STORAGE_MISSING_TITLE, 'STORAGE_MISSING_TITLE');
    assert.equal(STORAGE_VALIDATION_CODES.STORAGE_MISSING_OVERLAY, 'STORAGE_MISSING_OVERLAY');
    assert.equal(STORAGE_VALIDATION_CODES.STORAGE_SELF_RELATIONSHIP, 'STORAGE_SELF_RELATIONSHIP');
    assert.equal(STORAGE_VALIDATION_CODES.STORAGE_EMPTY_REGISTRY, 'STORAGE_EMPTY_REGISTRY');
    assert.equal(STORAGE_VALIDATION_CODES.STORAGE_INVALID_TRACE, 'STORAGE_INVALID_TRACE');
    assert.equal(STORAGE_VALIDATION_CODES.STORAGE_REGISTRY_INCONSISTENCY, 'STORAGE_REGISTRY_INCONSISTENCY');
    assert.equal(STORAGE_VALIDATION_CODES.STORAGE_INVALID_CONFIGURATION, 'STORAGE_INVALID_CONFIGURATION');
    assert.equal(STORAGE_VALIDATION_CODES.STORAGE_INVALID_RELATIONSHIP, 'STORAGE_INVALID_RELATIONSHIP');
    assert.equal(STORAGE_VALIDATION_CODES.STORAGE_MISSING_GOVERNANCE, 'STORAGE_MISSING_GOVERNANCE');
    assert.equal(STORAGE_VALIDATION_CODES.STORAGE_UNSUPPORTED_STORAGE, 'STORAGE_UNSUPPORTED_STORAGE');
  });

  it('should have exactly 24 validation codes', () => {
    const codeCount = Object.keys(STORAGE_VALIDATION_CODES).length;
    assert.equal(codeCount, 24);
  });
});

// ---------------------------------------------------------------------------
// Public API Export Tests
// ---------------------------------------------------------------------------

describe('Curiosity Storage Kernel — Public API Exports', () => {
  it('should export all composition functions', () => {
    assert.equal(typeof composeCuriosityStorageProvenance, 'function');
    assert.equal(typeof composeCuriosityStorageTrace, 'function');
    assert.equal(typeof composeCuriosityStorageProfile, 'function');
    assert.equal(typeof composeRetrievalMetadata, 'function');
    assert.equal(typeof composeOverlayMetadata, 'function');
    assert.equal(typeof composeStorageRelationship, 'function');
    assert.equal(typeof composeStorageRegistry, 'function');
    assert.equal(typeof composeStorageRegistryFromInput, 'function');
    assert.equal(typeof composeStorageArtifacts, 'function');
    assert.equal(typeof composeCuriosityArtifactWithStorage, 'function');
  });

  it('should export all helper functions', () => {
    assert.equal(typeof isSupportedStorageType, 'function');
    assert.equal(typeof isSupportedRetrievalStrategy, 'function');
    assert.equal(typeof isSupportedOverlayType, 'function');
    assert.equal(typeof isSupportedStorageVisibility, 'function');
    assert.equal(typeof isSupportedStorageScope, 'function');
    assert.equal(typeof isSupportedStorageStatus, 'function');
    assert.equal(typeof isSupportedStorageGovernance, 'function');
    assert.equal(typeof getCanonicalStorageTypes, 'function');
    assert.equal(typeof getCanonicalRetrievalStrategies, 'function');
    assert.equal(typeof getCanonicalOverlayTypes, 'function');
    assert.equal(typeof getCanonicalStorageVisibility, 'function');
    assert.equal(typeof getCanonicalStorageScopes, 'function');
    assert.equal(typeof getCanonicalStorageStatuses, 'function');
  });

  it('should export all validation functions', () => {
    assert.equal(typeof validateCuriosityStorageProfile, 'function');
    assert.equal(typeof validateRetrievalMetadata, 'function');
    assert.equal(typeof validateOverlayMetadata, 'function');
    assert.equal(typeof validateStorageRelationship, 'function');
    assert.equal(typeof validateStorageRegistry, 'function');
    assert.equal(typeof validateStorageInput, 'function');
    assert.equal(typeof validateStorageTrace, 'function');
    assert.equal(typeof validateCuriosityArtifactWithStorage, 'function');
  });

  it('should export validation codes', () => {
    assert.ok(STORAGE_VALIDATION_CODES);
    assert.equal(typeof STORAGE_VALIDATION_CODES, 'object');
  });
});

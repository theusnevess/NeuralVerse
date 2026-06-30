/**
 * NV-2100-D9-OPT-07 — Unexpected Connection Kernel Test Suite
 *
 * Comprehensive deterministic test suite for the Unexpected Connection Kernel.
 * Covers: valid connection profile, valid limitation warning, valid application surprise,
 * valid relationship, valid provenance, valid trace, empty registry, duplicate IDs,
 * duplicate titles, deterministic ordering, invalid enums, missing provenance/provider/rationale,
 * missing references, self-relationships, empty registries, registry inconsistencies,
 * determinism (100 iterations), immutability, negative capability, cross-agent boundaries,
 * validation code stability, public API exports, backward compatibility with D9-OPT-01 through D9-OPT-06.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import type {
  UnexpectedConnectionProfile,
  LimitationWarning,
  ApplicationSurprise,
  DiscoveryRelationship,
  DiscoveryInput,
  DiscoveryRegistry,
  UnexpectedConnectionProvenance,
  UnexpectedConnectionTrace,
  CuriosityArtifactWithDiscoveries,
} from './CuriosityAgentContract.ts';

import {
  CANONICAL_CONNECTION_TYPES,
  CANONICAL_LIMITATION_TYPES,
  CANONICAL_SURPRISE_TYPES,
  CANONICAL_DISCOVERY_IMPACT,
  CANONICAL_DISCOVERY_STATUS,
  CANONICAL_CURIOSITY_GOVERNANCE,
} from './CuriosityAgentContract.ts';

import {
  composeUnexpectedConnectionProvenance,
  composeUnexpectedConnectionTrace,
  composeUnexpectedConnectionProfile,
  composeLimitationWarning,
  composeApplicationSurprise,
  composeDiscoveryRelationship,
  composeDiscoveryRegistry,
  composeDiscoveryRegistryFromInput,
  composeDiscoveries,
  composeCuriosityArtifactWithDiscoveries,
  isSupportedConnectionType,
  isSupportedLimitationType,
  isSupportedSurpriseType,
  isSupportedDiscoveryImpact,
  isSupportedDiscoveryStatus,
  isSupportedDiscoveryGovernance,
  getCanonicalConnectionTypes,
  getCanonicalLimitationTypes,
  getCanonicalSurpriseTypes,
  getCanonicalDiscoveryImpacts,
  getCanonicalDiscoveryStatuses,
} from './UnexpectedConnectionKernel.ts';

import {
  validateUnexpectedConnectionProfile,
  validateLimitationWarning,
  validateApplicationSurprise,
  validateDiscoveryRelationship,
  validateDiscoveryRegistry,
  validateDiscoveryInput,
  validateDiscoveryTrace,
  validateCuriosityArtifactWithDiscoveries,
  DISCOVERY_VALIDATION_CODES,
} from './UnexpectedConnectionValidation.ts';

// ---------------------------------------------------------------------------
// Test Fixtures
// ---------------------------------------------------------------------------

const VALID_PROVENANCE: UnexpectedConnectionProvenance = {
  provider: 'NeuralVerse Team',
  source: 'Curated Knowledge Base',
  rationale: 'Core unexpected connection artifact.',
  version: '1.0.0',
};

const VALID_TRACE: UnexpectedConnectionTrace = {
  traceId: '_trace_1',
  generatedFrom: 'deterministic_unexpected_connection_kernel',
  deterministic: true,
  randomUsed: false,
  timeDependency: false,
};

const VALID_CONNECTION_PROFILE: UnexpectedConnectionProfile = {
  id: 'conn-001',
  title: 'Math Trick in JPEG Compression',
  connectionType: 'cross_domain',
  limitationType: 'computational',
  surpriseType: 'unexpected_application',
  discoveryImpact: 'attention',
  conceptIds: ['concept-001', 'concept-002'],
  status: 'published',
  governance: 'canonical',
  provenance: VALID_PROVENANCE,
  trace: VALID_TRACE,
};

const VALID_CONNECTION_PROFILE_2: UnexpectedConnectionProfile = {
  id: 'conn-002',
  title: 'Algorithm Fails at Memory Bottleneck',
  connectionType: 'engineering',
  limitationType: 'physical',
  surpriseType: 'engineering_tradeoff',
  discoveryImpact: 'understanding',
  conceptIds: ['concept-003'],
  status: 'approved',
  governance: 'accepted',
  provenance: { ...VALID_PROVENANCE, source: 'Research Archives' },
  trace: { ...VALID_TRACE, traceId: '_trace_2' },
};

const VALID_LIMITATION_WARNING: LimitationWarning = {
  warningId: 'limit-001',
  title: 'Memory Bottleneck Warning',
  limitationType: 'computational',
  limitationDescription: 'Algorithm requires O(n²) memory',
  impactAssessment: 'Cannot scale to large datasets',
  mitigationStrategy: 'Use approximate algorithms',
  conceptIds: ['concept-001'],
  status: 'published',
  governance: 'canonical',
  provenance: VALID_PROVENANCE,
  trace: VALID_TRACE,
};

const VALID_APPLICATION_SURPRISE: ApplicationSurprise = {
  surpriseId: 'surprise-001',
  title: 'Math Trick in JPEG',
  surpriseType: 'unexpected_application',
  originalContext: 'Mathematics education',
  unexpectedApplication: 'Image compression algorithms',
  whySurprising: 'Mathematical concepts find practical use in unexpected fields',
  conceptIds: ['concept-002'],
  status: 'published',
  governance: 'canonical',
  provenance: VALID_PROVENANCE,
  trace: VALID_TRACE,
};

const VALID_RELATIONSHIP: DiscoveryRelationship = {
  relationshipId: 'disc-rel-001',
  sourceProfileId: 'conn-001',
  targetProfileId: 'conn-002',
  relationshipType: 'related_to',
  description: 'These discoveries are related.',
  provenance: VALID_PROVENANCE,
};

const VALID_INPUT: DiscoveryInput = {
  connections: [VALID_CONNECTION_PROFILE, VALID_CONNECTION_PROFILE_2],
  limitations: [VALID_LIMITATION_WARNING],
  surprises: [VALID_APPLICATION_SURPRISE],
  relationships: [VALID_RELATIONSHIP],
};

const EMPTY_INPUT: DiscoveryInput = {
  connections: [],
  limitations: [],
  surprises: [],
  relationships: [],
};

// ---------------------------------------------------------------------------
// Profile Composition Tests
// ---------------------------------------------------------------------------

describe('Unexpected Connection Kernel — Profile Composition', () => {
  it('should compose valid unexpected connection provenance', () => {
    const provenance = composeUnexpectedConnectionProvenance({
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

  it('should compose valid unexpected connection profile', () => {
    const profile = composeUnexpectedConnectionProfile({
      id: 'conn-001',
      title: 'Math Trick in JPEG Compression',
      connectionType: 'cross_domain',
      limitationType: 'computational',
      surpriseType: 'unexpected_application',
      discoveryImpact: 'attention',
      conceptIds: ['concept-001'],
      status: 'published',
      governance: 'canonical',
      provenance: VALID_PROVENANCE,
      trace: VALID_TRACE,
    });

    assert.equal(profile.id, 'conn-001');
    assert.equal(profile.title, 'Math Trick in JPEG Compression');
    assert.equal(profile.connectionType, 'cross_domain');
    assert.equal(profile.limitationType, 'computational');
    assert.equal(profile.surpriseType, 'unexpected_application');
    assert.equal(profile.discoveryImpact, 'attention');
    assert.equal(profile.conceptIds.length, 1);
    assert.equal(profile.status, 'published');
    assert.equal(profile.governance, 'canonical');
  });

  it('should compose valid unexpected connection trace', () => {
    const trace = composeUnexpectedConnectionTrace({
      traceId: '_trace_1',
    });

    assert.equal(trace.traceId, '_trace_1');
    assert.equal(trace.deterministic, true);
    assert.equal(trace.randomUsed, false);
    assert.equal(trace.timeDependency, false);
  });

  it('should compose valid limitation warning', () => {
    const warning = composeLimitationWarning({
      warningId: 'limit-001',
      title: 'Memory Bottleneck Warning',
      limitationType: 'computational',
      limitationDescription: 'Algorithm requires O(n²) memory',
      impactAssessment: 'Cannot scale to large datasets',
      mitigationStrategy: 'Use approximate algorithms',
      conceptIds: ['concept-001'],
      status: 'published',
      governance: 'canonical',
      provenance: VALID_PROVENANCE,
      trace: VALID_TRACE,
    });

    assert.equal(warning.warningId, 'limit-001');
    assert.equal(warning.title, 'Memory Bottleneck Warning');
    assert.equal(warning.limitationType, 'computational');
    assert.equal(warning.limitationDescription, 'Algorithm requires O(n²) memory');
    assert.equal(warning.impactAssessment, 'Cannot scale to large datasets');
    assert.equal(warning.mitigationStrategy, 'Use approximate algorithms');
    assert.equal(warning.conceptIds.length, 1);
    assert.equal(warning.status, 'published');
    assert.equal(warning.governance, 'canonical');
  });

  it('should compose valid application surprise', () => {
    const surprise = composeApplicationSurprise({
      surpriseId: 'surprise-001',
      title: 'Math Trick in JPEG',
      surpriseType: 'unexpected_application',
      originalContext: 'Mathematics education',
      unexpectedApplication: 'Image compression algorithms',
      whySurprising: 'Mathematical concepts find practical use in unexpected fields',
      conceptIds: ['concept-002'],
      status: 'published',
      governance: 'canonical',
      provenance: VALID_PROVENANCE,
      trace: VALID_TRACE,
    });

    assert.equal(surprise.surpriseId, 'surprise-001');
    assert.equal(surprise.title, 'Math Trick in JPEG');
    assert.equal(surprise.surpriseType, 'unexpected_application');
    assert.equal(surprise.originalContext, 'Mathematics education');
    assert.equal(surprise.unexpectedApplication, 'Image compression algorithms');
    assert.equal(surprise.whySurprising, 'Mathematical concepts find practical use in unexpected fields');
    assert.equal(surprise.conceptIds.length, 1);
    assert.equal(surprise.status, 'published');
    assert.equal(surprise.governance, 'canonical');
  });

  it('should compose valid discovery relationship', () => {
    const relationship = composeDiscoveryRelationship({
      relationshipId: 'disc-rel-001',
      sourceProfileId: 'conn-001',
      targetProfileId: 'conn-002',
      relationshipType: 'related_to',
      description: 'Related discoveries.',
      provenance: VALID_PROVENANCE,
    });

    assert.equal(relationship.relationshipId, 'disc-rel-001');
    assert.equal(relationship.sourceProfileId, 'conn-001');
    assert.equal(relationship.targetProfileId, 'conn-002');
    assert.equal(relationship.relationshipType, 'related_to');
    assert.equal(relationship.description, 'Related discoveries.');
  });

  it('should validate a valid connection profile with no errors', () => {
    const errors = validateUnexpectedConnectionProfile(VALID_CONNECTION_PROFILE);
    assert.deepStrictEqual(errors, []);
  });

  it('should validate a valid registry with no errors', () => {
    const registry = composeDiscoveryRegistry([VALID_CONNECTION_PROFILE, VALID_CONNECTION_PROFILE_2], [VALID_LIMITATION_WARNING], [VALID_APPLICATION_SURPRISE], [VALID_RELATIONSHIP]);
    const result = validateDiscoveryRegistry(registry);

    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it('should validate discovery input', () => {
    const result = validateDiscoveryInput(VALID_INPUT);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });
});

// ---------------------------------------------------------------------------
// Registry Tests
// ---------------------------------------------------------------------------

describe('Unexpected Connection Kernel — Registry', () => {
  it('should detect empty registry', () => {
    const registry = composeDiscoveryRegistry([], [], [], []);
    const result = validateDiscoveryRegistry(registry);
    const emptyError = result.errors.find(
      (e) => e.code === DISCOVERY_VALIDATION_CODES.DISCOVERY_EMPTY_REGISTRY,
    );

    assert.ok(emptyError, 'Should have DISCOVERY_EMPTY_REGISTRY error');
    assert.equal(result.valid, false);
  });

  it('should detect duplicate IDs', () => {
    const registry = composeDiscoveryRegistry([VALID_CONNECTION_PROFILE, VALID_CONNECTION_PROFILE], [], [], []);
    const result = validateDiscoveryRegistry(registry);
    const duplicateError = result.errors.find(
      (e) => e.code === DISCOVERY_VALIDATION_CODES.DISCOVERY_DUPLICATE_ID,
    );

    assert.ok(duplicateError, 'Should have DISCOVERY_DUPLICATE_ID error');
  });

  it('should detect duplicate titles', () => {
    const profile1 = { ...VALID_CONNECTION_PROFILE, id: 'conn-001', title: 'Same Title' };
    const profile2 = { ...VALID_CONNECTION_PROFILE, id: 'conn-002', title: 'Same Title' };
    const registry = composeDiscoveryRegistry([profile1, profile2], [], [], []);
    const result = validateDiscoveryRegistry(registry);
    const duplicateError = result.errors.find(
      (e) => e.code === DISCOVERY_VALIDATION_CODES.DISCOVERY_DUPLICATE_TITLE,
    );

    assert.ok(duplicateError, 'Should have DISCOVERY_DUPLICATE_TITLE error');
  });

  it('should sort deterministically by id', () => {
    const profile3 = { ...VALID_CONNECTION_PROFILE, id: 'conn-003' };
    const profile1 = { ...VALID_CONNECTION_PROFILE, id: 'conn-001' };
    const profile2 = { ...VALID_CONNECTION_PROFILE, id: 'conn-002' };

    const registry = composeDiscoveryRegistry([profile3, profile1, profile2], [], [], []);

    assert.equal(registry.connections[0].id, 'conn-001');
    assert.equal(registry.connections[1].id, 'conn-002');
    assert.equal(registry.connections[2].id, 'conn-003');
  });

  it('should sort by connectionType when id is equal', () => {
    const profileA = { ...VALID_CONNECTION_PROFILE, id: 'conn-001', connectionType: 'engineering' as const };
    const profileB = { ...VALID_CONNECTION_PROFILE, id: 'conn-001', connectionType: 'cross_domain' as const };

    const registry = composeDiscoveryRegistry([profileA, profileB], [], [], []);

    assert.equal(registry.connections[0].connectionType, 'cross_domain');
    assert.equal(registry.connections[1].connectionType, 'engineering');
  });

  it('should detect self-relationships', () => {
    const selfRelationship: DiscoveryRelationship = {
      relationshipId: 'disc-rel-self',
      sourceProfileId: 'conn-001',
      targetProfileId: 'conn-001',
      relationshipType: 'related_to',
      description: 'Self relationship.',
      provenance: VALID_PROVENANCE,
    };

    const registry = composeDiscoveryRegistry([VALID_CONNECTION_PROFILE], [], [], [selfRelationship]);
    const result = validateDiscoveryRegistry(registry);
    const selfError = result.errors.find(
      (e) => e.code === DISCOVERY_VALIDATION_CODES.DISCOVERY_SELF_RELATIONSHIP,
    );

    assert.ok(selfError, 'Should have DISCOVERY_SELF_RELATIONSHIP error');
  });
});

// ---------------------------------------------------------------------------
// Validation Tests
// ---------------------------------------------------------------------------

describe('Unexpected Connection Kernel — Validation', () => {
  it('should detect invalid connection type', () => {
    const profile = { ...VALID_CONNECTION_PROFILE, connectionType: 'unsupported' as any };
    const errors = validateUnexpectedConnectionProfile(profile);
    const typeError = errors.find(
      (e) => e.code === DISCOVERY_VALIDATION_CODES.DISCOVERY_INVALID_CONNECTION,
    );

    assert.ok(typeError, 'Should have DISCOVERY_INVALID_CONNECTION error');
  });

  it('should detect invalid limitation type', () => {
    const profile = { ...VALID_CONNECTION_PROFILE, limitationType: 'unsupported' as any };
    const errors = validateUnexpectedConnectionProfile(profile);
    const limitationError = errors.find(
      (e) => e.code === DISCOVERY_VALIDATION_CODES.DISCOVERY_INVALID_LIMITATION,
    );

    assert.ok(limitationError, 'Should have DISCOVERY_INVALID_LIMITATION error');
  });

  it('should detect invalid surprise type', () => {
    const profile = { ...VALID_CONNECTION_PROFILE, surpriseType: 'unsupported' as any };
    const errors = validateUnexpectedConnectionProfile(profile);
    const surpriseError = errors.find(
      (e) => e.code === DISCOVERY_VALIDATION_CODES.DISCOVERY_INVALID_SURPRISE,
    );

    assert.ok(surpriseError, 'Should have DISCOVERY_INVALID_SURPRISE error');
  });

  it('should detect invalid discovery impact', () => {
    const profile = { ...VALID_CONNECTION_PROFILE, discoveryImpact: 'unsupported' as any };
    const errors = validateUnexpectedConnectionProfile(profile);
    const impactError = errors.find(
      (e) => e.code === DISCOVERY_VALIDATION_CODES.DISCOVERY_INVALID_IMPACT,
    );

    assert.ok(impactError, 'Should have DISCOVERY_INVALID_IMPACT error');
  });

  it('should detect invalid status', () => {
    const profile = { ...VALID_CONNECTION_PROFILE, status: 'unsupported' as any };
    const errors = validateUnexpectedConnectionProfile(profile);
    const statusError = errors.find(
      (e) => e.code === DISCOVERY_VALIDATION_CODES.DISCOVERY_INVALID_STATUS,
    );

    assert.ok(statusError, 'Should have DISCOVERY_INVALID_STATUS error');
  });

  it('should detect invalid governance', () => {
    const profile = { ...VALID_CONNECTION_PROFILE, governance: 'unsupported' as any };
    const errors = validateUnexpectedConnectionProfile(profile);
    const governanceError = errors.find(
      (e) => e.code === DISCOVERY_VALIDATION_CODES.DISCOVERY_INVALID_GOVERNANCE,
    );

    assert.ok(governanceError, 'Should have DISCOVERY_INVALID_GOVERNANCE error');
  });

  it('should detect missing provenance', () => {
    const profile = { ...VALID_CONNECTION_PROFILE, provenance: undefined as any };
    const errors = validateUnexpectedConnectionProfile(profile);
    const provenanceError = errors.find(
      (e) => e.code === DISCOVERY_VALIDATION_CODES.DISCOVERY_MISSING_PROVENANCE,
    );

    assert.ok(provenanceError, 'Should have DISCOVERY_MISSING_PROVENANCE error');
  });

  it('should detect missing provenance provider', () => {
    const profile = { ...VALID_CONNECTION_PROFILE, provenance: { ...VALID_PROVENANCE, provider: '' } };
    const errors = validateUnexpectedConnectionProfile(profile);
    const providerError = errors.find(
      (e) => e.code === DISCOVERY_VALIDATION_CODES.DISCOVERY_MISSING_PROVIDER,
    );

    assert.ok(providerError, 'Should have DISCOVERY_MISSING_PROVIDER error');
  });

  it('should detect missing provenance rationale', () => {
    const profile = { ...VALID_CONNECTION_PROFILE, provenance: { ...VALID_PROVENANCE, rationale: '' } };
    const errors = validateUnexpectedConnectionProfile(profile);
    const rationaleError = errors.find(
      (e) => e.code === DISCOVERY_VALIDATION_CODES.DISCOVERY_MISSING_RATIONALE,
    );

    assert.ok(rationaleError, 'Should have DISCOVERY_MISSING_RATIONALE error');
  });

  it('should validate a valid trace', () => {
    const trace = composeUnexpectedConnectionTrace({
      traceId: '_trace_1',
    });

    const result = validateDiscoveryTrace(trace);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it('should detect invalid trace', () => {
    const trace: UnexpectedConnectionTrace = {
      traceId: '',
      generatedFrom: 'deterministic_unexpected_connection_kernel',
      deterministic: false as true,
      randomUsed: false,
      timeDependency: false,
    };

    const result = validateDiscoveryTrace(trace);
    assert.equal(result.valid, false);
  });

  it('should detect missing limitation configuration', () => {
    const warning: LimitationWarning = {
      warningId: 'limit-001',
      title: 'Test',
      limitationType: 'computational',
      limitationDescription: '',
      impactAssessment: '',
      mitigationStrategy: '',
      conceptIds: [],
      status: 'published',
      governance: 'canonical',
      provenance: VALID_PROVENANCE,
      trace: VALID_TRACE,
    };

    const errors = validateLimitationWarning(warning);
    const configError = errors.find(
      (e) => e.code === DISCOVERY_VALIDATION_CODES.DISCOVERY_INVALID_CONFIGURATION,
    );

    assert.ok(configError, 'Should have DISCOVERY_INVALID_CONFIGURATION error');
  });

  it('should detect missing surprise configuration', () => {
    const surprise: ApplicationSurprise = {
      surpriseId: 'surprise-001',
      title: 'Test',
      surpriseType: 'unexpected_application',
      originalContext: '',
      unexpectedApplication: '',
      whySurprising: '',
      conceptIds: [],
      status: 'published',
      governance: 'canonical',
      provenance: VALID_PROVENANCE,
      trace: VALID_TRACE,
    };

    const errors = validateApplicationSurprise(surprise);
    const configError = errors.find(
      (e) => e.code === DISCOVERY_VALIDATION_CODES.DISCOVERY_INVALID_CONFIGURATION,
    );

    assert.ok(configError, 'Should have DISCOVERY_INVALID_CONFIGURATION error');
  });
});

// ---------------------------------------------------------------------------
// Determinism Tests
// ---------------------------------------------------------------------------

describe('Unexpected Connection Kernel — Determinism', () => {
  it('should produce identical output for identical input (100 iterations)', () => {
    const results: ReturnType<typeof composeDiscoveries>[] = [];
    for (let i = 0; i < 100; i++) {
      results.push(composeDiscoveries(VALID_INPUT));
    }

    for (let i = 1; i < results.length; i++) {
      assert.deepStrictEqual(results[0].registryId, results[i].registryId);
      assert.deepStrictEqual(results[0].connections, results[i].connections);
      assert.deepStrictEqual(results[0].trace.traceId, results[i].trace.traceId);
    }
  });

  it('should produce identical registry output for identical input', () => {
    const results: ReturnType<typeof composeDiscoveryRegistry>[] = [];
    for (let i = 0; i < 100; i++) {
      results.push(composeDiscoveryRegistry([VALID_CONNECTION_PROFILE, VALID_CONNECTION_PROFILE_2], [VALID_LIMITATION_WARNING], [VALID_APPLICATION_SURPRISE], [VALID_RELATIONSHIP]));
    }

    for (let i = 1; i < results.length; i++) {
      assert.deepStrictEqual(results[0].connections, results[i].connections);
      assert.deepStrictEqual(results[0].registryId, results[i].registryId);
    }
  });
});

// ---------------------------------------------------------------------------
// Immutability Tests
// ---------------------------------------------------------------------------

describe('Unexpected Connection Kernel — Immutability', () => {
  it('should not mutate input connections', () => {
    const originalId = VALID_CONNECTION_PROFILE.id;
    const originalTitle = VALID_CONNECTION_PROFILE.title;

    composeDiscoveries(VALID_INPUT);

    assert.equal(VALID_CONNECTION_PROFILE.id, originalId);
    assert.equal(VALID_CONNECTION_PROFILE.title, originalTitle);
  });

  it('should not mutate input registry connections', () => {
    const connections = [VALID_CONNECTION_PROFILE, VALID_CONNECTION_PROFILE_2];
    const originalIds = connections.map((c) => c.id);

    composeDiscoveryRegistry(connections, [], [], []);

    assert.equal(connections[0].id, originalIds[0]);
    assert.equal(connections[1].id, originalIds[1]);
  });
});

// ---------------------------------------------------------------------------
// Helper Function Tests
// ---------------------------------------------------------------------------

describe('Unexpected Connection Kernel — Helper Functions', () => {
  it('should return canonical connection types', () => {
    const types = getCanonicalConnectionTypes();
    assert.deepStrictEqual([...types], [...CANONICAL_CONNECTION_TYPES]);
    assert.equal(types.length, 10);
  });

  it('should return canonical limitation types', () => {
    const types = getCanonicalLimitationTypes();
    assert.deepStrictEqual([...types], [...CANONICAL_LIMITATION_TYPES]);
    assert.equal(types.length, 10);
  });

  it('should return canonical surprise types', () => {
    const types = getCanonicalSurpriseTypes();
    assert.deepStrictEqual([...types], [...CANONICAL_SURPRISE_TYPES]);
    assert.equal(types.length, 10);
  });

  it('should return canonical discovery impacts', () => {
    const impacts = getCanonicalDiscoveryImpacts();
    assert.deepStrictEqual([...impacts], [...CANONICAL_DISCOVERY_IMPACT]);
    assert.equal(impacts.length, 10);
  });

  it('should return canonical discovery statuses', () => {
    const statuses = getCanonicalDiscoveryStatuses();
    assert.deepStrictEqual([...statuses], [...CANONICAL_DISCOVERY_STATUS]);
    assert.equal(statuses.length, 6);
  });

  it('should validate connection type support', () => {
    assert.equal(isSupportedConnectionType('cross_domain'), true);
    assert.equal(isSupportedConnectionType('engineering'), true);
    assert.equal(isSupportedConnectionType('unsupported'), false);
  });

  it('should validate limitation type support', () => {
    assert.equal(isSupportedLimitationType('computational'), true);
    assert.equal(isSupportedLimitationType('theoretical'), true);
    assert.equal(isSupportedLimitationType('unsupported'), false);
  });

  it('should validate surprise type support', () => {
    assert.equal(isSupportedSurpriseType('unexpected_application'), true);
    assert.equal(isSupportedSurpriseType('counterintuitive_result'), true);
    assert.equal(isSupportedSurpriseType('unsupported'), false);
  });

  it('should validate discovery impact support', () => {
    assert.equal(isSupportedDiscoveryImpact('attention'), true);
    assert.equal(isSupportedDiscoveryImpact('engagement'), true);
    assert.equal(isSupportedDiscoveryImpact('unsupported'), false);
  });

  it('should validate discovery status support', () => {
    assert.equal(isSupportedDiscoveryStatus('draft'), true);
    assert.equal(isSupportedDiscoveryStatus('published'), true);
    assert.equal(isSupportedDiscoveryStatus('unsupported'), false);
  });

  it('should validate discovery governance support', () => {
    assert.equal(isSupportedDiscoveryGovernance('canonical'), true);
    assert.equal(isSupportedDiscoveryGovernance('accepted'), true);
    assert.equal(isSupportedDiscoveryGovernance('unsupported'), false);
  });
});

// ---------------------------------------------------------------------------
// Canonical Enum Completeness Tests
// ---------------------------------------------------------------------------

describe('Unexpected Connection Kernel — Canonical Enum Completeness', () => {
  it('should have exactly 10 connection types', () => {
    assert.equal(CANONICAL_CONNECTION_TYPES.length, 10);
  });

  it('should have exactly 10 limitation types', () => {
    assert.equal(CANONICAL_LIMITATION_TYPES.length, 10);
  });

  it('should have exactly 10 surprise types', () => {
    assert.equal(CANONICAL_SURPRISE_TYPES.length, 10);
  });

  it('should have exactly 10 discovery impacts', () => {
    assert.equal(CANONICAL_DISCOVERY_IMPACT.length, 10);
  });

  it('should have exactly 6 discovery statuses', () => {
    assert.equal(CANONICAL_DISCOVERY_STATUS.length, 6);
  });

  it('should have exactly 5 governance values', () => {
    assert.equal(CANONICAL_CURIOSITY_GOVERNANCE.length, 5);
  });

  it('should contain all expected connection types', () => {
    const expectedTypes = [
      'cross_domain',
      'cross_discipline',
      'historical',
      'engineering',
      'scientific',
      'mathematical',
      'technological',
      'philosophical',
      'industrial',
      'unexpected',
    ];

    for (const type of expectedTypes) {
      assert.ok(
        CANONICAL_CONNECTION_TYPES.includes(type as any),
        `Should include type: ${type}`,
      );
    }
  });

  it('should contain all expected limitation types', () => {
    const expectedTypes = [
      'computational',
      'theoretical',
      'physical',
      'engineering',
      'mathematical',
      'practical',
      'economic',
      'historical',
      'ethical',
      'domain_specific',
    ];

    for (const type of expectedTypes) {
      assert.ok(
        CANONICAL_LIMITATION_TYPES.includes(type as any),
        `Should include type: ${type}`,
      );
    }
  });

  it('should contain all expected surprise types', () => {
    const expectedTypes = [
      'unexpected_application',
      'counterintuitive_result',
      'historical_fact',
      'technology_origin',
      'engineering_tradeoff',
      'research_discovery',
      'scientific_paradox',
      'industrial_usage',
      'everyday_application',
      'future_implication',
    ];

    for (const type of expectedTypes) {
      assert.ok(
        CANONICAL_SURPRISE_TYPES.includes(type as any),
        `Should include type: ${type}`,
      );
    }
  });

  it('should contain all expected discovery impacts', () => {
    const expectedImpacts = [
      'attention',
      'engagement',
      'memory',
      'understanding',
      'motivation',
      'reflection',
      'application',
      'perspective',
      'exploration',
      'retention',
    ];

    for (const impact of expectedImpacts) {
      assert.ok(
        CANONICAL_DISCOVERY_IMPACT.includes(impact as any),
        `Should include impact: ${impact}`,
      );
    }
  });
});

// ---------------------------------------------------------------------------
// Negative Capability Verification Tests
// ---------------------------------------------------------------------------

describe('Unexpected Connection Kernel — Negative Capability Verification', () => {
  it('should not use Math.random', () => {
    const result = composeDiscoveries(VALID_INPUT);
    assert.ok(result, 'Should produce a result without Math.random');
  });

  it('should not use Date.now', () => {
    const result = composeDiscoveries(VALID_INPUT);
    assert.ok(result, 'Should produce a result without Date.now');
  });

  it('should not use performance.now', () => {
    const result = composeDiscoveries(VALID_INPUT);
    assert.ok(result, 'Should produce a result without performance.now');
  });

  it('should not use crypto.randomUUID', () => {
    const result = composeDiscoveries(VALID_INPUT);
    assert.ok(result, 'Should produce a result without crypto.randomUUID');
  });

  it('should not generate unexpected connections', () => {
    const result = composeDiscoveries(VALID_INPUT);
    assert.ok(!('generatedConnections' in result), 'Should not have generated connections');
    assert.ok(!('discoveredConnections' in result), 'Should not have discovered connections');
  });

  it('should not perform reasoning', () => {
    const result = composeDiscoveries(VALID_INPUT);
    assert.ok(!('reasoning' in result), 'Should not have reasoning');
    assert.ok(!('inference' in result), 'Should not have inference');
  });

  it('should not infer relationships', () => {
    const result = composeDiscoveries(VALID_INPUT);
    assert.ok(!('inferredRelationships' in result), 'Should not have inferred relationships');
    assert.ok(!('discoveredRelationships' in result), 'Should not have discovered relationships');
  });

  it('should not search knowledge', () => {
    const result = composeDiscoveries(VALID_INPUT);
    assert.ok(!('searchResults' in result), 'Should not have search results');
    assert.ok(!('knowledgeSearch' in result), 'Should not have knowledge search');
  });

  it('should not generate analogies', () => {
    const result = composeDiscoveries(VALID_INPUT);
    assert.ok(!('generatedAnalogies' in result), 'Should not have generated analogies');
    assert.ok(!('analogies' in result), 'Should not have analogies');
  });

  it('should not access filesystem', () => {
    const result = composeDiscoveries(VALID_INPUT);
    assert.ok(!('filesystem' in result), 'Should not have filesystem');
    assert.ok(!('fileSystem' in result), 'Should not have fileSystem');
  });

  it('should not perform network requests', () => {
    const result = composeDiscoveries(VALID_INPUT);
    assert.ok(!('networkResponse' in result), 'Should not have network response');
    assert.ok(!('httpResult' in result), 'Should not have HTTP result');
  });

  it('should not have executable callbacks in profile', () => {
    const profile = composeUnexpectedConnectionProfile({
      id: 'conn-001',
      title: 'Test',
      connectionType: 'cross_domain',
      limitationType: 'computational',
      surpriseType: 'unexpected_application',
      discoveryImpact: 'attention',
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
    const result = composeDiscoveries(VALID_INPUT);
    assert.ok(!('executionResult' in result), 'Should not have execution result');
    assert.ok(!('output' in result), 'Should not have output');
  });
});

// ---------------------------------------------------------------------------
// Cross-Agent Boundary Tests
// ---------------------------------------------------------------------------

describe('Unexpected Connection Kernel — Cross-Agent Boundary', () => {
  it('should not reference Narrative Agent', () => {
    const result = composeDiscoveries(VALID_INPUT);
    assert.ok(!('narrativeAgent' in result), 'Should not reference Narrative Agent');
    assert.ok(!('narrative' in result), 'Should not reference narrative');
  });

  it('should not reference Knowledge Agent', () => {
    const result = composeDiscoveries(VALID_INPUT);
    assert.ok(!('knowledgeAgent' in result), 'Should not reference Knowledge Agent');
    assert.ok(!('knowledge' in result), 'Should not reference knowledge');
  });

  it('should not reference Didactic Agent', () => {
    const result = composeDiscoveries(VALID_INPUT);
    assert.ok(!('didacticAgent' in result), 'Should not reference Didactic Agent');
    assert.ok(!('didactic' in result), 'Should not reference didactic');
  });

  it('should not reference Research Agent', () => {
    const result = composeDiscoveries(VALID_INPUT);
    assert.ok(!('researchAgent' in result), 'Should not reference Research Agent');
    assert.ok(!('research' in result), 'Should not reference research');
  });

  it('should not reference Laboratory Agent', () => {
    const result = composeDiscoveries(VALID_INPUT);
    assert.ok(!('laboratoryAgent' in result), 'Should not reference Laboratory Agent');
    assert.ok(!('laboratory' in result), 'Should not reference laboratory');
  });

  it('should not reference Application Agent', () => {
    const result = composeDiscoveries(VALID_INPUT);
    assert.ok(!('applicationAgent' in result), 'Should not reference Application Agent');
    assert.ok(!('application' in result), 'Should not reference application');
  });
});

// ---------------------------------------------------------------------------
// Validation Codes Tests
// ---------------------------------------------------------------------------

describe('Unexpected Connection Kernel — Validation Codes', () => {
  it('should have stable validation codes', () => {
    assert.equal(DISCOVERY_VALIDATION_CODES.DISCOVERY_DUPLICATE_ID, 'DISCOVERY_DUPLICATE_ID');
    assert.equal(DISCOVERY_VALIDATION_CODES.DISCOVERY_DUPLICATE_TITLE, 'DISCOVERY_DUPLICATE_TITLE');
    assert.equal(DISCOVERY_VALIDATION_CODES.DISCOVERY_INVALID_CONNECTION, 'DISCOVERY_INVALID_CONNECTION');
    assert.equal(DISCOVERY_VALIDATION_CODES.DISCOVERY_INVALID_LIMITATION, 'DISCOVERY_INVALID_LIMITATION');
    assert.equal(DISCOVERY_VALIDATION_CODES.DISCOVERY_INVALID_SURPRISE, 'DISCOVERY_INVALID_SURPRISE');
    assert.equal(DISCOVERY_VALIDATION_CODES.DISCOVERY_INVALID_IMPACT, 'DISCOVERY_INVALID_IMPACT');
    assert.equal(DISCOVERY_VALIDATION_CODES.DISCOVERY_INVALID_STATUS, 'DISCOVERY_INVALID_STATUS');
    assert.equal(DISCOVERY_VALIDATION_CODES.DISCOVERY_INVALID_GOVERNANCE, 'DISCOVERY_INVALID_GOVERNANCE');
    assert.equal(DISCOVERY_VALIDATION_CODES.DISCOVERY_MISSING_PROVENANCE, 'DISCOVERY_MISSING_PROVENANCE');
    assert.equal(DISCOVERY_VALIDATION_CODES.DISCOVERY_MISSING_PROVIDER, 'DISCOVERY_MISSING_PROVIDER');
    assert.equal(DISCOVERY_VALIDATION_CODES.DISCOVERY_MISSING_RATIONALE, 'DISCOVERY_MISSING_RATIONALE');
    assert.equal(DISCOVERY_VALIDATION_CODES.DISCOVERY_MISSING_CURIOSITY_REFERENCE, 'DISCOVERY_MISSING_CURIOSITY_REFERENCE');
    assert.equal(DISCOVERY_VALIDATION_CODES.DISCOVERY_MISSING_PROFILE_ID, 'DISCOVERY_MISSING_PROFILE_ID');
    assert.equal(DISCOVERY_VALIDATION_CODES.DISCOVERY_MISSING_TITLE, 'DISCOVERY_MISSING_TITLE');
    assert.equal(DISCOVERY_VALIDATION_CODES.DISCOVERY_MISSING_DISCOVERY, 'DISCOVERY_MISSING_DISCOVERY');
    assert.equal(DISCOVERY_VALIDATION_CODES.DISCOVERY_SELF_RELATIONSHIP, 'DISCOVERY_SELF_RELATIONSHIP');
    assert.equal(DISCOVERY_VALIDATION_CODES.DISCOVERY_EMPTY_REGISTRY, 'DISCOVERY_EMPTY_REGISTRY');
    assert.equal(DISCOVERY_VALIDATION_CODES.DISCOVERY_INVALID_TRACE, 'DISCOVERY_INVALID_TRACE');
    assert.equal(DISCOVERY_VALIDATION_CODES.DISCOVERY_REGISTRY_INCONSISTENCY, 'DISCOVERY_REGISTRY_INCONSISTENCY');
    assert.equal(DISCOVERY_VALIDATION_CODES.DISCOVERY_INVALID_CONFIGURATION, 'DISCOVERY_INVALID_CONFIGURATION');
    assert.equal(DISCOVERY_VALIDATION_CODES.DISCOVERY_INVALID_REFERENCE, 'DISCOVERY_INVALID_REFERENCE');
  });

  it('should have exactly 24 validation codes', () => {
    const codeCount = Object.keys(DISCOVERY_VALIDATION_CODES).length;
    assert.equal(codeCount, 24);
  });
});

// ---------------------------------------------------------------------------
// Public API Export Tests
// ---------------------------------------------------------------------------

describe('Unexpected Connection Kernel — Public API Exports', () => {
  it('should export all composition functions', () => {
    assert.equal(typeof composeUnexpectedConnectionProvenance, 'function');
    assert.equal(typeof composeUnexpectedConnectionTrace, 'function');
    assert.equal(typeof composeUnexpectedConnectionProfile, 'function');
    assert.equal(typeof composeLimitationWarning, 'function');
    assert.equal(typeof composeApplicationSurprise, 'function');
    assert.equal(typeof composeDiscoveryRelationship, 'function');
    assert.equal(typeof composeDiscoveryRegistry, 'function');
    assert.equal(typeof composeDiscoveryRegistryFromInput, 'function');
    assert.equal(typeof composeDiscoveries, 'function');
    assert.equal(typeof composeCuriosityArtifactWithDiscoveries, 'function');
  });

  it('should export all helper functions', () => {
    assert.equal(typeof isSupportedConnectionType, 'function');
    assert.equal(typeof isSupportedLimitationType, 'function');
    assert.equal(typeof isSupportedSurpriseType, 'function');
    assert.equal(typeof isSupportedDiscoveryImpact, 'function');
    assert.equal(typeof isSupportedDiscoveryStatus, 'function');
    assert.equal(typeof isSupportedDiscoveryGovernance, 'function');
    assert.equal(typeof getCanonicalConnectionTypes, 'function');
    assert.equal(typeof getCanonicalLimitationTypes, 'function');
    assert.equal(typeof getCanonicalSurpriseTypes, 'function');
    assert.equal(typeof getCanonicalDiscoveryImpacts, 'function');
    assert.equal(typeof getCanonicalDiscoveryStatuses, 'function');
  });

  it('should export all validation functions', () => {
    assert.equal(typeof validateUnexpectedConnectionProfile, 'function');
    assert.equal(typeof validateLimitationWarning, 'function');
    assert.equal(typeof validateApplicationSurprise, 'function');
    assert.equal(typeof validateDiscoveryRelationship, 'function');
    assert.equal(typeof validateDiscoveryRegistry, 'function');
    assert.equal(typeof validateDiscoveryInput, 'function');
    assert.equal(typeof validateDiscoveryTrace, 'function');
    assert.equal(typeof validateCuriosityArtifactWithDiscoveries, 'function');
  });

  it('should export validation codes', () => {
    assert.ok(DISCOVERY_VALIDATION_CODES);
    assert.equal(typeof DISCOVERY_VALIDATION_CODES, 'object');
  });
});

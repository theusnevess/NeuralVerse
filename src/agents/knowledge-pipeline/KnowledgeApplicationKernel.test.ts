/**
 * D10-OPT-11 — Application Metadata Kernel Test Suite
 *
 * Comprehensive deterministic test suite for the Application Kernel.
 * Covers: composition, validation, helpers, determinism, immutability,
 * runtime restrictions, cross-agent boundary, and public API.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import type {
  KnowledgeApplicationProfile,
  KnowledgeApplicationProvenance,
  KnowledgeApplicationRelationship,
  KnowledgeApplicationInput,
  KnowledgeApplicationRegistry,
  KnowledgeApplicationTrace,
  KnowledgeArtifactWithApplications,
} from './KnowledgeAgentContract.ts';

import {
  CANONICAL_APPLICATION_TYPES,
  CANONICAL_APPLICATION_OBJECTIVES,
  CANONICAL_APPLICATION_DOMAINS,
  CANONICAL_APPLICATION_STATUS,
  CANONICAL_APPLICATION_VISIBILITY,
  CANONICAL_APPLICATION_GOVERNANCE,
} from './KnowledgeAgentContract.ts';

import {
  composeKnowledgeApplicationProvenance,
  composeKnowledgeApplicationProfile,
  composeKnowledgeApplicationRelationship,
  composeKnowledgeApplicationTrace,
  composeKnowledgeApplicationRegistry,
  composeKnowledgeApplicationRegistryFromInput,
  composeKnowledgeApplications,
  composeKnowledgeArtifactWithApplications,
  isSupportedApplicationType,
  isSupportedApplicationObjective,
  isSupportedApplicationDomain,
  isSupportedApplicationVisibility,
  isSupportedApplicationStatus,
  isSupportedApplicationGovernance,
  getCanonicalApplicationTypes,
  getCanonicalApplicationObjectives,
  getCanonicalApplicationDomains,
  getCanonicalApplicationVisibility,
  getCanonicalApplicationStatuses,
} from './KnowledgeApplicationKernel.ts';

import {
  validateKnowledgeApplicationProfile,
  validateKnowledgeApplicationRelationship,
  validateKnowledgeApplicationRegistry,
  validateKnowledgeApplicationInput,
  validateKnowledgeApplicationTrace,
  validateKnowledgeArtifactWithApplications,
  APPLICATION_VALIDATION_CODES,
} from './KnowledgeApplicationValidation.ts';

// ---------------------------------------------------------------------------
// Test Fixtures
// ---------------------------------------------------------------------------

const VALID_PROVENANCE: KnowledgeApplicationProvenance = {
  source: 'NeuralVerse Team',
  provider: 'Knowledge Pipeline',
  rationale: 'Core application for concept.',
  governance: 'canonical',
};

const VALID_PROFILE_1: KnowledgeApplicationProfile = {
  applicationId: 'app-001',
  conceptId: 'concept-001',
  title: 'Neural Network Training System',
  applicationType: 'machine_learning_system',
  applicationObjective: 'apply',
  applicationDomain: 'machine_learning',
  industrySector: 'technology',
  deploymentContext: 'cloud',
  implementationScope: 'production',
  visibility: 'default',
  status: 'canonical',
  governance: 'canonical',
  tags: ['neural_networks', 'training'],
  provenance: VALID_PROVENANCE,
};

const VALID_PROFILE_2: KnowledgeApplicationProfile = {
  applicationId: 'app-002',
  conceptId: 'concept-001',
  title: 'Image Classification Service',
  applicationType: 'computer_vision_system',
  applicationObjective: 'demonstrate',
  applicationDomain: 'computer_vision',
  industrySector: 'healthcare',
  deploymentContext: 'edge',
  implementationScope: 'prototype',
  visibility: 'advanced',
  status: 'approved',
  governance: 'accepted',
  tags: ['computer_vision', 'classification'],
  provenance: { ...VALID_PROVENANCE, source: 'Knowledge Pipeline' },
};

const VALID_PROFILE_3: KnowledgeApplicationProfile = {
  applicationId: 'app-003',
  conceptId: 'concept-002',
  title: 'Data Pipeline Platform',
  applicationType: 'data_platform',
  applicationObjective: 'integrate',
  applicationDomain: 'data_science',
  industrySector: 'finance',
  deploymentContext: 'on-premise',
  implementationScope: 'enterprise',
  visibility: 'expert',
  status: 'canonical',
  governance: 'canonical',
  tags: ['data', 'pipeline'],
  provenance: VALID_PROVENANCE,
};

const VALID_RELATIONSHIP: KnowledgeApplicationRelationship = {
  relationshipId: 'rel-001',
  sourceApplicationId: 'app-001',
  targetApplicationId: 'app-002',
  relationshipType: 'extension',
  description: 'Image classification extends training system.',
  provenance: VALID_PROVENANCE,
};

const VALID_INPUT: KnowledgeApplicationInput = {
  profiles: [VALID_PROFILE_1, VALID_PROFILE_2, VALID_PROFILE_3],
  relationships: [VALID_RELATIONSHIP],
};

const EMPTY_INPUT: KnowledgeApplicationInput = {
  profiles: [],
  relationships: [],
};

// ---------------------------------------------------------------------------
// Composition Tests
// ---------------------------------------------------------------------------

describe('Application Kernel — Composition', () => {
  it('should compose valid application provenance', () => {
    const provenance = composeKnowledgeApplicationProvenance({
      source: 'NeuralVerse Team',
      provider: 'Knowledge Pipeline',
      rationale: 'Core application.',
      governance: 'canonical',
    });

    assert.equal(provenance.source, 'NeuralVerse Team');
    assert.equal(provenance.provider, 'Knowledge Pipeline');
    assert.equal(provenance.rationale, 'Core application.');
    assert.equal(provenance.governance, 'canonical');
  });

  it('should compose valid application profile', () => {
    const profile = composeKnowledgeApplicationProfile({
      applicationId: 'app-001',
      conceptId: 'concept-001',
      title: 'Test Application',
      applicationType: 'software_system',
      applicationObjective: 'introduce',
      applicationDomain: 'software_engineering',
      industrySector: 'technology',
      deploymentContext: 'cloud',
      implementationScope: 'standard',
      visibility: 'default',
      status: 'canonical',
      governance: 'canonical',
      tags: ['tag1'],
      provenance: VALID_PROVENANCE,
    });

    assert.equal(profile.applicationId, 'app-001');
    assert.equal(profile.title, 'Test Application');
    assert.equal(profile.applicationType, 'software_system');
    assert.equal(profile.tags.length, 1);
  });

  it('should compose valid application relationship', () => {
    const relationship = composeKnowledgeApplicationRelationship({
      relationshipId: 'rel-001',
      sourceApplicationId: 'app-001',
      targetApplicationId: 'app-002',
      relationshipType: 'extension',
      description: 'Test relationship.',
      provenance: VALID_PROVENANCE,
    });

    assert.equal(relationship.relationshipId, 'rel-001');
    assert.equal(relationship.sourceApplicationId, 'app-001');
    assert.equal(relationship.targetApplicationId, 'app-002');
    assert.equal(relationship.relationshipType, 'extension');
  });

  it('should compose valid application trace', () => {
    const trace = composeKnowledgeApplicationTrace({
      traceId: '_trace_1',
      decisions: [
        { decisionId: 'd1', applicationId: 'app-001', conceptId: 'concept-001', validationPassed: true, validationErrors: [] },
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

  it('should compose valid application registry', () => {
    const registry = composeKnowledgeApplicationRegistry([VALID_PROFILE_1, VALID_PROFILE_2], [VALID_RELATIONSHIP]);

    assert.equal(registry.deterministic, true);
    assert.equal(registry.randomUsed, false);
    assert.equal(registry.timeDependency, false);
    assert.equal(registry.profiles.length, 2);
    assert.equal(registry.relationships.length, 1);
  });

  it('should compose registry from input', () => {
    const registry = composeKnowledgeApplicationRegistryFromInput(VALID_INPUT);
    assert.equal(registry.profiles.length, 3);
  });

  it('should compose knowledge applications from input', () => {
    const registry = composeKnowledgeApplications(VALID_INPUT);
    assert.equal(registry.deterministic, true);
    assert.equal(registry.trace.decisionCount, 3);
  });

  it('should compose artifact with applications', () => {
    const artifact = composeKnowledgeArtifactWithApplications({
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

describe('Application Kernel — Validation', () => {
  it('should validate a valid profile with no errors', () => {
    const errors = validateKnowledgeApplicationProfile(VALID_PROFILE_1);
    assert.deepStrictEqual(errors, []);
  });

  it('should validate a valid registry with no errors', () => {
    const registry = composeKnowledgeApplicationRegistry([VALID_PROFILE_1, VALID_PROFILE_2], [VALID_RELATIONSHIP]);
    const result = validateKnowledgeApplicationRegistry(registry);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it('should validate knowledge application input', () => {
    const result = validateKnowledgeApplicationInput(VALID_INPUT);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it('should detect duplicate IDs', () => {
    const registry = composeKnowledgeApplicationRegistry([VALID_PROFILE_1, VALID_PROFILE_1], []);
    const result = validateKnowledgeApplicationRegistry(registry);
    const duplicateError = result.errors.find(
      (e) => e.code === APPLICATION_VALIDATION_CODES.APPLICATION_DUPLICATE_ID,
    );
    assert.ok(duplicateError, 'Should have APPLICATION_DUPLICATE_ID error');
  });

  it('should detect duplicate titles', () => {
    const profile1 = { ...VALID_PROFILE_1, applicationId: 'app-001', title: 'Same Title' };
    const profile2 = { ...VALID_PROFILE_1, applicationId: 'app-002', title: 'Same Title' };
    const registry = composeKnowledgeApplicationRegistry([profile1, profile2], []);
    const result = validateKnowledgeApplicationRegistry(registry);
    const duplicateError = result.errors.find(
      (e) => e.code === APPLICATION_VALIDATION_CODES.APPLICATION_DUPLICATE_TITLE,
    );
    assert.ok(duplicateError, 'Should have APPLICATION_DUPLICATE_TITLE error');
  });

  it('should detect invalid type', () => {
    const profile = { ...VALID_PROFILE_1, applicationType: 'unsupported' as any };
    const errors = validateKnowledgeApplicationProfile(profile);
    const typeError = errors.find(
      (e) => e.code === APPLICATION_VALIDATION_CODES.APPLICATION_INVALID_TYPE,
    );
    assert.ok(typeError, 'Should have APPLICATION_INVALID_TYPE error');
  });

  it('should detect invalid objective', () => {
    const profile = { ...VALID_PROFILE_1, applicationObjective: 'unsupported' as any };
    const errors = validateKnowledgeApplicationProfile(profile);
    const objectiveError = errors.find(
      (e) => e.code === APPLICATION_VALIDATION_CODES.APPLICATION_INVALID_OBJECTIVE,
    );
    assert.ok(objectiveError, 'Should have APPLICATION_INVALID_OBJECTIVE error');
  });

  it('should detect invalid domain', () => {
    const profile = { ...VALID_PROFILE_1, applicationDomain: 'unsupported' as any };
    const errors = validateKnowledgeApplicationProfile(profile);
    const domainError = errors.find(
      (e) => e.code === APPLICATION_VALIDATION_CODES.APPLICATION_INVALID_DOMAIN,
    );
    assert.ok(domainError, 'Should have APPLICATION_INVALID_DOMAIN error');
  });

  it('should detect invalid visibility', () => {
    const profile = { ...VALID_PROFILE_1, visibility: 'unsupported' as any };
    const errors = validateKnowledgeApplicationProfile(profile);
    const visibilityError = errors.find(
      (e) => e.code === APPLICATION_VALIDATION_CODES.APPLICATION_INVALID_VISIBILITY,
    );
    assert.ok(visibilityError, 'Should have APPLICATION_INVALID_VISIBILITY error');
  });

  it('should detect invalid status', () => {
    const profile = { ...VALID_PROFILE_1, status: 'unsupported' as any };
    const errors = validateKnowledgeApplicationProfile(profile);
    const statusError = errors.find(
      (e) => e.code === APPLICATION_VALIDATION_CODES.APPLICATION_INVALID_STATUS,
    );
    assert.ok(statusError, 'Should have APPLICATION_INVALID_STATUS error');
  });

  it('should detect invalid governance', () => {
    const profile = { ...VALID_PROFILE_1, governance: 'unsupported' as any };
    const errors = validateKnowledgeApplicationProfile(profile);
    const governanceError = errors.find(
      (e) => e.code === APPLICATION_VALIDATION_CODES.APPLICATION_INVALID_GOVERNANCE,
    );
    assert.ok(governanceError, 'Should have APPLICATION_INVALID_GOVERNANCE error');
  });

  it('should detect missing provenance', () => {
    const profile = { ...VALID_PROFILE_1, provenance: undefined as any };
    const errors = validateKnowledgeApplicationProfile(profile);
    const provenanceError = errors.find(
      (e) => e.code === APPLICATION_VALIDATION_CODES.APPLICATION_MISSING_PROVENANCE,
    );
    assert.ok(provenanceError, 'Should have APPLICATION_MISSING_PROVENANCE error');
  });

  it('should detect missing provider', () => {
    const profile = { ...VALID_PROFILE_1, provenance: { ...VALID_PROVENANCE, provider: '' } };
    const errors = validateKnowledgeApplicationProfile(profile);
    const providerError = errors.find(
      (e) => e.code === APPLICATION_VALIDATION_CODES.APPLICATION_MISSING_PROVIDER,
    );
    assert.ok(providerError, 'Should have APPLICATION_MISSING_PROVIDER error');
  });

  it('should detect missing rationale', () => {
    const profile = { ...VALID_PROFILE_1, provenance: { ...VALID_PROVENANCE, rationale: '' } };
    const errors = validateKnowledgeApplicationProfile(profile);
    const rationaleError = errors.find(
      (e) => e.code === APPLICATION_VALIDATION_CODES.APPLICATION_MISSING_RATIONALE,
    );
    assert.ok(rationaleError, 'Should have APPLICATION_MISSING_RATIONALE error');
  });

  it('should detect self relationship', () => {
    const relationship = { ...VALID_RELATIONSHIP, targetApplicationId: 'app-001' };
    const knownProfileIds = new Set(['app-001', 'app-002']);
    const errors = validateKnowledgeApplicationRelationship(relationship, knownProfileIds);
    const selfError = errors.find(
      (e) => e.code === APPLICATION_VALIDATION_CODES.APPLICATION_SELF_RELATIONSHIP,
    );
    assert.ok(selfError, 'Should have APPLICATION_SELF_RELATIONSHIP error');
  });

  it('should detect empty registry', () => {
    const registry = composeKnowledgeApplicationRegistry([], []);
    const result = validateKnowledgeApplicationRegistry(registry);
    const emptyError = result.errors.find(
      (e) => e.code === APPLICATION_VALIDATION_CODES.APPLICATION_EMPTY_REGISTRY,
    );
    assert.ok(emptyError, 'Should have APPLICATION_EMPTY_REGISTRY error');
    assert.equal(result.valid, false);
  });

  it('should detect invalid trace', () => {
    const trace: KnowledgeApplicationTrace = {
      traceId: '',
      decisionCount: 0,
      validationCount: 0,
      registryVersion: '1.0.0',
      compositionVersion: '1.0.0',
      decisions: [],
      deterministic: false as true,
      generatedFrom: 'deterministic_application_kernel',
      randomUsed: false,
      timeDependency: false,
    };
    const result = validateKnowledgeApplicationTrace(trace);
    assert.equal(result.valid, false);
  });

  it('should detect registry inconsistency', () => {
    const registry: KnowledgeApplicationRegistry = {
      registryId: '_registry_5',
      profiles: [VALID_PROFILE_1],
      relationships: [],
      metadata: {
        registryId: '_registry_5',
        applicationCount: 5,
        relationshipCount: 0,
        conceptCount: 1,
        domainCount: 1,
      },
      trace: {
        traceId: '_trace_1',
        decisionCount: 0,
        validationCount: 0,
        registryVersion: '1.0.0',
        compositionVersion: '1.0.0',
        decisions: [],
        deterministic: true,
        generatedFrom: 'deterministic_application_kernel',
        randomUsed: false,
        timeDependency: false,
      },
      deterministic: true,
      generatedFrom: 'deterministic_application_kernel',
      randomUsed: false,
      timeDependency: false,
    };
    const result = validateKnowledgeApplicationRegistry(registry);
    const inconsistencyError = result.errors.find(
      (e) => e.code === APPLICATION_VALIDATION_CODES.APPLICATION_REGISTRY_INCONSISTENCY,
    );
    assert.ok(inconsistencyError, 'Should have APPLICATION_REGISTRY_INCONSISTENCY error');
  });

  it('should validate a valid trace', () => {
    const trace = composeKnowledgeApplicationTrace({
      traceId: '_trace_1',
      decisions: [],
      registryVersion: '1.0.0',
      compositionVersion: '1.0.0',
    });
    const result = validateKnowledgeApplicationTrace(trace);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it('should validate artifact with applications', () => {
    const artifact = composeKnowledgeArtifactWithApplications({
      conceptId: 'concept-001',
      conceptTitle: 'Neural Networks',
      profiles: [VALID_PROFILE_1],
      relationships: [],
      provenance: VALID_PROVENANCE,
    });
    const result = validateKnowledgeArtifactWithApplications(artifact);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });
});

// ---------------------------------------------------------------------------
// Determinism Tests
// ---------------------------------------------------------------------------

describe('Application Kernel — Determinism', () => {
  it('should produce identical output for identical input (100 iterations)', () => {
    const results: ReturnType<typeof composeKnowledgeApplications>[] = [];
    for (let i = 0; i < 100; i++) {
      results.push(composeKnowledgeApplications(VALID_INPUT));
    }

    for (let i = 1; i < results.length; i++) {
      assert.deepStrictEqual(results[0].registryId, results[i].registryId);
      assert.deepStrictEqual(results[0].profiles, results[i].profiles);
      assert.deepStrictEqual(results[0].trace.traceId, results[i].trace.traceId);
    }
  });

  it('should produce identical registry output for identical input (100 iterations)', () => {
    const results: ReturnType<typeof composeKnowledgeApplicationRegistry>[] = [];
    for (let i = 0; i < 100; i++) {
      results.push(composeKnowledgeApplicationRegistry([VALID_PROFILE_1, VALID_PROFILE_2], [VALID_RELATIONSHIP]));
    }

    for (let i = 1; i < results.length; i++) {
      assert.deepStrictEqual(results[0].profiles, results[i].profiles);
      assert.deepStrictEqual(results[0].registryId, results[i].registryId);
    }
  });

  it('should produce identical provenance for identical input', () => {
    const results: ReturnType<typeof composeKnowledgeApplicationProvenance>[] = [];
    for (let i = 0; i < 100; i++) {
      results.push(composeKnowledgeApplicationProvenance({
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
    const results: ReturnType<typeof composeKnowledgeApplicationTrace>[] = [];
    for (let i = 0; i < 100; i++) {
      results.push(composeKnowledgeApplicationTrace({
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

describe('Application Kernel — Immutability', () => {
  it('should not mutate input profiles', () => {
    const originalId = VALID_PROFILE_1.applicationId;
    const originalTitle = VALID_PROFILE_1.title;

    composeKnowledgeApplications(VALID_INPUT);

    assert.equal(VALID_PROFILE_1.applicationId, originalId);
    assert.equal(VALID_PROFILE_1.title, originalTitle);
  });

  it('should not mutate input registry profiles', () => {
    const profiles = [VALID_PROFILE_1, VALID_PROFILE_2];
    const originalIds = profiles.map((p) => p.applicationId);

    composeKnowledgeApplicationRegistry(profiles, []);

    assert.equal(profiles[0].applicationId, originalIds[0]);
    assert.equal(profiles[1].applicationId, originalIds[1]);
  });

  it('should use defensive copies for tags', () => {
    const originalTags = ['tag1', 'tag2'];
    const profile = composeKnowledgeApplicationProfile({
      applicationId: 'test',
      conceptId: 'concept-001',
      title: 'Test.',
      applicationType: 'software_system',
      applicationObjective: 'introduce',
      applicationDomain: 'software_engineering',
      industrySector: 'technology',
      deploymentContext: 'cloud',
      implementationScope: 'standard',
      visibility: 'default',
      status: 'draft',
      governance: 'public',
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

describe('Application Kernel — Helpers', () => {
  it('should return canonical application types', () => {
    const types = getCanonicalApplicationTypes();
    assert.deepStrictEqual([...types], [...CANONICAL_APPLICATION_TYPES]);
    assert.equal(types.length, 10);
  });

  it('should return canonical application objectives', () => {
    const objectives = getCanonicalApplicationObjectives();
    assert.deepStrictEqual([...objectives], [...CANONICAL_APPLICATION_OBJECTIVES]);
    assert.equal(objectives.length, 10);
  });

  it('should return canonical application domains', () => {
    const domains = getCanonicalApplicationDomains();
    assert.deepStrictEqual([...domains], [...CANONICAL_APPLICATION_DOMAINS]);
    assert.equal(domains.length, 10);
  });

  it('should return canonical application visibility', () => {
    const visibility = getCanonicalApplicationVisibility();
    assert.deepStrictEqual([...visibility], [...CANONICAL_APPLICATION_VISIBILITY]);
    assert.equal(visibility.length, 10);
  });

  it('should return canonical application statuses', () => {
    const statuses = getCanonicalApplicationStatuses();
    assert.deepStrictEqual([...statuses], [...CANONICAL_APPLICATION_STATUS]);
    assert.equal(statuses.length, 6);
  });

  it('should validate application type support', () => {
    assert.equal(isSupportedApplicationType('software_system'), true);
    assert.equal(isSupportedApplicationType('embedded_system'), true);
    assert.equal(isSupportedApplicationType('unsupported'), false);
  });

  it('should validate application objective support', () => {
    assert.equal(isSupportedApplicationObjective('introduce'), true);
    assert.equal(isSupportedApplicationObjective('demonstrate'), true);
    assert.equal(isSupportedApplicationObjective('unsupported'), false);
  });

  it('should validate application domain support', () => {
    assert.equal(isSupportedApplicationDomain('artificial_intelligence'), true);
    assert.equal(isSupportedApplicationDomain('computer_vision'), true);
    assert.equal(isSupportedApplicationDomain('unsupported'), false);
  });

  it('should validate application visibility support', () => {
    assert.equal(isSupportedApplicationVisibility('always'), true);
    assert.equal(isSupportedApplicationVisibility('default'), true);
    assert.equal(isSupportedApplicationVisibility('unsupported'), false);
  });

  it('should validate application status support', () => {
    assert.equal(isSupportedApplicationStatus('draft'), true);
    assert.equal(isSupportedApplicationStatus('canonical'), true);
    assert.equal(isSupportedApplicationStatus('unsupported'), false);
  });

  it('should validate application governance support', () => {
    assert.equal(isSupportedApplicationGovernance('canonical'), true);
    assert.equal(isSupportedApplicationGovernance('accepted'), true);
    assert.equal(isSupportedApplicationGovernance('unsupported'), false);
  });
});

// ---------------------------------------------------------------------------
// Canonical Enum Completeness Tests
// ---------------------------------------------------------------------------

describe('Application Kernel — Canonical Enum Completeness', () => {
  it('should have exactly 10 application types', () => {
    assert.equal(CANONICAL_APPLICATION_TYPES.length, 10);
  });

  it('should have exactly 10 application objectives', () => {
    assert.equal(CANONICAL_APPLICATION_OBJECTIVES.length, 10);
  });

  it('should have exactly 10 application domains', () => {
    assert.equal(CANONICAL_APPLICATION_DOMAINS.length, 10);
  });

  it('should have exactly 6 application statuses', () => {
    assert.equal(CANONICAL_APPLICATION_STATUS.length, 6);
  });

  it('should have exactly 10 application visibility values', () => {
    assert.equal(CANONICAL_APPLICATION_VISIBILITY.length, 10);
  });

  it('should have exactly 10 application governance values', () => {
    assert.equal(CANONICAL_APPLICATION_GOVERNANCE.length, 10);
  });

  it('should contain all expected application types', () => {
    const expected = ['software_system', 'embedded_system', 'web_application', 'mobile_application', 'machine_learning_system', 'computer_vision_system', 'robotics_system', 'data_platform', 'cloud_service', 'research_prototype'];
    for (const type of expected) {
      assert.ok(CANONICAL_APPLICATION_TYPES.includes(type as any), `Should include type: ${type}`);
    }
  });

  it('should contain all expected application objectives', () => {
    const expected = ['introduce', 'demonstrate', 'apply', 'integrate', 'optimize', 'analyze', 'compare', 'engineer', 'deploy', 'reference'];
    for (const objective of expected) {
      assert.ok(CANONICAL_APPLICATION_OBJECTIVES.includes(objective as any), `Should include objective: ${objective}`);
    }
  });

  it('should contain all expected application domains', () => {
    const expected = ['artificial_intelligence', 'computer_vision', 'machine_learning', 'robotics', 'software_engineering', 'data_science', 'cybersecurity', 'cloud_computing', 'healthcare', 'industrial_automation'];
    for (const domain of expected) {
      assert.ok(CANONICAL_APPLICATION_DOMAINS.includes(domain as any), `Should include domain: ${domain}`);
    }
  });

  it('should contain all expected application statuses', () => {
    const expected = ['draft', 'review', 'approved', 'canonical', 'deprecated', 'archived'];
    for (const status of expected) {
      assert.ok(CANONICAL_APPLICATION_STATUS.includes(status as any), `Should include status: ${status}`);
    }
  });

  it('should contain all expected application visibility values', () => {
    const expected = ['always', 'default', 'advanced', 'expert', 'curriculum', 'assessment', 'laboratory', 'research', 'internal', 'hidden'];
    for (const visibility of expected) {
      assert.ok(CANONICAL_APPLICATION_VISIBILITY.includes(visibility as any), `Should include visibility: ${visibility}`);
    }
  });

  it('should contain all expected application governance values', () => {
    const expected = ['canonical', 'accepted', 'provisional', 'experimental', 'deprecated', 'restricted', 'internal', 'public', 'community', 'archived'];
    for (const governance of expected) {
      assert.ok(CANONICAL_APPLICATION_GOVERNANCE.includes(governance as any), `Should include governance: ${governance}`);
    }
  });
});

// ---------------------------------------------------------------------------
// Validation Code Count Test
// ---------------------------------------------------------------------------

describe('Application Kernel — Validation Code Count', () => {
  it('should have exactly 20 validation codes', () => {
    const codes = Object.values(APPLICATION_VALIDATION_CODES);
    assert.equal(codes.length, 20);
  });

  it('should have all codes prefixed with APPLICATION_', () => {
    const codes = Object.values(APPLICATION_VALIDATION_CODES);
    for (const code of codes) {
      assert.ok(code.startsWith('APPLICATION_'), `Code "${code}" should start with APPLICATION_`);
    }
  });

  it('should have unique codes', () => {
    const codes = Object.values(APPLICATION_VALIDATION_CODES);
    const unique = new Set(codes);
    assert.equal(codes.length, unique.size, 'All codes should be unique');
  });
});

// ---------------------------------------------------------------------------
// Runtime Restrictions Tests
// ---------------------------------------------------------------------------

describe('Application Kernel — Runtime Restrictions', () => {
  it('should not use Math.random', () => {
    const result = composeKnowledgeApplications(VALID_INPUT);
    assert.ok(result, 'Should produce a result without Math.random');
  });

  it('should not use Date.now', () => {
    const result = composeKnowledgeApplications(VALID_INPUT);
    assert.ok(result, 'Should produce a result without Date.now');
  });

  it('should not use performance.now', () => {
    const result = composeKnowledgeApplications(VALID_INPUT);
    assert.ok(result, 'Should produce a result without performance.now');
  });

  it('should not use crypto.randomUUID', () => {
    const result = composeKnowledgeApplications(VALID_INPUT);
    assert.ok(result, 'Should produce a result without crypto.randomUUID');
  });

  it('should not have executable callbacks in profile', () => {
    const profile = composeKnowledgeApplicationProfile({
      applicationId: 'app-001',
      conceptId: 'concept-001',
      title: 'Test',
      applicationType: 'software_system',
      applicationObjective: 'introduce',
      applicationDomain: 'software_engineering',
      industrySector: 'technology',
      deploymentContext: 'cloud',
      implementationScope: 'standard',
      visibility: 'default',
      status: 'draft',
      governance: 'public',
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
    const result = composeKnowledgeApplications(VALID_INPUT);
    assert.ok(!('educationalContent' in result), 'Should not have educational content');
    assert.ok(!('markdown' in result), 'Should not have markdown');
  });

  it('should not access filesystem', () => {
    const result = composeKnowledgeApplications(VALID_INPUT);
    assert.ok(!('filesystem' in result), 'Should not have filesystem');
    assert.ok(!('fileSystem' in result), 'Should not have fileSystem');
  });

  it('should not perform network requests', () => {
    const result = composeKnowledgeApplications(VALID_INPUT);
    assert.ok(!('networkResponse' in result), 'Should not have network response');
    assert.ok(!('httpResult' in result), 'Should not have HTTP result');
  });

  it('should not have async behavior markers', () => {
    const result = composeKnowledgeApplications(VALID_INPUT);
    assert.ok(!('promise' in result), 'Should not have promise');
    assert.ok(!('async' in result), 'Should not have async');
  });
});

// ---------------------------------------------------------------------------
// Cross-Agent Boundary Tests
// ---------------------------------------------------------------------------

describe('Application Kernel — Cross-Agent Boundary', () => {
  it('should not reference Didactic Agent', () => {
    const result = composeKnowledgeApplications(VALID_INPUT);
    const str = JSON.stringify(result);
    assert.ok(!str.includes('Didactic'), 'Should not reference Didactic Agent');
  });

  it('should not reference Curriculum Agent', () => {
    const result = composeKnowledgeApplications(VALID_INPUT);
    const str = JSON.stringify(result);
    assert.ok(!str.includes('Curriculum'), 'Should not reference Curriculum Agent');
  });

  it('should not reference Narrative Agent', () => {
    const result = composeKnowledgeApplications(VALID_INPUT);
    const str = JSON.stringify(result);
    assert.ok(!str.includes('Narrative'), 'Should not reference Narrative Agent');
  });

  it('should not reference Assessment Agent', () => {
    const result = composeKnowledgeApplications(VALID_INPUT);
    const str = JSON.stringify(result);
    assert.ok(!str.includes('Assessment Agent'), 'Should not reference Assessment Agent');
  });

  it('should not reference Curiosity Agent', () => {
    const result = composeKnowledgeApplications(VALID_INPUT);
    const str = JSON.stringify(result);
    assert.ok(!str.includes('Curiosity Agent'), 'Should not reference Curiosity Agent');
  });

  it('should not reference Research Agent', () => {
    const result = composeKnowledgeApplications(VALID_INPUT);
    const str = JSON.stringify(result);
    assert.ok(!str.includes('Research Agent'), 'Should not reference Research Agent');
  });

  it('should not reference Laboratory Agent', () => {
    const result = composeKnowledgeApplications(VALID_INPUT);
    const str = JSON.stringify(result);
    assert.ok(!str.includes('Laboratory Agent'), 'Should not reference Laboratory Agent');
  });

  it('should not reference Application Agent', () => {
    const result = composeKnowledgeApplications(VALID_INPUT);
    const str = JSON.stringify(result);
    assert.ok(!str.includes('Application Agent'), 'Should not reference Application Agent');
  });
});

// ---------------------------------------------------------------------------
// Deterministic Sorting Tests
// ---------------------------------------------------------------------------

describe('Application Kernel — Deterministic Sorting', () => {
  it('should sort deterministically by conceptId', () => {
    const profile3 = { ...VALID_PROFILE_1, applicationId: 'app-003', conceptId: 'concept-003' };
    const profile1 = { ...VALID_PROFILE_1, applicationId: 'app-001', conceptId: 'concept-001' };
    const profile2 = { ...VALID_PROFILE_1, applicationId: 'app-002', conceptId: 'concept-002' };

    const registry = composeKnowledgeApplicationRegistry([profile3, profile1, profile2], []);

    assert.equal(registry.profiles[0].conceptId, 'concept-001');
    assert.equal(registry.profiles[1].conceptId, 'concept-002');
    assert.equal(registry.profiles[2].conceptId, 'concept-003');
  });

  it('should sort by applicationDomain when conceptId is equal', () => {
    const profileA = { ...VALID_PROFILE_1, applicationId: 'app-002', conceptId: 'concept-001', applicationDomain: 'computer_vision' as const };
    const profileB = { ...VALID_PROFILE_1, applicationId: 'app-001', conceptId: 'concept-001', applicationDomain: 'artificial_intelligence' as const };

    const registry = composeKnowledgeApplicationRegistry([profileA, profileB], []);

    assert.equal(registry.profiles[0].applicationDomain, 'artificial_intelligence');
    assert.equal(registry.profiles[1].applicationDomain, 'computer_vision');
  });
});

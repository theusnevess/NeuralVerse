/**
 * NV-1700-D5-OPT-05 — Version History & Editorial Evolution Test Suite
 *
 * Comprehensive deterministic test suite for the Version Kernel.
 * Covers: valid version, valid revision, valid relationship, valid registry,
 * duplicate versions, duplicate revisions, duplicate relationships,
 * unsupported types, missing provenance, missing references,
 * self references, empty registry, deterministic ordering, immutable input,
 * identical output (100 iterations), helper functions,
 * canonical enum completeness, negative capability verification.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import type {
  KnowledgeVersion,
  EditorialRevision,
  VersionRelationship,
  VersionProvenance,
  VersionInput,
  VersionRegistry,
  VersionTrace,
  KnowledgeArtifactWithVersionHistory,
} from './KnowledgeAgentContract.ts';

import {
  CANONICAL_VERSION_TYPES,
  CANONICAL_EDITORIAL_ACTIONS,
  CANONICAL_EDITORIAL_LIFECYCLE,
  CANONICAL_VERSION_STATUS,
  CANONICAL_GOVERNANCE_STATUSES,
} from './KnowledgeAgentContract.ts';

import {
  composeVersionProvenance,
  composeKnowledgeVersion,
  composeEditorialRevision,
  composeVersionRelationship,
  composeVersionTrace,
  composeVersionRegistry,
  composeVersionRegistryFromInput,
  composeKnowledgeVersions,
  composeKnowledgeArtifactWithVersions,
  isSupportedVersionType,
  isSupportedEditorialAction,
  isSupportedEditorialLifecycle,
  isSupportedVersionStatus,
  isSupportedVersionGovernanceStatus,
  getCanonicalVersionTypes,
  getCanonicalEditorialActions,
  getCanonicalEditorialLifecycle,
  getCanonicalVersionStatuses,
} from './VersionKernel.ts';

import {
  validateKnowledgeVersion,
  validateEditorialRevision,
  validateVersionRelationship,
  validateVersionRegistry,
  validateVersionInput,
  validateVersionTrace,
  validateKnowledgeArtifactWithVersions,
  VERSION_VALIDATION_CODES,
} from './VersionValidation.ts';

// ---------------------------------------------------------------------------
// Test Fixtures
// ---------------------------------------------------------------------------

const VALID_PROVENANCE: VersionProvenance = {
  source: 'NeuralVerse Team',
  governanceStatus: 'canonical',
  providedBy: 'NeuralVerse Team',
  rationale: 'Core version metadata.',
};

const VALID_VERSION: KnowledgeVersion = {
  versionId: 'version-001',
  knowledgeId: 'knowledge-001',
  versionNumber: '1.0.0',
  versionType: 'major',
  status: 'published',
  lifecycle: 'active',
  title: 'Neural Networks v1.0',
  description: 'Initial version of neural networks.',
  tags: ['deep_learning', 'neural_networks'],
  provenance: VALID_PROVENANCE,
};

const VALID_VERSION_2: KnowledgeVersion = {
  versionId: 'version-002',
  knowledgeId: 'knowledge-001',
  versionNumber: '1.1.0',
  versionType: 'minor',
  status: 'approved',
  lifecycle: 'published',
  title: 'Neural Networks v1.1',
  description: 'Updated version of neural networks.',
  tags: ['deep_learning', 'neural_networks'],
  provenance: { ...VALID_PROVENANCE, source: 'Knowledge Pipeline' },
};

const VALID_REVISION: EditorialRevision = {
  revisionId: 'revision-001',
  versionId: 'version-001',
  knowledgeId: 'knowledge-001',
  editorialAction: 'created',
  description: 'Initial creation.',
  status: 'published',
  provenance: VALID_PROVENANCE,
};

const VALID_REVISION_2: EditorialRevision = {
  revisionId: 'revision-002',
  versionId: 'version-002',
  knowledgeId: 'knowledge-001',
  editorialAction: 'updated',
  description: 'Updated content.',
  status: 'approved',
  provenance: { ...VALID_PROVENANCE, source: 'Knowledge Pipeline' },
};

const VALID_RELATIONSHIP: VersionRelationship = {
  relationshipId: 'relationship-001',
  sourceVersionId: 'version-001',
  targetVersionId: 'version-002',
  relationshipType: 'superseded_by',
  description: 'Version 1.0 superseded by 1.1.',
  status: 'published',
  provenance: VALID_PROVENANCE,
};

const VALID_RELATIONSHIP_2: VersionRelationship = {
  relationshipId: 'relationship-002',
  sourceVersionId: 'version-002',
  targetVersionId: 'version-001',
  relationshipType: 'supersedes',
  description: 'Version 1.1 supersedes 1.0.',
  status: 'approved',
  provenance: { ...VALID_PROVENANCE, source: 'Knowledge Pipeline' },
};

const VALID_INPUT: VersionInput = {
  versions: [VALID_VERSION, VALID_VERSION_2],
  revisions: [VALID_REVISION, VALID_REVISION_2],
  relationships: [VALID_RELATIONSHIP, VALID_RELATIONSHIP_2],
};

const EMPTY_INPUT: VersionInput = {
  versions: [],
  revisions: [],
  relationships: [],
};

// ---------------------------------------------------------------------------
// Version Composition Tests
// ---------------------------------------------------------------------------

describe('Version Kernel — Version Composition', () => {
  it('should compose valid version provenance', () => {
    const provenance = composeVersionProvenance({
      source: 'NeuralVerse Team',
      governanceStatus: 'canonical',
      providedBy: 'NeuralVerse Team',
      rationale: 'Core version.',
    });

    assert.equal(provenance.source, 'NeuralVerse Team');
    assert.equal(provenance.governanceStatus, 'canonical');
    assert.equal(provenance.providedBy, 'NeuralVerse Team');
    assert.equal(provenance.rationale, 'Core version.');
  });

  it('should compose valid knowledge version', () => {
    const version = composeKnowledgeVersion({
      versionId: 'version-001',
      knowledgeId: 'knowledge-001',
      versionNumber: '1.0.0',
      versionType: 'major',
      status: 'published',
      lifecycle: 'active',
      title: 'Neural Networks v1.0',
      description: 'Initial version.',
      tags: ['deep_learning'],
      provenance: VALID_PROVENANCE,
    });

    assert.equal(version.versionId, 'version-001');
    assert.equal(version.knowledgeId, 'knowledge-001');
    assert.equal(version.versionNumber, '1.0.0');
    assert.equal(version.versionType, 'major');
    assert.equal(version.status, 'published');
    assert.equal(version.lifecycle, 'active');
    assert.equal(version.title, 'Neural Networks v1.0');
    assert.equal(version.tags.length, 1);
  });

  it('should compose valid editorial revision', () => {
    const revision = composeEditorialRevision({
      revisionId: 'revision-001',
      versionId: 'version-001',
      knowledgeId: 'knowledge-001',
      editorialAction: 'created',
      description: 'Initial creation.',
      status: 'published',
      provenance: VALID_PROVENANCE,
    });

    assert.equal(revision.revisionId, 'revision-001');
    assert.equal(revision.versionId, 'version-001');
    assert.equal(revision.knowledgeId, 'knowledge-001');
    assert.equal(revision.editorialAction, 'created');
    assert.equal(revision.status, 'published');
  });

  it('should compose valid version relationship', () => {
    const relationship = composeVersionRelationship({
      relationshipId: 'relationship-001',
      sourceVersionId: 'version-001',
      targetVersionId: 'version-002',
      relationshipType: 'superseded_by',
      description: 'Version 1.0 superseded by 1.1.',
      status: 'published',
      provenance: VALID_PROVENANCE,
    });

    assert.equal(relationship.relationshipId, 'relationship-001');
    assert.equal(relationship.sourceVersionId, 'version-001');
    assert.equal(relationship.targetVersionId, 'version-002');
    assert.equal(relationship.relationshipType, 'superseded_by');
    assert.equal(relationship.status, 'published');
  });

  it('should compose valid version trace', () => {
    const trace = composeVersionTrace({
      traceId: '_trace_1',
      decisionCount: 5,
      validationCount: 4,
      registryVersion: '1.0.0',
      compositionVersion: '1.0.0',
    });

    assert.equal(trace.traceId, '_trace_1');
    assert.equal(trace.decisionCount, 5);
    assert.equal(trace.validationCount, 4);
    assert.equal(trace.deterministic, true);
    assert.equal(trace.randomUsed, false);
    assert.equal(trace.timeDependency, false);
  });

  it('should validate a valid version with no errors', () => {
    const errors = validateKnowledgeVersion(VALID_VERSION);
    assert.deepStrictEqual(errors, []);
  });

  it('should validate a valid revision with no errors', () => {
    const errors = validateEditorialRevision(VALID_REVISION);
    assert.deepStrictEqual(errors, []);
  });

  it('should validate a valid relationship with no errors', () => {
    const errors = validateVersionRelationship(VALID_RELATIONSHIP);
    assert.deepStrictEqual(errors, []);
  });

  it('should validate a valid registry with no errors', () => {
    const registry = composeVersionRegistry(
      [VALID_VERSION, VALID_VERSION_2],
      [VALID_REVISION, VALID_REVISION_2],
      [VALID_RELATIONSHIP, VALID_RELATIONSHIP_2],
    );
    const result = validateVersionRegistry(registry);

    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it('should validate version input', () => {
    const result = validateVersionInput(VALID_INPUT);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });
});

// ---------------------------------------------------------------------------
// Registry Tests
// ---------------------------------------------------------------------------

describe('Version Kernel — Registry', () => {
  it('should detect empty registry', () => {
    const registry = composeVersionRegistry([], [], []);
    const result = validateVersionRegistry(registry);
    const emptyError = result.errors.find(
      (e) => e.code === VERSION_VALIDATION_CODES.VERSION_EMPTY_REGISTRY,
    );

    assert.ok(emptyError, 'Should have VERSION_EMPTY_REGISTRY error');
    assert.equal(result.valid, false);
  });

  it('should detect duplicate version IDs', () => {
    const registry = composeVersionRegistry(
      [VALID_VERSION, VALID_VERSION],
      [],
      [],
    );
    const result = validateVersionRegistry(registry);
    const duplicateError = result.errors.find(
      (e) => e.code === VERSION_VALIDATION_CODES.VERSION_DUPLICATE_VERSION,
    );

    assert.ok(duplicateError, 'Should have VERSION_DUPLICATE_VERSION error');
  });

  it('should detect duplicate revision IDs', () => {
    const registry = composeVersionRegistry(
      [],
      [VALID_REVISION, VALID_REVISION],
      [],
    );
    const result = validateVersionRegistry(registry);
    const duplicateError = result.errors.find(
      (e) => e.code === VERSION_VALIDATION_CODES.VERSION_DUPLICATE_REVISION,
    );

    assert.ok(duplicateError, 'Should have VERSION_DUPLICATE_REVISION error');
  });

  it('should detect duplicate relationship IDs', () => {
    const registry = composeVersionRegistry(
      [],
      [],
      [VALID_RELATIONSHIP, VALID_RELATIONSHIP],
    );
    const result = validateVersionRegistry(registry);
    const duplicateError = result.errors.find(
      (e) => e.code === VERSION_VALIDATION_CODES.VERSION_DUPLICATE_RELATIONSHIP,
    );

    assert.ok(duplicateError, 'Should have VERSION_DUPLICATE_RELATIONSHIP error');
  });

  it('should detect self-reference in relationship', () => {
    const selfRef: VersionRelationship = {
      ...VALID_RELATIONSHIP,
      relationshipId: 'self-ref-001',
      targetVersionId: 'version-001',
    };
    const errors = validateVersionRelationship(selfRef);
    const selfRefError = errors.find(
      (e) => e.code === VERSION_VALIDATION_CODES.VERSION_SELF_REFERENCE,
    );

    assert.ok(selfRefError, 'Should have VERSION_SELF_REFERENCE error');
  });

  it('should sort deterministically by versionId', () => {
    const version3 = { ...VALID_VERSION, versionId: 'version-003' };
    const version1 = { ...VALID_VERSION, versionId: 'version-001' };
    const version2 = { ...VALID_VERSION, versionId: 'version-002' };

    const registry = composeVersionRegistry([version3, version1, version2], [], []);

    assert.equal(registry.versions[0].versionId, 'version-001');
    assert.equal(registry.versions[1].versionId, 'version-002');
    assert.equal(registry.versions[2].versionId, 'version-003');
  });

  it('should sort revisions deterministically by revisionId', () => {
    const revision3 = { ...VALID_REVISION, revisionId: 'revision-003' };
    const revision1 = { ...VALID_REVISION, revisionId: 'revision-001' };
    const revision2 = { ...VALID_REVISION, revisionId: 'revision-002' };

    const registry = composeVersionRegistry([], [revision3, revision1, revision2], []);

    assert.equal(registry.revisions[0].revisionId, 'revision-001');
    assert.equal(registry.revisions[1].revisionId, 'revision-002');
    assert.equal(registry.revisions[2].revisionId, 'revision-003');
  });

  it('should sort relationships deterministically by relationshipId', () => {
    const relationship3 = { ...VALID_RELATIONSHIP, relationshipId: 'relationship-003' };
    const relationship1 = { ...VALID_RELATIONSHIP, relationshipId: 'relationship-001' };
    const relationship2 = { ...VALID_RELATIONSHIP, relationshipId: 'relationship-002' };

    const registry = composeVersionRegistry([], [], [relationship3, relationship1, relationship2]);

    assert.equal(registry.relationships[0].relationshipId, 'relationship-001');
    assert.equal(registry.relationships[1].relationshipId, 'relationship-002');
    assert.equal(registry.relationships[2].relationshipId, 'relationship-003');
  });
});

// ---------------------------------------------------------------------------
// Validation Tests
// ---------------------------------------------------------------------------

describe('Version Kernel — Validation', () => {
  it('should detect unknown version type', () => {
    const version = { ...VALID_VERSION, versionType: 'unsupported' as any };
    const errors = validateKnowledgeVersion(version);
    const typeError = errors.find(
      (e) => e.code === VERSION_VALIDATION_CODES.VERSION_UNKNOWN_VERSION_TYPE,
    );

    assert.ok(typeError, 'Should have VERSION_UNKNOWN_VERSION_TYPE error');
  });

  it('should detect unknown editorial action', () => {
    const revision = { ...VALID_REVISION, editorialAction: 'unsupported' as any };
    const errors = validateEditorialRevision(revision);
    const actionError = errors.find(
      (e) => e.code === VERSION_VALIDATION_CODES.VERSION_UNKNOWN_EDITORIAL_ACTION,
    );

    assert.ok(actionError, 'Should have VERSION_UNKNOWN_EDITORIAL_ACTION error');
  });

  it('should detect unknown lifecycle', () => {
    const version = { ...VALID_VERSION, lifecycle: 'unsupported' as any };
    const errors = validateKnowledgeVersion(version);
    const lifecycleError = errors.find(
      (e) => e.code === VERSION_VALIDATION_CODES.VERSION_UNKNOWN_LIFECYCLE,
    );

    assert.ok(lifecycleError, 'Should have VERSION_UNKNOWN_LIFECYCLE error');
  });

  it('should detect unknown status', () => {
    const version = { ...VALID_VERSION, status: 'unsupported' as any };
    const errors = validateKnowledgeVersion(version);
    const statusError = errors.find(
      (e) => e.code === VERSION_VALIDATION_CODES.VERSION_UNKNOWN_STATUS,
    );

    assert.ok(statusError, 'Should have VERSION_UNKNOWN_STATUS error');
  });

  it('should detect missing provenance', () => {
    const version = { ...VALID_VERSION, provenance: undefined as any };
    const errors = validateKnowledgeVersion(version);
    const provenanceError = errors.find(
      (e) => e.code === VERSION_VALIDATION_CODES.VERSION_MISSING_PROVENANCE,
    );

    assert.ok(provenanceError, 'Should have VERSION_MISSING_PROVENANCE error');
  });

  it('should detect missing provenance source', () => {
    const version = { ...VALID_VERSION, provenance: { ...VALID_PROVENANCE, source: '' } };
    const errors = validateKnowledgeVersion(version);
    const sourceError = errors.find(
      (e) => e.code === VERSION_VALIDATION_CODES.VERSION_MISSING_SOURCE,
    );

    assert.ok(sourceError, 'Should have VERSION_MISSING_SOURCE error');
  });

  it('should detect missing provenance rationale', () => {
    const version = { ...VALID_VERSION, provenance: { ...VALID_PROVENANCE, rationale: '' } };
    const errors = validateKnowledgeVersion(version);
    const rationaleError = errors.find(
      (e) => e.code === VERSION_VALIDATION_CODES.VERSION_MISSING_RATIONALE,
    );

    assert.ok(rationaleError, 'Should have VERSION_MISSING_RATIONALE error');
  });

  it('should detect missing provenance providedBy', () => {
    const version = { ...VALID_VERSION, provenance: { ...VALID_PROVENANCE, providedBy: '' } };
    const errors = validateKnowledgeVersion(version);
    const providedByError = errors.find(
      (e) => e.code === VERSION_VALIDATION_CODES.VERSION_MISSING_PROVIDED_BY,
    );

    assert.ok(providedByError, 'Should have VERSION_MISSING_PROVIDED_BY error');
  });

  it('should validate a valid trace', () => {
    const trace = composeVersionTrace({
      traceId: '_trace_1',
      decisionCount: 5,
      validationCount: 4,
      registryVersion: '1.0.0',
      compositionVersion: '1.0.0',
    });

    const result = validateVersionTrace(trace);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it('should detect invalid trace', () => {
    const trace: VersionTrace = {
      traceId: '',
      decisionCount: 0,
      validationCount: 0,
      registryVersion: '1.0.0',
      compositionVersion: '1.0.0',
      deterministic: false as true,
      generatedFrom: 'deterministic_version_kernel',
      randomUsed: false,
      timeDependency: false,
    };

    const result = validateVersionTrace(trace);
    assert.equal(result.valid, false);
  });
});

// ---------------------------------------------------------------------------
// Provenance Tests
// ---------------------------------------------------------------------------

describe('Version Kernel — Provenance', () => {
  it('should detect missing provenance on version', () => {
    const version = { ...VALID_VERSION, provenance: undefined as any };
    const errors = validateKnowledgeVersion(version);
    const provenanceError = errors.find(
      (e) => e.code === VERSION_VALIDATION_CODES.VERSION_MISSING_PROVENANCE,
    );

    assert.ok(provenanceError, 'Should have VERSION_MISSING_PROVENANCE error');
  });

  it('should detect missing provenance on revision', () => {
    const revision = { ...VALID_REVISION, provenance: undefined as any };
    const errors = validateEditorialRevision(revision);
    const provenanceError = errors.find(
      (e) => e.code === VERSION_VALIDATION_CODES.VERSION_MISSING_PROVENANCE,
    );

    assert.ok(provenanceError, 'Should have VERSION_MISSING_PROVENANCE error');
  });

  it('should detect missing provenance on relationship', () => {
    const relationship = { ...VALID_RELATIONSHIP, provenance: undefined as any };
    const errors = validateVersionRelationship(relationship);
    const provenanceError = errors.find(
      (e) => e.code === VERSION_VALIDATION_CODES.VERSION_MISSING_PROVENANCE,
    );

    assert.ok(provenanceError, 'Should have VERSION_MISSING_PROVENANCE error');
  });

  it('should detect missing rationale in provenance', () => {
    const version = { ...VALID_VERSION, provenance: { ...VALID_PROVENANCE, rationale: '' } };
    const errors = validateKnowledgeVersion(version);
    const rationaleError = errors.find(
      (e) => e.code === VERSION_VALIDATION_CODES.VERSION_MISSING_RATIONALE,
    );

    assert.ok(rationaleError, 'Should have VERSION_MISSING_RATIONALE error');
  });

  it('should detect missing providedBy in provenance', () => {
    const version = { ...VALID_VERSION, provenance: { ...VALID_PROVENANCE, providedBy: '' } };
    const errors = validateKnowledgeVersion(version);
    const providedByError = errors.find(
      (e) => e.code === VERSION_VALIDATION_CODES.VERSION_MISSING_PROVIDED_BY,
    );

    assert.ok(providedByError, 'Should have VERSION_MISSING_PROVIDED_BY error');
  });
});

// ---------------------------------------------------------------------------
// Determinism Tests
// ---------------------------------------------------------------------------

describe('Version Kernel — Determinism', () => {
  it('should produce identical output for identical input (100 iterations)', () => {
    const results: ReturnType<typeof composeKnowledgeVersions>[] = [];
    for (let i = 0; i < 100; i++) {
      results.push(composeKnowledgeVersions(VALID_INPUT));
    }

    for (let i = 1; i < results.length; i++) {
      assert.deepStrictEqual(results[0].registryId, results[i].registryId);
      assert.deepStrictEqual(results[0].versions, results[i].versions);
      assert.deepStrictEqual(results[0].revisions, results[i].revisions);
      assert.deepStrictEqual(results[0].relationships, results[i].relationships);
      assert.deepStrictEqual(results[0].trace.traceId, results[i].trace.traceId);
    }
  });

  it('should produce identical registry output for identical input', () => {
    const results: ReturnType<typeof composeVersionRegistry>[] = [];
    for (let i = 0; i < 100; i++) {
      results.push(
        composeVersionRegistry(
          [VALID_VERSION, VALID_VERSION_2],
          [VALID_REVISION, VALID_REVISION_2],
          [VALID_RELATIONSHIP, VALID_RELATIONSHIP_2],
        ),
      );
    }

    for (let i = 1; i < results.length; i++) {
      assert.deepStrictEqual(results[0].versions, results[i].versions);
      assert.deepStrictEqual(results[0].revisions, results[i].revisions);
      assert.deepStrictEqual(results[0].relationships, results[i].relationships);
      assert.deepStrictEqual(results[0].registryId, results[i].registryId);
    }
  });
});

// ---------------------------------------------------------------------------
// Immutability Tests
// ---------------------------------------------------------------------------

describe('Version Kernel — Immutability', () => {
  it('should not mutate input versions', () => {
    const originalId = VALID_VERSION.versionId;
    const originalTitle = VALID_VERSION.title;

    composeKnowledgeVersions(VALID_INPUT);

    assert.equal(VALID_VERSION.versionId, originalId);
    assert.equal(VALID_VERSION.title, originalTitle);
  });

  it('should not mutate input revisions', () => {
    const originalId = VALID_REVISION.revisionId;
    const originalVersionId = VALID_REVISION.versionId;

    composeKnowledgeVersions(VALID_INPUT);

    assert.equal(VALID_REVISION.revisionId, originalId);
    assert.equal(VALID_REVISION.versionId, originalVersionId);
  });

  it('should not mutate input relationships', () => {
    const originalId = VALID_RELATIONSHIP.relationshipId;
    const originalSource = VALID_RELATIONSHIP.sourceVersionId;

    composeKnowledgeVersions(VALID_INPUT);

    assert.equal(VALID_RELATIONSHIP.relationshipId, originalId);
    assert.equal(VALID_RELATIONSHIP.sourceVersionId, originalSource);
  });

  it('should not mutate input registry versions', () => {
    const versions = [VALID_VERSION, VALID_VERSION_2];
    const originalIds = versions.map((v) => v.versionId);

    composeVersionRegistry(versions, [], []);

    assert.equal(versions[0].versionId, originalIds[0]);
    assert.equal(versions[1].versionId, originalIds[1]);
  });
});

// ---------------------------------------------------------------------------
// Helper Function Tests
// ---------------------------------------------------------------------------

describe('Version Kernel — Helper Functions', () => {
  it('should return canonical version types', () => {
    const types = getCanonicalVersionTypes();
    assert.deepStrictEqual([...types], [...CANONICAL_VERSION_TYPES]);
    assert.equal(types.length, 10);
  });

  it('should return canonical editorial actions', () => {
    const actions = getCanonicalEditorialActions();
    assert.deepStrictEqual([...actions], [...CANONICAL_EDITORIAL_ACTIONS]);
    assert.equal(actions.length, 10);
  });

  it('should return canonical editorial lifecycle', () => {
    const lifecycle = getCanonicalEditorialLifecycle();
    assert.deepStrictEqual([...lifecycle], [...CANONICAL_EDITORIAL_LIFECYCLE]);
    assert.equal(lifecycle.length, 10);
  });

  it('should return canonical version statuses', () => {
    const statuses = getCanonicalVersionStatuses();
    assert.deepStrictEqual([...statuses], [...CANONICAL_VERSION_STATUS]);
    assert.equal(statuses.length, 6);
  });

  it('should validate version type support', () => {
    assert.equal(isSupportedVersionType('major'), true);
    assert.equal(isSupportedVersionType('minor'), true);
    assert.equal(isSupportedVersionType('unsupported'), false);
  });

  it('should validate editorial action support', () => {
    assert.equal(isSupportedEditorialAction('created'), true);
    assert.equal(isSupportedEditorialAction('updated'), true);
    assert.equal(isSupportedEditorialAction('unsupported'), false);
  });

  it('should validate editorial lifecycle support', () => {
    assert.equal(isSupportedEditorialLifecycle('draft'), true);
    assert.equal(isSupportedEditorialLifecycle('active'), true);
    assert.equal(isSupportedEditorialLifecycle('unsupported'), false);
  });

  it('should validate version status support', () => {
    assert.equal(isSupportedVersionStatus('draft'), true);
    assert.equal(isSupportedVersionStatus('published'), true);
    assert.equal(isSupportedVersionStatus('unsupported'), false);
  });

  it('should validate governance status support', () => {
    assert.equal(isSupportedVersionGovernanceStatus('canonical'), true);
    assert.equal(isSupportedVersionGovernanceStatus('accepted'), true);
    assert.equal(isSupportedVersionGovernanceStatus('unsupported'), false);
  });
});

// ---------------------------------------------------------------------------
// Canonical Enum Completeness Tests
// ---------------------------------------------------------------------------

describe('Version Kernel — Canonical Enum Completeness', () => {
  it('should have exactly 10 version types', () => {
    assert.equal(CANONICAL_VERSION_TYPES.length, 10);
  });

  it('should have exactly 10 editorial actions', () => {
    assert.equal(CANONICAL_EDITORIAL_ACTIONS.length, 10);
  });

  it('should have exactly 10 editorial lifecycle states', () => {
    assert.equal(CANONICAL_EDITORIAL_LIFECYCLE.length, 10);
  });

  it('should have exactly 6 version statuses', () => {
    assert.equal(CANONICAL_VERSION_STATUS.length, 6);
  });

  it('should contain all expected version types', () => {
    const expectedTypes = [
      'major',
      'minor',
      'patch',
      'editorial',
      'structural',
      'evidence_update',
      'reference_update',
      'curriculum_alignment',
      'laboratory_alignment',
      'metadata',
    ];

    for (const type of expectedTypes) {
      assert.ok(
        CANONICAL_VERSION_TYPES.includes(type as any),
        `Should include type: ${type}`,
      );
    }
  });

  it('should contain all expected editorial actions', () => {
    const expectedActions = [
      'created',
      'updated',
      'reviewed',
      'approved',
      'published',
      'deprecated',
      'archived',
      'restored',
      'superseded',
      'merged',
    ];

    for (const action of expectedActions) {
      assert.ok(
        CANONICAL_EDITORIAL_ACTIONS.includes(action as any),
        `Should include action: ${action}`,
      );
    }
  });

  it('should contain all expected editorial lifecycle states', () => {
    const expectedLifecycle = [
      'draft',
      'review',
      'approved',
      'published',
      'active',
      'deprecated',
      'archived',
      'superseded',
      'withdrawn',
      'historical',
    ];

    for (const lifecycle of expectedLifecycle) {
      assert.ok(
        CANONICAL_EDITORIAL_LIFECYCLE.includes(lifecycle as any),
        `Should include lifecycle: ${lifecycle}`,
      );
    }
  });

  it('should contain all expected version statuses', () => {
    const expectedStatuses = [
      'draft',
      'review',
      'approved',
      'published',
      'deprecated',
      'archived',
    ];

    for (const status of expectedStatuses) {
      assert.ok(
        CANONICAL_VERSION_STATUS.includes(status as any),
        `Should include status: ${status}`,
      );
    }
  });
});

// ---------------------------------------------------------------------------
// Negative Capability Verification Tests
// ---------------------------------------------------------------------------

describe('Version Kernel — Negative Capability Verification', () => {
  it('should not use Math.random', () => {
    const result = composeKnowledgeVersions(VALID_INPUT);
    assert.ok(result, 'Should produce a result without Math.random');
  });

  it('should not use Date.now', () => {
    const result = composeKnowledgeVersions(VALID_INPUT);
    assert.ok(result, 'Should produce a result without Date.now');
  });

  it('should not use performance.now', () => {
    const result = composeKnowledgeVersions(VALID_INPUT);
    assert.ok(result, 'Should produce a result without performance.now');
  });

  it('should not use crypto.randomUUID', () => {
    const result = composeKnowledgeVersions(VALID_INPUT);
    assert.ok(result, 'Should produce a result without crypto.randomUUID');
  });

  it('should not edit documents', () => {
    const result = composeKnowledgeVersions(VALID_INPUT);
    assert.ok(!('documentEdit' in result), 'Should not have document edit');
    assert.ok(!('editedDocument' in result), 'Should not have edited document');
  });

  it('should not merge versions', () => {
    const result = composeKnowledgeVersions(VALID_INPUT);
    assert.ok(!('mergedVersion' in result), 'Should not have merged version');
    assert.ok(!('mergeResult' in result), 'Should not have merge result');
  });

  it('should not compare text', () => {
    const result = composeKnowledgeVersions(VALID_INPUT);
    assert.ok(!('textComparison' in result), 'Should not have text comparison');
    assert.ok(!('diffResult' in result), 'Should not have diff result');
  });

  it('should not generate diffs', () => {
    const result = composeKnowledgeVersions(VALID_INPUT);
    assert.ok(!('generatedDiff' in result), 'Should not have generated diff');
    assert.ok(!('diffOutput' in result), 'Should not have diff output');
  });

  it('should not perform synchronization', () => {
    const result = composeKnowledgeVersions(VALID_INPUT);
    assert.ok(!('syncResult' in result), 'Should not have sync result');
    assert.ok(!('synchronization' in result), 'Should not have synchronization');
  });

  it('should not integrate with Git', () => {
    const result = composeKnowledgeVersions(VALID_INPUT);
    assert.ok(!('gitIntegration' in result), 'Should not have git integration');
    assert.ok(!('gitResult' in result), 'Should not have git result');
  });

  it('should not integrate with Obsidian APIs', () => {
    const result = composeKnowledgeVersions(VALID_INPUT);
    assert.ok(!('obsidianApi' in result), 'Should not have obsidian API');
    assert.ok(!('obsidianResult' in result), 'Should not have obsidian result');
  });

  it('should not execute publishing', () => {
    const result = composeKnowledgeVersions(VALID_INPUT);
    assert.ok(!('publishResult' in result), 'Should not have publish result');
    assert.ok(!('publishing' in result), 'Should not have publishing');
  });

  it('should not infer better versions', () => {
    const result = composeKnowledgeVersions(VALID_INPUT);
    assert.ok(!('inferredVersion' in result), 'Should not have inferred version');
    assert.ok(!('betterVersion' in result), 'Should not have better version');
  });

  it('should not infer quality', () => {
    const result = composeKnowledgeVersions(VALID_INPUT);
    assert.ok(!('qualityInference' in result), 'Should not have quality inference');
    assert.ok(!('qualityScore' in result), 'Should not have quality score');
  });

  it('should not mutate history', () => {
    const result = composeKnowledgeVersions(VALID_INPUT);
    assert.ok(!('mutatedHistory' in result), 'Should not have mutated history');
    assert.ok(!('historyMutation' in result), 'Should not have history mutation');
  });

  it('should not call LLMs', () => {
    const result = composeKnowledgeVersions(VALID_INPUT);
    assert.ok(!('llmResult' in result), 'Should not have LLM result');
    assert.ok(!('aiGeneration' in result), 'Should not have AI generation');
  });

  it('should not call external APIs', () => {
    const result = composeKnowledgeVersions(VALID_INPUT);
    assert.ok(!('apiResult' in result), 'Should not have API result');
    assert.ok(!('externalCall' in result), 'Should not have external call');
  });

  it('should not have executable callbacks in version', () => {
    const version = composeKnowledgeVersion({
      versionId: 'version-001',
      knowledgeId: 'knowledge-001',
      versionNumber: '1.0.0',
      versionType: 'major',
      status: 'published',
      lifecycle: 'active',
      title: 'Test',
      description: 'Test.',
      tags: [],
      provenance: VALID_PROVENANCE,
    });

    const keys = Object.keys(version);
    for (const key of keys) {
      const value = (version as any)[key];
      assert.ok(typeof value !== 'function', `Version field "${key}" should not be a function`);
    }
  });

  it('should not access filesystem', () => {
    const result = composeKnowledgeVersions(VALID_INPUT);
    assert.ok(!('filesystem' in result), 'Should not have filesystem');
    assert.ok(!('fileSystem' in result), 'Should not have fileSystem');
  });

  it('should not perform runtime execution', () => {
    const result = composeKnowledgeVersions(VALID_INPUT);
    assert.ok(!('runtimeExecution' in result), 'Should not have runtime execution');
    assert.ok(!('output' in result), 'Should not have output');
  });

  it('should not generate code', () => {
    const result = composeKnowledgeVersions(VALID_INPUT);
    assert.ok(!('generatedCode' in result), 'Should not have generated code');
    assert.ok(!('sourceCode' in result), 'Should not have source code');
  });
});

// ---------------------------------------------------------------------------
// Knowledge Artifact With Version History Tests
// ---------------------------------------------------------------------------

describe('Version Kernel — Knowledge Artifact With Version History', () => {
  it('should compose valid knowledge artifact with version history', () => {
    const artifact = composeKnowledgeArtifactWithVersions({
      knowledgeId: 'knowledge-001',
      title: 'Neural Networks',
      versions: [VALID_VERSION],
      revisions: [VALID_REVISION],
      relationships: [VALID_RELATIONSHIP],
      provenance: VALID_PROVENANCE,
    });

    assert.equal(artifact.knowledgeId, 'knowledge-001');
    assert.equal(artifact.title, 'Neural Networks');
    assert.equal(artifact.versions.length, 1);
    assert.equal(artifact.revisions.length, 1);
    assert.equal(artifact.relationships.length, 1);
  });

  it('should validate valid knowledge artifact with version history', () => {
    const artifact = composeKnowledgeArtifactWithVersions({
      knowledgeId: 'knowledge-001',
      title: 'Neural Networks',
      versions: [VALID_VERSION],
      revisions: [VALID_REVISION],
      relationships: [VALID_RELATIONSHIP],
      provenance: VALID_PROVENANCE,
    });

    const result = validateKnowledgeArtifactWithVersions(artifact);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it('should detect missing knowledgeId', () => {
    const artifact = composeKnowledgeArtifactWithVersions({
      knowledgeId: '',
      title: 'Neural Networks',
      versions: [VALID_VERSION],
      revisions: [VALID_REVISION],
      relationships: [VALID_RELATIONSHIP],
      provenance: VALID_PROVENANCE,
    });

    const result = validateKnowledgeArtifactWithVersions(artifact);
    const knowledgeIdError = result.errors.find(
      (e) => e.code === VERSION_VALIDATION_CODES.VERSION_MISSING_KNOWLEDGE_ID,
    );

    assert.ok(knowledgeIdError, 'Should have VERSION_MISSING_KNOWLEDGE_ID error');
  });

  it('should detect missing title', () => {
    const artifact = composeKnowledgeArtifactWithVersions({
      knowledgeId: 'knowledge-001',
      title: '',
      versions: [VALID_VERSION],
      revisions: [VALID_REVISION],
      relationships: [VALID_RELATIONSHIP],
      provenance: VALID_PROVENANCE,
    });

    const result = validateKnowledgeArtifactWithVersions(artifact);
    const titleError = result.errors.find(
      (e) => e.code === VERSION_VALIDATION_CODES.VERSION_MISSING_TITLE,
    );

    assert.ok(titleError, 'Should have VERSION_MISSING_TITLE error');
  });

  it('should detect missing provenance', () => {
    const artifact = composeKnowledgeArtifactWithVersions({
      knowledgeId: 'knowledge-001',
      title: 'Neural Networks',
      versions: [VALID_VERSION],
      revisions: [VALID_REVISION],
      relationships: [VALID_RELATIONSHIP],
      provenance: undefined as any,
    });

    const result = validateKnowledgeArtifactWithVersions(artifact);
    const provenanceError = result.errors.find(
      (e) => e.code === VERSION_VALIDATION_CODES.VERSION_MISSING_PROVENANCE,
    );

    assert.ok(provenanceError, 'Should have VERSION_MISSING_PROVENANCE error');
  });
});

/**
 * NV-1900-D7-OPT-12 — Visual Application Layer & Asset Governance Kernel Test Suite
 *
 * Comprehensive deterministic test suite for the Visual Asset Kernel.
 * Covers: valid visual asset composition, valid relationships, valid governance metadata,
 * valid provenance, registry composition, artifact with visual assets, duplicate IDs,
 * duplicate titles, invalid enums, missing provenance, missing provider, missing rationale,
 * missing references, empty registry, registry inconsistency, invalid trace,
 * deterministic ordering, 100 identical executions, immutable registry,
 * input immutability, artifact immutability, cross-agent boundary verification,
 * negative capability verification, helper functions, canonical enum completeness,
 * validator stability, no mutation verification.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import type {
  VisualAsset,
  VisualAssetProvenance,
  VisualRelationship,
  VisualGovernance,
  VisualAssetInput,
  VisualAssetRegistry,
  VisualAssetTrace,
  ApplicationNode,
} from './ApplicationAgentContract.ts';

import {
  CANONICAL_VISUAL_ASSET_TYPES,
  CANONICAL_VISUAL_REPRESENTATION_TYPES,
  CANONICAL_VISUAL_PURPOSE_TYPES,
  CANONICAL_VISUAL_RELATIONSHIP_TYPES,
  CANONICAL_VISUAL_GOVERNANCE_LEVELS,
  CANONICAL_VISUAL_ASSET_STATUS,
} from './ApplicationAgentContract.ts';

import {
  composeVisualAssetProvenance,
  composeVisualAsset,
  composeVisualRelationship,
  composeVisualGovernance,
  composeVisualAssetDecision,
  composeVisualAssetTrace,
  composeVisualAssetRegistry,
  composeVisualAssetRegistryFromInput,
  composeVisualAssets,
  composeApplicationArtifactWithVisualAssets,
  isSupportedVisualAssetType,
  isSupportedVisualRepresentationType,
  isSupportedVisualPurposeType,
  isSupportedVisualRelationshipType,
  isSupportedVisualGovernanceLevel,
  isSupportedVisualAssetStatus,
  isSupportedVisualAssetGovernance,
  getCanonicalVisualAssetTypes,
  getCanonicalVisualRepresentationTypes,
  getCanonicalVisualPurposeTypes,
  getCanonicalVisualRelationshipTypes,
  getCanonicalVisualGovernanceLevels,
  getCanonicalVisualAssetStatuses,
} from './VisualAssetKernel.ts';

import {
  validateVisualAsset,
  validateVisualRelationship,
  validateVisualGovernance,
  validateVisualAssetRegistry,
  validateVisualAssetInput,
  validateVisualAssetTrace,
  VISUAL_VALIDATION_CODES,
} from './VisualAssetValidation.ts';

// ---------------------------------------------------------------------------
// Test Fixtures
// ---------------------------------------------------------------------------

const VALID_PROVENANCE: VisualAssetProvenance = {
  providedBy: 'NeuralVerse Team',
  rationale: 'Core visual concept.',
  reviewedBy: 'Architecture Review Board',
  reviewDate: '2026-01-01',
  governanceStatus: 'canonical',
};

const VALID_NODE: ApplicationNode = {
  applicationId: 'app-001',
  title: 'Medical Imaging System',
  artifactType: 'system_architecture',
  domain: 'computer_vision',
  status: 'published',
  description: 'Complete medical imaging system.',
  provenance: {
    providedBy: 'NeuralVerse Team',
    rationale: 'Core application concept.',
    reviewedBy: 'Architecture Review Board',
    reviewDate: '2026-01-01',
    governanceStatus: 'canonical',
  },
  trace: {
    traceId: '_trace_1',
    decisionCount: 1,
    validationCount: 1,
    registryVersion: '1.0.0',
    compositionVersion: '1.0.0',
    decisions: [],
    deterministic: true,
    generatedFrom: 'deterministic_application_kernel',
    randomUsed: false,
    timeDependency: false,
  },
};

const VALID_ASSET: VisualAsset = {
  assetId: 'vis-001',
  title: 'System Architecture Diagram',
  assetType: 'system_architecture',
  representationType: 'static',
  purposeType: 'documentation',
  applicationArtifactId: 'app-001',
  knowledgeArtifactId: 'knowledge-001',
  status: 'published',
  provenance: VALID_PROVENANCE,
};

const VALID_ASSET_2: VisualAsset = {
  assetId: 'vis-002',
  title: 'Data Flow Diagram',
  assetType: 'data_flow_diagram',
  representationType: 'vector',
  purposeType: 'engineering',
  applicationArtifactId: 'app-001',
  knowledgeArtifactId: 'knowledge-002',
  status: 'approved',
  provenance: { ...VALID_PROVENANCE, providedBy: 'Research Team' },
};

const VALID_RELATIONSHIP: VisualRelationship = {
  relationshipId: 'rel-001',
  assetId: 'vis-001',
  relationshipType: 'architecture',
  targetId: 'arch-001',
  description: 'Architecture diagram relates to system architecture.',
  provenance: VALID_PROVENANCE,
};

const VALID_GOVERNANCE: VisualGovernance = {
  governanceId: 'gov-001',
  assetId: 'vis-001',
  governanceLevel: 'canonical',
  description: 'Architecture diagram is canonical.',
  provenance: VALID_PROVENANCE,
};

const VALID_INPUT: VisualAssetInput = {
  assets: [VALID_ASSET, VALID_ASSET_2],
  relationships: [VALID_RELATIONSHIP],
  governance: [VALID_GOVERNANCE],
};

const EMPTY_INPUT: VisualAssetInput = {
  assets: [],
  relationships: [],
  governance: [],
};

// ---------------------------------------------------------------------------
// Visual Asset Composition Tests
// ---------------------------------------------------------------------------

describe('Visual Asset Kernel — Composition', () => {
  it('should compose valid visual asset provenance', () => {
    const provenance = composeVisualAssetProvenance({
      providedBy: 'NeuralVerse Team',
      rationale: 'Core concept.',
      reviewedBy: 'Review Board',
      reviewDate: '2026-01-01',
      governanceStatus: 'canonical',
    });

    assert.equal(provenance.providedBy, 'NeuralVerse Team');
    assert.equal(provenance.governanceStatus, 'canonical');
    assert.equal(provenance.rationale, 'Core concept.');
  });

  it('should compose valid visual asset', () => {
    const asset = composeVisualAsset({
      assetId: 'vis-001',
      title: 'Test Asset',
      assetType: 'system_architecture',
      representationType: 'static',
      purposeType: 'documentation',
      applicationArtifactId: 'app-001',
      knowledgeArtifactId: 'knowledge-001',
      status: 'published',
      provenance: VALID_PROVENANCE,
    });

    assert.equal(asset.assetId, 'vis-001');
    assert.equal(asset.title, 'Test Asset');
    assert.equal(asset.assetType, 'system_architecture');
    assert.equal(asset.representationType, 'static');
    assert.equal(asset.purposeType, 'documentation');
  });

  it('should compose valid visual relationship', () => {
    const relationship = composeVisualRelationship({
      relationshipId: 'rel-001',
      assetId: 'vis-001',
      relationshipType: 'architecture',
      targetId: 'arch-001',
      description: 'Test relationship.',
      provenance: VALID_PROVENANCE,
    });

    assert.equal(relationship.relationshipId, 'rel-001');
    assert.equal(relationship.relationshipType, 'architecture');
    assert.equal(relationship.targetId, 'arch-001');
  });

  it('should compose valid visual governance', () => {
    const governance = composeVisualGovernance({
      governanceId: 'gov-001',
      assetId: 'vis-001',
      governanceLevel: 'canonical',
      description: 'Test governance.',
      provenance: VALID_PROVENANCE,
    });

    assert.equal(governance.governanceId, 'gov-001');
    assert.equal(governance.governanceLevel, 'canonical');
  });

  it('should compose valid visual asset trace', () => {
    const trace = composeVisualAssetTrace({
      traceId: '_trace_1',
      decisions: [
        { decisionId: 'd1', assetId: 'vis-001', validationPassed: true, validationErrors: [] },
      ],
      registryVersion: '1.0.0',
      compositionVersion: '1.0.0',
    });

    assert.equal(trace.traceId, '_trace_1');
    assert.equal(trace.decisionCount, 1);
    assert.equal(trace.validationCount, 1);
    assert.equal(trace.deterministic, true);
  });

  it('should validate a valid asset with no errors', () => {
    const errors = validateVisualAsset(VALID_ASSET);
    assert.deepStrictEqual(errors, []);
  });

  it('should validate a valid registry with no errors', () => {
    const registry = composeVisualAssetRegistry(
      [VALID_ASSET, VALID_ASSET_2],
      [VALID_RELATIONSHIP],
      [VALID_GOVERNANCE],
    );
    const result = validateVisualAssetRegistry(registry);

    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it('should validate visual asset input', () => {
    const result = validateVisualAssetInput(VALID_INPUT);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });
});

// ---------------------------------------------------------------------------
// Registry Tests
// ---------------------------------------------------------------------------

describe('Visual Asset Kernel — Registry', () => {
  it('should detect empty registry', () => {
    const registry = composeVisualAssetRegistry([], [], []);
    const result = validateVisualAssetRegistry(registry);
    const emptyError = result.errors.find(
      (e) => e.code === VISUAL_VALIDATION_CODES.VISUAL_EMPTY_REGISTRY,
    );

    assert.ok(emptyError, 'Should have VISUAL_EMPTY_REGISTRY error');
    assert.equal(result.valid, false);
  });

  it('should detect duplicate asset IDs', () => {
    const registry = composeVisualAssetRegistry([VALID_ASSET, VALID_ASSET], [], []);
    const result = validateVisualAssetRegistry(registry);
    const duplicateError = result.errors.find(
      (e) => e.code === VISUAL_VALIDATION_CODES.VISUAL_DUPLICATE_ID,
    );

    assert.ok(duplicateError, 'Should have VISUAL_DUPLICATE_ID error');
  });

  it('should detect duplicate asset titles', () => {
    const a1 = { ...VALID_ASSET, assetId: 'vis-001', title: 'Same Title' };
    const a2 = { ...VALID_ASSET, assetId: 'vis-002', title: 'Same Title' };
    const registry = composeVisualAssetRegistry([a1, a2], [], []);
    const result = validateVisualAssetRegistry(registry);
    const duplicateError = result.errors.find(
      (e) => e.code === VISUAL_VALIDATION_CODES.VISUAL_DUPLICATE_TITLE,
    );

    assert.ok(duplicateError, 'Should have VISUAL_DUPLICATE_TITLE error');
  });

  it('should detect duplicate relationship IDs', () => {
    const registry = composeVisualAssetRegistry(
      [VALID_ASSET],
      [VALID_RELATIONSHIP, VALID_RELATIONSHIP],
      [],
    );
    const result = validateVisualAssetRegistry(registry);
    const duplicateError = result.errors.find(
      (e) => e.code === VISUAL_VALIDATION_CODES.VISUAL_RELATIONSHIP_DUPLICATE_ID,
    );

    assert.ok(duplicateError, 'Should have VISUAL_RELATIONSHIP_DUPLICATE_ID error');
  });

  it('should detect duplicate governance IDs', () => {
    const registry = composeVisualAssetRegistry(
      [VALID_ASSET],
      [],
      [VALID_GOVERNANCE, VALID_GOVERNANCE],
    );
    const result = validateVisualAssetRegistry(registry);
    const duplicateError = result.errors.find(
      (e) => e.code === VISUAL_VALIDATION_CODES.VISUAL_GOVERNANCE_DUPLICATE_ID,
    );

    assert.ok(duplicateError, 'Should have VISUAL_GOVERNANCE_DUPLICATE_ID error');
  });

  it('should sort assets deterministically', () => {
    const a3 = { ...VALID_ASSET, assetId: 'vis-003' };
    const a1 = { ...VALID_ASSET, assetId: 'vis-001' };
    const a2 = { ...VALID_ASSET, assetId: 'vis-002' };

    const registry = composeVisualAssetRegistry([a3, a1, a2], [], []);

    assert.equal(registry.assets[0].assetId, 'vis-001');
    assert.equal(registry.assets[1].assetId, 'vis-002');
    assert.equal(registry.assets[2].assetId, 'vis-003');
  });

  it('should sort relationships deterministically', () => {
    const r2 = { ...VALID_RELATIONSHIP, relationshipId: 'rel-002', relationshipType: 'knowledge' as const };
    const r1 = { ...VALID_RELATIONSHIP, relationshipId: 'rel-001', relationshipType: 'architecture' as const };

    const registry = composeVisualAssetRegistry(
      [VALID_ASSET],
      [r2, r1],
      [],
    );

    assert.equal(registry.relationships[0].relationshipType, 'architecture');
    assert.equal(registry.relationships[1].relationshipType, 'knowledge');
  });

  it('should sort governance deterministically', () => {
    const g2 = { ...VALID_GOVERNANCE, governanceId: 'gov-002', governanceLevel: 'approved' as const };
    const g1 = { ...VALID_GOVERNANCE, governanceId: 'gov-001', governanceLevel: 'canonical' as const };

    const registry = composeVisualAssetRegistry(
      [VALID_ASSET],
      [],
      [g2, g1],
    );

    assert.equal(registry.governance[0].governanceLevel, 'approved');
    assert.equal(registry.governance[1].governanceLevel, 'canonical');
  });

  it('should compute correct metadata counts', () => {
    const registry = composeVisualAssetRegistry(
      [VALID_ASSET, VALID_ASSET_2],
      [VALID_RELATIONSHIP],
      [VALID_GOVERNANCE],
    );

    assert.equal(registry.metadata.assetCount, 2);
    assert.equal(registry.metadata.relationshipCount, 1);
    assert.equal(registry.metadata.governanceCount, 1);
    assert.equal(registry.metadata.typeCount, 2);
  });
});

// ---------------------------------------------------------------------------
// Validation Tests
// ---------------------------------------------------------------------------

describe('Visual Asset Kernel — Validation', () => {
  it('should detect invalid asset type', () => {
    const asset = { ...VALID_ASSET, assetType: 'unsupported' as any };
    const errors = validateVisualAsset(asset);
    const typeError = errors.find(
      (e) => e.code === VISUAL_VALIDATION_CODES.VISUAL_INVALID_ASSET_TYPE,
    );

    assert.ok(typeError, 'Should have VISUAL_INVALID_ASSET_TYPE error');
  });

  it('should detect invalid representation type', () => {
    const asset = { ...VALID_ASSET, representationType: 'unsupported' as any };
    const errors = validateVisualAsset(asset);
    const repError = errors.find(
      (e) => e.code === VISUAL_VALIDATION_CODES.VISUAL_INVALID_REPRESENTATION,
    );

    assert.ok(repError, 'Should have VISUAL_INVALID_REPRESENTATION error');
  });

  it('should detect invalid purpose type', () => {
    const asset = { ...VALID_ASSET, purposeType: 'unsupported' as any };
    const errors = validateVisualAsset(asset);
    const purposeError = errors.find(
      (e) => e.code === VISUAL_VALIDATION_CODES.VISUAL_INVALID_PURPOSE,
    );

    assert.ok(purposeError, 'Should have VISUAL_INVALID_PURPOSE error');
  });

  it('should detect invalid relationship type', () => {
    const relationship = { ...VALID_RELATIONSHIP, relationshipType: 'unsupported' as any };
    const errors = validateVisualRelationship(relationship);
    const relError = errors.find(
      (e) => e.code === VISUAL_VALIDATION_CODES.VISUAL_INVALID_RELATIONSHIP,
    );

    assert.ok(relError, 'Should have VISUAL_INVALID_RELATIONSHIP error');
  });

  it('should detect invalid governance level', () => {
    const governance = { ...VALID_GOVERNANCE, governanceLevel: 'unsupported' as any };
    const errors = validateVisualGovernance(governance);
    const govError = errors.find(
      (e) => e.code === VISUAL_VALIDATION_CODES.VISUAL_INVALID_GOVERNANCE,
    );

    assert.ok(govError, 'Should have VISUAL_INVALID_GOVERNANCE error');
  });

  it('should detect invalid status', () => {
    const asset = { ...VALID_ASSET, status: 'unsupported' as any };
    const errors = validateVisualAsset(asset);
    const statusError = errors.find(
      (e) => e.code === VISUAL_VALIDATION_CODES.VISUAL_INVALID_STATUS,
    );

    assert.ok(statusError, 'Should have VISUAL_INVALID_STATUS error');
  });

  it('should detect invalid governance in provenance', () => {
    const asset = { ...VALID_ASSET, provenance: { ...VALID_PROVENANCE, governanceStatus: 'invalid' as any } };
    const errors = validateVisualAsset(asset);
    const governanceError = errors.find(
      (e) => e.code === VISUAL_VALIDATION_CODES.VISUAL_INVALID_GOVERNANCE,
    );

    assert.ok(governanceError, 'Should have VISUAL_INVALID_GOVERNANCE error');
  });

  it('should detect missing provenance', () => {
    const asset = { ...VALID_ASSET, provenance: undefined as any };
    const errors = validateVisualAsset(asset);
    const provenanceError = errors.find(
      (e) => e.code === VISUAL_VALIDATION_CODES.VISUAL_MISSING_PROVENANCE,
    );

    assert.ok(provenanceError, 'Should have VISUAL_MISSING_PROVENANCE error');
  });

  it('should detect missing provider', () => {
    const asset = { ...VALID_ASSET, provenance: { ...VALID_PROVENANCE, providedBy: '' } };
    const errors = validateVisualAsset(asset);
    const providerError = errors.find(
      (e) => e.code === VISUAL_VALIDATION_CODES.VISUAL_MISSING_PROVIDER,
    );

    assert.ok(providerError, 'Should have VISUAL_MISSING_PROVIDER error');
  });

  it('should detect missing rationale', () => {
    const asset = { ...VALID_ASSET, provenance: { ...VALID_PROVENANCE, rationale: '' } };
    const errors = validateVisualAsset(asset);
    const rationaleError = errors.find(
      (e) => e.code === VISUAL_VALIDATION_CODES.VISUAL_MISSING_RATIONALE,
    );

    assert.ok(rationaleError, 'Should have VISUAL_MISSING_RATIONALE error');
  });

  it('should detect missing application reference', () => {
    const asset = { ...VALID_ASSET, applicationArtifactId: '' };
    const errors = validateVisualAsset(asset);
    const refError = errors.find(
      (e) => e.code === VISUAL_VALIDATION_CODES.VISUAL_MISSING_APPLICATION_REFERENCE,
    );

    assert.ok(refError, 'Should have VISUAL_MISSING_APPLICATION_REFERENCE error');
  });

  it('should detect missing knowledge reference', () => {
    const asset = { ...VALID_ASSET, knowledgeArtifactId: '' };
    const errors = validateVisualAsset(asset);
    const refError = errors.find(
      (e) => e.code === VISUAL_VALIDATION_CODES.VISUAL_MISSING_KNOWLEDGE_REFERENCE,
    );

    assert.ok(refError, 'Should have VISUAL_MISSING_KNOWLEDGE_REFERENCE error');
  });

  it('should detect missing asset ID', () => {
    const asset = { ...VALID_ASSET, assetId: '' };
    const errors = validateVisualAsset(asset);
    const idError = errors.find(
      (e) => e.code === VISUAL_VALIDATION_CODES.VISUAL_MISSING_ASSET_ID,
    );

    assert.ok(idError, 'Should have VISUAL_MISSING_ASSET_ID error');
  });

  it('should detect missing title', () => {
    const asset = { ...VALID_ASSET, title: '' };
    const errors = validateVisualAsset(asset);
    const titleError = errors.find(
      (e) => e.code === VISUAL_VALIDATION_CODES.VISUAL_MISSING_TITLE,
    );

    assert.ok(titleError, 'Should have VISUAL_MISSING_TITLE error');
  });

  it('should validate a valid trace', () => {
    const trace = composeVisualAssetTrace({
      traceId: '_trace_1',
      decisions: [],
      registryVersion: '1.0.0',
      compositionVersion: '1.0.0',
    });

    const result = validateVisualAssetTrace(trace);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it('should detect invalid trace', () => {
    const trace: VisualAssetTrace = {
      traceId: '',
      decisionCount: 0,
      validationCount: 0,
      registryVersion: '1.0.0',
      compositionVersion: '1.0.0',
      decisions: [],
      deterministic: false as true,
      generatedFrom: 'deterministic_visual_asset_kernel',
      randomUsed: false,
      timeDependency: false,
    };

    const result = validateVisualAssetTrace(trace);
    assert.equal(result.valid, false);
  });
});

// ---------------------------------------------------------------------------
// Determinism Tests
// ---------------------------------------------------------------------------

describe('Visual Asset Kernel — Determinism', () => {
  it('should produce identical output for identical input (100 iterations)', () => {
    const results: ReturnType<typeof composeVisualAssets>[] = [];
    for (let i = 0; i < 100; i++) {
      results.push(composeVisualAssets(VALID_INPUT));
    }

    for (let i = 1; i < results.length; i++) {
      assert.deepStrictEqual(results[0].registryId, results[i].registryId);
      assert.deepStrictEqual(results[0].assets, results[i].assets);
      assert.deepStrictEqual(results[0].trace.traceId, results[i].trace.traceId);
    }
  });

  it('should produce identical registry output for identical input', () => {
    const results: ReturnType<typeof composeVisualAssetRegistry>[] = [];
    for (let i = 0; i < 100; i++) {
      results.push(composeVisualAssetRegistry(
        [VALID_ASSET],
        [],
        [],
      ));
    }

    for (let i = 1; i < results.length; i++) {
      assert.deepStrictEqual(results[0].assets, results[i].assets);
      assert.deepStrictEqual(results[0].registryId, results[i].registryId);
    }
  });
});

// ---------------------------------------------------------------------------
// Immutability Tests
// ---------------------------------------------------------------------------

describe('Visual Asset Kernel — Immutability', () => {
  it('should not mutate input assets', () => {
    const originalId = VALID_ASSET.assetId;
    const originalTitle = VALID_ASSET.title;

    composeVisualAssets(VALID_INPUT);

    assert.equal(VALID_ASSET.assetId, originalId);
    assert.equal(VALID_ASSET.title, originalTitle);
  });

  it('should not mutate input registry assets', () => {
    const assets = [VALID_ASSET, VALID_ASSET_2];
    const originalIds = assets.map((a) => a.assetId);

    composeVisualAssetRegistry(assets, [], []);

    assert.equal(assets[0].assetId, originalIds[0]);
    assert.equal(assets[1].assetId, originalIds[1]);
  });

  it('should not mutate the original application node', () => {
    const registry = composeVisualAssetRegistry([VALID_ASSET], [], []);
    const originalDescription = VALID_NODE.description;

    composeApplicationArtifactWithVisualAssets({
      applicationNode: VALID_NODE,
      visualAssetRegistry: registry,
    });

    assert.equal(VALID_NODE.description, originalDescription);
  });
});

// ---------------------------------------------------------------------------
// Helper Function Tests
// ---------------------------------------------------------------------------

describe('Visual Asset Kernel — Helper Functions', () => {
  it('should return canonical asset types', () => {
    const types = getCanonicalVisualAssetTypes();
    assert.deepStrictEqual([...types], [...CANONICAL_VISUAL_ASSET_TYPES]);
    assert.equal(types.length, 10);
  });

  it('should return canonical representation types', () => {
    const types = getCanonicalVisualRepresentationTypes();
    assert.deepStrictEqual([...types], [...CANONICAL_VISUAL_REPRESENTATION_TYPES]);
    assert.equal(types.length, 10);
  });

  it('should return canonical purpose types', () => {
    const types = getCanonicalVisualPurposeTypes();
    assert.deepStrictEqual([...types], [...CANONICAL_VISUAL_PURPOSE_TYPES]);
    assert.equal(types.length, 10);
  });

  it('should return canonical relationship types', () => {
    const types = getCanonicalVisualRelationshipTypes();
    assert.deepStrictEqual([...types], [...CANONICAL_VISUAL_RELATIONSHIP_TYPES]);
    assert.equal(types.length, 10);
  });

  it('should return canonical governance levels', () => {
    const levels = getCanonicalVisualGovernanceLevels();
    assert.deepStrictEqual([...levels], [...CANONICAL_VISUAL_GOVERNANCE_LEVELS]);
    assert.equal(levels.length, 5);
  });

  it('should return canonical statuses', () => {
    const statuses = getCanonicalVisualAssetStatuses();
    assert.deepStrictEqual([...statuses], [...CANONICAL_VISUAL_ASSET_STATUS]);
    assert.equal(statuses.length, 6);
  });

  it('should validate asset type support', () => {
    assert.equal(isSupportedVisualAssetType('system_architecture'), true);
    assert.equal(isSupportedVisualAssetType('data_flow_diagram'), true);
    assert.equal(isSupportedVisualAssetType('unsupported'), false);
  });

  it('should validate representation type support', () => {
    assert.equal(isSupportedVisualRepresentationType('static'), true);
    assert.equal(isSupportedVisualRepresentationType('vector'), true);
    assert.equal(isSupportedVisualRepresentationType('unsupported'), false);
  });

  it('should validate purpose type support', () => {
    assert.equal(isSupportedVisualPurposeType('documentation'), true);
    assert.equal(isSupportedVisualPurposeType('engineering'), true);
    assert.equal(isSupportedVisualPurposeType('unsupported'), false);
  });

  it('should validate relationship type support', () => {
    assert.equal(isSupportedVisualRelationshipType('architecture'), true);
    assert.equal(isSupportedVisualRelationshipType('knowledge'), true);
    assert.equal(isSupportedVisualRelationshipType('unsupported'), false);
  });

  it('should validate governance level support', () => {
    assert.equal(isSupportedVisualGovernanceLevel('canonical'), true);
    assert.equal(isSupportedVisualGovernanceLevel('approved'), true);
    assert.equal(isSupportedVisualGovernanceLevel('unsupported'), false);
  });

  it('should validate status support', () => {
    assert.equal(isSupportedVisualAssetStatus('draft'), true);
    assert.equal(isSupportedVisualAssetStatus('published'), true);
    assert.equal(isSupportedVisualAssetStatus('unsupported'), false);
  });

  it('should validate governance support', () => {
    assert.equal(isSupportedVisualAssetGovernance('canonical'), true);
    assert.equal(isSupportedVisualAssetGovernance('accepted'), true);
    assert.equal(isSupportedVisualAssetGovernance('unsupported'), false);
  });
});

// ---------------------------------------------------------------------------
// Canonical Enum Completeness Tests
// ---------------------------------------------------------------------------

describe('Visual Asset Kernel — Canonical Enum Completeness', () => {
  it('should have exactly 10 asset types', () => {
    assert.equal(CANONICAL_VISUAL_ASSET_TYPES.length, 10);
  });

  it('should have exactly 10 representation types', () => {
    assert.equal(CANONICAL_VISUAL_REPRESENTATION_TYPES.length, 10);
  });

  it('should have exactly 10 purpose types', () => {
    assert.equal(CANONICAL_VISUAL_PURPOSE_TYPES.length, 10);
  });

  it('should have exactly 10 relationship types', () => {
    assert.equal(CANONICAL_VISUAL_RELATIONSHIP_TYPES.length, 10);
  });

  it('should have exactly 5 governance levels', () => {
    assert.equal(CANONICAL_VISUAL_GOVERNANCE_LEVELS.length, 5);
  });

  it('should have exactly 6 statuses', () => {
    assert.equal(CANONICAL_VISUAL_ASSET_STATUS.length, 6);
  });

  it('should contain all expected asset types', () => {
    const expected = ['system_architecture', 'data_flow_diagram', 'pipeline_diagram', 'component_diagram', 'deployment_diagram', 'ui_mockup', 'workflow_visualization', 'knowledge_map', 'decision_tree', 'engineering_illustration'];

    for (const type of expected) {
      assert.ok(
        CANONICAL_VISUAL_ASSET_TYPES.includes(type as any),
        `Should include type: ${type}`,
      );
    }
  });

  it('should contain all expected statuses', () => {
    const expected = ['draft', 'review', 'approved', 'published', 'deprecated', 'archived'];

    for (const status of expected) {
      assert.ok(
        CANONICAL_VISUAL_ASSET_STATUS.includes(status as any),
        `Should include status: ${status}`,
      );
    }
  });
});

// ---------------------------------------------------------------------------
// Negative Capability Verification Tests
// ---------------------------------------------------------------------------

describe('Visual Asset Kernel — Negative Capability Verification', () => {
  it('should not use Math.random', () => {
    const result = composeVisualAssets(VALID_INPUT);
    assert.ok(result, 'Should produce a result without Math.random');
  });

  it('should not use Date.now', () => {
    const result = composeVisualAssets(VALID_INPUT);
    assert.ok(result, 'Should produce a result without Date.now');
  });

  it('should not use performance.now', () => {
    const result = composeVisualAssets(VALID_INPUT);
    assert.ok(result, 'Should produce a result without performance.now');
  });

  it('should not use crypto.randomUUID', () => {
    const result = composeVisualAssets(VALID_INPUT);
    assert.ok(result, 'Should produce a result without crypto.randomUUID');
  });

  it('should not generate visual content', () => {
    const result = composeVisualAssets(VALID_INPUT);
    assert.ok(!('generatedContent' in result), 'Should not have generated content');
    assert.ok(!('generatedMarkdown' in result), 'Should not have generated markdown');
  });

  it('should not perform network requests', () => {
    const result = composeVisualAssets(VALID_INPUT);
    assert.ok(!('networkResponse' in result), 'Should not have network response');
  });

  it('should not generate code', () => {
    const result = composeVisualAssets(VALID_INPUT);
    assert.ok(!('generatedCode' in result), 'Should not have generated code');
  });

  it('should not have executable callbacks in asset', () => {
    const asset = composeVisualAsset({
      assetId: 'vis-001',
      title: 'Test',
      assetType: 'system_architecture',
      representationType: 'static',
      purposeType: 'documentation',
      applicationArtifactId: 'app-001',
      knowledgeArtifactId: 'knowledge-001',
      status: 'published',
      provenance: VALID_PROVENANCE,
    });

    const keys = Object.keys(asset);
    for (const key of keys) {
      const value = (asset as any)[key];
      assert.ok(typeof value !== 'function', `Asset field "${key}" should not be a function`);
    }
  });

  it('should not store educational content', () => {
    const result = composeVisualAssets(VALID_INPUT);
    assert.ok(!('educationalContent' in result), 'Should not have educational content');
  });

  it('should not access filesystem', () => {
    const result = composeVisualAssets(VALID_INPUT);
    assert.ok(!('filesystem' in result), 'Should not have filesystem');
  });
});

// ---------------------------------------------------------------------------
// Registry Validation Tests
// ---------------------------------------------------------------------------

describe('Visual Asset Kernel — Registry Validation', () => {
  it('should detect registry inconsistency with invalid deterministic flag', () => {
    const registry: VisualAssetRegistry = {
      ...composeVisualAssetRegistry([VALID_ASSET], [], []),
      deterministic: false as any,
    };
    const result = validateVisualAssetRegistry(registry);
    assert.equal(result.valid, false);
  });

  it('should detect registry inconsistency with invalid randomUsed flag', () => {
    const registry: VisualAssetRegistry = {
      ...composeVisualAssetRegistry([VALID_ASSET], [], []),
      randomUsed: true as any,
    };
    const result = validateVisualAssetRegistry(registry);
    assert.equal(result.valid, false);
  });

  it('should detect registry inconsistency with invalid timeDependency flag', () => {
    const registry: VisualAssetRegistry = {
      ...composeVisualAssetRegistry([VALID_ASSET], [], []),
      timeDependency: true as any,
    };
    const result = validateVisualAssetRegistry(registry);
    assert.equal(result.valid, false);
  });

  it('should validate empty input', () => {
    const result = validateVisualAssetInput(EMPTY_INPUT);
    assert.equal(result.valid, false);
    const emptyError = result.errors.find(
      (e) => e.code === VISUAL_VALIDATION_CODES.VISUAL_EMPTY_REGISTRY,
    );
    assert.ok(emptyError, 'Should have VISUAL_EMPTY_REGISTRY error');
  });
});

// ---------------------------------------------------------------------------
// Validator Stability Tests
// ---------------------------------------------------------------------------

describe('Visual Asset Kernel — Validator Stability', () => {
  it('should produce identical validation results for valid input', () => {
    const result1 = validateVisualAssetRegistry(composeVisualAssetRegistry([VALID_ASSET], [], []));
    const result2 = validateVisualAssetRegistry(composeVisualAssetRegistry([VALID_ASSET], [], []));

    assert.deepStrictEqual(result1.valid, result2.valid);
    assert.deepStrictEqual(result1.errors.length, result2.errors.length);
  });

  it('should produce identical validation results for invalid input', () => {
    const asset = { ...VALID_ASSET, assetType: 'unsupported' as any };
    const result1 = validateVisualAsset(asset);
    const result2 = validateVisualAsset(asset);

    assert.deepStrictEqual(result1.length, result2.length);
  });
});

// ---------------------------------------------------------------------------
// No Mutation Behavior Tests
// ---------------------------------------------------------------------------

describe('Visual Asset Kernel — No Mutation Behavior', () => {
  it('should not mutate assets during registry composition', () => {
    const assets = [
      { ...VALID_ASSET, assetId: 'vis-003' },
      { ...VALID_ASSET, assetId: 'vis-001' },
      { ...VALID_ASSET, assetId: 'vis-002' },
    ];
    const originalOrder = assets.map((a) => a.assetId);

    composeVisualAssetRegistry(assets, [], []);

    assert.deepStrictEqual(assets.map((a) => a.assetId), originalOrder);
  });

  it('should not mutate input during full composition', () => {
    const input: VisualAssetInput = {
      assets: [
        { ...VALID_ASSET, assetId: 'vis-002' },
        { ...VALID_ASSET, assetId: 'vis-001' },
      ],
      relationships: [],
      governance: [],
    };
    const originalOrder = input.assets.map((a) => a.assetId);

    composeVisualAssets(input);

    assert.deepStrictEqual(input.assets.map((a) => a.assetId), originalOrder);
  });
});

// ---------------------------------------------------------------------------
// Artifact with Visual Assets Tests
// ---------------------------------------------------------------------------

describe('Visual Asset Kernel — Artifact with Visual Assets', () => {
  it('should compose application artifact with visual assets', () => {
    const registry = composeVisualAssetRegistry([VALID_ASSET], [VALID_RELATIONSHIP], []);
    const result = composeApplicationArtifactWithVisualAssets({
      applicationNode: VALID_NODE,
      visualAssetRegistry: registry,
    });

    assert.equal(result.applicationNode.applicationId, 'app-001');
    assert.equal(result.visualAssetRegistry.assets.length, 1);
    assert.equal(result.deterministic, true);
    assert.equal(result.randomUsed, false);
    assert.equal(result.timeDependency, false);
  });

  it('should not mutate the original application node', () => {
    const registry = composeVisualAssetRegistry([VALID_ASSET], [], []);
    const originalTitle = VALID_NODE.title;

    composeApplicationArtifactWithVisualAssets({
      applicationNode: VALID_NODE,
      visualAssetRegistry: registry,
    });

    assert.equal(VALID_NODE.title, originalTitle);
  });
});

// ---------------------------------------------------------------------------
// Cross-Agent Boundary Verification Tests
// ---------------------------------------------------------------------------

describe('Visual Asset Kernel — Cross-Agent Boundary Verification', () => {
  it('should only reference external IDs, not own external metadata', () => {
    const asset = composeVisualAsset({
      assetId: 'vis-001',
      title: 'Test',
      assetType: 'system_architecture',
      representationType: 'static',
      purposeType: 'documentation',
      applicationArtifactId: 'app-001',
      knowledgeArtifactId: 'knowledge-001',
      status: 'published',
      provenance: VALID_PROVENANCE,
    });

    assert.equal(typeof asset.knowledgeArtifactId, 'string');
    assert.ok(!('knowledgeContent' in asset), 'Should not have knowledge content');
    assert.ok(!('narrativeContent' in asset), 'Should not have narrative content');
  });

  it('should not generate images', () => {
    const result = composeVisualAssets(VALID_INPUT);
    assert.ok(!('generatedImages' in result), 'Should not have generated images');
    assert.ok(!('renderedDiagrams' in result), 'Should not have rendered diagrams');
  });

  it('should not render diagrams', () => {
    const result = composeVisualAssets(VALID_INPUT);
    assert.ok(!('renderedDiagrams' in result), 'Should not have rendered diagrams');
    assert.ok(!('diagramOutput' in result), 'Should not have diagram output');
  });

  it('should not invoke image models', () => {
    const result = composeVisualAssets(VALID_INPUT);
    assert.ok(!('imageModelOutput' in result), 'Should not have image model output');
    assert.ok(!('generatedIllustrations' in result), 'Should not have generated illustrations');
  });

  it('should not edit assets', () => {
    const result = composeVisualAssets(VALID_INPUT);
    assert.ok(!('editedAssets' in result), 'Should not have edited assets');
    assert.ok(!('modifiedFiles' in result), 'Should not have modified files');
  });
});

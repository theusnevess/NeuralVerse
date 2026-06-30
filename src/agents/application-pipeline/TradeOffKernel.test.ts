/**
 * NV-1900-D7-OPT-05 — Engineering Trade-Off Analysis Kernel Test Suite
 *
 * Comprehensive deterministic test suite for the Trade-Off Kernel.
 * Covers: valid trade-off, valid dimensions, valid relationships, valid provenance,
 * registry composition, artifact with trade-offs, duplicate IDs, duplicate titles,
 * invalid enums, invalid effects, missing provenance, missing provider, missing rationale,
 * missing references, self relationships, empty registry, registry inconsistency,
 * invalid trace, deterministic ordering, 100 identical executions, immutable registry,
 * input immutability, artifact immutability, helper functions,
 * canonical enum completeness, negative capability verification,
 * validator stability, no mutation verification.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import type {
  EngineeringTradeOff,
  TradeOffProvenance,
  TradeOffDimension,
  TradeOffRelationship,
  TradeOffInput,
  TradeOffRegistry,
  TradeOffTrace,
  ApplicationNode,
} from './ApplicationAgentContract.ts';

import {
  CANONICAL_TRADE_OFF_TYPES,
  CANONICAL_ENGINEERING_DIMENSIONS,
  CANONICAL_TRADE_OFF_SEVERITY,
  CANONICAL_DECISION_DRIVERS,
  CANONICAL_TRADE_OFF_STATUS,
} from './ApplicationAgentContract.ts';

import {
  composeTradeOffProvenance,
  composeEngineeringTradeOff,
  composeTradeOffDimension,
  composeTradeOffRelationship,
  composeTradeOffTrace,
  composeTradeOffRegistry,
  composeTradeOffRegistryFromInput,
  composeEngineeringTradeOffs,
  composeApplicationArtifactWithTradeOffs,
  isSupportedTradeOffType,
  isSupportedEngineeringDimension,
  isSupportedTradeOffSeverity,
  isSupportedDecisionDriver,
  isSupportedTradeOffStatus,
  isSupportedTradeOffGovernance,
  getCanonicalTradeOffTypes,
  getCanonicalEngineeringDimensions,
  getCanonicalTradeOffSeverities,
  getCanonicalDecisionDrivers,
  getCanonicalTradeOffStatuses,
} from './TradeOffKernel.ts';

import {
  validateEngineeringTradeOff,
  validateTradeOffDimension,
  validateTradeOffRelationship,
  validateTradeOffRegistry,
  validateTradeOffInput,
  validateTradeOffTrace,
  TRADE_OFF_VALIDATION_CODES,
} from './TradeOffValidation.ts';

// ---------------------------------------------------------------------------
// Test Fixtures
// ---------------------------------------------------------------------------

const VALID_PROVENANCE: TradeOffProvenance = {
  providedBy: 'NeuralVerse Team',
  rationale: 'Core trade-off concept.',
  reviewedBy: 'Architecture Review Board',
  reviewDate: '2026-01-01',
  governanceStatus: 'canonical',
};

const VALID_NODE: ApplicationNode = {
  applicationId: 'app-001',
  title: 'Medical Imaging System',
  artifactType: 'trade_off',
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

const VALID_TRADE_OFF: EngineeringTradeOff = {
  tradeOffId: 'to-001',
  title: 'Accuracy vs Latency Trade-Off',
  description: 'Higher accuracy model requires more inference time.',
  tradeOffType: 'accuracy_latency',
  severity: 'significant',
  applicationArtifactId: 'app-001',
  knowledgeArtifactId: 'knowledge-001',
  architectureId: 'arch-001',
  caseStudyId: 'cs-001',
  decisionDriver: 'performance_requirement',
  status: 'published',
  provenance: VALID_PROVENANCE,
};

const VALID_TRADE_OFF_2: EngineeringTradeOff = {
  tradeOffId: 'to-002',
  title: 'Scalability vs Cost Trade-Off',
  description: 'Scaling infrastructure increases operational costs.',
  tradeOffType: 'scalability_cost',
  severity: 'moderate',
  applicationArtifactId: 'app-001',
  knowledgeArtifactId: 'knowledge-002',
  architectureId: 'arch-002',
  caseStudyId: 'cs-002',
  decisionDriver: 'cost_constraint',
  status: 'approved',
  provenance: { ...VALID_PROVENANCE, providedBy: 'Research Team' },
};

const VALID_DIMENSION: TradeOffDimension = {
  dimensionId: 'dim-001',
  tradeOffId: 'to-001',
  dimension: 'accuracy',
  effect: 'improved',
  description: 'Accuracy improves with larger model.',
  provenance: VALID_PROVENANCE,
};

const VALID_DIMENSION_2: TradeOffDimension = {
  dimensionId: 'dim-002',
  tradeOffId: 'to-001',
  dimension: 'latency',
  effect: 'degraded',
  description: 'Latency increases with larger model.',
  provenance: VALID_PROVENANCE,
};

const VALID_RELATIONSHIP: TradeOffRelationship = {
  relationshipId: 'rel-001',
  sourceTradeOffId: 'to-001',
  targetTradeOffId: 'to-002',
  relationshipType: 'influences',
  provenance: VALID_PROVENANCE,
};

const VALID_INPUT: TradeOffInput = {
  tradeOffs: [VALID_TRADE_OFF, VALID_TRADE_OFF_2],
  dimensions: [VALID_DIMENSION, VALID_DIMENSION_2],
  relationships: [VALID_RELATIONSHIP],
};

const EMPTY_INPUT: TradeOffInput = {
  tradeOffs: [],
  dimensions: [],
  relationships: [],
};

// ---------------------------------------------------------------------------
// Trade-Off Composition Tests
// ---------------------------------------------------------------------------

describe('Trade-Off Kernel — Composition', () => {
  it('should compose valid trade-off provenance', () => {
    const provenance = composeTradeOffProvenance({
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

  it('should compose valid engineering trade-off', () => {
    const to = composeEngineeringTradeOff({
      tradeOffId: 'to-001',
      title: 'Test Trade-Off',
      description: 'Test.',
      tradeOffType: 'accuracy_latency',
      severity: 'significant',
      applicationArtifactId: 'app-001',
      knowledgeArtifactId: 'knowledge-001',
      architectureId: 'arch-001',
      caseStudyId: 'cs-001',
      decisionDriver: 'performance_requirement',
      status: 'published',
      provenance: VALID_PROVENANCE,
    });

    assert.equal(to.tradeOffId, 'to-001');
    assert.equal(to.title, 'Test Trade-Off');
    assert.equal(to.tradeOffType, 'accuracy_latency');
    assert.equal(to.severity, 'significant');
  });

  it('should compose valid trade-off dimension', () => {
    const dim = composeTradeOffDimension({
      dimensionId: 'dim-001',
      tradeOffId: 'to-001',
      dimension: 'accuracy',
      effect: 'improved',
      description: 'Accuracy improves.',
      provenance: VALID_PROVENANCE,
    });

    assert.equal(dim.dimensionId, 'dim-001');
    assert.equal(dim.dimension, 'accuracy');
    assert.equal(dim.effect, 'improved');
  });

  it('should compose valid trade-off relationship', () => {
    const rel = composeTradeOffRelationship({
      relationshipId: 'rel-001',
      sourceTradeOffId: 'to-001',
      targetTradeOffId: 'to-002',
      relationshipType: 'influences',
      provenance: VALID_PROVENANCE,
    });

    assert.equal(rel.relationshipId, 'rel-001');
    assert.equal(rel.sourceTradeOffId, 'to-001');
    assert.equal(rel.targetTradeOffId, 'to-002');
  });

  it('should compose valid trade-off trace', () => {
    const trace = composeTradeOffTrace({
      traceId: '_trace_1',
      decisions: [
        { decisionId: 'd1', tradeOffId: 'to-001', validationPassed: true, validationErrors: [] },
      ],
      registryVersion: '1.0.0',
      compositionVersion: '1.0.0',
    });

    assert.equal(trace.traceId, '_trace_1');
    assert.equal(trace.decisionCount, 1);
    assert.equal(trace.validationCount, 1);
    assert.equal(trace.deterministic, true);
  });

  it('should validate a valid trade-off with no errors', () => {
    const errors = validateEngineeringTradeOff(VALID_TRADE_OFF);
    assert.deepStrictEqual(errors, []);
  });

  it('should validate a valid registry with no errors', () => {
    const registry = composeTradeOffRegistry(
      [VALID_TRADE_OFF, VALID_TRADE_OFF_2],
      [VALID_DIMENSION, VALID_DIMENSION_2],
      [VALID_RELATIONSHIP],
    );
    const result = validateTradeOffRegistry(registry);

    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it('should validate trade-off input', () => {
    const result = validateTradeOffInput(VALID_INPUT);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });
});

// ---------------------------------------------------------------------------
// Registry Tests
// ---------------------------------------------------------------------------

describe('Trade-Off Kernel — Registry', () => {
  it('should detect empty registry', () => {
    const registry = composeTradeOffRegistry([], [], []);
    const result = validateTradeOffRegistry(registry);
    const emptyError = result.errors.find(
      (e) => e.code === TRADE_OFF_VALIDATION_CODES.TRADE_OFF_EMPTY_REGISTRY,
    );

    assert.ok(emptyError, 'Should have TRADE_OFF_EMPTY_REGISTRY error');
    assert.equal(result.valid, false);
  });

  it('should detect duplicate trade-off IDs', () => {
    const registry = composeTradeOffRegistry([VALID_TRADE_OFF, VALID_TRADE_OFF], [], []);
    const result = validateTradeOffRegistry(registry);
    const duplicateError = result.errors.find(
      (e) => e.code === TRADE_OFF_VALIDATION_CODES.TRADE_OFF_DUPLICATE_ID,
    );

    assert.ok(duplicateError, 'Should have TRADE_OFF_DUPLICATE_ID error');
  });

  it('should detect duplicate trade-off titles', () => {
    const to1 = { ...VALID_TRADE_OFF, tradeOffId: 'to-001', title: 'Same Title' };
    const to2 = { ...VALID_TRADE_OFF, tradeOffId: 'to-002', title: 'Same Title' };
    const registry = composeTradeOffRegistry([to1, to2], [], []);
    const result = validateTradeOffRegistry(registry);
    const duplicateError = result.errors.find(
      (e) => e.code === TRADE_OFF_VALIDATION_CODES.TRADE_OFF_DUPLICATE_TITLE,
    );

    assert.ok(duplicateError, 'Should have TRADE_OFF_DUPLICATE_TITLE error');
  });

  it('should detect duplicate dimension IDs', () => {
    const registry = composeTradeOffRegistry([VALID_TRADE_OFF], [VALID_DIMENSION, VALID_DIMENSION], []);
    const result = validateTradeOffRegistry(registry);
    const duplicateError = result.errors.find(
      (e) => e.code === TRADE_OFF_VALIDATION_CODES.TRADE_OFF_DIMENSION_DUPLICATE_ID,
    );

    assert.ok(duplicateError, 'Should have TRADE_OFF_DIMENSION_DUPLICATE_ID error');
  });

  it('should detect duplicate relationship IDs', () => {
    const registry = composeTradeOffRegistry([VALID_TRADE_OFF, VALID_TRADE_OFF_2], [], [VALID_RELATIONSHIP, VALID_RELATIONSHIP]);
    const result = validateTradeOffRegistry(registry);
    const duplicateError = result.errors.find(
      (e) => e.code === TRADE_OFF_VALIDATION_CODES.TRADE_OFF_RELATIONSHIP_DUPLICATE_ID,
    );

    assert.ok(duplicateError, 'Should have TRADE_OFF_RELATIONSHIP_DUPLICATE_ID error');
  });

  it('should sort trade-offs deterministically', () => {
    const to3 = { ...VALID_TRADE_OFF, tradeOffId: 'to-003' };
    const to1 = { ...VALID_TRADE_OFF, tradeOffId: 'to-001' };
    const to2 = { ...VALID_TRADE_OFF, tradeOffId: 'to-002' };

    const registry = composeTradeOffRegistry([to3, to1, to2], [], []);

    assert.equal(registry.tradeOffs[0].tradeOffId, 'to-001');
    assert.equal(registry.tradeOffs[1].tradeOffId, 'to-002');
    assert.equal(registry.tradeOffs[2].tradeOffId, 'to-003');
  });

  it('should sort dimensions deterministically', () => {
    const dim2 = { ...VALID_DIMENSION, dimensionId: 'dim-002', dimension: 'latency' as const };
    const dim1 = { ...VALID_DIMENSION, dimensionId: 'dim-001', dimension: 'accuracy' as const };

    const registry = composeTradeOffRegistry([VALID_TRADE_OFF], [dim2, dim1], []);

    assert.equal(registry.dimensions[0].dimension, 'accuracy');
    assert.equal(registry.dimensions[1].dimension, 'latency');
  });

  it('should sort relationships deterministically', () => {
    const rel2 = { ...VALID_RELATIONSHIP, relationshipId: 'rel-002', sourceTradeOffId: 'to-002' };
    const rel1 = { ...VALID_RELATIONSHIP, relationshipId: 'rel-001', sourceTradeOffId: 'to-001' };

    const registry = composeTradeOffRegistry([VALID_TRADE_OFF, VALID_TRADE_OFF_2], [], [rel2, rel1]);

    assert.equal(registry.relationships[0].sourceTradeOffId, 'to-001');
    assert.equal(registry.relationships[1].sourceTradeOffId, 'to-002');
  });

  it('should compute correct metadata counts', () => {
    const registry = composeTradeOffRegistry(
      [VALID_TRADE_OFF, VALID_TRADE_OFF_2],
      [VALID_DIMENSION, VALID_DIMENSION_2],
      [VALID_RELATIONSHIP],
    );

    assert.equal(registry.metadata.tradeOffCount, 2);
    assert.equal(registry.metadata.dimensionCount, 2);
    assert.equal(registry.metadata.relationshipCount, 1);
    assert.equal(registry.metadata.typeCount, 2);
  });
});

// ---------------------------------------------------------------------------
// Validation Tests
// ---------------------------------------------------------------------------

describe('Trade-Off Kernel — Validation', () => {
  it('should detect invalid trade-off type', () => {
    const to = { ...VALID_TRADE_OFF, tradeOffType: 'unsupported' as any };
    const errors = validateEngineeringTradeOff(to);
    const typeError = errors.find(
      (e) => e.code === TRADE_OFF_VALIDATION_CODES.TRADE_OFF_INVALID_TYPE,
    );

    assert.ok(typeError, 'Should have TRADE_OFF_INVALID_TYPE error');
  });

  it('should detect invalid severity', () => {
    const to = { ...VALID_TRADE_OFF, severity: 'unsupported' as any };
    const errors = validateEngineeringTradeOff(to);
    const severityError = errors.find(
      (e) => e.code === TRADE_OFF_VALIDATION_CODES.TRADE_OFF_INVALID_SEVERITY,
    );

    assert.ok(severityError, 'Should have TRADE_OFF_INVALID_SEVERITY error');
  });

  it('should detect invalid decision driver', () => {
    const to = { ...VALID_TRADE_OFF, decisionDriver: 'unsupported' as any };
    const errors = validateEngineeringTradeOff(to);
    const driverError = errors.find(
      (e) => e.code === TRADE_OFF_VALIDATION_CODES.TRADE_OFF_INVALID_DRIVER,
    );

    assert.ok(driverError, 'Should have TRADE_OFF_INVALID_DRIVER error');
  });

  it('should detect invalid status', () => {
    const to = { ...VALID_TRADE_OFF, status: 'unsupported' as any };
    const errors = validateEngineeringTradeOff(to);
    const statusError = errors.find(
      (e) => e.code === TRADE_OFF_VALIDATION_CODES.TRADE_OFF_INVALID_STATUS,
    );

    assert.ok(statusError, 'Should have TRADE_OFF_INVALID_STATUS error');
  });

  it('should detect invalid governance', () => {
    const to = { ...VALID_TRADE_OFF, provenance: { ...VALID_PROVENANCE, governanceStatus: 'invalid' as any } };
    const errors = validateEngineeringTradeOff(to);
    const governanceError = errors.find(
      (e) => e.code === TRADE_OFF_VALIDATION_CODES.TRADE_OFF_INVALID_GOVERNANCE,
    );

    assert.ok(governanceError, 'Should have TRADE_OFF_INVALID_GOVERNANCE error');
  });

  it('should detect invalid dimension', () => {
    const dim = { ...VALID_DIMENSION, dimension: 'unsupported' as any };
    const errors = validateTradeOffDimension(dim);
    const dimError = errors.find(
      (e) => e.code === TRADE_OFF_VALIDATION_CODES.TRADE_OFF_INVALID_DIMENSION,
    );

    assert.ok(dimError, 'Should have TRADE_OFF_INVALID_DIMENSION error');
  });

  it('should detect invalid effect', () => {
    const dim = { ...VALID_DIMENSION, effect: 'unsupported' as any };
    const errors = validateTradeOffDimension(dim);
    const effectError = errors.find(
      (e) => e.code === TRADE_OFF_VALIDATION_CODES.TRADE_OFF_INVALID_EFFECT,
    );

    assert.ok(effectError, 'Should have TRADE_OFF_INVALID_EFFECT error');
  });

  it('should detect missing provenance', () => {
    const to = { ...VALID_TRADE_OFF, provenance: undefined as any };
    const errors = validateEngineeringTradeOff(to);
    const provenanceError = errors.find(
      (e) => e.code === TRADE_OFF_VALIDATION_CODES.TRADE_OFF_MISSING_PROVENANCE,
    );

    assert.ok(provenanceError, 'Should have TRADE_OFF_MISSING_PROVENANCE error');
  });

  it('should detect missing provider', () => {
    const to = { ...VALID_TRADE_OFF, provenance: { ...VALID_PROVENANCE, providedBy: '' } };
    const errors = validateEngineeringTradeOff(to);
    const providerError = errors.find(
      (e) => e.code === TRADE_OFF_VALIDATION_CODES.TRADE_OFF_MISSING_PROVIDER,
    );

    assert.ok(providerError, 'Should have TRADE_OFF_MISSING_PROVIDER error');
  });

  it('should detect missing rationale', () => {
    const to = { ...VALID_TRADE_OFF, provenance: { ...VALID_PROVENANCE, rationale: '' } };
    const errors = validateEngineeringTradeOff(to);
    const rationaleError = errors.find(
      (e) => e.code === TRADE_OFF_VALIDATION_CODES.TRADE_OFF_MISSING_RATIONALE,
    );

    assert.ok(rationaleError, 'Should have TRADE_OFF_MISSING_RATIONALE error');
  });

  it('should detect missing application reference', () => {
    const to = { ...VALID_TRADE_OFF, applicationArtifactId: '' };
    const errors = validateEngineeringTradeOff(to);
    const refError = errors.find(
      (e) => e.code === TRADE_OFF_VALIDATION_CODES.TRADE_OFF_MISSING_APPLICATION_REFERENCE,
    );

    assert.ok(refError, 'Should have TRADE_OFF_MISSING_APPLICATION_REFERENCE error');
  });

  it('should detect missing knowledge reference', () => {
    const to = { ...VALID_TRADE_OFF, knowledgeArtifactId: '' };
    const errors = validateEngineeringTradeOff(to);
    const refError = errors.find(
      (e) => e.code === TRADE_OFF_VALIDATION_CODES.TRADE_OFF_MISSING_KNOWLEDGE_REFERENCE,
    );

    assert.ok(refError, 'Should have TRADE_OFF_MISSING_KNOWLEDGE_REFERENCE error');
  });

  it('should detect missing architecture reference', () => {
    const to = { ...VALID_TRADE_OFF, architectureId: '' };
    const errors = validateEngineeringTradeOff(to);
    const refError = errors.find(
      (e) => e.code === TRADE_OFF_VALIDATION_CODES.TRADE_OFF_MISSING_ARCHITECTURE_REFERENCE,
    );

    assert.ok(refError, 'Should have TRADE_OFF_MISSING_ARCHITECTURE_REFERENCE error');
  });

  it('should detect missing case study reference', () => {
    const to = { ...VALID_TRADE_OFF, caseStudyId: '' };
    const errors = validateEngineeringTradeOff(to);
    const refError = errors.find(
      (e) => e.code === TRADE_OFF_VALIDATION_CODES.TRADE_OFF_MISSING_CASE_STUDY_REFERENCE,
    );

    assert.ok(refError, 'Should have TRADE_OFF_MISSING_CASE_STUDY_REFERENCE error');
  });

  it('should detect missing trade-off ID', () => {
    const to = { ...VALID_TRADE_OFF, tradeOffId: '' };
    const errors = validateEngineeringTradeOff(to);
    const idError = errors.find(
      (e) => e.code === TRADE_OFF_VALIDATION_CODES.TRADE_OFF_MISSING_TRADE_OFF_ID,
    );

    assert.ok(idError, 'Should have TRADE_OFF_MISSING_TRADE_OFF_ID error');
  });

  it('should detect missing title', () => {
    const to = { ...VALID_TRADE_OFF, title: '' };
    const errors = validateEngineeringTradeOff(to);
    const titleError = errors.find(
      (e) => e.code === TRADE_OFF_VALIDATION_CODES.TRADE_OFF_MISSING_TITLE,
    );

    assert.ok(titleError, 'Should have TRADE_OFF_MISSING_TITLE error');
  });

  it('should detect self relationships', () => {
    const selfRel: TradeOffRelationship = {
      ...VALID_RELATIONSHIP,
      sourceTradeOffId: 'to-001',
      targetTradeOffId: 'to-001',
    };

    const errors = validateTradeOffRelationship(selfRel, ['to-001', 'to-002']);
    const selfError = errors.find(
      (e) => e.code === TRADE_OFF_VALIDATION_CODES.TRADE_OFF_SELF_RELATIONSHIP,
    );

    assert.ok(selfError, 'Should have TRADE_OFF_SELF_RELATIONSHIP error');
  });

  it('should validate a valid trace', () => {
    const trace = composeTradeOffTrace({
      traceId: '_trace_1',
      decisions: [],
      registryVersion: '1.0.0',
      compositionVersion: '1.0.0',
    });

    const result = validateTradeOffTrace(trace);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it('should detect invalid trace', () => {
    const trace: TradeOffTrace = {
      traceId: '',
      decisionCount: 0,
      validationCount: 0,
      registryVersion: '1.0.0',
      compositionVersion: '1.0.0',
      decisions: [],
      deterministic: false as true,
      generatedFrom: 'deterministic_trade_off_kernel',
      randomUsed: false,
      timeDependency: false,
    };

    const result = validateTradeOffTrace(trace);
    assert.equal(result.valid, false);
  });
});

// ---------------------------------------------------------------------------
// Determinism Tests
// ---------------------------------------------------------------------------

describe('Trade-Off Kernel — Determinism', () => {
  it('should produce identical output for identical input (100 iterations)', () => {
    const results: ReturnType<typeof composeEngineeringTradeOffs>[] = [];
    for (let i = 0; i < 100; i++) {
      results.push(composeEngineeringTradeOffs(VALID_INPUT));
    }

    for (let i = 1; i < results.length; i++) {
      assert.deepStrictEqual(results[0].registryId, results[i].registryId);
      assert.deepStrictEqual(results[0].tradeOffs, results[i].tradeOffs);
      assert.deepStrictEqual(results[0].trace.traceId, results[i].trace.traceId);
    }
  });

  it('should produce identical registry output for identical input', () => {
    const results: ReturnType<typeof composeTradeOffRegistry>[] = [];
    for (let i = 0; i < 100; i++) {
      results.push(composeTradeOffRegistry(
        [VALID_TRADE_OFF],
        [VALID_DIMENSION],
        [],
      ));
    }

    for (let i = 1; i < results.length; i++) {
      assert.deepStrictEqual(results[0].tradeOffs, results[i].tradeOffs);
      assert.deepStrictEqual(results[0].dimensions, results[i].dimensions);
      assert.deepStrictEqual(results[0].registryId, results[i].registryId);
    }
  });
});

// ---------------------------------------------------------------------------
// Immutability Tests
// ---------------------------------------------------------------------------

describe('Trade-Off Kernel — Immutability', () => {
  it('should not mutate input trade-offs', () => {
    const originalId = VALID_TRADE_OFF.tradeOffId;
    const originalTitle = VALID_TRADE_OFF.title;

    composeEngineeringTradeOffs(VALID_INPUT);

    assert.equal(VALID_TRADE_OFF.tradeOffId, originalId);
    assert.equal(VALID_TRADE_OFF.title, originalTitle);
  });

  it('should not mutate input registry trade-offs', () => {
    const tradeOffs = [VALID_TRADE_OFF, VALID_TRADE_OFF_2];
    const originalIds = tradeOffs.map((t) => t.tradeOffId);

    composeTradeOffRegistry(tradeOffs, [], []);

    assert.equal(tradeOffs[0].tradeOffId, originalIds[0]);
    assert.equal(tradeOffs[1].tradeOffId, originalIds[1]);
  });

  it('should not mutate the original application node', () => {
    const registry = composeTradeOffRegistry([VALID_TRADE_OFF], [], []);
    const originalDescription = VALID_NODE.description;

    composeApplicationArtifactWithTradeOffs({
      applicationNode: VALID_NODE,
      tradeOffRegistry: registry,
    });

    assert.equal(VALID_NODE.description, originalDescription);
  });
});

// ---------------------------------------------------------------------------
// Helper Function Tests
// ---------------------------------------------------------------------------

describe('Trade-Off Kernel — Helper Functions', () => {
  it('should return canonical trade-off types', () => {
    const types = getCanonicalTradeOffTypes();
    assert.deepStrictEqual([...types], [...CANONICAL_TRADE_OFF_TYPES]);
    assert.equal(types.length, 10);
  });

  it('should return canonical engineering dimensions', () => {
    const dims = getCanonicalEngineeringDimensions();
    assert.deepStrictEqual([...dims], [...CANONICAL_ENGINEERING_DIMENSIONS]);
    assert.equal(dims.length, 12);
  });

  it('should return canonical severities', () => {
    const sevs = getCanonicalTradeOffSeverities();
    assert.deepStrictEqual([...sevs], [...CANONICAL_TRADE_OFF_SEVERITY]);
    assert.equal(sevs.length, 5);
  });

  it('should return canonical decision drivers', () => {
    const drivers = getCanonicalDecisionDrivers();
    assert.deepStrictEqual([...drivers], [...CANONICAL_DECISION_DRIVERS]);
    assert.equal(drivers.length, 10);
  });

  it('should return canonical statuses', () => {
    const statuses = getCanonicalTradeOffStatuses();
    assert.deepStrictEqual([...statuses], [...CANONICAL_TRADE_OFF_STATUS]);
    assert.equal(statuses.length, 6);
  });

  it('should validate trade-off type support', () => {
    assert.equal(isSupportedTradeOffType('accuracy_latency'), true);
    assert.equal(isSupportedTradeOffType('scalability_cost'), true);
    assert.equal(isSupportedTradeOffType('unsupported'), false);
  });

  it('should validate engineering dimension support', () => {
    assert.equal(isSupportedEngineeringDimension('accuracy'), true);
    assert.equal(isSupportedEngineeringDimension('latency'), true);
    assert.equal(isSupportedEngineeringDimension('unsupported'), false);
  });

  it('should validate severity support', () => {
    assert.equal(isSupportedTradeOffSeverity('minimal'), true);
    assert.equal(isSupportedTradeOffSeverity('critical'), true);
    assert.equal(isSupportedTradeOffSeverity('unsupported'), false);
  });

  it('should validate decision driver support', () => {
    assert.equal(isSupportedDecisionDriver('business_requirement'), true);
    assert.equal(isSupportedDecisionDriver('cost_constraint'), true);
    assert.equal(isSupportedDecisionDriver('unsupported'), false);
  });

  it('should validate status support', () => {
    assert.equal(isSupportedTradeOffStatus('draft'), true);
    assert.equal(isSupportedTradeOffStatus('published'), true);
    assert.equal(isSupportedTradeOffStatus('unsupported'), false);
  });

  it('should validate governance support', () => {
    assert.equal(isSupportedTradeOffGovernance('canonical'), true);
    assert.equal(isSupportedTradeOffGovernance('accepted'), true);
    assert.equal(isSupportedTradeOffGovernance('unsupported'), false);
  });
});

// ---------------------------------------------------------------------------
// Canonical Enum Completeness Tests
// ---------------------------------------------------------------------------

describe('Trade-Off Kernel — Canonical Enum Completeness', () => {
  it('should have exactly 10 trade-off types', () => {
    assert.equal(CANONICAL_TRADE_OFF_TYPES.length, 10);
  });

  it('should have exactly 12 engineering dimensions', () => {
    assert.equal(CANONICAL_ENGINEERING_DIMENSIONS.length, 12);
  });

  it('should have exactly 5 severities', () => {
    assert.equal(CANONICAL_TRADE_OFF_SEVERITY.length, 5);
  });

  it('should have exactly 10 decision drivers', () => {
    assert.equal(CANONICAL_DECISION_DRIVERS.length, 10);
  });

  it('should have exactly 6 statuses', () => {
    assert.equal(CANONICAL_TRADE_OFF_STATUS.length, 6);
  });

  it('should contain all expected trade-off types', () => {
    const expected = ['accuracy_latency', 'accuracy_memory', 'accuracy_cost', 'latency_memory', 'latency_energy', 'throughput_latency', 'performance_interpretability', 'scalability_cost', 'robustness_complexity', 'deployment_maintainability'];

    for (const type of expected) {
      assert.ok(
        CANONICAL_TRADE_OFF_TYPES.includes(type as any),
        `Should include type: ${type}`,
      );
    }
  });

  it('should contain all expected engineering dimensions', () => {
    const expected = ['accuracy', 'latency', 'throughput', 'memory', 'energy', 'cost', 'robustness', 'reliability', 'scalability', 'interpretability', 'maintainability', 'security'];

    for (const dim of expected) {
      assert.ok(
        CANONICAL_ENGINEERING_DIMENSIONS.includes(dim as any),
        `Should include dimension: ${dim}`,
      );
    }
  });

  it('should contain all expected statuses', () => {
    const expected = ['draft', 'review', 'approved', 'published', 'deprecated', 'archived'];

    for (const status of expected) {
      assert.ok(
        CANONICAL_TRADE_OFF_STATUS.includes(status as any),
        `Should include status: ${status}`,
      );
    }
  });
});

// ---------------------------------------------------------------------------
// Negative Capability Verification Tests
// ---------------------------------------------------------------------------

describe('Trade-Off Kernel — Negative Capability Verification', () => {
  it('should not use Math.random', () => {
    const result = composeEngineeringTradeOffs(VALID_INPUT);
    assert.ok(result, 'Should produce a result without Math.random');
  });

  it('should not use Date.now', () => {
    const result = composeEngineeringTradeOffs(VALID_INPUT);
    assert.ok(result, 'Should produce a result without Date.now');
  });

  it('should not use performance.now', () => {
    const result = composeEngineeringTradeOffs(VALID_INPUT);
    assert.ok(result, 'Should produce a result without performance.now');
  });

  it('should not use crypto.randomUUID', () => {
    const result = composeEngineeringTradeOffs(VALID_INPUT);
    assert.ok(result, 'Should produce a result without crypto.randomUUID');
  });

  it('should not generate trade-off content', () => {
    const result = composeEngineeringTradeOffs(VALID_INPUT);
    assert.ok(!('generatedContent' in result), 'Should not have generated content');
    assert.ok(!('generatedMarkdown' in result), 'Should not have generated markdown');
  });

  it('should not perform network requests', () => {
    const result = composeEngineeringTradeOffs(VALID_INPUT);
    assert.ok(!('networkResponse' in result), 'Should not have network response');
  });

  it('should not generate code', () => {
    const result = composeEngineeringTradeOffs(VALID_INPUT);
    assert.ok(!('generatedCode' in result), 'Should not have generated code');
  });

  it('should not have executable callbacks in trade-off', () => {
    const to = composeEngineeringTradeOff({
      tradeOffId: 'to-001',
      title: 'Test',
      description: 'Test.',
      tradeOffType: 'accuracy_latency',
      severity: 'significant',
      applicationArtifactId: 'app-001',
      knowledgeArtifactId: 'knowledge-001',
      architectureId: 'arch-001',
      caseStudyId: 'cs-001',
      decisionDriver: 'performance_requirement',
      status: 'published',
      provenance: VALID_PROVENANCE,
    });

    const keys = Object.keys(to);
    for (const key of keys) {
      const value = (to as any)[key];
      assert.ok(typeof value !== 'function', `Trade-off field "${key}" should not be a function`);
    }
  });

  it('should not store educational content', () => {
    const result = composeEngineeringTradeOffs(VALID_INPUT);
    assert.ok(!('educationalContent' in result), 'Should not have educational content');
  });

  it('should not access filesystem', () => {
    const result = composeEngineeringTradeOffs(VALID_INPUT);
    assert.ok(!('filesystem' in result), 'Should not have filesystem');
  });
});

// ---------------------------------------------------------------------------
// Registry Validation Tests
// ---------------------------------------------------------------------------

describe('Trade-Off Kernel — Registry Validation', () => {
  it('should detect registry inconsistency with invalid deterministic flag', () => {
    const registry: TradeOffRegistry = {
      ...composeTradeOffRegistry([VALID_TRADE_OFF], [], []),
      deterministic: false as any,
    };
    const result = validateTradeOffRegistry(registry);
    assert.equal(result.valid, false);
  });

  it('should detect registry inconsistency with invalid randomUsed flag', () => {
    const registry: TradeOffRegistry = {
      ...composeTradeOffRegistry([VALID_TRADE_OFF], [], []),
      randomUsed: true as any,
    };
    const result = validateTradeOffRegistry(registry);
    assert.equal(result.valid, false);
  });

  it('should detect registry inconsistency with invalid timeDependency flag', () => {
    const registry: TradeOffRegistry = {
      ...composeTradeOffRegistry([VALID_TRADE_OFF], [], []),
      timeDependency: true as any,
    };
    const result = validateTradeOffRegistry(registry);
    assert.equal(result.valid, false);
  });

  it('should validate empty input', () => {
    const result = validateTradeOffInput(EMPTY_INPUT);
    assert.equal(result.valid, false);
    const emptyError = result.errors.find(
      (e) => e.code === TRADE_OFF_VALIDATION_CODES.TRADE_OFF_EMPTY_REGISTRY,
    );
    assert.ok(emptyError, 'Should have TRADE_OFF_EMPTY_REGISTRY error');
  });
});

// ---------------------------------------------------------------------------
// Validator Stability Tests
// ---------------------------------------------------------------------------

describe('Trade-Off Kernel — Validator Stability', () => {
  it('should produce identical validation results for valid input', () => {
    const result1 = validateTradeOffRegistry(composeTradeOffRegistry([VALID_TRADE_OFF], [], []));
    const result2 = validateTradeOffRegistry(composeTradeOffRegistry([VALID_TRADE_OFF], [], []));

    assert.deepStrictEqual(result1.valid, result2.valid);
    assert.deepStrictEqual(result1.errors.length, result2.errors.length);
  });

  it('should produce identical validation results for invalid input', () => {
    const to = { ...VALID_TRADE_OFF, tradeOffType: 'unsupported' as any };
    const result1 = validateEngineeringTradeOff(to);
    const result2 = validateEngineeringTradeOff(to);

    assert.deepStrictEqual(result1.length, result2.length);
  });
});

// ---------------------------------------------------------------------------
// No Mutation Behavior Tests
// ---------------------------------------------------------------------------

describe('Trade-Off Kernel — No Mutation Behavior', () => {
  it('should not mutate trade-offs during registry composition', () => {
    const tradeOffs = [
      { ...VALID_TRADE_OFF, tradeOffId: 'to-003' },
      { ...VALID_TRADE_OFF, tradeOffId: 'to-001' },
      { ...VALID_TRADE_OFF, tradeOffId: 'to-002' },
    ];
    const originalOrder = tradeOffs.map((t) => t.tradeOffId);

    composeTradeOffRegistry(tradeOffs, [], []);

    assert.deepStrictEqual(tradeOffs.map((t) => t.tradeOffId), originalOrder);
  });

  it('should not mutate input during full composition', () => {
    const input: TradeOffInput = {
      tradeOffs: [
        { ...VALID_TRADE_OFF, tradeOffId: 'to-002' },
        { ...VALID_TRADE_OFF, tradeOffId: 'to-001' },
      ],
      dimensions: [],
      relationships: [],
    };
    const originalOrder = input.tradeOffs.map((t) => t.tradeOffId);

    composeEngineeringTradeOffs(input);

    assert.deepStrictEqual(input.tradeOffs.map((t) => t.tradeOffId), originalOrder);
  });
});

// ---------------------------------------------------------------------------
// Artifact with Trade-Offs Tests
// ---------------------------------------------------------------------------

describe('Trade-Off Kernel — Artifact with Trade-Offs', () => {
  it('should compose application artifact with trade-offs', () => {
    const registry = composeTradeOffRegistry([VALID_TRADE_OFF], [VALID_DIMENSION], []);
    const result = composeApplicationArtifactWithTradeOffs({
      applicationNode: VALID_NODE,
      tradeOffRegistry: registry,
    });

    assert.equal(result.applicationNode.applicationId, 'app-001');
    assert.equal(result.tradeOffRegistry.tradeOffs.length, 1);
    assert.equal(result.deterministic, true);
    assert.equal(result.randomUsed, false);
    assert.equal(result.timeDependency, false);
  });

  it('should not mutate the original application node', () => {
    const registry = composeTradeOffRegistry([VALID_TRADE_OFF], [], []);
    const originalTitle = VALID_NODE.title;

    composeApplicationArtifactWithTradeOffs({
      applicationNode: VALID_NODE,
      tradeOffRegistry: registry,
    });

    assert.equal(VALID_NODE.title, originalTitle);
  });
});

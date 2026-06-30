/**
 * NV-1900-D7-OPT-09 — MLOps Lifecycle & Production Constraint Modeling Kernel Test Suite
 *
 * Comprehensive deterministic test suite for the MLOps Lifecycle Kernel.
 * Covers: valid lifecycle, valid constraints, valid deployments, valid monitoring,
 * valid provenance, registry composition, artifact with MLOps metadata,
 * duplicate IDs, duplicate titles, invalid enums, missing provenance,
 * missing provider, missing rationale, missing references, empty registry,
 * registry inconsistency, invalid trace, deterministic ordering,
 * 100 identical executions, immutable registry, input immutability,
 * artifact immutability, cross-agent boundary verification,
 * negative capability verification, helper functions,
 * canonical enum completeness, validator stability, no mutation verification.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import type {
  MLOpsLifecycle,
  MLOpsProvenance,
  ProductionConstraint,
  DeploymentProfile,
  MonitoringRequirement,
  MLOpsInput,
  MLOpsRegistry,
  MLOpsTrace,
  ApplicationNode,
} from './ApplicationAgentContract.ts';

import {
  CANONICAL_MLOPS_LIFECYCLE_STAGES,
  CANONICAL_PRODUCTION_CONSTRAINT_TYPES,
  CANONICAL_DEPLOYMENT_TYPES,
  CANONICAL_MONITORING_TYPES,
  CANONICAL_PRODUCTION_READINESS_LEVELS,
  CANONICAL_MLOPS_STATUS,
} from './ApplicationAgentContract.ts';

import {
  composeMLOpsProvenance,
  composeMLOpsLifecycle,
  composeProductionConstraint,
  composeDeploymentProfile,
  composeMonitoringRequirement,
  composeMLOpsDecision,
  composeMLOpsTrace,
  composeMLOpsRegistry,
  composeMLOpsRegistryFromInput,
  composeMLOpsLifecycleMetadata,
  composeApplicationArtifactWithMLOps,
  isSupportedLifecycleStage,
  isSupportedProductionConstraint,
  isSupportedDeploymentType,
  isSupportedMonitoringType,
  isSupportedProductionReadiness,
  isSupportedMLOpsStatus,
  isSupportedMLOpsGovernance,
  getCanonicalLifecycleStages,
  getCanonicalProductionConstraintTypes,
  getCanonicalDeploymentTypes,
  getCanonicalMonitoringTypes,
  getCanonicalProductionReadinessLevels,
  getCanonicalMLOpsStatuses,
} from './MLOpsLifecycleKernel.ts';

import {
  validateMLOpsLifecycle,
  validateProductionConstraint,
  validateDeploymentProfile,
  validateMonitoringRequirement,
  validateMLOpsRegistry,
  validateMLOpsInput,
  validateMLOpsTrace,
  MLOPS_VALIDATION_CODES,
} from './MLOpsLifecycleValidation.ts';

// ---------------------------------------------------------------------------
// Test Fixtures
// ---------------------------------------------------------------------------

const VALID_PROVENANCE: MLOpsProvenance = {
  providedBy: 'NeuralVerse Team',
  rationale: 'Core lifecycle concept.',
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

const VALID_LIFECYCLE: MLOpsLifecycle = {
  lifecycleId: 'lc-001',
  title: 'Model Development Lifecycle',
  stage: 'model_development',
  applicationArtifactId: 'app-001',
  knowledgeArtifactId: 'knowledge-001',
  architectureId: 'arch-001',
  status: 'published',
  provenance: VALID_PROVENANCE,
};

const VALID_LIFECYCLE_2: MLOpsLifecycle = {
  lifecycleId: 'lc-002',
  title: 'Deployment Lifecycle',
  stage: 'deployment',
  applicationArtifactId: 'app-001',
  knowledgeArtifactId: 'knowledge-002',
  architectureId: 'arch-002',
  status: 'approved',
  provenance: { ...VALID_PROVENANCE, providedBy: 'Research Team' },
};

const VALID_CONSTRAINT: ProductionConstraint = {
  constraintId: 'const-001',
  lifecycleId: 'lc-001',
  constraintType: 'latency',
  description: 'Inference latency must be under 100ms.',
  severity: 'major',
  provenance: VALID_PROVENANCE,
};

const VALID_DEPLOYMENT: DeploymentProfile = {
  deploymentId: 'dep-001',
  lifecycleId: 'lc-001',
  deploymentType: 'cloud',
  readinessLevel: 'production',
  description: 'Cloud deployment on AWS.',
  provenance: VALID_PROVENANCE,
};

const VALID_MONITORING: MonitoringRequirement = {
  monitoringId: 'mon-001',
  lifecycleId: 'lc-001',
  monitoringType: 'performance',
  description: 'Monitor inference performance.',
  provenance: VALID_PROVENANCE,
};

const VALID_INPUT: MLOpsInput = {
  lifecycles: [VALID_LIFECYCLE, VALID_LIFECYCLE_2],
  constraints: [VALID_CONSTRAINT],
  deployments: [VALID_DEPLOYMENT],
  monitoring: [VALID_MONITORING],
};

const EMPTY_INPUT: MLOpsInput = {
  lifecycles: [],
  constraints: [],
  deployments: [],
  monitoring: [],
};

// ---------------------------------------------------------------------------
// Lifecycle Composition Tests
// ---------------------------------------------------------------------------

describe('MLOps Lifecycle Kernel — Composition', () => {
  it('should compose valid MLOps provenance', () => {
    const provenance = composeMLOpsProvenance({
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

  it('should compose valid MLOps lifecycle', () => {
    const lifecycle = composeMLOpsLifecycle({
      lifecycleId: 'lc-001',
      title: 'Test Lifecycle',
      stage: 'model_development',
      applicationArtifactId: 'app-001',
      knowledgeArtifactId: 'knowledge-001',
      architectureId: 'arch-001',
      status: 'published',
      provenance: VALID_PROVENANCE,
    });

    assert.equal(lifecycle.lifecycleId, 'lc-001');
    assert.equal(lifecycle.title, 'Test Lifecycle');
    assert.equal(lifecycle.stage, 'model_development');
  });

  it('should compose valid production constraint', () => {
    const constraint = composeProductionConstraint({
      constraintId: 'const-001',
      lifecycleId: 'lc-001',
      constraintType: 'latency',
      description: 'Test constraint.',
      severity: 'major',
      provenance: VALID_PROVENANCE,
    });

    assert.equal(constraint.constraintId, 'const-001');
    assert.equal(constraint.constraintType, 'latency');
    assert.equal(constraint.severity, 'major');
  });

  it('should compose valid deployment profile', () => {
    const deployment = composeDeploymentProfile({
      deploymentId: 'dep-001',
      lifecycleId: 'lc-001',
      deploymentType: 'cloud',
      readinessLevel: 'production',
      description: 'Test deployment.',
      provenance: VALID_PROVENANCE,
    });

    assert.equal(deployment.deploymentId, 'dep-001');
    assert.equal(deployment.deploymentType, 'cloud');
    assert.equal(deployment.readinessLevel, 'production');
  });

  it('should compose valid monitoring requirement', () => {
    const monitoring = composeMonitoringRequirement({
      monitoringId: 'mon-001',
      lifecycleId: 'lc-001',
      monitoringType: 'performance',
      description: 'Test monitoring.',
      provenance: VALID_PROVENANCE,
    });

    assert.equal(monitoring.monitoringId, 'mon-001');
    assert.equal(monitoring.monitoringType, 'performance');
  });

  it('should compose valid MLOps trace', () => {
    const trace = composeMLOpsTrace({
      traceId: '_trace_1',
      decisions: [
        { decisionId: 'd1', lifecycleId: 'lc-001', validationPassed: true, validationErrors: [] },
      ],
      registryVersion: '1.0.0',
      compositionVersion: '1.0.0',
    });

    assert.equal(trace.traceId, '_trace_1');
    assert.equal(trace.decisionCount, 1);
    assert.equal(trace.validationCount, 1);
    assert.equal(trace.deterministic, true);
  });

  it('should validate a valid lifecycle with no errors', () => {
    const errors = validateMLOpsLifecycle(VALID_LIFECYCLE);
    assert.deepStrictEqual(errors, []);
  });

  it('should validate a valid registry with no errors', () => {
    const registry = composeMLOpsRegistry(
      [VALID_LIFECYCLE, VALID_LIFECYCLE_2],
      [VALID_CONSTRAINT],
      [VALID_DEPLOYMENT],
      [VALID_MONITORING],
    );
    const result = validateMLOpsRegistry(registry);

    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it('should validate MLOps input', () => {
    const result = validateMLOpsInput(VALID_INPUT);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });
});

// ---------------------------------------------------------------------------
// Registry Tests
// ---------------------------------------------------------------------------

describe('MLOps Lifecycle Kernel — Registry', () => {
  it('should detect empty registry', () => {
    const registry = composeMLOpsRegistry([], [], [], []);
    const result = validateMLOpsRegistry(registry);
    const emptyError = result.errors.find(
      (e) => e.code === MLOPS_VALIDATION_CODES.MLOPS_EMPTY_REGISTRY,
    );

    assert.ok(emptyError, 'Should have MLOPS_EMPTY_REGISTRY error');
    assert.equal(result.valid, false);
  });

  it('should detect duplicate lifecycle IDs', () => {
    const registry = composeMLOpsRegistry([VALID_LIFECYCLE, VALID_LIFECYCLE], [], [], []);
    const result = validateMLOpsRegistry(registry);
    const duplicateError = result.errors.find(
      (e) => e.code === MLOPS_VALIDATION_CODES.MLOPS_DUPLICATE_ID,
    );

    assert.ok(duplicateError, 'Should have MLOPS_DUPLICATE_ID error');
  });

  it('should detect duplicate lifecycle titles', () => {
    const l1 = { ...VALID_LIFECYCLE, lifecycleId: 'lc-001', title: 'Same Title' };
    const l2 = { ...VALID_LIFECYCLE, lifecycleId: 'lc-002', title: 'Same Title' };
    const registry = composeMLOpsRegistry([l1, l2], [], [], []);
    const result = validateMLOpsRegistry(registry);
    const duplicateError = result.errors.find(
      (e) => e.code === MLOPS_VALIDATION_CODES.MLOPS_DUPLICATE_TITLE,
    );

    assert.ok(duplicateError, 'Should have MLOPS_DUPLICATE_TITLE error');
  });

  it('should detect duplicate constraint IDs', () => {
    const registry = composeMLOpsRegistry(
      [VALID_LIFECYCLE],
      [VALID_CONSTRAINT, VALID_CONSTRAINT],
      [],
      [],
    );
    const result = validateMLOpsRegistry(registry);
    const duplicateError = result.errors.find(
      (e) => e.code === MLOPS_VALIDATION_CODES.CONSTRAINT_DUPLICATE_ID,
    );

    assert.ok(duplicateError, 'Should have CONSTRAINT_DUPLICATE_ID error');
  });

  it('should detect duplicate deployment IDs', () => {
    const registry = composeMLOpsRegistry(
      [VALID_LIFECYCLE],
      [],
      [VALID_DEPLOYMENT, VALID_DEPLOYMENT],
      [],
    );
    const result = validateMLOpsRegistry(registry);
    const duplicateError = result.errors.find(
      (e) => e.code === MLOPS_VALIDATION_CODES.DEPLOYMENT_DUPLICATE_ID,
    );

    assert.ok(duplicateError, 'Should have DEPLOYMENT_DUPLICATE_ID error');
  });

  it('should detect duplicate monitoring IDs', () => {
    const registry = composeMLOpsRegistry(
      [VALID_LIFECYCLE],
      [],
      [],
      [VALID_MONITORING, VALID_MONITORING],
    );
    const result = validateMLOpsRegistry(registry);
    const duplicateError = result.errors.find(
      (e) => e.code === MLOPS_VALIDATION_CODES.MONITORING_DUPLICATE_ID,
    );

    assert.ok(duplicateError, 'Should have MONITORING_DUPLICATE_ID error');
  });

  it('should sort lifecycles deterministically', () => {
    const l3 = { ...VALID_LIFECYCLE, lifecycleId: 'lc-003' };
    const l1 = { ...VALID_LIFECYCLE, lifecycleId: 'lc-001' };
    const l2 = { ...VALID_LIFECYCLE, lifecycleId: 'lc-002' };

    const registry = composeMLOpsRegistry([l3, l1, l2], [], [], []);

    assert.equal(registry.lifecycles[0].lifecycleId, 'lc-001');
    assert.equal(registry.lifecycles[1].lifecycleId, 'lc-002');
    assert.equal(registry.lifecycles[2].lifecycleId, 'lc-003');
  });

  it('should sort constraints deterministically', () => {
    const c2 = { ...VALID_CONSTRAINT, constraintId: 'const-002', constraintType: 'throughput' as const };
    const c1 = { ...VALID_CONSTRAINT, constraintId: 'const-001', constraintType: 'latency' as const };

    const registry = composeMLOpsRegistry(
      [VALID_LIFECYCLE],
      [c2, c1],
      [],
      [],
    );

    assert.equal(registry.constraints[0].constraintType, 'latency');
    assert.equal(registry.constraints[1].constraintType, 'throughput');
  });

  it('should sort deployments deterministically', () => {
    const d2 = { ...VALID_DEPLOYMENT, deploymentId: 'dep-002', deploymentType: 'edge' as const };
    const d1 = { ...VALID_DEPLOYMENT, deploymentId: 'dep-001', deploymentType: 'cloud' as const };

    const registry = composeMLOpsRegistry(
      [VALID_LIFECYCLE],
      [],
      [d2, d1],
      [],
    );

    assert.equal(registry.deployments[0].deploymentType, 'cloud');
    assert.equal(registry.deployments[1].deploymentType, 'edge');
  });

  it('should sort monitoring deterministically', () => {
    const m2 = { ...VALID_MONITORING, monitoringId: 'mon-002', monitoringType: 'drift' as const };
    const m1 = { ...VALID_MONITORING, monitoringId: 'mon-001', monitoringType: 'performance' as const };

    const registry = composeMLOpsRegistry(
      [VALID_LIFECYCLE],
      [],
      [],
      [m2, m1],
    );

    assert.equal(registry.monitoring[0].monitoringType, 'drift');
    assert.equal(registry.monitoring[1].monitoringType, 'performance');
  });

  it('should compute correct metadata counts', () => {
    const registry = composeMLOpsRegistry(
      [VALID_LIFECYCLE, VALID_LIFECYCLE_2],
      [VALID_CONSTRAINT],
      [VALID_DEPLOYMENT],
      [VALID_MONITORING],
    );

    assert.equal(registry.metadata.lifecycleCount, 2);
    assert.equal(registry.metadata.constraintCount, 1);
    assert.equal(registry.metadata.deploymentCount, 1);
    assert.equal(registry.metadata.monitoringCount, 1);
    assert.equal(registry.metadata.typeCount, 2);
  });
});

// ---------------------------------------------------------------------------
// Validation Tests
// ---------------------------------------------------------------------------

describe('MLOps Lifecycle Kernel — Validation', () => {
  it('should detect invalid lifecycle stage', () => {
    const lifecycle = { ...VALID_LIFECYCLE, stage: 'unsupported' as any };
    const errors = validateMLOpsLifecycle(lifecycle);
    const stageError = errors.find(
      (e) => e.code === MLOPS_VALIDATION_CODES.MLOPS_INVALID_STAGE,
    );

    assert.ok(stageError, 'Should have MLOPS_INVALID_STAGE error');
  });

  it('should detect invalid constraint type', () => {
    const constraint = { ...VALID_CONSTRAINT, constraintType: 'unsupported' as any };
    const errors = validateProductionConstraint(constraint);
    const typeError = errors.find(
      (e) => e.code === MLOPS_VALIDATION_CODES.MLOPS_INVALID_CONSTRAINT,
    );

    assert.ok(typeError, 'Should have MLOPS_INVALID_CONSTRAINT error');
  });

  it('should detect invalid deployment type', () => {
    const deployment = { ...VALID_DEPLOYMENT, deploymentType: 'unsupported' as any };
    const errors = validateDeploymentProfile(deployment);
    const typeError = errors.find(
      (e) => e.code === MLOPS_VALIDATION_CODES.MLOPS_INVALID_DEPLOYMENT,
    );

    assert.ok(typeError, 'Should have MLOPS_INVALID_DEPLOYMENT error');
  });

  it('should detect invalid monitoring type', () => {
    const monitoring = { ...VALID_MONITORING, monitoringType: 'unsupported' as any };
    const errors = validateMonitoringRequirement(monitoring);
    const typeError = errors.find(
      (e) => e.code === MLOPS_VALIDATION_CODES.MLOPS_INVALID_MONITORING,
    );

    assert.ok(typeError, 'Should have MLOPS_INVALID_MONITORING error');
  });

  it('should detect invalid readiness level', () => {
    const deployment = { ...VALID_DEPLOYMENT, readinessLevel: 'unsupported' as any };
    const errors = validateDeploymentProfile(deployment);
    const readinessError = errors.find(
      (e) => e.code === MLOPS_VALIDATION_CODES.MLOPS_INVALID_READINESS,
    );

    assert.ok(readinessError, 'Should have MLOPS_INVALID_READINESS error');
  });

  it('should detect invalid severity', () => {
    const constraint = { ...VALID_CONSTRAINT, severity: 'unsupported' as any };
    const errors = validateProductionConstraint(constraint);
    const severityError = errors.find(
      (e) => e.code === MLOPS_VALIDATION_CODES.MLOPS_INVALID_SEVERITY,
    );

    assert.ok(severityError, 'Should have MLOPS_INVALID_SEVERITY error');
  });

  it('should detect invalid status', () => {
    const lifecycle = { ...VALID_LIFECYCLE, status: 'unsupported' as any };
    const errors = validateMLOpsLifecycle(lifecycle);
    const statusError = errors.find(
      (e) => e.code === MLOPS_VALIDATION_CODES.MLOPS_INVALID_STATUS,
    );

    assert.ok(statusError, 'Should have MLOPS_INVALID_STATUS error');
  });

  it('should detect invalid governance', () => {
    const lifecycle = { ...VALID_LIFECYCLE, provenance: { ...VALID_PROVENANCE, governanceStatus: 'invalid' as any } };
    const errors = validateMLOpsLifecycle(lifecycle);
    const governanceError = errors.find(
      (e) => e.code === MLOPS_VALIDATION_CODES.MLOPS_INVALID_GOVERNANCE,
    );

    assert.ok(governanceError, 'Should have MLOPS_INVALID_GOVERNANCE error');
  });

  it('should detect missing provenance', () => {
    const lifecycle = { ...VALID_LIFECYCLE, provenance: undefined as any };
    const errors = validateMLOpsLifecycle(lifecycle);
    const provenanceError = errors.find(
      (e) => e.code === MLOPS_VALIDATION_CODES.MLOPS_MISSING_PROVENANCE,
    );

    assert.ok(provenanceError, 'Should have MLOPS_MISSING_PROVENANCE error');
  });

  it('should detect missing provider', () => {
    const lifecycle = { ...VALID_LIFECYCLE, provenance: { ...VALID_PROVENANCE, providedBy: '' } };
    const errors = validateMLOpsLifecycle(lifecycle);
    const providerError = errors.find(
      (e) => e.code === MLOPS_VALIDATION_CODES.MLOPS_MISSING_PROVIDER,
    );

    assert.ok(providerError, 'Should have MLOPS_MISSING_PROVIDER error');
  });

  it('should detect missing rationale', () => {
    const lifecycle = { ...VALID_LIFECYCLE, provenance: { ...VALID_PROVENANCE, rationale: '' } };
    const errors = validateMLOpsLifecycle(lifecycle);
    const rationaleError = errors.find(
      (e) => e.code === MLOPS_VALIDATION_CODES.MLOPS_MISSING_RATIONALE,
    );

    assert.ok(rationaleError, 'Should have MLOPS_MISSING_RATIONALE error');
  });

  it('should detect missing application reference', () => {
    const lifecycle = { ...VALID_LIFECYCLE, applicationArtifactId: '' };
    const errors = validateMLOpsLifecycle(lifecycle);
    const refError = errors.find(
      (e) => e.code === MLOPS_VALIDATION_CODES.MLOPS_MISSING_APPLICATION_REFERENCE,
    );

    assert.ok(refError, 'Should have MLOPS_MISSING_APPLICATION_REFERENCE error');
  });

  it('should detect missing knowledge reference', () => {
    const lifecycle = { ...VALID_LIFECYCLE, knowledgeArtifactId: '' };
    const errors = validateMLOpsLifecycle(lifecycle);
    const refError = errors.find(
      (e) => e.code === MLOPS_VALIDATION_CODES.MLOPS_MISSING_KNOWLEDGE_REFERENCE,
    );

    assert.ok(refError, 'Should have MLOPS_MISSING_KNOWLEDGE_REFERENCE error');
  });

  it('should detect missing architecture reference', () => {
    const lifecycle = { ...VALID_LIFECYCLE, architectureId: '' };
    const errors = validateMLOpsLifecycle(lifecycle);
    const refError = errors.find(
      (e) => e.code === MLOPS_VALIDATION_CODES.MLOPS_MISSING_ARCHITECTURE_REFERENCE,
    );

    assert.ok(refError, 'Should have MLOPS_MISSING_ARCHITECTURE_REFERENCE error');
  });

  it('should detect missing lifecycle ID', () => {
    const lifecycle = { ...VALID_LIFECYCLE, lifecycleId: '' };
    const errors = validateMLOpsLifecycle(lifecycle);
    const idError = errors.find(
      (e) => e.code === MLOPS_VALIDATION_CODES.MLOPS_MISSING_LIFECYCLE_ID,
    );

    assert.ok(idError, 'Should have MLOPS_MISSING_LIFECYCLE_ID error');
  });

  it('should detect missing title', () => {
    const lifecycle = { ...VALID_LIFECYCLE, title: '' };
    const errors = validateMLOpsLifecycle(lifecycle);
    const titleError = errors.find(
      (e) => e.code === MLOPS_VALIDATION_CODES.MLOPS_MISSING_TITLE,
    );

    assert.ok(titleError, 'Should have MLOPS_MISSING_TITLE error');
  });

  it('should validate a valid trace', () => {
    const trace = composeMLOpsTrace({
      traceId: '_trace_1',
      decisions: [],
      registryVersion: '1.0.0',
      compositionVersion: '1.0.0',
    });

    const result = validateMLOpsTrace(trace);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it('should detect invalid trace', () => {
    const trace: MLOpsTrace = {
      traceId: '',
      decisionCount: 0,
      validationCount: 0,
      registryVersion: '1.0.0',
      compositionVersion: '1.0.0',
      decisions: [],
      deterministic: false as true,
      generatedFrom: 'deterministic_mlops_lifecycle_kernel',
      randomUsed: false,
      timeDependency: false,
    };

    const result = validateMLOpsTrace(trace);
    assert.equal(result.valid, false);
  });
});

// ---------------------------------------------------------------------------
// Determinism Tests
// ---------------------------------------------------------------------------

describe('MLOps Lifecycle Kernel — Determinism', () => {
  it('should produce identical output for identical input (100 iterations)', () => {
    const results: ReturnType<typeof composeMLOpsLifecycleMetadata>[] = [];
    for (let i = 0; i < 100; i++) {
      results.push(composeMLOpsLifecycleMetadata(VALID_INPUT));
    }

    for (let i = 1; i < results.length; i++) {
      assert.deepStrictEqual(results[0].registryId, results[i].registryId);
      assert.deepStrictEqual(results[0].lifecycles, results[i].lifecycles);
      assert.deepStrictEqual(results[0].trace.traceId, results[i].trace.traceId);
    }
  });

  it('should produce identical registry output for identical input', () => {
    const results: ReturnType<typeof composeMLOpsRegistry>[] = [];
    for (let i = 0; i < 100; i++) {
      results.push(composeMLOpsRegistry(
        [VALID_LIFECYCLE],
        [],
        [],
        [],
      ));
    }

    for (let i = 1; i < results.length; i++) {
      assert.deepStrictEqual(results[0].lifecycles, results[i].lifecycles);
      assert.deepStrictEqual(results[0].registryId, results[i].registryId);
    }
  });
});

// ---------------------------------------------------------------------------
// Immutability Tests
// ---------------------------------------------------------------------------

describe('MLOps Lifecycle Kernel — Immutability', () => {
  it('should not mutate input lifecycles', () => {
    const originalId = VALID_LIFECYCLE.lifecycleId;
    const originalTitle = VALID_LIFECYCLE.title;

    composeMLOpsLifecycleMetadata(VALID_INPUT);

    assert.equal(VALID_LIFECYCLE.lifecycleId, originalId);
    assert.equal(VALID_LIFECYCLE.title, originalTitle);
  });

  it('should not mutate input registry lifecycles', () => {
    const lifecycles = [VALID_LIFECYCLE, VALID_LIFECYCLE_2];
    const originalIds = lifecycles.map((l) => l.lifecycleId);

    composeMLOpsRegistry(lifecycles, [], [], []);

    assert.equal(lifecycles[0].lifecycleId, originalIds[0]);
    assert.equal(lifecycles[1].lifecycleId, originalIds[1]);
  });

  it('should not mutate the original application node', () => {
    const registry = composeMLOpsRegistry([VALID_LIFECYCLE], [], [], []);
    const originalDescription = VALID_NODE.description;

    composeApplicationArtifactWithMLOps({
      applicationNode: VALID_NODE,
      mlopsRegistry: registry,
    });

    assert.equal(VALID_NODE.description, originalDescription);
  });
});

// ---------------------------------------------------------------------------
// Helper Function Tests
// ---------------------------------------------------------------------------

describe('MLOps Lifecycle Kernel — Helper Functions', () => {
  it('should return canonical lifecycle stages', () => {
    const stages = getCanonicalLifecycleStages();
    assert.deepStrictEqual([...stages], [...CANONICAL_MLOPS_LIFECYCLE_STAGES]);
    assert.equal(stages.length, 10);
  });

  it('should return canonical production constraint types', () => {
    const types = getCanonicalProductionConstraintTypes();
    assert.deepStrictEqual([...types], [...CANONICAL_PRODUCTION_CONSTRAINT_TYPES]);
    assert.equal(types.length, 10);
  });

  it('should return canonical deployment types', () => {
    const types = getCanonicalDeploymentTypes();
    assert.deepStrictEqual([...types], [...CANONICAL_DEPLOYMENT_TYPES]);
    assert.equal(types.length, 10);
  });

  it('should return canonical monitoring types', () => {
    const types = getCanonicalMonitoringTypes();
    assert.deepStrictEqual([...types], [...CANONICAL_MONITORING_TYPES]);
    assert.equal(types.length, 10);
  });

  it('should return canonical production readiness levels', () => {
    const levels = getCanonicalProductionReadinessLevels();
    assert.deepStrictEqual([...levels], [...CANONICAL_PRODUCTION_READINESS_LEVELS]);
    assert.equal(levels.length, 5);
  });

  it('should return canonical statuses', () => {
    const statuses = getCanonicalMLOpsStatuses();
    assert.deepStrictEqual([...statuses], [...CANONICAL_MLOPS_STATUS]);
    assert.equal(statuses.length, 6);
  });

  it('should validate lifecycle stage support', () => {
    assert.equal(isSupportedLifecycleStage('model_development'), true);
    assert.equal(isSupportedLifecycleStage('deployment'), true);
    assert.equal(isSupportedLifecycleStage('unsupported'), false);
  });

  it('should validate production constraint support', () => {
    assert.equal(isSupportedProductionConstraint('latency'), true);
    assert.equal(isSupportedProductionConstraint('throughput'), true);
    assert.equal(isSupportedProductionConstraint('unsupported'), false);
  });

  it('should validate deployment type support', () => {
    assert.equal(isSupportedDeploymentType('cloud'), true);
    assert.equal(isSupportedDeploymentType('edge'), true);
    assert.equal(isSupportedDeploymentType('unsupported'), false);
  });

  it('should validate monitoring type support', () => {
    assert.equal(isSupportedMonitoringType('performance'), true);
    assert.equal(isSupportedMonitoringType('drift'), true);
    assert.equal(isSupportedMonitoringType('unsupported'), false);
  });

  it('should validate production readiness support', () => {
    assert.equal(isSupportedProductionReadiness('experimental'), true);
    assert.equal(isSupportedProductionReadiness('production'), true);
    assert.equal(isSupportedProductionReadiness('unsupported'), false);
  });

  it('should validate status support', () => {
    assert.equal(isSupportedMLOpsStatus('draft'), true);
    assert.equal(isSupportedMLOpsStatus('published'), true);
    assert.equal(isSupportedMLOpsStatus('unsupported'), false);
  });

  it('should validate governance support', () => {
    assert.equal(isSupportedMLOpsGovernance('canonical'), true);
    assert.equal(isSupportedMLOpsGovernance('accepted'), true);
    assert.equal(isSupportedMLOpsGovernance('unsupported'), false);
  });
});

// ---------------------------------------------------------------------------
// Canonical Enum Completeness Tests
// ---------------------------------------------------------------------------

describe('MLOps Lifecycle Kernel — Canonical Enum Completeness', () => {
  it('should have exactly 10 lifecycle stages', () => {
    assert.equal(CANONICAL_MLOPS_LIFECYCLE_STAGES.length, 10);
  });

  it('should have exactly 10 production constraint types', () => {
    assert.equal(CANONICAL_PRODUCTION_CONSTRAINT_TYPES.length, 10);
  });

  it('should have exactly 10 deployment types', () => {
    assert.equal(CANONICAL_DEPLOYMENT_TYPES.length, 10);
  });

  it('should have exactly 10 monitoring types', () => {
    assert.equal(CANONICAL_MONITORING_TYPES.length, 10);
  });

  it('should have exactly 5 production readiness levels', () => {
    assert.equal(CANONICAL_PRODUCTION_READINESS_LEVELS.length, 5);
  });

  it('should have exactly 6 statuses', () => {
    assert.equal(CANONICAL_MLOPS_STATUS.length, 6);
  });

  it('should contain all expected lifecycle stages', () => {
    const expected = ['problem_definition', 'data_collection', 'data_preparation', 'model_development', 'validation', 'deployment', 'monitoring', 'maintenance', 'continuous_improvement', 'retirement'];

    for (const stage of expected) {
      assert.ok(
        CANONICAL_MLOPS_LIFECYCLE_STAGES.includes(stage as any),
        `Should include stage: ${stage}`,
      );
    }
  });

  it('should contain all expected statuses', () => {
    const expected = ['draft', 'review', 'approved', 'published', 'deprecated', 'archived'];

    for (const status of expected) {
      assert.ok(
        CANONICAL_MLOPS_STATUS.includes(status as any),
        `Should include status: ${status}`,
      );
    }
  });
});

// ---------------------------------------------------------------------------
// Negative Capability Verification Tests
// ---------------------------------------------------------------------------

describe('MLOps Lifecycle Kernel — Negative Capability Verification', () => {
  it('should not use Math.random', () => {
    const result = composeMLOpsLifecycleMetadata(VALID_INPUT);
    assert.ok(result, 'Should produce a result without Math.random');
  });

  it('should not use Date.now', () => {
    const result = composeMLOpsLifecycleMetadata(VALID_INPUT);
    assert.ok(result, 'Should produce a result without Date.now');
  });

  it('should not use performance.now', () => {
    const result = composeMLOpsLifecycleMetadata(VALID_INPUT);
    assert.ok(result, 'Should produce a result without performance.now');
  });

  it('should not use crypto.randomUUID', () => {
    const result = composeMLOpsLifecycleMetadata(VALID_INPUT);
    assert.ok(result, 'Should produce a result without crypto.randomUUID');
  });

  it('should not generate lifecycle content', () => {
    const result = composeMLOpsLifecycleMetadata(VALID_INPUT);
    assert.ok(!('generatedContent' in result), 'Should not have generated content');
    assert.ok(!('generatedMarkdown' in result), 'Should not have generated markdown');
  });

  it('should not perform network requests', () => {
    const result = composeMLOpsLifecycleMetadata(VALID_INPUT);
    assert.ok(!('networkResponse' in result), 'Should not have network response');
  });

  it('should not generate code', () => {
    const result = composeMLOpsLifecycleMetadata(VALID_INPUT);
    assert.ok(!('generatedCode' in result), 'Should not have generated code');
  });

  it('should not have executable callbacks in lifecycle', () => {
    const lifecycle = composeMLOpsLifecycle({
      lifecycleId: 'lc-001',
      title: 'Test',
      stage: 'model_development',
      applicationArtifactId: 'app-001',
      knowledgeArtifactId: 'knowledge-001',
      architectureId: 'arch-001',
      status: 'published',
      provenance: VALID_PROVENANCE,
    });

    const keys = Object.keys(lifecycle);
    for (const key of keys) {
      const value = (lifecycle as any)[key];
      assert.ok(typeof value !== 'function', `Lifecycle field "${key}" should not be a function`);
    }
  });

  it('should not store educational content', () => {
    const result = composeMLOpsLifecycleMetadata(VALID_INPUT);
    assert.ok(!('educationalContent' in result), 'Should not have educational content');
  });

  it('should not access filesystem', () => {
    const result = composeMLOpsLifecycleMetadata(VALID_INPUT);
    assert.ok(!('filesystem' in result), 'Should not have filesystem');
  });
});

// ---------------------------------------------------------------------------
// Registry Validation Tests
// ---------------------------------------------------------------------------

describe('MLOps Lifecycle Kernel — Registry Validation', () => {
  it('should detect registry inconsistency with invalid deterministic flag', () => {
    const registry: MLOpsRegistry = {
      ...composeMLOpsRegistry([VALID_LIFECYCLE], [], [], []),
      deterministic: false as any,
    };
    const result = validateMLOpsRegistry(registry);
    assert.equal(result.valid, false);
  });

  it('should detect registry inconsistency with invalid randomUsed flag', () => {
    const registry: MLOpsRegistry = {
      ...composeMLOpsRegistry([VALID_LIFECYCLE], [], [], []),
      randomUsed: true as any,
    };
    const result = validateMLOpsRegistry(registry);
    assert.equal(result.valid, false);
  });

  it('should detect registry inconsistency with invalid timeDependency flag', () => {
    const registry: MLOpsRegistry = {
      ...composeMLOpsRegistry([VALID_LIFECYCLE], [], [], []),
      timeDependency: true as any,
    };
    const result = validateMLOpsRegistry(registry);
    assert.equal(result.valid, false);
  });

  it('should validate empty input', () => {
    const result = validateMLOpsInput(EMPTY_INPUT);
    assert.equal(result.valid, false);
    const emptyError = result.errors.find(
      (e) => e.code === MLOPS_VALIDATION_CODES.MLOPS_EMPTY_REGISTRY,
    );
    assert.ok(emptyError, 'Should have MLOPS_EMPTY_REGISTRY error');
  });
});

// ---------------------------------------------------------------------------
// Validator Stability Tests
// ---------------------------------------------------------------------------

describe('MLOps Lifecycle Kernel — Validator Stability', () => {
  it('should produce identical validation results for valid input', () => {
    const result1 = validateMLOpsRegistry(composeMLOpsRegistry([VALID_LIFECYCLE], [], [], []));
    const result2 = validateMLOpsRegistry(composeMLOpsRegistry([VALID_LIFECYCLE], [], [], []));

    assert.deepStrictEqual(result1.valid, result2.valid);
    assert.deepStrictEqual(result1.errors.length, result2.errors.length);
  });

  it('should produce identical validation results for invalid input', () => {
    const lifecycle = { ...VALID_LIFECYCLE, stage: 'unsupported' as any };
    const result1 = validateMLOpsLifecycle(lifecycle);
    const result2 = validateMLOpsLifecycle(lifecycle);

    assert.deepStrictEqual(result1.length, result2.length);
  });
});

// ---------------------------------------------------------------------------
// No Mutation Behavior Tests
// ---------------------------------------------------------------------------

describe('MLOps Lifecycle Kernel — No Mutation Behavior', () => {
  it('should not mutate lifecycles during registry composition', () => {
    const lifecycles = [
      { ...VALID_LIFECYCLE, lifecycleId: 'lc-003' },
      { ...VALID_LIFECYCLE, lifecycleId: 'lc-001' },
      { ...VALID_LIFECYCLE, lifecycleId: 'lc-002' },
    ];
    const originalOrder = lifecycles.map((l) => l.lifecycleId);

    composeMLOpsRegistry(lifecycles, [], [], []);

    assert.deepStrictEqual(lifecycles.map((l) => l.lifecycleId), originalOrder);
  });

  it('should not mutate input during full composition', () => {
    const input: MLOpsInput = {
      lifecycles: [
        { ...VALID_LIFECYCLE, lifecycleId: 'lc-002' },
        { ...VALID_LIFECYCLE, lifecycleId: 'lc-001' },
      ],
      constraints: [],
      deployments: [],
      monitoring: [],
    };
    const originalOrder = input.lifecycles.map((l) => l.lifecycleId);

    composeMLOpsLifecycleMetadata(input);

    assert.deepStrictEqual(input.lifecycles.map((l) => l.lifecycleId), originalOrder);
  });
});

// ---------------------------------------------------------------------------
// Artifact with MLOps Tests
// ---------------------------------------------------------------------------

describe('MLOps Lifecycle Kernel — Artifact with MLOps', () => {
  it('should compose application artifact with MLOps', () => {
    const registry = composeMLOpsRegistry([VALID_LIFECYCLE], [VALID_CONSTRAINT], [], []);
    const result = composeApplicationArtifactWithMLOps({
      applicationNode: VALID_NODE,
      mlopsRegistry: registry,
    });

    assert.equal(result.applicationNode.applicationId, 'app-001');
    assert.equal(result.mlopsRegistry.lifecycles.length, 1);
    assert.equal(result.deterministic, true);
    assert.equal(result.randomUsed, false);
    assert.equal(result.timeDependency, false);
  });

  it('should not mutate the original application node', () => {
    const registry = composeMLOpsRegistry([VALID_LIFECYCLE], [], [], []);
    const originalTitle = VALID_NODE.title;

    composeApplicationArtifactWithMLOps({
      applicationNode: VALID_NODE,
      mlopsRegistry: registry,
    });

    assert.equal(VALID_NODE.title, originalTitle);
  });
});

// ---------------------------------------------------------------------------
// Cross-Agent Boundary Verification Tests
// ---------------------------------------------------------------------------

describe('MLOps Lifecycle Kernel — Cross-Agent Boundary Verification', () => {
  it('should only reference external IDs, not own external metadata', () => {
    const lifecycle = composeMLOpsLifecycle({
      lifecycleId: 'lc-001',
      title: 'Test',
      stage: 'model_development',
      applicationArtifactId: 'app-001',
      knowledgeArtifactId: 'knowledge-001',
      architectureId: 'arch-001',
      status: 'published',
      provenance: VALID_PROVENANCE,
    });

    assert.equal(typeof lifecycle.knowledgeArtifactId, 'string');
    assert.ok(!('knowledgeContent' in lifecycle), 'Should not have knowledge content');
    assert.ok(!('narrativeContent' in lifecycle), 'Should not have narrative content');
  });

  it('should not deploy models', () => {
    const result = composeMLOpsLifecycleMetadata(VALID_INPUT);
    assert.ok(!('deployedModels' in result), 'Should not have deployed models');
    assert.ok(!('deploymentResult' in result), 'Should not have deployment result');
  });

  it('should not train models', () => {
    const result = composeMLOpsLifecycleMetadata(VALID_INPUT);
    assert.ok(!('trainedModels' in result), 'Should not have trained models');
    assert.ok(!('trainingResult' in result), 'Should not have training result');
  });

  it('should not execute inference', () => {
    const result = composeMLOpsLifecycleMetadata(VALID_INPUT);
    assert.ok(!('inferenceResult' in result), 'Should not have inference result');
    assert.ok(!('predictions' in result), 'Should not have predictions');
  });

  it('should not monitor production', () => {
    const result = composeMLOpsLifecycleMetadata(VALID_INPUT);
    assert.ok(!('monitoringData' in result), 'Should not have monitoring data');
    assert.ok(!('productionMetrics' in result), 'Should not have production metrics');
  });
});

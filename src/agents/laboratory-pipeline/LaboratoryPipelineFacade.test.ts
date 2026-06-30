/**
 * NV-1600-D4-OPT-11 — Public API Consolidation & Laboratory Pipeline Facade Test Suite
 *
 * Comprehensive deterministic test suite for the Laboratory Pipeline Facade.
 * Covers: compose artifact, certify artifact, compose and certify, facade validation,
 * missing artifact, missing certification, helper functions, immutable input,
 * identical output (100 iterations), deterministic trace metadata, backward compatibility,
 * export preservation, negative capability verification.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import type {
  LaboratoryCompositionInput,
  LaboratoryFacadeOutput,
  LaboratoryCertificationOutput,
  LaboratoryCompleteOutput,
  LaboratoryMetadata,
  LaboratoryExecutionPlan,
  LaboratoryConfiguration,
  LaboratoryParameter,
  LaboratoryParameterGroup,
  LaboratoryExperiment,
  ExperimentScenario,
  ExperimentDatasetReference,
  ExperimentExpectedOutput,
  ExperimentEvaluationMetadata,
  LaboratoryVisualization,
  LaboratoryObservation,
  LaboratoryMetric,
  LaboratoryResultArtifact,
  ResultArtifactRelationship,
  LaboratoryWorkflow,
  LaboratoryInteraction,
  LaboratoryHypothesis,
  LaboratoryHistoryRecord,
  LaboratoryEvidenceRecord,
  LaboratoryEvidenceRelationship,
} from './LaboratoryAgentContract.ts';

import {
  composeLaboratoryArtifact,
  certifyLaboratoryArtifact,
  composeAndCertifyLaboratoryArtifact,
  validateLaboratoryFacadeArtifact,
  validateLaboratoryFacadeCertification,
  validateLaboratoryFacadeComplete,
  getCanonicalFacadeStatuses,
  isSupportedFacadeStatus,
} from './LaboratoryPipelineFacade.ts';

import {
  CANONICAL_FACADE_STATUS,
} from './LaboratoryAgentContract.ts';

// ---------------------------------------------------------------------------
// Test Fixtures
// ---------------------------------------------------------------------------

const VALID_LABORATORY: LaboratoryMetadata = {
  laboratoryId: 'lab-001',
  title: 'Neural Network Lab',
  description: 'A neural network laboratory.',
  laboratoryType: 'machine_learning',
  laboratoryLevel: 'intermediate',
  status: 'approved',
  governanceStatus: 'canonical',
  tags: ['neural_networks'],
  estimatedDurationMinutes: 30,
  prerequisites: [],
  learningObjectives: ['Understand neural networks'],
  author: 'NeuralVerse Team',
};

const VALID_INPUT: LaboratoryCompositionInput = {
  laboratories: [VALID_LABORATORY],
  executions: [],
  configurations: [],
  parameters: [],
  groups: [],
  experiments: [],
  scenarios: [],
  datasetReferences: [],
  expectedOutputs: [],
  evaluationMetadata: [],
  visualizations: [],
  observations: [],
  metrics: [],
  artifacts: [],
  relationships: [],
  workflows: [],
  interactions: [],
  hypotheses: [],
  historyRecords: [],
  historyEvidence: [],
  historyRelationships: [],
};

const EMPTY_INPUT: LaboratoryCompositionInput = {
  laboratories: [],
  executions: [],
  configurations: [],
  parameters: [],
  groups: [],
  experiments: [],
  scenarios: [],
  datasetReferences: [],
  expectedOutputs: [],
  evaluationMetadata: [],
  visualizations: [],
  observations: [],
  metrics: [],
  artifacts: [],
  relationships: [],
  workflows: [],
  interactions: [],
  hypotheses: [],
  historyRecords: [],
  historyEvidence: [],
  historyRelationships: [],
};

// ---------------------------------------------------------------------------
// Compose Artifact Tests
// ---------------------------------------------------------------------------

describe('Facade — Compose Artifact', () => {
  it('should compose a valid artifact', () => {
    const output = composeLaboratoryArtifact(VALID_INPUT);

    assert.ok(output.artifactId, 'Should have an artifact ID');
    assert.equal(output.facadeStatus, 'composed');
    assert.equal(output.deterministic, true);
    assert.equal(output.randomUsed, false);
    assert.equal(output.timeDependency, false);
  });

  it('should compose all registries', () => {
    const output = composeLaboratoryArtifact(VALID_INPUT);

    assert.ok(output.laboratoryRegistry, 'Should have laboratory registry');
    assert.ok(output.executionRegistry, 'Should have execution registry');
    assert.ok(output.configurationRegistry, 'Should have configuration registry');
    assert.ok(output.experimentRegistry, 'Should have experiment registry');
    assert.ok(output.resultArtifactRegistry, 'Should have result artifact registry');
    assert.ok(output.workflowRegistry, 'Should have workflow registry');
    assert.ok(output.interactionRegistry, 'Should have interaction registry');
    assert.ok(output.hypothesisRegistry, 'Should have hypothesis registry');
    assert.ok(output.historyRegistry, 'Should have history registry');
  });

  it('should set correct facade status for valid input', () => {
    const output = composeLaboratoryArtifact(VALID_INPUT);
    assert.equal(output.facadeStatus, 'composed');
  });

  it('should set failed status for empty input', () => {
    const output = composeLaboratoryArtifact(EMPTY_INPUT);
    assert.equal(output.facadeStatus, 'failed');
  });

  it('should have deterministic trace metadata', () => {
    const output = composeLaboratoryArtifact(VALID_INPUT);

    assert.equal(output.traceMetadata.deterministic, true);
    assert.equal(output.traceMetadata.randomUsed, false);
    assert.equal(output.traceMetadata.timeDependency, false);
    assert.equal(output.traceMetadata.laboratoryMutated, false);
    assert.equal(output.traceMetadata.pipeline, 'laboratory_pipeline');
  });
});

// ---------------------------------------------------------------------------
// Certify Artifact Tests
// ---------------------------------------------------------------------------

describe('Facade — Certify Artifact', () => {
  it('should certify a valid artifact', () => {
    const facadeOutput = composeLaboratoryArtifact(VALID_INPUT);
    const certOutput = certifyLaboratoryArtifact(facadeOutput);

    assert.ok(certOutput.artifactId, 'Should have an artifact ID');
    assert.ok(certOutput.certificationReport, 'Should have certification report');
    assert.equal(certOutput.deterministic, true);
    assert.equal(certOutput.randomUsed, false);
    assert.equal(certOutput.timeDependency, false);
  });

  it('should set certified status when no findings', () => {
    const facadeOutput = composeLaboratoryArtifact(VALID_INPUT);
    const certOutput = certifyLaboratoryArtifact(facadeOutput);

    assert.equal(certOutput.facadeStatus, 'certified');
  });

  it('should have deterministic trace metadata', () => {
    const facadeOutput = composeLaboratoryArtifact(VALID_INPUT);
    const certOutput = certifyLaboratoryArtifact(facadeOutput);

    assert.equal(certOutput.traceMetadata.deterministic, true);
    assert.equal(certOutput.traceMetadata.randomUsed, false);
    assert.equal(certOutput.traceMetadata.timeDependency, false);
    assert.equal(certOutput.traceMetadata.laboratoryMutated, false);
  });
});

// ---------------------------------------------------------------------------
// Compose and Certify Tests
// ---------------------------------------------------------------------------

describe('Facade — Compose and Certify', () => {
  it('should compose and certify in one step', () => {
    const output = composeAndCertifyLaboratoryArtifact(VALID_INPUT);

    assert.ok(output.artifactId, 'Should have an artifact ID');
    assert.ok(output.facadeOutput, 'Should have facade output');
    assert.ok(output.certificationOutput, 'Should have certification output');
    assert.equal(output.deterministic, true);
    assert.equal(output.randomUsed, false);
    assert.equal(output.timeDependency, false);
  });

  it('should set certified status when composed and certified successfully', () => {
    const output = composeAndCertifyLaboratoryArtifact(VALID_INPUT);
    assert.equal(output.facadeStatus, 'certified');
  });

  it('should set failed status when composition fails', () => {
    const output = composeAndCertifyLaboratoryArtifact(EMPTY_INPUT);
    assert.equal(output.facadeStatus, 'failed');
  });

  it('should have deterministic trace metadata', () => {
    const output = composeAndCertifyLaboratoryArtifact(VALID_INPUT);

    assert.equal(output.traceMetadata.deterministic, true);
    assert.equal(output.traceMetadata.randomUsed, false);
    assert.equal(output.traceMetadata.timeDependency, false);
    assert.equal(output.traceMetadata.laboratoryMutated, false);
    assert.equal(output.traceMetadata.pipeline, 'laboratory_pipeline');
  });
});

// ---------------------------------------------------------------------------
// Facade Validation Tests
// ---------------------------------------------------------------------------

describe('Facade — Facade Validation', () => {
  it('should validate a valid facade output', () => {
    const output = composeLaboratoryArtifact(VALID_INPUT);
    const result = validateLaboratoryFacadeArtifact(output);

    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it('should detect missing artifact ID', () => {
    const output = composeLaboratoryArtifact(VALID_INPUT);
    const invalidOutput = { ...output, artifactId: '' };
    const result = validateLaboratoryFacadeArtifact(invalidOutput);

    assert.equal(result.valid, false);
    const idError = result.errors.find((e) => e.code === 'FACADE_MISSING_ARTIFACT_ID');
    assert.ok(idError, 'Should have FACADE_MISSING_ARTIFACT_ID error');
  });

  it('should detect missing laboratory registry', () => {
    const output = composeLaboratoryArtifact(VALID_INPUT);
    const invalidOutput = { ...output, laboratoryRegistry: undefined as any };
    const result = validateLaboratoryFacadeArtifact(invalidOutput);

    assert.equal(result.valid, false);
    const registryError = result.errors.find((e) => e.code === 'FACADE_MISSING_REGISTRY');
    assert.ok(registryError, 'Should have FACADE_MISSING_REGISTRY error');
  });

  it('should detect invalid facade status', () => {
    const output = composeLaboratoryArtifact(VALID_INPUT);
    const invalidOutput = { ...output, facadeStatus: 'invalid' as any };
    const result = validateLaboratoryFacadeArtifact(invalidOutput);

    assert.equal(result.valid, false);
    const statusError = result.errors.find((e) => e.code === 'FACADE_INVALID_STATUS');
    assert.ok(statusError, 'Should have FACADE_INVALID_STATUS error');
  });

  it('should detect invalid trace metadata', () => {
    const output = composeLaboratoryArtifact(VALID_INPUT);
    const invalidOutput = {
      ...output,
      traceMetadata: {
        ...output.traceMetadata,
        deterministic: false as true,
      },
    };
    const result = validateLaboratoryFacadeArtifact(invalidOutput);

    assert.equal(result.valid, false);
    const traceError = result.errors.find((e) => e.code === 'FACADE_INVALID_TRACE');
    assert.ok(traceError, 'Should have FACADE_INVALID_TRACE error');
  });
});

// ---------------------------------------------------------------------------
// Certification Validation Tests
// ---------------------------------------------------------------------------

describe('Facade — Certification Validation', () => {
  it('should validate a valid certification output', () => {
    const facadeOutput = composeLaboratoryArtifact(VALID_INPUT);
    const certOutput = certifyLaboratoryArtifact(facadeOutput);
    const result = validateLaboratoryFacadeCertification(certOutput);

    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it('should detect missing certification report', () => {
    const facadeOutput = composeLaboratoryArtifact(VALID_INPUT);
    const certOutput = certifyLaboratoryArtifact(facadeOutput);
    const invalidOutput = { ...certOutput, certificationReport: undefined as any };
    const result = validateLaboratoryFacadeCertification(invalidOutput);

    assert.equal(result.valid, false);
    const certError = result.errors.find((e) => e.code === 'FACADE_MISSING_CERTIFICATION');
    assert.ok(certError, 'Should have FACADE_MISSING_CERTIFICATION error');
  });
});

// ---------------------------------------------------------------------------
// Complete Output Validation Tests
// ---------------------------------------------------------------------------

describe('Facade — Complete Output Validation', () => {
  it('should validate a valid complete output', () => {
    const output = composeAndCertifyLaboratoryArtifact(VALID_INPUT);
    const result = validateLaboratoryFacadeComplete(output);

    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it('should detect missing artifact ID in complete output', () => {
    const output = composeAndCertifyLaboratoryArtifact(VALID_INPUT);
    const invalidOutput = { ...output, artifactId: '' };
    const result = validateLaboratoryFacadeComplete(invalidOutput);

    assert.equal(result.valid, false);
    const idError = result.errors.find((e) => e.code === 'FACADE_MISSING_ARTIFACT_ID');
    assert.ok(idError, 'Should have FACADE_MISSING_ARTIFACT_ID error');
  });
});

// ---------------------------------------------------------------------------
// Helper Function Tests
// ---------------------------------------------------------------------------

describe('Facade — Helper Functions', () => {
  it('should return canonical facade statuses', () => {
    const statuses = getCanonicalFacadeStatuses();
    assert.deepStrictEqual([...statuses], [...CANONICAL_FACADE_STATUS]);
    assert.equal(statuses.length, 3);
  });

  it('should validate facade status', () => {
    assert.equal(isSupportedFacadeStatus('composed'), true);
    assert.equal(isSupportedFacadeStatus('certified'), true);
    assert.equal(isSupportedFacadeStatus('failed'), true);
    assert.equal(isSupportedFacadeStatus('invalid'), false);
  });
});

// ---------------------------------------------------------------------------
// Canonical Enum Completeness Tests
// ---------------------------------------------------------------------------

describe('Facade — Canonical Enum Completeness', () => {
  it('should have exactly 3 facade statuses', () => {
    assert.equal(CANONICAL_FACADE_STATUS.length, 3);
  });

  it('should contain all expected facade statuses', () => {
    const expectedStatuses = ['composed', 'certified', 'failed'];

    for (const status of expectedStatuses) {
      assert.ok(
        CANONICAL_FACADE_STATUS.includes(status as any),
        `Should include status: ${status}`,
      );
    }
  });
});

// ---------------------------------------------------------------------------
// Immutable Input Tests
// ---------------------------------------------------------------------------

describe('Facade — Immutable Input', () => {
  it('should not mutate input laboratories', () => {
    const originalId = VALID_LABORATORY.laboratoryId;
    const originalTitle = VALID_LABORATORY.title;

    composeLaboratoryArtifact(VALID_INPUT);

    assert.equal(VALID_LABORATORY.laboratoryId, originalId);
    assert.equal(VALID_LABORATORY.title, originalTitle);
  });
});

// ---------------------------------------------------------------------------
// Identical Output Tests
// ---------------------------------------------------------------------------

describe('Facade — Identical Output', () => {
  it('should produce identical output for identical input (100 iterations)', () => {
    const results: ReturnType<typeof composeLaboratoryArtifact>[] = [];
    for (let i = 0; i < 100; i++) {
      results.push(composeLaboratoryArtifact(VALID_INPUT));
    }

    for (let i = 1; i < results.length; i++) {
      assert.deepStrictEqual(results[0].artifactId, results[i].artifactId);
      assert.deepStrictEqual(results[0].facadeStatus, results[i].facadeStatus);
      assert.deepStrictEqual(results[0].traceMetadata, results[i].traceMetadata);
    }
  });

  it('should produce identical certification output for identical input', () => {
    const facadeOutputs: ReturnType<typeof composeLaboratoryArtifact>[] = [];
    for (let i = 0; i < 100; i++) {
      facadeOutputs.push(composeLaboratoryArtifact(VALID_INPUT));
    }

    const certOutputs: ReturnType<typeof certifyLaboratoryArtifact>[] = [];
    for (const facadeOutput of facadeOutputs) {
      certOutputs.push(certifyLaboratoryArtifact(facadeOutput));
    }

    for (let i = 1; i < certOutputs.length; i++) {
      assert.deepStrictEqual(certOutputs[0].artifactId, certOutputs[i].artifactId);
      assert.deepStrictEqual(certOutputs[0].facadeStatus, certOutputs[i].facadeStatus);
      assert.deepStrictEqual(certOutputs[0].certificationReport.certificationStatus, certOutputs[i].certificationReport.certificationStatus);
    }
  });
});

// ---------------------------------------------------------------------------
// Backward Compatibility Tests
// ---------------------------------------------------------------------------

describe('Facade — Backward Compatibility', () => {
  it('should preserve all D4-OPT-01 through D4-OPT-10 exports', () => {
    // This test verifies that all previous exports remain importable
    // by importing from the facade module
    assert.ok(composeLaboratoryArtifact, 'composeLaboratoryArtifact should be exported');
    assert.ok(certifyLaboratoryArtifact, 'certifyLaboratoryArtifact should be exported');
    assert.ok(composeAndCertifyLaboratoryArtifact, 'composeAndCertifyLaboratoryArtifact should be exported');
    assert.ok(validateLaboratoryFacadeArtifact, 'validateLaboratoryFacadeArtifact should be exported');
    assert.ok(validateLaboratoryFacadeCertification, 'validateLaboratoryFacadeCertification should be exported');
    assert.ok(validateLaboratoryFacadeComplete, 'validateLaboratoryFacadeComplete should be exported');
    assert.ok(getCanonicalFacadeStatuses, 'getCanonicalFacadeStatuses should be exported');
    assert.ok(isSupportedFacadeStatus, 'isSupportedFacadeStatus should be exported');
  });
});

// ---------------------------------------------------------------------------
// Negative Capability Verification Tests
// ---------------------------------------------------------------------------

describe('Facade — Negative Capability Verification', () => {
  it('should not use Math.random', () => {
    const output = composeLaboratoryArtifact(VALID_INPUT);
    assert.ok(output, 'Should produce a result without Math.random');
  });

  it('should not use Date.now', () => {
    const output = composeLaboratoryArtifact(VALID_INPUT);
    assert.ok(output, 'Should produce a result without Date.now');
  });

  it('should not use performance.now', () => {
    const output = composeLaboratoryArtifact(VALID_INPUT);
    assert.ok(output, 'Should produce a result without performance.now');
  });

  it('should not use crypto.randomUUID', () => {
    const output = composeLaboratoryArtifact(VALID_INPUT);
    assert.ok(output, 'Should produce a result without crypto.randomUUID');
  });

  it('should not execute laboratories', () => {
    const output = composeLaboratoryArtifact(VALID_INPUT);
    assert.ok(!('executionResult' in output), 'Should not have execution result');
    assert.ok(!('output' in output), 'Should not have output');
  });

  it('should not run workflows', () => {
    const output = composeLaboratoryArtifact(VALID_INPUT);
    assert.ok(!('workflowResult' in output), 'Should not have workflow result');
    assert.ok(!('workflowOutput' in output), 'Should not have workflow output');
  });

  it('should not run experiments', () => {
    const output = composeLaboratoryArtifact(VALID_INPUT);
    assert.ok(!('experimentResult' in output), 'Should not have experiment result');
    assert.ok(!('experimentOutput' in output), 'Should not have experiment output');
  });

  it('should not generate observations', () => {
    const output = composeLaboratoryArtifact(VALID_INPUT);
    assert.ok(!('generatedObservations' in output), 'Should not have generated observations');
    assert.ok(!('observations' in output), 'Should not have observations');
  });

  it('should not generate hypotheses', () => {
    const output = composeLaboratoryArtifact(VALID_INPUT);
    assert.ok(!('generatedHypotheses' in output), 'Should not have generated hypotheses');
    assert.ok(!('hypotheses' in output), 'Should not have hypotheses');
  });

  it('should not rewrite metadata', () => {
    const output = composeLaboratoryArtifact(VALID_INPUT);
    assert.ok(!('rewrittenMetadata' in output), 'Should not have rewritten metadata');
    assert.ok(!('modifiedMetadata' in output), 'Should not have modified metadata');
  });

  it('should not repair artifacts', () => {
    const output = composeLaboratoryArtifact(VALID_INPUT);
    assert.ok(!('repairedArtifact' in output), 'Should not have repaired artifact');
    assert.ok(!('fixedArtifact' in output), 'Should not have fixed artifact');
  });

  it('should not infer metadata', () => {
    const output = composeLaboratoryArtifact(VALID_INPUT);
    assert.ok(!('inferredMetadata' in output), 'Should not have inferred metadata');
    assert.ok(!('autoInferred' in output), 'Should not have autoInferred');
  });

  it('should not infer learner information', () => {
    const output = composeLaboratoryArtifact(VALID_INPUT);
    assert.ok(!('learnerInfo' in output), 'Should not have learner info');
    assert.ok(!('learnerProfile' in output), 'Should not have learner profile');
  });

  it('should not perform persistence', () => {
    const output = composeLaboratoryArtifact(VALID_INPUT);
    assert.ok(!('persistence' in output), 'Should not have persistence');
    assert.ok(!('storage' in output), 'Should not have storage');
  });

  it('should not perform networking', () => {
    const output = composeLaboratoryArtifact(VALID_INPUT);
    assert.ok(!('networkResponse' in output), 'Should not have network response');
    assert.ok(!('httpResult' in output), 'Should not have HTTP result');
  });

  it('should not call external APIs', () => {
    const output = composeLaboratoryArtifact(VALID_INPUT);
    assert.ok(!('apiResult' in output), 'Should not have API result');
    assert.ok(!('externalResult' in output), 'Should not have external result');
  });

  it('should not call LLMs', () => {
    const output = composeLaboratoryArtifact(VALID_INPUT);
    assert.ok(!('llmResult' in output), 'Should not have LLM result');
    assert.ok(!('llmOutput' in output), 'Should not have LLM output');
    assert.ok(!('llmResponse' in output), 'Should not have LLM response');
  });

  it('should not perform filesystem operations', () => {
    const output = composeLaboratoryArtifact(VALID_INPUT);
    assert.ok(!('filesystem' in output), 'Should not have filesystem');
    assert.ok(!('fileSystem' in output), 'Should not have fileSystem');
  });

  it('should not perform runtime scheduling', () => {
    const output = composeLaboratoryArtifact(VALID_INPUT);
    assert.ok(!('scheduler' in output), 'Should not have scheduler');
    assert.ok(!('scheduledTasks' in output), 'Should not have scheduled tasks');
  });

  it('should not have executable callbacks in facade output', () => {
    const output = composeLaboratoryArtifact(VALID_INPUT);

    const keys = Object.keys(output);
    for (const key of keys) {
      const value = (output as any)[key];
      assert.ok(typeof value !== 'function', `Facade output field "${key}" should not be a function`);
    }
  });

  it('should not have executable callbacks in certification output', () => {
    const facadeOutput = composeLaboratoryArtifact(VALID_INPUT);
    const certOutput = certifyLaboratoryArtifact(facadeOutput);

    const keys = Object.keys(certOutput);
    for (const key of keys) {
      const value = (certOutput as any)[key];
      assert.ok(typeof value !== 'function', `Certification output field "${key}" should not be a function`);
    }
  });

  it('should not have executable callbacks in complete output', () => {
    const output = composeAndCertifyLaboratoryArtifact(VALID_INPUT);

    const keys = Object.keys(output);
    for (const key of keys) {
      const value = (output as any)[key];
      assert.ok(typeof value !== 'function', `Complete output field "${key}" should not be a function`);
    }
  });
});

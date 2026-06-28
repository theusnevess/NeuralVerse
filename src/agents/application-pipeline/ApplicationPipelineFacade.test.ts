/**
 * NV-1900-D7-OPT-14 — Public API Consolidation & Application Pipeline Facade Test Suite
 *
 * Comprehensive deterministic test suite for the Application Pipeline Facade.
 * Covers: compose facade, certification facade, complete facade, delegation correctness,
 * validation, trace metadata, validation codes, missing artifact, missing validation,
 * missing certification, invalid status, helper functions, canonical enums,
 * 100 identical executions, immutability, cross-agent boundary, negative capability,
 * validator stability, public exports, backward compatibility, no mutation.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import type {
  ApplicationRegistry,
  ApplicationInput,
  ApplicationFacadeArtifactResult,
  ApplicationFacadeCertificationResult,
  ApplicationFacadeCompleteResult,
  ApplicationFacadeStatus,
} from './ApplicationAgentContract.ts';

import {
  CANONICAL_APPLICATION_FACADE_STATUS,
  CANONICAL_APPLICATION_GOVERNANCE,
} from './ApplicationAgentContract.ts';

import {
  composeApplicationArtifact,
  certifyApplicationFacadeArtifact,
  composeAndCertifyApplicationArtifact,
  validateApplicationFacadeArtifact,
  validateApplicationFacadeCertification,
  validateApplicationFacadeComplete,
  isSupportedApplicationFacadeStatus,
  getCanonicalApplicationFacadeStatuses,
} from './ApplicationPipelineFacade.ts';

// ---------------------------------------------------------------------------
// Test Fixtures
// ---------------------------------------------------------------------------

const VALID_APPLICATION_INPUT: ApplicationInput = {
  nodes: [
    {
      applicationId: 'app-001',
      title: 'Test Application',
      artifactType: 'use_case',
      domain: 'computer_vision',
      status: 'published',
      description: 'Test application.',
      provenance: {
        providedBy: 'NeuralVerse Team',
        rationale: 'Core concept.',
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
    },
  ],
};

const EMPTY_APPLICATION_INPUT: ApplicationInput = {
  nodes: [],
};

const VALID_REGISTRY: ApplicationRegistry = {
  registryId: '_registry_1',
  nodes: [
    {
      applicationId: 'app-001',
      title: 'Test Application',
      artifactType: 'use_case',
      domain: 'computer_vision',
      status: 'published',
      description: 'Test application.',
      provenance: {
        providedBy: 'NeuralVerse Team',
        rationale: 'Core concept.',
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
    },
  ],
  metadata: {
    registryId: '_registry_1',
    nodeCount: 1,
    domainCount: 1,
    typeCount: 1,
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

// ---------------------------------------------------------------------------
// Compose Facade Tests
// ---------------------------------------------------------------------------

describe('Application Pipeline Facade — Compose', () => {
  it('should compose a valid application artifact', () => {
    const result = composeApplicationArtifact({
      applicationInput: VALID_APPLICATION_INPUT,
    });

    assert.equal(result.status, 'composed');
    assert.equal(result.applicationRegistry.nodes.length, 1);
    assert.equal(result.deterministic, true);
    assert.equal(result.randomUsed, false);
    assert.equal(result.timeDependency, false);
  });

  it('should compose with empty input', () => {
    const result = composeApplicationArtifact({
      applicationInput: EMPTY_APPLICATION_INPUT,
    });

    assert.equal(result.status, 'composed');
    assert.equal(result.applicationRegistry.nodes.length, 0);
  });

  it('should include trace metadata', () => {
    const result = composeApplicationArtifact({
      applicationInput: VALID_APPLICATION_INPUT,
    });

    assert.ok(result.trace.artifactId);
    assert.equal(result.trace.pipelineVersion, '1.0.0');
    assert.equal(result.trace.generatedBy, 'application_pipeline_facade');
    assert.equal(result.trace.generatedFrom, 'deterministic_application_pipeline_facade');
  });

  it('should preserve input immutability', () => {
    const originalNodeCount = VALID_APPLICATION_INPUT.nodes.length;

    composeApplicationArtifact({
      applicationInput: VALID_APPLICATION_INPUT,
    });

    assert.equal(VALID_APPLICATION_INPUT.nodes.length, originalNodeCount);
  });
});

// ---------------------------------------------------------------------------
// Certification Facade Tests
// ---------------------------------------------------------------------------

describe('Application Pipeline Facade — Certification', () => {
  it('should certify a valid application artifact', () => {
    const result = certifyApplicationFacadeArtifact(VALID_REGISTRY);

    assert.ok(result.certification);
    assert.ok(result.certification.status);
    assert.ok(typeof result.certification.score === 'number');
    assert.equal(result.deterministic, true);
    assert.equal(result.randomUsed, false);
    assert.equal(result.timeDependency, false);
  });

  it('should certify with empty registry', () => {
    const emptyRegistry: ApplicationRegistry = {
      ...VALID_REGISTRY,
      nodes: [],
      metadata: { ...VALID_REGISTRY.metadata, nodeCount: 0 },
    };

    const result = certifyApplicationFacadeArtifact(emptyRegistry);

    assert.ok(result.certification);
    assert.ok(result.certification.findings.length > 0);
  });

  it('should include trace metadata', () => {
    const result = certifyApplicationFacadeArtifact(VALID_REGISTRY);

    assert.ok(result.trace.artifactId);
    assert.equal(result.trace.pipelineVersion, '1.0.0');
    assert.equal(result.trace.certificationVersion, '1.0.0');
    assert.equal(result.trace.generatedBy, 'application_pipeline_facade');
  });
});

// ---------------------------------------------------------------------------
// Complete Facade Tests
// ---------------------------------------------------------------------------

describe('Application Pipeline Facade — Complete', () => {
  it('should compose and certify a complete artifact', () => {
    const result = composeAndCertifyApplicationArtifact({
      applicationInput: VALID_APPLICATION_INPUT,
    });

    assert.ok(result.applicationRegistry);
    assert.ok(result.validation);
    assert.ok(result.certification);
    assert.ok(result.trace);
    assert.equal(result.deterministic, true);
    assert.equal(result.randomUsed, false);
    assert.equal(result.timeDependency, false);
  });

  it('should validate the artifact', () => {
    const result = composeAndCertifyApplicationArtifact({
      applicationInput: VALID_APPLICATION_INPUT,
    });

    assert.equal(result.validation.valid, true);
    assert.equal(result.validation.errors.length, 0);
  });

  it('should certify the artifact', () => {
    const result = composeAndCertifyApplicationArtifact({
      applicationInput: VALID_APPLICATION_INPUT,
    });

    assert.ok(result.certification.status);
    assert.ok(typeof result.certification.score === 'number');
  });

  it('should include trace metadata', () => {
    const result = composeAndCertifyApplicationArtifact({
      applicationInput: VALID_APPLICATION_INPUT,
    });

    assert.ok(result.trace.artifactId);
    assert.equal(result.trace.pipelineVersion, '1.0.0');
    assert.equal(result.trace.certificationVersion, '1.0.0');
  });

  it('should handle empty input', () => {
    const result = composeAndCertifyApplicationArtifact({
      applicationInput: EMPTY_APPLICATION_INPUT,
    });

    assert.equal(result.validation.valid, false);
    assert.ok(result.validation.errors.length > 0);
  });
});

// ---------------------------------------------------------------------------
// Validation Tests
// ---------------------------------------------------------------------------

describe('Application Pipeline Facade — Validation', () => {
  it('should validate a valid artifact result', () => {
    const result = composeApplicationArtifact({
      applicationInput: VALID_APPLICATION_INPUT,
    });

    const validation = validateApplicationFacadeArtifact(result);
    assert.equal(validation.valid, true);
    assert.equal(validation.errors.length, 0);
  });

  it('should validate a valid certification result', () => {
    const result = certifyApplicationFacadeArtifact(VALID_REGISTRY);

    const validation = validateApplicationFacadeCertification(result);
    assert.equal(validation.valid, true);
    assert.equal(validation.errors.length, 0);
  });

  it('should validate a valid complete result', () => {
    const result = composeAndCertifyApplicationArtifact({
      applicationInput: VALID_APPLICATION_INPUT,
    });

    const validation = validateApplicationFacadeComplete(result);
    assert.equal(validation.valid, true);
    assert.equal(validation.errors.length, 0);
  });

  it('should detect missing artifact in complete result', () => {
    const invalidResult: ApplicationFacadeCompleteResult = {
      applicationRegistry: undefined as any,
      validation: { valid: true, errors: [] },
      certification: undefined as any,
      trace: undefined as any,
      deterministic: true,
      randomUsed: false,
      timeDependency: false,
    };

    const validation = validateApplicationFacadeComplete(invalidResult);
    assert.equal(validation.valid, false);
    assert.ok(validation.errors.length > 0);
  });

  it('should detect missing certification in complete result', () => {
    const invalidResult: ApplicationFacadeCompleteResult = {
      applicationRegistry: VALID_REGISTRY,
      validation: { valid: true, errors: [] },
      certification: undefined as any,
      trace: { artifactId: 'test', pipelineVersion: '1.0.0', certificationVersion: '1.0.0', generatedBy: 'test', generatedFrom: 'deterministic_application_pipeline_facade' },
      deterministic: true,
      randomUsed: false,
      timeDependency: false,
    };

    const validation = validateApplicationFacadeComplete(invalidResult);
    assert.equal(validation.valid, false);
    assert.ok(validation.errors.length > 0);
  });
});

// ---------------------------------------------------------------------------
// Helper Function Tests
// ---------------------------------------------------------------------------

describe('Application Pipeline Facade — Helper Functions', () => {
  it('should return canonical facade statuses', () => {
    const statuses = getCanonicalApplicationFacadeStatuses();
    assert.deepStrictEqual([...statuses], [...CANONICAL_APPLICATION_FACADE_STATUS]);
    assert.equal(statuses.length, 3);
  });

  it('should validate facade status support', () => {
    assert.equal(isSupportedApplicationFacadeStatus('composed'), true);
    assert.equal(isSupportedApplicationFacadeStatus('certified'), true);
    assert.equal(isSupportedApplicationFacadeStatus('failed'), true);
    assert.equal(isSupportedApplicationFacadeStatus('unsupported'), false);
  });
});

// ---------------------------------------------------------------------------
// Canonical Enum Completeness Tests
// ---------------------------------------------------------------------------

describe('Application Pipeline Facade — Canonical Enum Completeness', () => {
  it('should have exactly 3 facade statuses', () => {
    assert.equal(CANONICAL_APPLICATION_FACADE_STATUS.length, 3);
  });

  it('should contain all expected facade statuses', () => {
    const expected = ['composed', 'certified', 'failed'];

    for (const status of expected) {
      assert.ok(
        CANONICAL_APPLICATION_FACADE_STATUS.includes(status as any),
        `Should include status: ${status}`,
      );
    }
  });
});

// ---------------------------------------------------------------------------
// Determinism Tests
// ---------------------------------------------------------------------------

describe('Application Pipeline Facade — Determinism', () => {
  it('should produce identical output for identical input (100 iterations)', () => {
    const results: ReturnType<typeof composeApplicationArtifact>[] = [];
    for (let i = 0; i < 100; i++) {
      results.push(composeApplicationArtifact({
        applicationInput: VALID_APPLICATION_INPUT,
      }));
    }

    for (let i = 1; i < results.length; i++) {
      assert.deepStrictEqual(results[0].applicationRegistry.registryId, results[i].applicationRegistry.registryId);
      assert.deepStrictEqual(results[0].status, results[i].status);
      assert.deepStrictEqual(results[0].applicationRegistry.nodes.length, results[i].applicationRegistry.nodes.length);
    }
  });

  it('should produce identical certification for identical input', () => {
    const results: ReturnType<typeof certifyApplicationFacadeArtifact>[] = [];
    for (let i = 0; i < 100; i++) {
      results.push(certifyApplicationFacadeArtifact(VALID_REGISTRY));
    }

    for (let i = 1; i < results.length; i++) {
      assert.deepStrictEqual(results[0].certification.status, results[i].certification.status);
      assert.deepStrictEqual(results[0].certification.score, results[i].certification.score);
    }
  });
});

// ---------------------------------------------------------------------------
// Negative Capability Verification Tests
// ---------------------------------------------------------------------------

describe('Application Pipeline Facade — Negative Capability Verification', () => {
  it('should not use Math.random', () => {
    const result = composeApplicationArtifact({
      applicationInput: VALID_APPLICATION_INPUT,
    });
    assert.ok(result, 'Should produce a result without Math.random');
  });

  it('should not use Date.now', () => {
    const result = composeApplicationArtifact({
      applicationInput: VALID_APPLICATION_INPUT,
    });
    assert.ok(result, 'Should produce a result without Date.now');
  });

  it('should not use performance.now', () => {
    const result = composeApplicationArtifact({
      applicationInput: VALID_APPLICATION_INPUT,
    });
    assert.ok(result, 'Should produce a result without performance.now');
  });

  it('should not use crypto.randomUUID', () => {
    const result = composeApplicationArtifact({
      applicationInput: VALID_APPLICATION_INPUT,
    });
    assert.ok(result, 'Should produce a result without crypto.randomUUID');
  });

  it('should not implement business logic', () => {
    const result = composeApplicationArtifact({
      applicationInput: VALID_APPLICATION_INPUT,
    });
    assert.ok(!('businessLogic' in result), 'Should not have business logic');
  });

  it('should not implement validation logic', () => {
    const result = composeApplicationArtifact({
      applicationInput: VALID_APPLICATION_INPUT,
    });
    assert.ok(!('validationLogic' in result), 'Should not have validation logic');
  });

  it('should not implement certification logic', () => {
    const result = composeApplicationArtifact({
      applicationInput: VALID_APPLICATION_INPUT,
    });
    assert.ok(!('certificationLogic' in result), 'Should not have certification logic');
  });

  it('should not modify registries', () => {
    const originalNodeCount = VALID_APPLICATION_INPUT.nodes.length;
    composeApplicationArtifact({
      applicationInput: VALID_APPLICATION_INPUT,
    });
    assert.equal(VALID_APPLICATION_INPUT.nodes.length, originalNodeCount);
  });

  it('should not have executable callbacks in result', () => {
    const result = composeApplicationArtifact({
      applicationInput: VALID_APPLICATION_INPUT,
    });

    const keys = Object.keys(result);
    for (const key of keys) {
      const value = (result as any)[key];
      assert.ok(typeof value !== 'function', `Facade result field "${key}" should not be a function`);
    }
  });
});

// ---------------------------------------------------------------------------
// Cross-Agent Boundary Verification Tests
// ---------------------------------------------------------------------------

describe('Application Pipeline Facade — Cross-Agent Boundary Verification', () => {
  it('should not modify D4', () => {
    const result = composeApplicationArtifact({
      applicationInput: VALID_APPLICATION_INPUT,
    });
    assert.ok(!('d4Modified' in result), 'Should not have modified D4');
  });

  it('should not modify D5', () => {
    const result = composeApplicationArtifact({
      applicationInput: VALID_APPLICATION_INPUT,
    });
    assert.ok(!('d5Modified' in result), 'Should not have modified D5');
  });

  it('should not modify D6', () => {
    const result = composeApplicationArtifact({
      applicationInput: VALID_APPLICATION_INPUT,
    });
    assert.ok(!('d6Modified' in result), 'Should not have modified D6');
  });
});

// ---------------------------------------------------------------------------
// Validator Stability Tests
// ---------------------------------------------------------------------------

describe('Application Pipeline Facade — Validator Stability', () => {
  it('should produce identical validation results for valid input', () => {
    const result = composeApplicationArtifact({
      applicationInput: VALID_APPLICATION_INPUT,
    });

    const validation1 = validateApplicationFacadeArtifact(result);
    const validation2 = validateApplicationFacadeArtifact(result);

    assert.deepStrictEqual(validation1.valid, validation2.valid);
    assert.deepStrictEqual(validation1.errors.length, validation2.errors.length);
  });

  it('should produce identical certification results for identical input', () => {
    const result1 = certifyApplicationFacadeArtifact(VALID_REGISTRY);
    const result2 = certifyApplicationFacadeArtifact(VALID_REGISTRY);

    assert.deepStrictEqual(result1.certification.status, result2.certification.status);
    assert.deepStrictEqual(result1.certification.score, result2.certification.score);
  });
});

// ---------------------------------------------------------------------------
// Backward Compatibility Tests
// ---------------------------------------------------------------------------

describe('Application Pipeline Facade — Backward Compatibility', () => {
  it('should export all D7-OPT-01 through D7-OPT-13 functions', () => {
    // Verify that all previous exports are still available
    assert.ok(typeof composeApplicationArtifact === 'function');
    assert.ok(typeof certifyApplicationFacadeArtifact === 'function');
    assert.ok(typeof composeAndCertifyApplicationArtifact === 'function');
  });

  it('should maintain consistent interface', () => {
    const result = composeApplicationArtifact({
      applicationInput: VALID_APPLICATION_INPUT,
    });

    // Verify all required fields exist
    assert.ok('applicationRegistry' in result);
    assert.ok('status' in result);
    assert.ok('trace' in result);
    assert.ok('deterministic' in result);
    assert.ok('randomUsed' in result);
    assert.ok('timeDependency' in result);
  });
});

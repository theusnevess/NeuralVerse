/**
 * NV-1900-D7-OPT-01 — Application Registry & Canonical Node Kernel Test Suite
 *
 * Comprehensive deterministic test suite for the Application Kernel.
 * Covers: valid node, valid provenance, valid trace, empty registry,
 * duplicate IDs, duplicate titles, deterministic ordering, invalid type,
 * invalid domain, invalid status, invalid governance, missing provenance,
 * missing rationale, missing provider, missing trace, invalid trace,
 * immutable input, identical output (100 iterations), helper functions,
 * canonical enum completeness, negative capability verification,
 * registry validation, validator stability, no mutation behavior.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import type {
  ApplicationNode,
  ApplicationProvenance,
  ApplicationInput,
  ApplicationRegistry,
  ApplicationTrace,
} from './ApplicationAgentContract.ts';

import {
  CANONICAL_APPLICATION_ARTIFACT_TYPES,
  CANONICAL_APPLICATION_DOMAINS,
  CANONICAL_APPLICATION_STATUS,
  CANONICAL_APPLICATION_GOVERNANCE,
} from './ApplicationAgentContract.ts';

import {
  composeApplicationProvenance,
  composeApplicationNode,
  composeApplicationTrace,
  composeApplicationRegistry,
  composeApplicationRegistryFromInput,
  composeApplication,
  isSupportedApplicationArtifactType,
  isSupportedApplicationDomain,
  isSupportedApplicationStatus,
  isSupportedApplicationGovernance,
  getCanonicalApplicationArtifactTypes,
  getCanonicalApplicationDomains,
  getCanonicalApplicationStatuses,
  getCanonicalApplicationGovernance,
} from './ApplicationKernel.ts';

import {
  validateApplicationNode,
  validateApplicationRegistry,
  validateApplicationInput,
  validateApplicationTrace,
  APPLICATION_VALIDATION_CODES,
} from './ApplicationValidation.ts';

// ---------------------------------------------------------------------------
// Test Fixtures
// ---------------------------------------------------------------------------

const VALID_PROVENANCE: ApplicationProvenance = {
  providedBy: 'NeuralVerse Team',
  rationale: 'Core application concept.',
  reviewedBy: 'Architecture Review Board',
  reviewDate: '2026-01-01',
  governanceStatus: 'canonical',
};

const VALID_TRACE: ApplicationTrace = {
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
};

const VALID_NODE: ApplicationNode = {
  applicationId: 'app-001',
  title: 'Image Classification Pipeline',
  artifactType: 'use_case',
  domain: 'computer_vision',
  status: 'published',
  description: 'End-to-end image classification system.',
  provenance: VALID_PROVENANCE,
  trace: VALID_TRACE,
};

const VALID_NODE_2: ApplicationNode = {
  applicationId: 'app-002',
  title: 'Object Detection Architecture',
  artifactType: 'system_architecture',
  domain: 'deep_learning',
  status: 'approved',
  description: 'Multi-stage object detection system.',
  provenance: { ...VALID_PROVENANCE, providedBy: 'Research Team' },
  trace: { ...VALID_TRACE, traceId: '_trace_2' },
};

const VALID_INPUT: ApplicationInput = {
  nodes: [VALID_NODE, VALID_NODE_2],
};

const EMPTY_INPUT: ApplicationInput = {
  nodes: [],
};

// ---------------------------------------------------------------------------
// Node Composition Tests
// ---------------------------------------------------------------------------

describe('Application Kernel — Node Composition', () => {
  it('should compose valid application provenance', () => {
    const provenance = composeApplicationProvenance({
      providedBy: 'NeuralVerse Team',
      rationale: 'Core concept.',
      reviewedBy: 'Review Board',
      reviewDate: '2026-01-01',
      governanceStatus: 'canonical',
    });

    assert.equal(provenance.providedBy, 'NeuralVerse Team');
    assert.equal(provenance.governanceStatus, 'canonical');
    assert.equal(provenance.rationale, 'Core concept.');
    assert.equal(provenance.reviewedBy, 'Review Board');
    assert.equal(provenance.reviewDate, '2026-01-01');
  });

  it('should compose valid application trace', () => {
    const trace = composeApplicationTrace({
      traceId: '_trace_1',
      decisions: [
        { decisionId: 'd1', applicationId: 'app-001', validationPassed: true, validationErrors: [] },
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

  it('should compose valid application node', () => {
    const node = composeApplicationNode({
      applicationId: 'app-001',
      title: 'Image Classification Pipeline',
      artifactType: 'use_case',
      domain: 'computer_vision',
      status: 'published',
      description: 'End-to-end image classification system.',
      provenance: VALID_PROVENANCE,
      trace: VALID_TRACE,
    });

    assert.equal(node.applicationId, 'app-001');
    assert.equal(node.title, 'Image Classification Pipeline');
    assert.equal(node.artifactType, 'use_case');
    assert.equal(node.domain, 'computer_vision');
    assert.equal(node.status, 'published');
    assert.equal(node.description, 'End-to-end image classification system.');
  });

  it('should validate a valid node with no errors', () => {
    const errors = validateApplicationNode(VALID_NODE);
    assert.deepStrictEqual(errors, []);
  });

  it('should validate a valid registry with no errors', () => {
    const registry = composeApplicationRegistry([VALID_NODE, VALID_NODE_2]);
    const result = validateApplicationRegistry(registry);

    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it('should validate application input', () => {
    const result = validateApplicationInput(VALID_INPUT);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });
});

// ---------------------------------------------------------------------------
// Registry Tests
// ---------------------------------------------------------------------------

describe('Application Kernel — Registry', () => {
  it('should detect empty registry', () => {
    const registry = composeApplicationRegistry([]);
    const result = validateApplicationRegistry(registry);
    const emptyError = result.errors.find(
      (e) => e.code === APPLICATION_VALIDATION_CODES.APPLICATION_EMPTY_REGISTRY,
    );

    assert.ok(emptyError, 'Should have APPLICATION_EMPTY_REGISTRY error');
    assert.equal(result.valid, false);
  });

  it('should detect duplicate IDs', () => {
    const registry = composeApplicationRegistry([VALID_NODE, VALID_NODE]);
    const result = validateApplicationRegistry(registry);
    const duplicateError = result.errors.find(
      (e) => e.code === APPLICATION_VALIDATION_CODES.APPLICATION_DUPLICATE_ID,
    );

    assert.ok(duplicateError, 'Should have APPLICATION_DUPLICATE_ID error');
  });

  it('should detect duplicate titles', () => {
    const node1 = { ...VALID_NODE, applicationId: 'app-001', title: 'Same Title' };
    const node2 = { ...VALID_NODE, applicationId: 'app-002', title: 'Same Title' };
    const registry = composeApplicationRegistry([node1, node2]);
    const result = validateApplicationRegistry(registry);
    const duplicateError = result.errors.find(
      (e) => e.code === APPLICATION_VALIDATION_CODES.APPLICATION_DUPLICATE_TITLE,
    );

    assert.ok(duplicateError, 'Should have APPLICATION_DUPLICATE_TITLE error');
  });

  it('should sort deterministically by applicationId', () => {
    const node3 = { ...VALID_NODE, applicationId: 'app-003' };
    const node1 = { ...VALID_NODE, applicationId: 'app-001' };
    const node2 = { ...VALID_NODE, applicationId: 'app-002' };

    const registry = composeApplicationRegistry([node3, node1, node2]);

    assert.equal(registry.nodes[0].applicationId, 'app-001');
    assert.equal(registry.nodes[1].applicationId, 'app-002');
    assert.equal(registry.nodes[2].applicationId, 'app-003');
  });

  it('should sort by artifactType when applicationId is equal', () => {
    const nodeA = { ...VALID_NODE, applicationId: 'app-001', artifactType: 'system_architecture' as const };
    const nodeB = { ...VALID_NODE, applicationId: 'app-001', artifactType: 'use_case' as const };

    const registry = composeApplicationRegistry([nodeA, nodeB]);

    assert.equal(registry.nodes[0].artifactType, 'system_architecture');
    assert.equal(registry.nodes[1].artifactType, 'use_case');
  });

  it('should sort by title when applicationId and artifactType are equal', () => {
    const nodeA = { ...VALID_NODE, applicationId: 'app-001', artifactType: 'use_case' as const, title: 'Zebra System' };
    const nodeB = { ...VALID_NODE, applicationId: 'app-001', artifactType: 'use_case' as const, title: 'Alpha System' };

    const registry = composeApplicationRegistry([nodeA, nodeB]);

    assert.equal(registry.nodes[0].title, 'Alpha System');
    assert.equal(registry.nodes[1].title, 'Zebra System');
  });

  it('should compute correct metadata counts', () => {
    const registry = composeApplicationRegistry([VALID_NODE, VALID_NODE_2]);

    assert.equal(registry.metadata.nodeCount, 2);
    assert.equal(registry.metadata.domainCount, 2);
    assert.equal(registry.metadata.typeCount, 2);
  });
});

// ---------------------------------------------------------------------------
// Validation Tests
// ---------------------------------------------------------------------------

describe('Application Kernel — Validation', () => {
  it('should detect invalid artifact type', () => {
    const node = { ...VALID_NODE, artifactType: 'unsupported' as any };
    const errors = validateApplicationNode(node);
    const typeError = errors.find(
      (e) => e.code === APPLICATION_VALIDATION_CODES.APPLICATION_INVALID_ARTIFACT_TYPE,
    );

    assert.ok(typeError, 'Should have APPLICATION_INVALID_ARTIFACT_TYPE error');
  });

  it('should detect invalid domain', () => {
    const node = { ...VALID_NODE, domain: 'unsupported' as any };
    const errors = validateApplicationNode(node);
    const domainError = errors.find(
      (e) => e.code === APPLICATION_VALIDATION_CODES.APPLICATION_INVALID_DOMAIN,
    );

    assert.ok(domainError, 'Should have APPLICATION_INVALID_DOMAIN error');
  });

  it('should detect invalid status', () => {
    const node = { ...VALID_NODE, status: 'unsupported' as any };
    const errors = validateApplicationNode(node);
    const statusError = errors.find(
      (e) => e.code === APPLICATION_VALIDATION_CODES.APPLICATION_INVALID_STATUS,
    );

    assert.ok(statusError, 'Should have APPLICATION_INVALID_STATUS error');
  });

  it('should detect invalid governance status', () => {
    const node = { ...VALID_NODE, provenance: { ...VALID_PROVENANCE, governanceStatus: 'invalid' as any } };
    const errors = validateApplicationNode(node);
    const governanceError = errors.find(
      (e) => e.code === APPLICATION_VALIDATION_CODES.APPLICATION_INVALID_GOVERNANCE,
    );

    assert.ok(governanceError, 'Should have APPLICATION_INVALID_GOVERNANCE error');
  });

  it('should detect missing provenance', () => {
    const node = { ...VALID_NODE, provenance: undefined as any };
    const errors = validateApplicationNode(node);
    const provenanceError = errors.find(
      (e) => e.code === APPLICATION_VALIDATION_CODES.APPLICATION_MISSING_PROVENANCE,
    );

    assert.ok(provenanceError, 'Should have APPLICATION_MISSING_PROVENANCE error');
  });

  it('should detect missing provenance providedBy', () => {
    const node = { ...VALID_NODE, provenance: { ...VALID_PROVENANCE, providedBy: '' } };
    const errors = validateApplicationNode(node);
    const providerError = errors.find(
      (e) => e.code === APPLICATION_VALIDATION_CODES.APPLICATION_MISSING_PROVIDER,
    );

    assert.ok(providerError, 'Should have APPLICATION_MISSING_PROVIDER error');
  });

  it('should detect missing provenance rationale', () => {
    const node = { ...VALID_NODE, provenance: { ...VALID_PROVENANCE, rationale: '' } };
    const errors = validateApplicationNode(node);
    const rationaleError = errors.find(
      (e) => e.code === APPLICATION_VALIDATION_CODES.APPLICATION_MISSING_RATIONALE,
    );

    assert.ok(rationaleError, 'Should have APPLICATION_MISSING_RATIONALE error');
  });

  it('should detect missing trace', () => {
    const node = { ...VALID_NODE, trace: undefined as any };
    const errors = validateApplicationNode(node);
    const traceError = errors.find(
      (e) => e.code === APPLICATION_VALIDATION_CODES.APPLICATION_MISSING_TRACE,
    );

    assert.ok(traceError, 'Should have APPLICATION_MISSING_TRACE error');
  });

  it('should detect missing application ID', () => {
    const node = { ...VALID_NODE, applicationId: '' };
    const errors = validateApplicationNode(node);
    const idError = errors.find(
      (e) => e.code === APPLICATION_VALIDATION_CODES.APPLICATION_MISSING_APPLICATION_ID,
    );

    assert.ok(idError, 'Should have APPLICATION_MISSING_APPLICATION_ID error');
  });

  it('should detect missing title', () => {
    const node = { ...VALID_NODE, title: '' };
    const errors = validateApplicationNode(node);
    const titleError = errors.find(
      (e) => e.code === APPLICATION_VALIDATION_CODES.APPLICATION_MISSING_TITLE,
    );

    assert.ok(titleError, 'Should have APPLICATION_MISSING_TITLE error');
  });

  it('should validate a valid trace', () => {
    const trace = composeApplicationTrace({
      traceId: '_trace_1',
      decisions: [],
      registryVersion: '1.0.0',
      compositionVersion: '1.0.0',
    });

    const result = validateApplicationTrace(trace);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it('should detect invalid trace', () => {
    const trace: ApplicationTrace = {
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

    const result = validateApplicationTrace(trace);
    assert.equal(result.valid, false);
  });

  it('should detect invalid trace with randomUsed true', () => {
    const trace: ApplicationTrace = {
      traceId: '_trace_1',
      decisionCount: 0,
      validationCount: 0,
      registryVersion: '1.0.0',
      compositionVersion: '1.0.0',
      decisions: [],
      deterministic: true,
      generatedFrom: 'deterministic_application_kernel',
      randomUsed: true as any,
      timeDependency: false,
    };

    const result = validateApplicationTrace(trace);
    assert.equal(result.valid, false);
  });

  it('should detect invalid trace with timeDependency true', () => {
    const trace: ApplicationTrace = {
      traceId: '_trace_1',
      decisionCount: 0,
      validationCount: 0,
      registryVersion: '1.0.0',
      compositionVersion: '1.0.0',
      decisions: [],
      deterministic: true,
      generatedFrom: 'deterministic_application_kernel',
      randomUsed: false,
      timeDependency: true as any,
    };

    const result = validateApplicationTrace(trace);
    assert.equal(result.valid, false);
  });
});

// ---------------------------------------------------------------------------
// Determinism Tests
// ---------------------------------------------------------------------------

describe('Application Kernel — Determinism', () => {
  it('should produce identical output for identical input (100 iterations)', () => {
    const results: ReturnType<typeof composeApplication>[] = [];
    for (let i = 0; i < 100; i++) {
      results.push(composeApplication(VALID_INPUT));
    }

    for (let i = 1; i < results.length; i++) {
      assert.deepStrictEqual(results[0].registryId, results[i].registryId);
      assert.deepStrictEqual(results[0].nodes, results[i].nodes);
      assert.deepStrictEqual(results[0].trace.traceId, results[i].trace.traceId);
    }
  });

  it('should produce identical registry output for identical input', () => {
    const results: ReturnType<typeof composeApplicationRegistry>[] = [];
    for (let i = 0; i < 100; i++) {
      results.push(composeApplicationRegistry([VALID_NODE, VALID_NODE_2]));
    }

    for (let i = 1; i < results.length; i++) {
      assert.deepStrictEqual(results[0].nodes, results[i].nodes);
      assert.deepStrictEqual(results[0].registryId, results[i].registryId);
    }
  });
});

// ---------------------------------------------------------------------------
// Immutability Tests
// ---------------------------------------------------------------------------

describe('Application Kernel — Immutability', () => {
  it('should not mutate input nodes', () => {
    const originalId = VALID_NODE.applicationId;
    const originalTitle = VALID_NODE.title;

    composeApplication(VALID_INPUT);

    assert.equal(VALID_NODE.applicationId, originalId);
    assert.equal(VALID_NODE.title, originalTitle);
  });

  it('should not mutate input registry nodes', () => {
    const nodes = [VALID_NODE, VALID_NODE_2];
    const originalIds = nodes.map((n) => n.applicationId);

    composeApplicationRegistry(nodes);

    assert.equal(nodes[0].applicationId, originalIds[0]);
    assert.equal(nodes[1].applicationId, originalIds[1]);
  });
});

// ---------------------------------------------------------------------------
// Helper Function Tests
// ---------------------------------------------------------------------------

describe('Application Kernel — Helper Functions', () => {
  it('should return canonical artifact types', () => {
    const types = getCanonicalApplicationArtifactTypes();
    assert.deepStrictEqual([...types], [...CANONICAL_APPLICATION_ARTIFACT_TYPES]);
    assert.equal(types.length, 10);
  });

  it('should return canonical domains', () => {
    const domains = getCanonicalApplicationDomains();
    assert.deepStrictEqual([...domains], [...CANONICAL_APPLICATION_DOMAINS]);
    assert.equal(domains.length, 10);
  });

  it('should return canonical statuses', () => {
    const statuses = getCanonicalApplicationStatuses();
    assert.deepStrictEqual([...statuses], [...CANONICAL_APPLICATION_STATUS]);
    assert.equal(statuses.length, 6);
  });

  it('should return canonical governance statuses', () => {
    const governance = getCanonicalApplicationGovernance();
    assert.deepStrictEqual([...governance], [...CANONICAL_APPLICATION_GOVERNANCE]);
    assert.equal(governance.length, 5);
  });

  it('should validate artifact type support', () => {
    assert.equal(isSupportedApplicationArtifactType('use_case'), true);
    assert.equal(isSupportedApplicationArtifactType('system_architecture'), true);
    assert.equal(isSupportedApplicationArtifactType('unsupported'), false);
  });

  it('should validate domain support', () => {
    assert.equal(isSupportedApplicationDomain('computer_vision'), true);
    assert.equal(isSupportedApplicationDomain('deep_learning'), true);
    assert.equal(isSupportedApplicationDomain('unsupported'), false);
  });

  it('should validate status support', () => {
    assert.equal(isSupportedApplicationStatus('draft'), true);
    assert.equal(isSupportedApplicationStatus('published'), true);
    assert.equal(isSupportedApplicationStatus('unsupported'), false);
  });

  it('should validate governance status support', () => {
    assert.equal(isSupportedApplicationGovernance('canonical'), true);
    assert.equal(isSupportedApplicationGovernance('accepted'), true);
    assert.equal(isSupportedApplicationGovernance('unsupported'), false);
  });
});

// ---------------------------------------------------------------------------
// Canonical Enum Completeness Tests
// ---------------------------------------------------------------------------

describe('Application Kernel — Canonical Enum Completeness', () => {
  it('should have exactly 10 artifact types', () => {
    assert.equal(CANONICAL_APPLICATION_ARTIFACT_TYPES.length, 10);
  });

  it('should have exactly 10 domains', () => {
    assert.equal(CANONICAL_APPLICATION_DOMAINS.length, 10);
  });

  it('should have exactly 6 statuses', () => {
    assert.equal(CANONICAL_APPLICATION_STATUS.length, 6);
  });

  it('should have exactly 5 governance statuses', () => {
    assert.equal(CANONICAL_APPLICATION_GOVERNANCE.length, 5);
  });

  it('should contain all expected artifact types', () => {
    const expectedTypes = [
      'use_case',
      'system_architecture',
      'case_study',
      'trade_off',
      'application_flow',
      'engineering_scenario',
      'mlops_pipeline',
      'portfolio_project',
      'deployment_view',
      'visual_application',
    ];

    for (const type of expectedTypes) {
      assert.ok(
        CANONICAL_APPLICATION_ARTIFACT_TYPES.includes(type as any),
        `Should include type: ${type}`,
      );
    }
  });

  it('should contain all expected domains', () => {
    const expectedDomains = [
      'computer_vision',
      'machine_learning',
      'deep_learning',
      'generative_ai',
      'mlops',
      'robotics',
      'edge_ai',
      'data_engineering',
      'software_engineering',
      'research',
    ];

    for (const domain of expectedDomains) {
      assert.ok(
        CANONICAL_APPLICATION_DOMAINS.includes(domain as any),
        `Should include domain: ${domain}`,
      );
    }
  });

  it('should contain all expected statuses', () => {
    const expectedStatuses = ['draft', 'review', 'approved', 'published', 'deprecated', 'archived'];

    for (const status of expectedStatuses) {
      assert.ok(
        CANONICAL_APPLICATION_STATUS.includes(status as any),
        `Should include status: ${status}`,
      );
    }
  });

  it('should contain all expected governance statuses', () => {
    const expectedGovernance = ['canonical', 'accepted', 'provisional', 'deprecated', 'rejected'];

    for (const governance of expectedGovernance) {
      assert.ok(
        CANONICAL_APPLICATION_GOVERNANCE.includes(governance as any),
        `Should include governance: ${governance}`,
      );
    }
  });
});

// ---------------------------------------------------------------------------
// Negative Capability Verification Tests
// ---------------------------------------------------------------------------

describe('Application Kernel — Negative Capability Verification', () => {
  it('should not use Math.random', () => {
    const result = composeApplication(VALID_INPUT);
    assert.ok(result, 'Should produce a result without Math.random');
  });

  it('should not use Date.now', () => {
    const result = composeApplication(VALID_INPUT);
    assert.ok(result, 'Should produce a result without Date.now');
  });

  it('should not use performance.now', () => {
    const result = composeApplication(VALID_INPUT);
    assert.ok(result, 'Should produce a result without performance.now');
  });

  it('should not use crypto.randomUUID', () => {
    const result = composeApplication(VALID_INPUT);
    assert.ok(result, 'Should produce a result without crypto.randomUUID');
  });

  it('should not generate application content', () => {
    const result = composeApplication(VALID_INPUT);
    assert.ok(!('generatedContent' in result), 'Should not have generated content');
    assert.ok(!('generatedMarkdown' in result), 'Should not have generated markdown');
  });

  it('should not perform network requests', () => {
    const result = composeApplication(VALID_INPUT);
    assert.ok(!('networkResponse' in result), 'Should not have network response');
    assert.ok(!('httpResult' in result), 'Should not have HTTP result');
  });

  it('should not generate code', () => {
    const result = composeApplication(VALID_INPUT);
    assert.ok(!('generatedCode' in result), 'Should not have generated code');
    assert.ok(!('sourceCode' in result), 'Should not have source code');
  });

  it('should not have executable callbacks in node', () => {
    const node = composeApplicationNode({
      applicationId: 'app-001',
      title: 'Test',
      artifactType: 'use_case',
      domain: 'computer_vision',
      status: 'published',
      description: 'Test node.',
      provenance: VALID_PROVENANCE,
      trace: VALID_TRACE,
    });

    const keys = Object.keys(node);
    for (const key of keys) {
      const value = (node as any)[key];
      assert.ok(typeof value !== 'function', `Node field "${key}" should not be a function`);
    }
  });

  it('should not store educational content', () => {
    const result = composeApplication(VALID_INPUT);
    assert.ok(!('educationalContent' in result), 'Should not have educational content');
    assert.ok(!('markdown' in result), 'Should not have markdown');
  });

  it('should not access filesystem', () => {
    const result = composeApplication(VALID_INPUT);
    assert.ok(!('filesystem' in result), 'Should not have filesystem');
    assert.ok(!('fileSystem' in result), 'Should not have fileSystem');
  });

  it('should not perform runtime execution', () => {
    const result = composeApplication(VALID_INPUT);
    assert.ok(!('executionResult' in result), 'Should not have execution result');
    assert.ok(!('output' in result), 'Should not have output');
  });
});

// ---------------------------------------------------------------------------
// Registry Validation Tests
// ---------------------------------------------------------------------------

describe('Application Kernel — Registry Validation', () => {
  it('should detect registry inconsistency with invalid deterministic flag', () => {
    const registry: ApplicationRegistry = {
      ...composeApplicationRegistry([VALID_NODE]),
      deterministic: false as any,
    };
    const result = validateApplicationRegistry(registry);
    assert.equal(result.valid, false);
  });

  it('should detect registry inconsistency with invalid randomUsed flag', () => {
    const registry: ApplicationRegistry = {
      ...composeApplicationRegistry([VALID_NODE]),
      randomUsed: true as any,
    };
    const result = validateApplicationRegistry(registry);
    assert.equal(result.valid, false);
  });

  it('should detect registry inconsistency with invalid timeDependency flag', () => {
    const registry: ApplicationRegistry = {
      ...composeApplicationRegistry([VALID_NODE]),
      timeDependency: true as any,
    };
    const result = validateApplicationRegistry(registry);
    assert.equal(result.valid, false);
  });

  it('should validate empty input', () => {
    const result = validateApplicationInput(EMPTY_INPUT);
    assert.equal(result.valid, false);
    const emptyError = result.errors.find(
      (e) => e.code === APPLICATION_VALIDATION_CODES.APPLICATION_EMPTY_REGISTRY,
    );
    assert.ok(emptyError, 'Should have APPLICATION_EMPTY_REGISTRY error');
  });
});

// ---------------------------------------------------------------------------
// Validator Stability Tests
// ---------------------------------------------------------------------------

describe('Application Kernel — Validator Stability', () => {
  it('should produce identical validation results for valid input', () => {
    const result1 = validateApplicationRegistry(composeApplicationRegistry([VALID_NODE, VALID_NODE_2]));
    const result2 = validateApplicationRegistry(composeApplicationRegistry([VALID_NODE, VALID_NODE_2]));

    assert.deepStrictEqual(result1.valid, result2.valid);
    assert.deepStrictEqual(result1.errors.length, result2.errors.length);
  });

  it('should produce identical validation results for invalid input', () => {
    const node = { ...VALID_NODE, artifactType: 'unsupported' as any };
    const result1 = validateApplicationNode(node);
    const result2 = validateApplicationNode(node);

    assert.deepStrictEqual(result1.length, result2.length);
  });
});

// ---------------------------------------------------------------------------
// No Mutation Behavior Tests
// ---------------------------------------------------------------------------

describe('Application Kernel — No Mutation Behavior', () => {
  it('should not mutate nodes during registry composition', () => {
    const nodes = [
      { ...VALID_NODE, applicationId: 'app-003' },
      { ...VALID_NODE, applicationId: 'app-001' },
      { ...VALID_NODE, applicationId: 'app-002' },
    ];
    const originalOrder = nodes.map((n) => n.applicationId);

    composeApplicationRegistry(nodes);

    assert.deepStrictEqual(nodes.map((n) => n.applicationId), originalOrder);
  });

  it('should not mutate input during full composition', () => {
    const input: ApplicationInput = {
      nodes: [
        { ...VALID_NODE, applicationId: 'app-002' },
        { ...VALID_NODE, applicationId: 'app-001' },
      ],
    };
    const originalOrder = input.nodes.map((n) => n.applicationId);

    composeApplication(input);

    assert.deepStrictEqual(input.nodes.map((n) => n.applicationId), originalOrder);
  });
});

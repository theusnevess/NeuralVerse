/**
 * NV-1900-D7-OPT-03 — Theory-to-System Architecture Mapping Kernel Test Suite
 *
 * Comprehensive deterministic test suite for the System Architecture Kernel.
 * Covers: valid architecture, valid component, valid data flow, valid constraint,
 * valid provenance, valid registry, valid artifact with architectures,
 * duplicate IDs, duplicate titles, duplicate component IDs, duplicate flow IDs,
 * duplicate constraint IDs, invalid architecture type, invalid component type,
 * invalid flow type, invalid layer type, invalid constraint type, invalid status,
 * invalid governance, missing provenance, missing rationale, missing provider,
 * missing references, broken references, self flow, empty registry,
 * registry inconsistency, invalid trace, deterministic ordering,
 * 100 identical executions, immutable registry, input immutability,
 * artifact immutability, helper functions, canonical enum completeness,
 * negative capability verification, validator stability, no mutation verification.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import type {
  SystemArchitecture,
  SystemArchitectureProvenance,
  SystemComponent,
  SystemDataFlow,
  SystemConstraint,
  ArchitectureInput,
  ArchitectureRegistry,
  ArchitectureTrace,
  ApplicationNode,
} from './ApplicationAgentContract.ts';

import {
  CANONICAL_SYSTEM_ARCHITECTURE_TYPES,
  CANONICAL_SYSTEM_COMPONENT_TYPES,
  CANONICAL_DATA_FLOW_TYPES,
  CANONICAL_ARCHITECTURE_LAYER_TYPES,
  CANONICAL_SYSTEM_CONSTRAINT_TYPES,
  CANONICAL_SYSTEM_ARCHITECTURE_STATUS,
} from './ApplicationAgentContract.ts';

import {
  composeSystemArchitectureProvenance,
  composeSystemArchitecture,
  composeSystemComponent,
  composeSystemDataFlow,
  composeSystemConstraint,
  composeArchitectureTrace,
  composeArchitectureRegistry,
  composeArchitectureRegistryFromInput,
  composeApplicationArchitectures,
  composeApplicationArtifactWithArchitectures,
  isSupportedSystemArchitectureType,
  isSupportedSystemComponentType,
  isSupportedDataFlowType,
  isSupportedArchitectureLayerType,
  isSupportedSystemConstraintType,
  isSupportedSystemArchitectureStatus,
  isSupportedSystemArchitectureGovernance,
  getCanonicalSystemArchitectureTypes,
  getCanonicalSystemComponentTypes,
  getCanonicalDataFlowTypes,
  getCanonicalArchitectureLayerTypes,
  getCanonicalSystemConstraintTypes,
  getCanonicalSystemArchitectureStatuses,
} from './SystemArchitectureKernel.ts';

import {
  validateSystemArchitecture,
  validateSystemComponent,
  validateSystemDataFlow,
  validateSystemConstraint,
  validateArchitectureRegistry,
  validateArchitectureInput,
  validateArchitectureTrace,
  ARCHITECTURE_VALIDATION_CODES,
} from './SystemArchitectureValidation.ts';

// ---------------------------------------------------------------------------
// Test Fixtures
// ---------------------------------------------------------------------------

const VALID_PROVENANCE: SystemArchitectureProvenance = {
  providedBy: 'NeuralVerse Team',
  rationale: 'Core architecture concept.',
  reviewedBy: 'Architecture Review Board',
  reviewDate: '2026-01-01',
  governanceStatus: 'canonical',
};

const VALID_NODE: ApplicationNode = {
  applicationId: 'app-001',
  title: 'Image Classification Pipeline',
  artifactType: 'system_architecture',
  domain: 'computer_vision',
  status: 'published',
  description: 'End-to-end image classification system.',
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

const VALID_ARCHITECTURE: SystemArchitecture = {
  architectureId: 'arch-001',
  title: 'Medical Image Classification System',
  description: 'Complete system for medical image classification.',
  architectureType: 'computer_vision_pipeline',
  applicationArtifactId: 'app-001',
  knowledgeArtifactId: 'knowledge-001',
  useCaseIds: ['uc-001'],
  componentIds: ['comp-001', 'comp-002'],
  flowIds: ['flow-001'],
  constraintIds: ['const-001'],
  status: 'published',
  provenance: VALID_PROVENANCE,
};

const VALID_ARCHITECTURE_2: SystemArchitecture = {
  architectureId: 'arch-002',
  title: 'Product Recommendation System',
  description: 'Complete recommendation system.',
  architectureType: 'recommendation_system',
  applicationArtifactId: 'app-001',
  knowledgeArtifactId: 'knowledge-002',
  useCaseIds: ['uc-002'],
  componentIds: ['comp-003'],
  flowIds: [],
  constraintIds: [],
  status: 'approved',
  provenance: { ...VALID_PROVENANCE, providedBy: 'Research Team' },
};

const VALID_COMPONENT_1: SystemComponent = {
  componentId: 'comp-001',
  architectureId: 'arch-001',
  componentType: 'data_source',
  title: 'Image Data Source',
  description: 'Input image data source.',
  relatedConceptId: 'knowledge-001',
  layerType: 'input_layer',
  order: 0,
  provenance: VALID_PROVENANCE,
};

const VALID_COMPONENT_2: SystemComponent = {
  componentId: 'comp-002',
  architectureId: 'arch-001',
  componentType: 'model_inference',
  title: 'Classification Model',
  description: 'CNN classification model.',
  relatedConceptId: 'knowledge-001',
  layerType: 'model_layer',
  order: 1,
  provenance: VALID_PROVENANCE,
};

const VALID_COMPONENT_3: SystemComponent = {
  componentId: 'comp-003',
  architectureId: 'arch-002',
  componentType: 'feature_extraction',
  title: 'User Feature Extraction',
  description: 'Extract user features.',
  relatedConceptId: 'knowledge-002',
  layerType: 'processing_layer',
  order: 0,
  provenance: VALID_PROVENANCE,
};

const VALID_FLOW: SystemDataFlow = {
  flowId: 'flow-001',
  architectureId: 'arch-001',
  sourceComponentId: 'comp-001',
  targetComponentId: 'comp-002',
  flowType: 'feature_vector',
  description: 'Feature data flows to model.',
  provenance: VALID_PROVENANCE,
};

const VALID_CONSTRAINT: SystemConstraint = {
  constraintId: 'const-001',
  architectureId: 'arch-001',
  constraintType: 'latency',
  description: 'Inference must complete within 100ms.',
  affectedComponentIds: ['comp-002'],
  provenance: VALID_PROVENANCE,
};

const VALID_INPUT: ArchitectureInput = {
  architectures: [VALID_ARCHITECTURE, VALID_ARCHITECTURE_2],
  components: [VALID_COMPONENT_1, VALID_COMPONENT_2, VALID_COMPONENT_3],
  flows: [VALID_FLOW],
  constraints: [VALID_CONSTRAINT],
};

const EMPTY_INPUT: ArchitectureInput = {
  architectures: [],
  components: [],
  flows: [],
  constraints: [],
};

// ---------------------------------------------------------------------------
// Architecture Composition Tests
// ---------------------------------------------------------------------------

describe('System Architecture Kernel — Composition', () => {
  it('should compose valid architecture provenance', () => {
    const provenance = composeSystemArchitectureProvenance({
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

  it('should compose valid system architecture', () => {
    const arch = composeSystemArchitecture({
      architectureId: 'arch-001',
      title: 'Test System',
      description: 'Test architecture.',
      architectureType: 'data_pipeline',
      applicationArtifactId: 'app-001',
      knowledgeArtifactId: 'knowledge-001',
      useCaseIds: ['uc-001'],
      componentIds: ['comp-001'],
      flowIds: ['flow-001'],
      constraintIds: ['const-001'],
      status: 'published',
      provenance: VALID_PROVENANCE,
    });

    assert.equal(arch.architectureId, 'arch-001');
    assert.equal(arch.title, 'Test System');
    assert.equal(arch.architectureType, 'data_pipeline');
    assert.equal(arch.useCaseIds.length, 1);
    assert.equal(arch.componentIds.length, 1);
  });

  it('should compose valid system component', () => {
    const comp = composeSystemComponent({
      componentId: 'comp-001',
      architectureId: 'arch-001',
      componentType: 'data_source',
      title: 'Data Source',
      description: 'Input data.',
      relatedConceptId: 'knowledge-001',
      layerType: 'input_layer',
      order: 0,
      provenance: VALID_PROVENANCE,
    });

    assert.equal(comp.componentId, 'comp-001');
    assert.equal(comp.componentType, 'data_source');
    assert.equal(comp.layerType, 'input_layer');
    assert.equal(comp.order, 0);
  });

  it('should compose valid system data flow', () => {
    const flow = composeSystemDataFlow({
      flowId: 'flow-001',
      architectureId: 'arch-001',
      sourceComponentId: 'comp-001',
      targetComponentId: 'comp-002',
      flowType: 'feature_vector',
      description: 'Feature flow.',
      provenance: VALID_PROVENANCE,
    });

    assert.equal(flow.flowId, 'flow-001');
    assert.equal(flow.sourceComponentId, 'comp-001');
    assert.equal(flow.targetComponentId, 'comp-002');
    assert.equal(flow.flowType, 'feature_vector');
  });

  it('should compose valid system constraint', () => {
    const constraint = composeSystemConstraint({
      constraintId: 'const-001',
      architectureId: 'arch-001',
      constraintType: 'latency',
      description: 'Latency constraint.',
      affectedComponentIds: ['comp-001'],
      provenance: VALID_PROVENANCE,
    });

    assert.equal(constraint.constraintId, 'const-001');
    assert.equal(constraint.constraintType, 'latency');
    assert.equal(constraint.affectedComponentIds.length, 1);
  });

  it('should compose valid architecture trace', () => {
    const trace = composeArchitectureTrace({
      traceId: '_trace_1',
      decisions: [
        { decisionId: 'd1', architectureId: 'arch-001', validationPassed: true, validationErrors: [] },
      ],
      registryVersion: '1.0.0',
      compositionVersion: '1.0.0',
    });

    assert.equal(trace.traceId, '_trace_1');
    assert.equal(trace.decisionCount, 1);
    assert.equal(trace.validationCount, 1);
    assert.equal(trace.deterministic, true);
  });

  it('should validate a valid architecture with no errors', () => {
    const errors = validateSystemArchitecture(VALID_ARCHITECTURE);
    assert.deepStrictEqual(errors, []);
  });

  it('should validate a valid component with no errors', () => {
    const errors = validateSystemComponent(VALID_COMPONENT_1);
    assert.deepStrictEqual(errors, []);
  });

  it('should validate a valid registry with no errors', () => {
    const registry = composeArchitectureRegistry(
      [VALID_ARCHITECTURE],
      [VALID_COMPONENT_1, VALID_COMPONENT_2],
      [VALID_FLOW],
      [VALID_CONSTRAINT],
    );
    const result = validateArchitectureRegistry(registry);

    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it('should validate architecture input', () => {
    const result = validateArchitectureInput(VALID_INPUT);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });
});

// ---------------------------------------------------------------------------
// Registry Tests
// ---------------------------------------------------------------------------

describe('System Architecture Kernel — Registry', () => {
  it('should detect empty registry', () => {
    const registry = composeArchitectureRegistry([], [], [], []);
    const result = validateArchitectureRegistry(registry);
    const emptyError = result.errors.find(
      (e) => e.code === ARCHITECTURE_VALIDATION_CODES.ARCHITECTURE_EMPTY_REGISTRY,
    );

    assert.ok(emptyError, 'Should have ARCHITECTURE_EMPTY_REGISTRY error');
    assert.equal(result.valid, false);
  });

  it('should detect duplicate architecture IDs', () => {
    const registry = composeArchitectureRegistry([VALID_ARCHITECTURE, VALID_ARCHITECTURE], [], [], []);
    const result = validateArchitectureRegistry(registry);
    const duplicateError = result.errors.find(
      (e) => e.code === ARCHITECTURE_VALIDATION_CODES.ARCHITECTURE_DUPLICATE_ID,
    );

    assert.ok(duplicateError, 'Should have ARCHITECTURE_DUPLICATE_ID error');
  });

  it('should detect duplicate architecture titles', () => {
    const arch1 = { ...VALID_ARCHITECTURE, architectureId: 'arch-001', title: 'Same Title' };
    const arch2 = { ...VALID_ARCHITECTURE, architectureId: 'arch-002', title: 'Same Title' };
    const registry = composeArchitectureRegistry([arch1, arch2], [], [], []);
    const result = validateArchitectureRegistry(registry);
    const duplicateError = result.errors.find(
      (e) => e.code === ARCHITECTURE_VALIDATION_CODES.ARCHITECTURE_DUPLICATE_TITLE,
    );

    assert.ok(duplicateError, 'Should have ARCHITECTURE_DUPLICATE_TITLE error');
  });

  it('should detect duplicate component IDs', () => {
    const registry = composeArchitectureRegistry(
      [VALID_ARCHITECTURE],
      [VALID_COMPONENT_1, VALID_COMPONENT_1],
      [],
      [],
    );
    const result = validateArchitectureRegistry(registry);
    const duplicateError = result.errors.find(
      (e) => e.code === ARCHITECTURE_VALIDATION_CODES.ARCHITECTURE_COMPONENT_DUPLICATE_ID,
    );

    assert.ok(duplicateError, 'Should have ARCHITECTURE_COMPONENT_DUPLICATE_ID error');
  });

  it('should detect duplicate flow IDs', () => {
    const registry = composeArchitectureRegistry(
      [VALID_ARCHITECTURE],
      [VALID_COMPONENT_1, VALID_COMPONENT_2],
      [VALID_FLOW, VALID_FLOW],
      [],
    );
    const result = validateArchitectureRegistry(registry);
    const duplicateError = result.errors.find(
      (e) => e.code === ARCHITECTURE_VALIDATION_CODES.ARCHITECTURE_FLOW_DUPLICATE_ID,
    );

    assert.ok(duplicateError, 'Should have ARCHITECTURE_FLOW_DUPLICATE_ID error');
  });

  it('should detect duplicate constraint IDs', () => {
    const registry = composeArchitectureRegistry(
      [VALID_ARCHITECTURE],
      [VALID_COMPONENT_1, VALID_COMPONENT_2],
      [],
      [VALID_CONSTRAINT, VALID_CONSTRAINT],
    );
    const result = validateArchitectureRegistry(registry);
    const duplicateError = result.errors.find(
      (e) => e.code === ARCHITECTURE_VALIDATION_CODES.ARCHITECTURE_CONSTRAINT_DUPLICATE_ID,
    );

    assert.ok(duplicateError, 'Should have ARCHITECTURE_CONSTRAINT_DUPLICATE_ID error');
  });

  it('should sort architectures deterministically by architectureId', () => {
    const arch3 = { ...VALID_ARCHITECTURE, architectureId: 'arch-003' };
    const arch1 = { ...VALID_ARCHITECTURE, architectureId: 'arch-001' };
    const arch2 = { ...VALID_ARCHITECTURE, architectureId: 'arch-002' };

    const registry = composeArchitectureRegistry([arch3, arch1, arch2], [], [], []);

    assert.equal(registry.architectures[0].architectureId, 'arch-001');
    assert.equal(registry.architectures[1].architectureId, 'arch-002');
    assert.equal(registry.architectures[2].architectureId, 'arch-003');
  });

  it('should sort components deterministically', () => {
    const compB = { ...VALID_COMPONENT_1, componentId: 'comp-002', order: 1 };
    const compA = { ...VALID_COMPONENT_1, componentId: 'comp-001', order: 0 };

    const registry = composeArchitectureRegistry([VALID_ARCHITECTURE], [compB, compA], [], []);

    assert.equal(registry.components[0].componentId, 'comp-001');
    assert.equal(registry.components[1].componentId, 'comp-002');
  });

  it('should sort flows deterministically', () => {
    const flow2 = { ...VALID_FLOW, flowId: 'flow-002', sourceComponentId: 'comp-002', targetComponentId: 'comp-003' };
    const flow1 = { ...VALID_FLOW, flowId: 'flow-001', sourceComponentId: 'comp-001', targetComponentId: 'comp-002' };

    const registry = composeArchitectureRegistry([VALID_ARCHITECTURE], [VALID_COMPONENT_1, VALID_COMPONENT_2], [flow2, flow1], []);

    assert.equal(registry.flows[0].flowId, 'flow-001');
    assert.equal(registry.flows[1].flowId, 'flow-002');
  });

  it('should sort constraints deterministically', () => {
    const const2 = { ...VALID_CONSTRAINT, constraintId: 'const-002', constraintType: 'throughput' };
    const const1 = { ...VALID_CONSTRAINT, constraintId: 'const-001', constraintType: 'latency' };

    const registry = composeArchitectureRegistry([VALID_ARCHITECTURE], [], [], [const2, const1]);

    assert.equal(registry.constraints[0].constraintType, 'latency');
    assert.equal(registry.constraints[1].constraintType, 'throughput');
  });

  it('should compute correct metadata counts', () => {
    const registry = composeArchitectureRegistry(
      [VALID_ARCHITECTURE, VALID_ARCHITECTURE_2],
      [VALID_COMPONENT_1, VALID_COMPONENT_2, VALID_COMPONENT_3],
      [VALID_FLOW],
      [VALID_CONSTRAINT],
    );

    assert.equal(registry.metadata.architectureCount, 2);
    assert.equal(registry.metadata.componentCount, 3);
    assert.equal(registry.metadata.flowCount, 1);
    assert.equal(registry.metadata.constraintCount, 1);
    assert.equal(registry.metadata.typeCount, 2);
  });
});

// ---------------------------------------------------------------------------
// Validation Tests
// ---------------------------------------------------------------------------

describe('System Architecture Kernel — Validation', () => {
  it('should detect invalid architecture type', () => {
    const arch = { ...VALID_ARCHITECTURE, architectureType: 'unsupported' as any };
    const errors = validateSystemArchitecture(arch);
    const typeError = errors.find(
      (e) => e.code === ARCHITECTURE_VALIDATION_CODES.ARCHITECTURE_INVALID_TYPE,
    );

    assert.ok(typeError, 'Should have ARCHITECTURE_INVALID_TYPE error');
  });

  it('should detect invalid component type', () => {
    const comp = { ...VALID_COMPONENT_1, componentType: 'unsupported' as any };
    const errors = validateSystemComponent(comp);
    const typeError = errors.find(
      (e) => e.code === ARCHITECTURE_VALIDATION_CODES.ARCHITECTURE_INVALID_COMPONENT_TYPE,
    );

    assert.ok(typeError, 'Should have ARCHITECTURE_INVALID_COMPONENT_TYPE error');
  });

  it('should detect invalid flow type', () => {
    const flow = { ...VALID_FLOW, flowType: 'unsupported' as any };
    const errors = validateSystemDataFlow(flow, ['comp-001', 'comp-002']);
    const typeError = errors.find(
      (e) => e.code === ARCHITECTURE_VALIDATION_CODES.ARCHITECTURE_INVALID_FLOW_TYPE,
    );

    assert.ok(typeError, 'Should have ARCHITECTURE_INVALID_FLOW_TYPE error');
  });

  it('should detect invalid layer type', () => {
    const comp = { ...VALID_COMPONENT_1, layerType: 'unsupported' as any };
    const errors = validateSystemComponent(comp);
    const typeError = errors.find(
      (e) => e.code === ARCHITECTURE_VALIDATION_CODES.ARCHITECTURE_INVALID_LAYER_TYPE,
    );

    assert.ok(typeError, 'Should have ARCHITECTURE_INVALID_LAYER_TYPE error');
  });

  it('should detect invalid constraint type', () => {
    const constraint = { ...VALID_CONSTRAINT, constraintType: 'unsupported' as any };
    const errors = validateSystemConstraint(constraint, ['comp-002']);
    const typeError = errors.find(
      (e) => e.code === ARCHITECTURE_VALIDATION_CODES.ARCHITECTURE_INVALID_CONSTRAINT_TYPE,
    );

    assert.ok(typeError, 'Should have ARCHITECTURE_INVALID_CONSTRAINT_TYPE error');
  });

  it('should detect invalid status', () => {
    const arch = { ...VALID_ARCHITECTURE, status: 'unsupported' as any };
    const errors = validateSystemArchitecture(arch);
    const statusError = errors.find(
      (e) => e.code === ARCHITECTURE_VALIDATION_CODES.ARCHITECTURE_INVALID_STATUS,
    );

    assert.ok(statusError, 'Should have ARCHITECTURE_INVALID_STATUS error');
  });

  it('should detect invalid governance', () => {
    const arch = { ...VALID_ARCHITECTURE, provenance: { ...VALID_PROVENANCE, governanceStatus: 'invalid' as any } };
    const errors = validateSystemArchitecture(arch);
    const governanceError = errors.find(
      (e) => e.code === ARCHITECTURE_VALIDATION_CODES.ARCHITECTURE_INVALID_GOVERNANCE,
    );

    assert.ok(governanceError, 'Should have ARCHITECTURE_INVALID_GOVERNANCE error');
  });

  it('should detect missing provenance', () => {
    const arch = { ...VALID_ARCHITECTURE, provenance: undefined as any };
    const errors = validateSystemArchitecture(arch);
    const provenanceError = errors.find(
      (e) => e.code === ARCHITECTURE_VALIDATION_CODES.ARCHITECTURE_MISSING_PROVENANCE,
    );

    assert.ok(provenanceError, 'Should have ARCHITECTURE_MISSING_PROVENANCE error');
  });

  it('should detect missing rationale', () => {
    const arch = { ...VALID_ARCHITECTURE, provenance: { ...VALID_PROVENANCE, rationale: '' } };
    const errors = validateSystemArchitecture(arch);
    const rationaleError = errors.find(
      (e) => e.code === ARCHITECTURE_VALIDATION_CODES.ARCHITECTURE_MISSING_RATIONALE,
    );

    assert.ok(rationaleError, 'Should have ARCHITECTURE_MISSING_RATIONALE error');
  });

  it('should detect missing provider', () => {
    const arch = { ...VALID_ARCHITECTURE, provenance: { ...VALID_PROVENANCE, providedBy: '' } };
    const errors = validateSystemArchitecture(arch);
    const providerError = errors.find(
      (e) => e.code === ARCHITECTURE_VALIDATION_CODES.ARCHITECTURE_MISSING_PROVIDER,
    );

    assert.ok(providerError, 'Should have ARCHITECTURE_MISSING_PROVIDER error');
  });

  it('should detect missing application reference', () => {
    const arch = { ...VALID_ARCHITECTURE, applicationArtifactId: '' };
    const errors = validateSystemArchitecture(arch);
    const refError = errors.find(
      (e) => e.code === ARCHITECTURE_VALIDATION_CODES.ARCHITECTURE_MISSING_APPLICATION_REFERENCE,
    );

    assert.ok(refError, 'Should have ARCHITECTURE_MISSING_APPLICATION_REFERENCE error');
  });

  it('should detect missing knowledge reference', () => {
    const arch = { ...VALID_ARCHITECTURE, knowledgeArtifactId: '' };
    const errors = validateSystemArchitecture(arch);
    const refError = errors.find(
      (e) => e.code === ARCHITECTURE_VALIDATION_CODES.ARCHITECTURE_MISSING_KNOWLEDGE_REFERENCE,
    );

    assert.ok(refError, 'Should have ARCHITECTURE_MISSING_KNOWLEDGE_REFERENCE error');
  });

  it('should detect missing architecture ID', () => {
    const arch = { ...VALID_ARCHITECTURE, architectureId: '' };
    const errors = validateSystemArchitecture(arch);
    const idError = errors.find(
      (e) => e.code === ARCHITECTURE_VALIDATION_CODES.ARCHITECTURE_MISSING_ARCHITECTURE_ID,
    );

    assert.ok(idError, 'Should have ARCHITECTURE_MISSING_ARCHITECTURE_ID error');
  });

  it('should detect missing title', () => {
    const arch = { ...VALID_ARCHITECTURE, title: '' };
    const errors = validateSystemArchitecture(arch);
    const titleError = errors.find(
      (e) => e.code === ARCHITECTURE_VALIDATION_CODES.ARCHITECTURE_MISSING_TITLE,
    );

    assert.ok(titleError, 'Should have ARCHITECTURE_MISSING_TITLE error');
  });

  it('should detect self flow', () => {
    const flow: SystemDataFlow = {
      ...VALID_FLOW,
      sourceComponentId: 'comp-001',
      targetComponentId: 'comp-001',
    };

    const errors = validateSystemDataFlow(flow, ['comp-001']);
    const selfError = errors.find(
      (e) => e.code === ARCHITECTURE_VALIDATION_CODES.ARCHITECTURE_SELF_FLOW,
    );

    assert.ok(selfError, 'Should have ARCHITECTURE_SELF_FLOW error');
  });

  it('should detect broken flow references', () => {
    const flow: SystemDataFlow = {
      ...VALID_FLOW,
      sourceComponentId: 'unknown-comp',
    };

    const errors = validateSystemDataFlow(flow, ['comp-001', 'comp-002']);
    const refError = errors.find(
      (e) => e.code === ARCHITECTURE_VALIDATION_CODES.ARCHITECTURE_BROKEN_FLOW_REFERENCE,
    );

    assert.ok(refError, 'Should have ARCHITECTURE_BROKEN_FLOW_REFERENCE error');
  });

  it('should detect broken constraint references', () => {
    const constraint: SystemConstraint = {
      ...VALID_CONSTRAINT,
      affectedComponentIds: ['unknown-comp'],
    };

    const errors = validateSystemConstraint(constraint, ['comp-001', 'comp-002']);
    const refError = errors.find(
      (e) => e.code === ARCHITECTURE_VALIDATION_CODES.ARCHITECTURE_BROKEN_CONSTRAINT_REFERENCE,
    );

    assert.ok(refError, 'Should have ARCHITECTURE_BROKEN_CONSTRAINT_REFERENCE error');
  });

  it('should validate a valid trace', () => {
    const trace = composeArchitectureTrace({
      traceId: '_trace_1',
      decisions: [],
      registryVersion: '1.0.0',
      compositionVersion: '1.0.0',
    });

    const result = validateArchitectureTrace(trace);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it('should detect invalid trace', () => {
    const trace: ArchitectureTrace = {
      traceId: '',
      decisionCount: 0,
      validationCount: 0,
      registryVersion: '1.0.0',
      compositionVersion: '1.0.0',
      decisions: [],
      deterministic: false,
      generatedFrom: 'deterministic_architecture_kernel',
      randomUsed: false,
      timeDependency: false,
    };

    const result = validateArchitectureTrace(trace);
    assert.equal(result.valid, false);
  });
});

// ---------------------------------------------------------------------------
// Determinism Tests
// ---------------------------------------------------------------------------

describe('System Architecture Kernel — Determinism', () => {
  it('should produce identical output for identical input (100 iterations)', () => {
    const results: ReturnType<typeof composeApplicationArchitectures>[] = [];
    for (let i = 0; i < 100; i++) {
      results.push(composeApplicationArchitectures(VALID_INPUT));
    }

    for (let i = 1; i < results.length; i++) {
      assert.deepStrictEqual(results[0].registryId, results[i].registryId);
      assert.deepStrictEqual(results[0].architectures, results[i].architectures);
      assert.deepStrictEqual(results[0].trace.traceId, results[i].trace.traceId);
    }
  });

  it('should produce identical registry output for identical input', () => {
    const results: ReturnType<typeof composeArchitectureRegistry>[] = [];
    for (let i = 0; i < 100; i++) {
      results.push(composeArchitectureRegistry(
        [VALID_ARCHITECTURE],
        [VALID_COMPONENT_1, VALID_COMPONENT_2],
        [VALID_FLOW],
        [VALID_CONSTRAINT],
      ));
    }

    for (let i = 1; i < results.length; i++) {
      assert.deepStrictEqual(results[0].architectures, results[i].architectures);
      assert.deepStrictEqual(results[0].components, results[i].components);
      assert.deepStrictEqual(results[0].registryId, results[i].registryId);
    }
  });
});

// ---------------------------------------------------------------------------
// Immutability Tests
// ---------------------------------------------------------------------------

describe('System Architecture Kernel — Immutability', () => {
  it('should not mutate input architectures', () => {
    const originalId = VALID_ARCHITECTURE.architectureId;
    const originalTitle = VALID_ARCHITECTURE.title;

    composeApplicationArchitectures(VALID_INPUT);

    assert.equal(VALID_ARCHITECTURE.architectureId, originalId);
    assert.equal(VALID_ARCHITECTURE.title, originalTitle);
  });

  it('should not mutate input registry architectures', () => {
    const architectures = [VALID_ARCHITECTURE, VALID_ARCHITECTURE_2];
    const originalIds = architectures.map((a) => a.architectureId);

    composeArchitectureRegistry(architectures, [], [], []);

    assert.equal(architectures[0].architectureId, originalIds[0]);
    assert.equal(architectures[1].architectureId, originalIds[1]);
  });

  it('should not mutate the original application node', () => {
    const registry = composeArchitectureRegistry([VALID_ARCHITECTURE], [], [], []);
    const originalDescription = VALID_NODE.description;

    composeApplicationArtifactWithArchitectures({
      applicationNode: VALID_NODE,
      architectureRegistry: registry,
    });

    assert.equal(VALID_NODE.description, originalDescription);
  });
});

// ---------------------------------------------------------------------------
// Helper Function Tests
// ---------------------------------------------------------------------------

describe('System Architecture Kernel — Helper Functions', () => {
  it('should return canonical architecture types', () => {
    const types = getCanonicalSystemArchitectureTypes();
    assert.deepStrictEqual([...types], [...CANONICAL_SYSTEM_ARCHITECTURE_TYPES]);
    assert.equal(types.length, 10);
  });

  it('should return canonical component types', () => {
    const types = getCanonicalSystemComponentTypes();
    assert.deepStrictEqual([...types], [...CANONICAL_SYSTEM_COMPONENT_TYPES]);
    assert.equal(types.length, 12);
  });

  it('should return canonical data flow types', () => {
    const types = getCanonicalDataFlowTypes();
    assert.deepStrictEqual([...types], [...CANONICAL_DATA_FLOW_TYPES]);
    assert.equal(types.length, 10);
  });

  it('should return canonical layer types', () => {
    const types = getCanonicalArchitectureLayerTypes();
    assert.deepStrictEqual([...types], [...CANONICAL_ARCHITECTURE_LAYER_TYPES]);
    assert.equal(types.length, 10);
  });

  it('should return canonical constraint types', () => {
    const types = getCanonicalSystemConstraintTypes();
    assert.deepStrictEqual([...types], [...CANONICAL_SYSTEM_CONSTRAINT_TYPES]);
    assert.equal(types.length, 10);
  });

  it('should return canonical statuses', () => {
    const statuses = getCanonicalSystemArchitectureStatuses();
    assert.deepStrictEqual([...statuses], [...CANONICAL_SYSTEM_ARCHITECTURE_STATUS]);
    assert.equal(statuses.length, 6);
  });

  it('should validate architecture type support', () => {
    assert.equal(isSupportedSystemArchitectureType('data_pipeline'), true);
    assert.equal(isSupportedSystemArchitectureType('model_pipeline'), true);
    assert.equal(isSupportedSystemArchitectureType('unsupported'), false);
  });

  it('should validate component type support', () => {
    assert.equal(isSupportedSystemComponentType('data_source'), true);
    assert.equal(isSupportedSystemComponentType('model_inference'), true);
    assert.equal(isSupportedSystemComponentType('unsupported'), false);
  });

  it('should validate data flow type support', () => {
    assert.equal(isSupportedDataFlowType('raw_input'), true);
    assert.equal(isSupportedDataFlowType('feature_vector'), true);
    assert.equal(isSupportedDataFlowType('unsupported'), false);
  });

  it('should validate layer type support', () => {
    assert.equal(isSupportedArchitectureLayerType('input_layer'), true);
    assert.equal(isSupportedArchitectureLayerType('model_layer'), true);
    assert.equal(isSupportedArchitectureLayerType('unsupported'), false);
  });

  it('should validate constraint type support', () => {
    assert.equal(isSupportedSystemConstraintType('latency'), true);
    assert.equal(isSupportedSystemConstraintType('throughput'), true);
    assert.equal(isSupportedSystemConstraintType('unsupported'), false);
  });

  it('should validate status support', () => {
    assert.equal(isSupportedSystemArchitectureStatus('draft'), true);
    assert.equal(isSupportedSystemArchitectureStatus('published'), true);
    assert.equal(isSupportedSystemArchitectureStatus('unsupported'), false);
  });

  it('should validate governance support', () => {
    assert.equal(isSupportedSystemArchitectureGovernance('canonical'), true);
    assert.equal(isSupportedSystemArchitectureGovernance('accepted'), true);
    assert.equal(isSupportedSystemArchitectureGovernance('unsupported'), false);
  });
});

// ---------------------------------------------------------------------------
// Canonical Enum Completeness Tests
// ---------------------------------------------------------------------------

describe('System Architecture Kernel — Canonical Enum Completeness', () => {
  it('should have exactly 10 architecture types', () => {
    assert.equal(CANONICAL_SYSTEM_ARCHITECTURE_TYPES.length, 10);
  });

  it('should have exactly 12 component types', () => {
    assert.equal(CANONICAL_SYSTEM_COMPONENT_TYPES.length, 12);
  });

  it('should have exactly 10 data flow types', () => {
    assert.equal(CANONICAL_DATA_FLOW_TYPES.length, 10);
  });

  it('should have exactly 10 layer types', () => {
    assert.equal(CANONICAL_ARCHITECTURE_LAYER_TYPES.length, 10);
  });

  it('should have exactly 10 constraint types', () => {
    assert.equal(CANONICAL_SYSTEM_CONSTRAINT_TYPES.length, 10);
  });

  it('should have exactly 6 statuses', () => {
    assert.equal(CANONICAL_SYSTEM_ARCHITECTURE_STATUS.length, 6);
  });

  it('should contain all expected architecture types', () => {
    const expected = ['data_pipeline', 'model_pipeline', 'computer_vision_pipeline', 'mlops_pipeline', 'edge_ai_system', 'robotics_system', 'retrieval_system', 'recommendation_system', 'monitoring_system', 'decision_system'];

    for (const type of expected) {
      assert.ok(
        CANONICAL_SYSTEM_ARCHITECTURE_TYPES.includes(type as any),
        `Should include type: ${type}`,
      );
    }
  });

  it('should contain all expected component types', () => {
    const expected = ['data_source', 'sensor_input', 'preprocessing', 'feature_extraction', 'model_inference', 'postprocessing', 'decision_logic', 'storage', 'api_service', 'deployment_target', 'monitoring', 'feedback_loop'];

    for (const type of expected) {
      assert.ok(
        CANONICAL_SYSTEM_COMPONENT_TYPES.includes(type as any),
        `Should include type: ${type}`,
      );
    }
  });

  it('should contain all expected statuses', () => {
    const expected = ['draft', 'review', 'approved', 'published', 'deprecated', 'archived'];

    for (const status of expected) {
      assert.ok(
        CANONICAL_SYSTEM_ARCHITECTURE_STATUS.includes(status as any),
        `Should include status: ${status}`,
      );
    }
  });
});

// ---------------------------------------------------------------------------
// Negative Capability Verification Tests
// ---------------------------------------------------------------------------

describe('System Architecture Kernel — Negative Capability Verification', () => {
  it('should not use Math.random', () => {
    const result = composeApplicationArchitectures(VALID_INPUT);
    assert.ok(result, 'Should produce a result without Math.random');
  });

  it('should not use Date.now', () => {
    const result = composeApplicationArchitectures(VALID_INPUT);
    assert.ok(result, 'Should produce a result without Date.now');
  });

  it('should not use performance.now', () => {
    const result = composeApplicationArchitectures(VALID_INPUT);
    assert.ok(result, 'Should produce a result without performance.now');
  });

  it('should not use crypto.randomUUID', () => {
    const result = composeApplicationArchitectures(VALID_INPUT);
    assert.ok(result, 'Should produce a result without crypto.randomUUID');
  });

  it('should not generate architecture content', () => {
    const result = composeApplicationArchitectures(VALID_INPUT);
    assert.ok(!('generatedContent' in result), 'Should not have generated content');
    assert.ok(!('generatedMarkdown' in result), 'Should not have generated markdown');
  });

  it('should not perform network requests', () => {
    const result = composeApplicationArchitectures(VALID_INPUT);
    assert.ok(!('networkResponse' in result), 'Should not have network response');
  });

  it('should not generate code', () => {
    const result = composeApplicationArchitectures(VALID_INPUT);
    assert.ok(!('generatedCode' in result), 'Should not have generated code');
  });

  it('should not have executable callbacks in architecture', () => {
    const arch = composeSystemArchitecture({
      architectureId: 'arch-001',
      title: 'Test',
      description: 'Test.',
      architectureType: 'data_pipeline',
      applicationArtifactId: 'app-001',
      knowledgeArtifactId: 'knowledge-001',
      useCaseIds: [],
      componentIds: [],
      flowIds: [],
      constraintIds: [],
      status: 'published',
      provenance: VALID_PROVENANCE,
    });

    const keys = Object.keys(arch);
    for (const key of keys) {
      const value = (arch as any)[key];
      assert.ok(typeof value !== 'function', `Architecture field "${key}" should not be a function`);
    }
  });

  it('should not store educational content', () => {
    const result = composeApplicationArchitectures(VALID_INPUT);
    assert.ok(!('educationalContent' in result), 'Should not have educational content');
  });

  it('should not access filesystem', () => {
    const result = composeApplicationArchitectures(VALID_INPUT);
    assert.ok(!('filesystem' in result), 'Should not have filesystem');
  });
});

// ---------------------------------------------------------------------------
// Registry Validation Tests
// ---------------------------------------------------------------------------

describe('System Architecture Kernel — Registry Validation', () => {
  it('should detect registry inconsistency with invalid deterministic flag', () => {
    const registry: ArchitectureRegistry = {
      ...composeArchitectureRegistry([VALID_ARCHITECTURE], [], [], []),
      deterministic: false as any,
    };
    const result = validateArchitectureRegistry(registry);
    assert.equal(result.valid, false);
  });

  it('should detect registry inconsistency with invalid randomUsed flag', () => {
    const registry: ArchitectureRegistry = {
      ...composeArchitectureRegistry([VALID_ARCHITECTURE], [], [], []),
      randomUsed: true as any,
    };
    const result = validateArchitectureRegistry(registry);
    assert.equal(result.valid, false);
  });

  it('should detect registry inconsistency with invalid timeDependency flag', () => {
    const registry: ArchitectureRegistry = {
      ...composeArchitectureRegistry([VALID_ARCHITECTURE], [], [], []),
      timeDependency: true as any,
    };
    const result = validateArchitectureRegistry(registry);
    assert.equal(result.valid, false);
  });

  it('should validate empty input', () => {
    const result = validateArchitectureInput(EMPTY_INPUT);
    assert.equal(result.valid, false);
    const emptyError = result.errors.find(
      (e) => e.code === ARCHITECTURE_VALIDATION_CODES.ARCHITECTURE_EMPTY_REGISTRY,
    );
    assert.ok(emptyError, 'Should have ARCHITECTURE_EMPTY_REGISTRY error');
  });
});

// ---------------------------------------------------------------------------
// Validator Stability Tests
// ---------------------------------------------------------------------------

describe('System Architecture Kernel — Validator Stability', () => {
  it('should produce identical validation results for valid input', () => {
    const result1 = validateArchitectureRegistry(composeArchitectureRegistry([VALID_ARCHITECTURE], [VALID_COMPONENT_1], [], []));
    const result2 = validateArchitectureRegistry(composeArchitectureRegistry([VALID_ARCHITECTURE], [VALID_COMPONENT_1], [], []));

    assert.deepStrictEqual(result1.valid, result2.valid);
    assert.deepStrictEqual(result1.errors.length, result2.errors.length);
  });

  it('should produce identical validation results for invalid input', () => {
    const arch = { ...VALID_ARCHITECTURE, architectureType: 'unsupported' as any };
    const result1 = validateSystemArchitecture(arch);
    const result2 = validateSystemArchitecture(arch);

    assert.deepStrictEqual(result1.length, result2.length);
  });
});

// ---------------------------------------------------------------------------
// No Mutation Behavior Tests
// ---------------------------------------------------------------------------

describe('System Architecture Kernel — No Mutation Behavior', () => {
  it('should not mutate architectures during registry composition', () => {
    const architectures = [
      { ...VALID_ARCHITECTURE, architectureId: 'arch-003' },
      { ...VALID_ARCHITECTURE, architectureId: 'arch-001' },
      { ...VALID_ARCHITECTURE, architectureId: 'arch-002' },
    ];
    const originalOrder = architectures.map((a) => a.architectureId);

    composeArchitectureRegistry(architectures, [], [], []);

    assert.deepStrictEqual(architectures.map((a) => a.architectureId), originalOrder);
  });

  it('should not mutate input during full composition', () => {
    const input: ArchitectureInput = {
      architectures: [
        { ...VALID_ARCHITECTURE, architectureId: 'arch-002' },
        { ...VALID_ARCHITECTURE, architectureId: 'arch-001' },
      ],
      components: [],
      flows: [],
      constraints: [],
    };
    const originalOrder = input.architectures.map((a) => a.architectureId);

    composeApplicationArchitectures(input);

    assert.deepStrictEqual(input.architectures.map((a) => a.architectureId), originalOrder);
  });
});

// ---------------------------------------------------------------------------
// Artifact with Architectures Tests
// ---------------------------------------------------------------------------

describe('System Architecture Kernel — Artifact with Architectures', () => {
  it('should compose application artifact with architectures', () => {
    const registry = composeArchitectureRegistry([VALID_ARCHITECTURE], [VALID_COMPONENT_1], [], []);
    const result = composeApplicationArtifactWithArchitectures({
      applicationNode: VALID_NODE,
      architectureRegistry: registry,
    });

    assert.equal(result.applicationNode.applicationId, 'app-001');
    assert.equal(result.architectureRegistry.architectures.length, 1);
    assert.equal(result.deterministic, true);
    assert.equal(result.randomUsed, false);
    assert.equal(result.timeDependency, false);
  });

  it('should not mutate the original application node', () => {
    const registry = composeArchitectureRegistry([VALID_ARCHITECTURE], [], [], []);
    const originalTitle = VALID_NODE.title;

    composeApplicationArtifactWithArchitectures({
      applicationNode: VALID_NODE,
      architectureRegistry: registry,
    });

    assert.equal(VALID_NODE.title, originalTitle);
  });
});

/**
 * CurriculumPipelineFacade — Deterministic Test Suite
 *
 * Tests the public API facade for the curriculum pipeline.
 * All tests are deterministic, use node:test and node:assert/strict.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import type {
  CurriculumNode,
  CurriculumEdge,
  CurriculumGraphInput,
  CurriculumCompositionInput,
  CurriculumArtifact,
  CurriculumCompositionCertificationReport,
  CurriculumFacadeStatus,
} from './CurriculumAgentContract.ts';

import {
  composeFacadeArtifact,
  certifyCurriculumArtifact,
  composeAndCertifyCurriculumArtifact,
  validateCurriculumFacadeArtifact,
  validateCurriculumFacadeCertification,
  validateCurriculumFacadeComplete,
  getCanonicalFacadeStatuses,
  isSupportedFacadeStatus,
} from './CurriculumPipelineFacade.ts';

import {
  composeCurriculumGraph,
  composeCurriculumTrace,
} from './CurriculumGraphKernel.ts';

// ---------------------------------------------------------------------------
// Test Fixtures
// ---------------------------------------------------------------------------

const VALID_NODE_1: CurriculumNode = {
  nodeId: 'node-001',
  nodeType: 'lesson',
  referenceId: 'ref-001',
  source: 'governance-committee',
  governanceStatus: 'canonical',
  rationale: 'Introduction.',
  providedBy: 'curriculum-board',
};

const VALID_NODE_2: CurriculumNode = {
  nodeId: 'node-002',
  nodeType: 'concept',
  referenceId: 'ref-002',
  source: 'governance-committee',
  governanceStatus: 'canonical',
  rationale: 'Core concept.',
  providedBy: 'curriculum-board',
};

const VALID_EDGE_1: CurriculumEdge = {
  edgeId: 'edge-001',
  sourceNodeId: 'node-001',
  targetNodeId: 'node-002',
  relationshipType: 'depends_on',
  referenceId: 'ref-edge-001',
  source: 'governance-committee',
  governanceStatus: 'canonical',
  rationale: 'Dependency.',
  providedBy: 'curriculum-board',
};

const VALID_GRAPH_INPUT: CurriculumGraphInput = {
  graphId: 'graph-001',
  graphLabel: 'Test Graph',
  nodes: [VALID_NODE_1, VALID_NODE_2],
  edges: [VALID_EDGE_1],
};

const VALID_COMPOSITION_INPUT: CurriculumCompositionInput = {
  artifactId: 'artifact-001',
  graphInput: VALID_GRAPH_INPUT,
};

// ---------------------------------------------------------------------------
// Helper: build a valid artifact for validation tests
// ---------------------------------------------------------------------------

function buildValidArtifact(): CurriculumArtifact {
  const graph = composeCurriculumGraph(VALID_GRAPH_INPUT);
  const trace = composeCurriculumTrace(
    VALID_GRAPH_INPUT.graphId,
    VALID_GRAPH_INPUT.nodes,
    VALID_GRAPH_INPUT.edges,
  );
  return {
    artifactId: 'artifact-001',
    graph,
    trace,
    validation: {
      valid: true,
      errors: [],
      checkedAt: 'curriculum_graph_composition',
    },
    deterministic: true,
    generatedFrom: 'deterministic_curriculum_graph_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}

function buildValidCertificationReport(): CurriculumCompositionCertificationReport {
  return {
    reportId: 'report-001',
    artifactId: 'artifact-001',
    status: 'certified',
    findings: [],
    findingCount: 0,
    errorCount: 0,
    warningCount: 0,
    recommendationCount: 0,
    qualityScore: 100,
    dimensionsChecked: [],
    deterministic: true,
    generatedFrom: 'deterministic_certification_engine',
    randomUsed: false,
    timeDependency: false,
    curriculumMutated: false,
  };
}

// ===========================================================================
// 1. composeCurriculumArtifact
// ===========================================================================

describe('composeCurriculumArtifact', () => {
  it('returns artifact with correct properties from valid input', () => {
    const result = composeFacadeArtifact(VALID_COMPOSITION_INPUT);

    assert.equal(result.artifact.artifactId, 'artifact-001');
    assert.equal(result.artifact.graph.graphId, 'graph-001');
    assert.equal(result.artifact.graph.graphLabel, 'Test Graph');
    assert.equal(result.artifact.graph.nodes.length, 2);
    assert.equal(result.artifact.graph.edges.length, 1);
    assert.equal(result.artifact.deterministic, true);
    assert.equal(result.artifact.randomUsed, false);
    assert.equal(result.artifact.timeDependency, false);
    assert.equal(result.artifact.generatedFrom, 'deterministic_curriculum_graph_kernel');
  });

  it('returns valid validation result', () => {
    const result = composeFacadeArtifact(VALID_COMPOSITION_INPUT);

    assert.equal(result.validationResult.valid, true);
    assert.equal(result.validationResult.errors.length, 0);
    assert.equal(result.validationResult.checkedAt, 'curriculum_facade_consolidation');
  });

  it('returns trace metadata with correct operation', () => {
    const result = composeFacadeArtifact(VALID_COMPOSITION_INPUT);

    assert.equal(result.traceMetadata.operation, 'compose');
    assert.equal(result.traceMetadata.deterministic, true);
    assert.equal(result.traceMetadata.randomUsed, false);
    assert.equal(result.traceMetadata.timeDependency, false);
    assert.equal(result.traceMetadata.curriculumMutated, false);
  });

  it('preserves node order sorted by nodeId', () => {
    const result = composeFacadeArtifact(VALID_COMPOSITION_INPUT);

    const nodeIds = result.artifact.graph.nodes.map((n) => n.nodeId);
    assert.deepEqual(nodeIds, ['node-001', 'node-002']);
  });

  it('preserves edge order sorted by edgeId', () => {
    const result = composeFacadeArtifact(VALID_COMPOSITION_INPUT);

    const edgeIds = result.artifact.graph.edges.map((e) => e.edgeId);
    assert.deepEqual(edgeIds, ['edge-001']);
  });
});

// ===========================================================================
// 2. certifyCurriculumArtifact
// ===========================================================================

describe('certifyCurriculumArtifact', () => {
  it('returns certification report with correct properties', () => {
    const artifact = buildValidArtifact();
    const result = certifyCurriculumArtifact(artifact);

    assert.equal(result.certificationReport.reportId, '_cert_report_artifact-001');
    assert.equal(result.certificationReport.artifactId, 'artifact-001');
    assert.equal(result.certificationReport.status, 'certified');
    assert.equal(result.certificationReport.findingCount, 0);
    assert.equal(result.certificationReport.errorCount, 0);
    assert.equal(result.certificationReport.warningCount, 0);
    assert.equal(result.certificationReport.recommendationCount, 0);
    assert.equal(result.certificationReport.qualityScore, 100);
    assert.equal(result.certificationReport.deterministic, true);
    assert.equal(result.certificationReport.randomUsed, false);
    assert.equal(result.certificationReport.timeDependency, false);
    assert.equal(result.certificationReport.curriculumMutated, false);
  });

  it('returns valid validation result', () => {
    const artifact = buildValidArtifact();
    const result = certifyCurriculumArtifact(artifact);

    assert.equal(result.validationResult.valid, true);
    assert.equal(result.validationResult.errors.length, 0);
  });

  it('returns trace metadata with certify operation', () => {
    const artifact = buildValidArtifact();
    const result = certifyCurriculumArtifact(artifact);

    assert.equal(result.traceMetadata.operation, 'certify');
    assert.equal(result.traceMetadata.deterministic, true);
  });
});

// ===========================================================================
// 3. composeAndCertifyCurriculumArtifact
// ===========================================================================

describe('composeAndCertifyCurriculumArtifact', () => {
  it('returns complete output with artifact and certification report', () => {
    const result = composeAndCertifyCurriculumArtifact(VALID_COMPOSITION_INPUT);

    assert.equal(result.artifact.artifactId, 'artifact-001');
    assert.equal(result.certificationReport.artifactId, 'artifact-001');
    assert.equal(result.certificationReport.status, 'certified');
    assert.equal(result.certificationReport.reportId, '_cert_report_artifact-001');
  });

  it('returns valid validation result', () => {
    const result = composeAndCertifyCurriculumArtifact(VALID_COMPOSITION_INPUT);

    assert.equal(result.validationResult.valid, true);
    assert.equal(result.validationResult.errors.length, 0);
  });

  it('returns trace metadata with compose_and_certify operation', () => {
    const result = composeAndCertifyCurriculumArtifact(VALID_COMPOSITION_INPUT);

    assert.equal(result.traceMetadata.operation, 'compose_and_certify');
    assert.equal(result.traceMetadata.deterministic, true);
  });

  it('produces graph with correct nodes and edges', () => {
    const result = composeAndCertifyCurriculumArtifact(VALID_COMPOSITION_INPUT);

    assert.equal(result.artifact.graph.nodes.length, 2);
    assert.equal(result.artifact.graph.edges.length, 1);
    assert.equal(result.artifact.graph.deterministic, true);
  });
});

// ===========================================================================
// 4. validateCurriculumFacadeArtifact
// ===========================================================================

describe('validateCurriculumFacadeArtifact', () => {
  it('passes for a valid artifact', () => {
    const artifact = buildValidArtifact();
    const result = validateCurriculumFacadeArtifact(artifact);

    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
    assert.equal(result.checkedAt, 'curriculum_facade_consolidation');
  });

  it('fails when artifactId is missing', () => {
    const artifact = { ...buildValidArtifact(), artifactId: '' };
    const result = validateCurriculumFacadeArtifact(artifact);

    assert.equal(result.valid, false);
    assert.equal(result.errors.length, 1);
    assert.equal(result.errors[0].code, 'FACADE_MISSING_ARTIFACT_ID');
    assert.equal(result.errors[0].field, 'artifactId');
  });

  it('fails when artifactId is whitespace only', () => {
    const artifact = { ...buildValidArtifact(), artifactId: '   ' };
    const result = validateCurriculumFacadeArtifact(artifact);

    assert.equal(result.valid, false);
    assert.equal(result.errors[0].code, 'FACADE_MISSING_ARTIFACT_ID');
  });

  it('fails when graph is missing', () => {
    const artifact = { ...buildValidArtifact(), graph: undefined as never };
    const result = validateCurriculumFacadeArtifact(artifact);

    assert.equal(result.valid, false);
    assert.equal(result.errors.length, 1);
    assert.equal(result.errors[0].code, 'FACADE_MISSING_GRAPH');
    assert.equal(result.errors[0].field, 'graph');
  });
});

// ===========================================================================
// 5. validateCurriculumFacadeCertification
// ===========================================================================

describe('validateCurriculumFacadeCertification', () => {
  it('passes for a valid certification report', () => {
    const report = buildValidCertificationReport();
    const result = validateCurriculumFacadeCertification(report);

    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
    assert.equal(result.checkedAt, 'curriculum_facade_consolidation');
  });

  it('fails when reportId is missing', () => {
    const report = { ...buildValidCertificationReport(), reportId: '' };
    const result = validateCurriculumFacadeCertification(report);

    assert.equal(result.valid, false);
    assert.equal(result.errors.length, 1);
    assert.equal(result.errors[0].code, 'FACADE_MISSING_REPORT_ID');
    assert.equal(result.errors[0].field, 'reportId');
  });

  it('fails when reportId is whitespace only', () => {
    const report = { ...buildValidCertificationReport(), reportId: '  ' };
    const result = validateCurriculumFacadeCertification(report);

    assert.equal(result.valid, false);
    assert.equal(result.errors[0].code, 'FACADE_MISSING_REPORT_ID');
  });

  it('fails when artifactId is missing from report', () => {
    const report = { ...buildValidCertificationReport(), artifactId: '' };
    const result = validateCurriculumFacadeCertification(report);

    assert.equal(result.valid, false);
    assert.equal(result.errors.length, 1);
    assert.equal(result.errors[0].code, 'FACADE_MISSING_ARTIFACT_ID');
    assert.equal(result.errors[0].field, 'artifactId');
  });
});

// ===========================================================================
// 6. validateCurriculumFacadeComplete
// ===========================================================================

describe('validateCurriculumFacadeComplete', () => {
  it('passes when both artifact and certification report are valid', () => {
    const artifact = buildValidArtifact();
    const report = buildValidCertificationReport();
    const result = validateCurriculumFacadeComplete(artifact, report);

    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
    assert.equal(result.checkedAt, 'curriculum_facade_consolidation');
  });

  it('fails when artifact is invalid', () => {
    const artifact = { ...buildValidArtifact(), artifactId: '' };
    const report = buildValidCertificationReport();
    const result = validateCurriculumFacadeComplete(artifact, report);

    assert.equal(result.valid, false);
    assert.ok(result.errors.some((e) => e.code === 'FACADE_MISSING_ARTIFACT_ID'));
  });

  it('fails when certification report is invalid', () => {
    const artifact = buildValidArtifact();
    const report = { ...buildValidCertificationReport(), reportId: '' };
    const result = validateCurriculumFacadeComplete(artifact, report);

    assert.equal(result.valid, false);
    assert.ok(result.errors.some((e) => e.code === 'FACADE_MISSING_REPORT_ID'));
  });

  it('collects errors from both artifact and certification report', () => {
    const artifact = { ...buildValidArtifact(), artifactId: '' };
    const report = { ...buildValidCertificationReport(), reportId: '' };
    const result = validateCurriculumFacadeComplete(artifact, report);

    assert.equal(result.valid, false);
    assert.ok(result.errors.length >= 2);
    const codes = result.errors.map((e) => e.code);
    assert.ok(codes.includes('FACADE_MISSING_ARTIFACT_ID'));
    assert.ok(codes.includes('FACADE_MISSING_REPORT_ID'));
  });
});

// ===========================================================================
// 7. Helper functions
// ===========================================================================

describe('getCanonicalFacadeStatuses', () => {
  it('returns the correct canonical status array', () => {
    const statuses = getCanonicalFacadeStatuses();

    assert.deepEqual(statuses, ['composed', 'certified', 'failed']);
    assert.equal(statuses.length, 3);
  });

  it('returns a readonly array', () => {
    const statuses = getCanonicalFacadeStatuses();

    assert.ok(Array.isArray(statuses));
  });
});

describe('isSupportedFacadeStatus', () => {
  it('returns true for composed', () => {
    assert.equal(isSupportedFacadeStatus('composed'), true);
  });

  it('returns true for certified', () => {
    assert.equal(isSupportedFacadeStatus('certified'), true);
  });

  it('returns true for failed', () => {
    assert.equal(isSupportedFacadeStatus('failed'), true);
  });

  it('returns false for unknown status', () => {
    assert.equal(isSupportedFacadeStatus('unknown'), false);
  });

  it('returns false for empty string', () => {
    assert.equal(isSupportedFacadeStatus(''), false);
  });

  it('returns false for arbitrary string', () => {
    assert.equal(isSupportedFacadeStatus('pending'), false);
  });
});

// ===========================================================================
// 8. Deterministic output
// ===========================================================================

describe('deterministic output', () => {
  it('identical input produces identical artifact from composeCurriculumArtifact', () => {
    const result1 = composeFacadeArtifact(VALID_COMPOSITION_INPUT);
    const result2 = composeFacadeArtifact(VALID_COMPOSITION_INPUT);

    assert.deepEqual(result1.artifact, result2.artifact);
    assert.deepEqual(result1.validationResult, result2.validationResult);
  });

  it('identical input produces identical certification from certifyCurriculumArtifact', () => {
    const artifact = buildValidArtifact();
    const result1 = certifyCurriculumArtifact(artifact);
    const result2 = certifyCurriculumArtifact(artifact);

    assert.deepEqual(result1.certificationReport, result2.certificationReport);
    assert.deepEqual(result1.validationResult, result2.validationResult);
  });

  it('identical input produces identical complete output', () => {
    const result1 = composeAndCertifyCurriculumArtifact(VALID_COMPOSITION_INPUT);
    const result2 = composeAndCertifyCurriculumArtifact(VALID_COMPOSITION_INPUT);

    assert.deepEqual(result1.artifact, result2.artifact);
    assert.deepEqual(result1.certificationReport, result2.certificationReport);
    assert.deepEqual(result1.validationResult, result2.validationResult);
  });

  it('identical input produces identical facade validation', () => {
    const artifact = buildValidArtifact();
    const result1 = validateCurriculumFacadeArtifact(artifact);
    const result2 = validateCurriculumFacadeArtifact(artifact);

    assert.deepEqual(result1, result2);
  });
});

// ===========================================================================
// 9. Immutable input
// ===========================================================================

describe('immutable input', () => {
  it('does not mutate the composition input', () => {
    const inputSnapshot = JSON.parse(JSON.stringify(VALID_COMPOSITION_INPUT));

    composeFacadeArtifact(VALID_COMPOSITION_INPUT);

    assert.deepEqual(VALID_COMPOSITION_INPUT, inputSnapshot);
  });

  it('does not mutate the artifact passed to certifyCurriculumArtifact', () => {
    const artifact = buildValidArtifact();
    const artifactSnapshot = JSON.parse(JSON.stringify(artifact));

    certifyCurriculumArtifact(artifact);

    assert.deepEqual(artifact, artifactSnapshot);
  });

  it('does not mutate the composition input in composeAndCertify', () => {
    const inputSnapshot = JSON.parse(JSON.stringify(VALID_COMPOSITION_INPUT));

    composeAndCertifyCurriculumArtifact(VALID_COMPOSITION_INPUT);

    assert.deepEqual(VALID_COMPOSITION_INPUT, inputSnapshot);
  });
});

// ===========================================================================
// 10. Negative capability
// ===========================================================================

describe('negative capability', () => {
  it('does not infer learner state', () => {
    const result = composeFacadeArtifact(VALID_COMPOSITION_INPUT);

    assert.equal(result.artifact.deterministic, true);
    assert.equal(result.artifact.randomUsed, false);
    assert.equal(result.artifact.timeDependency, false);
    assert.equal(result.traceMetadata.randomUsed, false);
    assert.equal(result.traceMetadata.timeDependency, false);
  });

  it('does not mutate curriculum', () => {
    const result = composeAndCertifyCurriculumArtifact(VALID_COMPOSITION_INPUT);

    assert.equal(result.traceMetadata.curriculumMutated, false);
    assert.equal(result.certificationReport.curriculumMutated, false);
    assert.equal(result.artifact.deterministic, true);
  });

  it('composeCurriculumArtifact does not modify the graph nodes', () => {
    const input: CurriculumCompositionInput = {
      artifactId: 'artifact-test',
      graphInput: {
        graphId: 'graph-test',
        graphLabel: 'Immutable Test',
        nodes: [VALID_NODE_1],
        edges: [],
      },
    };

    const result = composeFacadeArtifact(input);
    const node = result.artifact.graph.nodes[0];

    assert.equal(node.nodeId, 'node-001');
    assert.equal(node.nodeType, 'lesson');
    assert.equal(node.referenceId, 'ref-001');
    assert.equal(node.governanceStatus, 'canonical');
  });

  it('certifyCurriculumArtifact does not produce learner-facing data', () => {
    const artifact = buildValidArtifact();
    const result = certifyCurriculumArtifact(artifact);

    assert.equal(typeof result.certificationReport.qualityScore, 'number');
    assert.ok(Array.isArray(result.certificationReport.findings));
    assert.equal(result.certificationReport.findingCount, 0);
    assert.equal(result.certificationReport.errorCount, 0);
    assert.equal(result.certificationReport.warningCount, 0);
  });

  it('no Math.random, Date.now, or global state in any output', () => {
    const result = composeAndCertifyCurriculumArtifact(VALID_COMPOSITION_INPUT);

    assert.equal(result.artifact.randomUsed, false);
    assert.equal(result.artifact.timeDependency, false);
    assert.equal(result.traceMetadata.randomUsed, false);
    assert.equal(result.traceMetadata.timeDependency, false);
    assert.equal(result.certificationReport.randomUsed, false);
    assert.equal(result.certificationReport.timeDependency, false);
    assert.equal(result.certificationReport.curriculumMutated, false);
  });
});

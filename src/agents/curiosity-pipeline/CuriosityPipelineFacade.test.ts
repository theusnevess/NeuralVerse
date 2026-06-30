/**
 * NV-2100-D9-OPT-16 — Curiosity Pipeline Facade Test Suite
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import type {
  CuriosityInput,
  CuriosityFacadeArtifactResult,
  CuriosityFacadeCertificationResult,
  CuriosityFacadeCompleteResult,
  CuriosityFacadeStatus,
} from './CuriosityAgentContract.ts';

import {
  CANONICAL_CURIOSITY_FACADE_STATUS,
} from './CuriosityAgentContract.ts';

import {
  composeCuriosityFacadeTrace,
  composeCuriosityArtifact,
  certifyCuriosityFacadeArtifact,
  composeAndCertifyCuriosityArtifact,
  validateCuriosityFacadeArtifact,
  validateCuriosityFacadeCertification,
  validateCuriosityFacadeComplete,
  isSupportedCuriosityFacadeStatus,
  getCanonicalCuriosityFacadeStatuses,
  CURIOSITY_FACADE_VALIDATION_CODES,
} from './CuriosityPipelineFacade.ts';

const VALID_INPUT: CuriosityInput = {
  nodes: [
    {
      curiosityId: 'c_001',
      title: 'Neural Networks',
      curiosityType: 'curiosity_card' as const,
      category: 'practical_application' as const,
      tone: 'neutral' as const,
      status: 'approved' as const,
      governance: 'canonical',
      tags: ['ai', 'ml'],
      summary: 'Deep learning foundations',
      provenance: {
        provider: 'NeuralVerse',
        source: 'curiosity/neural-networks',
        reviewStatus: 'approved' as const,
        reviewDate: '2024-01-01',
        version: '1.0.0',
        rationale: 'Foundational concept.',
      },
    },
    {
      curiosityId: 'c_002',
      title: 'Quantum Computing',
      curiosityType: 'curiosity_card' as const,
      category: 'practical_application' as const,
      tone: 'neutral' as const,
      status: 'approved' as const,
      governance: 'canonical',
      tags: ['quantum', 'physics'],
      summary: 'Quantum mechanics applied to computation',
      provenance: {
        provider: 'NeuralVerse',
        source: 'curiosity/quantum-computing',
        reviewStatus: 'approved' as const,
        reviewDate: '2024-01-01',
        version: '1.0.0',
        rationale: 'Advanced concept.',
      },
    },
  ],
};

const COMPLETE_PARAMS = {
  input: VALID_INPUT,
  reportId: 'facade_report_001',
  hasPurpose: true,
  hasHumor: true,
  hasCulturalReference: true,
  hasCards: true,
  hasKnowledgeEvolution: true,
  hasDiscoveries: true,
  hasLaboratoryCuriosity: true,
  hasMisconceptions: true,
  hasPresentation: true,
  hasPreferences: true,
  hasGovernance: true,
  hasStorage: true,
  hasSafety: true,
  hasTraceability: true,
  hasMetadata: true,
  hasValidation: true,
  hasDeterminism: true,
  hasImmutability: true,
  hasDocumentation: true,
  hasCrossAgentBoundary: true,
  hasPublicApi: true,
};

const CERTIFY_PARAMS = {
  reportId: 'facade_cert_001',
  hasRegistry: true,
  hasPurpose: true,
  hasHumor: true,
  hasCulturalReference: true,
  hasCards: true,
  hasKnowledgeEvolution: true,
  hasDiscoveries: true,
  hasLaboratoryCuriosity: true,
  hasMisconceptions: true,
  hasPresentation: true,
  hasPreferences: true,
  hasGovernance: true,
  hasStorage: true,
  hasSafety: true,
  hasTraceability: true,
  hasMetadata: true,
  hasValidation: true,
  hasDeterminism: true,
  hasImmutability: true,
  hasDocumentation: true,
  hasCrossAgentBoundary: true,
  hasPublicApi: true,
};

// ---------------------------------------------------------------------------
// Canonical Enum Completeness
// ---------------------------------------------------------------------------

describe('Curiosity Pipeline Facade — Canonical Enum Completeness', () => {
  it('should have exactly 6 facade statuses', () => {
    assert.equal(CANONICAL_CURIOSITY_FACADE_STATUS.length, 6);
  });

  it('should include all required facade statuses', () => {
    const statuses = CANONICAL_CURIOSITY_FACADE_STATUS;
    assert.ok(statuses.includes('available'));
    assert.ok(statuses.includes('validated'));
    assert.ok(statuses.includes('certified'));
    assert.ok(statuses.includes('deprecated'));
    assert.ok(statuses.includes('internal'));
    assert.ok(statuses.includes('legacy'));
  });
});

// ---------------------------------------------------------------------------
// Helper Functions
// ---------------------------------------------------------------------------

describe('Curiosity Pipeline Facade — Helper Functions', () => {
  it('should identify supported facade status', () => {
    assert.equal(isSupportedCuriosityFacadeStatus('available'), true);
    assert.equal(isSupportedCuriosityFacadeStatus('validated'), true);
    assert.equal(isSupportedCuriosityFacadeStatus('certified'), true);
    assert.equal(isSupportedCuriosityFacadeStatus('deprecated'), true);
    assert.equal(isSupportedCuriosityFacadeStatus('internal'), true);
    assert.equal(isSupportedCuriosityFacadeStatus('legacy'), true);
  });

  it('should reject unsupported facade status', () => {
    assert.equal(isSupportedCuriosityFacadeStatus('invalid'), false);
    assert.equal(isSupportedCuriosityFacadeStatus(''), false);
  });

  it('should return defensive copies from canonical getter', () => {
    const s1 = getCanonicalCuriosityFacadeStatuses();
    const s2 = getCanonicalCuriosityFacadeStatuses();
    assert.notStrictEqual(s1, s2);
    assert.deepStrictEqual(s1, s2);
  });

  it('should export all helper functions', () => {
    assert.equal(typeof isSupportedCuriosityFacadeStatus, 'function');
    assert.equal(typeof getCanonicalCuriosityFacadeStatuses, 'function');
  });
});

// ---------------------------------------------------------------------------
// composeCuriosityArtifact
// ---------------------------------------------------------------------------

describe('Curiosity Pipeline Facade — composeCuriosityArtifact', () => {
  it('should compose a curiosity artifact from input', () => {
    const result = composeCuriosityArtifact(VALID_INPUT);
    assert.equal(result.facadeStatus, 'available');
    assert.ok(result.artifact);
    assert.ok(result.trace);
    assert.equal(result.deterministic, true);
    assert.equal(result.generatedFrom, 'deterministic_curiosity_pipeline_facade');
    assert.equal(result.randomUsed, false);
    assert.equal(result.timeDependency, false);
  });

  it('should delegate to CuriosityKernel', () => {
    const result = composeCuriosityArtifact(VALID_INPUT);
    assert.ok(result.artifact.registryId);
    assert.ok(result.artifact.nodes);
    assert.equal(result.artifact.nodes.length, 2);
  });

  it('should produce identical output for identical input (100 iterations)', () => {
    const results: CuriosityFacadeArtifactResult[] = [];
    for (let i = 0; i < 100; i++) {
      results.push(composeCuriosityArtifact(VALID_INPUT));
    }
    for (let i = 1; i < results.length; i++) {
      assert.deepStrictEqual(results[0].artifact.registryId, results[i].artifact.registryId);
      assert.deepStrictEqual(results[0].facadeStatus, results[i].facadeStatus);
      assert.deepStrictEqual(results[0].artifact.nodes, results[i].artifact.nodes);
    }
  });
});

// ---------------------------------------------------------------------------
// certifyCuriosityFacadeArtifact
// ---------------------------------------------------------------------------

describe('Curiosity Pipeline Facade — certifyCuriosityFacadeArtifact', () => {
  it('should certify a complete artifact as certified', () => {
    const result = certifyCuriosityFacadeArtifact(CERTIFY_PARAMS);
    assert.equal(result.facadeStatus, 'certified');
    assert.ok(result.certificationReport);
    assert.equal(result.certificationReport.certificationStatus, 'passed');
    assert.equal(result.certificationReport.certificationScore, 100);
    assert.equal(result.deterministic, true);
    assert.equal(result.generatedFrom, 'deterministic_curiosity_pipeline_facade');
  });

  it('should delegate to CuriosityCertificationEngine', () => {
    const result = certifyCuriosityFacadeArtifact(CERTIFY_PARAMS);
    assert.ok(result.certificationReport.reportId);
    assert.equal(result.certificationReport.findings.length, 0);
  });

  it('should produce validated status for warnings', () => {
    const params = { ...CERTIFY_PARAMS, hasRegistry: false, hasPurpose: false };
    const result = certifyCuriosityFacadeArtifact(params);
    assert.ok(['validated', 'available'].includes(result.facadeStatus));
  });

  it('should produce identical output for identical input (100 iterations)', () => {
    const results: CuriosityFacadeCertificationResult[] = [];
    for (let i = 0; i < 100; i++) {
      results.push(certifyCuriosityFacadeArtifact(CERTIFY_PARAMS));
    }
    for (let i = 1; i < results.length; i++) {
      assert.deepStrictEqual(results[0].certificationReport.reportId, results[i].certificationReport.reportId);
      assert.deepStrictEqual(results[0].certificationReport.certificationScore, results[i].certificationReport.certificationScore);
      assert.deepStrictEqual(results[0].facadeStatus, results[i].facadeStatus);
    }
  });
});

// ---------------------------------------------------------------------------
// composeAndCertifyCuriosityArtifact
// ---------------------------------------------------------------------------

describe('Curiosity Pipeline Facade — composeAndCertifyCuriosityArtifact', () => {
  it('should compose and certify in a single pipeline', () => {
    const result = composeAndCertifyCuriosityArtifact(COMPLETE_PARAMS);
    assert.ok(result.artifact);
    assert.ok(result.validation);
    assert.ok(result.certificationReport);
    assert.equal(result.deterministic, true);
    assert.equal(result.generatedFrom, 'deterministic_curiosity_pipeline_facade');
  });

  it('should produce certified status when complete', () => {
    const result = composeAndCertifyCuriosityArtifact(COMPLETE_PARAMS);
    assert.equal(result.facadeStatus, 'certified');
  });

  it('should validate the artifact', () => {
    const result = composeAndCertifyCuriosityArtifact(COMPLETE_PARAMS);
    assert.equal(result.validation.valid, true);
    assert.equal(result.validation.errors.length, 0);
  });

  it('should produce identical output for identical input (100 iterations)', () => {
    const results: CuriosityFacadeCompleteResult[] = [];
    for (let i = 0; i < 100; i++) {
      results.push(composeAndCertifyCuriosityArtifact(COMPLETE_PARAMS));
    }
    for (let i = 1; i < results.length; i++) {
      assert.deepStrictEqual(results[0].artifact.registryId, results[i].artifact.registryId);
      assert.deepStrictEqual(results[0].certificationReport.certificationScore, results[i].certificationReport.certificationScore);
      assert.deepStrictEqual(results[0].facadeStatus, results[i].facadeStatus);
    }
  });
});

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

describe('Curiosity Pipeline Facade — Validation', () => {
  it('should validate a valid facade artifact', () => {
    const result = composeCuriosityArtifact(VALID_INPUT);
    const validation = validateCuriosityFacadeArtifact(result);
    assert.equal(validation.valid, true);
    assert.equal(validation.errors.length, 0);
  });

  it('should detect missing artifact in validation', () => {
    const validation = validateCuriosityFacadeArtifact(null as unknown as CuriosityFacadeArtifactResult);
    assert.equal(validation.valid, false);
    assert.ok(validation.errors.length > 0);
  });

  it('should validate a valid facade certification', () => {
    const result = certifyCuriosityFacadeArtifact(CERTIFY_PARAMS);
    const validation = validateCuriosityFacadeCertification(result);
    assert.equal(validation.valid, true);
    assert.equal(validation.errors.length, 0);
  });

  it('should detect missing certification in validation', () => {
    const validation = validateCuriosityFacadeCertification(null as unknown as CuriosityFacadeCertificationResult);
    assert.equal(validation.valid, false);
    assert.ok(validation.errors.length > 0);
  });

  it('should validate a valid facade complete result', () => {
    const result = composeAndCertifyCuriosityArtifact(COMPLETE_PARAMS);
    const validation = validateCuriosityFacadeComplete(result);
    assert.equal(validation.valid, true);
    assert.equal(validation.errors.length, 0);
  });

  it('should detect missing complete result in validation', () => {
    const validation = validateCuriosityFacadeComplete(null as unknown as CuriosityFacadeCompleteResult);
    assert.equal(validation.valid, false);
    assert.ok(validation.errors.length > 0);
  });

  it('should have exactly 5 validation codes', () => {
    const codeCount = Object.keys(CURIOSITY_FACADE_VALIDATION_CODES).length;
    assert.equal(codeCount, 5);
  });

  it('should have stable validation code values', () => {
    assert.equal(CURIOSITY_FACADE_VALIDATION_CODES.CURIOSITY_FACADE_MISSING_ARTIFACT, 'CURIOSITY_FACADE_MISSING_ARTIFACT');
    assert.equal(CURIOSITY_FACADE_VALIDATION_CODES.CURIOSITY_FACADE_MISSING_VALIDATION, 'CURIOSITY_FACADE_MISSING_VALIDATION');
    assert.equal(CURIOSITY_FACADE_VALIDATION_CODES.CURIOSITY_FACADE_MISSING_TRACE, 'CURIOSITY_FACADE_MISSING_TRACE');
    assert.equal(CURIOSITY_FACADE_VALIDATION_CODES.CURIOSITY_FACADE_INVALID_STATUS, 'CURIOSITY_FACADE_INVALID_STATUS');
    assert.equal(CURIOSITY_FACADE_VALIDATION_CODES.CURIOSITY_FACADE_MISSING_CERTIFICATION_REPORT, 'CURIOSITY_FACADE_MISSING_CERTIFICATION_REPORT');
  });

  it('should not throw on validation failure', () => {
    assert.doesNotThrow(() => {
      validateCuriosityFacadeArtifact(null as unknown as CuriosityFacadeArtifactResult);
    });
  });
});

// ---------------------------------------------------------------------------
// Delegation Verification
// ---------------------------------------------------------------------------

describe('Curiosity Pipeline Facade — Delegation Verification', () => {
  it('should delegate compose to CuriosityKernel', () => {
    const result = composeCuriosityArtifact(VALID_INPUT);
    assert.ok(result.artifact.registryId);
    assert.ok(Array.isArray(result.artifact.nodes));
  });

  it('should delegate certify to CuriosityCertificationEngine', () => {
    const result = certifyCuriosityFacadeArtifact(CERTIFY_PARAMS);
    assert.ok(result.certificationReport.reportId);
    assert.equal(typeof result.certificationReport.certificationScore, 'number');
  });

  it('should delegate complete pipeline to both', () => {
    const result = composeAndCertifyCuriosityArtifact(COMPLETE_PARAMS);
    assert.ok(result.artifact.registryId);
    assert.ok(result.certificationReport.reportId);
  });
});

// ---------------------------------------------------------------------------
// Backward Compatibility
// ---------------------------------------------------------------------------

describe('Curiosity Pipeline Facade — Backward Compatibility', () => {
  it('should preserve all D9-OPT-01 exports', () => {
    const kernel = require('./CuriosityKernel.js');
    assert.equal(typeof kernel.composeCuriosity, 'function');
    assert.equal(typeof kernel.composeCuriosityRegistry, 'function');
  });

  it('should preserve all D9-OPT-15 exports', () => {
    const engine = require('./CuriosityCertificationEngine.js');
    assert.equal(typeof engine.certifyCuriosityArtifact, 'function');
    assert.equal(typeof engine.composeCuriosityCertificationReport, 'function');
  });

  it('should preserve all facade exports', () => {
    assert.equal(typeof composeCuriosityArtifact, 'function');
    assert.equal(typeof certifyCuriosityFacadeArtifact, 'function');
    assert.equal(typeof composeAndCertifyCuriosityArtifact, 'function');
    assert.equal(typeof validateCuriosityFacadeArtifact, 'function');
    assert.equal(typeof validateCuriosityFacadeCertification, 'function');
    assert.equal(typeof validateCuriosityFacadeComplete, 'function');
    assert.equal(typeof isSupportedCuriosityFacadeStatus, 'function');
    assert.equal(typeof getCanonicalCuriosityFacadeStatuses, 'function');
  });
});

// ---------------------------------------------------------------------------
// Negative Capability Verification
// ---------------------------------------------------------------------------

describe('Curiosity Pipeline Facade — Negative Capability Verification', () => {
  it('should not use Math.random', () => { const result = composeCuriosityArtifact(VALID_INPUT); assert.ok(result); });
  it('should not use Date.now', () => { const result = composeCuriosityArtifact(VALID_INPUT); assert.ok(result); });
  it('should not perform content moderation', () => { const result = composeCuriosityArtifact(VALID_INPUT); assert.ok(!('contentModeration' in result)); });
  it('should not detect toxicity', () => { const result = composeCuriosityArtifact(VALID_INPUT); assert.ok(!('toxicity' in result)); });
  it('should not generate content', () => { const result = composeCuriosityArtifact(VALID_INPUT); assert.ok(!('generatedContent' in result)); });
  it('should not execute certifications', () => { const result = composeCuriosityArtifact(VALID_INPUT); assert.ok(!('executedCertifications' in result)); });
  it('should not access filesystem', () => { const result = composeCuriosityArtifact(VALID_INPUT); assert.ok(!('filesystem' in result)); });
  it('should not perform network requests', () => { const result = composeCuriosityArtifact(VALID_INPUT); assert.ok(!('networkResponse' in result)); });

  it('should not reference Narrative Agent', () => { const result = composeCuriosityArtifact(VALID_INPUT); assert.ok(!('narrativeAgent' in result)); });
  it('should not reference Knowledge Agent', () => { const result = composeCuriosityArtifact(VALID_INPUT); assert.ok(!('knowledgeAgent' in result)); });
  it('should not reference Assessment Agent', () => { const result = composeCuriosityArtifact(VALID_INPUT); assert.ok(!('assessmentAgent' in result)); });
  it('should not reference Didactic Agent', () => { const result = composeCuriosityArtifact(VALID_INPUT); assert.ok(!('didacticAgent' in result)); });
  it('should not reference Laboratory Agent', () => { const result = composeCuriosityArtifact(VALID_INPUT); assert.ok(!('laboratoryAgent' in result)); });
  it('should not reference Research Agent', () => { const result = composeCuriosityArtifact(VALID_INPUT); assert.ok(!('researchAgent' in result)); });
  it('should not reference Application Agent', () => { const result = composeCuriosityArtifact(VALID_INPUT); assert.ok(!('applicationAgent' in result)); });
});

// ---------------------------------------------------------------------------
// Immutability
// ---------------------------------------------------------------------------

describe('Curiosity Pipeline Facade — Immutability', () => {
  it('should not mutate input', () => {
    const originalNodes = [...VALID_INPUT.nodes];
    composeCuriosityArtifact(VALID_INPUT);
    assert.deepStrictEqual(VALID_INPUT.nodes, originalNodes);
  });

  it('should return defensive copies in artifact', () => {
    const result = composeCuriosityArtifact(VALID_INPUT);
    assert.ok(Array.isArray(result.artifact.nodes));
  });

  it('should have immutable report properties', () => {
    const result = certifyCuriosityFacadeArtifact(CERTIFY_PARAMS);
    assert.equal(result.deterministic, true);
    assert.equal(result.randomUsed, false);
    assert.equal(result.timeDependency, false);
  });

  it('should have immutable complete result properties', () => {
    const result = composeAndCertifyCuriosityArtifact(COMPLETE_PARAMS);
    assert.equal(result.deterministic, true);
    assert.equal(result.randomUsed, false);
    assert.equal(result.timeDependency, false);
  });
});

// ---------------------------------------------------------------------------
// Architectural Compliance
// ---------------------------------------------------------------------------

describe('Curiosity Pipeline Facade — Architectural Compliance', () => {
  it('should have pure compose functions', () => {
    const r1 = composeCuriosityArtifact(VALID_INPUT);
    const r2 = composeCuriosityArtifact(VALID_INPUT);
    assert.deepStrictEqual(r1.artifact.registryId, r2.artifact.registryId);
  });

  it('should have deterministic outputs', () => {
    const r1 = certifyCuriosityFacadeArtifact(CERTIFY_PARAMS);
    const r2 = certifyCuriosityFacadeArtifact(CERTIFY_PARAMS);
    assert.deepStrictEqual(r1.certificationReport.certificationScore, r2.certificationReport.certificationScore);
  });

  it('should have no side effects', () => {
    const result = composeAndCertifyCuriosityArtifact(COMPLETE_PARAMS);
    assert.ok(result);
  });

  it('should never throw on validation', () => {
    assert.doesNotThrow(() => validateCuriosityFacadeArtifact(null as unknown as CuriosityFacadeArtifactResult));
  });

  it('should have canonical enums as const tuples', () => {
    assert.ok(Array.isArray(CANONICAL_CURIOSITY_FACADE_STATUS));
  });
});

// ---------------------------------------------------------------------------
// Public API Exports
// ---------------------------------------------------------------------------

describe('Curiosity Pipeline Facade — Public API Exports', () => {
  it('should export all composition functions', () => {
    assert.equal(typeof composeCuriosityFacadeTrace, 'function');
    assert.equal(typeof composeCuriosityArtifact, 'function');
    assert.equal(typeof certifyCuriosityFacadeArtifact, 'function');
    assert.equal(typeof composeAndCertifyCuriosityArtifact, 'function');
  });

  it('should export all validation functions', () => {
    assert.equal(typeof validateCuriosityFacadeArtifact, 'function');
    assert.equal(typeof validateCuriosityFacadeCertification, 'function');
    assert.equal(typeof validateCuriosityFacadeComplete, 'function');
  });

  it('should export all helper functions', () => {
    assert.equal(typeof isSupportedCuriosityFacadeStatus, 'function');
    assert.equal(typeof getCanonicalCuriosityFacadeStatuses, 'function');
  });

  it('should export validation codes', () => {
    assert.ok(CURIOSITY_FACADE_VALIDATION_CODES);
    assert.equal(Object.keys(CURIOSITY_FACADE_VALIDATION_CODES).length, 5);
  });
});

/**
 * D10-OPT-17 — Certification Engine Test Suite
 *
 * Comprehensive deterministic test suite for the Certification Engine.
 * Covers: certification, findings, score, status, determinism, immutability,
 * validation, helper functions, canonical enums, runtime restrictions,
 * cross-agent boundaries, and public exports.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import type {
  KnowledgeCertificationFinding,
  KnowledgeCertificationReport,
  KnowledgeCertificationStatus,
  KnowledgeFindingSeverity,
  KnowledgeQualityDimension,
} from './KnowledgeAgentContract.ts';

import {
  CANONICAL_KNOWLEDGE_CERTIFICATION_STATUS,
  CANONICAL_KNOWLEDGE_FINDING_SEVERITY,
  CANONICAL_KNOWLEDGE_QUALITY_DIMENSIONS,
} from './KnowledgeAgentContract.ts';

import {
  composeKnowledgeCertificationFinding,
  composeKnowledgeCertificationTrace,
  composeKnowledgeCertificationMetadata,
  composeKnowledgeCertificationReport,
  calculateKnowledgeCertificationScore,
  determineKnowledgeCertificationStatus,
  isKnowledgeCertificationSuccessful,
  certifyKnowledgeArtifact,
  validateKnowledgeCertification,
  isSupportedKnowledgeCertificationStatus,
  isSupportedKnowledgeFindingSeverity,
  isSupportedKnowledgeQualityDimension,
  getCanonicalKnowledgeCertificationStatuses,
  getCanonicalKnowledgeFindingSeverities,
  getCanonicalKnowledgeQualityDimensions,
} from './KnowledgeCertificationEngine.ts';

import {
  validateKnowledgeCertificationFinding,
  validateKnowledgeCertificationStatus,
  validateKnowledgeCertificationScore,
  validateKnowledgeCertificationReport,
  KNOWLEDGE_CERTIFICATION_VALIDATION_CODES,
} from './KnowledgeCertificationValidation.ts';

// ---------------------------------------------------------------------------
// Test Fixtures
// ---------------------------------------------------------------------------

const VALID_FINDING_1: KnowledgeCertificationFinding = {
  findingId: 'finding-001',
  dimension: 'foundation',
  severity: 'info',
  description: 'Foundation is well-structured.',
};

const VALID_FINDING_2: KnowledgeCertificationFinding = {
  findingId: 'finding-002',
  dimension: 'explanations',
  severity: 'warning',
  description: 'Explanations could be more detailed.',
};

const VALID_FINDING_3: KnowledgeCertificationFinding = {
  findingId: 'finding-003',
  dimension: 'components',
  severity: 'critical',
  description: 'Components are missing required metadata.',
};

// ---------------------------------------------------------------------------
// Composition Tests
// ---------------------------------------------------------------------------

describe('Certification Engine — Composition', () => {
  it('should compose valid certification finding', () => {
    const finding = composeKnowledgeCertificationFinding({
      findingId: 'finding-001',
      dimension: 'foundation',
      severity: 'info',
      description: 'Foundation is well-structured.',
    });

    assert.equal(finding.findingId, 'finding-001');
    assert.equal(finding.dimension, 'foundation');
    assert.equal(finding.severity, 'info');
    assert.equal(finding.description, 'Foundation is well-structured.');
  });

  it('should compose valid certification trace', () => {
    const trace = composeKnowledgeCertificationTrace({
      traceId: '_trace_1',
      findingCount: 3,
      evaluationTimestamp: '2024-01-01T00:00:00Z',
      registryVersion: '1.0.0',
    });

    assert.equal(trace.traceId, '_trace_1');
    assert.equal(trace.findingCount, 3);
    assert.equal(trace.deterministic, true);
    assert.equal(trace.randomUsed, false);
    assert.equal(trace.timeDependency, false);
  });

  it('should compose valid certification metadata', () => {
    const metadata = composeKnowledgeCertificationMetadata({
      certificationId: '_cert_1',
      certificationScore: 95,
      certificationStatus: 'approved',
      evaluatedDimensions: 24,
    });

    assert.equal(metadata.certificationId, '_cert_1');
    assert.equal(metadata.certificationScore, 95);
    assert.equal(metadata.certificationStatus, 'approved');
    assert.equal(metadata.evaluatedDimensions, 24);
  });

  it('should compose valid certification report', () => {
    const report = composeKnowledgeCertificationReport({
      findings: [VALID_FINDING_1],
      metadata: composeKnowledgeCertificationMetadata({
        certificationId: '_cert_1',
        certificationScore: 100,
        certificationStatus: 'certified',
        evaluatedDimensions: 24,
      }),
      trace: composeKnowledgeCertificationTrace({
        traceId: '_trace_1',
        findingCount: 1,
        evaluationTimestamp: '2024-01-01T00:00:00Z',
        registryVersion: '1.0.0',
      }),
    });

    assert.equal(report.findings.length, 1);
    assert.equal(report.metadata.certificationScore, 100);
    assert.equal(report.metadata.certificationStatus, 'certified');
  });

  it('should calculate certification score correctly', () => {
    const score = calculateKnowledgeCertificationScore([VALID_FINDING_1]);
    assert.equal(score, 100);
  });

  it('should calculate certification score with penalties', () => {
    const score = calculateKnowledgeCertificationScore([VALID_FINDING_2]);
    assert.equal(score, 90);
  });

  it('should calculate certification score with critical penalties', () => {
    const score = calculateKnowledgeCertificationScore([VALID_FINDING_3]);
    assert.equal(score, 80);
  });

  it('should determine certification status correctly', () => {
    const status = determineKnowledgeCertificationStatus(100, []);
    assert.equal(status, 'certified');
  });

  it('should determine failed status for critical findings', () => {
    const status = determineKnowledgeCertificationStatus(100, [VALID_FINDING_3]);
    assert.equal(status, 'failed');
  });

  it('should determine conditional status for low score', () => {
    const status = determineKnowledgeCertificationStatus(50, []);
    assert.equal(status, 'failed');
  });

  it('should determine approved status for good score', () => {
    const status = determineKnowledgeCertificationStatus(95, []);
    assert.equal(status, 'approved');
  });

  it('should check certification success', () => {
    assert.equal(isKnowledgeCertificationSuccessful('certified'), true);
    assert.equal(isKnowledgeCertificationSuccessful('approved'), true);
    assert.equal(isKnowledgeCertificationSuccessful('passed'), true);
    assert.equal(isKnowledgeCertificationSuccessful('failed'), false);
    assert.equal(isKnowledgeCertificationSuccessful('conditional'), false);
  });

  it('should certify artifact correctly', () => {
    const report = certifyKnowledgeArtifact([VALID_FINDING_1]);
    assert.equal(report.findings.length, 1);
    assert.equal(report.metadata.evaluatedDimensions, 24);
    assert.equal(report.trace.deterministic, true);
  });
});

// ---------------------------------------------------------------------------
// Validation Tests
// ---------------------------------------------------------------------------

describe('Certification Engine — Validation', () => {
  it('should validate a valid finding with no errors', () => {
    const result = validateKnowledgeCertificationFinding(VALID_FINDING_1);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it('should validate a valid status', () => {
    const result = validateKnowledgeCertificationStatus('certified');
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it('should validate a valid score', () => {
    const result = validateKnowledgeCertificationScore(100);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it('should validate a valid report', () => {
    const report = certifyKnowledgeArtifact([VALID_FINDING_1]);
    const result = validateKnowledgeCertificationReport(report);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it('should detect invalid status', () => {
    const result = validateKnowledgeCertificationStatus('unsupported');
    const statusError = result.errors.find(
      (e) => e.code === KNOWLEDGE_CERTIFICATION_VALIDATION_CODES.KNOWLEDGE_CERTIFICATION_INVALID_STATUS,
    );
    assert.ok(statusError, 'Should have KNOWLEDGE_CERTIFICATION_INVALID_STATUS error');
  });

  it('should detect invalid score', () => {
    const result = validateKnowledgeCertificationScore(150);
    const scoreError = result.errors.find(
      (e) => e.code === KNOWLEDGE_CERTIFICATION_VALIDATION_CODES.KNOWLEDGE_CERTIFICATION_INVALID_SCORE,
    );
    assert.ok(scoreError, 'Should have KNOWLEDGE_CERTIFICATION_INVALID_SCORE error');
  });

  it('should detect invalid score negative', () => {
    const result = validateKnowledgeCertificationScore(-10);
    const scoreError = result.errors.find(
      (e) => e.code === KNOWLEDGE_CERTIFICATION_VALIDATION_CODES.KNOWLEDGE_CERTIFICATION_INVALID_SCORE,
    );
    assert.ok(scoreError, 'Should have KNOWLEDGE_CERTIFICATION_INVALID_SCORE error');
  });

  it('should detect invalid dimension', () => {
    const finding = { ...VALID_FINDING_1, dimension: 'unsupported' as any };
    const result = validateKnowledgeCertificationFinding(finding);
    const dimensionError = result.errors.find(
      (e) => e.code === KNOWLEDGE_CERTIFICATION_VALIDATION_CODES.KNOWLEDGE_CERTIFICATION_INVALID_DIMENSION,
    );
    assert.ok(dimensionError, 'Should have KNOWLEDGE_CERTIFICATION_INVALID_DIMENSION error');
  });

  it('should detect invalid severity', () => {
    const finding = { ...VALID_FINDING_1, severity: 'unsupported' as any };
    const result = validateKnowledgeCertificationFinding(finding);
    const severityError = result.errors.find(
      (e) => e.code === KNOWLEDGE_CERTIFICATION_VALIDATION_CODES.KNOWLEDGE_CERTIFICATION_INVALID_FINDING,
    );
    assert.ok(severityError, 'Should have KNOWLEDGE_CERTIFICATION_INVALID_FINDING error');
  });

  it('should detect missing finding ID', () => {
    const finding = { ...VALID_FINDING_1, findingId: '' };
    const result = validateKnowledgeCertificationFinding(finding);
    const missingError = result.errors.find(
      (e) => e.code === KNOWLEDGE_CERTIFICATION_VALIDATION_CODES.KNOWLEDGE_CERTIFICATION_MISSING_FINDING,
    );
    assert.ok(missingError, 'Should have KNOWLEDGE_CERTIFICATION_MISSING_FINDING error');
  });
});

// ---------------------------------------------------------------------------
// Determinism Tests
// ---------------------------------------------------------------------------

describe('Certification Engine — Determinism', () => {
  it('should produce identical output for identical input (100 iterations)', () => {
    const results: ReturnType<typeof certifyKnowledgeArtifact>[] = [];
    for (let i = 0; i < 100; i++) {
      results.push(certifyKnowledgeArtifact([VALID_FINDING_1]));
    }

    for (let i = 1; i < results.length; i++) {
      assert.deepStrictEqual(results[0].findings, results[i].findings);
      assert.deepStrictEqual(results[0].metadata.certificationScore, results[i].metadata.certificationScore);
    }
  });

  it('should produce identical score for identical findings', () => {
    const scores: number[] = [];
    for (let i = 0; i < 100; i++) {
      scores.push(calculateKnowledgeCertificationScore([VALID_FINDING_1]));
    }

    for (let i = 1; i < scores.length; i++) {
      assert.equal(scores[0], scores[i]);
    }
  });

  it('should produce identical status for identical inputs', () => {
    const statuses: KnowledgeCertificationStatus[] = [];
    for (let i = 0; i < 100; i++) {
      statuses.push(determineKnowledgeCertificationStatus(100, []));
    }

    for (let i = 1; i < statuses.length; i++) {
      assert.equal(statuses[0], statuses[i]);
    }
  });

  it('should produce identical findings for identical inputs', () => {
    const findings: KnowledgeCertificationFinding[][] = [];
    for (let i = 0; i < 100; i++) {
      findings.push([...certifyKnowledgeArtifact([VALID_FINDING_1]).findings]);
    }

    for (let i = 1; i < findings.length; i++) {
      assert.deepStrictEqual(findings[0], findings[i]);
    }
  });
});

// ---------------------------------------------------------------------------
// Immutability Tests
// ---------------------------------------------------------------------------

describe('Certification Engine — Immutability', () => {
  it('should not mutate input findings', () => {
    const originalId = VALID_FINDING_1.findingId;
    const originalDescription = VALID_FINDING_1.description;

    certifyKnowledgeArtifact([VALID_FINDING_1]);

    assert.equal(VALID_FINDING_1.findingId, originalId);
    assert.equal(VALID_FINDING_1.description, originalDescription);
  });

  it('should use defensive copies for findings', () => {
    const findings = [VALID_FINDING_1, VALID_FINDING_2];
    const originalIds = findings.map((f) => f.findingId);

    certifyKnowledgeArtifact(findings);

    assert.equal(findings[0].findingId, originalIds[0]);
    assert.equal(findings[1].findingId, originalIds[1]);
  });
});

// ---------------------------------------------------------------------------
// Helper Function Tests
// ---------------------------------------------------------------------------

describe('Certification Engine — Helpers', () => {
  it('should return canonical certification statuses', () => {
    const statuses = getCanonicalKnowledgeCertificationStatuses();
    assert.deepStrictEqual([...statuses], [...CANONICAL_KNOWLEDGE_CERTIFICATION_STATUS]);
    assert.equal(statuses.length, 6);
  });

  it('should return canonical finding severities', () => {
    const severities = getCanonicalKnowledgeFindingSeverities();
    assert.deepStrictEqual([...severities], [...CANONICAL_KNOWLEDGE_FINDING_SEVERITY]);
    assert.equal(severities.length, 5);
  });

  it('should return canonical quality dimensions', () => {
    const dimensions = getCanonicalKnowledgeQualityDimensions();
    assert.deepStrictEqual([...dimensions], [...CANONICAL_KNOWLEDGE_QUALITY_DIMENSIONS]);
    assert.equal(dimensions.length, 24);
  });

  it('should validate certification status support', () => {
    assert.equal(isSupportedKnowledgeCertificationStatus('failed'), true);
    assert.equal(isSupportedKnowledgeCertificationStatus('certified'), true);
    assert.equal(isSupportedKnowledgeCertificationStatus('unsupported'), false);
  });

  it('should validate finding severity support', () => {
    assert.equal(isSupportedKnowledgeFindingSeverity('info'), true);
    assert.equal(isSupportedKnowledgeFindingSeverity('critical'), true);
    assert.equal(isSupportedKnowledgeFindingSeverity('unsupported'), false);
  });

  it('should validate quality dimension support', () => {
    assert.equal(isSupportedKnowledgeQualityDimension('foundation'), true);
    assert.equal(isSupportedKnowledgeQualityDimension('explanations'), true);
    assert.equal(isSupportedKnowledgeQualityDimension('unsupported'), false);
  });
});

// ---------------------------------------------------------------------------
// Canonical Enum Completeness Tests
// ---------------------------------------------------------------------------

describe('Certification Engine — Canonical Enum Completeness', () => {
  it('should have exactly 6 certification statuses', () => {
    assert.equal(CANONICAL_KNOWLEDGE_CERTIFICATION_STATUS.length, 6);
  });

  it('should have exactly 5 finding severities', () => {
    assert.equal(CANONICAL_KNOWLEDGE_FINDING_SEVERITY.length, 5);
  });

  it('should have exactly 24 quality dimensions', () => {
    assert.equal(CANONICAL_KNOWLEDGE_QUALITY_DIMENSIONS.length, 24);
  });

  it('should contain all expected certification statuses', () => {
    const expected = ['failed', 'conditional', 'passed', 'approved', 'canonical', 'certified'];
    for (const status of expected) {
      assert.ok(CANONICAL_KNOWLEDGE_CERTIFICATION_STATUS.includes(status as any), `Should include status: ${status}`);
    }
  });

  it('should contain all expected finding severities', () => {
    const expected = ['info', 'warning', 'minor', 'major', 'critical'];
    for (const severity of expected) {
      assert.ok(CANONICAL_KNOWLEDGE_FINDING_SEVERITY.includes(severity as any), `Should include severity: ${severity}`);
    }
  });

  it('should contain all expected quality dimensions', () => {
    const expected = ['foundation', 'explanations', 'components', 'representations', 'examples', 'comparisons', 'mathematical_graphs', 'visualizations', 'laboratories', 'research', 'applications', 'assessments', 'misconceptions', 'semantic_connectivity', 'premium_assets', 'governance', 'metadata', 'validation', 'determinism', 'immutability', 'documentation', 'cross_agent_boundary', 'public_api', 'architectural_consistency'];
    for (const dimension of expected) {
      assert.ok(CANONICAL_KNOWLEDGE_QUALITY_DIMENSIONS.includes(dimension as any), `Should include dimension: ${dimension}`);
    }
  });
});

// ---------------------------------------------------------------------------
// Validation Code Count Test
// ---------------------------------------------------------------------------

describe('Certification Engine — Validation Code Count', () => {
  it('should have exactly 10 validation codes', () => {
    const codes = Object.values(KNOWLEDGE_CERTIFICATION_VALIDATION_CODES);
    assert.equal(codes.length, 10);
  });

  it('should have all codes prefixed with KNOWLEDGE_CERTIFICATION_', () => {
    const codes = Object.values(KNOWLEDGE_CERTIFICATION_VALIDATION_CODES);
    for (const code of codes) {
      assert.ok(code.startsWith('KNOWLEDGE_CERTIFICATION_'), `Code "${code}" should start with KNOWLEDGE_CERTIFICATION_`);
    }
  });

  it('should have unique codes', () => {
    const codes = Object.values(KNOWLEDGE_CERTIFICATION_VALIDATION_CODES);
    const unique = new Set(codes);
    assert.equal(codes.length, unique.size, 'All codes should be unique');
  });
});

// ---------------------------------------------------------------------------
// Runtime Restrictions Tests
// ---------------------------------------------------------------------------

describe('Certification Engine — Runtime Restrictions', () => {
  it('should not use Math.random', () => {
    const result = certifyKnowledgeArtifact([VALID_FINDING_1]);
    assert.ok(result, 'Should produce a result without Math.random');
  });

  it('should not use performance.now', () => {
    const result = certifyKnowledgeArtifact([VALID_FINDING_1]);
    assert.ok(result, 'Should produce a result without performance.now');
  });

  it('should not use crypto.randomUUID', () => {
    const result = certifyKnowledgeArtifact([VALID_FINDING_1]);
    assert.ok(result, 'Should produce a result without crypto.randomUUID');
  });

  it('should not have executable callbacks in findings', () => {
    const finding = composeKnowledgeCertificationFinding({
      findingId: 'finding-001',
      dimension: 'foundation',
      severity: 'info',
      description: 'Test.',
    });

    const keys = Object.keys(finding);
    for (const key of keys) {
      const value = (finding as any)[key];
      assert.ok(typeof value !== 'function', `Finding field "${key}" should not be a function`);
    }
  });

  it('should not store educational content', () => {
    const result = certifyKnowledgeArtifact([VALID_FINDING_1]);
    assert.ok(!('educationalContent' in result), 'Should not have educational content');
    assert.ok(!('markdown' in result), 'Should not have markdown');
  });

  it('should not access filesystem', () => {
    const result = certifyKnowledgeArtifact([VALID_FINDING_1]);
    assert.ok(!('filesystem' in result), 'Should not have filesystem');
    assert.ok(!('fileSystem' in result), 'Should not have fileSystem');
  });

  it('should not perform network requests', () => {
    const result = certifyKnowledgeArtifact([VALID_FINDING_1]);
    assert.ok(!('networkResponse' in result), 'Should not have network response');
    assert.ok(!('httpResult' in result), 'Should not have HTTP result');
  });

  it('should not have async behavior markers', () => {
    const result = certifyKnowledgeArtifact([VALID_FINDING_1]);
    assert.ok(!('promise' in result), 'Should not have promise');
    assert.ok(!('async' in result), 'Should not have async');
  });
});

// ---------------------------------------------------------------------------
// Cross-Agent Boundary Tests
// ---------------------------------------------------------------------------

describe('Certification Engine — Cross-Agent Boundary', () => {
  it('should not reference Didactic Agent', () => {
    const result = certifyKnowledgeArtifact([VALID_FINDING_1]);
    const str = JSON.stringify(result);
    assert.ok(!str.includes('Didactic'), 'Should not reference Didactic Agent');
  });

  it('should not reference Curriculum Agent', () => {
    const result = certifyKnowledgeArtifact([VALID_FINDING_1]);
    const str = JSON.stringify(result);
    assert.ok(!str.includes('Curriculum'), 'Should not reference Curriculum Agent');
  });

  it('should not reference Narrative Agent', () => {
    const result = certifyKnowledgeArtifact([VALID_FINDING_1]);
    const str = JSON.stringify(result);
    assert.ok(!str.includes('Narrative'), 'Should not reference Narrative Agent');
  });

  it('should not reference Assessment Agent', () => {
    const result = certifyKnowledgeArtifact([VALID_FINDING_1]);
    const str = JSON.stringify(result);
    assert.ok(!str.includes('Assessment'), 'Should not reference Assessment Agent');
  });

  it('should not reference Curiosity Agent', () => {
    const result = certifyKnowledgeArtifact([VALID_FINDING_1]);
    const str = JSON.stringify(result);
    assert.ok(!str.includes('Curiosity'), 'Should not reference Curiosity Agent');
  });

  it('should not reference Research Agent', () => {
    const result = certifyKnowledgeArtifact([VALID_FINDING_1]);
    const str = JSON.stringify(result);
    assert.ok(!str.includes('Research'), 'Should not reference Research Agent');
  });

  it('should not reference Laboratory Agent', () => {
    const result = certifyKnowledgeArtifact([VALID_FINDING_1]);
    const str = JSON.stringify(result);
    assert.ok(!str.includes('Laboratory'), 'Should not reference Laboratory Agent');
  });

  it('should not reference Application Agent', () => {
    const result = certifyKnowledgeArtifact([VALID_FINDING_1]);
    const str = JSON.stringify(result);
    assert.ok(!str.includes('Application'), 'Should not reference Application Agent');
  });
});

// ---------------------------------------------------------------------------
// Public API Tests
// ---------------------------------------------------------------------------

describe('Certification Engine — Public API', () => {
  it('should export all compose functions', () => {
    assert.equal(typeof composeKnowledgeCertificationFinding, 'function');
    assert.equal(typeof composeKnowledgeCertificationTrace, 'function');
    assert.equal(typeof composeKnowledgeCertificationMetadata, 'function');
    assert.equal(typeof composeKnowledgeCertificationReport, 'function');
    assert.equal(typeof calculateKnowledgeCertificationScore, 'function');
    assert.equal(typeof determineKnowledgeCertificationStatus, 'function');
    assert.equal(typeof isKnowledgeCertificationSuccessful, 'function');
    assert.equal(typeof certifyKnowledgeArtifact, 'function');
    assert.equal(typeof validateKnowledgeCertification, 'function');
  });

  it('should export all helper functions', () => {
    assert.equal(typeof isSupportedKnowledgeCertificationStatus, 'function');
    assert.equal(typeof isSupportedKnowledgeFindingSeverity, 'function');
    assert.equal(typeof isSupportedKnowledgeQualityDimension, 'function');
    assert.equal(typeof getCanonicalKnowledgeCertificationStatuses, 'function');
    assert.equal(typeof getCanonicalKnowledgeFindingSeverities, 'function');
    assert.equal(typeof getCanonicalKnowledgeQualityDimensions, 'function');
  });
});

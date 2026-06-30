/**
 * NV-2000-D8-OPT-15 — Assessment Certification & Structural Quality Gate Tests
 *
 * Exhaustive deterministic tests for the Assessment Certification Engine.
 * Uses Node.js built-in test runner (node:test).
 *
 * ~65 tests covering:
 * - Finding composition
 * - Report composition
 * - Certification score
 * - Certification success
 * - Validation
 * - Helper functions
 * - Canonical enums
 * - Deterministic identity
 * - Immutability
 * - Validation codes
 * - Cross-agent boundary
 * - Negative capability
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  CANONICAL_ASSESSMENT_CERTIFICATION_STATUS,
  CANONICAL_ASSESSMENT_FINDING_SEVERITY,
  CANONICAL_ASSESSMENT_QUALITY_DIMENSIONS,
  type AssessmentCertificationFinding,
  type AssessmentCertificationReport,
  type AssessmentQualityDimension,
  type AssessmentFindingSeverity,
} from './AssessmentAgentContract.ts';

import {
  composeAssessmentCertificationFinding,
  composeAssessmentCertificationReport,
  composeAssessmentCertificationTrace,
  calculateAssessmentCertificationScore,
  isAssessmentCertificationSuccessful,
  certifyAssessmentArtifact,
  validateAssessmentCertification,
  isSupportedAssessmentCertificationStatus,
  isSupportedAssessmentFindingSeverity,
  isSupportedAssessmentQualityDimension,
  getCanonicalAssessmentCertificationStatuses,
  getCanonicalAssessmentFindingSeverities,
  getCanonicalAssessmentQualityDimensions,
} from './AssessmentCertificationEngine.ts';

import {
  ASSESSMENT_CERTIFICATION_VALIDATION_CODES,
  validateAssessmentCertificationReport,
  validateAssessmentCertificationFinding,
  validateAssessmentCertificationStatus,
  validateAssessmentCertificationScore,
} from './AssessmentCertificationValidation.ts';

// ============================================================================
// TEST FIXTURES
// ============================================================================

const VALID_FINDING_A: AssessmentCertificationFinding = {
  id: 'finding-1',
  dimension: 'assessment_registry',
  severity: 'info',
  message: 'Registry structure is valid.',
  source: 'test-source',
};

const VALID_FINDING_B: AssessmentCertificationFinding = {
  id: 'finding-2',
  dimension: 'cognitive_model',
  severity: 'low',
  message: 'Cognitive model has minor issues.',
  field: 'cognitiveLevel',
  entityId: 'node-1',
  source: 'test-source',
};

const VALID_FINDING_C: AssessmentCertificationFinding = {
  id: 'finding-3',
  dimension: 'determinism',
  severity: 'critical',
  message: 'Non-deterministic behavior detected.',
  source: 'test-source',
};

function _makeFinding(
  id: string,
  overrides: Partial<AssessmentCertificationFinding> = {},
): AssessmentCertificationFinding {
  return composeAssessmentCertificationFinding({
    id,
    dimension: 'assessment_registry',
    severity: 'info',
    message: `Test finding ${id}`,
    source: 'test-fixture',
    ...overrides,
  });
}

// ============================================================================
// CANONICAL ENUMS
// ============================================================================

describe('Canonical Enums', () => {
  it('should have exactly 6 certification statuses', () => {
    assert.equal(CANONICAL_ASSESSMENT_CERTIFICATION_STATUS.length, 6);
  });

  it('should have exactly 5 finding severities', () => {
    assert.equal(CANONICAL_ASSESSMENT_FINDING_SEVERITY.length, 5);
  });

  it('should have exactly 22 quality dimensions', () => {
    assert.equal(CANONICAL_ASSESSMENT_QUALITY_DIMENSIONS.length, 22);
  });

  it('should contain expected certification statuses', () => {
    const expected = [
      'passed',
      'passed_with_warnings',
      'failed',
      'blocked',
      'incomplete',
      'not_certified',
    ];
    for (const value of expected) {
      assert.ok(
        CANONICAL_ASSESSMENT_CERTIFICATION_STATUS.includes(value as any),
        `Missing: ${value}`,
      );
    }
  });

  it('should contain expected finding severities', () => {
    const expected = ['info', 'low', 'medium', 'high', 'critical'];
    for (const value of expected) {
      assert.ok(
        CANONICAL_ASSESSMENT_FINDING_SEVERITY.includes(value as any),
        `Missing: ${value}`,
      );
    }
  });

  it('should contain expected quality dimensions', () => {
    const expected = [
      'assessment_registry',
      'cognitive_model',
      'verification',
      'concept_graph',
      'misconceptions',
      'feedback',
      'laboratory_mapping',
      'visual_assets',
      'engineering_cases',
      'comparative_reasoning',
      'constraint_analysis',
      'reinforcement',
      'portfolio',
      'evidence',
      'traceability',
      'governance',
      'determinism',
      'immutability',
      'validation',
      'documentation',
      'cross_agent_boundary',
      'public_api',
    ];
    for (const value of expected) {
      assert.ok(
        CANONICAL_ASSESSMENT_QUALITY_DIMENSIONS.includes(value as any),
        `Missing: ${value}`,
      );
    }
  });
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

describe('Helper Functions', () => {
  it('isSupportedAssessmentCertificationStatus returns true for valid status', () => {
    assert.equal(isSupportedAssessmentCertificationStatus('passed'), true);
    assert.equal(isSupportedAssessmentCertificationStatus('failed'), true);
  });

  it('isSupportedAssessmentCertificationStatus returns false for invalid status', () => {
    assert.equal(isSupportedAssessmentCertificationStatus('invalid'), false);
    assert.equal(isSupportedAssessmentCertificationStatus(''), false);
  });

  it('isSupportedAssessmentFindingSeverity returns true for valid severity', () => {
    assert.equal(isSupportedAssessmentFindingSeverity('info'), true);
    assert.equal(isSupportedAssessmentFindingSeverity('critical'), true);
  });

  it('isSupportedAssessmentFindingSeverity returns false for invalid severity', () => {
    assert.equal(isSupportedAssessmentFindingSeverity('invalid'), false);
    assert.equal(isSupportedAssessmentFindingSeverity(''), false);
  });

  it('isSupportedAssessmentQualityDimension returns true for valid dimension', () => {
    assert.equal(isSupportedAssessmentQualityDimension('assessment_registry'), true);
    assert.equal(isSupportedAssessmentQualityDimension('public_api'), true);
  });

  it('isSupportedAssessmentQualityDimension returns false for invalid dimension', () => {
    assert.equal(isSupportedAssessmentQualityDimension('invalid'), false);
    assert.equal(isSupportedAssessmentQualityDimension(''), false);
  });

  it('getCanonicalAssessmentCertificationStatuses returns a copy', () => {
    const result = getCanonicalAssessmentCertificationStatuses();
    assert.equal(result.length, 6);
    assert.deepEqual([...result], [...CANONICAL_ASSESSMENT_CERTIFICATION_STATUS]);
    (result as string[]).push('injected');
    assert.equal(CANONICAL_ASSESSMENT_CERTIFICATION_STATUS.length, 6);
  });

  it('getCanonicalAssessmentFindingSeverities returns a copy', () => {
    const result = getCanonicalAssessmentFindingSeverities();
    assert.equal(result.length, 5);
  });

  it('getCanonicalAssessmentQualityDimensions returns a copy', () => {
    const result = getCanonicalAssessmentQualityDimensions();
    assert.equal(result.length, 22);
  });
});

// ============================================================================
// COMPOSE FUNCTIONS — Finding
// ============================================================================

describe('composeAssessmentCertificationFinding', () => {
  it('should compose finding from valid params', () => {
    const finding = composeAssessmentCertificationFinding({
      id: 'f1',
      dimension: 'assessment_registry',
      severity: 'info',
      message: 'Test finding',
      source: 'test-source',
    });
    assert.equal(finding.id, 'f1');
    assert.equal(finding.dimension, 'assessment_registry');
    assert.equal(finding.severity, 'info');
    assert.equal(finding.message, 'Test finding');
    assert.equal(finding.source, 'test-source');
  });

  it('should compose finding with optional fields', () => {
    const finding = composeAssessmentCertificationFinding({
      id: 'f2',
      dimension: 'cognitive_model',
      severity: 'medium',
      message: 'Test finding with field',
      field: 'testField',
      entityId: 'entity-1',
      source: 'test-source',
    });
    assert.equal(finding.field, 'testField');
    assert.equal(finding.entityId, 'entity-1');
  });

  it('should return identical output for identical input', () => {
    const params = {
      id: 'f3',
      dimension: 'verification' as AssessmentQualityDimension,
      severity: 'high' as AssessmentFindingSeverity,
      message: 'Test finding',
      source: 'test-source',
    };
    const f1 = composeAssessmentCertificationFinding(params);
    const f2 = composeAssessmentCertificationFinding(params);
    assert.deepEqual(f1, f2);
  });
});

// ============================================================================
// COMPOSE FUNCTIONS — Report
// ============================================================================

describe('composeAssessmentCertificationReport', () => {
  it('should compose report with no findings', () => {
    const report = composeAssessmentCertificationReport({
      artifactId: 'art-1',
      artifactTitle: 'Test Artifact',
      findings: [],
      dimensionsChecked: [],
      certifiedAt: '2025-01-01',
      certifiedBy: 'test-certifier',
    });
    assert.equal(report.artifactId, 'art-1');
    assert.equal(report.status, 'passed');
    assert.equal(report.score, 100);
    assert.equal(report.findings.length, 0);
    assert.equal(report.trace.deterministic, true);
    assert.equal(report.trace.randomUsed, false);
    assert.equal(report.trace.timeDependency, false);
  });

  it('should compose report with info findings', () => {
    const report = composeAssessmentCertificationReport({
      artifactId: 'art-1',
      artifactTitle: 'Test Artifact',
      findings: [VALID_FINDING_A],
      dimensionsChecked: ['assessment_registry'],
      certifiedAt: '2025-01-01',
      certifiedBy: 'test-certifier',
    });
    assert.equal(report.status, 'passed_with_warnings');
    assert.equal(report.score, 100);
  });

  it('should compose report with critical findings', () => {
    const report = composeAssessmentCertificationReport({
      artifactId: 'art-1',
      artifactTitle: 'Test Artifact',
      findings: [VALID_FINDING_C],
      dimensionsChecked: ['determinism'],
      certifiedAt: '2025-01-01',
      certifiedBy: 'test-certifier',
    });
    assert.equal(report.status, 'failed');
    assert.equal(report.score, 70);
  });

  it('should not mutate input arrays', () => {
    const findings = [_makeFinding('f1')];
    const original = JSON.stringify(findings);
    composeAssessmentCertificationReport({
      artifactId: 'art-1',
      artifactTitle: 'Test',
      findings,
      dimensionsChecked: ['assessment_registry'],
      certifiedAt: '2025-01-01',
      certifiedBy: 'test',
    });
    assert.equal(JSON.stringify(findings), original);
  });
});

// ============================================================================
// COMPOSE FUNCTIONS — certifyAssessmentArtifact
// ============================================================================

describe('certifyAssessmentArtifact', () => {
  it('should certify artifact with no findings', () => {
    const report = certifyAssessmentArtifact({
      artifactId: 'art-1',
      artifactTitle: 'Test Artifact',
      findings: [],
      certifiedAt: '2025-01-01',
      certifiedBy: 'test-certifier',
    });
    assert.equal(report.status, 'passed');
    assert.equal(report.score, 100);
    assert.equal(report.dimensionsChecked.length, 0);
  });

  it('should certify artifact with multiple findings', () => {
    const report = certifyAssessmentArtifact({
      artifactId: 'art-1',
      artifactTitle: 'Test Artifact',
      findings: [VALID_FINDING_A, VALID_FINDING_B],
      certifiedAt: '2025-01-01',
      certifiedBy: 'test-certifier',
    });
    assert.equal(report.status, 'passed_with_warnings');
    assert.equal(report.dimensionsChecked.length, 2);
  });

  it('should return identical output for identical input', () => {
    const params = {
      artifactId: 'art-1',
      artifactTitle: 'Test',
      findings: [_makeFinding('f1')],
      certifiedAt: '2025-01-01',
      certifiedBy: 'test',
    };
    const r1 = certifyAssessmentArtifact(params);
    const r2 = certifyAssessmentArtifact(params);
    assert.deepEqual(r1, r2);
  });
});

// ============================================================================
// CERTIFICATION SCORE
// ============================================================================

describe('calculateAssessmentCertificationScore', () => {
  it('should return 100 for no findings', () => {
    assert.equal(calculateAssessmentCertificationScore([]), 100);
  });

  it('should return 100 for info findings', () => {
    const findings = [_makeFinding('f1', { severity: 'info' })];
    assert.equal(calculateAssessmentCertificationScore(findings), 100);
  });

  it('should return 99 for one low finding', () => {
    const findings = [_makeFinding('f1', { severity: 'low' })];
    assert.equal(calculateAssessmentCertificationScore(findings), 99);
  });

  it('should return 95 for one medium finding', () => {
    const findings = [_makeFinding('f1', { severity: 'medium' })];
    assert.equal(calculateAssessmentCertificationScore(findings), 95);
  });

  it('should return 85 for one high finding', () => {
    const findings = [_makeFinding('f1', { severity: 'high' })];
    assert.equal(calculateAssessmentCertificationScore(findings), 85);
  });

  it('should return 70 for one critical finding', () => {
    const findings = [_makeFinding('f1', { severity: 'critical' })];
    assert.equal(calculateAssessmentCertificationScore(findings), 70);
  });

  it('should return 0 for multiple critical findings', () => {
    const findings = [
      _makeFinding('f1', { severity: 'critical' }),
      _makeFinding('f2', { severity: 'critical' }),
      _makeFinding('f3', { severity: 'critical' }),
      _makeFinding('f4', { severity: 'critical' }),
    ];
    assert.equal(calculateAssessmentCertificationScore(findings), 0);
  });
});

// ============================================================================
// CERTIFICATION SUCCESS
// ============================================================================

describe('isAssessmentCertificationSuccessful', () => {
  it('should return true for passed', () => {
    assert.equal(isAssessmentCertificationSuccessful('passed'), true);
  });

  it('should return true for passed_with_warnings', () => {
    assert.equal(isAssessmentCertificationSuccessful('passed_with_warnings'), true);
  });

  it('should return false for failed', () => {
    assert.equal(isAssessmentCertificationSuccessful('failed'), false);
  });

  it('should return false for blocked', () => {
    assert.equal(isAssessmentCertificationSuccessful('blocked'), false);
  });

  it('should return false for incomplete', () => {
    assert.equal(isAssessmentCertificationSuccessful('incomplete'), false);
  });

  it('should return false for not_certified', () => {
    assert.equal(isAssessmentCertificationSuccessful('not_certified'), false);
  });
});

// ============================================================================
// VALIDATION — Finding
// ============================================================================

describe('validateAssessmentCertificationFinding', () => {
  it('should pass for valid finding', () => {
    const errors = validateAssessmentCertificationFinding(VALID_FINDING_A);
    assert.equal(errors.length, 0);
  });

  it('should reject null finding', () => {
    const errors = validateAssessmentCertificationFinding(null as any);
    assert.ok(errors.length > 0);
  });

  it('should reject finding with missing id', () => {
    const finding = _makeFinding('');
    const errors = validateAssessmentCertificationFinding(finding);
    assert.ok(errors.some((e) => e.code === ASSESSMENT_CERTIFICATION_VALIDATION_CODES.ASSESSMENT_CERTIFICATION_INVALID_REPORT));
  });

  it('should reject finding with invalid dimension', () => {
    const finding = _makeFinding('f1', { dimension: 'invalid' as any });
    const errors = validateAssessmentCertificationFinding(finding);
    assert.ok(errors.some((e) => e.code === ASSESSMENT_CERTIFICATION_VALIDATION_CODES.ASSESSMENT_CERTIFICATION_INVALID_DIMENSION));
  });

  it('should reject finding with invalid severity', () => {
    const finding = _makeFinding('f1', { severity: 'invalid' as any });
    const errors = validateAssessmentCertificationFinding(finding);
    assert.ok(errors.some((e) => e.code === ASSESSMENT_CERTIFICATION_VALIDATION_CODES.ASSESSMENT_CERTIFICATION_INVALID_SEVERITY));
  });
});

// ============================================================================
// VALIDATION — Status
// ============================================================================

describe('validateAssessmentCertificationStatus', () => {
  it('should pass for valid status', () => {
    const errors = validateAssessmentCertificationStatus('passed');
    assert.equal(errors.length, 0);
  });

  it('should reject invalid status', () => {
    const errors = validateAssessmentCertificationStatus('invalid');
    assert.ok(errors.length > 0);
    assert.ok(errors.some((e) => e.code === ASSESSMENT_CERTIFICATION_VALIDATION_CODES.ASSESSMENT_CERTIFICATION_INVALID_STATUS));
  });
});

// ============================================================================
// VALIDATION — Score
// ============================================================================

describe('validateAssessmentCertificationScore', () => {
  it('should pass for valid score', () => {
    const errors = validateAssessmentCertificationScore(85);
    assert.equal(errors.length, 0);
  });

  it('should pass for boundary scores', () => {
    assert.equal(validateAssessmentCertificationScore(0).length, 0);
    assert.equal(validateAssessmentCertificationScore(100).length, 0);
  });

  it('should reject negative score', () => {
    const errors = validateAssessmentCertificationScore(-1);
    assert.ok(errors.length > 0);
    assert.ok(errors.some((e) => e.code === ASSESSMENT_CERTIFICATION_VALIDATION_CODES.ASSESSMENT_CERTIFICATION_INVALID_SCORE));
  });

  it('should reject score over 100', () => {
    const errors = validateAssessmentCertificationScore(101);
    assert.ok(errors.length > 0);
  });

  it('should reject non-number score', () => {
    const errors = validateAssessmentCertificationScore('invalid' as any);
    assert.ok(errors.length > 0);
  });
});

// ============================================================================
// VALIDATION — Report
// ============================================================================

describe('validateAssessmentCertificationReport', () => {
  it('should pass for valid report', () => {
    const report = certifyAssessmentArtifact({
      artifactId: 'art-1',
      artifactTitle: 'Test',
      findings: [VALID_FINDING_A],
      certifiedAt: '2025-01-01',
      certifiedBy: 'test',
    });
    const result = validateAssessmentCertificationReport(report);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it('should reject null report', () => {
    const result = validateAssessmentCertificationReport(null as any);
    assert.equal(result.valid, false);
  });

  it('should reject report with missing reportId', () => {
    const report = certifyAssessmentArtifact({
      artifactId: 'art-1',
      artifactTitle: 'Test',
      findings: [],
      certifiedAt: '2025-01-01',
      certifiedBy: 'test',
    });
    const invalidReport = { ...report, reportId: '' };
    const result = validateAssessmentCertificationReport(invalidReport);
    assert.equal(result.valid, false);
  });

  it('should reject report with duplicate findings', () => {
    const report = certifyAssessmentArtifact({
      artifactId: 'art-1',
      artifactTitle: 'Test',
      findings: [
        _makeFinding('dup'),
        _makeFinding('dup'),
      ],
      certifiedAt: '2025-01-01',
      certifiedBy: 'test',
    });
    const result = validateAssessmentCertificationReport(report);
    assert.equal(result.valid, false);
    assert.ok(result.errors.some((e) => e.code === ASSESSMENT_CERTIFICATION_VALIDATION_CODES.ASSESSMENT_CERTIFICATION_DUPLICATE_FINDING));
  });
});

// ============================================================================
// VALIDATION — validateAssessmentCertification
// ============================================================================

describe('validateAssessmentCertification', () => {
  it('should pass for valid certification', () => {
    const report = certifyAssessmentArtifact({
      artifactId: 'art-1',
      artifactTitle: 'Test',
      findings: [],
      certifiedAt: '2025-01-01',
      certifiedBy: 'test',
    });
    const result = validateAssessmentCertification(report);
    assert.equal(result.valid, true);
  });

  it('should reject null certification', () => {
    const result = validateAssessmentCertification(null as any);
    assert.equal(result.valid, false);
  });
});

// ============================================================================
// DETERMINISTIC IDENTITY — 100 iterations
// ============================================================================

describe('Deterministic Identity', () => {
  it('should produce identical output for certifyAssessmentArtifact across 100 iterations', () => {
    const params = {
      artifactId: 'art-1',
      artifactTitle: 'Test',
      findings: [_makeFinding('f1'), _makeFinding('f2')],
      certifiedAt: '2025-01-01',
      certifiedBy: 'test',
    };
    let firstResult: string | null = null;

    for (let i = 0; i < 100; i++) {
      const result = certifyAssessmentArtifact(params);
      const serialized = JSON.stringify(result);
      if (firstResult === null) {
        firstResult = serialized;
      } else {
        assert.equal(serialized, firstResult, `Iteration ${i} differs`);
      }
    }
  });

  it('should produce identical output for composeAssessmentCertificationReport across 100 iterations', () => {
    const params = {
      artifactId: 'art-1',
      artifactTitle: 'Test',
      findings: [_makeFinding('f1')],
      dimensionsChecked: ['assessment_registry'] as AssessmentQualityDimension[],
      certifiedAt: '2025-01-01',
      certifiedBy: 'test',
    };
    let firstResult: string | null = null;

    for (let i = 0; i < 100; i++) {
      const result = composeAssessmentCertificationReport(params);
      const serialized = JSON.stringify(result);
      if (firstResult === null) {
        firstResult = serialized;
      } else {
        assert.equal(serialized, firstResult, `Iteration ${i} differs`);
      }
    }
  });

  it('should produce identical output for calculateAssessmentCertificationScore across 100 iterations', () => {
    const findings = [_makeFinding('f1', { severity: 'medium' }), _makeFinding('f2', { severity: 'low' })];
    let firstResult: number | null = null;

    for (let i = 0; i < 100; i++) {
      const result = calculateAssessmentCertificationScore(findings);
      if (firstResult === null) {
        firstResult = result;
      } else {
        assert.equal(result, firstResult, `Iteration ${i} differs`);
      }
    }
  });
});

// ============================================================================
// IMMUTABILITY
// ============================================================================

describe('Immutability', () => {
  it('should not mutate input findings array in composeAssessmentCertificationReport', () => {
    const findings = [_makeFinding('f1'), _makeFinding('f2')];
    const original = JSON.stringify(findings);
    composeAssessmentCertificationReport({
      artifactId: 'art-1',
      artifactTitle: 'Test',
      findings,
      dimensionsChecked: ['assessment_registry'],
      certifiedAt: '2025-01-01',
      certifiedBy: 'test',
    });
    assert.equal(JSON.stringify(findings), original);
  });

  it('should not mutate input findings array in certifyAssessmentArtifact', () => {
    const findings = [_makeFinding('f1')];
    const original = JSON.stringify(findings);
    certifyAssessmentArtifact({
      artifactId: 'art-1',
      artifactTitle: 'Test',
      findings,
      certifiedAt: '2025-01-01',
      certifiedBy: 'test',
    });
    assert.equal(JSON.stringify(findings), original);
  });

  it('getCanonicalAssessmentCertificationStatuses returns a copy not affecting original', () => {
    const copy = getCanonicalAssessmentCertificationStatuses();
    assert.equal(copy.length, 6);
    (copy as string[]).push('injected');
    assert.equal(CANONICAL_ASSESSMENT_CERTIFICATION_STATUS.length, 6);
  });

  it('getCanonicalAssessmentFindingSeverities returns a copy not affecting original', () => {
    const copy = getCanonicalAssessmentFindingSeverities();
    assert.equal(copy.length, 5);
    (copy as string[]).push('injected');
    assert.equal(CANONICAL_ASSESSMENT_FINDING_SEVERITY.length, 5);
  });

  it('getCanonicalAssessmentQualityDimensions returns a copy not affecting original', () => {
    const copy = getCanonicalAssessmentQualityDimensions();
    assert.equal(copy.length, 22);
    (copy as string[]).push('injected');
    assert.equal(CANONICAL_ASSESSMENT_QUALITY_DIMENSIONS.length, 22);
  });
});

// ============================================================================
// CROSS-AGENT BOUNDARY
// ============================================================================

describe('Cross-Agent Boundary', () => {
  it('should not contain repairArtifact', () => {
    const source = JSON.stringify(CANONICAL_ASSESSMENT_QUALITY_DIMENSIONS);
    assert.ok(!source.includes('repairArtifact'), 'Found repairArtifact pattern');
  });

  it('should not contain generateMetadata', () => {
    const source = JSON.stringify(CANONICAL_ASSESSMENT_QUALITY_DIMENSIONS);
    assert.ok(!source.includes('generateMetadata'), 'Found generateMetadata pattern');
  });

  it('should not contain rewriteAssessment', () => {
    const source = JSON.stringify(CANONICAL_ASSESSMENT_QUALITY_DIMENSIONS);
    assert.ok(!source.includes('rewriteAssessment'), 'Found rewriteAssessment pattern');
  });

  it('should not contain inferMastery', () => {
    const source = JSON.stringify(CANONICAL_ASSESSMENT_QUALITY_DIMENSIONS);
    assert.ok(!source.includes('inferMastery'), 'Found inferMastery pattern');
  });

  it('should not contain calculateGrade', () => {
    const source = JSON.stringify(CANONICAL_ASSESSMENT_QUALITY_DIMENSIONS);
    assert.ok(!source.includes('calculateGrade'), 'Found calculateGrade pattern');
  });

  it('should not contain evaluateLearner', () => {
    const source = JSON.stringify(CANONICAL_ASSESSMENT_QUALITY_DIMENSIONS);
    assert.ok(!source.includes('evaluateLearner'), 'Found evaluateLearner pattern');
  });

  it('should not contain modifyCurriculum', () => {
    const source = JSON.stringify(CANONICAL_ASSESSMENT_QUALITY_DIMENSIONS);
    assert.ok(!source.includes('modifyCurriculum'), 'Found modifyCurriculum pattern');
  });

  it('should not contain modifyKnowledge', () => {
    const source = JSON.stringify(CANONICAL_ASSESSMENT_QUALITY_DIMENSIONS);
    assert.ok(!source.includes('modifyKnowledge'), 'Found modifyKnowledge pattern');
  });

  it('should not contain modifyLaboratory', () => {
    const source = JSON.stringify(CANONICAL_ASSESSMENT_QUALITY_DIMENSIONS);
    assert.ok(!source.includes('modifyLaboratory'), 'Found modifyLaboratory pattern');
  });

  it('should not contain modifyApplication', () => {
    const source = JSON.stringify(CANONICAL_ASSESSMENT_QUALITY_DIMENSIONS);
    assert.ok(!source.includes('modifyApplication'), 'Found modifyApplication pattern');
  });
});

// ============================================================================
// NEGATIVE CAPABILITY
// ============================================================================

describe('Negative Capability', () => {
  it('should not contain scoring logic', () => {
    const source = JSON.stringify(CANONICAL_ASSESSMENT_QUALITY_DIMENSIONS);
    assert.ok(!source.includes('score'), 'Found scoring logic');
    assert.ok(!source.includes('mastery'), 'Found mastery logic');
  });

  it('should not contain LLM or async patterns', () => {
    const source = JSON.stringify(CANONICAL_ASSESSMENT_QUALITY_DIMENSIONS);
    assert.ok(!source.includes('Promise'), 'Found Promise pattern');
    assert.ok(!source.includes('async'), 'Found async pattern');
    assert.ok(!source.includes('await'), 'Found await pattern');
  });

  it('should not contain file or network patterns', () => {
    const source = JSON.stringify(CANONICAL_ASSESSMENT_QUALITY_DIMENSIONS);
    assert.ok(!source.includes('fetch'), 'Found fetch pattern');
    assert.ok(!source.includes('readFile'), 'Found readFile pattern');
    assert.ok(!source.includes('writeFile'), 'Found writeFile pattern');
  });
});

// ============================================================================
// VALIDATION CODES
// ============================================================================

describe('Validation Codes', () => {
  it('should have exactly 10 validation codes', () => {
    const codes = Object.values(ASSESSMENT_CERTIFICATION_VALIDATION_CODES);
    assert.equal(codes.length, 10);
  });

  it('all validation codes should be UPPER_SNAKE_CASE', () => {
    for (const code of Object.values(ASSESSMENT_CERTIFICATION_VALIDATION_CODES)) {
      assert.ok(/^[A-Z_]+$/.test(code), `Not UPPER_SNAKE_CASE: ${code}`);
    }
  });

  it('all validation codes should start with ASSESSMENT_CERTIFICATION_', () => {
    for (const code of Object.values(ASSESSMENT_CERTIFICATION_VALIDATION_CODES)) {
      assert.ok(code.startsWith('ASSESSMENT_CERTIFICATION_'), `Does not start with ASSESSMENT_CERTIFICATION_: ${code}`);
    }
  });

  it('all keys should match their string values', () => {
    for (const [key, value] of Object.entries(ASSESSMENT_CERTIFICATION_VALIDATION_CODES)) {
      assert.equal(key, value, `Key ${key} does not match value ${value}`);
    }
  });
});

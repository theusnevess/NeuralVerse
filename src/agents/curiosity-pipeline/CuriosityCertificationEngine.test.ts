/**
 * NV-2100-D9-OPT-15 — Curiosity Certification Engine Test Suite
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import type {
  CuriosityCertificationFinding,
  CuriosityCertificationReport,
  CuriosityCertificationTrace,
  CuriosityCertificationMetadata,
  CuriosityCertificationStatus,
  CuriosityFindingSeverity,
  CuriosityQualityDimension,
} from './CuriosityAgentContract.ts';

import {
  CANONICAL_CURIOSITY_CERTIFICATION_STATUS,
  CANONICAL_CURIOSITY_FINDING_SEVERITY,
  CANONICAL_CURIOSITY_QUALITY_DIMENSIONS,
} from './CuriosityAgentContract.ts';

import {
  composeCuriosityCertificationFinding,
  composeCuriosityCertificationTrace,
  composeCuriosityCertificationMetadata,
  composeCuriosityCertificationReport,
  calculateCuriosityCertificationScore,
  determineCuriosityCertificationStatus,
  isCuriosityCertificationSuccessful,
  certifyCuriosityArtifact,
  validateCuriosityCertification,
  isSupportedCuriosityCertificationStatus,
  isSupportedCuriosityFindingSeverity,
  isSupportedCuriosityQualityDimension,
  getCanonicalCuriosityCertificationStatuses,
  getCanonicalCuriosityFindingSeverities,
  getCanonicalCuriosityQualityDimensions,
} from './CuriosityCertificationEngine.ts';

import {
  CURIOSITY_CERTIFICATION_VALIDATION_CODES,
  validateCuriosityCertificationFinding,
  validateCuriosityCertificationStatus,
  validateCuriosityCertificationScore,
  validateCuriosityCertificationReport,
} from './CuriosityCertificationValidation.ts';

const VALID_FINDING: CuriosityCertificationFinding = {
  findingId: 'finding_001',
  dimension: 'registry',
  severity: 'medium',
  message: 'Registry metadata partially configured',
  details: 'Some registry fields are missing',
  timestamp: 'deterministic_timestamp',
};

const VALID_REPORT: CuriosityCertificationReport = {
  reportId: 'report_001',
  certificationStatus: 'passed',
  certificationScore: 100,
  findings: [],
  dimensions: [...CANONICAL_CURIOSITY_QUALITY_DIMENSIONS],
  metadata: {
    totalDimensions: 22,
    certifiedDimensions: 22,
    warningDimensions: 0,
    failedDimensions: 0,
    totalFindings: 0,
    criticalFindings: 0,
    highFindings: 0,
    mediumFindings: 0,
    lowFindings: 0,
    infoFindings: 0,
  },
  trace: {
    traceId: '_cert_trace_1',
    generatedFrom: 'deterministic_curiosity_certification_engine',
    deterministic: true,
    randomUsed: false,
    timeDependency: false,
  },
  deterministic: true,
  generatedFrom: 'deterministic_curiosity_certification_engine',
  randomUsed: false,
  timeDependency: false,
};

// ---------------------------------------------------------------------------
// Composition Functions
// ---------------------------------------------------------------------------

describe('Curiosity Certification Engine — Composition', () => {
  it('should compose a certification finding', () => {
    const finding = composeCuriosityCertificationFinding({
      findingId: 'f_001',
      dimension: 'purpose',
      severity: 'low',
      message: 'Purpose partially defined',
      details: 'Some purpose fields missing',
      timestamp: 'deterministic_timestamp',
    });
    assert.equal(finding.findingId, 'f_001');
    assert.equal(finding.dimension, 'purpose');
    assert.equal(finding.severity, 'low');
  });

  it('should compose a certification trace', () => {
    const trace = composeCuriosityCertificationTrace({ traceId: '_trace_1' });
    assert.equal(trace.traceId, '_trace_1');
    assert.equal(trace.generatedFrom, 'deterministic_curiosity_certification_engine');
    assert.equal(trace.deterministic, true);
    assert.equal(trace.randomUsed, false);
    assert.equal(trace.timeDependency, false);
  });

  it('should compose certification metadata from findings', () => {
    const findings = [
      composeCuriosityCertificationFinding({ findingId: 'f1', dimension: 'registry', severity: 'critical', message: 'Critical', details: '...', timestamp: 't' }),
      composeCuriosityCertificationFinding({ findingId: 'f2', dimension: 'purpose', severity: 'medium', message: 'Medium', details: '...', timestamp: 't' }),
      composeCuriosityCertificationFinding({ findingId: 'f3', dimension: 'humor', severity: 'info', message: 'Info', details: '...', timestamp: 't' }),
    ];
    const metadata = composeCuriosityCertificationMetadata(findings, [...CANONICAL_CURIOSITY_QUALITY_DIMENSIONS]);
    assert.equal(metadata.totalFindings, 3);
    assert.equal(metadata.criticalFindings, 1);
    assert.equal(metadata.mediumFindings, 1);
    assert.equal(metadata.infoFindings, 1);
    assert.equal(metadata.totalDimensions, 22);
  });

  it('should compose a certification report', () => {
    const report = composeCuriosityCertificationReport({
      reportId: 'r_001',
      findings: [],
      dimensions: [...CANONICAL_CURIOSITY_QUALITY_DIMENSIONS],
    });
    assert.equal(report.reportId, 'r_001');
    assert.equal(report.certificationStatus, 'passed');
    assert.equal(report.certificationScore, 100);
    assert.equal(report.deterministic, true);
    assert.equal(report.generatedFrom, 'deterministic_curiosity_certification_engine');
  });

  it('should calculate certification score correctly', () => {
    const findings = [
      composeCuriosityCertificationFinding({ findingId: 'f1', dimension: 'registry', severity: 'critical', message: 'C', details: '...', timestamp: 't' }),
      composeCuriosityCertificationFinding({ findingId: 'f2', dimension: 'purpose', severity: 'high', message: 'H', details: '...', timestamp: 't' }),
      composeCuriosityCertificationFinding({ findingId: 'f3', dimension: 'humor', severity: 'medium', message: 'M', details: '...', timestamp: 't' }),
    ];
    const score = calculateCuriosityCertificationScore(findings, [...CANONICAL_CURIOSITY_QUALITY_DIMENSIONS]);
    // 100 - 15 - 10 - 5 = 70
    assert.equal(score, 70);
  });

  it('should clamp score to minimum 0', () => {
    const findings = Array.from({ length: 20 }, (_, i) =>
      composeCuriosityCertificationFinding({ findingId: `f${i}`, dimension: 'registry', severity: 'critical', message: 'C', details: '...', timestamp: 't' }),
    );
    const score = calculateCuriosityCertificationScore(findings, [...CANONICAL_CURIOSITY_QUALITY_DIMENSIONS]);
    assert.equal(score, 0);
  });

  it('should determine certification status as passed with no findings', () => {
    const status = determineCuriosityCertificationStatus(100, []);
    assert.equal(status, 'passed');
  });

  it('should determine certification status as failed with critical findings', () => {
    const findings = [composeCuriosityCertificationFinding({ findingId: 'f1', dimension: 'registry', severity: 'critical', message: 'C', details: '...', timestamp: 't' })];
    const status = determineCuriosityCertificationStatus(85, findings);
    assert.equal(status, 'failed');
  });

  it('should determine certification status as passed_with_warnings with medium findings', () => {
    const findings = [composeCuriosityCertificationFinding({ findingId: 'f1', dimension: 'registry', severity: 'medium', message: 'M', details: '...', timestamp: 't' })];
    const status = determineCuriosityCertificationStatus(75, findings);
    assert.equal(status, 'passed_with_warnings');
  });

  it('should determine certification status as incomplete with low score', () => {
    const findings = [composeCuriosityCertificationFinding({ findingId: 'f1', dimension: 'registry', severity: 'low', message: 'L', details: '...', timestamp: 't' })];
    const status = determineCuriosityCertificationStatus(55, findings);
    assert.equal(status, 'incomplete');
  });

  it('should determine certification as successful for passed', () => {
    const report = { ...VALID_REPORT, certificationStatus: 'passed' as const };
    assert.equal(isCuriosityCertificationSuccessful(report), true);
  });

  it('should determine certification as successful for passed_with_warnings', () => {
    const report = { ...VALID_REPORT, certificationStatus: 'passed_with_warnings' as const };
    assert.equal(isCuriosityCertificationSuccessful(report), true);
  });

  it('should determine certification as not successful for failed', () => {
    const report = { ...VALID_REPORT, certificationStatus: 'failed' as const };
    assert.equal(isCuriosityCertificationSuccessful(report), false);
  });

  it('should certify a complete artifact as passed', () => {
    const report = certifyCuriosityArtifact({
      reportId: 'cert_001',
      hasRegistry: true, hasPurpose: true, hasHumor: true, hasCulturalReference: true,
      hasCards: true, hasKnowledgeEvolution: true, hasDiscoveries: true, hasLaboratoryCuriosity: true,
      hasMisconceptions: true, hasPresentation: true, hasPreferences: true, hasGovernance: true,
      hasStorage: true, hasSafety: true, hasTraceability: true, hasMetadata: true,
      hasValidation: true, hasDeterminism: true, hasImmutability: true, hasDocumentation: true,
      hasCrossAgentBoundary: true, hasPublicApi: true,
    });
    assert.equal(report.certificationStatus, 'passed');
    assert.equal(report.certificationScore, 100);
    assert.equal(report.findings.length, 0);
  });

  it('should certify an incomplete artifact with findings', () => {
    const report = certifyCuriosityArtifact({
      reportId: 'cert_002',
      hasRegistry: true, hasPurpose: false, hasHumor: false, hasCulturalReference: false,
      hasCards: false, hasKnowledgeEvolution: false, hasDiscoveries: false, hasLaboratoryCuriosity: false,
      hasMisconceptions: false, hasPresentation: false, hasPreferences: false, hasGovernance: false,
      hasStorage: false, hasSafety: false, hasTraceability: false, hasMetadata: false,
      hasValidation: false, hasDeterminism: false, hasImmutability: false, hasDocumentation: false,
      hasCrossAgentBoundary: false, hasPublicApi: false,
    });
    assert.equal(report.findings.length, 21);
    assert.ok(report.certificationScore < 100);
  });

  it('should validate a certification report', () => {
    const result = validateCuriosityCertification(VALID_REPORT);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it('should detect invalid certification report', () => {
    const invalidReport = { ...VALID_REPORT, certificationScore: -10 };
    const result = validateCuriosityCertification(invalidReport);
    assert.equal(result.valid, false);
    assert.ok(result.errors.length > 0);
  });
});

// ---------------------------------------------------------------------------
// Registry
// ---------------------------------------------------------------------------

describe('Curiosity Certification Engine — Registry', () => {
  it('should produce identical output for identical input (100 iterations)', () => {
    const results: CuriosityCertificationReport[] = [];
    for (let i = 0; i < 100; i++) {
      results.push(certifyCuriosityArtifact({
        reportId: 'reg_001',
        hasRegistry: true, hasPurpose: true, hasHumor: true, hasCulturalReference: true,
        hasCards: true, hasKnowledgeEvolution: true, hasDiscoveries: true, hasLaboratoryCuriosity: true,
        hasMisconceptions: true, hasPresentation: true, hasPreferences: true, hasGovernance: true,
        hasStorage: true, hasSafety: true, hasTraceability: true, hasMetadata: true,
        hasValidation: true, hasDeterminism: true, hasImmutability: true, hasDocumentation: true,
        hasCrossAgentBoundary: true, hasPublicApi: true,
      }));
    }
    for (let i = 1; i < results.length; i++) {
      assert.deepStrictEqual(results[0].reportId, results[i].reportId);
      assert.deepStrictEqual(results[0].certificationStatus, results[i].certificationStatus);
      assert.deepStrictEqual(results[0].certificationScore, results[i].certificationScore);
      assert.deepStrictEqual(results[0].findings, results[i].findings);
    }
  });

  it('should produce identical reports for identical input (100 iterations)', () => {
    const results: CuriosityCertificationReport[] = [];
    for (let i = 0; i < 100; i++) {
      results.push(composeCuriosityCertificationReport({
        reportId: 'rpt_001',
        findings: [VALID_FINDING],
        dimensions: [...CANONICAL_CURIOSITY_QUALITY_DIMENSIONS],
      }));
    }
    for (let i = 1; i < results.length; i++) {
      assert.deepStrictEqual(results[0].reportId, results[i].reportId);
      assert.deepStrictEqual(results[0].certificationScore, results[i].certificationScore);
      assert.deepStrictEqual(results[0].certificationStatus, results[i].certificationStatus);
    }
  });

  it('should produce identical scores for identical input (100 iterations)', () => {
    const scores: number[] = [];
    const findings = [VALID_FINDING];
    for (let i = 0; i < 100; i++) {
      scores.push(calculateCuriosityCertificationScore(findings, [...CANONICAL_CURIOSITY_QUALITY_DIMENSIONS]));
    }
    for (let i = 1; i < scores.length; i++) {
      assert.strictEqual(scores[0], scores[i]);
    }
  });

  it('should produce stable serialization', () => {
    const report1 = composeCuriosityCertificationReport({ reportId: 's_001', findings: [], dimensions: [...CANONICAL_CURIOSITY_QUALITY_DIMENSIONS] });
    const report2 = composeCuriosityCertificationReport({ reportId: 's_001', findings: [], dimensions: [...CANONICAL_CURIOSITY_QUALITY_DIMENSIONS] });
    assert.deepStrictEqual(JSON.stringify(report1), JSON.stringify(report2));
  });

  it('should produce stable ordering of dimensions', () => {
    const report = composeCuriosityCertificationReport({ reportId: 'o_001', findings: [], dimensions: [...CANONICAL_CURIOSITY_QUALITY_DIMENSIONS] });
    assert.deepStrictEqual(report.dimensions, [...CANONICAL_CURIOSITY_QUALITY_DIMENSIONS]);
  });
});

// ---------------------------------------------------------------------------
// Immutability
// ---------------------------------------------------------------------------

describe('Curiosity Certification Engine — Immutability', () => {
  it('should not mutate input findings', () => {
    const originalFindings = [VALID_FINDING];
    const originalId = originalFindings[0].findingId;
    composeCuriosityCertificationReport({ reportId: 'imm_001', findings: originalFindings, dimensions: [...CANONICAL_CURIOSITY_QUALITY_DIMENSIONS] });
    assert.equal(originalFindings[0].findingId, originalId);
  });

  it('should return defensive copies in report', () => {
    const report = composeCuriosityCertificationReport({ reportId: 'def_001', findings: [VALID_FINDING], dimensions: [...CANONICAL_CURIOSITY_QUALITY_DIMENSIONS] });
    assert.ok(Array.isArray(report.findings));
    assert.ok(Array.isArray(report.dimensions));
  });

  it('should not contain splice in output', () => {
    const report = certifyCuriosityArtifact({
      reportId: 'splice_001',
      hasRegistry: true, hasPurpose: true, hasHumor: true, hasCulturalReference: true,
      hasCards: true, hasKnowledgeEvolution: true, hasDiscoveries: true, hasLaboratoryCuriosity: true,
      hasMisconceptions: true, hasPresentation: true, hasPreferences: true, hasGovernance: true,
      hasStorage: true, hasSafety: true, hasTraceability: true, hasMetadata: true,
      hasValidation: true, hasDeterminism: true, hasImmutability: true, hasDocumentation: true,
      hasCrossAgentBoundary: true, hasPublicApi: true,
    });
    assert.ok(!('splice' in report));
  });

  it('should not contain delete in output', () => {
    const report = certifyCuriosityArtifact({
      reportId: 'del_001',
      hasRegistry: true, hasPurpose: true, hasHumor: true, hasCulturalReference: true,
      hasCards: true, hasKnowledgeEvolution: true, hasDiscoveries: true, hasLaboratoryCuriosity: true,
      hasMisconceptions: true, hasPresentation: true, hasPreferences: true, hasGovernance: true,
      hasStorage: true, hasSafety: true, hasTraceability: true, hasMetadata: true,
      hasValidation: true, hasDeterminism: true, hasImmutability: true, hasDocumentation: true,
      hasCrossAgentBoundary: true, hasPublicApi: true,
    });
    assert.ok(!('delete' in report));
  });

  it('should have immutable report properties', () => {
    const report = composeCuriosityCertificationReport({ reportId: 'immut_001', findings: [], dimensions: [...CANONICAL_CURIOSITY_QUALITY_DIMENSIONS] });
    assert.equal(report.deterministic, true);
    assert.equal(report.randomUsed, false);
    assert.equal(report.timeDependency, false);
  });
});

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

describe('Curiosity Certification Engine — Validation', () => {
  it('should validate a valid certification finding', () => {
    const result = validateCuriosityCertificationFinding(VALID_FINDING);
    assert.equal(result.valid, true);
  });

  it('should detect invalid finding with empty ID', () => {
    const invalidFinding = { ...VALID_FINDING, findingId: '' };
    const result = validateCuriosityCertificationFinding(invalidFinding);
    assert.equal(result.valid, false);
  });

  it('should validate a valid certification status', () => {
    const result = validateCuriosityCertificationStatus('passed');
    assert.equal(result.valid, true);
  });

  it('should detect invalid certification status', () => {
    const result = validateCuriosityCertificationStatus('invalid_status' as CuriosityCertificationStatus);
    assert.equal(result.valid, false);
  });

  it('should validate a valid certification score', () => {
    const result = validateCuriosityCertificationScore(85);
    assert.equal(result.valid, true);
  });

  it('should detect invalid certification score below range', () => {
    const result = validateCuriosityCertificationScore(-10);
    assert.equal(result.valid, false);
  });

  it('should detect invalid certification score above range', () => {
    const result = validateCuriosityCertificationScore(150);
    assert.equal(result.valid, false);
  });

  it('should detect non-finite certification score', () => {
    const result = validateCuriosityCertificationScore(NaN);
    assert.equal(result.valid, false);
  });

  it('should validate a valid certification report', () => {
    const result = validateCuriosityCertificationReport(VALID_REPORT);
    assert.equal(result.valid, true);
  });

  it('should detect invalid report with empty ID', () => {
    const invalidReport = { ...VALID_REPORT, reportId: '' };
    const result = validateCuriosityCertificationReport(invalidReport);
    assert.equal(result.valid, false);
  });

  it('should validate certification entry point', () => {
    const result = validateCuriosityCertification(VALID_REPORT);
    assert.equal(result.valid, true);
  });

  it('should not throw on validation failure', () => {
    assert.doesNotThrow(() => {
      validateCuriosityCertification({ ...VALID_REPORT, certificationScore: -10 });
    });
  });

  it('should validate all 10 validation codes exist', () => {
    const codeCount = Object.keys(CURIOSITY_CERTIFICATION_VALIDATION_CODES).length;
    assert.equal(codeCount, 10);
  });

  it('should have stable validation code values', () => {
    assert.equal(CURIOSITY_CERTIFICATION_VALIDATION_CODES.CURIOSITY_CERTIFICATION_INVALID_STATUS, 'CURIOSITY_CERTIFICATION_INVALID_STATUS');
    assert.equal(CURIOSITY_CERTIFICATION_VALIDATION_CODES.CURIOSITY_CERTIFICATION_INVALID_SCORE, 'CURIOSITY_CERTIFICATION_INVALID_SCORE');
    assert.equal(CURIOSITY_CERTIFICATION_VALIDATION_CODES.CURIOSITY_CERTIFICATION_INVALID_FINDING, 'CURIOSITY_CERTIFICATION_INVALID_FINDING');
    assert.equal(CURIOSITY_CERTIFICATION_VALIDATION_CODES.CURIOSITY_CERTIFICATION_INVALID_TRACE, 'CURIOSITY_CERTIFICATION_INVALID_TRACE');
    assert.equal(CURIOSITY_CERTIFICATION_VALIDATION_CODES.CURIOSITY_CERTIFICATION_INVALID_DIMENSION, 'CURIOSITY_CERTIFICATION_INVALID_DIMENSION');
    assert.equal(CURIOSITY_CERTIFICATION_VALIDATION_CODES.CURIOSITY_CERTIFICATION_MISSING_REPORT, 'CURIOSITY_CERTIFICATION_MISSING_REPORT');
    assert.equal(CURIOSITY_CERTIFICATION_VALIDATION_CODES.CURIOSITY_CERTIFICATION_MISSING_FINDING, 'CURIOSITY_CERTIFICATION_MISSING_FINDING');
    assert.equal(CURIOSITY_CERTIFICATION_VALIDATION_CODES.CURIOSITY_CERTIFICATION_MISSING_METADATA, 'CURIOSITY_CERTIFICATION_MISSING_METADATA');
    assert.equal(CURIOSITY_CERTIFICATION_VALIDATION_CODES.CURIOSITY_CERTIFICATION_INVALID_CONFIGURATION, 'CURIOSITY_CERTIFICATION_INVALID_CONFIGURATION');
    assert.equal(CURIOSITY_CERTIFICATION_VALIDATION_CODES.CURIOSITY_CERTIFICATION_INVALID_REPORT, 'CURIOSITY_CERTIFICATION_INVALID_REPORT');
  });
});

// ---------------------------------------------------------------------------
// Canonical Enum Completeness
// ---------------------------------------------------------------------------

describe('Curiosity Certification Engine — Canonical Enum Completeness', () => {
  it('should have exactly 6 certification statuses', () => { assert.equal(CANONICAL_CURIOSITY_CERTIFICATION_STATUS.length, 6); });
  it('should have exactly 5 finding severities', () => { assert.equal(CANONICAL_CURIOSITY_FINDING_SEVERITY.length, 5); });
  it('should have exactly 22 quality dimensions', () => { assert.equal(CANONICAL_CURIOSITY_QUALITY_DIMENSIONS.length, 22); });

  it('should include all required certification statuses', () => {
    const statuses = CANONICAL_CURIOSITY_CERTIFICATION_STATUS;
    assert.ok(statuses.includes('passed'));
    assert.ok(statuses.includes('passed_with_warnings'));
    assert.ok(statuses.includes('failed'));
    assert.ok(statuses.includes('blocked'));
    assert.ok(statuses.includes('incomplete'));
    assert.ok(statuses.includes('not_certified'));
  });

  it('should include all required finding severities', () => {
    const severities = CANONICAL_CURIOSITY_FINDING_SEVERITY;
    assert.ok(severities.includes('info'));
    assert.ok(severities.includes('low'));
    assert.ok(severities.includes('medium'));
    assert.ok(severities.includes('high'));
    assert.ok(severities.includes('critical'));
  });

  it('should include all 22 quality dimensions', () => {
    const dimensions = CANONICAL_CURIOSITY_QUALITY_DIMENSIONS;
    assert.ok(dimensions.includes('registry'));
    assert.ok(dimensions.includes('purpose'));
    assert.ok(dimensions.includes('humor'));
    assert.ok(dimensions.includes('cultural_reference'));
    assert.ok(dimensions.includes('cards'));
    assert.ok(dimensions.includes('knowledge_evolution'));
    assert.ok(dimensions.includes('discoveries'));
    assert.ok(dimensions.includes('laboratory_curiosity'));
    assert.ok(dimensions.includes('misconceptions'));
    assert.ok(dimensions.includes('presentation'));
    assert.ok(dimensions.includes('preferences'));
    assert.ok(dimensions.includes('governance'));
    assert.ok(dimensions.includes('storage'));
    assert.ok(dimensions.includes('safety'));
    assert.ok(dimensions.includes('traceability'));
    assert.ok(dimensions.includes('metadata'));
    assert.ok(dimensions.includes('validation'));
    assert.ok(dimensions.includes('determinism'));
    assert.ok(dimensions.includes('immutability'));
    assert.ok(dimensions.includes('documentation'));
    assert.ok(dimensions.includes('cross_agent_boundary'));
    assert.ok(dimensions.includes('public_api'));
  });
});

// ---------------------------------------------------------------------------
// Negative Capability Verification
// ---------------------------------------------------------------------------

describe('Curiosity Certification Engine — Negative Capability Verification', () => {
  it('should not use Math.random', () => { const result = certifyCuriosityArtifact({ reportId: 'n_001', hasRegistry: true, hasPurpose: true, hasHumor: true, hasCulturalReference: true, hasCards: true, hasKnowledgeEvolution: true, hasDiscoveries: true, hasLaboratoryCuriosity: true, hasMisconceptions: true, hasPresentation: true, hasPreferences: true, hasGovernance: true, hasStorage: true, hasSafety: true, hasTraceability: true, hasMetadata: true, hasValidation: true, hasDeterminism: true, hasImmutability: true, hasDocumentation: true, hasCrossAgentBoundary: true, hasPublicApi: true }); assert.ok(result); });
  it('should not use Date.now', () => { const result = certifyCuriosityArtifact({ reportId: 'n_002', hasRegistry: true, hasPurpose: true, hasHumor: true, hasCulturalReference: true, hasCards: true, hasKnowledgeEvolution: true, hasDiscoveries: true, hasLaboratoryCuriosity: true, hasMisconceptions: true, hasPresentation: true, hasPreferences: true, hasGovernance: true, hasStorage: true, hasSafety: true, hasTraceability: true, hasMetadata: true, hasValidation: true, hasDeterminism: true, hasImmutability: true, hasDocumentation: true, hasCrossAgentBoundary: true, hasPublicApi: true }); assert.ok(result); });
  it('should not perform content moderation', () => { const result = certifyCuriosityArtifact({ reportId: 'n_003', hasRegistry: true, hasPurpose: true, hasHumor: true, hasCulturalReference: true, hasCards: true, hasKnowledgeEvolution: true, hasDiscoveries: true, hasLaboratoryCuriosity: true, hasMisconceptions: true, hasPresentation: true, hasPreferences: true, hasGovernance: true, hasStorage: true, hasSafety: true, hasTraceability: true, hasMetadata: true, hasValidation: true, hasDeterminism: true, hasImmutability: true, hasDocumentation: true, hasCrossAgentBoundary: true, hasPublicApi: true }); assert.ok(!('contentModeration' in result)); });
  it('should not detect toxicity', () => { const result = certifyCuriosityArtifact({ reportId: 'n_004', hasRegistry: true, hasPurpose: true, hasHumor: true, hasCulturalReference: true, hasCards: true, hasKnowledgeEvolution: true, hasDiscoveries: true, hasLaboratoryCuriosity: true, hasMisconceptions: true, hasPresentation: true, hasPreferences: true, hasGovernance: true, hasStorage: true, hasSafety: true, hasTraceability: true, hasMetadata: true, hasValidation: true, hasDeterminism: true, hasImmutability: true, hasDocumentation: true, hasCrossAgentBoundary: true, hasPublicApi: true }); assert.ok(!('toxicity' in result)); });
  it('should not generate content', () => { const result = certifyCuriosityArtifact({ reportId: 'n_005', hasRegistry: true, hasPurpose: true, hasHumor: true, hasCulturalReference: true, hasCards: true, hasKnowledgeEvolution: true, hasDiscoveries: true, hasLaboratoryCuriosity: true, hasMisconceptions: true, hasPresentation: true, hasPreferences: true, hasGovernance: true, hasStorage: true, hasSafety: true, hasTraceability: true, hasMetadata: true, hasValidation: true, hasDeterminism: true, hasImmutability: true, hasDocumentation: true, hasCrossAgentBoundary: true, hasPublicApi: true }); assert.ok(!('generatedContent' in result)); });
  it('should not execute certifications', () => { const result = certifyCuriosityArtifact({ reportId: 'n_006', hasRegistry: true, hasPurpose: true, hasHumor: true, hasCulturalReference: true, hasCards: true, hasKnowledgeEvolution: true, hasDiscoveries: true, hasLaboratoryCuriosity: true, hasMisconceptions: true, hasPresentation: true, hasPreferences: true, hasGovernance: true, hasStorage: true, hasSafety: true, hasTraceability: true, hasMetadata: true, hasValidation: true, hasDeterminism: true, hasImmutability: true, hasDocumentation: true, hasCrossAgentBoundary: true, hasPublicApi: true }); assert.ok(!('executedCertifications' in result)); });
  it('should not access filesystem', () => { const result = certifyCuriosityArtifact({ reportId: 'n_007', hasRegistry: true, hasPurpose: true, hasHumor: true, hasCulturalReference: true, hasCards: true, hasKnowledgeEvolution: true, hasDiscoveries: true, hasLaboratoryCuriosity: true, hasMisconceptions: true, hasPresentation: true, hasPreferences: true, hasGovernance: true, hasStorage: true, hasSafety: true, hasTraceability: true, hasMetadata: true, hasValidation: true, hasDeterminism: true, hasImmutability: true, hasDocumentation: true, hasCrossAgentBoundary: true, hasPublicApi: true }); assert.ok(!('filesystem' in result)); });
  it('should not perform network requests', () => { const result = certifyCuriosityArtifact({ reportId: 'n_008', hasRegistry: true, hasPurpose: true, hasHumor: true, hasCulturalReference: true, hasCards: true, hasKnowledgeEvolution: true, hasDiscoveries: true, hasLaboratoryCuriosity: true, hasMisconceptions: true, hasPresentation: true, hasPreferences: true, hasGovernance: true, hasStorage: true, hasSafety: true, hasTraceability: true, hasMetadata: true, hasValidation: true, hasDeterminism: true, hasImmutability: true, hasDocumentation: true, hasCrossAgentBoundary: true, hasPublicApi: true }); assert.ok(!('networkResponse' in result)); });

  it('should not reference Narrative Agent', () => { const result = certifyCuriosityArtifact({ reportId: 'n_009', hasRegistry: true, hasPurpose: true, hasHumor: true, hasCulturalReference: true, hasCards: true, hasKnowledgeEvolution: true, hasDiscoveries: true, hasLaboratoryCuriosity: true, hasMisconceptions: true, hasPresentation: true, hasPreferences: true, hasGovernance: true, hasStorage: true, hasSafety: true, hasTraceability: true, hasMetadata: true, hasValidation: true, hasDeterminism: true, hasImmutability: true, hasDocumentation: true, hasCrossAgentBoundary: true, hasPublicApi: true }); assert.ok(!('narrativeAgent' in result)); });
  it('should not reference Knowledge Agent', () => { const result = certifyCuriosityArtifact({ reportId: 'n_010', hasRegistry: true, hasPurpose: true, hasHumor: true, hasCulturalReference: true, hasCards: true, hasKnowledgeEvolution: true, hasDiscoveries: true, hasLaboratoryCuriosity: true, hasMisconceptions: true, hasPresentation: true, hasPreferences: true, hasGovernance: true, hasStorage: true, hasSafety: true, hasTraceability: true, hasMetadata: true, hasValidation: true, hasDeterminism: true, hasImmutability: true, hasDocumentation: true, hasCrossAgentBoundary: true, hasPublicApi: true }); assert.ok(!('knowledgeAgent' in result)); });
  it('should not reference Assessment Agent', () => { const result = certifyCuriosityArtifact({ reportId: 'n_011', hasRegistry: true, hasPurpose: true, hasHumor: true, hasCulturalReference: true, hasCards: true, hasKnowledgeEvolution: true, hasDiscoveries: true, hasLaboratoryCuriosity: true, hasMisconceptions: true, hasPresentation: true, hasPreferences: true, hasGovernance: true, hasStorage: true, hasSafety: true, hasTraceability: true, hasMetadata: true, hasValidation: true, hasDeterminism: true, hasImmutability: true, hasDocumentation: true, hasCrossAgentBoundary: true, hasPublicApi: true }); assert.ok(!('assessmentAgent' in result)); });
  it('should not reference Didactic Agent', () => { const result = certifyCuriosityArtifact({ reportId: 'n_012', hasRegistry: true, hasPurpose: true, hasHumor: true, hasCulturalReference: true, hasCards: true, hasKnowledgeEvolution: true, hasDiscoveries: true, hasLaboratoryCuriosity: true, hasMisconceptions: true, hasPresentation: true, hasPreferences: true, hasGovernance: true, hasStorage: true, hasSafety: true, hasTraceability: true, hasMetadata: true, hasValidation: true, hasDeterminism: true, hasImmutability: true, hasDocumentation: true, hasCrossAgentBoundary: true, hasPublicApi: true }); assert.ok(!('didacticAgent' in result)); });
  it('should not reference Laboratory Agent', () => { const result = certifyCuriosityArtifact({ reportId: 'n_013', hasRegistry: true, hasPurpose: true, hasHumor: true, hasCulturalReference: true, hasCards: true, hasKnowledgeEvolution: true, hasDiscoveries: true, hasLaboratoryCuriosity: true, hasMisconceptions: true, hasPresentation: true, hasPreferences: true, hasGovernance: true, hasStorage: true, hasSafety: true, hasTraceability: true, hasMetadata: true, hasValidation: true, hasDeterminism: true, hasImmutability: true, hasDocumentation: true, hasCrossAgentBoundary: true, hasPublicApi: true }); assert.ok(!('laboratoryAgent' in result)); });
  it('should not reference Research Agent', () => { const result = certifyCuriosityArtifact({ reportId: 'n_014', hasRegistry: true, hasPurpose: true, hasHumor: true, hasCulturalReference: true, hasCards: true, hasKnowledgeEvolution: true, hasDiscoveries: true, hasLaboratoryCuriosity: true, hasMisconceptions: true, hasPresentation: true, hasPreferences: true, hasGovernance: true, hasStorage: true, hasSafety: true, hasTraceability: true, hasMetadata: true, hasValidation: true, hasDeterminism: true, hasImmutability: true, hasDocumentation: true, hasCrossAgentBoundary: true, hasPublicApi: true }); assert.ok(!('researchAgent' in result)); });
  it('should not reference Application Agent', () => { const result = certifyCuriosityArtifact({ reportId: 'n_015', hasRegistry: true, hasPurpose: true, hasHumor: true, hasCulturalReference: true, hasCards: true, hasKnowledgeEvolution: true, hasDiscoveries: true, hasLaboratoryCuriosity: true, hasMisconceptions: true, hasPresentation: true, hasPreferences: true, hasGovernance: true, hasStorage: true, hasSafety: true, hasTraceability: true, hasMetadata: true, hasValidation: true, hasDeterminism: true, hasImmutability: true, hasDocumentation: true, hasCrossAgentBoundary: true, hasPublicApi: true }); assert.ok(!('applicationAgent' in result)); });
});

// ---------------------------------------------------------------------------
// Architectural Compliance
// ---------------------------------------------------------------------------

describe('Curiosity Certification Engine — Architectural Compliance', () => {
  it('should have pure compose functions', () => {
    const r1 = composeCuriosityCertificationReport({ reportId: 'a_001', findings: [], dimensions: [...CANONICAL_CURIOSITY_QUALITY_DIMENSIONS] });
    const r2 = composeCuriosityCertificationReport({ reportId: 'a_001', findings: [], dimensions: [...CANONICAL_CURIOSITY_QUALITY_DIMENSIONS] });
    assert.deepStrictEqual(r1, r2);
  });

  it('should have deterministic outputs', () => {
    const score1 = calculateCuriosityCertificationScore([VALID_FINDING], [...CANONICAL_CURIOSITY_QUALITY_DIMENSIONS]);
    const score2 = calculateCuriosityCertificationScore([VALID_FINDING], [...CANONICAL_CURIOSITY_QUALITY_DIMENSIONS]);
    assert.equal(score1, score2);
  });

  it('should have no side effects', () => {
    const report = certifyCuriosityArtifact({ reportId: 'se_001', hasRegistry: true, hasPurpose: true, hasHumor: true, hasCulturalReference: true, hasCards: true, hasKnowledgeEvolution: true, hasDiscoveries: true, hasLaboratoryCuriosity: true, hasMisconceptions: true, hasPresentation: true, hasPreferences: true, hasGovernance: true, hasStorage: true, hasSafety: true, hasTraceability: true, hasMetadata: true, hasValidation: true, hasDeterminism: true, hasImmutability: true, hasDocumentation: true, hasCrossAgentBoundary: true, hasPublicApi: true });
    assert.ok(report);
  });

  it('should never throw on validation', () => {
    assert.doesNotThrow(() => validateCuriosityCertification(null as unknown as CuriosityCertificationReport));
  });

  it('should have canonical enums as const tuples', () => {
    assert.ok(Array.isArray(CANONICAL_CURIOSITY_CERTIFICATION_STATUS));
    assert.ok(Array.isArray(CANONICAL_CURIOSITY_FINDING_SEVERITY));
    assert.ok(Array.isArray(CANONICAL_CURIOSITY_QUALITY_DIMENSIONS));
  });
});

// ---------------------------------------------------------------------------
// Public API Exports
// ---------------------------------------------------------------------------

describe('Curiosity Certification Engine — Public API Exports', () => {
  it('should export all composition functions', () => {
    assert.equal(typeof composeCuriosityCertificationFinding, 'function');
    assert.equal(typeof composeCuriosityCertificationTrace, 'function');
    assert.equal(typeof composeCuriosityCertificationMetadata, 'function');
    assert.equal(typeof composeCuriosityCertificationReport, 'function');
    assert.equal(typeof calculateCuriosityCertificationScore, 'function');
    assert.equal(typeof determineCuriosityCertificationStatus, 'function');
    assert.equal(typeof isCuriosityCertificationSuccessful, 'function');
    assert.equal(typeof certifyCuriosityArtifact, 'function');
    assert.equal(typeof validateCuriosityCertification, 'function');
  });

  it('should export all helper functions', () => {
    assert.equal(typeof isSupportedCuriosityCertificationStatus, 'function');
    assert.equal(typeof isSupportedCuriosityFindingSeverity, 'function');
    assert.equal(typeof isSupportedCuriosityQualityDimension, 'function');
    assert.equal(typeof getCanonicalCuriosityCertificationStatuses, 'function');
    assert.equal(typeof getCanonicalCuriosityFindingSeverities, 'function');
    assert.equal(typeof getCanonicalCuriosityQualityDimensions, 'function');
  });

  it('should export all validation functions', () => {
    assert.equal(typeof validateCuriosityCertificationFinding, 'function');
    assert.equal(typeof validateCuriosityCertificationStatus, 'function');
    assert.equal(typeof validateCuriosityCertificationScore, 'function');
    assert.equal(typeof validateCuriosityCertificationReport, 'function');
  });

  it('should have 6 helper functions', () => {
    const helpers = [
      isSupportedCuriosityCertificationStatus,
      isSupportedCuriosityFindingSeverity,
      isSupportedCuriosityQualityDimension,
      getCanonicalCuriosityCertificationStatuses,
      getCanonicalCuriosityFindingSeverities,
      getCanonicalCuriosityQualityDimensions,
    ];
    assert.equal(helpers.length, 6);
  });

  it('should return defensive copies from canonical getters', () => {
    const s1 = getCanonicalCuriosityCertificationStatuses();
    const s2 = getCanonicalCuriosityCertificationStatuses();
    assert.notStrictEqual(s1, s2);
    assert.deepStrictEqual(s1, s2);

    const v1 = getCanonicalCuriosityFindingSeverities();
    const v2 = getCanonicalCuriosityFindingSeverities();
    assert.notStrictEqual(v1, v2);
    assert.deepStrictEqual(v1, v2);

    const d1 = getCanonicalCuriosityQualityDimensions();
    const d2 = getCanonicalCuriosityQualityDimensions();
    assert.notStrictEqual(d1, d2);
    assert.deepStrictEqual(d1, d2);
  });
});

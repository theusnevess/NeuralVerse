/**
 * NV-1500-D3-OPT-09 — Curriculum Certification & Structural Quality Gate Tests
 *
 * Deterministic test suite for the Curriculum Certification Engine.
 * Every test is deterministic and reproducible.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import type {
  CurriculumCompositionFinding,
  CurriculumCompositionCertificationReport,
  CurriculumCompositionCertificationInput,
} from './CurriculumAgentContract.ts';

import {
  CANONICAL_CURRICULUM_CERTIFICATION_STATUS,
  CANONICAL_CURRICULUM_FINDING_SEVERITY,
  CANONICAL_CURRICULUM_QUALITY_DIMENSIONS,
  CANONICAL_GOVERNANCE_STATUSES,
} from './CurriculumAgentContract.ts';

import {
  composeCertificationFinding,
  composeCertificationReport,
  composeCertificationReportFromParams,
  certifyCurriculumComposition,
  isSupportedCertificationStatus,
  isSupportedFindingSeverity,
  isSupportedQualityDimension,
  isSupportedCertificationGovernanceStatus,
  getCanonicalCertificationStatuses,
  getCanonicalFindingSeverities,
  getCanonicalQualityDimensions,
} from './CertificationEngine.ts';

import {
  validateCertificationFinding,
  validateCertificationReport,
  validateCertificationInput,
  CERTIFICATION_VALIDATION_CODES,
} from './CertificationValidation.ts';

// ---------------------------------------------------------------------------
// Test Fixtures
// ---------------------------------------------------------------------------

const VALID_FINDING_ERROR: CurriculumCompositionFinding = {
  findingId: 'finding-001',
  severity: 'error',
  dimension: 'graph_integrity',
  code: 'GRAPH_MISSING_NODES',
  message: 'Graph has no nodes.',
  rationale: 'Graph integrity requires at least one node.',
  source: 'certification-engine',
  governanceStatus: 'canonical',
  providedBy: 'curriculum-board',
};

const VALID_FINDING_WARNING: CurriculumCompositionFinding = {
  findingId: 'finding-002',
  severity: 'warning',
  dimension: 'coverage_integrity',
  code: 'COVERAGE_PARTIAL',
  message: 'Coverage is partial.',
  rationale: 'Partial coverage may affect learning outcomes.',
  source: 'certification-engine',
  governanceStatus: 'canonical',
  providedBy: 'curriculum-board',
};

const VALID_FINDING_RECOMMENDATION: CurriculumCompositionFinding = {
  findingId: 'finding-003',
  severity: 'recommendation',
  dimension: 'documentation_completeness',
  code: 'DOCS_MISSING',
  message: 'Documentation could be more complete.',
  rationale: 'Better documentation improves maintainability.',
  source: 'certification-engine',
  governanceStatus: 'canonical',
  providedBy: 'curriculum-board',
};

const VALID_INPUT: CurriculumCompositionCertificationInput = {
  reportId: 'report-001',
  artifactId: 'artifact-001',
  findings: [VALID_FINDING_WARNING, VALID_FINDING_RECOMMENDATION],
  qualityScore: 80,
  dimensionsChecked: ['coverage_integrity', 'documentation_completeness'],
};

// ---------------------------------------------------------------------------
// Valid Finding Composition Tests
// ---------------------------------------------------------------------------

describe('Certification Engine — Valid Finding Composition', () => {
  it('should compose a valid finding', () => {
    const finding = composeCertificationFinding(VALID_FINDING_ERROR);
    assert.strictEqual(finding.findingId, 'finding-001');
    assert.strictEqual(finding.severity, 'error');
    assert.strictEqual(finding.dimension, 'graph_integrity');
  });

  it('should validate a valid finding with no errors', () => {
    const errors = validateCertificationFinding(VALID_FINDING_ERROR);
    assert.deepStrictEqual(errors, []);
  });

  it('should validate a valid warning finding', () => {
    const errors = validateCertificationFinding(VALID_FINDING_WARNING);
    assert.deepStrictEqual(errors, []);
  });

  it('should validate a valid recommendation finding', () => {
    const errors = validateCertificationFinding(VALID_FINDING_RECOMMENDATION);
    assert.deepStrictEqual(errors, []);
  });
});

// ---------------------------------------------------------------------------
// Valid Report Tests
// ---------------------------------------------------------------------------

describe('Certification Engine — Valid Report', () => {
  it('should compose a valid report', () => {
    const report = composeCertificationReport(VALID_INPUT);
    assert.strictEqual(report.reportId, 'report-001');
    assert.strictEqual(report.artifactId, 'artifact-001');
    assert.strictEqual(report.status, 'certified_with_warnings');
    assert.strictEqual(report.findingCount, 2);
    assert.strictEqual(report.errorCount, 0);
    assert.strictEqual(report.warningCount, 1);
    assert.strictEqual(report.recommendationCount, 1);
  });

  it('should validate a valid report', () => {
    const report = composeCertificationReport(VALID_INPUT);
    const result = validateCertificationReport(report);
    assert.strictEqual(result.valid, true);
    assert.deepStrictEqual(result.errors, []);
    assert.strictEqual(result.checkedAt, 'curriculum_certification_structural_quality_gate');
  });
});

// ---------------------------------------------------------------------------
// Fully Certified Tests
// ---------------------------------------------------------------------------

describe('Certification Engine — Fully Certified', () => {
  it('should produce certified status when no findings exist', () => {
    const input: CurriculumCompositionCertificationInput = {
      reportId: 'report-cert',
      artifactId: 'artifact-cert',
      findings: [],
      qualityScore: 100,
      dimensionsChecked: ['graph_integrity'],
    };
    const report = certifyCurriculumComposition(input);
    assert.strictEqual(report.status, 'certified');
    assert.strictEqual(report.findingCount, 0);
    assert.strictEqual(report.qualityScore, 100);
  });
});

// ---------------------------------------------------------------------------
// Certified With Warnings Tests
// ---------------------------------------------------------------------------

describe('Certification Engine — Certified With Warnings', () => {
  it('should produce certified_with_warnings when only warnings exist', () => {
    const input: CurriculumCompositionCertificationInput = {
      reportId: 'report-warn',
      artifactId: 'artifact-warn',
      findings: [VALID_FINDING_WARNING],
      qualityScore: 90,
      dimensionsChecked: ['coverage_integrity'],
    };
    const report = certifyCurriculumComposition(input);
    assert.strictEqual(report.status, 'certified_with_warnings');
  });

  it('should produce certified_with_warnings when only recommendations exist', () => {
    const input: CurriculumCompositionCertificationInput = {
      reportId: 'report-rec',
      artifactId: 'artifact-rec',
      findings: [VALID_FINDING_RECOMMENDATION],
      qualityScore: 95,
      dimensionsChecked: ['documentation_completeness'],
    };
    const report = certifyCurriculumComposition(input);
    assert.strictEqual(report.status, 'certified_with_warnings');
  });
});

// ---------------------------------------------------------------------------
// Needs Revision Tests
// ---------------------------------------------------------------------------

describe('Certification Engine — Needs Revision', () => {
  it('should produce needs_revision when non-blocking errors exist', () => {
    const nonBlockingFinding: CurriculumCompositionFinding = {
      findingId: 'finding-nonblocking',
      severity: 'error',
      dimension: 'documentation_completeness',
      code: 'DOCS_MISSING',
      message: 'Documentation is missing.',
      rationale: 'Documentation is incomplete.',
      source: 'certification-engine',
      governanceStatus: 'canonical',
      providedBy: 'curriculum-board',
    };
    const input: CurriculumCompositionCertificationInput = {
      reportId: 'report-revise',
      artifactId: 'artifact-revise',
      findings: [nonBlockingFinding],
      qualityScore: 50,
      dimensionsChecked: ['documentation_completeness'],
    };
    const report = certifyCurriculumComposition(input);
    assert.strictEqual(report.status, 'needs_revision');
  });
});

// ---------------------------------------------------------------------------
// Blocked Tests
// ---------------------------------------------------------------------------

describe('Certification Engine — Blocked', () => {
  it('should produce blocked when structural violations exist', () => {
    const blockedFinding: CurriculumCompositionFinding = {
      findingId: 'finding-blocked',
      severity: 'error',
      dimension: 'determinism',
      code: 'NON_DETERMINISTIC',
      message: 'Non-deterministic behavior detected.',
      rationale: 'Structural violation.',
      source: 'certification-engine',
      governanceStatus: 'canonical',
      providedBy: 'curriculum-board',
    };
    const input: CurriculumCompositionCertificationInput = {
      reportId: 'report-blocked',
      artifactId: 'artifact-blocked',
      findings: [blockedFinding],
      qualityScore: 0,
      dimensionsChecked: ['determinism'],
    };
    const report = certifyCurriculumComposition(input);
    assert.strictEqual(report.status, 'blocked');
  });
});

// ---------------------------------------------------------------------------
// Missing Graph Tests
// ---------------------------------------------------------------------------

describe('Certification Engine — Missing Graph', () => {
  it('should detect missing graph findings', () => {
    const finding: CurriculumCompositionFinding = {
      findingId: 'finding-no-graph',
      severity: 'error',
      dimension: 'graph_integrity',
      code: 'GRAPH_MISSING',
      message: 'Graph is missing.',
      rationale: 'Graph is required.',
      source: 'certification-engine',
      governanceStatus: 'canonical',
      providedBy: 'curriculum-board',
    };
    const errors = validateCertificationFinding(finding);
    assert.deepStrictEqual(errors, []);
  });
});

// ---------------------------------------------------------------------------
// Dependency Cycle Tests
// ---------------------------------------------------------------------------

describe('Certification Engine — Dependency Cycle', () => {
  it('should handle dependency cycle findings', () => {
    const finding: CurriculumCompositionFinding = {
      findingId: 'finding-cycle',
      severity: 'error',
      dimension: 'dependency_integrity',
      code: 'DEPENDENCY_CYCLE',
      message: 'Dependency cycle detected.',
      rationale: 'Cycles prevent proper ordering.',
      source: 'certification-engine',
      governanceStatus: 'canonical',
      providedBy: 'curriculum-board',
    };
    const errors = validateCertificationFinding(finding);
    assert.deepStrictEqual(errors, []);
  });
});

// ---------------------------------------------------------------------------
// Invalid Progression Tests
// ---------------------------------------------------------------------------

describe('Certification Engine — Invalid Progression', () => {
  it('should handle invalid progression findings', () => {
    const finding: CurriculumCompositionFinding = {
      findingId: 'finding-progression',
      severity: 'error',
      dimension: 'progression_integrity',
      code: 'PROGRESSION_INVALID',
      message: 'Invalid progression state.',
      rationale: 'Progression must follow canonical states.',
      source: 'certification-engine',
      governanceStatus: 'canonical',
      providedBy: 'curriculum-board',
    };
    const errors = validateCertificationFinding(finding);
    assert.deepStrictEqual(errors, []);
  });
});

// ---------------------------------------------------------------------------
// Invalid Roadmap Tests
// ---------------------------------------------------------------------------

describe('Certification Engine — Invalid Roadmap', () => {
  it('should handle invalid roadmap findings', () => {
    const finding: CurriculumCompositionFinding = {
      findingId: 'finding-roadmap',
      severity: 'warning',
      dimension: 'roadmap_integrity',
      code: 'ROADMAP_MISSING',
      message: 'Roadmap is missing.',
      rationale: 'Roadmap provides learning structure.',
      source: 'certification-engine',
      governanceStatus: 'canonical',
      providedBy: 'curriculum-board',
    };
    const errors = validateCertificationFinding(finding);
    assert.deepStrictEqual(errors, []);
  });
});

// ---------------------------------------------------------------------------
// Missing Coverage Tests
// ---------------------------------------------------------------------------

describe('Certification Engine — Missing Coverage', () => {
  it('should handle missing coverage findings', () => {
    const finding: CurriculumCompositionFinding = {
      findingId: 'finding-coverage',
      severity: 'warning',
      dimension: 'coverage_integrity',
      code: 'COVERAGE_MISSING',
      message: 'Coverage analysis is missing.',
      rationale: 'Coverage ensures all concepts are addressed.',
      source: 'certification-engine',
      governanceStatus: 'canonical',
      providedBy: 'curriculum-board',
    };
    const errors = validateCertificationFinding(finding);
    assert.deepStrictEqual(errors, []);
  });
});

// ---------------------------------------------------------------------------
// Missing Provenance Tests
// ---------------------------------------------------------------------------

describe('Certification Engine — Missing Provenance', () => {
  it('should handle missing provenance findings', () => {
    const finding: CurriculumCompositionFinding = {
      findingId: 'finding-provenance',
      severity: 'error',
      dimension: 'provenance_integrity',
      code: 'PROVENANCE_MISSING',
      message: 'Provenance is missing.',
      rationale: 'Provenance is required for governance.',
      source: 'certification-engine',
      governanceStatus: 'canonical',
      providedBy: 'curriculum-board',
    };
    const errors = validateCertificationFinding(finding);
    assert.deepStrictEqual(errors, []);
  });
});

// ---------------------------------------------------------------------------
// Invalid Version Tests
// ---------------------------------------------------------------------------

describe('Certification Engine — Invalid Version', () => {
  it('should handle invalid version findings', () => {
    const finding: CurriculumCompositionFinding = {
      findingId: 'finding-version',
      severity: 'error',
      dimension: 'version_integrity',
      code: 'VERSION_INVALID',
      message: 'Version is invalid.',
      rationale: 'Version must follow semantic versioning.',
      source: 'certification-engine',
      governanceStatus: 'canonical',
      providedBy: 'curriculum-board',
    };
    const errors = validateCertificationFinding(finding);
    assert.deepStrictEqual(errors, []);
  });
});

// ---------------------------------------------------------------------------
// Invalid Evolution Tests
// ---------------------------------------------------------------------------

describe('Certification Engine — Invalid Evolution', () => {
  it('should handle invalid evolution findings', () => {
    const finding: CurriculumCompositionFinding = {
      findingId: 'finding-evolution',
      severity: 'warning',
      dimension: 'evolution_integrity',
      code: 'EVOLUTION_INVALID',
      message: 'Evolution record is invalid.',
      rationale: 'Evolution records must be consistent.',
      source: 'certification-engine',
      governanceStatus: 'canonical',
      providedBy: 'curriculum-board',
    };
    const errors = validateCertificationFinding(finding);
    assert.deepStrictEqual(errors, []);
  });
});

// ---------------------------------------------------------------------------
// Invalid Documentation Tests
// ---------------------------------------------------------------------------

describe('Certification Engine — Invalid Documentation', () => {
  it('should handle documentation completeness findings', () => {
    const finding: CurriculumCompositionFinding = {
      findingId: 'finding-docs',
      severity: 'recommendation',
      dimension: 'documentation_completeness',
      code: 'DOCS_INCOMPLETE',
      message: 'Documentation is incomplete.',
      rationale: 'Complete documentation improves maintainability.',
      source: 'certification-engine',
      governanceStatus: 'canonical',
      providedBy: 'curriculum-board',
    };
    const errors = validateCertificationFinding(finding);
    assert.deepStrictEqual(errors, []);
  });
});

// ---------------------------------------------------------------------------
// Duplicate Finding Tests
// ---------------------------------------------------------------------------

describe('Certification Engine — Duplicate Finding', () => {
  it('should detect duplicate findings in report', () => {
    const report: CurriculumCompositionCertificationReport = {
      reportId: 'report-dup',
      artifactId: 'artifact-dup',
      status: 'certified_with_warnings',
      findings: [VALID_FINDING_WARNING, VALID_FINDING_WARNING],
      findingCount: 2,
      errorCount: 0,
      warningCount: 2,
      recommendationCount: 0,
      qualityScore: 90,
      dimensionsChecked: ['coverage_integrity'],
      deterministic: true,
      generatedFrom: 'deterministic_certification_engine',
      randomUsed: false,
      timeDependency: false,
      curriculumMutated: false,
    };
    const result = validateCertificationReport(report);
    assert.strictEqual(result.valid, false);
    const dupError = result.errors.find(
      (e) => e.code === CERTIFICATION_VALIDATION_CODES.CERT_DUPLICATE_FINDING,
    );
    assert.ok(dupError, 'Should have CERT_DUPLICATE_FINDING error');
  });
});

// ---------------------------------------------------------------------------
// Invalid Score Tests
// ---------------------------------------------------------------------------

describe('Certification Engine — Invalid Score', () => {
  it('should detect invalid quality score below range', () => {
    const report: CurriculumCompositionCertificationReport = {
      reportId: 'report-score-low',
      artifactId: 'artifact-score-low',
      status: 'certified',
      findings: [],
      findingCount: 0,
      errorCount: 0,
      warningCount: 0,
      recommendationCount: 0,
      qualityScore: -10,
      dimensionsChecked: ['graph_integrity'],
      deterministic: true,
      generatedFrom: 'deterministic_certification_engine',
      randomUsed: false,
      timeDependency: false,
      curriculumMutated: false,
    };
    const result = validateCertificationReport(report);
    assert.strictEqual(result.valid, false);
    const scoreError = result.errors.find(
      (e) => e.code === CERTIFICATION_VALIDATION_CODES.CERT_INVALID_SCORE,
    );
    assert.ok(scoreError, 'Should have CERT_INVALID_SCORE error');
  });

  it('should detect invalid quality score above range', () => {
    const report: CurriculumCompositionCertificationReport = {
      reportId: 'report-score-high',
      artifactId: 'artifact-score-high',
      status: 'certified',
      findings: [],
      findingCount: 0,
      errorCount: 0,
      warningCount: 0,
      recommendationCount: 0,
      qualityScore: 110,
      dimensionsChecked: ['graph_integrity'],
      deterministic: true,
      generatedFrom: 'deterministic_certification_engine',
      randomUsed: false,
      timeDependency: false,
      curriculumMutated: false,
    };
    const result = validateCertificationReport(report);
    assert.strictEqual(result.valid, false);
    const scoreError = result.errors.find(
      (e) => e.code === CERTIFICATION_VALIDATION_CODES.CERT_INVALID_SCORE,
    );
    assert.ok(scoreError, 'Should have CERT_INVALID_SCORE error');
  });
});

// ---------------------------------------------------------------------------
// Invalid Status Tests
// ---------------------------------------------------------------------------

describe('Certification Engine — Invalid Status', () => {
  it('should detect invalid certification status', () => {
    const report: CurriculumCompositionCertificationReport = {
      reportId: 'report-invalid-status',
      artifactId: 'artifact-invalid-status',
      status: 'invalid_status' as any,
      findings: [],
      findingCount: 0,
      errorCount: 0,
      warningCount: 0,
      recommendationCount: 0,
      qualityScore: 100,
      dimensionsChecked: ['graph_integrity'],
      deterministic: true,
      generatedFrom: 'deterministic_certification_engine',
      randomUsed: false,
      timeDependency: false,
      curriculumMutated: false,
    };
    const result = validateCertificationReport(report);
    assert.strictEqual(result.valid, false);
    const statusError = result.errors.find(
      (e) => e.code === CERTIFICATION_VALIDATION_CODES.CERT_INVALID_STATUS,
    );
    assert.ok(statusError, 'Should have CERT_INVALID_STATUS error');
  });
});

// ---------------------------------------------------------------------------
// Deterministic Output Tests
// ---------------------------------------------------------------------------

describe('Certification Engine — Deterministic Output', () => {
  it('should produce identical output for identical input', () => {
    const report1 = certifyCurriculumComposition(VALID_INPUT);
    const report2 = certifyCurriculumComposition(VALID_INPUT);
    assert.deepStrictEqual(report1, report2);
  });

  it('should produce deterministic quality score', () => {
    const report1 = certifyCurriculumComposition(VALID_INPUT);
    const report2 = certifyCurriculumComposition(VALID_INPUT);
    assert.strictEqual(report1.qualityScore, report2.qualityScore);
  });

  it('should produce deterministic status resolution', () => {
    const report1 = certifyCurriculumComposition(VALID_INPUT);
    const report2 = certifyCurriculumComposition(VALID_INPUT);
    assert.strictEqual(report1.status, report2.status);
  });
});

// ---------------------------------------------------------------------------
// Immutable Input Tests
// ---------------------------------------------------------------------------

describe('Certification Engine — Immutable Input', () => {
  it('should not mutate input findings', () => {
    const findings = [VALID_FINDING_WARNING, VALID_FINDING_RECOMMENDATION];
    const original = [...findings];
    certifyCurriculumComposition({
      reportId: 'report-immutable',
      artifactId: 'artifact-immutable',
      findings,
      qualityScore: 80,
      dimensionsChecked: ['coverage_integrity'],
    });
    assert.deepStrictEqual(findings, original);
  });
});

// ---------------------------------------------------------------------------
// Identical Output Tests
// ---------------------------------------------------------------------------

describe('Certification Engine — Identical Output', () => {
  it('should produce identical output across 100 iterations', () => {
    const report1 = certifyCurriculumComposition(VALID_INPUT);
    for (let i = 0; i < 99; i++) {
      const report = certifyCurriculumComposition(VALID_INPUT);
      assert.deepStrictEqual(report, report1);
    }
  });
});

// ---------------------------------------------------------------------------
// Helper Function Tests
// ---------------------------------------------------------------------------

describe('Certification Engine — Helper Functions', () => {
  it('isSupportedCertificationStatus should return true for valid statuses', () => {
    for (const status of CANONICAL_CURRICULUM_CERTIFICATION_STATUS) {
      assert.strictEqual(isSupportedCertificationStatus(status), true);
    }
  });

  it('isSupportedCertificationStatus should return false for invalid statuses', () => {
    assert.strictEqual(isSupportedCertificationStatus('invalid'), false);
    assert.strictEqual(isSupportedCertificationStatus(''), false);
  });

  it('isSupportedFindingSeverity should return true for valid severities', () => {
    for (const severity of CANONICAL_CURRICULUM_FINDING_SEVERITY) {
      assert.strictEqual(isSupportedFindingSeverity(severity), true);
    }
  });

  it('isSupportedFindingSeverity should return false for invalid severities', () => {
    assert.strictEqual(isSupportedFindingSeverity('invalid'), false);
    assert.strictEqual(isSupportedFindingSeverity(''), false);
  });

  it('isSupportedQualityDimension should return true for valid dimensions', () => {
    for (const dimension of CANONICAL_CURRICULUM_QUALITY_DIMENSIONS) {
      assert.strictEqual(isSupportedQualityDimension(dimension), true);
    }
  });

  it('isSupportedQualityDimension should return false for invalid dimensions', () => {
    assert.strictEqual(isSupportedQualityDimension('invalid'), false);
    assert.strictEqual(isSupportedQualityDimension(''), false);
  });

  it('isSupportedCertificationGovernanceStatus should return true for valid statuses', () => {
    for (const status of CANONICAL_GOVERNANCE_STATUSES) {
      assert.strictEqual(isSupportedCertificationGovernanceStatus(status), true);
    }
  });

  it('isSupportedCertificationGovernanceStatus should return false for invalid statuses', () => {
    assert.strictEqual(isSupportedCertificationGovernanceStatus('invalid'), false);
    assert.strictEqual(isSupportedCertificationGovernanceStatus(''), false);
  });

  it('getCanonicalCertificationStatuses should return all canonical statuses', () => {
    const statuses = getCanonicalCertificationStatuses();
    assert.strictEqual(statuses.length, 4);
    assert.deepStrictEqual(statuses, CANONICAL_CURRICULUM_CERTIFICATION_STATUS);
  });

  it('getCanonicalFindingSeverities should return all canonical severities', () => {
    const severities = getCanonicalFindingSeverities();
    assert.strictEqual(severities.length, 3);
    assert.deepStrictEqual(severities, CANONICAL_CURRICULUM_FINDING_SEVERITY);
  });

  it('getCanonicalQualityDimensions should return all canonical dimensions', () => {
    const dimensions = getCanonicalQualityDimensions();
    assert.strictEqual(dimensions.length, 16);
    assert.deepStrictEqual(dimensions, CANONICAL_CURRICULUM_QUALITY_DIMENSIONS);
  });
});

// ---------------------------------------------------------------------------
// Validation Tests
// ---------------------------------------------------------------------------

describe('Certification Engine — Validation', () => {
  it('should validate certification input with no errors', () => {
    const errors = validateCertificationInput(VALID_INPUT);
    assert.deepStrictEqual(errors, []);
  });

  it('should detect missing report ID in input', () => {
    const input: CurriculumCompositionCertificationInput = {
      reportId: '',
      artifactId: 'artifact-001',
      findings: [VALID_FINDING_WARNING],
      qualityScore: 80,
      dimensionsChecked: ['coverage_integrity'],
    };
    const errors = validateCertificationInput(input);
    const idError = errors.find(
      (e) => e.code === CERTIFICATION_VALIDATION_CODES.CERT_MISSING_REPORT_ID,
    );
    assert.ok(idError, 'Should have CERT_MISSING_REPORT_ID error');
  });

  it('should detect missing artifact ID in input', () => {
    const input: CurriculumCompositionCertificationInput = {
      reportId: 'report-001',
      artifactId: '',
      findings: [VALID_FINDING_WARNING],
      qualityScore: 80,
      dimensionsChecked: ['coverage_integrity'],
    };
    const errors = validateCertificationInput(input);
    const idError = errors.find(
      (e) => e.code === CERTIFICATION_VALIDATION_CODES.CERT_MISSING_ARTIFACT_ID,
    );
    assert.ok(idError, 'Should have CERT_MISSING_ARTIFACT_ID error');
  });

  it('should detect empty findings in input', () => {
    const input: CurriculumCompositionCertificationInput = {
      reportId: 'report-001',
      artifactId: 'artifact-001',
      findings: [],
      qualityScore: 80,
      dimensionsChecked: ['coverage_integrity'],
    };
    const errors = validateCertificationInput(input);
    const emptyError = errors.find(
      (e) => e.code === CERTIFICATION_VALIDATION_CODES.CERT_EMPTY_FINDINGS,
    );
    assert.ok(emptyError, 'Should have CERT_EMPTY_FINDINGS error');
  });

  it('should detect invalid quality score in input', () => {
    const input: CurriculumCompositionCertificationInput = {
      reportId: 'report-001',
      artifactId: 'artifact-001',
      findings: [VALID_FINDING_WARNING],
      qualityScore: 150,
      dimensionsChecked: ['coverage_integrity'],
    };
    const errors = validateCertificationInput(input);
    const scoreError = errors.find(
      (e) => e.code === CERTIFICATION_VALIDATION_CODES.CERT_INVALID_SCORE,
    );
    assert.ok(scoreError, 'Should have CERT_INVALID_SCORE error');
  });

  it('should detect empty dimensions in input', () => {
    const input: CurriculumCompositionCertificationInput = {
      reportId: 'report-001',
      artifactId: 'artifact-001',
      findings: [VALID_FINDING_WARNING],
      qualityScore: 80,
      dimensionsChecked: [],
    };
    const errors = validateCertificationInput(input);
    const dimError = errors.find(
      (e) => e.code === CERTIFICATION_VALIDATION_CODES.CERT_EMPTY_DIMENSIONS,
    );
    assert.ok(dimError, 'Should have CERT_EMPTY_DIMENSIONS error');
  });
});

// ---------------------------------------------------------------------------
// Trace Validation Tests
// ---------------------------------------------------------------------------

describe('Certification Engine — Trace Validation', () => {
  it('should compose a report with correct counts', () => {
    const report = composeCertificationReport(VALID_INPUT);
    assert.strictEqual(report.findingCount, 2);
    assert.strictEqual(report.errorCount, 0);
    assert.strictEqual(report.warningCount, 1);
    assert.strictEqual(report.recommendationCount, 1);
    assert.strictEqual(report.deterministic, true);
    assert.strictEqual(report.randomUsed, false);
    assert.strictEqual(report.timeDependency, false);
    assert.strictEqual(report.curriculumMutated, false);
  });

  it('should compose a report with all findings having correct counts', () => {
    const input: CurriculumCompositionCertificationInput = {
      reportId: 'report-all',
      artifactId: 'artifact-all',
      findings: [VALID_FINDING_ERROR, VALID_FINDING_WARNING, VALID_FINDING_RECOMMENDATION],
      qualityScore: 50,
      dimensionsChecked: ['graph_integrity', 'coverage_integrity', 'documentation_completeness'],
    };
    const report = composeCertificationReport(input);
    assert.strictEqual(report.findingCount, 3);
    assert.strictEqual(report.errorCount, 1);
    assert.strictEqual(report.warningCount, 1);
    assert.strictEqual(report.recommendationCount, 1);
  });
});

// ---------------------------------------------------------------------------
// Provenance Validation Tests
// ---------------------------------------------------------------------------

describe('Certification Engine — Provenance Validation', () => {
  it('should validate finding provenance fields', () => {
    const errors = validateCertificationFinding(VALID_FINDING_ERROR);
    assert.deepStrictEqual(errors, []);
  });

  it('should detect missing source in finding', () => {
    const finding: CurriculumCompositionFinding = {
      ...VALID_FINDING_ERROR,
      source: '',
    };
    const errors = validateCertificationFinding(finding);
    const sourceError = errors.find(
      (e) => e.code === CERTIFICATION_VALIDATION_CODES.CERT_MISSING_SOURCE,
    );
    assert.ok(sourceError, 'Should have CERT_MISSING_SOURCE error');
  });

  it('should detect missing providedBy in finding', () => {
    const finding: CurriculumCompositionFinding = {
      ...VALID_FINDING_ERROR,
      providedBy: '',
    };
    const errors = validateCertificationFinding(finding);
    const providedByError = errors.find(
      (e) => e.code === CERTIFICATION_VALIDATION_CODES.CERT_MISSING_PROVIDED_BY,
    );
    assert.ok(providedByError, 'Should have CERT_MISSING_PROVIDED_BY error');
  });

  it('should detect missing rationale in finding', () => {
    const finding: CurriculumCompositionFinding = {
      ...VALID_FINDING_ERROR,
      rationale: '',
    };
    const errors = validateCertificationFinding(finding);
    const rationaleError = errors.find(
      (e) => e.code === CERTIFICATION_VALIDATION_CODES.CERT_FINDING_NO_RATIONALE,
    );
    assert.ok(rationaleError, 'Should have CERT_FINDING_NO_RATIONALE error');
  });
});

// ---------------------------------------------------------------------------
// Canonical Enum Completeness Tests
// ---------------------------------------------------------------------------

describe('Certification Engine — Canonical Enum Completeness', () => {
  it('should have exactly 4 canonical certification statuses', () => {
    assert.strictEqual(CANONICAL_CURRICULUM_CERTIFICATION_STATUS.length, 4);
  });

  it('should have exactly 3 canonical finding severities', () => {
    assert.strictEqual(CANONICAL_CURRICULUM_FINDING_SEVERITY.length, 3);
  });

  it('should have exactly 16 canonical quality dimensions', () => {
    assert.strictEqual(CANONICAL_CURRICULUM_QUALITY_DIMENSIONS.length, 16);
  });

  it('should contain all required certification statuses', () => {
    const required = ['certified', 'certified_with_warnings', 'needs_revision', 'blocked'];
    for (const status of required) {
      assert.ok(
        CANONICAL_CURRICULUM_CERTIFICATION_STATUS.includes(status as any),
        `Missing certification status: ${status}`,
      );
    }
  });

  it('should contain all required finding severities', () => {
    const required = ['error', 'warning', 'recommendation'];
    for (const severity of required) {
      assert.ok(
        CANONICAL_CURRICULUM_FINDING_SEVERITY.includes(severity as any),
        `Missing finding severity: ${severity}`,
      );
    }
  });

  it('should contain all required quality dimensions', () => {
    const required = [
      'graph_integrity',
      'dependency_integrity',
      'progression_integrity',
      'learning_path_integrity',
      'roadmap_integrity',
      'coverage_integrity',
      'review_integrity',
      'reinforcement_integrity',
      'evolution_integrity',
      'version_integrity',
      'provenance_integrity',
      'determinism',
      'architectural_boundary',
      'validation_integrity',
      'documentation_completeness',
      'governance_integrity',
    ];
    for (const dimension of required) {
      assert.ok(
        CANONICAL_CURRICULUM_QUALITY_DIMENSIONS.includes(dimension as any),
        `Missing quality dimension: ${dimension}`,
      );
    }
  });
});

// ---------------------------------------------------------------------------
// Negative Capability Tests
// ---------------------------------------------------------------------------

describe('Certification Engine — Negative Capability', () => {
  it('should not infer learner behavior', () => {
    const finding = composeCertificationFinding(VALID_FINDING_ERROR);
    assert.ok(!('learnerId' in finding));
    assert.ok(!('mastery' in finding));
    assert.ok(!('completionRate' in finding));
  });

  it('should not modify curriculum', () => {
    const finding = composeCertificationFinding(VALID_FINDING_ERROR);
    assert.ok(!('modifiedNodes' in finding));
    assert.ok(!('addedEdges' in finding));
    assert.ok(!('removedContent' in finding));
  });

  it('should not perform runtime scheduling', () => {
    const finding = composeCertificationFinding(VALID_FINDING_ERROR);
    assert.ok(!('scheduledAt' in finding));
    assert.ok(!('expiresAt' in finding));
    assert.ok(!('activationDate' in finding));
  });
});

// ---------------------------------------------------------------------------
// Quality Score Calculation Tests
// ---------------------------------------------------------------------------

describe('Certification Engine — Quality Score Calculation', () => {
  it('should calculate quality score starting from 100', () => {
    const input: CurriculumCompositionCertificationInput = {
      reportId: 'report-score',
      artifactId: 'artifact-score',
      findings: [],
      qualityScore: 100,
      dimensionsChecked: ['graph_integrity'],
    };
    const report = certifyCurriculumComposition(input);
    assert.strictEqual(report.qualityScore, 100);
  });

  it('should calculate quality score with deductions', () => {
    const input: CurriculumCompositionCertificationInput = {
      reportId: 'report-deductions',
      artifactId: 'artifact-deductions',
      findings: [VALID_FINDING_ERROR, VALID_FINDING_WARNING],
      qualityScore: 75,
      dimensionsChecked: ['graph_integrity', 'coverage_integrity'],
    };
    const report = certifyCurriculumComposition(input);
    assert.strictEqual(report.qualityScore, 75);
  });

  it('should calculate quality score with minimum 0', () => {
    const input: CurriculumCompositionCertificationInput = {
      reportId: 'report-min',
      artifactId: 'artifact-min',
      findings: [
        VALID_FINDING_ERROR,
        VALID_FINDING_ERROR,
        VALID_FINDING_ERROR,
        VALID_FINDING_ERROR,
        VALID_FINDING_ERROR,
        VALID_FINDING_ERROR,
      ],
      qualityScore: 0,
      dimensionsChecked: ['graph_integrity'],
    };
    const report = certifyCurriculumComposition(input);
    assert.strictEqual(report.qualityScore, 0);
  });
});

// ---------------------------------------------------------------------------
// Composition Report From Params Tests
// ---------------------------------------------------------------------------

describe('Certification Engine — Composition Report From Params', () => {
  it('should compose report from params with correct structure', () => {
    const report = composeCertificationReportFromParams({
      reportId: 'report-params',
      artifactId: 'artifact-params',
      findings: [VALID_FINDING_WARNING],
      dimensionsChecked: ['coverage_integrity'],
    });
    assert.strictEqual(report.reportId, 'report-params');
    assert.strictEqual(report.artifactId, 'artifact-params');
    assert.strictEqual(report.findingCount, 1);
    assert.strictEqual(report.deterministic, true);
    assert.strictEqual(report.generatedFrom, 'deterministic_certification_engine');
  });

  it('should compose report from params with no findings', () => {
    const report = composeCertificationReportFromParams({
      reportId: 'report-params-empty',
      artifactId: 'artifact-params-empty',
      findings: [],
      dimensionsChecked: ['graph_integrity'],
    });
    assert.strictEqual(report.status, 'certified');
    assert.strictEqual(report.findingCount, 0);
  });
});

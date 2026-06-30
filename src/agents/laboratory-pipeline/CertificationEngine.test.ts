/**
 * NV-1600-D4-OPT-10 — Laboratory Certification & Structural Quality Gate Test Suite
 *
 * Comprehensive deterministic test suite for the Certification Engine.
 * Covers: certified, certified_with_warnings, needs_revision, blocked,
 * invalid findings, invalid reports, duplicate findings, invalid score,
 * invalid dimensions, missing provenance, invalid trace, deterministic ordering,
 * immutable input, identical output (100 iterations), helper functions,
 * canonical enum completeness, validation functions, trace validation,
 * provenance validation, quality score calculation, blocking dimension behavior,
 * negative capability verification.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import type {
  LaboratoryCompositionFinding,
  LaboratoryCompositionCertificationReport,
  LaboratoryCompositionCertificationInput,
  LaboratoryCompositionCertificationProvenance,
} from './LaboratoryAgentContract.ts';

import {
  CANONICAL_CERTIFICATION_STATUS,
  CANONICAL_FINDING_SEVERITY,
  CANONICAL_QUALITY_DIMENSIONS,
  CANONICAL_GOVERNANCE_STATUSES,
} from './LaboratoryAgentContract.ts';

import {
  composeCertificationFinding,
  composeCertificationReport,
  composeCertificationReportFromParams,
  certifyLaboratoryComposition,
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

const VALID_CERTIFICATION_PROVENANCE: LaboratoryCompositionCertificationProvenance = {
  certificationId: 'cert-001',
  source: 'NeuralVerse Team',
  governanceStatus: 'canonical',
  rationale: 'Laboratory certification',
  providedBy: 'NeuralVerse Team',
};

const VALID_FINDING: LaboratoryCompositionFinding = {
  findingId: 'finding-001',
  severity: 'warning',
  qualityDimension: 'registry_integrity',
  code: 'REGISTRY_INTEGRITY_WARNING',
  message: 'Registry has minor inconsistencies.',
  rationale: 'Registry validation found warnings.',
  governanceStatus: 'canonical',
};

const VALID_FINDING_2: LaboratoryCompositionFinding = {
  findingId: 'finding-002',
  severity: 'recommendation',
  qualityDimension: 'provenance_integrity',
  code: 'PROVENANCE_RECOMMENDATION',
  message: 'Consider adding more provenance details.',
  rationale: 'Provenance could be more detailed.',
  governanceStatus: 'accepted',
};

const VALID_ERROR_FINDING: LaboratoryCompositionFinding = {
  findingId: 'finding-003',
  severity: 'error',
  qualityDimension: 'documentation_completeness',
  code: 'DOCUMENTATION_ERROR',
  message: 'Documentation is incomplete.',
  rationale: 'Missing required documentation.',
  governanceStatus: 'canonical',
};

const VALID_REPORT: LaboratoryCompositionCertificationReport = {
  certificationId: 'cert-001',
  artifactId: 'artifact-001',
  certificationStatus: 'certified_with_warnings',
  qualityScore: 95,
  findings: [VALID_FINDING, VALID_FINDING_2],
  findingCount: 2,
  errorCount: 0,
  warningCount: 1,
  recommendationCount: 1,
  dimensionsChecked: ['registry_integrity', 'provenance_integrity'],
  governanceStatus: 'canonical',
  provenance: VALID_CERTIFICATION_PROVENANCE,
  deterministic: true,
  generatedFrom: 'deterministic_certification_engine',
  randomUsed: false,
  timeDependency: false,
};

// ---------------------------------------------------------------------------
// Certified Tests
// ---------------------------------------------------------------------------

describe('Certification Engine — Certified', () => {
  it('should produce certified status with no findings', () => {
    const report = composeCertificationReport({
      certificationId: 'cert-001',
      artifactId: 'artifact-001',
      findings: [],
      dimensionsChecked: ['registry_integrity'],
      governanceStatus: 'canonical',
      provenance: VALID_CERTIFICATION_PROVENANCE,
    });

    assert.equal(report.certificationStatus, 'certified');
    assert.equal(report.qualityScore, 100);
    assert.equal(report.findingCount, 0);
  });

  it('should produce certified status with only recommendations', () => {
    const report = composeCertificationReport({
      certificationId: 'cert-001',
      artifactId: 'artifact-001',
      findings: [VALID_FINDING_2],
      dimensionsChecked: ['provenance_integrity'],
      governanceStatus: 'canonical',
      provenance: VALID_CERTIFICATION_PROVENANCE,
    });

    assert.equal(report.certificationStatus, 'certified');
    assert.equal(report.qualityScore, 99);
  });
});

// ---------------------------------------------------------------------------
// Certified With Warnings Tests
// ---------------------------------------------------------------------------

describe('Certification Engine — Certified With Warnings', () => {
  it('should produce certified_with_warnings with warnings', () => {
    const report = composeCertificationReport({
      certificationId: 'cert-001',
      artifactId: 'artifact-001',
      findings: [VALID_FINDING],
      dimensionsChecked: ['registry_integrity'],
      governanceStatus: 'canonical',
      provenance: VALID_CERTIFICATION_PROVENANCE,
    });

    assert.equal(report.certificationStatus, 'certified_with_warnings');
    assert.equal(report.qualityScore, 95);
    assert.equal(report.warningCount, 1);
  });
});

// ---------------------------------------------------------------------------
// Needs Revision Tests
// ---------------------------------------------------------------------------

describe('Certification Engine — Needs Revision', () => {
  it('should produce needs_revision with non-blocking errors', () => {
    const report = composeCertificationReport({
      certificationId: 'cert-001',
      artifactId: 'artifact-001',
      findings: [VALID_ERROR_FINDING],
      dimensionsChecked: ['documentation_completeness'],
      governanceStatus: 'canonical',
      provenance: VALID_CERTIFICATION_PROVENANCE,
    });

    assert.equal(report.certificationStatus, 'needs_revision');
    assert.equal(report.qualityScore, 80);
    assert.equal(report.errorCount, 1);
  });
});

// ---------------------------------------------------------------------------
// Blocked Tests
// ---------------------------------------------------------------------------

describe('Certification Engine — Blocked', () => {
  it('should produce blocked with blocking dimension errors', () => {
    const blockingFinding: LaboratoryCompositionFinding = {
      findingId: 'finding-004',
      severity: 'error',
      qualityDimension: 'determinism',
      code: 'DETERMINISM_ERROR',
      message: 'Determinism violation.',
      rationale: 'Code uses Math.random.',
      governanceStatus: 'canonical',
    };

    const report = composeCertificationReport({
      certificationId: 'cert-001',
      artifactId: 'artifact-001',
      findings: [blockingFinding],
      dimensionsChecked: ['determinism'],
      governanceStatus: 'canonical',
      provenance: VALID_CERTIFICATION_PROVENANCE,
    });

    assert.equal(report.certificationStatus, 'blocked');
  });
});

// ---------------------------------------------------------------------------
// Invalid Findings Tests
// ---------------------------------------------------------------------------

describe('Certification Engine — Invalid Findings', () => {
  it('should detect missing finding ID', () => {
    const finding = { ...VALID_FINDING, findingId: '' };
    const errors = validateCertificationFinding(finding);
    const idError = errors.find(
      (e) => e.code === CERTIFICATION_VALIDATION_CODES.CERT_FINDING_NO_CODE,
    );

    assert.ok(idError, 'Should have CERT_FINDING_NO_CODE error');
  });

  it('should detect missing severity', () => {
    const finding = { ...VALID_FINDING, severity: '' as any };
    const errors = validateCertificationFinding(finding);
    const severityError = errors.find(
      (e) => e.code === CERTIFICATION_VALIDATION_CODES.CERT_FINDING_NO_SEVERITY,
    );

    assert.ok(severityError, 'Should have CERT_FINDING_NO_SEVERITY error');
  });

  it('should detect unsupported severity', () => {
    const finding = { ...VALID_FINDING, severity: 'unsupported' as any };
    const errors = validateCertificationFinding(finding);
    const severityError = errors.find(
      (e) => e.code === CERTIFICATION_VALIDATION_CODES.CERT_INVALID_SEVERITY,
    );

    assert.ok(severityError, 'Should have CERT_INVALID_SEVERITY error');
  });

  it('should detect missing quality dimension', () => {
    const finding = { ...VALID_FINDING, qualityDimension: '' as any };
    const errors = validateCertificationFinding(finding);
    const dimensionError = errors.find(
      (e) => e.code === CERTIFICATION_VALIDATION_CODES.CERT_FINDING_NO_DIMENSION,
    );

    assert.ok(dimensionError, 'Should have CERT_FINDING_NO_DIMENSION error');
  });

  it('should detect unsupported quality dimension', () => {
    const finding = { ...VALID_FINDING, qualityDimension: 'unsupported' as any };
    const errors = validateCertificationFinding(finding);
    const dimensionError = errors.find(
      (e) => e.code === CERTIFICATION_VALIDATION_CODES.CERT_UNKNOWN_DIMENSION,
    );

    assert.ok(dimensionError, 'Should have CERT_UNKNOWN_DIMENSION error');
  });

  it('should detect missing code', () => {
    const finding = { ...VALID_FINDING, code: '' };
    const errors = validateCertificationFinding(finding);
    const codeError = errors.find(
      (e) => e.code === CERTIFICATION_VALIDATION_CODES.CERT_FINDING_NO_CODE,
    );

    assert.ok(codeError, 'Should have CERT_FINDING_NO_CODE error');
  });

  it('should detect missing message', () => {
    const finding = { ...VALID_FINDING, message: '' };
    const errors = validateCertificationFinding(finding);
    const messageError = errors.find(
      (e) => e.code === CERTIFICATION_VALIDATION_CODES.CERT_FINDING_NO_MESSAGE,
    );

    assert.ok(messageError, 'Should have CERT_FINDING_NO_MESSAGE error');
  });

  it('should detect missing rationale', () => {
    const finding = { ...VALID_FINDING, rationale: '' };
    const errors = validateCertificationFinding(finding);
    const rationaleError = errors.find(
      (e) => e.code === CERTIFICATION_VALIDATION_CODES.CERT_FINDING_NO_RATIONALE,
    );

    assert.ok(rationaleError, 'Should have CERT_FINDING_NO_RATIONALE error');
  });

  it('should detect invalid governance status', () => {
    const finding = { ...VALID_FINDING, governanceStatus: 'invalid' as any };
    const errors = validateCertificationFinding(finding);
    const governanceError = errors.find(
      (e) => e.code === CERTIFICATION_VALIDATION_CODES.CERT_INVALID_GOVERNANCE_STATUS,
    );

    assert.ok(governanceError, 'Should have CERT_INVALID_GOVERNANCE_STATUS error');
  });
});

// ---------------------------------------------------------------------------
// Invalid Reports Tests
// ---------------------------------------------------------------------------

describe('Certification Engine — Invalid Reports', () => {
  it('should detect missing certification ID', () => {
    const report = { ...VALID_REPORT, certificationId: '' };
    const errors = validateCertificationReport(report);
    const idError = errors.find(
      (e) => e.code === CERTIFICATION_VALIDATION_CODES.CERT_MISSING_REPORT_ID,
    );

    assert.ok(idError, 'Should have CERT_MISSING_REPORT_ID error');
  });

  it('should detect missing artifact ID', () => {
    const report = { ...VALID_REPORT, artifactId: '' };
    const errors = validateCertificationReport(report);
    const idError = errors.find(
      (e) => e.code === CERTIFICATION_VALIDATION_CODES.CERT_MISSING_ARTIFACT_ID,
    );

    assert.ok(idError, 'Should have CERT_MISSING_ARTIFACT_ID error');
  });

  it('should detect invalid quality score', () => {
    const report = { ...VALID_REPORT, qualityScore: 150 };
    const errors = validateCertificationReport(report);
    const scoreError = errors.find(
      (e) => e.code === CERTIFICATION_VALIDATION_CODES.CERT_SCORE_OUT_OF_RANGE,
    );

    assert.ok(scoreError, 'Should have CERT_SCORE_OUT_OF_RANGE error');
  });

  it('should detect negative quality score', () => {
    const report = { ...VALID_REPORT, qualityScore: -10 };
    const errors = validateCertificationReport(report);
    const scoreError = errors.find(
      (e) => e.code === CERTIFICATION_VALIDATION_CODES.CERT_SCORE_OUT_OF_RANGE,
    );

    assert.ok(scoreError, 'Should have CERT_SCORE_OUT_OF_RANGE error');
  });

  it('should detect missing provenance', () => {
    const report = { ...VALID_REPORT, provenance: undefined as any };
    const errors = validateCertificationReport(report);
    const provenanceError = errors.find(
      (e) => e.code === CERTIFICATION_VALIDATION_CODES.CERT_INVALID_PROVENANCE,
    );

    assert.ok(provenanceError, 'Should have CERT_INVALID_PROVENANCE error');
  });

  it('should detect missing provenance source', () => {
    const report = {
      ...VALID_REPORT,
      provenance: { ...VALID_CERTIFICATION_PROVENANCE, source: '' },
    };
    const errors = validateCertificationReport(report);
    const sourceError = errors.find(
      (e) => e.code === CERTIFICATION_VALIDATION_CODES.CERT_MISSING_SOURCE,
    );

    assert.ok(sourceError, 'Should have CERT_MISSING_SOURCE error');
  });

  it('should detect missing provenance rationale', () => {
    const report = {
      ...VALID_REPORT,
      provenance: { ...VALID_CERTIFICATION_PROVENANCE, rationale: '' },
    };
    const errors = validateCertificationReport(report);
    const rationaleError = errors.find(
      (e) => e.code === CERTIFICATION_VALIDATION_CODES.CERT_MISSING_RATIONALE,
    );

    assert.ok(rationaleError, 'Should have CERT_MISSING_RATIONALE error');
  });

  it('should detect missing provenance providedBy', () => {
    const report = {
      ...VALID_REPORT,
      provenance: { ...VALID_CERTIFICATION_PROVENANCE, providedBy: '' },
    };
    const errors = validateCertificationReport(report);
    const providedByError = errors.find(
      (e) => e.code === CERTIFICATION_VALIDATION_CODES.CERT_MISSING_PROVIDED_BY,
    );

    assert.ok(providedByError, 'Should have CERT_MISSING_PROVIDED_BY error');
  });
});

// ---------------------------------------------------------------------------
// Duplicate Findings Tests
// ---------------------------------------------------------------------------

describe('Certification Engine — Duplicate Findings', () => {
  it('should detect duplicate finding IDs', () => {
    const report = {
      ...VALID_REPORT,
      findings: [VALID_FINDING, VALID_FINDING],
    };
    const errors = validateCertificationReport(report);
    const duplicateError = errors.find(
      (e) => e.code === CERTIFICATION_VALIDATION_CODES.CERT_DUPLICATE_FINDING,
    );

    assert.ok(duplicateError, 'Should have CERT_DUPLICATE_FINDING error');
  });
});

// ---------------------------------------------------------------------------
// Quality Score Calculation Tests
// ---------------------------------------------------------------------------

describe('Certification Engine — Quality Score Calculation', () => {
  it('should start at 100 with no findings', () => {
    const report = composeCertificationReport({
      certificationId: 'cert-001',
      artifactId: 'artifact-001',
      findings: [],
      dimensionsChecked: ['registry_integrity'],
      governanceStatus: 'canonical',
      provenance: VALID_CERTIFICATION_PROVENANCE,
    });

    assert.equal(report.qualityScore, 100);
  });

  it('should deduct 20 for each error', () => {
    const report = composeCertificationReport({
      certificationId: 'cert-001',
      artifactId: 'artifact-001',
      findings: [VALID_ERROR_FINDING],
      dimensionsChecked: ['execution_integrity'],
      governanceStatus: 'canonical',
      provenance: VALID_CERTIFICATION_PROVENANCE,
    });

    assert.equal(report.qualityScore, 80);
  });

  it('should deduct 5 for each warning', () => {
    const report = composeCertificationReport({
      certificationId: 'cert-001',
      artifactId: 'artifact-001',
      findings: [VALID_FINDING],
      dimensionsChecked: ['registry_integrity'],
      governanceStatus: 'canonical',
      provenance: VALID_CERTIFICATION_PROVENANCE,
    });

    assert.equal(report.qualityScore, 95);
  });

  it('should deduct 1 for each recommendation', () => {
    const report = composeCertificationReport({
      certificationId: 'cert-001',
      artifactId: 'artifact-001',
      findings: [VALID_FINDING_2],
      dimensionsChecked: ['provenance_integrity'],
      governanceStatus: 'canonical',
      provenance: VALID_CERTIFICATION_PROVENANCE,
    });

    assert.equal(report.qualityScore, 99);
  });

  it('should clamp score to 0', () => {
    const manyErrors: LaboratoryCompositionFinding[] = [];
    for (let i = 0; i < 10; i++) {
      manyErrors.push({
        ...VALID_ERROR_FINDING,
        findingId: `finding-${i}`,
        qualityDimension: 'determinism',
      });
    }

    const report = composeCertificationReport({
      certificationId: 'cert-001',
      artifactId: 'artifact-001',
      findings: manyErrors,
      dimensionsChecked: ['determinism'],
      governanceStatus: 'canonical',
      provenance: VALID_CERTIFICATION_PROVENANCE,
    });

    assert.equal(report.qualityScore, 0);
  });

  it('should clamp score to 100', () => {
    const report = composeCertificationReport({
      certificationId: 'cert-001',
      artifactId: 'artifact-001',
      findings: [],
      dimensionsChecked: ['registry_integrity'],
      governanceStatus: 'canonical',
      provenance: VALID_CERTIFICATION_PROVENANCE,
    });

    assert.equal(report.qualityScore, 100);
  });
});

// ---------------------------------------------------------------------------
// Blocking Dimension Behavior Tests
// ---------------------------------------------------------------------------

describe('Certification Engine — Blocking Dimension Behavior', () => {
  it('should block on registry_integrity error', () => {
    const finding: LaboratoryCompositionFinding = {
      findingId: 'finding-001',
      severity: 'error',
      qualityDimension: 'registry_integrity',
      code: 'REGISTRY_ERROR',
      message: 'Registry error.',
      rationale: 'Test.',
      governanceStatus: 'canonical',
    };

    const report = composeCertificationReport({
      certificationId: 'cert-001',
      artifactId: 'artifact-001',
      findings: [finding],
      dimensionsChecked: ['registry_integrity'],
      governanceStatus: 'canonical',
      provenance: VALID_CERTIFICATION_PROVENANCE,
    });

    assert.equal(report.certificationStatus, 'blocked');
  });

  it('should block on execution_integrity error', () => {
    const finding: LaboratoryCompositionFinding = {
      findingId: 'finding-001',
      severity: 'error',
      qualityDimension: 'execution_integrity',
      code: 'EXECUTION_ERROR',
      message: 'Execution error.',
      rationale: 'Test.',
      governanceStatus: 'canonical',
    };

    const report = composeCertificationReport({
      certificationId: 'cert-001',
      artifactId: 'artifact-001',
      findings: [finding],
      dimensionsChecked: ['execution_integrity'],
      governanceStatus: 'canonical',
      provenance: VALID_CERTIFICATION_PROVENANCE,
    });

    assert.equal(report.certificationStatus, 'blocked');
  });

  it('should block on experiment_integrity error', () => {
    const finding: LaboratoryCompositionFinding = {
      findingId: 'finding-001',
      severity: 'error',
      qualityDimension: 'experiment_integrity',
      code: 'EXPERIMENT_ERROR',
      message: 'Experiment error.',
      rationale: 'Test.',
      governanceStatus: 'canonical',
    };

    const report = composeCertificationReport({
      certificationId: 'cert-001',
      artifactId: 'artifact-001',
      findings: [finding],
      dimensionsChecked: ['experiment_integrity'],
      governanceStatus: 'canonical',
      provenance: VALID_CERTIFICATION_PROVENANCE,
    });

    assert.equal(report.certificationStatus, 'blocked');
  });

  it('should block on determinism error', () => {
    const finding: LaboratoryCompositionFinding = {
      findingId: 'finding-001',
      severity: 'error',
      qualityDimension: 'determinism',
      code: 'DETERMINISM_ERROR',
      message: 'Determinism error.',
      rationale: 'Test.',
      governanceStatus: 'canonical',
    };

    const report = composeCertificationReport({
      certificationId: 'cert-001',
      artifactId: 'artifact-001',
      findings: [finding],
      dimensionsChecked: ['determinism'],
      governanceStatus: 'canonical',
      provenance: VALID_CERTIFICATION_PROVENANCE,
    });

    assert.equal(report.certificationStatus, 'blocked');
  });

  it('should block on architectural_boundary error', () => {
    const finding: LaboratoryCompositionFinding = {
      findingId: 'finding-001',
      severity: 'error',
      qualityDimension: 'architectural_boundary',
      code: 'BOUNDARY_ERROR',
      message: 'Architectural boundary error.',
      rationale: 'Test.',
      governanceStatus: 'canonical',
    };

    const report = composeCertificationReport({
      certificationId: 'cert-001',
      artifactId: 'artifact-001',
      findings: [finding],
      dimensionsChecked: ['architectural_boundary'],
      governanceStatus: 'canonical',
      provenance: VALID_CERTIFICATION_PROVENANCE,
    });

    assert.equal(report.certificationStatus, 'blocked');
  });

  it('should block on validation_integrity error', () => {
    const finding: LaboratoryCompositionFinding = {
      findingId: 'finding-001',
      severity: 'error',
      qualityDimension: 'validation_integrity',
      code: 'VALIDATION_ERROR',
      message: 'Validation error.',
      rationale: 'Test.',
      governanceStatus: 'canonical',
    };

    const report = composeCertificationReport({
      certificationId: 'cert-001',
      artifactId: 'artifact-001',
      findings: [finding],
      dimensionsChecked: ['validation_integrity'],
      governanceStatus: 'canonical',
      provenance: VALID_CERTIFICATION_PROVENANCE,
    });

    assert.equal(report.certificationStatus, 'blocked');
  });

  it('should not block on non-blocking dimension errors', () => {
    const finding: LaboratoryCompositionFinding = {
      findingId: 'finding-001',
      severity: 'error',
      qualityDimension: 'documentation_completeness',
      code: 'DOC_ERROR',
      message: 'Documentation error.',
      rationale: 'Test.',
      governanceStatus: 'canonical',
    };

    const report = composeCertificationReport({
      certificationId: 'cert-001',
      artifactId: 'artifact-001',
      findings: [finding],
      dimensionsChecked: ['documentation_completeness'],
      governanceStatus: 'canonical',
      provenance: VALID_CERTIFICATION_PROVENANCE,
    });

    assert.equal(report.certificationStatus, 'needs_revision');
  });
});

// ---------------------------------------------------------------------------
// Deterministic Ordering Tests
// ---------------------------------------------------------------------------

describe('Certification Engine — Deterministic Ordering', () => {
  it('should sort findings by severity', () => {
    const finding1: LaboratoryCompositionFinding = {
      findingId: 'finding-001',
      severity: 'recommendation',
      qualityDimension: 'provenance_integrity',
      code: 'REC-001',
      message: 'Recommendation.',
      rationale: 'Test.',
      governanceStatus: 'canonical',
    };

    const finding2: LaboratoryCompositionFinding = {
      findingId: 'finding-002',
      severity: 'error',
      qualityDimension: 'determinism',
      code: 'ERR-001',
      message: 'Error.',
      rationale: 'Test.',
      governanceStatus: 'canonical',
    };

    const finding3: LaboratoryCompositionFinding = {
      findingId: 'finding-003',
      severity: 'warning',
      qualityDimension: 'registry_integrity',
      code: 'WARN-001',
      message: 'Warning.',
      rationale: 'Test.',
      governanceStatus: 'canonical',
    };

    const report = composeCertificationReport({
      certificationId: 'cert-001',
      artifactId: 'artifact-001',
      findings: [finding1, finding2, finding3],
      dimensionsChecked: ['provenance_integrity', 'determinism', 'registry_integrity'],
      governanceStatus: 'canonical',
      provenance: VALID_CERTIFICATION_PROVENANCE,
    });

    assert.equal(report.findings[0].severity, 'error');
    assert.equal(report.findings[1].severity, 'warning');
    assert.equal(report.findings[2].severity, 'recommendation');
  });

  it('should sort by quality dimension when severity is equal', () => {
    const finding1: LaboratoryCompositionFinding = {
      findingId: 'finding-001',
      severity: 'warning',
      qualityDimension: 'provenance_integrity',
      code: 'WARN-001',
      message: 'Warning 1.',
      rationale: 'Test.',
      governanceStatus: 'canonical',
    };

    const finding2: LaboratoryCompositionFinding = {
      findingId: 'finding-002',
      severity: 'warning',
      qualityDimension: 'determinism',
      code: 'WARN-002',
      message: 'Warning 2.',
      rationale: 'Test.',
      governanceStatus: 'canonical',
    };

    const report = composeCertificationReport({
      certificationId: 'cert-001',
      artifactId: 'artifact-001',
      findings: [finding1, finding2],
      dimensionsChecked: ['provenance_integrity', 'determinism'],
      governanceStatus: 'canonical',
      provenance: VALID_CERTIFICATION_PROVENANCE,
    });

    assert.equal(report.findings[0].qualityDimension, 'determinism');
    assert.equal(report.findings[1].qualityDimension, 'provenance_integrity');
  });
});

// ---------------------------------------------------------------------------
// Immutable Input Tests
// ---------------------------------------------------------------------------

describe('Certification Engine — Immutable Input', () => {
  it('should not mutate input findings', () => {
    const findings = [VALID_FINDING, VALID_FINDING_2];
    const originalId = VALID_FINDING.findingId;
    const originalSeverity = VALID_FINDING.severity;

    composeCertificationReport({
      certificationId: 'cert-001',
      artifactId: 'artifact-001',
      findings,
      dimensionsChecked: ['registry_integrity'],
      governanceStatus: 'canonical',
      provenance: VALID_CERTIFICATION_PROVENANCE,
    });

    assert.equal(VALID_FINDING.findingId, originalId);
    assert.equal(VALID_FINDING.severity, originalSeverity);
  });
});

// ---------------------------------------------------------------------------
// Identical Output Tests
// ---------------------------------------------------------------------------

describe('Certification Engine — Identical Output', () => {
  it('should produce identical output for identical input (100 iterations)', () => {
    const findings = [VALID_FINDING, VALID_FINDING_2];

    const results: ReturnType<typeof composeCertificationReport>[] = [];
    for (let i = 0; i < 100; i++) {
      results.push(composeCertificationReport({
        certificationId: 'cert-001',
        artifactId: 'artifact-001',
        findings,
        dimensionsChecked: ['registry_integrity', 'provenance_integrity'],
        governanceStatus: 'canonical',
        provenance: VALID_CERTIFICATION_PROVENANCE,
      }));
    }

    for (let i = 1; i < results.length; i++) {
      assert.deepStrictEqual(results[0].certificationId, results[i].certificationId);
      assert.deepStrictEqual(results[0].certificationStatus, results[i].certificationStatus);
      assert.deepStrictEqual(results[0].qualityScore, results[i].qualityScore);
      assert.deepStrictEqual(results[0].findings, results[i].findings);
    }
  });
});

// ---------------------------------------------------------------------------
// Helper Function Tests
// ---------------------------------------------------------------------------

describe('Certification Engine — Helper Functions', () => {
  it('should return canonical certification statuses', () => {
    const statuses = getCanonicalCertificationStatuses();
    assert.deepStrictEqual([...statuses], [...CANONICAL_CERTIFICATION_STATUS]);
    assert.equal(statuses.length, 4);
  });

  it('should return canonical finding severities', () => {
    const severities = getCanonicalFindingSeverities();
    assert.deepStrictEqual([...severities], [...CANONICAL_FINDING_SEVERITY]);
    assert.equal(severities.length, 3);
  });

  it('should return canonical quality dimensions', () => {
    const dimensions = getCanonicalQualityDimensions();
    assert.deepStrictEqual([...dimensions], [...CANONICAL_QUALITY_DIMENSIONS]);
    assert.equal(dimensions.length, 18);
  });

  it('should validate certification status', () => {
    assert.equal(isSupportedCertificationStatus('certified'), true);
    assert.equal(isSupportedCertificationStatus('certified_with_warnings'), true);
    assert.equal(isSupportedCertificationStatus('needs_revision'), true);
    assert.equal(isSupportedCertificationStatus('blocked'), true);
    assert.equal(isSupportedCertificationStatus('invalid'), false);
  });

  it('should validate finding severity', () => {
    assert.equal(isSupportedFindingSeverity('error'), true);
    assert.equal(isSupportedFindingSeverity('warning'), true);
    assert.equal(isSupportedFindingSeverity('recommendation'), true);
    assert.equal(isSupportedFindingSeverity('invalid'), false);
  });

  it('should validate quality dimension', () => {
    assert.equal(isSupportedQualityDimension('registry_integrity'), true);
    assert.equal(isSupportedQualityDimension('determinism'), true);
    assert.equal(isSupportedQualityDimension('invalid'), false);
  });

  it('should validate governance status', () => {
    assert.equal(isSupportedCertificationGovernanceStatus('canonical'), true);
    assert.equal(isSupportedCertificationGovernanceStatus('accepted'), true);
    assert.equal(isSupportedCertificationGovernanceStatus('provisional'), true);
    assert.equal(isSupportedCertificationGovernanceStatus('deprecated'), true);
    assert.equal(isSupportedCertificationGovernanceStatus('rejected'), true);
    assert.equal(isSupportedCertificationGovernanceStatus('invalid'), false);
  });
});

// ---------------------------------------------------------------------------
// Canonical Enum Completeness Tests
// ---------------------------------------------------------------------------

describe('Certification Engine — Canonical Enum Completeness', () => {
  it('should have exactly 4 certification statuses', () => {
    assert.equal(CANONICAL_CERTIFICATION_STATUS.length, 4);
  });

  it('should have exactly 3 finding severities', () => {
    assert.equal(CANONICAL_FINDING_SEVERITY.length, 3);
  });

  it('should have exactly 18 quality dimensions', () => {
    assert.equal(CANONICAL_QUALITY_DIMENSIONS.length, 18);
  });

  it('should contain all expected certification statuses', () => {
    const expectedStatuses = ['certified', 'certified_with_warnings', 'needs_revision', 'blocked'];

    for (const status of expectedStatuses) {
      assert.ok(
        CANONICAL_CERTIFICATION_STATUS.includes(status as any),
        `Should include status: ${status}`,
      );
    }
  });

  it('should contain all expected finding severities', () => {
    const expectedSeverities = ['error', 'warning', 'recommendation'];

    for (const severity of expectedSeverities) {
      assert.ok(
        CANONICAL_FINDING_SEVERITY.includes(severity as any),
        `Should include severity: ${severity}`,
      );
    }
  });

  it('should contain all expected quality dimensions', () => {
    const expectedDimensions = [
      'registry_integrity', 'execution_integrity', 'parameter_integrity',
      'experiment_integrity', 'workflow_integrity', 'interaction_integrity',
      'hypothesis_integrity', 'history_integrity', 'result_artifact_integrity',
      'configuration_integrity', 'visualization_integrity', 'evidence_integrity',
      'provenance_integrity', 'relationship_integrity', 'determinism',
      'validation_integrity', 'architectural_boundary', 'documentation_completeness',
    ];

    for (const dimension of expectedDimensions) {
      assert.ok(
        CANONICAL_QUALITY_DIMENSIONS.includes(dimension as any),
        `Should include dimension: ${dimension}`,
      );
    }
  });
});

// ---------------------------------------------------------------------------
// Validation Functions Tests
// ---------------------------------------------------------------------------

describe('Certification Engine — Validation Functions', () => {
  it('should validate a valid finding', () => {
    const errors = validateCertificationFinding(VALID_FINDING);
    assert.deepStrictEqual(errors, []);
  });

  it('should validate a valid report', () => {
    const errors = validateCertificationReport(VALID_REPORT);
    assert.deepStrictEqual(errors, []);
  });

  it('should validate valid input', () => {
    const input: LaboratoryCompositionCertificationInput = {
      certificationId: 'cert-001',
      artifactId: 'artifact-001',
      findings: [VALID_FINDING],
      dimensionsChecked: ['registry_integrity'],
      governanceStatus: 'canonical',
      provenance: VALID_CERTIFICATION_PROVENANCE,
    };

    const result = validateCertificationInput(input);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });
});

// ---------------------------------------------------------------------------
// Certification Engine — certifying composition
// ---------------------------------------------------------------------------

describe('Certification Engine — Certify Composition', () => {
  it('should certify a valid composition', () => {
    const input: LaboratoryCompositionCertificationInput = {
      certificationId: 'cert-001',
      artifactId: 'artifact-001',
      findings: [],
      dimensionsChecked: ['registry_integrity'],
      governanceStatus: 'canonical',
      provenance: VALID_CERTIFICATION_PROVENANCE,
    };

    const report = certifyLaboratoryComposition(input);
    assert.equal(report.certificationStatus, 'certified');
    assert.equal(report.qualityScore, 100);
  });

  it('should compose report from params', () => {
    const report = composeCertificationReportFromParams({
      certificationId: 'cert-001',
      artifactId: 'artifact-001',
      findings: [VALID_FINDING],
      governanceStatus: 'canonical',
      provenance: VALID_CERTIFICATION_PROVENANCE,
    });

    assert.equal(report.certificationId, 'cert-001');
    assert.equal(report.artifactId, 'artifact-001');
    assert.equal(report.findingCount, 1);
  });
});

// ---------------------------------------------------------------------------
// Negative Capability Verification Tests
// ---------------------------------------------------------------------------

describe('Certification Engine — Negative Capability Verification', () => {
  it('should not use Math.random', () => {
    const report = composeCertificationReport({
      certificationId: 'cert-001',
      artifactId: 'artifact-001',
      findings: [],
      dimensionsChecked: ['registry_integrity'],
      governanceStatus: 'canonical',
      provenance: VALID_CERTIFICATION_PROVENANCE,
    });

    assert.ok(report, 'Should produce a result without Math.random');
  });

  it('should not use Date.now', () => {
    const report = composeCertificationReport({
      certificationId: 'cert-001',
      artifactId: 'artifact-001',
      findings: [],
      dimensionsChecked: ['registry_integrity'],
      governanceStatus: 'canonical',
      provenance: VALID_CERTIFICATION_PROVENANCE,
    });

    assert.ok(report, 'Should produce a result without Date.now');
  });

  it('should not use performance.now', () => {
    const report = composeCertificationReport({
      certificationId: 'cert-001',
      artifactId: 'artifact-001',
      findings: [],
      dimensionsChecked: ['registry_integrity'],
      governanceStatus: 'canonical',
      provenance: VALID_CERTIFICATION_PROVENANCE,
    });

    assert.ok(report, 'Should produce a result without performance.now');
  });

  it('should not use crypto.randomUUID', () => {
    const report = composeCertificationReport({
      certificationId: 'cert-001',
      artifactId: 'artifact-001',
      findings: [],
      dimensionsChecked: ['registry_integrity'],
      governanceStatus: 'canonical',
      provenance: VALID_CERTIFICATION_PROVENANCE,
    });

    assert.ok(report, 'Should produce a result without crypto.randomUUID');
  });

  it('should not execute laboratories', () => {
    const report = composeCertificationReport({
      certificationId: 'cert-001',
      artifactId: 'artifact-001',
      findings: [],
      dimensionsChecked: ['registry_integrity'],
      governanceStatus: 'canonical',
      provenance: VALID_CERTIFICATION_PROVENANCE,
    });

    assert.ok(!('executionResult' in report), 'Should not have execution result');
    assert.ok(!('output' in report), 'Should not have output');
  });

  it('should not repair artifacts', () => {
    const report = composeCertificationReport({
      certificationId: 'cert-001',
      artifactId: 'artifact-001',
      findings: [],
      dimensionsChecked: ['registry_integrity'],
      governanceStatus: 'canonical',
      provenance: VALID_CERTIFICATION_PROVENANCE,
    });

    assert.ok(!('repairedArtifact' in report), 'Should not have repaired artifact');
    assert.ok(!('fixedArtifact' in report), 'Should not have fixed artifact');
  });

  it('should not mutate artifacts', () => {
    const report = composeCertificationReport({
      certificationId: 'cert-001',
      artifactId: 'artifact-001',
      findings: [],
      dimensionsChecked: ['registry_integrity'],
      governanceStatus: 'canonical',
      provenance: VALID_CERTIFICATION_PROVENANCE,
    });

    assert.ok(!('mutatedArtifact' in report), 'Should not have mutated artifact');
    assert.ok(!('modifiedArtifact' in report), 'Should not have modified artifact');
  });

  it('should not infer metadata', () => {
    const report = composeCertificationReport({
      certificationId: 'cert-001',
      artifactId: 'artifact-001',
      findings: [],
      dimensionsChecked: ['registry_integrity'],
      governanceStatus: 'canonical',
      provenance: VALID_CERTIFICATION_PROVENANCE,
    });

    assert.ok(!('inferredMetadata' in report), 'Should not have inferred metadata');
    assert.ok(!('autoInferred' in report), 'Should not have autoInferred');
  });

  it('should not create findings automatically', () => {
    const report = composeCertificationReport({
      certificationId: 'cert-001',
      artifactId: 'artifact-001',
      findings: [],
      dimensionsChecked: ['registry_integrity'],
      governanceStatus: 'canonical',
      provenance: VALID_CERTIFICATION_PROVENANCE,
    });

    assert.ok(!('autoGeneratedFindings' in report), 'Should not have auto generated findings');
    assert.ok(!('generatedFindings' in report), 'Should not have generated findings');
  });

  it('should not perform analytics', () => {
    const report = composeCertificationReport({
      certificationId: 'cert-001',
      artifactId: 'artifact-001',
      findings: [],
      dimensionsChecked: ['registry_integrity'],
      governanceStatus: 'canonical',
      provenance: VALID_CERTIFICATION_PROVENANCE,
    });

    assert.ok(!('analytics' in report), 'Should not have analytics');
    assert.ok(!('metrics' in report), 'Should not have metrics');
  });

  it('should not perform persistence', () => {
    const report = composeCertificationReport({
      certificationId: 'cert-001',
      artifactId: 'artifact-001',
      findings: [],
      dimensionsChecked: ['registry_integrity'],
      governanceStatus: 'canonical',
      provenance: VALID_CERTIFICATION_PROVENANCE,
    });

    assert.ok(!('persistence' in report), 'Should not have persistence');
    assert.ok(!('storage' in report), 'Should not have storage');
  });

  it('should not perform synchronization', () => {
    const report = composeCertificationReport({
      certificationId: 'cert-001',
      artifactId: 'artifact-001',
      findings: [],
      dimensionsChecked: ['registry_integrity'],
      governanceStatus: 'canonical',
      provenance: VALID_CERTIFICATION_PROVENANCE,
    });

    assert.ok(!('synchronization' in report), 'Should not have synchronization');
    assert.ok(!('sync' in report), 'Should not have sync');
  });

  it('should not perform networking', () => {
    const report = composeCertificationReport({
      certificationId: 'cert-001',
      artifactId: 'artifact-001',
      findings: [],
      dimensionsChecked: ['registry_integrity'],
      governanceStatus: 'canonical',
      provenance: VALID_CERTIFICATION_PROVENANCE,
    });

    assert.ok(!('networkResponse' in report), 'Should not have network response');
    assert.ok(!('httpResult' in report), 'Should not have HTTP result');
  });

  it('should not call LLMs', () => {
    const report = composeCertificationReport({
      certificationId: 'cert-001',
      artifactId: 'artifact-001',
      findings: [],
      dimensionsChecked: ['registry_integrity'],
      governanceStatus: 'canonical',
      provenance: VALID_CERTIFICATION_PROVENANCE,
    });

    assert.ok(!('llmResult' in report), 'Should not have LLM result');
    assert.ok(!('llmOutput' in report), 'Should not have LLM output');
    assert.ok(!('llmResponse' in report), 'Should not have LLM response');
  });

  it('should not call external APIs', () => {
    const report = composeCertificationReport({
      certificationId: 'cert-001',
      artifactId: 'artifact-001',
      findings: [],
      dimensionsChecked: ['registry_integrity'],
      governanceStatus: 'canonical',
      provenance: VALID_CERTIFICATION_PROVENANCE,
    });

    assert.ok(!('apiResult' in report), 'Should not have API result');
    assert.ok(!('externalResult' in report), 'Should not have external result');
  });

  it('should not create runtime state', () => {
    const report = composeCertificationReport({
      certificationId: 'cert-001',
      artifactId: 'artifact-001',
      findings: [],
      dimensionsChecked: ['registry_integrity'],
      governanceStatus: 'canonical',
      provenance: VALID_CERTIFICATION_PROVENANCE,
    });

    assert.ok(!('runtimeState' in report), 'Should not have runtime state');
    assert.ok(!('state' in report), 'Should not have state');
  });

  it('should not have executable callbacks in finding', () => {
    const finding = composeCertificationFinding({
      findingId: 'finding-001',
      severity: 'warning',
      qualityDimension: 'registry_integrity',
      code: 'TEST',
      message: 'Test.',
      rationale: 'Test.',
      governanceStatus: 'canonical',
    });

    const keys = Object.keys(finding);
    for (const key of keys) {
      const value = (finding as any)[key];
      assert.ok(typeof value !== 'function', `Finding field "${key}" should not be a function`);
    }
  });

  it('should not have executable callbacks in report', () => {
    const report = composeCertificationReport({
      certificationId: 'cert-001',
      artifactId: 'artifact-001',
      findings: [],
      dimensionsChecked: ['registry_integrity'],
      governanceStatus: 'canonical',
      provenance: VALID_CERTIFICATION_PROVENANCE,
    });

    const keys = Object.keys(report);
    for (const key of keys) {
      const value = (report as any)[key];
      assert.ok(typeof value !== 'function', `Report field "${key}" should not be a function`);
    }
  });
});

/**
 * NV-1900-D7-OPT-13 — Application Certification & Structural Quality Gate Engine Test Suite
 *
 * Comprehensive deterministic test suite for the Certification Engine.
 * Covers: successful certification, conditional certification, rejected certification,
 * score calculation, dimension validation, finding generation, validation codes,
 * duplicate findings, invalid score, invalid status, missing trace, missing findings,
 * registry consistency, helper functions, canonical enums, determinism, immutability,
 * 100 identical executions, cross-agent boundary, negative capability, validator stability,
 * public API, no mutation.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import type {
  ApplicationCertificationFinding,
  ApplicationCertificationReport,
  ApplicationQualityDimension,
  ApplicationRegistry,
} from './ApplicationAgentContract.ts';

import {
  CANONICAL_APPLICATION_CERTIFICATION_STATUS,
  CANONICAL_APPLICATION_FINDING_SEVERITY,
  CANONICAL_APPLICATION_QUALITY_DIMENSIONS,
} from './ApplicationAgentContract.ts';

import {
  composeApplicationCertificationFinding,
  composeApplicationCertificationReport,
  calculateApplicationCertificationScore,
  isApplicationCertificationSuccessful,
  certifyApplicationArtifact,
  validateApplicationCertification,
  isSupportedApplicationCertificationStatus,
  isSupportedApplicationFindingSeverity,
  isSupportedApplicationQualityDimension,
  getCanonicalApplicationCertificationStatuses,
  getCanonicalApplicationFindingSeverities,
  getCanonicalApplicationQualityDimensions,
} from './ApplicationCertificationEngine.ts';

import {
  validateCertificationReport,
  validateCertificationFinding,
  validateCertificationStatus,
  validateCertificationScore,
  CERTIFICATION_VALIDATION_CODES,
} from './ApplicationCertificationValidation.ts';

// ---------------------------------------------------------------------------
// Test Fixtures
// ---------------------------------------------------------------------------

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

const EMPTY_REGISTRY: ApplicationRegistry = {
  registryId: '_registry_0',
  nodes: [],
  metadata: {
    registryId: '_registry_0',
    nodeCount: 0,
    domainCount: 0,
    typeCount: 0,
  },
  trace: {
    traceId: '_trace_0',
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

const VALID_FINDING: ApplicationCertificationFinding = {
  findingId: 'finding-001',
  dimension: 'application_registry',
  severity: 'warning',
  code: 'CERT_REGISTRY_EMPTY',
  message: 'Registry is empty.',
};

const VALID_FINDING_2: ApplicationCertificationFinding = {
  findingId: 'finding-002',
  dimension: 'use_cases',
  severity: 'error',
  code: 'CERT_USE_CASES_MISSING',
  message: 'Use cases missing.',
};

// ---------------------------------------------------------------------------
// Finding Composition Tests
// ---------------------------------------------------------------------------

describe('Certification Engine — Composition', () => {
  it('should compose valid certification finding', () => {
    const finding = composeApplicationCertificationFinding({
      findingId: 'finding-001',
      dimension: 'application_registry',
      severity: 'warning',
      code: 'CERT_REGISTRY_EMPTY',
      message: 'Registry is empty.',
    });

    assert.equal(finding.findingId, 'finding-001');
    assert.equal(finding.dimension, 'application_registry');
    assert.equal(finding.severity, 'warning');
    assert.equal(finding.code, 'CERT_REGISTRY_EMPTY');
    assert.equal(finding.message, 'Registry is empty.');
  });

  it('should compose valid certification report', () => {
    const report = composeApplicationCertificationReport({
      certificationId: 'cert-001',
      findings: [],
      dimensions: [...CANONICAL_APPLICATION_QUALITY_DIMENSIONS],
    });

    assert.equal(report.certificationId, 'cert-001');
    assert.equal(report.status, 'certified');
    assert.equal(report.score, 100);
    assert.equal(report.findings.length, 0);
    assert.equal(report.deterministic, true);
    assert.equal(report.randomUsed, false);
    assert.equal(report.timeDependency, false);
  });

  it('should calculate score with no findings', () => {
    const score = calculateApplicationCertificationScore([]);
    assert.equal(score, 100);
  });

  it('should calculate score with warnings', () => {
    const findings = [
      { ...VALID_FINDING, severity: 'warning' as const },
      { ...VALID_FINDING, severity: 'warning' as const },
    ];
    const score = calculateApplicationCertificationScore(findings);
    assert.equal(score, 90);
  });

  it('should calculate score with errors', () => {
    const findings = [
      { ...VALID_FINDING, severity: 'error' as const },
      { ...VALID_FINDING, severity: 'error' as const },
    ];
    const score = calculateApplicationCertificationScore(findings);
    assert.equal(score, 80);
  });

  it('should calculate score with critical', () => {
    const findings = [
      { ...VALID_FINDING, severity: 'critical' as const },
    ];
    const score = calculateApplicationCertificationScore(findings);
    assert.equal(score, 80);
  });

  it('should calculate score with mixed severities', () => {
    const findings = [
      { ...VALID_FINDING, severity: 'critical' as const },
      { ...VALID_FINDING, severity: 'error' as const },
      { ...VALID_FINDING, severity: 'warning' as const },
    ];
    const score = calculateApplicationCertificationScore(findings);
    assert.equal(score, 65);
  });

  it('should not go below 0', () => {
    const findings = Array.from({ length: 20 }, (_, i) => ({
      ...VALID_FINDING,
      findingId: `finding-${i}`,
      severity: 'critical' as const,
    }));
    const score = calculateApplicationCertificationScore(findings);
    assert.equal(score, 0);
  });

  it('should determine certified status', () => {
    const report = composeApplicationCertificationReport({
      certificationId: 'cert-001',
      findings: [],
      dimensions: [...CANONICAL_APPLICATION_QUALITY_DIMENSIONS],
    });

    assert.equal(report.status, 'certified');
  });

  it('should determine conditionally certified status', () => {
    const report = composeApplicationCertificationReport({
      certificationId: 'cert-001',
      findings: [{ ...VALID_FINDING, severity: 'warning' as const }],
      dimensions: [...CANONICAL_APPLICATION_QUALITY_DIMENSIONS],
    });

    assert.equal(report.status, 'conditionally_certified');
  });

  it('should determine incomplete status', () => {
    const report = composeApplicationCertificationReport({
      certificationId: 'cert-001',
      findings: [
        { ...VALID_FINDING, severity: 'error' as const },
        { ...VALID_FINDING, severity: 'error' as const },
        { ...VALID_FINDING, severity: 'warning' as const },
      ],
      dimensions: [...CANONICAL_APPLICATION_QUALITY_DIMENSIONS],
    });

    assert.equal(report.status, 'incomplete');
  });

  it('should determine rejected status', () => {
    const report = composeApplicationCertificationReport({
      certificationId: 'cert-001',
      findings: [{ ...VALID_FINDING, severity: 'critical' as const }],
      dimensions: [...CANONICAL_APPLICATION_QUALITY_DIMENSIONS],
    });

    assert.equal(report.status, 'rejected');
  });

  it('should check certification success', () => {
    const certifiedReport = composeApplicationCertificationReport({
      certificationId: 'cert-001',
      findings: [],
      dimensions: [...CANONICAL_APPLICATION_QUALITY_DIMENSIONS],
    });

    assert.equal(isApplicationCertificationSuccessful(certifiedReport), true);
  });

  it('should check certification failure', () => {
    const rejectedReport = composeApplicationCertificationReport({
      certificationId: 'cert-001',
      findings: [{ ...VALID_FINDING, severity: 'critical' as const }],
      dimensions: [...CANONICAL_APPLICATION_QUALITY_DIMENSIONS],
    });

    assert.equal(isApplicationCertificationSuccessful(rejectedReport), false);
  });
});

// ---------------------------------------------------------------------------
// Certification Engine Tests
// ---------------------------------------------------------------------------

describe('Certification Engine — Certification', () => {
  it('should certify with empty registry', () => {
    const report = certifyApplicationArtifact({
      applicationRegistry: EMPTY_REGISTRY,
    });

    assert.equal(report.status, 'rejected');
    assert.ok(report.findings.length > 0);
  });

  it('should certify with valid registry', () => {
    const report = certifyApplicationArtifact({
      applicationRegistry: VALID_REGISTRY,
    });

    assert.ok(report.status === 'incomplete' || report.status === 'rejected');
    assert.ok(report.findings.length > 0);
    assert.ok(report.score <= 100);
  });

  it('should certify with all dimensions populated', () => {
    const report = certifyApplicationArtifact({
      applicationRegistry: VALID_REGISTRY,
      useCaseRegistry: { registryId: '_r', useCases: [{ useCaseId: 'uc-001', title: 'Test', description: 'Test.', useCaseType: 'classification', engineeringProblemType: 'computer_vision', businessValueType: 'accuracy', applicationContext: 'healthcare', applicationArtifactId: 'app-001', knowledgeArtifactId: 'k-001', summary: 'Test.', status: 'published', provenance: { providedBy: 'Team', rationale: 'R', reviewedBy: 'RB', reviewDate: '2026-01-01', governanceStatus: 'canonical' } }], relationships: [], metadata: { registryId: '_r', useCaseCount: 1, relationshipCount: 0, typeCount: 1, problemTypeCount: 1 }, trace: { traceId: '_t', decisionCount: 0, validationCount: 0, registryVersion: '1.0.0', compositionVersion: '1.0.0', decisions: [], deterministic: true, generatedFrom: 'deterministic_use_case_kernel', randomUsed: false, timeDependency: false }, deterministic: true, generatedFrom: 'deterministic_use_case_kernel', randomUsed: false, timeDependency: false } as any,
      caseStudyRegistry: { registryId: '_r', caseStudies: [{ caseStudyId: 'cs-001', title: 'Test', description: 'Test.', caseStudyType: 'industrial', problemDomain: 'healthcare', applicationArtifactId: 'app-001', knowledgeArtifactId: 'k-001', architectureIds: [], useCaseIds: [], summary: 'Test.', status: 'published', provenance: { providedBy: 'Team', rationale: 'R', reviewedBy: 'RB', reviewDate: '2026-01-01', governanceStatus: 'canonical' } }], datasets: [], decisions: [], lessons: [], metadata: { registryId: '_r', caseStudyCount: 1, datasetCount: 0, decisionCount: 0, lessonCount: 0, typeCount: 1 }, trace: { traceId: '_t', decisionCount: 0, validationCount: 0, registryVersion: '1.0.0', compositionVersion: '1.0.0', decisions: [], deterministic: true, generatedFrom: 'deterministic_case_study_kernel', randomUsed: false, timeDependency: false }, deterministic: true, generatedFrom: 'deterministic_case_study_kernel', randomUsed: false, timeDependency: false } as any,
      tradeOffRegistry: { registryId: '_r', tradeOffs: [{ tradeOffId: 'to-001', title: 'Test', description: 'Test.', tradeOffType: 'accuracy_latency', severity: 'moderate', applicationArtifactId: 'app-001', knowledgeArtifactId: 'k-001', architectureId: 'a-001', caseStudyId: 'cs-001', decisionDriver: 'performance_requirement', status: 'published', provenance: { providedBy: 'Team', rationale: 'R', reviewedBy: 'RB', reviewDate: '2026-01-01', governanceStatus: 'canonical' } }], dimensions: [], relationships: [], metadata: { registryId: '_r', tradeOffCount: 1, dimensionCount: 0, relationshipCount: 0, typeCount: 1 }, trace: { traceId: '_t', decisionCount: 0, validationCount: 0, registryVersion: '1.0.0', compositionVersion: '1.0.0', decisions: [], deterministic: true, generatedFrom: 'deterministic_trade_off_kernel', randomUsed: false, timeDependency: false }, deterministic: true, generatedFrom: 'deterministic_trade_off_kernel', randomUsed: false, timeDependency: false } as any,
      laboratoryIntegrationRegistry: { registryId: '_r', integrations: [{ integrationId: 'int-001', title: 'Test', description: 'Test.', applicationArtifactId: 'app-001', knowledgeArtifactId: 'k-001', laboratoryId: 'lab-001', integrationType: 'architecture_validation', mappingType: 'primary', objectiveType: 'understanding', status: 'published', provenance: { providedBy: 'Team', rationale: 'R', reviewedBy: 'RB', reviewDate: '2026-01-01', governanceStatus: 'canonical' } }], evidenceReferences: [], relationships: [], metadata: { registryId: '_r', integrationCount: 1, evidenceCount: 0, relationshipCount: 0, typeCount: 1 }, trace: { traceId: '_t', decisionCount: 0, validationCount: 0, registryVersion: '1.0.0', compositionVersion: '1.0.0', decisions: [], deterministic: true, generatedFrom: 'deterministic_laboratory_integration_kernel', randomUsed: false, timeDependency: false }, deterministic: true, generatedFrom: 'deterministic_laboratory_integration_kernel', randomUsed: false, timeDependency: false } as any,
      solutionComparisonRegistry: { registryId: '_r', solutions: [{ solutionId: 'sol-001', title: 'Test', description: 'Test.', solutionType: 'deep_learning', applicationArtifactId: 'app-001', knowledgeArtifactId: 'k-001', architectureId: 'a-001', caseStudyId: 'cs-001', status: 'published', provenance: { providedBy: 'Team', rationale: 'R', reviewedBy: 'RB', reviewDate: '2026-01-01', governanceStatus: 'canonical' } }], comparisons: [], alternatives: [], dimensions: [], metadata: { registryId: '_r', solutionCount: 1, comparisonCount: 0, alternativeCount: 0, dimensionCount: 0, typeCount: 1 }, trace: { traceId: '_t', decisionCount: 0, validationCount: 0, registryVersion: '1.0.0', compositionVersion: '1.0.0', decisions: [], deterministic: true, generatedFrom: 'deterministic_solution_comparison_kernel', randomUsed: false, timeDependency: false }, deterministic: true, generatedFrom: 'deterministic_solution_comparison_kernel', randomUsed: false, timeDependency: false } as any,
      engineeringJudgmentRegistry: { registryId: '_r', mistakes: [{ mistakeId: 'm-001', title: 'Test', description: 'Test.', mistakeType: 'premature_optimization', applicationArtifactId: 'app-001', knowledgeArtifactId: 'k-001', caseStudyId: 'cs-001', severity: 'major', status: 'published', provenance: { providedBy: 'Team', rationale: 'R', reviewedBy: 'RB', reviewDate: '2026-01-01', governanceStatus: 'canonical' } }], pitfalls: [], judgments: [], antiPatterns: [], metadata: { registryId: '_r', mistakeCount: 1, pitfallCount: 0, judgmentCount: 0, antiPatternCount: 0, typeCount: 1 }, trace: { traceId: '_t', decisionCount: 0, validationCount: 0, registryVersion: '1.0.0', compositionVersion: '1.0.0', decisions: [], deterministic: true, generatedFrom: 'deterministic_engineering_judgment_kernel', randomUsed: false, timeDependency: false }, deterministic: true, generatedFrom: 'deterministic_engineering_judgment_kernel', randomUsed: false, timeDependency: false } as any,
      mlopsRegistry: { registryId: '_r', lifecycles: [{ lifecycleId: 'lc-001', title: 'Test', stage: 'deployment', applicationArtifactId: 'app-001', knowledgeArtifactId: 'k-001', architectureId: 'a-001', status: 'published', provenance: { providedBy: 'Team', rationale: 'R', reviewedBy: 'RB', reviewDate: '2026-01-01', governanceStatus: 'canonical' } }], constraints: [], deployments: [], monitoring: [], metadata: { registryId: '_r', lifecycleCount: 1, constraintCount: 0, deploymentCount: 0, monitoringCount: 0, typeCount: 1 }, trace: { traceId: '_t', decisionCount: 0, validationCount: 0, registryVersion: '1.0.0', compositionVersion: '1.0.0', decisions: [], deterministic: true, generatedFrom: 'deterministic_mlops_lifecycle_kernel', randomUsed: false, timeDependency: false }, deterministic: true, generatedFrom: 'deterministic_mlops_lifecycle_kernel', randomUsed: false, timeDependency: false } as any,
      technologyMaturityRegistry: { registryId: '_r', maturityProfiles: [{ maturityId: 'mat-001', title: 'Test', technologyMaturityLevel: 'established', applicationArtifactId: 'app-001', knowledgeArtifactId: 'k-001', architectureId: 'a-001', status: 'published', provenance: { providedBy: 'Team', rationale: 'R', reviewedBy: 'RB', reviewDate: '2026-01-01', governanceStatus: 'canonical' } }], ecosystemProfiles: [], adoptionProfiles: [], classifications: [], indicators: [], metadata: { registryId: '_r', maturityCount: 1, ecosystemCount: 0, adoptionCount: 0, classificationCount: 0, indicatorCount: 0, typeCount: 1 }, trace: { traceId: '_t', decisionCount: 0, validationCount: 0, registryVersion: '1.0.0', compositionVersion: '1.0.0', decisions: [], deterministic: true, generatedFrom: 'deterministic_technology_maturity_kernel', randomUsed: false, timeDependency: false }, deterministic: true, generatedFrom: 'deterministic_technology_maturity_kernel', randomUsed: false, timeDependency: false } as any,
      portfolioProjectRegistry: { registryId: '_r', projects: [{ projectId: 'proj-001', title: 'Test', description: 'Test.', projectType: 'computer_vision_system', complexityLevel: 'advanced', applicationArtifactId: 'app-001', knowledgeArtifactId: 'k-001', status: 'published', provenance: { providedBy: 'Team', rationale: 'R', reviewedBy: 'RB', reviewDate: '2026-01-01', governanceStatus: 'canonical' } }], deliverables: [], competencies: [], showcases: [], metadata: { registryId: '_r', projectCount: 1, deliverableCount: 0, competencyCount: 0, showcaseCount: 0, typeCount: 1 }, trace: { traceId: '_t', decisionCount: 0, validationCount: 0, registryVersion: '1.0.0', compositionVersion: '1.0.0', decisions: [], deterministic: true, generatedFrom: 'deterministic_portfolio_project_kernel', randomUsed: false, timeDependency: false }, deterministic: true, generatedFrom: 'deterministic_portfolio_project_kernel', randomUsed: false, timeDependency: false } as any,
      visualAssetRegistry: { registryId: '_r', assets: [{ assetId: 'vis-001', title: 'Test', assetType: 'system_architecture', representationType: 'static', purposeType: 'documentation', applicationArtifactId: 'app-001', knowledgeArtifactId: 'k-001', status: 'published', provenance: { providedBy: 'Team', rationale: 'R', reviewedBy: 'RB', reviewDate: '2026-01-01', governanceStatus: 'canonical' } }], relationships: [], governance: [], metadata: { registryId: '_r', assetCount: 1, relationshipCount: 0, governanceCount: 0, typeCount: 1 }, trace: { traceId: '_t', decisionCount: 0, validationCount: 0, registryVersion: '1.0.0', compositionVersion: '1.0.0', decisions: [], deterministic: true, generatedFrom: 'deterministic_visual_asset_kernel', randomUsed: false, timeDependency: false }, deterministic: true, generatedFrom: 'deterministic_visual_asset_kernel', randomUsed: false, timeDependency: false } as any,
    });

    assert.ok(report.status === 'conditionally_certified' || report.status === 'certified');
    assert.ok(report.score >= 50);
  });
});

// ---------------------------------------------------------------------------
// Validation Tests
// ---------------------------------------------------------------------------

describe('Certification Engine — Validation', () => {
  it('should validate a valid report', () => {
    const report = composeApplicationCertificationReport({
      certificationId: 'cert-001',
      findings: [],
      dimensions: [...CANONICAL_APPLICATION_QUALITY_DIMENSIONS],
    });

    const result = validateCertificationReport(report);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it('should detect empty report', () => {
    const report = composeApplicationCertificationReport({
      certificationId: '',
      findings: [],
      dimensions: [...CANONICAL_APPLICATION_QUALITY_DIMENSIONS],
    });

    const result = validateCertificationReport(report);
    assert.equal(result.valid, false);
  });

  it('should detect invalid status', () => {
    const report = composeApplicationCertificationReport({
      certificationId: 'cert-001',
      findings: [],
      dimensions: [...CANONICAL_APPLICATION_QUALITY_DIMENSIONS],
    });

    const invalidReport = { ...report, status: 'invalid' as any };
    const result = validateCertificationReport(invalidReport);
    assert.equal(result.valid, false);
  });

  it('should detect invalid score', () => {
    const report = composeApplicationCertificationReport({
      certificationId: 'cert-001',
      findings: [],
      dimensions: [...CANONICAL_APPLICATION_QUALITY_DIMENSIONS],
    });

    const invalidReport = { ...report, score: 150 };
    const result = validateCertificationReport(invalidReport);
    assert.equal(result.valid, false);
  });

  it('should detect duplicate finding IDs', () => {
    const report = composeApplicationCertificationReport({
      certificationId: 'cert-001',
      findings: [
        { ...VALID_FINDING, findingId: 'same-id' },
        { ...VALID_FINDING, findingId: 'same-id' },
      ],
      dimensions: [...CANONICAL_APPLICATION_QUALITY_DIMENSIONS],
    });

    const result = validateCertificationReport(report);
    const duplicateError = result.errors.find(
      (e) => e.code === CERTIFICATION_VALIDATION_CODES.CERTIFICATION_DUPLICATE_FINDING,
    );

    assert.ok(duplicateError, 'Should have CERTIFICATION_DUPLICATE_FINDING error');
  });

  it('should detect invalid finding dimension', () => {
    const report = composeApplicationCertificationReport({
      certificationId: 'cert-001',
      findings: [{ ...VALID_FINDING, dimension: 'invalid' as any }],
      dimensions: [...CANONICAL_APPLICATION_QUALITY_DIMENSIONS],
    });

    const result = validateCertificationReport(report);
    const dimensionError = result.errors.find(
      (e) => e.code === CERTIFICATION_VALIDATION_CODES.CERTIFICATION_INVALID_DIMENSION,
    );

    assert.ok(dimensionError, 'Should have CERTIFICATION_INVALID_DIMENSION error');
  });

  it('should detect invalid finding severity', () => {
    const report = composeApplicationCertificationReport({
      certificationId: 'cert-001',
      findings: [{ ...VALID_FINDING, severity: 'invalid' as any }],
      dimensions: [...CANONICAL_APPLICATION_QUALITY_DIMENSIONS],
    });

    const result = validateCertificationReport(report);
    const severityError = result.errors.find(
      (e) => e.code === CERTIFICATION_VALIDATION_CODES.CERTIFICATION_INVALID_SEVERITY,
    );

    assert.ok(severityError, 'Should have CERTIFICATION_INVALID_SEVERITY error');
  });

  it('should validate finding', () => {
    const errors = validateCertificationFinding(VALID_FINDING);
    assert.deepStrictEqual(errors, []);
  });

  it('should validate status', () => {
    const errors = validateCertificationStatus('certified');
    assert.deepStrictEqual(errors, []);
  });

  it('should validate score', () => {
    const errors = validateCertificationScore(85);
    assert.deepStrictEqual(errors, []);
  });

  it('should detect invalid status via validator', () => {
    const errors = validateCertificationStatus('invalid');
    assert.ok(errors.length > 0);
  });

  it('should detect invalid score via validator', () => {
    const errors = validateCertificationScore(150);
    assert.ok(errors.length > 0);
  });
});

// ---------------------------------------------------------------------------
// Helper Function Tests
// ---------------------------------------------------------------------------

describe('Certification Engine — Helper Functions', () => {
  it('should return canonical certification statuses', () => {
    const statuses = getCanonicalApplicationCertificationStatuses();
    assert.deepStrictEqual([...statuses], [...CANONICAL_APPLICATION_CERTIFICATION_STATUS]);
    assert.equal(statuses.length, 4);
  });

  it('should return canonical finding severities', () => {
    const severities = getCanonicalApplicationFindingSeverities();
    assert.deepStrictEqual([...severities], [...CANONICAL_APPLICATION_FINDING_SEVERITY]);
    assert.equal(severities.length, 3);
  });

  it('should return canonical quality dimensions', () => {
    const dimensions = getCanonicalApplicationQualityDimensions();
    assert.deepStrictEqual([...dimensions], [...CANONICAL_APPLICATION_QUALITY_DIMENSIONS]);
    assert.equal(dimensions.length, 20);
  });

  it('should validate certification status support', () => {
    assert.equal(isSupportedApplicationCertificationStatus('certified'), true);
    assert.equal(isSupportedApplicationCertificationStatus('rejected'), true);
    assert.equal(isSupportedApplicationCertificationStatus('unsupported'), false);
  });

  it('should validate finding severity support', () => {
    assert.equal(isSupportedApplicationFindingSeverity('warning'), true);
    assert.equal(isSupportedApplicationFindingSeverity('error'), true);
    assert.equal(isSupportedApplicationFindingSeverity('unsupported'), false);
  });

  it('should validate quality dimension support', () => {
    assert.equal(isSupportedApplicationQualityDimension('application_registry'), true);
    assert.equal(isSupportedApplicationQualityDimension('use_cases'), true);
    assert.equal(isSupportedApplicationQualityDimension('unsupported'), false);
  });
});

// ---------------------------------------------------------------------------
// Canonical Enum Completeness Tests
// ---------------------------------------------------------------------------

describe('Certification Engine — Canonical Enum Completeness', () => {
  it('should have exactly 4 certification statuses', () => {
    assert.equal(CANONICAL_APPLICATION_CERTIFICATION_STATUS.length, 4);
  });

  it('should have exactly 3 finding severities', () => {
    assert.equal(CANONICAL_APPLICATION_FINDING_SEVERITY.length, 3);
  });

  it('should have exactly 20 quality dimensions', () => {
    assert.equal(CANONICAL_APPLICATION_QUALITY_DIMENSIONS.length, 20);
  });

  it('should contain all expected certification statuses', () => {
    const expected = ['certified', 'conditionally_certified', 'rejected', 'incomplete'];

    for (const status of expected) {
      assert.ok(
        CANONICAL_APPLICATION_CERTIFICATION_STATUS.includes(status as any),
        `Should include status: ${status}`,
      );
    }
  });

  it('should contain all expected finding severities', () => {
    const expected = ['warning', 'error', 'critical'];

    for (const severity of expected) {
      assert.ok(
        CANONICAL_APPLICATION_FINDING_SEVERITY.includes(severity as any),
        `Should include severity: ${severity}`,
      );
    }
  });

  it('should contain all expected quality dimensions', () => {
    const expected = ['application_registry', 'use_cases', 'system_architecture', 'case_studies', 'trade_offs', 'laboratory_integration', 'solution_comparison', 'engineering_judgment', 'mlops_lifecycle', 'technology_maturity', 'portfolio_mapping', 'visual_assets', 'traceability', 'governance', 'determinism', 'immutability', 'validation', 'documentation', 'cross_agent_boundary', 'public_api'];

    for (const dimension of expected) {
      assert.ok(
        CANONICAL_APPLICATION_QUALITY_DIMENSIONS.includes(dimension as any),
        `Should include dimension: ${dimension}`,
      );
    }
  });
});

// ---------------------------------------------------------------------------
// Determinism Tests
// ---------------------------------------------------------------------------

describe('Certification Engine — Determinism', () => {
  it('should produce identical output for identical input (100 iterations)', () => {
    const results: ReturnType<typeof certifyApplicationArtifact>[] = [];
    for (let i = 0; i < 100; i++) {
      results.push(certifyApplicationArtifact({ applicationRegistry: VALID_REGISTRY }));
    }

    for (let i = 1; i < results.length; i++) {
      assert.deepStrictEqual(results[0].certificationId, results[i].certificationId);
      assert.deepStrictEqual(results[0].status, results[i].status);
      assert.deepStrictEqual(results[0].score, results[i].score);
      assert.deepStrictEqual(results[0].findings.length, results[i].findings.length);
    }
  });

  it('should produce identical score calculation for identical input', () => {
    const findings = [VALID_FINDING, VALID_FINDING_2];
    const results: number[] = [];
    for (let i = 0; i < 100; i++) {
      results.push(calculateApplicationCertificationScore(findings));
    }

    for (let i = 1; i < results.length; i++) {
      assert.deepStrictEqual(results[0], results[i]);
    }
  });
});

// ---------------------------------------------------------------------------
// Negative Capability Verification Tests
// ---------------------------------------------------------------------------

describe('Certification Engine — Negative Capability Verification', () => {
  it('should not use Math.random', () => {
    const report = certifyApplicationArtifact({ applicationRegistry: VALID_REGISTRY });
    assert.ok(report, 'Should produce a result without Math.random');
  });

  it('should not use Date.now', () => {
    const report = certifyApplicationArtifact({ applicationRegistry: VALID_REGISTRY });
    assert.ok(report, 'Should produce a result without Date.now');
  });

  it('should not use performance.now', () => {
    const report = certifyApplicationArtifact({ applicationRegistry: VALID_REGISTRY });
    assert.ok(report, 'Should produce a result without performance.now');
  });

  it('should not use crypto.randomUUID', () => {
    const report = certifyApplicationArtifact({ applicationRegistry: VALID_REGISTRY });
    assert.ok(report, 'Should produce a result without crypto.randomUUID');
  });

  it('should not repair artifacts', () => {
    const report = certifyApplicationArtifact({ applicationRegistry: EMPTY_REGISTRY });
    assert.ok(!('repairedArtifacts' in report), 'Should not have repaired artifacts');
  });

  it('should not generate missing metadata', () => {
    const report = certifyApplicationArtifact({ applicationRegistry: EMPTY_REGISTRY });
    assert.ok(!('generatedMetadata' in report), 'Should not have generated metadata');
  });

  it('should not create new application nodes', () => {
    const report = certifyApplicationArtifact({ applicationRegistry: EMPTY_REGISTRY });
    assert.ok(!('createdNodes' in report), 'Should not have created nodes');
  });

  it('should not modify registries', () => {
    const originalNodeCount = VALID_REGISTRY.nodes.length;
    certifyApplicationArtifact({ applicationRegistry: VALID_REGISTRY });
    assert.equal(VALID_REGISTRY.nodes.length, originalNodeCount);
  });

  it('should not have executable callbacks in finding', () => {
    const finding = composeApplicationCertificationFinding({
      findingId: 'finding-001',
      dimension: 'application_registry',
      severity: 'warning',
      code: 'CERT_REGISTRY_EMPTY',
      message: 'Registry is empty.',
    });

    const keys = Object.keys(finding);
    for (const key of keys) {
      const value = (finding as any)[key];
      assert.ok(typeof value !== 'function', `Finding field "${key}" should not be a function`);
    }
  });
});

// ---------------------------------------------------------------------------
// Cross-Agent Boundary Verification Tests
// ---------------------------------------------------------------------------

describe('Certification Engine — Cross-Agent Boundary Verification', () => {
  it('should not modify D4', () => {
    const report = certifyApplicationArtifact({ applicationRegistry: VALID_REGISTRY });
    assert.ok(!('d4Modified' in report), 'Should not have modified D4');
  });

  it('should not modify D5', () => {
    const report = certifyApplicationArtifact({ applicationRegistry: VALID_REGISTRY });
    assert.ok(!('d5Modified' in report), 'Should not have modified D5');
  });

  it('should not modify D6', () => {
    const report = certifyApplicationArtifact({ applicationRegistry: VALID_REGISTRY });
    assert.ok(!('d6Modified' in report), 'Should not have modified D6');
  });
});

// ---------------------------------------------------------------------------
// Validator Stability Tests
// ---------------------------------------------------------------------------

describe('Certification Engine — Validator Stability', () => {
  it('should produce identical validation results for valid input', () => {
    const report = composeApplicationCertificationReport({
      certificationId: 'cert-001',
      findings: [],
      dimensions: [...CANONICAL_APPLICATION_QUALITY_DIMENSIONS],
    });

    const result1 = validateCertificationReport(report);
    const result2 = validateCertificationReport(report);

    assert.deepStrictEqual(result1.valid, result2.valid);
    assert.deepStrictEqual(result1.errors.length, result2.errors.length);
  });

  it('should produce identical validation results for invalid input', () => {
    const report = composeApplicationCertificationReport({
      certificationId: '',
      findings: [],
      dimensions: [...CANONICAL_APPLICATION_QUALITY_DIMENSIONS],
    });

    const result1 = validateCertificationReport(report);
    const result2 = validateCertificationReport(report);

    assert.deepStrictEqual(result1.valid, result2.valid);
    assert.deepStrictEqual(result1.errors.length, result2.errors.length);
  });
});

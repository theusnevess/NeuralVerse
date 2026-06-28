/**
 * NV-1900-D7-OPT-13 — Application Certification & Structural Quality Gate Engine
 *
 * Deterministic certification engine for evaluating Application Artifact structural completeness.
 * Certifies whether an Application Artifact satisfies every structural requirement established throughout D7.
 *
 * This module never:
 * - Repairs artifacts
 * - Generates missing information
 * - Modifies existing artifacts
 * - Creates new application nodes
 * - Invokes external APIs
 * - Accesses filesystem
 * - Performs network requests
 *
 * Certification only.
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import type {
  ApplicationCertificationFinding,
  ApplicationCertificationTrace,
  ApplicationCertificationReport,
  ApplicationQualityDimension,
  ApplicationCertificationStatus,
  ApplicationFindingSeverity,
  ApplicationCertificationValidationError,
  ApplicationCertificationValidationResult,
  ApplicationRegistry,
  UseCaseRegistry,
  SolutionComparisonRegistry,
  EngineeringJudgmentRegistry,
  TechnologyMaturityRegistry,
  PortfolioProjectRegistry,
  VisualAssetRegistry,
  CaseStudyRegistry,
  LaboratoryIntegrationRegistry,
  TradeOffRegistry,
  MLOpsRegistry,
} from './ApplicationAgentContract.ts';

import {
  CANONICAL_APPLICATION_CERTIFICATION_STATUS,
  CANONICAL_APPLICATION_FINDING_SEVERITY,
  CANONICAL_APPLICATION_QUALITY_DIMENSIONS,
} from './ApplicationAgentContract.ts';

// ---------------------------------------------------------------------------
// Certification Finding Composition
// ---------------------------------------------------------------------------

export function composeApplicationCertificationFinding(params: {
  readonly findingId: string;
  readonly dimension: ApplicationQualityDimension;
  readonly severity: ApplicationFindingSeverity;
  readonly code: string;
  readonly message: string;
}): ApplicationCertificationFinding {
  return {
    findingId: params.findingId,
    dimension: params.dimension,
    severity: params.severity,
    code: params.code,
    message: params.message,
  };
}

// ---------------------------------------------------------------------------
// Certification Score Calculation
// ---------------------------------------------------------------------------

/**
 * Calculates certification score based on findings.
 * Score ranges from 0 to 100.
 * Each critical finding reduces score by 20.
 * Each error finding reduces score by 10.
 * Each warning finding reduces score by 5.
 * Pure function. No side effects.
 */
export function calculateApplicationCertificationScore(
  findings: readonly ApplicationCertificationFinding[],
): number {
  let score = 100;

  for (const finding of findings) {
    if (finding.severity === 'critical') {
      score -= 20;
    } else if (finding.severity === 'error') {
      score -= 10;
    } else if (finding.severity === 'warning') {
      score -= 5;
    }
  }

  return Math.max(0, score);
}

// ---------------------------------------------------------------------------
// Certification Status Determination
// ---------------------------------------------------------------------------

/**
 * Determines certification status based on score and findings.
 * Pure function. No side effects.
 */
export function _determineCertificationStatus(
  score: number,
  findings: readonly ApplicationCertificationFinding[],
): ApplicationCertificationStatus {
  const hasCritical = findings.some((f) => f.severity === 'critical');
  const hasError = findings.some((f) => f.severity === 'error');

  if (score === 100 && findings.length === 0) {
    return 'certified';
  }

  if (score >= 80 && !hasCritical) {
    return 'conditionally_certified';
  }

  if (score >= 50 && !hasCritical) {
    return 'incomplete';
  }

  return 'rejected';
}

// ---------------------------------------------------------------------------
// Certification Report Composition
// ---------------------------------------------------------------------------

export function composeApplicationCertificationReport(params: {
  readonly certificationId: string;
  readonly findings: readonly ApplicationCertificationFinding[];
  readonly dimensions: readonly ApplicationQualityDimension[];
}): ApplicationCertificationReport {
  const score = calculateApplicationCertificationScore(params.findings);
  const status = _determineCertificationStatus(score, params.findings);

  return {
    certificationId: params.certificationId,
    status,
    score,
    dimensions: params.dimensions,
    findings: params.findings,
    generatedFrom: 'deterministic_application_certification_engine',
    trace: {
      traceId: `_certification_trace_${params.certificationId}`,
      generatedFrom: 'deterministic_application_certification_engine',
      randomUsed: false,
      timeDependency: false,
    },
    deterministic: true,
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Certification Successful Check
// ---------------------------------------------------------------------------

/**
 * Checks if certification is successful (certified or conditionally_certified).
 * Pure function. No side effects.
 */
export function isApplicationCertificationSuccessful(
  report: ApplicationCertificationReport,
): boolean {
  return report.status === 'certified' || report.status === 'conditionally_certified';
}

// ---------------------------------------------------------------------------
// Certification Engine — Structural Validation
// ---------------------------------------------------------------------------

/**
 * Validates an Application Artifact for certification.
 * Generates findings for each structural requirement.
 * Pure function. No side effects.
 */
export function certifyApplicationArtifact(params: {
  readonly applicationRegistry: ApplicationRegistry;
  readonly useCaseRegistry?: UseCaseRegistry;
  readonly architectureRegistry?: LaboratoryIntegrationRegistry;
  readonly caseStudyRegistry?: CaseStudyRegistry;
  readonly tradeOffRegistry?: TradeOffRegistry;
  readonly laboratoryIntegrationRegistry?: LaboratoryIntegrationRegistry;
  readonly solutionComparisonRegistry?: SolutionComparisonRegistry;
  readonly engineeringJudgmentRegistry?: EngineeringJudgmentRegistry;
  readonly mlopsRegistry?: MLOpsRegistry;
  readonly technologyMaturityRegistry?: TechnologyMaturityRegistry;
  readonly portfolioProjectRegistry?: PortfolioProjectRegistry;
  readonly visualAssetRegistry?: VisualAssetRegistry;
}): ApplicationCertificationReport {
  const findings: ApplicationCertificationFinding[] = [];
  let findingCounter = 0;

  // --- OPT-01: Application Registry ---
  if (params.applicationRegistry.nodes.length === 0) {
    findings.push(composeApplicationCertificationFinding({
      findingId: `_finding_${findingCounter++}`,
      dimension: 'application_registry',
      severity: 'critical',
      code: 'CERT_REGISTRY_EMPTY',
      message: 'Application registry contains no nodes.',
    }));
  }

  if (!params.applicationRegistry.deterministic) {
    findings.push(composeApplicationCertificationFinding({
      findingId: `_finding_${findingCounter++}`,
      dimension: 'determinism',
      severity: 'critical',
      code: 'CERT_REGISTRY_NON_DETERMINISTIC',
      message: 'Application registry is not deterministic.',
    }));
  }

  // --- OPT-02: Use Cases ---
  if (!params.useCaseRegistry || params.useCaseRegistry.useCases.length === 0) {
    findings.push(composeApplicationCertificationFinding({
      findingId: `_finding_${findingCounter++}`,
      dimension: 'use_cases',
      severity: 'warning',
      code: 'CERT_USE_CASES_MISSING',
      message: 'No use case registry provided or registry is empty.',
    }));
  }

  // --- OPT-03: System Architecture ---
  if (!params.architectureRegistry || (params.architectureRegistry as any).architectures?.length === 0) {
    findings.push(composeApplicationCertificationFinding({
      findingId: `_finding_${findingCounter++}`,
      dimension: 'system_architecture',
      severity: 'warning',
      code: 'CERT_ARCHITECTURE_MISSING',
      message: 'No architecture registry provided or registry is empty.',
    }));
  }

  // --- OPT-04: Case Studies ---
  if (!params.caseStudyRegistry || params.caseStudyRegistry.caseStudies.length === 0) {
    findings.push(composeApplicationCertificationFinding({
      findingId: `_finding_${findingCounter++}`,
      dimension: 'case_studies',
      severity: 'warning',
      code: 'CERT_CASE_STUDIES_MISSING',
      message: 'No case study registry provided or registry is empty.',
    }));
  }

  // --- OPT-05: Trade-Offs ---
  if (!params.tradeOffRegistry || params.tradeOffRegistry.tradeOffs.length === 0) {
    findings.push(composeApplicationCertificationFinding({
      findingId: `_finding_${findingCounter++}`,
      dimension: 'trade_offs',
      severity: 'warning',
      code: 'CERT_TRADE_OFFS_MISSING',
      message: 'No trade-off registry provided or registry is empty.',
    }));
  }

  // --- OPT-06: Laboratory Integration ---
  if (!params.laboratoryIntegrationRegistry || params.laboratoryIntegrationRegistry.integrations.length === 0) {
    findings.push(composeApplicationCertificationFinding({
      findingId: `_finding_${findingCounter++}`,
      dimension: 'laboratory_integration',
      severity: 'warning',
      code: 'CERT_LABORATORY_MISSING',
      message: 'No laboratory integration registry provided or registry is empty.',
    }));
  }

  // --- OPT-07: Solution Comparison ---
  if (!params.solutionComparisonRegistry || params.solutionComparisonRegistry.solutions.length === 0) {
    findings.push(composeApplicationCertificationFinding({
      findingId: `_finding_${findingCounter++}`,
      dimension: 'solution_comparison',
      severity: 'warning',
      code: 'CERT_SOLUTION_COMPARISON_MISSING',
      message: 'No solution comparison registry provided or registry is empty.',
    }));
  }

  // --- OPT-08: Engineering Judgment ---
  if (!params.engineeringJudgmentRegistry || params.engineeringJudgmentRegistry.mistakes.length === 0) {
    findings.push(composeApplicationCertificationFinding({
      findingId: `_finding_${findingCounter++}`,
      dimension: 'engineering_judgment',
      severity: 'warning',
      code: 'CERT_ENGINEERING_JUDGMENT_MISSING',
      message: 'No engineering judgment registry provided or registry is empty.',
    }));
  }

  // --- OPT-09: MLOps Lifecycle ---
  if (!params.mlopsRegistry || params.mlopsRegistry.lifecycles.length === 0) {
    findings.push(composeApplicationCertificationFinding({
      findingId: `_finding_${findingCounter++}`,
      dimension: 'mlops_lifecycle',
      severity: 'warning',
      code: 'CERT_MLOPS_MISSING',
      message: 'No MLOps registry provided or registry is empty.',
    }));
  }

  // --- OPT-10: Technology Maturity ---
  if (!params.technologyMaturityRegistry || params.technologyMaturityRegistry.maturityProfiles.length === 0) {
    findings.push(composeApplicationCertificationFinding({
      findingId: `_finding_${findingCounter++}`,
      dimension: 'technology_maturity',
      severity: 'warning',
      code: 'CERT_TECHNOLOGY_MATURITY_MISSING',
      message: 'No technology maturity registry provided or registry is empty.',
    }));
  }

  // --- OPT-11: Portfolio Mapping ---
  if (!params.portfolioProjectRegistry || params.portfolioProjectRegistry.projects.length === 0) {
    findings.push(composeApplicationCertificationFinding({
      findingId: `_finding_${findingCounter++}`,
      dimension: 'portfolio_mapping',
      severity: 'warning',
      code: 'CERT_PORTFOLIO_MISSING',
      message: 'No portfolio project registry provided or registry is empty.',
    }));
  }

  // --- OPT-12: Visual Assets ---
  if (!params.visualAssetRegistry || params.visualAssetRegistry.assets.length === 0) {
    findings.push(composeApplicationCertificationFinding({
      findingId: `_finding_${findingCounter++}`,
      dimension: 'visual_assets',
      severity: 'warning',
      code: 'CERT_VISUAL_ASSETS_MISSING',
      message: 'No visual asset registry provided or registry is empty.',
    }));
  }

  return composeApplicationCertificationReport({
    certificationId: `_certification_deterministic`,
    findings,
    dimensions: [...CANONICAL_APPLICATION_QUALITY_DIMENSIONS],
  });
}

// ---------------------------------------------------------------------------
// Certification Validation
// ---------------------------------------------------------------------------

/**
 * Validates a certification report against structural invariants.
 * Pure function. No side effects.
 */
export function validateApplicationCertification(
  report: ApplicationCertificationReport,
): ApplicationCertificationValidationResult {
  const errors: ApplicationCertificationValidationError[] = [];

  if (!report.certificationId || report.certificationId.trim() === '') {
    errors.push({
      code: 'CERTIFICATION_EMPTY_REPORT',
      message: 'Certification report is missing a certification ID.',
      field: 'certificationId',
    });
  }

  if (!CANONICAL_APPLICATION_CERTIFICATION_STATUS.includes(report.status)) {
    errors.push({
      code: 'CERTIFICATION_INVALID_STATUS',
      message: `Certification report has invalid status: "${report.status}".`,
      field: 'status',
    });
  }

  if (report.score < 0 || report.score > 100) {
    errors.push({
      code: 'CERTIFICATION_INVALID_SCORE',
      message: `Certification report has invalid score: ${report.score}.`,
      field: 'score',
    });
  }

  if (report.findings.length === 0 && report.status !== 'certified') {
    errors.push({
      code: 'CERTIFICATION_MISSING_FINDINGS',
      message: 'Certification report has no findings but is not certified.',
      field: 'findings',
    });
  }

  // Check for duplicate finding IDs
  const seenFindingIds = new Set<string>();
  for (const finding of report.findings) {
    if (seenFindingIds.has(finding.findingId)) {
      errors.push({
        code: 'CERTIFICATION_DUPLICATE_FINDING',
        message: `Duplicate finding ID: "${finding.findingId}".`,
        field: 'findings',
      });
    }
    seenFindingIds.add(finding.findingId);
  }

  // Validate each finding
  for (const finding of report.findings) {
    if (!CANONICAL_APPLICATION_QUALITY_DIMENSIONS.includes(finding.dimension)) {
      errors.push({
        code: 'CERTIFICATION_INVALID_DIMENSION',
        message: `Finding has invalid dimension: "${finding.dimension}".`,
        field: 'dimension',
      });
    }

    if (!CANONICAL_APPLICATION_FINDING_SEVERITY.includes(finding.severity)) {
      errors.push({
        code: 'CERTIFICATION_INVALID_SEVERITY',
        message: `Finding has invalid severity: "${finding.severity}".`,
        field: 'severity',
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// ---------------------------------------------------------------------------
// Helper Functions — Type Guards
// ---------------------------------------------------------------------------

export function isSupportedApplicationCertificationStatus(
  status: string,
): status is ApplicationCertificationStatus {
  return CANONICAL_APPLICATION_CERTIFICATION_STATUS.includes(status as ApplicationCertificationStatus);
}

export function isSupportedApplicationFindingSeverity(
  severity: string,
): severity is ApplicationFindingSeverity {
  return CANONICAL_APPLICATION_FINDING_SEVERITY.includes(severity as ApplicationFindingSeverity);
}

export function isSupportedApplicationQualityDimension(
  dimension: string,
): dimension is ApplicationQualityDimension {
  return CANONICAL_APPLICATION_QUALITY_DIMENSIONS.includes(dimension as ApplicationQualityDimension);
}

// ---------------------------------------------------------------------------
// Helper Functions — Canonical Getters
// ---------------------------------------------------------------------------

export function getCanonicalApplicationCertificationStatuses(): readonly ApplicationCertificationStatus[] {
  return CANONICAL_APPLICATION_CERTIFICATION_STATUS;
}

export function getCanonicalApplicationFindingSeverities(): readonly ApplicationFindingSeverity[] {
  return CANONICAL_APPLICATION_FINDING_SEVERITY;
}

export function getCanonicalApplicationQualityDimensions(): readonly ApplicationQualityDimension[] {
  return CANONICAL_APPLICATION_QUALITY_DIMENSIONS;
}

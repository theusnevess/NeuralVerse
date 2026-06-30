/**
 * D10-OPT-17 — Certification Engine
 *
 * Deterministic certification functions for Knowledge Artifacts.
 * Produces certification reports describing whether artifacts satisfy
 * every canonical architectural requirement established by D10-OPT-01 through D10-OPT-16.
 *
 * This module never:
 * - Repairs artifacts
 * - Modifies metadata
 * - Approves knowledge
 * - Generates reports for users
 * - Executes governance workflows
 * - Generates knowledge
 * - Rewrites knowledge
 * - Infers relationships
 * - Publishes knowledge
 * - Modifies artifacts
 * - Performs automatic certification repair
 * - Invokes LLMs
 * - Accesses filesystem
 * - Performs network requests
 *
 * Certification metadata only.
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import type {
  KnowledgeCertificationFinding,
  KnowledgeCertificationTrace,
  KnowledgeCertificationMetadata,
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

// ---------------------------------------------------------------------------
// Certification Finding Composition
// ---------------------------------------------------------------------------

export function composeKnowledgeCertificationFinding(params: {
  readonly findingId: string;
  readonly dimension: KnowledgeQualityDimension;
  readonly severity: KnowledgeFindingSeverity;
  readonly description: string;
}): KnowledgeCertificationFinding {
  return {
    findingId: params.findingId,
    dimension: params.dimension,
    severity: params.severity,
    description: params.description,
  };
}

// ---------------------------------------------------------------------------
// Certification Trace Composition
// ---------------------------------------------------------------------------

export function composeKnowledgeCertificationTrace(params: {
  readonly traceId: string;
  readonly findingCount: number;
  readonly evaluationTimestamp: string;
  readonly registryVersion: string;
}): KnowledgeCertificationTrace {
  return {
    traceId: params.traceId,
    findingCount: params.findingCount,
    evaluationTimestamp: params.evaluationTimestamp,
    registryVersion: params.registryVersion,
    deterministic: true,
    generatedFrom: 'deterministic_certification_engine',
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Certification Metadata Composition
// ---------------------------------------------------------------------------

export function composeKnowledgeCertificationMetadata(params: {
  readonly certificationId: string;
  readonly certificationScore: number;
  readonly certificationStatus: KnowledgeCertificationStatus;
  readonly evaluatedDimensions: number;
}): KnowledgeCertificationMetadata {
  return {
    certificationId: params.certificationId,
    certificationScore: params.certificationScore,
    certificationStatus: params.certificationStatus,
    evaluatedDimensions: params.evaluatedDimensions,
  };
}

// ---------------------------------------------------------------------------
// Certification Report Composition
// ---------------------------------------------------------------------------

export function composeKnowledgeCertificationReport(params: {
  readonly findings: readonly KnowledgeCertificationFinding[];
  readonly metadata: KnowledgeCertificationMetadata;
  readonly trace: KnowledgeCertificationTrace;
}): KnowledgeCertificationReport {
  return {
    findings: [...params.findings],
    metadata: params.metadata,
    trace: params.trace,
  };
}

// ---------------------------------------------------------------------------
// Certification Score Calculation
// ---------------------------------------------------------------------------

export function calculateKnowledgeCertificationScore(
  findings: readonly KnowledgeCertificationFinding[],
): number {
  const totalDimensions = CANONICAL_KNOWLEDGE_QUALITY_DIMENSIONS.length;

  const criticalCount = findings.filter((f) => f.severity === 'critical').length;
  const majorCount = findings.filter((f) => f.severity === 'major').length;
  const warningCount = findings.filter((f) => f.severity === 'warning').length;
  const minorCount = findings.filter((f) => f.severity === 'minor').length;

  const penalty = (criticalCount * 20) + ((majorCount + warningCount) * 10) + (minorCount * 2);
  const score = Math.max(0, 100 - penalty);

  return score;
}

// ---------------------------------------------------------------------------
// Certification Status Determination
// ---------------------------------------------------------------------------

export function determineKnowledgeCertificationStatus(
  score: number,
  findings: readonly KnowledgeCertificationFinding[],
): KnowledgeCertificationStatus {
  const hasCritical = findings.some((f) => f.severity === 'critical');
  const hasMajor = findings.some((f) => f.severity === 'major');

  if (hasCritical) {
    return 'failed';
  }

  if (score < 60) {
    return 'failed';
  }

  if (hasMajor || score < 80) {
    return 'conditional';
  }

  if (score < 90) {
    return 'passed';
  }

  if (score < 100) {
    return 'approved';
  }

  return 'certified';
}

// ---------------------------------------------------------------------------
// Certification Success Check
// ---------------------------------------------------------------------------

export function isKnowledgeCertificationSuccessful(
  status: KnowledgeCertificationStatus,
): boolean {
  return status === 'passed' || status === 'approved' || status === 'certified';
}

// ---------------------------------------------------------------------------
// Certification Engine (Main Entry Point)
// ---------------------------------------------------------------------------

export function certifyKnowledgeArtifact(
  findings: readonly KnowledgeCertificationFinding[],
): KnowledgeCertificationReport {
  const score = calculateKnowledgeCertificationScore(findings);
  const status = determineKnowledgeCertificationStatus(score, findings);
  const deterministicSeed = findings
    .map((finding) => `${finding.findingId}:${finding.dimension}:${finding.severity}`)
    .sort()
    .join('|') || 'no_findings';

  const metadata = composeKnowledgeCertificationMetadata({
    certificationId: `_cert_${deterministicSeed}`,
    certificationScore: score,
    certificationStatus: status,
    evaluatedDimensions: CANONICAL_KNOWLEDGE_QUALITY_DIMENSIONS.length,
  });

  const trace = composeKnowledgeCertificationTrace({
    traceId: `_trace_${deterministicSeed}`,
    findingCount: findings.length,
    evaluationTimestamp: `_evaluation_${deterministicSeed}`,
    registryVersion: '1.0.0',
  });

  return composeKnowledgeCertificationReport({
    findings,
    metadata,
    trace,
  });
}

// ---------------------------------------------------------------------------
// Certification Validation
// ---------------------------------------------------------------------------

export function validateKnowledgeCertification(
  report: KnowledgeCertificationReport,
): { readonly valid: boolean; readonly errors: readonly string[] } {
  const errors: string[] = [];

  if (!report.findings) {
    errors.push('KNOWLEDGE_CERTIFICATION_MISSING_REPORT');
  }

  if (!report.metadata) {
    errors.push('KNOWLEDGE_CERTIFICATION_MISSING_METADATA');
  }

  if (!report.trace) {
    errors.push('KNOWLEDGE_CERTIFICATION_INVALID_TRACE');
  }

  if (report.metadata && !CANONICAL_KNOWLEDGE_CERTIFICATION_STATUS.includes(report.metadata.certificationStatus)) {
    errors.push('KNOWLEDGE_CERTIFICATION_INVALID_STATUS');
  }

  if (report.metadata && (report.metadata.certificationScore < 0 || report.metadata.certificationScore > 100)) {
    errors.push('KNOWLEDGE_CERTIFICATION_INVALID_SCORE');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// ---------------------------------------------------------------------------
// Helper Functions — Type Guards
// ---------------------------------------------------------------------------

export function isSupportedKnowledgeCertificationStatus(
  value: string,
): value is KnowledgeCertificationStatus {
  return CANONICAL_KNOWLEDGE_CERTIFICATION_STATUS.includes(value as KnowledgeCertificationStatus);
}

export function isSupportedKnowledgeFindingSeverity(
  value: string,
): value is KnowledgeFindingSeverity {
  return CANONICAL_KNOWLEDGE_FINDING_SEVERITY.includes(value as KnowledgeFindingSeverity);
}

export function isSupportedKnowledgeQualityDimension(
  value: string,
): value is KnowledgeQualityDimension {
  return CANONICAL_KNOWLEDGE_QUALITY_DIMENSIONS.includes(value as KnowledgeQualityDimension);
}

// ---------------------------------------------------------------------------
// Helper Functions — Canonical Getters
// ---------------------------------------------------------------------------

export function getCanonicalKnowledgeCertificationStatuses(): readonly KnowledgeCertificationStatus[] {
  return CANONICAL_KNOWLEDGE_CERTIFICATION_STATUS;
}

export function getCanonicalKnowledgeFindingSeverities(): readonly KnowledgeFindingSeverity[] {
  return CANONICAL_KNOWLEDGE_FINDING_SEVERITY;
}

export function getCanonicalKnowledgeQualityDimensions(): readonly KnowledgeQualityDimension[] {
  return CANONICAL_KNOWLEDGE_QUALITY_DIMENSIONS;
}

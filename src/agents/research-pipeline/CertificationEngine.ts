/**
 * NV-1400-D2-OPT-11 — Research Composition Certification Engine
 *
 * Deterministic certification engine for research composition quality.
 * Evaluates whether a composed Research Artifact satisfies all architectural requirements.
 *
 * This module never:
 * - Generates research
 * - Modifies research
 * - Summarizes papers
 * - Ranks papers
 * - Infers missing evidence
 * - Infers chronology
 * - Infers lineage
 * - Infers benchmarks
 * - Infers datasets
 * - Infers reading paths
 * - Infers laboratories
 * - Repairs artifacts
 * - Calls external APIs
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import type {
  ResearchCompositionCertificationStatus,
  ResearchCompositionFindingSeverity,
  ResearchCompositionFinding,
  ResearchCompositionQualityDimension,
  ResearchCompositionCertificationReport,
  ResearchCompositionCertificationInput,
} from './ResearchAgentContract.ts';

import {
  CANONICAL_CERTIFICATION_STATUSES,
  CANONICAL_FINDING_SEVERITIES,
  CANONICAL_QUALITY_DIMENSIONS,
} from './ResearchAgentContract.ts';

// ---------------------------------------------------------------------------
// Finding Composition
// ---------------------------------------------------------------------------

/**
 * Composes a certification finding.
 * Pure function. No side effects.
 */
export function composeCertificationFinding(
  code: string,
  message: string,
  severity: ResearchCompositionFindingSeverity,
  qualityDimension: ResearchCompositionQualityDimension,
  affectedArtifact: string,
  rationale: string,
): ResearchCompositionFinding {
  return {
    code,
    message,
    severity,
    qualityDimension,
    affectedArtifact,
    rationale,
  };
}

// ---------------------------------------------------------------------------
// Certification Report Composition
// ---------------------------------------------------------------------------

/**
 * Composes a certification report.
 * Pure function. No side effects.
 */
export function composeCertificationReport(
  certificationId: string,
  status: ResearchCompositionCertificationStatus,
  findings: readonly ResearchCompositionFinding[],
  qualityScore: number,
  dimensionsChecked: readonly ResearchCompositionQualityDimension[],
): ResearchCompositionCertificationReport {
  return {
    certificationId,
    status,
    findings: [...findings],
    qualityScore,
    dimensionsChecked: [...dimensionsChecked],
    deterministic: true,
    generatedFrom: 'deterministic_certification_engine',
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Certification Engine
// ---------------------------------------------------------------------------

/**
 * Certifies a research composition.
 * Pure function. No side effects.
 */
export function certifyResearchComposition(
  input: ResearchCompositionCertificationInput,
): ResearchCompositionCertificationReport {
  const findings: ResearchCompositionFinding[] = [];
  const dimensionsChecked: ResearchCompositionQualityDimension[] = [];

  // Evidence integrity
  const evidenceFindings = _evaluateEvidenceIntegrity(input);
  findings.push(...evidenceFindings);
  dimensionsChecked.push('evidence_integrity');

  // Lineage integrity
  const lineageFindings = _evaluateLineageIntegrity(input);
  findings.push(...lineageFindings);
  dimensionsChecked.push('lineage_integrity');

  // Comparison integrity
  const comparisonFindings = _evaluateComparisonIntegrity(input);
  findings.push(...comparisonFindings);
  dimensionsChecked.push('comparison_integrity');

  // Timeline integrity
  const timelineFindings = _evaluateTimelineIntegrity(input);
  findings.push(...timelineFindings);
  dimensionsChecked.push('timeline_integrity');

  // Benchmark integrity
  const benchmarkFindings = _evaluateBenchmarkIntegrity(input);
  findings.push(...benchmarkFindings);
  dimensionsChecked.push('benchmark_integrity');

  // Dataset integrity
  const datasetFindings = _evaluateDatasetIntegrity(input);
  findings.push(...datasetFindings);
  dimensionsChecked.push('dataset_integrity');

  // Industry integrity
  const industryFindings = _evaluateIndustryIntegrity(input);
  findings.push(...industryFindings);
  dimensionsChecked.push('industry_integrity');

  // Evolution integrity
  const evolutionFindings = _evaluateEvolutionIntegrity(input);
  findings.push(...evolutionFindings);
  dimensionsChecked.push('evolution_integrity');

  // Reading path integrity
  const readingPathFindings = _evaluateReadingPathIntegrity(input);
  findings.push(...readingPathFindings);
  dimensionsChecked.push('reading_path_integrity');

  // Laboratory integrity
  const laboratoryFindings = _evaluateLaboratoryIntegrity(input);
  findings.push(...laboratoryFindings);
  dimensionsChecked.push('laboratory_integrity');

  // Open question integrity
  const openQuestionFindings = _evaluateOpenQuestionIntegrity(input);
  findings.push(...openQuestionFindings);
  dimensionsChecked.push('open_question_integrity');

  // Maintenance integrity
  const maintenanceFindings = _evaluateMaintenanceIntegrity(input);
  findings.push(...maintenanceFindings);
  dimensionsChecked.push('maintenance_integrity');

  // Provenance integrity
  const provenanceFindings = _evaluateProvenanceIntegrity(input);
  findings.push(...provenanceFindings);
  dimensionsChecked.push('provenance_integrity');

  // Determinism
  const determinismFindings = _evaluateDeterminism(input);
  findings.push(...determinismFindings);
  dimensionsChecked.push('determinism');

  // Architectural boundary
  const architecturalFindings = _evaluateArchitecturalBoundary(input);
  findings.push(...architecturalFindings);
  dimensionsChecked.push('architectural_boundary');

  // Validation integrity
  const validationFindings = _evaluateValidationIntegrity(input);
  findings.push(...validationFindings);
  dimensionsChecked.push('validation_integrity');

  // Documentation completeness
  const documentationFindings = _evaluateDocumentationCompleteness(input);
  findings.push(...documentationFindings);
  dimensionsChecked.push('documentation_completeness');

  // Determine certification status
  const status = _determineCertificationStatus(findings);

  // Calculate quality score
  const qualityScore = _calculateQualityScore(findings);

  return composeCertificationReport(
    `_certification_${input.conceptId}`,
    status,
    findings,
    qualityScore,
    dimensionsChecked,
  );
}

// ---------------------------------------------------------------------------
// Quality Dimension Evaluators
// ---------------------------------------------------------------------------

/**
 * Evaluates evidence integrity.
 */
function _evaluateEvidenceIntegrity(
  input: ResearchCompositionCertificationInput,
): readonly ResearchCompositionFinding[] {
  const findings: ResearchCompositionFinding[] = [];

  if (!input.evidenceArtifact) {
    findings.push(composeCertificationFinding(
      'CERT_EVIDENCE_MISSING',
      'Evidence artifact is missing.',
      'error',
      'evidence_integrity',
      'evidenceArtifact',
      'Evidence is required for research composition.',
    ));
  } else {
    if (!input.evidenceArtifact.evidenceMetadata || input.evidenceArtifact.evidenceMetadata.length === 0) {
      findings.push(composeCertificationFinding(
        'CERT_EVIDENCE_EMPTY',
        'Evidence metadata is empty.',
        'error',
        'evidence_integrity',
        'evidenceArtifact.evidenceMetadata',
        'Evidence metadata must contain at least one entry.',
      ));
    }

    if (!input.evidenceArtifact.evidenceChain || !input.evidenceArtifact.evidenceChain.chainId) {
      findings.push(composeCertificationFinding(
        'CERT_EVIDENCE_CHAIN_MISSING',
        'Evidence chain is missing.',
        'warning',
        'evidence_integrity',
        'evidenceArtifact.evidenceChain',
        'Evidence chain should be present for complete evidence.',
      ));
    }

    if (!input.evidenceArtifact.evidenceTrace || !input.evidenceArtifact.evidenceTrace.deterministic) {
      findings.push(composeCertificationFinding(
        'CERT_EVIDENCE_TRACE_NON_DETERMINISTIC',
        'Evidence trace is not deterministic.',
        'error',
        'evidence_integrity',
        'evidenceArtifact.evidenceTrace',
        'Evidence trace must declare deterministic: true.',
      ));
    }
  }

  return findings;
}

/**
 * Evaluates lineage integrity.
 */
function _evaluateLineageIntegrity(
  input: ResearchCompositionCertificationInput,
): readonly ResearchCompositionFinding[] {
  const findings: ResearchCompositionFinding[] = [];

  if (!input.lineageArtifact) {
    findings.push(composeCertificationFinding(
      'CERT_LINEAGE_MISSING',
      'Lineage artifact is missing.',
      'warning',
      'lineage_integrity',
      'lineageArtifact',
      'Lineage artifact is recommended for complete research composition.',
    ));
  } else {
    if (!input.lineageArtifact.lineageGraph || !input.lineageArtifact.lineageGraph.graphId) {
      findings.push(composeCertificationFinding(
        'CERT_LINEAGE_GRAPH_MISSING',
        'Lineage graph is missing.',
        'error',
        'lineage_integrity',
        'lineageArtifact.lineageGraph',
        'Lineage graph must be present.',
      ));
    }

    if (!input.lineageArtifact.lineageTrace || !input.lineageArtifact.lineageTrace.deterministic) {
      findings.push(composeCertificationFinding(
        'CERT_LINEAGE_TRACE_NON_DETERMINISTIC',
        'Lineage trace is not deterministic.',
        'error',
        'lineage_integrity',
        'lineageArtifact.lineageTrace',
        'Lineage trace must declare deterministic: true.',
      ));
    }
  }

  return findings;
}

/**
 * Evaluates comparison integrity.
 */
function _evaluateComparisonIntegrity(
  input: ResearchCompositionCertificationInput,
): readonly ResearchCompositionFinding[] {
  const findings: ResearchCompositionFinding[] = [];

  if (!input.comparisonArtifact) {
    findings.push(composeCertificationFinding(
      'CERT_COMPARISON_MISSING',
      'Comparison artifact is missing.',
      'warning',
      'comparison_integrity',
      'comparisonArtifact',
      'Comparison artifact is recommended for complete research composition.',
    ));
  } else {
    if (!input.comparisonArtifact.comparisonMatrix || !input.comparisonArtifact.comparisonMatrix.matrixId) {
      findings.push(composeCertificationFinding(
        'CERT_COMPARISON_MATRIX_MISSING',
        'Comparison matrix is missing.',
        'error',
        'comparison_integrity',
        'comparisonArtifact.comparisonMatrix',
        'Comparison matrix must be present.',
      ));
    }

    if (!input.comparisonArtifact.comparisonTrace || !input.comparisonArtifact.comparisonTrace.deterministic) {
      findings.push(composeCertificationFinding(
        'CERT_COMPARISON_TRACE_NON_DETERMINISTIC',
        'Comparison trace is not deterministic.',
        'error',
        'comparison_integrity',
        'comparisonArtifact.comparisonTrace',
        'Comparison trace must declare deterministic: true.',
      ));
    }
  }

  return findings;
}

/**
 * Evaluates timeline integrity.
 */
function _evaluateTimelineIntegrity(
  input: ResearchCompositionCertificationInput,
): readonly ResearchCompositionFinding[] {
  const findings: ResearchCompositionFinding[] = [];

  if (!input.timelineArtifact) {
    findings.push(composeCertificationFinding(
      'CERT_TIMELINE_MISSING',
      'Timeline artifact is missing.',
      'warning',
      'timeline_integrity',
      'timelineArtifact',
      'Timeline artifact is recommended for complete research composition.',
    ));
  } else {
    if (!input.timelineArtifact.timeline || !input.timelineArtifact.timeline.timelineId) {
      findings.push(composeCertificationFinding(
        'CERT_TIMELINE_GRAPH_MISSING',
        'Timeline is missing.',
        'error',
        'timeline_integrity',
        'timelineArtifact.timeline',
        'Timeline must be present.',
      ));
    }

    if (!input.timelineArtifact.timelineTrace || !input.timelineArtifact.timelineTrace.deterministic) {
      findings.push(composeCertificationFinding(
        'CERT_TIMELINE_TRACE_NON_DETERMINISTIC',
        'Timeline trace is not deterministic.',
        'error',
        'timeline_integrity',
        'timelineArtifact.timelineTrace',
        'Timeline trace must declare deterministic: true.',
      ));
    }
  }

  return findings;
}

/**
 * Evaluates benchmark integrity.
 */
function _evaluateBenchmarkIntegrity(
  input: ResearchCompositionCertificationInput,
): readonly ResearchCompositionFinding[] {
  const findings: ResearchCompositionFinding[] = [];

  if (!input.benchmarkArtifact) {
    findings.push(composeCertificationFinding(
      'CERT_BENCHMARK_MISSING',
      'Benchmark artifact is missing.',
      'warning',
      'benchmark_integrity',
      'benchmarkArtifact',
      'Benchmark artifact is recommended for complete research composition.',
    ));
  } else {
    if (!input.benchmarkArtifact.benchmarkRegistry || !input.benchmarkArtifact.benchmarkRegistry.registryId) {
      findings.push(composeCertificationFinding(
        'CERT_BENCHMARK_REGISTRY_MISSING',
        'Benchmark registry is missing.',
        'error',
        'benchmark_integrity',
        'benchmarkArtifact.benchmarkRegistry',
        'Benchmark registry must be present.',
      ));
    }

    if (!input.benchmarkArtifact.benchmarkTrace || !input.benchmarkArtifact.benchmarkTrace.deterministic) {
      findings.push(composeCertificationFinding(
        'CERT_BENCHMARK_TRACE_NON_DETERMINISTIC',
        'Benchmark trace is not deterministic.',
        'error',
        'benchmark_integrity',
        'benchmarkArtifact.benchmarkTrace',
        'Benchmark trace must declare deterministic: true.',
      ));
    }
  }

  return findings;
}

/**
 * Evaluates dataset integrity.
 */
function _evaluateDatasetIntegrity(
  input: ResearchCompositionCertificationInput,
): readonly ResearchCompositionFinding[] {
  const findings: ResearchCompositionFinding[] = [];

  if (!input.datasetArtifact) {
    findings.push(composeCertificationFinding(
      'CERT_DATASET_MISSING',
      'Dataset artifact is missing.',
      'warning',
      'dataset_integrity',
      'datasetArtifact',
      'Dataset artifact is recommended for complete research composition.',
    ));
  } else {
    if (!input.datasetArtifact.datasetRegistry || !input.datasetArtifact.datasetRegistry.registryId) {
      findings.push(composeCertificationFinding(
        'CERT_DATASET_REGISTRY_MISSING',
        'Dataset registry is missing.',
        'error',
        'dataset_integrity',
        'datasetArtifact.datasetRegistry',
        'Dataset registry must be present.',
      ));
    }

    if (!input.datasetArtifact.datasetTrace || !input.datasetArtifact.datasetTrace.deterministic) {
      findings.push(composeCertificationFinding(
        'CERT_DATASET_TRACE_NON_DETERMINISTIC',
        'Dataset trace is not deterministic.',
        'error',
        'dataset_integrity',
        'datasetArtifact.datasetTrace',
        'Dataset trace must declare deterministic: true.',
      ));
    }
  }

  return findings;
}

/**
 * Evaluates industry integrity.
 */
function _evaluateIndustryIntegrity(
  input: ResearchCompositionCertificationInput,
): readonly ResearchCompositionFinding[] {
  const findings: ResearchCompositionFinding[] = [];

  if (!input.industryArtifact) {
    findings.push(composeCertificationFinding(
      'CERT_INDUSTRY_MISSING',
      'Industry artifact is missing.',
      'warning',
      'industry_integrity',
      'industryArtifact',
      'Industry artifact is recommended for complete research composition.',
    ));
  } else {
    if (!input.industryArtifact.industryRegistry || !input.industryArtifact.industryRegistry.registryId) {
      findings.push(composeCertificationFinding(
        'CERT_INDUSTRY_REGISTRY_MISSING',
        'Industry registry is missing.',
        'error',
        'industry_integrity',
        'industryArtifact.industryRegistry',
        'Industry registry must be present.',
      ));
    }

    if (!input.industryArtifact.industryTrace || !input.industryArtifact.industryTrace.deterministic) {
      findings.push(composeCertificationFinding(
        'CERT_INDUSTRY_TRACE_NON_DETERMINISTIC',
        'Industry trace is not deterministic.',
        'error',
        'industry_integrity',
        'industryArtifact.industryTrace',
        'Industry trace must declare deterministic: true.',
      ));
    }
  }

  return findings;
}

/**
 * Evaluates evolution integrity.
 */
function _evaluateEvolutionIntegrity(
  input: ResearchCompositionCertificationInput,
): readonly ResearchCompositionFinding[] {
  const findings: ResearchCompositionFinding[] = [];

  if (!input.evolutionArtifact) {
    findings.push(composeCertificationFinding(
      'CERT_EVOLUTION_MISSING',
      'Evolution artifact is missing.',
      'warning',
      'evolution_integrity',
      'evolutionArtifact',
      'Evolution artifact is recommended for complete research composition.',
    ));
  } else {
    if (!input.evolutionArtifact.evolutionGraph || !input.evolutionArtifact.evolutionGraph.graphId) {
      findings.push(composeCertificationFinding(
        'CERT_EVOLUTION_GRAPH_MISSING',
        'Evolution graph is missing.',
        'error',
        'evolution_integrity',
        'evolutionArtifact.evolutionGraph',
        'Evolution graph must be present.',
      ));
    }

    if (!input.evolutionArtifact.evolutionTrace || !input.evolutionArtifact.evolutionTrace.deterministic) {
      findings.push(composeCertificationFinding(
        'CERT_EVOLUTION_TRACE_NON_DETERMINISTIC',
        'Evolution trace is not deterministic.',
        'error',
        'evolution_integrity',
        'evolutionArtifact.evolutionTrace',
        'Evolution trace must declare deterministic: true.',
      ));
    }
  }

  return findings;
}

/**
 * Evaluates reading path integrity.
 */
function _evaluateReadingPathIntegrity(
  input: ResearchCompositionCertificationInput,
): readonly ResearchCompositionFinding[] {
  const findings: ResearchCompositionFinding[] = [];

  if (!input.readingPathArtifact) {
    findings.push(composeCertificationFinding(
      'CERT_READING_PATH_MISSING',
      'Reading path artifact is missing.',
      'warning',
      'reading_path_integrity',
      'readingPathArtifact',
      'Reading path artifact is recommended for complete research composition.',
    ));
  } else {
    if (!input.readingPathArtifact.readingPathRegistry || !input.readingPathArtifact.readingPathRegistry.registryId) {
      findings.push(composeCertificationFinding(
        'CERT_READING_PATH_REGISTRY_MISSING',
        'Reading path registry is missing.',
        'error',
        'reading_path_integrity',
        'readingPathArtifact.readingPathRegistry',
        'Reading path registry must be present.',
      ));
    }

    if (!input.readingPathArtifact.readingPathTrace || !input.readingPathArtifact.readingPathTrace.deterministic) {
      findings.push(composeCertificationFinding(
        'CERT_READING_PATH_TRACE_NON_DETERMINISTIC',
        'Reading path trace is not deterministic.',
        'error',
        'reading_path_integrity',
        'readingPathArtifact.readingPathTrace',
        'Reading path trace must declare deterministic: true.',
      ));
    }
  }

  return findings;
}

/**
 * Evaluates laboratory integrity.
 */
function _evaluateLaboratoryIntegrity(
  input: ResearchCompositionCertificationInput,
): readonly ResearchCompositionFinding[] {
  const findings: ResearchCompositionFinding[] = [];

  if (!input.laboratoryArtifact) {
    findings.push(composeCertificationFinding(
      'CERT_LABORATORY_MISSING',
      'Laboratory artifact is missing.',
      'warning',
      'laboratory_integrity',
      'laboratoryArtifact',
      'Laboratory artifact is recommended for complete research composition.',
    ));
  } else {
    if (!input.laboratoryArtifact.laboratoryRegistry || !input.laboratoryArtifact.laboratoryRegistry.registryId) {
      findings.push(composeCertificationFinding(
        'CERT_LABORATORY_REGISTRY_MISSING',
        'Laboratory registry is missing.',
        'error',
        'laboratory_integrity',
        'laboratoryArtifact.laboratoryRegistry',
        'Laboratory registry must be present.',
      ));
    }

    if (!input.laboratoryArtifact.laboratoryTrace || !input.laboratoryArtifact.laboratoryTrace.deterministic) {
      findings.push(composeCertificationFinding(
        'CERT_LABORATORY_TRACE_NON_DETERMINISTIC',
        'Laboratory trace is not deterministic.',
        'error',
        'laboratory_integrity',
        'laboratoryArtifact.laboratoryTrace',
        'Laboratory trace must declare deterministic: true.',
      ));
    }
  }

  return findings;
}

/**
 * Evaluates open question integrity.
 */
function _evaluateOpenQuestionIntegrity(
  input: ResearchCompositionCertificationInput,
): readonly ResearchCompositionFinding[] {
  const findings: ResearchCompositionFinding[] = [];

  if (!input.openQuestionsArtifact) {
    findings.push(composeCertificationFinding(
      'CERT_OPEN_QUESTIONS_MISSING',
      'Open questions artifact is missing.',
      'warning',
      'open_question_integrity',
      'openQuestionsArtifact',
      'Open questions artifact is recommended for complete research composition.',
    ));
  } else {
    if (!input.openQuestionsArtifact.openQuestionRegistry || !input.openQuestionsArtifact.openQuestionRegistry.registryId) {
      findings.push(composeCertificationFinding(
        'CERT_OPEN_QUESTIONS_REGISTRY_MISSING',
        'Open questions registry is missing.',
        'error',
        'open_question_integrity',
        'openQuestionsArtifact.openQuestionRegistry',
        'Open questions registry must be present.',
      ));
    }

    if (!input.openQuestionsArtifact.openQuestionTrace || !input.openQuestionsArtifact.openQuestionTrace.deterministic) {
      findings.push(composeCertificationFinding(
        'CERT_OPEN_QUESTIONS_TRACE_NON_DETERMINISTIC',
        'Open questions trace is not deterministic.',
        'error',
        'open_question_integrity',
        'openQuestionsArtifact.openQuestionTrace',
        'Open questions trace must declare deterministic: true.',
      ));
    }

    // Check for generated/speculative content
    if (input.openQuestionsArtifact.openQuestionRegistry) {
      for (const question of input.openQuestionsArtifact.openQuestionRegistry.questions) {
        if (question.questionText && question.questionText.includes('predicted') ||
            question.questionText && question.questionText.includes('will be')) {
          findings.push(composeCertificationFinding(
            'CERT_OPEN_QUESTIONS_SPECULATIVE',
            'Open question contains speculative content.',
            'error',
            'open_question_integrity',
            'openQuestionsArtifact.openQuestionRegistry.questions',
            'Open questions must not contain speculative predictions.',
          ));
          break;
        }
      }
    }
  }

  return findings;
}

/**
 * Evaluates maintenance integrity.
 */
function _evaluateMaintenanceIntegrity(
  input: ResearchCompositionCertificationInput,
): readonly ResearchCompositionFinding[] {
  const findings: ResearchCompositionFinding[] = [];

  if (!input.maintenanceArtifact) {
    findings.push(composeCertificationFinding(
      'CERT_MAINTENANCE_MISSING',
      'Maintenance artifact is missing.',
      'warning',
      'maintenance_integrity',
      'maintenanceArtifact',
      'Maintenance artifact is recommended for complete research composition.',
    ));
  } else {
    if (!input.maintenanceArtifact.maintenanceRegistry || !input.maintenanceArtifact.maintenanceRegistry.registryId) {
      findings.push(composeCertificationFinding(
        'CERT_MAINTENANCE_REGISTRY_MISSING',
        'Maintenance registry is missing.',
        'error',
        'maintenance_integrity',
        'maintenanceArtifact.maintenanceRegistry',
        'Maintenance registry must be present.',
      ));
    }

    if (!input.maintenanceArtifact.maintenanceTrace || !input.maintenanceArtifact.maintenanceTrace.deterministic) {
      findings.push(composeCertificationFinding(
        'CERT_MAINTENANCE_TRACE_NON_DETERMINISTIC',
        'Maintenance trace is not deterministic.',
        'error',
        'maintenance_integrity',
        'maintenanceArtifact.maintenanceTrace',
        'Maintenance trace must declare deterministic: true.',
      ));
    }

    // Check for automatic revision implications
    if (input.maintenanceArtifact.maintenanceRegistry) {
      for (const signal of input.maintenanceArtifact.maintenanceRegistry.signals) {
        if (signal.recommendedAction === 'replace_reference' &&
            (!signal.replacementReferenceIds || signal.replacementReferenceIds.length === 0)) {
          findings.push(composeCertificationFinding(
            'CERT_MAINTENANCE_REPLACEMENT_MISSING',
            'Maintenance signal recommends replacement but has no replacement references.',
            'error',
            'maintenance_integrity',
            'maintenanceArtifact.maintenanceRegistry.signals',
            'Replacement signals must specify replacement reference IDs.',
          ));
          break;
        }
      }
    }
  }

  return findings;
}

/**
 * Evaluates provenance integrity.
 */
function _evaluateProvenanceIntegrity(
  input: ResearchCompositionCertificationInput,
): readonly ResearchCompositionFinding[] {
  const findings: ResearchCompositionFinding[] = [];

  // Check evidence provenance
  if (input.evidenceArtifact) {
    const hasLineage = !!input.lineageArtifact;
    const hasComparison = !!input.comparisonArtifact;
    const hasTimeline = !!input.timelineArtifact;
    const hasBenchmark = !!input.benchmarkArtifact;
    const hasDataset = !!input.datasetArtifact;
    const hasIndustry = !!input.industryArtifact;
    const hasEvolution = !!input.evolutionArtifact;
    const hasReadingPath = !!input.readingPathArtifact;
    const hasLaboratory = !!input.laboratoryArtifact;
    const hasOpenQuestions = !!input.openQuestionsArtifact;
    const hasMaintenance = !!input.maintenanceArtifact;

    const allArtifactsPresent =
      hasLineage && hasComparison && hasTimeline && hasBenchmark &&
      hasDataset && hasIndustry && hasEvolution && hasReadingPath &&
      hasLaboratory && hasOpenQuestions && hasMaintenance;

    for (const metadata of input.evidenceArtifact.evidenceMetadata) {
      const hasProvenance = (metadata as { provenance?: { source?: string; provider?: string; rationale?: string } }).provenance;
      if (!allArtifactsPresent && (!hasProvenance || !hasProvenance.source || hasProvenance.source.trim() === '')) {
        findings.push(composeCertificationFinding(
          'CERT_PROVENANCE_EVIDENCE_MISSING',
          'Evidence metadata is missing provenance.',
          'warning',
          'provenance_integrity',
          'evidenceArtifact.evidenceMetadata',
          'All evidence metadata must have provenance.',
        ));
        break;
      }
    }
  }

  // Check lineage provenance
  if (input.lineageArtifact && input.lineageArtifact.lineageGraph) {
    for (const node of input.lineageArtifact.lineageGraph.nodes) {
      if (!node.governanceStatus || node.governanceStatus.trim() === '') {
        findings.push(composeCertificationFinding(
          'CERT_PROVENANCE_LINEAGE_MISSING',
          'Lineage node is missing governance status.',
          'error',
          'provenance_integrity',
          'lineageArtifact.lineageGraph.nodes',
          'All lineage nodes must have governance status.',
        ));
        break;
      }
    }
  }

  // Check comparison provenance
  if (input.comparisonArtifact && input.comparisonArtifact.comparisonMatrix) {
    for (const entry of input.comparisonArtifact.comparisonMatrix.entries) {
      if (!entry.provenance || !entry.provenance.rationale || entry.provenance.rationale.trim() === '') {
        findings.push(composeCertificationFinding(
          'CERT_PROVENANCE_COMPARISON_MISSING',
          'Comparison entry is missing provenance.',
          'error',
          'provenance_integrity',
          'comparisonArtifact.comparisonMatrix.entries',
          'All comparison entries must have provenance.',
        ));
        break;
      }
    }
  }

  // Check timeline provenance
  if (input.timelineArtifact && input.timelineArtifact.timeline) {
    for (const event of input.timelineArtifact.timeline.events) {
      if (!event.provenance || !event.provenance.rationale || event.provenance.rationale.trim() === '') {
        findings.push(composeCertificationFinding(
          'CERT_PROVENANCE_TIMELINE_MISSING',
          'Timeline event is missing provenance.',
          'error',
          'provenance_integrity',
          'timelineArtifact.timeline.events',
          'All timeline events must have provenance.',
        ));
        break;
      }
    }
  }

  // Check benchmark provenance
  if (input.benchmarkArtifact && input.benchmarkArtifact.benchmarkRegistry) {
    for (const benchmark of input.benchmarkArtifact.benchmarkRegistry.benchmarks) {
      if (!benchmark.provenance || !benchmark.provenance.rationale || benchmark.provenance.rationale.trim() === '') {
        findings.push(composeCertificationFinding(
          'CERT_PROVENANCE_BENCHMARK_MISSING',
          'Benchmark is missing provenance.',
          'error',
          'provenance_integrity',
          'benchmarkArtifact.benchmarkRegistry.benchmarks',
          'All benchmarks must have provenance.',
        ));
        break;
      }
    }
  }

  // Check dataset provenance
  if (input.datasetArtifact && input.datasetArtifact.datasetRegistry) {
    for (const dataset of input.datasetArtifact.datasetRegistry.datasets) {
      if (!dataset.provenance || !dataset.provenance.rationale || dataset.provenance.rationale.trim() === '') {
        findings.push(composeCertificationFinding(
          'CERT_PROVENANCE_DATASET_MISSING',
          'Dataset is missing provenance.',
          'error',
          'provenance_integrity',
          'datasetArtifact.datasetRegistry.datasets',
          'All datasets must have provenance.',
        ));
        break;
      }
    }
  }

  // Check industry provenance
  if (input.industryArtifact && input.industryArtifact.industryRegistry) {
    for (const record of input.industryArtifact.industryRegistry.records) {
      if (!record.provenance || !record.provenance.rationale || record.provenance.rationale.trim() === '') {
        findings.push(composeCertificationFinding(
          'CERT_PROVENANCE_INDUSTRY_MISSING',
          'Industry record is missing provenance.',
          'error',
          'provenance_integrity',
          'industryArtifact.industryRegistry.records',
          'All industry records must have provenance.',
        ));
        break;
      }
    }
  }

  // Check evolution provenance
  if (input.evolutionArtifact && input.evolutionArtifact.evolutionGraph) {
    for (const edge of input.evolutionArtifact.evolutionGraph.edges) {
      if (!edge.provenance || !edge.provenance.rationale || edge.provenance.rationale.trim() === '') {
        findings.push(composeCertificationFinding(
          'CERT_PROVENANCE_EVOLUTION_MISSING',
          'Evolution edge is missing provenance.',
          'error',
          'provenance_integrity',
          'evolutionArtifact.evolutionGraph.edges',
          'All evolution edges must have provenance.',
        ));
        break;
      }
    }
  }

  // Check reading path provenance
  if (input.readingPathArtifact && input.readingPathArtifact.readingPathRegistry) {
    for (const path of input.readingPathArtifact.readingPathRegistry.paths) {
      if (!path.provenance || !path.provenance.rationale || path.provenance.rationale.trim() === '') {
        findings.push(composeCertificationFinding(
          'CERT_PROVENANCE_READING_PATH_MISSING',
          'Reading path is missing provenance.',
          'error',
          'provenance_integrity',
          'readingPathArtifact.readingPathRegistry.paths',
          'All reading paths must have provenance.',
        ));
        break;
      }
    }
  }

  // Check laboratory provenance
  if (input.laboratoryArtifact && input.laboratoryArtifact.laboratoryRegistry) {
    for (const lab of input.laboratoryArtifact.laboratoryRegistry.laboratories) {
      if (!lab.provenance || !lab.provenance.rationale || lab.provenance.rationale.trim() === '') {
        findings.push(composeCertificationFinding(
          'CERT_PROVENANCE_LABORATORY_MISSING',
          'Laboratory is missing provenance.',
          'error',
          'provenance_integrity',
          'laboratoryArtifact.laboratoryRegistry.laboratories',
          'All laboratories must have provenance.',
        ));
        break;
      }
    }
  }

  // Check open question provenance
  if (input.openQuestionsArtifact && input.openQuestionsArtifact.openQuestionRegistry) {
    for (const question of input.openQuestionsArtifact.openQuestionRegistry.questions) {
      if (!question.provenance || !question.provenance.rationale || question.provenance.rationale.trim() === '') {
        findings.push(composeCertificationFinding(
          'CERT_PROVENANCE_OPEN_QUESTION_MISSING',
          'Open question is missing provenance.',
          'error',
          'provenance_integrity',
          'openQuestionsArtifact.openQuestionRegistry.questions',
          'All open questions must have provenance.',
        ));
        break;
      }
    }
  }

  // Check maintenance provenance
  if (input.maintenanceArtifact && input.maintenanceArtifact.maintenanceRegistry) {
    for (const signal of input.maintenanceArtifact.maintenanceRegistry.signals) {
      if (!signal.provenance || !signal.provenance.rationale || signal.provenance.rationale.trim() === '') {
        findings.push(composeCertificationFinding(
          'CERT_PROVENANCE_MAINTENANCE_MISSING',
          'Maintenance signal is missing provenance.',
          'error',
          'provenance_integrity',
          'maintenanceArtifact.maintenanceRegistry.signals',
          'All maintenance signals must have provenance.',
        ));
        break;
      }
    }
  }

  return findings;
}

/**
 * Evaluates determinism.
 */
function _evaluateDeterminism(
  input: ResearchCompositionCertificationInput,
): readonly ResearchCompositionFinding[] {
  const findings: ResearchCompositionFinding[] = [];

  // Check evidence trace determinism
  if (input.evidenceArtifact && input.evidenceArtifact.evidenceTrace) {
    if (input.evidenceArtifact.evidenceTrace.randomUsed !== false) {
      findings.push(composeCertificationFinding(
        'CERT_DETERMINISM_EVIDENCE_RANDOM',
        'Evidence trace declares randomUsed: true.',
        'error',
        'determinism',
        'evidenceArtifact.evidenceTrace',
        'All traces must declare randomUsed: false.',
      ));
    }
    if (input.evidenceArtifact.evidenceTrace.timeDependency !== false) {
      findings.push(composeCertificationFinding(
        'CERT_DETERMINISM_EVIDENCE_TIME',
        'Evidence trace declares timeDependency: true.',
        'error',
        'determinism',
        'evidenceArtifact.evidenceTrace',
        'All traces must declare timeDependency: false.',
      ));
    }
  }

  // Check lineage trace determinism
  if (input.lineageArtifact && input.lineageArtifact.lineageTrace) {
    if (input.lineageArtifact.lineageTrace.randomUsed !== false) {
      findings.push(composeCertificationFinding(
        'CERT_DETERMINISM_LINEAGE_RANDOM',
        'Lineage trace declares randomUsed: true.',
        'error',
        'determinism',
        'lineageArtifact.lineageTrace',
        'All traces must declare randomUsed: false.',
      ));
    }
    if (input.lineageArtifact.lineageTrace.timeDependency !== false) {
      findings.push(composeCertificationFinding(
        'CERT_DETERMINISM_LINEAGE_TIME',
        'Lineage trace declares timeDependency: true.',
        'error',
        'determinism',
        'lineageArtifact.lineageTrace',
        'All traces must declare timeDependency: false.',
      ));
    }
  }

  // Check comparison trace determinism
  if (input.comparisonArtifact && input.comparisonArtifact.comparisonTrace) {
    if (input.comparisonArtifact.comparisonTrace.randomUsed !== false) {
      findings.push(composeCertificationFinding(
        'CERT_DETERMINISM_COMPARISON_RANDOM',
        'Comparison trace declares randomUsed: true.',
        'error',
        'determinism',
        'comparisonArtifact.comparisonTrace',
        'All traces must declare randomUsed: false.',
      ));
    }
    if (input.comparisonArtifact.comparisonTrace.timeDependency !== false) {
      findings.push(composeCertificationFinding(
        'CERT_DETERMINISM_COMPARISON_TIME',
        'Comparison trace declares timeDependency: true.',
        'error',
        'determinism',
        'comparisonArtifact.comparisonTrace',
        'All traces must declare timeDependency: false.',
      ));
    }
  }

  // Check timeline trace determinism
  if (input.timelineArtifact && input.timelineArtifact.timelineTrace) {
    if (input.timelineArtifact.timelineTrace.randomUsed !== false) {
      findings.push(composeCertificationFinding(
        'CERT_DETERMINISM_TIMELINE_RANDOM',
        'Timeline trace declares randomUsed: true.',
        'error',
        'determinism',
        'timelineArtifact.timelineTrace',
        'All traces must declare randomUsed: false.',
      ));
    }
    if (input.timelineArtifact.timelineTrace.timeDependency !== false) {
      findings.push(composeCertificationFinding(
        'CERT_DETERMINISM_TIMELINE_TIME',
        'Timeline trace declares timeDependency: true.',
        'error',
        'determinism',
        'timelineArtifact.timelineTrace',
        'All traces must declare timeDependency: false.',
      ));
    }
  }

  // Check benchmark trace determinism
  if (input.benchmarkArtifact && input.benchmarkArtifact.benchmarkTrace) {
    if (input.benchmarkArtifact.benchmarkTrace.randomUsed !== false) {
      findings.push(composeCertificationFinding(
        'CERT_DETERMINISM_BENCHMARK_RANDOM',
        'Benchmark trace declares randomUsed: true.',
        'error',
        'determinism',
        'benchmarkArtifact.benchmarkTrace',
        'All traces must declare randomUsed: false.',
      ));
    }
    if (input.benchmarkArtifact.benchmarkTrace.timeDependency !== false) {
      findings.push(composeCertificationFinding(
        'CERT_DETERMINISM_BENCHMARK_TIME',
        'Benchmark trace declares timeDependency: true.',
        'error',
        'determinism',
        'benchmarkArtifact.benchmarkTrace',
        'All traces must declare timeDependency: false.',
      ));
    }
  }

  // Check dataset trace determinism
  if (input.datasetArtifact && input.datasetArtifact.datasetTrace) {
    if (input.datasetArtifact.datasetTrace.randomUsed !== false) {
      findings.push(composeCertificationFinding(
        'CERT_DETERMINISM_DATASET_RANDOM',
        'Dataset trace declares randomUsed: true.',
        'error',
        'determinism',
        'datasetArtifact.datasetTrace',
        'All traces must declare randomUsed: false.',
      ));
    }
    if (input.datasetArtifact.datasetTrace.timeDependency !== false) {
      findings.push(composeCertificationFinding(
        'CERT_DETERMINISM_DATASET_TIME',
        'Dataset trace declares timeDependency: true.',
        'error',
        'determinism',
        'datasetArtifact.datasetTrace',
        'All traces must declare timeDependency: false.',
      ));
    }
  }

  // Check industry trace determinism
  if (input.industryArtifact && input.industryArtifact.industryTrace) {
    if (input.industryArtifact.industryTrace.randomUsed !== false) {
      findings.push(composeCertificationFinding(
        'CERT_DETERMINISM_INDUSTRY_RANDOM',
        'Industry trace declares randomUsed: true.',
        'error',
        'determinism',
        'industryArtifact.industryTrace',
        'All traces must declare randomUsed: false.',
      ));
    }
    if (input.industryArtifact.industryTrace.timeDependency !== false) {
      findings.push(composeCertificationFinding(
        'CERT_DETERMINISM_INDUSTRY_TIME',
        'Industry trace declares timeDependency: true.',
        'error',
        'determinism',
        'industryArtifact.industryTrace',
        'All traces must declare timeDependency: false.',
      ));
    }
  }

  // Check evolution trace determinism
  if (input.evolutionArtifact && input.evolutionArtifact.evolutionTrace) {
    if (input.evolutionArtifact.evolutionTrace.randomUsed !== false) {
      findings.push(composeCertificationFinding(
        'CERT_DETERMINISM_EVOLUTION_RANDOM',
        'Evolution trace declares randomUsed: true.',
        'error',
        'determinism',
        'evolutionArtifact.evolutionTrace',
        'All traces must declare randomUsed: false.',
      ));
    }
    if (input.evolutionArtifact.evolutionTrace.timeDependency !== false) {
      findings.push(composeCertificationFinding(
        'CERT_DETERMINISM_EVOLUTION_TIME',
        'Evolution trace declares timeDependency: true.',
        'error',
        'determinism',
        'evolutionArtifact.evolutionTrace',
        'All traces must declare timeDependency: false.',
      ));
    }
  }

  // Check reading path trace determinism
  if (input.readingPathArtifact && input.readingPathArtifact.readingPathTrace) {
    if (input.readingPathArtifact.readingPathTrace.randomUsed !== false) {
      findings.push(composeCertificationFinding(
        'CERT_DETERMINISM_READING_PATH_RANDOM',
        'Reading path trace declares randomUsed: true.',
        'error',
        'determinism',
        'readingPathArtifact.readingPathTrace',
        'All traces must declare randomUsed: false.',
      ));
    }
    if (input.readingPathArtifact.readingPathTrace.timeDependency !== false) {
      findings.push(composeCertificationFinding(
        'CERT_DETERMINISM_READING_PATH_TIME',
        'Reading path trace declares timeDependency: true.',
        'error',
        'determinism',
        'readingPathArtifact.readingPathTrace',
        'All traces must declare timeDependency: false.',
      ));
    }
  }

  // Check laboratory trace determinism
  if (input.laboratoryArtifact && input.laboratoryArtifact.laboratoryTrace) {
    if (input.laboratoryArtifact.laboratoryTrace.randomUsed !== false) {
      findings.push(composeCertificationFinding(
        'CERT_DETERMINISM_LABORATORY_RANDOM',
        'Laboratory trace declares randomUsed: true.',
        'error',
        'determinism',
        'laboratoryArtifact.laboratoryTrace',
        'All traces must declare randomUsed: false.',
      ));
    }
    if (input.laboratoryArtifact.laboratoryTrace.timeDependency !== false) {
      findings.push(composeCertificationFinding(
        'CERT_DETERMINISM_LABORATORY_TIME',
        'Laboratory trace declares timeDependency: true.',
        'error',
        'determinism',
        'laboratoryArtifact.laboratoryTrace',
        'All traces must declare timeDependency: false.',
      ));
    }
  }

  // Check open questions trace determinism
  if (input.openQuestionsArtifact && input.openQuestionsArtifact.openQuestionTrace) {
    if (input.openQuestionsArtifact.openQuestionTrace.randomUsed !== false) {
      findings.push(composeCertificationFinding(
        'CERT_DETERMINISM_OPEN_QUESTIONS_RANDOM',
        'Open questions trace declares randomUsed: true.',
        'error',
        'determinism',
        'openQuestionsArtifact.openQuestionTrace',
        'All traces must declare randomUsed: false.',
      ));
    }
    if (input.openQuestionsArtifact.openQuestionTrace.timeDependency !== false) {
      findings.push(composeCertificationFinding(
        'CERT_DETERMINISM_OPEN_QUESTIONS_TIME',
        'Open questions trace declares timeDependency: true.',
        'error',
        'determinism',
        'openQuestionsArtifact.openQuestionTrace',
        'All traces must declare timeDependency: false.',
      ));
    }
  }

  // Check maintenance trace determinism
  if (input.maintenanceArtifact && input.maintenanceArtifact.maintenanceTrace) {
    if (input.maintenanceArtifact.maintenanceTrace.randomUsed !== false) {
      findings.push(composeCertificationFinding(
        'CERT_DETERMINISM_MAINTENANCE_RANDOM',
        'Maintenance trace declares randomUsed: true.',
        'error',
        'determinism',
        'maintenanceArtifact.maintenanceTrace',
        'All traces must declare randomUsed: false.',
      ));
    }
    if (input.maintenanceArtifact.maintenanceTrace.timeDependency !== false) {
      findings.push(composeCertificationFinding(
        'CERT_DETERMINISM_MAINTENANCE_TIME',
        'Maintenance trace declares timeDependency: true.',
        'error',
        'determinism',
        'maintenanceArtifact.maintenanceTrace',
        'All traces must declare timeDependency: false.',
      ));
    }
  }

  return findings;
}

/**
 * Evaluates architectural boundary.
 */
function _evaluateArchitecturalBoundary(
  input: ResearchCompositionCertificationInput,
): readonly ResearchCompositionFinding[] {
  const findings: ResearchCompositionFinding[] = [];

  // Check for forbidden fields
  const forbiddenFields = ['execute', 'run', 'simulate', 'callback', 'handler', 'runtime', 'sandbox', 'code', 'script'];

  for (const field of forbiddenFields) {
    if (field in input) {
      findings.push(composeCertificationFinding(
        'CERT_ARCHITECTURAL_VIOLATION',
        `Input contains forbidden field: "${field}".`,
        'error',
        'architectural_boundary',
        'input',
        'Research composition must not contain executable behavior.',
      ));
    }
  }

  return findings;
}

/**
 * Evaluates validation integrity.
 */
function _evaluateValidationIntegrity(
  input: ResearchCompositionCertificationInput,
): readonly ResearchCompositionFinding[] {
  const findings: ResearchCompositionFinding[] = [];

  // Check evidence validation
  if (input.evidenceArtifact && input.evidenceArtifact.evidenceTrace) {
    const invalidCount = input.evidenceArtifact.evidenceTrace.invalidCount;
    if (invalidCount > 0) {
      findings.push(composeCertificationFinding(
        'CERT_VALIDATION_EVIDENCE_INVALID',
        `Evidence trace has ${invalidCount} invalid entries.`,
        'error',
        'validation_integrity',
        'evidenceArtifact.evidenceTrace',
        'All evidence entries should be valid.',
      ));
    }
  }

  // Check lineage validation
  if (input.lineageArtifact && input.lineageArtifact.lineageTrace) {
    const invalidCount = input.lineageArtifact.lineageTrace.invalidCount;
    if (invalidCount > 0) {
      findings.push(composeCertificationFinding(
        'CERT_VALIDATION_LINEAGE_INVALID',
        `Lineage trace has ${invalidCount} invalid entries.`,
        'error',
        'validation_integrity',
        'lineageArtifact.lineageTrace',
        'All lineage entries should be valid.',
      ));
    }
  }

  // Check comparison validation
  if (input.comparisonArtifact && input.comparisonArtifact.comparisonTrace) {
    const invalidCount = input.comparisonArtifact.comparisonTrace.invalidCount;
    if (invalidCount > 0) {
      findings.push(composeCertificationFinding(
        'CERT_VALIDATION_COMPARISON_INVALID',
        `Comparison trace has ${invalidCount} invalid entries.`,
        'error',
        'validation_integrity',
        'comparisonArtifact.comparisonTrace',
        'All comparison entries should be valid.',
      ));
    }
  }

  // Check timeline validation
  if (input.timelineArtifact && input.timelineArtifact.timelineTrace) {
    const invalidCount = input.timelineArtifact.timelineTrace.invalidCount;
    if (invalidCount > 0) {
      findings.push(composeCertificationFinding(
        'CERT_VALIDATION_TIMELINE_INVALID',
        `Timeline trace has ${invalidCount} invalid entries.`,
        'error',
        'validation_integrity',
        'timelineArtifact.timelineTrace',
        'All timeline entries should be valid.',
      ));
    }
  }

  // Check benchmark validation
  if (input.benchmarkArtifact && input.benchmarkArtifact.benchmarkTrace) {
    const invalidCount = input.benchmarkArtifact.benchmarkTrace.invalidCount;
    if (invalidCount > 0) {
      findings.push(composeCertificationFinding(
        'CERT_VALIDATION_BENCHMARK_INVALID',
        `Benchmark trace has ${invalidCount} invalid entries.`,
        'error',
        'validation_integrity',
        'benchmarkArtifact.benchmarkTrace',
        'All benchmark entries should be valid.',
      ));
    }
  }

  // Check dataset validation
  if (input.datasetArtifact && input.datasetArtifact.datasetTrace) {
    const invalidCount = input.datasetArtifact.datasetTrace.invalidCount;
    if (invalidCount > 0) {
      findings.push(composeCertificationFinding(
        'CERT_VALIDATION_DATASET_INVALID',
        `Dataset trace has ${invalidCount} invalid entries.`,
        'error',
        'validation_integrity',
        'datasetArtifact.datasetTrace',
        'All dataset entries should be valid.',
      ));
    }
  }

  // Check industry validation
  if (input.industryArtifact && input.industryArtifact.industryTrace) {
    const invalidCount = input.industryArtifact.industryTrace.invalidCount;
    if (invalidCount > 0) {
      findings.push(composeCertificationFinding(
        'CERT_VALIDATION_INDUSTRY_INVALID',
        `Industry trace has ${invalidCount} invalid entries.`,
        'error',
        'validation_integrity',
        'industryArtifact.industryTrace',
        'All industry entries should be valid.',
      ));
    }
  }

  // Check evolution validation
  if (input.evolutionArtifact && input.evolutionArtifact.evolutionTrace) {
    const invalidCount = input.evolutionArtifact.evolutionTrace.invalidCount;
    if (invalidCount > 0) {
      findings.push(composeCertificationFinding(
        'CERT_VALIDATION_EVOLUTION_INVALID',
        `Evolution trace has ${invalidCount} invalid entries.`,
        'error',
        'validation_integrity',
        'evolutionArtifact.evolutionTrace',
        'All evolution entries should be valid.',
      ));
    }
  }

  // Check reading path validation
  if (input.readingPathArtifact && input.readingPathArtifact.readingPathTrace) {
    const invalidCount = input.readingPathArtifact.readingPathTrace.invalidCount;
    if (invalidCount > 0) {
      findings.push(composeCertificationFinding(
        'CERT_VALIDATION_READING_PATH_INVALID',
        `Reading path trace has ${invalidCount} invalid entries.`,
        'error',
        'validation_integrity',
        'readingPathArtifact.readingPathTrace',
        'All reading path entries should be valid.',
      ));
    }
  }

  // Check laboratory validation
  if (input.laboratoryArtifact && input.laboratoryArtifact.laboratoryTrace) {
    const invalidCount = input.laboratoryArtifact.laboratoryTrace.invalidCount;
    if (invalidCount > 0) {
      findings.push(composeCertificationFinding(
        'CERT_VALIDATION_LABORATORY_INVALID',
        `Laboratory trace has ${invalidCount} invalid entries.`,
        'error',
        'validation_integrity',
        'laboratoryArtifact.laboratoryTrace',
        'All laboratory entries should be valid.',
      ));
    }
  }

  return findings;
}

/**
 * Evaluates documentation completeness.
 */
function _evaluateDocumentationCompleteness(
  input: ResearchCompositionCertificationInput,
): readonly ResearchCompositionFinding[] {
  const findings: ResearchCompositionFinding[] = [];

  // Check if concept label is provided
  if (!input.conceptLabel || input.conceptLabel.trim() === '') {
    findings.push(composeCertificationFinding(
      'CERT_DOCUMENTATION_MISSING_LABEL',
      'Concept label is missing.',
      'warning',
      'documentation_completeness',
      'input.conceptLabel',
      'Concept label should be provided for documentation completeness.',
    ));
  }

  // Check if concept ID is provided
  if (!input.conceptId || input.conceptId.trim() === '') {
    findings.push(composeCertificationFinding(
      'CERT_DOCUMENTATION_MISSING_ID',
      'Concept ID is missing.',
      'error',
      'documentation_completeness',
      'input.conceptId',
      'Concept ID is required.',
    ));
  }

  return findings;
}

// ---------------------------------------------------------------------------
// Certification Status Determination
// ---------------------------------------------------------------------------

/**
 * Determines certification status from findings.
 * Pure function. No side effects.
 */
function _determineCertificationStatus(
  findings: readonly ResearchCompositionFinding[],
): ResearchCompositionCertificationStatus {
  const errors = findings.filter((f) => f.severity === 'error');
  const warnings = findings.filter((f) => f.severity === 'warning');
  const recommendations = findings.filter((f) => f.severity === 'recommendation');

  if (errors.length === 0 && warnings.length === 0 && recommendations.length === 0) {
    return 'certified';
  }

  if (errors.length === 0 && (warnings.length > 0 || recommendations.length > 0)) {
    return 'certified_with_warnings';
  }

  if (errors.length > 0) {
    // Check for critical violations (determinism, architectural boundary)
    const criticalErrors = errors.filter((e) =>
      e.code.includes('DETERMINISM') ||
      e.code.includes('ARCHITECTURAL') ||
      e.code.includes('BLOCKED')
    );

    if (criticalErrors.length > 0) {
      return 'blocked';
    }

    return 'needs_revision';
  }

  return 'needs_revision';
}

// ---------------------------------------------------------------------------
// Quality Score Calculation
// ---------------------------------------------------------------------------

/**
 * Calculates quality score from findings.
 * Pure function. No side effects.
 */
function _calculateQualityScore(
  findings: readonly ResearchCompositionFinding[],
): number {
  let score = 100;

  for (const finding of findings) {
    switch (finding.severity) {
      case 'error':
        score -= 10;
        break;
      case 'warning':
        score -= 3;
        break;
      case 'recommendation':
        score -= 1;
        break;
    }
  }

  return Math.max(0, Math.min(100, score));
}

// ---------------------------------------------------------------------------
// Certification Status and Dimension Helpers
// ---------------------------------------------------------------------------

/**
 * Checks if a certification status is supported (in canonical statuses).
 */
export function isSupportedCertificationStatus(status: string): status is ResearchCompositionCertificationStatus {
  return CANONICAL_CERTIFICATION_STATUSES.includes(status as ResearchCompositionCertificationStatus);
}

/**
 * Checks if a finding severity is supported (in canonical severities).
 */
export function isSupportedFindingSeverity(severity: string): severity is ResearchCompositionFindingSeverity {
  return CANONICAL_FINDING_SEVERITIES.includes(severity as ResearchCompositionFindingSeverity);
}

/**
 * Checks if a quality dimension is supported (in canonical dimensions).
 */
export function isSupportedQualityDimension(dimension: string): dimension is ResearchCompositionQualityDimension {
  return CANONICAL_QUALITY_DIMENSIONS.includes(dimension as ResearchCompositionQualityDimension);
}

/**
 * Returns all canonical certification statuses.
 */
export function getCanonicalCertificationStatuses(): readonly ResearchCompositionCertificationStatus[] {
  return CANONICAL_CERTIFICATION_STATUSES;
}

/**
 * Returns all canonical finding severities.
 */
export function getCanonicalFindingSeverities(): readonly ResearchCompositionFindingSeverity[] {
  return CANONICAL_FINDING_SEVERITIES;
}

/**
 * Returns all canonical quality dimensions.
 */
export function getCanonicalQualityDimensions(): readonly ResearchCompositionQualityDimension[] {
  return CANONICAL_QUALITY_DIMENSIONS;
}

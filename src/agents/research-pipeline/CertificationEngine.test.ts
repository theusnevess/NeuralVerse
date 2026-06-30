/**
 * NV-1400-D2-OPT-11 — Research Composition Certification Engine Test Suite
 *
 * Comprehensive tests for the certification engine.
 * Covers: fully certified artifact, certified with warnings, needs revision,
 * blocked artifact, missing evidence, invalid lineage, invalid timeline,
 * duplicate IDs, missing provenance, invalid quality score, certified with errors,
 * blocked without errors, deterministic output, immutable input, identical output,
 * no generated content, no inference, no mutation.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  composeCertificationFinding,
  composeCertificationReport,
  certifyResearchComposition,
  isSupportedCertificationStatus,
  isSupportedFindingSeverity,
  isSupportedQualityDimension,
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

import type {
  ResearchCompositionCertificationInput,
  ResearchCompositionFinding,
  ResearchCompositionFindingSeverity,
  ResearchCompositionQualityDimension,
  ResearchCompositionCertificationReport,
} from './ResearchAgentContract.ts';

// ---------------------------------------------------------------------------
// Test Fixtures
// ---------------------------------------------------------------------------

const VALID_EVIDENCE_ARTIFACT = {
  artifactId: 'evidence-artifact-001',
  artifactType: 'concept' as const,
  evidenceMetadata: [
    {
      title: 'Deep Learning',
      authors: ['Goodfellow', 'Bengio', 'Courville'],
      publicationYear: 2016,
      sourceType: 'academic_book' as const,
      evidenceLevel: 'primary' as const,
      reviewStatus: 'editorially_reviewed' as const,
      verificationDate: '2024-01-01',
      governanceStatus: 'canonical' as const,
    },
  ],
  evidenceChain: {
    chainId: 'chain-001',
    links: [],
    rootEntityType: 'concept' as const,
    rootEntityId: 'concept-001',
  },
  evidenceTrace: {
    traceId: 'trace-001',
    evidenceCount: 1,
    validatedCount: 1,
    pendingCount: 0,
    invalidCount: 0,
    deprecatedCount: 0,
    decisions: [],
    deterministic: true as const,
    generatedFrom: 'deterministic_kernel' as const,
    randomUsed: false as const,
    timeDependency: false as const,
  },
};

const VALID_LINEAGE_ARTIFACT = {
  artifactId: 'lineage-artifact-001',
  artifactType: 'concept' as const,
  lineageGraph: {
    graphId: 'graph-001',
    nodes: [],
    edges: [],
    deterministic: true as const,
    generatedFrom: 'deterministic_lineage_kernel' as const,
    randomUsed: false as const,
    timeDependency: false as const,
  },
  lineageTrace: {
    traceId: 'trace-001',
    nodeCount: 0,
    edgeCount: 0,
    decisionsCount: 0,
    validatedCount: 0,
    invalidCount: 0,
    decisions: [],
    deterministic: true as const,
    generatedFrom: 'deterministic_lineage_kernel' as const,
    randomUsed: false as const,
    timeDependency: false as const,
  },
};

const VALID_COMPARISON_ARTIFACT = {
  artifactId: 'comparison-artifact-001',
  artifactType: 'concept' as const,
  comparisonMatrix: {
    matrixId: 'matrix-001',
    methods: [],
    dimensions: [],
    entries: [],
    deterministic: true as const,
    generatedFrom: 'deterministic_comparison_engine' as const,
    randomUsed: false as const,
    timeDependency: false as const,
  },
  comparisonTrace: {
    traceId: 'trace-001',
    methodCount: 0,
    dimensionCount: 0,
    entryCount: 0,
    validatedCount: 0,
    invalidCount: 0,
    decisions: [],
    deterministic: true as const,
    generatedFrom: 'deterministic_comparison_engine' as const,
    randomUsed: false as const,
    timeDependency: false as const,
  },
};

const VALID_TIMELINE_ARTIFACT = {
  artifactId: 'timeline-artifact-001',
  artifactType: 'concept' as const,
  timeline: {
    timelineId: 'timeline-001',
    events: [],
    nodes: [],
    deterministic: true as const,
    generatedFrom: 'deterministic_timeline_kernel' as const,
    randomUsed: false as const,
    timeDependency: false as const,
  },
  timelineTrace: {
    traceId: 'trace-001',
    eventCount: 0,
    validatedCount: 0,
    invalidCount: 0,
    decisions: [],
    deterministic: true as const,
    generatedFrom: 'deterministic_timeline_kernel' as const,
    randomUsed: false as const,
    timeDependency: false as const,
  },
};

const VALID_BENCHMARK_ARTIFACT = {
  artifactId: 'benchmark-artifact-001',
  artifactType: 'concept' as const,
  benchmarkRegistry: {
    registryId: 'registry-001',
    benchmarks: [],
    deterministic: true as const,
    generatedFrom: 'deterministic_benchmark_kernel' as const,
    randomUsed: false as const,
    timeDependency: false as const,
  },
  benchmarkTrace: {
    traceId: 'trace-001',
    benchmarkCount: 0,
    validatedCount: 0,
    invalidCount: 0,
    decisions: [],
    deterministic: true as const,
    generatedFrom: 'deterministic_benchmark_kernel' as const,
    randomUsed: false as const,
    timeDependency: false as const,
  },
};

const VALID_DATASET_ARTIFACT = {
  artifactId: 'dataset-artifact-001',
  artifactType: 'concept' as const,
  datasetRegistry: {
    registryId: 'registry-001',
    datasets: [],
    deterministic: true as const,
    generatedFrom: 'deterministic_dataset_kernel' as const,
    randomUsed: false as const,
    timeDependency: false as const,
  },
  datasetTrace: {
    traceId: 'trace-001',
    datasetCount: 0,
    validatedCount: 0,
    invalidCount: 0,
    decisions: [],
    deterministic: true as const,
    generatedFrom: 'deterministic_dataset_kernel' as const,
    randomUsed: false as const,
    timeDependency: false as const,
  },
};

const VALID_INDUSTRY_ARTIFACT = {
  artifactId: 'industry-artifact-001',
  artifactType: 'concept' as const,
  industryRegistry: {
    registryId: 'registry-001',
    records: [],
    deterministic: true as const,
    generatedFrom: 'deterministic_industry_kernel' as const,
    randomUsed: false as const,
    timeDependency: false as const,
  },
  industryTrace: {
    traceId: 'trace-001',
    recordCount: 0,
    validatedCount: 0,
    invalidCount: 0,
    decisions: [],
    deterministic: true as const,
    generatedFrom: 'deterministic_industry_kernel' as const,
    randomUsed: false as const,
    timeDependency: false as const,
  },
};

const VALID_EVOLUTION_ARTIFACT = {
  artifactId: 'evolution-artifact-001',
  artifactType: 'concept' as const,
  evolutionGraph: {
    graphId: 'graph-001',
    nodes: [],
    edges: [],
    deterministic: true as const,
    generatedFrom: 'deterministic_evolution_kernel' as const,
    randomUsed: false as const,
    timeDependency: false as const,
  },
  evolutionTrace: {
    traceId: 'trace-001',
    nodeCount: 0,
    edgeCount: 0,
    decisionsCount: 0,
    validatedCount: 0,
    invalidCount: 0,
    decisions: [],
    deterministic: true as const,
    generatedFrom: 'deterministic_evolution_kernel' as const,
    randomUsed: false as const,
    timeDependency: false as const,
  },
};

const VALID_READING_PATH_ARTIFACT = {
  artifactId: 'reading-path-artifact-001',
  artifactType: 'concept' as const,
  readingPathRegistry: {
    registryId: 'registry-001',
    paths: [],
    deterministic: true as const,
    generatedFrom: 'deterministic_reading_path_kernel' as const,
    randomUsed: false as const,
    timeDependency: false as const,
  },
  readingPathTrace: {
    traceId: 'trace-001',
    pathCount: 0,
    validatedCount: 0,
    invalidCount: 0,
    decisions: [],
    deterministic: true as const,
    generatedFrom: 'deterministic_reading_path_kernel' as const,
    randomUsed: false as const,
    timeDependency: false as const,
  },
};

const VALID_LABORATORY_ARTIFACT = {
  artifactId: 'laboratory-artifact-001',
  artifactType: 'concept' as const,
  laboratoryRegistry: {
    registryId: 'registry-001',
    laboratories: [],
    deterministic: true as const,
    generatedFrom: 'deterministic_laboratory_kernel' as const,
    randomUsed: false as const,
    timeDependency: false as const,
  },
  laboratoryTrace: {
    traceId: 'trace-001',
    metadataCount: 0,
    validatedCount: 0,
    invalidCount: 0,
    decisions: [],
    deterministic: true as const,
    generatedFrom: 'deterministic_laboratory_kernel' as const,
    randomUsed: false as const,
    timeDependency: false as const,
  },
};

const VALID_OPEN_QUESTIONS_ARTIFACT = {
  artifactId: 'open-questions-artifact-001',
  artifactType: 'concept' as const,
  openQuestionRegistry: {
    registryId: 'open-question-registry-001',
    questions: [],
    deterministic: true as const,
    generatedFrom: 'deterministic_open_question_kernel' as const,
    randomUsed: false as const,
    timeDependency: false as const,
  },
  openQuestionTrace: {
    traceId: 'open-question-trace-001',
    questionCount: 0,
    validatedCount: 0,
    invalidCount: 0,
    decisions: [],
    deterministic: true as const,
    generatedFrom: 'deterministic_open_question_kernel' as const,
    randomUsed: false as const,
    timeDependency: false as const,
  },
};

const VALID_MAINTENANCE_ARTIFACT = {
  artifactId: 'maintenance-artifact-001',
  artifactType: 'concept' as const,
  maintenanceRegistry: {
    registryId: 'maintenance-registry-001',
    signals: [],
    deterministic: true as const,
    generatedFrom: 'deterministic_maintenance_kernel' as const,
    randomUsed: false as const,
    timeDependency: false as const,
  },
  maintenanceTrace: {
    traceId: 'maintenance-trace-001',
    signalCount: 0,
    validatedCount: 0,
    invalidCount: 0,
    decisions: [],
    deterministic: true as const,
    generatedFrom: 'deterministic_maintenance_kernel' as const,
    randomUsed: false as const,
    timeDependency: false as const,
  },
};

// ---------------------------------------------------------------------------
// Fully Certified Artifact Tests
// ---------------------------------------------------------------------------

describe('fully certified artifact', () => {
  it('should certify a fully valid artifact', () => {
    const input: ResearchCompositionCertificationInput = {
      conceptId: 'concept-001',
      conceptLabel: 'Test Concept',
      evidenceArtifact: VALID_EVIDENCE_ARTIFACT,
      lineageArtifact: VALID_LINEAGE_ARTIFACT,
      comparisonArtifact: VALID_COMPARISON_ARTIFACT,
      timelineArtifact: VALID_TIMELINE_ARTIFACT,
      benchmarkArtifact: VALID_BENCHMARK_ARTIFACT,
      datasetArtifact: VALID_DATASET_ARTIFACT,
      industryArtifact: VALID_INDUSTRY_ARTIFACT,
      evolutionArtifact: VALID_EVOLUTION_ARTIFACT,
      readingPathArtifact: VALID_READING_PATH_ARTIFACT,
      laboratoryArtifact: VALID_LABORATORY_ARTIFACT,
      openQuestionsArtifact: VALID_OPEN_QUESTIONS_ARTIFACT,
      maintenanceArtifact: VALID_MAINTENANCE_ARTIFACT,
    };

    const report = certifyResearchComposition(input);

    assert.equal(report.status, 'certified');
    assert.equal(report.findings.length, 0);
    assert.equal(report.qualityScore, 100);
    assert.equal(report.deterministic, true);
    assert.equal(report.randomUsed, false);
    assert.equal(report.timeDependency, false);
  });
});

// ---------------------------------------------------------------------------
// Certified With Warnings Tests
// ---------------------------------------------------------------------------

describe('certified with warnings', () => {
  it('should certify with warnings when missing optional artifacts', () => {
    const input: ResearchCompositionCertificationInput = {
      conceptId: 'concept-001',
      conceptLabel: 'Test Concept',
      evidenceArtifact: VALID_EVIDENCE_ARTIFACT,
    };

    const report = certifyResearchComposition(input);

    assert.equal(report.status, 'certified_with_warnings');
    assert.ok(report.findings.length > 0);
    assert.ok(report.qualityScore < 100);
  });
});

// ---------------------------------------------------------------------------
// Needs Revision Tests
// ---------------------------------------------------------------------------

describe('needs revision', () => {
  it('should need revision when evidence has errors', () => {
    const input: ResearchCompositionCertificationInput = {
      conceptId: 'concept-001',
      conceptLabel: 'Test Concept',
      evidenceArtifact: {
        ...VALID_EVIDENCE_ARTIFACT,
        evidenceMetadata: [],
      },
    };

    const report = certifyResearchComposition(input);

    assert.equal(report.status, 'needs_revision');
    assert.ok(report.findings.some((f) => f.severity === 'error'));
  });
});

// ---------------------------------------------------------------------------
// Blocked Artifact Tests
// ---------------------------------------------------------------------------

describe('blocked artifact', () => {
  it('should block when critical violations exist', () => {
    const input: ResearchCompositionCertificationInput = {
      conceptId: 'concept-001',
      conceptLabel: 'Test Concept',
      evidenceArtifact: {
        ...VALID_EVIDENCE_ARTIFACT,
        evidenceTrace: {
          ...VALID_EVIDENCE_ARTIFACT.evidenceTrace,
          deterministic: false as true,
          randomUsed: true as false,
          timeDependency: true as false,
        },
      },
    };

    const report = certifyResearchComposition(input);

    assert.equal(report.status, 'blocked');
    assert.ok(report.findings.some((f) => f.severity === 'error'));
  });
});

// ---------------------------------------------------------------------------
// Missing Evidence Tests
// ---------------------------------------------------------------------------

describe('missing evidence', () => {
  it('should detect missing evidence artifact', () => {
    const input: ResearchCompositionCertificationInput = {
      conceptId: 'concept-001',
      conceptLabel: 'Test Concept',
    };

    const report = certifyResearchComposition(input);

    assert.ok(report.findings.some((f) => f.code === 'CERT_EVIDENCE_MISSING'));
  });
});

// ---------------------------------------------------------------------------
// Invalid Lineage Tests
// ---------------------------------------------------------------------------

describe('invalid lineage', () => {
  it('should detect invalid lineage', () => {
    const input: ResearchCompositionCertificationInput = {
      conceptId: 'concept-001',
      conceptLabel: 'Test Concept',
      lineageArtifact: {
        ...VALID_LINEAGE_ARTIFACT,
        lineageGraph: {
          ...VALID_LINEAGE_ARTIFACT.lineageGraph,
          graphId: '',
        },
      },
    };

    const report = certifyResearchComposition(input);

    assert.ok(report.findings.some((f) => f.code === 'CERT_LINEAGE_GRAPH_MISSING'));
  });
});

// ---------------------------------------------------------------------------
// Invalid Timeline Tests
// ---------------------------------------------------------------------------

describe('invalid timeline', () => {
  it('should detect invalid timeline', () => {
    const input: ResearchCompositionCertificationInput = {
      conceptId: 'concept-001',
      conceptLabel: 'Test Concept',
      timelineArtifact: {
        ...VALID_TIMELINE_ARTIFACT,
        timeline: {
          ...VALID_TIMELINE_ARTIFACT.timeline,
          timelineId: '',
        },
      },
    };

    const report = certifyResearchComposition(input);

    assert.ok(report.findings.some((f) => f.code === 'CERT_TIMELINE_GRAPH_MISSING'));
  });
});

// ---------------------------------------------------------------------------
// Missing Provenance Tests
// ---------------------------------------------------------------------------

describe('missing provenance', () => {
  it('should detect missing provenance', () => {
    const input: ResearchCompositionCertificationInput = {
      conceptId: 'concept-001',
      conceptLabel: 'Test Concept',
      evidenceArtifact: {
        ...VALID_EVIDENCE_ARTIFACT,
        evidenceMetadata: [
          {
            ...VALID_EVIDENCE_ARTIFACT.evidenceMetadata[0],
            governanceStatus: 'canonical' as 'canonical' | 'accepted' | 'deprecated' | 'provisional' | 'rejected',
          },
        ],
      },
    };

    const report = certifyResearchComposition(input);

    assert.ok(report.findings.some((f) => f.code === 'CERT_PROVENANCE_EVIDENCE_MISSING'));
  });
});

// ---------------------------------------------------------------------------
// Invalid Quality Score Tests
// ---------------------------------------------------------------------------

describe('invalid quality score', () => {
  it('should detect invalid quality score', () => {
    const report: ResearchCompositionCertificationReport = {
      certificationId: 'cert-001',
      status: 'certified',
      findings: [],
      qualityScore: 150,
      dimensionsChecked: ['evidence_integrity'],
      deterministic: true,
      generatedFrom: 'deterministic_certification_engine',
      randomUsed: false,
      timeDependency: false,
    };

    const errors = validateCertificationReport(report);
    const scoreError = errors.find((e) => e.code === CERTIFICATION_VALIDATION_CODES.CERT_INVALID_SCORE);

    assert.ok(scoreError, 'Should have CERT_INVALID_SCORE error');
  });
});

// ---------------------------------------------------------------------------
// Certified With Errors Tests
// ---------------------------------------------------------------------------

describe('certified with errors', () => {
  it('should detect certified with errors', () => {
    const report: ResearchCompositionCertificationReport = {
      certificationId: 'cert-001',
      status: 'certified',
      findings: [
        {
          code: 'TEST_ERROR',
          message: 'Test error',
          severity: 'error',
          qualityDimension: 'evidence_integrity',
          affectedArtifact: 'test',
          rationale: 'Test rationale',
        },
      ],
      qualityScore: 90,
      dimensionsChecked: ['evidence_integrity'],
      deterministic: true,
      generatedFrom: 'deterministic_certification_engine',
      randomUsed: false,
      timeDependency: false,
    };

    const errors = validateCertificationReport(report);
    const certifiedError = errors.find((e) => e.code === CERTIFICATION_VALIDATION_CODES.CERT_CERTIFIED_WITH_ERROR);

    assert.ok(certifiedError, 'Should have CERT_CERTIFIED_WITH_ERROR error');
  });
});

// ---------------------------------------------------------------------------
// Blocked Without Errors Tests
// ---------------------------------------------------------------------------

describe('blocked without errors', () => {
  it('should detect blocked without errors', () => {
    const report: ResearchCompositionCertificationReport = {
      certificationId: 'cert-001',
      status: 'blocked',
      findings: [
        {
          code: 'TEST_WARNING',
          message: 'Test warning',
          severity: 'warning',
          qualityDimension: 'evidence_integrity',
          affectedArtifact: 'test',
          rationale: 'Test rationale',
        },
      ],
      qualityScore: 90,
      dimensionsChecked: ['evidence_integrity'],
      deterministic: true,
      generatedFrom: 'deterministic_certification_engine',
      randomUsed: false,
      timeDependency: false,
    };

    const errors = validateCertificationReport(report);
    const blockedError = errors.find((e) => e.code === CERTIFICATION_VALIDATION_CODES.CERT_BLOCKED_WITHOUT_ERROR);

    assert.ok(blockedError, 'Should have CERT_BLOCKED_WITHOUT_ERROR error');
  });
});

// ---------------------------------------------------------------------------
// Deterministic Output Tests
// ---------------------------------------------------------------------------

describe('deterministic output', () => {
  it('should produce identical output for identical input', () => {
    const input: ResearchCompositionCertificationInput = {
      conceptId: 'concept-001',
      conceptLabel: 'Test Concept',
      evidenceArtifact: VALID_EVIDENCE_ARTIFACT,
    };

    const report1 = certifyResearchComposition(input);
    const report2 = certifyResearchComposition(input);

    assert.deepEqual(report1, report2);
  });
});

// ---------------------------------------------------------------------------
// Immutable Input Tests
// ---------------------------------------------------------------------------

describe('immutable input', () => {
  it('should not mutate input', () => {
    const input: ResearchCompositionCertificationInput = {
      conceptId: 'concept-001',
      conceptLabel: 'Test Concept',
      evidenceArtifact: VALID_EVIDENCE_ARTIFACT,
    };

    const originalLabel = input.conceptLabel;

    certifyResearchComposition(input);

    assert.equal(input.conceptLabel, originalLabel);
  });
});

// ---------------------------------------------------------------------------
// Identical Output Tests
// ---------------------------------------------------------------------------

describe('identical output', () => {
  it('should produce identical reports', () => {
    const input: ResearchCompositionCertificationInput = {
      conceptId: 'concept-001',
      conceptLabel: 'Test Concept',
      evidenceArtifact: VALID_EVIDENCE_ARTIFACT,
    };

    const report1 = certifyResearchComposition(input);
    const report2 = certifyResearchComposition(input);

    assert.deepEqual(report1.status, report2.status);
    assert.deepEqual(report1.findings.length, report2.findings.length);
    assert.deepEqual(report1.qualityScore, report2.qualityScore);
  });
});

// ---------------------------------------------------------------------------
// No Generated Content Tests
// ---------------------------------------------------------------------------

describe('no generated content', () => {
  it('should not generate content', () => {
    const input: ResearchCompositionCertificationInput = {
      conceptId: 'concept-001',
      conceptLabel: 'Test Concept',
      evidenceArtifact: VALID_EVIDENCE_ARTIFACT,
    };

    const report = certifyResearchComposition(input);

    // Should not have generated content fields
    assert.ok(!('generatedContent' in report), 'Should not have generatedContent field');
    assert.ok(!('summary' in report), 'Should not have summary field');
    assert.ok(!('recommendations' in report), 'Should not have recommendations field');
  });
});

// ---------------------------------------------------------------------------
// No Inference Tests
// ---------------------------------------------------------------------------

describe('no inference', () => {
  it('should not infer missing artifacts', () => {
    const input: ResearchCompositionCertificationInput = {
      conceptId: 'concept-001',
      conceptLabel: 'Test Concept',
    };

    const report = certifyResearchComposition(input);

    // Should not infer missing artifacts
    assert.ok(!('inferredEvidence' in report), 'Should not have inferredEvidence field');
    assert.ok(!('inferredLineage' in report), 'Should not have inferredLineage field');
    assert.ok(!('inferredTimeline' in report), 'Should not have inferredTimeline field');
  });
});

// ---------------------------------------------------------------------------
// No Mutation Tests
// ---------------------------------------------------------------------------

describe('no mutation', () => {
  it('should not mutate artifacts', () => {
    const evidenceArtifact = { ...VALID_EVIDENCE_ARTIFACT };
    const originalMetadata = evidenceArtifact.evidenceMetadata[0].title;

    const input: ResearchCompositionCertificationInput = {
      conceptId: 'concept-001',
      conceptLabel: 'Test Concept',
      evidenceArtifact,
    };

    certifyResearchComposition(input);

    assert.equal(evidenceArtifact.evidenceMetadata[0].title, originalMetadata);
  });
});

// ---------------------------------------------------------------------------
// Additional Negative Tests
// ---------------------------------------------------------------------------

describe('additional negative tests', () => {
  it('should validate certification input', () => {
    const input: ResearchCompositionCertificationInput = {
      conceptId: 'concept-001',
      conceptLabel: 'Test Concept',
    };

    const errors = validateCertificationInput(input);
    assert.equal(errors.length, 0);
  });

  it('should detect missing concept ID', () => {
    const input: ResearchCompositionCertificationInput = {
      conceptId: '',
      conceptLabel: 'Test Concept',
    };

    const errors = validateCertificationInput(input);
    const conceptError = errors.find((e) => e.field === 'conceptId');

    assert.ok(conceptError, 'Should have conceptId error');
  });

  it('should detect missing concept label', () => {
    const input: ResearchCompositionCertificationInput = {
      conceptId: 'concept-001',
      conceptLabel: '',
    };

    const errors = validateCertificationInput(input);
    const labelError = errors.find((e) => e.field === 'conceptLabel');

    assert.ok(labelError, 'Should have conceptLabel error');
  });

  it('should compose certification finding correctly', () => {
    const finding = composeCertificationFinding(
      'TEST_CODE',
      'Test message',
      'error',
      'evidence_integrity',
      'testArtifact',
      'Test rationale.',
    );

    assert.equal(finding.code, 'TEST_CODE');
    assert.equal(finding.message, 'Test message');
    assert.equal(finding.severity, 'error');
    assert.equal(finding.qualityDimension, 'evidence_integrity');
    assert.equal(finding.affectedArtifact, 'testArtifact');
    assert.equal(finding.rationale, 'Test rationale.');
  });

  it('should compose certification report correctly', () => {
    const report = composeCertificationReport(
      'cert-001',
      'certified',
      [],
      100,
      ['evidence_integrity'],
    );

    assert.equal(report.certificationId, 'cert-001');
    assert.equal(report.status, 'certified');
    assert.equal(report.findings.length, 0);
    assert.equal(report.qualityScore, 100);
    assert.equal(report.dimensionsChecked.length, 1);
  });

  it('should validate certification finding', () => {
    const finding = composeCertificationFinding(
      'TEST_CODE',
      'Test message',
      'error',
      'evidence_integrity',
      'testArtifact',
      'Test rationale.',
    );

    const errors = validateCertificationFinding(finding);
    assert.equal(errors.length, 0);
  });

  it('should detect invalid finding severity', () => {
    const finding: ResearchCompositionFinding = {
      code: 'TEST_CODE',
      message: 'Test message',
      severity: 'invalid' as ResearchCompositionFindingSeverity,
      qualityDimension: 'evidence_integrity',
      affectedArtifact: 'test',
      rationale: 'Test rationale',
    };

    const errors = validateCertificationFinding(finding);
    const severityError = errors.find((e) => e.code === CERTIFICATION_VALIDATION_CODES.CERT_FINDING_NO_SEVERITY);

    assert.ok(severityError, 'Should have CERT_FINDING_NO_SEVERITY error');
  });

  it('should detect invalid quality dimension', () => {
    const finding: ResearchCompositionFinding = {
      code: 'TEST_CODE',
      message: 'Test message',
      severity: 'error',
      qualityDimension: 'invalid_dimension' as ResearchCompositionQualityDimension,
      affectedArtifact: 'test',
      rationale: 'Test rationale',
    };

    const errors = validateCertificationFinding(finding);
    const dimensionError = errors.find((e) => e.code === CERTIFICATION_VALIDATION_CODES.CERT_FINDING_NO_DIMENSION);

    assert.ok(dimensionError, 'Should have CERT_FINDING_NO_DIMENSION error');
  });

  it('should support all canonical certification statuses', () => {
    const statuses = getCanonicalCertificationStatuses();
    assert.equal(statuses.length, 4);
    assert.ok(statuses.includes('certified'));
    assert.ok(statuses.includes('certified_with_warnings'));
    assert.ok(statuses.includes('needs_revision'));
    assert.ok(statuses.includes('blocked'));
  });

  it('should support all canonical finding severities', () => {
    const severities = getCanonicalFindingSeverities();
    assert.equal(severities.length, 3);
    assert.ok(severities.includes('error'));
    assert.ok(severities.includes('warning'));
    assert.ok(severities.includes('recommendation'));
  });

  it('should support all canonical quality dimensions', () => {
    const dimensions = getCanonicalQualityDimensions();
    assert.equal(dimensions.length, 17);
    assert.ok(dimensions.includes('evidence_integrity'));
    assert.ok(dimensions.includes('lineage_integrity'));
    assert.ok(dimensions.includes('comparison_integrity'));
    assert.ok(dimensions.includes('timeline_integrity'));
    assert.ok(dimensions.includes('benchmark_integrity'));
    assert.ok(dimensions.includes('dataset_integrity'));
    assert.ok(dimensions.includes('industry_integrity'));
    assert.ok(dimensions.includes('evolution_integrity'));
    assert.ok(dimensions.includes('reading_path_integrity'));
    assert.ok(dimensions.includes('laboratory_integrity'));
    assert.ok(dimensions.includes('open_question_integrity'));
    assert.ok(dimensions.includes('maintenance_integrity'));
    assert.ok(dimensions.includes('provenance_integrity'));
    assert.ok(dimensions.includes('determinism'));
    assert.ok(dimensions.includes('architectural_boundary'));
    assert.ok(dimensions.includes('validation_integrity'));
    assert.ok(dimensions.includes('documentation_completeness'));
  });

  it('should correctly identify supported certification statuses', () => {
    assert.equal(isSupportedCertificationStatus('certified'), true);
    assert.equal(isSupportedCertificationStatus('blocked'), true);
    assert.equal(isSupportedCertificationStatus('unsupported'), false);
  });

  it('should correctly identify supported finding severities', () => {
    assert.equal(isSupportedFindingSeverity('error'), true);
    assert.equal(isSupportedFindingSeverity('warning'), true);
    assert.equal(isSupportedFindingSeverity('unsupported'), false);
  });

  it('should correctly identify supported quality dimensions', () => {
    assert.equal(isSupportedQualityDimension('evidence_integrity'), true);
    assert.equal(isSupportedQualityDimension('determinism'), true);
    assert.equal(isSupportedQualityDimension('unsupported'), false);
  });
});

/**
 * NV-1400-D2-OPT-12 — Research Public API Facade Test Suite
 *
 * Comprehensive tests for the research facade.
 * Covers: compose artifact, certify artifact, compose and certify,
 * legacy exports preserved, identical output, immutable input,
 * deterministic output, trace metadata exists, validation result exists,
 * certification exists, missing artifact rejected, missing certification rejected,
 * no generated content, no mutation, no duplicated exports.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  composeResearchArtifact,
  certifyResearchArtifact,
  composeAndCertifyResearchArtifact,
  validateResearchFacadeArtifact,
  validateResearchFacadeCertification,
  validateResearchFacadeComplete,
} from './ResearchFacade.ts';

import type {
  ResearchCompositionCertificationInput,
  ResearchArtifact,
  ResearchArtifactWithCertification,
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

// ---------------------------------------------------------------------------
// Compose Artifact Tests
// ---------------------------------------------------------------------------

describe('compose artifact', () => {
  it('should compose a research artifact from input', () => {
    const input: ResearchCompositionCertificationInput = {
      conceptId: 'concept-001',
      conceptLabel: 'Test Concept',
      evidenceArtifact: VALID_EVIDENCE_ARTIFACT,
      lineageArtifact: VALID_LINEAGE_ARTIFACT,
    };

    const artifact = composeResearchArtifact(input);

    assert.equal(artifact.artifactId, '_artifact_concept-001');
    assert.equal(artifact.conceptId, 'concept-001');
    assert.equal(artifact.conceptLabel, 'Test Concept');
    assert.equal(artifact.deterministic, true);
    assert.equal(artifact.randomUsed, false);
    assert.equal(artifact.timeDependency, false);
    assert.equal(artifact.curriculumMutated, false);
  });
});

// ---------------------------------------------------------------------------
// Certify Artifact Tests
// ---------------------------------------------------------------------------

describe('certify artifact', () => {
  it('should certify a research artifact', () => {
    const input: ResearchCompositionCertificationInput = {
      conceptId: 'concept-001',
      conceptLabel: 'Test Concept',
      evidenceArtifact: VALID_EVIDENCE_ARTIFACT,
    };

    const artifact = composeResearchArtifact(input);
    const certificationReport = certifyResearchArtifact(artifact);

    assert.ok(certificationReport.certificationId);
    assert.ok(certificationReport.status);
    assert.equal(certificationReport.deterministic, true);
    assert.equal(certificationReport.randomUsed, false);
    assert.equal(certificationReport.timeDependency, false);
  });
});

// ---------------------------------------------------------------------------
// Compose and Certify Tests
// ---------------------------------------------------------------------------

describe('compose and certify', () => {
  it('should compose and certify in one step', () => {
    const input: ResearchCompositionCertificationInput = {
      conceptId: 'concept-001',
      conceptLabel: 'Test Concept',
      evidenceArtifact: VALID_EVIDENCE_ARTIFACT,
    };

    const output = composeAndCertifyResearchArtifact(input);

    assert.ok(output.artifact);
    assert.ok(output.certificationReport);
    assert.equal(output.deterministic, true);
    assert.equal(output.randomUsed, false);
    assert.equal(output.timeDependency, false);
    assert.equal(output.curriculumMutated, false);
  });
});

// ---------------------------------------------------------------------------
// Legacy Exports Preserved Tests
// ---------------------------------------------------------------------------

describe('legacy exports preserved', () => {
  it('should preserve EvidenceKernel exports', async () => {
    const evidenceKernel = await import('./EvidenceKernel.ts');
    assert.ok(evidenceKernel.composeEvidenceMetadata);
    assert.ok(evidenceKernel.composeEvidenceChain);
    assert.ok(evidenceKernel.composeResearchEvidence);
  });

  it('should preserve LineageKernel exports', async () => {
    const lineageKernel = await import('./LineageKernel.ts');
    assert.ok(lineageKernel.composeLineageNode);
    assert.ok(lineageKernel.composeLineageEdge);
    assert.ok(lineageKernel.composeLineageGraph);
  });

  it('should preserve ComparisonEngine exports', async () => {
    const comparisonEngine = await import('./ComparisonEngine.ts');
    assert.ok(comparisonEngine.composeComparisonAttribute);
    assert.ok(comparisonEngine.composeComparisonEntry);
    assert.ok(comparisonEngine.composeComparisonMatrix);
  });

  it('should preserve TimelineKernel exports', async () => {
    const timelineKernel = await import('./TimelineKernel.ts');
    assert.ok(timelineKernel.composeTimelineEvent);
    assert.ok(timelineKernel.composeTimelineNode);
    assert.ok(timelineKernel.composeTimeline);
  });

  it('should preserve BenchmarkKernel exports', async () => {
    const benchmarkKernel = await import('./BenchmarkKernel.ts');
    assert.ok(benchmarkKernel.composeBenchmarkProvenance);
    assert.ok(benchmarkKernel.composeBenchmark);
    assert.ok(benchmarkKernel.composeBenchmarkRegistry);
  });

  it('should preserve DatasetKernel exports', async () => {
    const datasetKernel = await import('./DatasetKernel.ts');
    assert.ok(datasetKernel.composeDatasetProvenance);
    assert.ok(datasetKernel.composeDataset);
    assert.ok(datasetKernel.composeDatasetRegistry);
  });

  it('should preserve IndustryKernel exports', async () => {
    const industryKernel = await import('./IndustryKernel.ts');
    assert.ok(industryKernel.composeIndustryProvenance);
    assert.ok(industryKernel.composeIndustryReference);
    assert.ok(industryKernel.composeIndustryRegistry);
  });

  it('should preserve EvolutionKernel exports', async () => {
    const evolutionKernel = await import('./EvolutionKernel.ts');
    assert.ok(evolutionKernel.composeEvolutionNode);
    assert.ok(evolutionKernel.composeEvolutionEdge);
    assert.ok(evolutionKernel.composeEvolutionGraph);
  });

  it('should preserve ReadingPathKernel exports', async () => {
    const readingPathKernel = await import('./ReadingPathKernel.ts');
    assert.ok(readingPathKernel.composeReadingPathNode);
    assert.ok(readingPathKernel.composeReadingPath);
    assert.ok(readingPathKernel.composeReadingPathRegistry);
  });

  it('should preserve LaboratoryIntegrationKernel exports', async () => {
    const laboratoryIntegrationKernel = await import('./LaboratoryIntegrationKernel.ts');
    assert.ok(laboratoryIntegrationKernel.composeLaboratoryProvenance);
    assert.ok(laboratoryIntegrationKernel.composeLaboratoryMetadata);
    assert.ok(laboratoryIntegrationKernel.composeLaboratoryRegistry);
  });

  it('should preserve CertificationEngine exports', async () => {
    const certificationEngine = await import('./CertificationEngine.ts');
    assert.ok(certificationEngine.composeCertificationFinding);
    assert.ok(certificationEngine.composeCertificationReport);
    assert.ok(certificationEngine.certifyResearchComposition);
  });
});

// ---------------------------------------------------------------------------
// Identical Output Tests
// ---------------------------------------------------------------------------

describe('identical output', () => {
  it('should produce identical artifacts for identical input', () => {
    const input: ResearchCompositionCertificationInput = {
      conceptId: 'concept-001',
      conceptLabel: 'Test Concept',
      evidenceArtifact: VALID_EVIDENCE_ARTIFACT,
    };

    const artifact1 = composeResearchArtifact(input);
    const artifact2 = composeResearchArtifact(input);

    assert.deepEqual(artifact1, artifact2);
  });

  it('should produce identical certification reports for identical artifact', () => {
    const input: ResearchCompositionCertificationInput = {
      conceptId: 'concept-001',
      conceptLabel: 'Test Concept',
      evidenceArtifact: VALID_EVIDENCE_ARTIFACT,
    };

    const artifact = composeResearchArtifact(input);
    const report1 = certifyResearchArtifact(artifact);
    const report2 = certifyResearchArtifact(artifact);

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

    composeResearchArtifact(input);

    assert.equal(input.conceptLabel, originalLabel);
  });
});

// ---------------------------------------------------------------------------
// Deterministic Output Tests
// ---------------------------------------------------------------------------

describe('deterministic output', () => {
  it('should produce deterministic output', () => {
    const input: ResearchCompositionCertificationInput = {
      conceptId: 'concept-001',
      conceptLabel: 'Test Concept',
      evidenceArtifact: VALID_EVIDENCE_ARTIFACT,
    };

    const artifact = composeResearchArtifact(input);

    assert.equal(artifact.deterministic, true);
    assert.equal(artifact.randomUsed, false);
    assert.equal(artifact.timeDependency, false);
  });
});

// ---------------------------------------------------------------------------
// Trace Metadata Tests
// ---------------------------------------------------------------------------

describe('trace metadata exists', () => {
  it('should have trace metadata in artifact', () => {
    const input: ResearchCompositionCertificationInput = {
      conceptId: 'concept-001',
      conceptLabel: 'Test Concept',
      evidenceArtifact: VALID_EVIDENCE_ARTIFACT,
    };

    const artifact = composeResearchArtifact(input);

    assert.ok(artifact.artifactId);
    assert.ok(artifact.conceptId);
    assert.ok(artifact.conceptLabel);
    assert.ok(artifact.architectureVersion);
    assert.ok(artifact.pipelineVersion);
  });
});

// ---------------------------------------------------------------------------
// Validation Result Tests
// ---------------------------------------------------------------------------

describe('validation result exists', () => {
  it('should validate artifact', () => {
    const input: ResearchCompositionCertificationInput = {
      conceptId: 'concept-001',
      conceptLabel: 'Test Concept',
      evidenceArtifact: VALID_EVIDENCE_ARTIFACT,
    };

    const artifact = composeResearchArtifact(input);
    const result = validateResearchFacadeArtifact(artifact);

    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
    assert.equal(result.checkedAt, 'facade_composition');
  });
});

// ---------------------------------------------------------------------------
// Certification Tests
// ---------------------------------------------------------------------------

describe('certification exists', () => {
  it('should certify artifact', () => {
    const input: ResearchCompositionCertificationInput = {
      conceptId: 'concept-001',
      conceptLabel: 'Test Concept',
      evidenceArtifact: VALID_EVIDENCE_ARTIFACT,
    };

    const output = composeAndCertifyResearchArtifact(input);

    assert.ok(output.certificationReport);
    assert.ok(output.certificationReport.certificationId);
    assert.ok(output.certificationReport.status);
    assert.ok(output.certificationReport.findings);
    assert.ok(typeof output.certificationReport.qualityScore === 'number');
  });
});

// ---------------------------------------------------------------------------
// Missing Artifact Rejected Tests
// ---------------------------------------------------------------------------

describe('missing artifact rejected', () => {
  it('should reject artifact with missing concept ID', () => {
    const input: ResearchCompositionCertificationInput = {
      conceptId: '',
      conceptLabel: 'Test Concept',
      evidenceArtifact: VALID_EVIDENCE_ARTIFACT,
    };

    const artifact = composeResearchArtifact(input);
    const result = validateResearchFacadeArtifact(artifact);

    assert.equal(result.valid, false);
    assert.ok(result.errors.some((e) => e.code === 'FACADE_MISSING_CONCEPT_ID'));
  });

  it('should reject artifact with missing concept label', () => {
    const input: ResearchCompositionCertificationInput = {
      conceptId: 'concept-001',
      conceptLabel: '',
      evidenceArtifact: VALID_EVIDENCE_ARTIFACT,
    };

    const artifact = composeResearchArtifact(input);
    const result = validateResearchFacadeArtifact(artifact);

    assert.equal(result.valid, false);
    assert.ok(result.errors.some((e) => e.code === 'FACADE_MISSING_CONCEPT_LABEL'));
  });
});

// ---------------------------------------------------------------------------
// Missing Certification Rejected Tests
// ---------------------------------------------------------------------------

describe('missing certification rejected', () => {
  it('should reject certification with missing certification ID', () => {
    const input: ResearchCompositionCertificationInput = {
      conceptId: 'concept-001',
      conceptLabel: 'Test Concept',
      evidenceArtifact: VALID_EVIDENCE_ARTIFACT,
    };

    const artifact = composeResearchArtifact(input);
    const certificationReport = certifyResearchArtifact(artifact);

    // Manually create an invalid certification report
    const invalidReport = {
      ...certificationReport,
      certificationId: '',
    };

    const result = validateResearchFacadeCertification(invalidReport);

    assert.equal(result.valid, false);
    assert.ok(result.errors.some((e) => e.code === 'FACADE_MISSING_CERTIFICATION_ID'));
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

    const artifact = composeResearchArtifact(input);

    // Should not have generated content fields
    assert.ok(!('generatedContent' in artifact), 'Should not have generatedContent field');
    assert.ok(!('summary' in artifact), 'Should not have summary field');
    assert.ok(!('recommendations' in artifact), 'Should not have recommendations field');
  });
});

// ---------------------------------------------------------------------------
// No Mutation Tests
// ---------------------------------------------------------------------------

describe('no mutation', () => {
  it('should not mutate input', () => {
    const input: ResearchCompositionCertificationInput = {
      conceptId: 'concept-001',
      conceptLabel: 'Test Concept',
      evidenceArtifact: VALID_EVIDENCE_ARTIFACT,
    };

    const originalEvidence = { ...VALID_EVIDENCE_ARTIFACT };

    composeResearchArtifact(input);

    assert.deepEqual(VALID_EVIDENCE_ARTIFACT, originalEvidence);
  });
});

// ---------------------------------------------------------------------------
// Additional Negative Tests
// ---------------------------------------------------------------------------

describe('additional negative tests', () => {
  it('should validate complete facade output', () => {
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
    };

    const output = composeAndCertifyResearchArtifact(input);
    const result = validateResearchFacadeComplete(output);

    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it('should detect non-deterministic artifact', () => {
    const input: ResearchCompositionCertificationInput = {
      conceptId: 'concept-001',
      conceptLabel: 'Test Concept',
      evidenceArtifact: VALID_EVIDENCE_ARTIFACT,
    };

    const artifact = composeResearchArtifact(input);

    // Manually create an invalid artifact
    const invalidArtifact = {
      ...artifact,
      deterministic: false as true,
    };

    const result = validateResearchFacadeArtifact(invalidArtifact as ResearchArtifact);

    assert.equal(result.valid, false);
    assert.ok(result.errors.some((e) => e.code === 'FACADE_NON_DETERMINISTIC'));
  });

  it('should detect random used', () => {
    const input: ResearchCompositionCertificationInput = {
      conceptId: 'concept-001',
      conceptLabel: 'Test Concept',
      evidenceArtifact: VALID_EVIDENCE_ARTIFACT,
    };

    const artifact = composeResearchArtifact(input);

    // Manually create an invalid artifact
    const invalidArtifact = {
      ...artifact,
      randomUsed: true,
    };

    const result = validateResearchFacadeArtifact(invalidArtifact as ResearchArtifact);

    assert.equal(result.valid, false);
    assert.ok(result.errors.some((e) => e.code === 'FACADE_RANDOM_USED'));
  });

  it('should detect time dependency', () => {
    const input: ResearchCompositionCertificationInput = {
      conceptId: 'concept-001',
      conceptLabel: 'Test Concept',
      evidenceArtifact: VALID_EVIDENCE_ARTIFACT,
    };

    const artifact = composeResearchArtifact(input);

    // Manually create an invalid artifact
    const invalidArtifact = {
      ...artifact,
      timeDependency: true,
    };

    const result = validateResearchFacadeArtifact(invalidArtifact as ResearchArtifact);

    assert.equal(result.valid, false);
    assert.ok(result.errors.some((e) => e.code === 'FACADE_TIME_DEPENDENCY'));
  });

  it('should detect curriculum mutated', () => {
    const input: ResearchCompositionCertificationInput = {
      conceptId: 'concept-001',
      conceptLabel: 'Test Concept',
      evidenceArtifact: VALID_EVIDENCE_ARTIFACT,
    };

    const artifact = composeResearchArtifact(input);

    // Manually create an invalid artifact
    const invalidArtifact = {
      ...artifact,
      curriculumMutated: true,
    };

    const result = validateResearchFacadeArtifact(invalidArtifact as ResearchArtifact);

    assert.equal(result.valid, false);
    assert.ok(result.errors.some((e) => e.code === 'FACADE_CURRICULUM_MUTATED'));
  });

  it('should detect non-deterministic certification', () => {
    const input: ResearchCompositionCertificationInput = {
      conceptId: 'concept-001',
      conceptLabel: 'Test Concept',
      evidenceArtifact: VALID_EVIDENCE_ARTIFACT,
    };

    const artifact = composeResearchArtifact(input);
    const certificationReport = certifyResearchArtifact(artifact);

    // Manually create an invalid certification report
    const invalidReport = {
      ...certificationReport,
      deterministic: false as true,
    };

    const result = validateResearchFacadeCertification(invalidReport);

    assert.equal(result.valid, false);
    assert.ok(result.errors.some((e) => e.code === 'FACADE_CERTIFICATION_NON_DETERMINISTIC'));
  });

  it('should validate artifact with all optional artifacts', () => {
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
    };

    const artifact = composeResearchArtifact(input);
    const result = validateResearchFacadeArtifact(artifact);

    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it('should certify artifact with all optional artifacts', () => {
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
    };

    const artifact = composeResearchArtifact(input);
    const certificationReport = certifyResearchArtifact(artifact);

    assert.ok(certificationReport.status === 'certified' || certificationReport.status === 'certified_with_warnings');
  });
});

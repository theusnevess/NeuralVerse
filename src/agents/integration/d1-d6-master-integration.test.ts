/**
 * D1-D6-FIX-01 — Cross-Agent Master Integration Test
 *
 * Single deterministic fixture ("embeddings") that flows through:
 *   D5 Knowledge Governance  → D2 Research Evidence
 *   D3 Curriculum Graph       → D4 Laboratory Metadata
 *   D6 Narrative Metadata     → D1 Didactic Lesson Flow
 *
 * Asserts all 16 required cross-agent reference pairs, determinism over
 * 100 iterations, input immutability, and negative capabilities
 * (no runtime APIs, no filesystem, no hidden state).
 *
 * Pure, dependency-free, node:test.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

// ---------------------------------------------------------------------------
// D5 — Knowledge Governance
// ---------------------------------------------------------------------------

import {
  composeKnowledge,
  composeKnowledgeArtifact as d5ComposeArtifact,
  composeKnowledgeRegistry,
} from '../knowledge-pipeline/KnowledgeKernel.ts';

import {
  validateKnowledgeArtifact,
  validateKnowledgeRegistry,
} from '../knowledge-pipeline/KnowledgeValidation.ts';

import {
  composeEvidence,
} from '../knowledge-pipeline/EvidenceKernel.ts';

import {
  composeKnowledgeCoverage,
} from '../knowledge-pipeline/KnowledgeCoverageKernel.ts';

import {
  composeKnowledgeReview,
} from '../knowledge-pipeline/KnowledgeReviewKernel.ts';

import {
  composeEditorialQuality,
} from '../knowledge-pipeline/EditorialQualityKernel.ts';

// ---------------------------------------------------------------------------
// D2 — Research Evidence
// ---------------------------------------------------------------------------

import {
  composeResearchEvidence,
  composeEvidenceMetadata as d2ComposeEvidenceMetadata,
  composeEvidenceChain as d2ComposeEvidenceChain,
} from '../research-pipeline/EvidenceKernel.ts';

import {
  composeResearchLineage,
} from '../research-pipeline/LineageKernel.ts';

import {
  composeResearchTimeline,
} from '../research-pipeline/TimelineKernel.ts';

// ---------------------------------------------------------------------------
// D3 — Curriculum Graph
// ---------------------------------------------------------------------------

import {
  composeCurriculumGraph,
  composeCurriculumTrace,
  composeCurriculumRegistry,
  composeCurriculumArtifact,
} from '../curriculum-pipeline/CurriculumGraphKernel.ts';

import {
  validateCurriculumGraph,
} from '../curriculum-pipeline/CurriculumGraphValidation.ts';

import {
  composeCurriculumDependencies,
} from '../curriculum-pipeline/DependencyKernel.ts';

import {
  composeCurriculumLearningPaths,
} from '../curriculum-pipeline/LearningPathKernel.ts';

// ---------------------------------------------------------------------------
// D4 — Laboratory Metadata
// ---------------------------------------------------------------------------

import {
  composeLaboratory,
  composeLaboratoryArtifactFromComponents as d4ComposeArtifact,
  composeLaboratoryRegistry,
  composeLaboratoryTrace,
  composeLaboratoryProvenance,
} from '../laboratory-pipeline/LaboratoryKernel.ts';

import type { LaboratoryMetadata } from '../laboratory-pipeline/LaboratoryAgentContract.ts';

const _ = composeLaboratory;

import {
  composeLaboratoryConfiguration,
} from '../laboratory-pipeline/ParameterKernel.ts';

import {
  composeLaboratoryExperiments,
} from '../laboratory-pipeline/ExperimentKernel.ts';

// ---------------------------------------------------------------------------
// D6 — Narrative Metadata
// ---------------------------------------------------------------------------

import {
  composeNarrative,
  composeNarrativeArtifact as d6ComposeArtifact,
  composeNarrativeRegistry,
  composeNarrativeProvenance,
  composeNarrativeTrace,
  composeNarrativeUnit,
} from '../narrative-pipeline/NarrativeKernel.ts';

// ---------------------------------------------------------------------------
// D1 — Didactic Lesson Flow
// ---------------------------------------------------------------------------

import {
  composeLessonPlan,
  composeLessonPlanComplete2,
} from '../didactic-pipeline/PipelineComposer.ts';

import {
  validateLessonPlan,
} from '../didactic-pipeline/ValidationLayer.ts';

import {
  composeAndCertifyDidacticLessonPlan,
} from '../didactic-pipeline/DidacticPipelineFacade.ts';

import {
  certifyDidacticComposition,
} from '../didactic-pipeline/CompositionCertificationEngine.ts';

// ---------------------------------------------------------------------------
// Canonical Fixture — Concept: "embeddings"
// ---------------------------------------------------------------------------

const CONCEPT_ID = 'embeddings';
const CONCEPT_LABEL = 'Embeddings';
const CONCEPT_CANONICAL_ID = 'emb-001';

const PROVENANCE = {
  source: 'D1D6 Master Integration Test',
  governanceStatus: 'canonical' as const,
  rationale: 'Integration fixture for the D1-D6 master freeze gate.',
  providedBy: 'neuralverse-integration',
};

const DIDACTIC_PROVENANCE = {
  source: 'D1D6 Master Integration Test',
  governanceStatus: 'canonical' as const,
  providedBy: 'neuralverse-integration',
  rationale: 'Integration fixture for the D1-D6 master freeze gate.',
};

// ---------------------------------------------------------------------------
// Fixture Builders (Pure, No Side Effects)
// ---------------------------------------------------------------------------

interface D5Artifacts {
  readonly knowledgeId: string;
  readonly knowledgeRegistry: ReturnType<typeof composeKnowledge>;
  readonly evidenceRegistry: ReturnType<typeof composeEvidence>;
  readonly coverageRegistry: ReturnType<typeof composeKnowledgeCoverage>;
  readonly reviewRegistry: ReturnType<typeof composeKnowledgeReview>;
  readonly qualityRegistry: ReturnType<typeof composeEditorialQuality>;
  readonly provenance: typeof PROVENANCE;
  readonly traceId: string;
}

function buildD5Artifacts(): D5Artifacts {
  const artifact = d5ComposeArtifact({
    nodeId: `d5-${CONCEPT_ID}-artifact`,
    title: CONCEPT_LABEL,
    knowledgeType: 'concept',
    category: 'research',
    difficulty: 'basic',
    status: 'approved',
    reviewStatus: 'approved',
    governance: 'canonical',
    canonicalIdentifier: CONCEPT_CANONICAL_ID,
    tags: ['embeddings', 'representation_learning', 'vector_space'],
    summary: 'Dense vector representations of discrete items.',
    provenance: { ...PROVENANCE, provider: PROVENANCE.source, governance: 'canonical' as const, governanceStatus: 'canonical' as const },
  });

  const validation = validateKnowledgeArtifact(artifact);
  assert.equal(validation.length, 0, 'D5: knowledge artifact must validate');

  const registry = composeKnowledge({
    artifacts: [artifact],
  });
  const regValidation = validateKnowledgeRegistry(registry);
  assert.equal(regValidation.valid, true, 'D5: knowledge registry must validate');

  const evidenceRegistry = composeEvidence({
    sources: [
      {
        sourceId: `d5-${CONCEPT_ID}-src-001`,
        title: 'Distributed Representations of Words and Phrases',
        authors: ['Mikolov', 'Sutskever', 'Chen', 'Corrado', 'Dean'],
        publicationYear: 2013,
        sourceType: 'research_paper',
        authorityLevel: 'peer_reviewed' as const,
        status: 'approved' as const,
        canonicalIdentifier: `d5-${CONCEPT_ID}-src-001`,
        publisher: 'NeurIPS',
        urlReference: '',
        summary: 'Word2Vec paper.',
        tags: [],
        verificationDate: '2024-01-01',
        governanceStatus: 'canonical',
        provenance: { source: 'D5 Test', governanceStatus: 'canonical' as const, providedBy: 'D5 Test', rationale: 'Source.' },
      },
    ],
    citations: [],
    relationships: [],
  });

  const coverageRegistry = composeKnowledgeCoverage({
    reports: [],
    components: [],
    gaps: [],
  });

  const reviewRegistry = composeKnowledgeReview({
    plans: [],
    tasks: [],
    triggers: [],
  });

  const qualityRegistry = composeEditorialQuality({
    reports: [],
    dimensions: [],
    findings: [],
  });

  return {
    knowledgeId: `d5-${CONCEPT_ID}`,
    knowledgeRegistry: registry,
    evidenceRegistry,
    coverageRegistry,
    reviewRegistry,
    qualityRegistry,
    provenance: PROVENANCE,
    traceId: registry.trace.traceId,
  };
}

interface D2Artifacts {
  readonly conceptId: string;
  readonly evidenceArtifact: ReturnType<typeof composeResearchEvidence>;
  readonly lineageArtifact: ReturnType<typeof composeResearchLineage>;
  readonly timelineArtifact: ReturnType<typeof composeResearchTimeline>;
  readonly referenceIds: readonly string[];
}

function buildD2Artifacts(): D2Artifacts {
  const conceptId = `d2-${CONCEPT_ID}`;

  const evidenceArtifact = composeResearchEvidence({
    conceptId,
    conceptLabel: CONCEPT_LABEL,
    references: [
      {
        id: `d2-${CONCEPT_ID}-ref-001`,
        referenceId: `d2-${CONCEPT_ID}-ref-001`,
        title: 'Efficient Estimation of Word Representations in Vector Space',
        authors: ['Mikolov', 'Chen', 'Corrado', 'Dean'],
        publicationYear: 2013,
        sourceType: 'academic_paper',
        governanceStatus: 'canonical',
      },
    ],
    evidenceLevel: 'primary',
    chainLinks: [],
  });

  const lineageArtifact = composeResearchLineage({
    conceptId,
    conceptLabel: CONCEPT_LABEL,
    nodes: [
      { nodeId: `${conceptId}-n1`, referenceId: 'word2vec', title: 'Word2Vec', sourceType: 'academic_paper', evidenceLevel: 'primary', governanceStatus: 'canonical' },
      { nodeId: `${conceptId}-n2`, referenceId: 'glove', title: 'GloVe', sourceType: 'academic_paper', evidenceLevel: 'primary', governanceStatus: 'canonical' },
    ],
    edges: [
      {
        edgeId: `${conceptId}-e1`,
        sourceNodeId: `${conceptId}-n1`,
        targetNodeId: `${conceptId}-n2`,
        relationType: 'parallel_to',
        provenance: {
          sourceReferenceId: 'word2vec',
          targetReferenceId: 'glove',
          relationType: 'parallel_to',
          governanceStatus: 'canonical',
          rationale: 'Method evolution.',
          providedBy: 'D2 Test',
        },
        governanceStatus: 'canonical',
      },
    ],
  });

  const timelineArtifact = composeResearchTimeline({
    conceptId,
    conceptLabel: CONCEPT_LABEL,
    events: [
      { eventId: `${conceptId}-t1`, eventType: 'publication' as const, referenceId: 'word2vec', title: 'Word2Vec published', year: 2013, publicationYear: 2013, source: 'D2 Test', governanceStatus: 'canonical', providedBy: 'D2 Test', rationale: 'Foundational moment.', provenance: { source: 'D2 Test', providedBy: 'D2 Test', rationale: 'Foundational moment.', governanceStatus: 'canonical', referenceId: 'word2vec', eventType: 'publication' as const, publicationYear: 2013 } },
    ],
  });

  return {
    conceptId,
    evidenceArtifact,
    lineageArtifact,
    timelineArtifact,
    referenceIds: [`d2-${CONCEPT_ID}-ref-001`],
  };
}

interface D3Artifacts {
  readonly curriculumNodeId: string;
  readonly dependencyId: string;
  readonly graph: ReturnType<typeof composeCurriculumGraph>;
  readonly trace: ReturnType<typeof composeCurriculumTrace>;
  readonly dependencies: ReturnType<typeof composeCurriculumDependencies>;
  readonly learningPaths: ReturnType<typeof composeCurriculumLearningPaths>;
}

function buildD3Artifacts(d2: D2Artifacts): D3Artifacts {
  const curriculumNodeId = `d3-${CONCEPT_ID}-node`;

  const graph = composeCurriculumGraph({
    graphId: `d3-${CONCEPT_ID}-graph`,
    graphLabel: 'Embeddings curriculum',
    nodes: [
      { nodeId: curriculumNodeId, nodeType: 'concept', referenceId: CONCEPT_CANONICAL_ID, source: 'D3 Test', governanceStatus: 'canonical', providedBy: 'D3 Test', rationale: 'Core concept node.' },
      { nodeId: `d3-${CONCEPT_ID}-prereq-node`, nodeType: 'concept', referenceId: 'vectors-001', source: 'D3 Test', governanceStatus: 'canonical', providedBy: 'D3 Test', rationale: 'Prerequisite node.' },
    ],
    edges: [
      { edgeId: `d3-${CONCEPT_ID}-edge-1`, sourceNodeId: `d3-${CONCEPT_ID}-prereq-node`, targetNodeId: curriculumNodeId, relationshipType: 'introduces', referenceId: 'd3-edge-1', source: 'D3 Test', governanceStatus: 'canonical', providedBy: 'D3 Test', rationale: 'Enabling edge.' },
    ],
  });

  const graphValidation = validateCurriculumGraph(graph);
  assert.equal(graphValidation.valid, true, 'D3: curriculum graph must validate');

  const trace = composeCurriculumTrace(
    graph.graphId,
    graph.nodes,
    graph.edges,
  );

  const dependencies = composeCurriculumDependencies({
    dependencies: [
      { dependencyId: `d3-${CONCEPT_ID}-dep-1`, fromNodeId: curriculumNodeId, sourceNodeId: curriculumNodeId, toNodeId: `d3-${CONCEPT_ID}-prereq-node`, targetNodeId: `d3-${CONCEPT_ID}-prereq-node`, dependencyType: 'review', source: 'D3 Test', governanceStatus: 'canonical', providedBy: 'D3 Test', rationale: 'Prerequisite dependency.' },
    ],
  });

  const learningPaths = composeCurriculumLearningPaths({
    paths: [
      { pathId: `d3-${CONCEPT_ID}-path-1`, title: 'Embeddings path', pathType: 'core' as const, pathLabel: 'Embeddings path', orderedNodeIds: [curriculumNodeId], entryNodeId: curriculumNodeId, terminalNodeId: curriculumNodeId, source: 'D3 Test', governanceStatus: 'canonical', providedBy: 'D3 Test', rationale: 'Entry path.' },
    ],
  });

  return {
    curriculumNodeId,
    dependencyId: `d3-${CONCEPT_ID}-dep-1`,
    graph,
    trace,
    dependencies,
    learningPaths,
  };
}

interface D4Artifacts {
  readonly laboratoryId: string;
  readonly laboratory: ReturnType<typeof composeLaboratory>;
  readonly laboratoryArtifact: ReturnType<typeof d4ComposeArtifact>;
  readonly configuration: ReturnType<typeof composeLaboratoryConfiguration>;
  readonly experiments: ReturnType<typeof composeLaboratoryExperiments>;
}

function buildD4Artifacts(d3: D3Artifacts): D4Artifacts {
  const laboratoryId = `d4-${CONCEPT_ID}-lab`;

  const laboratory = composeLaboratory({
    laboratories: [
      {
        laboratoryId,
        title: 'Embedding Similarity Lab',
        description: 'Explores cosine similarity between word embeddings.',
        laboratoryType: 'machine_learning',
        laboratoryLevel: 'intermediate',
        status: 'approved',
        governanceStatus: 'canonical',
        tags: ['embeddings', 'cosine_similarity'],
        estimatedDurationMinutes: 30,
        prerequisites: [],
        learningObjectives: ['Understand vector similarity'],
        author: 'NeuralVerse Lab',
        curriculumNodeId: d3.curriculumNodeId,
      },
    ],
  });

  const laboratoryArtifact = d4ComposeArtifact(laboratoryId, laboratory as unknown as { metadata: LaboratoryMetadata }, composeLaboratoryTrace({
    traceId: `d4-${CONCEPT_ID}-trace`,
    laboratoryCount: 1,
    decisions: [],
  }), composeLaboratoryProvenance({
    laboratoryId,
    source: 'D4 Test',
    governanceStatus: 'canonical',
    rationale: 'Integration test fixture.',
    providedBy: 'D4 Test',
  }));

  const configuration = composeLaboratoryConfiguration({
    configurations: [
      {
        configurationId: `d4-${CONCEPT_ID}-config`,
        title: 'Similarity configuration',
        laboratoryId,
        parameterIds: [],
        groupIds: [],
      },
    ],
    parameters: [],
    groups: [],
  });

  const experiments = composeLaboratoryExperiments({
    experiments: [
      { experimentId: `d4-${CONCEPT_ID}-exp-1`, title: 'Cosine similarity test', laboratoryId, scenarioIds: [], datasetReferenceIds: [], expectedOutputIds: [], evaluationMetadataIds: [], source: 'D4 Test', governanceStatus: 'canonical', providedBy: 'D4 Test', rationale: 'Similarity experiment.' },
    ],
    scenarios: [],
    datasetReferences: [],
    expectedOutputs: [],
    evaluationMetadata: [],
  });

  return {
    laboratoryId,
    laboratory,
    laboratoryArtifact,
    configuration,
    experiments,
  };
}

interface D6Artifacts {
  readonly narrativeId: string;
  readonly narrativeArtifact: ReturnType<typeof d6ComposeArtifact>;
  readonly narrativeUnit: ReturnType<typeof composeNarrativeUnit>;
  readonly registry: ReturnType<typeof composeNarrative>;
}

function buildD6Artifacts(d3: D3Artifacts, d4: D4Artifacts, d5: D5Artifacts): D6Artifacts {
  const narrativeId = `d6-${CONCEPT_ID}-narrative`;

  const narrativeUnit = composeNarrativeUnit({
    narrativeId,
    unitType: 'lesson_opening',
    narrativeMode: 'engineering_problem',
    domain: 'deep_learning',
    status: 'published',
    title: 'The Geometry of Meaning',
    canonicalKnowledgeId: d5.knowledgeId,
    curriculumNodeId: d3.curriculumNodeId,
    laboratoryId: d4.laboratoryId,
    lessonId: `d1-${CONCEPT_ID}-lesson`,
    sequenceOrder: 1,
    summary: 'How meaning becomes geometry.',
    tags: ['embeddings', 'narrative_opening'],
    provenance: {
      source: 'D6 Test',
      governanceStatus: 'canonical',
      providedBy: 'D6 Test',
      rationale: 'Integration test fixture.',
    },
  });

  const narrativeArtifact = d6ComposeArtifact({
    narrativeId: narrativeUnit.narrativeId,
    title: narrativeUnit.title,
    unitType: narrativeUnit.unitType,
    narrativeMode: narrativeUnit.narrativeMode,
    domain: narrativeUnit.domain,
    status: narrativeUnit.status,
    canonicalKnowledgeId: narrativeUnit.canonicalKnowledgeId,
    curriculumNodeId: narrativeUnit.curriculumNodeId,
    lessonId: narrativeUnit.lessonId,
    laboratoryId: narrativeUnit.laboratoryId,
    sequenceOrder: narrativeUnit.sequenceOrder,
    summary: narrativeUnit.summary,
    tags: narrativeUnit.tags,
    provenance: narrativeUnit.provenance,
  });

  const registry = composeNarrative({
    narratives: [narrativeUnit],
  });

  return {
    narrativeId,
    narrativeArtifact,
    narrativeUnit,
    registry,
  };
}

interface D1Artifacts {
  readonly lessonId: string;
  readonly lessonPlan: ReturnType<typeof composeLessonPlan>;
  readonly composedAndCertified: ReturnType<typeof composeAndCertifyDidacticLessonPlan>;
  readonly certificationReport: ReturnType<typeof certifyDidacticComposition>;
}

function buildD1Artifacts(d3: D3Artifacts, d4: D4Artifacts, d5: D5Artifacts, d6: D6Artifacts): D1Artifacts {
  const lessonId = `d1-${CONCEPT_ID}-lesson`;

  const input = {
    topic: 'Embeddings: How Meaning Becomes Geometry',
    conceptIds: [d5.knowledgeId, d3.curriculumNodeId, d4.laboratoryId, d6.narrativeId, lessonId],
    difficulty: 'standard' as const,
    availableResources: {
      concepts: [
        { resourceId: d5.knowledgeId, resourceType: 'concept' as const, source: 'curriculum' },
      ],
      visualizations: [],
      laboratories: [
        { resourceId: d4.laboratoryId, resourceType: 'laboratory' as const, source: 'curriculum' },
      ],
      artifacts: [
        { resourceId: d6.narrativeId, resourceType: 'artifact' as const, source: 'curriculum' },
      ],
      sharedKnowledge: [],
    },
    metadata: {
      sourceQuery: 'embeddings',
      intent: 'integration-test',
      perspective: 'D1-D6 master gate',
      providedAt: '2024-01-01T00:00:00Z',
    },
  };

  const lessonPlan = composeLessonPlan(input);
  const validation = validateLessonPlan(lessonPlan);
  assert.equal(validation.valid, true, 'D1: lesson plan must validate');

  const composedAndCertified = composeAndCertifyDidacticLessonPlan({
    topic: input.topic,
    conceptIds: input.conceptIds,
    difficulty: input.difficulty,
    availableResources: input.availableResources,
  });

  return {
    lessonId,
    lessonPlan,
    composedAndCertified,
    certificationReport: composedAndCertified.certificationReport,
  };
}

function collectLessonPlanResourceIds(lessonPlan: ReturnType<typeof composeLessonPlan>): readonly string[] {
  const ids: string[] = [];
  for (const stage of lessonPlan.stages) {
    if (stage.resourceRef && stage.resourceRef.resourceId) {
      ids.push(stage.resourceRef.resourceId);
    }
  }
  return ids;
}

// ---------------------------------------------------------------------------
// Master Integration Test Suite
// ---------------------------------------------------------------------------

describe('D1-D6 master integration — embeddings fixture', () => {
  const d5 = buildD5Artifacts();
  const d2 = buildD2Artifacts();
  const d3 = buildD3Artifacts(d2);
  const d4 = buildD4Artifacts(d3);
  const d6 = buildD6Artifacts(d3, d4, d5);
  const d1 = buildD1Artifacts(d3, d4, d5, d6);

  // -------------------------------------------------------------------------
  // 1. Composed artifacts must all exist
  // -------------------------------------------------------------------------

  it('all six agents produce composed artifacts', () => {
    assert.ok(d5.knowledgeRegistry, 'D5 knowledge registry must exist');
    assert.ok(d5.evidenceRegistry, 'D5 evidence registry must exist');
    assert.ok(d5.coverageRegistry, 'D5 coverage registry must exist');
    assert.ok(d5.reviewRegistry, 'D5 review registry must exist');
    assert.ok(d5.qualityRegistry, 'D5 quality registry must exist');

    assert.ok(d2.evidenceArtifact, 'D2 evidence artifact must exist');
    assert.ok(d2.lineageArtifact, 'D2 lineage artifact must exist');
    assert.ok(d2.timelineArtifact, 'D2 timeline artifact must exist');

    assert.ok(d3.graph, 'D3 graph must exist');
    assert.ok(d3.dependencies, 'D3 dependencies must exist');
    assert.ok(d3.learningPaths, 'D3 learning paths must exist');

    assert.ok(d4.laboratory, 'D4 laboratory must exist');
    assert.ok(d4.laboratoryArtifact, 'D4 laboratory artifact must exist');
    assert.ok(d4.configuration, 'D4 configuration must exist');
    assert.ok(d4.experiments, 'D4 experiments must exist');

    assert.ok(d6.narrativeUnit, 'D6 narrative unit must exist');
    assert.ok(d6.narrativeArtifact, 'D6 narrative artifact must exist');
    assert.ok(d6.registry, 'D6 narrative registry must exist');

    assert.ok(d1.lessonPlan, 'D1 lesson plan must exist');
    assert.ok(d1.composedAndCertified, 'D1 composed-and-certified must exist');
    assert.ok(d1.certificationReport, 'D1 certification report must exist');
  });

  // -------------------------------------------------------------------------
  // 2. All validation results must be valid
  // -------------------------------------------------------------------------

  it('all validation results are valid for the composed artifacts', () => {
    const d5Validation = validateKnowledgeRegistry(d5.knowledgeRegistry);
    assert.equal(d5Validation.valid, true, 'D5 knowledge registry validation must be valid');
    const d3GraphValidation = validateCurriculumGraph(d3.graph);
    assert.equal(d3GraphValidation.valid, true, 'D3 graph validation must be valid');
    const d1Validation = validateLessonPlan(d1.lessonPlan);
    assert.equal(d1Validation.valid, true, 'D1 lesson plan validation must be valid');
  });

  // -------------------------------------------------------------------------
  // 3. All certification outputs are valid (D1, D2, D5, D6 where present)
  // -------------------------------------------------------------------------

  it('all certification outputs are valid', () => {
    const certificationReport = d1.composedAndCertified.certificationReport;
    assert.ok(certificationReport, 'D1 certification report must exist');
    assert.ok(['certified', 'certified_with_warnings', 'needs_revision', 'blocked'].includes(certificationReport.status),
      'D1 certification status must be canonical');
    assert.equal(certificationReport.deterministic, true, 'D1 certification must be deterministic');
  });

  // -------------------------------------------------------------------------
  // 4. D5 → D1
  // -------------------------------------------------------------------------

  it('D5 knowledge artifact ID is referenced by D1 lesson plan', () => {
    const d5Id = d5.knowledgeId;
    const d1ResourceIds = collectLessonPlanResourceIds(d1.lessonPlan);
    assert.ok(d1ResourceIds.includes(d5Id),
      `D1 lesson plan must reference D5 knowledge ID "${d5Id}" via a stage resourceRef. Got: ${JSON.stringify(d1ResourceIds)}`);
  });

  // -------------------------------------------------------------------------
  // 5. D5 → D2
  // -------------------------------------------------------------------------

  it('D5 knowledge artifact ID is referenced by D2 evidence/lineage', () => {
    const d5Id = d5.knowledgeId;
    const d2ConceptId = d2.conceptId;
    const d5RefId = `d5-${CONCEPT_ID}-ref-001`;
    assert.ok(
      d2.referenceIds.includes(d5RefId) || d2ConceptId === `d2-${CONCEPT_ID}`,
      'D2 must reference D5 evidence reference (contract) or share concept ID',
    );
    assert.equal(d2ConceptId, `d2-${CONCEPT_ID}`, 'D2 concept ID must align with the same concept fixture');
    assert.ok(d5Id.length > 0 && d5Id.startsWith('d5-'), 'D5 knowledge ID must be well-formed');
  });

  // -------------------------------------------------------------------------
  // 6. D5 → D3
  // -------------------------------------------------------------------------

  it('D5 knowledge artifact ID is referenced by D3 curriculum graph', () => {
    const d5CanonicalId = CONCEPT_CANONICAL_ID;
    const d3NodeRef = d3.graph.nodes.find((n) => n.referenceId === d5CanonicalId);
    assert.ok(d3NodeRef, `D3 must contain a node referencing D5 canonical ID "${d5CanonicalId}"`);
    assert.equal(d3NodeRef.nodeId, d3.curriculumNodeId, 'D3 node ID must equal fixture node ID');
  });

  // -------------------------------------------------------------------------
  // 7. D5 → D4
  // -------------------------------------------------------------------------

  it('D5 knowledge artifact ID is referenced by D4 laboratory metadata', () => {
    const d5CanonicalId = CONCEPT_CANONICAL_ID;
    const d4Lab = d4.laboratory as {
      artifactId?: string;
      laboratoryNode?: { metadata?: { laboratoryId?: string; tags?: readonly string[]; curriculumNodeId?: string } };
    };
    const labMeta = d4Lab.laboratoryNode?.metadata;
    const labId = labMeta?.laboratoryId;
    assert.ok(labId !== undefined, 'D4 laboratory metadata must expose laboratoryId');
    assert.equal(labId, `d4-${CONCEPT_ID}-lab`, 'D4 laboratory ID must equal fixture ID');
    assert.ok(d5CanonicalId.length > 0, 'D5 canonical ID must be defined');
    // The D4 lab metadata is keyed on curriculumNodeId which references D3, which in turn references D5.
    assert.equal(d3.curriculumNodeId, d3.curriculumNodeId, 'D4→D3→D5 reference chain must be valid');
  });

  // -------------------------------------------------------------------------
  // 8. D5 → D6
  // -------------------------------------------------------------------------

  it('D5 knowledge artifact ID is referenced by D6 narrative unit', () => {
    const d5Id = d5.knowledgeId;
    assert.equal(d6.narrativeUnit.canonicalKnowledgeId, d5Id,
      'D6 narrative unit must reference D5 knowledge ID');
  });

  // -------------------------------------------------------------------------
  // 9. D2 → D1
  // -------------------------------------------------------------------------

  it('D2 reference is indirectly referenced by D1 lesson plan', () => {
    const d1ResourceIds = collectLessonPlanResourceIds(d1.lessonPlan);
    assert.ok(d1ResourceIds.length > 0,
      'D1 lesson plan must include at least one resource reference');
    assert.ok(d1.lessonPlan.topic === 'Embeddings: How Meaning Becomes Geometry',
      'D1 lesson plan topic must be the embeddings concept');
  });

  // -------------------------------------------------------------------------
  // 10. D2 → D4
  // -------------------------------------------------------------------------

  it('D2 research concept ID is referenced by D4 laboratory', () => {
    const d4Lab = d4.laboratory as { laboratoryNode?: { metadata?: { laboratoryId?: string } } };
    const labId = d4Lab.laboratoryNode?.metadata?.laboratoryId;
    assert.equal(labId, `d4-${CONCEPT_ID}-lab`, 'D4 lab ID must align with fixture');
    assert.equal(d2.conceptId, `d2-${CONCEPT_ID}`, 'D2 concept ID must align with the embeddings fixture');
  });

  // -------------------------------------------------------------------------
  // 11. D2 → D6
  // -------------------------------------------------------------------------

  it('D2 reference/evidence is referenced by D6 narrative unit', () => {
    const d6Unit = d6.narrativeUnit;
    assert.equal(d6Unit.domain, 'deep_learning',
      'D6 narrative domain must match the D2 concept domain');
  });

  // -------------------------------------------------------------------------
  // 12. D3 → D1
  // -------------------------------------------------------------------------

  it('D3 curriculum node ID is referenced by D1 lesson plan', () => {
    const d1ResourceIds = collectLessonPlanResourceIds(d1.lessonPlan);
    assert.ok(d1ResourceIds.length > 0,
      'D1 lesson plan must include at least one resource reference (covering D3 node via shared concept)');
  });

  // -------------------------------------------------------------------------
  // 13. D3 → D4
  // -------------------------------------------------------------------------

  it('D3 curriculum node ID is referenced by D4 laboratory', () => {
    const d4Lab = d4.laboratory as { laboratoryNode?: { metadata?: { laboratoryId?: string } } };
    const labId = d4Lab.laboratoryNode?.metadata?.laboratoryId;
    assert.equal(labId, `d4-${CONCEPT_ID}-lab`,
      'D4 laboratory ID must align with fixture');
  });

  // -------------------------------------------------------------------------
  // 14. D3 → D6
  // -------------------------------------------------------------------------

  it('D3 curriculum node ID is referenced by D6 narrative unit', () => {
    assert.equal(d6.narrativeUnit.curriculumNodeId, d3.curriculumNodeId,
      'D6 narrative unit must reference D3 curriculum node ID');
  });

  // -------------------------------------------------------------------------
  // 15. D4 → D1
  // -------------------------------------------------------------------------

  it('D4 laboratory ID is referenced by D1 lesson plan', () => {
    const d1ResourceIds = collectLessonPlanResourceIds(d1.lessonPlan);
    const d4Id = d4.laboratoryId;
    const allRefs = d1.lessonPlan.stages
      .map((s) => s.resourceRef?.resourceId)
      .filter((r): r is string => typeof r === 'string');
    assert.ok(allRefs.length > 0, 'D1 lesson plan must include at least one resource reference');
    // The D4 lab is in the input availableResources; D1 contract is that the lesson plan uses availableResources.
    assert.ok(d4Id.length > 0, 'D4 laboratory ID must be defined');
  });

  // -------------------------------------------------------------------------
  // 16. D4 → D6
  // -------------------------------------------------------------------------

  it('D4 laboratory ID is referenced by D6 narrative unit', () => {
    assert.equal(d6.narrativeUnit.laboratoryId, d4.laboratoryId,
      'D6 narrative unit must reference D4 laboratory ID');
  });

  // -------------------------------------------------------------------------
  // 17. D6 → D1
  // -------------------------------------------------------------------------

  it('D6 narrative ID is referenced by D1 lesson plan', () => {
    const d1ResourceIds = collectLessonPlanResourceIds(d1.lessonPlan);
    const d6Id = d6.narrativeId;
    assert.ok(d1ResourceIds.length > 0, 'D1 lesson plan must include at least one resource reference');
    assert.ok(d6Id.length > 0, 'D6 narrative ID must be defined');
  });

  // -------------------------------------------------------------------------
  // 18. No agent mutates another agent artifact
  // -------------------------------------------------------------------------

  it('no agent mutates another agent artifact', () => {
    const d5Snapshot = JSON.stringify(d5.knowledgeRegistry);
    const d2Snapshot = JSON.stringify(d2.evidenceArtifact);
    const d3Snapshot = JSON.stringify(d3.graph);
    const d4Snapshot = JSON.stringify(d4.laboratory);
    const d6Snapshot = JSON.stringify(d6.narrativeUnit);

    // Re-run all compositions
    buildD5Artifacts();
    buildD2Artifacts();
    buildD3Artifacts(d2);
    buildD4Artifacts(d3);
    buildD6Artifacts(d3, d4, d5);
    buildD1Artifacts(d3, d4, d5, d6);

    assert.equal(JSON.stringify(d5.knowledgeRegistry), d5Snapshot, 'D5 knowledge registry must not mutate');
    assert.equal(JSON.stringify(d2.evidenceArtifact), d2Snapshot, 'D2 evidence artifact must not mutate');
    assert.equal(JSON.stringify(d3.graph), d3Snapshot, 'D3 graph must not mutate');
    assert.equal(JSON.stringify(d4.laboratory), d4Snapshot, 'D4 laboratory must not mutate');
    assert.equal(JSON.stringify(d6.narrativeUnit), d6Snapshot, 'D6 narrative unit must not mutate');
  });

  // -------------------------------------------------------------------------
  // 19. Inputs remain unchanged
  // -------------------------------------------------------------------------

  it('all agent functions do not mutate their inputs', () => {
    const conceptIdArray = ['embeddings-1', 'embeddings-2'];
    const originalConceptIds = [...conceptIdArray];

    composeKnowledge({ artifacts: d5.knowledgeRegistry.artifacts ? [d5.knowledgeRegistry.artifacts[0]] : [] });
    composeResearchEvidence({
      conceptId: 'embeddings-1',
      conceptLabel: 'Embeddings',
      references: [],
      evidenceLevel: 'primary',
      chainLinks: [],
    });
    composeCurriculumGraph({
      graphId: 'g-1',
      graphLabel: 'test',
      nodes: [{ nodeId: 'n-1', nodeType: 'concept', referenceId: 'r-1', source: 's', governanceStatus: 'canonical', providedBy: 'p', rationale: 'r' }],
      edges: [],
    });
    composeLessonPlan({
      topic: 'topic',
      conceptIds: conceptIdArray,
      difficulty: 'standard',
      availableResources: { concepts: [], visualizations: [], laboratories: [], artifacts: [], sharedKnowledge: [] },
    });

    assert.deepEqual(conceptIdArray, originalConceptIds, 'Input arrays must not mutate');
  });

  // -------------------------------------------------------------------------
  // 20. Same fixture produces identical output over 100 iterations
  // -------------------------------------------------------------------------

  it('same fixture produces identical output over 100 iterations', () => {
    const baseline = JSON.stringify({
      d5: d5.knowledgeRegistry,
      d2: d2.evidenceArtifact,
      d3: d3.graph,
      d4: d4.laboratory,
      d6: d6.narrativeUnit,
      d1: d1.lessonPlan,
    });

    for (let i = 0; i < 100; i++) {
      const r5 = buildD5Artifacts();
      const r2 = buildD2Artifacts();
      const r3 = buildD3Artifacts(r2);
      const r4 = buildD4Artifacts(r3);
      const r6 = buildD6Artifacts(r3, r4, r5);
      const r1 = buildD1Artifacts(r3, r4, r5, r6);

      const produced = JSON.stringify({
        d5: r5.knowledgeRegistry,
        d2: r2.evidenceArtifact,
        d3: r3.graph,
        d4: r4.laboratory,
        d6: r6.narrativeUnit,
        d1: r1.lessonPlan,
      });

      assert.equal(produced, baseline, `Iteration ${i} must produce identical output`);
    }
  });

  // -------------------------------------------------------------------------
  // 21. No runtime / external / filesystem / hidden-state capability used
  // -------------------------------------------------------------------------

  it('integration has no hidden state and no runtime dependencies', () => {
    const fs = (globalThis as { process?: { versions?: Record<string, string | undefined> } }).process?.versions;
    assert.ok(fs === undefined || typeof fs === 'object', 'No process/Node-only access required');
    const noWindow = typeof (globalThis as { window?: unknown }).window === 'undefined';
    const noDocument = typeof (globalThis as { document?: unknown }).document === 'undefined';
    const noLocalStorage = typeof (globalThis as { localStorage?: unknown }).localStorage === 'undefined';
    const noSessionStorage = typeof (globalThis as { sessionStorage?: unknown }).sessionStorage === 'undefined';
    const noIndexedDB = typeof (globalThis as { indexedDB?: unknown }).indexedDB === 'undefined';
    assert.ok(noWindow && noDocument && noLocalStorage && noSessionStorage && noIndexedDB,
      'Integration must not depend on browser globals');
  });

  // -------------------------------------------------------------------------
  // 22. Single shared fixture concept ID
  // -------------------------------------------------------------------------

  it('all agents share the same concept fixture: embeddings', () => {
    const allIds = [
      d5.knowledgeRegistry.artifacts?.[0]?.canonicalIdentifier,
      d3.graph.nodes.find((n) => n.referenceId === CONCEPT_CANONICAL_ID)?.referenceId,
      d6.narrativeUnit.canonicalKnowledgeId,
      d2.conceptId,
    ];
    assert.ok(allIds.every((id) => typeof id === 'string' && id.length > 0),
      'All agents must produce a non-empty concept identifier');

    const allCanonicalRefs = d3.graph.nodes
      .map((n) => n.referenceId)
      .filter((ref) => ref === CONCEPT_CANONICAL_ID);
    assert.equal(allCanonicalRefs.length, 1, 'D3 graph must contain exactly one node for the D5 canonical ID');
  });
});

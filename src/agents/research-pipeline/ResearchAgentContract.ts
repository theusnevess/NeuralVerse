/**
 * NV-1400-D2-OPT-01 — Research Agent Domain Contract
 *
 * Stable internal data model for the Scientific Evidence Kernel.
 * Defines all types required for deterministic research metadata orchestration.
 *
 * This module is purely structural. It contains no runtime logic,
 * no mutable state, no external dependencies, and no probabilistic behavior.
 */

// ---------------------------------------------------------------------------
// Research Source Types (canonical hierarchy)
// ---------------------------------------------------------------------------

export const CANONICAL_SOURCE_TYPES = [
  'peer_reviewed_journal',
  'conference_paper',
  'academic_book',
  'official_textbook',
  'official_documentation',
  'benchmark_documentation',
  'standards_body',
  'framework_maintainer',
  'survey',
  'technical_report',
  'engineering_blog',
  'academic_paper',
] as const;

export type ResearchSourceType = (typeof CANONICAL_SOURCE_TYPES)[number];

// ---------------------------------------------------------------------------
// Research Evidence Levels
// ---------------------------------------------------------------------------

export const CANONICAL_EVIDENCE_LEVELS = [
  'primary',
  'secondary',
  'supporting',
] as const;

export type ResearchEvidenceLevel = (typeof CANONICAL_EVIDENCE_LEVELS)[number];

// ---------------------------------------------------------------------------
// Research Reference
// ---------------------------------------------------------------------------

export interface ResearchReference {
  readonly id: string;
  readonly referenceId?: string;
  readonly title: string;
  readonly authors: readonly string[];
  readonly publicationYear: number;
  readonly sourceType: ResearchSourceType;
  readonly evidenceLevel?: string;
  readonly reviewStatus?: string;
  readonly verificationDate?: string;
  readonly governanceStatus?: ResearchGovernanceStatus;
  readonly doi?: string;
  readonly isbn?: string;
  readonly publisher?: string;
  readonly venue?: string;
  readonly officialUrl?: string;
  readonly edition?: string;
  readonly language?: string;
  readonly license?: string;
  readonly persistentIdentifier?: string;
}

// ---------------------------------------------------------------------------
// Research Evidence Metadata
// ---------------------------------------------------------------------------

export interface ResearchEvidenceMetadata {
  readonly title: string;
  readonly authors: readonly string[];
  readonly publicationYear: number;
  readonly sourceType: ResearchSourceType;
  readonly evidenceLevel: ResearchEvidenceLevel;
  readonly doi?: string;
  readonly isbn?: string;
  readonly publisher?: string;
  readonly venue?: string;
  readonly officialUrl?: string;
  readonly reviewStatus: ResearchReviewStatus;
  readonly verificationDate: string;
  readonly governanceStatus: ResearchGovernanceStatus;
  readonly edition?: string;
  readonly language?: string;
  readonly license?: string;
  readonly persistentIdentifier?: string;
  readonly notes?: string;
}

// ---------------------------------------------------------------------------
// Research Review Status
// ---------------------------------------------------------------------------

export const CANONICAL_REVIEW_STATUSES = [
  'peer_reviewed',
  'editorially_reviewed',
  'community_reviewed',
  'self_published',
  'unreviewed',
] as const;

export type ResearchReviewStatus = (typeof CANONICAL_REVIEW_STATUSES)[number];

// ---------------------------------------------------------------------------
// Research Governance Status
// ---------------------------------------------------------------------------

export const CANONICAL_GOVERNANCE_STATUSES = [
  'canonical',
  'accepted',
  'provisional',
  'deprecated',
  'rejected',
] as const;

export type ResearchGovernanceStatus = (typeof CANONICAL_GOVERNANCE_STATUSES)[number];

// ---------------------------------------------------------------------------
// Research Evidence Chain
// ---------------------------------------------------------------------------

export interface ResearchEvidenceChainLink {
  readonly entityType: 'lesson' | 'concept' | 'evidence' | 'reference';
  readonly entityId: string;
  readonly label: string;
  readonly source: string;
}

export interface ResearchEvidenceChain {
  readonly chainId: string;
  readonly links: readonly ResearchEvidenceChainLink[];
  readonly rootEntityType: 'lesson' | 'concept';
  readonly rootEntityId: string;
}

// ---------------------------------------------------------------------------
// Research Evidence Status
// ---------------------------------------------------------------------------

export type ResearchEvidenceStatus = 'validated' | 'pending' | 'invalid' | 'deprecated';

// ---------------------------------------------------------------------------
// Research Evidence Decision
// ---------------------------------------------------------------------------

export interface ResearchEvidenceDecision {
  readonly evidenceId: string;
  readonly referenceId: string;
  readonly status: ResearchEvidenceStatus;
  readonly evidenceLevel: ResearchEvidenceLevel;
  readonly sourceType: ResearchSourceType;
  readonly validationPassed: boolean;
  readonly validationErrors: readonly string[];
}

// ---------------------------------------------------------------------------
// Research Evidence Trace
// ---------------------------------------------------------------------------

export interface ResearchEvidenceTrace {
  readonly traceId: string;
  readonly evidenceCount: number;
  readonly validatedCount: number;
  readonly pendingCount: number;
  readonly invalidCount: number;
  readonly deprecatedCount: number;
  readonly decisions: readonly ResearchEvidenceDecision[];
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Research Evidence Input
// ---------------------------------------------------------------------------

export interface ResearchEvidenceInput {
  readonly conceptId: string;
  readonly conceptLabel: string;
  readonly references: readonly ResearchReference[];
  readonly evidenceLevel: ResearchEvidenceLevel;
  readonly chainLinks: readonly ResearchEvidenceChainLink[];
}

// ---------------------------------------------------------------------------
// Research Artifact With Evidence
// ---------------------------------------------------------------------------

export interface ResearchArtifactWithEvidence {
  readonly artifactId: string;
  readonly artifactType: 'lesson' | 'concept' | 'visualization' | 'laboratory';
  readonly evidenceMetadata: readonly ResearchEvidenceMetadata[];
  readonly evidenceChain: ResearchEvidenceChain;
  readonly evidenceTrace: ResearchEvidenceTrace;
}

// ---------------------------------------------------------------------------
// Research Evidence Validation Result
// ---------------------------------------------------------------------------

export interface ResearchEvidenceValidationError {
  readonly code: string;
  readonly message: string;
  readonly field?: string;
  readonly referenceId?: string;
}

export interface ResearchEvidenceValidationResult {
  readonly valid: boolean;
  readonly errors: readonly ResearchEvidenceValidationError[];
  readonly checkedAt: 'evidence_composition';
}

// ---------------------------------------------------------------------------
// Research Source Hierarchy (deterministic ordering)
// ---------------------------------------------------------------------------

export const SOURCE_HIERARCHY_ORDER: readonly ResearchSourceType[] = [
  'peer_reviewed_journal',
  'conference_paper',
  'academic_book',
  'official_textbook',
  'official_documentation',
  'benchmark_documentation',
  'standards_body',
  'framework_maintainer',
  'survey',
  'technical_report',
  'engineering_blog',
];

// ---------------------------------------------------------------------------
// Research Trace Metadata
// ---------------------------------------------------------------------------

export interface ResearchTraceMetadata {
  readonly kernelVersion: string;
  readonly evidenceCount: number;
  readonly referenceCount: number;
  readonly chainCount: number;
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ============================================================================
// D2-OPT-02 — Scientific Lineage Orchestration Types
// ============================================================================

// ---------------------------------------------------------------------------
// Research Lineage Relation Types (canonical)
// ---------------------------------------------------------------------------

export const CANONICAL_LINEAGE_RELATIONS = [
  'predecessor',
  'successor',
  'derived_from',
  'refines',
  'extends',
  'supersedes',
  'inspired_by',
  'parallel_to',
] as const;

export type ResearchLineageRelationType = (typeof CANONICAL_LINEAGE_RELATIONS)[number];

// ---------------------------------------------------------------------------
// Research Lineage Node
// ---------------------------------------------------------------------------

export interface ResearchLineageNode {
  readonly nodeId: string;
  readonly referenceId: string;
  readonly title: string;
  readonly sourceType: ResearchSourceType;
  readonly evidenceLevel: ResearchEvidenceLevel;
  readonly governanceStatus: ResearchGovernanceStatus;
}

// ---------------------------------------------------------------------------
// Research Lineage Edge
// ---------------------------------------------------------------------------

export interface ResearchLineageEdge {
  readonly edgeId: string;
  readonly sourceNodeId: string;
  readonly targetNodeId: string;
  readonly relationType: ResearchLineageRelationType;
  readonly provenance: ResearchLineageProvenance;
  readonly governanceStatus: ResearchGovernanceStatus;
}

// ---------------------------------------------------------------------------
// Research Lineage Provenance
// ---------------------------------------------------------------------------

export interface ResearchLineageProvenance {
  readonly sourceReferenceId: string;
  readonly targetReferenceId: string;
  readonly relationType: ResearchLineageRelationType;
  readonly governanceStatus: ResearchGovernanceStatus;
  readonly rationale: string;
  readonly providedBy: string;
}

// ---------------------------------------------------------------------------
// Research Lineage Graph
// ---------------------------------------------------------------------------

export interface ResearchLineageGraph {
  readonly graphId: string;
  readonly nodes: readonly ResearchLineageNode[];
  readonly edges: readonly ResearchLineageEdge[];
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_lineage_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Research Lineage Decision
// ---------------------------------------------------------------------------

export interface ResearchLineageDecision {
  readonly decisionId: string;
  readonly sourceReferenceId: string;
  readonly targetReferenceId: string;
  readonly relationType: ResearchLineageRelationType;
  readonly provenance: ResearchLineageProvenance;
  readonly validationPassed: boolean;
  readonly validationErrors: readonly string[];
}

// ---------------------------------------------------------------------------
// Research Lineage Trace
// ---------------------------------------------------------------------------

export interface ResearchLineageTrace {
  readonly traceId: string;
  readonly nodeCount: number;
  readonly edgeCount: number;
  readonly decisionsCount: number;
  readonly validatedCount: number;
  readonly invalidCount: number;
  readonly decisions: readonly ResearchLineageDecision[];
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_lineage_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Research Lineage Input
// ---------------------------------------------------------------------------

export interface ResearchLineageInput {
  readonly conceptId: string;
  readonly conceptLabel: string;
  readonly nodes: readonly ResearchLineageNode[];
  readonly edges: readonly ResearchLineageEdge[];
}

// ---------------------------------------------------------------------------
// Research Artifact With Lineage
// ---------------------------------------------------------------------------

export interface ResearchArtifactWithLineage {
  readonly artifactId: string;
  readonly artifactType: 'lesson' | 'concept' | 'visualization' | 'laboratory';
  readonly lineageGraph: ResearchLineageGraph;
  readonly lineageTrace: ResearchLineageTrace;
}

// ---------------------------------------------------------------------------
// Research Lineage Validation Result
// ---------------------------------------------------------------------------

export interface ResearchLineageValidationError {
  readonly code: string;
  readonly message: string;
  readonly field?: string;
  readonly nodeId?: string;
  readonly edgeId?: string;
}

export interface ResearchLineageValidationResult {
  readonly valid: boolean;
  readonly errors: readonly ResearchLineageValidationError[];
  readonly checkedAt: 'lineage_composition';
}

// ---------------------------------------------------------------------------
// Research Lineage Status
// ---------------------------------------------------------------------------

export type ResearchLineageStatus = 'validated' | 'pending' | 'invalid' | 'deprecated';

// ============================================================================
// D2-OPT-03 — Structured Method Comparison Engine Types
// ============================================================================

// ---------------------------------------------------------------------------
// Research Comparison Dimensions (canonical)
// ---------------------------------------------------------------------------

export const CANONICAL_COMPARISON_DIMENSIONS = [
  'problem_scope',
  'core_assumption',
  'algorithmic_family',
  'computational_complexity',
  'memory_complexity',
  'training_requirements',
  'data_requirements',
  'interpretability',
  'robustness',
  'generalization',
  'limitations',
  'strengths',
  'typical_use_cases',
  'research_maturity',
] as const;

export type ResearchComparisonDimension = (typeof CANONICAL_COMPARISON_DIMENSIONS)[number];

// ---------------------------------------------------------------------------
// Research Comparison Attribute
// ---------------------------------------------------------------------------

export interface ResearchComparisonAttribute {
  readonly attributeId: string;
  readonly dimension: ResearchComparisonDimension;
  readonly value: string;
  readonly evidenceReferenceId: string;
  readonly governanceStatus: ResearchGovernanceStatus;
}

// ---------------------------------------------------------------------------
// Research Comparison Value
// ---------------------------------------------------------------------------

export interface ResearchComparisonValue {
  readonly dimension: ResearchComparisonDimension;
  readonly attributes: readonly ResearchComparisonAttribute[];
}

// ---------------------------------------------------------------------------
// Research Comparison Entry
// ---------------------------------------------------------------------------

export interface ResearchComparisonEntry {
  readonly entryId: string;
  readonly methodReferenceId: string;
  readonly methodTitle: string;
  readonly evidenceReferenceId: string;
  readonly lineageReferenceId: string;
  readonly comparisonValues: readonly ResearchComparisonValue[];
  readonly provenance: ResearchComparisonProvenance;
  readonly governanceStatus: ResearchGovernanceStatus;
}

// ---------------------------------------------------------------------------
// Research Comparison Provenance
// ---------------------------------------------------------------------------

export interface ResearchComparisonProvenance {
  readonly methodReferenceId: string;
  readonly evidenceReferenceId: string;
  readonly lineageReferenceId: string;
  readonly comparisonDimension: ResearchComparisonDimension;
  readonly source: string;
  readonly governanceStatus: ResearchGovernanceStatus;
  readonly rationale: string;
}

// ---------------------------------------------------------------------------
// Research Comparison Matrix
// ---------------------------------------------------------------------------

export interface ResearchComparisonMatrix {
  readonly matrixId: string;
  readonly methods: readonly string[];
  readonly dimensions: readonly ResearchComparisonDimension[];
  readonly entries: readonly ResearchComparisonEntry[];
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_comparison_engine';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Research Comparison Decision
// ---------------------------------------------------------------------------

export interface ResearchComparisonDecision {
  readonly decisionId: string;
  readonly methodReferenceId: string;
  readonly comparisonDimension: ResearchComparisonDimension;
  readonly validationPassed: boolean;
  readonly validationErrors: readonly string[];
}

// ---------------------------------------------------------------------------
// Research Comparison Trace
// ---------------------------------------------------------------------------

export interface ResearchComparisonTrace {
  readonly traceId: string;
  readonly methodCount: number;
  readonly dimensionCount: number;
  readonly entryCount: number;
  readonly validatedCount: number;
  readonly invalidCount: number;
  readonly decisions: readonly ResearchComparisonDecision[];
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_comparison_engine';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Research Comparison Input
// ---------------------------------------------------------------------------

export interface ResearchComparisonInput {
  readonly conceptId: string;
  readonly conceptLabel: string;
  readonly entries: readonly ResearchComparisonEntry[];
  readonly dimensions: readonly ResearchComparisonDimension[];
}

// ---------------------------------------------------------------------------
// Research Artifact With Comparison
// ---------------------------------------------------------------------------

export interface ResearchArtifactWithComparison {
  readonly artifactId: string;
  readonly artifactType: 'lesson' | 'concept' | 'visualization' | 'laboratory';
  readonly comparisonMatrix: ResearchComparisonMatrix;
  readonly comparisonTrace: ResearchComparisonTrace;
}

// ---------------------------------------------------------------------------
// Research Comparison Validation Result
// ---------------------------------------------------------------------------

export interface ResearchComparisonValidationError {
  readonly code: string;
  readonly message: string;
  readonly field?: string;
  readonly methodReferenceId?: string;
  readonly dimension?: string;
}

export interface ResearchComparisonValidationResult {
  readonly valid: boolean;
  readonly errors: readonly ResearchComparisonValidationError[];
  readonly checkedAt: 'comparison_composition';
}

// ---------------------------------------------------------------------------
// Research Comparison Status
// ---------------------------------------------------------------------------

export type ResearchComparisonStatus = 'validated' | 'pending' | 'invalid' | 'deprecated';

// ============================================================================
// D2-OPT-04 — Research Timeline Orchestration Types
// ============================================================================

// ---------------------------------------------------------------------------
// Research Timeline Event Types (canonical)
// ---------------------------------------------------------------------------

export const CANONICAL_TIMELINE_EVENT_TYPES = [
  'publication',
  'conference_presentation',
  'journal_publication',
  'book_release',
  'dataset_release',
  'benchmark_release',
  'framework_release',
  'standard_release',
  'major_revision',
  'deprecation',
  'superseded',
  'historical_milestone',
] as const;

export type ResearchTimelineEventType = (typeof CANONICAL_TIMELINE_EVENT_TYPES)[number];

// ---------------------------------------------------------------------------
// Research Chronological Reference
// ---------------------------------------------------------------------------

export interface ResearchChronologicalReference {
  readonly referenceId: string;
  readonly publicationYear: number;
  readonly publicationMonth?: number;
  readonly publicationDay?: number;
}

// ---------------------------------------------------------------------------
// Research Timeline Event
// ---------------------------------------------------------------------------

export interface ResearchTimelineEvent {
  readonly eventId: string;
  readonly eventType: ResearchTimelineEventType;
  readonly referenceId: string;
  readonly title: string;
  readonly year?: number;
  readonly source?: string;
  readonly providedBy?: string;
  readonly rationale?: string;
  readonly publicationYear: number;
  readonly publicationMonth?: number;
  readonly publicationDay?: number;
  readonly provenance: ResearchTimelineProvenance;
  readonly governanceStatus: ResearchGovernanceStatus;
}

// ---------------------------------------------------------------------------
// Research Timeline Provenance
// ---------------------------------------------------------------------------

export interface ResearchTimelineProvenance {
  readonly referenceId: string;
  readonly eventType: ResearchTimelineEventType;
  readonly source: string;
  readonly providedBy?: string;
  readonly rationale: string;
  readonly governanceStatus: ResearchGovernanceStatus;
  readonly publicationYear: number;
  readonly publicationMonth?: number;
  readonly publicationDay?: number;
}

// ---------------------------------------------------------------------------
// Research Timeline Node
// ---------------------------------------------------------------------------

export interface ResearchTimelineNode {
  readonly nodeId: string;
  readonly referenceId: string;
  readonly title: string;
  readonly eventType: ResearchTimelineEventType;
  readonly publicationYear: number;
  readonly publicationMonth?: number;
  readonly publicationDay?: number;
  readonly governanceStatus: ResearchGovernanceStatus;
}

// ---------------------------------------------------------------------------
// Research Timeline
// ---------------------------------------------------------------------------

export interface ResearchTimeline {
  readonly timelineId: string;
  readonly events: readonly ResearchTimelineEvent[];
  readonly nodes: readonly ResearchTimelineNode[];
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_timeline_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Research Timeline Decision
// ---------------------------------------------------------------------------

export interface ResearchTimelineDecision {
  readonly decisionId: string;
  readonly eventId: string;
  readonly eventType: ResearchTimelineEventType;
  readonly validationPassed: boolean;
  readonly validationErrors: readonly string[];
}

// ---------------------------------------------------------------------------
// Research Timeline Trace
// ---------------------------------------------------------------------------

export interface ResearchTimelineTrace {
  readonly traceId: string;
  readonly eventCount: number;
  readonly validatedCount: number;
  readonly invalidCount: number;
  readonly decisions: readonly ResearchTimelineDecision[];
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_timeline_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Research Timeline Input
// ---------------------------------------------------------------------------

export interface ResearchTimelineInput {
  readonly conceptId: string;
  readonly conceptLabel: string;
  readonly events: readonly ResearchTimelineEvent[];
}

// ---------------------------------------------------------------------------
// Research Artifact With Timeline
// ---------------------------------------------------------------------------

export interface ResearchArtifactWithTimeline {
  readonly artifactId: string;
  readonly artifactType: 'lesson' | 'concept' | 'visualization' | 'laboratory';
  readonly timeline: ResearchTimeline;
  readonly timelineTrace: ResearchTimelineTrace;
}

// ---------------------------------------------------------------------------
// Research Timeline Validation Result
// ---------------------------------------------------------------------------

export interface ResearchTimelineValidationError {
  readonly code: string;
  readonly message: string;
  readonly field?: string;
  readonly eventId?: string;
}

export interface ResearchTimelineValidationResult {
  readonly valid: boolean;
  readonly errors: readonly ResearchTimelineValidationError[];
  readonly checkedAt: 'timeline_composition';
}

// ---------------------------------------------------------------------------
// Research Timeline Status
// ---------------------------------------------------------------------------

export type ResearchTimelineStatus = 'validated' | 'pending' | 'invalid' | 'deprecated';

// ============================================================================
// D2-OPT-05 — Benchmark Intelligence Orchestration Types
// ============================================================================

// ---------------------------------------------------------------------------
// Research Benchmark Categories (canonical)
// ---------------------------------------------------------------------------

export const CANONICAL_BENCHMARK_CATEGORIES = [
  'classification',
  'regression',
  'object_detection',
  'image_segmentation',
  'language_understanding',
  'language_generation',
  'retrieval',
  'reasoning',
  'planning',
  'reinforcement_learning',
  'multimodal',
  'speech',
  'time_series',
  'recommendation',
] as const;

export type ResearchBenchmarkCategory = (typeof CANONICAL_BENCHMARK_CATEGORIES)[number];

// ---------------------------------------------------------------------------
// Research Benchmark Types (canonical)
// ---------------------------------------------------------------------------

export const CANONICAL_BENCHMARK_TYPES = [
  'academic',
  'industry',
  'competition',
  'standardized',
  'historical',
  'reference',
] as const;

export type ResearchBenchmarkType = (typeof CANONICAL_BENCHMARK_TYPES)[number];

// ---------------------------------------------------------------------------
// Research Benchmark Provenance
// ---------------------------------------------------------------------------

export interface ResearchBenchmarkProvenance {
  readonly benchmarkId: string;
  readonly referenceId: string;
  readonly source: string;
  readonly governanceStatus: ResearchGovernanceStatus;
  readonly benchmarkCategory: ResearchBenchmarkCategory;
  readonly benchmarkType: ResearchBenchmarkType;
  readonly rationale: string;
}

// ---------------------------------------------------------------------------
// Research Benchmark
// ---------------------------------------------------------------------------

export interface ResearchBenchmark {
  readonly benchmarkId: string;
  readonly benchmarkName: string;
  readonly benchmarkCategory: ResearchBenchmarkCategory;
  readonly benchmarkType: ResearchBenchmarkType;
  readonly associatedMethods: readonly string[];
  readonly associatedEvidence: readonly string[];
  readonly officialSource: string;
  readonly governanceStatus: ResearchGovernanceStatus;
  readonly lifecycle: 'active' | 'deprecated' | 'historical';
  readonly rationale: string;
  readonly provenance: ResearchBenchmarkProvenance;
}

// ---------------------------------------------------------------------------
// Research Benchmark Reference
// ---------------------------------------------------------------------------

export interface ResearchBenchmarkReference {
  readonly referenceId: string;
  readonly benchmarkId: string;
  readonly benchmarkName: string;
  readonly benchmarkCategory: ResearchBenchmarkCategory;
  readonly benchmarkType: ResearchBenchmarkType;
}

// ---------------------------------------------------------------------------
// Research Benchmark Decision
// ---------------------------------------------------------------------------

export interface ResearchBenchmarkDecision {
  readonly decisionId: string;
  readonly benchmarkId: string;
  readonly benchmarkName: string;
  readonly validationPassed: boolean;
  readonly validationErrors: readonly string[];
}

// ---------------------------------------------------------------------------
// Research Benchmark Trace
// ---------------------------------------------------------------------------

export interface ResearchBenchmarkTrace {
  readonly traceId: string;
  readonly benchmarkCount: number;
  readonly validatedCount: number;
  readonly invalidCount: number;
  readonly decisions: readonly ResearchBenchmarkDecision[];
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_benchmark_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Research Benchmark Registry
// ---------------------------------------------------------------------------

export interface ResearchBenchmarkRegistry {
  readonly registryId: string;
  readonly benchmarks: readonly ResearchBenchmark[];
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_benchmark_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Research Benchmark Input
// ---------------------------------------------------------------------------

export interface ResearchBenchmarkInput {
  readonly conceptId: string;
  readonly conceptLabel: string;
  readonly benchmarks: readonly ResearchBenchmark[];
}

// ---------------------------------------------------------------------------
// Research Artifact With Benchmarks
// ---------------------------------------------------------------------------

export interface ResearchArtifactWithBenchmarks {
  readonly artifactId: string;
  readonly artifactType: 'lesson' | 'concept' | 'visualization' | 'laboratory';
  readonly benchmarkRegistry: ResearchBenchmarkRegistry;
  readonly benchmarkTrace: ResearchBenchmarkTrace;
}

// ---------------------------------------------------------------------------
// Research Benchmark Validation Result
// ---------------------------------------------------------------------------

export interface ResearchBenchmarkValidationError {
  readonly code: string;
  readonly message: string;
  readonly field?: string;
  readonly benchmarkId?: string;
}

export interface ResearchBenchmarkValidationResult {
  readonly valid: boolean;
  readonly errors: readonly ResearchBenchmarkValidationError[];
  readonly checkedAt: 'benchmark_composition';
}

// ---------------------------------------------------------------------------
// Research Benchmark Status
// ---------------------------------------------------------------------------

export type ResearchBenchmarkStatus = 'validated' | 'pending' | 'invalid' | 'deprecated';

// ============================================================================
// D2-OPT-06 — Dataset Mapping Orchestration Types
// ============================================================================

// ---------------------------------------------------------------------------
// Research Dataset Domains (canonical)
// ---------------------------------------------------------------------------

export const CANONICAL_DATASET_DOMAINS = [
  'computer_vision',
  'natural_language_processing',
  'speech',
  'audio',
  'multimodal',
  'robotics',
  'reinforcement_learning',
  'tabular',
  'graph',
  'timeseries',
  'recommendation',
  'scientific_computing',
] as const;

export type ResearchDatasetDomain = (typeof CANONICAL_DATASET_DOMAINS)[number];

// ---------------------------------------------------------------------------
// Research Dataset Tasks (canonical)
// ---------------------------------------------------------------------------

export const CANONICAL_DATASET_TASKS = [
  'classification',
  'regression',
  'object_detection',
  'image_segmentation',
  'instance_segmentation',
  'semantic_segmentation',
  'language_modeling',
  'translation',
  'question_answering',
  'retrieval',
  'reasoning',
  'planning',
  'speech_recognition',
  'speech_synthesis',
  'forecasting',
  'recommendation',
] as const;

export type ResearchDatasetTask = (typeof CANONICAL_DATASET_TASKS)[number];

// ---------------------------------------------------------------------------
// Research Dataset Annotation Types (canonical)
// ---------------------------------------------------------------------------

export const CANONICAL_DATASET_ANNOTATION_TYPES = [
  'manual',
  'semi_automatic',
  'automatic',
  'synthetic',
  'expert_reviewed',
  'crowdsourced',
] as const;

export type ResearchDatasetAnnotationType = (typeof CANONICAL_DATASET_ANNOTATION_TYPES)[number];

// ---------------------------------------------------------------------------
// Research Dataset Licenses (canonical)
// ---------------------------------------------------------------------------

export const CANONICAL_DATASET_LICENSES = [
  'cc_by_4_0',
  'cc_by_sa_4_0',
  'cc_by_nc_4_0',
  'cc0_1_0',
  'apache_2_0',
  'mit',
  'gpl_3_0',
  'proprietary',
  'custom',
] as const;

export type ResearchDatasetLicense = (typeof CANONICAL_DATASET_LICENSES)[number];

// ---------------------------------------------------------------------------
// Research Dataset Scale (canonical)
// ---------------------------------------------------------------------------

export const CANONICAL_DATASET_SCALES = [
  'toy',
  'small',
  'medium',
  'large',
  'very_large',
  'web_scale',
] as const;

export type ResearchDatasetScale = (typeof CANONICAL_DATASET_SCALES)[number];

// ---------------------------------------------------------------------------
// Research Dataset Provenance
// ---------------------------------------------------------------------------

export interface ResearchDatasetProvenance {
  readonly datasetId: string;
  readonly referenceId: string;
  readonly source: string;
  readonly governanceStatus: ResearchGovernanceStatus;
  readonly domain: ResearchDatasetDomain;
  readonly primaryTask: ResearchDatasetTask;
  readonly publicationYear: number;
  readonly rationale: string;
}

// ---------------------------------------------------------------------------
// Research Dataset
// ---------------------------------------------------------------------------

export interface ResearchDataset {
  readonly datasetId: string;
  readonly datasetName: string;
  readonly domain: ResearchDatasetDomain;
  readonly primaryTask: ResearchDatasetTask;
  readonly supportedTasks: readonly ResearchDatasetTask[];
  readonly annotationType: ResearchDatasetAnnotationType;
  readonly license: ResearchDatasetLicense;
  readonly scale: ResearchDatasetScale;
  readonly publicationYear: number;
  readonly officialSource: string;
  readonly associatedEvidence: readonly string[];
  readonly associatedBenchmarks: readonly string[];
  readonly associatedMethods: readonly string[];
  readonly governanceStatus: ResearchGovernanceStatus;
  readonly lifecycle: 'active' | 'deprecated' | 'historical';
  readonly rationale: string;
  readonly provenance: ResearchDatasetProvenance;
}

// ---------------------------------------------------------------------------
// Research Dataset Reference
// ---------------------------------------------------------------------------

export interface ResearchDatasetReference {
  readonly referenceId: string;
  readonly datasetId: string;
  readonly datasetName: string;
  readonly domain: ResearchDatasetDomain;
  readonly primaryTask: ResearchDatasetTask;
}

// ---------------------------------------------------------------------------
// Research Dataset Decision
// ---------------------------------------------------------------------------

export interface ResearchDatasetDecision {
  readonly decisionId: string;
  readonly datasetId: string;
  readonly datasetName: string;
  readonly validationPassed: boolean;
  readonly validationErrors: readonly string[];
}

// ---------------------------------------------------------------------------
// Research Dataset Trace
// ---------------------------------------------------------------------------

export interface ResearchDatasetTrace {
  readonly traceId: string;
  readonly datasetCount: number;
  readonly validatedCount: number;
  readonly invalidCount: number;
  readonly decisions: readonly ResearchDatasetDecision[];
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_dataset_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Research Dataset Registry
// ---------------------------------------------------------------------------

export interface ResearchDatasetRegistry {
  readonly registryId: string;
  readonly datasets: readonly ResearchDataset[];
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_dataset_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Research Dataset Input
// ---------------------------------------------------------------------------

export interface ResearchDatasetInput {
  readonly conceptId: string;
  readonly conceptLabel: string;
  readonly datasets: readonly ResearchDataset[];
}

// ---------------------------------------------------------------------------
// Research Artifact With Datasets
// ---------------------------------------------------------------------------

export interface ResearchArtifactWithDatasets {
  readonly artifactId: string;
  readonly artifactType: 'lesson' | 'concept' | 'visualization' | 'laboratory';
  readonly datasetRegistry: ResearchDatasetRegistry;
  readonly datasetTrace: ResearchDatasetTrace;
}

// ---------------------------------------------------------------------------
// Research Dataset Validation Result
// ---------------------------------------------------------------------------

export interface ResearchDatasetValidationError {
  readonly code: string;
  readonly message: string;
  readonly field?: string;
  readonly datasetId?: string;
}

export interface ResearchDatasetValidationResult {
  readonly valid: boolean;
  readonly errors: readonly ResearchDatasetValidationError[];
  readonly checkedAt: 'dataset_composition';
}

// ---------------------------------------------------------------------------
// Research Dataset Status
// ---------------------------------------------------------------------------

export type ResearchDatasetStatus = 'validated' | 'pending' | 'invalid' | 'deprecated';

// ============================================================================
// D2-OPT-07 — Industry Adoption Intelligence Orchestration Types
// ============================================================================

// ---------------------------------------------------------------------------
// Research Industry Sectors (canonical)
// ---------------------------------------------------------------------------

export const CANONICAL_INDUSTRY_SECTORS = [
  'healthcare',
  'finance',
  'manufacturing',
  'automotive',
  'robotics',
  'agriculture',
  'education',
  'cybersecurity',
  'telecommunications',
  'retail',
  'logistics',
  'energy',
  'government',
  'scientific_research',
] as const;

export type ResearchIndustrySector = (typeof CANONICAL_INDUSTRY_SECTORS)[number];

// ---------------------------------------------------------------------------
// Research Adoption Types (canonical)
// ---------------------------------------------------------------------------

export const CANONICAL_ADOPTION_TYPES = [
  'research_only',
  'prototype',
  'pilot',
  'production',
  'standard_practice',
  'legacy',
  'deprecated',
] as const;

export type ResearchAdoptionType = (typeof CANONICAL_ADOPTION_TYPES)[number];

// ---------------------------------------------------------------------------
// Research Adoption Stages (canonical)
// ---------------------------------------------------------------------------

export const CANONICAL_ADOPTION_STAGES = [
  'experimental',
  'emerging',
  'growing',
  'established',
  'mature',
] as const;

export type ResearchAdoptionStage = (typeof CANONICAL_ADOPTION_STAGES)[number];

// ---------------------------------------------------------------------------
// Research Industry Use Case
// ---------------------------------------------------------------------------

export interface ResearchIndustryUseCase {
  readonly useCaseId: string;
  readonly title: string;
  readonly description: string;
  readonly sector: ResearchIndustrySector;
  readonly adoptionType: ResearchAdoptionType;
  readonly adoptionStage: ResearchAdoptionStage;
  readonly associatedMethods: readonly string[];
  readonly rationale: string;
}

// ---------------------------------------------------------------------------
// Research Industry Provenance
// ---------------------------------------------------------------------------

export interface ResearchIndustryProvenance {
  readonly industryId: string;
  readonly referenceId: string;
  readonly source: string;
  readonly governanceStatus: ResearchGovernanceStatus;
  readonly sector: ResearchIndustrySector;
  readonly adoptionType: ResearchAdoptionType;
  readonly adoptionStage: ResearchAdoptionStage;
  readonly rationale: string;
}

// ---------------------------------------------------------------------------
// Research Industry Reference
// ---------------------------------------------------------------------------

export interface ResearchIndustryReference {
  readonly industryId: string;
  readonly sector: ResearchIndustrySector;
  readonly adoptionType: ResearchAdoptionType;
  readonly adoptionStage: ResearchAdoptionStage;
  readonly useCases: readonly ResearchIndustryUseCase[];
  readonly associatedMethods: readonly string[];
  readonly associatedEvidence: readonly string[];
  readonly associatedBenchmarks: readonly string[];
  readonly associatedDatasets: readonly string[];
  readonly officialSource: string;
  readonly governanceStatus: ResearchGovernanceStatus;
  readonly lifecycle: 'active' | 'deprecated' | 'historical';
  readonly rationale: string;
  readonly provenance: ResearchIndustryProvenance;
}

// ---------------------------------------------------------------------------
// Research Industry Decision
// ---------------------------------------------------------------------------

export interface ResearchIndustryDecision {
  readonly decisionId: string;
  readonly industryId: string;
  readonly sector: ResearchIndustrySector;
  readonly validationPassed: boolean;
  readonly validationErrors: readonly string[];
}

// ---------------------------------------------------------------------------
// Research Industry Trace
// ---------------------------------------------------------------------------

export interface ResearchIndustryTrace {
  readonly traceId: string;
  readonly recordCount: number;
  readonly validatedCount: number;
  readonly invalidCount: number;
  readonly decisions: readonly ResearchIndustryDecision[];
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_industry_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Research Industry Registry
// ---------------------------------------------------------------------------

export interface ResearchIndustryRegistry {
  readonly registryId: string;
  readonly records: readonly ResearchIndustryReference[];
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_industry_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Research Industry Input
// ---------------------------------------------------------------------------

export interface ResearchIndustryInput {
  readonly conceptId: string;
  readonly conceptLabel: string;
  readonly records: readonly ResearchIndustryReference[];
}

// ---------------------------------------------------------------------------
// Research Artifact With Industry
// ---------------------------------------------------------------------------

export interface ResearchArtifactWithIndustry {
  readonly artifactId: string;
  readonly artifactType: 'lesson' | 'concept' | 'visualization' | 'laboratory';
  readonly industryRegistry: ResearchIndustryRegistry;
  readonly industryTrace: ResearchIndustryTrace;
}

// ---------------------------------------------------------------------------
// Research Industry Validation Result
// ---------------------------------------------------------------------------

export interface ResearchIndustryValidationError {
  readonly code: string;
  readonly message: string;
  readonly field?: string;
  readonly industryId?: string;
}

export interface ResearchIndustryValidationResult {
  readonly valid: boolean;
  readonly errors: readonly ResearchIndustryValidationError[];
  readonly checkedAt: 'industry_composition';
}

// ---------------------------------------------------------------------------
// Research Industry Status
// ---------------------------------------------------------------------------

export type ResearchIndustryStatus = 'validated' | 'pending' | 'invalid' | 'deprecated';

// ============================================================================
// D2-OPT-08 — Scientific Evolution Mapping Orchestration Types
// ============================================================================

// ---------------------------------------------------------------------------
// Research Evolution Relation Types (canonical)
// ---------------------------------------------------------------------------

export const CANONICAL_EVOLUTION_RELATIONS = [
  'introduced',
  'extended',
  'refined',
  'generalized',
  'specialized',
  'superseded',
  'replaced',
  'merged_into',
  'split_from',
  'inspired',
  'standardized',
  'deprecated',
] as const;

export type ResearchEvolutionRelationType = (typeof CANONICAL_EVOLUTION_RELATIONS)[number];

// ---------------------------------------------------------------------------
// Research Evolution Node Types (canonical)
// ---------------------------------------------------------------------------

export const CANONICAL_EVOLUTION_NODE_TYPES = [
  'method',
  'concept',
  'benchmark',
  'dataset',
  'milestone',
  'publication',
] as const;

export type ResearchEvolutionNodeType = (typeof CANONICAL_EVOLUTION_NODE_TYPES)[number];

// ---------------------------------------------------------------------------
// Research Evolution Node
// ---------------------------------------------------------------------------

export interface ResearchEvolutionNode {
  readonly nodeId: string;
  readonly nodeType: ResearchEvolutionNodeType;
  readonly title: string;
  readonly referenceId: string;
  readonly governanceStatus: ResearchGovernanceStatus;
  readonly rationale: string;
}

// ---------------------------------------------------------------------------
// Research Evolution Provenance
// ---------------------------------------------------------------------------

export interface ResearchEvolutionProvenance {
  readonly edgeId: string;
  readonly referenceId: string;
  readonly source: string;
  readonly governanceStatus: ResearchGovernanceStatus;
  readonly relationType: ResearchEvolutionRelationType;
  readonly rationale: string;
  readonly providedBy: string;
}

// ---------------------------------------------------------------------------
// Research Evolution Edge
// ---------------------------------------------------------------------------

export interface ResearchEvolutionEdge {
  readonly edgeId: string;
  readonly sourceNodeId: string;
  readonly targetNodeId: string;
  readonly relationType: ResearchEvolutionRelationType;
  readonly referenceId: string;
  readonly governanceStatus: ResearchGovernanceStatus;
  readonly rationale: string;
  readonly providedBy: string;
  readonly provenance: ResearchEvolutionProvenance;
}

// ---------------------------------------------------------------------------
// Research Evolution Graph
// ---------------------------------------------------------------------------

export interface ResearchEvolutionGraph {
  readonly graphId: string;
  readonly nodes: readonly ResearchEvolutionNode[];
  readonly edges: readonly ResearchEvolutionEdge[];
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_evolution_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Research Evolution Decision
// ---------------------------------------------------------------------------

export interface ResearchEvolutionDecision {
  readonly decisionId: string;
  readonly edgeId: string;
  readonly sourceNodeId: string;
  readonly targetNodeId: string;
  readonly relationType: ResearchEvolutionRelationType;
  readonly validationPassed: boolean;
  readonly validationErrors: readonly string[];
}

// ---------------------------------------------------------------------------
// Research Evolution Trace
// ---------------------------------------------------------------------------

export interface ResearchEvolutionTrace {
  readonly traceId: string;
  readonly nodeCount: number;
  readonly edgeCount: number;
  readonly decisionsCount: number;
  readonly validatedCount: number;
  readonly invalidCount: number;
  readonly decisions: readonly ResearchEvolutionDecision[];
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_evolution_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Research Evolution Registry
// ---------------------------------------------------------------------------

export interface ResearchEvolutionRegistry {
  readonly registryId: string;
  readonly graphs: readonly ResearchEvolutionGraph[];
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_evolution_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Research Evolution Input
// ---------------------------------------------------------------------------

export interface ResearchEvolutionInput {
  readonly conceptId: string;
  readonly conceptLabel: string;
  readonly nodes: readonly ResearchEvolutionNode[];
  readonly edges: readonly ResearchEvolutionEdge[];
}

// ---------------------------------------------------------------------------
// Research Artifact With Evolution
// ---------------------------------------------------------------------------

export interface ResearchArtifactWithEvolution {
  readonly artifactId: string;
  readonly artifactType: 'lesson' | 'concept' | 'visualization' | 'laboratory';
  readonly evolutionGraph: ResearchEvolutionGraph;
  readonly evolutionTrace: ResearchEvolutionTrace;
}

// ---------------------------------------------------------------------------
// Research Evolution Validation Result
// ---------------------------------------------------------------------------

export interface ResearchEvolutionValidationError {
  readonly code: string;
  readonly message: string;
  readonly field?: string;
  readonly nodeId?: string;
  readonly edgeId?: string;
}

export interface ResearchEvolutionValidationResult {
  readonly valid: boolean;
  readonly errors: readonly ResearchEvolutionValidationError[];
  readonly checkedAt: 'evolution_composition';
}

// ---------------------------------------------------------------------------
// Research Evolution Status
// ---------------------------------------------------------------------------

export type ResearchEvolutionStatus = 'validated' | 'pending' | 'invalid' | 'deprecated';

// ============================================================================
// D2-OPT-09 — Research Reading Path Orchestration Types
// ============================================================================

// ---------------------------------------------------------------------------
// Research Reading Path Types (canonical)
// ---------------------------------------------------------------------------

export const CANONICAL_READING_PATH_TYPES = [
  'foundational',
  'historical',
  'implementation',
  'mathematical',
  'comparative',
  'survey',
  'benchmark_oriented',
  'dataset_oriented',
  'industry_oriented',
  'advanced',
] as const;

export type ResearchReadingPathType = (typeof CANONICAL_READING_PATH_TYPES)[number];

// ---------------------------------------------------------------------------
// Research Reading Path Stages (canonical)
// ---------------------------------------------------------------------------

export const CANONICAL_READING_PATH_STAGES = [
  'introduction',
  'background',
  'core_foundation',
  'methodology',
  'evaluation',
  'comparison',
  'extensions',
  'applications',
  'limitations',
  'future_directions',
] as const;

export type ResearchReadingPathStage = (typeof CANONICAL_READING_PATH_STAGES)[number];

// ---------------------------------------------------------------------------
// Research Reading Path Node
// ---------------------------------------------------------------------------

export interface ResearchReadingPathNode {
  readonly nodeId: string;
  readonly referenceId: string;
  readonly title: string;
  readonly stage: ResearchReadingPathStage;
  readonly order: number;
  readonly publicationYear: number;
  readonly governanceStatus: ResearchGovernanceStatus;
  readonly rationale: string;
}

// ---------------------------------------------------------------------------
// Research Reading Path Provenance
// ---------------------------------------------------------------------------

export interface ResearchReadingPathProvenance {
  readonly pathId: string;
  readonly referenceId: string;
  readonly source: string;
  readonly governanceStatus: ResearchGovernanceStatus;
  readonly pathType: ResearchReadingPathType;
  readonly rationale: string;
  readonly providedBy: string;
}

// ---------------------------------------------------------------------------
// Research Reading Path
// ---------------------------------------------------------------------------

export interface ResearchReadingPath {
  readonly pathId: string;
  readonly pathType: ResearchReadingPathType;
  readonly title: string;
  readonly description: string;
  readonly orderedNodes: readonly ResearchReadingPathNode[];
  readonly associatedEvidence: readonly string[];
  readonly associatedTimeline: readonly string[];
  readonly associatedBenchmarks: readonly string[];
  readonly associatedDatasets: readonly string[];
  readonly associatedEvolution: readonly string[];
  readonly governanceStatus: ResearchGovernanceStatus;
  readonly lifecycle: 'active' | 'deprecated' | 'historical';
  readonly rationale: string;
  readonly provenance: ResearchReadingPathProvenance;
}

// ---------------------------------------------------------------------------
// Research Reading Path Decision
// ---------------------------------------------------------------------------

export interface ResearchReadingPathDecision {
  readonly decisionId: string;
  readonly pathId: string;
  readonly pathType: ResearchReadingPathType;
  readonly validationPassed: boolean;
  readonly validationErrors: readonly string[];
}

// ---------------------------------------------------------------------------
// Research Reading Path Trace
// ---------------------------------------------------------------------------

export interface ResearchReadingPathTrace {
  readonly traceId: string;
  readonly pathCount: number;
  readonly validatedCount: number;
  readonly invalidCount: number;
  readonly decisions: readonly ResearchReadingPathDecision[];
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_reading_path_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Research Reading Path Registry
// ---------------------------------------------------------------------------

export interface ResearchReadingPathRegistry {
  readonly registryId: string;
  readonly paths: readonly ResearchReadingPath[];
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_reading_path_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Research Reading Path Input
// ---------------------------------------------------------------------------

export interface ResearchReadingPathInput {
  readonly conceptId: string;
  readonly conceptLabel: string;
  readonly paths: readonly ResearchReadingPath[];
}

// ---------------------------------------------------------------------------
// Research Artifact With Reading Paths
// ---------------------------------------------------------------------------

export interface ResearchArtifactWithReadingPaths {
  readonly artifactId: string;
  readonly artifactType: 'lesson' | 'concept' | 'visualization' | 'laboratory';
  readonly readingPathRegistry: ResearchReadingPathRegistry;
  readonly readingPathTrace: ResearchReadingPathTrace;
}

// ---------------------------------------------------------------------------
// Research Reading Path Validation Result
// ---------------------------------------------------------------------------

export interface ResearchReadingPathValidationError {
  readonly code: string;
  readonly message: string;
  readonly field?: string;
  readonly pathId?: string;
}

export interface ResearchReadingPathValidationResult {
  readonly valid: boolean;
  readonly errors: readonly ResearchReadingPathValidationError[];
  readonly checkedAt: 'reading_path_composition';
}

// ---------------------------------------------------------------------------
// Research Reading Path Status
// ---------------------------------------------------------------------------

export type ResearchReadingPathStatus = 'validated' | 'pending' | 'invalid' | 'deprecated';

// ============================================================================
// D2-OPT-10 — Research Laboratory Integration Orchestration Types
// ============================================================================

// ---------------------------------------------------------------------------
// Research Laboratory Types (canonical)
// ---------------------------------------------------------------------------

export const CANONICAL_LABORATORY_TYPES = [
  'algorithm_reproduction',
  'paper_reproduction',
  'concept_visualization',
  'comparative_experiment',
  'parameter_exploration',
  'benchmark_replication',
  'dataset_exploration',
  'ablation_study',
  'failure_analysis',
  'engineering_case',
] as const;

export type ResearchLaboratoryType = (typeof CANONICAL_LABORATORY_TYPES)[number];

// ---------------------------------------------------------------------------
// Research Laboratory Purposes (canonical)
// ---------------------------------------------------------------------------

export const CANONICAL_LABORATORY_PURPOSES = [
  'understanding',
  'validation',
  'comparison',
  'exploration',
  'reproduction',
  'experimentation',
] as const;

export type ResearchLaboratoryPurpose = (typeof CANONICAL_LABORATORY_PURPOSES)[number];

// ---------------------------------------------------------------------------
// Research Laboratory Integration Modes (canonical)
// ---------------------------------------------------------------------------

export const CANONICAL_LABORATORY_INTEGRATION_MODES = [
  'before_reading',
  'during_reading',
  'after_reading',
  'after_comparison',
  'after_benchmark',
  'after_dataset',
  'after_evolution',
] as const;

export type ResearchLaboratoryIntegrationMode = (typeof CANONICAL_LABORATORY_INTEGRATION_MODES)[number];

// ---------------------------------------------------------------------------
// Research Laboratory Provenance
// ---------------------------------------------------------------------------

export interface ResearchLaboratoryProvenance {
  readonly laboratoryId: string;
  readonly referenceId: string;
  readonly source: string;
  readonly governanceStatus: ResearchGovernanceStatus;
  readonly laboratoryType: ResearchLaboratoryType;
  readonly purpose: ResearchLaboratoryPurpose;
  readonly rationale: string;
  readonly providedBy: string;
}

// ---------------------------------------------------------------------------
// Research Laboratory Metadata
// ---------------------------------------------------------------------------

export interface ResearchLaboratoryMetadata {
  readonly laboratoryId: string;
  readonly laboratoryType: ResearchLaboratoryType;
  readonly purpose: ResearchLaboratoryPurpose;
  readonly integrationMode: ResearchLaboratoryIntegrationMode;
  readonly title: string;
  readonly description: string;
  readonly associatedEvidence: readonly string[];
  readonly associatedMethods: readonly string[];
  readonly associatedBenchmarks: readonly string[];
  readonly associatedDatasets: readonly string[];
  readonly associatedReadingPaths: readonly string[];
  readonly officialSource: string;
  readonly governanceStatus: ResearchGovernanceStatus;
  readonly lifecycle: 'active' | 'deprecated' | 'historical';
  readonly rationale: string;
  readonly provenance: ResearchLaboratoryProvenance;
}

// ---------------------------------------------------------------------------
// Research Laboratory Decision
// ---------------------------------------------------------------------------

export interface ResearchLaboratoryDecision {
  readonly decisionId: string;
  readonly laboratoryId: string;
  readonly laboratoryType: ResearchLaboratoryType;
  readonly validationPassed: boolean;
  readonly validationErrors: readonly string[];
}

// ---------------------------------------------------------------------------
// Research Laboratory Trace
// ---------------------------------------------------------------------------

export interface ResearchLaboratoryTrace {
  readonly traceId: string;
  readonly metadataCount: number;
  readonly validatedCount: number;
  readonly invalidCount: number;
  readonly decisions: readonly ResearchLaboratoryDecision[];
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_laboratory_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Research Laboratory Registry
// ---------------------------------------------------------------------------

export interface ResearchLaboratoryRegistry {
  readonly registryId: string;
  readonly laboratories: readonly ResearchLaboratoryMetadata[];
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_laboratory_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Research Laboratory Input
// ---------------------------------------------------------------------------

export interface ResearchLaboratoryInput {
  readonly conceptId: string;
  readonly conceptLabel: string;
  readonly laboratories: readonly ResearchLaboratoryMetadata[];
}

// ---------------------------------------------------------------------------
// Research Artifact With Laboratories
// ---------------------------------------------------------------------------

export interface ResearchArtifactWithLaboratories {
  readonly artifactId: string;
  readonly artifactType: 'lesson' | 'concept' | 'visualization' | 'laboratory';
  readonly laboratoryRegistry: ResearchLaboratoryRegistry;
  readonly laboratoryTrace: ResearchLaboratoryTrace;
}

// ---------------------------------------------------------------------------
// Research Laboratory Validation Result
// ---------------------------------------------------------------------------

export interface ResearchLaboratoryValidationError {
  readonly code: string;
  readonly message: string;
  readonly field?: string;
  readonly laboratoryId?: string;
}

export interface ResearchLaboratoryValidationResult {
  readonly valid: boolean;
  readonly errors: readonly ResearchLaboratoryValidationError[];
  readonly checkedAt: 'laboratory_composition';
}

// ---------------------------------------------------------------------------
// Research Laboratory Status
// ---------------------------------------------------------------------------

export type ResearchLaboratoryStatus = 'validated' | 'pending' | 'invalid' | 'deprecated';

// ============================================================================
// D2-OPT-11 — Research Composition Certification Engine Types
// ============================================================================

// ---------------------------------------------------------------------------
// Research Composition Certification Status (canonical)
// ---------------------------------------------------------------------------

export const CANONICAL_CERTIFICATION_STATUSES = [
  'certified',
  'certified_with_warnings',
  'needs_revision',
  'blocked',
] as const;

export type ResearchCompositionCertificationStatus = (typeof CANONICAL_CERTIFICATION_STATUSES)[number];

// ---------------------------------------------------------------------------
// Research Composition Finding Severity (canonical)
// ---------------------------------------------------------------------------

export const CANONICAL_FINDING_SEVERITIES = [
  'error',
  'warning',
  'recommendation',
] as const;

export type ResearchCompositionFindingSeverity = (typeof CANONICAL_FINDING_SEVERITIES)[number];

// ---------------------------------------------------------------------------
// Research Composition Quality Dimension (canonical)
// ---------------------------------------------------------------------------

export const CANONICAL_QUALITY_DIMENSIONS = [
  'evidence_integrity',
  'lineage_integrity',
  'comparison_integrity',
  'timeline_integrity',
  'benchmark_integrity',
  'dataset_integrity',
  'industry_integrity',
  'evolution_integrity',
  'reading_path_integrity',
  'laboratory_integrity',
  'open_question_integrity',
  'maintenance_integrity',
  'provenance_integrity',
  'determinism',
  'architectural_boundary',
  'validation_integrity',
  'documentation_completeness',
] as const;

export type ResearchCompositionQualityDimension = (typeof CANONICAL_QUALITY_DIMENSIONS)[number];

// ---------------------------------------------------------------------------
// Research Composition Finding
// ---------------------------------------------------------------------------

export interface ResearchCompositionFinding {
  readonly code: string;
  readonly message: string;
  readonly severity: ResearchCompositionFindingSeverity;
  readonly qualityDimension: ResearchCompositionQualityDimension;
  readonly affectedArtifact: string;
  readonly rationale: string;
}

// ---------------------------------------------------------------------------
// Research Composition Certification Report
// ---------------------------------------------------------------------------

export interface ResearchCompositionCertificationReport {
  readonly certificationId: string;
  readonly status: ResearchCompositionCertificationStatus;
  readonly findings: readonly ResearchCompositionFinding[];
  readonly qualityScore: number;
  readonly dimensionsChecked: readonly ResearchCompositionQualityDimension[];
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_certification_engine';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Research Composition Certification Input
// ---------------------------------------------------------------------------

export interface ResearchCompositionCertificationInput {
  readonly conceptId: string;
  readonly conceptLabel: string;
  readonly evidenceArtifact?: ResearchArtifactWithEvidence;
  readonly lineageArtifact?: ResearchArtifactWithLineage;
  readonly comparisonArtifact?: ResearchArtifactWithComparison;
  readonly timelineArtifact?: ResearchArtifactWithTimeline;
  readonly benchmarkArtifact?: ResearchArtifactWithBenchmarks;
  readonly datasetArtifact?: ResearchArtifactWithDatasets;
  readonly industryArtifact?: ResearchArtifactWithIndustry;
  readonly evolutionArtifact?: ResearchArtifactWithEvolution;
  readonly readingPathArtifact?: ResearchArtifactWithReadingPaths;
  readonly laboratoryArtifact?: ResearchArtifactWithLaboratories;
  readonly openQuestionsArtifact?: ResearchArtifactWithOpenQuestions;
  readonly maintenanceArtifact?: ResearchArtifactWithMaintenance;
}

// ---------------------------------------------------------------------------
// Research Composition Certification Validation Result
// ---------------------------------------------------------------------------

export interface ResearchCompositionCertificationValidationError {
  readonly code: string;
  readonly message: string;
  readonly field?: string;
  readonly certificationId?: string;
}

export interface ResearchCompositionCertificationValidationResult {
  readonly valid: boolean;
  readonly errors: readonly ResearchCompositionCertificationValidationError[];
  readonly checkedAt: 'certification_composition';
}

// ============================================================================
// D2-OPT-12 — Research Public API Facade Types
// ============================================================================

// ---------------------------------------------------------------------------
// Research Artifact (consolidated)
// ---------------------------------------------------------------------------

export interface ResearchArtifact {
  readonly artifactId: string;
  readonly conceptId: string;
  readonly conceptLabel: string;
  readonly evidenceArtifact?: ResearchArtifactWithEvidence;
  readonly lineageArtifact?: ResearchArtifactWithLineage;
  readonly comparisonArtifact?: ResearchArtifactWithComparison;
  readonly timelineArtifact?: ResearchArtifactWithTimeline;
  readonly benchmarkArtifact?: ResearchArtifactWithBenchmarks;
  readonly datasetArtifact?: ResearchArtifactWithDatasets;
  readonly industryArtifact?: ResearchArtifactWithIndustry;
  readonly evolutionArtifact?: ResearchArtifactWithEvolution;
  readonly readingPathArtifact?: ResearchArtifactWithReadingPaths;
  readonly laboratoryArtifact?: ResearchArtifactWithLaboratories;
  readonly openQuestionsArtifact?: ResearchArtifactWithOpenQuestions;
  readonly maintenanceArtifact?: ResearchArtifactWithMaintenance;
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_research_facade';
  readonly randomUsed: false;
  readonly timeDependency: false;
  readonly curriculumMutated: false;
  readonly architectureVersion: string;
  readonly pipelineVersion: string;
}

// ---------------------------------------------------------------------------
// Research Artifact With Certification
// ---------------------------------------------------------------------------

export interface ResearchArtifactWithCertification {
  readonly artifact: ResearchArtifact;
  readonly certificationReport: ResearchCompositionCertificationReport;
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_research_facade';
  readonly randomUsed: false;
  readonly timeDependency: false;
  readonly curriculumMutated: false;
  readonly architectureVersion: string;
  readonly pipelineVersion: string;
}

// ---------------------------------------------------------------------------
// Research Facade Validation Result
// ---------------------------------------------------------------------------

export interface ResearchFacadeValidationError {
  readonly code: string;
  readonly message: string;
  readonly field?: string;
}

export interface ResearchFacadeValidationResult {
  readonly valid: boolean;
  readonly errors: readonly ResearchFacadeValidationError[];
  readonly checkedAt: 'facade_composition';
}

// ---------------------------------------------------------------------------
// Research Facade Status
// ---------------------------------------------------------------------------

export type ResearchFacadeStatus = 'composed' | 'certified' | 'needs_revision' | 'blocked';

// ============================================================================
// D2-OPT-13-A — Open Research Questions Types
// ============================================================================

// ---------------------------------------------------------------------------
// Research Open Question Categories (canonical)
// ---------------------------------------------------------------------------

export const CANONICAL_OPEN_QUESTION_CATEGORIES = [
  'unresolved_limitation',
  'scaling_challenge',
  'robustness_issue',
  'fairness_concern',
  'efficiency_bottleneck',
  'unexplored_direction',
  'evaluation_gap',
  'theoretical_gap',
  'deployment_risk',
  'reproducibility_issue',
] as const;

export type ResearchOpenQuestionCategory = (typeof CANONICAL_OPEN_QUESTION_CATEGORIES)[number];

// ---------------------------------------------------------------------------
// Research Open Question Statuses (canonical)
// ---------------------------------------------------------------------------

export const CANONICAL_OPEN_QUESTION_STATUSES = [
  'open',
  'partially_addressed',
  'actively_researched',
  'contested',
  'resolved',
  'deprecated',
] as const;

export type ResearchOpenQuestionStatus = (typeof CANONICAL_OPEN_QUESTION_STATUSES)[number];

// ---------------------------------------------------------------------------
// Research Open Question Provenance
// ---------------------------------------------------------------------------

export interface ResearchOpenQuestionProvenance {
  readonly questionId: string;
  readonly referenceId: string;
  readonly source: string;
  readonly governanceStatus: ResearchGovernanceStatus;
  readonly category: ResearchOpenQuestionCategory;
  readonly rationale: string;
  readonly providedBy: string;
}

// ---------------------------------------------------------------------------
// Research Open Question
// ---------------------------------------------------------------------------

export interface ResearchOpenQuestion {
  readonly questionId: string;
  readonly questionText: string;
  readonly category: ResearchOpenQuestionCategory;
  readonly status: ResearchOpenQuestionStatus;
  readonly associatedConcepts: readonly string[];
  readonly associatedMethods: readonly string[];
  readonly associatedEvidence: readonly string[];
  readonly associatedBenchmarks: readonly string[];
  readonly associatedDatasets: readonly string[];
  readonly associatedIndustry: readonly string[];
  readonly associatedEvolution: readonly string[];
  readonly source: string;
  readonly governanceStatus: ResearchGovernanceStatus;
  readonly lifecycle: 'active' | 'deprecated' | 'historical';
  readonly rationale: string;
  readonly provenance: ResearchOpenQuestionProvenance;
}

// ---------------------------------------------------------------------------
// Research Open Question Reference
// ---------------------------------------------------------------------------

export interface ResearchOpenQuestionReference {
  readonly questionId: string;
  readonly questionText: string;
  readonly category: ResearchOpenQuestionCategory;
  readonly status: ResearchOpenQuestionStatus;
}

// ---------------------------------------------------------------------------
// Research Open Question Decision
// ---------------------------------------------------------------------------

export interface ResearchOpenQuestionDecision {
  readonly decisionId: string;
  readonly questionId: string;
  readonly category: ResearchOpenQuestionCategory;
  readonly status: ResearchOpenQuestionStatus;
  readonly validationPassed: boolean;
  readonly validationErrors: readonly string[];
}

// ---------------------------------------------------------------------------
// Research Open Question Trace
// ---------------------------------------------------------------------------

export interface ResearchOpenQuestionTrace {
  readonly traceId: string;
  readonly questionCount: number;
  readonly validatedCount: number;
  readonly invalidCount: number;
  readonly decisions: readonly ResearchOpenQuestionDecision[];
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_open_question_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Research Open Question Registry
// ---------------------------------------------------------------------------

export interface ResearchOpenQuestionRegistry {
  readonly registryId: string;
  readonly questions: readonly ResearchOpenQuestion[];
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_open_question_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Research Open Question Input
// ---------------------------------------------------------------------------

export interface ResearchOpenQuestionInput {
  readonly conceptId: string;
  readonly conceptLabel: string;
  readonly questions: readonly ResearchOpenQuestion[];
}

// ---------------------------------------------------------------------------
// Research Artifact With Open Questions
// ---------------------------------------------------------------------------

export interface ResearchArtifactWithOpenQuestions {
  readonly artifactId: string;
  readonly artifactType: 'lesson' | 'concept' | 'visualization' | 'laboratory';
  readonly openQuestionRegistry: ResearchOpenQuestionRegistry;
  readonly openQuestionTrace: ResearchOpenQuestionTrace;
}

// ---------------------------------------------------------------------------
// Research Open Question Validation Result
// ---------------------------------------------------------------------------

export interface ResearchOpenQuestionValidationError {
  readonly code: string;
  readonly message: string;
  readonly field?: string;
  readonly questionId?: string;
}

export interface ResearchOpenQuestionValidationResult {
  readonly valid: boolean;
  readonly errors: readonly ResearchOpenQuestionValidationError[];
  readonly checkedAt: 'open_question_composition';
}

// ---------------------------------------------------------------------------
// Research Open Question Status
// ---------------------------------------------------------------------------

export type ResearchOpenQuestionValidationStatus = 'validated' | 'pending' | 'invalid' | 'deprecated';

// ============================================================================
// D2-OPT-13-B — Literature Maintenance Types
// ============================================================================

// ---------------------------------------------------------------------------
// Research Maintenance Signal Types (canonical)
// ---------------------------------------------------------------------------

export const CANONICAL_MAINTENANCE_SIGNAL_TYPES = [
  'obsolete_reference',
  'stronger_evidence_available',
  'survey_supersession',
  'terminology_evolution',
  'industrial_consensus_shift',
  'stale_verification',
  'missing_review_status',
  'governance_status_outdated',
  'deprecated_artifact',
  'replacement_reference_available',
] as const;

export type ResearchMaintenanceSignalType = (typeof CANONICAL_MAINTENANCE_SIGNAL_TYPES)[number];

// ---------------------------------------------------------------------------
// Research Maintenance Priority (canonical)
// ---------------------------------------------------------------------------

export const CANONICAL_MAINTENANCE_PRIORITIES = [
  'low',
  'medium',
  'high',
  'critical',
] as const;

export type ResearchMaintenancePriority = (typeof CANONICAL_MAINTENANCE_PRIORITIES)[number];

// ---------------------------------------------------------------------------
// Research Maintenance Action Types (canonical)
// ---------------------------------------------------------------------------

export const CANONICAL_MAINTENANCE_ACTIONS = [
  'review_required',
  'replace_reference',
  'add_supporting_reference',
  'update_terminology',
  'mark_deprecated',
  'preserve_historical_version',
  'escalate_to_governance',
  'no_action',
] as const;

export type ResearchMaintenanceActionType = (typeof CANONICAL_MAINTENANCE_ACTIONS)[number];

// ---------------------------------------------------------------------------
// Research Maintenance Provenance
// ---------------------------------------------------------------------------

export interface ResearchMaintenanceProvenance {
  readonly signalId: string;
  readonly referenceId: string;
  readonly source: string;
  readonly governanceStatus: ResearchGovernanceStatus;
  readonly signalType: ResearchMaintenanceSignalType;
  readonly rationale: string;
  readonly providedBy: string;
}

// ---------------------------------------------------------------------------
// Research Maintenance Signal
// ---------------------------------------------------------------------------

export interface ResearchMaintenanceSignal {
  readonly signalId: string;
  readonly signalType: ResearchMaintenanceSignalType;
  readonly priority: ResearchMaintenancePriority;
  readonly recommendedAction: ResearchMaintenanceActionType;
  readonly affectedReferenceIds: readonly string[];
  readonly affectedArtifactIds: readonly string[];
  readonly replacementReferenceIds: readonly string[];
  readonly source: string;
  readonly governanceStatus: ResearchGovernanceStatus;
  readonly lifecycle: 'active' | 'deprecated' | 'historical';
  readonly rationale: string;
  readonly provenance: ResearchMaintenanceProvenance;
}

// ---------------------------------------------------------------------------
// Research Maintenance Decision
// ---------------------------------------------------------------------------

export interface ResearchMaintenanceDecision {
  readonly decisionId: string;
  readonly signalId: string;
  readonly signalType: ResearchMaintenanceSignalType;
  readonly priority: ResearchMaintenancePriority;
  readonly recommendedAction: ResearchMaintenanceActionType;
  readonly validationPassed: boolean;
  readonly validationErrors: readonly string[];
}

// ---------------------------------------------------------------------------
// Research Maintenance Trace
// ---------------------------------------------------------------------------

export interface ResearchMaintenanceTrace {
  readonly traceId: string;
  readonly signalCount: number;
  readonly validatedCount: number;
  readonly invalidCount: number;
  readonly decisions: readonly ResearchMaintenanceDecision[];
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_maintenance_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Research Maintenance Registry
// ---------------------------------------------------------------------------

export interface ResearchMaintenanceRegistry {
  readonly registryId: string;
  readonly signals: readonly ResearchMaintenanceSignal[];
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_maintenance_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Research Maintenance Input
// ---------------------------------------------------------------------------

export interface ResearchMaintenanceInput {
  readonly conceptId: string;
  readonly conceptLabel: string;
  readonly signals: readonly ResearchMaintenanceSignal[];
}

// ---------------------------------------------------------------------------
// Research Artifact With Maintenance
// ---------------------------------------------------------------------------

export interface ResearchArtifactWithMaintenance {
  readonly artifactId: string;
  readonly artifactType: 'lesson' | 'concept' | 'visualization' | 'laboratory';
  readonly maintenanceRegistry: ResearchMaintenanceRegistry;
  readonly maintenanceTrace: ResearchMaintenanceTrace;
}

// ---------------------------------------------------------------------------
// Research Maintenance Validation Result
// ---------------------------------------------------------------------------

export interface ResearchMaintenanceValidationError {
  readonly code: string;
  readonly message: string;
  readonly field?: string;
  readonly signalId?: string;
}

export interface ResearchMaintenanceValidationResult {
  readonly valid: boolean;
  readonly errors: readonly ResearchMaintenanceValidationError[];
  readonly checkedAt: 'maintenance_composition';
}

// ---------------------------------------------------------------------------
// Research Maintenance Status
// ---------------------------------------------------------------------------

export type ResearchMaintenanceValidationStatus = 'validated' | 'pending' | 'invalid' | 'deprecated';

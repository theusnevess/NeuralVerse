/**
 * NV-1400-D2-OPT-01 + D2-OPT-02 + D2-OPT-03 + D2-OPT-04 + D2-OPT-05 + D2-OPT-06 + D2-OPT-07 + D2-OPT-08 + D2-OPT-09 + D2-OPT-10 + D2-OPT-11 + D2-OPT-12 — Research Pipeline Kernel (Final)
 *
 * Public API for the Scientific Evidence Kernel, Lineage Orchestration, Comparison Engine, Timeline Orchestration, Benchmark Intelligence, Dataset Mapping Orchestration, Industry Adoption Intelligence, Scientific Evolution Mapping, Research Reading Path Orchestration, Research Laboratory Integration, Research Composition Certification, and Research Public API Facade.
 * Organized into: contracts, evidence kernel, lineage kernel, comparison engine, timeline kernel, benchmark kernel, dataset kernel, industry kernel, evolution kernel, reading path kernel, laboratory integration kernel, certification engine, facade, validation, and types.
 */

// ============================================================================
// CONTRACTS — Domain types and constants
// ============================================================================

export {
  CANONICAL_SOURCE_TYPES,
  CANONICAL_EVIDENCE_LEVELS,
  CANONICAL_REVIEW_STATUSES,
  CANONICAL_GOVERNANCE_STATUSES,
  SOURCE_HIERARCHY_ORDER,
  type ResearchSourceType,
  type ResearchEvidenceLevel,
  type ResearchReference,
  type ResearchEvidenceMetadata,
  type ResearchEvidenceChain,
  type ResearchEvidenceChainLink,
  type ResearchEvidenceStatus,
  type ResearchEvidenceDecision,
  type ResearchEvidenceTrace,
  type ResearchEvidenceInput,
  type ResearchArtifactWithEvidence,
  type ResearchEvidenceValidationResult,
  type ResearchEvidenceValidationError,
  type ResearchTraceMetadata,
  type ResearchReviewStatus,
  type ResearchGovernanceStatus,
} from './ResearchAgentContract.ts';

// D2-OPT-13-A — Open Research Question Types
export {
  CANONICAL_OPEN_QUESTION_CATEGORIES,
  CANONICAL_OPEN_QUESTION_STATUSES,
  type ResearchOpenQuestionCategory,
  type ResearchOpenQuestionStatus,
  type ResearchOpenQuestion,
  type ResearchOpenQuestionReference,
  type ResearchOpenQuestionDecision,
  type ResearchOpenQuestionTrace,
  type ResearchOpenQuestionRegistry,
  type ResearchOpenQuestionInput,
  type ResearchArtifactWithOpenQuestions,
  type ResearchOpenQuestionValidationResult,
  type ResearchOpenQuestionValidationError,
  type ResearchOpenQuestionProvenance,
} from './ResearchAgentContract.ts';

// D2-OPT-13-B — Literature Maintenance Types
export {
  CANONICAL_MAINTENANCE_SIGNAL_TYPES,
  CANONICAL_MAINTENANCE_PRIORITIES,
  CANONICAL_MAINTENANCE_ACTIONS,
  type ResearchMaintenanceSignalType,
  type ResearchMaintenancePriority,
  type ResearchMaintenanceActionType,
  type ResearchMaintenanceSignal,
  type ResearchMaintenanceDecision,
  type ResearchMaintenanceTrace,
  type ResearchMaintenanceRegistry,
  type ResearchMaintenanceInput,
  type ResearchArtifactWithMaintenance,
  type ResearchMaintenanceValidationResult,
  type ResearchMaintenanceValidationError,
  type ResearchMaintenanceProvenance,
} from './ResearchAgentContract.ts';

// D2-OPT-02 — Lineage Types
export {
  CANONICAL_LINEAGE_RELATIONS,
  type ResearchLineageRelationType,
  type ResearchLineageNode,
  type ResearchLineageEdge,
  type ResearchLineageGraph,
  type ResearchLineageDecision,
  type ResearchLineageTrace,
  type ResearchLineageInput,
  type ResearchArtifactWithLineage,
  type ResearchLineageValidationResult,
  type ResearchLineageValidationError,
  type ResearchLineageProvenance,
  type ResearchLineageStatus,
} from './ResearchAgentContract.ts';

// D2-OPT-03 — Comparison Types
export {
  CANONICAL_COMPARISON_DIMENSIONS,
  type ResearchComparisonDimension,
  type ResearchComparisonAttribute,
  type ResearchComparisonValue,
  type ResearchComparisonEntry,
  type ResearchComparisonMatrix,
  type ResearchComparisonDecision,
  type ResearchComparisonTrace,
  type ResearchComparisonInput,
  type ResearchArtifactWithComparison,
  type ResearchComparisonValidationResult,
  type ResearchComparisonValidationError,
  type ResearchComparisonProvenance,
  type ResearchComparisonStatus,
} from './ResearchAgentContract.ts';

// D2-OPT-04 — Timeline Types
export {
  CANONICAL_TIMELINE_EVENT_TYPES,
  type ResearchTimelineEventType,
  type ResearchChronologicalReference,
  type ResearchTimelineEvent,
  type ResearchTimelineNode,
  type ResearchTimeline,
  type ResearchTimelineDecision,
  type ResearchTimelineTrace,
  type ResearchTimelineInput,
  type ResearchArtifactWithTimeline,
  type ResearchTimelineValidationResult,
  type ResearchTimelineValidationError,
  type ResearchTimelineProvenance,
  type ResearchTimelineStatus,
} from './ResearchAgentContract.ts';

// D2-OPT-05 — Benchmark Types
export {
  CANONICAL_BENCHMARK_CATEGORIES,
  CANONICAL_BENCHMARK_TYPES,
  type ResearchBenchmarkCategory,
  type ResearchBenchmarkType,
  type ResearchBenchmark,
  type ResearchBenchmarkReference,
  type ResearchBenchmarkDecision,
  type ResearchBenchmarkTrace,
  type ResearchBenchmarkRegistry,
  type ResearchBenchmarkInput,
  type ResearchArtifactWithBenchmarks,
  type ResearchBenchmarkValidationResult,
  type ResearchBenchmarkValidationError,
  type ResearchBenchmarkProvenance,
  type ResearchBenchmarkStatus,
} from './ResearchAgentContract.ts';

// D2-OPT-06 — Dataset Types
export {
  CANONICAL_DATASET_DOMAINS,
  CANONICAL_DATASET_TASKS,
  CANONICAL_DATASET_ANNOTATION_TYPES,
  CANONICAL_DATASET_LICENSES,
  CANONICAL_DATASET_SCALES,
  type ResearchDatasetDomain,
  type ResearchDatasetTask,
  type ResearchDatasetAnnotationType,
  type ResearchDatasetLicense,
  type ResearchDatasetScale,
  type ResearchDataset,
  type ResearchDatasetReference,
  type ResearchDatasetDecision,
  type ResearchDatasetTrace,
  type ResearchDatasetRegistry,
  type ResearchDatasetInput,
  type ResearchArtifactWithDatasets,
  type ResearchDatasetValidationResult,
  type ResearchDatasetValidationError,
  type ResearchDatasetProvenance,
  type ResearchDatasetStatus,
} from './ResearchAgentContract.ts';

// D2-OPT-07 — Industry Types
export {
  CANONICAL_INDUSTRY_SECTORS,
  CANONICAL_ADOPTION_TYPES,
  CANONICAL_ADOPTION_STAGES,
  type ResearchIndustrySector,
  type ResearchAdoptionType,
  type ResearchAdoptionStage,
  type ResearchIndustryUseCase,
  type ResearchIndustryReference,
  type ResearchIndustryDecision,
  type ResearchIndustryTrace,
  type ResearchIndustryRegistry,
  type ResearchIndustryInput,
  type ResearchArtifactWithIndustry,
  type ResearchIndustryValidationResult,
  type ResearchIndustryValidationError,
  type ResearchIndustryProvenance,
  type ResearchIndustryStatus,
} from './ResearchAgentContract.ts';

// D2-OPT-08 — Evolution Types
export {
  CANONICAL_EVOLUTION_RELATIONS,
  CANONICAL_EVOLUTION_NODE_TYPES,
  type ResearchEvolutionRelationType,
  type ResearchEvolutionNodeType,
  type ResearchEvolutionNode,
  type ResearchEvolutionEdge,
  type ResearchEvolutionGraph,
  type ResearchEvolutionDecision,
  type ResearchEvolutionTrace,
  type ResearchEvolutionRegistry,
  type ResearchEvolutionInput,
  type ResearchArtifactWithEvolution,
  type ResearchEvolutionValidationResult,
  type ResearchEvolutionValidationError,
  type ResearchEvolutionProvenance,
  type ResearchEvolutionStatus,
} from './ResearchAgentContract.ts';

// D2-OPT-09 — Reading Path Types
export {
  CANONICAL_READING_PATH_TYPES,
  CANONICAL_READING_PATH_STAGES,
  type ResearchReadingPathType,
  type ResearchReadingPathStage,
  type ResearchReadingPathNode,
  type ResearchReadingPath,
  type ResearchReadingPathRegistry,
  type ResearchReadingPathDecision,
  type ResearchReadingPathTrace,
  type ResearchReadingPathInput,
  type ResearchArtifactWithReadingPaths,
  type ResearchReadingPathValidationResult,
  type ResearchReadingPathValidationError,
  type ResearchReadingPathProvenance,
  type ResearchReadingPathStatus,
} from './ResearchAgentContract.ts';

// D2-OPT-10 — Laboratory Integration Types
export {
  CANONICAL_LABORATORY_TYPES,
  CANONICAL_LABORATORY_PURPOSES,
  CANONICAL_LABORATORY_INTEGRATION_MODES,
  type ResearchLaboratoryType,
  type ResearchLaboratoryPurpose,
  type ResearchLaboratoryIntegrationMode,
  type ResearchLaboratoryMetadata,
  type ResearchLaboratoryRegistry,
  type ResearchLaboratoryDecision,
  type ResearchLaboratoryTrace,
  type ResearchLaboratoryInput,
  type ResearchArtifactWithLaboratories,
  type ResearchLaboratoryValidationResult,
  type ResearchLaboratoryValidationError,
  type ResearchLaboratoryProvenance,
  type ResearchLaboratoryStatus,
} from './ResearchAgentContract.ts';

// D2-OPT-11 — Certification Engine Types
export {
  CANONICAL_CERTIFICATION_STATUSES,
  CANONICAL_FINDING_SEVERITIES,
  CANONICAL_QUALITY_DIMENSIONS,
  type ResearchCompositionCertificationStatus,
  type ResearchCompositionFindingSeverity,
  type ResearchCompositionFinding,
  type ResearchCompositionQualityDimension,
  type ResearchCompositionCertificationReport,
  type ResearchCompositionCertificationInput,
  type ResearchCompositionCertificationValidationError,
  type ResearchCompositionCertificationValidationResult,
} from './ResearchAgentContract.ts';

// ============================================================================
// EVIDENCE KERNEL — Orchestration functions
// ============================================================================

export {
  composeEvidenceMetadata,
  composeEvidenceChain,
  composeResearchEvidence,
  getSourceHierarchyRank,
  compareSourceHierarchy,
  isSupportedSourceType,
} from './EvidenceKernel.ts';

// ============================================================================
// LINEAGE KERNEL — Lineage orchestration functions
// ============================================================================

export {
  composeLineageNode,
  composeLineageEdge,
  composeLineageProvenance,
  composeLineageGraph,
  composeResearchLineage,
  composeLineageTrace,
  isSupportedRelationType,
  getCanonicalRelationTypes,
} from './LineageKernel.ts';

// ============================================================================
// COMPARISON ENGINE — Comparison orchestration functions
// ============================================================================

export {
  composeComparisonAttribute,
  composeComparisonValue,
  composeComparisonProvenance,
  composeComparisonEntry,
  composeComparisonMatrix,
  composeResearchComparison,
  composeComparisonTrace,
  isSupportedComparisonDimension,
  getCanonicalComparisonDimensions,
} from './ComparisonEngine.ts';

// ============================================================================
// TIMELINE KERNEL — Timeline orchestration functions
// ============================================================================

export {
  composeTimelineEvent,
  composeTimelineProvenance,
  composeTimelineNode,
  composeTimeline,
  composeResearchTimeline,
  composeTimelineTrace,
  composeChronologicalReference,
  compareChronologicalReferences,
  isSupportedTimelineEventType,
  getCanonicalTimelineEventTypes,
} from './TimelineKernel.ts';

// ============================================================================
// BENCHMARK KERNEL — Benchmark orchestration functions
// ============================================================================

export {
  composeBenchmarkProvenance,
  composeBenchmark,
  composeBenchmarkRegistry,
  composeResearchBenchmarks,
  composeBenchmarkTrace,
  isSupportedBenchmarkCategory,
  isSupportedBenchmarkType,
  getCanonicalBenchmarkCategories,
  getCanonicalBenchmarkTypes,
} from './BenchmarkKernel.ts';

// ============================================================================
// DATASET KERNEL — Dataset orchestration functions
// ============================================================================

export {
  composeDatasetProvenance,
  composeDataset,
  composeDatasetRegistry,
  composeResearchDatasets,
  composeDatasetTrace,
  isSupportedDatasetDomain,
  isSupportedDatasetTask,
  isSupportedDatasetAnnotationType,
  isSupportedDatasetLicense,
  isSupportedDatasetScale,
  getCanonicalDatasetDomains,
  getCanonicalDatasetTasks,
  getCanonicalDatasetAnnotationTypes,
  getCanonicalDatasetLicenses,
  getCanonicalDatasetScales,
} from './DatasetKernel.ts';

// ============================================================================
// INDUSTRY KERNEL — Industry adoption orchestration functions
// ============================================================================

export {
  composeIndustryProvenance,
  composeIndustryUseCase,
  composeIndustryReference,
  composeIndustryRegistry,
  composeResearchIndustry,
  composeIndustryTrace,
  isSupportedIndustrySector,
  isSupportedAdoptionType,
  isSupportedAdoptionStage,
  getCanonicalIndustrySectors,
  getCanonicalAdoptionTypes,
  getCanonicalAdoptionStages,
} from './IndustryKernel.ts';

// ============================================================================
// EVOLUTION KERNEL — Scientific evolution orchestration functions
// ============================================================================

export {
  composeEvolutionNode,
  composeEvolutionEdge,
  composeEvolutionProvenance,
  composeEvolutionGraph,
  composeEvolutionRegistry,
  composeResearchEvolution,
  composeEvolutionTrace,
  detectEvolutionCycles,
  isSupportedEvolutionRelationType,
  isSupportedEvolutionNodeType,
  getCanonicalEvolutionRelationTypes,
  getCanonicalEvolutionNodeTypes,
} from './EvolutionKernel.ts';

// ============================================================================
// READING PATH KERNEL — Research reading path orchestration functions
// ============================================================================

export {
  composeReadingPathNode,
  composeReadingPathProvenance,
  composeReadingPath,
  composeReadingPathRegistry,
  composeResearchReadingPaths,
  composeReadingPathTrace,
  isSupportedReadingPathType,
  isSupportedReadingPathStage,
  getCanonicalReadingPathTypes,
  getCanonicalReadingPathStages,
} from './ReadingPathKernel.ts';

// ============================================================================
// LABORATORY INTEGRATION KERNEL — Research laboratory integration orchestration functions
// ============================================================================

export {
  composeLaboratoryProvenance,
  composeLaboratoryMetadata,
  composeLaboratoryRegistry,
  composeResearchLaboratories,
  composeLaboratoryTrace,
  isSupportedLaboratoryType,
  isSupportedLaboratoryPurpose,
  isSupportedLaboratoryIntegrationMode,
  getCanonicalLaboratoryTypes,
  getCanonicalLaboratoryPurposes,
  getCanonicalLaboratoryIntegrationModes,
} from './LaboratoryIntegrationKernel.ts';

// ============================================================================
// OPEN RESEARCH QUESTION KERNEL — Open research question orchestration functions
// ============================================================================

export {
  composeOpenQuestionProvenance,
  composeOpenQuestion,
  composeOpenQuestionRegistry,
  composeResearchOpenQuestions,
  composeOpenQuestionTrace,
  isSupportedOpenQuestionCategory,
  isSupportedOpenQuestionStatus,
  getCanonicalOpenQuestionCategories,
  getCanonicalOpenQuestionStatuses,
} from './OpenResearchQuestionKernel.ts';

// ============================================================================
// LITERATURE MAINTENANCE KERNEL — Literature maintenance orchestration functions
// ============================================================================

export {
  composeMaintenanceProvenance,
  composeMaintenanceSignal,
  composeMaintenanceRegistry,
  composeResearchMaintenance,
  composeMaintenanceTrace,
  isSupportedMaintenanceSignalType,
  isSupportedMaintenancePriority,
  isSupportedMaintenanceAction,
  getCanonicalMaintenanceSignalTypes,
  getCanonicalMaintenancePriorities,
  getCanonicalMaintenanceActions,
} from './LiteratureMaintenanceKernel.ts';

// ============================================================================
// CERTIFICATION ENGINE — Research composition certification functions
// ============================================================================

export {
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

// ============================================================================
// VALIDATION — Deterministic validation
// ============================================================================

export {
  VALIDATION_CODES,
  validateReference,
  validateReferences,
  validateEvidenceMetadata,
  validateEvidenceChain,
  validateResearchArtifact,
  validateEvidenceInput,
} from './EvidenceValidation.ts';

// D2-OPT-02 — Lineage Validation
export {
  LINEAGE_VALIDATION_CODES,
  validateLineageNode,
  validateLineageEdge,
  validateLineageGraph,
  validateResearchArtifactWithLineage,
  validateLineageInput,
} from './LineageValidation.ts';

// D2-OPT-03 — Comparison Validation
export {
  COMPARISON_VALIDATION_CODES,
  validateComparisonEntry,
  validateComparisonMatrix,
  validateResearchArtifactWithComparison,
  validateComparisonInput,
} from './ComparisonValidation.ts';

// D2-OPT-04 — Timeline Validation
export {
  TIMELINE_VALIDATION_CODES,
  validateTimelineEvent,
  validateTimeline,
  validateResearchArtifactWithTimeline,
  validateTimelineInput,
} from './TimelineValidation.ts';

// D2-OPT-05 — Benchmark Validation
export {
  BENCHMARK_VALIDATION_CODES,
  validateBenchmark,
  validateBenchmarkRegistry,
  validateResearchArtifactWithBenchmarks,
  validateBenchmarkInput,
} from './BenchmarkValidation.ts';

// D2-OPT-06 — Dataset Validation
export {
  DATASET_VALIDATION_CODES,
  validateDataset,
  validateDatasetRegistry,
  validateResearchArtifactWithDatasets,
  validateDatasetInput,
} from './DatasetValidation.ts';

// D2-OPT-07 — Industry Validation
export {
  INDUSTRY_VALIDATION_CODES,
  validateIndustryRecord,
  validateIndustryRegistry,
  validateResearchArtifactWithIndustry,
  validateIndustryInput,
} from './IndustryValidation.ts';

// D2-OPT-08 — Evolution Validation
export {
  EVOLUTION_VALIDATION_CODES,
  validateEvolutionNode,
  validateEvolutionEdge,
  validateEvolutionGraph,
  validateEvolutionRegistry,
  validateResearchArtifactWithEvolution,
  validateEvolutionInput,
} from './EvolutionValidation.ts';

// D2-OPT-09 — Reading Path Validation
export {
  READING_PATH_VALIDATION_CODES,
  validateReadingPathNode,
  validateReadingPath,
  validateReadingPathRegistry,
  validateResearchArtifactWithReadingPaths,
  validateReadingPathInput,
} from './ReadingPathValidation.ts';

// D2-OPT-10 — Laboratory Integration Validation
export {
  LABORATORY_VALIDATION_CODES,
  validateLaboratoryMetadata,
  validateLaboratoryRegistry,
  validateResearchArtifactWithLaboratories,
  validateLaboratoryInput,
} from './LaboratoryIntegrationValidation.ts';

// D2-OPT-13-A — Open Research Question Validation
export {
  OPEN_QUESTION_VALIDATION_CODES,
  validateOpenQuestion,
  validateOpenQuestionRegistry,
  validateResearchArtifactWithOpenQuestions,
  validateOpenQuestionInput,
} from './OpenResearchQuestionValidation.ts';

// D2-OPT-13-B — Literature Maintenance Validation
export {
  MAINTENANCE_VALIDATION_CODES,
  validateMaintenanceSignal,
  validateMaintenanceRegistry,
  validateResearchArtifactWithMaintenance,
  validateMaintenanceInput,
} from './LiteratureMaintenanceValidation.ts';

// D2-OPT-11 — Certification Validation
export {
  CERTIFICATION_VALIDATION_CODES,
  validateCertificationFinding,
  validateCertificationReport,
  validateCertificationInput,
} from './CertificationValidation.ts';

// ============================================================================
// RESEARCH FACADE — Single public entrypoint for the entire Research Agent
// ============================================================================

// D2-OPT-12 — Facade Types
export {
  type ResearchArtifact,
  type ResearchArtifactWithCertification,
  type ResearchFacadeValidationResult,
  type ResearchFacadeValidationError,
  type ResearchFacadeStatus,
} from './ResearchAgentContract.ts';

// D2-OPT-12 — Facade Functions
export {
  composeResearchArtifact,
  certifyResearchArtifact,
  composeAndCertifyResearchArtifact,
  validateResearchFacadeArtifact,
  validateResearchFacadeCertification,
  validateResearchFacadeComplete,
} from './ResearchFacade.ts';

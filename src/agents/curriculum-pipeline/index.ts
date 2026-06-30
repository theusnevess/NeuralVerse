/**
 * NV-1500-D3-OPT-01 + D3-OPT-02 + D3-OPT-03 + D3-OPT-04 + D3-OPT-05 + D3-OPT-06 + D3-OPT-07 + D3-OPT-08 + D3-OPT-09 + D3-OPT-10 — Curriculum Pipeline Kernel
 *
 * Public API for the Curriculum Graph Kernel, Dependency Orchestration, Progression Intelligence,
 * Learning Path Composition, Roadmap Orchestration, Coverage & Gap Analysis,
 * Review & Reinforcement Planning, Evolution & Version Governance,
 * Certification & Structural Quality Gate, and Public API Consolidation Facade.
 * Organized into: contracts, graph kernel, dependency kernel, progression kernel,
 * learning path kernel, roadmap kernel, coverage kernel, review/reinforcement kernel,
 * evolution kernel, certification engine, facade, validation, and types.
 */

// ============================================================================
// CONTRACTS — Domain types and constants
// ============================================================================

export {
  CANONICAL_NODE_TYPES,
  CANONICAL_RELATIONSHIP_TYPES,
  CANONICAL_GOVERNANCE_STATUSES,
  CANONICAL_DEPENDENCY_TYPES,
  type CurriculumNodeType,
  type CurriculumRelationshipType,
  type CurriculumNode,
  type CurriculumEdge,
  type CurriculumGovernanceStatus,
  type CurriculumGraph,
  type CurriculumGraphRegistry,
  type CurriculumGraphProvenance,
  type CurriculumGraphDecision,
  type CurriculumGraphTrace,
  type CurriculumGraphInput,
  type CurriculumArtifact,
  type CurriculumGraphValidationResult,
  type CurriculumGraphValidationError,
  type CurriculumGraphStatus,
  type CurriculumNodeProvenance,
  type CurriculumEdgeProvenance,
  type CurriculumDependencyType,
  type CurriculumDependency,
  type CurriculumDependencyRegistry,
  type CurriculumDependencyDecision,
  type CurriculumDependencyTrace,
  type CurriculumDependencyInput,
  type CurriculumArtifactWithDependencies,
  type CurriculumDependencyValidationResult,
  type CurriculumDependencyValidationError,
  type CurriculumDependencyStatus,
  type CurriculumDependencyProvenance,
  CANONICAL_PROGRESSION_STATES,
  type CurriculumProgressionState,
  type CurriculumProgressionReason,
  type CurriculumProgressionNode,
  type CurriculumProgressionRegistry,
  type CurriculumProgressionDecision,
  type CurriculumProgressionTrace,
  type CurriculumProgressionInput,
  type CurriculumArtifactWithProgression,
  type CurriculumProgressionValidationResult,
  type CurriculumProgressionValidationError,
  type CurriculumProgressionStatus,
  type CurriculumProgressionProvenance,
  CANONICAL_LEARNING_PATH_TYPES,
  CANONICAL_LEARNING_PATH_STAGES,
  type CurriculumLearningPathType,
  type CurriculumLearningPathStage,
  type CurriculumLearningPathNode,
  type CurriculumLearningPath,
  type CurriculumLearningPathRegistry,
  type CurriculumLearningPathDecision,
  type CurriculumLearningPathTrace,
  type CurriculumLearningPathInput,
  type CurriculumArtifactWithLearningPaths,
  type CurriculumLearningPathValidationResult,
  type CurriculumLearningPathValidationError,
  type CurriculumLearningPathStatus,
  type CurriculumLearningPathProvenance,
  CANONICAL_ROADMAP_TYPES,
  CANONICAL_ROADMAP_STAGES,
  type CurriculumRoadmapType,
  type CurriculumRoadmapStage,
  type CurriculumRoadmapNode,
  type CurriculumRoadmap,
  type CurriculumRoadmapRegistry,
  type CurriculumRoadmapDecision,
  type CurriculumRoadmapTrace,
  type CurriculumRoadmapInput,
  type CurriculumArtifactWithRoadmaps,
  type CurriculumRoadmapValidationResult,
  type CurriculumRoadmapValidationError,
  type CurriculumRoadmapStatus,
  type CurriculumRoadmapProvenance,
  CANONICAL_COVERAGE_STATUS,
  CANONICAL_GAP_TYPES,
  CANONICAL_COVERAGE_DIMENSIONS,
  type CurriculumCoverageStatus,
  type CurriculumGapType,
  type CurriculumCoverageDimension,
  type CurriculumCoverageRecord,
  type CurriculumGapRecord,
  type CurriculumCoverageRegistry,
  type CurriculumCoverageDecision,
  type CurriculumCoverageTrace,
  type CurriculumCoverageInput,
  type CurriculumArtifactWithCoverage,
  type CurriculumCoverageValidationResult,
  type CurriculumCoverageValidationError,
  type CurriculumCoverageStatusType,
  type CurriculumCoverageProvenance,
  CANONICAL_REVIEW_TYPES,
  CANONICAL_REINFORCEMENT_TYPES,
  CANONICAL_REVIEW_RECURRENCE_MODELS,
  type CurriculumReviewType,
  type CurriculumReinforcementType,
  type CurriculumReviewRecurrenceModel,
  type CurriculumReviewPlan,
  type CurriculumReinforcementPlan,
  type CurriculumReviewReinforcementRegistry,
  type CurriculumReviewReinforcementDecision,
  type CurriculumReviewReinforcementTrace,
  type CurriculumReviewReinforcementInput,
  type CurriculumArtifactWithReviewReinforcement,
  type CurriculumReviewReinforcementValidationResult,
  type CurriculumReviewReinforcementValidationError,
  type CurriculumReviewReinforcementStatus,
  type CurriculumReviewReinforcementProvenance,
  CANONICAL_CURRICULUM_VERSION_TYPES,
  CANONICAL_CURRICULUM_LIFECYCLE,
  CANONICAL_EVOLUTION_RELATIONS,
  type CurriculumVersionType,
  type CurriculumLifecycleState,
  type CurriculumEvolutionRelation,
  type CurriculumVersion,
  type CurriculumLifecycleRecord,
  type CurriculumEvolutionRecord,
  type CurriculumEvolutionRegistry,
  type CurriculumEvolutionDecision,
  type CurriculumEvolutionTrace,
  type CurriculumEvolutionInput,
  type CurriculumArtifactWithEvolution,
  type CurriculumEvolutionValidationResult,
  type CurriculumEvolutionValidationError,
  type CurriculumEvolutionStatus,
  type CurriculumEvolutionProvenance,
  CANONICAL_CURRICULUM_CERTIFICATION_STATUS,
  CANONICAL_CURRICULUM_FINDING_SEVERITY,
  CANONICAL_CURRICULUM_QUALITY_DIMENSIONS,
  type CurriculumCompositionCertificationStatus,
  type CurriculumCompositionFindingSeverity,
  type CurriculumCompositionQualityDimension,
  type CurriculumCompositionFinding,
  type CurriculumCompositionCertificationReport,
  type CurriculumCompositionCertificationInput,
  type CurriculumCompositionCertificationValidationResult,
  type CurriculumCompositionCertificationValidationError,
  type CurriculumArtifactWithCertification,
  type CurriculumFacadeStatus,
  type CurriculumFacadeValidationError,
  type CurriculumFacadeValidationResult,
  type CurriculumCompositionInput,
  type CurriculumFacadeOutput,
  type CurriculumCertificationOutput,
  type CurriculumCompleteOutput,
  type CurriculumFacadeTraceMetadata,
} from './CurriculumAgentContract.ts';

// ============================================================================
// GRAPH KERNEL — Deterministic composition functions (D3-OPT-01)
// ============================================================================

export {
  composeCurriculumNode,
  composeCurriculumEdge,
  composeCurriculumProvenance,
  composeNodeProvenance,
  composeEdgeProvenance,
  composeCurriculumGraph,
  composeCurriculumTrace,
  composeCurriculumRegistry,
  isSupportedNodeType,
  isSupportedRelationshipType,
  isSupportedGovernanceStatus,
  getCanonicalNodeTypes,
  getCanonicalRelationshipTypes,
  getCanonicalGovernanceStatuses,
} from './CurriculumGraphKernel.ts';

// ============================================================================
// DEPENDENCY KERNEL — Deterministic dependency orchestration (D3-OPT-02)
// ============================================================================

export {
  composeDependency,
  composeDependencyRegistry,
  composeDependencyTrace,
  composeDependencyProvenance,
  composeCurriculumDependencies,
  composeCurriculumArtifactWithDependencies,
  isSupportedDependencyType,
  isSupportedDependencyGovernanceStatus,
  getCanonicalDependencyTypes,
  detectDependencyCycle,
} from './DependencyKernel.ts';

// ============================================================================
// PROGRESSION KERNEL — Deterministic progression intelligence (D3-OPT-03)
// ============================================================================

export {
  composeProgressionNode,
  composeProgressionRegistry,
  composeProgressionTrace,
  composeProgressionProvenance,
  composeCurriculumProgression,
  composeCurriculumArtifactWithProgression,
  isSupportedProgressionState,
  isSupportedProgressionGovernanceStatus,
  getCanonicalProgressionStates,
  resolveProgressionState,
} from './ProgressionKernel.ts';

// ============================================================================
// LEARNING PATH KERNEL — Deterministic learning path composition (D3-OPT-04)
// ============================================================================

export {
  composeLearningPath,
  composeLearningPathNode,
  composeLearningPathRegistry,
  composeLearningPathTrace,
  composeLearningPathProvenance,
  composeCurriculumLearningPaths,
  composeCurriculumArtifactWithLearningPaths,
  isSupportedLearningPathType,
  isSupportedLearningPathStage,
  isSupportedLearningPathGovernanceStatus,
  getCanonicalLearningPathTypes,
  getCanonicalLearningPathStages,
} from './LearningPathKernel.ts';

// ============================================================================
// ROADMAP KERNEL — Deterministic roadmap orchestration (D3-OPT-05)
// ============================================================================

export {
  composeRoadmap,
  composeRoadmapNode,
  composeRoadmapRegistry,
  composeRoadmapTrace,
  composeRoadmapProvenance,
  composeCurriculumRoadmaps,
  composeCurriculumArtifactWithRoadmaps,
  isSupportedRoadmapType,
  isSupportedRoadmapStage,
  isSupportedRoadmapGovernanceStatus,
  getCanonicalRoadmapTypes,
  getCanonicalRoadmapStages,
} from './RoadmapKernel.ts';

// ============================================================================
// COVERAGE KERNEL — Deterministic coverage & gap analysis (D3-OPT-06)
// ============================================================================

export {
  composeCoverageRecord,
  composeGapRecord,
  composeCoverageRegistry,
  composeCoverageTrace,
  composeCoverageProvenance,
  composeCurriculumCoverage,
  composeCurriculumArtifactWithCoverage,
  isSupportedCoverageStatus,
  isSupportedGapType,
  isSupportedCoverageDimension,
  isSupportedCoverageGovernanceStatus,
  getCanonicalCoverageStatuses,
  getCanonicalGapTypes,
  getCanonicalCoverageDimensions,
} from './CoverageKernel.ts';

// ============================================================================
// REVIEW/REINFORCEMENT KERNEL — Deterministic review & reinforcement planning (D3-OPT-07)
// ============================================================================

export {
  composeReviewPlan,
  composeReinforcementPlan,
  composeReviewReinforcementRegistry,
  composeReviewReinforcementTrace,
  composeReviewReinforcementProvenance,
  composeCurriculumReviewReinforcement,
  composeCurriculumArtifactWithReviewReinforcement,
  isSupportedReviewType,
  isSupportedReinforcementType,
  isSupportedReviewRecurrenceModel,
  isSupportedReviewReinforcementGovernanceStatus,
  getCanonicalReviewTypes,
  getCanonicalReinforcementTypes,
  getCanonicalReviewRecurrenceModels,
} from './ReviewReinforcementKernel.ts';

// ============================================================================
// EVOLUTION KERNEL — Deterministic evolution & version governance (D3-OPT-08)
// ============================================================================

export {
  composeCurriculumVersion,
  composeLifecycleRecord,
  composeEvolutionRecord,
  composeEvolutionRegistry,
  composeEvolutionTrace,
  composeEvolutionProvenance,
  composeCurriculumEvolution,
  composeCurriculumArtifactWithEvolution,
  isSupportedVersionType,
  isSupportedLifecycleState,
  isSupportedEvolutionRelation,
  isSupportedEvolutionGovernanceStatus,
  getCanonicalVersionTypes,
  getCanonicalLifecycleStates,
  getCanonicalEvolutionRelations,
} from './EvolutionKernel.ts';

// ============================================================================
// CERTIFICATION ENGINE — Deterministic certification & quality gate (D3-OPT-09)
// ============================================================================

export {
  composeCertificationFinding,
  composeCertificationReport,
  composeCertificationReportFromParams,
  certifyCurriculumComposition,
  isSupportedCertificationStatus,
  isSupportedFindingSeverity,
  isSupportedQualityDimension,
  isSupportedCertificationGovernanceStatus,
  getCanonicalCertificationStatuses,
  getCanonicalFindingSeverities,
  getCanonicalQualityDimensions,
} from './CertificationEngine.ts';

// ============================================================================
// FACADE — Public API consolidation (D3-OPT-10)
// ============================================================================

export {
  composeFacadeArtifact as composeCurriculumArtifact,
  certifyCurriculumArtifact,
  composeAndCertifyCurriculumArtifact,
  validateCurriculumFacadeArtifact,
  validateCurriculumFacadeCertification,
  validateCurriculumFacadeComplete,
  getCanonicalFacadeStatuses,
  isSupportedFacadeStatus,
} from './CurriculumPipelineFacade.ts';

// ============================================================================
// GRAPH VALIDATION — Deterministic validation (D3-OPT-01)
// ============================================================================

export {
  CURRICULUM_VALIDATION_CODES,
  validateCurriculumNode,
  validateCurriculumEdge,
  validateCurriculumGraph,
  validateCurriculumRegistry,
  validateCurriculumArtifact,
  validateCurriculumInput,
} from './CurriculumGraphValidation.ts';

// ============================================================================
// DEPENDENCY VALIDATION — Deterministic validation (D3-OPT-02)
// ============================================================================

export {
  DEPENDENCY_VALIDATION_CODES,
  validateDependency,
  validateDependencyRegistry,
  validateCurriculumArtifactWithDependencies,
  validateDependencyInput,
} from './DependencyValidation.ts';

// ============================================================================
// PROGRESSION VALIDATION — Deterministic validation (D3-OPT-03)
// ============================================================================

export {
  PROGRESSION_VALIDATION_CODES,
  validateProgressionNode,
  validateProgressionRegistry,
  validateCurriculumArtifactWithProgression,
  validateProgressionInput,
} from './ProgressionValidation.ts';

// ============================================================================
// LEARNING PATH VALIDATION — Deterministic validation (D3-OPT-04)
// ============================================================================

export {
  LEARNING_PATH_VALIDATION_CODES,
  validateLearningPath,
  validateLearningPathRegistry,
  validateCurriculumArtifactWithLearningPaths,
  validateLearningPathInput,
} from './LearningPathValidation.ts';

// ============================================================================
// ROADMAP VALIDATION — Deterministic validation (D3-OPT-05)
// ============================================================================

export {
  ROADMAP_VALIDATION_CODES,
  validateRoadmapNode,
  validateRoadmap,
  validateRoadmapRegistry,
  validateCurriculumArtifactWithRoadmaps,
  validateRoadmapInput,
} from './RoadmapValidation.ts';

// ============================================================================
// COVERAGE VALIDATION — Deterministic validation (D3-OPT-06)
// ============================================================================

export {
  COVERAGE_VALIDATION_CODES,
  validateCoverageRecord,
  validateGapRecord,
  validateCoverageRegistry,
  validateCurriculumArtifactWithCoverage,
  validateCoverageInput,
} from './CoverageValidation.ts';

// ============================================================================
// REVIEW/REINFORCEMENT VALIDATION — Deterministic validation (D3-OPT-07)
// ============================================================================

export {
  REVIEW_REINFORCEMENT_VALIDATION_CODES,
  validateReviewPlan,
  validateReinforcementPlan,
  validateReviewReinforcementRegistry,
  validateCurriculumArtifactWithReviewReinforcement,
  validateReviewReinforcementInput,
} from './ReviewReinforcementValidation.ts';

// ============================================================================
// EVOLUTION VALIDATION — Deterministic validation (D3-OPT-08)
// ============================================================================

export {
  EVOLUTION_VALIDATION_CODES,
  validateCurriculumVersion,
  validateLifecycleRecord,
  validateEvolutionRecord,
  validateEvolutionRegistry,
  validateCurriculumArtifactWithEvolution,
  validateEvolutionInput,
} from './EvolutionValidation.ts';

// ============================================================================
// CERTIFICATION VALIDATION — Deterministic validation (D3-OPT-09)
// ============================================================================

export {
  CERTIFICATION_VALIDATION_CODES,
  validateCertificationFinding,
  validateCertificationReport,
  validateCertificationInput,
} from './CertificationValidation.ts';

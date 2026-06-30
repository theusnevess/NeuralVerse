/**
 * NV-1600-D4-OPT-01 + D4-OPT-02 + D4-OPT-03 + D4-OPT-04 + D4-OPT-05 + D4-OPT-06 + D4-OPT-07 + D4-OPT-08 + D4-OPT-09 + D4-OPT-10 + D4-OPT-11 — Laboratory Pipeline Kernel
 *
 * Public API for the Laboratory Contract & Registry Kernel, the Safe Deterministic Execution Model,
 * the Laboratory Parameter Space & Configuration Orchestration layer, the Simulation Scenario
 * Composition & Experiment Modeling layer, the Visualization, Observation & Result Artifact
 * Modeling layer, the Laboratory Workflow Orchestration layer, the Laboratory Interaction
 * & User Action Modeling layer, the Predict-Before-Run & Hypothesis Modeling layer, the
 * Laboratory History & Local Evidence Modeling layer, the Laboratory
 * Certification & Structural Quality Gate layer, and the Public API
 * Consolidation & Laboratory Pipeline Facade layer.
 * Organized into: contracts, kernel, execution kernel, parameter kernel, experiment kernel,
 * result artifact kernel, workflow kernel, interaction kernel, hypothesis kernel, history kernel,
 * certification engine, facade, validation, and types.
 */

// ============================================================================
// CONTRACTS — Domain types and constants
// ============================================================================

export {
  CANONICAL_LABORATORY_TYPES,
  CANONICAL_LABORATORY_LEVELS,
  CANONICAL_LABORATORY_STATUS,
  CANONICAL_GOVERNANCE_STATUSES,
  type LaboratoryType,
  type LaboratoryLevel,
  type LaboratoryStatus,
  type LaboratoryGovernanceStatus,
  type LaboratoryMetadata,
  type LaboratoryProvenance,
  type LaboratoryDecision,
  type LaboratoryTrace,
  type LaboratoryNode,
  type LaboratoryArtifact,
  type LaboratoryRegistry,
  type LaboratoryInput,
  type LaboratoryValidationError,
  type LaboratoryValidationResult,
  type LaboratoryRegistryValidationResult,
  type LaboratoryArtifactValidationResult,
  type LaboratoryInputValidationResult,
} from './LaboratoryAgentContract.ts';

// D4-OPT-02 — Execution Types
export {
  CANONICAL_EXECUTION_MODES,
  CANONICAL_EXECUTION_STATES,
  CANONICAL_SANDBOX_LEVELS,
  type ExecutionMode,
  type ExecutionState,
  type SandboxLevel,
  type LaboratoryExecutionPolicy,
  type LaboratoryExecutionEnvironment,
  type LaboratoryExecutionPlan,
  type LaboratoryExecutionProvenance,
  type LaboratoryExecutionDecision,
  type LaboratoryExecutionTrace,
  type LaboratoryExecutionArtifact,
  type LaboratoryExecutionRegistry,
  type LaboratoryExecutionInput,
  type LaboratoryExecutionValidationError,
  type LaboratoryExecutionValidationResult,
  type LaboratoryExecutionPolicyValidationResult,
  type LaboratoryExecutionEnvironmentValidationResult,
  type LaboratoryExecutionRegistryValidationResult,
  type LaboratoryExecutionArtifactValidationResult,
  type LaboratoryExecutionInputValidationResult,
  type LaboratoryExecutionStatus,
} from './LaboratoryAgentContract.ts';

// D4-OPT-03 — Parameter & Configuration Types
export {
  CANONICAL_PARAMETER_TYPES,
  CANONICAL_PARAMETER_CATEGORIES,
  CANONICAL_PARAMETER_CONSTRAINTS,
  CANONICAL_CONFIGURATION_STATUS,
  type LaboratoryParameterType,
  type LaboratoryParameterCategory,
  type LaboratoryParameterConstraintType,
  type LaboratoryConfigurationStatus,
  type LaboratoryParameterProvenance,
  type LaboratoryParameterConstraint,
  type LaboratoryParameter,
  type LaboratoryParameterGroupProvenance,
  type LaboratoryParameterGroup,
  type LaboratoryConfigurationProvenance,
  type LaboratoryConfigurationDecision,
  type LaboratoryConfigurationTrace,
  type LaboratoryConfiguration,
  type LaboratoryConfigurationRegistry,
  type LaboratoryConfigurationInput,
  type LaboratoryArtifactWithConfiguration,
  type LaboratoryConfigurationValidationError,
  type LaboratoryConfigurationValidationResult,
  type LaboratoryConfigurationRegistryValidationResult,
  type LaboratoryConfigurationArtifactValidationResult,
  type LaboratoryConfigurationInputValidationResult,
} from './LaboratoryAgentContract.ts';

// D4-OPT-04 — Experiment Types
export {
  CANONICAL_EXPERIMENT_TYPES,
  CANONICAL_SCENARIO_TYPES,
  CANONICAL_EXPECTED_OUTPUT_TYPES,
  CANONICAL_EXPERIMENT_STATUS,
  type ExperimentType,
  type ScenarioType,
  type ExpectedOutputType,
  type ExperimentStatus,
  type ExperimentProvenance,
  type ScenarioProvenance,
  type DatasetReferenceProvenance,
  type ExpectedOutputProvenance,
  type EvaluationMetadataProvenance,
  type ExperimentDatasetReference,
  type ExperimentExpectedOutput,
  type ExperimentEvaluationMetadata,
  type ExperimentScenario,
  type LaboratoryExperiment,
  type ExperimentDecision,
  type ExperimentTrace,
  type ExperimentRegistry,
  type ExperimentInput,
  type LaboratoryArtifactWithExperiments,
  type ExperimentValidationError,
  type ExperimentValidationResult,
  type ExperimentRegistryValidationResult,
  type ExperimentArtifactValidationResult,
  type ExperimentInputValidationResult,
} from './LaboratoryAgentContract.ts';

// D4-OPT-05 — Result Artifact Types
export {
  CANONICAL_VISUALIZATION_TYPES,
  CANONICAL_OBSERVATION_TYPES,
  CANONICAL_RESULT_ARTIFACT_TYPES,
  CANONICAL_METRIC_TYPES,
  CANONICAL_RESULT_ARTIFACT_STATUS,
  type VisualizationType,
  type ObservationType,
  type ResultArtifactType,
  type MetricType,
  type ResultArtifactStatus,
  type VisualizationProvenance,
  type ObservationProvenance,
  type MetricProvenance,
  type ResultArtifactProvenance,
  type ArtifactRelationshipProvenance,
  type LaboratoryVisualization,
  type LaboratoryObservation,
  type LaboratoryMetric,
  type ResultArtifactRelationship,
  type LaboratoryResultArtifact,
  type ResultArtifactDecision,
  type ResultArtifactTrace,
  type ResultArtifactRegistry,
  type ResultArtifactInput,
  type LaboratoryArtifactWithResults,
  type ResultArtifactValidationError,
  type ResultArtifactValidationResult,
  type ResultArtifactRegistryValidationResult,
  type ResultArtifactArtifactValidationResult,
  type ResultArtifactInputValidationResult,
} from './LaboratoryAgentContract.ts';

// D4-OPT-06 — Workflow Types
export {
  CANONICAL_WORKFLOW_TYPES,
  CANONICAL_WORKFLOW_STEP_TYPES,
  CANONICAL_WORKFLOW_STATUS,
  type LaboratoryWorkflowType,
  type LaboratoryWorkflowStepType,
  type LaboratoryWorkflowStatus,
  type LaboratoryWorkflowProvenance,
  type LaboratoryWorkflowStep,
  type LaboratoryWorkflow,
  type LaboratoryWorkflowDecision,
  type LaboratoryWorkflowTrace,
  type LaboratoryWorkflowRegistry,
  type LaboratoryWorkflowInput,
  type LaboratoryArtifactWithWorkflows,
  type LaboratoryWorkflowValidationError,
  type LaboratoryWorkflowValidationResult,
  type LaboratoryWorkflowRegistryValidationResult,
  type LaboratoryWorkflowArtifactValidationResult,
  type LaboratoryWorkflowInputValidationResult,
} from './LaboratoryAgentContract.ts';

// D4-OPT-07 — Interaction Types
export {
  CANONICAL_INTERACTION_TYPES,
  CANONICAL_USER_ACTION_TYPES,
  CANONICAL_INTERACTION_STATUS,
  type LaboratoryInteractionType,
  type LaboratoryUserActionType,
  type LaboratoryInteractionStatus,
  type LaboratoryInteractionProvenance,
  type LaboratoryUserAction,
  type LaboratoryInteraction,
  type LaboratoryInteractionDecision,
  type LaboratoryInteractionTrace,
  type LaboratoryInteractionRegistry,
  type LaboratoryInteractionInput,
  type LaboratoryArtifactWithInteractions,
  type LaboratoryInteractionValidationError,
  type LaboratoryInteractionValidationResult,
  type LaboratoryInteractionRegistryValidationResult,
  type LaboratoryInteractionArtifactValidationResult,
  type LaboratoryInteractionInputValidationResult,
} from './LaboratoryAgentContract.ts';

// D4-OPT-08 — Hypothesis Types
export {
  CANONICAL_HYPOTHESIS_TYPES,
  CANONICAL_PREDICTION_PROMPT_TYPES,
  CANONICAL_OBSERVATION_TARGETS,
  CANONICAL_HYPOTHESIS_STATUS,
  type LaboratoryHypothesisType,
  type LaboratoryPredictionPromptType,
  type LaboratoryObservationTarget,
  type LaboratoryHypothesisStatus,
  type LaboratoryHypothesisProvenance,
  type LaboratoryPredictionPrompt,
  type LaboratoryHypothesis,
  type LaboratoryHypothesisDecision,
  type LaboratoryHypothesisTrace,
  type LaboratoryHypothesisRegistry,
  type LaboratoryHypothesisInput,
  type LaboratoryArtifactWithHypotheses,
  type LaboratoryHypothesisValidationError,
  type LaboratoryHypothesisValidationResult,
  type LaboratoryHypothesisRegistryValidationResult,
  type LaboratoryHypothesisArtifactValidationResult,
  type LaboratoryHypothesisInputValidationResult,
} from './LaboratoryAgentContract.ts';

// D4-OPT-09 — History Types
export {
  CANONICAL_HISTORY_TYPES,
  CANONICAL_EVIDENCE_TYPES,
  CANONICAL_EVIDENCE_RELATIONSHIP_TYPES,
  CANONICAL_HISTORY_STATUS,
  type LaboratoryHistoryType,
  type LaboratoryEvidenceType,
  type LaboratoryEvidenceRelationshipType,
  type LaboratoryHistoryStatus,
  type LaboratoryHistoryProvenance,
  type LaboratoryEvidenceProvenance,
  type LaboratoryEvidenceRelationshipProvenance,
  type LaboratoryHistoryRecord,
  type LaboratoryEvidenceRecord,
  type LaboratoryEvidenceRelationship,
  type LaboratoryHistoryDecision,
  type LaboratoryHistoryTrace,
  type LaboratoryHistoryRegistry,
  type LaboratoryHistoryInput,
  type LaboratoryArtifactWithHistory,
  type LaboratoryHistoryValidationError,
  type LaboratoryHistoryValidationResult,
  type LaboratoryHistoryRegistryValidationResult,
  type LaboratoryHistoryArtifactValidationResult,
  type LaboratoryHistoryInputValidationResult,
} from './LaboratoryAgentContract.ts';

// D4-OPT-10 — Certification Types
export {
  CANONICAL_CERTIFICATION_STATUS,
  CANONICAL_FINDING_SEVERITY,
  CANONICAL_QUALITY_DIMENSIONS,
  type LaboratoryCompositionCertificationStatus,
  type LaboratoryCompositionFindingSeverity,
  type LaboratoryCompositionQualityDimension,
  type LaboratoryCompositionFinding,
  type LaboratoryCompositionCertificationProvenance,
  type LaboratoryCompositionCertificationReport,
  type LaboratoryCompositionCertificationInput,
  type LaboratoryCompositionCertificationValidationError,
  type LaboratoryCompositionCertificationValidationResult,
} from './LaboratoryAgentContract.ts';

// D4-OPT-11 — Facade Types
export {
  CANONICAL_FACADE_STATUS,
  type LaboratoryFacadeStatus,
  type LaboratoryCompositionInput,
  type LaboratoryFacadeTraceMetadata,
  type LaboratoryFacadeValidationError,
  type LaboratoryFacadeValidationResult,
  type LaboratoryFacadeOutput,
  type LaboratoryCertificationOutput,
  type LaboratoryCompleteOutput,
} from './LaboratoryAgentContract.ts';

// ============================================================================
// LABORATORY KERNEL — Deterministic composition functions
// ============================================================================

export {
  composeLaboratoryProvenance,
  composeLaboratoryTrace,
  composeLaboratoryNode,
  composeLaboratoryRegistry,
  composeLaboratory,
  composeLaboratoryRegistryFromInput,
  isSupportedLaboratoryType,
  isSupportedLaboratoryLevel,
  isSupportedLaboratoryStatus,
  isSupportedGovernanceStatus,
  getCanonicalLaboratoryTypes,
  getCanonicalLaboratoryLevels,
  getCanonicalLaboratoryStatuses,
  getCanonicalGovernanceStatuses,
} from './LaboratoryKernel.ts';

// ============================================================================
// EXECUTION KERNEL — Deterministic execution composition functions
// ============================================================================

export {
  composeExecutionPolicy,
  composeExecutionEnvironment,
  composeExecutionPlan,
  composeExecutionProvenance,
  composeExecutionTrace,
  composeExecutionArtifact,
  composeExecutionRegistry,
  composeLaboratoryExecution,
  isSupportedExecutionMode,
  isSupportedExecutionState,
  isSupportedSandboxLevel,
  isSupportedExecutionGovernanceStatus,
  getCanonicalExecutionModes,
  getCanonicalExecutionStates,
  getCanonicalSandboxLevels,
} from './ExecutionKernel.ts';

// ============================================================================
// PARAMETER KERNEL — Deterministic parameter composition functions
// ============================================================================

export {
  composeParameterProvenance,
  composeParameterGroupProvenance,
  composeConfigurationProvenance,
  composeParameterConstraint,
  composeParameter,
  composeParameterGroup,
  composeConfiguration,
  composeConfigurationTrace,
  composeConfigurationRegistry,
  composeLaboratoryConfiguration,
  isSupportedParameterType,
  isSupportedParameterCategory,
  isSupportedConstraintType,
  isSupportedConfigurationStatus,
  isSupportedParameterGovernanceStatus,
  getCanonicalParameterTypes,
  getCanonicalParameterCategories,
  getCanonicalConstraintTypes,
  getCanonicalConfigurationStatuses,
} from './ParameterKernel.ts';

// ============================================================================
// EXPERIMENT KERNEL — Deterministic experiment composition functions
// ============================================================================

export {
  composeExperimentProvenance,
  composeScenarioProvenance,
  composeDatasetReferenceProvenance,
  composeExpectedOutputProvenance,
  composeEvaluationMetadataProvenance,
  composeScenario,
  composeDatasetReference,
  composeExpectedOutput,
  composeEvaluationMetadata,
  composeExperiment,
  composeExperimentTrace,
  composeExperimentRegistry,
  composeLaboratoryExperiments,
  isSupportedExperimentType,
  isSupportedScenarioType,
  isSupportedExpectedOutputType,
  isSupportedExperimentStatus,
  isSupportedExperimentGovernanceStatus,
  getCanonicalExperimentTypes,
  getCanonicalScenarioTypes,
  getCanonicalExpectedOutputTypes,
  getCanonicalExperimentStatuses,
} from './ExperimentKernel.ts';

// ============================================================================
// RESULT ARTIFACT KERNEL — Deterministic result artifact composition functions
// ============================================================================

export {
  composeVisualizationProvenance,
  composeObservationProvenance,
  composeMetricProvenance,
  composeResultArtifactProvenance,
  composeArtifactRelationshipProvenance,
  composeVisualization,
  composeObservation,
  composeMetric,
  composeResultArtifact,
  composeArtifactRelationship,
  composeResultArtifactTrace,
  composeResultArtifactRegistry,
  composeLaboratoryResultArtifacts,
  isSupportedVisualizationType,
  isSupportedObservationType,
  isSupportedMetricType,
  isSupportedResultArtifactType,
  isSupportedResultArtifactStatus,
  isSupportedResultArtifactGovernanceStatus,
  getCanonicalVisualizationTypes,
  getCanonicalObservationTypes,
  getCanonicalMetricTypes,
  getCanonicalResultArtifactTypes,
  getCanonicalResultArtifactStatuses,
} from './ResultArtifactKernel.ts';

// ============================================================================
// LABORATORY VALIDATION — Deterministic validation
// ============================================================================

export {
  LABORATORY_VALIDATION_CODES,
  validateLaboratory,
  validateLaboratoryRegistry,
  validateLaboratoryArtifact,
  validateLaboratoryInput,
} from './LaboratoryValidation.ts';

// ============================================================================
// EXECUTION VALIDATION — Deterministic execution validation
// ============================================================================

export {
  EXECUTION_VALIDATION_CODES,
  validateExecutionPlan,
  validateExecutionPolicy,
  validateExecutionEnvironment,
  validateExecutionRegistry,
  validateExecutionArtifact,
  validateExecutionInput,
} from './ExecutionValidation.ts';

// ============================================================================
// PARAMETER VALIDATION — Deterministic parameter validation
// ============================================================================

export {
  PARAMETER_VALIDATION_CODES,
  validateParameter,
  validateConstraint,
  validateParameterGroup,
  validateConfiguration,
  validateConfigurationRegistry,
  validateLaboratoryArtifactWithConfiguration,
  validateConfigurationInput,
} from './ParameterValidation.ts';

// ============================================================================
// EXPERIMENT VALIDATION — Deterministic experiment validation
// ============================================================================

export {
  EXPERIMENT_VALIDATION_CODES,
  validateExperiment,
  validateScenario,
  validateDatasetReference,
  validateExpectedOutput,
  validateEvaluationMetadata,
  validateExperimentRegistry,
  validateLaboratoryArtifactWithExperiments,
  validateExperimentInput,
} from './ExperimentValidation.ts';

// ============================================================================
// RESULT ARTIFACT VALIDATION — Deterministic result artifact validation
// ============================================================================

export {
  RESULT_ARTIFACT_VALIDATION_CODES,
  validateVisualization,
  validateObservation,
  validateMetric,
  validateResultArtifact,
  validateArtifactRelationship,
  validateResultArtifactRegistry,
  validateLaboratoryArtifactWithResults,
  validateResultArtifactInput,
} from './ResultArtifactValidation.ts';

// ============================================================================
// WORKFLOW KERNEL — Deterministic workflow composition functions
// ============================================================================

export {
  composeWorkflowProvenance,
  composeWorkflowStep,
  composeWorkflow,
  composeWorkflowTrace,
  composeWorkflowRegistry,
  composeLaboratoryWorkflows,
  isSupportedWorkflowType,
  isSupportedWorkflowStepType,
  isSupportedWorkflowStatus,
  isSupportedWorkflowGovernanceStatus,
  getCanonicalWorkflowTypes,
  getCanonicalWorkflowStepTypes,
  getCanonicalWorkflowStatuses,
} from './WorkflowKernel.ts';

// ============================================================================
// WORKFLOW VALIDATION — Deterministic workflow validation
// ============================================================================

export {
  WORKFLOW_VALIDATION_CODES,
  validateWorkflow,
  validateWorkflowStep,
  validateWorkflowRegistry,
  validateLaboratoryArtifactWithWorkflows,
  validateWorkflowInput,
} from './WorkflowValidation.ts';

// ============================================================================
// INTERACTION KERNEL — Deterministic interaction composition functions
// ============================================================================

export {
  composeInteractionProvenance,
  composeUserAction,
  composeInteraction,
  composeInteractionTrace,
  composeInteractionRegistry,
  composeLaboratoryInteractions,
  isSupportedInteractionType,
  isSupportedUserActionType,
  isSupportedInteractionStatus,
  isSupportedInteractionGovernanceStatus,
  getCanonicalInteractionTypes,
  getCanonicalUserActionTypes,
  getCanonicalInteractionStatuses,
} from './InteractionKernel.ts';

// ============================================================================
// INTERACTION VALIDATION — Deterministic interaction validation
// ============================================================================

export {
  INTERACTION_VALIDATION_CODES,
  validateInteraction,
  validateUserAction,
  validateInteractionRegistry,
  validateLaboratoryArtifactWithInteractions,
  validateInteractionInput,
} from './InteractionValidation.ts';

// ============================================================================
// HYPOTHESIS KERNEL — Deterministic hypothesis composition functions
// ============================================================================

export {
  composeHypothesisProvenance,
  composePredictionPrompt,
  composeHypothesis,
  composeHypothesisTrace,
  composeHypothesisRegistry,
  composeLaboratoryHypotheses,
  isSupportedHypothesisType,
  isSupportedPredictionPromptType,
  isSupportedObservationTarget,
  isSupportedHypothesisStatus,
  isSupportedHypothesisGovernanceStatus,
  getCanonicalHypothesisTypes,
  getCanonicalPredictionPromptTypes,
  getCanonicalObservationTargets,
  getCanonicalHypothesisStatuses,
} from './HypothesisKernel.ts';

// ============================================================================
// HYPOTHESIS VALIDATION — Deterministic hypothesis validation
// ============================================================================

export {
  HYPOTHESIS_VALIDATION_CODES,
  validateHypothesis,
  validatePredictionPrompt,
  validateHypothesisRegistry,
  validateLaboratoryArtifactWithHypotheses,
  validateHypothesisInput,
} from './HypothesisValidation.ts';

// ============================================================================
// HISTORY KERNEL — Deterministic history composition functions
// ============================================================================

export {
  composeHistoryProvenance,
  composeEvidenceProvenance,
  composeEvidenceRelationshipProvenance,
  composeHistoryRecord,
  composeEvidenceRecord,
  composeEvidenceRelationship,
  composeHistoryTrace,
  composeHistoryRegistry,
  composeLaboratoryHistory,
  isSupportedHistoryType,
  isSupportedEvidenceType,
  isSupportedEvidenceRelationshipType,
  isSupportedHistoryStatus,
  isSupportedHistoryGovernanceStatus,
  getCanonicalHistoryTypes,
  getCanonicalEvidenceTypes,
  getCanonicalEvidenceRelationshipTypes,
  getCanonicalHistoryStatuses,
} from './LaboratoryHistoryKernel.ts';

// ============================================================================
// HISTORY VALIDATION — Deterministic history validation
// ============================================================================

export {
  HISTORY_VALIDATION_CODES,
  validateHistoryRecord,
  validateEvidenceRecord,
  validateEvidenceRelationship,
  validateHistoryRegistry,
  validateLaboratoryArtifactWithHistory,
  validateHistoryInput,
} from './HistoryValidation.ts';

// ============================================================================
// CERTIFICATION ENGINE — Deterministic certification composition functions
// ============================================================================

export {
  composeCertificationFinding,
  composeCertificationReport,
  composeCertificationReportFromParams,
  certifyLaboratoryComposition,
  isSupportedCertificationStatus,
  isSupportedFindingSeverity,
  isSupportedQualityDimension,
  isSupportedCertificationGovernanceStatus,
  getCanonicalCertificationStatuses,
  getCanonicalFindingSeverities,
  getCanonicalQualityDimensions,
} from './CertificationEngine.ts';

// ============================================================================
// CERTIFICATION VALIDATION — Deterministic certification validation
// ============================================================================

export {
  CERTIFICATION_VALIDATION_CODES,
  validateCertificationFinding,
  validateCertificationReport,
  validateCertificationInput,
} from './CertificationValidation.ts';

// ============================================================================
// FACADE — Public API consolidation
// ============================================================================

export {
  composeLaboratoryArtifact,
  certifyLaboratoryArtifact,
  composeAndCertifyLaboratoryArtifact,
  validateLaboratoryFacadeArtifact,
  validateLaboratoryFacadeCertification,
  validateLaboratoryFacadeComplete,
  getCanonicalFacadeStatuses,
  isSupportedFacadeStatus,
} from './LaboratoryPipelineFacade.ts';

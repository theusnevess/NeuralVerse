/**
 * NV-2000-D8-OPT-01 through D8-OPT-15 — Assessment Pipeline Kernel
 *
 * Public API for the Assessment Pipeline.
 * Organized into: contracts, kernels, validation, helpers, and types.
 */

// ============================================================================
// CONTRACTS — Domain types and canonical constants
// ============================================================================
export {
  CANONICAL_ASSESSMENT_ARTIFACT_TYPES,
  CANONICAL_ASSESSMENT_DOMAINS,
  CANONICAL_ASSESSMENT_STATUS,
  CANONICAL_ASSESSMENT_GOVERNANCE,
  type AssessmentArtifactType,
  type AssessmentDomain,
  type AssessmentStatus,
  type AssessmentGovernanceLevel,
  type AssessmentProvenance,
  type AssessmentDecision,
  type AssessmentTrace,
  type AssessmentNode,
  type AssessmentRegistryMetadata,
  type AssessmentRegistry,
  type AssessmentInput,
  type AssessmentValidationError,
  type AssessmentValidationResult,
  type AssessmentNodeValidationResult,
  type AssessmentRegistryValidationResult,
  type AssessmentInputValidationResult,
  type AssessmentTraceValidationResult,
} from './AssessmentAgentContract.ts';

// ============================================================================
// COGNITIVE CONTRACTS — Cognitive level and question type modeling
// ============================================================================
export {
  CANONICAL_COGNITIVE_LEVELS,
  CANONICAL_QUESTION_TYPES,
  CANONICAL_REASONING_TYPES,
  CANONICAL_ASSESSMENT_OBJECTIVES,
  CANONICAL_EXPECTED_EVIDENCE_TYPES,
  CANONICAL_COGNITIVE_STATUS,
  type CognitiveLevel,
  type QuestionType,
  type ReasoningType,
  type AssessmentObjective,
  type ExpectedEvidenceType,
  type CognitiveStatus,
  type CognitiveProvenance,
  type CognitiveDecision,
  type CognitiveTrace,
  type CognitiveAssessmentProfile,
  type CognitiveRelationship,
  type CognitiveRegistryMetadata,
  type CognitiveRegistry,
  type CognitiveInput,
  type AssessmentArtifactWithCognitiveProfile,
  type CognitiveValidationError,
  type CognitiveValidationResult,
  type CognitiveNodeValidationResult,
  type CognitiveRegistryValidationResult,
  type CognitiveInputValidationResult,
  type CognitiveTraceValidationResult,
  type AssessmentArtifactWithCognitiveProfileValidationResult,
} from './AssessmentAgentContract.ts';

// ============================================================================
// VERIFICATION CONTRACTS — Deterministic answer verification
// ============================================================================
export {
  CANONICAL_VERIFICATION_TYPES,
  CANONICAL_RESPONSE_TYPES,
  CANONICAL_MATCHING_STRATEGIES,
  CANONICAL_VERIFICATION_RESULT_TYPES,
  CANONICAL_VERIFICATION_STATUS,
  type VerificationType,
  type ResponseType,
  type MatchingStrategy,
  type VerificationResultType,
  type VerificationStatus,
  type VerificationProvenance,
  type VerificationDecision,
  type VerificationTrace,
  type VerificationRule,
  type LearnerResponse,
  type VerificationResult,
  type VerificationRelationship,
  type VerificationRegistryMetadata,
  type VerificationRegistry,
  type VerificationInput,
  type AssessmentArtifactWithVerification,
  type VerificationValidationError,
  type VerificationValidationResult,
  type VerificationRuleValidationResult,
  type VerificationRegistryValidationResult,
  type VerificationInputValidationResult,
  type VerificationTraceValidationResult,
  type AssessmentArtifactWithVerificationValidationResult,
} from './AssessmentAgentContract.ts';

// ============================================================================
// CONCEPT GRAPH CONTRACTS — Concept graph assessment mapping
// ============================================================================
export {
  CANONICAL_CONCEPT_NODE_TYPES,
  CANONICAL_RELATIONSHIP_TYPES,
  CANONICAL_GRAPH_COVERAGE_TYPES,
  CANONICAL_ASSESSMENT_GRAPH_OBJECTIVES,
  CANONICAL_GRAPH_MAPPING_STATUS,
  type ConceptNodeType,
  type RelationshipType,
  type GraphCoverageType,
  type AssessmentGraphObjective,
  type GraphMappingStatus,
  type ConceptGraphProvenance,
  type ConceptGraphDecision,
  type ConceptGraphTrace,
  type ConceptNodeReference,
  type ConceptRelationship,
  type AssessmentConceptCoverage,
  type AssessmentConceptGraph,
  type GraphCoverageEntry,
  type ConceptGraphRegistryMetadata,
  type ConceptGraphRegistry,
  type ConceptGraphInput,
  type AssessmentArtifactWithConceptGraph,
  type ConceptGraphValidationError,
  type ConceptGraphValidationResult,
  type ConceptGraphRegistryValidationResult,
  type ConceptGraphInputValidationResult,
  type ConceptGraphTraceValidationResult,
  type AssessmentArtifactWithConceptGraphValidationResult,
} from './AssessmentAgentContract.ts';

// ============================================================================
// MISCONCEPTION CONTRACTS — Misconception detection and remediation modeling
// ============================================================================
export {
  CANONICAL_MISCONCEPTION_TYPES,
  CANONICAL_MISCONCEPTION_CAUSES,
  CANONICAL_REMEDIATION_TYPES,
  CANONICAL_REMEDIATION_PRIORITY,
  CANONICAL_MISCONCEPTION_SEVERITY,
  CANONICAL_MISCONCEPTION_STATUS,
  type MisconceptionType,
  type MisconceptionCause,
  type RemediationType,
  type RemediationPriority,
  type MisconceptionSeverity,
  type MisconceptionStatus,
  type MisconceptionProvenance,
  type MisconceptionDecision,
  type MisconceptionTrace,
  type AssessmentMisconception,
  type MisconceptionCauseEntry,
  type RemediationStrategy,
  type MisconceptionRelationship,
  type MisconceptionRegistryMetadata,
  type MisconceptionRegistry,
  type MisconceptionInput,
  type AssessmentArtifactWithMisconceptions,
  type MisconceptionValidationError,
  type MisconceptionValidationResult,
  type MisconceptionRegistryValidationResult,
  type MisconceptionInputValidationResult,
  type MisconceptionTraceValidationResult,
  type AssessmentArtifactWithMisconceptionsValidationResult,
} from './AssessmentAgentContract.ts';

// ============================================================================
// FEEDBACK CONTRACTS — Explanatory feedback modeling
// ============================================================================
export {
  CANONICAL_FEEDBACK_TYPES,
  CANONICAL_FEEDBACK_OBJECTIVES,
  CANONICAL_FEEDBACK_TONES,
  CANONICAL_FEEDBACK_DELIVERY_TYPES,
  CANONICAL_FEEDBACK_PRIORITY,
  CANONICAL_FEEDBACK_STATUS,
  type FeedbackType,
  type FeedbackObjective,
  type FeedbackTone,
  type FeedbackDeliveryType,
  type FeedbackPriority,
  type FeedbackStatus,
  type FeedbackProvenance,
  type FeedbackDecision,
  type FeedbackTrace,
  type AssessmentFeedback,
  type FeedbackExplanation,
  type FeedbackReference,
  type FeedbackRelationship,
  type FeedbackRegistryMetadata,
  type FeedbackRegistry,
  type FeedbackInput,
  type AssessmentArtifactWithFeedback,
  type FeedbackValidationError,
  type FeedbackValidationResult,
  type FeedbackRegistryValidationResult,
  type FeedbackInputValidationResult,
  type FeedbackTraceValidationResult,
  type AssessmentArtifactWithFeedbackValidationResult,
} from './AssessmentAgentContract.ts';

// ============================================================================
// LABORATORY ASSESSMENT CONTRACTS — Laboratory-aware assessment integration
// ============================================================================
export {
  CANONICAL_LAB_ASSESSMENT_TYPES,
  CANONICAL_LAB_OBJECTIVE_TYPES,
  CANONICAL_LAB_EVIDENCE_TYPES,
  CANONICAL_LAB_MAPPING_TYPES,
  CANONICAL_LAB_ASSESSMENT_STATUS,
  type LaboratoryAssessmentType,
  type LaboratoryObjectiveType,
  type LaboratoryEvidenceType,
  type LaboratoryMappingType,
  type LaboratoryAssessmentStatus,
  type LaboratoryAssessmentProvenance,
  type LaboratoryAssessmentDecision,
  type LaboratoryAssessmentTrace,
  type AssessmentLaboratoryIntegration,
  type LaboratoryEvidenceReference,
  type LaboratoryObjective,
  type LaboratoryAssessmentRelationship,
  type LaboratoryAssessmentRegistryMetadata,
  type LaboratoryAssessmentRegistry,
  type LaboratoryAssessmentInput,
  type AssessmentArtifactWithLaboratories,
  type LaboratoryAssessmentValidationError,
  type LaboratoryAssessmentValidationResult,
  type LaboratoryAssessmentRegistryValidationResult,
  type LaboratoryAssessmentInputValidationResult,
  type LaboratoryAssessmentTraceValidationResult,
  type AssessmentArtifactWithLaboratoriesValidationResult,
} from './AssessmentAgentContract.ts';

// ============================================================================
// VISUAL ASSESSMENT CONTRACTS — Visual and multimodal assessment modeling
// ============================================================================
export {
  CANONICAL_VISUAL_ASSESSMENT_TYPES,
  CANONICAL_VISUAL_RESOURCE_TYPES,
  CANONICAL_VISUAL_TASK_TYPES,
  CANONICAL_MULTIMODAL_EVIDENCE_TYPES,
  CANONICAL_VISUAL_GOVERNANCE_LEVELS,
  CANONICAL_VISUAL_ASSESSMENT_STATUS,
  type VisualAssessmentType,
  type VisualResourceType,
  type VisualTaskType,
  type MultimodalEvidenceType,
  type VisualGovernanceLevel,
  type VisualAssessmentStatus,
  type VisualAssessmentProvenance,
  type VisualAssessmentDecision,
  type VisualAssessmentTrace,
  type AssessmentVisualArtifact,
  type VisualAssessmentReference,
  type VisualAssessmentTask,
  type MultimodalEvidence,
  type VisualAssessmentRelationship,
  type VisualAssessmentRegistryMetadata,
  type VisualAssessmentRegistry,
  type VisualAssessmentInput,
  type AssessmentArtifactWithVisualAssets,
  type VisualAssessmentValidationError,
  type VisualAssessmentValidationResult,
  type VisualAssessmentRegistryValidationResult,
  type VisualAssessmentInputValidationResult,
  type VisualAssessmentTraceValidationResult,
  type AssessmentArtifactWithVisualAssetsValidationResult,
} from './AssessmentAgentContract.ts';

// ============================================================================
// ENGINEERING CASE CONTRACTS — Engineering case study assessment
// ============================================================================
export {
  CANONICAL_ENGINEERING_CASE_TYPES,
  CANONICAL_ENGINEERING_DECISION_TYPES,
  CANONICAL_ENGINEERING_CONSTRAINT_TYPES,
  CANONICAL_ENGINEERING_EVIDENCE_TYPES,
  CANONICAL_ENGINEERING_CASE_STATUS,
  type EngineeringCaseType,
  type EngineeringDecisionType,
  type EngineeringConstraintType,
  type EngineeringEvidenceType,
  type EngineeringCaseStatus,
  type EngineeringCaseAssessmentProvenance,
  type EngineeringCaseAssessmentDecision,
  type EngineeringCaseAssessmentTrace,
  type EngineeringCaseAssessment,
  type EngineeringDecisionReference,
  type EngineeringConstraint,
  type EngineeringEvidence,
  type EngineeringCaseRelationship,
  type EngineeringCaseRegistryMetadata,
  type EngineeringCaseRegistry,
  type EngineeringCaseInput,
  type AssessmentArtifactWithEngineeringCases,
  type EngineeringCaseValidationError,
  type EngineeringCaseValidationResult,
  type EngineeringCaseRegistryValidationResult,
  type EngineeringCaseInputValidationResult,
  type EngineeringCaseTraceValidationResult,
  type AssessmentArtifactWithEngineeringCasesValidationResult,
} from './AssessmentAgentContract.ts';

// ============================================================================
// COMPARISON CONTRACTS — Comparative reasoning and trade-off evaluation
// ============================================================================
export {
  CANONICAL_COMPARISON_REASONING_TYPES,
  CANONICAL_COMPARISON_DIMENSIONS,
  CANONICAL_TRADE_OFF_TYPES,
  CANONICAL_DECISION_CONTEXT_TYPES,
  CANONICAL_COMPARATIVE_ASSESSMENT_STATUS,
  type ComparisonReasoningType,
  type ComparisonDimension,
  type TradeOffType,
  type DecisionContextType,
  type ComparativeAssessmentStatus,
  type ComparisonAssessmentProvenance,
  type ComparisonAssessmentDecision,
  type ComparisonAssessmentTrace,
  type ComparisonDimensionEntry,
  type TradeOffEvaluation,
  type DecisionContext,
  type ComparativeAssessment,
  type ComparisonRelationship,
  type ComparisonRegistryMetadata,
  type ComparisonRegistry,
  type ComparisonInput,
  type AssessmentArtifactWithComparisons,
  type ComparisonValidationError,
  type ComparisonValidationResult,
  type ComparisonRegistryValidationResult,
  type ComparisonInputValidationResult,
  type ComparisonTraceValidationResult,
  type AssessmentArtifactWithComparisonsValidationResult,
} from './AssessmentAgentContract.ts';

// ============================================================================
// CONSTRAINT ANALYSIS CONTRACTS — Engineering constraint analysis assessment
// ============================================================================
export {
  CANONICAL_ENGINEERING_CONSTRAINT_ANALYSIS_TYPES,
  CANONICAL_CONSTRAINT_SEVERITY_LEVELS,
  CANONICAL_CONSTRAINT_CATEGORY_TYPES,
  CANONICAL_CONSTRAINT_REASONING_TYPES,
  CANONICAL_CONSTRAINT_ANALYSIS_STATUS,
  type EngineeringConstraintAnalysisType,
  type ConstraintSeverityLevel,
  type ConstraintCategoryType,
  type ConstraintReasoningType,
  type ConstraintAnalysisStatus,
  type ConstraintAssessmentProvenance,
  type ConstraintAssessmentDecision,
  type ConstraintAssessmentTrace,
  type ConstraintCategory,
  type ConstraintSeverity,
  type ConstraintReasoning,
  type ConstraintRelationship,
  type EngineeringConstraintAssessment,
  type ConstraintRegistryMetadata,
  type ConstraintRegistry,
  type ConstraintInput,
  type AssessmentArtifactWithConstraints,
  type ConstraintValidationError,
  type ConstraintValidationResult,
  type ConstraintRegistryValidationResult,
  type ConstraintInputValidationResult,
  type ConstraintTraceValidationResult,
  type AssessmentArtifactWithConstraintsValidationResult,
} from './AssessmentAgentContract.ts';

// ============================================================================
// REINFORCEMENT PLAN CONTRACTS — Reinforcement plan generation assessment
// ============================================================================
export {
  CANONICAL_REINFORCEMENT_PLAN_TYPES,
  CANONICAL_REINFORCEMENT_OBJECTIVE_TYPES,
  CANONICAL_REINFORCEMENT_ACTIVITY_TYPES,
  CANONICAL_REINFORCEMENT_PRIORITY_TYPES,
  CANONICAL_REINFORCEMENT_STATUS,
  type ReinforcementPlanType,
  type ReinforcementObjectiveType,
  type ReinforcementActivityType,
  type ReinforcementPriorityType,
  type ReinforcementPlanStatus,
  type ReinforcementProvenance,
  type ReinforcementDecision,
  type ReinforcementTrace,
  type ReinforcementObjective,
  type ReinforcementActivity,
  type ReinforcementRelationship,
  type AssessmentReinforcementPlan,
  type ReinforcementRegistryMetadata,
  type ReinforcementRegistry,
  type ReinforcementInput,
  type AssessmentArtifactWithReinforcement,
  type ReinforcementValidationError,
  type ReinforcementValidationResult,
  type ReinforcementRegistryValidationResult,
  type ReinforcementInputValidationResult,
  type ReinforcementTraceValidationResult,
  type AssessmentArtifactWithReinforcementValidationResult,
} from './AssessmentAgentContract.ts';

// ============================================================================
// PORTFOLIO EVALUATION CONTRACTS — Portfolio-oriented evaluation assessment
// ============================================================================
export {
  CANONICAL_PORTFOLIO_EVALUATION_TYPES,
  CANONICAL_PORTFOLIO_ARTIFACT_TYPES,
  CANONICAL_PORTFOLIO_COMPETENCY_TYPES,
  CANONICAL_SHOWCASE_LEVELS,
  CANONICAL_PORTFOLIO_EVALUATION_STATUS,
  type PortfolioEvaluationType,
  type PortfolioArtifactType,
  type PortfolioCompetencyType,
  type ShowcaseLevel,
  type PortfolioEvaluationStatus,
  type PortfolioEvaluationProvenance,
  type PortfolioEvaluationDecision,
  type PortfolioEvaluationTrace,
  type PortfolioArtifactReference,
  type PortfolioCompetencyEvidence,
  type PortfolioShowcaseClassification,
  type PortfolioRelationship,
  type PortfolioEvaluation,
  type PortfolioRegistryMetadata,
  type PortfolioRegistry,
  type PortfolioInput,
  type AssessmentArtifactWithPortfolio,
  type PortfolioValidationError,
  type PortfolioValidationResult,
  type PortfolioRegistryValidationResult,
  type PortfolioInputValidationResult,
  type PortfolioTraceValidationResult,
  type AssessmentArtifactWithPortfolioValidationResult,
} from './AssessmentAgentContract.ts';

// ============================================================================
// KERNEL — Compose functions
// ============================================================================
export {
  composeAssessmentProvenance,
  composeAssessmentTrace,
  composeAssessmentNode,
  composeAssessmentRegistry,
  composeAssessmentRegistryFromInput,
  composeAssessment,
} from './AssessmentKernel.ts';

// ============================================================================
// COGNITIVE KERNEL — Cognitive compose functions
// ============================================================================
export {
  composeCognitiveProvenance,
  composeCognitiveTrace,
  composeCognitiveAssessmentProfile,
  composeCognitiveRelationship,
  composeCognitiveRegistry,
  composeCognitiveRegistryFromInput,
  composeAssessmentCognitiveProfiles,
  composeAssessmentArtifactWithCognitiveProfile,
} from './AssessmentCognitiveKernel.ts';

// ============================================================================
// VERIFICATION KERNEL — Verification compose and verify functions
// ============================================================================
export {
  composeVerificationProvenance,
  composeVerificationTrace,
  composeVerificationRule,
  composeLearnerResponse,
  composeVerificationRelationship,
  composeVerificationRegistry,
  composeVerificationRegistryFromInput,
  composeVerification,
  composeAssessmentArtifactWithVerification,
  verifyExactMatch,
  verifyOrderedMatch,
  verifyUnorderedMatch,
  verifyMultipleSelection,
  verifyBoolean,
  verifyNumeric,
  verifyRange,
  verifyMapping,
  verifyStructuredResponse,
  verifyAssessmentResponse,
} from './AssessmentVerificationKernel.ts';

// ============================================================================
// CONCEPT GRAPH KERNEL — Concept graph compose functions
// ============================================================================
export {
  composeConceptGraphProvenance,
  composeConceptGraphTrace,
  composeConceptNodeReference,
  composeConceptRelationship,
  composeAssessmentConceptCoverage,
  composeGraphCoverageEntry,
  composeAssessmentConceptGraph,
  composeConceptGraphRegistry,
  composeConceptGraphRegistryFromInput,
  composeAssessmentConceptGraphs,
  composeAssessmentArtifactWithConceptGraph,
} from './ConceptGraphKernel.ts';

// ============================================================================
// MISCONCEPTION KERNEL — Misconception compose functions
// ============================================================================
export {
  composeMisconceptionProvenance,
  composeMisconceptionTrace,
  composeAssessmentMisconception,
  composeMisconceptionCause,
  composeRemediationStrategy,
  composeMisconceptionRelationship,
  composeMisconceptionRegistry,
  composeMisconceptionRegistryFromInput,
  composeAssessmentMisconceptions,
  composeAssessmentArtifactWithMisconceptions,
} from './MisconceptionKernel.ts';

// ============================================================================
// FEEDBACK KERNEL — Feedback compose functions
// ============================================================================
export {
  composeFeedbackProvenance,
  composeFeedbackTrace,
  composeAssessmentFeedback,
  composeFeedbackExplanation,
  composeFeedbackReference,
  composeFeedbackRelationship,
  composeFeedbackRegistry,
  composeFeedbackRegistryFromInput,
  composeAssessmentFeedbackCollection,
  composeAssessmentArtifactWithFeedback,
} from './FeedbackKernel.ts';

// ============================================================================
// LABORATORY ASSESSMENT KERNEL — Laboratory assessment compose functions
// ============================================================================
export {
  composeLaboratoryAssessmentProvenance,
  composeLaboratoryAssessmentTrace,
  composeAssessmentLaboratoryIntegration,
  composeLaboratoryEvidenceReference,
  composeLaboratoryObjective,
  composeLaboratoryAssessmentRelationship,
  composeLaboratoryAssessmentRegistry,
  composeLaboratoryAssessmentRegistryFromInput,
  composeAssessmentLaboratoryMappings,
  composeAssessmentArtifactWithLaboratories,
} from './LaboratoryAssessmentKernel.ts';

// ============================================================================
// VISUAL ASSESSMENT KERNEL — Visual assessment compose functions
// ============================================================================
export {
  composeVisualAssessmentProvenance,
  composeVisualAssessmentTrace,
  composeAssessmentVisualArtifact,
  composeVisualAssessmentReference,
  composeVisualAssessmentTask,
  composeMultimodalEvidence,
  composeVisualAssessmentRelationship,
  composeVisualAssessmentRegistry,
  composeVisualAssessmentRegistryFromInput,
  composeAssessmentVisualAssets,
  composeAssessmentArtifactWithVisualAssets,
} from './VisualAssessmentKernel.ts';

// ============================================================================
// ENGINEERING CASE KERNEL — Engineering case assessment compose functions
// ============================================================================
export {
  composeEngineeringCaseAssessmentProvenance,
  composeEngineeringCaseAssessmentTrace,
  composeEngineeringCaseAssessment,
  composeEngineeringDecisionReference,
  composeEngineeringConstraint,
  composeEngineeringEvidence,
  composeEngineeringCaseRelationship,
  composeEngineeringCaseRegistry,
  composeEngineeringCaseRegistryFromInput,
  composeEngineeringCaseAssessments,
  composeAssessmentArtifactWithEngineeringCases,
} from './EngineeringCaseAssessmentKernel.ts';

// ============================================================================
// COMPARISON KERNEL — Comparison compose functions
// ============================================================================
export {
  composeComparisonAssessmentProvenance,
  composeComparisonAssessmentTrace,
  composeComparativeAssessment,
  composeComparisonDimension,
  composeTradeOffEvaluation,
  composeDecisionContext,
  composeComparisonRelationship,
  composeComparisonRegistry,
  composeComparisonRegistryFromInput,
  composeAssessmentComparisons,
  composeAssessmentArtifactWithComparisons,
} from './AssessmentComparisonKernel.ts';

// ============================================================================
// CONSTRAINT KERNEL — Constraint analysis compose functions
// ============================================================================
export {
  composeConstraintAssessmentProvenance,
  composeConstraintAssessmentTrace,
  composeEngineeringConstraintAssessment,
  composeConstraintCategory,
  composeConstraintSeverity,
  composeConstraintReasoning,
  composeConstraintRelationship,
  composeConstraintRegistry,
  composeConstraintRegistryFromInput,
  composeAssessmentConstraints,
  composeAssessmentArtifactWithConstraints,
} from './AssessmentConstraintKernel.ts';

// ============================================================================
// REINFORCEMENT KERNEL — Reinforcement plan generation compose functions
// ============================================================================
export {
  composeReinforcementProvenance,
  composeReinforcementTrace,
  composeAssessmentReinforcementPlan,
  composeReinforcementObjective,
  composeReinforcementActivity,
  composeReinforcementRelationship,
  composeReinforcementRegistry,
  composeReinforcementRegistryFromInput,
  composeAssessmentReinforcementPlans,
  composeAssessmentArtifactWithReinforcement,
} from './AssessmentReinforcementKernel.ts';

// ============================================================================
// PORTFOLIO KERNEL — Portfolio-oriented evaluation compose functions
// ============================================================================
export {
  composePortfolioEvaluationProvenance,
  composePortfolioEvaluationTrace,
  composePortfolioEvaluation,
  composePortfolioArtifactReference,
  composePortfolioCompetencyEvidence,
  composePortfolioShowcaseClassification,
  composePortfolioRelationship,
  composePortfolioRegistry,
  composePortfolioRegistryFromInput,
  composeAssessmentPortfolioEvaluations,
  composeAssessmentArtifactWithPortfolio,
} from './AssessmentPortfolioKernel.ts';

// ============================================================================
// VALIDATION — Deterministic validation
// ============================================================================
export {
  VALIDATION_CODES,
  validateAssessmentNode,
  validateAssessmentRegistry,
  validateAssessmentInput,
  validateAssessmentTrace,
} from './AssessmentValidation.ts';

// ============================================================================
// COGNITIVE VALIDATION — Cognitive deterministic validation
// ============================================================================
export {
  COGNITIVE_VALIDATION_CODES,
  validateCognitiveAssessmentProfile,
  validateCognitiveRelationship,
  validateCognitiveRegistry,
  validateCognitiveInput,
  validateCognitiveTrace,
  validateAssessmentArtifactWithCognitiveProfile,
} from './AssessmentCognitiveValidation.ts';

// ============================================================================
// VERIFICATION VALIDATION — Verification deterministic validation
// ============================================================================
export {
  VERIFICATION_VALIDATION_CODES,
  validateVerificationRule,
  validateVerificationRegistry,
  validateVerificationInput,
  validateVerificationTrace,
  validateAssessmentArtifactWithVerification,
} from './AssessmentVerificationValidation.ts';

// ============================================================================
// CONCEPT GRAPH VALIDATION — Concept graph deterministic validation
// ============================================================================
export {
  CONCEPT_GRAPH_VALIDATION_CODES,
  validateConceptNodeReference,
  validateConceptRelationship,
  validateAssessmentConceptCoverage,
  validateAssessmentConceptGraph,
  validateConceptGraphRegistry,
  validateConceptGraphInput,
  validateConceptGraphTrace,
  validateAssessmentArtifactWithConceptGraph,
} from './ConceptGraphValidation.ts';

// ============================================================================
// MISCONCEPTION VALIDATION — Misconception deterministic validation
// ============================================================================
export {
  MISCONCEPTION_VALIDATION_CODES,
  validateAssessmentMisconception,
  validateRemediationStrategy,
  validateMisconceptionRelationship,
  validateMisconceptionRegistry,
  validateMisconceptionInput,
  validateMisconceptionTrace,
  validateAssessmentArtifactWithMisconceptions,
} from './MisconceptionValidation.ts';

// ============================================================================
// FEEDBACK VALIDATION — Feedback deterministic validation
// ============================================================================
export {
  FEEDBACK_VALIDATION_CODES,
  validateAssessmentFeedback,
  validateFeedbackExplanation,
  validateFeedbackRelationship,
  validateFeedbackRegistry,
  validateFeedbackInput,
  validateFeedbackTrace,
  validateAssessmentArtifactWithFeedback,
} from './FeedbackValidation.ts';

// ============================================================================
// LABORATORY ASSESSMENT VALIDATION — Laboratory assessment deterministic validation
// ============================================================================
export {
  LAB_ASSESSMENT_VALIDATION_CODES,
  validateAssessmentLaboratoryIntegration,
  validateLaboratoryEvidenceReference,
  validateLaboratoryObjective,
  validateLaboratoryAssessmentRelationship,
  validateLaboratoryAssessmentRegistry,
  validateLaboratoryAssessmentInput,
  validateLaboratoryAssessmentTrace,
  validateAssessmentArtifactWithLaboratories,
} from './LaboratoryAssessmentValidation.ts';

// ============================================================================
// VISUAL ASSESSMENT VALIDATION — Visual assessment deterministic validation
// ============================================================================
export {
  VISUAL_ASSESSMENT_VALIDATION_CODES,
  validateAssessmentVisualArtifact,
  validateVisualAssessmentReference,
  validateVisualAssessmentTask,
  validateMultimodalEvidence,
  validateVisualAssessmentRelationship,
  validateVisualAssessmentRegistry,
  validateVisualAssessmentInput,
  validateVisualAssessmentTrace,
  validateAssessmentArtifactWithVisualAssets,
} from './VisualAssessmentValidation.ts';

// ============================================================================
// ENGINEERING CASE VALIDATION — Engineering case deterministic validation
// ============================================================================
export {
  ENGINEERING_CASE_VALIDATION_CODES,
  validateEngineeringCaseAssessment,
  validateEngineeringDecisionReference,
  validateEngineeringConstraint,
  validateEngineeringEvidence,
  validateEngineeringCaseRelationship,
  validateEngineeringCaseRegistry,
  validateEngineeringCaseInput,
  validateEngineeringCaseAssessmentTrace,
  validateAssessmentArtifactWithEngineeringCases,
} from './EngineeringCaseAssessmentValidation.ts';

// ============================================================================
// COMPARISON VALIDATION — Comparison deterministic validation
// ============================================================================
export {
  COMPARISON_VALIDATION_CODES,
  validateComparativeAssessment,
  validateComparisonDimension,
  validateTradeOffEvaluation,
  validateDecisionContext,
  validateComparisonRelationship,
  validateComparisonRegistry,
  validateComparisonInput,
  validateComparisonTrace,
  validateAssessmentArtifactWithComparisons,
} from './AssessmentComparisonValidation.ts';

// ============================================================================
// CONSTRAINT VALIDATION — Constraint analysis deterministic validation
// ============================================================================
export {
  CONSTRAINT_VALIDATION_CODES,
  validateEngineeringConstraintAssessment,
  validateConstraintCategory,
  validateConstraintSeverity,
  validateConstraintReasoning,
  validateConstraintRelationship,
  validateConstraintRegistry,
  validateConstraintInput,
  validateConstraintTrace,
  validateAssessmentArtifactWithConstraints,
} from './AssessmentConstraintValidation.ts';

// ============================================================================
// REINFORCEMENT VALIDATION — Reinforcement plan generation deterministic validation
// ============================================================================
export {
  REINFORCEMENT_VALIDATION_CODES,
  validateAssessmentReinforcementPlan,
  validateReinforcementObjective,
  validateReinforcementActivity,
  validateReinforcementRelationship,
  validateReinforcementRegistry,
  validateReinforcementInput,
  validateReinforcementTrace,
  validateAssessmentArtifactWithReinforcement,
} from './AssessmentReinforcementValidation.ts';

// ============================================================================
// PORTFOLIO VALIDATION — Portfolio-oriented evaluation deterministic validation
// ============================================================================
export {
  PORTFOLIO_VALIDATION_CODES,
  validatePortfolioEvaluation,
  validatePortfolioArtifactReference,
  validatePortfolioCompetencyEvidence,
  validatePortfolioShowcaseClassification,
  validatePortfolioRelationship,
  validatePortfolioRegistry,
  validatePortfolioInput,
  validatePortfolioTrace,
  validateAssessmentArtifactWithPortfolio,
} from './AssessmentPortfolioValidation.ts';

// ============================================================================
// HELPERS — Type guards and canonical lookups
// ============================================================================
export {
  isSupportedAssessmentArtifactType,
  isSupportedAssessmentDomain,
  isSupportedAssessmentStatus,
  isSupportedAssessmentGovernance,
  getCanonicalAssessmentArtifactTypes,
  getCanonicalAssessmentDomains,
  getCanonicalAssessmentStatuses,
  getCanonicalAssessmentGovernance,
} from './AssessmentKernel.ts';

// ============================================================================
// COGNITIVE HELPERS — Cognitive type guards and canonical lookups
// ============================================================================
export {
  isSupportedCognitiveLevel,
  isSupportedQuestionType,
  isSupportedReasoningType,
  isSupportedAssessmentObjective,
  isSupportedExpectedEvidenceType,
  isSupportedCognitiveStatus,
  isSupportedCognitiveGovernance,
  getCanonicalCognitiveLevels,
  getCanonicalQuestionTypes,
  getCanonicalReasoningTypes,
  getCanonicalAssessmentObjectives,
  getCanonicalExpectedEvidenceTypes,
  getCanonicalCognitiveStatuses,
} from './AssessmentCognitiveKernel.ts';

// ============================================================================
// VERIFICATION HELPERS — Verification type guards and canonical lookups
// ============================================================================
export {
  isSupportedVerificationType,
  isSupportedResponseType,
  isSupportedMatchingStrategy,
  isSupportedVerificationResult,
  isSupportedVerificationStatus,
  isSupportedVerificationGovernance,
  getCanonicalVerificationTypes,
  getCanonicalResponseTypes,
  getCanonicalMatchingStrategies,
  getCanonicalVerificationResultTypes,
  getCanonicalVerificationStatuses,
} from './AssessmentVerificationKernel.ts';

// ============================================================================
// CONCEPT GRAPH HELPERS — Concept graph type guards and canonical lookups
// ============================================================================
export {
  isSupportedConceptNodeType,
  isSupportedRelationshipType,
  isSupportedGraphCoverageType,
  isSupportedAssessmentGraphObjective,
  isSupportedGraphMappingStatus,
  isSupportedGraphGovernance,
  getCanonicalConceptNodeTypes,
  getCanonicalRelationshipTypes,
  getCanonicalGraphCoverageTypes,
  getCanonicalAssessmentGraphObjectives,
  getCanonicalGraphMappingStatuses,
} from './ConceptGraphKernel.ts';

// ============================================================================
// MISCONCEPTION HELPERS — Misconception type guards and canonical lookups
// ============================================================================
export {
  isSupportedMisconceptionType,
  isSupportedMisconceptionCause,
  isSupportedRemediationType,
  isSupportedRemediationPriority,
  isSupportedMisconceptionSeverity,
  isSupportedMisconceptionStatus,
  isSupportedMisconceptionGovernance,
  getCanonicalMisconceptionTypes,
  getCanonicalMisconceptionCauses,
  getCanonicalRemediationTypes,
  getCanonicalRemediationPriorities,
  getCanonicalMisconceptionSeverities,
  getCanonicalMisconceptionStatuses,
} from './MisconceptionKernel.ts';

// ============================================================================
// FEEDBACK HELPERS — Feedback type guards and canonical lookups
// ============================================================================
export {
  isSupportedFeedbackType,
  isSupportedFeedbackObjective,
  isSupportedFeedbackTone,
  isSupportedFeedbackDeliveryType,
  isSupportedFeedbackPriority,
  isSupportedFeedbackStatus,
  isSupportedFeedbackGovernance,
  getCanonicalFeedbackTypes,
  getCanonicalFeedbackObjectives,
  getCanonicalFeedbackTones,
  getCanonicalFeedbackDeliveryTypes,
  getCanonicalFeedbackPriorities,
  getCanonicalFeedbackStatuses,
} from './FeedbackKernel.ts';

// ============================================================================
// LABORATORY ASSESSMENT HELPERS — Laboratory assessment type guards and canonical lookups
// ============================================================================
export {
  isSupportedLaboratoryAssessmentType,
  isSupportedLaboratoryObjectiveType,
  isSupportedLaboratoryEvidenceType,
  isSupportedLaboratoryMappingType,
  isSupportedLaboratoryAssessmentStatus,
  isSupportedLaboratoryAssessmentGovernance,
  getCanonicalLaboratoryAssessmentTypes,
  getCanonicalLaboratoryObjectiveTypes,
  getCanonicalLaboratoryEvidenceTypes,
  getCanonicalLaboratoryMappingTypes,
  getCanonicalLaboratoryAssessmentStatuses,
} from './LaboratoryAssessmentKernel.ts';

// ============================================================================
// VISUAL ASSESSMENT HELPERS — Visual assessment type guards and canonical lookups
// ============================================================================
export {
  isSupportedVisualAssessmentType,
  isSupportedVisualResourceType,
  isSupportedVisualTaskType,
  isSupportedMultimodalEvidenceType,
  isSupportedVisualGovernanceLevel,
  isSupportedVisualAssessmentStatus,
  isSupportedVisualAssessmentGovernance,
  getCanonicalVisualAssessmentTypes,
  getCanonicalVisualResourceTypes,
  getCanonicalVisualTaskTypes,
  getCanonicalMultimodalEvidenceTypes,
  getCanonicalVisualGovernanceLevels,
  getCanonicalVisualAssessmentStatuses,
} from './VisualAssessmentKernel.ts';

// ============================================================================
// ENGINEERING CASE HELPERS — Engineering case type guards and canonical lookups
// ============================================================================
export {
  isSupportedEngineeringCaseType,
  isSupportedEngineeringDecisionType,
  isSupportedEngineeringConstraintType,
  isSupportedEngineeringEvidenceType,
  isSupportedEngineeringCaseStatus,
  isSupportedEngineeringCaseGovernance,
  getCanonicalEngineeringCaseTypes,
  getCanonicalEngineeringDecisionTypes,
  getCanonicalEngineeringConstraintTypes,
  getCanonicalEngineeringEvidenceTypes,
  getCanonicalEngineeringCaseStatuses,
} from './EngineeringCaseAssessmentKernel.ts';

// ============================================================================
// COMPARISON HELPERS — Comparison type guards and canonical lookups
// ============================================================================
export {
  isSupportedComparisonReasoningType,
  isSupportedComparisonDimension,
  isSupportedTradeOffType,
  isSupportedDecisionContextType,
  isSupportedComparativeAssessmentStatus,
  isSupportedComparativeAssessmentGovernance,
  getCanonicalComparisonReasoningTypes,
  getCanonicalComparisonDimensions,
  getCanonicalTradeOffTypes,
  getCanonicalDecisionContextTypes,
  getCanonicalComparativeAssessmentStatuses,
} from './AssessmentComparisonKernel.ts';

// ============================================================================
// CONSTRAINT HELPERS — Constraint type guards and canonical lookups
// ============================================================================
export {
  isSupportedEngineeringConstraintType as isSupportedConstraintEngineeringConstraintType,
  isSupportedConstraintCategory,
  isSupportedConstraintSeverity,
  isSupportedConstraintReasoning,
  isSupportedConstraintAnalysisStatus,
  isSupportedConstraintGovernance,
  getCanonicalEngineeringConstraintTypes as getCanonicalConstraintEngineeringConstraintTypes,
  getCanonicalConstraintCategories,
  getCanonicalConstraintSeverities,
  getCanonicalConstraintReasoningTypes,
  getCanonicalConstraintAnalysisStatuses,
} from './AssessmentConstraintKernel.ts';

// ============================================================================
// REINFORCEMENT HELPERS — Reinforcement type guards and canonical lookups
// ============================================================================
export {
  isSupportedReinforcementPlanType,
  isSupportedReinforcementObjective,
  isSupportedReinforcementActivity,
  isSupportedReinforcementPriority,
  isSupportedReinforcementStatus,
  isSupportedReinforcementGovernance,
  getCanonicalReinforcementPlanTypes,
  getCanonicalReinforcementObjectives,
  getCanonicalReinforcementActivities,
  getCanonicalReinforcementPriorities,
  getCanonicalReinforcementStatuses,
} from './AssessmentReinforcementKernel.ts';

// ============================================================================
// PORTFOLIO HELPERS — Portfolio type guards and canonical lookups
// ============================================================================
export {
  isSupportedPortfolioEvaluationType,
  isSupportedPortfolioArtifactType,
  isSupportedPortfolioCompetencyType,
  isSupportedShowcaseLevel,
  isSupportedPortfolioEvaluationStatus,
  isSupportedPortfolioGovernance,
  getCanonicalPortfolioEvaluationTypes,
  getCanonicalPortfolioArtifactTypes,
  getCanonicalPortfolioCompetencyTypes,
  getCanonicalShowcaseLevels,
  getCanonicalPortfolioEvaluationStatuses,
} from './AssessmentPortfolioKernel.ts';

// ============================================================================
// EVIDENCE CONTRACTS — Assessment evidence & governance layer
// ============================================================================
export {
  CANONICAL_EVIDENCE_TYPES,
  CANONICAL_EVIDENCE_SOURCES,
  CANONICAL_EVIDENCE_CONFIDENCE_LEVELS,
  CANONICAL_EVIDENCE_GOVERNANCE_LEVELS,
  CANONICAL_EVIDENCE_TRACE_TYPES,
  CANONICAL_EVIDENCE_STATUS,
  type EvidenceType,
  type EvidenceSource,
  type EvidenceConfidenceLevel,
  type EvidenceGovernanceLevel,
  type EvidenceTraceType,
  type EvidenceStatus,
  type AssessmentEvidenceProvenance,
  type AssessmentEvidenceDecision,
  type AssessmentEvidenceTrace,
  type EvidenceReference,
  type EvidenceRelationship,
  type EvidenceGovernance,
  type EvidenceAuditMetadata,
  type AssessmentEvidence,
  type EvidenceRegistryMetadata,
  type EvidenceRegistry,
  type EvidenceInput,
  type AssessmentArtifactWithEvidence,
  type EvidenceValidationError,
  type EvidenceValidationResult,
  type EvidenceRegistryValidationResult,
  type EvidenceInputValidationResult,
  type EvidenceTraceValidationResult,
  type AssessmentArtifactWithEvidenceValidationResult,
} from './AssessmentAgentContract.ts';

// ============================================================================
// EVIDENCE KERNEL — Evidence compose functions
// ============================================================================
export {
  composeAssessmentEvidenceProvenance,
  composeAssessmentEvidenceTrace,
  composeEvidenceReference,
  composeEvidenceRelationship,
  composeEvidenceGovernance,
  composeEvidenceAuditMetadata,
  composeAssessmentEvidence,
  composeEvidenceRegistry,
  composeEvidenceRegistryFromInput,
  composeAssessmentEvidenceCollection,
  composeAssessmentArtifactWithEvidence,
} from './AssessmentEvidenceKernel.ts';

// ============================================================================
// EVIDENCE VALIDATION — Evidence deterministic validation
// ============================================================================
export {
  EVIDENCE_VALIDATION_CODES,
  validateAssessmentEvidence,
  validateEvidenceReference,
  validateEvidenceRelationship,
  validateEvidenceGovernance,
  validateEvidenceAuditMetadata,
  validateEvidenceRegistry,
  validateEvidenceInput,
  validateEvidenceTrace,
  validateAssessmentArtifactWithEvidence,
} from './AssessmentEvidenceValidation.ts';

// ============================================================================
// EVIDENCE HELPERS — Evidence type guards and canonical lookups
// ============================================================================
export {
  isSupportedEvidenceType,
  isSupportedEvidenceSource,
  isSupportedEvidenceConfidenceLevel,
  isSupportedEvidenceGovernanceLevel,
  isSupportedEvidenceTraceType,
  isSupportedEvidenceStatus,
  isSupportedEvidenceGovernance,
  getCanonicalEvidenceTypes,
  getCanonicalEvidenceSources,
  getCanonicalEvidenceConfidenceLevels,
  getCanonicalEvidenceGovernanceLevels,
  getCanonicalEvidenceTraceTypes,
  getCanonicalEvidenceStatuses,
} from './AssessmentEvidenceKernel.ts';

// ============================================================================
// CERTIFICATION CONTRACTS — Assessment certification & structural quality gate
// ============================================================================
export {
  CANONICAL_ASSESSMENT_CERTIFICATION_STATUS,
  CANONICAL_ASSESSMENT_FINDING_SEVERITY,
  CANONICAL_ASSESSMENT_QUALITY_DIMENSIONS,
  type AssessmentCertificationStatus,
  type AssessmentFindingSeverity,
  type AssessmentQualityDimension,
  type AssessmentCertificationFinding,
  type AssessmentCertificationTrace,
  type AssessmentCertificationReport,
  type AssessmentCertificationMetadata,
  type AssessmentCertificationValidationError,
  type AssessmentCertificationValidationResult,
} from './AssessmentAgentContract.ts';

// ============================================================================
// CERTIFICATION KERNEL — Certification compose functions
// ============================================================================
export {
  composeAssessmentCertificationFinding,
  composeAssessmentCertificationReport,
  composeAssessmentCertificationTrace,
  calculateAssessmentCertificationScore,
  isAssessmentCertificationSuccessful,
  certifyAssessmentArtifact,
  validateAssessmentCertification,
} from './AssessmentCertificationEngine.ts';

// ============================================================================
// CERTIFICATION VALIDATION — Certification deterministic validation
// ============================================================================
export {
  ASSESSMENT_CERTIFICATION_VALIDATION_CODES,
  validateAssessmentCertificationReport,
  validateAssessmentCertificationFinding,
  validateAssessmentCertificationStatus,
  validateAssessmentCertificationScore,
} from './AssessmentCertificationValidation.ts';

// ============================================================================
// CERTIFICATION HELPERS — Certification type guards and canonical lookups
// ============================================================================
export {
  isSupportedAssessmentCertificationStatus,
  isSupportedAssessmentFindingSeverity,
  isSupportedAssessmentQualityDimension,
  getCanonicalAssessmentCertificationStatuses,
  getCanonicalAssessmentFindingSeverities,
  getCanonicalAssessmentQualityDimensions,
} from './AssessmentCertificationEngine.ts';

// ============================================================================
// FACADE CONTRACTS — Public API consolidation & assessment pipeline facade
// ============================================================================
export {
  CANONICAL_ASSESSMENT_FACADE_STATUS,
  type AssessmentFacadeStatus,
  type AssessmentFacadeTraceMetadata,
  type AssessmentFacadeValidationResult,
  type AssessmentFacadeArtifactResult,
  type AssessmentFacadeCertificationResult,
  type AssessmentFacadeCompleteResult,
} from './AssessmentAgentContract.ts';

// ============================================================================
// FACADE KERNEL — Facade compose functions
// ============================================================================
export {
  composeAssessmentArtifact,
  certifyAssessmentFacadeArtifact,
  composeAndCertifyAssessmentArtifact,
  validateAssessmentFacadeArtifact,
  validateAssessmentFacadeCertification,
  validateAssessmentFacadeComplete,
} from './AssessmentPipelineFacade.ts';

// ============================================================================
// FACADE HELPERS — Facade type guards and canonical lookups
// ============================================================================
export {
  isSupportedAssessmentFacadeStatus,
  getCanonicalAssessmentFacadeStatuses,
} from './AssessmentPipelineFacade.ts';

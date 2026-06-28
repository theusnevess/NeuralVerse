/**
 * NV-1900-D7-OPT-01 / D7-OPT-02 / D7-OPT-03 / D7-OPT-04 / D7-OPT-05 / D7-OPT-06 / D7-OPT-07 / D7-OPT-08 / D7-OPT-09 / D7-OPT-10 / D7-OPT-11 / D7-OPT-12 / D7-OPT-13 / D7-OPT-14 — Application Pipeline Kernel
 *
 * Public API for the Application Contract & Registry Kernel.
 * Extended with Systematic Use Case Mapping (D7-OPT-02).
 * Extended with Theory-to-System Architecture Mapping (D7-OPT-03).
 * Extended with Complete Case Study Modeling (D7-OPT-04).
 * Extended with Engineering Trade-Off Analysis (D7-OPT-05).
 * Extended with Laboratory Application Integration (D7-OPT-06).
 * Extended with Solution Comparison & Alternative Technique Mapping (D7-OPT-07).
 * Extended with Common Adoption Mistakes & Engineering Judgment (D7-OPT-08).
 * Extended with MLOps Lifecycle & Production Constraint Modeling (D7-OPT-09).
 * Extended with Technology Maturity Classification (D7-OPT-10).
 * Extended with Portfolio-Oriented Project Mapping (D7-OPT-11).
 * Extended with Visual Application Layer & Asset Governance (D7-OPT-12).
 * Extended with Application Certification & Structural Quality Gate (D7-OPT-13).
 * Extended with Public API Consolidation & Application Pipeline Facade (D7-OPT-14).
 * Organized into: contracts, kernel, validation, and types.
 */

// ============================================================================
// CONTRACTS — Domain types and constants
// ============================================================================

export {
  CANONICAL_APPLICATION_ARTIFACT_TYPES,
  CANONICAL_APPLICATION_DOMAINS,
  CANONICAL_APPLICATION_STATUS,
  CANONICAL_APPLICATION_GOVERNANCE,
  type ApplicationArtifactType,
  type ApplicationDomain,
  type ApplicationStatus,
  type ApplicationGovernanceStatus,
  type ApplicationProvenance,
  type ApplicationDecision,
  type ApplicationTrace,
  type ApplicationNode,
  type ApplicationRegistryMetadata,
  type ApplicationRegistry,
  type ApplicationInput,
  type ApplicationValidationError,
  type ApplicationValidationResult,
  type ApplicationNodeValidationResult,
  type ApplicationRegistryValidationResult,
  type ApplicationInputValidationResult,
  type ApplicationTraceValidationResult,
} from './ApplicationAgentContract.ts';

// ============================================================================
// APPLICATION KERNEL — Deterministic composition functions
// ============================================================================

export {
  composeApplicationProvenance,
  composeApplicationTrace,
  composeApplicationNode,
  composeApplicationRegistry,
  composeApplicationRegistryFromInput,
  composeApplication,
  isSupportedApplicationArtifactType,
  isSupportedApplicationDomain,
  isSupportedApplicationStatus,
  isSupportedApplicationGovernance,
  getCanonicalApplicationArtifactTypes,
  getCanonicalApplicationDomains,
  getCanonicalApplicationStatuses,
  getCanonicalApplicationGovernance,
} from './ApplicationKernel.ts';

// ============================================================================
// APPLICATION VALIDATION — Deterministic validation
// ============================================================================

export {
  APPLICATION_VALIDATION_CODES,
  validateApplicationNode,
  validateApplicationRegistry,
  validateApplicationInput,
  validateApplicationTrace,
} from './ApplicationValidation.ts';

// ============================================================================
// D7-OPT-02 — USE CASE CONTRACTS — Domain types and constants
// ============================================================================

export {
  CANONICAL_USE_CASE_TYPES,
  CANONICAL_ENGINEERING_PROBLEM_TYPES,
  CANONICAL_BUSINESS_VALUE_TYPES,
  CANONICAL_APPLICATION_CONTEXT_TYPES,
  CANONICAL_USE_CASE_STATUS,
  type UseCaseType,
  type EngineeringProblemType,
  type BusinessValueType,
  type ApplicationContextType,
  type UseCaseStatus,
  type UseCaseProvenance,
  type ApplicationUseCase,
  type UseCaseRelationship,
  type UseCaseDecision,
  type UseCaseTrace,
  type UseCaseRegistryMetadata,
  type UseCaseRegistry,
  type UseCaseInput,
  type UseCaseValidationError,
  type UseCaseValidationResult,
  type UseCaseNodeValidationResult,
  type UseCaseRelationshipValidationResult,
  type UseCaseRegistryValidationResult,
  type UseCaseInputValidationResult,
  type UseCaseTraceValidationResult,
  type ApplicationArtifactWithUseCases,
  type ApplicationArtifactWithUseCasesValidationResult,
} from './ApplicationAgentContract.ts';

// ============================================================================
// USE CASE KERNEL — Deterministic composition functions
// ============================================================================

export {
  composeUseCaseProvenance,
  composeApplicationUseCase,
  composeUseCaseRelationship,
  composeUseCaseTrace,
  composeUseCaseRegistry,
  composeUseCaseRegistryFromInput,
  composeApplicationUseCases,
  composeApplicationArtifactWithUseCases,
  isSupportedUseCaseType,
  isSupportedEngineeringProblemType,
  isSupportedBusinessValueType,
  isSupportedApplicationContext,
  isSupportedUseCaseStatus,
  isSupportedUseCaseGovernance,
  getCanonicalUseCaseTypes,
  getCanonicalEngineeringProblemTypes,
  getCanonicalBusinessValueTypes,
  getCanonicalApplicationContexts,
  getCanonicalUseCaseStatuses,
} from './UseCaseKernel.ts';

// ============================================================================
// USE CASE VALIDATION — Deterministic validation
// ============================================================================

export {
  USE_CASE_VALIDATION_CODES,
  validateApplicationUseCase,
  validateUseCaseRelationship,
  validateUseCaseRegistry,
  validateUseCaseInput,
  validateUseCaseTrace,
} from './UseCaseValidation.ts';

// ============================================================================
// D7-OPT-03 — ARCHITECTURE CONTRACTS — Domain types and constants
// ============================================================================

export {
  CANONICAL_SYSTEM_ARCHITECTURE_TYPES,
  CANONICAL_SYSTEM_COMPONENT_TYPES,
  CANONICAL_DATA_FLOW_TYPES,
  CANONICAL_ARCHITECTURE_LAYER_TYPES,
  CANONICAL_SYSTEM_CONSTRAINT_TYPES,
  CANONICAL_SYSTEM_ARCHITECTURE_STATUS,
  type SystemArchitectureType,
  type SystemComponentType,
  type DataFlowType,
  type ArchitectureLayerType,
  type SystemConstraintType,
  type SystemArchitectureStatus,
  type SystemArchitectureProvenance,
  type SystemArchitecture,
  type SystemComponent,
  type SystemDataFlow,
  type SystemConstraint,
  type ArchitectureDecision,
  type ArchitectureTrace,
  type ArchitectureRegistryMetadata,
  type ArchitectureRegistry,
  type ArchitectureInput,
  type ArchitectureValidationError,
  type ArchitectureValidationResult,
  type ArchitectureRegistryValidationResult,
  type ArchitectureInputValidationResult,
  type ArchitectureTraceValidationResult,
  type ApplicationArtifactWithArchitectures,
  type ApplicationArtifactWithArchitecturesValidationResult,
} from './ApplicationAgentContract.ts';

// ============================================================================
// ARCHITECTURE KERNEL — Deterministic composition functions
// ============================================================================

export {
  composeSystemArchitectureProvenance,
  composeSystemArchitecture,
  composeSystemComponent,
  composeSystemDataFlow,
  composeSystemConstraint,
  composeArchitectureTrace,
  composeArchitectureRegistry,
  composeArchitectureRegistryFromInput,
  composeApplicationArchitectures,
  composeApplicationArtifactWithArchitectures,
  isSupportedSystemArchitectureType,
  isSupportedSystemComponentType,
  isSupportedDataFlowType,
  isSupportedArchitectureLayerType,
  isSupportedSystemConstraintType,
  isSupportedSystemArchitectureStatus,
  isSupportedSystemArchitectureGovernance,
  getCanonicalSystemArchitectureTypes,
  getCanonicalSystemComponentTypes,
  getCanonicalDataFlowTypes,
  getCanonicalArchitectureLayerTypes,
  getCanonicalSystemConstraintTypes,
  getCanonicalSystemArchitectureStatuses,
} from './SystemArchitectureKernel.ts';

// ============================================================================
// ARCHITECTURE VALIDATION — Deterministic validation
// ============================================================================

export {
  ARCHITECTURE_VALIDATION_CODES,
  validateSystemArchitecture,
  validateSystemComponent,
  validateSystemDataFlow,
  validateSystemConstraint,
  validateArchitectureRegistry,
  validateArchitectureInput,
  validateArchitectureTrace,
  validateApplicationArtifactWithArchitectures,
} from './SystemArchitectureValidation.ts';

// ============================================================================
// D7-OPT-04 — CASE STUDY CONTRACTS — Domain types and constants
// ============================================================================

export {
  CANONICAL_CASE_STUDY_TYPES,
  CANONICAL_CASE_STUDY_PROBLEM_DOMAINS,
  CANONICAL_DATASET_ROLES,
  CANONICAL_ENGINEERING_DECISION_TYPES,
  CANONICAL_CASE_STUDY_LESSON_TYPES,
  CANONICAL_CASE_STUDY_STATUS,
  type CaseStudyType,
  type CaseStudyProblemDomain,
  type DatasetRole,
  type EngineeringDecisionType,
  type CaseStudyLessonType,
  type CaseStudyStatus,
  type CaseStudyProvenance,
  type ApplicationCaseStudy,
  type CaseStudyDataset,
  type EngineeringDecision,
  type EngineeringLesson,
  type CaseStudyDecision,
  type CaseStudyTrace,
  type CaseStudyRegistryMetadata,
  type CaseStudyRegistry,
  type CaseStudyInput,
  type CaseStudyValidationError,
  type CaseStudyValidationResult,
  type CaseStudyRegistryValidationResult,
  type CaseStudyInputValidationResult,
  type CaseStudyTraceValidationResult,
  type ApplicationArtifactWithCaseStudies,
  type ApplicationArtifactWithCaseStudiesValidationResult,
} from './ApplicationAgentContract.ts';

// ============================================================================
// CASE STUDY KERNEL — Deterministic composition functions
// ============================================================================

export {
  composeCaseStudyProvenance,
  composeApplicationCaseStudy,
  composeCaseStudyDataset,
  composeEngineeringDecision,
  composeEngineeringLesson,
  composeCaseStudyTrace,
  composeCaseStudyRegistry,
  composeCaseStudyRegistryFromInput,
  composeApplicationCaseStudies,
  composeApplicationArtifactWithCaseStudies,
  isSupportedCaseStudyType,
  isSupportedProblemDomain,
  isSupportedDatasetRole,
  isSupportedEngineeringDecisionType,
  isSupportedLessonType,
  isSupportedCaseStudyStatus,
  isSupportedCaseStudyGovernance,
  getCanonicalCaseStudyTypes,
  getCanonicalProblemDomains,
  getCanonicalDatasetRoles,
  getCanonicalEngineeringDecisionTypes,
  getCanonicalLessonTypes,
  getCanonicalCaseStudyStatuses,
} from './CaseStudyKernel.ts';

// ============================================================================
// CASE STUDY VALIDATION — Deterministic validation
// ============================================================================

export {
  CASE_STUDY_VALIDATION_CODES,
  validateApplicationCaseStudy,
  validateCaseStudyDataset,
  validateEngineeringDecision,
  validateEngineeringLesson,
  validateCaseStudyRegistry,
  validateCaseStudyInput,
  validateCaseStudyTrace,
  validateApplicationArtifactWithCaseStudies,
} from './CaseStudyValidation.ts';

// ============================================================================
// D7-OPT-05 — TRADE-OFF CONTRACTS — Domain types and constants
// ============================================================================

export {
  CANONICAL_TRADE_OFF_TYPES,
  CANONICAL_ENGINEERING_DIMENSIONS,
  CANONICAL_TRADE_OFF_SEVERITY,
  CANONICAL_DECISION_DRIVERS,
  CANONICAL_TRADE_OFF_STATUS,
  type TradeOffType,
  type EngineeringDimension,
  type TradeOffSeverity,
  type DecisionDriver,
  type TradeOffStatus,
  type TradeOffProvenance,
  type EngineeringTradeOff,
  type TradeOffDimension,
  type TradeOffRelationship,
  type TradeOffDecision,
  type TradeOffTrace,
  type TradeOffRegistryMetadata,
  type TradeOffRegistry,
  type TradeOffInput,
  type TradeOffValidationError,
  type TradeOffValidationResult,
  type TradeOffRegistryValidationResult,
  type TradeOffInputValidationResult,
  type TradeOffTraceValidationResult,
  type ApplicationArtifactWithTradeOffs,
  type ApplicationArtifactWithTradeOffsValidationResult,
} from './ApplicationAgentContract.ts';

// ============================================================================
// TRADE-OFF KERNEL — Deterministic composition functions
// ============================================================================

export {
  composeTradeOffProvenance,
  composeEngineeringTradeOff,
  composeTradeOffDimension,
  composeTradeOffRelationship,
  composeTradeOffTrace,
  composeTradeOffRegistry,
  composeTradeOffRegistryFromInput,
  composeEngineeringTradeOffs,
  composeApplicationArtifactWithTradeOffs,
  isSupportedTradeOffType,
  isSupportedEngineeringDimension,
  isSupportedTradeOffSeverity,
  isSupportedDecisionDriver,
  isSupportedTradeOffStatus,
  isSupportedTradeOffGovernance,
  getCanonicalTradeOffTypes,
  getCanonicalEngineeringDimensions,
  getCanonicalTradeOffSeverities,
  getCanonicalDecisionDrivers,
  getCanonicalTradeOffStatuses,
} from './TradeOffKernel.ts';

// ============================================================================
// TRADE-OFF VALIDATION — Deterministic validation
// ============================================================================

export {
  TRADE_OFF_VALIDATION_CODES,
  validateEngineeringTradeOff,
  validateTradeOffDimension,
  validateTradeOffRelationship,
  validateTradeOffRegistry,
  validateTradeOffInput,
  validateTradeOffTrace,
  validateApplicationArtifactWithTradeOffs,
} from './TradeOffValidation.ts';

// ============================================================================
// D7-OPT-06 — LABORATORY INTEGRATION CONTRACTS — Domain types and constants
// ============================================================================

export {
  CANONICAL_LABORATORY_INTEGRATION_TYPES,
  CANONICAL_LABORATORY_MAPPING_TYPES,
  CANONICAL_LABORATORY_OBJECTIVE_TYPES,
  CANONICAL_LABORATORY_EVIDENCE_TYPES,
  CANONICAL_LABORATORY_INTEGRATION_STATUS,
  type LaboratoryIntegrationType,
  type LaboratoryMappingType,
  type LaboratoryObjectiveType,
  type LaboratoryEvidenceType,
  type LaboratoryIntegrationStatus,
  type LaboratoryIntegrationProvenance,
  type ApplicationLaboratoryIntegration,
  type LaboratoryEvidenceReference,
  type LaboratoryIntegrationRelationship,
  type LaboratoryIntegrationDecision,
  type LaboratoryIntegrationTrace,
  type LaboratoryIntegrationRegistryMetadata,
  type LaboratoryIntegrationRegistry,
  type LaboratoryIntegrationInput,
  type LaboratoryIntegrationValidationError,
  type LaboratoryIntegrationValidationResult,
  type LaboratoryIntegrationRegistryValidationResult,
  type LaboratoryIntegrationInputValidationResult,
  type LaboratoryIntegrationTraceValidationResult,
  type ApplicationArtifactWithLaboratories,
  type ApplicationArtifactWithLaboratoriesValidationResult,
} from './ApplicationAgentContract.ts';

// ============================================================================
// LABORATORY INTEGRATION KERNEL — Deterministic composition functions
// ============================================================================

export {
  composeLaboratoryIntegrationProvenance,
  composeApplicationLaboratoryIntegration,
  composeLaboratoryEvidenceReference,
  composeLaboratoryIntegrationRelationship,
  composeLaboratoryIntegrationTrace,
  composeLaboratoryIntegrationRegistry,
  composeLaboratoryIntegrationRegistryFromInput,
  composeApplicationLaboratoryIntegrations,
  composeApplicationArtifactWithLaboratories,
  isSupportedLaboratoryIntegrationType,
  isSupportedLaboratoryMappingType,
  isSupportedLaboratoryObjectiveType,
  isSupportedLaboratoryEvidenceType,
  isSupportedLaboratoryIntegrationStatus,
  isSupportedLaboratoryIntegrationGovernance,
  getCanonicalLaboratoryIntegrationTypes,
  getCanonicalLaboratoryMappingTypes,
  getCanonicalLaboratoryObjectiveTypes,
  getCanonicalLaboratoryEvidenceTypes,
  getCanonicalLaboratoryIntegrationStatuses,
} from './LaboratoryIntegrationKernel.ts';

// ============================================================================
// LABORATORY INTEGRATION VALIDATION — Deterministic validation
// ============================================================================

export {
  LAB_INTEGRATION_VALIDATION_CODES,
  validateApplicationLaboratoryIntegration,
  validateLaboratoryEvidenceReference,
  validateLaboratoryIntegrationRelationship,
  validateLaboratoryIntegrationRegistry,
  validateLaboratoryIntegrationInput,
  validateLaboratoryIntegrationTrace,
  validateApplicationArtifactWithLaboratories,
} from './LaboratoryIntegrationValidation.ts';

// ============================================================================
// D7-OPT-07 — SOLUTION COMPARISON CONTRACTS — Domain types and constants
// ============================================================================

export {
  CANONICAL_SOLUTION_TYPES,
  CANONICAL_COMPARISON_TYPES,
  CANONICAL_ALTERNATIVE_TECHNIQUE_TYPES,
  CANONICAL_COMPARISON_DIMENSIONS,
  CANONICAL_SOLUTION_COMPARISON_STATUS,
  type SolutionType,
  type ComparisonType,
  type AlternativeTechniqueType,
  type ComparisonDimension,
  type SolutionComparisonStatus,
  type SolutionComparisonProvenance,
  type EngineeringSolution,
  type SolutionComparison,
  type AlternativeTechnique,
  type ComparisonDimensionEntry,
  type SolutionComparisonDecision,
  type SolutionComparisonTrace,
  type SolutionComparisonRegistryMetadata,
  type SolutionComparisonRegistry,
  type SolutionComparisonInput,
  type SolutionComparisonValidationError,
  type SolutionComparisonValidationResult,
  type SolutionComparisonRegistryValidationResult,
  type SolutionComparisonInputValidationResult,
  type SolutionComparisonTraceValidationResult,
  type ApplicationArtifactWithSolutionComparisons,
  type ApplicationArtifactWithSolutionComparisonsValidationResult,
} from './ApplicationAgentContract.ts';

// ============================================================================
// SOLUTION COMPARISON KERNEL — Deterministic composition functions
// ============================================================================

export {
  composeSolutionComparisonProvenance,
  composeEngineeringSolution,
  composeSolutionComparison,
  composeAlternativeTechnique,
  composeComparisonDimension,
  composeSolutionComparisonTrace,
  composeSolutionComparisonRegistry,
  composeSolutionComparisonRegistryFromInput,
  composeSolutionComparisons,
  composeApplicationArtifactWithSolutionComparisons,
  isSupportedSolutionType,
  isSupportedComparisonType,
  isSupportedAlternativeTechniqueType,
  isSupportedComparisonDimension,
  isSupportedSolutionComparisonStatus,
  isSupportedSolutionComparisonGovernance,
  getCanonicalSolutionTypes,
  getCanonicalComparisonTypes,
  getCanonicalAlternativeTechniqueTypes,
  getCanonicalComparisonDimensions,
  getCanonicalSolutionComparisonStatuses,
} from './SolutionComparisonKernel.ts';

// ============================================================================
// SOLUTION COMPARISON VALIDATION — Deterministic validation
// ============================================================================

export {
  SOLUTION_COMPARISON_VALIDATION_CODES,
  validateEngineeringSolution,
  validateSolutionComparison,
  validateAlternativeTechnique,
  validateComparisonDimension,
  validateSolutionComparisonRegistry,
  validateSolutionComparisonInput,
  validateSolutionComparisonTrace,
  validateApplicationArtifactWithSolutionComparisons,
} from './SolutionComparisonValidation.ts';

// ============================================================================
// D7-OPT-08 — ENGINEERING JUDGMENT CONTRACTS — Domain types and constants
// ============================================================================

export {
  CANONICAL_ENGINEERING_MISTAKE_TYPES,
  CANONICAL_ADOPTION_PITFALL_TYPES,
  CANONICAL_ENGINEERING_JUDGMENT_TYPES,
  CANONICAL_ENGINEERING_ANTI_PATTERN_TYPES,
  CANONICAL_ENGINEERING_JUDGMENT_SEVERITY,
  CANONICAL_ENGINEERING_JUDGMENT_STATUS,
  type EngineeringMistakeType,
  type AdoptionPitfallType,
  type EngineeringJudgmentType,
  type EngineeringAntiPatternType,
  type EngineeringJudgmentSeverity,
  type EngineeringJudgmentStatus,
  type EngineeringJudgmentProvenance,
  type EngineeringMistake,
  type AdoptionPitfall,
  type EngineeringJudgment,
  type EngineeringAntiPattern,
  type EngineeringJudgmentDecision,
  type EngineeringJudgmentTrace,
  type EngineeringJudgmentRegistryMetadata,
  type EngineeringJudgmentRegistry,
  type EngineeringJudgmentInput,
  type EngineeringJudgmentValidationError,
  type EngineeringJudgmentValidationResult,
  type EngineeringJudgmentRegistryValidationResult,
  type EngineeringJudgmentInputValidationResult,
  type EngineeringJudgmentTraceValidationResult,
  type ApplicationArtifactWithEngineeringJudgment,
  type ApplicationArtifactWithEngineeringJudgmentValidationResult,
} from './ApplicationAgentContract.ts';

// ============================================================================
// ENGINEERING JUDGMENT KERNEL — Deterministic composition functions
// ============================================================================

export {
  composeEngineeringJudgmentProvenance,
  composeEngineeringMistake,
  composeAdoptionPitfall,
  composeEngineeringJudgment,
  composeEngineeringAntiPattern,
  composeEngineeringJudgmentTrace,
  composeEngineeringJudgmentRegistry,
  composeEngineeringJudgmentRegistryFromInput,
  composeEngineeringJudgments,
  composeApplicationArtifactWithEngineeringJudgment,
  isSupportedEngineeringMistakeType,
  isSupportedAdoptionPitfallType,
  isSupportedEngineeringJudgmentType,
  isSupportedEngineeringAntiPatternType,
  isSupportedEngineeringJudgmentSeverity,
  isSupportedEngineeringJudgmentStatus,
  isSupportedEngineeringJudgmentGovernance,
  getCanonicalEngineeringMistakeTypes,
  getCanonicalAdoptionPitfallTypes,
  getCanonicalEngineeringJudgmentTypes,
  getCanonicalEngineeringAntiPatternTypes,
  getCanonicalEngineeringJudgmentSeverities,
  getCanonicalEngineeringJudgmentStatuses,
} from './EngineeringJudgmentKernel.ts';

// ============================================================================
// ENGINEERING JUDGMENT VALIDATION — Deterministic validation
// ============================================================================

export {
  ENGINEERING_JUDGMENT_VALIDATION_CODES,
  validateEngineeringMistake,
  validateAdoptionPitfall,
  validateEngineeringJudgmentEntry,
  validateEngineeringAntiPattern,
  validateEngineeringJudgmentRegistry,
  validateEngineeringJudgmentInput,
  validateEngineeringJudgmentTrace,
  validateApplicationArtifactWithEngineeringJudgment,
} from './EngineeringJudgmentValidation.ts';

// ============================================================================
// D7-OPT-09 — MLOPS LIFECYCLE CONTRACTS — Domain types and constants
// ============================================================================

export {
  CANONICAL_MLOPS_LIFECYCLE_STAGES,
  CANONICAL_PRODUCTION_CONSTRAINT_TYPES,
  CANONICAL_DEPLOYMENT_TYPES,
  CANONICAL_MONITORING_TYPES,
  CANONICAL_PRODUCTION_READINESS_LEVELS,
  CANONICAL_MLOPS_STATUS,
  type MLOpsLifecycleStage,
  type ProductionConstraintType,
  type DeploymentType,
  type MonitoringType,
  type ProductionReadinessLevel,
  type MLOpsStatus,
  type MLOpsProvenance,
  type MLOpsLifecycle,
  type ProductionConstraint,
  type DeploymentProfile,
  type MonitoringRequirement,
  type MLOpsDecision,
  type MLOpsTraceDecision,
  type MLOpsTrace,
  type MLOpsRegistryMetadata,
  type MLOpsRegistry,
  type MLOpsInput,
  type MLOpsValidationError,
  type MLOpsValidationResult,
  type MLOpsRegistryValidationResult,
  type MLOpsInputValidationResult,
  type MLOpsTraceValidationResult,
  type ApplicationArtifactWithMLOps,
  type ApplicationArtifactWithMLOpsValidationResult,
} from './ApplicationAgentContract.ts';

// ============================================================================
// MLOPS LIFECYCLE KERNEL — Deterministic composition functions
// ============================================================================

export {
  composeMLOpsProvenance,
  composeMLOpsLifecycle,
  composeProductionConstraint,
  composeDeploymentProfile,
  composeMonitoringRequirement,
  composeMLOpsDecision,
  composeMLOpsTrace,
  composeMLOpsRegistry,
  composeMLOpsRegistryFromInput,
  composeMLOpsLifecycleMetadata,
  composeApplicationArtifactWithMLOps,
  isSupportedLifecycleStage,
  isSupportedProductionConstraint,
  isSupportedDeploymentType,
  isSupportedMonitoringType,
  isSupportedProductionReadiness,
  isSupportedMLOpsStatus,
  isSupportedMLOpsGovernance,
  getCanonicalLifecycleStages,
  getCanonicalProductionConstraintTypes,
  getCanonicalDeploymentTypes,
  getCanonicalMonitoringTypes,
  getCanonicalProductionReadinessLevels,
  getCanonicalMLOpsStatuses,
} from './MLOpsLifecycleKernel.ts';

// ============================================================================
// MLOPS LIFECYCLE VALIDATION — Deterministic validation
// ============================================================================

export {
  MLOPS_VALIDATION_CODES,
  validateMLOpsLifecycle,
  validateProductionConstraint,
  validateDeploymentProfile,
  validateMonitoringRequirement,
  validateMLOpsRegistry,
  validateMLOpsInput,
  validateMLOpsTrace,
  validateApplicationArtifactWithMLOps,
} from './MLOpsLifecycleValidation.ts';

// ============================================================================
// D7-OPT-10 — TECHNOLOGY MATURITY CONTRACTS — Domain types and constants
// ============================================================================

export {
  CANONICAL_TECHNOLOGY_MATURITY_LEVELS,
  CANONICAL_ECOSYSTEM_STABILITY_TYPES,
  CANONICAL_INDUSTRY_ADOPTION_TYPES,
  CANONICAL_TECHNOLOGY_LIFECYCLE_TYPES,
  CANONICAL_READINESS_INDICATORS,
  CANONICAL_TECHNOLOGY_MATURITY_STATUS,
  type TechnologyMaturityLevel,
  type EcosystemStabilityType,
  type IndustryAdoptionType,
  type TechnologyLifecycleType,
  type ReadinessIndicatorType,
  type TechnologyMaturityStatus,
  type TechnologyMaturityProvenance,
  type TechnologyMaturityProfile,
  type EcosystemProfile,
  type IndustryAdoptionProfile,
  type LifecycleClassification,
  type ReadinessIndicator,
  type TechnologyMaturityDecision,
  type TechnologyMaturityTraceDecision,
  type TechnologyMaturityTrace,
  type TechnologyMaturityRegistryMetadata,
  type TechnologyMaturityRegistry,
  type TechnologyMaturityInput,
  type TechnologyMaturityValidationError,
  type TechnologyMaturityValidationResult,
  type TechnologyMaturityRegistryValidationResult,
  type TechnologyMaturityInputValidationResult,
  type TechnologyMaturityTraceValidationResult,
  type ApplicationArtifactWithTechnologyMaturity,
  type ApplicationArtifactWithTechnologyMaturityValidationResult,
} from './ApplicationAgentContract.ts';

// ============================================================================
// TECHNOLOGY MATURITY KERNEL — Deterministic composition functions
// ============================================================================

export {
  composeTechnologyMaturityProvenance,
  composeTechnologyMaturityProfile,
  composeEcosystemProfile,
  composeIndustryAdoptionProfile,
  composeLifecycleClassification,
  composeReadinessIndicator,
  composeTechnologyMaturityDecision,
  composeTechnologyMaturityTrace,
  composeTechnologyMaturityRegistry,
  composeTechnologyMaturityRegistryFromInput,
  composeTechnologyMaturity,
  composeApplicationArtifactWithTechnologyMaturity,
  isSupportedTechnologyMaturityLevel,
  isSupportedEcosystemStability,
  isSupportedIndustryAdoption,
  isSupportedLifecycleClassification,
  isSupportedReadinessIndicator,
  isSupportedTechnologyMaturityStatus,
  isSupportedTechnologyMaturityGovernance,
  getCanonicalTechnologyMaturityLevels,
  getCanonicalEcosystemStabilityTypes,
  getCanonicalIndustryAdoptionTypes,
  getCanonicalLifecycleClassificationTypes,
  getCanonicalReadinessIndicators,
  getCanonicalTechnologyMaturityStatuses,
} from './TechnologyMaturityKernel.ts';

// ============================================================================
// TECHNOLOGY MATURITY VALIDATION — Deterministic validation
// ============================================================================

export {
  TECHNOLOGY_MATURITY_VALIDATION_CODES,
  validateTechnologyMaturityProfile,
  validateEcosystemProfile,
  validateIndustryAdoptionProfile,
  validateLifecycleClassification,
  validateReadinessIndicator,
  validateTechnologyMaturityRegistry,
  validateTechnologyMaturityInput,
  validateTechnologyMaturityTrace,
  validateApplicationArtifactWithTechnologyMaturity,
} from './TechnologyMaturityValidation.ts';

// ============================================================================
// D7-OPT-11 — PORTFOLIO PROJECT CONTRACTS — Domain types and constants
// ============================================================================

export {
  CANONICAL_PORTFOLIO_PROJECT_TYPES,
  CANONICAL_PROJECT_DELIVERABLE_TYPES,
  CANONICAL_PROJECT_COMPETENCY_TYPES,
  CANONICAL_PROJECT_COMPLEXITY_LEVELS,
  CANONICAL_PORTFOLIO_SHOWCASE_TYPES,
  CANONICAL_PORTFOLIO_STATUS,
  type PortfolioProjectType,
  type ProjectDeliverableType,
  type ProjectCompetencyType,
  type ProjectComplexityLevel,
  type PortfolioShowcaseType,
  type PortfolioStatus,
  type PortfolioProjectProvenance,
  type PortfolioProject,
  type ProjectDeliverable,
  type CompetencyEvidence,
  type PortfolioShowcase,
  type PortfolioProjectDecision,
  type PortfolioProjectTraceDecision,
  type PortfolioProjectTrace,
  type PortfolioProjectRegistryMetadata,
  type PortfolioProjectRegistry,
  type PortfolioProjectInput,
  type PortfolioProjectValidationError,
  type PortfolioProjectValidationResult,
  type PortfolioProjectRegistryValidationResult,
  type PortfolioProjectInputValidationResult,
  type PortfolioProjectTraceValidationResult,
  type ApplicationArtifactWithPortfolioProjects,
  type ApplicationArtifactWithPortfolioProjectsValidationResult,
} from './ApplicationAgentContract.ts';

// ============================================================================
// PORTFOLIO PROJECT KERNEL — Deterministic composition functions
// ============================================================================

export {
  composePortfolioProjectProvenance,
  composePortfolioProject,
  composeProjectDeliverable,
  composeCompetencyEvidence,
  composePortfolioShowcase,
  composePortfolioProjectDecision,
  composePortfolioProjectTrace,
  composePortfolioProjectRegistry,
  composePortfolioProjectRegistryFromInput,
  composePortfolioProjects,
  composeApplicationArtifactWithPortfolioProjects,
  isSupportedPortfolioProjectType,
  isSupportedProjectDeliverableType,
  isSupportedCompetencyType,
  isSupportedPortfolioShowcaseType,
  isSupportedProjectComplexityLevel,
  isSupportedPortfolioStatus,
  isSupportedPortfolioGovernance,
  getCanonicalPortfolioProjectTypes,
  getCanonicalProjectDeliverableTypes,
  getCanonicalCompetencyTypes,
  getCanonicalPortfolioShowcaseTypes,
  getCanonicalProjectComplexityLevels,
  getCanonicalPortfolioStatuses,
} from './PortfolioProjectKernel.ts';

// ============================================================================
// PORTFOLIO PROJECT VALIDATION — Deterministic validation
// ============================================================================

export {
  PORTFOLIO_VALIDATION_CODES,
  validatePortfolioProject,
  validateProjectDeliverable,
  validateCompetencyEvidence,
  validatePortfolioShowcase,
  validatePortfolioProjectRegistry,
  validatePortfolioProjectInput,
  validatePortfolioProjectTrace,
  validateApplicationArtifactWithPortfolioProjects,
} from './PortfolioProjectValidation.ts';

// ============================================================================
// D7-OPT-12 — VISUAL ASSET CONTRACTS — Domain types and constants
// ============================================================================

export {
  CANONICAL_VISUAL_ASSET_TYPES,
  CANONICAL_VISUAL_REPRESENTATION_TYPES,
  CANONICAL_VISUAL_PURPOSE_TYPES,
  CANONICAL_VISUAL_RELATIONSHIP_TYPES,
  CANONICAL_VISUAL_GOVERNANCE_LEVELS,
  CANONICAL_VISUAL_ASSET_STATUS,
  type VisualAssetType,
  type VisualRepresentationType,
  type VisualPurposeType,
  type VisualRelationshipType,
  type VisualGovernanceLevel,
  type VisualAssetStatus,
  type VisualAssetProvenance,
  type VisualAsset,
  type VisualRelationship,
  type VisualGovernance,
  type VisualAssetDecision,
  type VisualAssetTraceDecision,
  type VisualAssetTrace,
  type VisualAssetRegistryMetadata,
  type VisualAssetRegistry,
  type VisualAssetInput,
  type VisualAssetValidationError,
  type VisualAssetValidationResult,
  type VisualAssetRegistryValidationResult,
  type VisualAssetInputValidationResult,
  type VisualAssetTraceValidationResult,
  type ApplicationArtifactWithVisualAssets,
  type ApplicationArtifactWithVisualAssetsValidationResult,
} from './ApplicationAgentContract.ts';

// ============================================================================
// VISUAL ASSET KERNEL — Deterministic composition functions
// ============================================================================

export {
  composeVisualAssetProvenance,
  composeVisualAsset,
  composeVisualRelationship,
  composeVisualGovernance,
  composeVisualAssetDecision,
  composeVisualAssetTrace,
  composeVisualAssetRegistry,
  composeVisualAssetRegistryFromInput,
  composeVisualAssets,
  composeApplicationArtifactWithVisualAssets,
  isSupportedVisualAssetType,
  isSupportedVisualRepresentationType,
  isSupportedVisualPurposeType,
  isSupportedVisualRelationshipType,
  isSupportedVisualGovernanceLevel,
  isSupportedVisualAssetStatus,
  isSupportedVisualAssetGovernance,
  getCanonicalVisualAssetTypes,
  getCanonicalVisualRepresentationTypes,
  getCanonicalVisualPurposeTypes,
  getCanonicalVisualRelationshipTypes,
  getCanonicalVisualGovernanceLevels,
  getCanonicalVisualAssetStatuses,
} from './VisualAssetKernel.ts';

// ============================================================================
// VISUAL ASSET VALIDATION — Deterministic validation
// ============================================================================

export {
  VISUAL_VALIDATION_CODES,
  validateVisualAsset,
  validateVisualRelationship,
  validateVisualGovernance,
  validateVisualAssetRegistry,
  validateVisualAssetInput,
  validateVisualAssetTrace,
  validateApplicationArtifactWithVisualAssets,
} from './VisualAssetValidation.ts';

// ============================================================================
// D7-OPT-13 — CERTIFICATION CONTRACTS — Domain types and constants
// ============================================================================

export {
  CANONICAL_APPLICATION_CERTIFICATION_STATUS,
  CANONICAL_APPLICATION_FINDING_SEVERITY,
  CANONICAL_APPLICATION_QUALITY_DIMENSIONS,
  type ApplicationCertificationStatus,
  type ApplicationFindingSeverity,
  type ApplicationQualityDimension,
  type ApplicationCertificationFinding,
  type ApplicationCertificationTrace,
  type ApplicationCertificationReport,
  type ApplicationCertificationValidationError,
  type ApplicationCertificationValidationResult,
} from './ApplicationAgentContract.ts';

// ============================================================================
// CERTIFICATION ENGINE — Deterministic certification functions
// ============================================================================

export {
  composeApplicationCertificationFinding,
  composeApplicationCertificationReport,
  calculateApplicationCertificationScore,
  isApplicationCertificationSuccessful,
  certifyApplicationArtifact,
  validateApplicationCertification,
  isSupportedApplicationCertificationStatus,
  isSupportedApplicationFindingSeverity,
  isSupportedApplicationQualityDimension,
  getCanonicalApplicationCertificationStatuses,
  getCanonicalApplicationFindingSeverities,
  getCanonicalApplicationQualityDimensions,
} from './ApplicationCertificationEngine.ts';

// ============================================================================
// CERTIFICATION VALIDATION — Deterministic validation
// ============================================================================

export {
  CERTIFICATION_VALIDATION_CODES,
  validateCertificationReport,
  validateCertificationFinding,
  validateCertificationStatus,
  validateCertificationScore,
} from './ApplicationCertificationValidation.ts';

// ============================================================================
// D7-OPT-14 — FACADE CONTRACTS — Domain types and constants
// ============================================================================

export {
  CANONICAL_APPLICATION_FACADE_STATUS,
  type ApplicationFacadeStatus,
  type ApplicationFacadeTraceMetadata,
  type ApplicationFacadeValidationResult,
  type ApplicationFacadeArtifactResult,
  type ApplicationFacadeCertificationResult,
  type ApplicationFacadeCompleteResult,
} from './ApplicationAgentContract.ts';

// ============================================================================
// APPLICATION PIPELINE FACADE — Public API consolidation
// ============================================================================

export {
  composeApplicationArtifact,
  certifyApplicationFacadeArtifact,
  composeAndCertifyApplicationArtifact,
  validateApplicationFacadeArtifact,
  validateApplicationFacadeCertification,
  validateApplicationFacadeComplete,
  isSupportedApplicationFacadeStatus,
  getCanonicalApplicationFacadeStatuses,
} from './ApplicationPipelineFacade.ts';

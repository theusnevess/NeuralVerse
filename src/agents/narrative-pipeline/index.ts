/**
 * NV-1700-D6-OPT-01 / D6-OPT-02 / D6-OPT-03 / D6-OPT-04 / D6-OPT-05 / D6-OPT-06 / D6-OPT-07 / D6-OPT-08 / D6-OPT-09 / D6-OPT-10 — Narrative Pipeline Kernel
 *
 * Public API for the Narrative Contract & Registry Kernel.
 * Extended with Narrative Style & Framing Orchestration (D6-OPT-02).
 * Extended with Problem-Origin & Motivation Modeling (D6-OPT-03).
 * Extended with Analogy, Metaphor & Intuition Modeling (D6-OPT-04).
 * Extended with Story Arc, Cognitive Progression & Narrative Flow (D6-OPT-05).
 * Extended with Narrative Emotion, Curiosity & Engagement Modeling (D6-OPT-06).
 * Extended with Historical Context, Scientific Evolution & Discovery Timeline (D6-OPT-07).
 * Extended with Application-Driven Context & Real-World Relevance (D6-OPT-08).
 * Extended with Multi-Perspective Explanation & Alternative Viewpoint Modeling (D6-OPT-09).
 * Extended with Narrative Composition Certification & Public Pipeline Facade (D6-OPT-10).
 * Organized into: contracts, kernel, validation, certification, facade, and types.
 */

// ============================================================================
// D6-OPT-01 CONTRACTS — Domain types and constants
// ============================================================================

export {
  CANONICAL_NARRATIVE_UNIT_TYPES,
  CANONICAL_NARRATIVE_MODES,
  CANONICAL_NARRATIVE_DOMAINS,
  CANONICAL_NARRATIVE_STATUS,
  CANONICAL_GOVERNANCE_STATUSES,
  type NarrativeUnitType,
  type NarrativeMode,
  type NarrativeDomain,
  type NarrativeStatus,
  type NarrativeGovernanceStatus,
  type NarrativeProvenance,
  type NarrativeUnit,
  type NarrativeDecision,
  type NarrativeTrace,
  type NarrativeRegistryMetadata,
  type NarrativeRegistry,
  type NarrativeInput,
  type NarrativeArtifact,
  type NarrativeValidationError,
  type NarrativeStatusRecord,
  type NarrativeValidationResult,
  type NarrativeUnitValidationResult,
  type NarrativeRegistryValidationResult,
  type NarrativeInputValidationResult,
  type NarrativeTraceValidationResult,
  type NarrativeArtifactValidationResult,
} from './NarrativeAgentContract.ts';

// ============================================================================
// D6-OPT-02 CONTRACTS — Narrative Style & Framing types and constants
// ============================================================================

export {
  CANONICAL_NARRATIVE_STYLES,
  CANONICAL_NARRATIVE_FRAMES,
  CANONICAL_MOTIVATION_TYPES,
  CANONICAL_NARRATIVE_TONES,
  CANONICAL_NARRATIVE_STYLE_STATUS,
  type NarrativeStyleType,
  type NarrativeFrameType,
  type MotivationType,
  type NarrativeTone,
  type NarrativeStyleStatus,
  type NarrativeStyle,
  type NarrativeFrame,
  type NarrativeMotivation,
  type NarrativeStyleDecision,
  type NarrativeStyleTrace,
  type NarrativeStyleRegistryMetadata,
  type NarrativeStyleRegistry,
  type NarrativeStyleInput,
  type NarrativeArtifactWithStyle,
  type NarrativeStyleValidationError,
  type NarrativeStyleValidationResult,
  type NarrativeStyleUnitValidationResult,
  type NarrativeFrameValidationResult,
  type NarrativeMotivationValidationResult,
  type NarrativeStyleRegistryValidationResult,
  type NarrativeStyleTraceValidationResult,
  type NarrativeArtifactWithStyleValidationResult,
  type NarrativeStyleInputValidationResult,
} from './NarrativeAgentContract.ts';

// ============================================================================
// D6-OPT-03 CONTRACTS — Problem-Origin & Motivation types and constants
// ============================================================================

export {
  CANONICAL_PROBLEM_TYPES,
  CANONICAL_ORIGIN_TYPES,
  CANONICAL_MOTIVATION_CATEGORIES,
  CANONICAL_DRIVING_QUESTION_TYPES,
  CANONICAL_MISCONCEPTION_TYPES,
  CANONICAL_PROBLEM_STATUS,
  type ProblemType,
  type OriginType,
  type MotivationCategory,
  type DrivingQuestionType,
  type MisconceptionType,
  type ProblemStatus,
  type ProblemProvenance,
  type Problem,
  type Origin,
  type ProblemMotivation,
  type DrivingQuestion,
  type Misconception,
  type ProblemDecision,
  type ProblemTrace,
  type ProblemRegistryMetadata,
  type ProblemRegistry,
  type ProblemInput,
  type NarrativeArtifactWithProblems,
  type ProblemValidationError,
  type ProblemValidationResult,
  type ProblemUnitValidationResult,
  type OriginValidationResult,
  type ProblemMotivationValidationResult,
  type DrivingQuestionValidationResult,
  type MisconceptionValidationResult,
  type ProblemRegistryValidationResult,
  type ProblemInputValidationResult,
  type NarrativeArtifactWithProblemsValidationResult,
} from './NarrativeAgentContract.ts';

// ============================================================================
// D6-OPT-04 CONTRACTS — Analogy, Metaphor & Intuition types and constants
// ============================================================================

export {
  CANONICAL_ANALOGY_TYPES,
  CANONICAL_METAPHOR_TYPES,
  CANONICAL_INTUITION_TYPES,
  CANONICAL_MAPPING_TYPES,
  CANONICAL_ABSTRACTION_LEVELS,
  CANONICAL_ANALOGY_STATUS,
  type AnalogyType,
  type MetaphorType,
  type IntuitionType,
  type MappingType,
  type AbstractionLevel,
  type AnalogyStatus,
  type AnalogyProvenance,
  type Analogy,
  type Metaphor,
  type Intuition,
  type ConceptMapping,
  type CognitiveBridge,
  type AnalogyDecision,
  type AnalogyTrace,
  type AnalogyRegistryMetadata,
  type AnalogyRegistry,
  type AnalogyInput,
  type NarrativeArtifactWithAnalogies,
  type AnalogyValidationError,
  type AnalogyValidationResult,
  type AnalogyUnitValidationResult,
  type MetaphorValidationResult,
  type IntuitionValidationResult,
  type ConceptMappingValidationResult,
  type CognitiveBridgeValidationResult,
  type AnalogyRegistryValidationResult,
  type AnalogyInputValidationResult,
  type NarrativeArtifactWithAnalogiesValidationResult,
} from './NarrativeAgentContract.ts';

// ============================================================================
// D6-OPT-05 CONTRACTS — Story Arc, Cognitive Progression & Flow types and constants
// ============================================================================

export {
  CANONICAL_STORY_ARC_TYPES,
  CANONICAL_NARRATIVE_STAGES,
  CANONICAL_TRANSITION_TYPES,
  CANONICAL_COGNITIVE_PROGRESSIONS,
  CANONICAL_ATTENTION_SHIFT_TYPES,
  CANONICAL_STORY_FLOW_STATUS,
  type StoryArcType,
  type NarrativeStageType,
  type TransitionType,
  type CognitiveProgressionType,
  type AttentionShiftType,
  type StoryFlowStatus,
  type StoryArcProvenance,
  type StoryArc,
  type NarrativeStage,
  type NarrativeTransition,
  type CognitiveProgression,
  type AttentionShift,
  type NarrativeFlow,
  type StoryFlowDecision,
  type StoryFlowTrace,
  type StoryFlowRegistryMetadata,
  type StoryFlowRegistry,
  type StoryFlowInput,
  type NarrativeArtifactWithStoryFlow,
  type StoryFlowValidationError,
  type StoryFlowValidationResult,
  type StoryArcValidationResult,
  type NarrativeStageValidationResult,
  type NarrativeTransitionValidationResult,
  type CognitiveProgressionValidationResult,
  type AttentionShiftValidationResult,
  type NarrativeFlowValidationResult,
  type StoryFlowRegistryValidationResult,
  type StoryFlowInputValidationResult,
  type NarrativeArtifactWithStoryFlowValidationResult,
} from './NarrativeAgentContract.ts';

// ============================================================================
// D6-OPT-06 CONTRACTS — Engagement, Curiosity & Tension types and constants
// ============================================================================

export {
  CANONICAL_CURIOSITY_TRIGGER_TYPES,
  CANONICAL_ENGAGEMENT_TYPES,
  CANONICAL_NARRATIVE_TENSION_TYPES,
  CANONICAL_SURPRISE_TYPES,
  CANONICAL_REWARD_TYPES,
  CANONICAL_ATTENTION_RECOVERY_TYPES,
  CANONICAL_MOMENTUM_TYPES,
  CANONICAL_ENGAGEMENT_STATUS,
  type CuriosityTriggerType,
  type EngagementType,
  type NarrativeTensionType,
  type SurpriseType,
  type IntellectualRewardType,
  type AttentionRecoveryType,
  type NarrativeMomentumType,
  type EngagementStatus,
  type EngagementProvenance,
  type CuriosityTrigger,
  type EngagementPoint,
  type NarrativeTension,
  type SurpriseMoment,
  type IntellectualReward,
  type AttentionRecovery,
  type NarrativeMomentum,
  type EngagementDecision,
  type EngagementTrace,
  type EngagementRegistryMetadata,
  type EngagementRegistry,
  type EngagementInput,
  type NarrativeArtifactWithEngagement,
  type EngagementValidationError,
  type EngagementValidationResult,
  type CuriosityTriggerValidationResult,
  type EngagementPointValidationResult,
  type NarrativeTensionValidationResult,
  type SurpriseMomentValidationResult,
  type IntellectualRewardValidationResult,
  type AttentionRecoveryValidationResult,
  type NarrativeMomentumValidationResult,
  type EngagementRegistryValidationResult,
  type EngagementInputValidationResult,
  type NarrativeArtifactWithEngagementValidationResult,
} from './NarrativeAgentContract.ts';

// ============================================================================
// D6-OPT-07 CONTRACTS — Historical, Discovery & Timeline types and constants
// ============================================================================

export {
  CANONICAL_HISTORICAL_CONTEXT_TYPES,
  CANONICAL_DISCOVERY_TYPES,
  CANONICAL_TIMELINE_EVENT_TYPES,
  CANONICAL_EVOLUTION_TYPES,
  CANONICAL_MILESTONE_TYPES,
  CANONICAL_INFLUENCE_TYPES,
  CANONICAL_PARADIGM_SHIFT_TYPES,
  CANONICAL_HISTORY_STATUS,
  type HistoricalContextType,
  type DiscoveryType,
  type TimelineEventType,
  type EvolutionType,
  type MilestoneType,
  type InfluenceType,
  type ParadigmShiftType,
  type HistoryStatus,
  type HistoricalProvenance,
  type HistoricalContext,
  type ScientificDiscovery,
  type TimelineEvent,
  type ScientificEvolution,
  type Milestone,
  type InfluenceChain,
  type ParadigmShift,
  type HistoricalDecision,
  type HistoricalTrace,
  type HistoricalRegistryMetadata,
  type HistoricalRegistry,
  type HistoricalInput,
  type NarrativeArtifactWithHistory,
  type HistoricalValidationError,
  type HistoricalValidationResult,
  type HistoricalContextValidationResult,
  type ScientificDiscoveryValidationResult,
  type TimelineEventValidationResult,
  type ScientificEvolutionValidationResult,
  type MilestoneValidationResult,
  type InfluenceChainValidationResult,
  type ParadigmShiftValidationResult,
  type HistoricalRegistryValidationResult,
  type HistoricalInputValidationResult,
  type NarrativeArtifactWithHistoryValidationResult,
} from './NarrativeAgentContract.ts';

// ============================================================================
// D6-OPT-08 CONTRACTS — Application & Real-World Relevance types and constants
// ============================================================================

export {
  CANONICAL_APPLICATION_TYPES,
  CANONICAL_USE_CASE_TYPES,
  CANONICAL_INDUSTRY_TYPES,
  CANONICAL_ENGINEERING_SCENARIO_TYPES,
  CANONICAL_ADOPTION_TYPES,
  CANONICAL_REAL_WORLD_CONTEXT_TYPES,
  CANONICAL_APPLICATION_FLOW_TYPES,
  CANONICAL_APPLICATION_STATUS,
  type ApplicationType,
  type UseCaseType,
  type IndustryType,
  type EngineeringScenarioType,
  type TechnologyAdoptionType,
  type RealWorldContextType,
  type ApplicationFlowType,
  type ApplicationStatus,
  type ApplicationProvenance,
  type Application,
  type UseCase,
  type IndustrialScenario,
  type EngineeringScenario,
  type TechnologyAdoption,
  type RealWorldContext,
  type ApplicationFlow,
  type ApplicationDecision,
  type ApplicationTrace,
  type ApplicationRegistryMetadata,
  type ApplicationRegistry,
  type ApplicationInput,
  type NarrativeArtifactWithApplications,
  type ApplicationValidationError,
  type ApplicationValidationResult,
  type ApplicationUnitValidationResult,
  type UseCaseValidationResult,
  type IndustrialScenarioValidationResult,
  type EngineeringScenarioValidationResult,
  type TechnologyAdoptionValidationResult,
  type RealWorldContextValidationResult,
  type ApplicationFlowValidationResult,
  type ApplicationRegistryValidationResult,
  type ApplicationInputValidationResult,
  type NarrativeArtifactWithApplicationsValidationResult,
} from './NarrativeAgentContract.ts';

// ============================================================================
// D6-OPT-09 CONTRACTS — Perspective & Viewpoint types and constants
// ============================================================================

export {
  CANONICAL_PERSPECTIVE_TYPES,
  CANONICAL_EXPLANATION_TYPES,
  CANONICAL_ALTERNATIVE_VIEW_TYPES,
  CANONICAL_DISCIPLINARY_VIEW_TYPES,
  CANONICAL_EXPLANATION_ABSTRACTION_TYPES,
  CANONICAL_IMPLEMENTATION_VIEW_TYPES,
  CANONICAL_PERSPECTIVE_FLOW_TYPES,
  CANONICAL_PERSPECTIVE_STATUS,
  type PerspectiveType,
  type ExplanationType,
  type AlternativeViewType,
  type DisciplinaryViewType,
  type ExplanationAbstractionType,
  type ImplementationViewType,
  type PerspectiveFlowType,
  type PerspectiveStatus,
  type PerspectiveProvenance,
  type Perspective,
  type ExplanationView,
  type AlternativeView,
  type DisciplinaryView,
  type ImplementationView,
  type AbstractionView,
  type PerspectiveFlow,
  type PerspectiveDecision,
  type PerspectiveTrace,
  type PerspectiveRegistryMetadata,
  type PerspectiveRegistry,
  type PerspectiveInput,
  type NarrativeArtifactWithPerspectives,
  type PerspectiveValidationError,
  type PerspectiveValidationResult,
  type PerspectiveUnitValidationResult,
  type ExplanationViewValidationResult,
  type AlternativeViewValidationResult,
  type DisciplinaryViewValidationResult,
  type ImplementationViewValidationResult,
  type AbstractionViewValidationResult,
  type PerspectiveFlowValidationResult,
  type PerspectiveRegistryValidationResult,
  type PerspectiveInputValidationResult,
  type NarrativeArtifactWithPerspectivesValidationResult,
} from './NarrativeAgentContract.ts';

// ============================================================================
// D6-OPT-10 CONTRACTS — Certification, Facade & Public API types
// ============================================================================

export {
  CANONICAL_NARRATIVE_CERTIFICATION_STATUS,
  CANONICAL_NARRATIVE_FINDING_SEVERITY,
  CANONICAL_NARRATIVE_QUALITY_DIMENSIONS,
  type NarrativeCertificationStatus,
  type NarrativeFindingSeverity,
  type NarrativeQualityDimension,
  type CertificationProvenance,
  type CertificationFinding,
  type CertificationReport,
  type NarrativeFacadeTraceMetadata,
  type NarrativeFacadeOutput,
  type NarrativeCertificationOutput,
  type NarrativeCompleteOutput,
  type NarrativeFacadeValidationError,
  type NarrativeFacadeValidationResult,
  type NarrativeFacadeArtifactValidationResult,
  type NarrativeFacadeCertificationValidationResult,
  type NarrativeFacadeCompleteValidationResult,
  type NarrativeCertificationFindingValidationResult,
  type NarrativeCertificationReportValidationResult,
  type NarrativeCertificationInputValidationResult,
} from './NarrativeAgentContract.ts';

// ============================================================================
// D6-OPT-01 KERNEL — Deterministic composition functions
// ============================================================================

export {
  composeNarrativeProvenance,
  composeNarrativeTrace,
  composeNarrativeUnit,
  composeNarrativeRegistry,
  composeNarrativeRegistryFromInput,
  composeNarrative,
  isSupportedNarrativeUnitType,
  isSupportedNarrativeMode,
  isSupportedNarrativeDomain,
  isSupportedNarrativeStatus,
  isSupportedNarrativeGovernanceStatus,
  getCanonicalNarrativeUnitTypes,
  getCanonicalNarrativeModes,
  getCanonicalNarrativeDomains,
  getCanonicalNarrativeStatuses,
  getCanonicalNarrativeGovernanceStatuses,
} from './NarrativeKernel.ts';

// ============================================================================
// D6-OPT-02 KERNEL — Narrative Style & Framing composition functions
// ============================================================================

export {
  composeNarrativeStyle,
  composeNarrativeFrame,
  composeNarrativeMotivation,
  composeNarrativeTone,
  composeNarrativeStyleTrace,
  composeNarrativeStyleRegistry,
  composeNarrativeStyleRegistryFromInput,
  composeNarrativeStyleOrchestration,
  composeNarrativeArtifactWithStyle,
  isSupportedNarrativeStyle,
  isSupportedNarrativeFrame,
  isSupportedMotivationType,
  isSupportedNarrativeTone,
  isSupportedNarrativeStyleStatus,
  getCanonicalNarrativeStyles,
  getCanonicalNarrativeFrames,
  getCanonicalMotivationTypes,
  getCanonicalNarrativeTones,
  getCanonicalNarrativeStyleStatuses,
} from './NarrativeStyleKernel.ts';

// ============================================================================
// D6-OPT-03 KERNEL — Problem-Origin & Motivation composition functions
// ============================================================================

export {
  composeProblemProvenance,
  composeOrigin,
  composeMotivation,
  composeDrivingQuestion,
  composeMisconception,
  composeProblem,
  composeProblemTrace,
  composeProblemRegistry,
  composeProblemRegistryFromInput,
  composeNarrativeProblems,
  composeNarrativeArtifactWithProblems,
  isSupportedProblemType,
  isSupportedOriginType,
  isSupportedMotivationCategory,
  isSupportedDrivingQuestionType,
  isSupportedMisconceptionType,
  isSupportedProblemStatus,
  getCanonicalProblemTypes,
  getCanonicalOriginTypes,
  getCanonicalMotivationCategories,
  getCanonicalDrivingQuestionTypes,
  getCanonicalMisconceptionTypes,
  getCanonicalProblemStatuses,
} from './ProblemKernel.ts';

// ============================================================================
// D6-OPT-04 KERNEL — Analogy, Metaphor & Intuition composition functions
// ============================================================================

export {
  composeAnalogyProvenance,
  composeAnalogy,
  composeMetaphor,
  composeIntuition,
  composeConceptMapping,
  composeCognitiveBridge,
  composeAnalogyTrace,
  composeAnalogyRegistry,
  composeAnalogyRegistryFromInput,
  composeNarrativeAnalogies,
  composeNarrativeArtifactWithAnalogies,
  isSupportedAnalogyType,
  isSupportedMetaphorType,
  isSupportedIntuitionType,
  isSupportedMappingType,
  isSupportedAbstractionLevel,
  isSupportedAnalogyStatus,
  getCanonicalAnalogyTypes,
  getCanonicalMetaphorTypes,
  getCanonicalIntuitionTypes,
  getCanonicalMappingTypes,
  getCanonicalAbstractionLevels,
  getCanonicalAnalogyStatuses,
} from './AnalogyKernel.ts';

// ============================================================================
// D6-OPT-05 KERNEL — Story Arc, Cognitive Progression & Flow composition functions
// ============================================================================

export {
  composeStoryArcProvenance,
  composeStoryArc,
  composeNarrativeStage,
  composeNarrativeTransition,
  composeCognitiveProgression,
  composeAttentionShift,
  composeNarrativeFlow,
  composeStoryFlowTrace,
  composeStoryFlowRegistry,
  composeStoryFlowRegistryFromInput,
  composeNarrativeFlowArtifacts,
  composeNarrativeArtifactWithStoryFlow,
  isSupportedStoryArcType,
  isSupportedNarrativeStageType,
  isSupportedTransitionType,
  isSupportedCognitiveProgressionType,
  isSupportedAttentionShiftType,
  isSupportedStoryFlowStatus,
  getCanonicalStoryArcTypes,
  getCanonicalNarrativeStageTypes,
  getCanonicalTransitionTypes,
  getCanonicalCognitiveProgressionTypes,
  getCanonicalAttentionShiftTypes,
  getCanonicalStoryFlowStatuses,
} from './StoryFlowKernel.ts';

// ============================================================================
// D6-OPT-06 KERNEL — Engagement, Curiosity & Tension composition functions
// ============================================================================

export {
  composeCuriosityProvenance,
  composeCuriosityTrigger,
  composeEngagementPoint,
  composeNarrativeTension,
  composeSurpriseMoment,
  composeIntellectualReward,
  composeAttentionRecovery,
  composeNarrativeMomentum,
  composeEngagementTrace,
  composeEngagementRegistry,
  composeEngagementRegistryFromInput,
  composeNarrativeEngagement,
  composeNarrativeArtifactWithEngagement,
  isSupportedCuriosityTriggerType,
  isSupportedEngagementType,
  isSupportedNarrativeTensionType,
  isSupportedSurpriseType,
  isSupportedIntellectualRewardType,
  isSupportedAttentionRecoveryType,
  isSupportedNarrativeMomentumType,
  isSupportedEngagementStatus,
  getCanonicalCuriosityTriggerTypes,
  getCanonicalEngagementTypes,
  getCanonicalNarrativeTensionTypes,
  getCanonicalSurpriseTypes,
  getCanonicalIntellectualRewardTypes,
  getCanonicalAttentionRecoveryTypes,
  getCanonicalNarrativeMomentumTypes,
  getCanonicalEngagementStatuses,
} from './NarrativeEngagementKernel.ts';

// ============================================================================
// D6-OPT-07 KERNEL — Historical, Discovery & Timeline composition functions
// ============================================================================

export {
  composeHistoricalContextProvenance,
  composeHistoricalContext,
  composeScientificDiscovery,
  composeTimelineEvent,
  composeScientificEvolution,
  composeMilestone,
  composeInfluenceChain,
  composeParadigmShift,
  composeHistoricalTrace,
  composeHistoricalRegistry,
  composeHistoricalRegistryFromInput,
  composeNarrativeHistory,
  composeNarrativeArtifactWithHistory,
  isSupportedHistoricalContextType,
  isSupportedDiscoveryType,
  isSupportedTimelineEventType,
  isSupportedEvolutionType,
  isSupportedMilestoneType,
  isSupportedInfluenceType,
  isSupportedParadigmShiftType,
  isSupportedHistoryStatus,
  getCanonicalHistoricalContextTypes,
  getCanonicalDiscoveryTypes,
  getCanonicalTimelineEventTypes,
  getCanonicalEvolutionTypes,
  getCanonicalMilestoneTypes,
  getCanonicalInfluenceTypes,
  getCanonicalParadigmShiftTypes,
  getCanonicalHistoryStatuses,
} from './HistoricalNarrativeKernel.ts';

// ============================================================================
// D6-OPT-08 KERNEL — Application & Real-World Relevance composition functions
// ============================================================================

export {
  composeApplicationProvenance,
  composeApplication,
  composeUseCase,
  composeIndustrialScenario,
  composeEngineeringScenario,
  composeTechnologyAdoption,
  composeRealWorldContext,
  composeApplicationFlow,
  composeApplicationTrace,
  composeApplicationRegistry,
  composeApplicationRegistryFromInput,
  composeNarrativeApplications,
  composeNarrativeArtifactWithApplications,
  isSupportedApplicationType,
  isSupportedUseCaseType,
  isSupportedIndustryType,
  isSupportedEngineeringScenarioType,
  isSupportedTechnologyAdoptionType,
  isSupportedRealWorldContextType,
  isSupportedApplicationFlowType,
  isSupportedApplicationStatus,
  getCanonicalApplicationTypes,
  getCanonicalUseCaseTypes,
  getCanonicalIndustryTypes,
  getCanonicalEngineeringScenarioTypes,
  getCanonicalTechnologyAdoptionTypes,
  getCanonicalRealWorldContextTypes,
  getCanonicalApplicationFlowTypes,
  getCanonicalApplicationStatuses,
} from './ApplicationNarrativeKernel.ts';

// ============================================================================
// D6-OPT-09 KERNEL — Perspective & Viewpoint composition functions
// ============================================================================

export {
  composePerspectiveProvenance,
  composePerspective,
  composeExplanationView,
  composeAlternativeView,
  composeDisciplinaryView,
  composeImplementationView,
  composeAbstractionView,
  composePerspectiveFlow,
  composePerspectiveTrace,
  composePerspectiveRegistry,
  composePerspectiveRegistryFromInput,
  composeNarrativePerspectives,
  composeNarrativeArtifactWithPerspectives,
  isSupportedPerspectiveType,
  isSupportedExplanationType,
  isSupportedAlternativeViewType,
  isSupportedDisciplinaryViewType,
  isSupportedExplanationAbstractionType,
  isSupportedImplementationViewType,
  isSupportedPerspectiveFlowType,
  isSupportedPerspectiveStatus,
  getCanonicalPerspectiveTypes,
  getCanonicalExplanationTypes,
  getCanonicalAlternativeViewTypes,
  getCanonicalDisciplinaryViewTypes,
  getCanonicalExplanationAbstractionTypes,
  getCanonicalImplementationViewTypes,
  getCanonicalPerspectiveFlowTypes,
  getCanonicalPerspectiveStatuses,
} from './PerspectiveNarrativeKernel.ts';

// ============================================================================
// D6-OPT-10 KERNEL — Certification Engine & Public Facade
// ============================================================================

export {
  composeNarrativeCertificationFinding,
  composeNarrativeCertificationReport,
  composeNarrativeCertificationReportFromParams,
  certifyNarrativeComposition,
  isSupportedNarrativeCertificationStatus,
  isSupportedNarrativeFindingSeverity,
  isSupportedNarrativeQualityDimension,
  getCanonicalNarrativeCertificationStatuses,
  getCanonicalNarrativeFindingSeverities,
  getCanonicalNarrativeQualityDimensions,
} from './NarrativeCertificationEngine.ts';

// ============================================================================
// D6-OPT-10 FACADE — Public API Entrypoints
// ============================================================================

export {
  composeNarrativeArtifact,
  certifyNarrativeArtifact,
  composeAndCertifyNarrativeArtifact,
  validateNarrativeFacadeArtifact,
  validateNarrativeFacadeCertification,
  validateNarrativeFacadeComplete,
  validateNarrativeCertificationFinding,
  validateNarrativeCertificationReport,
  validateNarrativeCertificationInput,
} from './NarrativePipelineFacade.ts';

// ============================================================================
// D6-OPT-01 VALIDATION — Deterministic validation
// ============================================================================

export {
  NARRATIVE_VALIDATION_CODES,
  validateNarrativeUnit,
  validateNarrativeRegistry,
  validateNarrativeInput,
  validateNarrativeTrace,
  validateNarrativeArtifact,
} from './NarrativeValidation.ts';

// ============================================================================
// D6-OPT-02 VALIDATION — Narrative Style & Framing validation
// ============================================================================

export {
  NARRATIVE_STYLE_VALIDATION_CODES,
  validateNarrativeStyle,
  validateNarrativeFrame,
  validateNarrativeMotivation,
  validateNarrativeRegistry as validateNarrativeStyleRegistry,
  validateNarrativeStyleTrace,
  validateNarrativeArtifactWithStyle,
  validateNarrativeStyleInput,
} from './NarrativeStyleValidation.ts';

// ============================================================================
// D6-OPT-03 VALIDATION — Problem-Origin & Motivation validation
// ============================================================================

export {
  PROBLEM_VALIDATION_CODES,
  validateProblem,
  validateOrigin,
  validateMotivation,
  validateDrivingQuestion,
  validateMisconception,
  validateProblemRegistry,
  validateProblemInput,
  validateNarrativeArtifactWithProblems,
} from './ProblemValidation.ts';

// ============================================================================
// D6-OPT-04 VALIDATION — Analogy, Metaphor & Intuition validation
// ============================================================================

export {
  ANALOGY_VALIDATION_CODES,
  validateAnalogy,
  validateMetaphor,
  validateIntuition,
  validateConceptMapping,
  validateCognitiveBridge,
  validateAnalogyRegistry,
  validateAnalogyInput,
  validateNarrativeArtifactWithAnalogies,
} from './AnalogyValidation.ts';

// ============================================================================
// D6-OPT-05 VALIDATION — Story Arc, Cognitive Progression & Flow validation
// ============================================================================

export {
  STORY_FLOW_VALIDATION_CODES,
  validateStoryArc,
  validateNarrativeStage,
  validateNarrativeTransition,
  validateCognitiveProgression,
  validateAttentionShift,
  validateNarrativeFlow,
  validateStoryFlowRegistry,
  validateStoryFlowInput,
  validateNarrativeArtifactWithStoryFlow,
} from './StoryFlowValidation.ts';

// ============================================================================
// D6-OPT-06 VALIDATION — Engagement, Curiosity & Tension validation
// ============================================================================

export {
  ENGAGEMENT_VALIDATION_CODES,
  validateCuriosityTrigger,
  validateEngagementPoint,
  validateNarrativeTension,
  validateSurpriseMoment,
  validateIntellectualReward,
  validateAttentionRecovery,
  validateNarrativeMomentum,
  validateEngagementRegistry,
  validateEngagementInput,
  validateNarrativeArtifactWithEngagement,
} from './NarrativeEngagementValidation.ts';

// ============================================================================
// D6-OPT-07 VALIDATION — Historical, Discovery & Timeline validation
// ============================================================================

export {
  HISTORICAL_VALIDATION_CODES,
  validateHistoricalContext,
  validateScientificDiscovery,
  validateTimelineEvent,
  validateScientificEvolution,
  validateMilestone,
  validateInfluenceChain,
  validateParadigmShift,
  validateHistoricalRegistry,
  validateHistoricalInput,
  validateNarrativeArtifactWithHistory,
} from './HistoricalNarrativeValidation.ts';

// ============================================================================
// D6-OPT-08 VALIDATION — Application & Real-World Relevance validation
// ============================================================================

export {
  APPLICATION_VALIDATION_CODES,
  validateApplication,
  validateUseCase,
  validateIndustrialScenario,
  validateEngineeringScenario,
  validateTechnologyAdoption,
  validateRealWorldContext,
  validateApplicationFlow,
  validateApplicationRegistry,
  validateApplicationInput,
  validateNarrativeArtifactWithApplications,
} from './ApplicationNarrativeValidation.ts';

// ============================================================================
// D6-OPT-09 VALIDATION — Perspective & Viewpoint validation
// ============================================================================

export {
  PERSPECTIVE_VALIDATION_CODES,
  validatePerspective,
  validateExplanationView,
  validateAlternativeView,
  validateDisciplinaryView,
  validateImplementationView,
  validateAbstractionView,
  validatePerspectiveFlow,
  validatePerspectiveRegistry,
  validatePerspectiveInput,
  validateNarrativeArtifactWithPerspectives,
} from './PerspectiveNarrativeValidation.ts';
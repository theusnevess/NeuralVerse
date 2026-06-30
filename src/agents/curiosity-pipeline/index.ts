/**
 * NV-2100-D9-OPT-01 / D9-OPT-02 / D9-OPT-03 / D9-OPT-04 / D9-OPT-05 / D9-OPT-06 / D9-OPT-07 / D9-OPT-08 / D9-OPT-09 / D9-OPT-10 / D9-OPT-11 / D9-OPT-12 / D9-OPT-13 — Curiosity Pipeline Kernel
 *
 * Public API for the Curiosity Registry & Canonical Artifact Kernel.
 * Extended with Educational Purpose Modeling (D9-OPT-02).
 * Extended with Humor Layer, Tone System & Controlled Acid Humor Governance (D9-OPT-03).
 * Extended with Cultural Reference & Current-Context Governance (D9-OPT-04).
 * Extended with Curiosity Card, Engineer Note & Field Note Modeling (D9-OPT-05).
 * Extended with Historical Oddity, Research Trail & Knowledge Evolution Curiosity (D9-OPT-06).
 * Extended with Unexpected Connection, Limitation Warning & Application Surprise Modeling (D9-OPT-07).
 * Extended with Laboratory Challenge, What-If Prompt & Experiment Curiosity Modeling (D9-OPT-08).
 * Extended with Misconception Card & Assessment Reinforcement Curiosity Modeling (D9-OPT-09).
 * Extended with Visual Curiosity Presentation & Accessibility Metadata (D9-OPT-10).
 * Extended with User Preference, Tone Controls & Placement Rules (D9-OPT-11).
 * Extended with Curiosity Governance Workflow & Validation Rules (D9-OPT-12).
 * Extended with Storage Separation, Retrieval Strategy & Contextual Overlay Modeling (D9-OPT-13).
 * Organized into: contracts, kernel, validation, and types.
 */

// ============================================================================
// CONTRACTS — Domain types and constants
// ============================================================================

export {
  CANONICAL_CURIOSITY_TYPES,
  CANONICAL_CURIOSITY_CATEGORIES,
  CANONICAL_CURIOSITY_TONES,
  CANONICAL_CURIOSITY_CANONICAL_STATUS,
  CANONICAL_CURIOSITY_REVIEW_STATUS,
  CANONICAL_CURIOSITY_GOVERNANCE,
  type CuriosityType,
  type CuriosityCategory,
  type CuriosityTone,
  type CuriosityStatus,
  type CuriosityReviewStatus,
  type CuriosityGovernance,
  type CuriosityProvenance,
  type CuriosityDecision,
  type CuriosityTrace,
  type CuriosityNode,
  type CuriosityRegistryMetadata,
  type CuriosityRegistry,
  type CuriosityInput,
  type CuriosityValidationError,
  type CuriosityValidationResult,
  type CuriosityNodeValidationResult,
  type CuriosityRegistryValidationResult,
  type CuriosityInputValidationResult,
  type CuriosityTraceValidationResult,
} from './CuriosityAgentContract.ts';

// ============================================================================
// CURIOUSITY KERNEL — Deterministic composition functions
// ============================================================================

export {
  composeCuriosityProvenance,
  composeCuriosityTrace,
  composeCuriosityNode,
  composeCuriosityRegistry,
  composeCuriosityRegistryFromInput,
  composeCuriosity,
  isSupportedCuriosityType,
  isSupportedCuriosityCategory,
  isSupportedCuriosityTone,
  isSupportedCuriosityReviewStatus,
  isSupportedCuriosityGovernance,
  getCanonicalCuriosityTypes,
  getCanonicalCuriosityCategories,
  getCanonicalCuriosityTones,
  getCanonicalCuriosityStatuses,
  getCanonicalCuriosityGovernance,
} from './CuriosityKernel.ts';

// ============================================================================
// CURIOUSITY VALIDATION — Deterministic validation
// ============================================================================

export {
  CURIOSITY_VALIDATION_CODES,
  validateCuriosityNode,
  validateCuriosityRegistry,
  validateCuriosityInput,
  validateCuriosityTrace,
} from './CuriosityValidation.ts';

// ============================================================================
// D9-OPT-02 — EDUCATIONAL PURPOSE CONTRACTS — Domain types and constants
// ============================================================================

export {
  CANONICAL_CURIOSITY_OUTPUT_TYPES,
  CANONICAL_EDUCATIONAL_PURPOSES,
  CANONICAL_EMOTIONAL_TONES,
  CANONICAL_DELIVERY_CONTEXTS,
  CANONICAL_AUDIENCE_LEVELS,
  CANONICAL_CURIOSITY_PURPOSE_STATUS,
  type CuriosityOutputType,
  type EducationalPurpose,
  type EmotionalTone,
  type DeliveryContext,
  type AudienceLevel,
  type CuriosityPurposeStatus,
  type CuriosityPurposeProvenance,
  type CuriosityPurposeDecision,
  type CuriosityPurposeTrace,
  type CuriosityPurposeProfile,
  type CuriosityPurposeRelationship,
  type CuriosityPurposeRegistryMetadata,
  type CuriosityPurposeRegistry,
  type CuriosityPurposeInput,
  type CuriosityArtifactWithPurpose,
  type CuriosityPurposeValidationError,
  type CuriosityPurposeValidationResult,
  type CuriosityPurposeRegistryValidationResult,
  type CuriosityPurposeInputValidationResult,
  type CuriosityPurposeTraceValidationResult,
  type CuriosityArtifactWithPurposeValidationResult,
} from './CuriosityAgentContract.ts';

// ============================================================================
// D9-OPT-02 — EDUCATIONAL PURPOSE KERNEL — Deterministic composition functions
// ============================================================================

export {
  composeCuriosityPurposeProvenance,
  composeCuriosityPurposeTrace,
  composeCuriosityPurposeProfile,
  composeCuriosityPurposeRelationship,
  composeCuriosityPurposeRegistry,
  composeCuriosityPurposeRegistryFromInput,
  composeCuriosityPurposes,
  composeCuriosityArtifactWithPurpose,
  isSupportedCuriosityOutputType,
  isSupportedEducationalPurpose,
  isSupportedEmotionalTone,
  isSupportedDeliveryContext,
  isSupportedAudienceLevel,
  isSupportedCuriosityPurposeStatus,
  isSupportedCuriosityPurposeGovernance,
  getCanonicalCuriosityOutputTypes,
  getCanonicalEducationalPurposes,
  getCanonicalEmotionalTones,
  getCanonicalDeliveryContexts,
  getCanonicalAudienceLevels,
  getCanonicalCuriosityPurposeStatuses,
} from './CuriosityPurposeKernel.ts';

// ============================================================================
// D9-OPT-02 — EDUCATIONAL PURPOSE VALIDATION — Deterministic validation
// ============================================================================

export {
  CURIOSITY_PURPOSE_VALIDATION_CODES,
  validateCuriosityPurposeProfile,
  validateCuriosityPurposeRelationship,
  validateCuriosityPurposeRegistry,
  validateCuriosityPurposeInput,
  validateCuriosityPurposeTrace,
  validateCuriosityArtifactWithPurpose,
} from './CuriosityPurposeValidation.ts';

// ============================================================================
// D9-OPT-03 — HUMOR LAYER CONTRACTS — Domain types and constants
// ============================================================================

export {
  CANONICAL_HUMOR_TYPES,
  CANONICAL_REFERENCE_TYPES,
  CANONICAL_HUMOR_INTENSITY,
  CANONICAL_HUMOR_OBJECTIVES,
  CANONICAL_HUMOR_SAFETY_LEVELS,
  CANONICAL_HUMOR_STATUS,
  type HumorType,
  type ReferenceType,
  type HumorIntensity,
  type HumorObjective,
  type HumorSafetyLevel,
  type HumorStatus,
  type CuriosityHumorProvenance,
  type CuriosityHumorDecision,
  type CuriosityHumorTrace,
  type HumorProfile,
  type HumorReference,
  type HumorRelationship,
  type HumorGovernance,
  type HumorRegistryMetadata,
  type HumorRegistry,
  type HumorInput,
  type CuriosityArtifactWithHumor,
  type HumorValidationError,
  type HumorValidationResult,
  type HumorRegistryValidationResult,
  type HumorInputValidationResult,
  type HumorTraceValidationResult,
  type CuriosityArtifactWithHumorValidationResult,
} from './CuriosityAgentContract.ts';

// ============================================================================
// D9-OPT-03 — HUMOR LAYER KERNEL — Deterministic composition functions
// ============================================================================

export {
  composeCuriosityHumorProvenance,
  composeCuriosityHumorTrace,
  composeHumorProfile,
  composeHumorReference,
  composeHumorRelationship,
  composeHumorGovernance,
  composeHumorRegistry,
  composeHumorRegistryFromInput,
  composeCuriosityHumor,
  composeCuriosityArtifactWithHumor,
  isSupportedHumorType,
  isSupportedReferenceType,
  isSupportedHumorObjective,
  isSupportedHumorIntensity,
  isSupportedHumorSafetyLevel,
  isSupportedHumorStatus,
  isSupportedHumorGovernance,
  getCanonicalHumorTypes,
  getCanonicalReferenceTypes,
  getCanonicalHumorObjectives,
  getCanonicalHumorIntensity,
  getCanonicalHumorSafetyLevels,
  getCanonicalHumorStatuses,
} from './CuriosityHumorKernel.ts';

// ============================================================================
// D9-OPT-03 — HUMOR LAYER VALIDATION — Deterministic validation
// ============================================================================

export {
  HUMOR_VALIDATION_CODES,
  validateHumorProfile,
  validateHumorReference,
  validateHumorRelationship,
  validateHumorGovernance,
  validateHumorRegistry,
  validateHumorInput,
  validateHumorTrace,
  validateCuriosityArtifactWithHumor,
} from './CuriosityHumorValidation.ts';

// ============================================================================
// D9-OPT-04 — CULTURAL REFERENCE CONTRACTS — Domain types and constants
// ============================================================================

export {
  CANONICAL_REFERENCE_DOMAINS,
  CANONICAL_REFERENCE_RECENCY,
  CANONICAL_REFERENCE_PURPOSE,
  CANONICAL_REFERENCE_VALIDITY,
  CANONICAL_CONTEXT_SENSITIVITY,
  CANONICAL_REFERENCE_STATUS,
  type ReferenceDomain,
  type ReferenceRecency,
  type ReferencePurpose,
  type ReferenceValidity,
  type ContextSensitivity,
  type ReferenceStatus,
  type CulturalReferenceProvenance,
  type CulturalReferenceDecision,
  type CulturalReferenceTrace,
  type CulturalReferenceProfile,
  type CurrentContextReference,
  type ReferenceGovernance,
  type ReferenceRelationship,
  type CulturalReferenceRegistryMetadata,
  type CulturalReferenceRegistry,
  type CulturalReferenceInput,
  type CuriosityArtifactWithCulturalReferences,
  type CulturalReferenceValidationError,
  type CulturalReferenceValidationResult,
  type CulturalReferenceRegistryValidationResult,
  type CulturalReferenceInputValidationResult,
  type CulturalReferenceTraceValidationResult,
  type CuriosityArtifactWithCulturalReferencesValidationResult,
} from './CuriosityAgentContract.ts';

// ============================================================================
// D9-OPT-04 — CULTURAL REFERENCE KERNEL — Deterministic composition functions
// ============================================================================

export {
  composeCulturalReferenceProvenance,
  composeCulturalReferenceTrace,
  composeCulturalReferenceProfile,
  composeCurrentContextReference,
  composeReferenceGovernance,
  composeReferenceRelationship,
  composeCulturalReferenceRegistry,
  composeCulturalReferenceRegistryFromInput,
  composeCuriosityCulturalReferences,
  composeCuriosityArtifactWithCulturalReferences,
  isSupportedReferenceDomain,
  isSupportedReferenceRecency,
  isSupportedReferencePurpose,
  isSupportedReferenceValidity,
  isSupportedContextSensitivity,
  isSupportedReferenceStatus,
  isSupportedReferenceGovernance,
  getCanonicalReferenceDomains,
  getCanonicalReferenceRecency,
  getCanonicalReferencePurposes,
  getCanonicalReferenceValidity,
  getCanonicalContextSensitivity,
  getCanonicalReferenceStatuses,
} from './CulturalReferenceKernel.ts';

// ============================================================================
// D9-OPT-04 — CULTURAL REFERENCE VALIDATION — Deterministic validation
// ============================================================================

export {
  CULTURAL_REFERENCE_VALIDATION_CODES,
  validateCulturalReferenceProfile,
  validateCurrentContextReference,
  validateReferenceGovernance,
  validateReferenceRelationship,
  validateCulturalReferenceRegistry,
  validateCulturalReferenceInput,
  validateCulturalReferenceTrace,
  validateCuriosityArtifactWithCulturalReferences,
} from './CulturalReferenceValidation.ts';

// ============================================================================
// D9-OPT-05 — CURIOSITY CARD CONTRACTS — Domain types and constants
// ============================================================================

export {
  CANONICAL_CARD_TYPES,
  CANONICAL_INFORMATION_DENSITY,
  CANONICAL_READING_DURATION,
  CANONICAL_PRESENTATION_STYLE,
  CANONICAL_DISCOVERY_STYLE,
  CANONICAL_CARD_STATUS,
  type CardType,
  type InformationDensity,
  type ReadingDuration,
  type PresentationStyle,
  type DiscoveryStyle,
  type CardStatus,
  type CuriosityCardProvenance,
  type CuriosityCardDecision,
  type CuriosityCardTrace,
  type CuriosityCardProfile,
  type EngineerNoteProfile,
  type FieldNoteProfile,
  type CardPresentationMetadata,
  type CardRelationship,
  type CuriosityCardRegistryMetadata,
  type CuriosityCardRegistry,
  type CuriosityCardInput,
  type CuriosityArtifactWithCards,
  type CuriosityCardValidationError,
  type CuriosityCardValidationResult,
  type CuriosityCardRegistryValidationResult,
  type CuriosityCardInputValidationResult,
  type CuriosityCardTraceValidationResult,
  type CuriosityArtifactWithCardsValidationResult,
} from './CuriosityAgentContract.ts';

// ============================================================================
// D9-OPT-05 — CURIOSITY CARD KERNEL — Deterministic composition functions
// ============================================================================

export {
  composeCuriosityCardProvenance,
  composeCuriosityCardTrace,
  composeCuriosityCardProfile,
  composeEngineerNoteProfile,
  composeFieldNoteProfile,
  composeCardPresentationMetadata,
  composeCardRelationship,
  composeCuriosityCardRegistry,
  composeCuriosityCardRegistryFromInput,
  composeCuriosityCards,
  composeCuriosityArtifactWithCards,
  isSupportedCardType,
  isSupportedInformationDensity,
  isSupportedReadingDuration,
  isSupportedPresentationStyle,
  isSupportedDiscoveryStyle,
  isSupportedCardStatus,
  isSupportedCardGovernance,
  getCanonicalCardTypes,
  getCanonicalInformationDensity,
  getCanonicalReadingDurations,
  getCanonicalPresentationStyles,
  getCanonicalDiscoveryStyles,
  getCanonicalCardStatuses,
} from './CuriosityCardKernel.ts';

// ============================================================================
// D9-OPT-05 — CURIOSITY CARD VALIDATION — Deterministic validation
// ============================================================================

export {
  CURIOUSITY_CARD_VALIDATION_CODES,
  validateCuriosityCardProfile,
  validateEngineerNoteProfile,
  validateFieldNoteProfile,
  validateCardPresentationMetadata,
  validateCardRelationship,
  validateCuriosityCardRegistry,
  validateCuriosityCardInput,
  validateCuriosityCardTrace,
  validateCuriosityArtifactWithCards,
} from './CuriosityCardValidation.ts';

// ============================================================================
// D9-OPT-06 — KNOWLEDGE EVOLUTION CONTRACTS — Domain types and constants
// ============================================================================

export {
  CANONICAL_DISCOVERY_TYPES,
  CANONICAL_EVOLUTION_STAGES,
  CANONICAL_RESEARCH_TRAIL_TYPES,
  CANONICAL_ODDITY_TYPES,
  CANONICAL_EVOLUTION_PURPOSES,
  CANONICAL_KNOWLEDGE_EVOLUTION_STATUS,
  type DiscoveryType,
  type EvolutionStage,
  type ResearchTrailType,
  type OddityType,
  type EvolutionPurpose,
  type KnowledgeEvolutionStatus,
  type KnowledgeEvolutionProvenance,
  type KnowledgeEvolutionDecision,
  type KnowledgeEvolutionTrace,
  type KnowledgeEvolutionProfile,
  type HistoricalOddity,
  type ResearchTrail,
  type EvolutionMilestone,
  type EvolutionRelationship,
  type KnowledgeEvolutionRegistryMetadata,
  type KnowledgeEvolutionRegistry,
  type KnowledgeEvolutionInput,
  type CuriosityArtifactWithKnowledgeEvolution,
  type KnowledgeEvolutionValidationError,
  type KnowledgeEvolutionValidationResult,
  type KnowledgeEvolutionRegistryValidationResult,
  type KnowledgeEvolutionInputValidationResult,
  type KnowledgeEvolutionTraceValidationResult,
  type CuriosityArtifactWithKnowledgeEvolutionValidationResult,
} from './CuriosityAgentContract.ts';

// ============================================================================
// D9-OPT-06 — KNOWLEDGE EVOLUTION KERNEL — Deterministic composition functions
// ============================================================================

export {
  composeKnowledgeEvolutionProvenance,
  composeKnowledgeEvolutionTrace,
  composeKnowledgeEvolutionProfile,
  composeHistoricalOddity,
  composeResearchTrail,
  composeEvolutionMilestone,
  composeEvolutionRelationship,
  composeKnowledgeEvolutionRegistry,
  composeKnowledgeEvolutionRegistryFromInput,
  composeKnowledgeEvolution,
  composeCuriosityArtifactWithKnowledgeEvolution,
  isSupportedDiscoveryType,
  isSupportedEvolutionStage,
  isSupportedResearchTrailType,
  isSupportedOddityType,
  isSupportedEvolutionPurpose,
  isSupportedKnowledgeEvolutionStatus,
  isSupportedKnowledgeEvolutionGovernance,
  getCanonicalDiscoveryTypes,
  getCanonicalEvolutionStages,
  getCanonicalResearchTrailTypes,
  getCanonicalOddityTypes,
  getCanonicalEvolutionPurposes,
  getCanonicalKnowledgeEvolutionStatuses,
} from './KnowledgeEvolutionKernel.ts';

// ============================================================================
// D9-OPT-06 — KNOWLEDGE EVOLUTION VALIDATION — Deterministic validation
// ============================================================================

export {
  KNOWLEDGE_EVOLUTION_VALIDATION_CODES,
  validateKnowledgeEvolutionProfile,
  validateHistoricalOddity,
  validateResearchTrail,
  validateEvolutionMilestone,
  validateEvolutionRelationship,
  validateKnowledgeEvolutionRegistry,
  validateKnowledgeEvolutionInput,
  validateKnowledgeEvolutionTrace,
  validateCuriosityArtifactWithKnowledgeEvolution,
} from './KnowledgeEvolutionValidation.ts';

// ============================================================================
// D9-OPT-07 — UNEXPECTED CONNECTION CONTRACTS — Domain types and constants
// ============================================================================

export {
  CANONICAL_CONNECTION_TYPES,
  CANONICAL_LIMITATION_TYPES,
  CANONICAL_SURPRISE_TYPES,
  CANONICAL_DISCOVERY_IMPACT,
  CANONICAL_DISCOVERY_STATUS,
  type ConnectionType,
  type LimitationType,
  type SurpriseType,
  type DiscoveryImpact,
  type DiscoveryStatus,
  type UnexpectedConnectionProvenance,
  type UnexpectedConnectionDecision,
  type UnexpectedConnectionTrace,
  type UnexpectedConnectionProfile,
  type LimitationWarning,
  type ApplicationSurprise,
  type DiscoveryRelationship,
  type DiscoveryRegistryMetadata,
  type DiscoveryRegistry,
  type DiscoveryInput,
  type CuriosityArtifactWithDiscoveries,
  type DiscoveryValidationError,
  type DiscoveryValidationResult,
  type DiscoveryRegistryValidationResult,
  type DiscoveryInputValidationResult,
  type DiscoveryTraceValidationResult,
  type CuriosityArtifactWithDiscoveriesValidationResult,
} from './CuriosityAgentContract.ts';

// ============================================================================
// D9-OPT-07 — UNEXPECTED CONNECTION KERNEL — Deterministic composition functions
// ============================================================================

export {
  composeUnexpectedConnectionProvenance,
  composeUnexpectedConnectionTrace,
  composeUnexpectedConnectionProfile,
  composeLimitationWarning,
  composeApplicationSurprise,
  composeDiscoveryRelationship,
  composeDiscoveryRegistry,
  composeDiscoveryRegistryFromInput,
  composeDiscoveries,
  composeCuriosityArtifactWithDiscoveries,
  isSupportedConnectionType,
  isSupportedLimitationType,
  isSupportedSurpriseType,
  isSupportedDiscoveryImpact,
  isSupportedDiscoveryStatus,
  isSupportedDiscoveryGovernance,
  getCanonicalConnectionTypes,
  getCanonicalLimitationTypes,
  getCanonicalSurpriseTypes,
  getCanonicalDiscoveryImpacts,
  getCanonicalDiscoveryStatuses,
} from './UnexpectedConnectionKernel.ts';

// ============================================================================
// D9-OPT-07 — UNEXPECTED CONNECTION VALIDATION — Deterministic validation
// ============================================================================

export {
  DISCOVERY_VALIDATION_CODES,
  validateUnexpectedConnectionProfile,
  validateLimitationWarning,
  validateApplicationSurprise,
  validateDiscoveryRelationship,
  validateDiscoveryRegistry,
  validateDiscoveryInput,
  validateDiscoveryTrace,
  validateCuriosityArtifactWithDiscoveries,
} from './UnexpectedConnectionValidation.ts';

// ============================================================================
// D9-OPT-08 — LABORATORY CURIOSITY CONTRACTS — Domain types and constants
// ============================================================================

export {
  CANONICAL_LAB_CHALLENGE_TYPES,
  CANONICAL_WHATS_IF_TYPES,
  CANONICAL_EXPERIMENT_TYPES,
  CANONICAL_EXPLORATION_OBJECTIVES,
  CANONICAL_EXPLORATION_STATUS,
  type LabChallengeType,
  type WhatsIfType,
  type ExperimentType,
  type ExplorationObjective,
  type ExplorationStatus,
  type LaboratoryCuriosityProvenance,
  type LaboratoryCuriosityDecision,
  type LaboratoryCuriosityTrace,
  type LaboratoryChallenge,
  type WhatIfPrompt,
  type ExperimentCuriosity,
  type ExplorationRelationship,
  type ExplorationRegistryMetadata,
  type ExplorationRegistry,
  type ExplorationInput,
  type CuriosityArtifactWithExploration,
  type ExplorationValidationError,
  type ExplorationValidationResult,
  type ExplorationRegistryValidationResult,
  type ExplorationInputValidationResult,
  type ExplorationTraceValidationResult,
  type CuriosityArtifactWithExplorationValidationResult,
} from './CuriosityAgentContract.ts';

// ============================================================================
// D9-OPT-08 — LABORATORY CURIOSITY KERNEL — Deterministic composition functions
// ============================================================================

export {
  composeLaboratoryCuriosityProvenance,
  composeLaboratoryCuriosityTrace,
  composeLaboratoryChallenge,
  composeWhatIfPrompt,
  composeExperimentCuriosity,
  composeExplorationRelationship,
  composeExplorationRegistry,
  composeExplorationRegistryFromInput,
  composeExplorationArtifacts,
  composeCuriosityArtifactWithExploration,
  isSupportedLaboratoryChallengeType,
  isSupportedWhatIfType,
  isSupportedExperimentType,
  isSupportedExplorationObjective,
  isSupportedExplorationStatus,
  isSupportedExplorationGovernance,
  getCanonicalLaboratoryChallengeTypes,
  getCanonicalWhatIfTypes,
  getCanonicalExperimentTypes,
  getCanonicalExplorationObjectives,
  getCanonicalExplorationStatuses,
} from './LaboratoryCuriosityKernel.ts';

// ============================================================================
// D9-OPT-08 — LABORATORY CURIOSITY VALIDATION — Deterministic validation
// ============================================================================

export {
  EXPLORATION_VALIDATION_CODES,
  validateLaboratoryChallenge,
  validateWhatIfPrompt,
  validateExperimentCuriosity,
  validateExplorationRelationship,
  validateExplorationRegistry,
  validateExplorationInput,
  validateExplorationTrace,
  validateCuriosityArtifactWithExploration,
} from './LaboratoryCuriosityValidation.ts';

// ============================================================================
// D9-OPT-09 — MISCONCEPTION CURIOSITY CONTRACTS — Domain types and constants
// ============================================================================

export {
  CANONICAL_MISCONCEPTION_CARD_TYPES,
  CANONICAL_REINFORCEMENT_REFERENCE_TYPES,
  CANONICAL_MISCONCEPTION_IMPORTANCE,
  CANONICAL_CORRECTIVE_OUTCOMES,
  CANONICAL_MISCONCEPTION_CURIOSITY_STATUS,
  type MisconceptionCardType,
  type ReinforcementReferenceType,
  type MisconceptionImportance,
  type CorrectiveOutcome,
  type MisconceptionCuriosityStatus,
  type MisconceptionCuriosityProvenance,
  type MisconceptionCuriosityDecision,
  type MisconceptionCuriosityTrace,
  type MisconceptionCard,
  type AssessmentReinforcementReference,
  type CorrectiveInsight,
  type MisconceptionRelationship,
  type MisconceptionRegistryMetadata,
  type MisconceptionRegistry,
  type MisconceptionInput,
  type CuriosityArtifactWithMisconceptions,
  type MisconceptionCuriosityValidationError,
  type MisconceptionCuriosityValidationResult,
  type MisconceptionRegistryValidationResult,
  type MisconceptionInputValidationResult,
  type MisconceptionTraceValidationResult,
  type CuriosityArtifactWithMisconceptionsValidationResult,
} from './CuriosityAgentContract.ts';

// ============================================================================
// D9-OPT-09 — MISCONCEPTION CURIOSITY KERNEL — Deterministic composition functions
// ============================================================================

export {
  composeMisconceptionCuriosityProvenance,
  composeMisconceptionCuriosityTrace,
  composeMisconceptionCard,
  composeAssessmentReinforcementReference,
  composeCorrectiveInsight,
  composeMisconceptionRelationship,
  composeMisconceptionRegistry,
  composeMisconceptionRegistryFromInput,
  composeMisconceptionArtifacts,
  composeCuriosityArtifactWithMisconceptions,
  isSupportedMisconceptionCardType,
  isSupportedReinforcementReferenceType,
  isSupportedMisconceptionImportance,
  isSupportedCorrectiveOutcome,
  isSupportedMisconceptionCuriosityStatus,
  isSupportedMisconceptionCuriosityGovernance,
  getCanonicalMisconceptionCardTypes,
  getCanonicalReinforcementReferenceTypes,
  getCanonicalMisconceptionImportance,
  getCanonicalCorrectiveOutcomes,
  getCanonicalMisconceptionCuriosityStatuses,
} from './MisconceptionCuriosityKernel.ts';

// ============================================================================
// D9-OPT-09 — MISCONCEPTION CURIOSITY VALIDATION — Deterministic validation
// ============================================================================

export {
  MISCONCEPTION_CURIOSITY_VALIDATION_CODES,
  validateMisconceptionCard,
  validateAssessmentReinforcementReference,
  validateCorrectiveInsight,
  validateMisconceptionRelationship,
  validateMisconceptionRegistry,
  validateMisconceptionInput,
  validateMisconceptionTrace,
  validateCuriosityArtifactWithMisconceptions,
} from './MisconceptionCuriosityValidation.ts';

// ============================================================================
// D9-OPT-10 — VISUAL PRESENTATION CONTRACTS — Domain types and constants
// ============================================================================

export {
  CANONICAL_VISUAL_PRESENTATION_TYPES,
  CANONICAL_VISUAL_HIERARCHY,
  CANONICAL_ACCESSIBILITY_LEVELS,
  CANONICAL_READING_FLOW,
  CANONICAL_VISUAL_EMPHASIS,
  CANONICAL_VISUAL_PRESENTATION_STATUS,
  type VisualPresentationType,
  type VisualHierarchy,
  type AccessibilityLevel,
  type ReadingFlow,
  type VisualEmphasis,
  type VisualPresentationStatus,
  type VisualPresentationProvenance,
  type VisualPresentationDecision,
  type VisualPresentationTrace,
  type VisualPresentationProfile,
  type AccessibilityMetadata,
  type ReadingFlowMetadata,
  type VisualEmphasisMetadata,
  type PresentationRelationship,
  type PresentationRegistryMetadata,
  type PresentationRegistry,
  type PresentationInput,
  type CuriosityArtifactWithPresentation,
  type PresentationValidationError,
  type PresentationValidationResult,
  type PresentationRegistryValidationResult,
  type PresentationInputValidationResult,
  type PresentationTraceValidationResult,
  type CuriosityArtifactWithPresentationValidationResult,
} from './CuriosityAgentContract.ts';

// ============================================================================
// D9-OPT-10 — VISUAL PRESENTATION KERNEL — Deterministic composition functions
// ============================================================================

export {
  composeVisualPresentationProvenance,
  composeVisualPresentationTrace,
  composeVisualPresentationProfile,
  composeAccessibilityMetadata,
  composeReadingFlowMetadata,
  composeVisualEmphasisMetadata,
  composePresentationRelationship,
  composePresentationRegistry,
  composePresentationRegistryFromInput,
  composePresentationArtifacts,
  composeCuriosityArtifactWithPresentation,
  isSupportedVisualPresentationType,
  isSupportedVisualHierarchy,
  isSupportedAccessibilityLevel,
  isSupportedReadingFlow,
  isSupportedVisualEmphasis,
  isSupportedPresentationStatus,
  isSupportedPresentationGovernance,
  getCanonicalVisualPresentationTypes,
  getCanonicalVisualHierarchy,
  getCanonicalAccessibilityLevels,
  getCanonicalReadingFlows,
  getCanonicalVisualEmphasis,
  getCanonicalPresentationStatuses,
} from './VisualPresentationKernel.ts';

// ============================================================================
// D9-OPT-10 — VISUAL PRESENTATION VALIDATION — Deterministic validation
// ============================================================================

export {
  PRESENTATION_VALIDATION_CODES,
  validateVisualPresentationProfile,
  validateAccessibilityMetadata,
  validateReadingFlowMetadata,
  validateVisualEmphasisMetadata,
  validatePresentationRelationship,
  validatePresentationRegistry,
  validatePresentationInput,
  validatePresentationTrace,
  validateCuriosityArtifactWithPresentation,
} from './VisualPresentationValidation.ts';

// ============================================================================
// D9-OPT-11 — USER PREFERENCE CONTRACTS — Domain types and constants
// ============================================================================

export {
  CANONICAL_USER_PREFERENCE_TYPES,
  CANONICAL_TONE_CONTROL_LEVELS,
  CANONICAL_PLACEMENT_RULES,
  CANONICAL_VISIBILITY_LEVELS,
  CANONICAL_PRESENTATION_ELIGIBILITY,
  CANONICAL_PREFERENCE_STATUS,
  type UserPreferenceType,
  type ToneControlLevel,
  type PlacementRule,
  type VisibilityLevel,
  type PresentationEligibility,
  type PreferenceStatus,
  type CuriosityPreferenceProvenance,
  type CuriosityPreferenceDecision,
  type CuriosityPreferenceTrace,
  type CuriosityPreferenceProfile,
  type ToneControlMetadata,
  type PlacementMetadata,
  type VisibilityMetadata,
  type PreferenceRelationship,
  type PreferenceRegistryMetadata,
  type PreferenceRegistry,
  type PreferenceInput,
  type CuriosityArtifactWithPreferences,
  type PreferenceValidationError,
  type PreferenceValidationResult,
  type PreferenceRegistryValidationResult,
  type PreferenceInputValidationResult,
  type PreferenceTraceValidationResult,
  type CuriosityArtifactWithPreferencesValidationResult,
} from './CuriosityAgentContract.ts';

// ============================================================================
// D9-OPT-11 — USER PREFERENCE KERNEL — Deterministic composition functions
// ============================================================================

export {
  composeCuriosityPreferenceProvenance,
  composeCuriosityPreferenceTrace,
  composeCuriosityPreferenceProfile,
  composeToneControlMetadata,
  composePlacementMetadata,
  composeVisibilityMetadata,
  composePreferenceRelationship,
  composePreferenceRegistry,
  composePreferenceRegistryFromInput,
  composeCuriosityPreferences,
  composeCuriosityArtifactWithPreferences,
  isSupportedUserPreferenceType,
  isSupportedToneControlLevel,
  isSupportedPlacementRule,
  isSupportedVisibilityLevel,
  isSupportedPresentationEligibility,
  isSupportedPreferenceStatus,
  isSupportedPreferenceGovernance,
  getCanonicalUserPreferenceTypes,
  getCanonicalToneControlLevels,
  getCanonicalPlacementRules,
  getCanonicalVisibilityLevels,
  getCanonicalPresentationEligibility,
  getCanonicalPreferenceStatuses,
} from './CuriosityPreferenceKernel.ts';

// ============================================================================
// D9-OPT-11 — USER PREFERENCE VALIDATION — Deterministic validation
// ============================================================================

export {
  PREFERENCE_VALIDATION_CODES,
  validateCuriosityPreferenceProfile,
  validateToneControlMetadata,
  validatePlacementMetadata,
  validateVisibilityMetadata,
  validatePreferenceRelationship,
  validatePreferenceRegistry,
  validatePreferenceInput,
  validatePreferenceTrace,
  validateCuriosityArtifactWithPreferences,
} from './CuriosityPreferenceValidation.ts';

// ============================================================================
// D9-OPT-12 — GOVERNANCE WORKFLOW CONTRACTS — Domain types and constants
// ============================================================================

export {
  CANONICAL_GOVERNANCE_STAGES,
  CANONICAL_REVIEW_OUTCOMES,
  CANONICAL_VALIDATION_POLICIES,
  CANONICAL_APPROVAL_LEVELS,
  CANONICAL_PUBLICATION_STATES,
  CANONICAL_GOVERNANCE_STATUS,
  type GovernanceStage,
  type ReviewOutcome,
  type ValidationPolicy,
  type ApprovalLevel,
  type PublicationState,
  type GovernanceStatus,
  type CuriosityGovernanceProvenance,
  type CuriosityGovernanceDecision,
  type CuriosityGovernanceTrace,
  type GovernanceWorkflow,
  type ValidationPolicyMetadata,
  type ReviewRecord,
  type ApprovalMetadata,
  type GovernanceRelationship,
  type GovernanceRegistryMetadata,
  type GovernanceRegistry,
  type GovernanceInput,
  type CuriosityArtifactWithGovernance,
  type GovernanceValidationError,
  type GovernanceValidationResult,
  type GovernanceRegistryValidationResult,
  type GovernanceInputValidationResult,
  type GovernanceTraceValidationResult,
  type CuriosityArtifactWithGovernanceValidationResult,
} from './CuriosityAgentContract.ts';

// ============================================================================
// D9-OPT-12 — GOVERNANCE WORKFLOW KERNEL — Deterministic composition functions
// ============================================================================

export {
  composeCuriosityGovernanceProvenance,
  composeCuriosityGovernanceTrace,
  composeGovernanceWorkflow,
  composeValidationPolicy,
  composeReviewRecord,
  composeApprovalMetadata,
  composeGovernanceRelationship,
  composeGovernanceRegistry,
  composeGovernanceRegistryFromInput,
  composeGovernanceArtifacts,
  composeCuriosityArtifactWithGovernance,
  isSupportedGovernanceStage,
  isSupportedReviewOutcome,
  isSupportedValidationPolicy,
  isSupportedApprovalLevel,
  isSupportedPublicationState,
  isSupportedGovernanceStatus,
  isSupportedGovernanceGovernance,
  getCanonicalGovernanceStages,
  getCanonicalReviewOutcomes,
  getCanonicalValidationPolicies,
  getCanonicalApprovalLevels,
  getCanonicalPublicationStates,
  getCanonicalGovernanceStatuses,
} from './CuriosityGovernanceKernel.ts';

// ============================================================================
// D9-OPT-12 — GOVERNANCE WORKFLOW VALIDATION — Deterministic validation
// ============================================================================

export {
  GOVERNANCE_VALIDATION_CODES,
  validateGovernanceWorkflow,
  validateValidationPolicy,
  validateReviewRecord,
  validateApprovalMetadata,
  validateGovernanceRelationship,
  validateGovernanceRegistry,
  validateGovernanceInput,
  validateGovernanceTrace,
  validateCuriosityArtifactWithGovernance,
} from './CuriosityGovernanceValidation.ts';

// ============================================================================
// D9-OPT-13 — STORAGE SEPARATION CONTRACTS — Domain types and constants
// ============================================================================

export {
  CANONICAL_STORAGE_TYPES,
  CANONICAL_RETRIEVAL_STRATEGIES,
  CANONICAL_OVERLAY_TYPES,
  CANONICAL_STORAGE_VISIBILITY,
  CANONICAL_STORAGE_SCOPE,
  CANONICAL_STORAGE_STATUS,
  type StorageType,
  type RetrievalStrategy,
  type OverlayType,
  type StorageVisibility,
  type StorageScope,
  type StorageStatus,
  type CuriosityStorageProvenance,
  type CuriosityStorageDecision,
  type CuriosityStorageTrace,
  type CuriosityStorageProfile,
  type RetrievalMetadata,
  type OverlayMetadata,
  type StorageRelationship,
  type StorageRegistryMetadata,
  type StorageRegistry,
  type StorageInput,
  type CuriosityArtifactWithStorage,
  type StorageValidationError,
  type StorageValidationResult,
  type StorageRegistryValidationResult,
  type StorageInputValidationResult,
  type StorageTraceValidationResult,
  type CuriosityArtifactWithStorageValidationResult,
} from './CuriosityAgentContract.ts';

// ============================================================================
// D9-OPT-13 — STORAGE SEPARATION KERNEL — Deterministic composition functions
// ============================================================================

export {
  composeCuriosityStorageProvenance,
  composeCuriosityStorageTrace,
  composeCuriosityStorageProfile,
  composeRetrievalMetadata,
  composeOverlayMetadata,
  composeStorageRelationship,
  composeStorageRegistry,
  composeStorageRegistryFromInput,
  composeStorageArtifacts,
  composeCuriosityArtifactWithStorage,
  isSupportedStorageType,
  isSupportedRetrievalStrategy,
  isSupportedOverlayType,
  isSupportedStorageVisibility,
  isSupportedStorageScope,
  isSupportedStorageStatus,
  isSupportedStorageGovernance,
  getCanonicalStorageTypes,
  getCanonicalRetrievalStrategies,
  getCanonicalOverlayTypes,
  getCanonicalStorageVisibility,
  getCanonicalStorageScopes,
  getCanonicalStorageStatuses,
} from './CuriosityStorageKernel.ts';

// ============================================================================
// D9-OPT-13 — STORAGE SEPARATION VALIDATION — Deterministic validation
// ============================================================================

export {
  STORAGE_VALIDATION_CODES,
  validateCuriosityStorageProfile,
  validateRetrievalMetadata,
  validateOverlayMetadata,
  validateStorageRelationship,
  validateStorageRegistry,
  validateStorageInput,
  validateStorageTrace,
  validateCuriosityArtifactWithStorage,
} from './CuriosityStorageValidation.ts';

// ============================================================================
// D9-OPT-14 — SAFETY, ACCESSIBILITY & HUMOR RISK CERTIFICATION CONTRACTS
// ============================================================================

export {
  CANONICAL_SAFETY_CERTIFICATION_TYPES,
  CANONICAL_HUMOR_RISK_LEVELS,
  CANONICAL_ACCESSIBILITY_COMPLIANCE,
  CANONICAL_CERTIFICATION_FINDINGS,
  CANONICAL_CERTIFICATION_DIMENSIONS,
  CANONICAL_CERTIFICATION_STATUS,
  type SafetyCertificationType,
  type HumorRiskLevel,
  type AccessibilityCompliance,
  type CertificationFinding,
  type CertificationDimension,
  type CertificationStatus,
  type CuriositySafetyProvenance,
  type CuriositySafetyDecision,
  type CuriositySafetyTrace,
  type CuriositySafetyProfile,
  type HumorRiskMetadata,
  type AccessibilityCertification,
  type CertificationFindingRecord,
  type CertificationRelationship,
  type CertificationRegistryMetadata,
  type CertificationRegistry,
  type CertificationInput,
  type CuriosityArtifactWithCertification,
  type CertificationValidationError,
  type CertificationValidationResult,
  type CertificationRegistryValidationResult,
  type CertificationInputValidationResult,
  type CertificationTraceValidationResult,
  type CuriosityArtifactWithCertificationValidationResult,
} from './CuriosityAgentContract.ts';

// ============================================================================
// D9-OPT-14 — SAFETY, ACCESSIBILITY & HUMOR RISK CERTIFICATION KERNEL
// ============================================================================

export {
  composeCuriositySafetyProvenance,
  composeCuriositySafetyTrace,
  composeCuriositySafetyProfile,
  composeHumorRiskMetadata,
  composeAccessibilityCertification,
  composeCertificationFinding,
  composeCertificationRelationship,
  composeCertificationRegistry,
  composeCertificationRegistryFromInput,
  composeCertificationArtifacts,
  composeCuriosityArtifactWithCertification,
  isSupportedSafetyCertificationType,
  isSupportedHumorRiskLevel,
  isSupportedAccessibilityCompliance,
  isSupportedCertificationFinding,
  isSupportedCertificationDimension,
  isSupportedCertificationStatus,
  isSupportedCertificationGovernance,
  getCanonicalSafetyCertificationTypes,
  getCanonicalHumorRiskLevels,
  getCanonicalAccessibilityCompliance,
  getCanonicalCertificationFindings,
  getCanonicalCertificationDimensions,
  getCanonicalCertificationStatuses,
} from './CuriositySafetyKernel.ts';

// ============================================================================
// D9-OPT-14 — SAFETY, ACCESSIBILITY & HUMOR RISK CERTIFICATION VALIDATION
// ============================================================================

export {
  CERTIFICATION_VALIDATION_CODES,
  validateCuriositySafetyProfile,
  validateHumorRiskMetadata,
  validateAccessibilityCertification,
  validateCertificationFinding,
  validateCertificationRelationship,
  validateCertificationRegistry,
  validateCertificationInput,
  validateCertificationTrace,
  validateCuriosityArtifactWithCertification,
} from './CuriositySafetyValidation.ts';

// ============================================================================
// D9-OPT-15 — CURIOSITY CERTIFICATION & STRUCTURAL QUALITY GATE CONTRACTS
// ============================================================================

export {
  CANONICAL_CURIOSITY_CERTIFICATION_STATUS,
  CANONICAL_CURIOSITY_FINDING_SEVERITY,
  CANONICAL_CURIOSITY_QUALITY_DIMENSIONS,
  type CuriosityCertificationStatus,
  type CuriosityFindingSeverity,
  type CuriosityQualityDimension,
  type CuriosityCertificationFinding,
  type CuriosityCertificationTrace,
  type CuriosityCertificationMetadata,
  type CuriosityCertificationReport,
  type CuriosityCertificationValidationError,
  type CuriosityCertificationValidationResult,
  type CuriosityCertificationFindingValidationResult,
  type CuriosityCertificationStatusValidationResult,
  type CuriosityCertificationScoreValidationResult,
} from './CuriosityAgentContract.ts';

// ============================================================================
// D9-OPT-15 — CURIOSITY CERTIFICATION ENGINE — Deterministic composition
// ============================================================================

export {
  composeCuriosityCertificationFinding,
  composeCuriosityCertificationTrace,
  composeCuriosityCertificationMetadata,
  composeCuriosityCertificationReport,
  calculateCuriosityCertificationScore,
  determineCuriosityCertificationStatus,
  isCuriosityCertificationSuccessful,
  certifyCuriosityArtifact,
  validateCuriosityCertification,
  isSupportedCuriosityCertificationStatus,
  isSupportedCuriosityFindingSeverity,
  isSupportedCuriosityQualityDimension,
  getCanonicalCuriosityCertificationStatuses,
  getCanonicalCuriosityFindingSeverities,
  getCanonicalCuriosityQualityDimensions,
} from './CuriosityCertificationEngine.ts';

// ============================================================================
// D9-OPT-15 — CURIOSITY CERTIFICATION VALIDATION — Deterministic validation
// ============================================================================

export {
  CURIOSITY_CERTIFICATION_VALIDATION_CODES,
  validateCuriosityCertificationFinding,
  validateCuriosityCertificationStatus,
  validateCuriosityCertificationScore,
  validateCuriosityCertificationReport,
} from './CuriosityCertificationValidation.ts';

// ============================================================================
// D9-OPT-16 — PUBLIC API CONSOLIDATION & CURIOSITY PIPELINE FACADE CONTRACTS
// ============================================================================

export {
  CANONICAL_CURIOSITY_FACADE_STATUS,
  type CuriosityFacadeStatus,
  type CuriosityFacadeTraceMetadata,
  type CuriosityFacadeValidationResult,
  type CuriosityFacadeArtifactResult,
  type CuriosityFacadeCertificationResult,
  type CuriosityFacadeCompleteResult,
  type CuriosityFacadeValidationError,
  type CuriosityFacadeEntryValidationResult,
} from './CuriosityAgentContract.ts';

// ============================================================================
// D9-OPT-16 — CURIOSITY PIPELINE FACADE — Deterministic composition
// ============================================================================

export {
  composeCuriosityFacadeTrace,
  composeCuriosityArtifact,
  certifyCuriosityFacadeArtifact,
  composeAndCertifyCuriosityArtifact,
  validateCuriosityFacadeArtifact,
  validateCuriosityFacadeCertification,
  validateCuriosityFacadeComplete,
  isSupportedCuriosityFacadeStatus,
  getCanonicalCuriosityFacadeStatuses,
  CURIOSITY_FACADE_VALIDATION_CODES,
} from './CuriosityPipelineFacade.ts';

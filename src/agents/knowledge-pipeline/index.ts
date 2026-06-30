/**
 * D10-OPT-01 / D10-OPT-02 / D10-OPT-03 / D10-OPT-04 / D10-OPT-05 / D10-OPT-06 / D10-OPT-07 / D10-OPT-08 / D10-OPT-09 / D10-OPT-10 / D10-OPT-11 / D10-OPT-12 / D10-OPT-13 / D10-OPT-14 / D10-OPT-15 / D10-OPT-16 / D10-OPT-17 / D10-OPT-18 — Knowledge Agent Canonical Foundation
 *
 * Public API for the Knowledge Agent.
 * Exports: contracts, enums, compose functions, validators, helper functions.
 */

// ============================================================================
// D10-OPT-01 — CONTRACTS — Domain types and constants
// ============================================================================

export {
  CANONICAL_KNOWLEDGE_TYPES,
  CANONICAL_KNOWLEDGE_CATEGORIES,
  CANONICAL_KNOWLEDGE_DIFFICULTY,
  CANONICAL_KNOWLEDGE_STATUS,
  CANONICAL_KNOWLEDGE_REVIEW_STATUS,
  CANONICAL_KNOWLEDGE_GOVERNANCE,
  type KnowledgeType,
  type KnowledgeCategory,
  type KnowledgeDifficulty,
  type KnowledgeStatus,
  type KnowledgeReviewStatus,
  type KnowledgeGovernance,
  type KnowledgeProvenance,
  type KnowledgeDecision,
  type KnowledgeTrace,
  type KnowledgeNode,
  type KnowledgeRegistryMetadata,
  type KnowledgeRegistry,
  type KnowledgeInput,
  type KnowledgeValidationError,
  type KnowledgeValidationResult,
  type KnowledgeNodeValidationResult,
  type KnowledgeRegistryValidationResult,
  type KnowledgeInputValidationResult,
  type KnowledgeTraceValidationResult,
} from './KnowledgeAgentContract.ts';

// ============================================================================
// D10-OPT-01 — KERNEL — Deterministic composition functions
// ============================================================================

export {
  composeKnowledgeProvenance,
  composeKnowledgeTrace,
  composeKnowledgeNode,
  composeKnowledgeRegistry,
  composeKnowledgeRegistryFromInput,
  composeKnowledge,
  isSupportedKnowledgeType,
  isSupportedKnowledgeCategory,
  isSupportedKnowledgeDifficulty,
  isSupportedKnowledgeReviewStatus,
  isSupportedKnowledgeGovernance,
  getCanonicalKnowledgeTypes,
  getCanonicalKnowledgeCategories,
  getCanonicalKnowledgeDifficulty,
  getCanonicalKnowledgeStatuses,
  getCanonicalKnowledgeGovernance,
} from './KnowledgeKernel.ts';

// ============================================================================
// D10-OPT-01 — VALIDATION — Deterministic validation
// ============================================================================

export {
  KNOWLEDGE_VALIDATION_CODES,
  validateKnowledgeNode,
  validateKnowledgeRegistry,
  validateKnowledgeInput,
  validateKnowledgeTrace,
} from './KnowledgeValidation.ts';

// ============================================================================
// D10-OPT-02 — EXPLANATION CONTRACTS — Domain types and constants
// ============================================================================

export {
  CANONICAL_EXPLANATION_LEVELS,
  CANONICAL_EXPLANATION_FORMATS,
  CANONICAL_EXPLANATION_PURPOSES,
  CANONICAL_AUDIENCE_LEVELS,
  CANONICAL_EXPLANATION_STATUS,
  CANONICAL_EXPLANATION_GOVERNANCE,
  type ExplanationLevel,
  type ExplanationFormat,
  type ExplanationPurpose,
  type AudienceLevel,
  type ExplanationStatus,
  type ExplanationGovernance,
  type KnowledgeExplanationProvenance,
  type KnowledgeExplanationDecision,
  type KnowledgeExplanationTrace,
  type KnowledgeExplanationProfile,
  type KnowledgeExplanationRelationship,
  type KnowledgeExplanationRegistryMetadata,
  type KnowledgeExplanationRegistry,
  type KnowledgeExplanationInput,
  type KnowledgeArtifactWithExplanations,
  type KnowledgeExplanationValidationError,
  type KnowledgeExplanationValidationResult,
  type KnowledgeExplanationRegistryValidationResult,
  type KnowledgeExplanationInputValidationResult,
  type KnowledgeExplanationTraceValidationResult,
  type KnowledgeArtifactWithExplanationsValidationResult,
} from './KnowledgeAgentContract.ts';

// ============================================================================
// D10-OPT-02 — EXPLANATION KERNEL — Deterministic composition functions
// ============================================================================

export {
  composeKnowledgeExplanationProvenance,
  composeKnowledgeExplanationTrace,
  composeKnowledgeExplanationProfile,
  composeKnowledgeExplanationRelationship,
  composeKnowledgeExplanationRegistry,
  composeKnowledgeExplanationRegistryFromInput,
  composeKnowledgeExplanations,
  composeKnowledgeArtifactWithExplanations,
  isSupportedExplanationLevel,
  isSupportedExplanationFormat,
  isSupportedExplanationPurpose,
  isSupportedAudienceLevel,
  isSupportedExplanationStatus,
  isSupportedExplanationGovernance,
  getCanonicalExplanationLevels,
  getCanonicalExplanationFormats,
  getCanonicalExplanationPurposes,
  getCanonicalAudienceLevels,
  getCanonicalExplanationStatuses,
} from './KnowledgeExplanationKernel.ts';

// ============================================================================
// D10-OPT-02 — EXPLANATION VALIDATION — Deterministic validation
// ============================================================================

export {
  EXPLANATION_VALIDATION_CODES,
  validateKnowledgeExplanationProfile,
  validateKnowledgeExplanationRelationship,
  validateKnowledgeExplanationRegistry,
  validateKnowledgeExplanationInput,
  validateKnowledgeExplanationTrace,
  validateKnowledgeArtifactWithExplanations,
} from './KnowledgeExplanationValidation.ts';

// ============================================================================
// D10-OPT-03 — COMPONENT CONTRACTS — Domain types and constants
// ============================================================================

export {
  CANONICAL_COMPONENT_TYPES,
  CANONICAL_COMPONENT_PRIORITY,
  CANONICAL_COMPONENT_STATUS,
  CANONICAL_COMPONENT_VISIBILITY,
  CANONICAL_COMPONENT_ROLE,
  CANONICAL_COMPONENT_GOVERNANCE,
  type ComponentType,
  type ComponentPriority,
  type ComponentStatus,
  type ComponentVisibility,
  type ComponentRole,
  type ComponentGovernance,
  type KnowledgeConceptProvenance,
  type KnowledgeConceptDecision,
  type KnowledgeConceptTrace,
  type KnowledgeComponent,
  type KnowledgeComponentRelationship,
  type KnowledgeComponentRegistryMetadata,
  type KnowledgeComponentRegistry,
  type KnowledgeComponentInput,
  type KnowledgeArtifactWithComponents,
  type KnowledgeComponentValidationError,
  type KnowledgeComponentValidationResult,
  type KnowledgeComponentRegistryValidationResult,
  type KnowledgeComponentInputValidationResult,
  type KnowledgeComponentTraceValidationResult,
  type KnowledgeArtifactWithComponentsValidationResult,
} from './KnowledgeAgentContract.ts';

// ============================================================================
// D10-OPT-03 — COMPONENT KERNEL — Deterministic composition functions
// ============================================================================

export {
  composeKnowledgeConceptProvenance,
  composeKnowledgeConceptTrace,
  composeKnowledgeComponent,
  composeKnowledgeComponentRelationship,
  composeKnowledgeComponentRegistry,
  composeKnowledgeComponentRegistryFromInput,
  composeKnowledgeComponents,
  composeKnowledgeArtifactWithComponents,
  isSupportedComponentType,
  isSupportedComponentPriority,
  isSupportedComponentRole,
  isSupportedComponentVisibility,
  isSupportedComponentStatus,
  isSupportedComponentGovernance,
  getCanonicalComponentTypes,
  getCanonicalComponentPriorities,
  getCanonicalComponentRoles,
  getCanonicalComponentVisibility,
  getCanonicalComponentStatuses,
} from './KnowledgeConceptKernel.ts';

// ============================================================================
// D10-OPT-03 — COMPONENT VALIDATION — Deterministic validation
// ============================================================================

export {
  COMPONENT_VALIDATION_CODES,
  validateKnowledgeComponent,
  validateKnowledgeComponentRelationship,
  validateKnowledgeComponentRegistry,
  validateKnowledgeComponentInput,
  validateKnowledgeComponentTrace,
  validateKnowledgeArtifactWithComponents,
} from './KnowledgeConceptValidation.ts';

// ============================================================================
// D10-OPT-04 — REPRESENTATION CONTRACTS — Domain types and constants
// ============================================================================

export {
  CANONICAL_REPRESENTATION_TYPES,
  CANONICAL_VISUAL_OBJECTIVES,
  CANONICAL_REPRESENTATION_COMPLEXITY,
  CANONICAL_REPRESENTATION_STATUS,
  CANONICAL_REPRESENTATION_VISIBILITY,
  CANONICAL_REPRESENTATION_GOVERNANCE,
  type RepresentationType,
  type VisualObjective,
  type RepresentationComplexity,
  type RepresentationStatus,
  type RepresentationVisibility,
  type RepresentationGovernance,
  type KnowledgeRepresentationProvenance,
  type KnowledgeRepresentationDecision,
  type KnowledgeRepresentationTrace,
  type KnowledgeRepresentationProfile,
  type KnowledgeRepresentationRelationship,
  type KnowledgeRepresentationRegistryMetadata,
  type KnowledgeRepresentationRegistry,
  type KnowledgeRepresentationInput,
  type KnowledgeArtifactWithRepresentations,
  type KnowledgeRepresentationValidationError,
  type KnowledgeRepresentationValidationResult,
  type KnowledgeRepresentationRegistryValidationResult,
  type KnowledgeRepresentationInputValidationResult,
  type KnowledgeRepresentationTraceValidationResult,
  type KnowledgeArtifactWithRepresentationsValidationResult,
} from './KnowledgeAgentContract.ts';

// ============================================================================
// D10-OPT-04 — REPRESENTATION KERNEL — Deterministic composition functions
// ============================================================================

export {
  composeKnowledgeRepresentationProvenance,
  composeKnowledgeRepresentationTrace,
  composeKnowledgeRepresentationProfile,
  composeKnowledgeRepresentationRelationship,
  composeKnowledgeRepresentationRegistry,
  composeKnowledgeRepresentationRegistryFromInput,
  composeKnowledgeRepresentations,
  composeKnowledgeArtifactWithRepresentations,
  isSupportedRepresentationType,
  isSupportedVisualObjective,
  isSupportedRepresentationComplexity,
  isSupportedRepresentationVisibility,
  isSupportedRepresentationStatus,
  isSupportedRepresentationGovernance,
  getCanonicalRepresentationTypes,
  getCanonicalVisualObjectives,
  getCanonicalRepresentationComplexities,
  getCanonicalRepresentationVisibility,
  getCanonicalRepresentationStatuses,
} from './KnowledgeRepresentationKernel.ts';

// ============================================================================
// D10-OPT-04 — REPRESENTATION VALIDATION — Deterministic validation
// ============================================================================

export {
  REPRESENTATION_VALIDATION_CODES,
  validateKnowledgeRepresentationProfile,
  validateKnowledgeRepresentationRelationship,
  validateKnowledgeRepresentationRegistry,
  validateKnowledgeRepresentationInput,
  validateKnowledgeRepresentationTrace,
  validateKnowledgeArtifactWithRepresentations,
} from './KnowledgeRepresentationValidation.ts';

// ============================================================================
// D10-OPT-05 — EXAMPLE CONTRACTS — Domain types and constants
// ============================================================================

export {
  CANONICAL_EXAMPLE_TYPES,
  CANONICAL_EXAMPLE_LEVELS,
  CANONICAL_PROGRESSIVE_STAGES,
  CANONICAL_EXAMPLE_STATUS,
  CANONICAL_EXAMPLE_VISIBILITY,
  CANONICAL_EXAMPLE_GOVERNANCE,
  type ExampleType,
  type ExampleLevel,
  type ProgressiveStage,
  type ExampleStatus,
  type ExampleVisibility,
  type ExampleGovernance,
  type KnowledgeExampleProvenance,
  type KnowledgeExampleDecision,
  type KnowledgeExampleTrace,
  type KnowledgeExampleProfile,
  type KnowledgeExampleRelationship,
  type KnowledgeExampleRegistryMetadata,
  type KnowledgeExampleRegistry,
  type KnowledgeExampleInput,
  type KnowledgeArtifactWithExamples,
  type KnowledgeExampleValidationError,
  type KnowledgeExampleValidationResult,
  type KnowledgeExampleRegistryValidationResult,
  type KnowledgeExampleInputValidationResult,
  type KnowledgeExampleTraceValidationResult,
  type KnowledgeArtifactWithExamplesValidationResult,
} from './KnowledgeAgentContract.ts';

// ============================================================================
// D10-OPT-05 — EXAMPLE KERNEL — Deterministic composition functions
// ============================================================================

export {
  composeKnowledgeExampleProvenance,
  composeKnowledgeExampleTrace,
  composeKnowledgeExampleProfile,
  composeKnowledgeExampleRelationship,
  composeKnowledgeExampleRegistry,
  composeKnowledgeExampleRegistryFromInput,
  composeKnowledgeExamples,
  composeKnowledgeArtifactWithExamples,
  isSupportedExampleType,
  isSupportedExampleLevel,
  isSupportedProgressiveStage,
  isSupportedExampleVisibility,
  isSupportedExampleStatus,
  isSupportedExampleGovernance,
  getCanonicalExampleTypes,
  getCanonicalExampleLevels,
  getCanonicalProgressiveStages,
  getCanonicalExampleVisibility,
  getCanonicalExampleStatuses,
} from './KnowledgeExampleKernel.ts';

// ============================================================================
// D10-OPT-05 — EXAMPLE VALIDATION — Deterministic validation
// ============================================================================

export {
  EXAMPLE_VALIDATION_CODES,
  validateKnowledgeExampleProfile,
  validateKnowledgeExampleRelationship,
  validateKnowledgeExampleRegistry,
  validateKnowledgeExampleInput,
  validateKnowledgeExampleTrace,
  validateKnowledgeArtifactWithExamples,
} from './KnowledgeExampleValidation.ts';

// ============================================================================
// D10-OPT-06 — COMPARISON CONTRACTS — Domain types and constants
// ============================================================================

export {
  CANONICAL_COMPARISON_TYPES,
  CANONICAL_COMPARISON_OBJECTIVES,
  CANONICAL_COMPARISON_DIMENSIONS,
  CANONICAL_COMPARISON_STATUS,
  CANONICAL_COMPARISON_VISIBILITY,
  CANONICAL_COMPARISON_GOVERNANCE,
  type ComparisonType,
  type ComparisonObjective,
  type ComparisonDimension,
  type ComparisonStatus,
  type ComparisonVisibility,
  type ComparisonGovernance,
  type KnowledgeComparisonProvenance,
  type KnowledgeComparisonDecision,
  type KnowledgeComparisonTrace,
  type KnowledgeComparisonProfile,
  type KnowledgeComparisonRelationship,
  type KnowledgeComparisonRegistryMetadata,
  type KnowledgeComparisonRegistry,
  type KnowledgeComparisonInput,
  type KnowledgeArtifactWithComparisons,
  type KnowledgeComparisonValidationError,
  type KnowledgeComparisonValidationResult,
  type KnowledgeComparisonRegistryValidationResult,
  type KnowledgeComparisonInputValidationResult,
  type KnowledgeComparisonTraceValidationResult,
  type KnowledgeArtifactWithComparisonsValidationResult,
} from './KnowledgeAgentContract.ts';

// ============================================================================
// D10-OPT-06 — COMPARISON KERNEL — Deterministic composition functions
// ============================================================================

export {
  composeKnowledgeComparisonProvenance,
  composeKnowledgeComparisonTrace,
  composeKnowledgeComparisonProfile,
  composeKnowledgeComparisonRelationship,
  composeKnowledgeComparisonRegistry,
  composeKnowledgeComparisonRegistryFromInput,
  composeKnowledgeComparisons,
  composeKnowledgeArtifactWithComparisons,
  isSupportedComparisonType,
  isSupportedComparisonObjective,
  isSupportedComparisonDimension,
  isSupportedComparisonVisibility,
  isSupportedComparisonStatus,
  isSupportedComparisonGovernance,
  getCanonicalComparisonTypes,
  getCanonicalComparisonObjectives,
  getCanonicalComparisonDimensions,
  getCanonicalComparisonVisibility,
  getCanonicalComparisonStatuses,
} from './KnowledgeComparisonKernel.ts';

// ============================================================================
// D10-OPT-06 — COMPARISON VALIDATION — Deterministic validation
// ============================================================================

export {
  COMPARISON_VALIDATION_CODES,
  validateKnowledgeComparisonProfile,
  validateKnowledgeComparisonRelationship,
  validateKnowledgeComparisonRegistry,
  validateKnowledgeComparisonInput,
  validateKnowledgeComparisonTrace,
  validateKnowledgeArtifactWithComparisons,
} from './KnowledgeComparisonValidation.ts';

// ============================================================================
// D10-OPT-07 — MATH GRAPH CONTRACTS — Domain types and constants
// ============================================================================

export {
  CANONICAL_GRAPH_TYPES,
  CANONICAL_GRAPH_OBJECTIVES,
  CANONICAL_COORDINATE_SYSTEMS,
  CANONICAL_GRAPH_STATUS,
  CANONICAL_GRAPH_VISIBILITY,
  CANONICAL_GRAPH_GOVERNANCE,
  type MathGraphType,
  type MathGraphObjective,
  type CoordinateSystem,
  type MathGraphStatus,
  type MathGraphVisibility,
  type MathGraphGovernance,
  type KnowledgeGraphProvenance,
  type KnowledgeGraphDecision,
  type KnowledgeGraphTrace,
  type KnowledgeGraphProfile,
  type KnowledgeGraphRelationship,
  type KnowledgeGraphRegistryMetadata,
  type KnowledgeGraphRegistry,
  type KnowledgeGraphInput,
  type KnowledgeArtifactWithGraphs,
  type KnowledgeGraphValidationError,
  type KnowledgeGraphValidationResult,
  type KnowledgeGraphRegistryValidationResult,
  type KnowledgeGraphInputValidationResult,
  type KnowledgeGraphTraceValidationResult,
  type KnowledgeArtifactWithGraphsValidationResult,
} from './KnowledgeAgentContract.ts';

// ============================================================================
// D10-OPT-07 — MATH GRAPH KERNEL — Deterministic composition functions
// ============================================================================

export {
  composeKnowledgeGraphProvenance,
  composeKnowledgeGraphTrace,
  composeKnowledgeGraphProfile,
  composeKnowledgeGraphRelationship,
  composeKnowledgeGraphRegistry,
  composeKnowledgeGraphRegistryFromInput,
  composeKnowledgeGraphs,
  composeKnowledgeArtifactWithGraphs,
  isSupportedGraphType,
  isSupportedGraphObjective,
  isSupportedCoordinateSystem,
  isSupportedGraphVisibility,
  isSupportedGraphStatus,
  isSupportedGraphGovernance,
  getCanonicalGraphTypes,
  getCanonicalGraphObjectives,
  getCanonicalCoordinateSystems,
  getCanonicalGraphVisibility,
  getCanonicalGraphStatuses,
} from './KnowledgeGraphKernel.ts';

// ============================================================================
// D10-OPT-07 — MATH GRAPH VALIDATION — Deterministic validation
// ============================================================================

export {
  GRAPH_VALIDATION_CODES,
  validateKnowledgeGraphProfile,
  validateKnowledgeGraphRelationship,
  validateKnowledgeGraphRegistry,
  validateKnowledgeGraphInput,
  validateKnowledgeGraphTrace,
  validateKnowledgeArtifactWithGraphs,
} from './KnowledgeGraphValidation.ts';

// ============================================================================
// D10-OPT-08 — VISUALIZATION CONTRACTS — Domain types and constants
// ============================================================================

export {
  CANONICAL_VISUALIZATION_TYPES,
  CANONICAL_VISUALIZATION_OBJECTIVES,
  CANONICAL_VISUALIZATION_COMPLEXITY,
  CANONICAL_VISUALIZATION_STATUS,
  CANONICAL_VISUALIZATION_VISIBILITY,
  CANONICAL_VISUALIZATION_GOVERNANCE,
  type VisualizationType,
  type VisualizationObjective,
  type VisualizationComplexity,
  type VisualizationStatus,
  type VisualizationVisibility,
  type VisualizationGovernance,
  type KnowledgeVisualizationProvenance,
  type KnowledgeVisualizationDecision,
  type KnowledgeVisualizationTrace,
  type KnowledgeVisualizationProfile,
  type KnowledgeVisualizationRelationship,
  type KnowledgeVisualizationRegistryMetadata,
  type KnowledgeVisualizationRegistry,
  type KnowledgeVisualizationInput,
  type KnowledgeArtifactWithVisualizations,
  type KnowledgeVisualizationValidationError,
  type KnowledgeVisualizationValidationResult,
  type KnowledgeVisualizationRegistryValidationResult,
  type KnowledgeVisualizationInputValidationResult,
  type KnowledgeVisualizationTraceValidationResult,
  type KnowledgeArtifactWithVisualizationsValidationResult,
} from './KnowledgeAgentContract.ts';

// ============================================================================
// D10-OPT-08 — VISUALIZATION KERNEL — Deterministic composition functions
// ============================================================================

export {
  composeKnowledgeVisualizationProvenance,
  composeKnowledgeVisualizationTrace,
  composeKnowledgeVisualizationProfile,
  composeKnowledgeVisualizationRelationship,
  composeKnowledgeVisualizationRegistry,
  composeKnowledgeVisualizationRegistryFromInput,
  composeKnowledgeVisualizations,
  composeKnowledgeArtifactWithVisualizations,
  isSupportedVisualizationType,
  isSupportedVisualizationObjective,
  isSupportedVisualizationComplexity,
  isSupportedVisualizationVisibility,
  isSupportedVisualizationStatus,
  isSupportedVisualizationGovernance,
  getCanonicalVisualizationTypes,
  getCanonicalVisualizationObjectives,
  getCanonicalVisualizationComplexities,
  getCanonicalVisualizationVisibility,
  getCanonicalVisualizationStatuses,
} from './KnowledgeVisualizationKernel.ts';

// ============================================================================
// D10-OPT-08 — VISUALIZATION VALIDATION — Deterministic validation
// ============================================================================

export {
  VISUALIZATION_VALIDATION_CODES,
  validateKnowledgeVisualizationProfile,
  validateKnowledgeVisualizationRelationship,
  validateKnowledgeVisualizationRegistry,
  validateKnowledgeVisualizationInput,
  validateKnowledgeVisualizationTrace,
  validateKnowledgeArtifactWithVisualizations,
} from './KnowledgeVisualizationValidation.ts';

// ============================================================================
// D10-OPT-09 — LABORATORY CONTRACTS — Domain types and constants
// ============================================================================

export {
  CANONICAL_LABORATORY_TYPES,
  CANONICAL_LABORATORY_OBJECTIVES,
  CANONICAL_LABORATORY_COMPLEXITY,
  CANONICAL_LABORATORY_STATUS,
  CANONICAL_LABORATORY_VISIBILITY,
  CANONICAL_LABORATORY_GOVERNANCE,
  type LaboratoryType,
  type LaboratoryObjective,
  type LaboratoryComplexity,
  type LaboratoryStatus,
  type LaboratoryVisibility,
  type LaboratoryGovernance,
  type KnowledgeLaboratoryProvenance,
  type KnowledgeLaboratoryDecision,
  type KnowledgeLaboratoryTrace,
  type KnowledgeLaboratoryProfile,
  type KnowledgeLaboratoryRelationship,
  type KnowledgeLaboratoryRegistryMetadata,
  type KnowledgeLaboratoryRegistry,
  type KnowledgeLaboratoryInput,
  type KnowledgeArtifactWithLaboratories,
  type KnowledgeLaboratoryValidationError,
  type KnowledgeLaboratoryValidationResult,
  type KnowledgeLaboratoryRegistryValidationResult,
  type KnowledgeLaboratoryInputValidationResult,
  type KnowledgeLaboratoryTraceValidationResult,
  type KnowledgeArtifactWithLaboratoriesValidationResult,
} from './KnowledgeAgentContract.ts';

// ============================================================================
// D10-OPT-09 — LABORATORY KERNEL — Deterministic composition functions
// ============================================================================

export {
  composeKnowledgeLaboratoryProvenance,
  composeKnowledgeLaboratoryTrace,
  composeKnowledgeLaboratoryProfile,
  composeKnowledgeLaboratoryRelationship,
  composeKnowledgeLaboratoryRegistry,
  composeKnowledgeLaboratoryRegistryFromInput,
  composeKnowledgeLaboratories,
  composeKnowledgeArtifactWithLaboratories,
  isSupportedLaboratoryType,
  isSupportedLaboratoryObjective,
  isSupportedLaboratoryComplexity,
  isSupportedLaboratoryVisibility,
  isSupportedLaboratoryStatus,
  isSupportedLaboratoryGovernance,
  getCanonicalLaboratoryTypes,
  getCanonicalLaboratoryObjectives,
  getCanonicalLaboratoryComplexities,
  getCanonicalLaboratoryVisibility,
  getCanonicalLaboratoryStatuses,
} from './KnowledgeLaboratoryKernel.ts';

// ============================================================================
// D10-OPT-09 — LABORATORY VALIDATION — Deterministic validation
// ============================================================================

export {
  LABORATORY_VALIDATION_CODES,
  validateKnowledgeLaboratoryProfile,
  validateKnowledgeLaboratoryRelationship,
  validateKnowledgeLaboratoryRegistry,
  validateKnowledgeLaboratoryInput,
  validateKnowledgeLaboratoryTrace,
  validateKnowledgeArtifactWithLaboratories,
} from './KnowledgeLaboratoryValidation.ts';

// ============================================================================
// D10-OPT-10 — RESEARCH CONTRACTS — Domain types and constants
// ============================================================================

export {
  CANONICAL_RESEARCH_SOURCE_TYPES,
  CANONICAL_EVIDENCE_LEVELS,
  CANONICAL_CITATION_TYPES,
  CANONICAL_RESEARCH_STATUS,
  CANONICAL_RESEARCH_VISIBILITY,
  CANONICAL_RESEARCH_GOVERNANCE,
  type ResearchSourceType,
  type EvidenceLevel,
  type CitationType,
  type ResearchStatus,
  type ResearchVisibility,
  type ResearchGovernance,
  type KnowledgeResearchProvenance,
  type KnowledgeResearchDecision,
  type KnowledgeResearchTrace,
  type KnowledgeResearchProfile,
  type KnowledgeResearchRelationship,
  type KnowledgeResearchRegistryMetadata,
  type KnowledgeResearchRegistry,
  type KnowledgeResearchInput,
  type KnowledgeArtifactWithResearch,
  type KnowledgeResearchValidationError,
  type KnowledgeResearchValidationResult,
  type KnowledgeResearchRegistryValidationResult,
  type KnowledgeResearchInputValidationResult,
  type KnowledgeResearchTraceValidationResult,
  type KnowledgeArtifactWithResearchValidationResult,
} from './KnowledgeAgentContract.ts';

// ============================================================================
// D10-OPT-10 — RESEARCH KERNEL — Deterministic composition functions
// ============================================================================

export {
  composeKnowledgeResearchProvenance,
  composeKnowledgeResearchTrace,
  composeKnowledgeResearchProfile,
  composeKnowledgeResearchRelationship,
  composeKnowledgeResearchRegistry,
  composeKnowledgeResearchRegistryFromInput,
  composeKnowledgeResearch,
  composeKnowledgeArtifactWithResearch,
  isSupportedResearchSourceType,
  isSupportedEvidenceLevel,
  isSupportedCitationType,
  isSupportedResearchVisibility,
  isSupportedResearchStatus,
  isSupportedResearchGovernance,
  getCanonicalResearchSourceTypes,
  getCanonicalEvidenceLevels,
  getCanonicalCitationTypes,
  getCanonicalResearchVisibility,
  getCanonicalResearchStatuses,
} from './KnowledgeResearchKernel.ts';

// ============================================================================
// D10-OPT-10 — RESEARCH VALIDATION — Deterministic validation
// ============================================================================

export {
  RESEARCH_VALIDATION_CODES,
  validateKnowledgeResearchProfile,
  validateKnowledgeResearchRelationship,
  validateKnowledgeResearchRegistry,
  validateKnowledgeResearchInput,
  validateKnowledgeResearchTrace,
  validateKnowledgeArtifactWithResearch,
} from './KnowledgeResearchValidation.ts';

// ============================================================================
// D10-OPT-11 — APPLICATION CONTRACTS — Domain types and constants
// ============================================================================

export {
  CANONICAL_APPLICATION_TYPES,
  CANONICAL_APPLICATION_OBJECTIVES,
  CANONICAL_APPLICATION_DOMAINS,
  CANONICAL_APPLICATION_STATUS,
  CANONICAL_APPLICATION_VISIBILITY,
  CANONICAL_APPLICATION_GOVERNANCE,
  type ApplicationType,
  type ApplicationObjective,
  type ApplicationDomain,
  type ApplicationStatus,
  type ApplicationVisibility,
  type ApplicationGovernance,
  type KnowledgeApplicationProvenance,
  type KnowledgeApplicationDecision,
  type KnowledgeApplicationTrace,
  type KnowledgeApplicationProfile,
  type KnowledgeApplicationRelationship,
  type KnowledgeApplicationRegistryMetadata,
  type KnowledgeApplicationRegistry,
  type KnowledgeApplicationInput,
  type KnowledgeArtifactWithApplications,
  type KnowledgeApplicationValidationError,
  type KnowledgeApplicationValidationResult,
  type KnowledgeApplicationRegistryValidationResult,
  type KnowledgeApplicationInputValidationResult,
  type KnowledgeApplicationTraceValidationResult,
  type KnowledgeArtifactWithApplicationsValidationResult,
} from './KnowledgeAgentContract.ts';

// ============================================================================
// D10-OPT-11 — APPLICATION KERNEL — Deterministic composition functions
// ============================================================================

export {
  composeKnowledgeApplicationProvenance,
  composeKnowledgeApplicationTrace,
  composeKnowledgeApplicationProfile,
  composeKnowledgeApplicationRelationship,
  composeKnowledgeApplicationRegistry,
  composeKnowledgeApplicationRegistryFromInput,
  composeKnowledgeApplications,
  composeKnowledgeArtifactWithApplications,
  isSupportedApplicationType,
  isSupportedApplicationObjective,
  isSupportedApplicationDomain,
  isSupportedApplicationVisibility,
  isSupportedApplicationStatus,
  isSupportedApplicationGovernance,
  getCanonicalApplicationTypes,
  getCanonicalApplicationObjectives,
  getCanonicalApplicationDomains,
  getCanonicalApplicationVisibility,
  getCanonicalApplicationStatuses,
} from './KnowledgeApplicationKernel.ts';

// ============================================================================
// D10-OPT-11 — APPLICATION VALIDATION — Deterministic validation
// ============================================================================

export {
  APPLICATION_VALIDATION_CODES,
  validateKnowledgeApplicationProfile,
  validateKnowledgeApplicationRelationship,
  validateKnowledgeApplicationRegistry,
  validateKnowledgeApplicationInput,
  validateKnowledgeApplicationTrace,
  validateKnowledgeArtifactWithApplications,
} from './KnowledgeApplicationValidation.ts';

// ============================================================================
// D10-OPT-12 — ASSESSMENT CONTRACTS — Domain types and constants
// ============================================================================

export {
  CANONICAL_ASSESSMENT_TYPES,
  CANONICAL_ASSESSMENT_OBJECTIVES,
  CANONICAL_ASSESSMENT_DIFFICULTY,
  CANONICAL_ASSESSMENT_STATUS,
  CANONICAL_ASSESSMENT_VISIBILITY,
  CANONICAL_ASSESSMENT_GOVERNANCE,
  type AssessmentType,
  type AssessmentObjective,
  type AssessmentDifficulty,
  type AssessmentStatus,
  type AssessmentVisibility,
  type AssessmentGovernance,
  type KnowledgeAssessmentProvenance,
  type KnowledgeAssessmentDecision,
  type KnowledgeAssessmentTrace,
  type KnowledgeAssessmentProfile,
  type KnowledgeAssessmentRelationship,
  type KnowledgeAssessmentRegistryMetadata,
  type KnowledgeAssessmentRegistry,
  type KnowledgeAssessmentInput,
  type KnowledgeArtifactWithAssessments,
  type KnowledgeAssessmentValidationError,
  type KnowledgeAssessmentValidationResult,
  type KnowledgeAssessmentRegistryValidationResult,
  type KnowledgeAssessmentInputValidationResult,
  type KnowledgeAssessmentTraceValidationResult,
  type KnowledgeArtifactWithAssessmentsValidationResult,
} from './KnowledgeAgentContract.ts';

// ============================================================================
// D10-OPT-12 — ASSESSMENT KERNEL — Deterministic composition functions
// ============================================================================

export {
  composeKnowledgeAssessmentProvenance,
  composeKnowledgeAssessmentTrace,
  composeKnowledgeAssessmentProfile,
  composeKnowledgeAssessmentRelationship,
  composeKnowledgeAssessmentRegistry,
  composeKnowledgeAssessmentRegistryFromInput,
  composeKnowledgeAssessments,
  composeKnowledgeArtifactWithAssessments,
  isSupportedAssessmentType,
  isSupportedAssessmentObjective,
  isSupportedAssessmentDifficulty,
  isSupportedAssessmentVisibility,
  isSupportedAssessmentStatus,
  isSupportedAssessmentGovernance,
  getCanonicalAssessmentTypes,
  getCanonicalAssessmentObjectives,
  getCanonicalAssessmentDifficulties,
  getCanonicalAssessmentVisibility,
  getCanonicalAssessmentStatuses,
} from './KnowledgeAssessmentKernel.ts';

// ============================================================================
// D10-OPT-12 — ASSESSMENT VALIDATION — Deterministic validation
// ============================================================================

export {
  ASSESSMENT_VALIDATION_CODES,
  validateKnowledgeAssessmentProfile,
  validateKnowledgeAssessmentRelationship,
  validateKnowledgeAssessmentRegistry,
  validateKnowledgeAssessmentInput,
  validateKnowledgeAssessmentTrace,
  validateKnowledgeArtifactWithAssessments,
} from './KnowledgeAssessmentValidation.ts';

// ============================================================================
// D10-OPT-13 — MISCONCEPTION CONTRACTS — Domain types and constants
// ============================================================================

export {
  CANONICAL_MISCONCEPTION_TYPES,
  CANONICAL_MISCONCEPTION_SEVERITY,
  CANONICAL_CORRECTIVE_STRATEGIES,
  CANONICAL_MISCONCEPTION_STATUS,
  CANONICAL_MISCONCEPTION_VISIBILITY,
  CANONICAL_MISCONCEPTION_GOVERNANCE,
  type MisconceptionType,
  type MisconceptionSeverity,
  type CorrectiveStrategy,
  type MisconceptionStatus,
  type MisconceptionVisibility,
  type MisconceptionGovernance,
  type KnowledgeMisconceptionProvenance,
  type KnowledgeMisconceptionDecision,
  type KnowledgeMisconceptionTrace,
  type KnowledgeMisconceptionProfile,
  type KnowledgeMisconceptionRelationship,
  type KnowledgeMisconceptionRegistryMetadata,
  type KnowledgeMisconceptionRegistry,
  type KnowledgeMisconceptionInput,
  type KnowledgeArtifactWithMisconceptions,
  type KnowledgeMisconceptionValidationError,
  type KnowledgeMisconceptionValidationResult,
  type KnowledgeMisconceptionRegistryValidationResult,
  type KnowledgeMisconceptionInputValidationResult,
  type KnowledgeMisconceptionTraceValidationResult,
  type KnowledgeArtifactWithMisconceptionsValidationResult,
} from './KnowledgeAgentContract.ts';

// ============================================================================
// D10-OPT-13 — MISCONCEPTION KERNEL — Deterministic composition functions
// ============================================================================

export {
  composeKnowledgeMisconceptionProvenance,
  composeKnowledgeMisconceptionTrace,
  composeKnowledgeMisconceptionProfile,
  composeKnowledgeMisconceptionRelationship,
  composeKnowledgeMisconceptionRegistry,
  composeKnowledgeMisconceptionRegistryFromInput,
  composeKnowledgeMisconceptions,
  composeKnowledgeArtifactWithMisconceptions,
  isSupportedMisconceptionType,
  isSupportedMisconceptionSeverity,
  isSupportedCorrectiveStrategy,
  isSupportedMisconceptionVisibility,
  isSupportedMisconceptionStatus,
  isSupportedMisconceptionGovernance,
  getCanonicalMisconceptionTypes,
  getCanonicalMisconceptionSeverities,
  getCanonicalCorrectiveStrategies,
  getCanonicalMisconceptionVisibility,
  getCanonicalMisconceptionStatuses,
} from './KnowledgeMisconceptionKernel.ts';

// ============================================================================
// D10-OPT-13 — MISCONCEPTION VALIDATION — Deterministic validation
// ============================================================================

export {
  MISCONCEPTION_VALIDATION_CODES,
  validateKnowledgeMisconceptionProfile,
  validateKnowledgeMisconceptionRelationship,
  validateKnowledgeMisconceptionRegistry,
  validateKnowledgeMisconceptionInput,
  validateKnowledgeMisconceptionTrace,
  validateKnowledgeArtifactWithMisconceptions,
} from './KnowledgeMisconceptionValidation.ts';

// ============================================================================
// D10-OPT-14 — CONNECTIVITY CONTRACTS — Domain types and constants
// ============================================================================

export {
  CANONICAL_CONNECTIVITY_TYPES,
  CANONICAL_CONNECTIVITY_STRENGTH,
  CANONICAL_CONNECTIVITY_SCOPE,
  CANONICAL_CONNECTIVITY_STATUS,
  CANONICAL_CONNECTIVITY_VISIBILITY,
  CANONICAL_CONNECTIVITY_GOVERNANCE,
  type ConnectivityType,
  type ConnectivityStrength,
  type ConnectivityScope,
  type ConnectivityStatus,
  type ConnectivityVisibility,
  type ConnectivityGovernance,
  type KnowledgeConnectivityProvenance,
  type KnowledgeConnectivityDecision,
  type KnowledgeConnectivityTrace,
  type KnowledgeConnectivityProfile,
  type KnowledgeConnectivityRelationship,
  type KnowledgeConnectivityRegistryMetadata,
  type KnowledgeConnectivityRegistry,
  type KnowledgeConnectivityInput,
  type KnowledgeArtifactWithConnectivity,
  type KnowledgeConnectivityValidationError,
  type KnowledgeConnectivityValidationResult,
  type KnowledgeConnectivityRegistryValidationResult,
  type KnowledgeConnectivityInputValidationResult,
  type KnowledgeConnectivityTraceValidationResult,
  type KnowledgeArtifactWithConnectivityValidationResult,
} from './KnowledgeAgentContract.ts';

// ============================================================================
// D10-OPT-14 — CONNECTIVITY KERNEL — Deterministic composition functions
// ============================================================================

export {
  composeKnowledgeConnectivityProvenance,
  composeKnowledgeConnectivityTrace,
  composeKnowledgeConnectivityProfile,
  composeKnowledgeConnectivityRelationship,
  composeKnowledgeConnectivityRegistry,
  composeKnowledgeConnectivityRegistryFromInput,
  composeKnowledgeConnectivity,
  composeKnowledgeArtifactWithConnectivity,
  isSupportedConnectivityType,
  isSupportedConnectivityStrength,
  isSupportedConnectivityScope,
  isSupportedConnectivityVisibility,
  isSupportedConnectivityStatus,
  isSupportedConnectivityGovernance,
  getCanonicalConnectivityTypes,
  getCanonicalConnectivityStrengths,
  getCanonicalConnectivityScopes,
  getCanonicalConnectivityVisibility,
  getCanonicalConnectivityStatuses,
} from './KnowledgeConnectivityKernel.ts';

// ============================================================================
// D10-OPT-14 — CONNECTIVITY VALIDATION — Deterministic validation
// ============================================================================

export {
  CONNECTIVITY_VALIDATION_CODES,
  validateKnowledgeConnectivityProfile,
  validateKnowledgeConnectivityRelationship,
  validateKnowledgeConnectivityRegistry,
  validateKnowledgeConnectivityInput,
  validateKnowledgeConnectivityTrace,
  validateKnowledgeArtifactWithConnectivity,
} from './KnowledgeConnectivityValidation.ts';

// ============================================================================
// D10-OPT-15 — ASSET CONTRACTS — Domain types and constants
// ============================================================================

export {
  CANONICAL_ASSET_TYPES,
  CANONICAL_ASSET_PURPOSES,
  CANONICAL_ASSET_ACCESS,
  CANONICAL_ASSET_STATUS,
  CANONICAL_ASSET_VISIBILITY,
  CANONICAL_ASSET_GOVERNANCE,
  type AssetType,
  type AssetPurpose,
  type AssetAccess,
  type AssetStatus,
  type AssetVisibility,
  type AssetGovernance,
  type KnowledgeAssetProvenance,
  type KnowledgeAssetDecision,
  type KnowledgeAssetTrace,
  type KnowledgeAssetProfile,
  type KnowledgeAssetRelationship,
  type KnowledgeAssetRegistryMetadata,
  type KnowledgeAssetRegistry,
  type KnowledgeAssetInput,
  type KnowledgeArtifactWithAssets,
  type KnowledgeAssetValidationError,
  type KnowledgeAssetValidationResult,
  type KnowledgeAssetRegistryValidationResult,
  type KnowledgeAssetInputValidationResult,
  type KnowledgeAssetTraceValidationResult,
  type KnowledgeArtifactWithAssetsValidationResult,
} from './KnowledgeAgentContract.ts';

// ============================================================================
// D10-OPT-15 — ASSET KERNEL — Deterministic composition functions
// ============================================================================

export {
  composeKnowledgeAssetProvenance,
  composeKnowledgeAssetTrace,
  composeKnowledgeAssetProfile,
  composeKnowledgeAssetRelationship,
  composeKnowledgeAssetRegistry,
  composeKnowledgeAssetRegistryFromInput,
  composeKnowledgeAssets,
  composeKnowledgeArtifactWithAssets,
  isSupportedAssetType,
  isSupportedAssetPurpose,
  isSupportedAssetAccess,
  isSupportedAssetVisibility,
  isSupportedAssetStatus,
  isSupportedAssetGovernance,
  getCanonicalAssetTypes,
  getCanonicalAssetPurposes,
  getCanonicalAssetAccessLevels,
  getCanonicalAssetVisibility,
  getCanonicalAssetStatuses,
} from './KnowledgeAssetKernel.ts';

// ============================================================================
// D10-OPT-15 — ASSET VALIDATION — Deterministic validation
// ============================================================================

export {
  ASSET_VALIDATION_CODES,
  validateKnowledgeAssetProfile,
  validateKnowledgeAssetRelationship,
  validateKnowledgeAssetRegistry,
  validateKnowledgeAssetInput,
  validateKnowledgeAssetTrace,
  validateKnowledgeArtifactWithAssets,
} from './KnowledgeAssetValidation.ts';

// ============================================================================
// D10-OPT-16 — GOVERNANCE CONTRACTS — Domain types and constants
// ============================================================================

export {
  CANONICAL_GOVERNANCE_STAGES,
  CANONICAL_GOVERNANCE_EVENTS,
  CANONICAL_REVIEW_LEVELS,
  CANONICAL_GOVERNANCE_STATUS,
  CANONICAL_GOVERNANCE_VISIBILITY,
  CANONICAL_GOVERNANCE_POLICY,
  type GovernanceStage,
  type GovernanceEvent,
  type ReviewLevel,
  type GovernanceStatus,
  type GovernanceVisibility,
  type GovernancePolicy,
  type KnowledgeGovernanceProvenance,
  type KnowledgeGovernanceDecision,
  type KnowledgeGovernanceTrace,
  type KnowledgeGovernanceProfile,
  type KnowledgeGovernanceRelationship,
  type KnowledgeGovernanceRegistryMetadata,
  type KnowledgeGovernanceRegistry,
  type KnowledgeGovernanceInput,
  type KnowledgeArtifactWithGovernance,
  type KnowledgeGovernanceValidationError,
  type KnowledgeGovernanceValidationResult,
  type KnowledgeGovernanceRegistryValidationResult,
  type KnowledgeGovernanceInputValidationResult,
  type KnowledgeGovernanceTraceValidationResult,
  type KnowledgeArtifactWithGovernanceValidationResult,
} from './KnowledgeAgentContract.ts';

// ============================================================================
// D10-OPT-16 — GOVERNANCE KERNEL — Deterministic composition functions
// ============================================================================

export {
  composeKnowledgeGovernanceProvenance,
  composeKnowledgeGovernanceTrace,
  composeKnowledgeGovernanceProfile,
  composeKnowledgeGovernanceRelationship,
  composeKnowledgeGovernanceRegistry,
  composeKnowledgeGovernanceRegistryFromInput,
  composeKnowledgeGovernance,
  composeKnowledgeArtifactWithGovernance,
  isSupportedGovernanceStage,
  isSupportedGovernanceEvent,
  isSupportedReviewLevel,
  isSupportedGovernanceVisibility,
  isSupportedGovernanceStatus,
  isSupportedGovernancePolicy,
  getCanonicalGovernanceStages,
  getCanonicalGovernanceEvents,
  getCanonicalReviewLevels,
  getCanonicalGovernanceVisibility,
  getCanonicalGovernanceStatuses,
} from './KnowledgeGovernanceKernel.ts';

// ============================================================================
// D10-OPT-16 — GOVERNANCE VALIDATION — Deterministic validation
// ============================================================================

export {
  GOVERNANCE_VALIDATION_CODES,
  validateKnowledgeGovernanceProfile,
  validateKnowledgeGovernanceRelationship,
  validateKnowledgeGovernanceRegistry,
  validateKnowledgeGovernanceInput,
  validateKnowledgeGovernanceTrace,
  validateKnowledgeArtifactWithGovernance,
} from './KnowledgeGovernanceValidation.ts';

// ============================================================================
// D10-OPT-17 — CERTIFICATION CONTRACTS — Domain types and constants
// ============================================================================

export {
  CANONICAL_KNOWLEDGE_CERTIFICATION_STATUS,
  CANONICAL_KNOWLEDGE_FINDING_SEVERITY,
  CANONICAL_KNOWLEDGE_QUALITY_DIMENSIONS,
  type KnowledgeCertificationStatus,
  type KnowledgeFindingSeverity,
  type KnowledgeQualityDimension,
  type KnowledgeCertificationFinding,
  type KnowledgeCertificationTrace,
  type KnowledgeCertificationMetadata,
  type KnowledgeCertificationReport,
  type KnowledgeCertificationValidationError,
  type KnowledgeCertificationValidationResult,
  type KnowledgeCertificationFindingValidationResult,
  type KnowledgeCertificationStatusValidationResult,
  type KnowledgeCertificationScoreValidationResult,
} from './KnowledgeAgentContract.ts';

// ============================================================================
// D10-OPT-17 — CERTIFICATION ENGINE — Deterministic certification functions
// ============================================================================

export {
  composeKnowledgeCertificationFinding,
  composeKnowledgeCertificationTrace,
  composeKnowledgeCertificationMetadata,
  composeKnowledgeCertificationReport,
  calculateKnowledgeCertificationScore,
  determineKnowledgeCertificationStatus,
  isKnowledgeCertificationSuccessful,
  certifyKnowledgeArtifact,
  validateKnowledgeCertification,
  isSupportedKnowledgeCertificationStatus,
  isSupportedKnowledgeFindingSeverity,
  isSupportedKnowledgeQualityDimension,
  getCanonicalKnowledgeCertificationStatuses,
  getCanonicalKnowledgeFindingSeverities,
  getCanonicalKnowledgeQualityDimensions,
} from './KnowledgeCertificationEngine.ts';

// ============================================================================
// D10-OPT-17 — CERTIFICATION VALIDATION — Deterministic validation
// ============================================================================

export {
  KNOWLEDGE_CERTIFICATION_VALIDATION_CODES,
  validateKnowledgeCertificationFinding,
  validateKnowledgeCertificationStatus,
  validateKnowledgeCertificationScore,
  validateKnowledgeCertificationReport,
} from './KnowledgeCertificationValidation.ts';

// ============================================================================
// D10-OPT-18 — FACADE CONTRACTS — Domain types and constants
// ============================================================================

export {
  CANONICAL_KNOWLEDGE_FACADE_STATUS,
  type KnowledgeFacadeStatus,
  type KnowledgeFacadeTraceMetadata,
  type KnowledgeFacadeValidationResult,
  type KnowledgeFacadeArtifactResult,
  type KnowledgeFacadeCertificationResult,
  type KnowledgeFacadeCompleteResult,
  type KnowledgeFacadeValidationError,
  type KnowledgeFacadeEntryValidationResult,
} from './KnowledgeAgentContract.ts';

// ============================================================================
// D10-OPT-18 — FACADE — Public API Facade
// ============================================================================

export {
  composeKnowledgeArtifact,
  certifyKnowledgeFacadeArtifact,
  composeAndCertifyKnowledgeArtifact,
  validateKnowledgeFacadeArtifact,
  validateKnowledgeFacadeCertification,
  validateKnowledgeFacadeComplete,
  isSupportedKnowledgeFacadeStatus,
  getCanonicalKnowledgeFacadeStatuses,
} from './KnowledgePipelineFacade.ts';

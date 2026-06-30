/**
 * NV-1300-D1-OPT-01 through D1-OPT-09 — Didactic Pipeline Kernel
 *
 * Public API for the deterministic lesson pipeline.
 * Organized into: contracts, base composer, orchestrators,
 * validators, certification, facade, and legacy aliases.
 */

// ============================================================================
// CONTRACTS — Domain types and constants
// ============================================================================

export {
  CANONICAL_PIPELINE_STAGES,
  type DidacticPipelineStageName,
  type DidacticStageStatus,
  type DidacticStageOmissionReason,
  type DidacticPipelineStage,
  type DidacticResourceRef,
  type DidacticLessonInput,
  type DidacticInputMetadata,
  type DidacticTraceMetadata,
  type DidacticLessonPlan,
  type DidacticValidationError,
  type DidacticValidationResult,
} from './DidacticAgentContract.ts';

// D1-OPT-02 — Prerequisite & Dependency Types
export {
  type DidacticConceptReference,
  type DidacticDependencyType,
  type DidacticRequiredDepth,
  type DidacticPrerequisiteReference,
  type DidacticPrerequisiteStatus,
  type DidacticPrerequisiteSupportAction,
  type DidacticPrerequisiteDecision,
  type DidacticDependencyTrace,
  type DidacticDependencyGraph,
  type DidacticLessonInputWithDependencies,
  type DidacticLessonPlanWithDependencies,
} from './DidacticAgentContract.ts';

// D1-OPT-03 — Explanation Style Types
export {
  type DidacticExplanationStyle,
  type DidacticStyleResource,
  type DidacticStyleSelectionRule,
  type DidacticStyleDecision,
  type DidacticStyleSelectionStatus,
  type DidacticStyleTrace,
  type DidacticStyleInput,
  type DidacticLessonInputWithStyles,
  type DidacticLessonPlanWithStyles,
  type DidacticLessonInputFull,
  type DidacticLessonPlanFull,
} from './DidacticAgentContract.ts';

// D1-OPT-04 — Learning Layer Types
export {
  type DidacticLearningLayer,
  type DidacticLearningDepthMode,
  type DidacticLearningLayerResource,
  type DidacticLayerStageMapping,
  type DidacticLearningLayerStatus,
  type DidacticLearningLayerDecision,
  type DidacticLearningLayerTrace,
  type DidacticLayerInput,
  type DidacticLessonInputWithLayers,
  type DidacticLessonPlanWithLayers,
  type DidacticLessonInputComplete,
  type DidacticLessonPlanComplete,
} from './DidacticAgentContract.ts';

// D1-OPT-05 — Laboratory Orchestration Types
export {
  type DidacticLaboratoryIntegrationMode,
  type DidacticLaboratoryResource,
  type DidacticLaboratoryPlacement,
  type DidacticLaboratoryDecision,
  type DidacticLaboratoryStatus,
  type DidacticLaboratoryTrace,
  type DidacticLaboratoryInput,
  type DidacticLessonInputWithLaboratories,
  type DidacticLessonPlanWithLaboratories,
  type DidacticLessonInputAll,
  type DidacticLessonPlanAll,
} from './DidacticAgentContract.ts';

// D1-OPT-06 — Assessment Orchestration Types
export {
  type DidacticAssessmentCheckpointType,
  type DidacticAssessmentResource,
  type DidacticAssessmentPlacement,
  type DidacticAssessmentDecision,
  type DidacticAssessmentStatus,
  type DidacticAssessmentTrace,
  type DidacticAssessmentInput,
  type DidacticLessonInputWithAssessments,
  type DidacticLessonPlanWithAssessments,
  type DidacticLessonInputFinal,
  type DidacticLessonPlanFinal,
} from './DidacticAgentContract.ts';

// D1-OPT-07 — Misconception & Cognitive Load Orchestration Types
export {
  type DidacticMisconceptionSupportType,
  type DidacticCognitiveLoadSupportType,
  type DidacticMisconceptionResource,
  type DidacticCognitiveLoadResource,
  type DidacticSupportPlacement,
  type DidacticSupportDecision,
  type DidacticSupportStatus,
  type DidacticSupportTrace,
  type DidacticSupportInput,
  type DidacticLessonInputWithSupports,
  type DidacticLessonPlanWithSupports,
  type DidacticLessonInputComplete2,
  type DidacticLessonPlanComplete2,
} from './DidacticAgentContract.ts';

// D1-OPT-08 — Certification Types
export {
  type DidacticCompositionCertificationStatus,
  type DidacticCompositionFindingSeverity,
  type DidacticCompositionFinding,
  type DidacticCompositionQualityDimension,
  type DidacticCompositionCertificationReport,
  type DidacticCompositionCertificationInput,
} from './DidacticAgentContract.ts';

// ============================================================================
// BASE COMPOSER — Core pipeline composition
// ============================================================================

export {
  composeLessonPlan,
} from './PipelineComposer.ts';

// ============================================================================
// ORCHESTRATORS — Individual orchestration modules
// ============================================================================

// Stage Inclusion Logic
export {
  determineStageStatus,
  buildAllStageStatuses,
  STAGE_RESOURCE_RULES,
} from './StageInclusionLogic.ts';

// D1-OPT-02 — Prerequisite Analyzer
export {
  analyzePrerequisites,
  buildDependencyTrace,
  validatePrerequisiteReference,
  validateDependencyGraph,
  VALID_DEPENDENCY_TYPES,
  VALID_REQUIRED_DEPTHS,
} from './PrerequisiteAnalyzer.ts';

// D1-OPT-03 — Explanation Style Selector
export {
  selectExplanationStyles,
  buildStyleTrace,
  validateStyleResource,
  validateStyleDecision,
  getApplicableStages,
  VALID_EXPLANATION_STYLES,
  DEFAULT_STYLE_PRIORITY,
} from './ExplanationStyleSelector.ts';

// D1-OPT-04 — Learning Layer Orchestrator
export {
  orchestrateLearningLayers,
  buildLayerTrace,
  validateLearningLayerResource,
  validateLearningLayerDecision,
  getCanonicalLearningLayers,
  getDefaultLayerStageMappings,
  VALID_LEARNING_LAYERS,
  VALID_DEPTH_MODES,
  DEPTH_MODE_LAYER_COUNT,
} from './LearningLayerOrchestrator.ts';

// D1-OPT-05 — Laboratory Orchestrator
export {
  orchestrateLaboratories,
  buildLabTrace,
  validateLaboratoryResource,
  validateLaboratoryDecision,
  VALID_INTEGRATION_MODES,
  INTEGRATION_MODE_STAGE_MAP,
  INTEGRATION_MODE_RATIONALE,
} from './LaboratoryOrchestrator.ts';

// D1-OPT-06 — Assessment Orchestrator
export {
  orchestrateAssessmentCheckpoints,
  buildAssessmentTrace,
  validateAssessmentResource,
  validateAssessmentDecision,
  VALID_CHECKPOINT_TYPES,
  CHECKPOINT_TYPE_STAGE_MAP,
  CHECKPOINT_TYPE_RATIONALE,
} from './AssessmentOrchestrator.ts';

// D1-OPT-07 — Instructional Support Orchestrator
export {
  orchestrateInstructionalSupports,
  buildSupportTrace,
  validateMisconceptionResource,
  validateCognitiveLoadResource,
  validateSupportDecision,
  VALID_MISCONCEPTION_TYPES,
  VALID_COGNITIVE_LOAD_TYPES,
  MISCONCEPTION_TYPE_STAGE_MAP,
  COGNITIVE_LOAD_TYPE_STAGE_MAP,
  MISCONCEPTION_RATIONALE,
  COGNITIVE_LOAD_RATIONALE,
} from './InstructionalSupportOrchestrator.ts';

// ============================================================================
// VALIDATORS — Validation layer
// ============================================================================

export {
  validateLessonPlan,
  validateLessonPlanWithDependencies,
  validateLessonPlanWithStyles,
  validateLessonPlanFull,
  validateLessonPlanComplete,
  validateLessonPlanAll,
  validateLessonPlanFinal,
  validateLessonPlanComplete2,
  validateCertificationReport,
  validateFacadeLessonPlanOutput,
  validateFacadeCertificationOutput,
  validateFacadeCompleteOutput,
} from './ValidationLayer.ts';

// ============================================================================
// CERTIFICATION — Composition quality gate
// ============================================================================

export {
  certifyDidacticComposition,
  validateCertificationReport as validateCertificationReportFromEngine,
  VALID_CERTIFICATION_STATUSES,
  VALID_FINDING_SEVERITIES,
  VALID_QUALITY_DIMENSIONS,
  ALL_QUALITY_DIMENSIONS,
} from './CompositionCertificationEngine.ts';

// ============================================================================
// FACADE — Canonical public API (D1-OPT-09)
// ============================================================================

export {
  composeDidacticLessonPlan,
  certifyDidacticLessonPlan,
  composeAndCertifyDidacticLessonPlan,
  type DidacticFacadeLessonPlanOutput,
  type DidacticFacadeCertificationOutput,
  type DidacticFacadeCompleteOutput,
  type DidacticFacadeTraceMetadata,
} from './DidacticPipelineFacade.ts';

// ============================================================================
// LEGACY ALIASES — Backward-compatible composer functions
//
// These aliases preserve backward compatibility with D1-OPT-01 through D1-OPT-07.
// New code should prefer the canonical facade entrypoints above.
// ============================================================================

export {
  composeLessonPlanWithDependencies,
  composeLessonPlanWithStyles,
  composeLessonPlanFull,
  composeLessonPlanComplete,
  composeLessonPlanAll,
  composeLessonPlanFinal,
  composeLessonPlanComplete2,
} from './PipelineComposer.ts';

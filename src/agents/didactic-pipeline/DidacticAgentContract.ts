/**
 * NV-1300-D1-OPT-01 — Didactic Agent Domain Contract
 *
 * Stable internal data model for the Didactic Agent Pipeline Kernel.
 * Defines all types required for deterministic lesson plan generation.
 *
 * This module is purely structural. It contains no runtime logic,
 * no mutable state, no external dependencies, and no probabilistic behavior.
 */

// ---------------------------------------------------------------------------
// Canonical Pipeline Stages (fixed, ordered)
// ---------------------------------------------------------------------------

export const CANONICAL_PIPELINE_STAGES = [
  'motivation',
  'context',
  'intuition',
  'concept_introduction',
  'guided_explanation',
  'visual_demonstration',
  'mathematical_foundation',
  'practical_example',
  'interactive_laboratory',
  'common_misconceptions',
  'assessment',
  'summary',
  'forward_connections',
] as const;

export type DidacticPipelineStageName = (typeof CANONICAL_PIPELINE_STAGES)[number];

// ---------------------------------------------------------------------------
// Stage Status
// ---------------------------------------------------------------------------

export type DidacticStageStatus = 'included' | 'omitted' | 'blocked' | 'invalid';

// ---------------------------------------------------------------------------
// Stage Omission Reason
// ---------------------------------------------------------------------------

export interface DidacticStageOmissionReason {
  readonly stageId: DidacticPipelineStageName;
  readonly reason: string;
  readonly severity: 'info' | 'warning' | 'error';
}

// ---------------------------------------------------------------------------
// Pipeline Stage (individual stage in a lesson plan)
// ---------------------------------------------------------------------------

export interface DidacticPipelineStage {
  readonly stageId: DidacticPipelineStageName;
  readonly order: number;
  readonly status: DidacticStageStatus;
  readonly label: string;
  readonly description: string;
  readonly omissionReason: DidacticStageOmissionReason | null;
  readonly resourceRef: DidacticResourceRef | null;
}

// ---------------------------------------------------------------------------
// Resource Reference (pointer to a governed educational resource)
// ---------------------------------------------------------------------------

export interface DidacticResourceRef {
  readonly resourceId: string;
  readonly resourceType: 'concept' | 'visualization' | 'laboratory' | 'artifact' | 'shared_knowledge';
  readonly source: string;
}

// ---------------------------------------------------------------------------
// Lesson Input (governed resources consumed by the pipeline)
// ---------------------------------------------------------------------------

export interface DidacticLessonInput {
  readonly topic: string;
  readonly conceptIds: readonly string[];
  readonly difficulty: 'essentials' | 'standard' | 'deep_dive' | 'research_notes';
  readonly availableResources: {
    readonly concepts: readonly DidacticResourceRef[];
    readonly visualizations: readonly DidacticResourceRef[];
    readonly laboratories: readonly DidacticResourceRef[];
    readonly artifacts: readonly DidacticResourceRef[];
    readonly sharedKnowledge: readonly DidacticResourceRef[];
  };
  readonly metadata?: DidacticInputMetadata;
}

export interface DidacticInputMetadata {
  readonly sourceQuery?: string;
  readonly intent?: string;
  readonly perspective?: string;
  readonly providedAt?: string;
}

// ---------------------------------------------------------------------------
// Trace Metadata (governance review trail)
// ---------------------------------------------------------------------------

export interface DidacticTraceMetadata {
  readonly planId: string;
  readonly topic: string;
  readonly difficulty: string;
  readonly totalStages: number;
  readonly includedStages: number;
  readonly omittedStages: number;
  readonly blockedStages: number;
  readonly invalidStages: number;
  readonly generatedFrom: 'deterministic_pipeline';
  readonly deterministic: true;
  readonly curriculumMutated: false;
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Lesson Plan (output of the pipeline composer)
// ---------------------------------------------------------------------------

export interface DidacticLessonPlan {
  readonly id: string;
  readonly topic: string;
  readonly difficulty: string;
  readonly stages: readonly DidacticPipelineStage[];
  readonly trace: DidacticTraceMetadata;
  readonly validation: DidacticValidationResult;
}

// ---------------------------------------------------------------------------
// Validation Result
// ---------------------------------------------------------------------------

export interface DidacticValidationError {
  readonly code: string;
  readonly message: string;
  readonly stageId?: DidacticPipelineStageName;
}

export interface DidacticValidationResult {
  readonly valid: boolean;
  readonly errors: readonly DidacticValidationError[];
  readonly checkedAt: 'plan_generation';
}

// ---------------------------------------------------------------------------
// D1-OPT-02 — Semantic Dependency & Prerequisite Orchestration Types
// ---------------------------------------------------------------------------

// --- Concept Reference ---

export interface DidacticConceptReference {
  readonly conceptId: string;
  readonly label: string;
  readonly source: string;
  readonly lifecycle: 'active' | 'deprecated' | 'experimental';
}

// --- Prerequisite Reference ---

export type DidacticDependencyType =
  | 'required'
  | 'recommended'
  | 'optional_background'
  | 'enrichment'
  | 'co_requisite';

export type DidacticRequiredDepth =
  | 'awareness'
  | 'basic_understanding'
  | 'working_knowledge'
  | 'advanced_understanding'
  | 'mastery';

export interface DidacticPrerequisiteReference {
  readonly conceptId: string;
  readonly label: string;
  readonly dependencyType: DidacticDependencyType;
  readonly requiredDepth: DidacticRequiredDepth;
  readonly rationale: string;
  readonly source: string;
}

// --- Prerequisite Status ---

export type DidacticPrerequisiteStatus = 'known' | 'missing' | 'unknown';

// --- Prerequisite Support Action ---

export type DidacticPrerequisiteSupportAction =
  | 'none'
  | 'block_or_recap_required'
  | 'insert_recap'
  | 'add_context_note'
  | 'add_forward_connection'
  | 'insert_parallel_context';

// --- Prerequisite Decision (output of analyzer) ---

export interface DidacticPrerequisiteDecision {
  readonly conceptId: string;
  readonly prerequisiteConceptId: string;
  readonly prerequisiteLabel: string;
  readonly dependencyType: DidacticDependencyType;
  readonly requiredDepth: DidacticRequiredDepth;
  readonly status: DidacticPrerequisiteStatus;
  readonly supportAction: DidacticPrerequisiteSupportAction;
  readonly rationale: string;
  readonly source: string;
}

// --- Dependency Trace (attached to lesson plan) ---

export interface DidacticDependencyTrace {
  readonly conceptId: string;
  readonly prerequisitesAnalyzed: number;
  readonly decisions: readonly DidacticPrerequisiteDecision[];
  readonly blockedByMissingRequired: readonly string[];
  readonly recapsInserted: readonly string[];
  readonly contextNotesAdded: readonly string[];
  readonly forwardConnectionsAdded: readonly string[];
  readonly parallelContextsInserted: readonly string[];
}

// --- Extended Lesson Input with dependency graph ---

export interface DidacticDependencyGraph {
  readonly concepts: readonly DidacticConceptReference[];
  readonly prerequisites: readonly DidacticPrerequisiteReference[];
  readonly encounteredList?: readonly string[];
}

export interface DidacticLessonInputWithDependencies extends DidacticLessonInput {
  dependencyGraph?: DidacticDependencyGraph;
}

// --- Extended Lesson Plan with dependency trace ---

export interface DidacticLessonPlanWithDependencies extends DidacticLessonPlan {
  readonly dependencyTrace?: DidacticDependencyTrace;
}

// ---------------------------------------------------------------------------
// D1-OPT-03 — Multi-Style Explanation Orchestration Types
// ---------------------------------------------------------------------------

// --- Explanation Style ---

export type DidacticExplanationStyle =
  | 'intuitive'
  | 'visual'
  | 'mathematical'
  | 'engineering_oriented'
  | 'implementation_first'
  | 'research_oriented'
  | 'historical'
  | 'analogy_driven';

// --- Style Resource (governed style asset) ---

export interface DidacticStyleResource {
  readonly style: DidacticExplanationStyle;
  readonly resourceId: string;
  readonly source: string;
  readonly supportedStages: readonly DidacticPipelineStageName[];
  readonly pedagogicalPurpose: string;
  readonly lifecycle: 'active' | 'deprecated' | 'experimental';
}

// --- Style Selection Rule ---

export interface DidacticStyleSelectionRule {
  readonly style: DidacticExplanationStyle;
  readonly requiredResourceType: string;
  readonly fallbackOmissionReason: string;
}

// --- Style Decision (output of selector) ---

export type DidacticStyleSelectionStatus = 'selected' | 'omitted';

export interface DidacticStyleDecision {
  readonly style: DidacticExplanationStyle;
  readonly status: DidacticStyleSelectionStatus;
  readonly resourceId: string | null;
  readonly source: string;
  readonly supportedStages: readonly DidacticPipelineStageName[];
  readonly pedagogicalPurpose: string;
  readonly omissionReason: string | null;
}

// --- Style Trace (attached to lesson plan) ---

export interface DidacticStyleTrace {
  readonly stylesSelected: number;
  readonly stylesOmitted: number;
  readonly decisions: readonly DidacticStyleDecision[];
  readonly selectedStyles: readonly DidacticExplanationStyle[];
  readonly omittedStyles: readonly DidacticExplanationStyle[];
}

// --- Extended Lesson Input with style resources ---

export interface DidacticStyleInput {
  readonly requestedStyles?: readonly DidacticExplanationStyle[];
  readonly styleResources?: readonly DidacticStyleResource[];
}

export interface DidacticLessonInputWithStyles extends DidacticLessonInput {
  styleInput?: DidacticStyleInput;
}

// --- Extended Lesson Plan with style trace ---

export interface DidacticLessonPlanWithStyles extends DidacticLessonPlan {
  readonly styleTrace?: DidacticStyleTrace;
}

// --- Fully Extended Lesson Input (dependencies + styles) ---

export interface DidacticLessonInputFull extends DidacticLessonInputWithDependencies {
  readonly styleInput?: DidacticStyleInput;
}

// --- Fully Extended Lesson Plan (dependencies + styles) ---

export interface DidacticLessonPlanFull extends DidacticLessonPlanWithDependencies {
  readonly styleTrace?: DidacticStyleTrace;
}

// ---------------------------------------------------------------------------
// D1-OPT-04 — Layered Progressive Learning Orchestration Types
// ---------------------------------------------------------------------------

// --- Learning Layer ---

export type DidacticLearningLayer =
  | 'problem_or_motivation'
  | 'high_level_intuition'
  | 'conceptual_explanation'
  | 'visual_interpretation'
  | 'mathematical_formalization'
  | 'algorithmic_reasoning'
  | 'implementation_example'
  | 'interactive_experimentation'
  | 'real_world_application'
  | 'limitations_tradeoffs_common_mistakes';

// --- Learning Depth Mode ---

export type DidacticLearningDepthMode = 'overview' | 'standard' | 'deep' | 'full';

// --- Learning Layer Resource (governed layer asset) ---

export interface DidacticLearningLayerResource {
  readonly layer: DidacticLearningLayer;
  readonly resourceId: string;
  readonly source: string;
  readonly supportedStages: readonly DidacticPipelineStageName[];
  readonly pedagogicalPurpose: string;
  readonly depthModeSupport: readonly DidacticLearningDepthMode[];
  readonly lifecycle: 'active' | 'deprecated' | 'experimental';
}

// --- Layer-to-Stage Mapping ---

export interface DidacticLayerStageMapping {
  readonly layer: DidacticLearningLayer;
  readonly stageId: DidacticPipelineStageName;
  readonly mappingType: 'primary' | 'secondary';
}

// --- Learning Layer Status ---

export type DidacticLearningLayerStatus = 'selected' | 'omitted';

// --- Learning Layer Decision (output of orchestrator) ---

export interface DidacticLearningLayerDecision {
  readonly layer: DidacticLearningLayer;
  readonly status: DidacticLearningLayerStatus;
  readonly resourceId: string | null;
  readonly source: string;
  readonly supportedStages: readonly DidacticPipelineStageName[];
  readonly pedagogicalPurpose: string;
  readonly mappedStages: readonly DidacticPipelineStageName[];
  readonly omissionReason: string | null;
}

// --- Learning Layer Trace (attached to lesson plan) ---

export interface DidacticLearningLayerTrace {
  readonly depthMode: DidacticLearningDepthMode;
  readonly layersSelected: number;
  readonly layersOmitted: number;
  readonly decisions: readonly DidacticLearningLayerDecision[];
  readonly selectedLayers: readonly DidacticLearningLayer[];
  readonly omittedLayers: readonly DidacticLearningLayer[];
}

// --- Extended Lesson Input with layer resources ---

export interface DidacticLayerInput {
  readonly depthMode?: DidacticLearningDepthMode;
  readonly requestedLayers?: readonly DidacticLearningLayer[];
  readonly layerResources?: readonly DidacticLearningLayerResource[];
}

export interface DidacticLessonInputWithLayers extends DidacticLessonInput {
  layerInput?: DidacticLayerInput;
}

// --- Extended Lesson Plan with layer trace ---

export interface DidacticLessonPlanWithLayers extends DidacticLessonPlan {
  readonly learningLayerTrace?: DidacticLearningLayerTrace;
}

// --- Fully Extended Lesson Input (dependencies + styles + layers) ---

export interface DidacticLessonInputComplete extends DidacticLessonInputFull {
  layerInput?: DidacticLayerInput;
}

// --- Fully Extended Lesson Plan (dependencies + styles + layers) ---

export interface DidacticLessonPlanComplete extends DidacticLessonPlanFull {
  readonly learningLayerTrace?: DidacticLearningLayerTrace;
}

// ---------------------------------------------------------------------------
// D1-OPT-05 — Deep Laboratory Integration Orchestration Types
// ---------------------------------------------------------------------------

// --- Laboratory Integration Mode ---

export type DidacticLaboratoryIntegrationMode =
  | 'exploratory_before_explanation'
  | 'guided_during_explanation'
  | 'validation_after_theory'
  | 'comparative_between_methods'
  | 'challenge_after_assessment'
  | 'reinforcement_after_assessment';

// --- Laboratory Resource (governed lab asset) ---

export interface DidacticLaboratoryResource {
  readonly labId: string;
  readonly source: string;
  readonly supportedIntegrationModes: readonly DidacticLaboratoryIntegrationMode[];
  readonly supportedStages: readonly DidacticPipelineStageName[];
  readonly pedagogicalObjective: string;
  readonly requiredConceptIds: readonly string[];
  readonly outputArtifactTypes?: readonly string[];
  readonly lifecycle: 'active' | 'deprecated' | 'experimental';
}

// --- Laboratory Placement ---

export interface DidacticLaboratoryPlacement {
  readonly labId: string;
  readonly integrationMode: DidacticLaboratoryIntegrationMode;
  readonly targetStageId: DidacticPipelineStageName;
  readonly rationale: string;
}

// --- Laboratory Request (input shape for orchestrator) ---

export interface DidacticLaboratoryRequest {
  readonly labId: string;
  readonly integrationMode: DidacticLaboratoryIntegrationMode;
}

// --- Laboratory Status ---

export type DidacticLaboratoryStatus = 'selected' | 'omitted';

// --- Laboratory Decision (output of orchestrator) ---

export interface DidacticLaboratoryDecision {
  readonly labId: string;
  readonly status: DidacticLaboratoryStatus;
  readonly source: string;
  readonly integrationMode: DidacticLaboratoryIntegrationMode;
  readonly targetStageId: DidacticPipelineStageName;
  readonly pedagogicalObjective: string;
  readonly requiredConceptIds: readonly string[];
  readonly rationale: string;
  readonly omissionReason: string | null;
}

// --- Laboratory Trace (attached to lesson plan) ---

export interface DidacticLaboratoryTrace {
  readonly labsSelected: number;
  readonly labsOmitted: number;
  readonly decisions: readonly DidacticLaboratoryDecision[];
  readonly selectedLabs: readonly string[];
  readonly omittedLabs: readonly string[];
}

// --- Extended Lesson Input with laboratory resources ---

export interface DidacticLaboratoryInput {
  readonly requestedLabs?: readonly DidacticLaboratoryRequest[];
  readonly laboratoryResources?: readonly DidacticLaboratoryResource[];
}

export interface DidacticLessonInputWithLaboratories extends DidacticLessonInput {
  readonly laboratoryInput?: DidacticLaboratoryInput;
}

// --- Extended Lesson Plan with laboratory trace ---

export interface DidacticLessonPlanWithLaboratories extends DidacticLessonPlan {
  readonly laboratoryTrace?: DidacticLaboratoryTrace;
}

// --- Fully Extended Lesson Input (all orchestrations) ---

export interface DidacticLessonInputAll extends DidacticLessonInputComplete {
  laboratoryInput?: DidacticLaboratoryInput;
}

// --- Fully Extended Lesson Plan (all orchestrations) ---

export interface DidacticLessonPlanAll extends DidacticLessonPlanComplete {
  readonly laboratoryTrace?: DidacticLaboratoryTrace;
}

// ---------------------------------------------------------------------------
// D1-OPT-06 — Assessment Checkpoint Orchestration Types
// ---------------------------------------------------------------------------

// --- Assessment Checkpoint Type ---

export type DidacticAssessmentCheckpointType =
  | 'concept_check'
  | 'misconception_check'
  | 'parameter_interpretation'
  | 'prediction_before_run'
  | 'reflection_prompt'
  | 'debugging_prompt'
  | 'synthesis_question'
  | 'forward_connection_check';

// --- Assessment Resource (governed assessment asset) ---

export interface DidacticAssessmentResource {
  readonly assessmentId: string;
  readonly source: string;
  readonly checkpointType: DidacticAssessmentCheckpointType;
  readonly supportedStages: readonly DidacticPipelineStageName[];
  readonly pedagogicalObjective: string;
  readonly targetConceptIds: readonly string[];
  readonly targetMisconceptionIds?: readonly string[];
  readonly requiresLaboratoryContext: boolean;
  readonly lifecycle: 'active' | 'deprecated' | 'experimental';
}

// --- Assessment Placement ---

export interface DidacticAssessmentPlacement {
  readonly assessmentId: string;
  readonly checkpointType: DidacticAssessmentCheckpointType;
  readonly targetStageId: DidacticPipelineStageName;
  readonly rationale: string;
}

// --- Assessment Status ---

export type DidacticAssessmentStatus = 'selected' | 'omitted';

// --- Assessment Decision (output of orchestrator) ---

export interface DidacticAssessmentDecision {
  readonly assessmentId: string;
  readonly status: DidacticAssessmentStatus;
  readonly source: string;
  readonly checkpointType: DidacticAssessmentCheckpointType;
  readonly targetStageId: DidacticPipelineStageName;
  readonly pedagogicalObjective: string;
  readonly targetConceptIds: readonly string[];
  readonly rationale: string;
  readonly requiresLaboratoryContext: boolean;
  readonly omissionReason: string | null;
}

// --- Assessment Trace (attached to lesson plan) ---

export interface DidacticAssessmentTrace {
  readonly assessmentsSelected: number;
  readonly assessmentsOmitted: number;
  readonly decisions: readonly DidacticAssessmentDecision[];
  readonly selectedAssessments: readonly string[];
  readonly omittedAssessments: readonly string[];
}

// --- Extended Lesson Input with assessment resources ---

export interface DidacticAssessmentInput {
  readonly requestedAssessments?: readonly DidacticAssessmentPlacement[];
  readonly assessmentResources?: readonly DidacticAssessmentResource[];
}

export interface DidacticLessonInputWithAssessments extends DidacticLessonInput {
  readonly assessmentInput?: DidacticAssessmentInput;
}

// --- Extended Lesson Plan with assessment trace ---

export interface DidacticLessonPlanWithAssessments extends DidacticLessonPlan {
  readonly assessmentTrace?: DidacticAssessmentTrace;
}

// --- Fully Extended Lesson Input (all orchestrations + assessments) ---

export interface DidacticLessonInputFinal extends DidacticLessonInputAll {
  assessmentInput?: DidacticAssessmentInput;
}

// --- Fully Extended Lesson Plan (all orchestrations + assessments) ---

export interface DidacticLessonPlanFinal extends DidacticLessonPlanAll {
  readonly assessmentTrace?: DidacticAssessmentTrace;
}

// ---------------------------------------------------------------------------
// D1-OPT-07 — Misconception & Cognitive Load Orchestration Types
// ---------------------------------------------------------------------------

// --- Misconception Support Type ---

export type DidacticMisconceptionSupportType =
  | 'definition_confusion'
  | 'notation_confusion'
  | 'mathematical_misinterpretation'
  | 'implementation_pitfall'
  | 'visual_misreading'
  | 'concept_overlap'
  | 'false_intuition'
  | 'overgeneralization';

// --- Cognitive Load Support Type ---

export type DidacticCognitiveLoadSupportType =
  | 'prerequisite_recap'
  | 'terminology_anchor'
  | 'notation_anchor'
  | 'visual_anchor'
  | 'step_chunking'
  | 'complexity_warning'
  | 'transition_bridge'
  | 'summary_checkpoint';

// --- Misconception Resource (governed misconception asset) ---

export interface DidacticMisconceptionResource {
  readonly misconceptionId: string;
  readonly supportType: DidacticMisconceptionSupportType;
  readonly source: string;
  readonly targetConceptIds: readonly string[];
  readonly supportedStages: readonly DidacticPipelineStageName[];
  readonly pedagogicalObjective: string;
  readonly severity: 'low' | 'medium' | 'high';
  readonly lifecycle: 'active' | 'deprecated' | 'experimental';
}

// --- Cognitive Load Resource (governed cognitive-load asset) ---

export interface DidacticCognitiveLoadResource {
  readonly supportId: string;
  readonly supportType: DidacticCognitiveLoadSupportType;
  readonly source: string;
  readonly targetConceptIds: readonly string[];
  readonly supportedStages: readonly DidacticPipelineStageName[];
  readonly pedagogicalObjective: string;
  readonly loadLevel: 'low' | 'medium' | 'high';
  readonly lifecycle: 'active' | 'deprecated' | 'experimental';
}

// --- Support Placement ---

export interface DidacticSupportPlacement {
  readonly supportId: string;
  readonly supportType: DidacticMisconceptionSupportType | DidacticCognitiveLoadSupportType;
  readonly category: 'misconception' | 'cognitive_load';
  readonly targetStageId: DidacticPipelineStageName;
  readonly rationale: string;
}

// --- Support Status ---

export type DidacticSupportStatus = 'selected' | 'omitted';

// --- Support Decision (output of orchestrator) ---

export interface DidacticSupportDecision {
  readonly supportId: string;
  readonly status: DidacticSupportStatus;
  readonly category: 'misconception' | 'cognitive_load';
  readonly supportType: DidacticMisconceptionSupportType | DidacticCognitiveLoadSupportType;
  readonly source: string;
  readonly targetStageId: DidacticPipelineStageName;
  readonly pedagogicalObjective: string;
  readonly targetConceptIds: readonly string[];
  readonly rationale: string;
  readonly severity: 'low' | 'medium' | 'high' | null;
  readonly omissionReason: string | null;
}

// --- Support Trace (attached to lesson plan) ---

export interface DidacticSupportTrace {
  readonly supportsSelected: number;
  readonly supportsOmitted: number;
  readonly decisions: readonly DidacticSupportDecision[];
  readonly selectedSupports: readonly string[];
  readonly omittedSupports: readonly string[];
}

// --- Extended Lesson Input with support resources ---

export interface DidacticSupportInput {
  readonly requestedSupports?: readonly DidacticSupportPlacement[];
  readonly misconceptionResources?: readonly DidacticMisconceptionResource[];
  readonly cognitiveLoadResources?: readonly DidacticCognitiveLoadResource[];
}

export interface DidacticLessonInputWithSupports extends DidacticLessonInput {
  readonly supportInput?: DidacticSupportInput;
}

// --- Extended Lesson Plan with support trace ---

export interface DidacticLessonPlanWithSupports extends DidacticLessonPlan {
  readonly supportTrace?: DidacticSupportTrace;
}

// --- Fully Extended Lesson Input (all orchestrations + supports) ---

export interface DidacticLessonInputComplete2 extends DidacticLessonInputFinal {
  supportInput?: DidacticSupportInput;
}

// --- Fully Extended Lesson Plan (all orchestrations + supports) ---

export interface DidacticLessonPlanComplete2 extends DidacticLessonPlanFinal {
  readonly supportTrace?: DidacticSupportTrace;
}

// ---------------------------------------------------------------------------
// D1-OPT-08 — Composition Quality Gate & Certification Types
// ---------------------------------------------------------------------------

// --- Certification Status ---

export type DidacticCompositionCertificationStatus =
  | 'certified'
  | 'certified_with_warnings'
  | 'needs_revision'
  | 'blocked';

// --- Finding Severity ---

export type DidacticCompositionFindingSeverity = 'error' | 'warning' | 'recommendation';

// --- Quality Dimension ---

export type DidacticCompositionQualityDimension =
  | 'structural_validity'
  | 'trace_completeness'
  | 'prerequisite_handling'
  | 'style_coverage'
  | 'layer_progression'
  | 'laboratory_integration'
  | 'assessment_integration'
  | 'misconception_support'
  | 'cognitive_load_support'
  | 'deterministic_integrity'
  | 'governance_readiness';

// --- Certification Finding ---

export interface DidacticCompositionFinding {
  readonly code: string;
  readonly message: string;
  readonly severity: DidacticCompositionFindingSeverity;
  readonly qualityDimension: DidacticCompositionQualityDimension;
}

// --- Certification Report (output of certification engine) ---

export interface DidacticCompositionCertificationReport {
  readonly planId: string;
  readonly topic: string;
  readonly status: DidacticCompositionCertificationStatus;
  readonly findings: readonly DidacticCompositionFinding[];
  readonly dimensionsChecked: readonly DidacticCompositionQualityDimension[];
  readonly errorCount: number;
  readonly warningCount: number;
  readonly recommendationCount: number;
  readonly qualityScore: number;
  readonly deterministic: true;
  readonly certifiedAt: 'composition_certification';
}

// --- Certification Input ---

export interface DidacticCompositionCertificationInput {
  readonly plan: DidacticLessonPlanComplete2;
}

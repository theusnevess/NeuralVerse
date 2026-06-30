/**
 * NV-1700-D6-OPT-01 / D6-OPT-02 / D6-OPT-03 / D6-OPT-04 / D6-OPT-05 / D6-OPT-06 / D6-OPT-07 / D6-OPT-08 / D6-OPT-09 / D6-OPT-10 — Narrative Agent Domain Contract
 *
 * Stable internal data model for the Narrative Contract & Registry Kernel.
 * Defines all types required for deterministic narrative metadata orchestration,
 * deterministic registry representation, and deterministic provenance tracking.
 *
 * Extended with Narrative Style & Framing Orchestration (D6-OPT-02).
 * Extended with Problem-Origin & Motivation Modeling (D6-OPT-03).
 * Extended with Analogy, Metaphor & Intuition Modeling (D6-OPT-04).
 * Extended with Story Arc, Cognitive Progression & Narrative Flow (D6-OPT-05).
 * Extended with Narrative Emotion, Curiosity & Engagement Modeling (D6-OPT-06).
 * Extended with Historical Context, Scientific Evolution & Discovery Timeline (D6-OPT-07).
 * Extended with Application-Driven Context & Real-World Relevance (D6-OPT-08).
 * Extended with Multi-Perspective Explanation & Alternative Viewpoint Modeling (D6-OPT-09).
 * Extended with Narrative Composition Certification & Public Pipeline Facade (D6-OPT-10).
 *
 * This module is purely structural. It contains no runtime logic,
 * no mutable state, no external dependencies, and no probabilistic behavior.
 */

// ---------------------------------------------------------------------------
// Canonical Narrative Unit Types (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_NARRATIVE_UNIT_TYPES = [
  'lesson_opening',
  'concept_motivation',
  'historical_frame',
  'problem_origin',
  'transition',
  'analogy_frame',
  'laboratory_intro',
  'lesson_closure',
  'forward_connection',
  'synthesis',
] as const;

export type NarrativeUnitType = (typeof CANONICAL_NARRATIVE_UNIT_TYPES)[number];

// ---------------------------------------------------------------------------
// Canonical Narrative Modes (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_NARRATIVE_MODES = [
  'historical_discovery',
  'engineering_problem',
  'scientific_investigation',
  'industrial_case_study',
  'everyday_analogy',
  'step_by_step_construction',
  'failure_driven_explanation',
  'research_evolution',
] as const;

export type NarrativeMode = (typeof CANONICAL_NARRATIVE_MODES)[number];

// ---------------------------------------------------------------------------
// Canonical Narrative Domains (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_NARRATIVE_DOMAINS = [
  'mathematics',
  'statistics',
  'computer_science',
  'machine_learning',
  'deep_learning',
  'computer_vision',
  'generative_ai',
  'mlops',
  'software_engineering',
  'research',
] as const;

export type NarrativeDomain = (typeof CANONICAL_NARRATIVE_DOMAINS)[number];

// ---------------------------------------------------------------------------
// Canonical Narrative Status (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_NARRATIVE_STATUS = [
  'draft',
  'review',
  'approved',
  'published',
  'deprecated',
  'archived',
] as const;

export type NarrativeStatus = (typeof CANONICAL_NARRATIVE_STATUS)[number];

// ---------------------------------------------------------------------------
// Canonical Governance Status (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_GOVERNANCE_STATUSES = [
  'canonical',
  'accepted',
  'provisional',
  'deprecated',
  'rejected',
] as const;

export type NarrativeGovernanceStatus = (typeof CANONICAL_GOVERNANCE_STATUSES)[number];

// ---------------------------------------------------------------------------
// Narrative Provenance
// ---------------------------------------------------------------------------

export interface NarrativeProvenance {
  readonly source: string;
  readonly governanceStatus: NarrativeGovernanceStatus;
  readonly providedBy: string;
  readonly rationale: string;
}

// ---------------------------------------------------------------------------
// Narrative Unit
// ---------------------------------------------------------------------------

export interface NarrativeUnit {
  readonly narrativeId: string;
  readonly title: string;
  readonly unitType: NarrativeUnitType;
  readonly narrativeMode: NarrativeMode;
  readonly domain: NarrativeDomain;
  readonly status: NarrativeStatus;
  readonly canonicalKnowledgeId: string;
  readonly curriculumNodeId: string;
  readonly lessonId: string;
  readonly laboratoryId: string;
  readonly sequenceOrder: number;
  readonly summary: string;
  readonly tags: readonly string[];
  readonly provenance: NarrativeProvenance;
}

// ---------------------------------------------------------------------------
// Narrative Decision
// ---------------------------------------------------------------------------

export interface NarrativeDecision {
  readonly decisionId: string;
  readonly narrativeId: string;
  readonly validationPassed: boolean;
  readonly validationErrors: readonly string[];
}

// ---------------------------------------------------------------------------
// Narrative Trace
// ---------------------------------------------------------------------------

export interface NarrativeTrace {
  readonly traceId: string;
  readonly decisionCount: number;
  readonly validationCount: number;
  readonly registryVersion: string;
  readonly pipelineVersion: string;
  readonly compositionMetadata: Readonly<Record<string, unknown>>;
  readonly deterministicMetadata: Readonly<Record<string, unknown>>;
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_narrative_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Narrative Registry Metadata
// ---------------------------------------------------------------------------

export interface NarrativeRegistryMetadata {
  readonly registryId: string;
  readonly narrativeCount: number;
  readonly domainCount: number;
  readonly typeCount: number;
  readonly modeCount: number;
}

// ---------------------------------------------------------------------------
// Narrative Registry
// ---------------------------------------------------------------------------

export interface NarrativeRegistry {
  readonly registryId: string;
  readonly narratives: readonly NarrativeUnit[];
  readonly metadata: NarrativeRegistryMetadata;
  readonly trace: NarrativeTrace;
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_narrative_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Narrative Input
// ---------------------------------------------------------------------------

export interface NarrativeInput {
  readonly narratives: readonly NarrativeUnit[];
}

// ---------------------------------------------------------------------------
// Narrative Artifact
// ---------------------------------------------------------------------------

export interface NarrativeArtifact {
  readonly narrativeId: string;
  readonly title: string;
  readonly unitType: NarrativeUnitType;
  readonly narrativeMode: NarrativeMode;
  readonly domain: NarrativeDomain;
  readonly status: NarrativeStatus;
  readonly canonicalKnowledgeId: string;
  readonly curriculumNodeId: string;
  readonly lessonId: string;
  readonly laboratoryId: string;
  readonly sequenceOrder: number;
  readonly summary: string;
  readonly tags: readonly string[];
  readonly provenance: NarrativeProvenance;
}

// ---------------------------------------------------------------------------
// Narrative Status Record
// ---------------------------------------------------------------------------

export interface NarrativeStatusRecord {
  readonly narrativeId: string;
  readonly currentStatus: NarrativeStatus;
  readonly previousStatus: NarrativeStatus | null;
  readonly validatedAt: 'narrative_status_composition';
}

// ---------------------------------------------------------------------------
// Narrative Validation Error
// ---------------------------------------------------------------------------

export interface NarrativeValidationError {
  readonly code: string;
  readonly message: string;
  readonly field?: string;
  readonly narrativeId?: string;
}

// ---------------------------------------------------------------------------
// Narrative Validation Result
// ---------------------------------------------------------------------------

export interface NarrativeValidationResult {
  readonly valid: boolean;
  readonly errors: readonly NarrativeValidationError[];
}

// ---------------------------------------------------------------------------
// Narrative Unit Validation Result
// ---------------------------------------------------------------------------

export interface NarrativeUnitValidationResult {
  readonly valid: boolean;
  readonly errors: readonly NarrativeValidationError[];
  readonly checkedAt: 'narrative_unit_composition';
}

// ---------------------------------------------------------------------------
// Narrative Registry Validation Result
// ---------------------------------------------------------------------------

export interface NarrativeRegistryValidationResult {
  readonly valid: boolean;
  readonly errors: readonly NarrativeValidationError[];
  readonly checkedAt: 'narrative_registry_composition';
}

// ---------------------------------------------------------------------------
// Narrative Input Validation Result
// ---------------------------------------------------------------------------

export interface NarrativeInputValidationResult {
  readonly valid: boolean;
  readonly errors: readonly NarrativeValidationError[];
  readonly checkedAt: 'narrative_input_composition';
}

// ---------------------------------------------------------------------------
// Narrative Trace Validation Result
// ---------------------------------------------------------------------------

export interface NarrativeTraceValidationResult {
  readonly valid: boolean;
  readonly errors: readonly NarrativeValidationError[];
  readonly checkedAt: 'narrative_trace_composition';
}

// ---------------------------------------------------------------------------
// Narrative Artifact Validation Result
// ---------------------------------------------------------------------------

export interface NarrativeArtifactValidationResult {
  readonly valid: boolean;
  readonly errors: readonly NarrativeValidationError[];
  readonly checkedAt: 'narrative_artifact_composition';
}

// ============================================================================
// D6-OPT-02 — Narrative Style & Framing Orchestration
// ============================================================================

// ---------------------------------------------------------------------------
// Canonical Narrative Styles (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_NARRATIVE_STYLES = [
  'historical',
  'engineering',
  'scientific',
  'investigative',
  'comparative',
  'incremental',
  'application_driven',
  'failure_driven',
  'storytelling',
  'research_journey',
] as const;

export type NarrativeStyleType = (typeof CANONICAL_NARRATIVE_STYLES)[number];

// ---------------------------------------------------------------------------
// Canonical Framing Strategies (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_NARRATIVE_FRAMES = [
  'problem_first',
  'solution_first',
  'question_first',
  'historical_first',
  'application_first',
  'intuition_first',
  'mathematical_first',
  'experiment_first',
  'observation_first',
  'comparison_first',
] as const;

export type NarrativeFrameType = (typeof CANONICAL_NARRATIVE_FRAMES)[number];

// ---------------------------------------------------------------------------
// Canonical Motivation Types (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_MOTIVATION_TYPES = [
  'curiosity',
  'necessity',
  'historical_problem',
  'engineering_constraint',
  'scientific_question',
  'real_world_application',
  'optimization',
  'discovery',
  'failure',
  'research',
] as const;

export type MotivationType = (typeof CANONICAL_MOTIVATION_TYPES)[number];

// ---------------------------------------------------------------------------
// Canonical Narrative Tones (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_NARRATIVE_TONES = [
  'formal',
  'conversational',
  'technical',
  'inspirational',
  'exploratory',
  'investigative',
  'minimal',
  'didactic',
] as const;

export type NarrativeTone = (typeof CANONICAL_NARRATIVE_TONES)[number];

// ---------------------------------------------------------------------------
// Canonical Narrative Style Status (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_NARRATIVE_STYLE_STATUS = [
  'draft',
  'review',
  'approved',
  'published',
  'deprecated',
  'archived',
] as const;

export type NarrativeStyleStatus = (typeof CANONICAL_NARRATIVE_STYLE_STATUS)[number];

// ---------------------------------------------------------------------------
// Narrative Style
// ---------------------------------------------------------------------------

export interface NarrativeStyle {
  readonly styleId: string;
  readonly styleType: NarrativeStyleType;
  readonly preferredFrame: NarrativeFrameType;
  readonly motivationType: MotivationType;
  readonly tone: NarrativeTone;
  readonly domain: NarrativeDomain;
  readonly knowledgeArtifactId: string;
  readonly curriculumNodeId: string;
  readonly lessonId: string;
  readonly sequencePriority: number;
  readonly summary: string;
  readonly tags: readonly string[];
  readonly provenance: NarrativeProvenance;
}

// ---------------------------------------------------------------------------
// Narrative Frame
// ---------------------------------------------------------------------------

export interface NarrativeFrame {
  readonly frameId: string;
  readonly frameType: NarrativeFrameType;
  readonly openingStrategy: string;
  readonly transitionStrategy: string;
  readonly closureStrategy: string;
  readonly supportedStyles: readonly NarrativeStyleType[];
  readonly provenance: NarrativeProvenance;
}

// ---------------------------------------------------------------------------
// Narrative Motivation
// ---------------------------------------------------------------------------

export interface NarrativeMotivation {
  readonly motivationId: string;
  readonly motivationType: MotivationType;
  readonly title: string;
  readonly description: string;
  readonly domain: NarrativeDomain;
  readonly knowledgeArtifactId: string;
  readonly provenance: NarrativeProvenance;
}

// ---------------------------------------------------------------------------
// Narrative Style Decision
// ---------------------------------------------------------------------------

export interface NarrativeStyleDecision {
  readonly decisionId: string;
  readonly styleId: string;
  readonly validationPassed: boolean;
  readonly validationErrors: readonly string[];
}

// ---------------------------------------------------------------------------
// Narrative Style Trace
// ---------------------------------------------------------------------------

export interface NarrativeStyleTrace {
  readonly traceId: string;
  readonly decisionCount: number;
  readonly validationCount: number;
  readonly registryVersion: string;
  readonly pipelineVersion: string;
  readonly compositionMetadata: Readonly<Record<string, unknown>>;
  readonly deterministicMetadata: Readonly<Record<string, unknown>>;
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_narrative_style_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Narrative Style Registry Metadata
// ---------------------------------------------------------------------------

export interface NarrativeStyleRegistryMetadata {
  readonly registryId: string;
  readonly styleCount: number;
  readonly domainCount: number;
  readonly typeCount: number;
  readonly frameCount: number;
}

// ---------------------------------------------------------------------------
// Narrative Style Registry
// ---------------------------------------------------------------------------

export interface NarrativeStyleRegistry {
  readonly registryId: string;
  readonly styles: readonly NarrativeStyle[];
  readonly metadata: NarrativeStyleRegistryMetadata;
  readonly trace: NarrativeStyleTrace;
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_narrative_style_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Narrative Style Input
// ---------------------------------------------------------------------------

export interface NarrativeStyleInput {
  readonly styles: readonly NarrativeStyle[];
}

// ---------------------------------------------------------------------------
// Narrative Artifact With Style
// ---------------------------------------------------------------------------

export interface NarrativeArtifactWithStyle {
  readonly narrativeId: string;
  readonly title: string;
  readonly unitType: NarrativeUnitType;
  readonly narrativeMode: NarrativeMode;
  readonly domain: NarrativeDomain;
  readonly status: NarrativeStatus;
  readonly canonicalKnowledgeId: string;
  readonly curriculumNodeId: string;
  readonly lessonId: string;
  readonly laboratoryId: string;
  readonly sequenceOrder: number;
  readonly summary: string;
  readonly tags: readonly string[];
  readonly provenance: NarrativeProvenance;
  readonly appliedStyle: NarrativeStyle;
  readonly appliedFrame: NarrativeFrame;
}

// ---------------------------------------------------------------------------
// Narrative Style Validation Error
// ---------------------------------------------------------------------------

export interface NarrativeStyleValidationError {
  readonly code: string;
  readonly message: string;
  readonly field?: string;
  readonly styleId?: string;
}

// ---------------------------------------------------------------------------
// Narrative Style Validation Result
// ---------------------------------------------------------------------------

export interface NarrativeStyleValidationResult {
  readonly valid: boolean;
  readonly errors: readonly NarrativeStyleValidationError[];
}

// ---------------------------------------------------------------------------
// Narrative Style Validation Result (specific)
// ---------------------------------------------------------------------------

export interface NarrativeStyleUnitValidationResult {
  readonly valid: boolean;
  readonly errors: readonly NarrativeStyleValidationError[];
  readonly checkedAt: 'narrative_style_composition';
}

// ---------------------------------------------------------------------------
// Narrative Frame Validation Result
// ---------------------------------------------------------------------------

export interface NarrativeFrameValidationResult {
  readonly valid: boolean;
  readonly errors: readonly NarrativeStyleValidationError[];
  readonly checkedAt: 'narrative_frame_composition';
}

// ---------------------------------------------------------------------------
// Narrative Motivation Validation Result
// ---------------------------------------------------------------------------

export interface NarrativeMotivationValidationResult {
  readonly valid: boolean;
  readonly errors: readonly NarrativeStyleValidationError[];
  readonly checkedAt: 'narrative_motivation_composition';
}

// ---------------------------------------------------------------------------
// Narrative Style Registry Validation Result
// ---------------------------------------------------------------------------

export interface NarrativeStyleRegistryValidationResult {
  readonly valid: boolean;
  readonly errors: readonly NarrativeStyleValidationError[];
  readonly checkedAt: 'narrative_style_registry_composition';
}

// ---------------------------------------------------------------------------
// Narrative Style Trace Validation Result
// ---------------------------------------------------------------------------

export interface NarrativeStyleTraceValidationResult {
  readonly valid: boolean;
  readonly errors: readonly NarrativeStyleValidationError[];
  readonly checkedAt: 'narrative_style_trace_composition';
}

// ---------------------------------------------------------------------------
// Narrative Artifact With Style Validation Result
// ---------------------------------------------------------------------------

export interface NarrativeArtifactWithStyleValidationResult {
  readonly valid: boolean;
  readonly errors: readonly NarrativeStyleValidationError[];
  readonly checkedAt: 'narrative_artifact_with_style_composition';
}

// ---------------------------------------------------------------------------
// Narrative Style Input Validation Result
// ---------------------------------------------------------------------------

export interface NarrativeStyleInputValidationResult {
  readonly valid: boolean;
  readonly errors: readonly NarrativeStyleValidationError[];
  readonly checkedAt: 'narrative_style_input_composition';
}

// ============================================================================
// D6-OPT-03 — Problem-Origin & Motivation Modeling
// ============================================================================

// ---------------------------------------------------------------------------
// Canonical Problem Types (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_PROBLEM_TYPES = [
  'engineering_problem',
  'scientific_problem',
  'mathematical_problem',
  'historical_problem',
  'practical_problem',
  'performance_problem',
  'design_problem',
  'communication_problem',
  'optimization_problem',
  'misconception_problem',
] as const;

export type ProblemType = (typeof CANONICAL_PROBLEM_TYPES)[number];

// ---------------------------------------------------------------------------
// Canonical Origin Types (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_ORIGIN_TYPES = [
  'historical_need',
  'engineering_need',
  'scientific_discovery',
  'practical_constraint',
  'mathematical_formalization',
  'technological_evolution',
  'research_gap',
  'educational_need',
  'industry_problem',
  'cross_domain_integration',
] as const;

export type OriginType = (typeof CANONICAL_ORIGIN_TYPES)[number];

// ---------------------------------------------------------------------------
// Canonical Motivation Categories (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_MOTIVATION_CATEGORIES = [
  'curiosity',
  'necessity',
  'efficiency',
  'accuracy',
  'scalability',
  'simplicity',
  'interpretability',
  'automation',
  'robustness',
  'innovation',
] as const;

export type MotivationCategory = (typeof CANONICAL_MOTIVATION_CATEGORIES)[number];

// ---------------------------------------------------------------------------
// Canonical Driving Question Types (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_DRIVING_QUESTION_TYPES = [
  'why',
  'how',
  'what_if',
  'comparison',
  'tradeoff',
  'prediction',
  'failure_analysis',
  'optimization',
  'design_choice',
  'future_direction',
] as const;

export type DrivingQuestionType = (typeof CANONICAL_DRIVING_QUESTION_TYPES)[number];

// ---------------------------------------------------------------------------
// Canonical Misconception Types (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_MISCONCEPTION_TYPES = [
  'oversimplification',
  'false_equivalence',
  'incorrect_causality',
  'terminology_confusion',
  'implementation_confusion',
  'mathematical_confusion',
  'historical_confusion',
  'algorithmic_confusion',
  'visualization_confusion',
  'conceptual_confusion',
] as const;

export type MisconceptionType = (typeof CANONICAL_MISCONCEPTION_TYPES)[number];

// ---------------------------------------------------------------------------
// Canonical Problem Status (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_PROBLEM_STATUS = [
  'draft',
  'review',
  'approved',
  'published',
  'deprecated',
  'archived',
] as const;

export type ProblemStatus = (typeof CANONICAL_PROBLEM_STATUS)[number];

// ---------------------------------------------------------------------------
// Problem Provenance
// ---------------------------------------------------------------------------

export interface ProblemProvenance {
  readonly source: string;
  readonly governanceStatus: NarrativeGovernanceStatus;
  readonly providedBy: string;
  readonly rationale: string;
}

// ---------------------------------------------------------------------------
// Problem
// ---------------------------------------------------------------------------

export interface Problem {
  readonly problemId: string;
  readonly problemType: ProblemType;
  readonly title: string;
  readonly summary: string;
  readonly originId: string;
  readonly motivationIds: readonly string[];
  readonly questionIds: readonly string[];
  readonly misconceptionIds: readonly string[];
  readonly governanceStatus: NarrativeGovernanceStatus;
  readonly provenance: ProblemProvenance;
}

// ---------------------------------------------------------------------------
// Origin
// ---------------------------------------------------------------------------

export interface Origin {
  readonly originId: string;
  readonly originType: OriginType;
  readonly title: string;
  readonly description: string;
  readonly relatedArtifactId: string;
  readonly governanceStatus: NarrativeGovernanceStatus;
  readonly provenance: ProblemProvenance;
}

// ---------------------------------------------------------------------------
// Motivation (Problem-Level)
// ---------------------------------------------------------------------------

export interface ProblemMotivation {
  readonly motivationId: string;
  readonly category: MotivationCategory;
  readonly title: string;
  readonly description: string;
  readonly importance: string;
  readonly governanceStatus: NarrativeGovernanceStatus;
  readonly provenance: ProblemProvenance;
}

// ---------------------------------------------------------------------------
// Driving Question
// ---------------------------------------------------------------------------

export interface DrivingQuestion {
  readonly questionId: string;
  readonly questionType: DrivingQuestionType;
  readonly prompt: string;
  readonly relatedArtifactId: string;
  readonly governanceStatus: NarrativeGovernanceStatus;
  readonly provenance: ProblemProvenance;
}

// ---------------------------------------------------------------------------
// Misconception
// ---------------------------------------------------------------------------

export interface Misconception {
  readonly misconceptionId: string;
  readonly misconceptionType: MisconceptionType;
  readonly title: string;
  readonly description: string;
  readonly correctiveArtifactId: string;
  readonly governanceStatus: NarrativeGovernanceStatus;
  readonly provenance: ProblemProvenance;
}

// ---------------------------------------------------------------------------
// Problem Decision
// ---------------------------------------------------------------------------

export interface ProblemDecision {
  readonly decisionId: string;
  readonly problemId: string;
  readonly validationPassed: boolean;
  readonly validationErrors: readonly string[];
}

// ---------------------------------------------------------------------------
// Problem Trace
// ---------------------------------------------------------------------------

export interface ProblemTrace {
  readonly traceId: string;
  readonly decisionCount: number;
  readonly validationCount: number;
  readonly problemCount: number;
  readonly originCount: number;
  readonly motivationCount: number;
  readonly questionCount: number;
  readonly misconceptionCount: number;
  readonly registryVersion: string;
  readonly pipelineVersion: string;
  readonly compositionMetadata: Readonly<Record<string, unknown>>;
  readonly deterministicMetadata: Readonly<Record<string, unknown>>;
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_problem_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Problem Registry Metadata
// ---------------------------------------------------------------------------

export interface ProblemRegistryMetadata {
  readonly registryId: string;
  readonly problemCount: number;
  readonly originCount: number;
  readonly motivationCount: number;
  readonly questionCount: number;
  readonly misconceptionCount: number;
}

// ---------------------------------------------------------------------------
// Problem Registry
// ---------------------------------------------------------------------------

export interface ProblemRegistry {
  readonly registryId: string;
  readonly problems: readonly Problem[];
  readonly origins: readonly Origin[];
  readonly motivations: readonly ProblemMotivation[];
  readonly questions: readonly DrivingQuestion[];
  readonly misconceptions: readonly Misconception[];
  readonly metadata: ProblemRegistryMetadata;
  readonly trace: ProblemTrace;
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_problem_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Problem Input
// ---------------------------------------------------------------------------

export interface ProblemInput {
  readonly problems: readonly Problem[];
  readonly origins: readonly Origin[];
  readonly motivations: readonly ProblemMotivation[];
  readonly questions: readonly DrivingQuestion[];
  readonly misconceptions: readonly Misconception[];
}

// ---------------------------------------------------------------------------
// Narrative Artifact With Problems
// ---------------------------------------------------------------------------

export interface NarrativeArtifactWithProblems {
  readonly narrativeId: string;
  readonly title: string;
  readonly unitType: NarrativeUnitType;
  readonly narrativeMode: NarrativeMode;
  readonly domain: NarrativeDomain;
  readonly status: NarrativeStatus;
  readonly canonicalKnowledgeId: string;
  readonly curriculumNodeId: string;
  readonly lessonId: string;
  readonly laboratoryId: string;
  readonly sequenceOrder: number;
  readonly summary: string;
  readonly tags: readonly string[];
  readonly provenance: NarrativeProvenance;
  readonly problems: readonly Problem[];
  readonly origins: readonly Origin[];
  readonly motivations: readonly ProblemMotivation[];
  readonly questions: readonly DrivingQuestion[];
  readonly misconceptions: readonly Misconception[];
}

// ---------------------------------------------------------------------------
// Problem Validation Error
// ---------------------------------------------------------------------------

export interface ProblemValidationError {
  readonly code: string;
  readonly message: string;
  readonly field?: string;
  readonly problemId?: string;
  readonly originId?: string;
  readonly motivationId?: string;
  readonly questionId?: string;
  readonly misconceptionId?: string;
}

// ---------------------------------------------------------------------------
// Problem Validation Result
// ---------------------------------------------------------------------------

export interface ProblemValidationResult {
  readonly valid: boolean;
  readonly errors: readonly ProblemValidationError[];
}

// ---------------------------------------------------------------------------
// Problem Validation Result (specific)
// ---------------------------------------------------------------------------

export interface ProblemUnitValidationResult {
  readonly valid: boolean;
  readonly errors: readonly ProblemValidationError[];
  readonly checkedAt: 'problem_composition';
}

// ---------------------------------------------------------------------------
// Origin Validation Result
// ---------------------------------------------------------------------------

export interface OriginValidationResult {
  readonly valid: boolean;
  readonly errors: readonly ProblemValidationError[];
  readonly checkedAt: 'origin_composition';
}

// ---------------------------------------------------------------------------
// Problem Motivation Validation Result
// ---------------------------------------------------------------------------

export interface ProblemMotivationValidationResult {
  readonly valid: boolean;
  readonly errors: readonly ProblemValidationError[];
  readonly checkedAt: 'problem_motivation_composition';
}

// ---------------------------------------------------------------------------
// Driving Question Validation Result
// ---------------------------------------------------------------------------

export interface DrivingQuestionValidationResult {
  readonly valid: boolean;
  readonly errors: readonly ProblemValidationError[];
  readonly checkedAt: 'driving_question_composition';
}

// ---------------------------------------------------------------------------
// Misconception Validation Result
// ---------------------------------------------------------------------------

export interface MisconceptionValidationResult {
  readonly valid: boolean;
  readonly errors: readonly ProblemValidationError[];
  readonly checkedAt: 'misconception_composition';
}

// ---------------------------------------------------------------------------
// Problem Registry Validation Result
// ---------------------------------------------------------------------------

export interface ProblemRegistryValidationResult {
  readonly valid: boolean;
  readonly errors: readonly ProblemValidationError[];
  readonly checkedAt: 'problem_registry_composition';
}

// ---------------------------------------------------------------------------
// Problem Input Validation Result
// ---------------------------------------------------------------------------

export interface ProblemInputValidationResult {
  readonly valid: boolean;
  readonly errors: readonly ProblemValidationError[];
  readonly checkedAt: 'problem_input_composition';
}

// ---------------------------------------------------------------------------
// Narrative Artifact With Problems Validation Result
// ---------------------------------------------------------------------------

export interface NarrativeArtifactWithProblemsValidationResult {
  readonly valid: boolean;
  readonly errors: readonly ProblemValidationError[];
  readonly checkedAt: 'narrative_artifact_with_problems_composition';
}

// ============================================================================
// D6-OPT-04 — Analogy, Metaphor & Intuition Modeling
// ============================================================================

// ---------------------------------------------------------------------------
// Canonical Analogy Types (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_ANALOGY_TYPES = [
  'structural',
  'functional',
  'behavioral',
  'mechanical',
  'physical',
  'biological',
  'mathematical',
  'computational',
  'everyday_life',
  'historical',
] as const;

export type AnalogyType = (typeof CANONICAL_ANALOGY_TYPES)[number];

// ---------------------------------------------------------------------------
// Canonical Metaphor Types (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_METAPHOR_TYPES = [
  'journey',
  'construction',
  'flow',
  'container',
  'network',
  'ecosystem',
  'toolbox',
  'machine',
  'language',
  'navigation',
] as const;

export type MetaphorType = (typeof CANONICAL_METAPHOR_TYPES)[number];

// ---------------------------------------------------------------------------
// Canonical Intuition Types (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_INTUITION_TYPES = [
  'visual',
  'spatial',
  'physical',
  'numerical',
  'behavioral',
  'causal',
  'comparative',
  'incremental',
  'probabilistic',
  'systems',
] as const;

export type IntuitionType = (typeof CANONICAL_INTUITION_TYPES)[number];

// ---------------------------------------------------------------------------
// Canonical Concept Mapping Types (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_MAPPING_TYPES = [
  'one_to_one',
  'one_to_many',
  'many_to_one',
  'behavior_mapping',
  'structure_mapping',
  'role_mapping',
  'process_mapping',
  'constraint_mapping',
  'component_mapping',
  'system_mapping',
] as const;

export type MappingType = (typeof CANONICAL_MAPPING_TYPES)[number];

// ---------------------------------------------------------------------------
// Canonical Abstraction Levels (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_ABSTRACTION_LEVELS = [
  'concrete',
  'observable',
  'practical',
  'operational',
  'conceptual',
  'algorithmic',
  'mathematical',
  'architectural',
  'theoretical',
  'research',
] as const;

export type AbstractionLevel = (typeof CANONICAL_ABSTRACTION_LEVELS)[number];

// ---------------------------------------------------------------------------
// Canonical Analogy Status (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_ANALOGY_STATUS = [
  'draft',
  'review',
  'approved',
  'published',
  'deprecated',
  'archived',
] as const;

export type AnalogyStatus = (typeof CANONICAL_ANALOGY_STATUS)[number];

// ---------------------------------------------------------------------------
// Analogy Provenance
// ---------------------------------------------------------------------------

export interface AnalogyProvenance {
  readonly source: string;
  readonly governanceStatus: NarrativeGovernanceStatus;
  readonly providedBy: string;
  readonly rationale: string;
}

// ---------------------------------------------------------------------------
// Analogy
// ---------------------------------------------------------------------------

export interface Analogy {
  readonly analogyId: string;
  readonly analogyType: AnalogyType;
  readonly title: string;
  readonly description: string;
  readonly sourceConceptId: string;
  readonly targetConceptId: string;
  readonly mappingId: string;
  readonly abstractionLevel: AbstractionLevel;
  readonly governanceStatus: NarrativeGovernanceStatus;
  readonly provenance: AnalogyProvenance;
}

// ---------------------------------------------------------------------------
// Metaphor
// ---------------------------------------------------------------------------

export interface Metaphor {
  readonly metaphorId: string;
  readonly metaphorType: MetaphorType;
  readonly title: string;
  readonly description: string;
  readonly relatedAnalogyId: string;
  readonly governanceStatus: NarrativeGovernanceStatus;
  readonly provenance: AnalogyProvenance;
}

// ---------------------------------------------------------------------------
// Intuition
// ---------------------------------------------------------------------------

export interface Intuition {
  readonly intuitionId: string;
  readonly intuitionType: IntuitionType;
  readonly title: string;
  readonly description: string;
  readonly supportedConceptId: string;
  readonly abstractionLevel: AbstractionLevel;
  readonly governanceStatus: NarrativeGovernanceStatus;
  readonly provenance: AnalogyProvenance;
}

// ---------------------------------------------------------------------------
// Concept Mapping
// ---------------------------------------------------------------------------

export interface ConceptMapping {
  readonly mappingId: string;
  readonly mappingType: MappingType;
  readonly sourceArtifactId: string;
  readonly targetArtifactId: string;
  readonly description: string;
  readonly governanceStatus: NarrativeGovernanceStatus;
  readonly provenance: AnalogyProvenance;
}

// ---------------------------------------------------------------------------
// Cognitive Bridge
// ---------------------------------------------------------------------------

export interface CognitiveBridge {
  readonly bridgeId: string;
  readonly analogyId: string;
  readonly metaphorId: string;
  readonly intuitionId: string;
  readonly mappingId: string;
  readonly bridgePurpose: string;
  readonly governanceStatus: NarrativeGovernanceStatus;
  readonly provenance: AnalogyProvenance;
}

// ---------------------------------------------------------------------------
// Analogy Decision
// ---------------------------------------------------------------------------

export interface AnalogyDecision {
  readonly decisionId: string;
  readonly analogyId: string;
  readonly validationPassed: boolean;
  readonly validationErrors: readonly string[];
}

// ---------------------------------------------------------------------------
// Analogy Trace
// ---------------------------------------------------------------------------

export interface AnalogyTrace {
  readonly traceId: string;
  readonly decisionCount: number;
  readonly validationCount: number;
  readonly analogyCount: number;
  readonly metaphorCount: number;
  readonly intuitionCount: number;
  readonly mappingCount: number;
  readonly bridgeCount: number;
  readonly registryVersion: string;
  readonly pipelineVersion: string;
  readonly compositionMetadata: Readonly<Record<string, unknown>>;
  readonly deterministicMetadata: Readonly<Record<string, unknown>>;
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_analogy_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Analogy Registry Metadata
// ---------------------------------------------------------------------------

export interface AnalogyRegistryMetadata {
  readonly registryId: string;
  readonly analogyCount: number;
  readonly metaphorCount: number;
  readonly intuitionCount: number;
  readonly mappingCount: number;
  readonly bridgeCount: number;
}

// ---------------------------------------------------------------------------
// Analogy Registry
// ---------------------------------------------------------------------------

export interface AnalogyRegistry {
  readonly registryId: string;
  readonly analogies: readonly Analogy[];
  readonly metaphors: readonly Metaphor[];
  readonly intuitions: readonly Intuition[];
  readonly mappings: readonly ConceptMapping[];
  readonly bridges: readonly CognitiveBridge[];
  readonly metadata: AnalogyRegistryMetadata;
  readonly trace: AnalogyTrace;
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_analogy_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Analogy Input
// ---------------------------------------------------------------------------

export interface AnalogyInput {
  readonly analogies: readonly Analogy[];
  readonly metaphors: readonly Metaphor[];
  readonly intuitions: readonly Intuition[];
  readonly mappings: readonly ConceptMapping[];
  readonly bridges: readonly CognitiveBridge[];
}

// ---------------------------------------------------------------------------
// Narrative Artifact With Analogies
// ---------------------------------------------------------------------------

export interface NarrativeArtifactWithAnalogies {
  readonly narrativeId: string;
  readonly title: string;
  readonly unitType: NarrativeUnitType;
  readonly narrativeMode: NarrativeMode;
  readonly domain: NarrativeDomain;
  readonly status: NarrativeStatus;
  readonly canonicalKnowledgeId: string;
  readonly curriculumNodeId: string;
  readonly lessonId: string;
  readonly laboratoryId: string;
  readonly sequenceOrder: number;
  readonly summary: string;
  readonly tags: readonly string[];
  readonly provenance: NarrativeProvenance;
  readonly analogies: readonly Analogy[];
  readonly metaphors: readonly Metaphor[];
  readonly intuitions: readonly Intuition[];
  readonly mappings: readonly ConceptMapping[];
  readonly bridges: readonly CognitiveBridge[];
}

// ---------------------------------------------------------------------------
// Analogy Validation Error
// ---------------------------------------------------------------------------

export interface AnalogyValidationError {
  readonly code: string;
  readonly message: string;
  readonly field?: string;
  readonly analogyId?: string;
  readonly metaphorId?: string;
  readonly intuitionId?: string;
  readonly mappingId?: string;
  readonly bridgeId?: string;
}

// ---------------------------------------------------------------------------
// Analogy Validation Result
// ---------------------------------------------------------------------------

export interface AnalogyValidationResult {
  readonly valid: boolean;
  readonly errors: readonly AnalogyValidationError[];
}

// ---------------------------------------------------------------------------
// Analogy Validation Result (specific)
// ---------------------------------------------------------------------------

export interface AnalogyUnitValidationResult {
  readonly valid: boolean;
  readonly errors: readonly AnalogyValidationError[];
  readonly checkedAt: 'analogy_composition';
}

// ---------------------------------------------------------------------------
// Metaphor Validation Result
// ---------------------------------------------------------------------------

export interface MetaphorValidationResult {
  readonly valid: boolean;
  readonly errors: readonly AnalogyValidationError[];
  readonly checkedAt: 'metaphor_composition';
}

// ---------------------------------------------------------------------------
// Intuition Validation Result
// ---------------------------------------------------------------------------

export interface IntuitionValidationResult {
  readonly valid: boolean;
  readonly errors: readonly AnalogyValidationError[];
  readonly checkedAt: 'intuition_composition';
}

// ---------------------------------------------------------------------------
// Concept Mapping Validation Result
// ---------------------------------------------------------------------------

export interface ConceptMappingValidationResult {
  readonly valid: boolean;
  readonly errors: readonly AnalogyValidationError[];
  readonly checkedAt: 'concept_mapping_composition';
}

// ---------------------------------------------------------------------------
// Cognitive Bridge Validation Result
// ---------------------------------------------------------------------------

export interface CognitiveBridgeValidationResult {
  readonly valid: boolean;
  readonly errors: readonly AnalogyValidationError[];
  readonly checkedAt: 'cognitive_bridge_composition';
}

// ---------------------------------------------------------------------------
// Analogy Registry Validation Result
// ---------------------------------------------------------------------------

export interface AnalogyRegistryValidationResult {
  readonly valid: boolean;
  readonly errors: readonly AnalogyValidationError[];
  readonly checkedAt: 'analogy_registry_composition';
}

// ---------------------------------------------------------------------------
// Analogy Input Validation Result
// ---------------------------------------------------------------------------

export interface AnalogyInputValidationResult {
  readonly valid: boolean;
  readonly errors: readonly AnalogyValidationError[];
  readonly checkedAt: 'analogy_input_composition';
}

// ---------------------------------------------------------------------------
// Narrative Artifact With Analogies Validation Result
// ---------------------------------------------------------------------------

export interface NarrativeArtifactWithAnalogiesValidationResult {
  readonly valid: boolean;
  readonly errors: readonly AnalogyValidationError[];
  readonly checkedAt: 'narrative_artifact_with_analogies_composition';
}

// ============================================================================
// D6-OPT-05 — Story Arc, Cognitive Progression & Narrative Flow Modeling
// ============================================================================

// ---------------------------------------------------------------------------
// Canonical Story Arc Types (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_STORY_ARC_TYPES = [
  'classical',
  'engineering',
  'scientific_discovery',
  'historical',
  'investigation',
  'problem_solution',
  'incremental_learning',
  'comparison',
  'exploration',
  'research',
] as const;

export type StoryArcType = (typeof CANONICAL_STORY_ARC_TYPES)[number];

// ---------------------------------------------------------------------------
// Canonical Narrative Stages (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_NARRATIVE_STAGES = [
  'hook',
  'context',
  'problem',
  'motivation',
  'intuition',
  'development',
  'deepening',
  'application',
  'synthesis',
  'conclusion',
] as const;

export type NarrativeStageType = (typeof CANONICAL_NARRATIVE_STAGES)[number];

// ---------------------------------------------------------------------------
// Canonical Transition Types (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_TRANSITION_TYPES = [
  'context_shift',
  'zoom_in',
  'zoom_out',
  'analogy_transition',
  'comparison_transition',
  'historical_transition',
  'mathematical_transition',
  'implementation_transition',
  'reflection_transition',
  'summary_transition',
] as const;

export type TransitionType = (typeof CANONICAL_TRANSITION_TYPES)[number];

// ---------------------------------------------------------------------------
// Canonical Cognitive Progression Types (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_COGNITIVE_PROGRESSIONS = [
  'observation_to_pattern',
  'pattern_to_concept',
  'concept_to_model',
  'model_to_algorithm',
  'algorithm_to_system',
  'simple_to_complex',
  'known_to_unknown',
  'concrete_to_abstract',
  'intuition_to_formalism',
  'theory_to_practice',
] as const;

export type CognitiveProgressionType = (typeof CANONICAL_COGNITIVE_PROGRESSIONS)[number];

// ---------------------------------------------------------------------------
// Canonical Attention Shift Types (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_ATTENTION_SHIFT_TYPES = [
  'focus_problem',
  'focus_solution',
  'focus_visualization',
  'focus_equation',
  'focus_algorithm',
  'focus_history',
  'focus_application',
  'focus_limitation',
  'focus_tradeoff',
  'focus_summary',
] as const;

export type AttentionShiftType = (typeof CANONICAL_ATTENTION_SHIFT_TYPES)[number];

// ---------------------------------------------------------------------------
// Canonical Story Flow Status (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_STORY_FLOW_STATUS = [
  'draft',
  'review',
  'approved',
  'published',
  'deprecated',
  'archived',
] as const;

export type StoryFlowStatus = (typeof CANONICAL_STORY_FLOW_STATUS)[number];

// ---------------------------------------------------------------------------
// Story Arc Provenance
// ---------------------------------------------------------------------------

export interface StoryArcProvenance {
  readonly source: string;
  readonly governanceStatus: NarrativeGovernanceStatus;
  readonly providedBy: string;
  readonly rationale: string;
}

// ---------------------------------------------------------------------------
// Story Arc
// ---------------------------------------------------------------------------

export interface StoryArc {
  readonly storyArcId: string;
  readonly storyArcType: StoryArcType;
  readonly title: string;
  readonly stageIds: readonly string[];
  readonly flowId: string;
  readonly governanceStatus: NarrativeGovernanceStatus;
  readonly provenance: StoryArcProvenance;
}

// ---------------------------------------------------------------------------
// Narrative Stage
// ---------------------------------------------------------------------------

export interface NarrativeStage {
  readonly stageId: string;
  readonly stageType: NarrativeStageType;
  readonly title: string;
  readonly description: string;
  readonly order: number;
  readonly governanceStatus: NarrativeGovernanceStatus;
  readonly provenance: StoryArcProvenance;
}

// ---------------------------------------------------------------------------
// Narrative Transition
// ---------------------------------------------------------------------------

export interface NarrativeTransition {
  readonly transitionId: string;
  readonly transitionType: TransitionType;
  readonly sourceStageId: string;
  readonly targetStageId: string;
  readonly description: string;
  readonly governanceStatus: NarrativeGovernanceStatus;
  readonly provenance: StoryArcProvenance;
}

// ---------------------------------------------------------------------------
// Cognitive Progression
// ---------------------------------------------------------------------------

export interface CognitiveProgression {
  readonly progressionId: string;
  readonly progressionType: CognitiveProgressionType;
  readonly sourceConceptId: string;
  readonly targetConceptId: string;
  readonly description: string;
  readonly governanceStatus: NarrativeGovernanceStatus;
  readonly provenance: StoryArcProvenance;
}

// ---------------------------------------------------------------------------
// Attention Shift
// ---------------------------------------------------------------------------

export interface AttentionShift {
  readonly shiftId: string;
  readonly shiftType: AttentionShiftType;
  readonly trigger: string;
  readonly destination: string;
  readonly description: string;
  readonly governanceStatus: NarrativeGovernanceStatus;
  readonly provenance: StoryArcProvenance;
}

// ---------------------------------------------------------------------------
// Narrative Flow
// ---------------------------------------------------------------------------

export interface NarrativeFlow {
  readonly flowId: string;
  readonly storyArcId: string;
  readonly transitionIds: readonly string[];
  readonly progressionIds: readonly string[];
  readonly attentionShiftIds: readonly string[];
  readonly governanceStatus: NarrativeGovernanceStatus;
  readonly provenance: StoryArcProvenance;
}

// ---------------------------------------------------------------------------
// Story Flow Decision
// ---------------------------------------------------------------------------

export interface StoryFlowDecision {
  readonly decisionId: string;
  readonly storyArcId: string;
  readonly validationPassed: boolean;
  readonly validationErrors: readonly string[];
}

// ---------------------------------------------------------------------------
// Story Flow Trace
// ---------------------------------------------------------------------------

export interface StoryFlowTrace {
  readonly traceId: string;
  readonly decisionCount: number;
  readonly validationCount: number;
  readonly storyArcCount: number;
  readonly stageCount: number;
  readonly transitionCount: number;
  readonly progressionCount: number;
  readonly attentionShiftCount: number;
  readonly flowCount: number;
  readonly registryVersion: string;
  readonly pipelineVersion: string;
  readonly compositionMetadata: Readonly<Record<string, unknown>>;
  readonly deterministicMetadata: Readonly<Record<string, unknown>>;
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_story_flow_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Story Flow Registry Metadata
// ---------------------------------------------------------------------------

export interface StoryFlowRegistryMetadata {
  readonly registryId: string;
  readonly storyArcCount: number;
  readonly stageCount: number;
  readonly transitionCount: number;
  readonly progressionCount: number;
  readonly attentionShiftCount: number;
  readonly flowCount: number;
}

// ---------------------------------------------------------------------------
// Story Flow Registry
// ---------------------------------------------------------------------------

export interface StoryFlowRegistry {
  readonly registryId: string;
  readonly storyArcs: readonly StoryArc[];
  readonly stages: readonly NarrativeStage[];
  readonly transitions: readonly NarrativeTransition[];
  readonly progressions: readonly CognitiveProgression[];
  readonly attentionShifts: readonly AttentionShift[];
  readonly flows: readonly NarrativeFlow[];
  readonly metadata: StoryFlowRegistryMetadata;
  readonly trace: StoryFlowTrace;
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_story_flow_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Story Flow Input
// ---------------------------------------------------------------------------

export interface StoryFlowInput {
  readonly storyArcs: readonly StoryArc[];
  readonly stages: readonly NarrativeStage[];
  readonly transitions: readonly NarrativeTransition[];
  readonly progressions: readonly CognitiveProgression[];
  readonly attentionShifts: readonly AttentionShift[];
  readonly flows: readonly NarrativeFlow[];
}

// ---------------------------------------------------------------------------
// Narrative Artifact With Story Flow
// ---------------------------------------------------------------------------

export interface NarrativeArtifactWithStoryFlow {
  readonly narrativeId: string;
  readonly title: string;
  readonly unitType: NarrativeUnitType;
  readonly narrativeMode: NarrativeMode;
  readonly domain: NarrativeDomain;
  readonly status: NarrativeStatus;
  readonly canonicalKnowledgeId: string;
  readonly curriculumNodeId: string;
  readonly lessonId: string;
  readonly laboratoryId: string;
  readonly sequenceOrder: number;
  readonly summary: string;
  readonly tags: readonly string[];
  readonly provenance: NarrativeProvenance;
  readonly storyArcs: readonly StoryArc[];
  readonly stages: readonly NarrativeStage[];
  readonly transitions: readonly NarrativeTransition[];
  readonly progressions: readonly CognitiveProgression[];
  readonly attentionShifts: readonly AttentionShift[];
  readonly flows: readonly NarrativeFlow[];
}

// ---------------------------------------------------------------------------
// Story Flow Validation Error
// ---------------------------------------------------------------------------

export interface StoryFlowValidationError {
  readonly code: string;
  readonly message: string;
  readonly field?: string;
  readonly storyArcId?: string;
  readonly stageId?: string;
  readonly transitionId?: string;
  readonly progressionId?: string;
  readonly shiftId?: string;
  readonly flowId?: string;
}

// ---------------------------------------------------------------------------
// Story Flow Validation Result
// ---------------------------------------------------------------------------

export interface StoryFlowValidationResult {
  readonly valid: boolean;
  readonly errors: readonly StoryFlowValidationError[];
}

// ---------------------------------------------------------------------------
// Story Arc Validation Result
// ---------------------------------------------------------------------------

export interface StoryArcValidationResult {
  readonly valid: boolean;
  readonly errors: readonly StoryFlowValidationError[];
  readonly checkedAt: 'story_arc_composition';
}

// ---------------------------------------------------------------------------
// Narrative Stage Validation Result
// ---------------------------------------------------------------------------

export interface NarrativeStageValidationResult {
  readonly valid: boolean;
  readonly errors: readonly StoryFlowValidationError[];
  readonly checkedAt: 'narrative_stage_composition';
}

// ---------------------------------------------------------------------------
// Narrative Transition Validation Result
// ---------------------------------------------------------------------------

export interface NarrativeTransitionValidationResult {
  readonly valid: boolean;
  readonly errors: readonly StoryFlowValidationError[];
  readonly checkedAt: 'narrative_transition_composition';
}

// ---------------------------------------------------------------------------
// Cognitive Progression Validation Result
// ---------------------------------------------------------------------------

export interface CognitiveProgressionValidationResult {
  readonly valid: boolean;
  readonly errors: readonly StoryFlowValidationError[];
  readonly checkedAt: 'cognitive_progression_composition';
}

// ---------------------------------------------------------------------------
// Attention Shift Validation Result
// ---------------------------------------------------------------------------

export interface AttentionShiftValidationResult {
  readonly valid: boolean;
  readonly errors: readonly StoryFlowValidationError[];
  readonly checkedAt: 'attention_shift_composition';
}

// ---------------------------------------------------------------------------
// Narrative Flow Validation Result
// ---------------------------------------------------------------------------

export interface NarrativeFlowValidationResult {
  readonly valid: boolean;
  readonly errors: readonly StoryFlowValidationError[];
  readonly checkedAt: 'narrative_flow_composition';
}

// ---------------------------------------------------------------------------
// Story Flow Registry Validation Result
// ---------------------------------------------------------------------------

export interface StoryFlowRegistryValidationResult {
  readonly valid: boolean;
  readonly errors: readonly StoryFlowValidationError[];
  readonly checkedAt: 'story_flow_registry_composition';
}

// ---------------------------------------------------------------------------
// Story Flow Input Validation Result
// ---------------------------------------------------------------------------

export interface StoryFlowInputValidationResult {
  readonly valid: boolean;
  readonly errors: readonly StoryFlowValidationError[];
  readonly checkedAt: 'story_flow_input_composition';
}

// ---------------------------------------------------------------------------
// Narrative Artifact With Story Flow Validation Result
// ---------------------------------------------------------------------------

export interface NarrativeArtifactWithStoryFlowValidationResult {
  readonly valid: boolean;
  readonly errors: readonly StoryFlowValidationError[];
  readonly checkedAt: 'narrative_artifact_with_story_flow_composition';
}

// ============================================================================
// D6-OPT-06 — Narrative Emotion, Curiosity & Engagement Modeling
// ============================================================================

// ---------------------------------------------------------------------------
// Canonical Curiosity Trigger Types (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_CURIOSITY_TRIGGER_TYPES = [
  'unexpected_result',
  'counterintuitive_fact',
  'historical_question',
  'engineering_problem',
  'scientific_mystery',
  'prediction_request',
  'comparison',
  'hidden_pattern',
  'future_application',
  'knowledge_gap',
] as const;

export type CuriosityTriggerType = (typeof CANONICAL_CURIOSITY_TRIGGER_TYPES)[number];

// ---------------------------------------------------------------------------
// Canonical Engagement Types (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_ENGAGEMENT_TYPES = [
  'active_prediction',
  'guided_observation',
  'concept_connection',
  'mental_simulation',
  'interactive_reflection',
  'progressive_discovery',
  'comparison',
  'problem_solving',
  'application',
  'synthesis',
] as const;

export type EngagementType = (typeof CANONICAL_ENGAGEMENT_TYPES)[number];

// ---------------------------------------------------------------------------
// Canonical Narrative Tension Types (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_NARRATIVE_TENSION_TYPES = [
  'unanswered_question',
  'knowledge_conflict',
  'engineering_tradeoff',
  'scientific_uncertainty',
  'mathematical_gap',
  'algorithmic_limitation',
  'unexpected_behavior',
  'performance_constraint',
  'design_decision',
  'conceptual_conflict',
] as const;

export type NarrativeTensionType = (typeof CANONICAL_NARRATIVE_TENSION_TYPES)[number];

// ---------------------------------------------------------------------------
// Canonical Surprise Types (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_SURPRISE_TYPES = [
  'counterintuitive',
  'historical',
  'experimental',
  'visual',
  'mathematical',
  'algorithmic',
  'performance',
  'comparison',
  'real_world',
  'research',
] as const;

export type SurpriseType = (typeof CANONICAL_SURPRISE_TYPES)[number];

// ---------------------------------------------------------------------------
// Canonical Intellectual Reward Types (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_REWARD_TYPES = [
  'problem_resolution',
  'conceptual_clarity',
  'pattern_recognition',
  'system_understanding',
  'algorithm_mastery',
  'visual_understanding',
  'mathematical_insight',
  'engineering_insight',
  'practical_application',
  'research_connection',
] as const;

export type IntellectualRewardType = (typeof CANONICAL_REWARD_TYPES)[number];

// ---------------------------------------------------------------------------
// Canonical Attention Recovery Types (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_ATTENTION_RECOVERY_TYPES = [
  'analogy',
  'visualization',
  'question',
  'example',
  'comparison',
  'laboratory_reference',
  'historical_context',
  'implementation',
  'real_world_case',
  'summary',
] as const;

export type AttentionRecoveryType = (typeof CANONICAL_ATTENTION_RECOVERY_TYPES)[number];

// ---------------------------------------------------------------------------
// Canonical Narrative Momentum Types (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_MOMENTUM_TYPES = [
  'steady',
  'accelerating',
  'deepening',
  'iterative',
  'exploratory',
  'comparative',
  'hierarchical',
  'convergent',
  'progressive',
  'reflective',
] as const;

export type NarrativeMomentumType = (typeof CANONICAL_MOMENTUM_TYPES)[number];

// ---------------------------------------------------------------------------
// Canonical Engagement Status (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_ENGAGEMENT_STATUS = [
  'draft',
  'review',
  'approved',
  'published',
  'deprecated',
  'archived',
] as const;

export type EngagementStatus = (typeof CANONICAL_ENGAGEMENT_STATUS)[number];

// ---------------------------------------------------------------------------
// Engagement Provenance
// ---------------------------------------------------------------------------

export interface EngagementProvenance {
  readonly source: string;
  readonly governanceStatus: NarrativeGovernanceStatus;
  readonly providedBy: string;
  readonly rationale: string;
}

// ---------------------------------------------------------------------------
// Curiosity Trigger
// ---------------------------------------------------------------------------

export interface CuriosityTrigger {
  readonly triggerId: string;
  readonly triggerType: CuriosityTriggerType;
  readonly title: string;
  readonly description: string;
  readonly relatedArtifactId: string;
  readonly governanceStatus: NarrativeGovernanceStatus;
  readonly provenance: EngagementProvenance;
}

// ---------------------------------------------------------------------------
// Engagement Point
// ---------------------------------------------------------------------------

export interface EngagementPoint {
  readonly engagementId: string;
  readonly engagementType: EngagementType;
  readonly title: string;
  readonly description: string;
  readonly relatedStageId: string;
  readonly governanceStatus: NarrativeGovernanceStatus;
  readonly provenance: EngagementProvenance;
}

// ---------------------------------------------------------------------------
// Narrative Tension
// ---------------------------------------------------------------------------

export interface NarrativeTension {
  readonly tensionId: string;
  readonly tensionType: NarrativeTensionType;
  readonly title: string;
  readonly description: string;
  readonly resolutionReferenceId: string;
  readonly governanceStatus: NarrativeGovernanceStatus;
  readonly provenance: EngagementProvenance;
}

// ---------------------------------------------------------------------------
// Surprise Moment
// ---------------------------------------------------------------------------

export interface SurpriseMoment {
  readonly surpriseId: string;
  readonly surpriseType: SurpriseType;
  readonly title: string;
  readonly description: string;
  readonly relatedArtifactId: string;
  readonly governanceStatus: NarrativeGovernanceStatus;
  readonly provenance: EngagementProvenance;
}

// ---------------------------------------------------------------------------
// Intellectual Reward
// ---------------------------------------------------------------------------

export interface IntellectualReward {
  readonly rewardId: string;
  readonly rewardType: IntellectualRewardType;
  readonly title: string;
  readonly description: string;
  readonly relatedConceptId: string;
  readonly governanceStatus: NarrativeGovernanceStatus;
  readonly provenance: EngagementProvenance;
}

// ---------------------------------------------------------------------------
// Attention Recovery
// ---------------------------------------------------------------------------

export interface AttentionRecovery {
  readonly recoveryId: string;
  readonly recoveryType: AttentionRecoveryType;
  readonly description: string;
  readonly relatedArtifactId: string;
  readonly governanceStatus: NarrativeGovernanceStatus;
  readonly provenance: EngagementProvenance;
}

// ---------------------------------------------------------------------------
// Narrative Momentum
// ---------------------------------------------------------------------------

export interface NarrativeMomentum {
  readonly momentumId: string;
  readonly momentumType: NarrativeMomentumType;
  readonly description: string;
  readonly relatedFlowId: string;
  readonly governanceStatus: NarrativeGovernanceStatus;
  readonly provenance: EngagementProvenance;
}

// ---------------------------------------------------------------------------
// Engagement Decision
// ---------------------------------------------------------------------------

export interface EngagementDecision {
  readonly decisionId: string;
  readonly engagementId: string;
  readonly validationPassed: boolean;
  readonly validationErrors: readonly string[];
}

// ---------------------------------------------------------------------------
// Engagement Trace
// ---------------------------------------------------------------------------

export interface EngagementTrace {
  readonly traceId: string;
  readonly decisionCount: number;
  readonly validationCount: number;
  readonly curiosityCount: number;
  readonly engagementCount: number;
  readonly tensionCount: number;
  readonly surpriseCount: number;
  readonly rewardCount: number;
  readonly attentionRecoveryCount: number;
  readonly momentumCount: number;
  readonly registryVersion: string;
  readonly pipelineVersion: string;
  readonly compositionMetadata: Readonly<Record<string, unknown>>;
  readonly deterministicMetadata: Readonly<Record<string, unknown>>;
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_engagement_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Engagement Registry Metadata
// ---------------------------------------------------------------------------

export interface EngagementRegistryMetadata {
  readonly registryId: string;
  readonly curiosityCount: number;
  readonly engagementCount: number;
  readonly tensionCount: number;
  readonly surpriseCount: number;
  readonly rewardCount: number;
  readonly attentionRecoveryCount: number;
  readonly momentumCount: number;
}

// ---------------------------------------------------------------------------
// Engagement Registry
// ---------------------------------------------------------------------------

export interface EngagementRegistry {
  readonly registryId: string;
  readonly curiosityTriggers: readonly CuriosityTrigger[];
  readonly engagementPoints: readonly EngagementPoint[];
  readonly tensions: readonly NarrativeTension[];
  readonly surprises: readonly SurpriseMoment[];
  readonly rewards: readonly IntellectualReward[];
  readonly recoveryEntries: readonly AttentionRecovery[];
  readonly momentumEntries: readonly NarrativeMomentum[];
  readonly metadata: EngagementRegistryMetadata;
  readonly trace: EngagementTrace;
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_engagement_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Engagement Input
// ---------------------------------------------------------------------------

export interface EngagementInput {
  readonly curiosityTriggers: readonly CuriosityTrigger[];
  readonly engagementPoints: readonly EngagementPoint[];
  readonly tensions: readonly NarrativeTension[];
  readonly surprises: readonly SurpriseMoment[];
  readonly rewards: readonly IntellectualReward[];
  readonly recoveryEntries: readonly AttentionRecovery[];
  readonly momentumEntries: readonly NarrativeMomentum[];
}

// ---------------------------------------------------------------------------
// Narrative Artifact With Engagement
// ---------------------------------------------------------------------------

export interface NarrativeArtifactWithEngagement {
  readonly narrativeId: string;
  readonly title: string;
  readonly unitType: NarrativeUnitType;
  readonly narrativeMode: NarrativeMode;
  readonly domain: NarrativeDomain;
  readonly status: NarrativeStatus;
  readonly canonicalKnowledgeId: string;
  readonly curriculumNodeId: string;
  readonly lessonId: string;
  readonly laboratoryId: string;
  readonly sequenceOrder: number;
  readonly summary: string;
  readonly tags: readonly string[];
  readonly provenance: NarrativeProvenance;
  readonly curiosityTriggers: readonly CuriosityTrigger[];
  readonly engagementPoints: readonly EngagementPoint[];
  readonly tensions: readonly NarrativeTension[];
  readonly surprises: readonly SurpriseMoment[];
  readonly rewards: readonly IntellectualReward[];
  readonly recoveryEntries: readonly AttentionRecovery[];
  readonly momentumEntries: readonly NarrativeMomentum[];
}

// ---------------------------------------------------------------------------
// Engagement Validation Error
// ---------------------------------------------------------------------------

export interface EngagementValidationError {
  readonly code: string;
  readonly message: string;
  readonly field?: string;
  readonly triggerId?: string;
  readonly engagementId?: string;
  readonly tensionId?: string;
  readonly surpriseId?: string;
  readonly rewardId?: string;
  readonly recoveryId?: string;
  readonly momentumId?: string;
}

// ---------------------------------------------------------------------------
// Engagement Validation Result
// ---------------------------------------------------------------------------

export interface EngagementValidationResult {
  readonly valid: boolean;
  readonly errors: readonly EngagementValidationError[];
}

// ---------------------------------------------------------------------------
// Curiosity Trigger Validation Result
// ---------------------------------------------------------------------------

export interface CuriosityTriggerValidationResult {
  readonly valid: boolean;
  readonly errors: readonly EngagementValidationError[];
  readonly checkedAt: 'curiosity_trigger_composition';
}

// ---------------------------------------------------------------------------
// Engagement Point Validation Result
// ---------------------------------------------------------------------------

export interface EngagementPointValidationResult {
  readonly valid: boolean;
  readonly errors: readonly EngagementValidationError[];
  readonly checkedAt: 'engagement_point_composition';
}

// ---------------------------------------------------------------------------
// Narrative Tension Validation Result
// ---------------------------------------------------------------------------

export interface NarrativeTensionValidationResult {
  readonly valid: boolean;
  readonly errors: readonly EngagementValidationError[];
  readonly checkedAt: 'narrative_tension_composition';
}

// ---------------------------------------------------------------------------
// Surprise Moment Validation Result
// ---------------------------------------------------------------------------

export interface SurpriseMomentValidationResult {
  readonly valid: boolean;
  readonly errors: readonly EngagementValidationError[];
  readonly checkedAt: 'surprise_moment_composition';
}

// ---------------------------------------------------------------------------
// Intellectual Reward Validation Result
// ---------------------------------------------------------------------------

export interface IntellectualRewardValidationResult {
  readonly valid: boolean;
  readonly errors: readonly EngagementValidationError[];
  readonly checkedAt: 'intellectual_reward_composition';
}

// ---------------------------------------------------------------------------
// Attention Recovery Validation Result
// ---------------------------------------------------------------------------

export interface AttentionRecoveryValidationResult {
  readonly valid: boolean;
  readonly errors: readonly EngagementValidationError[];
  readonly checkedAt: 'attention_recovery_composition';
}

// ---------------------------------------------------------------------------
// Narrative Momentum Validation Result
// ---------------------------------------------------------------------------

export interface NarrativeMomentumValidationResult {
  readonly valid: boolean;
  readonly errors: readonly EngagementValidationError[];
  readonly checkedAt: 'narrative_momentum_composition';
}

// ---------------------------------------------------------------------------
// Engagement Registry Validation Result
// ---------------------------------------------------------------------------

export interface EngagementRegistryValidationResult {
  readonly valid: boolean;
  readonly errors: readonly EngagementValidationError[];
  readonly checkedAt: 'engagement_registry_composition';
}

// ---------------------------------------------------------------------------
// Engagement Input Validation Result
// ---------------------------------------------------------------------------

export interface EngagementInputValidationResult {
  readonly valid: boolean;
  readonly errors: readonly EngagementValidationError[];
  readonly checkedAt: 'engagement_input_composition';
}

// ---------------------------------------------------------------------------
// Narrative Artifact With Engagement Validation Result
// ---------------------------------------------------------------------------

export interface NarrativeArtifactWithEngagementValidationResult {
  readonly valid: boolean;
  readonly errors: readonly EngagementValidationError[];
  readonly checkedAt: 'narrative_artifact_with_engagement_composition';
}

// ============================================================================
// D6-OPT-07 — Historical Context, Scientific Evolution & Discovery Timeline
// ============================================================================

// ---------------------------------------------------------------------------
// Canonical Historical Context Types (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_HISTORICAL_CONTEXT_TYPES = [
  'scientific',
  'engineering',
  'mathematical',
  'technological',
  'industrial',
  'academic',
  'societal',
  'computing',
  'research',
  'educational',
] as const;

export type HistoricalContextType = (typeof CANONICAL_HISTORICAL_CONTEXT_TYPES)[number];

// ---------------------------------------------------------------------------
// Canonical Discovery Types (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_DISCOVERY_TYPES = [
  'theory',
  'algorithm',
  'mathematical_result',
  'scientific_observation',
  'engineering_innovation',
  'software_breakthrough',
  'hardware_breakthrough',
  'dataset_creation',
  'experimental_result',
  'methodology',
] as const;

export type DiscoveryType = (typeof CANONICAL_DISCOVERY_TYPES)[number];

// ---------------------------------------------------------------------------
// Canonical Timeline Event Types (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_TIMELINE_EVENT_TYPES = [
  'publication',
  'discovery',
  'invention',
  'experiment',
  'algorithm_release',
  'framework_release',
  'dataset_release',
  'standardization',
  'research_breakthrough',
  'historical_event',
] as const;

export type TimelineEventType = (typeof CANONICAL_TIMELINE_EVENT_TYPES)[number];

// ---------------------------------------------------------------------------
// Canonical Evolution Types (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_EVOLUTION_TYPES = [
  'incremental',
  'iterative',
  'revolutionary',
  'theoretical',
  'experimental',
  'technological',
  'algorithmic',
  'computational',
  'interdisciplinary',
  'educational',
] as const;

export type EvolutionType = (typeof CANONICAL_EVOLUTION_TYPES)[number];

// ---------------------------------------------------------------------------
// Canonical Milestone Types (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_MILESTONE_TYPES = [
  'foundational',
  'major_breakthrough',
  'optimization',
  'standardization',
  'industrial_adoption',
  'academic_acceptance',
  'research_expansion',
  'tool_creation',
  'paradigm_change',
  'modernization',
] as const;

export type MilestoneType = (typeof CANONICAL_MILESTONE_TYPES)[number];

// ---------------------------------------------------------------------------
// Canonical Influence Types (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_INFLUENCE_TYPES = [
  'inspired',
  'extended',
  'replaced',
  'optimized',
  'formalized',
  'validated',
  'generalized',
  'simplified',
  'popularized',
  'enabled',
] as const;

export type InfluenceType = (typeof CANONICAL_INFLUENCE_TYPES)[number];

// ---------------------------------------------------------------------------
// Canonical Paradigm Shift Types (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_PARADIGM_SHIFT_TYPES = [
  'theoretical',
  'engineering',
  'computational',
  'algorithmic',
  'scientific',
  'methodological',
  'architectural',
  'educational',
  'industrial',
  'research',
] as const;

export type ParadigmShiftType = (typeof CANONICAL_PARADIGM_SHIFT_TYPES)[number];

// ---------------------------------------------------------------------------
// Canonical History Status (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_HISTORY_STATUS = [
  'draft',
  'review',
  'approved',
  'published',
  'deprecated',
  'archived',
] as const;

export type HistoryStatus = (typeof CANONICAL_HISTORY_STATUS)[number];

// ---------------------------------------------------------------------------
// Historical Provenance
// ---------------------------------------------------------------------------

export interface HistoricalProvenance {
  readonly source: string;
  readonly governanceStatus: NarrativeGovernanceStatus;
  readonly providedBy: string;
  readonly rationale: string;
}

// ---------------------------------------------------------------------------
// Historical Context
// ---------------------------------------------------------------------------

export interface HistoricalContext {
  readonly contextId: string;
  readonly contextType: HistoricalContextType;
  readonly title: string;
  readonly description: string;
  readonly timePeriod: string;
  readonly relatedArtifactId: string;
  readonly governanceStatus: NarrativeGovernanceStatus;
  readonly provenance: HistoricalProvenance;
}

// ---------------------------------------------------------------------------
// Scientific Discovery
// ---------------------------------------------------------------------------

export interface ScientificDiscovery {
  readonly discoveryId: string;
  readonly discoveryType: DiscoveryType;
  readonly title: string;
  readonly description: string;
  readonly year: number;
  readonly relatedConceptId: string;
  readonly governanceStatus: NarrativeGovernanceStatus;
  readonly provenance: HistoricalProvenance;
}

// ---------------------------------------------------------------------------
// Timeline Event
// ---------------------------------------------------------------------------

export interface TimelineEvent {
  readonly eventId: string;
  readonly eventType: TimelineEventType;
  readonly year: number;
  readonly title: string;
  readonly description: string;
  readonly relatedDiscoveryId: string;
  readonly governanceStatus: NarrativeGovernanceStatus;
  readonly provenance: HistoricalProvenance;
}

// ---------------------------------------------------------------------------
// Scientific Evolution
// ---------------------------------------------------------------------------

export interface ScientificEvolution {
  readonly evolutionId: string;
  readonly evolutionType: EvolutionType;
  readonly sourceArtifactId: string;
  readonly targetArtifactId: string;
  readonly description: string;
  readonly governanceStatus: NarrativeGovernanceStatus;
  readonly provenance: HistoricalProvenance;
}

// ---------------------------------------------------------------------------
// Milestone
// ---------------------------------------------------------------------------

export interface Milestone {
  readonly milestoneId: string;
  readonly milestoneType: MilestoneType;
  readonly title: string;
  readonly description: string;
  readonly relatedTimelineId: string;
  readonly governanceStatus: NarrativeGovernanceStatus;
  readonly provenance: HistoricalProvenance;
}

// ---------------------------------------------------------------------------
// Influence Chain
// ---------------------------------------------------------------------------

export interface InfluenceChain {
  readonly influenceId: string;
  readonly influenceType: InfluenceType;
  readonly sourceArtifactId: string;
  readonly targetArtifactId: string;
  readonly description: string;
  readonly governanceStatus: NarrativeGovernanceStatus;
  readonly provenance: HistoricalProvenance;
}

// ---------------------------------------------------------------------------
// Paradigm Shift
// ---------------------------------------------------------------------------

export interface ParadigmShift {
  readonly shiftId: string;
  readonly shiftType: ParadigmShiftType;
  readonly title: string;
  readonly description: string;
  readonly affectedDomain: string;
  readonly governanceStatus: NarrativeGovernanceStatus;
  readonly provenance: HistoricalProvenance;
}

// ---------------------------------------------------------------------------
// Historical Decision
// ---------------------------------------------------------------------------

export interface HistoricalDecision {
  readonly decisionId: string;
  readonly historicalId: string;
  readonly validationPassed: boolean;
  readonly validationErrors: readonly string[];
}

// ---------------------------------------------------------------------------
// Historical Trace
// ---------------------------------------------------------------------------

export interface HistoricalTrace {
  readonly traceId: string;
  readonly decisionCount: number;
  readonly validationCount: number;
  readonly historicalContextCount: number;
  readonly discoveryCount: number;
  readonly timelineEventCount: number;
  readonly evolutionCount: number;
  readonly milestoneCount: number;
  readonly influenceCount: number;
  readonly paradigmShiftCount: number;
  readonly registryVersion: string;
  readonly pipelineVersion: string;
  readonly compositionMetadata: Readonly<Record<string, unknown>>;
  readonly deterministicMetadata: Readonly<Record<string, unknown>>;
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_historical_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Historical Registry Metadata
// ---------------------------------------------------------------------------

export interface HistoricalRegistryMetadata {
  readonly registryId: string;
  readonly historicalContextCount: number;
  readonly discoveryCount: number;
  readonly timelineEventCount: number;
  readonly evolutionCount: number;
  readonly milestoneCount: number;
  readonly influenceCount: number;
  readonly paradigmShiftCount: number;
}

// ---------------------------------------------------------------------------
// Historical Registry
// ---------------------------------------------------------------------------

export interface HistoricalRegistry {
  readonly registryId: string;
  readonly historicalContexts: readonly HistoricalContext[];
  readonly discoveries: readonly ScientificDiscovery[];
  readonly timelineEvents: readonly TimelineEvent[];
  readonly evolutions: readonly ScientificEvolution[];
  readonly milestones: readonly Milestone[];
  readonly influenceChains: readonly InfluenceChain[];
  readonly paradigmShifts: readonly ParadigmShift[];
  readonly metadata: HistoricalRegistryMetadata;
  readonly trace: HistoricalTrace;
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_historical_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Historical Input
// ---------------------------------------------------------------------------

export interface HistoricalInput {
  readonly historicalContexts: readonly HistoricalContext[];
  readonly discoveries: readonly ScientificDiscovery[];
  readonly timelineEvents: readonly TimelineEvent[];
  readonly evolutions: readonly ScientificEvolution[];
  readonly milestones: readonly Milestone[];
  readonly influenceChains: readonly InfluenceChain[];
  readonly paradigmShifts: readonly ParadigmShift[];
}

// ---------------------------------------------------------------------------
// Narrative Artifact With History
// ---------------------------------------------------------------------------

export interface NarrativeArtifactWithHistory {
  readonly narrativeId: string;
  readonly title: string;
  readonly unitType: NarrativeUnitType;
  readonly narrativeMode: NarrativeMode;
  readonly domain: NarrativeDomain;
  readonly status: NarrativeStatus;
  readonly canonicalKnowledgeId: string;
  readonly curriculumNodeId: string;
  readonly lessonId: string;
  readonly laboratoryId: string;
  readonly sequenceOrder: number;
  readonly summary: string;
  readonly tags: readonly string[];
  readonly provenance: NarrativeProvenance;
  readonly historicalContexts: readonly HistoricalContext[];
  readonly discoveries: readonly ScientificDiscovery[];
  readonly timelineEvents: readonly TimelineEvent[];
  readonly evolutions: readonly ScientificEvolution[];
  readonly milestones: readonly Milestone[];
  readonly influenceChains: readonly InfluenceChain[];
  readonly paradigmShifts: readonly ParadigmShift[];
}

// ---------------------------------------------------------------------------
// Historical Validation Error
// ---------------------------------------------------------------------------

export interface HistoricalValidationError {
  readonly code: string;
  readonly message: string;
  readonly field?: string;
  readonly contextId?: string;
  readonly discoveryId?: string;
  readonly eventId?: string;
  readonly evolutionId?: string;
  readonly milestoneId?: string;
  readonly influenceId?: string;
  readonly shiftId?: string;
}

// ---------------------------------------------------------------------------
// Historical Validation Result
// ---------------------------------------------------------------------------

export interface HistoricalValidationResult {
  readonly valid: boolean;
  readonly errors: readonly HistoricalValidationError[];
}

// ---------------------------------------------------------------------------
// Specific Validation Results
// ---------------------------------------------------------------------------

export interface HistoricalContextValidationResult {
  readonly valid: boolean;
  readonly errors: readonly HistoricalValidationError[];
  readonly checkedAt: 'historical_context_composition';
}

export interface ScientificDiscoveryValidationResult {
  readonly valid: boolean;
  readonly errors: readonly HistoricalValidationError[];
  readonly checkedAt: 'scientific_discovery_composition';
}

export interface TimelineEventValidationResult {
  readonly valid: boolean;
  readonly errors: readonly HistoricalValidationError[];
  readonly checkedAt: 'timeline_event_composition';
}

export interface ScientificEvolutionValidationResult {
  readonly valid: boolean;
  readonly errors: readonly HistoricalValidationError[];
  readonly checkedAt: 'scientific_evolution_composition';
}

export interface MilestoneValidationResult {
  readonly valid: boolean;
  readonly errors: readonly HistoricalValidationError[];
  readonly checkedAt: 'milestone_composition';
}

export interface InfluenceChainValidationResult {
  readonly valid: boolean;
  readonly errors: readonly HistoricalValidationError[];
  readonly checkedAt: 'influence_chain_composition';
}

export interface ParadigmShiftValidationResult {
  readonly valid: boolean;
  readonly errors: readonly HistoricalValidationError[];
  readonly checkedAt: 'paradigm_shift_composition';
}

export interface HistoricalRegistryValidationResult {
  readonly valid: boolean;
  readonly errors: readonly HistoricalValidationError[];
  readonly checkedAt: 'historical_registry_composition';
}

export interface HistoricalInputValidationResult {
  readonly valid: boolean;
  readonly errors: readonly HistoricalValidationError[];
  readonly checkedAt: 'historical_input_composition';
}

export interface NarrativeArtifactWithHistoryValidationResult {
  readonly valid: boolean;
  readonly errors: readonly HistoricalValidationError[];
  readonly checkedAt: 'narrative_artifact_with_history_composition';
}

// ============================================================================
// D6-OPT-08 — Application-Driven Context & Real-World Relevance Modeling
// ============================================================================

// ---------------------------------------------------------------------------
// Canonical Application Types (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_APPLICATION_TYPES = [
  'industrial',
  'scientific',
  'engineering',
  'academic',
  'commercial',
  'medical',
  'environmental',
  'robotics',
  'computer_vision',
  'artificial_intelligence',
] as const;

export type ApplicationType = (typeof CANONICAL_APPLICATION_TYPES)[number];

// ---------------------------------------------------------------------------
// Canonical Use Case Types (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_USE_CASE_TYPES = [
  'automation',
  'prediction',
  'classification',
  'optimization',
  'monitoring',
  'decision_support',
  'simulation',
  'quality_control',
  'research',
  'education',
] as const;

export type UseCaseType = (typeof CANONICAL_USE_CASE_TYPES)[number];

// ---------------------------------------------------------------------------
// Canonical Industry Types (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_INDUSTRY_TYPES = [
  'manufacturing',
  'healthcare',
  'agriculture',
  'finance',
  'transportation',
  'energy',
  'telecommunications',
  'education',
  'aerospace',
  'software',
] as const;

export type IndustryType = (typeof CANONICAL_INDUSTRY_TYPES)[number];

// ---------------------------------------------------------------------------
// Canonical Engineering Scenario Types (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_ENGINEERING_SCENARIO_TYPES = [
  'system_design',
  'performance_analysis',
  'resource_optimization',
  'failure_analysis',
  'algorithm_selection',
  'architecture_design',
  'deployment',
  'maintenance',
  'validation',
  'benchmarking',
] as const;

export type EngineeringScenarioType = (typeof CANONICAL_ENGINEERING_SCENARIO_TYPES)[number];

// ---------------------------------------------------------------------------
// Canonical Technology Adoption Types (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_ADOPTION_TYPES = [
  'research',
  'prototype',
  'pilot',
  'experimental',
  'production',
  'enterprise',
  'large_scale',
  'global',
  'legacy',
  'emerging',
] as const;

export type TechnologyAdoptionType = (typeof CANONICAL_ADOPTION_TYPES)[number];

// ---------------------------------------------------------------------------
// Canonical Practical Context Types (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_REAL_WORLD_CONTEXT_TYPES = [
  'daily_life',
  'industry',
  'research',
  'government',
  'education',
  'consumer_products',
  'scientific_laboratory',
  'healthcare',
  'infrastructure',
  'environment',
] as const;

export type RealWorldContextType = (typeof CANONICAL_REAL_WORLD_CONTEXT_TYPES)[number];

// ---------------------------------------------------------------------------
// Canonical Application Flow Types (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_APPLICATION_FLOW_TYPES = [
  'problem_to_solution',
  'theory_to_application',
  'algorithm_to_system',
  'concept_to_product',
  'research_to_industry',
  'experiment_to_deployment',
  'prototype_to_scale',
  'simulation_to_validation',
  'analysis_to_decision',
  'learning_to_practice',
] as const;

export type ApplicationFlowType = (typeof CANONICAL_APPLICATION_FLOW_TYPES)[number];

// ---------------------------------------------------------------------------
// Canonical Application Status (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_APPLICATION_STATUS = [
  'draft',
  'review',
  'approved',
  'published',
  'deprecated',
  'archived',
] as const;

export type ApplicationStatus = (typeof CANONICAL_APPLICATION_STATUS)[number];

// ---------------------------------------------------------------------------
// Application Provenance
// ---------------------------------------------------------------------------

export interface ApplicationProvenance {
  readonly source: string;
  readonly governanceStatus: NarrativeGovernanceStatus;
  readonly providedBy: string;
  readonly rationale: string;
}

// ---------------------------------------------------------------------------
// Application
// ---------------------------------------------------------------------------

export interface Application {
  readonly applicationId: string;
  readonly applicationType: ApplicationType;
  readonly title: string;
  readonly description: string;
  readonly relatedConceptId: string;
  readonly governanceStatus: NarrativeGovernanceStatus;
  readonly provenance: ApplicationProvenance;
}

// ---------------------------------------------------------------------------
// UseCase
// ---------------------------------------------------------------------------

export interface UseCase {
  readonly useCaseId: string;
  readonly useCaseType: UseCaseType;
  readonly title: string;
  readonly description: string;
  readonly applicationId: string;
  readonly governanceStatus: NarrativeGovernanceStatus;
  readonly provenance: ApplicationProvenance;
}

// ---------------------------------------------------------------------------
// IndustrialScenario
// ---------------------------------------------------------------------------

export interface IndustrialScenario {
  readonly scenarioId: string;
  readonly industryType: IndustryType;
  readonly title: string;
  readonly description: string;
  readonly relatedApplicationId: string;
  readonly governanceStatus: NarrativeGovernanceStatus;
  readonly provenance: ApplicationProvenance;
}

// ---------------------------------------------------------------------------
// EngineeringScenario
// ---------------------------------------------------------------------------

export interface EngineeringScenario {
  readonly engineeringScenarioId: string;
  readonly scenarioType: EngineeringScenarioType;
  readonly title: string;
  readonly description: string;
  readonly relatedApplicationId: string;
  readonly governanceStatus: NarrativeGovernanceStatus;
  readonly provenance: ApplicationProvenance;
}

// ---------------------------------------------------------------------------
// TechnologyAdoption
// ---------------------------------------------------------------------------

export interface TechnologyAdoption {
  readonly adoptionId: string;
  readonly adoptionType: TechnologyAdoptionType;
  readonly description: string;
  readonly relatedTechnologyId: string;
  readonly governanceStatus: NarrativeGovernanceStatus;
  readonly provenance: ApplicationProvenance;
}

// ---------------------------------------------------------------------------
// RealWorldContext
// ---------------------------------------------------------------------------

export interface RealWorldContext {
  readonly contextId: string;
  readonly contextType: RealWorldContextType;
  readonly title: string;
  readonly description: string;
  readonly relatedArtifactId: string;
  readonly governanceStatus: NarrativeGovernanceStatus;
  readonly provenance: ApplicationProvenance;
}

// ---------------------------------------------------------------------------
// ApplicationFlow
// ---------------------------------------------------------------------------

export interface ApplicationFlow {
  readonly flowId: string;
  readonly flowType: ApplicationFlowType;
  readonly applicationIds: readonly string[];
  readonly contextIds: readonly string[];
  readonly governanceStatus: NarrativeGovernanceStatus;
  readonly provenance: ApplicationProvenance;
}

// ---------------------------------------------------------------------------
// Application Decision
// ---------------------------------------------------------------------------

export interface ApplicationDecision {
  readonly decisionId: string;
  readonly applicationId: string;
  readonly validationPassed: boolean;
  readonly validationErrors: readonly string[];
}

// ---------------------------------------------------------------------------
// Application Trace
// ---------------------------------------------------------------------------

export interface ApplicationTrace {
  readonly traceId: string;
  readonly decisionCount: number;
  readonly validationCount: number;
  readonly applicationCount: number;
  readonly useCaseCount: number;
  readonly industrialScenarioCount: number;
  readonly engineeringScenarioCount: number;
  readonly technologyAdoptionCount: number;
  readonly contextCount: number;
  readonly flowCount: number;
  readonly registryVersion: string;
  readonly pipelineVersion: string;
  readonly compositionMetadata: Readonly<Record<string, unknown>>;
  readonly deterministicMetadata: Readonly<Record<string, unknown>>;
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_application_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Application Registry Metadata
// ---------------------------------------------------------------------------

export interface ApplicationRegistryMetadata {
  readonly registryId: string;
  readonly applicationCount: number;
  readonly useCaseCount: number;
  readonly industrialScenarioCount: number;
  readonly engineeringScenarioCount: number;
  readonly technologyAdoptionCount: number;
  readonly contextCount: number;
  readonly flowCount: number;
}

// ---------------------------------------------------------------------------
// Application Registry
// ---------------------------------------------------------------------------

export interface ApplicationRegistry {
  readonly registryId: string;
  readonly applications: readonly Application[];
  readonly useCases: readonly UseCase[];
  readonly industrialScenarios: readonly IndustrialScenario[];
  readonly engineeringScenarios: readonly EngineeringScenario[];
  readonly technologyAdoptions: readonly TechnologyAdoption[];
  readonly realWorldContexts: readonly RealWorldContext[];
  readonly applicationFlows: readonly ApplicationFlow[];
  readonly metadata: ApplicationRegistryMetadata;
  readonly trace: ApplicationTrace;
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_application_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Application Input
// ---------------------------------------------------------------------------

export interface ApplicationInput {
  readonly applications: readonly Application[];
  readonly useCases: readonly UseCase[];
  readonly industrialScenarios: readonly IndustrialScenario[];
  readonly engineeringScenarios: readonly EngineeringScenario[];
  readonly technologyAdoptions: readonly TechnologyAdoption[];
  readonly realWorldContexts: readonly RealWorldContext[];
  readonly applicationFlows: readonly ApplicationFlow[];
}

// ---------------------------------------------------------------------------
// Narrative Artifact With Applications
// ---------------------------------------------------------------------------

export interface NarrativeArtifactWithApplications {
  readonly narrativeId: string;
  readonly title: string;
  readonly unitType: NarrativeUnitType;
  readonly narrativeMode: NarrativeMode;
  readonly domain: NarrativeDomain;
  readonly status: NarrativeStatus;
  readonly canonicalKnowledgeId: string;
  readonly curriculumNodeId: string;
  readonly lessonId: string;
  readonly laboratoryId: string;
  readonly sequenceOrder: number;
  readonly summary: string;
  readonly tags: readonly string[];
  readonly provenance: NarrativeProvenance;
  readonly applications: readonly Application[];
  readonly useCases: readonly UseCase[];
  readonly industrialScenarios: readonly IndustrialScenario[];
  readonly engineeringScenarios: readonly EngineeringScenario[];
  readonly technologyAdoptions: readonly TechnologyAdoption[];
  readonly realWorldContexts: readonly RealWorldContext[];
  readonly applicationFlows: readonly ApplicationFlow[];
}

// ---------------------------------------------------------------------------
// Application Validation Error
// ---------------------------------------------------------------------------

export interface ApplicationValidationError {
  readonly code: string;
  readonly message: string;
  readonly field?: string;
  readonly applicationId?: string;
  readonly useCaseId?: string;
  readonly scenarioId?: string;
  readonly engineeringScenarioId?: string;
  readonly adoptionId?: string;
  readonly contextId?: string;
  readonly flowId?: string;
}

// ---------------------------------------------------------------------------
// Application Validation Result
// ---------------------------------------------------------------------------

export interface ApplicationValidationResult {
  readonly valid: boolean;
  readonly errors: readonly ApplicationValidationError[];
}

// ---------------------------------------------------------------------------
// Specific Validation Results
// ---------------------------------------------------------------------------

export interface ApplicationUnitValidationResult {
  readonly valid: boolean;
  readonly errors: readonly ApplicationValidationError[];
  readonly checkedAt: 'application_composition';
}

export interface UseCaseValidationResult {
  readonly valid: boolean;
  readonly errors: readonly ApplicationValidationError[];
  readonly checkedAt: 'use_case_composition';
}

export interface IndustrialScenarioValidationResult {
  readonly valid: boolean;
  readonly errors: readonly ApplicationValidationError[];
  readonly checkedAt: 'industrial_scenario_composition';
}

export interface EngineeringScenarioValidationResult {
  readonly valid: boolean;
  readonly errors: readonly ApplicationValidationError[];
  readonly checkedAt: 'engineering_scenario_composition';
}

export interface TechnologyAdoptionValidationResult {
  readonly valid: boolean;
  readonly errors: readonly ApplicationValidationError[];
  readonly checkedAt: 'technology_adoption_composition';
}

export interface RealWorldContextValidationResult {
  readonly valid: boolean;
  readonly errors: readonly ApplicationValidationError[];
  readonly checkedAt: 'real_world_context_composition';
}

export interface ApplicationFlowValidationResult {
  readonly valid: boolean;
  readonly errors: readonly ApplicationValidationError[];
  readonly checkedAt: 'application_flow_composition';
}

export interface ApplicationRegistryValidationResult {
  readonly valid: boolean;
  readonly errors: readonly ApplicationValidationError[];
  readonly checkedAt: 'application_registry_composition';
}

export interface ApplicationInputValidationResult {
  readonly valid: boolean;
  readonly errors: readonly ApplicationValidationError[];
  readonly checkedAt: 'application_input_composition';
}

export interface NarrativeArtifactWithApplicationsValidationResult {
  readonly valid: boolean;
  readonly errors: readonly ApplicationValidationError[];
  readonly checkedAt: 'narrative_artifact_with_applications_composition';
}

// ============================================================================
// D6-OPT-09 — Multi-Perspective Explanation & Alternative Viewpoint Modeling
// ============================================================================

// ---------------------------------------------------------------------------
// Canonical Perspective Types (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_PERSPECTIVE_TYPES = [
  'mathematical',
  'computational',
  'engineering',
  'scientific',
  'statistical',
  'physical',
  'algorithmic',
  'architectural',
  'implementation',
  'research',
] as const;

export type PerspectiveType = (typeof CANONICAL_PERSPECTIVE_TYPES)[number];

// ---------------------------------------------------------------------------
// Canonical Explanation Types (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_EXPLANATION_TYPES = [
  'formal',
  'intuitive',
  'visual',
  'practical',
  'historical',
  'algorithmic',
  'mathematical',
  'engineering',
  'comparative',
  'research',
] as const;

export type ExplanationType = (typeof CANONICAL_EXPLANATION_TYPES)[number];

// ---------------------------------------------------------------------------
// Canonical Alternative View Types (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_ALTERNATIVE_VIEW_TYPES = [
  'different_domain',
  'different_abstraction',
  'different_method',
  'different_algorithm',
  'different_history',
  'different_application',
  'different_visualization',
  'different_mathematics',
  'different_engineering',
  'different_research',
] as const;

export type AlternativeViewType = (typeof CANONICAL_ALTERNATIVE_VIEW_TYPES)[number];

// ---------------------------------------------------------------------------
// Canonical Disciplinary View Types (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_DISCIPLINARY_VIEW_TYPES = [
  'computer_science',
  'mathematics',
  'statistics',
  'physics',
  'engineering',
  'biology',
  'economics',
  'robotics',
  'artificial_intelligence',
  'software_engineering',
] as const;

export type DisciplinaryViewType = (typeof CANONICAL_DISCIPLINARY_VIEW_TYPES)[number];

// ---------------------------------------------------------------------------
// Canonical Abstraction Levels (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_EXPLANATION_ABSTRACTION_TYPES = [
  'concrete',
  'operational',
  'procedural',
  'conceptual',
  'structural',
  'systemic',
  'algorithmic',
  'formal',
  'theoretical',
  'research',
] as const;

export type ExplanationAbstractionType = (typeof CANONICAL_EXPLANATION_ABSTRACTION_TYPES)[number];

// ---------------------------------------------------------------------------
// Canonical Implementation View Types (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_IMPLEMENTATION_VIEW_TYPES = [
  'pseudocode',
  'python',
  'c_plus_plus',
  'mathematical_model',
  'block_diagram',
  'architecture',
  'pipeline',
  'api',
  'framework',
  'production_system',
] as const;

export type ImplementationViewType = (typeof CANONICAL_IMPLEMENTATION_VIEW_TYPES)[number];

// ---------------------------------------------------------------------------
// Canonical Perspective Flow Types (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_PERSPECTIVE_FLOW_TYPES = [
  'single_view',
  'progressive_views',
  'comparative_views',
  'parallel_views',
  'zoom_levels',
  'disciplinary_switch',
  'implementation_progression',
  'research_progression',
  'abstraction_progression',
  'integrated_views',
] as const;

export type PerspectiveFlowType = (typeof CANONICAL_PERSPECTIVE_FLOW_TYPES)[number];

// ---------------------------------------------------------------------------
// Canonical Perspective Status (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_PERSPECTIVE_STATUS = [
  'draft',
  'review',
  'approved',
  'published',
  'deprecated',
  'archived',
] as const;

export type PerspectiveStatus = (typeof CANONICAL_PERSPECTIVE_STATUS)[number];

// ---------------------------------------------------------------------------
// Perspective Provenance
// ---------------------------------------------------------------------------

export interface PerspectiveProvenance {
  readonly source: string;
  readonly governanceStatus: NarrativeGovernanceStatus;
  readonly providedBy: string;
  readonly rationale: string;
}

// ---------------------------------------------------------------------------
// Perspective
// ---------------------------------------------------------------------------

export interface Perspective {
  readonly perspectiveId: string;
  readonly perspectiveType: PerspectiveType;
  readonly title: string;
  readonly description: string;
  readonly relatedConceptId: string;
  readonly governanceStatus: NarrativeGovernanceStatus;
  readonly provenance: PerspectiveProvenance;
}

// ---------------------------------------------------------------------------
// ExplanationView
// ---------------------------------------------------------------------------

export interface ExplanationView {
  readonly viewId: string;
  readonly explanationType: ExplanationType;
  readonly title: string;
  readonly description: string;
  readonly perspectiveId: string;
  readonly governanceStatus: NarrativeGovernanceStatus;
  readonly provenance: PerspectiveProvenance;
}

// ---------------------------------------------------------------------------
// AlternativeView
// ---------------------------------------------------------------------------

export interface AlternativeView {
  readonly alternativeId: string;
  readonly alternativeType: AlternativeViewType;
  readonly sourceViewId: string;
  readonly targetViewId: string;
  readonly description: string;
  readonly governanceStatus: NarrativeGovernanceStatus;
  readonly provenance: PerspectiveProvenance;
}

// ---------------------------------------------------------------------------
// DisciplinaryView
// ---------------------------------------------------------------------------

export interface DisciplinaryView {
  readonly disciplinaryViewId: string;
  readonly disciplinaryType: DisciplinaryViewType;
  readonly title: string;
  readonly description: string;
  readonly relatedArtifactId: string;
  readonly governanceStatus: NarrativeGovernanceStatus;
  readonly provenance: PerspectiveProvenance;
}

// ---------------------------------------------------------------------------
// ImplementationView
// ---------------------------------------------------------------------------

export interface ImplementationView {
  readonly implementationViewId: string;
  readonly implementationType: ImplementationViewType;
  readonly title: string;
  readonly description: string;
  readonly relatedArtifactId: string;
  readonly governanceStatus: NarrativeGovernanceStatus;
  readonly provenance: PerspectiveProvenance;
}

// ---------------------------------------------------------------------------
// AbstractionView
// ---------------------------------------------------------------------------

export interface AbstractionView {
  readonly abstractionViewId: string;
  readonly abstractionType: ExplanationAbstractionType;
  readonly title: string;
  readonly description: string;
  readonly relatedArtifactId: string;
  readonly governanceStatus: NarrativeGovernanceStatus;
  readonly provenance: PerspectiveProvenance;
}

// ---------------------------------------------------------------------------
// PerspectiveFlow
// ---------------------------------------------------------------------------

export interface PerspectiveFlow {
  readonly flowId: string;
  readonly flowType: PerspectiveFlowType;
  readonly perspectiveIds: readonly string[];
  readonly viewIds: readonly string[];
  readonly governanceStatus: NarrativeGovernanceStatus;
  readonly provenance: PerspectiveProvenance;
}

// ---------------------------------------------------------------------------
// Perspective Decision
// ---------------------------------------------------------------------------

export interface PerspectiveDecision {
  readonly decisionId: string;
  readonly perspectiveId: string;
  readonly validationPassed: boolean;
  readonly validationErrors: readonly string[];
}

// ---------------------------------------------------------------------------
// Perspective Trace
// ---------------------------------------------------------------------------

export interface PerspectiveTrace {
  readonly traceId: string;
  readonly decisionCount: number;
  readonly validationCount: number;
  readonly perspectiveCount: number;
  readonly viewCount: number;
  readonly alternativeViewCount: number;
  readonly disciplinaryViewCount: number;
  readonly implementationViewCount: number;
  readonly abstractionViewCount: number;
  readonly flowCount: number;
  readonly registryVersion: string;
  readonly pipelineVersion: string;
  readonly compositionMetadata: Readonly<Record<string, unknown>>;
  readonly deterministicMetadata: Readonly<Record<string, unknown>>;
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_perspective_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Perspective Registry Metadata
// ---------------------------------------------------------------------------

export interface PerspectiveRegistryMetadata {
  readonly registryId: string;
  readonly perspectiveCount: number;
  readonly viewCount: number;
  readonly alternativeViewCount: number;
  readonly disciplinaryViewCount: number;
  readonly implementationViewCount: number;
  readonly abstractionViewCount: number;
  readonly flowCount: number;
}

// ---------------------------------------------------------------------------
// Perspective Registry
// ---------------------------------------------------------------------------

export interface PerspectiveRegistry {
  readonly registryId: string;
  readonly perspectives: readonly Perspective[];
  readonly explanationViews: readonly ExplanationView[];
  readonly alternativeViews: readonly AlternativeView[];
  readonly disciplinaryViews: readonly DisciplinaryView[];
  readonly implementationViews: readonly ImplementationView[];
  readonly abstractionViews: readonly AbstractionView[];
  readonly perspectiveFlows: readonly PerspectiveFlow[];
  readonly metadata: PerspectiveRegistryMetadata;
  readonly trace: PerspectiveTrace;
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_perspective_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Perspective Input
// ---------------------------------------------------------------------------

export interface PerspectiveInput {
  readonly perspectives: readonly Perspective[];
  readonly explanationViews: readonly ExplanationView[];
  readonly alternativeViews: readonly AlternativeView[];
  readonly disciplinaryViews: readonly DisciplinaryView[];
  readonly implementationViews: readonly ImplementationView[];
  readonly abstractionViews: readonly AbstractionView[];
  readonly perspectiveFlows: readonly PerspectiveFlow[];
}

// ---------------------------------------------------------------------------
// Narrative Artifact With Perspectives
// ---------------------------------------------------------------------------

export interface NarrativeArtifactWithPerspectives {
  readonly narrativeId: string;
  readonly title: string;
  readonly unitType: NarrativeUnitType;
  readonly narrativeMode: NarrativeMode;
  readonly domain: NarrativeDomain;
  readonly status: NarrativeStatus;
  readonly canonicalKnowledgeId: string;
  readonly curriculumNodeId: string;
  readonly lessonId: string;
  readonly laboratoryId: string;
  readonly sequenceOrder: number;
  readonly summary: string;
  readonly tags: readonly string[];
  readonly provenance: NarrativeProvenance;
  readonly perspectives: readonly Perspective[];
  readonly explanationViews: readonly ExplanationView[];
  readonly alternativeViews: readonly AlternativeView[];
  readonly disciplinaryViews: readonly DisciplinaryView[];
  readonly implementationViews: readonly ImplementationView[];
  readonly abstractionViews: readonly AbstractionView[];
  readonly perspectiveFlows: readonly PerspectiveFlow[];
}

// ---------------------------------------------------------------------------
// Perspective Validation Error
// ---------------------------------------------------------------------------

export interface PerspectiveValidationError {
  readonly code: string;
  readonly message: string;
  readonly field?: string;
  readonly perspectiveId?: string;
  readonly viewId?: string;
  readonly alternativeId?: string;
  readonly disciplinaryViewId?: string;
  readonly implementationViewId?: string;
  readonly abstractionViewId?: string;
  readonly flowId?: string;
}

// ---------------------------------------------------------------------------
// Perspective Validation Result
// ---------------------------------------------------------------------------

export interface PerspectiveValidationResult {
  readonly valid: boolean;
  readonly errors: readonly PerspectiveValidationError[];
}

// ---------------------------------------------------------------------------
// Specific Validation Results
// ---------------------------------------------------------------------------

export interface PerspectiveUnitValidationResult {
  readonly valid: boolean;
  readonly errors: readonly PerspectiveValidationError[];
  readonly checkedAt: 'perspective_composition';
}

export interface ExplanationViewValidationResult {
  readonly valid: boolean;
  readonly errors: readonly PerspectiveValidationError[];
  readonly checkedAt: 'explanation_view_composition';
}

export interface AlternativeViewValidationResult {
  readonly valid: boolean;
  readonly errors: readonly PerspectiveValidationError[];
  readonly checkedAt: 'alternative_view_composition';
}

export interface DisciplinaryViewValidationResult {
  readonly valid: boolean;
  readonly errors: readonly PerspectiveValidationError[];
  readonly checkedAt: 'disciplinary_view_composition';
}

export interface ImplementationViewValidationResult {
  readonly valid: boolean;
  readonly errors: readonly PerspectiveValidationError[];
  readonly checkedAt: 'implementation_view_composition';
}

export interface AbstractionViewValidationResult {
  readonly valid: boolean;
  readonly errors: readonly PerspectiveValidationError[];
  readonly checkedAt: 'abstraction_view_composition';
}

export interface PerspectiveFlowValidationResult {
  readonly valid: boolean;
  readonly errors: readonly PerspectiveValidationError[];
  readonly checkedAt: 'perspective_flow_composition';
}

export interface PerspectiveRegistryValidationResult {
  readonly valid: boolean;
  readonly errors: readonly PerspectiveValidationError[];
  readonly checkedAt: 'perspective_registry_composition';
}

export interface PerspectiveInputValidationResult {
  readonly valid: boolean;
  readonly errors: readonly PerspectiveValidationError[];
  readonly checkedAt: 'perspective_input_composition';
}

export interface NarrativeArtifactWithPerspectivesValidationResult {
  readonly valid: boolean;
  readonly errors: readonly PerspectiveValidationError[];
  readonly checkedAt: 'narrative_artifact_with_perspectives_composition';
}

// ============================================================================
// D6-OPT-10 — Narrative Composition Certification & Public Pipeline Facade
// ============================================================================

// ---------------------------------------------------------------------------
// Canonical Narrative Certification Status (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_NARRATIVE_CERTIFICATION_STATUS = [
  'certified',
  'certified_with_warnings',
  'needs_revision',
  'blocked',
] as const;

export type NarrativeCertificationStatus = (typeof CANONICAL_NARRATIVE_CERTIFICATION_STATUS)[number];

// ---------------------------------------------------------------------------
// Canonical Finding Severity (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_NARRATIVE_FINDING_SEVERITY = [
  'error',
  'warning',
  'recommendation',
] as const;

export type NarrativeFindingSeverity = (typeof CANONICAL_NARRATIVE_FINDING_SEVERITY)[number];

// ---------------------------------------------------------------------------
// Canonical Narrative Quality Dimensions (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_NARRATIVE_QUALITY_DIMENSIONS = [
  'registry_integrity',
  'style_integrity',
  'problem_integrity',
  'analogy_integrity',
  'story_flow_integrity',
  'engagement_integrity',
  'historical_integrity',
  'application_integrity',
  'perspective_integrity',
  'provenance_integrity',
  'relationship_integrity',
  'validation_integrity',
  'determinism',
  'architectural_boundary',
  'documentation_completeness',
  'public_api_integrity',
  'composition_integrity',
  'governance_integrity',
] as const;

export type NarrativeQualityDimension = (typeof CANONICAL_NARRATIVE_QUALITY_DIMENSIONS)[number];

// ---------------------------------------------------------------------------
// Certification Provenance
// ---------------------------------------------------------------------------

export interface CertificationProvenance {
  readonly source: string;
  readonly governanceStatus: NarrativeGovernanceStatus;
  readonly providedBy: string;
  readonly rationale: string;
}

// ---------------------------------------------------------------------------
// Certification Finding
// ---------------------------------------------------------------------------

export interface CertificationFinding {
  readonly findingId: string;
  readonly severity: NarrativeFindingSeverity;
  readonly qualityDimension: NarrativeQualityDimension;
  readonly message: string;
  readonly artifactReference: string;
  readonly provenance: CertificationProvenance;
}

// ---------------------------------------------------------------------------
// Certification Report
// ---------------------------------------------------------------------------

export interface CertificationReport {
  readonly reportId: string;
  readonly status: NarrativeCertificationStatus;
  readonly qualityScore: number;
  readonly findings: readonly CertificationFinding[];
  readonly trace: NarrativeFacadeTraceMetadata;
  readonly provenance: CertificationProvenance;
}

// ---------------------------------------------------------------------------
// Narrative Facade Trace Metadata
// ---------------------------------------------------------------------------

export interface NarrativeFacadeTraceMetadata {
  readonly traceId: string;
  readonly decisionCount: number;
  readonly validationCount: number;
  readonly compositionCount: number;
  readonly certificationCount: number;
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_narrative_facade';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Narrative Facade Output
// ---------------------------------------------------------------------------

export interface NarrativeFacadeOutput {
  readonly narrativeId: string;
  readonly title: string;
  readonly unitType: NarrativeUnitType;
  readonly narrativeMode: NarrativeMode;
  readonly domain: NarrativeDomain;
  readonly status: NarrativeStatus;
  readonly canonicalKnowledgeId: string;
  readonly curriculumNodeId: string;
  readonly lessonId: string;
  readonly laboratoryId: string;
  readonly sequenceOrder: number;
  readonly summary: string;
  readonly tags: readonly string[];
  readonly provenance: NarrativeProvenance;
  readonly style: NarrativeStyle;
  readonly frame: NarrativeFrame;
  readonly problems: readonly Problem[];
  readonly origins: readonly Origin[];
  readonly motivations: readonly ProblemMotivation[];
  readonly questions: readonly DrivingQuestion[];
  readonly misconceptions: readonly Misconception[];
  readonly analogies: readonly Analogy[];
  readonly metaphors: readonly Metaphor[];
  readonly intuitions: readonly Intuition[];
  readonly mappings: readonly ConceptMapping[];
  readonly cognitiveBridges: readonly CognitiveBridge[];
  readonly storyArcs: readonly StoryArc[];
  readonly stages: readonly NarrativeStage[];
  readonly transitions: readonly NarrativeTransition[];
  readonly cognitiveProgressions: readonly CognitiveProgression[];
  readonly attentionShifts: readonly AttentionShift[];
  readonly narrativeFlows: readonly NarrativeFlow[];
  readonly curiosityTriggers: readonly CuriosityTrigger[];
  readonly engagementPoints: readonly EngagementPoint[];
  readonly tensions: readonly NarrativeTension[];
  readonly surprises: readonly SurpriseMoment[];
  readonly rewards: readonly IntellectualReward[];
  readonly recoveryEntries: readonly AttentionRecovery[];
  readonly momentumEntries: readonly NarrativeMomentum[];
  readonly historicalContexts: readonly HistoricalContext[];
  readonly discoveries: readonly ScientificDiscovery[];
  readonly timelineEvents: readonly TimelineEvent[];
  readonly evolutions: readonly ScientificEvolution[];
  readonly milestones: readonly Milestone[];
  readonly influenceChains: readonly InfluenceChain[];
  readonly paradigmShifts: readonly ParadigmShift[];
  readonly applications: readonly Application[];
  readonly useCases: readonly UseCase[];
  readonly industrialScenarios: readonly IndustrialScenario[];
  readonly engineeringScenarios: readonly EngineeringScenario[];
  readonly technologyAdoptions: readonly TechnologyAdoption[];
  readonly realWorldContexts: readonly RealWorldContext[];
  readonly applicationFlows: readonly ApplicationFlow[];
  readonly perspectives: readonly Perspective[];
  readonly explanationViews: readonly ExplanationView[];
  readonly alternativeViews: readonly AlternativeView[];
  readonly disciplinaryViews: readonly DisciplinaryView[];
  readonly implementationViews: readonly ImplementationView[];
  readonly abstractionViews: readonly AbstractionView[];
  readonly perspectiveFlows: readonly PerspectiveFlow[];
}

// ---------------------------------------------------------------------------
// Narrative Certification Output
// ---------------------------------------------------------------------------

export interface NarrativeCertificationOutput {
  readonly certificationReport: CertificationReport;
  readonly validation: NarrativeFacadeValidationResult;
  readonly trace: NarrativeFacadeTraceMetadata;
  readonly status: NarrativeCertificationStatus;
}

// ---------------------------------------------------------------------------
// Narrative Complete Output
// ---------------------------------------------------------------------------

export interface NarrativeCompleteOutput {
  readonly artifact: NarrativeFacadeOutput;
  readonly certification: CertificationReport;
  readonly validation: NarrativeFacadeValidationResult;
  readonly trace: NarrativeFacadeTraceMetadata;
  readonly status: NarrativeCertificationStatus;
}

// ---------------------------------------------------------------------------
// Facade Validation Error
// ---------------------------------------------------------------------------

export interface NarrativeFacadeValidationError {
  readonly code: string;
  readonly message: string;
  readonly field?: string;
}

// ---------------------------------------------------------------------------
// Facade Validation Result
// ---------------------------------------------------------------------------

export interface NarrativeFacadeValidationResult {
  readonly valid: boolean;
  readonly errors: readonly NarrativeFacadeValidationError[];
}

// ---------------------------------------------------------------------------
// Specific Validation Results
// ---------------------------------------------------------------------------

export interface NarrativeFacadeArtifactValidationResult {
  readonly valid: boolean;
  readonly errors: readonly NarrativeFacadeValidationError[];
  readonly checkedAt: 'narrative_facade_artifact_composition';
}

export interface NarrativeFacadeCertificationValidationResult {
  readonly valid: boolean;
  readonly errors: readonly NarrativeFacadeValidationError[];
  readonly checkedAt: 'narrative_facade_certification_composition';
}

export interface NarrativeFacadeCompleteValidationResult {
  readonly valid: boolean;
  readonly errors: readonly NarrativeFacadeValidationError[];
  readonly checkedAt: 'narrative_facade_complete_composition';
}

export interface NarrativeCertificationFindingValidationResult {
  readonly valid: boolean;
  readonly errors: readonly NarrativeFacadeValidationError[];
  readonly checkedAt: 'narrative_certification_finding_composition';
}

export interface NarrativeCertificationReportValidationResult {
  readonly valid: boolean;
  readonly errors: readonly NarrativeFacadeValidationError[];
  readonly checkedAt: 'narrative_certification_report_composition';
}

export interface NarrativeCertificationInputValidationResult {
  readonly valid: boolean;
  readonly errors: readonly NarrativeFacadeValidationError[];
  readonly checkedAt: 'narrative_certification_input_composition';
}

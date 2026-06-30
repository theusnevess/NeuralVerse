/**
 * NV-2100-D9-OPT-01 / D9-OPT-02 / D9-OPT-03 / D9-OPT-04 / D9-OPT-05 / D9-OPT-06 / D9-OPT-07 / D9-OPT-08 / D9-OPT-09 / D9-OPT-10 / D9-OPT-11 / D9-OPT-12 / D9-OPT-13 / D9-OPT-14 — Curiosity Agent Domain Contract
 *
 * Stable internal data model for the Curiosity Registry & Canonical Artifact Kernel.
 * Defines all types required for deterministic curiosity metadata orchestration,
 * deterministic registry representation, and deterministic provenance tracking.
 *
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
 * Extended with Safety, Accessibility & Humor Risk Certification (D9-OPT-14).
 *
 * This module is purely structural. It contains no runtime logic,
 * no mutable state, no external dependencies, and no probabilistic behavior.
 */

// ---------------------------------------------------------------------------
// Canonical Curiosity Types (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_CURIOSITY_TYPES = [
  'curiosity_card',
  'engineer_note',
  'historical_oddity',
  'unexpected_connection',
  'limitation_warning',
  'what_if_prompt',
  'cultural_reference',
  'algorithm_personality',
  'lab_challenge',
  'misconception_card',
  'research_trail',
  'application_surprise',
] as const;

export type CuriosityType = (typeof CANONICAL_CURIOSITY_TYPES)[number];

// ---------------------------------------------------------------------------
// Canonical Curiosity Categories (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_CURIOSITY_CATEGORIES = [
  'factual_discovery',
  'engineering_insight',
  'historical_context',
  'cross_domain_connection',
  'limitation_awareness',
  'creative_exploration',
  'cultural_context',
  'algorithmic_personality',
  'hands_on_challenge',
  'misconception_correction',
  'research_exploration',
  'practical_application',
] as const;

export type CuriosityCategory = (typeof CANONICAL_CURIOSITY_CATEGORIES)[number];

// ---------------------------------------------------------------------------
// Canonical Curiosity Tones (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_CURIOSITY_TONES = [
  'neutral',
  'light_wit',
  'playful',
  'acidic_controlled',
  'cultural',
  'disabled',
] as const;

export type CuriosityTone = (typeof CANONICAL_CURIOSITY_TONES)[number];

// ---------------------------------------------------------------------------
// Canonical Curiosity Status (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_CURIOSITY_CANONICAL_STATUS = [
  'draft',
  'review',
  'approved',
  'published',
  'deprecated',
  'archived',
] as const;

export type CuriosityStatus = (typeof CANONICAL_CURIOSITY_CANONICAL_STATUS)[number];

// ---------------------------------------------------------------------------
// Canonical Curiosity Review Status (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_CURIOSITY_REVIEW_STATUS = [
  'draft',
  'review',
  'approved',
  'published',
  'deprecated',
  'archived',
] as const;

export type CuriosityReviewStatus = (typeof CANONICAL_CURIOSITY_REVIEW_STATUS)[number];

// ---------------------------------------------------------------------------
// Canonical Curiosity Governance (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_CURIOSITY_GOVERNANCE = [
  'canonical',
  'accepted',
  'provisional',
  'deprecated',
  'rejected',
] as const;

export type CuriosityGovernance = (typeof CANONICAL_CURIOSITY_GOVERNANCE)[number];

// ---------------------------------------------------------------------------
// Curiosity Provenance
// ---------------------------------------------------------------------------

export interface CuriosityProvenance {
  readonly provider: string;
  readonly source: string;
  readonly reviewStatus: CuriosityReviewStatus;
  readonly reviewDate: string;
  readonly version: string;
  readonly rationale: string;
}

// ---------------------------------------------------------------------------
// Curiosity Decision
// ---------------------------------------------------------------------------

export interface CuriosityDecision {
  readonly decisionId: string;
  readonly curiosityId: string;
  readonly validationPassed: boolean;
  readonly validationErrors: readonly string[];
}

// ---------------------------------------------------------------------------
// Curiosity Trace
// ---------------------------------------------------------------------------

export interface CuriosityTrace {
  readonly traceId: string;
  readonly generatedFrom: 'deterministic_curiosity_kernel';
  readonly deterministic: true;
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Curiosity Node
// ---------------------------------------------------------------------------

export interface CuriosityNode {
  readonly curiosityId: string;
  readonly title: string;
  readonly curiosityType: CuriosityType;
  readonly category: CuriosityCategory;
  readonly tone: CuriosityTone;
  readonly status: CuriosityStatus;
  readonly governance: CuriosityGovernance;
  readonly tags: readonly string[];
  readonly summary: string;
  readonly provenance: CuriosityProvenance;
}

// ---------------------------------------------------------------------------
// Curiosity Registry Metadata
// ---------------------------------------------------------------------------

export interface CuriosityRegistryMetadata {
  readonly registryId: string;
  readonly version: string;
  readonly nodeCount: number;
  readonly generatedFrom: 'deterministic_curiosity_kernel';
  readonly deterministic: true;
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Curiosity Registry
// ---------------------------------------------------------------------------

export interface CuriosityRegistry {
  readonly registryId: string;
  readonly nodes: readonly CuriosityNode[];
  readonly metadata: CuriosityRegistryMetadata;
  readonly trace: CuriosityTrace;
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_curiosity_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Curiosity Input
// ---------------------------------------------------------------------------

export interface CuriosityInput {
  readonly nodes: readonly CuriosityNode[];
}

// ---------------------------------------------------------------------------
// Curiosity Validation Error
// ---------------------------------------------------------------------------

export interface CuriosityValidationError {
  readonly code: string;
  readonly message: string;
  readonly field?: string;
  readonly curiosityId?: string;
}

// ---------------------------------------------------------------------------
// Curiosity Validation Result
// ---------------------------------------------------------------------------

export interface CuriosityValidationResult {
  readonly valid: boolean;
  readonly errors: readonly CuriosityValidationError[];
}

// ---------------------------------------------------------------------------
// Curiosity Node Validation Result
// ---------------------------------------------------------------------------

export interface CuriosityNodeValidationResult {
  readonly valid: boolean;
  readonly errors: readonly CuriosityValidationError[];
  readonly checkedAt: 'curiosity_node_composition';
}

// ---------------------------------------------------------------------------
// Curiosity Registry Validation Result
// ---------------------------------------------------------------------------

export interface CuriosityRegistryValidationResult {
  readonly valid: boolean;
  readonly errors: readonly CuriosityValidationError[];
  readonly checkedAt: 'curiosity_registry_composition';
}

// ---------------------------------------------------------------------------
// Curiosity Input Validation Result
// ---------------------------------------------------------------------------

export interface CuriosityInputValidationResult {
  readonly valid: boolean;
  readonly errors: readonly CuriosityValidationError[];
  readonly checkedAt: 'curiosity_input_composition';
}

// ---------------------------------------------------------------------------
// Curiosity Trace Validation Result
// ---------------------------------------------------------------------------

export interface CuriosityTraceValidationResult {
  readonly valid: boolean;
  readonly errors: readonly CuriosityValidationError[];
  readonly checkedAt: 'curiosity_trace_composition';
}

// ============================================================================
// D9-OPT-02 — Educational Purpose Modeling
// ============================================================================

// ---------------------------------------------------------------------------
// Canonical Curiosity Output Types (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_CURIOSITY_OUTPUT_TYPES = [
  'fact',
  'historical_story',
  'engineering_story',
  'fun_comparison',
  'analogy',
  'behind_the_scenes',
  'myth_vs_fact',
  'did_you_know',
  'timeline',
  'easter_egg',
] as const;

export type CuriosityOutputType = (typeof CANONICAL_CURIOSITY_OUTPUT_TYPES)[number];

// ---------------------------------------------------------------------------
// Canonical Educational Purposes (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_EDUCATIONAL_PURPOSES = [
  'increase_attention',
  'improve_retention',
  'connect_concepts',
  'humanize_science',
  'motivate_learning',
  'provide_context',
  'encourage_reflection',
  'break_cognitive_fatigue',
  'reinforce_memory',
  'stimulate_curiosity',
] as const;

export type EducationalPurpose = (typeof CANONICAL_EDUCATIONAL_PURPOSES)[number];

// ---------------------------------------------------------------------------
// Canonical Emotional Tones (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_EMOTIONAL_TONES = [
  'surprising',
  'humorous',
  'playful',
  'technical',
  'reflective',
  'dramatic',
  'inspirational',
  'ironic',
  'neutral',
  'thought_provoking',
] as const;

export type EmotionalTone = (typeof CANONICAL_EMOTIONAL_TONES)[number];

// ---------------------------------------------------------------------------
// Canonical Delivery Contexts (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_DELIVERY_CONTEXTS = [
  'lesson_intro',
  'lesson_transition',
  'lesson_outro',
  'topic_break',
  'quiz_break',
  'laboratory_intro',
  'case_study_intro',
  'module_summary',
  'portfolio_context',
  'random_discovery',
] as const;

export type DeliveryContext = (typeof CANONICAL_DELIVERY_CONTEXTS)[number];

// ---------------------------------------------------------------------------
// Canonical Audience Levels (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_AUDIENCE_LEVELS = [
  'beginner',
  'intermediate',
  'advanced',
  'researcher',
  'engineer',
  'student',
  'general_public',
  'educator',
  'professional',
  'mixed',
] as const;

export type AudienceLevel = (typeof CANONICAL_AUDIENCE_LEVELS)[number];

// ---------------------------------------------------------------------------
// Canonical Curiosity Purpose Status (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_CURIOSITY_PURPOSE_STATUS = [
  'draft',
  'review',
  'approved',
  'published',
  'deprecated',
  'archived',
] as const;

export type CuriosityPurposeStatus = (typeof CANONICAL_CURIOSITY_PURPOSE_STATUS)[number];

// ---------------------------------------------------------------------------
// Curiosity Purpose Provenance
// ---------------------------------------------------------------------------

export interface CuriosityPurposeProvenance {
  readonly provider: string;
  readonly source: string;
  readonly rationale: string;
  readonly version: string;
}

// ---------------------------------------------------------------------------
// Curiosity Purpose Decision
// ---------------------------------------------------------------------------

export interface CuriosityPurposeDecision {
  readonly decisionId: string;
  readonly profileId: string;
  readonly validationPassed: boolean;
  readonly validationErrors: readonly string[];
}

// ---------------------------------------------------------------------------
// Curiosity Purpose Trace
// ---------------------------------------------------------------------------

export interface CuriosityPurposeTrace {
  readonly traceId: string;
  readonly generatedFrom: 'deterministic_curiosity_purpose_kernel';
  readonly deterministic: true;
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Curiosity Purpose Profile
// ---------------------------------------------------------------------------

export interface CuriosityPurposeProfile {
  readonly id: string;
  readonly title: string;
  readonly outputType: CuriosityOutputType;
  readonly educationalPurpose: EducationalPurpose;
  readonly emotionalTone: EmotionalTone;
  readonly deliveryContext: DeliveryContext;
  readonly audienceLevel: AudienceLevel;
  readonly conceptIds: readonly string[];
  readonly status: CuriosityPurposeStatus;
  readonly governance: CuriosityGovernance;
  readonly provenance: CuriosityPurposeProvenance;
  readonly trace: CuriosityPurposeTrace;
}

// ---------------------------------------------------------------------------
// Curiosity Purpose Relationship
// ---------------------------------------------------------------------------

export interface CuriosityPurposeRelationship {
  readonly relationshipId: string;
  readonly sourceProfileId: string;
  readonly targetProfileId: string;
  readonly relationshipType: string;
  readonly description: string;
  readonly provenance: CuriosityPurposeProvenance;
}

// ---------------------------------------------------------------------------
// Curiosity Purpose Registry Metadata
// ---------------------------------------------------------------------------

export interface CuriosityPurposeRegistryMetadata {
  readonly registryId: string;
  readonly version: string;
  readonly profileCount: number;
  readonly relationshipCount: number;
}

// ---------------------------------------------------------------------------
// Curiosity Purpose Registry
// ---------------------------------------------------------------------------

export interface CuriosityPurposeRegistry {
  readonly registryId: string;
  readonly profiles: readonly CuriosityPurposeProfile[];
  readonly relationships: readonly CuriosityPurposeRelationship[];
  readonly metadata: CuriosityPurposeRegistryMetadata;
  readonly trace: CuriosityPurposeTrace;
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_curiosity_purpose_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Curiosity Purpose Input
// ---------------------------------------------------------------------------

export interface CuriosityPurposeInput {
  readonly profiles: readonly CuriosityPurposeProfile[];
  readonly relationships: readonly CuriosityPurposeRelationship[];
}

// ---------------------------------------------------------------------------
// Curiosity Artifact With Purpose
// ---------------------------------------------------------------------------

export interface CuriosityArtifactWithPurpose {
  readonly curiosityId: string;
  readonly title: string;
  readonly profile: CuriosityPurposeProfile;
  readonly relationships: readonly CuriosityPurposeRelationship[];
  readonly provenance: CuriosityPurposeProvenance;
}

// ---------------------------------------------------------------------------
// Curiosity Purpose Validation Error
// ---------------------------------------------------------------------------

export interface CuriosityPurposeValidationError {
  readonly code: string;
  readonly message: string;
  readonly field?: string;
  readonly profileId?: string;
}

// ---------------------------------------------------------------------------
// Curiosity Purpose Validation Result
// ---------------------------------------------------------------------------

export interface CuriosityPurposeValidationResult {
  readonly valid: boolean;
  readonly errors: readonly CuriosityPurposeValidationError[];
}

// ---------------------------------------------------------------------------
// Curiosity Purpose Registry Validation Result
// ---------------------------------------------------------------------------

export interface CuriosityPurposeRegistryValidationResult {
  readonly valid: boolean;
  readonly errors: readonly CuriosityPurposeValidationError[];
  readonly checkedAt: 'curiosity_purpose_registry_composition';
}

// ---------------------------------------------------------------------------
// Curiosity Purpose Input Validation Result
// ---------------------------------------------------------------------------

export interface CuriosityPurposeInputValidationResult {
  readonly valid: boolean;
  readonly errors: readonly CuriosityPurposeValidationError[];
  readonly checkedAt: 'curiosity_purpose_input_composition';
}

// ---------------------------------------------------------------------------
// Curiosity Purpose Trace Validation Result
// ---------------------------------------------------------------------------

export interface CuriosityPurposeTraceValidationResult {
  readonly valid: boolean;
  readonly errors: readonly CuriosityPurposeValidationError[];
  readonly checkedAt: 'curiosity_purpose_trace_composition';
}

// ---------------------------------------------------------------------------
// Curiosity Artifact With Purpose Validation Result
// ---------------------------------------------------------------------------

export interface CuriosityArtifactWithPurposeValidationResult {
  readonly valid: boolean;
  readonly errors: readonly CuriosityPurposeValidationError[];
  readonly checkedAt: 'curiosity_artifact_with_purpose_composition';
}

// ============================================================================
// D9-OPT-03 — Humor Layer, Tone System & Controlled Acid Humor Governance
// ============================================================================

// ---------------------------------------------------------------------------
// Canonical Humor Types (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_HUMOR_TYPES = [
  'dry_humor',
  'controlled_acid',
  'engineering_joke',
  'scientific_irony',
  'playful_comparison',
  'unexpected_fact',
  'self_deprecating_science',
  'historical_irony',
  'pop_culture_reference',
  'gaming_reference',
] as const;

export type HumorType = (typeof CANONICAL_HUMOR_TYPES)[number];

// ---------------------------------------------------------------------------
// Canonical Reference Types (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_REFERENCE_TYPES = [
  'movie',
  'tv_series',
  'anime',
  'video_game',
  'book',
  'internet_culture',
  'scientist',
  'historical_event',
  'technology',
  'engineering',
] as const;

export type ReferenceType = (typeof CANONICAL_REFERENCE_TYPES)[number];

// ---------------------------------------------------------------------------
// Canonical Humor Intensity (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_HUMOR_INTENSITY = [
  'none',
  'minimal',
  'light',
  'playful',
  'moderate',
  'strong',
  'acid_light',
  'acid_controlled',
  'highly_ironic',
  'satirical_light',
] as const;

export type HumorIntensity = (typeof CANONICAL_HUMOR_INTENSITY)[number];

// ---------------------------------------------------------------------------
// Canonical Humor Objectives (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_HUMOR_OBJECTIVES = [
  'increase_retention',
  'capture_attention',
  'reduce_cognitive_load',
  'make_concept_memorable',
  'humanize_engineering',
  'illustrate_absurdity',
  'encourage_reflection',
  'create_surprise',
  'support_storytelling',
  'increase_engagement',
] as const;

export type HumorObjective = (typeof CANONICAL_HUMOR_OBJECTIVES)[number];

// ---------------------------------------------------------------------------
// Canonical Humor Safety Levels (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_HUMOR_SAFETY_LEVELS = [
  'fully_safe',
  'reviewed',
  'canonical',
  'educational',
  'neutral',
  'restricted',
  'careful',
  'controlled',
  'review_required',
  'deprecated',
] as const;

export type HumorSafetyLevel = (typeof CANONICAL_HUMOR_SAFETY_LEVELS)[number];

// ---------------------------------------------------------------------------
// Canonical Humor Status (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_HUMOR_STATUS = [
  'draft',
  'review',
  'approved',
  'published',
  'deprecated',
  'archived',
] as const;

export type HumorStatus = (typeof CANONICAL_HUMOR_STATUS)[number];

// ---------------------------------------------------------------------------
// Curiosity Humor Provenance
// ---------------------------------------------------------------------------

export interface CuriosityHumorProvenance {
  readonly provider: string;
  readonly source: string;
  readonly rationale: string;
  readonly version: string;
}

// ---------------------------------------------------------------------------
// Curiosity Humor Decision
// ---------------------------------------------------------------------------

export interface CuriosityHumorDecision {
  readonly decisionId: string;
  readonly profileId: string;
  readonly validationPassed: boolean;
  readonly validationErrors: readonly string[];
}

// ---------------------------------------------------------------------------
// Curiosity Humor Trace
// ---------------------------------------------------------------------------

export interface CuriosityHumorTrace {
  readonly traceId: string;
  readonly generatedFrom: 'deterministic_curiosity_humor_kernel';
  readonly deterministic: true;
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Humor Profile
// ---------------------------------------------------------------------------

export interface HumorProfile {
  readonly id: string;
  readonly title: string;
  readonly humorType: HumorType;
  readonly referenceType: ReferenceType;
  readonly humorObjective: HumorObjective;
  readonly humorIntensity: HumorIntensity;
  readonly safetyLevel: HumorSafetyLevel;
  readonly conceptIds: readonly string[];
  readonly status: HumorStatus;
  readonly governance: CuriosityGovernance;
  readonly provenance: CuriosityHumorProvenance;
  readonly trace: CuriosityHumorTrace;
}

// ---------------------------------------------------------------------------
// Humor Reference
// ---------------------------------------------------------------------------

export interface HumorReference {
  readonly referenceId: string;
  readonly referenceType: ReferenceType;
  readonly referenceTitle: string;
  readonly referenceReason: string;
  readonly educationalPurpose: string;
}

// ---------------------------------------------------------------------------
// Humor Relationship
// ---------------------------------------------------------------------------

export interface HumorRelationship {
  readonly relationshipId: string;
  readonly sourceProfileId: string;
  readonly targetProfileId: string;
  readonly relationshipType: string;
  readonly description: string;
  readonly provenance: CuriosityHumorProvenance;
}

// ---------------------------------------------------------------------------
// Humor Governance
// ---------------------------------------------------------------------------

export interface HumorGovernance {
  readonly educationalJustification: string;
  readonly pedagogicalPurpose: string;
  readonly reviewStatus: CuriosityReviewStatus;
  readonly safetyLevel: HumorSafetyLevel;
  readonly reviewRequired: boolean;
}

// ---------------------------------------------------------------------------
// Humor Registry Metadata
// ---------------------------------------------------------------------------

export interface HumorRegistryMetadata {
  readonly registryId: string;
  readonly version: string;
  readonly profileCount: number;
  readonly referenceCount: number;
  readonly relationshipCount: number;
}

// ---------------------------------------------------------------------------
// Humor Registry
// ---------------------------------------------------------------------------

export interface HumorRegistry {
  readonly registryId: string;
  readonly profiles: readonly HumorProfile[];
  readonly references: readonly HumorReference[];
  readonly relationships: readonly HumorRelationship[];
  readonly governance: HumorGovernance;
  readonly metadata: HumorRegistryMetadata;
  readonly trace: CuriosityHumorTrace;
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_curiosity_humor_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Humor Input
// ---------------------------------------------------------------------------

export interface HumorInput {
  readonly profiles: readonly HumorProfile[];
  readonly references: readonly HumorReference[];
  readonly relationships: readonly HumorRelationship[];
  readonly governance: HumorGovernance;
}

// ---------------------------------------------------------------------------
// Curiosity Artifact With Humor
// ---------------------------------------------------------------------------

export interface CuriosityArtifactWithHumor {
  readonly curiosityId: string;
  readonly title: string;
  readonly profile: HumorProfile;
  readonly references: readonly HumorReference[];
  readonly relationships: readonly HumorRelationship[];
  readonly governance: HumorGovernance;
  readonly provenance: CuriosityHumorProvenance;
}

// ---------------------------------------------------------------------------
// Humor Validation Error
// ---------------------------------------------------------------------------

export interface HumorValidationError {
  readonly code: string;
  readonly message: string;
  readonly field?: string;
  readonly profileId?: string;
}

// ---------------------------------------------------------------------------
// Humor Validation Result
// ---------------------------------------------------------------------------

export interface HumorValidationResult {
  readonly valid: boolean;
  readonly errors: readonly HumorValidationError[];
}

// ---------------------------------------------------------------------------
// Humor Registry Validation Result
// ---------------------------------------------------------------------------

export interface HumorRegistryValidationResult {
  readonly valid: boolean;
  readonly errors: readonly HumorValidationError[];
  readonly checkedAt: 'humor_registry_composition';
}

// ---------------------------------------------------------------------------
// Humor Input Validation Result
// ---------------------------------------------------------------------------

export interface HumorInputValidationResult {
  readonly valid: boolean;
  readonly errors: readonly HumorValidationError[];
  readonly checkedAt: 'humor_input_composition';
}

// ---------------------------------------------------------------------------
// Humor Trace Validation Result
// ---------------------------------------------------------------------------

export interface HumorTraceValidationResult {
  readonly valid: boolean;
  readonly errors: readonly HumorValidationError[];
  readonly checkedAt: 'humor_trace_composition';
}

// ---------------------------------------------------------------------------
// Curiosity Artifact With Humor Validation Result
// ---------------------------------------------------------------------------

export interface CuriosityArtifactWithHumorValidationResult {
  readonly valid: boolean;
  readonly errors: readonly HumorValidationError[];
  readonly checkedAt: 'curiosity_artifact_with_humor_composition';
}

// ============================================================================
// D9-OPT-04 — Cultural Reference & Current-Context Governance
// ============================================================================

// ---------------------------------------------------------------------------
// Canonical Reference Domains (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_REFERENCE_DOMAINS = [
  'cinema',
  'television',
  'literature',
  'video_games',
  'internet_culture',
  'historical_events',
  'science_history',
  'technology_history',
  'engineering',
  'popular_science',
] as const;

export type ReferenceDomain = (typeof CANONICAL_REFERENCE_DOMAINS)[number];

// ---------------------------------------------------------------------------
// Canonical Reference Recency (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_REFERENCE_RECENCY = [
  'timeless',
  'historical',
  'modern',
  'contemporary',
  'seasonal',
  'evergreen',
  'legacy',
  'classic',
  'emerging',
  'current',
] as const;

export type ReferenceRecency = (typeof CANONICAL_REFERENCE_RECENCY)[number];

// ---------------------------------------------------------------------------
// Canonical Reference Purpose (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_REFERENCE_PURPOSE = [
  'engagement',
  'memorability',
  'analogy',
  'comparison',
  'historical_context',
  'scientific_context',
  'engineering_context',
  'humor',
  'reflection',
  'motivation',
] as const;

export type ReferencePurpose = (typeof CANONICAL_REFERENCE_PURPOSE)[number];

// ---------------------------------------------------------------------------
// Canonical Reference Validity (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_REFERENCE_VALIDITY = [
  'canonical',
  'verified',
  'reviewed',
  'temporary',
  'deprecated',
  'legacy',
  'pending_review',
  'restricted',
  'archived',
  'rejected',
] as const;

export type ReferenceValidity = (typeof CANONICAL_REFERENCE_VALIDITY)[number];

// ---------------------------------------------------------------------------
// Canonical Context Sensitivity (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_CONTEXT_SENSITIVITY = [
  'safe',
  'review_required',
  'high_attention',
  'restricted',
  'forbidden',
] as const;

export type ContextSensitivity = (typeof CANONICAL_CONTEXT_SENSITIVITY)[number];

// ---------------------------------------------------------------------------
// Canonical Reference Status (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_REFERENCE_STATUS = [
  'draft',
  'review',
  'approved',
  'published',
  'deprecated',
  'archived',
] as const;

export type ReferenceStatus = (typeof CANONICAL_REFERENCE_STATUS)[number];

// ---------------------------------------------------------------------------
// Cultural Reference Provenance
// ---------------------------------------------------------------------------

export interface CulturalReferenceProvenance {
  readonly provider: string;
  readonly source: string;
  readonly rationale: string;
  readonly version: string;
}

// ---------------------------------------------------------------------------
// Cultural Reference Decision
// ---------------------------------------------------------------------------

export interface CulturalReferenceDecision {
  readonly decisionId: string;
  readonly profileId: string;
  readonly validationPassed: boolean;
  readonly validationErrors: readonly string[];
}

// ---------------------------------------------------------------------------
// Cultural Reference Trace
// ---------------------------------------------------------------------------

export interface CulturalReferenceTrace {
  readonly traceId: string;
  readonly generatedFrom: 'deterministic_cultural_reference_kernel';
  readonly deterministic: true;
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Cultural Reference Profile
// ---------------------------------------------------------------------------

export interface CulturalReferenceProfile {
  readonly id: string;
  readonly title: string;
  readonly referenceDomain: ReferenceDomain;
  readonly referenceRecency: ReferenceRecency;
  readonly referencePurpose: ReferencePurpose;
  readonly referenceValidity: ReferenceValidity;
  readonly contextSensitivity: ContextSensitivity;
  readonly conceptIds: readonly string[];
  readonly status: ReferenceStatus;
  readonly governance: CuriosityGovernance;
  readonly provenance: CulturalReferenceProvenance;
  readonly trace: CulturalReferenceTrace;
}

// ---------------------------------------------------------------------------
// Current Context Reference
// ---------------------------------------------------------------------------

export interface CurrentContextReference {
  readonly referenceId: string;
  readonly referenceDomain: ReferenceDomain;
  readonly referenceRecency: ReferenceRecency;
  readonly contextSensitivity: ContextSensitivity;
  readonly validityPeriod: string;
  readonly lastVerified: string;
  readonly provenance: CulturalReferenceProvenance;
}

// ---------------------------------------------------------------------------
// Reference Governance
// ---------------------------------------------------------------------------

export interface ReferenceGovernance {
  readonly educationalJustification: string;
  readonly pedagogicalPurpose: string;
  readonly reviewStatus: CuriosityReviewStatus;
  readonly contextSensitivity: ContextSensitivity;
  readonly reviewRequired: boolean;
}

// ---------------------------------------------------------------------------
// Reference Relationship
// ---------------------------------------------------------------------------

export interface ReferenceRelationship {
  readonly relationshipId: string;
  readonly sourceProfileId: string;
  readonly targetProfileId: string;
  readonly relationshipType: string;
  readonly description: string;
  readonly provenance: CulturalReferenceProvenance;
}

// ---------------------------------------------------------------------------
// Cultural Reference Registry Metadata
// ---------------------------------------------------------------------------

export interface CulturalReferenceRegistryMetadata {
  readonly registryId: string;
  readonly version: string;
  readonly profileCount: number;
  readonly contextReferenceCount: number;
  readonly relationshipCount: number;
}

// ---------------------------------------------------------------------------
// Cultural Reference Registry
// ---------------------------------------------------------------------------

export interface CulturalReferenceRegistry {
  readonly registryId: string;
  readonly profiles: readonly CulturalReferenceProfile[];
  readonly contextReferences: readonly CurrentContextReference[];
  readonly relationships: readonly ReferenceRelationship[];
  readonly governance: ReferenceGovernance;
  readonly metadata: CulturalReferenceRegistryMetadata;
  readonly trace: CulturalReferenceTrace;
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_cultural_reference_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Cultural Reference Input
// ---------------------------------------------------------------------------

export interface CulturalReferenceInput {
  readonly profiles: readonly CulturalReferenceProfile[];
  readonly contextReferences: readonly CurrentContextReference[];
  readonly relationships: readonly ReferenceRelationship[];
  readonly governance: ReferenceGovernance;
}

// ---------------------------------------------------------------------------
// Curiosity Artifact With Cultural References
// ---------------------------------------------------------------------------

export interface CuriosityArtifactWithCulturalReferences {
  readonly curiosityId: string;
  readonly title: string;
  readonly profiles: readonly CulturalReferenceProfile[];
  readonly contextReferences: readonly CurrentContextReference[];
  readonly relationships: readonly ReferenceRelationship[];
  readonly governance: ReferenceGovernance;
  readonly provenance: CulturalReferenceProvenance;
}

// ---------------------------------------------------------------------------
// Cultural Reference Validation Error
// ---------------------------------------------------------------------------

export interface CulturalReferenceValidationError {
  readonly code: string;
  readonly message: string;
  readonly field?: string;
  readonly profileId?: string;
}

// ---------------------------------------------------------------------------
// Cultural Reference Validation Result
// ---------------------------------------------------------------------------

export interface CulturalReferenceValidationResult {
  readonly valid: boolean;
  readonly errors: readonly CulturalReferenceValidationError[];
}

// ---------------------------------------------------------------------------
// Cultural Reference Registry Validation Result
// ---------------------------------------------------------------------------

export interface CulturalReferenceRegistryValidationResult {
  readonly valid: boolean;
  readonly errors: readonly CulturalReferenceValidationError[];
  readonly checkedAt: 'cultural_reference_registry_composition';
}

// ---------------------------------------------------------------------------
// Cultural Reference Input Validation Result
// ---------------------------------------------------------------------------

export interface CulturalReferenceInputValidationResult {
  readonly valid: boolean;
  readonly errors: readonly CulturalReferenceValidationError[];
  readonly checkedAt: 'cultural_reference_input_composition';
}

// ---------------------------------------------------------------------------
// Cultural Reference Trace Validation Result
// ---------------------------------------------------------------------------

export interface CulturalReferenceTraceValidationResult {
  readonly valid: boolean;
  readonly errors: readonly CulturalReferenceValidationError[];
  readonly checkedAt: 'cultural_reference_trace_composition';
}

// ---------------------------------------------------------------------------
// Curiosity Artifact With Cultural References Validation Result
// ---------------------------------------------------------------------------

export interface CuriosityArtifactWithCulturalReferencesValidationResult {
  readonly valid: boolean;
  readonly errors: readonly CulturalReferenceValidationError[];
  readonly checkedAt: 'curiosity_artifact_with_cultural_references_composition';
}

// ============================================================================
// D9-OPT-05 — Curiosity Card, Engineer Note & Field Note Modeling
// ============================================================================

// ---------------------------------------------------------------------------
// Canonical Card Types (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_CARD_TYPES = [
  'curiosity_card',
  'engineer_note',
  'field_note',
  'historical_note',
  'did_you_know',
  'fun_fact',
  'engineering_fact',
  'scientific_observation',
  'comparison_note',
  'behind_the_scenes',
] as const;

export type CardType = (typeof CANONICAL_CARD_TYPES)[number];

// ---------------------------------------------------------------------------
// Canonical Information Density (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_INFORMATION_DENSITY = [
  'minimal',
  'compact',
  'balanced',
  'detailed',
  'technical',
  'expert',
  'reference',
  'deep',
  'encyclopedic',
  'micro',
] as const;

export type InformationDensity = (typeof CANONICAL_INFORMATION_DENSITY)[number];

// ---------------------------------------------------------------------------
// Canonical Reading Duration (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_READING_DURATION = [
  '10_seconds',
  '20_seconds',
  '30_seconds',
  '45_seconds',
  '1_minute',
  '2_minutes',
  '3_minutes',
  '5_minutes',
  '10_minutes',
  'reference',
] as const;

export type ReadingDuration = (typeof CANONICAL_READING_DURATION)[number];

// ---------------------------------------------------------------------------
// Canonical Presentation Style (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_PRESENTATION_STYLE = [
  'card',
  'sticky_note',
  'lab_note',
  'engineering_log',
  'field_journal',
  'research_annotation',
  'technical_callout',
  'magazine_box',
  'knowledge_chip',
  'observation',
] as const;

export type PresentationStyle = (typeof CANONICAL_PRESENTATION_STYLE)[number];

// ---------------------------------------------------------------------------
// Canonical Discovery Style (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_DISCOVERY_STYLE = [
  'surprising',
  'counter_intuitive',
  'historical',
  'engineering',
  'scientific',
  'practical',
  'humorous',
  'comparative',
  'observational',
  'reflective',
] as const;

export type DiscoveryStyle = (typeof CANONICAL_DISCOVERY_STYLE)[number];

// ---------------------------------------------------------------------------
// Canonical Card Status (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_CARD_STATUS = [
  'draft',
  'review',
  'approved',
  'published',
  'deprecated',
  'archived',
] as const;

export type CardStatus = (typeof CANONICAL_CARD_STATUS)[number];

// ---------------------------------------------------------------------------
// Curiosity Card Provenance
// ---------------------------------------------------------------------------

export interface CuriosityCardProvenance {
  readonly provider: string;
  readonly source: string;
  readonly rationale: string;
  readonly version: string;
}

// ---------------------------------------------------------------------------
// Curiosity Card Decision
// ---------------------------------------------------------------------------

export interface CuriosityCardDecision {
  readonly decisionId: string;
  readonly cardId: string;
  readonly validationPassed: boolean;
  readonly validationErrors: readonly string[];
}

// ---------------------------------------------------------------------------
// Curiosity Card Trace
// ---------------------------------------------------------------------------

export interface CuriosityCardTrace {
  readonly traceId: string;
  readonly generatedFrom: 'deterministic_curiosity_card_kernel';
  readonly deterministic: true;
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Curiosity Card Profile
// ---------------------------------------------------------------------------

export interface CuriosityCardProfile {
  readonly id: string;
  readonly title: string;
  readonly cardType: CardType;
  readonly informationDensity: InformationDensity;
  readonly readingDuration: ReadingDuration;
  readonly presentationStyle: PresentationStyle;
  readonly discoveryStyle: DiscoveryStyle;
  readonly conceptIds: readonly string[];
  readonly status: CardStatus;
  readonly governance: CuriosityGovernance;
  readonly provenance: CuriosityCardProvenance;
  readonly trace: CuriosityCardTrace;
}

// ---------------------------------------------------------------------------
// Engineer Note Profile
// ---------------------------------------------------------------------------

export interface EngineerNoteProfile {
  readonly id: string;
  readonly title: string;
  readonly engineeringRelevance: string;
  readonly implementationPerspective: string;
  readonly realWorldInsight: string;
  readonly practicalTakeaway: string;
  readonly technicalEmphasis: string;
  readonly conceptIds: readonly string[];
  readonly status: CardStatus;
  readonly governance: CuriosityGovernance;
  readonly provenance: CuriosityCardProvenance;
  readonly trace: CuriosityCardTrace;
}

// ---------------------------------------------------------------------------
// Field Note Profile
// ---------------------------------------------------------------------------

export interface FieldNoteProfile {
  readonly id: string;
  readonly title: string;
  readonly observation: string;
  readonly experiment: string;
  readonly historicalAnecdote: string;
  readonly scientificDiscovery: string;
  readonly engineeringLesson: string;
  readonly conceptIds: readonly string[];
  readonly status: CardStatus;
  readonly governance: CuriosityGovernance;
  readonly provenance: CuriosityCardProvenance;
  readonly trace: CuriosityCardTrace;
}

// ---------------------------------------------------------------------------
// Card Presentation Metadata
// ---------------------------------------------------------------------------

export interface CardPresentationMetadata {
  readonly presentationId: string;
  readonly cardId: string;
  readonly presentationStyle: PresentationStyle;
  readonly informationDensity: InformationDensity;
  readonly readingDuration: ReadingDuration;
  readonly discoveryStyle: DiscoveryStyle;
}

// ---------------------------------------------------------------------------
// Card Relationship
// ---------------------------------------------------------------------------

export interface CardRelationship {
  readonly relationshipId: string;
  readonly sourceCardId: string;
  readonly targetCardId: string;
  readonly relationshipType: string;
  readonly description: string;
  readonly provenance: CuriosityCardProvenance;
}

// ---------------------------------------------------------------------------
// Curiosity Card Registry Metadata
// ---------------------------------------------------------------------------

export interface CuriosityCardRegistryMetadata {
  readonly registryId: string;
  readonly version: string;
  readonly cardCount: number;
  readonly engineerNoteCount: number;
  readonly fieldNoteCount: number;
  readonly presentationCount: number;
  readonly relationshipCount: number;
}

// ---------------------------------------------------------------------------
// Curiosity Card Registry
// ---------------------------------------------------------------------------

export interface CuriosityCardRegistry {
  readonly registryId: string;
  readonly cards: readonly CuriosityCardProfile[];
  readonly engineerNotes: readonly EngineerNoteProfile[];
  readonly fieldNotes: readonly FieldNoteProfile[];
  readonly presentations: readonly CardPresentationMetadata[];
  readonly relationships: readonly CardRelationship[];
  readonly metadata: CuriosityCardRegistryMetadata;
  readonly trace: CuriosityCardTrace;
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_curiosity_card_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Curiosity Card Input
// ---------------------------------------------------------------------------

export interface CuriosityCardInput {
  readonly cards: readonly CuriosityCardProfile[];
  readonly engineerNotes: readonly EngineerNoteProfile[];
  readonly fieldNotes: readonly FieldNoteProfile[];
  readonly presentations: readonly CardPresentationMetadata[];
  readonly relationships: readonly CardRelationship[];
}

// ---------------------------------------------------------------------------
// Curiosity Artifact With Cards
// ---------------------------------------------------------------------------

export interface CuriosityArtifactWithCards {
  readonly curiosityId: string;
  readonly title: string;
  readonly cards: readonly CuriosityCardProfile[];
  readonly engineerNotes: readonly EngineerNoteProfile[];
  readonly fieldNotes: readonly FieldNoteProfile[];
  readonly presentations: readonly CardPresentationMetadata[];
  readonly relationships: readonly CardRelationship[];
  readonly provenance: CuriosityCardProvenance;
}

// ---------------------------------------------------------------------------
// Curiosity Card Validation Error
// ---------------------------------------------------------------------------

export interface CuriosityCardValidationError {
  readonly code: string;
  readonly message: string;
  readonly field?: string;
  readonly cardId?: string;
}

// ---------------------------------------------------------------------------
// Curiosity Card Validation Result
// ---------------------------------------------------------------------------

export interface CuriosityCardValidationResult {
  readonly valid: boolean;
  readonly errors: readonly CuriosityCardValidationError[];
}

// ---------------------------------------------------------------------------
// Curiosity Card Registry Validation Result
// ---------------------------------------------------------------------------

export interface CuriosityCardRegistryValidationResult {
  readonly valid: boolean;
  readonly errors: readonly CuriosityCardValidationError[];
  readonly checkedAt: 'curiosity_card_registry_composition';
}

// ---------------------------------------------------------------------------
// Curiosity Card Input Validation Result
// ---------------------------------------------------------------------------

export interface CuriosityCardInputValidationResult {
  readonly valid: boolean;
  readonly errors: readonly CuriosityCardValidationError[];
  readonly checkedAt: 'curiosity_card_input_composition';
}

// ---------------------------------------------------------------------------
// Curiosity Card Trace Validation Result
// ---------------------------------------------------------------------------

export interface CuriosityCardTraceValidationResult {
  readonly valid: boolean;
  readonly errors: readonly CuriosityCardValidationError[];
  readonly checkedAt: 'curiosity_card_trace_composition';
}

// ---------------------------------------------------------------------------
// Curiosity Artifact With Cards Validation Result
// ---------------------------------------------------------------------------

export interface CuriosityArtifactWithCardsValidationResult {
  readonly valid: boolean;
  readonly errors: readonly CuriosityCardValidationError[];
  readonly checkedAt: 'curiosity_artifact_with_cards_composition';
}

// ============================================================================
// D9-OPT-06 — Historical Oddity, Research Trail & Knowledge Evolution Curiosity
// ============================================================================

// ---------------------------------------------------------------------------
// Canonical Discovery Types (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_DISCOVERY_TYPES = [
  'scientific_discovery',
  'engineering_breakthrough',
  'historical_oddity',
  'accidental_discovery',
  'failed_experiment',
  'paradigm_shift',
  'technology_evolution',
  'research_milestone',
  'forgotten_knowledge',
  'rediscovery',
] as const;

export type DiscoveryType = (typeof CANONICAL_DISCOVERY_TYPES)[number];

// ---------------------------------------------------------------------------
// Canonical Evolution Stages (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_EVOLUTION_STAGES = [
  'origin',
  'early_development',
  'experimentation',
  'validation',
  'adoption',
  'optimization',
  'standardization',
  'decline',
  'rediscovery',
  'modern_state',
] as const;

export type EvolutionStage = (typeof CANONICAL_EVOLUTION_STAGES)[number];

// ---------------------------------------------------------------------------
// Canonical Research Trail Types (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_RESEARCH_TRAIL_TYPES = [
  'chronological',
  'causal',
  'technological',
  'scientific',
  'engineering',
  'experimental',
  'comparative',
  'iterative',
  'cross_disciplinary',
  'knowledge_chain',
] as const;

export type ResearchTrailType = (typeof CANONICAL_RESEARCH_TRAIL_TYPES)[number];

// ---------------------------------------------------------------------------
// Canonical Oddity Types (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_ODDITY_TYPES = [
  'unexpected_result',
  'historical_mistake',
  'engineering_failure',
  'scientific_myth',
  'counter_intuitive',
  'coincidence',
  'unusual_fact',
  'forgotten_attempt',
  'surprising_origin',
  'legend_vs_reality',
] as const;

export type OddityType = (typeof CANONICAL_ODDITY_TYPES)[number];

// ---------------------------------------------------------------------------
// Canonical Evolution Purposes (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_EVOLUTION_PURPOSES = [
  'historical_understanding',
  'scientific_context',
  'engineering_context',
  'research_context',
  'motivation',
  'reflection',
  'knowledge_connection',
  'timeline_visualization',
  'innovation_story',
  'critical_thinking',
] as const;

export type EvolutionPurpose = (typeof CANONICAL_EVOLUTION_PURPOSES)[number];

// ---------------------------------------------------------------------------
// Canonical Knowledge Evolution Status (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_KNOWLEDGE_EVOLUTION_STATUS = [
  'draft',
  'review',
  'approved',
  'published',
  'deprecated',
  'archived',
] as const;

export type KnowledgeEvolutionStatus = (typeof CANONICAL_KNOWLEDGE_EVOLUTION_STATUS)[number];

// ---------------------------------------------------------------------------
// Knowledge Evolution Provenance
// ---------------------------------------------------------------------------

export interface KnowledgeEvolutionProvenance {
  readonly provider: string;
  readonly source: string;
  readonly rationale: string;
  readonly version: string;
}

// ---------------------------------------------------------------------------
// Knowledge Evolution Decision
// ---------------------------------------------------------------------------

export interface KnowledgeEvolutionDecision {
  readonly decisionId: string;
  readonly profileId: string;
  readonly validationPassed: boolean;
  readonly validationErrors: readonly string[];
}

// ---------------------------------------------------------------------------
// Knowledge Evolution Trace
// ---------------------------------------------------------------------------

export interface KnowledgeEvolutionTrace {
  readonly traceId: string;
  readonly generatedFrom: 'deterministic_knowledge_evolution_kernel';
  readonly deterministic: true;
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Knowledge Evolution Profile
// ---------------------------------------------------------------------------

export interface KnowledgeEvolutionProfile {
  readonly id: string;
  readonly title: string;
  readonly discoveryType: DiscoveryType;
  readonly evolutionStage: EvolutionStage;
  readonly researchTrailType: ResearchTrailType;
  readonly evolutionPurpose: EvolutionPurpose;
  readonly conceptIds: readonly string[];
  readonly status: KnowledgeEvolutionStatus;
  readonly governance: CuriosityGovernance;
  readonly provenance: KnowledgeEvolutionProvenance;
  readonly trace: KnowledgeEvolutionTrace;
}

// ---------------------------------------------------------------------------
// Historical Oddity
// ---------------------------------------------------------------------------

export interface HistoricalOddity {
  readonly oddityId: string;
  readonly title: string;
  readonly oddityType: OddityType;
  readonly historicalContext: string;
  readonly unexpectedElement: string;
  readonly lessonLearned: string;
  readonly conceptIds: readonly string[];
  readonly status: KnowledgeEvolutionStatus;
  readonly governance: CuriosityGovernance;
  readonly provenance: KnowledgeEvolutionProvenance;
  readonly trace: KnowledgeEvolutionTrace;
}

// ---------------------------------------------------------------------------
// Research Trail
// ---------------------------------------------------------------------------

export interface ResearchTrail {
  readonly trailId: string;
  readonly title: string;
  readonly trailType: ResearchTrailType;
  readonly trailDescription: string;
  readonly keyContributors: readonly string[];
  readonly breakthroughMoment: string;
  readonly impactAssessment: string;
  readonly conceptIds: readonly string[];
  readonly status: KnowledgeEvolutionStatus;
  readonly governance: CuriosityGovernance;
  readonly provenance: KnowledgeEvolutionProvenance;
  readonly trace: KnowledgeEvolutionTrace;
}

// ---------------------------------------------------------------------------
// Evolution Milestone
// ---------------------------------------------------------------------------

export interface EvolutionMilestone {
  readonly milestoneId: string;
  readonly profileId: string;
  readonly title: string;
  readonly stage: EvolutionStage;
  readonly year: string;
  readonly description: string;
  readonly significance: string;
}

// ---------------------------------------------------------------------------
// Evolution Relationship
// ---------------------------------------------------------------------------

export interface EvolutionRelationship {
  readonly relationshipId: string;
  readonly sourceProfileId: string;
  readonly targetProfileId: string;
  readonly relationshipType: string;
  readonly description: string;
  readonly provenance: KnowledgeEvolutionProvenance;
}

// ---------------------------------------------------------------------------
// Knowledge Evolution Registry Metadata
// ---------------------------------------------------------------------------

export interface KnowledgeEvolutionRegistryMetadata {
  readonly registryId: string;
  readonly version: string;
  readonly profileCount: number;
  readonly oddityCount: number;
  readonly trailCount: number;
  readonly milestoneCount: number;
  readonly relationshipCount: number;
}

// ---------------------------------------------------------------------------
// Knowledge Evolution Registry
// ---------------------------------------------------------------------------

export interface KnowledgeEvolutionRegistry {
  readonly registryId: string;
  readonly profiles: readonly KnowledgeEvolutionProfile[];
  readonly oddities: readonly HistoricalOddity[];
  readonly trails: readonly ResearchTrail[];
  readonly milestones: readonly EvolutionMilestone[];
  readonly relationships: readonly EvolutionRelationship[];
  readonly metadata: KnowledgeEvolutionRegistryMetadata;
  readonly trace: KnowledgeEvolutionTrace;
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_knowledge_evolution_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Knowledge Evolution Input
// ---------------------------------------------------------------------------

export interface KnowledgeEvolutionInput {
  readonly profiles: readonly KnowledgeEvolutionProfile[];
  readonly oddities: readonly HistoricalOddity[];
  readonly trails: readonly ResearchTrail[];
  readonly milestones: readonly EvolutionMilestone[];
  readonly relationships: readonly EvolutionRelationship[];
}

// ---------------------------------------------------------------------------
// Curiosity Artifact With Knowledge Evolution
// ---------------------------------------------------------------------------

export interface CuriosityArtifactWithKnowledgeEvolution {
  readonly curiosityId: string;
  readonly title: string;
  readonly profiles: readonly KnowledgeEvolutionProfile[];
  readonly oddities: readonly HistoricalOddity[];
  readonly trails: readonly ResearchTrail[];
  readonly milestones: readonly EvolutionMilestone[];
  readonly relationships: readonly EvolutionRelationship[];
  readonly provenance: KnowledgeEvolutionProvenance;
}

// ---------------------------------------------------------------------------
// Knowledge Evolution Validation Error
// ---------------------------------------------------------------------------

export interface KnowledgeEvolutionValidationError {
  readonly code: string;
  readonly message: string;
  readonly field?: string;
  readonly profileId?: string;
}

// ---------------------------------------------------------------------------
// Knowledge Evolution Validation Result
// ---------------------------------------------------------------------------

export interface KnowledgeEvolutionValidationResult {
  readonly valid: boolean;
  readonly errors: readonly KnowledgeEvolutionValidationError[];
}

// ---------------------------------------------------------------------------
// Knowledge Evolution Registry Validation Result
// ---------------------------------------------------------------------------

export interface KnowledgeEvolutionRegistryValidationResult {
  readonly valid: boolean;
  readonly errors: readonly KnowledgeEvolutionValidationError[];
  readonly checkedAt: 'knowledge_evolution_registry_composition';
}

// ---------------------------------------------------------------------------
// Knowledge Evolution Input Validation Result
// ---------------------------------------------------------------------------

export interface KnowledgeEvolutionInputValidationResult {
  readonly valid: boolean;
  readonly errors: readonly KnowledgeEvolutionValidationError[];
  readonly checkedAt: 'knowledge_evolution_input_composition';
}

// ---------------------------------------------------------------------------
// Knowledge Evolution Trace Validation Result
// ---------------------------------------------------------------------------

export interface KnowledgeEvolutionTraceValidationResult {
  readonly valid: boolean;
  readonly errors: readonly KnowledgeEvolutionValidationError[];
  readonly checkedAt: 'knowledge_evolution_trace_composition';
}

// ---------------------------------------------------------------------------
// Curiosity Artifact With Knowledge Evolution Validation Result
// ---------------------------------------------------------------------------

export interface CuriosityArtifactWithKnowledgeEvolutionValidationResult {
  readonly valid: boolean;
  readonly errors: readonly KnowledgeEvolutionValidationError[];
  readonly checkedAt: 'curiosity_artifact_with_knowledge_evolution_composition';
}

// ============================================================================
// D9-OPT-07 — Unexpected Connection, Limitation Warning & Application Surprise Modeling
// ============================================================================

// ---------------------------------------------------------------------------
// Canonical Connection Types (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_CONNECTION_TYPES = [
  'cross_domain',
  'cross_discipline',
  'historical',
  'engineering',
  'scientific',
  'mathematical',
  'technological',
  'philosophical',
  'industrial',
  'unexpected',
] as const;

export type ConnectionType = (typeof CANONICAL_CONNECTION_TYPES)[number];

// ---------------------------------------------------------------------------
// Canonical Limitation Types (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_LIMITATION_TYPES = [
  'computational',
  'theoretical',
  'physical',
  'engineering',
  'mathematical',
  'practical',
  'economic',
  'historical',
  'ethical',
  'domain_specific',
] as const;

export type LimitationType = (typeof CANONICAL_LIMITATION_TYPES)[number];

// ---------------------------------------------------------------------------
// Canonical Surprise Types (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_SURPRISE_TYPES = [
  'unexpected_application',
  'counterintuitive_result',
  'historical_fact',
  'technology_origin',
  'engineering_tradeoff',
  'research_discovery',
  'scientific_paradox',
  'industrial_usage',
  'everyday_application',
  'future_implication',
] as const;

export type SurpriseType = (typeof CANONICAL_SURPRISE_TYPES)[number];

// ---------------------------------------------------------------------------
// Canonical Discovery Impact (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_DISCOVERY_IMPACT = [
  'attention',
  'engagement',
  'memory',
  'understanding',
  'motivation',
  'reflection',
  'application',
  'perspective',
  'exploration',
  'retention',
] as const;

export type DiscoveryImpact = (typeof CANONICAL_DISCOVERY_IMPACT)[number];

// ---------------------------------------------------------------------------
// Canonical Discovery Status (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_DISCOVERY_STATUS = [
  'draft',
  'review',
  'approved',
  'published',
  'deprecated',
  'archived',
] as const;

export type DiscoveryStatus = (typeof CANONICAL_DISCOVERY_STATUS)[number];

// ---------------------------------------------------------------------------
// Unexpected Connection Provenance
// ---------------------------------------------------------------------------

export interface UnexpectedConnectionProvenance {
  readonly provider: string;
  readonly source: string;
  readonly rationale: string;
  readonly version: string;
}

// ---------------------------------------------------------------------------
// Unexpected Connection Decision
// ---------------------------------------------------------------------------

export interface UnexpectedConnectionDecision {
  readonly decisionId: string;
  readonly profileId: string;
  readonly validationPassed: boolean;
  readonly validationErrors: readonly string[];
}

// ---------------------------------------------------------------------------
// Unexpected Connection Trace
// ---------------------------------------------------------------------------

export interface UnexpectedConnectionTrace {
  readonly traceId: string;
  readonly generatedFrom: 'deterministic_unexpected_connection_kernel';
  readonly deterministic: true;
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Unexpected Connection Profile
// ---------------------------------------------------------------------------

export interface UnexpectedConnectionProfile {
  readonly id: string;
  readonly title: string;
  readonly connectionType: ConnectionType;
  readonly limitationType: LimitationType;
  readonly surpriseType: SurpriseType;
  readonly discoveryImpact: DiscoveryImpact;
  readonly conceptIds: readonly string[];
  readonly status: DiscoveryStatus;
  readonly governance: CuriosityGovernance;
  readonly provenance: UnexpectedConnectionProvenance;
  readonly trace: UnexpectedConnectionTrace;
}

// ---------------------------------------------------------------------------
// Limitation Warning
// ---------------------------------------------------------------------------

export interface LimitationWarning {
  readonly warningId: string;
  readonly title: string;
  readonly limitationType: LimitationType;
  readonly limitationDescription: string;
  readonly impactAssessment: string;
  readonly mitigationStrategy: string;
  readonly conceptIds: readonly string[];
  readonly status: DiscoveryStatus;
  readonly governance: CuriosityGovernance;
  readonly provenance: UnexpectedConnectionProvenance;
  readonly trace: UnexpectedConnectionTrace;
}

// ---------------------------------------------------------------------------
// Application Surprise
// ---------------------------------------------------------------------------

export interface ApplicationSurprise {
  readonly surpriseId: string;
  readonly title: string;
  readonly surpriseType: SurpriseType;
  readonly originalContext: string;
  readonly unexpectedApplication: string;
  readonly whySurprising: string;
  readonly conceptIds: readonly string[];
  readonly status: DiscoveryStatus;
  readonly governance: CuriosityGovernance;
  readonly provenance: UnexpectedConnectionProvenance;
  readonly trace: UnexpectedConnectionTrace;
}

// ---------------------------------------------------------------------------
// Discovery Relationship
// ---------------------------------------------------------------------------

export interface DiscoveryRelationship {
  readonly relationshipId: string;
  readonly sourceProfileId: string;
  readonly targetProfileId: string;
  readonly relationshipType: string;
  readonly description: string;
  readonly provenance: UnexpectedConnectionProvenance;
}

// ---------------------------------------------------------------------------
// Discovery Registry Metadata
// ---------------------------------------------------------------------------

export interface DiscoveryRegistryMetadata {
  readonly registryId: string;
  readonly version: string;
  readonly connectionCount: number;
  readonly limitationCount: number;
  readonly surpriseCount: number;
  readonly relationshipCount: number;
}

// ---------------------------------------------------------------------------
// Discovery Registry
// ---------------------------------------------------------------------------

export interface DiscoveryRegistry {
  readonly registryId: string;
  readonly connections: readonly UnexpectedConnectionProfile[];
  readonly limitations: readonly LimitationWarning[];
  readonly surprises: readonly ApplicationSurprise[];
  readonly relationships: readonly DiscoveryRelationship[];
  readonly metadata: DiscoveryRegistryMetadata;
  readonly trace: UnexpectedConnectionTrace;
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_unexpected_connection_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Discovery Input
// ---------------------------------------------------------------------------

export interface DiscoveryInput {
  readonly connections: readonly UnexpectedConnectionProfile[];
  readonly limitations: readonly LimitationWarning[];
  readonly surprises: readonly ApplicationSurprise[];
  readonly relationships: readonly DiscoveryRelationship[];
}

// ---------------------------------------------------------------------------
// Curiosity Artifact With Discoveries
// ---------------------------------------------------------------------------

export interface CuriosityArtifactWithDiscoveries {
  readonly curiosityId: string;
  readonly title: string;
  readonly connections: readonly UnexpectedConnectionProfile[];
  readonly limitations: readonly LimitationWarning[];
  readonly surprises: readonly ApplicationSurprise[];
  readonly relationships: readonly DiscoveryRelationship[];
  readonly provenance: UnexpectedConnectionProvenance;
}

// ---------------------------------------------------------------------------
// Discovery Validation Error
// ---------------------------------------------------------------------------

export interface DiscoveryValidationError {
  readonly code: string;
  readonly message: string;
  readonly field?: string;
  readonly profileId?: string;
}

// ---------------------------------------------------------------------------
// Discovery Validation Result
// ---------------------------------------------------------------------------

export interface DiscoveryValidationResult {
  readonly valid: boolean;
  readonly errors: readonly DiscoveryValidationError[];
}

// ---------------------------------------------------------------------------
// Discovery Registry Validation Result
// ---------------------------------------------------------------------------

export interface DiscoveryRegistryValidationResult {
  readonly valid: boolean;
  readonly errors: readonly DiscoveryValidationError[];
  readonly checkedAt: 'discovery_registry_composition';
}

// ---------------------------------------------------------------------------
// Discovery Input Validation Result
// ---------------------------------------------------------------------------

export interface DiscoveryInputValidationResult {
  readonly valid: boolean;
  readonly errors: readonly DiscoveryValidationError[];
  readonly checkedAt: 'discovery_input_composition';
}

// ---------------------------------------------------------------------------
// Discovery Trace Validation Result
// ---------------------------------------------------------------------------

export interface DiscoveryTraceValidationResult {
  readonly valid: boolean;
  readonly errors: readonly DiscoveryValidationError[];
  readonly checkedAt: 'discovery_trace_composition';
}

// ---------------------------------------------------------------------------
// Curiosity Artifact With Discoveries Validation Result
// ---------------------------------------------------------------------------

export interface CuriosityArtifactWithDiscoveriesValidationResult {
  readonly valid: boolean;
  readonly errors: readonly DiscoveryValidationError[];
  readonly checkedAt: 'curiosity_artifact_with_discoveries_composition';
}

// ============================================================================
// D9-OPT-08 — Laboratory Challenge, What-If Prompt & Experiment Curiosity Modeling
// ============================================================================

// ---------------------------------------------------------------------------
// Canonical Laboratory Challenge Types (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_LAB_CHALLENGE_TYPES = [
  'prediction',
  'implementation',
  'observation',
  'comparison',
  'optimization',
  'failure_analysis',
  'reverse_engineering',
  'parameter_variation',
  'constraint_testing',
  'engineering_validation',
] as const;

export type LabChallengeType = (typeof CANONICAL_LAB_CHALLENGE_TYPES)[number];

// ---------------------------------------------------------------------------
// Canonical What-If Types (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_WHATS_IF_TYPES = [
  'parameter_change',
  'architecture_change',
  'algorithm_change',
  'dataset_change',
  'hardware_change',
  'environment_change',
  'constraint_change',
  'scale_change',
  'assumption_change',
  'failure_scenario',
] as const;

export type WhatsIfType = (typeof CANONICAL_WHATS_IF_TYPES)[number];

// ---------------------------------------------------------------------------
// Canonical Experiment Types (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_EXPERIMENT_TYPES = [
  'thought_experiment',
  'laboratory_experiment',
  'engineering_experiment',
  'simulation_candidate',
  'observation',
  'comparison',
  'measurement',
  'validation',
  'reproduction',
  'exploration',
] as const;

export type ExperimentType = (typeof CANONICAL_EXPERIMENT_TYPES)[number];

// ---------------------------------------------------------------------------
// Canonical Exploration Objectives (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_EXPLORATION_OBJECTIVES = [
  'curiosity',
  'reasoning',
  'validation',
  'engineering_understanding',
  'system_behavior',
  'concept_reinforcement',
  'failure_analysis',
  'hypothesis',
  'exploration',
  'reflection',
] as const;

export type ExplorationObjective = (typeof CANONICAL_EXPLORATION_OBJECTIVES)[number];

// ---------------------------------------------------------------------------
// Canonical Exploration Status (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_EXPLORATION_STATUS = [
  'draft',
  'review',
  'approved',
  'published',
  'deprecated',
  'archived',
] as const;

export type ExplorationStatus = (typeof CANONICAL_EXPLORATION_STATUS)[number];

// ---------------------------------------------------------------------------
// Laboratory Curiosity Provenance
// ---------------------------------------------------------------------------

export interface LaboratoryCuriosityProvenance {
  readonly provider: string;
  readonly source: string;
  readonly rationale: string;
  readonly version: string;
}

// ---------------------------------------------------------------------------
// Laboratory Curiosity Decision
// ---------------------------------------------------------------------------

export interface LaboratoryCuriosityDecision {
  readonly decisionId: string;
  readonly profileId: string;
  readonly validationPassed: boolean;
  readonly validationErrors: readonly string[];
}

// ---------------------------------------------------------------------------
// Laboratory Curiosity Trace
// ---------------------------------------------------------------------------

export interface LaboratoryCuriosityTrace {
  readonly traceId: string;
  readonly generatedFrom: 'deterministic_laboratory_curiosity_kernel';
  readonly deterministic: true;
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Laboratory Challenge
// ---------------------------------------------------------------------------

export interface LaboratoryChallenge {
  readonly challengeId: string;
  readonly title: string;
  readonly challengeType: LabChallengeType;
  readonly challengeDescription: string;
  readonly expectedOutcome: string;
  readonly difficultyLevel: string;
  readonly conceptIds: readonly string[];
  readonly status: ExplorationStatus;
  readonly governance: CuriosityGovernance;
  readonly provenance: LaboratoryCuriosityProvenance;
  readonly trace: LaboratoryCuriosityTrace;
}

// ---------------------------------------------------------------------------
// What-If Prompt
// ---------------------------------------------------------------------------

export interface WhatIfPrompt {
  readonly promptId: string;
  readonly title: string;
  readonly promptType: WhatsIfType;
  readonly promptDescription: string;
  readonly expectedInsight: string;
  readonly conceptIds: readonly string[];
  readonly status: ExplorationStatus;
  readonly governance: CuriosityGovernance;
  readonly provenance: LaboratoryCuriosityProvenance;
  readonly trace: LaboratoryCuriosityTrace;
}

// ---------------------------------------------------------------------------
// Experiment Curiosity
// ---------------------------------------------------------------------------

export interface ExperimentCuriosity {
  readonly experimentId: string;
  readonly title: string;
  readonly experimentType: ExperimentType;
  readonly experimentDescription: string;
  readonly hypothesis: string;
  readonly expectedResult: string;
  readonly conceptIds: readonly string[];
  readonly status: ExplorationStatus;
  readonly governance: CuriosityGovernance;
  readonly provenance: LaboratoryCuriosityProvenance;
  readonly trace: LaboratoryCuriosityTrace;
}

// ---------------------------------------------------------------------------
// Exploration Relationship
// ---------------------------------------------------------------------------

export interface ExplorationRelationship {
  readonly relationshipId: string;
  readonly sourceProfileId: string;
  readonly targetProfileId: string;
  readonly relationshipType: string;
  readonly description: string;
  readonly provenance: LaboratoryCuriosityProvenance;
}

// ---------------------------------------------------------------------------
// Exploration Registry Metadata
// ---------------------------------------------------------------------------

export interface ExplorationRegistryMetadata {
  readonly registryId: string;
  readonly version: string;
  readonly challengeCount: number;
  readonly promptCount: number;
  readonly experimentCount: number;
  readonly relationshipCount: number;
}

// ---------------------------------------------------------------------------
// Exploration Registry
// ---------------------------------------------------------------------------

export interface ExplorationRegistry {
  readonly registryId: string;
  readonly challenges: readonly LaboratoryChallenge[];
  readonly prompts: readonly WhatIfPrompt[];
  readonly experiments: readonly ExperimentCuriosity[];
  readonly relationships: readonly ExplorationRelationship[];
  readonly metadata: ExplorationRegistryMetadata;
  readonly trace: LaboratoryCuriosityTrace;
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_laboratory_curiosity_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Exploration Input
// ---------------------------------------------------------------------------

export interface ExplorationInput {
  readonly challenges: readonly LaboratoryChallenge[];
  readonly prompts: readonly WhatIfPrompt[];
  readonly experiments: readonly ExperimentCuriosity[];
  readonly relationships: readonly ExplorationRelationship[];
}

// ---------------------------------------------------------------------------
// Curiosity Artifact With Exploration
// ---------------------------------------------------------------------------

export interface CuriosityArtifactWithExploration {
  readonly curiosityId: string;
  readonly title: string;
  readonly challenges: readonly LaboratoryChallenge[];
  readonly prompts: readonly WhatIfPrompt[];
  readonly experiments: readonly ExperimentCuriosity[];
  readonly relationships: readonly ExplorationRelationship[];
  readonly provenance: LaboratoryCuriosityProvenance;
}

// ---------------------------------------------------------------------------
// Exploration Validation Error
// ---------------------------------------------------------------------------

export interface ExplorationValidationError {
  readonly code: string;
  readonly message: string;
  readonly field?: string;
  readonly profileId?: string;
}

// ---------------------------------------------------------------------------
// Exploration Validation Result
// ---------------------------------------------------------------------------

export interface ExplorationValidationResult {
  readonly valid: boolean;
  readonly errors: readonly ExplorationValidationError[];
}

// ---------------------------------------------------------------------------
// Exploration Registry Validation Result
// ---------------------------------------------------------------------------

export interface ExplorationRegistryValidationResult {
  readonly valid: boolean;
  readonly errors: readonly ExplorationValidationError[];
  readonly checkedAt: 'exploration_registry_composition';
}

// ---------------------------------------------------------------------------
// Exploration Input Validation Result
// ---------------------------------------------------------------------------

export interface ExplorationInputValidationResult {
  readonly valid: boolean;
  readonly errors: readonly ExplorationValidationError[];
  readonly checkedAt: 'exploration_input_composition';
}

// ---------------------------------------------------------------------------
// Exploration Trace Validation Result
// ---------------------------------------------------------------------------

export interface ExplorationTraceValidationResult {
  readonly valid: boolean;
  readonly errors: readonly ExplorationValidationError[];
  readonly checkedAt: 'exploration_trace_composition';
}

// ---------------------------------------------------------------------------
// Curiosity Artifact With Exploration Validation Result
// ---------------------------------------------------------------------------

export interface CuriosityArtifactWithExplorationValidationResult {
  readonly valid: boolean;
  readonly errors: readonly ExplorationValidationError[];
  readonly checkedAt: 'curiosity_artifact_with_exploration_composition';
}

// ============================================================================
// D9-OPT-09 — Misconception Card & Assessment Reinforcement Curiosity Modeling
// ============================================================================

// ---------------------------------------------------------------------------
// Canonical Misconception Card Types (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_MISCONCEPTION_CARD_TYPES = [
  'classic_misconception',
  'engineering_trap',
  'mathematical_error',
  'algorithm_confusion',
  'architecture_confusion',
  'historical_misbelief',
  'visual_misinterpretation',
  'terminology_confusion',
  'counterintuitive_fact',
  'false_intuition',
] as const;

export type MisconceptionCardType = (typeof CANONICAL_MISCONCEPTION_CARD_TYPES)[number];

// ---------------------------------------------------------------------------
// Canonical Reinforcement Reference Types (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_REINFORCEMENT_REFERENCE_TYPES = [
  'concept_review',
  'visual_review',
  'worked_example',
  'engineering_case',
  'comparison',
  'field_note',
  'experiment',
  'knowledge_reference',
  'laboratory_reference',
  'reflection',
] as const;

export type ReinforcementReferenceType = (typeof CANONICAL_REINFORCEMENT_REFERENCE_TYPES)[number];

// ---------------------------------------------------------------------------
// Canonical Misconception Importance (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_MISCONCEPTION_IMPORTANCE = [
  'minimal',
  'low',
  'moderate',
  'high',
  'critical',
  'canonical',
  'frequent',
  'rare',
  'advanced',
  'expert',
] as const;

export type MisconceptionImportance = (typeof CANONICAL_MISCONCEPTION_IMPORTANCE)[number];

// ---------------------------------------------------------------------------
// Canonical Corrective Outcomes (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_CORRECTIVE_OUTCOMES = [
  'concept_clarity',
  'mental_model_update',
  'engineering_awareness',
  'historical_understanding',
  'reasoning_improvement',
  'visual_interpretation',
  'application_awareness',
  'terminology_precision',
  'reflection',
  'long_term_retention',
] as const;

export type CorrectiveOutcome = (typeof CANONICAL_CORRECTIVE_OUTCOMES)[number];

// ---------------------------------------------------------------------------
// Canonical Misconception Curiosity Status (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_MISCONCEPTION_CURIOSITY_STATUS = [
  'draft',
  'review',
  'approved',
  'published',
  'deprecated',
  'archived',
] as const;

export type MisconceptionCuriosityStatus = (typeof CANONICAL_MISCONCEPTION_CURIOSITY_STATUS)[number];

// ---------------------------------------------------------------------------
// Misconception Curiosity Provenance
// ---------------------------------------------------------------------------

export interface MisconceptionCuriosityProvenance {
  readonly provider: string;
  readonly source: string;
  readonly rationale: string;
  readonly version: string;
}

// ---------------------------------------------------------------------------
// Misconception Curiosity Decision
// ---------------------------------------------------------------------------

export interface MisconceptionCuriosityDecision {
  readonly decisionId: string;
  readonly profileId: string;
  readonly validationPassed: boolean;
  readonly validationErrors: readonly string[];
}

// ---------------------------------------------------------------------------
// Misconception Curiosity Trace
// ---------------------------------------------------------------------------

export interface MisconceptionCuriosityTrace {
  readonly traceId: string;
  readonly generatedFrom: 'deterministic_misconception_curiosity_kernel';
  readonly deterministic: true;
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Misconception Card
// ---------------------------------------------------------------------------

export interface MisconceptionCard {
  readonly cardId: string;
  readonly title: string;
  readonly cardType: MisconceptionCardType;
  readonly misconceptionDescription: string;
  readonly correctionDescription: string;
  readonly importance: MisconceptionImportance;
  readonly conceptIds: readonly string[];
  readonly status: MisconceptionCuriosityStatus;
  readonly governance: CuriosityGovernance;
  readonly provenance: MisconceptionCuriosityProvenance;
  readonly trace: MisconceptionCuriosityTrace;
}

// ---------------------------------------------------------------------------
// Assessment Reinforcement Reference
// ---------------------------------------------------------------------------

export interface AssessmentReinforcementReference {
  readonly referenceId: string;
  readonly title: string;
  readonly referenceType: ReinforcementReferenceType;
  readonly referenceDescription: string;
  readonly relatedCardId: string;
  readonly conceptIds: readonly string[];
  readonly status: MisconceptionCuriosityStatus;
  readonly governance: CuriosityGovernance;
  readonly provenance: MisconceptionCuriosityProvenance;
  readonly trace: MisconceptionCuriosityTrace;
}

// ---------------------------------------------------------------------------
// Corrective Insight
// ---------------------------------------------------------------------------

export interface CorrectiveInsight {
  readonly insightId: string;
  readonly cardId: string;
  readonly insightTitle: string;
  readonly insightDescription: string;
  readonly correctiveOutcome: CorrectiveOutcome;
  readonly conceptIds: readonly string[];
  readonly status: MisconceptionCuriosityStatus;
  readonly governance: CuriosityGovernance;
  readonly provenance: MisconceptionCuriosityProvenance;
  readonly trace: MisconceptionCuriosityTrace;
}

// ---------------------------------------------------------------------------
// Misconception Relationship
// ---------------------------------------------------------------------------

export interface MisconceptionRelationship {
  readonly relationshipId: string;
  readonly sourceCardId: string;
  readonly targetCardId: string;
  readonly relationshipType: string;
  readonly description: string;
  readonly provenance: MisconceptionCuriosityProvenance;
}

// ---------------------------------------------------------------------------
// Misconception Registry Metadata
// ---------------------------------------------------------------------------

export interface MisconceptionRegistryMetadata {
  readonly registryId: string;
  readonly version: string;
  readonly cardCount: number;
  readonly referenceCount: number;
  readonly insightCount: number;
  readonly relationshipCount: number;
}

// ---------------------------------------------------------------------------
// Misconception Registry
// ---------------------------------------------------------------------------

export interface MisconceptionRegistry {
  readonly registryId: string;
  readonly cards: readonly MisconceptionCard[];
  readonly references: readonly AssessmentReinforcementReference[];
  readonly insights: readonly CorrectiveInsight[];
  readonly relationships: readonly MisconceptionRelationship[];
  readonly metadata: MisconceptionRegistryMetadata;
  readonly trace: MisconceptionCuriosityTrace;
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_misconception_curiosity_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Misconception Input
// ---------------------------------------------------------------------------

export interface MisconceptionInput {
  readonly cards: readonly MisconceptionCard[];
  readonly references: readonly AssessmentReinforcementReference[];
  readonly insights: readonly CorrectiveInsight[];
  readonly relationships: readonly MisconceptionRelationship[];
}

// ---------------------------------------------------------------------------
// Curiosity Artifact With Misconceptions
// ---------------------------------------------------------------------------

export interface CuriosityArtifactWithMisconceptions {
  readonly curiosityId: string;
  readonly title: string;
  readonly cards: readonly MisconceptionCard[];
  readonly references: readonly AssessmentReinforcementReference[];
  readonly insights: readonly CorrectiveInsight[];
  readonly relationships: readonly MisconceptionRelationship[];
  readonly provenance: MisconceptionCuriosityProvenance;
}

// ---------------------------------------------------------------------------
// Misconception Curiosity Validation Error
// ---------------------------------------------------------------------------

export interface MisconceptionCuriosityValidationError {
  readonly code: string;
  readonly message: string;
  readonly field?: string;
  readonly profileId?: string;
}

// ---------------------------------------------------------------------------
// Misconception Curiosity Validation Result
// ---------------------------------------------------------------------------

export interface MisconceptionCuriosityValidationResult {
  readonly valid: boolean;
  readonly errors: readonly MisconceptionCuriosityValidationError[];
}

// ---------------------------------------------------------------------------
// Misconception Registry Validation Result
// ---------------------------------------------------------------------------

export interface MisconceptionRegistryValidationResult {
  readonly valid: boolean;
  readonly errors: readonly MisconceptionCuriosityValidationError[];
  readonly checkedAt: 'misconception_registry_composition';
}

// ---------------------------------------------------------------------------
// Misconception Input Validation Result
// ---------------------------------------------------------------------------

export interface MisconceptionInputValidationResult {
  readonly valid: boolean;
  readonly errors: readonly MisconceptionCuriosityValidationError[];
  readonly checkedAt: 'misconception_input_composition';
}

// ---------------------------------------------------------------------------
// Misconception Trace Validation Result
// ---------------------------------------------------------------------------

export interface MisconceptionTraceValidationResult {
  readonly valid: boolean;
  readonly errors: readonly MisconceptionCuriosityValidationError[];
  readonly checkedAt: 'misconception_trace_composition';
}

// ---------------------------------------------------------------------------
// Curiosity Artifact With Misconceptions Validation Result
// ---------------------------------------------------------------------------

export interface CuriosityArtifactWithMisconceptionsValidationResult {
  readonly valid: boolean;
  readonly errors: readonly MisconceptionCuriosityValidationError[];
  readonly checkedAt: 'curiosity_artifact_with_misconceptions_composition';
}

// ============================================================================
// D9-OPT-10 — Visual Curiosity Presentation & Accessibility Metadata
// ============================================================================

// ---------------------------------------------------------------------------
// Canonical Visual Presentation Types (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_VISUAL_PRESENTATION_TYPES = [
  'card',
  'callout',
  'sidebar',
  'modal',
  'tooltip',
  'banner',
  'badge',
  'chip',
  'tag',
  'annotation',
] as const;

export type VisualPresentationType = (typeof CANONICAL_VISUAL_PRESENTATION_TYPES)[number];

// ---------------------------------------------------------------------------
// Canonical Visual Hierarchy (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_VISUAL_HIERARCHY = [
  'primary',
  'secondary',
  'tertiary',
  'quaternary',
  'accent',
  'subtle',
  'prominent',
  'inline',
  'standalone',
  'grouped',
] as const;

export type VisualHierarchy = (typeof CANONICAL_VISUAL_HIERARCHY)[number];

// ---------------------------------------------------------------------------
// Canonical Accessibility Levels (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_ACCESSIBILITY_LEVELS = [
  'wcag_a',
  'wcag_aa',
  'wcag_aaa',
  'screen_reader',
  'keyboard_only',
  'voice_control',
  'high_contrast',
  'reduced_motion',
  'cognitive_support',
  'full_accessibility',
] as const;

export type AccessibilityLevel = (typeof CANONICAL_ACCESSIBILITY_LEVELS)[number];

// ---------------------------------------------------------------------------
// Canonical Reading Flow (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_READING_FLOW = [
  'sequential',
  'hierarchical',
  'non_sequential',
  'scannable',
  'focused',
  'branching',
  'progressive',
  'modular',
  'linear',
  'reference',
] as const;

export type ReadingFlow = (typeof CANONICAL_READING_FLOW)[number];

// ---------------------------------------------------------------------------
// Canonical Visual Emphasis (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_VISUAL_EMPHASIS = [
  'bold',
  'italic',
  'underline',
  'highlight',
  'color_accent',
  'icon',
  'animation',
  'size_variation',
  'spacing',
  'border',
] as const;

export type VisualEmphasis = (typeof CANONICAL_VISUAL_EMPHASIS)[number];

// ---------------------------------------------------------------------------
// Canonical Visual Presentation Status (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_VISUAL_PRESENTATION_STATUS = [
  'draft',
  'review',
  'approved',
  'published',
  'deprecated',
  'archived',
] as const;

export type VisualPresentationStatus = (typeof CANONICAL_VISUAL_PRESENTATION_STATUS)[number];

// ---------------------------------------------------------------------------
// Visual Presentation Provenance
// ---------------------------------------------------------------------------

export interface VisualPresentationProvenance {
  readonly provider: string;
  readonly source: string;
  readonly rationale: string;
  readonly version: string;
}

// ---------------------------------------------------------------------------
// Visual Presentation Decision
// ---------------------------------------------------------------------------

export interface VisualPresentationDecision {
  readonly decisionId: string;
  readonly profileId: string;
  readonly validationPassed: boolean;
  readonly validationErrors: readonly string[];
}

// ---------------------------------------------------------------------------
// Visual Presentation Trace
// ---------------------------------------------------------------------------

export interface VisualPresentationTrace {
  readonly traceId: string;
  readonly generatedFrom: 'deterministic_visual_presentation_kernel';
  readonly deterministic: true;
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Visual Presentation Profile
// ---------------------------------------------------------------------------

export interface VisualPresentationProfile {
  readonly profileId: string;
  readonly title: string;
  readonly presentationType: VisualPresentationType;
  readonly visualHierarchy: VisualHierarchy;
  readonly accessibilityLevel: AccessibilityLevel;
  readonly readingFlow: ReadingFlow;
  readonly conceptIds: readonly string[];
  readonly status: VisualPresentationStatus;
  readonly governance: CuriosityGovernance;
  readonly provenance: VisualPresentationProvenance;
  readonly trace: VisualPresentationTrace;
}

// ---------------------------------------------------------------------------
// Accessibility Metadata
// ---------------------------------------------------------------------------

export interface AccessibilityMetadata {
  readonly metadataId: string;
  readonly profileId: string;
  readonly accessibilityLevel: AccessibilityLevel;
  readonly screenReaderSupport: boolean;
  readonly keyboardNavigation: boolean;
  readonly voiceControl: boolean;
  readonly highContrast: boolean;
  readonly reducedMotion: boolean;
  readonly cognitiveSupport: boolean;
  readonly altText: string;
  readonly ariaLabel: string;
  readonly tabIndex: number;
}

// ---------------------------------------------------------------------------
// Reading Flow Metadata
// ---------------------------------------------------------------------------

export interface ReadingFlowMetadata {
  readonly metadataId: string;
  readonly profileId: string;
  readonly readingFlow: ReadingFlow;
  readonly scannable: boolean;
  readonly progressiveDisclosure: boolean;
  readonly chunkSize: string;
  readonly readingOrder: number;
  readonly cognitiveLoad: string;
}

// ---------------------------------------------------------------------------
// Visual Emphasis Metadata
// ---------------------------------------------------------------------------

export interface VisualEmphasisMetadata {
  readonly metadataId: string;
  readonly profileId: string;
  readonly emphasisType: VisualEmphasis;
  readonly intensity: string;
  readonly colorAccent: string;
  readonly iconReference: string;
  readonly animationStyle: string;
  readonly sizeVariation: string;
}

// ---------------------------------------------------------------------------
// Presentation Relationship
// ---------------------------------------------------------------------------

export interface PresentationRelationship {
  readonly relationshipId: string;
  readonly sourceProfileId: string;
  readonly targetProfileId: string;
  readonly relationshipType: string;
  readonly description: string;
  readonly provenance: VisualPresentationProvenance;
}

// ---------------------------------------------------------------------------
// Presentation Registry Metadata
// ---------------------------------------------------------------------------

export interface PresentationRegistryMetadata {
  readonly registryId: string;
  readonly version: string;
  readonly profileCount: number;
  readonly accessibilityCount: number;
  readonly readingFlowCount: number;
  readonly emphasisCount: number;
  readonly relationshipCount: number;
}

// ---------------------------------------------------------------------------
// Presentation Registry
// ---------------------------------------------------------------------------

export interface PresentationRegistry {
  readonly registryId: string;
  readonly profiles: readonly VisualPresentationProfile[];
  readonly accessibility: readonly AccessibilityMetadata[];
  readonly readingFlows: readonly ReadingFlowMetadata[];
  readonly emphasis: readonly VisualEmphasisMetadata[];
  readonly relationships: readonly PresentationRelationship[];
  readonly metadata: PresentationRegistryMetadata;
  readonly trace: VisualPresentationTrace;
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_visual_presentation_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Presentation Input
// ---------------------------------------------------------------------------

export interface PresentationInput {
  readonly profiles: readonly VisualPresentationProfile[];
  readonly accessibility: readonly AccessibilityMetadata[];
  readonly readingFlows: readonly ReadingFlowMetadata[];
  readonly emphasis: readonly VisualEmphasisMetadata[];
  readonly relationships: readonly PresentationRelationship[];
}

// ---------------------------------------------------------------------------
// Curiosity Artifact With Presentation
// ---------------------------------------------------------------------------

export interface CuriosityArtifactWithPresentation {
  readonly curiosityId: string;
  readonly title: string;
  readonly profiles: readonly VisualPresentationProfile[];
  readonly accessibility: readonly AccessibilityMetadata[];
  readonly readingFlows: readonly ReadingFlowMetadata[];
  readonly emphasis: readonly VisualEmphasisMetadata[];
  readonly relationships: readonly PresentationRelationship[];
  readonly provenance: VisualPresentationProvenance;
}

// ---------------------------------------------------------------------------
// Visual Presentation Validation Error
// ---------------------------------------------------------------------------

export interface PresentationValidationError {
  readonly code: string;
  readonly message: string;
  readonly field?: string;
  readonly profileId?: string;
}

// ---------------------------------------------------------------------------
// Visual Presentation Validation Result
// ---------------------------------------------------------------------------

export interface PresentationValidationResult {
  readonly valid: boolean;
  readonly errors: readonly PresentationValidationError[];
}

// ---------------------------------------------------------------------------
// Presentation Registry Validation Result
// ---------------------------------------------------------------------------

export interface PresentationRegistryValidationResult {
  readonly valid: boolean;
  readonly errors: readonly PresentationValidationError[];
  readonly checkedAt: 'presentation_registry_composition';
}

// ---------------------------------------------------------------------------
// Presentation Input Validation Result
// ---------------------------------------------------------------------------

export interface PresentationInputValidationResult {
  readonly valid: boolean;
  readonly errors: readonly PresentationValidationError[];
  readonly checkedAt: 'presentation_input_composition';
}

// ---------------------------------------------------------------------------
// Presentation Trace Validation Result
// ---------------------------------------------------------------------------

export interface PresentationTraceValidationResult {
  readonly valid: boolean;
  readonly errors: readonly PresentationValidationError[];
  readonly checkedAt: 'presentation_trace_composition';
}

// ---------------------------------------------------------------------------
// Curiosity Artifact With Presentation Validation Result
// ---------------------------------------------------------------------------

export interface CuriosityArtifactWithPresentationValidationResult {
  readonly valid: boolean;
  readonly errors: readonly PresentationValidationError[];
  readonly checkedAt: 'curiosity_artifact_with_presentation_composition';
}

// ============================================================================
// D9-OPT-11 — User Preference, Tone Controls & Placement Rules
// ============================================================================

// ---------------------------------------------------------------------------
// Canonical User Preference Types (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_USER_PREFERENCE_TYPES = [
  'content_density',
  'humor_tolerance',
  'tone_preference',
  'pacing',
  'detail_level',
  'interaction_style',
  'learning_style',
  'motivation_type',
  'engagement_pattern',
  'notification_preference',
] as const;

export type UserPreferenceType = (typeof CANONICAL_USER_PREFERENCE_TYPES)[number];

// ---------------------------------------------------------------------------
// Canonical Tone Control Levels (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_TONE_CONTROL_LEVELS = [
  'neutral',
  'subtle',
  'moderate',
  'playful',
  'humorous',
  'witty',
  'sarcastic',
  'dramatic',
  'inspirational',
  'academic',
] as const;

export type ToneControlLevel = (typeof CANONICAL_TONE_CONTROL_LEVELS)[number];

// ---------------------------------------------------------------------------
// Canonical Placement Rules (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_PLACEMENT_RULES = [
  'lesson_intro',
  'lesson_transition',
  'lesson_outro',
  'topic_break',
  'quiz_break',
  'laboratory_intro',
  'case_study_intro',
  'module_summary',
  'portfolio_context',
  'random_discovery',
] as const;

export type PlacementRule = (typeof CANONICAL_PLACEMENT_RULES)[number];

// ---------------------------------------------------------------------------
// Canonical Visibility Levels (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_VISIBILITY_LEVELS = [
  'always',
  'conditional',
  'on_demand',
  'progressive',
  'hidden',
  'disabled',
  'restricted',
  'conditional_on_completion',
  'conditional_on_engagement',
  'conditional_on_time',
] as const;

export type VisibilityLevel = (typeof CANONICAL_VISIBILITY_LEVELS)[number];

// ---------------------------------------------------------------------------
// Canonical Presentation Eligibility (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_PRESENTATION_ELIGIBILITY = [
  'full_access',
  'limited_access',
  'restricted_access',
  'conditional_access',
  'no_access',
  'premium_access',
  'beta_access',
  'preview_access',
  'demo_access',
  'educational_access',
] as const;

export type PresentationEligibility = (typeof CANONICAL_PRESENTATION_ELIGIBILITY)[number];

// ---------------------------------------------------------------------------
// Canonical Preference Status (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_PREFERENCE_STATUS = [
  'draft',
  'review',
  'approved',
  'published',
  'deprecated',
  'archived',
] as const;

export type PreferenceStatus = (typeof CANONICAL_PREFERENCE_STATUS)[number];

// ---------------------------------------------------------------------------
// Curiosity Preference Provenance
// ---------------------------------------------------------------------------

export interface CuriosityPreferenceProvenance {
  readonly provider: string;
  readonly source: string;
  readonly rationale: string;
  readonly version: string;
}

// ---------------------------------------------------------------------------
// Curiosity Preference Decision
// ---------------------------------------------------------------------------

export interface CuriosityPreferenceDecision {
  readonly decisionId: string;
  readonly profileId: string;
  readonly validationPassed: boolean;
  readonly validationErrors: readonly string[];
}

// ---------------------------------------------------------------------------
// Curiosity Preference Trace
// ---------------------------------------------------------------------------

export interface CuriosityPreferenceTrace {
  readonly traceId: string;
  readonly generatedFrom: 'deterministic_curiosity_preference_kernel';
  readonly deterministic: true;
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Curiosity Preference Profile
// ---------------------------------------------------------------------------

export interface CuriosityPreferenceProfile {
  readonly profileId: string;
  readonly title: string;
  readonly preferenceType: UserPreferenceType;
  readonly toneControlLevel: ToneControlLevel;
  readonly placementRule: PlacementRule;
  readonly visibilityLevel: VisibilityLevel;
  readonly presentationEligibility: PresentationEligibility;
  readonly conceptIds: readonly string[];
  readonly status: PreferenceStatus;
  readonly governance: CuriosityGovernance;
  readonly provenance: CuriosityPreferenceProvenance;
  readonly trace: CuriosityPreferenceTrace;
}

// ---------------------------------------------------------------------------
// Tone Control Metadata
// ---------------------------------------------------------------------------

export interface ToneControlMetadata {
  readonly metadataId: string;
  readonly profileId: string;
  readonly toneControlLevel: ToneControlLevel;
  readonly humorIntensity: string;
  readonly witLevel: string;
  readonly sarcasmLevel: string;
  readonly dramaticLevel: string;
  readonly inspirationalLevel: string;
  readonly academicLevel: string;
}

// ---------------------------------------------------------------------------
// Placement Metadata
// ---------------------------------------------------------------------------

export interface PlacementMetadata {
  readonly metadataId: string;
  readonly profileId: string;
  readonly placementRule: PlacementRule;
  readonly priority: number;
  readonly frequency: string;
  readonly duration: string;
  readonly cooldown: string;
  readonly contextRequired: readonly string[];
}

// ---------------------------------------------------------------------------
// Visibility Metadata
// ---------------------------------------------------------------------------

export interface VisibilityMetadata {
  readonly metadataId: string;
  readonly profileId: string;
  readonly visibilityLevel: VisibilityLevel;
  readonly conditions: readonly string[];
  readonly prerequisites: readonly string[];
  readonly exclusions: readonly string[];
  readonly timeRestrictions: string;
}

// ---------------------------------------------------------------------------
// Preference Relationship
// ---------------------------------------------------------------------------

export interface PreferenceRelationship {
  readonly relationshipId: string;
  readonly sourceProfileId: string;
  readonly targetProfileId: string;
  readonly relationshipType: string;
  readonly description: string;
  readonly provenance: CuriosityPreferenceProvenance;
}

// ---------------------------------------------------------------------------
// Preference Registry Metadata
// ---------------------------------------------------------------------------

export interface PreferenceRegistryMetadata {
  readonly registryId: string;
  readonly version: string;
  readonly profileCount: number;
  readonly toneControlCount: number;
  readonly placementCount: number;
  readonly visibilityCount: number;
  readonly relationshipCount: number;
}

// ---------------------------------------------------------------------------
// Preference Registry
// ---------------------------------------------------------------------------

export interface PreferenceRegistry {
  readonly registryId: string;
  readonly profiles: readonly CuriosityPreferenceProfile[];
  readonly toneControls: readonly ToneControlMetadata[];
  readonly placements: readonly PlacementMetadata[];
  readonly visibility: readonly VisibilityMetadata[];
  readonly relationships: readonly PreferenceRelationship[];
  readonly metadata: PreferenceRegistryMetadata;
  readonly trace: CuriosityPreferenceTrace;
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_curiosity_preference_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Preference Input
// ---------------------------------------------------------------------------

export interface PreferenceInput {
  readonly profiles: readonly CuriosityPreferenceProfile[];
  readonly toneControls: readonly ToneControlMetadata[];
  readonly placements: readonly PlacementMetadata[];
  readonly visibility: readonly VisibilityMetadata[];
  readonly relationships: readonly PreferenceRelationship[];
}

// ---------------------------------------------------------------------------
// Curiosity Artifact With Preferences
// ---------------------------------------------------------------------------

export interface CuriosityArtifactWithPreferences {
  readonly curiosityId: string;
  readonly title: string;
  readonly profiles: readonly CuriosityPreferenceProfile[];
  readonly toneControls: readonly ToneControlMetadata[];
  readonly placements: readonly PlacementMetadata[];
  readonly visibility: readonly VisibilityMetadata[];
  readonly relationships: readonly PreferenceRelationship[];
  readonly provenance: CuriosityPreferenceProvenance;
}

// ---------------------------------------------------------------------------
// Preference Validation Error
// ---------------------------------------------------------------------------

export interface PreferenceValidationError {
  readonly code: string;
  readonly message: string;
  readonly field?: string;
  readonly profileId?: string;
}

// ---------------------------------------------------------------------------
// Preference Validation Result
// ---------------------------------------------------------------------------

export interface PreferenceValidationResult {
  readonly valid: boolean;
  readonly errors: readonly PreferenceValidationError[];
}

// ---------------------------------------------------------------------------
// Preference Registry Validation Result
// ---------------------------------------------------------------------------

export interface PreferenceRegistryValidationResult {
  readonly valid: boolean;
  readonly errors: readonly PreferenceValidationError[];
  readonly checkedAt: 'preference_registry_composition';
}

// ---------------------------------------------------------------------------
// Preference Input Validation Result
// ---------------------------------------------------------------------------

export interface PreferenceInputValidationResult {
  readonly valid: boolean;
  readonly errors: readonly PreferenceValidationError[];
  readonly checkedAt: 'preference_input_composition';
}

// ---------------------------------------------------------------------------
// Preference Trace Validation Result
// ---------------------------------------------------------------------------

export interface PreferenceTraceValidationResult {
  readonly valid: boolean;
  readonly errors: readonly PreferenceValidationError[];
  readonly checkedAt: 'preference_trace_composition';
}

// ---------------------------------------------------------------------------
// Curiosity Artifact With Preferences Validation Result
// ---------------------------------------------------------------------------

export interface CuriosityArtifactWithPreferencesValidationResult {
  readonly valid: boolean;
  readonly errors: readonly PreferenceValidationError[];
  readonly checkedAt: 'curiosity_artifact_with_preferences_composition';
}

// ============================================================================
// D9-OPT-12 — Curiosity Governance Workflow & Validation Rules
// ============================================================================

// ---------------------------------------------------------------------------
// Canonical Governance Stages (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_GOVERNANCE_STAGES = [
  'draft',
  'review',
  'revision',
  'validation',
  'approval',
  'publication',
  'monitoring',
  'deprecation',
  'archival',
  'completion',
] as const;

export type GovernanceStage = (typeof CANONICAL_GOVERNANCE_STAGES)[number];

// ---------------------------------------------------------------------------
// Canonical Review Outcomes (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_REVIEW_OUTCOMES = [
  'approved',
  'rejected',
  'revision_required',
  'deferred',
  'escalated',
  'withdrawn',
  'expired',
  'superseded',
  'partial_approval',
  'conditional_approval',
] as const;

export type ReviewOutcome = (typeof CANONICAL_REVIEW_OUTCOMES)[number];

// ---------------------------------------------------------------------------
// Canonical Validation Policies (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_VALIDATION_POLICIES = [
  'automatic',
  'manual',
  'hybrid',
  'peer_review',
  'expert_review',
  'automated_checks',
  'content_review',
  'safety_review',
  'quality_review',
  'compliance_review',
] as const;

export type ValidationPolicy = (typeof CANONICAL_VALIDATION_POLICIES)[number];

// ---------------------------------------------------------------------------
// Canonical Approval Levels (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_APPROVAL_LEVELS = [
  'initial',
  'intermediate',
  'advanced',
  'expert',
  'final',
  'conditional',
  'emergency',
  'override',
  'delegated',
  'revoked',
] as const;

export type ApprovalLevel = (typeof CANONICAL_APPROVAL_LEVELS)[number];

// ---------------------------------------------------------------------------
// Canonical Publication States (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_PUBLICATION_STATES = [
  'draft',
  'review',
  'approved',
  'scheduled',
  'published',
  'deprecated',
  'archived',
  'withdrawn',
  'superseded',
  'conditional',
] as const;

export type PublicationState = (typeof CANONICAL_PUBLICATION_STATES)[number];

// ---------------------------------------------------------------------------
// Canonical Governance Status (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_GOVERNANCE_STATUS = [
  'draft',
  'review',
  'approved',
  'published',
  'deprecated',
  'archived',
] as const;

export type GovernanceStatus = (typeof CANONICAL_GOVERNANCE_STATUS)[number];

// ---------------------------------------------------------------------------
// Governance Workflow Provenance
// ---------------------------------------------------------------------------

export interface CuriosityGovernanceProvenance {
  readonly provider: string;
  readonly source: string;
  readonly rationale: string;
  readonly version: string;
}

// ---------------------------------------------------------------------------
// Governance Workflow Decision
// ---------------------------------------------------------------------------

export interface CuriosityGovernanceDecision {
  readonly decisionId: string;
  readonly workflowId: string;
  readonly validationPassed: boolean;
  readonly validationErrors: readonly string[];
}

// ---------------------------------------------------------------------------
// Governance Workflow Trace
// ---------------------------------------------------------------------------

export interface CuriosityGovernanceTrace {
  readonly traceId: string;
  readonly generatedFrom: 'deterministic_curiosity_governance_kernel';
  readonly deterministic: true;
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Governance Workflow
// ---------------------------------------------------------------------------

export interface GovernanceWorkflow {
  readonly workflowId: string;
  readonly title: string;
  readonly governanceStage: GovernanceStage;
  readonly reviewOutcome: ReviewOutcome;
  readonly validationPolicy: ValidationPolicy;
  readonly approvalLevel: ApprovalLevel;
  readonly publicationState: PublicationState;
  readonly conceptIds: readonly string[];
  readonly status: GovernanceStatus;
  readonly governance: CuriosityGovernance;
  readonly provenance: CuriosityGovernanceProvenance;
  readonly trace: CuriosityGovernanceTrace;
}

// ---------------------------------------------------------------------------
// Validation Policy
// ---------------------------------------------------------------------------

export interface ValidationPolicyMetadata {
  readonly metadataId: string;
  readonly workflowId: string;
  readonly validationPolicy: ValidationPolicy;
  readonly automaticChecks: boolean;
  readonly manualReview: boolean;
  readonly peerReview: boolean;
  readonly expertReview: boolean;
  readonly contentReview: boolean;
  readonly safetyReview: boolean;
  readonly qualityReview: boolean;
  readonly complianceReview: boolean;
}

// ---------------------------------------------------------------------------
// Review Record
// ---------------------------------------------------------------------------

export interface ReviewRecord {
  readonly recordId: string;
  readonly workflowId: string;
  readonly reviewerId: string;
  readonly reviewDate: string;
  readonly reviewOutcome: ReviewOutcome;
  readonly reviewComments: string;
  readonly reviewDuration: string;
  readonly reviewPriority: number;
}

// ---------------------------------------------------------------------------
// Approval Metadata
// ---------------------------------------------------------------------------

export interface ApprovalMetadata {
  readonly metadataId: string;
  readonly workflowId: string;
  readonly approvalLevel: ApprovalLevel;
  readonly approverId: string;
  readonly approvalDate: string;
  readonly approvalExpiry: string;
  readonly approvalConditions: readonly string[];
  readonly approvalRevocable: boolean;
}

// ---------------------------------------------------------------------------
// Governance Relationship
// ---------------------------------------------------------------------------

export interface GovernanceRelationship {
  readonly relationshipId: string;
  readonly sourceWorkflowId: string;
  readonly targetWorkflowId: string;
  readonly relationshipType: string;
  readonly description: string;
  readonly provenance: CuriosityGovernanceProvenance;
}

// ---------------------------------------------------------------------------
// Governance Registry Metadata
// ---------------------------------------------------------------------------

export interface GovernanceRegistryMetadata {
  readonly registryId: string;
  readonly version: string;
  readonly workflowCount: number;
  readonly validationCount: number;
  readonly reviewCount: number;
  readonly approvalCount: number;
  readonly relationshipCount: number;
}

// ---------------------------------------------------------------------------
// Governance Registry
// ---------------------------------------------------------------------------

export interface GovernanceRegistry {
  readonly registryId: string;
  readonly workflows: readonly GovernanceWorkflow[];
  readonly validations: readonly ValidationPolicyMetadata[];
  readonly reviews: readonly ReviewRecord[];
  readonly approvals: readonly ApprovalMetadata[];
  readonly relationships: readonly GovernanceRelationship[];
  readonly metadata: GovernanceRegistryMetadata;
  readonly trace: CuriosityGovernanceTrace;
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_curiosity_governance_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Governance Input
// ---------------------------------------------------------------------------

export interface GovernanceInput {
  readonly workflows: readonly GovernanceWorkflow[];
  readonly validations: readonly ValidationPolicyMetadata[];
  readonly reviews: readonly ReviewRecord[];
  readonly approvals: readonly ApprovalMetadata[];
  readonly relationships: readonly GovernanceRelationship[];
}

// ---------------------------------------------------------------------------
// Curiosity Artifact With Governance
// ---------------------------------------------------------------------------

export interface CuriosityArtifactWithGovernance {
  readonly curiosityId: string;
  readonly title: string;
  readonly workflows: readonly GovernanceWorkflow[];
  readonly validations: readonly ValidationPolicyMetadata[];
  readonly reviews: readonly ReviewRecord[];
  readonly approvals: readonly ApprovalMetadata[];
  readonly relationships: readonly GovernanceRelationship[];
  readonly provenance: CuriosityGovernanceProvenance;
}

// ---------------------------------------------------------------------------
// Governance Validation Error
// ---------------------------------------------------------------------------

export interface GovernanceValidationError {
  readonly code: string;
  readonly message: string;
  readonly field?: string;
  readonly workflowId?: string;
}

// ---------------------------------------------------------------------------
// Governance Validation Result
// ---------------------------------------------------------------------------

export interface GovernanceValidationResult {
  readonly valid: boolean;
  readonly errors: readonly GovernanceValidationError[];
}

// ---------------------------------------------------------------------------
// Governance Registry Validation Result
// ---------------------------------------------------------------------------

export interface GovernanceRegistryValidationResult {
  readonly valid: boolean;
  readonly errors: readonly GovernanceValidationError[];
  readonly checkedAt: 'governance_registry_composition';
}

// ---------------------------------------------------------------------------
// Governance Input Validation Result
// ---------------------------------------------------------------------------

export interface GovernanceInputValidationResult {
  readonly valid: boolean;
  readonly errors: readonly GovernanceValidationError[];
  readonly checkedAt: 'governance_input_composition';
}

// ---------------------------------------------------------------------------
// Governance Trace Validation Result
// ---------------------------------------------------------------------------

export interface GovernanceTraceValidationResult {
  readonly valid: boolean;
  readonly errors: readonly GovernanceValidationError[];
  readonly checkedAt: 'governance_trace_composition';
}

// ---------------------------------------------------------------------------
// Curiosity Artifact With Governance Validation Result
// ---------------------------------------------------------------------------

export interface CuriosityArtifactWithGovernanceValidationResult {
  readonly valid: boolean;
  readonly errors: readonly GovernanceValidationError[];
  readonly checkedAt: 'curiosity_artifact_with_governance_composition';
}

// ============================================================================
// D9-OPT-13 — Storage Separation, Retrieval Strategy & Contextual Overlay Modeling
// ============================================================================

// ---------------------------------------------------------------------------
// Canonical Storage Types (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_STORAGE_TYPES = [
  'embedded',
  'local_registry',
  'shared_registry',
  'retrieval_reference',
  'overlay_reference',
  'persistent_reference',
  'cached_reference',
  'archival_reference',
  'temporary_reference',
  'external_reference',
] as const;

export type StorageType = (typeof CANONICAL_STORAGE_TYPES)[number];

// ---------------------------------------------------------------------------
// Canonical Retrieval Strategies (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_RETRIEVAL_STRATEGIES = [
  'direct_lookup',
  'metadata_filter',
  'tag_lookup',
  'relationship_lookup',
  'category_lookup',
  'overlay_lookup',
  'dependency_lookup',
  'reference_lookup',
  'hierarchical_lookup',
  'registry_lookup',
] as const;

export type RetrievalStrategy = (typeof CANONICAL_RETRIEVAL_STRATEGIES)[number];

// ---------------------------------------------------------------------------
// Canonical Overlay Types (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_OVERLAY_TYPES = [
  'lesson_overlay',
  'module_overlay',
  'laboratory_overlay',
  'assessment_overlay',
  'portfolio_overlay',
  'concept_overlay',
  'visual_overlay',
  'application_overlay',
  'timeline_overlay',
  'context_overlay',
] as const;

export type OverlayType = (typeof CANONICAL_OVERLAY_TYPES)[number];

// ---------------------------------------------------------------------------
// Canonical Storage Visibility (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_STORAGE_VISIBILITY = [
  'hidden',
  'internal',
  'system',
  'agent',
  'workspace',
  'lesson',
  'module',
  'public',
  'shared',
  'global',
] as const;

export type StorageVisibility = (typeof CANONICAL_STORAGE_VISIBILITY)[number];

// ---------------------------------------------------------------------------
// Canonical Storage Scope (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_STORAGE_SCOPE = [
  'local',
  'module',
  'course',
  'track',
  'workspace',
  'agent',
  'curriculum',
  'project',
  'global',
  'cross_agent',
] as const;

export type StorageScope = (typeof CANONICAL_STORAGE_SCOPE)[number];

// ---------------------------------------------------------------------------
// Canonical Storage Status (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_STORAGE_STATUS = [
  'draft',
  'review',
  'approved',
  'published',
  'deprecated',
  'archived',
] as const;

export type StorageStatus = (typeof CANONICAL_STORAGE_STATUS)[number];

// ---------------------------------------------------------------------------
// Storage Provenance
// ---------------------------------------------------------------------------

export interface CuriosityStorageProvenance {
  readonly provider: string;
  readonly source: string;
  readonly rationale: string;
  readonly version: string;
}

// ---------------------------------------------------------------------------
// Storage Decision
// ---------------------------------------------------------------------------

export interface CuriosityStorageDecision {
  readonly decisionId: string;
  readonly profileId: string;
  readonly validationPassed: boolean;
  readonly validationErrors: readonly string[];
}

// ---------------------------------------------------------------------------
// Storage Trace
// ---------------------------------------------------------------------------

export interface CuriosityStorageTrace {
  readonly traceId: string;
  readonly generatedFrom: 'deterministic_curiosity_storage_kernel';
  readonly deterministic: true;
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Storage Profile
// ---------------------------------------------------------------------------

export interface CuriosityStorageProfile {
  readonly profileId: string;
  readonly title: string;
  readonly storageType: StorageType;
  readonly retrievalStrategy: RetrievalStrategy;
  readonly overlayType: OverlayType;
  readonly storageVisibility: StorageVisibility;
  readonly storageScope: StorageScope;
  readonly conceptIds: readonly string[];
  readonly status: StorageStatus;
  readonly governance: CuriosityGovernance;
  readonly provenance: CuriosityStorageProvenance;
  readonly trace: CuriosityStorageTrace;
}

// ---------------------------------------------------------------------------
// Retrieval Metadata
// ---------------------------------------------------------------------------

export interface RetrievalMetadata {
  readonly metadataId: string;
  readonly profileId: string;
  readonly retrievalStrategy: RetrievalStrategy;
  readonly indexKey: string;
  readonly indexValue: string;
  readonly priority: number;
  readonly contextRequired: readonly string[];
}

// ---------------------------------------------------------------------------
// Overlay Metadata
// ---------------------------------------------------------------------------

export interface OverlayMetadata {
  readonly metadataId: string;
  readonly profileId: string;
  readonly overlayType: OverlayType;
  readonly overlayScope: string;
  readonly overlayPriority: number;
  readonly overlayContext: readonly string[];
  readonly overlayDependencies: readonly string[];
}

// ---------------------------------------------------------------------------
// Storage Relationship
// ---------------------------------------------------------------------------

export interface StorageRelationship {
  readonly relationshipId: string;
  readonly sourceProfileId: string;
  readonly targetProfileId: string;
  readonly relationshipType: string;
  readonly description: string;
  readonly provenance: CuriosityStorageProvenance;
}

// ---------------------------------------------------------------------------
// Storage Registry Metadata
// ---------------------------------------------------------------------------

export interface StorageRegistryMetadata {
  readonly registryId: string;
  readonly version: string;
  readonly profileCount: number;
  readonly retrievalCount: number;
  readonly overlayCount: number;
  readonly relationshipCount: number;
}

// ---------------------------------------------------------------------------
// Storage Registry
// ---------------------------------------------------------------------------

export interface StorageRegistry {
  readonly registryId: string;
  readonly profiles: readonly CuriosityStorageProfile[];
  readonly retrievals: readonly RetrievalMetadata[];
  readonly overlays: readonly OverlayMetadata[];
  readonly relationships: readonly StorageRelationship[];
  readonly metadata: StorageRegistryMetadata;
  readonly trace: CuriosityStorageTrace;
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_curiosity_storage_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Storage Input
// ---------------------------------------------------------------------------

export interface StorageInput {
  readonly profiles: readonly CuriosityStorageProfile[];
  readonly retrievals: readonly RetrievalMetadata[];
  readonly overlays: readonly OverlayMetadata[];
  readonly relationships: readonly StorageRelationship[];
}

// ---------------------------------------------------------------------------
// Curiosity Artifact With Storage
// ---------------------------------------------------------------------------

export interface CuriosityArtifactWithStorage {
  readonly curiosityId: string;
  readonly title: string;
  readonly profiles: readonly CuriosityStorageProfile[];
  readonly retrievals: readonly RetrievalMetadata[];
  readonly overlays: readonly OverlayMetadata[];
  readonly relationships: readonly StorageRelationship[];
  readonly provenance: CuriosityStorageProvenance;
}

// ---------------------------------------------------------------------------
// Storage Validation Error
// ---------------------------------------------------------------------------

export interface StorageValidationError {
  readonly code: string;
  readonly message: string;
  readonly field?: string;
  readonly profileId?: string;
}

// ---------------------------------------------------------------------------
// Storage Validation Result
// ---------------------------------------------------------------------------

export interface StorageValidationResult {
  readonly valid: boolean;
  readonly errors: readonly StorageValidationError[];
}

// ---------------------------------------------------------------------------
// Storage Registry Validation Result
// ---------------------------------------------------------------------------

export interface StorageRegistryValidationResult {
  readonly valid: boolean;
  readonly errors: readonly StorageValidationError[];
  readonly checkedAt: 'storage_registry_composition';
}

// ---------------------------------------------------------------------------
// Storage Input Validation Result
// ---------------------------------------------------------------------------

export interface StorageInputValidationResult {
  readonly valid: boolean;
  readonly errors: readonly StorageValidationError[];
  readonly checkedAt: 'storage_input_composition';
}

// ---------------------------------------------------------------------------
// Storage Trace Validation Result
// ---------------------------------------------------------------------------

export interface StorageTraceValidationResult {
  readonly valid: boolean;
  readonly errors: readonly StorageValidationError[];
  readonly checkedAt: 'storage_trace_composition';
}

// ---------------------------------------------------------------------------
// Curiosity Artifact With Storage Validation Result
// ---------------------------------------------------------------------------

export interface CuriosityArtifactWithStorageValidationResult {
  readonly valid: boolean;
  readonly errors: readonly StorageValidationError[];
  readonly checkedAt: 'curiosity_artifact_with_storage_composition';
}

// ============================================================================
// D9-OPT-14 — Safety, Accessibility & Humor Risk Certification
// ============================================================================

// ---------------------------------------------------------------------------
// Canonical Safety Certification Types (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_SAFETY_CERTIFICATION_TYPES = [
  'educational_safe',
  'review_required',
  'sensitive_topic',
  'controlled_humor',
  'historical_reference',
  'cultural_reference',
  'engineering_reference',
  'laboratory_reference',
  'visual_reference',
  'public_ready',
] as const;

export type SafetyCertificationType = (typeof CANONICAL_SAFETY_CERTIFICATION_TYPES)[number];

// ---------------------------------------------------------------------------
// Canonical Humor Risk Levels (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_HUMOR_RISK_LEVELS = [
  'none',
  'minimal',
  'very_low',
  'low',
  'moderate',
  'controlled',
  'review_required',
  'restricted',
  'high',
  'prohibited',
] as const;

export type HumorRiskLevel = (typeof CANONICAL_HUMOR_RISK_LEVELS)[number];

// ---------------------------------------------------------------------------
// Canonical Accessibility Compliance (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_ACCESSIBILITY_COMPLIANCE = [
  'wcag_basic',
  'wcag_standard',
  'wcag_extended',
  'screen_reader_ready',
  'high_contrast',
  'reduced_motion',
  'short_reading',
  'plain_language',
  'alternative_description',
  'fully_accessible',
] as const;

export type AccessibilityCompliance = (typeof CANONICAL_ACCESSIBILITY_COMPLIANCE)[number];

// ---------------------------------------------------------------------------
// Canonical Certification Findings (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_CERTIFICATION_FINDINGS = [
  'approved',
  'approved_with_notes',
  'review_needed',
  'accessibility_issue',
  'humor_issue',
  'tone_issue',
  'metadata_issue',
  'governance_issue',
  'trace_issue',
  'rejected',
] as const;

export type CertificationFinding = (typeof CANONICAL_CERTIFICATION_FINDINGS)[number];

// ---------------------------------------------------------------------------
// Canonical Certification Dimensions (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_CERTIFICATION_DIMENSIONS = [
  'safety',
  'humor',
  'accessibility',
  'governance',
  'metadata',
  'traceability',
  'presentation',
  'educational_value',
  'structural_integrity',
  'publication',
] as const;

export type CertificationDimension = (typeof CANONICAL_CERTIFICATION_DIMENSIONS)[number];

// ---------------------------------------------------------------------------
// Canonical Certification Status (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_CERTIFICATION_STATUS = [
  'draft',
  'review',
  'approved',
  'published',
  'deprecated',
  'archived',
] as const;

export type CertificationStatus = (typeof CANONICAL_CERTIFICATION_STATUS)[number];

// ---------------------------------------------------------------------------
// Safety Certification Provenance
// ---------------------------------------------------------------------------

export interface CuriositySafetyProvenance {
  readonly provider: string;
  readonly source: string;
  readonly rationale: string;
  readonly version: string;
}

// ---------------------------------------------------------------------------
// Safety Certification Decision
// ---------------------------------------------------------------------------

export interface CuriositySafetyDecision {
  readonly decisionId: string;
  readonly profileId: string;
  readonly validationPassed: boolean;
  readonly validationErrors: readonly string[];
}

// ---------------------------------------------------------------------------
// Safety Certification Trace
// ---------------------------------------------------------------------------

export interface CuriositySafetyTrace {
  readonly traceId: string;
  readonly generatedFrom: 'deterministic_curiosity_safety_kernel';
  readonly deterministic: true;
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Safety Certification Profile
// ---------------------------------------------------------------------------

export interface CuriositySafetyProfile {
  readonly profileId: string;
  readonly title: string;
  readonly safetyCertificationType: SafetyCertificationType;
  readonly humorRiskLevel: HumorRiskLevel;
  readonly accessibilityCompliance: AccessibilityCompliance;
  readonly conceptIds: readonly string[];
  readonly status: CertificationStatus;
  readonly governance: CuriosityGovernance;
  readonly provenance: CuriositySafetyProvenance;
  readonly trace: CuriositySafetyTrace;
}

// ---------------------------------------------------------------------------
// Humor Risk Metadata
// ---------------------------------------------------------------------------

export interface HumorRiskMetadata {
  readonly metadataId: string;
  readonly profileId: string;
  readonly humorRiskLevel: HumorRiskLevel;
  readonly riskDescription: string;
  readonly mitigationStrategy: string;
  readonly reviewRequired: boolean;
  readonly safetyJustification: string;
}

// ---------------------------------------------------------------------------
// Accessibility Certification
// ---------------------------------------------------------------------------

export interface AccessibilityCertification {
  readonly certificationId: string;
  readonly profileId: string;
  readonly accessibilityCompliance: AccessibilityCompliance;
  readonly complianceDescription: string;
  readonly remediationRequired: boolean;
  readonly alternativeProvided: boolean;
  readonly wcagLevel: string;
}

// ---------------------------------------------------------------------------
// Certification Finding
// ---------------------------------------------------------------------------

export interface CertificationFindingRecord {
  readonly findingId: string;
  readonly profileId: string;
  readonly certificationFinding: CertificationFinding;
  readonly findingDescription: string;
  readonly severity: string;
  readonly recommendation: string;
}

// ---------------------------------------------------------------------------
// Certification Relationship
// ---------------------------------------------------------------------------

export interface CertificationRelationship {
  readonly relationshipId: string;
  readonly sourceProfileId: string;
  readonly targetProfileId: string;
  readonly relationshipType: string;
  readonly description: string;
  readonly provenance: CuriositySafetyProvenance;
}

// ---------------------------------------------------------------------------
// Certification Registry Metadata
// ---------------------------------------------------------------------------

export interface CertificationRegistryMetadata {
  readonly registryId: string;
  readonly version: string;
  readonly profileCount: number;
  readonly humorRiskCount: number;
  readonly accessibilityCount: number;
  readonly findingCount: number;
  readonly relationshipCount: number;
}

// ---------------------------------------------------------------------------
// Certification Registry
// ---------------------------------------------------------------------------

export interface CertificationRegistry {
  readonly registryId: string;
  readonly profiles: readonly CuriositySafetyProfile[];
  readonly humorRisks: readonly HumorRiskMetadata[];
  readonly accessibility: readonly AccessibilityCertification[];
  readonly findings: readonly CertificationFindingRecord[];
  readonly relationships: readonly CertificationRelationship[];
  readonly metadata: CertificationRegistryMetadata;
  readonly trace: CuriositySafetyTrace;
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_curiosity_safety_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Certification Input
// ---------------------------------------------------------------------------

export interface CertificationInput {
  readonly profiles: readonly CuriositySafetyProfile[];
  readonly humorRisks: readonly HumorRiskMetadata[];
  readonly accessibility: readonly AccessibilityCertification[];
  readonly findings: readonly CertificationFindingRecord[];
  readonly relationships: readonly CertificationRelationship[];
}

// ---------------------------------------------------------------------------
// Curiosity Artifact With Certification
// ---------------------------------------------------------------------------

export interface CuriosityArtifactWithCertification {
  readonly curiosityId: string;
  readonly title: string;
  readonly profiles: readonly CuriositySafetyProfile[];
  readonly humorRisks: readonly HumorRiskMetadata[];
  readonly accessibility: readonly AccessibilityCertification[];
  readonly findings: readonly CertificationFindingRecord[];
  readonly relationships: readonly CertificationRelationship[];
  readonly provenance: CuriositySafetyProvenance;
}

// ---------------------------------------------------------------------------
// Certification Validation Error
// ---------------------------------------------------------------------------

export interface CertificationValidationError {
  readonly code: string;
  readonly message: string;
  readonly field?: string;
  readonly profileId?: string;
}

// ---------------------------------------------------------------------------
// Certification Validation Result
// ---------------------------------------------------------------------------

export interface CertificationValidationResult {
  readonly valid: boolean;
  readonly errors: readonly CertificationValidationError[];
}

// ---------------------------------------------------------------------------
// Certification Registry Validation Result
// ---------------------------------------------------------------------------

export interface CertificationRegistryValidationResult {
  readonly valid: boolean;
  readonly errors: readonly CertificationValidationError[];
  readonly checkedAt: 'certification_registry_composition';
}

// ---------------------------------------------------------------------------
// Certification Input Validation Result
// ---------------------------------------------------------------------------

export interface CertificationInputValidationResult {
  readonly valid: boolean;
  readonly errors: readonly CertificationValidationError[];
  readonly checkedAt: 'certification_input_composition';
}

// ---------------------------------------------------------------------------
// Certification Trace Validation Result
// ---------------------------------------------------------------------------

export interface CertificationTraceValidationResult {
  readonly valid: boolean;
  readonly errors: readonly CertificationValidationError[];
  readonly checkedAt: 'certification_trace_composition';
}

// ---------------------------------------------------------------------------
// Curiosity Artifact With Certification Validation Result
// ---------------------------------------------------------------------------

export interface CuriosityArtifactWithCertificationValidationResult {
  readonly valid: boolean;
  readonly errors: readonly CertificationValidationError[];
  readonly checkedAt: 'curiosity_artifact_with_certification_composition';
}

// ============================================================================
// D9-OPT-15 — Curiosity Certification & Structural Quality Gate
// ============================================================================

// ---------------------------------------------------------------------------
// Canonical Curiosity Certification Status (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_CURIOSITY_CERTIFICATION_STATUS = [
  'passed',
  'passed_with_warnings',
  'failed',
  'blocked',
  'incomplete',
  'not_certified',
] as const;

export type CuriosityCertificationStatus = (typeof CANONICAL_CURIOSITY_CERTIFICATION_STATUS)[number];

// ---------------------------------------------------------------------------
// Canonical Curiosity Finding Severity (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_CURIOSITY_FINDING_SEVERITY = [
  'info',
  'low',
  'medium',
  'high',
  'critical',
] as const;

export type CuriosityFindingSeverity = (typeof CANONICAL_CURIOSITY_FINDING_SEVERITY)[number];

// ---------------------------------------------------------------------------
// Canonical Curiosity Quality Dimensions (fixed, 22 values)
// ---------------------------------------------------------------------------

export const CANONICAL_CURIOSITY_QUALITY_DIMENSIONS = [
  'registry',
  'purpose',
  'humor',
  'cultural_reference',
  'cards',
  'knowledge_evolution',
  'discoveries',
  'laboratory_curiosity',
  'misconceptions',
  'presentation',
  'preferences',
  'governance',
  'storage',
  'safety',
  'traceability',
  'metadata',
  'validation',
  'determinism',
  'immutability',
  'documentation',
  'cross_agent_boundary',
  'public_api',
] as const;

export type CuriosityQualityDimension = (typeof CANONICAL_CURIOSITY_QUALITY_DIMENSIONS)[number];

// ---------------------------------------------------------------------------
// Curiosity Certification Finding
// ---------------------------------------------------------------------------

export interface CuriosityCertificationFinding {
  readonly findingId: string;
  readonly dimension: CuriosityQualityDimension;
  readonly severity: CuriosityFindingSeverity;
  readonly message: string;
  readonly details: string;
  readonly timestamp: string;
}

// ---------------------------------------------------------------------------
// Curiosity Certification Trace
// ---------------------------------------------------------------------------

export interface CuriosityCertificationTrace {
  readonly traceId: string;
  readonly generatedFrom: 'deterministic_curiosity_certification_engine';
  readonly deterministic: true;
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Curiosity Certification Metadata
// ---------------------------------------------------------------------------

export interface CuriosityCertificationMetadata {
  readonly totalDimensions: number;
  readonly certifiedDimensions: number;
  readonly warningDimensions: number;
  readonly failedDimensions: number;
  readonly totalFindings: number;
  readonly criticalFindings: number;
  readonly highFindings: number;
  readonly mediumFindings: number;
  readonly lowFindings: number;
  readonly infoFindings: number;
}

// ---------------------------------------------------------------------------
// Curiosity Certification Report
// ---------------------------------------------------------------------------

export interface CuriosityCertificationReport {
  readonly reportId: string;
  readonly certificationStatus: CuriosityCertificationStatus;
  readonly certificationScore: number;
  readonly findings: readonly CuriosityCertificationFinding[];
  readonly dimensions: readonly CuriosityQualityDimension[];
  readonly metadata: CuriosityCertificationMetadata;
  readonly trace: CuriosityCertificationTrace;
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_curiosity_certification_engine';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Curiosity Certification Validation Error
// ---------------------------------------------------------------------------

export interface CuriosityCertificationValidationError {
  readonly code: string;
  readonly message: string;
  readonly path: string;
}

// ---------------------------------------------------------------------------
// Curiosity Certification Validation Result
// ---------------------------------------------------------------------------

export interface CuriosityCertificationValidationResult {
  readonly valid: boolean;
  readonly errors: readonly CuriosityCertificationValidationError[];
  readonly checkedAt: 'curiosity_certification_validation';
}

// ---------------------------------------------------------------------------
// Curiosity Certification Finding Validation Result
// ---------------------------------------------------------------------------

export interface CuriosityCertificationFindingValidationResult {
  readonly valid: boolean;
  readonly errors: readonly CuriosityCertificationValidationError[];
  readonly checkedAt: 'curiosity_certification_finding_validation';
}

// ---------------------------------------------------------------------------
// Curiosity Certification Status Validation Result
// ---------------------------------------------------------------------------

export interface CuriosityCertificationStatusValidationResult {
  readonly valid: boolean;
  readonly errors: readonly CuriosityCertificationValidationError[];
  readonly checkedAt: 'curiosity_certification_status_validation';
}

// ---------------------------------------------------------------------------
// Curiosity Certification Score Validation Result
// ---------------------------------------------------------------------------

export interface CuriosityCertificationScoreValidationResult {
  readonly valid: boolean;
  readonly errors: readonly CuriosityCertificationValidationError[];
  readonly checkedAt: 'curiosity_certification_score_validation';
}

// ============================================================================
// D9-OPT-16 — Public API Consolidation & Curiosity Pipeline Facade
// ============================================================================

// ---------------------------------------------------------------------------
// Canonical Curiosity Facade Status (fixed, 6 values)
// ---------------------------------------------------------------------------

export const CANONICAL_CURIOSITY_FACADE_STATUS = [
  'available',
  'validated',
  'certified',
  'deprecated',
  'internal',
  'legacy',
] as const;

export type CuriosityFacadeStatus = (typeof CANONICAL_CURIOSITY_FACADE_STATUS)[number];

// ---------------------------------------------------------------------------
// Curiosity Facade Trace Metadata
// ---------------------------------------------------------------------------

export interface CuriosityFacadeTraceMetadata {
  readonly traceId: string;
  readonly generatedFrom: 'deterministic_curiosity_pipeline_facade';
  readonly deterministic: true;
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Curiosity Facade Validation Result
// ---------------------------------------------------------------------------

export interface CuriosityFacadeValidationResult {
  readonly valid: boolean;
  readonly errors: readonly CuriosityFacadeValidationError[];
  readonly checkedAt: 'curiosity_facade_validation';
}

// ---------------------------------------------------------------------------
// Curiosity Facade Artifact Result
// ---------------------------------------------------------------------------

export interface CuriosityFacadeArtifactResult {
  readonly facadeStatus: CuriosityFacadeStatus;
  readonly artifact: CuriosityRegistry;
  readonly trace: CuriosityFacadeTraceMetadata;
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_curiosity_pipeline_facade';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Curiosity Facade Certification Result
// ---------------------------------------------------------------------------

export interface CuriosityFacadeCertificationResult {
  readonly facadeStatus: CuriosityFacadeStatus;
  readonly certificationReport: CuriosityCertificationReport;
  readonly trace: CuriosityFacadeTraceMetadata;
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_curiosity_pipeline_facade';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Curiosity Facade Complete Result
// ---------------------------------------------------------------------------

export interface CuriosityFacadeCompleteResult {
  readonly facadeStatus: CuriosityFacadeStatus;
  readonly artifact: CuriosityRegistry;
  readonly validation: CuriosityFacadeValidationResult;
  readonly certificationReport: CuriosityCertificationReport;
  readonly trace: CuriosityFacadeTraceMetadata;
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_curiosity_pipeline_facade';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Curiosity Facade Validation Error
// ---------------------------------------------------------------------------

export interface CuriosityFacadeValidationError {
  readonly code: string;
  readonly message: string;
  readonly path: string;
}

// ---------------------------------------------------------------------------
// Curiosity Facade Validation Result (for facade entry points)
// ---------------------------------------------------------------------------

export interface CuriosityFacadeEntryValidationResult {
  readonly valid: boolean;
  readonly errors: readonly CuriosityFacadeValidationError[];
  readonly checkedAt: 'curiosity_facade_entry_validation';
}

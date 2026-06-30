/**
 * D10-OPT-01 — Knowledge Contract & Concept Registry Kernel
 *
 * Canonical foundation of the Knowledge Agent.
 * Immutable domain model for deterministic knowledge metadata orchestration,
 * deterministic registry representation, and deterministic provenance tracking.
 *
 * This module is purely structural. It contains no runtime logic,
 * no mutable state, no external dependencies, and no probabilistic behavior.
 *
 * The Knowledge Agent is:
 * - the Single Source of Truth (SSOT) for educational concepts;
 * - the owner of canonical concepts;
 * - independent from presentation;
 * - independent from didactics;
 * - independent from curriculum;
 * - independent from narrative;
 * - independent from laboratories;
 * - independent from assessment.
 */

// ---------------------------------------------------------------------------
// Canonical Knowledge Types (fixed, exactly 10)
// ---------------------------------------------------------------------------

export const CANONICAL_KNOWLEDGE_TYPES = [
  'concept',
  'algorithm',
  'mathematics',
  'implementation',
  'architecture',
  'framework',
  'protocol',
  'dataset',
  'model',
  'theory',
] as const;

export type KnowledgeType = (typeof CANONICAL_KNOWLEDGE_TYPES)[number];

// ---------------------------------------------------------------------------
// Canonical Knowledge Categories (fixed, exactly 10)
// ---------------------------------------------------------------------------

export const CANONICAL_KNOWLEDGE_CATEGORIES = [
  'artificial_intelligence',
  'machine_learning',
  'deep_learning',
  'computer_vision',
  'nlp',
  'mathematics',
  'statistics',
  'software_engineering',
  'mlops',
  'research',
] as const;

export type KnowledgeCategory = (typeof CANONICAL_KNOWLEDGE_CATEGORIES)[number];

// ---------------------------------------------------------------------------
// Canonical Knowledge Difficulty (fixed, exactly 10, ordered progression)
// ---------------------------------------------------------------------------

export const CANONICAL_KNOWLEDGE_DIFFICULTY = [
  'foundational',
  'introductory',
  'basic',
  'intermediate',
  'advanced',
  'expert',
  'specialist',
  'research_level',
  'frontier',
  'theoretical',
] as const;

export type KnowledgeDifficulty = (typeof CANONICAL_KNOWLEDGE_DIFFICULTY)[number];

// ---------------------------------------------------------------------------
// Canonical Knowledge Status (fixed, exactly 6)
// ---------------------------------------------------------------------------

export const CANONICAL_KNOWLEDGE_STATUS = [
  'draft',
  'review',
  'approved',
  'canonical',
  'deprecated',
  'archived',
] as const;

export type KnowledgeStatus = (typeof CANONICAL_KNOWLEDGE_STATUS)[number];

// ---------------------------------------------------------------------------
// Canonical Knowledge Review Status (fixed, exactly 6)
// ---------------------------------------------------------------------------

export const CANONICAL_KNOWLEDGE_REVIEW_STATUS = [
  'pending',
  'in_progress',
  'changes_requested',
  'approved',
  'rejected',
  'deferred',
] as const;

export type KnowledgeReviewStatus = (typeof CANONICAL_KNOWLEDGE_REVIEW_STATUS)[number];

// ---------------------------------------------------------------------------
// Canonical Knowledge Governance (fixed, exactly 10)
// ---------------------------------------------------------------------------

export const CANONICAL_KNOWLEDGE_GOVERNANCE = [
  'canonical',
  'accepted',
  'provisional',
  'experimental',
  'deprecated',
  'restricted',
  'internal',
  'public',
  'community',
  'archived',
] as const;

export type KnowledgeGovernance = (typeof CANONICAL_KNOWLEDGE_GOVERNANCE)[number];

// ---------------------------------------------------------------------------
// Knowledge Provenance
// ---------------------------------------------------------------------------

export interface KnowledgeProvenance {
  readonly source: string;
  readonly provider: string;
  readonly rationale: string;
  readonly governance: KnowledgeGovernance;
  readonly governanceStatus?: KnowledgeGovernance;
}

// ---------------------------------------------------------------------------
// Knowledge Decision
// ---------------------------------------------------------------------------

export interface KnowledgeDecision {
  readonly decisionId: string;
  readonly knowledgeId: string;
  readonly validationPassed: boolean;
  readonly validationErrors: readonly string[];
}

// ---------------------------------------------------------------------------
// Knowledge Trace
// ---------------------------------------------------------------------------

export interface KnowledgeTrace {
  readonly traceId: string;
  readonly decisionCount: number;
  readonly validationCount: number;
  readonly registryVersion: string;
  readonly compositionVersion: string;
  readonly decisions: readonly KnowledgeDecision[];
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_knowledge_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Knowledge Node (Canonical Concept Contract)
// ---------------------------------------------------------------------------

export interface KnowledgeNode {
  readonly nodeId: string;
  readonly title: string;
  readonly knowledgeType: KnowledgeType;
  readonly category: KnowledgeCategory;
  readonly difficulty: KnowledgeDifficulty;
  readonly status: KnowledgeStatus;
  readonly reviewStatus: KnowledgeReviewStatus;
  readonly governance: KnowledgeGovernance;
  readonly canonicalIdentifier: string;
  readonly tags: readonly string[];
  readonly summary: string;
  readonly provenance: KnowledgeProvenance;
}

// ---------------------------------------------------------------------------
// Knowledge Registry Metadata
// ---------------------------------------------------------------------------

export interface KnowledgeRegistryMetadata {
  readonly registryId: string;
  readonly nodeCount: number;
  readonly categoryCount: number;
  readonly typeCount: number;
}

// ---------------------------------------------------------------------------
// Knowledge Registry
// ---------------------------------------------------------------------------

export interface KnowledgeRegistry {
  readonly registryId: string;
  readonly nodes: readonly KnowledgeNode[];
  readonly artifacts?: readonly KnowledgeNode[];
  readonly metadata: KnowledgeRegistryMetadata;
  readonly trace: KnowledgeTrace;
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_knowledge_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Knowledge Input
// ---------------------------------------------------------------------------

export interface KnowledgeInput {
  readonly nodes?: readonly KnowledgeNode[];
  readonly artifacts?: readonly KnowledgeNode[];
}

// ---------------------------------------------------------------------------
// Knowledge Validation Error
// ---------------------------------------------------------------------------

export interface KnowledgeValidationError {
  readonly code: string;
  readonly message: string;
  readonly field?: string;
  readonly knowledgeId?: string;
}

// ---------------------------------------------------------------------------
// Knowledge Validation Result
// ---------------------------------------------------------------------------

export interface KnowledgeValidationResult {
  readonly valid: boolean;
  readonly errors: readonly KnowledgeValidationError[];
}

// ---------------------------------------------------------------------------
// Knowledge Node Validation Result
// ---------------------------------------------------------------------------

export interface KnowledgeNodeValidationResult {
  readonly valid: boolean;
  readonly errors: readonly KnowledgeValidationError[];
  readonly checkedAt: 'knowledge_node_composition';
}

// ---------------------------------------------------------------------------
// Knowledge Registry Validation Result
// ---------------------------------------------------------------------------

export interface KnowledgeRegistryValidationResult {
  readonly valid: boolean;
  readonly errors: readonly KnowledgeValidationError[];
  readonly checkedAt: 'knowledge_registry_composition';
}

// ---------------------------------------------------------------------------
// Knowledge Input Validation Result
// ---------------------------------------------------------------------------

export interface KnowledgeInputValidationResult {
  readonly valid: boolean;
  readonly errors: readonly KnowledgeValidationError[];
  readonly checkedAt: 'knowledge_input_composition';
}

// ---------------------------------------------------------------------------
// Knowledge Trace Validation Result
// ---------------------------------------------------------------------------

export interface KnowledgeTraceValidationResult {
  readonly valid: boolean;
  readonly errors: readonly KnowledgeValidationError[];
  readonly checkedAt: 'knowledge_trace_composition';
}

// ============================================================================
// D10-OPT-02 — Multi-Level Explanation Modeling
// ============================================================================

// ---------------------------------------------------------------------------
// Canonical Explanation Levels (fixed, exactly 7, ordered)
// ---------------------------------------------------------------------------

export const CANONICAL_EXPLANATION_LEVELS = [
  'concise_definition',
  'intuitive_explanation',
  'technical_explanation',
  'mathematical_formulation',
  'algorithmic_interpretation',
  'implementation_guidance',
  'advanced_engineering_discussion',
] as const;

export type ExplanationLevel = (typeof CANONICAL_EXPLANATION_LEVELS)[number];

// ---------------------------------------------------------------------------
// Canonical Explanation Formats (fixed, exactly 10)
// ---------------------------------------------------------------------------

export const CANONICAL_EXPLANATION_FORMATS = [
  'text',
  'structured',
  'formula',
  'algorithm',
  'pseudocode',
  'diagram_reference',
  'table',
  'code_reference',
  'comparison',
  'mixed',
] as const;

export type ExplanationFormat = (typeof CANONICAL_EXPLANATION_FORMATS)[number];

// ---------------------------------------------------------------------------
// Canonical Explanation Purposes (fixed, exactly 10)
// ---------------------------------------------------------------------------

export const CANONICAL_EXPLANATION_PURPOSES = [
  'introduce',
  'clarify',
  'formalize',
  'derive',
  'implement',
  'compare',
  'summarize',
  'reinforce',
  'connect',
  'extend',
] as const;

export type ExplanationPurpose = (typeof CANONICAL_EXPLANATION_PURPOSES)[number];

// ---------------------------------------------------------------------------
// Canonical Audience Levels (fixed, exactly 10, ordered progression)
// ---------------------------------------------------------------------------

export const CANONICAL_AUDIENCE_LEVELS = [
  'complete_beginner',
  'beginner',
  'elementary',
  'intermediate',
  'upper_intermediate',
  'advanced',
  'expert',
  'researcher',
  'specialist',
  'authority',
] as const;

export type AudienceLevel = (typeof CANONICAL_AUDIENCE_LEVELS)[number];

// ---------------------------------------------------------------------------
// Canonical Explanation Status (fixed, exactly 6)
// ---------------------------------------------------------------------------

export const CANONICAL_EXPLANATION_STATUS = [
  'draft',
  'review',
  'approved',
  'canonical',
  'deprecated',
  'archived',
] as const;

export type ExplanationStatus = (typeof CANONICAL_EXPLANATION_STATUS)[number];

// ---------------------------------------------------------------------------
// Canonical Explanation Governance (fixed, exactly 10)
// ---------------------------------------------------------------------------

export const CANONICAL_EXPLANATION_GOVERNANCE = [
  'canonical',
  'accepted',
  'provisional',
  'experimental',
  'deprecated',
  'restricted',
  'internal',
  'public',
  'community',
  'archived',
] as const;

export type ExplanationGovernance = (typeof CANONICAL_EXPLANATION_GOVERNANCE)[number];

// ---------------------------------------------------------------------------
// Knowledge Explanation Provenance
// ---------------------------------------------------------------------------

export interface KnowledgeExplanationProvenance {
  readonly source: string;
  readonly provider: string;
  readonly rationale: string;
  readonly governance: ExplanationGovernance;
}

// ---------------------------------------------------------------------------
// Knowledge Explanation Decision
// ---------------------------------------------------------------------------

export interface KnowledgeExplanationDecision {
  readonly decisionId: string;
  readonly profileId: string;
  readonly conceptId: string;
  readonly validationPassed: boolean;
  readonly validationErrors: readonly string[];
}

// ---------------------------------------------------------------------------
// Knowledge Explanation Trace
// ---------------------------------------------------------------------------

export interface KnowledgeExplanationTrace {
  readonly traceId: string;
  readonly decisionCount: number;
  readonly validationCount: number;
  readonly registryVersion: string;
  readonly compositionVersion: string;
  readonly decisions: readonly KnowledgeExplanationDecision[];
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_explanation_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Knowledge Explanation Profile
// ---------------------------------------------------------------------------

export interface KnowledgeExplanationProfile {
  readonly profileId: string;
  readonly conceptId: string;
  readonly level: ExplanationLevel;
  readonly format: ExplanationFormat;
  readonly purpose: ExplanationPurpose;
  readonly audienceLevel: AudienceLevel;
  readonly status: ExplanationStatus;
  readonly governance: ExplanationGovernance;
  readonly title: string;
  readonly summary: string;
  readonly tags: readonly string[];
  readonly prerequisiteProfileIds: readonly string[];
  readonly provenance: KnowledgeExplanationProvenance;
}

// ---------------------------------------------------------------------------
// Knowledge Explanation Relationship
// ---------------------------------------------------------------------------

export interface KnowledgeExplanationRelationship {
  readonly relationshipId: string;
  readonly sourceProfileId: string;
  readonly targetProfileId: string;
  readonly conceptId: string;
  readonly relationshipType: 'prerequisite' | 'extension' | 'alternative' | 'complement';
  readonly description: string;
  readonly provenance: KnowledgeExplanationProvenance;
}

// ---------------------------------------------------------------------------
// Knowledge Explanation Registry Metadata
// ---------------------------------------------------------------------------

export interface KnowledgeExplanationRegistryMetadata {
  readonly registryId: string;
  readonly profileCount: number;
  readonly relationshipCount: number;
  readonly levelCount: number;
  readonly conceptCount: number;
}

// ---------------------------------------------------------------------------
// Knowledge Explanation Registry
// ---------------------------------------------------------------------------

export interface KnowledgeExplanationRegistry {
  readonly registryId: string;
  readonly profiles: readonly KnowledgeExplanationProfile[];
  readonly relationships: readonly KnowledgeExplanationRelationship[];
  readonly metadata: KnowledgeExplanationRegistryMetadata;
  readonly trace: KnowledgeExplanationTrace;
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_explanation_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Knowledge Explanation Input
// ---------------------------------------------------------------------------

export interface KnowledgeExplanationInput {
  readonly profiles: readonly KnowledgeExplanationProfile[];
  readonly relationships: readonly KnowledgeExplanationRelationship[];
}

// ---------------------------------------------------------------------------
// Knowledge Artifact With Explanations
// ---------------------------------------------------------------------------

export interface KnowledgeArtifactWithExplanations {
  readonly conceptId: string;
  readonly conceptTitle: string;
  readonly profiles: readonly KnowledgeExplanationProfile[];
  readonly relationships: readonly KnowledgeExplanationRelationship[];
  readonly provenance: KnowledgeExplanationProvenance;
}

// ---------------------------------------------------------------------------
// Knowledge Explanation Validation Error
// ---------------------------------------------------------------------------

export interface KnowledgeExplanationValidationError {
  readonly code: string;
  readonly message: string;
  readonly field?: string;
  readonly profileId?: string;
}

// ---------------------------------------------------------------------------
// Knowledge Explanation Validation Result
// ---------------------------------------------------------------------------

export interface KnowledgeExplanationValidationResult {
  readonly valid: boolean;
  readonly errors: readonly KnowledgeExplanationValidationError[];
}

// ---------------------------------------------------------------------------
// Knowledge Explanation Registry Validation Result
// ---------------------------------------------------------------------------

export interface KnowledgeExplanationRegistryValidationResult {
  readonly valid: boolean;
  readonly errors: readonly KnowledgeExplanationValidationError[];
  readonly checkedAt: 'knowledge_explanation_registry_composition';
}

// ---------------------------------------------------------------------------
// Knowledge Explanation Input Validation Result
// ---------------------------------------------------------------------------

export interface KnowledgeExplanationInputValidationResult {
  readonly valid: boolean;
  readonly errors: readonly KnowledgeExplanationValidationError[];
  readonly checkedAt: 'knowledge_explanation_input_composition';
}

// ---------------------------------------------------------------------------
// Knowledge Explanation Trace Validation Result
// ---------------------------------------------------------------------------

export interface KnowledgeExplanationTraceValidationResult {
  readonly valid: boolean;
  readonly errors: readonly KnowledgeExplanationValidationError[];
  readonly checkedAt: 'knowledge_explanation_trace_composition';
}

// ---------------------------------------------------------------------------
// Knowledge Artifact With Explanations Validation Result
// ---------------------------------------------------------------------------

export interface KnowledgeArtifactWithExplanationsValidationResult {
  readonly valid: boolean;
  readonly errors: readonly KnowledgeExplanationValidationError[];
  readonly checkedAt: 'knowledge_artifact_with_explanations_composition';
}

// ============================================================================
// D10-OPT-03 — Concept Structure, Canonical Components & Internal Knowledge
// ============================================================================

// ---------------------------------------------------------------------------
// Canonical Component Types (fixed, exactly 10)
// ---------------------------------------------------------------------------

export const CANONICAL_COMPONENT_TYPES = [
  'definition',
  'intuition',
  'motivation',
  'mathematical_foundation',
  'algorithm',
  'implementation',
  'example',
  'counterexample',
  'limitation',
  'application',
] as const;

export type ComponentType = (typeof CANONICAL_COMPONENT_TYPES)[number];

// ---------------------------------------------------------------------------
// Canonical Component Priority (fixed, exactly 10)
// ---------------------------------------------------------------------------

export const CANONICAL_COMPONENT_PRIORITY = [
  'critical',
  'high',
  'recommended',
  'optional',
  'supplementary',
  'historical',
  'advanced',
  'reference',
  'experimental',
  'deprecated',
] as const;

export type ComponentPriority = (typeof CANONICAL_COMPONENT_PRIORITY)[number];

// ---------------------------------------------------------------------------
// Canonical Component Status (fixed, exactly 6)
// ---------------------------------------------------------------------------

export const CANONICAL_COMPONENT_STATUS = [
  'draft',
  'review',
  'approved',
  'canonical',
  'deprecated',
  'archived',
] as const;

export type ComponentStatus = (typeof CANONICAL_COMPONENT_STATUS)[number];

// ---------------------------------------------------------------------------
// Canonical Component Visibility (fixed, exactly 10)
// ---------------------------------------------------------------------------

export const CANONICAL_COMPONENT_VISIBILITY = [
  'always',
  'default',
  'advanced_only',
  'expert_only',
  'hidden',
  'internal',
  'curriculum',
  'assessment',
  'laboratory',
  'research',
] as const;

export type ComponentVisibility = (typeof CANONICAL_COMPONENT_VISIBILITY)[number];

// ---------------------------------------------------------------------------
// Canonical Component Role (fixed, exactly 10)
// ---------------------------------------------------------------------------

export const CANONICAL_COMPONENT_ROLE = [
  'core',
  'supporting',
  'optional',
  'cross_reference',
  'warning',
  'best_practice',
  'engineering_note',
  'historical_note',
  'research_note',
  'future_direction',
] as const;

export type ComponentRole = (typeof CANONICAL_COMPONENT_ROLE)[number];

// ---------------------------------------------------------------------------
// Canonical Component Governance (fixed, exactly 10)
// ---------------------------------------------------------------------------

export const CANONICAL_COMPONENT_GOVERNANCE = [
  'canonical',
  'accepted',
  'provisional',
  'experimental',
  'deprecated',
  'restricted',
  'internal',
  'public',
  'community',
  'archived',
] as const;

export type ComponentGovernance = (typeof CANONICAL_COMPONENT_GOVERNANCE)[number];

// ---------------------------------------------------------------------------
// Knowledge Concept Provenance
// ---------------------------------------------------------------------------

export interface KnowledgeConceptProvenance {
  readonly source: string;
  readonly provider: string;
  readonly rationale: string;
  readonly governance: ComponentGovernance;
}

// ---------------------------------------------------------------------------
// Knowledge Concept Decision
// ---------------------------------------------------------------------------

export interface KnowledgeConceptDecision {
  readonly decisionId: string;
  readonly componentId: string;
  readonly conceptId: string;
  readonly validationPassed: boolean;
  readonly validationErrors: readonly string[];
}

// ---------------------------------------------------------------------------
// Knowledge Concept Trace
// ---------------------------------------------------------------------------

export interface KnowledgeConceptTrace {
  readonly traceId: string;
  readonly decisionCount: number;
  readonly validationCount: number;
  readonly registryVersion: string;
  readonly compositionVersion: string;
  readonly decisions: readonly KnowledgeConceptDecision[];
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_concept_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Knowledge Component
// ---------------------------------------------------------------------------

export interface KnowledgeComponent {
  readonly componentId: string;
  readonly conceptId: string;
  readonly title: string;
  readonly componentType: ComponentType;
  readonly priority: ComponentPriority;
  readonly role: ComponentRole;
  readonly visibility: ComponentVisibility;
  readonly status: ComponentStatus;
  readonly governance: ComponentGovernance;
  readonly tags: readonly string[];
  readonly orderIndex: number;
  readonly references: readonly string[];
  readonly provenance: KnowledgeConceptProvenance;
}

// ---------------------------------------------------------------------------
// Knowledge Component Relationship
// ---------------------------------------------------------------------------

export interface KnowledgeComponentRelationship {
  readonly relationshipId: string;
  readonly sourceComponentId: string;
  readonly targetComponentId: string;
  readonly conceptId: string;
  readonly relationshipType: 'prerequisite' | 'extension' | 'dependency' | 'reference';
  readonly description: string;
  readonly provenance: KnowledgeConceptProvenance;
}

// ---------------------------------------------------------------------------
// Knowledge Component Registry Metadata
// ---------------------------------------------------------------------------

export interface KnowledgeComponentRegistryMetadata {
  readonly registryId: string;
  readonly componentCount: number;
  readonly relationshipCount: number;
  readonly conceptCount: number;
  readonly componentTypeCount: number;
}

// ---------------------------------------------------------------------------
// Knowledge Component Registry
// ---------------------------------------------------------------------------

export interface KnowledgeComponentRegistry {
  readonly registryId: string;
  readonly components: readonly KnowledgeComponent[];
  readonly relationships: readonly KnowledgeComponentRelationship[];
  readonly metadata: KnowledgeComponentRegistryMetadata;
  readonly trace: KnowledgeConceptTrace;
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_concept_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Knowledge Component Input
// ---------------------------------------------------------------------------

export interface KnowledgeComponentInput {
  readonly components: readonly KnowledgeComponent[];
  readonly relationships: readonly KnowledgeComponentRelationship[];
}

// ---------------------------------------------------------------------------
// Knowledge Artifact With Components
// ---------------------------------------------------------------------------

export interface KnowledgeArtifactWithComponents {
  readonly conceptId: string;
  readonly conceptTitle: string;
  readonly components: readonly KnowledgeComponent[];
  readonly relationships: readonly KnowledgeComponentRelationship[];
  readonly provenance: KnowledgeConceptProvenance;
}

// ---------------------------------------------------------------------------
// Knowledge Component Validation Error
// ---------------------------------------------------------------------------

export interface KnowledgeComponentValidationError {
  readonly code: string;
  readonly message: string;
  readonly field?: string;
  readonly componentId?: string;
}

// ---------------------------------------------------------------------------
// Knowledge Component Validation Result
// ---------------------------------------------------------------------------

export interface KnowledgeComponentValidationResult {
  readonly valid: boolean;
  readonly errors: readonly KnowledgeComponentValidationError[];
}

// ---------------------------------------------------------------------------
// Knowledge Component Registry Validation Result
// ---------------------------------------------------------------------------

export interface KnowledgeComponentRegistryValidationResult {
  readonly valid: boolean;
  readonly errors: readonly KnowledgeComponentValidationError[];
  readonly checkedAt: 'knowledge_component_registry_composition';
}

// ---------------------------------------------------------------------------
// Knowledge Component Input Validation Result
// ---------------------------------------------------------------------------

export interface KnowledgeComponentInputValidationResult {
  readonly valid: boolean;
  readonly errors: readonly KnowledgeComponentValidationError[];
  readonly checkedAt: 'knowledge_component_input_composition';
}

// ---------------------------------------------------------------------------
// Knowledge Component Trace Validation Result
// ---------------------------------------------------------------------------

export interface KnowledgeComponentTraceValidationResult {
  readonly valid: boolean;
  readonly errors: readonly KnowledgeComponentValidationError[];
  readonly checkedAt: 'knowledge_component_trace_composition';
}

// ---------------------------------------------------------------------------
// Knowledge Artifact With Components Validation Result
// ---------------------------------------------------------------------------

export interface KnowledgeArtifactWithComponentsValidationResult {
  readonly valid: boolean;
  readonly errors: readonly KnowledgeComponentValidationError[];
  readonly checkedAt: 'knowledge_artifact_with_components_composition';
}

// ============================================================================
// D10-OPT-04 — Multimodal Representation, Visual References
// ============================================================================

// ---------------------------------------------------------------------------
// Canonical Representation Types (fixed, exactly 10)
// ---------------------------------------------------------------------------

export const CANONICAL_REPRESENTATION_TYPES = [
  'textual',
  'mathematical',
  'diagram',
  'illustration',
  'animation',
  'interactive',
  'simulation_reference',
  'code_reference',
  'table',
  'graph',
] as const;

export type RepresentationType = (typeof CANONICAL_REPRESENTATION_TYPES)[number];

// ---------------------------------------------------------------------------
// Canonical Visual Objectives (fixed, exactly 10)
// ---------------------------------------------------------------------------

export const CANONICAL_VISUAL_OBJECTIVES = [
  'introduce',
  'clarify',
  'formalize',
  'compare',
  'demonstrate',
  'summarize',
  'reinforce',
  'visualize',
  'connect',
  'explore',
] as const;

export type VisualObjective = (typeof CANONICAL_VISUAL_OBJECTIVES)[number];

// ---------------------------------------------------------------------------
// Canonical Representation Complexity (fixed, exactly 10)
// ---------------------------------------------------------------------------

export const CANONICAL_REPRESENTATION_COMPLEXITY = [
  'minimal',
  'simple',
  'standard',
  'intermediate',
  'advanced',
  'expert',
  'research',
  'engineering',
  'reference',
  'canonical',
] as const;

export type RepresentationComplexity = (typeof CANONICAL_REPRESENTATION_COMPLEXITY)[number];

// ---------------------------------------------------------------------------
// Canonical Representation Status (fixed, exactly 6)
// ---------------------------------------------------------------------------

export const CANONICAL_REPRESENTATION_STATUS = [
  'draft',
  'review',
  'approved',
  'canonical',
  'deprecated',
  'archived',
] as const;

export type RepresentationStatus = (typeof CANONICAL_REPRESENTATION_STATUS)[number];

// ---------------------------------------------------------------------------
// Canonical Representation Visibility (fixed, exactly 10)
// ---------------------------------------------------------------------------

export const CANONICAL_REPRESENTATION_VISIBILITY = [
  'always',
  'default',
  'advanced',
  'expert',
  'curriculum',
  'assessment',
  'laboratory',
  'research',
  'internal',
  'hidden',
] as const;

export type RepresentationVisibility = (typeof CANONICAL_REPRESENTATION_VISIBILITY)[number];

// ---------------------------------------------------------------------------
// Canonical Representation Governance (fixed, exactly 10)
// ---------------------------------------------------------------------------

export const CANONICAL_REPRESENTATION_GOVERNANCE = [
  'canonical',
  'accepted',
  'provisional',
  'experimental',
  'deprecated',
  'restricted',
  'internal',
  'public',
  'community',
  'archived',
] as const;

export type RepresentationGovernance = (typeof CANONICAL_REPRESENTATION_GOVERNANCE)[number];

// ---------------------------------------------------------------------------
// Knowledge Representation Provenance
// ---------------------------------------------------------------------------

export interface KnowledgeRepresentationProvenance {
  readonly source: string;
  readonly provider: string;
  readonly rationale: string;
  readonly governance: RepresentationGovernance;
}

// ---------------------------------------------------------------------------
// Knowledge Representation Decision
// ---------------------------------------------------------------------------

export interface KnowledgeRepresentationDecision {
  readonly decisionId: string;
  readonly profileId: string;
  readonly conceptId: string;
  readonly validationPassed: boolean;
  readonly validationErrors: readonly string[];
}

// ---------------------------------------------------------------------------
// Knowledge Representation Trace
// ---------------------------------------------------------------------------

export interface KnowledgeRepresentationTrace {
  readonly traceId: string;
  readonly decisionCount: number;
  readonly validationCount: number;
  readonly registryVersion: string;
  readonly compositionVersion: string;
  readonly decisions: readonly KnowledgeRepresentationDecision[];
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_representation_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Knowledge Representation Profile
// ---------------------------------------------------------------------------

export interface KnowledgeRepresentationProfile {
  readonly representationId: string;
  readonly conceptId: string;
  readonly title: string;
  readonly representationType: RepresentationType;
  readonly visualObjective: VisualObjective;
  readonly complexity: RepresentationComplexity;
  readonly visibility: RepresentationVisibility;
  readonly status: RepresentationStatus;
  readonly governance: RepresentationGovernance;
  readonly tags: readonly string[];
  readonly resourceReferences: readonly string[];
  readonly orderIndex: number;
  readonly provenance: KnowledgeRepresentationProvenance;
}

// ---------------------------------------------------------------------------
// Knowledge Representation Relationship
// ---------------------------------------------------------------------------

export interface KnowledgeRepresentationRelationship {
  readonly relationshipId: string;
  readonly sourceRepresentationId: string;
  readonly targetRepresentationId: string;
  readonly conceptId: string;
  readonly relationshipType: 'prerequisite' | 'alternative' | 'complement' | 'dependency';
  readonly description: string;
  readonly provenance: KnowledgeRepresentationProvenance;
}

// ---------------------------------------------------------------------------
// Knowledge Representation Registry Metadata
// ---------------------------------------------------------------------------

export interface KnowledgeRepresentationRegistryMetadata {
  readonly registryId: string;
  readonly representationCount: number;
  readonly relationshipCount: number;
  readonly conceptCount: number;
  readonly representationTypeCount: number;
}

// ---------------------------------------------------------------------------
// Knowledge Representation Registry
// ---------------------------------------------------------------------------

export interface KnowledgeRepresentationRegistry {
  readonly registryId: string;
  readonly profiles: readonly KnowledgeRepresentationProfile[];
  readonly relationships: readonly KnowledgeRepresentationRelationship[];
  readonly metadata: KnowledgeRepresentationRegistryMetadata;
  readonly trace: KnowledgeRepresentationTrace;
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_representation_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Knowledge Representation Input
// ---------------------------------------------------------------------------

export interface KnowledgeRepresentationInput {
  readonly profiles: readonly KnowledgeRepresentationProfile[];
  readonly relationships: readonly KnowledgeRepresentationRelationship[];
}

// ---------------------------------------------------------------------------
// Knowledge Artifact With Representations
// ---------------------------------------------------------------------------

export interface KnowledgeArtifactWithRepresentations {
  readonly conceptId: string;
  readonly conceptTitle: string;
  readonly profiles: readonly KnowledgeRepresentationProfile[];
  readonly relationships: readonly KnowledgeRepresentationRelationship[];
  readonly provenance: KnowledgeRepresentationProvenance;
}

// ---------------------------------------------------------------------------
// Knowledge Representation Validation Error
// ---------------------------------------------------------------------------

export interface KnowledgeRepresentationValidationError {
  readonly code: string;
  readonly message: string;
  readonly field?: string;
  readonly profileId?: string;
}

// ---------------------------------------------------------------------------
// Knowledge Representation Validation Result
// ---------------------------------------------------------------------------

export interface KnowledgeRepresentationValidationResult {
  readonly valid: boolean;
  readonly errors: readonly KnowledgeRepresentationValidationError[];
}

// ---------------------------------------------------------------------------
// Knowledge Representation Registry Validation Result
// ---------------------------------------------------------------------------

export interface KnowledgeRepresentationRegistryValidationResult {
  readonly valid: boolean;
  readonly errors: readonly KnowledgeRepresentationValidationError[];
  readonly checkedAt: 'knowledge_representation_registry_composition';
}

// ---------------------------------------------------------------------------
// Knowledge Representation Input Validation Result
// ---------------------------------------------------------------------------

export interface KnowledgeRepresentationInputValidationResult {
  readonly valid: boolean;
  readonly errors: readonly KnowledgeRepresentationValidationError[];
  readonly checkedAt: 'knowledge_representation_input_composition';
}

// ---------------------------------------------------------------------------
// Knowledge Representation Trace Validation Result
// ---------------------------------------------------------------------------

export interface KnowledgeRepresentationTraceValidationResult {
  readonly valid: boolean;
  readonly errors: readonly KnowledgeRepresentationValidationError[];
  readonly checkedAt: 'knowledge_representation_trace_composition';
}

// ---------------------------------------------------------------------------
// Knowledge Artifact With Representations Validation Result
// ---------------------------------------------------------------------------

export interface KnowledgeArtifactWithRepresentationsValidationResult {
  readonly valid: boolean;
  readonly errors: readonly KnowledgeRepresentationValidationError[];
  readonly checkedAt: 'knowledge_artifact_with_representations_composition';
}

// ============================================================================
// D10-OPT-05 — Progressive Examples, Canonical Example Modeling
// ============================================================================

// ---------------------------------------------------------------------------
// Canonical Example Types (fixed, exactly 10)
// ---------------------------------------------------------------------------

export const CANONICAL_EXAMPLE_TYPES = [
  'definition_example',
  'worked_example',
  'visual_example',
  'mathematical_example',
  'algorithm_example',
  'implementation_example',
  'engineering_example',
  'counterexample',
  'application_example',
  'historical_example',
] as const;

export type ExampleType = (typeof CANONICAL_EXAMPLE_TYPES)[number];

// ---------------------------------------------------------------------------
// Canonical Example Levels (fixed, exactly 10)
// ---------------------------------------------------------------------------

export const CANONICAL_EXAMPLE_LEVELS = [
  'introductory',
  'elementary',
  'intermediate',
  'advanced',
  'expert',
  'research',
  'engineering',
  'comparative',
  'integration',
  'mastery',
] as const;

export type ExampleLevel = (typeof CANONICAL_EXAMPLE_LEVELS)[number];

// ---------------------------------------------------------------------------
// Canonical Progressive Stages (fixed, exactly 10)
// ---------------------------------------------------------------------------

export const CANONICAL_PROGRESSIVE_STAGES = [
  'recognition',
  'understanding',
  'interpretation',
  'application',
  'analysis',
  'integration',
  'optimization',
  'generalization',
  'transfer',
  'mastery',
] as const;

export type ProgressiveStage = (typeof CANONICAL_PROGRESSIVE_STAGES)[number];

// ---------------------------------------------------------------------------
// Canonical Example Status (fixed, exactly 6)
// ---------------------------------------------------------------------------

export const CANONICAL_EXAMPLE_STATUS = [
  'draft',
  'review',
  'approved',
  'canonical',
  'deprecated',
  'archived',
] as const;

export type ExampleStatus = (typeof CANONICAL_EXAMPLE_STATUS)[number];

// ---------------------------------------------------------------------------
// Canonical Example Visibility (fixed, exactly 10)
// ---------------------------------------------------------------------------

export const CANONICAL_EXAMPLE_VISIBILITY = [
  'always',
  'default',
  'advanced',
  'expert',
  'curriculum',
  'assessment',
  'laboratory',
  'research',
  'internal',
  'hidden',
] as const;

export type ExampleVisibility = (typeof CANONICAL_EXAMPLE_VISIBILITY)[number];

// ---------------------------------------------------------------------------
// Canonical Example Governance (fixed, exactly 10)
// ---------------------------------------------------------------------------

export const CANONICAL_EXAMPLE_GOVERNANCE = [
  'canonical',
  'accepted',
  'provisional',
  'experimental',
  'deprecated',
  'restricted',
  'internal',
  'public',
  'community',
  'archived',
] as const;

export type ExampleGovernance = (typeof CANONICAL_EXAMPLE_GOVERNANCE)[number];

// ---------------------------------------------------------------------------
// Knowledge Example Provenance
// ---------------------------------------------------------------------------

export interface KnowledgeExampleProvenance {
  readonly source: string;
  readonly provider: string;
  readonly rationale: string;
  readonly governance: ExampleGovernance;
}

// ---------------------------------------------------------------------------
// Knowledge Example Decision
// ---------------------------------------------------------------------------

export interface KnowledgeExampleDecision {
  readonly decisionId: string;
  readonly exampleId: string;
  readonly conceptId: string;
  readonly validationPassed: boolean;
  readonly validationErrors: readonly string[];
}

// ---------------------------------------------------------------------------
// Knowledge Example Trace
// ---------------------------------------------------------------------------

export interface KnowledgeExampleTrace {
  readonly traceId: string;
  readonly decisionCount: number;
  readonly validationCount: number;
  readonly registryVersion: string;
  readonly compositionVersion: string;
  readonly decisions: readonly KnowledgeExampleDecision[];
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_example_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Knowledge Example Profile
// ---------------------------------------------------------------------------

export interface KnowledgeExampleProfile {
  readonly exampleId: string;
  readonly conceptId: string;
  readonly title: string;
  readonly exampleType: ExampleType;
  readonly exampleLevel: ExampleLevel;
  readonly progressiveStage: ProgressiveStage;
  readonly visibility: ExampleVisibility;
  readonly status: ExampleStatus;
  readonly governance: ExampleGovernance;
  readonly tags: readonly string[];
  readonly representationIds: readonly string[];
  readonly orderIndex: number;
  readonly provenance: KnowledgeExampleProvenance;
}

// ---------------------------------------------------------------------------
// Knowledge Example Relationship
// ---------------------------------------------------------------------------

export interface KnowledgeExampleRelationship {
  readonly relationshipId: string;
  readonly sourceExampleId: string;
  readonly targetExampleId: string;
  readonly conceptId: string;
  readonly relationshipType: 'prerequisite' | 'extension' | 'progression' | 'comparison';
  readonly description: string;
  readonly provenance: KnowledgeExampleProvenance;
}

// ---------------------------------------------------------------------------
// Knowledge Example Registry Metadata
// ---------------------------------------------------------------------------

export interface KnowledgeExampleRegistryMetadata {
  readonly registryId: string;
  readonly exampleCount: number;
  readonly relationshipCount: number;
  readonly conceptCount: number;
  readonly levelCount: number;
}

// ---------------------------------------------------------------------------
// Knowledge Example Registry
// ---------------------------------------------------------------------------

export interface KnowledgeExampleRegistry {
  readonly registryId: string;
  readonly profiles: readonly KnowledgeExampleProfile[];
  readonly relationships: readonly KnowledgeExampleRelationship[];
  readonly metadata: KnowledgeExampleRegistryMetadata;
  readonly trace: KnowledgeExampleTrace;
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_example_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Knowledge Example Input
// ---------------------------------------------------------------------------

export interface KnowledgeExampleInput {
  readonly profiles: readonly KnowledgeExampleProfile[];
  readonly relationships: readonly KnowledgeExampleRelationship[];
}

// ---------------------------------------------------------------------------
// Knowledge Artifact With Examples
// ---------------------------------------------------------------------------

export interface KnowledgeArtifactWithExamples {
  readonly conceptId: string;
  readonly conceptTitle: string;
  readonly profiles: readonly KnowledgeExampleProfile[];
  readonly relationships: readonly KnowledgeExampleRelationship[];
  readonly provenance: KnowledgeExampleProvenance;
}

// ---------------------------------------------------------------------------
// Knowledge Example Validation Error
// ---------------------------------------------------------------------------

export interface KnowledgeExampleValidationError {
  readonly code: string;
  readonly message: string;
  readonly field?: string;
  readonly exampleId?: string;
}

// ---------------------------------------------------------------------------
// Knowledge Example Validation Result
// ---------------------------------------------------------------------------

export interface KnowledgeExampleValidationResult {
  readonly valid: boolean;
  readonly errors: readonly KnowledgeExampleValidationError[];
}

// ---------------------------------------------------------------------------
// Knowledge Example Registry Validation Result
// ---------------------------------------------------------------------------

export interface KnowledgeExampleRegistryValidationResult {
  readonly valid: boolean;
  readonly errors: readonly KnowledgeExampleValidationError[];
  readonly checkedAt: 'knowledge_example_registry_composition';
}

// ---------------------------------------------------------------------------
// Knowledge Example Input Validation Result
// ---------------------------------------------------------------------------

export interface KnowledgeExampleInputValidationResult {
  readonly valid: boolean;
  readonly errors: readonly KnowledgeExampleValidationError[];
  readonly checkedAt: 'knowledge_example_input_composition';
}

// ---------------------------------------------------------------------------
// Knowledge Example Trace Validation Result
// ---------------------------------------------------------------------------

export interface KnowledgeExampleTraceValidationResult {
  readonly valid: boolean;
  readonly errors: readonly KnowledgeExampleValidationError[];
  readonly checkedAt: 'knowledge_example_trace_composition';
}

// ---------------------------------------------------------------------------
// Knowledge Artifact With Examples Validation Result
// ---------------------------------------------------------------------------

export interface KnowledgeArtifactWithExamplesValidationResult {
  readonly valid: boolean;
  readonly errors: readonly KnowledgeExampleValidationError[];
  readonly checkedAt: 'knowledge_artifact_with_examples_composition';
}

// ============================================================================
// D10-OPT-06 — Comparative Knowledge Modeling
// ============================================================================

// ---------------------------------------------------------------------------
// Canonical Comparison Types (fixed, exactly 10)
// ---------------------------------------------------------------------------

export const CANONICAL_COMPARISON_TYPES = [
  'concept_vs_concept',
  'algorithm_vs_algorithm',
  'method_vs_method',
  'architecture_vs_architecture',
  'implementation_vs_implementation',
  'theory_vs_theory',
  'model_vs_model',
  'framework_vs_framework',
  'tool_vs_tool',
  'approach_vs_approach',
] as const;

export type ComparisonType = (typeof CANONICAL_COMPARISON_TYPES)[number];

// ---------------------------------------------------------------------------
// Canonical Comparison Objectives (fixed, exactly 10)
// ---------------------------------------------------------------------------

export const CANONICAL_COMPARISON_OBJECTIVES = [
  'clarify',
  'distinguish',
  'decision_support',
  'tradeoff_analysis',
  'selection',
  'engineering',
  'learning',
  'review',
  'evaluation',
  'reference',
] as const;

export type ComparisonObjective = (typeof CANONICAL_COMPARISON_OBJECTIVES)[number];

// ---------------------------------------------------------------------------
// Canonical Comparison Dimensions (fixed, exactly 10)
// ---------------------------------------------------------------------------

export const CANONICAL_COMPARISON_DIMENSIONS = [
  'accuracy',
  'complexity',
  'efficiency',
  'memory',
  'scalability',
  'interpretability',
  'robustness',
  'maintainability',
  'implementation',
  'applicability',
] as const;

export type ComparisonDimension = (typeof CANONICAL_COMPARISON_DIMENSIONS)[number];

// ---------------------------------------------------------------------------
// Canonical Comparison Status (fixed, exactly 6)
// ---------------------------------------------------------------------------

export const CANONICAL_COMPARISON_STATUS = [
  'draft',
  'review',
  'approved',
  'canonical',
  'deprecated',
  'archived',
] as const;

export type ComparisonStatus = (typeof CANONICAL_COMPARISON_STATUS)[number];

// ---------------------------------------------------------------------------
// Canonical Comparison Visibility (fixed, exactly 10)
// ---------------------------------------------------------------------------

export const CANONICAL_COMPARISON_VISIBILITY = [
  'always',
  'default',
  'advanced',
  'expert',
  'curriculum',
  'assessment',
  'laboratory',
  'research',
  'internal',
  'hidden',
] as const;

export type ComparisonVisibility = (typeof CANONICAL_COMPARISON_VISIBILITY)[number];

// ---------------------------------------------------------------------------
// Canonical Comparison Governance (fixed, exactly 10)
// ---------------------------------------------------------------------------

export const CANONICAL_COMPARISON_GOVERNANCE = [
  'canonical',
  'accepted',
  'provisional',
  'experimental',
  'deprecated',
  'restricted',
  'internal',
  'public',
  'community',
  'archived',
] as const;

export type ComparisonGovernance = (typeof CANONICAL_COMPARISON_GOVERNANCE)[number];

// ---------------------------------------------------------------------------
// Knowledge Comparison Provenance
// ---------------------------------------------------------------------------

export interface KnowledgeComparisonProvenance {
  readonly source: string;
  readonly provider: string;
  readonly rationale: string;
  readonly governance: ComparisonGovernance;
}

// ---------------------------------------------------------------------------
// Knowledge Comparison Decision
// ---------------------------------------------------------------------------

export interface KnowledgeComparisonDecision {
  readonly decisionId: string;
  readonly comparisonId: string;
  readonly primaryConceptId: string;
  readonly validationPassed: boolean;
  readonly validationErrors: readonly string[];
}

// ---------------------------------------------------------------------------
// Knowledge Comparison Trace
// ---------------------------------------------------------------------------

export interface KnowledgeComparisonTrace {
  readonly traceId: string;
  readonly decisionCount: number;
  readonly validationCount: number;
  readonly registryVersion: string;
  readonly compositionVersion: string;
  readonly decisions: readonly KnowledgeComparisonDecision[];
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_comparison_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Knowledge Comparison Profile
// ---------------------------------------------------------------------------

export interface KnowledgeComparisonProfile {
  readonly comparisonId: string;
  readonly title: string;
  readonly comparisonType: ComparisonType;
  readonly objective: ComparisonObjective;
  readonly primaryConceptId: string;
  readonly secondaryConceptId: string;
  readonly dimensions: readonly ComparisonDimension[];
  readonly visibility: ComparisonVisibility;
  readonly status: ComparisonStatus;
  readonly governance: ComparisonGovernance;
  readonly tags: readonly string[];
  readonly provenance: KnowledgeComparisonProvenance;
}

// ---------------------------------------------------------------------------
// Knowledge Comparison Relationship
// ---------------------------------------------------------------------------

export interface KnowledgeComparisonRelationship {
  readonly relationshipId: string;
  readonly sourceComparisonId: string;
  readonly targetComparisonId: string;
  readonly relationshipType: 'prerequisite' | 'extension' | 'alternative' | 'complement';
  readonly description: string;
  readonly provenance: KnowledgeComparisonProvenance;
}

// ---------------------------------------------------------------------------
// Knowledge Comparison Registry Metadata
// ---------------------------------------------------------------------------

export interface KnowledgeComparisonRegistryMetadata {
  readonly registryId: string;
  readonly comparisonCount: number;
  readonly relationshipCount: number;
  readonly conceptCount: number;
  readonly typeCount: number;
}

// ---------------------------------------------------------------------------
// Knowledge Comparison Registry
// ---------------------------------------------------------------------------

export interface KnowledgeComparisonRegistry {
  readonly registryId: string;
  readonly profiles: readonly KnowledgeComparisonProfile[];
  readonly relationships: readonly KnowledgeComparisonRelationship[];
  readonly metadata: KnowledgeComparisonRegistryMetadata;
  readonly trace: KnowledgeComparisonTrace;
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_comparison_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Knowledge Comparison Input
// ---------------------------------------------------------------------------

export interface KnowledgeComparisonInput {
  readonly profiles: readonly KnowledgeComparisonProfile[];
  readonly relationships: readonly KnowledgeComparisonRelationship[];
}

// ---------------------------------------------------------------------------
// Knowledge Artifact With Comparisons
// ---------------------------------------------------------------------------

export interface KnowledgeArtifactWithComparisons {
  readonly conceptId: string;
  readonly conceptTitle: string;
  readonly profiles: readonly KnowledgeComparisonProfile[];
  readonly relationships: readonly KnowledgeComparisonRelationship[];
  readonly provenance: KnowledgeComparisonProvenance;
}

// ---------------------------------------------------------------------------
// Knowledge Comparison Validation Error
// ---------------------------------------------------------------------------

export interface KnowledgeComparisonValidationError {
  readonly code: string;
  readonly message: string;
  readonly field?: string;
  readonly comparisonId?: string;
}

// ---------------------------------------------------------------------------
// Knowledge Comparison Validation Result
// ---------------------------------------------------------------------------

export interface KnowledgeComparisonValidationResult {
  readonly valid: boolean;
  readonly errors: readonly KnowledgeComparisonValidationError[];
}

// ---------------------------------------------------------------------------
// Knowledge Comparison Registry Validation Result
// ---------------------------------------------------------------------------

export interface KnowledgeComparisonRegistryValidationResult {
  readonly valid: boolean;
  readonly errors: readonly KnowledgeComparisonValidationError[];
  readonly checkedAt: 'knowledge_comparison_registry_composition';
}

// ---------------------------------------------------------------------------
// Knowledge Comparison Input Validation Result
// ---------------------------------------------------------------------------

export interface KnowledgeComparisonInputValidationResult {
  readonly valid: boolean;
  readonly errors: readonly KnowledgeComparisonValidationError[];
  readonly checkedAt: 'knowledge_comparison_input_composition';
}

// ---------------------------------------------------------------------------
// Knowledge Comparison Trace Validation Result
// ---------------------------------------------------------------------------

export interface KnowledgeComparisonTraceValidationResult {
  readonly valid: boolean;
  readonly errors: readonly KnowledgeComparisonValidationError[];
  readonly checkedAt: 'knowledge_comparison_trace_composition';
}

// ---------------------------------------------------------------------------
// Knowledge Artifact With Comparisons Validation Result
// ---------------------------------------------------------------------------

export interface KnowledgeArtifactWithComparisonsValidationResult {
  readonly valid: boolean;
  readonly errors: readonly KnowledgeComparisonValidationError[];
  readonly checkedAt: 'knowledge_artifact_with_comparisons_composition';
}

// ============================================================================
// D10-OPT-07 — Mathematical Graph Modeling
// ============================================================================

// ---------------------------------------------------------------------------
// Canonical Graph Types (fixed, exactly 10)
// ---------------------------------------------------------------------------

export const CANONICAL_GRAPH_TYPES = [
  'function_graph',
  'coordinate_plane',
  'parametric_curve',
  'polar_graph',
  'implicit_curve',
  'surface_reference',
  'vector_field_reference',
  'probability_distribution',
  'optimization_landscape',
  'geometric_visualization',
] as const;

export type MathGraphType = (typeof CANONICAL_GRAPH_TYPES)[number];

// ---------------------------------------------------------------------------
// Canonical Graph Objectives (fixed, exactly 10)
// ---------------------------------------------------------------------------

export const CANONICAL_GRAPH_OBJECTIVES = [
  'visualize',
  'formalize',
  'derive',
  'compare',
  'analyze',
  'demonstrate',
  'interpret',
  'connect',
  'explore',
  'reference',
] as const;

export type MathGraphObjective = (typeof CANONICAL_GRAPH_OBJECTIVES)[number];

// ---------------------------------------------------------------------------
// Canonical Coordinate Systems (fixed, exactly 10)
// ---------------------------------------------------------------------------

export const CANONICAL_COORDINATE_SYSTEMS = [
  'cartesian_2d',
  'cartesian_3d',
  'polar',
  'cylindrical',
  'spherical',
  'parametric',
  'complex_plane',
  'probability_space',
  'feature_space',
  'abstract_space',
] as const;

export type CoordinateSystem = (typeof CANONICAL_COORDINATE_SYSTEMS)[number];

// ---------------------------------------------------------------------------
// Canonical Graph Status (fixed, exactly 6)
// ---------------------------------------------------------------------------

export const CANONICAL_GRAPH_STATUS = [
  'draft',
  'review',
  'approved',
  'canonical',
  'deprecated',
  'archived',
] as const;

export type MathGraphStatus = (typeof CANONICAL_GRAPH_STATUS)[number];

// ---------------------------------------------------------------------------
// Canonical Graph Visibility (fixed, exactly 10)
// ---------------------------------------------------------------------------

export const CANONICAL_GRAPH_VISIBILITY = [
  'always',
  'default',
  'advanced',
  'expert',
  'curriculum',
  'assessment',
  'laboratory',
  'research',
  'internal',
  'hidden',
] as const;

export type MathGraphVisibility = (typeof CANONICAL_GRAPH_VISIBILITY)[number];

// ---------------------------------------------------------------------------
// Canonical Graph Governance (fixed, exactly 10)
// ---------------------------------------------------------------------------

export const CANONICAL_GRAPH_GOVERNANCE = [
  'canonical',
  'accepted',
  'provisional',
  'experimental',
  'deprecated',
  'restricted',
  'internal',
  'public',
  'community',
  'archived',
] as const;

export type MathGraphGovernance = (typeof CANONICAL_GRAPH_GOVERNANCE)[number];

// ---------------------------------------------------------------------------
// Knowledge Graph Provenance (Mathematical)
// ---------------------------------------------------------------------------

export interface KnowledgeGraphProvenance {
  readonly source: string;
  readonly provider: string;
  readonly rationale: string;
  readonly governance: MathGraphGovernance;
}

// ---------------------------------------------------------------------------
// Knowledge Graph Decision (Mathematical)
// ---------------------------------------------------------------------------

export interface KnowledgeGraphDecision {
  readonly decisionId: string;
  readonly graphId: string;
  readonly conceptId: string;
  readonly validationPassed: boolean;
  readonly validationErrors: readonly string[];
}

// ---------------------------------------------------------------------------
// Knowledge Graph Trace (Mathematical)
// ---------------------------------------------------------------------------

export interface KnowledgeGraphTrace {
  readonly traceId: string;
  readonly decisionCount: number;
  readonly validationCount: number;
  readonly registryVersion: string;
  readonly compositionVersion: string;
  readonly decisions: readonly KnowledgeGraphDecision[];
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_math_graph_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Knowledge Graph Profile (Mathematical)
// ---------------------------------------------------------------------------

export interface KnowledgeGraphProfile {
  readonly graphId: string;
  readonly title: string;
  readonly conceptId: string;
  readonly graphType: MathGraphType;
  readonly objective: MathGraphObjective;
  readonly coordinateSystem: CoordinateSystem;
  readonly mathematicalExpressionRef: string;
  readonly domainReference: string;
  readonly rangeReference: string;
  readonly visualizationParameters: readonly string[];
  readonly visibility: MathGraphVisibility;
  readonly status: MathGraphStatus;
  readonly governance: MathGraphGovernance;
  readonly tags: readonly string[];
  readonly provenance: KnowledgeGraphProvenance;
}

// ---------------------------------------------------------------------------
// Knowledge Graph Relationship (Mathematical)
// ---------------------------------------------------------------------------

export interface KnowledgeGraphRelationship {
  readonly relationshipId: string;
  readonly sourceGraphId: string;
  readonly targetGraphId: string;
  readonly relationshipType: 'prerequisite' | 'extension' | 'alternative' | 'complement';
  readonly description: string;
  readonly provenance: KnowledgeGraphProvenance;
}

// ---------------------------------------------------------------------------
// Knowledge Graph Registry Metadata (Mathematical)
// ---------------------------------------------------------------------------

export interface KnowledgeGraphRegistryMetadata {
  readonly registryId: string;
  readonly graphCount: number;
  readonly relationshipCount: number;
  readonly conceptCount: number;
  readonly typeCount: number;
}

// ---------------------------------------------------------------------------
// Knowledge Graph Registry (Mathematical)
// ---------------------------------------------------------------------------

export interface KnowledgeGraphRegistry {
  readonly registryId: string;
  readonly profiles: readonly KnowledgeGraphProfile[];
  readonly relationships: readonly KnowledgeGraphRelationship[];
  readonly metadata: KnowledgeGraphRegistryMetadata;
  readonly trace: KnowledgeGraphTrace;
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_math_graph_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Knowledge Graph Input (Mathematical)
// ---------------------------------------------------------------------------

export interface KnowledgeGraphInput {
  readonly profiles: readonly KnowledgeGraphProfile[];
  readonly relationships: readonly KnowledgeGraphRelationship[];
}

// ---------------------------------------------------------------------------
// Knowledge Artifact With Graphs (Mathematical)
// ---------------------------------------------------------------------------

export interface KnowledgeArtifactWithGraphs {
  readonly conceptId: string;
  readonly conceptTitle: string;
  readonly profiles: readonly KnowledgeGraphProfile[];
  readonly relationships: readonly KnowledgeGraphRelationship[];
  readonly provenance: KnowledgeGraphProvenance;
}

// ---------------------------------------------------------------------------
// Knowledge Graph Validation Error (Mathematical)
// ---------------------------------------------------------------------------

export interface KnowledgeGraphValidationError {
  readonly code: string;
  readonly message: string;
  readonly field?: string;
  readonly graphId?: string;
}

// ---------------------------------------------------------------------------
// Knowledge Graph Validation Result (Mathematical)
// ---------------------------------------------------------------------------

export interface KnowledgeGraphValidationResult {
  readonly valid: boolean;
  readonly errors: readonly KnowledgeGraphValidationError[];
}

// ---------------------------------------------------------------------------
// Knowledge Graph Registry Validation Result (Mathematical)
// ---------------------------------------------------------------------------

export interface KnowledgeGraphRegistryValidationResult {
  readonly valid: boolean;
  readonly errors: readonly KnowledgeGraphValidationError[];
  readonly checkedAt: 'knowledge_graph_registry_composition';
}

// ---------------------------------------------------------------------------
// Knowledge Graph Input Validation Result (Mathematical)
// ---------------------------------------------------------------------------

export interface KnowledgeGraphInputValidationResult {
  readonly valid: boolean;
  readonly errors: readonly KnowledgeGraphValidationError[];
  readonly checkedAt: 'knowledge_graph_input_composition';
}

// ---------------------------------------------------------------------------
// Knowledge Graph Trace Validation Result (Mathematical)
// ---------------------------------------------------------------------------

export interface KnowledgeGraphTraceValidationResult {
  readonly valid: boolean;
  readonly errors: readonly KnowledgeGraphValidationError[];
  readonly checkedAt: 'knowledge_graph_trace_composition';
}

// ---------------------------------------------------------------------------
// Knowledge Artifact With Graphs Validation Result (Mathematical)
// ---------------------------------------------------------------------------

export interface KnowledgeArtifactWithGraphsValidationResult {
  readonly valid: boolean;
  readonly errors: readonly KnowledgeGraphValidationError[];
  readonly checkedAt: 'knowledge_artifact_with_graphs_composition';
}

// ============================================================================
// D10-OPT-08 — Visualization Metadata
// ============================================================================

// ---------------------------------------------------------------------------
// Canonical Visualization Types (fixed, exactly 10)
// ---------------------------------------------------------------------------

export const CANONICAL_VISUALIZATION_TYPES = [
  'concept_diagram',
  'process_flow',
  'architecture_overview',
  'knowledge_graph',
  'timeline',
  'comparison_matrix',
  'decision_tree',
  'pipeline_overview',
  'hierarchy',
  'system_map',
] as const;

export type VisualizationType = (typeof CANONICAL_VISUALIZATION_TYPES)[number];

// ---------------------------------------------------------------------------
// Canonical Visualization Objectives (fixed, exactly 10)
// ---------------------------------------------------------------------------

export const CANONICAL_VISUALIZATION_OBJECTIVES = [
  'introduce',
  'clarify',
  'summarize',
  'compare',
  'organize',
  'connect',
  'visualize',
  'navigate',
  'analyze',
  'reference',
] as const;

export type VisualizationObjective = (typeof CANONICAL_VISUALIZATION_OBJECTIVES)[number];

// ---------------------------------------------------------------------------
// Canonical Visualization Complexity (fixed, exactly 10)
// ---------------------------------------------------------------------------

export const CANONICAL_VISUALIZATION_COMPLEXITY = [
  'minimal',
  'simple',
  'standard',
  'intermediate',
  'advanced',
  'expert',
  'engineering',
  'research',
  'reference',
  'canonical',
] as const;

export type VisualizationComplexity = (typeof CANONICAL_VISUALIZATION_COMPLEXITY)[number];

// ---------------------------------------------------------------------------
// Canonical Visualization Status (fixed, exactly 6)
// ---------------------------------------------------------------------------

export const CANONICAL_VISUALIZATION_STATUS = [
  'draft',
  'review',
  'approved',
  'canonical',
  'deprecated',
  'archived',
] as const;

export type VisualizationStatus = (typeof CANONICAL_VISUALIZATION_STATUS)[number];

// ---------------------------------------------------------------------------
// Canonical Visualization Visibility (fixed, exactly 10)
// ---------------------------------------------------------------------------

export const CANONICAL_VISUALIZATION_VISIBILITY = [
  'always',
  'default',
  'advanced',
  'expert',
  'curriculum',
  'assessment',
  'laboratory',
  'research',
  'internal',
  'hidden',
] as const;

export type VisualizationVisibility = (typeof CANONICAL_VISUALIZATION_VISIBILITY)[number];

// ---------------------------------------------------------------------------
// Canonical Visualization Governance (fixed, exactly 10)
// ---------------------------------------------------------------------------

export const CANONICAL_VISUALIZATION_GOVERNANCE = [
  'canonical',
  'accepted',
  'provisional',
  'experimental',
  'deprecated',
  'restricted',
  'internal',
  'public',
  'community',
  'archived',
] as const;

export type VisualizationGovernance = (typeof CANONICAL_VISUALIZATION_GOVERNANCE)[number];

// ---------------------------------------------------------------------------
// Knowledge Visualization Provenance
// ---------------------------------------------------------------------------

export interface KnowledgeVisualizationProvenance {
  readonly source: string;
  readonly provider: string;
  readonly rationale: string;
  readonly governance: VisualizationGovernance;
}

// ---------------------------------------------------------------------------
// Knowledge Visualization Decision
// ---------------------------------------------------------------------------

export interface KnowledgeVisualizationDecision {
  readonly decisionId: string;
  readonly visualizationId: string;
  readonly conceptId: string;
  readonly validationPassed: boolean;
  readonly validationErrors: readonly string[];
}

// ---------------------------------------------------------------------------
// Knowledge Visualization Trace
// ---------------------------------------------------------------------------

export interface KnowledgeVisualizationTrace {
  readonly traceId: string;
  readonly decisionCount: number;
  readonly validationCount: number;
  readonly registryVersion: string;
  readonly compositionVersion: string;
  readonly decisions: readonly KnowledgeVisualizationDecision[];
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_visualization_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Knowledge Visualization Profile
// ---------------------------------------------------------------------------

export interface KnowledgeVisualizationProfile {
  readonly visualizationId: string;
  readonly conceptId: string;
  readonly title: string;
  readonly visualizationType: VisualizationType;
  readonly objective: VisualizationObjective;
  readonly complexity: VisualizationComplexity;
  readonly visibility: VisualizationVisibility;
  readonly status: VisualizationStatus;
  readonly governance: VisualizationGovernance;
  readonly orderIndex: number;
  readonly tags: readonly string[];
  readonly resourceReferences: readonly string[];
  readonly provenance: KnowledgeVisualizationProvenance;
}

// ---------------------------------------------------------------------------
// Knowledge Visualization Relationship
// ---------------------------------------------------------------------------

export interface KnowledgeVisualizationRelationship {
  readonly relationshipId: string;
  readonly sourceVisualizationId: string;
  readonly targetVisualizationId: string;
  readonly relationshipType: 'prerequisite' | 'extension' | 'alternative' | 'complement';
  readonly description: string;
  readonly provenance: KnowledgeVisualizationProvenance;
}

// ---------------------------------------------------------------------------
// Knowledge Visualization Registry Metadata
// ---------------------------------------------------------------------------

export interface KnowledgeVisualizationRegistryMetadata {
  readonly registryId: string;
  readonly visualizationCount: number;
  readonly relationshipCount: number;
  readonly conceptCount: number;
  readonly visualizationTypeCount: number;
}

// ---------------------------------------------------------------------------
// Knowledge Visualization Registry
// ---------------------------------------------------------------------------

export interface KnowledgeVisualizationRegistry {
  readonly registryId: string;
  readonly profiles: readonly KnowledgeVisualizationProfile[];
  readonly relationships: readonly KnowledgeVisualizationRelationship[];
  readonly metadata: KnowledgeVisualizationRegistryMetadata;
  readonly trace: KnowledgeVisualizationTrace;
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_visualization_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Knowledge Visualization Input
// ---------------------------------------------------------------------------

export interface KnowledgeVisualizationInput {
  readonly profiles: readonly KnowledgeVisualizationProfile[];
  readonly relationships: readonly KnowledgeVisualizationRelationship[];
}

// ---------------------------------------------------------------------------
// Knowledge Artifact With Visualizations
// ---------------------------------------------------------------------------

export interface KnowledgeArtifactWithVisualizations {
  readonly conceptId: string;
  readonly conceptTitle: string;
  readonly profiles: readonly KnowledgeVisualizationProfile[];
  readonly relationships: readonly KnowledgeVisualizationRelationship[];
  readonly provenance: KnowledgeVisualizationProvenance;
}

// ---------------------------------------------------------------------------
// Knowledge Visualization Validation Error
// ---------------------------------------------------------------------------

export interface KnowledgeVisualizationValidationError {
  readonly code: string;
  readonly message: string;
  readonly field?: string;
  readonly visualizationId?: string;
}

// ---------------------------------------------------------------------------
// Knowledge Visualization Validation Result
// ---------------------------------------------------------------------------

export interface KnowledgeVisualizationValidationResult {
  readonly valid: boolean;
  readonly errors: readonly KnowledgeVisualizationValidationError[];
}

// ---------------------------------------------------------------------------
// Knowledge Visualization Registry Validation Result
// ---------------------------------------------------------------------------

export interface KnowledgeVisualizationRegistryValidationResult {
  readonly valid: boolean;
  readonly errors: readonly KnowledgeVisualizationValidationError[];
  readonly checkedAt: 'knowledge_visualization_registry_composition';
}

// ---------------------------------------------------------------------------
// Knowledge Visualization Input Validation Result
// ---------------------------------------------------------------------------

export interface KnowledgeVisualizationInputValidationResult {
  readonly valid: boolean;
  readonly errors: readonly KnowledgeVisualizationValidationError[];
  readonly checkedAt: 'knowledge_visualization_input_composition';
}

// ---------------------------------------------------------------------------
// Knowledge Visualization Trace Validation Result
// ---------------------------------------------------------------------------

export interface KnowledgeVisualizationTraceValidationResult {
  readonly valid: boolean;
  readonly errors: readonly KnowledgeVisualizationValidationError[];
  readonly checkedAt: 'knowledge_visualization_trace_composition';
}

// ---------------------------------------------------------------------------
// Knowledge Artifact With Visualizations Validation Result
// ---------------------------------------------------------------------------

export interface KnowledgeArtifactWithVisualizationsValidationResult {
  readonly valid: boolean;
  readonly errors: readonly KnowledgeVisualizationValidationError[];
  readonly checkedAt: 'knowledge_artifact_with_visualizations_composition';
}

// ============================================================================
// D10-OPT-09 — Laboratory Metadata
// ============================================================================

// ---------------------------------------------------------------------------
// Canonical Laboratory Types (fixed, exactly 10)
// ---------------------------------------------------------------------------

export const CANONICAL_LABORATORY_TYPES = [
  'interactive_laboratory',
  'simulation_reference',
  'coding_laboratory',
  'mathematical_laboratory',
  'computer_vision_laboratory',
  'machine_learning_laboratory',
  'data_science_laboratory',
  'engineering_laboratory',
  'research_laboratory',
  'experimental_workbench',
] as const;

export type LaboratoryType = (typeof CANONICAL_LABORATORY_TYPES)[number];

// ---------------------------------------------------------------------------
// Canonical Laboratory Objectives (fixed, exactly 10)
// ---------------------------------------------------------------------------

export const CANONICAL_LABORATORY_OBJECTIVES = [
  'introduce',
  'demonstrate',
  'explore',
  'experiment',
  'implement',
  'validate',
  'compare',
  'optimize',
  'investigate',
  'master',
] as const;

export type LaboratoryObjective = (typeof CANONICAL_LABORATORY_OBJECTIVES)[number];

// ---------------------------------------------------------------------------
// Canonical Laboratory Complexity (fixed, exactly 10)
// ---------------------------------------------------------------------------

export const CANONICAL_LABORATORY_COMPLEXITY = [
  'minimal',
  'simple',
  'standard',
  'intermediate',
  'advanced',
  'expert',
  'engineering',
  'research',
  'reference',
  'canonical',
] as const;

export type LaboratoryComplexity = (typeof CANONICAL_LABORATORY_COMPLEXITY)[number];

// ---------------------------------------------------------------------------
// Canonical Laboratory Status (fixed, exactly 6)
// ---------------------------------------------------------------------------

export const CANONICAL_LABORATORY_STATUS = [
  'draft',
  'review',
  'approved',
  'canonical',
  'deprecated',
  'archived',
] as const;

export type LaboratoryStatus = (typeof CANONICAL_LABORATORY_STATUS)[number];

// ---------------------------------------------------------------------------
// Canonical Laboratory Visibility (fixed, exactly 10)
// ---------------------------------------------------------------------------

export const CANONICAL_LABORATORY_VISIBILITY = [
  'always',
  'default',
  'advanced',
  'expert',
  'curriculum',
  'assessment',
  'laboratory',
  'research',
  'internal',
  'hidden',
] as const;

export type LaboratoryVisibility = (typeof CANONICAL_LABORATORY_VISIBILITY)[number];

// ---------------------------------------------------------------------------
// Canonical Laboratory Governance (fixed, exactly 10)
// ---------------------------------------------------------------------------

export const CANONICAL_LABORATORY_GOVERNANCE = [
  'canonical',
  'accepted',
  'provisional',
  'experimental',
  'deprecated',
  'restricted',
  'internal',
  'public',
  'community',
  'archived',
] as const;

export type LaboratoryGovernance = (typeof CANONICAL_LABORATORY_GOVERNANCE)[number];

// ---------------------------------------------------------------------------
// Knowledge Laboratory Provenance
// ---------------------------------------------------------------------------

export interface KnowledgeLaboratoryProvenance {
  readonly source: string;
  readonly provider: string;
  readonly rationale: string;
  readonly governance: LaboratoryGovernance;
}

// ---------------------------------------------------------------------------
// Knowledge Laboratory Decision
// ---------------------------------------------------------------------------

export interface KnowledgeLaboratoryDecision {
  readonly decisionId: string;
  readonly laboratoryId: string;
  readonly conceptId: string;
  readonly validationPassed: boolean;
  readonly validationErrors: readonly string[];
}

// ---------------------------------------------------------------------------
// Knowledge Laboratory Trace
// ---------------------------------------------------------------------------

export interface KnowledgeLaboratoryTrace {
  readonly traceId: string;
  readonly decisionCount: number;
  readonly validationCount: number;
  readonly registryVersion: string;
  readonly compositionVersion: string;
  readonly decisions: readonly KnowledgeLaboratoryDecision[];
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_laboratory_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Knowledge Laboratory Profile
// ---------------------------------------------------------------------------

export interface KnowledgeLaboratoryProfile {
  readonly laboratoryId: string;
  readonly conceptId: string;
  readonly title: string;
  readonly laboratoryType: LaboratoryType;
  readonly objective: LaboratoryObjective;
  readonly complexity: LaboratoryComplexity;
  readonly visibility: LaboratoryVisibility;
  readonly status: LaboratoryStatus;
  readonly governance: LaboratoryGovernance;
  readonly orderIndex: number;
  readonly tags: readonly string[];
  readonly resourceReferences: readonly string[];
  readonly provenance: KnowledgeLaboratoryProvenance;
}

// ---------------------------------------------------------------------------
// Knowledge Laboratory Relationship
// ---------------------------------------------------------------------------

export interface KnowledgeLaboratoryRelationship {
  readonly relationshipId: string;
  readonly sourceLaboratoryId: string;
  readonly targetLaboratoryId: string;
  readonly relationshipType: 'prerequisite' | 'extension' | 'alternative' | 'complement';
  readonly description: string;
  readonly provenance: KnowledgeLaboratoryProvenance;
}

// ---------------------------------------------------------------------------
// Knowledge Laboratory Registry Metadata
// ---------------------------------------------------------------------------

export interface KnowledgeLaboratoryRegistryMetadata {
  readonly registryId: string;
  readonly laboratoryCount: number;
  readonly relationshipCount: number;
  readonly conceptCount: number;
  readonly laboratoryTypeCount: number;
}

// ---------------------------------------------------------------------------
// Knowledge Laboratory Registry
// ---------------------------------------------------------------------------

export interface KnowledgeLaboratoryRegistry {
  readonly registryId: string;
  readonly profiles: readonly KnowledgeLaboratoryProfile[];
  readonly relationships: readonly KnowledgeLaboratoryRelationship[];
  readonly metadata: KnowledgeLaboratoryRegistryMetadata;
  readonly trace: KnowledgeLaboratoryTrace;
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_laboratory_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Knowledge Laboratory Input
// ---------------------------------------------------------------------------

export interface KnowledgeLaboratoryInput {
  readonly profiles: readonly KnowledgeLaboratoryProfile[];
  readonly relationships: readonly KnowledgeLaboratoryRelationship[];
}

// ---------------------------------------------------------------------------
// Knowledge Artifact With Laboratories
// ---------------------------------------------------------------------------

export interface KnowledgeArtifactWithLaboratories {
  readonly conceptId: string;
  readonly conceptTitle: string;
  readonly profiles: readonly KnowledgeLaboratoryProfile[];
  readonly relationships: readonly KnowledgeLaboratoryRelationship[];
  readonly provenance: KnowledgeLaboratoryProvenance;
}

// ---------------------------------------------------------------------------
// Knowledge Laboratory Validation Error
// ---------------------------------------------------------------------------

export interface KnowledgeLaboratoryValidationError {
  readonly code: string;
  readonly message: string;
  readonly field?: string;
  readonly laboratoryId?: string;
}

// ---------------------------------------------------------------------------
// Knowledge Laboratory Validation Result
// ---------------------------------------------------------------------------

export interface KnowledgeLaboratoryValidationResult {
  readonly valid: boolean;
  readonly errors: readonly KnowledgeLaboratoryValidationError[];
}

// ---------------------------------------------------------------------------
// Knowledge Laboratory Registry Validation Result
// ---------------------------------------------------------------------------

export interface KnowledgeLaboratoryRegistryValidationResult {
  readonly valid: boolean;
  readonly errors: readonly KnowledgeLaboratoryValidationError[];
  readonly checkedAt: 'knowledge_laboratory_registry_composition';
}

// ---------------------------------------------------------------------------
// Knowledge Laboratory Input Validation Result
// ---------------------------------------------------------------------------

export interface KnowledgeLaboratoryInputValidationResult {
  readonly valid: boolean;
  readonly errors: readonly KnowledgeLaboratoryValidationError[];
  readonly checkedAt: 'knowledge_laboratory_input_composition';
}

// ---------------------------------------------------------------------------
// Knowledge Laboratory Trace Validation Result
// ---------------------------------------------------------------------------

export interface KnowledgeLaboratoryTraceValidationResult {
  readonly valid: boolean;
  readonly errors: readonly KnowledgeLaboratoryValidationError[];
  readonly checkedAt: 'knowledge_laboratory_trace_composition';
}

// ---------------------------------------------------------------------------
// Knowledge Artifact With Laboratories Validation Result
// ---------------------------------------------------------------------------

export interface KnowledgeArtifactWithLaboratoriesValidationResult {
  readonly valid: boolean;
  readonly errors: readonly KnowledgeLaboratoryValidationError[];
  readonly checkedAt: 'knowledge_artifact_with_laboratories_composition';
}

// ============================================================================
// D10-OPT-10 — Research Provenance
// ============================================================================

// ---------------------------------------------------------------------------
// Canonical Research Source Types (fixed, exactly 10)
// ---------------------------------------------------------------------------

export const CANONICAL_RESEARCH_SOURCE_TYPES = [
  'journal_article',
  'conference_paper',
  'technical_report',
  'book',
  'book_chapter',
  'official_documentation',
  'standard',
  'whitepaper',
  'thesis',
  'reference_work',
] as const;

export type ResearchSourceType = (typeof CANONICAL_RESEARCH_SOURCE_TYPES)[number];

// ---------------------------------------------------------------------------
// Canonical Evidence Levels (fixed, exactly 10)
// ---------------------------------------------------------------------------

export const CANONICAL_EVIDENCE_LEVELS = [
  'canonical',
  'peer_reviewed',
  'official',
  'validated',
  'widely_accepted',
  'community_reviewed',
  'provisional',
  'experimental',
  'historical',
  'deprecated',
] as const;

export type EvidenceLevel = (typeof CANONICAL_EVIDENCE_LEVELS)[number];

// ---------------------------------------------------------------------------
// Canonical Citation Types (fixed, exactly 10)
// ---------------------------------------------------------------------------

export const CANONICAL_RESEARCH_CITATION_TYPES = [
  'primary_source',
  'secondary_source',
  'review',
  'survey',
  'textbook',
  'documentation',
  'specification',
  'standard',
  'historical',
  'supplementary',
] as const;

export type ResearchCitationType = (typeof CANONICAL_RESEARCH_CITATION_TYPES)[number];

// ---------------------------------------------------------------------------
// Canonical Research Status (fixed, exactly 6)
// ---------------------------------------------------------------------------

export const CANONICAL_RESEARCH_STATUS = [
  'draft',
  'review',
  'approved',
  'canonical',
  'deprecated',
  'archived',
] as const;

export type ResearchStatus = (typeof CANONICAL_RESEARCH_STATUS)[number];

// ---------------------------------------------------------------------------
// Canonical Research Visibility (fixed, exactly 10)
// ---------------------------------------------------------------------------

export const CANONICAL_RESEARCH_VISIBILITY = [
  'always',
  'default',
  'advanced',
  'expert',
  'curriculum',
  'assessment',
  'laboratory',
  'research',
  'internal',
  'hidden',
] as const;

export type ResearchVisibility = (typeof CANONICAL_RESEARCH_VISIBILITY)[number];

// ---------------------------------------------------------------------------
// Canonical Research Governance (fixed, exactly 10)
// ---------------------------------------------------------------------------

export const CANONICAL_RESEARCH_GOVERNANCE = [
  'canonical',
  'accepted',
  'provisional',
  'experimental',
  'deprecated',
  'restricted',
  'internal',
  'public',
  'community',
  'archived',
] as const;

export type ResearchGovernance = (typeof CANONICAL_RESEARCH_GOVERNANCE)[number];

// ---------------------------------------------------------------------------
// Knowledge Research Provenance
// ---------------------------------------------------------------------------

export interface KnowledgeResearchProvenance {
  readonly source: string;
  readonly provider: string;
  readonly rationale: string;
  readonly governance: ResearchGovernance;
}

// ---------------------------------------------------------------------------
// Knowledge Research Decision
// ---------------------------------------------------------------------------

export interface KnowledgeResearchDecision {
  readonly decisionId: string;
  readonly researchId: string;
  readonly conceptId: string;
  readonly validationPassed: boolean;
  readonly validationErrors: readonly string[];
}

// ---------------------------------------------------------------------------
// Knowledge Research Trace
// ---------------------------------------------------------------------------

export interface KnowledgeResearchTrace {
  readonly traceId: string;
  readonly decisionCount: number;
  readonly validationCount: number;
  readonly registryVersion: string;
  readonly compositionVersion: string;
  readonly decisions: readonly KnowledgeResearchDecision[];
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_research_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Knowledge Research Profile
// ---------------------------------------------------------------------------

export interface KnowledgeResearchProfile {
  readonly researchId: string;
  readonly conceptId: string;
  readonly title: string;
  readonly researchSourceType: ResearchSourceType;
  readonly evidenceLevel: EvidenceLevel;
  readonly citationType: ResearchCitationType;
  readonly publicationYear: number;
  readonly doiReference: string;
  readonly authors: readonly string[];
  readonly publisher: string;
  readonly visibility: ResearchVisibility;
  readonly status: ResearchStatus;
  readonly governance: ResearchGovernance;
  readonly tags: readonly string[];
  readonly provenance: KnowledgeResearchProvenance;
}

// ---------------------------------------------------------------------------
// Knowledge Research Relationship
// ---------------------------------------------------------------------------

export interface KnowledgeResearchRelationship {
  readonly relationshipId: string;
  readonly sourceResearchId: string;
  readonly targetResearchId: string;
  readonly relationshipType: 'prerequisite' | 'extension' | 'alternative' | 'complement';
  readonly description: string;
  readonly provenance: KnowledgeResearchProvenance;
}

// ---------------------------------------------------------------------------
// Knowledge Research Registry Metadata
// ---------------------------------------------------------------------------

export interface KnowledgeResearchRegistryMetadata {
  readonly registryId: string;
  readonly researchCount: number;
  readonly relationshipCount: number;
  readonly conceptCount: number;
  readonly sourceTypeCount: number;
}

// ---------------------------------------------------------------------------
// Knowledge Research Registry
// ---------------------------------------------------------------------------

export interface KnowledgeResearchRegistry {
  readonly registryId: string;
  readonly profiles: readonly KnowledgeResearchProfile[];
  readonly relationships: readonly KnowledgeResearchRelationship[];
  readonly metadata: KnowledgeResearchRegistryMetadata;
  readonly trace: KnowledgeResearchTrace;
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_research_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Knowledge Research Input
// ---------------------------------------------------------------------------

export interface KnowledgeResearchInput {
  readonly profiles: readonly KnowledgeResearchProfile[];
  readonly relationships: readonly KnowledgeResearchRelationship[];
}

// ---------------------------------------------------------------------------
// Knowledge Artifact With Research
// ---------------------------------------------------------------------------

export interface KnowledgeArtifactWithResearch {
  readonly conceptId: string;
  readonly conceptTitle: string;
  readonly profiles: readonly KnowledgeResearchProfile[];
  readonly relationships: readonly KnowledgeResearchRelationship[];
  readonly provenance: KnowledgeResearchProvenance;
}

// ---------------------------------------------------------------------------
// Knowledge Research Validation Error
// ---------------------------------------------------------------------------

export interface KnowledgeResearchValidationError {
  readonly code: string;
  readonly message: string;
  readonly field?: string;
  readonly researchId?: string;
}

// ---------------------------------------------------------------------------
// Knowledge Research Validation Result
// ---------------------------------------------------------------------------

export interface KnowledgeResearchValidationResult {
  readonly valid: boolean;
  readonly errors: readonly KnowledgeResearchValidationError[];
}

// ---------------------------------------------------------------------------
// Knowledge Research Registry Validation Result
// ---------------------------------------------------------------------------

export interface KnowledgeResearchRegistryValidationResult {
  readonly valid: boolean;
  readonly errors: readonly KnowledgeResearchValidationError[];
  readonly checkedAt: 'knowledge_research_registry_composition';
}

// ---------------------------------------------------------------------------
// Knowledge Research Input Validation Result
// ---------------------------------------------------------------------------

export interface KnowledgeResearchInputValidationResult {
  readonly valid: boolean;
  readonly errors: readonly KnowledgeResearchValidationError[];
  readonly checkedAt: 'knowledge_research_input_composition';
}

// ---------------------------------------------------------------------------
// Knowledge Research Trace Validation Result
// ---------------------------------------------------------------------------

export interface KnowledgeResearchTraceValidationResult {
  readonly valid: boolean;
  readonly errors: readonly KnowledgeResearchValidationError[];
  readonly checkedAt: 'knowledge_research_trace_composition';
}

// ---------------------------------------------------------------------------
// Knowledge Artifact With Research Validation Result
// ---------------------------------------------------------------------------

export interface KnowledgeArtifactWithResearchValidationResult {
  readonly valid: boolean;
  readonly errors: readonly KnowledgeResearchValidationError[];
  readonly checkedAt: 'knowledge_artifact_with_research_composition';
}

// ============================================================================
// D10-OPT-11 — Application Metadata
// ============================================================================

// ---------------------------------------------------------------------------
// Canonical Application Types (fixed, exactly 10)
// ---------------------------------------------------------------------------

export const CANONICAL_APPLICATION_TYPES = [
  'software_system',
  'embedded_system',
  'web_application',
  'mobile_application',
  'machine_learning_system',
  'computer_vision_system',
  'robotics_system',
  'data_platform',
  'cloud_service',
  'research_prototype',
] as const;

export type ApplicationType = (typeof CANONICAL_APPLICATION_TYPES)[number];

// ---------------------------------------------------------------------------
// Canonical Application Objectives (fixed, exactly 10)
// ---------------------------------------------------------------------------

export const CANONICAL_APPLICATION_OBJECTIVES = [
  'introduce',
  'demonstrate',
  'apply',
  'integrate',
  'optimize',
  'analyze',
  'compare',
  'engineer',
  'deploy',
  'reference',
] as const;

export type ApplicationObjective = (typeof CANONICAL_APPLICATION_OBJECTIVES)[number];

// ---------------------------------------------------------------------------
// Canonical Application Domains (fixed, exactly 10)
// ---------------------------------------------------------------------------

export const CANONICAL_APPLICATION_DOMAINS = [
  'artificial_intelligence',
  'computer_vision',
  'machine_learning',
  'robotics',
  'software_engineering',
  'data_science',
  'cybersecurity',
  'cloud_computing',
  'healthcare',
  'industrial_automation',
] as const;

export type ApplicationDomain = (typeof CANONICAL_APPLICATION_DOMAINS)[number];

// ---------------------------------------------------------------------------
// Canonical Application Status (fixed, exactly 6)
// ---------------------------------------------------------------------------

export const CANONICAL_APPLICATION_STATUS = [
  'draft',
  'review',
  'approved',
  'canonical',
  'deprecated',
  'archived',
] as const;

export type ApplicationStatus = (typeof CANONICAL_APPLICATION_STATUS)[number];

// ---------------------------------------------------------------------------
// Canonical Application Visibility (fixed, exactly 10)
// ---------------------------------------------------------------------------

export const CANONICAL_APPLICATION_VISIBILITY = [
  'always',
  'default',
  'advanced',
  'expert',
  'curriculum',
  'assessment',
  'laboratory',
  'research',
  'internal',
  'hidden',
] as const;

export type ApplicationVisibility = (typeof CANONICAL_APPLICATION_VISIBILITY)[number];

// ---------------------------------------------------------------------------
// Canonical Application Governance (fixed, exactly 10)
// ---------------------------------------------------------------------------

export const CANONICAL_APPLICATION_GOVERNANCE = [
  'canonical',
  'accepted',
  'provisional',
  'experimental',
  'deprecated',
  'restricted',
  'internal',
  'public',
  'community',
  'archived',
] as const;

export type ApplicationGovernance = (typeof CANONICAL_APPLICATION_GOVERNANCE)[number];

// ---------------------------------------------------------------------------
// Knowledge Application Provenance
// ---------------------------------------------------------------------------

export interface KnowledgeApplicationProvenance {
  readonly source: string;
  readonly provider: string;
  readonly rationale: string;
  readonly governance: ApplicationGovernance;
}

// ---------------------------------------------------------------------------
// Knowledge Application Decision
// ---------------------------------------------------------------------------

export interface KnowledgeApplicationDecision {
  readonly decisionId: string;
  readonly applicationId: string;
  readonly conceptId: string;
  readonly validationPassed: boolean;
  readonly validationErrors: readonly string[];
}

// ---------------------------------------------------------------------------
// Knowledge Application Trace
// ---------------------------------------------------------------------------

export interface KnowledgeApplicationTrace {
  readonly traceId: string;
  readonly decisionCount: number;
  readonly validationCount: number;
  readonly registryVersion: string;
  readonly compositionVersion: string;
  readonly decisions: readonly KnowledgeApplicationDecision[];
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_application_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Knowledge Application Profile
// ---------------------------------------------------------------------------

export interface KnowledgeApplicationProfile {
  readonly applicationId: string;
  readonly conceptId: string;
  readonly title: string;
  readonly applicationType: ApplicationType;
  readonly applicationObjective: ApplicationObjective;
  readonly applicationDomain: ApplicationDomain;
  readonly industrySector: string;
  readonly deploymentContext: string;
  readonly implementationScope: string;
  readonly visibility: ApplicationVisibility;
  readonly status: ApplicationStatus;
  readonly governance: ApplicationGovernance;
  readonly tags: readonly string[];
  readonly provenance: KnowledgeApplicationProvenance;
}

// ---------------------------------------------------------------------------
// Knowledge Application Relationship
// ---------------------------------------------------------------------------

export interface KnowledgeApplicationRelationship {
  readonly relationshipId: string;
  readonly sourceApplicationId: string;
  readonly targetApplicationId: string;
  readonly relationshipType: 'prerequisite' | 'extension' | 'alternative' | 'complement';
  readonly description: string;
  readonly provenance: KnowledgeApplicationProvenance;
}

// ---------------------------------------------------------------------------
// Knowledge Application Registry Metadata
// ---------------------------------------------------------------------------

export interface KnowledgeApplicationRegistryMetadata {
  readonly registryId: string;
  readonly applicationCount: number;
  readonly relationshipCount: number;
  readonly conceptCount: number;
  readonly domainCount: number;
}

// ---------------------------------------------------------------------------
// Knowledge Application Registry
// ---------------------------------------------------------------------------

export interface KnowledgeApplicationRegistry {
  readonly registryId: string;
  readonly profiles: readonly KnowledgeApplicationProfile[];
  readonly relationships: readonly KnowledgeApplicationRelationship[];
  readonly metadata: KnowledgeApplicationRegistryMetadata;
  readonly trace: KnowledgeApplicationTrace;
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_application_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Knowledge Application Input
// ---------------------------------------------------------------------------

export interface KnowledgeApplicationInput {
  readonly profiles: readonly KnowledgeApplicationProfile[];
  readonly relationships: readonly KnowledgeApplicationRelationship[];
}

// ---------------------------------------------------------------------------
// Knowledge Artifact With Applications
// ---------------------------------------------------------------------------

export interface KnowledgeArtifactWithApplications {
  readonly conceptId: string;
  readonly conceptTitle: string;
  readonly profiles: readonly KnowledgeApplicationProfile[];
  readonly relationships: readonly KnowledgeApplicationRelationship[];
  readonly provenance: KnowledgeApplicationProvenance;
}

// ---------------------------------------------------------------------------
// Knowledge Application Validation Error
// ---------------------------------------------------------------------------

export interface KnowledgeApplicationValidationError {
  readonly code: string;
  readonly message: string;
  readonly field?: string;
  readonly applicationId?: string;
}

// ---------------------------------------------------------------------------
// Knowledge Application Validation Result
// ---------------------------------------------------------------------------

export interface KnowledgeApplicationValidationResult {
  readonly valid: boolean;
  readonly errors: readonly KnowledgeApplicationValidationError[];
}

// ---------------------------------------------------------------------------
// Knowledge Application Registry Validation Result
// ---------------------------------------------------------------------------

export interface KnowledgeApplicationRegistryValidationResult {
  readonly valid: boolean;
  readonly errors: readonly KnowledgeApplicationValidationError[];
  readonly checkedAt: 'knowledge_application_registry_composition';
}

// ---------------------------------------------------------------------------
// Knowledge Application Input Validation Result
// ---------------------------------------------------------------------------

export interface KnowledgeApplicationInputValidationResult {
  readonly valid: boolean;
  readonly errors: readonly KnowledgeApplicationValidationError[];
  readonly checkedAt: 'knowledge_application_input_composition';
}

// ---------------------------------------------------------------------------
// Knowledge Application Trace Validation Result
// ---------------------------------------------------------------------------

export interface KnowledgeApplicationTraceValidationResult {
  readonly valid: boolean;
  readonly errors: readonly KnowledgeApplicationValidationError[];
  readonly checkedAt: 'knowledge_application_trace_composition';
}

// ---------------------------------------------------------------------------
// Knowledge Artifact With Applications Validation Result
// ---------------------------------------------------------------------------

export interface KnowledgeArtifactWithApplicationsValidationResult {
  readonly valid: boolean;
  readonly errors: readonly KnowledgeApplicationValidationError[];
  readonly checkedAt: 'knowledge_artifact_with_applications_composition';
}

// ============================================================================
// D10-OPT-12 — Assessment Metadata
// ============================================================================

// ---------------------------------------------------------------------------
// Canonical Assessment Types (fixed, exactly 10)
// ---------------------------------------------------------------------------

export const CANONICAL_ASSESSMENT_TYPES = [
  'concept_check',
  'multiple_choice',
  'short_answer',
  'worked_problem',
  'proof',
  'implementation_task',
  'project',
  'laboratory_assessment',
  'oral_assessment',
  'capstone',
] as const;

export type AssessmentType = (typeof CANONICAL_ASSESSMENT_TYPES)[number];

// ---------------------------------------------------------------------------
// Canonical Assessment Objectives (fixed, exactly 10)
// ---------------------------------------------------------------------------

export const CANONICAL_ASSESSMENT_OBJECTIVES = [
  'introduce',
  'reinforce',
  'verify',
  'apply',
  'analyze',
  'integrate',
  'evaluate',
  'master',
  'review',
  'reference',
] as const;

export type AssessmentObjective = (typeof CANONICAL_ASSESSMENT_OBJECTIVES)[number];

// ---------------------------------------------------------------------------
// Canonical Assessment Difficulty (fixed, exactly 10)
// ---------------------------------------------------------------------------

export const CANONICAL_ASSESSMENT_DIFFICULTY = [
  'minimal',
  'easy',
  'standard',
  'intermediate',
  'advanced',
  'expert',
  'engineering',
  'research',
  'reference',
  'canonical',
] as const;

export type AssessmentDifficulty = (typeof CANONICAL_ASSESSMENT_DIFFICULTY)[number];

// ---------------------------------------------------------------------------
// Canonical Assessment Status (fixed, exactly 6)
// ---------------------------------------------------------------------------

export const CANONICAL_ASSESSMENT_STATUS = [
  'draft',
  'review',
  'approved',
  'canonical',
  'deprecated',
  'archived',
] as const;

export type AssessmentStatus = (typeof CANONICAL_ASSESSMENT_STATUS)[number];

// ---------------------------------------------------------------------------
// Canonical Assessment Visibility (fixed, exactly 10)
// ---------------------------------------------------------------------------

export const CANONICAL_ASSESSMENT_VISIBILITY = [
  'always',
  'default',
  'advanced',
  'expert',
  'curriculum',
  'assessment',
  'laboratory',
  'research',
  'internal',
  'hidden',
] as const;

export type AssessmentVisibility = (typeof CANONICAL_ASSESSMENT_VISIBILITY)[number];

// ---------------------------------------------------------------------------
// Canonical Assessment Governance (fixed, exactly 10)
// ---------------------------------------------------------------------------

export const CANONICAL_ASSESSMENT_GOVERNANCE = [
  'canonical',
  'accepted',
  'provisional',
  'experimental',
  'deprecated',
  'restricted',
  'internal',
  'public',
  'community',
  'archived',
] as const;

export type AssessmentGovernance = (typeof CANONICAL_ASSESSMENT_GOVERNANCE)[number];

// ---------------------------------------------------------------------------
// Knowledge Assessment Provenance
// ---------------------------------------------------------------------------

export interface KnowledgeAssessmentProvenance {
  readonly source: string;
  readonly provider: string;
  readonly rationale: string;
  readonly governance: AssessmentGovernance;
}

// ---------------------------------------------------------------------------
// Knowledge Assessment Decision
// ---------------------------------------------------------------------------

export interface KnowledgeAssessmentDecision {
  readonly decisionId: string;
  readonly assessmentId: string;
  readonly conceptId: string;
  readonly validationPassed: boolean;
  readonly validationErrors: readonly string[];
}

// ---------------------------------------------------------------------------
// Knowledge Assessment Trace
// ---------------------------------------------------------------------------

export interface KnowledgeAssessmentTrace {
  readonly traceId: string;
  readonly decisionCount: number;
  readonly validationCount: number;
  readonly registryVersion: string;
  readonly compositionVersion: string;
  readonly decisions: readonly KnowledgeAssessmentDecision[];
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_assessment_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Knowledge Assessment Profile
// ---------------------------------------------------------------------------

export interface KnowledgeAssessmentProfile {
  readonly assessmentId: string;
  readonly conceptId: string;
  readonly title: string;
  readonly assessmentType: AssessmentType;
  readonly objective: AssessmentObjective;
  readonly difficulty: AssessmentDifficulty;
  readonly visibility: AssessmentVisibility;
  readonly status: AssessmentStatus;
  readonly governance: AssessmentGovernance;
  readonly estimatedDuration: number;
  readonly competencyReferences: readonly string[];
  readonly tags: readonly string[];
  readonly provenance: KnowledgeAssessmentProvenance;
}

// ---------------------------------------------------------------------------
// Knowledge Assessment Relationship
// ---------------------------------------------------------------------------

export interface KnowledgeAssessmentRelationship {
  readonly relationshipId: string;
  readonly sourceAssessmentId: string;
  readonly targetAssessmentId: string;
  readonly relationshipType: 'prerequisite' | 'extension' | 'alternative' | 'complement';
  readonly description: string;
  readonly provenance: KnowledgeAssessmentProvenance;
}

// ---------------------------------------------------------------------------
// Knowledge Assessment Registry Metadata
// ---------------------------------------------------------------------------

export interface KnowledgeAssessmentRegistryMetadata {
  readonly registryId: string;
  readonly assessmentCount: number;
  readonly relationshipCount: number;
  readonly conceptCount: number;
  readonly typeCount: number;
}

// ---------------------------------------------------------------------------
// Knowledge Assessment Registry
// ---------------------------------------------------------------------------

export interface KnowledgeAssessmentRegistry {
  readonly registryId: string;
  readonly profiles: readonly KnowledgeAssessmentProfile[];
  readonly relationships: readonly KnowledgeAssessmentRelationship[];
  readonly metadata: KnowledgeAssessmentRegistryMetadata;
  readonly trace: KnowledgeAssessmentTrace;
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_assessment_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Knowledge Assessment Input
// ---------------------------------------------------------------------------

export interface KnowledgeAssessmentInput {
  readonly profiles: readonly KnowledgeAssessmentProfile[];
  readonly relationships: readonly KnowledgeAssessmentRelationship[];
}

// ---------------------------------------------------------------------------
// Knowledge Artifact With Assessments
// ---------------------------------------------------------------------------

export interface KnowledgeArtifactWithAssessments {
  readonly conceptId: string;
  readonly conceptTitle: string;
  readonly profiles: readonly KnowledgeAssessmentProfile[];
  readonly relationships: readonly KnowledgeAssessmentRelationship[];
  readonly provenance: KnowledgeAssessmentProvenance;
}

// ---------------------------------------------------------------------------
// Knowledge Assessment Validation Error
// ---------------------------------------------------------------------------

export interface KnowledgeAssessmentValidationError {
  readonly code: string;
  readonly message: string;
  readonly field?: string;
  readonly assessmentId?: string;
}

// ---------------------------------------------------------------------------
// Knowledge Assessment Validation Result
// ---------------------------------------------------------------------------

export interface KnowledgeAssessmentValidationResult {
  readonly valid: boolean;
  readonly errors: readonly KnowledgeAssessmentValidationError[];
}

// ---------------------------------------------------------------------------
// Knowledge Assessment Registry Validation Result
// ---------------------------------------------------------------------------

export interface KnowledgeAssessmentRegistryValidationResult {
  readonly valid: boolean;
  readonly errors: readonly KnowledgeAssessmentValidationError[];
  readonly checkedAt: 'knowledge_assessment_registry_composition';
}

// ---------------------------------------------------------------------------
// Knowledge Assessment Input Validation Result
// ---------------------------------------------------------------------------

export interface KnowledgeAssessmentInputValidationResult {
  readonly valid: boolean;
  readonly errors: readonly KnowledgeAssessmentValidationError[];
  readonly checkedAt: 'knowledge_assessment_input_composition';
}

// ---------------------------------------------------------------------------
// Knowledge Assessment Trace Validation Result
// ---------------------------------------------------------------------------

export interface KnowledgeAssessmentTraceValidationResult {
  readonly valid: boolean;
  readonly errors: readonly KnowledgeAssessmentValidationError[];
  readonly checkedAt: 'knowledge_assessment_trace_composition';
}

// ---------------------------------------------------------------------------
// Knowledge Artifact With Assessments Validation Result
// ---------------------------------------------------------------------------

export interface KnowledgeArtifactWithAssessmentsValidationResult {
  readonly valid: boolean;
  readonly errors: readonly KnowledgeAssessmentValidationError[];
  readonly checkedAt: 'knowledge_artifact_with_assessments_composition';
}

// ============================================================================
// D10-OPT-13 — Misconception Registry
// ============================================================================

// ---------------------------------------------------------------------------
// Canonical Misconception Types (fixed, exactly 10)
// ---------------------------------------------------------------------------

export const CANONICAL_MISCONCEPTION_TYPES = [
  'conceptual',
  'terminology',
  'mathematical',
  'algorithmic',
  'implementation',
  'engineering',
  'causal',
  'historical',
  'procedural',
  'interpretation',
] as const;

export type MisconceptionType = (typeof CANONICAL_MISCONCEPTION_TYPES)[number];

// ---------------------------------------------------------------------------
// Canonical Misconception Severity (fixed, exactly 10)
// ---------------------------------------------------------------------------

export const CANONICAL_MISCONCEPTION_SEVERITY = [
  'minimal',
  'low',
  'moderate',
  'significant',
  'high',
  'critical',
  'engineering',
  'research',
  'canonical',
  'fundamental',
] as const;

export type MisconceptionSeverity = (typeof CANONICAL_MISCONCEPTION_SEVERITY)[number];

// ---------------------------------------------------------------------------
// Canonical Corrective Strategies (fixed, exactly 10)
// ---------------------------------------------------------------------------

export const CANONICAL_CORRECTIVE_STRATEGIES = [
  'clarification',
  'counterexample',
  'comparison',
  'worked_example',
  'visualization',
  'mathematical_derivation',
  'implementation_walkthrough',
  'historical_context',
  'guided_reasoning',
  'reference',
] as const;

export type CorrectiveStrategy = (typeof CANONICAL_CORRECTIVE_STRATEGIES)[number];

// ---------------------------------------------------------------------------
// Canonical Misconception Status (fixed, exactly 6)
// ---------------------------------------------------------------------------

export const CANONICAL_MISCONCEPTION_STATUS = [
  'draft',
  'review',
  'approved',
  'canonical',
  'deprecated',
  'archived',
] as const;

export type MisconceptionStatus = (typeof CANONICAL_MISCONCEPTION_STATUS)[number];

// ---------------------------------------------------------------------------
// Canonical Misconception Visibility (fixed, exactly 10)
// ---------------------------------------------------------------------------

export const CANONICAL_MISCONCEPTION_VISIBILITY = [
  'always',
  'default',
  'advanced',
  'expert',
  'curriculum',
  'assessment',
  'laboratory',
  'research',
  'internal',
  'hidden',
] as const;

export type MisconceptionVisibility = (typeof CANONICAL_MISCONCEPTION_VISIBILITY)[number];

// ---------------------------------------------------------------------------
// Canonical Misconception Governance (fixed, exactly 10)
// ---------------------------------------------------------------------------

export const CANONICAL_MISCONCEPTION_GOVERNANCE = [
  'canonical',
  'accepted',
  'provisional',
  'experimental',
  'deprecated',
  'restricted',
  'internal',
  'public',
  'community',
  'archived',
] as const;

export type MisconceptionGovernance = (typeof CANONICAL_MISCONCEPTION_GOVERNANCE)[number];

// ---------------------------------------------------------------------------
// Knowledge Misconception Provenance
// ---------------------------------------------------------------------------

export interface KnowledgeMisconceptionProvenance {
  readonly source: string;
  readonly provider: string;
  readonly rationale: string;
  readonly governance: MisconceptionGovernance;
}

// ---------------------------------------------------------------------------
// Knowledge Misconception Decision
// ---------------------------------------------------------------------------

export interface KnowledgeMisconceptionDecision {
  readonly decisionId: string;
  readonly misconceptionId: string;
  readonly conceptId: string;
  readonly validationPassed: boolean;
  readonly validationErrors: readonly string[];
}

// ---------------------------------------------------------------------------
// Knowledge Misconception Trace
// ---------------------------------------------------------------------------

export interface KnowledgeMisconceptionTrace {
  readonly traceId: string;
  readonly decisionCount: number;
  readonly validationCount: number;
  readonly registryVersion: string;
  readonly compositionVersion: string;
  readonly decisions: readonly KnowledgeMisconceptionDecision[];
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_misconception_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Knowledge Misconception Profile
// ---------------------------------------------------------------------------

export interface KnowledgeMisconceptionProfile {
  readonly misconceptionId: string;
  readonly conceptId: string;
  readonly title: string;
  readonly misconceptionType: MisconceptionType;
  readonly severity: MisconceptionSeverity;
  readonly correctiveStrategy: CorrectiveStrategy;
  readonly visibility: MisconceptionVisibility;
  readonly status: MisconceptionStatus;
  readonly governance: MisconceptionGovernance;
  readonly description: string;
  readonly commonCause: string;
  readonly references: readonly string[];
  readonly tags: readonly string[];
  readonly provenance: KnowledgeMisconceptionProvenance;
}

// ---------------------------------------------------------------------------
// Knowledge Misconception Relationship
// ---------------------------------------------------------------------------

export interface KnowledgeMisconceptionRelationship {
  readonly relationshipId: string;
  readonly sourceMisconceptionId: string;
  readonly targetMisconceptionId: string;
  readonly relationshipType: 'prerequisite' | 'extension' | 'alternative' | 'complement';
  readonly description: string;
  readonly provenance: KnowledgeMisconceptionProvenance;
}

// ---------------------------------------------------------------------------
// Knowledge Misconception Registry Metadata
// ---------------------------------------------------------------------------

export interface KnowledgeMisconceptionRegistryMetadata {
  readonly registryId: string;
  readonly misconceptionCount: number;
  readonly relationshipCount: number;
  readonly conceptCount: number;
  readonly typeCount: number;
}

// ---------------------------------------------------------------------------
// Knowledge Misconception Registry
// ---------------------------------------------------------------------------

export interface KnowledgeMisconceptionRegistry {
  readonly registryId: string;
  readonly profiles: readonly KnowledgeMisconceptionProfile[];
  readonly relationships: readonly KnowledgeMisconceptionRelationship[];
  readonly metadata: KnowledgeMisconceptionRegistryMetadata;
  readonly trace: KnowledgeMisconceptionTrace;
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_misconception_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Knowledge Misconception Input
// ---------------------------------------------------------------------------

export interface KnowledgeMisconceptionInput {
  readonly profiles: readonly KnowledgeMisconceptionProfile[];
  readonly relationships: readonly KnowledgeMisconceptionRelationship[];
}

// ---------------------------------------------------------------------------
// Knowledge Artifact With Misconceptions
// ---------------------------------------------------------------------------

export interface KnowledgeArtifactWithMisconceptions {
  readonly conceptId: string;
  readonly conceptTitle: string;
  readonly profiles: readonly KnowledgeMisconceptionProfile[];
  readonly relationships: readonly KnowledgeMisconceptionRelationship[];
  readonly provenance: KnowledgeMisconceptionProvenance;
}

// ---------------------------------------------------------------------------
// Knowledge Misconception Validation Error
// ---------------------------------------------------------------------------

export interface KnowledgeMisconceptionValidationError {
  readonly code: string;
  readonly message: string;
  readonly field?: string;
  readonly misconceptionId?: string;
}

// ---------------------------------------------------------------------------
// Knowledge Misconception Validation Result
// ---------------------------------------------------------------------------

export interface KnowledgeMisconceptionValidationResult {
  readonly valid: boolean;
  readonly errors: readonly KnowledgeMisconceptionValidationError[];
}

// ---------------------------------------------------------------------------
// Knowledge Misconception Registry Validation Result
// ---------------------------------------------------------------------------

export interface KnowledgeMisconceptionRegistryValidationResult {
  readonly valid: boolean;
  readonly errors: readonly KnowledgeMisconceptionValidationError[];
  readonly checkedAt: 'knowledge_misconception_registry_composition';
}

// ---------------------------------------------------------------------------
// Knowledge Misconception Input Validation Result
// ---------------------------------------------------------------------------

export interface KnowledgeMisconceptionInputValidationResult {
  readonly valid: boolean;
  readonly errors: readonly KnowledgeMisconceptionValidationError[];
  readonly checkedAt: 'knowledge_misconception_input_composition';
}

// ---------------------------------------------------------------------------
// Knowledge Misconception Trace Validation Result
// ---------------------------------------------------------------------------

export interface KnowledgeMisconceptionTraceValidationResult {
  readonly valid: boolean;
  readonly errors: readonly KnowledgeMisconceptionValidationError[];
  readonly checkedAt: 'knowledge_misconception_trace_composition';
}

// ---------------------------------------------------------------------------
// Knowledge Artifact With Misconceptions Validation Result
// ---------------------------------------------------------------------------

export interface KnowledgeArtifactWithMisconceptionsValidationResult {
  readonly valid: boolean;
  readonly errors: readonly KnowledgeMisconceptionValidationError[];
  readonly checkedAt: 'knowledge_artifact_with_misconceptions_composition';
}

// ============================================================================
// D10-OPT-14 — Semantic Connectivity
// ============================================================================

// ---------------------------------------------------------------------------
// Canonical Connectivity Types (fixed, exactly 10)
// ---------------------------------------------------------------------------

export const CANONICAL_CONNECTIVITY_TYPES = [
  'prerequisite',
  'depends_on',
  'extends',
  'specializes',
  'generalizes',
  'related_to',
  'contrasts_with',
  'supports',
  'derived_from',
  'equivalent_to',
] as const;

export type ConnectivityType = (typeof CANONICAL_CONNECTIVITY_TYPES)[number];

// ---------------------------------------------------------------------------
// Canonical Relationship Strength (fixed, exactly 5)
// General Knowledge Relationship scale (RelationshipKernel — D5-OPT-03)
// ---------------------------------------------------------------------------

export const CANONICAL_RELATIONSHIP_STRENGTH = [
  'weak',
  'moderate',
  'strong',
  'critical',
  'canonical',
] as const;

export type RelationshipStrength = (typeof CANONICAL_RELATIONSHIP_STRENGTH)[number];

// ---------------------------------------------------------------------------
// Canonical Connectivity Strength (fixed, exactly 10)
// Semantic Connectivity scale (KnowledgeConnectivityKernel — D10-OPT-14)
// ---------------------------------------------------------------------------

export const CANONICAL_CONNECTIVITY_STRENGTH = [
  'minimal',
  'weak',
  'moderate',
  'strong',
  'very_strong',
  'fundamental',
  'engineering',
  'research',
  'canonical',
  'mandatory',
] as const;

export type ConnectivityStrength = (typeof CANONICAL_CONNECTIVITY_STRENGTH)[number];

// ---------------------------------------------------------------------------
// Canonical Connectivity Scope (fixed, exactly 10)
// ---------------------------------------------------------------------------

export const CANONICAL_CONNECTIVITY_SCOPE = [
  'local',
  'module',
  'domain',
  'discipline',
  'cross_domain',
  'curriculum',
  'research',
  'engineering',
  'global',
  'canonical',
] as const;

export type ConnectivityScope = (typeof CANONICAL_CONNECTIVITY_SCOPE)[number];

// ---------------------------------------------------------------------------
// Canonical Connectivity Status (fixed, exactly 6)
// ---------------------------------------------------------------------------

export const CANONICAL_CONNECTIVITY_STATUS = [
  'draft',
  'review',
  'approved',
  'canonical',
  'deprecated',
  'archived',
] as const;

export type ConnectivityStatus = (typeof CANONICAL_CONNECTIVITY_STATUS)[number];

// ---------------------------------------------------------------------------
// Canonical Connectivity Visibility (fixed, exactly 10)
// ---------------------------------------------------------------------------

export const CANONICAL_CONNECTIVITY_VISIBILITY = [
  'always',
  'default',
  'advanced',
  'expert',
  'curriculum',
  'assessment',
  'laboratory',
  'research',
  'internal',
  'hidden',
] as const;

export type ConnectivityVisibility = (typeof CANONICAL_CONNECTIVITY_VISIBILITY)[number];

// ---------------------------------------------------------------------------
// Canonical Connectivity Governance (fixed, exactly 10)
// ---------------------------------------------------------------------------

export const CANONICAL_CONNECTIVITY_GOVERNANCE = [
  'canonical',
  'accepted',
  'provisional',
  'experimental',
  'deprecated',
  'restricted',
  'internal',
  'public',
  'community',
  'archived',
] as const;

export type ConnectivityGovernance = (typeof CANONICAL_CONNECTIVITY_GOVERNANCE)[number];

// ---------------------------------------------------------------------------
// Knowledge Connectivity Provenance
// ---------------------------------------------------------------------------

export interface KnowledgeConnectivityProvenance {
  readonly source: string;
  readonly provider: string;
  readonly rationale: string;
  readonly governance: ConnectivityGovernance;
}

// ---------------------------------------------------------------------------
// Knowledge Connectivity Decision
// ---------------------------------------------------------------------------

export interface KnowledgeConnectivityDecision {
  readonly decisionId: string;
  readonly relationshipId: string;
  readonly sourceConceptId: string;
  readonly targetConceptId: string;
  readonly validationPassed: boolean;
  readonly validationErrors: readonly string[];
}

// ---------------------------------------------------------------------------
// Knowledge Connectivity Trace
// ---------------------------------------------------------------------------

export interface KnowledgeConnectivityTrace {
  readonly traceId: string;
  readonly decisionCount: number;
  readonly validationCount: number;
  readonly registryVersion: string;
  readonly compositionVersion: string;
  readonly decisions: readonly KnowledgeConnectivityDecision[];
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_connectivity_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Knowledge Connectivity Profile
// ---------------------------------------------------------------------------

export interface KnowledgeConnectivityProfile {
  readonly relationshipId: string;
  readonly sourceConceptId: string;
  readonly targetConceptId: string;
  readonly relationshipType: ConnectivityType;
  readonly relationshipStrength: ConnectivityStrength;
  readonly scope: ConnectivityScope;
  readonly visibility: ConnectivityVisibility;
  readonly status: ConnectivityStatus;
  readonly governance: ConnectivityGovernance;
  readonly description: string;
  readonly bidirectional: boolean;
  readonly tags: readonly string[];
  readonly provenance: KnowledgeConnectivityProvenance;
}

// ---------------------------------------------------------------------------
// Knowledge Connectivity Relationship
// ---------------------------------------------------------------------------

export interface KnowledgeConnectivityRelationship {
  readonly relationshipId: string;
  readonly sourceRelationshipId: string;
  readonly targetRelationshipId: string;
  readonly relationshipType: 'prerequisite' | 'extension' | 'alternative' | 'complement';
  readonly description: string;
  readonly provenance: KnowledgeConnectivityProvenance;
}

// ---------------------------------------------------------------------------
// Knowledge Connectivity Registry Metadata
// ---------------------------------------------------------------------------

export interface KnowledgeConnectivityRegistryMetadata {
  readonly registryId: string;
  readonly relationshipCount: number;
  readonly higherOrderRelationshipCount: number;
  readonly conceptCount: number;
  readonly typeCount: number;
}

// ---------------------------------------------------------------------------
// Knowledge Connectivity Registry
// ---------------------------------------------------------------------------

export interface KnowledgeConnectivityRegistry {
  readonly registryId: string;
  readonly profiles: readonly KnowledgeConnectivityProfile[];
  readonly relationships: readonly KnowledgeConnectivityRelationship[];
  readonly metadata: KnowledgeConnectivityRegistryMetadata;
  readonly trace: KnowledgeConnectivityTrace;
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_connectivity_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Knowledge Connectivity Input
// ---------------------------------------------------------------------------

export interface KnowledgeConnectivityInput {
  readonly profiles: readonly KnowledgeConnectivityProfile[];
  readonly relationships: readonly KnowledgeConnectivityRelationship[];
}

// ---------------------------------------------------------------------------
// Knowledge Artifact With Connectivity
// ---------------------------------------------------------------------------

export interface KnowledgeArtifactWithConnectivity {
  readonly conceptId: string;
  readonly conceptTitle: string;
  readonly profiles: readonly KnowledgeConnectivityProfile[];
  readonly relationships: readonly KnowledgeConnectivityRelationship[];
  readonly provenance: KnowledgeConnectivityProvenance;
}

// ---------------------------------------------------------------------------
// Knowledge Connectivity Validation Error
// ---------------------------------------------------------------------------

export interface KnowledgeConnectivityValidationError {
  readonly code: string;
  readonly message: string;
  readonly field?: string;
  readonly relationshipId?: string;
}

// ---------------------------------------------------------------------------
// Knowledge Connectivity Validation Result
// ---------------------------------------------------------------------------

export interface KnowledgeConnectivityValidationResult {
  readonly valid: boolean;
  readonly errors: readonly KnowledgeConnectivityValidationError[];
}

// ---------------------------------------------------------------------------
// Knowledge Connectivity Registry Validation Result
// ---------------------------------------------------------------------------

export interface KnowledgeConnectivityRegistryValidationResult {
  readonly valid: boolean;
  readonly errors: readonly KnowledgeConnectivityValidationError[];
  readonly checkedAt: 'knowledge_connectivity_registry_composition';
}

// ---------------------------------------------------------------------------
// Knowledge Connectivity Input Validation Result
// ---------------------------------------------------------------------------

export interface KnowledgeConnectivityInputValidationResult {
  readonly valid: boolean;
  readonly errors: readonly KnowledgeConnectivityValidationError[];
  readonly checkedAt: 'knowledge_connectivity_input_composition';
}

// ---------------------------------------------------------------------------
// Knowledge Connectivity Trace Validation Result
// ---------------------------------------------------------------------------

export interface KnowledgeConnectivityTraceValidationResult {
  readonly valid: boolean;
  readonly errors: readonly KnowledgeConnectivityValidationError[];
  readonly checkedAt: 'knowledge_connectivity_trace_composition';
}

// ---------------------------------------------------------------------------
// Knowledge Artifact With Connectivity Validation Result
// ---------------------------------------------------------------------------

export interface KnowledgeArtifactWithConnectivityValidationResult {
  readonly valid: boolean;
  readonly errors: readonly KnowledgeConnectivityValidationError[];
  readonly checkedAt: 'knowledge_artifact_with_connectivity_composition';
}

// ============================================================================
// D10-OPT-15 — Premium Asset Governance
// ============================================================================

// ---------------------------------------------------------------------------
// Canonical Asset Types (fixed, exactly 10)
// ---------------------------------------------------------------------------

export const CANONICAL_ASSET_TYPES = [
  'illustration',
  'diagram',
  'animation',
  'video',
  'interactive_widget',
  'pdf',
  'engineering_blueprint',
  'dataset_reference',
  'presentation',
  'external_resource',
] as const;

export type AssetType = (typeof CANONICAL_ASSET_TYPES)[number];

// ---------------------------------------------------------------------------
// Canonical Asset Purposes (fixed, exactly 10)
// ---------------------------------------------------------------------------

export const CANONICAL_ASSET_PURPOSES = [
  'introduce',
  'clarify',
  'visualize',
  'demonstrate',
  'reinforce',
  'compare',
  'explore',
  'reference',
  'engineering',
  'research',
] as const;

export type AssetPurpose = (typeof CANONICAL_ASSET_PURPOSES)[number];

// ---------------------------------------------------------------------------
// Canonical Asset Access (fixed, exactly 10)
// ---------------------------------------------------------------------------

export const CANONICAL_ASSET_ACCESS = [
  'public',
  'registered',
  'premium',
  'enterprise',
  'institutional',
  'internal',
  'restricted',
  'licensed',
  'partner',
  'archived',
] as const;

export type AssetAccess = (typeof CANONICAL_ASSET_ACCESS)[number];

// ---------------------------------------------------------------------------
// Canonical Asset Status (fixed, exactly 6)
// ---------------------------------------------------------------------------

export const CANONICAL_ASSET_STATUS = [
  'draft',
  'review',
  'approved',
  'canonical',
  'deprecated',
  'archived',
] as const;

export type AssetStatus = (typeof CANONICAL_ASSET_STATUS)[number];

// ---------------------------------------------------------------------------
// Canonical Asset Visibility (fixed, exactly 10)
// ---------------------------------------------------------------------------

export const CANONICAL_ASSET_VISIBILITY = [
  'always',
  'default',
  'advanced',
  'expert',
  'curriculum',
  'assessment',
  'laboratory',
  'research',
  'internal',
  'hidden',
] as const;

export type AssetVisibility = (typeof CANONICAL_ASSET_VISIBILITY)[number];

// ---------------------------------------------------------------------------
// Canonical Asset Governance (fixed, exactly 10)
// ---------------------------------------------------------------------------

export const CANONICAL_ASSET_GOVERNANCE = [
  'canonical',
  'accepted',
  'provisional',
  'experimental',
  'deprecated',
  'restricted',
  'internal',
  'public',
  'community',
  'archived',
] as const;

export type AssetGovernance = (typeof CANONICAL_ASSET_GOVERNANCE)[number];

// ---------------------------------------------------------------------------
// Knowledge Asset Provenance
// ---------------------------------------------------------------------------

export interface KnowledgeAssetProvenance {
  readonly source: string;
  readonly provider: string;
  readonly rationale: string;
  readonly governance: AssetGovernance;
}

// ---------------------------------------------------------------------------
// Knowledge Asset Decision
// ---------------------------------------------------------------------------

export interface KnowledgeAssetDecision {
  readonly decisionId: string;
  readonly assetId: string;
  readonly conceptId: string;
  readonly validationPassed: boolean;
  readonly validationErrors: readonly string[];
}

// ---------------------------------------------------------------------------
// Knowledge Asset Trace
// ---------------------------------------------------------------------------

export interface KnowledgeAssetTrace {
  readonly traceId: string;
  readonly decisionCount: number;
  readonly validationCount: number;
  readonly registryVersion: string;
  readonly compositionVersion: string;
  readonly decisions: readonly KnowledgeAssetDecision[];
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_asset_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Knowledge Asset Profile
// ---------------------------------------------------------------------------

export interface KnowledgeAssetProfile {
  readonly assetId: string;
  readonly conceptId: string;
  readonly title: string;
  readonly assetType: AssetType;
  readonly purpose: AssetPurpose;
  readonly accessLevel: AssetAccess;
  readonly visibility: AssetVisibility;
  readonly status: AssetStatus;
  readonly governance: AssetGovernance;
  readonly resourceReference: string;
  readonly licenseReference: string;
  readonly tags: readonly string[];
  readonly provenance: KnowledgeAssetProvenance;
}

// ---------------------------------------------------------------------------
// Knowledge Asset Relationship
// ---------------------------------------------------------------------------

export interface KnowledgeAssetRelationship {
  readonly relationshipId: string;
  readonly sourceAssetId: string;
  readonly targetAssetId: string;
  readonly relationshipType: 'prerequisite' | 'extension' | 'alternative' | 'complement';
  readonly description: string;
  readonly provenance: KnowledgeAssetProvenance;
}

// ---------------------------------------------------------------------------
// Knowledge Asset Registry Metadata
// ---------------------------------------------------------------------------

export interface KnowledgeAssetRegistryMetadata {
  readonly registryId: string;
  readonly assetCount: number;
  readonly relationshipCount: number;
  readonly conceptCount: number;
  readonly assetTypeCount: number;
}

// ---------------------------------------------------------------------------
// Knowledge Asset Registry
// ---------------------------------------------------------------------------

export interface KnowledgeAssetRegistry {
  readonly registryId: string;
  readonly profiles: readonly KnowledgeAssetProfile[];
  readonly relationships: readonly KnowledgeAssetRelationship[];
  readonly metadata: KnowledgeAssetRegistryMetadata;
  readonly trace: KnowledgeAssetTrace;
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_asset_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Knowledge Asset Input
// ---------------------------------------------------------------------------

export interface KnowledgeAssetInput {
  readonly profiles: readonly KnowledgeAssetProfile[];
  readonly relationships: readonly KnowledgeAssetRelationship[];
}

// ---------------------------------------------------------------------------
// Knowledge Artifact With Assets
// ---------------------------------------------------------------------------

export interface KnowledgeArtifactWithAssets {
  readonly conceptId: string;
  readonly conceptTitle: string;
  readonly profiles: readonly KnowledgeAssetProfile[];
  readonly relationships: readonly KnowledgeAssetRelationship[];
  readonly provenance: KnowledgeAssetProvenance;
}

// ---------------------------------------------------------------------------
// Knowledge Asset Validation Error
// ---------------------------------------------------------------------------

export interface KnowledgeAssetValidationError {
  readonly code: string;
  readonly message: string;
  readonly field?: string;
  readonly assetId?: string;
}

// ---------------------------------------------------------------------------
// Knowledge Asset Validation Result
// ---------------------------------------------------------------------------

export interface KnowledgeAssetValidationResult {
  readonly valid: boolean;
  readonly errors: readonly KnowledgeAssetValidationError[];
}

// ---------------------------------------------------------------------------
// Knowledge Asset Registry Validation Result
// ---------------------------------------------------------------------------

export interface KnowledgeAssetRegistryValidationResult {
  readonly valid: boolean;
  readonly errors: readonly KnowledgeAssetValidationError[];
  readonly checkedAt: 'knowledge_asset_registry_composition';
}

// ---------------------------------------------------------------------------
// Knowledge Asset Input Validation Result
// ---------------------------------------------------------------------------

export interface KnowledgeAssetInputValidationResult {
  readonly valid: boolean;
  readonly errors: readonly KnowledgeAssetValidationError[];
  readonly checkedAt: 'knowledge_asset_input_composition';
}

// ---------------------------------------------------------------------------
// Knowledge Asset Trace Validation Result
// ---------------------------------------------------------------------------

export interface KnowledgeAssetTraceValidationResult {
  readonly valid: boolean;
  readonly errors: readonly KnowledgeAssetValidationError[];
  readonly checkedAt: 'knowledge_asset_trace_composition';
}

// ---------------------------------------------------------------------------
// Knowledge Artifact With Assets Validation Result
// ---------------------------------------------------------------------------

export interface KnowledgeArtifactWithAssetsValidationResult {
  readonly valid: boolean;
  readonly errors: readonly KnowledgeAssetValidationError[];
  readonly checkedAt: 'knowledge_artifact_with_assets_composition';
}

// ============================================================================
// D10-OPT-16 — Continuous Governance
// ============================================================================

// ---------------------------------------------------------------------------
// Canonical Governance Stages (fixed, exactly 10)
// ---------------------------------------------------------------------------

export const CANONICAL_GOVERNANCE_STAGES = [
  'proposed',
  'draft',
  'technical_review',
  'editorial_review',
  'validation',
  'approved',
  'canonical',
  'deprecated',
  'archived',
  'superseded',
] as const;

export type GovernanceStage = (typeof CANONICAL_GOVERNANCE_STAGES)[number];

// ---------------------------------------------------------------------------
// Canonical Governance Events (fixed, exactly 10)
// ---------------------------------------------------------------------------

export const CANONICAL_GOVERNANCE_EVENTS = [
  'created',
  'updated',
  'review_requested',
  'review_completed',
  'validation_passed',
  'validation_failed',
  'approved',
  'deprecated',
  'archived',
  'restored',
] as const;

export type GovernanceEvent = (typeof CANONICAL_GOVERNANCE_EVENTS)[number];

// ---------------------------------------------------------------------------
// Canonical Review Levels (fixed, exactly 10)
// ---------------------------------------------------------------------------

export const CANONICAL_REVIEW_LEVELS = [
  'automatic',
  'editorial',
  'technical',
  'scientific',
  'engineering',
  'domain',
  'research',
  'expert',
  'committee',
  'canonical',
] as const;

export type ReviewLevel = (typeof CANONICAL_REVIEW_LEVELS)[number];

// ---------------------------------------------------------------------------
// Canonical Governance Status (fixed, exactly 6)
// ---------------------------------------------------------------------------

export const CANONICAL_GOVERNANCE_STATUS = [
  'draft',
  'review',
  'approved',
  'canonical',
  'deprecated',
  'archived',
] as const;

export type GovernanceStatus = (typeof CANONICAL_GOVERNANCE_STATUS)[number];

// ---------------------------------------------------------------------------
// Canonical Governance Visibility (fixed, exactly 10)
// ---------------------------------------------------------------------------

export const CANONICAL_GOVERNANCE_VISIBILITY = [
  'always',
  'default',
  'advanced',
  'expert',
  'curriculum',
  'assessment',
  'laboratory',
  'research',
  'internal',
  'hidden',
] as const;

export type GovernanceVisibility = (typeof CANONICAL_GOVERNANCE_VISIBILITY)[number];

// ---------------------------------------------------------------------------
// Canonical Governance Policy (fixed, exactly 10)
// ---------------------------------------------------------------------------

export const CANONICAL_GOVERNANCE_POLICY = [
  'canonical',
  'accepted',
  'provisional',
  'experimental',
  'deprecated',
  'restricted',
  'internal',
  'public',
  'community',
  'archived',
] as const;

export type GovernancePolicy = (typeof CANONICAL_GOVERNANCE_POLICY)[number];

// ---------------------------------------------------------------------------
// Knowledge Governance Provenance
// ---------------------------------------------------------------------------

export interface KnowledgeGovernanceProvenance {
  readonly source: string;
  readonly provider: string;
  readonly rationale: string;
  readonly governance: GovernancePolicy;
}

// ---------------------------------------------------------------------------
// Knowledge Governance Decision
// ---------------------------------------------------------------------------

export interface KnowledgeGovernanceDecision {
  readonly decisionId: string;
  readonly governanceId: string;
  readonly conceptId: string;
  readonly validationPassed: boolean;
  readonly validationErrors: readonly string[];
}

// ---------------------------------------------------------------------------
// Knowledge Governance Trace
// ---------------------------------------------------------------------------

export interface KnowledgeGovernanceTrace {
  readonly traceId: string;
  readonly decisionCount: number;
  readonly validationCount: number;
  readonly registryVersion: string;
  readonly compositionVersion: string;
  readonly decisions: readonly KnowledgeGovernanceDecision[];
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_governance_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Knowledge Governance Profile
// ---------------------------------------------------------------------------

export interface KnowledgeGovernanceProfile {
  readonly governanceId: string;
  readonly conceptId: string;
  readonly title: string;
  readonly governanceStage: GovernanceStage;
  readonly reviewLevel: ReviewLevel;
  readonly governanceEvent: GovernanceEvent;
  readonly visibility: GovernanceVisibility;
  readonly status: GovernanceStatus;
  readonly policy: GovernancePolicy;
  readonly reviewReference: string;
  readonly approvalReference: string;
  readonly tags: readonly string[];
  readonly provenance: KnowledgeGovernanceProvenance;
}

// ---------------------------------------------------------------------------
// Knowledge Governance Relationship
// ---------------------------------------------------------------------------

export interface KnowledgeGovernanceRelationship {
  readonly relationshipId: string;
  readonly sourceGovernanceId: string;
  readonly targetGovernanceId: string;
  readonly relationshipType: 'prerequisite' | 'extension' | 'alternative' | 'complement';
  readonly description: string;
  readonly provenance: KnowledgeGovernanceProvenance;
}

// ---------------------------------------------------------------------------
// Knowledge Governance Registry Metadata
// ---------------------------------------------------------------------------

export interface KnowledgeGovernanceRegistryMetadata {
  readonly registryId: string;
  readonly governanceCount: number;
  readonly relationshipCount: number;
  readonly conceptCount: number;
  readonly stageCount: number;
}

// ---------------------------------------------------------------------------
// Knowledge Governance Registry
// ---------------------------------------------------------------------------

export interface KnowledgeGovernanceRegistry {
  readonly registryId: string;
  readonly profiles: readonly KnowledgeGovernanceProfile[];
  readonly relationships: readonly KnowledgeGovernanceRelationship[];
  readonly metadata: KnowledgeGovernanceRegistryMetadata;
  readonly trace: KnowledgeGovernanceTrace;
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_governance_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Knowledge Governance Input
// ---------------------------------------------------------------------------

export interface KnowledgeGovernanceInput {
  readonly profiles: readonly KnowledgeGovernanceProfile[];
  readonly relationships: readonly KnowledgeGovernanceRelationship[];
}

// ---------------------------------------------------------------------------
// Knowledge Artifact With Governance
// ---------------------------------------------------------------------------

export interface KnowledgeArtifactWithGovernance {
  readonly conceptId: string;
  readonly conceptTitle: string;
  readonly profiles: readonly KnowledgeGovernanceProfile[];
  readonly relationships: readonly KnowledgeGovernanceRelationship[];
  readonly provenance: KnowledgeGovernanceProvenance;
}

// ---------------------------------------------------------------------------
// Knowledge Governance Validation Error
// ---------------------------------------------------------------------------

export interface KnowledgeGovernanceValidationError {
  readonly code: string;
  readonly message: string;
  readonly field?: string;
  readonly governanceId?: string;
}

// ---------------------------------------------------------------------------
// Knowledge Governance Validation Result
// ---------------------------------------------------------------------------

export interface KnowledgeGovernanceValidationResult {
  readonly valid: boolean;
  readonly errors: readonly KnowledgeGovernanceValidationError[];
}

// ---------------------------------------------------------------------------
// Knowledge Governance Registry Validation Result
// ---------------------------------------------------------------------------

export interface KnowledgeGovernanceRegistryValidationResult {
  readonly valid: boolean;
  readonly errors: readonly KnowledgeGovernanceValidationError[];
  readonly checkedAt: 'knowledge_governance_registry_composition';
}

// ---------------------------------------------------------------------------
// Knowledge Governance Input Validation Result
// ---------------------------------------------------------------------------

export interface KnowledgeGovernanceInputValidationResult {
  readonly valid: boolean;
  readonly errors: readonly KnowledgeGovernanceValidationError[];
  readonly checkedAt: 'knowledge_governance_input_composition';
}

// ---------------------------------------------------------------------------
// Knowledge Governance Trace Validation Result
// ---------------------------------------------------------------------------

export interface KnowledgeGovernanceTraceValidationResult {
  readonly valid: boolean;
  readonly errors: readonly KnowledgeGovernanceValidationError[];
  readonly checkedAt: 'knowledge_governance_trace_composition';
}

// ---------------------------------------------------------------------------
// Knowledge Artifact With Governance Validation Result
// ---------------------------------------------------------------------------

export interface KnowledgeArtifactWithGovernanceValidationResult {
  readonly valid: boolean;
  readonly errors: readonly KnowledgeGovernanceValidationError[];
  readonly checkedAt: 'knowledge_artifact_with_governance_composition';
}

// ============================================================================
// NV-1700-D5 Compatibility Contracts — Evidence, Coverage, Quality, Relationship, Version, Impact, Review
// ============================================================================

export type KnowledgeGovernanceStatus = GovernanceStatus;

export const CANONICAL_GOVERNANCE_STATUSES = CANONICAL_GOVERNANCE_STATUS;

export interface EvidenceProvenance { readonly source: string; readonly governanceStatus: EvidenceGovernanceStatus; readonly providedBy: string; readonly rationale: string; }
export const CANONICAL_EVIDENCE_SOURCE_TYPES = ['research_paper', 'book', 'official_documentation', 'technical_standard', 'dataset', 'course_material', 'conference', 'technical_report', 'trusted_web_resource', 'internal_reference'] as const;
export type EvidenceSourceType = (typeof CANONICAL_EVIDENCE_SOURCE_TYPES)[number];
export const CANONICAL_EVIDENCE_AUTHORITY = ['peer_reviewed', 'official', 'academic', 'industry', 'government', 'maintainer', 'community_verified', 'internal', 'legacy', 'experimental'] as const;
export type EvidenceAuthorityLevel = (typeof CANONICAL_EVIDENCE_AUTHORITY)[number];
export const CANONICAL_CITATION_TYPES = ['primary', 'secondary', 'supporting', 'background', 'reference', 'implementation', 'specification', 'comparison', 'historical', 'supplementary'] as const;
export type CitationType = (typeof CANONICAL_CITATION_TYPES)[number];
export const CANONICAL_SOURCE_STATUS = ['draft', 'review', 'approved', 'published', 'deprecated', 'archived'] as const;
export type SourceStatus = (typeof CANONICAL_SOURCE_STATUS)[number];
export const CANONICAL_EVIDENCE_GOVERNANCE_STATUSES = ['canonical', 'accepted', 'provisional', 'deprecated', 'rejected'] as const;
export type EvidenceGovernanceStatus = (typeof CANONICAL_EVIDENCE_GOVERNANCE_STATUSES)[number];
export interface EvidenceSource { readonly sourceId: string; readonly title: string; readonly sourceType: EvidenceSourceType; readonly authorityLevel: EvidenceAuthorityLevel; readonly evidenceLevel?: string; readonly status: SourceStatus; readonly canonicalIdentifier: string; readonly publisher: string; readonly authors: readonly string[]; readonly publicationYear: number; readonly urlReference: string; readonly tags: readonly string[]; readonly summary: string; readonly provenance: EvidenceProvenance; readonly verificationDate?: string; readonly governanceStatus?: string; }
export interface CitationReference { readonly citationId: string; readonly knowledgeId: string; readonly sourceId: string; readonly citationType: CitationType; readonly sectionReference: string; readonly pageReference: string; readonly confidenceLevel: number; readonly provenance: EvidenceProvenance; }
export interface EvidenceRelationship { readonly relationshipId: string; readonly knowledgeId: string; readonly sourceId: string; readonly citationId: string; readonly relationshipType: string; readonly description: string; readonly provenance: EvidenceProvenance; }
export interface EvidenceTrace { readonly traceId: string; readonly decisionCount: number; readonly validationCount: number; readonly registryVersion: string; readonly compositionVersion: string; readonly deterministic: true; readonly generatedFrom: 'deterministic_evidence_kernel'; readonly randomUsed: false; readonly timeDependency: false; }
export interface EvidenceRegistryMetadata { readonly registryId: string; readonly sourceCount: number; readonly citationCount: number; readonly relationshipCount: number; readonly sourceTypeCount: number; }
export interface EvidenceRegistry { readonly registryId: string; readonly sources: readonly EvidenceSource[]; readonly citations: readonly CitationReference[]; readonly relationships: readonly EvidenceRelationship[]; readonly metadata: EvidenceRegistryMetadata; readonly trace: EvidenceTrace; readonly deterministic: true; readonly generatedFrom: 'deterministic_evidence_kernel'; readonly randomUsed: false; readonly timeDependency: false; }
export interface EvidenceInput { readonly sources: readonly EvidenceSource[]; readonly citations: readonly CitationReference[]; readonly relationships: readonly EvidenceRelationship[]; }
export interface KnowledgeArtifactWithEvidence { readonly knowledgeId: string; readonly title: string; readonly sources: readonly EvidenceSource[]; readonly citations: readonly CitationReference[]; readonly relationships: readonly EvidenceRelationship[]; readonly provenance: EvidenceProvenance; }
export interface EvidenceValidationError { readonly id?: string; readonly code: string; readonly message: string; readonly field?: string; }
export interface EvidenceSourceValidationResult { readonly valid: boolean; readonly errors: readonly EvidenceValidationError[]; readonly checkedAt: 'evidence_source_validation'; }
export interface EvidenceCitationValidationResult { readonly valid: boolean; readonly errors: readonly EvidenceValidationError[]; readonly checkedAt: 'evidence_citation_validation'; }
export interface EvidenceRelationshipValidationResult { readonly valid: boolean; readonly errors: readonly EvidenceValidationError[]; readonly checkedAt: 'evidence_relationship_validation'; }
export interface EvidenceRegistryValidationResult { readonly valid: boolean; readonly errors: readonly EvidenceValidationError[]; readonly checkedAt: 'evidence_registry_validation' | 'evidence_registry_composition'; }
export interface EvidenceInputValidationResult { readonly valid: boolean; readonly errors: readonly EvidenceValidationError[]; readonly checkedAt: 'evidence_input_validation' | 'evidence_input_composition'; }
export interface EvidenceTraceValidationResult { readonly valid: boolean; readonly errors: readonly EvidenceValidationError[]; readonly checkedAt: 'evidence_trace_validation' | 'evidence_trace_composition'; }
export interface KnowledgeArtifactWithEvidenceValidationResult { readonly valid: boolean; readonly errors: readonly EvidenceValidationError[]; readonly checkedAt: 'knowledge_artifact_with_evidence_validation' | 'knowledge_artifact_with_evidence_composition'; }

export interface CoverageProvenance { readonly source: string; readonly governanceStatus: KnowledgeGovernanceStatus; readonly providedBy: string; readonly rationale: string; }
export const CANONICAL_COVERAGE_COMPONENT_TYPES = ['concept', 'visualization', 'laboratory', 'assessment', 'worked_example', 'real_world_application', 'misconception', 'cross_reference', 'evidence', 'summary'] as const;
export type CoverageComponentType = (typeof CANONICAL_COVERAGE_COMPONENT_TYPES)[number];
export const CANONICAL_GAP_TYPES = ['missing_visualization', 'missing_laboratory', 'missing_assessment', 'missing_reference', 'missing_example', 'missing_application', 'missing_cross_reference', 'missing_evidence', 'missing_review', 'missing_summary'] as const;
export type GapType = (typeof CANONICAL_GAP_TYPES)[number];
export const CANONICAL_COVERAGE_LEVELS = ['insufficient', 'partial', 'adequate', 'complete', 'canonical'] as const;
export type CoverageLevel = (typeof CANONICAL_COVERAGE_LEVELS)[number];
export const CANONICAL_COVERAGE_STATUS = ['draft', 'review', 'approved', 'published', 'deprecated', 'archived'] as const;
export type CoverageStatus = (typeof CANONICAL_COVERAGE_STATUS)[number];
export interface KnowledgeCoverageComponent { readonly componentId: string; readonly artifactId: string; readonly componentType: CoverageComponentType; readonly coverageLevel: CoverageLevel; readonly provenance: CoverageProvenance; }
export interface KnowledgeGap { readonly gapId: string; readonly artifactId: string; readonly gapType: GapType; readonly severity: ImpactSeverity; readonly rationale: string; readonly provenance: CoverageProvenance; }
export interface KnowledgeCoverageReport { readonly reportId: string; readonly artifactId: string; readonly components: readonly KnowledgeCoverageComponent[]; readonly gaps: readonly KnowledgeGap[]; readonly overallCoverageLevel: CoverageLevel; readonly provenance: CoverageProvenance; }
export interface KnowledgeCoverageTrace { readonly traceId: string; readonly decisionCount: number; readonly validationCount: number; readonly registryVersion: string; readonly compositionVersion: string; readonly compositionMetadata: string; readonly deterministicMetadata: string; readonly deterministic: true; readonly generatedFrom: 'deterministic_coverage_kernel'; readonly randomUsed: false; readonly timeDependency: false; }
export interface KnowledgeCoverageRegistryMetadata { readonly registryId: string; readonly reportCount: number; readonly componentCount: number; readonly gapCount: number; readonly componentTypeCount: number; }
export interface KnowledgeCoverageRegistry { readonly registryId: string; readonly reports: readonly KnowledgeCoverageReport[]; readonly components: readonly KnowledgeCoverageComponent[]; readonly gaps: readonly KnowledgeGap[]; readonly metadata: KnowledgeCoverageRegistryMetadata; readonly trace: KnowledgeCoverageTrace; readonly deterministic: true; readonly generatedFrom: 'deterministic_coverage_kernel'; readonly randomUsed: false; readonly timeDependency: false; }
export interface KnowledgeCoverageInput { readonly reports: readonly KnowledgeCoverageReport[]; readonly components: readonly KnowledgeCoverageComponent[]; readonly gaps: readonly KnowledgeGap[]; }
export interface KnowledgeArtifactWithCoverage { readonly knowledgeId: string; readonly title: string; readonly reports: readonly KnowledgeCoverageReport[]; readonly components: readonly KnowledgeCoverageComponent[]; readonly gaps: readonly KnowledgeGap[]; readonly provenance: CoverageProvenance; }
export interface KnowledgeCoverageValidationError { readonly id?: string; readonly code: string; readonly message: string; readonly field?: string; }
export interface KnowledgeCoverageComponentValidationResult { readonly valid: boolean; readonly errors: readonly KnowledgeCoverageValidationError[]; readonly checkedAt: 'knowledge_coverage_component_validation'; }
export interface KnowledgeGapValidationResult { readonly valid: boolean; readonly errors: readonly KnowledgeCoverageValidationError[]; readonly checkedAt: 'knowledge_gap_validation'; }
export interface KnowledgeCoverageReportValidationResult { readonly valid: boolean; readonly errors: readonly KnowledgeCoverageValidationError[]; readonly checkedAt: 'knowledge_coverage_report_validation'; }
export interface KnowledgeCoverageRegistryValidationResult { readonly valid: boolean; readonly errors: readonly KnowledgeCoverageValidationError[]; readonly checkedAt: 'knowledge_coverage_registry_validation' | 'knowledge_coverage_registry_composition'; }
export interface KnowledgeCoverageInputValidationResult { readonly valid: boolean; readonly errors: readonly KnowledgeCoverageValidationError[]; readonly checkedAt: 'knowledge_coverage_input_validation' | 'knowledge_coverage_input_composition'; }
export interface KnowledgeCoverageTraceValidationResult { readonly valid: boolean; readonly errors: readonly KnowledgeCoverageValidationError[]; readonly checkedAt: 'knowledge_coverage_trace_validation' | 'knowledge_coverage_trace_composition'; }
export interface KnowledgeArtifactWithCoverageValidationResult { readonly valid: boolean; readonly errors: readonly KnowledgeCoverageValidationError[]; readonly checkedAt: 'knowledge_artifact_with_coverage_validation' | 'knowledge_artifact_with_coverage_composition'; }

export interface QualityProvenance { readonly source: string; readonly governanceStatus: KnowledgeGovernanceStatus; readonly providedBy: string; readonly rationale: string; }
export const CANONICAL_QUALITY_DIMENSIONS = ['conceptual_completeness', 'mathematical_rigor', 'implementation_coverage', 'practical_applications', 'visual_support', 'laboratory_support', 'misconception_coverage', 'assessment_availability', 'source_quality', 'review_freshness'] as const;
export type QualityDimensionType = (typeof CANONICAL_QUALITY_DIMENSIONS)[number];
export const CANONICAL_QUALITY_LEVELS = ['insufficient', 'basic', 'good', 'excellent', 'canonical'] as const;
export type QualityLevel = (typeof CANONICAL_QUALITY_LEVELS)[number];
export const CANONICAL_QUALITY_FINDINGS = ['missing_visualization', 'missing_laboratory', 'missing_assessment', 'missing_sources', 'missing_review', 'missing_examples', 'missing_cross_reference', 'missing_history', 'missing_practical_context', 'missing_validation'] as const;
export type QualityFindingType = (typeof CANONICAL_QUALITY_FINDINGS)[number];
export const CANONICAL_QUALITY_STATUS = ['draft', 'review', 'approved', 'published', 'deprecated', 'archived'] as const;
export type QualityStatus = (typeof CANONICAL_QUALITY_STATUS)[number];
export interface EditorialQualityDimension { readonly dimensionId: string; readonly dimensionType: QualityDimensionType; readonly qualityLevel: QualityLevel; readonly score: number; readonly rationale: string; readonly provenance: QualityProvenance; }
export interface EditorialQualityFinding { readonly findingId: string; readonly findingType: QualityFindingType; readonly severity: ImpactSeverity; readonly description: string; readonly affectedArtifactId: string; readonly provenance: QualityProvenance; }
export interface EditorialQualityReport { readonly reportId: string; readonly artifactId: string; readonly dimensions: readonly EditorialQualityDimension[]; readonly findings: readonly EditorialQualityFinding[]; readonly overallScore: number; readonly qualityLevel: QualityLevel; readonly summary: string; readonly provenance: QualityProvenance; }
export interface EditorialQualityTrace { readonly traceId: string; readonly decisionCount: number; readonly validationCount: number; readonly registryVersion: string; readonly compositionVersion: string; readonly compositionMetadata: string; readonly deterministicMetadata: string; readonly deterministic: true; readonly generatedFrom: 'deterministic_quality_kernel'; readonly randomUsed: false; readonly timeDependency: false; }
export interface EditorialQualityRegistryMetadata { readonly registryId: string; readonly reportCount: number; readonly dimensionCount: number; readonly findingCount: number; readonly dimensionTypeCount: number; }
export interface EditorialQualityRegistry { readonly registryId: string; readonly reports: readonly EditorialQualityReport[]; readonly dimensions: readonly EditorialQualityDimension[]; readonly findings: readonly EditorialQualityFinding[]; readonly metadata: EditorialQualityRegistryMetadata; readonly trace: EditorialQualityTrace; readonly deterministic: true; readonly generatedFrom: 'deterministic_quality_kernel'; readonly randomUsed: false; readonly timeDependency: false; }
export interface EditorialQualityInput { readonly reports: readonly EditorialQualityReport[]; readonly dimensions: readonly EditorialQualityDimension[]; readonly findings: readonly EditorialQualityFinding[]; }
export interface KnowledgeArtifactWithEditorialQuality { readonly knowledgeId: string; readonly title: string; readonly reports: readonly EditorialQualityReport[]; readonly dimensions: readonly EditorialQualityDimension[]; readonly findings: readonly EditorialQualityFinding[]; readonly provenance: QualityProvenance; }
export interface EditorialQualityValidationError { readonly id?: string; readonly code: string; readonly message: string; readonly field?: string; }
export interface EditorialQualityDimensionValidationResult { readonly valid: boolean; readonly errors: readonly EditorialQualityValidationError[]; readonly checkedAt: 'editorial_quality_dimension_validation'; }
export interface EditorialQualityFindingValidationResult { readonly valid: boolean; readonly errors: readonly EditorialQualityValidationError[]; readonly checkedAt: 'editorial_quality_finding_validation'; }
export interface EditorialQualityReportValidationResult { readonly valid: boolean; readonly errors: readonly EditorialQualityValidationError[]; readonly checkedAt: 'editorial_quality_report_validation'; }
export interface EditorialQualityRegistryValidationResult { readonly valid: boolean; readonly errors: readonly EditorialQualityValidationError[]; readonly checkedAt: 'editorial_quality_registry_validation' | 'editorial_quality_registry_composition'; }
export interface EditorialQualityInputValidationResult { readonly valid: boolean; readonly errors: readonly EditorialQualityValidationError[]; readonly checkedAt: 'editorial_quality_input_validation' | 'editorial_quality_input_composition'; }
export interface EditorialQualityTraceValidationResult { readonly valid: boolean; readonly errors: readonly EditorialQualityValidationError[]; readonly checkedAt: 'editorial_quality_trace_validation' | 'editorial_quality_trace_composition'; }
export interface KnowledgeArtifactWithEditorialQualityValidationResult { readonly valid: boolean; readonly errors: readonly EditorialQualityValidationError[]; readonly checkedAt: 'knowledge_artifact_with_editorial_quality_validation' | 'knowledge_artifact_with_editorial_quality_composition'; }

export interface RelationshipProvenance {
  readonly source: string;
  readonly governanceStatus: KnowledgeGovernanceStatus;
  readonly providedBy: string;
  readonly rationale: string;
}

export const CANONICAL_KNOWLEDGE_RELATIONSHIP_TYPES = [
  'references',
  'extends',
  'implements',
  'depends_on',
  'related_to',
  'visualizes',
  'demonstrates',
  'documents',
  'supports',
  'prerequisite_for',
] as const;

export type KnowledgeRelationshipType = (typeof CANONICAL_KNOWLEDGE_RELATIONSHIP_TYPES)[number];

export const CANONICAL_CROSS_REFERENCE_TYPES = [
  'internal_link',
  'external_reference',
  'curriculum_reference',
  'laboratory_reference',
  'visualization_reference',
  'assessment_reference',
  'documentation_reference',
  'research_reference',
  'glossary_reference',
  'related_topic',
] as const;

export type CrossReferenceType = (typeof CANONICAL_CROSS_REFERENCE_TYPES)[number];

export const CANONICAL_RELATIONSHIP_STATUS = [
  'draft',
  'review',
  'approved',
  'published',
  'deprecated',
  'archived',
] as const;

export type RelationshipStatus = (typeof CANONICAL_RELATIONSHIP_STATUS)[number];

export interface KnowledgeRelationship {
  readonly relationshipId: string;
  readonly sourceKnowledgeId: string;
  readonly targetKnowledgeId: string;
  readonly relationshipType: KnowledgeRelationshipType;
  readonly relationshipStrength: RelationshipStrength;
  readonly status: RelationshipStatus;
  readonly tags: readonly string[];
  readonly summary: string;
  readonly provenance: RelationshipProvenance;
}

export interface KnowledgeCrossReference {
  readonly referenceId: string;
  readonly knowledgeId: string;
  readonly referenceType: CrossReferenceType;
  readonly targetIdentifier: string;
  readonly displayLabel: string;
  readonly status: RelationshipStatus;
  readonly provenance: RelationshipProvenance;
}

export interface RelationshipTrace {
  readonly traceId: string;
  readonly decisionCount: number;
  readonly validationCount: number;
  readonly registryVersion: string;
  readonly compositionVersion: string;
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_relationship_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

export interface RelationshipRegistryMetadata {
  readonly registryId: string;
  readonly relationshipCount: number;
  readonly crossReferenceCount: number;
  readonly relationshipTypeCount: number;
  readonly crossReferenceTypeCount: number;
}

export interface KnowledgeRelationshipRegistry {
  readonly registryId: string;
  readonly relationships: readonly KnowledgeRelationship[];
  readonly crossReferences: readonly KnowledgeCrossReference[];
  readonly metadata: RelationshipRegistryMetadata;
  readonly trace: RelationshipTrace;
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_relationship_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

export interface KnowledgeRelationshipInput {
  readonly relationships: readonly KnowledgeRelationship[];
  readonly crossReferences: readonly KnowledgeCrossReference[];
}

export interface KnowledgeArtifactWithRelationships {
  readonly knowledgeId: string;
  readonly title: string;
  readonly relationships: readonly KnowledgeRelationship[];
  readonly crossReferences: readonly KnowledgeCrossReference[];
  readonly provenance: RelationshipProvenance;
}

export interface RelationshipValidationError {
  readonly id?: string;
  readonly code: string;
  readonly message: string;
  readonly field?: string;
}

export interface KnowledgeRelationshipValidationResult { readonly valid: boolean; readonly errors: readonly RelationshipValidationError[]; readonly checkedAt: 'knowledge_relationship_validation'; }
export interface KnowledgeCrossReferenceValidationResult { readonly valid: boolean; readonly errors: readonly RelationshipValidationError[]; readonly checkedAt: 'knowledge_cross_reference_validation'; }
export interface KnowledgeRelationshipRegistryValidationResult { readonly valid: boolean; readonly errors: readonly RelationshipValidationError[]; readonly checkedAt: 'knowledge_relationship_registry_validation' | 'knowledge_relationship_registry_composition'; }
export interface KnowledgeRelationshipInputValidationResult { readonly valid: boolean; readonly errors: readonly RelationshipValidationError[]; readonly checkedAt: 'knowledge_relationship_input_validation' | 'knowledge_relationship_input_composition'; }
export interface RelationshipTraceValidationResult { readonly valid: boolean; readonly errors: readonly RelationshipValidationError[]; readonly checkedAt: 'relationship_trace_validation' | 'relationship_trace_composition'; }
export interface KnowledgeArtifactWithRelationshipsValidationResult { readonly valid: boolean; readonly errors: readonly RelationshipValidationError[]; readonly checkedAt: 'knowledge_artifact_with_relationships_validation' | 'knowledge_artifact_with_relationships_composition'; }

export interface VersionProvenance {
  readonly source: string;
  readonly governanceStatus: KnowledgeGovernanceStatus;
  readonly providedBy: string;
  readonly rationale: string;
}

export const CANONICAL_VERSION_TYPES = [
  'major',
  'minor',
  'patch',
  'editorial',
  'structural',
  'evidence_update',
  'reference_update',
  'curriculum_alignment',
  'laboratory_alignment',
  'metadata',
] as const;
export type VersionType = (typeof CANONICAL_VERSION_TYPES)[number];
export const CANONICAL_EDITORIAL_ACTIONS = [
  'created',
  'updated',
  'reviewed',
  'approved',
  'published',
  'deprecated',
  'archived',
  'restored',
  'superseded',
  'merged',
] as const;
export type EditorialAction = (typeof CANONICAL_EDITORIAL_ACTIONS)[number];
export const CANONICAL_EDITORIAL_LIFECYCLE = [
  'draft',
  'review',
  'approved',
  'published',
  'active',
  'deprecated',
  'archived',
  'superseded',
  'withdrawn',
  'historical',
] as const;
export type EditorialLifecycle = (typeof CANONICAL_EDITORIAL_LIFECYCLE)[number];
export const CANONICAL_VERSION_STATUS = ['draft', 'review', 'approved', 'published', 'deprecated', 'archived'] as const;
export type VersionStatus = (typeof CANONICAL_VERSION_STATUS)[number];

export interface KnowledgeVersion { readonly versionId: string; readonly knowledgeId: string; readonly versionNumber: string; readonly versionType: VersionType; readonly status: VersionStatus; readonly lifecycle: EditorialLifecycle; readonly title: string; readonly description: string; readonly tags: readonly string[]; readonly provenance: VersionProvenance; }
export interface EditorialRevision { readonly revisionId: string; readonly versionId: string; readonly knowledgeId: string; readonly editorialAction: EditorialAction; readonly description: string; readonly status: VersionStatus; readonly provenance: VersionProvenance; }
export interface VersionRelationship { readonly relationshipId: string; readonly sourceVersionId: string; readonly targetVersionId: string; readonly relationshipType: string; readonly description: string; readonly status: VersionStatus; readonly provenance: VersionProvenance; }
export interface VersionTrace { readonly traceId: string; readonly decisionCount: number; readonly validationCount: number; readonly registryVersion: string; readonly compositionVersion: string; readonly deterministic: true; readonly generatedFrom: 'deterministic_version_kernel'; readonly randomUsed: false; readonly timeDependency: false; }
export interface VersionRegistryMetadata { readonly registryId: string; readonly versionCount: number; readonly revisionCount: number; readonly relationshipCount: number; readonly versionTypeCount: number; }
export interface VersionRegistry { readonly registryId: string; readonly versions: readonly KnowledgeVersion[]; readonly revisions: readonly EditorialRevision[]; readonly relationships: readonly VersionRelationship[]; readonly metadata: VersionRegistryMetadata; readonly trace: VersionTrace; readonly deterministic: true; readonly generatedFrom: 'deterministic_version_kernel'; readonly randomUsed: false; readonly timeDependency: false; }
export interface VersionInput { readonly versions: readonly KnowledgeVersion[]; readonly revisions: readonly EditorialRevision[]; readonly relationships: readonly VersionRelationship[]; }
export interface KnowledgeArtifactWithVersionHistory { readonly knowledgeId: string; readonly title: string; readonly versions: readonly KnowledgeVersion[]; readonly revisions: readonly EditorialRevision[]; readonly relationships: readonly VersionRelationship[]; readonly provenance: VersionProvenance; }
export interface VersionValidationError { readonly id?: string; readonly code: string; readonly message: string; readonly field?: string; }
export interface KnowledgeVersionValidationResult { readonly valid: boolean; readonly errors: readonly VersionValidationError[]; readonly checkedAt: 'knowledge_version_validation'; }
export interface EditorialRevisionValidationResult { readonly valid: boolean; readonly errors: readonly VersionValidationError[]; readonly checkedAt: 'editorial_revision_validation'; }
export interface VersionRelationshipValidationResult { readonly valid: boolean; readonly errors: readonly VersionValidationError[]; readonly checkedAt: 'version_relationship_validation'; }
export interface VersionRegistryValidationResult { readonly valid: boolean; readonly errors: readonly VersionValidationError[]; readonly checkedAt: 'version_registry_validation' | 'version_registry_composition'; }
export interface VersionInputValidationResult { readonly valid: boolean; readonly errors: readonly VersionValidationError[]; readonly checkedAt: 'version_input_validation' | 'version_input_composition'; }
export interface VersionTraceValidationResult { readonly valid: boolean; readonly errors: readonly VersionValidationError[]; readonly checkedAt: 'version_trace_validation' | 'version_trace_composition'; }
export interface KnowledgeArtifactWithVersionHistoryValidationResult { readonly valid: boolean; readonly errors: readonly VersionValidationError[]; readonly checkedAt: 'knowledge_artifact_with_version_history_validation' | 'knowledge_artifact_with_version_history_composition'; }

export interface ImpactProvenance { readonly source: string; readonly governanceStatus: KnowledgeGovernanceStatus; readonly providedBy: string; readonly rationale: string; }
export const CANONICAL_IMPACT_TYPES = ['direct_dependency', 'transitive_dependency', 'curriculum_dependency', 'knowledge_dependency', 'visualization_dependency', 'laboratory_dependency', 'assessment_dependency', 'documentation_dependency', 'reference_dependency', 'cross_agent_dependency'] as const;
export type ImpactType = (typeof CANONICAL_IMPACT_TYPES)[number];
export const CANONICAL_IMPACT_SEVERITY = ['low', 'moderate', 'high', 'critical', 'blocking'] as const;
export type ImpactSeverity = (typeof CANONICAL_IMPACT_SEVERITY)[number];
export const CANONICAL_CONSISTENCY_STATUS = ['draft', 'review', 'approved', 'published', 'deprecated', 'archived'] as const;
export type ConsistencyStatus = (typeof CANONICAL_CONSISTENCY_STATUS)[number];
export const CANONICAL_IMPACT_RESOLUTION_STATUS = ['pending', 'under_review', 'validated', 'resolved', 'rejected', 'superseded'] as const;
export type ImpactResolutionStatus = (typeof CANONICAL_IMPACT_RESOLUTION_STATUS)[number];
export interface KnowledgeImpact { readonly impactId: string; readonly sourceArtifactId: string; readonly targetArtifactId: string; readonly impactType: ImpactType; readonly severity: ImpactSeverity; readonly description: string; readonly rationale: string; readonly provenance: ImpactProvenance; }
export interface ConsistencyReport { readonly reportId: string; readonly artifactId: string; readonly impacts: readonly KnowledgeImpact[]; readonly affectedArtifacts: readonly string[]; readonly summary: string; readonly provenance: ImpactProvenance; }
export interface ImpactRelationship { readonly relationshipId: string; readonly sourceArtifactId: string; readonly targetArtifactId: string; readonly relationshipType: string; readonly description: string; readonly provenance: ImpactProvenance; }
export interface ConsistencyTrace { readonly traceId: string; readonly decisionCount: number; readonly validationCount: number; readonly registryVersion: string; readonly compositionVersion: string; readonly deterministicHashMetadata: string; readonly compositionMetadata: string; readonly deterministic: true; readonly generatedFrom: 'deterministic_impact_kernel'; readonly randomUsed: false; readonly timeDependency: false; }
export interface ConsistencyRegistryMetadata { readonly registryId: string; readonly reportCount: number; readonly impactCount: number; readonly relationshipCount: number; readonly impactTypeCount: number; }
export interface ConsistencyRegistry { readonly registryId: string; readonly reports: readonly ConsistencyReport[]; readonly relationships: readonly ImpactRelationship[]; readonly metadata: ConsistencyRegistryMetadata; readonly trace: ConsistencyTrace; readonly deterministic: true; readonly generatedFrom: 'deterministic_impact_kernel'; readonly randomUsed: false; readonly timeDependency: false; }
export interface ConsistencyInput { readonly reports: readonly ConsistencyReport[]; readonly relationships: readonly ImpactRelationship[]; }
export interface KnowledgeArtifactWithConsistency { readonly knowledgeId: string; readonly title: string; readonly reports: readonly ConsistencyReport[]; readonly relationships: readonly ImpactRelationship[]; readonly provenance: ImpactProvenance; }
export interface ImpactValidationError { readonly id?: string; readonly code: string; readonly message: string; readonly field?: string; }
export interface KnowledgeImpactValidationResult { readonly valid: boolean; readonly errors: readonly ImpactValidationError[]; readonly checkedAt: 'knowledge_impact_validation'; }
export interface ConsistencyReportValidationResult { readonly valid: boolean; readonly errors: readonly ImpactValidationError[]; readonly checkedAt: 'consistency_report_validation'; }
export interface ImpactRelationshipValidationResult { readonly valid: boolean; readonly errors: readonly ImpactValidationError[]; readonly checkedAt: 'impact_relationship_validation'; }
export interface ConsistencyRegistryValidationResult { readonly valid: boolean; readonly errors: readonly ImpactValidationError[]; readonly checkedAt: 'consistency_registry_validation' | 'consistency_registry_composition'; }
export interface ConsistencyInputValidationResult { readonly valid: boolean; readonly errors: readonly ImpactValidationError[]; readonly checkedAt: 'consistency_input_validation' | 'consistency_input_composition'; }
export interface ConsistencyTraceValidationResult { readonly valid: boolean; readonly errors: readonly ImpactValidationError[]; readonly checkedAt: 'consistency_trace_validation' | 'consistency_trace_composition'; }
export interface KnowledgeArtifactWithConsistencyValidationResult { readonly valid: boolean; readonly errors: readonly ImpactValidationError[]; readonly checkedAt: 'knowledge_artifact_with_consistency_validation' | 'knowledge_artifact_with_consistency_composition'; }

export interface ReviewProvenance { readonly source: string; readonly governanceStatus: KnowledgeGovernanceStatus; readonly providedBy: string; readonly rationale: string; }
export const CANONICAL_REVIEW_TRIGGER_TYPES = ['editorial_change', 'dependency_change', 'source_update', 'curriculum_change', 'laboratory_change', 'assessment_change', 'quality_issue', 'scheduled_review', 'manual_review', 'governance_review'] as const;
export type ReviewTriggerType = (typeof CANONICAL_REVIEW_TRIGGER_TYPES)[number];
export const CANONICAL_MAINTENANCE_TYPES = ['content_review', 'reference_update', 'source_validation', 'cross_reference_update', 'diagram_review', 'visualization_review', 'laboratory_review', 'assessment_review', 'documentation_review', 'full_editorial_review'] as const;
export type MaintenanceType = (typeof CANONICAL_MAINTENANCE_TYPES)[number];
export const CANONICAL_MAINTENANCE_PRIORITY = ['low', 'moderate', 'high', 'critical', 'blocking'] as const;
export type MaintenancePriority = (typeof CANONICAL_MAINTENANCE_PRIORITY)[number];
export const CANONICAL_REVIEW_STATUS = ['draft', 'review', 'approved', 'published', 'deprecated', 'archived'] as const;
export type ReviewStatus = (typeof CANONICAL_REVIEW_STATUS)[number];
export interface KnowledgeReviewTrigger { readonly triggerId: string; readonly triggerType: ReviewTriggerType; readonly artifactId: string; readonly priority: MaintenancePriority; readonly rationale: string; readonly provenance: ReviewProvenance; }
export interface KnowledgeMaintenanceTask { readonly taskId: string; readonly maintenanceType: MaintenanceType; readonly artifactId: string; readonly priority: MaintenancePriority; readonly triggerIds: readonly string[]; readonly provenance: ReviewProvenance; }
export interface KnowledgeReviewPlan { readonly planId: string; readonly artifactId: string; readonly tasks: readonly KnowledgeMaintenanceTask[]; readonly summary: string; readonly provenance: ReviewProvenance; }
export interface KnowledgeReviewTrace { readonly traceId: string; readonly decisionCount: number; readonly validationCount: number; readonly registryVersion: string; readonly compositionVersion: string; readonly compositionMetadata: string; readonly deterministicMetadata: string; readonly deterministic: true; readonly generatedFrom: 'deterministic_review_kernel'; readonly randomUsed: false; readonly timeDependency: false; }
export interface KnowledgeReviewRegistryMetadata { readonly registryId: string; readonly planCount: number; readonly taskCount: number; readonly triggerCount: number; readonly maintenanceTypeCount: number; }
export interface KnowledgeReviewRegistry { readonly registryId: string; readonly plans: readonly KnowledgeReviewPlan[]; readonly tasks: readonly KnowledgeMaintenanceTask[]; readonly triggers: readonly KnowledgeReviewTrigger[]; readonly metadata: KnowledgeReviewRegistryMetadata; readonly trace: KnowledgeReviewTrace; readonly deterministic: true; readonly generatedFrom: 'deterministic_review_kernel'; readonly randomUsed: false; readonly timeDependency: false; }
export interface KnowledgeReviewInput { readonly plans: readonly KnowledgeReviewPlan[]; readonly tasks: readonly KnowledgeMaintenanceTask[]; readonly triggers: readonly KnowledgeReviewTrigger[]; }
export interface KnowledgeArtifactWithReviewPlan { readonly knowledgeId: string; readonly title: string; readonly plans: readonly KnowledgeReviewPlan[]; readonly tasks: readonly KnowledgeMaintenanceTask[]; readonly triggers: readonly KnowledgeReviewTrigger[]; readonly provenance: ReviewProvenance; }
export interface KnowledgeReviewValidationError { readonly id?: string; readonly code: string; readonly message: string; readonly field?: string; }
export interface KnowledgeReviewTriggerValidationResult { readonly valid: boolean; readonly errors: readonly KnowledgeReviewValidationError[]; readonly checkedAt: 'knowledge_review_trigger_validation'; }
export interface KnowledgeMaintenanceTaskValidationResult { readonly valid: boolean; readonly errors: readonly KnowledgeReviewValidationError[]; readonly checkedAt: 'knowledge_maintenance_task_validation'; }
export interface KnowledgeReviewPlanValidationResult { readonly valid: boolean; readonly errors: readonly KnowledgeReviewValidationError[]; readonly checkedAt: 'knowledge_review_plan_validation'; }
export interface KnowledgeReviewRegistryValidationResult { readonly valid: boolean; readonly errors: readonly KnowledgeReviewValidationError[]; readonly checkedAt: 'knowledge_review_registry_validation' | 'knowledge_review_registry_composition'; }
export interface KnowledgeReviewInputValidationResult { readonly valid: boolean; readonly errors: readonly KnowledgeReviewValidationError[]; readonly checkedAt: 'knowledge_review_input_validation' | 'knowledge_review_input_composition'; }
export interface KnowledgeReviewTraceValidationResult { readonly valid: boolean; readonly errors: readonly KnowledgeReviewValidationError[]; readonly checkedAt: 'knowledge_review_trace_validation' | 'knowledge_review_trace_composition'; }
export interface KnowledgeArtifactWithReviewPlanValidationResult { readonly valid: boolean; readonly errors: readonly KnowledgeReviewValidationError[]; readonly checkedAt: 'knowledge_artifact_with_review_plan_validation' | 'knowledge_artifact_with_review_plan_composition'; }

// ============================================================================
// D10-OPT-17 — Certification
// ============================================================================

// ---------------------------------------------------------------------------
// Canonical Knowledge Certification Status (fixed, exactly 6)
// ---------------------------------------------------------------------------

export const CANONICAL_KNOWLEDGE_CERTIFICATION_STATUS = [
  'failed',
  'conditional',
  'passed',
  'approved',
  'canonical',
  'certified',
] as const;

export type KnowledgeCertificationStatus = (typeof CANONICAL_KNOWLEDGE_CERTIFICATION_STATUS)[number];

// ---------------------------------------------------------------------------
// Canonical Knowledge Finding Severity (fixed, exactly 5)
// ---------------------------------------------------------------------------

export const CANONICAL_KNOWLEDGE_FINDING_SEVERITY = [
  'info',
  'warning',
  'minor',
  'major',
  'critical',
] as const;

export type KnowledgeFindingSeverity = (typeof CANONICAL_KNOWLEDGE_FINDING_SEVERITY)[number];

// ---------------------------------------------------------------------------
// Canonical Knowledge Quality Dimensions (fixed, exactly 24)
// ---------------------------------------------------------------------------

export const CANONICAL_KNOWLEDGE_QUALITY_DIMENSIONS = [
  'foundation',
  'explanations',
  'components',
  'representations',
  'examples',
  'comparisons',
  'mathematical_graphs',
  'visualizations',
  'laboratories',
  'research',
  'applications',
  'assessments',
  'misconceptions',
  'semantic_connectivity',
  'premium_assets',
  'governance',
  'metadata',
  'validation',
  'determinism',
  'immutability',
  'documentation',
  'cross_agent_boundary',
  'public_api',
  'architectural_consistency',
] as const;

export type KnowledgeQualityDimension = (typeof CANONICAL_KNOWLEDGE_QUALITY_DIMENSIONS)[number];

// ---------------------------------------------------------------------------
// Knowledge Certification Finding
// ---------------------------------------------------------------------------

export interface KnowledgeCertificationFinding {
  readonly findingId: string;
  readonly dimension: KnowledgeQualityDimension;
  readonly severity: KnowledgeFindingSeverity;
  readonly description: string;
}

// ---------------------------------------------------------------------------
// Knowledge Certification Trace
// ---------------------------------------------------------------------------

export interface KnowledgeCertificationTrace {
  readonly traceId: string;
  readonly findingCount: number;
  readonly evaluationTimestamp: string;
  readonly registryVersion: string;
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_certification_engine';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Knowledge Certification Metadata
// ---------------------------------------------------------------------------

export interface KnowledgeCertificationMetadata {
  readonly certificationId: string;
  readonly certificationScore: number;
  readonly certificationStatus: KnowledgeCertificationStatus;
  readonly evaluatedDimensions: number;
}

// ---------------------------------------------------------------------------
// Knowledge Certification Report
// ---------------------------------------------------------------------------

export interface KnowledgeCertificationReport {
  readonly findings: readonly KnowledgeCertificationFinding[];
  readonly metadata: KnowledgeCertificationMetadata;
  readonly trace: KnowledgeCertificationTrace;
}

// ---------------------------------------------------------------------------
// Knowledge Certification Validation Error
// ---------------------------------------------------------------------------

export interface KnowledgeCertificationValidationError {
  readonly code: string;
  readonly message: string;
  readonly field?: string;
}

// ---------------------------------------------------------------------------
// Knowledge Certification Validation Result
// ---------------------------------------------------------------------------

export interface KnowledgeCertificationValidationResult {
  readonly valid: boolean;
  readonly errors: readonly KnowledgeCertificationValidationError[];
}

// ---------------------------------------------------------------------------
// Knowledge Certification Finding Validation Result
// ---------------------------------------------------------------------------

export interface KnowledgeCertificationFindingValidationResult {
  readonly valid: boolean;
  readonly errors: readonly KnowledgeCertificationValidationError[];
  readonly checkedAt: 'knowledge_certification_finding_validation';
}

// ---------------------------------------------------------------------------
// Knowledge Certification Status Validation Result
// ---------------------------------------------------------------------------

export interface KnowledgeCertificationStatusValidationResult {
  readonly valid: boolean;
  readonly errors: readonly KnowledgeCertificationValidationError[];
  readonly checkedAt: 'knowledge_certification_status_validation';
}

// ---------------------------------------------------------------------------
// Knowledge Certification Score Validation Result
// ---------------------------------------------------------------------------

export interface KnowledgeCertificationScoreValidationResult {
  readonly valid: boolean;
  readonly errors: readonly KnowledgeCertificationValidationError[];
  readonly checkedAt: 'knowledge_certification_score_validation';
}

// ============================================================================
// D10-OPT-18 — Public Facade
// ============================================================================

// ---------------------------------------------------------------------------
// Canonical Knowledge Facade Status (fixed, exactly 6)
// ---------------------------------------------------------------------------

export const CANONICAL_KNOWLEDGE_FACADE_STATUS = [
  'available',
  'validated',
  'certified',
  'deprecated',
  'internal',
  'legacy',
] as const;

export type KnowledgeFacadeStatus = (typeof CANONICAL_KNOWLEDGE_FACADE_STATUS)[number];

// ---------------------------------------------------------------------------
// Knowledge Facade Trace Metadata
// ---------------------------------------------------------------------------

export interface KnowledgeFacadeTraceMetadata {
  readonly facadeId: string;
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_facade';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Knowledge Facade Validation Result
// ---------------------------------------------------------------------------

export interface KnowledgeFacadeValidationResult {
  readonly valid: boolean;
  readonly errors: readonly KnowledgeFacadeValidationError[];
  readonly trace: KnowledgeFacadeTraceMetadata;
}

// ---------------------------------------------------------------------------
// Knowledge Facade Artifact Result
// ---------------------------------------------------------------------------

export interface KnowledgeFacadeComposedArtifact {
  readonly registryId: string;
  readonly nodes: ReadonlyArray<{
    readonly nodeId: string;
    readonly title: string;
  }>;
  readonly trace: {
    readonly traceId: string;
    readonly decisionCount: number;
    readonly validationCount: number;
  };
  readonly deterministic: true;
}

export interface KnowledgeFacadeArtifactResult {
  readonly artifact: KnowledgeFacadeComposedArtifact;
  readonly validation: KnowledgeFacadeValidationResult;
  readonly status: KnowledgeFacadeStatus;
  readonly trace: KnowledgeFacadeTraceMetadata;
}

// ---------------------------------------------------------------------------
// Knowledge Facade Certification Result
// ---------------------------------------------------------------------------

export interface KnowledgeFacadeCertificationResult {
  readonly certification: KnowledgeCertificationReport;
  readonly validation: KnowledgeFacadeValidationResult;
  readonly status: KnowledgeFacadeStatus;
  readonly trace: KnowledgeFacadeTraceMetadata;
}

// ---------------------------------------------------------------------------
// Knowledge Facade Complete Result
// ---------------------------------------------------------------------------

export interface KnowledgeFacadeCompleteResult {
  readonly artifact: KnowledgeFacadeComposedArtifact;
  readonly certification: KnowledgeCertificationReport;
  readonly validation: KnowledgeFacadeValidationResult;
  readonly status: KnowledgeFacadeStatus;
  readonly trace: KnowledgeFacadeTraceMetadata;
}

// ---------------------------------------------------------------------------
// Knowledge Facade Validation Error
// ---------------------------------------------------------------------------

export interface KnowledgeFacadeValidationError {
  readonly code: string;
  readonly message: string;
  readonly path: string;
}

// ---------------------------------------------------------------------------
// Knowledge Facade Entry Validation Result
// ---------------------------------------------------------------------------

export interface KnowledgeFacadeEntryValidationResult {
  readonly valid: boolean;
  readonly errors: readonly KnowledgeFacadeValidationError[];
  readonly trace: KnowledgeFacadeTraceMetadata;
}

/**
 * NV-2000-D8-OPT-01 through D8-OPT-16 — Assessment Agent Domain Contract
 *
 * Stable internal data model for the Assessment Pipeline Kernel.
 * Defines all types required for deterministic assessment orchestration.
 *
 * This module is purely structural. It contains no runtime logic,
 * no mutable state, no external dependencies, and no probabilistic behavior.
 *
 * D8-OPT-01: structural foundation.
 * D8-OPT-02: cognitive level and question type modeling.
 * D8-OPT-03: deterministic answer verification.
 * D8-OPT-04: concept graph assessment mapping.
 * D8-OPT-05: misconception detection and remediation modeling.
 * D8-OPT-06: explanatory feedback modeling.
 * D8-OPT-07: laboratory-aware assessment integration.
 * D8-OPT-08: visual and multimodal assessment modeling.
 * D8-OPT-09: engineering case study assessment.
 * D8-OPT-10: comparative reasoning and trade-off evaluation.
 * D8-OPT-11: engineering constraint analysis.
 * D8-OPT-12: reinforcement plan generation.
 * D8-OPT-13: portfolio-oriented evaluation.
 * D8-OPT-14: assessment evidence & governance layer.
 * D8-OPT-15: assessment certification & structural quality gate.
 * D8-OPT-16: public API consolidation & assessment pipeline facade.
 * Scoring, mastery, and adaptive tutoring
 * belong exclusively to later D8 optimization phases.
 */

// ============================================================================
// CANONICAL ENUMS — Immutable constant arrays
// ============================================================================

/**
 * Canonical assessment artifact types.
 * Exactly 10 values. Stable forever.
 */
export const CANONICAL_ASSESSMENT_ARTIFACT_TYPES = [
  'multiple_choice',
  'short_answer',
  'concept_mapping',
  'laboratory_assessment',
  'visual_assessment',
  'engineering_case',
  'comparative_reasoning',
  'constraint_analysis',
  'portfolio_evaluation',
  'reflection',
] as const;

export type AssessmentArtifactType =
  (typeof CANONICAL_ASSESSMENT_ARTIFACT_TYPES)[number];

/**
 * Canonical assessment domains.
 * Exactly 10 values. Stable forever.
 */
export const CANONICAL_ASSESSMENT_DOMAINS = [
  'computer_vision',
  'machine_learning',
  'deep_learning',
  'generative_ai',
  'mlops',
  'robotics',
  'edge_ai',
  'data_engineering',
  'software_engineering',
  'research',
] as const;

export type AssessmentDomain =
  (typeof CANONICAL_ASSESSMENT_DOMAINS)[number];

/**
 * Canonical assessment statuses.
 * Exactly 6 values. Stable forever.
 */
export const CANONICAL_ASSESSMENT_STATUS = [
  'draft',
  'review',
  'approved',
  'published',
  'deprecated',
  'archived',
] as const;

export type AssessmentStatus =
  (typeof CANONICAL_ASSESSMENT_STATUS)[number];

/**
 * Canonical assessment governance levels.
 * Exactly 5 values. Stable forever.
 */
export const CANONICAL_ASSESSMENT_GOVERNANCE = [
  'canonical',
  'accepted',
  'provisional',
  'deprecated',
  'rejected',
] as const;

export type AssessmentGovernanceLevel =
  (typeof CANONICAL_ASSESSMENT_GOVERNANCE)[number];

// ============================================================================
// CONTRACTS — Immutable readonly domain types
// ============================================================================

/**
 * Provenance metadata for an assessment artifact.
 * Immutable. Readonly. Deterministic.
 */
export interface AssessmentProvenance {
  readonly provider: string;
  readonly source: string;
  readonly reviewStatus: AssessmentStatus;
  readonly reviewDate: string;
  readonly version: string;
  readonly rationale: string;
}

/**
 * Governance decision metadata for an assessment artifact.
 * Immutable. Readonly. Deterministic.
 */
export interface AssessmentDecision {
  readonly level: AssessmentGovernanceLevel;
  readonly decidedBy: string;
  readonly decidedAt: string;
  readonly rationale: string;
}

/**
 * Deterministic trace metadata for an assessment artifact.
 * Immutable. Readonly. No random. No time dependency.
 */
export interface AssessmentTrace {
  readonly traceId: string;
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_assessment_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

/**
 * Represents one governed assessment artifact.
 * Immutable. Readonly. Deterministic.
 */
export interface AssessmentNode {
  readonly id: string;
  readonly title: string;
  readonly artifactType: AssessmentArtifactType;
  readonly domain: AssessmentDomain;
  readonly status: AssessmentStatus;
  readonly governance: AssessmentGovernanceLevel;
  readonly provenance: AssessmentProvenance;
  readonly trace: AssessmentTrace;
}

/**
 * Registry metadata.
 * Immutable. Readonly. Deterministic.
 */
export interface AssessmentRegistryMetadata {
  readonly registryId: string;
  readonly version: string;
  readonly nodeCount: number;
  readonly generatedFrom: 'deterministic_assessment_kernel';
  readonly deterministic: true;
  readonly randomUsed: false;
  readonly timeDependency: false;
}

/**
 * Complete assessment registry.
 * Immutable. Readonly. Deterministic.
 */
export interface AssessmentRegistry {
  readonly metadata: AssessmentRegistryMetadata;
  readonly nodes: readonly AssessmentNode[];
}

/**
 * Input object accepted by composeAssessmentRegistryFromInput.
 * Immutable. Readonly.
 */
export interface AssessmentInput {
  readonly nodes: readonly AssessmentNode[];
}

// ============================================================================
// VALIDATION CONTRACTS — Structured validation types
// ============================================================================

/**
 * Single validation error.
 * Immutable. Readonly.
 */
export interface AssessmentValidationError {
  readonly code: string;
  readonly message: string;
  readonly field?: string;
  readonly entityId?: string;
}

/**
 * Generic validation result.
 * Immutable. Readonly.
 */
export interface AssessmentValidationResult {
  readonly valid: boolean;
  readonly errors: readonly AssessmentValidationError[];
  readonly checkedAt: string;
}

/**
 * Node-level validation result.
 * Immutable. Readonly.
 */
export interface AssessmentNodeValidationResult {
  readonly valid: boolean;
  readonly errors: readonly AssessmentValidationError[];
  readonly nodeId: string;
  readonly checkedAt: 'node_validation';
}

/**
 * Registry-level validation result.
 * Immutable. Readonly.
 */
export interface AssessmentRegistryValidationResult {
  readonly valid: boolean;
  readonly errors: readonly AssessmentValidationError[];
  readonly nodeResults: readonly AssessmentNodeValidationResult[];
  readonly checkedAt: 'registry_validation';
}

/**
 * Input-level validation result.
 * Immutable. Readonly.
 */
export interface AssessmentInputValidationResult {
  readonly valid: boolean;
  readonly errors: readonly AssessmentValidationError[];
  readonly checkedAt: 'input_validation';
}

/**
 * Trace-level validation result.
 * Immutable. Readonly.
 */
export interface AssessmentTraceValidationResult {
  readonly valid: boolean;
  readonly errors: readonly AssessmentValidationError[];
  readonly checkedAt: 'trace_validation';
}

// ============================================================================
// D8-OPT-02 — COGNITIVE ENUMS — Immutable constant arrays
// ============================================================================

/**
 * Canonical cognitive levels.
 * Exactly 10 values. Stable forever.
 */
export const CANONICAL_COGNITIVE_LEVELS = [
  'remember',
  'understand',
  'apply',
  'analyze',
  'evaluate',
  'create',
  'reason',
  'justify',
  'design',
  'reflect',
] as const;

export type CognitiveLevel = (typeof CANONICAL_COGNITIVE_LEVELS)[number];

/**
 * Canonical question types.
 * Exactly 10 values. Stable forever.
 */
export const CANONICAL_QUESTION_TYPES = [
  'multiple_choice',
  'multiple_select',
  'true_false',
  'short_answer',
  'long_answer',
  'matching',
  'ordering',
  'concept_mapping',
  'engineering_case',
  'reflection',
] as const;

export type QuestionType = (typeof CANONICAL_QUESTION_TYPES)[number];

/**
 * Canonical reasoning types.
 * Exactly 10 values. Stable forever.
 */
export const CANONICAL_REASONING_TYPES = [
  'factual',
  'conceptual',
  'procedural',
  'analytical',
  'comparative',
  'causal',
  'diagnostic',
  'engineering',
  'critical',
  'reflective',
] as const;

export type ReasoningType = (typeof CANONICAL_REASONING_TYPES)[number];

/**
 * Canonical assessment objectives.
 * Exactly 10 values. Stable forever.
 */
export const CANONICAL_ASSESSMENT_OBJECTIVES = [
  'knowledge_verification',
  'concept_understanding',
  'practical_application',
  'engineering_reasoning',
  'constraint_analysis',
  'trade_off_evaluation',
  'system_design',
  'laboratory_validation',
  'portfolio_evidence',
  'reflection',
] as const;

export type AssessmentObjective =
  (typeof CANONICAL_ASSESSMENT_OBJECTIVES)[number];

/**
 * Canonical expected evidence types.
 * Exactly 10 values. Stable forever.
 */
export const CANONICAL_EXPECTED_EVIDENCE_TYPES = [
  'selected_option',
  'written_response',
  'concept_relationship',
  'calculation',
  'engineering_argument',
  'architecture_design',
  'laboratory_observation',
  'comparison',
  'decision_justification',
  'reflection',
] as const;

export type ExpectedEvidenceType =
  (typeof CANONICAL_EXPECTED_EVIDENCE_TYPES)[number];

/**
 * Canonical cognitive statuses.
 * Exactly 6 values. Stable forever.
 */
export const CANONICAL_COGNITIVE_STATUS = [
  'draft',
  'review',
  'approved',
  'published',
  'deprecated',
  'archived',
] as const;

export type CognitiveStatus = (typeof CANONICAL_COGNITIVE_STATUS)[number];

// ============================================================================
// D8-OPT-02 — COGNITIVE CONTRACTS — Immutable readonly domain types
// ============================================================================

/**
 * Provenance metadata for a cognitive assessment profile.
 * Immutable. Readonly. Deterministic.
 */
export interface CognitiveProvenance {
  readonly provider: string;
  readonly source: string;
  readonly reviewStatus: CognitiveStatus;
  readonly reviewDate: string;
  readonly version: string;
  readonly rationale: string;
}

/**
 * Governance decision metadata for a cognitive profile.
 * Immutable. Readonly. Deterministic.
 */
export interface CognitiveDecision {
  readonly level: AssessmentGovernanceLevel;
  readonly decidedBy: string;
  readonly decidedAt: string;
  readonly rationale: string;
}

/**
 * Deterministic trace metadata for a cognitive profile.
 * Immutable. Readonly. No random. No time dependency.
 */
export interface CognitiveTrace {
  readonly traceId: string;
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_cognitive_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

/**
 * Represents one governed cognitive assessment profile.
 * Immutable. Readonly. Deterministic.
 */
export interface CognitiveAssessmentProfile {
  readonly id: string;
  readonly title: string;
  readonly cognitiveLevel: CognitiveLevel;
  readonly questionType: QuestionType;
  readonly reasoningType: ReasoningType;
  readonly assessmentObjective: AssessmentObjective;
  readonly expectedEvidence: ExpectedEvidenceType;
  readonly status: CognitiveStatus;
  readonly governance: AssessmentGovernanceLevel;
  readonly provenance: CognitiveProvenance;
  readonly trace: CognitiveTrace;
}

/**
 * Represents a deterministic link between cognitive profiles.
 * Immutable. Readonly. Deterministic.
 */
export interface CognitiveRelationship {
  readonly id: string;
  readonly sourceProfileId: string;
  readonly targetProfileId: string;
  readonly relationshipType: string;
  readonly rationale: string;
}

/**
 * Registry metadata for cognitive profiles.
 * Immutable. Readonly. Deterministic.
 */
export interface CognitiveRegistryMetadata {
  readonly registryId: string;
  readonly version: string;
  readonly nodeCount: number;
  readonly generatedFrom: 'deterministic_cognitive_kernel';
  readonly deterministic: true;
  readonly randomUsed: false;
  readonly timeDependency: false;
}

/**
 * Complete cognitive registry.
 * Immutable. Readonly. Deterministic.
 */
export interface CognitiveRegistry {
  readonly metadata: CognitiveRegistryMetadata;
  readonly nodes: readonly CognitiveAssessmentProfile[];
}

/**
 * Input object accepted by composeCognitiveRegistryFromInput.
 * Immutable. Readonly.
 */
export interface CognitiveInput {
  readonly nodes: readonly CognitiveAssessmentProfile[];
}

/**
 * Assessment artifact with an associated cognitive profile.
 * Immutable. Readonly.
 */
export interface AssessmentArtifactWithCognitiveProfile {
  readonly artifactId: string;
  readonly artifactTitle: string;
  readonly cognitiveProfile: CognitiveAssessmentProfile;
}

// ============================================================================
// D8-OPT-02 — COGNITIVE VALIDATION CONTRACTS — Structured validation types
// ============================================================================

/**
 * Single cognitive validation error.
 * Immutable. Readonly.
 */
export interface CognitiveValidationError {
  readonly code: string;
  readonly message: string;
  readonly field?: string;
  readonly entityId?: string;
}

/**
 * Generic cognitive validation result.
 * Immutable. Readonly.
 */
export interface CognitiveValidationResult {
  readonly valid: boolean;
  readonly errors: readonly CognitiveValidationError[];
  readonly checkedAt: string;
}

/**
 * Cognitive node-level validation result.
 * Immutable. Readonly.
 */
export interface CognitiveNodeValidationResult {
  readonly valid: boolean;
  readonly errors: readonly CognitiveValidationError[];
  readonly profileId: string;
  readonly checkedAt: 'cognitive_node_validation';
}

/**
 * Cognitive registry-level validation result.
 * Immutable. Readonly.
 */
export interface CognitiveRegistryValidationResult {
  readonly valid: boolean;
  readonly errors: readonly CognitiveValidationError[];
  readonly nodeResults: readonly CognitiveNodeValidationResult[];
  readonly checkedAt: 'cognitive_registry_validation';
}

/**
 * Cognitive input-level validation result.
 * Immutable. Readonly.
 */
export interface CognitiveInputValidationResult {
  readonly valid: boolean;
  readonly errors: readonly CognitiveValidationError[];
  readonly checkedAt: 'cognitive_input_validation';
}

/**
 * Cognitive trace-level validation result.
 * Immutable. Readonly.
 */
export interface CognitiveTraceValidationResult {
  readonly valid: boolean;
  readonly errors: readonly CognitiveValidationError[];
  readonly checkedAt: 'cognitive_trace_validation';
}

/**
 * Validation result for an artifact with cognitive profile.
 * Immutable. Readonly.
 */
export interface AssessmentArtifactWithCognitiveProfileValidationResult {
  readonly valid: boolean;
  readonly errors: readonly CognitiveValidationError[];
  readonly checkedAt: 'artifact_cognitive_profile_validation';
}

// ============================================================================
// D8-OPT-03 — VERIFICATION ENUMS — Immutable constant arrays
// ============================================================================

/**
 * Canonical verification types.
 * Exactly 10 values. Stable forever.
 */
export const CANONICAL_VERIFICATION_TYPES = [
  'exact_match',
  'unordered_match',
  'ordered_match',
  'multiple_selection',
  'boolean',
  'numeric',
  'range',
  'mapping',
  'relationship',
  'structured_response',
] as const;

export type VerificationType =
  (typeof CANONICAL_VERIFICATION_TYPES)[number];

/**
 * Canonical response types.
 * Exactly 10 values. Stable forever.
 */
export const CANONICAL_RESPONSE_TYPES = [
  'single_choice',
  'multiple_choice',
  'boolean',
  'number',
  'text',
  'ordered_list',
  'mapping',
  'graph',
  'table',
  'structured',
] as const;

export type ResponseType = (typeof CANONICAL_RESPONSE_TYPES)[number];

/**
 * Canonical matching strategies.
 * Exactly 10 values. Stable forever.
 */
export const CANONICAL_MATCHING_STRATEGIES = [
  'strict',
  'case_insensitive',
  'normalized',
  'unordered',
  'ordered',
  'subset',
  'superset',
  'exact_numeric',
  'numeric_tolerance',
  'structural',
] as const;

export type MatchingStrategy =
  (typeof CANONICAL_MATCHING_STRATEGIES)[number];

/**
 * Canonical verification result types.
 * Exactly 10 values. Stable forever.
 */
export const CANONICAL_VERIFICATION_RESULT_TYPES = [
  'correct',
  'incorrect',
  'partially_correct',
  'invalid_format',
  'missing_response',
  'unsupported',
  'ambiguous',
  'incomplete',
  'inconsistent',
  'not_evaluated',
] as const;

export type VerificationResultType =
  (typeof CANONICAL_VERIFICATION_RESULT_TYPES)[number];

/**
 * Canonical verification statuses.
 * Exactly 6 values. Stable forever.
 */
export const CANONICAL_VERIFICATION_STATUS = [
  'draft',
  'review',
  'approved',
  'published',
  'deprecated',
  'archived',
] as const;

export type VerificationStatus =
  (typeof CANONICAL_VERIFICATION_STATUS)[number];

// ============================================================================
// D8-OPT-03 — VERIFICATION CONTRACTS — Immutable readonly domain types
// ============================================================================

/**
 * Provenance metadata for a verification rule.
 * Immutable. Readonly. Deterministic.
 */
export interface VerificationProvenance {
  readonly provider: string;
  readonly source: string;
  readonly reviewStatus: VerificationStatus;
  readonly reviewDate: string;
  readonly version: string;
  readonly rationale: string;
}

/**
 * Governance decision metadata for verification.
 * Immutable. Readonly. Deterministic.
 */
export interface VerificationDecision {
  readonly level: AssessmentGovernanceLevel;
  readonly decidedBy: string;
  readonly decidedAt: string;
  readonly rationale: string;
}

/**
 * Deterministic trace metadata for verification.
 * Immutable. Readonly. No random. No time dependency.
 */
export interface VerificationTrace {
  readonly traceId: string;
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_verification_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

/**
 * Represents one governed verification rule.
 * Immutable. Readonly. Deterministic.
 */
export interface VerificationRule {
  readonly id: string;
  readonly title: string;
  readonly verificationType: VerificationType;
  readonly responseType: ResponseType;
  readonly matchingStrategy: MatchingStrategy;
  readonly expectedAnswer: readonly string[];
  readonly status: VerificationStatus;
  readonly governance: AssessmentGovernanceLevel;
  readonly provenance: VerificationProvenance;
  readonly trace: VerificationTrace;
}

/**
 * Represents a deterministic learner response.
 * Immutable. Readonly. No inference. No probabilistic logic.
 */
export interface LearnerResponse {
  readonly responseId: string;
  readonly ruleId: string;
  readonly responseType: ResponseType;
  readonly submittedAnswer: readonly string[];
  readonly timestamp?: string;
}

/**
 * Contains deterministic verification output.
 * No scores. No mastery. Only verification result.
 */
export interface VerificationResult {
  readonly ruleId: string;
  readonly result: VerificationResultType;
  readonly matched: boolean;
  readonly reason: string;
  readonly trace: VerificationTrace;
}

/**
 * Represents a deterministic link between verification rules.
 * Immutable. Readonly. Deterministic.
 */
export interface VerificationRelationship {
  readonly id: string;
  readonly sourceRuleId: string;
  readonly targetRuleId: string;
  readonly relationshipType: string;
  readonly rationale: string;
}

/**
 * Registry metadata for verification rules.
 * Immutable. Readonly. Deterministic.
 */
export interface VerificationRegistryMetadata {
  readonly registryId: string;
  readonly version: string;
  readonly nodeCount: number;
  readonly generatedFrom: 'deterministic_verification_kernel';
  readonly deterministic: true;
  readonly randomUsed: false;
  readonly timeDependency: false;
}

/**
 * Complete verification registry.
 * Immutable. Readonly. Deterministic.
 */
export interface VerificationRegistry {
  readonly metadata: VerificationRegistryMetadata;
  readonly nodes: readonly VerificationRule[];
}

/**
 * Input object accepted by composeVerificationRegistryFromInput.
 * Immutable. Readonly.
 */
export interface VerificationInput {
  readonly nodes: readonly VerificationRule[];
}

/**
 * Assessment artifact with an associated verification rule.
 * Immutable. Readonly.
 */
export interface AssessmentArtifactWithVerification {
  readonly artifactId: string;
  readonly artifactTitle: string;
  readonly verificationRule: VerificationRule;
}

// ============================================================================
// D8-OPT-03 — VERIFICATION VALIDATION CONTRACTS — Structured validation types
// ============================================================================

/**
 * Single verification validation error.
 * Immutable. Readonly.
 */
export interface VerificationValidationError {
  readonly code: string;
  readonly message: string;
  readonly field?: string;
  readonly entityId?: string;
}

/**
 * Generic verification validation result.
 * Immutable. Readonly.
 */
export interface VerificationValidationResult {
  readonly valid: boolean;
  readonly errors: readonly VerificationValidationError[];
  readonly checkedAt: string;
}

/**
 * Verification rule-level validation result.
 * Immutable. Readonly.
 */
export interface VerificationRuleValidationResult {
  readonly valid: boolean;
  readonly errors: readonly VerificationValidationError[];
  readonly ruleId: string;
  readonly checkedAt: 'verification_rule_validation';
}

/**
 * Verification registry-level validation result.
 * Immutable. Readonly.
 */
export interface VerificationRegistryValidationResult {
  readonly valid: boolean;
  readonly errors: readonly VerificationValidationError[];
  readonly nodeResults: readonly VerificationRuleValidationResult[];
  readonly checkedAt: 'verification_registry_validation';
}

/**
 * Verification input-level validation result.
 * Immutable. Readonly.
 */
export interface VerificationInputValidationResult {
  readonly valid: boolean;
  readonly errors: readonly VerificationValidationError[];
  readonly checkedAt: 'verification_input_validation';
}

/**
 * Verification trace-level validation result.
 * Immutable. Readonly.
 */
export interface VerificationTraceValidationResult {
  readonly valid: boolean;
  readonly errors: readonly VerificationValidationError[];
  readonly checkedAt: 'verification_trace_validation';
}

/**
 * Validation result for an artifact with verification rule.
 * Immutable. Readonly.
 */
export interface AssessmentArtifactWithVerificationValidationResult {
  readonly valid: boolean;
  readonly errors: readonly VerificationValidationError[];
  readonly checkedAt: 'artifact_verification_validation';
}

// ============================================================================
// D8-OPT-04 — CONCEPT GRAPH ENUMS — Immutable constant arrays
// ============================================================================

/**
 * Canonical concept node types.
 * Exactly 10 values. Stable forever.
 */
export const CANONICAL_CONCEPT_NODE_TYPES = [
  'concept',
  'principle',
  'definition',
  'algorithm',
  'technique',
  'formula',
  'workflow',
  'architecture',
  'constraint',
  'application',
] as const;

export type ConceptNodeType =
  (typeof CANONICAL_CONCEPT_NODE_TYPES)[number];

/**
 * Canonical relationship types.
 * Exactly 10 values. Stable forever.
 */
export const CANONICAL_RELATIONSHIP_TYPES = [
  'prerequisite',
  'dependency',
  'composition',
  'generalization',
  'specialization',
  'comparison',
  'causality',
  'implementation',
  'application',
  'equivalence',
] as const;

export type RelationshipType =
  (typeof CANONICAL_RELATIONSHIP_TYPES)[number];

/**
 * Canonical graph coverage types.
 * Exactly 10 values. Stable forever.
 */
export const CANONICAL_GRAPH_COVERAGE_TYPES = [
  'single_node',
  'partial_cluster',
  'complete_cluster',
  'dependency_chain',
  'hierarchical_branch',
  'cross_domain',
  'workflow_path',
  'architecture_layer',
  'competency_group',
  'full_graph',
] as const;

export type GraphCoverageType =
  (typeof CANONICAL_GRAPH_COVERAGE_TYPES)[number];

/**
 * Canonical assessment graph objectives.
 * Exactly 10 values. Stable forever.
 */
export const CANONICAL_ASSESSMENT_GRAPH_OBJECTIVES = [
  'concept_validation',
  'dependency_validation',
  'prerequisite_validation',
  'relationship_validation',
  'competency_validation',
  'architecture_validation',
  'reasoning_validation',
  'workflow_validation',
  'integration_validation',
  'mastery_validation',
] as const;

export type AssessmentGraphObjective =
  (typeof CANONICAL_ASSESSMENT_GRAPH_OBJECTIVES)[number];

/**
 * Canonical graph mapping statuses.
 * Exactly 6 values. Stable forever.
 */
export const CANONICAL_GRAPH_MAPPING_STATUS = [
  'draft',
  'review',
  'approved',
  'published',
  'deprecated',
  'archived',
] as const;

export type GraphMappingStatus =
  (typeof CANONICAL_GRAPH_MAPPING_STATUS)[number];

// ============================================================================
// D8-OPT-04 — CONCEPT GRAPH CONTRACTS — Immutable readonly domain types
// ============================================================================

/**
 * Provenance metadata for concept graph assessment mapping.
 * Immutable. Readonly. Deterministic.
 */
export interface ConceptGraphProvenance {
  readonly provider: string;
  readonly source: string;
  readonly reviewStatus: GraphMappingStatus;
  readonly reviewDate: string;
  readonly version: string;
  readonly rationale: string;
}

/**
 * Governance decision metadata for concept graph.
 * Immutable. Readonly. Deterministic.
 */
export interface ConceptGraphDecision {
  readonly level: AssessmentGovernanceLevel;
  readonly decidedBy: string;
  readonly decidedAt: string;
  readonly rationale: string;
}

/**
 * Deterministic trace metadata for concept graph.
 * Immutable. Readonly. No random. No time dependency.
 */
export interface ConceptGraphTrace {
  readonly traceId: string;
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_concept_graph_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

/**
 * Reference to a concept node in the knowledge graph.
 * Immutable. Readonly. Deterministic.
 */
export interface ConceptNodeReference {
  readonly id: string;
  readonly title: string;
  readonly nodeType: ConceptNodeType;
  readonly knowledgeGraphId: string;
  readonly knowledgeNodeId: string;
}

/**
 * Represents a deterministic relationship between concept nodes.
 * Immutable. Readonly. Deterministic.
 */
export interface ConceptRelationship {
  readonly id: string;
  readonly sourceConceptId: string;
  readonly targetConceptId: string;
  readonly relationshipType: RelationshipType;
  readonly knowledgeGraphId: string;
  readonly rationale: string;
}

/**
 * Describes how an assessment covers a concept graph.
 * Immutable. Readonly. Deterministic.
 */
export interface AssessmentConceptCoverage {
  readonly id: string;
  readonly coverageType: GraphCoverageType;
  readonly objective: AssessmentGraphObjective;
  readonly conceptNodeIds: readonly string[];
  readonly relationshipIds: readonly string[];
}

/**
 * Represents one governed assessment-concept graph mapping.
 * Immutable. Readonly. Deterministic.
 */
export interface AssessmentConceptGraph {
  readonly id: string;
  readonly title: string;
  readonly knowledgeGraphId: string;
  readonly conceptNodes: readonly ConceptNodeReference[];
  readonly relationships: readonly ConceptRelationship[];
  readonly coverages: readonly AssessmentConceptCoverage[];
  readonly status: GraphMappingStatus;
  readonly governance: AssessmentGovernanceLevel;
  readonly provenance: ConceptGraphProvenance;
  readonly trace: ConceptGraphTrace;
}

/**
 * Single graph coverage entry in a registry.
 * Immutable. Readonly. Deterministic.
 */
export interface GraphCoverageEntry {
  readonly id: string;
  readonly assessmentConceptGraphId: string;
  readonly coverageType: GraphCoverageType;
  readonly objective: AssessmentGraphObjective;
}

/**
 * Registry metadata for concept graph mappings.
 * Immutable. Readonly. Deterministic.
 */
export interface ConceptGraphRegistryMetadata {
  readonly registryId: string;
  readonly version: string;
  readonly nodeCount: number;
  readonly generatedFrom: 'deterministic_concept_graph_kernel';
  readonly deterministic: true;
  readonly randomUsed: false;
  readonly timeDependency: false;
}

/**
 * Complete concept graph registry.
 * Immutable. Readonly. Deterministic.
 */
export interface ConceptGraphRegistry {
  readonly metadata: ConceptGraphRegistryMetadata;
  readonly nodes: readonly AssessmentConceptGraph[];
}

/**
 * Input object accepted by composeConceptGraphRegistryFromInput.
 * Immutable. Readonly.
 */
export interface ConceptGraphInput {
  readonly nodes: readonly AssessmentConceptGraph[];
}

/**
 * Assessment artifact with an associated concept graph mapping.
 * Immutable. Readonly.
 */
export interface AssessmentArtifactWithConceptGraph {
  readonly artifactId: string;
  readonly artifactTitle: string;
  readonly conceptGraph: AssessmentConceptGraph;
}

// ============================================================================
// D8-OPT-04 — CONCEPT GRAPH VALIDATION CONTRACTS — Structured validation types
// ============================================================================

/**
 * Single concept graph validation error.
 * Immutable. Readonly.
 */
export interface ConceptGraphValidationError {
  readonly code: string;
  readonly message: string;
  readonly field?: string;
  readonly entityId?: string;
}

/**
 * Generic concept graph validation result.
 * Immutable. Readonly.
 */
export interface ConceptGraphValidationResult {
  readonly valid: boolean;
  readonly errors: readonly ConceptGraphValidationError[];
  readonly checkedAt: string;
}

/**
 * Concept graph registry-level validation result.
 * Immutable. Readonly.
 */
export interface ConceptGraphRegistryValidationResult {
  readonly valid: boolean;
  readonly errors: readonly ConceptGraphValidationError[];
  readonly nodeResults: readonly ConceptGraphValidationResult[];
  readonly checkedAt: 'concept_graph_registry_validation';
}

/**
 * Concept graph input-level validation result.
 * Immutable. Readonly.
 */
export interface ConceptGraphInputValidationResult {
  readonly valid: boolean;
  readonly errors: readonly ConceptGraphValidationError[];
  readonly checkedAt: 'concept_graph_input_validation';
}

/**
 * Concept graph trace-level validation result.
 * Immutable. Readonly.
 */
export interface ConceptGraphTraceValidationResult {
  readonly valid: boolean;
  readonly errors: readonly ConceptGraphValidationError[];
  readonly checkedAt: 'concept_graph_trace_validation';
}

/**
 * Validation result for an artifact with concept graph mapping.
 * Immutable. Readonly.
 */
export interface AssessmentArtifactWithConceptGraphValidationResult {
  readonly valid: boolean;
  readonly errors: readonly ConceptGraphValidationError[];
  readonly checkedAt: 'artifact_concept_graph_validation';
}

// ============================================================================
// D8-OPT-05 — MISCONCEPTION ENUMS — Immutable constant arrays
// ============================================================================

/**
 * Canonical misconception types.
 * Exactly 10 values. Stable forever.
 */
export const CANONICAL_MISCONCEPTION_TYPES = [
  'concept_confusion',
  'terminology_confusion',
  'dependency_confusion',
  'causal_reasoning',
  'procedural_error',
  'algorithmic_error',
  'architectural_misunderstanding',
  'constraint_violation',
  'overgeneralization',
  'oversimplification',
] as const;

export type MisconceptionType =
  (typeof CANONICAL_MISCONCEPTION_TYPES)[number];

/**
 * Canonical misconception causes.
 * Exactly 10 values. Stable forever.
 */
export const CANONICAL_MISCONCEPTION_CAUSES = [
  'missing_prerequisite',
  'incorrect_assumption',
  'memorization_without_understanding',
  'mental_model_error',
  'terminology_overlap',
  'incorrect_abstraction',
  'missing_relationship',
  'incomplete_reasoning',
  'incorrect_transfer',
  'prior_bias',
] as const;

export type MisconceptionCause =
  (typeof CANONICAL_MISCONCEPTION_CAUSES)[number];

/**
 * Canonical remediation types.
 * Exactly 10 values. Stable forever.
 */
export const CANONICAL_REMEDIATION_TYPES = [
  'concept_review',
  'worked_example',
  'guided_practice',
  'visual_explanation',
  'relationship_review',
  'laboratory_activity',
  'comparison',
  'counter_example',
  'step_by_step_reasoning',
  'knowledge_reconstruction',
] as const;

export type RemediationType =
  (typeof CANONICAL_REMEDIATION_TYPES)[number];

/**
 * Canonical remediation priorities.
 * Exactly 10 values. Stable forever.
 */
export const CANONICAL_REMEDIATION_PRIORITY = [
  'critical',
  'very_high',
  'high',
  'medium',
  'low',
  'optional',
  'preventive',
  'reinforcement',
  'recommended',
  'supplementary',
] as const;

export type RemediationPriority =
  (typeof CANONICAL_REMEDIATION_PRIORITY)[number];

/**
 * Canonical misconception severities.
 * Exactly 5 values. Stable forever.
 */
export const CANONICAL_MISCONCEPTION_SEVERITY = [
  'minimal',
  'minor',
  'moderate',
  'major',
  'critical',
] as const;

export type MisconceptionSeverity =
  (typeof CANONICAL_MISCONCEPTION_SEVERITY)[number];

/**
 * Canonical misconception statuses.
 * Exactly 6 values. Stable forever.
 */
export const CANONICAL_MISCONCEPTION_STATUS = [
  'draft',
  'review',
  'approved',
  'published',
  'deprecated',
  'archived',
] as const;

export type MisconceptionStatus =
  (typeof CANONICAL_MISCONCEPTION_STATUS)[number];

// ============================================================================
// D8-OPT-05 — MISCONCEPTION CONTRACTS — Immutable readonly domain types
// ============================================================================

/**
 * Provenance metadata for misconception modeling.
 * Immutable. Readonly. Deterministic.
 */
export interface MisconceptionProvenance {
  readonly provider: string;
  readonly source: string;
  readonly reviewStatus: MisconceptionStatus;
  readonly reviewDate: string;
  readonly version: string;
  readonly rationale: string;
}

/**
 * Governance decision metadata for misconception.
 * Immutable. Readonly. Deterministic.
 */
export interface MisconceptionDecision {
  readonly level: AssessmentGovernanceLevel;
  readonly decidedBy: string;
  readonly decidedAt: string;
  readonly rationale: string;
}

/**
 * Deterministic trace metadata for misconception.
 * Immutable. Readonly. No random. No time dependency.
 */
export interface MisconceptionTrace {
  readonly traceId: string;
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_misconception_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

/**
 * Represents one assessed misconception.
 * Immutable. Readonly. Deterministic.
 */
export interface AssessmentMisconception {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly misconceptionType: MisconceptionType;
  readonly causes: readonly MisconceptionCause[];
  readonly severity: MisconceptionSeverity;
  readonly conceptIds: readonly string[];
  readonly remediationStrategies: readonly RemediationStrategy[];
  readonly status: MisconceptionStatus;
  readonly governance: AssessmentGovernanceLevel;
  readonly provenance: MisconceptionProvenance;
  readonly trace: MisconceptionTrace;
}

/**
 * Represents a cause of a misconception.
 * Immutable. Readonly. Deterministic.
 */
export interface MisconceptionCauseEntry {
  readonly id: string;
  readonly causeType: MisconceptionCause;
  readonly description: string;
}

/**
 * Represents a remediation strategy for a misconception.
 * Immutable. Readonly. Deterministic.
 */
export interface RemediationStrategy {
  readonly id: string;
  readonly title: string;
  readonly remediationType: RemediationType;
  readonly priority: RemediationPriority;
  readonly description: string;
  readonly conceptIds: readonly string[];
}

/**
 * Represents a deterministic relationship between misconceptions.
 * Immutable. Readonly. Deterministic.
 */
export interface MisconceptionRelationship {
  readonly id: string;
  readonly sourceMisconceptionId: string;
  readonly targetMisconceptionId: string;
  readonly relationshipType: string;
  readonly rationale: string;
}

/**
 * Registry metadata for misconception modeling.
 * Immutable. Readonly. Deterministic.
 */
export interface MisconceptionRegistryMetadata {
  readonly registryId: string;
  readonly version: string;
  readonly nodeCount: number;
  readonly generatedFrom: 'deterministic_misconception_kernel';
  readonly deterministic: true;
  readonly randomUsed: false;
  readonly timeDependency: false;
}

/**
 * Complete misconception registry.
 * Immutable. Readonly. Deterministic.
 */
export interface MisconceptionRegistry {
  readonly metadata: MisconceptionRegistryMetadata;
  readonly nodes: readonly AssessmentMisconception[];
}

/**
 * Input object accepted by composeMisconceptionRegistryFromInput.
 * Immutable. Readonly.
 */
export interface MisconceptionInput {
  readonly nodes: readonly AssessmentMisconception[];
}

/**
 * Assessment artifact with associated misconceptions.
 * Immutable. Readonly.
 */
export interface AssessmentArtifactWithMisconceptions {
  readonly artifactId: string;
  readonly artifactTitle: string;
  readonly misconceptions: readonly AssessmentMisconception[];
}

// ============================================================================
// D8-OPT-05 — MISCONCEPTION VALIDATION CONTRACTS — Structured validation types
// ============================================================================

/**
 * Single misconception validation error.
 * Immutable. Readonly.
 */
export interface MisconceptionValidationError {
  readonly code: string;
  readonly message: string;
  readonly field?: string;
  readonly entityId?: string;
}

/**
 * Generic misconception validation result.
 * Immutable. Readonly.
 */
export interface MisconceptionValidationResult {
  readonly valid: boolean;
  readonly errors: readonly MisconceptionValidationError[];
  readonly checkedAt: string;
}

/**
 * Misconception registry-level validation result.
 * Immutable. Readonly.
 */
export interface MisconceptionRegistryValidationResult {
  readonly valid: boolean;
  readonly errors: readonly MisconceptionValidationError[];
  readonly nodeResults: readonly MisconceptionValidationResult[];
  readonly checkedAt: 'misconception_registry_validation';
}

/**
 * Misconception input-level validation result.
 * Immutable. Readonly.
 */
export interface MisconceptionInputValidationResult {
  readonly valid: boolean;
  readonly errors: readonly MisconceptionValidationError[];
  readonly checkedAt: 'misconception_input_validation';
}

/**
 * Misconception trace-level validation result.
 * Immutable. Readonly.
 */
export interface MisconceptionTraceValidationResult {
  readonly valid: boolean;
  readonly errors: readonly MisconceptionValidationError[];
  readonly checkedAt: 'misconception_trace_validation';
}

/**
 * Validation result for an artifact with misconceptions.
 * Immutable. Readonly.
 */
export interface AssessmentArtifactWithMisconceptionsValidationResult {
  readonly valid: boolean;
  readonly errors: readonly MisconceptionValidationError[];
  readonly checkedAt: 'artifact_misconception_validation';
}

// ============================================================================
// D8-OPT-06 — FEEDBACK ENUMS — Immutable constant arrays
// ============================================================================

/**
 * Canonical feedback types.
 * Exactly 10 values. Stable forever.
 */
export const CANONICAL_FEEDBACK_TYPES = [
  'correct_answer',
  'incorrect_answer',
  'partially_correct',
  'conceptual_explanation',
  'reasoning_guidance',
  'engineering_explanation',
  'comparison',
  'reinforcement',
  'reflection',
  'next_step',
] as const;

export type FeedbackType = (typeof CANONICAL_FEEDBACK_TYPES)[number];

/**
 * Canonical feedback objectives.
 * Exactly 10 values. Stable forever.
 */
export const CANONICAL_FEEDBACK_OBJECTIVES = [
  'clarification',
  'concept_reinforcement',
  'relationship_reinforcement',
  'reasoning_support',
  'misconception_remediation',
  'engineering_understanding',
  'concept_connection',
  'reflection',
  'motivation',
  'knowledge_consolidation',
] as const;

export type FeedbackObjective =
  (typeof CANONICAL_FEEDBACK_OBJECTIVES)[number];

/**
 * Canonical feedback tones.
 * Exactly 10 values. Stable forever.
 */
export const CANONICAL_FEEDBACK_TONES = [
  'neutral',
  'supportive',
  'instructional',
  'encouraging',
  'analytical',
  'technical',
  'reflective',
  'motivational',
  'corrective',
  'exploratory',
] as const;

export type FeedbackTone = (typeof CANONICAL_FEEDBACK_TONES)[number];

/**
 * Canonical feedback delivery types.
 * Exactly 10 values. Stable forever.
 */
export const CANONICAL_FEEDBACK_DELIVERY_TYPES = [
  'text',
  'visual',
  'concept_graph',
  'comparison_table',
  'diagram_reference',
  'laboratory_reference',
  'knowledge_reference',
  'application_reference',
  'reflection_prompt',
  'resource_reference',
] as const;

export type FeedbackDeliveryType =
  (typeof CANONICAL_FEEDBACK_DELIVERY_TYPES)[number];

/**
 * Canonical feedback priorities.
 * Exactly 5 values. Stable forever.
 */
export const CANONICAL_FEEDBACK_PRIORITY = [
  'critical',
  'high',
  'medium',
  'low',
  'optional',
] as const;

export type FeedbackPriority =
  (typeof CANONICAL_FEEDBACK_PRIORITY)[number];

/**
 * Canonical feedback statuses.
 * Exactly 6 values. Stable forever.
 */
export const CANONICAL_FEEDBACK_STATUS = [
  'draft',
  'review',
  'approved',
  'published',
  'deprecated',
  'archived',
] as const;

export type FeedbackStatus = (typeof CANONICAL_FEEDBACK_STATUS)[number];

// ============================================================================
// D8-OPT-06 — FEEDBACK CONTRACTS — Immutable readonly domain types
// ============================================================================

/**
 * Provenance metadata for feedback.
 * Immutable. Readonly. Deterministic.
 */
export interface FeedbackProvenance {
  readonly provider: string;
  readonly source: string;
  readonly reviewStatus: FeedbackStatus;
  readonly reviewDate: string;
  readonly version: string;
  readonly rationale: string;
}

/**
 * Governance decision metadata for feedback.
 * Immutable. Readonly. Deterministic.
 */
export interface FeedbackDecision {
  readonly level: AssessmentGovernanceLevel;
  readonly decidedBy: string;
  readonly decidedAt: string;
  readonly rationale: string;
}

/**
 * Deterministic trace metadata for feedback.
 * Immutable. Readonly. No random. No time dependency.
 */
export interface FeedbackTrace {
  readonly traceId: string;
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_feedback_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

/**
 * Represents one governed assessment feedback.
 * Immutable. Readonly. Deterministic.
 */
export interface AssessmentFeedback {
  readonly id: string;
  readonly title: string;
  readonly feedbackType: FeedbackType;
  readonly objective: FeedbackObjective;
  readonly tone: FeedbackTone;
  readonly deliveryType: FeedbackDeliveryType;
  readonly content: string;
  readonly explanation: FeedbackExplanation;
  readonly references: readonly FeedbackReference[];
  readonly conceptIds: readonly string[];
  readonly priority: FeedbackPriority;
  readonly status: FeedbackStatus;
  readonly governance: AssessmentGovernanceLevel;
  readonly provenance: FeedbackProvenance;
  readonly trace: FeedbackTrace;
}

/**
 * Explanatory content within feedback.
 * Immutable. Readonly. Deterministic.
 */
export interface FeedbackExplanation {
  readonly id: string;
  readonly explanationType: string;
  readonly rationale: string;
  readonly conceptualBasis: string;
}

/**
 * Reference to external knowledge or application.
 * Immutable. Readonly. Deterministic.
 */
export interface FeedbackReference {
  readonly id: string;
  readonly referenceType: string;
  readonly referenceId: string;
  readonly description: string;
}

/**
 * Represents a deterministic link between feedback items.
 * Immutable. Readonly. Deterministic.
 */
export interface FeedbackRelationship {
  readonly id: string;
  readonly sourceFeedbackId: string;
  readonly targetFeedbackId: string;
  readonly relationshipType: string;
  readonly rationale: string;
}

/**
 * Registry metadata for feedback.
 * Immutable. Readonly. Deterministic.
 */
export interface FeedbackRegistryMetadata {
  readonly registryId: string;
  readonly version: string;
  readonly nodeCount: number;
  readonly generatedFrom: 'deterministic_feedback_kernel';
  readonly deterministic: true;
  readonly randomUsed: false;
  readonly timeDependency: false;
}

/**
 * Complete feedback registry.
 * Immutable. Readonly. Deterministic.
 */
export interface FeedbackRegistry {
  readonly metadata: FeedbackRegistryMetadata;
  readonly nodes: readonly AssessmentFeedback[];
}

/**
 * Input object accepted by composeFeedbackRegistryFromInput.
 * Immutable. Readonly.
 */
export interface FeedbackInput {
  readonly nodes: readonly AssessmentFeedback[];
}

/**
 * Assessment artifact with associated feedback.
 * Immutable. Readonly.
 */
export interface AssessmentArtifactWithFeedback {
  readonly artifactId: string;
  readonly artifactTitle: string;
  readonly feedback: readonly AssessmentFeedback[];
}

// ============================================================================
// D8-OPT-06 — FEEDBACK VALIDATION CONTRACTS — Structured validation types
// ============================================================================

/**
 * Single feedback validation error.
 * Immutable. Readonly.
 */
export interface FeedbackValidationError {
  readonly code: string;
  readonly message: string;
  readonly field?: string;
  readonly entityId?: string;
}

/**
 * Generic feedback validation result.
 * Immutable. Readonly.
 */
export interface FeedbackValidationResult {
  readonly valid: boolean;
  readonly errors: readonly FeedbackValidationError[];
  readonly checkedAt: string;
}

/**
 * Feedback registry-level validation result.
 * Immutable. Readonly.
 */
export interface FeedbackRegistryValidationResult {
  readonly valid: boolean;
  readonly errors: readonly FeedbackValidationError[];
  readonly nodeResults: readonly FeedbackValidationResult[];
  readonly checkedAt: 'feedback_registry_validation';
}

/**
 * Feedback input-level validation result.
 * Immutable. Readonly.
 */
export interface FeedbackInputValidationResult {
  readonly valid: boolean;
  readonly errors: readonly FeedbackValidationError[];
  readonly checkedAt: 'feedback_input_validation';
}

/**
 * Feedback trace-level validation result.
 * Immutable. Readonly.
 */
export interface FeedbackTraceValidationResult {
  readonly valid: boolean;
  readonly errors: readonly FeedbackValidationError[];
  readonly checkedAt: 'feedback_trace_validation';
}

/**
 * Validation result for an artifact with feedback.
 * Immutable. Readonly.
 */
export interface AssessmentArtifactWithFeedbackValidationResult {
  readonly valid: boolean;
  readonly errors: readonly FeedbackValidationError[];
  readonly checkedAt: 'artifact_feedback_validation';
}

// ============================================================================
// D8-OPT-07 — LABORATORY ASSESSMENT ENUMS — Immutable constant arrays
// ============================================================================

/**
 * Canonical laboratory assessment types.
 * Exactly 10 values. Stable forever.
 */
export const CANONICAL_LAB_ASSESSMENT_TYPES = [
  'pre_lab',
  'guided_lab',
  'verification_lab',
  'engineering_lab',
  'experimental_lab',
  'observation_lab',
  'integration_lab',
  'capstone_lab',
  'validation_lab',
  'portfolio_lab',
] as const;

export type LaboratoryAssessmentType =
  (typeof CANONICAL_LAB_ASSESSMENT_TYPES)[number];

/**
 * Canonical laboratory objective types.
 * Exactly 10 values. Stable forever.
 */
export const CANONICAL_LAB_OBJECTIVE_TYPES = [
  'concept_validation',
  'implementation',
  'engineering_reasoning',
  'system_understanding',
  'algorithm_validation',
  'workflow_validation',
  'architecture_validation',
  'evidence_collection',
  'competency_verification',
  'mastery_demonstration',
] as const;

export type LaboratoryObjectiveType =
  (typeof CANONICAL_LAB_OBJECTIVE_TYPES)[number];

/**
 * Canonical laboratory evidence types.
 * Exactly 10 values. Stable forever.
 */
export const CANONICAL_LAB_EVIDENCE_TYPES = [
  'execution_log',
  'measurement',
  'output_artifact',
  'code_submission',
  'visual_output',
  'observation_note',
  'performance_metric',
  'engineering_report',
  'experiment_record',
  'reflection',
] as const;

export type LaboratoryEvidenceType =
  (typeof CANONICAL_LAB_EVIDENCE_TYPES)[number];

/**
 * Canonical laboratory mapping types.
 * Exactly 10 values. Stable forever.
 */
export const CANONICAL_LAB_MAPPING_TYPES = [
  'mandatory',
  'recommended',
  'optional',
  'alternative',
  'follow_up',
  'prerequisite',
  'parallel',
  'reinforcement',
  'capstone',
  'portfolio',
] as const;

export type LaboratoryMappingType =
  (typeof CANONICAL_LAB_MAPPING_TYPES)[number];

/**
 * Canonical laboratory assessment statuses.
 * Exactly 6 values. Stable forever.
 */
export const CANONICAL_LAB_ASSESSMENT_STATUS = [
  'draft',
  'review',
  'approved',
  'published',
  'deprecated',
  'archived',
] as const;

export type LaboratoryAssessmentStatus =
  (typeof CANONICAL_LAB_ASSESSMENT_STATUS)[number];

// ============================================================================
// D8-OPT-07 — LABORATORY ASSESSMENT CONTRACTS — Immutable readonly domain types
// ============================================================================

/**
 * Provenance metadata for laboratory assessment integration.
 * Immutable. Readonly. Deterministic.
 */
export interface LaboratoryAssessmentProvenance {
  readonly provider: string;
  readonly source: string;
  readonly reviewStatus: LaboratoryAssessmentStatus;
  readonly reviewDate: string;
  readonly version: string;
  readonly rationale: string;
}

/**
 * Governance decision metadata for laboratory assessment.
 * Immutable. Readonly. Deterministic.
 */
export interface LaboratoryAssessmentDecision {
  readonly level: AssessmentGovernanceLevel;
  readonly decidedBy: string;
  readonly decidedAt: string;
  readonly rationale: string;
}

/**
 * Deterministic trace metadata for laboratory assessment.
 * Immutable. Readonly. No random. No time dependency.
 */
export interface LaboratoryAssessmentTrace {
  readonly traceId: string;
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_laboratory_assessment_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

/**
 * Reference to laboratory evidence.
 * Immutable. Readonly. Deterministic.
 */
export interface LaboratoryEvidenceReference {
  readonly id: string;
  readonly evidenceType: LaboratoryEvidenceType;
  readonly laboratoryActivityId: string;
  readonly description: string;
}

/**
 * Represents a laboratory objective.
 * Immutable. Readonly. Deterministic.
 */
export interface LaboratoryObjective {
  readonly id: string;
  readonly objectiveType: LaboratoryObjectiveType;
  readonly description: string;
  readonly conceptIds: readonly string[];
}

/**
 * Represents a governed assessment-to-laboratory integration.
 * Immutable. Readonly. Deterministic.
 */
export interface AssessmentLaboratoryIntegration {
  readonly id: string;
  readonly title: string;
  readonly labAssessmentType: LaboratoryAssessmentType;
  readonly mappingType: LaboratoryMappingType;
  readonly laboratoryActivityId: string;
  readonly objectives: readonly LaboratoryObjective[];
  readonly evidenceReferences: readonly LaboratoryEvidenceReference[];
  readonly conceptIds: readonly string[];
  readonly status: LaboratoryAssessmentStatus;
  readonly governance: AssessmentGovernanceLevel;
  readonly provenance: LaboratoryAssessmentProvenance;
  readonly trace: LaboratoryAssessmentTrace;
}

/**
 * Represents a deterministic link between laboratory integrations.
 * Immutable. Readonly. Deterministic.
 */
export interface LaboratoryAssessmentRelationship {
  readonly id: string;
  readonly sourceIntegrationId: string;
  readonly targetIntegrationId: string;
  readonly relationshipType: string;
  readonly rationale: string;
}

/**
 * Registry metadata for laboratory assessment integrations.
 * Immutable. Readonly. Deterministic.
 */
export interface LaboratoryAssessmentRegistryMetadata {
  readonly registryId: string;
  readonly version: string;
  readonly nodeCount: number;
  readonly generatedFrom: 'deterministic_laboratory_assessment_kernel';
  readonly deterministic: true;
  readonly randomUsed: false;
  readonly timeDependency: false;
}

/**
 * Complete laboratory assessment registry.
 * Immutable. Readonly. Deterministic.
 */
export interface LaboratoryAssessmentRegistry {
  readonly metadata: LaboratoryAssessmentRegistryMetadata;
  readonly nodes: readonly AssessmentLaboratoryIntegration[];
}

/**
 * Input object accepted by composeLaboratoryAssessmentRegistryFromInput.
 * Immutable. Readonly.
 */
export interface LaboratoryAssessmentInput {
  readonly nodes: readonly AssessmentLaboratoryIntegration[];
}

/**
 * Assessment artifact with associated laboratory integrations.
 * Immutable. Readonly.
 */
export interface AssessmentArtifactWithLaboratories {
  readonly artifactId: string;
  readonly artifactTitle: string;
  readonly laboratories: readonly AssessmentLaboratoryIntegration[];
}

// ============================================================================
// D8-OPT-07 — LABORATORY ASSESSMENT VALIDATION CONTRACTS
// ============================================================================

/**
 * Single laboratory assessment validation error.
 * Immutable. Readonly.
 */
export interface LaboratoryAssessmentValidationError {
  readonly code: string;
  readonly message: string;
  readonly field?: string;
  readonly entityId?: string;
}

/**
 * Generic laboratory assessment validation result.
 * Immutable. Readonly.
 */
export interface LaboratoryAssessmentValidationResult {
  readonly valid: boolean;
  readonly errors: readonly LaboratoryAssessmentValidationError[];
  readonly checkedAt: string;
}

/**
 * Laboratory assessment registry-level validation result.
 * Immutable. Readonly.
 */
export interface LaboratoryAssessmentRegistryValidationResult {
  readonly valid: boolean;
  readonly errors: readonly LaboratoryAssessmentValidationError[];
  readonly nodeResults: readonly LaboratoryAssessmentValidationResult[];
  readonly checkedAt: 'laboratory_assessment_registry_validation';
}

/**
 * Laboratory assessment input-level validation result.
 * Immutable. Readonly.
 */
export interface LaboratoryAssessmentInputValidationResult {
  readonly valid: boolean;
  readonly errors: readonly LaboratoryAssessmentValidationError[];
  readonly checkedAt: 'laboratory_assessment_input_validation';
}

/**
 * Laboratory assessment trace-level validation result.
 * Immutable. Readonly.
 */
export interface LaboratoryAssessmentTraceValidationResult {
  readonly valid: boolean;
  readonly errors: readonly LaboratoryAssessmentValidationError[];
  readonly checkedAt: 'laboratory_assessment_trace_validation';
}

/**
 * Validation result for an artifact with laboratory integrations.
 * Immutable. Readonly.
 */
export interface AssessmentArtifactWithLaboratoriesValidationResult {
  readonly valid: boolean;
  readonly errors: readonly LaboratoryAssessmentValidationError[];
  readonly checkedAt: 'artifact_laboratory_validation';
}

// ============================================================================
// D8-OPT-08 — VISUAL ASSESSMENT ENUMS — Immutable constant arrays
// ============================================================================

/**
 * Canonical visual assessment types.
 * Exactly 10 values. Stable forever.
 */
export const CANONICAL_VISUAL_ASSESSMENT_TYPES = [
  'image_question',
  'diagram_question',
  'architecture_analysis',
  'pipeline_analysis',
  'graph_interpretation',
  'visual_comparison',
  'annotation',
  'heatmap_analysis',
  'workflow_identification',
  'multimodal_case',
] as const;

export type VisualAssessmentType =
  (typeof CANONICAL_VISUAL_ASSESSMENT_TYPES)[number];

/**
 * Canonical visual resource types.
 * Exactly 10 values. Stable forever.
 */
export const CANONICAL_VISUAL_RESOURCE_TYPES = [
  'image',
  'diagram',
  'flowchart',
  'architecture',
  'graph',
  'chart',
  'heatmap',
  'illustration',
  'animation',
  'video',
] as const;

export type VisualResourceType =
  (typeof CANONICAL_VISUAL_RESOURCE_TYPES)[number];

/**
 * Canonical visual task types.
 * Exactly 10 values. Stable forever.
 */
export const CANONICAL_VISUAL_TASK_TYPES = [
  'identify',
  'classify',
  'compare',
  'annotate',
  'interpret',
  'sequence',
  'locate',
  'analyze',
  'reason',
  'justify',
] as const;

export type VisualTaskType = (typeof CANONICAL_VISUAL_TASK_TYPES)[number];

/**
 * Canonical multimodal evidence types.
 * Exactly 10 values. Stable forever.
 */
export const CANONICAL_MULTIMODAL_EVIDENCE_TYPES = [
  'visual_selection',
  'annotation',
  'written_explanation',
  'diagram_relationship',
  'architecture_mapping',
  'comparison',
  'reasoning',
  'workflow_identification',
  'engineering_analysis',
  'reflection',
] as const;

export type MultimodalEvidenceType =
  (typeof CANONICAL_MULTIMODAL_EVIDENCE_TYPES)[number];

/**
 * Canonical visual governance levels.
 * Exactly 5 values. Stable forever.
 */
export const CANONICAL_VISUAL_GOVERNANCE_LEVELS = [
  'canonical',
  'approved',
  'review',
  'provisional',
  'deprecated',
] as const;

export type VisualGovernanceLevel =
  (typeof CANONICAL_VISUAL_GOVERNANCE_LEVELS)[number];

/**
 * Canonical visual assessment statuses.
 * Exactly 6 values. Stable forever.
 */
export const CANONICAL_VISUAL_ASSESSMENT_STATUS = [
  'draft',
  'review',
  'approved',
  'published',
  'deprecated',
  'archived',
] as const;

export type VisualAssessmentStatus =
  (typeof CANONICAL_VISUAL_ASSESSMENT_STATUS)[number];

// ============================================================================
// D8-OPT-08 — VISUAL ASSESSMENT CONTRACTS — Immutable readonly domain types
// ============================================================================

/**
 * Provenance metadata for visual assessment.
 * Immutable. Readonly. Deterministic.
 */
export interface VisualAssessmentProvenance {
  readonly provider: string;
  readonly source: string;
  readonly reviewStatus: VisualAssessmentStatus;
  readonly reviewDate: string;
  readonly version: string;
  readonly rationale: string;
}

/**
 * Governance decision metadata for visual assessment.
 * Immutable. Readonly. Deterministic.
 */
export interface VisualAssessmentDecision {
  readonly level: VisualGovernanceLevel;
  readonly decidedBy: string;
  readonly decidedAt: string;
  readonly rationale: string;
}

/**
 * Deterministic trace metadata for visual assessment.
 * Immutable. Readonly. No random. No time dependency.
 */
export interface VisualAssessmentTrace {
  readonly traceId: string;
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_visual_assessment_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

/**
 * Reference to a visual resource.
 * Immutable. Readonly. Deterministic.
 */
export interface VisualAssessmentReference {
  readonly id: string;
  readonly resourceType: VisualResourceType;
  readonly resourceUri: string;
  readonly description: string;
}

/**
 * Represents a visual assessment task.
 * Immutable. Readonly. Deterministic.
 */
export interface VisualAssessmentTask {
  readonly id: string;
  readonly taskType: VisualTaskType;
  readonly description: string;
  readonly conceptIds: readonly string[];
}

/**
 * Represents multimodal evidence.
 * Immutable. Readonly. Deterministic.
 */
export interface MultimodalEvidence {
  readonly id: string;
  readonly evidenceType: MultimodalEvidenceType;
  readonly description: string;
}

/**
 * Represents one governed visual assessment artifact.
 * Immutable. Readonly. Deterministic.
 */
export interface AssessmentVisualArtifact {
  readonly id: string;
  readonly title: string;
  readonly visualAssessmentType: VisualAssessmentType;
  readonly visualReferences: readonly VisualAssessmentReference[];
  readonly tasks: readonly VisualAssessmentTask[];
  readonly evidence: readonly MultimodalEvidence[];
  readonly conceptIds: readonly string[];
  readonly status: VisualAssessmentStatus;
  readonly governance: VisualGovernanceLevel;
  readonly provenance: VisualAssessmentProvenance;
  readonly trace: VisualAssessmentTrace;
}

/**
 * Represents a deterministic link between visual artifacts.
 * Immutable. Readonly. Deterministic.
 */
export interface VisualAssessmentRelationship {
  readonly id: string;
  readonly sourceArtifactId: string;
  readonly targetArtifactId: string;
  readonly relationshipType: string;
  readonly rationale: string;
}

/**
 * Registry metadata for visual assessments.
 * Immutable. Readonly. Deterministic.
 */
export interface VisualAssessmentRegistryMetadata {
  readonly registryId: string;
  readonly version: string;
  readonly nodeCount: number;
  readonly generatedFrom: 'deterministic_visual_assessment_kernel';
  readonly deterministic: true;
  readonly randomUsed: false;
  readonly timeDependency: false;
}

/**
 * Complete visual assessment registry.
 * Immutable. Readonly. Deterministic.
 */
export interface VisualAssessmentRegistry {
  readonly metadata: VisualAssessmentRegistryMetadata;
  readonly nodes: readonly AssessmentVisualArtifact[];
}

/**
 * Input object accepted by composeVisualAssessmentRegistryFromInput.
 * Immutable. Readonly.
 */
export interface VisualAssessmentInput {
  readonly nodes: readonly AssessmentVisualArtifact[];
}

/**
 * Assessment artifact with associated visual assets.
 * Immutable. Readonly.
 */
export interface AssessmentArtifactWithVisualAssets {
  readonly artifactId: string;
  readonly artifactTitle: string;
  readonly visualAssets: readonly AssessmentVisualArtifact[];
}

// ============================================================================
// D8-OPT-08 — VISUAL ASSESSMENT VALIDATION CONTRACTS
// ============================================================================

/**
 * Single visual assessment validation error.
 * Immutable. Readonly.
 */
export interface VisualAssessmentValidationError {
  readonly code: string;
  readonly message: string;
  readonly field?: string;
  readonly entityId?: string;
}

/**
 * Generic visual assessment validation result.
 * Immutable. Readonly.
 */
export interface VisualAssessmentValidationResult {
  readonly valid: boolean;
  readonly errors: readonly VisualAssessmentValidationError[];
  readonly checkedAt: string;
}

/**
 * Visual assessment registry-level validation result.
 * Immutable. Readonly.
 */
export interface VisualAssessmentRegistryValidationResult {
  readonly valid: boolean;
  readonly errors: readonly VisualAssessmentValidationError[];
  readonly nodeResults: readonly VisualAssessmentValidationResult[];
  readonly checkedAt: 'visual_assessment_registry_validation';
}

/**
 * Visual assessment input-level validation result.
 * Immutable. Readonly.
 */
export interface VisualAssessmentInputValidationResult {
  readonly valid: boolean;
  readonly errors: readonly VisualAssessmentValidationError[];
  readonly checkedAt: 'visual_assessment_input_validation';
}

/**
 * Visual assessment trace-level validation result.
 * Immutable. Readonly.
 */
export interface VisualAssessmentTraceValidationResult {
  readonly valid: boolean;
  readonly errors: readonly VisualAssessmentValidationError[];
  readonly checkedAt: 'visual_assessment_trace_validation';
}

/**
 * Validation result for an artifact with visual assets.
 * Immutable. Readonly.
 */
export interface AssessmentArtifactWithVisualAssetsValidationResult {
  readonly valid: boolean;
  readonly errors: readonly VisualAssessmentValidationError[];
  readonly checkedAt: 'artifact_visual_validation';
}

// ============================================================================
// D8-OPT-09 — ENGINEERING CASE ENUMS — Immutable constant arrays
// ============================================================================

/**
 * Canonical engineering case types.
 * Exactly 10 values. Stable forever.
 */
export const CANONICAL_ENGINEERING_CASE_TYPES = [
  'system_design',
  'architecture_review',
  'deployment_case',
  'production_incident',
  'performance_analysis',
  'failure_analysis',
  'ml_pipeline',
  'computer_vision_case',
  'edge_ai_case',
  'research_case',
] as const;

export type EngineeringCaseType =
  (typeof CANONICAL_ENGINEERING_CASE_TYPES)[number];

/**
 * Canonical engineering decision types.
 * Exactly 10 values. Stable forever.
 */
export const CANONICAL_ENGINEERING_DECISION_TYPES = [
  'architecture',
  'algorithm',
  'infrastructure',
  'deployment',
  'optimization',
  'trade_off',
  'constraint',
  'technology_selection',
  'validation',
  'monitoring',
] as const;

export type EngineeringDecisionType =
  (typeof CANONICAL_ENGINEERING_DECISION_TYPES)[number];

/**
 * Canonical engineering constraint types.
 * Exactly 10 values. Stable forever.
 */
export const CANONICAL_ENGINEERING_CONSTRAINT_TYPES = [
  'latency',
  'memory',
  'compute',
  'bandwidth',
  'energy',
  'cost',
  'scalability',
  'maintainability',
  'security',
  'reliability',
] as const;

export type EngineeringConstraintType =
  (typeof CANONICAL_ENGINEERING_CONSTRAINT_TYPES)[number];

/**
 * Canonical engineering evidence types.
 * Exactly 10 values. Stable forever.
 */
export const CANONICAL_ENGINEERING_EVIDENCE_TYPES = [
  'architecture',
  'benchmark',
  'metric',
  'experiment',
  'reasoning',
  'trade_off',
  'diagram',
  'deployment',
  'validation',
  'report',
] as const;

export type EngineeringEvidenceType =
  (typeof CANONICAL_ENGINEERING_EVIDENCE_TYPES)[number];

/**
 * Canonical engineering case statuses.
 * Exactly 6 values. Stable forever.
 */
export const CANONICAL_ENGINEERING_CASE_STATUS = [
  'draft',
  'review',
  'approved',
  'published',
  'deprecated',
  'archived',
] as const;

export type EngineeringCaseStatus =
  (typeof CANONICAL_ENGINEERING_CASE_STATUS)[number];

// ============================================================================
// D8-OPT-09 — ENGINEERING CASE CONTRACTS — Immutable readonly domain types
// ============================================================================

/**
 * Provenance metadata for engineering case assessment.
 * Immutable. Readonly. Deterministic.
 */
export interface EngineeringCaseAssessmentProvenance {
  readonly provider: string;
  readonly source: string;
  readonly reviewStatus: EngineeringCaseStatus;
  readonly reviewDate: string;
  readonly version: string;
  readonly rationale: string;
}

/**
 * Governance decision metadata for engineering case assessment.
 * Immutable. Readonly. Deterministic.
 */
export interface EngineeringCaseAssessmentDecision {
  readonly level: AssessmentGovernanceLevel;
  readonly decidedBy: string;
  readonly decidedAt: string;
  readonly rationale: string;
}

/**
 * Deterministic trace metadata for engineering case assessment.
 * Immutable. Readonly. No random. No time dependency.
 */
export interface EngineeringCaseAssessmentTrace {
  readonly traceId: string;
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_engineering_case_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

/**
 * Reference to an engineering decision.
 * Immutable. Readonly. Deterministic.
 */
export interface EngineeringDecisionReference {
  readonly id: string;
  readonly decisionType: EngineeringDecisionType;
  readonly description: string;
}

/**
 * Represents an engineering constraint.
 * Immutable. Readonly. Deterministic.
 */
export interface EngineeringConstraint {
  readonly id: string;
  readonly constraintType: EngineeringConstraintType;
  readonly description: string;
  readonly severity: string;
}

/**
 * Represents engineering evidence.
 * Immutable. Readonly. Deterministic.
 */
export interface EngineeringEvidence {
  readonly id: string;
  readonly evidenceType: EngineeringEvidenceType;
  readonly description: string;
}

/**
 * Represents one governed engineering case study assessment.
 * Immutable. Readonly. Deterministic.
 */
export interface EngineeringCaseAssessment {
  readonly id: string;
  readonly title: string;
  readonly caseType: EngineeringCaseType;
  readonly scenario: string;
  readonly decisions: readonly EngineeringDecisionReference[];
  readonly constraints: readonly EngineeringConstraint[];
  readonly evidence: readonly EngineeringEvidence[];
  readonly conceptIds: readonly string[];
  readonly status: EngineeringCaseStatus;
  readonly governance: AssessmentGovernanceLevel;
  readonly provenance: EngineeringCaseAssessmentProvenance;
  readonly trace: EngineeringCaseAssessmentTrace;
}

/**
 * Represents a deterministic link between engineering cases.
 * Immutable. Readonly. Deterministic.
 */
export interface EngineeringCaseRelationship {
  readonly id: string;
  readonly sourceCaseId: string;
  readonly targetCaseId: string;
  readonly relationshipType: string;
  readonly rationale: string;
}

/**
 * Registry metadata for engineering case assessments.
 * Immutable. Readonly. Deterministic.
 */
export interface EngineeringCaseRegistryMetadata {
  readonly registryId: string;
  readonly version: string;
  readonly nodeCount: number;
  readonly generatedFrom: 'deterministic_engineering_case_kernel';
  readonly deterministic: true;
  readonly randomUsed: false;
  readonly timeDependency: false;
}

/**
 * Complete engineering case registry.
 * Immutable. Readonly. Deterministic.
 */
export interface EngineeringCaseRegistry {
  readonly metadata: EngineeringCaseRegistryMetadata;
  readonly nodes: readonly EngineeringCaseAssessment[];
}

/**
 * Input object accepted by composeEngineeringCaseRegistryFromInput.
 * Immutable. Readonly.
 */
export interface EngineeringCaseInput {
  readonly nodes: readonly EngineeringCaseAssessment[];
}

/**
 * Assessment artifact with associated engineering cases.
 * Immutable. Readonly.
 */
export interface AssessmentArtifactWithEngineeringCases {
  readonly artifactId: string;
  readonly artifactTitle: string;
  readonly engineeringCases: readonly EngineeringCaseAssessment[];
}

// ============================================================================
// D8-OPT-09 — ENGINEERING CASE VALIDATION CONTRACTS
// ============================================================================

/**
 * Single engineering case validation error.
 * Immutable. Readonly.
 */
export interface EngineeringCaseValidationError {
  readonly code: string;
  readonly message: string;
  readonly field?: string;
  readonly entityId?: string;
}

/**
 * Generic engineering case validation result.
 * Immutable. Readonly.
 */
export interface EngineeringCaseValidationResult {
  readonly valid: boolean;
  readonly errors: readonly EngineeringCaseValidationError[];
  readonly checkedAt: string;
}

/**
 * Engineering case registry-level validation result.
 * Immutable. Readonly.
 */
export interface EngineeringCaseRegistryValidationResult {
  readonly valid: boolean;
  readonly errors: readonly EngineeringCaseValidationError[];
  readonly nodeResults: readonly EngineeringCaseValidationResult[];
  readonly checkedAt: 'engineering_case_registry_validation';
}

/**
 * Engineering case input-level validation result.
 * Immutable. Readonly.
 */
export interface EngineeringCaseInputValidationResult {
  readonly valid: boolean;
  readonly errors: readonly EngineeringCaseValidationError[];
  readonly checkedAt: 'engineering_case_input_validation';
}

/**
 * Engineering case trace-level validation result.
 * Immutable. Readonly.
 */
export interface EngineeringCaseTraceValidationResult {
  readonly valid: boolean;
  readonly errors: readonly EngineeringCaseValidationError[];
  readonly checkedAt: 'engineering_case_trace_validation';
}

/**
 * Validation result for an artifact with engineering cases.
 * Immutable. Readonly.
 */
export interface AssessmentArtifactWithEngineeringCasesValidationResult {
  readonly valid: boolean;
  readonly errors: readonly EngineeringCaseValidationError[];
  readonly checkedAt: 'artifact_engineering_case_validation';
}

// ============================================================================
// D8-OPT-10 — COMPARISON ENUMS — Immutable constant arrays
// ============================================================================

/**
 * Canonical comparison reasoning types.
 * Exactly 10 values. Stable forever.
 */
export const CANONICAL_COMPARISON_REASONING_TYPES = [
  'factual',
  'conceptual',
  'procedural',
  'analytical',
  'comparative',
  'causal',
  'diagnostic',
  'engineering',
  'critical',
  'reflective',
] as const;

export type ComparisonReasoningType =
  (typeof CANONICAL_COMPARISON_REASONING_TYPES)[number];

/**
 * Canonical comparison dimensions.
 * Exactly 10 values. Stable forever.
 */
export const CANONICAL_COMPARISON_DIMENSIONS = [
  'performance',
  'cost',
  'scalability',
  'maintainability',
  'security',
  'reliability',
  'complexity',
  'flexibility',
  'latency',
  'throughput',
] as const;

export type ComparisonDimension =
  (typeof CANONICAL_COMPARISON_DIMENSIONS)[number];

/**
 * Canonical trade-off types.
 * Exactly 10 values. Stable forever.
 */
export const CANONICAL_TRADE_OFF_TYPES = [
  'performance_cost',
  'scalability_complexity',
  'security_performance',
  'latency_throughput',
  'reliability_cost',
  'maintainability_speed',
  'flexibility_reliability',
  'coverage_depth',
  'automation_control',
  'consistency_flexibility',
] as const;

export type TradeOffType = (typeof CANONICAL_TRADE_OFF_TYPES)[number];

/**
 * Canonical decision context types.
 * Exactly 10 values. Stable forever.
 */
export const CANONICAL_DECISION_CONTEXT_TYPES = [
  'architecture_selection',
  'technology_choice',
  'deployment_strategy',
  'optimization_approach',
  'trade_off_analysis',
  'constraint_resolution',
  'risk_assessment',
  'quality_evaluation',
  'cost_benefit',
  'feasibility_study',
] as const;

export type DecisionContextType =
  (typeof CANONICAL_DECISION_CONTEXT_TYPES)[number];

/**
 * Canonical comparative assessment statuses.
 * Exactly 6 values. Stable forever.
 */
export const CANONICAL_COMPARATIVE_ASSESSMENT_STATUS = [
  'draft',
  'review',
  'approved',
  'published',
  'deprecated',
  'archived',
] as const;

export type ComparativeAssessmentStatus =
  (typeof CANONICAL_COMPARATIVE_ASSESSMENT_STATUS)[number];

// ============================================================================
// D8-OPT-10 — COMPARISON CONTRACTS — Immutable readonly domain types
// ============================================================================

/**
 * Provenance metadata for comparative assessment.
 * Immutable. Readonly. Deterministic.
 */
export interface ComparisonAssessmentProvenance {
  readonly provider: string;
  readonly source: string;
  readonly reviewStatus: ComparativeAssessmentStatus;
  readonly reviewDate: string;
  readonly version: string;
  readonly rationale: string;
}

/**
 * Governance decision metadata for comparative assessment.
 * Immutable. Readonly. Deterministic.
 */
export interface ComparisonAssessmentDecision {
  readonly level: AssessmentGovernanceLevel;
  readonly decidedBy: string;
  readonly decidedAt: string;
  readonly rationale: string;
}

/**
 * Deterministic trace metadata for comparative assessment.
 * Immutable. Readonly. No random. No time dependency.
 */
export interface ComparisonAssessmentTrace {
  readonly traceId: string;
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_comparison_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

/**
 * Represents a comparison dimension.
 * Immutable. Readonly. Deterministic.
 */
export interface ComparisonDimensionEntry {
  readonly id: string;
  readonly dimension: ComparisonDimension;
  readonly description: string;
}

/**
 * Represents a trade-off evaluation.
 * Immutable. Readonly. Deterministic.
 */
export interface TradeOffEvaluation {
  readonly id: string;
  readonly tradeOffType: TradeOffType;
  readonly description: string;
}

/**
 * Represents a decision context.
 * Immutable. Readonly. Deterministic.
 */
export interface DecisionContext {
  readonly id: string;
  readonly contextType: DecisionContextType;
  readonly description: string;
}

/**
 * Represents one governed comparative assessment.
 * Immutable. Readonly. Deterministic.
 */
export interface ComparativeAssessment {
  readonly id: string;
  readonly title: string;
  readonly reasoningType: ComparisonReasoningType;
  readonly dimensions: readonly ComparisonDimensionEntry[];
  readonly tradeOffs: readonly TradeOffEvaluation[];
  readonly decisionContext: DecisionContext;
  readonly alternatives: readonly string[];
  readonly conceptIds: readonly string[];
  readonly status: ComparativeAssessmentStatus;
  readonly governance: AssessmentGovernanceLevel;
  readonly provenance: ComparisonAssessmentProvenance;
  readonly trace: ComparisonAssessmentTrace;
}

/**
 * Represents a deterministic link between comparative assessments.
 * Immutable. Readonly. Deterministic.
 */
export interface ComparisonRelationship {
  readonly id: string;
  readonly sourceComparisonId: string;
  readonly targetComparisonId: string;
  readonly relationshipType: string;
  readonly rationale: string;
}

/**
 * Registry metadata for comparative assessments.
 * Immutable. Readonly. Deterministic.
 */
export interface ComparisonRegistryMetadata {
  readonly registryId: string;
  readonly version: string;
  readonly nodeCount: number;
  readonly generatedFrom: 'deterministic_comparison_kernel';
  readonly deterministic: true;
  readonly randomUsed: false;
  readonly timeDependency: false;
}

/**
 * Complete comparative assessment registry.
 * Immutable. Readonly. Deterministic.
 */
export interface ComparisonRegistry {
  readonly metadata: ComparisonRegistryMetadata;
  readonly nodes: readonly ComparativeAssessment[];
}

/**
 * Input object accepted by composeComparisonRegistryFromInput.
 * Immutable. Readonly.
 */
export interface ComparisonInput {
  readonly nodes: readonly ComparativeAssessment[];
}

/**
 * Assessment artifact with associated comparisons.
 * Immutable. Readonly.
 */
export interface AssessmentArtifactWithComparisons {
  readonly artifactId: string;
  readonly artifactTitle: string;
  readonly comparisons: readonly ComparativeAssessment[];
}

// ============================================================================
// D8-OPT-10 — COMPARISON VALIDATION CONTRACTS
// ============================================================================

/**
 * Single comparison validation error.
 * Immutable. Readonly.
 */
export interface ComparisonValidationError {
  readonly code: string;
  readonly message: string;
  readonly field?: string;
  readonly entityId?: string;
}

/**
 * Generic comparison validation result.
 * Immutable. Readonly.
 */
export interface ComparisonValidationResult {
  readonly valid: boolean;
  readonly errors: readonly ComparisonValidationError[];
  readonly checkedAt: string;
}

/**
 * Comparison registry-level validation result.
 * Immutable. Readonly.
 */
export interface ComparisonRegistryValidationResult {
  readonly valid: boolean;
  readonly errors: readonly ComparisonValidationError[];
  readonly nodeResults: readonly ComparisonValidationResult[];
  readonly checkedAt: 'comparison_registry_validation';
}

/**
 * Comparison input-level validation result.
 * Immutable. Readonly.
 */
export interface ComparisonInputValidationResult {
  readonly valid: boolean;
  readonly errors: readonly ComparisonValidationError[];
  readonly checkedAt: 'comparison_input_validation';
}

/**
 * Comparison trace-level validation result.
 * Immutable. Readonly.
 */
export interface ComparisonTraceValidationResult {
  readonly valid: boolean;
  readonly errors: readonly ComparisonValidationError[];
  readonly checkedAt: 'comparison_trace_validation';
}

/**
 * Validation result for an artifact with comparisons.
 * Immutable. Readonly.
 */
export interface AssessmentArtifactWithComparisonsValidationResult {
  readonly valid: boolean;
  readonly errors: readonly ComparisonValidationError[];
  readonly checkedAt: 'artifact_comparison_validation';
}

// ============================================================================
// D8-OPT-11 — ENGINEERING CONSTRAINT ENUMS — Immutable constant arrays
// ============================================================================

/**
 * Canonical engineering constraint types for constraint analysis assessment.
 * Exactly 10 values. Stable forever.
 */
export const CANONICAL_ENGINEERING_CONSTRAINT_ANALYSIS_TYPES = [
  'latency',
  'memory',
  'compute',
  'bandwidth',
  'energy',
  'cost',
  'scalability',
  'maintainability',
  'security',
  'reliability',
] as const;

export type EngineeringConstraintAnalysisType =
  (typeof CANONICAL_ENGINEERING_CONSTRAINT_ANALYSIS_TYPES)[number];

/**
 * Canonical constraint severity levels.
 * Exactly 5 values. Stable forever.
 */
export const CANONICAL_CONSTRAINT_SEVERITY_LEVELS = [
  'minimal',
  'minor',
  'moderate',
  'major',
  'critical',
] as const;

export type ConstraintSeverityLevel =
  (typeof CANONICAL_CONSTRAINT_SEVERITY_LEVELS)[number];

/**
 * Canonical constraint category types.
 * Exactly 10 values. Stable forever.
 */
export const CANONICAL_CONSTRAINT_CATEGORY_TYPES = [
  'performance',
  'resource',
  'architecture',
  'deployment',
  'integration',
  'security',
  'reliability',
  'cost',
  'operational',
  'compliance',
] as const;

export type ConstraintCategoryType =
  (typeof CANONICAL_CONSTRAINT_CATEGORY_TYPES)[number];

/**
 * Canonical constraint reasoning types.
 * Exactly 10 values. Stable forever.
 */
export const CANONICAL_CONSTRAINT_REASONING_TYPES = [
  'factual',
  'conceptual',
  'procedural',
  'analytical',
  'comparative',
  'causal',
  'diagnostic',
  'engineering',
  'critical',
  'reflective',
] as const;

export type ConstraintReasoningType =
  (typeof CANONICAL_CONSTRAINT_REASONING_TYPES)[number];

/**
 * Canonical constraint analysis statuses.
 * Exactly 6 values. Stable forever.
 */
export const CANONICAL_CONSTRAINT_ANALYSIS_STATUS = [
  'draft',
  'review',
  'approved',
  'published',
  'deprecated',
  'archived',
] as const;

export type ConstraintAnalysisStatus =
  (typeof CANONICAL_CONSTRAINT_ANALYSIS_STATUS)[number];

// ============================================================================
// D8-OPT-11 — ENGINEERING CONSTRAINT CONTRACTS — Immutable readonly domain types
// ============================================================================

/**
 * Provenance metadata for constraint assessment.
 * Immutable. Readonly. Deterministic.
 */
export interface ConstraintAssessmentProvenance {
  readonly provider: string;
  readonly source: string;
  readonly reviewStatus: ConstraintAnalysisStatus;
  readonly reviewDate: string;
  readonly version: string;
  readonly rationale: string;
}

/**
 * Governance decision metadata for constraint assessment.
 * Immutable. Readonly. Deterministic.
 */
export interface ConstraintAssessmentDecision {
  readonly level: AssessmentGovernanceLevel;
  readonly decidedBy: string;
  readonly decidedAt: string;
  readonly rationale: string;
}

/**
 * Deterministic trace metadata for constraint assessment.
 * Immutable. Readonly. No random. No time dependency.
 */
export interface ConstraintAssessmentTrace {
  readonly traceId: string;
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_constraint_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

/**
 * Represents a constraint category classification.
 * Immutable. Readonly. Deterministic.
 */
export interface ConstraintCategory {
  readonly id: string;
  readonly categoryType: ConstraintCategoryType;
  readonly description: string;
}

/**
 * Represents a constraint severity classification.
 * Immutable. Readonly. Deterministic.
 */
export interface ConstraintSeverity {
  readonly id: string;
  readonly severityLevel: ConstraintSeverityLevel;
  readonly description: string;
}

/**
 * Represents a constraint reasoning classification.
 * Immutable. Readonly. Deterministic.
 */
export interface ConstraintReasoning {
  readonly id: string;
  readonly reasoningType: ConstraintReasoningType;
  readonly description: string;
}

/**
 * Represents a deterministic relationship between constraints.
 * Immutable. Readonly. Deterministic.
 */
export interface ConstraintRelationship {
  readonly id: string;
  readonly sourceConstraintId: string;
  readonly targetConstraintId: string;
  readonly relationshipType: string;
  readonly rationale: string;
}

/**
 * Represents one governed engineering constraint assessment.
 * Immutable. Readonly. Deterministic.
 */
export interface EngineeringConstraintAssessment {
  readonly id: string;
  readonly title: string;
  readonly constraintType: EngineeringConstraintAnalysisType;
  readonly categories: readonly ConstraintCategory[];
  readonly severities: readonly ConstraintSeverity[];
  readonly reasoningTypes: readonly ConstraintReasoning[];
  readonly conceptIds: readonly string[];
  readonly status: ConstraintAnalysisStatus;
  readonly governance: AssessmentGovernanceLevel;
  readonly provenance: ConstraintAssessmentProvenance;
  readonly trace: ConstraintAssessmentTrace;
}

/**
 * Registry metadata for constraint assessments.
 * Immutable. Readonly. Deterministic.
 */
export interface ConstraintRegistryMetadata {
  readonly registryId: string;
  readonly version: string;
  readonly nodeCount: number;
  readonly generatedFrom: 'deterministic_constraint_kernel';
  readonly deterministic: true;
  readonly randomUsed: false;
  readonly timeDependency: false;
}

/**
 * Complete constraint assessment registry.
 * Immutable. Readonly. Deterministic.
 */
export interface ConstraintRegistry {
  readonly metadata: ConstraintRegistryMetadata;
  readonly nodes: readonly EngineeringConstraintAssessment[];
}

/**
 * Input object accepted by composeConstraintRegistryFromInput.
 * Immutable. Readonly.
 */
export interface ConstraintInput {
  readonly nodes: readonly EngineeringConstraintAssessment[];
}

/**
 * Assessment artifact with associated constraint assessments.
 * Immutable. Readonly.
 */
export interface AssessmentArtifactWithConstraints {
  readonly artifactId: string;
  readonly artifactTitle: string;
  readonly constraints: readonly EngineeringConstraintAssessment[];
}

// ============================================================================
// D8-OPT-11 — ENGINEERING CONSTRAINT VALIDATION CONTRACTS
// ============================================================================

/**
 * Single constraint validation error.
 * Immutable. Readonly.
 */
export interface ConstraintValidationError {
  readonly code: string;
  readonly message: string;
  readonly field?: string;
  readonly entityId?: string;
}

/**
 * Generic constraint validation result.
 * Immutable. Readonly.
 */
export interface ConstraintValidationResult {
  readonly valid: boolean;
  readonly errors: readonly ConstraintValidationError[];
  readonly checkedAt: string;
}

/**
 * Constraint registry-level validation result.
 * Immutable. Readonly.
 */
export interface ConstraintRegistryValidationResult {
  readonly valid: boolean;
  readonly errors: readonly ConstraintValidationError[];
  readonly nodeResults: readonly ConstraintValidationResult[];
  readonly checkedAt: 'constraint_registry_validation';
}

/**
 * Constraint input-level validation result.
 * Immutable. Readonly.
 */
export interface ConstraintInputValidationResult {
  readonly valid: boolean;
  readonly errors: readonly ConstraintValidationError[];
  readonly checkedAt: 'constraint_input_validation';
}

/**
 * Constraint trace-level validation result.
 * Immutable. Readonly.
 */
export interface ConstraintTraceValidationResult {
  readonly valid: boolean;
  readonly errors: readonly ConstraintValidationError[];
  readonly checkedAt: 'constraint_trace_validation';
}

/**
 * Validation result for an artifact with constraints.
 * Immutable. Readonly.
 */
export interface AssessmentArtifactWithConstraintsValidationResult {
  readonly valid: boolean;
  readonly errors: readonly ConstraintValidationError[];
  readonly checkedAt: 'artifact_constraint_validation';
}

// ============================================================================
// D8-OPT-12 — REINFORCEMENT PLAN ENUMS — Immutable constant arrays
// ============================================================================

/**
 * Canonical reinforcement plan types.
 * Exactly 10 values. Stable forever.
 */
export const CANONICAL_REINFORCEMENT_PLAN_TYPES = [
  'concept_review',
  'skill_practice',
  'knowledge_consolidation',
  'misconception_remediation',
  'reasoning_enhancement',
  'procedural_fluency',
  'critical_thinking',
  'creative_application',
  'collaborative_learning',
  'self_regulated_learning',
] as const;

export type ReinforcementPlanType =
  (typeof CANONICAL_REINFORCEMENT_PLAN_TYPES)[number];

/**
 * Canonical reinforcement objective types.
 * Exactly 10 values. Stable forever.
 */
export const CANONICAL_REINFORCEMENT_OBJECTIVE_TYPES = [
  'reinforce_concept',
  'strengthen_skill',
  'remediate_gap',
  'consolidate_knowledge',
  'enhance_reasoning',
  'build_fluency',
  'develop_critical_thinking',
  'foster_application',
  'support_collaboration',
  'promote_reflection',
] as const;

export type ReinforcementObjectiveType =
  (typeof CANONICAL_REINFORCEMENT_OBJECTIVE_TYPES)[number];

/**
 * Canonical reinforcement activity types.
 * Exactly 10 values. Stable forever.
 */
export const CANONICAL_REINFORCEMENT_ACTIVITY_TYPES = [
  'reading',
  'exercise',
  'quiz',
  'project',
  'discussion',
  'peer_review',
  'reflection_prompt',
  'worked_example',
  'practice_set',
  'challenge',
] as const;

export type ReinforcementActivityType =
  (typeof CANONICAL_REINFORCEMENT_ACTIVITY_TYPES)[number];

/**
 * Canonical reinforcement priority types.
 * Exactly 10 values. Stable forever.
 */
export const CANONICAL_REINFORCEMENT_PRIORITY_TYPES = [
  'critical',
  'high',
  'medium',
  'low',
  'optional',
  'adaptive',
  'timed',
  'on_demand',
  'prerequisite',
  'capstone',
] as const;

export type ReinforcementPriorityType =
  (typeof CANONICAL_REINFORCEMENT_PRIORITY_TYPES)[number];

/**
 * Canonical reinforcement plan statuses.
 * Exactly 6 values. Stable forever.
 */
export const CANONICAL_REINFORCEMENT_STATUS = [
  'draft',
  'review',
  'approved',
  'published',
  'deprecated',
  'archived',
] as const;

export type ReinforcementPlanStatus =
  (typeof CANONICAL_REINFORCEMENT_STATUS)[number];

// ============================================================================
// D8-OPT-12 — REINFORCEMENT PLAN CONTRACTS — Immutable readonly domain types
// ============================================================================

/**
 * Provenance metadata for reinforcement plan assessment.
 * Immutable. Readonly. Deterministic.
 */
export interface ReinforcementProvenance {
  readonly provider: string;
  readonly source: string;
  readonly reviewStatus: ReinforcementPlanStatus;
  readonly reviewDate: string;
  readonly version: string;
  readonly rationale: string;
}

/**
 * Governance decision metadata for reinforcement plan assessment.
 * Immutable. Readonly. Deterministic.
 */
export interface ReinforcementDecision {
  readonly level: AssessmentGovernanceLevel;
  readonly decidedBy: string;
  readonly decidedAt: string;
  readonly rationale: string;
}

/**
 * Deterministic trace metadata for reinforcement plan assessment.
 * Immutable. Readonly. No random. No time dependency.
 */
export interface ReinforcementTrace {
  readonly traceId: string;
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_reinforcement_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

/**
 * Represents a reinforcement objective within a plan.
 * Immutable. Readonly. Deterministic.
 */
export interface ReinforcementObjective {
  readonly id: string;
  readonly objectiveType: ReinforcementObjectiveType;
  readonly description: string;
}

/**
 * Represents a reinforcement activity within a plan.
 * Immutable. Readonly. Deterministic.
 */
export interface ReinforcementActivity {
  readonly id: string;
  readonly activityType: ReinforcementActivityType;
  readonly description: string;
  readonly duration: string;
}

/**
 * Represents a deterministic relationship between reinforcement plans.
 * Immutable. Readonly. Deterministic.
 */
export interface ReinforcementRelationship {
  readonly id: string;
  readonly sourcePlanId: string;
  readonly targetPlanId: string;
  readonly relationshipType: string;
  readonly rationale: string;
}

/**
 * Represents one governed reinforcement plan assessment.
 * Immutable. Readonly. Deterministic.
 */
export interface AssessmentReinforcementPlan {
  readonly id: string;
  readonly title: string;
  readonly planType: ReinforcementPlanType;
  readonly objectives: readonly ReinforcementObjective[];
  readonly activities: readonly ReinforcementActivity[];
  readonly priority: ReinforcementPriorityType;
  readonly conceptIds: readonly string[];
  readonly status: ReinforcementPlanStatus;
  readonly governance: AssessmentGovernanceLevel;
  readonly provenance: ReinforcementProvenance;
  readonly trace: ReinforcementTrace;
}

/**
 * Registry metadata for reinforcement plan assessments.
 * Immutable. Readonly. Deterministic.
 */
export interface ReinforcementRegistryMetadata {
  readonly registryId: string;
  readonly version: string;
  readonly nodeCount: number;
  readonly generatedFrom: 'deterministic_reinforcement_kernel';
  readonly deterministic: true;
  readonly randomUsed: false;
  readonly timeDependency: false;
}

/**
 * Complete reinforcement plan registry.
 * Immutable. Readonly. Deterministic.
 */
export interface ReinforcementRegistry {
  readonly metadata: ReinforcementRegistryMetadata;
  readonly nodes: readonly AssessmentReinforcementPlan[];
}

/**
 * Input object accepted by composeReinforcementRegistryFromInput.
 * Immutable. Readonly.
 */
export interface ReinforcementInput {
  readonly nodes: readonly AssessmentReinforcementPlan[];
}

/**
 * Assessment artifact enriched with reinforcement plans.
 * Immutable. Readonly.
 */
export interface AssessmentArtifactWithReinforcement {
  readonly artifactId: string;
  readonly artifactTitle: string;
  readonly reinforcementPlans: readonly AssessmentReinforcementPlan[];
}

// ============================================================================
// D8-OPT-12 — REINFORCEMENT PLAN VALIDATION CONTRACTS
// ============================================================================

/**
 * Single reinforcement validation error.
 * Immutable. Readonly.
 */
export interface ReinforcementValidationError {
  readonly code: string;
  readonly message: string;
  readonly field?: string;
  readonly entityId?: string;
}

/**
 * Generic reinforcement validation result.
 * Immutable. Readonly.
 */
export interface ReinforcementValidationResult {
  readonly valid: boolean;
  readonly errors: readonly ReinforcementValidationError[];
  readonly checkedAt: string;
}

/**
 * Reinforcement registry-level validation result.
 * Immutable. Readonly.
 */
export interface ReinforcementRegistryValidationResult {
  readonly valid: boolean;
  readonly errors: readonly ReinforcementValidationError[];
  readonly nodeResults: readonly ReinforcementValidationResult[];
  readonly checkedAt: 'reinforcement_registry_validation';
}

/**
 * Reinforcement input-level validation result.
 * Immutable. Readonly.
 */
export interface ReinforcementInputValidationResult {
  readonly valid: boolean;
  readonly errors: readonly ReinforcementValidationError[];
  readonly checkedAt: 'reinforcement_input_validation';
}

/**
 * Reinforcement trace-level validation result.
 * Immutable. Readonly.
 */
export interface ReinforcementTraceValidationResult {
  readonly valid: boolean;
  readonly errors: readonly ReinforcementValidationError[];
  readonly checkedAt: 'reinforcement_trace_validation';
}

/**
 * Validation result for an artifact with reinforcement plans.
 * Immutable. Readonly.
 */
export interface AssessmentArtifactWithReinforcementValidationResult {
  readonly valid: boolean;
  readonly errors: readonly ReinforcementValidationError[];
  readonly checkedAt: 'artifact_reinforcement_validation';
}

// ============================================================================
// D8-OPT-13 — PORTFOLIO-ORIENTED EVALUATION ENUMS — Immutable constant arrays
// ============================================================================

/**
 * Canonical portfolio evaluation types.
 * Exactly 10 values. Stable forever.
 */
export const CANONICAL_PORTFOLIO_EVALUATION_TYPES = [
  'project_based',
  'artifact_review',
  'engineering_showcase',
  'capstone',
  'implementation_validation',
  'architecture_review',
  'competency_demonstration',
  'production_readiness',
  'research_portfolio',
  'professional_showcase',
] as const;

export type PortfolioEvaluationType =
  (typeof CANONICAL_PORTFOLIO_EVALUATION_TYPES)[number];

/**
 * Canonical portfolio artifact types.
 * Exactly 10 values. Stable forever.
 */
export const CANONICAL_PORTFOLIO_ARTIFACT_TYPES = [
  'repository',
  'technical_report',
  'architecture_document',
  'research_report',
  'presentation',
  'codebase',
  'deployment',
  'experiment',
  'benchmark',
  'documentation',
] as const;

export type PortfolioArtifactType =
  (typeof CANONICAL_PORTFOLIO_ARTIFACT_TYPES)[number];

/**
 * Canonical portfolio competency types.
 * Exactly 10 values. Stable forever.
 */
export const CANONICAL_PORTFOLIO_COMPETENCY_TYPES = [
  'implementation',
  'architecture',
  'engineering_reasoning',
  'problem_solving',
  'debugging',
  'optimization',
  'documentation',
  'communication',
  'research',
  'deployment',
] as const;

export type PortfolioCompetencyType =
  (typeof CANONICAL_PORTFOLIO_COMPETENCY_TYPES)[number];

/**
 * Canonical showcase levels.
 * Exactly 10 values. Stable forever.
 */
export const CANONICAL_SHOWCASE_LEVELS = [
  'internal',
  'educational',
  'academic',
  'professional',
  'industry',
  'conference',
  'competition',
  'publication',
  'open_source',
  'flagship',
] as const;

export type ShowcaseLevel =
  (typeof CANONICAL_SHOWCASE_LEVELS)[number];

/**
 * Canonical portfolio evaluation statuses.
 * Exactly 6 values. Stable forever.
 */
export const CANONICAL_PORTFOLIO_EVALUATION_STATUS = [
  'draft',
  'review',
  'approved',
  'published',
  'deprecated',
  'archived',
] as const;

export type PortfolioEvaluationStatus =
  (typeof CANONICAL_PORTFOLIO_EVALUATION_STATUS)[number];

// ============================================================================
// D8-OPT-13 — PORTFOLIO-ORIENTED EVALUATION CONTRACTS — Immutable readonly domain types
// ============================================================================

/**
 * Provenance metadata for portfolio evaluation.
 * Immutable. Readonly. Deterministic.
 */
export interface PortfolioEvaluationProvenance {
  readonly provider: string;
  readonly source: string;
  readonly reviewStatus: PortfolioEvaluationStatus;
  readonly reviewDate: string;
  readonly version: string;
  readonly rationale: string;
}

/**
 * Governance decision metadata for portfolio evaluation.
 * Immutable. Readonly. Deterministic.
 */
export interface PortfolioEvaluationDecision {
  readonly level: AssessmentGovernanceLevel;
  readonly decidedBy: string;
  readonly decidedAt: string;
  readonly rationale: string;
}

/**
 * Deterministic trace metadata for portfolio evaluation.
 * Immutable. Readonly. No random. No time dependency.
 */
export interface PortfolioEvaluationTrace {
  readonly traceId: string;
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_portfolio_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

/**
 * Represents a portfolio artifact reference within an evaluation.
 * Immutable. Readonly. Deterministic.
 */
export interface PortfolioArtifactReference {
  readonly id: string;
  readonly artifactType: PortfolioArtifactType;
  readonly description: string;
}

/**
 * Represents a portfolio competency evidence within an evaluation.
 * Immutable. Readonly. Deterministic.
 */
export interface PortfolioCompetencyEvidence {
  readonly id: string;
  readonly competencyType: PortfolioCompetencyType;
  readonly description: string;
}

/**
 * Represents a portfolio showcase classification within an evaluation.
 * Immutable. Readonly. Deterministic.
 */
export interface PortfolioShowcaseClassification {
  readonly id: string;
  readonly showcaseLevel: ShowcaseLevel;
  readonly description: string;
}

/**
 * Represents a deterministic relationship between portfolio evaluations.
 * Immutable. Readonly. Deterministic.
 */
export interface PortfolioRelationship {
  readonly id: string;
  readonly sourceEvaluationId: string;
  readonly targetEvaluationId: string;
  readonly relationshipType: string;
  readonly rationale: string;
}

/**
 * Represents one governed portfolio evaluation.
 * Immutable. Readonly. Deterministic.
 */
export interface PortfolioEvaluation {
  readonly id: string;
  readonly title: string;
  readonly evaluationType: PortfolioEvaluationType;
  readonly artifacts: readonly PortfolioArtifactReference[];
  readonly competencies: readonly PortfolioCompetencyEvidence[];
  readonly showcaseClassifications: readonly PortfolioShowcaseClassification[];
  readonly conceptIds: readonly string[];
  readonly status: PortfolioEvaluationStatus;
  readonly governance: AssessmentGovernanceLevel;
  readonly provenance: PortfolioEvaluationProvenance;
  readonly trace: PortfolioEvaluationTrace;
}

/**
 * Registry metadata for portfolio evaluations.
 * Immutable. Readonly. Deterministic.
 */
export interface PortfolioRegistryMetadata {
  readonly registryId: string;
  readonly version: string;
  readonly nodeCount: number;
  readonly generatedFrom: 'deterministic_portfolio_kernel';
  readonly deterministic: true;
  readonly randomUsed: false;
  readonly timeDependency: false;
}

/**
 * Complete portfolio evaluation registry.
 * Immutable. Readonly. Deterministic.
 */
export interface PortfolioRegistry {
  readonly metadata: PortfolioRegistryMetadata;
  readonly nodes: readonly PortfolioEvaluation[];
}

/**
 * Input object accepted by composePortfolioRegistryFromInput.
 * Immutable. Readonly.
 */
export interface PortfolioInput {
  readonly nodes: readonly PortfolioEvaluation[];
}

/**
 * Assessment artifact enriched with portfolio evaluations.
 * Immutable. Readonly.
 */
export interface AssessmentArtifactWithPortfolio {
  readonly artifactId: string;
  readonly artifactTitle: string;
  readonly portfolioEvaluations: readonly PortfolioEvaluation[];
}

// ============================================================================
// D8-OPT-13 — PORTFOLIO-ORIENTED EVALUATION VALIDATION CONTRACTS
// ============================================================================

/**
 * Single portfolio validation error.
 * Immutable. Readonly.
 */
export interface PortfolioValidationError {
  readonly code: string;
  readonly message: string;
  readonly field?: string;
  readonly entityId?: string;
}

/**
 * Generic portfolio validation result.
 * Immutable. Readonly.
 */
export interface PortfolioValidationResult {
  readonly valid: boolean;
  readonly errors: readonly PortfolioValidationError[];
  readonly checkedAt: string;
}

/**
 * Portfolio registry-level validation result.
 * Immutable. Readonly.
 */
export interface PortfolioRegistryValidationResult {
  readonly valid: boolean;
  readonly errors: readonly PortfolioValidationError[];
  readonly nodeResults: readonly PortfolioValidationResult[];
  readonly checkedAt: 'portfolio_registry_validation';
}

/**
 * Portfolio input-level validation result.
 * Immutable. Readonly.
 */
export interface PortfolioInputValidationResult {
  readonly valid: boolean;
  readonly errors: readonly PortfolioValidationError[];
  readonly checkedAt: 'portfolio_input_validation';
}

/**
 * Portfolio trace-level validation result.
 * Immutable. Readonly.
 */
export interface PortfolioTraceValidationResult {
  readonly valid: boolean;
  readonly errors: readonly PortfolioValidationError[];
  readonly checkedAt: 'portfolio_trace_validation';
}

/**
 * Validation result for an artifact with portfolio evaluations.
 * Immutable. Readonly.
 */
export interface AssessmentArtifactWithPortfolioValidationResult {
  readonly valid: boolean;
  readonly errors: readonly PortfolioValidationError[];
  readonly checkedAt: 'artifact_portfolio_validation';
}

// ============================================================================
// D8-OPT-14 — ASSESSMENT EVIDENCE ENUMS — Immutable constant arrays
// ============================================================================

/**
 * Canonical evidence types.
 * Exactly 10 values. Stable forever.
 */
export const CANONICAL_EVIDENCE_TYPES = [
  'answer',
  'reasoning',
  'calculation',
  'annotation',
  'concept_mapping',
  'engineering_report',
  'laboratory_result',
  'visual_analysis',
  'reflection',
  'portfolio_artifact',
] as const;

export type EvidenceType =
  (typeof CANONICAL_EVIDENCE_TYPES)[number];

/**
 * Canonical evidence sources.
 * Exactly 10 values. Stable forever.
 */
export const CANONICAL_EVIDENCE_SOURCES = [
  'assessment',
  'laboratory',
  'portfolio',
  'engineering_case',
  'visual_activity',
  'concept_graph',
  'comparison',
  'constraint_analysis',
  'reflection',
  'manual_review',
] as const;

export type EvidenceSource =
  (typeof CANONICAL_EVIDENCE_SOURCES)[number];

/**
 * Canonical evidence confidence levels.
 * Exactly 10 values. Stable forever.
 */
export const CANONICAL_EVIDENCE_CONFIDENCE_LEVELS = [
  'very_low',
  'low',
  'limited',
  'moderate',
  'acceptable',
  'good',
  'high',
  'very_high',
  'validated',
  'canonical',
] as const;

export type EvidenceConfidenceLevel =
  (typeof CANONICAL_EVIDENCE_CONFIDENCE_LEVELS)[number];

/**
 * Canonical evidence governance levels.
 * Exactly 10 values. Stable forever.
 */
export const CANONICAL_EVIDENCE_GOVERNANCE_LEVELS = [
  'draft',
  'review',
  'approved',
  'verified',
  'audited',
  'canonical',
  'deprecated',
  'archived',
  'rejected',
  'historical',
] as const;

export type EvidenceGovernanceLevel =
  (typeof CANONICAL_EVIDENCE_GOVERNANCE_LEVELS)[number];

/**
 * Canonical evidence trace types.
 * Exactly 10 values. Stable forever.
 */
export const CANONICAL_EVIDENCE_TRACE_TYPES = [
  'manual',
  'deterministic',
  'verified',
  'reviewed',
  'imported',
  'derived',
  'linked',
  'cross_referenced',
  'audited',
  'canonical',
] as const;

export type EvidenceTraceType =
  (typeof CANONICAL_EVIDENCE_TRACE_TYPES)[number];

/**
 * Canonical evidence statuses.
 * Exactly 6 values. Stable forever.
 */
export const CANONICAL_EVIDENCE_STATUS = [
  'draft',
  'review',
  'approved',
  'published',
  'deprecated',
  'archived',
] as const;

export type EvidenceStatus =
  (typeof CANONICAL_EVIDENCE_STATUS)[number];

// ============================================================================
// D8-OPT-14 — ASSESSMENT EVIDENCE CONTRACTS — Immutable readonly domain types
// ============================================================================

/**
 * Provenance metadata for assessment evidence.
 * Immutable. Readonly. Deterministic.
 */
export interface AssessmentEvidenceProvenance {
  readonly provider: string;
  readonly source: string;
  readonly reviewStatus: EvidenceStatus;
  readonly reviewDate: string;
  readonly version: string;
  readonly rationale: string;
}

/**
 * Governance decision metadata for assessment evidence.
 * Immutable. Readonly. Deterministic.
 */
export interface AssessmentEvidenceDecision {
  readonly level: EvidenceGovernanceLevel;
  readonly decidedBy: string;
  readonly decidedAt: string;
  readonly rationale: string;
}

/**
 * Deterministic trace metadata for assessment evidence.
 * Immutable. Readonly. No random. No time dependency.
 */
export interface AssessmentEvidenceTrace {
  readonly traceId: string;
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_evidence_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

/**
 * Represents an evidence reference within an assessment.
 * Immutable. Readonly. Deterministic.
 */
export interface EvidenceReference {
  readonly id: string;
  readonly evidenceType: EvidenceType;
  readonly source: EvidenceSource;
  readonly description: string;
}

/**
 * Represents a deterministic relationship between evidence items.
 * Immutable. Readonly. Deterministic.
 */
export interface EvidenceRelationship {
  readonly id: string;
  readonly sourceEvidenceId: string;
  readonly targetEvidenceId: string;
  readonly relationshipType: string;
  readonly rationale: string;
}

/**
 * Represents governance metadata for evidence.
 * Immutable. Readonly. Deterministic.
 */
export interface EvidenceGovernance {
  readonly id: string;
  readonly governanceLevel: EvidenceGovernanceLevel;
  readonly decidedBy: string;
  readonly decidedAt: string;
  readonly rationale: string;
}

/**
 * Represents audit metadata for evidence.
 * Immutable. Readonly. Deterministic.
 */
export interface EvidenceAuditMetadata {
  readonly id: string;
  readonly auditedBy: string;
  readonly auditedAt: string;
  readonly confidenceLevel: EvidenceConfidenceLevel;
  readonly traceType: EvidenceTraceType;
  readonly auditNotes: string;
}

/**
 * Represents one governed assessment evidence item.
 * Immutable. Readonly. Deterministic.
 */
export interface AssessmentEvidence {
  readonly id: string;
  readonly title: string;
  readonly evidenceType: EvidenceType;
  readonly source: EvidenceSource;
  readonly confidenceLevel: EvidenceConfidenceLevel;
  readonly references: readonly EvidenceReference[];
  readonly relationships: readonly EvidenceRelationship[];
  readonly governance: EvidenceGovernance;
  readonly auditMetadata: EvidenceAuditMetadata;
  readonly conceptIds: readonly string[];
  readonly status: EvidenceStatus;
  readonly assessmentGovernance: AssessmentGovernanceLevel;
  readonly provenance: AssessmentEvidenceProvenance;
  readonly trace: AssessmentEvidenceTrace;
}

/**
 * Registry metadata for assessment evidence.
 * Immutable. Readonly. Deterministic.
 */
export interface EvidenceRegistryMetadata {
  readonly registryId: string;
  readonly version: string;
  readonly nodeCount: number;
  readonly generatedFrom: 'deterministic_evidence_kernel';
  readonly deterministic: true;
  readonly randomUsed: false;
  readonly timeDependency: false;
}

/**
 * Complete assessment evidence registry.
 * Immutable. Readonly. Deterministic.
 */
export interface EvidenceRegistry {
  readonly metadata: EvidenceRegistryMetadata;
  readonly nodes: readonly AssessmentEvidence[];
}

/**
 * Input object accepted by composeEvidenceRegistryFromInput.
 * Immutable. Readonly.
 */
export interface EvidenceInput {
  readonly nodes: readonly AssessmentEvidence[];
}

/**
 * Assessment artifact enriched with evidence.
 * Immutable. Readonly.
 */
export interface AssessmentArtifactWithEvidence {
  readonly artifactId: string;
  readonly artifactTitle: string;
  readonly evidence: readonly AssessmentEvidence[];
}

// ============================================================================
// D8-OPT-14 — ASSESSMENT EVIDENCE VALIDATION CONTRACTS
// ============================================================================

/**
 * Single evidence validation error.
 * Immutable. Readonly.
 */
export interface EvidenceValidationError {
  readonly code: string;
  readonly message: string;
  readonly field?: string;
  readonly entityId?: string;
}

/**
 * Generic evidence validation result.
 * Immutable. Readonly.
 */
export interface EvidenceValidationResult {
  readonly valid: boolean;
  readonly errors: readonly EvidenceValidationError[];
  readonly checkedAt: string;
}

/**
 * Evidence registry-level validation result.
 * Immutable. Readonly.
 */
export interface EvidenceRegistryValidationResult {
  readonly valid: boolean;
  readonly errors: readonly EvidenceValidationError[];
  readonly nodeResults: readonly EvidenceValidationResult[];
  readonly checkedAt: 'evidence_registry_validation';
}

/**
 * Evidence input-level validation result.
 * Immutable. Readonly.
 */
export interface EvidenceInputValidationResult {
  readonly valid: boolean;
  readonly errors: readonly EvidenceValidationError[];
  readonly checkedAt: 'evidence_input_validation';
}

/**
 * Evidence trace-level validation result.
 * Immutable. Readonly.
 */
export interface EvidenceTraceValidationResult {
  readonly valid: boolean;
  readonly errors: readonly EvidenceValidationError[];
  readonly checkedAt: 'evidence_trace_validation';
}

/**
 * Validation result for an artifact with evidence.
 * Immutable. Readonly.
 */
export interface AssessmentArtifactWithEvidenceValidationResult {
  readonly valid: boolean;
  readonly errors: readonly EvidenceValidationError[];
  readonly checkedAt: 'artifact_evidence_validation';
}

// ============================================================================
// D8-OPT-15 — ASSESSMENT CERTIFICATION ENUMS — Immutable constant arrays
// ============================================================================

/**
 * Canonical assessment certification statuses.
 * Exactly 6 values. Stable forever.
 */
export const CANONICAL_ASSESSMENT_CERTIFICATION_STATUS = [
  'passed',
  'passed_with_warnings',
  'failed',
  'blocked',
  'incomplete',
  'not_certified',
] as const;

export type AssessmentCertificationStatus =
  (typeof CANONICAL_ASSESSMENT_CERTIFICATION_STATUS)[number];

/**
 * Canonical assessment finding severities.
 * Exactly 5 values. Stable forever.
 */
export const CANONICAL_ASSESSMENT_FINDING_SEVERITY = [
  'info',
  'low',
  'medium',
  'high',
  'critical',
] as const;

export type AssessmentFindingSeverity =
  (typeof CANONICAL_ASSESSMENT_FINDING_SEVERITY)[number];

/**
 * Canonical assessment quality dimensions.
 * Exactly 22 values. Stable forever.
 */
export const CANONICAL_ASSESSMENT_QUALITY_DIMENSIONS = [
  'assessment_registry',
  'cognitive_model',
  'verification',
  'concept_graph',
  'misconceptions',
  'feedback',
  'laboratory_mapping',
  'visual_assets',
  'engineering_cases',
  'comparative_reasoning',
  'constraint_analysis',
  'reinforcement',
  'portfolio',
  'evidence',
  'traceability',
  'governance',
  'determinism',
  'immutability',
  'validation',
  'documentation',
  'cross_agent_boundary',
  'public_api',
] as const;

export type AssessmentQualityDimension =
  (typeof CANONICAL_ASSESSMENT_QUALITY_DIMENSIONS)[number];

// ============================================================================
// D8-OPT-15 — ASSESSMENT CERTIFICATION CONTRACTS — Immutable readonly domain types
// ============================================================================

/**
 * A single certification finding.
 * Immutable. Readonly. Deterministic.
 */
export interface AssessmentCertificationFinding {
  readonly id: string;
  readonly dimension: AssessmentQualityDimension;
  readonly severity: AssessmentFindingSeverity;
  readonly message: string;
  readonly field?: string;
  readonly entityId?: string;
  readonly source: string;
}

/**
 * Deterministic trace metadata for certification.
 * Immutable. Readonly. No random. No time dependency.
 */
export interface AssessmentCertificationTrace {
  readonly traceId: string;
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_certification_engine';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

/**
 * Complete certification report for an assessment artifact.
 * Immutable. Readonly. Deterministic.
 */
export interface AssessmentCertificationReport {
  readonly reportId: string;
  readonly artifactId: string;
  readonly artifactTitle: string;
  readonly status: AssessmentCertificationStatus;
  readonly score: number;
  readonly findings: readonly AssessmentCertificationFinding[];
  readonly dimensionsChecked: readonly AssessmentQualityDimension[];
  readonly certifiedAt: string;
  readonly certifiedBy: string;
  readonly trace: AssessmentCertificationTrace;
  readonly metadata: AssessmentCertificationMetadata;
}

/**
 * Certification metadata.
 * Immutable. Readonly. Deterministic.
 */
export interface AssessmentCertificationMetadata {
  readonly version: string;
  readonly generatedFrom: 'deterministic_certification_engine';
  readonly deterministic: true;
  readonly randomUsed: false;
  readonly timeDependency: false;
  readonly totalDimensions: number;
  readonly checkedDimensions: number;
  readonly findingCount: number;
}

// ============================================================================
// D8-OPT-15 — ASSESSMENT CERTIFICATION VALIDATION CONTRACTS
// ============================================================================

/**
 * Single certification validation error.
 * Immutable. Readonly.
 */
export interface AssessmentCertificationValidationError {
  readonly code: string;
  readonly message: string;
  readonly field?: string;
  readonly entityId?: string;
}

/**
 * Certification validation result.
 * Immutable. Readonly.
 */
export interface AssessmentCertificationValidationResult {
  readonly valid: boolean;
  readonly errors: readonly AssessmentCertificationValidationError[];
  readonly checkedAt: string;
}

// ============================================================================
// D8-OPT-16 — PUBLIC API CONSOLIDATION — Assessment Pipeline Facade
// ============================================================================

/**
 * Canonical assessment facade statuses.
 * Exactly 6 values. Stable forever.
 */
export const CANONICAL_ASSESSMENT_FACADE_STATUS = [
  'available',
  'validated',
  'certified',
  'deprecated',
  'internal',
  'legacy',
] as const;

export type AssessmentFacadeStatus =
  (typeof CANONICAL_ASSESSMENT_FACADE_STATUS)[number];

/**
 * Deterministic trace metadata for facade operations.
 * Immutable. Readonly. No random. No time dependency.
 */
export interface AssessmentFacadeTraceMetadata {
  readonly traceId: string;
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_assessment_facade';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

/**
 * Validation result for facade artifact operations.
 * Immutable. Readonly. Deterministic.
 */
export interface AssessmentFacadeValidationResult {
  readonly valid: boolean;
  readonly errors: readonly AssessmentValidationError[];
  readonly checkedAt: 'facade_validation';
}

/**
 * Result of composeAssessmentArtifact operation.
 * Immutable. Readonly. Deterministic.
 */
export interface AssessmentFacadeArtifactResult {
  readonly status: AssessmentFacadeStatus;
  readonly artifactId: string;
  readonly artifactTitle: string;
  readonly registry: AssessmentRegistry;
  readonly validation: AssessmentRegistryValidationResult;
  readonly trace: AssessmentFacadeTraceMetadata;
}

/**
 * Result of certifyAssessmentFacadeArtifact operation.
 * Immutable. Readonly. Deterministic.
 */
export interface AssessmentFacadeCertificationResult {
  readonly status: AssessmentFacadeStatus;
  readonly artifactId: string;
  readonly certificationReport: AssessmentCertificationReport;
  readonly validation: AssessmentFacadeValidationResult;
  readonly trace: AssessmentFacadeTraceMetadata;
}

/**
 * Result of composeAndCertifyAssessmentArtifact operation.
 * Immutable. Readonly. Deterministic.
 */
export interface AssessmentFacadeCompleteResult {
  readonly status: AssessmentFacadeStatus;
  readonly artifactId: string;
  readonly artifactTitle: string;
  readonly registry: AssessmentRegistry;
  readonly validation: AssessmentRegistryValidationResult;
  readonly certificationReport: AssessmentCertificationReport;
  readonly certificationValidation: AssessmentFacadeValidationResult;
  readonly trace: AssessmentFacadeTraceMetadata;
}

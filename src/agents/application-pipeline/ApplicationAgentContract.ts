/**
 * NV-1900-D7-OPT-01 / D7-OPT-02 / D7-OPT-03 / D7-OPT-04 / D7-OPT-05 / D7-OPT-06 / D7-OPT-07 / D7-OPT-08 / D7-OPT-09 / D7-OPT-10 / D7-OPT-11 / D7-OPT-12 / D7-OPT-13 / D7-OPT-14 — Application Agent Domain Contract
 *
 * Stable internal data model for the Application Contract & Registry Kernel.
 * Defines all types required for deterministic application metadata orchestration,
 * deterministic registry representation, and deterministic provenance tracking.
 *
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
 *
 * This module is purely structural. It contains no runtime logic,
 * no mutable state, no external dependencies, and no probabilistic behavior.
 */

// ---------------------------------------------------------------------------
// Canonical Application Artifact Types (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_APPLICATION_ARTIFACT_TYPES = [
  'use_case',
  'system_architecture',
  'case_study',
  'trade_off',
  'application_flow',
  'engineering_scenario',
  'mlops_pipeline',
  'portfolio_project',
  'deployment_view',
  'visual_application',
] as const;

export type ApplicationArtifactType = (typeof CANONICAL_APPLICATION_ARTIFACT_TYPES)[number];

// ---------------------------------------------------------------------------
// Canonical Application Domains (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_APPLICATION_DOMAINS = [
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

export type ApplicationDomain = (typeof CANONICAL_APPLICATION_DOMAINS)[number];

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
// Canonical Application Governance (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_APPLICATION_GOVERNANCE = [
  'canonical',
  'accepted',
  'provisional',
  'deprecated',
  'rejected',
] as const;

export type ApplicationGovernanceStatus = (typeof CANONICAL_APPLICATION_GOVERNANCE)[number];

// ---------------------------------------------------------------------------
// Application Provenance
// ---------------------------------------------------------------------------

export interface ApplicationProvenance {
  readonly providedBy: string;
  readonly rationale: string;
  readonly reviewedBy: string;
  readonly reviewDate: string;
  readonly governanceStatus: ApplicationGovernanceStatus;
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
  readonly registryVersion: string;
  readonly compositionVersion: string;
  readonly decisions: readonly ApplicationDecision[];
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_application_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Application Node
// ---------------------------------------------------------------------------

export interface ApplicationNode {
  readonly applicationId: string;
  readonly title: string;
  readonly artifactType: ApplicationArtifactType;
  readonly domain: ApplicationDomain;
  readonly status: ApplicationStatus;
  readonly description: string;
  readonly provenance: ApplicationProvenance;
  readonly trace: ApplicationTrace;
}

// ---------------------------------------------------------------------------
// Application Registry Metadata
// ---------------------------------------------------------------------------

export interface ApplicationRegistryMetadata {
  readonly registryId: string;
  readonly nodeCount: number;
  readonly domainCount: number;
  readonly typeCount: number;
}

// ---------------------------------------------------------------------------
// Application Registry
// ---------------------------------------------------------------------------

export interface ApplicationRegistry {
  readonly registryId: string;
  readonly nodes: readonly ApplicationNode[];
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
  readonly nodes: readonly ApplicationNode[];
}

// ---------------------------------------------------------------------------
// Application Validation Error
// ---------------------------------------------------------------------------

export interface ApplicationValidationError {
  readonly code: string;
  readonly message: string;
  readonly field?: string;
  readonly applicationId?: string;
}

// ---------------------------------------------------------------------------
// Application Validation Result
// ---------------------------------------------------------------------------

export interface ApplicationValidationResult {
  readonly valid: boolean;
  readonly errors: readonly ApplicationValidationError[];
}

// ---------------------------------------------------------------------------
// Application Node Validation Result
// ---------------------------------------------------------------------------

export interface ApplicationNodeValidationResult {
  readonly valid: boolean;
  readonly errors: readonly ApplicationValidationError[];
  readonly checkedAt: 'application_node_composition';
}

// ---------------------------------------------------------------------------
// Application Registry Validation Result
// ---------------------------------------------------------------------------

export interface ApplicationRegistryValidationResult {
  readonly valid: boolean;
  readonly errors: readonly ApplicationValidationError[];
  readonly checkedAt: 'application_registry_composition';
}

// ---------------------------------------------------------------------------
// Application Input Validation Result
// ---------------------------------------------------------------------------

export interface ApplicationInputValidationResult {
  readonly valid: boolean;
  readonly errors: readonly ApplicationValidationError[];
  readonly checkedAt: 'application_input_composition';
}

// ---------------------------------------------------------------------------
// Application Trace Validation Result
// ---------------------------------------------------------------------------

export interface ApplicationTraceValidationResult {
  readonly valid: boolean;
  readonly errors: readonly ApplicationValidationError[];
  readonly checkedAt: 'application_trace_composition';
}

// ============================================================================
// D7-OPT-02 — Systematic Use Case Mapping
// ============================================================================

// ---------------------------------------------------------------------------
// Canonical Use Case Types (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_USE_CASE_TYPES = [
  'classification',
  'detection',
  'segmentation',
  'prediction',
  'recommendation',
  'retrieval',
  'generation',
  'optimization',
  'automation',
  'decision_support',
] as const;

export type UseCaseType = (typeof CANONICAL_USE_CASE_TYPES)[number];

// ---------------------------------------------------------------------------
// Canonical Engineering Problem Types (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_ENGINEERING_PROBLEM_TYPES = [
  'computer_vision',
  'nlp',
  'search',
  'recommendation',
  'forecasting',
  'anomaly_detection',
  'quality_control',
  'robotics',
  'scientific_computing',
  'decision_system',
] as const;

export type EngineeringProblemType = (typeof CANONICAL_ENGINEERING_PROBLEM_TYPES)[number];

// ---------------------------------------------------------------------------
// Canonical Business Value Types (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_BUSINESS_VALUE_TYPES = [
  'cost_reduction',
  'automation',
  'accuracy',
  'speed',
  'safety',
  'scalability',
  'personalization',
  'reliability',
  'knowledge_discovery',
  'decision_quality',
] as const;

export type BusinessValueType = (typeof CANONICAL_BUSINESS_VALUE_TYPES)[number];

// ---------------------------------------------------------------------------
// Canonical Application Context Types (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_APPLICATION_CONTEXT_TYPES = [
  'enterprise',
  'healthcare',
  'manufacturing',
  'finance',
  'education',
  'research',
  'agriculture',
  'security',
  'retail',
  'government',
] as const;

export type ApplicationContextType = (typeof CANONICAL_APPLICATION_CONTEXT_TYPES)[number];

// ---------------------------------------------------------------------------
// Canonical Use Case Status (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_USE_CASE_STATUS = [
  'draft',
  'review',
  'approved',
  'published',
  'deprecated',
  'archived',
] as const;

export type UseCaseStatus = (typeof CANONICAL_USE_CASE_STATUS)[number];

// ---------------------------------------------------------------------------
// Use Case Provenance
// ---------------------------------------------------------------------------

export interface UseCaseProvenance {
  readonly providedBy: string;
  readonly rationale: string;
  readonly reviewedBy: string;
  readonly reviewDate: string;
  readonly governanceStatus: ApplicationGovernanceStatus;
}

// ---------------------------------------------------------------------------
// Application Use Case
// ---------------------------------------------------------------------------

export interface ApplicationUseCase {
  readonly useCaseId: string;
  readonly title: string;
  readonly description: string;
  readonly applicationArtifactId: string;
  readonly knowledgeArtifactId: string;
  readonly useCaseType: UseCaseType;
  readonly engineeringProblemType: EngineeringProblemType;
  readonly businessValueType: BusinessValueType;
  readonly applicationContext: ApplicationContextType;
  readonly summary: string;
  readonly provenance: UseCaseProvenance;
}

// ---------------------------------------------------------------------------
// Use Case Relationship
// ---------------------------------------------------------------------------

export interface UseCaseRelationship {
  readonly relationshipId: string;
  readonly sourceUseCase: string;
  readonly targetUseCase: string;
  readonly relationshipType: string;
  readonly provenance: UseCaseProvenance;
}

// ---------------------------------------------------------------------------
// Use Case Decision
// ---------------------------------------------------------------------------

export interface UseCaseDecision {
  readonly decisionId: string;
  readonly useCaseId: string;
  readonly validationPassed: boolean;
  readonly validationErrors: readonly string[];
}

// ---------------------------------------------------------------------------
// Use Case Trace
// ---------------------------------------------------------------------------

export interface UseCaseTrace {
  readonly traceId: string;
  readonly decisionCount: number;
  readonly validationCount: number;
  readonly registryVersion: string;
  readonly compositionVersion: string;
  readonly decisions: readonly UseCaseDecision[];
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_use_case_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Use Case Registry Metadata
// ---------------------------------------------------------------------------

export interface UseCaseRegistryMetadata {
  readonly registryId: string;
  readonly useCaseCount: number;
  readonly relationshipCount: number;
  readonly typeCount: number;
  readonly problemTypeCount: number;
}

// ---------------------------------------------------------------------------
// Use Case Registry
// ---------------------------------------------------------------------------

export interface UseCaseRegistry {
  readonly registryId: string;
  readonly useCases: readonly ApplicationUseCase[];
  readonly relationships: readonly UseCaseRelationship[];
  readonly metadata: UseCaseRegistryMetadata;
  readonly trace: UseCaseTrace;
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_use_case_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Use Case Input
// ---------------------------------------------------------------------------

export interface UseCaseInput {
  readonly useCases: readonly ApplicationUseCase[];
  readonly relationships: readonly UseCaseRelationship[];
}

// ---------------------------------------------------------------------------
// Use Case Validation Error
// ---------------------------------------------------------------------------

export interface UseCaseValidationError {
  readonly code: string;
  readonly message: string;
  readonly field?: string;
  readonly useCaseId?: string;
}

// ---------------------------------------------------------------------------
// Use Case Validation Result
// ---------------------------------------------------------------------------

export interface UseCaseValidationResult {
  readonly valid: boolean;
  readonly errors: readonly UseCaseValidationError[];
}

// ---------------------------------------------------------------------------
// Use Case Node Validation Result
// ---------------------------------------------------------------------------

export interface UseCaseNodeValidationResult {
  readonly valid: boolean;
  readonly errors: readonly UseCaseValidationError[];
  readonly checkedAt: 'use_case_node_composition';
}

// ---------------------------------------------------------------------------
// Use Case Relationship Validation Result
// ---------------------------------------------------------------------------

export interface UseCaseRelationshipValidationResult {
  readonly valid: boolean;
  readonly errors: readonly UseCaseValidationError[];
  readonly checkedAt: 'use_case_relationship_composition';
}

// ---------------------------------------------------------------------------
// Use Case Registry Validation Result
// ---------------------------------------------------------------------------

export interface UseCaseRegistryValidationResult {
  readonly valid: boolean;
  readonly errors: readonly UseCaseValidationError[];
  readonly checkedAt: 'use_case_registry_composition';
}

// ---------------------------------------------------------------------------
// Use Case Input Validation Result
// ---------------------------------------------------------------------------

export interface UseCaseInputValidationResult {
  readonly valid: boolean;
  readonly errors: readonly UseCaseValidationError[];
  readonly checkedAt: 'use_case_input_composition';
}

// ---------------------------------------------------------------------------
// Use Case Trace Validation Result
// ---------------------------------------------------------------------------

export interface UseCaseTraceValidationResult {
  readonly valid: boolean;
  readonly errors: readonly UseCaseValidationError[];
  readonly checkedAt: 'use_case_trace_composition';
}

// ---------------------------------------------------------------------------
// Application Artifact with Use Cases
// ---------------------------------------------------------------------------

export interface ApplicationArtifactWithUseCases {
  readonly applicationNode: ApplicationNode;
  readonly useCaseRegistry: UseCaseRegistry;
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_use_case_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Application Artifact with Use Cases Validation Result
// ---------------------------------------------------------------------------

export interface ApplicationArtifactWithUseCasesValidationResult {
  readonly valid: boolean;
  readonly errors: readonly UseCaseValidationError[];
  readonly checkedAt: 'application_artifact_with_use_cases_composition';
}

// ============================================================================
// D7-OPT-03 — Theory-to-System Architecture Mapping
// ============================================================================

// ---------------------------------------------------------------------------
// Canonical System Architecture Types (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_SYSTEM_ARCHITECTURE_TYPES = [
  'data_pipeline',
  'model_pipeline',
  'computer_vision_pipeline',
  'mlops_pipeline',
  'edge_ai_system',
  'robotics_system',
  'retrieval_system',
  'recommendation_system',
  'monitoring_system',
  'decision_system',
] as const;

export type SystemArchitectureType = (typeof CANONICAL_SYSTEM_ARCHITECTURE_TYPES)[number];

// ---------------------------------------------------------------------------
// Canonical System Component Types (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_SYSTEM_COMPONENT_TYPES = [
  'data_source',
  'sensor_input',
  'preprocessing',
  'feature_extraction',
  'model_inference',
  'postprocessing',
  'decision_logic',
  'storage',
  'api_service',
  'deployment_target',
  'monitoring',
  'feedback_loop',
] as const;

export type SystemComponentType = (typeof CANONICAL_SYSTEM_COMPONENT_TYPES)[number];

// ---------------------------------------------------------------------------
// Canonical Data Flow Types (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_DATA_FLOW_TYPES = [
  'raw_input',
  'validated_input',
  'transformed_data',
  'feature_vector',
  'model_output',
  'prediction',
  'decision_signal',
  'stored_record',
  'monitoring_event',
  'feedback_signal',
] as const;

export type DataFlowType = (typeof CANONICAL_DATA_FLOW_TYPES)[number];

// ---------------------------------------------------------------------------
// Canonical Architecture Layer Types (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_ARCHITECTURE_LAYER_TYPES = [
  'input_layer',
  'data_layer',
  'processing_layer',
  'model_layer',
  'decision_layer',
  'application_layer',
  'deployment_layer',
  'monitoring_layer',
  'governance_layer',
  'feedback_layer',
] as const;

export type ArchitectureLayerType = (typeof CANONICAL_ARCHITECTURE_LAYER_TYPES)[number];

// ---------------------------------------------------------------------------
// Canonical System Constraint Types (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_SYSTEM_CONSTRAINT_TYPES = [
  'latency',
  'throughput',
  'memory',
  'energy',
  'cost',
  'privacy',
  'security',
  'scalability',
  'reliability',
  'maintainability',
] as const;

export type SystemConstraintType = (typeof CANONICAL_SYSTEM_CONSTRAINT_TYPES)[number];

// ---------------------------------------------------------------------------
// Canonical System Architecture Status (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_SYSTEM_ARCHITECTURE_STATUS = [
  'draft',
  'review',
  'approved',
  'published',
  'deprecated',
  'archived',
] as const;

export type SystemArchitectureStatus = (typeof CANONICAL_SYSTEM_ARCHITECTURE_STATUS)[number];

// ---------------------------------------------------------------------------
// System Architecture Provenance
// ---------------------------------------------------------------------------

export interface SystemArchitectureProvenance {
  readonly providedBy: string;
  readonly rationale: string;
  readonly reviewedBy: string;
  readonly reviewDate: string;
  readonly governanceStatus: ApplicationGovernanceStatus;
}

// ---------------------------------------------------------------------------
// System Architecture
// ---------------------------------------------------------------------------

export interface SystemArchitecture {
  readonly architectureId: string;
  readonly title: string;
  readonly description: string;
  readonly architectureType: SystemArchitectureType;
  readonly applicationArtifactId: string;
  readonly knowledgeArtifactId: string;
  readonly useCaseIds: readonly string[];
  readonly componentIds: readonly string[];
  readonly flowIds: readonly string[];
  readonly constraintIds: readonly string[];
  readonly status: SystemArchitectureStatus;
  readonly provenance: SystemArchitectureProvenance;
}

// ---------------------------------------------------------------------------
// System Component
// ---------------------------------------------------------------------------

export interface SystemComponent {
  readonly componentId: string;
  readonly architectureId: string;
  readonly componentType: SystemComponentType;
  readonly title: string;
  readonly description: string;
  readonly relatedConceptId: string;
  readonly layerType: ArchitectureLayerType;
  readonly order: number;
  readonly provenance: SystemArchitectureProvenance;
}

// ---------------------------------------------------------------------------
// System Data Flow
// ---------------------------------------------------------------------------

export interface SystemDataFlow {
  readonly flowId: string;
  readonly architectureId: string;
  readonly sourceComponentId: string;
  readonly targetComponentId: string;
  readonly flowType: DataFlowType;
  readonly description: string;
  readonly provenance: SystemArchitectureProvenance;
}

// ---------------------------------------------------------------------------
// System Constraint
// ---------------------------------------------------------------------------

export interface SystemConstraint {
  readonly constraintId: string;
  readonly architectureId: string;
  readonly constraintType: SystemConstraintType;
  readonly description: string;
  readonly affectedComponentIds: readonly string[];
  readonly provenance: SystemArchitectureProvenance;
}

// ---------------------------------------------------------------------------
// Architecture Decision
// ---------------------------------------------------------------------------

export interface ArchitectureDecision {
  readonly decisionId: string;
  readonly architectureId: string;
  readonly validationPassed: boolean;
  readonly validationErrors: readonly string[];
}

// ---------------------------------------------------------------------------
// Architecture Trace
// ---------------------------------------------------------------------------

export interface ArchitectureTrace {
  readonly traceId: string;
  readonly decisionCount: number;
  readonly validationCount: number;
  readonly registryVersion: string;
  readonly compositionVersion: string;
  readonly decisions: readonly ArchitectureDecision[];
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_architecture_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Architecture Registry Metadata
// ---------------------------------------------------------------------------

export interface ArchitectureRegistryMetadata {
  readonly registryId: string;
  readonly architectureCount: number;
  readonly componentCount: number;
  readonly flowCount: number;
  readonly constraintCount: number;
  readonly typeCount: number;
}

// ---------------------------------------------------------------------------
// Architecture Registry
// ---------------------------------------------------------------------------

export interface ArchitectureRegistry {
  readonly registryId: string;
  readonly architectures: readonly SystemArchitecture[];
  readonly components: readonly SystemComponent[];
  readonly flows: readonly SystemDataFlow[];
  readonly constraints: readonly SystemConstraint[];
  readonly metadata: ArchitectureRegistryMetadata;
  readonly trace: ArchitectureTrace;
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_architecture_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Architecture Input
// ---------------------------------------------------------------------------

export interface ArchitectureInput {
  readonly architectures: readonly SystemArchitecture[];
  readonly components: readonly SystemComponent[];
  readonly flows: readonly SystemDataFlow[];
  readonly constraints: readonly SystemConstraint[];
}

// ---------------------------------------------------------------------------
// Architecture Validation Error
// ---------------------------------------------------------------------------

export interface ArchitectureValidationError {
  readonly code: string;
  readonly message: string;
  readonly field?: string;
  readonly architectureId?: string;
  readonly componentId?: string;
  readonly flowId?: string;
  readonly constraintId?: string;
}

// ---------------------------------------------------------------------------
// Architecture Validation Result
// ---------------------------------------------------------------------------

export interface ArchitectureValidationResult {
  readonly valid: boolean;
  readonly errors: readonly ArchitectureValidationError[];
}

// ---------------------------------------------------------------------------
// Architecture Registry Validation Result
// ---------------------------------------------------------------------------

export interface ArchitectureRegistryValidationResult {
  readonly valid: boolean;
  readonly errors: readonly ArchitectureValidationError[];
  readonly checkedAt: 'architecture_registry_composition';
}

// ---------------------------------------------------------------------------
// Architecture Input Validation Result
// ---------------------------------------------------------------------------

export interface ArchitectureInputValidationResult {
  readonly valid: boolean;
  readonly errors: readonly ArchitectureValidationError[];
  readonly checkedAt: 'architecture_input_composition';
}

// ---------------------------------------------------------------------------
// Architecture Trace Validation Result
// ---------------------------------------------------------------------------

export interface ArchitectureTraceValidationResult {
  readonly valid: boolean;
  readonly errors: readonly ArchitectureValidationError[];
  readonly checkedAt: 'architecture_trace_composition';
}

// ---------------------------------------------------------------------------
// Application Artifact with Architectures
// ---------------------------------------------------------------------------

export interface ApplicationArtifactWithArchitectures {
  readonly applicationNode: ApplicationNode;
  readonly architectureRegistry: ArchitectureRegistry;
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_architecture_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Application Artifact with Architectures Validation Result
// ---------------------------------------------------------------------------

export interface ApplicationArtifactWithArchitecturesValidationResult {
  readonly valid: boolean;
  readonly errors: readonly ArchitectureValidationError[];
  readonly checkedAt: 'application_artifact_with_architectures_composition';
}

// ============================================================================
// D7-OPT-04 — Complete Case Study Modeling
// ============================================================================

// ---------------------------------------------------------------------------
// Canonical Case Study Types (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_CASE_STUDY_TYPES = [
  'industrial',
  'academic',
  'research',
  'production',
  'prototype',
  'benchmark',
  'deployment',
  'migration',
  'optimization',
  'validation',
] as const;

export type CaseStudyType = (typeof CANONICAL_CASE_STUDY_TYPES)[number];

// ---------------------------------------------------------------------------
// Canonical Case Study Problem Domains (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_CASE_STUDY_PROBLEM_DOMAINS = [
  'computer_vision',
  'natural_language_processing',
  'speech',
  'recommendation',
  'robotics',
  'healthcare',
  'manufacturing',
  'finance',
  'scientific_research',
  'multimodal_ai',
] as const;

export type CaseStudyProblemDomain = (typeof CANONICAL_CASE_STUDY_PROBLEM_DOMAINS)[number];

// ---------------------------------------------------------------------------
// Canonical Dataset Roles (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_DATASET_ROLES = [
  'training',
  'validation',
  'testing',
  'benchmark',
  'production',
  'monitoring',
  'fine_tuning',
  'evaluation',
  'synthetic',
  'reference',
] as const;

export type DatasetRole = (typeof CANONICAL_DATASET_ROLES)[number];

// ---------------------------------------------------------------------------
// Canonical Engineering Decision Types (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_ENGINEERING_DECISION_TYPES = [
  'model_selection',
  'architecture_selection',
  'deployment_strategy',
  'hardware_selection',
  'optimization',
  'monitoring',
  'scalability',
  'security',
  'cost',
  'maintainability',
] as const;

export type EngineeringDecisionType = (typeof CANONICAL_ENGINEERING_DECISION_TYPES)[number];

// ---------------------------------------------------------------------------
// Canonical Case Study Lesson Types (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_CASE_STUDY_LESSON_TYPES = [
  'performance',
  'scalability',
  'robustness',
  'reliability',
  'deployment',
  'monitoring',
  'maintenance',
  'cost',
  'engineering',
  'governance',
] as const;

export type CaseStudyLessonType = (typeof CANONICAL_CASE_STUDY_LESSON_TYPES)[number];

// ---------------------------------------------------------------------------
// Canonical Case Study Status (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_CASE_STUDY_STATUS = [
  'draft',
  'review',
  'approved',
  'published',
  'deprecated',
  'archived',
] as const;

export type CaseStudyStatus = (typeof CANONICAL_CASE_STUDY_STATUS)[number];

// ---------------------------------------------------------------------------
// Case Study Provenance
// ---------------------------------------------------------------------------

export interface CaseStudyProvenance {
  readonly providedBy: string;
  readonly rationale: string;
  readonly reviewedBy: string;
  readonly reviewDate: string;
  readonly governanceStatus: ApplicationGovernanceStatus;
}

// ---------------------------------------------------------------------------
// Application Case Study
// ---------------------------------------------------------------------------

export interface ApplicationCaseStudy {
  readonly caseStudyId: string;
  readonly title: string;
  readonly description: string;
  readonly caseStudyType: CaseStudyType;
  readonly problemDomain: CaseStudyProblemDomain;
  readonly applicationArtifactId: string;
  readonly knowledgeArtifactId: string;
  readonly architectureIds: readonly string[];
  readonly useCaseIds: readonly string[];
  readonly summary: string;
  readonly status: CaseStudyStatus;
  readonly provenance: CaseStudyProvenance;
}

// ---------------------------------------------------------------------------
// Case Study Dataset
// ---------------------------------------------------------------------------

export interface CaseStudyDataset {
  readonly datasetId: string;
  readonly caseStudyId: string;
  readonly datasetName: string;
  readonly datasetRole: DatasetRole;
  readonly description: string;
  readonly provenance: CaseStudyProvenance;
}

// ---------------------------------------------------------------------------
// Engineering Decision
// ---------------------------------------------------------------------------

export interface EngineeringDecision {
  readonly decisionId: string;
  readonly caseStudyId: string;
  readonly decisionType: EngineeringDecisionType;
  readonly description: string;
  readonly rationale: string;
  readonly provenance: CaseStudyProvenance;
}

// ---------------------------------------------------------------------------
// Engineering Lesson
// ---------------------------------------------------------------------------

export interface EngineeringLesson {
  readonly lessonId: string;
  readonly caseStudyId: string;
  readonly lessonType: CaseStudyLessonType;
  readonly description: string;
  readonly provenance: CaseStudyProvenance;
}

// ---------------------------------------------------------------------------
// Case Study Decision
// ---------------------------------------------------------------------------

export interface CaseStudyDecision {
  readonly decisionId: string;
  readonly caseStudyId: string;
  readonly validationPassed: boolean;
  readonly validationErrors: readonly string[];
}

// ---------------------------------------------------------------------------
// Case Study Trace
// ---------------------------------------------------------------------------

export interface CaseStudyTrace {
  readonly traceId: string;
  readonly decisionCount: number;
  readonly validationCount: number;
  readonly registryVersion: string;
  readonly compositionVersion: string;
  readonly decisions: readonly CaseStudyDecision[];
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_case_study_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Case Study Registry Metadata
// ---------------------------------------------------------------------------

export interface CaseStudyRegistryMetadata {
  readonly registryId: string;
  readonly caseStudyCount: number;
  readonly datasetCount: number;
  readonly decisionCount: number;
  readonly lessonCount: number;
  readonly typeCount: number;
}

// ---------------------------------------------------------------------------
// Case Study Registry
// ---------------------------------------------------------------------------

export interface CaseStudyRegistry {
  readonly registryId: string;
  readonly caseStudies: readonly ApplicationCaseStudy[];
  readonly datasets: readonly CaseStudyDataset[];
  readonly decisions: readonly EngineeringDecision[];
  readonly lessons: readonly EngineeringLesson[];
  readonly metadata: CaseStudyRegistryMetadata;
  readonly trace: CaseStudyTrace;
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_case_study_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Case Study Input
// ---------------------------------------------------------------------------

export interface CaseStudyInput {
  readonly caseStudies: readonly ApplicationCaseStudy[];
  readonly datasets: readonly CaseStudyDataset[];
  readonly decisions: readonly EngineeringDecision[];
  readonly lessons: readonly EngineeringLesson[];
}

// ---------------------------------------------------------------------------
// Case Study Validation Error
// ---------------------------------------------------------------------------

export interface CaseStudyValidationError {
  readonly code: string;
  readonly message: string;
  readonly field?: string;
  readonly caseStudyId?: string;
  readonly datasetId?: string;
  readonly decisionId?: string;
  readonly lessonId?: string;
}

// ---------------------------------------------------------------------------
// Case Study Validation Result
// ---------------------------------------------------------------------------

export interface CaseStudyValidationResult {
  readonly valid: boolean;
  readonly errors: readonly CaseStudyValidationError[];
}

// ---------------------------------------------------------------------------
// Case Study Registry Validation Result
// ---------------------------------------------------------------------------

export interface CaseStudyRegistryValidationResult {
  readonly valid: boolean;
  readonly errors: readonly CaseStudyValidationError[];
  readonly checkedAt: 'case_study_registry_composition';
}

// ---------------------------------------------------------------------------
// Case Study Input Validation Result
// ---------------------------------------------------------------------------

export interface CaseStudyInputValidationResult {
  readonly valid: boolean;
  readonly errors: readonly CaseStudyValidationError[];
  readonly checkedAt: 'case_study_input_composition';
}

// ---------------------------------------------------------------------------
// Case Study Trace Validation Result
// ---------------------------------------------------------------------------

export interface CaseStudyTraceValidationResult {
  readonly valid: boolean;
  readonly errors: readonly CaseStudyValidationError[];
  readonly checkedAt: 'case_study_trace_composition';
}

// ---------------------------------------------------------------------------
// Application Artifact with Case Studies
// ---------------------------------------------------------------------------

export interface ApplicationArtifactWithCaseStudies {
  readonly applicationNode: ApplicationNode;
  readonly caseStudyRegistry: CaseStudyRegistry;
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_case_study_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Application Artifact with Case Studies Validation Result
// ---------------------------------------------------------------------------

export interface ApplicationArtifactWithCaseStudiesValidationResult {
  readonly valid: boolean;
  readonly errors: readonly CaseStudyValidationError[];
  readonly checkedAt: 'application_artifact_with_case_studies_composition';
}

// ============================================================================
// D7-OPT-05 — Engineering Trade-Off Analysis
// ============================================================================

// ---------------------------------------------------------------------------
// Canonical Trade-Off Types (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_TRADE_OFF_TYPES = [
  'accuracy_latency',
  'accuracy_memory',
  'accuracy_cost',
  'latency_memory',
  'latency_energy',
  'throughput_latency',
  'performance_interpretability',
  'scalability_cost',
  'robustness_complexity',
  'deployment_maintainability',
] as const;

export type TradeOffType = (typeof CANONICAL_TRADE_OFF_TYPES)[number];

// ---------------------------------------------------------------------------
// Canonical Engineering Dimensions (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_ENGINEERING_DIMENSIONS = [
  'accuracy',
  'latency',
  'throughput',
  'memory',
  'energy',
  'cost',
  'robustness',
  'reliability',
  'scalability',
  'interpretability',
  'maintainability',
  'security',
] as const;

export type EngineeringDimension = (typeof CANONICAL_ENGINEERING_DIMENSIONS)[number];

// ---------------------------------------------------------------------------
// Canonical Trade-Off Severity (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_TRADE_OFF_SEVERITY = [
  'minimal',
  'moderate',
  'significant',
  'critical',
  'blocking',
] as const;

export type TradeOffSeverity = (typeof CANONICAL_TRADE_OFF_SEVERITY)[number];

// ---------------------------------------------------------------------------
// Canonical Decision Drivers (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_DECISION_DRIVERS = [
  'business_requirement',
  'technical_constraint',
  'hardware_constraint',
  'deployment_constraint',
  'regulatory_requirement',
  'security_requirement',
  'cost_constraint',
  'performance_requirement',
  'scalability_requirement',
  'maintainability_requirement',
] as const;

export type DecisionDriver = (typeof CANONICAL_DECISION_DRIVERS)[number];

// ---------------------------------------------------------------------------
// Canonical Trade-Off Status (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_TRADE_OFF_STATUS = [
  'draft',
  'review',
  'approved',
  'published',
  'deprecated',
  'archived',
] as const;

export type TradeOffStatus = (typeof CANONICAL_TRADE_OFF_STATUS)[number];

// ---------------------------------------------------------------------------
// Trade-Off Provenance
// ---------------------------------------------------------------------------

export interface TradeOffProvenance {
  readonly providedBy: string;
  readonly rationale: string;
  readonly reviewedBy: string;
  readonly reviewDate: string;
  readonly governanceStatus: ApplicationGovernanceStatus;
}

// ---------------------------------------------------------------------------
// Engineering Trade-Off
// ---------------------------------------------------------------------------

export interface EngineeringTradeOff {
  readonly tradeOffId: string;
  readonly title: string;
  readonly description: string;
  readonly tradeOffType: TradeOffType;
  readonly severity: TradeOffSeverity;
  readonly applicationArtifactId: string;
  readonly knowledgeArtifactId: string;
  readonly architectureId: string;
  readonly caseStudyId: string;
  readonly decisionDriver: DecisionDriver;
  readonly status: TradeOffStatus;
  readonly provenance: TradeOffProvenance;
}

// ---------------------------------------------------------------------------
// Trade-Off Dimension
// ---------------------------------------------------------------------------

export interface TradeOffDimension {
  readonly dimensionId: string;
  readonly tradeOffId: string;
  readonly dimension: EngineeringDimension;
  readonly effect: 'improved' | 'neutral' | 'degraded';
  readonly description: string;
  readonly provenance: TradeOffProvenance;
}

// ---------------------------------------------------------------------------
// Trade-Off Relationship
// ---------------------------------------------------------------------------

export interface TradeOffRelationship {
  readonly relationshipId: string;
  readonly sourceTradeOffId: string;
  readonly targetTradeOffId: string;
  readonly relationshipType: string;
  readonly provenance: TradeOffProvenance;
}

// ---------------------------------------------------------------------------
// Trade-Off Decision
// ---------------------------------------------------------------------------

export interface TradeOffDecision {
  readonly decisionId: string;
  readonly tradeOffId: string;
  readonly validationPassed: boolean;
  readonly validationErrors: readonly string[];
}

// ---------------------------------------------------------------------------
// Trade-Off Trace
// ---------------------------------------------------------------------------

export interface TradeOffTrace {
  readonly traceId: string;
  readonly decisionCount: number;
  readonly validationCount: number;
  readonly registryVersion: string;
  readonly compositionVersion: string;
  readonly decisions: readonly TradeOffDecision[];
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_trade_off_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Trade-Off Registry Metadata
// ---------------------------------------------------------------------------

export interface TradeOffRegistryMetadata {
  readonly registryId: string;
  readonly tradeOffCount: number;
  readonly dimensionCount: number;
  readonly relationshipCount: number;
  readonly typeCount: number;
}

// ---------------------------------------------------------------------------
// Trade-Off Registry
// ---------------------------------------------------------------------------

export interface TradeOffRegistry {
  readonly registryId: string;
  readonly tradeOffs: readonly EngineeringTradeOff[];
  readonly dimensions: readonly TradeOffDimension[];
  readonly relationships: readonly TradeOffRelationship[];
  readonly metadata: TradeOffRegistryMetadata;
  readonly trace: TradeOffTrace;
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_trade_off_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Trade-Off Input
// ---------------------------------------------------------------------------

export interface TradeOffInput {
  readonly tradeOffs: readonly EngineeringTradeOff[];
  readonly dimensions: readonly TradeOffDimension[];
  readonly relationships: readonly TradeOffRelationship[];
}

// ---------------------------------------------------------------------------
// Trade-Off Validation Error
// ---------------------------------------------------------------------------

export interface TradeOffValidationError {
  readonly code: string;
  readonly message: string;
  readonly field?: string;
  readonly tradeOffId?: string;
  readonly dimensionId?: string;
  readonly relationshipId?: string;
}

// ---------------------------------------------------------------------------
// Trade-Off Validation Result
// ---------------------------------------------------------------------------

export interface TradeOffValidationResult {
  readonly valid: boolean;
  readonly errors: readonly TradeOffValidationError[];
}

// ---------------------------------------------------------------------------
// Trade-Off Registry Validation Result
// ---------------------------------------------------------------------------

export interface TradeOffRegistryValidationResult {
  readonly valid: boolean;
  readonly errors: readonly TradeOffValidationError[];
  readonly checkedAt: 'trade_off_registry_composition';
}

// ---------------------------------------------------------------------------
// Trade-Off Input Validation Result
// ---------------------------------------------------------------------------

export interface TradeOffInputValidationResult {
  readonly valid: boolean;
  readonly errors: readonly TradeOffValidationError[];
  readonly checkedAt: 'trade_off_input_composition';
}

// ---------------------------------------------------------------------------
// Trade-Off Trace Validation Result
// ---------------------------------------------------------------------------

export interface TradeOffTraceValidationResult {
  readonly valid: boolean;
  readonly errors: readonly TradeOffValidationError[];
  readonly checkedAt: 'trade_off_trace_composition';
}

// ---------------------------------------------------------------------------
// Application Artifact with Trade-Offs
// ---------------------------------------------------------------------------

export interface ApplicationArtifactWithTradeOffs {
  readonly applicationNode: ApplicationNode;
  readonly tradeOffRegistry: TradeOffRegistry;
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_trade_off_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Application Artifact with Trade-Offs Validation Result
// ---------------------------------------------------------------------------

export interface ApplicationArtifactWithTradeOffsValidationResult {
  readonly valid: boolean;
  readonly errors: readonly TradeOffValidationError[];
  readonly checkedAt: 'application_artifact_with_trade_offs_composition';
}

// ============================================================================
// D7-OPT-06 — Laboratory Application Integration
// ============================================================================

// ---------------------------------------------------------------------------
// Canonical Laboratory Integration Types (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_LABORATORY_INTEGRATION_TYPES = [
  'concept_demonstration',
  'algorithm_visualization',
  'parameter_exploration',
  'architecture_validation',
  'engineering_simulation',
  'workflow_demonstration',
  'performance_analysis',
  'comparison_experiment',
  'failure_analysis',
  'deployment_simulation',
] as const;

export type LaboratoryIntegrationType = (typeof CANONICAL_LABORATORY_INTEGRATION_TYPES)[number];

// ---------------------------------------------------------------------------
// Canonical Laboratory Mapping Types (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_LABORATORY_MAPPING_TYPES = [
  'primary',
  'secondary',
  'supporting',
  'optional',
  'advanced',
  'recommended',
  'mandatory',
  'curriculum',
  'portfolio',
  'reference',
] as const;

export type LaboratoryMappingType = (typeof CANONICAL_LABORATORY_MAPPING_TYPES)[number];

// ---------------------------------------------------------------------------
// Canonical Laboratory Objective Types (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_LABORATORY_OBJECTIVE_TYPES = [
  'understanding',
  'experimentation',
  'validation',
  'comparison',
  'exploration',
  'visualization',
  'optimization',
  'analysis',
  'debugging',
  'reflection',
] as const;

export type LaboratoryObjectiveType = (typeof CANONICAL_LABORATORY_OBJECTIVE_TYPES)[number];

// ---------------------------------------------------------------------------
// Canonical Laboratory Evidence Types (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_LABORATORY_EVIDENCE_TYPES = [
  'visualization',
  'measurement',
  'comparison',
  'observation',
  'configuration',
  'prediction',
  'reflection',
  'result_artifact',
  'workflow_trace',
  'execution_metadata',
] as const;

export type LaboratoryEvidenceType = (typeof CANONICAL_LABORATORY_EVIDENCE_TYPES)[number];

// ---------------------------------------------------------------------------
// Canonical Laboratory Integration Status (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_LABORATORY_INTEGRATION_STATUS = [
  'draft',
  'review',
  'approved',
  'published',
  'deprecated',
  'archived',
] as const;

export type LaboratoryIntegrationStatus = (typeof CANONICAL_LABORATORY_INTEGRATION_STATUS)[number];

// ---------------------------------------------------------------------------
// Laboratory Integration Provenance
// ---------------------------------------------------------------------------

export interface LaboratoryIntegrationProvenance {
  readonly providedBy: string;
  readonly rationale: string;
  readonly reviewedBy: string;
  readonly reviewDate: string;
  readonly governanceStatus: ApplicationGovernanceStatus;
}

// ---------------------------------------------------------------------------
// Application Laboratory Integration
// ---------------------------------------------------------------------------

export interface ApplicationLaboratoryIntegration {
  readonly integrationId: string;
  readonly title: string;
  readonly description: string;
  readonly applicationArtifactId: string;
  readonly knowledgeArtifactId: string;
  readonly laboratoryId: string;
  readonly integrationType: LaboratoryIntegrationType;
  readonly mappingType: LaboratoryMappingType;
  readonly objectiveType: LaboratoryObjectiveType;
  readonly status: LaboratoryIntegrationStatus;
  readonly provenance: LaboratoryIntegrationProvenance;
}

// ---------------------------------------------------------------------------
// Laboratory Evidence Reference
// ---------------------------------------------------------------------------

export interface LaboratoryEvidenceReference {
  readonly evidenceId: string;
  readonly integrationId: string;
  readonly evidenceType: LaboratoryEvidenceType;
  readonly description: string;
  readonly laboratoryArtifactReference: string;
  readonly provenance: LaboratoryIntegrationProvenance;
}

// ---------------------------------------------------------------------------
// Laboratory Integration Relationship
// ---------------------------------------------------------------------------

export interface LaboratoryIntegrationRelationship {
  readonly relationshipId: string;
  readonly sourceIntegrationId: string;
  readonly targetIntegrationId: string;
  readonly relationshipType: string;
  readonly provenance: LaboratoryIntegrationProvenance;
}

// ---------------------------------------------------------------------------
// Laboratory Integration Decision
// ---------------------------------------------------------------------------

export interface LaboratoryIntegrationDecision {
  readonly decisionId: string;
  readonly integrationId: string;
  readonly validationPassed: boolean;
  readonly validationErrors: readonly string[];
}

// ---------------------------------------------------------------------------
// Laboratory Integration Trace
// ---------------------------------------------------------------------------

export interface LaboratoryIntegrationTrace {
  readonly traceId: string;
  readonly decisionCount: number;
  readonly validationCount: number;
  readonly registryVersion: string;
  readonly compositionVersion: string;
  readonly decisions: readonly LaboratoryIntegrationDecision[];
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_laboratory_integration_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Laboratory Integration Registry Metadata
// ---------------------------------------------------------------------------

export interface LaboratoryIntegrationRegistryMetadata {
  readonly registryId: string;
  readonly integrationCount: number;
  readonly evidenceCount: number;
  readonly relationshipCount: number;
  readonly typeCount: number;
}

// ---------------------------------------------------------------------------
// Laboratory Integration Registry
// ---------------------------------------------------------------------------

export interface LaboratoryIntegrationRegistry {
  readonly registryId: string;
  readonly integrations: readonly ApplicationLaboratoryIntegration[];
  readonly evidenceReferences: readonly LaboratoryEvidenceReference[];
  readonly relationships: readonly LaboratoryIntegrationRelationship[];
  readonly metadata: LaboratoryIntegrationRegistryMetadata;
  readonly trace: LaboratoryIntegrationTrace;
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_laboratory_integration_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Laboratory Integration Input
// ---------------------------------------------------------------------------

export interface LaboratoryIntegrationInput {
  readonly integrations: readonly ApplicationLaboratoryIntegration[];
  readonly evidenceReferences: readonly LaboratoryEvidenceReference[];
  readonly relationships: readonly LaboratoryIntegrationRelationship[];
}

// ---------------------------------------------------------------------------
// Laboratory Integration Validation Error
// ---------------------------------------------------------------------------

export interface LaboratoryIntegrationValidationError {
  readonly code: string;
  readonly message: string;
  readonly field?: string;
  readonly integrationId?: string;
  readonly evidenceId?: string;
  readonly relationshipId?: string;
}

// ---------------------------------------------------------------------------
// Laboratory Integration Validation Result
// ---------------------------------------------------------------------------

export interface LaboratoryIntegrationValidationResult {
  readonly valid: boolean;
  readonly errors: readonly LaboratoryIntegrationValidationError[];
}

// ---------------------------------------------------------------------------
// Laboratory Integration Registry Validation Result
// ---------------------------------------------------------------------------

export interface LaboratoryIntegrationRegistryValidationResult {
  readonly valid: boolean;
  readonly errors: readonly LaboratoryIntegrationValidationError[];
  readonly checkedAt: 'laboratory_integration_registry_composition';
}

// ---------------------------------------------------------------------------
// Laboratory Integration Input Validation Result
// ---------------------------------------------------------------------------

export interface LaboratoryIntegrationInputValidationResult {
  readonly valid: boolean;
  readonly errors: readonly LaboratoryIntegrationValidationError[];
  readonly checkedAt: 'laboratory_integration_input_composition';
}

// ---------------------------------------------------------------------------
// Laboratory Integration Trace Validation Result
// ---------------------------------------------------------------------------

export interface LaboratoryIntegrationTraceValidationResult {
  readonly valid: boolean;
  readonly errors: readonly LaboratoryIntegrationValidationError[];
  readonly checkedAt: 'laboratory_integration_trace_composition';
}

// ---------------------------------------------------------------------------
// Application Artifact with Laboratories
// ---------------------------------------------------------------------------

export interface ApplicationArtifactWithLaboratories {
  readonly applicationNode: ApplicationNode;
  readonly laboratoryIntegrationRegistry: LaboratoryIntegrationRegistry;
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_laboratory_integration_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Application Artifact with Laboratories Validation Result
// ---------------------------------------------------------------------------

export interface ApplicationArtifactWithLaboratoriesValidationResult {
  readonly valid: boolean;
  readonly errors: readonly LaboratoryIntegrationValidationError[];
  readonly checkedAt: 'application_artifact_with_laboratories_composition';
}

// ============================================================================
// D7-OPT-07 — Solution Comparison & Alternative Technique Mapping
// ============================================================================

// ---------------------------------------------------------------------------
// Canonical Solution Types (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_SOLUTION_TYPES = [
  'classical_algorithm',
  'machine_learning',
  'deep_learning',
  'hybrid_system',
  'rule_based',
  'probabilistic',
  'heuristic',
  'optimization',
  'retrieval_augmented',
  'multimodal',
] as const;

export type SolutionType = (typeof CANONICAL_SOLUTION_TYPES)[number];

// ---------------------------------------------------------------------------
// Canonical Comparison Types (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_COMPARISON_TYPES = [
  'architectural',
  'algorithmic',
  'performance',
  'deployment',
  'implementation',
  'scalability',
  'cost',
  'maintainability',
  'interpretability',
  'engineering',
] as const;

export type ComparisonType = (typeof CANONICAL_COMPARISON_TYPES)[number];

// ---------------------------------------------------------------------------
// Canonical Alternative Technique Types (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_ALTERNATIVE_TECHNIQUE_TYPES = [
  'replacement',
  'complementary',
  'simplified',
  'optimized',
  'specialized',
  'generalized',
  'legacy',
  'modern',
  'academic',
  'industrial',
] as const;

export type AlternativeTechniqueType = (typeof CANONICAL_ALTERNATIVE_TECHNIQUE_TYPES)[number];

// ---------------------------------------------------------------------------
// Canonical Comparison Dimensions (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_COMPARISON_DIMENSIONS = [
  'accuracy',
  'latency',
  'throughput',
  'memory',
  'energy',
  'cost',
  'complexity',
  'maintainability',
  'scalability',
  'robustness',
] as const;

export type ComparisonDimension = (typeof CANONICAL_COMPARISON_DIMENSIONS)[number];

// ---------------------------------------------------------------------------
// Canonical Solution Comparison Status (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_SOLUTION_COMPARISON_STATUS = [
  'draft',
  'review',
  'approved',
  'published',
  'deprecated',
  'archived',
] as const;

export type SolutionComparisonStatus = (typeof CANONICAL_SOLUTION_COMPARISON_STATUS)[number];

// ---------------------------------------------------------------------------
// Solution Comparison Provenance
// ---------------------------------------------------------------------------

export interface SolutionComparisonProvenance {
  readonly providedBy: string;
  readonly rationale: string;
  readonly reviewedBy: string;
  readonly reviewDate: string;
  readonly governanceStatus: ApplicationGovernanceStatus;
}

// ---------------------------------------------------------------------------
// Engineering Solution
// ---------------------------------------------------------------------------

export interface EngineeringSolution {
  readonly solutionId: string;
  readonly title: string;
  readonly description: string;
  readonly solutionType: SolutionType;
  readonly applicationArtifactId: string;
  readonly knowledgeArtifactId: string;
  readonly architectureId: string;
  readonly caseStudyId: string;
  readonly status: SolutionComparisonStatus;
  readonly provenance: SolutionComparisonProvenance;
}

// ---------------------------------------------------------------------------
// Solution Comparison
// ---------------------------------------------------------------------------

export interface SolutionComparison {
  readonly comparisonId: string;
  readonly sourceSolutionId: string;
  readonly targetSolutionId: string;
  readonly comparisonType: ComparisonType;
  readonly description: string;
  readonly provenance: SolutionComparisonProvenance;
}

// ---------------------------------------------------------------------------
// Alternative Technique
// ---------------------------------------------------------------------------

export interface AlternativeTechnique {
  readonly alternativeId: string;
  readonly solutionId: string;
  readonly alternativeType: AlternativeTechniqueType;
  readonly description: string;
  readonly relatedKnowledgeArtifactId: string;
  readonly provenance: SolutionComparisonProvenance;
}

// ---------------------------------------------------------------------------
// Comparison Dimension
// ---------------------------------------------------------------------------

export interface ComparisonDimensionEntry {
  readonly dimensionId: string;
  readonly comparisonId: string;
  readonly dimension: ComparisonDimension;
  readonly description: string;
  readonly provenance: SolutionComparisonProvenance;
}

// ---------------------------------------------------------------------------
// Solution Comparison Decision
// ---------------------------------------------------------------------------

export interface SolutionComparisonDecision {
  readonly decisionId: string;
  readonly solutionId: string;
  readonly validationPassed: boolean;
  readonly validationErrors: readonly string[];
}

// ---------------------------------------------------------------------------
// Solution Comparison Trace
// ---------------------------------------------------------------------------

export interface SolutionComparisonTrace {
  readonly traceId: string;
  readonly decisionCount: number;
  readonly validationCount: number;
  readonly registryVersion: string;
  readonly compositionVersion: string;
  readonly decisions: readonly SolutionComparisonDecision[];
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_solution_comparison_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Solution Comparison Registry Metadata
// ---------------------------------------------------------------------------

export interface SolutionComparisonRegistryMetadata {
  readonly registryId: string;
  readonly solutionCount: number;
  readonly comparisonCount: number;
  readonly alternativeCount: number;
  readonly dimensionCount: number;
  readonly typeCount: number;
}

// ---------------------------------------------------------------------------
// Solution Comparison Registry
// ---------------------------------------------------------------------------

export interface SolutionComparisonRegistry {
  readonly registryId: string;
  readonly solutions: readonly EngineeringSolution[];
  readonly comparisons: readonly SolutionComparison[];
  readonly alternatives: readonly AlternativeTechnique[];
  readonly dimensions: readonly ComparisonDimensionEntry[];
  readonly metadata: SolutionComparisonRegistryMetadata;
  readonly trace: SolutionComparisonTrace;
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_solution_comparison_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Solution Comparison Input
// ---------------------------------------------------------------------------

export interface SolutionComparisonInput {
  readonly solutions: readonly EngineeringSolution[];
  readonly comparisons: readonly SolutionComparison[];
  readonly alternatives: readonly AlternativeTechnique[];
  readonly dimensions: readonly ComparisonDimensionEntry[];
}

// ---------------------------------------------------------------------------
// Solution Comparison Validation Error
// ---------------------------------------------------------------------------

export interface SolutionComparisonValidationError {
  readonly code: string;
  readonly message: string;
  readonly field?: string;
  readonly solutionId?: string;
  readonly comparisonId?: string;
  readonly alternativeId?: string;
  readonly dimensionId?: string;
}

// ---------------------------------------------------------------------------
// Solution Comparison Validation Result
// ---------------------------------------------------------------------------

export interface SolutionComparisonValidationResult {
  readonly valid: boolean;
  readonly errors: readonly SolutionComparisonValidationError[];
}

// ---------------------------------------------------------------------------
// Solution Comparison Registry Validation Result
// ---------------------------------------------------------------------------

export interface SolutionComparisonRegistryValidationResult {
  readonly valid: boolean;
  readonly errors: readonly SolutionComparisonValidationError[];
  readonly checkedAt: 'solution_comparison_registry_composition';
}

// ---------------------------------------------------------------------------
// Solution Comparison Input Validation Result
// ---------------------------------------------------------------------------

export interface SolutionComparisonInputValidationResult {
  readonly valid: boolean;
  readonly errors: readonly SolutionComparisonValidationError[];
  readonly checkedAt: 'solution_comparison_input_composition';
}

// ---------------------------------------------------------------------------
// Solution Comparison Trace Validation Result
// ---------------------------------------------------------------------------

export interface SolutionComparisonTraceValidationResult {
  readonly valid: boolean;
  readonly errors: readonly SolutionComparisonValidationError[];
  readonly checkedAt: 'solution_comparison_trace_composition';
}

// ---------------------------------------------------------------------------
// Application Artifact with Solution Comparisons
// ---------------------------------------------------------------------------

export interface ApplicationArtifactWithSolutionComparisons {
  readonly applicationNode: ApplicationNode;
  readonly solutionComparisonRegistry: SolutionComparisonRegistry;
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_solution_comparison_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Application Artifact with Solution Comparisons Validation Result
// ---------------------------------------------------------------------------

export interface ApplicationArtifactWithSolutionComparisonsValidationResult {
  readonly valid: boolean;
  readonly errors: readonly SolutionComparisonValidationError[];
  readonly checkedAt: 'application_artifact_with_solution_comparisons_composition';
}

// ============================================================================
// D7-OPT-08 — Common Adoption Mistakes & Engineering Judgment
// ============================================================================

// ---------------------------------------------------------------------------
// Canonical Engineering Mistake Types (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_ENGINEERING_MISTAKE_TYPES = [
  'incorrect_problem_definition',
  'dataset_misuse',
  'architecture_mismatch',
  'premature_optimization',
  'overengineering',
  'underengineering',
  'deployment_misconfiguration',
  'monitoring_absence',
  'evaluation_bias',
  'maintenance_neglect',
] as const;

export type EngineeringMistakeType = (typeof CANONICAL_ENGINEERING_MISTAKE_TYPES)[number];

// ---------------------------------------------------------------------------
// Canonical Adoption Pitfall Types (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_ADOPTION_PITFALL_TYPES = [
  'technology_hype',
  'poor_requirement_analysis',
  'tool_overselection',
  'insufficient_data',
  'insufficient_validation',
  'missing_monitoring',
  'missing_governance',
  'cost_underestimation',
  'team_skill_gap',
  'infrastructure_mismatch',
] as const;

export type AdoptionPitfallType = (typeof CANONICAL_ADOPTION_PITFALL_TYPES)[number];

// ---------------------------------------------------------------------------
// Canonical Engineering Judgment Types (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_ENGINEERING_JUDGMENT_TYPES = [
  'architecture_selection',
  'technology_selection',
  'deployment_decision',
  'scalability_decision',
  'maintainability_decision',
  'security_decision',
  'cost_decision',
  'performance_decision',
  'operational_decision',
  'governance_decision',
] as const;

export type EngineeringJudgmentType = (typeof CANONICAL_ENGINEERING_JUDGMENT_TYPES)[number];

// ---------------------------------------------------------------------------
// Canonical Engineering Anti-Pattern Types (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_ENGINEERING_ANTI_PATTERN_TYPES = [
  'single_point_of_failure',
  'tight_coupling',
  'hidden_complexity',
  'manual_dependency',
  'missing_validation',
  'missing_observability',
  'hardcoded_configuration',
  'uncontrolled_growth',
  'technical_debt',
  'knowledge_silo',
] as const;

export type EngineeringAntiPatternType = (typeof CANONICAL_ENGINEERING_ANTI_PATTERN_TYPES)[number];

// ---------------------------------------------------------------------------
// Canonical Judgment Severity (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_ENGINEERING_JUDGMENT_SEVERITY = [
  'minor',
  'moderate',
  'major',
  'critical',
  'blocking',
] as const;

export type EngineeringJudgmentSeverity = (typeof CANONICAL_ENGINEERING_JUDGMENT_SEVERITY)[number];

// ---------------------------------------------------------------------------
// Canonical Judgment Status (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_ENGINEERING_JUDGMENT_STATUS = [
  'draft',
  'review',
  'approved',
  'published',
  'deprecated',
  'archived',
] as const;

export type EngineeringJudgmentStatus = (typeof CANONICAL_ENGINEERING_JUDGMENT_STATUS)[number];

// ---------------------------------------------------------------------------
// Engineering Judgment Provenance
// ---------------------------------------------------------------------------

export interface EngineeringJudgmentProvenance {
  readonly providedBy: string;
  readonly rationale: string;
  readonly reviewedBy: string;
  readonly reviewDate: string;
  readonly governanceStatus: ApplicationGovernanceStatus;
}

// ---------------------------------------------------------------------------
// Engineering Mistake
// ---------------------------------------------------------------------------

export interface EngineeringMistake {
  readonly mistakeId: string;
  readonly title: string;
  readonly description: string;
  readonly mistakeType: EngineeringMistakeType;
  readonly applicationArtifactId: string;
  readonly knowledgeArtifactId: string;
  readonly caseStudyId: string;
  readonly severity: EngineeringJudgmentSeverity;
  readonly status: EngineeringJudgmentStatus;
  readonly provenance: EngineeringJudgmentProvenance;
}

// ---------------------------------------------------------------------------
// Adoption Pitfall
// ---------------------------------------------------------------------------

export interface AdoptionPitfall {
  readonly pitfallId: string;
  readonly mistakeId: string;
  readonly pitfallType: AdoptionPitfallType;
  readonly description: string;
  readonly provenance: EngineeringJudgmentProvenance;
}

// ---------------------------------------------------------------------------
// Engineering Judgment
// ---------------------------------------------------------------------------

export interface EngineeringJudgment {
  readonly judgmentId: string;
  readonly mistakeId: string;
  readonly judgmentType: EngineeringJudgmentType;
  readonly description: string;
  readonly provenance: EngineeringJudgmentProvenance;
}

// ---------------------------------------------------------------------------
// Engineering Anti-Pattern
// ---------------------------------------------------------------------------

export interface EngineeringAntiPattern {
  readonly antiPatternId: string;
  readonly mistakeId: string;
  readonly antiPatternType: EngineeringAntiPatternType;
  readonly description: string;
  readonly provenance: EngineeringJudgmentProvenance;
}

// ---------------------------------------------------------------------------
// Engineering Judgment Decision
// ---------------------------------------------------------------------------

export interface EngineeringJudgmentDecision {
  readonly decisionId: string;
  readonly mistakeId: string;
  readonly validationPassed: boolean;
  readonly validationErrors: readonly string[];
}

// ---------------------------------------------------------------------------
// Engineering Judgment Trace
// ---------------------------------------------------------------------------

export interface EngineeringJudgmentTrace {
  readonly traceId: string;
  readonly decisionCount: number;
  readonly validationCount: number;
  readonly registryVersion: string;
  readonly compositionVersion: string;
  readonly decisions: readonly EngineeringJudgmentDecision[];
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_engineering_judgment_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Engineering Judgment Registry Metadata
// ---------------------------------------------------------------------------

export interface EngineeringJudgmentRegistryMetadata {
  readonly registryId: string;
  readonly mistakeCount: number;
  readonly pitfallCount: number;
  readonly judgmentCount: number;
  readonly antiPatternCount: number;
  readonly typeCount: number;
}

// ---------------------------------------------------------------------------
// Engineering Judgment Registry
// ---------------------------------------------------------------------------

export interface EngineeringJudgmentRegistry {
  readonly registryId: string;
  readonly mistakes: readonly EngineeringMistake[];
  readonly pitfalls: readonly AdoptionPitfall[];
  readonly judgments: readonly EngineeringJudgment[];
  readonly antiPatterns: readonly EngineeringAntiPattern[];
  readonly metadata: EngineeringJudgmentRegistryMetadata;
  readonly trace: EngineeringJudgmentTrace;
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_engineering_judgment_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Engineering Judgment Input
// ---------------------------------------------------------------------------

export interface EngineeringJudgmentInput {
  readonly mistakes: readonly EngineeringMistake[];
  readonly pitfalls: readonly AdoptionPitfall[];
  readonly judgments: readonly EngineeringJudgment[];
  readonly antiPatterns: readonly EngineeringAntiPattern[];
}

// ---------------------------------------------------------------------------
// Engineering Judgment Validation Error
// ---------------------------------------------------------------------------

export interface EngineeringJudgmentValidationError {
  readonly code: string;
  readonly message: string;
  readonly field?: string;
  readonly mistakeId?: string;
  readonly pitfallId?: string;
  readonly judgmentId?: string;
  readonly antiPatternId?: string;
}

// ---------------------------------------------------------------------------
// Engineering Judgment Validation Result
// ---------------------------------------------------------------------------

export interface EngineeringJudgmentValidationResult {
  readonly valid: boolean;
  readonly errors: readonly EngineeringJudgmentValidationError[];
}

// ---------------------------------------------------------------------------
// Engineering Judgment Registry Validation Result
// ---------------------------------------------------------------------------

export interface EngineeringJudgmentRegistryValidationResult {
  readonly valid: boolean;
  readonly errors: readonly EngineeringJudgmentValidationError[];
  readonly checkedAt: 'engineering_judgment_registry_composition';
}

// ---------------------------------------------------------------------------
// Engineering Judgment Input Validation Result
// ---------------------------------------------------------------------------

export interface EngineeringJudgmentInputValidationResult {
  readonly valid: boolean;
  readonly errors: readonly EngineeringJudgmentValidationError[];
  readonly checkedAt: 'engineering_judgment_input_composition';
}

// ---------------------------------------------------------------------------
// Engineering Judgment Trace Validation Result
// ---------------------------------------------------------------------------

export interface EngineeringJudgmentTraceValidationResult {
  readonly valid: boolean;
  readonly errors: readonly EngineeringJudgmentValidationError[];
  readonly checkedAt: 'engineering_judgment_trace_composition';
}

// ---------------------------------------------------------------------------
// Application Artifact with Engineering Judgment
// ---------------------------------------------------------------------------

export interface ApplicationArtifactWithEngineeringJudgment {
  readonly applicationNode: ApplicationNode;
  readonly engineeringJudgmentRegistry: EngineeringJudgmentRegistry;
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_engineering_judgment_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Application Artifact with Engineering Judgment Validation Result
// ---------------------------------------------------------------------------

export interface ApplicationArtifactWithEngineeringJudgmentValidationResult {
  readonly valid: boolean;
  readonly errors: readonly EngineeringJudgmentValidationError[];
  readonly checkedAt: 'application_artifact_with_engineering_judgment_composition';
}

// ============================================================================
// D7-OPT-09 — MLOps Lifecycle & Production Constraint Modeling
// ============================================================================

// ---------------------------------------------------------------------------
// Canonical Lifecycle Stages (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_MLOPS_LIFECYCLE_STAGES = [
  'problem_definition',
  'data_collection',
  'data_preparation',
  'model_development',
  'validation',
  'deployment',
  'monitoring',
  'maintenance',
  'continuous_improvement',
  'retirement',
] as const;

export type MLOpsLifecycleStage = (typeof CANONICAL_MLOPS_LIFECYCLE_STAGES)[number];

// ---------------------------------------------------------------------------
// Canonical Production Constraint Types (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_PRODUCTION_CONSTRAINT_TYPES = [
  'latency',
  'throughput',
  'availability',
  'scalability',
  'cost',
  'security',
  'privacy',
  'regulatory',
  'energy',
  'hardware',
] as const;

export type ProductionConstraintType = (typeof CANONICAL_PRODUCTION_CONSTRAINT_TYPES)[number];

// ---------------------------------------------------------------------------
// Canonical Deployment Types (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_DEPLOYMENT_TYPES = [
  'cloud',
  'edge',
  'embedded',
  'on_premise',
  'hybrid',
  'mobile',
  'serverless',
  'containerized',
  'distributed',
  'research_environment',
] as const;

export type DeploymentType = (typeof CANONICAL_DEPLOYMENT_TYPES)[number];

// ---------------------------------------------------------------------------
// Canonical Monitoring Types (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_MONITORING_TYPES = [
  'performance',
  'drift',
  'availability',
  'resource_usage',
  'prediction_quality',
  'latency',
  'throughput',
  'security',
  'logging',
  'observability',
] as const;

export type MonitoringType = (typeof CANONICAL_MONITORING_TYPES)[number];

// ---------------------------------------------------------------------------
// Canonical Production Readiness Levels (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_PRODUCTION_READINESS_LEVELS = [
  'experimental',
  'prototype',
  'pilot',
  'production',
  'mission_critical',
] as const;

export type ProductionReadinessLevel = (typeof CANONICAL_PRODUCTION_READINESS_LEVELS)[number];

// ---------------------------------------------------------------------------
// Canonical MLOps Status (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_MLOPS_STATUS = [
  'draft',
  'review',
  'approved',
  'published',
  'deprecated',
  'archived',
] as const;

export type MLOpsStatus = (typeof CANONICAL_MLOPS_STATUS)[number];

// ---------------------------------------------------------------------------
// MLOps Provenance
// ---------------------------------------------------------------------------

export interface MLOpsProvenance {
  readonly providedBy: string;
  readonly rationale: string;
  readonly reviewedBy: string;
  readonly reviewDate: string;
  readonly governanceStatus: ApplicationGovernanceStatus;
}

// ---------------------------------------------------------------------------
// MLOps Lifecycle
// ---------------------------------------------------------------------------

export interface MLOpsLifecycle {
  readonly lifecycleId: string;
  readonly title: string;
  readonly stage: MLOpsLifecycleStage;
  readonly applicationArtifactId: string;
  readonly knowledgeArtifactId: string;
  readonly architectureId: string;
  readonly status: MLOpsStatus;
  readonly provenance: MLOpsProvenance;
}

// ---------------------------------------------------------------------------
// Production Constraint
// ---------------------------------------------------------------------------

export interface ProductionConstraint {
  readonly constraintId: string;
  readonly lifecycleId: string;
  readonly constraintType: ProductionConstraintType;
  readonly description: string;
  readonly severity: EngineeringJudgmentSeverity;
  readonly provenance: MLOpsProvenance;
}

// ---------------------------------------------------------------------------
// Deployment Profile
// ---------------------------------------------------------------------------

export interface DeploymentProfile {
  readonly deploymentId: string;
  readonly lifecycleId: string;
  readonly deploymentType: DeploymentType;
  readonly readinessLevel: ProductionReadinessLevel;
  readonly description: string;
  readonly provenance: MLOpsProvenance;
}

// ---------------------------------------------------------------------------
// Monitoring Requirement
// ---------------------------------------------------------------------------

export interface MonitoringRequirement {
  readonly monitoringId: string;
  readonly lifecycleId: string;
  readonly monitoringType: MonitoringType;
  readonly description: string;
  readonly provenance: MLOpsProvenance;
}

// ---------------------------------------------------------------------------
// MLOps Decision
// ---------------------------------------------------------------------------

export interface MLOpsDecision {
  readonly decisionId: string;
  readonly lifecycleId: string;
  readonly description: string;
  readonly provenance: MLOpsProvenance;
}

// ---------------------------------------------------------------------------
// MLOps Trace Decision
// ---------------------------------------------------------------------------

export interface MLOpsTraceDecision {
  readonly decisionId: string;
  readonly lifecycleId: string;
  readonly validationPassed: boolean;
  readonly validationErrors: readonly string[];
}

// ---------------------------------------------------------------------------
// MLOps Trace
// ---------------------------------------------------------------------------

export interface MLOpsTrace {
  readonly traceId: string;
  readonly decisionCount: number;
  readonly validationCount: number;
  readonly registryVersion: string;
  readonly compositionVersion: string;
  readonly decisions: readonly MLOpsTraceDecision[];
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_mlops_lifecycle_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// MLOps Registry Metadata
// ---------------------------------------------------------------------------

export interface MLOpsRegistryMetadata {
  readonly registryId: string;
  readonly lifecycleCount: number;
  readonly constraintCount: number;
  readonly deploymentCount: number;
  readonly monitoringCount: number;
  readonly typeCount: number;
}

// ---------------------------------------------------------------------------
// MLOps Registry
// ---------------------------------------------------------------------------

export interface MLOpsRegistry {
  readonly registryId: string;
  readonly lifecycles: readonly MLOpsLifecycle[];
  readonly constraints: readonly ProductionConstraint[];
  readonly deployments: readonly DeploymentProfile[];
  readonly monitoring: readonly MonitoringRequirement[];
  readonly metadata: MLOpsRegistryMetadata;
  readonly trace: MLOpsTrace;
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_mlops_lifecycle_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// MLOps Input
// ---------------------------------------------------------------------------

export interface MLOpsInput {
  readonly lifecycles: readonly MLOpsLifecycle[];
  readonly constraints: readonly ProductionConstraint[];
  readonly deployments: readonly DeploymentProfile[];
  readonly monitoring: readonly MonitoringRequirement[];
}

// ---------------------------------------------------------------------------
// MLOps Validation Error
// ---------------------------------------------------------------------------

export interface MLOpsValidationError {
  readonly code: string;
  readonly message: string;
  readonly field?: string;
  readonly lifecycleId?: string;
  readonly constraintId?: string;
  readonly deploymentId?: string;
  readonly monitoringId?: string;
}

// ---------------------------------------------------------------------------
// MLOps Validation Result
// ---------------------------------------------------------------------------

export interface MLOpsValidationResult {
  readonly valid: boolean;
  readonly errors: readonly MLOpsValidationError[];
}

// ---------------------------------------------------------------------------
// MLOps Registry Validation Result
// ---------------------------------------------------------------------------

export interface MLOpsRegistryValidationResult {
  readonly valid: boolean;
  readonly errors: readonly MLOpsValidationError[];
  readonly checkedAt: 'mlops_registry_composition';
}

// ---------------------------------------------------------------------------
// MLOps Input Validation Result
// ---------------------------------------------------------------------------

export interface MLOpsInputValidationResult {
  readonly valid: boolean;
  readonly errors: readonly MLOpsValidationError[];
  readonly checkedAt: 'mlops_input_composition';
}

// ---------------------------------------------------------------------------
// MLOps Trace Validation Result
// ---------------------------------------------------------------------------

export interface MLOpsTraceValidationResult {
  readonly valid: boolean;
  readonly errors: readonly MLOpsValidationError[];
  readonly checkedAt: 'mlops_trace_composition';
}

// ---------------------------------------------------------------------------
// Application Artifact with MLOps
// ---------------------------------------------------------------------------

export interface ApplicationArtifactWithMLOps {
  readonly applicationNode: ApplicationNode;
  readonly mlopsRegistry: MLOpsRegistry;
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_mlops_lifecycle_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Application Artifact with MLOps Validation Result
// ---------------------------------------------------------------------------

export interface ApplicationArtifactWithMLOpsValidationResult {
  readonly valid: boolean;
  readonly errors: readonly MLOpsValidationError[];
  readonly checkedAt: 'application_artifact_with_mlops_composition';
}

// ============================================================================
// D7-OPT-10 — Technology Maturity Classification
// ============================================================================

// ---------------------------------------------------------------------------
// Canonical Technology Maturity Levels (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_TECHNOLOGY_MATURITY_LEVELS = [
  'research',
  'experimental',
  'prototype',
  'proof_of_concept',
  'early_adoption',
  'growing',
  'established',
  'production_ready',
  'industry_standard',
  'legacy',
] as const;

export type TechnologyMaturityLevel = (typeof CANONICAL_TECHNOLOGY_MATURITY_LEVELS)[number];

// ---------------------------------------------------------------------------
// Canonical Ecosystem Stability Types (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_ECOSYSTEM_STABILITY_TYPES = [
  'unstable',
  'rapidly_evolving',
  'emerging',
  'developing',
  'stable',
  'mature',
  'well_supported',
  'community_driven',
  'enterprise_supported',
  'long_term_supported',
] as const;

export type EcosystemStabilityType = (typeof CANONICAL_ECOSYSTEM_STABILITY_TYPES)[number];

// ---------------------------------------------------------------------------
// Canonical Industry Adoption Types (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_INDUSTRY_ADOPTION_TYPES = [
  'academic',
  'research',
  'startup',
  'small_business',
  'enterprise',
  'government',
  'healthcare',
  'industrial',
  'consumer',
  'cross_industry',
] as const;

export type IndustryAdoptionType = (typeof CANONICAL_INDUSTRY_ADOPTION_TYPES)[number];

// ---------------------------------------------------------------------------
// Canonical Technology Lifecycle Types (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_TECHNOLOGY_LIFECYCLE_TYPES = [
  'emerging',
  'accelerating',
  'growing',
  'mainstream',
  'mature',
  'plateau',
  'declining',
  'sunsetting',
  'historical',
  'foundational',
] as const;

export type TechnologyLifecycleType = (typeof CANONICAL_TECHNOLOGY_LIFECYCLE_TYPES)[number];

// ---------------------------------------------------------------------------
// Canonical Readiness Indicators (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_READINESS_INDICATORS = [
  'documentation',
  'tooling',
  'community',
  'education',
  'deployment',
  'maintenance',
  'monitoring',
  'governance',
  'standardization',
  'ecosystem',
] as const;

export type ReadinessIndicatorType = (typeof CANONICAL_READINESS_INDICATORS)[number];

// ---------------------------------------------------------------------------
// Canonical Technology Maturity Status (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_TECHNOLOGY_MATURITY_STATUS = [
  'draft',
  'review',
  'approved',
  'published',
  'deprecated',
  'archived',
] as const;

export type TechnologyMaturityStatus = (typeof CANONICAL_TECHNOLOGY_MATURITY_STATUS)[number];

// ---------------------------------------------------------------------------
// Technology Maturity Provenance
// ---------------------------------------------------------------------------

export interface TechnologyMaturityProvenance {
  readonly providedBy: string;
  readonly rationale: string;
  readonly reviewedBy: string;
  readonly reviewDate: string;
  readonly governanceStatus: ApplicationGovernanceStatus;
}

// ---------------------------------------------------------------------------
// Technology Maturity Profile
// ---------------------------------------------------------------------------

export interface TechnologyMaturityProfile {
  readonly maturityId: string;
  readonly title: string;
  readonly technologyMaturityLevel: TechnologyMaturityLevel;
  readonly applicationArtifactId: string;
  readonly knowledgeArtifactId: string;
  readonly architectureId: string;
  readonly status: TechnologyMaturityStatus;
  readonly provenance: TechnologyMaturityProvenance;
}

// ---------------------------------------------------------------------------
// Ecosystem Profile
// ---------------------------------------------------------------------------

export interface EcosystemProfile {
  readonly ecosystemId: string;
  readonly maturityId: string;
  readonly ecosystemStability: EcosystemStabilityType;
  readonly description: string;
  readonly provenance: TechnologyMaturityProvenance;
}

// ---------------------------------------------------------------------------
// Industry Adoption Profile
// ---------------------------------------------------------------------------

export interface IndustryAdoptionProfile {
  readonly adoptionId: string;
  readonly maturityId: string;
  readonly industryAdoptionType: IndustryAdoptionType;
  readonly description: string;
  readonly provenance: TechnologyMaturityProvenance;
}

// ---------------------------------------------------------------------------
// Lifecycle Classification
// ---------------------------------------------------------------------------

export interface LifecycleClassification {
  readonly classificationId: string;
  readonly maturityId: string;
  readonly lifecycleType: TechnologyLifecycleType;
  readonly description: string;
  readonly provenance: TechnologyMaturityProvenance;
}

// ---------------------------------------------------------------------------
// Readiness Indicator
// ---------------------------------------------------------------------------

export interface ReadinessIndicator {
  readonly indicatorId: string;
  readonly maturityId: string;
  readonly indicatorType: ReadinessIndicatorType;
  readonly description: string;
  readonly provenance: TechnologyMaturityProvenance;
}

// ---------------------------------------------------------------------------
// Technology Maturity Decision
// ---------------------------------------------------------------------------

export interface TechnologyMaturityDecision {
  readonly decisionId: string;
  readonly maturityId: string;
  readonly description: string;
  readonly provenance: TechnologyMaturityProvenance;
}

// ---------------------------------------------------------------------------
// Technology Maturity Trace Decision
// ---------------------------------------------------------------------------

export interface TechnologyMaturityTraceDecision {
  readonly decisionId: string;
  readonly maturityId: string;
  readonly validationPassed: boolean;
  readonly validationErrors: readonly string[];
}

// ---------------------------------------------------------------------------
// Technology Maturity Trace
// ---------------------------------------------------------------------------

export interface TechnologyMaturityTrace {
  readonly traceId: string;
  readonly decisionCount: number;
  readonly validationCount: number;
  readonly registryVersion: string;
  readonly compositionVersion: string;
  readonly decisions: readonly TechnologyMaturityTraceDecision[];
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_technology_maturity_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Technology Maturity Registry Metadata
// ---------------------------------------------------------------------------

export interface TechnologyMaturityRegistryMetadata {
  readonly registryId: string;
  readonly maturityCount: number;
  readonly ecosystemCount: number;
  readonly adoptionCount: number;
  readonly classificationCount: number;
  readonly indicatorCount: number;
  readonly typeCount: number;
}

// ---------------------------------------------------------------------------
// Technology Maturity Registry
// ---------------------------------------------------------------------------

export interface TechnologyMaturityRegistry {
  readonly registryId: string;
  readonly maturityProfiles: readonly TechnologyMaturityProfile[];
  readonly ecosystemProfiles: readonly EcosystemProfile[];
  readonly adoptionProfiles: readonly IndustryAdoptionProfile[];
  readonly classifications: readonly LifecycleClassification[];
  readonly indicators: readonly ReadinessIndicator[];
  readonly metadata: TechnologyMaturityRegistryMetadata;
  readonly trace: TechnologyMaturityTrace;
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_technology_maturity_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Technology Maturity Input
// ---------------------------------------------------------------------------

export interface TechnologyMaturityInput {
  readonly maturityProfiles: readonly TechnologyMaturityProfile[];
  readonly ecosystemProfiles: readonly EcosystemProfile[];
  readonly adoptionProfiles: readonly IndustryAdoptionProfile[];
  readonly classifications: readonly LifecycleClassification[];
  readonly indicators: readonly ReadinessIndicator[];
}

// ---------------------------------------------------------------------------
// Technology Maturity Validation Error
// ---------------------------------------------------------------------------

export interface TechnologyMaturityValidationError {
  readonly code: string;
  readonly message: string;
  readonly field?: string;
  readonly maturityId?: string;
  readonly ecosystemId?: string;
  readonly adoptionId?: string;
  readonly classificationId?: string;
  readonly indicatorId?: string;
}

// ---------------------------------------------------------------------------
// Technology Maturity Validation Result
// ---------------------------------------------------------------------------

export interface TechnologyMaturityValidationResult {
  readonly valid: boolean;
  readonly errors: readonly TechnologyMaturityValidationError[];
}

// ---------------------------------------------------------------------------
// Technology Maturity Registry Validation Result
// ---------------------------------------------------------------------------

export interface TechnologyMaturityRegistryValidationResult {
  readonly valid: boolean;
  readonly errors: readonly TechnologyMaturityValidationError[];
  readonly checkedAt: 'technology_maturity_registry_composition';
}

// ---------------------------------------------------------------------------
// Technology Maturity Input Validation Result
// ---------------------------------------------------------------------------

export interface TechnologyMaturityInputValidationResult {
  readonly valid: boolean;
  readonly errors: readonly TechnologyMaturityValidationError[];
  readonly checkedAt: 'technology_maturity_input_composition';
}

// ---------------------------------------------------------------------------
// Technology Maturity Trace Validation Result
// ---------------------------------------------------------------------------

export interface TechnologyMaturityTraceValidationResult {
  readonly valid: boolean;
  readonly errors: readonly TechnologyMaturityValidationError[];
  readonly checkedAt: 'technology_maturity_trace_composition';
}

// ---------------------------------------------------------------------------
// Application Artifact with Technology Maturity
// ---------------------------------------------------------------------------

export interface ApplicationArtifactWithTechnologyMaturity {
  readonly applicationNode: ApplicationNode;
  readonly technologyMaturityRegistry: TechnologyMaturityRegistry;
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_technology_maturity_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Application Artifact with Technology Maturity Validation Result
// ---------------------------------------------------------------------------

export interface ApplicationArtifactWithTechnologyMaturityValidationResult {
  readonly valid: boolean;
  readonly errors: readonly TechnologyMaturityValidationError[];
  readonly checkedAt: 'application_artifact_with_technology_maturity_composition';
}

// ============================================================================
// D7-OPT-11 — Portfolio-Oriented Project Mapping
// ============================================================================

// ---------------------------------------------------------------------------
// Canonical Portfolio Project Types (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_PORTFOLIO_PROJECT_TYPES = [
  'computer_vision_system',
  'machine_learning_pipeline',
  'deep_learning_application',
  'generative_ai_solution',
  'mlops_platform',
  'edge_ai_application',
  'robotics_project',
  'research_reproduction',
  'engineering_platform',
  'full_stack_ai_system',
] as const;

export type PortfolioProjectType = (typeof CANONICAL_PORTFOLIO_PROJECT_TYPES)[number];

// ---------------------------------------------------------------------------
// Canonical Deliverable Types (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_PROJECT_DELIVERABLE_TYPES = [
  'source_code',
  'documentation',
  'technical_report',
  'architecture_diagram',
  'dataset',
  'trained_model',
  'deployment_package',
  'demonstration_video',
  'presentation',
  'benchmark_report',
] as const;

export type ProjectDeliverableType = (typeof CANONICAL_PROJECT_DELIVERABLE_TYPES)[number];

// ---------------------------------------------------------------------------
// Canonical Competency Evidence Types (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_PROJECT_COMPETENCY_TYPES = [
  'software_engineering',
  'machine_learning',
  'deep_learning',
  'computer_vision',
  'mlops',
  'system_design',
  'research',
  'optimization',
  'deployment',
  'communication',
] as const;

export type ProjectCompetencyType = (typeof CANONICAL_PROJECT_COMPETENCY_TYPES)[number];

// ---------------------------------------------------------------------------
// Canonical Project Complexity Levels (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_PROJECT_COMPLEXITY_LEVELS = [
  'introductory',
  'intermediate',
  'advanced',
  'professional',
  'expert',
] as const;

export type ProjectComplexityLevel = (typeof CANONICAL_PROJECT_COMPLEXITY_LEVELS)[number];

// ---------------------------------------------------------------------------
// Canonical Portfolio Showcase Types (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_PORTFOLIO_SHOWCASE_TYPES = [
  'github',
  'technical_blog',
  'conference_demo',
  'research_poster',
  'video_demonstration',
  'interactive_demo',
  'documentation_site',
  'portfolio_page',
  'competition_submission',
  'academic_project',
] as const;

export type PortfolioShowcaseType = (typeof CANONICAL_PORTFOLIO_SHOWCASE_TYPES)[number];

// ---------------------------------------------------------------------------
// Canonical Portfolio Status (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_PORTFOLIO_STATUS = [
  'draft',
  'review',
  'approved',
  'published',
  'deprecated',
  'archived',
] as const;

export type PortfolioStatus = (typeof CANONICAL_PORTFOLIO_STATUS)[number];

// ---------------------------------------------------------------------------
// Portfolio Project Provenance
// ---------------------------------------------------------------------------

export interface PortfolioProjectProvenance {
  readonly providedBy: string;
  readonly rationale: string;
  readonly reviewedBy: string;
  readonly reviewDate: string;
  readonly governanceStatus: ApplicationGovernanceStatus;
}

// ---------------------------------------------------------------------------
// Portfolio Project
// ---------------------------------------------------------------------------

export interface PortfolioProject {
  readonly projectId: string;
  readonly title: string;
  readonly description: string;
  readonly projectType: PortfolioProjectType;
  readonly complexityLevel: ProjectComplexityLevel;
  readonly applicationArtifactId: string;
  readonly knowledgeArtifactId: string;
  readonly status: PortfolioStatus;
  readonly provenance: PortfolioProjectProvenance;
}

// ---------------------------------------------------------------------------
// Project Deliverable
// ---------------------------------------------------------------------------

export interface ProjectDeliverable {
  readonly deliverableId: string;
  readonly projectId: string;
  readonly deliverableType: ProjectDeliverableType;
  readonly description: string;
  readonly provenance: PortfolioProjectProvenance;
}

// ---------------------------------------------------------------------------
// Competency Evidence
// ---------------------------------------------------------------------------

export interface CompetencyEvidence {
  readonly competencyId: string;
  readonly projectId: string;
  readonly competencyType: ProjectCompetencyType;
  readonly description: string;
  readonly provenance: PortfolioProjectProvenance;
}

// ---------------------------------------------------------------------------
// Portfolio Showcase
// ---------------------------------------------------------------------------

export interface PortfolioShowcase {
  readonly showcaseId: string;
  readonly projectId: string;
  readonly showcaseType: PortfolioShowcaseType;
  readonly description: string;
  readonly provenance: PortfolioProjectProvenance;
}

// ---------------------------------------------------------------------------
// Portfolio Project Decision
// ---------------------------------------------------------------------------

export interface PortfolioProjectDecision {
  readonly decisionId: string;
  readonly projectId: string;
  readonly description: string;
  readonly provenance: PortfolioProjectProvenance;
}

// ---------------------------------------------------------------------------
// Portfolio Project Trace Decision
// ---------------------------------------------------------------------------

export interface PortfolioProjectTraceDecision {
  readonly decisionId: string;
  readonly projectId: string;
  readonly validationPassed: boolean;
  readonly validationErrors: readonly string[];
}

// ---------------------------------------------------------------------------
// Portfolio Project Trace
// ---------------------------------------------------------------------------

export interface PortfolioProjectTrace {
  readonly traceId: string;
  readonly decisionCount: number;
  readonly validationCount: number;
  readonly registryVersion: string;
  readonly compositionVersion: string;
  readonly decisions: readonly PortfolioProjectTraceDecision[];
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_portfolio_project_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Portfolio Project Registry Metadata
// ---------------------------------------------------------------------------

export interface PortfolioProjectRegistryMetadata {
  readonly registryId: string;
  readonly projectCount: number;
  readonly deliverableCount: number;
  readonly competencyCount: number;
  readonly showcaseCount: number;
  readonly typeCount: number;
}

// ---------------------------------------------------------------------------
// Portfolio Project Registry
// ---------------------------------------------------------------------------

export interface PortfolioProjectRegistry {
  readonly registryId: string;
  readonly projects: readonly PortfolioProject[];
  readonly deliverables: readonly ProjectDeliverable[];
  readonly competencies: readonly CompetencyEvidence[];
  readonly showcases: readonly PortfolioShowcase[];
  readonly metadata: PortfolioProjectRegistryMetadata;
  readonly trace: PortfolioProjectTrace;
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_portfolio_project_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Portfolio Project Input
// ---------------------------------------------------------------------------

export interface PortfolioProjectInput {
  readonly projects: readonly PortfolioProject[];
  readonly deliverables: readonly ProjectDeliverable[];
  readonly competencies: readonly CompetencyEvidence[];
  readonly showcases: readonly PortfolioShowcase[];
}

// ---------------------------------------------------------------------------
// Portfolio Project Validation Error
// ---------------------------------------------------------------------------

export interface PortfolioProjectValidationError {
  readonly code: string;
  readonly message: string;
  readonly field?: string;
  readonly projectId?: string;
  readonly deliverableId?: string;
  readonly competencyId?: string;
  readonly showcaseId?: string;
}

// ---------------------------------------------------------------------------
// Portfolio Project Validation Result
// ---------------------------------------------------------------------------

export interface PortfolioProjectValidationResult {
  readonly valid: boolean;
  readonly errors: readonly PortfolioProjectValidationError[];
}

// ---------------------------------------------------------------------------
// Portfolio Project Registry Validation Result
// ---------------------------------------------------------------------------

export interface PortfolioProjectRegistryValidationResult {
  readonly valid: boolean;
  readonly errors: readonly PortfolioProjectValidationError[];
  readonly checkedAt: 'portfolio_project_registry_composition';
}

// ---------------------------------------------------------------------------
// Portfolio Project Input Validation Result
// ---------------------------------------------------------------------------

export interface PortfolioProjectInputValidationResult {
  readonly valid: boolean;
  readonly errors: readonly PortfolioProjectValidationError[];
  readonly checkedAt: 'portfolio_project_input_composition';
}

// ---------------------------------------------------------------------------
// Portfolio Project Trace Validation Result
// ---------------------------------------------------------------------------

export interface PortfolioProjectTraceValidationResult {
  readonly valid: boolean;
  readonly errors: readonly PortfolioProjectValidationError[];
  readonly checkedAt: 'portfolio_project_trace_composition';
}

// ---------------------------------------------------------------------------
// Application Artifact with Portfolio Projects
// ---------------------------------------------------------------------------

export interface ApplicationArtifactWithPortfolioProjects {
  readonly applicationNode: ApplicationNode;
  readonly portfolioProjectRegistry: PortfolioProjectRegistry;
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_portfolio_project_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Application Artifact with Portfolio Projects Validation Result
// ---------------------------------------------------------------------------

export interface ApplicationArtifactWithPortfolioProjectsValidationResult {
  readonly valid: boolean;
  readonly errors: readonly PortfolioProjectValidationError[];
  readonly checkedAt: 'application_artifact_with_portfolio_projects_composition';
}

// ============================================================================
// D7-OPT-12 — Visual Application Layer & Asset Governance
// ============================================================================

// ---------------------------------------------------------------------------
// Canonical Visual Asset Types (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_VISUAL_ASSET_TYPES = [
  'system_architecture',
  'data_flow_diagram',
  'pipeline_diagram',
  'component_diagram',
  'deployment_diagram',
  'ui_mockup',
  'workflow_visualization',
  'knowledge_map',
  'decision_tree',
  'engineering_illustration',
] as const;

export type VisualAssetType = (typeof CANONICAL_VISUAL_ASSET_TYPES)[number];

// ---------------------------------------------------------------------------
// Canonical Visual Representation Types (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_VISUAL_REPRESENTATION_TYPES = [
  'static',
  'interactive',
  'vector',
  'raster',
  'animated',
  'layered',
  'annotated',
  'schematic',
  'infographic',
  'technical',
] as const;

export type VisualRepresentationType = (typeof CANONICAL_VISUAL_REPRESENTATION_TYPES)[number];

// ---------------------------------------------------------------------------
// Canonical Asset Purpose Types (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_VISUAL_PURPOSE_TYPES = [
  'education',
  'documentation',
  'engineering',
  'presentation',
  'research',
  'debugging',
  'architecture_review',
  'knowledge_transfer',
  'portfolio',
  'communication',
] as const;

export type VisualPurposeType = (typeof CANONICAL_VISUAL_PURPOSE_TYPES)[number];

// ---------------------------------------------------------------------------
// Canonical Visual Relationship Types (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_VISUAL_RELATIONSHIP_TYPES = [
  'application',
  'architecture',
  'knowledge',
  'laboratory',
  'case_study',
  'trade_off',
  'mlops',
  'portfolio',
  'technology',
  'use_case',
] as const;

export type VisualRelationshipType = (typeof CANONICAL_VISUAL_RELATIONSHIP_TYPES)[number];

// ---------------------------------------------------------------------------
// Canonical Governance Levels (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_VISUAL_GOVERNANCE_LEVELS = [
  'draft',
  'reviewed',
  'approved',
  'canonical',
  'archived',
] as const;

export type VisualGovernanceLevel = (typeof CANONICAL_VISUAL_GOVERNANCE_LEVELS)[number];

// ---------------------------------------------------------------------------
// Canonical Visual Asset Status (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_VISUAL_ASSET_STATUS = [
  'draft',
  'review',
  'approved',
  'published',
  'deprecated',
  'archived',
] as const;

export type VisualAssetStatus = (typeof CANONICAL_VISUAL_ASSET_STATUS)[number];

// ---------------------------------------------------------------------------
// Visual Asset Provenance
// ---------------------------------------------------------------------------

export interface VisualAssetProvenance {
  readonly providedBy: string;
  readonly rationale: string;
  readonly reviewedBy: string;
  readonly reviewDate: string;
  readonly governanceStatus: ApplicationGovernanceStatus;
}

// ---------------------------------------------------------------------------
// Visual Asset
// ---------------------------------------------------------------------------

export interface VisualAsset {
  readonly assetId: string;
  readonly title: string;
  readonly assetType: VisualAssetType;
  readonly representationType: VisualRepresentationType;
  readonly purposeType: VisualPurposeType;
  readonly applicationArtifactId: string;
  readonly knowledgeArtifactId: string;
  readonly status: VisualAssetStatus;
  readonly provenance: VisualAssetProvenance;
}

// ---------------------------------------------------------------------------
// Visual Relationship
// ---------------------------------------------------------------------------

export interface VisualRelationship {
  readonly relationshipId: string;
  readonly assetId: string;
  readonly relationshipType: VisualRelationshipType;
  readonly targetId: string;
  readonly description: string;
  readonly provenance: VisualAssetProvenance;
}

// ---------------------------------------------------------------------------
// Visual Governance
// ---------------------------------------------------------------------------

export interface VisualGovernance {
  readonly governanceId: string;
  readonly assetId: string;
  readonly governanceLevel: VisualGovernanceLevel;
  readonly description: string;
  readonly provenance: VisualAssetProvenance;
}

// ---------------------------------------------------------------------------
// Visual Asset Decision
// ---------------------------------------------------------------------------

export interface VisualAssetDecision {
  readonly decisionId: string;
  readonly assetId: string;
  readonly description: string;
  readonly provenance: VisualAssetProvenance;
}

// ---------------------------------------------------------------------------
// Visual Asset Trace Decision
// ---------------------------------------------------------------------------

export interface VisualAssetTraceDecision {
  readonly decisionId: string;
  readonly assetId: string;
  readonly validationPassed: boolean;
  readonly validationErrors: readonly string[];
}

// ---------------------------------------------------------------------------
// Visual Asset Trace
// ---------------------------------------------------------------------------

export interface VisualAssetTrace {
  readonly traceId: string;
  readonly decisionCount: number;
  readonly validationCount: number;
  readonly registryVersion: string;
  readonly compositionVersion: string;
  readonly decisions: readonly VisualAssetTraceDecision[];
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_visual_asset_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Visual Asset Registry Metadata
// ---------------------------------------------------------------------------

export interface VisualAssetRegistryMetadata {
  readonly registryId: string;
  readonly assetCount: number;
  readonly relationshipCount: number;
  readonly governanceCount: number;
  readonly typeCount: number;
}

// ---------------------------------------------------------------------------
// Visual Asset Registry
// ---------------------------------------------------------------------------

export interface VisualAssetRegistry {
  readonly registryId: string;
  readonly assets: readonly VisualAsset[];
  readonly relationships: readonly VisualRelationship[];
  readonly governance: readonly VisualGovernance[];
  readonly metadata: VisualAssetRegistryMetadata;
  readonly trace: VisualAssetTrace;
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_visual_asset_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Visual Asset Input
// ---------------------------------------------------------------------------

export interface VisualAssetInput {
  readonly assets: readonly VisualAsset[];
  readonly relationships: readonly VisualRelationship[];
  readonly governance: readonly VisualGovernance[];
}

// ---------------------------------------------------------------------------
// Visual Asset Validation Error
// ---------------------------------------------------------------------------

export interface VisualAssetValidationError {
  readonly code: string;
  readonly message: string;
  readonly field?: string;
  readonly assetId?: string;
  readonly relationshipId?: string;
  readonly governanceId?: string;
}

// ---------------------------------------------------------------------------
// Visual Asset Validation Result
// ---------------------------------------------------------------------------

export interface VisualAssetValidationResult {
  readonly valid: boolean;
  readonly errors: readonly VisualAssetValidationError[];
}

// ---------------------------------------------------------------------------
// Visual Asset Registry Validation Result
// ---------------------------------------------------------------------------

export interface VisualAssetRegistryValidationResult {
  readonly valid: boolean;
  readonly errors: readonly VisualAssetValidationError[];
  readonly checkedAt: 'visual_asset_registry_composition';
}

// ---------------------------------------------------------------------------
// Visual Asset Input Validation Result
// ---------------------------------------------------------------------------

export interface VisualAssetInputValidationResult {
  readonly valid: boolean;
  readonly errors: readonly VisualAssetValidationError[];
  readonly checkedAt: 'visual_asset_input_composition';
}

// ---------------------------------------------------------------------------
// Visual Asset Trace Validation Result
// ---------------------------------------------------------------------------

export interface VisualAssetTraceValidationResult {
  readonly valid: boolean;
  readonly errors: readonly VisualAssetValidationError[];
  readonly checkedAt: 'visual_asset_trace_composition';
}

// ---------------------------------------------------------------------------
// Application Artifact with Visual Assets
// ---------------------------------------------------------------------------

export interface ApplicationArtifactWithVisualAssets {
  readonly applicationNode: ApplicationNode;
  readonly visualAssetRegistry: VisualAssetRegistry;
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_visual_asset_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Application Artifact with Visual Assets Validation Result
// ---------------------------------------------------------------------------

export interface ApplicationArtifactWithVisualAssetsValidationResult {
  readonly valid: boolean;
  readonly errors: readonly VisualAssetValidationError[];
  readonly checkedAt: 'application_artifact_with_visual_assets_composition';
}

// ============================================================================
// D7-OPT-13 — Application Certification & Structural Quality Gate
// ============================================================================

// ---------------------------------------------------------------------------
// Canonical Certification Status (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_APPLICATION_CERTIFICATION_STATUS = [
  'certified',
  'conditionally_certified',
  'rejected',
  'incomplete',
] as const;

export type ApplicationCertificationStatus = (typeof CANONICAL_APPLICATION_CERTIFICATION_STATUS)[number];

// ---------------------------------------------------------------------------
// Canonical Finding Severity (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_APPLICATION_FINDING_SEVERITY = [
  'warning',
  'error',
  'critical',
] as const;

export type ApplicationFindingSeverity = (typeof CANONICAL_APPLICATION_FINDING_SEVERITY)[number];

// ---------------------------------------------------------------------------
// Canonical Quality Dimensions (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_APPLICATION_QUALITY_DIMENSIONS = [
  'application_registry',
  'use_cases',
  'system_architecture',
  'case_studies',
  'trade_offs',
  'laboratory_integration',
  'solution_comparison',
  'engineering_judgment',
  'mlops_lifecycle',
  'technology_maturity',
  'portfolio_mapping',
  'visual_assets',
  'traceability',
  'governance',
  'determinism',
  'immutability',
  'validation',
  'documentation',
  'cross_agent_boundary',
  'public_api',
] as const;

export type ApplicationQualityDimension = (typeof CANONICAL_APPLICATION_QUALITY_DIMENSIONS)[number];

// ---------------------------------------------------------------------------
// Application Certification Finding
// ---------------------------------------------------------------------------

export interface ApplicationCertificationFinding {
  readonly findingId: string;
  readonly dimension: ApplicationQualityDimension;
  readonly severity: ApplicationFindingSeverity;
  readonly code: string;
  readonly message: string;
}

// ---------------------------------------------------------------------------
// Application Certification Trace
// ---------------------------------------------------------------------------

export interface ApplicationCertificationTrace {
  readonly traceId: string;
  readonly generatedFrom: 'deterministic_application_certification_engine';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Application Certification Report
// ---------------------------------------------------------------------------

export interface ApplicationCertificationReport {
  readonly certificationId: string;
  readonly status: ApplicationCertificationStatus;
  readonly score: number;
  readonly dimensions: readonly ApplicationQualityDimension[];
  readonly findings: readonly ApplicationCertificationFinding[];
  readonly generatedFrom: 'deterministic_application_certification_engine';
  readonly trace: ApplicationCertificationTrace;
  readonly deterministic: true;
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Application Certification Validation Error
// ---------------------------------------------------------------------------

export interface ApplicationCertificationValidationError {
  readonly code: string;
  readonly message: string;
  readonly field?: string;
}

// ---------------------------------------------------------------------------
// Application Certification Validation Result
// ---------------------------------------------------------------------------

export interface ApplicationCertificationValidationResult {
  readonly valid: boolean;
  readonly errors: readonly ApplicationCertificationValidationError[];
}

// ============================================================================
// D7-OPT-14 — Public API Consolidation & Application Pipeline Facade
// ============================================================================

// ---------------------------------------------------------------------------
// Canonical Facade Status (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_APPLICATION_FACADE_STATUS = [
  'composed',
  'certified',
  'failed',
] as const;

export type ApplicationFacadeStatus = (typeof CANONICAL_APPLICATION_FACADE_STATUS)[number];

// ---------------------------------------------------------------------------
// Application Facade Trace Metadata
// ---------------------------------------------------------------------------

export interface ApplicationFacadeTraceMetadata {
  readonly artifactId: string;
  readonly pipelineVersion: string;
  readonly certificationVersion: string;
  readonly generatedBy: string;
  readonly generatedFrom: 'deterministic_application_pipeline_facade';
}

// ---------------------------------------------------------------------------
// Application Facade Validation Result
// ---------------------------------------------------------------------------

export interface ApplicationFacadeValidationResult {
  readonly valid: boolean;
  readonly errors: readonly ApplicationValidationError[];
}

// ---------------------------------------------------------------------------
// Application Facade Artifact Result
// ---------------------------------------------------------------------------

export interface ApplicationFacadeArtifactResult {
  readonly applicationRegistry: ApplicationRegistry;
  readonly status: ApplicationFacadeStatus;
  readonly trace: ApplicationFacadeTraceMetadata;
  readonly deterministic: true;
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Application Facade Certification Result
// ---------------------------------------------------------------------------

export interface ApplicationFacadeCertificationResult {
  readonly applicationRegistry: ApplicationRegistry;
  readonly certification: ApplicationCertificationReport;
  readonly trace: ApplicationFacadeTraceMetadata;
  readonly deterministic: true;
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Application Facade Complete Result
// ---------------------------------------------------------------------------

export interface ApplicationFacadeCompleteResult {
  readonly applicationRegistry: ApplicationRegistry;
  readonly validation: ApplicationFacadeValidationResult;
  readonly certification: ApplicationCertificationReport;
  readonly trace: ApplicationFacadeTraceMetadata;
  readonly deterministic: true;
  readonly randomUsed: false;
  readonly timeDependency: false;
}

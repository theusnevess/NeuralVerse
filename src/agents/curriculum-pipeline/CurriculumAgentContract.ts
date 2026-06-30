/**
 * NV-1500-D3-OPT-01 + D3-OPT-02 + D3-OPT-03 + D3-OPT-04 + D3-OPT-05 + D3-OPT-06 + D3-OPT-07 + D3-OPT-08 + D3-OPT-09 + D3-OPT-10 — Curriculum Agent Domain Contract
 *
 * Stable internal data model for the Curriculum Graph Kernel, Dependency Orchestration,
 * Progression Intelligence, Learning Path Composition, Roadmap Orchestration,
 * Coverage & Gap Analysis, Review & Reinforcement Planning, Evolution & Version Governance,
 * Certification & Structural Quality Gate, and Public API Consolidation Facade.
 * Defines all types required for deterministic curriculum graph representation,
 * dependency orchestration, progression metadata, learning path composition,
 * roadmap orchestration, coverage analysis, review/reinforcement planning,
 * curriculum evolution/version governance, structural quality certification,
 * and the canonical public API facade.
 *
 * This module is purely structural. It contains no runtime logic,
 * no mutable state, no external dependencies, and no probabilistic behavior.
 */

// ---------------------------------------------------------------------------
// Canonical Node Types (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_NODE_TYPES = [
  'learning_path',
  'module',
  'lesson',
  'concept',
  'competency',
  'assessment',
  'laboratory',
  'review',
  'milestone',
  'capstone',
] as const;

export type CurriculumNodeType = (typeof CANONICAL_NODE_TYPES)[number] | 'reinforcement';

// ---------------------------------------------------------------------------
// Canonical Relationship Types (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_RELATIONSHIP_TYPES = [
  'contains',
  'depends_on',
  'requires',
  'introduces',
  'reinforces',
  'assesses',
  'applies',
  'reviews',
  'precedes',
  'maps_to',
] as const;

export type CurriculumRelationshipType = (typeof CANONICAL_RELATIONSHIP_TYPES)[number];

// ---------------------------------------------------------------------------
// Curriculum Node
// ---------------------------------------------------------------------------

export interface CurriculumNode {
  readonly nodeId: string;
  readonly nodeType: CurriculumNodeType;
  readonly referenceId: string;
  readonly source: string;
  readonly governanceStatus: CurriculumGovernanceStatus;
  readonly rationale: string;
  readonly providedBy: string;
}

// ---------------------------------------------------------------------------
// Curriculum Edge
// ---------------------------------------------------------------------------

export interface CurriculumEdge {
  readonly edgeId: string;
  readonly sourceNodeId: string;
  readonly targetNodeId: string;
  readonly relationshipType: CurriculumRelationshipType;
  readonly referenceId: string;
  readonly source: string;
  readonly governanceStatus: CurriculumGovernanceStatus;
  readonly rationale: string;
  readonly providedBy: string;
}

// ---------------------------------------------------------------------------
// Curriculum Governance Status
// ---------------------------------------------------------------------------

export const CANONICAL_GOVERNANCE_STATUSES = [
  'canonical',
  'accepted',
  'provisional',
  'deprecated',
  'rejected',
] as const;

export type CurriculumGovernanceStatus = (typeof CANONICAL_GOVERNANCE_STATUSES)[number];

// ---------------------------------------------------------------------------
// Curriculum Graph
// ---------------------------------------------------------------------------

export interface CurriculumGraph {
  readonly graphId: string;
  readonly graphLabel: string;
  readonly nodes: readonly CurriculumNode[];
  readonly edges: readonly CurriculumEdge[];
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_curriculum_graph_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Curriculum Graph Registry
// ---------------------------------------------------------------------------

export interface CurriculumGraphRegistry {
  readonly registryId: string;
  readonly graphs: readonly CurriculumGraph[];
  readonly nodeCount: number;
  readonly edgeCount: number;
  readonly graphCount: number;
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_curriculum_graph_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Curriculum Graph Provenance
// ---------------------------------------------------------------------------

export interface CurriculumGraphProvenance {
  readonly nodeId: string;
  readonly referenceId: string;
  readonly source: string;
  readonly governanceStatus: CurriculumGovernanceStatus;
  readonly nodeType: CurriculumNodeType;
  readonly rationale: string;
  readonly providedBy: string;
}

// ---------------------------------------------------------------------------
// Curriculum Graph Decision
// ---------------------------------------------------------------------------

export interface CurriculumGraphDecision {
  readonly decisionId: string;
  readonly nodeId: string;
  readonly validationPassed: boolean;
  readonly validationErrors: readonly string[];
}

// ---------------------------------------------------------------------------
// Curriculum Graph Trace
// ---------------------------------------------------------------------------

export interface CurriculumGraphTrace {
  readonly traceId: string;
  readonly graphId: string;
  readonly nodeCount: number;
  readonly edgeCount: number;
  readonly decisionsCount: number;
  readonly validatedCount: number;
  readonly invalidCount: number;
  readonly decisions: readonly CurriculumGraphDecision[];
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_curriculum_graph_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Curriculum Graph Input
// ---------------------------------------------------------------------------

export interface CurriculumGraphInput {
  readonly graphId: string;
  readonly graphLabel: string;
  readonly nodes: readonly CurriculumNode[];
  readonly edges: readonly CurriculumEdge[];
}

// ---------------------------------------------------------------------------
// Curriculum Artifact
// ---------------------------------------------------------------------------

export interface CurriculumArtifact {
  readonly artifactId: string;
  readonly graph: CurriculumGraph;
  readonly trace: CurriculumGraphTrace;
  readonly validation: CurriculumGraphValidationResult;
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_curriculum_graph_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Curriculum Graph Validation Error
// ---------------------------------------------------------------------------

export interface CurriculumGraphValidationError {
  readonly code: string;
  readonly message: string;
  readonly field?: string;
  readonly nodeId?: string;
  readonly edgeId?: string;
}

// ---------------------------------------------------------------------------
// Curriculum Graph Validation Result
// ---------------------------------------------------------------------------

export interface CurriculumGraphValidationResult {
  readonly valid: boolean;
  readonly errors: readonly CurriculumGraphValidationError[];
  readonly checkedAt: 'curriculum_graph_composition';
}

// ---------------------------------------------------------------------------
// Curriculum Graph Status
// ---------------------------------------------------------------------------

export type CurriculumGraphStatus = 'valid' | 'invalid' | 'empty';

// ---------------------------------------------------------------------------
// Curriculum Node Provenance
// ---------------------------------------------------------------------------

export interface CurriculumNodeProvenance {
  readonly nodeId: string;
  readonly referenceId: string;
  readonly source: string;
  readonly governanceStatus: CurriculumGovernanceStatus;
  readonly nodeType: CurriculumNodeType;
  readonly rationale: string;
  readonly providedBy: string;
}

// ---------------------------------------------------------------------------
// Curriculum Edge Provenance
// ---------------------------------------------------------------------------

export interface CurriculumEdgeProvenance {
  readonly edgeId: string;
  readonly referenceId: string;
  readonly relationshipType: CurriculumRelationshipType;
  readonly source: string;
  readonly governanceStatus: CurriculumGovernanceStatus;
  readonly rationale: string;
  readonly providedBy: string;
}

// ============================================================================
// D3-OPT-02 — Curriculum Dependency Orchestration Types
// ============================================================================

// ---------------------------------------------------------------------------
// Canonical Dependency Types (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_DEPENDENCY_TYPES = [
  'required',
  'recommended',
  'optional_background',
  'co_requisite',
  'parallel',
  'review',
  'reinforcement',
  'forward_reference',
  'historical_context',
  'enrichment',
] as const;

export type CurriculumDependencyType = (typeof CANONICAL_DEPENDENCY_TYPES)[number];

// ---------------------------------------------------------------------------
// Curriculum Dependency
// ---------------------------------------------------------------------------

export interface CurriculumDependency {
  readonly dependencyId: string;
  readonly sourceNodeId: string;
  readonly fromNodeId?: string;
  readonly targetNodeId: string;
  readonly toNodeId?: string;
  readonly dependencyType: CurriculumDependencyType;
  readonly source: string;
  readonly governanceStatus: CurriculumGovernanceStatus;
  readonly rationale: string;
  readonly providedBy: string;
}

// ---------------------------------------------------------------------------
// Curriculum Dependency Status
// ---------------------------------------------------------------------------

export type CurriculumDependencyStatus = 'active' | 'deprecated' | 'provisional';

// ---------------------------------------------------------------------------
// Curriculum Dependency Provenance
// ---------------------------------------------------------------------------

export interface CurriculumDependencyProvenance {
  readonly dependencyId: string;
  readonly source: string;
  readonly governanceStatus: CurriculumGovernanceStatus;
  readonly rationale: string;
  readonly providedBy: string;
}

// ---------------------------------------------------------------------------
// Curriculum Dependency Decision
// ---------------------------------------------------------------------------

export interface CurriculumDependencyDecision {
  readonly decisionId: string;
  readonly dependencyId: string;
  readonly validationPassed: boolean;
  readonly validationErrors: readonly string[];
}

// ---------------------------------------------------------------------------
// Curriculum Dependency Trace
// ---------------------------------------------------------------------------

export interface CurriculumDependencyTrace {
  readonly traceId: string;
  readonly registryId: string;
  readonly dependencyCount: number;
  readonly decisionsCount: number;
  readonly validatedCount: number;
  readonly invalidCount: number;
  readonly decisions: readonly CurriculumDependencyDecision[];
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_dependency_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Curriculum Dependency Registry
// ---------------------------------------------------------------------------

export interface CurriculumDependencyRegistry {
  readonly registryId: string;
  readonly graphId: string;
  readonly dependencies: readonly CurriculumDependency[];
  readonly dependencyCount: number;
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_dependency_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Curriculum Dependency Input
// ---------------------------------------------------------------------------

export interface CurriculumDependencyInput {
  readonly registryId?: string;
  readonly graphId?: string;
  readonly dependencies: readonly CurriculumDependency[];
}

// ---------------------------------------------------------------------------
// Curriculum Artifact With Dependencies
// ---------------------------------------------------------------------------

export interface CurriculumArtifactWithDependencies {
  readonly artifactId: string;
  readonly graph: CurriculumGraph;
  readonly dependencyRegistry: CurriculumDependencyRegistry;
  readonly dependencyTrace: CurriculumDependencyTrace;
  readonly validation: CurriculumDependencyValidationResult;
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_dependency_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Curriculum Dependency Validation Error
// ---------------------------------------------------------------------------

export interface CurriculumDependencyValidationError {
  readonly code: string;
  readonly message: string;
  readonly field?: string;
  readonly dependencyId?: string;
  readonly nodeId?: string;
}

// ---------------------------------------------------------------------------
// Curriculum Dependency Validation Result
// ---------------------------------------------------------------------------

export interface CurriculumDependencyValidationResult {
  readonly valid: boolean;
  readonly errors: readonly CurriculumDependencyValidationError[];
  readonly checkedAt: 'curriculum_dependency_orchestration';
}

// ============================================================================
// D3-OPT-03 — Curriculum Progression Intelligence Types
// ============================================================================

// ---------------------------------------------------------------------------
// Canonical Progression States (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_PROGRESSION_STATES = [
  'not_available',
  'available',
  'recommended',
  'blocked',
  'optional',
  'review',
  'reinforcement',
  'completed_by_curriculum',
  'capstone_ready',
  'path_complete',
] as const;

export type CurriculumProgressionState = (typeof CANONICAL_PROGRESSION_STATES)[number];

// ---------------------------------------------------------------------------
// Curriculum Progression Reason
// ---------------------------------------------------------------------------

export interface CurriculumProgressionReason {
  readonly reasonType: string;
  readonly description: string;
  readonly sourceDependencyIds: readonly string[];
}

// ---------------------------------------------------------------------------
// Curriculum Progression Node
// ---------------------------------------------------------------------------

export interface CurriculumProgressionNode {
  readonly progressionId: string;
  readonly curriculumNodeId: string;
  readonly progressionState: CurriculumProgressionState;
  readonly dependencyIds: readonly string[];
  readonly source: string;
  readonly governanceStatus: CurriculumGovernanceStatus;
  readonly rationale: string;
  readonly providedBy: string;
}

// ---------------------------------------------------------------------------
// Curriculum Progression Status
// ---------------------------------------------------------------------------

export type CurriculumProgressionStatus = 'active' | 'deprecated' | 'provisional';

// ---------------------------------------------------------------------------
// Curriculum Progression Provenance
// ---------------------------------------------------------------------------

export interface CurriculumProgressionProvenance {
  readonly progressionId: string;
  readonly source: string;
  readonly governanceStatus: CurriculumGovernanceStatus;
  readonly rationale: string;
  readonly providedBy: string;
}

// ---------------------------------------------------------------------------
// Curriculum Progression Decision
// ---------------------------------------------------------------------------

export interface CurriculumProgressionDecision {
  readonly decisionId: string;
  readonly progressionId: string;
  readonly validationPassed: boolean;
  readonly validationErrors: readonly string[];
}

// ---------------------------------------------------------------------------
// Curriculum Progression Trace
// ---------------------------------------------------------------------------

export interface CurriculumProgressionTrace {
  readonly traceId: string;
  readonly registryId: string;
  readonly progressionCount: number;
  readonly decisionsCount: number;
  readonly validatedCount: number;
  readonly invalidCount: number;
  readonly decisions: readonly CurriculumProgressionDecision[];
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_progression_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Curriculum Progression Registry
// ---------------------------------------------------------------------------

export interface CurriculumProgressionRegistry {
  readonly registryId: string;
  readonly graphId: string;
  readonly progressions: readonly CurriculumProgressionNode[];
  readonly progressionCount: number;
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_progression_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Curriculum Progression Input
// ---------------------------------------------------------------------------

export interface CurriculumProgressionInput {
  readonly registryId: string;
  readonly graphId: string;
  readonly progressions: readonly CurriculumProgressionNode[];
}

// ---------------------------------------------------------------------------
// Curriculum Artifact With Progression
// ---------------------------------------------------------------------------

export interface CurriculumArtifactWithProgression {
  readonly artifactId: string;
  readonly graph: CurriculumGraph;
  readonly progressionRegistry: CurriculumProgressionRegistry;
  readonly progressionTrace: CurriculumProgressionTrace;
  readonly validation: CurriculumProgressionValidationResult;
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_progression_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Curriculum Progression Validation Error
// ---------------------------------------------------------------------------

export interface CurriculumProgressionValidationError {
  readonly code: string;
  readonly message: string;
  readonly field?: string;
  readonly progressionId?: string;
  readonly nodeId?: string;
}

// ---------------------------------------------------------------------------
// Curriculum Progression Validation Result
// ---------------------------------------------------------------------------

export interface CurriculumProgressionValidationResult {
  readonly valid: boolean;
  readonly errors: readonly CurriculumProgressionValidationError[];
  readonly checkedAt: 'curriculum_progression_intelligence';
}

// ============================================================================
// D3-OPT-04 — Learning Path Composition Types
// ============================================================================

// ---------------------------------------------------------------------------
// Canonical Learning Path Types (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_LEARNING_PATH_TYPES = [
  'foundation',
  'core',
  'specialization',
  'research',
  'laboratory',
  'project',
  'review',
  'capstone',
  'certification',
  'exploration',
] as const;

export type CurriculumLearningPathType = (typeof CANONICAL_LEARNING_PATH_TYPES)[number];

// ---------------------------------------------------------------------------
// Canonical Learning Path Stages (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_LEARNING_PATH_STAGES = [
  'planned',
  'available',
  'active',
  'blocked',
  'optional',
  'review',
  'completed_by_curriculum',
  'terminal',
] as const;

export type CurriculumLearningPathStage = (typeof CANONICAL_LEARNING_PATH_STAGES)[number];

// ---------------------------------------------------------------------------
// Curriculum Learning Path Node
// ---------------------------------------------------------------------------

export interface CurriculumLearningPathNode {
  readonly pathNodeId: string;
  readonly curriculumNodeId: string;
  readonly stage: CurriculumLearningPathStage;
  readonly order: number;
  readonly source: string;
  readonly governanceStatus: CurriculumGovernanceStatus;
  readonly rationale: string;
  readonly providedBy: string;
}

// ---------------------------------------------------------------------------
// Curriculum Learning Path
// ---------------------------------------------------------------------------

export interface CurriculumLearningPath {
  readonly pathId: string;
  readonly title?: string;
  readonly pathType: CurriculumLearningPathType;
  readonly pathLabel: string;
  readonly orderedNodeIds: readonly string[];
  readonly entryNodeId: string;
  readonly terminalNodeId: string;
  readonly source: string;
  readonly governanceStatus: CurriculumGovernanceStatus;
  readonly rationale: string;
  readonly providedBy: string;
}

// ---------------------------------------------------------------------------
// Curriculum Learning Path Status
// ---------------------------------------------------------------------------

export type CurriculumLearningPathStatus = 'active' | 'deprecated' | 'provisional';

// ---------------------------------------------------------------------------
// Curriculum Learning Path Provenance
// ---------------------------------------------------------------------------

export interface CurriculumLearningPathProvenance {
  readonly pathId: string;
  readonly source: string;
  readonly governanceStatus: CurriculumGovernanceStatus;
  readonly rationale: string;
  readonly providedBy: string;
}

// ---------------------------------------------------------------------------
// Curriculum Learning Path Decision
// ---------------------------------------------------------------------------

export interface CurriculumLearningPathDecision {
  readonly decisionId: string;
  readonly pathId: string;
  readonly validationPassed: boolean;
  readonly validationErrors: readonly string[];
}

// ---------------------------------------------------------------------------
// Curriculum Learning Path Trace
// ---------------------------------------------------------------------------

export interface CurriculumLearningPathTrace {
  readonly traceId: string;
  readonly registryId: string;
  readonly pathCount: number;
  readonly decisionsCount: number;
  readonly validatedCount: number;
  readonly invalidCount: number;
  readonly decisions: readonly CurriculumLearningPathDecision[];
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_learning_path_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Curriculum Learning Path Registry
// ---------------------------------------------------------------------------

export interface CurriculumLearningPathRegistry {
  readonly registryId: string;
  readonly graphId: string;
  readonly paths: readonly CurriculumLearningPath[];
  readonly pathCount: number;
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_learning_path_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Curriculum Learning Path Input
// ---------------------------------------------------------------------------

export interface CurriculumLearningPathInput {
  readonly registryId?: string;
  readonly graphId?: string;
  readonly paths: readonly CurriculumLearningPath[];
}

// ---------------------------------------------------------------------------
// Curriculum Artifact With Learning Paths
// ---------------------------------------------------------------------------

export interface CurriculumArtifactWithLearningPaths {
  readonly artifactId: string;
  readonly graph: CurriculumGraph;
  readonly learningPathRegistry: CurriculumLearningPathRegistry;
  readonly learningPathTrace: CurriculumLearningPathTrace;
  readonly validation: CurriculumLearningPathValidationResult;
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_learning_path_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Curriculum Learning Path Validation Error
// ---------------------------------------------------------------------------

export interface CurriculumLearningPathValidationError {
  readonly code: string;
  readonly message: string;
  readonly field?: string;
  readonly pathId?: string;
  readonly nodeId?: string;
}

// ---------------------------------------------------------------------------
// Curriculum Learning Path Validation Result
// ---------------------------------------------------------------------------

export interface CurriculumLearningPathValidationResult {
  readonly valid: boolean;
  readonly errors: readonly CurriculumLearningPathValidationError[];
  readonly checkedAt: 'curriculum_learning_path_composition';
}

// ============================================================================
// D3-OPT-05 — Curriculum Roadmap Orchestration Types
// ============================================================================

// ---------------------------------------------------------------------------
// Canonical Roadmap Types (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_ROADMAP_TYPES = [
  'foundation',
  'core',
  'specialization',
  'research',
  'engineering',
  'mathematics',
  'laboratory',
  'review',
  'capstone',
  'complete_program',
] as const;

export type CurriculumRoadmapType = (typeof CANONICAL_ROADMAP_TYPES)[number];

// ---------------------------------------------------------------------------
// Canonical Roadmap Stages (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_ROADMAP_STAGES = [
  'entry',
  'foundation',
  'core',
  'intermediate',
  'advanced',
  'specialization',
  'integration',
  'research',
  'capstone',
  'completion',
] as const;

export type CurriculumRoadmapStage = (typeof CANONICAL_ROADMAP_STAGES)[number];

// ---------------------------------------------------------------------------
// Curriculum Roadmap Node
// ---------------------------------------------------------------------------

export interface CurriculumRoadmapNode {
  readonly roadmapNodeId: string;
  readonly curriculumNodeId: string;
  readonly stage: CurriculumRoadmapStage;
  readonly nodeOrder: number;
  readonly source: string;
  readonly governanceStatus: CurriculumGovernanceStatus;
  readonly rationale: string;
  readonly providedBy: string;
}

// ---------------------------------------------------------------------------
// Curriculum Roadmap
// ---------------------------------------------------------------------------

export interface CurriculumRoadmap {
  readonly roadmapId: string;
  readonly roadmapType: CurriculumRoadmapType;
  readonly roadmapLabel: string;
  readonly nodes: readonly CurriculumRoadmapNode[];
  readonly entryNodeId: string;
  readonly completionNodeId: string;
  readonly source: string;
  readonly governanceStatus: CurriculumGovernanceStatus;
  readonly rationale: string;
  readonly providedBy: string;
}

// ---------------------------------------------------------------------------
// Curriculum Roadmap Status
// ---------------------------------------------------------------------------

export type CurriculumRoadmapStatus = 'active' | 'deprecated' | 'provisional';

// ---------------------------------------------------------------------------
// Curriculum Roadmap Provenance
// ---------------------------------------------------------------------------

export interface CurriculumRoadmapProvenance {
  readonly roadmapId: string;
  readonly source: string;
  readonly governanceStatus: CurriculumGovernanceStatus;
  readonly rationale: string;
  readonly providedBy: string;
}

// ---------------------------------------------------------------------------
// Curriculum Roadmap Decision
// ---------------------------------------------------------------------------

export interface CurriculumRoadmapDecision {
  readonly decisionId: string;
  readonly roadmapId: string;
  readonly validationPassed: boolean;
  readonly validationErrors: readonly string[];
}

// ---------------------------------------------------------------------------
// Curriculum Roadmap Trace
// ---------------------------------------------------------------------------

export interface CurriculumRoadmapTrace {
  readonly traceId: string;
  readonly registryId: string;
  readonly roadmapCount: number;
  readonly decisionsCount: number;
  readonly validatedCount: number;
  readonly invalidCount: number;
  readonly decisions: readonly CurriculumRoadmapDecision[];
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_roadmap_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
  readonly curriculumMutated: false;
}

// ---------------------------------------------------------------------------
// Curriculum Roadmap Registry
// ---------------------------------------------------------------------------

export interface CurriculumRoadmapRegistry {
  readonly registryId: string;
  readonly graphId: string;
  readonly roadmaps: readonly CurriculumRoadmap[];
  readonly roadmapCount: number;
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_roadmap_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Curriculum Roadmap Input
// ---------------------------------------------------------------------------

export interface CurriculumRoadmapInput {
  readonly registryId: string;
  readonly graphId: string;
  readonly roadmaps: readonly CurriculumRoadmap[];
}

// ---------------------------------------------------------------------------
// Curriculum Artifact With Roadmaps
// ---------------------------------------------------------------------------

export interface CurriculumArtifactWithRoadmaps {
  readonly artifactId: string;
  readonly graph: CurriculumGraph;
  readonly roadmapRegistry: CurriculumRoadmapRegistry;
  readonly roadmapTrace: CurriculumRoadmapTrace;
  readonly validation: CurriculumRoadmapValidationResult;
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_roadmap_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Curriculum Roadmap Validation Error
// ---------------------------------------------------------------------------

export interface CurriculumRoadmapValidationError {
  readonly code: string;
  readonly message: string;
  readonly field?: string;
  readonly roadmapId?: string;
  readonly nodeId?: string;
}

// ---------------------------------------------------------------------------
// Curriculum Roadmap Validation Result
// ---------------------------------------------------------------------------

export interface CurriculumRoadmapValidationResult {
  readonly valid: boolean;
  readonly errors: readonly CurriculumRoadmapValidationError[];
  readonly checkedAt: 'curriculum_roadmap_orchestration';
}

// ============================================================================
// D3-OPT-06 — Curriculum Coverage & Gap Analysis Types
// ============================================================================

// ---------------------------------------------------------------------------
// Canonical Coverage Status (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_COVERAGE_STATUS = [
  'fully_covered',
  'partially_covered',
  'not_covered',
  'redundant',
  'orphaned',
  'blocked',
  'deprecated',
  'unknown',
] as const;

export type CurriculumCoverageStatus = (typeof CANONICAL_COVERAGE_STATUS)[number];

// ---------------------------------------------------------------------------
// Canonical Gap Types (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_GAP_TYPES = [
  'missing_concept',
  'missing_competency',
  'missing_assessment',
  'missing_laboratory',
  'missing_review',
  'missing_capstone',
  'missing_dependency',
  'orphan_node',
  'redundant_node',
  'disconnected_path',
] as const;

export type CurriculumGapType = (typeof CANONICAL_GAP_TYPES)[number];

// ---------------------------------------------------------------------------
// Canonical Coverage Dimensions (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_COVERAGE_DIMENSIONS = [
  'concept',
  'competency',
  'lesson',
  'module',
  'learning_path',
  'assessment',
  'laboratory',
  'review',
  'capstone',
  'dependency',
  'progression',
  'roadmap',
] as const;

export type CurriculumCoverageDimension = (typeof CANONICAL_COVERAGE_DIMENSIONS)[number];

// ---------------------------------------------------------------------------
// Curriculum Coverage Record
// ---------------------------------------------------------------------------

export interface CurriculumCoverageRecord {
  readonly coverageId: string;
  readonly entityId: string;
  readonly dimension: CurriculumCoverageDimension;
  readonly coverageStatus: CurriculumCoverageStatus;
  readonly coverageScore: number;
  readonly coveredBy: readonly string[];
  readonly source: string;
  readonly governanceStatus: CurriculumGovernanceStatus;
  readonly rationale: string;
  readonly providedBy: string;
}

// ---------------------------------------------------------------------------
// Curriculum Gap Record
// ---------------------------------------------------------------------------

export interface CurriculumGapRecord {
  readonly gapId: string;
  readonly entityId: string;
  readonly gapType: CurriculumGapType;
  readonly dimension: CurriculumCoverageDimension;
  readonly severity: 'critical' | 'high' | 'medium' | 'low' | 'informational';
  readonly description: string;
  readonly source: string;
  readonly governanceStatus: CurriculumGovernanceStatus;
  readonly rationale: string;
  readonly providedBy: string;
}

// ---------------------------------------------------------------------------
// Curriculum Coverage Status Type
// ---------------------------------------------------------------------------

export type CurriculumCoverageStatusType = 'active' | 'deprecated' | 'provisional';

// ---------------------------------------------------------------------------
// Curriculum Coverage Provenance
// ---------------------------------------------------------------------------

export interface CurriculumCoverageProvenance {
  readonly coverageId: string;
  readonly source: string;
  readonly governanceStatus: CurriculumGovernanceStatus;
  readonly rationale: string;
  readonly providedBy: string;
}

// ---------------------------------------------------------------------------
// Curriculum Coverage Decision
// ---------------------------------------------------------------------------

export interface CurriculumCoverageDecision {
  readonly decisionId: string;
  readonly coverageId: string;
  readonly validationPassed: boolean;
  readonly validationErrors: readonly string[];
}

// ---------------------------------------------------------------------------
// Curriculum Coverage Trace
// ---------------------------------------------------------------------------

export interface CurriculumCoverageTrace {
  readonly traceId: string;
  readonly registryId: string;
  readonly coverageCount: number;
  readonly gapCount: number;
  readonly decisionsCount: number;
  readonly validatedCount: number;
  readonly invalidCount: number;
  readonly decisions: readonly CurriculumCoverageDecision[];
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_coverage_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
  readonly curriculumMutated: false;
}

// ---------------------------------------------------------------------------
// Curriculum Coverage Registry
// ---------------------------------------------------------------------------

export interface CurriculumCoverageRegistry {
  readonly registryId: string;
  readonly graphId: string;
  readonly coverageRecords: readonly CurriculumCoverageRecord[];
  readonly gapRecords: readonly CurriculumGapRecord[];
  readonly coverageCount: number;
  readonly gapCount: number;
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_coverage_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Curriculum Coverage Input
// ---------------------------------------------------------------------------

export interface CurriculumCoverageInput {
  readonly registryId: string;
  readonly graphId: string;
  readonly coverageRecords: readonly CurriculumCoverageRecord[];
  readonly gapRecords: readonly CurriculumGapRecord[];
}

// ---------------------------------------------------------------------------
// Curriculum Artifact With Coverage
// ---------------------------------------------------------------------------

export interface CurriculumArtifactWithCoverage {
  readonly artifactId: string;
  readonly graph: CurriculumGraph;
  readonly coverageRegistry: CurriculumCoverageRegistry;
  readonly coverageTrace: CurriculumCoverageTrace;
  readonly validation: CurriculumCoverageValidationResult;
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_coverage_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Curriculum Coverage Validation Error
// ---------------------------------------------------------------------------

export interface CurriculumCoverageValidationError {
  readonly code: string;
  readonly message: string;
  readonly field?: string;
  readonly coverageId?: string;
  readonly gapId?: string;
  readonly entityId?: string;
}

// ---------------------------------------------------------------------------
// Curriculum Coverage Validation Result
// ---------------------------------------------------------------------------

export interface CurriculumCoverageValidationResult {
  readonly valid: boolean;
  readonly errors: readonly CurriculumCoverageValidationError[];
  readonly checkedAt: 'curriculum_coverage_gap_analysis';
}

// ============================================================================
// D3-OPT-07 — Curriculum Review & Reinforcement Planning Types
// ============================================================================

// ---------------------------------------------------------------------------
// Canonical Review Types (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_REVIEW_TYPES = [
  'concept_review',
  'dependency_review',
  'competency_review',
  'assessment_review',
  'laboratory_review',
  'module_review',
  'path_review',
  'capstone_review',
  'integration_review',
  'maintenance_review',
] as const;

export type CurriculumReviewType = (typeof CANONICAL_REVIEW_TYPES)[number];

// ---------------------------------------------------------------------------
// Canonical Reinforcement Types (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_REINFORCEMENT_TYPES = [
  'concept_reinforcement',
  'dependency_reinforcement',
  'competency_reinforcement',
  'skill_reinforcement',
  'practice_reinforcement',
  'laboratory_reinforcement',
  'assessment_reinforcement',
  'cross_module_reinforcement',
  'capstone_reinforcement',
  'long_term_retention',
] as const;

export type CurriculumReinforcementType = (typeof CANONICAL_REINFORCEMENT_TYPES)[number];

// ---------------------------------------------------------------------------
// Canonical Review Recurrence Models (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_REVIEW_RECURRENCE_MODELS = [
  'none',
  'immediate',
  'short_interval',
  'medium_interval',
  'long_interval',
  'module_boundary',
  'path_boundary',
  'capstone_boundary',
] as const;

export type CurriculumReviewRecurrenceModel = (typeof CANONICAL_REVIEW_RECURRENCE_MODELS)[number];

// ---------------------------------------------------------------------------
// Curriculum Review Plan
// ---------------------------------------------------------------------------

export interface CurriculumReviewPlan {
  readonly reviewId: string;
  readonly reviewType: CurriculumReviewType;
  readonly targetNodeIds: readonly string[];
  readonly targetCompetencyIds: readonly string[];
  readonly targetDependencyIds: readonly string[];
  readonly recurrenceModel: CurriculumReviewRecurrenceModel;
  readonly source: string;
  readonly governanceStatus: CurriculumGovernanceStatus;
  readonly rationale: string;
  readonly providedBy: string;
}

// ---------------------------------------------------------------------------
// Curriculum Reinforcement Plan
// ---------------------------------------------------------------------------

export interface CurriculumReinforcementPlan {
  readonly reinforcementId: string;
  readonly reinforcementType: CurriculumReinforcementType;
  readonly targetNodeIds: readonly string[];
  readonly targetCompetencyIds: readonly string[];
  readonly targetDependencyIds: readonly string[];
  readonly source: string;
  readonly governanceStatus: CurriculumGovernanceStatus;
  readonly rationale: string;
  readonly providedBy: string;
}

// ---------------------------------------------------------------------------
// Curriculum Review Reinforcement Status
// ---------------------------------------------------------------------------

export type CurriculumReviewReinforcementStatus = 'active' | 'deprecated' | 'provisional';

// ---------------------------------------------------------------------------
// Curriculum Review Reinforcement Provenance
// ---------------------------------------------------------------------------

export interface CurriculumReviewReinforcementProvenance {
  readonly registryId: string;
  readonly source: string;
  readonly governanceStatus: CurriculumGovernanceStatus;
  readonly rationale: string;
  readonly providedBy: string;
}

// ---------------------------------------------------------------------------
// Curriculum Review Reinforcement Decision
// ---------------------------------------------------------------------------

export interface CurriculumReviewReinforcementDecision {
  readonly decisionId: string;
  readonly decisionType: 'review_plan' | 'reinforcement_plan';
  readonly planId: string;
  readonly validationPassed: boolean;
  readonly validationErrors: readonly string[];
}

// ---------------------------------------------------------------------------
// Curriculum Review Reinforcement Trace
// ---------------------------------------------------------------------------

export interface CurriculumReviewReinforcementTrace {
  readonly traceId: string;
  readonly registryId: string;
  readonly reviewPlanCount: number;
  readonly reinforcementPlanCount: number;
  readonly decisionsCount: number;
  readonly validatedCount: number;
  readonly invalidCount: number;
  readonly decisions: readonly CurriculumReviewReinforcementDecision[];
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_review_reinforcement_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
  readonly curriculumMutated: false;
}

// ---------------------------------------------------------------------------
// Curriculum Review Reinforcement Registry
// ---------------------------------------------------------------------------

export interface CurriculumReviewReinforcementRegistry {
  readonly registryId: string;
  readonly graphId: string;
  readonly reviewPlans: readonly CurriculumReviewPlan[];
  readonly reinforcementPlans: readonly CurriculumReinforcementPlan[];
  readonly reviewPlanCount: number;
  readonly reinforcementPlanCount: number;
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_review_reinforcement_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Curriculum Review Reinforcement Input
// ---------------------------------------------------------------------------

export interface CurriculumReviewReinforcementInput {
  readonly registryId: string;
  readonly graphId: string;
  readonly reviewPlans: readonly CurriculumReviewPlan[];
  readonly reinforcementPlans: readonly CurriculumReinforcementPlan[];
}

// ---------------------------------------------------------------------------
// Curriculum Artifact With Review Reinforcement
// ---------------------------------------------------------------------------

export interface CurriculumArtifactWithReviewReinforcement {
  readonly artifactId: string;
  readonly graph: CurriculumGraph;
  readonly reviewReinforcementRegistry: CurriculumReviewReinforcementRegistry;
  readonly reviewReinforcementTrace: CurriculumReviewReinforcementTrace;
  readonly validation: CurriculumReviewReinforcementValidationResult;
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_review_reinforcement_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Curriculum Review Reinforcement Validation Error
// ---------------------------------------------------------------------------

export interface CurriculumReviewReinforcementValidationError {
  readonly code: string;
  readonly message: string;
  readonly field?: string;
  readonly planId?: string;
  readonly targetId?: string;
}

// ---------------------------------------------------------------------------
// Curriculum Review Reinforcement Validation Result
// ---------------------------------------------------------------------------

export interface CurriculumReviewReinforcementValidationResult {
  readonly valid: boolean;
  readonly errors: readonly CurriculumReviewReinforcementValidationError[];
  readonly checkedAt: 'curriculum_review_reinforcement_planning';
}

// ============================================================================
// D3-OPT-08 — Curriculum Evolution & Version Governance Types
// ============================================================================

// ---------------------------------------------------------------------------
// Canonical Curriculum Version Types (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_CURRICULUM_VERSION_TYPES = [
  'major',
  'minor',
  'patch',
  'experimental',
  'snapshot',
  'legacy',
  'candidate',
  'canonical',
  'hotfix',
  'archived',
] as const;

export type CurriculumVersionType = (typeof CANONICAL_CURRICULUM_VERSION_TYPES)[number];

// ---------------------------------------------------------------------------
// Canonical Curriculum Lifecycle States (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_CURRICULUM_LIFECYCLE = [
  'draft',
  'proposed',
  'review',
  'approved',
  'active',
  'deprecated',
  'superseded',
  'retired',
  'archived',
  'rejected',
] as const;

export type CurriculumLifecycleState = (typeof CANONICAL_CURRICULUM_LIFECYCLE)[number];

// ---------------------------------------------------------------------------
// Canonical Evolution Relations (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_EVOLUTION_RELATIONS = [
  'supersedes',
  'derived_from',
  'fork_of',
  'merged_into',
  'replaces',
  'equivalent_to',
  'historical_copy',
  'canonical_successor',
  'experimental_branch',
  'restores',
] as const;

export type CurriculumEvolutionRelation = (typeof CANONICAL_EVOLUTION_RELATIONS)[number];

// ---------------------------------------------------------------------------
// Curriculum Version
// ---------------------------------------------------------------------------

export interface CurriculumVersion {
  readonly versionId: string;
  readonly versionType: CurriculumVersionType;
  readonly versionNumber: string;
  readonly lifecycleState: CurriculumLifecycleState;
  readonly source: string;
  readonly governanceStatus: CurriculumGovernanceStatus;
  readonly rationale: string;
  readonly providedBy: string;
}

// ---------------------------------------------------------------------------
// Curriculum Lifecycle Record
// ---------------------------------------------------------------------------

export interface CurriculumLifecycleRecord {
  readonly lifecycleId: string;
  readonly versionId: string;
  readonly previousState: CurriculumLifecycleState | null;
  readonly newState: CurriculumLifecycleState;
  readonly transitionReason: string;
  readonly source: string;
  readonly governanceStatus: CurriculumGovernanceStatus;
  readonly rationale: string;
  readonly providedBy: string;
}

// ---------------------------------------------------------------------------
// Curriculum Evolution Record
// ---------------------------------------------------------------------------

export interface CurriculumEvolutionRecord {
  readonly relationId: string;
  readonly sourceVersionId: string;
  readonly targetVersionId: string;
  readonly relationType: CurriculumEvolutionRelation;
  readonly source: string;
  readonly governanceStatus: CurriculumGovernanceStatus;
  readonly rationale: string;
  readonly providedBy: string;
}

// ---------------------------------------------------------------------------
// Curriculum Evolution Status
// ---------------------------------------------------------------------------

export type CurriculumEvolutionStatus = 'active' | 'deprecated' | 'provisional';

// ---------------------------------------------------------------------------
// Curriculum Evolution Provenance
// ---------------------------------------------------------------------------

export interface CurriculumEvolutionProvenance {
  readonly registryId: string;
  readonly source: string;
  readonly governanceStatus: CurriculumGovernanceStatus;
  readonly rationale: string;
  readonly providedBy: string;
}

// ---------------------------------------------------------------------------
// Curriculum Evolution Decision
// ---------------------------------------------------------------------------

export interface CurriculumEvolutionDecision {
  readonly decisionId: string;
  readonly decisionType: 'version' | 'lifecycle' | 'evolution';
  readonly entityId: string;
  readonly validationPassed: boolean;
  readonly validationErrors: readonly string[];
}

// ---------------------------------------------------------------------------
// Curriculum Evolution Trace
// ---------------------------------------------------------------------------

export interface CurriculumEvolutionTrace {
  readonly traceId: string;
  readonly registryId: string;
  readonly versionCount: number;
  readonly lifecycleCount: number;
  readonly evolutionCount: number;
  readonly decisionsCount: number;
  readonly validatedCount: number;
  readonly invalidCount: number;
  readonly decisions: readonly CurriculumEvolutionDecision[];
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_evolution_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
  readonly curriculumMutated: false;
}

// ---------------------------------------------------------------------------
// Curriculum Evolution Registry
// ---------------------------------------------------------------------------

export interface CurriculumEvolutionRegistry {
  readonly registryId: string;
  readonly versions: readonly CurriculumVersion[];
  readonly lifecycleRecords: readonly CurriculumLifecycleRecord[];
  readonly evolutionRecords: readonly CurriculumEvolutionRecord[];
  readonly versionCount: number;
  readonly lifecycleCount: number;
  readonly evolutionCount: number;
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_evolution_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Curriculum Evolution Input
// ---------------------------------------------------------------------------

export interface CurriculumEvolutionInput {
  readonly registryId: string;
  readonly versions: readonly CurriculumVersion[];
  readonly lifecycleRecords: readonly CurriculumLifecycleRecord[];
  readonly evolutionRecords: readonly CurriculumEvolutionRecord[];
}

// ---------------------------------------------------------------------------
// Curriculum Artifact With Evolution
// ---------------------------------------------------------------------------

export interface CurriculumArtifactWithEvolution {
  readonly artifactId: string;
  readonly evolutionRegistry: CurriculumEvolutionRegistry;
  readonly evolutionTrace: CurriculumEvolutionTrace;
  readonly validation: CurriculumEvolutionValidationResult;
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_evolution_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Curriculum Evolution Validation Error
// ---------------------------------------------------------------------------

export interface CurriculumEvolutionValidationError {
  readonly code: string;
  readonly message: string;
  readonly field?: string;
  readonly versionId?: string;
  readonly relationId?: string;
  readonly lifecycleId?: string;
}

// ---------------------------------------------------------------------------
// Curriculum Evolution Validation Result
// ---------------------------------------------------------------------------

export interface CurriculumEvolutionValidationResult {
  readonly valid: boolean;
  readonly errors: readonly CurriculumEvolutionValidationError[];
  readonly checkedAt: 'curriculum_evolution_version_governance';
}

// ============================================================================
// D3-OPT-09 — Curriculum Certification & Structural Quality Gate Types
// ============================================================================

// ---------------------------------------------------------------------------
// Canonical Certification Status (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_CURRICULUM_CERTIFICATION_STATUS = [
  'certified',
  'certified_with_warnings',
  'needs_revision',
  'blocked',
] as const;

export type CurriculumCompositionCertificationStatus =
  (typeof CANONICAL_CURRICULUM_CERTIFICATION_STATUS)[number];

// ---------------------------------------------------------------------------
// Canonical Finding Severity (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_CURRICULUM_FINDING_SEVERITY = [
  'error',
  'warning',
  'recommendation',
] as const;

export type CurriculumCompositionFindingSeverity =
  (typeof CANONICAL_CURRICULUM_FINDING_SEVERITY)[number];

// ---------------------------------------------------------------------------
// Canonical Quality Dimensions (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_CURRICULUM_QUALITY_DIMENSIONS = [
  'graph_integrity',
  'dependency_integrity',
  'progression_integrity',
  'learning_path_integrity',
  'roadmap_integrity',
  'coverage_integrity',
  'review_integrity',
  'reinforcement_integrity',
  'evolution_integrity',
  'version_integrity',
  'provenance_integrity',
  'determinism',
  'architectural_boundary',
  'validation_integrity',
  'documentation_completeness',
  'governance_integrity',
] as const;

export type CurriculumCompositionQualityDimension =
  (typeof CANONICAL_CURRICULUM_QUALITY_DIMENSIONS)[number];

// ---------------------------------------------------------------------------
// Curriculum Composition Finding
// ---------------------------------------------------------------------------

export interface CurriculumCompositionFinding {
  readonly findingId: string;
  readonly severity: CurriculumCompositionFindingSeverity;
  readonly dimension: CurriculumCompositionQualityDimension;
  readonly code: string;
  readonly message: string;
  readonly rationale: string;
  readonly source: string;
  readonly governanceStatus: CurriculumGovernanceStatus;
  readonly providedBy: string;
}

// ---------------------------------------------------------------------------
// Curriculum Composition Certification Report
// ---------------------------------------------------------------------------

export interface CurriculumCompositionCertificationReport {
  readonly reportId: string;
  readonly artifactId: string;
  readonly status: CurriculumCompositionCertificationStatus;
  readonly findings: readonly CurriculumCompositionFinding[];
  readonly findingCount: number;
  readonly errorCount: number;
  readonly warningCount: number;
  readonly recommendationCount: number;
  readonly qualityScore: number;
  readonly dimensionsChecked: readonly CurriculumCompositionQualityDimension[];
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_certification_engine';
  readonly randomUsed: false;
  readonly timeDependency: false;
  readonly curriculumMutated: false;
}

// ---------------------------------------------------------------------------
// Curriculum Composition Certification Input
// ---------------------------------------------------------------------------

export interface CurriculumCompositionCertificationInput {
  readonly reportId: string;
  readonly artifactId: string;
  readonly findings: readonly CurriculumCompositionFinding[];
  readonly qualityScore: number;
  readonly dimensionsChecked: readonly CurriculumCompositionQualityDimension[];
}

// ---------------------------------------------------------------------------
// Curriculum Composition Certification Validation Error
// ---------------------------------------------------------------------------

export interface CurriculumCompositionCertificationValidationError {
  readonly code: string;
  readonly message: string;
  readonly field?: string;
  readonly findingId?: string;
}

// ---------------------------------------------------------------------------
// Curriculum Composition Certification Validation Result
// ---------------------------------------------------------------------------

export interface CurriculumCompositionCertificationValidationResult {
  readonly valid: boolean;
  readonly errors: readonly CurriculumCompositionCertificationValidationError[];
  readonly checkedAt: 'curriculum_certification_structural_quality_gate';
}

// ============================================================================
// D3-OPT-10 — Public API Consolidation & Curriculum Pipeline Facade Types
// ============================================================================

// ---------------------------------------------------------------------------
// Curriculum Artifact With Certification
// ---------------------------------------------------------------------------

export interface CurriculumArtifactWithCertification {
  readonly artifactId: string;
  readonly graph: CurriculumGraph;
  readonly certificationReport: CurriculumCompositionCertificationReport;
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_curriculum_facade';
  readonly randomUsed: false;
  readonly timeDependency: false;
  readonly curriculumMutated: false;
}

// ---------------------------------------------------------------------------
// Curriculum Facade Status
// ---------------------------------------------------------------------------

export type CurriculumFacadeStatus = 'composed' | 'certified' | 'failed';

// ---------------------------------------------------------------------------
// Curriculum Facade Validation Error
// ---------------------------------------------------------------------------

export interface CurriculumFacadeValidationError {
  readonly code: string;
  readonly message: string;
  readonly field?: string;
  readonly artifactId?: string;
}

// ---------------------------------------------------------------------------
// Curriculum Facade Validation Result
// ---------------------------------------------------------------------------

export interface CurriculumFacadeValidationResult {
  readonly valid: boolean;
  readonly errors: readonly CurriculumFacadeValidationError[];
  readonly checkedAt: 'curriculum_facade_consolidation';
}

// ---------------------------------------------------------------------------
// Curriculum Composition Input
// ---------------------------------------------------------------------------

export interface CurriculumCompositionInput {
  readonly artifactId: string;
  readonly graphInput: CurriculumGraphInput;
  readonly dependencyInput?: CurriculumDependencyInput;
  readonly progressionInput?: CurriculumProgressionInput;
  readonly learningPathInput?: CurriculumLearningPathInput;
  readonly roadmapInput?: CurriculumRoadmapInput;
  readonly coverageInput?: CurriculumCoverageInput;
  readonly reviewReinforcementInput?: CurriculumReviewReinforcementInput;
  readonly evolutionInput?: CurriculumEvolutionInput;
}

// ---------------------------------------------------------------------------
// Curriculum Facade Output
// ---------------------------------------------------------------------------

export interface CurriculumFacadeOutput {
  readonly artifact: CurriculumArtifact;
  readonly validationResult: CurriculumFacadeValidationResult;
  readonly traceMetadata: CurriculumFacadeTraceMetadata;
}

// ---------------------------------------------------------------------------
// Curriculum Certification Output
// ---------------------------------------------------------------------------

export interface CurriculumCertificationOutput {
  readonly certificationReport: CurriculumCompositionCertificationReport;
  readonly validationResult: CurriculumFacadeValidationResult;
  readonly traceMetadata: CurriculumFacadeTraceMetadata;
}

// ---------------------------------------------------------------------------
// Curriculum Complete Output
// ---------------------------------------------------------------------------

export interface CurriculumCompleteOutput {
  readonly artifact: CurriculumArtifact;
  readonly certificationReport: CurriculumCompositionCertificationReport;
  readonly validationResult: CurriculumFacadeValidationResult;
  readonly traceMetadata: CurriculumFacadeTraceMetadata;
}

// ---------------------------------------------------------------------------
// Curriculum Facade Trace Metadata
// ---------------------------------------------------------------------------

export interface CurriculumFacadeTraceMetadata {
  readonly traceId: string;
  readonly operation: 'compose' | 'certify' | 'compose_and_certify';
  readonly startedAt: string;
  readonly completedAt: string;
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_curriculum_facade';
  readonly randomUsed: false;
  readonly timeDependency: false;
  readonly curriculumMutated: false;
}

/**
 * NV-1600-D4-OPT-01 + D4-OPT-02 + D4-OPT-03 + D4-OPT-04 + D4-OPT-05 + D4-OPT-06 + D4-OPT-07 + D4-OPT-08 + D4-OPT-09 + D4-OPT-10 + D4-OPT-11 — Laboratory Agent Domain Contract
 *
 * Stable internal data model for the Laboratory Contract & Registry Kernel,
 * the Safe Deterministic Execution Model, the Laboratory Parameter Space
 * & Configuration Orchestration layer, the Simulation Scenario Composition
 * & Experiment Modeling layer, the Visualization, Observation & Result
 * Artifact Modeling layer, the Laboratory Workflow Orchestration layer,
 * the Laboratory Interaction & User Action Modeling layer, the
 * Predict-Before-Run & Hypothesis Modeling layer, the Laboratory
 * History & Local Evidence Modeling layer, the Laboratory
 * Certification & Structural Quality Gate layer, and the Public API
 * Consolidation & Laboratory Pipeline Facade layer.
 * Defines all types required for deterministic laboratory metadata orchestration,
 * deterministic execution plan representation, deterministic parameter
 * configuration metadata, deterministic experiment composition, deterministic
 * result artifact composition, deterministic workflow composition,
 * deterministic interaction metadata composition, deterministic
 * hypothesis metadata composition, deterministic history metadata composition,
 * deterministic certification metadata composition, and deterministic
 * facade composition.
 *
 * This module is purely structural. It contains no runtime logic,
 * no mutable state, no external dependencies, and no probabilistic behavior.
 */

// ---------------------------------------------------------------------------
// Canonical Laboratory Types (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_LABORATORY_TYPES = [
  'interactive_demo',
  'simulation',
  'parameter_exploration',
  'visualization',
  'algorithm_execution',
  'mathematical_experiment',
  'machine_learning',
  'computer_vision',
  'agent_system',
  'capstone_lab',
] as const;

export type LaboratoryType = (typeof CANONICAL_LABORATORY_TYPES)[number];

// ---------------------------------------------------------------------------
// Canonical Laboratory Difficulty Levels (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_LABORATORY_LEVELS = [
  'beginner',
  'intermediate',
  'advanced',
  'expert',
  'research',
] as const;

export type LaboratoryLevel = (typeof CANONICAL_LABORATORY_LEVELS)[number];

// ---------------------------------------------------------------------------
// Canonical Laboratory Status (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_LABORATORY_STATUS = [
  'draft',
  'review',
  'approved',
  'published',
  'deprecated',
  'archived',
] as const;

export type LaboratoryStatus = (typeof CANONICAL_LABORATORY_STATUS)[number];

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

export type LaboratoryGovernanceStatus = (typeof CANONICAL_GOVERNANCE_STATUSES)[number];

// ---------------------------------------------------------------------------
// Laboratory Metadata
// ---------------------------------------------------------------------------

export interface LaboratoryMetadata {
  readonly laboratoryId: string;
  readonly title: string;
  readonly description: string;
  readonly laboratoryType: LaboratoryType;
  readonly laboratoryLevel: LaboratoryLevel;
  readonly status: LaboratoryStatus;
  readonly governanceStatus: LaboratoryGovernanceStatus;
  readonly tags: readonly string[];
  readonly estimatedDurationMinutes: number;
  readonly prerequisites: readonly string[];
  readonly learningObjectives: readonly string[];
  readonly author: string;
  readonly curriculumNodeId?: string;
}

// ---------------------------------------------------------------------------
// Laboratory Provenance
// ---------------------------------------------------------------------------

export interface LaboratoryProvenance {
  readonly laboratoryId?: string;
  readonly source: string;
  readonly governanceStatus: LaboratoryGovernanceStatus;
  readonly rationale: string;
  readonly providedBy: string;
}

export interface Laboratory {
  readonly metadata: LaboratoryMetadata;
  readonly provenance?: LaboratoryProvenance;
}

// ---------------------------------------------------------------------------
// Laboratory Decision
// ---------------------------------------------------------------------------

export interface LaboratoryDecision {
  readonly decisionId: string;
  readonly laboratoryId: string;
  readonly validationPassed: boolean;
  readonly validationErrors: readonly string[];
}

// ---------------------------------------------------------------------------
// Laboratory Trace
// ---------------------------------------------------------------------------

export interface LaboratoryTrace {
  readonly traceId: string;
  readonly laboratoryCount: number;
  readonly validatedCount?: number;
  readonly invalidCount?: number;
  readonly laboratory?: Laboratory;
  readonly decisions: readonly LaboratoryDecision[];
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_laboratory_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Laboratory Node
// ---------------------------------------------------------------------------

export interface LaboratoryNode {
  readonly nodeId: string;
  readonly laboratoryId: string;
  readonly metadata: LaboratoryMetadata;
  readonly provenance: LaboratoryProvenance;
}

// ---------------------------------------------------------------------------
// Laboratory Artifact
// ---------------------------------------------------------------------------

export interface LaboratoryArtifact {
  readonly artifactId: string;
  readonly laboratoryNode: LaboratoryNode;
  readonly trace: LaboratoryTrace;
}

// ---------------------------------------------------------------------------
// Laboratory Registry
// ---------------------------------------------------------------------------

export interface LaboratoryRegistry {
  readonly registryId: string;
  readonly laboratories: readonly LaboratoryMetadata[];
  readonly nodeCount: number;
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_laboratory_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Laboratory Input
// ---------------------------------------------------------------------------

export interface LaboratoryInput {
  readonly laboratories: readonly LaboratoryMetadata[];
}

// ---------------------------------------------------------------------------
// Laboratory Validation Error
// ---------------------------------------------------------------------------

export interface LaboratoryValidationError {
  readonly code: string;
  readonly message: string;
  readonly field?: string;
  readonly laboratoryId?: string;
}

// ---------------------------------------------------------------------------
// Laboratory Validation Result
// ---------------------------------------------------------------------------

export interface LaboratoryValidationResult {
  readonly valid: boolean;
  readonly errors: readonly LaboratoryValidationError[];
  readonly checkedAt: 'laboratory_composition';
}

// ---------------------------------------------------------------------------
// Laboratory Validation Result (Registry)
// ---------------------------------------------------------------------------

export interface LaboratoryRegistryValidationResult {
  readonly valid: boolean;
  readonly errors: readonly LaboratoryValidationError[];
  readonly checkedAt: 'laboratory_registry_composition';
}

// ---------------------------------------------------------------------------
// Laboratory Validation Result (Artifact)
// ---------------------------------------------------------------------------

export interface LaboratoryArtifactValidationResult {
  readonly valid: boolean;
  readonly errors: readonly LaboratoryValidationError[];
  readonly checkedAt: 'laboratory_artifact_composition';
}

// ---------------------------------------------------------------------------
// Laboratory Validation Result (Input)
// ---------------------------------------------------------------------------

export interface LaboratoryInputValidationResult {
  readonly valid: boolean;
  readonly errors: readonly LaboratoryValidationError[];
  readonly checkedAt: 'laboratory_input_composition';
}

// ============================================================================
// D4-OPT-02 — Safe Deterministic Execution Model Types
// ============================================================================

// ---------------------------------------------------------------------------
// Canonical Execution Modes (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_EXECUTION_MODES = [
  'metadata_only',
  'deterministic_simulation',
  'interactive_step',
  'parameter_preview',
  'visualization_only',
  'comparison_only',
  'dry_run',
  'laboratory_chain',
] as const;

export type ExecutionMode = (typeof CANONICAL_EXECUTION_MODES)[number];

// ---------------------------------------------------------------------------
// Canonical Execution States (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_EXECUTION_STATES = [
  'ready',
  'validated',
  'blocked',
  'completed',
  'cancelled',
  'invalid',
] as const;

export type ExecutionState = (typeof CANONICAL_EXECUTION_STATES)[number];

// ---------------------------------------------------------------------------
// Canonical Sandbox Levels (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_SANDBOX_LEVELS = [
  'strict',
  'restricted',
  'educational',
] as const;

export type SandboxLevel = (typeof CANONICAL_SANDBOX_LEVELS)[number];

// ---------------------------------------------------------------------------
// Execution Policy
// ---------------------------------------------------------------------------

export interface LaboratoryExecutionPolicy {
  readonly policyId: string;
  readonly executionMode: ExecutionMode;
  readonly sandboxLevel: SandboxLevel;
  readonly requiresValidation: boolean;
  readonly allowsParameters: boolean;
  readonly allowsVisualization: boolean;
  readonly allowsComparison: boolean;
  readonly requiresApproval: boolean;
  readonly governanceStatus: LaboratoryGovernanceStatus;
}

// ---------------------------------------------------------------------------
// Execution Environment
// ---------------------------------------------------------------------------

export interface LaboratoryExecutionEnvironment {
  readonly environmentId: string;
  readonly sandboxLevel: SandboxLevel;
  readonly runtimeProfile: string;
  readonly resourceProfile: string;
  readonly executionPolicyId: string;
}

// ---------------------------------------------------------------------------
// Execution Plan
// ---------------------------------------------------------------------------

export interface LaboratoryExecutionPlan {
  readonly executionId: string;
  readonly laboratoryId: string;
  readonly executionMode: ExecutionMode;
  readonly executionState: ExecutionState;
  readonly executionPolicy: LaboratoryExecutionPolicy;
  readonly executionEnvironment: LaboratoryExecutionEnvironment;
  readonly parameters: Readonly<Record<string, string>>;
  readonly constraints: readonly string[];
  readonly governanceStatus: LaboratoryGovernanceStatus;
}

// ---------------------------------------------------------------------------
// Execution Provenance
// ---------------------------------------------------------------------------

export interface LaboratoryExecutionProvenance {
  readonly executionId: string;
  readonly source: string;
  readonly governanceStatus: LaboratoryGovernanceStatus;
  readonly rationale: string;
  readonly providedBy: string;
}

// ---------------------------------------------------------------------------
// Execution Decision
// ---------------------------------------------------------------------------

export interface LaboratoryExecutionDecision {
  readonly decisionId: string;
  readonly executionId: string;
  readonly validationPassed: boolean;
  readonly validationErrors: readonly string[];
}

// ---------------------------------------------------------------------------
// Execution Trace
// ---------------------------------------------------------------------------

export interface LaboratoryExecutionTrace {
  readonly traceId: string;
  readonly executionCount: number;
  readonly validatedCount: number;
  readonly invalidCount: number;
  readonly decisions: readonly LaboratoryExecutionDecision[];
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_execution_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Execution Artifact
// ---------------------------------------------------------------------------

export interface LaboratoryExecutionArtifact {
  readonly artifactId: string;
  readonly executionPlan: LaboratoryExecutionPlan;
  readonly trace: LaboratoryExecutionTrace;
}

// ---------------------------------------------------------------------------
// Execution Registry
// ---------------------------------------------------------------------------

export interface LaboratoryExecutionRegistry {
  readonly registryId: string;
  readonly executions: readonly LaboratoryExecutionPlan[];
  readonly executionCount: number;
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_execution_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Execution Input
// ---------------------------------------------------------------------------

export interface LaboratoryExecutionInput {
  readonly executions: readonly LaboratoryExecutionPlan[];
}

// ---------------------------------------------------------------------------
// Execution Validation Error
// ---------------------------------------------------------------------------

export interface LaboratoryExecutionValidationError {
  readonly code: string;
  readonly message: string;
  readonly field?: string;
  readonly executionId?: string;
}

// ---------------------------------------------------------------------------
// Execution Validation Result
// ---------------------------------------------------------------------------

export interface LaboratoryExecutionValidationResult {
  readonly valid: boolean;
  readonly errors: readonly LaboratoryExecutionValidationError[];
  readonly checkedAt: 'execution_plan_composition';
}

// ---------------------------------------------------------------------------
// Execution Validation Result (Policy)
// ---------------------------------------------------------------------------

export interface LaboratoryExecutionPolicyValidationResult {
  readonly valid: boolean;
  readonly errors: readonly LaboratoryExecutionValidationError[];
  readonly checkedAt: 'execution_policy_composition';
}

// ---------------------------------------------------------------------------
// Execution Validation Result (Environment)
// ---------------------------------------------------------------------------

export interface LaboratoryExecutionEnvironmentValidationResult {
  readonly valid: boolean;
  readonly errors: readonly LaboratoryExecutionValidationError[];
  readonly checkedAt: 'execution_environment_composition';
}

// ---------------------------------------------------------------------------
// Execution Validation Result (Registry)
// ---------------------------------------------------------------------------

export interface LaboratoryExecutionRegistryValidationResult {
  readonly valid: boolean;
  readonly errors: readonly LaboratoryExecutionValidationError[];
  readonly checkedAt: 'execution_registry_composition';
}

// ---------------------------------------------------------------------------
// Execution Validation Result (Artifact)
// ---------------------------------------------------------------------------

export interface LaboratoryExecutionArtifactValidationResult {
  readonly valid: boolean;
  readonly errors: readonly LaboratoryExecutionValidationError[];
  readonly checkedAt: 'execution_artifact_composition';
}

// ---------------------------------------------------------------------------
// Execution Validation Result (Input)
// ---------------------------------------------------------------------------

export interface LaboratoryExecutionInputValidationResult {
  readonly valid: boolean;
  readonly errors: readonly LaboratoryExecutionValidationError[];
  readonly checkedAt: 'execution_input_composition';
}

// ---------------------------------------------------------------------------
// Execution Status
// ---------------------------------------------------------------------------

export type LaboratoryExecutionStatus = ExecutionState;

// ============================================================================
// D4-OPT-03 — Laboratory Parameter Space & Configuration Orchestration Types
// ============================================================================

// ---------------------------------------------------------------------------
// Canonical Parameter Types (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_PARAMETER_TYPES = [
  'integer',
  'float',
  'boolean',
  'categorical',
  'enum',
  'string',
  'vector',
  'matrix',
  'distribution',
  'seed',
] as const;

export type LaboratoryParameterType = (typeof CANONICAL_PARAMETER_TYPES)[number];

// ---------------------------------------------------------------------------
// Canonical Parameter Categories (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_PARAMETER_CATEGORIES = [
  'algorithm',
  'visualization',
  'simulation',
  'dataset',
  'preprocessing',
  'postprocessing',
  'execution',
  'hardware',
  'evaluation',
  'experimental',
] as const;

export type LaboratoryParameterCategory = (typeof CANONICAL_PARAMETER_CATEGORIES)[number];

// ---------------------------------------------------------------------------
// Canonical Parameter Constraint Types (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_PARAMETER_CONSTRAINTS = [
  'range',
  'set',
  'fixed',
  'regex',
  'dependency',
  'exclusive',
  'required',
  'optional',
  'readonly',
  'computed',
] as const;

export type LaboratoryParameterConstraintType = (typeof CANONICAL_PARAMETER_CONSTRAINTS)[number];

// ---------------------------------------------------------------------------
// Canonical Configuration Status (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_CONFIGURATION_STATUS = [
  'draft',
  'review',
  'approved',
  'published',
  'deprecated',
  'archived',
] as const;

export type LaboratoryConfigurationStatus = (typeof CANONICAL_CONFIGURATION_STATUS)[number];

// ---------------------------------------------------------------------------
// Laboratory Parameter Provenance
// ---------------------------------------------------------------------------

export interface LaboratoryParameterProvenance {
  readonly parameterId: string;
  readonly source: string;
  readonly governanceStatus: LaboratoryGovernanceStatus;
  readonly rationale: string;
  readonly providedBy: string;
}

// ---------------------------------------------------------------------------
// Laboratory Parameter Constraint
// ---------------------------------------------------------------------------

export interface LaboratoryParameterConstraint {
  readonly constraintId: string;
  readonly constraintType: LaboratoryParameterConstraintType;
  readonly minimum?: number;
  readonly maximum?: number;
  readonly allowedValues?: readonly string[];
  readonly pattern?: string;
  readonly dependsOn?: string;
  readonly exclusiveWith?: readonly string[];
  readonly governanceStatus: LaboratoryGovernanceStatus;
}

// ---------------------------------------------------------------------------
// Laboratory Parameter
// ---------------------------------------------------------------------------

export interface LaboratoryParameter {
  readonly parameterId: string;
  readonly name: string;
  readonly description: string;
  readonly parameterType: LaboratoryParameterType;
  readonly parameterCategory: LaboratoryParameterCategory;
  readonly defaultValue: string;
  readonly constraints: readonly LaboratoryParameterConstraint[];
  readonly groupId: string;
  readonly required: boolean;
  readonly visible: boolean;
  readonly editable: boolean;
  readonly provenance: LaboratoryParameterProvenance;
}

// ---------------------------------------------------------------------------
// Laboratory Parameter Group Provenance
// ---------------------------------------------------------------------------

export interface LaboratoryParameterGroupProvenance {
  readonly groupId: string;
  readonly source: string;
  readonly governanceStatus: LaboratoryGovernanceStatus;
  readonly rationale: string;
  readonly providedBy: string;
}

// ---------------------------------------------------------------------------
// Laboratory Parameter Group
// ---------------------------------------------------------------------------

export interface LaboratoryParameterGroup {
  readonly groupId: string;
  readonly name: string;
  readonly description: string;
  readonly parameterIds: readonly string[];
  readonly sortOrder: number;
  readonly governanceStatus: LaboratoryGovernanceStatus;
  readonly provenance: LaboratoryParameterGroupProvenance;
}

// ---------------------------------------------------------------------------
// Laboratory Configuration Provenance
// ---------------------------------------------------------------------------

export interface LaboratoryConfigurationProvenance {
  readonly configurationId: string;
  readonly source: string;
  readonly governanceStatus: LaboratoryGovernanceStatus;
  readonly rationale: string;
  readonly providedBy: string;
}

// ---------------------------------------------------------------------------
// Laboratory Configuration Decision
// ---------------------------------------------------------------------------

export interface LaboratoryConfigurationDecision {
  readonly decisionId: string;
  readonly configurationId: string;
  readonly validationPassed: boolean;
  readonly validationErrors: readonly string[];
}

// ---------------------------------------------------------------------------
// Laboratory Configuration Trace
// ---------------------------------------------------------------------------

export interface LaboratoryConfigurationTrace {
  readonly traceId: string;
  readonly configurationCount: number;
  readonly parameterCount: number;
  readonly groupCount: number;
  readonly validatedCount: number;
  readonly invalidCount: number;
  readonly decisions: readonly LaboratoryConfigurationDecision[];
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_parameter_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Laboratory Configuration
// ---------------------------------------------------------------------------

export interface LaboratoryConfiguration {
  readonly configurationId: string;
  readonly title?: string;
  readonly laboratoryId: string;
  readonly parameterIds?: readonly string[];
  readonly groupIds?: readonly string[];
  readonly status?: LaboratoryConfigurationStatus;
  readonly governanceStatus?: LaboratoryGovernanceStatus;
  readonly provenance?: LaboratoryConfigurationProvenance;
}

// ---------------------------------------------------------------------------
// Laboratory Configuration Registry
// ---------------------------------------------------------------------------

export interface LaboratoryConfigurationRegistry {
  readonly registryId: string;
  readonly configurations: readonly LaboratoryConfiguration[];
  readonly parameters: readonly LaboratoryParameter[];
  readonly groups: readonly LaboratoryParameterGroup[];
  readonly configurationCount: number;
  readonly parameterCount: number;
  readonly groupCount: number;
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_parameter_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Laboratory Configuration Input
// ---------------------------------------------------------------------------

export interface LaboratoryConfigurationInput {
  readonly configurations: readonly LaboratoryConfiguration[];
  readonly parameters: readonly LaboratoryParameter[];
  readonly groups: readonly LaboratoryParameterGroup[];
}

// ---------------------------------------------------------------------------
// Laboratory Artifact With Configuration
// ---------------------------------------------------------------------------

export interface LaboratoryArtifactWithConfiguration {
  readonly artifactId: string;
  readonly registry: LaboratoryConfigurationRegistry;
  readonly trace: LaboratoryConfigurationTrace;
}

// ---------------------------------------------------------------------------
// Laboratory Configuration Validation Error
// ---------------------------------------------------------------------------

export interface LaboratoryConfigurationValidationError {
  readonly code: string;
  readonly message: string;
  readonly field?: string;
  readonly configurationId?: string;
  readonly parameterId?: string;
  readonly groupId?: string;
}

// ---------------------------------------------------------------------------
// Laboratory Configuration Validation Result
// ---------------------------------------------------------------------------

export interface LaboratoryConfigurationValidationResult {
  readonly valid: boolean;
  readonly errors: readonly LaboratoryConfigurationValidationError[];
  readonly checkedAt: 'parameter_composition';
}

// ---------------------------------------------------------------------------
// Laboratory Configuration Validation Result (Registry)
// ---------------------------------------------------------------------------

export interface LaboratoryConfigurationRegistryValidationResult {
  readonly valid: boolean;
  readonly errors: readonly LaboratoryConfigurationValidationError[];
  readonly checkedAt: 'configuration_registry_composition';
}

// ---------------------------------------------------------------------------
// Laboratory Configuration Validation Result (Artifact)
// ---------------------------------------------------------------------------

export interface LaboratoryConfigurationArtifactValidationResult {
  readonly valid: boolean;
  readonly errors: readonly LaboratoryConfigurationValidationError[];
  readonly checkedAt: 'configuration_artifact_composition';
}

// ---------------------------------------------------------------------------
// Laboratory Configuration Validation Result (Input)
// ---------------------------------------------------------------------------

export interface LaboratoryConfigurationInputValidationResult {
  readonly valid: boolean;
  readonly errors: readonly LaboratoryConfigurationValidationError[];
  readonly checkedAt: 'configuration_input_composition';
}

// ============================================================================
// D4-OPT-04 — Simulation Scenario Composition & Experiment Modeling Types
// ============================================================================

// ---------------------------------------------------------------------------
// Canonical Experiment Types (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_EXPERIMENT_TYPES = [
  'algorithm_validation',
  'parameter_exploration',
  'visualization',
  'simulation',
  'comparison',
  'dataset_analysis',
  'mathematical_model',
  'computer_vision',
  'machine_learning',
  'capstone',
] as const;

export type ExperimentType = (typeof CANONICAL_EXPERIMENT_TYPES)[number];

// ---------------------------------------------------------------------------
// Canonical Scenario Types (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_SCENARIO_TYPES = [
  'baseline',
  'reference',
  'controlled',
  'comparative',
  'ablation',
  'stress',
  'edge_case',
  'exploratory',
  'educational',
  'custom',
] as const;

export type ScenarioType = (typeof CANONICAL_SCENARIO_TYPES)[number];

// ---------------------------------------------------------------------------
// Canonical Expected Output Types (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_EXPECTED_OUTPUT_TYPES = [
  'visualization',
  'metric',
  'comparison',
  'observation',
  'artifact',
  'dataset',
  'graph',
  'table',
  'report',
  'none',
] as const;

export type ExpectedOutputType = (typeof CANONICAL_EXPECTED_OUTPUT_TYPES)[number];

// ---------------------------------------------------------------------------
// Canonical Experiment Status (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_EXPERIMENT_STATUS = [
  'draft',
  'review',
  'approved',
  'published',
  'deprecated',
  'archived',
] as const;

export type ExperimentStatus = (typeof CANONICAL_EXPERIMENT_STATUS)[number];

// ---------------------------------------------------------------------------
// Experiment Provenance
// ---------------------------------------------------------------------------

export interface ExperimentProvenance {
  readonly experimentId: string;
  readonly source: string;
  readonly governanceStatus: LaboratoryGovernanceStatus;
  readonly rationale: string;
  readonly providedBy: string;
}

// ---------------------------------------------------------------------------
// Scenario Provenance
// ---------------------------------------------------------------------------

export interface ScenarioProvenance {
  readonly scenarioId: string;
  readonly source: string;
  readonly governanceStatus: LaboratoryGovernanceStatus;
  readonly rationale: string;
  readonly providedBy: string;
}

// ---------------------------------------------------------------------------
// Experiment Dataset Reference Provenance
// ---------------------------------------------------------------------------

export interface DatasetReferenceProvenance {
  readonly datasetReferenceId: string;
  readonly source: string;
  readonly governanceStatus: LaboratoryGovernanceStatus;
  readonly rationale: string;
  readonly providedBy: string;
}

// ---------------------------------------------------------------------------
// Experiment Expected Output Provenance
// ---------------------------------------------------------------------------

export interface ExpectedOutputProvenance {
  readonly expectedOutputId: string;
  readonly source: string;
  readonly governanceStatus: LaboratoryGovernanceStatus;
  readonly rationale: string;
  readonly providedBy: string;
}

// ---------------------------------------------------------------------------
// Experiment Evaluation Metadata Provenance
// ---------------------------------------------------------------------------

export interface EvaluationMetadataProvenance {
  readonly evaluationId: string;
  readonly source: string;
  readonly governanceStatus: LaboratoryGovernanceStatus;
  readonly rationale: string;
  readonly providedBy: string;
}

// ---------------------------------------------------------------------------
// Experiment Dataset Reference
// ---------------------------------------------------------------------------

export interface ExperimentDatasetReference {
  readonly datasetReferenceId: string;
  readonly datasetId: string;
  readonly source: string;
  readonly description: string;
  readonly governanceStatus: LaboratoryGovernanceStatus;
  readonly provenance: DatasetReferenceProvenance;
}

// ---------------------------------------------------------------------------
// Experiment Expected Output
// ---------------------------------------------------------------------------

export interface ExperimentExpectedOutput {
  readonly expectedOutputId: string;
  readonly outputType: ExpectedOutputType;
  readonly description: string;
  readonly format: string;
  readonly governanceStatus: LaboratoryGovernanceStatus;
  readonly provenance: ExpectedOutputProvenance;
}

// ---------------------------------------------------------------------------
// Experiment Evaluation Metadata
// ---------------------------------------------------------------------------

export interface ExperimentEvaluationMetadata {
  readonly evaluationId: string;
  readonly evaluationCriteria: readonly string[];
  readonly expectedArtifacts: readonly string[];
  readonly successConditions: readonly string[];
  readonly governanceStatus: LaboratoryGovernanceStatus;
  readonly provenance: EvaluationMetadataProvenance;
}

// ---------------------------------------------------------------------------
// Experiment Scenario
// ---------------------------------------------------------------------------

export interface ExperimentScenario {
  readonly scenarioId: string;
  readonly scenarioType: ScenarioType;
  readonly description: string;
  readonly configurationReference: string;
  readonly datasetReference: string;
  readonly purpose: string;
  readonly governanceStatus: LaboratoryGovernanceStatus;
  readonly provenance: ScenarioProvenance;
}

// ---------------------------------------------------------------------------
// Laboratory Experiment
// ---------------------------------------------------------------------------

export interface LaboratoryExperiment {
  readonly experimentId: string;
  readonly title?: string;
  readonly laboratoryId: string;
  readonly experimentType?: ExperimentType;
  readonly scenarioId?: string;
  readonly scenarioIds?: readonly string[];
  readonly configurationId?: string;
  readonly executionPolicyId?: string;
  readonly datasetReferenceIds?: readonly string[];
  readonly expectedOutputIds?: readonly string[];
  readonly evaluationMetadataId?: string;
  readonly evaluationMetadataIds?: readonly string[];
  readonly status?: ExperimentStatus;
  readonly governanceStatus?: LaboratoryGovernanceStatus;
  readonly source?: string;
  readonly rationale?: string;
  readonly providedBy?: string;
  readonly provenance?: ExperimentProvenance;
}

// ---------------------------------------------------------------------------
// Experiment Decision
// ---------------------------------------------------------------------------

export interface ExperimentDecision {
  readonly decisionId: string;
  readonly experimentId: string;
  readonly validationPassed: boolean;
  readonly validationErrors: readonly string[];
}

// ---------------------------------------------------------------------------
// Experiment Trace
// ---------------------------------------------------------------------------

export interface ExperimentTrace {
  readonly traceId: string;
  readonly experimentCount: number;
  readonly scenarioCount: number;
  readonly datasetReferenceCount: number;
  readonly expectedOutputCount: number;
  readonly evaluationMetadataCount: number;
  readonly validatedCount: number;
  readonly invalidCount: number;
  readonly decisions: readonly ExperimentDecision[];
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_experiment_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Experiment Registry
// ---------------------------------------------------------------------------

export interface ExperimentRegistry {
  readonly registryId: string;
  readonly experiments: readonly LaboratoryExperiment[];
  readonly scenarios: readonly ExperimentScenario[];
  readonly datasetReferences: readonly ExperimentDatasetReference[];
  readonly expectedOutputs: readonly ExperimentExpectedOutput[];
  readonly evaluationMetadata: readonly ExperimentEvaluationMetadata[];
  readonly experimentCount: number;
  readonly scenarioCount: number;
  readonly datasetReferenceCount: number;
  readonly expectedOutputCount: number;
  readonly evaluationMetadataCount: number;
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_experiment_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Experiment Input
// ---------------------------------------------------------------------------

export interface ExperimentInput {
  readonly experiments: readonly LaboratoryExperiment[];
  readonly scenarios: readonly ExperimentScenario[];
  readonly datasetReferences: readonly ExperimentDatasetReference[];
  readonly expectedOutputs: readonly ExperimentExpectedOutput[];
  readonly evaluationMetadata: readonly ExperimentEvaluationMetadata[];
}

// ---------------------------------------------------------------------------
// Laboratory Artifact With Experiments
// ---------------------------------------------------------------------------

export interface LaboratoryArtifactWithExperiments {
  readonly artifactId: string;
  readonly registry: ExperimentRegistry;
  readonly trace: ExperimentTrace;
}

// ---------------------------------------------------------------------------
// Experiment Validation Error
// ---------------------------------------------------------------------------

export interface ExperimentValidationError {
  readonly code: string;
  readonly message: string;
  readonly field?: string;
  readonly experimentId?: string;
  readonly scenarioId?: string;
  readonly datasetReferenceId?: string;
  readonly expectedOutputId?: string;
  readonly evaluationId?: string;
}

// ---------------------------------------------------------------------------
// Experiment Validation Result
// ---------------------------------------------------------------------------

export interface ExperimentValidationResult {
  readonly valid: boolean;
  readonly errors: readonly ExperimentValidationError[];
  readonly checkedAt: 'experiment_composition';
}

// ---------------------------------------------------------------------------
// Experiment Validation Result (Registry)
// ---------------------------------------------------------------------------

export interface ExperimentRegistryValidationResult {
  readonly valid: boolean;
  readonly errors: readonly ExperimentValidationError[];
  readonly checkedAt: 'experiment_registry_composition';
}

// ---------------------------------------------------------------------------
// Experiment Validation Result (Artifact)
// ---------------------------------------------------------------------------

export interface ExperimentArtifactValidationResult {
  readonly valid: boolean;
  readonly errors: readonly ExperimentValidationError[];
  readonly checkedAt: 'experiment_artifact_composition';
}

// ---------------------------------------------------------------------------
// Experiment Validation Result (Input)
// ---------------------------------------------------------------------------

export interface ExperimentInputValidationResult {
  readonly valid: boolean;
  readonly errors: readonly ExperimentValidationError[];
  readonly checkedAt: 'experiment_input_composition';
}

// ============================================================================
// D4-OPT-05 — Visualization, Observation & Result Artifact Modeling Types
// ============================================================================

// ---------------------------------------------------------------------------
// Canonical Visualization Types (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_VISUALIZATION_TYPES = [
  'line_chart',
  'bar_chart',
  'scatter_plot',
  'heatmap',
  'confusion_matrix',
  'bounding_box_overlay',
  'segmentation_overlay',
  'feature_map',
  'network_graph',
  'custom_visualization',
] as const;

export type VisualizationType = (typeof CANONICAL_VISUALIZATION_TYPES)[number];

// ---------------------------------------------------------------------------
// Canonical Observation Types (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_OBSERVATION_TYPES = [
  'qualitative',
  'quantitative',
  'comparative',
  'behavioral',
  'visual',
  'algorithmic',
  'statistical',
  'performance',
  'failure',
  'annotation',
] as const;

export type ObservationType = (typeof CANONICAL_OBSERVATION_TYPES)[number];

// ---------------------------------------------------------------------------
// Canonical Result Artifact Types (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_RESULT_ARTIFACT_TYPES = [
  'visualization',
  'metric',
  'table',
  'graph',
  'report',
  'observation',
  'comparison',
  'dataset_snapshot',
  'annotation',
  'evaluation_summary',
] as const;

export type ResultArtifactType = (typeof CANONICAL_RESULT_ARTIFACT_TYPES)[number];

// ---------------------------------------------------------------------------
// Canonical Metric Types (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_METRIC_TYPES = [
  'accuracy',
  'precision',
  'recall',
  'f1_score',
  'iou',
  'latency',
  'throughput',
  'memory',
  'custom_metric',
  'none',
] as const;

export type MetricType = (typeof CANONICAL_METRIC_TYPES)[number];

// ---------------------------------------------------------------------------
// Canonical Result Artifact Status (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_RESULT_ARTIFACT_STATUS = [
  'draft',
  'review',
  'approved',
  'published',
  'deprecated',
  'archived',
] as const;

export type ResultArtifactStatus = (typeof CANONICAL_RESULT_ARTIFACT_STATUS)[number];

// ---------------------------------------------------------------------------
// Visualization Provenance
// ---------------------------------------------------------------------------

export interface VisualizationProvenance {
  readonly visualizationId: string;
  readonly source: string;
  readonly governanceStatus: LaboratoryGovernanceStatus;
  readonly rationale: string;
  readonly providedBy: string;
}

// ---------------------------------------------------------------------------
// Observation Provenance
// ---------------------------------------------------------------------------

export interface ObservationProvenance {
  readonly observationId: string;
  readonly source: string;
  readonly governanceStatus: LaboratoryGovernanceStatus;
  readonly rationale: string;
  readonly providedBy: string;
}

// ---------------------------------------------------------------------------
// Metric Provenance
// ---------------------------------------------------------------------------

export interface MetricProvenance {
  readonly metricId: string;
  readonly source: string;
  readonly governanceStatus: LaboratoryGovernanceStatus;
  readonly rationale: string;
  readonly providedBy: string;
}

// ---------------------------------------------------------------------------
// Result Artifact Provenance
// ---------------------------------------------------------------------------

export interface ResultArtifactProvenance {
  readonly artifactId: string;
  readonly source: string;
  readonly governanceStatus: LaboratoryGovernanceStatus;
  readonly rationale: string;
  readonly providedBy: string;
}

// ---------------------------------------------------------------------------
// Artifact Relationship Provenance
// ---------------------------------------------------------------------------

export interface ArtifactRelationshipProvenance {
  readonly relationshipId: string;
  readonly source: string;
  readonly governanceStatus: LaboratoryGovernanceStatus;
  readonly rationale: string;
  readonly providedBy: string;
}

// ---------------------------------------------------------------------------
// Laboratory Visualization
// ---------------------------------------------------------------------------

export interface LaboratoryVisualization {
  readonly visualizationId: string;
  readonly visualizationType: VisualizationType;
  readonly title: string;
  readonly description: string;
  readonly experimentId: string;
  readonly expectedOutputId: string;
  readonly governanceStatus: LaboratoryGovernanceStatus;
  readonly provenance: VisualizationProvenance;
}

// ---------------------------------------------------------------------------
// Laboratory Observation
// ---------------------------------------------------------------------------

export interface LaboratoryObservation {
  readonly observationId: string;
  readonly observationType: ObservationType;
  readonly description: string;
  readonly experimentId: string;
  readonly relatedArtifacts: readonly string[];
  readonly governanceStatus: LaboratoryGovernanceStatus;
  readonly provenance: ObservationProvenance;
}

// ---------------------------------------------------------------------------
// Laboratory Metric
// ---------------------------------------------------------------------------

export interface LaboratoryMetric {
  readonly metricId: string;
  readonly metricType: MetricType;
  readonly displayName: string;
  readonly unit: string;
  readonly expectedRange: string;
  readonly experimentId: string;
  readonly governanceStatus: LaboratoryGovernanceStatus;
  readonly provenance: MetricProvenance;
}

// ---------------------------------------------------------------------------
// Result Artifact Relationship
// ---------------------------------------------------------------------------

export interface ResultArtifactRelationship {
  readonly relationshipId: string;
  readonly sourceArtifactId: string;
  readonly targetArtifactId: string;
  readonly relationshipType: string;
  readonly description: string;
  readonly governanceStatus: LaboratoryGovernanceStatus;
  readonly provenance: ArtifactRelationshipProvenance;
}

// ---------------------------------------------------------------------------
// Laboratory Result Artifact
// ---------------------------------------------------------------------------

export interface LaboratoryResultArtifact {
  readonly artifactId: string;
  readonly artifactType: ResultArtifactType;
  readonly experimentId: string;
  readonly visualizationId: string;
  readonly metricId: string;
  readonly observationId: string;
  readonly status: ResultArtifactStatus;
  readonly governanceStatus: LaboratoryGovernanceStatus;
  readonly provenance: ResultArtifactProvenance;
}

// ---------------------------------------------------------------------------
// Result Artifact Decision
// ---------------------------------------------------------------------------

export interface ResultArtifactDecision {
  readonly decisionId: string;
  readonly artifactId: string;
  readonly validationPassed: boolean;
  readonly validationErrors: readonly string[];
}

// ---------------------------------------------------------------------------
// Result Artifact Trace
// ---------------------------------------------------------------------------

export interface ResultArtifactTrace {
  readonly traceId: string;
  readonly visualizationCount: number;
  readonly observationCount: number;
  readonly metricCount: number;
  readonly artifactCount: number;
  readonly relationshipCount: number;
  readonly validatedCount: number;
  readonly invalidCount: number;
  readonly decisions: readonly ResultArtifactDecision[];
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_result_artifact_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Result Artifact Registry
// ---------------------------------------------------------------------------

export interface ResultArtifactRegistry {
  readonly registryId: string;
  readonly visualizations: readonly LaboratoryVisualization[];
  readonly observations: readonly LaboratoryObservation[];
  readonly metrics: readonly LaboratoryMetric[];
  readonly artifacts: readonly LaboratoryResultArtifact[];
  readonly relationships: readonly ResultArtifactRelationship[];
  readonly visualizationCount: number;
  readonly observationCount: number;
  readonly metricCount: number;
  readonly artifactCount: number;
  readonly relationshipCount: number;
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_result_artifact_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Result Artifact Input
// ---------------------------------------------------------------------------

export interface ResultArtifactInput {
  readonly visualizations: readonly LaboratoryVisualization[];
  readonly observations: readonly LaboratoryObservation[];
  readonly metrics: readonly LaboratoryMetric[];
  readonly artifacts: readonly LaboratoryResultArtifact[];
  readonly relationships: readonly ResultArtifactRelationship[];
}

// ---------------------------------------------------------------------------
// Laboratory Artifact With Results
// ---------------------------------------------------------------------------

export interface LaboratoryArtifactWithResults {
  readonly artifactId: string;
  readonly registry: ResultArtifactRegistry;
  readonly trace: ResultArtifactTrace;
}

// ---------------------------------------------------------------------------
// Result Artifact Validation Error
// ---------------------------------------------------------------------------

export interface ResultArtifactValidationError {
  readonly code: string;
  readonly message: string;
  readonly field?: string;
  readonly visualizationId?: string;
  readonly observationId?: string;
  readonly metricId?: string;
  readonly artifactId?: string;
  readonly relationshipId?: string;
}

// ---------------------------------------------------------------------------
// Result Artifact Validation Result
// ---------------------------------------------------------------------------

export interface ResultArtifactValidationResult {
  readonly valid: boolean;
  readonly errors: readonly ResultArtifactValidationError[];
  readonly checkedAt: 'result_artifact_composition';
}

// ---------------------------------------------------------------------------
// Result Artifact Validation Result (Registry)
// ---------------------------------------------------------------------------

export interface ResultArtifactRegistryValidationResult {
  readonly valid: boolean;
  readonly errors: readonly ResultArtifactValidationError[];
  readonly checkedAt: 'result_artifact_registry_composition';
}

// ---------------------------------------------------------------------------
// Result Artifact Validation Result (Artifact)
// ---------------------------------------------------------------------------

export interface ResultArtifactArtifactValidationResult {
  readonly valid: boolean;
  readonly errors: readonly ResultArtifactValidationError[];
  readonly checkedAt: 'result_artifact_artifact_composition';
}

// ---------------------------------------------------------------------------
// Result Artifact Validation Result (Input)
// ---------------------------------------------------------------------------

export interface ResultArtifactInputValidationResult {
  readonly valid: boolean;
  readonly errors: readonly ResultArtifactValidationError[];
  readonly checkedAt: 'result_artifact_input_composition';
}

// ============================================================================
// D4-OPT-06 — Laboratory Workflow Orchestration Types
// ============================================================================

// ---------------------------------------------------------------------------
// Canonical Workflow Types (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_WORKFLOW_TYPES = [
  'single_experiment',
  'multi_experiment',
  'comparison',
  'parameter_sweep',
  'educational_sequence',
  'guided_walkthrough',
  'research_validation',
  'visualization_pipeline',
  'capstone_workflow',
  'custom',
] as const;

export type LaboratoryWorkflowType = (typeof CANONICAL_WORKFLOW_TYPES)[number];

// ---------------------------------------------------------------------------
// Canonical Workflow Step Types (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_WORKFLOW_STEP_TYPES = [
  'prepare',
  'configure',
  'execute_metadata',
  'observe',
  'compare',
  'visualize',
  'record',
  'evaluate',
  'review',
  'complete',
] as const;

export type LaboratoryWorkflowStepType = (typeof CANONICAL_WORKFLOW_STEP_TYPES)[number];

// ---------------------------------------------------------------------------
// Canonical Workflow Status (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_WORKFLOW_STATUS = [
  'draft',
  'review',
  'approved',
  'published',
  'deprecated',
  'archived',
] as const;

export type LaboratoryWorkflowStatus = (typeof CANONICAL_WORKFLOW_STATUS)[number];

// ---------------------------------------------------------------------------
// Workflow Provenance
// ---------------------------------------------------------------------------

export interface LaboratoryWorkflowProvenance {
  readonly workflowId: string;
  readonly source: string;
  readonly governanceStatus: LaboratoryGovernanceStatus;
  readonly rationale: string;
  readonly providedBy: string;
}

// ---------------------------------------------------------------------------
// Workflow Step
// ---------------------------------------------------------------------------

export interface LaboratoryWorkflowStep {
  readonly stepId: string;
  readonly stepType: LaboratoryWorkflowStepType;
  readonly stepOrder: number;
  readonly title: string;
  readonly description: string;
  readonly experimentId: string;
  readonly configurationId: string;
  readonly executionPolicyId: string;
  readonly resultArtifactId: string;
  readonly visualizationId: string;
  readonly governanceStatus: LaboratoryGovernanceStatus;
}

// ---------------------------------------------------------------------------
// Laboratory Workflow
// ---------------------------------------------------------------------------

export interface LaboratoryWorkflow {
  readonly workflowId: string;
  readonly workflowType: LaboratoryWorkflowType;
  readonly name: string;
  readonly description: string;
  readonly laboratoryId: string;
  readonly steps: readonly LaboratoryWorkflowStep[];
  readonly status: LaboratoryWorkflowStatus;
  readonly governanceStatus: LaboratoryGovernanceStatus;
  readonly provenance: LaboratoryWorkflowProvenance;
}

// ---------------------------------------------------------------------------
// Workflow Decision
// ---------------------------------------------------------------------------

export interface LaboratoryWorkflowDecision {
  readonly decisionId: string;
  readonly workflowId: string;
  readonly validationPassed: boolean;
  readonly validationErrors: readonly string[];
}

// ---------------------------------------------------------------------------
// Workflow Trace
// ---------------------------------------------------------------------------

export interface LaboratoryWorkflowTrace {
  readonly traceId: string;
  readonly workflowCount: number;
  readonly stepCount: number;
  readonly validatedCount: number;
  readonly invalidCount: number;
  readonly decisions: readonly LaboratoryWorkflowDecision[];
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_workflow_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Workflow Registry
// ---------------------------------------------------------------------------

export interface LaboratoryWorkflowRegistry {
  readonly registryId: string;
  readonly workflows: readonly LaboratoryWorkflow[];
  readonly workflowCount: number;
  readonly stepCount: number;
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_workflow_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Workflow Input
// ---------------------------------------------------------------------------

export interface LaboratoryWorkflowInput {
  readonly workflows: readonly LaboratoryWorkflow[];
}

// ---------------------------------------------------------------------------
// Laboratory Artifact With Workflows
// ---------------------------------------------------------------------------

export interface LaboratoryArtifactWithWorkflows {
  readonly artifactId: string;
  readonly registry: LaboratoryWorkflowRegistry;
  readonly trace: LaboratoryWorkflowTrace;
}

// ---------------------------------------------------------------------------
// Workflow Validation Error
// ---------------------------------------------------------------------------

export interface LaboratoryWorkflowValidationError {
  readonly code: string;
  readonly message: string;
  readonly field?: string;
  readonly workflowId?: string;
  readonly stepId?: string;
}

// ---------------------------------------------------------------------------
// Workflow Validation Result
// ---------------------------------------------------------------------------

export interface LaboratoryWorkflowValidationResult {
  readonly valid: boolean;
  readonly errors: readonly LaboratoryWorkflowValidationError[];
  readonly checkedAt: 'workflow_composition';
}

// ---------------------------------------------------------------------------
// Workflow Validation Result (Registry)
// ---------------------------------------------------------------------------

export interface LaboratoryWorkflowRegistryValidationResult {
  readonly valid: boolean;
  readonly errors: readonly LaboratoryWorkflowValidationError[];
  readonly checkedAt: 'workflow_registry_composition';
}

// ---------------------------------------------------------------------------
// Workflow Validation Result (Artifact)
// ---------------------------------------------------------------------------

export interface LaboratoryWorkflowArtifactValidationResult {
  readonly valid: boolean;
  readonly errors: readonly LaboratoryWorkflowValidationError[];
  readonly checkedAt: 'workflow_artifact_composition';
}

// ---------------------------------------------------------------------------
// Workflow Validation Result (Input)
// ---------------------------------------------------------------------------

export interface LaboratoryWorkflowInputValidationResult {
  readonly valid: boolean;
  readonly errors: readonly LaboratoryWorkflowValidationError[];
  readonly checkedAt: 'workflow_input_composition';
}

// ============================================================================
// D4-OPT-07 — Laboratory Interaction & User Action Modeling Types
// ============================================================================

// ---------------------------------------------------------------------------
// Canonical Interaction Types (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_INTERACTION_TYPES = [
  'parameter_adjustment',
  'prediction_submission',
  'observation_note',
  'comparison_selection',
  'visualization_focus',
  'step_navigation',
  'dataset_selection',
  'experiment_selection',
  'result_inspection',
  'completion_marker',
] as const;

export type LaboratoryInteractionType = (typeof CANONICAL_INTERACTION_TYPES)[number];

// ---------------------------------------------------------------------------
// Canonical User Action Types (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_USER_ACTION_TYPES = [
  'select',
  'modify',
  'inspect',
  'compare',
  'annotate',
  'navigate',
  'confirm',
  'reset',
  'review',
  'complete',
] as const;

export type LaboratoryUserActionType = (typeof CANONICAL_USER_ACTION_TYPES)[number];

// ---------------------------------------------------------------------------
// Canonical Interaction Status (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_INTERACTION_STATUS = [
  'draft',
  'review',
  'approved',
  'published',
  'deprecated',
  'archived',
] as const;

export type LaboratoryInteractionStatus = (typeof CANONICAL_INTERACTION_STATUS)[number];

// ---------------------------------------------------------------------------
// Interaction Provenance
// ---------------------------------------------------------------------------

export interface LaboratoryInteractionProvenance {
  readonly interactionId: string;
  readonly source: string;
  readonly governanceStatus: LaboratoryGovernanceStatus;
  readonly rationale: string;
  readonly providedBy: string;
}

// ---------------------------------------------------------------------------
// User Action
// ---------------------------------------------------------------------------

export interface LaboratoryUserAction {
  readonly actionId: string;
  readonly actionType: LaboratoryUserActionType;
  readonly title: string;
  readonly description: string;
  readonly targetId: string;
  readonly targetType: string;
  readonly interactionId: string;
  readonly governanceStatus: LaboratoryGovernanceStatus;
}

// ---------------------------------------------------------------------------
// Laboratory Interaction
// ---------------------------------------------------------------------------

export interface LaboratoryInteraction {
  readonly interactionId: string;
  readonly interactionType: LaboratoryInteractionType;
  readonly name: string;
  readonly description: string;
  readonly workflowId: string;
  readonly workflowStepId: string;
  readonly experimentId: string;
  readonly configurationId: string;
  readonly parameterId: string;
  readonly resultArtifactId: string;
  readonly visualizationId: string;
  readonly datasetReferenceId: string;
  readonly actions: readonly LaboratoryUserAction[];
  readonly status: LaboratoryInteractionStatus;
  readonly governanceStatus: LaboratoryGovernanceStatus;
  readonly provenance: LaboratoryInteractionProvenance;
}

// ---------------------------------------------------------------------------
// Interaction Decision
// ---------------------------------------------------------------------------

export interface LaboratoryInteractionDecision {
  readonly decisionId: string;
  readonly interactionId: string;
  readonly validationPassed: boolean;
  readonly validationErrors: readonly string[];
}

// ---------------------------------------------------------------------------
// Interaction Trace
// ---------------------------------------------------------------------------

export interface LaboratoryInteractionTrace {
  readonly traceId: string;
  readonly interactionCount: number;
  readonly actionCount: number;
  readonly validatedCount: number;
  readonly invalidCount: number;
  readonly decisions: readonly LaboratoryInteractionDecision[];
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_interaction_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Interaction Registry
// ---------------------------------------------------------------------------

export interface LaboratoryInteractionRegistry {
  readonly registryId: string;
  readonly interactions: readonly LaboratoryInteraction[];
  readonly interactionCount: number;
  readonly actionCount: number;
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_interaction_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Interaction Input
// ---------------------------------------------------------------------------

export interface LaboratoryInteractionInput {
  readonly interactions: readonly LaboratoryInteraction[];
}

// ---------------------------------------------------------------------------
// Laboratory Artifact With Interactions
// ---------------------------------------------------------------------------

export interface LaboratoryArtifactWithInteractions {
  readonly artifactId: string;
  readonly registry: LaboratoryInteractionRegistry;
  readonly trace: LaboratoryInteractionTrace;
}

// ---------------------------------------------------------------------------
// Interaction Validation Error
// ---------------------------------------------------------------------------

export interface LaboratoryInteractionValidationError {
  readonly code: string;
  readonly message: string;
  readonly field?: string;
  readonly interactionId?: string;
  readonly actionId?: string;
}

// ---------------------------------------------------------------------------
// Interaction Validation Result
// ---------------------------------------------------------------------------

export interface LaboratoryInteractionValidationResult {
  readonly valid: boolean;
  readonly errors: readonly LaboratoryInteractionValidationError[];
  readonly checkedAt: 'interaction_composition';
}

// ---------------------------------------------------------------------------
// Interaction Validation Result (Registry)
// ---------------------------------------------------------------------------

export interface LaboratoryInteractionRegistryValidationResult {
  readonly valid: boolean;
  readonly errors: readonly LaboratoryInteractionValidationError[];
  readonly checkedAt: 'interaction_registry_composition';
}

// ---------------------------------------------------------------------------
// Interaction Validation Result (Artifact)
// ---------------------------------------------------------------------------

export interface LaboratoryInteractionArtifactValidationResult {
  readonly valid: boolean;
  readonly errors: readonly LaboratoryInteractionValidationError[];
  readonly checkedAt: 'interaction_artifact_composition';
}

// ---------------------------------------------------------------------------
// Interaction Validation Result (Input)
// ---------------------------------------------------------------------------

export interface LaboratoryInteractionInputValidationResult {
  readonly valid: boolean;
  readonly errors: readonly LaboratoryInteractionValidationError[];
  readonly checkedAt: 'interaction_input_composition';
}

// ============================================================================
// D4-OPT-08 — Predict-Before-Run & Hypothesis Modeling Types
// ============================================================================

// ---------------------------------------------------------------------------
// Canonical Hypothesis Types (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_HYPOTHESIS_TYPES = [
  'expected_behavior',
  'expected_visual_pattern',
  'expected_metric',
  'algorithm_prediction',
  'parameter_effect',
  'dataset_prediction',
  'performance_prediction',
  'comparison_prediction',
  'failure_prediction',
  'custom',
] as const;

export type LaboratoryHypothesisType = (typeof CANONICAL_HYPOTHESIS_TYPES)[number];

// ---------------------------------------------------------------------------
// Canonical Prediction Prompt Types (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_PREDICTION_PROMPT_TYPES = [
  'multiple_choice',
  'ranking',
  'ordering',
  'selection',
  'free_observation',
  'visual_prediction',
  'parameter_prediction',
  'comparison_prediction',
  'metric_prediction',
  'reflection',
] as const;

export type LaboratoryPredictionPromptType = (typeof CANONICAL_PREDICTION_PROMPT_TYPES)[number];

// ---------------------------------------------------------------------------
// Canonical Observation Targets (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_OBSERVATION_TARGETS = [
  'visualization',
  'metric',
  'algorithm',
  'dataset',
  'parameter',
  'workflow',
  'experiment',
  'comparison',
  'result_artifact',
  'custom',
] as const;

export type LaboratoryObservationTarget = (typeof CANONICAL_OBSERVATION_TARGETS)[number];

// ---------------------------------------------------------------------------
// Canonical Hypothesis Status (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_HYPOTHESIS_STATUS = [
  'draft',
  'review',
  'approved',
  'published',
  'deprecated',
  'archived',
] as const;

export type LaboratoryHypothesisStatus = (typeof CANONICAL_HYPOTHESIS_STATUS)[number];

// ---------------------------------------------------------------------------
// Hypothesis Provenance
// ---------------------------------------------------------------------------

export interface LaboratoryHypothesisProvenance {
  readonly hypothesisId: string;
  readonly source: string;
  readonly governanceStatus: LaboratoryGovernanceStatus;
  readonly rationale: string;
  readonly providedBy: string;
}

// ---------------------------------------------------------------------------
// Prediction Prompt
// ---------------------------------------------------------------------------

export interface LaboratoryPredictionPrompt {
  readonly promptId: string;
  readonly promptType: LaboratoryPredictionPromptType;
  readonly title: string;
  readonly description: string;
  readonly hypothesisId: string;
  readonly observationTargetId: string;
  readonly reasoningCategory: string;
  readonly governanceStatus: LaboratoryGovernanceStatus;
}

// ---------------------------------------------------------------------------
// Laboratory Hypothesis
// ---------------------------------------------------------------------------

export interface LaboratoryHypothesis {
  readonly hypothesisId: string;
  readonly hypothesisType: LaboratoryHypothesisType;
  readonly name: string;
  readonly description: string;
  readonly experimentId: string;
  readonly workflowId: string;
  readonly parameterId: string;
  readonly visualizationId: string;
  readonly observationTargetId: string;
  readonly prompts: readonly LaboratoryPredictionPrompt[];
  readonly status: LaboratoryHypothesisStatus;
  readonly governanceStatus: LaboratoryGovernanceStatus;
  readonly provenance: LaboratoryHypothesisProvenance;
}

// ---------------------------------------------------------------------------
// Hypothesis Decision
// ---------------------------------------------------------------------------

export interface LaboratoryHypothesisDecision {
  readonly decisionId: string;
  readonly hypothesisId: string;
  readonly validationPassed: boolean;
  readonly validationErrors: readonly string[];
}

// ---------------------------------------------------------------------------
// Hypothesis Trace
// ---------------------------------------------------------------------------

export interface LaboratoryHypothesisTrace {
  readonly traceId: string;
  readonly hypothesisCount: number;
  readonly promptCount: number;
  readonly validatedCount: number;
  readonly invalidCount: number;
  readonly decisions: readonly LaboratoryHypothesisDecision[];
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_hypothesis_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Hypothesis Registry
// ---------------------------------------------------------------------------

export interface LaboratoryHypothesisRegistry {
  readonly registryId: string;
  readonly hypotheses: readonly LaboratoryHypothesis[];
  readonly hypothesisCount: number;
  readonly promptCount: number;
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_hypothesis_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Hypothesis Input
// ---------------------------------------------------------------------------

export interface LaboratoryHypothesisInput {
  readonly hypotheses: readonly LaboratoryHypothesis[];
}

// ---------------------------------------------------------------------------
// Laboratory Artifact With Hypotheses
// ---------------------------------------------------------------------------

export interface LaboratoryArtifactWithHypotheses {
  readonly artifactId: string;
  readonly registry: LaboratoryHypothesisRegistry;
  readonly trace: LaboratoryHypothesisTrace;
}

// ---------------------------------------------------------------------------
// Hypothesis Validation Error
// ---------------------------------------------------------------------------

export interface LaboratoryHypothesisValidationError {
  readonly code: string;
  readonly message: string;
  readonly field?: string;
  readonly hypothesisId?: string;
  readonly promptId?: string;
}

// ---------------------------------------------------------------------------
// Hypothesis Validation Result
// ---------------------------------------------------------------------------

export interface LaboratoryHypothesisValidationResult {
  readonly valid: boolean;
  readonly errors: readonly LaboratoryHypothesisValidationError[];
  readonly checkedAt: 'hypothesis_composition';
}

// ---------------------------------------------------------------------------
// Hypothesis Validation Result (Registry)
// ---------------------------------------------------------------------------

export interface LaboratoryHypothesisRegistryValidationResult {
  readonly valid: boolean;
  readonly errors: readonly LaboratoryHypothesisValidationError[];
  readonly checkedAt: 'hypothesis_registry_composition';
}

// ---------------------------------------------------------------------------
// Hypothesis Validation Result (Artifact)
// ---------------------------------------------------------------------------

export interface LaboratoryHypothesisArtifactValidationResult {
  readonly valid: boolean;
  readonly errors: readonly LaboratoryHypothesisValidationError[];
  readonly checkedAt: 'hypothesis_artifact_composition';
}

// ---------------------------------------------------------------------------
// Hypothesis Validation Result (Input)
// ---------------------------------------------------------------------------

export interface LaboratoryHypothesisInputValidationResult {
  readonly valid: boolean;
  readonly errors: readonly LaboratoryHypothesisValidationError[];
  readonly checkedAt: 'hypothesis_input_composition';
}

// ============================================================================
// D4-OPT-09 — Laboratory History & Local Evidence Modeling Types
// ============================================================================

// ---------------------------------------------------------------------------
// Canonical History Types (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_HISTORY_TYPES = [
  'experiment_history',
  'observation_history',
  'hypothesis_history',
  'workflow_history',
  'configuration_history',
  'comparison_history',
  'artifact_history',
  'evaluation_history',
  'annotation_history',
  'session_history',
] as const;

export type LaboratoryHistoryType = (typeof CANONICAL_HISTORY_TYPES)[number];

// ---------------------------------------------------------------------------
// Canonical Evidence Types (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_EVIDENCE_TYPES = [
  'observation',
  'measurement',
  'metric',
  'visualization',
  'annotation',
  'comparison',
  'prediction',
  'hypothesis',
  'result_artifact',
  'evaluation',
] as const;

export type LaboratoryEvidenceType = (typeof CANONICAL_EVIDENCE_TYPES)[number];

// ---------------------------------------------------------------------------
// Canonical Evidence Relationship Types (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_EVIDENCE_RELATIONSHIP_TYPES = [
  'derived_from',
  'supports',
  'contradicts',
  'extends',
  'refines',
  'references',
  'compares',
  'validates',
  'documents',
  'groups',
] as const;

export type LaboratoryEvidenceRelationshipType = (typeof CANONICAL_EVIDENCE_RELATIONSHIP_TYPES)[number];

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

export type LaboratoryHistoryStatus = (typeof CANONICAL_HISTORY_STATUS)[number];

// ---------------------------------------------------------------------------
// History Provenance
// ---------------------------------------------------------------------------

export interface LaboratoryHistoryProvenance {
  readonly historyId: string;
  readonly source: string;
  readonly governanceStatus: LaboratoryGovernanceStatus;
  readonly rationale: string;
  readonly providedBy: string;
}

// ---------------------------------------------------------------------------
// Evidence Provenance
// ---------------------------------------------------------------------------

export interface LaboratoryEvidenceProvenance {
  readonly evidenceId: string;
  readonly source: string;
  readonly governanceStatus: LaboratoryGovernanceStatus;
  readonly rationale: string;
  readonly providedBy: string;
}

// ---------------------------------------------------------------------------
// Evidence Relationship Provenance
// ---------------------------------------------------------------------------

export interface LaboratoryEvidenceRelationshipProvenance {
  readonly relationshipId: string;
  readonly source: string;
  readonly governanceStatus: LaboratoryGovernanceStatus;
  readonly rationale: string;
  readonly providedBy: string;
}

// ---------------------------------------------------------------------------
// Laboratory History Record
// ---------------------------------------------------------------------------

export interface LaboratoryHistoryRecord {
  readonly historyId: string;
  readonly historyType: LaboratoryHistoryType;
  readonly title: string;
  readonly description: string;
  readonly experimentId: string;
  readonly workflowId: string;
  readonly configurationId: string;
  readonly evidenceIds: readonly string[];
  readonly status: LaboratoryHistoryStatus;
  readonly governanceStatus: LaboratoryGovernanceStatus;
  readonly provenance: LaboratoryHistoryProvenance;
}

// ---------------------------------------------------------------------------
// Laboratory Evidence Record
// ---------------------------------------------------------------------------

export interface LaboratoryEvidenceRecord {
  readonly evidenceId: string;
  readonly evidenceType: LaboratoryEvidenceType;
  readonly title: string;
  readonly description: string;
  readonly experimentId: string;
  readonly workflowId: string;
  readonly configurationId: string;
  readonly visualizationId: string;
  readonly metricId: string;
  readonly observationId: string;
  readonly hypothesisId: string;
  readonly artifactId: string;
  readonly governanceStatus: LaboratoryGovernanceStatus;
  readonly provenance: LaboratoryEvidenceProvenance;
}

// ---------------------------------------------------------------------------
// Laboratory Evidence Relationship
// ---------------------------------------------------------------------------

export interface LaboratoryEvidenceRelationship {
  readonly relationshipId: string;
  readonly sourceEvidenceId: string;
  readonly targetEvidenceId: string;
  readonly relationshipType: LaboratoryEvidenceRelationshipType;
  readonly description: string;
  readonly governanceStatus: LaboratoryGovernanceStatus;
  readonly provenance: LaboratoryEvidenceRelationshipProvenance;
}

// ---------------------------------------------------------------------------
// History Decision
// ---------------------------------------------------------------------------

export interface LaboratoryHistoryDecision {
  readonly decisionId: string;
  readonly historyId: string;
  readonly validationPassed: boolean;
  readonly validationErrors: readonly string[];
}

// ---------------------------------------------------------------------------
// History Trace
// ---------------------------------------------------------------------------

export interface LaboratoryHistoryTrace {
  readonly traceId: string;
  readonly historyCount: number;
  readonly evidenceCount: number;
  readonly relationshipCount: number;
  readonly validatedCount: number;
  readonly invalidCount: number;
  readonly decisions: readonly LaboratoryHistoryDecision[];
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_history_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// History Registry
// ---------------------------------------------------------------------------

export interface LaboratoryHistoryRegistry {
  readonly registryId: string;
  readonly histories: readonly LaboratoryHistoryRecord[];
  readonly evidence: readonly LaboratoryEvidenceRecord[];
  readonly relationships: readonly LaboratoryEvidenceRelationship[];
  readonly historyCount: number;
  readonly evidenceCount: number;
  readonly relationshipCount: number;
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_history_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// History Input
// ---------------------------------------------------------------------------

export interface LaboratoryHistoryInput {
  readonly histories: readonly LaboratoryHistoryRecord[];
  readonly evidence: readonly LaboratoryEvidenceRecord[];
  readonly relationships: readonly LaboratoryEvidenceRelationship[];
}

// ---------------------------------------------------------------------------
// Laboratory Artifact With History
// ---------------------------------------------------------------------------

export interface LaboratoryArtifactWithHistory {
  readonly artifactId: string;
  readonly registry: LaboratoryHistoryRegistry;
  readonly trace: LaboratoryHistoryTrace;
}

// ---------------------------------------------------------------------------
// History Validation Error
// ---------------------------------------------------------------------------

export interface LaboratoryHistoryValidationError {
  readonly code: string;
  readonly message: string;
  readonly field?: string;
  readonly historyId?: string;
  readonly evidenceId?: string;
  readonly relationshipId?: string;
}

// ---------------------------------------------------------------------------
// History Validation Result
// ---------------------------------------------------------------------------

export interface LaboratoryHistoryValidationResult {
  readonly valid: boolean;
  readonly errors: readonly LaboratoryHistoryValidationError[];
  readonly checkedAt: 'history_composition';
}

// ---------------------------------------------------------------------------
// History Validation Result (Registry)
// ---------------------------------------------------------------------------

export interface LaboratoryHistoryRegistryValidationResult {
  readonly valid: boolean;
  readonly errors: readonly LaboratoryHistoryValidationError[];
  readonly checkedAt: 'history_registry_composition';
}

// ---------------------------------------------------------------------------
// History Validation Result (Artifact)
// ---------------------------------------------------------------------------

export interface LaboratoryHistoryArtifactValidationResult {
  readonly valid: boolean;
  readonly errors: readonly LaboratoryHistoryValidationError[];
  readonly checkedAt: 'history_artifact_composition';
}

// ---------------------------------------------------------------------------
// History Validation Result (Input)
// ---------------------------------------------------------------------------

export interface LaboratoryHistoryInputValidationResult {
  readonly valid: boolean;
  readonly errors: readonly LaboratoryHistoryValidationError[];
  readonly checkedAt: 'history_input_composition';
}

// ============================================================================
// D4-OPT-10 — Laboratory Certification & Structural Quality Gate Types
// ============================================================================

// ---------------------------------------------------------------------------
// Canonical Certification Status (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_CERTIFICATION_STATUS = [
  'certified',
  'certified_with_warnings',
  'needs_revision',
  'blocked',
] as const;

export type LaboratoryCompositionCertificationStatus = (typeof CANONICAL_CERTIFICATION_STATUS)[number];

// ---------------------------------------------------------------------------
// Canonical Finding Severity (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_FINDING_SEVERITY = [
  'error',
  'warning',
  'recommendation',
] as const;

export type LaboratoryCompositionFindingSeverity = (typeof CANONICAL_FINDING_SEVERITY)[number];

// ---------------------------------------------------------------------------
// Canonical Quality Dimensions (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_QUALITY_DIMENSIONS = [
  'registry_integrity',
  'execution_integrity',
  'parameter_integrity',
  'experiment_integrity',
  'workflow_integrity',
  'interaction_integrity',
  'hypothesis_integrity',
  'history_integrity',
  'result_artifact_integrity',
  'configuration_integrity',
  'visualization_integrity',
  'evidence_integrity',
  'provenance_integrity',
  'relationship_integrity',
  'determinism',
  'validation_integrity',
  'architectural_boundary',
  'documentation_completeness',
] as const;

export type LaboratoryCompositionQualityDimension = (typeof CANONICAL_QUALITY_DIMENSIONS)[number];

// ---------------------------------------------------------------------------
// Laboratory Composition Finding
// ---------------------------------------------------------------------------

export interface LaboratoryCompositionFinding {
  readonly findingId: string;
  readonly severity: LaboratoryCompositionFindingSeverity;
  readonly qualityDimension: LaboratoryCompositionQualityDimension;
  readonly code: string;
  readonly message: string;
  readonly rationale: string;
  readonly governanceStatus: LaboratoryGovernanceStatus;
}

// ---------------------------------------------------------------------------
// Laboratory Composition Certification Provenance
// ---------------------------------------------------------------------------

export interface LaboratoryCompositionCertificationProvenance {
  readonly certificationId: string;
  readonly source: string;
  readonly governanceStatus: LaboratoryGovernanceStatus;
  readonly rationale: string;
  readonly providedBy: string;
}

// ---------------------------------------------------------------------------
// Laboratory Composition Certification Report
// ---------------------------------------------------------------------------

export interface LaboratoryCompositionCertificationReport {
  readonly certificationId: string;
  readonly artifactId: string;
  readonly certificationStatus: LaboratoryCompositionCertificationStatus;
  readonly qualityScore: number;
  readonly findings: readonly LaboratoryCompositionFinding[];
  readonly findingCount: number;
  readonly errorCount: number;
  readonly warningCount: number;
  readonly recommendationCount: number;
  readonly dimensionsChecked: readonly LaboratoryCompositionQualityDimension[];
  readonly governanceStatus: LaboratoryGovernanceStatus;
  readonly provenance: LaboratoryCompositionCertificationProvenance;
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_certification_engine';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Laboratory Composition Certification Input
// ---------------------------------------------------------------------------

export interface LaboratoryCompositionCertificationInput {
  readonly certificationId: string;
  readonly artifactId: string;
  readonly findings: readonly LaboratoryCompositionFinding[];
  readonly dimensionsChecked: readonly LaboratoryCompositionQualityDimension[];
  readonly governanceStatus: LaboratoryGovernanceStatus;
  readonly provenance: LaboratoryCompositionCertificationProvenance;
}

// ---------------------------------------------------------------------------
// Laboratory Composition Certification Validation Error
// ---------------------------------------------------------------------------

export interface LaboratoryCompositionCertificationValidationError {
  readonly code: string;
  readonly message: string;
  readonly field?: string;
  readonly certificationId?: string;
  readonly findingId?: string;
}

// ---------------------------------------------------------------------------
// Laboratory Composition Certification Validation Result
// ---------------------------------------------------------------------------

export interface LaboratoryCompositionCertificationValidationResult {
  readonly valid: boolean;
  readonly errors: readonly LaboratoryCompositionCertificationValidationError[];
  readonly checkedAt: 'certification_composition';
}

// ============================================================================
// D4-OPT-11 — Public API Consolidation & Laboratory Pipeline Facade Types
// ============================================================================

// ---------------------------------------------------------------------------
// Canonical Facade Status (fixed)
// ---------------------------------------------------------------------------

export const CANONICAL_FACADE_STATUS = [
  'composed',
  'certified',
  'failed',
] as const;

export type LaboratoryFacadeStatus = (typeof CANONICAL_FACADE_STATUS)[number];

// ---------------------------------------------------------------------------
// Laboratory Composition Input
// ---------------------------------------------------------------------------

export interface LaboratoryCompositionInput {
  readonly laboratories: readonly LaboratoryMetadata[];
  readonly executions: readonly LaboratoryExecutionPlan[];
  readonly configurations: readonly LaboratoryConfiguration[];
  readonly parameters: readonly LaboratoryParameter[];
  readonly groups: readonly LaboratoryParameterGroup[];
  readonly experiments: readonly LaboratoryExperiment[];
  readonly scenarios: readonly ExperimentScenario[];
  readonly datasetReferences: readonly ExperimentDatasetReference[];
  readonly expectedOutputs: readonly ExperimentExpectedOutput[];
  readonly evaluationMetadata: readonly ExperimentEvaluationMetadata[];
  readonly visualizations: readonly LaboratoryVisualization[];
  readonly observations: readonly LaboratoryObservation[];
  readonly metrics: readonly LaboratoryMetric[];
  readonly artifacts: readonly LaboratoryResultArtifact[];
  readonly relationships: readonly ResultArtifactRelationship[];
  readonly workflows: readonly LaboratoryWorkflow[];
  readonly interactions: readonly LaboratoryInteraction[];
  readonly hypotheses: readonly LaboratoryHypothesis[];
  readonly historyRecords: readonly LaboratoryHistoryRecord[];
  readonly historyEvidence: readonly LaboratoryEvidenceRecord[];
  readonly historyRelationships: readonly LaboratoryEvidenceRelationship[];
}

// ---------------------------------------------------------------------------
// Laboratory Facade Trace Metadata
// ---------------------------------------------------------------------------

export interface LaboratoryFacadeTraceMetadata {
  readonly artifactId: string;
  readonly pipeline: string;
  readonly deterministic: true;
  readonly randomUsed: false;
  readonly timeDependency: false;
  readonly laboratoryMutated: false;
}

// ---------------------------------------------------------------------------
// Laboratory Facade Validation Error
// ---------------------------------------------------------------------------

export interface LaboratoryFacadeValidationError {
  readonly code: string;
  readonly message: string;
  readonly field?: string;
}

// ---------------------------------------------------------------------------
// Laboratory Facade Validation Result
// ---------------------------------------------------------------------------

export interface LaboratoryFacadeValidationResult {
  readonly valid: boolean;
  readonly errors: readonly LaboratoryFacadeValidationError[];
}

// ---------------------------------------------------------------------------
// Laboratory Facade Output
// ---------------------------------------------------------------------------

export interface LaboratoryFacadeOutput {
  readonly artifactId: string;
  readonly laboratoryRegistry: LaboratoryRegistry;
  readonly executionRegistry: LaboratoryExecutionRegistry;
  readonly configurationRegistry: LaboratoryConfigurationRegistry;
  readonly experimentRegistry: ExperimentRegistry;
  readonly resultArtifactRegistry: ResultArtifactRegistry;
  readonly workflowRegistry: LaboratoryWorkflowRegistry;
  readonly interactionRegistry: LaboratoryInteractionRegistry;
  readonly hypothesisRegistry: LaboratoryHypothesisRegistry;
  readonly historyRegistry: LaboratoryHistoryRegistry;
  readonly facadeStatus: LaboratoryFacadeStatus;
  readonly traceMetadata: LaboratoryFacadeTraceMetadata;
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_laboratory_facade';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Laboratory Certification Output
// ---------------------------------------------------------------------------

export interface LaboratoryCertificationOutput {
  readonly artifactId: string;
  readonly certificationReport: LaboratoryCompositionCertificationReport;
  readonly facadeStatus: LaboratoryFacadeStatus;
  readonly traceMetadata: LaboratoryFacadeTraceMetadata;
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_laboratory_facade';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

// ---------------------------------------------------------------------------
// Laboratory Complete Output
// ---------------------------------------------------------------------------

export interface LaboratoryCompleteOutput {
  readonly artifactId: string;
  readonly facadeOutput: LaboratoryFacadeOutput;
  readonly certificationOutput: LaboratoryCertificationOutput;
  readonly facadeStatus: LaboratoryFacadeStatus;
  readonly traceMetadata: LaboratoryFacadeTraceMetadata;
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_laboratory_facade';
  readonly randomUsed: false;
  readonly timeDependency: false;
}

/**
 * NV-1900-D7-OPT-09 — MLOps Lifecycle & Production Constraint Modeling Kernel
 *
 * Deterministic orchestration functions for MLOps lifecycle metadata.
 * Produces lifecycles, constraints, deployments, monitoring, traces, and registries.
 *
 * This module never:
 * - Deploys models
 * - Trains models
 * - Executes inference
 * - Monitors production
 * - Orchestrates pipelines
 * - Stores educational content
 * - Generates markdown
 * - Accesses filesystem
 * - Performs network requests
 * - Calls external APIs
 *
 * MLOps lifecycle metadata only.
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import type {
  MLOpsLifecycle,
  MLOpsProvenance,
  ProductionConstraint,
  DeploymentProfile,
  MonitoringRequirement,
  MLOpsDecision,
  MLOpsTraceDecision,
  MLOpsTrace,
  MLOpsRegistry,
  MLOpsRegistryMetadata,
  MLOpsInput,
  MLOpsLifecycleStage,
  ProductionConstraintType,
  DeploymentType,
  MonitoringType,
  ProductionReadinessLevel,
  MLOpsStatus,
  ApplicationGovernanceStatus,
  ApplicationNode,
  ApplicationArtifactWithMLOps,
  EngineeringJudgmentSeverity,
} from './ApplicationAgentContract.ts';

import {
  CANONICAL_MLOPS_LIFECYCLE_STAGES,
  CANONICAL_PRODUCTION_CONSTRAINT_TYPES,
  CANONICAL_DEPLOYMENT_TYPES,
  CANONICAL_MONITORING_TYPES,
  CANONICAL_PRODUCTION_READINESS_LEVELS,
  CANONICAL_MLOPS_STATUS,
  CANONICAL_APPLICATION_GOVERNANCE,
  CANONICAL_ENGINEERING_JUDGMENT_SEVERITY,
} from './ApplicationAgentContract.ts';

// ---------------------------------------------------------------------------
// MLOps Provenance Composition
// ---------------------------------------------------------------------------

export function composeMLOpsProvenance(params: {
  readonly providedBy: string;
  readonly rationale: string;
  readonly reviewedBy: string;
  readonly reviewDate: string;
  readonly governanceStatus: ApplicationGovernanceStatus;
}): MLOpsProvenance {
  return {
    providedBy: params.providedBy,
    rationale: params.rationale,
    reviewedBy: params.reviewedBy,
    reviewDate: params.reviewDate,
    governanceStatus: params.governanceStatus,
  };
}

// ---------------------------------------------------------------------------
// MLOps Lifecycle Composition
// ---------------------------------------------------------------------------

export function composeMLOpsLifecycle(params: {
  readonly lifecycleId: string;
  readonly title: string;
  readonly stage: MLOpsLifecycleStage;
  readonly applicationArtifactId: string;
  readonly knowledgeArtifactId: string;
  readonly architectureId: string;
  readonly status: MLOpsStatus;
  readonly provenance: MLOpsProvenance;
}): MLOpsLifecycle {
  return {
    lifecycleId: params.lifecycleId,
    title: params.title,
    stage: params.stage,
    applicationArtifactId: params.applicationArtifactId,
    knowledgeArtifactId: params.knowledgeArtifactId,
    architectureId: params.architectureId,
    status: params.status,
    provenance: params.provenance,
  };
}

// ---------------------------------------------------------------------------
// Production Constraint Composition
// ---------------------------------------------------------------------------

export function composeProductionConstraint(params: {
  readonly constraintId: string;
  readonly lifecycleId: string;
  readonly constraintType: ProductionConstraintType;
  readonly description: string;
  readonly severity: EngineeringJudgmentSeverity;
  readonly provenance: MLOpsProvenance;
}): ProductionConstraint {
  return {
    constraintId: params.constraintId,
    lifecycleId: params.lifecycleId,
    constraintType: params.constraintType,
    description: params.description,
    severity: params.severity,
    provenance: params.provenance,
  };
}

// ---------------------------------------------------------------------------
// Deployment Profile Composition
// ---------------------------------------------------------------------------

export function composeDeploymentProfile(params: {
  readonly deploymentId: string;
  readonly lifecycleId: string;
  readonly deploymentType: DeploymentType;
  readonly readinessLevel: ProductionReadinessLevel;
  readonly description: string;
  readonly provenance: MLOpsProvenance;
}): DeploymentProfile {
  return {
    deploymentId: params.deploymentId,
    lifecycleId: params.lifecycleId,
    deploymentType: params.deploymentType,
    readinessLevel: params.readinessLevel,
    description: params.description,
    provenance: params.provenance,
  };
}

// ---------------------------------------------------------------------------
// Monitoring Requirement Composition
// ---------------------------------------------------------------------------

export function composeMonitoringRequirement(params: {
  readonly monitoringId: string;
  readonly lifecycleId: string;
  readonly monitoringType: MonitoringType;
  readonly description: string;
  readonly provenance: MLOpsProvenance;
}): MonitoringRequirement {
  return {
    monitoringId: params.monitoringId,
    lifecycleId: params.lifecycleId,
    monitoringType: params.monitoringType,
    description: params.description,
    provenance: params.provenance,
  };
}

// ---------------------------------------------------------------------------
// MLOps Decision Composition
// ---------------------------------------------------------------------------

export function composeMLOpsDecision(params: {
  readonly decisionId: string;
  readonly lifecycleId: string;
  readonly description: string;
  readonly provenance: MLOpsProvenance;
}): MLOpsDecision {
  return {
    decisionId: params.decisionId,
    lifecycleId: params.lifecycleId,
    description: params.description,
    provenance: params.provenance,
  };
}

// ---------------------------------------------------------------------------
// MLOps Trace Decision Composition
// ---------------------------------------------------------------------------

function _composeMLOpsTraceDecision(
  lifecycleId: string,
  validationPassed: boolean,
  validationErrors: readonly string[],
): MLOpsTraceDecision {
  return {
    decisionId: `_decision_${lifecycleId}`,
    lifecycleId,
    validationPassed,
    validationErrors,
  };
}

// ---------------------------------------------------------------------------
// MLOps Trace Composition
// ---------------------------------------------------------------------------

export function composeMLOpsTrace(params: {
  readonly traceId: string;
  readonly decisions: readonly MLOpsTraceDecision[];
  readonly registryVersion: string;
  readonly compositionVersion: string;
}): MLOpsTrace {
  return {
    traceId: params.traceId,
    decisionCount: params.decisions.length,
    validationCount: params.decisions.filter((d) => d.validationPassed).length,
    registryVersion: params.registryVersion,
    compositionVersion: params.compositionVersion,
    decisions: params.decisions,
    deterministic: true,
    generatedFrom: 'deterministic_mlops_lifecycle_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Deterministic Sort Comparators
// ---------------------------------------------------------------------------

function _compareLifecycle(
  a: MLOpsLifecycle,
  b: MLOpsLifecycle,
): number {
  if (a.lifecycleId < b.lifecycleId) return -1;
  if (a.lifecycleId > b.lifecycleId) return 1;
  if (a.stage < b.stage) return -1;
  if (a.stage > b.stage) return 1;
  if (a.title < b.title) return -1;
  if (a.title > b.title) return 1;
  return 0;
}

function _compareConstraint(
  a: ProductionConstraint,
  b: ProductionConstraint,
): number {
  if (a.lifecycleId < b.lifecycleId) return -1;
  if (a.lifecycleId > b.lifecycleId) return 1;
  if (a.constraintType < b.constraintType) return -1;
  if (a.constraintType > b.constraintType) return 1;
  if (a.constraintId < b.constraintId) return -1;
  if (a.constraintId > b.constraintId) return 1;
  return 0;
}

function _compareDeployment(
  a: DeploymentProfile,
  b: DeploymentProfile,
): number {
  if (a.lifecycleId < b.lifecycleId) return -1;
  if (a.lifecycleId > b.lifecycleId) return 1;
  if (a.deploymentType < b.deploymentType) return -1;
  if (a.deploymentType > b.deploymentType) return 1;
  if (a.deploymentId < b.deploymentId) return -1;
  if (a.deploymentId > b.deploymentId) return 1;
  return 0;
}

function _compareMonitoring(
  a: MonitoringRequirement,
  b: MonitoringRequirement,
): number {
  if (a.lifecycleId < b.lifecycleId) return -1;
  if (a.lifecycleId > b.lifecycleId) return 1;
  if (a.monitoringType < b.monitoringType) return -1;
  if (a.monitoringType > b.monitoringType) return 1;
  if (a.monitoringId < b.monitoringId) return -1;
  if (a.monitoringId > b.monitoringId) return 1;
  return 0;
}

// ---------------------------------------------------------------------------
// MLOps Registry Composition
// ---------------------------------------------------------------------------

export function composeMLOpsRegistry(
  lifecycles: readonly MLOpsLifecycle[],
  constraints: readonly ProductionConstraint[],
  deployments: readonly DeploymentProfile[],
  monitoring: readonly MonitoringRequirement[],
): MLOpsRegistry {
  const sortedLifecycles = [...lifecycles].sort(_compareLifecycle);
  const sortedConstraints = [...constraints].sort(_compareConstraint);
  const sortedDeployments = [...deployments].sort(_compareDeployment);
  const sortedMonitoring = [...monitoring].sort(_compareMonitoring);

  const types = new Set(sortedLifecycles.map((l) => l.stage));

  const metadata: MLOpsRegistryMetadata = {
    registryId: `_registry_${sortedLifecycles.length}_${sortedConstraints.length}_${sortedDeployments.length}_${sortedMonitoring.length}`,
    lifecycleCount: sortedLifecycles.length,
    constraintCount: sortedConstraints.length,
    deploymentCount: sortedDeployments.length,
    monitoringCount: sortedMonitoring.length,
    typeCount: types.size,
  };

  return {
    registryId: metadata.registryId,
    lifecycles: sortedLifecycles,
    constraints: sortedConstraints,
    deployments: sortedDeployments,
    monitoring: sortedMonitoring,
    metadata,
    trace: {
      traceId: `_trace_${sortedLifecycles.length}`,
      decisionCount: 0,
      validationCount: 0,
      registryVersion: '1.0.0',
      compositionVersion: '1.0.0',
      decisions: [],
      deterministic: true,
      generatedFrom: 'deterministic_mlops_lifecycle_kernel',
      randomUsed: false,
      timeDependency: false,
    },
    deterministic: true,
    generatedFrom: 'deterministic_mlops_lifecycle_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// MLOps Registry From Input Composition
// ---------------------------------------------------------------------------

export function composeMLOpsRegistryFromInput(
  input: MLOpsInput,
): MLOpsRegistry {
  return composeMLOpsRegistry(
    input.lifecycles,
    input.constraints,
    input.deployments,
    input.monitoring,
  );
}

// ---------------------------------------------------------------------------
// MLOps Lifecycle Composition (Main Entry Point)
// ---------------------------------------------------------------------------

export function composeMLOpsLifecycleMetadata(
  input: MLOpsInput,
): MLOpsRegistry {
  const decisions = input.lifecycles.map((lifecycle) => {
    const errors = _validateLifecycleForDecision(lifecycle);
    return _composeMLOpsTraceDecision(lifecycle.lifecycleId, errors.length === 0, errors);
  });

  const registry = composeMLOpsRegistry(
    input.lifecycles,
    input.constraints,
    input.deployments,
    input.monitoring,
  );

  return {
    ...registry,
    trace: composeMLOpsTrace({
      traceId: `_trace_${input.lifecycles.length}`,
      decisions,
      registryVersion: '1.0.0',
      compositionVersion: '1.0.0',
    }),
  };
}

// ---------------------------------------------------------------------------
// Application Artifact with MLOps Composition
// ---------------------------------------------------------------------------

export function composeApplicationArtifactWithMLOps(params: {
  readonly applicationNode: ApplicationNode;
  readonly mlopsRegistry: MLOpsRegistry;
}): ApplicationArtifactWithMLOps {
  return {
    applicationNode: { ...params.applicationNode },
    mlopsRegistry: { ...params.mlopsRegistry },
    deterministic: true,
    generatedFrom: 'deterministic_mlops_lifecycle_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// MLOps Lifecycle Decision Validation
// ---------------------------------------------------------------------------

function _validateLifecycleForDecision(
  lifecycle: MLOpsLifecycle,
): readonly string[] {
  const errors: string[] = [];

  if (!lifecycle.lifecycleId || lifecycle.lifecycleId.trim() === '') {
    errors.push('MLOPS_MISSING_LIFECYCLE_ID');
  }

  if (!lifecycle.title || lifecycle.title.trim() === '') {
    errors.push('MLOPS_MISSING_TITLE');
  }

  if (!CANONICAL_MLOPS_LIFECYCLE_STAGES.includes(lifecycle.stage)) {
    errors.push('MLOPS_INVALID_STAGE');
  }

  if (!CANONICAL_MLOPS_STATUS.includes(lifecycle.status)) {
    errors.push('MLOPS_INVALID_STATUS');
  }

  if (!lifecycle.provenance) {
    errors.push('MLOPS_MISSING_PROVENANCE');
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Helper Functions — Type Guards
// ---------------------------------------------------------------------------

export function isSupportedLifecycleStage(
  stage: string,
): stage is MLOpsLifecycleStage {
  return CANONICAL_MLOPS_LIFECYCLE_STAGES.includes(stage as MLOpsLifecycleStage);
}

export function isSupportedProductionConstraint(
  constraintType: string,
): constraintType is ProductionConstraintType {
  return CANONICAL_PRODUCTION_CONSTRAINT_TYPES.includes(constraintType as ProductionConstraintType);
}

export function isSupportedDeploymentType(
  deploymentType: string,
): deploymentType is DeploymentType {
  return CANONICAL_DEPLOYMENT_TYPES.includes(deploymentType as DeploymentType);
}

export function isSupportedMonitoringType(
  monitoringType: string,
): monitoringType is MonitoringType {
  return CANONICAL_MONITORING_TYPES.includes(monitoringType as MonitoringType);
}

export function isSupportedProductionReadiness(
  readinessLevel: string,
): readinessLevel is ProductionReadinessLevel {
  return CANONICAL_PRODUCTION_READINESS_LEVELS.includes(readinessLevel as ProductionReadinessLevel);
}

export function isSupportedMLOpsStatus(
  status: string,
): status is MLOpsStatus {
  return CANONICAL_MLOPS_STATUS.includes(status as MLOpsStatus);
}

export function isSupportedMLOpsGovernance(
  governanceStatus: string,
): governanceStatus is ApplicationGovernanceStatus {
  return CANONICAL_APPLICATION_GOVERNANCE.includes(
    governanceStatus as ApplicationGovernanceStatus,
  );
}

// ---------------------------------------------------------------------------
// Helper Functions — Canonical Getters
// ---------------------------------------------------------------------------

export function getCanonicalLifecycleStages(): readonly MLOpsLifecycleStage[] {
  return CANONICAL_MLOPS_LIFECYCLE_STAGES;
}

export function getCanonicalProductionConstraintTypes(): readonly ProductionConstraintType[] {
  return CANONICAL_PRODUCTION_CONSTRAINT_TYPES;
}

export function getCanonicalDeploymentTypes(): readonly DeploymentType[] {
  return CANONICAL_DEPLOYMENT_TYPES;
}

export function getCanonicalMonitoringTypes(): readonly MonitoringType[] {
  return CANONICAL_MONITORING_TYPES;
}

export function getCanonicalProductionReadinessLevels(): readonly ProductionReadinessLevel[] {
  return CANONICAL_PRODUCTION_READINESS_LEVELS;
}

export function getCanonicalMLOpsStatuses(): readonly MLOpsStatus[] {
  return CANONICAL_MLOPS_STATUS;
}

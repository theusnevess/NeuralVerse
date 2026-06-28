/**
 * NV-1900-D7-OPT-09 — MLOps Lifecycle Validation Layer
 *
 * Deterministic validation for MLOps lifecycle metadata.
 * Returns structured errors, never exceptions for expected validation failures.
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import type {
  MLOpsLifecycle,
  ProductionConstraint,
  DeploymentProfile,
  MonitoringRequirement,
  MLOpsRegistry,
  MLOpsTrace,
  MLOpsInput,
  MLOpsValidationError,
  MLOpsRegistryValidationResult,
  MLOpsInputValidationResult,
  MLOpsTraceValidationResult,
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
// Validation Error Codes
// ---------------------------------------------------------------------------

export const MLOPS_VALIDATION_CODES = {
  MLOPS_DUPLICATE_ID: 'MLOPS_DUPLICATE_ID',
  MLOPS_DUPLICATE_TITLE: 'MLOPS_DUPLICATE_TITLE',
  CONSTRAINT_DUPLICATE_ID: 'CONSTRAINT_DUPLICATE_ID',
  DEPLOYMENT_DUPLICATE_ID: 'DEPLOYMENT_DUPLICATE_ID',
  MONITORING_DUPLICATE_ID: 'MONITORING_DUPLICATE_ID',
  MLOPS_INVALID_STAGE: 'MLOPS_INVALID_STAGE',
  MLOPS_INVALID_CONSTRAINT: 'MLOPS_INVALID_CONSTRAINT',
  MLOPS_INVALID_DEPLOYMENT: 'MLOPS_INVALID_DEPLOYMENT',
  MLOPS_INVALID_MONITORING: 'MLOPS_INVALID_MONITORING',
  MLOPS_INVALID_READINESS: 'MLOPS_INVALID_READINESS',
  MLOPS_INVALID_SEVERITY: 'MLOPS_INVALID_SEVERITY',
  MLOPS_INVALID_STATUS: 'MLOPS_INVALID_STATUS',
  MLOPS_INVALID_GOVERNANCE: 'MLOPS_INVALID_GOVERNANCE',
  MLOPS_MISSING_PROVENANCE: 'MLOPS_MISSING_PROVENANCE',
  MLOPS_MISSING_PROVIDER: 'MLOPS_MISSING_PROVIDER',
  MLOPS_MISSING_RATIONALE: 'MLOPS_MISSING_RATIONALE',
  MLOPS_MISSING_APPLICATION_REFERENCE: 'MLOPS_MISSING_APPLICATION_REFERENCE',
  MLOPS_MISSING_KNOWLEDGE_REFERENCE: 'MLOPS_MISSING_KNOWLEDGE_REFERENCE',
  MLOPS_MISSING_ARCHITECTURE_REFERENCE: 'MLOPS_MISSING_ARCHITECTURE_REFERENCE',
  MLOPS_MISSING_LIFECYCLE_ID: 'MLOPS_MISSING_LIFECYCLE_ID',
  MLOPS_MISSING_TITLE: 'MLOPS_MISSING_TITLE',
  MLOPS_EMPTY_REGISTRY: 'MLOPS_EMPTY_REGISTRY',
  MLOPS_INVALID_TRACE: 'MLOPS_INVALID_TRACE',
  MLOPS_REGISTRY_INCONSISTENCY: 'MLOPS_REGISTRY_INCONSISTENCY',
} as const;

// ---------------------------------------------------------------------------
// Single Lifecycle Validation
// ---------------------------------------------------------------------------

export function validateMLOpsLifecycle(
  lifecycle: MLOpsLifecycle,
): readonly MLOpsValidationError[] {
  const errors: MLOpsValidationError[] = [];

  if (!lifecycle.lifecycleId || lifecycle.lifecycleId.trim() === '') {
    errors.push({
      code: MLOPS_VALIDATION_CODES.MLOPS_MISSING_LIFECYCLE_ID,
      message: 'MLOps lifecycle is missing a lifecycle ID.',
      field: 'lifecycleId',
      lifecycleId: lifecycle.lifecycleId,
    });
  }

  if (!lifecycle.title || lifecycle.title.trim() === '') {
    errors.push({
      code: MLOPS_VALIDATION_CODES.MLOPS_MISSING_TITLE,
      message: 'MLOps lifecycle is missing a title.',
      field: 'title',
      lifecycleId: lifecycle.lifecycleId,
    });
  }

  if (!CANONICAL_MLOPS_LIFECYCLE_STAGES.includes(lifecycle.stage)) {
    errors.push({
      code: MLOPS_VALIDATION_CODES.MLOPS_INVALID_STAGE,
      message: `MLOps lifecycle has unsupported stage: "${lifecycle.stage}".`,
      field: 'stage',
      lifecycleId: lifecycle.lifecycleId,
    });
  }

  if (!CANONICAL_MLOPS_STATUS.includes(lifecycle.status)) {
    errors.push({
      code: MLOPS_VALIDATION_CODES.MLOPS_INVALID_STATUS,
      message: `MLOps lifecycle has unsupported status: "${lifecycle.status}".`,
      field: 'status',
      lifecycleId: lifecycle.lifecycleId,
    });
  }

  if (!lifecycle.applicationArtifactId || lifecycle.applicationArtifactId.trim() === '') {
    errors.push({
      code: MLOPS_VALIDATION_CODES.MLOPS_MISSING_APPLICATION_REFERENCE,
      message: 'MLOps lifecycle is missing applicationArtifactId.',
      field: 'applicationArtifactId',
      lifecycleId: lifecycle.lifecycleId,
    });
  }

  if (!lifecycle.knowledgeArtifactId || lifecycle.knowledgeArtifactId.trim() === '') {
    errors.push({
      code: MLOPS_VALIDATION_CODES.MLOPS_MISSING_KNOWLEDGE_REFERENCE,
      message: 'MLOps lifecycle is missing knowledgeArtifactId.',
      field: 'knowledgeArtifactId',
      lifecycleId: lifecycle.lifecycleId,
    });
  }

  if (!lifecycle.architectureId || lifecycle.architectureId.trim() === '') {
    errors.push({
      code: MLOPS_VALIDATION_CODES.MLOPS_MISSING_ARCHITECTURE_REFERENCE,
      message: 'MLOps lifecycle is missing architectureId.',
      field: 'architectureId',
      lifecycleId: lifecycle.lifecycleId,
    });
  }

  if (!lifecycle.provenance) {
    errors.push({
      code: MLOPS_VALIDATION_CODES.MLOPS_MISSING_PROVENANCE,
      message: 'MLOps lifecycle is missing provenance.',
      field: 'provenance',
      lifecycleId: lifecycle.lifecycleId,
    });
  } else {
    if (!lifecycle.provenance.providedBy || lifecycle.provenance.providedBy.trim() === '') {
      errors.push({
        code: MLOPS_VALIDATION_CODES.MLOPS_MISSING_PROVIDER,
        message: 'Lifecycle provenance is missing providedBy.',
        field: 'provenance.providedBy',
        lifecycleId: lifecycle.lifecycleId,
      });
    }

    if (!lifecycle.provenance.rationale || lifecycle.provenance.rationale.trim() === '') {
      errors.push({
        code: MLOPS_VALIDATION_CODES.MLOPS_MISSING_RATIONALE,
        message: 'Lifecycle provenance is missing rationale.',
        field: 'provenance.rationale',
        lifecycleId: lifecycle.lifecycleId,
      });
    }

    if (!CANONICAL_APPLICATION_GOVERNANCE.includes(lifecycle.provenance.governanceStatus)) {
      errors.push({
        code: MLOPS_VALIDATION_CODES.MLOPS_INVALID_GOVERNANCE,
        message: `Lifecycle provenance has invalid governance status: "${lifecycle.provenance.governanceStatus}".`,
        field: 'provenance.governanceStatus',
        lifecycleId: lifecycle.lifecycleId,
      });
    }
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Production Constraint Validation
// ---------------------------------------------------------------------------

export function validateProductionConstraint(
  constraint: ProductionConstraint,
): readonly MLOpsValidationError[] {
  const errors: MLOpsValidationError[] = [];

  if (!constraint.constraintId || constraint.constraintId.trim() === '') {
    errors.push({
      code: MLOPS_VALIDATION_CODES.CONSTRAINT_DUPLICATE_ID,
      message: 'Production constraint is missing a constraint ID.',
      field: 'constraintId',
      constraintId: constraint.constraintId,
    });
  }

  if (!CANONICAL_PRODUCTION_CONSTRAINT_TYPES.includes(constraint.constraintType)) {
    errors.push({
      code: MLOPS_VALIDATION_CODES.MLOPS_INVALID_CONSTRAINT,
      message: `Production constraint has unsupported type: "${constraint.constraintType}".`,
      field: 'constraintType',
      constraintId: constraint.constraintId,
    });
  }

  if (!CANONICAL_ENGINEERING_JUDGMENT_SEVERITY.includes(constraint.severity)) {
    errors.push({
      code: MLOPS_VALIDATION_CODES.MLOPS_INVALID_SEVERITY,
      message: `Production constraint has unsupported severity: "${constraint.severity}".`,
      field: 'severity',
      constraintId: constraint.constraintId,
    });
  }

  if (!constraint.provenance) {
    errors.push({
      code: MLOPS_VALIDATION_CODES.MLOPS_MISSING_PROVENANCE,
      message: 'Production constraint is missing provenance.',
      field: 'provenance',
      constraintId: constraint.constraintId,
    });
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Deployment Profile Validation
// ---------------------------------------------------------------------------

export function validateDeploymentProfile(
  deployment: DeploymentProfile,
): readonly MLOpsValidationError[] {
  const errors: MLOpsValidationError[] = [];

  if (!deployment.deploymentId || deployment.deploymentId.trim() === '') {
    errors.push({
      code: MLOPS_VALIDATION_CODES.DEPLOYMENT_DUPLICATE_ID,
      message: 'Deployment profile is missing a deployment ID.',
      field: 'deploymentId',
      deploymentId: deployment.deploymentId,
    });
  }

  if (!CANONICAL_DEPLOYMENT_TYPES.includes(deployment.deploymentType)) {
    errors.push({
      code: MLOPS_VALIDATION_CODES.MLOPS_INVALID_DEPLOYMENT,
      message: `Deployment profile has unsupported type: "${deployment.deploymentType}".`,
      field: 'deploymentType',
      deploymentId: deployment.deploymentId,
    });
  }

  if (!CANONICAL_PRODUCTION_READINESS_LEVELS.includes(deployment.readinessLevel)) {
    errors.push({
      code: MLOPS_VALIDATION_CODES.MLOPS_INVALID_READINESS,
      message: `Deployment profile has unsupported readiness level: "${deployment.readinessLevel}".`,
      field: 'readinessLevel',
      deploymentId: deployment.deploymentId,
    });
  }

  if (!deployment.provenance) {
    errors.push({
      code: MLOPS_VALIDATION_CODES.MLOPS_MISSING_PROVENANCE,
      message: 'Deployment profile is missing provenance.',
      field: 'provenance',
      deploymentId: deployment.deploymentId,
    });
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Monitoring Requirement Validation
// ---------------------------------------------------------------------------

export function validateMonitoringRequirement(
  monitoring: MonitoringRequirement,
): readonly MLOpsValidationError[] {
  const errors: MLOpsValidationError[] = [];

  if (!monitoring.monitoringId || monitoring.monitoringId.trim() === '') {
    errors.push({
      code: MLOPS_VALIDATION_CODES.MONITORING_DUPLICATE_ID,
      message: 'Monitoring requirement is missing a monitoring ID.',
      field: 'monitoringId',
      monitoringId: monitoring.monitoringId,
    });
  }

  if (!CANONICAL_MONITORING_TYPES.includes(monitoring.monitoringType)) {
    errors.push({
      code: MLOPS_VALIDATION_CODES.MLOPS_INVALID_MONITORING,
      message: `Monitoring requirement has unsupported type: "${monitoring.monitoringType}".`,
      field: 'monitoringType',
      monitoringId: monitoring.monitoringId,
    });
  }

  if (!monitoring.provenance) {
    errors.push({
      code: MLOPS_VALIDATION_CODES.MLOPS_MISSING_PROVENANCE,
      message: 'Monitoring requirement is missing provenance.',
      field: 'provenance',
      monitoringId: monitoring.monitoringId,
    });
  }

  return errors;
}

// ---------------------------------------------------------------------------
// MLOps Registry Validation
// ---------------------------------------------------------------------------

export function validateMLOpsRegistry(
  registry: MLOpsRegistry,
): MLOpsRegistryValidationResult {
  const errors: MLOpsValidationError[] = [];

  if (!registry.registryId || registry.registryId.trim() === '') {
    errors.push({
      code: MLOPS_VALIDATION_CODES.MLOPS_EMPTY_REGISTRY,
      message: 'Registry is missing a registry ID.',
      field: 'registryId',
    });
  }

  if (!registry.lifecycles || registry.lifecycles.length === 0) {
    errors.push({
      code: MLOPS_VALIDATION_CODES.MLOPS_EMPTY_REGISTRY,
      message: 'Registry has no lifecycles.',
      field: 'lifecycles',
    });
  }

  if (registry.deterministic !== true) {
    errors.push({
      code: MLOPS_VALIDATION_CODES.MLOPS_INVALID_TRACE,
      message: 'Registry must declare deterministic: true.',
      field: 'deterministic',
    });
  }

  if (registry.randomUsed !== false) {
    errors.push({
      code: MLOPS_VALIDATION_CODES.MLOPS_INVALID_TRACE,
      message: 'Registry must declare randomUsed: false.',
      field: 'randomUsed',
    });
  }

  if (registry.timeDependency !== false) {
    errors.push({
      code: MLOPS_VALIDATION_CODES.MLOPS_INVALID_TRACE,
      message: 'Registry must declare timeDependency: false.',
      field: 'timeDependency',
    });
  }

  // Duplicate lifecycle IDs
  const seenLifecycleIds = new Set<string>();
  for (const l of registry.lifecycles) {
    if (seenLifecycleIds.has(l.lifecycleId)) {
      errors.push({
        code: MLOPS_VALIDATION_CODES.MLOPS_DUPLICATE_ID,
        message: `Duplicate lifecycle ID: "${l.lifecycleId}".`,
        lifecycleId: l.lifecycleId,
      });
    }
    seenLifecycleIds.add(l.lifecycleId);
  }

  // Duplicate lifecycle titles
  const seenLifecycleTitles = new Set<string>();
  for (const l of registry.lifecycles) {
    if (seenLifecycleTitles.has(l.title)) {
      errors.push({
        code: MLOPS_VALIDATION_CODES.MLOPS_DUPLICATE_TITLE,
        message: `Duplicate lifecycle title: "${l.title}".`,
        field: 'title',
        lifecycleId: l.lifecycleId,
      });
    }
    seenLifecycleTitles.add(l.title);
  }

  // Duplicate constraint IDs
  const seenConstraintIds = new Set<string>();
  for (const c of registry.constraints) {
    if (seenConstraintIds.has(c.constraintId)) {
      errors.push({
        code: MLOPS_VALIDATION_CODES.CONSTRAINT_DUPLICATE_ID,
        message: `Duplicate constraint ID: "${c.constraintId}".`,
        constraintId: c.constraintId,
      });
    }
    seenConstraintIds.add(c.constraintId);
  }

  // Duplicate deployment IDs
  const seenDeploymentIds = new Set<string>();
  for (const d of registry.deployments) {
    if (seenDeploymentIds.has(d.deploymentId)) {
      errors.push({
        code: MLOPS_VALIDATION_CODES.DEPLOYMENT_DUPLICATE_ID,
        message: `Duplicate deployment ID: "${d.deploymentId}".`,
        deploymentId: d.deploymentId,
      });
    }
    seenDeploymentIds.add(d.deploymentId);
  }

  // Duplicate monitoring IDs
  const seenMonitoringIds = new Set<string>();
  for (const m of registry.monitoring) {
    if (seenMonitoringIds.has(m.monitoringId)) {
      errors.push({
        code: MLOPS_VALIDATION_CODES.MONITORING_DUPLICATE_ID,
        message: `Duplicate monitoring ID: "${m.monitoringId}".`,
        monitoringId: m.monitoringId,
      });
    }
    seenMonitoringIds.add(m.monitoringId);
  }

  // Validate each lifecycle
  for (const l of registry.lifecycles) {
    errors.push(...validateMLOpsLifecycle(l));
  }

  // Validate each constraint
  for (const c of registry.constraints) {
    errors.push(...validateProductionConstraint(c));
  }

  // Validate each deployment
  for (const d of registry.deployments) {
    errors.push(...validateDeploymentProfile(d));
  }

  // Validate each monitoring requirement
  for (const m of registry.monitoring) {
    errors.push(...validateMonitoringRequirement(m));
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'mlops_registry_composition',
  };
}

// ---------------------------------------------------------------------------
// MLOps Input Validation
// ---------------------------------------------------------------------------

export function validateMLOpsInput(
  input: MLOpsInput,
): MLOpsInputValidationResult {
  const errors: MLOpsValidationError[] = [];

  if (!input.lifecycles || input.lifecycles.length === 0) {
    errors.push({
      code: MLOPS_VALIDATION_CODES.MLOPS_EMPTY_REGISTRY,
      message: 'Input has no lifecycles.',
      field: 'lifecycles',
    });
  } else {
    for (const l of input.lifecycles) {
      errors.push(...validateMLOpsLifecycle(l));
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'mlops_input_composition',
  };
}

// ---------------------------------------------------------------------------
// MLOps Trace Validation
// ---------------------------------------------------------------------------

export function validateMLOpsTrace(
  trace: MLOpsTrace,
): MLOpsTraceValidationResult {
  const errors: MLOpsValidationError[] = [];

  if (!trace.traceId || trace.traceId.trim() === '') {
    errors.push({
      code: MLOPS_VALIDATION_CODES.MLOPS_INVALID_TRACE,
      message: 'MLOps trace is missing a trace ID.',
      field: 'traceId',
    });
  }

  if (trace.deterministic !== true) {
    errors.push({
      code: MLOPS_VALIDATION_CODES.MLOPS_INVALID_TRACE,
      message: 'MLOps trace must declare deterministic: true.',
      field: 'deterministic',
    });
  }

  if (trace.randomUsed !== false) {
    errors.push({
      code: MLOPS_VALIDATION_CODES.MLOPS_INVALID_TRACE,
      message: 'MLOps trace must declare randomUsed: false.',
      field: 'randomUsed',
    });
  }

  if (trace.timeDependency !== false) {
    errors.push({
      code: MLOPS_VALIDATION_CODES.MLOPS_INVALID_TRACE,
      message: 'MLOps trace must declare timeDependency: false.',
      field: 'timeDependency',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'mlops_trace_composition',
  };
}

// ---------------------------------------------------------------------------
// Application Artifact with MLOps Validation
// ---------------------------------------------------------------------------

export function validateApplicationArtifactWithMLOps(
  registry: MLOpsRegistry,
): readonly MLOpsValidationError[] {
  const errors: MLOpsValidationError[] = [];
  const registryResult = validateMLOpsRegistry(registry);
  errors.push(...registryResult.errors);
  return errors;
}

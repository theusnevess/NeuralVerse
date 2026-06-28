/**
 * NV-1900-D7-OPT-01 — Application Registry & Canonical Node Kernel
 *
 * Deterministic orchestration functions for application metadata.
 * Produces application nodes, traces, and registries.
 *
 * This module never:
 * - Generates application content
 * - Infers application reasoning
 * - Stores educational content
 * - Generates markdown
 * - Accesses filesystem
 * - Performs network requests
 * - Calls external APIs
 *
 * Application metadata only.
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import type {
  ApplicationNode,
  ApplicationProvenance,
  ApplicationDecision,
  ApplicationTrace,
  ApplicationRegistry,
  ApplicationRegistryMetadata,
  ApplicationInput,
  ApplicationArtifactType,
  ApplicationDomain,
  ApplicationStatus,
  ApplicationGovernanceStatus,
} from './ApplicationAgentContract.ts';

import {
  CANONICAL_APPLICATION_ARTIFACT_TYPES,
  CANONICAL_APPLICATION_DOMAINS,
  CANONICAL_APPLICATION_STATUS,
  CANONICAL_APPLICATION_GOVERNANCE,
} from './ApplicationAgentContract.ts';

// ---------------------------------------------------------------------------
// Application Provenance Composition
// ---------------------------------------------------------------------------

/**
 * Composes application provenance from provided parameters.
 * Pure function. No side effects.
 */
export function composeApplicationProvenance(params: {
  readonly providedBy: string;
  readonly rationale: string;
  readonly reviewedBy: string;
  readonly reviewDate: string;
  readonly governanceStatus: ApplicationGovernanceStatus;
}): ApplicationProvenance {
  return {
    providedBy: params.providedBy,
    rationale: params.rationale,
    reviewedBy: params.reviewedBy,
    reviewDate: params.reviewDate,
    governanceStatus: params.governanceStatus,
  };
}

// ---------------------------------------------------------------------------
// Application Decision Composition
// ---------------------------------------------------------------------------

/**
 * Composes an application decision from validation results.
 * Pure function. No side effects.
 */
function _composeApplicationDecision(
  applicationId: string,
  validationPassed: boolean,
  validationErrors: readonly string[],
): ApplicationDecision {
  return {
    decisionId: `_decision_${applicationId}`,
    applicationId,
    validationPassed,
    validationErrors,
  };
}

// ---------------------------------------------------------------------------
// Application Trace Composition
// ---------------------------------------------------------------------------

/**
 * Composes an application trace from decisions and metadata.
 * Pure function. No side effects.
 */
export function composeApplicationTrace(params: {
  readonly traceId: string;
  readonly decisions: readonly ApplicationDecision[];
  readonly registryVersion: string;
  readonly compositionVersion: string;
}): ApplicationTrace {
  return {
    traceId: params.traceId,
    decisionCount: params.decisions.length,
    validationCount: params.decisions.filter((d) => d.validationPassed).length,
    registryVersion: params.registryVersion,
    compositionVersion: params.compositionVersion,
    decisions: params.decisions,
    deterministic: true,
    generatedFrom: 'deterministic_application_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Application Node Composition
// ---------------------------------------------------------------------------

/**
 * Composes an application node from provided parameters.
 * Pure function. No side effects.
 */
export function composeApplicationNode(params: {
  readonly applicationId: string;
  readonly title: string;
  readonly artifactType: ApplicationArtifactType;
  readonly domain: ApplicationDomain;
  readonly status: ApplicationStatus;
  readonly description: string;
  readonly provenance: ApplicationProvenance;
  readonly trace: ApplicationTrace;
}): ApplicationNode {
  return {
    applicationId: params.applicationId,
    title: params.title,
    artifactType: params.artifactType,
    domain: params.domain,
    status: params.status,
    description: params.description,
    provenance: params.provenance,
    trace: params.trace,
  };
}

// ---------------------------------------------------------------------------
// Deterministic Sort Comparator
// ---------------------------------------------------------------------------

/**
 * Deterministic comparator for application nodes.
 * Sorts by applicationId, then artifactType, then title.
 * Pure function. No side effects.
 */
function _compareApplicationNode(
  a: ApplicationNode,
  b: ApplicationNode,
): number {
  if (a.applicationId < b.applicationId) return -1;
  if (a.applicationId > b.applicationId) return 1;

  if (a.artifactType < b.artifactType) return -1;
  if (a.artifactType > b.artifactType) return 1;

  if (a.title < b.title) return -1;
  if (a.title > b.title) return 1;

  return 0;
}

// ---------------------------------------------------------------------------
// Application Registry Composition
// ---------------------------------------------------------------------------

/**
 * Composes an application registry from nodes.
 * Pure function. No side effects.
 * Deterministic ordering: applicationId → artifactType → title.
 */
export function composeApplicationRegistry(
  nodes: readonly ApplicationNode[],
): ApplicationRegistry {
  const sortedNodes = [...nodes].sort(_compareApplicationNode);

  const domains = new Set(sortedNodes.map((n) => n.domain));
  const types = new Set(sortedNodes.map((n) => n.artifactType));

  const metadata: ApplicationRegistryMetadata = {
    registryId: `_registry_${sortedNodes.length}`,
    nodeCount: sortedNodes.length,
    domainCount: domains.size,
    typeCount: types.size,
  };

  return {
    registryId: metadata.registryId,
    nodes: sortedNodes,
    metadata,
    trace: {
      traceId: `_trace_${sortedNodes.length}`,
      decisionCount: 0,
      validationCount: 0,
      registryVersion: '1.0.0',
      compositionVersion: '1.0.0',
      decisions: [],
      deterministic: true,
      generatedFrom: 'deterministic_application_kernel',
      randomUsed: false,
      timeDependency: false,
    },
    deterministic: true,
    generatedFrom: 'deterministic_application_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Application Registry From Input Composition
// ---------------------------------------------------------------------------

/**
 * Composes an application registry from an input.
 * Pure function. No side effects.
 */
export function composeApplicationRegistryFromInput(
  input: ApplicationInput,
): ApplicationRegistry {
  return composeApplicationRegistry(input.nodes);
}

// ---------------------------------------------------------------------------
// Application Composition (Main Entry Point)
// ---------------------------------------------------------------------------

/**
 * Composes a complete application registry from an input.
 * Pure function. No side effects.
 */
export function composeApplication(
  input: ApplicationInput,
): ApplicationRegistry {
  const decisions = input.nodes.map((node) => {
    const errors = _validateApplicationForDecision(node);
    return _composeApplicationDecision(node.applicationId, errors.length === 0, errors);
  });

  const registry = composeApplicationRegistry(input.nodes);

  return {
    ...registry,
    trace: composeApplicationTrace({
      traceId: `_trace_${input.nodes.length}`,
      decisions,
      registryVersion: '1.0.0',
      compositionVersion: '1.0.0',
    }),
  };
}

/**
 * Validates an application node for decision composition.
 * Pure function. No side effects.
 */
function _validateApplicationForDecision(
  node: ApplicationNode,
): readonly string[] {
  const errors: string[] = [];

  if (!node.applicationId || node.applicationId.trim() === '') {
    errors.push('APPLICATION_MISSING_APPLICATION_ID');
  }

  if (!node.title || node.title.trim() === '') {
    errors.push('APPLICATION_MISSING_TITLE');
  }

  if (!CANONICAL_APPLICATION_ARTIFACT_TYPES.includes(node.artifactType)) {
    errors.push('APPLICATION_INVALID_ARTIFACT_TYPE');
  }

  if (!CANONICAL_APPLICATION_DOMAINS.includes(node.domain)) {
    errors.push('APPLICATION_INVALID_DOMAIN');
  }

  if (!CANONICAL_APPLICATION_STATUS.includes(node.status)) {
    errors.push('APPLICATION_INVALID_STATUS');
  }

  if (!node.provenance) {
    errors.push('APPLICATION_MISSING_PROVENANCE');
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Helper Functions — Type Guards
// ---------------------------------------------------------------------------

/**
 * Checks if a string is a supported application artifact type.
 */
export function isSupportedApplicationArtifactType(
  artifactType: string,
): artifactType is ApplicationArtifactType {
  return CANONICAL_APPLICATION_ARTIFACT_TYPES.includes(artifactType as ApplicationArtifactType);
}

/**
 * Checks if a string is a supported application domain.
 */
export function isSupportedApplicationDomain(
  domain: string,
): domain is ApplicationDomain {
  return CANONICAL_APPLICATION_DOMAINS.includes(domain as ApplicationDomain);
}

/**
 * Checks if a string is a supported application status.
 */
export function isSupportedApplicationStatus(
  status: string,
): status is ApplicationStatus {
  return CANONICAL_APPLICATION_STATUS.includes(status as ApplicationStatus);
}

/**
 * Checks if a string is a supported application governance status.
 */
export function isSupportedApplicationGovernance(
  governanceStatus: string,
): governanceStatus is ApplicationGovernanceStatus {
  return CANONICAL_APPLICATION_GOVERNANCE.includes(
    governanceStatus as ApplicationGovernanceStatus,
  );
}

// ---------------------------------------------------------------------------
// Helper Functions — Canonical Getters
// ---------------------------------------------------------------------------

/**
 * Returns the canonical application artifact types.
 */
export function getCanonicalApplicationArtifactTypes(): readonly ApplicationArtifactType[] {
  return CANONICAL_APPLICATION_ARTIFACT_TYPES;
}

/**
 * Returns the canonical application domains.
 */
export function getCanonicalApplicationDomains(): readonly ApplicationDomain[] {
  return CANONICAL_APPLICATION_DOMAINS;
}

/**
 * Returns the canonical application statuses.
 */
export function getCanonicalApplicationStatuses(): readonly ApplicationStatus[] {
  return CANONICAL_APPLICATION_STATUS;
}

/**
 * Returns the canonical application governance statuses.
 */
export function getCanonicalApplicationGovernance(): readonly ApplicationGovernanceStatus[] {
  return CANONICAL_APPLICATION_GOVERNANCE;
}

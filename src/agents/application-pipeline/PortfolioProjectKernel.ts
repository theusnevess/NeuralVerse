/**
 * NV-1900-D7-OPT-11 — Portfolio-Oriented Project Mapping Kernel
 *
 * Deterministic orchestration functions for portfolio project metadata.
 * Produces projects, deliverables, competencies, showcases, traces, and registries.
 *
 * This module never:
 * - Generates projects
 * - Creates repositories
 * - Evaluates portfolios
 * - Recommends career paths
 * - Stores educational content
 * - Generates markdown
 * - Accesses filesystem
 * - Performs network requests
 * - Calls external APIs
 *
 * Portfolio project metadata only.
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import type {
  PortfolioProject,
  PortfolioProjectProvenance,
  ProjectDeliverable,
  CompetencyEvidence,
  PortfolioShowcase,
  PortfolioProjectDecision,
  PortfolioProjectTraceDecision,
  PortfolioProjectTrace,
  PortfolioProjectRegistry,
  PortfolioProjectRegistryMetadata,
  PortfolioProjectInput,
  PortfolioProjectType,
  ProjectDeliverableType,
  ProjectCompetencyType,
  ProjectComplexityLevel,
  PortfolioShowcaseType,
  PortfolioStatus,
  ApplicationGovernanceStatus,
  ApplicationNode,
  ApplicationArtifactWithPortfolioProjects,
} from './ApplicationAgentContract.ts';

import {
  CANONICAL_PORTFOLIO_PROJECT_TYPES,
  CANONICAL_PROJECT_DELIVERABLE_TYPES,
  CANONICAL_PROJECT_COMPETENCY_TYPES,
  CANONICAL_PROJECT_COMPLEXITY_LEVELS,
  CANONICAL_PORTFOLIO_SHOWCASE_TYPES,
  CANONICAL_PORTFOLIO_STATUS,
  CANONICAL_APPLICATION_GOVERNANCE,
} from './ApplicationAgentContract.ts';

// ---------------------------------------------------------------------------
// Portfolio Project Provenance Composition
// ---------------------------------------------------------------------------

export function composePortfolioProjectProvenance(params: {
  readonly providedBy: string;
  readonly rationale: string;
  readonly reviewedBy: string;
  readonly reviewDate: string;
  readonly governanceStatus: ApplicationGovernanceStatus;
}): PortfolioProjectProvenance {
  return {
    providedBy: params.providedBy,
    rationale: params.rationale,
    reviewedBy: params.reviewedBy,
    reviewDate: params.reviewDate,
    governanceStatus: params.governanceStatus,
  };
}

// ---------------------------------------------------------------------------
// Portfolio Project Composition
// ---------------------------------------------------------------------------

export function composePortfolioProject(params: {
  readonly projectId: string;
  readonly title: string;
  readonly description: string;
  readonly projectType: PortfolioProjectType;
  readonly complexityLevel: ProjectComplexityLevel;
  readonly applicationArtifactId: string;
  readonly knowledgeArtifactId: string;
  readonly status: PortfolioStatus;
  readonly provenance: PortfolioProjectProvenance;
}): PortfolioProject {
  return {
    projectId: params.projectId,
    title: params.title,
    description: params.description,
    projectType: params.projectType,
    complexityLevel: params.complexityLevel,
    applicationArtifactId: params.applicationArtifactId,
    knowledgeArtifactId: params.knowledgeArtifactId,
    status: params.status,
    provenance: params.provenance,
  };
}

// ---------------------------------------------------------------------------
// Project Deliverable Composition
// ---------------------------------------------------------------------------

export function composeProjectDeliverable(params: {
  readonly deliverableId: string;
  readonly projectId: string;
  readonly deliverableType: ProjectDeliverableType;
  readonly description: string;
  readonly provenance: PortfolioProjectProvenance;
}): ProjectDeliverable {
  return {
    deliverableId: params.deliverableId,
    projectId: params.projectId,
    deliverableType: params.deliverableType,
    description: params.description,
    provenance: params.provenance,
  };
}

// ---------------------------------------------------------------------------
// Competency Evidence Composition
// ---------------------------------------------------------------------------

export function composeCompetencyEvidence(params: {
  readonly competencyId: string;
  readonly projectId: string;
  readonly competencyType: ProjectCompetencyType;
  readonly description: string;
  readonly provenance: PortfolioProjectProvenance;
}): CompetencyEvidence {
  return {
    competencyId: params.competencyId,
    projectId: params.projectId,
    competencyType: params.competencyType,
    description: params.description,
    provenance: params.provenance,
  };
}

// ---------------------------------------------------------------------------
// Portfolio Showcase Composition
// ---------------------------------------------------------------------------

export function composePortfolioShowcase(params: {
  readonly showcaseId: string;
  readonly projectId: string;
  readonly showcaseType: PortfolioShowcaseType;
  readonly description: string;
  readonly provenance: PortfolioProjectProvenance;
}): PortfolioShowcase {
  return {
    showcaseId: params.showcaseId,
    projectId: params.projectId,
    showcaseType: params.showcaseType,
    description: params.description,
    provenance: params.provenance,
  };
}

// ---------------------------------------------------------------------------
// Portfolio Project Decision Composition
// ---------------------------------------------------------------------------

export function composePortfolioProjectDecision(params: {
  readonly decisionId: string;
  readonly projectId: string;
  readonly description: string;
  readonly provenance: PortfolioProjectProvenance;
}): PortfolioProjectDecision {
  return {
    decisionId: params.decisionId,
    projectId: params.projectId,
    description: params.description,
    provenance: params.provenance,
  };
}

// ---------------------------------------------------------------------------
// Portfolio Project Trace Decision Composition
// ---------------------------------------------------------------------------

function _composePortfolioProjectTraceDecision(
  projectId: string,
  validationPassed: boolean,
  validationErrors: readonly string[],
): PortfolioProjectTraceDecision {
  return {
    decisionId: `_decision_${projectId}`,
    projectId,
    validationPassed,
    validationErrors,
  };
}

// ---------------------------------------------------------------------------
// Portfolio Project Trace Composition
// ---------------------------------------------------------------------------

export function composePortfolioProjectTrace(params: {
  readonly traceId: string;
  readonly decisions: readonly PortfolioProjectTraceDecision[];
  readonly registryVersion: string;
  readonly compositionVersion: string;
}): PortfolioProjectTrace {
  return {
    traceId: params.traceId,
    decisionCount: params.decisions.length,
    validationCount: params.decisions.filter((d) => d.validationPassed).length,
    registryVersion: params.registryVersion,
    compositionVersion: params.compositionVersion,
    decisions: params.decisions,
    deterministic: true,
    generatedFrom: 'deterministic_portfolio_project_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Deterministic Sort Comparators
// ---------------------------------------------------------------------------

function _compareProject(
  a: PortfolioProject,
  b: PortfolioProject,
): number {
  if (a.projectId < b.projectId) return -1;
  if (a.projectId > b.projectId) return 1;
  if (a.projectType < b.projectType) return -1;
  if (a.projectType > b.projectType) return 1;
  if (a.title < b.title) return -1;
  if (a.title > b.title) return 1;
  return 0;
}

function _compareDeliverable(
  a: ProjectDeliverable,
  b: ProjectDeliverable,
): number {
  if (a.projectId < b.projectId) return -1;
  if (a.projectId > b.projectId) return 1;
  if (a.deliverableType < b.deliverableType) return -1;
  if (a.deliverableType > b.deliverableType) return 1;
  if (a.deliverableId < b.deliverableId) return -1;
  if (a.deliverableId > b.deliverableId) return 1;
  return 0;
}

function _compareCompetency(
  a: CompetencyEvidence,
  b: CompetencyEvidence,
): number {
  if (a.projectId < b.projectId) return -1;
  if (a.projectId > b.projectId) return 1;
  if (a.competencyType < b.competencyType) return -1;
  if (a.competencyType > b.competencyType) return 1;
  if (a.competencyId < b.competencyId) return -1;
  if (a.competencyId > b.competencyId) return 1;
  return 0;
}

function _compareShowcase(
  a: PortfolioShowcase,
  b: PortfolioShowcase,
): number {
  if (a.projectId < b.projectId) return -1;
  if (a.projectId > b.projectId) return 1;
  if (a.showcaseType < b.showcaseType) return -1;
  if (a.showcaseType > b.showcaseType) return 1;
  if (a.showcaseId < b.showcaseId) return -1;
  if (a.showcaseId > b.showcaseId) return 1;
  return 0;
}

// ---------------------------------------------------------------------------
// Portfolio Project Registry Composition
// ---------------------------------------------------------------------------

export function composePortfolioProjectRegistry(
  projects: readonly PortfolioProject[],
  deliverables: readonly ProjectDeliverable[],
  competencies: readonly CompetencyEvidence[],
  showcases: readonly PortfolioShowcase[],
): PortfolioProjectRegistry {
  const sortedProjects = [...projects].sort(_compareProject);
  const sortedDeliverables = [...deliverables].sort(_compareDeliverable);
  const sortedCompetencies = [...competencies].sort(_compareCompetency);
  const sortedShowcases = [...showcases].sort(_compareShowcase);

  const types = new Set(sortedProjects.map((p) => p.projectType));

  const metadata: PortfolioProjectRegistryMetadata = {
    registryId: `_registry_${sortedProjects.length}_${sortedDeliverables.length}_${sortedCompetencies.length}_${sortedShowcases.length}`,
    projectCount: sortedProjects.length,
    deliverableCount: sortedDeliverables.length,
    competencyCount: sortedCompetencies.length,
    showcaseCount: sortedShowcases.length,
    typeCount: types.size,
  };

  return {
    registryId: metadata.registryId,
    projects: sortedProjects,
    deliverables: sortedDeliverables,
    competencies: sortedCompetencies,
    showcases: sortedShowcases,
    metadata,
    trace: {
      traceId: `_trace_${sortedProjects.length}`,
      decisionCount: 0,
      validationCount: 0,
      registryVersion: '1.0.0',
      compositionVersion: '1.0.0',
      decisions: [],
      deterministic: true,
      generatedFrom: 'deterministic_portfolio_project_kernel',
      randomUsed: false,
      timeDependency: false,
    },
    deterministic: true,
    generatedFrom: 'deterministic_portfolio_project_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Portfolio Project Registry From Input Composition
// ---------------------------------------------------------------------------

export function composePortfolioProjectRegistryFromInput(
  input: PortfolioProjectInput,
): PortfolioProjectRegistry {
  return composePortfolioProjectRegistry(
    input.projects,
    input.deliverables,
    input.competencies,
    input.showcases,
  );
}

// ---------------------------------------------------------------------------
// Portfolio Project Composition (Main Entry Point)
// ---------------------------------------------------------------------------

export function composePortfolioProjects(
  input: PortfolioProjectInput,
): PortfolioProjectRegistry {
  const decisions = input.projects.map((project) => {
    const errors = _validateProjectForDecision(project);
    return _composePortfolioProjectTraceDecision(project.projectId, errors.length === 0, errors);
  });

  const registry = composePortfolioProjectRegistry(
    input.projects,
    input.deliverables,
    input.competencies,
    input.showcases,
  );

  return {
    ...registry,
    trace: composePortfolioProjectTrace({
      traceId: `_trace_${input.projects.length}`,
      decisions,
      registryVersion: '1.0.0',
      compositionVersion: '1.0.0',
    }),
  };
}

// ---------------------------------------------------------------------------
// Application Artifact with Portfolio Projects Composition
// ---------------------------------------------------------------------------

export function composeApplicationArtifactWithPortfolioProjects(params: {
  readonly applicationNode: ApplicationNode;
  readonly portfolioProjectRegistry: PortfolioProjectRegistry;
}): ApplicationArtifactWithPortfolioProjects {
  return {
    applicationNode: { ...params.applicationNode },
    portfolioProjectRegistry: { ...params.portfolioProjectRegistry },
    deterministic: true,
    generatedFrom: 'deterministic_portfolio_project_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Portfolio Project Decision Validation
// ---------------------------------------------------------------------------

function _validateProjectForDecision(
  project: PortfolioProject,
): readonly string[] {
  const errors: string[] = [];

  if (!project.projectId || project.projectId.trim() === '') {
    errors.push('PORTFOLIO_MISSING_PROJECT_ID');
  }

  if (!project.title || project.title.trim() === '') {
    errors.push('PORTFOLIO_MISSING_TITLE');
  }

  if (!CANONICAL_PORTFOLIO_PROJECT_TYPES.includes(project.projectType)) {
    errors.push('PORTFOLIO_INVALID_PROJECT_TYPE');
  }

  if (!CANONICAL_PROJECT_COMPLEXITY_LEVELS.includes(project.complexityLevel)) {
    errors.push('PORTFOLIO_INVALID_COMPLEXITY');
  }

  if (!CANONICAL_PORTFOLIO_STATUS.includes(project.status)) {
    errors.push('PORTFOLIO_INVALID_STATUS');
  }

  if (!project.provenance) {
    errors.push('PORTFOLIO_MISSING_PROVENANCE');
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Helper Functions — Type Guards
// ---------------------------------------------------------------------------

export function isSupportedPortfolioProjectType(
  projectType: string,
): projectType is PortfolioProjectType {
  return CANONICAL_PORTFOLIO_PROJECT_TYPES.includes(projectType as PortfolioProjectType);
}

export function isSupportedProjectDeliverableType(
  deliverableType: string,
): deliverableType is ProjectDeliverableType {
  return CANONICAL_PROJECT_DELIVERABLE_TYPES.includes(deliverableType as ProjectDeliverableType);
}

export function isSupportedCompetencyType(
  competencyType: string,
): competencyType is ProjectCompetencyType {
  return CANONICAL_PROJECT_COMPETENCY_TYPES.includes(competencyType as ProjectCompetencyType);
}

export function isSupportedPortfolioShowcaseType(
  showcaseType: string,
): showcaseType is PortfolioShowcaseType {
  return CANONICAL_PORTFOLIO_SHOWCASE_TYPES.includes(showcaseType as PortfolioShowcaseType);
}

export function isSupportedProjectComplexityLevel(
  complexityLevel: string,
): complexityLevel is ProjectComplexityLevel {
  return CANONICAL_PROJECT_COMPLEXITY_LEVELS.includes(complexityLevel as ProjectComplexityLevel);
}

export function isSupportedPortfolioStatus(
  status: string,
): status is PortfolioStatus {
  return CANONICAL_PORTFOLIO_STATUS.includes(status as PortfolioStatus);
}

export function isSupportedPortfolioGovernance(
  governanceStatus: string,
): governanceStatus is ApplicationGovernanceStatus {
  return CANONICAL_APPLICATION_GOVERNANCE.includes(
    governanceStatus as ApplicationGovernanceStatus,
  );
}

// ---------------------------------------------------------------------------
// Helper Functions — Canonical Getters
// ---------------------------------------------------------------------------

export function getCanonicalPortfolioProjectTypes(): readonly PortfolioProjectType[] {
  return CANONICAL_PORTFOLIO_PROJECT_TYPES;
}

export function getCanonicalProjectDeliverableTypes(): readonly ProjectDeliverableType[] {
  return CANONICAL_PROJECT_DELIVERABLE_TYPES;
}

export function getCanonicalCompetencyTypes(): readonly ProjectCompetencyType[] {
  return CANONICAL_PROJECT_COMPETENCY_TYPES;
}

export function getCanonicalPortfolioShowcaseTypes(): readonly PortfolioShowcaseType[] {
  return CANONICAL_PORTFOLIO_SHOWCASE_TYPES;
}

export function getCanonicalProjectComplexityLevels(): readonly ProjectComplexityLevel[] {
  return CANONICAL_PROJECT_COMPLEXITY_LEVELS;
}

export function getCanonicalPortfolioStatuses(): readonly PortfolioStatus[] {
  return CANONICAL_PORTFOLIO_STATUS;
}

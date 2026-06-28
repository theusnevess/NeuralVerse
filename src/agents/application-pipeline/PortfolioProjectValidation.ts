/**
 * NV-1900-D7-OPT-11 — Portfolio Project Validation Layer
 *
 * Deterministic validation for portfolio project metadata.
 * Returns structured errors, never exceptions for expected validation failures.
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import type {
  PortfolioProject,
  ProjectDeliverable,
  CompetencyEvidence,
  PortfolioShowcase,
  PortfolioProjectRegistry,
  PortfolioProjectTrace,
  PortfolioProjectInput,
  PortfolioProjectValidationError,
  PortfolioProjectRegistryValidationResult,
  PortfolioProjectInputValidationResult,
  PortfolioProjectTraceValidationResult,
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
// Validation Error Codes
// ---------------------------------------------------------------------------

export const PORTFOLIO_VALIDATION_CODES = {
  PORTFOLIO_DUPLICATE_ID: 'PORTFOLIO_DUPLICATE_ID',
  PORTFOLIO_DUPLICATE_TITLE: 'PORTFOLIO_DUPLICATE_TITLE',
  DELIVERABLE_DUPLICATE_ID: 'DELIVERABLE_DUPLICATE_ID',
  COMPETENCY_DUPLICATE_ID: 'COMPETENCY_DUPLICATE_ID',
  SHOWCASE_DUPLICATE_ID: 'SHOWCASE_DUPLICATE_ID',
  PORTFOLIO_INVALID_PROJECT_TYPE: 'PORTFOLIO_INVALID_PROJECT_TYPE',
  PORTFOLIO_INVALID_DELIVERABLE: 'PORTFOLIO_INVALID_DELIVERABLE',
  PORTFOLIO_INVALID_COMPETENCY: 'PORTFOLIO_INVALID_COMPETENCY',
  PORTFOLIO_INVALID_SHOWCASE: 'PORTFOLIO_INVALID_SHOWCASE',
  PORTFOLIO_INVALID_COMPLEXITY: 'PORTFOLIO_INVALID_COMPLEXITY',
  PORTFOLIO_INVALID_STATUS: 'PORTFOLIO_INVALID_STATUS',
  PORTFOLIO_INVALID_GOVERNANCE: 'PORTFOLIO_INVALID_GOVERNANCE',
  PORTFOLIO_MISSING_PROVENANCE: 'PORTFOLIO_MISSING_PROVENANCE',
  PORTFOLIO_MISSING_PROVIDER: 'PORTFOLIO_MISSING_PROVIDER',
  PORTFOLIO_MISSING_RATIONALE: 'PORTFOLIO_MISSING_RATIONALE',
  PORTFOLIO_MISSING_APPLICATION_REFERENCE: 'PORTFOLIO_MISSING_APPLICATION_REFERENCE',
  PORTFOLIO_MISSING_KNOWLEDGE_REFERENCE: 'PORTFOLIO_MISSING_KNOWLEDGE_REFERENCE',
  PORTFOLIO_MISSING_PROJECT_ID: 'PORTFOLIO_MISSING_PROJECT_ID',
  PORTFOLIO_MISSING_TITLE: 'PORTFOLIO_MISSING_TITLE',
  PORTFOLIO_EMPTY_REGISTRY: 'PORTFOLIO_EMPTY_REGISTRY',
  PORTFOLIO_INVALID_TRACE: 'PORTFOLIO_INVALID_TRACE',
  PORTFOLIO_REGISTRY_INCONSISTENCY: 'PORTFOLIO_REGISTRY_INCONSISTENCY',
} as const;

// ---------------------------------------------------------------------------
// Single Portfolio Project Validation
// ---------------------------------------------------------------------------

export function validatePortfolioProject(
  project: PortfolioProject,
): readonly PortfolioProjectValidationError[] {
  const errors: PortfolioProjectValidationError[] = [];

  if (!project.projectId || project.projectId.trim() === '') {
    errors.push({
      code: PORTFOLIO_VALIDATION_CODES.PORTFOLIO_MISSING_PROJECT_ID,
      message: 'Portfolio project is missing a project ID.',
      field: 'projectId',
      projectId: project.projectId,
    });
  }

  if (!project.title || project.title.trim() === '') {
    errors.push({
      code: PORTFOLIO_VALIDATION_CODES.PORTFOLIO_MISSING_TITLE,
      message: 'Portfolio project is missing a title.',
      field: 'title',
      projectId: project.projectId,
    });
  }

  if (!CANONICAL_PORTFOLIO_PROJECT_TYPES.includes(project.projectType)) {
    errors.push({
      code: PORTFOLIO_VALIDATION_CODES.PORTFOLIO_INVALID_PROJECT_TYPE,
      message: `Portfolio project has unsupported type: "${project.projectType}".`,
      field: 'projectType',
      projectId: project.projectId,
    });
  }

  if (!CANONICAL_PROJECT_COMPLEXITY_LEVELS.includes(project.complexityLevel)) {
    errors.push({
      code: PORTFOLIO_VALIDATION_CODES.PORTFOLIO_INVALID_COMPLEXITY,
      message: `Portfolio project has unsupported complexity: "${project.complexityLevel}".`,
      field: 'complexityLevel',
      projectId: project.projectId,
    });
  }

  if (!CANONICAL_PORTFOLIO_STATUS.includes(project.status)) {
    errors.push({
      code: PORTFOLIO_VALIDATION_CODES.PORTFOLIO_INVALID_STATUS,
      message: `Portfolio project has unsupported status: "${project.status}".`,
      field: 'status',
      projectId: project.projectId,
    });
  }

  if (!project.applicationArtifactId || project.applicationArtifactId.trim() === '') {
    errors.push({
      code: PORTFOLIO_VALIDATION_CODES.PORTFOLIO_MISSING_APPLICATION_REFERENCE,
      message: 'Portfolio project is missing applicationArtifactId.',
      field: 'applicationArtifactId',
      projectId: project.projectId,
    });
  }

  if (!project.knowledgeArtifactId || project.knowledgeArtifactId.trim() === '') {
    errors.push({
      code: PORTFOLIO_VALIDATION_CODES.PORTFOLIO_MISSING_KNOWLEDGE_REFERENCE,
      message: 'Portfolio project is missing knowledgeArtifactId.',
      field: 'knowledgeArtifactId',
      projectId: project.projectId,
    });
  }

  if (!project.provenance) {
    errors.push({
      code: PORTFOLIO_VALIDATION_CODES.PORTFOLIO_MISSING_PROVENANCE,
      message: 'Portfolio project is missing provenance.',
      field: 'provenance',
      projectId: project.projectId,
    });
  } else {
    if (!project.provenance.providedBy || project.provenance.providedBy.trim() === '') {
      errors.push({
        code: PORTFOLIO_VALIDATION_CODES.PORTFOLIO_MISSING_PROVIDER,
        message: 'Project provenance is missing providedBy.',
        field: 'provenance.providedBy',
        projectId: project.projectId,
      });
    }

    if (!project.provenance.rationale || project.provenance.rationale.trim() === '') {
      errors.push({
        code: PORTFOLIO_VALIDATION_CODES.PORTFOLIO_MISSING_RATIONALE,
        message: 'Project provenance is missing rationale.',
        field: 'provenance.rationale',
        projectId: project.projectId,
      });
    }

    if (!CANONICAL_APPLICATION_GOVERNANCE.includes(project.provenance.governanceStatus)) {
      errors.push({
        code: PORTFOLIO_VALIDATION_CODES.PORTFOLIO_INVALID_GOVERNANCE,
        message: `Project provenance has invalid governance status: "${project.provenance.governanceStatus}".`,
        field: 'provenance.governanceStatus',
        projectId: project.projectId,
      });
    }
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Project Deliverable Validation
// ---------------------------------------------------------------------------

export function validateProjectDeliverable(
  deliverable: ProjectDeliverable,
): readonly PortfolioProjectValidationError[] {
  const errors: PortfolioProjectValidationError[] = [];

  if (!deliverable.deliverableId || deliverable.deliverableId.trim() === '') {
    errors.push({
      code: PORTFOLIO_VALIDATION_CODES.DELIVERABLE_DUPLICATE_ID,
      message: 'Project deliverable is missing a deliverable ID.',
      field: 'deliverableId',
      deliverableId: deliverable.deliverableId,
    });
  }

  if (!CANONICAL_PROJECT_DELIVERABLE_TYPES.includes(deliverable.deliverableType)) {
    errors.push({
      code: PORTFOLIO_VALIDATION_CODES.PORTFOLIO_INVALID_DELIVERABLE,
      message: `Project deliverable has unsupported type: "${deliverable.deliverableType}".`,
      field: 'deliverableType',
      deliverableId: deliverable.deliverableId,
    });
  }

  if (!deliverable.provenance) {
    errors.push({
      code: PORTFOLIO_VALIDATION_CODES.PORTFOLIO_MISSING_PROVENANCE,
      message: 'Project deliverable is missing provenance.',
      field: 'provenance',
      deliverableId: deliverable.deliverableId,
    });
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Competency Evidence Validation
// ---------------------------------------------------------------------------

export function validateCompetencyEvidence(
  competency: CompetencyEvidence,
): readonly PortfolioProjectValidationError[] {
  const errors: PortfolioProjectValidationError[] = [];

  if (!competency.competencyId || competency.competencyId.trim() === '') {
    errors.push({
      code: PORTFOLIO_VALIDATION_CODES.COMPETENCY_DUPLICATE_ID,
      message: 'Competency evidence is missing a competency ID.',
      field: 'competencyId',
      competencyId: competency.competencyId,
    });
  }

  if (!CANONICAL_PROJECT_COMPETENCY_TYPES.includes(competency.competencyType)) {
    errors.push({
      code: PORTFOLIO_VALIDATION_CODES.PORTFOLIO_INVALID_COMPETENCY,
      message: `Competency evidence has unsupported type: "${competency.competencyType}".`,
      field: 'competencyType',
      competencyId: competency.competencyId,
    });
  }

  if (!competency.provenance) {
    errors.push({
      code: PORTFOLIO_VALIDATION_CODES.PORTFOLIO_MISSING_PROVENANCE,
      message: 'Competency evidence is missing provenance.',
      field: 'provenance',
      competencyId: competency.competencyId,
    });
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Portfolio Showcase Validation
// ---------------------------------------------------------------------------

export function validatePortfolioShowcase(
  showcase: PortfolioShowcase,
): readonly PortfolioProjectValidationError[] {
  const errors: PortfolioProjectValidationError[] = [];

  if (!showcase.showcaseId || showcase.showcaseId.trim() === '') {
    errors.push({
      code: PORTFOLIO_VALIDATION_CODES.SHOWCASE_DUPLICATE_ID,
      message: 'Portfolio showcase is missing a showcase ID.',
      field: 'showcaseId',
      showcaseId: showcase.showcaseId,
    });
  }

  if (!CANONICAL_PORTFOLIO_SHOWCASE_TYPES.includes(showcase.showcaseType)) {
    errors.push({
      code: PORTFOLIO_VALIDATION_CODES.PORTFOLIO_INVALID_SHOWCASE,
      message: `Portfolio showcase has unsupported type: "${showcase.showcaseType}".`,
      field: 'showcaseType',
      showcaseId: showcase.showcaseId,
    });
  }

  if (!showcase.provenance) {
    errors.push({
      code: PORTFOLIO_VALIDATION_CODES.PORTFOLIO_MISSING_PROVENANCE,
      message: 'Portfolio showcase is missing provenance.',
      field: 'provenance',
      showcaseId: showcase.showcaseId,
    });
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Portfolio Project Registry Validation
// ---------------------------------------------------------------------------

export function validatePortfolioProjectRegistry(
  registry: PortfolioProjectRegistry,
): PortfolioProjectRegistryValidationResult {
  const errors: PortfolioProjectValidationError[] = [];

  if (!registry.registryId || registry.registryId.trim() === '') {
    errors.push({
      code: PORTFOLIO_VALIDATION_CODES.PORTFOLIO_EMPTY_REGISTRY,
      message: 'Registry is missing a registry ID.',
      field: 'registryId',
    });
  }

  if (!registry.projects || registry.projects.length === 0) {
    errors.push({
      code: PORTFOLIO_VALIDATION_CODES.PORTFOLIO_EMPTY_REGISTRY,
      message: 'Registry has no projects.',
      field: 'projects',
    });
  }

  if (registry.deterministic !== true) {
    errors.push({
      code: PORTFOLIO_VALIDATION_CODES.PORTFOLIO_INVALID_TRACE,
      message: 'Registry must declare deterministic: true.',
      field: 'deterministic',
    });
  }

  if (registry.randomUsed !== false) {
    errors.push({
      code: PORTFOLIO_VALIDATION_CODES.PORTFOLIO_INVALID_TRACE,
      message: 'Registry must declare randomUsed: false.',
      field: 'randomUsed',
    });
  }

  if (registry.timeDependency !== false) {
    errors.push({
      code: PORTFOLIO_VALIDATION_CODES.PORTFOLIO_INVALID_TRACE,
      message: 'Registry must declare timeDependency: false.',
      field: 'timeDependency',
    });
  }

  // Duplicate project IDs
  const seenProjectIds = new Set<string>();
  for (const p of registry.projects) {
    if (seenProjectIds.has(p.projectId)) {
      errors.push({
        code: PORTFOLIO_VALIDATION_CODES.PORTFOLIO_DUPLICATE_ID,
        message: `Duplicate project ID: "${p.projectId}".`,
        projectId: p.projectId,
      });
    }
    seenProjectIds.add(p.projectId);
  }

  // Duplicate project titles
  const seenProjectTitles = new Set<string>();
  for (const p of registry.projects) {
    if (seenProjectTitles.has(p.title)) {
      errors.push({
        code: PORTFOLIO_VALIDATION_CODES.PORTFOLIO_DUPLICATE_TITLE,
        message: `Duplicate project title: "${p.title}".`,
        field: 'title',
        projectId: p.projectId,
      });
    }
    seenProjectTitles.add(p.title);
  }

  // Duplicate deliverable IDs
  const seenDeliverableIds = new Set<string>();
  for (const d of registry.deliverables) {
    if (seenDeliverableIds.has(d.deliverableId)) {
      errors.push({
        code: PORTFOLIO_VALIDATION_CODES.DELIVERABLE_DUPLICATE_ID,
        message: `Duplicate deliverable ID: "${d.deliverableId}".`,
        deliverableId: d.deliverableId,
      });
    }
    seenDeliverableIds.add(d.deliverableId);
  }

  // Duplicate competency IDs
  const seenCompetencyIds = new Set<string>();
  for (const c of registry.competencies) {
    if (seenCompetencyIds.has(c.competencyId)) {
      errors.push({
        code: PORTFOLIO_VALIDATION_CODES.COMPETENCY_DUPLICATE_ID,
        message: `Duplicate competency ID: "${c.competencyId}".`,
        competencyId: c.competencyId,
      });
    }
    seenCompetencyIds.add(c.competencyId);
  }

  // Duplicate showcase IDs
  const seenShowcaseIds = new Set<string>();
  for (const s of registry.showcases) {
    if (seenShowcaseIds.has(s.showcaseId)) {
      errors.push({
        code: PORTFOLIO_VALIDATION_CODES.SHOWCASE_DUPLICATE_ID,
        message: `Duplicate showcase ID: "${s.showcaseId}".`,
        showcaseId: s.showcaseId,
      });
    }
    seenShowcaseIds.add(s.showcaseId);
  }

  // Validate each project
  for (const p of registry.projects) {
    errors.push(...validatePortfolioProject(p));
  }

  // Validate each deliverable
  for (const d of registry.deliverables) {
    errors.push(...validateProjectDeliverable(d));
  }

  // Validate each competency
  for (const c of registry.competencies) {
    errors.push(...validateCompetencyEvidence(c));
  }

  // Validate each showcase
  for (const s of registry.showcases) {
    errors.push(...validatePortfolioShowcase(s));
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'portfolio_project_registry_composition',
  };
}

// ---------------------------------------------------------------------------
// Portfolio Project Input Validation
// ---------------------------------------------------------------------------

export function validatePortfolioProjectInput(
  input: PortfolioProjectInput,
): PortfolioProjectInputValidationResult {
  const errors: PortfolioProjectValidationError[] = [];

  if (!input.projects || input.projects.length === 0) {
    errors.push({
      code: PORTFOLIO_VALIDATION_CODES.PORTFOLIO_EMPTY_REGISTRY,
      message: 'Input has no projects.',
      field: 'projects',
    });
  } else {
    for (const p of input.projects) {
      errors.push(...validatePortfolioProject(p));
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'portfolio_project_input_composition',
  };
}

// ---------------------------------------------------------------------------
// Portfolio Project Trace Validation
// ---------------------------------------------------------------------------

export function validatePortfolioProjectTrace(
  trace: PortfolioProjectTrace,
): PortfolioProjectTraceValidationResult {
  const errors: PortfolioProjectValidationError[] = [];

  if (!trace.traceId || trace.traceId.trim() === '') {
    errors.push({
      code: PORTFOLIO_VALIDATION_CODES.PORTFOLIO_INVALID_TRACE,
      message: 'Portfolio project trace is missing a trace ID.',
      field: 'traceId',
    });
  }

  if (trace.deterministic !== true) {
    errors.push({
      code: PORTFOLIO_VALIDATION_CODES.PORTFOLIO_INVALID_TRACE,
      message: 'Portfolio project trace must declare deterministic: true.',
      field: 'deterministic',
    });
  }

  if (trace.randomUsed !== false) {
    errors.push({
      code: PORTFOLIO_VALIDATION_CODES.PORTFOLIO_INVALID_TRACE,
      message: 'Portfolio project trace must declare randomUsed: false.',
      field: 'randomUsed',
    });
  }

  if (trace.timeDependency !== false) {
    errors.push({
      code: PORTFOLIO_VALIDATION_CODES.PORTFOLIO_INVALID_TRACE,
      message: 'Portfolio project trace must declare timeDependency: false.',
      field: 'timeDependency',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'portfolio_project_trace_composition',
  };
}

// ---------------------------------------------------------------------------
// Application Artifact with Portfolio Projects Validation
// ---------------------------------------------------------------------------

export function validateApplicationArtifactWithPortfolioProjects(
  registry: PortfolioProjectRegistry,
): readonly PortfolioProjectValidationError[] {
  const errors: PortfolioProjectValidationError[] = [];
  const registryResult = validatePortfolioProjectRegistry(registry);
  errors.push(...registryResult.errors);
  return errors;
}

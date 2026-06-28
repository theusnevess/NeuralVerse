/**
 * NV-1900-D7-OPT-04 — Complete Case Study Modeling Kernel
 *
 * Deterministic orchestration functions for case study metadata.
 * Produces case studies, datasets, decisions, lessons, traces, and registries.
 *
 * This module never:
 * - Generates case study content
 * - Inventories industrial scenarios
 * - Generates engineering reports
 * - Evaluates case study quality
 * - Stores educational content
 * - Generates markdown
 * - Accesses filesystem
 * - Performs network requests
 * - Calls external APIs
 *
 * Case study metadata only.
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import type {
  ApplicationCaseStudy,
  CaseStudyProvenance,
  CaseStudyDataset,
  EngineeringDecision,
  EngineeringLesson,
  CaseStudyDecision,
  CaseStudyTrace,
  CaseStudyRegistry,
  CaseStudyRegistryMetadata,
  CaseStudyInput,
  CaseStudyType,
  CaseStudyProblemDomain,
  DatasetRole,
  EngineeringDecisionType,
  CaseStudyLessonType,
  CaseStudyStatus,
  ApplicationGovernanceStatus,
  ApplicationNode,
  ApplicationArtifactWithCaseStudies,
} from './ApplicationAgentContract.ts';

import {
  CANONICAL_CASE_STUDY_TYPES,
  CANONICAL_CASE_STUDY_PROBLEM_DOMAINS,
  CANONICAL_DATASET_ROLES,
  CANONICAL_ENGINEERING_DECISION_TYPES,
  CANONICAL_CASE_STUDY_LESSON_TYPES,
  CANONICAL_CASE_STUDY_STATUS,
  CANONICAL_APPLICATION_GOVERNANCE,
} from './ApplicationAgentContract.ts';

// ---------------------------------------------------------------------------
// Case Study Provenance Composition
// ---------------------------------------------------------------------------

/**
 * Composes case study provenance from provided parameters.
 * Pure function. No side effects.
 */
export function composeCaseStudyProvenance(params: {
  readonly providedBy: string;
  readonly rationale: string;
  readonly reviewedBy: string;
  readonly reviewDate: string;
  readonly governanceStatus: ApplicationGovernanceStatus;
}): CaseStudyProvenance {
  return {
    providedBy: params.providedBy,
    rationale: params.rationale,
    reviewedBy: params.reviewedBy,
    reviewDate: params.reviewDate,
    governanceStatus: params.governanceStatus,
  };
}

// ---------------------------------------------------------------------------
// Application Case Study Composition
// ---------------------------------------------------------------------------

/**
 * Composes an application case study from provided parameters.
 * Pure function. No side effects.
 */
export function composeApplicationCaseStudy(params: {
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
}): ApplicationCaseStudy {
  return {
    caseStudyId: params.caseStudyId,
    title: params.title,
    description: params.description,
    caseStudyType: params.caseStudyType,
    problemDomain: params.problemDomain,
    applicationArtifactId: params.applicationArtifactId,
    knowledgeArtifactId: params.knowledgeArtifactId,
    architectureIds: [...params.architectureIds],
    useCaseIds: [...params.useCaseIds],
    summary: params.summary,
    status: params.status,
    provenance: params.provenance,
  };
}

// ---------------------------------------------------------------------------
// Case Study Dataset Composition
// ---------------------------------------------------------------------------

/**
 * Composes a case study dataset from provided parameters.
 * Pure function. No side effects.
 */
export function composeCaseStudyDataset(params: {
  readonly datasetId: string;
  readonly caseStudyId: string;
  readonly datasetName: string;
  readonly datasetRole: DatasetRole;
  readonly description: string;
  readonly provenance: CaseStudyProvenance;
}): CaseStudyDataset {
  return {
    datasetId: params.datasetId,
    caseStudyId: params.caseStudyId,
    datasetName: params.datasetName,
    datasetRole: params.datasetRole,
    description: params.description,
    provenance: params.provenance,
  };
}

// ---------------------------------------------------------------------------
// Engineering Decision Composition
// ---------------------------------------------------------------------------

/**
 * Composes an engineering decision from provided parameters.
 * Pure function. No side effects.
 */
export function composeEngineeringDecision(params: {
  readonly decisionId: string;
  readonly caseStudyId: string;
  readonly decisionType: EngineeringDecisionType;
  readonly description: string;
  readonly rationale: string;
  readonly provenance: CaseStudyProvenance;
}): EngineeringDecision {
  return {
    decisionId: params.decisionId,
    caseStudyId: params.caseStudyId,
    decisionType: params.decisionType,
    description: params.description,
    rationale: params.rationale,
    provenance: params.provenance,
  };
}

// ---------------------------------------------------------------------------
// Engineering Lesson Composition
// ---------------------------------------------------------------------------

/**
 * Composes an engineering lesson from provided parameters.
 * Pure function. No side effects.
 */
export function composeEngineeringLesson(params: {
  readonly lessonId: string;
  readonly caseStudyId: string;
  readonly lessonType: CaseStudyLessonType;
  readonly description: string;
  readonly provenance: CaseStudyProvenance;
}): EngineeringLesson {
  return {
    lessonId: params.lessonId,
    caseStudyId: params.caseStudyId,
    lessonType: params.lessonType,
    description: params.description,
    provenance: params.provenance,
  };
}

// ---------------------------------------------------------------------------
// Case Study Decision Composition
// ---------------------------------------------------------------------------

/**
 * Composes a case study decision from validation results.
 * Pure function. No side effects.
 */
function _composeCaseStudyDecision(
  caseStudyId: string,
  validationPassed: boolean,
  validationErrors: readonly string[],
): CaseStudyDecision {
  return {
    decisionId: `_decision_${caseStudyId}`,
    caseStudyId,
    validationPassed,
    validationErrors,
  };
}

// ---------------------------------------------------------------------------
// Case Study Trace Composition
// ---------------------------------------------------------------------------

/**
 * Composes a case study trace from decisions and metadata.
 * Pure function. No side effects.
 */
export function composeCaseStudyTrace(params: {
  readonly traceId: string;
  readonly decisions: readonly CaseStudyDecision[];
  readonly registryVersion: string;
  readonly compositionVersion: string;
}): CaseStudyTrace {
  return {
    traceId: params.traceId,
    decisionCount: params.decisions.length,
    validationCount: params.decisions.filter((d) => d.validationPassed).length,
    registryVersion: params.registryVersion,
    compositionVersion: params.compositionVersion,
    decisions: params.decisions,
    deterministic: true,
    generatedFrom: 'deterministic_case_study_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Deterministic Sort Comparators
// ---------------------------------------------------------------------------

function _compareCaseStudy(
  a: ApplicationCaseStudy,
  b: ApplicationCaseStudy,
): number {
  if (a.caseStudyId < b.caseStudyId) return -1;
  if (a.caseStudyId > b.caseStudyId) return 1;
  if (a.caseStudyType < b.caseStudyType) return -1;
  if (a.caseStudyType > b.caseStudyType) return 1;
  if (a.title < b.title) return -1;
  if (a.title > b.title) return 1;
  return 0;
}

function _compareDataset(
  a: CaseStudyDataset,
  b: CaseStudyDataset,
): number {
  if (a.caseStudyId < b.caseStudyId) return -1;
  if (a.caseStudyId > b.caseStudyId) return 1;
  if (a.datasetRole < b.datasetRole) return -1;
  if (a.datasetRole > b.datasetRole) return 1;
  if (a.datasetId < b.datasetId) return -1;
  if (a.datasetId > b.datasetId) return 1;
  return 0;
}

function _compareDecision(
  a: EngineeringDecision,
  b: EngineeringDecision,
): number {
  if (a.caseStudyId < b.caseStudyId) return -1;
  if (a.caseStudyId > b.caseStudyId) return 1;
  if (a.decisionType < b.decisionType) return -1;
  if (a.decisionType > b.decisionType) return 1;
  if (a.decisionId < b.decisionId) return -1;
  if (a.decisionId > b.decisionId) return 1;
  return 0;
}

function _compareLesson(
  a: EngineeringLesson,
  b: EngineeringLesson,
): number {
  if (a.caseStudyId < b.caseStudyId) return -1;
  if (a.caseStudyId > b.caseStudyId) return 1;
  if (a.lessonType < b.lessonType) return -1;
  if (a.lessonType > b.lessonType) return 1;
  if (a.lessonId < b.lessonId) return -1;
  if (a.lessonId > b.lessonId) return 1;
  return 0;
}

// ---------------------------------------------------------------------------
// Case Study Registry Composition
// ---------------------------------------------------------------------------

/**
 * Composes a case study registry from components.
 * Pure function. No side effects.
 * Deterministic ordering for all collections.
 */
export function composeCaseStudyRegistry(
  caseStudies: readonly ApplicationCaseStudy[],
  datasets: readonly CaseStudyDataset[],
  decisions: readonly EngineeringDecision[],
  lessons: readonly EngineeringLesson[],
): CaseStudyRegistry {
  const sortedCaseStudies = [...caseStudies].sort(_compareCaseStudy);
  const sortedDatasets = [...datasets].sort(_compareDataset);
  const sortedDecisions = [...decisions].sort(_compareDecision);
  const sortedLessons = [...lessons].sort(_compareLesson);

  const types = new Set(sortedCaseStudies.map((c) => c.caseStudyType));

  const metadata: CaseStudyRegistryMetadata = {
    registryId: `_registry_${sortedCaseStudies.length}_${sortedDatasets.length}_${sortedDecisions.length}_${sortedLessons.length}`,
    caseStudyCount: sortedCaseStudies.length,
    datasetCount: sortedDatasets.length,
    decisionCount: sortedDecisions.length,
    lessonCount: sortedLessons.length,
    typeCount: types.size,
  };

  return {
    registryId: metadata.registryId,
    caseStudies: sortedCaseStudies,
    datasets: sortedDatasets,
    decisions: sortedDecisions,
    lessons: sortedLessons,
    metadata,
    trace: {
      traceId: `_trace_${sortedCaseStudies.length}`,
      decisionCount: 0,
      validationCount: 0,
      registryVersion: '1.0.0',
      compositionVersion: '1.0.0',
      decisions: [],
      deterministic: true,
      generatedFrom: 'deterministic_case_study_kernel',
      randomUsed: false,
      timeDependency: false,
    },
    deterministic: true,
    generatedFrom: 'deterministic_case_study_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Case Study Registry From Input Composition
// ---------------------------------------------------------------------------

export function composeCaseStudyRegistryFromInput(
  input: CaseStudyInput,
): CaseStudyRegistry {
  return composeCaseStudyRegistry(
    input.caseStudies,
    input.datasets,
    input.decisions,
    input.lessons,
  );
}

// ---------------------------------------------------------------------------
// Case Study Composition (Main Entry Point)
// ---------------------------------------------------------------------------

export function composeApplicationCaseStudies(
  input: CaseStudyInput,
): CaseStudyRegistry {
  const decisions = input.caseStudies.map((caseStudy) => {
    const errors = _validateCaseStudyForDecision(caseStudy);
    return _composeCaseStudyDecision(caseStudy.caseStudyId, errors.length === 0, errors);
  });

  const registry = composeCaseStudyRegistry(
    input.caseStudies,
    input.datasets,
    input.decisions,
    input.lessons,
  );

  return {
    ...registry,
    trace: composeCaseStudyTrace({
      traceId: `_trace_${input.caseStudies.length}`,
      decisions,
      registryVersion: '1.0.0',
      compositionVersion: '1.0.0',
    }),
  };
}

// ---------------------------------------------------------------------------
// Application Artifact with Case Studies Composition
// ---------------------------------------------------------------------------

export function composeApplicationArtifactWithCaseStudies(params: {
  readonly applicationNode: ApplicationNode;
  readonly caseStudyRegistry: CaseStudyRegistry;
}): ApplicationArtifactWithCaseStudies {
  return {
    applicationNode: { ...params.applicationNode },
    caseStudyRegistry: { ...params.caseStudyRegistry },
    deterministic: true,
    generatedFrom: 'deterministic_case_study_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Case Study Decision Validation
// ---------------------------------------------------------------------------

function _validateCaseStudyForDecision(
  caseStudy: ApplicationCaseStudy,
): readonly string[] {
  const errors: string[] = [];

  if (!caseStudy.caseStudyId || caseStudy.caseStudyId.trim() === '') {
    errors.push('CASE_STUDY_MISSING_CASE_STUDY_ID');
  }

  if (!caseStudy.title || caseStudy.title.trim() === '') {
    errors.push('CASE_STUDY_MISSING_TITLE');
  }

  if (!CANONICAL_CASE_STUDY_TYPES.includes(caseStudy.caseStudyType)) {
    errors.push('CASE_STUDY_INVALID_TYPE');
  }

  if (!CANONICAL_CASE_STUDY_PROBLEM_DOMAINS.includes(caseStudy.problemDomain)) {
    errors.push('CASE_STUDY_INVALID_PROBLEM_DOMAIN');
  }

  if (!CANONICAL_CASE_STUDY_STATUS.includes(caseStudy.status)) {
    errors.push('CASE_STUDY_INVALID_STATUS');
  }

  if (!caseStudy.provenance) {
    errors.push('CASE_STUDY_MISSING_PROVENANCE');
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Helper Functions — Type Guards
// ---------------------------------------------------------------------------

export function isSupportedCaseStudyType(
  caseStudyType: string,
): caseStudyType is CaseStudyType {
  return CANONICAL_CASE_STUDY_TYPES.includes(caseStudyType as CaseStudyType);
}

export function isSupportedProblemDomain(
  problemDomain: string,
): problemDomain is CaseStudyProblemDomain {
  return CANONICAL_CASE_STUDY_PROBLEM_DOMAINS.includes(problemDomain as CaseStudyProblemDomain);
}

export function isSupportedDatasetRole(
  datasetRole: string,
): datasetRole is DatasetRole {
  return CANONICAL_DATASET_ROLES.includes(datasetRole as DatasetRole);
}

export function isSupportedEngineeringDecisionType(
  decisionType: string,
): decisionType is EngineeringDecisionType {
  return CANONICAL_ENGINEERING_DECISION_TYPES.includes(decisionType as EngineeringDecisionType);
}

export function isSupportedLessonType(
  lessonType: string,
): lessonType is CaseStudyLessonType {
  return CANONICAL_CASE_STUDY_LESSON_TYPES.includes(lessonType as CaseStudyLessonType);
}

export function isSupportedCaseStudyStatus(
  status: string,
): status is CaseStudyStatus {
  return CANONICAL_CASE_STUDY_STATUS.includes(status as CaseStudyStatus);
}

export function isSupportedCaseStudyGovernance(
  governanceStatus: string,
): governanceStatus is ApplicationGovernanceStatus {
  return CANONICAL_APPLICATION_GOVERNANCE.includes(
    governanceStatus as ApplicationGovernanceStatus,
  );
}

// ---------------------------------------------------------------------------
// Helper Functions — Canonical Getters
// ---------------------------------------------------------------------------

export function getCanonicalCaseStudyTypes(): readonly CaseStudyType[] {
  return CANONICAL_CASE_STUDY_TYPES;
}

export function getCanonicalProblemDomains(): readonly CaseStudyProblemDomain[] {
  return CANONICAL_CASE_STUDY_PROBLEM_DOMAINS;
}

export function getCanonicalDatasetRoles(): readonly DatasetRole[] {
  return CANONICAL_DATASET_ROLES;
}

export function getCanonicalEngineeringDecisionTypes(): readonly EngineeringDecisionType[] {
  return CANONICAL_ENGINEERING_DECISION_TYPES;
}

export function getCanonicalLessonTypes(): readonly CaseStudyLessonType[] {
  return CANONICAL_CASE_STUDY_LESSON_TYPES;
}

export function getCanonicalCaseStudyStatuses(): readonly CaseStudyStatus[] {
  return CANONICAL_CASE_STUDY_STATUS;
}

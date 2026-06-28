/**
 * NV-1900-D7-OPT-04 — Case Study Validation Layer
 *
 * Deterministic validation for case study metadata.
 * Returns structured errors, never exceptions for expected validation failures.
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import type {
  ApplicationCaseStudy,
  CaseStudyDataset,
  EngineeringDecision,
  EngineeringLesson,
  CaseStudyRegistry,
  CaseStudyTrace,
  CaseStudyInput,
  CaseStudyValidationError,
  CaseStudyRegistryValidationResult,
  CaseStudyInputValidationResult,
  CaseStudyTraceValidationResult,
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
// Validation Error Codes
// ---------------------------------------------------------------------------

export const CASE_STUDY_VALIDATION_CODES = {
  CASE_STUDY_DUPLICATE_ID: 'CASE_STUDY_DUPLICATE_ID',
  CASE_STUDY_DUPLICATE_TITLE: 'CASE_STUDY_DUPLICATE_TITLE',
  CASE_STUDY_DATASET_DUPLICATE_ID: 'CASE_STUDY_DATASET_DUPLICATE_ID',
  CASE_STUDY_DECISION_DUPLICATE_ID: 'CASE_STUDY_DECISION_DUPLICATE_ID',
  CASE_STUDY_LESSON_DUPLICATE_ID: 'CASE_STUDY_LESSON_DUPLICATE_ID',
  CASE_STUDY_INVALID_TYPE: 'CASE_STUDY_INVALID_TYPE',
  CASE_STUDY_INVALID_PROBLEM_DOMAIN: 'CASE_STUDY_INVALID_PROBLEM_DOMAIN',
  CASE_STUDY_INVALID_DATASET_ROLE: 'CASE_STUDY_INVALID_DATASET_ROLE',
  CASE_STUDY_INVALID_DECISION_TYPE: 'CASE_STUDY_INVALID_DECISION_TYPE',
  CASE_STUDY_INVALID_LESSON_TYPE: 'CASE_STUDY_INVALID_LESSON_TYPE',
  CASE_STUDY_INVALID_STATUS: 'CASE_STUDY_INVALID_STATUS',
  CASE_STUDY_INVALID_GOVERNANCE: 'CASE_STUDY_INVALID_GOVERNANCE',
  CASE_STUDY_MISSING_PROVENANCE: 'CASE_STUDY_MISSING_PROVENANCE',
  CASE_STUDY_MISSING_PROVIDER: 'CASE_STUDY_MISSING_PROVIDER',
  CASE_STUDY_MISSING_RATIONALE: 'CASE_STUDY_MISSING_RATIONALE',
  CASE_STUDY_MISSING_APPLICATION_REFERENCE: 'CASE_STUDY_MISSING_APPLICATION_REFERENCE',
  CASE_STUDY_MISSING_KNOWLEDGE_REFERENCE: 'CASE_STUDY_MISSING_KNOWLEDGE_REFERENCE',
  CASE_STUDY_MISSING_CASE_STUDY_ID: 'CASE_STUDY_MISSING_CASE_STUDY_ID',
  CASE_STUDY_MISSING_TITLE: 'CASE_STUDY_MISSING_TITLE',
  CASE_STUDY_MISSING_DATASET_REFERENCE: 'CASE_STUDY_MISSING_DATASET_REFERENCE',
  CASE_STUDY_MISSING_DECISION_REFERENCE: 'CASE_STUDY_MISSING_DECISION_REFERENCE',
  CASE_STUDY_MISSING_LESSON_REFERENCE: 'CASE_STUDY_MISSING_LESSON_REFERENCE',
  CASE_STUDY_EMPTY_REGISTRY: 'CASE_STUDY_EMPTY_REGISTRY',
  CASE_STUDY_INVALID_TRACE: 'CASE_STUDY_INVALID_TRACE',
  CASE_STUDY_REGISTRY_INCONSISTENCY: 'CASE_STUDY_REGISTRY_INCONSISTENCY',
} as const;

// ---------------------------------------------------------------------------
// Single Case Study Validation
// ---------------------------------------------------------------------------

export function validateApplicationCaseStudy(
  caseStudy: ApplicationCaseStudy,
): readonly CaseStudyValidationError[] {
  const errors: CaseStudyValidationError[] = [];

  if (!caseStudy.caseStudyId || caseStudy.caseStudyId.trim() === '') {
    errors.push({
      code: CASE_STUDY_VALIDATION_CODES.CASE_STUDY_MISSING_CASE_STUDY_ID,
      message: 'Application case study is missing a case study ID.',
      field: 'caseStudyId',
      caseStudyId: caseStudy.caseStudyId,
    });
  }

  if (!caseStudy.title || caseStudy.title.trim() === '') {
    errors.push({
      code: CASE_STUDY_VALIDATION_CODES.CASE_STUDY_MISSING_TITLE,
      message: 'Application case study is missing a title.',
      field: 'title',
      caseStudyId: caseStudy.caseStudyId,
    });
  }

  if (!CANONICAL_CASE_STUDY_TYPES.includes(caseStudy.caseStudyType)) {
    errors.push({
      code: CASE_STUDY_VALIDATION_CODES.CASE_STUDY_INVALID_TYPE,
      message: `Application case study has unsupported type: "${caseStudy.caseStudyType}".`,
      field: 'caseStudyType',
      caseStudyId: caseStudy.caseStudyId,
    });
  }

  if (!CANONICAL_CASE_STUDY_PROBLEM_DOMAINS.includes(caseStudy.problemDomain)) {
    errors.push({
      code: CASE_STUDY_VALIDATION_CODES.CASE_STUDY_INVALID_PROBLEM_DOMAIN,
      message: `Application case study has unsupported problem domain: "${caseStudy.problemDomain}".`,
      field: 'problemDomain',
      caseStudyId: caseStudy.caseStudyId,
    });
  }

  if (!CANONICAL_CASE_STUDY_STATUS.includes(caseStudy.status)) {
    errors.push({
      code: CASE_STUDY_VALIDATION_CODES.CASE_STUDY_INVALID_STATUS,
      message: `Application case study has unsupported status: "${caseStudy.status}".`,
      field: 'status',
      caseStudyId: caseStudy.caseStudyId,
    });
  }

  if (!caseStudy.applicationArtifactId || caseStudy.applicationArtifactId.trim() === '') {
    errors.push({
      code: CASE_STUDY_VALIDATION_CODES.CASE_STUDY_MISSING_APPLICATION_REFERENCE,
      message: 'Application case study is missing applicationArtifactId.',
      field: 'applicationArtifactId',
      caseStudyId: caseStudy.caseStudyId,
    });
  }

  if (!caseStudy.knowledgeArtifactId || caseStudy.knowledgeArtifactId.trim() === '') {
    errors.push({
      code: CASE_STUDY_VALIDATION_CODES.CASE_STUDY_MISSING_KNOWLEDGE_REFERENCE,
      message: 'Application case study is missing knowledgeArtifactId.',
      field: 'knowledgeArtifactId',
      caseStudyId: caseStudy.caseStudyId,
    });
  }

  if (!caseStudy.provenance) {
    errors.push({
      code: CASE_STUDY_VALIDATION_CODES.CASE_STUDY_MISSING_PROVENANCE,
      message: 'Application case study is missing provenance.',
      field: 'provenance',
      caseStudyId: caseStudy.caseStudyId,
    });
  } else {
    if (!caseStudy.provenance.providedBy || caseStudy.provenance.providedBy.trim() === '') {
      errors.push({
        code: CASE_STUDY_VALIDATION_CODES.CASE_STUDY_MISSING_PROVIDER,
        message: 'Case study provenance is missing providedBy.',
        field: 'provenance.providedBy',
        caseStudyId: caseStudy.caseStudyId,
      });
    }

    if (!caseStudy.provenance.rationale || caseStudy.provenance.rationale.trim() === '') {
      errors.push({
        code: CASE_STUDY_VALIDATION_CODES.CASE_STUDY_MISSING_RATIONALE,
        message: 'Case study provenance is missing rationale.',
        field: 'provenance.rationale',
        caseStudyId: caseStudy.caseStudyId,
      });
    }

    if (!CANONICAL_APPLICATION_GOVERNANCE.includes(caseStudy.provenance.governanceStatus)) {
      errors.push({
        code: CASE_STUDY_VALIDATION_CODES.CASE_STUDY_INVALID_GOVERNANCE,
        message: `Case study provenance has invalid governance status: "${caseStudy.provenance.governanceStatus}".`,
        field: 'provenance.governanceStatus',
        caseStudyId: caseStudy.caseStudyId,
      });
    }
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Case Study Dataset Validation
// ---------------------------------------------------------------------------

export function validateCaseStudyDataset(
  dataset: CaseStudyDataset,
): readonly CaseStudyValidationError[] {
  const errors: CaseStudyValidationError[] = [];

  if (!dataset.datasetId || dataset.datasetId.trim() === '') {
    errors.push({
      code: CASE_STUDY_VALIDATION_CODES.CASE_STUDY_MISSING_DATASET_REFERENCE,
      message: 'Case study dataset is missing a dataset ID.',
      field: 'datasetId',
      datasetId: dataset.datasetId,
    });
  }

  if (!dataset.caseStudyId || dataset.caseStudyId.trim() === '') {
    errors.push({
      code: CASE_STUDY_VALIDATION_CODES.CASE_STUDY_MISSING_DECISION_REFERENCE,
      message: 'Case study dataset is missing a case study ID.',
      field: 'caseStudyId',
      datasetId: dataset.datasetId,
    });
  }

  if (!CANONICAL_DATASET_ROLES.includes(dataset.datasetRole)) {
    errors.push({
      code: CASE_STUDY_VALIDATION_CODES.CASE_STUDY_INVALID_DATASET_ROLE,
      message: `Case study dataset has unsupported role: "${dataset.datasetRole}".`,
      field: 'datasetRole',
      datasetId: dataset.datasetId,
    });
  }

  if (!dataset.provenance) {
    errors.push({
      code: CASE_STUDY_VALIDATION_CODES.CASE_STUDY_MISSING_PROVENANCE,
      message: 'Case study dataset is missing provenance.',
      field: 'provenance',
      datasetId: dataset.datasetId,
    });
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Engineering Decision Validation
// ---------------------------------------------------------------------------

export function validateEngineeringDecision(
  decision: EngineeringDecision,
): readonly CaseStudyValidationError[] {
  const errors: CaseStudyValidationError[] = [];

  if (!decision.decisionId || decision.decisionId.trim() === '') {
    errors.push({
      code: CASE_STUDY_VALIDATION_CODES.CASE_STUDY_MISSING_DECISION_REFERENCE,
      message: 'Engineering decision is missing a decision ID.',
      field: 'decisionId',
      decisionId: decision.decisionId,
    });
  }

  if (!decision.caseStudyId || decision.caseStudyId.trim() === '') {
    errors.push({
      code: CASE_STUDY_VALIDATION_CODES.CASE_STUDY_MISSING_DECISION_REFERENCE,
      message: 'Engineering decision is missing a case study ID.',
      field: 'caseStudyId',
      decisionId: decision.decisionId,
    });
  }

  if (!CANONICAL_ENGINEERING_DECISION_TYPES.includes(decision.decisionType)) {
    errors.push({
      code: CASE_STUDY_VALIDATION_CODES.CASE_STUDY_INVALID_DECISION_TYPE,
      message: `Engineering decision has unsupported type: "${decision.decisionType}".`,
      field: 'decisionType',
      decisionId: decision.decisionId,
    });
  }

  if (!decision.provenance) {
    errors.push({
      code: CASE_STUDY_VALIDATION_CODES.CASE_STUDY_MISSING_PROVENANCE,
      message: 'Engineering decision is missing provenance.',
      field: 'provenance',
      decisionId: decision.decisionId,
    });
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Engineering Lesson Validation
// ---------------------------------------------------------------------------

export function validateEngineeringLesson(
  lesson: EngineeringLesson,
): readonly CaseStudyValidationError[] {
  const errors: CaseStudyValidationError[] = [];

  if (!lesson.lessonId || lesson.lessonId.trim() === '') {
    errors.push({
      code: CASE_STUDY_VALIDATION_CODES.CASE_STUDY_MISSING_LESSON_REFERENCE,
      message: 'Engineering lesson is missing a lesson ID.',
      field: 'lessonId',
      lessonId: lesson.lessonId,
    });
  }

  if (!lesson.caseStudyId || lesson.caseStudyId.trim() === '') {
    errors.push({
      code: CASE_STUDY_VALIDATION_CODES.CASE_STUDY_MISSING_LESSON_REFERENCE,
      message: 'Engineering lesson is missing a case study ID.',
      field: 'caseStudyId',
      lessonId: lesson.lessonId,
    });
  }

  if (!CANONICAL_CASE_STUDY_LESSON_TYPES.includes(lesson.lessonType)) {
    errors.push({
      code: CASE_STUDY_VALIDATION_CODES.CASE_STUDY_INVALID_LESSON_TYPE,
      message: `Engineering lesson has unsupported type: "${lesson.lessonType}".`,
      field: 'lessonType',
      lessonId: lesson.lessonId,
    });
  }

  if (!lesson.provenance) {
    errors.push({
      code: CASE_STUDY_VALIDATION_CODES.CASE_STUDY_MISSING_PROVENANCE,
      message: 'Engineering lesson is missing provenance.',
      field: 'provenance',
      lessonId: lesson.lessonId,
    });
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Case Study Registry Validation
// ---------------------------------------------------------------------------

export function validateCaseStudyRegistry(
  registry: CaseStudyRegistry,
): CaseStudyRegistryValidationResult {
  const errors: CaseStudyValidationError[] = [];

  if (!registry.registryId || registry.registryId.trim() === '') {
    errors.push({
      code: CASE_STUDY_VALIDATION_CODES.CASE_STUDY_EMPTY_REGISTRY,
      message: 'Registry is missing a registry ID.',
      field: 'registryId',
    });
  }

  if (!registry.caseStudies || registry.caseStudies.length === 0) {
    errors.push({
      code: CASE_STUDY_VALIDATION_CODES.CASE_STUDY_EMPTY_REGISTRY,
      message: 'Registry has no case studies.',
      field: 'caseStudies',
    });
  }

  if (registry.deterministic !== true) {
    errors.push({
      code: CASE_STUDY_VALIDATION_CODES.CASE_STUDY_INVALID_TRACE,
      message: 'Registry must declare deterministic: true.',
      field: 'deterministic',
    });
  }

  if (registry.randomUsed !== false) {
    errors.push({
      code: CASE_STUDY_VALIDATION_CODES.CASE_STUDY_INVALID_TRACE,
      message: 'Registry must declare randomUsed: false.',
      field: 'randomUsed',
    });
  }

  if (registry.timeDependency !== false) {
    errors.push({
      code: CASE_STUDY_VALIDATION_CODES.CASE_STUDY_INVALID_TRACE,
      message: 'Registry must declare timeDependency: false.',
      field: 'timeDependency',
    });
  }

  // Duplicate case study IDs
  const seenCsIds = new Set<string>();
  for (const cs of registry.caseStudies) {
    if (seenCsIds.has(cs.caseStudyId)) {
      errors.push({
        code: CASE_STUDY_VALIDATION_CODES.CASE_STUDY_DUPLICATE_ID,
        message: `Duplicate case study ID: "${cs.caseStudyId}".`,
        caseStudyId: cs.caseStudyId,
      });
    }
    seenCsIds.add(cs.caseStudyId);
  }

  // Duplicate case study titles
  const seenCsTitles = new Set<string>();
  for (const cs of registry.caseStudies) {
    if (seenCsTitles.has(cs.title)) {
      errors.push({
        code: CASE_STUDY_VALIDATION_CODES.CASE_STUDY_DUPLICATE_TITLE,
        message: `Duplicate case study title: "${cs.title}".`,
        field: 'title',
        caseStudyId: cs.caseStudyId,
      });
    }
    seenCsTitles.add(cs.title);
  }

  // Duplicate dataset IDs
  const seenDsIds = new Set<string>();
  for (const ds of registry.datasets) {
    if (seenDsIds.has(ds.datasetId)) {
      errors.push({
        code: CASE_STUDY_VALIDATION_CODES.CASE_STUDY_DATASET_DUPLICATE_ID,
        message: `Duplicate dataset ID: "${ds.datasetId}".`,
        datasetId: ds.datasetId,
      });
    }
    seenDsIds.add(ds.datasetId);
  }

  // Duplicate decision IDs
  const seenDecIds = new Set<string>();
  for (const dec of registry.decisions) {
    if (seenDecIds.has(dec.decisionId)) {
      errors.push({
        code: CASE_STUDY_VALIDATION_CODES.CASE_STUDY_DECISION_DUPLICATE_ID,
        message: `Duplicate decision ID: "${dec.decisionId}".`,
        decisionId: dec.decisionId,
      });
    }
    seenDecIds.add(dec.decisionId);
  }

  // Duplicate lesson IDs
  const seenLesIds = new Set<string>();
  for (const les of registry.lessons) {
    if (seenLesIds.has(les.lessonId)) {
      errors.push({
        code: CASE_STUDY_VALIDATION_CODES.CASE_STUDY_LESSON_DUPLICATE_ID,
        message: `Duplicate lesson ID: "${les.lessonId}".`,
        lessonId: les.lessonId,
      });
    }
    seenLesIds.add(les.lessonId);
  }

  // Validate each case study
  for (const cs of registry.caseStudies) {
    errors.push(...validateApplicationCaseStudy(cs));
  }

  // Validate each dataset
  for (const ds of registry.datasets) {
    errors.push(...validateCaseStudyDataset(ds));
  }

  // Validate each decision
  for (const dec of registry.decisions) {
    errors.push(...validateEngineeringDecision(dec));
  }

  // Validate each lesson
  for (const les of registry.lessons) {
    errors.push(...validateEngineeringLesson(les));
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'case_study_registry_composition',
  };
}

// ---------------------------------------------------------------------------
// Case Study Input Validation
// ---------------------------------------------------------------------------

export function validateCaseStudyInput(
  input: CaseStudyInput,
): CaseStudyInputValidationResult {
  const errors: CaseStudyValidationError[] = [];

  if (!input.caseStudies || input.caseStudies.length === 0) {
    errors.push({
      code: CASE_STUDY_VALIDATION_CODES.CASE_STUDY_EMPTY_REGISTRY,
      message: 'Input has no case studies.',
      field: 'caseStudies',
    });
  } else {
    for (const cs of input.caseStudies) {
      errors.push(...validateApplicationCaseStudy(cs));
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'case_study_input_composition',
  };
}

// ---------------------------------------------------------------------------
// Case Study Trace Validation
// ---------------------------------------------------------------------------

export function validateCaseStudyTrace(
  trace: CaseStudyTrace,
): CaseStudyTraceValidationResult {
  const errors: CaseStudyValidationError[] = [];

  if (!trace.traceId || trace.traceId.trim() === '') {
    errors.push({
      code: CASE_STUDY_VALIDATION_CODES.CASE_STUDY_INVALID_TRACE,
      message: 'Case study trace is missing a trace ID.',
      field: 'traceId',
    });
  }

  if (trace.deterministic !== true) {
    errors.push({
      code: CASE_STUDY_VALIDATION_CODES.CASE_STUDY_INVALID_TRACE,
      message: 'Case study trace must declare deterministic: true.',
      field: 'deterministic',
    });
  }

  if (trace.randomUsed !== false) {
    errors.push({
      code: CASE_STUDY_VALIDATION_CODES.CASE_STUDY_INVALID_TRACE,
      message: 'Case study trace must declare randomUsed: false.',
      field: 'randomUsed',
    });
  }

  if (trace.timeDependency !== false) {
    errors.push({
      code: CASE_STUDY_VALIDATION_CODES.CASE_STUDY_INVALID_TRACE,
      message: 'Case study trace must declare timeDependency: false.',
      field: 'timeDependency',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'case_study_trace_composition',
  };
}

// ---------------------------------------------------------------------------
// Application Artifact with Case Studies Validation
// ---------------------------------------------------------------------------

export function validateApplicationArtifactWithCaseStudies(
  registry: CaseStudyRegistry,
): readonly CaseStudyValidationError[] {
  const errors: CaseStudyValidationError[] = [];
  const registryResult = validateCaseStudyRegistry(registry);
  errors.push(...registryResult.errors);
  return errors;
}

/**
 * NV-1900-D7-OPT-08 — Engineering Judgment Validation Layer
 *
 * Deterministic validation for engineering judgment metadata.
 * Returns structured errors, never exceptions for expected validation failures.
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import type {
  EngineeringMistake,
  AdoptionPitfall,
  EngineeringJudgment,
  EngineeringAntiPattern,
  EngineeringJudgmentRegistry,
  EngineeringJudgmentTrace,
  EngineeringJudgmentInput,
  EngineeringJudgmentValidationError,
  EngineeringJudgmentRegistryValidationResult,
  EngineeringJudgmentInputValidationResult,
  EngineeringJudgmentTraceValidationResult,
} from './ApplicationAgentContract.ts';

import {
  CANONICAL_ENGINEERING_MISTAKE_TYPES,
  CANONICAL_ADOPTION_PITFALL_TYPES,
  CANONICAL_ENGINEERING_JUDGMENT_TYPES,
  CANONICAL_ENGINEERING_ANTI_PATTERN_TYPES,
  CANONICAL_ENGINEERING_JUDGMENT_SEVERITY,
  CANONICAL_ENGINEERING_JUDGMENT_STATUS,
  CANONICAL_APPLICATION_GOVERNANCE,
} from './ApplicationAgentContract.ts';

// ---------------------------------------------------------------------------
// Validation Error Codes
// ---------------------------------------------------------------------------

export const ENGINEERING_JUDGMENT_VALIDATION_CODES = {
  ENGINEERING_MISTAKE_DUPLICATE_ID: 'ENGINEERING_MISTAKE_DUPLICATE_ID',
  ENGINEERING_MISTAKE_DUPLICATE_TITLE: 'ENGINEERING_MISTAKE_DUPLICATE_TITLE',
  ENGINEERING_PITFALL_DUPLICATE_ID: 'ENGINEERING_PITFALL_DUPLICATE_ID',
  ENGINEERING_JUDGMENT_DUPLICATE_ID: 'ENGINEERING_JUDGMENT_DUPLICATE_ID',
  ENGINEERING_ANTI_PATTERN_DUPLICATE_ID: 'ENGINEERING_ANTI_PATTERN_DUPLICATE_ID',
  ENGINEERING_INVALID_MISTAKE_TYPE: 'ENGINEERING_INVALID_MISTAKE_TYPE',
  ENGINEERING_INVALID_PITFALL_TYPE: 'ENGINEERING_INVALID_PITFALL_TYPE',
  ENGINEERING_INVALID_JUDGMENT_TYPE: 'ENGINEERING_INVALID_JUDGMENT_TYPE',
  ENGINEERING_INVALID_ANTI_PATTERN_TYPE: 'ENGINEERING_INVALID_ANTI_PATTERN_TYPE',
  ENGINEERING_INVALID_SEVERITY: 'ENGINEERING_INVALID_SEVERITY',
  ENGINEERING_INVALID_STATUS: 'ENGINEERING_INVALID_STATUS',
  ENGINEERING_INVALID_GOVERNANCE: 'ENGINEERING_INVALID_GOVERNANCE',
  ENGINEERING_MISSING_PROVENANCE: 'ENGINEERING_MISSING_PROVENANCE',
  ENGINEERING_MISSING_PROVIDER: 'ENGINEERING_MISSING_PROVIDER',
  ENGINEERING_MISSING_RATIONALE: 'ENGINEERING_MISSING_RATIONALE',
  ENGINEERING_MISSING_APPLICATION_REFERENCE: 'ENGINEERING_MISSING_APPLICATION_REFERENCE',
  ENGINEERING_MISSING_KNOWLEDGE_REFERENCE: 'ENGINEERING_MISSING_KNOWLEDGE_REFERENCE',
  ENGINEERING_MISSING_CASE_STUDY_REFERENCE: 'ENGINEERING_MISSING_CASE_STUDY_REFERENCE',
  ENGINEERING_MISSING_MISTAKE_ID: 'ENGINEERING_MISSING_MISTAKE_ID',
  ENGINEERING_MISSING_TITLE: 'ENGINEERING_MISSING_TITLE',
  ENGINEERING_EMPTY_REGISTRY: 'ENGINEERING_EMPTY_REGISTRY',
  ENGINEERING_INVALID_TRACE: 'ENGINEERING_INVALID_TRACE',
  ENGINEERING_REGISTRY_INCONSISTENCY: 'ENGINEERING_REGISTRY_INCONSISTENCY',
} as const;

// ---------------------------------------------------------------------------
// Single Mistake Validation
// ---------------------------------------------------------------------------

export function validateEngineeringMistake(
  mistake: EngineeringMistake,
): readonly EngineeringJudgmentValidationError[] {
  const errors: EngineeringJudgmentValidationError[] = [];

  if (!mistake.mistakeId || mistake.mistakeId.trim() === '') {
    errors.push({
      code: ENGINEERING_JUDGMENT_VALIDATION_CODES.ENGINEERING_MISSING_MISTAKE_ID,
      message: 'Engineering mistake is missing a mistake ID.',
      field: 'mistakeId',
      mistakeId: mistake.mistakeId,
    });
  }

  if (!mistake.title || mistake.title.trim() === '') {
    errors.push({
      code: ENGINEERING_JUDGMENT_VALIDATION_CODES.ENGINEERING_MISSING_TITLE,
      message: 'Engineering mistake is missing a title.',
      field: 'title',
      mistakeId: mistake.mistakeId,
    });
  }

  if (!CANONICAL_ENGINEERING_MISTAKE_TYPES.includes(mistake.mistakeType)) {
    errors.push({
      code: ENGINEERING_JUDGMENT_VALIDATION_CODES.ENGINEERING_INVALID_MISTAKE_TYPE,
      message: `Engineering mistake has unsupported type: "${mistake.mistakeType}".`,
      field: 'mistakeType',
      mistakeId: mistake.mistakeId,
    });
  }

  if (!CANONICAL_ENGINEERING_JUDGMENT_SEVERITY.includes(mistake.severity)) {
    errors.push({
      code: ENGINEERING_JUDGMENT_VALIDATION_CODES.ENGINEERING_INVALID_SEVERITY,
      message: `Engineering mistake has unsupported severity: "${mistake.severity}".`,
      field: 'severity',
      mistakeId: mistake.mistakeId,
    });
  }

  if (!CANONICAL_ENGINEERING_JUDGMENT_STATUS.includes(mistake.status)) {
    errors.push({
      code: ENGINEERING_JUDGMENT_VALIDATION_CODES.ENGINEERING_INVALID_STATUS,
      message: `Engineering mistake has unsupported status: "${mistake.status}".`,
      field: 'status',
      mistakeId: mistake.mistakeId,
    });
  }

  if (!mistake.applicationArtifactId || mistake.applicationArtifactId.trim() === '') {
    errors.push({
      code: ENGINEERING_JUDGMENT_VALIDATION_CODES.ENGINEERING_MISSING_APPLICATION_REFERENCE,
      message: 'Engineering mistake is missing applicationArtifactId.',
      field: 'applicationArtifactId',
      mistakeId: mistake.mistakeId,
    });
  }

  if (!mistake.knowledgeArtifactId || mistake.knowledgeArtifactId.trim() === '') {
    errors.push({
      code: ENGINEERING_JUDGMENT_VALIDATION_CODES.ENGINEERING_MISSING_KNOWLEDGE_REFERENCE,
      message: 'Engineering mistake is missing knowledgeArtifactId.',
      field: 'knowledgeArtifactId',
      mistakeId: mistake.mistakeId,
    });
  }

  if (!mistake.caseStudyId || mistake.caseStudyId.trim() === '') {
    errors.push({
      code: ENGINEERING_JUDGMENT_VALIDATION_CODES.ENGINEERING_MISSING_CASE_STUDY_REFERENCE,
      message: 'Engineering mistake is missing caseStudyId.',
      field: 'caseStudyId',
      mistakeId: mistake.mistakeId,
    });
  }

  if (!mistake.provenance) {
    errors.push({
      code: ENGINEERING_JUDGMENT_VALIDATION_CODES.ENGINEERING_MISSING_PROVENANCE,
      message: 'Engineering mistake is missing provenance.',
      field: 'provenance',
      mistakeId: mistake.mistakeId,
    });
  } else {
    if (!mistake.provenance.providedBy || mistake.provenance.providedBy.trim() === '') {
      errors.push({
        code: ENGINEERING_JUDGMENT_VALIDATION_CODES.ENGINEERING_MISSING_PROVIDER,
        message: 'Mistake provenance is missing providedBy.',
        field: 'provenance.providedBy',
        mistakeId: mistake.mistakeId,
      });
    }

    if (!mistake.provenance.rationale || mistake.provenance.rationale.trim() === '') {
      errors.push({
        code: ENGINEERING_JUDGMENT_VALIDATION_CODES.ENGINEERING_MISSING_RATIONALE,
        message: 'Mistake provenance is missing rationale.',
        field: 'provenance.rationale',
        mistakeId: mistake.mistakeId,
      });
    }

    if (!CANONICAL_APPLICATION_GOVERNANCE.includes(mistake.provenance.governanceStatus)) {
      errors.push({
        code: ENGINEERING_JUDGMENT_VALIDATION_CODES.ENGINEERING_INVALID_GOVERNANCE,
        message: `Mistake provenance has invalid governance status: "${mistake.provenance.governanceStatus}".`,
        field: 'provenance.governanceStatus',
        mistakeId: mistake.mistakeId,
      });
    }
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Adoption Pitfall Validation
// ---------------------------------------------------------------------------

export function validateAdoptionPitfall(
  pitfall: AdoptionPitfall,
): readonly EngineeringJudgmentValidationError[] {
  const errors: EngineeringJudgmentValidationError[] = [];

  if (!pitfall.pitfallId || pitfall.pitfallId.trim() === '') {
    errors.push({
      code: ENGINEERING_JUDGMENT_VALIDATION_CODES.ENGINEERING_PITFALL_DUPLICATE_ID,
      message: 'Adoption pitfall is missing a pitfall ID.',
      field: 'pitfallId',
      pitfallId: pitfall.pitfallId,
    });
  }

  if (!CANONICAL_ADOPTION_PITFALL_TYPES.includes(pitfall.pitfallType)) {
    errors.push({
      code: ENGINEERING_JUDGMENT_VALIDATION_CODES.ENGINEERING_INVALID_PITFALL_TYPE,
      message: `Adoption pitfall has unsupported type: "${pitfall.pitfallType}".`,
      field: 'pitfallType',
      pitfallId: pitfall.pitfallId,
    });
  }

  if (!pitfall.provenance) {
    errors.push({
      code: ENGINEERING_JUDGMENT_VALIDATION_CODES.ENGINEERING_MISSING_PROVENANCE,
      message: 'Adoption pitfall is missing provenance.',
      field: 'provenance',
      pitfallId: pitfall.pitfallId,
    });
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Engineering Judgment Validation
// ---------------------------------------------------------------------------

export function validateEngineeringJudgmentEntry(
  judgment: EngineeringJudgment,
): readonly EngineeringJudgmentValidationError[] {
  const errors: EngineeringJudgmentValidationError[] = [];

  if (!judgment.judgmentId || judgment.judgmentId.trim() === '') {
    errors.push({
      code: ENGINEERING_JUDGMENT_VALIDATION_CODES.ENGINEERING_JUDGMENT_DUPLICATE_ID,
      message: 'Engineering judgment is missing a judgment ID.',
      field: 'judgmentId',
      judgmentId: judgment.judgmentId,
    });
  }

  if (!CANONICAL_ENGINEERING_JUDGMENT_TYPES.includes(judgment.judgmentType)) {
    errors.push({
      code: ENGINEERING_JUDGMENT_VALIDATION_CODES.ENGINEERING_INVALID_JUDGMENT_TYPE,
      message: `Engineering judgment has unsupported type: "${judgment.judgmentType}".`,
      field: 'judgmentType',
      judgmentId: judgment.judgmentId,
    });
  }

  if (!judgment.provenance) {
    errors.push({
      code: ENGINEERING_JUDGMENT_VALIDATION_CODES.ENGINEERING_MISSING_PROVENANCE,
      message: 'Engineering judgment is missing provenance.',
      field: 'provenance',
      judgmentId: judgment.judgmentId,
    });
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Engineering Anti-Pattern Validation
// ---------------------------------------------------------------------------

export function validateEngineeringAntiPattern(
  antiPattern: EngineeringAntiPattern,
): readonly EngineeringJudgmentValidationError[] {
  const errors: EngineeringJudgmentValidationError[] = [];

  if (!antiPattern.antiPatternId || antiPattern.antiPatternId.trim() === '') {
    errors.push({
      code: ENGINEERING_JUDGMENT_VALIDATION_CODES.ENGINEERING_ANTI_PATTERN_DUPLICATE_ID,
      message: 'Engineering anti-pattern is missing an anti-pattern ID.',
      field: 'antiPatternId',
      antiPatternId: antiPattern.antiPatternId,
    });
  }

  if (!CANONICAL_ENGINEERING_ANTI_PATTERN_TYPES.includes(antiPattern.antiPatternType)) {
    errors.push({
      code: ENGINEERING_JUDGMENT_VALIDATION_CODES.ENGINEERING_INVALID_ANTI_PATTERN_TYPE,
      message: `Engineering anti-pattern has unsupported type: "${antiPattern.antiPatternType}".`,
      field: 'antiPatternType',
      antiPatternId: antiPattern.antiPatternId,
    });
  }

  if (!antiPattern.provenance) {
    errors.push({
      code: ENGINEERING_JUDGMENT_VALIDATION_CODES.ENGINEERING_MISSING_PROVENANCE,
      message: 'Engineering anti-pattern is missing provenance.',
      field: 'provenance',
      antiPatternId: antiPattern.antiPatternId,
    });
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Engineering Judgment Registry Validation
// ---------------------------------------------------------------------------

export function validateEngineeringJudgmentRegistry(
  registry: EngineeringJudgmentRegistry,
): EngineeringJudgmentRegistryValidationResult {
  const errors: EngineeringJudgmentValidationError[] = [];

  if (!registry.registryId || registry.registryId.trim() === '') {
    errors.push({
      code: ENGINEERING_JUDGMENT_VALIDATION_CODES.ENGINEERING_EMPTY_REGISTRY,
      message: 'Registry is missing a registry ID.',
      field: 'registryId',
    });
  }

  if (!registry.mistakes || registry.mistakes.length === 0) {
    errors.push({
      code: ENGINEERING_JUDGMENT_VALIDATION_CODES.ENGINEERING_EMPTY_REGISTRY,
      message: 'Registry has no mistakes.',
      field: 'mistakes',
    });
  }

  if (registry.deterministic !== true) {
    errors.push({
      code: ENGINEERING_JUDGMENT_VALIDATION_CODES.ENGINEERING_INVALID_TRACE,
      message: 'Registry must declare deterministic: true.',
      field: 'deterministic',
    });
  }

  if (registry.randomUsed !== false) {
    errors.push({
      code: ENGINEERING_JUDGMENT_VALIDATION_CODES.ENGINEERING_INVALID_TRACE,
      message: 'Registry must declare randomUsed: false.',
      field: 'randomUsed',
    });
  }

  if (registry.timeDependency !== false) {
    errors.push({
      code: ENGINEERING_JUDGMENT_VALIDATION_CODES.ENGINEERING_INVALID_TRACE,
      message: 'Registry must declare timeDependency: false.',
      field: 'timeDependency',
    });
  }

  // Duplicate mistake IDs
  const seenMistakeIds = new Set<string>();
  for (const m of registry.mistakes) {
    if (seenMistakeIds.has(m.mistakeId)) {
      errors.push({
        code: ENGINEERING_JUDGMENT_VALIDATION_CODES.ENGINEERING_MISTAKE_DUPLICATE_ID,
        message: `Duplicate mistake ID: "${m.mistakeId}".`,
        mistakeId: m.mistakeId,
      });
    }
    seenMistakeIds.add(m.mistakeId);
  }

  // Duplicate mistake titles
  const seenMistakeTitles = new Set<string>();
  for (const m of registry.mistakes) {
    if (seenMistakeTitles.has(m.title)) {
      errors.push({
        code: ENGINEERING_JUDGMENT_VALIDATION_CODES.ENGINEERING_MISTAKE_DUPLICATE_TITLE,
        message: `Duplicate mistake title: "${m.title}".`,
        field: 'title',
        mistakeId: m.mistakeId,
      });
    }
    seenMistakeTitles.add(m.title);
  }

  // Duplicate pitfall IDs
  const seenPitfallIds = new Set<string>();
  for (const p of registry.pitfalls) {
    if (seenPitfallIds.has(p.pitfallId)) {
      errors.push({
        code: ENGINEERING_JUDGMENT_VALIDATION_CODES.ENGINEERING_PITFALL_DUPLICATE_ID,
        message: `Duplicate pitfall ID: "${p.pitfallId}".`,
        pitfallId: p.pitfallId,
      });
    }
    seenPitfallIds.add(p.pitfallId);
  }

  // Duplicate judgment IDs
  const seenJudgmentIds = new Set<string>();
  for (const j of registry.judgments) {
    if (seenJudgmentIds.has(j.judgmentId)) {
      errors.push({
        code: ENGINEERING_JUDGMENT_VALIDATION_CODES.ENGINEERING_JUDGMENT_DUPLICATE_ID,
        message: `Duplicate judgment ID: "${j.judgmentId}".`,
        judgmentId: j.judgmentId,
      });
    }
    seenJudgmentIds.add(j.judgmentId);
  }

  // Duplicate anti-pattern IDs
  const seenAntiPatternIds = new Set<string>();
  for (const a of registry.antiPatterns) {
    if (seenAntiPatternIds.has(a.antiPatternId)) {
      errors.push({
        code: ENGINEERING_JUDGMENT_VALIDATION_CODES.ENGINEERING_ANTI_PATTERN_DUPLICATE_ID,
        message: `Duplicate anti-pattern ID: "${a.antiPatternId}".`,
        antiPatternId: a.antiPatternId,
      });
    }
    seenAntiPatternIds.add(a.antiPatternId);
  }

  // Validate each mistake
  for (const m of registry.mistakes) {
    errors.push(...validateEngineeringMistake(m));
  }

  // Validate each pitfall
  for (const p of registry.pitfalls) {
    errors.push(...validateAdoptionPitfall(p));
  }

  // Validate each judgment
  for (const j of registry.judgments) {
    errors.push(...validateEngineeringJudgmentEntry(j));
  }

  // Validate each anti-pattern
  for (const a of registry.antiPatterns) {
    errors.push(...validateEngineeringAntiPattern(a));
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'engineering_judgment_registry_composition',
  };
}

// ---------------------------------------------------------------------------
// Engineering Judgment Input Validation
// ---------------------------------------------------------------------------

export function validateEngineeringJudgmentInput(
  input: EngineeringJudgmentInput,
): EngineeringJudgmentInputValidationResult {
  const errors: EngineeringJudgmentValidationError[] = [];

  if (!input.mistakes || input.mistakes.length === 0) {
    errors.push({
      code: ENGINEERING_JUDGMENT_VALIDATION_CODES.ENGINEERING_EMPTY_REGISTRY,
      message: 'Input has no mistakes.',
      field: 'mistakes',
    });
  } else {
    for (const m of input.mistakes) {
      errors.push(...validateEngineeringMistake(m));
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'engineering_judgment_input_composition',
  };
}

// ---------------------------------------------------------------------------
// Engineering Judgment Trace Validation
// ---------------------------------------------------------------------------

export function validateEngineeringJudgmentTrace(
  trace: EngineeringJudgmentTrace,
): EngineeringJudgmentTraceValidationResult {
  const errors: EngineeringJudgmentValidationError[] = [];

  if (!trace.traceId || trace.traceId.trim() === '') {
    errors.push({
      code: ENGINEERING_JUDGMENT_VALIDATION_CODES.ENGINEERING_INVALID_TRACE,
      message: 'Engineering judgment trace is missing a trace ID.',
      field: 'traceId',
    });
  }

  if (trace.deterministic !== true) {
    errors.push({
      code: ENGINEERING_JUDGMENT_VALIDATION_CODES.ENGINEERING_INVALID_TRACE,
      message: 'Engineering judgment trace must declare deterministic: true.',
      field: 'deterministic',
    });
  }

  if (trace.randomUsed !== false) {
    errors.push({
      code: ENGINEERING_JUDGMENT_VALIDATION_CODES.ENGINEERING_INVALID_TRACE,
      message: 'Engineering judgment trace must declare randomUsed: false.',
      field: 'randomUsed',
    });
  }

  if (trace.timeDependency !== false) {
    errors.push({
      code: ENGINEERING_JUDGMENT_VALIDATION_CODES.ENGINEERING_INVALID_TRACE,
      message: 'Engineering judgment trace must declare timeDependency: false.',
      field: 'timeDependency',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'engineering_judgment_trace_composition',
  };
}

// ---------------------------------------------------------------------------
// Application Artifact with Engineering Judgment Validation
// ---------------------------------------------------------------------------

export function validateApplicationArtifactWithEngineeringJudgment(
  registry: EngineeringJudgmentRegistry,
): readonly EngineeringJudgmentValidationError[] {
  const errors: EngineeringJudgmentValidationError[] = [];
  const registryResult = validateEngineeringJudgmentRegistry(registry);
  errors.push(...registryResult.errors);
  return errors;
}

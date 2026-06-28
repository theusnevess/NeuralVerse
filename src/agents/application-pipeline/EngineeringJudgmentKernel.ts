/**
 * NV-1900-D7-OPT-08 — Common Adoption Mistakes & Engineering Judgment Kernel
 *
 * Deterministic orchestration functions for engineering judgment metadata.
 * Produces mistakes, pitfalls, judgments, anti-patterns, traces, and registries.
 *
 * This module never:
 * - Diagnoses engineering mistakes
 * - Detects anti-patterns automatically
 * - Recommends corrections
 * - Evaluates users
 * - Stores educational content
 * - Generates markdown
 * - Accesses filesystem
 * - Performs network requests
 * - Calls external APIs
 *
 * Engineering judgment metadata only.
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import type {
  EngineeringMistake,
  EngineeringJudgmentProvenance,
  AdoptionPitfall,
  EngineeringJudgment,
  EngineeringAntiPattern,
  EngineeringJudgmentDecision,
  EngineeringJudgmentTrace,
  EngineeringJudgmentRegistry,
  EngineeringJudgmentRegistryMetadata,
  EngineeringJudgmentInput,
  EngineeringMistakeType,
  AdoptionPitfallType,
  EngineeringJudgmentType,
  EngineeringAntiPatternType,
  EngineeringJudgmentSeverity,
  EngineeringJudgmentStatus,
  ApplicationGovernanceStatus,
  ApplicationNode,
  ApplicationArtifactWithEngineeringJudgment,
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
// Engineering Judgment Provenance Composition
// ---------------------------------------------------------------------------

export function composeEngineeringJudgmentProvenance(params: {
  readonly providedBy: string;
  readonly rationale: string;
  readonly reviewedBy: string;
  readonly reviewDate: string;
  readonly governanceStatus: ApplicationGovernanceStatus;
}): EngineeringJudgmentProvenance {
  return {
    providedBy: params.providedBy,
    rationale: params.rationale,
    reviewedBy: params.reviewedBy,
    reviewDate: params.reviewDate,
    governanceStatus: params.governanceStatus,
  };
}

// ---------------------------------------------------------------------------
// Engineering Mistake Composition
// ---------------------------------------------------------------------------

export function composeEngineeringMistake(params: {
  readonly mistakeId: string;
  readonly title: string;
  readonly description: string;
  readonly mistakeType: EngineeringMistakeType;
  readonly applicationArtifactId: string;
  readonly knowledgeArtifactId: string;
  readonly caseStudyId: string;
  readonly severity: EngineeringJudgmentSeverity;
  readonly status: EngineeringJudgmentStatus;
  readonly provenance: EngineeringJudgmentProvenance;
}): EngineeringMistake {
  return {
    mistakeId: params.mistakeId,
    title: params.title,
    description: params.description,
    mistakeType: params.mistakeType,
    applicationArtifactId: params.applicationArtifactId,
    knowledgeArtifactId: params.knowledgeArtifactId,
    caseStudyId: params.caseStudyId,
    severity: params.severity,
    status: params.status,
    provenance: params.provenance,
  };
}

// ---------------------------------------------------------------------------
// Adoption Pitfall Composition
// ---------------------------------------------------------------------------

export function composeAdoptionPitfall(params: {
  readonly pitfallId: string;
  readonly mistakeId: string;
  readonly pitfallType: AdoptionPitfallType;
  readonly description: string;
  readonly provenance: EngineeringJudgmentProvenance;
}): AdoptionPitfall {
  return {
    pitfallId: params.pitfallId,
    mistakeId: params.mistakeId,
    pitfallType: params.pitfallType,
    description: params.description,
    provenance: params.provenance,
  };
}

// ---------------------------------------------------------------------------
// Engineering Judgment Composition
// ---------------------------------------------------------------------------

export function composeEngineeringJudgment(params: {
  readonly judgmentId: string;
  readonly mistakeId: string;
  readonly judgmentType: EngineeringJudgmentType;
  readonly description: string;
  readonly provenance: EngineeringJudgmentProvenance;
}): EngineeringJudgment {
  return {
    judgmentId: params.judgmentId,
    mistakeId: params.mistakeId,
    judgmentType: params.judgmentType,
    description: params.description,
    provenance: params.provenance,
  };
}

// ---------------------------------------------------------------------------
// Engineering Anti-Pattern Composition
// ---------------------------------------------------------------------------

export function composeEngineeringAntiPattern(params: {
  readonly antiPatternId: string;
  readonly mistakeId: string;
  readonly antiPatternType: EngineeringAntiPatternType;
  readonly description: string;
  readonly provenance: EngineeringJudgmentProvenance;
}): EngineeringAntiPattern {
  return {
    antiPatternId: params.antiPatternId,
    mistakeId: params.mistakeId,
    antiPatternType: params.antiPatternType,
    description: params.description,
    provenance: params.provenance,
  };
}

// ---------------------------------------------------------------------------
// Engineering Judgment Decision Composition
// ---------------------------------------------------------------------------

function _composeEngineeringJudgmentDecision(
  mistakeId: string,
  validationPassed: boolean,
  validationErrors: readonly string[],
): EngineeringJudgmentDecision {
  return {
    decisionId: `_decision_${mistakeId}`,
    mistakeId,
    validationPassed,
    validationErrors,
  };
}

// ---------------------------------------------------------------------------
// Engineering Judgment Trace Composition
// ---------------------------------------------------------------------------

export function composeEngineeringJudgmentTrace(params: {
  readonly traceId: string;
  readonly decisions: readonly EngineeringJudgmentDecision[];
  readonly registryVersion: string;
  readonly compositionVersion: string;
}): EngineeringJudgmentTrace {
  return {
    traceId: params.traceId,
    decisionCount: params.decisions.length,
    validationCount: params.decisions.filter((d) => d.validationPassed).length,
    registryVersion: params.registryVersion,
    compositionVersion: params.compositionVersion,
    decisions: params.decisions,
    deterministic: true,
    generatedFrom: 'deterministic_engineering_judgment_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Deterministic Sort Comparators
// ---------------------------------------------------------------------------

function _compareMistake(
  a: EngineeringMistake,
  b: EngineeringMistake,
): number {
  if (a.mistakeId < b.mistakeId) return -1;
  if (a.mistakeId > b.mistakeId) return 1;
  if (a.mistakeType < b.mistakeType) return -1;
  if (a.mistakeType > b.mistakeType) return 1;
  if (a.title < b.title) return -1;
  if (a.title > b.title) return 1;
  return 0;
}

function _comparePitfall(
  a: AdoptionPitfall,
  b: AdoptionPitfall,
): number {
  if (a.mistakeId < b.mistakeId) return -1;
  if (a.mistakeId > b.mistakeId) return 1;
  if (a.pitfallType < b.pitfallType) return -1;
  if (a.pitfallType > b.pitfallType) return 1;
  if (a.pitfallId < b.pitfallId) return -1;
  if (a.pitfallId > b.pitfallId) return 1;
  return 0;
}

function _compareJudgment(
  a: EngineeringJudgment,
  b: EngineeringJudgment,
): number {
  if (a.mistakeId < b.mistakeId) return -1;
  if (a.mistakeId > b.mistakeId) return 1;
  if (a.judgmentType < b.judgmentType) return -1;
  if (a.judgmentType > b.judgmentType) return 1;
  if (a.judgmentId < b.judgmentId) return -1;
  if (a.judgmentId > b.judgmentId) return 1;
  return 0;
}

function _compareAntiPattern(
  a: EngineeringAntiPattern,
  b: EngineeringAntiPattern,
): number {
  if (a.mistakeId < b.mistakeId) return -1;
  if (a.mistakeId > b.mistakeId) return 1;
  if (a.antiPatternType < b.antiPatternType) return -1;
  if (a.antiPatternType > b.antiPatternType) return 1;
  if (a.antiPatternId < b.antiPatternId) return -1;
  if (a.antiPatternId > b.antiPatternId) return 1;
  return 0;
}

// ---------------------------------------------------------------------------
// Engineering Judgment Registry Composition
// ---------------------------------------------------------------------------

export function composeEngineeringJudgmentRegistry(
  mistakes: readonly EngineeringMistake[],
  pitfalls: readonly AdoptionPitfall[],
  judgments: readonly EngineeringJudgment[],
  antiPatterns: readonly EngineeringAntiPattern[],
): EngineeringJudgmentRegistry {
  const sortedMistakes = [...mistakes].sort(_compareMistake);
  const sortedPitfalls = [...pitfalls].sort(_comparePitfall);
  const sortedJudgments = [...judgments].sort(_compareJudgment);
  const sortedAntiPatterns = [...antiPatterns].sort(_compareAntiPattern);

  const types = new Set(sortedMistakes.map((m) => m.mistakeType));

  const metadata: EngineeringJudgmentRegistryMetadata = {
    registryId: `_registry_${sortedMistakes.length}_${sortedPitfalls.length}_${sortedJudgments.length}_${sortedAntiPatterns.length}`,
    mistakeCount: sortedMistakes.length,
    pitfallCount: sortedPitfalls.length,
    judgmentCount: sortedJudgments.length,
    antiPatternCount: sortedAntiPatterns.length,
    typeCount: types.size,
  };

  return {
    registryId: metadata.registryId,
    mistakes: sortedMistakes,
    pitfalls: sortedPitfalls,
    judgments: sortedJudgments,
    antiPatterns: sortedAntiPatterns,
    metadata,
    trace: {
      traceId: `_trace_${sortedMistakes.length}`,
      decisionCount: 0,
      validationCount: 0,
      registryVersion: '1.0.0',
      compositionVersion: '1.0.0',
      decisions: [],
      deterministic: true,
      generatedFrom: 'deterministic_engineering_judgment_kernel',
      randomUsed: false,
      timeDependency: false,
    },
    deterministic: true,
    generatedFrom: 'deterministic_engineering_judgment_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Engineering Judgment Registry From Input Composition
// ---------------------------------------------------------------------------

export function composeEngineeringJudgmentRegistryFromInput(
  input: EngineeringJudgmentInput,
): EngineeringJudgmentRegistry {
  return composeEngineeringJudgmentRegistry(
    input.mistakes,
    input.pitfalls,
    input.judgments,
    input.antiPatterns,
  );
}

// ---------------------------------------------------------------------------
// Engineering Judgment Composition (Main Entry Point)
// ---------------------------------------------------------------------------

export function composeEngineeringJudgments(
  input: EngineeringJudgmentInput,
): EngineeringJudgmentRegistry {
  const decisions = input.mistakes.map((mistake) => {
    const errors = _validateMistakeForDecision(mistake);
    return _composeEngineeringJudgmentDecision(mistake.mistakeId, errors.length === 0, errors);
  });

  const registry = composeEngineeringJudgmentRegistry(
    input.mistakes,
    input.pitfalls,
    input.judgments,
    input.antiPatterns,
  );

  return {
    ...registry,
    trace: composeEngineeringJudgmentTrace({
      traceId: `_trace_${input.mistakes.length}`,
      decisions,
      registryVersion: '1.0.0',
      compositionVersion: '1.0.0',
    }),
  };
}

// ---------------------------------------------------------------------------
// Application Artifact with Engineering Judgment Composition
// ---------------------------------------------------------------------------

export function composeApplicationArtifactWithEngineeringJudgment(params: {
  readonly applicationNode: ApplicationNode;
  readonly engineeringJudgmentRegistry: EngineeringJudgmentRegistry;
}): ApplicationArtifactWithEngineeringJudgment {
  return {
    applicationNode: { ...params.applicationNode },
    engineeringJudgmentRegistry: { ...params.engineeringJudgmentRegistry },
    deterministic: true,
    generatedFrom: 'deterministic_engineering_judgment_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Engineering Judgment Decision Validation
// ---------------------------------------------------------------------------

function _validateMistakeForDecision(
  mistake: EngineeringMistake,
): readonly string[] {
  const errors: string[] = [];

  if (!mistake.mistakeId || mistake.mistakeId.trim() === '') {
    errors.push('ENGINEERING_MISSING_MISTAKE_ID');
  }

  if (!mistake.title || mistake.title.trim() === '') {
    errors.push('ENGINEERING_MISSING_TITLE');
  }

  if (!CANONICAL_ENGINEERING_MISTAKE_TYPES.includes(mistake.mistakeType)) {
    errors.push('ENGINEERING_INVALID_MISTAKE_TYPE');
  }

  if (!CANONICAL_ENGINEERING_JUDGMENT_SEVERITY.includes(mistake.severity)) {
    errors.push('ENGINEERING_INVALID_SEVERITY');
  }

  if (!CANONICAL_ENGINEERING_JUDGMENT_STATUS.includes(mistake.status)) {
    errors.push('ENGINEERING_INVALID_STATUS');
  }

  if (!mistake.provenance) {
    errors.push('ENGINEERING_MISSING_PROVENANCE');
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Helper Functions — Type Guards
// ---------------------------------------------------------------------------

export function isSupportedEngineeringMistakeType(
  mistakeType: string,
): mistakeType is EngineeringMistakeType {
  return CANONICAL_ENGINEERING_MISTAKE_TYPES.includes(mistakeType as EngineeringMistakeType);
}

export function isSupportedAdoptionPitfallType(
  pitfallType: string,
): pitfallType is AdoptionPitfallType {
  return CANONICAL_ADOPTION_PITFALL_TYPES.includes(pitfallType as AdoptionPitfallType);
}

export function isSupportedEngineeringJudgmentType(
  judgmentType: string,
): judgmentType is EngineeringJudgmentType {
  return CANONICAL_ENGINEERING_JUDGMENT_TYPES.includes(judgmentType as EngineeringJudgmentType);
}

export function isSupportedEngineeringAntiPatternType(
  antiPatternType: string,
): antiPatternType is EngineeringAntiPatternType {
  return CANONICAL_ENGINEERING_ANTI_PATTERN_TYPES.includes(antiPatternType as EngineeringAntiPatternType);
}

export function isSupportedEngineeringJudgmentSeverity(
  severity: string,
): severity is EngineeringJudgmentSeverity {
  return CANONICAL_ENGINEERING_JUDGMENT_SEVERITY.includes(severity as EngineeringJudgmentSeverity);
}

export function isSupportedEngineeringJudgmentStatus(
  status: string,
): status is EngineeringJudgmentStatus {
  return CANONICAL_ENGINEERING_JUDGMENT_STATUS.includes(status as EngineeringJudgmentStatus);
}

export function isSupportedEngineeringJudgmentGovernance(
  governanceStatus: string,
): governanceStatus is ApplicationGovernanceStatus {
  return CANONICAL_APPLICATION_GOVERNANCE.includes(
    governanceStatus as ApplicationGovernanceStatus,
  );
}

// ---------------------------------------------------------------------------
// Helper Functions — Canonical Getters
// ---------------------------------------------------------------------------

export function getCanonicalEngineeringMistakeTypes(): readonly EngineeringMistakeType[] {
  return CANONICAL_ENGINEERING_MISTAKE_TYPES;
}

export function getCanonicalAdoptionPitfallTypes(): readonly AdoptionPitfallType[] {
  return CANONICAL_ADOPTION_PITFALL_TYPES;
}

export function getCanonicalEngineeringJudgmentTypes(): readonly EngineeringJudgmentType[] {
  return CANONICAL_ENGINEERING_JUDGMENT_TYPES;
}

export function getCanonicalEngineeringAntiPatternTypes(): readonly EngineeringAntiPatternType[] {
  return CANONICAL_ENGINEERING_ANTI_PATTERN_TYPES;
}

export function getCanonicalEngineeringJudgmentSeverities(): readonly EngineeringJudgmentSeverity[] {
  return CANONICAL_ENGINEERING_JUDGMENT_SEVERITY;
}

export function getCanonicalEngineeringJudgmentStatuses(): readonly EngineeringJudgmentStatus[] {
  return CANONICAL_ENGINEERING_JUDGMENT_STATUS;
}

/**
 * NV-2100-D9-OPT-09 — Misconception Curiosity Validation Layer
 *
 * Deterministic validation for misconception curiosity metadata.
 * Returns structured errors, never exceptions for expected validation failures.
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import type {
  MisconceptionCard,
  AssessmentReinforcementReference,
  CorrectiveInsight,
  MisconceptionRelationship,
  MisconceptionRegistry,
  MisconceptionInput,
  MisconceptionCuriosityTrace,
  CuriosityArtifactWithMisconceptions,
  MisconceptionCuriosityValidationError,
  MisconceptionRegistryValidationResult,
  MisconceptionInputValidationResult,
  MisconceptionTraceValidationResult,
  CuriosityArtifactWithMisconceptionsValidationResult,
} from './CuriosityAgentContract.ts';

import {
  CANONICAL_MISCONCEPTION_CARD_TYPES,
  CANONICAL_REINFORCEMENT_REFERENCE_TYPES,
  CANONICAL_MISCONCEPTION_IMPORTANCE,
  CANONICAL_CORRECTIVE_OUTCOMES,
  CANONICAL_MISCONCEPTION_CURIOSITY_STATUS,
  CANONICAL_CURIOSITY_GOVERNANCE,
} from './CuriosityAgentContract.ts';

// ---------------------------------------------------------------------------
// Validation Error Codes
// ---------------------------------------------------------------------------

export const MISCONCEPTION_CURIOSITY_VALIDATION_CODES = {
  MISCONCEPTION_CURIOSITY_DUPLICATE_ID: 'MISCONCEPTION_CURIOSITY_DUPLICATE_ID',
  MISCONCEPTION_CURIOSITY_DUPLICATE_TITLE: 'MISCONCEPTION_CURIOSITY_DUPLICATE_TITLE',
  MISCONCEPTION_CURIOSITY_INVALID_CARD: 'MISCONCEPTION_CURIOSITY_INVALID_CARD',
  MISCONCEPTION_CURIOSITY_INVALID_REFERENCE: 'MISCONCEPTION_CURIOSITY_INVALID_REFERENCE',
  MISCONCEPTION_CURIOSITY_INVALID_OUTCOME: 'MISCONCEPTION_CURIOSITY_INVALID_OUTCOME',
  MISCONCEPTION_CURIOSITY_INVALID_IMPORTANCE: 'MISCONCEPTION_CURIOSITY_INVALID_IMPORTANCE',
  MISCONCEPTION_CURIOSITY_INVALID_STATUS: 'MISCONCEPTION_CURIOSITY_INVALID_STATUS',
  MISCONCEPTION_CURIOSITY_INVALID_GOVERNANCE: 'MISCONCEPTION_CURIOSITY_INVALID_GOVERNANCE',
  MISCONCEPTION_CURIOSITY_MISSING_PROVENANCE: 'MISCONCEPTION_CURIOSITY_MISSING_PROVENANCE',
  MISCONCEPTION_CURIOSITY_MISSING_PROVIDER: 'MISCONCEPTION_CURIOSITY_MISSING_PROVIDER',
  MISCONCEPTION_CURIOSITY_MISSING_RATIONALE: 'MISCONCEPTION_CURIOSITY_MISSING_RATIONALE',
  MISCONCEPTION_CURIOSITY_MISSING_CURIOSITY_REFERENCE: 'MISCONCEPTION_CURIOSITY_MISSING_CURIOSITY_REFERENCE',
  MISCONCEPTION_CURIOSITY_MISSING_PROFILE_ID: 'MISCONCEPTION_CURIOSITY_MISSING_PROFILE_ID',
  MISCONCEPTION_CURIOSITY_MISSING_TITLE: 'MISCONCEPTION_CURIOSITY_MISSING_TITLE',
  MISCONCEPTION_CURIOSITY_MISSING_CARD: 'MISCONCEPTION_CURIOSITY_MISSING_CARD',
  MISCONCEPTION_CURIOSITY_SELF_RELATIONSHIP: 'MISCONCEPTION_CURIOSITY_SELF_RELATIONSHIP',
  MISCONCEPTION_CURIOSITY_EMPTY_REGISTRY: 'MISCONCEPTION_CURIOSITY_EMPTY_REGISTRY',
  MISCONCEPTION_CURIOSITY_INVALID_TRACE: 'MISCONCEPTION_CURIOSITY_INVALID_TRACE',
  MISCONCEPTION_CURIOSITY_REGISTRY_INCONSISTENCY: 'MISCONCEPTION_CURIOSITY_REGISTRY_INCONSISTENCY',
  MISCONCEPTION_CURIOSITY_INVALID_CONFIGURATION: 'MISCONCEPTION_CURIOSITY_INVALID_CONFIGURATION',
  MISCONCEPTION_CURIOSITY_INVALID_RELATIONSHIP: 'MISCONCEPTION_CURIOSITY_INVALID_RELATIONSHIP',
  MISCONCEPTION_CURIOSITY_MISSING_RELATIONSHIP: 'MISCONCEPTION_CURIOSITY_MISSING_RELATIONSHIP',
  MISCONCEPTION_CURIOSITY_MISSING_GOVERNANCE: 'MISCONCEPTION_CURIOSITY_MISSING_GOVERNANCE',
  MISCONCEPTION_CURIOSITY_UNSAFE_CONFIGURATION: 'MISCONCEPTION_CURIOSITY_UNSAFE_CONFIGURATION',
} as const;

// ---------------------------------------------------------------------------
// Single Card Validation
// ---------------------------------------------------------------------------

/**
 * Validates a single misconception card against canonical invariants.
 * Pure function. No side effects.
 */
export function validateMisconceptionCard(
  card: MisconceptionCard,
): readonly MisconceptionCuriosityValidationError[] {
  const errors: MisconceptionCuriosityValidationError[] = [];

  if (!card.cardId || card.cardId.trim() === '') {
    errors.push({
      code: MISCONCEPTION_CURIOSITY_VALIDATION_CODES.MISCONCEPTION_CURIOSITY_MISSING_PROFILE_ID,
      message: 'Misconception card is missing a card ID.',
      field: 'cardId',
      profileId: card.cardId,
    });
  }

  if (!card.title || card.title.trim() === '') {
    errors.push({
      code: MISCONCEPTION_CURIOSITY_VALIDATION_CODES.MISCONCEPTION_CURIOSITY_MISSING_TITLE,
      message: 'Misconception card is missing a title.',
      field: 'title',
      profileId: card.cardId,
    });
  }

  if (!CANONICAL_MISCONCEPTION_CARD_TYPES.includes(card.cardType)) {
    errors.push({
      code: MISCONCEPTION_CURIOSITY_VALIDATION_CODES.MISCONCEPTION_CURIOSITY_INVALID_CARD,
      message: `Misconception card has unsupported card type: "${card.cardType}".`,
      field: 'cardType',
      profileId: card.cardId,
    });
  }

  if (!card.misconceptionDescription || card.misconceptionDescription.trim() === '') {
    errors.push({
      code: MISCONCEPTION_CURIOSITY_VALIDATION_CODES.MISCONCEPTION_CURIOSITY_INVALID_CONFIGURATION,
      message: 'Misconception card is missing misconception description.',
      field: 'misconceptionDescription',
      profileId: card.cardId,
    });
  }

  if (!card.correctionDescription || card.correctionDescription.trim() === '') {
    errors.push({
      code: MISCONCEPTION_CURIOSITY_VALIDATION_CODES.MISCONCEPTION_CURIOSITY_INVALID_CONFIGURATION,
      message: 'Misconception card is missing correction description.',
      field: 'correctionDescription',
      profileId: card.cardId,
    });
  }

  if (!CANONICAL_MISCONCEPTION_IMPORTANCE.includes(card.importance)) {
    errors.push({
      code: MISCONCEPTION_CURIOSITY_VALIDATION_CODES.MISCONCEPTION_CURIOSITY_INVALID_IMPORTANCE,
      message: `Misconception card has unsupported importance: "${card.importance}".`,
      field: 'importance',
      profileId: card.cardId,
    });
  }

  if (!CANONICAL_MISCONCEPTION_CURIOSITY_STATUS.includes(card.status)) {
    errors.push({
      code: MISCONCEPTION_CURIOSITY_VALIDATION_CODES.MISCONCEPTION_CURIOSITY_INVALID_STATUS,
      message: `Misconception card has unsupported status: "${card.status}".`,
      field: 'status',
      profileId: card.cardId,
    });
  }

  if (!CANONICAL_CURIOSITY_GOVERNANCE.includes(card.governance)) {
    errors.push({
      code: MISCONCEPTION_CURIOSITY_VALIDATION_CODES.MISCONCEPTION_CURIOSITY_INVALID_GOVERNANCE,
      message: `Misconception card has invalid governance: "${card.governance}".`,
      field: 'governance',
      profileId: card.cardId,
    });
  }

  if (!card.provenance) {
    errors.push({
      code: MISCONCEPTION_CURIOSITY_VALIDATION_CODES.MISCONCEPTION_CURIOSITY_MISSING_PROVENANCE,
      message: 'Misconception card is missing provenance.',
      field: 'provenance',
      profileId: card.cardId,
    });
  } else {
    if (!card.provenance.provider || card.provenance.provider.trim() === '') {
      errors.push({
        code: MISCONCEPTION_CURIOSITY_VALIDATION_CODES.MISCONCEPTION_CURIOSITY_MISSING_PROVIDER,
        message: 'Misconception card provenance is missing a provider.',
        field: 'provenance.provider',
        profileId: card.cardId,
      });
    }

    if (!card.provenance.rationale || card.provenance.rationale.trim() === '') {
      errors.push({
        code: MISCONCEPTION_CURIOSITY_VALIDATION_CODES.MISCONCEPTION_CURIOSITY_MISSING_RATIONALE,
        message: 'Misconception card provenance is missing a rationale.',
        field: 'provenance.rationale',
        profileId: card.cardId,
      });
    }
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Assessment Reinforcement Reference Validation
// ---------------------------------------------------------------------------

/**
 * Validates an assessment reinforcement reference against canonical invariants.
 * Pure function. No side effects.
 */
export function validateAssessmentReinforcementReference(
  reference: AssessmentReinforcementReference,
): readonly MisconceptionCuriosityValidationError[] {
  const errors: MisconceptionCuriosityValidationError[] = [];

  if (!reference.referenceId || reference.referenceId.trim() === '') {
    errors.push({
      code: MISCONCEPTION_CURIOSITY_VALIDATION_CODES.MISCONCEPTION_CURIOSITY_MISSING_CURIOSITY_REFERENCE,
      message: 'Assessment reinforcement reference is missing a reference ID.',
      field: 'referenceId',
    });
  }

  if (!reference.title || reference.title.trim() === '') {
    errors.push({
      code: MISCONCEPTION_CURIOSITY_VALIDATION_CODES.MISCONCEPTION_CURIOSITY_MISSING_TITLE,
      message: 'Assessment reinforcement reference is missing a title.',
      field: 'title',
    });
  }

  if (!CANONICAL_REINFORCEMENT_REFERENCE_TYPES.includes(reference.referenceType)) {
    errors.push({
      code: MISCONCEPTION_CURIOSITY_VALIDATION_CODES.MISCONCEPTION_CURIOSITY_INVALID_REFERENCE,
      message: `Assessment reinforcement reference has unsupported reference type: "${reference.referenceType}".`,
      field: 'referenceType',
    });
  }

  if (!reference.referenceDescription || reference.referenceDescription.trim() === '') {
    errors.push({
      code: MISCONCEPTION_CURIOSITY_VALIDATION_CODES.MISCONCEPTION_CURIOSITY_INVALID_CONFIGURATION,
      message: 'Assessment reinforcement reference is missing reference description.',
      field: 'referenceDescription',
    });
  }

  if (!reference.relatedCardId || reference.relatedCardId.trim() === '') {
    errors.push({
      code: MISCONCEPTION_CURIOSITY_VALIDATION_CODES.MISCONCEPTION_CURIOSITY_MISSING_CURIOSITY_REFERENCE,
      message: 'Assessment reinforcement reference is missing related card ID.',
      field: 'relatedCardId',
    });
  }

  if (!CANONICAL_MISCONCEPTION_CURIOSITY_STATUS.includes(reference.status)) {
    errors.push({
      code: MISCONCEPTION_CURIOSITY_VALIDATION_CODES.MISCONCEPTION_CURIOSITY_INVALID_STATUS,
      message: `Assessment reinforcement reference has unsupported status: "${reference.status}".`,
      field: 'status',
    });
  }

  if (!CANONICAL_CURIOSITY_GOVERNANCE.includes(reference.governance)) {
    errors.push({
      code: MISCONCEPTION_CURIOSITY_VALIDATION_CODES.MISCONCEPTION_CURIOSITY_INVALID_GOVERNANCE,
      message: `Assessment reinforcement reference has invalid governance: "${reference.governance}".`,
      field: 'governance',
    });
  }

  if (!reference.provenance) {
    errors.push({
      code: MISCONCEPTION_CURIOSITY_VALIDATION_CODES.MISCONCEPTION_CURIOSITY_MISSING_PROVENANCE,
      message: 'Assessment reinforcement reference is missing provenance.',
      field: 'provenance',
    });
  } else {
    if (!reference.provenance.provider || reference.provenance.provider.trim() === '') {
      errors.push({
        code: MISCONCEPTION_CURIOSITY_VALIDATION_CODES.MISCONCEPTION_CURIOSITY_MISSING_PROVIDER,
        message: 'Assessment reinforcement reference provenance is missing a provider.',
        field: 'provenance.provider',
      });
    }

    if (!reference.provenance.rationale || reference.provenance.rationale.trim() === '') {
      errors.push({
        code: MISCONCEPTION_CURIOSITY_VALIDATION_CODES.MISCONCEPTION_CURIOSITY_MISSING_RATIONALE,
        message: 'Assessment reinforcement reference provenance is missing a rationale.',
        field: 'provenance.rationale',
      });
    }
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Corrective Insight Validation
// ---------------------------------------------------------------------------

/**
 * Validates a corrective insight against canonical invariants.
 * Pure function. No side effects.
 */
export function validateCorrectiveInsight(
  insight: CorrectiveInsight,
): readonly MisconceptionCuriosityValidationError[] {
  const errors: MisconceptionCuriosityValidationError[] = [];

  if (!insight.insightId || insight.insightId.trim() === '') {
    errors.push({
      code: MISCONCEPTION_CURIOSITY_VALIDATION_CODES.MISCONCEPTION_CURIOSITY_MISSING_CARD,
      message: 'Corrective insight is missing an insight ID.',
      field: 'insightId',
    });
  }

  if (!insight.cardId || insight.cardId.trim() === '') {
    errors.push({
      code: MISCONCEPTION_CURIOSITY_VALIDATION_CODES.MISCONCEPTION_CURIOSITY_MISSING_CURIOSITY_REFERENCE,
      message: 'Corrective insight is missing a card ID.',
      field: 'cardId',
    });
  }

  if (!insight.insightTitle || insight.insightTitle.trim() === '') {
    errors.push({
      code: MISCONCEPTION_CURIOSITY_VALIDATION_CODES.MISCONCEPTION_CURIOSITY_MISSING_TITLE,
      message: 'Corrective insight is missing an insight title.',
      field: 'insightTitle',
    });
  }

  if (!insight.insightDescription || insight.insightDescription.trim() === '') {
    errors.push({
      code: MISCONCEPTION_CURIOSITY_VALIDATION_CODES.MISCONCEPTION_CURIOSITY_INVALID_CONFIGURATION,
      message: 'Corrective insight is missing insight description.',
      field: 'insightDescription',
    });
  }

  if (!CANONICAL_CORRECTIVE_OUTCOMES.includes(insight.correctiveOutcome)) {
    errors.push({
      code: MISCONCEPTION_CURIOSITY_VALIDATION_CODES.MISCONCEPTION_CURIOSITY_INVALID_OUTCOME,
      message: `Corrective insight has unsupported corrective outcome: "${insight.correctiveOutcome}".`,
      field: 'correctiveOutcome',
    });
  }

  if (!CANONICAL_MISCONCEPTION_CURIOSITY_STATUS.includes(insight.status)) {
    errors.push({
      code: MISCONCEPTION_CURIOSITY_VALIDATION_CODES.MISCONCEPTION_CURIOSITY_INVALID_STATUS,
      message: `Corrective insight has unsupported status: "${insight.status}".`,
      field: 'status',
    });
  }

  if (!CANONICAL_CURIOSITY_GOVERNANCE.includes(insight.governance)) {
    errors.push({
      code: MISCONCEPTION_CURIOSITY_VALIDATION_CODES.MISCONCEPTION_CURIOSITY_INVALID_GOVERNANCE,
      message: `Corrective insight has invalid governance: "${insight.governance}".`,
      field: 'governance',
    });
  }

  if (!insight.provenance) {
    errors.push({
      code: MISCONCEPTION_CURIOSITY_VALIDATION_CODES.MISCONCEPTION_CURIOSITY_MISSING_PROVENANCE,
      message: 'Corrective insight is missing provenance.',
      field: 'provenance',
    });
  } else {
    if (!insight.provenance.provider || insight.provenance.provider.trim() === '') {
      errors.push({
        code: MISCONCEPTION_CURIOSITY_VALIDATION_CODES.MISCONCEPTION_CURIOSITY_MISSING_PROVIDER,
        message: 'Corrective insight provenance is missing a provider.',
        field: 'provenance.provider',
      });
    }

    if (!insight.provenance.rationale || insight.provenance.rationale.trim() === '') {
      errors.push({
        code: MISCONCEPTION_CURIOSITY_VALIDATION_CODES.MISCONCEPTION_CURIOSITY_MISSING_RATIONALE,
        message: 'Corrective insight provenance is missing a rationale.',
        field: 'provenance.rationale',
      });
    }
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Misconception Relationship Validation
// ---------------------------------------------------------------------------

/**
 * Validates a misconception relationship against canonical invariants.
 * Pure function. No side effects.
 */
export function validateMisconceptionRelationship(
  relationship: MisconceptionRelationship,
): readonly MisconceptionCuriosityValidationError[] {
  const errors: MisconceptionCuriosityValidationError[] = [];

  if (!relationship.relationshipId || relationship.relationshipId.trim() === '') {
    errors.push({
      code: MISCONCEPTION_CURIOSITY_VALIDATION_CODES.MISCONCEPTION_CURIOSITY_MISSING_CURIOSITY_REFERENCE,
      message: 'Misconception relationship is missing a relationship ID.',
      field: 'relationshipId',
    });
  }

  if (!relationship.sourceCardId || relationship.sourceCardId.trim() === '') {
    errors.push({
      code: MISCONCEPTION_CURIOSITY_VALIDATION_CODES.MISCONCEPTION_CURIOSITY_MISSING_CURIOSITY_REFERENCE,
      message: 'Misconception relationship is missing a source card ID.',
      field: 'sourceCardId',
    });
  }

  if (!relationship.targetCardId || relationship.targetCardId.trim() === '') {
    errors.push({
      code: MISCONCEPTION_CURIOSITY_VALIDATION_CODES.MISCONCEPTION_CURIOSITY_MISSING_CURIOSITY_REFERENCE,
      message: 'Misconception relationship is missing a target card ID.',
      field: 'targetCardId',
    });
  }

  if (relationship.sourceCardId === relationship.targetCardId) {
    errors.push({
      code: MISCONCEPTION_CURIOSITY_VALIDATION_CODES.MISCONCEPTION_CURIOSITY_SELF_RELATIONSHIP,
      message: 'Misconception relationship cannot be a self-relationship.',
      field: 'targetCardId',
    });
  }

  if (!relationship.provenance) {
    errors.push({
      code: MISCONCEPTION_CURIOSITY_VALIDATION_CODES.MISCONCEPTION_CURIOSITY_MISSING_PROVENANCE,
      message: 'Misconception relationship is missing provenance.',
      field: 'provenance',
    });
  } else {
    if (!relationship.provenance.provider || relationship.provenance.provider.trim() === '') {
      errors.push({
        code: MISCONCEPTION_CURIOSITY_VALIDATION_CODES.MISCONCEPTION_CURIOSITY_MISSING_PROVIDER,
        message: 'Misconception relationship provenance is missing a provider.',
        field: 'provenance.provider',
      });
    }

    if (!relationship.provenance.rationale || relationship.provenance.rationale.trim() === '') {
      errors.push({
        code: MISCONCEPTION_CURIOSITY_VALIDATION_CODES.MISCONCEPTION_CURIOSITY_MISSING_RATIONALE,
        message: 'Misconception relationship provenance is missing a rationale.',
        field: 'provenance.rationale',
      });
    }
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Misconception Registry Validation
// ---------------------------------------------------------------------------

/**
 * Validates a misconception registry against canonical invariants.
 * Pure function. No side effects.
 */
export function validateMisconceptionRegistry(
  registry: MisconceptionRegistry,
): MisconceptionRegistryValidationResult {
  const errors: MisconceptionCuriosityValidationError[] = [];

  if (!registry.registryId || registry.registryId.trim() === '') {
    errors.push({
      code: MISCONCEPTION_CURIOSITY_VALIDATION_CODES.MISCONCEPTION_CURIOSITY_EMPTY_REGISTRY,
      message: 'Registry is missing a registry ID.',
      field: 'registryId',
    });
  }

  if (!registry.cards || registry.cards.length === 0) {
    errors.push({
      code: MISCONCEPTION_CURIOSITY_VALIDATION_CODES.MISCONCEPTION_CURIOSITY_EMPTY_REGISTRY,
      message: 'Registry has no cards.',
      field: 'cards',
    });
  }

  if (registry.deterministic !== true) {
    errors.push({
      code: MISCONCEPTION_CURIOSITY_VALIDATION_CODES.MISCONCEPTION_CURIOSITY_INVALID_TRACE,
      message: 'Registry must declare deterministic: true.',
      field: 'deterministic',
    });
  }

  if (registry.randomUsed !== false) {
    errors.push({
      code: MISCONCEPTION_CURIOSITY_VALIDATION_CODES.MISCONCEPTION_CURIOSITY_INVALID_TRACE,
      message: 'Registry must declare randomUsed: false.',
      field: 'randomUsed',
    });
  }

  if (registry.timeDependency !== false) {
    errors.push({
      code: MISCONCEPTION_CURIOSITY_VALIDATION_CODES.MISCONCEPTION_CURIOSITY_INVALID_TRACE,
      message: 'Registry must declare timeDependency: false.',
      field: 'timeDependency',
    });
  }

  // Check for duplicate card IDs
  const seenIds = new Set<string>();
  for (const card of registry.cards) {
    if (seenIds.has(card.cardId)) {
      errors.push({
        code: MISCONCEPTION_CURIOSITY_VALIDATION_CODES.MISCONCEPTION_CURIOSITY_DUPLICATE_ID,
        message: `Duplicate card ID: "${card.cardId}".`,
        profileId: card.cardId,
      });
    }
    seenIds.add(card.cardId);
  }

  // Check for duplicate titles
  const seenTitles = new Set<string>();
  for (const card of registry.cards) {
    if (seenTitles.has(card.title)) {
      errors.push({
        code: MISCONCEPTION_CURIOSITY_VALIDATION_CODES.MISCONCEPTION_CURIOSITY_DUPLICATE_TITLE,
        message: `Duplicate card title: "${card.title}".`,
        field: 'title',
        profileId: card.cardId,
      });
    }
    seenTitles.add(card.title);
  }

  // Validate each card
  for (const card of registry.cards) {
    errors.push(...validateMisconceptionCard(card));
  }

  // Validate each reference
  for (const reference of registry.references) {
    errors.push(...validateAssessmentReinforcementReference(reference));
  }

  // Validate each insight
  for (const insight of registry.insights) {
    errors.push(...validateCorrectiveInsight(insight));
  }

  // Validate each relationship
  for (const relationship of registry.relationships) {
    errors.push(...validateMisconceptionRelationship(relationship));
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'misconception_registry_composition',
  };
}

// ---------------------------------------------------------------------------
// Misconception Input Validation
// ---------------------------------------------------------------------------

/**
 * Validates misconception input against canonical invariants.
 * Pure function. No side effects.
 */
export function validateMisconceptionInput(
  input: MisconceptionInput,
): MisconceptionInputValidationResult {
  const errors: MisconceptionCuriosityValidationError[] = [];

  if (!input.cards || input.cards.length === 0) {
    errors.push({
      code: MISCONCEPTION_CURIOSITY_VALIDATION_CODES.MISCONCEPTION_CURIOSITY_EMPTY_REGISTRY,
      message: 'Input has no cards.',
      field: 'cards',
    });
  } else {
    for (const card of input.cards) {
      errors.push(...validateMisconceptionCard(card));
    }
  }

  for (const reference of input.references) {
    errors.push(...validateAssessmentReinforcementReference(reference));
  }

  for (const insight of input.insights) {
    errors.push(...validateCorrectiveInsight(insight));
  }

  for (const relationship of input.relationships) {
    errors.push(...validateMisconceptionRelationship(relationship));
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'misconception_input_composition',
  };
}

// ---------------------------------------------------------------------------
// Misconception Trace Validation
// ---------------------------------------------------------------------------

/**
 * Validates a misconception trace against canonical invariants.
 * Pure function. No side effects.
 */
export function validateMisconceptionTrace(
  trace: MisconceptionCuriosityTrace,
): MisconceptionTraceValidationResult {
  const errors: MisconceptionCuriosityValidationError[] = [];

  if (!trace.traceId || trace.traceId.trim() === '') {
    errors.push({
      code: MISCONCEPTION_CURIOSITY_VALIDATION_CODES.MISCONCEPTION_CURIOSITY_INVALID_TRACE,
      message: 'Misconception trace is missing a trace ID.',
      field: 'traceId',
    });
  }

  if (trace.deterministic !== true) {
    errors.push({
      code: MISCONCEPTION_CURIOSITY_VALIDATION_CODES.MISCONCEPTION_CURIOSITY_INVALID_TRACE,
      message: 'Misconception trace must declare deterministic: true.',
      field: 'deterministic',
    });
  }

  if (trace.randomUsed !== false) {
    errors.push({
      code: MISCONCEPTION_CURIOSITY_VALIDATION_CODES.MISCONCEPTION_CURIOSITY_INVALID_TRACE,
      message: 'Misconception trace must declare randomUsed: false.',
      field: 'randomUsed',
    });
  }

  if (trace.timeDependency !== false) {
    errors.push({
      code: MISCONCEPTION_CURIOSITY_VALIDATION_CODES.MISCONCEPTION_CURIOSITY_INVALID_TRACE,
      message: 'Misconception trace must declare timeDependency: false.',
      field: 'timeDependency',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'misconception_trace_composition',
  };
}

// ---------------------------------------------------------------------------
// Curiosity Artifact With Misconceptions Validation
// ---------------------------------------------------------------------------

/**
 * Validates a curiosity artifact with misconceptions against canonical invariants.
 * Pure function. No side effects.
 */
export function validateCuriosityArtifactWithMisconceptions(
  artifact: CuriosityArtifactWithMisconceptions,
): CuriosityArtifactWithMisconceptionsValidationResult {
  const errors: MisconceptionCuriosityValidationError[] = [];

  if (!artifact.curiosityId || artifact.curiosityId.trim() === '') {
    errors.push({
      code: MISCONCEPTION_CURIOSITY_VALIDATION_CODES.MISCONCEPTION_CURIOSITY_MISSING_CURIOSITY_REFERENCE,
      message: 'Curiosity artifact is missing a curiosity ID.',
      field: 'curiosityId',
    });
  }

  if (!artifact.title || artifact.title.trim() === '') {
    errors.push({
      code: MISCONCEPTION_CURIOSITY_VALIDATION_CODES.MISCONCEPTION_CURIOSITY_MISSING_TITLE,
      message: 'Curiosity artifact is missing a title.',
      field: 'title',
    });
  }

  if (!artifact.cards || artifact.cards.length === 0) {
    errors.push({
      code: MISCONCEPTION_CURIOSITY_VALIDATION_CODES.MISCONCEPTION_CURIOSITY_EMPTY_REGISTRY,
      message: 'Curiosity artifact has no cards.',
      field: 'cards',
    });
  } else {
    for (const card of artifact.cards) {
      errors.push(...validateMisconceptionCard(card));
    }
  }

  if (!artifact.provenance) {
    errors.push({
      code: MISCONCEPTION_CURIOSITY_VALIDATION_CODES.MISCONCEPTION_CURIOSITY_MISSING_PROVENANCE,
      message: 'Curiosity artifact is missing provenance.',
      field: 'provenance',
    });
  } else {
    if (!artifact.provenance.provider || artifact.provenance.provider.trim() === '') {
      errors.push({
        code: MISCONCEPTION_CURIOSITY_VALIDATION_CODES.MISCONCEPTION_CURIOSITY_MISSING_PROVIDER,
        message: 'Curiosity artifact provenance is missing a provider.',
        field: 'provenance.provider',
      });
    }

    if (!artifact.provenance.rationale || artifact.provenance.rationale.trim() === '') {
      errors.push({
        code: MISCONCEPTION_CURIOSITY_VALIDATION_CODES.MISCONCEPTION_CURIOSITY_MISSING_RATIONALE,
        message: 'Curiosity artifact provenance is missing a rationale.',
        field: 'provenance.rationale',
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'curiosity_artifact_with_misconceptions_composition',
  };
}

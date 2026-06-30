/**
 * NV-2100-D9-OPT-05 — Curiosity Card Validation Layer
 *
 * Deterministic validation for curiosity card metadata.
 * Returns structured errors, never exceptions for expected validation failures.
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import type {
  CuriosityCardProfile,
  EngineerNoteProfile,
  FieldNoteProfile,
  CardPresentationMetadata,
  CardRelationship,
  CuriosityCardRegistry,
  CuriosityCardInput,
  CuriosityCardTrace,
  CuriosityArtifactWithCards,
  CuriosityCardValidationError,
  CuriosityCardRegistryValidationResult,
  CuriosityCardInputValidationResult,
  CuriosityCardTraceValidationResult,
  CuriosityArtifactWithCardsValidationResult,
} from './CuriosityAgentContract.ts';

import {
  CANONICAL_CARD_TYPES,
  CANONICAL_INFORMATION_DENSITY,
  CANONICAL_READING_DURATION,
  CANONICAL_PRESENTATION_STYLE,
  CANONICAL_DISCOVERY_STYLE,
  CANONICAL_CARD_STATUS,
  CANONICAL_CURIOSITY_GOVERNANCE,
} from './CuriosityAgentContract.ts';

// ---------------------------------------------------------------------------
// Validation Error Codes
// ---------------------------------------------------------------------------

export const CURIOUSITY_CARD_VALIDATION_CODES = {
  CARD_DUPLICATE_ID: 'CARD_DUPLICATE_ID',
  CARD_DUPLICATE_TITLE: 'CARD_DUPLICATE_TITLE',
  CARD_PRESENTATION_DUPLICATE_ID: 'CARD_PRESENTATION_DUPLICATE_ID',
  CARD_RELATIONSHIP_DUPLICATE_ID: 'CARD_RELATIONSHIP_DUPLICATE_ID',
  CARD_INVALID_TYPE: 'CARD_INVALID_TYPE',
  CARD_INVALID_DENSITY: 'CARD_INVALID_DENSITY',
  CARD_INVALID_DURATION: 'CARD_INVALID_DURATION',
  CARD_INVALID_PRESENTATION: 'CARD_INVALID_PRESENTATION',
  CARD_INVALID_DISCOVERY_STYLE: 'CARD_INVALID_DISCOVERY_STYLE',
  CARD_INVALID_STATUS: 'CARD_INVALID_STATUS',
  CARD_INVALID_GOVERNANCE: 'CARD_INVALID_GOVERNANCE',
  CARD_MISSING_PROVENANCE: 'CARD_MISSING_PROVENANCE',
  CARD_MISSING_PROVIDER: 'CARD_MISSING_PROVIDER',
  CARD_MISSING_RATIONALE: 'CARD_MISSING_RATIONALE',
  CARD_MISSING_CURIOSITY_REFERENCE: 'CARD_MISSING_CURIOSITY_REFERENCE',
  CARD_MISSING_CARD_ID: 'CARD_MISSING_CARD_ID',
  CARD_MISSING_TITLE: 'CARD_MISSING_TITLE',
  CARD_MISSING_PRESENTATION: 'CARD_MISSING_PRESENTATION',
  CARD_SELF_RELATIONSHIP: 'CARD_SELF_RELATIONSHIP',
  CARD_EMPTY_REGISTRY: 'CARD_EMPTY_REGISTRY',
  CARD_INVALID_TRACE: 'CARD_INVALID_TRACE',
  CARD_REGISTRY_INCONSISTENCY: 'CARD_REGISTRY_INCONSISTENCY',
  CARD_INVALID_CONFIGURATION: 'CARD_INVALID_CONFIGURATION',
  CARD_UNSUPPORTED_LAYOUT: 'CARD_UNSUPPORTED_LAYOUT',
} as const;

// ---------------------------------------------------------------------------
// Single Card Profile Validation
// ---------------------------------------------------------------------------

/**
 * Validates a single curiosity card profile against canonical invariants.
 * Pure function. No side effects.
 */
export function validateCuriosityCardProfile(
  profile: CuriosityCardProfile,
): readonly CuriosityCardValidationError[] {
  const errors: CuriosityCardValidationError[] = [];

  if (!profile.id || profile.id.trim() === '') {
    errors.push({
      code: CURIOUSITY_CARD_VALIDATION_CODES.CARD_MISSING_CARD_ID,
      message: 'Curiosity card profile is missing a card ID.',
      field: 'id',
      cardId: profile.id,
    });
  }

  if (!profile.title || profile.title.trim() === '') {
    errors.push({
      code: CURIOUSITY_CARD_VALIDATION_CODES.CARD_MISSING_TITLE,
      message: 'Curiosity card profile is missing a title.',
      field: 'title',
      cardId: profile.id,
    });
  }

  if (!CANONICAL_CARD_TYPES.includes(profile.cardType)) {
    errors.push({
      code: CURIOUSITY_CARD_VALIDATION_CODES.CARD_INVALID_TYPE,
      message: `Curiosity card profile has unsupported card type: "${profile.cardType}".`,
      field: 'cardType',
      cardId: profile.id,
    });
  }

  if (!CANONICAL_INFORMATION_DENSITY.includes(profile.informationDensity)) {
    errors.push({
      code: CURIOUSITY_CARD_VALIDATION_CODES.CARD_INVALID_DENSITY,
      message: `Curiosity card profile has unsupported information density: "${profile.informationDensity}".`,
      field: 'informationDensity',
      cardId: profile.id,
    });
  }

  if (!CANONICAL_READING_DURATION.includes(profile.readingDuration)) {
    errors.push({
      code: CURIOUSITY_CARD_VALIDATION_CODES.CARD_INVALID_DURATION,
      message: `Curiosity card profile has unsupported reading duration: "${profile.readingDuration}".`,
      field: 'readingDuration',
      cardId: profile.id,
    });
  }

  if (!CANONICAL_PRESENTATION_STYLE.includes(profile.presentationStyle)) {
    errors.push({
      code: CURIOUSITY_CARD_VALIDATION_CODES.CARD_INVALID_PRESENTATION,
      message: `Curiosity card profile has unsupported presentation style: "${profile.presentationStyle}".`,
      field: 'presentationStyle',
      cardId: profile.id,
    });
  }

  if (!CANONICAL_DISCOVERY_STYLE.includes(profile.discoveryStyle)) {
    errors.push({
      code: CURIOUSITY_CARD_VALIDATION_CODES.CARD_INVALID_DISCOVERY_STYLE,
      message: `Curiosity card profile has unsupported discovery style: "${profile.discoveryStyle}".`,
      field: 'discoveryStyle',
      cardId: profile.id,
    });
  }

  if (!CANONICAL_CARD_STATUS.includes(profile.status)) {
    errors.push({
      code: CURIOUSITY_CARD_VALIDATION_CODES.CARD_INVALID_STATUS,
      message: `Curiosity card profile has unsupported status: "${profile.status}".`,
      field: 'status',
      cardId: profile.id,
    });
  }

  if (!CANONICAL_CURIOSITY_GOVERNANCE.includes(profile.governance)) {
    errors.push({
      code: CURIOUSITY_CARD_VALIDATION_CODES.CARD_INVALID_GOVERNANCE,
      message: `Curiosity card profile has invalid governance: "${profile.governance}".`,
      field: 'governance',
      cardId: profile.id,
    });
  }

  if (!profile.provenance) {
    errors.push({
      code: CURIOUSITY_CARD_VALIDATION_CODES.CARD_MISSING_PROVENANCE,
      message: 'Curiosity card profile is missing provenance.',
      field: 'provenance',
      cardId: profile.id,
    });
  } else {
    if (!profile.provenance.provider || profile.provenance.provider.trim() === '') {
      errors.push({
        code: CURIOUSITY_CARD_VALIDATION_CODES.CARD_MISSING_PROVIDER,
        message: 'Curiosity card provenance is missing a provider.',
        field: 'provenance.provider',
        cardId: profile.id,
      });
    }

    if (!profile.provenance.rationale || profile.provenance.rationale.trim() === '') {
      errors.push({
        code: CURIOUSITY_CARD_VALIDATION_CODES.CARD_MISSING_RATIONALE,
        message: 'Curiosity card provenance is missing a rationale.',
        field: 'provenance.rationale',
        cardId: profile.id,
      });
    }
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Engineer Note Profile Validation
// ---------------------------------------------------------------------------

/**
 * Validates an engineer note profile against canonical invariants.
 * Pure function. No side effects.
 */
export function validateEngineerNoteProfile(
  profile: EngineerNoteProfile,
): readonly CuriosityCardValidationError[] {
  const errors: CuriosityCardValidationError[] = [];

  if (!profile.id || profile.id.trim() === '') {
    errors.push({
      code: CURIOUSITY_CARD_VALIDATION_CODES.CARD_MISSING_CARD_ID,
      message: 'Engineer note profile is missing a card ID.',
      field: 'id',
      cardId: profile.id,
    });
  }

  if (!profile.title || profile.title.trim() === '') {
    errors.push({
      code: CURIOUSITY_CARD_VALIDATION_CODES.CARD_MISSING_TITLE,
      message: 'Engineer note profile is missing a title.',
      field: 'title',
      cardId: profile.id,
    });
  }

  if (!profile.engineeringRelevance || profile.engineeringRelevance.trim() === '') {
    errors.push({
      code: CURIOUSITY_CARD_VALIDATION_CODES.CARD_INVALID_CONFIGURATION,
      message: 'Engineer note profile is missing engineering relevance.',
      field: 'engineeringRelevance',
      cardId: profile.id,
    });
  }

  if (!profile.implementationPerspective || profile.implementationPerspective.trim() === '') {
    errors.push({
      code: CURIOUSITY_CARD_VALIDATION_CODES.CARD_INVALID_CONFIGURATION,
      message: 'Engineer note profile is missing implementation perspective.',
      field: 'implementationPerspective',
      cardId: profile.id,
    });
  }

  if (!profile.realWorldInsight || profile.realWorldInsight.trim() === '') {
    errors.push({
      code: CURIOUSITY_CARD_VALIDATION_CODES.CARD_INVALID_CONFIGURATION,
      message: 'Engineer note profile is missing real world insight.',
      field: 'realWorldInsight',
      cardId: profile.id,
    });
  }

  if (!profile.practicalTakeaway || profile.practicalTakeaway.trim() === '') {
    errors.push({
      code: CURIOUSITY_CARD_VALIDATION_CODES.CARD_INVALID_CONFIGURATION,
      message: 'Engineer note profile is missing practical takeaway.',
      field: 'practicalTakeaway',
      cardId: profile.id,
    });
  }

  if (!profile.technicalEmphasis || profile.technicalEmphasis.trim() === '') {
    errors.push({
      code: CURIOUSITY_CARD_VALIDATION_CODES.CARD_INVALID_CONFIGURATION,
      message: 'Engineer note profile is missing technical emphasis.',
      field: 'technicalEmphasis',
      cardId: profile.id,
    });
  }

  if (!CANONICAL_CARD_STATUS.includes(profile.status)) {
    errors.push({
      code: CURIOUSITY_CARD_VALIDATION_CODES.CARD_INVALID_STATUS,
      message: `Engineer note profile has unsupported status: "${profile.status}".`,
      field: 'status',
      cardId: profile.id,
    });
  }

  if (!CANONICAL_CURIOSITY_GOVERNANCE.includes(profile.governance)) {
    errors.push({
      code: CURIOUSITY_CARD_VALIDATION_CODES.CARD_INVALID_GOVERNANCE,
      message: `Engineer note profile has invalid governance: "${profile.governance}".`,
      field: 'governance',
      cardId: profile.id,
    });
  }

  if (!profile.provenance) {
    errors.push({
      code: CURIOUSITY_CARD_VALIDATION_CODES.CARD_MISSING_PROVENANCE,
      message: 'Engineer note profile is missing provenance.',
      field: 'provenance',
      cardId: profile.id,
    });
  } else {
    if (!profile.provenance.provider || profile.provenance.provider.trim() === '') {
      errors.push({
        code: CURIOUSITY_CARD_VALIDATION_CODES.CARD_MISSING_PROVIDER,
        message: 'Engineer note provenance is missing a provider.',
        field: 'provenance.provider',
        cardId: profile.id,
      });
    }

    if (!profile.provenance.rationale || profile.provenance.rationale.trim() === '') {
      errors.push({
        code: CURIOUSITY_CARD_VALIDATION_CODES.CARD_MISSING_RATIONALE,
        message: 'Engineer note provenance is missing a rationale.',
        field: 'provenance.rationale',
        cardId: profile.id,
      });
    }
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Field Note Profile Validation
// ---------------------------------------------------------------------------

/**
 * Validates a field note profile against canonical invariants.
 * Pure function. No side effects.
 */
export function validateFieldNoteProfile(
  profile: FieldNoteProfile,
): readonly CuriosityCardValidationError[] {
  const errors: CuriosityCardValidationError[] = [];

  if (!profile.id || profile.id.trim() === '') {
    errors.push({
      code: CURIOUSITY_CARD_VALIDATION_CODES.CARD_MISSING_CARD_ID,
      message: 'Field note profile is missing a card ID.',
      field: 'id',
      cardId: profile.id,
    });
  }

  if (!profile.title || profile.title.trim() === '') {
    errors.push({
      code: CURIOUSITY_CARD_VALIDATION_CODES.CARD_MISSING_TITLE,
      message: 'Field note profile is missing a title.',
      field: 'title',
      cardId: profile.id,
    });
  }

  if (!profile.observation || profile.observation.trim() === '') {
    errors.push({
      code: CURIOUSITY_CARD_VALIDATION_CODES.CARD_INVALID_CONFIGURATION,
      message: 'Field note profile is missing observation.',
      field: 'observation',
      cardId: profile.id,
    });
  }

  if (!profile.experiment || profile.experiment.trim() === '') {
    errors.push({
      code: CURIOUSITY_CARD_VALIDATION_CODES.CARD_INVALID_CONFIGURATION,
      message: 'Field note profile is missing experiment.',
      field: 'experiment',
      cardId: profile.id,
    });
  }

  if (!profile.historicalAnecdote || profile.historicalAnecdote.trim() === '') {
    errors.push({
      code: CURIOUSITY_CARD_VALIDATION_CODES.CARD_INVALID_CONFIGURATION,
      message: 'Field note profile is missing historical anecdote.',
      field: 'historicalAnecdote',
      cardId: profile.id,
    });
  }

  if (!profile.scientificDiscovery || profile.scientificDiscovery.trim() === '') {
    errors.push({
      code: CURIOUSITY_CARD_VALIDATION_CODES.CARD_INVALID_CONFIGURATION,
      message: 'Field note profile is missing scientific discovery.',
      field: 'scientificDiscovery',
      cardId: profile.id,
    });
  }

  if (!profile.engineeringLesson || profile.engineeringLesson.trim() === '') {
    errors.push({
      code: CURIOUSITY_CARD_VALIDATION_CODES.CARD_INVALID_CONFIGURATION,
      message: 'Field note profile is missing engineering lesson.',
      field: 'engineeringLesson',
      cardId: profile.id,
    });
  }

  if (!CANONICAL_CARD_STATUS.includes(profile.status)) {
    errors.push({
      code: CURIOUSITY_CARD_VALIDATION_CODES.CARD_INVALID_STATUS,
      message: `Field note profile has unsupported status: "${profile.status}".`,
      field: 'status',
      cardId: profile.id,
    });
  }

  if (!CANONICAL_CURIOSITY_GOVERNANCE.includes(profile.governance)) {
    errors.push({
      code: CURIOUSITY_CARD_VALIDATION_CODES.CARD_INVALID_GOVERNANCE,
      message: `Field note profile has invalid governance: "${profile.governance}".`,
      field: 'governance',
      cardId: profile.id,
    });
  }

  if (!profile.provenance) {
    errors.push({
      code: CURIOUSITY_CARD_VALIDATION_CODES.CARD_MISSING_PROVENANCE,
      message: 'Field note profile is missing provenance.',
      field: 'provenance',
      cardId: profile.id,
    });
  } else {
    if (!profile.provenance.provider || profile.provenance.provider.trim() === '') {
      errors.push({
        code: CURIOUSITY_CARD_VALIDATION_CODES.CARD_MISSING_PROVIDER,
        message: 'Field note provenance is missing a provider.',
        field: 'provenance.provider',
        cardId: profile.id,
      });
    }

    if (!profile.provenance.rationale || profile.provenance.rationale.trim() === '') {
      errors.push({
        code: CURIOUSITY_CARD_VALIDATION_CODES.CARD_MISSING_RATIONALE,
        message: 'Field note provenance is missing a rationale.',
        field: 'provenance.rationale',
        cardId: profile.id,
      });
    }
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Card Presentation Metadata Validation
// ---------------------------------------------------------------------------

/**
 * Validates card presentation metadata against canonical invariants.
 * Pure function. No side effects.
 */
export function validateCardPresentationMetadata(
  presentation: CardPresentationMetadata,
): readonly CuriosityCardValidationError[] {
  const errors: CuriosityCardValidationError[] = [];

  if (!presentation.presentationId || presentation.presentationId.trim() === '') {
    errors.push({
      code: CURIOUSITY_CARD_VALIDATION_CODES.CARD_MISSING_PRESENTATION,
      message: 'Card presentation metadata is missing a presentation ID.',
      field: 'presentationId',
    });
  }

  if (!presentation.cardId || presentation.cardId.trim() === '') {
    errors.push({
      code: CURIOUSITY_CARD_VALIDATION_CODES.CARD_MISSING_CURIOSITY_REFERENCE,
      message: 'Card presentation metadata is missing a card ID.',
      field: 'cardId',
    });
  }

  if (!CANONICAL_PRESENTATION_STYLE.includes(presentation.presentationStyle)) {
    errors.push({
      code: CURIOUSITY_CARD_VALIDATION_CODES.CARD_INVALID_PRESENTATION,
      message: `Card presentation metadata has unsupported presentation style: "${presentation.presentationStyle}".`,
      field: 'presentationStyle',
    });
  }

  if (!CANONICAL_INFORMATION_DENSITY.includes(presentation.informationDensity)) {
    errors.push({
      code: CURIOUSITY_CARD_VALIDATION_CODES.CARD_INVALID_DENSITY,
      message: `Card presentation metadata has unsupported information density: "${presentation.informationDensity}".`,
      field: 'informationDensity',
    });
  }

  if (!CANONICAL_READING_DURATION.includes(presentation.readingDuration)) {
    errors.push({
      code: CURIOUSITY_CARD_VALIDATION_CODES.CARD_INVALID_DURATION,
      message: `Card presentation metadata has unsupported reading duration: "${presentation.readingDuration}".`,
      field: 'readingDuration',
    });
  }

  if (!CANONICAL_DISCOVERY_STYLE.includes(presentation.discoveryStyle)) {
    errors.push({
      code: CURIOUSITY_CARD_VALIDATION_CODES.CARD_INVALID_DISCOVERY_STYLE,
      message: `Card presentation metadata has unsupported discovery style: "${presentation.discoveryStyle}".`,
      field: 'discoveryStyle',
    });
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Card Relationship Validation
// ---------------------------------------------------------------------------

/**
 * Validates a card relationship against canonical invariants.
 * Pure function. No side effects.
 */
export function validateCardRelationship(
  relationship: CardRelationship,
): readonly CuriosityCardValidationError[] {
  const errors: CuriosityCardValidationError[] = [];

  if (!relationship.relationshipId || relationship.relationshipId.trim() === '') {
    errors.push({
      code: CURIOUSITY_CARD_VALIDATION_CODES.CARD_RELATIONSHIP_DUPLICATE_ID,
      message: 'Card relationship is missing a relationship ID.',
      field: 'relationshipId',
    });
  }

  if (!relationship.sourceCardId || relationship.sourceCardId.trim() === '') {
    errors.push({
      code: CURIOUSITY_CARD_VALIDATION_CODES.CARD_MISSING_CURIOSITY_REFERENCE,
      message: 'Card relationship is missing a source card ID.',
      field: 'sourceCardId',
    });
  }

  if (!relationship.targetCardId || relationship.targetCardId.trim() === '') {
    errors.push({
      code: CURIOUSITY_CARD_VALIDATION_CODES.CARD_MISSING_CURIOSITY_REFERENCE,
      message: 'Card relationship is missing a target card ID.',
      field: 'targetCardId',
    });
  }

  if (relationship.sourceCardId === relationship.targetCardId) {
    errors.push({
      code: CURIOUSITY_CARD_VALIDATION_CODES.CARD_SELF_RELATIONSHIP,
      message: 'Card relationship cannot be a self-relationship.',
      field: 'targetCardId',
    });
  }

  if (!relationship.provenance) {
    errors.push({
      code: CURIOUSITY_CARD_VALIDATION_CODES.CARD_MISSING_PROVENANCE,
      message: 'Card relationship is missing provenance.',
      field: 'provenance',
    });
  } else {
    if (!relationship.provenance.provider || relationship.provenance.provider.trim() === '') {
      errors.push({
        code: CURIOUSITY_CARD_VALIDATION_CODES.CARD_MISSING_PROVIDER,
        message: 'Card relationship provenance is missing a provider.',
        field: 'provenance.provider',
      });
    }

    if (!relationship.provenance.rationale || relationship.provenance.rationale.trim() === '') {
      errors.push({
        code: CURIOUSITY_CARD_VALIDATION_CODES.CARD_MISSING_RATIONALE,
        message: 'Card relationship provenance is missing a rationale.',
        field: 'provenance.rationale',
      });
    }
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Curiosity Card Registry Validation
// ---------------------------------------------------------------------------

/**
 * Validates a curiosity card registry against canonical invariants.
 * Pure function. No side effects.
 */
export function validateCuriosityCardRegistry(
  registry: CuriosityCardRegistry,
): CuriosityCardRegistryValidationResult {
  const errors: CuriosityCardValidationError[] = [];

  if (!registry.registryId || registry.registryId.trim() === '') {
    errors.push({
      code: CURIOUSITY_CARD_VALIDATION_CODES.CARD_EMPTY_REGISTRY,
      message: 'Registry is missing a registry ID.',
      field: 'registryId',
    });
  }

  if (!registry.cards || registry.cards.length === 0) {
    errors.push({
      code: CURIOUSITY_CARD_VALIDATION_CODES.CARD_EMPTY_REGISTRY,
      message: 'Registry has no cards.',
      field: 'cards',
    });
  }

  if (registry.deterministic !== true) {
    errors.push({
      code: CURIOUSITY_CARD_VALIDATION_CODES.CARD_INVALID_TRACE,
      message: 'Registry must declare deterministic: true.',
      field: 'deterministic',
    });
  }

  if (registry.randomUsed !== false) {
    errors.push({
      code: CURIOUSITY_CARD_VALIDATION_CODES.CARD_INVALID_TRACE,
      message: 'Registry must declare randomUsed: false.',
      field: 'randomUsed',
    });
  }

  if (registry.timeDependency !== false) {
    errors.push({
      code: CURIOUSITY_CARD_VALIDATION_CODES.CARD_INVALID_TRACE,
      message: 'Registry must declare timeDependency: false.',
      field: 'timeDependency',
    });
  }

  // Check for duplicate card IDs
  const seenIds = new Set<string>();
  for (const card of registry.cards) {
    if (seenIds.has(card.id)) {
      errors.push({
        code: CURIOUSITY_CARD_VALIDATION_CODES.CARD_DUPLICATE_ID,
        message: `Duplicate card ID: "${card.id}".`,
        cardId: card.id,
      });
    }
    seenIds.add(card.id);
  }

  // Check for duplicate titles
  const seenTitles = new Set<string>();
  for (const card of registry.cards) {
    if (seenTitles.has(card.title)) {
      errors.push({
        code: CURIOUSITY_CARD_VALIDATION_CODES.CARD_DUPLICATE_TITLE,
        message: `Duplicate card title: "${card.title}".`,
        field: 'title',
        cardId: card.id,
      });
    }
    seenTitles.add(card.title);
  }

  // Check for duplicate presentation IDs
  const seenPresentationIds = new Set<string>();
  for (const presentation of registry.presentations) {
    if (seenPresentationIds.has(presentation.presentationId)) {
      errors.push({
        code: CURIOUSITY_CARD_VALIDATION_CODES.CARD_PRESENTATION_DUPLICATE_ID,
        message: `Duplicate presentation ID: "${presentation.presentationId}".`,
        field: 'presentationId',
      });
    }
    seenPresentationIds.add(presentation.presentationId);
  }

  // Validate each card
  for (const card of registry.cards) {
    errors.push(...validateCuriosityCardProfile(card));
  }

  // Validate each engineer note
  for (const engineerNote of registry.engineerNotes) {
    errors.push(...validateEngineerNoteProfile(engineerNote));
  }

  // Validate each field note
  for (const fieldNote of registry.fieldNotes) {
    errors.push(...validateFieldNoteProfile(fieldNote));
  }

  // Validate each presentation
  for (const presentation of registry.presentations) {
    errors.push(...validateCardPresentationMetadata(presentation));
  }

  // Validate each relationship
  for (const relationship of registry.relationships) {
    errors.push(...validateCardRelationship(relationship));
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'curiosity_card_registry_composition',
  };
}

// ---------------------------------------------------------------------------
// Curiosity Card Input Validation
// ---------------------------------------------------------------------------

/**
 * Validates curiosity card input against canonical invariants.
 * Pure function. No side effects.
 */
export function validateCuriosityCardInput(
  input: CuriosityCardInput,
): CuriosityCardInputValidationResult {
  const errors: CuriosityCardValidationError[] = [];

  if (!input.cards || input.cards.length === 0) {
    errors.push({
      code: CURIOUSITY_CARD_VALIDATION_CODES.CARD_EMPTY_REGISTRY,
      message: 'Input has no cards.',
      field: 'cards',
    });
  } else {
    for (const card of input.cards) {
      errors.push(...validateCuriosityCardProfile(card));
    }
  }

  for (const engineerNote of input.engineerNotes) {
    errors.push(...validateEngineerNoteProfile(engineerNote));
  }

  for (const fieldNote of input.fieldNotes) {
    errors.push(...validateFieldNoteProfile(fieldNote));
  }

  for (const presentation of input.presentations) {
    errors.push(...validateCardPresentationMetadata(presentation));
  }

  for (const relationship of input.relationships) {
    errors.push(...validateCardRelationship(relationship));
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'curiosity_card_input_composition',
  };
}

// ---------------------------------------------------------------------------
// Curiosity Card Trace Validation
// ---------------------------------------------------------------------------

/**
 * Validates a curiosity card trace against canonical invariants.
 * Pure function. No side effects.
 */
export function validateCuriosityCardTrace(
  trace: CuriosityCardTrace,
): CuriosityCardTraceValidationResult {
  const errors: CuriosityCardValidationError[] = [];

  if (!trace.traceId || trace.traceId.trim() === '') {
    errors.push({
      code: CURIOUSITY_CARD_VALIDATION_CODES.CARD_INVALID_TRACE,
      message: 'Curiosity card trace is missing a trace ID.',
      field: 'traceId',
    });
  }

  if (trace.deterministic !== true) {
    errors.push({
      code: CURIOUSITY_CARD_VALIDATION_CODES.CARD_INVALID_TRACE,
      message: 'Curiosity card trace must declare deterministic: true.',
      field: 'deterministic',
    });
  }

  if (trace.randomUsed !== false) {
    errors.push({
      code: CURIOUSITY_CARD_VALIDATION_CODES.CARD_INVALID_TRACE,
      message: 'Curiosity card trace must declare randomUsed: false.',
      field: 'randomUsed',
    });
  }

  if (trace.timeDependency !== false) {
    errors.push({
      code: CURIOUSITY_CARD_VALIDATION_CODES.CARD_INVALID_TRACE,
      message: 'Curiosity card trace must declare timeDependency: false.',
      field: 'timeDependency',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'curiosity_card_trace_composition',
  };
}

// ---------------------------------------------------------------------------
// Curiosity Artifact With Cards Validation
// ---------------------------------------------------------------------------

/**
 * Validates a curiosity artifact with cards against canonical invariants.
 * Pure function. No side effects.
 */
export function validateCuriosityArtifactWithCards(
  artifact: CuriosityArtifactWithCards,
): CuriosityArtifactWithCardsValidationResult {
  const errors: CuriosityCardValidationError[] = [];

  if (!artifact.curiosityId || artifact.curiosityId.trim() === '') {
    errors.push({
      code: CURIOUSITY_CARD_VALIDATION_CODES.CARD_MISSING_CURIOSITY_REFERENCE,
      message: 'Curiosity artifact is missing a curiosity ID.',
      field: 'curiosityId',
    });
  }

  if (!artifact.title || artifact.title.trim() === '') {
    errors.push({
      code: CURIOUSITY_CARD_VALIDATION_CODES.CARD_MISSING_TITLE,
      message: 'Curiosity artifact is missing a title.',
      field: 'title',
    });
  }

  if (!artifact.cards || artifact.cards.length === 0) {
    errors.push({
      code: CURIOUSITY_CARD_VALIDATION_CODES.CARD_EMPTY_REGISTRY,
      message: 'Curiosity artifact has no cards.',
      field: 'cards',
    });
  } else {
    for (const card of artifact.cards) {
      errors.push(...validateCuriosityCardProfile(card));
    }
  }

  if (!artifact.provenance) {
    errors.push({
      code: CURIOUSITY_CARD_VALIDATION_CODES.CARD_MISSING_PROVENANCE,
      message: 'Curiosity artifact is missing provenance.',
      field: 'provenance',
    });
  } else {
    if (!artifact.provenance.provider || artifact.provenance.provider.trim() === '') {
      errors.push({
        code: CURIOUSITY_CARD_VALIDATION_CODES.CARD_MISSING_PROVIDER,
        message: 'Curiosity artifact provenance is missing a provider.',
        field: 'provenance.provider',
      });
    }

    if (!artifact.provenance.rationale || artifact.provenance.rationale.trim() === '') {
      errors.push({
        code: CURIOUSITY_CARD_VALIDATION_CODES.CARD_MISSING_RATIONALE,
        message: 'Curiosity artifact provenance is missing a rationale.',
        field: 'provenance.rationale',
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'curiosity_artifact_with_cards_composition',
  };
}
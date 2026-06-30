/**
 * NV-2100-D9-OPT-05 — Curiosity Card Kernel
 *
 * Deterministic orchestration functions for curiosity card metadata.
 * Produces card profiles, engineer notes, field notes, presentations, traces, and registries.
 *
 * This module never:
 * - Generates card text
 * - Summarizes concepts
 * - Writes engineer notes
 * - Creates field observations
 * - Formats markdown
 * - Produces HTML
 * - Renders UI
 * - Accesses filesystem
 * - Performs network requests
 * - Calls external APIs
 *
 * Curiosity card metadata only.
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
  CuriosityCardRegistryMetadata,
  CuriosityCardInput,
  CuriosityCardProvenance,
  CuriosityCardDecision,
  CuriosityCardTrace,
  CuriosityArtifactWithCards,
  CardType,
  InformationDensity,
  ReadingDuration,
  PresentationStyle,
  DiscoveryStyle,
  CardStatus,
  CuriosityGovernance,
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
// Curiosity Card Provenance Composition
// ---------------------------------------------------------------------------

/**
 * Composes curiosity card provenance from provided parameters.
 * Pure function. No side effects.
 */
export function composeCuriosityCardProvenance(params: {
  readonly provider: string;
  readonly source: string;
  readonly rationale: string;
  readonly version: string;
}): CuriosityCardProvenance {
  return {
    provider: params.provider,
    source: params.source,
    rationale: params.rationale,
    version: params.version,
  };
}

// ---------------------------------------------------------------------------
// Curiosity Card Decision Composition
// ---------------------------------------------------------------------------

/**
 * Composes a curiosity card decision from validation results.
 * Pure function. No side effects.
 */
function _composeCuriosityCardDecision(
  cardId: string,
  validationPassed: boolean,
  validationErrors: readonly string[],
): CuriosityCardDecision {
  return {
    decisionId: `_decision_${cardId}`,
    cardId,
    validationPassed,
    validationErrors,
  };
}

// ---------------------------------------------------------------------------
// Curiosity Card Trace Composition
// ---------------------------------------------------------------------------

/**
 * Composes a curiosity card trace from metadata.
 * Pure function. No side effects.
 */
export function composeCuriosityCardTrace(params: {
  readonly traceId: string;
}): CuriosityCardTrace {
  return {
    traceId: params.traceId,
    generatedFrom: 'deterministic_curiosity_card_kernel',
    deterministic: true,
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Curiosity Card Profile Composition
// ---------------------------------------------------------------------------

/**
 * Composes a curiosity card profile from provided parameters.
 * Pure function. No side effects.
 */
export function composeCuriosityCardProfile(params: {
  readonly id: string;
  readonly title: string;
  readonly cardType: CardType;
  readonly informationDensity: InformationDensity;
  readonly readingDuration: ReadingDuration;
  readonly presentationStyle: PresentationStyle;
  readonly discoveryStyle: DiscoveryStyle;
  readonly conceptIds: readonly string[];
  readonly status: CardStatus;
  readonly governance: CuriosityGovernance;
  readonly provenance: CuriosityCardProvenance;
  readonly trace: CuriosityCardTrace;
}): CuriosityCardProfile {
  return {
    id: params.id,
    title: params.title,
    cardType: params.cardType,
    informationDensity: params.informationDensity,
    readingDuration: params.readingDuration,
    presentationStyle: params.presentationStyle,
    discoveryStyle: params.discoveryStyle,
    conceptIds: [...params.conceptIds],
    status: params.status,
    governance: params.governance,
    provenance: params.provenance,
    trace: params.trace,
  };
}

// ---------------------------------------------------------------------------
// Engineer Note Profile Composition
// ---------------------------------------------------------------------------

/**
 * Composes an engineer note profile from provided parameters.
 * Pure function. No side effects.
 */
export function composeEngineerNoteProfile(params: {
  readonly id: string;
  readonly title: string;
  readonly engineeringRelevance: string;
  readonly implementationPerspective: string;
  readonly realWorldInsight: string;
  readonly practicalTakeaway: string;
  readonly technicalEmphasis: string;
  readonly conceptIds: readonly string[];
  readonly status: CardStatus;
  readonly governance: CuriosityGovernance;
  readonly provenance: CuriosityCardProvenance;
  readonly trace: CuriosityCardTrace;
}): EngineerNoteProfile {
  return {
    id: params.id,
    title: params.title,
    engineeringRelevance: params.engineeringRelevance,
    implementationPerspective: params.implementationPerspective,
    realWorldInsight: params.realWorldInsight,
    practicalTakeaway: params.practicalTakeaway,
    technicalEmphasis: params.technicalEmphasis,
    conceptIds: [...params.conceptIds],
    status: params.status,
    governance: params.governance,
    provenance: params.provenance,
    trace: params.trace,
  };
}

// ---------------------------------------------------------------------------
// Field Note Profile Composition
// ---------------------------------------------------------------------------

/**
 * Composes a field note profile from provided parameters.
 * Pure function. No side effects.
 */
export function composeFieldNoteProfile(params: {
  readonly id: string;
  readonly title: string;
  readonly observation: string;
  readonly experiment: string;
  readonly historicalAnecdote: string;
  readonly scientificDiscovery: string;
  readonly engineeringLesson: string;
  readonly conceptIds: readonly string[];
  readonly status: CardStatus;
  readonly governance: CuriosityGovernance;
  readonly provenance: CuriosityCardProvenance;
  readonly trace: CuriosityCardTrace;
}): FieldNoteProfile {
  return {
    id: params.id,
    title: params.title,
    observation: params.observation,
    experiment: params.experiment,
    historicalAnecdote: params.historicalAnecdote,
    scientificDiscovery: params.scientificDiscovery,
    engineeringLesson: params.engineeringLesson,
    conceptIds: [...params.conceptIds],
    status: params.status,
    governance: params.governance,
    provenance: params.provenance,
    trace: params.trace,
  };
}

// ---------------------------------------------------------------------------
// Card Presentation Metadata Composition
// ---------------------------------------------------------------------------

/**
 * Composes card presentation metadata from provided parameters.
 * Pure function. No side effects.
 */
export function composeCardPresentationMetadata(params: {
  readonly presentationId: string;
  readonly cardId: string;
  readonly presentationStyle: PresentationStyle;
  readonly informationDensity: InformationDensity;
  readonly readingDuration: ReadingDuration;
  readonly discoveryStyle: DiscoveryStyle;
}): CardPresentationMetadata {
  return {
    presentationId: params.presentationId,
    cardId: params.cardId,
    presentationStyle: params.presentationStyle,
    informationDensity: params.informationDensity,
    readingDuration: params.readingDuration,
    discoveryStyle: params.discoveryStyle,
  };
}

// ---------------------------------------------------------------------------
// Card Relationship Composition
// ---------------------------------------------------------------------------

/**
 * Composes a card relationship from provided parameters.
 * Pure function. No side effects.
 */
export function composeCardRelationship(params: {
  readonly relationshipId: string;
  readonly sourceCardId: string;
  readonly targetCardId: string;
  readonly relationshipType: string;
  readonly description: string;
  readonly provenance: CuriosityCardProvenance;
}): CardRelationship {
  return {
    relationshipId: params.relationshipId,
    sourceCardId: params.sourceCardId,
    targetCardId: params.targetCardId,
    relationshipType: params.relationshipType,
    description: params.description,
    provenance: params.provenance,
  };
}

// ---------------------------------------------------------------------------
// Deterministic Sort Comparator for Cards
// ---------------------------------------------------------------------------

/**
 * Deterministic comparator for curiosity card profiles.
 * Sorts by id, then cardType, then title.
 * Pure function. No side effects.
 */
function _compareCuriosityCardProfile(
  a: CuriosityCardProfile,
  b: CuriosityCardProfile,
): number {
  if (a.id < b.id) return -1;
  if (a.id > b.id) return 1;

  if (a.cardType < b.cardType) return -1;
  if (a.cardType > b.cardType) return 1;

  if (a.title < b.title) return -1;
  if (a.title > b.title) return 1;

  return 0;
}

// ---------------------------------------------------------------------------
// Deterministic Sort Comparator for Engineer Notes
// ---------------------------------------------------------------------------

/**
 * Deterministic comparator for engineer note profiles.
 * Sorts by id.
 * Pure function. No side effects.
 */
function _compareEngineerNoteProfile(
  a: EngineerNoteProfile,
  b: EngineerNoteProfile,
): number {
  if (a.id < b.id) return -1;
  if (a.id > b.id) return 1;

  return 0;
}

// ---------------------------------------------------------------------------
// Deterministic Sort Comparator for Field Notes
// ---------------------------------------------------------------------------

/**
 * Deterministic comparator for field note profiles.
 * Sorts by id.
 * Pure function. No side effects.
 */
function _compareFieldNoteProfile(
  a: FieldNoteProfile,
  b: FieldNoteProfile,
): number {
  if (a.id < b.id) return -1;
  if (a.id > b.id) return 1;

  return 0;
}

// ---------------------------------------------------------------------------
// Deterministic Sort Comparator for Presentations
// ---------------------------------------------------------------------------

/**
 * Deterministic comparator for card presentation metadata.
 * Sorts by presentationId.
 * Pure function. No side effects.
 */
function _compareCardPresentationMetadata(
  a: CardPresentationMetadata,
  b: CardPresentationMetadata,
): number {
  if (a.presentationId < b.presentationId) return -1;
  if (a.presentationId > b.presentationId) return 1;

  return 0;
}

// ---------------------------------------------------------------------------
// Deterministic Sort Comparator for Relationships
// ---------------------------------------------------------------------------

/**
 * Deterministic comparator for card relationships.
 * Sorts by relationshipId.
 * Pure function. No side effects.
 */
function _compareCardRelationship(
  a: CardRelationship,
  b: CardRelationship,
): number {
  if (a.relationshipId < b.relationshipId) return -1;
  if (a.relationshipId > b.relationshipId) return 1;

  return 0;
}

// ---------------------------------------------------------------------------
// Curiosity Card Registry Composition
// ---------------------------------------------------------------------------

/**
 * Composes a curiosity card registry from cards, engineer notes, field notes, presentations, and relationships.
 * Pure function. No side effects.
 * Deterministic ordering: id → cardType → title.
 */
export function composeCuriosityCardRegistry(
  cards: readonly CuriosityCardProfile[],
  engineerNotes: readonly EngineerNoteProfile[],
  fieldNotes: readonly FieldNoteProfile[],
  presentations: readonly CardPresentationMetadata[],
  relationships: readonly CardRelationship[],
): CuriosityCardRegistry {
  const sortedCards = [...cards].sort(_compareCuriosityCardProfile);
  const sortedEngineerNotes = [...engineerNotes].sort(_compareEngineerNoteProfile);
  const sortedFieldNotes = [...fieldNotes].sort(_compareFieldNoteProfile);
  const sortedPresentations = [...presentations].sort(_compareCardPresentationMetadata);
  const sortedRelationships = [...relationships].sort(_compareCardRelationship);

  const metadata: CuriosityCardRegistryMetadata = {
    registryId: `_registry_${sortedCards.length}_${sortedEngineerNotes.length}_${sortedFieldNotes.length}_${sortedPresentations.length}_${sortedRelationships.length}`,
    version: '1.0.0',
    cardCount: sortedCards.length,
    engineerNoteCount: sortedEngineerNotes.length,
    fieldNoteCount: sortedFieldNotes.length,
    presentationCount: sortedPresentations.length,
    relationshipCount: sortedRelationships.length,
  };

  return {
    registryId: metadata.registryId,
    cards: sortedCards,
    engineerNotes: sortedEngineerNotes,
    fieldNotes: sortedFieldNotes,
    presentations: sortedPresentations,
    relationships: sortedRelationships,
    metadata,
    trace: {
      traceId: `_trace_${sortedCards.length}_${sortedEngineerNotes.length}_${sortedFieldNotes.length}_${sortedPresentations.length}_${sortedRelationships.length}`,
      generatedFrom: 'deterministic_curiosity_card_kernel',
      deterministic: true,
      randomUsed: false,
      timeDependency: false,
    },
    deterministic: true,
    generatedFrom: 'deterministic_curiosity_card_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Curiosity Card Registry From Input Composition
// ---------------------------------------------------------------------------

/**
 * Composes a curiosity card registry from an input.
 * Pure function. No side effects.
 */
export function composeCuriosityCardRegistryFromInput(
  input: CuriosityCardInput,
): CuriosityCardRegistry {
  return composeCuriosityCardRegistry(input.cards, input.engineerNotes, input.fieldNotes, input.presentations, input.relationships);
}

// ---------------------------------------------------------------------------
// Curiosity Cards Composition (Main Entry Point)
// ---------------------------------------------------------------------------

/**
 * Composes a complete curiosity card registry from an input.
 * Pure function. No side effects.
 */
export function composeCuriosityCards(
  input: CuriosityCardInput,
): CuriosityCardRegistry {
  const registry = composeCuriosityCardRegistry(input.cards, input.engineerNotes, input.fieldNotes, input.presentations, input.relationships);

  return {
    ...registry,
    trace: composeCuriosityCardTrace({
      traceId: `_trace_${input.cards.length}_${input.engineerNotes.length}_${input.fieldNotes.length}_${input.presentations.length}_${input.relationships.length}`,
    }),
  };
}

// ---------------------------------------------------------------------------
// Curiosity Artifact With Cards Composition
// ---------------------------------------------------------------------------

/**
 * Composes a curiosity artifact with cards from provided parameters.
 * Pure function. No side effects.
 */
export function composeCuriosityArtifactWithCards(params: {
  readonly curiosityId: string;
  readonly title: string;
  readonly cards: readonly CuriosityCardProfile[];
  readonly engineerNotes: readonly EngineerNoteProfile[];
  readonly fieldNotes: readonly FieldNoteProfile[];
  readonly presentations: readonly CardPresentationMetadata[];
  readonly relationships: readonly CardRelationship[];
  readonly provenance: CuriosityCardProvenance;
}): CuriosityArtifactWithCards {
  return {
    curiosityId: params.curiosityId,
    title: params.title,
    cards: [...params.cards],
    engineerNotes: [...params.engineerNotes],
    fieldNotes: [...params.fieldNotes],
    presentations: [...params.presentations],
    relationships: [...params.relationships],
    provenance: params.provenance,
  };
}

// ---------------------------------------------------------------------------
// Helper Functions — Type Guards
// ---------------------------------------------------------------------------

/**
 * Checks if a string is a supported card type.
 */
export function isSupportedCardType(
  cardType: string,
): cardType is CardType {
  return CANONICAL_CARD_TYPES.includes(cardType as CardType);
}

/**
 * Checks if a string is a supported information density.
 */
export function isSupportedInformationDensity(
  density: string,
): density is InformationDensity {
  return CANONICAL_INFORMATION_DENSITY.includes(density as InformationDensity);
}

/**
 * Checks if a string is a supported reading duration.
 */
export function isSupportedReadingDuration(
  duration: string,
): duration is ReadingDuration {
  return CANONICAL_READING_DURATION.includes(duration as ReadingDuration);
}

/**
 * Checks if a string is a supported presentation style.
 */
export function isSupportedPresentationStyle(
  style: string,
): style is PresentationStyle {
  return CANONICAL_PRESENTATION_STYLE.includes(style as PresentationStyle);
}

/**
 * Checks if a string is a supported discovery style.
 */
export function isSupportedDiscoveryStyle(
  style: string,
): style is DiscoveryStyle {
  return CANONICAL_DISCOVERY_STYLE.includes(style as DiscoveryStyle);
}

/**
 * Checks if a string is a supported card status.
 */
export function isSupportedCardStatus(
  status: string,
): status is CardStatus {
  return CANONICAL_CARD_STATUS.includes(status as CardStatus);
}

/**
 * Checks if a string is a supported card governance.
 */
export function isSupportedCardGovernance(
  governance: string,
): governance is CuriosityGovernance {
  return CANONICAL_CURIOSITY_GOVERNANCE.includes(governance as CuriosityGovernance);
}

// ---------------------------------------------------------------------------
// Helper Functions — Canonical Getters
// ---------------------------------------------------------------------------

/**
 * Returns the canonical card types.
 */
export function getCanonicalCardTypes(): readonly CardType[] {
  return [...CANONICAL_CARD_TYPES];
}

/**
 * Returns the canonical information density values.
 */
export function getCanonicalInformationDensity(): readonly InformationDensity[] {
  return [...CANONICAL_INFORMATION_DENSITY];
}

/**
 * Returns the canonical reading durations.
 */
export function getCanonicalReadingDurations(): readonly ReadingDuration[] {
  return [...CANONICAL_READING_DURATION];
}

/**
 * Returns the canonical presentation styles.
 */
export function getCanonicalPresentationStyles(): readonly PresentationStyle[] {
  return [...CANONICAL_PRESENTATION_STYLE];
}

/**
 * Returns the canonical discovery styles.
 */
export function getCanonicalDiscoveryStyles(): readonly DiscoveryStyle[] {
  return [...CANONICAL_DISCOVERY_STYLE];
}

/**
 * Returns the canonical card statuses.
 */
export function getCanonicalCardStatuses(): readonly CardStatus[] {
  return [...CANONICAL_CARD_STATUS];
}

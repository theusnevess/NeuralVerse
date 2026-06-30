/**
 * NV-2100-D9-OPT-09 — Misconception Curiosity Kernel
 *
 * Deterministic orchestration functions for misconception curiosity metadata.
 * Produces misconception cards, assessment reinforcement references, corrective insights, traces, and registries.
 *
 * This module never:
 * - Diagnoses learners
 * - Detects misconceptions automatically
 * - Evaluates assessments
 * - Personalizes remediation
 * - Invokes the Assessment Agent
 * - Accesses filesystem
 * - Performs network requests
 * - Calls external APIs
 *
 * Misconception curiosity metadata only.
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import type {
  MisconceptionCard,
  AssessmentReinforcementReference,
  CorrectiveInsight,
  MisconceptionRelationship,
  MisconceptionRegistry,
  MisconceptionRegistryMetadata,
  MisconceptionInput,
  MisconceptionCuriosityProvenance,
  MisconceptionCuriosityDecision,
  MisconceptionCuriosityTrace,
  CuriosityArtifactWithMisconceptions,
  MisconceptionCardType,
  ReinforcementReferenceType,
  MisconceptionImportance,
  CorrectiveOutcome,
  MisconceptionCuriosityStatus,
  CuriosityGovernance,
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
// Misconception Curiosity Provenance Composition
// ---------------------------------------------------------------------------

/**
 * Composes misconception curiosity provenance from provided parameters.
 * Pure function. No side effects.
 */
export function composeMisconceptionCuriosityProvenance(params: {
  readonly provider: string;
  readonly source: string;
  readonly rationale: string;
  readonly version: string;
}): MisconceptionCuriosityProvenance {
  return {
    provider: params.provider,
    source: params.source,
    rationale: params.rationale,
    version: params.version,
  };
}

// ---------------------------------------------------------------------------
// Misconception Curiosity Decision Composition
// ---------------------------------------------------------------------------

/**
 * Composes a misconception curiosity decision from validation results.
 * Pure function. No side effects.
 */
function _composeMisconceptionCuriosityDecision(
  profileId: string,
  validationPassed: boolean,
  validationErrors: readonly string[],
): MisconceptionCuriosityDecision {
  return {
    decisionId: `_decision_${profileId}`,
    profileId,
    validationPassed,
    validationErrors,
  };
}

// ---------------------------------------------------------------------------
// Misconception Curiosity Trace Composition
// ---------------------------------------------------------------------------

/**
 * Composes a misconception curiosity trace from metadata.
 * Pure function. No side effects.
 */
export function composeMisconceptionCuriosityTrace(params: {
  readonly traceId: string;
}): MisconceptionCuriosityTrace {
  return {
    traceId: params.traceId,
    generatedFrom: 'deterministic_misconception_curiosity_kernel',
    deterministic: true,
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Misconception Card Composition
// ---------------------------------------------------------------------------

/**
 * Composes a misconception card from provided parameters.
 * Pure function. No side effects.
 */
export function composeMisconceptionCard(params: {
  readonly cardId: string;
  readonly title: string;
  readonly cardType: MisconceptionCardType;
  readonly misconceptionDescription: string;
  readonly correctionDescription: string;
  readonly importance: MisconceptionImportance;
  readonly conceptIds: readonly string[];
  readonly status: MisconceptionCuriosityStatus;
  readonly governance: CuriosityGovernance;
  readonly provenance: MisconceptionCuriosityProvenance;
  readonly trace: MisconceptionCuriosityTrace;
}): MisconceptionCard {
  return {
    cardId: params.cardId,
    title: params.title,
    cardType: params.cardType,
    misconceptionDescription: params.misconceptionDescription,
    correctionDescription: params.correctionDescription,
    importance: params.importance,
    conceptIds: [...params.conceptIds],
    status: params.status,
    governance: params.governance,
    provenance: params.provenance,
    trace: params.trace,
  };
}

// ---------------------------------------------------------------------------
// Assessment Reinforcement Reference Composition
// ---------------------------------------------------------------------------

/**
 * Composes an assessment reinforcement reference from provided parameters.
 * Pure function. No side effects.
 */
export function composeAssessmentReinforcementReference(params: {
  readonly referenceId: string;
  readonly title: string;
  readonly referenceType: ReinforcementReferenceType;
  readonly referenceDescription: string;
  readonly relatedCardId: string;
  readonly conceptIds: readonly string[];
  readonly status: MisconceptionCuriosityStatus;
  readonly governance: CuriosityGovernance;
  readonly provenance: MisconceptionCuriosityProvenance;
  readonly trace: MisconceptionCuriosityTrace;
}): AssessmentReinforcementReference {
  return {
    referenceId: params.referenceId,
    title: params.title,
    referenceType: params.referenceType,
    referenceDescription: params.referenceDescription,
    relatedCardId: params.relatedCardId,
    conceptIds: [...params.conceptIds],
    status: params.status,
    governance: params.governance,
    provenance: params.provenance,
    trace: params.trace,
  };
}

// ---------------------------------------------------------------------------
// Corrective Insight Composition
// ---------------------------------------------------------------------------

/**
 * Composes a corrective insight from provided parameters.
 * Pure function. No side effects.
 */
export function composeCorrectiveInsight(params: {
  readonly insightId: string;
  readonly cardId: string;
  readonly insightTitle: string;
  readonly insightDescription: string;
  readonly correctiveOutcome: CorrectiveOutcome;
  readonly conceptIds: readonly string[];
  readonly status: MisconceptionCuriosityStatus;
  readonly governance: CuriosityGovernance;
  readonly provenance: MisconceptionCuriosityProvenance;
  readonly trace: MisconceptionCuriosityTrace;
}): CorrectiveInsight {
  return {
    insightId: params.insightId,
    cardId: params.cardId,
    insightTitle: params.insightTitle,
    insightDescription: params.insightDescription,
    correctiveOutcome: params.correctiveOutcome,
    conceptIds: [...params.conceptIds],
    status: params.status,
    governance: params.governance,
    provenance: params.provenance,
    trace: params.trace,
  };
}

// ---------------------------------------------------------------------------
// Misconception Relationship Composition
// ---------------------------------------------------------------------------

/**
 * Composes a misconception relationship from provided parameters.
 * Pure function. No side effects.
 */
export function composeMisconceptionRelationship(params: {
  readonly relationshipId: string;
  readonly sourceCardId: string;
  readonly targetCardId: string;
  readonly relationshipType: string;
  readonly description: string;
  readonly provenance: MisconceptionCuriosityProvenance;
}): MisconceptionRelationship {
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
 * Deterministic comparator for misconception cards.
 * Sorts by cardId, then cardType, then title.
 * Pure function. No side effects.
 */
function _compareMisconceptionCard(
  a: MisconceptionCard,
  b: MisconceptionCard,
): number {
  if (a.cardId < b.cardId) return -1;
  if (a.cardId > b.cardId) return 1;

  if (a.cardType < b.cardType) return -1;
  if (a.cardType > b.cardType) return 1;

  if (a.title < b.title) return -1;
  if (a.title > b.title) return 1;

  return 0;
}

// ---------------------------------------------------------------------------
// Deterministic Sort Comparator for References
// ---------------------------------------------------------------------------

/**
 * Deterministic comparator for assessment reinforcement references.
 * Sorts by referenceId.
 * Pure function. No side effects.
 */
function _compareAssessmentReinforcementReference(
  a: AssessmentReinforcementReference,
  b: AssessmentReinforcementReference,
): number {
  if (a.referenceId < b.referenceId) return -1;
  if (a.referenceId > b.referenceId) return 1;

  return 0;
}

// ---------------------------------------------------------------------------
// Deterministic Sort Comparator for Insights
// ---------------------------------------------------------------------------

/**
 * Deterministic comparator for corrective insights.
 * Sorts by insightId.
 * Pure function. No side effects.
 */
function _compareCorrectiveInsight(
  a: CorrectiveInsight,
  b: CorrectiveInsight,
): number {
  if (a.insightId < b.insightId) return -1;
  if (a.insightId > b.insightId) return 1;

  return 0;
}

// ---------------------------------------------------------------------------
// Deterministic Sort Comparator for Relationships
// ---------------------------------------------------------------------------

/**
 * Deterministic comparator for misconception relationships.
 * Sorts by relationshipId.
 * Pure function. No side effects.
 */
function _compareMisconceptionRelationship(
  a: MisconceptionRelationship,
  b: MisconceptionRelationship,
): number {
  if (a.relationshipId < b.relationshipId) return -1;
  if (a.relationshipId > b.relationshipId) return 1;

  return 0;
}

// ---------------------------------------------------------------------------
// Misconception Registry Composition
// ---------------------------------------------------------------------------

/**
 * Composes a misconception registry from cards, references, insights, and relationships.
 * Pure function. No side effects.
 * Deterministic ordering: cardId → cardType → title.
 */
export function composeMisconceptionRegistry(
  cards: readonly MisconceptionCard[],
  references: readonly AssessmentReinforcementReference[],
  insights: readonly CorrectiveInsight[],
  relationships: readonly MisconceptionRelationship[],
): MisconceptionRegistry {
  const sortedCards = [...cards].sort(_compareMisconceptionCard);
  const sortedReferences = [...references].sort(_compareAssessmentReinforcementReference);
  const sortedInsights = [...insights].sort(_compareCorrectiveInsight);
  const sortedRelationships = [...relationships].sort(_compareMisconceptionRelationship);

  const metadata: MisconceptionRegistryMetadata = {
    registryId: `_registry_${sortedCards.length}_${sortedReferences.length}_${sortedInsights.length}_${sortedRelationships.length}`,
    version: '1.0.0',
    cardCount: sortedCards.length,
    referenceCount: sortedReferences.length,
    insightCount: sortedInsights.length,
    relationshipCount: sortedRelationships.length,
  };

  return {
    registryId: metadata.registryId,
    cards: sortedCards,
    references: sortedReferences,
    insights: sortedInsights,
    relationships: sortedRelationships,
    metadata,
    trace: {
      traceId: `_trace_${sortedCards.length}_${sortedReferences.length}_${sortedInsights.length}_${sortedRelationships.length}`,
      generatedFrom: 'deterministic_misconception_curiosity_kernel',
      deterministic: true,
      randomUsed: false,
      timeDependency: false,
    },
    deterministic: true,
    generatedFrom: 'deterministic_misconception_curiosity_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Misconception Registry From Input Composition
// ---------------------------------------------------------------------------

/**
 * Composes a misconception registry from an input.
 * Pure function. No side effects.
 */
export function composeMisconceptionRegistryFromInput(
  input: MisconceptionInput,
): MisconceptionRegistry {
  return composeMisconceptionRegistry(input.cards, input.references, input.insights, input.relationships);
}

// ---------------------------------------------------------------------------
// Misconception Artifacts Composition (Main Entry Point)
// ---------------------------------------------------------------------------

/**
 * Composes a complete misconception registry from an input.
 * Pure function. No side effects.
 */
export function composeMisconceptionArtifacts(
  input: MisconceptionInput,
): MisconceptionRegistry {
  const registry = composeMisconceptionRegistry(input.cards, input.references, input.insights, input.relationships);

  return {
    ...registry,
    trace: composeMisconceptionCuriosityTrace({
      traceId: `_trace_${input.cards.length}_${input.references.length}_${input.insights.length}_${input.relationships.length}`,
    }),
  };
}

// ---------------------------------------------------------------------------
// Curiosity Artifact With Misconceptions Composition
// ---------------------------------------------------------------------------

/**
 * Composes a curiosity artifact with misconceptions from provided parameters.
 * Pure function. No side effects.
 */
export function composeCuriosityArtifactWithMisconceptions(params: {
  readonly curiosityId: string;
  readonly title: string;
  readonly cards: readonly MisconceptionCard[];
  readonly references: readonly AssessmentReinforcementReference[];
  readonly insights: readonly CorrectiveInsight[];
  readonly relationships: readonly MisconceptionRelationship[];
  readonly provenance: MisconceptionCuriosityProvenance;
}): CuriosityArtifactWithMisconceptions {
  return {
    curiosityId: params.curiosityId,
    title: params.title,
    cards: [...params.cards],
    references: [...params.references],
    insights: [...params.insights],
    relationships: [...params.relationships],
    provenance: params.provenance,
  };
}

// ---------------------------------------------------------------------------
// Helper Functions — Type Guards
// ---------------------------------------------------------------------------

/**
 * Checks if a string is a supported misconception card type.
 */
export function isSupportedMisconceptionCardType(
  cardType: string,
): cardType is MisconceptionCardType {
  return CANONICAL_MISCONCEPTION_CARD_TYPES.includes(cardType as MisconceptionCardType);
}

/**
 * Checks if a string is a supported reinforcement reference type.
 */
export function isSupportedReinforcementReferenceType(
  referenceType: string,
): referenceType is ReinforcementReferenceType {
  return CANONICAL_REINFORCEMENT_REFERENCE_TYPES.includes(referenceType as ReinforcementReferenceType);
}

/**
 * Checks if a string is a supported misconception importance.
 */
export function isSupportedMisconceptionImportance(
  importance: string,
): importance is MisconceptionImportance {
  return CANONICAL_MISCONCEPTION_IMPORTANCE.includes(importance as MisconceptionImportance);
}

/**
 * Checks if a string is a supported corrective outcome.
 */
export function isSupportedCorrectiveOutcome(
  outcome: string,
): outcome is CorrectiveOutcome {
  return CANONICAL_CORRECTIVE_OUTCOMES.includes(outcome as CorrectiveOutcome);
}

/**
 * Checks if a string is a supported misconception curiosity status.
 */
export function isSupportedMisconceptionCuriosityStatus(
  status: string,
): status is MisconceptionCuriosityStatus {
  return CANONICAL_MISCONCEPTION_CURIOSITY_STATUS.includes(status as MisconceptionCuriosityStatus);
}

/**
 * Checks if a string is a supported misconception curiosity governance.
 */
export function isSupportedMisconceptionCuriosityGovernance(
  governance: string,
): governance is CuriosityGovernance {
  return CANONICAL_CURIOSITY_GOVERNANCE.includes(governance as CuriosityGovernance);
}

// ---------------------------------------------------------------------------
// Helper Functions — Canonical Getters
// ---------------------------------------------------------------------------

/**
 * Returns the canonical misconception card types.
 */
export function getCanonicalMisconceptionCardTypes(): readonly MisconceptionCardType[] {
  return [...CANONICAL_MISCONCEPTION_CARD_TYPES];
}

/**
 * Returns the canonical reinforcement reference types.
 */
export function getCanonicalReinforcementReferenceTypes(): readonly ReinforcementReferenceType[] {
  return [...CANONICAL_REINFORCEMENT_REFERENCE_TYPES];
}

/**
 * Returns the canonical misconception importance values.
 */
export function getCanonicalMisconceptionImportance(): readonly MisconceptionImportance[] {
  return [...CANONICAL_MISCONCEPTION_IMPORTANCE];
}

/**
 * Returns the canonical corrective outcomes.
 */
export function getCanonicalCorrectiveOutcomes(): readonly CorrectiveOutcome[] {
  return [...CANONICAL_CORRECTIVE_OUTCOMES];
}

/**
 * Returns the canonical misconception curiosity statuses.
 */
export function getCanonicalMisconceptionCuriosityStatuses(): readonly MisconceptionCuriosityStatus[] {
  return [...CANONICAL_MISCONCEPTION_CURIOSITY_STATUS];
}

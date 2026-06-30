/**
 * NV-1700-D6-OPT-04 — Analogy, Metaphor & Intuition Modeling Kernel
 *
 * Deterministic orchestration functions for analogy metadata.
 * Produces analogies, metaphors, intuitions, mappings, bridges, and registries.
 *
 * This module never:
 * - Generates analogies
 * - Invents metaphors
 * - Infers intuition automatically
 * - Rewrites explanations
 * - Personalizes analogies
 * - Infers learner understanding
 * - Generates educational content
 * - Executes reasoning
 * - Calls LLMs
 * - Calls external APIs
 * - Mutates knowledge
 *
 * Analogy metadata only.
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import type {
  AnalogyProvenance,
  NarrativeGovernanceStatus,
  AnalogyType,
  MetaphorType,
  IntuitionType,
  MappingType,
  AbstractionLevel,
  AnalogyStatus,
  Analogy,
  Metaphor,
  Intuition,
  ConceptMapping,
  CognitiveBridge,
  AnalogyDecision,
  AnalogyTrace,
  AnalogyRegistry,
  AnalogyRegistryMetadata,
  AnalogyInput,
  NarrativeUnitType,
  NarrativeMode,
  NarrativeDomain,
  NarrativeStatus,
  NarrativeProvenance,
  NarrativeArtifactWithAnalogies,
} from './NarrativeAgentContract.ts';

import {
  CANONICAL_ANALOGY_TYPES,
  CANONICAL_METAPHOR_TYPES,
  CANONICAL_INTUITION_TYPES,
  CANONICAL_MAPPING_TYPES,
  CANONICAL_ABSTRACTION_LEVELS,
  CANONICAL_ANALOGY_STATUS,
  CANONICAL_GOVERNANCE_STATUSES,
} from './NarrativeAgentContract.ts';

// ---------------------------------------------------------------------------
// Analogy Provenance Composition
// ---------------------------------------------------------------------------

/**
 * Composes analogy provenance from provided parameters.
 * Pure function. No side effects.
 */
export function composeAnalogyProvenance(params: {
  readonly source: string;
  readonly governanceStatus: NarrativeGovernanceStatus;
  readonly providedBy: string;
  readonly rationale: string;
}): AnalogyProvenance {
  return {
    source: params.source,
    governanceStatus: params.governanceStatus,
    providedBy: params.providedBy,
    rationale: params.rationale,
  };
}

// ---------------------------------------------------------------------------
// Analogy Composition
// ---------------------------------------------------------------------------

/**
 * Composes an analogy from provided parameters.
 * Pure function. No side effects.
 */
export function composeAnalogy(params: {
  readonly analogyId: string;
  readonly analogyType: AnalogyType;
  readonly title: string;
  readonly description: string;
  readonly sourceConceptId: string;
  readonly targetConceptId: string;
  readonly mappingId: string;
  readonly abstractionLevel: AbstractionLevel;
  readonly governanceStatus: NarrativeGovernanceStatus;
  readonly provenance: AnalogyProvenance;
}): Analogy {
  return {
    analogyId: params.analogyId,
    analogyType: params.analogyType,
    title: params.title,
    description: params.description,
    sourceConceptId: params.sourceConceptId,
    targetConceptId: params.targetConceptId,
    mappingId: params.mappingId,
    abstractionLevel: params.abstractionLevel,
    governanceStatus: params.governanceStatus,
    provenance: params.provenance,
  };
}

// ---------------------------------------------------------------------------
// Metaphor Composition
// ---------------------------------------------------------------------------

/**
 * Composes a metaphor from provided parameters.
 * Pure function. No side effects.
 */
export function composeMetaphor(params: {
  readonly metaphorId: string;
  readonly metaphorType: MetaphorType;
  readonly title: string;
  readonly description: string;
  readonly relatedAnalogyId: string;
  readonly governanceStatus: NarrativeGovernanceStatus;
  readonly provenance: AnalogyProvenance;
}): Metaphor {
  return {
    metaphorId: params.metaphorId,
    metaphorType: params.metaphorType,
    title: params.title,
    description: params.description,
    relatedAnalogyId: params.relatedAnalogyId,
    governanceStatus: params.governanceStatus,
    provenance: params.provenance,
  };
}

// ---------------------------------------------------------------------------
// Intuition Composition
// ---------------------------------------------------------------------------

/**
 * Composes an intuition from provided parameters.
 * Pure function. No side effects.
 */
export function composeIntuition(params: {
  readonly intuitionId: string;
  readonly intuitionType: IntuitionType;
  readonly title: string;
  readonly description: string;
  readonly supportedConceptId: string;
  readonly abstractionLevel: AbstractionLevel;
  readonly governanceStatus: NarrativeGovernanceStatus;
  readonly provenance: AnalogyProvenance;
}): Intuition {
  return {
    intuitionId: params.intuitionId,
    intuitionType: params.intuitionType,
    title: params.title,
    description: params.description,
    supportedConceptId: params.supportedConceptId,
    abstractionLevel: params.abstractionLevel,
    governanceStatus: params.governanceStatus,
    provenance: params.provenance,
  };
}

// ---------------------------------------------------------------------------
// Concept Mapping Composition
// ---------------------------------------------------------------------------

/**
 * Composes a concept mapping from provided parameters.
 * Pure function. No side effects.
 */
export function composeConceptMapping(params: {
  readonly mappingId: string;
  readonly mappingType: MappingType;
  readonly sourceArtifactId: string;
  readonly targetArtifactId: string;
  readonly description: string;
  readonly governanceStatus: NarrativeGovernanceStatus;
  readonly provenance: AnalogyProvenance;
}): ConceptMapping {
  return {
    mappingId: params.mappingId,
    mappingType: params.mappingType,
    sourceArtifactId: params.sourceArtifactId,
    targetArtifactId: params.targetArtifactId,
    description: params.description,
    governanceStatus: params.governanceStatus,
    provenance: params.provenance,
  };
}

// ---------------------------------------------------------------------------
// Cognitive Bridge Composition
// ---------------------------------------------------------------------------

/**
 * Composes a cognitive bridge from provided parameters.
 * Pure function. No side effects.
 */
export function composeCognitiveBridge(params: {
  readonly bridgeId: string;
  readonly analogyId: string;
  readonly metaphorId: string;
  readonly intuitionId: string;
  readonly mappingId: string;
  readonly bridgePurpose: string;
  readonly governanceStatus: NarrativeGovernanceStatus;
  readonly provenance: AnalogyProvenance;
}): CognitiveBridge {
  return {
    bridgeId: params.bridgeId,
    analogyId: params.analogyId,
    metaphorId: params.metaphorId,
    intuitionId: params.intuitionId,
    mappingId: params.mappingId,
    bridgePurpose: params.bridgePurpose,
    governanceStatus: params.governanceStatus,
    provenance: params.provenance,
  };
}

// ---------------------------------------------------------------------------
// Analogy Decision Composition
// ---------------------------------------------------------------------------

/**
 * Composes an analogy decision from validation results.
 * Pure function. No side effects.
 */
function _composeAnalogyDecision(
  analogyId: string,
  validationPassed: boolean,
  validationErrors: readonly string[],
): AnalogyDecision {
  return {
    decisionId: `_decision_${analogyId}`,
    analogyId,
    validationPassed,
    validationErrors,
  };
}

// ---------------------------------------------------------------------------
// Analogy Trace Composition
// ---------------------------------------------------------------------------

/**
 * Composes an analogy trace from decisions and metadata.
 * Pure function. No side effects.
 */
export function composeAnalogyTrace(params: {
  readonly traceId: string;
  readonly decisions: readonly AnalogyDecision[];
  readonly registryVersion: string;
  readonly pipelineVersion: string;
  readonly analogyCount: number;
  readonly metaphorCount: number;
  readonly intuitionCount: number;
  readonly mappingCount: number;
  readonly bridgeCount: number;
}): AnalogyTrace {
  return {
    traceId: params.traceId,
    decisionCount: params.decisions.length,
    validationCount: params.decisions.filter((d) => d.validationPassed).length,
    analogyCount: params.analogyCount,
    metaphorCount: params.metaphorCount,
    intuitionCount: params.intuitionCount,
    mappingCount: params.mappingCount,
    bridgeCount: params.bridgeCount,
    registryVersion: params.registryVersion,
    pipelineVersion: params.pipelineVersion,
    compositionMetadata: {},
    deterministicMetadata: {},
    deterministic: true,
    generatedFrom: 'deterministic_analogy_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Narrative Artifact With Analogies Composition
// ---------------------------------------------------------------------------

/**
 * Composes a narrative artifact with applied analogies.
 * Pure function. No side effects.
 */
export function composeNarrativeArtifactWithAnalogies(params: {
  readonly narrativeId: string;
  readonly title: string;
  readonly unitType: NarrativeUnitType;
  readonly narrativeMode: NarrativeMode;
  readonly domain: NarrativeDomain;
  readonly status: NarrativeStatus;
  readonly canonicalKnowledgeId: string;
  readonly curriculumNodeId: string;
  readonly lessonId: string;
  readonly laboratoryId: string;
  readonly sequenceOrder: number;
  readonly summary: string;
  readonly tags: readonly string[];
  readonly provenance: NarrativeProvenance;
  readonly analogies: readonly Analogy[];
  readonly metaphors: readonly Metaphor[];
  readonly intuitions: readonly Intuition[];
  readonly mappings: readonly ConceptMapping[];
  readonly bridges: readonly CognitiveBridge[];
}): NarrativeArtifactWithAnalogies {
  return {
    narrativeId: params.narrativeId,
    title: params.title,
    unitType: params.unitType,
    narrativeMode: params.narrativeMode,
    domain: params.domain,
    status: params.status,
    canonicalKnowledgeId: params.canonicalKnowledgeId,
    curriculumNodeId: params.curriculumNodeId,
    lessonId: params.lessonId,
    laboratoryId: params.laboratoryId,
    sequenceOrder: params.sequenceOrder,
    summary: params.summary,
    tags: [...params.tags],
    provenance: params.provenance,
    analogies: [...params.analogies],
    metaphors: [...params.metaphors],
    intuitions: [...params.intuitions],
    mappings: [...params.mappings],
    bridges: [...params.bridges],
  };
}

// ---------------------------------------------------------------------------
// Deterministic Sort Comparators
// ---------------------------------------------------------------------------

/**
 * Deterministic comparator for analogies.
 * Sorts by analogyId, then analogyType, then mappingId, then title.
 * Pure function. No side effects.
 */
function _compareAnalogy(a: Analogy, b: Analogy): number {
  if (a.analogyId < b.analogyId) return -1;
  if (a.analogyId > b.analogyId) return 1;

  if (a.analogyType < b.analogyType) return -1;
  if (a.analogyType > b.analogyType) return 1;

  if (a.mappingId < b.mappingId) return -1;
  if (a.mappingId > b.mappingId) return 1;

  if (a.title < b.title) return -1;
  if (a.title > b.title) return 1;

  return 0;
}

/**
 * Deterministic comparator for metaphors.
 * Sorts by metaphorId, then metaphorType.
 * Pure function. No side effects.
 */
function _compareMetaphor(a: Metaphor, b: Metaphor): number {
  if (a.metaphorId < b.metaphorId) return -1;
  if (a.metaphorId > b.metaphorId) return 1;

  if (a.metaphorType < b.metaphorType) return -1;
  if (a.metaphorType > b.metaphorType) return 1;

  return 0;
}

/**
 * Deterministic comparator for intuitions.
 * Sorts by intuitionId, then intuitionType.
 * Pure function. No side effects.
 */
function _compareIntuition(a: Intuition, b: Intuition): number {
  if (a.intuitionId < b.intuitionId) return -1;
  if (a.intuitionId > b.intuitionId) return 1;

  if (a.intuitionType < b.intuitionType) return -1;
  if (a.intuitionType > b.intuitionType) return 1;

  return 0;
}

/**
 * Deterministic comparator for concept mappings.
 * Sorts by mappingId, then mappingType.
 * Pure function. No side effects.
 */
function _compareMapping(a: ConceptMapping, b: ConceptMapping): number {
  if (a.mappingId < b.mappingId) return -1;
  if (a.mappingId > b.mappingId) return 1;

  if (a.mappingType < b.mappingType) return -1;
  if (a.mappingType > b.mappingType) return 1;

  return 0;
}

/**
 * Deterministic comparator for cognitive bridges.
 * Sorts by bridgeId.
 * Pure function. No side effects.
 */
function _compareBridge(a: CognitiveBridge, b: CognitiveBridge): number {
  if (a.bridgeId < b.bridgeId) return -1;
  if (a.bridgeId > b.bridgeId) return 1;

  return 0;
}

// ---------------------------------------------------------------------------
// Analogy Registry Composition
// ---------------------------------------------------------------------------

/**
 * Composes an analogy registry from input data.
 * Pure function. No side effects.
 * Deterministic ordering for all collections.
 */
export function composeAnalogyRegistry(
  analogies: readonly Analogy[],
  metaphors: readonly Metaphor[],
  intuitions: readonly Intuition[],
  mappings: readonly ConceptMapping[],
  bridges: readonly CognitiveBridge[],
): AnalogyRegistry {
  const sortedAnalogies = [...analogies].sort(_compareAnalogy);
  const sortedMetaphors = [...metaphors].sort(_compareMetaphor);
  const sortedIntuitions = [...intuitions].sort(_compareIntuition);
  const sortedMappings = [...mappings].sort(_compareMapping);
  const sortedBridges = [...bridges].sort(_compareBridge);

  const metadata: AnalogyRegistryMetadata = {
    registryId: `_analogy_registry_${sortedAnalogies.length}`,
    analogyCount: sortedAnalogies.length,
    metaphorCount: sortedMetaphors.length,
    intuitionCount: sortedIntuitions.length,
    mappingCount: sortedMappings.length,
    bridgeCount: sortedBridges.length,
  };

  return {
    registryId: metadata.registryId,
    analogies: sortedAnalogies,
    metaphors: sortedMetaphors,
    intuitions: sortedIntuitions,
    mappings: sortedMappings,
    bridges: sortedBridges,
    metadata,
    trace: {
      traceId: `_analogy_trace_${sortedAnalogies.length}`,
      decisionCount: 0,
      validationCount: 0,
      analogyCount: sortedAnalogies.length,
      metaphorCount: sortedMetaphors.length,
      intuitionCount: sortedIntuitions.length,
      mappingCount: sortedMappings.length,
      bridgeCount: sortedBridges.length,
      registryVersion: '1.0.0',
      pipelineVersion: '1.0.0',
      compositionMetadata: {},
      deterministicMetadata: {},
      deterministic: true,
      generatedFrom: 'deterministic_analogy_kernel',
      randomUsed: false,
      timeDependency: false,
    },
    deterministic: true,
    generatedFrom: 'deterministic_analogy_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Analogy Registry From Input Composition
// ---------------------------------------------------------------------------

/**
 * Composes an analogy registry from an input.
 * Pure function. No side effects.
 */
export function composeAnalogyRegistryFromInput(
  input: AnalogyInput,
): AnalogyRegistry {
  return composeAnalogyRegistry(
    input.analogies,
    input.metaphors,
    input.intuitions,
    input.mappings,
    input.bridges,
  );
}

// ---------------------------------------------------------------------------
// Narrative Analogies Composition (Main Entry Point)
// ---------------------------------------------------------------------------

/**
 * Composes a complete analogy registry from an input.
 * Pure function. No side effects.
 */
export function composeNarrativeAnalogies(
  input: AnalogyInput,
): AnalogyRegistry {
  const decisions = input.analogies.map((analogy) => {
    const errors = _validateAnalogyForDecision(analogy);
    return _composeAnalogyDecision(analogy.analogyId, errors.length === 0, errors);
  });

  const registry = composeAnalogyRegistry(
    input.analogies,
    input.metaphors,
    input.intuitions,
    input.mappings,
    input.bridges,
  );

  return {
    ...registry,
    trace: composeAnalogyTrace({
      traceId: `_analogy_trace_${input.analogies.length}`,
      decisions,
      registryVersion: '1.0.0',
      pipelineVersion: '1.0.0',
      analogyCount: input.analogies.length,
      metaphorCount: input.metaphors.length,
      intuitionCount: input.intuitions.length,
      mappingCount: input.mappings.length,
      bridgeCount: input.bridges.length,
    }),
  };
}

/**
 * Validates an analogy for decision composition.
 * Pure function. No side effects.
 */
function _validateAnalogyForDecision(
  analogy: Analogy,
): readonly string[] {
  const errors: string[] = [];

  if (!analogy.analogyId || analogy.analogyId.trim() === '') {
    errors.push('ANALOGY_MISSING_ANALOGY_ID');
  }

  if (!analogy.title || analogy.title.trim() === '') {
    errors.push('ANALOGY_MISSING_TITLE');
  }

  if (!CANONICAL_ANALOGY_TYPES.includes(analogy.analogyType)) {
    errors.push('ANALOGY_INVALID_TYPE');
  }

  if (!CANONICAL_ABSTRACTION_LEVELS.includes(analogy.abstractionLevel)) {
    errors.push('ANALOGY_INVALID_ABSTRACTION_LEVEL');
  }

  if (!CANONICAL_GOVERNANCE_STATUSES.includes(analogy.governanceStatus)) {
    errors.push('ANALOGY_INVALID_GOVERNANCE_STATUS');
  }

  if (!analogy.provenance) {
    errors.push('ANALOGY_MISSING_PROVENANCE');
  }

  if (!analogy.sourceConceptId || analogy.sourceConceptId.trim() === '') {
    errors.push('ANALOGY_MISSING_SOURCE_CONCEPT');
  }

  if (!analogy.targetConceptId || analogy.targetConceptId.trim() === '') {
    errors.push('ANALOGY_MISSING_TARGET_CONCEPT');
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Helper Functions — Type Guards
// ---------------------------------------------------------------------------

/**
 * Checks if a string is a supported analogy type.
 */
export function isSupportedAnalogyType(
  analogyType: string,
): analogyType is AnalogyType {
  return CANONICAL_ANALOGY_TYPES.includes(analogyType as AnalogyType);
}

/**
 * Checks if a string is a supported metaphor type.
 */
export function isSupportedMetaphorType(
  metaphorType: string,
): metaphorType is MetaphorType {
  return CANONICAL_METAPHOR_TYPES.includes(metaphorType as MetaphorType);
}

/**
 * Checks if a string is a supported intuition type.
 */
export function isSupportedIntuitionType(
  intuitionType: string,
): intuitionType is IntuitionType {
  return CANONICAL_INTUITION_TYPES.includes(intuitionType as IntuitionType);
}

/**
 * Checks if a string is a supported mapping type.
 */
export function isSupportedMappingType(
  mappingType: string,
): mappingType is MappingType {
  return CANONICAL_MAPPING_TYPES.includes(mappingType as MappingType);
}

/**
 * Checks if a string is a supported abstraction level.
 */
export function isSupportedAbstractionLevel(
  level: string,
): level is AbstractionLevel {
  return CANONICAL_ABSTRACTION_LEVELS.includes(level as AbstractionLevel);
}

/**
 * Checks if a string is a supported analogy status.
 */
export function isSupportedAnalogyStatus(
  status: string,
): status is AnalogyStatus {
  return CANONICAL_ANALOGY_STATUS.includes(status as AnalogyStatus);
}

// ---------------------------------------------------------------------------
// Helper Functions — Canonical Getters
// ---------------------------------------------------------------------------

/**
 * Returns the canonical analogy types.
 */
export function getCanonicalAnalogyTypes(): readonly AnalogyType[] {
  return CANONICAL_ANALOGY_TYPES;
}

/**
 * Returns the canonical metaphor types.
 */
export function getCanonicalMetaphorTypes(): readonly MetaphorType[] {
  return CANONICAL_METAPHOR_TYPES;
}

/**
 * Returns the canonical intuition types.
 */
export function getCanonicalIntuitionTypes(): readonly IntuitionType[] {
  return CANONICAL_INTUITION_TYPES;
}

/**
 * Returns the canonical mapping types.
 */
export function getCanonicalMappingTypes(): readonly MappingType[] {
  return CANONICAL_MAPPING_TYPES;
}

/**
 * Returns the canonical abstraction levels.
 */
export function getCanonicalAbstractionLevels(): readonly AbstractionLevel[] {
  return CANONICAL_ABSTRACTION_LEVELS;
}

/**
 * Returns the canonical analogy statuses.
 */
export function getCanonicalAnalogyStatuses(): readonly AnalogyStatus[] {
  return CANONICAL_ANALOGY_STATUS;
}

/**
 * NV-1700-D6-OPT-09 — Multi-Perspective Explanation & Alternative Viewpoint Modeling Kernel
 *
 * Deterministic orchestration functions for perspective metadata.
 * Produces perspectives, views, alternatives, disciplinary views, implementation views,
 * abstraction views, flows, and registries.
 *
 * This module never:
 * - Generates explanations
 * - Rewrites explanations
 * - Selects the best explanation
 * - Personalizes viewpoints
 * - Infers learner preferences
 * - Calls LLMs
 * - Calls external APIs
 * - Mutates narrative artifacts
 *
 * Perspective metadata only.
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import type {
  PerspectiveProvenance,
  NarrativeGovernanceStatus,
  PerspectiveType,
  ExplanationType,
  AlternativeViewType,
  DisciplinaryViewType,
  ExplanationAbstractionType,
  ImplementationViewType,
  PerspectiveFlowType,
  PerspectiveStatus,
  Perspective,
  ExplanationView,
  AlternativeView,
  DisciplinaryView,
  ImplementationView,
  AbstractionView,
  PerspectiveFlow,
  PerspectiveDecision,
  PerspectiveTrace,
  PerspectiveRegistry,
  PerspectiveRegistryMetadata,
  PerspectiveInput,
  NarrativeUnitType,
  NarrativeMode,
  NarrativeDomain,
  NarrativeStatus,
  NarrativeProvenance,
  NarrativeArtifactWithPerspectives,
} from './NarrativeAgentContract.ts';

import {
  CANONICAL_PERSPECTIVE_TYPES,
  CANONICAL_EXPLANATION_TYPES,
  CANONICAL_ALTERNATIVE_VIEW_TYPES,
  CANONICAL_DISCIPLINARY_VIEW_TYPES,
  CANONICAL_EXPLANATION_ABSTRACTION_TYPES,
  CANONICAL_IMPLEMENTATION_VIEW_TYPES,
  CANONICAL_PERSPECTIVE_FLOW_TYPES,
  CANONICAL_PERSPECTIVE_STATUS,
  CANONICAL_GOVERNANCE_STATUSES,
} from './NarrativeAgentContract.ts';

// ---------------------------------------------------------------------------
// Provenance Composition
// ---------------------------------------------------------------------------

export function composePerspectiveProvenance(params: {
  readonly source: string;
  readonly governanceStatus: NarrativeGovernanceStatus;
  readonly providedBy: string;
  readonly rationale: string;
}): PerspectiveProvenance {
  return { source: params.source, governanceStatus: params.governanceStatus, providedBy: params.providedBy, rationale: params.rationale };
}

// ---------------------------------------------------------------------------
// Entity Compositions
// ---------------------------------------------------------------------------

export function composePerspective(params: {
  readonly perspectiveId: string;
  readonly perspectiveType: PerspectiveType;
  readonly title: string;
  readonly description: string;
  readonly relatedConceptId: string;
  readonly governanceStatus: NarrativeGovernanceStatus;
  readonly provenance: PerspectiveProvenance;
}): Perspective {
  return { perspectiveId: params.perspectiveId, perspectiveType: params.perspectiveType, title: params.title, description: params.description, relatedConceptId: params.relatedConceptId, governanceStatus: params.governanceStatus, provenance: params.provenance };
}

export function composeExplanationView(params: {
  readonly viewId: string;
  readonly explanationType: ExplanationType;
  readonly title: string;
  readonly description: string;
  readonly perspectiveId: string;
  readonly governanceStatus: NarrativeGovernanceStatus;
  readonly provenance: PerspectiveProvenance;
}): ExplanationView {
  return { viewId: params.viewId, explanationType: params.explanationType, title: params.title, description: params.description, perspectiveId: params.perspectiveId, governanceStatus: params.governanceStatus, provenance: params.provenance };
}

export function composeAlternativeView(params: {
  readonly alternativeId: string;
  readonly alternativeType: AlternativeViewType;
  readonly sourceViewId: string;
  readonly targetViewId: string;
  readonly description: string;
  readonly governanceStatus: NarrativeGovernanceStatus;
  readonly provenance: PerspectiveProvenance;
}): AlternativeView {
  return { alternativeId: params.alternativeId, alternativeType: params.alternativeType, sourceViewId: params.sourceViewId, targetViewId: params.targetViewId, description: params.description, governanceStatus: params.governanceStatus, provenance: params.provenance };
}

export function composeDisciplinaryView(params: {
  readonly disciplinaryViewId: string;
  readonly disciplinaryType: DisciplinaryViewType;
  readonly title: string;
  readonly description: string;
  readonly relatedArtifactId: string;
  readonly governanceStatus: NarrativeGovernanceStatus;
  readonly provenance: PerspectiveProvenance;
}): DisciplinaryView {
  return { disciplinaryViewId: params.disciplinaryViewId, disciplinaryType: params.disciplinaryType, title: params.title, description: params.description, relatedArtifactId: params.relatedArtifactId, governanceStatus: params.governanceStatus, provenance: params.provenance };
}

export function composeImplementationView(params: {
  readonly implementationViewId: string;
  readonly implementationType: ImplementationViewType;
  readonly title: string;
  readonly description: string;
  readonly relatedArtifactId: string;
  readonly governanceStatus: NarrativeGovernanceStatus;
  readonly provenance: PerspectiveProvenance;
}): ImplementationView {
  return { implementationViewId: params.implementationViewId, implementationType: params.implementationType, title: params.title, description: params.description, relatedArtifactId: params.relatedArtifactId, governanceStatus: params.governanceStatus, provenance: params.provenance };
}

export function composeAbstractionView(params: {
  readonly abstractionViewId: string;
  readonly abstractionType: ExplanationAbstractionType;
  readonly title: string;
  readonly description: string;
  readonly relatedArtifactId: string;
  readonly governanceStatus: NarrativeGovernanceStatus;
  readonly provenance: PerspectiveProvenance;
}): AbstractionView {
  return { abstractionViewId: params.abstractionViewId, abstractionType: params.abstractionType, title: params.title, description: params.description, relatedArtifactId: params.relatedArtifactId, governanceStatus: params.governanceStatus, provenance: params.provenance };
}

export function composePerspectiveFlow(params: {
  readonly flowId: string;
  readonly flowType: PerspectiveFlowType;
  readonly perspectiveIds: readonly string[];
  readonly viewIds: readonly string[];
  readonly governanceStatus: NarrativeGovernanceStatus;
  readonly provenance: PerspectiveProvenance;
}): PerspectiveFlow {
  return { flowId: params.flowId, flowType: params.flowType, perspectiveIds: [...params.perspectiveIds], viewIds: [...params.viewIds], governanceStatus: params.governanceStatus, provenance: params.provenance };
}

// ---------------------------------------------------------------------------
// Decision & Trace
// ---------------------------------------------------------------------------

function _composePerspectiveDecision(perspectiveId: string, validationPassed: boolean, validationErrors: readonly string[]): PerspectiveDecision {
  return { decisionId: `_decision_${perspectiveId}`, perspectiveId, validationPassed, validationErrors };
}

export function composePerspectiveTrace(params: {
  readonly traceId: string;
  readonly decisions: readonly PerspectiveDecision[];
  readonly registryVersion: string;
  readonly pipelineVersion: string;
  readonly perspectiveCount: number;
  readonly viewCount: number;
  readonly alternativeViewCount: number;
  readonly disciplinaryViewCount: number;
  readonly implementationViewCount: number;
  readonly abstractionViewCount: number;
  readonly flowCount: number;
}): PerspectiveTrace {
  return {
    traceId: params.traceId, decisionCount: params.decisions.length, validationCount: params.decisions.filter((d) => d.validationPassed).length,
    perspectiveCount: params.perspectiveCount, viewCount: params.viewCount, alternativeViewCount: params.alternativeViewCount,
    disciplinaryViewCount: params.disciplinaryViewCount, implementationViewCount: params.implementationViewCount,
    abstractionViewCount: params.abstractionViewCount, flowCount: params.flowCount,
    registryVersion: params.registryVersion, pipelineVersion: params.pipelineVersion,
    compositionMetadata: {}, deterministicMetadata: {}, deterministic: true,
    generatedFrom: 'deterministic_perspective_kernel', randomUsed: false, timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Artifact With Perspectives
// ---------------------------------------------------------------------------

export function composeNarrativeArtifactWithPerspectives(params: {
  readonly narrativeId: string; readonly title: string; readonly unitType: NarrativeUnitType; readonly narrativeMode: NarrativeMode;
  readonly domain: NarrativeDomain; readonly status: NarrativeStatus; readonly canonicalKnowledgeId: string; readonly curriculumNodeId: string;
  readonly lessonId: string; readonly laboratoryId: string; readonly sequenceOrder: number; readonly summary: string;
  readonly tags: readonly string[]; readonly provenance: NarrativeProvenance;
  readonly perspectives: readonly Perspective[]; readonly explanationViews: readonly ExplanationView[];
  readonly alternativeViews: readonly AlternativeView[]; readonly disciplinaryViews: readonly DisciplinaryView[];
  readonly implementationViews: readonly ImplementationView[]; readonly abstractionViews: readonly AbstractionView[];
  readonly perspectiveFlows: readonly PerspectiveFlow[];
}): NarrativeArtifactWithPerspectives {
  return {
    narrativeId: params.narrativeId, title: params.title, unitType: params.unitType, narrativeMode: params.narrativeMode,
    domain: params.domain, status: params.status, canonicalKnowledgeId: params.canonicalKnowledgeId, curriculumNodeId: params.curriculumNodeId,
    lessonId: params.lessonId, laboratoryId: params.laboratoryId, sequenceOrder: params.sequenceOrder, summary: params.summary,
    tags: [...params.tags], provenance: params.provenance,
    perspectives: [...params.perspectives], explanationViews: [...params.explanationViews],
    alternativeViews: [...params.alternativeViews], disciplinaryViews: [...params.disciplinaryViews],
    implementationViews: [...params.implementationViews], abstractionViews: [...params.abstractionViews],
    perspectiveFlows: [...params.perspectiveFlows],
  };
}

// ---------------------------------------------------------------------------
// Deterministic Sort Comparators
// ---------------------------------------------------------------------------

function _comparePerspective(a: Perspective, b: Perspective): number {
  if (a.perspectiveId < b.perspectiveId) return -1; if (a.perspectiveId > b.perspectiveId) return 1;
  if (a.perspectiveType < b.perspectiveType) return -1; if (a.perspectiveType > b.perspectiveType) return 1;
  if (a.title < b.title) return -1; if (a.title > b.title) return 1; return 0;
}

function _compareView(a: ExplanationView, b: ExplanationView): number {
  if (a.viewId < b.viewId) return -1; if (a.viewId > b.viewId) return 1;
  if (a.explanationType < b.explanationType) return -1; if (a.explanationType > b.explanationType) return 1;
  if (a.title < b.title) return -1; if (a.title > b.title) return 1; return 0;
}

function _compareAlternative(a: AlternativeView, b: AlternativeView): number {
  if (a.alternativeId < b.alternativeId) return -1; if (a.alternativeId > b.alternativeId) return 1;
  if (a.alternativeType < b.alternativeType) return -1; if (a.alternativeType > b.alternativeType) return 1;
  return 0;
}

function _compareDisciplinary(a: DisciplinaryView, b: DisciplinaryView): number {
  if (a.disciplinaryViewId < b.disciplinaryViewId) return -1; if (a.disciplinaryViewId > b.disciplinaryViewId) return 1;
  if (a.disciplinaryType < b.disciplinaryType) return -1; if (a.disciplinaryType > b.disciplinaryType) return 1;
  return 0;
}

function _compareImplementation(a: ImplementationView, b: ImplementationView): number {
  if (a.implementationViewId < b.implementationViewId) return -1; if (a.implementationViewId > b.implementationViewId) return 1;
  if (a.implementationType < b.implementationType) return -1; if (a.implementationType > b.implementationType) return 1;
  return 0;
}

function _compareAbstraction(a: AbstractionView, b: AbstractionView): number {
  if (a.abstractionViewId < b.abstractionViewId) return -1; if (a.abstractionViewId > b.abstractionViewId) return 1;
  if (a.abstractionType < b.abstractionType) return -1; if (a.abstractionType > b.abstractionType) return 1;
  return 0;
}

function _compareFlow(a: PerspectiveFlow, b: PerspectiveFlow): number {
  if (a.flowId < b.flowId) return -1; if (a.flowId > b.flowId) return 1;
  if (a.flowType < b.flowType) return -1; if (a.flowType > b.flowType) return 1;
  return 0;
}

// ---------------------------------------------------------------------------
// Perspective Registry Composition
// ---------------------------------------------------------------------------

export function composePerspectiveRegistry(
  perspectives: readonly Perspective[], explanationViews: readonly ExplanationView[],
  alternativeViews: readonly AlternativeView[], disciplinaryViews: readonly DisciplinaryView[],
  implementationViews: readonly ImplementationView[], abstractionViews: readonly AbstractionView[],
  perspectiveFlows: readonly PerspectiveFlow[],
): PerspectiveRegistry {
  const sortedP = [...perspectives].sort(_comparePerspective);
  const sortedEV = [...explanationViews].sort(_compareView);
  const sortedAV = [...alternativeViews].sort(_compareAlternative);
  const sortedDV = [...disciplinaryViews].sort(_compareDisciplinary);
  const sortedIV = [...implementationViews].sort(_compareImplementation);
  const sortedAbV = [...abstractionViews].sort(_compareAbstraction);
  const sortedPF = [...perspectiveFlows].sort(_compareFlow);

  const metadata: PerspectiveRegistryMetadata = {
    registryId: `_perspective_registry_${sortedP.length}`,
    perspectiveCount: sortedP.length, viewCount: sortedEV.length,
    alternativeViewCount: sortedAV.length, disciplinaryViewCount: sortedDV.length,
    implementationViewCount: sortedIV.length, abstractionViewCount: sortedAbV.length, flowCount: sortedPF.length,
  };

  return {
    registryId: metadata.registryId, perspectives: sortedP, explanationViews: sortedEV,
    alternativeViews: sortedAV, disciplinaryViews: sortedDV, implementationViews: sortedIV,
    abstractionViews: sortedAbV, perspectiveFlows: sortedPF, metadata,
    trace: {
      traceId: `_perspective_trace_${sortedP.length}`, decisionCount: 0, validationCount: 0,
      perspectiveCount: sortedP.length, viewCount: sortedEV.length,
      alternativeViewCount: sortedAV.length, disciplinaryViewCount: sortedDV.length,
      implementationViewCount: sortedIV.length, abstractionViewCount: sortedAbV.length, flowCount: sortedPF.length,
      registryVersion: '1.0.0', pipelineVersion: '1.0.0', compositionMetadata: {}, deterministicMetadata: {},
      deterministic: true, generatedFrom: 'deterministic_perspective_kernel', randomUsed: false, timeDependency: false,
    },
    deterministic: true, generatedFrom: 'deterministic_perspective_kernel', randomUsed: false, timeDependency: false,
  };
}

export function composePerspectiveRegistryFromInput(input: PerspectiveInput): PerspectiveRegistry {
  return composePerspectiveRegistry(input.perspectives, input.explanationViews, input.alternativeViews,
    input.disciplinaryViews, input.implementationViews, input.abstractionViews, input.perspectiveFlows);
}

// ---------------------------------------------------------------------------
// Main Entry Point
// ---------------------------------------------------------------------------

export function composeNarrativePerspectives(input: PerspectiveInput): PerspectiveRegistry {
  const decisions = input.perspectives.map((p) => {
    const errors = _validatePerspectiveForDecision(p);
    return _composePerspectiveDecision(p.perspectiveId, errors.length === 0, errors);
  });

  const registry = composePerspectiveRegistry(input.perspectives, input.explanationViews, input.alternativeViews,
    input.disciplinaryViews, input.implementationViews, input.abstractionViews, input.perspectiveFlows);

  return {
    ...registry,
    trace: composePerspectiveTrace({
      traceId: `_perspective_trace_${input.perspectives.length}`, decisions, registryVersion: '1.0.0', pipelineVersion: '1.0.0',
      perspectiveCount: input.perspectives.length, viewCount: input.explanationViews.length,
      alternativeViewCount: input.alternativeViews.length, disciplinaryViewCount: input.disciplinaryViews.length,
      implementationViewCount: input.implementationViews.length, abstractionViewCount: input.abstractionViews.length, flowCount: input.perspectiveFlows.length,
    }),
  };
}

function _validatePerspectiveForDecision(p: Perspective): readonly string[] {
  const errors: string[] = [];
  if (!p.perspectiveId || p.perspectiveId.trim() === '') errors.push('PERSPECTIVE_MISSING_ID');
  if (!p.title || p.title.trim() === '') errors.push('PERSPECTIVE_MISSING_TITLE');
  if (!CANONICAL_PERSPECTIVE_TYPES.includes(p.perspectiveType)) errors.push('PERSPECTIVE_INVALID_TYPE');
  if (!CANONICAL_GOVERNANCE_STATUSES.includes(p.governanceStatus)) errors.push('PERSPECTIVE_INVALID_GOVERNANCE');
  if (!p.provenance) errors.push('PERSPECTIVE_MISSING_PROVENANCE');
  return errors;
}

// ---------------------------------------------------------------------------
// Type Guards
// ---------------------------------------------------------------------------

export function isSupportedPerspectiveType(v: string): v is PerspectiveType { return CANONICAL_PERSPECTIVE_TYPES.includes(v as PerspectiveType); }
export function isSupportedExplanationType(v: string): v is ExplanationType { return CANONICAL_EXPLANATION_TYPES.includes(v as ExplanationType); }
export function isSupportedAlternativeViewType(v: string): v is AlternativeViewType { return CANONICAL_ALTERNATIVE_VIEW_TYPES.includes(v as AlternativeViewType); }
export function isSupportedDisciplinaryViewType(v: string): v is DisciplinaryViewType { return CANONICAL_DISCIPLINARY_VIEW_TYPES.includes(v as DisciplinaryViewType); }
export function isSupportedExplanationAbstractionType(v: string): v is ExplanationAbstractionType { return CANONICAL_EXPLANATION_ABSTRACTION_TYPES.includes(v as ExplanationAbstractionType); }
export function isSupportedImplementationViewType(v: string): v is ImplementationViewType { return CANONICAL_IMPLEMENTATION_VIEW_TYPES.includes(v as ImplementationViewType); }
export function isSupportedPerspectiveFlowType(v: string): v is PerspectiveFlowType { return CANONICAL_PERSPECTIVE_FLOW_TYPES.includes(v as PerspectiveFlowType); }
export function isSupportedPerspectiveStatus(v: string): v is PerspectiveStatus { return CANONICAL_PERSPECTIVE_STATUS.includes(v as PerspectiveStatus); }

// ---------------------------------------------------------------------------
// Canonical Getters
// ---------------------------------------------------------------------------

export function getCanonicalPerspectiveTypes(): readonly PerspectiveType[] { return CANONICAL_PERSPECTIVE_TYPES; }
export function getCanonicalExplanationTypes(): readonly ExplanationType[] { return CANONICAL_EXPLANATION_TYPES; }
export function getCanonicalAlternativeViewTypes(): readonly AlternativeViewType[] { return CANONICAL_ALTERNATIVE_VIEW_TYPES; }
export function getCanonicalDisciplinaryViewTypes(): readonly DisciplinaryViewType[] { return CANONICAL_DISCIPLINARY_VIEW_TYPES; }
export function getCanonicalExplanationAbstractionTypes(): readonly ExplanationAbstractionType[] { return CANONICAL_EXPLANATION_ABSTRACTION_TYPES; }
export function getCanonicalImplementationViewTypes(): readonly ImplementationViewType[] { return CANONICAL_IMPLEMENTATION_VIEW_TYPES; }
export function getCanonicalPerspectiveFlowTypes(): readonly PerspectiveFlowType[] { return CANONICAL_PERSPECTIVE_FLOW_TYPES; }
export function getCanonicalPerspectiveStatuses(): readonly PerspectiveStatus[] { return CANONICAL_PERSPECTIVE_STATUS; }

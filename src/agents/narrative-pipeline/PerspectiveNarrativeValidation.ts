/**
 * NV-1700-D6-OPT-09 — Perspective Narrative Validation Layer
 */

import type {
  Perspective, ExplanationView, AlternativeView, DisciplinaryView, ImplementationView,
  AbstractionView, PerspectiveFlow, PerspectiveRegistry, PerspectiveInput,
  NarrativeArtifactWithPerspectives, PerspectiveValidationError,
  PerspectiveRegistryValidationResult, PerspectiveInputValidationResult,
  NarrativeArtifactWithPerspectivesValidationResult, PerspectiveProvenance,
} from './NarrativeAgentContract.ts';

import {
  CANONICAL_PERSPECTIVE_TYPES, CANONICAL_EXPLANATION_TYPES, CANONICAL_ALTERNATIVE_VIEW_TYPES,
  CANONICAL_DISCIPLINARY_VIEW_TYPES, CANONICAL_EXPLANATION_ABSTRACTION_TYPES,
  CANONICAL_IMPLEMENTATION_VIEW_TYPES, CANONICAL_PERSPECTIVE_FLOW_TYPES,
  CANONICAL_GOVERNANCE_STATUSES,
} from './NarrativeAgentContract.ts';

export const PERSPECTIVE_VALIDATION_CODES = {
  PERSPECTIVE_DUPLICATE_PERSPECTIVE_ID: 'PERSPECTIVE_DUPLICATE_PERSPECTIVE_ID',
  PERSPECTIVE_DUPLICATE_VIEW_ID: 'PERSPECTIVE_DUPLICATE_VIEW_ID',
  PERSPECTIVE_DUPLICATE_ALTERNATIVE_ID: 'PERSPECTIVE_DUPLICATE_ALTERNATIVE_ID',
  PERSPECTIVE_DUPLICATE_DISCIPLINARY_ID: 'PERSPECTIVE_DUPLICATE_DISCIPLINARY_ID',
  PERSPECTIVE_DUPLICATE_IMPLEMENTATION_ID: 'PERSPECTIVE_DUPLICATE_IMPLEMENTATION_ID',
  PERSPECTIVE_DUPLICATE_ABSTRACTION_ID: 'PERSPECTIVE_DUPLICATE_ABSTRACTION_ID',
  PERSPECTIVE_DUPLICATE_FLOW_ID: 'PERSPECTIVE_DUPLICATE_FLOW_ID',
  PERSPECTIVE_INVALID_TYPE: 'PERSPECTIVE_INVALID_TYPE',
  PERSPECTIVE_INVALID_EXPLANATION_TYPE: 'PERSPECTIVE_INVALID_EXPLANATION_TYPE',
  PERSPECTIVE_INVALID_ALTERNATIVE_TYPE: 'PERSPECTIVE_INVALID_ALTERNATIVE_TYPE',
  PERSPECTIVE_INVALID_DISCIPLINARY_TYPE: 'PERSPECTIVE_INVALID_DISCIPLINARY_TYPE',
  PERSPECTIVE_INVALID_IMPLEMENTATION_TYPE: 'PERSPECTIVE_INVALID_IMPLEMENTATION_TYPE',
  PERSPECTIVE_INVALID_ABSTRACTION_TYPE: 'PERSPECTIVE_INVALID_ABSTRACTION_TYPE',
  PERSPECTIVE_INVALID_FLOW_TYPE: 'PERSPECTIVE_INVALID_FLOW_TYPE',
  PERSPECTIVE_INVALID_GOVERNANCE: 'PERSPECTIVE_INVALID_GOVERNANCE',
  PERSPECTIVE_MISSING_PROVENANCE: 'PERSPECTIVE_MISSING_PROVENANCE',
  PERSPECTIVE_MISSING_SOURCE: 'PERSPECTIVE_MISSING_SOURCE',
  PERSPECTIVE_MISSING_RATIONALE: 'PERSPECTIVE_MISSING_RATIONALE',
  PERSPECTIVE_MISSING_PROVIDED_BY: 'PERSPECTIVE_MISSING_PROVIDED_BY',
  PERSPECTIVE_MISSING_ID: 'PERSPECTIVE_MISSING_ID',
  PERSPECTIVE_MISSING_TITLE: 'PERSPECTIVE_MISSING_TITLE',
  PERSPECTIVE_MISSING_DESCRIPTION: 'PERSPECTIVE_MISSING_DESCRIPTION',
  PERSPECTIVE_MISSING_ARTIFACT_REFERENCE: 'PERSPECTIVE_MISSING_ARTIFACT_REFERENCE',
  PERSPECTIVE_EMPTY_REGISTRY: 'PERSPECTIVE_EMPTY_REGISTRY',
  PERSPECTIVE_INVALID_TRACE: 'PERSPECTIVE_INVALID_TRACE',
  PERSPECTIVE_TRACE_RANDOM_USED: 'PERSPECTIVE_TRACE_RANDOM_USED',
  PERSPECTIVE_TRACE_TIME_DEPENDENCY: 'PERSPECTIVE_TRACE_TIME_DEPENDENCY',
} as const;

function _validateProvenance(provenance: PerspectiveProvenance | undefined, prefix: string, errors: PerspectiveValidationError[]): void {
  if (!provenance) { errors.push({ code: `${prefix}_MISSING_PROVENANCE`, message: `${prefix} missing provenance.`, field: 'provenance' }); return; }
  if (!provenance.source || provenance.source.trim() === '') errors.push({ code: 'PERSPECTIVE_MISSING_SOURCE', message: `${prefix} missing source.`, field: 'provenance.source' });
  if (!provenance.rationale || provenance.rationale.trim() === '') errors.push({ code: 'PERSPECTIVE_MISSING_RATIONALE', message: `${prefix} missing rationale.`, field: 'provenance.rationale' });
  if (!provenance.providedBy || provenance.providedBy.trim() === '') errors.push({ code: 'PERSPECTIVE_MISSING_PROVIDED_BY', message: `${prefix} missing providedBy.`, field: 'provenance.providedBy' });
}

export function validatePerspective(p: Perspective): readonly PerspectiveValidationError[] {
  const errors: PerspectiveValidationError[] = [];
  if (!p.perspectiveId || p.perspectiveId.trim() === '') errors.push({ code: PERSPECTIVE_VALIDATION_CODES.PERSPECTIVE_MISSING_ID, message: 'Perspective missing ID.', field: 'perspectiveId', perspectiveId: p.perspectiveId });
  if (!p.title || p.title.trim() === '') errors.push({ code: PERSPECTIVE_VALIDATION_CODES.PERSPECTIVE_MISSING_TITLE, message: 'Perspective missing title.', field: 'title', perspectiveId: p.perspectiveId });
  if (!CANONICAL_PERSPECTIVE_TYPES.includes(p.perspectiveType)) errors.push({ code: PERSPECTIVE_VALIDATION_CODES.PERSPECTIVE_INVALID_TYPE, message: `Invalid type: "${p.perspectiveType}".`, field: 'perspectiveType', perspectiveId: p.perspectiveId });
  if (!CANONICAL_GOVERNANCE_STATUSES.includes(p.governanceStatus)) errors.push({ code: PERSPECTIVE_VALIDATION_CODES.PERSPECTIVE_INVALID_GOVERNANCE, message: `Invalid governance.`, field: 'governanceStatus', perspectiveId: p.perspectiveId });
  _validateProvenance(p.provenance, 'PERSPECTIVE', errors);
  return errors;
}

export function validateExplanationView(v: ExplanationView): readonly PerspectiveValidationError[] {
  const errors: PerspectiveValidationError[] = [];
  if (!v.viewId || v.viewId.trim() === '') errors.push({ code: PERSPECTIVE_VALIDATION_CODES.PERSPECTIVE_MISSING_ID, message: 'View missing ID.', field: 'viewId', viewId: v.viewId });
  if (!v.title || v.title.trim() === '') errors.push({ code: PERSPECTIVE_VALIDATION_CODES.PERSPECTIVE_MISSING_TITLE, message: 'View missing title.', field: 'title', viewId: v.viewId });
  if (!CANONICAL_EXPLANATION_TYPES.includes(v.explanationType)) errors.push({ code: PERSPECTIVE_VALIDATION_CODES.PERSPECTIVE_INVALID_EXPLANATION_TYPE, message: `Invalid type: "${v.explanationType}".`, field: 'explanationType', viewId: v.viewId });
  _validateProvenance(v.provenance, 'PERSPECTIVE', errors);
  return errors;
}

export function validateAlternativeView(a: AlternativeView): readonly PerspectiveValidationError[] {
  const errors: PerspectiveValidationError[] = [];
  if (!a.alternativeId || a.alternativeId.trim() === '') errors.push({ code: PERSPECTIVE_VALIDATION_CODES.PERSPECTIVE_MISSING_ID, message: 'Alternative missing ID.', field: 'alternativeId', alternativeId: a.alternativeId });
  if (!CANONICAL_ALTERNATIVE_VIEW_TYPES.includes(a.alternativeType)) errors.push({ code: PERSPECTIVE_VALIDATION_CODES.PERSPECTIVE_INVALID_ALTERNATIVE_TYPE, message: `Invalid type: "${a.alternativeType}".`, field: 'alternativeType', alternativeId: a.alternativeId });
  _validateProvenance(a.provenance, 'PERSPECTIVE', errors);
  return errors;
}

export function validateDisciplinaryView(d: DisciplinaryView): readonly PerspectiveValidationError[] {
  const errors: PerspectiveValidationError[] = [];
  if (!d.disciplinaryViewId || d.disciplinaryViewId.trim() === '') errors.push({ code: PERSPECTIVE_VALIDATION_CODES.PERSPECTIVE_MISSING_ID, message: 'Disciplinary missing ID.', field: 'disciplinaryViewId', disciplinaryViewId: d.disciplinaryViewId });
  if (!d.title || d.title.trim() === '') errors.push({ code: PERSPECTIVE_VALIDATION_CODES.PERSPECTIVE_MISSING_TITLE, message: 'Disciplinary missing title.', field: 'title', disciplinaryViewId: d.disciplinaryViewId });
  if (!CANONICAL_DISCIPLINARY_VIEW_TYPES.includes(d.disciplinaryType)) errors.push({ code: PERSPECTIVE_VALIDATION_CODES.PERSPECTIVE_INVALID_DISCIPLINARY_TYPE, message: `Invalid type: "${d.disciplinaryType}".`, field: 'disciplinaryType', disciplinaryViewId: d.disciplinaryViewId });
  _validateProvenance(d.provenance, 'PERSPECTIVE', errors);
  return errors;
}

export function validateImplementationView(i: ImplementationView): readonly PerspectiveValidationError[] {
  const errors: PerspectiveValidationError[] = [];
  if (!i.implementationViewId || i.implementationViewId.trim() === '') errors.push({ code: PERSPECTIVE_VALIDATION_CODES.PERSPECTIVE_MISSING_ID, message: 'Implementation missing ID.', field: 'implementationViewId', implementationViewId: i.implementationViewId });
  if (!i.title || i.title.trim() === '') errors.push({ code: PERSPECTIVE_VALIDATION_CODES.PERSPECTIVE_MISSING_TITLE, message: 'Implementation missing title.', field: 'title', implementationViewId: i.implementationViewId });
  if (!CANONICAL_IMPLEMENTATION_VIEW_TYPES.includes(i.implementationType)) errors.push({ code: PERSPECTIVE_VALIDATION_CODES.PERSPECTIVE_INVALID_IMPLEMENTATION_TYPE, message: `Invalid type: "${i.implementationType}".`, field: 'implementationType', implementationViewId: i.implementationViewId });
  _validateProvenance(i.provenance, 'PERSPECTIVE', errors);
  return errors;
}

export function validateAbstractionView(a: AbstractionView): readonly PerspectiveValidationError[] {
  const errors: PerspectiveValidationError[] = [];
  if (!a.abstractionViewId || a.abstractionViewId.trim() === '') errors.push({ code: PERSPECTIVE_VALIDATION_CODES.PERSPECTIVE_MISSING_ID, message: 'Abstraction missing ID.', field: 'abstractionViewId', abstractionViewId: a.abstractionViewId });
  if (!a.title || a.title.trim() === '') errors.push({ code: PERSPECTIVE_VALIDATION_CODES.PERSPECTIVE_MISSING_TITLE, message: 'Abstraction missing title.', field: 'title', abstractionViewId: a.abstractionViewId });
  if (!CANONICAL_EXPLANATION_ABSTRACTION_TYPES.includes(a.abstractionType)) errors.push({ code: PERSPECTIVE_VALIDATION_CODES.PERSPECTIVE_INVALID_ABSTRACTION_TYPE, message: `Invalid type: "${a.abstractionType}".`, field: 'abstractionType', abstractionViewId: a.abstractionViewId });
  _validateProvenance(a.provenance, 'PERSPECTIVE', errors);
  return errors;
}

export function validatePerspectiveFlow(f: PerspectiveFlow): readonly PerspectiveValidationError[] {
  const errors: PerspectiveValidationError[] = [];
  if (!f.flowId || f.flowId.trim() === '') errors.push({ code: PERSPECTIVE_VALIDATION_CODES.PERSPECTIVE_MISSING_ID, message: 'Flow missing ID.', field: 'flowId', flowId: f.flowId });
  if (!CANONICAL_PERSPECTIVE_FLOW_TYPES.includes(f.flowType)) errors.push({ code: PERSPECTIVE_VALIDATION_CODES.PERSPECTIVE_INVALID_FLOW_TYPE, message: `Invalid type: "${f.flowType}".`, field: 'flowType', flowId: f.flowId });
  _validateProvenance(f.provenance, 'PERSPECTIVE', errors);
  return errors;
}

export function validatePerspectiveRegistry(registry: PerspectiveRegistry): PerspectiveRegistryValidationResult {
  const errors: PerspectiveValidationError[] = [];
  if (!registry.registryId || registry.registryId.trim() === '') errors.push({ code: PERSPECTIVE_VALIDATION_CODES.PERSPECTIVE_EMPTY_REGISTRY, message: 'Registry missing ID.', field: 'registryId' });
  if (registry.deterministic !== true) errors.push({ code: PERSPECTIVE_VALIDATION_CODES.PERSPECTIVE_INVALID_TRACE, message: 'Must declare deterministic: true.', field: 'deterministic' });
  if (registry.randomUsed !== false) errors.push({ code: PERSPECTIVE_VALIDATION_CODES.PERSPECTIVE_TRACE_RANDOM_USED, message: 'Must declare randomUsed: false.', field: 'randomUsed' });
  if (registry.timeDependency !== false) errors.push({ code: PERSPECTIVE_VALIDATION_CODES.PERSPECTIVE_TRACE_TIME_DEPENDENCY, message: 'Must declare timeDependency: false.', field: 'timeDependency' });

  const seenP = new Set<string>(); for (const p of registry.perspectives) { if (seenP.has(p.perspectiveId)) errors.push({ code: PERSPECTIVE_VALIDATION_CODES.PERSPECTIVE_DUPLICATE_PERSPECTIVE_ID, message: `Duplicate: "${p.perspectiveId}".`, perspectiveId: p.perspectiveId }); seenP.add(p.perspectiveId); }
  const seenV = new Set<string>(); for (const v of registry.explanationViews) { if (seenV.has(v.viewId)) errors.push({ code: PERSPECTIVE_VALIDATION_CODES.PERSPECTIVE_DUPLICATE_VIEW_ID, message: `Duplicate: "${v.viewId}".`, viewId: v.viewId }); seenV.add(v.viewId); }
  const seenA = new Set<string>(); for (const a of registry.alternativeViews) { if (seenA.has(a.alternativeId)) errors.push({ code: PERSPECTIVE_VALIDATION_CODES.PERSPECTIVE_DUPLICATE_ALTERNATIVE_ID, message: `Duplicate: "${a.alternativeId}".`, alternativeId: a.alternativeId }); seenA.add(a.alternativeId); }
  const seenD = new Set<string>(); for (const d of registry.disciplinaryViews) { if (seenD.has(d.disciplinaryViewId)) errors.push({ code: PERSPECTIVE_VALIDATION_CODES.PERSPECTIVE_DUPLICATE_DISCIPLINARY_ID, message: `Duplicate: "${d.disciplinaryViewId}".`, disciplinaryViewId: d.disciplinaryViewId }); seenD.add(d.disciplinaryViewId); }
  const seenI = new Set<string>(); for (const i of registry.implementationViews) { if (seenI.has(i.implementationViewId)) errors.push({ code: PERSPECTIVE_VALIDATION_CODES.PERSPECTIVE_DUPLICATE_IMPLEMENTATION_ID, message: `Duplicate: "${i.implementationViewId}".`, implementationViewId: i.implementationViewId }); seenI.add(i.implementationViewId); }
  const seenAb = new Set<string>(); for (const a of registry.abstractionViews) { if (seenAb.has(a.abstractionViewId)) errors.push({ code: PERSPECTIVE_VALIDATION_CODES.PERSPECTIVE_DUPLICATE_ABSTRACTION_ID, message: `Duplicate: "${a.abstractionViewId}".`, abstractionViewId: a.abstractionViewId }); seenAb.add(a.abstractionViewId); }
  const seenF = new Set<string>(); for (const f of registry.perspectiveFlows) { if (seenF.has(f.flowId)) errors.push({ code: PERSPECTIVE_VALIDATION_CODES.PERSPECTIVE_DUPLICATE_FLOW_ID, message: `Duplicate: "${f.flowId}".`, flowId: f.flowId }); seenF.add(f.flowId); }

  for (const p of registry.perspectives) errors.push(...validatePerspective(p));
  for (const v of registry.explanationViews) errors.push(...validateExplanationView(v));
  for (const a of registry.alternativeViews) errors.push(...validateAlternativeView(a));
  for (const d of registry.disciplinaryViews) errors.push(...validateDisciplinaryView(d));
  for (const i of registry.implementationViews) errors.push(...validateImplementationView(i));
  for (const a of registry.abstractionViews) errors.push(...validateAbstractionView(a));
  for (const f of registry.perspectiveFlows) errors.push(...validatePerspectiveFlow(f));

  return { valid: errors.length === 0, errors, checkedAt: 'perspective_registry_composition' };
}

export function validatePerspectiveInput(input: PerspectiveInput): PerspectiveInputValidationResult {
  const errors: PerspectiveValidationError[] = [];
  for (const p of input.perspectives) errors.push(...validatePerspective(p));
  for (const v of input.explanationViews) errors.push(...validateExplanationView(v));
  for (const a of input.alternativeViews) errors.push(...validateAlternativeView(a));
  for (const d of input.disciplinaryViews) errors.push(...validateDisciplinaryView(d));
  for (const i of input.implementationViews) errors.push(...validateImplementationView(i));
  for (const a of input.abstractionViews) errors.push(...validateAbstractionView(a));
  for (const f of input.perspectiveFlows) errors.push(...validatePerspectiveFlow(f));
  return { valid: errors.length === 0, errors, checkedAt: 'perspective_input_composition' };
}

export function validateNarrativeArtifactWithPerspectives(artifact: NarrativeArtifactWithPerspectives): NarrativeArtifactWithPerspectivesValidationResult {
  const errors: PerspectiveValidationError[] = [];
  if (!artifact.narrativeId || artifact.narrativeId.trim() === '') errors.push({ code: PERSPECTIVE_VALIDATION_CODES.PERSPECTIVE_MISSING_ID, message: 'Artifact missing ID.', field: 'narrativeId' });
  for (const p of artifact.perspectives) errors.push(...validatePerspective(p));
  for (const v of artifact.explanationViews) errors.push(...validateExplanationView(v));
  for (const a of artifact.alternativeViews) errors.push(...validateAlternativeView(a));
  for (const d of artifact.disciplinaryViews) errors.push(...validateDisciplinaryView(d));
  for (const i of artifact.implementationViews) errors.push(...validateImplementationView(i));
  for (const a of artifact.abstractionViews) errors.push(...validateAbstractionView(a));
  for (const f of artifact.perspectiveFlows) errors.push(...validatePerspectiveFlow(f));
  return { valid: errors.length === 0, errors, checkedAt: 'narrative_artifact_with_perspectives_composition' };
}
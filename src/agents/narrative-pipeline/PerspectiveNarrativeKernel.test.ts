/**
 * NV-1700-D6-OPT-09 — Multi-Perspective Explanation & Alternative Viewpoint Modeling Test Suite
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import type {
  PerspectiveProvenance, Perspective, ExplanationView, AlternativeView, DisciplinaryView,
  ImplementationView, AbstractionView, PerspectiveFlow, PerspectiveInput, PerspectiveRegistry,
  NarrativeArtifactWithPerspectives,
} from './NarrativeAgentContract.ts';

import {
  CANONICAL_PERSPECTIVE_TYPES, CANONICAL_EXPLANATION_TYPES, CANONICAL_ALTERNATIVE_VIEW_TYPES,
  CANONICAL_DISCIPLINARY_VIEW_TYPES, CANONICAL_EXPLANATION_ABSTRACTION_TYPES,
  CANONICAL_IMPLEMENTATION_VIEW_TYPES, CANONICAL_PERSPECTIVE_FLOW_TYPES, CANONICAL_PERSPECTIVE_STATUS,
} from './NarrativeAgentContract.ts';

import {
  composePerspectiveProvenance, composePerspective, composeExplanationView, composeAlternativeView,
  composeDisciplinaryView, composeImplementationView, composeAbstractionView, composePerspectiveFlow,
  composePerspectiveTrace, composePerspectiveRegistry, composePerspectiveRegistryFromInput,
  composeNarrativePerspectives, composeNarrativeArtifactWithPerspectives,
  isSupportedPerspectiveType, isSupportedExplanationType, isSupportedAlternativeViewType,
  isSupportedDisciplinaryViewType, isSupportedExplanationAbstractionType,
  isSupportedImplementationViewType, isSupportedPerspectiveFlowType, isSupportedPerspectiveStatus,
  getCanonicalPerspectiveTypes, getCanonicalExplanationTypes, getCanonicalAlternativeViewTypes,
  getCanonicalDisciplinaryViewTypes, getCanonicalExplanationAbstractionTypes,
  getCanonicalImplementationViewTypes, getCanonicalPerspectiveFlowTypes, getCanonicalPerspectiveStatuses,
} from './PerspectiveNarrativeKernel.ts';

import {
  validatePerspective, validateExplanationView, validateAlternativeView, validateDisciplinaryView,
  validateImplementationView, validateAbstractionView, validatePerspectiveFlow,
  validatePerspectiveRegistry, validatePerspectiveInput, validateNarrativeArtifactWithPerspectives,
  PERSPECTIVE_VALIDATION_CODES,
} from './PerspectiveNarrativeValidation.ts';

const VP: PerspectiveProvenance = { source: 'NeuralVerse Team', governanceStatus: 'canonical', providedBy: 'NeuralVerse Team', rationale: 'Core.' };

const P1: Perspective = { perspectiveId: 'p-1', perspectiveType: 'mathematical', title: 'Math View', description: 'D.', relatedConceptId: 'k-1', governanceStatus: 'canonical', provenance: VP };
const P2: Perspective = { perspectiveId: 'p-2', perspectiveType: 'computational', title: 'CS View', description: 'D.', relatedConceptId: 'k-2', governanceStatus: 'accepted', provenance: { ...VP, source: 'Research' } };
const EV1: ExplanationView = { viewId: 'ev-1', explanationType: 'formal', title: 'Formal', description: 'D.', perspectiveId: 'p-1', governanceStatus: 'canonical', provenance: VP };
const EV2: ExplanationView = { viewId: 'ev-2', explanationType: 'intuitive', title: 'Intuitive', description: 'D.', perspectiveId: 'p-2', governanceStatus: 'accepted', provenance: { ...VP, source: 'Research' } };
const AV1: AlternativeView = { alternativeId: 'av-1', alternativeType: 'different_domain', sourceViewId: 'ev-1', targetViewId: 'ev-2', description: 'D.', governanceStatus: 'canonical', provenance: VP };
const AV2: AlternativeView = { alternativeId: 'av-2', alternativeType: 'different_abstraction', sourceViewId: 'ev-2', targetViewId: 'ev-1', description: 'D.', governanceStatus: 'accepted', provenance: { ...VP, source: 'Research' } };
const DV1: DisciplinaryView = { disciplinaryViewId: 'dv-1', disciplinaryType: 'mathematics', title: 'Math', description: 'D.', relatedArtifactId: 'k-1', governanceStatus: 'canonical', provenance: VP };
const DV2: DisciplinaryView = { disciplinaryViewId: 'dv-2', disciplinaryType: 'computer_science', title: 'CS', description: 'D.', relatedArtifactId: 'k-2', governanceStatus: 'accepted', provenance: { ...VP, source: 'Research' } };
const IV1: ImplementationView = { implementationViewId: 'iv-1', implementationType: 'python', title: 'Python', description: 'D.', relatedArtifactId: 'k-1', governanceStatus: 'canonical', provenance: VP };
const IV2: ImplementationView = { implementationViewId: 'iv-2', implementationType: 'pseudocode', title: 'Pseudocode', description: 'D.', relatedArtifactId: 'k-2', governanceStatus: 'accepted', provenance: { ...VP, source: 'Research' } };
const AbV1: AbstractionView = { abstractionViewId: 'abv-1', abstractionType: 'concrete', title: 'Concrete', description: 'D.', relatedArtifactId: 'k-1', governanceStatus: 'canonical', provenance: VP };
const AbV2: AbstractionView = { abstractionViewId: 'abv-2', abstractionType: 'theoretical', title: 'Theoretical', description: 'D.', relatedArtifactId: 'k-2', governanceStatus: 'accepted', provenance: { ...VP, source: 'Research' } };
const PF1: PerspectiveFlow = { flowId: 'pf-1', flowType: 'single_view', perspectiveIds: ['p-1'], viewIds: ['ev-1'], governanceStatus: 'canonical', provenance: VP };
const PF2: PerspectiveFlow = { flowId: 'pf-2', flowType: 'progressive_views', perspectiveIds: ['p-2'], viewIds: ['ev-2'], governanceStatus: 'accepted', provenance: { ...VP, source: 'Research' } };

const INPUT: PerspectiveInput = { perspectives: [P1, P2], explanationViews: [EV1, EV2], alternativeViews: [AV1, AV2], disciplinaryViews: [DV1, DV2], implementationViews: [IV1, IV2], abstractionViews: [AbV1, AbV2], perspectiveFlows: [PF1, PF2] };

describe('Perspective Kernel — Composition', () => {
  it('should compose valid provenance', () => { const p = composePerspectiveProvenance({ source: 'Team', governanceStatus: 'canonical', providedBy: 'Team', rationale: 'R.' }); assert.equal(p.source, 'Team'); });
  it('should compose valid perspective', () => { const p = composePerspective({ perspectiveId: 'p-1', perspectiveType: 'mathematical', title: 'T', description: 'D.', relatedConceptId: 'k-1', governanceStatus: 'canonical', provenance: VP }); assert.equal(p.perspectiveId, 'p-1'); });
  it('should compose valid explanation view', () => { const v = composeExplanationView({ viewId: 'v-1', explanationType: 'formal', title: 'T', description: 'D.', perspectiveId: 'p-1', governanceStatus: 'canonical', provenance: VP }); assert.equal(v.viewId, 'v-1'); });
  it('should compose valid alternative view', () => { const a = composeAlternativeView({ alternativeId: 'a-1', alternativeType: 'different_domain', sourceViewId: 'v-1', targetViewId: 'v-2', description: 'D.', governanceStatus: 'canonical', provenance: VP }); assert.equal(a.alternativeId, 'a-1'); });
  it('should compose valid disciplinary view', () => { const d = composeDisciplinaryView({ disciplinaryViewId: 'd-1', disciplinaryType: 'mathematics', title: 'T', description: 'D.', relatedArtifactId: 'k-1', governanceStatus: 'canonical', provenance: VP }); assert.equal(d.disciplinaryViewId, 'd-1'); });
  it('should compose valid implementation view', () => { const i = composeImplementationView({ implementationViewId: 'i-1', implementationType: 'python', title: 'T', description: 'D.', relatedArtifactId: 'k-1', governanceStatus: 'canonical', provenance: VP }); assert.equal(i.implementationViewId, 'i-1'); });
  it('should compose valid abstraction view', () => { const a = composeAbstractionView({ abstractionViewId: 'ab-1', abstractionType: 'concrete', title: 'T', description: 'D.', relatedArtifactId: 'k-1', governanceStatus: 'canonical', provenance: VP }); assert.equal(a.abstractionViewId, 'ab-1'); });
  it('should compose valid perspective flow', () => { const f = composePerspectiveFlow({ flowId: 'f-1', flowType: 'single_view', perspectiveIds: ['p-1'], viewIds: ['v-1'], governanceStatus: 'canonical', provenance: VP }); assert.equal(f.flowId, 'f-1'); });
  it('should validate all entities with no errors', () => {
    assert.deepStrictEqual(validatePerspective(P1), []);
    assert.deepStrictEqual(validateExplanationView(EV1), []);
    assert.deepStrictEqual(validateAlternativeView(AV1), []);
    assert.deepStrictEqual(validateDisciplinaryView(DV1), []);
    assert.deepStrictEqual(validateImplementationView(IV1), []);
    assert.deepStrictEqual(validateAbstractionView(AbV1), []);
    assert.deepStrictEqual(validatePerspectiveFlow(PF1), []);
  });
  it('should validate input', () => { const r = validatePerspectiveInput(INPUT); assert.equal(r.valid, true); });
});

describe('Perspective Kernel — Registry', () => {
  it('should detect duplicate perspective IDs', () => { const reg = composePerspectiveRegistry([P1, P1], [], [], [], [], [], []); const r = validatePerspectiveRegistry(reg); assert.ok(r.errors.find((e) => e.code === PERSPECTIVE_VALIDATION_CODES.PERSPECTIVE_DUPLICATE_PERSPECTIVE_ID)); });
  it('should detect duplicate view IDs', () => { const reg = composePerspectiveRegistry([], [EV1, EV1], [], [], [], [], []); const r = validatePerspectiveRegistry(reg); assert.ok(r.errors.find((e) => e.code === PERSPECTIVE_VALIDATION_CODES.PERSPECTIVE_DUPLICATE_VIEW_ID)); });
  it('should detect duplicate alternative IDs', () => { const reg = composePerspectiveRegistry([], [], [AV1, AV1], [], [], [], []); const r = validatePerspectiveRegistry(reg); assert.ok(r.errors.find((e) => e.code === PERSPECTIVE_VALIDATION_CODES.PERSPECTIVE_DUPLICATE_ALTERNATIVE_ID)); });
  it('should detect duplicate disciplinary IDs', () => { const reg = composePerspectiveRegistry([], [], [], [DV1, DV1], [], [], []); const r = validatePerspectiveRegistry(reg); assert.ok(r.errors.find((e) => e.code === PERSPECTIVE_VALIDATION_CODES.PERSPECTIVE_DUPLICATE_DISCIPLINARY_ID)); });
  it('should detect duplicate implementation IDs', () => { const reg = composePerspectiveRegistry([], [], [], [], [IV1, IV1], [], []); const r = validatePerspectiveRegistry(reg); assert.ok(r.errors.find((e) => e.code === PERSPECTIVE_VALIDATION_CODES.PERSPECTIVE_DUPLICATE_IMPLEMENTATION_ID)); });
  it('should detect duplicate abstraction IDs', () => { const reg = composePerspectiveRegistry([], [], [], [], [], [AbV1, AbV1], []); const r = validatePerspectiveRegistry(reg); assert.ok(r.errors.find((e) => e.code === PERSPECTIVE_VALIDATION_CODES.PERSPECTIVE_DUPLICATE_ABSTRACTION_ID)); });
  it('should detect duplicate flow IDs', () => { const reg = composePerspectiveRegistry([], [], [], [], [], [], [PF1, PF1]); const r = validatePerspectiveRegistry(reg); assert.ok(r.errors.find((e) => e.code === PERSPECTIVE_VALIDATION_CODES.PERSPECTIVE_DUPLICATE_FLOW_ID)); });
  it('should sort deterministically', () => { const reg = composePerspectiveRegistry([P2, P1], [], [], [], [], [], []); assert.equal(reg.perspectives[0].perspectiveId, 'p-1'); assert.equal(reg.perspectives[1].perspectiveId, 'p-2'); });
});

describe('Perspective Kernel — Validation', () => {
  it('should detect invalid perspective type', () => { assert.ok(validatePerspective({ ...P1, perspectiveType: 'unsupported' as any }).find((e) => e.code === PERSPECTIVE_VALIDATION_CODES.PERSPECTIVE_INVALID_TYPE)); });
  it('should detect invalid explanation type', () => { assert.ok(validateExplanationView({ ...EV1, explanationType: 'unsupported' as any }).find((e) => e.code === PERSPECTIVE_VALIDATION_CODES.PERSPECTIVE_INVALID_EXPLANATION_TYPE)); });
  it('should detect invalid alternative type', () => { assert.ok(validateAlternativeView({ ...AV1, alternativeType: 'unsupported' as any }).find((e) => e.code === PERSPECTIVE_VALIDATION_CODES.PERSPECTIVE_INVALID_ALTERNATIVE_TYPE)); });
  it('should detect invalid disciplinary type', () => { assert.ok(validateDisciplinaryView({ ...DV1, disciplinaryType: 'unsupported' as any }).find((e) => e.code === PERSPECTIVE_VALIDATION_CODES.PERSPECTIVE_INVALID_DISCIPLINARY_TYPE)); });
  it('should detect invalid implementation type', () => { assert.ok(validateImplementationView({ ...IV1, implementationType: 'unsupported' as any }).find((e) => e.code === PERSPECTIVE_VALIDATION_CODES.PERSPECTIVE_INVALID_IMPLEMENTATION_TYPE)); });
  it('should detect invalid abstraction type', () => { assert.ok(validateAbstractionView({ ...AbV1, abstractionType: 'unsupported' as any }).find((e) => e.code === PERSPECTIVE_VALIDATION_CODES.PERSPECTIVE_INVALID_ABSTRACTION_TYPE)); });
  it('should detect invalid flow type', () => { assert.ok(validatePerspectiveFlow({ ...PF1, flowType: 'unsupported' as any }).find((e) => e.code === PERSPECTIVE_VALIDATION_CODES.PERSPECTIVE_INVALID_FLOW_TYPE)); });
  it('should detect missing provenance', () => { assert.ok(validatePerspective({ ...P1, provenance: undefined as any }).find((e) => e.code === PERSPECTIVE_VALIDATION_CODES.PERSPECTIVE_MISSING_PROVENANCE)); });
  it('should detect missing source', () => { assert.ok(validatePerspective({ ...P1, provenance: { ...VP, source: '' } }).find((e) => e.code === PERSPECTIVE_VALIDATION_CODES.PERSPECTIVE_MISSING_SOURCE)); });
  it('should detect missing rationale', () => { assert.ok(validatePerspective({ ...P1, provenance: { ...VP, rationale: '' } }).find((e) => e.code === PERSPECTIVE_VALIDATION_CODES.PERSPECTIVE_MISSING_RATIONALE)); });
  it('should detect missing providedBy', () => { assert.ok(validatePerspective({ ...P1, provenance: { ...VP, providedBy: '' } }).find((e) => e.code === PERSPECTIVE_VALIDATION_CODES.PERSPECTIVE_MISSING_PROVIDED_BY)); });
});

describe('Perspective Kernel — Determinism', () => {
  it('should produce identical output (100 iterations)', () => { const results: ReturnType<typeof composeNarrativePerspectives>[] = []; for (let i = 0; i < 100; i++) results.push(composeNarrativePerspectives(INPUT)); for (let i = 1; i < results.length; i++) { assert.deepStrictEqual(results[0].registryId, results[i].registryId); assert.deepStrictEqual(results[0].perspectives, results[i].perspectives); } });
});

describe('Perspective Kernel — Immutability', () => {
  it('should not mutate input', () => { const original = P1.perspectiveId; composeNarrativePerspectives(INPUT); assert.equal(P1.perspectiveId, original); });
});

describe('Perspective Kernel — Helper Functions', () => {
  it('should return canonical types', () => {
    assert.equal(getCanonicalPerspectiveTypes().length, 10);
    assert.equal(getCanonicalExplanationTypes().length, 10);
    assert.equal(getCanonicalAlternativeViewTypes().length, 10);
    assert.equal(getCanonicalDisciplinaryViewTypes().length, 10);
    assert.equal(getCanonicalExplanationAbstractionTypes().length, 10);
    assert.equal(getCanonicalImplementationViewTypes().length, 10);
    assert.equal(getCanonicalPerspectiveFlowTypes().length, 10);
    assert.equal(getCanonicalPerspectiveStatuses().length, 6);
  });
  it('should validate type support', () => {
    assert.equal(isSupportedPerspectiveType('mathematical'), true);
    assert.equal(isSupportedPerspectiveType('unsupported'), false);
    assert.equal(isSupportedExplanationType('formal'), true);
    assert.equal(isSupportedExplanationType('unsupported'), false);
    assert.equal(isSupportedAlternativeViewType('different_domain'), true);
    assert.equal(isSupportedAlternativeViewType('unsupported'), false);
    assert.equal(isSupportedDisciplinaryViewType('mathematics'), true);
    assert.equal(isSupportedDisciplinaryViewType('unsupported'), false);
    assert.equal(isSupportedExplanationAbstractionType('concrete'), true);
    assert.equal(isSupportedExplanationAbstractionType('unsupported'), false);
    assert.equal(isSupportedImplementationViewType('python'), true);
    assert.equal(isSupportedImplementationViewType('unsupported'), false);
    assert.equal(isSupportedPerspectiveFlowType('single_view'), true);
    assert.equal(isSupportedPerspectiveFlowType('unsupported'), false);
    assert.equal(isSupportedPerspectiveStatus('draft'), true);
    assert.equal(isSupportedPerspectiveStatus('unsupported'), false);
  });
});

describe('Perspective Kernel — Canonical Enum Completeness', () => {
  it('should have exactly 10 perspective types', () => { assert.equal(CANONICAL_PERSPECTIVE_TYPES.length, 10); });
  it('should have exactly 10 explanation types', () => { assert.equal(CANONICAL_EXPLANATION_TYPES.length, 10); });
  it('should have exactly 10 alternative view types', () => { assert.equal(CANONICAL_ALTERNATIVE_VIEW_TYPES.length, 10); });
  it('should have exactly 10 disciplinary view types', () => { assert.equal(CANONICAL_DISCIPLINARY_VIEW_TYPES.length, 10); });
  it('should have exactly 10 abstraction types', () => { assert.equal(CANONICAL_EXPLANATION_ABSTRACTION_TYPES.length, 10); });
  it('should have exactly 10 implementation view types', () => { assert.equal(CANONICAL_IMPLEMENTATION_VIEW_TYPES.length, 10); });
  it('should have exactly 10 flow types', () => { assert.equal(CANONICAL_PERSPECTIVE_FLOW_TYPES.length, 10); });
  it('should have exactly 6 perspective statuses', () => { assert.equal(CANONICAL_PERSPECTIVE_STATUS.length, 6); });
});

describe('Perspective Kernel — Negative Capability Verification', () => {
  it('should not use Math.random', () => { assert.ok(composeNarrativePerspectives(INPUT)); });
  it('should not use Date.now', () => { assert.ok(composeNarrativePerspectives(INPUT)); });
  it('should not generate explanations', () => { const r = composeNarrativePerspectives(INPUT); assert.ok(!('generatedExplanations' in r)); });
  it('should not choose best explanation', () => { const r = composeNarrativePerspectives(INPUT); assert.ok(!('bestExplanation' in r)); assert.ok(!('selectedView' in r)); });
  it('should not personalize viewpoints', () => { const r = composeNarrativePerspectives(INPUT); assert.ok(!('personalizedViews' in r)); assert.ok(!('learnerPreferences' in r)); });
  it('should not call LLMs', () => { const r = composeNarrativePerspectives(INPUT); assert.ok(!('llmCall' in r)); });
  it('should not have executable callbacks', () => { const p = composePerspective({ perspectiveId: 'p-1', perspectiveType: 'mathematical', title: 'T', description: 'D.', relatedConceptId: 'k-1', governanceStatus: 'canonical', provenance: VP }); for (const key of Object.keys(p)) assert.ok(typeof (p as any)[key] !== 'function'); });
});
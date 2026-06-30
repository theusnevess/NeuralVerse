/**
 * NV-1700-D6-OPT-08 — Application-Driven Context & Real-World Relevance Test Suite
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import type {
  ApplicationProvenance, Application, UseCase, IndustrialScenario, EngineeringScenario,
  TechnologyAdoption, RealWorldContext, ApplicationFlow, ApplicationInput, ApplicationRegistry,
  NarrativeArtifactWithApplications,
} from './NarrativeAgentContract.ts';

import {
  CANONICAL_APPLICATION_TYPES, CANONICAL_USE_CASE_TYPES, CANONICAL_INDUSTRY_TYPES,
  CANONICAL_ENGINEERING_SCENARIO_TYPES, CANONICAL_ADOPTION_TYPES, CANONICAL_REAL_WORLD_CONTEXT_TYPES,
  CANONICAL_APPLICATION_FLOW_TYPES, CANONICAL_APPLICATION_STATUS,
} from './NarrativeAgentContract.ts';

import {
  composeApplicationProvenance, composeApplication, composeUseCase, composeIndustrialScenario,
  composeEngineeringScenario, composeTechnologyAdoption, composeRealWorldContext, composeApplicationFlow,
  composeApplicationTrace, composeApplicationRegistry, composeApplicationRegistryFromInput,
  composeNarrativeApplications, composeNarrativeArtifactWithApplications,
  isSupportedApplicationType, isSupportedUseCaseType, isSupportedIndustryType,
  isSupportedEngineeringScenarioType, isSupportedTechnologyAdoptionType,
  isSupportedRealWorldContextType, isSupportedApplicationFlowType, isSupportedApplicationStatus,
  getCanonicalApplicationTypes, getCanonicalUseCaseTypes, getCanonicalIndustryTypes,
  getCanonicalEngineeringScenarioTypes, getCanonicalTechnologyAdoptionTypes,
  getCanonicalRealWorldContextTypes, getCanonicalApplicationFlowTypes, getCanonicalApplicationStatuses,
} from './ApplicationNarrativeKernel.ts';

import {
  validateApplication, validateUseCase, validateIndustrialScenario, validateEngineeringScenario,
  validateTechnologyAdoption, validateRealWorldContext, validateApplicationFlow,
  validateApplicationRegistry, validateApplicationInput, validateNarrativeArtifactWithApplications,
  APPLICATION_VALIDATION_CODES,
} from './ApplicationNarrativeValidation.ts';

const VP: ApplicationProvenance = { source: 'NeuralVerse Team', governanceStatus: 'canonical', providedBy: 'NeuralVerse Team', rationale: 'Core.' };

const A1: Application = { applicationId: 'app-1', applicationType: 'industrial', title: 'Manufacturing QC', description: 'D.', relatedConceptId: 'k-1', governanceStatus: 'canonical', provenance: VP };
const A2: Application = { applicationId: 'app-2', applicationType: 'scientific', title: 'Drug Discovery', description: 'D.', relatedConceptId: 'k-2', governanceStatus: 'accepted', provenance: { ...VP, source: 'Research' } };
const UC1: UseCase = { useCaseId: 'uc-1', useCaseType: 'automation', title: 'Auto Inspection', description: 'D.', applicationId: 'app-1', governanceStatus: 'canonical', provenance: VP };
const UC2: UseCase = { useCaseId: 'uc-2', useCaseType: 'prediction', title: 'Outcome Prediction', description: 'D.', applicationId: 'app-2', governanceStatus: 'accepted', provenance: { ...VP, source: 'Research' } };
const IS1: IndustrialScenario = { scenarioId: 'is-1', industryType: 'manufacturing', title: 'Factory Floor', description: 'D.', relatedApplicationId: 'app-1', governanceStatus: 'canonical', provenance: VP };
const IS2: IndustrialScenario = { scenarioId: 'is-2', industryType: 'healthcare', title: 'Hospital Lab', description: 'D.', relatedApplicationId: 'app-2', governanceStatus: 'accepted', provenance: { ...VP, source: 'Research' } };
const ES1: EngineeringScenario = { engineeringScenarioId: 'es-1', scenarioType: 'system_design', title: 'Pipeline Design', description: 'D.', relatedApplicationId: 'app-1', governanceStatus: 'canonical', provenance: VP };
const ES2: EngineeringScenario = { engineeringScenarioId: 'es-2', scenarioType: 'performance_analysis', title: 'Latency Analysis', description: 'D.', relatedApplicationId: 'app-2', governanceStatus: 'accepted', provenance: { ...VP, source: 'Research' } };
const TA1: TechnologyAdoption = { adoptionId: 'ta-1', adoptionType: 'production', description: 'D.', relatedTechnologyId: 't-1', governanceStatus: 'canonical', provenance: VP };
const TA2: TechnologyAdoption = { adoptionId: 'ta-2', adoptionType: 'research', description: 'D.', relatedTechnologyId: 't-2', governanceStatus: 'accepted', provenance: { ...VP, source: 'Research' } };
const RW1: RealWorldContext = { contextId: 'rw-1', contextType: 'industry', title: 'Factory', description: 'D.', relatedArtifactId: 'k-1', governanceStatus: 'canonical', provenance: VP };
const RW2: RealWorldContext = { contextId: 'rw-2', contextType: 'healthcare', title: 'Hospital', description: 'D.', relatedArtifactId: 'k-2', governanceStatus: 'accepted', provenance: { ...VP, source: 'Research' } };
const AF1: ApplicationFlow = { flowId: 'af-1', flowType: 'problem_to_solution', applicationIds: ['app-1'], contextIds: ['rw-1'], governanceStatus: 'canonical', provenance: VP };
const AF2: ApplicationFlow = { flowId: 'af-2', flowType: 'research_to_industry', applicationIds: ['app-2'], contextIds: ['rw-2'], governanceStatus: 'accepted', provenance: { ...VP, source: 'Research' } };

const INPUT: ApplicationInput = { applications: [A1, A2], useCases: [UC1, UC2], industrialScenarios: [IS1, IS2], engineeringScenarios: [ES1, ES2], technologyAdoptions: [TA1, TA2], realWorldContexts: [RW1, RW2], applicationFlows: [AF1, AF2] };

describe('Application Kernel — Composition', () => {
  it('should compose valid provenance', () => { const p = composeApplicationProvenance({ source: 'Team', governanceStatus: 'canonical', providedBy: 'Team', rationale: 'R.' }); assert.equal(p.source, 'Team'); });
  it('should compose valid application', () => { const a = composeApplication({ applicationId: 'a-1', applicationType: 'industrial', title: 'T', description: 'D.', relatedConceptId: 'k-1', governanceStatus: 'canonical', provenance: VP }); assert.equal(a.applicationId, 'a-1'); });
  it('should compose valid use case', () => { const u = composeUseCase({ useCaseId: 'u-1', useCaseType: 'automation', title: 'T', description: 'D.', applicationId: 'a-1', governanceStatus: 'canonical', provenance: VP }); assert.equal(u.useCaseId, 'u-1'); });
  it('should compose valid industrial scenario', () => { const s = composeIndustrialScenario({ scenarioId: 's-1', industryType: 'manufacturing', title: 'T', description: 'D.', relatedApplicationId: 'a-1', governanceStatus: 'canonical', provenance: VP }); assert.equal(s.scenarioId, 's-1'); });
  it('should compose valid engineering scenario', () => { const s = composeEngineeringScenario({ engineeringScenarioId: 'e-1', scenarioType: 'system_design', title: 'T', description: 'D.', relatedApplicationId: 'a-1', governanceStatus: 'canonical', provenance: VP }); assert.equal(s.engineeringScenarioId, 'e-1'); });
  it('should compose valid adoption', () => { const a = composeTechnologyAdoption({ adoptionId: 'a-1', adoptionType: 'production', description: 'D.', relatedTechnologyId: 't-1', governanceStatus: 'canonical', provenance: VP }); assert.equal(a.adoptionId, 'a-1'); });
  it('should compose valid context', () => { const c = composeRealWorldContext({ contextId: 'c-1', contextType: 'industry', title: 'T', description: 'D.', relatedArtifactId: 'k-1', governanceStatus: 'canonical', provenance: VP }); assert.equal(c.contextId, 'c-1'); });
  it('should compose valid flow', () => { const f = composeApplicationFlow({ flowId: 'f-1', flowType: 'problem_to_solution', applicationIds: ['a-1'], contextIds: ['c-1'], governanceStatus: 'canonical', provenance: VP }); assert.equal(f.flowId, 'f-1'); });
  it('should validate all entities with no errors', () => {
    assert.deepStrictEqual(validateApplication(A1), []);
    assert.deepStrictEqual(validateUseCase(UC1), []);
    assert.deepStrictEqual(validateIndustrialScenario(IS1), []);
    assert.deepStrictEqual(validateEngineeringScenario(ES1), []);
    assert.deepStrictEqual(validateTechnologyAdoption(TA1), []);
    assert.deepStrictEqual(validateRealWorldContext(RW1), []);
    assert.deepStrictEqual(validateApplicationFlow(AF1), []);
  });
  it('should validate input', () => { const r = validateApplicationInput(INPUT); assert.equal(r.valid, true); });
});

describe('Application Kernel — Registry', () => {
  it('should detect duplicate app IDs', () => { const reg = composeApplicationRegistry([A1, A1], [], [], [], [], [], []); const r = validateApplicationRegistry(reg); assert.ok(r.errors.find((e) => e.code === APPLICATION_VALIDATION_CODES.APPLICATION_DUPLICATE_APP_ID)); });
  it('should detect duplicate use case IDs', () => { const reg = composeApplicationRegistry([], [UC1, UC1], [], [], [], [], []); const r = validateApplicationRegistry(reg); assert.ok(r.errors.find((e) => e.code === APPLICATION_VALIDATION_CODES.APPLICATION_DUPLICATE_USE_CASE_ID)); });
  it('should detect duplicate scenario IDs', () => { const reg = composeApplicationRegistry([], [], [IS1, IS1], [], [], [], []); const r = validateApplicationRegistry(reg); assert.ok(r.errors.find((e) => e.code === APPLICATION_VALIDATION_CODES.APPLICATION_DUPLICATE_SCENARIO_ID)); });
  it('should detect duplicate engineering scenario IDs', () => { const reg = composeApplicationRegistry([], [], [], [ES1, ES1], [], [], []); const r = validateApplicationRegistry(reg); assert.ok(r.errors.find((e) => e.code === APPLICATION_VALIDATION_CODES.APPLICATION_DUPLICATE_ENGINEERING_SCENARIO_ID)); });
  it('should detect duplicate adoption IDs', () => { const reg = composeApplicationRegistry([], [], [], [], [TA1, TA1], [], []); const r = validateApplicationRegistry(reg); assert.ok(r.errors.find((e) => e.code === APPLICATION_VALIDATION_CODES.APPLICATION_DUPLICATE_ADOPTION_ID)); });
  it('should detect duplicate context IDs', () => { const reg = composeApplicationRegistry([], [], [], [], [], [RW1, RW1], []); const r = validateApplicationRegistry(reg); assert.ok(r.errors.find((e) => e.code === APPLICATION_VALIDATION_CODES.APPLICATION_DUPLICATE_CONTEXT_ID)); });
  it('should detect duplicate flow IDs', () => { const reg = composeApplicationRegistry([], [], [], [], [], [], [AF1, AF1]); const r = validateApplicationRegistry(reg); assert.ok(r.errors.find((e) => e.code === APPLICATION_VALIDATION_CODES.APPLICATION_DUPLICATE_FLOW_ID)); });
  it('should sort deterministically', () => { const reg = composeApplicationRegistry([A2, A1], [], [], [], [], [], []); assert.equal(reg.applications[0].applicationId, 'app-1'); assert.equal(reg.applications[1].applicationId, 'app-2'); });
});

describe('Application Kernel — Validation', () => {
  it('should detect invalid app type', () => { assert.ok(validateApplication({ ...A1, applicationType: 'unsupported' as any }).find((e) => e.code === APPLICATION_VALIDATION_CODES.APPLICATION_INVALID_TYPE)); });
  it('should detect invalid use case type', () => { assert.ok(validateUseCase({ ...UC1, useCaseType: 'unsupported' as any }).find((e) => e.code === APPLICATION_VALIDATION_CODES.APPLICATION_INVALID_USE_CASE_TYPE)); });
  it('should detect invalid industry type', () => { assert.ok(validateIndustrialScenario({ ...IS1, industryType: 'unsupported' as any }).find((e) => e.code === APPLICATION_VALIDATION_CODES.APPLICATION_INVALID_INDUSTRY_TYPE)); });
  it('should detect invalid engineering scenario type', () => { assert.ok(validateEngineeringScenario({ ...ES1, scenarioType: 'unsupported' as any }).find((e) => e.code === APPLICATION_VALIDATION_CODES.APPLICATION_INVALID_ENGINEERING_SCENARIO_TYPE)); });
  it('should detect invalid adoption type', () => { assert.ok(validateTechnologyAdoption({ ...TA1, adoptionType: 'unsupported' as any }).find((e) => e.code === APPLICATION_VALIDATION_CODES.APPLICATION_INVALID_ADOPTION_TYPE)); });
  it('should detect invalid context type', () => { assert.ok(validateRealWorldContext({ ...RW1, contextType: 'unsupported' as any }).find((e) => e.code === APPLICATION_VALIDATION_CODES.APPLICATION_INVALID_CONTEXT_TYPE)); });
  it('should detect invalid flow type', () => { assert.ok(validateApplicationFlow({ ...AF1, flowType: 'unsupported' as any }).find((e) => e.code === APPLICATION_VALIDATION_CODES.APPLICATION_INVALID_FLOW_TYPE)); });
  it('should detect missing provenance', () => { assert.ok(validateApplication({ ...A1, provenance: undefined as any }).find((e) => e.code === APPLICATION_VALIDATION_CODES.APPLICATION_MISSING_PROVENANCE)); });
  it('should detect missing source', () => { assert.ok(validateApplication({ ...A1, provenance: { ...VP, source: '' } }).find((e) => e.code === APPLICATION_VALIDATION_CODES.APPLICATION_MISSING_SOURCE)); });
  it('should detect missing rationale', () => { assert.ok(validateApplication({ ...A1, provenance: { ...VP, rationale: '' } }).find((e) => e.code === APPLICATION_VALIDATION_CODES.APPLICATION_MISSING_RATIONALE)); });
  it('should detect missing providedBy', () => { assert.ok(validateApplication({ ...A1, provenance: { ...VP, providedBy: '' } }).find((e) => e.code === APPLICATION_VALIDATION_CODES.APPLICATION_MISSING_PROVIDED_BY)); });
});

describe('Application Kernel — Determinism', () => {
  it('should produce identical output (100 iterations)', () => { const results: ReturnType<typeof composeNarrativeApplications>[] = []; for (let i = 0; i < 100; i++) results.push(composeNarrativeApplications(INPUT)); for (let i = 1; i < results.length; i++) { assert.deepStrictEqual(results[0].registryId, results[i].registryId); assert.deepStrictEqual(results[0].applications, results[i].applications); } });
});

describe('Application Kernel — Immutability', () => {
  it('should not mutate input', () => { const original = A1.applicationId; composeNarrativeApplications(INPUT); assert.equal(A1.applicationId, original); });
});

describe('Application Kernel — Helper Functions', () => {
  it('should return canonical types', () => {
    assert.equal(getCanonicalApplicationTypes().length, 10);
    assert.equal(getCanonicalUseCaseTypes().length, 10);
    assert.equal(getCanonicalIndustryTypes().length, 10);
    assert.equal(getCanonicalEngineeringScenarioTypes().length, 10);
    assert.equal(getCanonicalTechnologyAdoptionTypes().length, 10);
    assert.equal(getCanonicalRealWorldContextTypes().length, 10);
    assert.equal(getCanonicalApplicationFlowTypes().length, 10);
    assert.equal(getCanonicalApplicationStatuses().length, 6);
  });
  it('should validate type support', () => {
    assert.equal(isSupportedApplicationType('industrial'), true);
    assert.equal(isSupportedApplicationType('unsupported'), false);
    assert.equal(isSupportedUseCaseType('automation'), true);
    assert.equal(isSupportedUseCaseType('unsupported'), false);
    assert.equal(isSupportedIndustryType('manufacturing'), true);
    assert.equal(isSupportedIndustryType('unsupported'), false);
    assert.equal(isSupportedEngineeringScenarioType('system_design'), true);
    assert.equal(isSupportedEngineeringScenarioType('unsupported'), false);
    assert.equal(isSupportedTechnologyAdoptionType('production'), true);
    assert.equal(isSupportedTechnologyAdoptionType('unsupported'), false);
    assert.equal(isSupportedRealWorldContextType('industry'), true);
    assert.equal(isSupportedRealWorldContextType('unsupported'), false);
    assert.equal(isSupportedApplicationFlowType('problem_to_solution'), true);
    assert.equal(isSupportedApplicationFlowType('unsupported'), false);
    assert.equal(isSupportedApplicationStatus('draft'), true);
    assert.equal(isSupportedApplicationStatus('unsupported'), false);
  });
});

describe('Application Kernel — Canonical Enum Completeness', () => {
  it('should have exactly 10 application types', () => { assert.equal(CANONICAL_APPLICATION_TYPES.length, 10); });
  it('should have exactly 10 use case types', () => { assert.equal(CANONICAL_USE_CASE_TYPES.length, 10); });
  it('should have exactly 10 industry types', () => { assert.equal(CANONICAL_INDUSTRY_TYPES.length, 10); });
  it('should have exactly 10 engineering scenario types', () => { assert.equal(CANONICAL_ENGINEERING_SCENARIO_TYPES.length, 10); });
  it('should have exactly 10 adoption types', () => { assert.equal(CANONICAL_ADOPTION_TYPES.length, 10); });
  it('should have exactly 10 context types', () => { assert.equal(CANONICAL_REAL_WORLD_CONTEXT_TYPES.length, 10); });
  it('should have exactly 10 flow types', () => { assert.equal(CANONICAL_APPLICATION_FLOW_TYPES.length, 10); });
  it('should have exactly 6 application statuses', () => { assert.equal(CANONICAL_APPLICATION_STATUS.length, 6); });
});

describe('Application Kernel — Negative Capability Verification', () => {
  it('should not use Math.random', () => { assert.ok(composeNarrativeApplications(INPUT)); });
  it('should not use Date.now', () => { assert.ok(composeNarrativeApplications(INPUT)); });
  it('should not generate examples', () => { const r = composeNarrativeApplications(INPUT); assert.ok(!('generatedExamples' in r)); });
  it('should not invent scenarios', () => { const r = composeNarrativeApplications(INPUT); assert.ok(!('inventedScenarios' in r)); });
  it('should not recommend technologies', () => { const r = composeNarrativeApplications(INPUT); assert.ok(!('techRecommendations' in r)); });
  it('should not call LLMs', () => { const r = composeNarrativeApplications(INPUT); assert.ok(!('llmCall' in r)); });
  it('should not have executable callbacks', () => { const a = composeApplication({ applicationId: 'a-1', applicationType: 'industrial', title: 'T', description: 'D.', relatedConceptId: 'k-1', governanceStatus: 'canonical', provenance: VP }); for (const key of Object.keys(a)) assert.ok(typeof (a as any)[key] !== 'function'); });
});
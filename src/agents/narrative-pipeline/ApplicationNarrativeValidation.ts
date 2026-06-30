/**
 * NV-1700-D6-OPT-08 — Application Narrative Validation Layer
 */

import type {
  Application, UseCase, IndustrialScenario, EngineeringScenario, TechnologyAdoption,
  RealWorldContext, ApplicationFlow, ApplicationRegistry, ApplicationInput,
  NarrativeArtifactWithApplications, ApplicationValidationError,
  ApplicationRegistryValidationResult, ApplicationInputValidationResult,
  NarrativeArtifactWithApplicationsValidationResult,
} from './NarrativeAgentContract.ts';

import {
  CANONICAL_APPLICATION_TYPES, CANONICAL_USE_CASE_TYPES, CANONICAL_INDUSTRY_TYPES,
  CANONICAL_ENGINEERING_SCENARIO_TYPES, CANONICAL_ADOPTION_TYPES, CANONICAL_REAL_WORLD_CONTEXT_TYPES,
  CANONICAL_APPLICATION_FLOW_TYPES, CANONICAL_GOVERNANCE_STATUSES,
} from './NarrativeAgentContract.ts';

export const APPLICATION_VALIDATION_CODES = {
  APPLICATION_DUPLICATE_APP_ID: 'APPLICATION_DUPLICATE_APP_ID',
  APPLICATION_DUPLICATE_USE_CASE_ID: 'APPLICATION_DUPLICATE_USE_CASE_ID',
  APPLICATION_DUPLICATE_SCENARIO_ID: 'APPLICATION_DUPLICATE_SCENARIO_ID',
  APPLICATION_DUPLICATE_ENGINEERING_SCENARIO_ID: 'APPLICATION_DUPLICATE_ENGINEERING_SCENARIO_ID',
  APPLICATION_DUPLICATE_ADOPTION_ID: 'APPLICATION_DUPLICATE_ADOPTION_ID',
  APPLICATION_DUPLICATE_CONTEXT_ID: 'APPLICATION_DUPLICATE_CONTEXT_ID',
  APPLICATION_DUPLICATE_FLOW_ID: 'APPLICATION_DUPLICATE_FLOW_ID',
  APPLICATION_INVALID_TYPE: 'APPLICATION_INVALID_TYPE',
  APPLICATION_INVALID_USE_CASE_TYPE: 'APPLICATION_INVALID_USE_CASE_TYPE',
  APPLICATION_INVALID_INDUSTRY_TYPE: 'APPLICATION_INVALID_INDUSTRY_TYPE',
  APPLICATION_INVALID_ENGINEERING_SCENARIO_TYPE: 'APPLICATION_INVALID_ENGINEERING_SCENARIO_TYPE',
  APPLICATION_INVALID_ADOPTION_TYPE: 'APPLICATION_INVALID_ADOPTION_TYPE',
  APPLICATION_INVALID_CONTEXT_TYPE: 'APPLICATION_INVALID_CONTEXT_TYPE',
  APPLICATION_INVALID_FLOW_TYPE: 'APPLICATION_INVALID_FLOW_TYPE',
  APPLICATION_INVALID_GOVERNANCE: 'APPLICATION_INVALID_GOVERNANCE',
  APPLICATION_MISSING_PROVENANCE: 'APPLICATION_MISSING_PROVENANCE',
  APPLICATION_MISSING_SOURCE: 'APPLICATION_MISSING_SOURCE',
  APPLICATION_MISSING_RATIONALE: 'APPLICATION_MISSING_RATIONALE',
  APPLICATION_MISSING_PROVIDED_BY: 'APPLICATION_MISSING_PROVIDED_BY',
  APPLICATION_MISSING_ID: 'APPLICATION_MISSING_ID',
  APPLICATION_MISSING_TITLE: 'APPLICATION_MISSING_TITLE',
  APPLICATION_MISSING_DESCRIPTION: 'APPLICATION_MISSING_DESCRIPTION',
  APPLICATION_MISSING_ARTIFACT_REFERENCE: 'APPLICATION_MISSING_ARTIFACT_REFERENCE',
  APPLICATION_EMPTY_REGISTRY: 'APPLICATION_EMPTY_REGISTRY',
  APPLICATION_INVALID_TRACE: 'APPLICATION_INVALID_TRACE',
  APPLICATION_TRACE_RANDOM_USED: 'APPLICATION_TRACE_RANDOM_USED',
  APPLICATION_TRACE_TIME_DEPENDENCY: 'APPLICATION_TRACE_TIME_DEPENDENCY',
} as const;

function _validateProvenance(provenance: ApplicationProvenance | undefined, prefix: string, errors: ApplicationValidationError[]): void {
  if (!provenance) { errors.push({ code: `${prefix}_MISSING_PROVENANCE`, message: `${prefix} missing provenance.`, field: 'provenance' }); return; }
  if (!provenance.source || provenance.source.trim() === '') errors.push({ code: 'APPLICATION_MISSING_SOURCE', message: `${prefix} missing source.`, field: 'provenance.source' });
  if (!provenance.rationale || provenance.rationale.trim() === '') errors.push({ code: 'APPLICATION_MISSING_RATIONALE', message: `${prefix} missing rationale.`, field: 'provenance.rationale' });
  if (!provenance.providedBy || provenance.providedBy.trim() === '') errors.push({ code: 'APPLICATION_MISSING_PROVIDED_BY', message: `${prefix} missing providedBy.`, field: 'provenance.providedBy' });
}

import type { ApplicationProvenance } from './NarrativeAgentContract.ts';

export function validateApplication(app: Application): readonly ApplicationValidationError[] {
  const errors: ApplicationValidationError[] = [];
  if (!app.applicationId || app.applicationId.trim() === '') errors.push({ code: APPLICATION_VALIDATION_CODES.APPLICATION_MISSING_ID, message: 'App missing ID.', field: 'applicationId', applicationId: app.applicationId });
  if (!app.title || app.title.trim() === '') errors.push({ code: APPLICATION_VALIDATION_CODES.APPLICATION_MISSING_TITLE, message: 'App missing title.', field: 'title', applicationId: app.applicationId });
  if (!CANONICAL_APPLICATION_TYPES.includes(app.applicationType)) errors.push({ code: APPLICATION_VALIDATION_CODES.APPLICATION_INVALID_TYPE, message: `Invalid type: "${app.applicationType}".`, field: 'applicationType', applicationId: app.applicationId });
  if (!CANONICAL_GOVERNANCE_STATUSES.includes(app.governanceStatus)) errors.push({ code: APPLICATION_VALIDATION_CODES.APPLICATION_INVALID_GOVERNANCE, message: `Invalid governance.`, field: 'governanceStatus', applicationId: app.applicationId });
  _validateProvenance(app.provenance, 'APPLICATION', errors);
  return errors;
}

export function validateUseCase(uc: UseCase): readonly ApplicationValidationError[] {
  const errors: ApplicationValidationError[] = [];
  if (!uc.useCaseId || uc.useCaseId.trim() === '') errors.push({ code: APPLICATION_VALIDATION_CODES.APPLICATION_MISSING_ID, message: 'UseCase missing ID.', field: 'useCaseId', useCaseId: uc.useCaseId });
  if (!uc.title || uc.title.trim() === '') errors.push({ code: APPLICATION_VALIDATION_CODES.APPLICATION_MISSING_TITLE, message: 'UseCase missing title.', field: 'title', useCaseId: uc.useCaseId });
  if (!CANONICAL_USE_CASE_TYPES.includes(uc.useCaseType)) errors.push({ code: APPLICATION_VALIDATION_CODES.APPLICATION_INVALID_USE_CASE_TYPE, message: `Invalid type: "${uc.useCaseType}".`, field: 'useCaseType', useCaseId: uc.useCaseId });
  _validateProvenance(uc.provenance, 'APPLICATION', errors);
  return errors;
}

export function validateIndustrialScenario(s: IndustrialScenario): readonly ApplicationValidationError[] {
  const errors: ApplicationValidationError[] = [];
  if (!s.scenarioId || s.scenarioId.trim() === '') errors.push({ code: APPLICATION_VALIDATION_CODES.APPLICATION_MISSING_ID, message: 'Scenario missing ID.', field: 'scenarioId', scenarioId: s.scenarioId });
  if (!s.title || s.title.trim() === '') errors.push({ code: APPLICATION_VALIDATION_CODES.APPLICATION_MISSING_TITLE, message: 'Scenario missing title.', field: 'title', scenarioId: s.scenarioId });
  if (!CANONICAL_INDUSTRY_TYPES.includes(s.industryType)) errors.push({ code: APPLICATION_VALIDATION_CODES.APPLICATION_INVALID_INDUSTRY_TYPE, message: `Invalid type: "${s.industryType}".`, field: 'industryType', scenarioId: s.scenarioId });
  _validateProvenance(s.provenance, 'APPLICATION', errors);
  return errors;
}

export function validateEngineeringScenario(s: EngineeringScenario): readonly ApplicationValidationError[] {
  const errors: ApplicationValidationError[] = [];
  if (!s.engineeringScenarioId || s.engineeringScenarioId.trim() === '') errors.push({ code: APPLICATION_VALIDATION_CODES.APPLICATION_MISSING_ID, message: 'EngScenario missing ID.', field: 'engineeringScenarioId', engineeringScenarioId: s.engineeringScenarioId });
  if (!s.title || s.title.trim() === '') errors.push({ code: APPLICATION_VALIDATION_CODES.APPLICATION_MISSING_TITLE, message: 'EngScenario missing title.', field: 'title', engineeringScenarioId: s.engineeringScenarioId });
  if (!CANONICAL_ENGINEERING_SCENARIO_TYPES.includes(s.scenarioType)) errors.push({ code: APPLICATION_VALIDATION_CODES.APPLICATION_INVALID_ENGINEERING_SCENARIO_TYPE, message: `Invalid type: "${s.scenarioType}".`, field: 'scenarioType', engineeringScenarioId: s.engineeringScenarioId });
  _validateProvenance(s.provenance, 'APPLICATION', errors);
  return errors;
}

export function validateTechnologyAdoption(a: TechnologyAdoption): readonly ApplicationValidationError[] {
  const errors: ApplicationValidationError[] = [];
  if (!a.adoptionId || a.adoptionId.trim() === '') errors.push({ code: APPLICATION_VALIDATION_CODES.APPLICATION_MISSING_ID, message: 'Adoption missing ID.', field: 'adoptionId', adoptionId: a.adoptionId });
  if (!a.description || a.description.trim() === '') errors.push({ code: APPLICATION_VALIDATION_CODES.APPLICATION_MISSING_DESCRIPTION, message: 'Adoption missing description.', field: 'description', adoptionId: a.adoptionId });
  if (!CANONICAL_ADOPTION_TYPES.includes(a.adoptionType)) errors.push({ code: APPLICATION_VALIDATION_CODES.APPLICATION_INVALID_ADOPTION_TYPE, message: `Invalid type: "${a.adoptionType}".`, field: 'adoptionType', adoptionId: a.adoptionId });
  _validateProvenance(a.provenance, 'APPLICATION', errors);
  return errors;
}

export function validateRealWorldContext(c: RealWorldContext): readonly ApplicationValidationError[] {
  const errors: ApplicationValidationError[] = [];
  if (!c.contextId || c.contextId.trim() === '') errors.push({ code: APPLICATION_VALIDATION_CODES.APPLICATION_MISSING_ID, message: 'Context missing ID.', field: 'contextId', contextId: c.contextId });
  if (!c.title || c.title.trim() === '') errors.push({ code: APPLICATION_VALIDATION_CODES.APPLICATION_MISSING_TITLE, message: 'Context missing title.', field: 'title', contextId: c.contextId });
  if (!CANONICAL_REAL_WORLD_CONTEXT_TYPES.includes(c.contextType)) errors.push({ code: APPLICATION_VALIDATION_CODES.APPLICATION_INVALID_CONTEXT_TYPE, message: `Invalid type: "${c.contextType}".`, field: 'contextType', contextId: c.contextId });
  _validateProvenance(c.provenance, 'APPLICATION', errors);
  return errors;
}

export function validateApplicationFlow(f: ApplicationFlow): readonly ApplicationValidationError[] {
  const errors: ApplicationValidationError[] = [];
  if (!f.flowId || f.flowId.trim() === '') errors.push({ code: APPLICATION_VALIDATION_CODES.APPLICATION_MISSING_ID, message: 'Flow missing ID.', field: 'flowId', flowId: f.flowId });
  if (!CANONICAL_APPLICATION_FLOW_TYPES.includes(f.flowType)) errors.push({ code: APPLICATION_VALIDATION_CODES.APPLICATION_INVALID_FLOW_TYPE, message: `Invalid type: "${f.flowType}".`, field: 'flowType', flowId: f.flowId });
  _validateProvenance(f.provenance, 'APPLICATION', errors);
  return errors;
}

export function validateApplicationRegistry(registry: ApplicationRegistry): ApplicationRegistryValidationResult {
  const errors: ApplicationValidationError[] = [];
  if (!registry.registryId || registry.registryId.trim() === '') errors.push({ code: APPLICATION_VALIDATION_CODES.APPLICATION_EMPTY_REGISTRY, message: 'Registry missing ID.', field: 'registryId' });
  if (registry.deterministic !== true) errors.push({ code: APPLICATION_VALIDATION_CODES.APPLICATION_INVALID_TRACE, message: 'Must declare deterministic: true.', field: 'deterministic' });
  if (registry.randomUsed !== false) errors.push({ code: APPLICATION_VALIDATION_CODES.APPLICATION_TRACE_RANDOM_USED, message: 'Must declare randomUsed: false.', field: 'randomUsed' });
  if (registry.timeDependency !== false) errors.push({ code: APPLICATION_VALIDATION_CODES.APPLICATION_TRACE_TIME_DEPENDENCY, message: 'Must declare timeDependency: false.', field: 'timeDependency' });

  const seenApp = new Set<string>(); for (const a of registry.applications) { if (seenApp.has(a.applicationId)) errors.push({ code: APPLICATION_VALIDATION_CODES.APPLICATION_DUPLICATE_APP_ID, message: `Duplicate: "${a.applicationId}".`, applicationId: a.applicationId }); seenApp.add(a.applicationId); }
  const seenUC = new Set<string>(); for (const u of registry.useCases) { if (seenUC.has(u.useCaseId)) errors.push({ code: APPLICATION_VALIDATION_CODES.APPLICATION_DUPLICATE_USE_CASE_ID, message: `Duplicate: "${u.useCaseId}".`, useCaseId: u.useCaseId }); seenUC.add(u.useCaseId); }
  const seenIS = new Set<string>(); for (const s of registry.industrialScenarios) { if (seenIS.has(s.scenarioId)) errors.push({ code: APPLICATION_VALIDATION_CODES.APPLICATION_DUPLICATE_SCENARIO_ID, message: `Duplicate: "${s.scenarioId}".`, scenarioId: s.scenarioId }); seenIS.add(s.scenarioId); }
  const seenES = new Set<string>(); for (const s of registry.engineeringScenarios) { if (seenES.has(s.engineeringScenarioId)) errors.push({ code: APPLICATION_VALIDATION_CODES.APPLICATION_DUPLICATE_ENGINEERING_SCENARIO_ID, message: `Duplicate: "${s.engineeringScenarioId}".`, engineeringScenarioId: s.engineeringScenarioId }); seenES.add(s.engineeringScenarioId); }
  const seenTA = new Set<string>(); for (const a of registry.technologyAdoptions) { if (seenTA.has(a.adoptionId)) errors.push({ code: APPLICATION_VALIDATION_CODES.APPLICATION_DUPLICATE_ADOPTION_ID, message: `Duplicate: "${a.adoptionId}".`, adoptionId: a.adoptionId }); seenTA.add(a.adoptionId); }
  const seenCtx = new Set<string>(); for (const c of registry.realWorldContexts) { if (seenCtx.has(c.contextId)) errors.push({ code: APPLICATION_VALIDATION_CODES.APPLICATION_DUPLICATE_CONTEXT_ID, message: `Duplicate: "${c.contextId}".`, contextId: c.contextId }); seenCtx.add(c.contextId); }
  const seenFl = new Set<string>(); for (const f of registry.applicationFlows) { if (seenFl.has(f.flowId)) errors.push({ code: APPLICATION_VALIDATION_CODES.APPLICATION_DUPLICATE_FLOW_ID, message: `Duplicate: "${f.flowId}".`, flowId: f.flowId }); seenFl.add(f.flowId); }

  for (const a of registry.applications) errors.push(...validateApplication(a));
  for (const u of registry.useCases) errors.push(...validateUseCase(u));
  for (const s of registry.industrialScenarios) errors.push(...validateIndustrialScenario(s));
  for (const s of registry.engineeringScenarios) errors.push(...validateEngineeringScenario(s));
  for (const a of registry.technologyAdoptions) errors.push(...validateTechnologyAdoption(a));
  for (const c of registry.realWorldContexts) errors.push(...validateRealWorldContext(c));
  for (const f of registry.applicationFlows) errors.push(...validateApplicationFlow(f));

  return { valid: errors.length === 0, errors, checkedAt: 'application_registry_composition' };
}

export function validateApplicationInput(input: ApplicationInput): ApplicationInputValidationResult {
  const errors: ApplicationValidationError[] = [];
  for (const a of input.applications) errors.push(...validateApplication(a));
  for (const u of input.useCases) errors.push(...validateUseCase(u));
  for (const s of input.industrialScenarios) errors.push(...validateIndustrialScenario(s));
  for (const s of input.engineeringScenarios) errors.push(...validateEngineeringScenario(s));
  for (const a of input.technologyAdoptions) errors.push(...validateTechnologyAdoption(a));
  for (const c of input.realWorldContexts) errors.push(...validateRealWorldContext(c));
  for (const f of input.applicationFlows) errors.push(...validateApplicationFlow(f));
  return { valid: errors.length === 0, errors, checkedAt: 'application_input_composition' };
}

export function validateNarrativeArtifactWithApplications(artifact: NarrativeArtifactWithApplications): NarrativeArtifactWithApplicationsValidationResult {
  const errors: ApplicationValidationError[] = [];
  if (!artifact.narrativeId || artifact.narrativeId.trim() === '') errors.push({ code: APPLICATION_VALIDATION_CODES.APPLICATION_MISSING_ID, message: 'Artifact missing ID.', field: 'narrativeId' });
  for (const a of artifact.applications) errors.push(...validateApplication(a));
  for (const u of artifact.useCases) errors.push(...validateUseCase(u));
  for (const s of artifact.industrialScenarios) errors.push(...validateIndustrialScenario(s));
  for (const s of artifact.engineeringScenarios) errors.push(...validateEngineeringScenario(s));
  for (const a of artifact.technologyAdoptions) errors.push(...validateTechnologyAdoption(a));
  for (const c of artifact.realWorldContexts) errors.push(...validateRealWorldContext(c));
  for (const f of artifact.applicationFlows) errors.push(...validateApplicationFlow(f));
  return { valid: errors.length === 0, errors, checkedAt: 'narrative_artifact_with_applications_composition' };
}
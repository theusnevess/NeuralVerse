/**
 * NV-1700-D6-OPT-08 — Application-Driven Context & Real-World Relevance Kernel
 *
 * Deterministic orchestration functions for application metadata.
 * Produces applications, use cases, scenarios, adoptions, contexts, flows, and registries.
 *
 * This module never:
 * - Generates examples
 * - Invents industrial scenarios
 * - Recommends technologies
 * - Infers applications
 * - Searches the web
 * - Calls external APIs
 * - Calls LLMs
 * - Personalizes examples
 * - Mutates narrative artifacts
 *
 * Application metadata only.
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import type {
  ApplicationProvenance,
  NarrativeGovernanceStatus,
  ApplicationType,
  UseCaseType,
  IndustryType,
  EngineeringScenarioType,
  TechnologyAdoptionType,
  RealWorldContextType,
  ApplicationFlowType,
  ApplicationStatus,
  Application,
  UseCase,
  IndustrialScenario,
  EngineeringScenario,
  TechnologyAdoption,
  RealWorldContext,
  ApplicationFlow,
  ApplicationDecision,
  ApplicationTrace,
  ApplicationRegistry,
  ApplicationRegistryMetadata,
  ApplicationInput,
  NarrativeUnitType,
  NarrativeMode,
  NarrativeDomain,
  NarrativeStatus,
  NarrativeProvenance,
  NarrativeArtifactWithApplications,
} from './NarrativeAgentContract.ts';

import {
  CANONICAL_APPLICATION_TYPES,
  CANONICAL_USE_CASE_TYPES,
  CANONICAL_INDUSTRY_TYPES,
  CANONICAL_ENGINEERING_SCENARIO_TYPES,
  CANONICAL_ADOPTION_TYPES,
  CANONICAL_REAL_WORLD_CONTEXT_TYPES,
  CANONICAL_APPLICATION_FLOW_TYPES,
  CANONICAL_APPLICATION_STATUS,
  CANONICAL_GOVERNANCE_STATUSES,
} from './NarrativeAgentContract.ts';

// ---------------------------------------------------------------------------
// Application Provenance Composition
// ---------------------------------------------------------------------------

export function composeApplicationProvenance(params: {
  readonly source: string;
  readonly governanceStatus: NarrativeGovernanceStatus;
  readonly providedBy: string;
  readonly rationale: string;
}): ApplicationProvenance {
  return { source: params.source, governanceStatus: params.governanceStatus, providedBy: params.providedBy, rationale: params.rationale };
}

// ---------------------------------------------------------------------------
// Entity Compositions
// ---------------------------------------------------------------------------

export function composeApplication(params: {
  readonly applicationId: string;
  readonly applicationType: ApplicationType;
  readonly title: string;
  readonly description: string;
  readonly relatedConceptId: string;
  readonly governanceStatus: NarrativeGovernanceStatus;
  readonly provenance: ApplicationProvenance;
}): Application {
  return { applicationId: params.applicationId, applicationType: params.applicationType, title: params.title, description: params.description, relatedConceptId: params.relatedConceptId, governanceStatus: params.governanceStatus, provenance: params.provenance };
}

export function composeUseCase(params: {
  readonly useCaseId: string;
  readonly useCaseType: UseCaseType;
  readonly title: string;
  readonly description: string;
  readonly applicationId: string;
  readonly governanceStatus: NarrativeGovernanceStatus;
  readonly provenance: ApplicationProvenance;
}): UseCase {
  return { useCaseId: params.useCaseId, useCaseType: params.useCaseType, title: params.title, description: params.description, applicationId: params.applicationId, governanceStatus: params.governanceStatus, provenance: params.provenance };
}

export function composeIndustrialScenario(params: {
  readonly scenarioId: string;
  readonly industryType: IndustryType;
  readonly title: string;
  readonly description: string;
  readonly relatedApplicationId: string;
  readonly governanceStatus: NarrativeGovernanceStatus;
  readonly provenance: ApplicationProvenance;
}): IndustrialScenario {
  return { scenarioId: params.scenarioId, industryType: params.industryType, title: params.title, description: params.description, relatedApplicationId: params.relatedApplicationId, governanceStatus: params.governanceStatus, provenance: params.provenance };
}

export function composeEngineeringScenario(params: {
  readonly engineeringScenarioId: string;
  readonly scenarioType: EngineeringScenarioType;
  readonly title: string;
  readonly description: string;
  readonly relatedApplicationId: string;
  readonly governanceStatus: NarrativeGovernanceStatus;
  readonly provenance: ApplicationProvenance;
}): EngineeringScenario {
  return { engineeringScenarioId: params.engineeringScenarioId, scenarioType: params.scenarioType, title: params.title, description: params.description, relatedApplicationId: params.relatedApplicationId, governanceStatus: params.governanceStatus, provenance: params.provenance };
}

export function composeTechnologyAdoption(params: {
  readonly adoptionId: string;
  readonly adoptionType: TechnologyAdoptionType;
  readonly description: string;
  readonly relatedTechnologyId: string;
  readonly governanceStatus: NarrativeGovernanceStatus;
  readonly provenance: ApplicationProvenance;
}): TechnologyAdoption {
  return { adoptionId: params.adoptionId, adoptionType: params.adoptionType, description: params.description, relatedTechnologyId: params.relatedTechnologyId, governanceStatus: params.governanceStatus, provenance: params.provenance };
}

export function composeRealWorldContext(params: {
  readonly contextId: string;
  readonly contextType: RealWorldContextType;
  readonly title: string;
  readonly description: string;
  readonly relatedArtifactId: string;
  readonly governanceStatus: NarrativeGovernanceStatus;
  readonly provenance: ApplicationProvenance;
}): RealWorldContext {
  return { contextId: params.contextId, contextType: params.contextType, title: params.title, description: params.description, relatedArtifactId: params.relatedArtifactId, governanceStatus: params.governanceStatus, provenance: params.provenance };
}

export function composeApplicationFlow(params: {
  readonly flowId: string;
  readonly flowType: ApplicationFlowType;
  readonly applicationIds: readonly string[];
  readonly contextIds: readonly string[];
  readonly governanceStatus: NarrativeGovernanceStatus;
  readonly provenance: ApplicationProvenance;
}): ApplicationFlow {
  return { flowId: params.flowId, flowType: params.flowType, applicationIds: [...params.applicationIds], contextIds: [...params.contextIds], governanceStatus: params.governanceStatus, provenance: params.provenance };
}

// ---------------------------------------------------------------------------
// Decision & Trace
// ---------------------------------------------------------------------------

function _composeApplicationDecision(applicationId: string, validationPassed: boolean, validationErrors: readonly string[]): ApplicationDecision {
  return { decisionId: `_decision_${applicationId}`, applicationId, validationPassed, validationErrors };
}

export function composeApplicationTrace(params: {
  readonly traceId: string;
  readonly decisions: readonly ApplicationDecision[];
  readonly registryVersion: string;
  readonly pipelineVersion: string;
  readonly applicationCount: number;
  readonly useCaseCount: number;
  readonly industrialScenarioCount: number;
  readonly engineeringScenarioCount: number;
  readonly technologyAdoptionCount: number;
  readonly contextCount: number;
  readonly flowCount: number;
}): ApplicationTrace {
  return {
    traceId: params.traceId, decisionCount: params.decisions.length, validationCount: params.decisions.filter((d) => d.validationPassed).length,
    applicationCount: params.applicationCount, useCaseCount: params.useCaseCount, industrialScenarioCount: params.industrialScenarioCount,
    engineeringScenarioCount: params.engineeringScenarioCount, technologyAdoptionCount: params.technologyAdoptionCount,
    contextCount: params.contextCount, flowCount: params.flowCount,
    registryVersion: params.registryVersion, pipelineVersion: params.pipelineVersion,
    compositionMetadata: {}, deterministicMetadata: {}, deterministic: true,
    generatedFrom: 'deterministic_application_kernel', randomUsed: false, timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Artifact With Applications
// ---------------------------------------------------------------------------

export function composeNarrativeArtifactWithApplications(params: {
  readonly narrativeId: string; readonly title: string; readonly unitType: NarrativeUnitType; readonly narrativeMode: NarrativeMode;
  readonly domain: NarrativeDomain; readonly status: NarrativeStatus; readonly canonicalKnowledgeId: string; readonly curriculumNodeId: string;
  readonly lessonId: string; readonly laboratoryId: string; readonly sequenceOrder: number; readonly summary: string;
  readonly tags: readonly string[]; readonly provenance: NarrativeProvenance;
  readonly applications: readonly Application[]; readonly useCases: readonly UseCase[];
  readonly industrialScenarios: readonly IndustrialScenario[]; readonly engineeringScenarios: readonly EngineeringScenario[];
  readonly technologyAdoptions: readonly TechnologyAdoption[]; readonly realWorldContexts: readonly RealWorldContext[];
  readonly applicationFlows: readonly ApplicationFlow[];
}): NarrativeArtifactWithApplications {
  return {
    narrativeId: params.narrativeId, title: params.title, unitType: params.unitType, narrativeMode: params.narrativeMode,
    domain: params.domain, status: params.status, canonicalKnowledgeId: params.canonicalKnowledgeId, curriculumNodeId: params.curriculumNodeId,
    lessonId: params.lessonId, laboratoryId: params.laboratoryId, sequenceOrder: params.sequenceOrder, summary: params.summary,
    tags: [...params.tags], provenance: params.provenance,
    applications: [...params.applications], useCases: [...params.useCases],
    industrialScenarios: [...params.industrialScenarios], engineeringScenarios: [...params.engineeringScenarios],
    technologyAdoptions: [...params.technologyAdoptions], realWorldContexts: [...params.realWorldContexts],
    applicationFlows: [...params.applicationFlows],
  };
}

// ---------------------------------------------------------------------------
// Deterministic Sort Comparators
// ---------------------------------------------------------------------------

function _compareApp(a: Application, b: Application): number {
  if (a.applicationId < b.applicationId) return -1; if (a.applicationId > b.applicationId) return 1;
  if (a.applicationType < b.applicationType) return -1; if (a.applicationType > b.applicationType) return 1;
  if (a.title < b.title) return -1; if (a.title > b.title) return 1; return 0;
}

function _compareUseCase(a: UseCase, b: UseCase): number {
  if (a.useCaseId < b.useCaseId) return -1; if (a.useCaseId > b.useCaseId) return 1;
  if (a.useCaseType < b.useCaseType) return -1; if (a.useCaseType > b.useCaseType) return 1;
  if (a.title < b.title) return -1; if (a.title > b.title) return 1; return 0;
}

function _compareIndustrial(a: IndustrialScenario, b: IndustrialScenario): number {
  if (a.scenarioId < b.scenarioId) return -1; if (a.scenarioId > b.scenarioId) return 1;
  if (a.industryType < b.industryType) return -1; if (a.industryType > b.industryType) return 1;
  return 0;
}

function _compareEngineering(a: EngineeringScenario, b: EngineeringScenario): number {
  if (a.engineeringScenarioId < b.engineeringScenarioId) return -1; if (a.engineeringScenarioId > b.engineeringScenarioId) return 1;
  if (a.scenarioType < b.scenarioType) return -1; if (a.scenarioType > b.scenarioType) return 1;
  return 0;
}

function _compareAdoption(a: TechnologyAdoption, b: TechnologyAdoption): number {
  if (a.adoptionId < b.adoptionId) return -1; if (a.adoptionId > b.adoptionId) return 1;
  if (a.adoptionType < b.adoptionType) return -1; if (a.adoptionType > b.adoptionType) return 1;
  return 0;
}

function _compareContext(a: RealWorldContext, b: RealWorldContext): number {
  if (a.contextId < b.contextId) return -1; if (a.contextId > b.contextId) return 1;
  if (a.contextType < b.contextType) return -1; if (a.contextType > b.contextType) return 1;
  return 0;
}

function _compareFlow(a: ApplicationFlow, b: ApplicationFlow): number {
  if (a.flowId < b.flowId) return -1; if (a.flowId > b.flowId) return 1;
  if (a.flowType < b.flowType) return -1; if (a.flowType > b.flowType) return 1;
  return 0;
}

// ---------------------------------------------------------------------------
// Application Registry Composition
// ---------------------------------------------------------------------------

export function composeApplicationRegistry(
  applications: readonly Application[], useCases: readonly UseCase[],
  industrialScenarios: readonly IndustrialScenario[], engineeringScenarios: readonly EngineeringScenario[],
  technologyAdoptions: readonly TechnologyAdoption[], realWorldContexts: readonly RealWorldContext[],
  applicationFlows: readonly ApplicationFlow[],
): ApplicationRegistry {
  const sortedApps = [...applications].sort(_compareApp);
  const sortedUC = [...useCases].sort(_compareUseCase);
  const sortedIS = [...industrialScenarios].sort(_compareIndustrial);
  const sortedES = [...engineeringScenarios].sort(_compareEngineering);
  const sortedTA = [...technologyAdoptions].sort(_compareAdoption);
  const sortedRWC = [...realWorldContexts].sort(_compareContext);
  const sortedAF = [...applicationFlows].sort(_compareFlow);

  const metadata: ApplicationRegistryMetadata = {
    registryId: `_application_registry_${sortedApps.length}`,
    applicationCount: sortedApps.length, useCaseCount: sortedUC.length,
    industrialScenarioCount: sortedIS.length, engineeringScenarioCount: sortedES.length,
    technologyAdoptionCount: sortedTA.length, contextCount: sortedRWC.length, flowCount: sortedAF.length,
  };

  return {
    registryId: metadata.registryId, applications: sortedApps, useCases: sortedUC,
    industrialScenarios: sortedIS, engineeringScenarios: sortedES, technologyAdoptions: sortedTA,
    realWorldContexts: sortedRWC, applicationFlows: sortedAF, metadata,
    trace: {
      traceId: `_application_trace_${sortedApps.length}`, decisionCount: 0, validationCount: 0,
      applicationCount: sortedApps.length, useCaseCount: sortedUC.length,
      industrialScenarioCount: sortedIS.length, engineeringScenarioCount: sortedES.length,
      technologyAdoptionCount: sortedTA.length, contextCount: sortedRWC.length, flowCount: sortedAF.length,
      registryVersion: '1.0.0', pipelineVersion: '1.0.0', compositionMetadata: {}, deterministicMetadata: {},
      deterministic: true, generatedFrom: 'deterministic_application_kernel', randomUsed: false, timeDependency: false,
    },
    deterministic: true, generatedFrom: 'deterministic_application_kernel', randomUsed: false, timeDependency: false,
  };
}

export function composeApplicationRegistryFromInput(input: ApplicationInput): ApplicationRegistry {
  return composeApplicationRegistry(input.applications, input.useCases, input.industrialScenarios,
    input.engineeringScenarios, input.technologyAdoptions, input.realWorldContexts, input.applicationFlows);
}

// ---------------------------------------------------------------------------
// Main Entry Point
// ---------------------------------------------------------------------------

export function composeNarrativeApplications(input: ApplicationInput): ApplicationRegistry {
  const decisions = input.applications.map((app) => {
    const errors = _validateAppForDecision(app);
    return _composeApplicationDecision(app.applicationId, errors.length === 0, errors);
  });

  const registry = composeApplicationRegistry(input.applications, input.useCases, input.industrialScenarios,
    input.engineeringScenarios, input.technologyAdoptions, input.realWorldContexts, input.applicationFlows);

  return {
    ...registry,
    trace: composeApplicationTrace({
      traceId: `_application_trace_${input.applications.length}`, decisions, registryVersion: '1.0.0', pipelineVersion: '1.0.0',
      applicationCount: input.applications.length, useCaseCount: input.useCases.length,
      industrialScenarioCount: input.industrialScenarios.length, engineeringScenarioCount: input.engineeringScenarios.length,
      technologyAdoptionCount: input.technologyAdoptions.length, contextCount: input.realWorldContexts.length, flowCount: input.applicationFlows.length,
    }),
  };
}

function _validateAppForDecision(app: Application): readonly string[] {
  const errors: string[] = [];
  if (!app.applicationId || app.applicationId.trim() === '') errors.push('APPLICATION_MISSING_ID');
  if (!app.title || app.title.trim() === '') errors.push('APPLICATION_MISSING_TITLE');
  if (!CANONICAL_APPLICATION_TYPES.includes(app.applicationType)) errors.push('APPLICATION_INVALID_TYPE');
  if (!CANONICAL_GOVERNANCE_STATUSES.includes(app.governanceStatus)) errors.push('APPLICATION_INVALID_GOVERNANCE');
  if (!app.provenance) errors.push('APPLICATION_MISSING_PROVENANCE');
  return errors;
}

// ---------------------------------------------------------------------------
// Type Guards
// ---------------------------------------------------------------------------

export function isSupportedApplicationType(v: string): v is ApplicationType { return CANONICAL_APPLICATION_TYPES.includes(v as ApplicationType); }
export function isSupportedUseCaseType(v: string): v is UseCaseType { return CANONICAL_USE_CASE_TYPES.includes(v as UseCaseType); }
export function isSupportedIndustryType(v: string): v is IndustryType { return CANONICAL_INDUSTRY_TYPES.includes(v as IndustryType); }
export function isSupportedEngineeringScenarioType(v: string): v is EngineeringScenarioType { return CANONICAL_ENGINEERING_SCENARIO_TYPES.includes(v as EngineeringScenarioType); }
export function isSupportedTechnologyAdoptionType(v: string): v is TechnologyAdoptionType { return CANONICAL_ADOPTION_TYPES.includes(v as TechnologyAdoptionType); }
export function isSupportedRealWorldContextType(v: string): v is RealWorldContextType { return CANONICAL_REAL_WORLD_CONTEXT_TYPES.includes(v as RealWorldContextType); }
export function isSupportedApplicationFlowType(v: string): v is ApplicationFlowType { return CANONICAL_APPLICATION_FLOW_TYPES.includes(v as ApplicationFlowType); }
export function isSupportedApplicationStatus(v: string): v is ApplicationStatus { return CANONICAL_APPLICATION_STATUS.includes(v as ApplicationStatus); }

// ---------------------------------------------------------------------------
// Canonical Getters
// ---------------------------------------------------------------------------

export function getCanonicalApplicationTypes(): readonly ApplicationType[] { return CANONICAL_APPLICATION_TYPES; }
export function getCanonicalUseCaseTypes(): readonly UseCaseType[] { return CANONICAL_USE_CASE_TYPES; }
export function getCanonicalIndustryTypes(): readonly IndustryType[] { return CANONICAL_INDUSTRY_TYPES; }
export function getCanonicalEngineeringScenarioTypes(): readonly EngineeringScenarioType[] { return CANONICAL_ENGINEERING_SCENARIO_TYPES; }
export function getCanonicalTechnologyAdoptionTypes(): readonly TechnologyAdoptionType[] { return CANONICAL_ADOPTION_TYPES; }
export function getCanonicalRealWorldContextTypes(): readonly RealWorldContextType[] { return CANONICAL_REAL_WORLD_CONTEXT_TYPES; }
export function getCanonicalApplicationFlowTypes(): readonly ApplicationFlowType[] { return CANONICAL_APPLICATION_FLOW_TYPES; }
export function getCanonicalApplicationStatuses(): readonly ApplicationStatus[] { return CANONICAL_APPLICATION_STATUS; }

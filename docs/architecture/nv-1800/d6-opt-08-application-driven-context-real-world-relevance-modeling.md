# D6-OPT-08 — Application-Driven Context & Real-World Relevance Modeling

## Purpose

This optimization introduces deterministic modeling for connecting theoretical knowledge with real-world applications. It represents industrial applications, engineering applications, scientific applications, business relevance, societal relevance, practical use cases, domain-specific scenarios, and technology adoption.

This layer models metadata only. It does not generate examples, invent applications, search external sources, or personalize content.

## Philosophy

Learners retain concepts more effectively when they understand where those concepts are used. The Narrative Agent models application opportunities. It does not generate them.

## Architecture

```
src/agents/narrative-pipeline/
  NarrativeAgentContract.ts             — Extended with application types
  ApplicationNarrativeKernel.ts         — Application composition functions
  ApplicationNarrativeValidation.ts     — Application validation layer
  ApplicationNarrativeKernel.test.ts    — Test suite (~50 tests)
  index.ts                              — Updated public API barrel
```

## Canonical Enums

### Application Types (10)

`industrial`, `scientific`, `engineering`, `academic`, `commercial`, `medical`, `environmental`, `robotics`, `computer_vision`, `artificial_intelligence`

### Use Case Types (10)

`automation`, `prediction`, `classification`, `optimization`, `monitoring`, `decision_support`, `simulation`, `quality_control`, `research`, `education`

### Industry Types (10)

`manufacturing`, `healthcare`, `agriculture`, `finance`, `transportation`, `energy`, `telecommunications`, `education`, `aerospace`, `software`

### Engineering Scenario Types (10)

`system_design`, `performance_analysis`, `resource_optimization`, `failure_analysis`, `algorithm_selection`, `architecture_design`, `deployment`, `maintenance`, `validation`, `benchmarking`

### Technology Adoption Types (10)

`research`, `prototype`, `pilot`, `experimental`, `production`, `enterprise`, `large_scale`, `global`, `legacy`, `emerging`

### Real-World Context Types (10)

`daily_life`, `industry`, `research`, `government`, `education`, `consumer_products`, `scientific_laboratory`, `healthcare`, `infrastructure`, `environment`

### Application Flow Types (10)

`problem_to_solution`, `theory_to_application`, `algorithm_to_system`, `concept_to_product`, `research_to_industry`, `experiment_to_deployment`, `prototype_to_scale`, `simulation_to_validation`, `analysis_to_decision`, `learning_to_practice`

### Application Status (6)

`draft`, `review`, `approved`, `published`, `deprecated`, `archived`

## Models

### Application

- `applicationId` — unique identifier
- `applicationType` — one of 10 canonical application types
- `title` — descriptive title
- `description` — metadata description
- `relatedConceptId` — references governed knowledge
- `governanceStatus` — canonical governance status
- `provenance` — mandatory governance metadata

### UseCase

- `useCaseId` — unique identifier
- `useCaseType` — one of 10 canonical use case types
- `title` — descriptive title
- `description` — metadata description
- `applicationId` — references an application
- `governanceStatus` — canonical governance status
- `provenance` — mandatory governance metadata

### IndustrialScenario

- `scenarioId` — unique identifier
- `industryType` — one of 10 canonical industry types
- `title` — descriptive title
- `description` — metadata description
- `relatedApplicationId` — references an application
- `governanceStatus` — canonical governance status
- `provenance` — mandatory governance metadata

### EngineeringScenario

- `engineeringScenarioId` — unique identifier
- `scenarioType` — one of 10 canonical engineering scenario types
- `title` — descriptive title
- `description` — metadata description
- `relatedApplicationId` — references an application
- `governanceStatus` — canonical governance status
- `provenance` — mandatory governance metadata

### TechnologyAdoption

- `adoptionId` — unique identifier
- `adoptionType` — one of 10 canonical adoption types
- `description` — metadata description
- `relatedTechnologyId` — references a technology
- `governanceStatus` — canonical governance status
- `provenance` — mandatory governance metadata

### RealWorldContext

- `contextId` — unique identifier
- `contextType` — one of 10 canonical context types
- `title` — descriptive title
- `description` — metadata description
- `relatedArtifactId` — references governed knowledge
- `governanceStatus` — canonical governance status
- `provenance` — mandatory governance metadata

### ApplicationFlow

- `flowId` — unique identifier
- `flowType` — one of 10 canonical flow types
- `applicationIds` — references to applications
- `contextIds` — references to contexts
- `governanceStatus` — canonical governance status
- `provenance` — mandatory governance metadata

## Registry Model

The `ApplicationRegistry` stores all application-layer entities:

- `applications` — sorted applications
- `useCases` — sorted use cases
- `industrialScenarios` — sorted industrial scenarios
- `engineeringScenarios` — sorted engineering scenarios
- `technologyAdoptions` — sorted technology adoptions
- `realWorldContexts` — sorted real-world contexts
- `applicationFlows` — sorted application flows
- `metadata` — counts and metadata
- `trace` — deterministic trace metadata

Deterministic sorting for each collection. No insertion-order dependence.

## Provenance Model

Every entity requires provenance with:

- `source` — origin of the metadata
- `governanceStatus` — canonical governance status
- `providedBy` — responsible entity
- `rationale` — justification

Missing provenance fails validation.

## Deterministic Guarantees

- All composition functions are pure with no side effects
- Trace metadata declares `deterministic: true`, `randomUsed: false`, `timeDependency: false`
- No timestamps, runtime identifiers, or clocks in trace metadata
- Input arrays are copied before sorting: `[...items].sort(...)`
- All public interfaces use `readonly`

## Validation Strategy

- Never throws exceptions for expected validation failures
- Always returns structured `ApplicationValidationError[]`
- Uses stable validation codes (e.g., `APPLICATION_DUPLICATE_APP_ID`)
- Covers: all entity types, duplicate detection, enum validation, provenance validation, registry integrity

## Out of Scope

This optimization does NOT implement:

- Example generation
- Industrial scenario invention
- Technology recommendation
- Application inference
- Web search
- External API access
- LLM calls
- Example personalization
- Narrative artifact mutation

## Relationship with D6-OPT-01 through D6-OPT-07

D6-OPT-08 extends D6-OPT-01 through D6-OPT-07 without modifying them. All previous exports remain fully backward compatible. Only additive architecture is permitted.

D6-OPT-08 consumes governed outputs from:

- D6-OPT-01 Narrative Registry
- D6-OPT-02 Narrative Style Registry
- D6-OPT-03 Problem Registry
- D6-OPT-04 Analogy Registry
- D6-OPT-05 Story Flow Registry
- D6-OPT-06 Engagement Registry
- D6-OPT-07 Historical Registry
- Knowledge Agent (D5)

D6-OPT-08 produces:

- Application metadata
- Use case metadata
- Industrial scenario metadata
- Engineering scenario metadata
- Technology adoption metadata
- Real-world context metadata
- Application flow metadata
- Application registries
- Artifacts with applied applications

## Public API

### Constants

- `CANONICAL_APPLICATION_TYPES` — 10 values
- `CANONICAL_USE_CASE_TYPES` — 10 values
- `CANONICAL_INDUSTRY_TYPES` — 10 values
- `CANONICAL_ENGINEERING_SCENARIO_TYPES` — 10 values
- `CANONICAL_ADOPTION_TYPES` — 10 values
- `CANONICAL_REAL_WORLD_CONTEXT_TYPES` — 10 values
- `CANONICAL_APPLICATION_FLOW_TYPES` — 10 values
- `CANONICAL_APPLICATION_STATUS` — 6 values

### Composition Functions

- `composeApplicationProvenance()`
- `composeApplication()`
- `composeUseCase()`
- `composeIndustrialScenario()`
- `composeEngineeringScenario()`
- `composeTechnologyAdoption()`
- `composeRealWorldContext()`
- `composeApplicationFlow()`
- `composeApplicationTrace()`
- `composeApplicationRegistry()`
- `composeApplicationRegistryFromInput()`
- `composeNarrativeApplications()`
- `composeNarrativeArtifactWithApplications()`

### Helper Functions

- `isSupportedApplicationType()`
- `isSupportedUseCaseType()`
- `isSupportedIndustryType()`
- `isSupportedEngineeringScenarioType()`
- `isSupportedTechnologyAdoptionType()`
- `isSupportedRealWorldContextType()`
- `isSupportedApplicationFlowType()`
- `isSupportedApplicationStatus()`
- `getCanonicalApplicationTypes()`
- `getCanonicalUseCaseTypes()`
- `getCanonicalIndustryTypes()`
- `getCanonicalEngineeringScenarioTypes()`
- `getCanonicalTechnologyAdoptionTypes()`
- `getCanonicalRealWorldContextTypes()`
- `getCanonicalApplicationFlowTypes()`
- `getCanonicalApplicationStatuses()`

### Validation Functions

- `validateApplication()`
- `validateUseCase()`
- `validateIndustrialScenario()`
- `validateEngineeringScenario()`
- `validateTechnologyAdoption()`
- `validateRealWorldContext()`
- `validateApplicationFlow()`
- `validateApplicationRegistry()`
- `validateApplicationInput()`
- `validateNarrativeArtifactWithApplications()`

## Future D6 Extensions

- D6-OPT-09: Lesson closure synthesis
- D6-OPT-10: Narrative certification & public facade

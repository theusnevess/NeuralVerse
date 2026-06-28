# D7-OPT-11 — Portfolio-Oriented Project Mapping

## Purpose

Implements the canonical Portfolio-Oriented Project Mapping architecture for the Application Agent. This optimization introduces the deterministic metadata model responsible for representing portfolio projects, engineering deliverables, implementation complexity, showcase value, and professional competency mapping.

This layer answers:

- Which portfolio projects demonstrate this knowledge?
- Which engineering competencies are evidenced?
- Which implementation artifacts should exist?
- Which deliverables compose a professional portfolio?
- How can this application become a demonstrable engineering project?

The Application Agent models portfolio metadata. It never generates projects. It never creates repositories. It never evaluates portfolios. It never recommends career paths. Only canonical portfolio metadata is represented.

---

## Motivation

NeuralVerse contains extensive knowledge artifacts (D5), application foundations (D7-OPT-01), use case mappings (D7-OPT-02), system architectures (D7-OPT-03), case studies (D7-OPT-04), trade-off analyses (D7-OPT-05), laboratory integrations (D7-OPT-06), solution comparisons (D7-OPT-07), engineering judgment (D7-OPT-08), MLOps lifecycle (D7-OPT-09), and technology maturity (D7-OPT-10). The missing link is the systematic representation of portfolio projects and engineering deliverables.

This optimization creates the governed metadata layer that captures:

- Portfolio projects and their types
- Engineering deliverables and their categories
- Competency evidence and skill mapping
- Showcase opportunities and presentation channels
- Complete traceability from knowledge to demonstration

Every represented portfolio project is curated metadata that has already been validated through NeuralVerse governance.

---

## Portfolio Philosophy

Engineering knowledge becomes valuable when it can be demonstrated. Portfolio projects are representations of engineering capability. This optimization models those representations. The Application Agent documents portfolio opportunities. It never generates implementation. It never creates repositories. It never evaluates employability.

---

## Engineering Demonstration Model

A complete portfolio project includes:

- Core project metadata (type, complexity, status)
- Engineering deliverables (code, documentation, reports)
- Competency evidence (skills demonstrated)
- Showcase channels (GitHub, blogs, demos)

All dimensions are independent. Complexity does not imply quality. Deliverables do not imply competence.

---

## Architecture

The implementation follows every architectural convention established across D1–D7:

- immutable contracts
- deterministic compose functions
- structured validation
- provenance-first architecture
- registry-based composition
- zero hidden state
- additive evolution only

---

## Canonical Enums

### Portfolio Project Types (10)

```text
computer_vision_system
machine_learning_pipeline
deep_learning_application
generative_ai_solution
mlops_platform
edge_ai_application
robotics_project
research_reproduction
engineering_platform
full_stack_ai_system
```

### Deliverable Types (10)

```text
source_code
documentation
technical_report
architecture_diagram
dataset
trained_model
deployment_package
demonstration_video
presentation
benchmark_report
```

### Competency Evidence Types (10)

```text
software_engineering
machine_learning
deep_learning
computer_vision
mlops
system_design
research
optimization
deployment
communication
```

### Project Complexity Levels (5)

```text
introductory
intermediate
advanced
professional
expert
```

### Portfolio Showcase Types (10)

```text
github
technical_blog
conference_demo
research_poster
video_demonstration
interactive_demo
documentation_site
portfolio_page
competition_submission
academic_project
```

### Portfolio Status (6)

```text
draft
review
approved
published
deprecated
archived
```

---

## Contracts

### PortfolioProjectProvenance

- `providedBy`
- `rationale`
- `reviewedBy`
- `reviewDate`
- `governanceStatus`

### PortfolioProject

- `projectId`
- `title`
- `description`
- `projectType`
- `complexityLevel`
- `applicationArtifactId`
- `knowledgeArtifactId`
- `status`
- `provenance`

### ProjectDeliverable

- `deliverableId`
- `projectId`
- `deliverableType`
- `description`
- `provenance`

### CompetencyEvidence

- `competencyId`
- `projectId`
- `competencyType`
- `description`
- `provenance`

### PortfolioShowcase

- `showcaseId`
- `projectId`
- `showcaseType`
- `description`
- `provenance`

---

## Registry

The registry stores metadata only.

Sorting is deterministic:

- Projects: `projectId` → `projectType` → `title`
- Deliverables: `projectId` → `deliverableType` → `deliverableId`
- Competencies: `projectId` → `competencyType` → `competencyId`
- Showcases: `projectId` → `showcaseType` → `showcaseId`

---

## Composition Pipeline

### Functions

- `composePortfolioProjectProvenance()` — Composes provenance
- `composePortfolioProject()` — Composes a project
- `composeProjectDeliverable()` — Composes a deliverable
- `composeCompetencyEvidence()` — Composes competency evidence
- `composePortfolioShowcase()` — Composes a showcase
- `composePortfolioProjectDecision()` — Composes a decision
- `composePortfolioProjectTrace()` — Composes a trace
- `composePortfolioProjectRegistry()` — Composes a registry
- `composePortfolioProjectRegistryFromInput()` — Composes a registry from input
- `composePortfolioProjects()` — Main entry point
- `composeApplicationArtifactWithPortfolioProjects()` — Attaches registry to artifact

---

## Validation Layer

### Functions

- `validatePortfolioProject()` — Validates a project
- `validateProjectDeliverable()` — Validates a deliverable
- `validateCompetencyEvidence()` — Validates competency evidence
- `validatePortfolioShowcase()` — Validates a showcase
- `validatePortfolioProjectRegistry()` — Validates a complete registry
- `validatePortfolioProjectInput()` — Validates input data
- `validatePortfolioProjectTrace()` — Validates trace metadata
- `validateApplicationArtifactWithPortfolioProjects()` — Validates artifact composition

### Validation Codes (22)

```text
PORTFOLIO_DUPLICATE_ID
PORTFOLIO_DUPLICATE_TITLE
DELIVERABLE_DUPLICATE_ID
COMPETENCY_DUPLICATE_ID
SHOWCASE_DUPLICATE_ID
PORTFOLIO_INVALID_PROJECT_TYPE
PORTFOLIO_INVALID_DELIVERABLE
PORTFOLIO_INVALID_COMPETENCY
PORTFOLIO_INVALID_SHOWCASE
PORTFOLIO_INVALID_COMPLEXITY
PORTFOLIO_INVALID_STATUS
PORTFOLIO_INVALID_GOVERNANCE
PORTFOLIO_MISSING_PROVENANCE
PORTFOLIO_MISSING_PROVIDER
PORTFOLIO_MISSING_RATIONALE
PORTFOLIO_MISSING_APPLICATION_REFERENCE
PORTFOLIO_MISSING_KNOWLEDGE_REFERENCE
PORTFOLIO_MISSING_PROJECT_ID
PORTFOLIO_MISSING_TITLE
PORTFOLIO_EMPTY_REGISTRY
PORTFOLIO_INVALID_TRACE
PORTFOLIO_REGISTRY_INCONSISTENCY
```

Validation returns structured errors. Never throws exceptions.

---

## Determinism

The implementation never uses:

```text
Math.random
Date.now
performance.now
new Date()
crypto.randomUUID()
uuid
Promise
async
await
fetch
XMLHttpRequest
WebSocket
window
document
navigator
localStorage
sessionStorage
indexedDB
globalThis
process.env
```

No runtime clocks. No randomness.

---

## Governance

Every portfolio project is governed metadata. The kernel:

- Never generates projects
- Creates repositories
- Evaluates portfolios
- Recommends career paths
- Stores metadata only

---

## Public API

### Kernel Functions

- `composePortfolioProjectProvenance()`
- `composePortfolioProject()`
- `composeProjectDeliverable()`
- `composeCompetencyEvidence()`
- `composePortfolioShowcase()`
- `composePortfolioProjectDecision()`
- `composePortfolioProjectTrace()`
- `composePortfolioProjectRegistry()`
- `composePortfolioProjectRegistryFromInput()`
- `composePortfolioProjects()`
- `composeApplicationArtifactWithPortfolioProjects()`

### Helper Functions

- `isSupportedPortfolioProjectType()`
- `isSupportedProjectDeliverableType()`
- `isSupportedCompetencyType()`
- `isSupportedPortfolioShowcaseType()`
- `isSupportedProjectComplexityLevel()`
- `isSupportedPortfolioStatus()`
- `isSupportedPortfolioGovernance()`
- `getCanonicalPortfolioProjectTypes()`
- `getCanonicalProjectDeliverableTypes()`
- `getCanonicalCompetencyTypes()`
- `getCanonicalPortfolioShowcaseTypes()`
- `getCanonicalProjectComplexityLevels()`
- `getCanonicalPortfolioStatuses()`

### Validation Functions

- `validatePortfolioProject()`
- `validateProjectDeliverable()`
- `validateCompetencyEvidence()`
- `validatePortfolioShowcase()`
- `validatePortfolioProjectRegistry()`
- `validatePortfolioProjectInput()`
- `validatePortfolioProjectTrace()`
- `validateApplicationArtifactWithPortfolioProjects()`

---

## Runtime Limitations

This optimization runs entirely in-memory. It:

- Does not access the filesystem
- Does not make network requests
- Does not use external APIs
- Does not require database connections
- Does not use async operations

---

## Out-of-Scope

This optimization must NOT implement:

- Project generation
- Repository creation
- Code generation
- GitHub integration
- Career recommendation
- Resume evaluation
- Portfolio scoring
- Automatic implementation
- LLM inference
- Project planner

---

## Cross-Agent Boundaries

The Application Agent may reference:

- Knowledge artifacts (D5)
- Narrative artifacts (D6)
- Laboratory identifiers (D4)

The Application Agent MUST NOT:

- Generate projects
- Generate code
- Create repositories
- Create Git commits
- Evaluate portfolios
- Estimate employability
- Recommend careers
- Modify external registries

---

## Relationship with D4

D7-OPT-11 references D4 (Laboratory Agent) through immutable laboratory identifiers:

- D4 owns all laboratory metadata
- D7-OPT-11 references laboratories by ID
- D7-OPT-11 does not modify D4 registries

---

## Relationship with D5

D7-OPT-11 references D5 (Knowledge Agent) through immutable knowledge artifact IDs:

- D5 owns all knowledge metadata
- D7-OPT-11 references knowledge artifacts by ID
- D7-OPT-11 does not modify D5 registries

---

## Relationship with D6

D7-OPT-11 references D6 (Narrative Agent) through immutable narrative artifact IDs:

- D6 owns all narrative metadata
- D7-OPT-11 references narrative artifacts by ID
- D7-OPT-11 does not modify D6 registries

---

## Relationship with D7-OPT-01

D7-OPT-11 builds directly on D7-OPT-01:

- D7-OPT-01 provides the canonical application registry kernel
- D7-OPT-11 adds portfolio project as a sub-domain
- Both share the same governance model and provenance architecture

---

## Relationship with D7-OPT-02

D7-OPT-11 extends use case mapping from D7-OPT-02:

- D7-OPT-02 maps concepts to use cases
- D7-OPT-11 maps use cases to portfolio projects
- Projects reference use case IDs for traceability

---

## Relationship with D7-OPT-03

D7-OPT-11 extends system architecture mapping from D7-OPT-03:

- D7-OPT-03 maps concepts to system architectures
- D7-OPT-11 maps architectures to portfolio projects
- Projects reference architecture IDs for traceability

---

## Relationship with D7-OPT-04

D7-OPT-11 extends case study modeling from D7-OPT-04:

- D7-OPT-04 maps concepts to complete case studies
- D7-OPT-11 maps case studies to portfolio projects
- Projects reference case study IDs for traceability

---

## Relationship with D7-OPT-05

D7-OPT-11 extends trade-off analysis from D7-OPT-05:

- D7-OPT-05 maps concepts to engineering trade-offs
- D7-OPT-11 maps trade-offs to portfolio projects
- Projects reference trade-off IDs for traceability

---

## Relationship with D7-OPT-06

D7-OPT-11 extends laboratory integration from D7-OPT-06:

- D7-OPT-06 maps concepts to laboratory integrations
- D7-OPT-11 maps integrations to portfolio projects
- Projects reference integration IDs for traceability

---

## Relationship with D7-OPT-07

D7-OPT-11 extends solution comparison from D7-OPT-07:

- D7-OPT-07 maps concepts to solution comparisons
- D7-OPT-11 maps comparisons to portfolio projects
- Projects reference comparison IDs for traceability

---

## Relationship with D7-OPT-08

D7-OPT-11 extends engineering judgment from D7-OPT-08:

- D7-OPT-08 maps concepts to engineering mistakes and judgments
- D7-OPT-11 maps judgments to portfolio projects
- Projects reference judgment IDs for traceability

---

## Relationship with D7-OPT-09

D7-OPT-11 extends MLOps lifecycle from D7-OPT-09:

- D7-OPT-09 maps concepts to production lifecycles
- D7-OPT-11 maps lifecycles to portfolio projects
- Projects reference lifecycle IDs for traceability

---

## Relationship with D7-OPT-10

D7-OPT-11 extends technology maturity from D7-OPT-10:

- D7-OPT-10 maps concepts to technology maturity profiles
- D7-OPT-11 maps maturity to portfolio projects
- Projects reference maturity IDs for traceability

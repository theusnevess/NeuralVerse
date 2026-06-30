# D8-OPT-13 — Portfolio-Oriented Evaluation

## Purpose

This phase introduces the metadata architecture that allows assessment artifacts to be connected to portfolio evidence, real-world engineering deliverables, competency demonstrations, and showcase readiness.

This module **does not generate portfolios**, **does not evaluate learners**, **does not recommend projects**, and **does not determine hiring readiness**.

Its sole responsibility is to model deterministic metadata describing how an assessment artifact contributes to portfolio-oriented evidence.

## Motivation

Portfolio-oriented evaluation is essential for connecting assessment outcomes to real-world engineering demonstrations. This module provides the canonical metadata structures that enable:

- Linking assessment artifacts to portfolio evidence
- Classifying competency demonstrations
- Defining showcase readiness levels
- Establishing deterministic relationships between portfolio evaluations

All operations are purely structural. No runtime logic, no mutable state, no probabilistic behavior.

## Architecture

The module follows the established D8-OPT pattern:

```
AssessmentPortfolioKernel.ts
├── Helper Functions (type guards + canonical getters)
├── Compose Functions (pure deterministic composition)
│   ├── composePortfolioEvaluationProvenance
│   ├── composePortfolioEvaluationTrace
│   ├── composePortfolioArtifactReference
│   ├── composePortfolioCompetencyEvidence
│   ├── composePortfolioShowcaseClassification
│   ├── composePortfolioRelationship
│   ├── composePortfolioEvaluation
│   ├── composePortfolioRegistry
│   ├── composePortfolioRegistryFromInput
│   ├── composeAssessmentPortfolioEvaluations
│   └── composeAssessmentArtifactWithPortfolio
└── Canonical ID Generator (_deterministicId)

AssessmentPortfolioValidation.ts
├── Validation Codes (24 stable codes)
├── Validation Functions (never throw)
│   ├── validatePortfolioArtifactReference
│   ├── validatePortfolioCompetencyEvidence
│   ├── validatePortfolioShowcaseClassification
│   ├── validatePortfolioEvaluation
│   ├── validatePortfolioRelationship
│   ├── validatePortfolioRegistry
│   ├── validatePortfolioInput
│   ├── validatePortfolioTrace
│   └── validateAssessmentArtifactWithPortfolio
```

## Canonical Enums

### CANONICAL_PORTFOLIO_EVALUATION_TYPES (10 values)
- project_based
- artifact_review
- engineering_showcase
- capstone
- implementation_validation
- architecture_review
- competency_demonstration
- production_readiness
- research_portfolio
- professional_showcase

### CANONICAL_PORTFOLIO_ARTIFACT_TYPES (10 values)
- repository
- technical_report
- architecture_document
- research_report
- presentation
- codebase
- deployment
- experiment
- benchmark
- documentation

### CANONICAL_PORTFOLIO_COMPETENCY_TYPES (10 values)
- implementation
- architecture
- engineering_reasoning
- problem_solving
- debugging
- optimization
- documentation
- communication
- research
- deployment

### CANONICAL_SHOWCASE_LEVELS (10 values)
- internal
- educational
- academic
- professional
- industry
- conference
- competition
- publication
- open_source
- flagship

### CANONICAL_PORTFOLIO_EVALUATION_STATUS (6 values)
- draft
- review
- approved
- published
- deprecated
- archived

## Contracts

### Core Types
- **PortfolioEvaluation** — Main entity representing a governed portfolio evaluation
- **PortfolioArtifactReference** — Reference to a portfolio artifact
- **PortfolioCompetencyEvidence** — Evidence of competency demonstration
- **PortfolioShowcaseClassification** — Classification of showcase level
- **PortfolioRelationship** — Relationship between portfolio evaluations
- **PortfolioEvaluationProvenance** — Provenance metadata
- **PortfolioEvaluationDecision** — Governance decision metadata
- **PortfolioEvaluationTrace** — Deterministic trace metadata
- **PortfolioRegistryMetadata** — Registry-level metadata
- **PortfolioRegistry** — Complete portfolio evaluation registry
- **PortfolioInput** — Input object for compose functions
- **AssessmentArtifactWithPortfolio** — Artifact enriched with portfolio evaluations

### Validation Types
- **PortfolioValidationError** — Single validation error
- **PortfolioValidationResult** — Generic validation result
- **PortfolioRegistryValidationResult** — Registry-level validation result
- **PortfolioInputValidationResult** — Input-level validation result
- **PortfolioTraceValidationResult** — Trace-level validation result
- **AssessmentArtifactWithPortfolioValidationResult** — Artifact validation result

## Validation Codes (24 codes)

All codes are prefixed with `PORTFOLIO_` and are stable forever:

1. PORTFOLIO_DUPLICATE_ID
2. PORTFOLIO_DUPLICATE_TITLE
3. PORTFOLIO_ARTIFACT_DUPLICATE_ID
4. PORTFOLIO_COMPETENCY_DUPLICATE_ID
5. PORTFOLIO_SHOWCASE_DUPLICATE_ID
6. PORTFOLIO_INVALID_TYPE
7. PORTFOLIO_INVALID_ARTIFACT
8. PORTFOLIO_INVALID_COMPETENCY
9. PORTFOLIO_INVALID_SHOWCASE
10. PORTFOLIO_INVALID_STATUS
11. PORTFOLIO_INVALID_GOVERNANCE
12. PORTFOLIO_MISSING_PROVENANCE
13. PORTFOLIO_MISSING_PROVIDER
14. PORTFOLIO_MISSING_RATIONALE
15. PORTFOLIO_MISSING_ASSESSMENT_REFERENCE
16. PORTFOLIO_MISSING_PORTFOLIO_REFERENCE
17. PORTFOLIO_MISSING_PORTFOLIO_ID
18. PORTFOLIO_MISSING_TITLE
19. PORTFOLIO_SELF_RELATIONSHIP
20. PORTFOLIO_EMPTY_REGISTRY
21. PORTFOLIO_INVALID_TRACE
22. PORTFOLIO_REGISTRY_INCONSISTENCY
23. PORTFOLIO_INVALID_CONFIGURATION
24. PORTFOLIO_INVALID_REFERENCE

## Deterministic Guarantees

- Same inputs always produce identical outputs
- No global mutable state reads
- No random values (no Math.random, no Date.now, no crypto.randomUUID)
- No time dependency
- Canonical order is always preserved
- All arrays are defensively copied with spread operator
- Trace metadata always declares: deterministic=true, randomUsed=false, timeDependency=false

## Cross-Agent Boundary

This module SHALL NOT:
- Generate portfolios
- Evaluate repositories
- Score projects
- Judge employability
- Recommend careers
- Recommend hiring
- Build GitHub repositories
- Generate portfolio content
- Modify Application Agent
- Modify Curriculum Agent

## Test Coverage

85+ deterministic tests covering:
- Canonical enum completeness
- Helper functions (type guards + canonical getters)
- Compose functions (all entities)
- Validation functions (all validators)
- Registry operations
- Deterministic identity (100 iterations)
- Immutability verification
- Negative capability verification
- Validation code structure
- Cross-agent boundary tests

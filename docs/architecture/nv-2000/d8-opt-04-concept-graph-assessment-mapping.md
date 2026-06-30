# NV-2000-D8-OPT-04 — Concept Graph Assessment Mapping

**Version:** 1.0
**Status:** READY
**Date:** 2025-06-28

## Purpose

Implement the canonical Concept Graph Assessment Mapping subsystem for the Assessment Agent.

This optimization introduces deterministic modeling of how assessment artifacts evaluate concept graphs rather than isolated concepts. The agent models assessment coverage of concept graphs. It never computes knowledge graphs, performs graph traversal, or infers prerequisite structures.

## Motivation

Assessment artifacts do not evaluate isolated concepts. They evaluate relationships, dependencies, prerequisite chains, competency groups, and architectural layers within concept graphs. D8-OPT-04 creates the deterministic infrastructure for representing these graph-based assessment mappings.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│          Concept Graph Kernel (D8-OPT-04)                   │
│                                                              │
│  ┌──────────────────┐    ┌──────────────────┐               │
│  │  Graph Enums      │    │  Graph           │               │
│  │  (5 canonical)    │───▶│  Contracts       │               │
│  └──────────────────┘    └──────────────────┘               │
│           │                       │                          │
│           ▼                       ▼                          │
│  ┌──────────────────┐    ┌──────────────────┐               │
│  │  Graph           │    │  Graph           │               │
│  │  Kernel          │───▶│  Validation      │               │
│  │  (Compose Fns)   │    │  (Never Throws)  │               │
│  └──────────────────┘    └──────────────────┘               │
│                                                              │
│  Deterministic. Pure. Immutable. No side effects.            │
│  Never computes graphs. Never infers prerequisites.          │
└─────────────────────────────────────────────────────────────┘
```

## Canonical Enums

| Enum | Count | Values |
|------|-------|--------|
| `CANONICAL_CONCEPT_NODE_TYPES` | 10 | concept, principle, definition, algorithm, technique, formula, workflow, architecture, constraint, application |
| `CANONICAL_RELATIONSHIP_TYPES` | 10 | prerequisite, dependency, composition, generalization, specialization, comparison, causality, implementation, application, equivalence |
| `CANONICAL_GRAPH_COVERAGE_TYPES` | 10 | single_node, partial_cluster, complete_cluster, dependency_chain, hierarchical_branch, cross_domain, workflow_path, architecture_layer, competency_group, full_graph |
| `CANONICAL_ASSESSMENT_GRAPH_OBJECTIVES` | 10 | concept_validation, dependency_validation, prerequisite_validation, relationship_validation, competency_validation, architecture_validation, reasoning_validation, workflow_validation, integration_validation, mastery_validation |
| `CANONICAL_GRAPH_MAPPING_STATUS` | 6 | draft, review, approved, published, deprecated, archived |

## Contracts

| Contract | Purpose |
|----------|---------|
| `ConceptGraphProvenance` | Immutable provenance metadata |
| `ConceptGraphDecision` | Governance decision metadata |
| `ConceptGraphTrace` | Deterministic trace metadata |
| `ConceptNodeReference` | Reference to a concept node |
| `ConceptRelationship` | Relationship between concept nodes |
| `AssessmentConceptCoverage` | How an assessment covers a concept graph |
| `AssessmentConceptGraph` | Governed assessment-concept graph mapping |
| `GraphCoverageEntry` | Single coverage entry in registry |
| `ConceptGraphRegistryMetadata` | Registry-level metadata |
| `ConceptGraphRegistry` | Complete concept graph registry |
| `ConceptGraphInput` | Input for compose functions |
| `AssessmentArtifactWithConceptGraph` | Artifact enriched with concept graph |

## Registry

The `ConceptGraphRegistry` is an immutable collection of `AssessmentConceptGraph` objects with deterministic metadata. It:

- Sorts graphs by ID (lexicographic)
- Generates deterministic registry IDs from sorted graph IDs
- Declares version, nodeCount, and trace metadata
- Never mutates input arrays

## Validation

Validation functions return structured errors, never throw.

### Validation Codes (22)

| Code | Description |
|------|-------------|
| `GRAPH_DUPLICATE_ID` | Duplicate graph ID detected |
| `GRAPH_DUPLICATE_TITLE` | Duplicate graph title detected |
| `GRAPH_NODE_DUPLICATE_ID` | Duplicate node ID detected |
| `GRAPH_RELATIONSHIP_DUPLICATE_ID` | Duplicate relationship ID detected |
| `GRAPH_INVALID_NODE_TYPE` | Non-canonical concept node type |
| `GRAPH_INVALID_RELATIONSHIP` | Non-canonical relationship type |
| `GRAPH_INVALID_COVERAGE` | Non-canonical coverage type |
| `GRAPH_INVALID_OBJECTIVE` | Non-canonical assessment objective |
| `GRAPH_INVALID_STATUS` | Non-canonical graph mapping status |
| `GRAPH_INVALID_GOVERNANCE` | Non-canonical governance level |
| `GRAPH_MISSING_PROVENANCE` | Missing provenance object |
| `GRAPH_MISSING_PROVIDER` | Missing provenance provider |
| `GRAPH_MISSING_RATIONALE` | Missing provenance rationale |
| `GRAPH_MISSING_ASSESSMENT_REFERENCE` | Missing assessment reference |
| `GRAPH_MISSING_KNOWLEDGE_REFERENCE` | Missing knowledge graph reference |
| `GRAPH_MISSING_GRAPH_ID` | Missing graph ID |
| `GRAPH_MISSING_TITLE` | Missing graph title |
| `GRAPH_BROKEN_NODE_REFERENCE` | Broken node reference |
| `GRAPH_BROKEN_RELATIONSHIP_REFERENCE` | Broken relationship reference |
| `GRAPH_EMPTY_REGISTRY` | Empty or missing nodes array |
| `GRAPH_INVALID_TRACE` | Invalid trace determinism flags |
| `GRAPH_REGISTRY_INCONSISTENCY` | Metadata/node count mismatch |

## Traceability

Every `AssessmentConceptGraph` carries:

- `ConceptGraphTrace` with deterministic trace ID
- `ConceptGraphProvenance` with provider, source, review status
- Governance metadata for assessment coverage decisions

## Governance

All concept graph mappings carry governance metadata:

- `canonical` — Official, authoritative mapping
- `accepted` — Validated but not canonical
- `provisional` — Under review
- `deprecated` — Superseded
- `rejected` — Does not meet standards

## Cross-Agent Boundaries

The Assessment Agent must NEVER:

- Build knowledge graphs
- Infer prerequisite graphs
- Compute graph topology
- Modify Knowledge Agent registries
- Create curriculum graphs

It only stores references and assessment metadata.

## Deterministic Guarantees

Forbidden in all compose and validation functions:

- `Math.random`, `Date.now`, `performance.now`, `crypto.randomUUID`
- `Promise`, `async`, `await`, `fetch`
- Filesystem, network, timers, `process.env`

## Extension Points

D8-OPT-04 provides the concept graph mapping foundation. Later optimizations may extend:

- Graph-based scoring
- Competency assessment
- Prerequisite chain evaluation
- Architecture layer validation

## Public API

### Compose Functions

| Function | Description |
|----------|-------------|
| `composeConceptGraphProvenance()` | Compose immutable provenance |
| `composeConceptGraphTrace()` | Compose deterministic trace |
| `composeConceptNodeReference()` | Compose concept node reference |
| `composeConceptRelationship()` | Compose concept relationship |
| `composeAssessmentConceptCoverage()` | Compose assessment coverage |
| `composeGraphCoverageEntry()` | Compose graph coverage entry |
| `composeAssessmentConceptGraph()` | Compose governed graph mapping |
| `composeConceptGraphRegistry()` | Compose sorted immutable registry |
| `composeConceptGraphRegistryFromInput()` | Compose registry from input |
| `composeAssessmentConceptGraphs()` | Compose graphs into registry |
| `composeAssessmentArtifactWithConceptGraph()` | Enrich artifact with graph |

### Validation Functions

| Function | Returns |
|----------|---------|
| `validateConceptNodeReference()` | `readonly ConceptGraphValidationError[]` |
| `validateConceptRelationship()` | `readonly ConceptGraphValidationError[]` |
| `validateAssessmentConceptCoverage()` | `readonly ConceptGraphValidationError[]` |
| `validateAssessmentConceptGraph()` | `readonly ConceptGraphValidationError[]` |
| `validateConceptGraphRegistry()` | `ConceptGraphRegistryValidationResult` |
| `validateConceptGraphInput()` | `ConceptGraphInputValidationResult` |
| `validateConceptGraphTrace()` | `ConceptGraphTraceValidationResult` |
| `validateAssessmentArtifactWithConceptGraph()` | `AssessmentArtifactWithConceptGraphValidationResult` |

## Files Created

| File | Purpose |
|------|---------|
| `src/agents/assessment-pipeline/ConceptGraphKernel.ts` | Pure deterministic concept graph compose functions |
| `src/agents/assessment-pipeline/ConceptGraphValidation.ts` | Concept graph validation layer (never throws) |
| `src/agents/assessment-pipeline/ConceptGraphKernel.test.ts` | Exhaustive deterministic tests (~90) |
| `docs/architecture/nv-2000/d8-opt-04-concept-graph-assessment-mapping.md` | This document |

## Files Modified

| File | Changes |
|------|---------|
| `src/agents/assessment-pipeline/AssessmentAgentContract.ts` | Extended with 5 concept graph enums, 12 concept graph contracts, 6 validation types |
| `src/agents/assessment-pipeline/index.ts` | Extended with concept graph exports |

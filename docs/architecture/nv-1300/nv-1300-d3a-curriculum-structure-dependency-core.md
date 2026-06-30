# NV-1300-D3A — Curriculum Structure & Dependency Core

**Version:** 1.0
**Status:** READY
**Date:** 2026-06-26

---

## 1. Mission

Implement the first phase of the **Curriculum & Dependency Agent Evolution**.

This phase transforms the existing `curriculum-dependency-agent.js` from a large single-file agent into a modular structural authority for curriculum validation, while preserving existing behavior.

D3A focuses only on the **core structural layer**:

- Curriculum hierarchy validation
- Dependency graph validation
- Typed dependency support
- Concept-level prerequisite support
- Deterministic read-only reporting

---

## 2. Scope

### Implemented in D3A

- Curriculum Structure Guardian
- Dependency Graph Validator
- Typed Dependency Engine
- Concept Prerequisite Engine
- Core Curriculum Dependency Agent integration
- D3A validator
- D3A verify script
- D3A architecture documentation

### Deferred to Later Phases

- **D3B** — Goal-aware dependency interpretation + dependency justifications
- **D3C** — Prerequisite depth levels + redundancy detection
- **D3D** — Cognitive progression + competency coverage + goal unlock maps
- **D3X** — Extreme audit

---

## 3. Relationship to Curriculum & Dependency Agent vNext

D3A is the first phase of the NV-1300-D3 specification. It establishes the foundational structural layer upon which subsequent phases will build.

The vNext specification defines 13 modules. D3A implements 4 core modules:

| Module | D3A | vNext |
|--------|-----|-------|
| Curriculum Structure Guardian | Yes | Yes |
| Dependency Graph Validator | Yes | Yes |
| Typed Dependency Engine | Yes | Yes |
| Concept Prerequisite Engine | Yes | Yes |
| Goal-Aware Dependency Interpreter | No | D3B |
| Dependency Justification Engine | No | D3B |
| Prerequisite Depth Engine | No | D3C |
| Redundancy Detector | No | D3C |
| Cognitive Progression Validator | No | D3D |
| Competency Coverage Verifier | No | D3D |
| Goal Unlock Map Generator | No | D3D |
| Curriculum Dependency Report Composer | No | D3D |
| Unified Curriculum Dependency Agent | Partial | D3D |

---

## 4. Existing Agent Preservation

The existing `curriculum-dependency-agent.js` (NV-1000-A2) is preserved with minimal changes:

- All existing public APIs remain unchanged
- All 10 educational modes remain functional
- Intent detection remains unchanged
- Response building remains unchanged
- Agent registration behavior remains unchanged

New D3A capabilities are exposed via additional getters:

```javascript
getStructureGuardian()
getDependencyGraphValidator()
getTypedDependencyEngine()
getConceptPrerequisiteEngine()
validateCurriculumStructure()
validateDependencyGraph()
validateConceptPrerequisites()
getStructureSummary()
```

---

## 5. Files Created

| File | Purpose | Lines |
|------|---------|-------|
| `website/scripts/agents/curriculum-structure-guardian.js` | Hierarchy validation, orphan detection, reachability | ~200 |
| `website/scripts/agents/dependency-graph-validator.js` | Cycle detection, topological sort, graph validation | ~220 |
| `website/scripts/agents/typed-dependency-engine.js` | Typed dependency normalization, filtering, explanation | ~150 |
| `website/scripts/agents/concept-prerequisite-engine.js` | Concept prerequisite resolution, chain building | ~180 |
| `scripts/nv-1300-d3a-curriculum-core-validator.js` | Static validation (250+ checks) | ~350 |
| `scripts/nv-1300-d3a-curriculum-core-verify.js` | Behavioral verification (20+ checks) | ~350 |
| `docs/architecture/nv-1300/nv-1300-d3a-curriculum-structure-dependency-core.md` | This document | — |

---

## 6. Files Modified

| File | Changes |
|------|---------|
| `website/scripts/agents/curriculum-dependency-agent.js` | Added D3A module imports, initialization, getters, validation methods |

---

## 7. Runtime Modules

### 7.1 Curriculum Structure Guardian

**Factory:** `createCurriculumStructureGuardian()`

Validates curriculum hierarchy integrity:

- Learning path → module → lesson → artifact ownership
- Orphan detection (paths, modules, lessons, artifacts)
- Broken parent-child references
- Unreachable curriculum nodes
- Canonical ID presence
- Scope aggregation consistency

**Public API:**

```javascript
validateStructure(curriculum)
validateOwnership(curriculum)
getOrphans(curriculum)
getBrokenReferences(curriculum)
getReachabilityReport(curriculum)
summarizeStructure(curriculum)
getCapabilities()
```

### 7.2 Dependency Graph Validator

**Factory:** `createDependencyGraphValidator()`

Validates dependency graph structure:

- Graph shape validation
- Cycle detection (DFS-based)
- Self-dependency detection
- Duplicate edge detection
- Broken reference detection
- Dependency direction validation
- Stable topological ordering (Kahn's algorithm)

**Public API:**

```javascript
validateGraph(graph, options)
detectCycles(graph)
detectSelfDependencies(graph)
detectDuplicateEdges(graph)
detectBrokenReferences(graph, validIds)
validateDependencyDirection(graph)
topologicalSort(graph)
getCapabilities()
```

### 7.3 Typed Dependency Engine

**Factory:** `createTypedDependencyEngine()`

Manages typed dependency relationships:

- `required` — Necessary prerequisite
- `recommended` — Strongly useful prerequisite
- `optional_background` — Helpful context but not required
- `enrichment` — Extension or deepening material
- `co_requisite` — Should be studied alongside the target

**Public API:**

```javascript
getSupportedTypes()
normalizeDependencyType(type)
validateDependencyType(type)
classifyDependency(edge)
filterByType(edges, type)
explainType(type)
getCapabilities()
```

### 7.4 Concept Prerequisite Engine

**Factory:** `createConceptPrerequisiteEngine()`

Resolves concept-level prerequisites:

- Direct prerequisite resolution
- Transitive prerequisite chains
- Duplicate prerequisite detection
- Artifact/lesson to concept mapping
- Cycle detection in prerequisite graphs

**Public API:**

```javascript
getPrerequisitesForConcept(conceptId, conceptIndex)
getPrerequisitesForArtifact(artifactId, curriculumIndex, conceptIndex)
getPrerequisitesForLesson(lessonId, curriculumIndex, conceptIndex)
buildConceptChain(conceptId, conceptIndex)
validateConceptPrerequisites(concepts)
getCapabilities()
```

---

## 8. Data Contracts

### Curriculum Index

```javascript
{
  learningPaths: [{ id, title, moduleIds, lessonScope, artifactScope }],
  modules: [{ id, title, lessonIds }],
  lessons: [{ id, title, artifactIds }],
  artifacts: [{ id, title, type, conceptIds }]
}
```

### Dependency Edge

```javascript
{
  source | from,
  target | to,
  type | relationship,
  reason | rationale,
  depth
}
```

### Concept Entry

```javascript
{
  id,
  name,
  prerequisiteConcepts | prerequisites | dependsOn,
  relatedConcepts
}
```

---

## 9. Typed Dependency Model

| Type | Label | Description | Aliases |
|------|-------|-------------|---------|
| `required` | Required | Necessary prerequisite | prerequisite, must |
| `recommended` | Recommended | Strongly useful prerequisite | suggested, useful |
| `optional_background` | Optional Background | Helpful context but not required | background, optional |
| `enrichment` | Enrichment | Extension or deepening material | extension, deepening, supplementary |
| `co_requisite` | Co-requisite | Should be studied alongside the target | corequisite, parallel, alongside |

---

## 10. Concept Prerequisite Model

Prerequisites are resolved through:

1. **Direct prerequisites** — concepts explicitly listed as prerequisites
2. **Transitive prerequisites** — prerequisites of prerequisites
3. **Artifact mapping** — concepts associated with artifacts
4. **Lesson mapping** — concepts associated with lessons

Cycle detection ensures no circular dependencies exist.

---

## 11. Determinism Guarantees

All D3A modules are deterministic:

- No `Math.random()`
- No `Date.now()` for IDs or ordering
- No `performance.now()` for ordering
- No `crypto.randomUUID()`
- No nondeterministic sort
- No network calls
- No hidden mutable global state

Same input produces byte-identical output.

Validated via 1000 repeated executions in verify script.

---

## 12. Governance Guarantees

### Forbidden

- Curriculum mutation
- Concept mutation
- Shared knowledge mutation
- Lesson rewriting
- Explanation generation
- Mastery estimation
- Learner ranking
- Probabilistic personalization
- Simplified curriculum branches
- Unsupported dependency invention

### Allowed

- Read-only validation
- Read-only dependency reports
- Structural warnings
- Dependency explanations
- Goal-neutral prerequisite chains

---

## 13. Deferred D3B/D3C/D3D Scope

### D3B — Goal-Aware Dependency Interpretation

- Goal-aware dependency interpreter
- Dependency justification engine
- Goal unlock map generation
- Cross-domain connection discovery

### D3C — Prerequisite Depth + Redundancy

- Prerequisite depth engine
- Redundancy detector
- Intentional reinforcement validation

### D3D — Cognitive Progression + Coverage

- Cognitive progression validator
- Competency coverage verifier
- Goal unlock map generator
- Curriculum dependency report composer
- Unified curriculum dependency agent

---

## 14. Validation Results

### Static Validation

```bash
node scripts/nv-1300-d3a-curriculum-core-validator.js
```

**Target:** 250+ checks covering:

- Module existence and factory exposure
- Syntax validation
- Public API presence
- Forbidden runtime patterns
- Governance terms
- Typed dependency validation
- Dependency graph validation
- Concept prerequisite validation
- No mutation of input objects
- Deterministic output (1000 iterations)

### Behavioral Verification

```bash
node scripts/nv-1300-d3a-curriculum-core-verify.js
```

**Target:** 20+ behavioral checks covering:

- Valid hierarchy fixture
- Orphan module fixture
- Broken lesson reference fixture
- Dependency cycle fixture
- Self-dependency fixture
- Duplicate edge fixture
- Typed dependency alias fixture
- Concept prerequisite chain fixture
- Malformed input fixture
- 1000 repeated executions

---

## 15. Known Limitations

1. **Concept data scope:** Current 41 concepts limit prerequisite resolution. Expansion to 160 concepts (NV-1100-P4A target) will improve coverage.

2. **Dependency edge format:** Multiple edge formats are supported but normalization may vary.

3. **Integration depth:** D3A integration with existing agent is minimal; deeper integration deferred to D3D.

---

## 16. Architecture Closure

D3A establishes the foundational structural layer for the Curriculum & Dependency Agent Evolution. It provides:

- **Structural validation** — ensuring curriculum integrity
- **Graph validation** — detecting cycles, duplicates, broken references
- **Typed dependencies** — supporting multiple dependency relationships
- **Concept prerequisites** — resolving concept-level dependencies

All modules are:

- Read-only
- Deterministic
- Governance-compliant
- Safe on malformed input

The implementation preserves existing agent behavior while adding new structural validation capabilities.

---

## 17. Final Decision

```
NV-1300-D3A — Curriculum Structure & Dependency Core

Curriculum structure guardian implemented
Dependency graph validator implemented
Typed dependency engine implemented
Concept prerequisite engine implemented
Existing Curriculum Agent preserved
Read-only governance certified
Determinism certified
Regression-free

READY
```

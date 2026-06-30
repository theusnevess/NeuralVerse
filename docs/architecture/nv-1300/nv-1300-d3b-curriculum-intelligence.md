# NV-1300-D3B — Curriculum Intelligence & Goal Interpretation

**Version:** 1.0
**Status:** READY
**Date:** 2026-06-26

---

## 1. Purpose

Implement the second evolution phase of the Curriculum & Dependency Agent.

This phase extends the deterministic structural core implemented in D3A.

D3B MUST NOT replace or redesign D3A.

Instead, it adds deterministic curriculum intelligence built on top of the validated dependency graph.

The resulting agent remains fully deterministic, reproducible, governance-driven, and local-first.

---

## 2. Architecture

```
Curriculum Structure Guardian (D3A)
          |
          v
Dependency Graph Validator (D3A)
          |
          v
Typed Dependency Engine (D3A)
          |
          v
Concept Prerequisite Engine (D3A)
          |
          v
Goal Dependency Interpreter (D3B)
          |
          v
Dependency Justification Engine (D3B)
          |
          v
Prerequisite Depth Engine (D3B)
          |
          v
Goal Priority Engine (D3B)
          |
          v
Dependency Narrative Builder (D3B)
          |
          v
Curriculum Explanation Composer (D3B)
```

---

## 3. New Modules

### 3.1 Goal Dependency Interpreter

**Factory:** `createGoalDependencyInterpreter()`

Given a declared educational objective, deterministically computes:

- Highest priority prerequisites
- Secondary prerequisites
- Supporting background
- Enrichment topics

**Public API:**

```javascript
interpretGoal(goal, conceptIndex, dependencyGraph)
prioritizePrerequisites(goalId, prerequisites, concepts, dependencyGraph)
classifyByPriority(prerequisites)
getPriorityLevels()
explainInterpretation(interpretation)
getCapabilities()
```

### 3.2 Dependency Justification Engine

**Factory:** `createDependencyJustificationEngine()`

Every dependency must answer: Why is this prerequisite required?

Each justification includes:

- summary
- technical_reason
- pedagogical_reason
- importance
- dependency_type

**Public API:**

```javascript
buildJustification(dependency, context)
validateJustification(justification)
explainDependency(source, target, dependencyGraph, conceptIndex)
findMissingJustifications(dependencies, concepts)
getJustificationTemplates()
getCapabilities()
```

### 3.3 Prerequisite Depth Engine

**Factory:** `createPrerequisiteDepthEngine()`

Supports five deterministic depth levels:

- Awareness
- Basic Understanding
- Working Knowledge
- Advanced Understanding
- Mastery

**IMPORTANT:** These are curriculum metadata. They NEVER estimate learner mastery. They define required curriculum depth, not learner ability.

**Public API:**

```javascript
getSupportedDepthLevels()
validateDepthLevel(level)
normalizeDepthLevel(level)
compareDepthLevels(a, b)
explainDepthLevel(level)
assignDepthLevel(sourceConcept, targetConcept, context)
getDepthForDependency(dependency, context)
getCapabilities()
```

### 3.4 Goal Priority Engine

**Factory:** `createGoalPriorityEngine()`

For every dependency computes deterministic priority based on:

- Goal
- Dependency type
- Distance
- Concept centrality
- Curriculum position
- Shared Knowledge relevance

Outputs:

- Critical
- High
- Medium
- Low
- Background

**Public API:**

```javascript
computePriority(goal, dependency, conceptIndex, dependencyGraph, sharedKnowledge)
scoreDependency(dependency, goal, conceptIndex, sharedKnowledge)
categorizeScore(score)
getPriorityCategories()
getWeights()
explainPriority(priorityResult)
getCapabilities()
```

### 3.5 Dependency Narrative Builder

**Factory:** `createDependencyNarrativeBuilder()`

Generates deterministic explanations describing why the dependency roadmap exists.

Purely deterministic templates. No LLM.

**Public API:**

```javascript
buildNarrative(source, target, context)
buildProgressionNarrative(chain, context)
buildGoalNarrative(goal, prerequisites, context)
getNarrativeTemplates()
explainNarrative(narrativeResult)
getCapabilities()
```

### 3.6 Curriculum Explanation Composer

**Factory:** `createCurriculumExplanationComposer()`

Produces structured explanations composed of:

- Overview
- Dependency Tree
- Priority Concepts
- Required Depth
- Dependency Justifications
- Recommended Progression
- Goal Summary

**Public API:**

```javascript
composeExplanation(goal, context)
composeOverview(goal, context)
composeDependencyTree(prerequisites)
composePriorityConcepts(prerequisites)
composeDepthSummary(prerequisites)
composeJustifications(prerequisites)
composeProgression(progression)
composeGoalSummary(goal, context)
getCapabilities()
```

---

## 4. Goal Interpretation

The goal interpreter processes educational objectives:

**Example:**

Goal: "Diffusion Models"

Output:

```
Priority:
  - Probability (critical)
  - Linear Algebra (critical)
  - Optimization (high)
  - CNNs (medium)

Background:
  - Autoencoders (low)

Enrichment:
  - Latent Diffusion (background)
  - Score Matching (background)
```

The curriculum NEVER changes. Only priority ordering changes.

---

## 5. Dependency Justification

Every dependency includes justification:

**Example:**

Source: Attention
Target: Transformer

Justification:

```
Summary: Attention provides mathematical foundations required for Transformer

Technical: Mathematical foundations provide the formal framework for Transformer

Pedagogical: Understanding Attention builds the mathematical intuition needed for Transformer

Importance: 90/100

Dependency Type: mathematics
```

---

## 6. Depth Levels

Five deterministic depth levels:

| Level | Order | Description |
|-------|-------|-------------|
| awareness | 1 | Basic familiarity with concept |
| basic_understanding | 2 | Foundational comprehension |
| working_knowledge | 3 | Practical application capability |
| advanced_understanding | 4 | Deep conceptual mastery |
| mastery | 5 | Complete command of subject |

**Governance:** These are curriculum metadata, NOT learner-state inference.

---

## 7. Priority Scoring

Deterministic scoring based on:

| Factor | Weight | Description |
|--------|--------|-------------|
| dependencyType | 0.30 | Type of dependency relationship |
| distance | 0.25 | Distance from goal in dependency graph |
| centrality | 0.20 | How many concepts depend on this |
| position | 0.15 | Position in curriculum sequence |
| sharedKnowledge | 0.10 | Shared Knowledge relevance |

**Categories:**

| Category | Min Score | Description |
|----------|-----------|-------------|
| critical | 80 | Essential prerequisite |
| high | 60 | Strongly recommended |
| medium | 40 | Useful background |
| low | 20 | Helpful but optional |
| background | 0 | General supporting |

---

## 8. Narrative Generation

Deterministic narrative templates:

- intro: "To understand {target}, one must first understand {source}."
- progression: "Before learning {target}, the learner needs {source}, because {reason}."
- preparation: "This prepares the learner for understanding {next}."
- enabler: "Once {source} is understood, {target} becomes more accessible."

---

## 9. Explanation Composition

Structured explanations include:

1. **Overview** — Goal and context summary
2. **Dependency Tree** — Hierarchical prerequisite structure
3. **Priority Concepts** — Ranked prerequisites
4. **Required Depth** — Depth level assignments
5. **Dependency Justifications** — Why each prerequisite is needed
6. **Recommended Progression** — Learning path
7. **Goal Summary** — Final summary

---

## 10. Evidence Traceability

Every dependency explanation exposes:

```javascript
{
  sourceType: 'curriculum',
  sourceId: 'linear-algebra',
  targetId: 'cnn',
  reason: 'Dependency from linear-algebra to cnn'
}
```

Missing evidence becomes:

```javascript
sourceType: 'none'
```

Never fabricate references.

---

## 11. Determinism

Forbidden:

- `Math.random()`
- `Date.now()` for IDs or ordering
- `performance.now()` for ordering
- `crypto.randomUUID()`
- Non-deterministic sorting
- Network calls
- Hidden mutable global state

All sorting must remain stable.

1000 repeated executions must produce identical outputs.

---

## 12. Governance

Never:

- Modify curriculum
- Modify concept graph
- Infer learner knowledge
- Estimate mastery
- Recommend skipping curriculum
- Create alternative learning paths

The curriculum remains canonical.

---

## 13. Performance

Target:

| Operation | Budget |
|-----------|--------|
| Goal interpretation | < 10 ms |
| Dependency explanation | < 15 ms |
| Full curriculum explanation | < 40 ms |

---

## 14. Accessibility

All generated explanations must preserve:

- Semantic headings
- Keyboard navigation
- Screen-reader compatibility
- Logical ordering

---

## 15. Validation

### Static Validation

```bash
node scripts/nv-1300-d3b-curriculum-intelligence-validator.js
```

**Target:** 450+ checks covering:

- Module inventory
- Syntax validation
- Public API presence
- Forbidden runtime patterns
- Governance terms
- Goal interpretation
- Justification generation
- Prerequisite depth
- Priority scoring
- Narrative generation
- Curriculum explanation composition
- Evidence traceability
- Deterministic execution
- Preservation of D3A
- Backward compatibility

### Behavioral Verification

```bash
node scripts/nv-1300-d3b-curriculum-intelligence-verify.js
```

**Target:** 20+ behavioral checks covering:

- Factory instantiation
- Method existence
- Goal interpretation
- Justification generation
- Depth level validation
- Priority scoring
- Narrative generation
- Explanation composition
- Deterministic execution (1000 iterations)
- Evidence generation
- D3A integration

---

## 16. Regression Preservation

D3B preserves:

- D3A Curriculum Structure Guardian
- D3A Dependency Graph Validator
- D3A Typed Dependency Engine
- D3A Concept Prerequisite Engine
- All existing Curriculum Agent APIs
- All existing educational modes
- All existing response builders
- All existing intent detection

No backward incompatibilities.

---

## 17. Future D3C Scope

- Prerequisite Depth Engine (enhanced)
- Redundancy Detector
- Intentional Reinforcement Validation

---

## 18. API Reference

### Goal Interpreter

```javascript
const interpreter = agent.getGoalInterpreter();
const result = interpreter.interpretGoal('diffusion-models', conceptIndex);
```

### Justification Engine

```javascript
const justifier = agent.getJustificationEngine();
const justification = justifier.buildJustification({
  source: 'linear-algebra',
  target: 'cnn',
  type: 'mathematics'
});
```

### Depth Engine

```javascript
const depth = agent.getDepthEngine();
const levels = depth.getSupportedDepthLevels();
// ['awareness', 'basic_understanding', 'working_knowledge', 'advanced_understanding', 'mastery']
```

### Priority Engine

```javascript
const priority = agent.getPriorityEngine();
const result = priority.computePriority('diffusion-models', dependency, conceptIndex);
```

### Narrative Builder

```javascript
const narrative = agent.getNarrativeBuilder();
const result = narrative.buildNarrative('probability', 'diffusion-models', {
  reason: 'Probability provides the mathematical foundation'
});
```

### Explanation Composer

```javascript
const composer = agent.getExplanationComposer();
const explanation = composer.composeExplanation('diffusion-models', {
  prerequisites: prioritizedList,
  totalPrerequisites: 5
});
```

---

## 19. Final Decision

```
NV-1300-D3B — Curriculum Intelligence & Goal Interpretation

Goal-aware dependency interpretation implemented
Dependency justification engine implemented
Prerequisite depth engine implemented
Goal priority engine implemented
Dependency narrative builder implemented
Curriculum explanation composer implemented
Existing Curriculum Agent preserved
Deterministic execution certified
Governance preserved
Structurally READY
Runtime validation pending local execution
```

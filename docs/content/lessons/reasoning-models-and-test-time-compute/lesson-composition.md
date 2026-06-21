---
lesson_id: "lesson-reasoning-models-and-test-time-compute"
lesson_title: "Reasoning Models and Test-Time Compute"
canonical_status: "Reviewed"
topic: "Reasoning Models and Test-Time Compute"
artifact_ids:
  - artifact-reasoning-models-and-test-time-compute-explanatory-text
  - artifact-reasoning-models-and-test-time-compute-visual-intuition
  - artifact-reasoning-models-and-test-time-compute-interactive-visualization
  - artifact-reasoning-models-and-test-time-compute-exercise
  - artifact-reasoning-models-and-test-time-compute-comparison-table
---

# Reasoning Models and Test-Time Compute — Lesson Composition

## 1. Purpose

This lesson orchestrates reusable Learning Artifacts into a coherent learning experience about Reasoning Models and Test-Time Compute.

The lesson is not a monolithic instructional document. It references independent artifacts, assigns each artifact a pedagogical role, and defines a recommended learning flow.

## 2. Learning Goal

After completing this lesson flow, the learner should understand the core concepts of Reasoning Models and Test-Time Compute and be able to reason about their practical use in AI systems that require multi-step reasoning and dynamic compute allocation.

## 3. Covered Concepts

*   Chain-of-thought reasoning, self-consistency, and tree-of-thoughts;
*   Test-time compute scaling and the inference-time compute paradigm;
*   Process reward models vs. outcome reward models;
*   Search-based reasoning (MCTS, beam search over reasoning paths);
*   Deliberation architectures and planning with backtracking;
*   Compute-optimal reasoning trade-offs;
*   Limitations of current reasoning models (brittleness, overthinking, reward hacking).

## 4. Artifact Composition

### 4.1 Explanatory Text

Artifact: `artifact-reasoning-models-and-test-time-compute-explanatory-text`
Role: Introduces the core vocabulary, defining terminology and parameters.

### 4.2 Visual Intuition

Artifact: `artifact-reasoning-models-and-test-time-compute-visual-intuition`
Role: Provides a spatial analogy based on detective investigation to build a strong mental model.

### 4.3 Interactive Visualization

Artifact: `artifact-reasoning-models-and-test-time-compute-interactive-visualization`
Role: Outlines an interactive spec for a Reasoning Path Explorer where strategies and compute budgets can be adjusted.

### 4.4 Exercise

Artifact: `artifact-reasoning-models-and-test-time-compute-exercise`
Role: Practice designing reasoning strategies for diverse problem contexts to apply the knowledge.

### 4.5 Comparison Table

Artifact: `artifact-reasoning-models-and-test-time-compute-comparison-table`
Role: Consolidates the lesson with a structural comparative reference of reasoning techniques and reward models.

## 5. Composition Rationale

### 5.1 Recommended Learning Flow Map

```text
Recommended Learning Flow

Explanatory Text
        ↓
Visual Intuition
        ↓
Interactive Visualization
        ↓
Exercise
        ↓
Comparison Table
```

### 5.2 Rationale Details

The sequence begins with explanation to establish vocabulary and technical depth. Visual intuition follows to create a mental model via the detective analogy. The interactive specification provides exploration space for experimenting with different reasoning strategies and compute budgets, preparing the learner for the exercise. The comparison table consolidates differences as a reference for future use.

## 6. Dependency Notes

This lesson follows the dependency recommendations encoded in the referenced artifacts:
* explanatory text first;
* visual intuition second;
* interactive visualization third;
* exercise fourth;
* comparison table for consolidation.

## 7. Reuse Notes

All referenced Learning Artifacts remain independently reusable.
Participation in this lesson does not alter the lifecycle, metadata, reuse semantics, or governance status of any referenced artifact.
Lesson compositions are not required to include every artifact. Artifacts may classify and regress independently in different instructional contexts.

## Evidence Boundary

This Lesson orchestrates Learning Artifacts.
It does not generate Competency Evidence.
It does not certify mastery.
Assessments remain governed by NV-800-M4.
Competency Evidence remains governed by NV-800-M3.

## 9. Architectural Alignment

Learning Paths organize Modules.
Modules organize Lessons.
Lessons orchestrate Learning Artifacts.
Learning Artifacts support learning.
Assessments produce Competency Evidence.
Competencies remain the canonical unit of mastery.

## 10. Quality Checklist

- [ ] Artifact references validated.
- [ ] Composition order reviewed.
- [ ] No duplicated instructional content.
- [ ] Evidence boundary preserved.
- [ ] No assessment logic introduced.
- [ ] No mastery claims introduced.
- [ ] Reuse opportunities documented.
- [ ] Dependency recommendations respected.

## 11. Architectural Foundations

*   NV-800-M5 — Canonical Lesson Architecture
*   NV-800-M6 — Canonical Module & Learning Path Architecture
*   NV-800-M7 — Canonical Learning Artifact Architecture
*   NV-800-C1 — Seed Learning Artifacts
*   NV-800-C2 — First Canonical Lesson Composition
*   NV-800-C3 — First Canonical Module Composition
*   NV-800-C4 — Learning Artifact Taxonomy & Contract Fields
*   NV-800-C5 — Artifact Registry & Metadata Governance
*   NV-800-C6 — Canonical Learning Path Composition
*   NV-800-C7 — Module & Lesson Naming Conventions
*   NV-800-C8 — First Canonical Learning Assessment
*   NV-800-C9 — Assessment Registry & Governance
*   NV-800-C10 — Competency Evidence Architecture
*   NV-800-C11 — Competency Registry & Metadata
*   NV-800-C12 — Vector Embedding Content Registration
*   NV-800-C13 — Evidence Attestation & Verification
*   NV-800-C14 — Evaluation Event Architecture
*   NV-800-C15 — Assessment Session Orchestration
*   NV-800-C16 — Scoring & Performance Record Architecture
*   NV-800-C17 — Learning Path Progression Logic
*   NV-800-C18 — Module Composition & Referential Integrity
*   NV-800-C19 — Learning Artifact Revision & Versioning
*   NV-800-C20 — Artifact Dependency Resolution
*   NV-800-C21 — Rubric & Scoring Guide Architecture
*   NV-800-C22 — Learning Artifact Evidence Traceability
*   NV-800-C23 — AI Safety, Alignment & Guardrails
*   NV-800-C24 — Canonical Foundation Content Pack (Wave 19: Production AI Systems & MLOps)
*   NV-800-C25 — Canonical Foundation Content Pack (Wave 20: AI Research & Frontier Topics)

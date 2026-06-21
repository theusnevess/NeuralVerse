---
lesson_id: "lesson-prompt-injection"
lesson_title: "Prompt Injection"
canonical_status: "Draft"
topic: "Prompt Injection"
artifact_ids:
  - artifact-prompt-injection-explanatory-text
  - artifact-prompt-injection-visual-intuition
  - artifact-prompt-injection-interactive-visualization
  - artifact-prompt-injection-exercise
  - artifact-prompt-injection-comparison-table
---

# Prompt Injection — Lesson Composition

## 1. Purpose

This lesson orchestrates reusable Learning Artifacts into a coherent learning experience about Prompt Injection.

The lesson is not a monolithic instructional document. It references independent artifacts, assigns each artifact a pedagogical role, and defines a recommended learning flow.

## 2. Learning Goal

After completing this lesson flow, the learner should understand the core concepts of Prompt Injection and be able to reason about their practical use in AI safety, instruction boundary enforcement, and secure LLM application design.

## 3. Covered Concepts

*   Direct injection — user input overriding system instructions;
*   Indirect injection — adversarial content in retrieved context, web pages, or tool outputs;
*   Instruction boundary defenses — delimitation, sanitization, privilege separation;
*   Context isolation — maintaining separate channels for system instructions, user input, and retrieved data.

## 4. Artifact Composition

### 4.1 Explanatory Text

Artifact: `artifact-prompt-injection-explanatory-text`
Role: Introduces the core vocabulary, defining direct injection, indirect injection, attack vectors, and defense strategies.

### 4.2 Visual Intuition

Artifact: `artifact-prompt-injection-visual-intuition`
Role: Provides a security-guard analogy to build a strong mental model of access control boundaries.

### 4.3 Interactive Visualization

Artifact: `artifact-prompt-injection-interactive-visualization`
Role: Outlines an interactive injection simulator spec where users manipulate input regions and defense layers.

### 4.4 Exercise

Artifact: `artifact-prompt-injection-exercise`
Role: Practice identifying injection vectors across real-world application scenarios.

### 4.5 Comparison Table

Artifact: `artifact-prompt-injection-comparison-table`
Role: Consolidates the lesson with a structural comparative reference of direct vs. indirect injection.

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

The sequence begins with explanation to establish vocabulary and distinguish direct from indirect injection. Visual intuition follows to create a spatial mental model of access control boundaries. The interactive simulator specification provides exploration space where learners can probe defense layers. The exercise requires learners to apply their knowledge by identifying injection vectors. The comparison table consolidates key differences as a reference.

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

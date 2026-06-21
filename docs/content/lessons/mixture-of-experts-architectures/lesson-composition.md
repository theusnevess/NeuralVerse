---
lesson_id: "lesson-mixture-of-experts-architectures"
lesson_title: "Mixture of Experts (MoE) Architectures"
canonical_status: "Draft"
topic: "Mixture of Experts (MoE) Architectures"
artifact_ids:
  - artifact-mixture-of-experts-architectures-explanatory-text
  - artifact-mixture-of-experts-architectures-visual-intuition
  - artifact-mixture-of-experts-architectures-interactive-visualization
  - artifact-mixture-of-experts-architectures-exercise
  - artifact-mixture-of-experts-architectures-comparison-table---

# Mixture of Experts (MoE) Architectures — Lesson Composition

## 1. Purpose

This lesson orchestrates reusable Learning Artifacts into a coherent learning experience about MoE architectures.

The lesson is not a monolithic instructional document. It references independent artifacts, assigns each artifact a pedagogical role, and defines a recommended learning flow.

## 2. Learning Goal

After completing this lesson flow, the learner should understand how MoE architectures decouple parameter count from compute, how routing mechanisms govern expert selection, how load balancing maintains training stability, and how different MoE variants trade off quality, efficiency, and memory.

## 3. Covered Concepts

*   MoE fundamentals: sparse vs. dense models, expert specialization, routing mechanisms;
*   Top-k routing, noisy top-k, token choice vs. expert choice;
*   Load balancing: auxiliary losses, expert capacity, capacity factor;
*   Computational efficiency: activation sparsity, FLOPs reduction vs. model quality;
*   Training dynamics: expert collapse, routing collapse, gradient noise;
*   Inference considerations: memory overhead, expert parallelism, expert caching;
*   Architectural variants: Switch Transformer, Expert Choice, Soft MoE, XMoE;
*   Scaling benefits and limitations.

## 4. Artifact Composition

### 4.1 Explanatory Text

Artifact: `artifact-mixture-of-experts-architectures-explanatory-text`
Role: Introduces the core vocabulary, defining routing mechanisms, load balancing, training dynamics, and architectural variants.

### 4.2 Visual Intuition

Artifact: `artifact-mixture-of-experts-architectures-visual-intuition`
Role: Provides the "Hospital Specialist System" analogy to build a strong mental model for MoE routing, load balancing, and failure modes.

### 4.3 Interactive Visualization

Artifact: `artifact-mixture-of-experts-architectures-interactive-visualization`
Role: Outlines an interactive spec where learners configure expert count, top-k, capacity factor, and auxiliary loss to observe routing patterns, load balance, and efficiency trade-offs.

### 4.4 Exercise

Artifact: `artifact-mixture-of-experts-architectures-exercise`
Role: Practice reasoning about MoE configuration trade-offs across quality, efficiency, and memory-constrained deployment scenarios.

### 4.5 Comparison Table

Artifact: `artifact-mixture-of-experts-architectures-comparison-table`
Role: Consolidates the lesson with a structured comparison of Dense Transformer, Switch-style MoE, Expert Choice, and Soft MoE across architectural and practical dimensions.

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

The sequence begins with the explanatory text to establish vocabulary and technical depth. The visual intuition follows to anchor abstract concepts in a concrete mental model (the hospital analogy). The interactive visualization provides hands-on exploration of routing dynamics and trade-offs, preparing the learner for the exercise where they must reason about real-world configurations. The comparison table consolidates all variants as a reference artifact.

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

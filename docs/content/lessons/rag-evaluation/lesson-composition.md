---
lesson_id: "lesson-rag-evaluation"
lesson_title: "RAG Evaluation Frameworks"
canonical_status: "Draft"
topic: "RAG Evaluation Frameworks"
artifact_ids:
  - artifact-rag-evaluation-explanatory-text
  - artifact-rag-evaluation-visual-intuition
  - artifact-rag-evaluation-interactive-visualization
  - artifact-rag-evaluation-exercise
  - artifact-rag-evaluation-comparison-table
---

# RAG Evaluation Frameworks — Lesson Composition

## 1. Purpose

This lesson orchestrates reusable Learning Artifacts into a coherent learning experience about RAG Evaluation Frameworks.

The lesson is not a monolithic instructional document. It references independent artifacts, assigns each artifact a pedagogical role, and defines a recommended learning flow.

## 2. Learning Goal

After completing this lesson flow, the learner should understand the core dimensions of RAG evaluation (faithfulness, context precision, context recall, answer relevance) and be able to diagnose quality issues in RAG pipelines.

## 3. Covered Concepts

*   High-level foundations of RAG evaluation frameworks;
*   The four RAGAS-inspired evaluation dimensions and their trade-offs;
*   Visual and spatial models representing retrieval and generation quality breakdowns.

## 4. Artifact Composition

### 4.1 Explanatory Text

Artifact: `artifact-rag-evaluation-explanatory-text`
Role: Introduces the core vocabulary, defining the four RAG evaluation dimensions and their components.

### 4.2 Visual Intuition

Artifact: `artifact-rag-evaluation-visual-intuition`
Role: Provides the fact-checker and librarian analogy to build a strong mental model.

### 4.3 Interactive Visualization

Artifact: `artifact-rag-evaluation-interactive-visualization`
Role: Outlines an interactive dashboard spec where variables can be adjusted and quality scores observed.

### 4.4 Exercise

Artifact: `artifact-rag-evaluation-exercise`
Role: Practice diagnosing RAG pipeline failures by identifying failing dimensions and proposing fixes.

### 4.5 Comparison Table

Artifact: `artifact-rag-evaluation-comparison-table`
Role: Consolidates the lesson with a structural comparative reference of all four dimensions.

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

The sequence begins with explanation to establish the four evaluation dimensions and their vocabulary. Visual intuition follows to create an accessible mental model (fact-checker and librarian). The interactive dashboard specification provides a concrete exploration space, preparing the learner for the exercise where they diagnose real failure examples. The comparison table consolidates all four dimensions as a quick-reference summary.

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

## 8. Evidence Boundary

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

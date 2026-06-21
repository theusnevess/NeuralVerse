---
lesson_id: "lesson-hallucination-evaluation"
lesson_title: "Hallucination Detection and Analysis"
canonical_status: "Draft"
topic: "Hallucination Detection and Analysis"
artifact_ids:
  - artifact-hallucination-evaluation-explanatory-text
  - artifact-hallucination-evaluation-visual-intuition
  - artifact-hallucination-evaluation-interactive-visualization
  - artifact-hallucination-evaluation-exercise
  - artifact-hallucination-evaluation-comparison-table
---

# Hallucination Detection and Analysis — Lesson Composition

## 1. Purpose

This lesson orchestrates reusable Learning Artifacts into a coherent learning experience about Hallucination Detection and Analysis.

The lesson is not a monolithic instructional document. It references independent artifacts, assigns each artifact a pedagogical role, and defines a recommended learning flow.

## 2. Learning Goal

After completing this lesson flow, the learner should understand the core concepts of hallucination detection and analysis and be able to reason about identifying, classifying, and mitigating hallucinations in LLM-generated content.

## 3. Covered Concepts

*   High-level foundations of hallucination types and detection;
*   Practical trade-offs and evaluation relevance;
*   Visual and spatial models representing hallucination classification relationships.

## 4. Artifact Composition

### 4.1 Explanatory Text

Artifact: `artifact-hallucination-evaluation-explanatory-text`
Role: Introduces the core vocabulary, defining terminology and parameters for intrinsic and extrinsic hallucination.

### 4.2 Visual Intuition

Artifact: `artifact-hallucination-evaluation-visual-intuition`
Role: Provides a detective-witness analogy to build a strong mental model of grounded, contradictory, and unsupported claims.

### 4.3 Interactive Visualization

Artifact: `artifact-hallucination-evaluation-interactive-visualization`
Role: Outlines an interactive spec where generated statements can be classified segment-by-segment against reference context.

### 4.4 Exercise

Artifact: `artifact-hallucination-evaluation-exercise`
Role: Practice classifying LLM outputs as faithful, intrinsic hallucination, or extrinsic hallucination using paired source documents.

### 4.5 Comparison Table

Artifact: `artifact-hallucination-evaluation-comparison-table`
Role: Consolidates the lesson with a structural comparative reference across hallucination types and faithful output.

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

The sequence begins with explanation to establish vocabulary for hallucination types and detection approaches. Visual intuition follows to create a mental model via the detective-witness analogy. The interactive specification provides exploration space for segment-level classification, preparing the learner for the exercise. The comparison table consolidates differences as a reference.

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

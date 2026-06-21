---
lesson_id: "lesson-data-drift-and-concept-drift"
lesson_title: "Data Drift and Concept Drift"
canonical_status: "Reviewed"
topic: "Data Drift and Concept Drift"
artifact_ids:
  - artifact-data-drift-and-concept-drift-explanatory-text
  - artifact-data-drift-and-concept-drift-visual-intuition
  - artifact-data-drift-and-concept-drift-interactive-visualization
  - artifact-data-drift-and-concept-drift-exercise
  - artifact-data-drift-and-concept-drift-comparison-table---

# Data Drift and Concept Drift — Lesson Composition

## 1. Purpose

This lesson orchestrates reusable Learning Artifacts into a coherent learning experience about Data Drift and Concept Drift.

The lesson is not a monolithic instructional document. It references independent artifacts, assigns each artifact a pedagogical role, and defines a recommended learning flow.

## 2. Learning Goal

After completing this lesson flow, the learner should understand the core concepts of Data Drift and Concept Drift, recognize drift detection methods, and be able to design retraining triggers for production ML systems.

## 3. Covered Concepts

*   Foundational definitions of data drift (covariate shift, prior probability shift) and concept drift (sudden, gradual, recurring, incremental);
*   Drift detection methods: MMD, PSI, KS test, chi-square, SPC;
*   Retraining triggers (time-based, performance-based, drift-based) and monitoring infrastructure;
*   Drift visualization and feature store alignment considerations.

## 4. Artifact Composition

### 4.1 Explanatory Text

Artifact: `artifact-data-drift-and-concept-drift-explanatory-text`
Role: Introduces the core vocabulary, defining terminology and parameters for all drift types and detection methods.

### 4.2 Visual Intuition

Artifact: `artifact-data-drift-and-concept-drift-visual-intuition`
Role: Provides a river delta analogy to build a strong mental model of data drift, concept drift, detection, and retraining.

### 4.3 Interactive Visualization

Artifact: `artifact-data-drift-and-concept-drift-interactive-visualization`
Role: Outlines an interactive drift detection simulator spec where drift types and detection methods can be configured and observed.

### 4.4 Exercise

Artifact: `artifact-data-drift-and-concept-drift-exercise`
Role: Practice diagnosing drift types and selecting detection methods and retraining triggers across three production scenarios.

### 4.5 Comparison Table

Artifact: `artifact-data-drift-and-concept-drift-comparison-table`
Role: Consolidates the lesson with a structural reference contrasting drift types and detection methods.

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

The sequence begins with explanation to establish vocabulary for drift types and detection methods. Visual intuition follows to create a memorable mental model via the river delta analogy. The interactive specification provides exploration space for configuring and observing drift detection behavior, preparing the learner for the exercise. The comparison table consolidates all distinctions as a reference.

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
*   NV-800-C24 — Canonical Foundation Content Pack (Wave 19: Production AI Systems & MLOps)

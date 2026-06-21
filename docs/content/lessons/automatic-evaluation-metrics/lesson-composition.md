---
lesson_id: "lesson-automatic-evaluation-metrics"
lesson_title: "Automatic Evaluation Metrics"
canonical_status: "Draft"
topic: "Automatic Evaluation Metrics"
artifact_ids:
  - artifact-automatic-evaluation-metrics-explanatory-text
  - artifact-automatic-evaluation-metrics-visual-intuition
  - artifact-automatic-evaluation-metrics-interactive-visualization
  - artifact-automatic-evaluation-metrics-exercise
  - artifact-automatic-evaluation-metrics-comparison-table
---

# Automatic Evaluation Metrics — Lesson Composition

## 1. Purpose

This lesson orchestrates reusable Learning Artifacts into a coherent learning experience about Automatic Evaluation Metrics.

The lesson is not a monolithic instructional document. It references independent artifacts, assigns each artifact a pedagogical role, and defines a recommended learning flow.

## 2. Learning Goal

After completing this lesson flow, the learner should understand core automatic evaluation metrics and their trade-offs.

## 3. Covered Concepts

*   BLEU, ROUGE, METEOR, and BERTScore metrics;
*   Precision vs. recall vs. semantic approaches to evaluation;
*   Practical trade-offs and appropriate use cases for each metric.

## 4. Artifact Composition

### 4.1 Explanatory Text

Artifact: `artifact-automatic-evaluation-metrics-explanatory-text`
Role: Introduces the core metrics, defining terminology and how each metric works.

### 4.2 Visual Intuition

Artifact: `artifact-automatic-evaluation-metrics-visual-intuition`
Role: Provides an analogy comparing grading rubrics to build a strong mental model.

### 4.3 Interactive Visualization

Artifact: `artifact-automatic-evaluation-metrics-interactive-visualization`
Role: Outlines an interactive spec where variables can be adjusted to observe metric behavior.

### 4.4 Exercise

Artifact: `artifact-automatic-evaluation-metrics-exercise`
Role: Practice selecting the appropriate metric for different evaluation scenarios.

### 4.5 Comparison Table

Artifact: `artifact-automatic-evaluation-metrics-comparison-table`
Role: Consolidates the lesson with a structural comparative reference.

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

The sequence begins with explanation to establish vocabulary. Visual intuition follows to create an analogical mental model. The interactive specification provides exploration space, preparing the learner for the exercise. The comparison table consolidates differences as a reference.

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

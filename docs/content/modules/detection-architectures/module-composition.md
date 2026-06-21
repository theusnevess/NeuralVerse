---
module_id: "module-detection-architectures"
module_title: "Detection Architectures"
canonical_status: "Draft"
module_type: "Core Module"

lesson_ids:
  - lesson-anchor-based-vs-free
  - lesson-non-maximum-suppression
  - lesson-one-stage-vs-two-stage

artifact_scope:
  - artifact-anchor-based-vs-free-explanatory-text
  - artifact-anchor-based-vs-free-visual-intuition
  - artifact-anchor-based-vs-free-interactive-visualization
  - artifact-anchor-based-vs-free-exercise
  - artifact-anchor-based-vs-free-comparison-table
  - artifact-non-maximum-suppression-explanatory-text
  - artifact-non-maximum-suppression-visual-intuition
  - artifact-non-maximum-suppression-interactive-visualization
  - artifact-non-maximum-suppression-exercise
  - artifact-non-maximum-suppression-comparison-table
  - artifact-one-stage-vs-two-stage-explanatory-text
  - artifact-one-stage-vs-two-stage-visual-intuition
  - artifact-one-stage-vs-two-stage-interactive-visualization
  - artifact-one-stage-vs-two-stage-exercise
  - artifact-one-stage-vs-two-stage-comparison-table
---

# Detection Architectures — Module Composition

## 1. Purpose

This module organizes lessons related to anchor priors, box selection heuristics, and multi-stage extraction workflows.

It provides an organizational boundary for keypoint regressions, confidence score sortings, and proposal networks without duplicating any instructional content.

## 2. Module Learning Aim

Introduce learners to the architectural paradigms of object detection, including anchor-based templates vs. anchor-free center coordinate regressions, Non-Maximum Suppression overlap suppressions, and one-stage vs. two-stage candidate proposal pipelines.

This module aims to connect shapes to anchors, overlapping duplicates to peak scores, and proposal latency to single pass speeds, without claiming or certifying competency mastery.

## 3. Included Lessons

### 3.1 Anchor-Based vs Anchor-Free Detection

*   **Lesson ID:** `lesson-anchor-based-vs-free`
*   **Location:** `docs/content/lessons/anchor-based-vs-free/lesson-composition.md`
*   **Pedagogical Role:** Teaches prior boxes, anchor aspect ratios, direct center regression, and keypoint detectors.
*   **Relationship to Module Aim:** Fulfills the anchor paradigm selection requirement of the learning aim.

### 3.2 Non-Maximum Suppression (NMS)

*   **Lesson ID:** `lesson-non-maximum-suppression`
*   **Location:** `docs/content/lessons/non-maximum-suppression/lesson-composition.md`
*   **Pedagogical Role:** Focuses on sorting confidences, calculating overlap suppressions, and deduplicating detection lists.
*   **Relationship to Learning Path Aim:** Fulfills the NMS deduplication requirement of the learning aim.

### 3.3 One-Stage vs Two-Stage Detectors

*   **Lesson ID:** `lesson-one-stage-vs-two-stage`
*   **Location:** `docs/content/lessons/one-stage-vs-two-stage/lesson-composition.md`
*   **Pedagogical Role:** Compares RPN region proposals, ROI alignments, singleforward grid steps, and latency differences.
*   **Relationship to Learning Path Aim:** Fulfills the pipeline stages and speed tradeoffs requirement of the learning aim.

This module composition does not duplicate any of the instructional content or text from the lesson compositions themselves.

## 4. Module Composition Flow

The module structures lessons in the following sequence:

1.  **Anchor-Based vs Anchor-Free Detection** (`lesson-anchor-based-vs-free`)
2.  **Non-Maximum Suppression (NMS)** (`lesson-non-maximum-suppression`)
3.  **One-Stage vs Two-Stage Detectors** (`lesson-one-stage-vs-two-stage`)

### Future Expansion

Future lessons may extend this module with topics such as transformer-based detection heads (DETR, RT-DETR), Feature Pyramid Networks (FPN), or Soft-NMS algorithms.

*Note: These future lessons are not created or defined in this phase.*

## 5. Lesson-to-Artifact Trace

The module indirectly includes the following Learning Artifacts through its lessons:

*   `artifact-anchor-based-vs-free-explanatory-text` (Explanatory Text)
*   `artifact-anchor-based-vs-free-visual-intuition` (Visual Intuition)
*   `artifact-anchor-based-vs-free-interactive-visualization` (Interactive Visualization)
*   `artifact-anchor-based-vs-free-exercise` (Exercise)
*   `artifact-anchor-based-vs-free-comparison-table` (Comparison Table)
*   `artifact-non-maximum-suppression-explanatory-text` (Explanatory Text)
*   `artifact-non-maximum-suppression-visual-intuition` (Visual Intuition)
*   `artifact-non-maximum-suppression-interactive-visualization` (Interactive Visualization)
*   `artifact-non-maximum-suppression-exercise` (Exercise)
*   `artifact-non-maximum-suppression-comparison-table` (Comparison Table)
*   `artifact-one-stage-vs-two-stage-explanatory-text` (Explanatory Text)
*   `artifact-one-stage-vs-two-stage-visual-intuition` (Visual Intuition)
*   `artifact-one-stage-vs-two-stage-interactive-visualization` (Interactive Visualization)
*   `artifact-one-stage-vs-two-stage-exercise` (Exercise)
*   `artifact-one-stage-vs-two-stage-comparison-table` (Comparison Table)

The module references these artifacts solely through the lesson compositions. It does not directly own, modify, or duplicate these artifacts.

## 6. Reuse Notes

All composed lessons may be reused in other module compositions if pedagogically appropriate.
All underlying Learning Artifacts remain independently reusable across other lessons.
Participation in this module does not alter the lifecycle, metadata, reuse semantics, dependencies, or governance status of any referenced lesson or learning artifact.

## Evidence Boundary

This Module organizes Lessons.

It does not generate Competency Evidence.

It does not certify mastery.

Assessments remain governed by NV-800-M4.

Competency Evidence remains governed by NV-800-M3.

## 8. Architectural Alignment

Learning Paths organize Modules.

Modules organize Lessons.

Lessons orchestrate Learning Artifacts.

Learning Artifacts support learning.

Assessments produce Competency Evidence.

Competencies remain the canonical unit of mastery.

## 9. Quality Checklist

- [ ] Lesson references validated.
- [ ] Lesson content not duplicated.
- [ ] Artifact content not duplicated.
- [ ] Module aim aligned with included lessons.
- [ ] Evidence boundary preserved.
- [ ] No assessment logic introduced.
- [ ] No mastery claims introduced.
- [ ] Future expansion does not create undeclared lessons.
- [ ] Reuse implications documented.

## 10. Architectural Foundations

*   NV-800-M5 — Canonical Lesson Architecture
*   NV-800-M6 — Canonical Module & Learning Path Architecture
*   NV-800-M7 — Canonical Learning Artifact Architecture
*   NV-800-C1 — Seed Learning Artifacts
*   NV-800-C2 — First Canonical Lesson Composition
*   NV-800-C3 — Canonical Module Composition
*   NV-800-C4 — Canonical Learning Path Composition
*   NV-800-C5 — Canonical Foundation Content Pack (Wave 1)
*   NV-800-C6 — Canonical Content Review & Promotion (Wave 1)
*   NV-800-C7 — Canonical Foundation Content Pack (Wave 2)
*   NV-800-C8 — Canonical Foundation Content Pack (Wave 3: Mathematical Foundations)
*   NV-800-C9 — Canonical Foundation Content Pack (Wave 4: Statistics & Probability Foundations)
*   NV-800-C10 — Canonical Foundation Content Pack (Wave 5: Machine Learning Foundations)
*   NV-800-C11 — Canonical Foundation Content Pack (Wave 6: Deep Learning Foundations)
*   NV-800-C12 — Canonical Foundation Content Pack (Wave 7: Computer Vision Foundations)
*   NV-800-C13 — Canonical Foundation Content Pack (Wave 8: Convolutional Neural Networks)

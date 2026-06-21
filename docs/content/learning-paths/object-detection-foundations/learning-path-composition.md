---
learning_path_id: "path-object-detection-foundations"
learning_path_title: "Object Detection Foundations"
canonical_status: "Draft"
path_type: "Foundational Learning Path"

module_ids:
  - module-detection-fundamentals
  - module-detection-architectures

lesson_scope:
  - lesson-object-detection-fundamentals
  - lesson-bounding-boxes-coordinates
  - lesson-intersection-over-union
  - lesson-anchor-based-vs-free
  - lesson-non-maximum-suppression
  - lesson-one-stage-vs-two-stage

artifact_scope:
  - artifact-object-detection-fundamentals-explanatory-text
  - artifact-object-detection-fundamentals-visual-intuition
  - artifact-object-detection-fundamentals-interactive-visualization
  - artifact-object-detection-fundamentals-exercise
  - artifact-object-detection-fundamentals-comparison-table
  - artifact-bounding-boxes-coordinates-explanatory-text
  - artifact-bounding-boxes-coordinates-visual-intuition
  - artifact-bounding-boxes-coordinates-interactive-visualization
  - artifact-bounding-boxes-coordinates-exercise
  - artifact-bounding-boxes-coordinates-comparison-table
  - artifact-intersection-over-union-explanatory-text
  - artifact-intersection-over-union-visual-intuition
  - artifact-intersection-over-union-interactive-visualization
  - artifact-intersection-over-union-exercise
  - artifact-intersection-over-union-comparison-table
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

# Object Detection Foundations — Learning Path Composition

## 1. Purpose

This Learning Path organizes multiple Modules into a coherent, high-level object detection curriculum progression.

It serves as an organizational and navigational guide for learners. The Learning Path does not duplicate, embed, or rewrite the content of the referenced modules, lessons, or learning artifacts.

## 2. Learning Path Aim

Introduce learners to classification-regression multi-task networks, coordinate box systems, Jaccard Index overlap ratios, anchor setups, non-maximum peak score suppression loops, and single-stage vs. multi-stage proposals.

This path focuses on object localization and detection paradigms, without claiming or certifying competency mastery.

## 3. Included Modules

### 3.1 Detection Fundamentals

*   **Module ID:** `module-detection-fundamentals`
*   **Location:** `docs/content/modules/detection-fundamentals/module-composition.md`
*   **Pedagogical Role:** Establishes classification-localization splits, coordinate formats, absolute and relative bounds, and IoU overlap ratios.
*   **Relationship to Learning Path Aim:** Satisfies the initial step of the learning path's aim by exposing the learner to coordinate bounds, normalization grids, and overlap ratio formulas.

### 3.2 Detection Architectures

*   **Module ID:** `module-detection-architectures`
*   **Location:** `docs/content/modules/detection-architectures/module-composition.md`
*   **Pedagogical Role:** Details anchor prior templates vs anchor-free coordinates, NMS deduplication loops, and proposal stage latency.
*   **Relationship to Learning Path Aim:** Deepens understanding of keypoint regressions, peak confidences, and detector category pipelines.

This learning path does not duplicate any of the instructional content or text from the module compositions themselves.

## 4. Learning Path Flow

The learning path structures the following module progression:

1.  **Detection Fundamentals** (`module-detection-fundamentals`)
2.  **Detection Architectures** (`module-detection-architectures`)

### Future Expansion

Future modules may extend this path with topics such as transformer-based detection heads (DETR, RT-DETR), Feature Pyramid Networks (FPN), or Soft-NMS algorithms.

*Note: These future modules and future module stubs are not created or defined in this phase.*

## 5. Module-to-Lesson Trace

The Learning Path includes the following lessons indirectly through its modules:

*   `lesson-object-detection-fundamentals` (Object Detection Fundamentals)
*   `lesson-bounding-boxes-coordinates` (Bounding Boxes and Coordinate Systems)
*   `lesson-intersection-over-union` (Intersection over Union (IoU))
*   `lesson-anchor-based-vs-free` (Anchor-Based vs Anchor-Free Detection)
*   `lesson-non-maximum-suppression` (Non-Maximum Suppression (NMS))
*   `lesson-one-stage-vs-two-stage` (One-Stage vs Two-Stage Detectors)

The Learning Path references these lessons through the module compositions. It does not directly own or modify the lessons.

## 6. Lesson-to-Artifact Trace

The Learning Path includes the following Learning Artifacts indirectly through the composed modules and lessons:

*   `artifact-object-detection-fundamentals-explanatory-text` (Explanatory Text)
*   `artifact-object-detection-fundamentals-visual-intuition` (Visual Intuition)
*   `artifact-object-detection-fundamentals-interactive-visualization` (Interactive Visualization)
*   `artifact-object-detection-fundamentals-exercise` (Exercise)
*   `artifact-object-detection-fundamentals-comparison-table` (Comparison Table)
*   `artifact-bounding-boxes-coordinates-explanatory-text` (Explanatory Text)
*   `artifact-bounding-boxes-coordinates-visual-intuition` (Visual Intuition)
*   `artifact-bounding-boxes-coordinates-interactive-visualization` (Interactive Visualization)
*   `artifact-bounding-boxes-coordinates-exercise` (Exercise)
*   `artifact-bounding-boxes-coordinates-comparison-table` (Comparison Table)
*   `artifact-intersection-over-union-explanatory-text` (Explanatory Text)
*   `artifact-intersection-over-union-visual-intuition` (Visual Intuition)
*   `artifact-intersection-over-union-interactive-visualization` (Interactive Visualization)
*   `artifact-intersection-over-union-exercise` (Exercise)
*   `artifact-intersection-over-union-comparison-table` (Comparison Table)
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

The Learning Path references these artifacts indirectly through the module and lesson compositions. It does not directly own or modify the artifacts.

## 7. Reuse Notes

Composed modules may be reused in future learning paths if pedagogically appropriate.
Composed lessons may be reused in future modules.
The underlying Learning Artifacts remain independently reusable across different lessons.
Participation in this Learning Path does not alter the lifecycle, metadata, reuse semantics, dependencies, or governance status of any module, lesson, or learning artifact.

## Evidence Boundary

This Learning Path organizes Modules.

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

- [ ] Module references validated.
- [ ] Module content not duplicated.
- [ ] Lesson content not duplicated.
- [ ] Artifact content not duplicated.
- [ ] Learning path aim aligned with included modules.
- [ ] Evidence boundary preserved.
- [ ] No assessment logic introduced.
- [ ] No mastery claims introduced.
- [ ] Future expansion does not create undeclared modules.
- [ ] Reuse implications documented.

## 11. Architectural Foundations

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

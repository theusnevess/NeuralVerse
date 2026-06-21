---
module_id: "module-detection-fundamentals"
module_title: "Detection Fundamentals"
canonical_status: "Draft"
module_type: "Core Module"

lesson_ids:
  - lesson-object-detection-fundamentals
  - lesson-bounding-boxes-coordinates
  - lesson-intersection-over-union

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
---

# Detection Fundamentals — Module Composition

## 1. Purpose

This module organizes foundational lessons related to classification-regression task splits, pixel coordinate maps, and box overlap areas.

It provides an organizational boundary for multi-task heads, corner vs center coordinates, and Intersection over Union divisions without duplicating any instructional content.

## 2. Module Learning Aim

Introduce learners to the fundamentals of object detection, including spatial localization vs. classification heads, absolute and normalized bounding box coordinate representations, and overlap calculation metrics (Intersection over Union).

This module aims to connect tasks to locations, xyxy to xywh relative layouts, and overlapping boundaries to IoU ratios, without claiming or certifying competency mastery.

## 3. Included Lessons

### 3.1 Object Detection Fundamentals

*   **Lesson ID:** `lesson-object-detection-fundamentals`
*   **Location:** `docs/content/lessons/object-detection-fundamentals/lesson-composition.md`
*   **Pedagogical Role:** Details localization regression, class indices, shared feature backbones, and weighted losses.
*   **Relationship to Module Aim:** Fulfills the object detection head division requirement of the learning aim.

### 3.2 Bounding Boxes and Coordinate Systems

*   **Lesson ID:** `lesson-bounding-boxes-coordinates`
*   **Location:** `docs/content/lessons/bounding-boxes-coordinates/lesson-composition.md`
*   **Pedagogical Role:** Compares xyxy corner limits, xywh center alignments, and normalized relative pixel bounds.
*   **Relationship to Learning Path Aim:** Fulfills the box format coordinate requirement of the learning aim.

### 3.3 Intersection over Union (IoU)

*   **Lesson ID:** `lesson-intersection-over-union`
*   **Location:** `docs/content/lessons/intersection-over-union/lesson-composition.md`
*   **Pedagogical Role:** Compares overlap areas, union values, Jaccard metrics, and detection matching thresholds.
*   **Relationship to Learning Path Aim:** Fulfills the overlapping calculation requirements of the learning aim.

This module composition does not duplicate any of the instructional content or text from the lesson compositions themselves.

## 4. Module Composition Flow

The module structures lessons in the following sequence:

1.  **Object Detection Fundamentals** (`lesson-object-detection-fundamentals`)
2.  **Bounding Boxes and Coordinate Systems** (`lesson-bounding-boxes-coordinates`)
3.  **Intersection over Union (IoU)** (`lesson-intersection-over-union`)

### Future Expansion

Future lessons may extend this module with topics such as generalized IoU metrics (GIoU, DIoU, CIoU), multi-task loss weight optimizations, or custom anchor labeling conventions.

*Note: These future lessons are not created or defined in this phase.*

## 5. Lesson-to-Artifact Trace

The module indirectly includes the following Learning Artifacts through its lessons:

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

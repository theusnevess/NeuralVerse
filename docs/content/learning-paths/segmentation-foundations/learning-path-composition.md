---
learning_path_id: "path-segmentation-foundations"
learning_path_title: "Segmentation Foundations"
canonical_status: "Draft"
path_type: "Foundational Learning Path"

module_ids:
  - module-segmentation-fundamentals
  - module-segmentation-architectures

lesson_scope:
  - lesson-semantic-segmentation-fundamentals
  - lesson-pixel-wise-classification
  - lesson-segmentation-masks-labels
  - lesson-instance-segmentation-fundamentals
  - lesson-encoder-decoder-segmentation
  - lesson-unet-vs-maskrcnn

artifact_scope:
  - artifact-semantic-segmentation-fundamentals-explanatory-text
  - artifact-semantic-segmentation-fundamentals-visual-intuition
  - artifact-semantic-segmentation-fundamentals-interactive-visualization
  - artifact-semantic-segmentation-fundamentals-exercise
  - artifact-semantic-segmentation-fundamentals-comparison-table
  - artifact-pixel-wise-classification-explanatory-text
  - artifact-pixel-wise-classification-visual-intuition
  - artifact-pixel-wise-classification-interactive-visualization
  - artifact-pixel-wise-classification-exercise
  - artifact-pixel-wise-classification-comparison-table
  - artifact-segmentation-masks-labels-explanatory-text
  - artifact-segmentation-masks-labels-visual-intuition
  - artifact-segmentation-masks-labels-interactive-visualization
  - artifact-segmentation-masks-labels-exercise
  - artifact-segmentation-masks-labels-comparison-table
  - artifact-instance-segmentation-fundamentals-explanatory-text
  - artifact-instance-segmentation-fundamentals-visual-intuition
  - artifact-instance-segmentation-fundamentals-interactive-visualization
  - artifact-instance-segmentation-fundamentals-exercise
  - artifact-instance-segmentation-fundamentals-comparison-table
  - artifact-encoder-decoder-segmentation-explanatory-text
  - artifact-encoder-decoder-segmentation-visual-intuition
  - artifact-encoder-decoder-segmentation-interactive-visualization
  - artifact-encoder-decoder-segmentation-exercise
  - artifact-encoder-decoder-segmentation-comparison-table
  - artifact-unet-vs-maskrcnn-explanatory-text
  - artifact-unet-vs-maskrcnn-visual-intuition
  - artifact-unet-vs-maskrcnn-interactive-visualization
  - artifact-unet-vs-maskrcnn-exercise
  - artifact-unet-vs-maskrcnn-comparison-table
---

# Segmentation Foundations — Learning Path Composition

## 1. Purpose

This Learning Path organizes multiple Modules into a coherent, high-level image segmentation curriculum progression.

It serves as an organizational and navigational guide for learners. The Learning Path does not duplicate, embed, or rewrite the content of the referenced modules, lessons, or learning artifacts.

## 2. Learning Path Aim

Introduce learners to image segmentation paradigms, including category-level pixel grouping, output logit classification heads, one-hot map formats, encoder-decoder bottlenecks, skip connection spatial restores, and U-Net vs. Mask R-CNN architectural distinctions.

This path focuses on semantic and instance boundary representations, without claiming or certifying competency mastery.

## 3. Included Modules

### 3.1 Segmentation Fundamentals

*   **Module ID:** `module-segmentation-fundamentals`
*   **Location:** `docs/content/modules/segmentation-fundamentals/module-composition.md`
*   **Pedagogical Role:** Establishes semantic pixel classes, Softmax logits, index label arrays, and one-hot mask tensors.
*   **Relationship to Learning Path Aim:** Satisfies the initial step of the learning path's aim by exposing the learner to pixel classification grids, probability channel maps, and map arrays.

### 3.2 Segmentation Architectures

*   **Module ID:** `module-segmentation-architectures`
*   **Location:** `docs/content/modules/segmentation-architectures/module-composition.md`
*   **Pedagogical Role:** Details object instances, encoder-decoder contractions, skip connection restorations, and U-Net vs Mask R-CNN.
*   **Relationship to Learning Path Aim:** Deepens understanding of upsampling networks, detail transfers, and fully convolutional vs bounding box paradigms.

This learning path does not duplicate any of the instructional content or text from the module compositions themselves.

## 4. Learning Path Flow

The learning path structures the following module progression:

1.  **Segmentation Fundamentals** (`module-segmentation-fundamentals`)
2.  **Segmentation Architectures** (`module-segmentation-architectures`)

### Future Expansion

Future modules may extend this path with topics such as Feature Pyramid Networks (FPN), dilated/atrous convolutions (DeepLab), or transformer-based segmentation models (Mask2Former).

*Note: These future modules and future module stubs are not created or defined in this phase.*

## 5. Module-to-Lesson Trace

The Learning Path includes the following lessons indirectly through its modules:

*   `lesson-semantic-segmentation-fundamentals` (Semantic Segmentation Fundamentals)
*   `lesson-pixel-wise-classification` (Pixel-wise Classification)
*   `lesson-segmentation-masks-labels` (Segmentation Masks and Label Maps)
*   `lesson-instance-segmentation-fundamentals` (Instance Segmentation Fundamentals)
*   `lesson-encoder-decoder-segmentation` (Encoder–Decoder Architectures)
*   `lesson-unet-vs-maskrcnn` (U-Net vs Mask R-CNN (Conceptual Comparison))

The Learning Path references these lessons through the module compositions. It does not directly own or modify the lessons.

## 6. Lesson-to-Artifact Trace

The Learning Path includes the following Learning Artifacts indirectly through the composed modules and lessons:

*   `artifact-semantic-segmentation-fundamentals-explanatory-text` (Explanatory Text)
*   `artifact-semantic-segmentation-fundamentals-visual-intuition` (Visual Intuition)
*   `artifact-semantic-segmentation-fundamentals-interactive-visualization` (Interactive Visualization)
*   `artifact-semantic-segmentation-fundamentals-exercise` (Exercise)
*   `artifact-semantic-segmentation-fundamentals-comparison-table` (Comparison Table)
*   `artifact-pixel-wise-classification-explanatory-text` (Explanatory Text)
*   `artifact-pixel-wise-classification-visual-intuition` (Visual Intuition)
*   `artifact-pixel-wise-classification-interactive-visualization` (Interactive Visualization)
*   `artifact-pixel-wise-classification-exercise` (Exercise)
*   `artifact-pixel-wise-classification-comparison-table` (Comparison Table)
*   `artifact-segmentation-masks-labels-explanatory-text` (Explanatory Text)
*   `artifact-segmentation-masks-labels-visual-intuition` (Visual Intuition)
*   `artifact-segmentation-masks-labels-interactive-visualization` (Interactive Visualization)
*   `artifact-segmentation-masks-labels-exercise` (Exercise)
*   `artifact-segmentation-masks-labels-comparison-table` (Comparison Table)
*   `artifact-instance-segmentation-fundamentals-explanatory-text` (Explanatory Text)
*   `artifact-instance-segmentation-fundamentals-visual-intuition` (Visual Intuition)
*   `artifact-instance-segmentation-fundamentals-interactive-visualization` (Interactive Visualization)
*   `artifact-instance-segmentation-fundamentals-exercise` (Exercise)
*   `artifact-instance-segmentation-fundamentals-comparison-table` (Comparison Table)
*   `artifact-encoder-decoder-segmentation-explanatory-text` (Explanatory Text)
*   `artifact-encoder-decoder-segmentation-visual-intuition` (Visual Intuition)
*   `artifact-encoder-decoder-segmentation-interactive-visualization` (Interactive Visualization)
*   `artifact-encoder-decoder-segmentation-exercise` (Exercise)
*   `artifact-encoder-decoder-segmentation-comparison-table` (Comparison Table)
*   `artifact-unet-vs-maskrcnn-explanatory-text` (Explanatory Text)
*   `artifact-unet-vs-maskrcnn-visual-intuition` (Visual Intuition)
*   `artifact-unet-vs-maskrcnn-interactive-visualization` (Interactive Visualization)
*   `artifact-unet-vs-maskrcnn-exercise` (Exercise)
*   `artifact-unet-vs-maskrcnn-comparison-table` (Comparison Table)

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
*   NV-800-C14 — Canonical Foundation Content Pack (Wave 9: Object Detection Foundations)

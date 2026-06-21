---
module_id: "module-segmentation-architectures"
module_title: "Segmentation Architectures"
canonical_status: "Draft"
module_type: "Core Module"

lesson_ids:
  - lesson-instance-segmentation-fundamentals
  - lesson-encoder-decoder-segmentation
  - lesson-unet-vs-maskrcnn

artifact_scope:
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

# Segmentation Architectures — Module Composition

## 1. Purpose

This module organizes lessons related to instance masks, spatial bottlenecks, and encoder-decoder topologies.

It provides an organizational boundary for region alignments, transposed convolutions, and fully convolutional network maps without duplicating any instructional content.

## 2. Module Learning Aim

Introduce learners to segmentation architectures, including instance isolation masks, encoder-decoder spatial bottlenecks, skip connection edge restorations, and U-Net vs. Mask R-CNN paradigm comparisons.

This module aims to connect bounding box crops to binary masks, compressed spatial features to decoders, and symmetric skips to regional proposal pipelines, without claiming or certifying competency mastery.

## 3. Included Lessons

### 3.1 Instance Segmentation Fundamentals

*   **Lesson ID:** `lesson-instance-segmentation-fundamentals`
*   **Location:** `docs/content/lessons/instance-segmentation-fundamentals/lesson-composition.md`
*   **Pedagogical Role:** Teaches object instances, binary mask regions, RoI alignments, and multi-instance counts.
*   **Relationship to Module Aim:** Fulfills the instance mask isolation requirement of the learning aim.

### 3.2 Encoder–Decoder Architectures

*   **Lesson ID:** `lesson-encoder-decoder-segmentation`
*   **Location:** `docs/content/lessons/encoder-decoder-segmentation/lesson-composition.md`
*   **Pedagogical Role:** Compares bottleneck poolings, transposed upsampling, bilinear decoders, and skip shortcut pathways.
*   **Relationship to Learning Path Aim:** Fulfills the encoder-decoder bottleneck and skip connection requirements of the learning aim.

### 3.3 U-Net vs Mask R-CNN (Conceptual Comparison)

*   **Lesson ID:** `lesson-unet-vs-maskrcnn`
*   **Location:** `docs/content/lessons/unet-vs-maskrcnn/lesson-composition.md`
*   **Pedagogical Role:** Focuses on fully convolutional decoders, bounding box proposals, spatial coordinates, and medical/robotic use cases.
*   **Relationship to Learning Path Aim:** Fulfills the U-Net vs. Mask R-CNN architectural comparison requirement of the learning aim.

This module composition does not duplicate any of the instructional content or text from the lesson compositions themselves.

## 4. Module Composition Flow

The module structures lessons in the following sequence:

1.  **Instance Segmentation Fundamentals** (`lesson-instance-segmentation-fundamentals`)
2.  **Encoder–Decoder Architectures** (`lesson-encoder-decoder-segmentation`)
3.  **U-Net vs Mask R-CNN (Conceptual Comparison)** (`lesson-unet-vs-maskrcnn`)

### Future Expansion

Future lessons may extend this module with topics such as Feature Pyramid Networks (FPN), dilated/atrous convolutions (DeepLab), or transformer-based segmentation models (Mask2Former).

*Note: These future lessons are not created or defined in this phase.*

## 5. Lesson-to-Artifact Trace

The module indirectly includes the following Learning Artifacts through its lessons:

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
*   NV-800-C14 — Canonical Foundation Content Pack (Wave 9: Object Detection Foundations)

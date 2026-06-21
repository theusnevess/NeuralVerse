---
module_id: "module-cnn-building-blocks"
module_title: "CNN Building Blocks"
canonical_status: "Draft"
module_type: "Core Module"

lesson_ids:
  - lesson-convolutional-neural-networks
  - lesson-pooling-layers
  - lesson-stride-padding

artifact_scope:
  - artifact-convolutional-neural-networks-explanatory-text
  - artifact-convolutional-neural-networks-visual-intuition
  - artifact-convolutional-neural-networks-interactive-visualization
  - artifact-convolutional-neural-networks-exercise
  - artifact-convolutional-neural-networks-comparison-table
  - artifact-pooling-layers-explanatory-text
  - artifact-pooling-layers-visual-intuition
  - artifact-pooling-layers-interactive-visualization
  - artifact-pooling-layers-exercise
  - artifact-pooling-layers-comparison-table
  - artifact-stride-padding-explanatory-text
  - artifact-stride-padding-visual-intuition
  - artifact-stride-padding-interactive-visualization
  - artifact-stride-padding-exercise
  - artifact-stride-padding-comparison-table
---

# CNN Building Blocks — Module Composition

## 1. Purpose

This module organizes foundational lessons related to Convolutional Neural Network topologies, downsampling layers, and spatial layout calculators.

It provides an organizational boundary for weight sharing, max/average pooling, and stride/padding adjustments without duplicating any instructional content.

## 2. Module Learning Aim

Introduce learners to the core building blocks of Convolutional Neural Networks, including weight sharing, local connectivity, spatial max/average pooling downsamplings, and stride/padding output layout calculations.

This module aims to connect filters to parameters, local values to max outputs, and boundary sizes to padding choices, without claiming or certifying competency mastery.

## 3. Included Lessons

### 3.1 Convolutional Neural Networks (CNNs)

*   **Lesson ID:** `lesson-convolutional-neural-networks`
*   **Location:** `docs/content/lessons/convolutional-neural-networks/lesson-composition.md`
*   **Pedagogical Role:** Teaches local connectivity, parameter sharing benefits, MLP-to-CNN differences, and translation invariance.
*   **Relationship to Module Aim:** Fulfills the CNN topology and parameter sharing requirement of the learning aim.

### 3.2 Pooling Layers

*   **Lesson ID:** `lesson-pooling-layers`
*   **Location:** `docs/content/lessons/pooling-layers/lesson-composition.md`
*   **Pedagogical Role:** Focuses on Max pooling highlights, Average pooling blurs, non-parametric downsampling, and spatial tolerance.
*   **Relationship to Learning Path Aim:** Fulfills the downsampling and size reductions requirement of the learning aim.

### 3.3 Stride and Padding

*   **Lesson ID:** `lesson-stride-padding`
*   **Location:** `docs/content/lessons/stride-padding/lesson-composition.md`
*   **Pedagogical Role:** Compares sliding steps, boundary preservation, Valid vs Same paddings, and dimensional layout equations.
*   **Relationship to Learning Path Aim:** Fulfills the layer dimension calculations and boundary behaviors requirement of the learning aim.

This module composition does not duplicate any of the instructional content or text from the lesson compositions themselves.

## 4. Module Composition Flow

The module structures lessons in the following sequence:

1.  **Convolutional Neural Networks (CNNs)** (`lesson-convolutional-neural-networks`)
2.  **Pooling Layers** (`lesson-pooling-layers`)
3.  **Stride and Padding** (`lesson-stride-padding`)

### Future Expansion

Future lessons may extend this module with topics such as group convolutions, separable convolutions, channel attention blocks, or spatial pooling alternatives.

*Note: These future lessons are not created or defined in this phase.*

## 5. Lesson-to-Artifact Trace

The module indirectly includes the following Learning Artifacts through its lessons:

*   `artifact-convolutional-neural-networks-explanatory-text` (Explanatory Text)
*   `artifact-convolutional-neural-networks-visual-intuition` (Visual Intuition)
*   `artifact-convolutional-neural-networks-interactive-visualization` (Interactive Visualization)
*   `artifact-convolutional-neural-networks-exercise` (Exercise)
*   `artifact-convolutional-neural-networks-comparison-table` (Comparison Table)
*   `artifact-pooling-layers-explanatory-text` (Explanatory Text)
*   `artifact-pooling-layers-visual-intuition` (Visual Intuition)
*   `artifact-pooling-layers-interactive-visualization` (Interactive Visualization)
*   `artifact-pooling-layers-exercise` (Exercise)
*   `artifact-pooling-layers-comparison-table` (Comparison Table)
*   `artifact-stride-padding-explanatory-text` (Explanatory Text)
*   `artifact-stride-padding-visual-intuition` (Visual Intuition)
*   `artifact-stride-padding-interactive-visualization` (Interactive Visualization)
*   `artifact-stride-padding-exercise` (Exercise)
*   `artifact-stride-padding-comparison-table` (Comparison Table)

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

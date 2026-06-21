---
module_id: "module-visual-feature-extraction-foundations"
module_title: "Visual Feature Extraction Foundations"
canonical_status: "Draft"
module_type: "Core Module"

lesson_ids:
  - lesson-convolution-intuition
  - lesson-feature-maps-filters
  - lesson-classical-vs-deep-vision

artifact_scope:
  - artifact-convolution-intuition-explanatory-text
  - artifact-convolution-intuition-visual-intuition
  - artifact-convolution-intuition-interactive-visualization
  - artifact-convolution-intuition-exercise
  - artifact-convolution-intuition-comparison-table
  - artifact-feature-maps-filters-explanatory-text
  - artifact-feature-maps-filters-visual-intuition
  - artifact-feature-maps-filters-interactive-visualization
  - artifact-feature-maps-filters-exercise
  - artifact-feature-maps-filters-comparison-table
  - artifact-classical-vs-deep-vision-explanatory-text
  - artifact-classical-vs-deep-vision-visual-intuition
  - artifact-classical-vs-deep-vision-interactive-visualization
  - artifact-classical-vs-deep-vision-exercise
  - artifact-classical-vs-deep-vision-comparison-table
---

# Visual Feature Extraction Foundations — Module Composition

## 1. Purpose

This module organizes lessons related to 2D image matrix filtering operations, feature maps, and computer vision paradigms.

It provides an organizational boundary for sliding kernel convolutions, Sobel gradient maps, and handcrafted vs learned features without duplicating any instructional content.

## 2. Module Learning Aim

Introduce learners to spatial feature extraction in computer vision, including 2D convolutions (kernels, stride, padding), feature maps (gradients, blurring), and the paradigm shift from classical hand-crafted descriptors to deep representation learning.

This module aims to connect sliding kernels to step strides, edge gradients, blur blurs, and end-to-end representations, without claiming or certifying competency mastery.

## 3. Included Lessons

### 3.1 Convolution Intuition

*   **Lesson ID:** `lesson-convolution-intuition`
*   **Location:** `docs/content/lessons/convolution-intuition/lesson-composition.md`
*   **Pedagogical Role:** Teaches sliding kernel dot products, step strides, and padding constraints.
*   **Relationship to Module Aim:** Fulfills the 2D matrix convolution mechanics requirement of the learning aim.

### 3.2 Feature Maps and Filters

*   **Lesson ID:** `lesson-feature-maps-filters`
*   **Location:** `docs/content/lessons/feature-maps-filters/lesson-composition.md`
*   **Pedagogical Role:** Compares Sobel vertical/horizontal gradients, average noise blur kernels, and learned weights.
*   **Relationship to Learning Path Aim:** Fulfills the feature map and activation gradient requirement of the learning aim.

### 3.3 Classical Computer Vision vs Deep Learning Vision

*   **Lesson ID:** `lesson-classical-vs-deep-vision`
*   **Location:** `docs/content/lessons/classical-vs-deep-vision/lesson-composition.md`
*   **Pedagogical Role:** Compares SIFT/HOG pipelines with learned CNN weights across data, compute, and interpretability.
*   **Relationship to Learning Path Aim:** Fulfills the paradigm differences and representation learning requirement of the learning aim.

This module composition does not duplicate any of the instructional content or text from the lesson compositions themselves.

## 4. Module Composition Flow

The module structures lessons in the following sequence:

1.  **Convolution Intuition** (`lesson-convolution-intuition`)
2.  **Feature Maps and Filters** (`lesson-feature-maps-filters`)
3.  **Classical Computer Vision vs Deep Learning Vision** (`lesson-classical-vs-deep-vision`)

### Future Expansion

Future lessons may extend this module with topics such as pooling operations (max pooling, average pooling), dilated convolutions, spatial pyramid pooling, or scale-invariant feature transforms.

*Note: These future lessons are not created or defined in this phase.*

## 5. Lesson-to-Artifact Trace

The module indirectly includes the following Learning Artifacts through its lessons:

*   `artifact-convolution-intuition-explanatory-text` (Explanatory Text)
*   `artifact-convolution-intuition-visual-intuition` (Visual Intuition)
*   `artifact-convolution-intuition-interactive-visualization` (Interactive Visualization)
*   `artifact-convolution-intuition-exercise` (Exercise)
*   `artifact-convolution-intuition-comparison-table` (Comparison Table)
*   `artifact-feature-maps-filters-explanatory-text` (Explanatory Text)
*   `artifact-feature-maps-filters-visual-intuition` (Visual Intuition)
*   `artifact-feature-maps-filters-interactive-visualization` (Interactive Visualization)
*   `artifact-feature-maps-filters-exercise` (Exercise)
*   `artifact-feature-maps-filters-comparison-table` (Comparison Table)
*   `artifact-classical-vs-deep-vision-explanatory-text` (Explanatory Text)
*   `artifact-classical-vs-deep-vision-visual-intuition` (Visual Intuition)
*   `artifact-classical-vs-deep-vision-interactive-visualization` (Interactive Visualization)
*   `artifact-classical-vs-deep-vision-exercise` (Exercise)
*   `artifact-classical-vs-deep-vision-comparison-table` (Comparison Table)

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

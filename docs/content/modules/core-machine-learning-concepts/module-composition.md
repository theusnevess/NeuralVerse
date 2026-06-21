---
module_id: "module-core-machine-learning-concepts"
module_title: "Core Machine Learning Concepts"
canonical_status: "Draft"
module_type: "Core Module"

lesson_ids:
  - lesson-supervised-learning
  - lesson-unsupervised-learning
  - lesson-loss-functions

artifact_scope:
  - artifact-supervised-learning-explanatory-text
  - artifact-supervised-learning-visual-intuition
  - artifact-supervised-learning-interactive-visualization
  - artifact-supervised-learning-exercise
  - artifact-supervised-learning-comparison-table
  - artifact-unsupervised-learning-explanatory-text
  - artifact-unsupervised-learning-visual-intuition
  - artifact-unsupervised-learning-interactive-visualization
  - artifact-unsupervised-learning-exercise
  - artifact-unsupervised-learning-comparison-table
  - artifact-loss-functions-explanatory-text
  - artifact-loss-functions-visual-intuition
  - artifact-loss-functions-interactive-visualization
  - artifact-loss-functions-exercise
  - artifact-loss-functions-comparison-table
---

# Core Machine Learning Concepts — Module Composition

## 1. Purpose

This module organizes foundational lessons related to learning paradigms and optimization feedback loops.

It provides an organizational boundary for supervised classifications, unsupervised clustering, and error loss metrics without duplicating any instructional content.

## 2. Module Learning Aim

Introduce learners to the core paradigms of machine learning, including supervised learning (classification and regression), unsupervised learning (clustering and dimensionality reduction), and loss functions.

This module aims to connect learning categories to model weights, distance groupings, and classification optimizations, without claiming or certifying competency mastery.

## 3. Included Lessons

### 3.1 Supervised Learning

*   **Lesson ID:** `lesson-supervised-learning`
*   **Location:** `docs/content/lessons/supervised-learning/lesson-composition.md`
*   **Pedagogical Role:** Compares input features and target labels, defining discrete classification and continuous regression boundaries.
*   **Relationship to Module Aim:** Fulfills the supervised learning requirement of the learning aim.

### 3.2 Unsupervised Learning

*   **Lesson ID:** `lesson-unsupervised-learning`
*   **Location:** `docs/content/lessons/unsupervised-learning/lesson-composition.md`
*   **Pedagogical Role:** Covers pattern discovery, K-Means clustering, and dimensional squeezing without target labels.
*   **Relationship to Learning Path Aim:** Fulfills the unsupervised learning and clustering requirement of the learning aim.

### 3.3 Loss Functions

*   **Lesson ID:** `lesson-loss-functions`
*   **Location:** `docs/content/lessons/loss-functions/lesson-composition.md`
*   **Pedagogical Role:** Explains prediction errors, MSE for continuous mapping, Cross-Entropy for classes, and downhill gradient slopes.
*   **Relationship to Learning Path Aim:** Fulfills the loss functions and error minimization requirement of the learning aim.

This module composition does not duplicate any of the instructional content or text from the lesson compositions themselves.

## 4. Module Composition Flow

The module structures lessons in the following sequence:

1.  **Supervised Learning** (`lesson-supervised-learning`)
2.  **Unsupervised Learning** (`lesson-unsupervised-learning`)
3.  **Loss Functions** (`lesson-loss-functions`)

### Future Expansion

Future lessons may extend this module with topics such as gradient descent variants, active learning, semi-supervised architectures, or reinforcement learning fundamentals.

*Note: These future lessons are not created or defined in this phase.*

## 5. Lesson-to-Artifact Trace

The module indirectly includes the following Learning Artifacts through its lessons:

*   `artifact-supervised-learning-explanatory-text` (Explanatory Text)
*   `artifact-supervised-learning-visual-intuition` (Visual Intuition)
*   `artifact-supervised-learning-interactive-visualization` (Interactive Visualization)
*   `artifact-supervised-learning-exercise` (Exercise)
*   `artifact-supervised-learning-comparison-table` (Comparison Table)
*   `artifact-unsupervised-learning-explanatory-text` (Explanatory Text)
*   `artifact-unsupervised-learning-visual-intuition` (Visual Intuition)
*   `artifact-unsupervised-learning-interactive-visualization` (Interactive Visualization)
*   `artifact-unsupervised-learning-exercise` (Exercise)
*   `artifact-unsupervised-learning-comparison-table` (Comparison Table)
*   `artifact-loss-functions-explanatory-text` (Explanatory Text)
*   `artifact-loss-functions-visual-intuition` (Visual Intuition)
*   `artifact-loss-functions-interactive-visualization` (Interactive Visualization)
*   `artifact-loss-functions-exercise` (Exercise)
*   `artifact-loss-functions-comparison-table` (Comparison Table)

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

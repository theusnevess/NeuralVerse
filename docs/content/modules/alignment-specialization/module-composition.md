---
module_id: "module-alignment-specialization"
module_title: "Alignment & Specialization"
canonical_status: "Draft"
module_type: "Core Module"

lesson_ids:
  - lesson-supervised-fine-tuning
  - lesson-rlhf-concepts
  - lesson-domain-adaptation

artifact_scope:
  - artifact-supervised-fine-tuning-explanatory-text
  - artifact-supervised-fine-tuning-visual-intuition
  - artifact-supervised-fine-tuning-interactive-visualization
  - artifact-supervised-fine-tuning-exercise
  - artifact-supervised-fine-tuning-comparison-table
  - artifact-rlhf-concepts-explanatory-text
  - artifact-rlhf-concepts-visual-intuition
  - artifact-rlhf-concepts-interactive-visualization
  - artifact-rlhf-concepts-exercise
  - artifact-rlhf-concepts-comparison-table
  - artifact-domain-adaptation-explanatory-text
  - artifact-domain-adaptation-visual-intuition
  - artifact-domain-adaptation-interactive-visualization
  - artifact-domain-adaptation-exercise
  - artifact-domain-adaptation-comparison-table
---

# Alignment & Specialization — Module Composition

## 1. Purpose

This module organizes lessons related to target-only cross-entropy loss masking in Supervised Fine-Tuning (SFT), human preference reward modeling, policy optimizations (PPO / KL penalties), medical/financial/legal domain pre-training, and Fine-Tuning vs. Retrieval-Augmented Generation (RAG) architectural trade-offs.

It provides an organizational boundary for loss weights, reward rankings, and context window optimizations without duplicating any instructional content.

## 2. Module Learning Aim

Introduce learners to model alignment and specialization techniques, including target-only cross-entropy loss masking in Supervised Fine-Tuning (SFT), human preference reward modeling, policy optimizations (PPO / KL penalties), medical/financial/legal domain pre-training, and Fine-Tuning vs. Retrieval-Augmented Generation (RAG) architectural trade-offs.

This module aims to connect curated responses to output formats, reward models to preferred behaviors, and domain corpora to customized vocabulary weights, without claiming or certifying competency mastery.

## 3. Included Lessons

### 3.1 Supervised Fine-Tuning (SFT)

*   **Lesson ID:** `lesson-supervised-fine-tuning`
*   **Location:** `docs/content/lessons/supervised-fine-tuning/lesson-composition.md`
*   **Pedagogical Role:** Teaches target-only cross-entropy loss calculation, prompt masking layers, and SFT data quality rules.
*   **Relationship to Module Aim:** Fulfills the SFT alignment requirement of the learning aim.

### 3.2 Reinforcement Learning from Human Feedback (RLHF)

*   **Lesson ID:** `lesson-rlhf-concepts`
*   **Location:** `docs/content/lessons/rlhf-concepts/lesson-composition.md`
*   **Pedagogical Role:** Compares reward scores, policy models, candidate preference comparison rankings, and KL-divergence stabilization terms.
*   **Relationship to Learning Path Aim:** Fulfills the RLHF preference optimization requirement of the learning aim.

### 3.3 Domain Adaptation and Specialization

*   **Lesson ID:** `lesson-domain-adaptation`
*   **Location:** `docs/content/lessons/domain-adaptation/lesson-composition.md`
*   **Pedagogical Role:** Focuses on medical/legal continuous pre-training, jargon adjustments, and RAG vs. Fine-Tuning selection dynamics.
*   **Relationship to Learning Path Aim:** Fulfills the domain customization requirement of the learning aim.

This module composition does not duplicate any of the instructional content or text from the lesson compositions themselves.

## 4. Module Composition Flow

The module structures lessons in the following sequence:

1.  **Supervised Fine-Tuning (SFT)** (`lesson-supervised-fine-tuning`)
2.  **Reinforcement Learning from Human Feedback (RLHF) — visão conceitual** (`lesson-rlhf-concepts`)
3.  **Domain Adaptation and Specialization** (`lesson-domain-adaptation`)

### Future Expansion

Future lessons may extend this module with topics such as Direct Preference Optimization (DPO), safety evaluation red-teaming, or multi-modal vocabulary expansion.

*Note: These future lessons are not created or defined in this phase.*

## 5. Lesson-to-Artifact Trace

The module indirectly includes the following Learning Artifacts through its lessons:

*   `artifact-supervised-fine-tuning-explanatory-text` (Explanatory Text)
*   `artifact-supervised-fine-tuning-visual-intuition` (Visual Intuition)
*   `artifact-supervised-fine-tuning-interactive-visualization` (Interactive Visualization)
*   `artifact-supervised-fine-tuning-exercise` (Exercise)
*   `artifact-supervised-fine-tuning-comparison-table` (Comparison Table)
*   `artifact-rlhf-concepts-explanatory-text` (Explanatory Text)
*   `artifact-rlhf-concepts-visual-intuition` (Visual Intuition)
*   `artifact-rlhf-concepts-interactive-visualization` (Interactive Visualization)
*   `artifact-rlhf-concepts-exercise` (Exercise)
*   `artifact-rlhf-concepts-comparison-table` (Comparison Table)
*   `artifact-domain-adaptation-explanatory-text` (Explanatory Text)
*   `artifact-domain-adaptation-visual-intuition` (Visual Intuition)
*   `artifact-domain-adaptation-interactive-visualization` (Interactive Visualization)
*   `artifact-domain-adaptation-exercise` (Exercise)
*   `artifact-domain-adaptation-comparison-table` (Comparison Table)

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
*   NV-800-C15 — Canonical Foundation Content Pack (Wave 10: Semantic & Instance Segmentation Foundations)
*   NV-800-C16 — Canonical Foundation Content Pack (Wave 11: Transformer Foundations)
*   NV-800-C17 — Canonical Foundation Content Pack (Wave 12: Large Language Model Foundations)

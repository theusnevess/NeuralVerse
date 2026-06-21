---
learning_path_id: "path-fine-tuning-foundations"
learning_path_title: "Fine-Tuning & Adaptation Foundations"
canonical_status: "Draft"
path_type: "Foundational Learning Path"

module_ids:
  - module-model-adaptation
  - module-alignment-specialization

lesson_scope:
  - lesson-fine-tuning-fundamentals
  - lesson-instruction-tuning
  - lesson-peft
  - lesson-supervised-fine-tuning
  - lesson-rlhf-concepts
  - lesson-domain-adaptation

artifact_scope:
  - artifact-fine-tuning-fundamentals-explanatory-text
  - artifact-fine-tuning-fundamentals-visual-intuition
  - artifact-fine-tuning-fundamentals-interactive-visualization
  - artifact-fine-tuning-fundamentals-exercise
  - artifact-fine-tuning-fundamentals-comparison-table
  - artifact-instruction-tuning-explanatory-text
  - artifact-instruction-tuning-visual-intuition
  - artifact-instruction-tuning-interactive-visualization
  - artifact-instruction-tuning-exercise
  - artifact-instruction-tuning-comparison-table
  - artifact-peft-explanatory-text
  - artifact-peft-visual-intuition
  - artifact-peft-interactive-visualization
  - artifact-peft-exercise
  - artifact-peft-comparison-table
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

# Fine-Tuning & Adaptation Foundations — Learning Path Composition

## 1. Purpose

This Learning Path organizes multiple Modules into a coherent, high-level Model Adaptation curriculum progression.

It serves as an organizational and navigational guide for learners. The Learning Path does not duplicate, embed, or rewrite the content of the referenced modules, lessons, or learning artifacts.

## 2. Learning Path Aim

Introduce learners to the conceptual foundations of model adaptation, including gradient updates, instruction alignment, Parameter-Efficient Fine-Tuning (PEFT/LoRA), SFT loss masking, Reinforcement Learning from Human Feedback (RLHF), and domain specialization.

This path focuses on model customization, without claiming or certifying competency mastery.

## 3. Included Modules

### 3.1 Model Adaptation Fundamentals

*   **Module ID:** `module-model-adaptation`
*   **Location:** `docs/content/modules/model-adaptation/module-composition.md`
*   **Pedagogical Role:** Establishes fine-tuning parameter updates, instruction format templates, and PEFT low-rank math.
*   **Relationship to Learning Path Aim:** Satisfies the initial step of the learning path's aim by exposing the learner to adapter and fine-tuning configurations.

### 3.2 Alignment & Specialization

*   **Module ID:** `module-alignment-specialization`
*   **Location:** `docs/content/modules/alignment-specialization/module-composition.md`
*   **Pedagogical Role:** Details loss masks, reward models, optimization penalties, and domain adaptation trade-offs.
*   **Relationship to Learning Path Aim:** Deepens understanding of human preference modeling and specific domain adaptation strategies.

This learning path does not duplicate any of the instructional content or text from the module compositions themselves.

## 4. Learning Path Flow

The learning path structures the following module progression:

1.  **Model Adaptation Fundamentals** (`module-model-adaptation`)
2.  **Alignment & Specialization** (`module-alignment-specialization`)

### Future Expansion

Future modules may extend this path with topics such as Direct Preference Optimization (DPO), safety evaluation red-teaming, or multi-modal vocabulary expansion.

*Note: These future modules and future module stubs are not created or defined in this phase.*

## 5. Module-to-Lesson Trace

The Learning Path includes the following lessons indirectly through its modules:

*   `lesson-fine-tuning-fundamentals` (Fine-Tuning Fundamentals)
*   `lesson-instruction-tuning` (Instruction Tuning)
*   `lesson-peft` (Parameter-Efficient Fine-Tuning (PEFT))
*   `lesson-supervised-fine-tuning` (Supervised Fine-Tuning (SFT))
*   `lesson-rlhf-concepts` (Reinforcement Learning from Human Feedback (RLHF))
*   `lesson-domain-adaptation` (Domain Adaptation and Specialization)

The Learning Path references these lessons through the module compositions. It does not directly own or modify the lessons.

## 6. Lesson-to-Artifact Trace

The Learning Path includes the following Learning Artifacts indirectly through the composed modules and lessons:

*   `artifact-fine-tuning-fundamentals-explanatory-text` (Explanatory Text)
*   `artifact-fine-tuning-fundamentals-visual-intuition` (Visual Intuition)
*   `artifact-fine-tuning-fundamentals-interactive-visualization` (Interactive Visualization)
*   `artifact-fine-tuning-fundamentals-exercise` (Exercise)
*   `artifact-fine-tuning-fundamentals-comparison-table` (Comparison Table)
*   `artifact-instruction-tuning-explanatory-text` (Explanatory Text)
*   `artifact-instruction-tuning-visual-intuition` (Visual Intuition)
*   `artifact-instruction-tuning-interactive-visualization` (Interactive Visualization)
*   `artifact-instruction-tuning-exercise` (Exercise)
*   `artifact-instruction-tuning-comparison-table` (Comparison Table)
*   `artifact-peft-explanatory-text` (Explanatory Text)
*   `artifact-peft-visual-intuition` (Visual Intuition)
*   `artifact-peft-interactive-visualization` (Interactive Visualization)
*   `artifact-peft-exercise` (Exercise)
*   `artifact-peft-comparison-table` (Comparison Table)
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
*   NV-800-C15 — Canonical Foundation Content Pack (Wave 10: Semantic & Instance Segmentation Foundations)
*   NV-800-C16 — Canonical Foundation Content Pack (Wave 11: Transformer Foundations)
*   NV-800-C17 — Canonical Foundation Content Pack (Wave 12: Large Language Model Foundations)

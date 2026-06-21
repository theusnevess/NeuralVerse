---
module_id: "module-model-adaptation"
module_title: "Model Adaptation Fundamentals"
canonical_status: "Draft"
module_type: "Core Module"

lesson_ids:
  - lesson-fine-tuning-fundamentals
  - lesson-instruction-tuning
  - lesson-peft

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
---

# Model Adaptation Fundamentals — Module Composition

## 1. Purpose

This module organizes foundational lessons related to weight adjustments, learning rate schedules, catastrophic forgetting risks, instruction tuning alignments, and Parameter-Efficient Fine-Tuning (PEFT) low-rank factorization (LoRA) mathematics.

It provides an organizational boundary for optimizer parameters, formatted QA target alignments, and low-rank matrix savings without duplicating any instructional content.

## 2. Module Learning Aim

Introduce learners to the foundations of adapting pre-trained Large Language Models (LLMs), including weight adjustments, learning rate schedules, catastrophic forgetting risks, instruction tuning alignments, and Parameter-Efficient Fine-Tuning (PEFT) low-rank factorization (LoRA) mathematics.

This module aims to connect pre-trained updates to task performance, user instructions to target dialogue, and adapter ranks to training efficiency, without claiming or certifying competency mastery.

## 3. Included Lessons

### 3.1 Fine-Tuning Fundamentals

*   **Lesson ID:** `lesson-fine-tuning-fundamentals`
*   **Location:** `docs/content/lessons/fine-tuning-fundamentals/lesson-composition.md`
*   **Pedagogical Role:** Teaches gradient updates on pre-trained checkpoints, learning rate schedules, and forgetting risks.
*   **Relationship to Module Aim:** Fulfills the foundational fine-tuning concepts requirement of the learning aim.

### 3.2 Instruction Tuning

*   **Lesson ID:** `lesson-instruction-tuning`
*   **Location:** `docs/content/lessons/instruction-tuning/lesson-composition.md`
*   **Pedagogical Role:** Details instruction-response templates, raw continuation drift, and conversational assistant formatting.
*   **Relationship to Learning Path Aim:** Fulfills the SFT dialog conversion requirement of the learning aim.

### 3.3 Parameter-Efficient Fine-Tuning (PEFT)

*   **Lesson ID:** `lesson-peft`
*   **Location:** `docs/content/lessons/peft/lesson-composition.md`
*   **Pedagogical Role:** Focuses on parameter savings, frozen parameters matrices, LoRA factorization equations, and dimension rank updates.
*   **Relationship to Learning Path Aim:** Fulfills the PEFT and LoRA efficiency requirement of the learning aim.

This module composition does not duplicate any of the instructional content or text from the lesson compositions themselves.

## 4. Module Composition Flow

The module structures lessons in the following sequence:

1.  **Fine-Tuning Fundamentals** (`lesson-fine-tuning-fundamentals`)
2.  **Instruction Tuning** (`lesson-instruction-tuning`)
3.  **Parameter-Efficient Fine-Tuning (PEFT)** (`lesson-peft`)

### Future Expansion

Future lessons may extend this module with topics such as prefix tuning, prompt tuning configurations, and quantization-aware adapters (QLoRA).

*Note: These future lessons are not created or defined in this phase.*

## 5. Lesson-to-Artifact Trace

The module indirectly includes the following Learning Artifacts through its lessons:

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

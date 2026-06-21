---
learning_path_id: "path-llm-foundations"
learning_path_title: "Large Language Model Foundations"
canonical_status: "Draft"
path_type: "Foundational Learning Path"

module_ids:
  - module-llm-core
  - module-llm-context-behavior

lesson_scope:
  - lesson-llm-overview
  - lesson-autoregressive-generation
  - lesson-prompting-fundamentals
  - lesson-context-windows-long
  - lesson-in-context-learning
  - lesson-hallucinations-reliability

artifact_scope:
  - artifact-llm-overview-explanatory-text
  - artifact-llm-overview-visual-intuition
  - artifact-llm-overview-interactive-visualization
  - artifact-llm-overview-exercise
  - artifact-llm-overview-comparison-table
  - artifact-autoregressive-generation-explanatory-text
  - artifact-autoregressive-generation-visual-intuition
  - artifact-autoregressive-generation-interactive-visualization
  - artifact-autoregressive-generation-exercise
  - artifact-autoregressive-generation-comparison-table
  - artifact-prompting-fundamentals-explanatory-text
  - artifact-prompting-fundamentals-visual-intuition
  - artifact-prompting-fundamentals-interactive-visualization
  - artifact-prompting-fundamentals-exercise
  - artifact-prompting-fundamentals-comparison-table
  - artifact-context-windows-long-explanatory-text
  - artifact-context-windows-long-visual-intuition
  - artifact-context-windows-long-interactive-visualization
  - artifact-context-windows-long-exercise
  - artifact-context-windows-long-comparison-table
  - artifact-in-context-learning-explanatory-text
  - artifact-in-context-learning-visual-intuition
  - artifact-in-context-learning-interactive-visualization
  - artifact-in-context-learning-exercise
  - artifact-in-context-learning-comparison-table
  - artifact-hallucinations-reliability-explanatory-text
  - artifact-hallucinations-reliability-visual-intuition
  - artifact-hallucinations-reliability-interactive-visualization
  - artifact-hallucinations-reliability-exercise
  - artifact-hallucinations-reliability-comparison-table
---

# Large Language Model Foundations — Learning Path Composition

## 1. Purpose

This Learning Path organizes multiple Modules into a coherent, high-level Large Language Model architecture curriculum progression.

It serves as an organizational and navigational guide for learners. The Learning Path does not duplicate, embed, or rewrite the content of the referenced modules, lessons, or learning artifacts.

## 2. Learning Path Aim

Introduce learners to the conceptual foundations of Large Language Models (LLMs), including scaling laws, autoregressive sampling decoding, prompt shaping, KV caching limits, In-Context Learning activation states, and hallucination alignment mitigations.

This path focuses on autoregressive prompt completions, without claiming or certifying competency mastery.

## 3. Included Modules

### 3.1 LLM Core Concepts

*   **Module ID:** `module-llm-core`
*   **Location:** `docs/content/modules/llm-core/module-composition.md`
*   **Pedagogical Role:** Establishes pre-training scaling laws, autoregressive loops, logits adjustments, and zero-shot vs. few-shot prompt shaping.
*   **Relationship to Learning Path Aim:** Satisfies the initial step of the learning path's aim by exposing the learner to core LLM architectures and prompting layouts.

### 3.2 LLM Context & Behavior

*   **Module ID:** `module-llm-context-behavior`
*   **Location:** `docs/content/modules/llm-context-behavior/module-composition.md`
*   **Pedagogical Role:** Details memory complexities, KV Cache sizes, frozen parameters activation paths, and reliability diagnostics.
*   **Relationship to Learning Path Aim:** Deepens understanding of context limitations, implicit optimization processes, and generation truth evaluations.

This learning path does not duplicate any of the instructional content or text from the module compositions themselves.

## 4. Learning Path Flow

The learning path structures the following module progression:

1.  **LLM Core Concepts** (`module-llm-core`)
2.  **LLM Context & Behavior** (`module-llm-context-behavior`)

### Future Expansion

Future modules may extend this path with topics such as Instruction Tuning, RLHF alignment, agent tool execution, and multimodal architectures.

*Note: These future modules and future module stubs are not created or defined in this phase.*

## 5. Module-to-Lesson Trace

The Learning Path includes the following lessons indirectly through its modules:

*   `lesson-llm-overview` (Large Language Models Overview)
*   `lesson-autoregressive-generation` (Autoregressive Generation)
*   `lesson-prompting-fundamentals` (Prompting Fundamentals)
*   `lesson-context-windows-long` (Context Windows and Long Context)
*   `lesson-in-context-learning` (In-Context Learning)
*   `lesson-hallucinations-reliability` (Hallucinations and Reliability)

The Learning Path references these lessons through the module compositions. It does not directly own or modify the lessons.

## 6. Lesson-to-Artifact Trace

The Learning Path includes the following Learning Artifacts indirectly through the composed modules and lessons:

*   `artifact-llm-overview-explanatory-text` (Explanatory Text)
*   `artifact-llm-overview-visual-intuition` (Visual Intuition)
*   `artifact-llm-overview-interactive-visualization` (Interactive Visualization)
*   `artifact-llm-overview-exercise` (Exercise)
*   `artifact-llm-overview-comparison-table` (Comparison Table)
*   `artifact-autoregressive-generation-explanatory-text` (Explanatory Text)
*   `artifact-autoregressive-generation-visual-intuition` (Visual Intuition)
*   `artifact-autoregressive-generation-interactive-visualization` (Interactive Visualization)
*   `artifact-autoregressive-generation-exercise` (Exercise)
*   `artifact-autoregressive-generation-comparison-table` (Comparison Table)
*   `artifact-prompting-fundamentals-explanatory-text` (Explanatory Text)
*   `artifact-prompting-fundamentals-visual-intuition` (Visual Intuition)
*   `artifact-prompting-fundamentals-interactive-visualization` (Interactive Visualization)
*   `artifact-prompting-fundamentals-exercise` (Exercise)
*   `artifact-prompting-fundamentals-comparison-table` (Comparison Table)
*   `artifact-context-windows-long-explanatory-text` (Explanatory Text)
*   `artifact-context-windows-long-visual-intuition` (Visual Intuition)
*   `artifact-context-windows-long-interactive-visualization` (Interactive Visualization)
*   `artifact-context-windows-long-exercise` (Exercise)
*   `artifact-context-windows-long-comparison-table` (Comparison Table)
*   `artifact-in-context-learning-explanatory-text` (Explanatory Text)
*   `artifact-in-context-learning-visual-intuition` (Visual Intuition)
*   `artifact-in-context-learning-interactive-visualization` (Interactive Visualization)
*   `artifact-in-context-learning-exercise` (Exercise)
*   `artifact-in-context-learning-comparison-table` (Comparison Table)
*   `artifact-hallucinations-reliability-explanatory-text` (Explanatory Text)
*   `artifact-hallucinations-reliability-visual-intuition` (Visual Intuition)
*   `artifact-hallucinations-reliability-interactive-visualization` (Interactive Visualization)
*   `artifact-hallucinations-reliability-exercise` (Exercise)
*   `artifact-hallucinations-reliability-comparison-table` (Comparison Table)

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

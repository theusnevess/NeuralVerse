---
module_id: "module-llm-core"
module_title: "LLM Core Concepts"
canonical_status: "Draft"
module_type: "Core Module"

lesson_ids:
  - lesson-llm-overview
  - lesson-autoregressive-generation
  - lesson-prompting-fundamentals

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
---

# LLM Core Concepts — Module Composition

## 1. Purpose

This module organizes foundational lessons related to Large Language Model scaling laws, token-by-token decoding generation, and prompt block layouts.

It provides an organizational boundary for compute allocations, sampling parameter curves, and instructional context templates without duplicating any instructional content.

## 2. Module Learning Aim

Introduce learners to the architectural core of Large Language Models (LLMs), including self-supervised pre-training, Kaplan and Chinchilla scaling laws, token-by-token autoregressive generation loops, temperature/top-k/top-p decoding parameter controls, and prompt shaping mechanics.

This module aims to connect model size to emergent capabilities, target logits to sampling candidates, and prompt examples to target styles, without claiming or certifying competency mastery.

## 3. Included Lessons

### 3.1 Large Language Models Overview

*   **Lesson ID:** `lesson-llm-overview`
*   **Location:** `docs/content/lessons/llm-overview/lesson-composition.md`
*   **Pedagogical Role:** Teaches self-supervised pre-training objectives, scaling properties, and emergent capabilities.
*   **Relationship to Module Aim:** Fulfills the foundational overview requirement of the learning aim.

### 3.2 Autoregressive Generation

*   **Lesson ID:** `lesson-autoregressive-generation`
*   **Location:** `docs/content/lessons/autoregressive-generation/lesson-composition.md`
*   **Pedagogical Role:** Details autoregressive feedback loops, probability outputs, logits adjustments, and decoding strategies (greedy vs. sample-based).
*   **Relationship to Learning Path Aim:** Fulfills the generation decoding mechanics requirement of the learning aim.

### 3.3 Prompting Fundamentals

*   **Lesson ID:** `lesson-prompting-fundamentals`
*   **Location:** `docs/content/lessons/prompting-fundamentals/lesson-composition.md`
*   **Pedagogical Role:** Focuses on prompt blocks, zero-shot vs. few-shot context patterns, and Chain-of-Thought (CoT) reasoning triggers.
*   **Relationship to Learning Path Aim:** Fulfills the prompt shaping requirement of the learning aim.

This module composition does not duplicate any of the instructional content or text from the lesson compositions themselves.

## 4. Module Composition Flow

The module structures lessons in the following sequence:

1.  **Large Language Models Overview** (`lesson-llm-overview`)
2.  **Autoregressive Generation** (`lesson-autoregressive-generation`)
3.  **Prompting Fundamentals** (`lesson-prompting-fundamentals`)

### Future Expansion

Future lessons may extend this module with topics such as pre-training datasets token filtering, compute-optimal training dynamics, and basic reinforcement learning alignment objectives.

*Note: These future lessons are not created or defined in this phase.*

## 5. Lesson-to-Artifact Trace

The module indirectly includes the following Learning Artifacts through its lessons:

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

- [.] Lesson references validated.
- [.] Lesson content not duplicated.
- [.] Artifact content not duplicated.
- [.] Module aim aligned with included lessons.
- [.] Evidence boundary preserved.
- [.] No assessment logic introduced.
- [.] No mastery claims introduced.
- [.] Future expansion does not create undeclared lessons.
- [.] Reuse implications documented.

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

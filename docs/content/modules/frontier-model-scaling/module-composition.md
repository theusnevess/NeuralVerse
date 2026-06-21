---
module_id: "module-frontier-model-scaling"
module_title: "Frontier Model Scaling"
canonical_status: "Reviewed"
module_type: "Core Module"

lesson_ids:
  - lesson-scaling-laws-and-emergent-behavior
  - lesson-reasoning-models-and-test-time-compute
  - lesson-mixture-of-experts-architectures

artifact_scope:
  - artifact-scaling-laws-and-emergent-behavior-explanatory-text
  - artifact-scaling-laws-and-emergent-behavior-visual-intuition
  - artifact-scaling-laws-and-emergent-behavior-interactive-visualization
  - artifact-scaling-laws-and-emergent-behavior-exercise
  - artifact-scaling-laws-and-emergent-behavior-comparison-table
  - artifact-reasoning-models-and-test-time-compute-explanatory-text
  - artifact-reasoning-models-and-test-time-compute-visual-intuition
  - artifact-reasoning-models-and-test-time-compute-interactive-visualization
  - artifact-reasoning-models-and-test-time-compute-exercise
  - artifact-reasoning-models-and-test-time-compute-comparison-table
  - artifact-mixture-of-experts-architectures-explanatory-text
  - artifact-mixture-of-experts-architectures-visual-intuition
  - artifact-mixture-of-experts-architectures-interactive-visualization
  - artifact-mixture-of-experts-architectures-exercise
  - artifact-mixture-of-experts-architectures-comparison-table
---

# Frontier Model Scaling — Module Composition

## 1. Purpose

This module organizes lessons covering frontier model scaling, including scaling laws and emergent behavior, reasoning models and test-time compute, and mixture-of-experts architectures.

It provides an organizational boundary for scaling taxonomies, reasoning paradigms, and sparse computation strategies without duplicating any instructional content.

## 2. Module Learning Aim

Introduce learners to frontier research in model scaling, including scaling laws relating parameters, data, and compute to model capabilities, reasoning models that allocate additional computation during inference, and mixture-of-experts architectures that decouple parameter count from computational cost.

This module aims to connect scaling theory to observed emergent abilities, inference-time reasoning techniques to compute-performance trade-offs, and sparse routing to efficient model deployment, without claiming or certifying competency mastery.

## 3. Included Lessons

### 3.1 Scaling Laws and Emergent Behavior

*   **Lesson ID:** `lesson-scaling-laws-and-emergent-behavior`
*   **Location:** `docs/content/lessons/scaling-laws-and-emergent-behavior/lesson-composition.md`
*   **Pedagogical Role:** Teaches power-law scaling of loss with parameters, data, and compute, emergent abilities in large models, and compute-optimal training strategies.
*   **Relationship to Module Aim:** Fulfills the scaling laws and emergent behavior requirement of the learning aim.

### 3.2 Reasoning Models and Test-Time Compute

*   **Lesson ID:** `lesson-reasoning-models-and-test-time-compute`
*   **Location:** `docs/content/lessons/reasoning-models-and-test-time-compute/lesson-composition.md`
*   **Pedagogical Role:** Details chain-of-thought prompting, search-based reasoning (e.g., tree-of-thought), inference-compute scaling, and the compute-performance Pareto frontier at inference time.
*   **Relationship to Module Aim:** Fulfills the reasoning models and test-time compute requirement of the learning aim.

### 3.3 Mixture of Experts Architectures

*   **Lesson ID:** `lesson-mixture-of-experts-architectures`
*   **Location:** `docs/content/lessons/mixture-of-experts-architectures/lesson-composition.md`
*   **Pedagogical Role:** Focuses on sparse routing mechanisms, expert specialization, load balancing, and computational efficiency gains from MoE designs.
*   **Relationship to Module Aim:** Fulfills the mixture-of-experts architectures requirement of the learning aim.

This module composition does not duplicate any of the instructional content or text from the lesson compositions themselves.

## 4. Module Composition Flow

The module structures lessons in the following sequence:

1.  **Scaling Laws and Emergent Behavior** (`lesson-scaling-laws-and-emergent-behavior`)
2.  **Reasoning Models and Test-Time Compute** (`lesson-reasoning-models-and-test-time-compute`)
3.  **Mixture of Experts Architectures** (`lesson-mixture-of-experts-architectures`)

### Future Expansion

Future lessons may extend this module with topics such as multi-modal scaling, sparse attention mechanisms, or adaptive compute allocation.

*Note: These future lessons are not created or defined in this phase.*

## 5. Lesson-to-Artifact Trace

The module indirectly includes the following Learning Artifacts through its lessons:

*   `artifact-scaling-laws-and-emergent-behavior-explanatory-text` (Explanatory Text)
*   `artifact-scaling-laws-and-emergent-behavior-visual-intuition` (Visual Intuition)
*   `artifact-scaling-laws-and-emergent-behavior-interactive-visualization` (Interactive Visualization)
*   `artifact-scaling-laws-and-emergent-behavior-exercise` (Exercise)
*   `artifact-scaling-laws-and-emergent-behavior-comparison-table` (Comparison Table)
*   `artifact-reasoning-models-and-test-time-compute-explanatory-text` (Explanatory Text)
*   `artifact-reasoning-models-and-test-time-compute-visual-intuition` (Visual Intuition)
*   `artifact-reasoning-models-and-test-time-compute-interactive-visualization` (Interactive Visualization)
*   `artifact-reasoning-models-and-test-time-compute-exercise` (Exercise)
*   `artifact-reasoning-models-and-test-time-compute-comparison-table` (Comparison Table)
*   `artifact-mixture-of-experts-architectures-explanatory-text` (Explanatory Text)
*   `artifact-mixture-of-experts-architectures-visual-intuition` (Visual Intuition)
*   `artifact-mixture-of-experts-architectures-interactive-visualization` (Interactive Visualization)
*   `artifact-mixture-of-experts-architectures-exercise` (Exercise)
*   `artifact-mixture-of-experts-architectures-comparison-table` (Comparison Table)

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
*   NV-800-C18 — Canonical Foundation Content Pack (Wave 13: Fine-Tuning & Adaptation)
*   NV-800-C19 — Canonical Foundation Content Pack (Wave 14: AI Agents & Tool Use)
*   NV-800-C20 — Canonical Foundation Content Pack (Wave 15: Multimodal AI Foundations)
*   NV-800-C21 — Canonical Foundation Content Pack (Wave 16: Advanced RAG Foundations)
*   NV-800-C22 — Canonical Foundation Content Pack (Wave 17: LLM Evaluation & Benchmarking)
*   NV-800-C23 — Canonical Foundation Content Pack (Wave 18: AI Safety, Alignment & Guardrails)
*   NV-800-C24 — Canonical Foundation Content Pack (Wave 19: Production AI Systems & MLOps)
*   NV-800-C25 — Canonical Foundation Content Pack (Wave 20: AI Research & Frontier Topics)

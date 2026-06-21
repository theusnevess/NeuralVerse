---
module_id: "module-alignment-guardrails"
module_title: "Alignment and Guardrails"
canonical_status: "Draft"
module_type: "Core Module"

lesson_ids:
  - lesson-constitutional-ai
  - lesson-guardrail-architectures
  - lesson-policy-enforcement-output-validation

artifact_scope:
  - artifact-constitutional-ai-explanatory-text
  - artifact-constitutional-ai-visual-intuition
  - artifact-constitutional-ai-interactive-visualization
  - artifact-constitutional-ai-exercise
  - artifact-constitutional-ai-comparison-table
  - artifact-guardrail-architectures-explanatory-text
  - artifact-guardrail-architectures-visual-intuition
  - artifact-guardrail-architectures-interactive-visualization
  - artifact-guardrail-architectures-exercise
  - artifact-guardrail-architectures-comparison-table
  - artifact-policy-enforcement-output-validation-explanatory-text
  - artifact-policy-enforcement-output-validation-visual-intuition
  - artifact-policy-enforcement-output-validation-interactive-visualization
  - artifact-policy-enforcement-output-validation-exercise
  - artifact-policy-enforcement-output-validation-comparison-table
---

# Alignment and Guardrails — Module Composition

## 1. Purpose

This module organizes lessons covering behavioral alignment and operational guardrails for LLM systems, focusing on Constitutional AI principles and self-critique mechanisms, multi-layer guardrail architectures for production systems, and policy enforcement and output validation frameworks.

It provides an organizational boundary for alignment methodologies, guardrail taxonomies, and validation strategies without duplicating any instructional content.

## 2. Module Learning Aim

Introduce learners to alignment and guardrail approaches for LLMs, including constitutional principles for model behavior, layered guardrail architectures covering input to post-processing, and comprehensive policy enforcement and output validation strategies.

This module aims to connect alignment principles to guardrail implementation, attack surfaces to defense layers, and output generation to validation gates, without claiming or certifying competency mastery.

## 3. Included Lessons

### 3.1 Constitutional AI

*   **Lesson ID:** `lesson-constitutional-ai`
*   **Location:** `docs/content/lessons/constitutional-ai/lesson-composition.md`
*   **Pedagogical Role:** Teaches constitutional principles, self-critique and revision cycles, RLCAI, and comparison with RLHF alignment.
*   **Relationship to Module Aim:** Fulfills the behavioral alignment requirement of the learning aim.

### 3.2 Guardrail Architectures

*   **Lesson ID:** `lesson-guardrail-architectures`
*   **Location:** `docs/content/lessons/guardrail-architectures/lesson-composition.md`
*   **Pedagogical Role:** Details multi-layer guardrail systems spanning input pre-processing, orchestration, tool use, context, generation, and post-processing.
*   **Relationship to Module Aim:** Fulfills the guardrail architecture requirement of the learning aim.

### 3.3 Policy Enforcement and Output Validation

*   **Lesson ID:** `lesson-policy-enforcement-output-validation`
*   **Location:** `docs/content/lessons/policy-enforcement-output-validation/lesson-composition.md`
*   **Pedagogical Role:** Focuses on structural and semantic validation, declarative policies, deterministic and model-based filters, approval chains, and fail-open vs. fail-closed strategies.
*   **Relationship to Module Aim:** Fulfills the policy enforcement and validation requirement of the learning aim.

This module composition does not duplicate any of the instructional content or text from the lesson compositions themselves.

## 4. Module Composition Flow

The module structures lessons in the following sequence:

1.  **Constitutional AI** (`lesson-constitutional-ai`)
2.  **Guardrail Architectures** (`lesson-guardrail-architectures`)
3.  **Policy Enforcement and Output Validation** (`lesson-policy-enforcement-output-validation`)

### Future Expansion

Future lessons may extend this module with topics such as red-teaming frameworks, continuous alignment monitoring, or multi-tenant policy isolation.

*Note: These future lessons are not created or defined in this phase.*

## 5. Lesson-to-Artifact Trace

The module indirectly includes the following Learning Artifacts through its lessons:

*   `artifact-constitutional-ai-explanatory-text` (Explanatory Text)
*   `artifact-constitutional-ai-visual-intuition` (Visual Intuition)
*   `artifact-constitutional-ai-interactive-visualization` (Interactive Visualization)
*   `artifact-constitutional-ai-exercise` (Exercise)
*   `artifact-constitutional-ai-comparison-table` (Comparison Table)
*   `artifact-guardrail-architectures-explanatory-text` (Explanatory Text)
*   `artifact-guardrail-architectures-visual-intuition` (Visual Intuition)
*   `artifact-guardrail-architectures-interactive-visualization` (Interactive Visualization)
*   `artifact-guardrail-architectures-exercise` (Exercise)
*   `artifact-guardrail-architectures-comparison-table` (Comparison Table)
*   `artifact-policy-enforcement-output-validation-explanatory-text` (Explanatory Text)
*   `artifact-policy-enforcement-output-validation-visual-intuition` (Visual Intuition)
*   `artifact-policy-enforcement-output-validation-interactive-visualization` (Interactive Visualization)
*   `artifact-policy-enforcement-output-validation-exercise` (Exercise)
*   `artifact-policy-enforcement-output-validation-comparison-table` (Comparison Table)

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

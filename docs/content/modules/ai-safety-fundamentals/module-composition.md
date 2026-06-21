---
module_id: "module-ai-safety-fundamentals"
module_title: "AI Safety Fundamentals"
canonical_status: "Draft"
module_type: "Core Module"

lesson_ids:
  - lesson-prompt-injection
  - lesson-jailbreak-techniques
  - lesson-grounding-verification-strategies

artifact_scope:
  - artifact-prompt-injection-explanatory-text
  - artifact-prompt-injection-visual-intuition
  - artifact-prompt-injection-interactive-visualization
  - artifact-prompt-injection-exercise
  - artifact-prompt-injection-comparison-table
  - artifact-jailbreak-techniques-explanatory-text
  - artifact-jailbreak-techniques-visual-intuition
  - artifact-jailbreak-techniques-interactive-visualization
  - artifact-jailbreak-techniques-exercise
  - artifact-jailbreak-techniques-comparison-table
  - artifact-grounding-verification-strategies-explanatory-text
  - artifact-grounding-verification-strategies-visual-intuition
  - artifact-grounding-verification-strategies-interactive-visualization
  - artifact-grounding-verification-strategies-exercise
  - artifact-grounding-verification-strategies-comparison-table
---

# AI Safety Fundamentals — Module Composition

## 1. Purpose

This module organizes lessons covering the foundational concepts of AI safety as applied to LLM systems, focusing on prompt injection attacks and defenses, jailbreak techniques and refusal bypass, and grounding and verification strategies for ensuring response reliability.

It provides an organizational boundary for attack taxonomies, defense taxonomies, and verification frameworks without duplicating any instructional content.

## 2. Module Learning Aim

Introduce learners to core AI safety concepts for LLMs, including the distinction between prompt injection and jailbreak attacks, layered defense strategies, and operational grounding and verification techniques for improving output reliability.

This module aims to connect attack vectors to defense mechanisms, alignment vulnerabilities to jailbreak categories, and ungrounded outputs to verification strategies, without claiming or certifying competency mastery.

## 3. Included Lessons

### 3.1 Prompt Injection

*   **Lesson ID:** `lesson-prompt-injection`
*   **Location:** `docs/content/lessons/prompt-injection/lesson-composition.md`
*   **Pedagogical Role:** Teaches direct and indirect prompt injection, instruction boundary separation, and structural defense mechanisms.
*   **Relationship to Module Aim:** Fulfills the prompt injection awareness requirement of the learning aim.

### 3.2 Jailbreak Techniques

*   **Lesson ID:** `lesson-jailbreak-techniques`
*   **Location:** `docs/content/lessons/jailbreak-techniques/lesson-composition.md`
*   **Pedagogical Role:** Details jailbreak categories, refusal bypass patterns, and defense in depth against adversarial alignment bypass.
*   **Relationship to Module Aim:** Fulfills the jailbreak awareness requirement of the learning aim.

### 3.3 Grounding and Verification Strategies

*   **Lesson ID:** `lesson-grounding-verification-strategies`
*   **Location:** `docs/content/lessons/grounding-verification-strategies/lesson-composition.md`
*   **Pedagogical Role:** Focuses on external source grounding, NLI-based verification, consistency checks, confidence estimation, and citation-aware generation.
*   **Relationship to Module Aim:** Fulfills the grounding and verification requirement of the learning aim.

This module composition does not duplicate any of the instructional content or text from the lesson compositions themselves.

## 4. Module Composition Flow

The module structures lessons in the following sequence:

1.  **Prompt Injection** (`lesson-prompt-injection`)
2.  **Jailbreak Techniques** (`lesson-jailbreak-techniques`)
3.  **Grounding and Verification Strategies** (`lesson-grounding-verification-strategies`)

### Future Expansion

Future lessons may extend this module with topics such as adversarial robustness testing, data poisoning defenses, or multi-modal safety evaluation.

*Note: These future lessons are not created or defined in this phase.*

## 5. Lesson-to-Artifact Trace

The module indirectly includes the following Learning Artifacts through its lessons:

*   `artifact-prompt-injection-explanatory-text` (Explanatory Text)
*   `artifact-prompt-injection-visual-intuition` (Visual Intuition)
*   `artifact-prompt-injection-interactive-visualization` (Interactive Visualization)
*   `artifact-prompt-injection-exercise` (Exercise)
*   `artifact-prompt-injection-comparison-table` (Comparison Table)
*   `artifact-jailbreak-techniques-explanatory-text` (Explanatory Text)
*   `artifact-jailbreak-techniques-visual-intuition` (Visual Intuition)
*   `artifact-jailbreak-techniques-interactive-visualization` (Interactive Visualization)
*   `artifact-jailbreak-techniques-exercise` (Exercise)
*   `artifact-jailbreak-techniques-comparison-table` (Comparison Table)
*   `artifact-grounding-verification-strategies-explanatory-text` (Explanatory Text)
*   `artifact-grounding-verification-strategies-visual-intuition` (Visual Intuition)
*   `artifact-grounding-verification-strategies-interactive-visualization` (Interactive Visualization)
*   `artifact-grounding-verification-strategies-exercise` (Exercise)
*   `artifact-grounding-verification-strategies-comparison-table` (Comparison Table)

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

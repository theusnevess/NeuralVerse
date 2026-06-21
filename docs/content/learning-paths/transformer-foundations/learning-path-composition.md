---
learning_path_id: "path-transformer-foundations"
learning_path_title: "Transformer Foundations"
canonical_status: "Draft"
path_type: "Foundational Learning Path"

module_ids:
  - module-transformer-fundamentals
  - module-sequence-representation

lesson_scope:
  - lesson-transformer-overview
  - lesson-self-attention
  - lesson-multi-head-attention
  - lesson-positional-encoding
  - lesson-encoder-vs-decoder
  - lesson-tokenization-representations

artifact_scope:
  - artifact-transformer-overview-explanatory-text
  - artifact-transformer-overview-visual-intuition
  - artifact-transformer-overview-interactive-visualization
  - artifact-transformer-overview-exercise
  - artifact-transformer-overview-comparison-table
  - artifact-self-attention-explanatory-text
  - artifact-self-attention-visual-intuition
  - artifact-self-attention-interactive-visualization
  - artifact-self-attention-exercise
  - artifact-self-attention-comparison-table
  - artifact-multi-head-attention-explanatory-text
  - artifact-multi-head-attention-visual-intuition
  - artifact-multi-head-attention-interactive-visualization
  - artifact-multi-head-attention-exercise
  - artifact-multi-head-attention-comparison-table
  - artifact-positional-encoding-explanatory-text
  - artifact-positional-encoding-visual-intuition
  - artifact-positional-encoding-interactive-visualization
  - artifact-positional-encoding-exercise
  - artifact-positional-encoding-comparison-table
  - artifact-encoder-vs-decoder-explanatory-text
  - artifact-encoder-vs-decoder-visual-intuition
  - artifact-encoder-vs-decoder-interactive-visualization
  - artifact-encoder-vs-decoder-exercise
  - artifact-encoder-vs-decoder-comparison-table
  - artifact-tokenization-representations-explanatory-text
  - artifact-tokenization-representations-visual-intuition
  - artifact-tokenization-representations-interactive-visualization
  - artifact-tokenization-representations-exercise
  - artifact-tokenization-representations-comparison-table
---

# Transformer Foundations — Learning Path Composition

## 1. Purpose

This Learning Path organizes multiple Modules into a coherent, high-level Transformer architecture curriculum progression.

It serves as an organizational and navigational guide for learners. The Learning Path does not duplicate, embed, or rewrite the content of the referenced modules, lessons, or learning artifacts.

## 2. Learning Path Aim

Introduce learners to the conceptual foundations of the Transformer architecture, including attention parallelization, scaled Query-Key-Value operations, multi-head attention subspaces, sinusoidal positional encoding, encoder/decoder causal masking, and subword tokenization representations.

This path focuses on attention-based sequence routing, without claiming or certifying competency mastery.

## 3. Included Modules

### 3.1 Transformer Fundamentals

*   **Module ID:** `module-transformer-fundamentals`
*   **Location:** `docs/content/modules/transformer-fundamentals/module-composition.md`
*   **Pedagogical Role:** Establishes parallel pipelines, Query-Key-Value similarity matrices, Softmax scalings, and multi-head subspaces.
*   **Relationship to Learning Path Aim:** Satisfies the initial step of the learning path's aim by exposing the learner to scaled dot-product attention and multi-head concatenations.

### 3.2 Sequence Representation

*   **Module ID:** `module-sequence-representation`
*   **Location:** `docs/content/modules/sequence-representation/module-composition.md`
*   **Pedagogical Role:** Details permutation invariance, sinusoidal formulas, causal masks, encoder/decoder layouts, and subword token mappings.
*   **Relationship to Learning Path Aim:** Deepens understanding of sequence ordering, autoregressive generation, and subword token dictionary vector embeddings.

This learning path does not duplicate any of the instructional content or text from the module compositions themselves.

## 4. Learning Path Flow

The learning path structures the following module progression:

1.  **Transformer Fundamentals** (`module-transformer-fundamentals`)
2.  **Sequence Representation** (`module-sequence-representation`)

### Future Expansion

Future modules may extend this path with topics such as Feed-Forward Networks (FFN), Layer Normalization schemes (Pre-LN vs. Post-LN), or residual learning connection variations.

*Note: These future modules and future module stubs are not created or defined in this phase.*

## 5. Module-to-Lesson Trace

The Learning Path includes the following lessons indirectly through its modules:

*   `lesson-transformer-overview` (Transformer Architecture Overview)
*   `lesson-self-attention` (Self-Attention Mechanism)
*   `lesson-multi-head-attention` (Multi-Head Attention)
*   `lesson-positional-encoding` (Positional Encoding)
*   `lesson-encoder-vs-decoder` (Encoder vs Decoder Architectures)
*   `lesson-tokenization-representations` (Tokenization and Token Representations)

The Learning Path references these lessons through the module compositions. It does not directly own or modify the lessons.

## 6. Lesson-to-Artifact Trace

The Learning Path includes the following Learning Artifacts indirectly through the composed modules and lessons:

*   `artifact-transformer-overview-explanatory-text` (Explanatory Text)
*   `artifact-transformer-overview-visual-intuition` (Visual Intuition)
*   `artifact-transformer-overview-interactive-visualization` (Interactive Visualization)
*   `artifact-transformer-overview-exercise` (Exercise)
*   `artifact-transformer-overview-comparison-table` (Comparison Table)
*   `artifact-self-attention-explanatory-text` (Explanatory Text)
*   `artifact-self-attention-visual-intuition` (Visual Intuition)
*   `artifact-self-attention-interactive-visualization` (Interactive Visualization)
*   `artifact-self-attention-exercise` (Exercise)
*   `artifact-self-attention-comparison-table` (Comparison Table)
*   `artifact-multi-head-attention-explanatory-text` (Explanatory Text)
*   `artifact-multi-head-attention-visual-intuition` (Visual Intuition)
*   `artifact-multi-head-attention-interactive-visualization` (Interactive Visualization)
*   `artifact-multi-head-attention-exercise` (Exercise)
*   `artifact-multi-head-attention-comparison-table` (Comparison Table)
*   `artifact-positional-encoding-explanatory-text` (Explanatory Text)
*   `artifact-positional-encoding-visual-intuition` (Visual Intuition)
*   `artifact-positional-encoding-interactive-visualization` (Interactive Visualization)
*   `artifact-positional-encoding-exercise` (Exercise)
*   `artifact-positional-encoding-comparison-table` (Comparison Table)
*   `artifact-encoder-vs-decoder-explanatory-text` (Explanatory Text)
*   `artifact-encoder-vs-decoder-visual-intuition` (Visual Intuition)
*   `artifact-encoder-vs-decoder-interactive-visualization` (Interactive Visualization)
*   `artifact-encoder-vs-decoder-exercise` (Exercise)
*   `artifact-encoder-vs-decoder-comparison-table` (Comparison Table)
*   `artifact-tokenization-representations-explanatory-text` (Explanatory Text)
*   `artifact-tokenization-representations-visual-intuition` (Visual Intuition)
*   `artifact-tokenization-representations-interactive-visualization` (Interactive Visualization)
*   `artifact-tokenization-representations-exercise` (Exercise)
*   `artifact-tokenization-representations-comparison-table` (Comparison Table)

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

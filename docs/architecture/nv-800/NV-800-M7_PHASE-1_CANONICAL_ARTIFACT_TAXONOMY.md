# NV-800-M7 — Canonical Learning Artifact Architecture
# Phase 1 — Canonical Artifact Taxonomy

## 1. Status

CANONICAL_PHASE_1_APPROVED.

This document defines the Phase 1 canonical taxonomy for NeuralVerse Learning Artifacts.

It is an architectural taxonomy document. It does not define full artifact schemas, lifecycle states, reuse semantics, dependency graph rules, metadata standards, scoring rules, mastery thresholds, UI components, or implementation details.

## 2. Purpose

The purpose of this phase is to establish the official vocabulary for instructional components used by NeuralVerse lessons.

The taxonomy applies across:

* Mathematics;
* Statistics;
* Programming;
* Machine Learning;
* Deep Learning;
* Computer Vision;
* LLM Engineering;
* AI Agents;
* MLOps;
* Scientific Research.

This document defines canonical artifact families and artifact types. Detailed contracts are deferred to Phase 2.

## 3. Canonical Foundations

This taxonomy extends the following immutable foundations:

* NV-800-M0 — Canonical Didactic Vision.
* NV-800-M1 — Competency, Mastery and Readiness Architecture.
* NV-800-M2 — Unified Competency Graph.
* NV-800-M3 — Competency Evidence and Mastery Signals.
* NV-800-M4 — Canonical Assessment Architecture.
* NV-800-M5 — Canonical Lesson Architecture.
* NV-800-M6 — Canonical Module & Learning Path Architecture.

This document does not redefine those foundations.

## 4. Core Principle

Lessons are orchestrated learning experiences.

Learning Artifacts are reusable instructional components.

A lesson is not a random sequence of blocks. A lesson is a governed composition of artifacts arranged to support motivation, intuition, explanation, experimentation, practice, reflection, reference, and extension.

## 5. Boundary with Evidence and Assessment

The boundary is normative:

Learning Artifacts support learning.

Assessments generate Competency Evidence.

Competency Evidence determines Mastery.

Learning Artifacts never certify Mastery by themselves.

An artifact may prepare a learner for assessment, reveal informal readiness signals, or support feedback. It does not become evidence-producing unless it is explicitly governed by NV-800-M4 assessment rules.

This taxonomy must not be used to classify assessments as ordinary learning artifacts. Assessments belong to NV-800-M4. Competency Evidence belongs to NV-800-M3.

## 6. Definition of Learning Artifact

A Learning Artifact is a reusable instructional component that supports learner understanding, exploration, practice, recall, reflection, decision-making, or professional transfer.

A Learning Artifact is classified by pedagogical function, not by media format, file type, implementation technology, or UI presentation.

For example, a diagram may function as Visual Intuition when it develops conceptual understanding. A diagram may also appear inside a Professional Guide when it supports later recall or professional execution. Its artifact type is determined by what it does for learning.

## 7. Canonical Artifact Families

The canonical top-level families are:

1. Instruction Artifacts.
2. Interactive Artifacts.
3. Practice Artifacts.
4. Reference Artifacts.

These families are exhaustive for Phase 1. Future phases may define subtypes and contracts, but they must preserve this family structure unless a later architecture decision explicitly supersedes it.

## 8. Instruction Artifacts

### Purpose

Instruction Artifacts explain, model, derive, clarify, or contextualize concepts.

They are used to help learners build understanding. They do not by themselves create mastery evidence.

### Learning Role

Instruction Artifacts support motivation, intuition, explanation, formalization, and conceptual clarification.

### What They May Contain

Instruction Artifacts may contain text, diagrams, symbolic reasoning, conceptual examples, engineering commentary, domain context, or visual explanation.

### What They Must Not Contain

Instruction Artifacts must not contain official mastery scoring, assessment grading, mastery thresholds, or certification logic.

### Relationship to Lessons

Lessons use Instruction Artifacts to establish understanding before learners manipulate, practice, reflect, or apply a concept.

### Relationship to Assessments

Instruction Artifacts may prepare learners for assessments, but they are not assessments.

### Canonical Artifact Types

#### Explanatory Text

Definition: A written explanation that introduces, clarifies, or connects a concept.

Pedagogical purpose: Build conceptual understanding through precise language and structured reasoning.

Typical use cases: Concept introduction, motivation, clarification, limitation framing, transition between lesson moments.

Allowed domains: All NeuralVerse domains.

Example usage context: Explaining why gradient descent is needed before showing its mathematical update rule.

Non-goals: It is not a quiz, score, proof of mastery, or full reference manual.

#### Visual Intuition

Definition: A visual artifact that makes an abstract concept easier to perceive or reason about.

Pedagogical purpose: Develop intuition before or alongside formal explanation.

Typical use cases: Geometry of vectors, model behavior, optimization landscapes, attention patterns, data flow, system boundaries.

Allowed domains: All NeuralVerse domains.

Example usage context: Showing how embeddings cluster semantically before introducing vector similarity metrics.

Non-goals: It is not decoration, a branding illustration, or a substitute for conceptual explanation.

#### Mathematical Derivation

Definition: A structured derivation that explains how a mathematical result, expression, or algorithmic rule is obtained.

Pedagogical purpose: Connect intuition to formal reasoning and reveal why equations are valid.

Typical use cases: Loss gradients, probability identities, linear algebra transformations, optimization updates, statistical estimators.

Allowed domains: All NeuralVerse domains where mathematical reasoning is relevant.

Example usage context: Deriving the gradient of mean squared error after learners understand the prediction error concept.

Non-goals: It is not a symbolic dump, proof theater, or assessment of mathematical mastery.

#### Engineering Note

Definition: A concise instructional note that explains practical engineering implications, trade-offs, or implementation concerns.

Pedagogical purpose: Connect theory to professional judgment and real-world constraints.

Typical use cases: Latency trade-offs, memory constraints, deployment concerns, numerical stability, data quality warnings.

Allowed domains: All NeuralVerse domains.

Example usage context: Explaining why batch size choices affect memory use and training stability.

Non-goals: It is not a full production checklist, assessment rubric, or implementation contract.

## 9. Interactive Artifacts

### Purpose

Interactive Artifacts allow learners to manipulate, observe, simulate, execute, or explore a concept.

They support active learning and experimentation. They may prepare learners for assessments, but they are not assessments unless explicitly wrapped by assessment logic.

### Learning Role

Interactive Artifacts support exploration, experimentation, readiness awareness, and cause-effect understanding.

### What They May Contain

Interactive Artifacts may contain controls, visual outputs, executable cells, parameter changes, simulations, immediate feedback, or guided checkpoints.

### What They Must Not Contain

Interactive Artifacts must not contain official mastery decisions unless governed as assessments by NV-800-M4.

### Relationship to Lessons

Lessons use Interactive Artifacts to let learners observe consequences and test intuition.

### Relationship to Assessments

Interactive Artifacts may produce informal feedback. They produce official Competency Evidence only if governed as assessments.

### Canonical Artifact Types

#### Interactive Visualization

Definition: An interactive representation that lets learners manipulate visual parameters or observe conceptual behavior.

Pedagogical purpose: Make hidden relationships visible and support intuitive experimentation.

Typical use cases: Changing a learning rate, adjusting vector direction, exploring attention weights, observing classifier boundaries.

Allowed domains: All NeuralVerse domains.

Example usage context: Moving a threshold slider to observe precision and recall trade-offs.

Non-goals: It is not a game, decorative animation, or official assessment unless governed as such.

#### Simulation

Definition: A controlled model of a system, process, or phenomenon that learners can observe under changing conditions.

Pedagogical purpose: Reveal dynamic behavior, constraints, emergent patterns, or system-level consequences.

Typical use cases: Agent behavior, optimization dynamics, data pipeline behavior, probabilistic sampling, queueing, deployment constraints.

Allowed domains: All NeuralVerse domains.

Example usage context: Simulating exploration vs exploitation behavior in a reinforcement learning setting.

Non-goals: It is not an unrestricted sandbox, production runtime, or mastery certification mechanism.

#### Executable Laboratory

Definition: A guided executable environment where learners run, modify, or inspect working procedures.

Pedagogical purpose: Transform conceptual understanding into procedural and engineering understanding.

Typical use cases: Implementing algorithms, testing parameters, inspecting data transformations, running reproducible experiments.

Allowed domains: All NeuralVerse domains where executable or procedural exploration is meaningful.

Example usage context: Running a small notebook to compare normalization strategies on model convergence.

Non-goals: It is not a full capstone project, grading system, or production deployment pipeline.

#### Checkpoint

Definition: A lightweight interactive moment that helps learners verify readiness, recall, or orientation.

Pedagogical purpose: Support self-monitoring and reduce passive progression.

Typical use cases: Quick conceptual checks, readiness prompts, confidence prompts, small decision moments, lesson navigation gates.

Allowed domains: All NeuralVerse domains.

Example usage context: Asking the learner to predict how increasing regularization affects model behavior before continuing.

Non-goals: A Checkpoint may support readiness awareness, but it does not produce official Competency Evidence unless governed by NV-800-M4 assessment rules.

## 10. Practice Artifacts

### Purpose

Practice Artifacts help learners rehearse, apply, debug, reflect, or transfer knowledge.

They support skill formation. They may generate informal feedback, but they do not certify mastery unless converted into governed assessment artifacts.

### Learning Role

Practice Artifacts support repetition, application, reflection, troubleshooting, and transfer to new contexts.

### What They May Contain

Practice Artifacts may contain prompts, scenarios, partial solutions, debugging traces, reflection questions, worked failures, or informal feedback.

### What They Must Not Contain

Practice Artifacts must not contain official mastery scoring or certification unless explicitly governed as assessments.

### Relationship to Lessons

Lessons use Practice Artifacts after initial understanding to develop durable skill and judgment.

### Relationship to Assessments

Practice Artifacts can prepare for assessments or be converted into assessment artifacts in later governance phases. By default, they are not assessments.

### Canonical Artifact Types

#### Exercise

Definition: A learner task designed to rehearse or apply a concept.

Pedagogical purpose: Build procedural fluency, conceptual application, and transfer.

Typical use cases: Solving a small problem, applying a formula, making an engineering choice, interpreting output.

Allowed domains: All NeuralVerse domains.

Example usage context: Asking the learner to choose the correct evaluation metric for an imbalanced classification problem.

Non-goals: It is not official mastery evidence unless governed as an assessment.

#### Debugging Example

Definition: A practice artifact centered on diagnosing and correcting an error or failure.

Pedagogical purpose: Develop professional troubleshooting and causal reasoning.

Typical use cases: Data leakage, unstable training, poor generalization, broken code, wrong assumptions, invalid evaluation.

Allowed domains: All NeuralVerse domains.

Example usage context: Showing a model with excellent validation performance caused by leakage and asking learners to identify the issue.

Non-goals: It is not a failure catalog, production incident report, or official assessment by default.

#### Failure Gallery

Definition: A curated set of common failures, symptoms, causes, and recovery strategies.

Pedagogical purpose: Build pattern recognition for professional error analysis.

Typical use cases: Common modeling mistakes, pipeline errors, statistical traps, deployment pitfalls, experimental design failures.

Allowed domains: All NeuralVerse domains.

Example usage context: Presenting common signs that a model is overfitting and how to diagnose them.

Non-goals: It is not a comprehensive incident database or a replacement for hands-on debugging.

#### Reflection Prompt

Definition: A prompt that asks learners to articulate understanding, uncertainty, transfer, or metacognitive state.

Pedagogical purpose: Reinforce retention, self-explanation, and learning awareness.

Typical use cases: End-of-lesson reflection, misconception surfacing, transfer planning, explain-back preparation.

Allowed domains: All NeuralVerse domains.

Example usage context: Asking whether the learner could explain regularization to another engineer.

Non-goals: It is not a formal assessment unless governed under assessment rules.

## 11. Reference Artifacts

### Purpose

Reference Artifacts organize, compare, summarize, or preserve useful knowledge for later retrieval.

They support recall, decision-making, professional judgment, and research continuity. They are not assessments.

### Learning Role

Reference Artifacts support consolidation, comparison, decision support, professional transfer, and long-term retrieval.

### What They May Contain

Reference Artifacts may contain summaries, comparisons, decision paths, practical guides, research notes, curated facts, or reusable professional guidance.

### What They Must Not Contain

Reference Artifacts must not contain official scoring, certification, mastery thresholds, or assessment decisions.

### Relationship to Lessons

Lessons use Reference Artifacts to preserve important knowledge after explanation, exploration, and practice.

### Relationship to Assessments

Reference Artifacts may support assessment preparation, but they do not generate Competency Evidence.

### Canonical Artifact Types

#### Comparison Table

Definition: A structured comparison of concepts, methods, tools, models, or trade-offs.

Pedagogical purpose: Support decision-making and conceptual differentiation.

Typical use cases: CNN vs Vision Transformer, batch vs online learning, accuracy vs latency, model families, evaluation metrics.

Allowed domains: All NeuralVerse domains.

Example usage context: Comparing model choices for image classification under latency constraints.

Non-goals: It is not a ranking system, benchmark claim, or assessment rubric by default.

#### Decision Tree

Definition: A structured decision aid that guides learners through conditional choices.

Pedagogical purpose: Teach engineering judgment through constraints, alternatives, and trade-offs.

Typical use cases: Algorithm selection, metric choice, deployment strategy, debugging path, data preprocessing decisions.

Allowed domains: All NeuralVerse domains.

Example usage context: Choosing between a linear model, tree model, or neural network based on data size and interpretability needs.

Non-goals: It is not an autonomous recommender or binding production policy.

#### Professional Guide

Definition: A reusable guide for applying knowledge in professional engineering contexts.

Pedagogical purpose: Transfer learning into repeatable professional practice.

Typical use cases: implementation checklists, project workflows, deployment considerations, documentation guidance, evaluation plans.

Allowed domains: All NeuralVerse domains.

Example usage context: A guide for building an image classification pipeline from data inspection to monitoring.

Non-goals: It is not a full project, full schema, or assessment.

#### Research Note

Definition: A concise research-oriented artifact that summarizes a paper, method, benchmark, limitation, or state-of-the-art insight.

Pedagogical purpose: Connect curriculum knowledge to current research and scientific awareness.

Typical use cases: paper summaries, benchmark notes, method limitations, historical technique evolution, emerging research directions.

Allowed domains: All NeuralVerse domains.

Example usage context: Summarizing why Vision Transformers required different data and scaling conditions than earlier CNNs.

Non-goals: It is not a full literature review, unverifiable synthesis, or research claim without sources.

#### Curiosity Card

Definition: A short, engaging, fact-checked micro-artifact that teaches one memorable idea.

Pedagogical purpose: Spark curiosity while reinforcing the learner's current topic.

Typical use cases: Did You Know?, Coffee Break, Myth or Truth?, Behind the Scenes, Historical Snapshot.

Allowed domains: All NeuralVerse domains.

Example usage context: While studying embeddings, a card explains why vector neighborhoods can power recommendation systems.

Non-goals: It is not entertainment filler, fake trivia, sensationalism, or a substitute for core instruction.

## 12. Cross-Family Rules

### Domain Independence

Artifact types must work across all NeuralVerse domains. A type must not be defined so narrowly that it only supports one subject.

### Pedagogical Function First

Artifacts are classified by learning function, not media format.

### No Evidence Confusion

Learning Artifacts do not certify Mastery. Evidence-producing behavior requires governance under assessment architecture.

### Reuse-Oriented Design

Artifact types must support reuse across lessons, modules, learning paths, domains, and difficulty levels. Exact reuse semantics are deferred to later phases.

### Source Quality Alignment

Artifacts that state factual, technical, scientific, or historical claims must respect the source quality policy defined by the NV-800 didactic foundations.

## 13. Lesson Composition Alignment

Lessons orchestrate artifacts into a coherent experience.

Artifacts may appear in lesson moments such as:

* orientation;
* intuition;
* explanation;
* demonstration;
* practice;
* reflection;
* reference;
* extension.

This document does not redefine the Canonical Lesson Architecture. It only defines the artifact vocabulary that lessons may orchestrate.

## 14. Domain Independence Rules

The taxonomy must remain valid across conceptual, mathematical, technical, research, and professional domains.

Rules:

* Do not define artifact types by file format.
* Do not define artifact types by implementation technology.
* Do not define artifact types that only work for programming.
* Do not define artifact types that only work for mathematics.
* Do not define artifact types that mix learning support with mastery certification.

Examples:

* A code-focused example may be represented later as a contract subtype, but Phase 1 classifies the broader pedagogical function.
* A diagram may be Visual Intuition, part of a Professional Guide, or part of a Research Note depending on learning function.

## 15. Taxonomy Summary Table

| Family | Artifact Type | Primary Function | Typical Lesson Role | Evidence-Producing? | Reusable? |
|---|---|---|---|---|---|
| Instruction Artifacts | Explanatory Text | Explain and clarify concepts | orientation, explanation, extension | No | Yes |
| Instruction Artifacts | Visual Intuition | Make abstract concepts perceptible | intuition, explanation, demonstration | No | Yes |
| Instruction Artifacts | Mathematical Derivation | Connect intuition to formal reasoning | explanation, demonstration, extension | No | Yes |
| Instruction Artifacts | Engineering Note | Connect theory to engineering judgment | explanation, extension, reference | No | Yes |
| Interactive Artifacts | Interactive Visualization | Enable visual manipulation and observation | intuition, demonstration, exploration | Only if governed as assessment | Yes |
| Interactive Artifacts | Simulation | Reveal dynamic system behavior | demonstration, exploration, extension | Only if governed as assessment | Yes |
| Interactive Artifacts | Executable Laboratory | Support procedural experimentation | demonstration, practice, extension | Only if governed as assessment | Yes |
| Interactive Artifacts | Checkpoint | Support readiness awareness | orientation, practice, reflection | Only if governed as assessment | Yes |
| Practice Artifacts | Exercise | Rehearse and apply knowledge | practice, extension | Only if governed as assessment | Yes |
| Practice Artifacts | Debugging Example | Develop diagnostic reasoning | practice, demonstration, reflection | Only if governed as assessment | Yes |
| Practice Artifacts | Failure Gallery | Build failure-pattern recognition | practice, reference, extension | No | Yes |
| Practice Artifacts | Reflection Prompt | Support metacognition and self-explanation | reflection, extension | Only if governed as assessment | Yes |
| Reference Artifacts | Comparison Table | Compare concepts and trade-offs | reference, extension | No | Yes |
| Reference Artifacts | Decision Tree | Guide engineering choices | reference, practice, extension | No | Yes |
| Reference Artifacts | Professional Guide | Transfer learning into practice | reference, extension | No | Yes |
| Reference Artifacts | Research Note | Connect curriculum to research awareness | reference, extension | No | Yes |
| Reference Artifacts | Curiosity Card | Reinforce learning through memorable micro-content | orientation, reference, extension | No | Yes |

## 16. Architectural Decision

Decision:
The Canonical Artifact Taxonomy is approved as the first layer of the NeuralVerse Learning Artifact Architecture.

Learning artifacts are classified by pedagogical function, not by media format or implementation technology.

This taxonomy establishes the canonical vocabulary for future artifact contracts, lifecycle governance, dependency modeling, reuse semantics, and lesson composition.

Status:
APPROVED_FOR_PHASE_2_CONTRACT_DEFINITION

# NV-800-M7 — Canonical Learning Artifact Architecture
# Phase 2 — Canonical Artifact Type Contracts

## 1. Introduction

This document defines the minimum normative contracts for every canonical Learning Artifact type established by NV-800-M7 Phase 1.

Phase 1 is frozen. This phase does not redefine artifact families, artifact type taxonomy, lesson architecture, assessment architecture, competency evidence, or mastery rules.

The contracts in this document define what must exist for an artifact instance to be pedagogically valid. They do not define how the artifact is rendered, stored, versioned, reused, assessed, or implemented.

## 2. Contract Philosophy

Every artifact type has a minimum pedagogical contract.

The contract specifies what must exist, not how it is rendered or implemented.

Contracts define pedagogical obligations only. They must remain valid across Mathematics, Statistics, Programming, Machine Learning, Deep Learning, Computer Vision, LLM Engineering, AI Agents, MLOps, and Scientific Research.

## 3. Normative vs Illustrative Guidance

Required Fields are mandatory for conformance. If a required field is absent, the artifact instance is not valid for its artifact type.

Optional Fields enrich the experience but are not required for validity.

Illustrative Examples demonstrate one possible realization. They are explicitly non-normative and have no contractual force.

No illustrative example may be interpreted as a required structure, required field, required format, or implementation prescription.

## 4. Evidence Boundary

Learning Artifacts support learning.

Assessments generate Competency Evidence.

Competency Evidence determines Mastery.

Learning Artifacts do not certify Mastery.

No contract in this document introduces grading, scoring, certification, mastery thresholds, or competency evidence generation. If an artifact is used in an evidence-producing context, it must be governed by NV-800-M4 assessment rules and NV-800-M3 evidence rules.

## 5. Instruction Artifact Contracts

### 5.1 Explanatory Text

#### 1. Definition

An Explanatory Text is a written artifact that introduces, clarifies, connects, or contextualizes a concept.

#### 2. Pedagogical Purpose

To build conceptual understanding through precise language, structured reasoning, and learner-oriented explanation.

#### 3. Required Fields

* objective;
* explanation.

#### 4. Optional Fields

* motivation;
* analogy;
* example;
* misconception warning;
* supporting visual;
* references.

#### 5. Preconditions

The learner should have the prerequisite concepts needed to interpret the explanation, if any are required.

#### 6. Expected Learner Outcome

The learner can state the concept, why it matters, and how it connects to the lesson objective.

#### 7. Non-goals

It does not certify understanding, replace practice, provide scoring, or function as a complete reference manual.

#### 8. Illustrative Example

Non-normative: A short paragraph explains why gradient descent is needed before presenting its update rule.

### 5.2 Visual Intuition

#### 1. Definition

A Visual Intuition artifact is a visual representation that makes an abstract concept easier to perceive, compare, or reason about.

#### 2. Pedagogical Purpose

To develop intuition before, during, or after formal explanation.

#### 3. Required Fields

* objective;
* visual focus;
* interpretation guidance.

#### 4. Optional Fields

* labels;
* explanatory caption;
* contrast case;
* step sequence;
* references.

#### 5. Preconditions

The learner should know the basic terms needed to interpret the visual, if the visual depends on prior vocabulary.

#### 6. Expected Learner Outcome

The learner can describe the relationship or pattern represented by the visual.

#### 7. Non-goals

It is not decoration, branding, a standalone proof, or mastery evidence.

#### 8. Illustrative Example

Non-normative: A diagram shows semantically similar embeddings appearing near one another in vector space.

### 5.3 Mathematical Derivation

#### 1. Definition

A Mathematical Derivation is a structured artifact that shows how a mathematical result, expression, or algorithmic rule is obtained.

#### 2. Pedagogical Purpose

To connect intuition to formal reasoning and reveal why a mathematical statement is valid.

#### 3. Required Fields

* objective;
* starting assumptions;
* derivation steps;
* resulting expression or conclusion.

#### 4. Optional Fields

* intuition note;
* intermediate commentary;
* notation glossary;
* common mistake;
* references.

#### 5. Preconditions

The learner should have sufficient prerequisite notation and mathematical concepts to follow the derivation.

#### 6. Expected Learner Outcome

The learner can trace the reasoning from assumptions to conclusion and explain the role of the result.

#### 7. Non-goals

It is not a symbolic dump, assessment proof, grading rubric, or substitute for applied practice.

#### 8. Illustrative Example

Non-normative: A derivation connects mean squared error to its gradient with respect to model predictions.

### 5.4 Engineering Note

#### 1. Definition

An Engineering Note is a concise instructional artifact that explains practical implications, trade-offs, constraints, or implementation concerns.

#### 2. Pedagogical Purpose

To connect theory to professional engineering judgment.

#### 3. Required Fields

* objective;
* engineering context;
* practical implication.

#### 4. Optional Fields

* trade-off;
* warning;
* decision cue;
* example scenario;
* reference.

#### 5. Preconditions

The learner should understand the concept or technique being contextualized.

#### 6. Expected Learner Outcome

The learner can identify a practical constraint or trade-off relevant to using the concept professionally.

#### 7. Non-goals

It is not a full professional guide, complete checklist, architecture decision record, or assessment.

#### 8. Illustrative Example

Non-normative: A note explains why larger batch sizes may improve throughput but increase memory pressure.

## 6. Interactive Artifact Contracts

### 6.1 Interactive Visualization

#### 1. Definition

An Interactive Visualization is an artifact that lets learners manipulate visual parameters or observe visual behavior.

#### 2. Pedagogical Purpose

To make hidden relationships visible and support intuitive exploration.

#### 3. Required Fields

* objective;
* manipulable variable or observable state;
* interpretation guidance.

#### 4. Optional Fields

* default state;
* learner prompt;
* explanatory caption;
* reset behavior;
* references.

#### 5. Preconditions

The learner should understand the basic meaning of the manipulated variable or observed state.

#### 6. Expected Learner Outcome

The learner can explain how changing a variable affects the observed concept or behavior.

#### 7. Non-goals

It is not a game, decorative animation, score generator, or mastery certification.

#### 8. Illustrative Example

Non-normative: A learner adjusts a classification threshold and observes precision-recall trade-offs.

### 6.2 Simulation

#### 1. Definition

A Simulation is a controlled model of a system, process, or phenomenon that learners can observe under changing conditions.

#### 2. Pedagogical Purpose

To reveal dynamic behavior, constraints, emergent patterns, or system-level consequences.

#### 3. Required Fields

* objective;
* simulated system;
* controllable condition or observation condition;
* interpretation guidance.

#### 4. Optional Fields

* scenario setup;
* parameter ranges;
* observation prompts;
* limitation note;
* references.

#### 5. Preconditions

The learner should understand the system elements being simulated at a conceptual level.

#### 6. Expected Learner Outcome

The learner can describe how the system behaves under at least one relevant condition.

#### 7. Non-goals

It is not an unrestricted sandbox, production runtime, benchmark, or assessment by default.

#### 8. Illustrative Example

Non-normative: A simulation shows how exploration rate changes behavior in a reinforcement learning environment.

### 6.3 Executable Laboratory

#### 1. Definition

An Executable Laboratory is a guided executable environment where learners run, modify, or inspect a procedure.

#### 2. Pedagogical Purpose

To transform conceptual understanding into procedural and engineering understanding.

#### 3. Required Fields

* objective;
* learner action;
* expected observation;
* safety or constraint note.

#### 4. Optional Fields

* setup instructions;
* starter procedure;
* parameter suggestions;
* extension prompt;
* references.

#### 5. Preconditions

The learner should have the conceptual and operational prerequisites needed to complete the action safely and meaningfully.

#### 6. Expected Learner Outcome

The learner can connect an executed procedure to an observed outcome and explain the relationship.

#### 7. Non-goals

It is not a full project, production environment, grading system, or storage contract.

#### 8. Illustrative Example

Non-normative: A learner modifies a normalization step and observes its effect on model convergence.

### 6.4 Checkpoint

#### 1. Definition

A Checkpoint is a lightweight interactive artifact that helps learners verify readiness, recall, or orientation.

#### 2. Pedagogical Purpose

To support self-monitoring and reduce passive progression.

#### 3. Required Fields

* objective;
* prompt;
* expected reflection or response.

#### 4. Optional Fields

* hint;
* feedback note;
* confidence prompt;
* next-step suggestion.

#### 5. Preconditions

The learner should have encountered the concept being checked.

#### 6. Expected Learner Outcome

The learner can identify whether they are ready to proceed or need review.

#### 7. Non-goals

A Checkpoint does not produce official Competency Evidence unless governed by NV-800-M4 assessment rules.

#### 8. Illustrative Example

Non-normative: A prompt asks the learner to predict what happens when regularization strength increases.

## 7. Practice Artifact Contracts

### 7.1 Exercise

#### 1. Definition

An Exercise is a learner task designed to rehearse or apply a concept.

#### 2. Pedagogical Purpose

To build procedural fluency, conceptual application, and transfer.

#### 3. Required Fields

* objective;
* learner task;
* expected learner output.

#### 4. Optional Fields

* hints;
* worked example;
* feedback guidance;
* difficulty note;
* references.

#### 5. Preconditions

The learner should have received enough instruction to attempt the task.

#### 6. Expected Learner Outcome

The learner can apply a concept to a defined task or situation.

#### 7. Non-goals

It is not official mastery evidence unless governed as an assessment.

#### 8. Illustrative Example

Non-normative: A learner chooses an evaluation metric for an imbalanced classification problem.

### 7.2 Debugging Example

#### 1. Definition

A Debugging Example is a practice artifact centered on diagnosing and correcting an error or failure.

#### 2. Pedagogical Purpose

To develop troubleshooting, causal reasoning, and professional diagnostic judgment.

#### 3. Required Fields

* objective;
* failure scenario;
* observable symptom;
* diagnostic focus.

#### 4. Optional Fields

* root cause;
* recovery strategy;
* prevention note;
* learner prompt;
* references.

#### 5. Preconditions

The learner should understand the normal expected behavior of the system or concept.

#### 6. Expected Learner Outcome

The learner can identify a plausible cause or diagnostic path for a failure.

#### 7. Non-goals

It is not a production incident report, exhaustive error taxonomy, or assessment by default.

#### 8. Illustrative Example

Non-normative: A learner investigates why validation accuracy is unrealistically high and identifies data leakage.

### 7.3 Failure Gallery

#### 1. Definition

A Failure Gallery is a curated set of common failures, symptoms, causes, and recovery strategies.

#### 2. Pedagogical Purpose

To build failure-pattern recognition and professional error analysis.

#### 3. Required Fields

* objective;
* failure entries;
* diagnostic takeaway.

#### 4. Optional Fields

* severity note;
* prevention strategies;
* recovery strategies;
* related concepts;
* references.

#### 5. Preconditions

The learner should understand the domain context of the failures.

#### 6. Expected Learner Outcome

The learner can recognize common failure patterns and name likely diagnostic actions.

#### 7. Non-goals

It is not a complete incident database, assessment, or replacement for hands-on debugging.

#### 8. Illustrative Example

Non-normative: A gallery lists symptoms of overfitting, likely causes, and common mitigation options.

### 7.4 Reflection Prompt

#### 1. Definition

A Reflection Prompt asks learners to articulate understanding, uncertainty, transfer, or metacognitive state.

#### 2. Pedagogical Purpose

To reinforce retention, self-explanation, and awareness of learning gaps.

#### 3. Required Fields

* objective;
* reflection prompt;
* expected reflection focus.

#### 4. Optional Fields

* guiding questions;
* examples of reflection dimensions;
* follow-up prompt;
* confidence prompt.

#### 5. Preconditions

The learner should have engaged with the concept or activity being reflected on.

#### 6. Expected Learner Outcome

The learner can state what they understand, what remains unclear, or how the concept transfers.

#### 7. Non-goals

It is not a scored assessment, psychological profile, or mastery certification by default.

#### 8. Illustrative Example

Non-normative: A prompt asks whether the learner could explain regularization to another engineer.

## 8. Reference Artifact Contracts

### 8.1 Comparison Table

#### 1. Definition

A Comparison Table is a structured artifact that compares concepts, methods, tools, models, or trade-offs.

#### 2. Pedagogical Purpose

To support decision-making and conceptual differentiation.

#### 3. Required Fields

* objective;
* comparison subjects;
* comparison criteria;
* comparative takeaways.

#### 4. Optional Fields

* recommended use cases;
* limitations;
* references;
* decision cues.

#### 5. Preconditions

The learner should have basic familiarity with the compared subjects or receive enough context to interpret the comparison.

#### 6. Expected Learner Outcome

The learner can distinguish alternatives using relevant criteria.

#### 7. Non-goals

It is not a universal ranking, benchmark claim, or assessment rubric by default.

#### 8. Illustrative Example

Non-normative: A table compares CNNs and Vision Transformers by data needs, inductive bias, compute cost, and deployment trade-offs.

### 8.2 Decision Tree

#### 1. Definition

A Decision Tree is a structured decision aid that guides learners through conditional choices.

#### 2. Pedagogical Purpose

To teach engineering judgment through constraints, alternatives, and trade-offs.

#### 3. Required Fields

* objective;
* decision question;
* decision criteria;
* possible outcomes.

#### 4. Optional Fields

* caveats;
* examples;
* fallback guidance;
* references.

#### 5. Preconditions

The learner should understand the decision context and the meaning of the criteria.

#### 6. Expected Learner Outcome

The learner can choose or justify a path based on constraints.

#### 7. Non-goals

It is not an autonomous recommender, binding policy, or scoring mechanism.

#### 8. Illustrative Example

Non-normative: A decision tree helps choose between a linear model, tree model, or neural network based on data size and interpretability needs.

### 8.3 Professional Guide

#### 1. Definition

A Professional Guide is a reusable artifact for applying knowledge in professional engineering contexts.

#### 2. Pedagogical Purpose

To transfer learning into repeatable professional practice.

#### 3. Required Fields

* objective;
* professional context;
* operational guidance;
* key cautions.

#### 4. Optional Fields

* checklist;
* decision notes;
* quality criteria;
* documentation guidance;
* references.

#### 5. Preconditions

The learner should understand the concepts or procedures that the guide operationalizes.

#### 6. Expected Learner Outcome

The learner can apply the concept or procedure in a realistic professional context.

#### 7. Non-goals

It is not a full project specification, compliance standard, or assessment.

#### 8. Illustrative Example

Non-normative: A guide outlines how to approach an image classification workflow from dataset inspection to monitoring.

### 8.4 Research Note

#### 1. Definition

A Research Note is a concise research-oriented artifact that summarizes a paper, method, benchmark, limitation, or state-of-the-art insight.

#### 2. Pedagogical Purpose

To connect curriculum knowledge to scientific awareness and research continuity.

#### 3. Required Fields

* objective;
* research subject;
* key insight;
* source basis.

#### 4. Optional Fields

* limitations;
* related work;
* implementation note;
* benchmark context;
* future directions.

#### 5. Preconditions

The learner should understand enough of the surrounding topic to interpret the research insight.

#### 6. Expected Learner Outcome

The learner can state the research contribution or insight and connect it to the curriculum.

#### 7. Non-goals

It is not a full literature review, unsupported synthesis, benchmark authority, or assessment.

#### 8. Illustrative Example

Non-normative: A note summarizes why Vision Transformers changed assumptions about image model scaling.

### 8.5 Curiosity Card

#### 1. Definition

A Curiosity Card is a short, fact-checked micro-artifact that teaches one memorable idea in an engaging way.

#### 2. Pedagogical Purpose

To spark curiosity while reinforcing the learner's current topic.

#### 3. Required Fields

* objective;
* curiosity statement;
* learning connection;
* source basis.

#### 4. Optional Fields

* card category;
* follow-up prompt;
* related concept;
* reference link.

#### 5. Preconditions

None, unless the card relies on specific prior vocabulary.

#### 6. Expected Learner Outcome

The learner remembers one accurate idea and can connect it to the topic being studied.

#### 7. Non-goals

It is not entertainment filler, sensationalism, fake trivia, news feed content, or assessment.

#### 8. Illustrative Example

Non-normative: A card explains how semantic similarity in embedding spaces relates to recommendation systems.

## 9. Cross-Cutting Rules

### Minimal Validity

Required fields define the smallest valid pedagogical unit for each artifact type.

### Optional Enrichment

Optional fields may improve clarity, depth, engagement, or transfer, but absence of optional fields does not invalidate the artifact.

### Domain Independence

Contracts must remain valid for equations, algorithms, code, visualizations, research summaries, engineering guidance, and scientific explanations.

### No Implementation Prescription

Contracts do not prescribe HTML, Markdown, React, SVG, Canvas, notebooks, code editors, animation, databases, or storage formats.

### Evidence Separation

No Learning Artifact contract produces Competency Evidence by itself.

### Assessment Conversion

If an artifact is converted into an assessment, that conversion is governed by NV-800-M4 and is outside the scope of this document.

## 10. Compatibility Statement

These contracts are compatible with:

* NV-800-M5 Lesson orchestration;
* NV-800-M6 Module organization;
* NV-800-M3 Competency Evidence;
* NV-800-M4 Assessment Architecture.

Artifacts support lessons.

Assessments produce evidence.

Competencies remain the canonical unit of mastery.

## 11. Architectural Decision

Decision:
The Canonical Artifact Type Contracts are approved as the second layer of the NeuralVerse Learning Artifact Architecture.

These contracts define the minimum pedagogical obligations for each canonical artifact type while preserving domain independence, implementation independence, and the boundary between learning support, assessment, evidence, and mastery.

Status:
CANONICAL_PHASE_2_APPROVED

Next:
Phase 3 — Artifact Lifecycle & Canonical Status


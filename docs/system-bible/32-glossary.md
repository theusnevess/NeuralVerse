# Glossary

## A

**Agent Runtime**
The deterministic, browser-based execution environment for didactic agents. Includes the registry, orchestrator, context builder, guardrails, and panel controller.

**Artifact**
An individual content piece within a lesson. Types include: reading, exercise, interactive-visualization, comparison-table, code, video, image, audio. 600 artifacts exist in the canonical curriculum.

**Atlas**
See Curriculum Atlas.

## C

**Canonical Status**
The lifecycle metadata field on every curriculum entity. Values: `Draft` (in progress) or `Reviewed` (editorially approved). This is editorial metadata only and does not imply learner achievement.

**Collection**
A user-named group of resources for organized study. Created and managed through the personalization system.

**Context Builder**
A component of the agent runtime that reads the current frontend state (URL, route, curriculum selection, personalization data) and produces a structured context object for agent execution.

**Continue Reading**
A feature that remembers the user's scroll position within an artifact and provides a "Resume" link on return.

**Curriculum Atlas**
The knowledge graph visualization of the curriculum hierarchy. Accessed via `#/knowledge-graph`. Supports staged navigation from overview to individual artifact focus.

## D

**Didactic Orchestrator**
Central coordination hub of the agent runtime. Handles intent routing, agent selection, guardrail enforcement, and response formatting.

**Draft**
A lifecycle status indicating the content has not completed editorial review. Displayed with a neutral badge.

## E

**Evidence Boundary**
A governance concept separating canonical curriculum content, learner personalization data, and agent system claims. The boundary prohibits agents from making claims about learner achievement, fabricating evidence, or using personalization data for mastery inference.

**Extreme Audit**
A comprehensive audit script that validates an entire subsystem. Covers route loading, count validation, governance semantics, accessibility, security, performance, and visual polish. QA1-QA5 completed.

## G

**Guardrail**
A governance rule enforced by the agent runtime. 9 guardrails cover curriculum mutation, lifecycle modification, mastery claims, external API calls, XSS prevention, and more.

## I

**Interactive Visualization Specification**
A notice displayed when an artifact of type `interactive-visualization` does not have a registered visualization in the visualization registry. Indicates the specification is present but no executable widget exists.

## K

**Knowledge Trail**
A chronological event log in the retrieval playground recording user actions (search, open, pin, compile, compare) during a research session. Capped at 20 entries.

## L

**Learning Path**
A broad domain or track in the curriculum hierarchy. Contains modules. 19 learning paths exist in the canonical curriculum.

**Lesson**
A teachable session within a module. Contains multiple artifacts. 120 lessons exist in the canonical curriculum.

## M

**Master Certification Gate**
The final verification layer (NV-1000) that runs all Extreme Audit scripts and validates zero Critical or High failures before certification.

**Module**
A conceptual unit within a learning path. Contains lessons. 40 modules exist in the canonical curriculum.

## R

**Reviewed**
A lifecycle status indicating the content has passed editorial review. Displayed with a green badge.

**Retrieval**
The simulated research playground system. Provides search, graph, discovery, and compare modes over a seeded reference database.

## S

**Study Queue**
An ordered list of resources a learner plans to study. Supports add, remove, reorder, and "Start Next" operations.

## Related Chapters

- [Curriculum Architecture](05-curriculum-architecture.md)
- [Didactic Agent Runtime](11-didactic-agent-runtime.md)
- [Governance Model](27-governance-model.md)
- [Testing and Certification](28-testing-and-certification.md)

# Governance Model

## Overview

NeuralVerse enforces strict governance boundaries across all subsystems. Governance ensures that the curriculum remains canonical, learner data remains private, and no system component makes claims beyond its authority.

## Immutable Curriculum Principles

The curriculum index (`curriculum-index.json`) is the canonical, authoritative data source. Key immutability rules:

- **No runtime modification**: The curriculum index is loaded as a static JSON file and never modified in the browser
- **No UI-based mutation**: No interface allows adding, removing, or editing curriculum entities
- **No agent-driven mutation**: All 10 agents are forbidden from proposing or executing curriculum modifications
- **No search-side mutation**: The search system reads the index but never writes to it

## Retrieval Governance

The retrieval playground operates with the following constraints:

- **Seeded data only**: The reference database is hardcoded, not fetched from external sources
- **No live search**: Queries only match against the seeded reference keywords
- **Simulated evidence**: Evidence compilation is based on the seeded relationship graph, not real citations
- **Presentation mode is a placeholder**: No implementation exists

## Lifecycle Semantics

Every curriculum entity has a `canonicalStatus` field with two values:

- **Draft**: Content is in progress, has not completed editorial review
- **Reviewed**: Content has passed editorial review

Critical semantic rules:

| Allowed | Not Allowed |
|---------|-------------|
| "This artifact is Draft" | "This artifact is unmastered" |
| "Reviewed content has passed editorial review" | "Reviewed content is certified" |
| Filter by lifecycle status | Infer learner competence from status |
| Display status badge | Claim Draft content is low quality |

The lifecycle badge tooltip explicitly states: "...curriculum lifecycle status. It does not imply certification or learner achievement."

## Evidence Boundary

The Evidence Boundary is a governance concept that separates:

- **What the curriculum contains** (canonical content with lifecycle metadata)
- **What the learner has done** (personalization data: notes, bookmarks, progress)
- **What the agent system can claim** (deterministic guidance based on curated data)

The boundary prohibits:
- Agents making claims about learner achievement or competence
- Agents fabricating evidence not present in the curriculum
- Personalization data being used for mastery inference
- Curriculum lifecycle status being used as learner assessment

## Prohibition of Mastery Inference

The platform explicitly does not:

- Assign scores to learner responses
- Generate grades or percentages
- Certify competence or completion
- Track learner "mastery" of concepts
- Provide pass/fail judgments
- Unlock or lock content based on performance
- Track learner progress as qualification

Governance-safe negations are allowed (e.g., "This exercise does not assign a score").

## Draft/Reviewed Interpretation

- Draft/Reviewed is **editorial metadata**, not learner-facing quality assessment
- Both Draft and Reviewed content can be equally valuable for learning
- The filter exists for transparency, not as a quality gate
- Draft content may change; Reviewed content is stable

## Preservation Rules

Governance is preserved through:

1. **Architectural constraints**: Curriculum service is read-only; agents are forbidden from mutation
2. **Guardrails**: Regex-based query scanning at the agent level
3. **Audit scripts**: Extreme Audit scripts verify governance compliance across the entire application
4. **Master Certification Gate**: Governance violations cause certification failure
5. **Documentation**: This system bible documents governance rules for contributors

## Related Chapters

- [Security Model](26-security-model.md)
- [Didactic Agent Runtime](11-didactic-agent-runtime.md)
- [Testing and Certification](28-testing-and-certification.md)
- [Development Guidelines](31-development-guidelines.md)

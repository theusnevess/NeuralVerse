# NeuralVerse System Bible

The official, exhaustive, canonical technical reference manual for the NeuralVerse project.

## Purpose

This document suite describes what NeuralVerse is, how it is architected, how it operates, how its subsystems interact, and what has been implemented. It is intended as a single source of truth for engineers, architects, and researchers working on or evaluating the platform.

## Documents

| # | Document | Description |
|---|----------|-------------|
| 00 | [Executive Summary](00-executive-summary.md) | Project overview, architecture, maturity |
| 01 | [Project Vision](01-project-vision.md) | Mission, philosophy, governance principles |
| 02 | [System Architecture](02-system-architecture.md) | Overall architecture, modules, data flow |
| 03 | [Frontend Architecture](03-frontend-architecture.md) | Routing, shell, layout, components, state |
| 04 | [Navigation and Routing](04-navigation-and-routing.md) | Hash routing, deep routes, breadcrumbs, rail |
| 05 | [Curriculum Architecture](05-curriculum-architecture.md) | Learning Paths, Modules, Lessons, Artifacts |
| 06 | [Learning Experience](06-learning-experience.md) | Discovery flow, reading, study workflow |
| 07 | [Workspace Architecture](07-workspace-architecture.md) | Reading shell, outline, metadata, tools |
| 08 | [Search System](08-search-system.md) | Indexing, aliases, scoring, keyboard nav |
| 09 | [Retrieval System](09-retrieval-system.md) | Playground, graph, compare, knowledge trail |
| 10 | [Atlas System](10-atlas-system.md) | Knowledge graph, staged navigation, inspector |
| 11 | [Didactic Agent Runtime](11-didactic-agent-runtime.md) | Registry, orchestrator, context, guardrails |
| 12 | [Agent A1: Didactic Architecture](12-agent-a1-didactic-architecture.md) | Teaching strategies, modes, engines |
| 13 | [Agent A2: Curriculum & Dependency](13-agent-a2-curriculum-dependency.md) | Prerequisites, navigation, dependencies |
| 14 | [Agent A3: Visual & Interactive Media](14-agent-a3-visual-media.md) | Visualization guidance, media selection |
| 15 | [Agent A4: Code & Laboratory](15-agent-a4-code-laboratory.md) | Code examples, algorithms, simulations |
| 16 | [Agent A5: Research](16-agent-a5-research.md) | Landmark papers, trends, reading roadmaps |
| 17 | [Agent A6: Professional Transfer](17-agent-a6-professional-transfer.md) | Production, trade-offs, MLOps, case studies |
| 18 | [Agent A7: Assessment & Reinforcement](18-agent-a7-assessment-reinforcement.md) | Practice, flashcards, self-assessment |
| 19 | [Agent A8: Obsidian & Governance](19-agent-a8-obsidian-governance.md) | Notes, tags, collections, knowledge review |
| 20 | [Agent A9: Storytelling](20-agent-a9-storytelling.md) | Narratives, timelines, mental models |
| 21 | [Agent A10: Curiosity](21-agent-a10-curiosity.md) | Facts, connections, thought experiments |
| 22 | [Personalization System](22-personalization-system.md) | Notes, bookmarks, tags, collections, highlights |
| 23 | [Study Sessions](23-study-sessions.md) | Timer, pause/resume, summary modal |
| 24 | [UI Design Language](24-ui-design-language.md) | Dark aesthetic, typography, spacing, color |
| 25 | [Accessibility](25-accessibility.md) | Landmarks, keyboard nav, ARIA, reduced motion |
| 26 | [Security Model](26-security-model.md) | Sanitization, XSS prevention, governed refusals |
| 27 | [Governance Model](27-governance-model.md) | Immutable curriculum, Evidence Boundary, lifecycle |
| 28 | [Testing and Certification](28-testing-and-certification.md) | QA audits, Master Gate, Playwright, regression |
| 29 | [Current Capabilities](29-current-capabilities.md) | Implemented features by subsystem |
| 30 | [Known Limitations](30-known-limitations.md) | Unimplemented features, boundaries, non-goals |
| 31 | [Development Guidelines](31-development-guidelines.md) | Conventions for contributors |
| 32 | [Glossary](32-glossary.md) | Key terms and definitions |

## How to Use

- **New team members**: Start with [Executive Summary](00-executive-summary.md) and [System Architecture](02-system-architecture.md)
- **Feature contributors**: Read [Development Guidelines](31-development-guidelines.md) and the relevant subsystem document
- **Architects**: Read [System Architecture](02-system-architecture.md), [Governance Model](27-governance-model.md), and [Security Model](26-security-model.md)
- **QA engineers**: Read [Testing and Certification](28-testing-and-certification.md) and the audit scripts in `scripts/`

## Source of Truth

This documentation is derived exclusively from the implemented system and canonical project architecture. It does not describe roadmap items, hypothetical features, or aspirational capabilities.

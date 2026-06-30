# Executive Summary

## Project Purpose

NeuralVerse is an AI learning and research platform designed as a local-first, single-page application for exploring machine learning, deep learning, and artificial intelligence concepts through structured curriculum content, interactive visualizations, and a didactic agent framework.

## Target Audience

Researchers, engineers, and self-directed learners seeking a structured, governance-controlled environment for AI education. The platform assumes technical literacy but does not require backend infrastructure or external API access.

## Educational Philosophy

The platform follows a scientific learning philosophy: knowledge is structured hierarchically (Learning Paths > Modules > Lessons > Artifacts), content is governed by lifecycle metadata (Draft/Reviewed), and learning is supported by deterministic didactic agents that provide scaffolded guidance without claiming mastery, scoring, or certification.

## Architecture Overview

NeuralVerse is a fully client-side single-page application (SPA) with a vanilla JavaScript core and React islands for specific interactive components. Key characteristics:

- **Hash-based routing** for all navigation
- **Local persistence** via `localStorage` for personalization data
- **Static JSON files** as the data layer for curriculum and content
- **Deterministic agent runtime** with 10 didactic agents, all operational
- **Seeded retrieval playground** simulating a research reference system
- **Force-directed knowledge graph** for visual exploration
- **Canvas-based neural galaxy** animated background
- **Comprehensive audit and certification** tooling

## Implementation Maturity

| Area | Status |
|------|--------|
| Curriculum (19 paths, 40 modules, 120 lessons, 600 artifacts) | Implemented |
| Didactic Agent Runtime (10 agents, 100 modes) | Operational |
| Personalization (notes, bookmarks, tags, collections, queue, highlights) | Implemented |
| Study Sessions | Implemented |
| Retrieval Playground (5 modes, graph, compare, evidence) | Implemented (Presentation mode: placeholder) |
| Knowledge Graph / Atlas | Implemented |
| Search System | Implemented |
| Accessibility | Audited and compliant |
| Governance Model | Enforced at multiple layers |
| Audits & Certification | QA1-QA5 completed, Master Certification Gate passing |
| Backend / Auth / Database | Not implemented (by design) |
| External API / LLM integration | Not implemented (by design) |

## Related Chapters

- [Project Vision](01-project-vision.md)
- [System Architecture](02-system-architecture.md)
- [Current Capabilities](29-current-capabilities.md)
- [Known Limitations](30-known-limitations.md)

# Project Vision

## NeuralVerse Mission

NeuralVerse exists to provide a structured, governed, and accessible environment for learning AI and machine learning concepts. The platform treats educational content as a first-class system: immutable in its canonical form, explorable through multiple lenses (curriculum, graph, retrieval, agents), and extensible through deterministic tooling.

## Scientific Learning Philosophy

Learning in NeuralVerse follows a hierarchical decomposition model:

- **Learning Paths** represent broad domains or tracks
- **Modules** break paths into conceptual units
- **Lessons** organize modules into teachable sessions
- **Artifacts** are individual content pieces (readings, visualizations, exercises, code)

This structure allows learners to navigate from overview to detail while maintaining context of where each piece fits in the larger domain.

## Local-First Philosophy

NeuralVerse is designed to operate without network dependencies after initial page load:

- All curriculum data is served from static JSON files
- All personalization state is stored in `localStorage`
- All agent logic executes deterministically in the browser
- No external APIs, no authentication, no backend services

This guarantees reproducibility, privacy, and offline-capable operation.

## Governance Principles

The platform enforces strict governance boundaries:

- **Curriculum immutability**: Canonical content cannot be modified through the UI or agent system
- **Evidence Boundary**: Agents provide guidance but cannot fabricate claims about learner achievement
- **Lifecycle semantics**: Draft/Reviewed indicate editorial status, not learner mastery
- **No mastery inference**: The platform does not score, grade, certify, or track learner competence
- **Preservation rules**: Audit scripts verify governance compliance at every layer

## Didactic Philosophy

The didactic agent framework operates on a deterministic, scaffolded model:

1. Agents provide structured guidance within defined roles (A1-A10)
2. Responses are generated from curated data and rule-based logic, not from generative models
3. Agents refuse requests that violate governance boundaries
4. Supporting engines (analogy, comparison, socratic, misconception) provide pedagogical depth without claiming authority

## Related Chapters

- [System Architecture](02-system-architecture.md)
- [Governance Model](27-governance-model.md)
- [Didactic Agent Runtime](11-didactic-agent-runtime.md)

# Known Limitations

## Intentionally Unimplemented Features

The following features are intentionally not implemented as part of the project's design:

- **Backend services**: No server, no database, no authentication
- **External API integration**: No API calls to external services
- **LLM integration**: No generative AI, no large language model integration
- **User accounts**: No user registration, login, or multi-user support
- **Data synchronization**: No cross-device or cloud sync
- **Content creation**: No UI for creating or editing curriculum content
- **Scoring and grading**: No learner assessment, scoring, or certification
- **Adaptive learning**: No algorithm-driven content personalization
- **Real-time collaboration**: No multi-user sessions or shared workspaces
- **Mobile-native app**: Web-only; no native iOS or Android application

## Architectural Boundaries

| Boundary | Limitation |
|----------|------------|
| Browser-only | All code runs in main thread; no service worker or Web Worker |
| localStorage | Data limited to ~5-10MB per origin; no IndexedDB usage |
| Static data | Curriculum index is static JSON; content changes require rebuild |
| Single origin | No cross-origin data sharing or embedding support |
| No offline support | Initial page load requires network for static assets |

## Local-Only Assumptions

- Personalization data is specific to the browser and profile
- Clearing browser data removes all notes, bookmarks, and progress
- No backup or export mechanism for personalization data
- No recovery if localStorage is corrupted or cleared
- Study sessions do not persist across browsers or devices

## Advisory Systems

The following systems provide advisory or simulated capabilities:

- **Retrieval Playground**: Reference database is seeded (10 references); not connected to real paper databases
- **Presentation mode**: Tab exists in the retrieval playground but has no implementation
- **Research agent (A5)**: Research information is static and curated; may not reflect latest developments
- **Professional transfer agent (A6)**: Production advice is general, not organization-specific
- **Assessment agent (A7)**: Questions are for self-assessment; no scoring or evaluation

## Non-Goals

The following are explicitly not goals of the project:

- Replace traditional learning management systems
- Provide accredited certification
- Serve as a production AI deployment platform
- Compete with commercial AI learning platforms
- Provide real-time AI inference or model training
- Support user-generated curriculum content
- Provide enterprise-grade authentication or access control

## Performance Limitations

- Single-threaded architecture may struggle with very large curriculum indexes
- Force-directed graph layout is CPU-intensive for large node counts
- React islands bundle is ~500KB; initial load includes all CSS (25 files)
- No lazy loading for curriculum entities; all index data loads on first access
- Canvas neural galaxy animation consumes GPU resources when visible

## Content Limitations

- Not all artifact types have corresponding interactive visualizations
- Exercise artifacts are self-assessment only with no validation
- Video, image, and audio artifacts may have limited browser compatibility
- Cross-link dependencies rely on declared metadata, not inferred relationships

## Related Chapters

- [Current Capabilities](29-current-capabilities.md)
- [System Architecture](02-system-architecture.md)
- [Security Model](26-security-model.md)

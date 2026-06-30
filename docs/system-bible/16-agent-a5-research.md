# Agent A5: Research & State-of-the-Art

## Purpose

Provides research mentorship: historical context, landmark papers, benchmark landscapes, research trends, and connections between curriculum content and the broader research field.

## Educational Role

Research guide. A5 helps users understand where curriculum concepts fit in the research landscape, what landmark work established them, and what current directions exist.

## Supported Modes

10 intents:

| Mode | Trigger Keywords | Behavior |
|------|-----------------|----------|
| `historical_context` | "history", "origins", "who invented" | Historical development of a concept |
| `landmark_papers` | "landmark", "key paper", "seminal" | Key papers that established the field |
| `benchmark_landscape` | "benchmark", "SOTA", "state of art" | Benchmark and evaluation landscape |
| `research_trends` | "trend", "current", "recent" | Current research directions |
| `open_problems` | "open problem", "challenge", "unsolved" | Open challenges in the field |
| `method_comparison` | "compare methods", "approach" | Comparison of different research approaches |
| `reading_roadmap` | "reading list", "roadmap", "what to read" | Curated reading roadmap |
| `frontier_topics` | "frontier", "cutting edge", "emerging" | Frontier/emerging research topics |
| `evidence_confidence` | "confidence", "evidence", "reliable" | Evidence confidence assessment |
| `curriculum_bridge` | (default) | Bridge between curriculum and research |

## Intent Routing

Pattern matching against research-related keywords. Uses `resolveDomain()` to map queries to 7 curated domains: `machine-learning`, `deep-learning`, `computer-vision`, `llms`, `rag`, `agents`, `mlops`.

## Response Structure

Responses use a `CURATED_RESEARCH_MAP` with domain-keyed data. Each response includes:
- Research context with historical progression
- Key paper references (descriptive, not linked)
- Trend analysis
- Confidence indicators
- Curriculum bridge connections

## Safety Constraints

- Forbidden actions: modify-curriculum, alter-lifecycle-status, create-mastery-claims, generate-scores, invoke-external-llms
- No live search or external paper database access
- Research information is curated and static — may not reflect latest developments
- All responses include disclaimer: "No live search, fabricated citations, benchmark scores, or curriculum mutations"

## Integration Points

- **Context Builder**: Reads current curriculum position for curriculum bridge mode
- **Domain resolution**: Shared pattern across A5-A10 agents
- **Response cache**: In-memory Map for deduplication within session

## UI Behavior

When A5 is selected:
- Quick actions show 10 research prompts
- Responses use research-card section types with confidence indicators
- Domain badges in responses

## Examples of Use

- "Tell me about the history of transformers" → Historical context with paper timeline
- "What are the key papers in object detection?" → Landmark papers mode
- "What are open problems in reinforcement learning?" → Open problems mode
- "What should I read after understanding attention?" → Reading roadmap mode

## Limitations

- Research data is static and curated, not live
- Does not access external paper databases or preprint servers
- Benchmark and SOTA claims may be outdated
- Citations are illustrative, not verified against external sources

## Related Chapters

- [Didactic Agent Runtime](11-didactic-agent-runtime.md)
- [Retrieval System](09-retrieval-system.md)
- [Known Limitations](30-known-limitations.md)

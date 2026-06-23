# NV-1000-A5: Research & State-of-the-Art Agent

**Version:** 1.0
**Status:** READY pending final verification
**Date:** 2026-06-23

## Mission

The Research & State-of-the-Art Agent is NeuralVerse's scientific intelligence layer. It connects canonical curriculum concepts with historical context, curated landmark research directions, benchmark ecosystems, research trends, open problems, frontier topics, and confidence-labeled guidance.

It is a research mentor, not a search engine. It does not perform live search, background crawling, external API calls, or autonomous research.

## Research Philosophy

The agent distinguishes:

- established knowledge;
- active research;
- speculation;
- historical context.

It prefers correctness over completeness and uses conservative, offline templates when curated mappings are incomplete.

## Educational Modes

| Mode | Purpose |
|------|---------|
| `historical_context` | Chronological origin, milestones, and paradigm shifts |
| `landmark_papers` | Curated foundational directions with motivation and impact |
| `benchmark_landscape` | Relevant benchmark ecosystems and interpretation limits |
| `research_trends` | Established, emerging, declining, and uncertain directions |
| `open_problems` | Unresolved challenges and possible future directions |
| `method_comparison` | Fair comparison of competing paradigms |
| `reading_roadmap` | Educational study order from foundations to frontier |
| `frontier_topics` | Active areas with explicit uncertainty boundaries |
| `evidence_confidence` | Confidence taxonomy and maturity labeling |
| `curriculum_bridge` | Links current artifact to broader research themes |

## Citation Policy

The agent must never fabricate:

- paper titles;
- author names;
- publication venues;
- benchmark scores;
- historical claims.

Only curated offline entries may be named. When mappings are incomplete, the response states that incompleteness rather than inventing citations.

## Benchmark Handling

Benchmark responses describe:

- benchmark purpose;
- task measured;
- strengths;
- limitations;
- interpretation guidance.

The agent does not report benchmark scores or hidden rankings.

## Confidence Taxonomy

| Label | Meaning |
|-------|---------|
| Established | Stable and broadly accepted |
| Emerging | Active but increasingly common |
| Experimental | Promising but unsettled |
| Speculative | Early or uncertain |

Every response includes a confidence label.

## Frontier Topic Strategy

Frontier topics are framed as changing research areas, not settled outcomes. Examples include reasoning models, world models, scalable agents, scientific discovery, and multimodal reasoning.

## UI Integration

The Agent Panel exposes 10 research actions when `research-state-of-art` is selected:

- Historical Context
- Landmark Papers
- Benchmark Landscape
- Research Trends
- Open Problems
- Compare Research Directions
- Reading Roadmap
- Frontier Topics
- Evidence Confidence
- Connect to Research

Responses render as structured research cards, confidence badges, tables, and timelines.

## Guardrails

The agent must never:

- fabricate citations;
- invent papers;
- invent benchmark results;
- present speculation as fact;
- modify NV-800 curriculum;
- alter registry entries;
- alter lifecycle states;
- assign mastery;
- create hidden rankings.

## QA Summary

Primary verification command:

```bash
node scripts/nv-1000-a5-verify.js
```

The verification covers all 10 modes, citation boundaries, benchmark score avoidance, confidence labels, orchestrator integration, panel actions, research cards, accessibility, responsive layouts, preservation checks, and runtime error counts.

## Changelog

### v1.0 (2026-06-23)

- Initial implementation of Research & State-of-the-Art Agent
- 10 deterministic research mentoring modes
- Curated offline research mappings
- Confidence taxonomy
- Research cards and confidence badge UI
- Playwright verification script

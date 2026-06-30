# Agent A10: Curiosity & Engagement

## Purpose

Provides curiosity-driven exploration: surprising facts, unexpected connections, historical anecdotes, thought experiments, and interdisciplinary bridges that spark interest and engagement.

## Educational Role

Curiosity engine. A10 is designed to make learning enjoyable by revealing the unexpected, counterintuitive, and fascinating aspects of AI concepts.

## Supported Modes

10 intents:

| Mode | Trigger Keywords | Behavior |
|------|-----------------|----------|
| `did_you_know` | "did you know", "fact", "surprising" | Surprising facts about the topic |
| `surprising_connection` | "connection", "linked to", "unexpected" | Unexpected interdisciplinary connections |
| `historical_anecdote` | "anecdote", "story", "interesting" | Historical anecdotes |
| `thought_experiment` | "thought experiment", "imagine", "what if" | Thought experiment prompts |
| `everyday_analogy` | "everyday", "real life example" | Everyday life analogies |
| `counterintuitive_insight` | "counterintuitive", "surprising", "unexpected" | Counterintuitive insights |
| `interdisciplinary_bridge` | "interdisciplinary", "across", "other field" | Bridges to other disciplines |
| `frontier_curiosity` | "frontier", "future", "emerging" | Frontiers of current knowledge |
| `why_field_changed` | "changed", "shift", "paradigm" | Paradigm shifts in the field |
| `explore_next` | (default) | Next curiosity exploration suggestion |

## Intent Routing

Pattern matching against curiosity/exploration keywords. Domain resolution for topic-specific exploration.

## Response Structure

Responses use a `CURATED_CURIOSITY_MAP` with domain-keyed data. Each response includes:
- Interesting facts with context
- Connection explanations
- Thought experiment scenarios
- Analogy descriptions

## Safety Constraints

- Forbidden actions: modify-curriculum, alter-lifecycle-status, create-mastery-claims, generate-scores, invoke-external-llms, generate-fabricated-content
- **Fabrication guardrails**: Scans for requests to invent facts or anecdotes; returns governed refusal if detected
- All content is from curated data, not generative
- All responses include disclaimer: "Curriculum files remain unmodified"

## Integration Points

- **Context Builder**: Reads current position for contextual curiosity prompts
- **Domain resolution**: Shared across A5-A10
- **Fabrication detection**: Same pattern as A9

## UI Behavior

When A10 is selected:
- Quick actions show 10 curiosity prompts
- Responses use curiosity-card section types
- Facts rendered as highlighted callout cards
- Thought experiments as scenario descriptions

## Examples of Use

- "Did you know something surprising about neural networks?" → Did you know mode with facts
- "How is machine learning connected to biology?" → Interdisciplinary bridge
- "What would happen if we removed all activation functions?" → Thought experiment
- "What's counterintuitive about gradient descent?" → Counterintuitive insight

## Limitations

- Curiosity content is from curated data, not generative
- Fabrication guardrails block requests for invented facts
- Limited to seeded curiosity content per domain
- Cannot dynamically discover new connections

## Related Chapters

- [Didactic Agent Runtime](11-didactic-agent-runtime.md)
- [Learning Experience](06-learning-experience.md)
- [Known Limitations](30-known-limitations.md)

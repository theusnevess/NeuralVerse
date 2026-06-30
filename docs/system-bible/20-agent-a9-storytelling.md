# Agent A9: Storytelling & Learning Journey

## Purpose

Provides narrative context for learning: origin stories, journey mapping, concept timelines, problem-driven narratives, and human perspectives that make technical content more engaging.

## Educational Role

Learning journey companion. A9 frames technical content within relatable narratives, helping users understand the human context and problem-driven evolution of AI concepts.

## Supported Modes

10 intents:

| Mode | Trigger Keywords | Behavior |
|------|-----------------|----------|
| `origin_story` | "origin", "how it started", "born" | Origin story of a concept or field |
| `learning_journey` | "journey", "path", "learning path" | Learning journey narrative |
| `concept_timeline` | "timeline", "evolution", "history" | Concept evolution timeline |
| `problem_driven` | "problem", "why was it created" | Problem-driven origin narrative |
| `human_perspective` | "person", "researcher", "who" | Human perspective on discovery |
| `cross_lesson` | "connect lessons", "bridge" | Cross-lesson narrative connection |
| `mental_model` | "mental model", "think about" | Mental model for understanding |
| `scientific_journey` | "science", "discovery", "breakthrough" | Scientific discovery journey |
| `motivation_relevance` | "why learn", "relevance", "important" | Motivation and relevance framing |
| `personalized_orientation` | (default) | Personalized orientation narrative |

## Intent Routing

Pattern matching against narrative/storytelling keywords. Domain resolution for topic-specific narratives.

## Response Structure

Responses use a `CURATED_NARRATIVE_MAP` with domain-keyed data. Each response includes:
- Narrative story with contextual framing
- Timeline of key developments
- Key researchers and their contributions (descriptive)
- Connection to current curriculum content

## Safety Constraints

- Forbidden actions: modify-curriculum, alter-lifecycle-status, create-mastery-claims, generate-scores, invoke-external-llms, generate-fabricated-content
- **Fabrication guardrails**: Scans for requests to invent history, quotes, or anecdotes; returns governed refusal if detected
- Narratives are based on curated data, not generative storytelling
- All responses include disclaimer: "Curriculum files remain unmodified"

## Integration Points

- **Context Builder**: Reads current position for contextual narratives
- **Curriculum Service**: Provides content for narrative framing
- **Fabrication detection**: Built-in patterns for refusal of invented content

## UI Behavior

When A9 is selected:
- Quick actions show 10 narrative/ story prompts
- Responses use narrative-card section types
- Timelines rendered as vertical timeline lists

## Examples of Use

- "Tell me the story of how deep learning started" → Origin story with timeline
- "Why was the attention mechanism invented?" → Problem-driven narrative
- "Create a learning journey for computer vision" → Learning journey narrative
- "What mental model should I use for understanding transformers?" → Mental model

## Limitations

- Stories are based on curated facts, not generative storytelling
- Cannot invent new narratives or historical events
- Fabrication guardrails may block creative requests
- Human perspectives are descriptive, not authoritative

## Related Chapters

- [Didactic Agent Runtime](11-didactic-agent-runtime.md)
- [Learning Experience](06-learning-experience.md)
- [Security Model](26-security-model.md)

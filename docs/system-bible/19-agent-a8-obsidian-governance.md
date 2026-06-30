# Agent A8: Obsidian & Knowledge Governance

## Purpose

Provides knowledge management guidance: note-taking strategies, organization recommendations, tag suggestions, collection management, and knowledge review planning.

## Educational Role

Knowledge architect. A8 helps users build and maintain their personal knowledge base extracted from the curriculum.

## Supported Modes

10 intents:

| Mode | Trigger Keywords | Behavior |
|------|-----------------|----------|
| `permanent_note` | "note", "write note", "summary" | Permanent note template and guidance |
| `backlink_recommendation` | "backlink", "connect", "link" | Backlink/reference recommendations |
| `tag_recommendation` | "tag", "label", "categorize" | Tag recommendations for content |
| `collection_organization` | "collection", "organize", "group" | Collection organization suggestions |
| `concept_map` | "concept map", "mind map", "graph" | Concept map structure suggestions |
| `knowledge_gap` | "gap", "missing", "review" | Knowledge gap identification |
| `note_refinement` | "refine", "improve note", "enhance" | Note refinement suggestions |
| `atomic_splitting` | "split", "atomic", "break down" | Note atomic decomposition guidance |
| `knowledge_review` | "review", "spaced repetition" | Knowledge review scheduling |
| `obsidian_strategy` | (default) | Overall knowledge management strategy |

## Intent Routing

Pattern matching against knowledge management keywords. Domain resolution for context-appropriate recommendations.

## Response Structure

Responses use a `CURATED_KNOWLEDGE_MAP` with domain-keyed data. Each response includes:
- Note templates with structured sections
- Tag recommendations with category groupings
- Collection organization suggestions
- Knowledge gap analysis with curriculum references
- Review schedules

## Safety Constraints

- Forbidden actions: modify-curriculum, alter-lifecycle-status, create-mastery-claims, generate-scores, invoke-external-llms, modify-governance-policies
- Cannot modify governance policies or curriculum structure
- Note suggestions are advisory; notes are stored locally
- All responses include disclaimer: "Canonical curriculum files remain unmodified"

## Integration Points

- **Personalization Service**: Reads existing notes, tags, and collections for context
- **Context Builder**: Receives current content for note-specific recommendations
- **Curriculum Service**: Reads artifact metadata for knowledge organization

## UI Behavior

When A8 is selected:
- Quick actions show 10 knowledge management prompts
- Responses use knowledge-card section types
- Tag recommendations shown as badge lists
- Note templates shown as structured outlines

## Examples of Use

- "Help me write a note on transformer architecture" → Permanent note template
- "What tags should I use for attention-related content?" → Tag recommendations
- "How should I organize my deep learning notes?" → Collection organization
- "What am I missing in my understanding of RNNs?" → Knowledge gap analysis

## Limitations

- Cannot modify or organize existing notes directly
- Tag and collection suggestions are advisory
- Knowledge gap analysis is based on curriculum structure, not actual user knowledge
- No integration with external note-taking tools

## Related Chapters

- [Didactic Agent Runtime](11-didactic-agent-runtime.md)
- [Personalization System](22-personalization-system.md)
- [Governance Model](27-governance-model.md)

# Agent A1: Didactic Architecture

## Purpose

Provides structured pedagogical guidance using multiple teaching strategies. Acts as the primary learning assistant, helping users understand concepts through explanation, simplification, deepening, analogy, comparison, and socratic dialogue.

## Educational Role

Primary teaching agent. A1 is the default agent for general learning queries. It activates when no other agent matches the query more specifically.

## Supported Modes

12 intents:

| Mode | Trigger Keywords | Behavior |
|------|-----------------|----------|
| `simplify` | "simplify", "explain simply", "eli5" | Simplified explanation with everyday analogy |
| `deepen` | "deepen", "explain deeply", "detail" | Technical deep-dive with formal definitions |
| `compare` | "compare", "vs", "difference between" | Structured comparison using Comparison Engine |
| `analogy` | "analogy", "like" | Analogy generation from Analogy Engine |
| `misconception` | "misconception", "mistake", "wrong" | Common misconception detection from library |
| `summarize` | "summarize", "summary", "overview" | Concise summary of selected content |
| `connect` | "connect", "related", "relationship" | Cross-concept connection mapping |
| `socratic` | "socratic", "question", "reflect" | Socratic questioning from Socratic Engine |
| `reflection` | "reflect", "review", "solidify" | Reflective learning prompts |
| `transfer` | "apply", "real world", "practical" | Real-world application guidance |
| `reading` | "reading", "navigate", "position" | Reading guidance for current artifact |
| `explain` | (default) | General explanation |

## Intent Routing

A1 uses keyword pattern matching against `INTENT_PATTERNS` map to detect the user's intent from their query text. Default intent is `explain`.

## Response Structure

Responses are structured as typed sections. The A1 response types include:

- Comparison tables (from Comparison Engine)
- Socratic question lists (from Socratic Engine)
- Analogy cards (from Analogy Engine)
- Misconception profiles (from Misconception Library)
- Explanation blocks (generated from context + mode)

## Safety Constraints

- Forbidden actions: modify-curriculum, alter-lifecycle-status, create-mastery-claims, generate-scores, invoke-external-llms
- Refuses requests to modify or create curriculum content
- All educational content is generated from curated data and deterministic rules

## Integration Points

- **Comparison Engine**: Used for `compare` mode
- **Analogy Engine**: Used for `analogy` mode
- **Misconception Library**: Used for `misconception` mode
- **Socratic Engine**: Used for `socratic` mode
- **Context Builder**: Reads current curriculum position and learning depth
- **Curriculum Service**: Reads artifact content for explanation

## UI Behavior

When A1 is selected in the agent panel:
- Quick action buttons show: explain simply, explain deeply, give analogy, compare, find misconceptions, socratic mode, reflection prompts, connect concepts, summarize
- An explanation mode selector appears (simplify / deepen / analogical / comparative / socratic)
- Responses use formatted cards, tables, and lists

## Examples of Use

- "Explain the attention mechanism in transformers" → Deepen mode with technical explanation
- "What is the difference between CNN and Transformer?" → Compare mode with comparison table
- "Explain overfitting like I'm five" → Simplify mode with everyday analogy
- "What are common misconceptions about gradient descent?" → Misconception mode

## Limitations

- Explanations are limited to the scope of the curriculum content
- Cannot provide real-time or external information
- Analogy engine covers 14 topics; other topics receive generic fallback
- Comparison engine covers 10 known comparisons; unknown pairs use generic comparison

## Related Chapters

- [Didactic Agent Runtime](11-didactic-agent-runtime.md)
- [Governance Model](27-governance-model.md)
- [Learning Experience](06-learning-experience.md)

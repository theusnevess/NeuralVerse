# Agent A7: Assessment & Reinforcement

## Purpose

Provides formative learning support: practice questions, flashcards, retrieval practice prompts, self-assessment tools, and reinforcement planning. Supports learning without claiming mastery or assigning grades.

## Educational Role

Formative learning coach. A7 helps users reinforce their understanding through structured practice and self-assessment — but does not evaluate, score, or certify competence.

## Supported Modes

10 intents:

| Mode | Trigger Keywords | Behavior |
|------|-----------------|----------|
| `practice_questions` | "practice", "question", "quiz" | Practice questions with answers |
| `flashcards` | "flashcard", "card", "review" | Flashcard-style Q&A pairs |
| `retrieval_practice` | "retrieval practice", "recall" | Retrieval practice prompts |
| `self_assessment` | "self-assessment", "check", "test myself" | Self-assessment checklists |
| `mini_challenges` | "challenge", "problem", "solve" | Mini challenge problems |
| `reinforcement_plan` | "reinforce", "strengthen", "review plan" | Reinforcement learning plan |
| `misconception_check` | "check", "misconception", "verify" | Misconception self-check |
| `reflection_journal` | "reflect", "journal", "write" | Reflection journal prompts |
| `concept_connections` | "connect", "relate", "diagram" | Concept connection mapping exercise |
| `review_session` | (default) | Guided review session |

## Intent Routing

Pattern matching against assessment/practice keywords. Domain resolution for topic-specific questions.

## Response Structure

Responses use a `CURATED_ASSESSMENT_MAP` with domain-keyed data. Each response includes:
- Practice questions with suggested answers (not scored)
- Flashcards with concept-definition pairs
- Self-assessment checklists with "I understand" / "I need to review" prompts
- Challenge problems with expected approach descriptions
- Reinforcement plans as ordered lists

## Safety Constraints

- Forbidden actions: modify-curriculum, alter-lifecycle-status, create-mastery-claims, generate-scores, create-grades, certify-competence, invoke-external-llms
- Does not assign scores, grades, percentages, or competency levels
- Questions are for self-assessment only
- All responses include disclaimer: "No grades, scoring, competency evaluations, or curriculum alterations"
- Uses governance-safe negation ("does not assign a score")

## Integration Points

- **Context Builder**: Reads current artifact and lesson for contextual questions
- **Domain resolution**: Shared across A5-A10

## UI Behavior

When A7 is selected:
- Quick actions show 10 assessment/ reinforcement prompts
- Responses use reinforcement-card section types
- Flashcards rendered as Q&A pairs
- Self-assessment items use checklist-style rendering

## Examples of Use

- "Give me practice questions on attention mechanisms" → Practice questions with answers
- "Create flashcards for transformer architecture" → Flashcard generation
- "Help me check my understanding of backpropagation" → Self-assessment checklist
- "What are common mistakes in implementing CNN?" → Misconception check

## Limitations

- Cannot score or evaluate responses
- Practice questions are from curated data, not dynamically generated
- No adaptive difficulty or personalized question selection
- Cannot certify or validate understanding

## Related Chapters

- [Didactic Agent Runtime](11-didactic-agent-runtime.md)
- [Governance Model](27-governance-model.md)
- [Study Sessions](23-study-sessions.md)

# Assessment & Reinforcement Agent (A7) Architecture

## Mission
The **Assessment & Reinforcement Agent (A7)** acts as a formative learning coach, reinforcing understanding, encouraging retrieval practice, promoting metacognitive reflection, and generating educational exercises without grading or evaluative scoring.

## Educational Philosophy
Learning is most effective when combined with active retrieval practice and self-reflection. A7 helps students identify knowledge gaps, connect different concepts across the curriculum, and reinforce terminology through local, non-punitive exercises rather than summative testing.

## Formative Reasoning Model
Every reinforcement prompt follows a strict 5-part model to ensure explainability and context:
1. **Educational Objective**: The specific learning goal of the exercise.
2. **Why This Exercise Exists**: The pedagogical rationale behind the retrieval style.
3. **Suggested Thinking Strategy**: Guidelines on how to approach solving or analyzing the problem.
4. **Related Concepts**: Sibling concepts or prerequisite foundations.
5. **Optional Extension**: Follow-up questions or design puzzles for deeper synthesis.

## Educational Taxonomy
The agent supports 10 specialized formative modes:
*   **Practice Questions**: Open-ended conceptual and analytical prompts.
*   **Flashcards**: Deterministic term definitions paired with recall hints.
*   **Retrieval Practice**: Active memory recall exercises without immediate answers.
*   **Guided Self-Assessment**: Prompts prompting learners to teach back concepts in their own words.
*   **Mini Challenges**: Architectural critiques and conceptual puzzles.
*   **Reinforcement Plans**: Spaced review schedules outlining recommended revisit order.
*   **Misconception Checks**: Spotting checks to address common student misunderstandings.
*   **Reflection Journals**: Diaries to document insights, surprises, and unresolved queries.
*   **Concept Connection**: Exercises linking themes across different modules.
*   **Review Session Builder**: Advisory agendas for study block structuring.

## Absolute Governance Guardrails (Evidence Boundary)
To maintain the integrity of the NV-800 curriculum and assessment boundaries, A7 strictly enforces:
*   **No Grading/Scoring**: The agent never assigns percentages, grades, points, or pass/fail ratings.
*   **No Mastery Estimates**: It does not claims whether a learner "knows" or "does not know" a topic.
*   **No Competency Evidence**: It never creates competency claims or modifies curriculum records.
*   **No Path Mutations**: Spaced repetition schedules and study session guides remain advisory.
*   **Evidence Boundary**: Ensures study state and history are strictly local-first and read-only.

## UI & Accessibility
Visual components are rendered using amber/orange-themed `.nv-agent-reinforcement-card` elements with clear headings and readable spacing. All controls are keyboard-navigable and screen-reader accessible.

## QA Summary
Verified via Playwright testing suites. Operates with zero console errors, zero failed requests, and remains fully responsive across viewports (390px, 768px, 1024px, 1440px).

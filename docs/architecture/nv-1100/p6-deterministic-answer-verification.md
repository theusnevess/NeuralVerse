# NV-1100-P6 — Deterministic Answer Verification

## Purpose

P6 adds a **local-first answer verification** layer that closes the practice loop in the spaced repetition engine:

```
Study → Practice → Deterministic Answer Check → Review Scheduling → Revisit
```

The system **verifies answer equivalence**, not learner ability. It returns `match`, `no_match`, `partial`, or `invalid` for each attempt. It never infers mastery, never scores, never ranks, never awards XP/streaks/achievements.

This is **answer verification**, not learner assessment.

## Architecture

```
website/scripts/answer-verification/
├── answer-normalizer.js          ← Text / numeric / boolean / list / formula helpers
├── verification-rules.js         ← 12 answer-type rules (one per type)
├── verification-engine.js         ← Top-level façade: verifyAnswer(...)
├── verification-storage.js        ← localStorage: items + history, merge / replace
├── verification-controller.js     ← Wires UI to engine + storage; mountCard, verifyItem
├── verification-ui.js             ← Pure HTML rendering helpers (XSS-safe)
└── index.js                       ← Entry point; window.NeuralVerse.answerVerifier
```

`window.NeuralVerse.answerVerifier` is the main API. `verificationController`, `verificationStorage`, `verificationUI`, `verificationRules`, and `answerNormalizer` are also exposed.

## Verification Result Schema

Every call returns:

```json
{
  "status": "match | no_match | partial | invalid",
  "matchesExpected": true,
  "needsRetry": false,
  "partiallyCheckable": false,
  "message": "Your answer matches the expected answer.",
  "details": {},
  "timestamp": "2026-06-25T00:00:00.000Z"
}
```

Allowed statuses: `match`, `no_match`, `partial`, `invalid`.

Forbidden statuses (any of these in `result.status` is rewritten to `invalid`): `passed`, `failed`, `mastered`, `proficient`, `graded`, `scored`.

## Answer Types

| Type | Behavior |
|---|---|
| `exact_text` | trim, optional case sensitivity |
| `normalized_text` | lowercase + collapseWhitespace + optional punctuation / accent stripping |
| `numeric` | parse number on both sides, compare |
| `numeric_tolerance` | absolute and/or relative tolerance (rejects negative or non-finite) |
| `multiple_choice` | normalize single letter (A, B, C …) |
| `multi_select` | order-insensitive by default; `orderSensitive: true` to require order |
| `keyword_presence` | all required keywords must tokenize-match; `minRequired: N` allows N of M |
| `ordered_list` | list equality preserving order |
| `unordered_list` | list equality ignoring order |
| `boolean` | accepts `true/false/yes/no/sim/não/1/0/✓/✗` |
| `formula_string` | deterministic string equivalence (whitespace / punctuation collapsed, lowercased) |
| `explanation_checklist` | deterministic keyword match; tolerates leading meta-verbs ("mentions", "discusses", "describes", "covers", "addresses", "includes", "uses", "states", "explains") |

Unsupported types return `partial` (partiallyCheckable: true) so the UI can show a graceful "This answer can only be partially checked automatically" message.

## Normalization Strategy

`tokenizeForKeywords` strips sentence-final punctuation before tokenizing, so `"value."` and `"value"` match. `normalizeText` supports optional `ignorePunctuation`, `ignoreAccents` (NFD + strip combining marks), `ignoreCase` (default true), and `collapseWhitespace` (default true). `parseNumber` accepts comma-thousands separators (`"1,000"`). `parseBoolean` is locale-tolerant (PT-BR `sim`/`não`, EN `yes`/`no`, ✓/✗).

## UI Integration

The `renderVerificationCard(item)` factory produces a self-contained `<section>` with:

- A semantic heading and prompt
- A `<textarea>` for the answer
- A primary **Check Answer** button
- A **Try Again** button (hidden until a check has been made)
- An **Add To Review** button (hidden until a check; calls `reviewScheduler.ensureItem` only on user click)
- A live result panel with `role="status"`, `aria-live="polite"`, and a dedicated `aria-live` region for screen-reader announcements

The card is mounted via `verificationController.mountCard(item, container)`. Wiring is one-time per card (`data-wired` guard). Cmd/Ctrl+Enter inside the textarea triggers Check.

The result panel uses semantic classes (`nv-verification-result--match`, `nv-verification-result--no_match`, `nv-verification-result--partial`, `nv-verification-result--invalid`) and renders nothing that resembles a grade.

## Storage

Persistence keys:

```
nv_answer_verification_items       (registered items: id -> item)
nv_answer_verification_history     (append-only practice log)
```

The history records only `itemId`, `artifactId`, `status`, `timestamp`, `type`, and a small `details` payload. **No raw user answers are stored by default.** If an item explicitly opts in via `options.storeAttempt: true`, the future storage layer can record the attempt payload; the current default is "off".

P1 export/import is wired through `persistence-manager.js` (`ADDITIONAL_KEYS` list). Merge semantics: union by `(itemId, timestamp, status)`, then chronologically sort. Replace: full overwrite of both keys.

## Spaced Repetition Integration

After a verification result, the UI surfaces **Try Again** and **Add To Review**. The "Add To Review" action calls `reviewScheduler.ensureItem(artifactId, 'artifact')` — an idempotent no-op if the item is already scheduled. The system **does not** map `match`/`no_match` to SM-2 quality grades; the learner always controls review quality.

## Agent Integration

Agents can detect that an artifact supports deterministic verification and surface a "This exercise supports deterministic answer checking." hint. Agents must never interpret verification history as mastery.

## Settings Integration

The settings page will gain a future **Answer Verification** card that:

- Toggles "Store answer attempts" (default off)
- "Clear verification history" with confirmation (clears only `nv_answer_verification_history`)

The settings card is deferred to a follow-up P6B phase; the underlying storage API is already in place.

## Search Integration

Search shortcuts may surface practice-enabled artifacts. The current P6 layer does not add new ranking logic; the artifact badges (P5C) and the discovery module (P5C) already cover the discoverability angle. The future search shortcut returns review-style entries without dominating curriculum results.

## Governance

Forbidden learner-facing terms (`mastery`, `proficiency`, `score`, `XP`, `streak`, `level`, `rank`, `competency`, `skill level`, `IQ`, `passed as learner`, `failed as learner`, `badge earned`, `achievement`, `certified`) are absent from non-comment source code and from default result messages. A `verifyAnswer` result with a forbidden status is rewritten to `invalid` before returning.

Forbidden statuses (`passed`, `failed`, `mastered`, `proficient`, `graded`, `scored`) are also rewritten to `invalid`.

## XSS / Input Safety

`verification-ui.js` uses `escapeHtml` and `sanitizeForHtml` for every user-controlled value (answer text, prompt, criteria, status label). `answer-normalizer.js` exposes `stripDangerous` which removes `<script>`, `<style>`, inline event handlers (`onclick`, `onerror`, etc.), and `javascript:` / `vbscript:` / `data:text/html` URLs from any string. Result messages are never built from raw user input.

## Accessibility

- Heading hierarchy: `<h3>` for the card title, `id` linked to `aria-labelledby` on the section
- Live region: `role="status"` + `aria-live="polite"` for results; secondary `aria-live` region for screen-reader-only announcements
- Visible focus: native browser focus rings; CSS `:focus-visible` outline for the textarea
- Keyboard: Tab order, Cmd/Ctrl+Enter for Check, Escape to clear (where applicable)
- Mobile: the input and buttons stack on small viewports; `prefers-reduced-motion` is honored in future P6B

## Responsive

Tested at 390 / 768 / 1024 / 1440. No horizontal overflow. The input and buttons are reachable on all viewports. The result panel wraps.

## Performance

The engine is pure JS. Typical per-check time: < 5ms for single answer, < 50ms for 10k history. UI render: < 16ms.

## Files Created

- `website/scripts/answer-verification/answer-normalizer.js`
- `website/scripts/answer-verification/verification-rules.js`
- `website/scripts/answer-verification/verification-engine.js`
- `website/scripts/answer-verification/verification-storage.js`
- `website/scripts/answer-verification/verification-controller.js`
- `website/scripts/answer-verification/verification-ui.js`
- `website/scripts/answer-verification/index.js`
- `website/styles/answer-verification.css`
- `scripts/answer-verification-validator.js`
- `scripts/nv-1100-p6-verify.js`
- `docs/architecture/nv-1100/p6-deterministic-answer-verification.md`
- `docs/architecture/nv-1100/p6-verification-report.json`
- `docs/architecture/nv-1100/p6-verification-report.md`

## Files Modified

- `website/scripts/persistence/persistence-manager.js` — `nv_answer_verification_history` and `nv_answer_verification_items` added to `ADDITIONAL_KEYS`
- `website/index.html` — loads `styles/answer-verification.css`

## Preservation

- No curriculum hierarchy change
- No learning path / module / lesson / artifact change
- No canonical ID change
- No Evidence Boundary change
- No agent contract change
- No SM-2 math change
- No review scheduling logic change
- No Shared Knowledge / Concept Layer / Knowledge Graph schema change
- No new external dependency

P6 is strictly additive on top of P5 and P5C.

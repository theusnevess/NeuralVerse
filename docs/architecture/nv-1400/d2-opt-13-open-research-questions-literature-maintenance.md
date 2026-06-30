# D2-OPT-13 — Open Research Questions & Literature Maintenance

## Purpose

This phase resolves two freeze blockers identified by the D2 Extreme Audit:

1. **Capability 7 — Open Research Questions** was entirely missing.
2. **Continuous Literature Maintenance** was only partially implemented.

D2-OPT-13 provides the canonical models, kernels, validation layers, certification integration, and test coverage required to satisfy Research-Agent-vNext requirements for these capabilities.

## Why This Phase Exists

The D2 Extreme Audit determined that:

- No explicit model for open research questions existed (no types, no validation, no tests).
- Literature maintenance was structurally supported through lifecycle and governance fields, but lacked a dedicated signal model, dedicated validation, and dedicated test coverage.

Without these capabilities, D2 could not proceed to freeze.

## Open Research Question Model

### Architecture

Open research questions are governed metadata records. They represent unresolved scientific challenges, limitations, and open directions that the Research Agent exposes to downstream agents.

The model is **descriptive**, not **generative**:

- Question text is supplied by input.
- The kernel never writes, infers, or generates question text.
- The kernel never predicts future research directions.
- All questions must be governance-backed and provenance-traced.

### Types

| Type | Purpose |
|---|---|
| `ResearchOpenQuestion` | Core question record with text, category, status, and associations |
| `ResearchOpenQuestionRegistry` | Deterministic collection of questions |
| `ResearchOpenQuestionTrace` | Validation trace for the composition |
| `ResearchOpenQuestionProvenance` | Provenance metadata for each question |
| `ResearchOpenQuestionDecision` | Per-question validation decision |

### Canonical Categories

```
unresolved_limitation
scaling_challenge
robustness_issue
fairness_concern
efficiency_bottleneck
unexplored_direction
evaluation_gap
theoretical_gap
deployment_risk
reproducibility_issue
```

### Canonical Statuses

```
open
partially_addressed
actively_researched
contested
resolved
deprecated
```

### Boundary Rules

- `questionText` is governed metadata supplied by input.
- The kernel must not write or infer question text.
- The kernel must not predict future research.
- All questions must have provenance, source, rationale, and governance status.

## Literature Maintenance Model

### Architecture

Literature maintenance signals are governed metadata records that indicate when references, evidence, or terminology require human review or governance action.

The model is **advisory**, not **automatic**:

- Signals record what needs attention.
- Recommended actions are metadata, not commands.
- The kernel never updates references, rewrites content, or fetches newer literature.
- All actual revisions remain governance-controlled.

### Types

| Type | Purpose |
|---|---|
| `ResearchMaintenanceSignal` | Core signal record with type, priority, action, and affected references |
| `ResearchMaintenanceRegistry` | Deterministic collection of signals |
| `ResearchMaintenanceTrace` | Validation trace for the composition |
| `ResearchMaintenanceProvenance` | Provenance metadata for each signal |
| `ResearchMaintenanceDecision` | Per-signal validation decision |

### Canonical Signal Types

```
obsolete_reference
stronger_evidence_available
survey_supersession
terminology_evolution
industrial_consensus_shift
stale_verification
missing_review_status
governance_status_outdated
deprecated_artifact
replacement_reference_available
```

### Canonical Priorities

```
low
medium
high
critical
```

### Canonical Actions

```
review_required
replace_reference
add_supporting_reference
update_terminology
mark_deprecated
preserve_historical_version
escalate_to_governance
no_action
```

### Boundary Rules

- Maintenance signals never automatically modify canonical content.
- Maintenance only records governed signals and recommended actions.
- The kernel never updates references, rewrites content, fetches newer literature, or infers consensus shifts.
- All actual revisions remain governance-controlled.

## Provenance Requirements

Both open questions and maintenance signals require:

- `provenance.source` — who provided the signal/question
- `provenance.rationale` — why this signal/question exists
- `provenance.governanceStatus` — governance state
- `provenance.referenceId` — link to the source reference

## Validation Strategy

### Open Questions Validation

| Code | Meaning |
|---|---|
| `OPENQ_UNKNOWN_CATEGORY` | Category not in canonical list |
| `OPENQ_UNKNOWN_STATUS` | Status not in canonical list |
| `OPENQ_DUPLICATE_ID` | Duplicate question ID in registry |
| `OPENQ_DUPLICATE_QUESTION` | Duplicate question text in registry |
| `OPENQ_MISSING_TEXT` | Question text is empty |
| `OPENQ_MISSING_CATEGORY` | Category is missing |
| `OPENQ_MISSING_EVIDENCE` | No associated evidence |
| `OPENQ_MISSING_SOURCE` | Source is missing |
| `OPENQ_MISSING_PROVENANCE` | Provenance or rationale missing |
| `OPENQ_INVALID_GOVERNANCE` | Invalid governance status |
| `OPENQ_EMPTY_REGISTRY` | Registry has no questions |
| `OPENQ_GENERATED_CONTENT_FORBIDDEN` | Generated content detected |
| `OPENQ_SPECULATIVE_CONCLUSION_FORBIDDEN` | Speculative content detected |

### Maintenance Validation

| Code | Meaning |
|---|---|
| `MAINT_UNKNOWN_SIGNAL_TYPE` | Signal type not in canonical list |
| `MAINT_UNKNOWN_PRIORITY` | Priority not in canonical list |
| `MAINT_UNKNOWN_ACTION` | Action not in canonical list |
| `MAINT_DUPLICATE_SIGNAL` | Duplicate signal ID in registry |
| `MAINT_MISSING_SOURCE` | Source is missing |
| `MAINT_MISSING_PROVENANCE` | Provenance or rationale missing |
| `MAINT_MISSING_RATIONALE` | Rationale is missing |
| `MAINT_MISSING_AFFECTED_REFERENCE` | No affected reference IDs |
| `MAINT_INVALID_REPLACEMENT_REFERENCE` | Replacement signal without replacement IDs |
| `MAINT_EMPTY_REGISTRY` | Registry has no signals |
| `MAINT_AUTOMATIC_REVISION_FORBIDDEN` | Automatic revision detected |
| `MAINT_LIVE_SEARCH_FORBIDDEN` | Live search detected |
| `MAINT_INVALID_GOVERNANCE` | Invalid governance status |

## Deterministic Guarantees

- All composition functions are pure functions with no side effects.
- All registries sort deterministically by ID.
- All traces declare `deterministic: true`, `randomUsed: false`, `timeDependency: false`.
- No `Math.random`, `Date.now`, `performance.now`, `new Date()`, or `crypto.randomUUID`.
- No filesystem, network, browser, or environment variable access.

## Integration with Certification

Two new quality dimensions were added to the Certification Engine:

- `open_question_integrity` — Validates open question artifacts
- `maintenance_integrity` — Validates maintenance artifacts

Certification flags:

- Missing open question provenance
- Missing maintenance provenance
- Open questions without evidence
- Maintenance signals without affected reference
- Maintenance signal that implies automatic revision without replacement references
- Generated/speculative open question fields

## Integration with Facade

The `ResearchArtifact` interface now includes two optional fields:

- `openQuestionsArtifact?: ResearchArtifactWithOpenQuestions`
- `maintenanceArtifact?: ResearchArtifactWithMaintenance`

The `composeResearchArtifact()` function passes through these fields when present in input. The `certifyResearchArtifact()` function includes them in certification evaluation.

Backward compatibility is preserved: existing artifacts without these fields continue to work identically.

## Relationship with Governance Agent

Open questions and maintenance signals are governance-controlled:

- Governance status values: `canonical`, `accepted`, `provisional`, `deprecated`, `rejected`
- All questions and signals require governance status
- Actual revisions to canonical content remain under Governance Agent control
- The Research Agent only records signals; it never acts on them autonomously

## Explicit Non-Responsibilities

The Open Research Questions and Literature Maintenance kernels must NOT:

- Generate question text
- Infer open questions from evidence
- Predict future research directions
- Automatically update references
- Rewrite canonical content
- Fetch newer literature
- Call external APIs
- Use LLMs
- Infer scientific consensus
- Make automatic scientific conclusions

## Freeze Readiness Impact

With D2-OPT-13 implemented:

- Capability 7 (Open Research Questions) is now covered with types, kernels, validation, certification integration, and tests.
- Continuous Literature Maintenance is now covered with a dedicated signal model, validation, certification integration, and tests.
- Both freeze blockers from the D2 Extreme Audit are resolved.
- D2 is now eligible for a renewed extreme audit with potential freeze readiness.

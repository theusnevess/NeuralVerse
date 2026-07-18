---
title: BIP-M4 — Durable Workflow Infrastructure
canonical_id: NV-BIP-M4
version: 1.0.0
status: IMPLEMENTED
authority:
  - NV-BIP-000
  - BIP-M0
  - BIP-M1
  - BIP-M2
  - BIP-M3
owner: NeuralVerse Hub
language: en
created: 2026-07-18
last_reviewed: 2026-07-18
---

# BIP-M4 — Durable Workflow Infrastructure

## Status and scope

BIP-M4 implements the Backend-owned operational durable-workflow boundary.
The implementation is semantic-free: ACP remains the authority for agent
meaning and BIP-M3 remains the authority for publication transactions and
release identity.

| Capability | State |
|---|---|
| Durable workflow state model | IMPLEMENTED |
| Temporal client/worker host boundary | IMPLEMENTED (optional SDK edge) |
| ACP agent-worker adapter | IMPLEMENTED; semantic-free |
| Workflow and generation-job identities | IMPLEMENTED and persisted by BIP-M4 mappings |
| Command and activity idempotency | IMPLEMENTED |
| Retry classification and bounded policies | IMPLEMENTED |
| Timeouts, cancellation, review waits and revision limits | IMPLEMENTED |
| Publication wait and BIP-M3 activity boundary | IMPLEMENTED |
| Progress projections and audit events | IMPLEMENTED |
| BIP-M4 migration | IMPLEMENTED, additive, `b52000000001` |
| Real Temporal certification | PASS on a disposable local non-production Temporal dev server |

BIP-M5 through BIP-M9 are `NOT_AUTHORIZED`. ACP-RUNTIME-01 and new ACP
semantic-agent implementation are outside BIP-M4.

## Source-of-truth boundaries

- Temporal owns canonical workflow execution history, signals, timers and
  replay.
- PostgreSQL owns stable workflow and generation-job identities, command
  idempotency, operational projections and audit records.
- ACP owns semantic stage meaning, contribution validation and agent identity.
- BIP-M3 owns readiness gates, publication transactions and release identity.

PostgreSQL projections do not duplicate the complete Temporal history.

## Workflow topology

```text
command accepted
  -> idempotency validation
  -> generation-job identity resolved
  -> deterministic workflow identity
  -> ACP activities
  -> review wait / bounded revision loop
  -> readiness and publication wait
  -> BIP-M3 publication activity
  -> progress projection and audit
  -> terminal completion
```

`DurableAuthoringWorkflow` is a deterministic state model. It performs no
network, database, filesystem, clock, subprocess or ACP calls. A Temporal
workflow can replay its transitions; all side effects are activity concerns.

## Workflow identity and commands

`WorkflowCommand` is immutable and validates command, idempotency, package,
target, request and actor identities before workflow start. Stable IDs are
derived from the idempotency key, not from a mutable title or semantic
payload:

- `workflow_execution_id` is the Backend-owned durable identity;
- `temporal_workflow_id` is stable across activity retries;
- `temporal_run_id` changes when Temporal starts a new run or continue-as-new;
- `generation_job_id` is one logical generation identity;
- `command_id`, request, correlation and causation IDs are preserved.

The PostgreSQL `bip_m4_commands` projection enforces unique
`(operation_type, idempotency_key)` and command IDs. The same key and
fingerprint replays the existing response; a different fingerprint is an
`IDEMPOTENCY_CONFLICT`.

## ACP adapter

`ACPExecutionAdapter` accepts a provider-neutral request and delegates to an
injected ACP port. It validates execution and canonical-agent identity on the
returned result, preserves payload, warnings, confidence and UNKNOWN fields,
and does not contain prompts, model/provider/tool selection, semantic
branching, contribution repair or agent-specific retry rules. `FakeACPExecutor`
is a controlled test double and is never presented as live ACP runtime.

## Activities, retries and timeouts

Each activity has an explicit ID, version, logical idempotency key, timeout,
cancellation policy and retry policy. The stable key is composed of workflow
execution, logical stage, revision, target and activity version; Temporal
attempt number is never a semantic identity.

The failure taxonomy is:

```text
RETRYABLE | NON_RETRYABLE | CANCELLED | TIMEOUT |
MANUAL_REVIEW_REQUIRED | REVISION_REQUIRED | PUBLICATION_WAIT | UNKNOWN
```

Retry attempts and retry duration are bounded. Contract, authority, security,
unsupported-version and idempotency-conflict failures are non-retryable.
UNKNOWN is never retried indefinitely. Sensitive payloads, credentials and
stack traces are excluded from user-facing failure details.

The host requires explicit workflow, run, task, activity and human-review
timeouts. A real deployment supplies those values to the Temporal SDK at the
process edge; this repository does not silently invent production limits.

## Review, cancellation and revision

Review waits validate wait identity, actor identity and decision state.
Conflicting or duplicate signals are rejected or replayed as the existing
decision. Cancellation is idempotent and terminal states cannot be reopened.
Revision directives preserve lineage and stop at the command's bounded
`max_revisions`; exhaustion escalates to manual review. The model is ready for
Temporal signals and continue-as-new when history-size policy requires it.

## Publication boundary

`PublicationActivityAdapter` wraps the existing BIP-M3 publication service.
BIP-M4 does not reimplement readiness gates, release numbering or outbox
semantics. Publication waits preserve content-version identity and a stable
publication idempotency key, so worker retries resolve the BIP-M3 result rather
than creating a second release.

## Persistence and migration

`b52000000001_durable_workflow_infrastructure.py` is additive after the BIP-M3
head `b51000000001`. It creates projections for workflow executions,
generation jobs, commands, progress, audit events, review waits, revision
loops and publication waits. Existing migrations are unchanged and BIP-M3
data is preserved. JSONB is restricted to operational snapshots and does not
become semantic authority.

## Validation evidence

Observed in this environment:

- pure workflow, adapter, retry, timeout, cancellation, review and
  idempotency tests pass;
- 15 focused BIP-M4 tests pass and the full Backend suite reports 346 passed
  with 42 environment-gated integration skips;
- Ruff, mypy, compilation, migration graph and existing Backend tests are
  the required validation layers;
- PostgreSQL 16 is available for integration validation when a clean test
  database is supplied;
- the first implementation pass did not have a Temporal service available;
  this was subsequently certified against a disposable local non-production
  Temporal dev server without changing repository dependencies or lockfiles.
- Temporal acceptance covered task-queue delivery, approval signal handling,
  bounded activity retry, cancellation and worker restart/resume; the local
  server reported CLI 1.8.0 and Server 1.31.2.
- Activity-level idempotency validation reports zero duplicate contributions
  and zero duplicate releases; PostgreSQL 16 migration and integration
  validation remains PASS from the disposable database run.
- A real Temporal activity retry probe also passed around the publication
  adapter, with one external publication call for the repeated release key.

The honest status is therefore:

```text
BIP-M4: IMPLEMENTED
Temporal certification: PASS_LOCAL_NON_PRODUCTION
Worker restart and resume: PASS
Signal delivery: PASS
Cancellation: PASS
Bounded activity retry: PASS
Full ACP semantic runtime: NOT_IMPLEMENTED BY BIP-M4
```

## Security and exclusions

Temporal configuration is validated without logging credentials. Workflow
code cannot perform external service calls. No Frontend, S3, Redis, search,
learner-state, laboratory-run, assessment-attempt, delivery API,
reference-package or BIP-M5+ path is implemented by this phase.

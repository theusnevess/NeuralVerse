---
title: Stage 15 — Human Review and Publication Execution
canonical_id: NV-STAGE-15-REVIEW-PUBLICATION
version: 1.0.0
status: IMPLEMENTED
milestone_mapping: NOT_DEFINED
predecessor: 36ec8ce16be0566101b91c59edc47a2b7db20d39
---

# Stage 15 — Human Review and Publication Execution

Stage 15 adds the governed transition from a validated package handoff to an
authorized Backend publication command. Recommendation remains distinct from
human authorization, and publication remains a Backend transaction.

## Review governance

`HumanReviewRequirementsPolicy` deterministically derives the required
disciplines: editorial, scientific, mathematical when applicable,
source/citation, visual-scientific when applicable, asset-license when
applicable, accessibility, laboratory when applicable, assessment when
applicable and final authorization. Assignments bind a reviewer and role to a
single discipline. Submitted `ReviewRecord` values are immutable and include
candidate, source, asset, laboratory and assessment hashes.

Findings preserve severity, affected identities, evidence, lifecycle and
resolution evidence. P0, P1 and UNKNOWN findings block publication. Review
freshness, conflict-of-interest checks, bounded revision cycles and explicit
invalidation prevent a stale candidate from being authorized.

## Handoff, command and transaction boundary

The Backend consumes the committed ACP `PublicationHandoff` contract from
commit `315696b`. `PublicationHandoffIntake` preserves unknown compatible
fields and validates exact package, draft, readiness and snapshot references.
`PublishLearningPackageCommand` requires exact draft and handoff identity,
review bundle, final decision, actor role and idempotency key.

`Stage15PublicationCoordinator` validates the human decision and delegates the
database transaction to the existing canonical `PublicationTransactionService`.
That service atomically creates immutable content/release/manifest records,
publication audit and transactional outbox intent. It preserves block order,
release lineage, supersession and duplicate-publication protection.

## Durable persistence and workflow

Migration `b61000000001` extends the committed Stage 14 head
`b60000000001` with review bundles, requirements, assignments, immutable review
records, findings, final decisions and publication acknowledgements. JSONB is
limited to bounded evidence and policy snapshots; identities, hashes, states
and timestamps remain relational.

`Stage15ReviewPublicationWorkflow` provides the durable Temporal boundary for
review submission, final authorization, cancellation and publication activity.
No workflow signal can bypass human authorization.

## Validation evidence

- Stage 15 unit tests: 3 passed.
- PostgreSQL 16 migration upgrade, downgrade and re-upgrade: PASS.
- Temporal review/authorization/publication workflow: PASS.
- Stage 14 predecessor commit: present in ancestry.
- Ruff, Mypy and `git diff --check`: PASS.

## Non-goals and safety boundaries

No automated review approval, direct status-only publication, publication of
drafts, publication with blocking or UNKNOWN findings, mutation of published
payloads, automatic Obsidian-to-publication execution, production deployment,
Git automation, push or tag is implemented.

Canonical production publication remains subject to the exact handoff,
current review records, final human decision, asset/source/accessibility gates
and the committed Backend transaction.

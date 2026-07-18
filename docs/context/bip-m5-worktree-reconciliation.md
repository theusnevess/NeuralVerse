# BIP-M5 Worktree Reconciliation

Baseline: `59e5603dd801574b7b4f9ea910679f548964630f`.

## M5_CANONICAL_PERSISTENCE

`backend/src/neuralverse_backend/canonical_input.py`,
`backend/src/neuralverse_backend/canonical_persistence.py`,
`backend/src/neuralverse_backend/outbox.py`, and canonical model files under
`backend/src/neuralverse_backend/persistence/models/`.

## M5_REPOSITORY

`backend/src/neuralverse_backend/persistence/repositories/__init__.py` and
the SQLAlchemy repository files under `backend/src/neuralverse_backend/persistence/repositories/`.

## M5_MIGRATION

`b43000000001_canonical_intake_durable_workflow.py` is a preserved mixed
candidate: canonical input and outbox portions are reused; authoring-workflow
portions remain future-stage. `b44000000001_canonical_domain_persistence.py`
and `b45000000001_canonical_input_integrity.py` are the Stage 5 migrations.

## M5_PERSISTENCE_TEST

`backend/tests/unit/test_canonical_persistence.py`, persistence model tests,
metadata migration tests, and repository-focused tests.

## M5_DOCUMENTATION

The BIP-M2 and BIP-M5 documents in `docs/context/`.

## FUTURE_DURABLE_WORKFLOW

`authoring_workflow.py`, `persistence/models/authoring_job.py`, the preserved
cross-front workflow migration changes, `outbox.py` dispatch/workflow helpers,
`test_authoring_workflow.py`, and the durable-authoring/outbox documentation.

## PRE_EXISTING_UNRELATED

Cross-front HTTP changes and their tests are preserved as found and are not
used as canonical persistence.

## OBSOLETE_CANDIDATE / UNAUTHORIZED

None identified. No path was reset, restored, cleaned, stashed, staged, or
discarded.

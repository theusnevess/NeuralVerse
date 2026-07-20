---
title: BIP-M7 — Learner-State Platform
canonical_id: NV-BIP-M7
version: 1.0.0
status: IMPLEMENTED
authority:
  - NV-BIP-000
  - NV-BIP-M0
  - NV-BIP-M1
  - NV-BIP-M2
  - NV-BIP-M3
  - NV-BIP-M4
  - NV-BIP-M5
  - NV-BIP-M6
  - approved Cross-Front Integration Contract
owner: NeuralVerse Hub
language: en
created: 2026-07-20
last_reviewed: 2026-07-20
---

# BIP-M7 — Learner-State Platform

## Status and boundary

BIP-M7 implementation and PostgreSQL 16 certification are complete. It provides durable learner-owned
operational state. Canonical educational content remains owned by the content
and publication domains; learner records cannot mutate or delete it. BIP-M8
Frontend synchronization, identity-provider integration, advertising,
training, hidden mastery inference, and new execution sandboxes are not part
of this phase.

The stable local learner adapter is server-owned (`uuid5` of the NeuralVerse
local learner URI). Public request bodies never select a `learner_id`.
Authentication can replace this adapter through trusted request context without
changing the persistence contract. Queries are always learner scoped.

## Durable state model

The existing profile, exact content-version progress, notes, bookmarks,
collections, highlights and sessions are extended with revisions and restart
continuity metadata. BIP-M7 adds allow-listed versioned preferences, note
revision history and explicit conflicts, feedback, state conflicts, portable
exports/imports, idempotency records, durable deletion jobs and minimal
deletion audit residue. Laboratory runs/evidence and assessment
attempts/evidence remain explicit operational records and are never converted
to mastery scores.

Progress references an exact `content_version_id` and stores a bounded fraction
from 0 through 1. Notes are revisioned append/update records; conflicting
updates retain the client alternative. Sessions expose revision tokens and
continuity metadata. Preferences are versioned JSONB values behind an
allow-list; arbitrary JSON is not accepted.

## API contract

The mounted `/api/v1/learner` router exposes state, progress, notes, sessions,
laboratory runs, assessment attempts, export, import, deletion and deletion
status. Mutations require `Idempotency-Key`; mutable updates require `If-Match`
(`*` for first write or a numeric revision). Replays with the same payload
return the original result; key reuse with a different payload returns
`LEARNER_IDEMPOTENCY_CONFLICT`. Revision mismatches return
`LEARNER_STATE_CONFLICT`, missing preconditions return `428`, and exact
resource-version failures return `RESOURCE_NOT_FOUND` or
`LEARNER_RESOURCE_VERSION_MISMATCH`.

Responses expose resource IDs, schema version, timestamps and revision/ETag
tokens. ORM names, storage credentials, private keys, prompts, answer keys,
raw audit payloads and training consent flags are never exposed.

## Portability and deletion

`learner-state-export:1.0.0` is canonical JSON with a SHA-256 checksum and
exact content-version references. Import validates schema and checksum,
supports dry-run, and applies only learner-scoped records. Deletion is an
idempotent durable job: child learner records and laboratory/assessment rows
are purged, the profile is retained as a minimal non-identifying tombstone so
the deletion audit can remain referentially safe, and canonical content,
assets, releases and other learners are untouched.

## Privacy, security and observability

Learner state is not a search or vector index and has no training, advertising,
analytics-warehouse or hidden mastery path. Audit rows record operation,
opaque learner reference, authority, purpose/correlation, result and safe
counts only; note bodies, assessment responses and laboratory inputs are not
logged. Foreign keys use `RESTRICT` rather than destructive cascades into
canonical content. Transactional writes cover revision changes, conflict
records, evidence references, imports and deletion phases.

## Migration and validation

Migration `b55000000001_learner_state_platform` is additive from finalized
BIP-M6/BIP-M5 head `b53000000001`. It adds only learner-owned tables and
revision metadata; no historical migration or canonical table is rewritten,
and no Frontend, advertising, vector, mastery or training table is created.

The validation matrix covers exact-version foreign keys, optimistic
concurrency, idempotent retries, append-only evidence policy, restart state
restoration, export/import checksum and round-trip semantics, cross-learner
isolation, deletion idempotency, and privacy-boundary scans. PostgreSQL 16
upgrade, rollback, concurrency, restart, backup/restore and semantic
certification passed on disposable task-owned infrastructure. This
implementation does not claim a production
identity provider or BIP-M8 synchronization.

## Predecessors and next phase

BIP-M0 through BIP-M6 are preserved as implemented predecessors, including
the BIP-M6 content-delivery certification and commit
`7aa736a62f2ad9be0cc5b078874139f45a070d10`. BIP-M8 Frontend integration and
later learner synchronization remain separately authorized work.

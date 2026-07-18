---
title: BIP-M1 — Shared Contract Intake and Domain Model
canonical_id: NV-BIP-M1
version: 1.0.0
status: IMPLEMENTED
authority:
  - approved Cross-Front Integration Contract
  - NV-BIP-000
  - NV-BIP-M0
owner: NeuralVerse Hub
language: en
created: 2026-07-18
last_reviewed: 2026-07-18
---

# Purpose and Boundary

BIP-M1 establishes the persistence-neutral Backend boundary for the released
`nv-xfi-input-contracts-v1.0.0` artifact. It parses, validates, preserves and
adapts the five accepted intake shapes without changing ACP-owned meaning.
The implementation stops at domain objects and repository protocols.

```text
ACP semantic contract → transport intake → compatibility validation
→ lossless canonical representation → Backend domain adapter
→ Backend aggregate → repository port
```

Concrete persistence, SQLAlchemy mappings, migrations, workflows, endpoints,
publication, delivery, learner state, Frontend and ACP changes are outside
this phase.

# Authority and Contract Release

The current cross-front authority is `NV-XFI-000` at ACP commit
`df43f32a65a7c4bcb8ebf4fa37359e7ecde9b370`. The consumed contract release is:

| Field | Value |
| --- | --- |
| Release | `nv-xfi-input-contracts-v1.0.0` |
| Version/status | `1.0.0` / `RELEASED` / `CERTIFIED WITH CONDITIONS` |
| Release commit | `8b468c23866e5aa58b8d6dd28f33b40f1310bb8d` |
| Implementation commit | `70ed0547268d62f66c93fa934f9866d9d367a3ac` |
| Consumption mode | vendored release snapshot |
| Semantic owner | NeuralVerse Hub / Agent & Content Platform |
| Backend role | lossless preservation and operational adaptation |

The released schemas are `CurriculumContract`, `AgentContribution`,
`LearningPackageDraft` and `PublicationReadinessRecommendation`, each at
`1.0.0`. `ValidationResult` is preserved as the approved nested validation
shape and is accepted as a standalone Backend projection for invariant tests.

# Intake and Compatibility

`RawCanonicalContract` retains received UTF-8 bytes, parsed JSON, media type,
schema identity, compatibility result and SHA-256 digest. Recursive values are
frozen as tuples and read-only mappings. `to_bytes()` returns the received
bytes; `value()` returns a defensive JSON copy.

`CanonicalContractEnvelope` (`ContractEnvelope`) separately validates and
preserves the approved `NV-XFI-000` `{ metadata, payload }` transport envelope,
including envelope metadata, payload bytes and digest. Envelope metadata does
not become semantic domain identity; the released five contract adapters
remain explicit and payload-specific.

Explicit adapters exist for every incoming contract. Required known fields are
validated before domain use. No field is renamed, flattened, sorted,
normalized, synthesized or removed.

Schema metadata remains in its canonical location:
`schema_name`, `schema_version`, `minimum_reader_version`, `producer_version`
and `created_at`. Unknown major versions and unsupported minimum readers are
rejected. Compatible minor and patch versions are accepted without coercion.
Compatible unknown fields are preserved recursively, including list items,
structured payloads, citations, sources, assets, findings and governance data.

# Backend Wrapper Metadata

`BackendWrapperMetadata` is separate from semantic payloads. It carries
operational ingestion, receipt, source-front, correlation/causation,
request/workflow/idempotency, digest, compatibility, status, transport and
adapter-version data. Wrapper data never enters semantic JSON, replaces ACP
identifiers or replaces canonical `created_at`. `ContractIngestion.unwrap()`
returns the unchanged semantic contract and verifies a supplied digest.

# Domain Model and Aggregate Boundaries

The persistence-neutral model in `domain/bip_m1.py` includes immutable value
objects (`ContractDigest`, `AgentAttribution`, `ContributionDependency`,
references and `ContentBlock`), `ContentPackage`, `DraftContentVersion`,
`LearningPackageDraftAggregate`, `AgentContributionRecord`,
`ValidationResultRecord` and `PublicationReadinessRecommendationRecord`.

Aggregate roots are ContractIngestion, LearningPackageDraftAggregate,
ContentPackage, AgentContributionRecord and
PublicationReadinessRecommendationRecord. Validation results are immutable
entities. Cross-aggregate references use stable semantic IDs; no god aggregate
or bidirectional object graph is introduced.

The model rejects missing attribution, invalid validation/governance states,
duplicate block identities, block-order mutation, package identity mismatch,
unresolved contribution provenance and readiness recommendations for a
different package/version. It never upgrades readiness, resolves UNKNOWN or
invents relationships.

# Repository and Unit-of-Work Ports

`domain/bip_m1_ports.py` defines persistence-neutral protocols for
`ContractIngestionRepository`, `ContentPackageRepository`,
`LearningPackageDraftRepository`, `AgentContributionRepository`,
`ValidationResultRepository` and
`PublicationReadinessRecommendationRepository`. `UnitOfWork` exposes only
these ports plus `commit`, `rollback` and `close`.

No protocol imports SQLAlchemy, ORM rows, sessions, PostgreSQL syntax, Alembic,
Redis, Temporal or HTTP types. No concrete repository or transaction exists;
persistence is deferred to later BIP phases.

# Error Contract

`ContractError` exposes stable codes for schema/version mismatch, minimum
reader incompatibility, validation failure, semantic or unknown-field loss,
identity, relationship, block-order, attribution, source/citation/asset/
curriculum, governance/readiness and duplicate-domain-identity failures. It
also carries safe contract/path identity, retryability and bounded details.
Credentials, full sensitive payloads and internal stack traces are excluded.

# Tests and Fixtures

`backend/tests/fixtures/bip_m1_contracts.json` contains complete minimal
fixtures for all five contracts, compatible root/nested extensions, ordered
blocks, references, validation findings and governance state. Tests cover
exact/minor/patch compatibility, major and newer-reader rejection, recursive
unknown-field preservation, raw-byte/digest stability, wrapper separation,
immutable snapshots, block/attribution/package invariants and cross-contract
draft/contribution/readiness consistency.

Dedicated BIP-M1 result: `18 passed`, `0 failed`, `0 skipped`; 24 positive
vendored NV-XFI golden fixtures also adapt successfully.
Scoped Ruff: `PASS`. Scoped Mypy: `PASS`. Import/compile validation: `PASS`.

# Status and Deferred Work

```text
BIP-M0: IMPLEMENTED
BIP-M1: IMPLEMENTED
BIP-M2 through BIP-M9: NOT_AUTHORIZED
Concrete persistence: NOT_IMPLEMENTED
SQLAlchemy mappings: NOT_IMPLEMENTED
Database migrations: NOT_IMPLEMENTED
Durable workflows: NOT_IMPLEMENTED BY BIP-M1
Publication execution: NOT_IMPLEMENTED BY BIP-M1
```

The existing Backend implementation and concurrent work retain their actual
statuses. A separate owner-finalization task must isolate and commit the
BIP-M1 paths.

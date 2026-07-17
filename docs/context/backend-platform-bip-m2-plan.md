# NeuralVerse Backend Platform — BIP-M2 Plan

Title: `NeuralVerse Backend Platform — BIP-M2 Plan`
Canonical Identifier: `NV-BIP-M2`
Version: `1.0`
Status: `APPROVED_AS_PLANNING_BASELINE`
Plan Status: `APPROVED_AS_PLANNING_BASELINE`
Owner: Backend & Integration Platform
Authority: `NV-BIP-000`, `NV-ACP-000`, `NV-BIP-M2-P0`, certified backend commit, certified ACP commit, and explicit project-owner decisions
Certified predecessor: `nv-bip-level2-fixture-e5344d19` / `e5344d19f7540772c6e50c2bac5f21fe6927cbb8`
Implementation authorization: `NOT GRANTED`

## Mission

Receive, preserve, validate, version, and persist approved governed handoff objects from ACP without taking semantic authority. The milestone begins only after the neutral artifact foundation and a separate BIP-M2 implementation gate are certified.

## Authority and Boundary

ACP owns educational meaning, agent semantics, package composition, validation meaning, and readiness recommendation. BIP owns transport, operational validation, preservation, persistence, versioning, idempotency, audit, publication execution, and delivery. `NV-XFI-000` governs CF-010, CF-011, and CF-012.

The Level 2 fixture is not a predecessor schema. It is evidence for raw preservation, structural handling, idempotency, transactions, and PostgreSQL operations only.

## Scope

- Approved language-neutral shared-contract artifacts and pinned consumer versions.
- Backend contract readers, structural validation, and version negotiation.
- Raw-byte and structural semantic preservation without reinterpretation.
- Canonical handoff intake for `CurriculumContract`, `AgentContribution`, `LearningPackageDraft`, and `PublicationReadinessRecommendation`.
- Contract-aware idempotency and immutable content-version lineage.
- Persistence for package identity, contributions, provenance, validation results, and readiness snapshots after semantic approval.
- Golden cross-front tests and PostgreSQL round trips.

## Non-Scope

Temporal workflows, agent runtime execution, optimization, publication execution, published-package creation, delivery manifests, binary asset storage, Redis, pgvector, search, learner state, frontend integration, Obsidian synchronization execution, public APIs, authentication, and authorization are excluded.

## Incoming Contracts

| Contract | Semantic owner | BIP responsibility | Current evidence |
|---|---|---|---|
| `CurriculumContract` | Curriculum/ACP authority | Preserve and project after approval | Canonical requirements; no universal committed implementation |
| `AgentContribution` | ACP | Validate envelope, preserve payload, persist lineage | Certified ACP TypeScript implementation; no shared wire artifact |
| `LearningPackageDraft` | ACP/content authority | Validate references/version, persist immutable snapshots | Certified ACP TypeScript implementation; no BIP integration |
| `PublicationReadinessRecommendation` | Governance authority | Preserve recommendation, evaluate operational gate | Certified ACP TypeScript implementation; no shared wire artifact |

## Output Concepts

`PublishedLearningPackage`, `PublicationRelease`, `DeliveryManifest`, and `WorkflowExecutionProjection` remain future BIP-owned or jointly approved outputs. They are not implemented by this plan.

## Ownership Matrix

| Concern | ACP/semantic authority | BIP/operational authority | Hub approval required |
|---|---|---|---|
| Educational meaning and field semantics | Owns | Preserves | Yes for shared changes |
| Shared schema source and version | Proposes semantic content | Consumes and enforces | Governed by NV-XFI-000 |
| Transport envelope | Consulted for semantic boundaries | Owns operational transport | Yes where shared |
| Persistence metadata | No authority | Owns | No, if semantic payload is unchanged |
| Version negotiation | Defines compatibility intent | Enforces at intake | Governed by NV-XFI-000 |
| Publication readiness meaning | Owns recommendation | Records and gates execution | Yes for shared representation |
| Delivery client boundary | Consulted | Owns API adapter; frontend owns presentation | Governed by NV-XFI-000 |
| Obsidian synchronization | Owns semantic requirements | Integrates only approved contracts | Yes where cross-front |

## Proposed Domain Boundaries

- `contracts`: consume approved artifacts; no semantic redefinition.
- `handoff`: envelope, version negotiation, idempotency, and intake orchestration.
- `content`: package identity and immutable content-version lineage.
- `provenance`: source, citation, claim, contribution, and asset relationships.
- `governance`: recommendation snapshots, validation results, and operational gate evaluation.
- `operations`: correlation, audit, safe errors, and readiness.

These are conceptual boundaries only. No package, model, endpoint, migration, or dependency is authorized by this document.

## Proposed Persistence Concepts

The eventual model may require content package identity, immutable content versions, contribution snapshots, provenance/citation relationships, validation-result snapshots, readiness recommendations, idempotency records, audit records, and supersession lineage. Database primary keys remain operational and separate from semantic identifiers. Exact table shape is implementation work after approval and must not be inferred from ACP code.

## Proposed Transaction Boundaries

Canonical handoff intake should use one application-service transaction covering version/structure validation, idempotency resolution, immutable snapshot persistence, relationship persistence, validation-result persistence, readiness snapshot persistence, and audit. External publication/delivery effects occur only after commit. A failed or unsupported handoff must not create a partial canonical record.

## Versioning and Validation Requirements

Every shared object must carry `schema_name`, `schema_version`, `minimum_reader_version`, `producer_version`, and `created_at`. Unknown major versions are rejected. Compatible minor extensions are preserved. Patch changes cannot alter shape. Semantic schema versions are distinct from Alembic/database versions. Structural, semantic, operational, and publication-gate findings remain separate.

## Test Strategy

Both fronts must validate the same golden payloads from the approved artifact source. Required tests cover valid and invalid payloads, raw/structural round trips, unknown nested extensions, ordering, null versus missing, Unicode, numbers, identifiers, timestamps, citation/asset/provenance relationships, unsupported major, compatible minor, minimum-reader rejection, error taxonomy, generated artifact reproducibility, and old-reader write-back preservation.

## Migration Strategy

No migration is created in P0. After approval, use additive schema expansion, deploy compatible readers, validate representative payloads, migrate only with explicit lineage, and remove deprecated fields only after the approved support window. Existing fixture tables remain fixture-local and are not silently converted into canonical tables.

## Security Boundary

No authentication or authorization is implemented by this plan. Raw payloads, credentials, idempotency keys, and sensitive metadata require existing redaction and retention controls. Transport metadata must not leak semantic payloads into logs or errors.

## Observability Boundary

The eventual intake path records correlation, stable error code, retryability, schema/version decision, idempotency outcome, and audit reference without logging raw payloads or secrets. Semantic findings remain linked to their producing authority.

## Proposed Subphase Sequence

1. `BIP-M2-P0` — readiness and decision package (`IMPLEMENTED`).
2. `NV-XFI-M1` — Neutral Shared Contract Artifact Foundation (requires separate owner authorization).
3. `BIP-M2.1` — artifact intake, pinning, and local validation.
4. `BIP-M2.2` — envelope, version negotiation, and errors.
5. `BIP-M2.3` — package/contribution/provenance persistence design.
6. `BIP-M2.4` — reviewed PostgreSQL migration and repositories.
7. `BIP-M2.5` — idempotent canonical handoff transaction.
8. `BIP-M2.6` — golden cross-front tests and real PostgreSQL round trips.
9. `BIP-M2-CERT` — certification.

## Completion Criteria

The milestone may be certified only when approved artifacts are pinned, all incoming contracts validate in both fronts, version negotiation and errors are tested, compatible fields and order survive round trips, immutable content versions and provenance are persisted, idempotency and audit are atomic, PostgreSQL tests pass, and no semantic owner boundary is crossed.

## Approved Decisions

- `CF-010: ACCEPTED` — JSON Schema 2020-12 plus normative semantic documentation.
- `CF-011: ACCEPTED` — neutral contracts front at `/home/matheusneves/Projetos/NeuralVerse/neuralverse-contracts`.
- `CF-012: ACCEPTED` — neutral semantic artifacts plus BIP-owned transport adapter.

## Authorization Status

`APPROVED_AS_PLANNING_BASELINE`. The first implementation subphase requires separate owner authorization. This plan authorizes no implementation beyond `NV-XFI-M1` and does not authorize BIP-M2 implementation.

First implementation subphase: `REQUIRES SEPARATE OWNER AUTHORIZATION`

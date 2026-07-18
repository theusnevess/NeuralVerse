---
title: NeuralVerse Backend & Integration Platform — BIP-M0 Mission, Boundaries and Baseline
canonical_id: NV-BIP-M0
version: 1.0.0
status: IMPLEMENTED
authority: NV-BIP-000
owner: NeuralVerse Hub
language: en
created: 2026-07-18
last_reviewed: 2026-07-18
supersedes: null
superseded_by: null
related_documents:
  - docs/context/backend-platform-bip-m0-certification.md
  - docs/context/backend-platform-target-architecture.md
  - docs/context/backend-platform-implementation-sequence.md
  - docs/context/backend-platform-shared-contract-inventory.md
  - docs/context/backend-platform-cross-front-decisions.md
  - docs/context/bip-bounded-contexts.md
  - docs/context/bip-domain-invariants.md
  - docs/context/bip-domain-persistence-mapping.md
---

# BIP-M0 Decision and Scope

Stage 4 — BIP-M0 establishes the Backend & Integration Platform mission,
boundaries, operational baseline and implementation direction. It is a
documentation and reconciliation phase. No source, migration, dependency,
infrastructure, ACP or Frontend path is implemented by this document.

Active phase status: `IMPLEMENTED`.

The current Backend baseline is `2c22b7dbe0966339158b6b792561ceb0f30a2e5d`
on `feat/backend-integration-platform`. The earlier Stage 5 baseline
`e192a2e939ba904dc5c42274ce8bdfc4362e13ba` remains historical evidence.
The worktree contains concurrent
unstaged work; that work is preserved and is not part of this BIP-M0 delta.

# Authority and Provenance

Authority is applied in this order: explicit owner decision; NeuralVerse
Vision and UI Constitution; Architecture Guide and Canonical Curriculum;
Strategic Evolution Report; NV-BIP-000; NV-ACP-000 for agent semantics;
approved NV-XFI-000 where applicable; current implementation; validation
evidence. Implementation is evidence, not architectural authority.

| Source | Location or identity | Status | Use in BIP-M0 |
| --- | --- | --- | --- |
| NV-BIP-000 | `/home/matheusneves/Projetos/NeuralVerse/canonical-sources/NV-BIP-000.md` | PROPOSED governed source; SHA-256 `00d0f84af6b5e89a415b1a42ab75ef531465fed408b66eabb303a0ec743a803c` | Backend mission and architecture |
| NV-ACP-000 | `/home/matheusneves/Projetos/NeuralVerse/canonical-sources/NV-ACP-000.md` | PROPOSED governed source; SHA-256 `c2eb3a66043ed55fee137dd204be01c40004c6b1cc76a2ee986792ebb4dc17de` | Agent-owned meaning and handoff semantics |
| NV-XFI-000 | ACP commit `df43f32a65a7c4bcb8ebf4fa37359e7ecde9b370` | Approved cross-front semantic baseline | Shared object boundary |
| BIP discovery certification | `backend-platform-bip-m0-certification.md` | CERTIFIED WITH CONDITIONS | Existing discovery evidence |
| Backend target architecture | `backend-platform-target-architecture.md` | DECIDED WITH CONDITIONS | Existing implementation direction |
| Backend implementation sequence | `backend-platform-implementation-sequence.md` | DECIDED WITH CONDITIONS | Ordered future phases |

The canonical source checksum file was verified before review. No canonical
source checkout was copied, modified or staged.

# Mission and Authority Boundaries

The Backend & Integration Platform is the operational content, workflow,
persistence, publication, delivery and learner-state foundation of NeuralVerse.
It transforms valid semantic handoff objects into durable, versioned and
observable platform state.

## Backend owns

Typed APIs, transport validation, durable workflow execution, workflow
operational state, transactional persistence, content-version storage,
publication execution, published-version immutability, asset metadata and
binary adapters, search and retrieval infrastructure, learner-state,
laboratory-run and assessment-attempt persistence, Frontend delivery
contracts, retries, idempotency, configuration and secrets boundaries,
observability, backup/recovery and Backend validation.

## Backend does not own

Agent missions, prompts, tools, models or reasoning; research-source
selection; canonical technical truth; curriculum sequencing; content-block
semantics; didactic assembly; laboratory or assessment pedagogical meaning;
Frontend visual/component design; or UI motion language.

The ACP defines educational meaning. Backend preserves, executes, versions,
publishes and delivers that meaning. Frontend renders published meaning.
Backend semantic reinterpretation authority is `NONE`; agent semantic
preservation is `REQUIRED`. Invalid semantic handoffs are rejected, returned
for revision or classified as `CROSS_FRONT_DECISION_REQUIRED`.

# Repository Baseline and Concurrent Work

The following pre-existing paths were classified before BIP-M0 editing:

| Classification | Paths or pattern | Treatment |
| --- | --- | --- |
| BIP_CONCURRENT_IMPLEMENTATION | `backend/src/**`, `backend/migrations/versions/b42000000001_cross_front_workflow.py` | Preserved unstaged and uncommitted; not incorporated |
| BIP_CONCURRENT_DOCUMENTATION | `docs/context/active-task-package.md`, `docs/context/current-state.md`, untracked `docs/context/bip-*.md` | Preserved; only explicit BIP-M0 status appendices are added to active documents |
| BIP_M0_POTENTIALLY_MIXED | `docs/context/current-state.md` | Existing Stage 5/6 lines are untouched; BIP-M0 section is additive |
| UNRELATED_CONCURRENT_WORK | None identified in the observed scope | None |
| UNKNOWN | None | Required modified-scope unknowns: `0` |

No path is staged by BIP-M0. The expected BIP-M0 documentation paths are one
new document and additive updates to the active current-state, active-task and
implementation-sequence documents.

# Existing-Capability Inventory

| ID | Capability and evidence | Current status | Classification | Canonical requirement / next phase | Cross-front impact |
| --- | --- | --- | --- | --- | --- |
| CAP-001 | FastAPI factory, HTTP interfaces, health and correlation middleware in `backend/src/neuralverse_backend/interfaces` | Implemented foundation | PRESERVE | API and delivery phases | None beyond transport |
| CAP-002 | Typed settings and environment policy in `configuration/settings.py` | Implemented foundation | PRESERVE | Hosted hardening later | Secrets boundary |
| CAP-003 | SQLAlchemy engine/session, PostgreSQL 16 Compose and Alembic history | Implemented and validated with conditions | PRESERVE | BIP-M2/M3 evidence | Durable state |
| CAP-004 | Canonical domain models and repositories under `persistence/models` and `repositories` | Implemented with conditions | ADAPT | Preserve semantic ownership in BIP-M1/M3 | ACP payload projection |
| CAP-005 | Canonical NV-XFI intake and envelope validation under `canonical_input.py` and `cross_front` | Implemented with conditions | ADAPT | BIP-M1 intake and contract certification | NV-XFI-000 |
| CAP-006 | Fixture ingestion, idempotency and audit boundary under `fixtures` | Implemented as non-canonical fixture capability | DEPRECATE | Replace only under separately authorized canonical intake | Must not become semantic authority |
| CAP-007 | Cross-front authoring workflow and worker material | Concurrent, not certified as final | ADAPT | BIP-M4 durable workflow | ACP logical stages remain ACP-owned |
| CAP-008 | Outbox models and services | Present/under concurrent implementation | ADAPT | BIP-M4 publication/outbox phase | Delivery and publication events |
| CAP-009 | Publication, content-version, governance and release models | Present, operational execution incomplete | ADAPT | BIP-M3 publication model | ACP readiness remains input |
| CAP-010 | Learner, laboratory and assessment persistence modules | Partial model/repository foundation | ADAPT | BIP-M7 and later domain phases | Exact-version references required |
| CAP-011 | Read-only delivery API and projections | Committed at `2c22b7dbe0966339158b6b792561ceb0f30a2e5d`; publication remains conditional | ADAPT | BIP-M6 | Published-only delivery |
| CAP-012 | Redis integration | No approved operational implementation found | DEFERRED | Performance/coordination evidence | No canonical state in Redis |
| CAP-013 | S3-compatible object storage | No operational adapter found | DEFERRED | BIP-M5 | Binary assets only |
| CAP-014 | PostgreSQL FTS and pgvector | No active implementation evidence for current slice | DEFERRED | Search expansion after ownership decisions | Retrieval ownership |
| CAP-015 | Temporal durable workflow | Abstraction/plan present; operational service not certified | ADAPT | BIP-M4 | Operational, not semantic authority |
| CAP-016 | OpenTelemetry export | Structured logging exists; collector/export not certified | ADAPT | Operations phase | Sensitive-data policy |
| CAP-017 | Docker Compose local infrastructure | PostgreSQL project topology present | PRESERVE | Extend only when phase-authorized | Local-only boundary |
| CAP-018 | Frontend delivery adapters | No Backend-owned Frontend implementation in this worktree | DEFERRED | BIP-M8 | Frontend remains owner of rendering |
| CAP-019 | Test infrastructure | Unit, migration, persistence and integration suites present | PRESERVE | Each later phase adds focused evidence | Contract boundaries |
| CAP-020 | Legacy static/fixture compatibility | Existing browser/static and fixture paths | DEPRECATE | Retain until parity evidence | No silent semantic substitution |

Every relevant capability has one classification. `UNKNOWN = 0`; no deletion
or migration is performed in BIP-M0.

# Divergence Register

| ID | Concern | Canonical requirement | Current evidence | Classification | Severity | Future phase | Blocking |
| --- | --- | --- | --- | --- | --- | --- | --- |
| DIV-001 | Durable workflow execution | Temporal-owned durable workflows | Workflow abstractions and concurrent authoring material; no certified Temporal runtime | DEFERRED_INFRASTRUCTURE | P2 | BIP-M4 | No |
| DIV-002 | Publication execution | Backend transactional publication and immutable releases | Models/repositories exist; execution remains not implemented | CANONICAL_GAP | P1 | BIP-M3 | Planned |
| DIV-003 | Canonical semantic intake | Preserve NV-XFI objects without reinterpretation | Intake validation and persistence evidence exist with conditions | IMPLEMENTATION_LEADS_CANON | P2 | BIP-M1 | No |
| DIV-004 | Search/vector retrieval | PostgreSQL FTS first; pgvector after ownership decision | No certified active search implementation | DEFERRED_INFRASTRUCTURE | P2 | Search expansion | No |
| DIV-005 | Binary asset storage | S3-compatible immutable asset references | Local/static references and metadata seams; adapter absent | CANONICAL_GAP | P2 | BIP-M5 | No |
| DIV-006 | Frontend cutover | Incremental typed API adapter and parity | Browser-first/static delivery remains active | DEFERRED_INFRASTRUCTURE | P2 | BIP-M8 | No |
| DIV-007 | Learner state | PostgreSQL durable state with local-first migration | Backend learner foundations partial; current client state remains local | CANONICAL_GAP | P1 | BIP-M7 | Planned |
| DIV-008 | Obsidian synchronization | Governed directional synchronization with conflict state | Editorial authority documented; execution absent | CROSS_FRONT_DECISION_REQUIRED | P2 | BIP-M8/M9 | No |
| DIV-009 | Telemetry export | OpenTelemetry boundary and sensitive-data policy | Structured logging present; collector not certified | DEFERRED_INFRASTRUCTURE | P2 | Operations | No |
| DIV-010 | Authentication/authorization | Explicit provider and policy before hosted operation | Local configuration boundary only | DEFERRED_INFRASTRUCTURE | P1 | Security/operations | Planned |
| DIV-011 | Shared representation decisions | NV-XFI-000 is current semantic authority | Older BIP CF-010–CF-012 records remain historical/closed by NV-XFI-000 | DOCUMENTATION_DRIFT | P2 | BIP-M1 | No |
| DIV-012 | Fixture boundary | Fixtures are non-canonical test evidence | Fixture ingestion is implemented and isolated | LEGACY_COMPATIBILITY | P2 | BIP-M1/M3 | No |

Unclassified divergences: `0`. Unresolved P0: `0`. Capability inventory
`UNKNOWN`: `0`. P1 items have an approved
future phase or explicit operational plan; none is an unplanned blocker.

# Technology Baseline

| Technology | Canonical decision | Repository evidence | Implementation status | Immediate requirement / phase |
| --- | --- | --- | --- | --- |
| Python 3.12 | APPROVED | `backend/pyproject.toml`, `.python-version` | IMPLEMENTED | Preserve |
| FastAPI | APPROVED | `interfaces/http`, `main.py` | IMPLEMENTED | Preserve |
| Pydantic | APPROVED | settings and transport models | IMPLEMENTED | Preserve |
| SQLAlchemy 2 | APPROVED | persistence engine/models | IMPLEMENTED | Preserve |
| Alembic | APPROVED | `backend/alembic.ini`, migrations | IMPLEMENTED | Immutable migrations |
| PostgreSQL 16 | APPROVED | Compose and integration evidence | IMPLEMENTED_WITH_CONDITIONS | BIP-M2/M3 |
| PostgreSQL JSONB | APPROVED | JSON payload columns/models | IMPLEMENTED | Relational boundary required |
| pgvector | APPROVED_FOR_LATER | No current operational evidence | DEFERRED | Search expansion |
| PostgreSQL Full-Text Search | APPROVED_FOR_LATER | No current operational evidence | DEFERRED | Search expansion |
| Temporal | APPROVED | Workflow architecture and abstractions | CONFIGURED_NOT_OPERATIONAL | BIP-M4 |
| Redis | APPROVED_FOR_LATER | No current operational evidence | DEFERRED | Measured need only |
| S3-compatible object storage | APPROVED | Target architecture only | NOT_IMPLEMENTED | BIP-M5 |
| Docker Compose | APPROVED_LOCAL | `backend/compose.yaml` | IMPLEMENTED | Local infrastructure only |
| OpenTelemetry | APPROVED | Structured logging; collector absent | PARTIALLY_IMPLEMENTED | Operations phase |
| pytest + contract/integration suites | APPROVED | `backend/pyproject.toml`, `backend/tests` | IMPLEMENTED | Preserve |
| uv | APPROVED | `backend/uv.lock`, README commands | IMPLEMENTED | No lockfile changes |

`TECHNOLOGY_BASELINE: APPROVED`. Deferred technologies are not installed or
activated by BIP-M0.

# Architectural Style and Runtime Topology

`ARCHITECTURAL_STYLE: APPROVED` as a modular monolith with isolated workers.
The initial topology is one governed Backend codebase, one public API, one
authoring control plane, one publication authority and separate workers only
when operationally required. Microservices per agent/context, Kafka-first
decomposition, graph databases and dedicated vector databases are rejected as
premature.

| Process or service | Owner | Authority |
| --- | --- | --- |
| Frontend | Frontend | Rendering and browser state |
| API process | Backend | HTTP validation, commands, queries and SSE |
| Workflow worker | Backend/Operations | Durable workflow state and retries |
| Agent worker adapter | Backend bridge | Runtime bridge only; no agent semantics |
| PostgreSQL | Backend/Operations | Canonical durable operational state |
| Temporal/Temporal UI | Operations | Workflow history and observation |
| Redis | Operations | Ephemeral cache/coordination only |
| S3-compatible storage | Assets/Operations | Binary objects and immutable versions |
| OpenTelemetry Collector | Operations | Telemetry export under sensitive-data policy |

Process ownership conflicts: `0`; semantic authority assigned to Backend
workers: `0`.

# Bounded Contexts

`BOUNDED_CONTEXTS: APPROVED`. Each context has one primary operational owner;
Curriculum is an operational projection and never academic authority,
Governance records decisions without redefining policy, Publication executes
readiness without determining it, and Synchronization never permits
unrestricted overwrite.

| Context | Mission / owned state | Current evidence | Future phase |
| --- | --- | --- | --- |
| Identity | actor references and future auth seam | identity module | Security/foundation |
| Curriculum | operational curriculum projection | curriculum models/repositories | BIP-M1/M3 |
| Content | packages, blocks and versions | content models/repositories | BIP-M3 |
| Authoring | control seam and authoring jobs | authoring models/workflow material | BIP-M4 |
| Orchestration | workflow references and state | orchestration/workflow modules | BIP-M4 |
| Governance | readiness and review records | governance models/repositories | BIP-M3 |
| Publication | release records and publication gates | publication models/repositories | BIP-M3 |
| Assets | asset metadata, hashes and versions | assets module | BIP-M5 |
| Search | indexed retrieval projections | module boundary only | Search expansion |
| Learner | durable learner state and interactions | learner models/repositories | BIP-M7 |
| Laboratories | specifications, runs and evidence references | laboratory module | Later BIP phase |
| Assessments | assessment definitions and attempts | assessment module | Later BIP phase |
| Synchronization | conflict, revision and sync state | synchronization module | BIP-M8/M9 |
| Operations | health, configuration, audit and telemetry | operations/configuration modules | Every phase |

Missing contexts: `0`; ownership conflicts: `0`; modified-scope unknowns: `0`.

# Source-of-Truth Matrix

| Concern | Canonical operational authority | Current evidence / classification |
| --- | --- | --- |
| Published learning packages | PostgreSQL plus immutable asset references | Publication/content models; ADAPT |
| Content-version metadata | PostgreSQL | Content repositories; PRESERVE |
| Agent contributions | PostgreSQL | Canonical persistence models; ADAPT |
| Generation jobs | PostgreSQL plus Temporal history | Authoring/workflow models; ADAPT |
| Workflow history | Temporal | Workflow boundary; DEFERRED operational activation |
| Publication decisions | PostgreSQL | Governance/publication models; ADAPT |
| Binary assets | S3-compatible object storage | Not operational; DEFERRED |
| Asset metadata/provenance | PostgreSQL | Asset models; ADAPT |
| Ephemeral cache | Redis | Not operational; DEFERRED |
| Search indexes | PostgreSQL-derived indexes | Search boundary; DEFERRED |
| Learner durable state | PostgreSQL | Learner models; ADAPT |
| Local optimistic learner cache | Frontend local persistence | Frontend-owned; future migration |
| Editorial knowledge | Obsidian and governed source documents | ACP/Obsidian boundary; CROSS_FRONT_DECISION_REQUIRED for unresolved sync |
| Agent semantics | ACP contracts | NV-ACP/NV-XFI authority; PRESERVE |

Duplicate operational authorities: `0`; `SOURCE_OF_TRUTH_MATRIX: APPROVED`.

# Shared Handoff Objects and Versioning

`SHARED_HANDOFF_OBJECTS: IDENTIFIED`.

| Object | Canonical owner | Backend role | Version/compatibility |
| --- | --- | --- | --- |
| CurriculumContract | ACP | Validate, persist and project | Preserve `schema_name`, `schema_version`, `minimum_reader_version`, `producer_version`, `created_at` |
| AgentContribution | ACP agent | Validate, persist and lineage | Reject unsupported major; preserve compatible unknown fields |
| LearningPackageDraft | ACP/authoring semantics | Intake and operational workflow | No semantic field rename or flattening |
| PublicationReadinessRecommendation | ACP + Governance | Evaluate operational preconditions | P0/P1/UNKNOWN gates remain explicit |
| PublishedLearningPackage | Backend publication | Durable immutable version | Exact schema and content version |
| PublicationRelease | Backend publication | Release and audit record | Immutable release number and supersession |
| DeliveryManifest | Backend delivery | Published projection and asset references | Exact release/content/asset versions |
| WorkflowExecutionProjection | Backend operations | Query projection of Temporal state | Operational metadata only |

Missing canonical objects: `0`; semantic reinterpretations: `0`. Current
unresolved representation questions are explicitly `CROSS_FRONT_DECISION_REQUIRED`,
not invented in BIP-M0.

Versioning rules: major changes are breaking and rejected; minor additions are
compatible when the reader permits them; patch changes clarify validation
without changing shape. Unknown optional fields are preserved when possible;
silent discard and silent version coercion are forbidden.
`VERSIONING_RULES: APPROVED`.

# Content, Publication and Workflow Lifecycles

## Content lifecycle

`PROPOSED → AUTHORING → GENERATED → VALIDATION_PENDING → REVISION_REQUIRED →
GOVERNANCE_REVIEW → APPROVED → READY_FOR_PUBLICATION → PUBLISHING → PUBLISHED →
DEPRECATED → RETIRED`.

Every transition requires an explicit command, actor, timestamp, rationale,
source/target state, validation and audit record. Implicit transitions: `0`.
`CONTENT_LIFECYCLE: APPROVED`.

## Publication lifecycle

Publication is a Backend-owned transactional operation. ACP and governance
supply semantic readiness; Backend validates operational preconditions and
executes publication. Preconditions include a valid draft, accepted schema,
readiness recommendation, P0/P1/UNKNOWN gates, completed manual review,
available exact asset versions, valid source references and an authorized
actor. Publication creates an immutable content version, `PublicationRelease`,
asset/source/delivery manifests, audit record and outbox event.

`PUBLICATION_AUTHORITY: BACKEND`; `PUBLICATION_LIFECYCLE: APPROVED`.
Direct status mutation and governance bypass are forbidden. Publication is
idempotent by command and idempotency key. BIP-M0 does not execute it.

`PublicationRelease` must include `release_id`, `package_id`,
`content_version_id`, `release_number`, `release_status`, `published_at`,
`published_by`, `schema_versions`, `asset_manifest_id`, `source_manifest_id`,
`validation_summary`, `governance_review_id` and `supersedes_release_id`.

## Workflow ownership

`WORKFLOW_OWNERSHIP: APPROVED`. ACP owns logical stages, semantic dependencies
and agent meaning. Backend owns durable workflow execution, retries, timeouts,
signals, cancellation, human-review waits, revision loops, idempotent
activities, resume and operational projections. Current abstractions are
classified `ADAPT`; no workflow is rewritten here. Every future activity must
declare owner, input/output contract, idempotency, timeout, retry and
non-retryable failures, telemetry and sensitive-data policy.

# Database and Migration Boundaries

`DATABASE_BOUNDARIES: APPROVED`. PostgreSQL is the primary operational
database. Relational columns/tables hold identifiers, ownership, foreign keys,
lifecycle, lineage, release state, timestamps, query-critical metadata and
constraints. JSONB holds versioned semantic payloads, block-specific data,
agent contributions, visualization/laboratory/assessment configuration and
provider-neutral execution metadata. JSONB cannot replace stable relationships
or constraints; `JSONB-as-unstructured-database: REJECTED`.

Minimum invariants include unique stable identifiers, valid parent/version
references, unique release numbers, unique idempotency keys, valid lifecycle
values, provenance-preserving assets and referentially valid package blocks.

All schema changes use Alembic; applied migrations are immutable; upgrades,
rollback or irreversible rationale, backfills, lock/runtime impact,
compatibility windows and validation queries are explicit. Current migrations
and mappings are evidence only; BIP-M0 changes none. `MIGRATION_RULES: APPROVED`.

# Frontend and Learner-State Migration

`FRONTEND_MIGRATION_STRATEGY: APPROVED`. The incremental sequence is: inventory
static data and local schemas; preserve routes; introduce a typed API client;
add repository-backed adapters; serve one reference slice; compare against
static behavior; add learner export/import; add API persistence and local sync;
reconcile conflicts; remove static-only paths only after parity evidence.

Frontend consumes `PublishedLearningPackage`, governed resources and typed
delivery contracts. It does not parse free-form agent output, depend on database
shape or define publication state. Backend does not return page HTML/CSS or own
components. Frontend files changed by BIP-M0: `0`.

Learner-state direction is local-first: inventory, canonical contracts,
export/import, API persistence, synchronization, conflict reconciliation,
round-trip validation, then removal of legacy-only paths. Notes use
version-aware alternatives; bookmarks use union plus tombstones; reading
position uses the latest valid update; collections merge by version; assessment
attempts and laboratory runs are append-only.

# Obsidian Boundary

Obsidian is editorial and knowledge-governance authority. Backend is
operational published-state authority. Synchronization must preserve canonical
identifiers, note paths, frontmatter hashes, content/release versions,
direction, conflict state and validation result. Unrestricted bidirectional
overwrite is forbidden. Synchronization execution is `NOT_IMPLEMENTED` in
BIP-M0; unresolved final policy remains `CROSS_FRONT_DECISION_REQUIRED`.

# Deferred Decisions

`DEFERRED_DECISIONS: ACCEPTED`. The following remain deferred: authentication
provider and enterprise authorization; cloud provider; managed versus
self-hosted Temporal; dedicated broker; dedicated vector or graph database;
Kubernetes, service mesh, multi-region, sharding, read replicas, analytics
warehouse, real-time collaboration, mobile-native sync, and microservices per
context or agent. Agent-specific LLM providers, models, retrieval APIs, MCP,
frameworks, prompt platforms, memory, evaluation providers and code-execution
tools remain ACP-owned and outside BIP.

Each is deferred because the first vertical slice does not require it. The
trigger for reconsideration is measured need plus an owner-approved phase plan;
required evidence is a bounded contract, failure policy, cost/latency/security
impact and migration/rollback plan. Premature infrastructure decisions: `0`.

# Initial Vertical Slice and Future Phases

`VERTICAL_SLICE_STRATEGY: APPROVED`.

1. repository and state discovery
2. shared contract intake and domain model
3. PostgreSQL and migration foundation
4. minimal read-only delivery API
5. one published reference package
6. Frontend adapter for one slice
7. durable authoring workflow
8. publication transaction
9. learner-state persistence for the slice
10. parity and regression validation
11. controlled expansion

| Phase | Scope | Status in BIP-M0 |
| --- | --- | --- |
| BIP-M0 | Mission, Boundaries and Baseline | IMPLEMENTED |
| BIP-M1 | Shared Contract Intake and Domain Model | NOT_AUTHORIZED |
| BIP-M2 | PostgreSQL and Migration Foundation | NOT_AUTHORIZED as new work; existing evidence preserved |
| BIP-M3 | Content Versioning and Publication Model | NOT_AUTHORIZED |
| BIP-M4 | Durable Workflow Infrastructure | NOT_AUTHORIZED |
| BIP-M5 | Asset, Search and Retrieval Platform | NOT_AUTHORIZED |
| BIP-M6 | Content Delivery API | NOT_AUTHORIZED |
| BIP-M7 | Learner-State Platform | NOT_AUTHORIZED |
| BIP-M8 | Frontend Integration Vertical Slice | NOT_AUTHORIZED |
| BIP-M9 | Operational Validation and Certification | NOT_AUTHORIZED |

# Decision Records

Each record is proposed for owner approval and does not authorize later work.

## BIP-ADR-001 — Modular monolith with isolated workers

Problem: avoid premature service decomposition. Context: one governed Backend
codebase with operational workers. Authority: NV-BIP-000. Constraints: clear
process ownership and bounded failure. Options: per-agent services, per-context
services, modular monolith. Decision: modular monolith with isolated workers.
Rationale: preserves ownership while limiting operational complexity.
Consequences: explicit worker seams and one database. Rejected: microservices
per agent/context. Cross-front impact: worker adapters preserve ACP meaning.
Migration impact: none in M0. Validation: topology and ownership review.
Documentation: this baseline. Status: PROPOSED_FOR_OWNER_APPROVAL.

## BIP-ADR-002 — Approved technology baseline

Problem: prevent tool drift. Context: Python/FastAPI/Pydantic/SQLAlchemy 2/
Alembic/PostgreSQL/JSONB/Temporal/Redis/S3/OpenTelemetry/pytest/uv target.
Authority: NV-BIP-000. Constraints: local reproducibility and bounded phases.
Options: existing frontend stack, alternative ORM, separate databases.
Decision: approve the NV-BIP baseline with deferred capabilities explicit.
Rationale: canonical source and current evidence align. Consequences: no
substitution without owner decision. Rejected: technology-by-availability.
Cross-front impact: shared contracts remain provider-neutral. Migration:
phase-specific. Validation: pyproject, Compose and focused tests.
Documentation: technology table. Status: PROPOSED_FOR_OWNER_APPROVAL.

## BIP-ADR-003 — PostgreSQL as primary operational database

Problem: establish one durable authority. Context: transactional versions,
lineage and constraints. Authority: NV-BIP-000. Constraints: relational
integrity and JSONB flexibility. Options: browser storage, document database,
multiple operational stores. Decision: PostgreSQL is canonical operational
state. Rationale: transactionality and queryable relationships. Consequences:
Redis/cache never owns state. Rejected: duplicate databases. Cross-front:
semantic payloads remain ACP-owned. Migration: BIP-M2. Validation: migration,
constraint and round-trip tests. Status: PROPOSED_FOR_OWNER_APPROVAL.

## BIP-ADR-004 — Temporal as durable workflow engine

Problem: survive retries, waits and restart. Context: long-running authoring
and publication. Authority: NV-BIP-000. Constraints: idempotent activities.
Options: process memory, queue-only, Temporal. Decision: Temporal owns durable
workflow history. Rationale: explicit workflow semantics. Consequences:
operational deployment is deferred. Rejected: synchronous fake completion.
Cross-front: ACP retains logical stages. Migration: BIP-M4. Validation:
workflow retry/timeout/cancellation tests. Status: PROPOSED_FOR_OWNER_APPROVAL.

## BIP-ADR-005 — Backend-owned transactional publication

Problem: prevent semantic and operational publication confusion. Context: ACP
provides readiness; Backend executes. Authority: NV-BIP-000/NV-ACP-000.
Constraints: immutable release and governance gates. Options: ACP publication,
Frontend mutation, Backend transaction. Decision: Backend owns transaction.
Rationale: durable atomicity and idempotency. Consequences: no direct status
mutation. Rejected: governance bypass. Cross-front: exact draft/recommendation
handoff. Migration: BIP-M3. Validation: publication tests. Status:
PROPOSED_FOR_OWNER_APPROVAL.

## BIP-ADR-006 — Relational and JSONB boundary

Problem: avoid both rigid semantic tables and unbounded JSON storage. Context:
stable relationships plus evolving payloads. Authority: NV-BIP-000.
Constraints: query-critical constraints remain relational. Options: all JSONB,
all normalized, bounded split. Decision: bounded relational/JSONB split.
Rationale: preserves integrity and evolution. Consequences: indexes and
constraints are explicit. Rejected: JSONB as unstructured database.
Cross-front: unknown compatible fields preserved. Migration: BIP-M2/M3.
Validation: schema and persistence tests. Status: PROPOSED_FOR_OWNER_APPROVAL.

## BIP-ADR-007 — Incremental Frontend migration

Problem: avoid a risky client rewrite. Context: static/browser-first delivery
and local learner state. Authority: NV-BIP-000 and Frontend ownership.
Constraints: route parity and rollback. Options: rewrite, immediate cutover,
incremental adapter. Decision: staged typed adapter and reference slice.
Rationale: evidence before removal. Consequences: dual paths temporarily.
Rejected: broad rewrite. Cross-front: typed published objects only. Migration:
BIP-M8. Validation: parity and regression tests. Status:
PROPOSED_FOR_OWNER_APPROVAL.

## BIP-ADR-008 — Deferred infrastructure decisions

Problem: avoid premature operational commitments. Context: first slice does not
need every service. Authority: NV-BIP-000. Constraints: measurable need.
Options: adopt all target services now, defer with triggers. Decision: defer
cloud/auth/broker/graph/Kubernetes/multi-region and similar decisions.
Rationale: bounded complexity. Consequences: explicit future gates. Rejected:
infrastructure-first expansion. Cross-front: no semantic effect. Migration:
phase-specific. Validation: decision register review. Status:
PROPOSED_FOR_OWNER_APPROVAL.

## BIP-ADR-009 — Operational versus semantic authority

Problem: prevent Backend reinterpretation of ACP meaning. Context: cross-front
handoff. Authority: NV-ACP-000/NV-BIP-000/NV-XFI-000. Constraints: preserve
identity, order, lineage, versions and UNKNOWN. Decision: ACP owns semantics;
Backend operationalizes without repair. Rationale: architectural separation.
Consequences: invalid input is rejected/revised/escalated. Rejected: Backend
semantic repair. Cross-front: unresolved representation is explicit.
Migration: every adapter. Validation: contract tests. Status:
PROPOSED_FOR_OWNER_APPROVAL.

## BIP-ADR-010 — Shared schema versioning

Problem: evolve contracts safely. Context: ACP/Backend/Frontend handoff.
Authority: NV-XFI-000. Constraints: major rejection and compatible preservation.
Options: silent coercion, ad hoc versions, governed metadata. Decision: require
`schema_name`, `schema_version`, `minimum_reader_version`, `producer_version`
and `created_at`; reject unknown major; preserve compatible unknown fields.
Rationale: explicit compatibility. Consequences: migrations and validation are
auditable. Rejected: silent discard/coercion. Cross-front: shared contract
certification required. Migration: BIP-M1. Validation: golden contract tests.
Status: PROPOSED_FOR_OWNER_APPROVAL.

# Completion Evidence and Quality Gate

| Gate | Result |
| --- | --- |
| Mission and boundaries | PASS |
| Existing capability classification | PASS; UNKNOWN `0` |
| Divergence classification | PASS; unclassified `0` |
| Technology baseline | APPROVED |
| Architectural style | APPROVED |
| Bounded contexts | APPROVED |
| Source-of-truth matrix | APPROVED |
| Shared handoff objects | IDENTIFIED |
| Versioning rules | APPROVED |
| Content lifecycle | APPROVED |
| Publication lifecycle | APPROVED |
| Workflow ownership | APPROVED |
| Database boundaries | APPROVED |
| Frontend migration strategy | APPROVED |
| Deferred decisions | ACCEPTED |
| Vertical-slice strategy | APPROVED |
| P0 | `0` |
| P1 unresolved without plan | `0` |
| Semantic-authority violations | `0` |
| Shared-contract reinterpretations | `0` |
| Premature infrastructure decisions | `0` |
| Source/migration/dependency/lockfile modifications | `0` |
| `git diff --check` | PASS |

## Actual state preserved

Stage 3 ACP agent optimization is `IMPLEMENTED`. Full semantic ACP runtime and
`ACP-RUNTIME-01` remain `NOT_IMPLEMENTED / NOT_AUTHORIZED`. Existing Backend
Stage 5/6 capabilities and concurrent work retain their actual statuses;
BIP-M0 does not upgrade them. Frontend integration, Obsidian synchronization
execution and publication execution remain unimplemented where current evidence
says so.

## Phase result

```text
STAGE 4 — BIP-M0: IMPLEMENTED
TECHNOLOGY BASELINE: APPROVED
BOUNDED CONTEXTS: APPROVED
SOURCE-OF-TRUTH MATRIX: APPROVED
SHARED HANDOFF OBJECTS: IDENTIFIED
VERSIONING RULES: APPROVED
PUBLICATION LIFECYCLE: APPROVED
WORKFLOW OWNERSHIP: APPROVED
DATABASE BOUNDARIES: APPROVED
FRONTEND MIGRATION STRATEGY: APPROVED
DEFERRED DECISIONS: ACCEPTED
BIP-M1: NOT_AUTHORIZED
```

Owner approval is recorded by the isolated documentation commit. No source
code, test, migration, dependency, lockfile, infrastructure, Frontend, ACP or
Backend concurrent implementation path is part of this documentation delta.

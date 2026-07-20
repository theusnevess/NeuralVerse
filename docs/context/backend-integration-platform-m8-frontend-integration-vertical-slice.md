---
title: BIP-M8 — Frontend Integration Vertical Slice
canonical_id: NV-BIP-M8
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
  - NV-BIP-M7
  - approved Cross-Front Integration Contract
  - NeuralVerse UI Constitution
  - NeuralVerse Architecture Guide
owner: NeuralVerse Hub
language: en
created: 2026-07-20
last_reviewed: 2026-07-20
---

# BIP-M8 — Frontend Integration Vertical Slice

## Boundary and status

BIP-M8 adds a reversible Frontend delivery boundary on top of BIP-M6 and
BIP-M7. It does not move semantic authority from ACP or persistence authority
from the Backend. The implementation is flag-gated and uses a checked-in,
versioned release registry. Real reference-release E2E, visual regression and
scoped Axe certification pass in the disposable validation environment.

The existing hash router, vanilla controllers and React-island bridge remain
the presentation surface. The legacy static projection is never removed and
is the rollback path while BIP-M8 flags are disabled.

## Predecessor evidence

BIP-M7 is `IMPLEMENTED` at commit
`72c315b942da18b9e37668f2f316ac6b3aaa6022`, with migration `b55000000001`,
PostgreSQL 16 migration/rollback/concurrency/restart/backup/restore and
learner semantic certification complete. BIP-M9 remains separately authorized.

## Frontend discovery and migration inventory

| Capability | Current authority/storage | Classification | Rollback |
| --- | --- | --- | --- |
| Curriculum and lesson routes | Hash router + static indexes | ADAPT | Keep legacy route |
| Search/retrieval | Existing curriculum/retrieval controllers | PRESERVE | No new browser ranking |
| Progress, notes, sessions | Local persistence and BIP-M7 API | MIGRATE | Retain source cache |
| Laboratory and assessment UI | Existing controllers | ADAPT | Disable mutation flags |
| React islands | `react-build/src` bridge | PRESERVE | Vanilla fallback |
| Package delivery | New exact-release adapter | ADAPT | Disable package flag |
| Feature flags | New independent BIP-M8 flags | ADAPT | Each flag has kill switch |

No unknown capability is used by the adapter. No database rows, ORM models,
Temporal history, agent output or storage credentials enter the browser.

## Exact package boundary

The canonical release map is `FrontendReleaseRegistry` version `1.0.0` in
`website/scripts/bip-m8/release-registry.js`. The reference route
`svd-image-compression` resolves only to the exact package, content-version and
publication-release identities recorded there. No `NV_BIP_M8_RELEASES`
harness-global or mutable `latest` alias is used.

The adapter consumes `PublishedLearningPackage` from:

```text
GET /api/v1/publication/releases/{publication_release_id}
Accept: application/vnd.neuralverse.published-learning-package+json;version=1
```

It preserves `content_package_id`, `content_version_id`,
`publication_release_id`, schema versions, ordered block identities, source and
citation identities, asset versions, laboratory references, assessment
references, accessibility metadata and compatible extensions. It rejects
malformed, unsupported or blocked releases without best-effort semantic
invention.

## API, cache and asset layers

`website/scripts/bip-m8/client.js` is the transport boundary. `contract.js`
performs runtime identity/version/order validation. `cache.js` keeps immutable
exact-release package cache, asset cache and learner resilience cache separate.
The client sends `If-None-Match`, reuses only a validated exact-release payload
on `304`, preserves ETags and displays a typed offline state when a matching
cached release is available. It never substitutes another release.

Asset references retain exact `asset_version_id`, MIME, delivery locator and
accessibility metadata. Missing, blocked and unsupported assets remain visible
as governed failures; browser code never receives storage credentials.

## Renderer registry

`renderers.js` provides a deterministic typed-by-convention registry for text,
math, implementation, visual, laboratory, applied, assessment, research,
narrative and curiosity families, plus an explicit unsupported-block renderer.
Block identity is the DOM key and canonical sequence is preserved. Renderers
use text content or structured payload fields only; arbitrary HTML and code
execution are not accepted.

## Learner state and submissions

`learner.js` treats BIP-M7 as durable authority and local storage as an
optimistic resilience cache. Revision-aware progress and note merges retain
conflicts and alternatives; laboratory runs and assessment attempts are
append-only. The adapter validates `learner-state:1.0.0` before merging and
`submission.js` sends the strict BIP-M7 laboratory/assessment payload fields
with an idempotency key. Learner-private input, answer keys and hidden mastery
values are not logged or rendered.

## UI states and rollback

The controller exposes loading, offline, transport error, schema error,
unsupported version, blocked publication, laboratory failure and assessment
failure states with retry actions where safe. Package delivery, learner state,
laboratory submission, assessment submission and workflow progress are
independent flags, all disabled by default. Disabling a flag restores the
existing static path and preserves Backend/local learner state.

The approved and committed Frontend-safe workflow-progress contract is the
isolated prerequisite commit `13c2b363ebd1560f704f7d967448692f5bab8aa3`.
Workflow progress consumes only the versioned BIP-M4 projection through
`GET /orchestration/v1/frontend/generation-jobs/{generation_job_id}/events`;
Temporal history and private activity payloads remain unavailable to the
browser.

## Validation and known limitations

Focused deterministic tests cover package identity, block order, duplicate
rejection, ETag/304 reuse, exact-release cache isolation, offline behavior,
learner merge/conflict preservation, append-only records, flags and renderer
fallbacks and canonical release-map validation. A disposable PostgreSQL 16
release was seeded from the canonical reference package and exercised through
the live API and Chrome headless: release delivery, conditional 304 reuse,
23-block ordered rendering and laboratory/assessment submissions both returned
the expected results. Playwright visual baselines and a scoped Axe audit pass
at desktop, tablet and mobile viewports. The approved workflow-progress
contract, reconnect semantics and identity boundary are covered by the
Frontend client and Backend contract tests.

No Backend schema, Alembic migration, ACP change, service-worker, router
replacement or BIP-M9 implementation is introduced. Playwright and Axe are
project-local development tooling only; they do not affect runtime contracts.

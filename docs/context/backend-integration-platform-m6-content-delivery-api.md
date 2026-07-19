# BIP-M6 — Content Delivery API

```yaml
canonical_id: NV-BIP-M6
version: 1.0.0
status: IMPLEMENTED
owner: NeuralVerse Hub
language: en
created: 2026-07-18
last_reviewed: 2026-07-18
```

## Scope

BIP-M6 exposes a read-only, frontend-safe projection of one exact immutable
published release. The canonical endpoint is:

```text
GET /api/v1/publication/releases/{release_id}
```

The previously frozen `/delivery/v1` routes remain backward-compatible
delivery projections. No mutation, collection listing, search, asset binary,
authoring, workflow, learner-state or Frontend route is added by BIP-M6.

## Release coherence

The query boundary loads one released `PublicationRelease`, its exact content
version, one `DeliveryManifest`, ordered blocks, source/citation references,
exact asset versions, laboratory specifications and assessment specifications.
The read transaction is repeatable-read and read-only for PostgreSQL. Missing
or cross-version references produce a structured integrity failure; partial
packages are never returned.

The response is the neutral `PublishedLearningPackage` contract. It preserves
package, content-version and release identity, canonical block order, source
and citation relationships, learner-safe laboratory and assessment fields,
governance summary and published accessibility extensions. Private answer
keys, grader data, storage credentials, ORM fields and request metadata are
excluded.

## HTTP contract

The supported representation is
`application/vnd.neuralverse.published-learning-package+json;version=1`.
Missing `Accept`, `application/json` and `*/*` select the stable v1 response;
an unsupported explicit version returns `406 SCHEMA_VERSION_UNSUPPORTED`.
Missing or non-visible releases return structured `404`; retired releases
follow the approved lifecycle policy and are never redirected to a newer ID.

Exact releases use a deterministic weak SHA-256 ETag, immutable one-year
cache headers and `If-None-Match`. Matching validators return bodyless `304`
responses with validators, `Vary` and trace headers preserved. Responses vary
on `Accept` and `Accept-Encoding`; JSON larger than the configured 1 KiB
compression threshold is gzip encoded. The configured uncompressed payload
bound is 2 MiB. The exact-release response is never paginated.

## Security and observability

Only GET delivery routes are exposed. No live agent, search, source retrieval,
S3 HEAD, publication mutation or laboratory execution occurs during delivery.
Correlation/request identity is returned through headers, while errors use a
bounded typed envelope with `error_code`, `message`, `retryable`, safe details
and contract version. OpenAPI exposes transport DTOs and does not expose ORM
models or persistence structure.

## Evidence and limitations

The delivery domain, query service, assembler, transport schemas, cache policy,
conditional requests, gzip middleware and route tests are implemented. The
canonical PostgreSQL integration fixture was executed against the finalized
BIP-M3–BIP-M5 schema on PostgreSQL 16 with pgvector 0.7.4; the exact-release
round trip, ETag/304, gzip, version negotiation and structured 404 behavior
passed. This is disposable non-production evidence.
Frontend integration, learner state, BIP-M7+, publication semantics and
production delivery SLO certification remain separately unauthorized.

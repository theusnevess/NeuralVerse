# NeuralVerse Backend Platform Security Baseline

Canonical identifier: `NV-BIP-M0-P6-SECURITY`<br>
Version: `1.0`<br>
Status: `DECIDED WITH CONDITIONS`<br>
Owner: NeuralVerse project owner and backend platform implementer<br>
Authority: BIP-M0 Phase 6 security and operations decisions<br>
Related documents: `backend-platform-target-architecture.md`, `backend-platform-local-development-model.md`<br>
Supersession: None<br>
Last review date: `2026-07-16`

## Trust Model

The browser is an untrusted client for hosted use. Local development may use a separately identified trusted authoring boundary, but loopback access or a development token is not equivalent to production authentication. Published delivery is read-oriented; learner writes require a learner context; authoring and publication require explicit privileged access.

The backend is the only future boundary permitted to hold provider credentials. Direct browser-to-Ollama communication remains a temporary local compatibility path and is not an acceptable hosted security model.

## Authentication and Authorization

- Initial local identity: generated stable local learner identifier.
- Initial hosted identity: not enabled until an authentication decision and implementation exist.
- Authoring: disabled by default or loopback-only with a separate untracked development token.
- Publication: privileged authoring operation, never anonymous.
- Operations: liveness may be public; readiness and dependency details are protected in hosted deployment.
- Provider gateway: backend-only and actor/rate-limit aware.
- Future multi-user path: introduce authenticated actor identity, bind learner/author/operator roles, and retain current opaque IDs through a migration.

No enterprise SSO, external identity provider, password store, or session system is introduced in Phase 6.

## Secrets

Local development uses process environment or an untracked environment file. Hosted deployment must use an approved host secret mechanism. Variable names may be documented; values must never be committed.

Secret classes include database credentials, authoring token, provider credentials, object-storage credentials, Temporal credentials, and telemetry exporter credentials. Secrets are redacted from logs, error responses, health details, OpenAPI examples, fixtures, and audit payloads. Rotation is a deployment concern and must not require source changes.

## Request Protection

- Validate all request bodies through Pydantic transport schemas.
- Apply bounded request body, message, page-size, and timeout limits.
- Use correlation IDs; accept a safe client-provided ID only after validation, otherwise generate one.
- Use idempotency keys for publication, draft ingestion, and learner interaction writes.
- Reject repeated idempotency keys with a different fingerprint as `IDEMPOTENCY_CONFLICT`.
- Return `429 RATE_LIMITED` with `Retry-After` where available.
- Use application-local rate limits initially; add Redis only for multi-instance/shared counters.
- Prefer same-origin deployment or an explicit allowlist; no wildcard CORS in hosted environments.

Initial limit categories are provider gateway, authoring, publication, learner writes, search, and operations. Local development may use an explicit bypass that is impossible to activate through an untrusted hosted request.

## Error and Audit Policy

The stable error envelope contains `error_code`, frontend-safe `message`, `correlation_id`, optional `field_errors`, `retryable`, and optional `retry_after`. Required categories include validation, not found, conflict, unsupported schema, lifecycle transition, idempotency, governance, asset readiness, publication, workflow availability, dependency availability, rate limiting, internal failure, and cross-front decision required.

Stack traces, SQL text, provider credentials, prompt contents, raw assessment answers, and internal dependency details are not frontend-safe. They belong only in appropriately protected diagnostics, with redaction.

Domain audit records capture actor, command, timestamp, previous/new state, rationale, correlation ID, resource, content version, and result where applicable. Security audit records capture authentication/authorization failures and sensitive boundary events. Operational logs and traces are separate from domain audit and are not substitutes for one another.

## Health and Observability

- `GET /health/live`: process responsiveness only; never depends on PostgreSQL, Redis, Temporal, or providers.
- `GET /health/ready`: whether the API can serve its declared workload; required database connectivity and migration state affect readiness.
- `GET /health/dependencies`: protected detail about database and future dependencies; provider availability is reported only when the provider gateway is enabled.

Initial logs are structured and include request duration, error classification, and correlation ID. Future traces/metrics use OpenTelemetry fields such as `trace_id`, `correlation_id`, `workflow_id`, `package_id`, `content_version_id`, `publication_release_id`, `agent_run_id` when applicable, and safe learner identifiers. Prompt and response bodies are excluded by default.

## Residual Risks

- Local identifiers are not authentication and must not be used for hosted multi-user authorization.
- Direct local-provider browser access remains a temporary compatibility risk.
- Static delivery and legacy loaders are not production-hardened backend boundaries.
- Semantic contract gaps remain registered in the cross-front decision document.
- Production secret-management and deployment controls remain unimplemented until later phases.

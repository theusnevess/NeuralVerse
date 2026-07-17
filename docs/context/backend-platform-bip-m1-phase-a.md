# NeuralVerse Backend Platform - BIP-M1 Phase A Foundation

Canonical identifier: `NV-BIP-M1-A`
Version: `1.0`
Status: `IMPLEMENTED WITH CONDITIONS`
Owner: Backend & Integration Platform
Authority: `NV-BIP-M0-CERT`, `NV-BIP-000`, and explicit project-owner decisions
Certified common base: `f885d4dabcd0f6ee8131d90dab586f9164e404f7`
Certified ACP baseline: `b397035a9cfc3d376afc31633583f2b9ecd76548`
Implementation scope: Python foundation only
Supersession state: Active
Last review date: `2026-07-16`

## Scope and Boundary

BIP-M1 Phase A establishes the smallest executable backend foundation: a reproducible Python project, FastAPI application factory, typed settings, structured logging, correlation IDs, operational error handling, liveness, truthful readiness, and deterministic tests.

It does not implement PostgreSQL, SQLAlchemy, Alembic, semantic shared contracts, content packages, publication, learner persistence, idempotency persistence, workflows, Redis, object storage, telemetry export, authentication, provider gateways, frontend adapters, or the fixture vertical slice.

The foundation consumes no ACP source files and introduces no semantic representation for `AgentContribution`, `LearningPackageDraft`, `ContentBlock`, `PublicationReadinessRecommendation`, `PublishedLearningPackage`, `PublicationRelease`, or `DeliveryManifest`. CF-010, CF-011, and CF-012 remain open.

## Python and Manager Decisions

### BIP-D001 - Python minor version

Problem: The backend needs a stable supported interpreter for Phase A and later FastAPI/Pydantic/PostgreSQL ecosystem work.

Decision: Select Python `3.12`, with `requires-python = ">=3.12,<3.13"` and `.python-version` set to `3.12`.

Evidence: Python `3.12.3` is installed on the developer machine; FastAPI, Pydantic, SQLAlchemy 2, Alembic, and psycopg compatibility is available through the current Python ecosystem and package metadata. The selected runtime is also the local test interpreter.

Consequences: Patch updates remain available within Python 3.12. Python 3.13 is not the supported project minor until a later compatibility review.

Rejected alternatives: Python 3.13, because it is not installed locally and is unnecessary for this foundation; unconstrained Python, because reproducibility would be weaker.

Upgrade trigger: A compatibility-tested project-wide Python minor migration with a clean lock reproduction and full backend validation.

Status: `DECIDED WITH CONDITIONS`

### BIP-D002 - Python dependency manager

Problem: The repository had no Python-native backend manager or lock.

Decision: Use `uv` `0.11.29`, installed user-scoped because no approved manager was available and the system Python is PEP 668 externally managed.

Evidence: `uv` is the preferred manager in BIP-M0, supports `pyproject.toml`, dependency groups, exact `uv.lock` resolution, `.python-version`, and `uv sync --locked`. Official uv documentation identifies `uv.lock` as the exact environment authority.

Consequences: Commands are executed through `uv`; npm remains a frontend/convenience tool. The lock is committed with the backend project.

Rejected alternatives: Poetry, PDM, and pip-tools, because none was installed and selecting another manager would add unnecessary repository complexity. System-wide pip installation was rejected by the PEP 668 boundary.

Upgrade trigger: A documented manager migration with equivalent lock, CI, local, and container workflows.

Status: `DECIDED WITH CONDITIONS`

### BIP-D003 - FastAPI and Pydantic version policy

Problem: Phase A requires a current application framework and typed validation without prematurely selecting database or transport contracts.

Decision: Direct constraints are `fastapi>=0.128,<0.129`, `pydantic>=2.12,<2.13`, `pydantic-settings>=2.11,<2.12`, and `uvicorn[standard]>=0.40,<0.41`. Exact resolutions are authoritative in `backend/uv.lock`.

Evidence: Official FastAPI documentation supports application factories, `lifespan`, middleware, exception handlers, and `TestClient`; official Pydantic Settings documentation supports `SettingsConfigDict`, `env_prefix`, and enum parsing. Clean lock reproduction resolved FastAPI `0.128.8`, Pydantic `2.12.5`, pydantic-settings `2.11.0`, and Uvicorn `0.40.0`.

Consequences: Patch-level updates remain lock-controlled inside the selected minor ranges. Pydantic models are limited to operational HTTP/configuration objects in Phase A.

Rejected alternatives: Broad unbounded dependencies, because they weaken deterministic reproduction; final semantic transport models, because CF-010 through CF-012 remain open.

Upgrade trigger: Compatibility failure, security maintenance requirement, or an approved framework migration with updated tests.

Status: `DECIDED WITH CONDITIONS`

### BIP-D004 - Source-package layout

Problem: The backend needs an importable package without creating empty future architecture layers.

Decision: Use `backend/src/neuralverse_backend` with an application factory at `neuralverse_backend.main:create_app`. Phase A contains only application, configuration, HTTP interface, and operations boundaries.

Evidence: BIP-M0 target architecture names `backend/src/neuralverse_backend/` and requires framework-isolated application boundaries.

Consequences: The package is installed by uv and imports cleanly from a clean environment. Future domain modules can be added without changing the package identity.

Rejected alternatives: A flat root package, because it increases import ambiguity; empty domain/infrastructure modules, because they would falsely imply implemented capabilities.

Upgrade trigger: A later capability receives an authorized module boundary and tests.

Status: `IMPLEMENTED`

### BIP-D005 - Configuration mechanism

Problem: Configuration must be typed, environment-prefixed, test-overridable, and secret-safe.

Decision: Use `pydantic-settings` `BaseSettings` with `NEURALVERSE_` prefix, optional untracked `.env` loading, supported environments `local`, `test`, and `hosted`, and explicit validation for ports, log levels, environments, and hosted wildcard CORS.

Evidence: Official pydantic-settings documentation supports `SettingsConfigDict`, `env_prefix`, `env_file`, and enum parsing. Tests cover invalid environment, invalid port, hosted wildcard CORS, and deterministic test defaults.

Consequences: Database configuration remains optional and readiness never reports an unimplemented database as healthy. Secret values are not logged or returned by readiness.

Rejected alternatives: Import-time environment access, because it prevents controlled test injection; required database configuration, because PostgreSQL is deferred.

Upgrade trigger: Database or authentication phases add their own validated settings groups.

Status: `IMPLEMENTED WITH CONDITIONS`

### BIP-D006 - Structured logging mechanism

Problem: Operational logs need stable fields without leaking prompts, responses, credentials, or environment dumps.

Decision: Use `structlog` `25.5.0`. Local/test defaults use readable console output; hosted settings force JSON output. Startup and shutdown events contain bounded metadata only.

Evidence: Clean lock resolved structlog `25.5.0`; application tests and runtime smoke pass. No vulnerability audit tool was available or executed, so no security claim is made.

Consequences: Correlation context can be bound without coupling logging to semantic contracts. Future OpenTelemetry remains deferred.

Rejected alternatives: Custom logging infrastructure, because it adds maintenance without Phase A value; OpenTelemetry Collector, because it is explicitly deferred.

Upgrade trigger: Observability phase requirements, measured logging limits, or an approved telemetry design.

Status: `IMPLEMENTED WITH CONDITIONS`

### BIP-D007 - Correlation-ID policy

Problem: Requests need operational traceability without treating correlation IDs as semantic or security identifiers.

Decision: Accept `X-Correlation-ID` only when it matches a bounded opaque pattern of at most 128 characters; otherwise generate a UUID4 hex value. Propagate it through request state, response headers, and structlog context.

Evidence: Focused tests cover generation, preservation, invalid replacement, and error-envelope propagation.

Consequences: Correlation IDs are safe operational metadata but do not authenticate, authorize, or replace semantic identifiers.

Rejected alternatives: Unbounded client values, because they create log/header abuse risk; database-backed correlation storage, because persistence is deferred.

Upgrade trigger: Hosted tracing or request-signature requirements.

Status: `IMPLEMENTED`

### BIP-D008 - Foundation readiness semantics

Problem: The foundation must not falsely report deferred dependencies as healthy.

Decision: Phase A is ready when enabled Phase A dependencies are healthy. Database is explicitly `disabled` when `readiness_requires_database=false`; when required without configuration it is `unconfigured`; when configured but uncheckable in Phase A it is `unhealthy`. Detailed dependency diagnostics are not exposed.

Evidence: Readiness tests cover disabled and required-unavailable states; runtime smoke returns `ready` with database `disabled` and no external service.

Consequences: `/health/live` remains process-only. `/health/ready` is truthful about deferred database capability and never exposes connection details.

Rejected alternatives: Always-ready health, because it would hide required dependency failure; a public detailed dependency endpoint, because the Phase A security boundary does not require it.

Upgrade trigger: PostgreSQL foundation introduces a real connection check and migration-state readiness.

Status: `IMPLEMENTED WITH CONDITIONS`

### BIP-D009 - CORS local-development policy

Problem: The existing frontend may require explicit local cross-origin access while hosted wildcard CORS is prohibited.

Decision: Allow only `http://localhost:5173` and `http://127.0.0.1:5173` by default, allow GET and bounded headers, disable credentials, and reject wildcard origins in hosted mode.

Evidence: Values are documented in `.env.example`; settings validation tests reject hosted wildcard CORS. The backend does not modify frontend behavior.

Consequences: Additional local origins require explicit configuration. Authentication is not implemented, so credentials remain disabled.

Rejected alternatives: `allow_origins=["*"]`, because it violates the security baseline; credentialed CORS, because no authenticated capability exists.

Upgrade trigger: A documented frontend adapter or hosted authentication boundary.

Status: `IMPLEMENTED WITH CONDITIONS`

### BIP-D010 - Root command integration

Problem: Developers need reproducible commands without making npm the Python dependency manager.

Decision: Do not add root npm scripts in Phase A. The backend README defines `uv sync`, `uv run pytest`, `uv run ruff`, `uv run mypy`, and Uvicorn commands with an explicit project directory.

Evidence: The repository already has frontend npm scripts and no backend runtime. Direct uv commands keep ownership and failure output clear.

Consequences: Root convenience scripts can be added later if they remain thin delegates to backend-owned commands.

Rejected alternatives: A combined dev orchestrator, because it would introduce process lifecycle scope before the backend runtime is established; npm-managed Python dependencies, because ownership would be ambiguous.

Upgrade trigger: A separately authorized local multi-process development workflow.

Status: `DECIDED WITH CONDITIONS`

## Created Foundation

- `backend/pyproject.toml`: package metadata, direct constraints, dev group, build configuration, pytest, Ruff, mypy, and uv defaults.
- `backend/uv.lock`: exact 36-package resolution.
- `backend/.python-version`: Python 3.12.
- `backend/src/neuralverse_backend`: importable package and application factory.
- `backend/src/neuralverse_backend/configuration`: typed settings and environment validation.
- `backend/src/neuralverse_backend/interfaces/http`: FastAPI application, operational routes, errors, and correlation middleware.
- `backend/src/neuralverse_backend/operations`: minimal dependency-state abstraction.
- `backend/tests`: 15 focused unit/integration tests with no external services.
- `backend/README.md` and `backend/.env.example`: local usage and safe configuration documentation.

## Validation Evidence

- `uv lock --check --project backend`: PASS.
- Clean temporary environment created from `uv.lock`: PASS.
- Import smoke: `NeuralVerse Backend API`.
- Focused/full backend pytest: 15 passed.
- Ruff format check: PASS.
- Ruff lint: PASS.
- Mypy strict source/test check: PASS.
- Runtime loopback smoke: `/health/live` and `/health/ready` PASS.
- `git diff --check`: PASS.
- Security scan: no committed secret; one test contains an intentionally fake URL/password fixture to verify readiness redaction. No vulnerability scanner was available or executed.

## Known Limitations

The clean lock reproduction proves the current Linux/Python 3.12 environment only. Windows, alternate architectures, PostgreSQL, migrations, Docker, authentication, hosted authorization, provider gateways, semantic round trips, and frontend integration remain unproven.

Phase A does not establish Level 2 fixture readiness. The next gate must separately plan PostgreSQL, SQLAlchemy, Alembic, migration validation, transaction strategy, idempotency persistence, lossless fixture envelopes, and preservation tests.

## Classification

`FOUNDATION_IMPLEMENTED_WITH_CONDITIONS`.

The foundation is locally executable and all code validation passes. Conditions are limited to deferred capabilities and environment-specific dependency reproduction; no Phase A correctness claim depends on external services or unresolved semantic decisions.

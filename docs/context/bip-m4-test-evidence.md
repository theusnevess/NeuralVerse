# BIP M4 Test Evidence

Task: `NV-BIP-M4-IMPLEMENT`

Date: 2026-07-18

## Domain Tests

```
tests/unit/domain/test_identifiers.py          — 38 tests
tests/unit/domain/test_shared_primitives.py    — 32 tests
tests/unit/domain/test_curriculum.py           — 5 tests
tests/unit/domain/test_content.py              — 17 tests
tests/unit/domain/test_sources.py              — 4 tests
tests/unit/domain/test_assets.py               — 5 tests
tests/unit/domain/test_bounded_contexts.py     — 27 tests
tests/unit/domain/test_architecture_boundaries.py — 25 tests
tests/unit/domain/test_serialization.py        — 14 tests

Total domain tests: 172
Status: ALL PASSING
```

## Full Unit Test Suite

```
tests/unit/ — 289 tests
Status: ALL PASSING
```

## Linting

```
ruff check src/neuralverse_backend/domain/
Status: All checks passed
```

## Architecture Boundary Tests

Verified:
- [x] No FastAPI imports in domain
- [x] No SQLAlchemy imports in domain
- [x] No Alembic imports in domain
- [x] No Temporal SDK imports in domain
- [x] No ACP imports in domain
- [x] No cross-context cyclic dependencies
- [x] Per-module import verification (25 modules)

## Invariant Tests

- [x] Package identity remains stable
- [x] Version belongs to one package
- [x] Cross-package version attachment fails
- [x] Published version mutation fails
- [x] Correction creates a new version
- [x] Block order is explicit
- [x] Duplicate block position fails when prohibited
- [x] Citation references valid source identity
- [x] Asset references require exact AssetVersionId
- [x] Laboratory run requires exact spec version
- [x] Assessment attempt requires exact assessment version
- [x] Learner interaction requires exact ContentVersionId
- [x] Lifecycle direct mutation is unavailable (methods preferred)
- [x] Invalid lifecycle transitions fail
- [x] Identifier families are not interchangeable
- [x] Display-title changes do not alter IDs
- [x] Domain reconstruction preserves supplied IDs

## Serialization Tests

- [x] IDs serialize deterministically
- [x] IDs parse back to the same family
- [x] Domain events serialize without infrastructure objects
- [x] Opaque metadata survives
- [x] Timestamps remain UTC-aware
- [x] Versions remain exact

## Regression

- [x] All 117 existing unit tests still passing
- [x] No M4-caused regressions

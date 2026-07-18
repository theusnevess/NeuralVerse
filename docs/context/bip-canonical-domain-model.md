# BIP Canonical Domain Model

Task: `NV-BIP-M4-IMPLEMENT`

Status: `IMPLEMENTED — CERTIFICATION REQUIRED`

Date: 2026-07-18

## Overview

The NeuralVerse Backend Domain Model is an explicit, framework-independent,
typed, and tested domain model organized by bounded context. It replaces
fixture-oriented records and implicit dictionaries with a canonical
domain layer.

## Architecture

**Modular monolith** with isolated bounded contexts.

Microservice per agent: PROHIBITED
Microservice per entity: PROHIBITED

## Bounded Contexts (14)

```
identity/
curriculum/
content/
sources_and_citations/
assets/
laboratories/
assessments/
authoring/
orchestration/
governance/
publication/
learner/
synchronization/
search/
operations/
```

Plus `shared/` for domain primitives and `ports.py` for repository interfaces.

## Dependency Rules

```
shared domain primitives
        ↑
bounded-context domain modules
        ↑
application services
        ↑
infrastructure and delivery
```

Domain must NOT depend on:
- FastAPI
- SQLAlchemy ORM
- Alembic
- Temporal SDK
- Redis
- ACP
- Frontend types

## Identifier Model

37 typed identifier value objects with UUID backing, frozen dataclass,
and family discrimination. Cross-family equality is rejected.

## Key Files

```
backend/src/neuralverse_backend/domain/
    __init__.py
    shared/
        __init__.py
        errors.py
        entity.py
        events.py
        identifiers.py
        lifecycle.py
        types.py
    identity/__init__.py
    curriculum/__init__.py
    content/__init__.py
    sources_and_citations/__init__.py
    assets/__init__.py
    laboratories/__init__.py
    assessments/__init__.py
    authoring/__init__.py
    orchestration/__init__.py
    governance/__init__.py
    publication/__init__.py
    learner/__init__.py
    synchronization/__init__.py
    search/__init__.py
    operations/__init__.py
    operations/outbox.py
    ports.py
```

## Validation

- 172 domain tests passing
- 25 architecture boundary tests passing
- 14 serialization tests passing
- 289 total unit tests passing
- Ruff: all checks passed

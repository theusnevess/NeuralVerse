"""SQLAlchemy runtime foundation and BIP-M1 operational models."""

from neuralverse_backend.persistence.engine import create_database_engine
from neuralverse_backend.persistence.health import DatabaseHealthChecker, HealthCheckResult
from neuralverse_backend.persistence.metadata import Base, metadata
from neuralverse_backend.persistence.migrations import (
    MigrationInspection,
    MigrationStateInspector,
    create_migration_engine,
)
from neuralverse_backend.persistence.models import (
    FixtureRecord,
    IdempotencyRecord,
    OperationalAuditEvent,
)
from neuralverse_backend.persistence.runtime import PersistenceRuntime, create_persistence_runtime
from neuralverse_backend.persistence.sessions import create_session_factory, session_scope

__all__ = [
    "Base",
    "DatabaseHealthChecker",
    "HealthCheckResult",
    "FixtureRecord",
    "IdempotencyRecord",
    "MigrationInspection",
    "MigrationStateInspector",
    "PersistenceRuntime",
    "OperationalAuditEvent",
    "create_database_engine",
    "create_migration_engine",
    "create_persistence_runtime",
    "create_session_factory",
    "metadata",
    "session_scope",
]

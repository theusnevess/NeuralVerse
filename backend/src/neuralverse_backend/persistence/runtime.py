from dataclasses import dataclass
from typing import Protocol

import structlog
from sqlalchemy import Engine
from sqlalchemy.orm import Session, sessionmaker

from neuralverse_backend.configuration.settings import Settings
from neuralverse_backend.persistence.engine import create_database_engine
from neuralverse_backend.persistence.health import DatabaseHealthChecker, HealthCheckResult
from neuralverse_backend.persistence.migrations import MigrationStateInspector
from neuralverse_backend.persistence.sessions import create_session_factory


class HealthChecker(Protocol):
    def check(self) -> HealthCheckResult: ...


@dataclass
class PersistenceRuntime:
    engine: Engine | None
    session_factory: sessionmaker[Session] | None
    health_checker: DatabaseHealthChecker | HealthChecker | None
    disposed: bool = False

    def dispose(self) -> None:
        if self.disposed:
            return
        self.disposed = True
        if self.engine is None:
            return
        try:
            self.engine.dispose()
            structlog.get_logger("neuralverse_backend.persistence.runtime").info(
                "persistence_runtime_disposed"
            )
        except Exception as error:
            structlog.get_logger("neuralverse_backend.persistence.runtime").warning(
                "persistence_runtime_disposal_failed",
                error_type=type(error).__name__,
            )


def create_persistence_runtime(settings: Settings) -> PersistenceRuntime:
    if not settings.database_enabled:
        structlog.get_logger("neuralverse_backend.persistence.runtime").info(
            "persistence_runtime_disabled"
        )
        return PersistenceRuntime(engine=None, session_factory=None, health_checker=None)

    engine = create_database_engine(settings)
    session_factory = create_session_factory(engine)
    health_checker = DatabaseHealthChecker(
        engine,
        required=settings.database_required_for_readiness,
        migration_inspector=MigrationStateInspector(engine),
    )
    structlog.get_logger("neuralverse_backend.persistence.runtime").info(
        "persistence_runtime_initialized",
        database_enabled=True,
        database_required_for_readiness=settings.database_required_for_readiness,
        pool_size=settings.database_pool_size,
        max_overflow=settings.database_max_overflow,
        pool_timeout_seconds=settings.database_pool_timeout_seconds,
        pool_recycle_seconds=settings.database_pool_recycle_seconds,
        connect_timeout_seconds=settings.database_connect_timeout_seconds,
        statement_timeout_ms=settings.database_statement_timeout_ms,
        application_name=settings.database_application_name,
    )
    return PersistenceRuntime(
        engine=engine,
        session_factory=session_factory,
        health_checker=health_checker,
    )

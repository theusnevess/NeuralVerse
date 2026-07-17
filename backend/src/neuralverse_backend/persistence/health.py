from dataclasses import dataclass
from time import monotonic

import structlog
from sqlalchemy import Engine, text
from sqlalchemy.exc import SQLAlchemyError

from neuralverse_backend.operations.dependencies import DependencyState, DependencyStatus
from neuralverse_backend.persistence.migrations import MigrationStateInspector


@dataclass(frozen=True, slots=True)
class HealthCheckResult:
    state: DependencyState
    duration_ms: float


class DatabaseHealthChecker:
    def __init__(
        self,
        engine: Engine,
        *,
        required: bool,
        migration_inspector: MigrationStateInspector | None = None,
    ) -> None:
        self.engine = engine
        self.required = required
        self.migration_inspector = migration_inspector

    def check(self) -> HealthCheckResult:
        started = monotonic()
        try:
            with self.engine.connect() as connection:
                result = connection.execute(text("SELECT 1"))
                if result.scalar_one_or_none() != 1:
                    return self._unhealthy(
                        started, "database health query returned an unexpected result"
                    )
            if self.migration_inspector is not None:
                migration = self.migration_inspector.inspect()
                if migration.status != "healthy":
                    return self._unhealthy(started, migration.detail)
                detail = "database connectivity and migration head are compatible"
            else:
                detail = "database connectivity is available"
            duration_ms = self._duration_ms(started)
            structlog.get_logger("neuralverse_backend.persistence.health").info(
                "database_health_check_succeeded",
                duration_ms=duration_ms,
            )
            return HealthCheckResult(
                state=DependencyState(
                    name="database",
                    required=self.required,
                    enabled=True,
                    status=DependencyStatus.HEALTHY,
                    detail=detail,
                ),
                duration_ms=duration_ms,
            )
        except (TimeoutError, SQLAlchemyError) as error:
            return self._unhealthy(started, self._safe_failure_detail(error))
        except Exception as error:
            return self._unhealthy(started, self._safe_failure_detail(error))

    def _unhealthy(self, started: float, detail: str) -> HealthCheckResult:
        duration_ms = self._duration_ms(started)
        structlog.get_logger("neuralverse_backend.persistence.health").warning(
            "database_health_check_failed",
            duration_ms=duration_ms,
            failure_category=detail,
        )
        return HealthCheckResult(
            state=DependencyState(
                name="database",
                required=self.required,
                enabled=True,
                status=DependencyStatus.UNHEALTHY,
                detail=detail,
            ),
            duration_ms=duration_ms,
        )

    @staticmethod
    def _duration_ms(started: float) -> float:
        return max(0.0, (monotonic() - started) * 1000)

    @staticmethod
    def _safe_failure_detail(error: Exception) -> str:
        if isinstance(error, TimeoutError):
            return "database health check timed out"
        if isinstance(error, SQLAlchemyError):
            return "database health check failed"
        return "database health check encountered an unexpected failure"

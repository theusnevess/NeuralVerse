from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from time import monotonic

from sqlalchemy import Engine, create_engine
from sqlalchemy.pool import NullPool

from neuralverse_backend.configuration.settings import Settings

MIGRATIONS_PATH = Path(__file__).resolve().parents[3] / "migrations"


@dataclass(frozen=True, slots=True)
class MigrationInspection:
    status: str
    current_revision: str | None
    expected_revision: str | None
    detail: str
    duration_ms: float


class MigrationStateInspector:
    def __init__(self, engine: Engine, *, script_location: Path = MIGRATIONS_PATH) -> None:
        self.engine = engine
        self.script_location = script_location
        self._cached: MigrationInspection | None = None
        self._cached_at = 0.0

    def inspect(self, *, force: bool = False, cache_seconds: float = 5.0) -> MigrationInspection:
        now = monotonic()
        if not force and self._cached is not None and now - self._cached_at < cache_seconds:
            return self._cached

        started = now
        try:
            from alembic.config import Config
            from alembic.migration import MigrationContext
            from alembic.script import ScriptDirectory

            config = Config(str(self.script_location.parent / "alembic.ini"))
            config.set_main_option("script_location", str(self.script_location))
            expected_heads = tuple(ScriptDirectory.from_config(config).get_heads())
            with self.engine.connect() as connection:
                current_heads = tuple(MigrationContext.configure(connection).get_current_heads())

            expected_revision = ",".join(expected_heads) or None
            current_revision = ",".join(current_heads) or None
            if not current_heads:
                result = MigrationInspection(
                    status="unconfigured",
                    current_revision=None,
                    expected_revision=expected_revision,
                    detail="database migration history is uninitialized",
                    duration_ms=self._duration_ms(started),
                )
            elif current_heads == expected_heads and len(expected_heads) == 1:
                result = MigrationInspection(
                    status="healthy",
                    current_revision=current_revision,
                    expected_revision=expected_revision,
                    detail="database migration head is compatible",
                    duration_ms=self._duration_ms(started),
                )
            else:
                result = MigrationInspection(
                    status="unhealthy",
                    current_revision=current_revision,
                    expected_revision=expected_revision,
                    detail="database migration revision is not compatible",
                    duration_ms=self._duration_ms(started),
                )
        except Exception:
            result = MigrationInspection(
                status="unhealthy",
                current_revision=None,
                expected_revision=None,
                detail="database migration state inspection failed",
                duration_ms=self._duration_ms(started),
            )

        self._cached = result
        self._cached_at = monotonic()
        return result

    @staticmethod
    def _duration_ms(started: float) -> float:
        return max(0.0, (monotonic() - started) * 1000)


def create_migration_engine(settings: Settings) -> Engine:
    if not settings.database_enabled or settings.database_url is None:
        raise ValueError("migration engine requires enabled database settings")

    return create_engine(
        settings.database_url.get_secret_value(),
        connect_args={
            "application_name": f"{settings.database_application_name}-migration",
            "connect_timeout": settings.database_connect_timeout_seconds,
            "options": f"-c statement_timeout={settings.database_statement_timeout_ms}",
        },
        hide_parameters=True,
        isolation_level="READ COMMITTED",
        pool_pre_ping=True,
        poolclass=NullPool,
    )


def load_migration_settings() -> Settings:
    settings = Settings()
    if not settings.database_enabled or settings.database_url is None:
        raise RuntimeError(
            "migration commands require NEURALVERSE_DATABASE_ENABLED=true and "
            "NEURALVERSE_DATABASE_URL"
        )
    return settings

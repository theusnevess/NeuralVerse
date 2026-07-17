from collections.abc import AsyncIterator, Callable
from contextlib import AbstractAsyncContextManager, asynccontextmanager

import structlog
from fastapi import FastAPI

from neuralverse_backend.application.logging import configure_logging
from neuralverse_backend.configuration.settings import Settings
from neuralverse_backend.persistence.runtime import PersistenceRuntime, create_persistence_runtime


def application_lifespan(
    settings: Settings,
    runtime_override: PersistenceRuntime | None = None,
) -> Callable[[FastAPI], AbstractAsyncContextManager[None]]:
    configure_logging(settings)

    @asynccontextmanager
    async def lifespan(app: FastAPI) -> AsyncIterator[None]:
        logger = structlog.get_logger("neuralverse_backend.lifecycle")
        runtime = runtime_override or create_persistence_runtime(settings)
        app.state.persistence_runtime = runtime
        logger.info(
            "application_startup",
            environment=settings.environment.value,
            application=settings.application_name,
            application_version=settings.application_version,
            database_readiness_required=settings.database_required_for_readiness,
            database_enabled=settings.database_enabled,
        )
        app.state.started = True
        try:
            yield
        finally:
            app.state.started = False
            runtime.dispose()
            app.state.persistence_runtime = None
            logger.info("application_shutdown", application=settings.application_name)

    return lifespan

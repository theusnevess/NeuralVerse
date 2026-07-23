import os
from collections.abc import AsyncIterator, Callable
from contextlib import AbstractAsyncContextManager, asynccontextmanager

import structlog
from fastapi import FastAPI

from neuralverse_backend.application.logging import configure_logging
from neuralverse_backend.configuration.settings import Settings
from neuralverse_backend.delivery.queries import DeliveryQueryService
from neuralverse_backend.orchestration import OrchestrationService, TemporalClientGateway
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
        temporal_gateway = None
        temporal_client = None
        if runtime.session_factory is not None:
            try:
                from temporalio.client import Client

                temporal_client = await Client.connect(
                    os.getenv("TEMPORAL_ADDRESS", "temporal:7233"),
                    namespace=os.getenv("TEMPORAL_NAMESPACE", "neuralverse"),
                )
                temporal_gateway = TemporalClientGateway(temporal_client)
            except Exception as error:  # pragma: no cover - exercised at deployment boundary
                logger.warning("temporal_gateway_unavailable", error=str(error))
        app.state.orchestration_service = (
            OrchestrationService(runtime.session_factory, temporal=temporal_gateway)
            if runtime.session_factory is not None
            else None
        )
        app.state.delivery_query_service = (
            DeliveryQueryService(
                runtime.session_factory,
                max_blocks=settings.delivery_max_blocks,
                max_manifest_references=settings.delivery_max_manifest_references,
            )
            if runtime.session_factory is not None
            else None
        )
        app.state.temporal_client = temporal_client
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
            app.state.temporal_client = None
            runtime.dispose()
            app.state.persistence_runtime = None
            logger.info("application_shutdown", application=settings.application_name)

    return lifespan

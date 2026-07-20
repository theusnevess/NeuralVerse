from collections.abc import Awaitable, Callable
from typing import cast

from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.gzip import GZipMiddleware
from starlette.exceptions import HTTPException as StarletteHTTPException
from starlette.requests import Request
from starlette.responses import Response

from neuralverse_backend.application.lifecycle import application_lifespan
from neuralverse_backend.canonical_input import readCanonicalInput
from neuralverse_backend.configuration.settings import Settings
from neuralverse_backend.cross_front.workflow import CrossFrontWorkflowService
from neuralverse_backend.delivery.http import (
    canonical_router,
)
from neuralverse_backend.delivery.http import (
    router as delivery_router,
)
from neuralverse_backend.delivery.queries import DeliveryQueryService
from neuralverse_backend.interfaces.http.cross_front import router as cross_front_router
from neuralverse_backend.interfaces.http.errors import (
    ApplicationError,
    application_error_handler,
    http_error_handler,
    unexpected_error_handler,
    validation_error_handler,
)
from neuralverse_backend.interfaces.http.learner import router as learner_router
from neuralverse_backend.interfaces.http.middleware import CorrelationIdMiddleware
from neuralverse_backend.interfaces.http.operations import router as operations_router
from neuralverse_backend.persistence.runtime import PersistenceRuntime

ExceptionHandler = Callable[[Request, Exception], Response | Awaitable[Response]]


def create_http_app(
    settings: Settings,
    persistence_runtime: PersistenceRuntime | None = None,
    cross_front_workflow_service: CrossFrontWorkflowService | None = None,
) -> FastAPI:
    docs_url = "/docs" if settings.docs_enabled else None
    redoc_url = "/redoc" if settings.docs_enabled else None
    openapi_url = "/openapi.json" if settings.openapi_enabled else None
    app = FastAPI(
        title="NeuralVerse Backend API",
        version=settings.application_version,
        docs_url=docs_url,
        redoc_url=redoc_url,
        openapi_url=openapi_url,
        lifespan=application_lifespan(settings, persistence_runtime),
    )
    app.state.settings = settings
    app.state.persistence_runtime = persistence_runtime
    app.state.cross_front_workflow_service = cross_front_workflow_service
    app.state.canonical_input_reader = readCanonicalInput
    app.state.canonical_persistence_service = None
    app.state.delivery_query_service = (
        DeliveryQueryService(
            persistence_runtime.session_factory,
            max_blocks=settings.delivery_max_blocks,
            max_manifest_references=settings.delivery_max_manifest_references,
        )
        if persistence_runtime is not None and persistence_runtime.session_factory is not None
        else None
    )
    app.add_middleware(CorrelationIdMiddleware)
    app.add_middleware(GZipMiddleware, minimum_size=settings.delivery_compression_minimum_bytes)
    app.add_exception_handler(ApplicationError, cast(ExceptionHandler, application_error_handler))
    app.add_exception_handler(
        RequestValidationError,
        cast(ExceptionHandler, validation_error_handler),
    )
    app.add_exception_handler(StarletteHTTPException, cast(ExceptionHandler, http_error_handler))
    app.add_exception_handler(Exception, cast(ExceptionHandler, unexpected_error_handler))
    app.include_router(operations_router)
    app.include_router(learner_router)
    app.include_router(cross_front_router)
    app.include_router(delivery_router)
    app.include_router(canonical_router)
    return app

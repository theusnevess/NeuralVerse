from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from neuralverse_backend.configuration.settings import Settings
from neuralverse_backend.interfaces.http.app import create_http_app
from neuralverse_backend.persistence.runtime import PersistenceRuntime


def create_app(
    settings: Settings | None = None,
    persistence_runtime: PersistenceRuntime | None = None,
) -> FastAPI:
    resolved_settings = settings or Settings()
    app = create_http_app(resolved_settings, persistence_runtime)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=resolved_settings.cors_allowed_origins,
        allow_credentials=False,
        allow_methods=["GET", "POST", "PUT", "PATCH"],
        allow_headers=[
            "Accept",
            "Content-Type",
            "X-Correlation-ID",
            "X-Request-ID",
            "If-None-Match",
            "Idempotency-Key",
        ],
    )
    return app

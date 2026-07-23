"""Optional OpenTelemetry tracing without semantic-payload capture."""

from __future__ import annotations

import os

from opentelemetry import trace
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter
from opentelemetry.sdk.resources import SERVICE_NAME, SERVICE_VERSION, Resource
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from starlette.types import ASGIApp, Message, Receive, Scope, Send


def configure_tracing(service_version: str) -> trace.Tracer:
    """Configure an optional OTLP exporter and return the request tracer."""

    enabled = os.getenv("NEURALVERSE_OTEL_ENABLED", "false").lower() == "true"
    current = trace.get_tracer_provider()
    if enabled and not isinstance(current, TracerProvider):
        provider = TracerProvider(
            resource=Resource.create(
                {
                    SERVICE_NAME: "neuralverse-backend-api",
                    SERVICE_VERSION: service_version,
                }
            )
        )
        endpoint = os.getenv("OTEL_EXPORTER_OTLP_ENDPOINT", "http://otel-collector:4317")
        provider.add_span_processor(
            BatchSpanProcessor(OTLPSpanExporter(endpoint=endpoint, insecure=True))
        )
        trace.set_tracer_provider(provider)
    return trace.get_tracer("neuralverse.backend.http", schema_url="https://opentelemetry.io/schemas/1.27.0")


class RequestTracingMiddleware:
    """Create bounded HTTP spans and never record request or response bodies."""

    def __init__(self, app: ASGIApp, tracer: trace.Tracer) -> None:
        self.app = app
        self.tracer = tracer

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        method = str(scope.get("method", "GET"))
        path = str(scope.get("path", "/"))
        status_code: int | None = None

        async def send_with_status(message: Message) -> None:
            nonlocal status_code
            if message["type"] == "http.response.start":
                status_code = int(message["status"])
            await send(message)

        with self.tracer.start_as_current_span(f"{method} {path}") as span:
            span.set_attribute("http.request.method", method)
            span.set_attribute("url.path", path)
            try:
                await self.app(scope, receive, send_with_status)
            except Exception:
                span.record_exception(Exception("request failed"))
                span.set_attribute("error.type", "unhandled_exception")
                raise
            finally:
                if status_code is not None:
                    span.set_attribute("http.response.status_code", status_code)


__all__ = ["RequestTracingMiddleware", "configure_tracing"]

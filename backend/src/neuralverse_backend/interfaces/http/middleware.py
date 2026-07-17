import re
from uuid import uuid4

import structlog
from starlette.types import ASGIApp, Message, Receive, Scope, Send

CORRELATION_HEADER = "X-Correlation-ID"
_CORRELATION_PATTERN = re.compile(r"^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$")


def valid_correlation_id(value: str | None) -> bool:
    return value is not None and bool(_CORRELATION_PATTERN.fullmatch(value))


def new_correlation_id() -> str:
    return uuid4().hex


class CorrelationIdMiddleware:
    def __init__(self, app: ASGIApp) -> None:
        self.app = app

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        incoming: str | None = None
        for key, value in scope.get("headers", []):
            if key.lower() == b"x-correlation-id":
                incoming = value.decode("latin-1") if isinstance(value, bytes) else str(value)
                break
        correlation_id = (
            incoming
            if incoming is not None and valid_correlation_id(incoming)
            else new_correlation_id()
        )
        scope.setdefault("state", {})["correlation_id"] = correlation_id
        structlog.contextvars.bind_contextvars(correlation_id=correlation_id)

        async def send_with_correlation(message: Message) -> None:
            if message["type"] == "http.response.start":
                headers = list(message.get("headers", []))
                if not any(
                    key.lower() == CORRELATION_HEADER.lower().encode() for key, _ in headers
                ):
                    headers.append((CORRELATION_HEADER.lower().encode(), correlation_id.encode()))
                message = {**message, "headers": headers}
            await send(message)

        try:
            await self.app(scope, receive, send_with_correlation)
        finally:
            structlog.contextvars.clear_contextvars()

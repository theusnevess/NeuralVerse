import structlog
from fastapi import Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from starlette.exceptions import HTTPException as StarletteHTTPException


class FieldError(BaseModel):
    field: str
    message: str


class ErrorEnvelope(BaseModel):
    error_code: str
    message: str
    correlation_id: str
    field_errors: list[FieldError] = Field(default_factory=list)
    retryable: bool = False
    retry_after: int | None = None


class ApplicationError(Exception):
    def __init__(
        self,
        error_code: str,
        message: str,
        *,
        status_code: int = 400,
        retryable: bool = False,
        retry_after: int | None = None,
    ) -> None:
        super().__init__(message)
        self.error_code = error_code
        self.message = message
        self.status_code = status_code
        self.retryable = retryable
        self.retry_after = retry_after


def _correlation_id(request: Request) -> str:
    return getattr(request.state, "correlation_id", "unknown")


def _response(
    request: Request,
    *,
    status_code: int,
    error_code: str,
    message: str,
    field_errors: list[FieldError] | None = None,
    retryable: bool = False,
    retry_after: int | None = None,
) -> JSONResponse:
    envelope = ErrorEnvelope(
        error_code=error_code,
        message=message,
        correlation_id=_correlation_id(request),
        field_errors=field_errors or [],
        retryable=retryable,
        retry_after=retry_after,
    )
    response = JSONResponse(
        status_code=status_code, content=envelope.model_dump(exclude_none=False)
    )
    response.headers["X-Correlation-ID"] = envelope.correlation_id
    if retry_after is not None:
        response.headers["Retry-After"] = str(retry_after)
    return response


async def application_error_handler(request: Request, exc: ApplicationError) -> JSONResponse:
    return _response(
        request,
        status_code=exc.status_code,
        error_code=exc.error_code,
        message=exc.message,
        retryable=exc.retryable,
        retry_after=exc.retry_after,
    )


async def validation_error_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    fields = [
        FieldError(field=".".join(str(part) for part in error["loc"]), message=error["msg"])
        for error in exc.errors()
    ]
    return _response(
        request,
        status_code=422,
        error_code="VALIDATION_ERROR",
        message="Request validation failed.",
        field_errors=fields,
    )


async def http_error_handler(request: Request, exc: StarletteHTTPException) -> JSONResponse:
    status_code = exc.status_code
    error_code = "NOT_FOUND" if status_code == 404 else "HTTP_ERROR"
    message = "Resource not found." if status_code == 404 else "Request could not be completed."
    if isinstance(exc.detail, dict):
        detail_code = exc.detail.get("code")
        detail_message = exc.detail.get("message")
        if isinstance(detail_code, str):
            error_code = detail_code
        if isinstance(detail_message, str):
            message = detail_message
    return _response(request, status_code=status_code, error_code=error_code, message=message)


async def unexpected_error_handler(request: Request, exc: Exception) -> JSONResponse:
    structlog.get_logger("neuralverse_backend.errors").exception(
        "unexpected_application_error",
        extra={"correlation_id": _correlation_id(request), "error_type": type(exc).__name__},
    )
    return _response(
        request,
        status_code=500,
        error_code="INTERNAL_ERROR",
        message="An internal error occurred.",
    )

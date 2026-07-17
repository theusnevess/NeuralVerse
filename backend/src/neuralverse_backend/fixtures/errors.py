from __future__ import annotations

from dataclasses import dataclass

from sqlalchemy.exc import (
    DBAPIError,
    DisconnectionError,
    IntegrityError,
    SQLAlchemyError,
    TimeoutError,
)


class PayloadIssue(Exception):
    """Safe, fixture-local issue raised while processing a bounded payload."""

    def __init__(self, code: str, message: str, location: str | None = None) -> None:
        super().__init__(message)
        self.code = code
        self.message = message
        self.location = location


class FixtureRecordConstructionError(ValueError):
    """Raised when a non-persistable adapter result is converted to a record."""


class UnsupportedPayloadType(TypeError):
    """Raised when the production adapter input is not bytes."""


class CommandValidationError(ValueError):
    """Raised for safe command metadata validation failures."""

    def __init__(self, code: str, message: str) -> None:
        super().__init__(message)
        self.code = code
        self.safe_message = message


class IntegrityFailure(RuntimeError):
    """Raised when durable operational references are internally inconsistent."""


class DatabaseFailureKind:
    RETRYABLE = "RETRYABLE_OPERATION_FAILURE"
    COMMIT_UNKNOWN = "COMMIT_OUTCOME_UNKNOWN"
    INTERNAL = "NON_RETRYABLE_INTERNAL_FAILURE"


@dataclass(frozen=True, slots=True)
class DatabaseFailureClassification:
    kind: str
    error_code: str


_RETRYABLE_SQLSTATES = {
    "40001": "DATABASE_SERIALIZATION_FAILURE",
    "40P01": "DATABASE_DEADLOCK",
    "55P03": "DATABASE_LOCK_TIMEOUT",
    "57014": "DATABASE_STATEMENT_TIMEOUT",
    "57P01": "DATABASE_ADMIN_SHUTDOWN",
    "57P02": "DATABASE_CRASH_SHUTDOWN",
    "57P03": "DATABASE_CANNOT_CONNECT",
}


def classify_database_error(
    error: BaseException, *, commit: bool = False
) -> DatabaseFailureClassification:
    if commit:
        return DatabaseFailureClassification(
            DatabaseFailureKind.COMMIT_UNKNOWN, "COMMIT_OUTCOME_UNKNOWN"
        )
    if isinstance(error, TimeoutError):
        return DatabaseFailureClassification(DatabaseFailureKind.RETRYABLE, "DATABASE_POOL_TIMEOUT")
    if isinstance(error, DisconnectionError):
        return DatabaseFailureClassification(
            DatabaseFailureKind.RETRYABLE, "DATABASE_CONNECTION_FAILURE"
        )
    if isinstance(error, IntegrityError):
        return DatabaseFailureClassification(
            DatabaseFailureKind.INTERNAL, "DATABASE_INTEGRITY_FAILURE"
        )
    sqlstate = _sqlstate(error)
    if sqlstate in _RETRYABLE_SQLSTATES:
        return DatabaseFailureClassification(
            DatabaseFailureKind.RETRYABLE, _RETRYABLE_SQLSTATES[sqlstate]
        )
    if isinstance(error, DBAPIError) and error.connection_invalidated:
        return DatabaseFailureClassification(
            DatabaseFailureKind.RETRYABLE, "DATABASE_CONNECTION_FAILURE"
        )
    if isinstance(error, SQLAlchemyError):
        return DatabaseFailureClassification(
            DatabaseFailureKind.INTERNAL, "DATABASE_INTERNAL_FAILURE"
        )
    return DatabaseFailureClassification(
        DatabaseFailureKind.INTERNAL, "FIXTURE_INGESTION_INTERNAL_FAILURE"
    )


def _sqlstate(error: BaseException) -> str | None:
    current: object | None = error
    for _ in range(3):
        if current is None:
            return None
        value = getattr(current, "sqlstate", None) or getattr(current, "pgcode", None)
        if isinstance(value, str):
            return value
        diagnostics = getattr(current, "diag", None)
        value = getattr(diagnostics, "sqlstate", None)
        if isinstance(value, str):
            return value
        current = getattr(current, "orig", None)
    return None

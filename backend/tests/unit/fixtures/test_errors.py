from __future__ import annotations

from sqlalchemy.exc import IntegrityError, OperationalError

from neuralverse_backend.fixtures.errors import DatabaseFailureKind, classify_database_error


class SqlStateError(Exception):
    def __init__(self, sqlstate: str) -> None:
        super().__init__("safe")
        self.sqlstate = sqlstate


def test_structured_database_retryable_classifications() -> None:
    for sqlstate in ("40001", "40P01", "55P03", "57014", "57P01", "57P02", "57P03"):
        error = OperationalError("database", {}, SqlStateError(sqlstate))
        assert classify_database_error(error).kind == DatabaseFailureKind.RETRYABLE


def test_integrity_failure_is_not_retryable() -> None:
    error = IntegrityError("database", {}, SqlStateError("23505"))
    result = classify_database_error(error)
    assert result.kind == DatabaseFailureKind.INTERNAL
    assert result.error_code == "DATABASE_INTEGRITY_FAILURE"


def test_commit_failure_is_always_unknown() -> None:
    result = classify_database_error(RuntimeError("commit"), commit=True)
    assert result.kind == DatabaseFailureKind.COMMIT_UNKNOWN
    assert result.error_code == "COMMIT_OUTCOME_UNKNOWN"

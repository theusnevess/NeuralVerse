from __future__ import annotations

from dataclasses import dataclass
from enum import StrEnum
from uuid import UUID


class IngestOutcome(StrEnum):
    CREATED = "CREATED"
    REPLAYED = "REPLAYED"
    STRUCTURALLY_REJECTED = "STRUCTURALLY_REJECTED"
    IN_PROGRESS = "IN_PROGRESS"
    IDEMPOTENCY_CONFLICT = "IDEMPOTENCY_CONFLICT"
    FAILED_TERMINAL = "FAILED_TERMINAL"
    RETRYABLE_OPERATION_FAILURE = "RETRYABLE_OPERATION_FAILURE"
    INTERNAL_FAILURE = "INTERNAL_FAILURE"


@dataclass(frozen=True, slots=True)
class IngestFixtureResult:
    outcome: IngestOutcome
    fixture_record_id: UUID | None = None
    validation_status: str | None = None
    replayed: bool = False
    idempotency_status: str | None = None
    error_code: str | None = None
    retryable: bool = False
    finding_codes: tuple[str, ...] = ()

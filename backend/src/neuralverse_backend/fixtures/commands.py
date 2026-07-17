from __future__ import annotations

import re
from dataclasses import dataclass
from datetime import datetime
from uuid import UUID

from neuralverse_backend.fixtures.errors import CommandValidationError


@dataclass(frozen=True, slots=True)
class IngestFixtureCommand:
    raw_payload: bytes
    schema_name: str
    schema_version: str
    minimum_reader_version: str
    producer_version: str
    payload_media_type: str
    idempotency_key: str
    correlation_id: str | None
    request_id: str | None
    occurred_at: datetime
    supersedes_fixture_record_id: UUID | None = None

    def validate(self) -> None:
        if not isinstance(self.raw_payload, bytes):
            raise CommandValidationError(
                "FIXTURE_COMMAND_INVALID", "Fixture payload input is invalid."
            )
        if not 1 <= len(self.idempotency_key) <= 255 or any(
            not 0x21 <= ord(character) <= 0x7E for character in self.idempotency_key
        ):
            raise CommandValidationError(
                "FIXTURE_IDEMPOTENCY_KEY_INVALID", "Idempotency key is invalid."
            )
        _bounded_text(self.schema_name, 128, "Fixture schema name is invalid.")
        _version(self.schema_version, "Fixture schema version is invalid.", require_major_one=True)
        _version(self.minimum_reader_version, "Minimum reader version is invalid.")
        _bounded_text(self.producer_version, 64, "Producer version is invalid.")
        if self.payload_media_type != "application/json":
            raise CommandValidationError(
                "FIXTURE_MEDIA_TYPE_UNSUPPORTED", "Only application/json is accepted."
            )
        if self.occurred_at.tzinfo is None or self.occurred_at.utcoffset() is None:
            raise CommandValidationError("FIXTURE_COMMAND_INVALID", "Receipt timestamp is invalid.")
        if self.correlation_id is not None:
            _bounded_text(self.correlation_id, 128, "Correlation ID is invalid.")
        if self.request_id is not None:
            _bounded_text(self.request_id, 128, "Request ID is invalid.")
        if self.supersedes_fixture_record_id is not None and not isinstance(
            self.supersedes_fixture_record_id, UUID
        ):
            raise CommandValidationError(
                "FIXTURE_COMMAND_INVALID", "Supersession identifier is invalid."
            )


def _bounded_text(value: str, maximum: int, message: str) -> None:
    if not value.strip() or len(value) > maximum:
        raise CommandValidationError("FIXTURE_COMMAND_INVALID", message)


_VERSION_PATTERN = re.compile(r"^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$")


def _version(value: str, message: str, *, require_major_one: bool = False) -> None:
    match = _VERSION_PATTERN.fullmatch(value)
    if match is None or (require_major_one and match.group(1) != "1"):
        raise CommandValidationError("FIXTURE_COMMAND_INVALID", message)

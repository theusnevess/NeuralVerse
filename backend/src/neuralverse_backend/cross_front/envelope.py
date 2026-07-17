from __future__ import annotations

import json
import re
from dataclasses import dataclass
from datetime import datetime, timedelta
from enum import StrEnum
from typing import TYPE_CHECKING, Any

if TYPE_CHECKING:
    from neuralverse_backend.fixtures.commands import IngestFixtureCommand

CURRENT_SCHEMA_VERSION = "1.0.0"
SCHEMA_NAME = "NV-XFI-000"
_VERSION = re.compile(r"^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$")


class CrossFrontEnvelopeError(ValueError):
    def __init__(self, code: str, message: str, *, retryable: bool = False) -> None:
        super().__init__(message)
        self.code = code
        self.retryable = retryable


class Compatibility(StrEnum):
    COMPATIBLE = "COMPATIBLE"
    UNSUPPORTED_MAJOR = "UNSUPPORTED_MAJOR"
    REQUIRES_NEWER_READER = "REQUIRES_NEWER_READER"
    MALFORMED = "MALFORMED"


@dataclass(frozen=True, slots=True)
class CrossFrontEnvelope:
    metadata: dict[str, Any]
    payload: Any


def _version(value: object) -> tuple[int, int, int] | None:
    if not isinstance(value, str):
        return None
    match = _VERSION.fullmatch(value)
    if match is None:
        return None
    major, minor, patch = match.groups()
    return int(major), int(minor), int(patch)


def classify_compatibility(
    metadata: dict[str, Any], reader_version: str = CURRENT_SCHEMA_VERSION
) -> Compatibility:
    schema = _version(metadata.get("schema_version"))
    minimum = _version(metadata.get("minimum_reader_version"))
    reader = _version(reader_version)
    if schema is None or minimum is None or reader is None:
        return Compatibility.MALFORMED
    if schema[0] != reader[0]:
        return Compatibility.UNSUPPORTED_MAJOR
    if minimum > reader:
        return Compatibility.REQUIRES_NEWER_READER
    return Compatibility.COMPATIBLE


def decode_envelope(value: object) -> CrossFrontEnvelope:
    if (
        not isinstance(value, dict)
        or not isinstance(value.get("metadata"), dict)
        or "payload" not in value
    ):
        raise CrossFrontEnvelopeError(
            "MALFORMED_PAYLOAD", "NV-XFI-000 envelope requires metadata and payload."
        )
    metadata = value["metadata"]
    required = (
        "schema_name",
        "schema_version",
        "minimum_reader_version",
        "producer_version",
        "created_at",
    )
    if any(not isinstance(metadata.get(field), str) or not metadata[field] for field in required):
        raise CrossFrontEnvelopeError("VALIDATION_ERROR", "Envelope metadata is incomplete.")
    if metadata["schema_name"] != SCHEMA_NAME:
        raise CrossFrontEnvelopeError("VALIDATION_ERROR", "Unsupported cross-front schema name.")
    if not metadata["created_at"].endswith("Z"):
        raise CrossFrontEnvelopeError(
            "VALIDATION_ERROR", "created_at must use the canonical UTC Z suffix."
        )
    try:
        timestamp = datetime.fromisoformat(metadata["created_at"].replace("Z", "+00:00"))
    except ValueError as error:
        raise CrossFrontEnvelopeError("VALIDATION_ERROR", "created_at is not RFC3339.") from error
    if timestamp.tzinfo is None or timestamp.utcoffset() != timedelta(0):
        raise CrossFrontEnvelopeError("VALIDATION_ERROR", "created_at must include a UTC offset.")
    compatibility = classify_compatibility(metadata)
    if compatibility == Compatibility.UNSUPPORTED_MAJOR:
        raise CrossFrontEnvelopeError(
            "SCHEMA_VERSION_UNSUPPORTED", "Schema major version is unsupported."
        )
    if compatibility == Compatibility.REQUIRES_NEWER_READER:
        raise CrossFrontEnvelopeError(
            "CONTRACT_VERSION_MISMATCH", "minimum_reader_version requires a newer reader."
        )
    if compatibility == Compatibility.MALFORMED:
        raise CrossFrontEnvelopeError("VALIDATION_ERROR", "Schema version metadata is malformed.")
    try:
        json.dumps(value["payload"], allow_nan=False)
    except (TypeError, ValueError) as error:
        raise CrossFrontEnvelopeError("MALFORMED_PAYLOAD", "Payload is not JSON-safe.") from error
    return CrossFrontEnvelope(metadata=dict(metadata), payload=value["payload"])


def encode_envelope(envelope: CrossFrontEnvelope) -> bytes:
    from neuralverse_backend.fixtures.hashing import canonicalize_structural_json

    decode_envelope({"metadata": envelope.metadata, "payload": envelope.payload})
    return canonicalize_structural_json(
        {"metadata": envelope.metadata, "payload": envelope.payload}
    )


def to_fixture_command(
    envelope: CrossFrontEnvelope, *, idempotency_key: str, occurred_at: datetime
) -> IngestFixtureCommand:
    """Adapt a validated semantic envelope to the existing fixture intake boundary.

    The adapter carries the envelope as bytes and copies metadata verbatim; it
    does not reinterpret payload fields or promote persistence IDs to semantic
    identity.
    """
    from neuralverse_backend.fixtures.commands import IngestFixtureCommand

    decode_envelope({"metadata": envelope.metadata, "payload": envelope.payload})
    return IngestFixtureCommand(
        raw_payload=encode_envelope(envelope),
        schema_name=envelope.metadata["schema_name"],
        schema_version=envelope.metadata["schema_version"],
        minimum_reader_version=envelope.metadata["minimum_reader_version"],
        producer_version=envelope.metadata["producer_version"],
        payload_media_type="application/json",
        idempotency_key=idempotency_key,
        correlation_id=envelope.metadata.get("correlation_id"),
        request_id=envelope.metadata.get("message_id"),
        occurred_at=occurred_at,
    )

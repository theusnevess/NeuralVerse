from __future__ import annotations

import re
from datetime import datetime
from typing import Any, TypedDict, cast

from neuralverse_backend.fixtures.errors import PayloadIssue, UnsupportedPayloadType
from neuralverse_backend.fixtures.findings import ValidationFinding, bound_findings, finding
from neuralverse_backend.fixtures.hashing import raw_payload_sha256, structural_payload_sha256
from neuralverse_backend.fixtures.json_parser import parse_strict_json, structural_findings
from neuralverse_backend.fixtures.types import PreparedFixturePayload, PreparedPayloadDisposition
from neuralverse_backend.persistence.models import FixtureValidationStatus

MAX_RAW_PAYLOAD_BYTES = 1_048_576
CURRENT_FIXTURE_READER_VERSION = "1.0.0"
_SEMVER_PATTERN = re.compile(r"^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$")
_MAX_SCHEMA_NAME = 128
_MAX_SCHEMA_VERSION = 32
_MAX_READER_VERSION = 32
_MAX_PRODUCER_VERSION = 64
_MAX_MEDIA_TYPE = 128


class _Metadata(TypedDict):
    schema_name: str
    schema_version: str
    minimum_reader_version: str
    producer_version: str
    payload_media_type: str
    received_at: datetime


def _version(value: str) -> tuple[int, int, int] | None:
    match = _SEMVER_PATTERN.fullmatch(value)
    return (
        cast(tuple[int, int, int], tuple(int(part) for part in match.groups())) if match else None
    )


def _base_result(
    *,
    raw_payload: bytes | None,
    raw_hash: str | None,
    schema_name: str,
    schema_version: str,
    minimum_reader_version: str,
    producer_version: str,
    payload_media_type: str,
    received_at: datetime,
    status: FixtureValidationStatus,
    findings: list[ValidationFinding],
    disposition: PreparedPayloadDisposition,
    structural_payload: Any | None = None,
    structural_hash: str | None = None,
) -> PreparedFixturePayload:
    return PreparedFixturePayload(
        schema_name=schema_name,
        schema_version=schema_version,
        minimum_reader_version=minimum_reader_version,
        producer_version=producer_version,
        payload_media_type=payload_media_type,
        received_at=received_at,
        raw_payload=raw_payload,
        raw_payload_sha256=raw_hash,
        structural_payload=structural_payload,
        structural_payload_sha256=structural_hash,
        validation_status=status,
        findings=bound_findings(findings),
        disposition=disposition,
    )


def _rejected(
    *,
    raw_payload: bytes,
    raw_hash: str,
    metadata: _Metadata,
    findings: list[ValidationFinding],
) -> PreparedFixturePayload:
    return _base_result(
        raw_payload=raw_payload,
        raw_hash=raw_hash,
        status=FixtureValidationStatus.STRUCTURALLY_REJECTED,
        findings=findings,
        disposition=PreparedPayloadDisposition.PERSISTABLE_REJECTED,
        **metadata,
    )


def _metadata_findings(
    schema_name: str,
    schema_version: str,
    minimum_reader_version: str,
    producer_version: str,
    payload_media_type: str,
    received_at: datetime,
) -> list[ValidationFinding]:
    findings: list[ValidationFinding] = []
    if not schema_name.strip() or len(schema_name) > _MAX_SCHEMA_NAME:
        findings.append(finding("FIXTURE_METADATA_INVALID", "Fixture schema name is invalid."))
    schema = _version(schema_version)
    if schema is None or len(schema_version) > _MAX_SCHEMA_VERSION:
        findings.append(
            finding("FIXTURE_SCHEMA_VERSION_MALFORMED", "Fixture schema version is invalid.")
        )
    elif schema[0] != 1:
        findings.append(
            finding("FIXTURE_SCHEMA_VERSION_UNSUPPORTED", "Fixture schema major is unsupported.")
        )
    if len(minimum_reader_version) > _MAX_READER_VERSION:
        findings.append(
            finding("MINIMUM_READER_VERSION_MALFORMED", "Minimum reader version is invalid.")
        )
    if not producer_version.strip() or len(producer_version) > _MAX_PRODUCER_VERSION:
        findings.append(finding("FIXTURE_METADATA_INVALID", "Producer version is invalid."))
    if payload_media_type != "application/json" or len(payload_media_type) > _MAX_MEDIA_TYPE:
        findings.append(
            finding("FIXTURE_MEDIA_TYPE_UNSUPPORTED", "Only application/json is accepted.")
        )
    if received_at.tzinfo is None or received_at.utcoffset() is None:
        findings.append(
            finding("FIXTURE_METADATA_INVALID", "Receipt timestamp must be timezone-aware.")
        )
    return findings


def _reader_finding(version: str) -> ValidationFinding | None:
    parsed = _version(version)
    if parsed is None:
        return finding("MINIMUM_READER_VERSION_MALFORMED", "Minimum reader version is invalid.")
    current = _version(CURRENT_FIXTURE_READER_VERSION)
    assert current is not None
    if parsed > current:
        return finding(
            "MINIMUM_READER_VERSION_UNSUPPORTED",
            "Payload requires an unsupported fixture reader version.",
        )
    return None


def _bom_finding(raw_payload: bytes) -> ValidationFinding | None:
    if raw_payload.startswith(b"\xef\xbb\xbf"):
        return finding("FIXTURE_DISALLOWED_BOM", "UTF-8 BOM is not accepted.")
    if raw_payload.startswith((b"\xff\xfe", b"\xfe\xff", b"\xff\xfe\x00\x00", b"\x00\x00\xfe\xff")):
        return finding(
            "FIXTURE_UNSUPPORTED_ENCODING", "UTF-16 and UTF-32 payloads are not accepted."
        )
    return None


def prepare_fixture_payload(
    *,
    raw_payload: bytes,
    schema_name: str,
    schema_version: str,
    minimum_reader_version: str,
    producer_version: str,
    payload_media_type: str,
    received_at: datetime,
) -> PreparedFixturePayload:
    if not isinstance(raw_payload, bytes):
        raise UnsupportedPayloadType("fixture payload input must be bytes")

    metadata: _Metadata = {
        "schema_name": schema_name,
        "schema_version": schema_version,
        "minimum_reader_version": minimum_reader_version,
        "producer_version": producer_version,
        "payload_media_type": payload_media_type,
        "received_at": received_at,
    }
    metadata_findings = _metadata_findings(**metadata)
    if len(raw_payload) > MAX_RAW_PAYLOAD_BYTES:
        return _base_result(
            raw_payload=None,
            raw_hash=None,
            status=FixtureValidationStatus.STRUCTURALLY_REJECTED,
            findings=[
                finding("FIXTURE_PAYLOAD_TOO_LARGE", "Payload exceeds the configured byte limit.")
            ],
            disposition=PreparedPayloadDisposition.NON_PERSISTABLE_REJECTED,
            **metadata,
        )

    raw_hash = raw_payload_sha256(raw_payload)
    reader_finding = _reader_finding(minimum_reader_version)
    if metadata_findings or reader_finding is not None:
        findings = metadata_findings + ([reader_finding] if reader_finding else [])
        return _rejected(
            raw_payload=raw_payload, raw_hash=raw_hash, metadata=metadata, findings=findings
        )

    bom_finding = _bom_finding(raw_payload)
    if bom_finding is not None:
        return _rejected(
            raw_payload=raw_payload, raw_hash=raw_hash, metadata=metadata, findings=[bom_finding]
        )
    try:
        text = raw_payload.decode("utf-8", errors="strict")
    except UnicodeDecodeError:
        return _rejected(
            raw_payload=raw_payload,
            raw_hash=raw_hash,
            metadata=metadata,
            findings=[finding("FIXTURE_INVALID_UTF8", "Payload is not valid UTF-8.")],
        )

    try:
        structural_payload = parse_strict_json(text)
    except PayloadIssue as error:
        return _rejected(
            raw_payload=raw_payload,
            raw_hash=raw_hash,
            metadata=metadata,
            findings=[finding(error.code, error.message, location=error.location)],
        )
    structural_limit_findings = [
        finding(code, message) for code, message in structural_findings(structural_payload)
    ]
    if structural_limit_findings:
        return _rejected(
            raw_payload=raw_payload,
            raw_hash=raw_hash,
            metadata=metadata,
            findings=structural_limit_findings,
        )
    structural_hash = structural_payload_sha256(structural_payload)
    return _base_result(
        raw_payload=raw_payload,
        raw_hash=raw_hash,
        status=FixtureValidationStatus.STRUCTURALLY_VALID,
        findings=[],
        disposition=PreparedPayloadDisposition.PERSISTABLE_VALID,
        structural_payload=structural_payload,
        structural_hash=structural_hash,
        **metadata,
    )

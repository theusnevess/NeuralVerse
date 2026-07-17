from __future__ import annotations

import json
from datetime import UTC, datetime
from typing import Any, cast

import pytest

from neuralverse_backend.cross_front import (
    Compatibility,
    CrossFrontEnvelope,
    CrossFrontEnvelopeError,
    classify_compatibility,
    decode_envelope,
    encode_envelope,
    to_fixture_command,
)
from neuralverse_backend.fixtures import prepare_fixture_payload


def envelope(**metadata: object) -> dict[str, object]:
    return {
        "metadata": {
            "schema_name": "NV-XFI-000",
            "schema_version": "1.0.0",
            "minimum_reader_version": "1.0.0",
            "producer_version": "bip-cross-front-test:1.0.0",
            "created_at": "2026-07-17T00:00:00Z",
            **metadata,
        },
        "payload": {
            "blockOrder": ["block-2", "block-1"],
            "status": "UNKNOWN",
            "futureExtension": {"preserve": True},
        },
    }


def test_decode_and_encode_preserve_order_and_unknown_fields() -> None:
    decoded = decode_envelope(envelope())
    encoded = encode_envelope(decoded)
    assert json.loads(encoded)["payload"]["blockOrder"] == ["block-2", "block-1"]
    assert json.loads(encoded)["payload"]["futureExtension"] == {"preserve": True}


def test_compatible_minor_and_major_rejection() -> None:
    assert (
        classify_compatibility({"schema_version": "1.1.0", "minimum_reader_version": "1.0.0"})
        == Compatibility.COMPATIBLE
    )
    with pytest.raises(CrossFrontEnvelopeError, match="unsupported"):
        decode_envelope(envelope(schema_version="2.0.0"))


def test_malformed_and_newer_reader_rejection() -> None:
    with pytest.raises(CrossFrontEnvelopeError, match="incomplete"):
        decode_envelope({"metadata": {}, "payload": {}})
    with pytest.raises(CrossFrontEnvelopeError, match="newer"):
        decode_envelope(envelope(minimum_reader_version="1.1.0"))
    with pytest.raises(CrossFrontEnvelopeError, match="canonical UTC"):
        decode_envelope(envelope(created_at="2026-07-17T00:00:00+00:00"))


def test_envelope_is_json_safe_and_does_not_create_partial_success() -> None:
    decoded = decode_envelope(envelope())
    assert isinstance(decoded, CrossFrontEnvelope)
    with pytest.raises(CrossFrontEnvelopeError):
        decode_envelope({"metadata": envelope()["metadata"], "payload": object()})


def test_valid_envelope_adapts_to_fixture_intake_without_reinterpreting_payload() -> None:
    decoded = decode_envelope(envelope(message_id="message:1", correlation_id="correlation:1"))
    command = to_fixture_command(
        decoded, idempotency_key="nv-xfi-test-1", occurred_at=datetime(2026, 7, 17, tzinfo=UTC)
    )
    command.validate()
    assert command.schema_name == "NV-XFI-000"
    assert json.loads(command.raw_payload)["payload"]["blockOrder"] == ["block-2", "block-1"]
    prepared = prepare_fixture_payload(
        raw_payload=command.raw_payload,
        schema_name=command.schema_name,
        schema_version=command.schema_version,
        minimum_reader_version=command.minimum_reader_version,
        producer_version=command.producer_version,
        payload_media_type=command.payload_media_type,
        received_at=command.occurred_at,
    )
    record = prepared.to_fixture_record()
    structural = cast(dict[str, Any], record.structural_payload)
    payload = cast(dict[str, Any], structural["payload"])
    assert payload["blockOrder"] == ["block-2", "block-1"]
    assert payload["futureExtension"] == {"preserve": True}

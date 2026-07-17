from __future__ import annotations

import hashlib
from datetime import UTC, datetime

import pytest

from neuralverse_backend.fixtures import (
    MAX_RAW_PAYLOAD_BYTES,
    PreparedFixturePayload,
    PreparedPayloadDisposition,
    prepare_fixture_payload,
)
from neuralverse_backend.fixtures.errors import FixtureRecordConstructionError
from neuralverse_backend.fixtures.findings import bound_findings, finding
from neuralverse_backend.fixtures.hashing import canonicalize_structural_json


def prepare(
    raw_payload: bytes,
    *,
    minimum_reader_version: str = "1.0.0",
) -> PreparedFixturePayload:
    return prepare_fixture_payload(
        raw_payload=raw_payload,
        schema_name="neuralverse.backend.fixture-envelope",
        schema_version="1.0.0",
        minimum_reader_version=minimum_reader_version,
        producer_version="test",
        payload_media_type="application/json",
        received_at=datetime.now(UTC),
    )


def test_raw_hash_uses_exact_bytes_and_structural_hash_ignores_object_order() -> None:
    first = prepare(b'{"b":2,"a":1}')
    second = prepare(b'{"a":1,"b":2}')

    assert first.raw_payload == b'{"b":2,"a":1}'
    assert first.raw_payload_sha256 == hashlib.sha256(first.raw_payload).hexdigest()
    assert first.raw_payload_sha256 != second.raw_payload_sha256
    assert first.structural_payload == second.structural_payload == {"b": 2, "a": 1}
    assert first.structural_payload_sha256 == second.structural_payload_sha256


def test_structural_vectors_are_fixed_and_arrays_remain_ordered() -> None:
    assert canonicalize_structural_json({"b": 2, "a": 1}) == b'{"a":1,"b":2}'
    assert prepare(b'{"b":2,"a":1}').structural_payload_sha256 == (
        "43258cff783fe7036d8a43033f830adfc60ec037382473548ac742b888292777"
    )
    assert (
        prepare(b"[1,2]").structural_payload_sha256 != prepare(b"[2,1]").structural_payload_sha256
    )
    assert prepare(b'{"value":null}').structural_payload != prepare(b"{}\n").structural_payload


def test_valid_record_has_fixed_fixture_classification() -> None:
    record = prepare(b'{"unknown":{"nested":true},"items":[2,1]}').to_fixture_record()

    assert record.fixture_classification == "TEST_FIXTURE"
    assert record.canonicality == "NON_CANONICAL"
    assert record.agent_generated is False
    assert record.shared_contract_status == "NOT_A_FINAL_SHARED_CONTRACT"
    assert record.validation_findings == []


@pytest.mark.parametrize(
    ("payload", "code"),
    [
        (b"\xef\xbb\xbf{}", "FIXTURE_DISALLOWED_BOM"),
        (b"\xff\xfe{\x00}\x00", "FIXTURE_UNSUPPORTED_ENCODING"),
        (b"{\x80}", "FIXTURE_INVALID_UTF8"),
        (b'{"a":1,"a":2}', "FIXTURE_DUPLICATE_KEYS"),
        (b"NaN", "FIXTURE_NON_FINITE_NUMBER"),
        (b'{"a":', "FIXTURE_INVALID_JSON"),
    ],
)
def test_bounded_rejections_retain_raw_bytes(payload: bytes, code: str) -> None:
    result = prepare(payload)

    assert result.disposition == PreparedPayloadDisposition.PERSISTABLE_REJECTED
    assert result.raw_payload == payload
    assert result.raw_payload_sha256 is not None
    assert result.structural_payload is None
    assert result.structural_payload_sha256 is None
    assert result.findings[0].code == code
    assert result.to_fixture_record().validation_status == "STRUCTURALLY_REJECTED"


def test_unsupported_reader_hashes_without_decoding(monkeypatch: pytest.MonkeyPatch) -> None:
    def fail_decoder(_: str) -> object:
        raise AssertionError("decoder/parser must not run")

    monkeypatch.setattr("neuralverse_backend.fixtures.preservation.parse_strict_json", fail_decoder)
    result = prepare(b"not utf8 json", minimum_reader_version="1.1.0")

    assert result.disposition == PreparedPayloadDisposition.PERSISTABLE_REJECTED
    assert result.raw_payload_sha256 is not None
    assert result.structural_payload is None
    assert result.findings[0].code == "MINIMUM_READER_VERSION_UNSUPPORTED"


def test_lower_and_equal_reader_versions_continue_processing() -> None:
    assert prepare(b"{}", minimum_reader_version="0.9.0").persistable
    assert prepare(b"{}", minimum_reader_version="1.0.0").persistable


def test_malformed_reader_version_is_rejected_without_parsing(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setattr(
        "neuralverse_backend.fixtures.preservation.parse_strict_json",
        lambda _: (_ for _ in ()).throw(AssertionError("parser must not run")),
    )
    result = prepare(b"{}", minimum_reader_version="not-a-version")

    assert result.disposition == PreparedPayloadDisposition.PERSISTABLE_REJECTED
    assert result.findings[0].code == "MINIMUM_READER_VERSION_MALFORMED"


def test_oversized_payload_short_circuits_before_hashing(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(
        "neuralverse_backend.fixtures.preservation.raw_payload_sha256",
        lambda _: (_ for _ in ()).throw(AssertionError("hash must not run")),
    )
    payload = b"x" * (MAX_RAW_PAYLOAD_BYTES + 1)
    result = prepare(payload)

    assert result.disposition == PreparedPayloadDisposition.NON_PERSISTABLE_REJECTED
    assert result.raw_payload is None
    assert result.raw_payload_sha256 is None
    assert result.findings[0].code == "FIXTURE_PAYLOAD_TOO_LARGE"
    with pytest.raises(FixtureRecordConstructionError):
        result.to_fixture_record()


@pytest.mark.parametrize(
    ("payload", "accepted"),
    [
        (b"1" * 256, True),
        (b"1" * 257, False),
        (b"1e999", True),
        (b"1e1000", True),
        (b"1e1001", False),
        (b"0." + b"0" * 254 + b"1", True),
        (b"0." + b"0" * 255 + b"1", True),
        (b"0." + b"0" * 256 + b"1", False),
    ],
)
def test_numeric_limits(payload: bytes, accepted: bool) -> None:
    result = prepare(payload)
    assert (result.disposition == PreparedPayloadDisposition.PERSISTABLE_VALID) is accepted


def test_structural_limits_at_and_over_boundary() -> None:
    accepted_object = prepare(b"{" + b",".join(f'"{i}":0'.encode() for i in range(4096)) + b"}")
    rejected_object = prepare(b"{" + b",".join(f'"{i}":0'.encode() for i in range(4097)) + b"}")
    accepted_array = prepare(b"[" + b",".join(b"0" for _ in range(16384)) + b"]")
    rejected_array = prepare(b"[" + b",".join(b"0" for _ in range(16385)) + b"]")

    assert accepted_object.disposition == PreparedPayloadDisposition.PERSISTABLE_VALID
    assert rejected_object.findings[0].code == "FIXTURE_STRUCTURAL_LIMIT"
    assert accepted_array.disposition == PreparedPayloadDisposition.PERSISTABLE_VALID
    assert rejected_array.findings[0].code == "FIXTURE_STRUCTURAL_LIMIT"


def test_string_and_key_limits() -> None:
    accepted = prepare(b'{"' + b"x" * 256 + b'":"' + b"y" * 262144 + b'"}')
    rejected_key = prepare(b'{"' + b"x" * 257 + b'":0}')
    rejected_string = prepare(b'{"x":"' + b"y" * 262145 + b'"}')

    assert accepted.disposition == PreparedPayloadDisposition.PERSISTABLE_VALID
    assert rejected_key.findings[0].code == "FIXTURE_STRUCTURAL_LIMIT"
    assert rejected_string.findings[0].code == "FIXTURE_STRUCTURAL_LIMIT"


def test_findings_are_deterministically_truncated() -> None:
    findings = [finding("FIXTURE_STRUCTURAL_LIMIT", "bounded") for _ in range(65)]
    bounded = bound_findings(findings)

    assert len(bounded) == 64
    assert bounded[:63] == tuple(findings[:63])
    assert bounded[-1].code == "FINDINGS_TRUNCATED"

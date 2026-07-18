from __future__ import annotations

import json
from datetime import UTC, datetime
from pathlib import Path

import pytest

from neuralverse_backend.cross_front.bip_m1 import (
    BackendWrapperMetadata,
    CanonicalContractEnvelope,
    ContractError,
    ContractErrorCode,
    RawCanonicalContract,
    adapt_contract,
    ingest_contract,
    reverse_adapt,
)

FIXTURES = json.loads(
    (Path(__file__).parents[2] / "fixtures" / "bip_m1_contracts.json").read_text()
)


@pytest.mark.parametrize("name", list(FIXTURES))
def test_all_approved_contracts_are_accepted_and_round_trip_losslessly(name: str) -> None:
    raw_bytes = json.dumps(FIXTURES[name], ensure_ascii=False, separators=(",", ":")).encode()
    raw = RawCanonicalContract.from_bytes(raw_bytes, expected_name=name)
    domain = adapt_contract(raw)
    assert domain.name == name
    assert reverse_adapt(domain).to_bytes() == raw_bytes
    assert reverse_adapt(domain).value() == FIXTURES[name]


def test_unknown_fields_and_ordered_arrays_are_immutable_and_preserved() -> None:
    value = dict(FIXTURES["LearningPackageDraft"])
    value["blockOrder"] = ["block:1"]
    value["nestedUnknown"] = {"list": [{"keep": True}]}
    raw = RawCanonicalContract.from_value(value, expected_name="LearningPackageDraft")
    domain = adapt_contract(raw)
    assert domain.value()["nestedUnknown"] == {"list": [{"keep": True}]}
    assert domain.value()["blockOrder"] == ["block:1"]
    with pytest.raises(TypeError):
        domain.payload["nestedUnknown"] = {}  # type: ignore[index]


def test_unknown_major_and_newer_minimum_reader_are_rejected() -> None:
    major = dict(FIXTURES["AgentContribution"], schema_version="2.0.0")
    with pytest.raises(ContractError) as major_error:
        RawCanonicalContract.from_value(major, expected_name="AgentContribution")
    assert major_error.value.code == ContractErrorCode.CONTRACT_VERSION_MISMATCH

    newer = dict(FIXTURES["AgentContribution"], minimum_reader_version="1.1.0")
    with pytest.raises(ContractError) as minimum_error:
        RawCanonicalContract.from_value(newer, expected_name="AgentContribution")
    assert minimum_error.value.code == ContractErrorCode.CONTRACT_MINIMUM_READER_UNSUPPORTED


def test_compatible_minor_is_accepted_without_version_coercion() -> None:
    value = dict(FIXTURES["CurriculumContract"], schema_version="1.1.0")
    raw = RawCanonicalContract.from_value(value, expected_name="CurriculumContract")
    assert raw.identity.version.major == 1
    assert str(raw.identity.version) == "1.1.0"
    assert raw.compatibility.accepted


def test_backend_wrapper_is_separate_and_digest_bound() -> None:
    raw = RawCanonicalContract.from_value(
        FIXTURES["ValidationResult"], expected_name="ValidationResult"
    )
    wrapper = BackendWrapperMetadata(
        ingestion_id="ingestion:1",
        received_at=datetime.now(UTC),
        received_by="backend",
        source_front="ACP",
        contract_digest=raw.digest,
        compatibility_result=raw.compatibility.classification,
    )
    ingestion = ingest_contract(raw.to_bytes(), expected_name="ValidationResult", wrapper=wrapper)
    assert ingestion.unwrap().value()["status"] == "UNKNOWN"
    assert "ingestion_id" not in ingestion.unwrap().value()


def test_missing_required_known_field_is_rejected() -> None:
    value = dict(FIXTURES["AgentContribution"])
    del value["agentId"]
    with pytest.raises(ContractError) as error:
        RawCanonicalContract.from_value(value, expected_name="AgentContribution")
    assert error.value.code == ContractErrorCode.CONTRACT_VALIDATION_FAILURE


def test_nv_xfi_envelope_preserves_transport_metadata_and_payload_bytes() -> None:
    envelope = {
        "metadata": {
            "schema_name": "NV-XFI-000",
            "schema_version": "1.0.0",
            "minimum_reader_version": "1.0.0",
            "producer_version": "acp:1.0.0",
            "created_at": "2026-07-18T00:00:00Z",
            "correlation_id": "correlation:1",
        },
        "payload": {"kind": "authoring-execution-result", "status": "UNKNOWN"},
    }
    raw_bytes = json.dumps(envelope, separators=(",", ":")).encode()
    parsed = CanonicalContractEnvelope.from_bytes(raw_bytes)
    assert parsed.to_bytes() == raw_bytes
    assert parsed.value() == envelope
    assert parsed.metadata["correlation_id"] == "correlation:1"


def test_envelope_rejects_non_xfi_schema() -> None:
    value = {
        "metadata": {
            "schema_name": "other",
            "schema_version": "1.0.0",
            "minimum_reader_version": "1.0.0",
            "producer_version": "test:1.0.0",
            "created_at": "2026-07-18T00:00:00Z",
        },
        "payload": {},
    }
    with pytest.raises(ContractError) as error:
        CanonicalContractEnvelope.from_value(value)
    assert error.value.code == ContractErrorCode.CONTRACT_SCHEMA_MISMATCH

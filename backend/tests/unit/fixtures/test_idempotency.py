from __future__ import annotations

import base64
from datetime import UTC, datetime

import pytest
from pydantic import SecretStr, ValidationError

from neuralverse_backend.configuration.settings import Environment, Settings
from neuralverse_backend.fixtures.commands import IngestFixtureCommand
from neuralverse_backend.fixtures.errors import CommandValidationError
from neuralverse_backend.fixtures.idempotency import (
    HMACKeyring,
    hmac_message,
    request_fingerprint,
)

KEY = bytes(range(32))
KEY_B64 = base64.b64encode(KEY).decode()


def test_hmac_message_and_vector_are_fixed() -> None:
    settings = Settings(
        environment=Environment.TEST,
        fixture_ingestion_enabled=True,
        idempotency_hmac_active_key_version="fixture-hmac-2026-01",
        idempotency_hmac_active_key=SecretStr(KEY_B64),
    )
    keyring = HMACKeyring.from_settings(settings)

    assert hmac_message("abc") == b"key-hash-v1\x00fixture_ingest\x00ingest_fixture\x00abc"
    assert keyring.active_digest("abc").hex() == (
        "d335af66f7d94a7ee0968b744b92a9d7f694958e58562d8b7065a0b19633aff0"
    )


def test_fingerprint_vector_and_transport_independence() -> None:
    assert request_fingerprint(
        schema_name="schema",
        schema_version="1.0.0",
        payload_media_type="application/json",
        minimum_reader_version="1.0.0",
        producer_version="producer",
        raw_payload_hash="0" * 64,
        payload_size=2,
        supersedes_fixture_record_id=None,
    ) == ("584864eb9f38f09f01d98b9091f19919d31649dad8c4cca087bbd3d06107f9fa")


def test_oversized_fingerprint_binds_size_without_payload_hash() -> None:
    first = request_fingerprint(
        schema_name="schema",
        schema_version="1.0.0",
        payload_media_type="application/json",
        minimum_reader_version="1.0.0",
        producer_version="producer",
        raw_payload_hash=None,
        payload_size=1_048_577,
        supersedes_fixture_record_id=None,
    )
    second = request_fingerprint(
        schema_name="schema",
        schema_version="1.0.0",
        payload_media_type="application/json",
        minimum_reader_version="1.0.0",
        producer_version="producer",
        raw_payload_hash=None,
        payload_size=1_048_578,
        supersedes_fixture_record_id=None,
    )
    assert first != second


def test_configuration_requires_valid_enabled_hmac_material() -> None:
    with pytest.raises(ValidationError, match="active.*HMAC key"):
        Settings(environment=Environment.TEST, fixture_ingestion_enabled=True)
    with pytest.raises(ValidationError, match="invalid"):
        Settings(
            environment=Environment.TEST,
            fixture_ingestion_enabled=True,
            idempotency_hmac_active_key_version="bad version",
            idempotency_hmac_active_key=SecretStr(KEY_B64),
        )
    with pytest.raises(ValidationError, match="invalid"):
        Settings(
            environment=Environment.TEST,
            fixture_ingestion_enabled=True,
            idempotency_hmac_active_key_version="v1",
            idempotency_hmac_active_key=SecretStr(base64.b64encode(b"short").decode()),
        )


def test_configuration_previous_key_rules_and_redaction() -> None:
    previous = '{"previous-v1":"' + KEY_B64 + '"}'
    settings = Settings(
        environment=Environment.TEST,
        fixture_ingestion_enabled=True,
        idempotency_hmac_active_key_version="active-v1",
        idempotency_hmac_active_key=SecretStr(KEY_B64),
        idempotency_hmac_previous_keys=SecretStr(previous),
    )
    assert KEY_B64 not in repr(settings)
    with pytest.raises(ValidationError, match="previous"):
        Settings(
            environment=Environment.TEST,
            fixture_ingestion_enabled=True,
            idempotency_hmac_active_key_version="active-v1",
            idempotency_hmac_active_key=SecretStr(KEY_B64),
            idempotency_hmac_previous_keys=SecretStr('{"active-v1":"' + KEY_B64 + '"}'),
        )


def test_command_rejects_key_and_transport_metadata_without_database() -> None:
    command = IngestFixtureCommand(
        raw_payload=b"{}",
        schema_name="schema",
        schema_version="1.0.0",
        minimum_reader_version="1.0.0",
        producer_version="producer",
        payload_media_type="application/json",
        idempotency_key="bad key",
        correlation_id=None,
        request_id=None,
        occurred_at=datetime.now(UTC),
    )
    with pytest.raises(CommandValidationError):
        command.validate()

from __future__ import annotations

import base64
import binascii
import hashlib
import hmac
import json
import re
import struct
from dataclasses import dataclass

from pydantic import SecretStr

from neuralverse_backend.configuration.settings import Settings
from neuralverse_backend.fixtures.errors import CommandValidationError

IDEMPOTENCY_SCOPE = "fixture_ingest"
OPERATION_NAME = "ingest_fixture"
HMAC_MESSAGE_VERSION = "key-hash-v1"
FINGERPRINT_VERSION = "request-fingerprint-v1"
HMAC_VERSION_PATTERN = re.compile(r"^[A-Za-z0-9._-]{1,32}$")


@dataclass(frozen=True, slots=True)
class HMACKeyring:
    active_version: str
    active_key: bytes
    previous_keys: tuple[tuple[str, bytes], ...] = ()

    def __post_init__(self) -> None:
        if not HMAC_VERSION_PATTERN.fullmatch(self.active_version) or len(self.active_key) != 32:
            raise ValueError("idempotency HMAC keyring is invalid")
        if len(self.previous_keys) > 4 or self.active_version in {
            version for version, _ in self.previous_keys
        }:
            raise ValueError("idempotency HMAC keyring is invalid")
        versions = [version for version, _ in self.previous_keys]
        if len(versions) != len(set(versions)):
            raise ValueError("idempotency HMAC keyring is invalid")
        if any(
            not HMAC_VERSION_PATTERN.fullmatch(version) or len(key) != 32
            for version, key in self.previous_keys
        ):
            raise ValueError("idempotency HMAC keyring is invalid")

    @classmethod
    def from_settings(cls, settings: Settings) -> HMACKeyring:
        if not settings.fixture_ingestion_enabled:
            raise ValueError("fixture ingestion is disabled")
        if settings.idempotency_hmac_active_key_version is None:
            raise ValueError("active HMAC key version is required")
        if settings.idempotency_hmac_active_key is None:
            raise ValueError("active HMAC key is required")
        active = _decode_key(settings.idempotency_hmac_active_key)
        previous = _parse_previous_keys(settings.idempotency_hmac_previous_keys)
        return cls(settings.idempotency_hmac_active_key_version, active, previous)

    def candidates(self) -> tuple[tuple[str, bytes], ...]:
        return ((self.active_version, self.active_key),) + tuple(
            sorted(self.previous_keys, key=lambda item: item[0])
        )

    def digests(self, raw_key: str) -> tuple[bytes, ...]:
        validate_idempotency_key(raw_key)
        return tuple(
            hmac.new(key, hmac_message(raw_key), hashlib.sha256).digest()
            for _, key in self.candidates()
        )

    def active_digest(self, raw_key: str) -> bytes:
        validate_idempotency_key(raw_key)
        return hmac.new(self.active_key, hmac_message(raw_key), hashlib.sha256).digest()


def validate_idempotency_key(raw_key: str) -> None:
    if not 1 <= len(raw_key) <= 255 or any(not 0x21 <= ord(char) <= 0x7E for char in raw_key):
        raise CommandValidationError(
            "FIXTURE_IDEMPOTENCY_KEY_INVALID", "Idempotency key is invalid."
        )


def hmac_message(raw_key: str) -> bytes:
    validate_idempotency_key(raw_key)
    return b"\x00".join(
        part.encode("ascii")
        for part in (HMAC_MESSAGE_VERSION, IDEMPOTENCY_SCOPE, OPERATION_NAME, raw_key)
    )


def request_fingerprint(
    *,
    schema_name: str,
    schema_version: str,
    payload_media_type: str,
    minimum_reader_version: str,
    producer_version: str,
    raw_payload_hash: str | None,
    payload_size: int,
    supersedes_fixture_record_id: str | None,
) -> str:
    fields = [
        FINGERPRINT_VERSION,
        OPERATION_NAME,
        schema_name,
        schema_version,
        payload_media_type,
        minimum_reader_version,
        producer_version,
        supersedes_fixture_record_id or "<ABSENT>",
    ]
    if raw_payload_hash is None:
        fields.extend(["OVERSIZED", str(payload_size), "<ABSENT>"])
    else:
        fields.append(raw_payload_hash)
    encoded = b"".join(
        struct.pack(">I", len(value.encode("utf-8"))) + value.encode("utf-8") for value in fields
    )
    return hashlib.sha256(encoded).hexdigest()


def _decode_key(value: SecretStr) -> bytes:
    encoded = value.get_secret_value()
    if not encoded or encoded != encoded.strip():
        raise ValueError("idempotency HMAC key is invalid")
    try:
        decoded = base64.b64decode(encoded, validate=True)
    except (ValueError, binascii.Error) as error:
        raise ValueError("idempotency HMAC key is invalid") from error
    if len(decoded) != 32:
        raise ValueError("idempotency HMAC key is invalid")
    return decoded


def _parse_previous_keys(value: SecretStr) -> tuple[tuple[str, bytes], ...]:
    try:
        parsed = json.loads(value.get_secret_value(), object_pairs_hook=_pairs_without_duplicates)
    except (ValueError, json.JSONDecodeError) as error:
        raise ValueError("idempotency previous HMAC keys are invalid") from error
    if not isinstance(parsed, dict) or len(parsed) > 4:
        raise ValueError("idempotency previous HMAC keys are invalid")
    result: list[tuple[str, bytes]] = []
    for version, encoded in parsed.items():
        if not isinstance(version, str) or not HMAC_VERSION_PATTERN.fullmatch(version):
            raise ValueError("idempotency previous HMAC key version is invalid")
        if not isinstance(encoded, str):
            raise ValueError("idempotency previous HMAC key is invalid")
        result.append((version, _decode_key(SecretStr(encoded))))
    return tuple(result)


def _pairs_without_duplicates(pairs: list[tuple[str, object]]) -> dict[str, object]:
    result: dict[str, object] = {}
    for key, value in pairs:
        if key in result:
            raise ValueError("duplicate previous HMAC key version")
        result[key] = value
    return result

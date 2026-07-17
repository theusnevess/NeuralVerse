"""B.4.2 raw and structural fixture preservation adapter."""

from neuralverse_backend.fixtures.commands import IngestFixtureCommand
from neuralverse_backend.fixtures.errors import FixtureRecordConstructionError
from neuralverse_backend.fixtures.findings import FindingSeverity, ValidationFinding
from neuralverse_backend.fixtures.hashing import (
    STRUCTURAL_HASH_ALGORITHM,
    canonicalize_structural_json,
    raw_payload_sha256,
    structural_payload_sha256,
)
from neuralverse_backend.fixtures.idempotency import (
    FINGERPRINT_VERSION,
    HMAC_MESSAGE_VERSION,
    IDEMPOTENCY_SCOPE,
    OPERATION_NAME,
    HMACKeyring,
)
from neuralverse_backend.fixtures.ingestion import IngestFixture
from neuralverse_backend.fixtures.preservation import (
    CURRENT_FIXTURE_READER_VERSION,
    MAX_RAW_PAYLOAD_BYTES,
    prepare_fixture_payload,
)
from neuralverse_backend.fixtures.results import IngestFixtureResult, IngestOutcome
from neuralverse_backend.fixtures.types import PreparedFixturePayload, PreparedPayloadDisposition

__all__ = [
    "CURRENT_FIXTURE_READER_VERSION",
    "FindingSeverity",
    "MAX_RAW_PAYLOAD_BYTES",
    "PreparedFixturePayload",
    "PreparedPayloadDisposition",
    "STRUCTURAL_HASH_ALGORITHM",
    "FixtureRecordConstructionError",
    "FINGERPRINT_VERSION",
    "HMACKeyring",
    "HMAC_MESSAGE_VERSION",
    "IDEMPOTENCY_SCOPE",
    "IngestFixture",
    "IngestFixtureCommand",
    "IngestFixtureResult",
    "IngestOutcome",
    "OPERATION_NAME",
    "ValidationFinding",
    "canonicalize_structural_json",
    "prepare_fixture_payload",
    "raw_payload_sha256",
    "structural_payload_sha256",
]

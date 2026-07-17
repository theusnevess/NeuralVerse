from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from enum import StrEnum
from typing import Any
from uuid import uuid4

from neuralverse_backend.fixtures.errors import FixtureRecordConstructionError
from neuralverse_backend.fixtures.findings import ValidationFinding
from neuralverse_backend.fixtures.hashing import canonicalize_structural_json
from neuralverse_backend.persistence.models import FixtureRecord, FixtureValidationStatus


class PreparedPayloadDisposition(StrEnum):
    PERSISTABLE_VALID = "PERSISTABLE_VALID"
    PERSISTABLE_REJECTED = "PERSISTABLE_REJECTED"
    NON_PERSISTABLE_REJECTED = "NON_PERSISTABLE_REJECTED"


@dataclass(frozen=True, slots=True)
class PreparedFixturePayload:
    schema_name: str
    schema_version: str
    minimum_reader_version: str
    producer_version: str
    payload_media_type: str
    received_at: datetime
    raw_payload: bytes | None
    raw_payload_sha256: str | None
    structural_payload: Any | None
    structural_payload_sha256: str | None
    validation_status: FixtureValidationStatus
    findings: tuple[ValidationFinding, ...]
    disposition: PreparedPayloadDisposition

    @property
    def persistable(self) -> bool:
        return self.disposition != PreparedPayloadDisposition.NON_PERSISTABLE_REJECTED

    def to_fixture_record(self) -> FixtureRecord:
        if not self.persistable or self.raw_payload is None or self.raw_payload_sha256 is None:
            raise FixtureRecordConstructionError(
                "non-persistable fixture payload cannot become a record"
            )
        if self.disposition == PreparedPayloadDisposition.PERSISTABLE_VALID:
            if self.structural_payload is None or self.structural_payload_sha256 is None:
                raise FixtureRecordConstructionError(
                    "valid payload is missing structural representation"
                )
        elif self.structural_payload is not None or self.structural_payload_sha256 is not None:
            raise FixtureRecordConstructionError(
                "rejected payload cannot contain structural representation"
            )

        record = FixtureRecord(
            fixture_record_id=uuid4(),
            fixture_schema_name=self.schema_name,
            fixture_schema_version=self.schema_version,
            minimum_reader_version=self.minimum_reader_version,
            producer_version=self.producer_version,
            fixture_classification="TEST_FIXTURE",
            canonicality="NON_CANONICAL",
            agent_generated=False,
            shared_contract_status="NOT_A_FINAL_SHARED_CONTRACT",
            payload_media_type=self.payload_media_type,
            raw_payload=self.raw_payload,
            raw_payload_sha256=self.raw_payload_sha256,
            structural_payload=self.structural_payload,
            structural_payload_sha256=self.structural_payload_sha256,
            validation_status=self.validation_status.value,
            validation_findings=[finding.as_json() for finding in self.findings],
            received_at=self.received_at,
        )
        if self.structural_payload is not None:
            object.__setattr__(
                record,
                "_canonical_structural_payload",
                canonicalize_structural_json(self.structural_payload),
            )
        return record

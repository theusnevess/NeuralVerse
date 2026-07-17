from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import JSON, CheckConstraint, DateTime, ForeignKey, Index, String, Text, Uuid, text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.types import LargeBinary

from neuralverse_backend.persistence.metadata import Base
from neuralverse_backend.persistence.models.enums import (
    FixtureCanonicality,
    FixtureClassification,
    FixtureSharedContractStatus,
)

PORTABLE_JSONB = JSON().with_variant(JSONB(astext_type=Text()), "postgresql")


class FixtureRecord(Base):
    __tablename__ = "fixture_records"

    fixture_record_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    fixture_schema_name: Mapped[str] = mapped_column(String(128), nullable=False)
    fixture_schema_version: Mapped[str] = mapped_column(String(32), nullable=False)
    minimum_reader_version: Mapped[str] = mapped_column(String(32), nullable=False)
    producer_version: Mapped[str] = mapped_column(String(64), nullable=False)
    fixture_classification: Mapped[str] = mapped_column(
        String(32),
        nullable=False,
        default=FixtureClassification.TEST_FIXTURE.value,
        server_default=text("'TEST_FIXTURE'"),
    )
    canonicality: Mapped[str] = mapped_column(
        String(32),
        nullable=False,
        default=FixtureCanonicality.NON_CANONICAL.value,
        server_default=text("'NON_CANONICAL'"),
    )
    agent_generated: Mapped[bool] = mapped_column(
        nullable=False, default=False, server_default=text("false")
    )
    shared_contract_status: Mapped[str] = mapped_column(
        String(48),
        nullable=False,
        default=FixtureSharedContractStatus.NOT_A_FINAL_SHARED_CONTRACT.value,
        server_default=text("'NOT_A_FINAL_SHARED_CONTRACT'"),
    )
    payload_media_type: Mapped[str] = mapped_column(String(128), nullable=False)
    raw_payload: Mapped[bytes] = mapped_column(LargeBinary, nullable=False)
    raw_payload_sha256: Mapped[str] = mapped_column(String(64), nullable=False)
    structural_payload: Mapped[object | None] = mapped_column(PORTABLE_JSONB, nullable=True)
    structural_payload_sha256: Mapped[str | None] = mapped_column(String(64), nullable=True)
    validation_status: Mapped[str] = mapped_column(String(32), nullable=False)
    validation_findings: Mapped[object] = mapped_column(
        PORTABLE_JSONB, nullable=False, server_default=text("'[]'")
    )
    received_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    recorded_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default="CURRENT_TIMESTAMP"
    )
    supersedes_fixture_record_id: Mapped[uuid.UUID | None] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("fixture_records.fixture_record_id", ondelete="RESTRICT"),
        nullable=True,
    )

    __table_args__ = (
        CheckConstraint(
            "char_length(btrim(fixture_schema_name)) > 0",
            name="schema_name_nonempty",
        ).ddl_if(dialect="postgresql"),
        CheckConstraint(
            "char_length(btrim(fixture_schema_version)) > 0",
            name="schema_version_nonempty",
        ).ddl_if(dialect="postgresql"),
        CheckConstraint(
            "char_length(btrim(minimum_reader_version)) > 0",
            name="reader_version_nonempty",
        ).ddl_if(dialect="postgresql"),
        CheckConstraint(
            "char_length(btrim(producer_version)) > 0",
            name="producer_version_nonempty",
        ).ddl_if(dialect="postgresql"),
        CheckConstraint(
            f"fixture_classification = '{FixtureClassification.TEST_FIXTURE.value}'",
            name="classification",
        ),
        CheckConstraint(
            f"canonicality = '{FixtureCanonicality.NON_CANONICAL.value}'",
            name="canonicality",
        ),
        CheckConstraint("agent_generated IS FALSE", name="not_agent_generated"),
        CheckConstraint(
            "shared_contract_status = 'NOT_A_FINAL_SHARED_CONTRACT'",
            name="shared_contract_status",
        ),
        CheckConstraint(
            "payload_media_type = 'application/json'",
            name="media_type",
        ),
        CheckConstraint(
            "octet_length(raw_payload) <= 1048576", name="payload_size"
        ).ddl_if(dialect="postgresql"),
        CheckConstraint(
            "raw_payload_sha256 ~ '^[0-9a-f]{64}$'", name="raw_hash"
        ).ddl_if(dialect="postgresql"),
        CheckConstraint(
            "validation_status IN ('STRUCTURALLY_VALID', 'STRUCTURALLY_REJECTED')",
            name="validation_status",
        ),
        CheckConstraint(
            "(structural_payload IS NULL) = (structural_payload_sha256 IS NULL)",
            name="structural_pair",
        ),
        CheckConstraint(
            "structural_payload_sha256 IS NULL OR structural_payload_sha256 ~ '^[0-9a-f]{64}$'",
            name="structural_hash",
        ).ddl_if(dialect="postgresql"),
        CheckConstraint(
            "(validation_status = 'STRUCTURALLY_VALID') = (structural_payload IS NOT NULL)",
            name="valid_payload",
        ),
        CheckConstraint(
            "supersedes_fixture_record_id IS NULL OR "
            "fixture_record_id <> supersedes_fixture_record_id",
            name="no_self_supersession",
        ),
        CheckConstraint(
            "received_at <= recorded_at",
            name="timestamp_order",
        ),
        Index(
            "ix_fixture_records_schema_version",
            "fixture_schema_name",
            "fixture_schema_version",
        ),
        Index("ix_fixture_records_validation_status", "validation_status"),
        Index("ix_fixture_records_raw_payload_sha256", "raw_payload_sha256"),
        Index(
            "ix_fixture_records_supersedes_fixture_record_id",
            "supersedes_fixture_record_id",
        ),
        Index("ix_fixture_records_received_at", "received_at"),
    )

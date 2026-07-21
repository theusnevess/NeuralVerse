from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Index, Integer, LargeBinary, String, Text, Uuid, text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from neuralverse_backend.persistence.metadata import Base


class CanonicalInputRecord(Base):
    """Lossless released-contract artifact retained as the workflow source."""

    __tablename__ = "canonical_input_records"

    canonical_input_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    contract_name: Mapped[str] = mapped_column(String(128), nullable=False)
    contract_version: Mapped[str] = mapped_column(String(32), nullable=False)
    minimum_reader_version: Mapped[str] = mapped_column(String(32), nullable=False)
    producer_version: Mapped[str] = mapped_column(String(256), nullable=False)
    release_tag: Mapped[str] = mapped_column(String(128), nullable=False)
    release_commit: Mapped[str] = mapped_column(String(40), nullable=False)
    schema_hash: Mapped[str] = mapped_column(String(64), nullable=False)
    artifact_fingerprint: Mapped[str] = mapped_column(String(64), nullable=False)
    raw_json_bytes: Mapped[bytes] = mapped_column(LargeBinary, nullable=False)
    raw_json_sha256: Mapped[str] = mapped_column(String(64), nullable=False)
    parsed_canonical_json: Mapped[str] = mapped_column(Text, nullable=False)
    structural_semantic_payload: Mapped[object] = mapped_column(JSONB, nullable=False)
    unknown_compatible_fields: Mapped[object] = mapped_column(JSONB, nullable=False)
    authoring_job_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("authoring_jobs.authoring_job_id"), nullable=False
    )
    received_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    generation_job_id: Mapped[uuid.UUID | None] = mapped_column(Uuid(as_uuid=True), nullable=True)
    workflow_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    revision_cycle: Mapped[int] = mapped_column(Integer, nullable=False, server_default=text("0"))
    canonical_producer_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    operation: Mapped[str | None] = mapped_column(String(128), nullable=True)
    operation_version: Mapped[str | None] = mapped_column(String(32), nullable=True)
    assembled_input_fingerprint: Mapped[str | None] = mapped_column(String(64), nullable=True)
    dependency_artifact_ids: Mapped[object] = mapped_column(
        JSONB, nullable=False, server_default=text("'[]'")
    )
    dependency_fingerprints: Mapped[object] = mapped_column(
        JSONB, nullable=False, server_default=text("'[]'")
    )

    __table_args__ = (
        Index("ix_canonical_input_records_fingerprint", "artifact_fingerprint"),
        Index("ix_canonical_input_records_contract_version", "contract_name", "contract_version"),
        Index("ix_canonical_input_records_job", "authoring_job_id"),
    )

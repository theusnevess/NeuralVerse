from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import CheckConstraint, DateTime, Index, Integer, String, Uuid, text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from neuralverse_backend.persistence.metadata import Base


class AuthoringJobRecord(Base):
    """Durable, semantic-neutral state for one authoring workflow."""

    __tablename__ = "authoring_jobs"

    authoring_job_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    package_id: Mapped[str | None] = mapped_column(String(256), nullable=True)
    workflow_id: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    status: Mapped[str] = mapped_column(
        String(32), nullable=False, server_default=text("'CREATED'")
    )
    current_revision: Mapped[int] = mapped_column(Integer, nullable=False, server_default=text("0"))
    lock_version: Mapped[int] = mapped_column(Integer, nullable=False, server_default=text("0"))
    workflow_started: Mapped[bool] = mapped_column(nullable=False, server_default=text("false"))
    received_contracts: Mapped[object] = mapped_column(
        JSONB, nullable=False, server_default=text("'[]'")
    )
    canonical_input_ids: Mapped[object] = mapped_column(
        JSONB, nullable=False, server_default=text("'[]'")
    )
    artifact_fingerprints: Mapped[object] = mapped_column(
        JSONB, nullable=False, server_default=text("'[]'")
    )
    last_accepted_event: Mapped[str | None] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    __table_args__ = (
        CheckConstraint("char_length(btrim(workflow_id)) > 0", name="workflow_id_nonempty"),
        CheckConstraint(
            "status IN ("
            "'CREATED', 'WAITING_FOR_INPUTS', 'INPUTS_AVAILABLE', "
            "'READY_FOR_AUTHORING', 'FAILED', 'CANCELLED')",
            name="status",
        ),
        CheckConstraint("current_revision >= 0", name="current_revision_nonnegative"),
        CheckConstraint("lock_version >= 0", name="lock_version_nonnegative"),
        Index("ix_authoring_jobs_status", "status"),
        Index("ix_authoring_jobs_package_id", "package_id"),
    )

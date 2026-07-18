"""Transactional BIP-M4 projection repository."""

from __future__ import annotations

from collections.abc import Mapping
from datetime import datetime
from typing import Any, cast

from sqlalchemy import select

from neuralverse_backend.bip_m4.domain import (
    IdempotencyConflict,
    WorkflowCommand,
    WorkflowIdentity,
)
from neuralverse_backend.persistence.models import (
    BIPM4CommandRecord,
    BIPM4GenerationJobRecord,
    BIPM4ProgressProjectionRecord,
)


class BIPM4ProjectionRepository:
    """Stores derived operational state without duplicating Temporal history."""

    def resolve_command(
        self,
        session: Any,
        command: WorkflowCommand,
        identity: WorkflowIdentity,
        *,
        response_snapshot: Mapping[str, Any],
        operation_type: str = "AUTHORING_START",
        now: datetime,
    ) -> BIPM4CommandRecord:
        record = cast(
            BIPM4CommandRecord | None,
            session.scalar(
                select(BIPM4CommandRecord)
                .where(
                    BIPM4CommandRecord.operation_type == operation_type,
                    BIPM4CommandRecord.idempotency_key == command.idempotency_key,
                )
                .with_for_update()
            ),
        )
        if record is not None:
            if record.command_fingerprint != command.fingerprint:
                raise IdempotencyConflict("command idempotency key was reused with a new payload")
            return record
        record = BIPM4CommandRecord(
            operation_type=operation_type,
            command_id=command.command_id,
            idempotency_key=command.idempotency_key,
            command_fingerprint=command.fingerprint,
            workflow_execution_id=identity.workflow_execution_id,
            generation_job_id=identity.generation_job_id,
            response_snapshot=dict(response_snapshot),
            created_at=now,
        )
        session.add(record)
        session.flush()
        return record

    def ensure_generation_job(
        self,
        session: Any,
        command: WorkflowCommand,
        identity: WorkflowIdentity,
        *,
        now: datetime,
    ) -> BIPM4GenerationJobRecord:
        record = cast(
            BIPM4GenerationJobRecord | None,
            session.scalar(
                select(BIPM4GenerationJobRecord)
                .where(BIPM4GenerationJobRecord.generation_job_id == identity.generation_job_id)
                .with_for_update()
            ),
        )
        if record is not None:
            return record
        record = BIPM4GenerationJobRecord(
            generation_job_id=identity.generation_job_id,
            workflow_execution_id=identity.workflow_execution_id,
            package_id=command.package_id,
            command_id=command.command_id,
            requested_by=command.requested_by,
            requested_target=command.target_content_identity,
            status="CREATED",
            publication_status="NOT_REQUESTED",
            created_at=now,
            updated_at=now,
        )
        session.add(record)
        session.flush()
        return record

    def save_progress(
        self,
        session: Any,
        *,
        workflow_execution_id: str,
        generation_job_id: str,
        state: str,
        current_stage: str,
        revision: int,
        now: datetime,
    ) -> BIPM4ProgressProjectionRecord:
        record = cast(
            BIPM4ProgressProjectionRecord | None,
            session.get(BIPM4ProgressProjectionRecord, workflow_execution_id),
        )
        if record is None:
            record = BIPM4ProgressProjectionRecord(
                workflow_execution_id=workflow_execution_id,
                generation_job_id=generation_job_id,
                state=state,
                current_stage=current_stage,
                revision=revision,
                updated_at=now,
            )
            session.add(record)
        else:
            record.state = state
            record.current_stage = current_stage
            record.revision = revision
            record.projection_version += 1
            record.updated_at = now
        session.flush()
        return record

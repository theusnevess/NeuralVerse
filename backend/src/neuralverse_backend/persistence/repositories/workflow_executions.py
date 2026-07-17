from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.orm import Session

from neuralverse_backend.persistence.models import WorkflowExecutionRecord


class WorkflowExecutionRepository:
    """Caller-owned repository for durable workflow records."""

    def get_by_command(self, session: Session, command_id: str) -> WorkflowExecutionRecord | None:
        return session.scalar(
            select(WorkflowExecutionRecord).where(WorkflowExecutionRecord.command_id == command_id)
        )

    def get(self, session: Session, execution_id: object) -> WorkflowExecutionRecord | None:
        return session.get(WorkflowExecutionRecord, execution_id)

    def add(self, session: Session, record: WorkflowExecutionRecord) -> None:
        session.add(record)

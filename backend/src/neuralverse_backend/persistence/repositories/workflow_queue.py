from __future__ import annotations

from datetime import datetime

from sqlalchemy import select
from sqlalchemy.orm import Session

from neuralverse_backend.persistence.models import WorkflowQueueRecord


class WorkflowQueueRepository:
    def get(self, session: Session, command_id: str) -> WorkflowQueueRecord | None:
        return session.get(WorkflowQueueRecord, command_id)

    def next_queued(self, session: Session) -> WorkflowQueueRecord | None:
        return session.scalar(
            select(WorkflowQueueRecord)
            .where(WorkflowQueueRecord.status == "QUEUED")
            .order_by(WorkflowQueueRecord.occurred_at)
            .with_for_update(skip_locked=True)
            .limit(1)
        )

    def add(self, session: Session, record: WorkflowQueueRecord) -> None:
        session.add(record)

    def requeue(self, session: Session, command_id: str) -> WorkflowQueueRecord | None:
        record = self.get(session, command_id)
        if record is None or record.status != "CLAIMED":
            return None
        record.status = "QUEUED"
        record.claimed_at = None
        return record

    def acknowledge(self, session: Session, command_id: str) -> WorkflowQueueRecord | None:
        record = self.get(session, command_id)
        if record is None or record.status != "CLAIMED":
            return None
        record.status = "COMPLETED"
        record.claimed_at = None
        return record

    def recover_expired_claims(
        self, session: Session, *, cutoff: datetime
    ) -> list[WorkflowQueueRecord]:
        records = list(
            session.scalars(
                select(WorkflowQueueRecord).where(
                    WorkflowQueueRecord.status == "CLAIMED",
                    WorkflowQueueRecord.claimed_at.is_not(None),
                    WorkflowQueueRecord.claimed_at < cutoff,
                )
            )
        )
        for record in records:
            record.status = "QUEUED"
            record.claimed_at = None
        return records

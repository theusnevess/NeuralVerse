from __future__ import annotations

from datetime import datetime

from sqlalchemy import JSON, DateTime, Integer, String, text
from sqlalchemy.orm import Mapped, mapped_column

from neuralverse_backend.persistence.metadata import Base


class WorkflowQueueRecord(Base):
    __tablename__ = "cross_front_workflow_queue"

    command_id: Mapped[str] = mapped_column(String(255), primary_key=True)
    envelope: Mapped[object] = mapped_column(JSON, nullable=False)
    occurred_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    claimed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    status: Mapped[str] = mapped_column(String(16), nullable=False, server_default=text("'QUEUED'"))
    attempts: Mapped[int] = mapped_column(Integer, nullable=False, server_default=text("0"))

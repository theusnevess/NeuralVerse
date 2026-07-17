from __future__ import annotations

from datetime import datetime

from sqlalchemy import JSON, DateTime, Integer, String, text
from sqlalchemy.orm import Mapped, mapped_column

from neuralverse_backend.persistence.metadata import Base


class WorkflowExecutionRecord(Base):
    """Durable NV-XFI workflow checkpoint and idempotency record."""

    __tablename__ = "cross_front_workflow_executions"

    execution_id: Mapped[str] = mapped_column(String(255), primary_key=True)
    command_id: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    status: Mapped[str] = mapped_column(String(32), nullable=False)
    envelope: Mapped[object] = mapped_column(JSON, nullable=False)
    checkpoint: Mapped[object] = mapped_column(JSON, nullable=False)
    attempts: Mapped[int] = mapped_column(Integer, nullable=False, server_default=text("1"))
    result: Mapped[object] = mapped_column(JSON, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

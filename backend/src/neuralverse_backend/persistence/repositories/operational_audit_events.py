from __future__ import annotations

from sqlalchemy.orm import Session

from neuralverse_backend.persistence.models import OperationalAuditEvent


class OperationalAuditEventRepository:
    """Append-only operational audit access without transaction ownership."""

    def add(self, session: Session, event: OperationalAuditEvent) -> None:
        session.add(event)

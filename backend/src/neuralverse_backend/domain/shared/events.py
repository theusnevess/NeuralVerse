"""Domain event primitives."""

from __future__ import annotations

import uuid
from datetime import UTC, datetime
from typing import Any


class DomainEvent:
    """Base class for all domain events."""

    def __init__(self, *, occurred_at: datetime | None = None) -> None:
        self.event_id: str = str(uuid.uuid4())
        self.occurred_at: datetime = occurred_at or datetime.now(UTC)

    def __eq__(self, other: object) -> bool:
        if not isinstance(other, DomainEvent):
            return NotImplemented
        return self.event_id == other.event_id

    def __hash__(self) -> int:
        return hash(self.event_id)

    def to_dict(self) -> dict[str, Any]:
        return {
            "event_type": type(self).__name__,
            "event_id": self.event_id,
            "occurred_at": self.occurred_at.isoformat(),
        }

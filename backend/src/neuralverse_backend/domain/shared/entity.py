"""Entity and AggregateRoot base classes."""

from __future__ import annotations

from typing import Any

from .events import DomainEvent


class Entity:
    """Base class for all domain entities."""

    def __init__(self, *, id: Any) -> None:
        self._id = id

    @property
    def id(self) -> Any:
        return self._id

    def __eq__(self, other: object) -> bool:
        if not isinstance(other, Entity):
            return NotImplemented
        return type(self) is type(other) and self._id == other._id

    def __hash__(self) -> int:
        return hash((type(self).__name__, self._id))


class AggregateRoot(Entity):
    """Base class for aggregate roots with domain event collection."""

    def __init__(self, *, id: Any) -> None:
        super().__init__(id=id)
        self._domain_events: list[DomainEvent] = []

    def collect_events(self) -> list[DomainEvent]:
        """Collect and clear pending domain events."""
        events = list(self._domain_events)
        self._domain_events.clear()
        return events

    def _record_event(self, event: DomainEvent) -> None:
        self._domain_events.append(event)

"""Identity domain context."""

from __future__ import annotations

from enum import Enum
from typing import TYPE_CHECKING

from ..shared.entity import Entity
from ..shared.identifiers import AgentId, LearnerId, ServiceId, SystemId

if TYPE_CHECKING:
    pass


class IdentityType(Enum):
    """Types of identity boundaries."""

    SYSTEM = "system"
    LEARNER = "learner"
    AGENT = "agent"
    SERVICE = "service"


class Identity(Entity):
    """Represents a bounded identity in the system."""

    def __init__(
        self,
        *,
        identity_id: SystemId | LearnerId | AgentId | ServiceId,
        identity_type: IdentityType,
        display_name: str,
    ) -> None:
        super().__init__(id=identity_id)
        self.identity_type = identity_type
        self.display_name = display_name

"""Curriculum domain context."""

from __future__ import annotations

from enum import Enum
from typing import TYPE_CHECKING

from ..shared.entity import Entity
from ..shared.errors import InvariantViolation
from ..shared.identifiers import CurriculumEdgeId, CurriculumNodeId

if TYPE_CHECKING:
    pass


class CurriculumNodeType(Enum):
    """Types of curriculum nodes."""

    TOPIC = "topic"
    CONCEPT = "concept"
    SKILL = "skill"
    COMPETENCY = "competency"
    MODULE = "module"
    LESSON = "lesson"


class CurriculumEdgeType(Enum):
    """Types of curriculum edges."""

    DEPENDS_ON = "depends_on"
    REQUIRES = "requires"
    RECOMMENDS = "recommends"
    PRECEDES = "precedes"
    CONTAINS = "contains"
    ASSESSES = "assesses"


class CurriculumNode(Entity):
    """A node in the curriculum graph."""

    def __init__(
        self,
        *,
        node_id: CurriculumNodeId,
        node_type: CurriculumNodeType,
        display_title: str,
        description: str = "",
        competency_references: tuple[str, ...] = (),
    ) -> None:
        super().__init__(id=node_id)
        self.node_type = node_type
        self.display_title = display_title
        self.description = description
        self.competency_references = competency_references

    def update_title(self, new_title: str) -> None:
        """Update display title. Does not change identity."""
        self.display_title = new_title


class CurriculumEdge(Entity):
    """An edge in the curriculum graph."""

    def __init__(
        self,
        *,
        edge_id: CurriculumEdgeId,
        source_id: CurriculumNodeId,
        target_id: CurriculumNodeId,
        edge_type: CurriculumEdgeType,
        required_depth: int = 0,
        rationale: str = "",
        sequence_order: int | None = None,
    ) -> None:
        if source_id == target_id:
            raise InvariantViolation(
                "Curriculum edge source and target cannot be identical",
                invariant="no_self_loop",
            )
        if required_depth < 0:
            raise InvariantViolation(
                "Curriculum edge required_depth must be non-negative",
                invariant="valid_required_depth",
            )
        super().__init__(id=edge_id)
        self.source_id = source_id
        self.target_id = target_id
        self.edge_type = edge_type
        self.required_depth = required_depth
        self.rationale = rationale
        self.sequence_order = sequence_order

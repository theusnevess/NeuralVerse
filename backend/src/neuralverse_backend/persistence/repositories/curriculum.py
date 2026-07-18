"""SQLAlchemy-backed curriculum repository."""

from __future__ import annotations

from datetime import UTC, datetime
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from neuralverse_backend.domain.curriculum import (
    CurriculumEdge,
    CurriculumEdgeId,
    CurriculumEdgeType,
    CurriculumNode,
    CurriculumNodeId,
    CurriculumNodeType,
)
from neuralverse_backend.persistence.models.curriculum import (
    CurriculumEdgeRecord,
    CurriculumNodeRecord,
)


class SqlAlchemyCurriculumRepository:
    """Implements CurriculumRepository protocol using SQLAlchemy."""

    def __init__(self, session: Session) -> None:
        self._session = session

    async def get_node_by_id(self, node_id: CurriculumNodeId) -> CurriculumNode | None:
        record = self._session.get(CurriculumNodeRecord, UUID(str(node_id)))
        if record is None:
            return None
        return self._reconstruct_node(record)

    async def save_node(self, node: CurriculumNode) -> None:
        record = self._session.get(CurriculumNodeRecord, UUID(str(node.id)))
        if record is None:
            record = CurriculumNodeRecord(
                curriculum_node_id=UUID(str(node.id)),
                node_type=node.node_type.value,
                display_title=node.display_title,
                description=node.description,
                competency_references=list(node.competency_references),
                created_at=datetime.now(UTC),
                updated_at=datetime.now(UTC),
            )
            self._session.add(record)
        else:
            record.node_type = node.node_type.value
            record.display_title = node.display_title
            record.description = node.description
            record.competency_references = list(node.competency_references)
        self._session.flush()

    async def save_edge(self, edge: CurriculumEdge) -> None:
        record = self._session.get(CurriculumEdgeRecord, UUID(str(edge.id)))
        if record is None:
            record = CurriculumEdgeRecord(
                curriculum_edge_id=UUID(str(edge.id)),
                source_node_id=UUID(str(edge.source_id)),
                target_node_id=UUID(str(edge.target_id)),
                edge_type=edge.edge_type.value,
                required_depth=edge.required_depth,
                rationale=edge.rationale,
                sequence_order=edge.sequence_order,
                created_at=datetime.now(UTC),
            )
            self._session.add(record)
        else:
            record.edge_type = edge.edge_type.value
            record.required_depth = edge.required_depth
            record.rationale = edge.rationale
            record.sequence_order = edge.sequence_order
        self._session.flush()

    async def get_edge_by_id(self, edge_id: CurriculumEdgeId) -> CurriculumEdge | None:
        record = self._session.get(CurriculumEdgeRecord, UUID(str(edge_id)))
        if record is None:
            return None
        return self._reconstruct_edge(record)

    async def list_all_nodes(self) -> list[CurriculumNode]:
        statement = select(CurriculumNodeRecord)
        records = self._session.execute(statement).scalars().all()
        return [self._reconstruct_node(r) for r in records]

    async def list_all_edges(self) -> list[CurriculumEdge]:
        statement = select(CurriculumEdgeRecord)
        records = self._session.execute(statement).scalars().all()
        return [self._reconstruct_edge(r) for r in records]

    def _reconstruct_node(self, record: CurriculumNodeRecord) -> CurriculumNode:
        return CurriculumNode(
            node_id=CurriculumNodeId(_value=str(record.curriculum_node_id)),
            node_type=CurriculumNodeType(record.node_type),
            display_title=record.display_title,
            description=record.description,
            competency_references=tuple(record.competency_references or []),
        )

    def _reconstruct_edge(self, record: CurriculumEdgeRecord) -> CurriculumEdge:
        return CurriculumEdge(
            edge_id=CurriculumEdgeId(_value=str(record.curriculum_edge_id)),
            source_id=CurriculumNodeId(_value=str(record.source_node_id)),
            target_id=CurriculumNodeId(_value=str(record.target_node_id)),
            edge_type=CurriculumEdgeType(record.edge_type),
            required_depth=record.required_depth,
            rationale=record.rationale,
            sequence_order=record.sequence_order,
        )

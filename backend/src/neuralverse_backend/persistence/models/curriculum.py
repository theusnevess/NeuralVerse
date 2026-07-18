"""Canonical curriculum persistence models."""

from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import (
    CheckConstraint,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    Uuid,
    text,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from neuralverse_backend.persistence.metadata import Base


class CurriculumNodeRecord(Base):
    __tablename__ = "curriculum_nodes"

    curriculum_node_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    node_type: Mapped[str] = mapped_column(String(32), nullable=False)
    display_title: Mapped[str] = mapped_column(String(512), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False, server_default=text("''"))
    competency_references: Mapped[object] = mapped_column(
        JSONB, nullable=False, server_default=text("'[]'")
    )
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    __table_args__ = (
        CheckConstraint(
            "node_type IN ('topic', 'concept', 'skill', 'competency', 'module', 'lesson')",
            name="node_type",
        ),
        CheckConstraint(
            "char_length(btrim(display_title)) > 0",
            name="display_title_nonempty",
        ),
        Index("ix_curriculum_nodes_type", "node_type"),
    )


class CurriculumEdgeRecord(Base):
    __tablename__ = "curriculum_edges"

    curriculum_edge_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    source_node_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("curriculum_nodes.curriculum_node_id", ondelete="RESTRICT"),
        nullable=False,
    )
    target_node_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("curriculum_nodes.curriculum_node_id", ondelete="RESTRICT"),
        nullable=False,
    )
    edge_type: Mapped[str] = mapped_column(String(32), nullable=False)
    required_depth: Mapped[int] = mapped_column(Integer, nullable=False, server_default=text("0"))
    rationale: Mapped[str] = mapped_column(Text, nullable=False, server_default=text("''"))
    sequence_order: Mapped[int | None] = mapped_column(Integer, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    __table_args__ = (
        CheckConstraint(
            "edge_type IN ("
            "'depends_on', 'requires', 'recommends', 'precedes', 'contains', 'assesses')",
            name="edge_type",
        ),
        CheckConstraint(
            "source_node_id <> target_node_id",
            name="no_self_loop",
        ),
        CheckConstraint("required_depth >= 0", name="required_depth_nonnegative"),
        Index("ix_curriculum_edges_source", "source_node_id"),
        Index("ix_curriculum_edges_target", "target_node_id"),
    )

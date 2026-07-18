"""Canonical sources and citations persistence models."""

from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import (
    CheckConstraint,
    DateTime,
    ForeignKey,
    Index,
    String,
    Text,
    Uuid,
    text,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from neuralverse_backend.persistence.metadata import Base


class SourceRecord(Base):
    __tablename__ = "sources"

    source_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    source_type: Mapped[str] = mapped_column(String(32), nullable=False)
    title: Mapped[str] = mapped_column(String(1024), nullable=False)
    locator: Mapped[str] = mapped_column(Text, nullable=False, server_default=text("''"))
    authorship_metadata: Mapped[object] = mapped_column(JSONB, nullable=True)
    publication_metadata: Mapped[object] = mapped_column(JSONB, nullable=True)
    provenance: Mapped[str] = mapped_column(Text, nullable=False, server_default=text("''"))
    content_hash: Mapped[str | None] = mapped_column(String(128), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    __table_args__ = (
        CheckConstraint(
            "source_type IN ("
            "'book', 'article', 'video', 'website', 'dataset', 'paper', "
            "'documentation', 'other')",
            name="source_type",
        ),
        CheckConstraint(
            "char_length(btrim(title)) > 0",
            name="title_nonempty",
        ),
        Index("ix_sources_type", "source_type"),
    )


class CitationRecord(Base):
    __tablename__ = "citations"

    citation_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    source_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("sources.source_id", ondelete="RESTRICT"),
        nullable=False,
    )
    target_content_id: Mapped[str] = mapped_column(String(512), nullable=False)
    locator: Mapped[str] = mapped_column(Text, nullable=False, server_default=text("''"))
    excerpt_reference: Mapped[str] = mapped_column(Text, nullable=False, server_default=text("''"))
    purpose: Mapped[str] = mapped_column(String(32), nullable=False)
    provenance: Mapped[str] = mapped_column(Text, nullable=False, server_default=text("''"))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    __table_args__ = (
        CheckConstraint(
            "purpose IN ('evidence', 'background', 'comparison', 'illustration', 'citation')",
            name="purpose",
        ),
        Index("ix_citations_source", "source_id"),
        Index("ix_citations_target", "target_content_id"),
    )


class SourceClaimLinkRecord(Base):
    __tablename__ = "source_claim_links"

    link_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    source_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("sources.source_id", ondelete="RESTRICT"),
        nullable=False,
    )
    citation_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("citations.citation_id", ondelete="RESTRICT"),
        nullable=False,
    )
    claim_target: Mapped[str] = mapped_column(String(1024), nullable=False)
    evidence_role: Mapped[str] = mapped_column(Text, nullable=False, server_default=text("''"))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    __table_args__ = (
        Index("ix_source_claim_links_source", "source_id"),
        Index("ix_source_claim_links_citation", "citation_id"),
    )

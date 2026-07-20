"""Canonical learner state persistence models."""

from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import (
    CheckConstraint,
    DateTime,
    Float,
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


class LearnerProfileRecord(Base):
    __tablename__ = "learner_profiles"

    learner_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    display_name: Mapped[str] = mapped_column(
        String(512), nullable=False, server_default=text("''")
    )
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)


class LearnerProgressRecord(Base):
    __tablename__ = "learner_progress"

    learner_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("learner_profiles.learner_id", ondelete="RESTRICT"),
        primary_key=True,
        nullable=False,
    )
    version_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("content_versions.content_version_id", ondelete="RESTRICT"),
        primary_key=True,
        nullable=False,
    )
    progress_pct: Mapped[float] = mapped_column(Float, nullable=False, server_default=text("0.0"))
    revision: Mapped[int] = mapped_column(Integer, nullable=False, server_default=text("0"))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    __table_args__ = (
        CheckConstraint(
            "progress_pct >= 0.0 AND progress_pct <= 100.0",
            name="progress_pct_range",
        ),
        Index("ix_learner_progress_learner", "learner_id"),
        Index("ix_learner_progress_version", "version_id"),
    )


class LearnerNoteRecord(Base):
    __tablename__ = "learner_notes"

    note_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    learner_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("learner_profiles.learner_id", ondelete="RESTRICT"),
        nullable=False,
    )
    version_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("content_versions.content_version_id", ondelete="RESTRICT"),
        nullable=False,
    )
    text: Mapped[str] = mapped_column(Text, nullable=False, server_default=text("''"))
    revision: Mapped[int] = mapped_column(Integer, nullable=False, server_default="1")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    __table_args__ = (
        Index("ix_learner_notes_learner", "learner_id"),
        Index("ix_learner_notes_version", "version_id"),
    )


class LearnerBookmarkRecord(Base):
    __tablename__ = "learner_bookmarks"

    bookmark_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    learner_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("learner_profiles.learner_id", ondelete="RESTRICT"),
        nullable=False,
    )
    version_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("content_versions.content_version_id", ondelete="RESTRICT"),
        nullable=False,
    )
    label: Mapped[str] = mapped_column(Text, nullable=False, server_default=text("''"))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    __table_args__ = (
        Index("ix_learner_bookmarks_learner", "learner_id"),
        Index("ix_learner_bookmarks_version", "version_id"),
    )


class LearnerCollectionRecord(Base):
    __tablename__ = "learner_collections"

    collection_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    learner_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("learner_profiles.learner_id", ondelete="RESTRICT"),
        nullable=False,
    )
    name: Mapped[str] = mapped_column(String(512), nullable=False, server_default=text("''"))
    version_ids: Mapped[object] = mapped_column(JSONB, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    __table_args__ = (Index("ix_learner_collections_learner", "learner_id"),)


class LearnerHighlightRecord(Base):
    __tablename__ = "learner_highlights"

    highlight_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    learner_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("learner_profiles.learner_id", ondelete="RESTRICT"),
        nullable=False,
    )
    version_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("content_versions.content_version_id", ondelete="RESTRICT"),
        nullable=False,
    )
    selected_text: Mapped[str] = mapped_column(Text, nullable=False, server_default=text("''"))
    note: Mapped[str] = mapped_column(Text, nullable=False, server_default=text("''"))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    __table_args__ = (
        Index("ix_learner_highlights_learner", "learner_id"),
        Index("ix_learner_highlights_version", "version_id"),
    )


class LearnerSessionRecord(Base):
    __tablename__ = "learner_sessions"

    session_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    learner_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("learner_profiles.learner_id", ondelete="RESTRICT"),
        nullable=False,
    )
    version_id: Mapped[uuid.UUID | None] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("content_versions.content_version_id", ondelete="RESTRICT"),
        nullable=True,
    )
    revision: Mapped[int] = mapped_column(Integer, nullable=False, server_default=text("1"))
    status: Mapped[str] = mapped_column(String(32), nullable=False, server_default=text("'active'"))
    active_release_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    active_block_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    continuity_metadata: Mapped[object | None] = mapped_column(JSONB, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    __table_args__ = (Index("ix_learner_sessions_learner", "learner_id"),)


class LearnerCollectionVersionRecord(Base):
    __tablename__ = "learner_collection_versions"

    collection_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("learner_collections.collection_id", ondelete="RESTRICT"),
        primary_key=True,
    )
    content_version_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("content_versions.content_version_id", ondelete="RESTRICT"),
        primary_key=True,
    )
    position: Mapped[int] = mapped_column(nullable=False)

    __table_args__ = (
        CheckConstraint("position >= 0", name="position_nonnegative"),
        Index("ix_learner_collection_versions_version", "content_version_id"),
    )

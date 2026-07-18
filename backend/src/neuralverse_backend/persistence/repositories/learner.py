"""SQLAlchemy-backed learner repository."""

from __future__ import annotations

from datetime import UTC, datetime
from uuid import UUID

from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from neuralverse_backend.domain.learner import (
    LearnerBookmark,
    LearnerBookmarkId,
    LearnerCollection,
    LearnerHighlight,
    LearnerNote,
    LearnerNoteId,
    LearnerProfile,
    LearnerSession,
    LearnerSessionId,
)
from neuralverse_backend.domain.shared.identifiers import (
    ContentVersionId,
    LearnerCollectionId,
    LearnerId,
)
from neuralverse_backend.persistence.models.learner import (
    LearnerBookmarkRecord,
    LearnerCollectionRecord,
    LearnerCollectionVersionRecord,
    LearnerHighlightRecord,
    LearnerNoteRecord,
    LearnerProfileRecord,
    LearnerSessionRecord,
)


class SqlAlchemyLearnerRepository:
    """Implements LearnerRepository protocol using SQLAlchemy."""

    def __init__(self, session: Session) -> None:
        self._session = session

    async def get_profile_by_id(self, learner_id: LearnerId) -> LearnerProfile | None:
        record = self._session.get(LearnerProfileRecord, UUID(str(learner_id)))
        if record is None:
            return None
        return LearnerProfile(
            learner_id=LearnerId(_value=str(record.learner_id)),
            display_name=record.display_name,
        )

    async def save_profile(self, profile: LearnerProfile) -> None:
        record = self._session.get(LearnerProfileRecord, UUID(str(profile.id)))
        if record is None:
            record = LearnerProfileRecord(
                learner_id=UUID(str(profile.id)),
                display_name=profile.display_name,
                created_at=datetime.now(UTC),
                updated_at=datetime.now(UTC),
            )
            self._session.add(record)
        else:
            record.display_name = profile.display_name
        self._session.flush()

    async def save_session(self, session: LearnerSession) -> None:
        record = self._session.get(LearnerSessionRecord, UUID(str(session.id)))
        if record is None:
            record = LearnerSessionRecord(
                session_id=UUID(str(session.id)),
                learner_id=UUID(str(session.learner_id)),
                version_id=UUID(str(session.version_id)) if session.version_id else None,
                created_at=datetime.now(UTC),
            )
            self._session.add(record)
        self._session.flush()

    async def save_note(self, note: LearnerNote) -> None:
        record = self._session.get(LearnerNoteRecord, UUID(str(note.id)))
        if record is None:
            record = LearnerNoteRecord(
                note_id=UUID(str(note.id)),
                learner_id=UUID(str(note.learner_id)),
                version_id=UUID(str(note.version_id)),
                text=note.text,
                created_at=datetime.now(UTC),
            )
            self._session.add(record)
        else:
            record.text = note.text
        self._session.flush()

    async def save_bookmark(self, bookmark: LearnerBookmark) -> None:
        record = self._session.get(LearnerBookmarkRecord, UUID(str(bookmark.id)))
        if record is None:
            record = LearnerBookmarkRecord(
                bookmark_id=UUID(str(bookmark.id)),
                learner_id=UUID(str(bookmark.learner_id)),
                version_id=UUID(str(bookmark.version_id)),
                label=bookmark.label,
                created_at=datetime.now(UTC),
            )
            self._session.add(record)
        else:
            record.label = bookmark.label
        self._session.flush()

    async def save_collection(self, collection: LearnerCollection) -> None:
        record = self._session.get(LearnerCollectionRecord, UUID(str(collection.id)))
        if record is None:
            record = LearnerCollectionRecord(
                collection_id=UUID(str(collection.id)),
                learner_id=UUID(str(collection.learner_id)),
                name=collection.name,
                version_ids=[str(v) for v in collection.version_ids],
                created_at=datetime.now(UTC),
                updated_at=datetime.now(UTC),
            )
            self._session.add(record)
        else:
            record.name = collection.name
            record.version_ids = [str(v) for v in collection.version_ids]
        collection_id = UUID(str(collection.id))
        self._session.execute(
            delete(LearnerCollectionVersionRecord).where(
                LearnerCollectionVersionRecord.collection_id == collection_id
            )
        )
        self._session.add_all(
            [
                LearnerCollectionVersionRecord(
                    collection_id=collection_id,
                    content_version_id=UUID(str(version_id)),
                    position=position,
                )
                for position, version_id in enumerate(collection.version_ids)
            ]
        )
        self._session.flush()

    async def save_highlight(self, highlight: LearnerHighlight) -> None:
        record = self._session.get(LearnerHighlightRecord, UUID(str(highlight.id)))
        if record is None:
            record = LearnerHighlightRecord(
                highlight_id=UUID(str(highlight.id)),
                learner_id=UUID(str(highlight.learner_id)),
                version_id=UUID(str(highlight.version_id)),
                selected_text=highlight.selected_text,
                note=highlight.note,
                created_at=datetime.now(UTC),
            )
            self._session.add(record)
        else:
            record.selected_text = highlight.selected_text
            record.note = highlight.note
        self._session.flush()

    async def get_collection_by_id(
        self, collection_id: LearnerCollectionId
    ) -> LearnerCollection | None:
        record = self._session.get(LearnerCollectionRecord, UUID(str(collection_id)))
        if record is None:
            return None
        versions = (
            self._session.execute(
                select(LearnerCollectionVersionRecord.content_version_id)
                .where(LearnerCollectionVersionRecord.collection_id == record.collection_id)
                .order_by(LearnerCollectionVersionRecord.position)
            )
            .scalars()
            .all()
        )
        return LearnerCollection(
            collection_id=LearnerCollectionId(_value=str(record.collection_id)),
            learner_id=LearnerId(_value=str(record.learner_id)),
            name=record.name,
            version_ids=tuple(ContentVersionId(_value=str(value)) for value in versions),
        )

    async def get_note_by_id(self, note_id: LearnerNoteId) -> LearnerNote | None:
        record = self._session.get(LearnerNoteRecord, UUID(str(note_id)))
        if record is None:
            return None
        return LearnerNote(
            note_id=LearnerNoteId(_value=str(record.note_id)),
            learner_id=LearnerId(_value=str(record.learner_id)),
            version_id=ContentVersionId(_value=str(record.version_id)),
            text=record.text,
        )

    async def get_bookmark_by_id(self, bookmark_id: LearnerBookmarkId) -> LearnerBookmark | None:
        record = self._session.get(LearnerBookmarkRecord, UUID(str(bookmark_id)))
        if record is None:
            return None
        return LearnerBookmark(
            bookmark_id=LearnerBookmarkId(_value=str(record.bookmark_id)),
            learner_id=LearnerId(_value=str(record.learner_id)),
            version_id=ContentVersionId(_value=str(record.version_id)),
            label=record.label,
        )

    async def get_session_by_id(self, session_id: LearnerSessionId) -> LearnerSession | None:
        record = self._session.get(LearnerSessionRecord, UUID(str(session_id)))
        if record is None:
            return None
        return LearnerSession(
            session_id=LearnerSessionId(_value=str(record.session_id)),
            learner_id=LearnerId(_value=str(record.learner_id)),
            version_id=ContentVersionId(_value=str(record.version_id))
            if record.version_id
            else None,
        )

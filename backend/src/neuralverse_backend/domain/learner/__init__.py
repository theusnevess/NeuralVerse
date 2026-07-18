"""Learner domain context."""

from __future__ import annotations

from typing import TYPE_CHECKING

from ..shared.entity import Entity
from ..shared.identifiers import (
    ContentVersionId,
    LearnerBookmarkId,
    LearnerCollectionId,
    LearnerHighlightId,
    LearnerId,
    LearnerNoteId,
    LearnerSessionId,
)

if TYPE_CHECKING:
    pass


class LearnerProfile(Entity):
    """Learner profile with stable identity."""

    def __init__(self, *, learner_id: LearnerId, display_name: str = "") -> None:
        super().__init__(id=learner_id)
        self.display_name = display_name


class LearnerProgress(Entity):
    """Tracks learner progress on content versions."""

    def __init__(
        self, *, learner_id: LearnerId, version_id: ContentVersionId, progress_pct: float = 0.0
    ) -> None:
        super().__init__(id=(learner_id, version_id))
        self.learner_id = learner_id
        self.version_id = version_id
        self.progress_pct = progress_pct


class LearnerNote(Entity):
    """A learner note on content."""

    def __init__(
        self,
        *,
        note_id: LearnerNoteId,
        learner_id: LearnerId,
        version_id: ContentVersionId,
        text: str = "",
    ) -> None:
        super().__init__(id=note_id)
        self.learner_id = learner_id
        self.version_id = version_id
        self.text = text


class LearnerBookmark(Entity):
    """A learner bookmark on content."""

    def __init__(
        self,
        *,
        bookmark_id: LearnerBookmarkId,
        learner_id: LearnerId,
        version_id: ContentVersionId,
        label: str = "",
    ) -> None:
        super().__init__(id=bookmark_id)
        self.learner_id = learner_id
        self.version_id = version_id
        self.label = label


class LearnerCollection(Entity):
    """A learner's collection of content."""

    def __init__(
        self,
        *,
        collection_id: LearnerCollectionId,
        learner_id: LearnerId,
        name: str = "",
        version_ids: tuple[ContentVersionId, ...] = (),
    ) -> None:
        super().__init__(id=collection_id)
        self.learner_id = learner_id
        self.name = name
        self.version_ids = version_ids


class LearnerHighlight(Entity):
    """A learner highlight on content."""

    def __init__(
        self,
        *,
        highlight_id: LearnerHighlightId,
        learner_id: LearnerId,
        version_id: ContentVersionId,
        selected_text: str = "",
        note: str = "",
    ) -> None:
        super().__init__(id=highlight_id)
        self.learner_id = learner_id
        self.version_id = version_id
        self.selected_text = selected_text
        self.note = note


class LearnerSession(Entity):
    """A learner session."""

    def __init__(
        self,
        *,
        session_id: LearnerSessionId,
        learner_id: LearnerId,
        version_id: ContentVersionId | None = None,
    ) -> None:
        super().__init__(id=session_id)
        self.learner_id = learner_id
        self.version_id = version_id

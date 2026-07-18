"""Search domain context."""

from __future__ import annotations

from typing import TYPE_CHECKING, Protocol

from ..shared.entity import Entity
from .m5 import (
    AccessScope,
    Embedding,
    RetrievalMode,
    SearchCandidate,
    SearchRequest,
    SearchResource,
    cosine_similarity,
    lexical_score,
)
from .services import (
    DenyByDefaultAccessPolicy,
    EmbeddingGenerator,
    HybridCandidate,
    ReindexCommand,
    SearchAccessPolicy,
    SearchFragment,
    fragment_resource,
    reciprocal_rank_fusion,
)

if TYPE_CHECKING:
    pass


class SearchDocumentReference(Entity):
    """Reference to a domain entity in a search index."""

    def __init__(
        self, *, document_id: str, entity_type: str, entity_id: str, version_id: str = ""
    ) -> None:
        super().__init__(id=document_id)
        self.entity_type = entity_type
        self.entity_id = entity_id
        self.version_id = version_id


class SearchIndexRecord(Entity):
    """A record in the search index."""

    def __init__(
        self,
        *,
        record_id: str,
        document_reference: SearchDocumentReference,
        content: str = "",
        metadata: dict | None = None,
    ) -> None:
        super().__init__(id=record_id)
        self.document_reference = document_reference
        self.content = content
        self.metadata = metadata or {}


class SearchQuery(Entity):
    """A search query."""

    def __init__(
        self, *, query_text: str, entity_types: tuple[str, ...] = (), limit: int = 10
    ) -> None:
        super().__init__(id=query_text)
        self.query_text = query_text
        self.entity_types = entity_types
        self.limit = limit


class SearchResultReference(Entity):
    """A search result referencing a domain entity."""

    def __init__(
        self, *, document_id: str, score: float = 0.0, highlights: tuple[str, ...] = ()
    ) -> None:
        super().__init__(id=document_id)
        self.score = score
        self.highlights = highlights


class SearchRepository(Protocol):
    """Port for search persistence. Infrastructure implements this."""

    async def index(self, record: SearchIndexRecord) -> None: ...
    async def search(self, query: SearchQuery) -> list[SearchResultReference]: ...
    async def remove(self, document_id: str) -> None: ...


__all__ = [
    "AccessScope",
    "DenyByDefaultAccessPolicy",
    "Embedding",
    "RetrievalMode",
    "SearchCandidate",
    "SearchRequest",
    "SearchResource",
    "SearchFragment",
    "SearchAccessPolicy",
    "EmbeddingGenerator",
    "HybridCandidate",
    "ReindexCommand",
    "cosine_similarity",
    "lexical_score",
    "fragment_resource",
    "reciprocal_rank_fusion",
]

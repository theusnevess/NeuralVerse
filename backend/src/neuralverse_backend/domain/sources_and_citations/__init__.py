"""Sources and Citations domain context."""

from __future__ import annotations

from enum import Enum
from typing import TYPE_CHECKING

from ..shared.entity import Entity
from ..shared.identifiers import CitationId, SourceClaimLinkId, SourceId

if TYPE_CHECKING:
    pass


class SourceType(Enum):
    BOOK = "book"
    ARTICLE = "article"
    VIDEO = "video"
    WEBSITE = "website"
    DATASET = "dataset"
    PAPER = "paper"
    DOCUMENTATION = "documentation"
    OTHER = "other"


class CitationPurpose(Enum):
    EVIDENCE = "evidence"
    BACKGROUND = "background"
    COMPARISON = "comparison"
    ILLUSTRATION = "illustration"
    CITATION = "citation"


class Source(Entity):
    """A source of information."""

    def __init__(
        self,
        *,
        source_id: SourceId,
        source_type: SourceType,
        title: str,
        locator: str = "",
        authorship_metadata: dict[str, str] | None = None,
        publication_metadata: dict[str, str] | None = None,
        provenance: str = "",
        content_hash: str | None = None,
    ) -> None:
        super().__init__(id=source_id)
        self.source_type = source_type
        self.title = title
        self.locator = locator
        self.authorship_metadata = authorship_metadata or {}
        self.publication_metadata = publication_metadata or {}
        self.provenance = provenance
        self.content_hash = content_hash


class Citation(Entity):
    """A citation referencing a source."""

    def __init__(
        self,
        *,
        citation_id: CitationId,
        source_id: SourceId,
        target_content_id: str,
        locator: str = "",
        excerpt_reference: str = "",
        purpose: CitationPurpose,
        provenance: str = "",
    ) -> None:
        super().__init__(id=citation_id)
        self.source_id = source_id
        self.target_content_id = target_content_id
        self.locator = locator
        self.excerpt_reference = excerpt_reference
        self.purpose = purpose
        self.provenance = provenance


class SourceClaimLink(Entity):
    """Explicit relationship among source, claim, and citation."""

    def __init__(
        self,
        *,
        link_id: SourceClaimLinkId,
        source_id: SourceId,
        citation_id: CitationId,
        claim_target: str,
        evidence_role: str = "",
    ) -> None:
        super().__init__(id=link_id)
        self.source_id = source_id
        self.citation_id = citation_id
        self.claim_target = claim_target
        self.evidence_role = evidence_role

"""SQLAlchemy-backed source and citation repository."""

from __future__ import annotations

from collections.abc import Mapping
from datetime import UTC, datetime
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from neuralverse_backend.domain.sources_and_citations import (
    Citation,
    CitationId,
    CitationPurpose,
    Source,
    SourceClaimLink,
    SourceClaimLinkId,
    SourceId,
    SourceType,
)
from neuralverse_backend.persistence.models.sources_citations import (
    CitationRecord,
    SourceClaimLinkRecord,
    SourceRecord,
)


class SqlAlchemySourceRepository:
    """Repository for Source entities."""

    def __init__(self, session: Session) -> None:
        self._session = session

    async def get_by_id(self, source_id: SourceId) -> Source | None:
        record = self._session.get(SourceRecord, UUID(str(source_id)))
        if record is None:
            return None
        return self._reconstruct_source(record)

    async def save(self, source: Source) -> None:
        record = self._session.get(SourceRecord, UUID(str(source.id)))
        if record is None:
            record = SourceRecord(
                source_id=UUID(str(source.id)),
                source_type=source.source_type.value,
                title=source.title,
                locator=source.locator,
                authorship_metadata=source.authorship_metadata,
                publication_metadata=source.publication_metadata,
                provenance=source.provenance,
                content_hash=source.content_hash,
                created_at=datetime.now(UTC),
            )
            self._session.add(record)
        else:
            record.source_type = source.source_type.value
            record.title = source.title
            record.locator = source.locator
            record.authorship_metadata = source.authorship_metadata
            record.publication_metadata = source.publication_metadata
            record.provenance = source.provenance
            record.content_hash = source.content_hash
        self._session.flush()

    async def list_all(self) -> list[Source]:
        records = self._session.execute(select(SourceRecord)).scalars().all()
        return [self._reconstruct_source(r) for r in records]

    def _reconstruct_source(self, record: SourceRecord) -> Source:
        return Source(
            source_id=SourceId(_value=str(record.source_id)),
            source_type=SourceType(record.source_type),
            title=record.title,
            locator=record.locator,
            authorship_metadata=dict(record.authorship_metadata)
            if isinstance(record.authorship_metadata, Mapping)
            else {},
            publication_metadata=dict(record.publication_metadata)
            if isinstance(record.publication_metadata, Mapping)
            else {},
            provenance=record.provenance,
            content_hash=record.content_hash,
        )


class SqlAlchemyCitationRepository:
    """Repository for Citation entities."""

    def __init__(self, session: Session) -> None:
        self._session = session

    async def get_by_id(self, citation_id: CitationId) -> Citation | None:
        record = self._session.get(CitationRecord, UUID(str(citation_id)))
        if record is None:
            return None
        return self._reconstruct_citation(record)

    async def save(self, citation: Citation) -> None:
        record = self._session.get(CitationRecord, UUID(str(citation.id)))
        if record is None:
            record = CitationRecord(
                citation_id=UUID(str(citation.id)),
                source_id=UUID(str(citation.source_id)),
                target_content_id=citation.target_content_id,
                locator=citation.locator,
                excerpt_reference=citation.excerpt_reference,
                purpose=citation.purpose.value,
                provenance=citation.provenance,
                created_at=datetime.now(UTC),
            )
            self._session.add(record)
        else:
            record.purpose = citation.purpose.value
            record.locator = citation.locator
            record.provenance = citation.provenance
        self._session.flush()

    async def list_all(self) -> list[Citation]:
        records = self._session.execute(select(CitationRecord)).scalars().all()
        return [self._reconstruct_citation(r) for r in records]

    def _reconstruct_citation(self, record: CitationRecord) -> Citation:
        return Citation(
            citation_id=CitationId(_value=str(record.citation_id)),
            source_id=SourceId(_value=str(record.source_id)),
            target_content_id=record.target_content_id,
            locator=record.locator,
            excerpt_reference=record.excerpt_reference,
            purpose=CitationPurpose(record.purpose),
            provenance=record.provenance,
        )


class SqlAlchemySourceClaimLinkRepository:
    """Repository for SourceClaimLink entities."""

    def __init__(self, session: Session) -> None:
        self._session = session

    async def get_by_id(self, link_id: SourceClaimLinkId) -> SourceClaimLink | None:
        record = self._session.get(SourceClaimLinkRecord, UUID(str(link_id)))
        if record is None:
            return None
        return self._reconstruct_link(record)

    async def save(self, link: SourceClaimLink) -> None:
        record = self._session.get(SourceClaimLinkRecord, UUID(str(link.id)))
        if record is None:
            record = SourceClaimLinkRecord(
                link_id=UUID(str(link.id)),
                source_id=UUID(str(link.source_id)),
                citation_id=UUID(str(link.citation_id)),
                claim_target=link.claim_target,
                evidence_role=link.evidence_role,
                created_at=datetime.now(UTC),
            )
            self._session.add(record)
        else:
            record.claim_target = link.claim_target
            record.evidence_role = link.evidence_role
        self._session.flush()

    async def list_all(self) -> list[SourceClaimLink]:
        records = self._session.execute(select(SourceClaimLinkRecord)).scalars().all()
        return [self._reconstruct_link(r) for r in records]

    def _reconstruct_link(self, record: SourceClaimLinkRecord) -> SourceClaimLink:
        return SourceClaimLink(
            link_id=SourceClaimLinkId(_value=str(record.link_id)),
            source_id=SourceId(_value=str(record.source_id)),
            citation_id=CitationId(_value=str(record.citation_id)),
            claim_target=record.claim_target,
            evidence_role=record.evidence_role,
        )

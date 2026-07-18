"""Tests for sources and citations context."""

from __future__ import annotations

import pytest

from neuralverse_backend.domain.sources_and_citations import (
    Citation,
    CitationPurpose,
    Source,
    SourceClaimLink,
    SourceType,
)
from neuralverse_backend.domain.shared.identifiers import CitationId, SourceClaimLinkId, SourceId


class TestSource:
    def test_creation(self):
        sid = SourceId.generate()
        src = Source(
            source_id=sid,
            source_type=SourceType.BOOK,
            title="Linear Algebra",
        )
        assert src.id == sid
        assert src.title == "Linear Algebra"

    def test_title_independent_of_id(self):
        sid = SourceId.generate()
        src1 = Source(source_id=sid, source_type=SourceType.BOOK, title="Title A")
        src2 = Source(source_id=sid, source_type=SourceType.BOOK, title="Title B")
        assert src1.id == src2.id
        assert src1.title != src2.title


class TestCitation:
    def test_creation(self):
        cid = CitationId.generate()
        sid = SourceId.generate()
        citation = Citation(
            citation_id=cid,
            source_id=sid,
            target_content_id="content-v1",
            purpose=CitationPurpose.EVIDENCE,
        )
        assert citation.id == cid
        assert citation.source_id == sid


class TestSourceClaimLink:
    def test_creation(self):
        lid = SourceClaimLinkId.generate()
        sid = SourceId.generate()
        cid = CitationId.generate()
        link = SourceClaimLink(
            link_id=lid,
            source_id=sid,
            citation_id=cid,
            claim_target="claim-1",
        )
        assert link.source_id == sid
        assert link.citation_id == cid

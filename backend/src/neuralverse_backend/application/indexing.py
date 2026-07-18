"""Governed indexing lifecycle and bounded SQL query builders."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import UTC, datetime

from sqlalchemy import bindparam, text

from neuralverse_backend.domain.search.m5 import SearchRequest


@dataclass(frozen=True, slots=True)
class IndexFreshness:
    index_name: str
    source_watermark: str
    index_watermark: str | None

    @property
    def is_stale(self) -> bool:
        return self.index_watermark != self.source_watermark


@dataclass(frozen=True, slots=True)
class IndexRun:
    index_name: str
    source_watermark: str
    started_at: datetime
    indexed_count: int = 0
    completed_at: datetime | None = None
    error_summary: str | None = None

    def complete(self, indexed_count: int) -> IndexRun:
        return IndexRun(
            self.index_name,
            self.source_watermark,
            self.started_at,
            indexed_count,
            datetime.now(UTC),
        )


def build_lexical_query(request: SearchRequest):
    """Build a parameterized PostgreSQL FTS query; query text is always data."""
    scope_values = tuple(scope.value for scope in request.scopes)
    return text(
        """SELECT search_resource_id, resource_id, resource_version,
        ts_rank_cd(lexical_document, websearch_to_tsquery(:language, :query)) AS lexical_score
        FROM search_resources
        WHERE access_scope IN :scopes
          AND lexical_document @@ websearch_to_tsquery(:language, :query)
        ORDER BY lexical_score DESC, resource_id ASC, resource_version ASC
        LIMIT :limit"""
    ).bindparams(
        bindparam("query", request.query),
        bindparam("language", request.language or "simple"),
        bindparam("scopes", expanding=True, value=scope_values),
        bindparam("limit", request.limit),
    )


class IndexingService:
    """Application boundary; concrete repositories own transactions and locking."""

    def mark_stale(
        self, *, index_name: str, source_watermark: str, index_watermark: str | None
    ) -> IndexFreshness:
        return IndexFreshness(index_name, source_watermark, index_watermark)

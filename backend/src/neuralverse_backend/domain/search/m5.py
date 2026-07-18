"""BIP-M5 governed lexical, vector and hybrid retrieval contracts."""

from __future__ import annotations

import math
import re
from dataclasses import dataclass
from enum import StrEnum
from typing import Protocol


class RetrievalMode(StrEnum):
    LEXICAL = "lexical"
    VECTOR = "vector"
    HYBRID = "hybrid"


class AccessScope(StrEnum):
    PUBLISHED = "published"
    APPROVED = "approved"
    HISTORICAL = "historical"


@dataclass(frozen=True, slots=True)
class SearchResource:
    resource_id: str
    resource_type: str
    resource_version: str
    source_hash: str
    title: str = ""
    content: str = ""
    alt_text: str = ""
    language: str = "und"
    lifecycle: str = "published"
    access_scope: AccessScope = AccessScope.PUBLISHED
    package_id: str | None = None
    content_version_id: str | None = None
    release_id: str | None = None
    block_id: str | None = None
    source_id: str | None = None
    citation_id: str | None = None
    fragment_id: str = "root"
    fragment_position: int = 0
    search_schema_version: str = "search-resource:1.0.0"


@dataclass(frozen=True, slots=True)
class SearchRequest:
    query: str
    mode: RetrievalMode = RetrievalMode.HYBRID
    limit: int = 20
    candidate_limit: int = 100
    scopes: tuple[AccessScope, ...] = (AccessScope.PUBLISHED,)
    language: str | None = None

    def __post_init__(self) -> None:
        if not self.query.strip() or len(self.query) > 2000:
            raise ValueError("query must contain 1..2000 characters")
        if not 1 <= self.limit <= 100 or not 1 <= self.candidate_limit <= 1000:
            raise ValueError("search limits are outside the governed bounds")


@dataclass(frozen=True, slots=True)
class SearchCandidate:
    resource: SearchResource
    lexical_score: float = 0.0
    vector_score: float | None = None
    hybrid_score: float | None = None
    rank: int = 0
    highlights: tuple[str, ...] = ()


@dataclass(frozen=True, slots=True)
class Embedding:
    values: tuple[float, ...]
    model_id: str
    model_version: str
    source_hash: str

    def __post_init__(self) -> None:
        if not self.values or any(not math.isfinite(v) for v in self.values):
            raise ValueError("embedding values must be finite and non-empty")
        if not self.model_id.strip() or not self.model_version.strip():
            raise ValueError("embedding model identity is required")


def tokenize(value: str) -> tuple[str, ...]:
    return tuple(re.findall(r"[\wÀ-ÿ]+", value.casefold(), flags=re.UNICODE))


def lexical_score(query: str, resource: SearchResource) -> float:
    terms = tokenize(query)
    if not terms:
        return 0.0
    title = tokenize(resource.title)
    content = tokenize(resource.content)
    alt = tokenize(resource.alt_text)
    return sum(
        (3.0 if t in title else 0.0) + (1.0 if t in content else 0.0) + (2.0 if t in alt else 0.0)
        for t in terms
    )


def cosine_similarity(left: tuple[float, ...], right: tuple[float, ...]) -> float:
    if len(left) != len(right):
        raise ValueError("embedding dimensions must match")
    dot = sum(a * b for a, b in zip(left, right, strict=True))
    left_norm = math.sqrt(sum(a * a for a in left))
    right_norm = math.sqrt(sum(b * b for b in right))
    if left_norm == 0 or right_norm == 0:
        return 0.0
    return dot / (left_norm * right_norm)


class EmbeddingPort(Protocol):
    async def embed(self, text: str) -> Embedding: ...


class SearchRepository(Protocol):
    async def search(self, request: SearchRequest) -> list[SearchCandidate]: ...

    async def index(self, resource: SearchResource, embedding: Embedding | None = None) -> None: ...

    async def remove(self, resource_id: str, resource_version: str) -> None: ...

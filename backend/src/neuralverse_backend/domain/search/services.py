"""Search fragmentation, access policy, embeddings and deterministic RRF."""

from __future__ import annotations

import hashlib
from dataclasses import dataclass
from typing import Protocol

from .m5 import Embedding, SearchCandidate, SearchResource


@dataclass(frozen=True, slots=True)
class SearchFragment:
    fragment_id: str
    resource_id: str
    resource_version: str
    strategy_id: str
    strategy_version: str
    position: int
    text: str
    source_hash: str


def fragment_resource(
    resource: SearchResource,
    *,
    strategy_id: str = "fixed-window",
    strategy_version: str = "1.0",
    max_chars: int = 1200,
    overlap: int = 120,
) -> tuple[SearchFragment, ...]:
    if max_chars <= 0 or overlap < 0 or overlap >= max_chars:
        raise ValueError("invalid fragmentation bounds")
    text = resource.content
    if not text:
        return (
            SearchFragment(
                _fragment_id(resource, strategy_id, strategy_version, 0, ""),
                resource.resource_id,
                resource.resource_version,
                strategy_id,
                strategy_version,
                0,
                "",
                resource.source_hash,
            ),
        )
    result: list[SearchFragment] = []
    start = 0
    position = 0
    while start < len(text):
        chunk = text[start : start + max_chars]
        result.append(
            SearchFragment(
                _fragment_id(resource, strategy_id, strategy_version, position, chunk),
                resource.resource_id,
                resource.resource_version,
                strategy_id,
                strategy_version,
                position,
                chunk,
                resource.source_hash,
            )
        )
        position += 1
        if start + max_chars >= len(text):
            break
        start += max_chars - overlap
    return tuple(result)


def _fragment_id(
    resource: SearchResource, strategy_id: str, strategy_version: str, position: int, text: str
) -> str:
    material = "|".join(
        (
            resource.resource_id,
            resource.resource_version,
            resource.source_hash,
            strategy_id,
            strategy_version,
            str(position),
            text,
        )
    )
    return hashlib.sha256(material.encode()).hexdigest()


class SearchAccessPolicy(Protocol):
    def allowed(self, *, actor: str, scope: str, resource: SearchResource) -> bool: ...


class DenyByDefaultAccessPolicy:
    def allowed(self, *, actor: str, scope: str, resource: SearchResource) -> bool:
        return scope == resource.access_scope.value and resource.lifecycle in {
            "approved",
            "published",
        }


class EmbeddingGenerator(Protocol):
    async def embed(
        self,
        fragment: SearchFragment,
        *,
        model_id: str,
        model_version: str,
        expected_dimension: int,
        correlation_id: str,
    ) -> Embedding: ...


@dataclass(frozen=True, slots=True)
class HybridCandidate:
    candidate: SearchCandidate
    lexical_rank: int | None
    vector_rank: int | None
    hybrid_score: float
    strategy_id: str = "rrf"
    strategy_version: str = "1.0"


def reciprocal_rank_fusion(
    lexical: list[SearchCandidate], vector: list[SearchCandidate], *, limit: int = 20, k: int = 60
) -> list[HybridCandidate]:
    by_id: dict[str, SearchCandidate] = {
        item.resource.resource_id: item for item in lexical + vector
    }
    lexical_positions = {item.resource.resource_id: index for index, item in enumerate(lexical, 1)}
    vector_positions = {item.resource.resource_id: index for index, item in enumerate(vector, 1)}
    ranked = []
    for resource_id, candidate in by_id.items():
        score = 0.0
        if resource_id in lexical_positions:
            score += 1.0 / (k + lexical_positions[resource_id])
        if resource_id in vector_positions:
            score += 1.0 / (k + vector_positions[resource_id])
        ranked.append(
            HybridCandidate(
                candidate,
                lexical_positions.get(resource_id),
                vector_positions.get(resource_id),
                score,
            )
        )
    ranked.sort(
        key=lambda item: (
            -item.hybrid_score,
            item.candidate.resource.resource_id,
            item.candidate.resource.resource_version,
        )
    )
    return ranked[:limit]


@dataclass(frozen=True, slots=True)
class ReindexCommand:
    command_id: str
    index_name: str
    resource_ids: tuple[str, ...]
    strategy_version: str
    source_watermark: str
    correlation_id: str

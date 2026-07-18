"""Deterministic hybrid search service over provider-neutral contracts."""

from __future__ import annotations

from dataclasses import replace

from neuralverse_backend.domain.search.m5 import (
    Embedding,
    SearchCandidate,
    SearchRepository,
    SearchRequest,
    SearchResource,
    lexical_score,
)


class InMemorySearchRepository:
    """Deterministic test/reference repository; production uses PostgreSQL indexes."""

    def __init__(self) -> None:
        self._items: dict[tuple[str, str], tuple[SearchResource, Embedding | None]] = {}

    async def index(self, resource: SearchResource, embedding: Embedding | None = None) -> None:
        key = (resource.resource_id, resource.resource_version)
        self._items[key] = (resource, embedding)

    async def remove(self, resource_id: str, resource_version: str) -> None:
        self._items.pop((resource_id, resource_version), None)

    async def search(self, request: SearchRequest) -> list[SearchCandidate]:
        candidates: list[SearchCandidate] = []
        for resource, embedding in self._items.values():
            if resource.access_scope not in request.scopes:
                continue
            if request.language and resource.language not in (request.language, "und"):
                continue
            lexical = lexical_score(request.query, resource)
            vector = None
            if embedding is not None and request.mode.value in ("vector", "hybrid"):
                # The query embedding is supplied by a production EmbeddingPort;
                # deterministic repository ranking leaves vector score absent here.
                vector = None
            if request.mode.value == "lexical" and lexical <= 0:
                continue
            candidates.append(
                SearchCandidate(resource=resource, lexical_score=lexical, vector_score=vector)
            )
        candidates.sort(
            key=lambda item: (
                -item.lexical_score,
                item.resource.resource_id,
                item.resource.resource_version,
            )
        )
        return [
            replace(item, rank=index) for index, item in enumerate(candidates[: request.limit], 1)
        ]


class HybridSearchService:
    def __init__(self, repository: SearchRepository) -> None:
        self.repository = repository

    async def search(self, request: SearchRequest) -> list[SearchCandidate]:
        return await self.repository.search(request)

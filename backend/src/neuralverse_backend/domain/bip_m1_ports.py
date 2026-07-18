"""Persistence-neutral BIP-M1 repository and unit-of-work protocols."""

from __future__ import annotations

from contextlib import AbstractAsyncContextManager
from typing import Protocol, TypeVar

from neuralverse_backend.cross_front.bip_m1 import ContractIngestion

from .bip_m1 import (
    AgentContributionRecord,
    ContentPackage,
    LearningPackageDraftAggregate,
    PublicationReadinessRecommendationRecord,
    ValidationResultRecord,
)

T = TypeVar("T")


class ContractIngestionRepository(Protocol):
    async def get_by_digest(self, digest: str) -> ContractIngestion | None: ...
    async def add(self, ingestion: ContractIngestion) -> None: ...
    async def exists(self, digest: str) -> bool: ...


class ContentPackageRepository(Protocol):
    async def get_by_id(self, package_id: str) -> ContentPackage | None: ...
    async def add(self, package: ContentPackage) -> None: ...


class LearningPackageDraftRepository(Protocol):
    async def get_by_identity(
        self, package_id: str, package_version: str
    ) -> LearningPackageDraftAggregate | None: ...
    async def add(self, draft: LearningPackageDraftAggregate) -> None: ...


class AgentContributionRepository(Protocol):
    async def get_by_id(self, contribution_id: str) -> AgentContributionRecord | None: ...
    async def add(self, contribution: AgentContributionRecord) -> None: ...


class ValidationResultRepository(Protocol):
    async def get_by_id(self, result_id: str) -> ValidationResultRecord | None: ...
    async def add(self, result: ValidationResultRecord) -> None: ...


class PublicationReadinessRecommendationRepository(Protocol):
    async def get_by_identity(
        self, package_id: str, package_version: str
    ) -> PublicationReadinessRecommendationRecord | None: ...
    async def add(self, recommendation: PublicationReadinessRecommendationRecord) -> None: ...


class UnitOfWork(Protocol, AbstractAsyncContextManager["UnitOfWork"]):
    """A future transaction boundary; no concrete transaction is provided."""

    contract_ingestions: ContractIngestionRepository
    content_packages: ContentPackageRepository
    learning_package_drafts: LearningPackageDraftRepository
    agent_contributions: AgentContributionRepository
    validation_results: ValidationResultRepository
    readiness_recommendations: PublicationReadinessRecommendationRepository

    async def commit(self) -> None: ...
    async def rollback(self) -> None: ...
    async def close(self) -> None: ...


__all__ = [
    "AgentContributionRepository",
    "ContentPackageRepository",
    "ContractIngestionRepository",
    "LearningPackageDraftRepository",
    "PublicationReadinessRecommendationRepository",
    "UnitOfWork",
    "ValidationResultRepository",
]

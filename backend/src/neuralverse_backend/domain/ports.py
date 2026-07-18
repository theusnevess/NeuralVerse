"""Repository ports for domain persistence boundaries."""

from __future__ import annotations

from typing import Protocol

from ..assessments import AssessmentAttempt
from ..authoring import GenerationJob
from ..content import ContentPackage, ContentVersion
from ..curriculum import CurriculumNode
from ..governance import GovernanceReview
from ..laboratories import LaboratoryRun
from ..learner import LearnerProfile, LearnerSession
from ..publication import PublicationRelease
from ..shared.identifiers import (
    AssessmentAttemptId,
    ContentPackageId,
    ContentVersionId,
    CurriculumNodeId,
    GenerationJobId,
    GovernanceReviewId,
    LaboratoryRunId,
    LearnerId,
    PublicationReleaseId,
    SynchronizationRecordId,
)
from ..synchronization import SynchronizationRecord


class ContentPackageRepository(Protocol):
    async def get_by_id(self, package_id: ContentPackageId) -> ContentPackage | None: ...
    async def save(self, package: ContentPackage) -> None: ...
    async def list_all(self) -> list[ContentPackage]: ...


class ContentVersionRepository(Protocol):
    async def get_by_id(self, version_id: ContentVersionId) -> ContentVersion | None: ...
    async def save(self, version: ContentVersion) -> None: ...
    async def list_by_package(self, package_id: ContentPackageId) -> list[ContentVersion]: ...


class CurriculumRepository(Protocol):
    async def get_node_by_id(self, node_id: CurriculumNodeId) -> CurriculumNode | None: ...
    async def save_node(self, node: CurriculumNode) -> None: ...
    async def list_all_nodes(self) -> list[CurriculumNode]: ...


class AuthoringRepository(Protocol):
    async def get_job_by_id(self, job_id: GenerationJobId) -> GenerationJob | None: ...
    async def save_job(self, job: GenerationJob) -> None: ...


class GovernanceRepository(Protocol):
    async def get_review_by_id(self, review_id: GovernanceReviewId) -> GovernanceReview | None: ...
    async def save_review(self, review: GovernanceReview) -> None: ...


class PublicationRepository(Protocol):
    async def get_release_by_id(
        self, release_id: PublicationReleaseId
    ) -> PublicationRelease | None: ...
    async def save_release(self, release: PublicationRelease) -> None: ...


class LearnerRepository(Protocol):
    async def get_profile_by_id(self, learner_id: LearnerId) -> LearnerProfile | None: ...
    async def save_profile(self, profile: LearnerProfile) -> None: ...
    async def save_session(self, session: LearnerSession) -> None: ...


class LaboratoryRepository(Protocol):
    async def get_run_by_id(self, run_id: LaboratoryRunId) -> LaboratoryRun | None: ...
    async def save_run(self, run: LaboratoryRun) -> None: ...


class AssessmentRepository(Protocol):
    async def get_attempt_by_id(
        self, attempt_id: AssessmentAttemptId
    ) -> AssessmentAttempt | None: ...
    async def save_attempt(self, attempt: AssessmentAttempt) -> None: ...


class SynchronizationRepository(Protocol):
    async def get_record_by_id(
        self, record_id: SynchronizationRecordId
    ) -> SynchronizationRecord | None: ...
    async def save_record(self, record: SynchronizationRecord) -> None: ...

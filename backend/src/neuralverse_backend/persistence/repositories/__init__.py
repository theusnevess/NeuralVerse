"""Canonical persistence repositories for BIP-M5 domain baseline."""

from neuralverse_backend.persistence.repositories.assessments import SqlAlchemyAssessmentRepository
from neuralverse_backend.persistence.repositories.assets import SqlAlchemyAssetRepository
from neuralverse_backend.persistence.repositories.authoring import SqlAlchemyAuthoringRepository
from neuralverse_backend.persistence.repositories.content_packages import (
    SqlAlchemyContentPackageRepository,
)
from neuralverse_backend.persistence.repositories.content_versions import (
    SqlAlchemyContentVersionRepository,
)
from neuralverse_backend.persistence.repositories.curriculum import SqlAlchemyCurriculumRepository
from neuralverse_backend.persistence.repositories.fixture_records import FixtureRecordRepository
from neuralverse_backend.persistence.repositories.governance import SqlAlchemyGovernanceRepository
from neuralverse_backend.persistence.repositories.idempotency_records import (
    IdempotencyRecordRepository,
)
from neuralverse_backend.persistence.repositories.laboratories import (
    SqlAlchemyLaboratoryRepository,
)
from neuralverse_backend.persistence.repositories.learner import SqlAlchemyLearnerRepository
from neuralverse_backend.persistence.repositories.operational_audit_events import (
    OperationalAuditEventRepository,
)
from neuralverse_backend.persistence.repositories.outbox import OutboxRepository
from neuralverse_backend.persistence.repositories.publication import (
    SqlAlchemyPublicationRepository,
)
from neuralverse_backend.persistence.repositories.sources_citations import (
    SqlAlchemyCitationRepository,
    SqlAlchemySourceClaimLinkRepository,
    SqlAlchemySourceRepository,
)
from neuralverse_backend.persistence.repositories.synchronization import (
    SqlAlchemySynchronizationRepository,
)
from neuralverse_backend.persistence.repositories.workflow_executions import (
    WorkflowExecutionRepository,
)
from neuralverse_backend.persistence.repositories.workflow_queue import WorkflowQueueRepository

__all__ = [
    "FixtureRecordRepository",
    "IdempotencyRecordRepository",
    "OperationalAuditEventRepository",
    "OutboxRepository",
    "SqlAlchemyAssessmentRepository",
    "SqlAlchemyAssetRepository",
    "SqlAlchemyAuthoringRepository",
    "SqlAlchemyCitationRepository",
    "SqlAlchemyContentPackageRepository",
    "SqlAlchemyContentVersionRepository",
    "SqlAlchemyCurriculumRepository",
    "SqlAlchemyGovernanceRepository",
    "SqlAlchemyLaboratoryRepository",
    "SqlAlchemyLearnerRepository",
    "SqlAlchemyPublicationRepository",
    "SqlAlchemySourceClaimLinkRepository",
    "SqlAlchemySourceRepository",
    "SqlAlchemySynchronizationRepository",
    "WorkflowExecutionRepository",
    "WorkflowQueueRepository",
]

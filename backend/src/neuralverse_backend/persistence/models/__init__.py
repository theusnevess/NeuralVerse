"""Canonical persistence models for BIP-M5 domain baseline."""

from neuralverse_backend.persistence.models.assessments import (
    AssessmentAttemptRecord,
    AssessmentEvidenceRecord,
    AssessmentSpecRecord,
)
from neuralverse_backend.persistence.models.assets import (
    AssetRecord,
    AssetVersionRecord,
    VisualizationSpecRecord,
)
from neuralverse_backend.persistence.models.authoring import (
    AgentContributionRecord,
    AgentRunRecord,
    DomainValidationResultRecord,
    GenerationJobRecord,
)
from neuralverse_backend.persistence.models.authoring_job import AuthoringJobRecord
from neuralverse_backend.persistence.models.canonical_input import CanonicalInputRecord
from neuralverse_backend.persistence.models.canonical_intake_idempotency import (
    CanonicalIntakeIdempotencyRecord,
)
from neuralverse_backend.persistence.models.content import (
    ContentBlockRecord,
    ContentBlockRelationshipRecord,
    ContentPackageRecord,
    ContentVersionAssetVersionRecord,
    ContentVersionCitationRecord,
    ContentVersionRecord,
    ContentVersionSourceRecord,
)
from neuralverse_backend.persistence.models.curriculum import (
    CurriculumEdgeRecord,
    CurriculumNodeRecord,
)
from neuralverse_backend.persistence.models.domain_audit import DomainAuditEventRecord
from neuralverse_backend.persistence.models.enums import (
    AuditActorType,
    AuditEventType,
    AuditOutcome,
    AuditSubjectType,
    FixtureCanonicality,
    FixtureClassification,
    FixtureSharedContractStatus,
    FixtureValidationStatus,
    IdempotencyResponseReferenceType,
    IdempotencyStatus,
)
from neuralverse_backend.persistence.models.fixture_record import FixtureRecord
from neuralverse_backend.persistence.models.governance import (
    GovernanceReviewRecord,
    RevisionDirectiveRecord,
)
from neuralverse_backend.persistence.models.idempotency_record import IdempotencyRecord
from neuralverse_backend.persistence.models.laboratories import (
    LaboratoryEvidenceRecord,
    LaboratoryRunRecord,
    LaboratorySpecRecord,
)
from neuralverse_backend.persistence.models.learner import (
    LearnerBookmarkRecord,
    LearnerCollectionRecord,
    LearnerCollectionVersionRecord,
    LearnerHighlightRecord,
    LearnerNoteRecord,
    LearnerProfileRecord,
    LearnerProgressRecord,
    LearnerSessionRecord,
)
from neuralverse_backend.persistence.models.operational_audit_event import OperationalAuditEvent
from neuralverse_backend.persistence.models.outbox_event import TransactionalOutboxEventRecord
from neuralverse_backend.persistence.models.publication import (
    PublicationManifestAssessmentSpecRecord,
    PublicationManifestAssetVersionRecord,
    PublicationManifestBlockRecord,
    PublicationManifestCitationRecord,
    PublicationManifestLaboratorySpecRecord,
    PublicationManifestRecord,
    PublicationManifestSourceRecord,
    PublicationReleaseGovernanceReviewRecord,
    PublicationReleaseRecord,
)
from neuralverse_backend.persistence.models.publication_m3 import (
    DeliveryManifestRecord,
    PublicationAuditRecord,
    PublicationCommandRecord,
)
from neuralverse_backend.persistence.models.sources_citations import (
    CitationRecord,
    SourceClaimLinkRecord,
    SourceRecord,
)
from neuralverse_backend.persistence.models.synchronization import SynchronizationRecordRecord
from neuralverse_backend.persistence.models.workflow_execution import WorkflowExecutionRecord
from neuralverse_backend.persistence.models.workflow_queue import WorkflowQueueRecord

__all__ = [
    "AssessmentAttemptRecord",
    "AssessmentEvidenceRecord",
    "AssessmentSpecRecord",
    "AssetRecord",
    "AssetVersionRecord",
    "AuditActorType",
    "AuditEventType",
    "AuditOutcome",
    "AuditSubjectType",
    "AgentContributionRecord",
    "AgentRunRecord",
    "AuthoringJobRecord",
    "CanonicalInputRecord",
    "CanonicalIntakeIdempotencyRecord",
    "ContentBlockRecord",
    "ContentBlockRelationshipRecord",
    "ContentPackageRecord",
    "ContentVersionAssetVersionRecord",
    "ContentVersionCitationRecord",
    "ContentVersionRecord",
    "ContentVersionSourceRecord",
    "CurriculumEdgeRecord",
    "CurriculumNodeRecord",
    "CitationRecord",
    "DomainAuditEventRecord",
    "DomainValidationResultRecord",
    "FixtureCanonicality",
    "FixtureClassification",
    "FixtureRecord",
    "FixtureSharedContractStatus",
    "FixtureValidationStatus",
    "GenerationJobRecord",
    "GovernanceReviewRecord",
    "IdempotencyRecord",
    "IdempotencyResponseReferenceType",
    "IdempotencyStatus",
    "LaboratoryEvidenceRecord",
    "LaboratoryRunRecord",
    "LaboratorySpecRecord",
    "LearnerBookmarkRecord",
    "LearnerCollectionRecord",
    "LearnerCollectionVersionRecord",
    "LearnerHighlightRecord",
    "LearnerNoteRecord",
    "LearnerProfileRecord",
    "LearnerProgressRecord",
    "LearnerSessionRecord",
    "OperationalAuditEvent",
    "OperationalAuditEvent",
    "PublicationManifestRecord",
    "PublicationManifestAssessmentSpecRecord",
    "PublicationManifestAssetVersionRecord",
    "PublicationManifestBlockRecord",
    "PublicationManifestCitationRecord",
    "PublicationManifestLaboratorySpecRecord",
    "PublicationManifestSourceRecord",
    "PublicationReleaseGovernanceReviewRecord",
    "PublicationReleaseRecord",
    "PublicationAuditRecord",
    "PublicationCommandRecord",
    "DeliveryManifestRecord",
    "RevisionDirectiveRecord",
    "SourceClaimLinkRecord",
    "SourceRecord",
    "SynchronizationRecordRecord",
    "TransactionalOutboxEventRecord",
    "VisualizationSpecRecord",
    "WorkflowExecutionRecord",
    "WorkflowQueueRecord",
]

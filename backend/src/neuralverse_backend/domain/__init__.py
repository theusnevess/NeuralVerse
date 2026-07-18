"""NeuralVerse Backend Domain Model.

Modular monolith with isolated bounded contexts.
Framework-independent: no FastAPI, SQLAlchemy, Alembic, Temporal, or Redis dependencies.
"""

from __future__ import annotations

from .shared import (
    AggregateRoot as AggregateRoot,
)
from .shared import (
    ContentHash as ContentHash,
)
from .shared import (
    DomainError as DomainError,
)
from .shared import (
    DomainEvent as DomainEvent,
)
from .shared import (
    Entity as Entity,
)
from .shared import (
    IdentityError as IdentityError,
)
from .shared import (
    ImmutabilityViolation as ImmutabilityViolation,
)
from .shared import (
    InvariantViolation as InvariantViolation,
)
from .shared import (
    LifecycleState as LifecycleState,
)
from .shared import (
    LifecycleViolation as LifecycleViolation,
)
from .shared import (
    OpaqueMetadata as OpaqueMetadata,
)
from .shared import (
    RevisionNumber as RevisionNumber,
)
from .shared import (
    SequencePosition as SequencePosition,
)
from .shared import (
    UtcTimestamp as UtcTimestamp,
)
from .shared import (
    VersionNumber as VersionNumber,
)
from .shared.identifiers import (
    AgentContributionId as AgentContributionId,
)
from .shared.identifiers import (
    AgentId as AgentId,
)
from .shared.identifiers import (
    AgentRunId as AgentRunId,
)
from .shared.identifiers import (
    AssessmentAttemptId as AssessmentAttemptId,
)
from .shared.identifiers import (
    AssessmentEvidenceId as AssessmentEvidenceId,
)
from .shared.identifiers import (
    AssessmentSpecId as AssessmentSpecId,
)
from .shared.identifiers import (
    AssetId as AssetId,
)
from .shared.identifiers import (
    AssetVersionId as AssetVersionId,
)
from .shared.identifiers import (
    CitationId as CitationId,
)
from .shared.identifiers import (
    ContentBlockId as ContentBlockId,
)
from .shared.identifiers import (
    ContentBlockRelationshipId as ContentBlockRelationshipId,
)
from .shared.identifiers import (
    ContentPackageId as ContentPackageId,
)
from .shared.identifiers import (
    ContentVersionId as ContentVersionId,
)
from .shared.identifiers import (
    CurriculumEdgeId as CurriculumEdgeId,
)
from .shared.identifiers import (
    CurriculumNodeId as CurriculumNodeId,
)
from .shared.identifiers import (
    GenerationJobId as GenerationJobId,
)
from .shared.identifiers import (
    GovernanceReviewId as GovernanceReviewId,
)
from .shared.identifiers import (
    LaboratoryEvidenceId as LaboratoryEvidenceId,
)
from .shared.identifiers import (
    LaboratoryRunId as LaboratoryRunId,
)
from .shared.identifiers import (
    LaboratorySpecId as LaboratorySpecId,
)
from .shared.identifiers import (
    LearnerBookmarkId as LearnerBookmarkId,
)
from .shared.identifiers import (
    LearnerCollectionId as LearnerCollectionId,
)
from .shared.identifiers import (
    LearnerHighlightId as LearnerHighlightId,
)
from .shared.identifiers import (
    LearnerId as LearnerId,
)
from .shared.identifiers import (
    LearnerNoteId as LearnerNoteId,
)
from .shared.identifiers import (
    LearnerSessionId as LearnerSessionId,
)
from .shared.identifiers import (
    OutboxEventId as OutboxEventId,
)
from .shared.identifiers import (
    PublicationManifestId as PublicationManifestId,
)
from .shared.identifiers import (
    PublicationReleaseId as PublicationReleaseId,
)
from .shared.identifiers import (
    RevisionDirectiveId as RevisionDirectiveId,
)
from .shared.identifiers import (
    ServiceId as ServiceId,
)
from .shared.identifiers import (
    SourceClaimLinkId as SourceClaimLinkId,
)
from .shared.identifiers import (
    SourceId as SourceId,
)
from .shared.identifiers import (
    SynchronizationRecordId as SynchronizationRecordId,
)
from .shared.identifiers import (
    SystemId as SystemId,
)
from .shared.identifiers import (
    ValidationResultId as ValidationResultId,
)
from .shared.identifiers import (
    VisualizationSpecId as VisualizationSpecId,
)
from .shared.identifiers import (
    WorkflowId as WorkflowId,
)

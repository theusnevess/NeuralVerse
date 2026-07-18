"""Stable identifier value objects for all bounded contexts."""

from __future__ import annotations

import uuid
from dataclasses import dataclass
from typing import ClassVar


def _validate_uuid(value: str, family: str) -> str:
    """Validate that value is a valid UUID format."""
    try:
        parsed = uuid.UUID(value)
        return str(parsed)
    except (ValueError, AttributeError) as exc:
        raise ValueError(f"Invalid {family}: must be a valid UUID, got {value!r}") from exc


def _new_id() -> str:
    return str(uuid.uuid4())


# --- Identity identifiers ---


@dataclass(frozen=True, slots=True)
class SystemId:
    """Identity for system-level entities."""

    _value: str
    FAMILY: ClassVar[str] = "system"

    def __post_init__(self) -> None:
        object.__setattr__(self, "_value", _validate_uuid(self._value, self.FAMILY))

    @property
    def value(self) -> str:
        return self._value

    @classmethod
    def generate(cls) -> SystemId:
        return cls(_value=_new_id())

    def __str__(self) -> str:
        return self._value


@dataclass(frozen=True, slots=True)
class LearnerId:
    """Identity for learners."""

    _value: str
    FAMILY: ClassVar[str] = "learner"

    def __post_init__(self) -> None:
        object.__setattr__(self, "_value", _validate_uuid(self._value, self.FAMILY))

    @property
    def value(self) -> str:
        return self._value

    @classmethod
    def generate(cls) -> LearnerId:
        return cls(_value=_new_id())

    def __str__(self) -> str:
        return self._value


@dataclass(frozen=True, slots=True)
class AgentId:
    """Identity for agents."""

    _value: str
    FAMILY: ClassVar[str] = "agent"

    def __post_init__(self) -> None:
        object.__setattr__(self, "_value", _validate_uuid(self._value, self.FAMILY))

    @property
    def value(self) -> str:
        return self._value

    @classmethod
    def generate(cls) -> AgentId:
        return cls(_value=_new_id())

    def __str__(self) -> str:
        return self._value


@dataclass(frozen=True, slots=True)
class ServiceId:
    """Identity for services."""

    _value: str
    FAMILY: ClassVar[str] = "service"

    def __post_init__(self) -> None:
        object.__setattr__(self, "_value", _validate_uuid(self._value, self.FAMILY))

    @property
    def value(self) -> str:
        return self._value

    @classmethod
    def generate(cls) -> ServiceId:
        return cls(_value=_new_id())

    def __str__(self) -> str:
        return self._value


# --- Curriculum identifiers ---


@dataclass(frozen=True, slots=True)
class CurriculumNodeId:
    _value: str
    FAMILY: ClassVar[str] = "curriculum_node"

    def __post_init__(self) -> None:
        object.__setattr__(self, "_value", _validate_uuid(self._value, self.FAMILY))

    @property
    def value(self) -> str:
        return self._value

    @classmethod
    def generate(cls) -> CurriculumNodeId:
        return cls(_value=_new_id())

    def __str__(self) -> str:
        return self._value


@dataclass(frozen=True, slots=True)
class CurriculumEdgeId:
    _value: str
    FAMILY: ClassVar[str] = "curriculum_edge"

    def __post_init__(self) -> None:
        object.__setattr__(self, "_value", _validate_uuid(self._value, self.FAMILY))

    @property
    def value(self) -> str:
        return self._value

    @classmethod
    def generate(cls) -> CurriculumEdgeId:
        return cls(_value=_new_id())

    def __str__(self) -> str:
        return self._value


# --- Content identifiers ---


@dataclass(frozen=True, slots=True)
class ContentPackageId:
    _value: str
    FAMILY: ClassVar[str] = "content_package"

    def __post_init__(self) -> None:
        object.__setattr__(self, "_value", _validate_uuid(self._value, self.FAMILY))

    @property
    def value(self) -> str:
        return self._value

    @classmethod
    def generate(cls) -> ContentPackageId:
        return cls(_value=_new_id())

    def __str__(self) -> str:
        return self._value


@dataclass(frozen=True, slots=True)
class ContentVersionId:
    _value: str
    FAMILY: ClassVar[str] = "content_version"

    def __post_init__(self) -> None:
        object.__setattr__(self, "_value", _validate_uuid(self._value, self.FAMILY))

    @property
    def value(self) -> str:
        return self._value

    @classmethod
    def generate(cls) -> ContentVersionId:
        return cls(_value=_new_id())

    def __str__(self) -> str:
        return self._value


@dataclass(frozen=True, slots=True)
class ContentBlockId:
    _value: str
    FAMILY: ClassVar[str] = "content_block"

    def __post_init__(self) -> None:
        object.__setattr__(self, "_value", _validate_uuid(self._value, self.FAMILY))

    @property
    def value(self) -> str:
        return self._value

    @classmethod
    def generate(cls) -> ContentBlockId:
        return cls(_value=_new_id())

    def __str__(self) -> str:
        return self._value


@dataclass(frozen=True, slots=True)
class ContentBlockRelationshipId:
    _value: str
    FAMILY: ClassVar[str] = "content_block_relationship"

    def __post_init__(self) -> None:
        object.__setattr__(self, "_value", _validate_uuid(self._value, self.FAMILY))

    @property
    def value(self) -> str:
        return self._value

    @classmethod
    def generate(cls) -> ContentBlockRelationshipId:
        return cls(_value=_new_id())

    def __str__(self) -> str:
        return self._value


# --- Source identifiers ---


@dataclass(frozen=True, slots=True)
class SourceId:
    _value: str
    FAMILY: ClassVar[str] = "source"

    def __post_init__(self) -> None:
        object.__setattr__(self, "_value", _validate_uuid(self._value, self.FAMILY))

    @property
    def value(self) -> str:
        return self._value

    @classmethod
    def generate(cls) -> SourceId:
        return cls(_value=_new_id())

    def __str__(self) -> str:
        return self._value


@dataclass(frozen=True, slots=True)
class CitationId:
    _value: str
    FAMILY: ClassVar[str] = "citation"

    def __post_init__(self) -> None:
        object.__setattr__(self, "_value", _validate_uuid(self._value, self.FAMILY))

    @property
    def value(self) -> str:
        return self._value

    @classmethod
    def generate(cls) -> CitationId:
        return cls(_value=_new_id())

    def __str__(self) -> str:
        return self._value


@dataclass(frozen=True, slots=True)
class SourceClaimLinkId:
    _value: str
    FAMILY: ClassVar[str] = "source_claim_link"

    def __post_init__(self) -> None:
        object.__setattr__(self, "_value", _validate_uuid(self._value, self.FAMILY))

    @property
    def value(self) -> str:
        return self._value

    @classmethod
    def generate(cls) -> SourceClaimLinkId:
        return cls(_value=_new_id())

    def __str__(self) -> str:
        return self._value


# --- Asset identifiers ---


@dataclass(frozen=True, slots=True)
class AssetId:
    _value: str
    FAMILY: ClassVar[str] = "asset"

    def __post_init__(self) -> None:
        object.__setattr__(self, "_value", _validate_uuid(self._value, self.FAMILY))

    @property
    def value(self) -> str:
        return self._value

    @classmethod
    def generate(cls) -> AssetId:
        return cls(_value=_new_id())

    def __str__(self) -> str:
        return self._value


@dataclass(frozen=True, slots=True)
class AssetVersionId:
    _value: str
    FAMILY: ClassVar[str] = "asset_version"

    def __post_init__(self) -> None:
        object.__setattr__(self, "_value", _validate_uuid(self._value, self.FAMILY))

    @property
    def value(self) -> str:
        return self._value

    @classmethod
    def generate(cls) -> AssetVersionId:
        return cls(_value=_new_id())

    def __str__(self) -> str:
        return self._value


@dataclass(frozen=True, slots=True)
class VisualizationSpecId:
    _value: str
    FAMILY: ClassVar[str] = "visualization_spec"

    def __post_init__(self) -> None:
        object.__setattr__(self, "_value", _validate_uuid(self._value, self.FAMILY))

    @property
    def value(self) -> str:
        return self._value

    @classmethod
    def generate(cls) -> VisualizationSpecId:
        return cls(_value=_new_id())

    def __str__(self) -> str:
        return self._value


# --- Authoring identifiers ---


@dataclass(frozen=True, slots=True)
class GenerationJobId:
    _value: str
    FAMILY: ClassVar[str] = "generation_job"

    def __post_init__(self) -> None:
        object.__setattr__(self, "_value", _validate_uuid(self._value, self.FAMILY))

    @property
    def value(self) -> str:
        return self._value

    @classmethod
    def generate(cls) -> GenerationJobId:
        return cls(_value=_new_id())

    def __str__(self) -> str:
        return self._value


@dataclass(frozen=True, slots=True)
class AgentRunId:
    _value: str
    FAMILY: ClassVar[str] = "agent_run"

    def __post_init__(self) -> None:
        object.__setattr__(self, "_value", _validate_uuid(self._value, self.FAMILY))

    @property
    def value(self) -> str:
        return self._value

    @classmethod
    def generate(cls) -> AgentRunId:
        return cls(_value=_new_id())

    def __str__(self) -> str:
        return self._value


@dataclass(frozen=True, slots=True)
class AgentContributionId:
    _value: str
    FAMILY: ClassVar[str] = "agent_contribution"

    def __post_init__(self) -> None:
        object.__setattr__(self, "_value", _validate_uuid(self._value, self.FAMILY))

    @property
    def value(self) -> str:
        return self._value

    @classmethod
    def generate(cls) -> AgentContributionId:
        return cls(_value=_new_id())

    def __str__(self) -> str:
        return self._value


@dataclass(frozen=True, slots=True)
class ValidationResultId:
    _value: str
    FAMILY: ClassVar[str] = "validation_result"

    def __post_init__(self) -> None:
        object.__setattr__(self, "_value", _validate_uuid(self._value, self.FAMILY))

    @property
    def value(self) -> str:
        return self._value

    @classmethod
    def generate(cls) -> ValidationResultId:
        return cls(_value=_new_id())

    def __str__(self) -> str:
        return self._value


# --- Orchestration identifiers ---


@dataclass(frozen=True, slots=True)
class WorkflowId:
    _value: str
    FAMILY: ClassVar[str] = "workflow"

    def __post_init__(self) -> None:
        object.__setattr__(self, "_value", _validate_uuid(self._value, self.FAMILY))

    @property
    def value(self) -> str:
        return self._value

    @classmethod
    def generate(cls) -> WorkflowId:
        return cls(_value=_new_id())

    def __str__(self) -> str:
        return self._value


# --- Governance identifiers ---


@dataclass(frozen=True, slots=True)
class GovernanceReviewId:
    _value: str
    FAMILY: ClassVar[str] = "governance_review"

    def __post_init__(self) -> None:
        object.__setattr__(self, "_value", _validate_uuid(self._value, self.FAMILY))

    @property
    def value(self) -> str:
        return self._value

    @classmethod
    def generate(cls) -> GovernanceReviewId:
        return cls(_value=_new_id())

    def __str__(self) -> str:
        return self._value


@dataclass(frozen=True, slots=True)
class RevisionDirectiveId:
    _value: str
    FAMILY: ClassVar[str] = "revision_directive"

    def __post_init__(self) -> None:
        object.__setattr__(self, "_value", _validate_uuid(self._value, self.FAMILY))

    @property
    def value(self) -> str:
        return self._value

    @classmethod
    def generate(cls) -> RevisionDirectiveId:
        return cls(_value=_new_id())

    def __str__(self) -> str:
        return self._value


# --- Publication identifiers ---


@dataclass(frozen=True, slots=True)
class PublicationReleaseId:
    _value: str
    FAMILY: ClassVar[str] = "publication_release"

    def __post_init__(self) -> None:
        object.__setattr__(self, "_value", _validate_uuid(self._value, self.FAMILY))

    @property
    def value(self) -> str:
        return self._value

    @classmethod
    def generate(cls) -> PublicationReleaseId:
        return cls(_value=_new_id())

    def __str__(self) -> str:
        return self._value


@dataclass(frozen=True, slots=True)
class PublicationManifestId:
    _value: str
    FAMILY: ClassVar[str] = "publication_manifest"

    def __post_init__(self) -> None:
        object.__setattr__(self, "_value", _validate_uuid(self._value, self.FAMILY))

    @property
    def value(self) -> str:
        return self._value

    @classmethod
    def generate(cls) -> PublicationManifestId:
        return cls(_value=_new_id())

    def __str__(self) -> str:
        return self._value


# --- Learner identifiers ---


@dataclass(frozen=True, slots=True)
class LearnerSessionId:
    _value: str
    FAMILY: ClassVar[str] = "learner_session"

    def __post_init__(self) -> None:
        object.__setattr__(self, "_value", _validate_uuid(self._value, self.FAMILY))

    @property
    def value(self) -> str:
        return self._value

    @classmethod
    def generate(cls) -> LearnerSessionId:
        return cls(_value=_new_id())

    def __str__(self) -> str:
        return self._value


@dataclass(frozen=True, slots=True)
class LearnerNoteId:
    _value: str
    FAMILY: ClassVar[str] = "learner_note"

    def __post_init__(self) -> None:
        object.__setattr__(self, "_value", _validate_uuid(self._value, self.FAMILY))

    @property
    def value(self) -> str:
        return self._value

    @classmethod
    def generate(cls) -> LearnerNoteId:
        return cls(_value=_new_id())

    def __str__(self) -> str:
        return self._value


@dataclass(frozen=True, slots=True)
class LearnerBookmarkId:
    _value: str
    FAMILY: ClassVar[str] = "learner_bookmark"

    def __post_init__(self) -> None:
        object.__setattr__(self, "_value", _validate_uuid(self._value, self.FAMILY))

    @property
    def value(self) -> str:
        return self._value

    @classmethod
    def generate(cls) -> LearnerBookmarkId:
        return cls(_value=_new_id())

    def __str__(self) -> str:
        return self._value


@dataclass(frozen=True, slots=True)
class LearnerCollectionId:
    _value: str
    FAMILY: ClassVar[str] = "learner_collection"

    def __post_init__(self) -> None:
        object.__setattr__(self, "_value", _validate_uuid(self._value, self.FAMILY))

    @property
    def value(self) -> str:
        return self._value

    @classmethod
    def generate(cls) -> LearnerCollectionId:
        return cls(_value=_new_id())

    def __str__(self) -> str:
        return self._value


@dataclass(frozen=True, slots=True)
class LearnerHighlightId:
    _value: str
    FAMILY: ClassVar[str] = "learner_highlight"

    def __post_init__(self) -> None:
        object.__setattr__(self, "_value", _validate_uuid(self._value, self.FAMILY))

    @property
    def value(self) -> str:
        return self._value

    @classmethod
    def generate(cls) -> LearnerHighlightId:
        return cls(_value=_new_id())

    def __str__(self) -> str:
        return self._value


# --- Laboratory identifiers ---


@dataclass(frozen=True, slots=True)
class LaboratorySpecId:
    _value: str
    FAMILY: ClassVar[str] = "laboratory_spec"

    def __post_init__(self) -> None:
        object.__setattr__(self, "_value", _validate_uuid(self._value, self.FAMILY))

    @property
    def value(self) -> str:
        return self._value

    @classmethod
    def generate(cls) -> LaboratorySpecId:
        return cls(_value=_new_id())

    def __str__(self) -> str:
        return self._value


@dataclass(frozen=True, slots=True)
class LaboratoryRunId:
    _value: str
    FAMILY: ClassVar[str] = "laboratory_run"

    def __post_init__(self) -> None:
        object.__setattr__(self, "_value", _validate_uuid(self._value, self.FAMILY))

    @property
    def value(self) -> str:
        return self._value

    @classmethod
    def generate(cls) -> LaboratoryRunId:
        return cls(_value=_new_id())

    def __str__(self) -> str:
        return self._value


@dataclass(frozen=True, slots=True)
class LaboratoryEvidenceId:
    _value: str
    FAMILY: ClassVar[str] = "laboratory_evidence"

    def __post_init__(self) -> None:
        object.__setattr__(self, "_value", _validate_uuid(self._value, self.FAMILY))

    @property
    def value(self) -> str:
        return self._value

    @classmethod
    def generate(cls) -> LaboratoryEvidenceId:
        return cls(_value=_new_id())

    def __str__(self) -> str:
        return self._value


# --- Assessment identifiers ---


@dataclass(frozen=True, slots=True)
class AssessmentSpecId:
    _value: str
    FAMILY: ClassVar[str] = "assessment_spec"

    def __post_init__(self) -> None:
        object.__setattr__(self, "_value", _validate_uuid(self._value, self.FAMILY))

    @property
    def value(self) -> str:
        return self._value

    @classmethod
    def generate(cls) -> AssessmentSpecId:
        return cls(_value=_new_id())

    def __str__(self) -> str:
        return self._value


@dataclass(frozen=True, slots=True)
class AssessmentAttemptId:
    _value: str
    FAMILY: ClassVar[str] = "assessment_attempt"

    def __post_init__(self) -> None:
        object.__setattr__(self, "_value", _validate_uuid(self._value, self.FAMILY))

    @property
    def value(self) -> str:
        return self._value

    @classmethod
    def generate(cls) -> AssessmentAttemptId:
        return cls(_value=_new_id())

    def __str__(self) -> str:
        return self._value


@dataclass(frozen=True, slots=True)
class AssessmentEvidenceId:
    _value: str
    FAMILY: ClassVar[str] = "assessment_evidence"

    def __post_init__(self) -> None:
        object.__setattr__(self, "_value", _validate_uuid(self._value, self.FAMILY))

    @property
    def value(self) -> str:
        return self._value

    @classmethod
    def generate(cls) -> AssessmentEvidenceId:
        return cls(_value=_new_id())

    def __str__(self) -> str:
        return self._value


# --- Synchronization identifiers ---


@dataclass(frozen=True, slots=True)
class SynchronizationRecordId:
    _value: str
    FAMILY: ClassVar[str] = "synchronization_record"

    def __post_init__(self) -> None:
        object.__setattr__(self, "_value", _validate_uuid(self._value, self.FAMILY))

    @property
    def value(self) -> str:
        return self._value

    @classmethod
    def generate(cls) -> SynchronizationRecordId:
        return cls(_value=_new_id())

    def __str__(self) -> str:
        return self._value


# --- Operations identifiers ---


@dataclass(frozen=True, slots=True)
class OutboxEventId:
    _value: str
    FAMILY: ClassVar[str] = "outbox_event"

    def __post_init__(self) -> None:
        object.__setattr__(self, "_value", _validate_uuid(self._value, self.FAMILY))

    @property
    def value(self) -> str:
        return self._value

    @classmethod
    def generate(cls) -> OutboxEventId:
        return cls(_value=_new_id())

    def __str__(self) -> str:
        return self._value

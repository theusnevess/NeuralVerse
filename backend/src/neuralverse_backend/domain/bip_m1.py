"""Persistence-neutral BIP-M1 domain objects and invariants.

The objects in this module are deliberately smaller than the persistence
models. They represent accepted semantic snapshots and Backend-owned identity
boundaries without importing an ORM or an infrastructure client.
"""

from __future__ import annotations

import re
from collections.abc import Mapping
from dataclasses import dataclass
from types import MappingProxyType
from typing import Any, cast

from neuralverse_backend.cross_front.bip_m1 import (
    AgentContribution as AgentContributionContract,
)
from neuralverse_backend.cross_front.bip_m1 import (
    CanonicalDomainContract,
    ContractError,
    ContractErrorCode,
)
from neuralverse_backend.cross_front.bip_m1 import (
    CurriculumContract as CurriculumContractPayload,
)
from neuralverse_backend.cross_front.bip_m1 import (
    LearningPackageDraft as LearningPackageDraftPayload,
)
from neuralverse_backend.cross_front.bip_m1 import (
    PublicationReadinessRecommendation as PublicationReadinessPayload,
)
from neuralverse_backend.cross_front.bip_m1 import (
    ValidationResult as ValidationResultPayload,
)


def _freeze(value: Any) -> Any:
    if isinstance(value, Mapping):
        return MappingProxyType({str(key): _freeze(item) for key, item in value.items()})
    if isinstance(value, (list, tuple)):
        return tuple(_freeze(item) for item in value)
    return value


def _mapping(value: Mapping[str, Any] | None = None) -> Mapping[str, Any]:
    return cast(Mapping[str, Any], _freeze(dict(value or {})))


def _tuple(value: tuple[Any, ...] | list[Any] | None = None) -> tuple[Any, ...]:
    return tuple(_freeze(item) for item in value or ())


@dataclass(frozen=True, slots=True)
class ContractDigest:
    algorithm: str
    value: str

    def __post_init__(self) -> None:
        if self.algorithm != "sha256" or not re.fullmatch(r"[0-9a-f]{64}", self.value):
            raise ValueError("ContractDigest requires a SHA-256 hexadecimal digest")


@dataclass(frozen=True, slots=True)
class AgentAttribution:
    agent_id: str
    agent_version: str
    contribution_id: str

    def __post_init__(self) -> None:
        if not all((self.agent_id, self.agent_version, self.contribution_id)):
            raise ValueError("agent attribution identifiers must not be empty")


@dataclass(frozen=True, slots=True)
class ContributionDependency:
    kind: str
    identifier: str

    def __post_init__(self) -> None:
        if not self.kind or not self.identifier:
            raise ValueError("contribution dependency must identify kind and value")


@dataclass(frozen=True, slots=True)
class ContentBlock:
    block_id: str
    block_type: str
    payload: Mapping[str, Any]
    order: int

    def __post_init__(self) -> None:
        if not self.block_id or self.order < 0:
            raise ValueError("content block identity and order are required")
        object.__setattr__(self, "payload", _mapping(self.payload))


@dataclass(frozen=True, slots=True)
class ContentBlockRelationship:
    relationship_id: str
    source_block_id: str
    target_block_id: str
    relationship_type: str

    def __post_init__(self) -> None:
        if not all(
            (
                self.relationship_id,
                self.source_block_id,
                self.target_block_id,
                self.relationship_type,
            )
        ):
            raise ValueError("content block relationship is incomplete")


@dataclass(frozen=True, slots=True)
class SourceReference:
    source_id: str
    metadata: Mapping[str, Any] = MappingProxyType({})

    def __post_init__(self) -> None:
        if not self.source_id:
            raise ValueError("source_id is required")
        object.__setattr__(self, "metadata", _mapping(self.metadata))


@dataclass(frozen=True, slots=True)
class CitationReference:
    citation_id: str
    source_id: str
    metadata: Mapping[str, Any] = MappingProxyType({})

    def __post_init__(self) -> None:
        if not self.citation_id or not self.source_id:
            raise ValueError("citation and source identifiers are required")
        object.__setattr__(self, "metadata", _mapping(self.metadata))


@dataclass(frozen=True, slots=True)
class SourceClaimLink:
    claim_id: str
    source_id: str
    metadata: Mapping[str, Any] = MappingProxyType({})

    def __post_init__(self) -> None:
        if not self.claim_id or not self.source_id:
            raise ValueError("claim and source identifiers are required")
        object.__setattr__(self, "metadata", _mapping(self.metadata))


@dataclass(frozen=True, slots=True)
class AssetReference:
    asset_id: str
    version_id: str | None = None
    metadata: Mapping[str, Any] = MappingProxyType({})

    def __post_init__(self) -> None:
        if not self.asset_id:
            raise ValueError("asset_id is required")
        object.__setattr__(self, "metadata", _mapping(self.metadata))


@dataclass(frozen=True, slots=True)
class AssetVersionReference:
    asset_id: str
    version_id: str
    metadata: Mapping[str, Any] = MappingProxyType({})

    def __post_init__(self) -> None:
        if not self.asset_id or not self.version_id:
            raise ValueError("asset and version identifiers are required")
        object.__setattr__(self, "metadata", _mapping(self.metadata))


@dataclass(frozen=True, slots=True)
class CurriculumReference:
    node_ids: tuple[str, ...]

    def __post_init__(self) -> None:
        values = _tuple(self.node_ids)
        if not values or any(not value for value in values):
            raise ValueError("at least one curriculum node is required")
        object.__setattr__(self, "node_ids", values)


@dataclass(frozen=True, slots=True)
class GovernanceReference:
    review_id: str | None
    state: str
    rationale: str | None = None

    def __post_init__(self) -> None:
        if not self.state:
            raise ValueError("governance state is required")


@dataclass(frozen=True, slots=True)
class ValidationResultRecord:
    result_id: str
    status: str
    valid: bool
    findings: tuple[Mapping[str, Any], ...]
    validator_id: str | None = None
    evidence: tuple[str, ...] = ()
    unknown_fields: Mapping[str, Any] = MappingProxyType({})

    def __post_init__(self) -> None:
        if not self.result_id or self.status not in {
            "PASS",
            "PASS_WITH_FINDINGS",
            "FAIL",
            "UNKNOWN",
        }:
            raise ContractError(
                ContractErrorCode.GOVERNANCE_STATE_FAILURE, "Invalid ValidationResult record."
            )
        object.__setattr__(self, "findings", tuple(_mapping(item) for item in self.findings))
        object.__setattr__(self, "evidence", _tuple(self.evidence))
        object.__setattr__(self, "unknown_fields", _mapping(self.unknown_fields))

    @classmethod
    def from_contract(
        cls, contract: ValidationResultPayload, *, result_id: str | None = None
    ) -> ValidationResultRecord:
        value = contract.value()
        findings = value.get("findings", ())
        return cls(
            result_id=result_id or contract.identity,
            status=str(value["status"]),
            valid=bool(value["valid"]),
            findings=tuple(item for item in findings if isinstance(item, Mapping)),
            validator_id=cast_optional_str(value.get("validatorId")),
            evidence=tuple(
                str(item) for item in value.get("evidenceReferences", ()) if isinstance(item, str)
            ),
            unknown_fields={
                key: item
                for key, item in value.items()
                if key
                not in {
                    "schema_name",
                    "schema_version",
                    "minimum_reader_version",
                    "producer_version",
                    "created_at",
                    "status",
                    "valid",
                    "findings",
                    "validatorId",
                    "evidenceReferences",
                }
            },
        )


def cast_optional_str(value: object) -> str | None:
    return value if isinstance(value, str) else None


@dataclass(frozen=True, slots=True)
class AgentContributionRecord:
    contribution_id: str
    package_id: str
    package_version: str
    attribution: AgentAttribution
    dependencies: tuple[ContributionDependency, ...]
    structured_payload: Mapping[str, Any]
    citation_ids: tuple[str, ...]
    asset_request_ids: tuple[str, ...]
    validation_results: tuple[ValidationResultRecord, ...]
    warnings: tuple[Any, ...]
    confidence: float
    unknown_fields: Mapping[str, Any] = MappingProxyType({})

    def __post_init__(self) -> None:
        if not self.contribution_id or not self.package_id or not self.package_version:
            raise ValueError("contribution identity is incomplete")
        if not 0 <= self.confidence <= 1:
            raise ValueError("confidence must be between zero and one")
        object.__setattr__(self, "dependencies", _tuple(self.dependencies))
        object.__setattr__(self, "structured_payload", _mapping(self.structured_payload))
        object.__setattr__(self, "citation_ids", _tuple(self.citation_ids))
        object.__setattr__(self, "asset_request_ids", _tuple(self.asset_request_ids))
        object.__setattr__(self, "validation_results", _tuple(self.validation_results))
        object.__setattr__(self, "warnings", _tuple(self.warnings))
        object.__setattr__(self, "unknown_fields", _mapping(self.unknown_fields))


@dataclass(frozen=True, slots=True)
class DraftContentVersion:
    package_version: str
    blocks: tuple[ContentBlock, ...]
    block_order: tuple[str, ...]
    lifecycle: str
    immutable: bool = True

    def __post_init__(self) -> None:
        object.__setattr__(self, "blocks", _tuple(self.blocks))
        object.__setattr__(self, "block_order", _tuple(self.block_order))
        if self.immutable and (
            any(not isinstance(item, str) or not item for item in self.block_order)
            or len(self.block_order) != len(set(self.block_order))
        ):
            raise ContractError(
                ContractErrorCode.BLOCK_ORDER_MISMATCH, "Draft block order is not lossless."
            )


@dataclass(frozen=True, slots=True)
class LearningPackageDraftAggregate:
    package_id: str
    package_version: str
    content: DraftContentVersion
    curriculum: CurriculumReference
    contribution_ids: tuple[str, ...]
    source_references: tuple[SourceReference, ...]
    citations: tuple[CitationReference, ...]
    assets: tuple[AssetReference, ...]
    governance: GovernanceReference
    validation_results: tuple[ValidationResultRecord, ...]
    raw_payload: Mapping[str, Any]

    def __post_init__(self) -> None:
        if not self.package_id or self.package_version != self.content.package_version:
            raise ContractError(
                ContractErrorCode.IDENTITY_MISMATCH, "Draft package identity is inconsistent."
            )
        object.__setattr__(self, "contribution_ids", _tuple(self.contribution_ids))
        object.__setattr__(self, "source_references", _tuple(self.source_references))
        object.__setattr__(self, "citations", _tuple(self.citations))
        object.__setattr__(self, "assets", _tuple(self.assets))
        object.__setattr__(self, "validation_results", _tuple(self.validation_results))
        object.__setattr__(self, "raw_payload", _mapping(self.raw_payload))

    @classmethod
    def from_contract(cls, contract: LearningPackageDraftPayload) -> LearningPackageDraftAggregate:
        value = contract.value()
        blocks = tuple(
            ContentBlock(
                block_id=str(item.get("contentBlockId", item.get("blockId"))),
                block_type=str(item.get("blockType", "unknown")),
                payload=item.get("structuredPayload", item.get("payload", {})),
                order=index,
            )
            for index, item in enumerate(value.get("contentBlocks", ()))
            if isinstance(item, Mapping) and item.get("contentBlockId", item.get("blockId"))
        )
        source_manifest = value.get("sourceManifest", {})
        source_values = (
            source_manifest.get("sourceIds", source_manifest.get("sources", ()))
            if isinstance(source_manifest, Mapping)
            else ()
        )
        source_ids = tuple(
            item
            if isinstance(item, str)
            else item.get("sourceId", item.get("id"))
            if isinstance(item, Mapping)
            else None
            for item in source_values
        )
        curriculum_scope = value.get("curriculumScope")
        if not isinstance(curriculum_scope, Mapping):
            raise ContractError(
                ContractErrorCode.CURRICULUM_RELATIONSHIP_FAILURE,
                "Draft curriculum scope is malformed.",
            )
        citations = tuple(
            CitationReference(str(item["citationId"]), str(item["sourceId"]), item)
            for item in value.get("citations", ())
            if isinstance(item, Mapping) and item.get("citationId") and item.get("sourceId")
        )
        return cls(
            package_id=str(value["packageId"]),
            package_version=str(value["packageVersion"]),
            content=DraftContentVersion(
                str(value["packageVersion"]),
                blocks,
                tuple(str(item) for item in value.get("blockOrder", ())),
                str(value.get("lifecycle", "UNKNOWN")),
            ),
            curriculum=CurriculumReference(
                tuple(str(item) for item in curriculum_scope.get("curriculumNodeIds", ()))
            ),
            contribution_ids=tuple(str(item) for item in value.get("contributionIds", ())),
            source_references=tuple(
                SourceReference(str(item)) for item in source_ids if item is not None
            ),
            citations=citations,
            assets=tuple(AssetReference(str(item)) for item in value.get("assetRequestIds", ())),
            governance=GovernanceReference(
                None,
                str(value.get("governance", {}).get("state", "UNKNOWN"))
                if isinstance(value.get("governance"), Mapping)
                else "UNKNOWN",
            ),
            validation_results=(),
            raw_payload=value,
        )


@dataclass(frozen=True, slots=True)
class ContentPackage:
    package_id: str
    versions: tuple[DraftContentVersion, ...] = ()

    def __post_init__(self) -> None:
        if not self.package_id:
            raise ValueError("package_id is required")
        object.__setattr__(self, "versions", _tuple(self.versions))


@dataclass(frozen=True, slots=True)
class PublicationReadinessRecommendationRecord:
    package_id: str
    package_version: str
    recommendation: str
    unresolved_finding_ids: tuple[str, ...]
    required_manual_reviews: tuple[Mapping[str, Any], ...]
    unknowns: tuple[Mapping[str, Any], ...]
    governance_rationale: str
    immutable: bool = True

    def __post_init__(self) -> None:
        if not self.package_id or not self.package_version or not self.recommendation:
            raise ValueError("readiness identity is incomplete")
        object.__setattr__(self, "unresolved_finding_ids", _tuple(self.unresolved_finding_ids))
        object.__setattr__(
            self,
            "required_manual_reviews",
            tuple(_mapping(item) for item in self.required_manual_reviews),
        )
        object.__setattr__(self, "unknowns", tuple(_mapping(item) for item in self.unknowns))


def validate_cross_contract_consistency(
    draft: LearningPackageDraftAggregate,
    *,
    contributions: tuple[AgentContributionRecord, ...] = (),
    readiness: PublicationReadinessRecommendationRecord | None = None,
) -> None:
    contribution_ids = set(draft.contribution_ids)
    for contribution in contributions:
        if (
            contribution.package_id != draft.package_id
            or contribution.package_version != draft.package_version
        ):
            raise ContractError(
                ContractErrorCode.IDENTITY_MISMATCH,
                "Contribution does not target the draft package.",
            )
        if contribution.contribution_id not in contribution_ids:
            raise ContractError(
                ContractErrorCode.RELATIONSHIP_INTEGRITY_FAILURE,
                "Draft provenance does not include contribution.",
            )
    if readiness is not None and (
        readiness.package_id != draft.package_id
        or readiness.package_version != draft.package_version
    ):
        raise ContractError(
            ContractErrorCode.READINESS_DRAFT_MISMATCH,
            "Readiness recommendation does not match draft.",
        )


def domain_projection(contract: CanonicalDomainContract) -> object:
    if isinstance(contract, AgentContributionContract):
        value = contract.value()
        return AgentContributionRecord(
            contribution_id=str(value["contributionId"]),
            package_id=str(value["packageId"]),
            package_version=str(value["packageVersion"]),
            attribution=AgentAttribution(
                str(value["agentId"]), str(value["agentVersion"]), str(value["contributionId"])
            ),
            dependencies=tuple(
                ContributionDependency(str(item.get("kind")), str(item.get("id")))
                for item in value.get("inputDependencies", ())
                if isinstance(item, Mapping)
            ),
            structured_payload=value["structuredPayload"],
            citation_ids=tuple(str(item) for item in value.get("citationIds", ())),
            asset_request_ids=tuple(str(item) for item in value.get("assetRequestIds", ())),
            validation_results=(),
            warnings=tuple(value.get("warnings", ())),
            confidence=float(value["confidence"]),
        )
    if isinstance(contract, LearningPackageDraftPayload):
        return LearningPackageDraftAggregate.from_contract(contract)
    if isinstance(contract, PublicationReadinessPayload):
        value = contract.value()
        return PublicationReadinessRecommendationRecord(
            package_id=str(value["packageId"]),
            package_version=str(value["packageVersion"]),
            recommendation=str(value["recommendation"]),
            unresolved_finding_ids=tuple(
                str(item) for item in value.get("unresolvedFindingIds", ())
            ),
            required_manual_reviews=tuple(
                item for item in value.get("requiredManualReviews", ()) if isinstance(item, Mapping)
            ),
            unknowns=tuple(
                item for item in value.get("unresolvedUnknowns", ()) if isinstance(item, Mapping)
            ),
            governance_rationale=str(value["governanceRationale"]),
        )
    if isinstance(contract, ValidationResultPayload):
        return ValidationResultRecord.from_contract(contract)
    if isinstance(contract, CurriculumContractPayload):
        value = contract.value()
        return CurriculumReference(
            tuple(str(item) for item in value.get("targetCurriculumNodeIds", ()))
        )
    raise TypeError(f"Unsupported BIP-M1 contract: {type(contract).__name__}")


__all__ = [
    "AgentAttribution",
    "AgentContributionRecord",
    "AssetReference",
    "AssetVersionReference",
    "CitationReference",
    "ContentBlock",
    "ContentBlockRelationship",
    "ContentPackage",
    "ContractDigest",
    "ContributionDependency",
    "CurriculumReference",
    "DraftContentVersion",
    "GovernanceReference",
    "LearningPackageDraftAggregate",
    "PublicationReadinessRecommendationRecord",
    "SourceReference",
    "SourceClaimLink",
    "ValidationResultRecord",
    "domain_projection",
    "validate_cross_contract_consistency",
]

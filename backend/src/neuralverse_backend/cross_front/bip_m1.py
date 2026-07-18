"""Lossless, persistence-neutral adapters for the approved NV-XFI contracts.

This module deliberately stops at the Backend domain boundary.  It does not
know about SQLAlchemy, HTTP requests, queues, or database transactions.  The
raw JSON representation is retained so that adapting a contract cannot erase
compatible extensions that a newer producer supplied.
"""

from __future__ import annotations

import hashlib
import json
import math
import re
from collections.abc import Mapping
from dataclasses import dataclass
from datetime import UTC, datetime, timedelta
from enum import StrEnum
from types import MappingProxyType
from typing import Any, TypeVar, cast

JsonScalar = None | bool | int | float | str
JsonValue = JsonScalar | tuple["JsonValue", ...] | Mapping[str, "JsonValue"]
_VERSION_RE = re.compile(r"^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$")
READER_VERSION = "1.0.0"
XFI_ENVELOPE_NAME = "NV-XFI-000"
SUPPORTED_CONTRACT_VERSIONS = {
    "CurriculumContract": "1.0.0",
    "AgentContribution": "1.0.0",
    "LearningPackageDraft": "1.0.0",
    "PublicationReadinessRecommendation": "1.0.0",
    "ValidationResult": "1.0.0",
}

REQUIRED_FIELDS: dict[str, tuple[str, ...]] = {
    "CurriculumContract": (
        "contractId",
        "contractVersion",
        "curriculumScope",
        "targetConceptIds",
        "targetCurriculumNodeIds",
        "learningObjectives",
        "prerequisites",
        "competencies",
        "expectedDepth",
        "forwardConnections",
        "cognitiveProgressionConstraints",
        "dependencyEdges",
        "requiredArtifactTypes",
        "requiredAgentContributions",
        "constraintSet",
        "validationResults",
        "lifecycle",
        "createdAt",
        "updatedAt",
        "metadata",
    ),
    "AgentContribution": (
        "contributionId",
        "generationJobId",
        "agentId",
        "agentVersion",
        "packageId",
        "packageVersion",
        "contributionType",
        "inputDependencies",
        "payloadSchemaVersion",
        "structuredPayload",
        "citationIds",
        "assetRequestIds",
        "validationResults",
        "warnings",
        "confidence",
        "createdAt",
        "metadata",
    ),
    "LearningPackageDraft": (
        "packageId",
        "packageVersion",
        "title",
        "curriculumScope",
        "learningObjectives",
        "prerequisites",
        "competencies",
        "expectedDepth",
        "contributionIds",
        "agentContributions",
        "assemblyPlan",
        "contentBlocks",
        "blockOrder",
        "sourceManifest",
        "citations",
        "laboratoryReferences",
        "assessmentReferences",
        "assetRequestIds",
        "coverageReport",
        "unresolvedFindings",
        "validationResults",
        "revisionDirectives",
        "lifecycle",
        "createdAt",
        "updatedAt",
        "metadata",
    ),
    "PublicationReadinessRecommendation": (
        "packageId",
        "packageVersion",
        "recommendation",
        "recommender",
        "recommenderVersion",
        "qualityGateResults",
        "unresolvedFindingIds",
        "requiredManualReviews",
        "acceptedBacklog",
        "unresolvedUnknowns",
        "coverage",
        "governanceRationale",
        "recommendedAt",
        "metadata",
    ),
    "ValidationResult": ("status", "valid", "findings"),
}


class ContractErrorCode(StrEnum):
    CONTRACT_VERSION_MISMATCH = "CONTRACT_VERSION_MISMATCH"
    CONTRACT_SCHEMA_MISMATCH = "CONTRACT_SCHEMA_MISMATCH"
    CONTRACT_MINIMUM_READER_UNSUPPORTED = "CONTRACT_MINIMUM_READER_UNSUPPORTED"
    CONTRACT_VALIDATION_FAILURE = "CONTRACT_VALIDATION_FAILURE"
    CONTRACT_SEMANTIC_LOSS = "CONTRACT_SEMANTIC_LOSS"
    UNKNOWN_FIELD_LOSS = "UNKNOWN_FIELD_LOSS"
    IDENTITY_MISMATCH = "IDENTITY_MISMATCH"
    RELATIONSHIP_INTEGRITY_FAILURE = "RELATIONSHIP_INTEGRITY_FAILURE"
    BLOCK_ORDER_MISMATCH = "BLOCK_ORDER_MISMATCH"
    AGENT_ATTRIBUTION_LOSS = "AGENT_ATTRIBUTION_LOSS"
    SOURCE_RELATIONSHIP_FAILURE = "SOURCE_RELATIONSHIP_FAILURE"
    CITATION_RELATIONSHIP_FAILURE = "CITATION_RELATIONSHIP_FAILURE"
    ASSET_RELATIONSHIP_FAILURE = "ASSET_RELATIONSHIP_FAILURE"
    CURRICULUM_RELATIONSHIP_FAILURE = "CURRICULUM_RELATIONSHIP_FAILURE"
    GOVERNANCE_STATE_FAILURE = "GOVERNANCE_STATE_FAILURE"
    READINESS_DRAFT_MISMATCH = "READINESS_DRAFT_MISMATCH"
    DUPLICATE_DOMAIN_IDENTITY = "DUPLICATE_DOMAIN_IDENTITY"
    DOMAIN_INVARIANT_FAILURE = "DOMAIN_INVARIANT_FAILURE"


class ContractError(ValueError):
    """Safe, stable error at the cross-front intake boundary."""

    def __init__(
        self,
        code: ContractErrorCode,
        message: str,
        *,
        contract_name: str | None = None,
        contract_version: str | None = None,
        identity: str | None = None,
        path: str | None = None,
        retryable: bool = False,
        details: Mapping[str, JsonValue] | None = None,
    ) -> None:
        super().__init__(message)
        self.code = code
        self.classification = code.value
        self.contract_name = contract_name
        self.contract_version = contract_version
        self.identity = identity
        self.path = path
        self.retryable = retryable
        self.details = MappingProxyType(dict(details or {}))


def _freeze(value: Any) -> JsonValue:
    if value is None or isinstance(value, (bool, int, str)):
        return value
    if isinstance(value, float):
        if not math.isfinite(value):
            raise ContractError(
                ContractErrorCode.CONTRACT_VALIDATION_FAILURE,
                "Payload contains a non-finite JSON number.",
            )
        return value
    if isinstance(value, Mapping):
        if any(not isinstance(key, str) for key in value):
            raise ContractError(
                ContractErrorCode.CONTRACT_VALIDATION_FAILURE,
                "JSON object keys must be strings.",
            )
        return MappingProxyType({key: _freeze(item) for key, item in value.items()})
    if isinstance(value, (list, tuple)):
        return tuple(_freeze(v) for v in value)
    raise ContractError(ContractErrorCode.CONTRACT_VALIDATION_FAILURE, "Payload is not JSON-safe.")


def _thaw(value: JsonValue) -> Any:
    if isinstance(value, Mapping):
        return {key: _thaw(item) for key, item in value.items()}
    if isinstance(value, tuple):
        return [_thaw(item) for item in value]
    return value


def semantic_json(value: JsonValue) -> Any:
    """Return a defensive JSON-compatible copy for callers and serializers."""
    return _thaw(value)


@dataclass(frozen=True, slots=True, order=True)
class ContractVersion:
    major: int
    minor: int
    patch: int

    @classmethod
    def parse(cls, value: str) -> ContractVersion:
        match = _VERSION_RE.fullmatch(value) if isinstance(value, str) else None
        if match is None:
            raise ContractError(
                ContractErrorCode.CONTRACT_VERSION_MISMATCH, "Invalid semantic version."
            )
        return cls(*(int(part) for part in match.groups()))

    def __str__(self) -> str:
        return f"{self.major}.{self.minor}.{self.patch}"


@dataclass(frozen=True, slots=True)
class SchemaIdentity:
    name: str
    version: ContractVersion
    minimum_reader_version: ContractVersion
    producer_version: str


@dataclass(frozen=True, slots=True)
class CompatibilityResult:
    accepted: bool
    classification: str
    reader_version: ContractVersion
    schema_version: ContractVersion
    minimum_reader_version: ContractVersion


@dataclass(frozen=True, slots=True)
class CanonicalContractEnvelope:
    """The approved NV-XFI transport envelope, separate from payload meaning."""

    metadata: Mapping[str, JsonValue]
    payload: JsonValue
    raw_bytes: bytes
    digest: str
    compatibility: CompatibilityResult

    @classmethod
    def from_bytes(
        cls, raw_bytes: bytes, *, reader_version: str = READER_VERSION
    ) -> CanonicalContractEnvelope:
        try:
            decoded = json.loads(
                raw_bytes.decode("utf-8"),
                parse_constant=lambda _: (_ for _ in ()).throw(ValueError()),
            )
        except (UnicodeDecodeError, json.JSONDecodeError, ValueError) as exc:
            raise ContractError(
                ContractErrorCode.CONTRACT_VALIDATION_FAILURE,
                "Envelope is not valid UTF-8 JSON.",
            ) from exc
        return cls.from_value(decoded, raw_bytes=raw_bytes, reader_version=reader_version)

    @classmethod
    def from_value(
        cls,
        value: Mapping[str, Any],
        *,
        raw_bytes: bytes | None = None,
        reader_version: str = READER_VERSION,
    ) -> CanonicalContractEnvelope:
        if not isinstance(value, Mapping):
            raise ContractError(
                ContractErrorCode.CONTRACT_VALIDATION_FAILURE,
                "Envelope root must be an object.",
            )
        metadata = value.get("metadata")
        if not isinstance(metadata, Mapping) or "payload" not in value:
            raise ContractError(
                ContractErrorCode.CONTRACT_VALIDATION_FAILURE,
                "Envelope requires metadata and payload.",
            )
        if metadata.get("schema_name") != XFI_ENVELOPE_NAME:
            raise ContractError(
                ContractErrorCode.CONTRACT_SCHEMA_MISMATCH,
                "Envelope schema_name does not match NV-XFI-000.",
                contract_name=XFI_ENVELOPE_NAME,
                path="metadata.schema_name",
            )
        required = (
            "schema_name",
            "schema_version",
            "minimum_reader_version",
            "producer_version",
            "created_at",
        )
        missing = [field for field in required if not metadata.get(field)]
        if missing:
            raise ContractError(
                ContractErrorCode.CONTRACT_VALIDATION_FAILURE,
                "Envelope metadata is incomplete.",
                contract_name=XFI_ENVELOPE_NAME,
                path=f"metadata.{missing[0]}",
            )
        compatibility = validate_compatibility(
            metadata, expected_name=XFI_ENVELOPE_NAME, reader_version=reader_version
        )
        _timestamp(metadata["created_at"], field_name="metadata.created_at")
        frozen_metadata = cast(Mapping[str, JsonValue], _freeze(dict(metadata)))
        frozen_payload = _freeze(value["payload"])
        encoded = raw_bytes or json.dumps(
            {"metadata": metadata, "payload": value["payload"]},
            ensure_ascii=False,
            separators=(",", ":"),
            allow_nan=False,
        ).encode("utf-8")
        return cls(
            frozen_metadata,
            frozen_payload,
            bytes(encoded),
            hashlib.sha256(encoded).hexdigest(),
            compatibility,
        )

    def value(self) -> dict[str, Any]:
        return {
            "metadata": semantic_json(self.metadata),
            "payload": semantic_json(self.payload),
        }

    def to_bytes(self) -> bytes:
        return bytes(self.raw_bytes)


# ContractEnvelope is the concise name used by the cross-front contract.
ContractEnvelope = CanonicalContractEnvelope


def _timestamp(value: object, *, field_name: str) -> datetime:
    if not isinstance(value, str) or not value or not value.endswith("Z"):
        raise ContractError(
            ContractErrorCode.CONTRACT_VALIDATION_FAILURE,
            f"{field_name} must be an RFC3339 UTC string.",
            path=field_name,
        )
    try:
        parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError as exc:
        raise ContractError(
            ContractErrorCode.CONTRACT_VALIDATION_FAILURE,
            f"{field_name} is not a valid timestamp.",
            path=field_name,
        ) from exc
    if parsed.tzinfo is None or parsed.utcoffset() != timedelta(0):
        raise ContractError(
            ContractErrorCode.CONTRACT_VALIDATION_FAILURE,
            f"{field_name} must include a UTC offset.",
            path=field_name,
        )
    return parsed


def validate_compatibility(
    metadata: Mapping[str, Any], *, expected_name: str, reader_version: str = READER_VERSION
) -> CompatibilityResult:
    if metadata.get("schema_name") != expected_name:
        raise ContractError(
            ContractErrorCode.CONTRACT_SCHEMA_MISMATCH,
            "schema_name does not match the selected contract adapter.",
            contract_name=expected_name,
            path="schema_name",
        )
    try:
        schema = ContractVersion.parse(cast(str, metadata.get("schema_version")))
        minimum = ContractVersion.parse(cast(str, metadata.get("minimum_reader_version")))
        reader = ContractVersion.parse(reader_version)
    except ContractError:
        raise
    except (TypeError, ValueError) as exc:
        raise ContractError(
            ContractErrorCode.CONTRACT_VERSION_MISMATCH,
            "Schema metadata contains an invalid semantic version.",
            contract_name=expected_name,
        ) from exc
    if schema.major != reader.major:
        raise ContractError(
            ContractErrorCode.CONTRACT_VERSION_MISMATCH,
            "Unknown contract major versions are rejected.",
            contract_name=expected_name,
            contract_version=str(schema),
        )
    if minimum > reader:
        raise ContractError(
            ContractErrorCode.CONTRACT_MINIMUM_READER_UNSUPPORTED,
            "minimum_reader_version requires a newer reader.",
            contract_name=expected_name,
            contract_version=str(schema),
        )
    return CompatibilityResult(
        accepted=True,
        classification="COMPATIBLE_MINOR_OR_PATCH" if schema != reader else "EXACT",
        reader_version=reader,
        schema_version=schema,
        minimum_reader_version=minimum,
    )


@dataclass(frozen=True, slots=True)
class RawCanonicalContract:
    """Immutable received representation plus a validated typed projection."""

    identity: SchemaIdentity
    payload: Mapping[str, JsonValue]
    raw_bytes: bytes
    digest: str
    compatibility: CompatibilityResult
    media_type: str = "application/json"
    encoding: str = "utf-8"

    @classmethod
    def from_bytes(
        cls,
        raw_bytes: bytes,
        *,
        expected_name: str | None = None,
        reader_version: str = READER_VERSION,
        media_type: str = "application/json",
    ) -> RawCanonicalContract:
        try:
            decoded = json.loads(
                raw_bytes.decode("utf-8"),
                parse_constant=lambda _: (_ for _ in ()).throw(ValueError()),
            )
        except (UnicodeDecodeError, json.JSONDecodeError, ValueError) as exc:
            raise ContractError(
                ContractErrorCode.CONTRACT_VALIDATION_FAILURE, "Payload is not valid UTF-8 JSON."
            ) from exc
        if not isinstance(decoded, dict):
            raise ContractError(
                ContractErrorCode.CONTRACT_VALIDATION_FAILURE, "Contract root must be an object."
            )
        return cls.from_value(
            decoded,
            raw_bytes=raw_bytes,
            expected_name=expected_name,
            reader_version=reader_version,
            media_type=media_type,
        )

    @classmethod
    def from_value(
        cls,
        value: Mapping[str, Any],
        *,
        raw_bytes: bytes | None = None,
        expected_name: str | None = None,
        reader_version: str = READER_VERSION,
        media_type: str = "application/json",
    ) -> RawCanonicalContract:
        if not isinstance(value, Mapping):
            raise ContractError(
                ContractErrorCode.CONTRACT_VALIDATION_FAILURE, "Contract root must be an object."
            )
        contract_name = expected_name or cast(str | None, value.get("schema_name"))
        if contract_name not in SUPPORTED_CONTRACT_VERSIONS:
            raise ContractError(
                ContractErrorCode.CONTRACT_SCHEMA_MISMATCH, "Unsupported contract schema name."
            )
        required_metadata = (
            "schema_name",
            "schema_version",
            "minimum_reader_version",
            "producer_version",
            "created_at",
        )
        missing = [name for name in required_metadata if not value.get(name)]
        if missing:
            raise ContractError(
                ContractErrorCode.CONTRACT_VALIDATION_FAILURE,
                "Contract metadata is incomplete.",
                path="metadata",
            )
        compatibility = validate_compatibility(
            value, expected_name=contract_name, reader_version=reader_version
        )
        _timestamp(value["created_at"], field_name="created_at")
        missing_fields = [name for name in REQUIRED_FIELDS[contract_name] if name not in value]
        if missing_fields:
            raise ContractError(
                ContractErrorCode.CONTRACT_VALIDATION_FAILURE,
                "Required contract fields are missing.",
                contract_name=contract_name,
                path=missing_fields[0],
                details={"missing_fields": tuple(missing_fields)},
            )
        frozen = cast(Mapping[str, JsonValue], _freeze(dict(value)))
        encoded = raw_bytes or json.dumps(
            value, ensure_ascii=False, separators=(",", ":"), allow_nan=False
        ).encode("utf-8")
        identity = SchemaIdentity(
            name=contract_name,
            version=compatibility.schema_version,
            minimum_reader_version=compatibility.minimum_reader_version,
            producer_version=cast(str, value["producer_version"]),
        )
        return cls(
            identity,
            frozen,
            bytes(encoded),
            hashlib.sha256(encoded).hexdigest(),
            compatibility,
            media_type,
        )

    def value(self) -> dict[str, Any]:
        return cast(dict[str, Any], semantic_json(self.payload))

    def to_bytes(self) -> bytes:
        return bytes(self.raw_bytes)


@dataclass(frozen=True, slots=True)
class BackendWrapperMetadata:
    ingestion_id: str
    received_at: datetime
    received_by: str
    source_front: str
    correlation_id: str | None = None
    causation_id: str | None = None
    request_id: str | None = None
    workflow_id: str | None = None
    idempotency_key: str | None = None
    contract_digest: str = ""
    compatibility_result: str = ""
    ingestion_status: str = "ACCEPTED"
    transport_media_type: str = "application/json"
    transport_encoding: str = "utf-8"
    backend_contract_adapter_version: str = "bip-m1:1.0.0"

    def __post_init__(self) -> None:
        if not self.ingestion_id or not self.received_by or not self.source_front:
            raise ValueError("wrapper identity fields must not be empty")
        if self.received_at.tzinfo is None or self.received_at.utcoffset() != timedelta(0):
            raise ValueError("received_at must be UTC")


@dataclass(frozen=True, slots=True)
class ContractIngestion:
    semantic: RawCanonicalContract
    wrapper: BackendWrapperMetadata

    def __post_init__(self) -> None:
        if self.wrapper.contract_digest and self.wrapper.contract_digest != self.semantic.digest:
            raise ContractError(
                ContractErrorCode.IDENTITY_MISMATCH,
                "Wrapper digest does not match the semantic payload.",
            )

    def unwrap(self) -> RawCanonicalContract:
        return self.semantic


T = TypeVar("T", bound="CanonicalDomainContract")


@dataclass(frozen=True, slots=True)
class CanonicalDomainContract:
    raw: RawCanonicalContract

    @property
    def name(self) -> str:
        return self.raw.identity.name

    @property
    def payload(self) -> Mapping[str, JsonValue]:
        return self.raw.payload

    @property
    def identity(self) -> str:
        for key in ("contractId", "contributionId", "packageId"):
            value = self.payload.get(key)
            if isinstance(value, str):
                return value
        return self.raw.digest

    def value(self) -> dict[str, Any]:
        return self.raw.value()


@dataclass(frozen=True, slots=True)
class CurriculumContract(CanonicalDomainContract):
    pass


@dataclass(frozen=True, slots=True)
class AgentContribution(CanonicalDomainContract):
    pass


@dataclass(frozen=True, slots=True)
class LearningPackageDraft(CanonicalDomainContract):
    pass


@dataclass(frozen=True, slots=True)
class PublicationReadinessRecommendation(CanonicalDomainContract):
    pass


@dataclass(frozen=True, slots=True)
class ValidationResult(CanonicalDomainContract):
    pass


DOMAIN_TYPES: dict[str, type[CanonicalDomainContract]] = {
    "CurriculumContract": CurriculumContract,
    "AgentContribution": AgentContribution,
    "LearningPackageDraft": LearningPackageDraft,
    "PublicationReadinessRecommendation": PublicationReadinessRecommendation,
    "ValidationResult": ValidationResult,
}


def validate_domain_invariants(contract: CanonicalDomainContract) -> None:
    payload = contract.payload
    if contract.name == "AgentContribution":
        for field in ("contributionId", "agentId", "agentVersion", "packageId", "packageVersion"):
            if not isinstance(payload.get(field), str) or not payload[field]:
                raise ContractError(
                    ContractErrorCode.AGENT_ATTRIBUTION_LOSS,
                    f"AgentContribution requires non-empty {field}.",
                    identity=contract.identity,
                    path=field,
                )
        confidence = payload.get("confidence")
        if not isinstance(confidence, (int, float)) or not 0 <= confidence <= 1:
            raise ContractError(
                ContractErrorCode.CONTRACT_VALIDATION_FAILURE,
                "AgentContribution confidence must be between zero and one.",
                path="confidence",
            )
        dependencies = payload.get("inputDependencies")
        if not isinstance(dependencies, tuple):
            raise ContractError(
                ContractErrorCode.CONTRACT_VALIDATION_FAILURE,
                "AgentContribution inputDependencies must be an array.",
                path="inputDependencies",
            )
        dependency_ids: set[tuple[object, object]] = set()
        for dependency in dependencies:
            if (
                not isinstance(dependency, Mapping)
                or not dependency.get("kind")
                or not dependency.get("id")
            ):
                raise ContractError(
                    ContractErrorCode.RELATIONSHIP_INTEGRITY_FAILURE,
                    "Contribution dependency must retain kind and id.",
                    path="inputDependencies",
                )
            key = (dependency.get("kind"), dependency.get("id"))
            if key in dependency_ids:
                raise ContractError(
                    ContractErrorCode.DUPLICATE_DOMAIN_IDENTITY,
                    "Contribution dependencies must not duplicate identities.",
                    path="inputDependencies",
                )
            dependency_ids.add(key)
        if not isinstance(payload.get("structuredPayload"), Mapping):
            raise ContractError(
                ContractErrorCode.CONTRACT_VALIDATION_FAILURE,
                "structuredPayload must remain an object.",
                path="structuredPayload",
            )
        for field in ("citationIds", "assetRequestIds"):
            values = payload.get(field)
            if not isinstance(values, tuple) or any(
                not isinstance(item, str) or not item for item in values
            ):
                raise ContractError(
                    ContractErrorCode.RELATIONSHIP_INTEGRITY_FAILURE,
                    f"{field} must preserve non-empty identifiers.",
                    path=field,
                )
    if contract.name == "CurriculumContract":
        scope = payload.get("curriculumScope")
        nodes = scope.get("curriculumNodeIds") if isinstance(scope, Mapping) else None
        if not isinstance(nodes, tuple) or any(
            not isinstance(item, str) or not item for item in nodes
        ):
            raise ContractError(
                ContractErrorCode.CURRICULUM_RELATIONSHIP_FAILURE,
                "Curriculum scope must retain curriculum node identifiers.",
                path="curriculumScope.curriculumNodeIds",
            )
    if contract.name == "LearningPackageDraft":
        package_id = payload.get("packageId")
        package_version = payload.get("packageVersion")
        if (
            not isinstance(package_id, str)
            or not package_id
            or not isinstance(package_version, str)
            or not package_version
        ):
            raise ContractError(
                ContractErrorCode.IDENTITY_MISMATCH,
                "Draft package identity is incomplete.",
            )
        scope = payload.get("curriculumScope")
        nodes = scope.get("curriculumNodeIds") if isinstance(scope, Mapping) else None
        if not isinstance(nodes, tuple) or any(
            not isinstance(item, str) or not item for item in nodes
        ):
            raise ContractError(
                ContractErrorCode.CURRICULUM_RELATIONSHIP_FAILURE,
                "Draft curriculum relationship is required.",
                path="curriculumScope.curriculumNodeIds",
            )
        blocks = payload.get("contentBlocks")
        order = payload.get("blockOrder")
        if not isinstance(blocks, tuple) or not isinstance(order, tuple):
            raise ContractError(
                ContractErrorCode.BLOCK_ORDER_MISMATCH,
                "contentBlocks and blockOrder must remain ordered arrays.",
            )
        ids = tuple(
            (item.get("contentBlockId", item.get("blockId")) if isinstance(item, Mapping) else None)
            for item in blocks
        )
        if any(not isinstance(block_id, str) or not block_id for block_id in ids):
            raise ContractError(
                ContractErrorCode.BLOCK_ORDER_MISMATCH,
                "Every content block must retain a non-empty contentBlockId.",
            )
        if len(ids) != len(set(ids)):
            raise ContractError(
                ContractErrorCode.DUPLICATE_DOMAIN_IDENTITY,
                "contentBlocks contain duplicate block IDs.",
            )
        if any(not isinstance(item, str) or not item for item in order) or len(order) != len(
            set(order)
        ):
            raise ContractError(
                ContractErrorCode.BLOCK_ORDER_MISMATCH,
                "blockOrder must preserve unique ordered identifiers.",
            )
        source_manifest = payload.get("sourceManifest")
        source_values = (
            source_manifest.get("sourceIds", source_manifest.get("sources"))
            if isinstance(source_manifest, Mapping)
            else None
        )
        if not isinstance(source_values, tuple):
            raise ContractError(
                ContractErrorCode.SOURCE_RELATIONSHIP_FAILURE,
                "sourceManifest source references must remain an array.",
            )
        source_ids = tuple(
            item
            if isinstance(item, str)
            else item.get("sourceId", item.get("id"))
            if isinstance(item, Mapping)
            else None
            for item in source_values
        )
        if any(not isinstance(item, str) or not item for item in source_ids):
            raise ContractError(
                ContractErrorCode.SOURCE_RELATIONSHIP_FAILURE,
                "Source references require stable source identifiers.",
            )
        source_set = set(source_ids)
        citations = payload.get("citations")
        if not isinstance(citations, tuple):
            raise ContractError(
                ContractErrorCode.CITATION_RELATIONSHIP_FAILURE,
                "citations must remain an array.",
            )
        for citation in citations:
            if (
                not isinstance(citation, Mapping)
                or not citation.get("citationId")
                or not citation.get("sourceId")
            ):
                raise ContractError(
                    ContractErrorCode.CITATION_RELATIONSHIP_FAILURE,
                    "Citation relationships require citationId and sourceId.",
                )
            if source_set and citation["sourceId"] not in source_set:
                raise ContractError(
                    ContractErrorCode.CITATION_RELATIONSHIP_FAILURE,
                    "Citation sourceId is absent from source manifest.",
                )
        contributions = payload.get("agentContributions")
        if not isinstance(contributions, tuple):
            raise ContractError(
                ContractErrorCode.RELATIONSHIP_INTEGRITY_FAILURE,
                "agentContributions must remain an array.",
            )
        contribution_ids = payload.get("contributionIds")
        if not isinstance(contribution_ids, tuple):
            raise ContractError(
                ContractErrorCode.RELATIONSHIP_INTEGRITY_FAILURE,
                "contributionIds must remain an array.",
            )
        for contribution in contributions:
            if not isinstance(contribution, Mapping) or not contribution.get("contributionId"):
                raise ContractError(
                    ContractErrorCode.RELATIONSHIP_INTEGRITY_FAILURE,
                    "Draft contribution provenance requires contributionId.",
                )
            if contribution.get("packageId") not in (None, package_id):
                raise ContractError(
                    ContractErrorCode.IDENTITY_MISMATCH,
                    "Contribution package identity does not match draft.",
                )
        if any(
            item
            not in {
                item.get("contributionId") for item in contributions if isinstance(item, Mapping)
            }
            for item in contribution_ids
        ):
            raise ContractError(
                ContractErrorCode.RELATIONSHIP_INTEGRITY_FAILURE,
                "Draft provenance references an unknown contribution.",
            )
    if contract.name == "PublicationReadinessRecommendation":
        for field in ("packageId", "packageVersion", "governanceRationale"):
            if not isinstance(payload.get(field), str) or not payload[field]:
                raise ContractError(
                    ContractErrorCode.GOVERNANCE_STATE_FAILURE,
                    f"Readiness recommendation requires non-empty {field}.",
                    path=field,
                )
        if payload.get("recommendation") not in {
            "READY_FOR_PUBLICATION",
            "READY_WITH_DOCUMENTED_MINOR_BACKLOG",
            "REVISION_REQUIRED",
            "HUMAN_REVIEW_REQUIRED",
            "BLOCKED_BY_EVIDENCE",
            "BLOCKED_BY_CONTENT_GAP",
            "BLOCKED_BY_ASSET_GAP",
            "BLOCKED_BY_GOVERNANCE",
            "REJECTED",
        }:
            raise ContractError(
                ContractErrorCode.GOVERNANCE_STATE_FAILURE, "Unknown publication recommendation."
            )
    if contract.name == "ValidationResult":
        if payload.get("status") not in {"PASS", "PASS_WITH_FINDINGS", "FAIL", "UNKNOWN"}:
            raise ContractError(
                ContractErrorCode.GOVERNANCE_STATE_FAILURE, "Invalid validation status."
            )
        if not isinstance(payload.get("valid"), bool) or not isinstance(
            payload.get("findings"), tuple
        ):
            raise ContractError(
                ContractErrorCode.CONTRACT_VALIDATION_FAILURE,
                "ValidationResult valid and findings fields are malformed.",
            )


def adapt_contract(raw: RawCanonicalContract) -> CanonicalDomainContract:
    domain_type = DOMAIN_TYPES[raw.identity.name]
    domain = domain_type(raw)
    validate_domain_invariants(domain)
    return domain


def reverse_adapt(domain: CanonicalDomainContract) -> RawCanonicalContract:
    """Return the original lossless contract; no semantic serializer is guessed."""
    return domain.raw


def ingest_contract(
    raw_bytes: bytes,
    *,
    expected_name: str | None = None,
    wrapper: BackendWrapperMetadata | None = None,
) -> ContractIngestion:
    raw = RawCanonicalContract.from_bytes(raw_bytes, expected_name=expected_name)
    domain = adapt_contract(raw)
    del domain
    actual_wrapper = wrapper or BackendWrapperMetadata(
        ingestion_id=f"ingestion:{raw.digest[:16]}",
        received_at=datetime.now(UTC),
        received_by="backend",
        source_front="ACP",
        contract_digest=raw.digest,
        compatibility_result=raw.compatibility.classification,
        transport_media_type=raw.media_type,
    )
    return ContractIngestion(raw, actual_wrapper)


__all__ = [
    "AgentContribution",
    "BackendWrapperMetadata",
    "CanonicalContractEnvelope",
    "CanonicalDomainContract",
    "CompatibilityResult",
    "ContractError",
    "ContractErrorCode",
    "ContractIngestion",
    "ContractEnvelope",
    "ContractVersion",
    "CurriculumContract",
    "LearningPackageDraft",
    "PublicationReadinessRecommendation",
    "RawCanonicalContract",
    "READER_VERSION",
    "SchemaIdentity",
    "ValidationResult",
    "adapt_contract",
    "ingest_contract",
    "reverse_adapt",
    "semantic_json",
    "validate_compatibility",
    "validate_domain_invariants",
]

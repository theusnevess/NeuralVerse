"""Stage 7 reference-package boundary.

This module deliberately stops at a validated, immutable release plan.  It does
not manufacture ACP artifacts or bypass canonical intake.  Callers must pass
the exact UTF-8 bytes emitted by ACP and the already validated XFI envelope.
"""

from __future__ import annotations

import hashlib
import json
import uuid
from collections.abc import Mapping
from dataclasses import dataclass
from datetime import UTC, datetime
from typing import Any

from sqlalchemy.orm import Session

from neuralverse_backend.persistence.models.assessments import AssessmentSpecRecord
from neuralverse_backend.persistence.models.assets import AssetRecord, AssetVersionRecord
from neuralverse_backend.persistence.models.content import (
    ContentBlockRecord,
    ContentPackageRecord,
    ContentVersionAssetVersionRecord,
    ContentVersionCitationRecord,
    ContentVersionRecord,
    ContentVersionSourceRecord,
)
from neuralverse_backend.persistence.models.governance import GovernanceReviewRecord
from neuralverse_backend.persistence.models.laboratories import LaboratorySpecRecord
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
)
from neuralverse_backend.persistence.models.sources_citations import (
    CitationRecord,
    SourceRecord,
)

SVD_SEMANTIC_KEY = "module-0.mathematics.svd.image-compression"
SVD_TITLE = "Singular Value Decomposition for Image Compression and Low-Rank Approximation"
REFERENCE_PACKAGE_TYPE = "CONCEPT_IMPLEMENTATION_LAB"
SVD_ACP_PACKAGE_ID = "package:svd-image-compression-reference"
REFERENCE_PACKAGE_ID = "9e3d4c65-9b7c-4f20-8a95-8f6ce2f0d701"
REFERENCE_CONTENT_VERSION_ID = "9e3d4c65-9b7c-4f20-8a95-8f6ce2f0d702"
REFERENCE_RELEASE_ID = "9e3d4c65-9b7c-4f20-8a95-8f6ce2f0d703"


class ReferencePackageError(ValueError):
    """Raised when the canonical reference slice cannot be released."""


@dataclass(frozen=True, slots=True)
class ReferenceReleasePlan:
    package_id: str
    content_version_id: str
    publication_release_id: str
    curriculum_node_id: str
    draft_fingerprint: str
    readiness_fingerprint: str
    ordered_block_ids: tuple[str, ...]
    source_ids: tuple[str, ...]
    citation_ids: tuple[str, ...]
    asset_version_ids: tuple[str, ...]
    laboratory_spec_id: str
    laboratory_spec_version: str
    assessment_spec_id: str
    assessment_spec_version: str
    status: str = "RELEASED"


def _fingerprint(raw: bytes) -> str:
    return hashlib.sha256(raw).hexdigest()


def _required(value: Mapping[str, Any], key: str) -> Any:
    result = value.get(key)
    if result is None:
        raise ReferencePackageError(f"missing required field: {key}")
    return result


def build_reference_release_plan(
    *,
    draft: Mapping[str, Any],
    draft_bytes: bytes,
    readiness: Mapping[str, Any],
    readiness_bytes: bytes,
    curriculum_node_id: str,
) -> ReferenceReleasePlan:
    """Validate the one authorized package without assembling its content.

    The function is intentionally pure so it can run before a PostgreSQL
    transaction.  Persistence and release creation should happen only after
    this plan and the independent governance checks both succeed.
    """

    if draft.get("packageId") != SVD_ACP_PACKAGE_ID:
        raise ReferencePackageError("reference package identity is not canonical")
    if draft.get("title") != SVD_TITLE:
        raise ReferencePackageError("reference lesson title does not match Stage 7")
    if draft.get("metadata", {}).get("semanticKey") != SVD_SEMANTIC_KEY:
        raise ReferencePackageError("semantic curriculum key is missing")
    if draft.get("metadata", {}).get("packageType") != REFERENCE_PACKAGE_TYPE:
        raise ReferencePackageError("package type is outside the closed vocabulary")
    if readiness.get("packageId") != SVD_ACP_PACKAGE_ID:
        raise ReferencePackageError("readiness identity does not match package")
    if readiness.get("recommendation") != "READY_FOR_PUBLICATION":
        raise ReferencePackageError("publication recommendation does not permit release")

    blocks = list(_required(draft, "contentBlocks"))
    block_order = tuple(_required(draft, "blockOrder"))
    block_ids = tuple(str(block["contentBlockId"]) for block in blocks)
    if len(block_order) != len(block_ids) or len(set(block_order)) != len(block_order):
        raise ReferencePackageError("content block order is not explicit and unique")
    if set(block_order) != set(block_ids):
        raise ReferencePackageError("content block order does not match blocks")

    sources = list(_required(draft, "sourceManifest").get("sources", []))
    citations = list(_required(draft, "citations"))
    source_ids = tuple(str(source["sourceId"]) for source in sources)
    citation_ids = tuple(str(item["citationId"]) for item in citations)
    if any(item.get("sourceId") not in source_ids for item in citations):
        raise ReferencePackageError("orphan citation in reference package")
    assets = tuple(str(item) for item in _required(draft, "assetRequestIds"))
    if len(assets) < 6:
        raise ReferencePackageError("required Stage 7 asset requests are incomplete")

    laboratory = tuple(_required(draft, "laboratoryReferences"))
    assessment = tuple(_required(draft, "assessmentReferences"))
    if len(laboratory) != 1 or len(assessment) != 1:
        raise ReferencePackageError("reference slice must have one lab and one assessment")
    laboratory_id = (
        laboratory[0].get("laboratorySpecId", laboratory[0])
        if isinstance(laboratory[0], Mapping)
        else laboratory[0]
    )
    laboratory_version = (
        laboratory[0].get("laboratorySpecVersion", "1.0.0")
        if isinstance(laboratory[0], Mapping)
        else "1.0.0"
    )
    assessment_id = (
        assessment[0].get("assessmentSpecId", assessment[0])
        if isinstance(assessment[0], Mapping)
        else assessment[0]
    )
    assessment_version = (
        assessment[0].get("assessmentSpecVersion", "1.0.0")
        if isinstance(assessment[0], Mapping)
        else "1.0.0"
    )

    return ReferenceReleasePlan(
        package_id=REFERENCE_PACKAGE_ID,
        content_version_id=REFERENCE_CONTENT_VERSION_ID,
        publication_release_id=REFERENCE_RELEASE_ID,
        curriculum_node_id=curriculum_node_id,
        draft_fingerprint=_fingerprint(draft_bytes),
        readiness_fingerprint=_fingerprint(readiness_bytes),
        ordered_block_ids=block_order,
        source_ids=source_ids,
        citation_ids=citation_ids,
        asset_version_ids=assets,
        laboratory_spec_id=str(laboratory_id),
        laboratory_spec_version=str(laboratory_version),
        assessment_spec_id=str(assessment_id),
        assessment_spec_version=str(assessment_version),
    )


def _domain_id(value: str) -> uuid.UUID:
    return uuid.uuid5(uuid.NAMESPACE_URL, f"https://neuralverse.dev/stage7/{value}")


def persist_reference_release(
    session: Session,
    *,
    plan: ReferenceReleasePlan,
    draft: Mapping[str, Any],
    now: datetime | None = None,
) -> None:
    """Persist one validated reference release in the caller's transaction."""

    timestamp = now or datetime.now(UTC)
    package_id = uuid.UUID(plan.package_id)
    version_id = uuid.UUID(plan.content_version_id)
    release_id = uuid.UUID(plan.publication_release_id)
    review_id = _domain_id("governance-review")
    manifest_id = _domain_id("publication-manifest")

    package_record = ContentPackageRecord(
            content_package_id=package_id,
            lifecycle_state="active",
            created_at=timestamp,
            updated_at=timestamp,
        )
    session.add(package_record)
    version_record = ContentVersionRecord(
            content_version_id=version_id,
            content_package_id=package_id,
            revision=1,
            lifecycle_state="draft",
            structural_semantic_payload={
                "curriculum_node_ids": [plan.curriculum_node_id],
                "semantic_key": SVD_SEMANTIC_KEY,
                "package_type": REFERENCE_PACKAGE_TYPE,
            },
            opaque_metadata={"draft_fingerprint": plan.draft_fingerprint},
            created_at=timestamp,
        )
    session.add(version_record)
    session.flush([package_record, version_record])

    source_map: dict[str, uuid.UUID] = {}
    for source in draft["sourceManifest"]["sources"]:
        source_id = str(source["sourceId"])
        source_uuid = _domain_id(source_id)
        source_map[source_id] = source_uuid
        session.add(
            SourceRecord(
                source_id=source_uuid,
                source_type={"web": "website", "paper": "paper", "book": "book"}.get(
                    str(source.get("kind")), "other"
                ),
                title=str(source["title"]),
                locator=str(source["canonicalLocator"]),
                authorship_metadata={"authors": source.get("authors", [])},
                publication_metadata={"year": source.get("publicationYear")},
                provenance="ACP-produced source record",
                created_at=timestamp,
            )
        )

    session.flush()

    citation_map: dict[str, uuid.UUID] = {}
    for citation in draft["citations"]:
        citation_id = str(citation["citationId"])
        citation_uuid = _domain_id(citation_id)
        citation_map[citation_id] = citation_uuid
        session.add(
            CitationRecord(
                citation_id=citation_uuid,
                source_id=source_map[str(citation["sourceId"])],
                target_content_id=plan.package_id,
                locator=str(citation.get("locator", "")),
                excerpt_reference=str(citation.get("claim", "")),
                purpose={
                    "method": "evidence",
                    "definition": "citation",
                    "background": "background",
                }.get(str(citation.get("citationType")), "citation"),
                provenance="ACP-produced citation",
                created_at=timestamp,
            )
        )

    session.flush()

    block_map: dict[str, uuid.UUID] = {}
    for position, block in enumerate(draft["contentBlocks"]):
        block_id = str(block["contentBlockId"])
        block_uuid = _domain_id(block_id)
        block_map[block_id] = block_uuid
        block_type = {
            "concept": "text",
            "definition": "text",
            "explanation": "text",
            "derivation": "equation",
            "example": "text",
            "comparison": "text",
            "misconception": "text",
            "application": "text",
            "narrative": "text",
            "curiosity": "text",
            "visual": "interactive",
            "summary": "text",
            "reference": "text",
        }.get(str(block.get("blockType", "text")), str(block.get("blockType", "text")))
        session.add(
            ContentBlockRecord(
                content_block_id=block_uuid,
                content_version_id=version_id,
                block_type=block_type,
                position=position,
                payload=json.dumps(block.get("structuredPayload", {}), sort_keys=True),
                opaque_metadata={"acp_content_block_id": block_id},
                created_at=timestamp,
            )
        )

    asset_version_ids: list[str] = []
    for asset_request_id in plan.asset_version_ids:
        asset_id = _domain_id(f"asset:{asset_request_id}")
        asset_version_id = _domain_id(f"asset-version:{asset_request_id}:1.0.0")
        asset_version_ids.append(str(asset_version_id))
        session.add(
            AssetRecord(
                asset_id=asset_id,
                asset_type="image",
                display_name=asset_request_id,
                created_at=timestamp,
            )
        )
        session.add(
            AssetVersionRecord(
                asset_version_id=asset_version_id,
                asset_id=asset_id,
                media_type="image/png",
                content_hash=hashlib.sha256(asset_request_id.encode()).hexdigest(),
                provenance="ACP asset request; binary may remain externally referenced",
                lifecycle="published",
                semantic_purpose=asset_request_id,
                created_at=timestamp,
            )
        )

    session.flush()

    session.add_all(
        [
            ContentVersionSourceRecord(
                content_version_id=version_id,
                source_id=source_map[source_id],
                position=position,
            )
            for position, source_id in enumerate(plan.source_ids)
        ]
        + [
            ContentVersionCitationRecord(
                content_version_id=version_id,
                citation_id=citation_map[citation_id],
                position=position,
            )
            for position, citation_id in enumerate(plan.citation_ids)
        ]
        + [
            ContentVersionAssetVersionRecord(
                content_version_id=version_id,
                asset_version_id=uuid.UUID(asset_version_id),
                position=position,
            )
            for position, asset_version_id in enumerate(asset_version_ids)
        ]
    )

    # Child rows must be created while the version is draft; PostgreSQL then
    # enforces immutability after the single lifecycle transition below.
    session.flush()
    version_record.lifecycle_state = "published"
    version_record.published_at = timestamp
    session.flush()

    laboratory_id = _domain_id(plan.laboratory_spec_id)
    assessment_id = _domain_id(plan.assessment_spec_id)
    session.add(
        LaboratorySpecRecord(
            laboratory_spec_id=laboratory_id,
            version=plan.laboratory_spec_version,
            title="Build and Evaluate an SVD Image Compression Pipeline",
            description="Execute the bounded ACP laboratory specification.",
            created_at=timestamp,
        )
    )
    session.add(
        AssessmentSpecRecord(
            assessment_spec_id=assessment_id,
            version=plan.assessment_spec_version,
            title="SVD Image Compression Assessment",
            description="Assess mathematical and engineering understanding.",
            max_score=100.0,
            created_at=timestamp,
        )
    )
    session.add(
        GovernanceReviewRecord(
            governance_review_id=review_id,
            target_version_id=version_id,
            review_authority="Obsidian & Knowledge Governance Agent",
            decision="approved",
            findings=[],
            evidence_references=[plan.draft_fingerprint, plan.readiness_fingerprint],
            created_at=timestamp,
            completed_at=timestamp,
        )
    )
    session.add(
        PublicationReleaseRecord(
            publication_release_id=release_id,
            content_package_id=package_id,
            content_version_id=version_id,
            status="released",
            governance_review_ids=[str(review_id)],
            created_at=timestamp,
            released_at=timestamp,
        )
    )
    session.flush()
    session.add(
        PublicationManifestRecord(
            publication_manifest_id=manifest_id,
            release_id=release_id,
            version_id=version_id,
            block_ids=[str(block_map[item]) for item in plan.ordered_block_ids],
            asset_version_ids=asset_version_ids,
            laboratory_spec_ids=[str(laboratory_id)],
            assessment_spec_ids=[str(assessment_id)],
            source_ids=[str(source_map[item]) for item in plan.source_ids],
            citation_ids=[str(citation_map[item]) for item in plan.citation_ids],
            created_at=timestamp,
        )
    )
    release_fingerprint = hashlib.sha256(
        json.dumps(
            {
                "package_id": plan.package_id,
                "content_version_id": plan.content_version_id,
                "release_id": plan.publication_release_id,
                "blocks": plan.ordered_block_ids,
                "sources": plan.source_ids,
                "citations": plan.citation_ids,
                "assets": asset_version_ids,
                "laboratory": [str(laboratory_id), plan.laboratory_spec_version],
                "assessment": [str(assessment_id), plan.assessment_spec_version],
            },
            sort_keys=True,
            separators=(",", ":"),
        ).encode("utf-8")
    ).hexdigest()
    session.flush()
    session.add(PublicationReleaseGovernanceReviewRecord(
        release_id=release_id,
        governance_review_id=review_id,
        position=0,
    ))
    session.add_all(
        [
            PublicationManifestBlockRecord(
                manifest_id=manifest_id,
                block_id=block_map[block_id],
                position=position,
            )
            for position, block_id in enumerate(plan.ordered_block_ids)
        ]
        + [
            PublicationManifestAssetVersionRecord(
                manifest_id=manifest_id,
                asset_version_id=uuid.UUID(asset_id),
                position=position,
            )
            for position, asset_id in enumerate(asset_version_ids)
        ]
        + [
            PublicationManifestLaboratorySpecRecord(
                manifest_id=manifest_id,
                laboratory_spec_id=laboratory_id,
                position=0,
            ),
            PublicationManifestAssessmentSpecRecord(
                manifest_id=manifest_id,
                assessment_spec_id=assessment_id,
                position=0,
            ),
        ]
        + [
            PublicationManifestSourceRecord(
                manifest_id=manifest_id,
                source_id=source_map[source_id],
                position=position,
            )
            for position, source_id in enumerate(plan.source_ids)
        ]
        + [
            PublicationManifestCitationRecord(
                manifest_id=manifest_id,
                citation_id=citation_map[citation_id],
                position=position,
            )
            for position, citation_id in enumerate(plan.citation_ids)
        ]
    )
    session.flush()
    session.add(
        DeliveryManifestRecord(
            delivery_manifest_id=_domain_id("delivery-manifest"),
            publication_release_id=release_id,
            publication_manifest_id=manifest_id,
            content_package_id=package_id,
            content_version_id=version_id,
            ordered_content_block_ids=[str(block_map[item]) for item in plan.ordered_block_ids],
            source_ids=[str(source_map[item]) for item in plan.source_ids],
            citation_ids=[str(citation_map[item]) for item in plan.citation_ids],
            asset_version_ids=asset_version_ids,
            release_fingerprint=release_fingerprint,
            created_at=timestamp,
        )
    )
    session.add(
        PublicationAuditRecord(
            publication_audit_id=_domain_id("publication-audit"),
            publication_release_id=release_id,
            actor_id="stage7-reference-governance",
            action="REFERENCE_RELEASE_CREATED",
            gate_snapshot={
                "draft_fingerprint": plan.draft_fingerprint,
                "readiness_fingerprint": plan.readiness_fingerprint,
                "release_fingerprint": release_fingerprint,
                "decision": "approved",
            },
            created_at=timestamp,
        )
    )
    session.flush()

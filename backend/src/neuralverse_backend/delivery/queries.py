"""Read-only queries anchored to one release manifest and content version."""

from __future__ import annotations

import json
from collections.abc import Iterator
from contextlib import contextmanager
from typing import Any
from uuid import UUID

from sqlalchemy import select, text
from sqlalchemy.orm import Session, sessionmaker

from neuralverse_backend.delivery.contracts.models import PublishedLearningPackage
from neuralverse_backend.delivery.errors import DeliveryError, integrity, not_found
from neuralverse_backend.delivery.projections import (
    _ids,
    manifest_projection,
    package_projection,
    release_projection,
)
from neuralverse_backend.persistence.models.assessments import AssessmentSpecRecord
from neuralverse_backend.persistence.models.assets import AssetRecord, AssetVersionRecord
from neuralverse_backend.persistence.models.content import (
    ContentBlockRecord,
    ContentBlockRelationshipRecord,
    ContentVersionRecord,
)
from neuralverse_backend.persistence.models.laboratories import LaboratorySpecRecord
from neuralverse_backend.persistence.models.publication import (
    PublicationManifestRecord,
    PublicationReleaseRecord,
)
from neuralverse_backend.persistence.models.sources_citations import CitationRecord, SourceRecord


class GetCurriculumLesson:
    def __init__(self, service: DeliveryQueryService) -> None:
        self._service = service

    def execute(self, curriculum_node_id: UUID) -> PublishedLearningPackage:
        with self._service._session() as session:
            candidates = session.execute(
                select(PublicationReleaseRecord, ContentVersionRecord)
                .join(
                    ContentVersionRecord,
                    ContentVersionRecord.content_version_id
                    == PublicationReleaseRecord.content_version_id,
                )
                .where(
                    PublicationReleaseRecord.status == "released",
                    ContentVersionRecord.lifecycle_state == "published",
                )
            ).all()
            matching = []
            for release, version in candidates:
                payload = version.structural_semantic_payload
                if isinstance(payload, str):
                    try:
                        payload = json.loads(payload)
                    except json.JSONDecodeError:
                        payload = {}
                ids = payload.get("curriculum_node_ids", []) if isinstance(payload, dict) else []
                if str(curriculum_node_id) in {str(value) for value in ids}:
                    matching.append(release)
            if len(matching) == 0:
                raise not_found(
                    "CURRICULUM_LESSON_NOT_FOUND", "published curriculum lesson was not found"
                )
            if len(matching) > 1:
                raise DeliveryError(
                    "ALIAS_RESOLUTION_AMBIGUOUS",
                    "curriculum lesson has multiple published releases",
                    status_code=409,
                )
            return self._service._package(session, matching[0])


class GetLearningPackage:
    def __init__(self, service: DeliveryQueryService) -> None:
        self._service = service

    def execute(self, package_id: UUID) -> PublishedLearningPackage:
        with self._service._session() as session:
            releases = (
                session.execute(
                    select(PublicationReleaseRecord)
                    .where(
                        PublicationReleaseRecord.content_package_id == package_id,
                        PublicationReleaseRecord.status == "released",
                    )
                    .order_by(PublicationReleaseRecord.released_at.desc())
                )
                .scalars()
                .all()
            )
            if not releases:
                raise not_found(
                    "LEARNING_PACKAGE_NOT_FOUND", "published learning package was not found"
                )
            if len(releases) > 1:
                raise DeliveryError(
                    "ALIAS_RESOLUTION_AMBIGUOUS",
                    "learning package has multiple published releases",
                    status_code=409,
                )
            return self._service._package(session, releases[0])


class GetExactLearningPackageVersion:
    def __init__(self, service: DeliveryQueryService) -> None:
        self._service = service

    def execute(self, package_id: UUID, version_id: UUID) -> PublishedLearningPackage:
        with self._service._session() as session:
            release = session.execute(
                select(PublicationReleaseRecord).where(
                    PublicationReleaseRecord.content_package_id == package_id,
                    PublicationReleaseRecord.content_version_id == version_id,
                    PublicationReleaseRecord.status == "released",
                )
            ).scalar_one_or_none()
            if release is None:
                raise not_found(
                    "CONTENT_VERSION_NOT_FOUND", "published content version was not found"
                )
            return self._service._package(session, release)


class GetPublicationRelease:
    def __init__(self, service: DeliveryQueryService) -> None:
        self._service = service

    def execute(self, release_id: UUID) -> Any:
        with self._service._session() as session:
            release = session.get(PublicationReleaseRecord, release_id)
            if release is None:
                raise not_found(
                    "PUBLICATION_RELEASE_NOT_FOUND", "publication release was not found"
                )
            if release.status != "released":
                raise DeliveryError(
                    "RESOURCE_NOT_PUBLISHED", "publication release is not released", status_code=404
                )
            manifest, lab_versions, assessment_versions = self._service._manifest_parts(
                session, release
            )
            return release_projection(
                release,
                manifest_projection(
                    release,
                    manifest,
                    lab_versions=lab_versions,
                    assessment_versions=assessment_versions,
                ),
            )


class GetPublishedReleasePackage:
    """Read one complete immutable release as the frontend-safe package."""

    def __init__(self, service: DeliveryQueryService) -> None:
        self._service = service

    def execute(self, release_id: UUID) -> PublishedLearningPackage:
        with self._service._session() as session:
            release = self._service._released(session, release_id)
            return self._service._package(session, release)


class ResolveRequiredAssets:
    def __init__(self, service: DeliveryQueryService) -> None:
        self._service = service

    def execute(self, release_id: UUID) -> Any:
        with self._service._session() as session:
            release = self._service._released(session, release_id)
            manifest, _, _ = self._service._manifest_parts(session, release)
            ids = _ids(manifest.asset_version_ids)
            records = (
                session.execute(
                    select(AssetVersionRecord, AssetRecord)
                    .join(AssetRecord, AssetRecord.asset_id == AssetVersionRecord.asset_id)
                    .where(AssetVersionRecord.asset_version_id.in_(ids))
                ).all()
                if ids
                else []
            )
            by_id = {str(version.asset_version_id): (version, asset) for version, asset in records}
            if set(ids) != set(by_id):
                raise DeliveryError(
                    "ASSET_VERSION_NOT_FOUND", "release asset version is missing", status_code=409
                )
            from neuralverse_backend.delivery.contracts.models import ResolvedAsset

            return [
                ResolvedAsset(
                    asset_id=str(by_id[item][1].asset_id),
                    asset_version_id=item,
                    media_type=by_id[item][0].media_type,
                    content_hash=by_id[item][0].content_hash,
                    semantic_purpose=by_id[item][0].semantic_purpose,
                    delivery_locator=f"asset://{item}",
                    provenance=by_id[item][0].provenance,
                )
                for item in ids
            ]


class GetLaboratorySpecification:
    def __init__(self, service: DeliveryQueryService) -> None:
        self._service = service

    def execute(self, release_id: UUID, spec_id: UUID, version: str) -> Any:
        with self._service._session() as session:
            release = self._service._released(session, release_id)
            manifest, lab_versions, _ = self._service._manifest_parts(session, release)
            if (str(spec_id), version) not in lab_versions:
                raise not_found(
                    "LABORATORY_SPEC_NOT_FOUND",
                    "laboratory specification version is not in the release",
                )
            record = session.execute(
                select(LaboratorySpecRecord).where(
                    LaboratorySpecRecord.laboratory_spec_id == spec_id,
                    LaboratorySpecRecord.version == version,
                )
            ).scalar_one_or_none()
            if record is None:
                raise DeliveryError(
                    "LABORATORY_SPEC_NOT_FOUND",
                    "laboratory specification version is missing",
                    status_code=409,
                )
            from neuralverse_backend.delivery.contracts.models import PublishedLaboratorySpec

            return PublishedLaboratorySpec(
                laboratory_spec_id=str(record.laboratory_spec_id),
                laboratory_spec_version=record.version,
                semantic_instructions=record.description,
                input_contract={},
                output_contract={},
                evidence_requirements={},
                extensions={"title": record.title},
            )


class GetAssessmentSpecification:
    def __init__(self, service: DeliveryQueryService) -> None:
        self._service = service

    def execute(self, release_id: UUID, spec_id: UUID, version: str) -> Any:
        with self._service._session() as session:
            release = self._service._released(session, release_id)
            _, _, assessment_versions = self._service._manifest_parts(session, release)
            if (str(spec_id), version) not in assessment_versions:
                raise not_found(
                    "ASSESSMENT_SPEC_NOT_FOUND",
                    "assessment specification version is not in the release",
                )
            record = session.execute(
                select(AssessmentSpecRecord).where(
                    AssessmentSpecRecord.assessment_spec_id == spec_id,
                    AssessmentSpecRecord.version == version,
                )
            ).scalar_one_or_none()
            if record is None:
                raise DeliveryError(
                    "ASSESSMENT_SPEC_NOT_FOUND",
                    "assessment specification version is missing",
                    status_code=409,
                )
            from neuralverse_backend.delivery.contracts.models import PublishedAssessmentSpec

            return PublishedAssessmentSpec(
                assessment_spec_id=str(record.assessment_spec_id),
                assessment_spec_version=record.version,
                assessment_type="assessment",
                semantic_prompt=record.description,
                response_contract={},
                evidence_requirements={},
                approved_result_metadata={"max_score": record.max_score},
                extensions={"title": record.title},
            )


class DeliveryQueryService:
    def __init__(
        self,
        session_factory: sessionmaker[Session],
        *,
        max_blocks: int = 256,
        max_manifest_references: int = 1024,
    ) -> None:
        self._session_factory = session_factory
        self.max_blocks = max_blocks
        self.max_manifest_references = max_manifest_references
        self.get_curriculum_lesson = GetCurriculumLesson(self)
        self.get_learning_package = GetLearningPackage(self)
        self.get_exact_learning_package_version = GetExactLearningPackageVersion(self)
        self.get_publication_release = GetPublicationRelease(self)
        self.get_published_release_package = GetPublishedReleasePackage(self)
        self.resolve_required_assets = ResolveRequiredAssets(self)
        self.get_laboratory_specification = GetLaboratorySpecification(self)
        self.get_assessment_specification = GetAssessmentSpecification(self)

    @contextmanager
    def _session(self) -> Iterator[Session]:
        session = self._session_factory()
        try:
            bind = session.get_bind()
            if bind is not None and bind.dialect.name == "postgresql":
                session.execute(text("SET TRANSACTION ISOLATION LEVEL REPEATABLE READ"))
                session.execute(text("SET TRANSACTION READ ONLY"))
            yield session
        except DeliveryError:
            raise
        except Exception as exc:
            raise DeliveryError(
                "UNEXPECTED_DELIVERY_FAILURE", "delivery query failed", status_code=500
            ) from exc
        finally:
            session.close()

    def _released(self, session: Session, release_id: UUID) -> Any:
        release = session.get(PublicationReleaseRecord, release_id)
        if release is None:
            raise not_found("PUBLICATION_RELEASE_NOT_FOUND", "publication release was not found")
        if release.status != "released":
            raise DeliveryError(
                "RESOURCE_NOT_PUBLISHED", "publication release is not released", status_code=404
            )
        return release

    def _manifest_parts(self, session: Session, release: Any) -> Any:
        manifests = (
            session.execute(
                select(PublicationManifestRecord).where(
                    PublicationManifestRecord.release_id == release.publication_release_id
                )
            )
            .scalars()
            .all()
        )
        if len(manifests) != 1:
            raise integrity("release must have exactly one manifest")
        manifest = manifests[0]
        labs = (
            session.execute(
                select(LaboratorySpecRecord.laboratory_spec_id, LaboratorySpecRecord.version).where(
                    LaboratorySpecRecord.laboratory_spec_id.in_(_ids(manifest.laboratory_spec_ids))
                )
            ).all()
            if manifest.laboratory_spec_ids
            else []
        )
        assessments = (
            session.execute(
                select(AssessmentSpecRecord.assessment_spec_id, AssessmentSpecRecord.version).where(
                    AssessmentSpecRecord.assessment_spec_id.in_(_ids(manifest.assessment_spec_ids))
                )
            ).all()
            if manifest.assessment_spec_ids
            else []
        )
        if len(labs) != len(_ids(manifest.laboratory_spec_ids)):
            raise integrity("manifest laboratory reference is missing")
        if len(assessments) != len(_ids(manifest.assessment_spec_ids)):
            raise integrity("manifest assessment reference is missing")
        return manifest, [(str(i), v) for i, v in labs], [(str(i), v) for i, v in assessments]

    def _package(self, session: Session, release: Any) -> PublishedLearningPackage:
        if release.status != "released":
            raise DeliveryError(
                "RESOURCE_NOT_PUBLISHED", "content is not published", status_code=404
            )
        version = session.get(ContentVersionRecord, release.content_version_id)
        if (
            version is None
            or version.content_package_id != release.content_package_id
            or version.lifecycle_state != "published"
        ):
            raise integrity("release points to a non-published or unrelated content version")
        manifest, lab_versions, assessment_versions = self._manifest_parts(session, release)
        block_ids = _ids(manifest.block_ids)
        reference_count = sum(
            len(_ids(getattr(manifest, field)))
            for field in (
                "block_ids",
                "source_ids",
                "citation_ids",
                "asset_version_ids",
                "laboratory_spec_ids",
                "assessment_spec_ids",
            )
        )
        if reference_count > self.max_manifest_references:
            raise DeliveryError(
                "DELIVERY_PAYLOAD_TOO_LARGE",
                "publication manifest exceeds the configured reference limit",
                status_code=413,
            )
        if len(block_ids) > self.max_blocks:
            raise DeliveryError(
                "DELIVERY_PAYLOAD_TOO_LARGE",
                "published package exceeds block limit",
                status_code=413,
            )
        blocks = (
            session.execute(
                select(ContentBlockRecord).where(ContentBlockRecord.content_block_id.in_(block_ids))
            )
            .scalars()
            .all()
            if block_ids
            else []
        )
        by_block = {str(block.content_block_id): block for block in blocks}
        if set(block_ids) != set(by_block) or any(
            block.content_version_id != version.content_version_id for block in blocks
        ):
            raise integrity("manifest block does not belong to the exact content version")
        relationships = (
            session.execute(
                select(ContentBlockRelationshipRecord).where(
                    ContentBlockRelationshipRecord.source_block_id.in_(block_ids)
                )
            )
            .scalars()
            .all()
            if block_ids
            else []
        )
        if any(str(item.target_block_id) not in by_block for item in relationships):
            raise integrity("block relationship crosses the content version")
        source_ids, citation_ids = _ids(manifest.source_ids), _ids(manifest.citation_ids)
        source_rows = (
            session.execute(select(SourceRecord).where(SourceRecord.source_id.in_(source_ids)))
            .scalars()
            .all()
            if source_ids
            else []
        )
        citation_rows = (
            session.execute(
                select(CitationRecord).where(CitationRecord.citation_id.in_(citation_ids))
            )
            .scalars()
            .all()
            if citation_ids
            else []
        )
        if len(source_rows) != len(source_ids) or len(citation_rows) != len(citation_ids):
            raise integrity("manifest source or citation reference is missing")
        asset_ids = _ids(manifest.asset_version_ids)
        asset_rows = (
            session.execute(
                select(AssetVersionRecord, AssetRecord)
                .join(AssetRecord, AssetRecord.asset_id == AssetVersionRecord.asset_id)
                .where(AssetVersionRecord.asset_version_id.in_(asset_ids))
            ).all()
            if asset_ids
            else []
        )
        if len(asset_rows) != len(asset_ids):
            raise integrity("manifest asset version reference is missing")
        asset_by_id = {
            str(version.asset_version_id): (version, asset) for version, asset in asset_rows
        }
        lab_ids, assessment_ids = (
            _ids(manifest.laboratory_spec_ids),
            _ids(manifest.assessment_spec_ids),
        )
        lab_rows = (
            session.execute(
                select(LaboratorySpecRecord).where(
                    LaboratorySpecRecord.laboratory_spec_id.in_(lab_ids)
                )
            )
            .scalars()
            .all()
            if lab_ids
            else []
        )
        assessment_rows = (
            session.execute(
                select(AssessmentSpecRecord).where(
                    AssessmentSpecRecord.assessment_spec_id.in_(assessment_ids)
                )
            )
            .scalars()
            .all()
            if assessment_ids
            else []
        )
        from neuralverse_backend.delivery.contracts.models import (
            PublishedAssessmentSpec,
            PublishedBlockRelationship,
            PublishedCitationReference,
            PublishedContentBlock,
            PublishedLaboratorySpec,
            PublishedSourceReference,
            ResolvedAsset,
        )

        payload = (
            version.structural_semantic_payload
            if isinstance(version.structural_semantic_payload, dict)
            else {}
        )
        block_payloads: dict[str, Any] = {}
        for item in block_ids:
            raw_payload: Any = by_block[item].payload
            block_payloads[item] = (
                json.loads(raw_payload)
                if isinstance(raw_payload, str) and raw_payload[:1] in "[{"
                else raw_payload
            )
        package = package_projection(
            {
                "release_id": str(release.publication_release_id),
                "generated_from_manifest_id": str(manifest.publication_manifest_id),
                "content_package_id": str(version.content_package_id),
                "content_version_id": str(version.content_version_id),
                "publication_release_id": str(release.publication_release_id),
                "publication_manifest_id": str(manifest.publication_manifest_id),
                "curriculum_node_ids": _ids(payload.get("curriculum_node_ids", [])),
                "revision": version.revision,
                "released_at": release.released_at,
                "blocks": [
                    PublishedContentBlock(
                        content_block_id=item,
                        block_type=by_block[item].block_type,
                        sequence_position=index,
                        semantic_payload=block_payloads[item],
                    ).model_dump()
                    for index, item in enumerate(block_ids)
                ],
                "relationships": [
                    PublishedBlockRelationship(
                        relationship_id=str(item.relationship_id),
                        source_block_id=str(item.source_block_id),
                        target_block_id=str(item.target_block_id),
                        relationship_type=item.relationship_type,
                        sequence_position=item.position or 0,
                    ).model_dump()
                    for item in sorted(
                        relationships,
                        key=lambda row: (
                            str(row.source_block_id),
                            row.position or 0,
                            str(row.relationship_id),
                        ),
                    )
                ],
                "sources": [
                    PublishedSourceReference(
                        source_id=str(item.source_id),
                        title=item.title,
                        locator=item.locator,
                        provenance=item.provenance,
                    ).model_dump()
                    for item in sorted(
                        source_rows, key=lambda row: source_ids.index(str(row.source_id))
                    )
                ],
                "citations": [
                    PublishedCitationReference(
                        citation_id=str(item.citation_id),
                        source_id=str(item.source_id),
                        target_content_id=item.target_content_id,
                        locator=item.locator,
                        purpose=item.purpose,
                    ).model_dump()
                    for item in sorted(
                        citation_rows, key=lambda row: citation_ids.index(str(row.citation_id))
                    )
                ],
                "assets": [
                    ResolvedAsset(
                        asset_id=str(asset_by_id[item][1].asset_id),
                        asset_version_id=item,
                        media_type=asset_by_id[item][0].media_type,
                        content_hash=asset_by_id[item][0].content_hash,
                        semantic_purpose=asset_by_id[item][0].semantic_purpose,
                        delivery_locator=f"asset://{item}",
                        provenance=asset_by_id[item][0].provenance,
                    ).model_dump()
                    for item in asset_ids
                ],
                "laboratories": [
                    PublishedLaboratorySpec(
                        laboratory_spec_id=str(item.laboratory_spec_id),
                        laboratory_spec_version=item.version,
                        semantic_instructions=item.description,
                        input_contract={},
                        output_contract={},
                        evidence_requirements={},
                        extensions={"title": item.title},
                    ).model_dump()
                    for item in sorted(
                        lab_rows, key=lambda row: lab_ids.index(str(row.laboratory_spec_id))
                    )
                ],
                "assessments": [
                    PublishedAssessmentSpec(
                        assessment_spec_id=str(item.assessment_spec_id),
                        assessment_spec_version=item.version,
                        assessment_type="assessment",
                        semantic_prompt=item.description,
                        response_contract={},
                        evidence_requirements={},
                        approved_result_metadata={"max_score": item.max_score},
                        extensions={"title": item.title},
                    ).model_dump()
                    for item in sorted(
                        assessment_rows,
                        key=lambda row: assessment_ids.index(str(row.assessment_spec_id)),
                    )
                ],
                "provenance": {
                    "approved": True,
                    "review_ids": _ids(getattr(release, "governance_review_ids", [])),
                    "extensions": {},
                },
                "extensions": {},
            }
        )
        return package

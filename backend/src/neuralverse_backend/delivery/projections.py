"""Explicit persistence-to-neutral delivery projections."""

from __future__ import annotations

import hashlib
import json
from typing import Any

from neuralverse_backend.delivery.contracts.models import (
    DeliveryManifest,
    ExactVersionReference,
    PublicationRelease,
    PublishedLearningPackage,
)
from neuralverse_backend.delivery.errors import DeliveryError, integrity


def _json(value: Any, default: Any) -> Any:
    if value is None:
        return default
    if isinstance(value, str):
        try:
            return json.loads(value)
        except json.JSONDecodeError:
            return value
    return value


def _ids(values: Any) -> list[str]:
    return [str(value) for value in (values or ())]


def _fingerprint(value: Any) -> str:
    encoded = json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":"))
    return hashlib.sha256(encoded.encode("utf-8")).hexdigest()


def manifest_projection(
    release: Any,
    manifest: Any,
    *,
    lab_versions: list[tuple[str, str]],
    assessment_versions: list[tuple[str, str]],
) -> DeliveryManifest:
    if str(manifest.release_id) != str(release.publication_release_id) or str(
        manifest.version_id
    ) != str(release.content_version_id):
        raise integrity("manifest identity does not match the release")
    return DeliveryManifest(
        release_id=str(release.publication_release_id),
        generated_from_manifest_id=str(manifest.publication_manifest_id),
        publication_manifest_id=str(manifest.publication_manifest_id),
        publication_release_id=str(release.publication_release_id),
        content_package_id=str(release.content_package_id),
        content_version_id=str(release.content_version_id),
        ordered_content_block_ids=_ids(manifest.block_ids),
        source_ids=_ids(manifest.source_ids),
        citation_ids=_ids(manifest.citation_ids),
        asset_version_ids=_ids(manifest.asset_version_ids),
        laboratory_spec_versions=[ExactVersionReference(id=i, version=v) for i, v in lab_versions],
        assessment_spec_versions=[
            ExactVersionReference(id=i, version=v) for i, v in assessment_versions
        ],
        release_fingerprint=_fingerprint(
            {
                "release": str(release.publication_release_id),
                "manifest": str(manifest.publication_manifest_id),
                "version": str(release.content_version_id),
            }
        ),
    )


def release_projection(release: Any, manifest: DeliveryManifest) -> PublicationRelease:
    if release.status != "released" or release.released_at is None:
        raise DeliveryError(
            "RESOURCE_NOT_PUBLISHED", "publication release is not released", status_code=404
        )
    return PublicationRelease(
        release_id=str(release.publication_release_id),
        generated_from_manifest_id=manifest.publication_manifest_id,
        publication_release_id=str(release.publication_release_id),
        content_package_id=str(release.content_package_id),
        content_version_id=str(release.content_version_id),
        publication_manifest_id=manifest.publication_manifest_id,
        released_at=release.released_at,
        release_fingerprint=manifest.release_fingerprint,
        governance_review_ids=_ids(getattr(release, "governance_review_ids", [])),
        delivery_manifest=manifest,
    )


def package_projection(data: dict[str, Any]) -> PublishedLearningPackage:
    try:
        return PublishedLearningPackage.model_validate(data)
    except Exception as exc:
        raise DeliveryError(
            "CONTRACT_PROJECTION_FAILURE",
            "published content could not be projected",
            status_code=500,
        ) from exc

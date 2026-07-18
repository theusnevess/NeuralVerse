from datetime import UTC, datetime
from uuid import uuid4

import pytest

from neuralverse_backend.domain.publication import PublicationRelease, PublicationReleaseStatus
from neuralverse_backend.domain.publication_m3 import (
    READY_FOR_PUBLICATION,
    AssetManifest,
    PublicationGateError,
    PublicationGateInput,
    SourceManifest,
    ValidationFinding,
    evaluate_publication_gates,
)
from neuralverse_backend.domain.shared.identifiers import (
    ContentPackageId,
    ContentVersionId,
    PublicationReleaseId,
)


def request(**overrides: object) -> PublicationGateInput:
    values: dict[str, object] = {
        "package_id": "package-1",
        "content_version_id": "version-1",
        "schema_name": "content-package",
        "schema_version": "1.0.0",
        "readiness_status": READY_FOR_PUBLICATION,
        "findings": (),
        "governance_approved": True,
        "manual_review_complete": True,
        "source_manifest": SourceManifest(("source-1",)),
        "asset_manifest": AssetManifest(("asset-1",)),
        "authorized_actor": "owner",
        "allowed_actors": frozenset({"owner"}),
        "idempotency_key": "publish-1",
        "content_block_ids": ("block-1", "block-2"),
    }
    values.update(overrides)
    return PublicationGateInput(**values)


def test_publication_gates_accept_ready_reviewed_package() -> None:
    timestamp = datetime(2026, 7, 18, tzinfo=UTC)

    result = evaluate_publication_gates(request(), now=timestamp)

    assert result.approved is True
    assert result.evaluated_at == timestamp


@pytest.mark.parametrize(
    ("field", "value", "code"),
    [
        ("readiness_status", "INCOMPLETE", "READINESS_NOT_APPROVED"),
        ("governance_approved", False, "GOVERNANCE_NOT_APPROVED"),
        ("manual_review_complete", False, "MANUAL_REVIEW_REQUIRED"),
        (
            "findings",
            (ValidationFinding("UNKNOWN", "validation.unknown"),),
            "BLOCKING_VALIDATION_FINDING",
        ),
        ("authorized_actor", "intruder", "UNAUTHORIZED_ACTOR"),
    ],
)
def test_publication_gates_reject_unsafe_state(field: str, value: object, code: str) -> None:
    with pytest.raises(PublicationGateError) as error:
        evaluate_publication_gates(request(**{field: value}))
    assert error.value.code == code


def test_manifests_reject_duplicate_order() -> None:
    with pytest.raises(PublicationGateError) as error:
        evaluate_publication_gates(request(content_block_ids=("block-1", "block-1")))
    assert error.value.code == "BLOCK_ORDER_DUPLICATE"


def test_release_lifecycle_supports_supersession_deprecation_and_retirement() -> None:
    release = PublicationRelease(
        release_id=PublicationReleaseId(_value=str(uuid4())),
        package_id=ContentPackageId(_value=str(uuid4())),
        version_id=ContentVersionId(_value=str(uuid4())),
        status=PublicationReleaseStatus.RELEASED,
    )

    release.supersede()
    release.deprecate()
    release.retire()

    assert release.status is PublicationReleaseStatus.RETIRED

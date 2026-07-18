from __future__ import annotations

from datetime import UTC, datetime
from types import SimpleNamespace
from uuid import UUID

from fastapi.routing import APIRoute
from fastapi.testclient import TestClient

from neuralverse_backend.configuration.settings import Settings
from neuralverse_backend.delivery.contracts.models import (
    DeliveryManifest,
    PublicationRelease,
    PublishedAssessmentSpec,
    PublishedContentBlock,
    PublishedGovernanceSummary,
    PublishedLaboratorySpec,
    PublishedLearningPackage,
    ResolvedAsset,
)
from neuralverse_backend.delivery.errors import DeliveryError
from neuralverse_backend.main import create_app

PACKAGE_ID = UUID("00000000-0000-0000-0000-000000000001")
VERSION_ID = UUID("00000000-0000-0000-0000-000000000002")
RELEASE_ID = UUID("00000000-0000-0000-0000-000000000003")
NODE_ID = UUID("00000000-0000-0000-0000-000000000004")
ASSET_ID = UUID("00000000-0000-0000-0000-000000000005")
LAB_ID = UUID("00000000-0000-0000-0000-000000000006")
ASSESSMENT_ID = UUID("00000000-0000-0000-0000-000000000007")


def _package() -> PublishedLearningPackage:
    return PublishedLearningPackage(
        release_id=str(RELEASE_ID),
        generated_from_manifest_id="manifest-1",
        content_package_id=str(PACKAGE_ID),
        content_version_id=str(VERSION_ID),
        publication_release_id=str(RELEASE_ID),
        publication_manifest_id="manifest-1",
        curriculum_node_ids=[str(NODE_ID)],
        revision=1,
        released_at=datetime(2026, 1, 1, tzinfo=UTC),
        blocks=[
            PublishedContentBlock(
                content_block_id="block-1",
                block_type="text",
                sequence_position=0,
                semantic_payload={"meaning": "published"},
            )
        ],
        relationships=[],
        sources=[],
        citations=[],
        assets=[],
        laboratories=[],
        assessments=[],
        provenance=PublishedGovernanceSummary(approved=True, review_ids=[]),
    )


def _service() -> SimpleNamespace:
    package = _package()
    release = PublicationRelease(
        release_id=str(RELEASE_ID),
        generated_from_manifest_id="manifest-1",
        publication_release_id=str(RELEASE_ID),
        content_package_id=str(PACKAGE_ID),
        content_version_id=str(VERSION_ID),
        publication_manifest_id="manifest-1",
        released_at=package.released_at,
        release_fingerprint="fingerprint-1",
        governance_review_ids=[],
        delivery_manifest=DeliveryManifest(
            release_id=str(RELEASE_ID),
            generated_from_manifest_id="manifest-1",
            publication_manifest_id="manifest-1",
            publication_release_id=str(RELEASE_ID),
            content_package_id=str(PACKAGE_ID),
            content_version_id=str(VERSION_ID),
            ordered_content_block_ids=["block-1"],
            source_ids=[],
            citation_ids=[],
            asset_version_ids=[],
            laboratory_spec_versions=[],
            assessment_spec_versions=[],
            release_fingerprint="fingerprint-1",
        ),
    )
    asset = ResolvedAsset(
        asset_id=str(ASSET_ID),
        asset_version_id="asset-version-1",
        media_type="image/png",
        content_hash="hash-1",
        semantic_purpose="illustration",
        delivery_locator="asset://asset-version-1",
        provenance="approved",
    )
    laboratory = PublishedLaboratorySpec(
        laboratory_spec_id=str(LAB_ID),
        laboratory_spec_version="1.0.0",
        semantic_instructions="Follow the procedure.",
        input_contract={},
        output_contract={},
        evidence_requirements={},
    )
    assessment = PublishedAssessmentSpec(
        assessment_spec_id=str(ASSESSMENT_ID),
        assessment_spec_version="1.0.0",
        assessment_type="short_answer",
        semantic_prompt="Explain the concept.",
        response_contract={},
        evidence_requirements={},
        approved_result_metadata={},
    )
    return SimpleNamespace(
        get_curriculum_lesson=SimpleNamespace(execute=lambda _: package),
        get_learning_package=SimpleNamespace(execute=lambda _: package),
        get_exact_learning_package_version=SimpleNamespace(execute=lambda *_: package),
        get_publication_release=SimpleNamespace(execute=lambda _: release),
        resolve_required_assets=SimpleNamespace(execute=lambda _: [asset]),
        get_laboratory_specification=SimpleNamespace(execute=lambda *_: laboratory),
        get_assessment_specification=SimpleNamespace(execute=lambda *_: assessment),
    )


def _client(test_settings: Settings) -> TestClient:
    app = create_app(test_settings)
    app.state.delivery_query_service = _service()
    return TestClient(app)


def test_delivery_contract_is_database_independent() -> None:
    package = PublishedLearningPackage(
        release_id="release",
        generated_from_manifest_id="manifest",
        content_package_id="package",
        content_version_id="version",
        publication_release_id="release",
        publication_manifest_id="manifest",
        revision=1,
        released_at=datetime(2026, 1, 1, tzinfo=UTC),
        blocks=[],
        relationships=[],
        sources=[],
        citations=[],
        assets=[],
        laboratories=[],
        assessments=[],
        provenance=PublishedGovernanceSummary(approved=True, review_ids=[]),
    )
    assert "lock_version" not in package.model_dump()
    assert package.contract_name == "PublishedLearningPackage"


def test_delivery_route_group_is_read_only(test_settings: Settings) -> None:
    app = create_app(test_settings)
    routes = {
        route.path: route.methods
        for route in app.routes
        if isinstance(route, APIRoute)
        if route.path.startswith("/delivery/v1")
    }
    assert len(routes) == 7
    assert all(methods == {"GET"} for methods in routes.values())


def test_delivery_error_contains_request_identity(test_settings: Settings) -> None:
    client = TestClient(create_app(test_settings))
    response = client.get(
        "/delivery/v1/publication-releases/00000000-0000-0000-0000-000000000000",
        headers={"X-Request-ID": "delivery-test-1"},
    )
    assert response.status_code == 500
    assert response.headers["X-Request-ID"] == "delivery-test-1"
    assert response.json()["correlation_id"] == "delivery-test-1"


def test_all_seven_delivery_endpoints_return_neutral_contracts(test_settings: Settings) -> None:
    client = _client(test_settings)
    paths = [
        f"/delivery/v1/curriculum/lessons/{NODE_ID}",
        f"/delivery/v1/learning-packages/{PACKAGE_ID}",
        f"/delivery/v1/learning-packages/{PACKAGE_ID}/versions/{VERSION_ID}",
        f"/delivery/v1/publication-releases/{RELEASE_ID}",
        f"/delivery/v1/publication-releases/{RELEASE_ID}/assets",
        f"/delivery/v1/publication-releases/{RELEASE_ID}/laboratories/{LAB_ID}/versions/1.0.0",
        f"/delivery/v1/publication-releases/{RELEASE_ID}/assessments/{ASSESSMENT_ID}/versions/1.0.0",
    ]
    responses = [client.get(path) for path in paths]
    assert [response.status_code for response in responses] == [200] * 7
    assert responses[0].json()["publication_release_id"] == str(RELEASE_ID)
    assert responses[3].json()["delivery_manifest"]["content_version_id"] == str(VERSION_ID)
    assert responses[4].json()[0]["asset_version_id"] == "asset-version-1"
    assert responses[5].json()["laboratory_spec_version"] == "1.0.0"
    assert responses[6].json()["assessment_spec_version"] == "1.0.0"


def test_alias_has_exact_content_location_and_immutable_cache_policy(
    test_settings: Settings,
) -> None:
    response = _client(test_settings).get(f"/delivery/v1/learning-packages/{PACKAGE_ID}")
    assert response.headers["Content-Location"].endswith(f"/{VERSION_ID}")
    assert response.headers["Cache-Control"] == "public, max-age=0, must-revalidate"


def test_etag_and_conditional_request_are_stable(test_settings: Settings) -> None:
    client = _client(test_settings)
    path = f"/delivery/v1/learning-packages/{PACKAGE_ID}/versions/{VERSION_ID}"
    first = client.get(path)
    second = client.get(path, headers={"If-None-Match": first.headers["ETag"]})
    assert first.headers["ETag"] == second.headers["ETag"]
    assert second.status_code == 304
    assert second.content == b""
    assert second.headers["X-Request-ID"]


def test_gzip_negotiation_preserves_json_and_vary_header(test_settings: Settings) -> None:
    response = _client(test_settings).get(
        f"/delivery/v1/learning-packages/{PACKAGE_ID}/versions/{VERSION_ID}",
        headers={"Accept-Encoding": "gzip"},
    )
    assert response.status_code == 200
    assert response.headers["Content-Encoding"] == "gzip"
    assert response.headers["Vary"] == "Accept-Encoding"
    assert response.json()["content_version_id"] == str(VERSION_ID)


def test_malformed_conditional_request_is_structured(test_settings: Settings) -> None:
    response = _client(test_settings).get(
        f"/delivery/v1/publication-releases/{RELEASE_ID}",
        headers={"If-None-Match": "malformed"},
    )
    assert response.status_code == 400
    assert response.json()["code"] == "INVALID_CONDITIONAL_REQUEST"


def test_payload_limit_rejects_without_partial_success(test_settings: Settings) -> None:
    test_settings.delivery_max_response_bytes = 64
    response = _client(test_settings).get(f"/delivery/v1/learning-packages/{PACKAGE_ID}")
    assert response.status_code == 413
    assert response.json()["code"] == "DELIVERY_PAYLOAD_TOO_LARGE"


def test_query_error_is_not_serialized_as_internal_exception(test_settings: Settings) -> None:
    app = create_app(test_settings)
    app.state.delivery_query_service = SimpleNamespace(
        get_learning_package=SimpleNamespace(
            execute=lambda _: (_ for _ in ()).throw(
                DeliveryError("RESOURCE_NOT_PUBLISHED", "not published", status_code=404)
            )
        )
    )
    response = TestClient(app).get(f"/delivery/v1/learning-packages/{PACKAGE_ID}")
    assert response.status_code == 404
    assert response.json()["code"] == "RESOURCE_NOT_PUBLISHED"
    assert "Traceback" not in response.text

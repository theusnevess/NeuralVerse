"""Versioned read-only delivery HTTP surface."""

from __future__ import annotations

import hashlib
import json
from collections.abc import Callable
from typing import Any, cast
from uuid import UUID

from fastapi import APIRouter, Header, Request
from fastapi.responses import JSONResponse, Response

from neuralverse_backend.delivery.contracts.models import (
    ContractModel,
    PublicationRelease,
    PublishedAssessmentSpec,
    PublishedLaboratorySpec,
    PublishedLearningPackage,
    ResolvedAsset,
)
from neuralverse_backend.delivery.errors import DeliveryError
from neuralverse_backend.delivery.queries import DeliveryQueryService

router = APIRouter(prefix="/delivery/v1", tags=["published-delivery"])


def _payload(value: Any) -> Any:
    if isinstance(value, ContractModel):
        return value.model_dump(mode="json")
    if isinstance(value, list):
        return [_payload(item) for item in value]
    return value


def _etag(value: Any) -> str:
    encoded = json.dumps(_payload(value), ensure_ascii=False, sort_keys=True, separators=(",", ":"))
    return f'W/"{hashlib.sha256(encoded.encode("utf-8")).hexdigest()}"'


def _service(request: Request) -> DeliveryQueryService:
    service = getattr(request.app.state, "delivery_query_service", None)
    if service is None:
        raise DeliveryError(
            "UNEXPECTED_DELIVERY_FAILURE", "delivery persistence is unavailable", status_code=500
        )
    return cast(DeliveryQueryService, service)


def _respond(
    request: Request,
    value: Any,
    *,
    immutable: bool,
    content_location: str | None = None,
    if_none_match: str | None = None,
) -> Response:
    tag = _etag(value)
    payload = _payload(value)
    serialized = json.dumps(payload, ensure_ascii=False, separators=(",", ":")).encode("utf-8")
    maximum = getattr(request.app.state.settings, "delivery_max_response_bytes", 2_000_000)
    if len(serialized) > maximum:
        raise DeliveryError(
            "DELIVERY_PAYLOAD_TOO_LARGE",
            "delivery response exceeds the configured byte limit",
            status_code=413,
        )
    if (
        content_location is None
        and not immutable
        and isinstance(value, ContractModel)
        and hasattr(value, "content_package_id")
    ):
        content_location = (
            f"/delivery/v1/learning-packages/{value.content_package_id}/"
            f"versions/{value.content_version_id}"  # type: ignore[attr-defined]
        )
    headers = {
        "ETag": tag,
        "Cache-Control": "public, max-age=31536000, immutable"
        if immutable
        else "public, max-age=0, must-revalidate",
        "X-Request-ID": getattr(request.state, "correlation_id", "unknown"),
    }
    if content_location:
        headers["Content-Location"] = content_location
    if if_none_match is not None:
        if if_none_match.strip() == tag:
            return Response(status_code=304, headers=headers)
        if not if_none_match.strip().startswith(('W/"', '"')):
            raise DeliveryError(
                "INVALID_CONDITIONAL_REQUEST", "If-None-Match is malformed", status_code=400
            )
    return JSONResponse(content=payload, headers=headers)


def _error(request: Request, error: DeliveryError) -> JSONResponse:
    correlation_id = getattr(request.state, "correlation_id", "unknown")
    return JSONResponse(
        status_code=error.status_code,
        content={
            "code": error.code,
            "message": error.message,
            "correlation_id": correlation_id,
            "contract_version": error.contract_version,
            "details": error.details,
        },
        headers={
            "X-Request-ID": correlation_id,
            "Cache-Control": "no-store",
        },
    )


def _run(request: Request, operation: Callable[[], Any], **kwargs: Any) -> Response:
    try:
        return _respond(request, operation(), **kwargs)
    except DeliveryError as error:
        return _error(request, error)


@router.get("/curriculum/lessons/{curriculum_node_id}", response_model=PublishedLearningPackage)
def get_curriculum_lesson(
    request: Request,
    curriculum_node_id: UUID,
    if_none_match: str | None = Header(default=None, alias="If-None-Match"),
) -> Response:
    return _run(
        request,
        lambda: _service(request).get_curriculum_lesson.execute(curriculum_node_id),
        immutable=False,
        if_none_match=if_none_match,
    )


@router.get("/learning-packages/{content_package_id}", response_model=PublishedLearningPackage)
def get_learning_package(
    request: Request,
    content_package_id: UUID,
    if_none_match: str | None = Header(default=None, alias="If-None-Match"),
) -> Response:
    return _run(
        request,
        lambda: _service(request).get_learning_package.execute(content_package_id),
        immutable=False,
        if_none_match=if_none_match,
    )


@router.get(
    "/learning-packages/{content_package_id}/versions/{content_version_id}",
    response_model=PublishedLearningPackage,
)
def get_exact_learning_package(
    request: Request,
    content_package_id: UUID,
    content_version_id: UUID,
    if_none_match: str | None = Header(default=None, alias="If-None-Match"),
) -> Response:
    return _run(
        request,
        lambda: _service(request).get_exact_learning_package_version.execute(
            content_package_id, content_version_id
        ),
        immutable=True,
        content_location=f"/delivery/v1/learning-packages/{content_package_id}/versions/{content_version_id}",
        if_none_match=if_none_match,
    )


@router.get("/publication-releases/{publication_release_id}", response_model=PublicationRelease)
def get_release(
    request: Request,
    publication_release_id: UUID,
    if_none_match: str | None = Header(default=None, alias="If-None-Match"),
) -> Response:
    return _run(
        request,
        lambda: _service(request).get_publication_release.execute(publication_release_id),
        immutable=True,
        if_none_match=if_none_match,
    )


@router.get(
    "/publication-releases/{publication_release_id}/assets",
    response_model=list[ResolvedAsset],
)
def get_assets(
    request: Request,
    publication_release_id: UUID,
    if_none_match: str | None = Header(default=None, alias="If-None-Match"),
) -> Response:
    return _run(
        request,
        lambda: _service(request).resolve_required_assets.execute(publication_release_id),
        immutable=True,
        if_none_match=if_none_match,
    )


@router.get(
    "/publication-releases/{publication_release_id}/laboratories/{laboratory_spec_id}/versions/{laboratory_spec_version}",
    response_model=PublishedLaboratorySpec,
)
def get_laboratory(
    request: Request,
    publication_release_id: UUID,
    laboratory_spec_id: UUID,
    laboratory_spec_version: str,
    if_none_match: str | None = Header(default=None, alias="If-None-Match"),
) -> Response:
    return _run(
        request,
        lambda: _service(request).get_laboratory_specification.execute(
            publication_release_id, laboratory_spec_id, laboratory_spec_version
        ),
        immutable=True,
        if_none_match=if_none_match,
    )


@router.get(
    "/publication-releases/{publication_release_id}/assessments/{assessment_spec_id}/versions/{assessment_spec_version}",
    response_model=PublishedAssessmentSpec,
)
def get_assessment(
    request: Request,
    publication_release_id: UUID,
    assessment_spec_id: UUID,
    assessment_spec_version: str,
    if_none_match: str | None = Header(default=None, alias="If-None-Match"),
) -> Response:
    return _run(
        request,
        lambda: _service(request).get_assessment_specification.execute(
            publication_release_id, assessment_spec_id, assessment_spec_version
        ),
        immutable=True,
        if_none_match=if_none_match,
    )

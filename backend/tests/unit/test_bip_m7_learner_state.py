"""BIP-M7 learner-state contract and privacy-boundary tests."""

from __future__ import annotations

import pytest
from pydantic import ValidationError

from neuralverse_backend.interfaces.http.learner import (
    EXPORT_SCHEMA,
    AssessmentBody,
    LaboratoryBody,
    ProgressBody,
    _request_hash,
    router,
)


def test_minimum_learner_api_is_mounted_once() -> None:
    routes = {(route.path, method) for route in router.routes for method in route.methods}
    required = {
        ("/api/v1/learner/state", "GET"),
        ("/api/v1/learner/progress", "GET"),
        ("/api/v1/learner/progress/{resource_id}", "PUT"),
        ("/api/v1/learner/notes/{resource_id}", "GET"),
        ("/api/v1/learner/notes/{resource_id}", "PUT"),
        ("/api/v1/learner/sessions", "POST"),
        ("/api/v1/learner/sessions/{session_id}", "PATCH"),
        ("/api/v1/learner/laboratory-runs", "POST"),
        ("/api/v1/learner/assessment-attempts", "POST"),
        ("/api/v1/learner/export", "POST"),
        ("/api/v1/learner/import", "POST"),
        ("/api/v1/learner/deletions", "POST"),
        ("/api/v1/learner/deletions/{deletion_id}", "GET"),
    }
    assert required <= routes
    assert (
        len([route for route in router.routes if route.path.startswith("/api/v1/learner/")]) == 13
    )


def test_learner_id_is_not_accepted_from_public_domain_payload() -> None:
    with pytest.raises(ValidationError):
        ProgressBody(progress=0.5, learner_id="arbitrary")  # type: ignore[call-arg]


def test_progress_is_a_bounded_fraction() -> None:
    assert ProgressBody(progress=0).progress == 0
    assert ProgressBody(progress=1).progress == 1
    with pytest.raises(ValidationError):
        ProgressBody(progress=1.01)


def test_evidence_payloads_require_exact_content_versions() -> None:
    with pytest.raises(ValidationError):
        LaboratoryBody(laboratory_spec_id="spec", laboratory_spec_version="1")
    with pytest.raises(ValidationError):
        AssessmentBody(assessment_spec_id="spec", assessment_spec_version="1")


def test_export_schema_and_checksum_are_deterministic() -> None:
    document = {"schema_version": EXPORT_SCHEMA, "progress": [{"content_version_id": "v1"}]}
    assert _request_hash(document) == _request_hash(
        {"progress": [{"content_version_id": "v1"}], "schema_version": EXPORT_SCHEMA}
    )

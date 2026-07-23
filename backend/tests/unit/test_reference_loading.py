from __future__ import annotations

import hashlib
import json
from types import SimpleNamespace
from uuid import UUID

import pytest

from neuralverse_backend.bip_m4.reference_loading import load_canonical_activity_dependencies
from neuralverse_backend.bip_m4.workflow_artifact_references import WorkflowArtifactReferenceError

ARTIFACT_ID = UUID("00000000-0000-0000-0000-000000000001")


def _request(workflow_id: str = "workflow:1") -> dict[str, object]:
    raw = json.dumps({"contributionId": "contribution:1"}, sort_keys=True).encode()
    fingerprint = hashlib.sha256(raw).hexdigest()
    return {
        "generation_job_id": "job:1",
        "workflow_id": workflow_id,
        "revision_cycle": 0,
        "artifact_references": {
            "evidence": {
                "artifact_domain_id": "artifact:1",
                "contract_name": "AgentContribution",
                "contract_version": "1.0.0",
                "artifact_fingerprint": fingerprint,
                "canonical_producer_id": "research",
                "operation": "produce_evidence_contribution",
                "operation_version": "1.0.0",
                "generation_job_id": "job:1",
                "workflow_id": workflow_id,
                "revision_cycle": 0,
                "persistence_locator": str(ARTIFACT_ID),
            }
        },
    }


def _session_factory():
    raw = json.dumps({"contributionId": "contribution:1"}, sort_keys=True).encode()
    record = SimpleNamespace(
        canonical_input_id=ARTIFACT_ID,
        raw_json_bytes=raw,
        artifact_fingerprint=hashlib.sha256(raw).hexdigest(),
        contract_name="AgentContribution",
        contract_version="1.0.0",
        generation_job_id="job:1",
        workflow_id="workflow:1",
        revision_cycle=0,
        canonical_producer_id="research",
        operation="produce_evidence_contribution",
    )

    class Session:
        def scalar(self, _query):
            return record

        def close(self):
            return None

    return Session()


def test_dependency_loading_forwards_matching_workflow_identity() -> None:
    loaded = load_canonical_activity_dependencies(_session_factory, _request())
    assert loaded["evidence"].generation_job_id == "job:1"


def test_dependency_loading_rejects_workflow_mismatch() -> None:
    with pytest.raises(WorkflowArtifactReferenceError) as error:
        load_canonical_activity_dependencies(_session_factory, _request("workflow:2"))
    assert error.value.code == "WORKFLOW_ARTIFACT_WORKFLOW_MISMATCH"

from __future__ import annotations

import hashlib
from types import SimpleNamespace

import pytest

from neuralverse_backend.bip_m4 import system_activities


@pytest.mark.asyncio
async def test_qualify_generation_request_accepts_optional_correlation_id(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    raw_request = b'{"request":"canonical"}'
    generation_request_id = "00000000-0000-0000-0000-000000000001"
    generation_job_id = "00000000-0000-0000-0000-000000000002"
    record = SimpleNamespace(
        generation_request_id=generation_request_id,
        generation_job_id=generation_job_id,
        raw_json_bytes=raw_request,
    )

    class Session:
        def scalar(self, _statement: object) -> SimpleNamespace:
            return record

        def close(self) -> None:
            pass

    monkeypatch.setattr(
        system_activities,
        "create_persistence_runtime",
        lambda _settings: SimpleNamespace(session_factory=lambda: Session()),
    )

    result = await system_activities.qualify_generation_request(
        {
            "generation_job_id": generation_job_id,
            "request_correlation_id": "",
            "request_fingerprint": "workflow-fingerprint",
            "generation_request_reference": {
                "generation_request_id": generation_request_id,
                "generation_job_id": generation_job_id,
                "request_fingerprint": hashlib.sha256(raw_request).hexdigest(),
            },
        }
    )

    assert result["status"] == "QUALIFIED"

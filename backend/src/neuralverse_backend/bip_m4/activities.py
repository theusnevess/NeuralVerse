"""Small, separately retryable BIP-M4 activity boundaries."""

from __future__ import annotations

import json
from collections.abc import Mapping
from dataclasses import dataclass
from typing import Any

from neuralverse_backend.bip_m4.adapter import (
    ACPExecutionAdapter,
    ACPExecutionRequest,
    PublicationActivityAdapter,
)
from neuralverse_backend.bip_m4.domain import ActivityIdempotencyLedger


@dataclass(frozen=True, slots=True)
class ActivityResult:
    activity_id: str
    status: str
    value: Mapping[str, Any]


class BIPM4Activities:
    """Activity facade; each method is independently idempotent by key."""

    def __init__(
        self,
        *,
        acp: ACPExecutionAdapter,
        publication: PublicationActivityAdapter,
        ledger: ActivityIdempotencyLedger | None = None,
    ) -> None:
        self.acp = acp
        self.publication = publication
        self.ledger = ledger or ActivityIdempotencyLedger()

    def execute_acp(self, request: ACPExecutionRequest) -> ActivityResult:
        fingerprint = self._fingerprint(request.payload)
        result = self.ledger.resolve_or_compute(
            request.idempotency_key,
            fingerprint,
            lambda: self.acp.invoke(request),
        )
        return ActivityResult("acp-execution", result.status, {"result": result})

    def contribution_intake(self, *, key: str, contribution: Mapping[str, Any]) -> ActivityResult:
        value = self.ledger.resolve_or_record(
            key, self._fingerprint(contribution), dict(contribution)
        )
        return ActivityResult("contribution-intake", "ACCEPTED", value)

    def project_progress(self, *, key: str, projection: Mapping[str, Any]) -> ActivityResult:
        value = self.ledger.resolve_or_record(key, self._fingerprint(projection), dict(projection))
        return ActivityResult("progress-projection", "PROJECTED", value)

    def record_audit(self, *, key: str, event: Mapping[str, Any]) -> ActivityResult:
        value = self.ledger.resolve_or_record(key, self._fingerprint(event), dict(event))
        return ActivityResult("workflow-audit", "RECORDED", value)

    def project_review(self, *, key: str, review: Mapping[str, Any]) -> ActivityResult:
        value = self.ledger.resolve_or_record(key, self._fingerprint(review), dict(review))
        return ActivityResult("human-review-projection", "PROJECTED", value)

    def check_readiness(self, *, key: str, readiness: Mapping[str, Any]) -> ActivityResult:
        value = self.ledger.resolve_or_record(key, self._fingerprint(readiness), dict(readiness))
        return ActivityResult("publication-readiness", "EVALUATED", value)

    def publish(self, *, request: Mapping[str, Any]) -> ActivityResult:
        key = str(request.get("idempotency_key", ""))
        value = self.ledger.resolve_or_compute(
            key,
            self._fingerprint(request),
            lambda: self.publication.execute(request),
        )
        return ActivityResult("publication", "COMPLETED", value)

    def finalize(self, *, key: str, result: Mapping[str, Any]) -> ActivityResult:
        value = self.ledger.resolve_or_record(key, self._fingerprint(result), dict(result))
        return ActivityResult("workflow-finalization", "COMPLETED", value)

    @staticmethod
    def _fingerprint(value: Mapping[str, Any]) -> str:
        return json.dumps(value, sort_keys=True, separators=(",", ":"), default=str)

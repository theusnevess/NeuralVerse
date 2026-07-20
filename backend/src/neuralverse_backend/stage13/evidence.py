"""Bounded, content-addressed evidence records for the Stage 13 boundary."""

from __future__ import annotations

import hashlib
import re
from collections.abc import Mapping
from dataclasses import dataclass
from datetime import UTC, datetime

from .runtime import Stage13ValidationError


@dataclass(frozen=True, slots=True)
class EvidenceArtifact:
    artifact_id: str
    run_id: str
    learner_id: str
    artifact_type: str
    mime_type: str
    size_bytes: int
    sha256: str
    provenance: str
    alt_text: str | None
    caption: str | None
    created_at: datetime


class InMemoryEvidenceStore:
    """Deterministic test store; production storage uses the existing S3 port."""

    _safe_name = re.compile(r"^[A-Za-z0-9][A-Za-z0-9_.-]{0,127}$")

    def __init__(self, max_bytes: int = 2 * 1024 * 1024) -> None:
        self.max_bytes = max_bytes
        self._contents: dict[str, bytes] = {}
        self._records: dict[str, EvidenceArtifact] = {}

    def put(
        self,
        *,
        run_id: str,
        learner_id: str,
        artifact_type: str,
        mime_type: str,
        content: bytes,
        provenance: str,
        alt_text: str | None = None,
        caption: str | None = None,
    ) -> EvidenceArtifact:
        if len(content) > self.max_bytes:
            raise Stage13ValidationError("evidence exceeds bounded size")
        if not self._safe_name.fullmatch(artifact_type):
            raise Stage13ValidationError("unsafe evidence artifact type")
        if mime_type.startswith("text/") and b"\x00" in content:
            raise Stage13ValidationError("invalid text evidence")
        digest = hashlib.sha256(content).hexdigest()
        artifact_id = f"evidence:{digest}"
        record = EvidenceArtifact(
            artifact_id,
            run_id,
            learner_id,
            artifact_type,
            mime_type,
            len(content),
            digest,
            provenance,
            alt_text,
            caption,
            datetime.now(UTC),
        )
        existing = self._records.get(artifact_id)
        if existing is not None and existing.learner_id != learner_id:
            raise Stage13ValidationError("cross-learner evidence collision")
        self._contents.setdefault(artifact_id, bytes(content))
        self._records.setdefault(artifact_id, record)
        return self._records[artifact_id]

    def get(self, artifact_id: str, *, learner_id: str) -> bytes:
        record = self._records.get(artifact_id)
        if record is None or record.learner_id != learner_id:
            raise KeyError(artifact_id)
        return self._contents[artifact_id]

    def metadata(self) -> Mapping[str, EvidenceArtifact]:
        return dict(self._records)

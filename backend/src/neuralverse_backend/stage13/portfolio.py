"""Deterministic learner-owned laboratory portfolio export."""

from __future__ import annotations

import hashlib
import io
import zipfile
from collections.abc import Mapping
from dataclasses import asdict

from .runtime import LaboratoryResult, canonical_json


def _entry(name: str, content: bytes) -> zipfile.ZipInfo:
    info = zipfile.ZipInfo(name, date_time=(1980, 1, 1, 0, 0, 0))
    info.compress_type = zipfile.ZIP_DEFLATED
    info.external_attr = 0o600 << 16
    info.file_size = len(content)
    return info


def build_portfolio_export(
    result: LaboratoryResult,
    *,
    learner_notes: str = "",
    learner_conclusion: str = "",
    artifacts: Mapping[str, bytes] | None = None,
) -> bytes:
    """Return a stable ZIP without credentials or hidden assessment data."""

    artifacts = artifacts or {}
    safe_artifacts: dict[str, bytes] = {}
    total_artifact_bytes = 0
    for name, content in artifacts.items():
        safe_name = name.replace("\\", "/")
        if safe_name.startswith("/") or ".." in safe_name.split("/"):
            raise ValueError("unsafe portfolio artifact path")
        if len(content) > 2 * 1024 * 1024:
            raise ValueError("portfolio artifact exceeds bounded size")
        total_artifact_bytes += len(content)
        if total_artifact_bytes > 8 * 1024 * 1024:
            raise ValueError("portfolio artifacts exceed bounded total size")
        if not safe_name:
            raise ValueError("portfolio artifact path is empty")
        safe_artifacts[safe_name] = content
    manifest = {
        "schema_name": "LaboratoryPortfolioExport",
        "schema_version": "1.0.0",
        "learner_id": result.request.learner_id,
        "laboratory_run_id": result.request.run_id,
        "laboratory_spec_id": result.request.laboratory_spec_id,
        "laboratory_spec_version": result.request.laboratory_spec_version,
        "package_id": result.request.package_id,
        "content_version_id": result.request.content_version_id,
        "publication_release_id": result.request.publication_release_id,
        "simulation_id": result.request.simulation_id,
        "simulation_version": result.environment.simulation_version,
        "seed": result.seed,
        "state": result.state,
        "input_payload_sha256": result.input_payload_sha256,
        "environment": asdict(result.environment),
        "artifact_names": sorted(safe_artifacts),
    }
    observations = [asdict(item) for item in result.observations]
    configuration = {"parameters": dict(result.request.parameters)}
    provenance = {
        "created_at": result.created_at.isoformat(),
        "runtime": result.environment.runtime_classification,
    }
    files: dict[str, bytes] = {
        "manifest.json": canonical_json(manifest).encode(),
        "observations.json": canonical_json(observations).encode(),
        "configuration.json": canonical_json(configuration).encode(),
        "provenance.json": canonical_json(provenance).encode(),
        "README.md": (
            "This learner-owned export contains deterministic laboratory evidence.\n"
            f"Learner notes: {learner_notes}\nLearner conclusion: {learner_conclusion}\n"
        ).encode(),
    }
    files.update({f"evidence/{name}": content for name, content in safe_artifacts.items()})
    checksums = {name: hashlib.sha256(content).hexdigest() for name, content in files.items()}
    files["checksums.json"] = canonical_json(checksums).encode()
    output = io.BytesIO()
    with zipfile.ZipFile(output, "w") as archive:
        for name in sorted(files):
            archive.writestr(_entry(name, files[name]), files[name])
    return output.getvalue()

from __future__ import annotations

import hashlib
import json
import re
from collections.abc import Callable, Mapping
from dataclasses import dataclass
from datetime import UTC, datetime
from decimal import Decimal
from enum import StrEnum
from pathlib import Path
from typing import Any, cast

from neuralverse_backend.fixtures.errors import PayloadIssue
from neuralverse_backend.fixtures.hashing import canonicalize_structural_json
from neuralverse_backend.fixtures.json_parser import parse_strict_json

RELEASE_TAG = "nv-xfi-input-contracts-v1.0.0"
RELEASE_COMMIT = "8b468c23866e5aa58b8d6dd28f33b40f1310bb8d"
RELEASE_VERSION = "1.0.0"
READER_VERSION = "1.0.0"

_CONTRACTS = (
    "CurriculumContract",
    "AgentContribution",
    "LearningPackageDraft",
    "PublicationReadinessRecommendation",
)
_VERSION = re.compile(r"^(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)$")


class IntakeFailureCode(StrEnum):
    INVALID_JSON = "INVALID_JSON"
    UNKNOWN_CONTRACT = "UNKNOWN_CONTRACT"
    UNSUPPORTED_VERSION = "UNSUPPORTED_VERSION"
    MINIMUM_READER_INCOMPATIBILITY = "MINIMUM_READER_INCOMPATIBILITY"
    RELEASE_PIN_MISMATCH = "RELEASE_PIN_MISMATCH"
    SCHEMA_VALIDATION_FAILURE = "SCHEMA_VALIDATION_FAILURE"
    HASH_VERIFICATION_FAILURE = "HASH_VERIFICATION_FAILURE"
    INVALID_METADATA = "INVALID_METADATA"
    UNEXPECTED_INTAKE_FAILURE = "UNEXPECTED_INTAKE_FAILURE"


@dataclass(frozen=True, slots=True)
class IntakeFailure:
    code: IntakeFailureCode
    message: str
    path: str | None = None


@dataclass(frozen=True, slots=True)
class ReleaseIdentity:
    tag: str
    commit: str
    version: str
    manifest_sha256: str
    schema_hashes: dict[str, str]


@dataclass(frozen=True, slots=True)
class CanonicalIntake:
    contract_name: str
    contract_version: str
    minimum_reader_version: str
    producer_version: str
    canonical_artifact: Mapping[str, Any]
    raw_canonical_json: bytes
    release_identity: ReleaseIdentity
    schema_hash: str
    artifact_sha256: str
    validation_result: str
    received_at: datetime


@dataclass(frozen=True, slots=True)
class CanonicalInputResult:
    intake: CanonicalIntake | None = None
    failure: IntakeFailure | None = None

    @property
    def accepted(self) -> bool:
        return self.intake is not None and self.failure is None


class _SchemaError(ValueError):
    pass


def _release_root() -> Path:
    return Path(__file__).resolve().parents[2] / "vendor/neutral-contracts" / RELEASE_TAG


def _sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def verify_vendored_release(root: Path | None = None) -> ReleaseIdentity:
    base = root or _release_root()
    descriptor_path = base / "contracts/releases" / f"{RELEASE_TAG}.json"
    checksums_path = base / "contracts/releases" / f"{RELEASE_TAG}.sha256"
    manifest_path = base / "contracts/contract-manifest.json"
    pin_path = base / "RELEASE_PIN.json"
    try:
        descriptor = json.loads(descriptor_path.read_text(encoding="utf-8"))
        manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
        pin = json.loads(pin_path.read_text(encoding="utf-8"))
        checksum_lines = checksums_path.read_text(encoding="utf-8").splitlines()
    except (OSError, json.JSONDecodeError) as error:
        raise _SchemaError("vendored release metadata cannot be read") from error

    if (
        descriptor.get("release_name") != RELEASE_TAG
        or descriptor.get("release_version") != RELEASE_VERSION
        or descriptor.get("tag") != RELEASE_TAG
        or descriptor.get("tag_type") != "annotated"
        or descriptor.get("tag_target") != "SELF"
        or descriptor.get("release_commit_reference") != "SELF"
        or manifest.get("manifest_version") != RELEASE_VERSION
        or pin
        != {
            "tag": RELEASE_TAG,
            "commit": RELEASE_COMMIT,
            "version": RELEASE_VERSION,
            "source": "annotated release tag",
            "integrity": f"contracts/releases/{RELEASE_TAG}.sha256",
        }
    ):
        raise _SchemaError("release descriptor or manifest does not match the pinned release")

    manifest_hash = _sha256(manifest_path)
    if descriptor.get("manifest_sha256") != manifest_hash:
        raise _SchemaError("release manifest hash does not match its descriptor")

    schema_hashes: dict[str, str] = {}
    for line in checksum_lines:
        expected, relative = line.split("  ", 1)
        path = base / relative
        if not path.is_file() or _sha256(path) != expected:
            raise _SchemaError(f"release checksum mismatch: {relative}")
        if relative.startswith("contracts/schemas/") and relative.endswith("/schema.json"):
            schema_hashes[relative.removeprefix("contracts/")] = expected

    if len(schema_hashes) != 6:
        raise _SchemaError("release schema inventory is incomplete")
    for entry in manifest["contracts"]:
        path = entry["schema_path"]
        if entry["schema_sha256"] != schema_hashes.get(path):
            raise _SchemaError(f"manifest schema hash mismatch: {path}")
        if entry["generated_source_schema_hash"] != entry["schema_sha256"]:
            raise _SchemaError(f"generated projection provenance mismatch: {path}")
    return ReleaseIdentity(
        RELEASE_TAG, RELEASE_COMMIT, RELEASE_VERSION, manifest_hash, schema_hashes
    )


def _version(value: object) -> tuple[int, int, int] | None:
    if not isinstance(value, str):
        return None
    match = _VERSION.fullmatch(value)
    return (
        cast(tuple[int, int, int], tuple(int(part) for part in match.groups())) if match else None
    )


def _validate_semantic_references(value: Mapping[str, Any], contract_name: str) -> None:
    """Validate representation references without interpreting producer semantics."""

    if contract_name == "CurriculumContract":
        scope = value.get("curriculumScope")
        known_nodes = {
            *(
                scope.get("curriculumNodeIds", [])
                if isinstance(scope, dict)
                else []
            ),
            *value.get("targetCurriculumNodeIds", []),
        }
        for index, edge in enumerate(value.get("dependencyEdges", [])):
            if not isinstance(edge, dict):
                continue
            for field in ("fromNodeId", "toNodeId"):
                reference = edge.get(field)
                if reference not in known_nodes:
                    raise _SchemaError(
                        f"$.dependencyEdges[{index}].{field}: unknown dependency reference"
                    )


class _Validator:
    def __init__(self, root: Path) -> None:
        self.schemas: dict[str, dict[str, Any]] = {}
        for path in (root / "contracts/schemas").glob("**/schema.json"):
            schema = json.loads(path.read_text(encoding="utf-8"))
            self.schemas[schema["$id"]] = schema

    def validate(
        self, value: Any, schema: Mapping[str, Any], path: str = "$", base: str = ""
    ) -> None:
        if "$ref" in schema:
            reference = schema["$ref"]
            if reference.startswith("#"):
                target: Any = self.schemas[base]
                for part in reference[2:].split("/") if reference.startswith("#/") else []:
                    target = target[part.replace("~1", "/").replace("~0", "~")]
                self.validate(value, target, path, base)
                return
            uri, _, fragment = reference.partition("#")
            target = self.schemas[uri]
            if fragment:
                for part in fragment.removeprefix("/").split("/"):
                    target = target[part.replace("~1", "/").replace("~0", "~")]
            self.validate(value, target, path, uri)
            return
        if "allOf" in schema:
            for member in schema["allOf"]:
                self.validate(value, member, path, base)
        if "if" in schema:
            try:
                self.validate(value, schema["if"], path, base)
            except _SchemaError:
                pass
            else:
                if "then" in schema:
                    self.validate(value, schema["then"], path, base)
        if "not" in schema:
            try:
                self.validate(value, schema["not"], path, base)
            except _SchemaError:
                pass
            else:
                raise _SchemaError(f"{path}: prohibited value")
        expected = schema.get("type")
        if expected is not None and not self._type_matches(value, expected):
            raise _SchemaError(f"{path}: expected {expected}")
        if "const" in schema and value != schema["const"]:
            raise _SchemaError(f"{path}: expected constant")
        if "enum" in schema and value not in schema["enum"]:
            raise _SchemaError(f"{path}: value is not allowed")
        if isinstance(value, str):
            if len(value) < schema.get("minLength", 0) or len(value) > schema.get(
                "maxLength", 2**31
            ):
                raise _SchemaError(f"{path}: string length is invalid")
            if "pattern" in schema and re.search(schema["pattern"], value) is None:
                raise _SchemaError(f"{path}: string pattern is invalid")
        if isinstance(value, (int, float, Decimal)) and not isinstance(value, bool):
            if value < schema.get("minimum", value) or value > schema.get("maximum", value):
                raise _SchemaError(f"{path}: numeric range is invalid")
        if isinstance(value, list):
            if len(value) < schema.get("minItems", 0) or len(value) > schema.get("maxItems", 2**31):
                raise _SchemaError(f"{path}: array length is invalid")
            if "items" in schema:
                for index, item in enumerate(value):
                    self.validate(item, schema["items"], f"{path}[{index}]", base)
        if isinstance(value, dict):
            missing = [key for key in schema.get("required", []) if key not in value]
            if missing:
                raise _SchemaError(f"{path}: missing required field {missing[0]}")
            if len(value) < schema.get("minProperties", 0):
                raise _SchemaError(f"{path}: too few properties")
            if "propertyNames" in schema:
                for key in value:
                    self.validate(key, schema["propertyNames"], f"{path}.{key}", base)
            properties = schema.get("properties", {})
            for key, item in value.items():
                if key in properties:
                    self.validate(item, properties[key], f"{path}.{key}", base)
                elif schema.get("additionalProperties") is False:
                    raise _SchemaError(f"{path}: unknown field {key}")
        if schema.get("xfiSemanticStructure", {}).get("requireStructuredMember") and isinstance(
            value, dict
        ):
            if set(value) <= {"text"}:
                raise _SchemaError(f"{path}: structured payload is free-form only")

    @staticmethod
    def _type_matches(value: Any, expected: str | list[str]) -> bool:
        expected_types = [expected] if isinstance(expected, str) else expected
        return any(
            (kind == "object" and isinstance(value, dict))
            or (kind == "array" and isinstance(value, list))
            or (kind == "string" and isinstance(value, str))
            or (kind == "boolean" and isinstance(value, bool))
            or (kind == "null" and value is None)
            or (kind == "integer" and isinstance(value, int) and not isinstance(value, bool))
            or (
                kind == "number"
                and isinstance(value, (int, float, Decimal))
                and not isinstance(value, bool)
            )
            for kind in expected_types
        )


def read_canonical_input(
    raw_json: bytes,
    *,
    clock: Callable[[], datetime] | None = None,
    release_root: Path | None = None,
) -> CanonicalInputResult:
    try:
        if not isinstance(raw_json, bytes):
            raise ValueError("canonical input must be UTF-8 bytes")
        value = parse_strict_json(raw_json.decode("utf-8", errors="strict"))
        if not isinstance(value, dict):
            raise ValueError("canonical input must be a JSON object")
    except (PayloadIssue, UnicodeDecodeError, ValueError) as error:
        return CanonicalInputResult(
            failure=IntakeFailure(IntakeFailureCode.INVALID_JSON, str(error))
        )

    name = cast(str, value.get("schema_name"))
    version = cast(str, value.get("schema_version"))
    minimum = cast(str, value.get("minimum_reader_version"))
    producer = cast(str, value.get("producer_version"))
    if not all(isinstance(item, str) and item for item in (name, version, minimum, producer)):
        return CanonicalInputResult(
            failure=IntakeFailure(
                IntakeFailureCode.INVALID_METADATA, "required contract metadata is invalid"
            )
        )
    if name not in _CONTRACTS:
        return CanonicalInputResult(
            failure=IntakeFailure(IntakeFailureCode.UNKNOWN_CONTRACT, f"unknown contract: {name}")
        )
    parsed_version = _version(version)
    if parsed_version is None or parsed_version[0] != 1:
        return CanonicalInputResult(
            failure=IntakeFailure(
                IntakeFailureCode.UNSUPPORTED_VERSION, f"unsupported contract version: {version}"
            )
        )
    reader = _version(READER_VERSION)
    minimum_parsed = _version(minimum)
    assert reader is not None
    if minimum_parsed is None:
        return CanonicalInputResult(
            failure=IntakeFailure(
                IntakeFailureCode.INVALID_METADATA, "minimum_reader_version is malformed"
            )
        )
    if minimum_parsed > reader:
        return CanonicalInputResult(
            failure=IntakeFailure(
                IntakeFailureCode.MINIMUM_READER_INCOMPATIBILITY,
                "minimum_reader_version requires a newer reader",
            )
        )

    try:
        identity = verify_vendored_release(release_root)
        root = release_root or _release_root()
        manifest = json.loads(
            (root / "contracts/contract-manifest.json").read_text(encoding="utf-8")
        )
    except (_SchemaError, OSError, ValueError, KeyError, StopIteration) as error:
        return CanonicalInputResult(
            failure=IntakeFailure(IntakeFailureCode.RELEASE_PIN_MISMATCH, str(error))
        )

    try:
        entry = next(item for item in manifest["contracts"] if item["contract_name"] == name)
        schema = json.loads((root / "contracts" / entry["schema_path"]).read_text(encoding="utf-8"))
        _Validator(root).validate(value, schema, base=schema["$id"])
        _validate_semantic_references(value, name)
        if name == "PublicationReadinessRecommendation":
            ready = str(value["recommendation"]).startswith("READY")
            blocking = any(
                finding.get("blocking") is True
                for gate in value["qualityGateResults"]
                for finding in gate["findings"]
                if isinstance(finding, dict)
            )
            if ready and blocking:
                raise _SchemaError("ready recommendation contains blocking findings")
    except _SchemaError as error:
        return CanonicalInputResult(
            failure=IntakeFailure(IntakeFailureCode.SCHEMA_VALIDATION_FAILURE, str(error))
        )
    except Exception as error:
        return CanonicalInputResult(
            failure=IntakeFailure(IntakeFailureCode.UNEXPECTED_INTAKE_FAILURE, str(error))
        )

    try:
        received_at = (clock or (lambda: datetime.now(UTC)))()
        intake = CanonicalIntake(
            contract_name=name,
            contract_version=version,
            minimum_reader_version=minimum,
            producer_version=producer,
            canonical_artifact=value,
            raw_canonical_json=raw_json,
            release_identity=identity,
            schema_hash=entry["schema_sha256"],
            artifact_sha256=hashlib.sha256(canonicalize_structural_json(value)).hexdigest(),
            validation_result="VALID",
            received_at=received_at,
        )
    except Exception:
        return CanonicalInputResult(
            failure=IntakeFailure(
                IntakeFailureCode.UNEXPECTED_INTAKE_FAILURE,
                "canonical intake construction failed",
            )
        )
    return CanonicalInputResult(intake=intake)


def _reader(expected_name: str, raw_json: bytes, **kwargs: Any) -> CanonicalInputResult:
    result = read_canonical_input(raw_json, **kwargs)
    if (
        result.accepted
        and result.intake is not None
        and result.intake.contract_name != expected_name
    ):
        return CanonicalInputResult(
            failure=IntakeFailure(
                IntakeFailureCode.UNKNOWN_CONTRACT, f"expected contract: {expected_name}"
            )
        )
    return result


def readCurriculumContract(raw_json: bytes, **kwargs: Any) -> CanonicalInputResult:
    return _reader("CurriculumContract", raw_json, **kwargs)


def readAgentContribution(raw_json: bytes, **kwargs: Any) -> CanonicalInputResult:
    return _reader("AgentContribution", raw_json, **kwargs)


def readLearningPackageDraft(raw_json: bytes, **kwargs: Any) -> CanonicalInputResult:
    return _reader("LearningPackageDraft", raw_json, **kwargs)


def readPublicationReadinessRecommendation(raw_json: bytes, **kwargs: Any) -> CanonicalInputResult:
    return _reader("PublicationReadinessRecommendation", raw_json, **kwargs)


def readCanonicalInput(raw_json: bytes, **kwargs: Any) -> CanonicalInputResult:
    return read_canonical_input(raw_json, **kwargs)

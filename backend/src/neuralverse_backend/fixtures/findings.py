from __future__ import annotations

from collections.abc import Iterable
from dataclasses import dataclass
from enum import StrEnum

MAX_FINDINGS = 64
MAX_FINDING_CODE_LENGTH = 64
MAX_FINDING_MESSAGE_LENGTH = 512
MAX_FINDING_LOCATION_LENGTH = 256
FINDINGS_TRUNCATED_CODE = "FINDINGS_TRUNCATED"


class FindingSeverity(StrEnum):
    ERROR = "ERROR"
    WARNING = "WARNING"


@dataclass(frozen=True, slots=True)
class ValidationFinding:
    code: str
    severity: FindingSeverity
    message: str
    location: str | None = None

    def __post_init__(self) -> None:
        if not self.code or len(self.code) > MAX_FINDING_CODE_LENGTH:
            raise ValueError("finding code is outside its bound")
        if len(self.message) > MAX_FINDING_MESSAGE_LENGTH:
            raise ValueError("finding message is outside its bound")
        if self.location is not None and len(self.location) > MAX_FINDING_LOCATION_LENGTH:
            raise ValueError("finding location is outside its bound")

    def as_json(self) -> dict[str, str]:
        result = {
            "code": self.code,
            "severity": self.severity.value,
            "message": self.message,
        }
        if self.location is not None:
            result["location"] = self.location
        return result


def finding(
    code: str,
    message: str,
    *,
    location: str | None = None,
    severity: FindingSeverity = FindingSeverity.ERROR,
) -> ValidationFinding:
    return ValidationFinding(code=code, severity=severity, message=message, location=location)


def bound_findings(findings: Iterable[ValidationFinding]) -> tuple[ValidationFinding, ...]:
    """Keep deterministic findings and reserve the final slot for truncation."""

    ordered = tuple(findings)
    if len(ordered) <= MAX_FINDINGS:
        return ordered
    return ordered[: MAX_FINDINGS - 1] + (
        finding(
            FINDINGS_TRUNCATED_CODE,
            "Validation findings exceeded the configured limit.",
        ),
    )

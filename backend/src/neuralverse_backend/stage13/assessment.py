"""Deterministic assessment verification and transparent feedback."""

from __future__ import annotations

import hashlib
import math
import unicodedata
from dataclasses import dataclass, field, replace
from enum import StrEnum
from typing import Any, Protocol

from .runtime import Stage13ValidationError


class AssessmentVerifier(Protocol):
    def verify(self, expected: Any, response: Any) -> VerificationResult: ...


@dataclass(frozen=True, slots=True)
class VerificationResult:
    verifier_id: str
    verifier_version: str
    status: str
    score: float | None
    feedback: str
    rule_outcomes: tuple[str, ...] = ()
    reasoning_status: str = "NOT_APPLICABLE"
    misconception_ids: tuple[str, ...] = ()
    reinforcement_ids: tuple[str, ...] = ()
    requires_human_review: bool = False


class ExactMatchVerifier:
    verifier_id = "exact-normalized-match"
    verifier_version = "1.0.0"

    def verify(self, expected: Any, response: Any) -> VerificationResult:
        left = unicodedata.normalize("NFC", str(expected)).strip().casefold()
        right = unicodedata.normalize("NFC", str(response)).strip().casefold()
        matched = left == right
        return VerificationResult(
            self.verifier_id,
            self.verifier_version,
            "CORRECT" if matched else "INCORRECT",
            1.0 if matched else 0.0,
            (
                "Response matches the governed answer."
                if matched
                else "Response differs from the governed answer."
            ),
            rule_outcomes=("CORRECT" if matched else "INCORRECT",),
        )


class NumericToleranceVerifier:
    verifier_id = "numeric-tolerance"
    verifier_version = "1.0.0"

    def __init__(self, tolerance: float) -> None:
        if tolerance < 0 or not math.isfinite(tolerance):
            raise Stage13ValidationError("invalid numeric tolerance")
        self.tolerance = tolerance

    def verify(self, expected: Any, response: Any) -> VerificationResult:
        try:
            matched = math.isclose(
                float(expected),
                float(response),
                abs_tol=self.tolerance,
                rel_tol=self.tolerance,
            )
        except (TypeError, ValueError):
            matched = False
        return VerificationResult(
            self.verifier_id,
            self.verifier_version,
            "CORRECT" if matched else "INCORRECT",
            1.0 if matched else 0.0,
            (
                "Value is within the governed tolerance."
                if matched
                else "Value is outside the governed tolerance."
            ),
            rule_outcomes=("CORRECT" if matched else "INCORRECT",),
        )


@dataclass(frozen=True, slots=True)
class AssessmentVerifierDescriptor:
    verifier_id: str
    verifier_version: str
    assessment_type: str
    specification_version: str
    response_schema_version: str
    verifier: AssessmentVerifier
    misconception_mapping: dict[str, str] = field(default_factory=dict)
    reinforcement_mapping: dict[str, str] = field(default_factory=dict)
    human_review_required: bool = False


class AssessmentVerifierRegistry:
    def __init__(self) -> None:
        self._entries: dict[tuple[str, str, str], AssessmentVerifierDescriptor] = {}

    def register(self, descriptor: AssessmentVerifierDescriptor) -> None:
        key = (
            descriptor.assessment_type,
            descriptor.specification_version,
            descriptor.response_schema_version,
        )
        if key in self._entries:
            raise Stage13ValidationError("duplicate assessment verifier")
        self._entries[key] = descriptor

    def resolve(
        self,
        assessment_type: str,
        specification_version: str,
        response_schema_version: str,
    ) -> AssessmentVerifierDescriptor:
        descriptor = self._entries.get(
            (assessment_type, specification_version, response_schema_version)
        )
        if descriptor is None:
            raise Stage13ValidationError("unsupported assessment verifier")
        return descriptor


class AssessmentExecutionState(StrEnum):
    STARTED = "STARTED"
    SUBMITTED = "SUBMITTED"
    VALIDATING = "VALIDATING"
    REJECTED_VALIDATION = "REJECTED_VALIDATION"
    VERIFYING = "VERIFYING"
    VERIFIED = "VERIFIED"
    REQUIRES_REVIEW = "REQUIRES_REVIEW"
    FEEDBACK_READY = "FEEDBACK_READY"
    INVALIDATED = "INVALIDATED"
    FAILED_INFRASTRUCTURE = "FAILED_INFRASTRUCTURE"


@dataclass(frozen=True, slots=True)
class AssessmentExecution:
    assessment_spec_id: str
    assessment_spec_version: str
    package_id: str
    content_version_id: str
    publication_release_id: str | None
    verifier_id: str
    verifier_version: str
    result: VerificationResult
    state: AssessmentExecutionState = AssessmentExecutionState.VERIFIED
    result_hash: str = ""


@dataclass(frozen=True, slots=True)
class ReasoningComparison:
    status: str
    matched_concepts: tuple[str, ...] = ()
    missing_concepts: tuple[str, ...] = ()
    contradictory_concepts: tuple[str, ...] = ()


def compare_governed_reasoning(
    required_concepts: tuple[str, ...],
    required_relationships: tuple[tuple[str, str], ...],
    response_concepts: tuple[str, ...],
    response_relationships: tuple[tuple[str, str], ...],
) -> ReasoningComparison:
    """Compare only a specification-owned, machine-verifiable contract."""
    required = set(required_concepts)
    received = set(response_concepts)
    missing = tuple(sorted(required - received))
    matched = tuple(sorted(required & received))
    contradictions = tuple(
        f"{left}->{right}"
        for left, right in required_relationships
        if (left, right) not in response_relationships
    )
    if not required and not required_relationships:
        return ReasoningComparison("REQUIRES_REVIEW")
    status = "REASONING_MATCHED"
    if contradictions:
        status = "REASONING_CONTRADICTED"
    elif missing:
        status = "REASONING_PARTIALLY_MATCHED"
    return ReasoningComparison(status, matched, missing, contradictions)


def verify_assessment(
    registry: AssessmentVerifierRegistry,
    *,
    assessment_type: str,
    assessment_spec_id: str,
    assessment_spec_version: str,
    response_schema_version: str,
    package_id: str,
    content_version_id: str,
    publication_release_id: str | None,
    expected: Any,
    response: Any,
) -> AssessmentExecution:
    descriptor = registry.resolve(assessment_type, assessment_spec_version, response_schema_version)
    result = descriptor.verifier.verify(expected, response)
    result = replace(
        result,
        misconception_ids=tuple(
            descriptor.misconception_mapping[key]
            for key in result.rule_outcomes
            if key in descriptor.misconception_mapping
        ),
        reinforcement_ids=tuple(
            descriptor.reinforcement_mapping[key]
            for key in result.rule_outcomes
            if key in descriptor.reinforcement_mapping
        ),
        requires_human_review=descriptor.human_review_required,
    )
    result_hash = hashlib.sha256(
        repr(
            (
                result.verifier_id,
                result.verifier_version,
                result.status,
                result.rule_outcomes,
                result.reasoning_status,
            )
        ).encode()
    ).hexdigest()
    return AssessmentExecution(
        assessment_spec_id,
        assessment_spec_version,
        package_id,
        content_version_id,
        publication_release_id,
        descriptor.verifier_id,
        descriptor.verifier_version,
        result,
        AssessmentExecutionState.REQUIRES_REVIEW
        if result.requires_human_review
        else AssessmentExecutionState.VERIFIED,
        result_hash,
    )

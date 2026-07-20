"""Transparent feedback, misconception and reinforcement mapping."""

from __future__ import annotations

import hashlib
from collections.abc import Mapping
from dataclasses import dataclass

from .assessment import VerificationResult
from .runtime import Stage13ValidationError, canonical_json


@dataclass(frozen=True, slots=True)
class FeedbackTemplate:
    template_id: str
    template_version: str
    correct_text: str
    incorrect_text: str


@dataclass(frozen=True, slots=True)
class FeedbackMaterialization:
    feedback_id: str
    template_id: str
    template_version: str
    status: str
    text: str
    misconception_ids: tuple[str, ...]
    reinforcement_ids: tuple[str, ...]
    content_hash: str


def materialize_feedback(
    result: VerificationResult,
    template: FeedbackTemplate,
    *,
    misconception_mapping: Mapping[str, str] | None = None,
    reinforcement_mapping: Mapping[str, str] | None = None,
) -> FeedbackMaterialization:
    misconception_mapping = misconception_mapping or {}
    reinforcement_mapping = reinforcement_mapping or {}
    mapped_misconceptions = tuple(
        misconception_mapping[key] for key in result.rule_outcomes if key in misconception_mapping
    )
    mapped_reinforcement = tuple(
        reinforcement_mapping[key] for key in result.rule_outcomes if key in reinforcement_mapping
    )
    text = template.correct_text if result.status == "CORRECT" else template.incorrect_text
    payload = {
        "template_id": template.template_id,
        "template_version": template.template_version,
        "status": result.status,
        "text": text,
        "misconception_ids": mapped_misconceptions,
        "reinforcement_ids": mapped_reinforcement,
    }
    content_hash = hashlib.sha256(canonical_json(payload).encode()).hexdigest()
    return FeedbackMaterialization(
        feedback_id=f"feedback:{content_hash[:24]}",
        template_id=template.template_id,
        template_version=template.template_version,
        status=result.status,
        text=text,
        misconception_ids=mapped_misconceptions,
        reinforcement_ids=mapped_reinforcement,
        content_hash=content_hash,
    )


def reject_hidden_mastery_fields(payload: Mapping[str, object]) -> None:
    forbidden = {
        "mastery_score",
        "mastery_probability",
        "hidden_skill_level",
        "learner_intelligence",
        "behavioral_rank",
        "predicted_competency",
        "latent_ability",
        "engagement_quality_score",
        "intelligence_score",
    }
    present = forbidden.intersection(payload)
    if present:
        raise Stage13ValidationError(f"forbidden learner inference fields: {sorted(present)}")

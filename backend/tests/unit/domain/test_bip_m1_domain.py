from __future__ import annotations

import json
from pathlib import Path

import pytest

from neuralverse_backend.cross_front.bip_m1 import (
    ContractError,
    RawCanonicalContract,
    adapt_contract,
)
from neuralverse_backend.domain.bip_m1 import (
    AgentAttribution,
    AgentContributionRecord,
    ContentBlock,
    ContractDigest,
    DraftContentVersion,
    LearningPackageDraftAggregate,
    PublicationReadinessRecommendationRecord,
    validate_cross_contract_consistency,
)

FIXTURES = json.loads(
    (Path(__file__).parents[2] / "fixtures" / "bip_m1_contracts.json").read_text()
)


def test_domain_projection_preserves_agent_attribution_and_confidence() -> None:
    from neuralverse_backend.domain.bip_m1 import domain_projection

    domain = adapt_contract(
        RawCanonicalContract.from_value(
            FIXTURES["AgentContribution"], expected_name="AgentContribution"
        )
    )
    contribution = domain_projection(domain)
    assert isinstance(contribution, AgentContributionRecord)
    assert contribution.attribution.agent_id == "agent:research"
    assert contribution.confidence == 0.9
    assert contribution.structured_payload["nestedUnknown"] == {"keep": True}
    with pytest.raises(TypeError):
        contribution.structured_payload["nestedUnknown"]["keep"] = False  # type: ignore[index]


def test_draft_snapshot_is_immutable_and_ordered() -> None:
    block = ContentBlock("block:1", "text", {"future": {"retain": True}}, 0)
    snapshot = DraftContentVersion("1.0.0", (block,), ("block:1",), "DRAFT")
    assert snapshot.blocks[0].payload["future"] == {"retain": True}
    with pytest.raises(TypeError):
        snapshot.blocks[0].payload["future"] = {}  # type: ignore[index]


def test_duplicate_or_reordered_blocks_are_rejected() -> None:
    with pytest.raises(ContractError):
        DraftContentVersion(
            "1.0.0", (ContentBlock("block:1", "text", {}, 0),), ("block:1", "block:1"), "DRAFT"
        )


def test_cross_contract_identity_and_readiness_consistency() -> None:
    from neuralverse_backend.domain.bip_m1 import domain_projection

    draft = domain_projection(
        adapt_contract(
            RawCanonicalContract.from_value(
                FIXTURES["LearningPackageDraft"], expected_name="LearningPackageDraft"
            )
        )
    )
    recommendation = domain_projection(
        adapt_contract(
            RawCanonicalContract.from_value(
                FIXTURES["PublicationReadinessRecommendation"],
                expected_name="PublicationReadinessRecommendation",
            )
        )
    )
    assert isinstance(draft, LearningPackageDraftAggregate)
    assert isinstance(recommendation, PublicationReadinessRecommendationRecord)
    validate_cross_contract_consistency(draft, readiness=recommendation)
    mismatched = PublicationReadinessRecommendationRecord(
        "package:other", "1.0.0", "HUMAN_REVIEW_REQUIRED", (), (), (), "reason"
    )
    with pytest.raises(ContractError):
        validate_cross_contract_consistency(draft, readiness=mismatched)


def test_value_objects_reject_invalid_identity_and_digest() -> None:
    with pytest.raises(ValueError):
        AgentAttribution("", "1.0.0", "contribution:1")
    with pytest.raises(ValueError):
        ContractDigest("md5", "a" * 32)


def test_draft_rejects_dangling_citation_source() -> None:
    value = dict(FIXTURES["LearningPackageDraft"])
    value["citations"] = [{"citationId": "citation:1", "sourceId": "source:missing"}]
    with pytest.raises(ContractError):
        adapt_contract(RawCanonicalContract.from_value(value, expected_name="LearningPackageDraft"))

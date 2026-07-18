from __future__ import annotations

import pytest

from neuralverse_backend.reference_package import (
    SVD_ACP_PACKAGE_ID,
    SVD_SEMANTIC_KEY,
    SVD_TITLE,
    ReferencePackageError,
    build_reference_release_plan,
)


def _draft() -> dict[str, object]:
    sources = [{"sourceId": f"source-{index}"} for index in range(6)]
    citations = [
        {"citationId": f"citation-{index}", "sourceId": f"source-{index}"} for index in range(6)
    ]
    blocks = [{"contentBlockId": f"block-{index}"} for index in range(23)]
    return {
        "packageId": SVD_ACP_PACKAGE_ID,
        "title": SVD_TITLE,
        "metadata": {"semanticKey": SVD_SEMANTIC_KEY, "packageType": "CONCEPT_IMPLEMENTATION_LAB"},
        "contentBlocks": blocks,
        "blockOrder": [item["contentBlockId"] for item in blocks],
        "sourceManifest": {"sources": sources},
        "citations": citations,
        "assetRequestIds": [f"asset-{index}" for index in range(6)],
        "laboratoryReferences": ["laboratory-svd"],
        "assessmentReferences": ["assessment-svd"],
    }


def test_builds_only_the_authorized_reference_release_plan() -> None:
    plan = build_reference_release_plan(
        draft=_draft(),
        draft_bytes=b"acp-produced-draft",
        readiness={"packageId": SVD_ACP_PACKAGE_ID, "recommendation": "READY_FOR_PUBLICATION"},
        readiness_bytes=b"acp-produced-readiness",
        curriculum_node_id="curriculum-node-svd",
    )
    assert plan.status == "RELEASED"
    assert len(plan.ordered_block_ids) == 23
    assert len(plan.source_ids) == len(plan.citation_ids) == 6


def test_mixed_or_incomplete_content_cannot_be_released() -> None:
    draft = _draft()
    draft["blockOrder"] = list(draft["blockOrder"][:-1])  # type: ignore[index]
    with pytest.raises(ReferencePackageError, match="block order"):
        build_reference_release_plan(
            draft=draft,
            draft_bytes=b"draft",
            readiness={
                "packageId": SVD_ACP_PACKAGE_ID,
                "recommendation": "READY_FOR_PUBLICATION",
            },
            readiness_bytes=b"readiness",
            curriculum_node_id="curriculum-node-svd",
        )

"""Tests for curriculum domain context."""

from __future__ import annotations

import pytest

from neuralverse_backend.domain.curriculum import (
    CurriculumEdge,
    CurriculumEdgeType,
    CurriculumNode,
    CurriculumNodeType,
)
from neuralverse_backend.domain.shared.errors import InvariantViolation
from neuralverse_backend.domain.shared.identifiers import CurriculumEdgeId, CurriculumNodeId


class TestCurriculumNode:
    def test_creation(self):
        node_id = CurriculumNodeId.generate()
        node = CurriculumNode(
            node_id=node_id,
            node_type=CurriculumNodeType.TOPIC,
            display_title="Linear Algebra",
            description="Basic linear algebra concepts",
        )
        assert node.id == node_id
        assert node.node_type == CurriculumNodeType.TOPIC
        assert node.display_title == "Linear Algebra"

    def test_update_title_does_not_change_identity(self):
        node_id = CurriculumNodeId.generate()
        node = CurriculumNode(
            node_id=node_id,
            node_type=CurriculumNodeType.CONCEPT,
            display_title="Old Title",
        )
        original_id = node.id
        node.update_title("New Title")
        assert node.id == original_id
        assert node.display_title == "New Title"


class TestCurriculumEdge:
    def test_creation(self):
        edge_id = CurriculumEdgeId.generate()
        source = CurriculumNodeId.generate()
        target = CurriculumNodeId.generate()
        edge = CurriculumEdge(
            edge_id=edge_id,
            source_id=source,
            target_id=target,
            edge_type=CurriculumEdgeType.DEPENDS_ON,
        )
        assert edge.source_id == source
        assert edge.target_id == target

    def test_self_loop_rejected(self):
        node_id = CurriculumNodeId.generate()
        edge_id = CurriculumEdgeId.generate()
        with pytest.raises(InvariantViolation, match="cannot be identical"):
            CurriculumEdge(
                edge_id=edge_id,
                source_id=node_id,
                target_id=node_id,
                edge_type=CurriculumEdgeType.DEPENDS_ON,
            )

    def test_negative_depth_rejected(self):
        with pytest.raises(InvariantViolation, match="non-negative"):
            CurriculumEdge(
                edge_id=CurriculumEdgeId.generate(),
                source_id=CurriculumNodeId.generate(),
                target_id=CurriculumNodeId.generate(),
                edge_type=CurriculumEdgeType.REQUIRES,
                required_depth=-1,
            )

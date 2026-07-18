"""Tests for assets context."""

from __future__ import annotations

import pytest

from neuralverse_backend.domain.assets import Asset, AssetType, AssetVersion, VisualizationSpec
from neuralverse_backend.domain.shared.errors import InvariantViolation
from neuralverse_backend.domain.shared.identifiers import AssetId, AssetVersionId, VisualizationSpecId
from neuralverse_backend.domain.shared.lifecycle import LifecycleState


class TestAsset:
    def test_creation(self):
        aid = AssetId.generate()
        asset = Asset(asset_id=aid, asset_type=AssetType.IMAGE, display_name="Chart")
        assert asset.id == aid

    def test_add_version(self):
        aid = AssetId.generate()
        vid = AssetVersionId.generate()
        asset = Asset(asset_id=aid, asset_type=AssetType.IMAGE)
        ver = AssetVersion(
            version_id=vid,
            asset_id=aid,
            media_type="image/png",
            content_hash="abc123",
        )
        asset.add_version(ver)
        assert len(asset.versions) == 1

    def test_add_version_wrong_asset_fails(self):
        aid = AssetId.generate()
        wrong_aid = AssetId.generate()
        vid = AssetVersionId.generate()
        asset = Asset(asset_id=aid, asset_type=AssetType.IMAGE)
        ver = AssetVersion(
            version_id=vid,
            asset_id=wrong_aid,
            media_type="image/png",
            content_hash="abc123",
        )
        with pytest.raises(InvariantViolation, match="references asset"):
            asset.add_version(ver)


class TestAssetVersion:
    def test_exact_asset_version_id_required(self):
        vid = AssetVersionId.generate()
        aid = AssetId.generate()
        ver = AssetVersion(
            version_id=vid,
            asset_id=aid,
            media_type="image/png",
            content_hash="hash",
        )
        assert ver.asset_id == aid
        assert ver.id == vid


class TestVisualizationSpec:
    def test_creation(self):
        sid = VisualizationSpecId.generate()
        spec = VisualizationSpec(
            spec_id=sid,
            visualization_type="network_graph",
            requirements={"layout": "force-directed"},
        )
        assert spec.id == sid
        assert spec.visualization_type == "network_graph"

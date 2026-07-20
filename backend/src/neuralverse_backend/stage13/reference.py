"""Governed reference vertical slice used by deterministic Stage 13 tests."""

from __future__ import annotations

import random
from collections.abc import Mapping
from typing import Any

from .assessment import (
    AssessmentVerifierDescriptor,
    AssessmentVerifierRegistry,
    NumericToleranceVerifier,
)
from .runtime import (
    DeterminismClass,
    ExpectedObservation,
    ResourcePolicy,
    SimulationDescriptor,
    SimulationRegistry,
    TrustedDeterministicSimulationAdapter,
)

REFERENCE_SPEC_ID = "lab:svd-compression"
REFERENCE_SPEC_VERSION = "1.0.0"
REFERENCE_SIMULATION_ID = "svd-compression"
REFERENCE_SIMULATION_VERSION = "1.0.0"


def svd_compression_simulation(
    parameters: Mapping[str, Any], rng: random.Random
) -> Mapping[str, Any]:
    """A tiny pure simulation: rank controls retained energy deterministically."""
    del rng
    rank = parameters["rank"]
    return {
        "retained_rank": rank,
        "reconstruction_error": round(1.0 / rank, 8),
        "score": rank,
    }


def reference_simulation_registry() -> SimulationRegistry:
    registry = SimulationRegistry()
    registry.register(
        SimulationDescriptor(
            simulation_id=REFERENCE_SIMULATION_ID,
            simulation_version=REFERENCE_SIMULATION_VERSION,
            laboratory_spec_ids=frozenset({REFERENCE_SPEC_ID, "lab:svd"}),
            laboratory_spec_version=REFERENCE_SPEC_VERSION,
            adapter_id="trusted-deterministic-simulation",
            adapter_version="1.0.0",
            determinism=DeterminismClass.BITWISE_REPRODUCIBLE,
            parameter_schema={"rank": {"type": int, "required": True, "min": 1, "max": 8}},
            resource_policy=ResourcePolicy("lab-reference", "1.0.0"),
            expected_observations=(ExpectedObservation("obs:rank", "score", 4),),
            implementation_digest="sha256:stage13-reference-svd",
        )
    )
    return registry


def reference_simulation_adapter() -> TrustedDeterministicSimulationAdapter:
    return TrustedDeterministicSimulationAdapter(
        {(REFERENCE_SIMULATION_ID, REFERENCE_SIMULATION_VERSION): svd_compression_simulation}
    )


def reference_assessment_registry() -> AssessmentVerifierRegistry:
    registry = AssessmentVerifierRegistry()
    registry.register(
        AssessmentVerifierDescriptor(
            verifier_id="numeric-tolerance",
            verifier_version="1.0.0",
            assessment_type="svd-retained-rank",
            specification_version="1.0.0",
            response_schema_version="number:1.0.0",
            verifier=NumericToleranceVerifier(0.0),
            misconception_mapping={"INCORRECT": "misconception:rank-selection"},
            reinforcement_mapping={"INCORRECT": "lab:svd-compression"},
        )
    )
    return registry

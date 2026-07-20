from __future__ import annotations

import math
import zipfile
from dataclasses import replace
from io import BytesIO

import pytest

from neuralverse_backend.stage13 import (
    AssessmentEvidenceRecord,
    AssessmentVerifierDescriptor,
    AssessmentVerifierRegistry,
    DeterminismClass,
    ExactMatchVerifier,
    ExecuteLaboratoryRunWorkflow,
    ExecutionRequest,
    ExecutionState,
    ExpectedObservation,
    FeedbackTemplate,
    InMemoryEvidenceStore,
    InMemoryLaboratoryRunStore,
    IsolatedContainerSimulationAdapter,
    LaboratoryExecutor,
    NumericToleranceVerifier,
    ResourcePolicy,
    SimulationDescriptor,
    SimulationRegistry,
    Stage13ExecutionService,
    Stage13InMemoryStore,
    Stage13ValidationError,
    TrustedDeterministicSimulationAdapter,
    build_portfolio_export,
    canonical_input_hash,
    materialize_feedback,
    reference_assessment_registry,
    reference_simulation_adapter,
    reference_simulation_registry,
    reject_hidden_mastery_fields,
    verify_assessment,
)


def _executor() -> LaboratoryExecutor:
    policy = ResourcePolicy("lab-reference", "1.0.0")
    descriptor = SimulationDescriptor(
        simulation_id="svd-compression",
        simulation_version="1.0.0",
        laboratory_spec_ids=frozenset({"lab:svd"}),
        laboratory_spec_version="1.0.0",
        adapter_id="trusted-deterministic-simulation",
        adapter_version="1.0.0",
        determinism=DeterminismClass.BITWISE_REPRODUCIBLE,
        parameter_schema={
            "rank": {"type": int, "required": True, "min": 1, "max": 8},
        },
        resource_policy=policy,
        expected_observations=(ExpectedObservation("obs:rank", "score", 4),),
        implementation_digest="sha256:reference-svd",
    )
    registry = SimulationRegistry()
    registry.register(descriptor)
    adapter = TrustedDeterministicSimulationAdapter(
        {("svd-compression", "1.0.0"): lambda params, _rng: {"score": params["rank"]}}
    )
    return LaboratoryExecutor(registry, adapter)


def _request(run_id: str = "run:1", rank: int = 4, seed: int = 7) -> ExecutionRequest:
    return ExecutionRequest(
        run_id=run_id,
        learner_id="learner:1",
        laboratory_spec_id="lab:svd",
        laboratory_spec_version="1.0.0",
        package_id="package:svd",
        content_version_id="content:1",
        publication_release_id="release:1",
        simulation_id="svd-compression",
        simulation_version="1.0.0",
        parameters={"rank": rank},
        seed=seed,
    )


def test_canonical_hash_is_order_independent_and_rejects_nonfinite() -> None:
    assert canonical_input_hash({"b": 2, "a": 1}) == canonical_input_hash({"a": 1, "b": 2})
    with pytest.raises(Stage13ValidationError):
        canonical_input_hash({"value": math.nan})


def test_deterministic_execution_replay_and_observations() -> None:
    executor = _executor()
    result = executor.execute(_request())
    assert result.state is ExecutionState.SUCCEEDED
    assert result.observations[0].status == "MATCHED_EXPECTATION"
    replay = executor.replay("run:1", "run:2", reason="reproducibility")
    assert replay.request.replay_of_run_id == "run:1"
    assert replay.replay_comparison == "BITWISE_MATCH"
    assert executor.execute(_request()) is result


def test_divergence_is_scientific_not_infrastructure_failure() -> None:
    result = _executor().execute(_request(rank=3))
    assert result.state is ExecutionState.SCIENTIFIC_NON_CONVERGENCE
    assert result.observations[0].status == "DIVERGED_FROM_EXPECTATION"


def test_unknown_parameter_is_rejected_and_cancel_is_explicit() -> None:
    executor = _executor()
    bad = replace(_request(), parameters={"rank": 4, "unknown": 1})
    assert executor.execute(bad).state is ExecutionState.REJECTED_VALIDATION
    executor.request_cancellation("run:cancel")
    assert executor.execute(_request("run:cancel")).state is ExecutionState.CANCELLED


def test_portfolio_export_is_bounded_and_portable() -> None:
    result = _executor().execute(_request())
    archive_bytes = build_portfolio_export(
        result,
        learner_notes="my note",
        artifacts={"plot.json": b"{}"},
    )
    with zipfile.ZipFile(BytesIO(archive_bytes)) as archive:
        names = archive.namelist()
        assert names == sorted(names)
        assert "manifest.json" in names
        assert "evidence/plot.json" in names
        assert b"password" not in archive.read("README.md")
    with pytest.raises(ValueError):
        build_portfolio_export(result, artifacts={"../secret": b"bad"})


def test_assessment_registry_and_transparent_verification() -> None:
    registry = AssessmentVerifierRegistry()
    registry.register(
        AssessmentVerifierDescriptor(
            verifier_id="exact-normalized-match",
            verifier_version="1.0.0",
            assessment_type="short-answer",
            specification_version="1.0.0",
            response_schema_version="answer:1.0.0",
            verifier=ExactMatchVerifier(),
            misconception_mapping={"INCORRECT": "misconception:unknown-term"},
            reinforcement_mapping={"INCORRECT": "reinforcement:review-term"},
        )
    )
    correct = verify_assessment(
        registry,
        assessment_type="short-answer",
        assessment_spec_id="assessment:1",
        assessment_spec_version="1.0.0",
        response_schema_version="answer:1.0.0",
        package_id="package:svd",
        content_version_id="content:1",
        publication_release_id="release:1",
        expected="SVD",
        response=" svd ",
    )
    assert correct.result.status == "CORRECT"
    assert correct.verifier_id == "exact-normalized-match"
    with pytest.raises(Stage13ValidationError):
        registry.register(
            AssessmentVerifierDescriptor(
                verifier_id="duplicate",
                verifier_version="1.0.0",
                assessment_type="short-answer",
                specification_version="1.0.0",
                response_schema_version="answer:1.0.0",
                verifier=ExactMatchVerifier(),
            )
        )
    numeric = NumericToleranceVerifier(0.01).verify(1.0, 1.005)
    assert numeric.status == "CORRECT"


def test_reference_workflow_is_idempotent_and_projects_progress() -> None:
    executor = LaboratoryExecutor(reference_simulation_registry(), reference_simulation_adapter())
    store = InMemoryLaboratoryRunStore()
    workflow = ExecuteLaboratoryRunWorkflow(executor, store)
    request = _request()
    first = workflow.run(request)
    assert workflow.run(request) is first
    assert [item.state for item in workflow.progress[request.run_id]] == [
        ExecutionState.REQUESTED,
        ExecutionState.VALIDATING,
        ExecutionState.SUCCEEDED,
    ]
    replay = workflow.replay(request.run_id, "run:replay", "audit")
    assert replay.request.replay_of_run_id == request.run_id


def test_container_boundary_is_immutable_and_non_executing() -> None:
    adapter = IsolatedContainerSimulationAdapter(
        approved_images={"svd-compression": "sha256:stage13-reference"},
        approved_entrypoints={"trusted-registry": ("run",)},
    )
    descriptor = _executor().registry.resolve("lab:svd", "1.0.0", "svd-compression")
    plan = adapter.prepare_execution(descriptor, {"rank": 4}, 7)
    assert plan["network"] == "DENY_ALL"
    assert plan["host_mounts"] == ()
    with pytest.raises(Stage13ValidationError):
        adapter.execute(descriptor, {"rank": 4}, 7)


def test_feedback_evidence_and_inference_boundary() -> None:
    registry = reference_assessment_registry()
    execution = verify_assessment(
        registry,
        assessment_type="svd-retained-rank",
        assessment_spec_id="assessment:rank",
        assessment_spec_version="1.0.0",
        response_schema_version="number:1.0.0",
        package_id="package:svd",
        content_version_id="content:1",
        publication_release_id="release:1",
        expected=4,
        response=3,
    )
    feedback = materialize_feedback(
        execution.result,
        FeedbackTemplate("template:rank", "1.0.0", "Correct.", "Review the selected rank."),
        misconception_mapping={"INCORRECT": "misconception:rank-selection"},
        reinforcement_mapping={"INCORRECT": "lab:svd-compression"},
    )
    assert feedback.content_hash
    with pytest.raises(Stage13ValidationError):
        reject_hidden_mastery_fields({"mastery_score": 0.8})
    store = InMemoryEvidenceStore()
    record = store.put(
        run_id="run:1",
        learner_id="learner:1",
        artifact_type="plot.json",
        mime_type="application/json",
        content=b"{}",
        provenance="run:1",
        alt_text="A deterministic plot.",
    )
    assert store.get(record.artifact_id, learner_id="learner:1") == b"{}"
    with pytest.raises(KeyError):
        store.get(record.artifact_id, learner_id="learner:2")


def test_execution_failure_and_resource_limit_are_explicit() -> None:
    policy = ResourcePolicy("small", "1.0.0", stdout_bytes=8)
    descriptor = SimulationDescriptor(
        simulation_id="failure",
        simulation_version="1.0.0",
        laboratory_spec_ids=frozenset({"lab:failure"}),
        laboratory_spec_version="1.0.0",
        adapter_id="trusted-deterministic-simulation",
        adapter_version="1.0.0",
        determinism=DeterminismClass.BITWISE_REPRODUCIBLE,
        parameter_schema={},
        resource_policy=policy,
        implementation_digest="sha256:failure",
    )
    registry = SimulationRegistry()
    registry.register(descriptor)
    adapter = TrustedDeterministicSimulationAdapter(
        {
            ("failure", "1.0.0"): lambda _params, _rng: {"long": "too-large"},
        }
    )
    executor = LaboratoryExecutor(registry, adapter)
    result = executor.execute(
        replace(
            _request(),
            laboratory_spec_id="lab:failure",
            simulation_id="failure",
            simulation_version="1.0.0",
            parameters={},
        )
    )
    assert result.state is ExecutionState.RESOURCE_LIMIT_EXCEEDED


def test_persistence_contracts_are_idempotent_and_owner_scoped() -> None:
    executor = _executor()
    result = executor.execute(_request())
    store = Stage13InMemoryStore()
    snapshot = store.save_run(result)
    assert store.save_run(result) is snapshot
    assert store.resolve_idempotency("command:1", "hash:1") is None
    with pytest.raises(Stage13ValidationError):
        store.resolve_idempotency("command:1", "hash:2")
    execution = verify_assessment(
        reference_assessment_registry(),
        assessment_type="svd-retained-rank",
        assessment_spec_id="assessment:rank",
        assessment_spec_version="1.0.0",
        response_schema_version="number:1.0.0",
        package_id="package:svd",
        content_version_id="content:1",
        publication_release_id=None,
        expected=4,
        response=4,
    )
    evidence = AssessmentEvidenceRecord.from_execution(
        execution, attempt_id="attempt:1", learner_id="learner:1"
    )
    assert store.save_assessment_evidence(evidence) is evidence


def test_application_service_preserves_single_execution_boundary() -> None:
    executor = LaboratoryExecutor(reference_simulation_registry(), reference_simulation_adapter())
    store = InMemoryLaboratoryRunStore()
    workflow = ExecuteLaboratoryRunWorkflow(executor, store)
    service = Stage13ExecutionService(
        workflow=workflow,
        assessment_registry=reference_assessment_registry(),
        store=Stage13InMemoryStore(),
    )
    result = service.submit_laboratory(_request())
    assert service.submit_laboratory(_request()) is result
    assert service.export_laboratory(result).startswith(b"PK")

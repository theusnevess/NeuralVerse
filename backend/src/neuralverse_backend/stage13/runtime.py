"""Bounded deterministic laboratory execution contracts.

Only code registered by the application can execute.  There is deliberately
no import-by-string, shell, notebook, container or network escape hatch here.
"""

from __future__ import annotations

import hashlib
import json
import math
import platform
import random
import secrets
from abc import ABC, abstractmethod
from collections.abc import Callable, Mapping
from dataclasses import dataclass, field
from datetime import UTC, datetime
from enum import StrEnum
from typing import Any


class Stage13ValidationError(ValueError):
    """A governed request, registry or policy is invalid."""


class Stage13InfrastructureError(RuntimeError):
    """An execution host or adapter failed after validation."""


class Stage13ResourceLimitError(RuntimeError):
    """The approved execution exceeded a bounded output/resource policy."""


class ExecutionState(StrEnum):
    REQUESTED = "REQUESTED"
    VALIDATING = "VALIDATING"
    REJECTED_VALIDATION = "REJECTED_VALIDATION"
    QUEUED = "QUEUED"
    STARTING = "STARTING"
    RUNNING = "RUNNING"
    CANCELLATION_REQUESTED = "CANCELLATION_REQUESTED"
    CANCELLING = "CANCELLING"
    CANCELLED = "CANCELLED"
    SUCCEEDED = "SUCCEEDED"
    SCIENTIFIC_NON_CONVERGENCE = "SCIENTIFIC_NON_CONVERGENCE"
    FAILED_INFRASTRUCTURE = "FAILED_INFRASTRUCTURE"
    TIMED_OUT = "TIMED_OUT"
    RESOURCE_LIMIT_EXCEEDED = "RESOURCE_LIMIT_EXCEEDED"
    SECURITY_POLICY_REJECTED = "SECURITY_POLICY_REJECTED"


class DeterminismClass(StrEnum):
    BITWISE_REPRODUCIBLE = "BITWISE_REPRODUCIBLE"
    NUMERICALLY_REPRODUCIBLE = "NUMERICALLY_REPRODUCIBLE"
    DETERMINISTIC_WITH_DECLARED_TOLERANCE = "DETERMINISTIC_WITH_DECLARED_TOLERANCE"


FINAL_STATES = frozenset(
    {
        ExecutionState.CANCELLED,
        ExecutionState.SUCCEEDED,
        ExecutionState.SCIENTIFIC_NON_CONVERGENCE,
        ExecutionState.FAILED_INFRASTRUCTURE,
        ExecutionState.TIMED_OUT,
        ExecutionState.RESOURCE_LIMIT_EXCEEDED,
        ExecutionState.SECURITY_POLICY_REJECTED,
    }
)


def _reject_nonfinite(value: Any, path: str = "$") -> None:
    if isinstance(value, float) and not math.isfinite(value):
        raise Stage13ValidationError(f"non-finite number at {path}")
    if isinstance(value, Mapping):
        for key, item in value.items():
            _reject_nonfinite(item, f"{path}.{key}")
    elif isinstance(value, (list, tuple)):
        for index, item in enumerate(value):
            _reject_nonfinite(item, f"{path}[{index}]")


def canonical_json(value: Any) -> str:
    """Serialize semantic inputs independent of Python object ordering."""

    _reject_nonfinite(value)
    try:
        return json.dumps(
            value,
            ensure_ascii=False,
            sort_keys=True,
            separators=(",", ":"),
            allow_nan=False,
        )
    except (TypeError, ValueError) as error:
        raise Stage13ValidationError("inputs are not canonical JSON") from error


def canonical_input_hash(request: Mapping[str, Any]) -> str:
    return hashlib.sha256(canonical_json(request).encode("utf-8")).hexdigest()


@dataclass(frozen=True, slots=True)
class ResourcePolicy:
    policy_id: str
    policy_version: str
    cpu_seconds: float = 5.0
    memory_bytes: int = 256 * 1024 * 1024
    process_limit: int = 1
    timeout_seconds: float = 5.0
    cancellation_grace_seconds: float = 0.25
    stdout_bytes: int = 64 * 1024
    stderr_bytes: int = 64 * 1024
    artifact_count: int = 16
    artifact_bytes: int = 2 * 1024 * 1024
    temporary_filesystem_bytes: int = 16 * 1024 * 1024
    network_policy_id: str = "DENY_ALL:1.0.0"
    filesystem_policy_id: str = "EPHEMERAL_READ_ONLY:1.0.0"
    concurrency_class: str = "laboratory-default"

    def __post_init__(self) -> None:
        if not self.policy_id.strip() or not self.policy_version.strip():
            raise Stage13ValidationError("resource policy identity is required")
        if any(
            value <= 0
            for value in (
                self.cpu_seconds,
                self.memory_bytes,
                self.process_limit,
                self.timeout_seconds,
                self.stdout_bytes,
                self.stderr_bytes,
                self.artifact_count,
                self.artifact_bytes,
                self.temporary_filesystem_bytes,
            )
        ):
            raise Stage13ValidationError("resource limits must be positive")
        if self.network_policy_id != "DENY_ALL:1.0.0":
            raise Stage13ValidationError("reference runtime only permits DENY_ALL")
        if self.filesystem_policy_id != "EPHEMERAL_READ_ONLY:1.0.0":
            raise Stage13ValidationError("reference runtime only permits ephemeral filesystem")


@dataclass(frozen=True, slots=True)
class ExpectedObservation:
    observation_id: str
    metric: str
    expected: Any
    tolerance: float = 0.0
    explanation_ref: str = ""


@dataclass(frozen=True, slots=True)
class ActualObservation:
    observation_id: str
    value: Any
    status: str
    expected_observation_id: str | None = None
    tolerance_used: float = 0.0


@dataclass(frozen=True, slots=True)
class SimulationDescriptor:
    simulation_id: str
    simulation_version: str
    laboratory_spec_ids: frozenset[str]
    laboratory_spec_version: str
    adapter_id: str
    adapter_version: str
    determinism: DeterminismClass
    parameter_schema: Mapping[str, Mapping[str, Any]]
    resource_policy: ResourcePolicy
    expected_observations: tuple[ExpectedObservation, ...] = ()
    implementation_digest: str = ""
    entrypoint_identity: str = "trusted-registry"
    network_policy_id: str = "DENY_ALL:1.0.0"
    filesystem_policy_id: str = "EPHEMERAL_READ_ONLY:1.0.0"
    artifact_policy_id: str = "BOUNDED_JSON:1.0.0"

    def __post_init__(self) -> None:
        if not self.simulation_id.strip() or not self.simulation_version.strip():
            raise Stage13ValidationError("simulation identity is required")
        if not self.laboratory_spec_ids or not self.laboratory_spec_version.strip():
            raise Stage13ValidationError("laboratory specification identity is required")
        if not self.implementation_digest:
            raise Stage13ValidationError("implementation digest is required")
        if self.network_policy_id != "DENY_ALL:1.0.0":
            raise Stage13ValidationError("reference simulations cannot use a network")


class SimulationRegistry:
    """In-process allowlist; registration is code/configuration controlled."""

    def __init__(self) -> None:
        self._entries: dict[tuple[str, str, str], SimulationDescriptor] = {}

    def register(self, descriptor: SimulationDescriptor) -> None:
        for spec_id in descriptor.laboratory_spec_ids:
            key = (spec_id, descriptor.laboratory_spec_version, descriptor.simulation_id)
            if key in self._entries:
                raise Stage13ValidationError("duplicate simulation registration")
            self._entries[key] = descriptor

    def resolve(
        self,
        spec_id: str,
        spec_version: str,
        simulation_id: str,
        simulation_version: str | None = None,
    ) -> SimulationDescriptor:
        descriptor = self._entries.get((spec_id, spec_version, simulation_id))
        if descriptor is None:
            raise Stage13ValidationError("unknown or unsupported simulation")
        if simulation_version is not None and descriptor.simulation_version != simulation_version:
            raise Stage13ValidationError("unsupported simulation version")
        return descriptor


@dataclass(frozen=True, slots=True)
class ExecutionEnvironment:
    adapter_id: str
    adapter_version: str
    simulation_id: str
    simulation_version: str
    implementation_digest: str
    dependency_lock_digest: str
    dataset_hashes: tuple[str, ...] = ()
    runtime_classification: str = "trusted-deterministic"
    architecture: str = field(default_factory=platform.machine)
    locale: str = "C.UTF-8"
    timezone: str = "UTC"
    determinism_policy_version: str = "determinism:1.0.0"
    resource_policy_version: str = "resource:1.0.0"


@dataclass(frozen=True, slots=True)
class ExecutionRequest:
    run_id: str
    learner_id: str
    laboratory_spec_id: str
    laboratory_spec_version: str
    package_id: str
    content_version_id: str
    publication_release_id: str | None
    simulation_id: str
    simulation_version: str
    parameters: Mapping[str, Any]
    seed: int | None = None
    replay_of_run_id: str | None = None


@dataclass(slots=True)
class LaboratoryResult:
    request: ExecutionRequest
    state: ExecutionState
    input_payload_sha256: str
    seed: int
    environment: ExecutionEnvironment
    observations: tuple[ActualObservation, ...] = ()
    outputs: Mapping[str, Any] = field(default_factory=dict)
    stdout: str = ""
    stderr: str = ""
    warnings: tuple[str, ...] = ()
    replay_comparison: str | None = None
    created_at: datetime = field(default_factory=lambda: datetime.now(UTC))
    completed_at: datetime | None = None


class LaboratoryRuntimeAdapter(ABC):
    adapter_id: str
    adapter_version: str

    @abstractmethod
    def describe_capabilities(self) -> Mapping[str, Any]:
        raise NotImplementedError

    def validate_execution_request(
        self, descriptor: SimulationDescriptor, parameters: Mapping[str, Any]
    ) -> None:
        """Validate the adapter-specific portion of a governed request."""
        validate_parameters(parameters, descriptor.parameter_schema)

    def prepare_execution(
        self, descriptor: SimulationDescriptor, parameters: Mapping[str, Any], seed: int
    ) -> Mapping[str, Any]:
        return {"simulation_id": descriptor.simulation_id, "seed": seed}

    def start_execution(self, prepared: Mapping[str, Any]) -> str:
        return str(prepared.get("simulation_id", "unknown"))

    def observe_execution(self, execution_handle: str) -> Mapping[str, Any]:
        return {"execution_handle": execution_handle, "state": "RUNNING"}

    def request_cancellation(self, execution_handle: str) -> None:
        del execution_handle

    def force_terminate(self, execution_handle: str) -> None:
        del execution_handle

    def collect_result(self, execution_handle: str) -> Mapping[str, Any]:
        del execution_handle
        raise Stage13ValidationError("adapter result collection is not available")

    def collect_artifacts(self, execution_handle: str) -> tuple[Mapping[str, Any], ...]:
        del execution_handle
        return ()

    def cleanup_execution(self, execution_handle: str) -> None:
        del execution_handle

    @abstractmethod
    def execute(
        self,
        descriptor: SimulationDescriptor,
        parameters: Mapping[str, Any],
        seed: int,
    ) -> Mapping[str, Any]:
        raise NotImplementedError


SimulationFunction = Callable[[Mapping[str, Any], random.Random], Mapping[str, Any]]


class TrustedDeterministicSimulationAdapter(LaboratoryRuntimeAdapter):
    """Executes only explicitly registered pure functions."""

    adapter_id = "trusted-deterministic-simulation"
    adapter_version = "1.0.0"

    def __init__(self, functions: Mapping[tuple[str, str], SimulationFunction]) -> None:
        self._functions = dict(functions)

    def describe_capabilities(self) -> Mapping[str, Any]:
        return {
            "adapter_id": self.adapter_id,
            "adapter_version": self.adapter_version,
            "network": "DENY_ALL",
            "filesystem": "NO_HOST_ACCESS",
            "determinism": "NUMERICALLY_REPRODUCIBLE",
        }

    def execute(
        self,
        descriptor: SimulationDescriptor,
        parameters: Mapping[str, Any],
        seed: int,
    ) -> Mapping[str, Any]:
        function = self._functions.get((descriptor.simulation_id, descriptor.simulation_version))
        if function is None:
            raise Stage13ValidationError("simulation implementation is not allowlisted")
        result = function(dict(parameters), random.Random(seed))
        if not isinstance(result, Mapping):
            raise Stage13ValidationError("simulation result must be a mapping")
        canonical_json(result)
        return dict(result)


class IsolatedContainerSimulationAdapter(LaboratoryRuntimeAdapter):
    """A plan-only boundary for approved immutable container simulations.

    Container execution is deliberately not performed by the API process.  A
    future restricted worker can consume the validated plan without widening
    this interface into a generic command or image runner.
    """

    adapter_id = "isolated-container-simulation"
    adapter_version = "1.0.0"

    def __init__(
        self,
        *,
        approved_images: Mapping[str, str],
        approved_entrypoints: Mapping[str, tuple[str, ...]],
    ) -> None:
        self._approved_images = dict(approved_images)
        self._approved_entrypoints = dict(approved_entrypoints)
        for image in self._approved_images.values():
            if not image.startswith("sha256:") or len(image) < 16:
                raise Stage13ValidationError("container images require immutable digests")

    def describe_capabilities(self) -> Mapping[str, Any]:
        return {
            "adapter_id": self.adapter_id,
            "adapter_version": self.adapter_version,
            "network": "DENY_ALL",
            "filesystem": "READ_ONLY_EPHEMERAL",
            "execution": "RESTRICTED_WORKER_PLAN_ONLY",
        }

    def validate_execution_request(
        self, descriptor: SimulationDescriptor, parameters: Mapping[str, Any]
    ) -> None:
        super().validate_execution_request(descriptor, parameters)
        image = self._approved_images.get(descriptor.simulation_id)
        entrypoint = descriptor.entrypoint_identity
        if image is None or entrypoint not in self._approved_entrypoints:
            raise Stage13ValidationError("container simulation is not allowlisted")

    def prepare_execution(
        self, descriptor: SimulationDescriptor, parameters: Mapping[str, Any], seed: int
    ) -> Mapping[str, Any]:
        self.validate_execution_request(descriptor, parameters)
        return {
            "image_digest": self._approved_images[descriptor.simulation_id],
            "entrypoint": descriptor.entrypoint_identity,
            "arguments": {"seed": seed, "parameters": dict(parameters)},
            "network": "DENY_ALL",
            "read_only_root": True,
            "non_root": True,
            "host_mounts": (),
        }

    def execute(
        self,
        descriptor: SimulationDescriptor,
        parameters: Mapping[str, Any],
        seed: int,
    ) -> Mapping[str, Any]:
        del descriptor, parameters, seed
        raise Stage13ValidationError(
            "container execution requires the separately isolated laboratory worker"
        )


def validate_parameters(
    parameters: Mapping[str, Any], schema: Mapping[str, Mapping[str, Any]]
) -> None:
    unknown = set(parameters) - set(schema)
    if unknown:
        raise Stage13ValidationError(f"unknown parameters: {sorted(unknown)}")
    for name, rules in schema.items():
        if rules.get("required", False) and name not in parameters:
            raise Stage13ValidationError(f"missing parameter: {name}")
        if name not in parameters:
            continue
        value = parameters[name]
        expected_type = rules.get("type")
        if expected_type and not isinstance(value, expected_type):
            raise Stage13ValidationError(f"invalid parameter type: {name}")
        _reject_nonfinite(value, name)
        if "enum" in rules and value not in rules["enum"]:
            raise Stage13ValidationError(f"invalid parameter value: {name}")
        if isinstance(value, (int, float)) and not isinstance(value, bool):
            if "min" in rules and value < rules["min"]:
                raise Stage13ValidationError(f"parameter below minimum: {name}")
            if "max" in rules and value > rules["max"]:
                raise Stage13ValidationError(f"parameter above maximum: {name}")


def _compare(expected: ExpectedObservation, value: Any) -> ActualObservation:
    matched = value == expected.expected
    if isinstance(value, (int, float)) and isinstance(expected.expected, (int, float)):
        matched = math.isclose(
            value,
            expected.expected,
            abs_tol=expected.tolerance,
            rel_tol=expected.tolerance,
        )
    return ActualObservation(
        observation_id=expected.observation_id,
        expected_observation_id=expected.observation_id,
        value=value,
        status="MATCHED_EXPECTATION" if matched else "DIVERGED_FROM_EXPECTATION",
        tolerance_used=expected.tolerance,
    )


class LaboratoryExecutor:
    """Synchronous deterministic core shared by durable workflow activities."""

    def __init__(self, registry: SimulationRegistry, adapter: LaboratoryRuntimeAdapter) -> None:
        self.registry = registry
        self.adapter = adapter
        self.results: dict[str, LaboratoryResult] = {}
        self._cancelled: set[str] = set()

    def request_cancellation(self, run_id: str) -> None:
        result = self.results.get(run_id)
        if result and result.state in FINAL_STATES:
            return
        self._cancelled.add(run_id)

    def execute(self, request: ExecutionRequest) -> LaboratoryResult:
        if request.run_id in self.results:
            return self.results[request.run_id]
        try:
            descriptor = self.registry.resolve(
                request.laboratory_spec_id,
                request.laboratory_spec_version,
                request.simulation_id,
                request.simulation_version,
            )
            if (
                descriptor.adapter_id != self.adapter.adapter_id
                or descriptor.adapter_version != self.adapter.adapter_version
            ):
                raise Stage13ValidationError("runtime adapter does not match registry descriptor")
            self.adapter.validate_execution_request(descriptor, request.parameters)
            canonical_request = {
                "laboratory_spec_id": request.laboratory_spec_id,
                "laboratory_spec_version": request.laboratory_spec_version,
                "package_id": request.package_id,
                "content_version_id": request.content_version_id,
                "publication_release_id": request.publication_release_id,
                "simulation_id": request.simulation_id,
                "simulation_version": request.simulation_version,
                "parameters": request.parameters,
            }
            seed = request.seed if request.seed is not None else secrets.randbits(64)
            result: Mapping[str, Any]
            output_observations: tuple[ActualObservation, ...]
            if request.run_id in self._cancelled:
                state = ExecutionState.CANCELLED
                result = {}
                output_observations = ()
            else:
                try:
                    result = self.adapter.execute(descriptor, request.parameters, seed)
                except Stage13ValidationError:
                    raise
                except Exception as error:
                    raise Stage13InfrastructureError("simulation adapter failed") from error
                result_size = len(canonical_json(result).encode("utf-8"))
                if result_size > descriptor.resource_policy.stdout_bytes:
                    raise Stage13ResourceLimitError("simulation output exceeds resource policy")
                observations = tuple(
                    _compare(observation, result.get(observation.metric))
                    for observation in descriptor.expected_observations
                )
                state = (
                    ExecutionState.SCIENTIFIC_NON_CONVERGENCE
                    if any(item.status == "DIVERGED_FROM_EXPECTATION" for item in observations)
                    else ExecutionState.SUCCEEDED
                )
                output_observations = observations
            environment = ExecutionEnvironment(
                adapter_id=self.adapter.adapter_id,
                adapter_version=self.adapter.adapter_version,
                simulation_id=descriptor.simulation_id,
                simulation_version=descriptor.simulation_version,
                implementation_digest=descriptor.implementation_digest,
                dependency_lock_digest="not-applicable:trusted-reference",
                resource_policy_version=descriptor.resource_policy.policy_version,
            )
            laboratory_result = LaboratoryResult(
                request=request,
                state=state,
                input_payload_sha256=canonical_input_hash(canonical_request),
                seed=seed,
                environment=environment,
                observations=output_observations,
                outputs=result if state is not ExecutionState.CANCELLED else {},
                completed_at=datetime.now(UTC),
            )
        except Stage13ValidationError:
            laboratory_result = LaboratoryResult(
                request=request,
                state=ExecutionState.REJECTED_VALIDATION,
                input_payload_sha256="",
                seed=request.seed or 0,
                environment=ExecutionEnvironment(
                    adapter_id=self.adapter.adapter_id,
                    adapter_version=self.adapter.adapter_version,
                    simulation_id=request.simulation_id,
                    simulation_version="unknown",
                    implementation_digest="unknown",
                    dependency_lock_digest="unknown",
                ),
                completed_at=datetime.now(UTC),
            )
        except Stage13InfrastructureError:
            laboratory_result = LaboratoryResult(
                request=request,
                state=ExecutionState.FAILED_INFRASTRUCTURE,
                input_payload_sha256="",
                seed=request.seed or 0,
                environment=ExecutionEnvironment(
                    adapter_id=self.adapter.adapter_id,
                    adapter_version=self.adapter.adapter_version,
                    simulation_id=request.simulation_id,
                    simulation_version=request.simulation_version,
                    implementation_digest="unknown",
                    dependency_lock_digest="unknown",
                ),
                warnings=("adapter execution failed",),
                completed_at=datetime.now(UTC),
            )
        except Stage13ResourceLimitError:
            laboratory_result = LaboratoryResult(
                request=request,
                state=ExecutionState.RESOURCE_LIMIT_EXCEEDED,
                input_payload_sha256="",
                seed=request.seed or 0,
                environment=ExecutionEnvironment(
                    adapter_id=self.adapter.adapter_id,
                    adapter_version=self.adapter.adapter_version,
                    simulation_id=request.simulation_id,
                    simulation_version=request.simulation_version,
                    implementation_digest="unknown",
                    dependency_lock_digest="unknown",
                ),
                warnings=("resource policy exceeded",),
                completed_at=datetime.now(UTC),
            )
        self.results[request.run_id] = laboratory_result
        return laboratory_result

    def replay(self, original_run_id: str, replay_run_id: str, *, reason: str) -> LaboratoryResult:
        original = self.results[original_run_id]
        replay_request = ExecutionRequest(
            run_id=replay_run_id,
            learner_id=original.request.learner_id,
            laboratory_spec_id=original.request.laboratory_spec_id,
            laboratory_spec_version=original.request.laboratory_spec_version,
            package_id=original.request.package_id,
            content_version_id=original.request.content_version_id,
            publication_release_id=original.request.publication_release_id,
            simulation_id=original.request.simulation_id,
            simulation_version=original.request.simulation_version,
            parameters=original.request.parameters,
            seed=original.seed,
            replay_of_run_id=original_run_id,
        )
        replay = self.execute(replay_request)
        if replay.state is original.state and replay.observations == original.observations:
            replay.replay_comparison = "BITWISE_MATCH"
        else:
            replay.replay_comparison = "UNEXPECTED_REPRODUCIBILITY_FAILURE"
        return replay

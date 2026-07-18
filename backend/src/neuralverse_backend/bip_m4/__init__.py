"""BIP-M4 durable workflow infrastructure.

The package is deliberately independent of ACP semantic implementations.  It
contains the deterministic workflow model, operational adapters and an
optional Temporal host boundary.  Importing the package never requires the
Temporal SDK; production wiring supplies that dependency at the process edge.
"""

from neuralverse_backend.bip_m4.activities import ActivityResult, BIPM4Activities
from neuralverse_backend.bip_m4.adapter import (
    ACPExecutionAdapter,
    ACPExecutionRequest,
    ACPExecutionResult,
    FakeACPExecutor,
    PublicationActivityAdapter,
)
from neuralverse_backend.bip_m4.definition import (
    AUTHORING_REGISTRATION,
    WorkflowRegistration,
    activity_bindings,
    workflow_factory,
)
from neuralverse_backend.bip_m4.domain import (
    ActivityContract,
    ActivityFailure,
    ActivityIdempotencyLedger,
    CommandIdempotencyRegistry,
    FailureClass,
    GenerationJobIdentity,
    IdempotencyConflict,
    WorkflowCommand,
    WorkflowIdentity,
    WorkflowState,
)
from neuralverse_backend.bip_m4.host import TemporalHost, TemporalHostConfig, TemporalUnavailable
from neuralverse_backend.bip_m4.workflow import DurableAuthoringWorkflow

__all__ = [
    "ACPExecutionAdapter",
    "ACPExecutionRequest",
    "ACPExecutionResult",
    "AUTHORING_REGISTRATION",
    "ActivityResult",
    "BIPM4Activities",
    "ActivityContract",
    "ActivityFailure",
    "ActivityIdempotencyLedger",
    "CommandIdempotencyRegistry",
    "DurableAuthoringWorkflow",
    "FakeACPExecutor",
    "FailureClass",
    "GenerationJobIdentity",
    "IdempotencyConflict",
    "PublicationActivityAdapter",
    "TemporalHost",
    "TemporalHostConfig",
    "WorkflowRegistration",
    "TemporalUnavailable",
    "activity_bindings",
    "workflow_factory",
    "WorkflowCommand",
    "WorkflowIdentity",
    "WorkflowState",
]

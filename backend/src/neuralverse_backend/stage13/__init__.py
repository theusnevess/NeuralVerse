"""Stage 13 governed laboratory and assessment execution primitives.

The package is deliberately provider-neutral and stdlib-only.  It exposes a
bounded deterministic reference runtime; production persistence, Temporal and
S3 adapters remain integration concerns behind these contracts.
"""

from .assessment import (
    AssessmentExecution,
    AssessmentExecutionState,
    AssessmentVerifierDescriptor,
    AssessmentVerifierRegistry,
    ExactMatchVerifier,
    NumericToleranceVerifier,
    ReasoningComparison,
    VerificationResult,
    compare_governed_reasoning,
    verify_assessment,
)
from .evidence import EvidenceArtifact, InMemoryEvidenceStore
from .feedback import (
    FeedbackMaterialization,
    FeedbackTemplate,
    materialize_feedback,
    reject_hidden_mastery_fields,
)
from .persistence import (
    AssessmentEvidenceRecord,
    LaboratoryExecutionSnapshot,
    Stage13InMemoryStore,
)
from .portfolio import build_portfolio_export
from .reference import (
    reference_assessment_registry,
    reference_simulation_adapter,
    reference_simulation_registry,
    svd_compression_simulation,
)
from .runtime import (
    ActualObservation,
    DeterminismClass,
    ExecutionEnvironment,
    ExecutionRequest,
    ExecutionState,
    ExpectedObservation,
    IsolatedContainerSimulationAdapter,
    LaboratoryExecutor,
    LaboratoryResult,
    LaboratoryRuntimeAdapter,
    ResourcePolicy,
    SimulationDescriptor,
    SimulationRegistry,
    Stage13InfrastructureError,
    Stage13ResourceLimitError,
    Stage13ValidationError,
    TrustedDeterministicSimulationAdapter,
    canonical_input_hash,
)
from .service import Stage13ExecutionService
from .workflow import ExecuteLaboratoryRunWorkflow, InMemoryLaboratoryRunStore, WorkflowProgress

__all__ = [
    "ActualObservation",
    "AssessmentExecutionState",
    "AssessmentExecution",
    "AssessmentVerifierDescriptor",
    "AssessmentVerifierRegistry",
    "DeterminismClass",
    "ExactMatchVerifier",
    "ExecutionEnvironment",
    "ExecutionRequest",
    "ExecutionState",
    "ExpectedObservation",
    "LaboratoryExecutor",
    "LaboratoryResult",
    "LaboratoryRuntimeAdapter",
    "NumericToleranceVerifier",
    "ReasoningComparison",
    "ResourcePolicy",
    "IsolatedContainerSimulationAdapter",
    "SimulationDescriptor",
    "SimulationRegistry",
    "Stage13ValidationError",
    "Stage13InfrastructureError",
    "Stage13ResourceLimitError",
    "TrustedDeterministicSimulationAdapter",
    "VerificationResult",
    "compare_governed_reasoning",
    "build_portfolio_export",
    "AssessmentEvidenceRecord",
    "LaboratoryExecutionSnapshot",
    "Stage13InMemoryStore",
    "canonical_input_hash",
    "FeedbackMaterialization",
    "FeedbackTemplate",
    "materialize_feedback",
    "reject_hidden_mastery_fields",
    "EvidenceArtifact",
    "InMemoryEvidenceStore",
    "ExecuteLaboratoryRunWorkflow",
    "InMemoryLaboratoryRunStore",
    "WorkflowProgress",
    "Stage13ExecutionService",
    "reference_assessment_registry",
    "reference_simulation_adapter",
    "reference_simulation_registry",
    "svd_compression_simulation",
    "verify_assessment",
]

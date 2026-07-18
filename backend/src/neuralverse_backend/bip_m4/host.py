"""Optional Temporal host boundary with fail-fast configuration."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Protocol


class TemporalUnavailable(RuntimeError):
    """The process cannot certify durable execution without Temporal."""


@dataclass(frozen=True, slots=True)
class TemporalHostConfig:
    address: str
    namespace: str = "default"
    task_queue: str = "neuralverse-authoring"
    worker_identity: str = "neuralverse-authoring-worker"
    max_concurrent_activities: int = 20
    graceful_shutdown_seconds: int = 30

    def __post_init__(self) -> None:
        if not self.address.strip() or not self.namespace.strip() or not self.task_queue.strip():
            raise ValueError("Temporal address, namespace and task queue are required")
        if self.max_concurrent_activities < 1 or self.graceful_shutdown_seconds < 1:
            raise ValueError("Temporal host bounds must be positive")


class TemporalWorker(Protocol):
    async def run(self) -> None: ...

    async def shutdown(self) -> None: ...


class TemporalHost:
    """Lifecycle coordinator; SDK-specific client/worker objects are injected."""

    def __init__(
        self,
        config: TemporalHostConfig,
        *,
        client: Any = None,
        worker: TemporalWorker | None = None,
    ) -> None:
        self.config = config
        self.client = client
        self.worker = worker
        self.started = False

    @property
    def ready(self) -> bool:
        return self.started and self.client is not None and self.worker is not None

    def register(self, *, client: Any, worker: TemporalWorker) -> None:
        if self.started:
            raise RuntimeError("Temporal host is already running")
        self.client = client
        self.worker = worker

    def start(self) -> None:
        if self.client is None or self.worker is None:
            raise TemporalUnavailable("Temporal client and worker are not configured")
        self.started = True

    def create_worker(
        self,
        *,
        workflows: tuple[Any, ...],
        activities: tuple[Any, ...],
    ) -> TemporalWorker:
        """Construct the SDK worker at the process edge, when installed."""
        if self.client is None:
            raise TemporalUnavailable("Temporal client must be connected before worker creation")
        try:
            from temporalio.worker import Worker  # type: ignore[import-not-found]
        except ImportError as error:
            raise TemporalUnavailable("temporalio is not installed") from error
        return Worker(  # type: ignore[no-any-return]
            self.client,
            task_queue=self.config.task_queue,
            workflows=list(workflows),
            activities=list(activities),
            max_concurrent_activities=self.config.max_concurrent_activities,
        )

    async def shutdown(self) -> None:
        if self.worker is not None and self.started:
            await self.worker.shutdown()
        self.started = False

    @staticmethod
    async def connect(config: TemporalHostConfig) -> Any:
        try:
            from temporalio.client import Client  # type: ignore[import-not-found]
        except ImportError as error:
            raise TemporalUnavailable("temporalio is not installed") from error
        return await Client.connect(config.address, namespace=config.namespace)

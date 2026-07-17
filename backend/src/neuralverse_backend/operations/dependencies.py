from __future__ import annotations

from dataclasses import dataclass
from enum import StrEnum
from typing import TYPE_CHECKING

from neuralverse_backend.configuration.settings import Settings

if TYPE_CHECKING:
    from neuralverse_backend.persistence.runtime import PersistenceRuntime


class DependencyStatus(StrEnum):
    DISABLED = "disabled"
    UNCONFIGURED = "unconfigured"
    HEALTHY = "healthy"
    UNHEALTHY = "unhealthy"


@dataclass(frozen=True, slots=True)
class DependencyState:
    name: str
    required: bool
    enabled: bool
    status: DependencyStatus
    detail: str


def foundation_dependency_states(
    settings: Settings,
    runtime: PersistenceRuntime | None = None,
) -> tuple[DependencyState, ...]:
    if not settings.database_enabled:
        return (
            DependencyState(
                name="database",
                required=False,
                enabled=False,
                status=DependencyStatus.DISABLED,
                detail="database capability is disabled; no connection is attempted",
            ),
        )

    if runtime is None or runtime.health_checker is None:
        return (
            DependencyState(
                name="database",
                required=settings.database_required_for_readiness,
                enabled=True,
                status=DependencyStatus.UNHEALTHY,
                detail="database runtime is unavailable",
            ),
        )
    return (runtime.health_checker.check().state,)


def foundation_is_ready(
    settings: Settings,
    runtime: PersistenceRuntime | None = None,
) -> bool:
    return all(
        not dependency.required or dependency.status is DependencyStatus.HEALTHY
        for dependency in foundation_dependency_states(settings, runtime)
    )

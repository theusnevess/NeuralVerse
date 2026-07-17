from typing import cast

from fastapi import APIRouter, Request, Response
from pydantic import BaseModel

from neuralverse_backend.configuration.settings import Settings
from neuralverse_backend.operations.dependencies import (
    DependencyState,
    DependencyStatus,
    foundation_dependency_states,
)
from neuralverse_backend.persistence.runtime import PersistenceRuntime


class LiveResponse(BaseModel):
    status: str
    service: str
    version: str


class DependencyResponse(BaseModel):
    name: str
    required: bool
    enabled: bool
    status: str
    detail: str

    @classmethod
    def from_state(cls, state: DependencyState) -> "DependencyResponse":
        return cls(
            name=state.name,
            required=state.required,
            enabled=state.enabled,
            status=state.status.value,
            detail=state.detail,
        )


class ReadyResponse(BaseModel):
    status: str
    service: str
    version: str
    dependencies: list[DependencyResponse]


router = APIRouter(prefix="/health", tags=["operations"])


def _settings(request: Request) -> Settings:
    return cast(Settings, request.app.state.settings)


def _runtime(request: Request) -> PersistenceRuntime | None:
    return cast(PersistenceRuntime | None, getattr(request.app.state, "persistence_runtime", None))


@router.get("/live", response_model=LiveResponse)
async def live(request: Request) -> LiveResponse:
    settings = _settings(request)
    return LiveResponse(
        status="alive", service=settings.application_name, version=settings.application_version
    )


@router.get("/ready", response_model=ReadyResponse)
def ready(request: Request, response: Response) -> ReadyResponse:
    settings = _settings(request)
    runtime = _runtime(request)
    states = foundation_dependency_states(settings, runtime)
    dependencies = [DependencyResponse.from_state(state) for state in states]
    is_ready = all(
        not state.required or state.status is DependencyStatus.HEALTHY for state in states
    )
    if not is_ready and any(state.required for state in states):
        response.status_code = 503
    return ReadyResponse(
        status="ready" if is_ready else "not_ready",
        service=settings.application_name,
        version=settings.application_version,
        dependencies=dependencies,
    )

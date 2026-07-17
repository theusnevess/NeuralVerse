from fastapi import FastAPI
from fastapi.testclient import TestClient
from pydantic import SecretStr

from neuralverse_backend.configuration.settings import Environment, Settings
from neuralverse_backend.main import create_app
from neuralverse_backend.operations.dependencies import DependencyState, DependencyStatus
from neuralverse_backend.persistence.health import HealthCheckResult
from neuralverse_backend.persistence.runtime import PersistenceRuntime


class UnhealthyChecker:
    def __init__(self, required: bool) -> None:
        self.required = required

    def check(self) -> HealthCheckResult:
        return HealthCheckResult(
            state=DependencyState(
                name="database",
                required=self.required,
                enabled=True,
                status=DependencyStatus.UNHEALTHY,
                detail="fake database failure",
            ),
            duration_ms=0.1,
        )


def fake_unhealthy_runtime(required: bool) -> PersistenceRuntime:
    return PersistenceRuntime(
        engine=None, session_factory=None, health_checker=UnhealthyChecker(required)
    )


def test_liveness_has_no_external_dependency(app: FastAPI) -> None:
    with TestClient(app) as client:
        response = client.get("/health/live")
    assert response.status_code == 200
    assert response.json()["status"] == "alive"
    assert response.json()["service"] == "neuralverse-backend"


def test_readiness_is_true_when_deferred_database_is_disabled(app: FastAPI) -> None:
    with TestClient(app) as client:
        response = client.get("/health/ready")
    assert response.status_code == 200
    assert response.json()["status"] == "ready"
    assert response.json()["dependencies"][0]["status"] == "disabled"


def test_readiness_is_false_when_database_is_required_but_unavailable() -> None:
    settings = Settings(
        environment=Environment.TEST,
        database_enabled=True,
        database_required_for_readiness=True,
        database_url=SecretStr("postgresql+psycopg://user:password@127.0.0.1/db"),
    )
    with TestClient(create_app(settings, fake_unhealthy_runtime(required=True))) as client:
        response = client.get("/health/ready")
    assert response.status_code == 503
    assert response.json()["status"] == "not_ready"
    assert response.json()["dependencies"][0]["status"] == "unhealthy"


def test_dependency_details_do_not_expose_database_url() -> None:
    settings = Settings(
        environment=Environment.TEST,
        database_enabled=True,
        database_required_for_readiness=True,
        database_url=SecretStr("postgresql+psycopg://secret:password@example.invalid/db"),
    )
    with TestClient(create_app(settings, fake_unhealthy_runtime(required=True))) as client:
        body = client.get("/health/ready").text
    assert "password" not in body
    assert "example.invalid" not in body


def test_detailed_dependencies_endpoint_is_not_exposed(app: FastAPI) -> None:
    with TestClient(app) as client:
        response = client.get("/health/dependencies")
    assert response.status_code == 404

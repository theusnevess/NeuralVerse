from unittest.mock import Mock

import pytest
from pydantic import SecretStr
from sqlalchemy import Engine

from neuralverse_backend.configuration.settings import Environment, Settings
from neuralverse_backend.operations.dependencies import DependencyStatus
from neuralverse_backend.persistence import engine as engine_module
from neuralverse_backend.persistence.engine import create_database_engine
from neuralverse_backend.persistence.health import DatabaseHealthChecker
from neuralverse_backend.persistence.metadata import metadata
from neuralverse_backend.persistence.runtime import create_persistence_runtime
from neuralverse_backend.persistence.sessions import create_session_factory, session_scope


class FakeResult:
    def __init__(self, value: object) -> None:
        self.value = value

    def scalar_one_or_none(self) -> object:
        return self.value


class FakeConnection:
    def __init__(self, result: object = 1, error: Exception | None = None) -> None:
        self.result = result
        self.error = error

    def __enter__(self) -> "FakeConnection":
        if self.error is not None:
            raise self.error
        return self

    def __exit__(self, *args: object) -> None:
        return None

    def execute(self, statement: object) -> FakeResult:
        assert str(statement) == "SELECT 1"
        return FakeResult(self.result)


class FakeEngine:
    def __init__(self, connection: FakeConnection) -> None:
        self.connection = connection
        self.connect_calls = 0

    def connect(self) -> FakeConnection:
        self.connect_calls += 1
        return self.connection


def database_settings() -> Settings:
    return Settings(
        environment=Environment.TEST,
        database_enabled=True,
        database_url=SecretStr("postgresql+psycopg://user:password@127.0.0.1/db"),
    )


def test_metadata_contains_only_operational_models_and_is_deterministic() -> None:
    assert set(metadata.tables) == {
        "fixture_records",
        "idempotency_records",
        "operational_audit_events",
        "cross_front_workflow_executions",
        "cross_front_workflow_queue",
    }
    assert metadata.naming_convention["ix"] == "ix_%(table_name)s_%(column_0_N_name)s"


def test_engine_factory_is_lazy_and_applies_runtime_bounds(monkeypatch: pytest.MonkeyPatch) -> None:
    captured: dict[str, object] = {}
    fake_engine = Mock(spec=Engine)

    def fake_create_engine(url: str, **kwargs: object) -> Mock:
        captured["url"] = url
        captured.update(kwargs)
        return fake_engine

    monkeypatch.setattr(engine_module, "create_engine", fake_create_engine)
    engine = create_database_engine(database_settings())

    assert engine is fake_engine
    assert captured["url"] == "postgresql+psycopg://user:password@127.0.0.1/db"
    assert captured["pool_pre_ping"] is True
    assert captured["pool_size"] == 5
    assert captured["max_overflow"] == 5
    assert captured["isolation_level"] == "READ COMMITTED"
    assert captured["hide_parameters"] is True


def test_disabled_runtime_does_not_create_engine(monkeypatch: pytest.MonkeyPatch) -> None:
    create_engine = Mock(side_effect=AssertionError("engine must stay disabled"))
    monkeypatch.setattr(engine_module, "create_engine", create_engine)
    runtime = create_persistence_runtime(Settings(environment=Environment.TEST))
    assert runtime.engine is None
    assert runtime.session_factory is None
    assert runtime.health_checker is None
    create_engine.assert_not_called()


def test_health_checker_reports_success_without_connecting_until_check() -> None:
    engine = FakeEngine(FakeConnection())
    checker = DatabaseHealthChecker(engine, required=True)  # type: ignore[arg-type]
    assert engine.connect_calls == 0
    result = checker.check()
    assert engine.connect_calls == 1
    assert result.state.status is DependencyStatus.HEALTHY
    assert result.duration_ms >= 0


def test_health_checker_reports_safe_failure() -> None:
    engine = FakeEngine(FakeConnection(error=RuntimeError("secret connection details")))
    result = DatabaseHealthChecker(engine, required=True).check()  # type: ignore[arg-type]
    assert result.state.status is DependencyStatus.UNHEALTHY
    assert result.state.detail == "database health check encountered an unexpected failure"
    assert "secret" not in result.state.detail


def test_session_scope_rolls_back_and_closes_on_error() -> None:
    session = Mock()
    factory = Mock(return_value=session)
    with pytest.raises(RuntimeError, match="boom"):
        with session_scope(factory):
            raise RuntimeError("boom")
    session.rollback.assert_called_once_with()
    session.close.assert_called_once_with()


def test_session_factory_disables_implicit_flush_and_expiration() -> None:
    factory = create_session_factory(Mock(spec=Engine))
    session = factory()
    assert factory.kw["autoflush"] is False
    assert factory.kw["expire_on_commit"] is False
    session.close()

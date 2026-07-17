from __future__ import annotations

import os
from collections.abc import Generator

import pytest
from sqlalchemy import Engine, create_engine, make_url, text
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from neuralverse_backend.persistence.health import DatabaseHealthChecker
from neuralverse_backend.persistence.migrations import MigrationStateInspector
from neuralverse_backend.persistence.sessions import create_session_factory, session_scope

pytestmark = [pytest.mark.integration, pytest.mark.postgres, pytest.mark.migration]


@pytest.fixture(scope="module")
def postgres_engine() -> Generator[Engine, None, None]:
    url = os.getenv("NEURALVERSE_TEST_DATABASE_URL")
    if not url:
        pytest.skip("NEURALVERSE_TEST_DATABASE_URL is required for PostgreSQL integration")
    engine = create_engine(url, hide_parameters=True, pool_pre_ping=True)
    try:
        yield engine
    finally:
        engine.dispose()


def test_postgresql_16_connectivity_and_catalog_are_clean(postgres_engine: Engine) -> None:
    with postgres_engine.connect() as connection:
        assert connection.execute(text("SELECT 1")).scalar_one() == 1
        version = connection.execute(text("SHOW server_version_num")).scalar_one()
        assert str(version).startswith("16")
        tables = (
            connection.execute(
                text(
                    "SELECT tablename FROM pg_catalog.pg_tables "
                    "WHERE schemaname = 'public' ORDER BY tablename"
                )
            )
            .scalars()
            .all()
        )
    assert tables == [
        "alembic_version",
        "cross_front_workflow_executions",
        "cross_front_workflow_queue",
        "fixture_records",
        "idempotency_records",
        "operational_audit_events",
    ]


def test_real_session_rolls_back_and_closes(postgres_engine: Engine) -> None:
    factory = create_session_factory(postgres_engine)
    with session_scope(factory) as session:
        assert isinstance(session, Session)
        assert session.execute(text("SELECT 1")).scalar_one() == 1
        assert session.in_transaction() is True


def test_migration_inspector_reports_compatible(postgres_engine: Engine) -> None:
    inspection = MigrationStateInspector(postgres_engine).inspect(force=True)
    assert inspection.status == "healthy"
    assert inspection.current_revision == inspection.expected_revision == "b42000000001"


def test_readiness_checker_reports_healthy(postgres_engine: Engine) -> None:
    checker = DatabaseHealthChecker(
        postgres_engine,
        required=True,
        migration_inspector=MigrationStateInspector(postgres_engine),
    )
    result = checker.check()
    assert result.state.status.value == "healthy"


def test_invalid_credentials_are_redacted() -> None:
    url = os.getenv("NEURALVERSE_TEST_DATABASE_URL")
    if not url:
        pytest.skip("NEURALVERSE_TEST_DATABASE_URL is required for PostgreSQL integration")
    invalid_url = (
        make_url(url).set(password="invalid_password").render_as_string(hide_password=False)
    )
    engine = create_engine(invalid_url, hide_parameters=True, pool_pre_ping=True)
    try:
        result = DatabaseHealthChecker(engine, required=True).check()
    finally:
        engine.dispose()
    assert result.state.status.value == "unhealthy"
    assert "invalid_password" not in result.state.detail


def test_unreachable_endpoint_is_bounded() -> None:
    url = os.getenv("NEURALVERSE_TEST_DATABASE_URL")
    if not url:
        pytest.skip("NEURALVERSE_TEST_DATABASE_URL is required for PostgreSQL integration")
    unreachable_url = make_url(url).set(port=59999).render_as_string(hide_password=False)
    engine = create_engine(unreachable_url, connect_args={"connect_timeout": 1})
    try:
        result = DatabaseHealthChecker(engine, required=True).check()
    except SQLAlchemyError as error:
        pytest.fail(f"checker must classify connection failures: {error}")
    finally:
        engine.dispose()
    assert result.state.status.value == "unhealthy"

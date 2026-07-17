from typing import cast

import pytest
from pydantic import SecretStr, ValidationError

from neuralverse_backend.configuration.settings import Environment, Settings, redact_database_url


def secret_url(value: str) -> SecretStr:
    return SecretStr(value)


def test_default_test_settings_are_deterministic() -> None:
    settings = Settings(environment=Environment.TEST)
    assert settings.application_name == "neuralverse-backend"
    assert settings.port == 8000
    assert settings.database_enabled is False
    assert settings.database_required_for_readiness is False


def test_invalid_environment_is_rejected() -> None:
    with pytest.raises(ValidationError):
        Settings(environment=cast(Environment, "production"))


def test_invalid_port_is_rejected() -> None:
    with pytest.raises(ValidationError):
        Settings(port=70000)


def test_hosted_wildcard_cors_is_rejected() -> None:
    with pytest.raises(ValueError, match="wildcard"):
        Settings(environment=Environment.HOSTED, cors_allowed_origins=["*"])


def test_disabled_database_has_no_url_and_cannot_be_required() -> None:
    settings = Settings(environment=Environment.TEST)
    assert settings.database_url is None
    with pytest.raises(ValidationError, match="requires database_enabled"):
        Settings(environment=Environment.TEST, database_required_for_readiness=True)


def test_enabled_database_requires_postgresql_psycopg_url() -> None:
    with pytest.raises(ValidationError, match="database_url is required"):
        Settings(environment=Environment.TEST, database_enabled=True)
    settings = Settings(
        environment=Environment.TEST,
        database_enabled=True,
        database_url=secret_url("postgresql+psycopg://user:password@127.0.0.1:55432/db"),
    )
    assert settings.database_url is not None


@pytest.mark.parametrize(
    "value",
    [
        "postgresql://user:password@127.0.0.1/db",
        "postgres://user:password@127.0.0.1/db",
        "postgresql+asyncpg://user:password@127.0.0.1/db",
        "sqlite:///tmp/db.sqlite",
        "not-a-url",
        "postgresql+psycopg://user:password@127.0.0.1",
    ],
)
def test_invalid_database_url_is_rejected(value: str) -> None:
    with pytest.raises(ValidationError):
        Settings(
            environment=Environment.TEST, database_enabled=True, database_url=secret_url(value)
        )


def test_local_non_tls_url_is_accepted() -> None:
    settings = Settings(
        environment=Environment.LOCAL,
        database_enabled=True,
        database_url=secret_url("postgresql+psycopg://user:password@127.0.0.1/db?sslmode=disable"),
    )
    assert settings.database_enabled is True


def test_hosted_database_requires_verified_tls_and_readiness() -> None:
    def hosted_url(sslmode: str) -> SecretStr:
        return secret_url(f"postgresql+psycopg://user:password@db.example/db?sslmode={sslmode}")

    with pytest.raises(ValidationError, match="verify-full"):
        Settings(
            environment=Environment.HOSTED,
            database_enabled=True,
            database_required_for_readiness=True,
            database_url=secret_url("postgresql+psycopg://user:password@db.example/db"),
        )
    with pytest.raises(ValidationError, match="verify-full"):
        Settings(
            environment=Environment.HOSTED,
            database_enabled=True,
            database_required_for_readiness=True,
            database_url=hosted_url("require"),
        )
    with pytest.raises(ValidationError, match="verify-full"):
        Settings(
            environment=Environment.HOSTED,
            database_enabled=True,
            database_required_for_readiness=True,
            database_url=hosted_url("verify-ca"),
        )
    settings = Settings(
        environment=Environment.HOSTED,
        database_enabled=True,
        database_required_for_readiness=True,
        database_url=hosted_url("verify-full"),
    )
    assert settings.log_format.value == "json"
    with pytest.raises(ValidationError, match="database_echo"):
        Settings(
            environment=Environment.HOSTED,
            database_enabled=True,
            database_required_for_readiness=True,
            database_echo=True,
            database_url=hosted_url("verify-full"),
        )


def test_database_url_is_secret_and_redacted() -> None:
    settings = Settings(
        environment=Environment.TEST,
        database_enabled=True,
        database_url=secret_url(
            "postgresql+psycopg://user:password@127.0.0.1:55432/db?sslmode=disable"
        ),
    )
    assert "password" not in repr(settings)
    assert "password" not in str(settings.model_dump())
    redacted = redact_database_url(settings.database_url)
    assert redacted is not None
    assert "password" not in redacted
    assert "127.0.0.1:55432" in redacted


def test_database_pool_and_timeout_bounds_are_rejected() -> None:
    with pytest.raises(ValidationError):
        Settings(environment=Environment.TEST, database_pool_size=0)
    with pytest.raises(ValidationError):
        Settings(environment=Environment.TEST, database_max_overflow=-1)
    with pytest.raises(ValidationError):
        Settings(environment=Environment.TEST, database_pool_timeout_seconds=0)
    with pytest.raises(ValidationError):
        Settings(environment=Environment.TEST, database_pool_recycle_seconds=59)
    with pytest.raises(ValidationError):
        Settings(environment=Environment.TEST, database_connect_timeout_seconds=0)
    with pytest.raises(ValidationError):
        Settings(environment=Environment.TEST, database_statement_timeout_ms=99)


def test_database_application_name_must_be_non_empty_and_bounded() -> None:
    with pytest.raises(ValidationError):
        Settings(environment=Environment.TEST, database_application_name=" ")
    with pytest.raises(ValidationError):
        Settings(environment=Environment.TEST, database_application_name="x" * 64)

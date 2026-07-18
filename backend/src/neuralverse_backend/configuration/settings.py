import base64
import binascii
import json
import re
from enum import StrEnum

from pydantic import Field, SecretStr, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict
from sqlalchemy.engine import URL, make_url


class Environment(StrEnum):
    LOCAL = "local"
    TEST = "test"
    HOSTED = "hosted"


class LogLevel(StrEnum):
    DEBUG = "DEBUG"
    INFO = "INFO"
    WARNING = "WARNING"
    ERROR = "ERROR"
    CRITICAL = "CRITICAL"


class LogFormat(StrEnum):
    CONSOLE = "console"
    JSON = "json"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_prefix="NEURALVERSE_",
        env_file=".env",
        env_file_encoding="utf-8",
        env_parse_enums=True,
        extra="ignore",
        case_sensitive=False,
    )

    environment: Environment = Environment.LOCAL
    application_name: str = "neuralverse-backend"
    application_version: str = "0.1.0"
    host: str = "127.0.0.1"
    port: int = Field(default=8000, ge=1, le=65535)
    log_level: LogLevel = LogLevel.INFO
    log_format: LogFormat = LogFormat.CONSOLE
    cors_allowed_origins: list[str] = Field(
        default_factory=lambda: ["http://localhost:5173", "http://127.0.0.1:5173"]
    )
    openapi_enabled: bool = True
    docs_enabled: bool = True
    database_enabled: bool = False
    database_required_for_readiness: bool = False
    database_url: SecretStr | None = None
    database_pool_size: int = Field(default=5, ge=1, le=20)
    database_max_overflow: int = Field(default=5, ge=0, le=20)
    database_pool_timeout_seconds: float = Field(default=10, ge=1, le=60)
    database_pool_recycle_seconds: int = Field(default=1800, ge=60, le=86400)
    database_connect_timeout_seconds: int = Field(default=5, ge=1, le=60)
    database_statement_timeout_ms: int = Field(default=5000, ge=100, le=300000)
    delivery_max_response_bytes: int = Field(default=2_000_000, ge=1024, le=50_000_000)
    delivery_max_blocks: int = Field(default=256, ge=1, le=4096)
    delivery_max_manifest_references: int = Field(default=1024, ge=1, le=10000)
    delivery_compression_minimum_bytes: int = Field(default=1024, ge=0, le=1_000_000)
    database_echo: bool = False
    database_application_name: str = Field(
        default="neuralverse-backend", min_length=1, max_length=63
    )
    fixture_ingestion_enabled: bool = False
    idempotency_hmac_active_key_version: str | None = Field(default=None, max_length=32)
    idempotency_hmac_active_key: SecretStr | None = None
    idempotency_hmac_previous_keys: SecretStr = SecretStr("{}")

    @field_validator("application_name", "application_version", "host", "database_application_name")
    @classmethod
    def non_empty(cls, value: str) -> str:
        if not value.strip():
            raise ValueError("value must not be empty")
        return value

    @field_validator("cors_allowed_origins")
    @classmethod
    def validate_cors_origins(cls, value: list[str]) -> list[str]:
        if any(not origin.strip() for origin in value):
            raise ValueError("CORS origins must not be empty")
        return value

    @field_validator("database_url")
    @classmethod
    def validate_database_url(cls, value: SecretStr | None) -> SecretStr | None:
        if value is None:
            return None
        _parse_database_url(value)
        return value

    def model_post_init(self, __context: object) -> None:
        if self.environment is Environment.HOSTED and "*" in self.cors_allowed_origins:
            raise ValueError("hosted CORS cannot allow wildcard origins")
        if self.database_required_for_readiness and not self.database_enabled:
            raise ValueError("database_required_for_readiness requires database_enabled")
        if self.database_enabled and self.database_url is None:
            raise ValueError("database_url is required when database_enabled is true")
        if self.environment is Environment.HOSTED and self.database_enabled:
            if not self.database_required_for_readiness:
                raise ValueError("hosted database must be required for readiness")
            if self.database_echo:
                raise ValueError("database_echo must be false in hosted environment")
            url = _parse_database_url(self.database_url)
            if not url.username:
                raise ValueError("hosted database requires a username")
            if url.query.get("sslmode") != "verify-full":
                raise ValueError("hosted database requires sslmode=verify-full")
        if self.environment is Environment.HOSTED and self.log_format is LogFormat.CONSOLE:
            self.log_format = LogFormat.JSON
        _validate_idempotency_hmac_configuration(self)


def _parse_database_url(value: SecretStr | None) -> URL:
    if value is None:
        raise ValueError("database URL is required")
    try:
        url = make_url(value.get_secret_value())
    except Exception as error:
        raise ValueError("database URL is malformed") from error
    if url.drivername != "postgresql+psycopg":
        raise ValueError("database URL must use postgresql+psycopg")
    if not url.database:
        raise ValueError("database URL must include a database name")
    if not url.host and not url.query.get("host"):
        raise ValueError("database URL must include a host or supported socket target")
    return url


_HMAC_VERSION_PATTERN = re.compile(r"^[A-Za-z0-9._-]{1,32}$")


def _decode_hmac_key(value: str) -> bytes:
    if not value or value != value.strip():
        raise ValueError("idempotency HMAC key is invalid")
    try:
        decoded = base64.b64decode(value, validate=True)
    except (ValueError, binascii.Error) as error:
        raise ValueError("idempotency HMAC key is invalid") from error
    if len(decoded) != 32:
        raise ValueError("idempotency HMAC key is invalid")
    return decoded


def _parse_previous_hmac_keys(value: SecretStr) -> dict[str, str]:
    try:
        parsed = json.loads(
            value.get_secret_value(),
            object_pairs_hook=_reject_duplicate_json_keys,
        )
    except (ValueError, json.JSONDecodeError) as error:
        raise ValueError("idempotency previous HMAC keys are invalid") from error
    if not isinstance(parsed, dict) or len(parsed) > 4:
        raise ValueError("idempotency previous HMAC keys are invalid")
    if any(
        not isinstance(version, str) or not isinstance(key, str) for version, key in parsed.items()
    ):
        raise ValueError("idempotency previous HMAC keys are invalid")
    return parsed


def _reject_duplicate_json_keys(pairs: list[tuple[str, object]]) -> dict[str, object]:
    result: dict[str, object] = {}
    for key, value in pairs:
        if key in result:
            raise ValueError("duplicate idempotency HMAC key version")
        result[key] = value
    return result


def _validate_idempotency_hmac_configuration(settings: Settings) -> None:
    previous = _parse_previous_hmac_keys(settings.idempotency_hmac_previous_keys)
    if (
        settings.idempotency_hmac_active_key_version is not None
        and not _HMAC_VERSION_PATTERN.fullmatch(settings.idempotency_hmac_active_key_version)
    ):
        raise ValueError("idempotency HMAC key version is invalid")
    for version, key in previous.items():
        if not _HMAC_VERSION_PATTERN.fullmatch(version):
            raise ValueError("idempotency previous HMAC key version is invalid")
        _decode_hmac_key(key)
    if settings.idempotency_hmac_active_key_version in previous:
        raise ValueError("active idempotency HMAC key cannot be previous")
    if not settings.fixture_ingestion_enabled:
        return
    if settings.idempotency_hmac_active_key_version is None:
        raise ValueError("active idempotency HMAC key version is required")
    if settings.idempotency_hmac_active_key is None:
        raise ValueError("active idempotency HMAC key is required")
    _decode_hmac_key(settings.idempotency_hmac_active_key.get_secret_value())


def redact_database_url(value: SecretStr | None) -> str | None:
    if value is None:
        return None
    url = _parse_database_url(value)
    safe_query = {"sslmode": url.query["sslmode"]} if "sslmode" in url.query else {}
    socket_host = url.query.get("host")
    safe_host = url.host or (socket_host if isinstance(socket_host, str) else None)
    safe_url = URL.create(
        drivername=url.drivername,
        username=url.username,
        password="***" if url.password is not None else None,
        host=safe_host,
        port=url.port,
        database=url.database,
        query=safe_query,
    )
    return safe_url.render_as_string(hide_password=True)

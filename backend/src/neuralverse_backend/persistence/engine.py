from sqlalchemy import Engine, create_engine

from neuralverse_backend.configuration.settings import Settings


def create_database_engine(settings: Settings) -> Engine:
    if not settings.database_enabled:
        raise ValueError("database engine requires database_enabled")
    if settings.database_url is None:
        raise ValueError("database engine requires database_url")

    return create_engine(
        settings.database_url.get_secret_value(),
        connect_args={
            "application_name": settings.database_application_name,
            "connect_timeout": settings.database_connect_timeout_seconds,
            "options": f"-c statement_timeout={settings.database_statement_timeout_ms}",
        },
        echo=settings.database_echo,
        hide_parameters=True,
        isolation_level="READ COMMITTED",
        max_overflow=settings.database_max_overflow,
        pool_pre_ping=True,
        pool_recycle=settings.database_pool_recycle_seconds,
        pool_size=settings.database_pool_size,
        pool_timeout=settings.database_pool_timeout_seconds,
    )

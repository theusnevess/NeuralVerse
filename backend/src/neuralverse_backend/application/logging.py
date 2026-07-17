import logging

import structlog

from neuralverse_backend.configuration.settings import LogFormat, Settings


def configure_logging(settings: Settings) -> None:
    renderer = (
        structlog.processors.JSONRenderer()
        if settings.log_format is LogFormat.JSON
        else structlog.dev.ConsoleRenderer()
    )
    logging.basicConfig(level=settings.log_level.value, format="%(message)s", force=True)
    structlog.contextvars.clear_contextvars()
    structlog.contextvars.bind_contextvars(
        environment=settings.environment.value,
        application=settings.application_name,
        application_version=settings.application_version,
    )
    structlog.configure(
        processors=[
            structlog.contextvars.merge_contextvars,
            structlog.processors.add_log_level,
            structlog.processors.TimeStamper(fmt="iso", utc=True),
            structlog.processors.StackInfoRenderer(),
            structlog.processors.format_exc_info,
            renderer,
        ],
        logger_factory=structlog.stdlib.LoggerFactory(),
        wrapper_class=structlog.stdlib.BoundLogger,
        cache_logger_on_first_use=False,
    )

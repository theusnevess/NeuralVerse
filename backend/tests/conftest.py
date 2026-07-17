import pytest
from fastapi import FastAPI

from neuralverse_backend.configuration.settings import Environment, LogFormat, Settings
from neuralverse_backend.main import create_app


@pytest.fixture
def test_settings() -> Settings:
    return Settings(environment=Environment.TEST, log_format=LogFormat.JSON)


@pytest.fixture
def app(test_settings: Settings) -> FastAPI:
    return create_app(test_settings)

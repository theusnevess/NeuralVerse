from fastapi import FastAPI
from fastapi.testclient import TestClient


def test_application_factory_lifecycle_and_openapi(app: FastAPI) -> None:
    with TestClient(app) as client:
        assert app.state.started is True
        assert client.get("/openapi.json").status_code == 200
    assert app.state.started is False

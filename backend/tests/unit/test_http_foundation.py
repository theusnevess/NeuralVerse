from fastapi import FastAPI, Query
from fastapi.testclient import TestClient


def test_correlation_id_is_generated_and_propagated(app: FastAPI) -> None:
    with TestClient(app) as client:
        response = client.get("/health/live")
    value = response.headers["X-Correlation-ID"]
    assert response.status_code == 200
    assert 1 <= len(value) <= 128


def test_valid_correlation_id_is_preserved(app: FastAPI) -> None:
    with TestClient(app) as client:
        response = client.get("/health/live", headers={"X-Correlation-ID": "test-correlation-1"})
    assert response.headers["X-Correlation-ID"] == "test-correlation-1"


def test_invalid_correlation_id_is_replaced(app: FastAPI) -> None:
    with TestClient(app) as client:
        response = client.get("/health/live", headers={"X-Correlation-ID": "bad value\n"})
    assert response.headers["X-Correlation-ID"] != "bad value\n"


def test_unknown_route_uses_safe_error_envelope(app: FastAPI) -> None:
    with TestClient(app) as client:
        response = client.get("/missing")
    body = response.json()
    assert response.status_code == 404
    assert body["error_code"] == "NOT_FOUND"
    assert body["correlation_id"] == response.headers["X-Correlation-ID"]
    assert "traceback" not in response.text.lower()


def test_request_validation_uses_safe_error_envelope(app: FastAPI) -> None:
    @app.get("/_test-validation")
    async def validation_route(required: int = Query(...)) -> dict[str, int]:
        return {"required": required}

    with TestClient(app) as client:
        response = client.get("/_test-validation")
    body = response.json()
    assert response.status_code == 422
    assert body["error_code"] == "VALIDATION_ERROR"
    assert body["field_errors"][0]["field"] == "query.required"

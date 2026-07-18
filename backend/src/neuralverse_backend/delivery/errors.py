from __future__ import annotations

from typing import Any

from neuralverse_backend.delivery.contracts import OUTPUT_CONTRACT_VERSION


class DeliveryError(Exception):
    def __init__(
        self, code: str, message: str, *, status_code: int, details: dict[str, Any] | None = None
    ):
        super().__init__(message)
        self.code = code
        self.message = message
        self.status_code = status_code
        self.details = details or {}
        self.contract_version = OUTPUT_CONTRACT_VERSION


def not_found(code: str, message: str) -> DeliveryError:
    return DeliveryError(code, message, status_code=404)


def integrity(message: str) -> DeliveryError:
    return DeliveryError("RELEASE_INTEGRITY_VIOLATION", message, status_code=409)

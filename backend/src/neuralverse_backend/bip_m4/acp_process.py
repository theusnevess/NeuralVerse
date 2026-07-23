"""Bounded subprocess adapter for the authorized ACP executable boundary."""

from __future__ import annotations

import asyncio
import hashlib
import json
import os
import signal
from collections.abc import Sequence
from dataclasses import dataclass
from typing import Any

from neuralverse_backend.canonical_input import read_canonical_input

PROTOCOL = "nv-acp-process-protocol"
PROTOCOL_VERSION = "1.0.0"
DEFAULT_MAX_OUTPUT_BYTES = 8 * 1024 * 1024
DEFAULT_COMMAND = ("neuralverse-acp", "execute")


class ACPProcessFailure(RuntimeError):
    def __init__(self, code: str, message: str, *, retryable: bool = False) -> None:
        super().__init__(message)
        self.code = code
        self.retryable = retryable


@dataclass(frozen=True, slots=True)
class ACPArtifactReference:
    contract_name: str
    contract_version: str
    artifact_fingerprint: str
    canonical_json: dict[str, Any]
    raw_canonical_json: bytes


@dataclass(frozen=True, slots=True)
class ACPProcessConfig:
    command: tuple[str, ...] = DEFAULT_COMMAND
    working_directory: str | None = None
    timeout_seconds: float = 300.0
    max_input_bytes: int = 4 * 1024 * 1024
    max_output_bytes: int = DEFAULT_MAX_OUTPUT_BYTES
    max_stderr_bytes: int = 64 * 1024

    @classmethod
    def from_environment(cls) -> ACPProcessConfig:
        raw = os.getenv("NEURALVERSE_ACP_COMMAND")
        command = tuple(json.loads(raw)) if raw else DEFAULT_COMMAND
        if not command or any(not isinstance(item, str) or not item for item in command):
            raise ValueError("NEURALVERSE_ACP_COMMAND must be a non-empty JSON string array")
        return cls(command=command, working_directory=os.getenv("NEURALVERSE_ACP_WORKDIR"))


class ACPProcessAdapter:
    def __init__(self, config: ACPProcessConfig | None = None) -> None:
        self.config = config or ACPProcessConfig.from_environment()

    async def execute(
        self,
        *,
        request_id: str,
        operation: str,
        operation_version: str,
        idempotency_key: str,
        correlation_id: str,
        payload: dict[str, Any],
        input_contract: dict[str, str],
        deadline: str | None = None,
        heartbeat: Any | None = None,
    ) -> ACPArtifactReference:
        request = {
            "protocol": PROTOCOL,
            "protocol_version": PROTOCOL_VERSION,
            "request_id": request_id,
            "operation": operation,
            "operation_version": operation_version,
            "idempotency_key": idempotency_key,
            "correlation_id": correlation_id,
            "input_contract": input_contract,
            "payload": payload,
            "policy": {
                "deadline": deadline,
                "maximum_output_bytes": self.config.max_output_bytes,
            },
        }
        raw_request = json.dumps(
            request, ensure_ascii=False, sort_keys=True, separators=(",", ":")
        ).encode()
        if len(raw_request) > self.config.max_input_bytes:
            raise ACPProcessFailure(
                "ACP_INPUT_TOO_LARGE", "ACP request exceeds the configured bound"
            )
        try:
            process = await asyncio.create_subprocess_exec(
                *self.config.command,
                stdin=asyncio.subprocess.PIPE,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
                cwd=self.config.working_directory,
            )
        except OSError as error:
            raise ACPProcessFailure(
                "ACP_PROCESS_START_FAILED",
                "ACP executable could not be started",
                retryable=True,
            ) from error
        try:
            stdout, stderr = await asyncio.wait_for(
                process.communicate(raw_request), timeout=self.config.timeout_seconds
            )
        except TimeoutError as error:
            process.terminate()
            await process.wait()
            raise ACPProcessFailure(
                "ACP_PROCESS_TIMEOUT",
                "ACP executable exceeded its deadline",
                retryable=True,
            ) from error
        if heartbeat is not None:
            heartbeat(
                {
                    "operation": operation,
                    "request_id": request_id,
                    "stderr_bytes": min(len(stderr), self.config.max_stderr_bytes),
                }
            )
        if len(stdout) > self.config.max_output_bytes:
            raise ACPProcessFailure(
                "ACP_OUTPUT_TOO_LARGE", "ACP response exceeds the configured bound"
            )
        if process.returncode == -signal.SIGTERM:
            raise ACPProcessFailure("ACP_PROCESS_CANCELLED", "ACP executable was cancelled")
        try:
            response = json.loads(stdout.decode("utf-8"))
        except (UnicodeDecodeError, json.JSONDecodeError) as error:
            raise ACPProcessFailure(
                "ACP_PROTOCOL_INVALID",
                "ACP executable returned invalid JSON",
            ) from error
        if (
            not isinstance(response, dict)
            or response.get("protocol") != PROTOCOL
            or response.get("protocol_version") != PROTOCOL_VERSION
        ):
            raise ACPProcessFailure(
                "ACP_PROTOCOL_VERSION_UNSUPPORTED", "ACP response protocol is unsupported"
            )
        if response.get("status") != "SUCCESS":
            response_error = response.get("error")
            if not isinstance(response_error, dict):
                response_error = {}
            code = str(response_error.get("code", "ACP_RUNTIME_NON_RETRYABLE_FAILURE"))
            raise ACPProcessFailure(
                code,
                (
                    f"ACP executable returned a bounded failure: {code}: "
                    f"{response_error.get('message', '')}"
                ),
                retryable=bool(response_error.get("retryable", False)),
            )
        artifact = response.get("artifact")
        if not isinstance(artifact, dict) or not isinstance(artifact.get("canonical_json"), dict):
            raise ACPProcessFailure(
                "ACP_PROTOCOL_INVALID", "ACP success response has no canonical artifact"
            )
        canonical = json.dumps(
            artifact["canonical_json"],
            ensure_ascii=False,
            sort_keys=True,
            separators=(",", ":"),
        ).encode()
        fingerprint = hashlib.sha256(canonical).hexdigest()
        if fingerprint != artifact.get("artifact_fingerprint"):
            raise ACPProcessFailure(
                "ACP_CONTRACT_INVALID", "ACP artifact fingerprint does not match canonical bytes"
            )
        validation = read_canonical_input(canonical)
        if not validation.accepted:
            raise ACPProcessFailure(
                "ACP_CONTRACT_INVALID", "ACP artifact failed released XFI validation"
            )
        return ACPArtifactReference(
            contract_name=str(artifact.get("contract_name", "")),
            contract_version=str(artifact.get("contract_version", "")),
            artifact_fingerprint=fingerprint,
            canonical_json=artifact["canonical_json"],
            raw_canonical_json=canonical,
        )


def command_from_environment() -> Sequence[str]:
    return ACPProcessConfig.from_environment().command

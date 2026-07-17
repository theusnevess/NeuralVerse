from __future__ import annotations

import hashlib
import json
from decimal import Decimal
from typing import Any

STRUCTURAL_HASH_ALGORITHM = "struct-v1"


def raw_payload_sha256(raw_payload: bytes) -> str:
    return hashlib.sha256(raw_payload).hexdigest()


def _canonical_decimal(value: Decimal) -> str:
    if value.is_zero():
        return "0"
    rendered = format(value, "f")
    if "." in rendered:
        rendered = rendered.rstrip("0").rstrip(".")
    return rendered


def _canonical_json(value: Any) -> str:
    if value is None:
        return "null"
    if value is True:
        return "true"
    if value is False:
        return "false"
    if isinstance(value, int):
        return str(value)
    if isinstance(value, Decimal):
        return _canonical_decimal(value)
    if isinstance(value, str):
        return json.dumps(value, ensure_ascii=False, separators=(",", ":"))
    if isinstance(value, list):
        return "[" + ",".join(_canonical_json(item) for item in value) + "]"
    if isinstance(value, dict):
        items = []
        for key in sorted(value):
            items.append(
                json.dumps(key, ensure_ascii=False, separators=(",", ":"))
                + ":"
                + _canonical_json(value[key])
            )
        return "{" + ",".join(items) + "}"
    raise TypeError(f"unsupported structural JSON value: {type(value).__name__}")


def canonicalize_structural_json(value: Any) -> bytes:
    return _canonical_json(value).encode("utf-8")


def structural_payload_sha256(value: Any) -> str:
    return hashlib.sha256(canonicalize_structural_json(value)).hexdigest()


def decode_canonical_structural_json(value: str) -> Any:
    """Decode persisted canonical JSON with exact decimal values."""

    return json.loads(value, parse_float=Decimal)

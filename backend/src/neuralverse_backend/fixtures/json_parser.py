from __future__ import annotations

import json
import re
from decimal import Decimal
from typing import Any, cast

from neuralverse_backend.fixtures.errors import PayloadIssue

MAX_SIGNIFICANT_DIGITS = 256
MAX_ABSOLUTE_LEXICAL_EXPONENT = 1000
MAX_NORMALIZED_DECIMAL_SCALE = 256
MAX_NESTING_DEPTH = 64
MAX_OBJECT_MEMBERS = 4096
MAX_ARRAY_ELEMENTS = 16384
MAX_STRING_CODE_POINTS = 262144
MAX_OBJECT_KEY_CODE_POINTS = 256

_EXPONENT_PATTERN = re.compile(r"[eE]([+-]?\d+)$")


def _lexical_exponent(token: str) -> int:
    match = _EXPONENT_PATTERN.search(token)
    return int(match.group(1)) if match else 0


def _normalized_scale(value: Decimal) -> int:
    if value.is_zero():
        return 0
    digits = list(value.as_tuple().digits)
    exponent = cast(int, value.as_tuple().exponent)
    while len(digits) > 1 and digits[-1] == 0:
        digits.pop()
        exponent += 1
    return max(-exponent, 0)


def _validate_number(token: str, value: Decimal) -> None:
    significant_digits = len(value.as_tuple().digits)
    exponent = _lexical_exponent(token)
    if significant_digits > MAX_SIGNIFICANT_DIGITS:
        raise PayloadIssue("FIXTURE_NUMERIC_LIMIT", "Numeric significant-digit limit exceeded.")
    if abs(exponent) > MAX_ABSOLUTE_LEXICAL_EXPONENT:
        raise PayloadIssue("FIXTURE_NUMERIC_LIMIT", "Numeric exponent limit exceeded.")
    if _normalized_scale(value) > MAX_NORMALIZED_DECIMAL_SCALE:
        raise PayloadIssue("FIXTURE_NUMERIC_LIMIT", "Numeric scale limit exceeded.")


def _parse_integer(token: str) -> int:
    digits = token.removeprefix("-")
    if len(digits) > MAX_SIGNIFICANT_DIGITS:
        raise PayloadIssue("FIXTURE_NUMERIC_LIMIT", "Integer significant-digit limit exceeded.")
    return int(token)


def _parse_decimal(token: str) -> Decimal:
    value = Decimal(token)
    _validate_number(token, value)
    return value


def _reject_constant(token: str) -> Any:
    raise PayloadIssue("FIXTURE_NON_FINITE_NUMBER", "Non-finite JSON numbers are not accepted.")


def _object_pairs(pairs: list[tuple[str, Any]]) -> dict[str, Any]:
    result: dict[str, Any] = {}
    for key, value in pairs:
        if key in result:
            raise PayloadIssue("FIXTURE_DUPLICATE_KEYS", "Duplicate object key rejected.")
        result[key] = value
    return result


def parse_strict_json(text: str) -> Any:
    try:
        return json.loads(
            text,
            object_pairs_hook=_object_pairs,
            parse_int=_parse_integer,
            parse_float=_parse_decimal,
            parse_constant=_reject_constant,
        )
    except PayloadIssue:
        raise
    except (json.JSONDecodeError, RecursionError, UnicodeError) as error:
        raise PayloadIssue("FIXTURE_INVALID_JSON", "Payload is not valid strict JSON.") from error


def structural_findings(value: Any) -> list[tuple[str, str]]:
    findings: list[tuple[str, str]] = []

    def visit(current: Any, depth: int) -> None:
        if depth > MAX_NESTING_DEPTH:
            findings.append(("FIXTURE_STRUCTURAL_LIMIT", "JSON nesting depth limit exceeded."))
            return
        if isinstance(current, dict):
            if len(current) > MAX_OBJECT_MEMBERS:
                findings.append(("FIXTURE_STRUCTURAL_LIMIT", "Object member limit exceeded."))
            for key, child in current.items():
                if len(key) > MAX_OBJECT_KEY_CODE_POINTS:
                    findings.append(
                        ("FIXTURE_STRUCTURAL_LIMIT", "Object-key length limit exceeded.")
                    )
                visit(child, depth + 1)
        elif isinstance(current, list):
            if len(current) > MAX_ARRAY_ELEMENTS:
                findings.append(("FIXTURE_STRUCTURAL_LIMIT", "Array element limit exceeded."))
            for child in current:
                visit(child, depth + 1)
        elif isinstance(current, str) and len(current) > MAX_STRING_CODE_POINTS:
            findings.append(("FIXTURE_STRUCTURAL_LIMIT", "String length limit exceeded."))

    visit(value, 0)
    return findings

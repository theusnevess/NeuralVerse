"""Executable Stage 7 SVD reference laboratory starter."""

from __future__ import annotations

from typing import Final

import numpy as np

MAX_RANK: Final[int] = 256


def truncated_svd(matrix: np.ndarray, rank: int) -> np.ndarray:
    """Return a validated rank-k reconstruction of a 2-D numeric matrix."""

    array = np.asarray(matrix, dtype=np.float64)
    if array.ndim != 2 or array.size == 0:
        raise ValueError("matrix must be a non-empty 2-D array")
    left, singular_values, right_transpose = np.linalg.svd(array, full_matrices=False)
    if not 1 <= rank <= min(array.shape[0], array.shape[1], MAX_RANK):
        raise ValueError("rank must be between one and the matrix rank")
    return (left[:, :rank] * singular_values[:rank]) @ right_transpose[:rank, :]


def reconstruction_metrics(matrix: np.ndarray, rank: int) -> dict[str, float]:
    """Calculate error, retained spectral energy and estimated storage ratio."""

    array = np.asarray(matrix, dtype=np.float64)
    _, singular_values, _ = np.linalg.svd(array, full_matrices=False)
    reconstruction = truncated_svd(array, rank)
    energy = float(np.sum(singular_values**2))
    retained = float(np.sum(singular_values[:rank] ** 2) / energy) if energy else 1.0
    estimated_ratio = (array.shape[0] * array.shape[1]) / (
        rank * (array.shape[0] + array.shape[1] + 1)
    )
    return {
        "frobenius_error": float(np.linalg.norm(array - reconstruction, ord="fro")),
        "retained_energy": retained,
        "estimated_compression_ratio": float(estimated_ratio),
    }


def reconstruct_rgb(image: np.ndarray, rank: int) -> np.ndarray:
    """Apply the grayscale pipeline independently to RGB channels."""

    array = np.asarray(image, dtype=np.float64)
    if array.ndim != 3 or array.shape[2] != 3:
        raise ValueError("RGB image must have shape (height, width, 3)")
    return np.clip(
        np.stack([truncated_svd(array[:, :, channel], rank) for channel in range(3)], axis=2),
        0.0,
        255.0,
    )


def main() -> None:
    grayscale = np.arange(1, 65, dtype=np.float64).reshape(8, 8)
    assert truncated_svd(grayscale, 1).shape == grayscale.shape
    metrics = reconstruction_metrics(grayscale, 4)
    assert np.isfinite(list(metrics.values())).all()
    rgb = np.repeat(grayscale[:, :, None], 3, axis=2)
    assert reconstruct_rgb(rgb, 4).shape == rgb.shape
    for invalid_rank in (0, 9):
        try:
            truncated_svd(grayscale, invalid_rank)
        except ValueError:
            pass
        else:
            raise AssertionError("invalid rank was accepted")
    print({"status": "PASS", "metrics": metrics})


if __name__ == "__main__":
    main()

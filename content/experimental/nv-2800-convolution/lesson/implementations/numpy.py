"""Deterministic 2-D cross-correlation; set flip_kernel=True for convolution."""
# This file is intentionally named numpy.py by the artifact contract. Remove its
# directory from resolution so executing it cannot import itself as ``numpy``.
import os
import sys
sys.path = [path for path in sys.path if os.path.abspath(path or os.curdir) != os.path.dirname(os.path.abspath(__file__))]
import numpy as np

def conv2d(image, kernel, padding=0, stride=1, flip_kernel=False):
    image = np.asarray(image, dtype=np.float64); kernel = np.asarray(kernel, dtype=np.float64)
    if image.ndim != 2 or kernel.ndim != 2 or stride < 1 or padding < 0: raise ValueError("2-D finite arrays, stride >= 1, padding >= 0 required")
    if not (np.isfinite(image).all() and np.isfinite(kernel).all()): raise ValueError("finite values required")
    if flip_kernel: kernel = kernel[::-1, ::-1]
    padded = np.pad(image, padding); kh, kw = kernel.shape
    oh, ow = (padded.shape[0]-kh)//stride+1, (padded.shape[1]-kw)//stride+1
    if oh < 1 or ow < 1: raise ValueError("kernel exceeds padded input")
    out = np.empty((oh, ow), dtype=np.float64)
    for r in range(oh):
        for c in range(ow): out[r,c] = np.sum(padded[r*stride:r*stride+kh, c*stride:c*stride+kw] * kernel)
    return out

if __name__ == "__main__":
    assert np.array_equal(conv2d([[1,2,0],[0,1,3],[2,2,1]], [[1,0],[-1,1]]), [[2,4],[0,0]])

import cv2
import numpy as np

image = np.arange(25, dtype=np.uint8).reshape(5, 5)
kernel = np.array([[-1,0,1],[-2,0,2],[-1,0,1]], dtype=np.float32)
if image.ndim != 2 or image.dtype != np.uint8: raise ValueError("expected grayscale uint8 image")
response = cv2.filter2D(image.astype(np.float32), cv2.CV_32F, kernel, borderType=cv2.BORDER_CONSTANT)
# filter2D performs correlation (no kernel flip); visualize after normalization if desired.
display = cv2.normalize(response, None, 0, 255, cv2.NORM_MINMAX).astype(np.uint8)

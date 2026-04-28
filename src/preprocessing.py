"""
BWD AI — Image Preprocessing Pipeline
Step 3: Lighting Correction, White Balance, Leaf Segmentation
"""

import cv2
import numpy as np
from typing import Tuple, Optional


class BWDPreprocessor:
    """Image preprocessor for BWD leaf color analysis."""

    def __init__(self, target_size: Tuple[int, int] = (256, 256)):
        self.target_size = target_size

    def auto_white_balance(self, image: np.ndarray) -> np.ndarray:
        """Apply Gray World white balance correction."""
        result = image.copy().astype(np.float64)
        avg_b = np.mean(result[:, :, 0])
        avg_g = np.mean(result[:, :, 1])
        avg_r = np.mean(result[:, :, 2])
        avg_gray = (avg_b + avg_g + avg_r) / 3.0

        result[:, :, 0] = np.clip(result[:, :, 0] * (avg_gray / (avg_b + 1e-6)), 0, 255)
        result[:, :, 1] = np.clip(result[:, :, 1] * (avg_gray / (avg_g + 1e-6)), 0, 255)
        result[:, :, 2] = np.clip(result[:, :, 2] * (avg_gray / (avg_r + 1e-6)), 0, 255)
        return result.astype(np.uint8)

    def normalize_lighting(self, image: np.ndarray) -> np.ndarray:
        """Normalize lighting using CLAHE on LAB L-channel."""
        lab = cv2.cvtColor(image, cv2.COLOR_BGR2LAB)
        l, a, b = cv2.split(lab)
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
        l_corrected = clahe.apply(l)
        return cv2.cvtColor(cv2.merge([l_corrected, a, b]), cv2.COLOR_LAB2BGR)

    def segment_leaf(self, image: np.ndarray) -> Tuple[np.ndarray, np.ndarray]:
        """Segment leaf using HSV color thresholding for green hues."""
        hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
        lower_green = np.array([20, 30, 30])
        upper_green = np.array([90, 255, 255])
        mask = cv2.inRange(hsv, lower_green, upper_green)

        kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
        mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel, iterations=2)
        mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, kernel, iterations=1)

        contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        if contours:
            largest = max(contours, key=cv2.contourArea)
            refined = np.zeros_like(mask)
            cv2.drawContours(refined, [largest], -1, 255, -1)
            mask = refined

        segmented = cv2.bitwise_and(image, image, mask=mask)
        return segmented, mask

    def extract_roi(self, image: np.ndarray, mask: np.ndarray) -> Optional[np.ndarray]:
        """Extract bounding box ROI of the segmented leaf."""
        contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        if not contours:
            return None
        x, y, w, h = cv2.boundingRect(max(contours, key=cv2.contourArea))
        pad = 10
        x, y = max(0, x - pad), max(0, y - pad)
        w = min(image.shape[1] - x, w + 2 * pad)
        h = min(image.shape[0] - y, h + 2 * pad)
        return image[y:y+h, x:x+w]

    def preprocess(self, image: np.ndarray, segment: bool = True) -> dict:
        """Full preprocessing pipeline: WB -> Lighting -> Segment -> ROI."""
        results = {"original": image.copy()}
        wb = self.auto_white_balance(image)
        results["white_balanced"] = wb
        normalized = self.normalize_lighting(wb)
        results["lighting_normalized"] = normalized

        if segment:
            seg, mask = self.segment_leaf(normalized)
            results["segmented"] = seg
            results["mask"] = mask
            roi = self.extract_roi(normalized, mask)
            if roi is not None:
                results["roi"] = roi
                results["final"] = cv2.resize(roi, self.target_size)
            else:
                results["final"] = cv2.resize(normalized, self.target_size)
        else:
            results["final"] = cv2.resize(normalized, self.target_size)
        return results


def load_image(path: str) -> np.ndarray:
    img = cv2.imread(path)
    if img is None:
        raise FileNotFoundError(f"Could not load image: {path}")
    return img

"""
BWD AI — Color Feature Extraction Module
Step 4: Extract RGB, HSV, Lab features from leaf images
"""

import cv2
import numpy as np
from typing import Dict


class ColorFeatureExtractor:
    """Extract color features from leaf images in multiple color spaces."""

    def extract_rgb(self, image: np.ndarray, mask: np.ndarray = None) -> Dict[str, float]:
        """Extract RGB statistics from the leaf region."""
        if mask is not None:
            pixels = image[mask > 0]
        else:
            pixels = image.reshape(-1, 3)

        if len(pixels) == 0:
            return {f"rgb_{s}_{c}": 0.0 for s in ["mean", "std"] for c in ["b", "g", "r"]}

        return {
            "rgb_mean_b": float(np.mean(pixels[:, 0])),
            "rgb_mean_g": float(np.mean(pixels[:, 1])),
            "rgb_mean_r": float(np.mean(pixels[:, 2])),
            "rgb_std_b": float(np.std(pixels[:, 0])),
            "rgb_std_g": float(np.std(pixels[:, 1])),
            "rgb_std_r": float(np.std(pixels[:, 2])),
            "rgb_ratio_rg": float(np.mean(pixels[:, 2]) / (np.mean(pixels[:, 1]) + 1e-6)),
            "rgb_ratio_rb": float(np.mean(pixels[:, 2]) / (np.mean(pixels[:, 0]) + 1e-6)),
            "rgb_greenness": float(2 * np.mean(pixels[:, 1]) - np.mean(pixels[:, 2]) - np.mean(pixels[:, 0])),
        }

    def extract_hsv(self, image: np.ndarray, mask: np.ndarray = None) -> Dict[str, float]:
        """Extract HSV statistics — Hue is key for green shade classification."""
        hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
        pixels = hsv[mask > 0] if mask is not None else hsv.reshape(-1, 3)

        if len(pixels) == 0:
            return {f"hsv_{s}_{c}": 0.0 for s in ["mean", "std"] for c in ["h", "s", "v"]}

        return {
            "hsv_mean_h": float(np.mean(pixels[:, 0])),
            "hsv_mean_s": float(np.mean(pixels[:, 1])),
            "hsv_mean_v": float(np.mean(pixels[:, 2])),
            "hsv_std_h": float(np.std(pixels[:, 0])),
            "hsv_std_s": float(np.std(pixels[:, 1])),
            "hsv_std_v": float(np.std(pixels[:, 2])),
        }

    def extract_lab(self, image: np.ndarray, mask: np.ndarray = None) -> Dict[str, float]:
        """Extract CIE Lab statistics — a* channel correlates with green intensity."""
        lab = cv2.cvtColor(image, cv2.COLOR_BGR2LAB)
        pixels = lab[mask > 0] if mask is not None else lab.reshape(-1, 3)

        if len(pixels) == 0:
            return {f"lab_{s}_{c}": 0.0 for s in ["mean", "std"] for c in ["l", "a", "b"]}

        return {
            "lab_mean_l": float(np.mean(pixels[:, 0])),
            "lab_mean_a": float(np.mean(pixels[:, 1])),
            "lab_mean_b": float(np.mean(pixels[:, 2])),
            "lab_std_l": float(np.std(pixels[:, 0])),
            "lab_std_a": float(np.std(pixels[:, 1])),
            "lab_std_b": float(np.std(pixels[:, 2])),
        }

    def extract_all(self, image: np.ndarray, mask: np.ndarray = None) -> Dict[str, float]:
        """Extract all features from RGB, HSV, and Lab color spaces."""
        features = {}
        features.update(self.extract_rgb(image, mask))
        features.update(self.extract_hsv(image, mask))
        features.update(self.extract_lab(image, mask))
        features["total_leaf_pixels"] = float(np.sum(mask > 0)) if mask is not None else float(image.shape[0] * image.shape[1])
        return features

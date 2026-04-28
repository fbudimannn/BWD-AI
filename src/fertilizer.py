"""
BWD AI — Fertilizer Recommendation Engine
Steps 6-8: BWD Scale -> Nitrogen Status -> Urea Recommendation

Based on IRRI Leaf Color Chart dosage table:
┌──────────────┬────────┬────────┬────────┬────────┐
│ BWD Value    │ 5 t/ha │ 6 t/ha │ 7 t/ha │ 8 t/ha │
│              │ Urea (kg/ha)                       │
├──────────────┼────────┼────────┼────────┼────────┤
│ 2 - 3        │   75   │  100   │  125   │  150   │
│ Antara 3 & 4 │   50   │   75   │  100   │  125   │
│ 4 - 5        │    0   │  0/50  │   50   │   50   │
└──────────────┴────────┴────────┴────────┴────────┘
"""

from typing import Dict, Optional
from dataclasses import dataclass


@dataclass
class NitrogenStatus:
    """Represents the nitrogen status of a rice plant."""
    bwd_score: float
    level: str          # "deficient", "adequate", "optimum", "excessive"
    label_id: str       # Indonesian label
    color_hex: str      # For UI display
    description: str


@dataclass
class FertilizerRecommendation:
    """Complete fertilizer recommendation output."""
    nitrogen_status: NitrogenStatus
    target_yield: float       # ton/ha
    urea_dose_kg_ha: float    # kg/ha
    urea_dose_range: str      # e.g., "75-150"
    timing: str               # Application timing advice
    notes: str                # Additional notes


# === IRRI Dosage Table ===
# Format: DOSAGE_TABLE[bwd_range_key][target_yield] = urea_kg_ha
DOSAGE_TABLE = {
    "2-3": {5: 75, 6: 100, 7: 125, 8: 150},
    "3-4": {5: 50, 6: 75, 7: 100, 8: 125},
    "4-5": {5: 0, 6: 25, 7: 50, 8: 50},  # 6 t/ha = "0 atau 50" -> avg 25
}

# === Nitrogen Status Definitions ===
NITROGEN_LEVELS = {
    2: NitrogenStatus(2, "deficient", "Kekurangan Nitrogen (Berat)",
                      "#CDDC39", "Daun sangat pucat, tanaman sangat kekurangan N. Pemupukan segera diperlukan."),
    3: NitrogenStatus(3, "adequate", "Nitrogen Cukup Rendah",
                      "#8BC34A", "Daun hijau muda, nitrogen masih di bawah optimal. Pemupukan moderat disarankan."),
    4: NitrogenStatus(4, "optimum", "Nitrogen Optimal",
                      "#4CAF50", "Daun hijau sedang, nitrogen dalam kondisi optimal. Pemupukan minimal atau tidak diperlukan."),
    5: NitrogenStatus(5, "excessive", "Nitrogen Berlebih",
                      "#2E7D32", "Daun hijau tua pekat, nitrogen berlebih. Tidak perlu pemupukan tambahan."),
}


class FertilizerEngine:
    """
    Fertilizer recommendation engine based on IRRI BWD dosage table.
    Implements Steps 6-8 of the BWD AI pipeline.
    """

    def __init__(self):
        self.dosage_table = DOSAGE_TABLE
        self.nitrogen_levels = NITROGEN_LEVELS

    def get_nitrogen_status(self, bwd_score: float) -> NitrogenStatus:
        """
        Determine nitrogen status from BWD score.

        Args:
            bwd_score: BWD scale value (2.0 to 5.0)

        Returns:
            NitrogenStatus object
        """
        if bwd_score < 2.0 or bwd_score > 5.0:
            raise ValueError(f"BWD score must be between 2.0 and 5.0, got {bwd_score}")

        # Round to nearest integer for status lookup
        rounded = round(bwd_score)
        rounded = max(2, min(5, rounded))
        status = self.nitrogen_levels[rounded]
        # Update with actual score
        return NitrogenStatus(bwd_score, status.level, status.label_id,
                              status.color_hex, status.description)

    def get_bwd_range_key(self, bwd_score: float) -> str:
        """Map BWD score to dosage table range key."""
        if bwd_score < 3.0:
            return "2-3"
        elif bwd_score < 4.0:
            return "3-4"
        else:
            return "4-5"

    def get_urea_dose(self, bwd_score: float, target_yield: float) -> float:
        """
        Get urea dose recommendation.

        Args:
            bwd_score: BWD scale value (2.0-5.0)
            target_yield: Target yield in ton/ha (5, 6, 7, or 8)

        Returns:
            Recommended urea dose in kg/ha
        """
        range_key = self.get_bwd_range_key(bwd_score)
        target = round(target_yield)
        target = max(5, min(8, target))
        return self.dosage_table[range_key][target]

    def recommend(self, bwd_score: float, target_yield: float = 6.0) -> FertilizerRecommendation:
        """
        Generate complete fertilizer recommendation.

        Args:
            bwd_score: BWD scale value (2.0-5.0)
            target_yield: Target yield in ton/ha (default: 6.0)

        Returns:
            Complete FertilizerRecommendation
        """
        status = self.get_nitrogen_status(bwd_score)
        urea_dose = self.get_urea_dose(bwd_score, target_yield)
        range_key = self.get_bwd_range_key(bwd_score)

        # Get dose range across all target yields
        doses = self.dosage_table[range_key]
        dose_range = f"{min(doses.values())}-{max(doses.values())}"

        # Timing advice based on nitrogen status
        timing_map = {
            "deficient": "Segera aplikasikan pupuk urea. Pemupukan susulan pada 25 HST atau fase anakan aktif.",
            "adequate": "Aplikasikan pupuk urea moderat pada fase anakan aktif (25-35 HST).",
            "optimum": "Pemupukan minimal. Monitor kembali pada 7-10 hari ke depan.",
            "excessive": "Tidak diperlukan pemupukan. Hindari kelebihan yang dapat menyebabkan kerebahan.",
        }

        notes_map = {
            "deficient": "Perhatikan kondisi air dan drainase. Pupuk disebarkan merata saat sawah macak-macak.",
            "adequate": "Perhatikan cuaca. Hindari pemupukan saat hujan deras untuk mengurangi kehilangan N.",
            "optimum": "Kondisi nitrogen baik. Fokus pada pengelolaan air dan pengendalian hama.",
            "excessive": "Kelebihan N dapat meningkatkan kerentanan terhadap hama dan penyakit. Monitor kerebahan.",
        }

        return FertilizerRecommendation(
            nitrogen_status=status,
            target_yield=target_yield,
            urea_dose_kg_ha=urea_dose,
            urea_dose_range=dose_range,
            timing=timing_map[status.level],
            notes=notes_map[status.level],
        )

    def to_dict(self, rec: FertilizerRecommendation) -> Dict:
        """Convert recommendation to dictionary for API/JSON response."""
        return {
            "bwd_score": rec.nitrogen_status.bwd_score,
            "nitrogen_status": {
                "level": rec.nitrogen_status.level,
                "label": rec.nitrogen_status.label_id,
                "color": rec.nitrogen_status.color_hex,
                "description": rec.nitrogen_status.description,
            },
            "recommendation": {
                "target_yield_ton_ha": rec.target_yield,
                "urea_dose_kg_ha": rec.urea_dose_kg_ha,
                "urea_dose_range": rec.urea_dose_range,
                "timing": rec.timing,
                "notes": rec.notes,
            },
        }


# === Demo ===
if __name__ == "__main__":
    engine = FertilizerEngine()

    print("=" * 60)
    print("BWD AI — Fertilizer Recommendation Engine Demo")
    print("=" * 60)

    for bwd in [2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0]:
        rec = engine.recommend(bwd, target_yield=7.0)
        d = engine.to_dict(rec)
        print(f"\nBWD Score: {bwd}")
        print(f"  Status: {d['nitrogen_status']['label']}")
        print(f"  Urea: {d['recommendation']['urea_dose_kg_ha']} kg/ha")
        print(f"  Timing: {d['recommendation']['timing']}")

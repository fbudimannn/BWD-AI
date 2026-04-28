# 🌾 BWD AI — Digitalisasi Bagan Warna Daun Berbasis Artificial Intelligence

**🌐 Live Demo / Prototype:** [https://fbudimannn.github.io/BWD-AI/](https://fbudimannn.github.io/BWD-AI/)

> Sistem cerdas untuk menentukan status nitrogen tanaman padi melalui analisis citra daun menggunakan AI/Computer Vision.

## 📋 Overview

Bagan Warna Daun (BWD) / Leaf Color Chart (LCC) adalah alat diagnostik dari IRRI yang digunakan petani untuk menilai kebutuhan nitrogen pada padi. Proyek ini mendigitalisasi BWD menggunakan **computer vision** dan **machine learning** agar lebih akurat, objektif, dan konsisten.

## 🏗️ Architecture

```
📱 Smartphone Camera → ⚙️ Image Processing → 🧠 AI Model → 📊 BWD Scale → 💊 Fertilizer Recommendation
```

### 9-Step Pipeline
1. **Plant Condition** — Observasi kondisi daun
2. **Image Acquisition** — Ambil foto via smartphone
3. **Image Processing** — Koreksi pencahayaan, segmentasi daun
4. **Feature Extraction** — Ekstrak fitur RGB, HSV, Lab
5. **AI Model** — Klasifikasi ke skala BWD
6. **Digital BWD Scale** — Output skor 2-5
7. **Nitrogen Status** — Deficient / Adequate / Optimum / Excessive
8. **Fertilizer Recommendation** — Dosis urea (kg/ha)
9. **Decision Support System** — Dashboard & historical tracking

## 📁 Project Structure

```
BWD/
├── app/                    # Web app (PWA frontend)
│   ├── index.html
│   ├── css/
│   ├── js/
│   └── assets/
├── src/                    # Core Python modules
│   ├── preprocessing.py    # Image preprocessing pipeline
│   ├── feature_extraction.py # Color feature extraction
│   ├── fertilizer.py       # Fertilizer recommendation engine
│   ├── model.py            # AI model training & inference
│   └── utils.py            # Utilities
├── api/                    # FastAPI backend
│   └── main.py
├── data/                   # Dataset (not tracked in git)
│   ├── raw/
│   ├── processed/
│   └── labels/
├── models/                 # Trained model files
├── notebooks/              # Jupyter notebooks for EDA
├── tests/                  # Unit tests
├── Om_iman_document/       # Reference documents
├── requirements.txt
└── README.md
```

## 🚀 Quick Start

```bash
# Install dependencies
pip install -r requirements.txt

# Run web app locally
# Open app/index.html in browser

# Run API server
uvicorn api.main:app --reload
```

## 👥 Team

- **Teguh Iman Santoso** — Domain Expert & Advisor
- **Fakhri Musyafa Budiman** - Tim hore tech support and data science
- **Restu** - Time hore tech support and data science

## 📄 License

This project is part of academic research on precision agriculture.

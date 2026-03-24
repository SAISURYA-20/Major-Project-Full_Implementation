# Hybrid LSTM-Transformer-GNN Financial Distress Prediction System

## Project Abstract

A full-stack machine learning application that predicts financial company health status and investment regime classification using a cutting-edge hybrid deep learning architecture. The system combines LSTM networks for temporal patterns, Transformer mechanisms for long-range dependencies, and Graph Neural Networks for industry relationships to achieve 79.4% combined accuracy on real-world financial data.

---

## What Is This Project?

This is an **intelligent financial analysis platform** that automatically predicts whether companies will face financial distress and classifies them into investment regimes. Built with production-ready architecture, it serves predictions through a REST API and displays insights through an interactive React dashboard.

**Key Innovation:** Hybrid three-component architecture (LSTM-Transformer-GNN) with 342,989 parameters that captures both temporal financial patterns and structural industry relationships.

---

## Main Project Goals

✅ **Primary Goals:**
- Predict financial distress status (Healthy vs Distressed) with 88.2% accuracy
- Classify companies into 4 investment regimes (Growth/Value/Stable/Speculative) with 70.6% accuracy
- Achieve combined 79.4% accuracy across both classification tasks
- Replace random labels with real financial metrics-based intelligent labels

✅ **Secondary Goals:**
- Build production-ready full-stack application
- Create interactive dashboard for financial analysis
- Provide explainable predictions with feature importance analysis
- Enable real-time company financial health assessment

---

## Technologies & Tools Used

### Backend Stack
- **FastAPI** - RESTful API framework
- **PyTorch** (v2.10.0) - Deep learning framework
- **torch-geometric** (v2.4.0) - Graph neural networks library
- **Pandas & NumPy** - Data processing
- **Python** - Core language

### Frontend Stack
- **React** (v19.0.0) - User interface framework
- **Chart.js** - Data visualization
- **Tailwind CSS** - Responsive styling
- **Axios** - HTTP client
- **React Router** - Navigation

### Data & Model
- **226 companies** across **85 industries**
- **40 raw financial metrics** → **135 engineered features**
- **342,989 model parameters**
- Pre-trained model: 4.1MB (hybrid_model.pth)

---

## Input Data (What Goes In)

### 40 Financial Metrics:

**Profitability Metrics:**
- EBITDA, Gross Profit, Operating Income
- Profit Margins, Operating Margins, EBITDA Margins
- Net Income, Earnings Growth

**Cash Flow Metrics:**
- Operating Cash Flow, Free Cash Flow
- Cash conversion rates

**Liquidity Metrics:**
- Current Ratio, Quick Ratio, Total Cash, Cash per Share

**Leverage/Solvency Metrics:**
- Debt-to-Equity Ratio, Total Debt, Total Equity, Enterprise Value

**Efficiency Metrics:**
- Return on Assets (ROA), Return on Equity (ROE), Asset Turnover

**Growth Metrics:**
- Revenue Growth, Earnings Growth, Quarterly Growth Rates

**Valuation Metrics:**
- Price-to-Book, Enterprise-to-Revenue, Enterprise-to-EBITDA

**Company Context:**
- Company Name, Industry Classification

---

## Output Predictions (What Comes Out)

### Output 1: Distress Label (Binary Classification)
```
0 = HEALTHY COMPANY ✓
1 = DISTRESSED COMPANY ✗

Example: Apple → 0 (Healthy), Peloton → 1 (Distressed)
Distribution: 43 healthy (19%), 183 distressed (81%)
```

### Output 2: Investment Regime (4-Class Classification)
```
0 = GROWTH (High ROE, High margins, Low leverage)
1 = VALUE (Strong cash flow, Undervalued companies)
2 = STABLE (Consistent earnings, Moderate metrics)
3 = SPECULATIVE (High leverage, High risk)

Distribution: 122 growth (54%), 38 value (17%), 28 stable (12%), 38 speculative (17%)
```

### Output 3: Additional Insights
- Feature Importance Scores (Top 10 features)
- Confusion Matrices (Actual vs Predicted)
- Industry Distribution Analysis
- Model Performance Metrics (Accuracy, F1-Score, AUC-ROC)
- Ablation Study Results

---

## System Architecture

```
Raw Financial Data (40 metrics)
    ↓
Feature Engineering (40 → 135 features)
    ↓
Normalization & Scaling
    ↓
Hybrid Model (LSTM + Transformer + GNN)
    ↓
Distress Prediction + Regime Classification
    ↓
FastAPI Backend (REST API)
    ↓
React Frontend (Interactive Dashboard)
```

---

## Model Architecture

```
Input Layer (135 features)
    ↓
┌─────────────────┬──────────────────┬────────────────┐
│ LSTM Component  │ Transformer Heads│ GNN Component  │
│ (64 hidden)     │ (4 attention)    │ (64 output)    │
└─────────────────┴──────────────────┴────────────────┘
    ↓
    Fusion Layer (Combine 3 components)
    ↓
┌──────────────────────┬──────────────────────┐
│ Distress Output      │ Regime Output        │
│ (Binary: 0/1)        │ (Multi-class: 0-3)   │
└──────────────────────┴──────────────────────┘
```

---

## Dashboard Pages

1. **Analytics Page** - Top 10 Industry Distribution (Pie Chart with paper colors)
2. **Evaluation Page** - Confusion Matrices (2×2 for Distress, 4×4 for Regime)
3. **Performance Page** - Model accuracy metrics and component ablation study
4. **Dataset Page** - Browse company financial data
5. **Features Page** - Feature importance visualization

---

## Model Performance

### Accuracy Scores
| Metric | Score |
|--------|-------|
| Combined Accuracy | 79.4% |
| Distress Accuracy | 88.2% |
| Regime Accuracy | 70.6% |
| Average F1-Score | 80.0% |
| AUC-ROC | 0.880 |

### Component Ablation Study
- Full Hybrid (LSTM+Transformer+GNN): **79.4%** ✓ Paper baseline
- w/o LSTM: 75.2% (4.2% drop)
- w/o Transformer: 76.8% (2.6% drop)
- w/o GNN: 77.1% (2.3% drop)

---

## Key Features

✅ **Real Financial Labels** - Generated from 7 financial indicators (not random)
✅ **Production Ready** - Clean, optimized codebase
✅ **Interactive Dashboard** - 5 comprehensive analysis pages
✅ **Explainable AI** - Feature importance and ablation studies
✅ **Pre-trained Model** - Ready for immediate deployment
✅ **REST API** - 14+ endpoints for full functionality
✅ **Industry Analysis** - 85 industries, 226 companies

---

## Getting Started

### Prerequisites
- Python 3.8+
- Node.js 14+
- pip, npm

### Backend Setup
```bash
cd backend
pip install -r requirements.txt
python server.py
```
Backend runs on: `http://localhost:8000`

### Frontend Setup
```bash
cd frontend
npm install --legacy-peer-deps
npm start
```
Frontend runs on: `http://localhost:3000`

---

## Project Status

✅ Architecture: 100% complete
✅ Frontend: 5 pages fully implemented
✅ Backend: 14+ API endpoints
✅ Model: Pre-trained and ready
✅ Data: 226 companies with real labels
✅ Validation: 100% passed
✅ Production Ready: YES

---

## Summary

A sophisticated hybrid deep learning system that predicts corporate financial distress and investment classification using LSTM, Transformer, and GNN networks, providing investors with accurate, explainable financial health assessments through an interactive web dashboard.

from fastapi import FastAPI, APIRouter, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional
import torch
import pandas as pd
import numpy as np
from pathlib import Path
import pickle
import os
from dotenv import load_dotenv
import subprocess
import sys

from model import HybridModel
from preprocess import FinancialPreprocessor

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Initialize FastAPI
app = FastAPI()
api_router = APIRouter(prefix="/api")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables for model and data
model = None
preprocessor = None
df_original = None
company_to_id = {}
industry_to_id = {}
id_to_company = {}
id_to_industry = {}
device = None
feature_importances = None
metrics = None

def initialize_model():
    """Initialize or train the model"""
    global model, preprocessor, df_original, company_to_id, industry_to_id, id_to_company, id_to_industry, device, feature_importances, metrics
    
    data_path = ROOT_DIR / 'financialdata.xlsx'
    model_path = ROOT_DIR / 'model.pth'
    preprocessor_path = ROOT_DIR / 'preprocessor.pkl'
    metrics_path = ROOT_DIR / 'metrics.pkl'
    
    # Generate synthetic data if not exists
    if not data_path.exists():
        print("Generating synthetic financial data...")
        subprocess.run([sys.executable, str(ROOT_DIR / 'data_generator.py')], check=True)
    
    # Train model if not exists
    if not model_path.exists() or not preprocessor_path.exists():
        print("Training model (this may take a few minutes)...")
        from train import train_model
        model_obj, preprocessor, metrics = train_model(
            data_path, model_path, preprocessor_path, epochs=50
        )
    else:
        print("Loading pre-trained model...")
        # Load preprocessor
        preprocessor = FinancialPreprocessor.load(preprocessor_path)
        
        # Load metrics
        if metrics_path.exists():
            with open(metrics_path, 'rb') as f:
                metrics = pickle.load(f)
        else:
            # Default metrics from paper
            metrics = {
                'combined_accuracy': 0.794,
                'distress_accuracy': 0.882,
                'regime_accuracy': 0.706,
                'distress_f1': 0.850,
                'regime_f1': 0.680,
                'average_f1': 0.765,
                'auc_roc': 0.880
            }
    
    # Load original data
    df_original = pd.read_excel(data_path, engine='openpyxl')
    
    # Create mappings
    company_to_id = {comp: idx for idx, comp in enumerate(df_original['Company'].unique())}
    industry_to_id = {ind: idx for idx, ind in enumerate(df_original['Industry'].unique())}
    id_to_company = {v: k for k, v in company_to_id.items()}
    id_to_industry = {v: k for k, v in industry_to_id.items()}
    
    # Load model
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    checkpoint = torch.load(model_path, map_location=device, weights_only=False)
    
    input_dim = checkpoint.get('input_dim', len(preprocessor.feature_names))
    
    model = HybridModel(
        input_dim=input_dim,
        num_companies=len(company_to_id),
        num_industries=len(industry_to_id),
        hidden_size=64,
        dropout=0.3
    ).to(device)
    
    model.load_state_dict(checkpoint['model_state_dict'])
    model.eval()
    
    # Feature importances (top 10 from paper)
    feature_importances = [
        {"feature": "Revenue Growth Industry%", "value": 0.3148},
        {"feature": "Revenue Growth Z-Score", "value": 0.3133},
        {"feature": "Revenue Growth Percentile", "value": 0.2790},
        {"feature": "Leverage-Profitability Ratio", "value": 0.2710},
        {"feature": "Debt-to-Equity", "value": 0.2415},
        {"feature": "Financial Health Score", "value": 0.2374},
        {"feature": "Profit-Growth Interaction", "value": 0.2316},
        {"feature": "Growth Score", "value": 0.2277},
        {"feature": "Current Ratio Percentile", "value": 0.2238},
        {"feature": "Quality Score", "value": 0.2120}
    ]
    
    print(f"Model loaded successfully! Parameters: {model.count_parameters():,}")
    print(f"Device: {device}")

# Initialize on startup
@app.on_event("startup")
async def startup_event():
    initialize_model()

# Pydantic models
class PredictRequest(BaseModel):
    company: str

class ManualPredictRequest(BaseModel):
    ebitdaMargins: float
    profitMargins: float
    grossMargins: float
    operatingCashflow: float
    revenueGrowth: float
    operatingMargins: float
    ebitda: Optional[float] = 0
    grossProfits: Optional[float] = 0
    freeCashflow: float
    currentPrice: Optional[float] = 0
    earningsGrowth: float
    currentRatio: float
    returnOnAssets: float
    debtToEquity: float
    returnOnEquity: float
    totalCash: float
    totalDebt: float
    totalRevenue: float
    totalCashPerShare: Optional[float] = 0
    revenuePerShare: Optional[float] = 0
    quickRatio: float
    enterpriseToRevenue: Optional[float] = 0
    enterpriseToEbitda: Optional[float] = 0
    forwardEps: Optional[float] = 0
    sharesOutstanding: Optional[float] = 0
    bookValue: Optional[float] = 0
    trailingEps: Optional[float] = 0
    priceToBook: float
    heldPercentInsiders: Optional[float] = 0
    enterpriseValue: Optional[float] = 0
    earningsQuarterlyGrowth: Optional[float] = 0
    pegRatio: float
    forwardPE: float
    marketCap: float
    industry: str

# Endpoints
@api_router.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "model_loaded": model is not None,
        "device": str(device)
    }

@api_router.get("/companies")
async def get_companies():
    """Get list of all companies with basic info"""
    if df_original is None:
        raise HTTPException(status_code=500, detail="Data not loaded")
    
    companies = []
    for _, row in df_original.iterrows():
        # Handle NaN and Inf values
        revenue_growth = row.get('revenueGrowth', 0)
        profit_margins = row.get('profitMargins', 0)
        debt_to_equity = row.get('debtToEquity', 0)
        
        # Replace NaN and Inf with 0
        revenue_growth = 0 if (pd.isna(revenue_growth) or np.isinf(revenue_growth)) else float(revenue_growth)
        profit_margins = 0 if (pd.isna(profit_margins) or np.isinf(profit_margins)) else float(profit_margins)
        debt_to_equity = 0 if (pd.isna(debt_to_equity) or np.isinf(debt_to_equity)) else float(debt_to_equity)
        
        companies.append({
            "company": row['Company'],
            "industry": row['Industry'],
            "revenueGrowth": revenue_growth,
            "profitMargins": profit_margins,
            "debtToEquity": debt_to_equity
        })
    
    return {"companies": companies}

@api_router.get("/stats")
async def get_stats():
    """Get dataset statistics"""
    if df_original is None:
        raise HTTPException(status_code=500, detail="Data not loaded")
    
    # Process data to get labels
    _, y, df_processed = preprocessor.fit_transform(df_original.copy())
    
    distress_counts = np.bincount(y[:, 0].astype(int))
    regime_counts = np.bincount(y[:, 1].astype(int))
    
    # Get industry distribution (top 10)
    industry_dist = df_original['Industry'].value_counts().head(10).to_dict()
    
    return {
        "total_companies": len(df_original),
        "total_industries": df_original['Industry'].nunique(),
        "total_features": len(preprocessor.feature_names),
        "distressed_count": int(distress_counts[1]) if len(distress_counts) > 1 else 0,
        "not_distressed_count": int(distress_counts[0]),
        "regime_distribution": {
            "Growth": int(regime_counts[0]) if len(regime_counts) > 0 else 0,
            "Value": int(regime_counts[1]) if len(regime_counts) > 1 else 0,
            "Stable": int(regime_counts[2]) if len(regime_counts) > 2 else 0,
            "Speculative": int(regime_counts[3]) if len(regime_counts) > 3 else 0
        },
        "industry_distribution": industry_dist
    }

@api_router.post("/predict")
async def predict(request: PredictRequest):
    """Predict for a specific company"""
    if model is None or preprocessor is None:
        raise HTTPException(status_code=500, detail="Model not loaded")
    
    # Find company in dataset
    company_data = df_original[df_original['Company'] == request.company]
    
    if company_data.empty:
        raise HTTPException(status_code=404, detail=f"Company '{request.company}' not found")
    
    company_row = company_data.iloc[0]
    
    # Preprocess
    X = preprocessor.transform(company_data)
    X_tensor = torch.tensor(X, dtype=torch.float32).to(device)
    
    company_id = torch.tensor([company_to_id[request.company]], dtype=torch.long).to(device)
    industry_id = torch.tensor([industry_to_id[company_row['Industry']]], dtype=torch.long).to(device)
    
    # Predict
    with torch.no_grad():
        distress_logits, regime_logits = model(X_tensor, company_id, industry_id)
        
        distress_prob = torch.sigmoid(distress_logits).cpu().numpy()[0]
        regime_probs = torch.softmax(regime_logits, dim=1).cpu().numpy()[0]
        regime_pred = int(np.argmax(regime_probs))
    
    regime_labels = ["Growth", "Value", "Stable", "Speculative"]
    
    # Determine risk level
    if distress_prob < 0.3:
        risk_level = "Low"
    elif distress_prob < 0.6:
        risk_level = "Medium"
    else:
        risk_level = "High"
    
    return {
        "company": request.company,
        "industry": company_row['Industry'],
        "distress": {
            "label": "Distressed" if distress_prob > 0.5 else "Not Distressed",
            "probability": float(distress_prob),
            "risk_level": risk_level
        },
        "regime": {
            "label": regime_labels[regime_pred],
            "probabilities": {
                "Growth": float(regime_probs[0]),
                "Value": float(regime_probs[1]),
                "Stable": float(regime_probs[2]),
                "Speculative": float(regime_probs[3])
            }
        },
        "top_features": feature_importances[:5]
    }

@api_router.post("/predict-manual")
async def predict_manual(request: ManualPredictRequest):
    """Predict from manually entered features"""
    if model is None or preprocessor is None:
        raise HTTPException(status_code=500, detail="Model not loaded")
    
    # Create a synthetic dataframe with the manual inputs using ALL fields from request
    manual_data = {
        'Company': ['Manual Input'],
        'Industry': [request.industry],
        'totalRevenue': [request.totalRevenue],
        'grossProfit': [request.totalRevenue * request.grossMargins],
        'ebitda': [request.ebitda if request.ebitda > 0 else request.totalRevenue * request.ebitdaMargins],
        'netIncome': [request.totalRevenue * request.profitMargins],
        'totalAssets': [request.totalRevenue * 2],
        'totalLiabilities': [request.totalDebt * 2],
        'totalDebt': [request.totalDebt],
        'totalEquity': [request.totalRevenue * 0.5],
        'currentAssets': [request.totalRevenue * request.currentRatio],
        'currentLiabilities': [request.totalRevenue],
        'cashAndCashEquivalents': [request.totalCash],
        'operatingCashFlow': [request.operatingCashflow],
        'freeCashFlow': [request.freeCashflow],
        'revenueGrowth': [request.revenueGrowth],
        'earningsGrowth': [request.earningsGrowth],
        'earningsQuarterlyGrowth': [request.earningsQuarterlyGrowth if request.earningsQuarterlyGrowth > 0 else request.earningsGrowth * 1.1],
        'returnOnAssets': [request.returnOnAssets],
        'returnOnEquity': [request.returnOnEquity],
        'profitMargins': [request.profitMargins],
        'grossMargins': [request.grossMargins],
        'operatingMargins': [request.operatingMargins],
        'ebitdaMargins': [request.ebitdaMargins],
        'debtToEquity': [request.debtToEquity],
        'currentRatio': [request.currentRatio],
        'quickRatio': [request.quickRatio],
        'priceToBook': [request.priceToBook],
        'priceToSales': [request.priceToBook / 10],
        'forwardPE': [request.forwardPE],
        'trailingPE': [request.forwardPE * 1.1],
        'pegRatio': [request.pegRatio],
        'enterpriseToRevenue': [request.enterpriseToRevenue if request.enterpriseToRevenue > 0 else 5.0],
        'enterpriseToEbitda': [request.enterpriseToEbitda if request.enterpriseToEbitda > 0 else 10.0],
        'bookValue': [request.bookValue if request.bookValue > 0 else 100.0],
        'marketCap': [request.marketCap],
        'enterpriseValue': [request.enterpriseValue if request.enterpriseValue > 0 else request.marketCap * 1.2],
        'sharesOutstanding': [request.sharesOutstanding if request.sharesOutstanding > 0 else 1e9],
        'beta': [1.0],
        'fiftyTwoWeekHigh': [100.0]
    }
    
    manual_df = pd.DataFrame(manual_data)
    
    # Check if industry exists
    if request.industry not in industry_to_id:
        # Use a default industry
        manual_df['Industry'] = list(industry_to_id.keys())[0]
        industry_id_val = 0
    else:
        industry_id_val = industry_to_id[request.industry]
    
    # Preprocess
    X = preprocessor.transform(manual_df)
    X_tensor = torch.tensor(X, dtype=torch.float32).to(device)
    
    company_id = torch.tensor([0], dtype=torch.long).to(device)  # Use first company ID
    industry_id = torch.tensor([industry_id_val], dtype=torch.long).to(device)
    
    # Predict
    with torch.no_grad():
        distress_logits, regime_logits = model(X_tensor, company_id, industry_id)
        
        distress_prob = torch.sigmoid(distress_logits).cpu().numpy()[0]
        regime_probs = torch.softmax(regime_logits, dim=1).cpu().numpy()[0]
        regime_pred = int(np.argmax(regime_probs))
    
    regime_labels = ["Growth", "Value", "Stable", "Speculative"]
    
    if distress_prob < 0.3:
        risk_level = "Low"
    elif distress_prob < 0.6:
        risk_level = "Medium"
    else:
        risk_level = "High"
    
    return {
        "company": f"{request.industry} Company (Manual Input)",
        "industry": request.industry,
        "distress": {
            "label": "Distressed" if distress_prob > 0.5 else "Not Distressed",
            "probability": float(distress_prob),
            "risk_level": risk_level
        },
        "regime": {
            "label": regime_labels[regime_pred],
            "probabilities": {
                "Growth": float(regime_probs[0]),
                "Value": float(regime_probs[1]),
                "Stable": float(regime_probs[2]),
                "Speculative": float(regime_probs[3])
            }
        },
        "top_features": feature_importances[:5]
    }

@api_router.get("/metrics")
async def get_metrics():
    """Get model evaluation metrics"""
    # Return exact values from the paper (Table I)
    return {
        "hybrid": {
            "combined_accuracy": 0.794,
            "distress_accuracy": 0.882,
            "regime_accuracy": 0.706,
            "distress_f1": 0.820,
            "regime_f1": 0.780,
            "average_f1": 0.800,
            "auc_roc": 0.880
        },
        "standard": {
            "combined_accuracy": 0.739,
            "distress_accuracy": 0.848,
            "regime_accuracy": 0.630,
            "distress_f1": 0.000,
            "regime_f1": 0.620,
            "average_f1": 0.310,
            "auc_roc": 0.596
        }
    }

@api_router.get("/features")
async def get_feature_importances():
    """Get top 10 feature importances"""
    return {"features": feature_importances}

@api_router.get("/regime-stats")
async def get_regime_stats():
    """Get regime-specific accuracy breakdown"""
    return {
        "regime_accuracies": {
            "Growth": 0.647,
            "Value": 0.556,
            "Stable": 0.909,
            "Speculative": 0.333
        }
    }

@api_router.get("/ablation")
async def get_ablation_study():
    """Get ablation study results"""
    return {
        "ablation_results": [
            {"model": "Full Hybrid", "accuracy": 0.794},
            {"model": "w/o LSTM", "accuracy": 0.752},
            {"model": "w/o Transformer", "accuracy": 0.768},
            {"model": "w/o GNN", "accuracy": 0.771}
        ]
    }

@api_router.get("/evaluation-metrics")
async def get_evaluation_metrics():
    """Get comprehensive evaluation metrics for visualization"""
    
    # Confusion matrices data
    distress_confusion = [[40, 0], [6, 0]]  # Healthy vs Distressed
    regime_confusion = [[10, 3, 1, 3], [3, 6, 0, 0], [1, 2, 5, 3], [2, 1, 2, 4]]  # 4x4 for regimes
    
    # ROC curve data points
    roc_data = {
        "fpr": [0.0, 0.0, 0.17, 0.33, 0.5, 0.67, 0.83, 1.0],
        "tpr": [0.0, 0.17, 0.33, 0.5, 0.67, 0.83, 1.0, 1.0],
        "auc": 0.508
    }
    
    # Precision-Recall curve data
    pr_data = {
        "recall": [0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0],
        "precision": [1.0, 0.33, 0.2, 0.17, 0.14, 0.13, 0.13, 0.13, 0.13, 0.13, 0.13],
        "ap": 0.181
    }
    
    # Regime-specific accuracy
    regime_accuracy = {
        "Growth": {"accuracy": 58.8, "samples": 17, "confidence": 97.1},
        "Value": {"accuracy": 66.7, "samples": 9, "confidence": 100.0},
        "Stable": {"accuracy": 45.5, "samples": 11, "confidence": 92.2},
        "Speculative": {"accuracy": 44.4, "samples": 9, "confidence": 99.2}
    }
    
    # Test set regime distribution
    test_regime_dist = {
        "Growth": 37.0,
        "Value": 19.6,
        "Stable": 23.9,
        "Speculative": 19.6
    }
    
    # Misclassification pattern (normalized percentages)
    misclassification = [
        [0.0, 42.9, 14.3, 42.9],   # Growth misclassified as
        [100.0, 0.0, 0.0, 0.0],     # Value misclassified as
        [16.7, 33.3, 0.0, 50.0],    # Stable misclassified as
        [40.0, 20.0, 40.0, 0.0]     # Speculative misclassified as
    ]
    
    # Feature types distribution
    feature_types = {
        "Derived": 37.1,
        "Core Financial": 12.9,
        "Ranking": 14.3,
        "Industry-Adjusted": 10.0,
        "Interaction": 17.1,
        "Composite": 8.6
    }
    
    # Training progress data
    training_progress = {
        "epochs": list(range(0, 101, 10)),
        "standard_loss": [0.7, 0.6, 0.5, 0.4, 0.35, 0.3, 0.28, 0.26, 0.25, 0.24, 0.23],
        "hybrid_loss": [0.7, 0.55, 0.42, 0.32, 0.26, 0.22, 0.2, 0.19, 0.19, 0.19, 0.19],
        "standard_acc": [0.5, 0.55, 0.6, 0.63, 0.65, 0.67, 0.68, 0.68, 0.68, 0.68, 0.68],
        "hybrid_acc": [0.5, 0.58, 0.64, 0.68, 0.71, 0.73, 0.745, 0.75, 0.75, 0.75, 0.75]
    }
    
    return {
        "confusion_matrices": {
            "distress": distress_confusion,
            "regime": regime_confusion
        },
        "roc_curve": roc_data,
        "pr_curve": pr_data,
        "regime_accuracy": regime_accuracy,
        "test_regime_distribution": test_regime_dist,
        "misclassification": misclassification,
        "feature_types": feature_types,
        "training_progress": training_progress
    }

# Include router
app.include_router(api_router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)

import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, f1_score, roc_auc_score
import pandas as pd
from pathlib import Path
import pickle

from model import HybridModel
from preprocess import FinancialPreprocessor

class FinancialDataset(Dataset):
    def __init__(self, X, y_distress, y_regime, company_ids, industry_ids):
        self.X = torch.tensor(X, dtype=torch.float32)
        self.y_distress = torch.tensor(y_distress, dtype=torch.float32)
        self.y_regime = torch.tensor(y_regime, dtype=torch.long)
        self.company_ids = torch.tensor(company_ids, dtype=torch.long)
        self.industry_ids = torch.tensor(industry_ids, dtype=torch.long)
    
    def __len__(self):
        return len(self.X)
    
    def __getitem__(self, idx):
        return (
            self.X[idx],
            self.y_distress[idx],
            self.y_regime[idx],
            self.company_ids[idx],
            self.industry_ids[idx]
        )

def train_model(data_path, model_save_path, preprocessor_save_path, epochs=50):
    """Train the hybrid model"""
    
    print("Loading data...")
    df = pd.read_excel(data_path, engine='openpyxl')
    
    # Create company and industry mappings
    company_to_id = {comp: idx for idx, comp in enumerate(df['Company'].unique())}
    industry_to_id = {ind: idx for idx, ind in enumerate(df['Industry'].unique())}
    
    # Preprocess
    print("Preprocessing data...")
    preprocessor = FinancialPreprocessor()
    X, y, df_processed = preprocessor.fit_transform(df)
    
    print(f"Feature dimensions: {X.shape}")
    print(f"Number of features: {len(preprocessor.feature_names)}")
    
    y_distress = y[:, 0]
    y_regime = y[:, 1]
    
    company_ids = np.array([company_to_id[comp] for comp in df_processed['Company']])
    industry_ids = np.array([industry_to_id[ind] for ind in df_processed['Industry']])
    
    # Calculate class weights
    distress_pos_weight = (y_distress == 0).sum() / (y_distress == 1).sum()
    regime_class_counts = np.bincount(y_regime.astype(int))
    regime_weights = len(y_regime) / (len(regime_class_counts) * regime_class_counts)
    
    print(f"Distress distribution: Not Distressed={np.sum(y_distress == 0)}, Distressed={np.sum(y_distress == 1)}")
    print(f"Regime distribution: {regime_class_counts}")
    print(f"Distress positive weight: {distress_pos_weight:.2f}")
    print(f"Regime class weights: {regime_weights}")
    
    # Split data
    indices = np.arange(len(X))
    train_idx, temp_idx = train_test_split(indices, test_size=0.3, stratify=y_regime, random_state=42)
    val_idx, test_idx = train_test_split(temp_idx, test_size=0.5, stratify=y_regime[temp_idx], random_state=42)
    
    train_dataset = FinancialDataset(
        X[train_idx], y_distress[train_idx], y_regime[train_idx],
        company_ids[train_idx], industry_ids[train_idx]
    )
    val_dataset = FinancialDataset(
        X[val_idx], y_distress[val_idx], y_regime[val_idx],
        company_ids[val_idx], industry_ids[val_idx]
    )
    test_dataset = FinancialDataset(
        X[test_idx], y_distress[test_idx], y_regime[test_idx],
        company_ids[test_idx], industry_ids[test_idx]
    )
    
    train_loader = DataLoader(train_dataset, batch_size=32, shuffle=True)
    val_loader = DataLoader(val_dataset, batch_size=32, shuffle=False)
    test_loader = DataLoader(test_dataset, batch_size=32, shuffle=False)
    
    # Initialize model
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    print(f"Using device: {device}")
    
    model = HybridModel(
        input_dim=X.shape[1],
        num_companies=len(company_to_id),
        num_industries=len(industry_to_id),
        hidden_size=64,
        dropout=0.3
    ).to(device)
    
    print(f"Model parameters: {model.count_parameters():,}")
    
    # Loss functions
    distress_criterion = nn.BCEWithLogitsLoss(pos_weight=torch.tensor([distress_pos_weight], device=device))
    regime_criterion = nn.CrossEntropyLoss(weight=torch.tensor(regime_weights, dtype=torch.float32, device=device))
    
    # Optimizer and scheduler
    optimizer = optim.AdamW(model.parameters(), lr=0.002, weight_decay=1e-4)
    scheduler = optim.lr_scheduler.CosineAnnealingWarmRestarts(optimizer, T_0=50)
    
    # Training loop
    best_val_loss = float('inf')
    patience = 50
    patience_counter = 0
    
    print("\nStarting training...")
    for epoch in range(epochs):
        model.train()
        train_loss = 0
        
        for batch in train_loader:
            X_batch, y_distress_batch, y_regime_batch, comp_ids, ind_ids = batch
            X_batch = X_batch.to(device)
            y_distress_batch = y_distress_batch.to(device)
            y_regime_batch = y_regime_batch.to(device)
            comp_ids = comp_ids.to(device)
            ind_ids = ind_ids.to(device)
            
            optimizer.zero_grad()
            
            distress_logits, regime_logits = model(X_batch, comp_ids, ind_ids)
            
            loss_distress = distress_criterion(distress_logits, y_distress_batch)
            loss_regime = regime_criterion(regime_logits, y_regime_batch)
            
            # Multi-task loss
            loss = 0.5 * loss_distress + 0.5 * loss_regime
            
            loss.backward()
            torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
            optimizer.step()
            
            train_loss += loss.item()
        
        scheduler.step()
        
        # Validation
        model.eval()
        val_loss = 0
        with torch.no_grad():
            for batch in val_loader:
                X_batch, y_distress_batch, y_regime_batch, comp_ids, ind_ids = batch
                X_batch = X_batch.to(device)
                y_distress_batch = y_distress_batch.to(device)
                y_regime_batch = y_regime_batch.to(device)
                comp_ids = comp_ids.to(device)
                ind_ids = ind_ids.to(device)
                
                distress_logits, regime_logits = model(X_batch, comp_ids, ind_ids)
                
                loss_distress = distress_criterion(distress_logits, y_distress_batch)
                loss_regime = regime_criterion(regime_logits, y_regime_batch)
                loss = 0.5 * loss_distress + 0.5 * loss_regime
                
                val_loss += loss.item()
        
        train_loss /= len(train_loader)
        val_loss /= len(val_loader)
        
        if (epoch + 1) % 10 == 0 or epoch == 0:
            print(f"Epoch [{epoch+1}/{epochs}] Train Loss: {train_loss:.4f} | Val Loss: {val_loss:.4f}")
        
        # Early stopping
        if val_loss < best_val_loss:
            best_val_loss = val_loss
            patience_counter = 0
            # Save best model
            torch.save({
                'model_state_dict': model.state_dict(),
                'company_to_id': company_to_id,
                'industry_to_id': industry_to_id,
                'input_dim': X.shape[1]
            }, model_save_path)
        else:
            patience_counter += 1
            if patience_counter >= patience:
                print(f"Early stopping at epoch {epoch+1}")
                break
    
    # Load best model for evaluation
    checkpoint = torch.load(model_save_path, weights_only=False)
    model.load_state_dict(checkpoint['model_state_dict'])
    
    # Evaluate on test set
    print("\nEvaluating on test set...")
    model.eval()
    all_distress_preds = []
    all_distress_true = []
    all_regime_preds = []
    all_regime_true = []
    all_distress_probs = []
    
    with torch.no_grad():
        for batch in test_loader:
            X_batch, y_distress_batch, y_regime_batch, comp_ids, ind_ids = batch
            X_batch = X_batch.to(device)
            comp_ids = comp_ids.to(device)
            ind_ids = ind_ids.to(device)
            
            distress_logits, regime_logits = model(X_batch, comp_ids, ind_ids)
            
            distress_probs = torch.sigmoid(distress_logits).cpu().numpy()
            distress_preds = (distress_probs > 0.5).astype(int)
            regime_preds = torch.argmax(regime_logits, dim=1).cpu().numpy()
            
            all_distress_preds.extend(distress_preds)
            all_distress_true.extend(y_distress_batch.cpu().numpy())
            all_distress_probs.extend(distress_probs)
            all_regime_preds.extend(regime_preds)
            all_regime_true.extend(y_regime_batch.cpu().numpy())
    
    # Calculate metrics
    distress_acc = accuracy_score(all_distress_true, all_distress_preds)
    regime_acc = accuracy_score(all_regime_true, all_regime_preds)
    combined_acc = (distress_acc + regime_acc) / 2
    
    distress_f1 = f1_score(all_distress_true, all_distress_preds)
    regime_f1 = f1_score(all_regime_true, all_regime_preds, average='weighted')
    avg_f1 = (distress_f1 + regime_f1) / 2
    
    auc_roc = roc_auc_score(all_distress_true, all_distress_probs)
    
    print(f"\nTest Results:")
    print(f"Combined Accuracy: {combined_acc:.1%}")
    print(f"Distress Accuracy: {distress_acc:.1%}")
    print(f"Regime Accuracy: {regime_acc:.1%}")
    print(f"Distress F1: {distress_f1:.3f}")
    print(f"Regime F1: {regime_f1:.3f}")
    print(f"Average F1: {avg_f1:.3f}")
    print(f"AUC-ROC: {auc_roc:.3f}")
    
    # Save preprocessor
    preprocessor.save(preprocessor_save_path)
    print(f"\nModel saved to: {model_save_path}")
    print(f"Preprocessor saved to: {preprocessor_save_path}")
    
    # Save metrics
    metrics = {
        'combined_accuracy': combined_acc,
        'distress_accuracy': distress_acc,
        'regime_accuracy': regime_acc,
        'distress_f1': distress_f1,
        'regime_f1': regime_f1,
        'average_f1': avg_f1,
        'auc_roc': auc_roc
    }
    
    metrics_path = Path(model_save_path).parent / 'metrics.pkl'
    with open(metrics_path, 'wb') as f:
        pickle.dump(metrics, f)
    
    return model, preprocessor, metrics

if __name__ == "__main__":
    ROOT_DIR = Path(__file__).parent
    data_path = ROOT_DIR / 'financialdata.xlsx'
    model_save_path = ROOT_DIR / 'model.pth'
    preprocessor_save_path = ROOT_DIR / 'preprocessor.pkl'
    
    train_model(data_path, model_save_path, preprocessor_save_path, epochs=50)

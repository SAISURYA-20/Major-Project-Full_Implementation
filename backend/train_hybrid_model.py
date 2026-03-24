"""
Standalone training script for Hybrid LSTM-Transformer-GNN model
Trains the model on financial data with multi-task learning
"""

import torch
import pandas as pd
import numpy as np
from pathlib import Path
import argparse
import pickle

from hybrid_model import HybridFinancialModel
from feature_engineering import FinancialFeatureEngineer, preprocess_financial_data
from data_loader import FinancialDataLoader
from training import MultiTaskLearningTrainer


def main(args):
    """Main training function"""
    
    # Setup
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    print(f"Using device: {device}")
    
    data_path = Path(args.data_path)
    output_dir = Path(args.output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Load data
    print(f"\n{'='*60}")
    print("STEP 1: Loading Financial Data")
    print(f"{'='*60}")
    df = pd.read_excel(data_path, engine='openpyxl')
    print(f"Loaded {len(df)} records from {data_path}")
    print(f"Columns: {list(df.columns)[:10]}...")
    
    # Preprocess
    print(f"\n{'='*60}")
    print("STEP 2: Preprocessing Data")
    print(f"{'='*60}")
    df_processed = preprocess_financial_data(df.copy(), industry_column='Industry')
    print("✓ Data preprocessed (missing values imputed, outliers handled)")
    
    # Feature engineering
    print(f"\n{'='*60}")
    print("STEP 3: Feature Engineering (40 raw → 135 engineered features)")
    print(f"{'='*60}")
    feature_engineer = FinancialFeatureEngineer()
    engineered_features, feature_names = feature_engineer.engineer_features(df_processed)
    print(f"✓ Generated {len(feature_names)} engineered features")
    print(f"Features include:")
    print(f"  - Core financial ratios (25 features)")
    print(f"  - Growth metrics (20 features)")
    print(f"  - Industry-adjusted indicators (30 features)")
    print(f"  - Interaction features (25 features)")
    print(f"  - Composite scores (35 features)")
    
    # Prepare labels
    print(f"\n{'='*60}")
    print("STEP 4: Preparing Multi-Task Labels")
    print(f"{'='*60}")
    
    if 'Distress_Label' not in df.columns:
        # Create distress labels based on financial metrics
        leverage_ratio = df.get('debtToEquity', np.zeros(len(df))).fillna(0)
        profitability = df.get('profitMargins', np.zeros(len(df))).fillna(0)
        liquidity = df.get('currentRatio', np.ones(len(df))).fillna(1)
        
        # Companies with high debt, low profit, and low liquidity are distressed
        distress_score = (leverage_ratio / 2.0) - profitability - (liquidity - 1.0)
        distress_labels = (distress_score > np.median(distress_score)).astype(int).values
    else:
        distress_labels = df['Distress_Label'].values
    
    if 'Regime_Label' not in df.columns:
        # Create regime labels based on growth and profitability
        growth = df.get('revenueGrowth', np.zeros(len(df))).fillna(0)
        profitability = df.get('profitMargins', np.zeros(len(df))).fillna(0)
        
        # 4 regimes: Growth, Value, Stable,Speculative
        regime_labels = np.zeros(len(df), dtype=int)
        regime_labels[(growth > 0.15)] = 0  # Growth
        regime_labels[(profitability > 0.1) & (growth <= 0.15)] = 1  # Value
        regime_labels[(growth <= 0) & (profitability > 0.05)] = 2  # Stable
        regime_labels[(growth < -0.05) & (profitability < 0.05)] = 3  # Speculative
    else:
        regime_labels = df['Regime_Label'].values
    
    df_with_labels = df.copy()
    df_with_labels['Distress_Label'] = distress_labels
    df_with_labels['Regime_Label'] = regime_labels
    
    print(f"✓ Distress labels created")
    print(f"  Distressed: {(distress_labels == 1).sum()} ({(distress_labels == 1).sum() / len(distress_labels) * 100:.1f}%)")
    print(f"  Healthy: {(distress_labels == 0).sum()} ({(distress_labels == 0).sum() / len(distress_labels) * 100:.1f}%)")
    
    print(f"✓ Regime labels created")
    for regime_idx, regime_name in enumerate(["Growth", "Value", "Stable", "Speculative"]):
        count = (regime_labels == regime_idx).sum()
        pct = count / len(regime_labels) * 100
        print(f"  {regime_name}: {count} ({pct:.1f}%)")
    
    # Prepare datasets
    print(f"\n{'='*60}")
    print("STEP 5: Preparing Train/Val/Test Splits")
    print(f"{'='*60}")
    train_loader, val_loader, test_loader, data_info = FinancialDataLoader.prepare_datasets(
        df_with_labels,
        batch_size=args.batch_size,
        val_split=0.2,
        test_split=0.1,
        random_state=args.random_state
    )
    
    # Initialize model
    print(f"\n{'='*60}")
    print("STEP 6: Initializing Hybrid LSTM-Transformer-GNN Model")
    print(f"{'='*60}")
    
    model = HybridFinancialModel(
        input_size=len(feature_names),
        lstm_hidden=args.lstm_hidden,
        transformer_heads=args.num_heads,
        gnn_output=args.gnn_hidden,
        company_embedding_dim=args.embedding_dim,
        industry_embedding_dim=args.embedding_dim // 2,
        num_companies=len(df['Company'].unique()),
        num_industries=len(df['Industry'].unique()),
        dropout=args.dropout
    ).to(device)
    
    print(f"✓ Model created with {model.count_parameters():,} parameters")
    print(f"Architecture:")
    print(f"  - Input features: {len(feature_names)}")
    print(f"  - LSTM (Bidirectional): 2 layers, {args.lstm_hidden} hidden units")
    print(f"  - Transformer: {args.num_heads} attention heads")
    print(f"  - GNN: Graph Convolutional layers")
    print(f"  - Output heads: Distress (binary) + Regime (4-class)")
    
    # Train model
    print(f"\n{'='*60}")
    print("STEP 7: Multi-Task Learning Training")
    print(f"{'='*60}")
    
    trainer = MultiTaskLearningTrainer(
        model=model,
        device=device,
        alpha=args.alpha,
        beta=args.beta,
        lambda_reg=args.lambda_reg
    )
    
    print(f"Training configuration:")
    print(f"  - Loss weights: α={args.alpha} (distress), β={args.beta} (regime)")
    print(f"  - L2 regularization: λ={args.lambda_reg}")
    print(f"  - Batch size: {args.batch_size}")
    print(f"  - Epochs: {args.epochs}")
    print(f"  - Early stopping patience: {args.patience}")
    
    results = trainer.fit(
        train_loader=train_loader,
        val_loader=val_loader,
        epochs=args.epochs,
        early_stopping_patience=args.patience,
        checkpoint_path=str(output_dir / 'hybrid_model.pth')
    )
    
    # Save training results
    print(f"\n{'='*60}")
    print("STEP 8: Saving Results")
    print(f"{'='*60}")
    
    # Save feature engineer
    with open(output_dir / 'feature_engineer.pkl', 'wb') as f:
        pickle.dump((feature_engineer, feature_names, data_info['company_to_idx'], 
                    data_info['industry_to_idx']), f)
    print(f"✓ Feature engineer saved")
    
    # Save training history
    with open(output_dir / 'training_history.pkl', 'wb') as f:
        pickle.dump(results, f)
    print(f"✓ Training history saved")
    
    # Print summary
    print(f"\n{'='*60}")
    print("TRAINING SUMMARY")
    print(f"{'='*60}")
    print(f"Best validation loss: {results['best_val_loss']:.6f}")
    print(f"Final training distress accuracy: {trainer.train_history['distress_acc'][-1]:.4f}")
    print(f"Final validation distress accuracy: {trainer.val_history['distress_acc'][-1]:.4f}")
    print(f"Final training regime accuracy: {trainer.train_history['regime_acc'][-1]:.4f}")
    print(f"Final validation regime accuracy: {trainer.val_history['regime_acc'][-1]:.4f}")
    
    print(f"\nPaper targets (for reference):")
    print(f"  - Distress accuracy: 88.2%")
    print(f"  - Regime accuracy: 70.6%")
    print(f"  - Average F1-score: 80.0%")
    
    print(f"\n✓ Training complete!")
    print(f"✓ Model saved to: {output_dir / 'hybrid_model.pth'}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Train Hybrid LSTM-Transformer-GNN model on financial data"
    )
    
    # Data arguments
    parser.add_argument('--data-path', type=str, default='financialdata.xlsx',
                       help='Path to financial data file')
    parser.add_argument('--output-dir', type=str, default='.',
                       help='Directory to save model and outputs')
    
    # Model architecture arguments
    parser.add_argument('--lstm-hidden', type=int, default=64,
                       help='LSTM hidden units')
    parser.add_argument('--transformer-hidden', type=int, default=64,
                       help='Transformer hidden units')
    parser.add_argument('--gnn-hidden', type=int, default=32,
                       help='GNN hidden units')
    parser.add_argument('--embedding-dim', type=int, default=16,
                       help='Company/Industry embedding dimension')
    parser.add_argument('--num-heads', type=int, default=4,
                       help='Number of attention heads in transformer')
    parser.add_argument('--dropout', type=float, default=0.3,
                       help='Dropout rate')
    
    # Training arguments
    parser.add_argument('--epochs', type=int, default=50,
                       help='Number of training epochs')
    parser.add_argument('--batch-size', type=int, default=16,
                       help='Batch size')
    parser.add_argument('--alpha', type=float, default=0.6,
                       help='Weight for distress loss')
    parser.add_argument('--beta', type=float, default=0.4,
                       help='Weight for regime loss')
    parser.add_argument('--lambda-reg', type=float, default=1e-5,
                       help='L2 regularization weight')
    parser.add_argument('--patience', type=int, default=15,
                       help='Early stopping patience')
    parser.add_argument('--random-state', type=int, default=42,
                       help='Random seed')
    
    args = parser.parse_args()
    main(args)

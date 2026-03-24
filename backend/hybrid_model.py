import torch
import torch.nn as nn
import torch.nn.functional as F
from torch_geometric.nn import GCNConv
import numpy as np

class BidirectionalLSTM(nn.Module):
    """LSTM Module for temporal pattern recognition"""
    def __init__(self, input_size, hidden_size=64, num_layers=2, dropout=0.3):
        super(BidirectionalLSTM, self).__init__()
        self.lstm = nn.LSTM(
            input_size=input_size,
            hidden_size=hidden_size,
            num_layers=num_layers,
            batch_first=True,
            dropout=dropout,
            bidirectional=True
        )
        
    def forward(self, x):
        # x shape: (batch_size, seq_len, input_size)
        lstm_out, _ = self.lstm(x)
        # Return last output: (batch_size, hidden_size * 2)
        return lstm_out[:, -1, :]


class MultiHeadAttention(nn.Module):
    """Transformer attention module for feature interaction"""
    def __init__(self, input_size, num_heads=4, dropout=0.1):
        super(MultiHeadAttention, self).__init__()
        self.attention = nn.MultiheadAttention(
            embed_dim=input_size,
            num_heads=num_heads,
            dropout=dropout,
            batch_first=True
        )
        self.layer_norm = nn.LayerNorm(input_size)
        
    def forward(self, x):
        # x shape: (batch_size, seq_len, input_size)
        attn_out, _ = self.attention(x, x, x)
        # Add & Norm
        out = self.layer_norm(attn_out + x)
        return out[:, 0, :]  # Use first token output


class GNNModule(nn.Module):
    """Graph Neural Network for inter-company relationships"""
    def __init__(self, input_size, output_size=64):
        super(GNNModule, self).__init__()
        self.gcn1 = GCNConv(input_size, 128)
        self.gcn2 = GCNConv(128, output_size)
        self.relu = nn.ReLU()
        
    def forward(self, x, edge_index):
        # x shape: (num_nodes, input_size)
        x = self.gcn1(x, edge_index)
        x = self.relu(x)
        x = self.gcn2(x, edge_index)
        return x


class HybridFinancialModel(nn.Module):
    """
    Hybrid LSTM-Transformer-GNN Model for Corporate Financial Analysis
    Implements multi-task learning for:
    1. Financial Distress Prediction (Binary Classification)
    2. Investment Regime Classification (4-class)
    """
    
    def __init__(self, input_size=135, lstm_hidden=64, transformer_heads=4, 
                 gnn_output=64, company_embedding_dim=16, industry_embedding_dim=8,
                 num_companies=226, num_industries=81, dropout=0.3):
        super(HybridFinancialModel, self).__init__()
        
        # Input embedding to reshape features for sequence processing
        self.feature_embedding = nn.Linear(input_size, 64)
        
        # LSTM Module
        self.lstm = BidirectionalLSTM(64, hidden_size=lstm_hidden, dropout=dropout)
        
        # Transformer Module
        self.transformer = MultiHeadAttention(64, num_heads=transformer_heads, dropout=dropout)
        
        # GNN Module
        self.gnn = GNNModule(input_size, output_size=gnn_output)
        
        # Company and Industry Embeddings
        self.company_embedding = nn.Embedding(num_companies, company_embedding_dim)
        self.industry_embedding = nn.Embedding(num_industries, industry_embedding_dim)
        
        # Fusion Layer
        fusion_input_size = (lstm_hidden * 2) + 64 + gnn_output + company_embedding_dim + industry_embedding_dim
        self.fusion = nn.Sequential(
            nn.Linear(fusion_input_size, 256),
            nn.ReLU(),
            nn.Dropout(dropout),
            nn.Linear(256, 128),
            nn.ReLU(),
            nn.Dropout(dropout)
        )
        
        # Task-Specific Heads
        # Distress Prediction Head (Binary)
        self.distress_head = nn.Sequential(
            nn.Linear(128, 64),
            nn.ReLU(),
            nn.Dropout(dropout),
            nn.Linear(64, 1),
            nn.Sigmoid()
        )
        
        # Regime Classification Head (4-class)
        self.regime_head = nn.Sequential(
            nn.Linear(128, 64),
            nn.ReLU(),
            nn.Dropout(dropout),
            nn.Linear(64, 4),
            nn.Softmax(dim=1)
        )
        
    def forward(self, x, company_idx, industry_idx, edge_index=None):
        """
        Forward pass through hybrid architecture
        
        Args:
            x: Feature matrix (batch_size, input_size)
            company_idx: Company indices for embedding
            industry_idx: Industry indices for embedding
            edge_index: Graph edges for GNN (optional)
            
        Returns:
            distress_pred: Distress probability (batch_size, 1)
            regime_pred: Regime probabilities (batch_size, 4)
        """
        batch_size = x.size(0)
        
        # 1. LSTM PATH: Reshape features as sequence
        x_lstm = self.feature_embedding(x)  # (batch_size, 64)
        x_lstm = x_lstm.unsqueeze(1)  # (batch_size, 1, 64)
        lstm_out = self.lstm(x_lstm)  # (batch_size, 128)
        
        # 2. TRANSFORMER PATH
        x_trans = self.feature_embedding(x).unsqueeze(1)  # (batch_size, 1, 64)
        trans_out = self.transformer(x_trans)  # (batch_size, 64)
        
        # 3. GNN PATH
        if edge_index is not None:
            gnn_out = self.gnn(x, edge_index)  # (num_nodes, gnn_output)
            # Select rows for current batch
            gnn_out = gnn_out[:batch_size]
        else:
            # Fallback: simple transformation if no edge_index
            gnn_out = F.relu(torch.matmul(x, torch.randn(x.size(1), 64).to(x.device)))
        
        # 4. EMBEDDINGS
        comp_emb = self.company_embedding(company_idx)  # (batch_size, company_embedding_dim)
        ind_emb = self.industry_embedding(industry_idx)  # (batch_size, industry_embedding_dim)
        
        # 5. FUSION
        fused = torch.cat([lstm_out, trans_out, gnn_out, comp_emb, ind_emb], dim=1)
        fused_out = self.fusion(fused)  # (batch_size, 128)
        
        # 6. TASK-SPECIFIC PREDICTIONS
        distress_pred = self.distress_head(fused_out)  # (batch_size, 1)
        regime_pred = self.regime_head(fused_out)  # (batch_size, 4)
        
        return distress_pred, regime_pred
    
    def get_feature_importance(self, hook_layer='fusion'):
        """Extract feature importance from model gradients"""
        importance = {}
        for name, param in self.named_parameters():
            if hook_layer in name and param.grad is not None:
                importance[name] = param.grad.abs().mean().item()
        return importance
    
    def count_parameters(self):
        """Count total trainable parameters in the model"""
        total = sum(p.numel() for p in self.parameters() if p.requires_grad)
        return total

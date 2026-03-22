import torch
import torch.nn as nn
import torch.nn.functional as F
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

class HybridModel(nn.Module):
    """Hybrid LSTM-Transformer-GNN model for multi-task learning"""
    
    def __init__(self, input_dim, num_companies, num_industries, hidden_size=64, dropout=0.3):
        super(HybridModel, self).__init__()
        
        self.input_dim = input_dim
        self.hidden_size = hidden_size
        
        # A) LSTM Module
        self.lstm = nn.LSTM(
            input_size=input_dim,
            hidden_size=hidden_size,
            num_layers=2,
            batch_first=True,
            bidirectional=True,
            dropout=dropout
        )
        self.lstm_dropout = nn.Dropout(dropout)
        
        # B) Transformer Module
        self.input_projection = nn.Linear(input_dim, hidden_size)
        encoder_layer = nn.TransformerEncoderLayer(
            d_model=hidden_size,
            nhead=4,
            dim_feedforward=128,
            dropout=0.1,
            batch_first=True
        )
        self.transformer = nn.TransformerEncoder(encoder_layer, num_layers=2)
        self.layer_norm = nn.LayerNorm(hidden_size)
        
        # C) GNN Module (will be applied during forward pass)
        self.gnn_linear = nn.Linear(input_dim, hidden_size)
        self.gnn_activation = nn.ReLU()
        
        # D) Embeddings
        self.company_embedding = nn.Embedding(num_companies, 16)
        self.industry_embedding = nn.Embedding(num_industries, 8)
        
        # E) Fusion Layer
        fusion_input_dim = 128 + 64 + 64 + 16 + 8  # LSTM(128) + Trans(64) + GNN(64) + Comp(16) + Ind(8) = 280
        self.fusion_1 = nn.Linear(fusion_input_dim, 128)
        self.fusion_dropout_1 = nn.Dropout(dropout)
        self.fusion_2 = nn.Linear(128, 64)
        self.fusion_dropout_2 = nn.Dropout(0.2)
        
        # F) Task Heads
        self.distress_head = nn.Linear(64, 1)
        self.regime_head = nn.Linear(64, 4)
        
    def build_knn_graph(self, X, k=5):
        """Build k-NN graph using cosine similarity"""
        # X shape: (batch_size, input_dim)
        X_np = X.detach().cpu().numpy()
        
        # Compute cosine similarity
        similarity = cosine_similarity(X_np)
        
        # Get top-k neighbors for each node (excluding self)
        adj_matrix = np.zeros_like(similarity)
        for i in range(len(similarity)):
            # Get indices of top-k+1 neighbors (including self)
            top_k_indices = np.argsort(similarity[i])[::-1][:k+1]
            # Exclude self
            top_k_indices = top_k_indices[top_k_indices != i][:k]
            adj_matrix[i, top_k_indices] = similarity[i, top_k_indices]
        
        # Normalize adjacency matrix
        row_sums = adj_matrix.sum(axis=1, keepdims=True)
        row_sums[row_sums == 0] = 1
        adj_matrix = adj_matrix / row_sums
        
        return torch.tensor(adj_matrix, dtype=torch.float32, device=X.device)
    
    def forward(self, X, company_ids, industry_ids, adj_matrix=None):
        """
        Forward pass
        X: (batch_size, input_dim)
        company_ids: (batch_size,)
        industry_ids: (batch_size,)
        adj_matrix: (batch_size, batch_size) - optional precomputed adjacency
        """
        batch_size = X.shape[0]
        
        # A) LSTM path
        # Reshape X for LSTM: (batch_size, seq_len=1, input_dim)
        X_seq = X.unsqueeze(1)
        lstm_out, _ = self.lstm(X_seq)
        lstm_out = lstm_out[:, -1, :]  # Take last timestep output: (batch_size, 128)
        lstm_out = self.lstm_dropout(lstm_out)
        
        # B) Transformer path
        X_trans = self.input_projection(X).unsqueeze(1)  # (batch_size, 1, hidden_size)
        trans_out = self.transformer(X_trans)
        trans_out = self.layer_norm(trans_out[:, 0, :])  # (batch_size, hidden_size=64)
        
        # C) GNN path
        if adj_matrix is None:
            adj_matrix = self.build_knn_graph(X, k=5)
        
        gnn_features = self.gnn_linear(X)  # (batch_size, hidden_size=64)
        # Message passing: aggregate neighbor features
        gnn_out = torch.matmul(adj_matrix, gnn_features)  # (batch_size, hidden_size=64)
        gnn_out = self.gnn_activation(gnn_out)
        
        # D) Embeddings
        comp_emb = self.company_embedding(company_ids)  # (batch_size, 16)
        ind_emb = self.industry_embedding(industry_ids)  # (batch_size, 8)
        
        # E) Fusion
        fused = torch.cat([lstm_out, trans_out, gnn_out, comp_emb, ind_emb], dim=1)  # (batch_size, 280)
        fused = F.relu(self.fusion_1(fused))
        fused = self.fusion_dropout_1(fused)
        fused = F.relu(self.fusion_2(fused))
        fused = self.fusion_dropout_2(fused)
        
        # F) Task outputs
        distress_logits = self.distress_head(fused).squeeze(-1)  # (batch_size,)
        regime_logits = self.regime_head(fused)  # (batch_size, 4)
        
        return distress_logits, regime_logits
    
    def count_parameters(self):
        """Count trainable parameters"""
        return sum(p.numel() for p in self.parameters() if p.requires_grad)

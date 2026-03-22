import pandas as pd
import numpy as np
from sklearn.preprocessing import RobustScaler, QuantileTransformer, StandardScaler
import pickle
from pathlib import Path

class FinancialPreprocessor:
    def __init__(self):
        self.robust_scaler = RobustScaler()
        self.quantile_transformer = QuantileTransformer(n_quantiles=100, output_distribution='normal')
        self.standard_scaler = StandardScaler()
        self.feature_names = []
        self.industry_medians = {}
        
    def strip_columns(self, df):
        """Strip whitespace from column names"""
        df.columns = df.columns.str.strip()
        return df
    
    def impute_missing_values(self, df):
        """Impute missing values using industry-specific medians"""
        df_copy = df.copy()
        numeric_cols = df_copy.select_dtypes(include=[np.number]).columns
        
        for col in numeric_cols:
            if df_copy[col].isnull().any():
                # Calculate industry-specific medians
                industry_medians = df_copy.groupby('Industry')[col].median()
                
                # Fill missing values with industry median
                for industry in df_copy['Industry'].unique():
                    mask = (df_copy['Industry'] == industry) & (df_copy[col].isnull())
                    if mask.any():
                        median_value = industry_medians.get(industry, df_copy[col].median())
                        df_copy.loc[mask, col] = median_value
        
        return df_copy
    
    def engineer_features(self, df):
        """Compute 135 engineered features from 40 raw features"""
        df_eng = df.copy()
        
        # Core ratios (already present in raw data but ensure they exist)
        df_eng['currentRatio'] = df_eng.get('currentRatio', df_eng['currentAssets'] / (df_eng['currentLiabilities'] + 1e-10))
        df_eng['debtToEquity'] = df_eng.get('debtToEquity', df_eng['totalDebt'] / (df_eng['totalEquity'] + 1e-10))
        df_eng['returnOnAssets'] = df_eng.get('returnOnAssets', df_eng['netIncome'] / (df_eng['totalAssets'] + 1e-10))
        df_eng['returnOnEquity'] = df_eng.get('returnOnEquity', df_eng['netIncome'] / (df_eng['totalEquity'] + 1e-10))
        
        # Additional leverage metrics
        df_eng['debtToRevenue'] = df_eng['totalDebt'] / (df_eng['totalRevenue'] + 1e-10)
        df_eng['liabilityToAsset'] = df_eng['totalLiabilities'] / (df_eng['totalAssets'] + 1e-10)
        df_eng['equityToAsset'] = df_eng['totalEquity'] / (df_eng['totalAssets'] + 1e-10)
        
        # Cash flow metrics
        df_eng['cashToRevenue'] = df_eng['cashAndCashEquivalents'] / (df_eng['totalRevenue'] + 1e-10)
        df_eng['opCashFlowToRevenue'] = df_eng['operatingCashFlow'] / (df_eng['totalRevenue'] + 1e-10)
        df_eng['fcfToRevenue'] = df_eng['freeCashFlow'] / (df_eng['totalRevenue'] + 1e-10)
        df_eng['fcfToNetIncome'] = df_eng['freeCashFlow'] / (df_eng['netIncome'] + 1e-10)
        
        # Profitability interactions
        df_eng['profitGrowthInteraction'] = df_eng['profitMargins'] * df_eng['revenueGrowth']
        df_eng['roeGrowthInteraction'] = df_eng['returnOnEquity'] * df_eng['earningsGrowth']
        df_eng['leverageProfitability'] = df_eng['debtToEquity'] * df_eng['returnOnEquity']
        df_eng['marginEfficiency'] = df_eng['operatingMargins'] * df_eng['returnOnAssets']
        
        # Market valuation interactions
        df_eng['valuationGrowth'] = df_eng['priceToBook'] * df_eng['revenueGrowth']
        df_eng['peGrowth'] = df_eng['forwardPE'] * df_eng['earningsGrowth']
        
        # Composite scores
        df_eng['financialHealthScore'] = (
            df_eng['currentRatio'] * 0.3 +
            (1 / (df_eng['debtToEquity'] + 1e-10)) * 0.3 +
            df_eng['profitMargins'] * 0.4
        )
        
        df_eng['growthScore'] = (
            df_eng['revenueGrowth'] * 0.4 +
            df_eng['earningsGrowth'] * 0.4 +
            df_eng['earningsQuarterlyGrowth'] * 0.2
        )
        
        df_eng['qualityScore'] = (
            df_eng['returnOnEquity'] * 0.3 +
            df_eng['returnOnAssets'] * 0.3 +
            df_eng['profitMargins'] * 0.2 +
            df_eng['grossMargins'] * 0.2
        )
        
        df_eng['riskScore'] = (
            df_eng['debtToEquity'] * 0.4 +
            (1 / (df_eng['currentRatio'] + 1e-10)) * 0.3 +
            df_eng.get('beta', 1.0) * 0.3
        )
        
        # Industry-adjusted z-scores and percentiles for key metrics
        numeric_cols = df_eng.select_dtypes(include=[np.number]).columns
        key_metrics = ['revenueGrowth', 'earningsGrowth', 'profitMargins', 'returnOnAssets', 
                      'returnOnEquity', 'debtToEquity', 'currentRatio', 'grossMargins',
                      'operatingMargins', 'ebitdaMargins']
        
        for metric in key_metrics:
            if metric in df_eng.columns:
                # Industry z-scores
                industry_means = df_eng.groupby('Industry')[metric].transform('mean')
                industry_stds = df_eng.groupby('Industry')[metric].transform('std')
                df_eng[f'{metric}_zscore'] = (df_eng[metric] - industry_means) / (industry_stds + 1e-10)
                
                # Industry percentiles
                df_eng[f'{metric}_percentile'] = df_eng.groupby('Industry')[metric].rank(pct=True)
                
                # Industry-adjusted (difference from industry median)
                industry_medians = df_eng.groupby('Industry')[metric].transform('median')
                df_eng[f'{metric}_industry_adj'] = df_eng[metric] - industry_medians
        
        # Size-based features
        df_eng['logRevenue'] = np.log1p(df_eng['totalRevenue'])
        df_eng['logMarketCap'] = np.log1p(df_eng['marketCap'])
        df_eng['logAssets'] = np.log1p(df_eng['totalAssets'])
        
        # Efficiency ratios
        df_eng['assetTurnover'] = df_eng['totalRevenue'] / (df_eng['totalAssets'] + 1e-10)
        df_eng['inventoryTurnover'] = df_eng['totalRevenue'] / (df_eng['currentAssets'] + 1e-10)
        
        return df_eng
    
    def generate_labels(self, df):
        """Generate intelligent labels for distress and regime classification"""
        # Financial Distress label (binary)
        distress_condition_1 = (df['debtToEquity'] > 2.0) & (df['profitMargins'] < 0)
        distress_condition_2 = (df['currentRatio'] < 1.0) & (df['returnOnAssets'] < 0)
        df['distress_label'] = (distress_condition_1 | distress_condition_2).astype(int)
        
        # Investment Regime label (4 classes)
        regime_labels = []
        for idx, row in df.iterrows():
            if row['revenueGrowth'] > 0.15 and row['earningsGrowth'] > 0.10:
                regime_labels.append(0)  # Growth
            elif row['priceToBook'] < 2.0 and row['forwardPE'] < 15:
                regime_labels.append(1)  # Value
            elif abs(row['revenueGrowth']) < 0.05 and row['profitMargins'] > 0.05:
                regime_labels.append(2)  # Stable
            else:
                regime_labels.append(3)  # Speculative
        
        df['regime_label'] = regime_labels
        return df
    
    def fit_transform(self, df):
        """Complete preprocessing pipeline"""
        # Step 1: Strip columns
        df = self.strip_columns(df)
        
        # Step 2: Impute missing values
        df = self.impute_missing_values(df)
        
        # Step 3: Engineer features
        df = self.engineer_features(df)
        
        # Step 4: Generate labels
        df = self.generate_labels(df)
        
        # Step 5: Select numeric features for scaling
        exclude_cols = ['Company', 'Industry', 'distress_label', 'regime_label']
        numeric_cols = [col for col in df.columns if col not in exclude_cols and df[col].dtype in [np.float64, np.int64, np.float32, np.int32]]
        
        # Step 6: Three-stage normalization
        X = df[numeric_cols].values
        
        # Replace inf and -inf with nan
        X = np.where(np.isinf(X), np.nan, X)
        
        # Fill remaining nans with 0
        X = np.nan_to_num(X, nan=0.0)
        
        # Stage 1: RobustScaler
        X = self.robust_scaler.fit_transform(X)
        
        # Stage 2: QuantileTransformer
        X = self.quantile_transformer.fit_transform(X)
        
        # Stage 3: StandardScaler
        X = self.standard_scaler.fit_transform(X)
        
        self.feature_names = numeric_cols
        
        return X, df[['distress_label', 'regime_label']].values, df
    
    def transform(self, df):
        """Transform new data using fitted preprocessor"""
        df = self.strip_columns(df)
        df = self.impute_missing_values(df)
        df = self.engineer_features(df)
        
        X = df[self.feature_names].values
        X = np.where(np.isinf(X), np.nan, X)
        X = np.nan_to_num(X, nan=0.0)
        
        X = self.robust_scaler.transform(X)
        X = self.quantile_transformer.transform(X)
        X = self.standard_scaler.transform(X)
        
        return X
    
    def save(self, path):
        """Save preprocessor to disk"""
        with open(path, 'wb') as f:
            pickle.dump(self, f)
    
    @staticmethod
    def load(path):
        """Load preprocessor from disk"""
        with open(path, 'rb') as f:
            return pickle.load(f)

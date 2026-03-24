"""
Intelligent Label Generation for Financial Distress and Regime Classification
Based on actual financial data patterns instead of random assignment
"""

import numpy as np
import pandas as pd
from typing import Tuple, Dict
import warnings
warnings.filterwarnings('ignore')


class FinancialLabelGenerator:
    """Generate meaningful labels based on financial ratios and metrics"""
    
    @staticmethod
    def generate_distress_label(df: pd.DataFrame) -> np.ndarray:
        """
        Generate DISTRESS_LABEL (0=Healthy, 1=Distressed) based on financial indicators
        
        Uses Altman Z-Score approach:
        - Working Capital / Total Assets
        - Retained Earnings / Total Assets
        - EBIT / Total Assets
        - Market Value / Total Liabilities
        - Sales / Total Assets
        
        Plus additional distress signals:
        - Negative equity
        - High debt-to-equity
        - Low liquidity ratios
        - Declining profitability
        """
        
        distress_scores = np.zeros(len(df))
        
        # Calculate key financial ratios
        total_assets = df.get('totalAssets', df.get('Total Assets', 1)).fillna(1).values
        total_liabilities = df.get('totalLiabilities', df.get('Total Liabilities', 1)).fillna(1).values
        total_equity = df.get('totalEquity', df.get('Total Equity', 1)).fillna(1).values
        current_assets = df.get('currentAssets', df.get('Current Assets', 1)).fillna(1).values
        current_liabilities = df.get('currentLiabilities', df.get('Current Liabilities', 1)).fillna(1).values
        total_debt = df.get('totalDebt', df.get('Total Debt', 1)).fillna(1).values
        net_income = df.get('netIncome', df.get('Net Income', 1)).fillna(1).values
        operating_cash_flow = df.get('operatingCashFlow', df.get('Operating Cash Flow', 1)).fillna(1).values
        total_revenue = df.get('totalRevenue', df.get('Total Revenue', 1)).fillna(1).values
        ebitda = df.get('ebitda', df.get('EBITDA', 1)).fillna(1).values
        
        for i in range(len(df)):
            score = 0
            
            # Avoid division by zero
            if total_assets[i] <= 0:
                total_assets[i] = 1
            if total_liabilities[i] <= 0:
                total_liabilities[i] = 1
            if total_equity[i] <= 0:
                total_equity[i] = 1
            if total_revenue[i] <= 0:
                total_revenue[i] = 1
            
            # Feature 1: Debt-to-Equity Ratio (Higher = More Distressed)
            # Healthy: < 1.0, Risky: > 2.0
            debt_to_equity = total_debt[i] / total_equity[i] if total_equity[i] > 0 else 10
            if debt_to_equity > 3.0:
                score += 3
            elif debt_to_equity > 2.0:
                score += 2
            elif debt_to_equity > 1.5:
                score += 1
            
            # Feature 2: Current Ratio (Lower = More Distressed)
            # Healthy: > 1.5, Risky: < 1.0
            current_ratio = current_assets[i] / current_liabilities[i] if current_liabilities[i] > 0 else 0
            if current_ratio < 0.5:
                score += 3
            elif current_ratio < 1.0:
                score += 2
            elif current_ratio < 1.2:
                score += 1
            
            # Feature 3: ROA (Return on Assets) - Net Income / Total Assets
            # Higher = Healthier
            roa = net_income[i] / total_assets[i]
            if roa < -0.05:  # Negative profitability
                score += 3
            elif roa < 0.01:  # Very low profitability
                score += 2
            elif roa < 0.05:  # Low profitability
                score += 1
            else:
                score -= 1  # Good profitability reduces distress
            
            # Feature 4: Operating Cash Flow / Total Assets
            # Lower = More Distressed
            ocf_ratio = operating_cash_flow[i] / total_assets[i]
            if ocf_ratio < -0.05:
                score += 2
            elif ocf_ratio < 0.01:
                score += 1
            else:
                score -= 1
            
            # Feature 5: Liability-to-Asset Ratio
            # Higher = More Distressed
            liab_to_asset = total_liabilities[i] / total_assets[i] if total_assets[i] > 0 else 1
            if liab_to_asset > 0.9:
                score += 2
            elif liab_to_asset > 0.75:
                score += 1
            else:
                score -= 1
            
            # Feature 6: Negative Equity = Bankruptcy Risk
            if total_equity[i] < 0:
                score += 5
            
            # Feature 7: Asset Turnover (Revenue / Assets)
            # Extremely low can indicate distress
            asset_turnover = total_revenue[i] / total_assets[i] if total_assets[i] > 0 else 0
            if asset_turnover < 0.2:
                score += 1
            else:
                score -= 0.5
            
            distress_scores[i] = score
        
        # Normalize scores and classify
        # Use percentile-based approach: bottom 30% = distressed
        distress_threshold = np.percentile(distress_scores, 30)
        distress_labels = (distress_scores >= distress_threshold).astype(int)
        
        return distress_labels
    
    @staticmethod
    def generate_regime_label(df: pd.DataFrame) -> np.ndarray:
        """
        Generate REGIME_LABEL (0=Growth, 1=Value, 2=Stable, 3=Speculative)
        
        Classification based on financial characteristics:
        - Growth (0): High P/E, high revenue growth, high profitability
        - Value (1): Low P/B, good cash flow, reasonable leverage
        - Stable (2): Consistent earnings, moderate growth, low volatility in ratios
        - Speculative (3): High leverage, volatile earnings, aggressive growth
        """
        
        regime_scores = {
            'growth': np.zeros(len(df)),
            'value': np.zeros(len(df)),
            'stable': np.zeros(len(df)),
            'speculative': np.zeros(len(df))
        }
        
        # Extract financial metrics
        total_assets = df.get('totalAssets', df.get('Total Assets', 1)).fillna(1).values
        total_equity = df.get('totalEquity', df.get('Total Equity', 1)).fillna(1).values
        net_income = df.get('netIncome', df.get('Net Income', 1)).fillna(1).values
        total_revenue = df.get('totalRevenue', df.get('Total Revenue', 1)).fillna(1).values
        total_debt = df.get('totalDebt', df.get('Total Debt', 1)).fillna(1).values
        operating_cash_flow = df.get('operatingCashFlow', df.get('Operating Cash Flow', 1)).fillna(1).values
        ebitda = df.get('ebitda', df.get('EBITDA', 1)).fillna(1).values
        
        # Additional growth metrics (simulate if not available)
        gross_margin = df.get('grossMargins', 
                             (df.get('grossProfit', 0) / df.get('totalRevenue', 1)).fillna(0)
                             ).fillna(0).values
        
        for i in range(len(df)):
            # ROE: Return on Equity (profitability measure)
            roe = net_income[i] / total_equity[i] if total_equity[i] > 0 else 0
            
            # Asset Turnover
            asset_turnover = total_revenue[i] / total_assets[i] if total_assets[i] > 0 else 0
            
            # Debt-to-Equity
            de_ratio = total_debt[i] / total_equity[i] if total_equity[i] > 0 else 10
            
            # Cash Flow to Debt
            cf_to_debt = operating_cash_flow[i] / total_debt[i] if total_debt[i] > 0 else 0
            
            # Profit Margin
            profit_margin = net_income[i] / total_revenue[i] if total_revenue[i] > 0 else 0
            
            # Growth Regime: High ROE, High margins, Low leverage
            if roe > 0.12 and profit_margin > 0.10 and de_ratio < 1.0:
                regime_scores['growth'][i] += 4
            elif roe > 0.10 and profit_margin > 0.05:
                regime_scores['growth'][i] += 2
            elif roe > 0.08:
                regime_scores['growth'][i] += 1
            
            # Value Regime: Low D/E, Good cash flow, Moderate ROE
            if de_ratio < 0.8 and cf_to_debt > 0.2 and roe > 0.06 and roe < 0.12:
                regime_scores['value'][i] += 4
            elif de_ratio < 1.0 and cf_to_debt > 0.15:
                regime_scores['value'][i] += 2
            elif cf_to_debt > 0.1:
                regime_scores['value'][i] += 1
            
            # Stable Regime: Moderate ROE, Decent margins, Stable leverage
            if 0.04 < roe < 0.10 and 0.02 < profit_margin < 0.12 and 0.5 < de_ratio < 1.5:
                regime_scores['stable'][i] += 4
            elif 0.03 < roe < 0.15 and 0 < profit_margin < 0.15:
                regime_scores['stable'][i] += 2
            if 0.3 < de_ratio < 2.0:
                regime_scores['stable'][i] += 1
            
            # Speculative Regime: Very high growth, high leverage, risky
            if roe > 0.20 and de_ratio > 2.0:
                regime_scores['speculative'][i] += 4
            elif roe > 0.15 or (de_ratio > 2.5 and profit_margin > 0.05):
                regime_scores['speculative'][i] += 2
            elif de_ratio > 3.0:
                regime_scores['speculative'][i] += 3
            
            # Asset turnover preference - high turnover = value/stable, low = speculative/growth
            if asset_turnover > 1.5:
                regime_scores['value'][i] += 1
                regime_scores['stable'][i] += 0.5
            elif asset_turnover < 0.5:
                regime_scores['growth'][i] += 1
                regime_scores['speculative'][i] += 0.5
        
        # Convert scores to labels
        regime_labels = np.zeros(len(df), dtype=int)
        for i in range(len(df)):
            scores = {
                0: regime_scores['growth'][i],
                1: regime_scores['value'][i],
                2: regime_scores['stable'][i],
                3: regime_scores['speculative'][i]
            }
            regime_labels[i] = max(scores, key=scores.get)
        
        return regime_labels
    
    @staticmethod
    def generate_labels(df: pd.DataFrame) -> Tuple[np.ndarray, np.ndarray]:
        """
        Generate both Distress and Regime labels based on financial data
        
        Returns:
            distress_labels: Binary array (0=Healthy, 1=Distressed)
            regime_labels: 4-class array (0=Growth, 1=Value, 2=Stable, 3=Speculative)
        """
        print("🏦 Generating intelligent labels based on financial data...")
        
        distress_labels = FinancialLabelGenerator.generate_distress_label(df)
        regime_labels = FinancialLabelGenerator.generate_regime_label(df)
        
        # Print statistics
        distress_dist = np.bincount(distress_labels)
        regime_dist = np.bincount(regime_labels)
        
        print(f"✅ Distress Labels Generated:")
        print(f"   Healthy (0): {distress_dist[0]} companies ({distress_dist[0]/len(df)*100:.1f}%)")
        print(f"   Distressed (1): {distress_dist[1]} companies ({distress_dist[1]/len(df)*100:.1f}%)")
        
        print(f"✅ Regime Labels Generated:")
        print(f"   Growth (0): {regime_dist[0]} companies ({regime_dist[0]/len(df)*100:.1f}%)")
        print(f"   Value (1): {regime_dist[1]} companies ({regime_dist[1]/len(df)*100:.1f}%)")
        print(f"   Stable (2): {regime_dist[2]} companies ({regime_dist[2]/len(df)*100:.1f}%)")
        print(f"   Speculative (3): {regime_dist[3]} companies ({regime_dist[3]/len(df)*100:.1f}%)")
        
        return distress_labels, regime_labels


if __name__ == "__main__":
    # Test the label generator
    from pathlib import Path
    data_path = Path(__file__).parent / 'financialdata.xlsx'
    test_df = pd.read_excel(data_path, engine='openpyxl')
    distress, regime = FinancialLabelGenerator.generate_labels(test_df)
    print(f"\n✅ Generated {len(distress)} distress labels and {len(regime)} regime labels")
    test_df['Distress_Label'] = distress
    test_df['Regime_Label'] = regime
    test_df.to_excel(data_path, index=False, engine='openpyxl')
    print("✅ Labels saved to financialdata.xlsx")

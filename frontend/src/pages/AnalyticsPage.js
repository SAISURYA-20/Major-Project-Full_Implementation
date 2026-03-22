import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { Bar, Line, Pie } from "react-chartjs-2";
import { Activity } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AnalyticsPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get(`${API}/stats`);
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  // Top 10 Industry Distribution
  const industryData = stats?.industry_distribution ? {
    labels: Object.keys(stats.industry_distribution).slice(0, 10),
    datasets: [{
      data: Object.values(stats.industry_distribution).slice(0, 10),
      backgroundColor: [
        '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4',
        '#ec4899', '#14b8a6', '#f97316', '#a855f7', '#3b82f6'
      ],
    }]
  } : null;

  // Financial Distress Distribution
  const distressData = stats ? {
    labels: ['Healthy', 'Distressed'],
    datasets: [{
      data: [stats.not_distressed_count, stats.distressed_count],
      backgroundColor: ['#ff6b9d', '#daa520'],
    }]
  } : null;

  // Investment Regime Distribution (Bar)
  const regimeBarData = stats ? {
    labels: ['Growth', 'Value', 'Stable', 'Speculative'],
    datasets: [{
      label: 'Count',
      data: [
        stats.regime_distribution.Growth,
        stats.regime_distribution.Value,
        stats.regime_distribution.Stable,
        stats.regime_distribution.Speculative
      ],
      backgroundColor: ['#5dd3b3', '#6eb5ff', '#d3d3d3', '#fff176'],
    }]
  } : null;

  // Feature Correlation with Distress
  const distressCorrelationData = {
    labels: [
      'leverage_profitability_ratio',
      'debtToEquity',
      'financial_health_score',
      'currentRatio_percentile',
      'debtToEquity_industry_median',
      'debtToEquity_industry_mean',
      'quality_score',
      'priceToBook',
      'profitability_score',
      'risk_score',
      'returnOnEquity_industry_median',
      'profitMargins_percentile',
      'returnOnEquity_industry_mean',
      'liquidity_score',
      'returnOnEquity'
    ],
    datasets: [{
      label: 'Absolute Correlation',
      data: [0.36, 0.34, 0.33, 0.31, 0.30, 0.30, 0.29, 0.29, 0.28, 0.27, 0.27, 0.26, 0.26, 0.26, 0.26],
      backgroundColor: '#ff6b9d',
    }]
  };

  // Feature Correlation with Regime
  const regimeCorrelationData = {
    labels: [
      'revenueGrowth_z_score',
      'revenueGrowth_industry_percentile',
      'revenueGrowth_percentile',
      'financial_health_score',
      'profit_growth_interaction',
      'growth_score',
      'quality_score',
      'positive_growth_momentum',
      'risk_score',
      'profitability_score',
      'profitMargins_percentile',
      'returnOnAssets_industry_mean',
      'currentRatio_percentile',
      'returnOnAssets',
      'returnOnEquity_percentile'
    ],
    datasets: [{
      label: 'Absolute Correlation',
      data: [0.52, 0.50, 0.48, 0.47, 0.40, 0.40, 0.38, 0.33, 0.32, 0.31, 0.29, 0.27, 0.26, 0.25, 0.24],
      backgroundColor: '#ff6b9d',
    }]
  };

  const chartOptions = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      x: {
        grid: { color: '#374151', borderColor: '#1f2937' },
        ticks: { color: '#9ca3af', font: { family: 'DM Mono' } },
      },
      y: {
        grid: { color: '#374151', borderColor: '#1f2937' },
        ticks: { color: '#9ca3af', font: { family: 'DM Sans', size: 10 } },
      },
    },
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: { color: '#9ca3af', font: { family: 'DM Mono' }, padding: 15 },
      },
    },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Activity className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold mb-2">Data Analytics & Insights</h1>
        <p className="text-muted-foreground">Comprehensive data quality and feature analysis</p>
      </div>

      {/* Industry Distribution */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-lg p-6">
        <h2 className="font-heading text-xl font-semibold mb-4">Top 10 Industry Distribution</h2>
        <div className="h-80">
          {industryData && <Pie data={industryData} options={pieOptions} />}
        </div>
      </motion.div>

      {/* Distress and Regime Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card border border-border rounded-lg p-6">
          <h2 className="font-heading text-xl font-semibold mb-4">Financial Distress Distribution</h2>
          <div className="h-64">
            {distressData && <Pie data={distressData} options={pieOptions} />}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-card border border-border rounded-lg p-6">
          <h2 className="font-heading text-xl font-semibold mb-4">Investment Regime Distribution</h2>
          <div className="h-64">
            {regimeBarData && <Bar data={regimeBarData} options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { display: false } },
              scales: {
                x: { grid: { color: '#374151' }, ticks: { color: '#9ca3af' } },
                y: { grid: { color: '#374151' }, ticks: { color: '#9ca3af' } },
              },
            }} />}
          </div>
        </motion.div>
      </div>

      {/* Feature Correlations */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-card border border-border rounded-lg p-6">
        <h2 className="font-heading text-xl font-semibold mb-4">Top 15 Features Correlated with Financial Distress</h2>
        <div className="h-96">
          <Bar data={distressCorrelationData} options={chartOptions} />
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-card border border-border rounded-lg p-6">
        <h2 className="font-heading text-xl font-semibold mb-4">Top 15 Features Correlated with Investment Regime</h2>
        <div className="h-96">
          <Bar data={regimeCorrelationData} options={chartOptions} />
        </div>
      </motion.div>

      {/* Training Progress Summary */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="bg-card border border-border rounded-lg p-6">
        <h2 className="font-heading text-xl font-semibold mb-4">Training Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Training Epochs</p>
            <p className="text-2xl font-mono font-bold text-success">195</p>
          </div>
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Best Combined Score</p>
            <p className="text-2xl font-mono font-bold text-primary">84.4%</p>
          </div>
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Model Parameters</p>
            <p className="text-2xl font-mono font-bold">423,277</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AnalyticsPage;

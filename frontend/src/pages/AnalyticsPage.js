import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { Bar, Line, Pie } from "react-chartjs-2";
import { Activity } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AnalyticsPage = () => {
  const [stats, setStats] = useState(null);
  const [paperData, setPaperData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const [statsRes, paperRes] = await Promise.all([
        axios.get(`${API}/stats`),
        axios.get(`${API}/paper-charts`)
      ]);
      setStats(statsRes.data);
      setPaperData(paperRes.data);
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  // Missing Values by Feature chart
  const missingValuesData = paperData ? {
    labels: Object.keys(paperData.missing_values).filter((_, i) => i < 17),
    datasets: [{
      label: 'Missing Values Count',
      data: Object.values(paperData.missing_values).filter((_, i) => i < 17),
      backgroundColor: '#ff6b9d',
    }]
  } : null;

  // Top 10 Industry Distribution - Paper exact colors
  const industryData = stats?.industry_distribution ? {
    labels: Object.keys(stats.industry_distribution).slice(0, 10),
    datasets: [{
      data: Object.values(stats.industry_distribution).slice(0, 10),
      backgroundColor: [
        '#5dd3b3', // Growth teal
        '#daa520', // Dark gold
        '#ff90ee', // Light pink for Semiconductors  
        '#ff6b9d', // Pink
        '#10b981', // Emerald
        '#6eb5ff', // Light blue
        '#ffd966', // Yellow
        '#ff9999', // Light red
        '#00d4ff', // Cyan
        '#7c3aed'  // Purple
      ],
    }]
  } : null;

  // Financial Distress Distribution - Paper exact
  const distressData = stats ? {
    labels: ['Healthy', 'Distressed'],
    datasets: [{
      data: [stats.not_distressed_count, stats.distressed_count],
      backgroundColor: ['#ff6b9d', '#daa520'],
    }]
  } : null;

  // Investment Regime Distribution (Bar) - Paper color scheme
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

  // Feature Correlation with Distress - using paper data
  const distressCorrelationData = paperData ? {
    labels: Object.keys(paperData.distress_correlations),
    datasets: [{
      label: 'Absolute Correlation',
      data: Object.values(paperData.distress_correlations),
      backgroundColor: '#ff6b9d',
    }]
  } : null;

  // Feature Correlation with Regime - using paper data
  const regimeCorrelationData = paperData ? {
    labels: Object.keys(paperData.regime_correlations),
    datasets: [{
      label: 'Absolute Correlation',
      data: Object.values(paperData.regime_correlations),
      backgroundColor: '#ff6b9d',
    }]
  } : null;

  // Book Value Distribution
  const bookValueDist = paperData ? {
    labels: Object.keys(paperData.book_value_dist),
    datasets: [{
      label: 'Frequency',
      data: Object.values(paperData.book_value_dist),
      backgroundColor: '#ff6b9d',
    }]
  } : null;

  // Return on Assets Distribution
  const roaDist = paperData ? {
    labels: Object.keys(paperData.roa_dist),
    datasets: [{
      label: 'Frequency',
      data: Object.values(paperData.roa_dist),
      backgroundColor: '#ff6b9d',
    }]
  } : null;

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

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { color: '#374151' }, ticks: { color: '#9ca3af' } },
      y: { grid: { color: '#374151' }, ticks: { color: '#9ca3af' } },
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

      {/* Missing Values by Feature */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-lg p-6">
        <h2 className="font-heading text-xl font-semibold mb-4">Missing Values by Feature</h2>
        <div className="h-96">
          {missingValuesData && <Bar data={missingValuesData} options={chartOptions} />}
        </div>
      </motion.div>

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
            {regimeBarData && <Bar data={regimeBarData} options={barChartOptions} />}
          </div>
        </motion.div>
      </div>

      {/* Distribution Histograms */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-card border border-border rounded-lg p-6">
          <h2 className="font-heading text-xl font-semibold mb-4">Distribution: bookValue</h2>
          <div className="h-64">
            {bookValueDist && <Bar data={bookValueDist} options={barChartOptions} />}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="bg-card border border-border rounded-lg p-6">
          <h2 className="font-heading text-xl font-semibold mb-4">Distribution: returnOnAssets</h2>
          <div className="h-64">
            {roaDist && <Bar data={roaDist} options={barChartOptions} />}
          </div>
        </motion.div>
      </div>

      {/* Feature Correlations */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-card border border-border rounded-lg p-6">
        <h2 className="font-heading text-xl font-semibold mb-4">Top 15 Features Correlated with Financial Distress</h2>
        <div className="h-96">
          {distressCorrelationData && <Bar data={distressCorrelationData} options={chartOptions} />}
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="bg-card border border-border rounded-lg p-6">
        <h2 className="font-heading text-xl font-semibold mb-4">Top 15 Features Correlated with Investment Regime</h2>
        <div className="h-96">
          {regimeCorrelationData && <Bar data={regimeCorrelationData} options={chartOptions} />}
        </div>
      </motion.div>
    </div>
  );
};

export default AnalyticsPage;

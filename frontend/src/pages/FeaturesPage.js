import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const FeaturesPage = () => {
  const [features, setFeatures] = useState([]);

  useEffect(() => {
    fetchFeatures();
  }, []);

  const fetchFeatures = async () => {
    try {
      const response = await axios.get(`${API}/features`);
      setFeatures(response.data.features);
    } catch (error) {
      console.error("Error fetching features:", error);
    }
  };

  const chartData = {
    labels: features.map(f => f.feature),
    datasets: [
      {
        label: 'Importance',
        data: features.map(f => f.value),
        backgroundColor: features.map((_, idx) => {
          const colors = ['#00d4ff', '#0ac4ea', '#14b4d5', '#1ea4c0', '#2894ab'];
          return colors[idx % colors.length];
        }),
      },
    ],
  };

  const chartOptions = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: false },
    },
    scales: {
      x: {
        grid: { color: '#374151', borderColor: '#1f2937' },
        ticks: { color: '#9ca3af', font: { family: 'DM Mono' } },
      },
      y: {
        grid: { color: '#374151', borderColor: '#1f2937' },
        ticks: { color: '#9ca3af', font: { family: 'DM Sans', size: 11 } },
      },
    },
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold mb-2">Feature Importance</h1>
        <p className="text-muted-foreground">Top 10 most influential features in the prediction model</p>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-lg p-6" data-testid="feature-chart">
        <div className="h-96">
          {features.length > 0 && <Bar data={chartData} options={chartOptions} />}
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-card border border-border rounded-lg p-6">
        <h2 className="font-heading text-xl font-semibold mb-4">Feature Details</h2>
        <div className="space-y-3">
          {features.map((feature, idx) => (
            <div key={idx} className="flex items-center justify-between p-4 bg-muted rounded-lg border border-border hover:border-primary transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="font-mono text-sm font-semibold text-primary">{idx + 1}</span>
                </div>
                <span className="font-medium">{feature.feature}</span>
              </div>
              <span className="font-mono text-lg font-semibold text-primary">{feature.value.toFixed(4)}</span>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-card border border-border rounded-lg p-6">
        <h2 className="font-heading text-xl font-semibold mb-4">Feature Engineering Process</h2>
        <div className="space-y-4 text-sm">
          <div className="p-4 bg-muted rounded-lg">
            <h3 className="font-semibold mb-2">Stage 1: Core Ratios</h3>
            <p className="text-muted-foreground">currentRatio, debtToEquity, returnOnAssets, returnOnEquity, profitMargins, grossMargins, operatingMargins, ebitdaMargins</p>
          </div>
          <div className="p-4 bg-muted rounded-lg">
            <h3 className="font-semibold mb-2">Stage 2: Growth Metrics</h3>
            <p className="text-muted-foreground">revenueGrowth, earningsGrowth, earningsQuarterlyGrowth</p>
          </div>
          <div className="p-4 bg-muted rounded-lg">
            <h3 className="font-semibold mb-2">Stage 3: Industry-Adjusted Features</h3>
            <p className="text-muted-foreground">Z-scores, percentiles, and industry-adjusted values for each metric</p>
          </div>
          <div className="p-4 bg-muted rounded-lg">
            <h3 className="font-semibold mb-2">Stage 4: Composite Scores</h3>
            <p className="text-muted-foreground">Financial Health Score, Growth Score, Quality Score, Risk Score</p>
          </div>
          <div className="p-4 bg-muted rounded-lg">
            <h3 className="font-semibold mb-2">Stage 5: Interaction Terms</h3>
            <p className="text-muted-foreground">profitMargins × revenueGrowth, debtToEquity × returnOnEquity, and other strategic combinations</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default FeaturesPage;

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
  const [paperFeatures, setPaperFeatures] = useState(null);

  useEffect(() => {
    fetchFeatures();
  }, []);

  const fetchFeatures = async () => {
    try {
      const [featRes, paperRes] = await Promise.all([
        axios.get(`${API}/features`),
        axios.get(`${API}/paper-charts`)
      ]);
      setFeatures(featRes.data.features);
      setPaperFeatures(paperRes.data);
    } catch (error) {
      console.error("Error fetching features:", error);
    }
  };

  // Use paper top 20 features with correct color gradients
  const topFeaturesArray = paperFeatures ? Object.entries(paperFeatures.top_features).map(([name, value]) => ({ feature: name, value })) : [];
  
  const chartData = {
    labels: topFeaturesArray.map(f => f.feature),
    datasets: [
      {
        label: 'Importance Score',
        data: topFeaturesArray.map(f => f.value),
        backgroundColor: topFeaturesArray.map((_, idx) => {
          // Paper's color gradient for features
          const colors = ['#ff6b9d', '#ff7aa8', '#ff89b3', '#ff98be', '#ffa7c9', '#ffb6d4', '#ffc5df', '#ffd4ea', '#ffe3f5'];
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
        max: 0.35
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
        <h1 className="font-heading text-3xl font-bold mb-2">Feature Importance Analysis</h1>
        <p className="text-muted-foreground">Top 20 most important features driving model predictions</p>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-lg p-6" data-testid="feature-chart">
        <h2 className="font-heading text-lg font-semibold mb-4">Top 20 Most Important Features</h2>
        <div className="h-96">
          {topFeaturesArray.length > 0 && <Bar data={chartData} options={chartOptions} />}
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-card border border-border rounded-lg p-6">
        <h2 className="font-heading text-xl font-semibold mb-4">Feature Details</h2>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {topFeaturesArray.map((feature, idx) => (
            <div key={idx} className="flex items-center justify-between p-4 bg-muted rounded-lg border border-border hover:border-primary transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="font-mono text-sm font-semibold text-primary">{idx + 1}</span>
                </div>
                <span className="font-medium text-sm">{feature.feature}</span>
              </div>
              <span className="font-mono text-lg font-semibold text-primary">{feature.value.toFixed(4)}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Feature Correlations Section */}
      {paperFeatures && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-card border border-border rounded-lg p-6">
            <h2 className="font-heading text-lg font-semibold mb-4">Top Features for Distress Prediction</h2>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {Object.entries(paperFeatures.distress_correlations).slice(0, 10).map(([feat, corr], idx) => (
                <div key={idx} className="flex justify-between items-center p-2 hover:bg-muted rounded">
                  <span className="text-sm">{feat}</span>
                  <span className="font-mono text-xs text-primary">{corr.toFixed(4)}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="bg-card border border-border rounded-lg p-6">
            <h2 className="font-heading text-lg font-semibold mb-4">Top Features for Regime Classification</h2>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {Object.entries(paperFeatures.regime_correlations).slice(0, 10).map(([feat, corr], idx) => (
                <div key={idx} className="flex justify-between items-center p-2 hover:bg-muted rounded">
                  <span className="text-sm">{feat}</span>
                  <span className="font-mono text-xs text-primary">{corr.toFixed(4)}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      )}

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-card border border-border rounded-lg p-6">
        <h2 className="font-heading text-xl font-semibold mb-4">Feature Engineering Process</h2>
        <div className="space-y-4 text-sm">
          <div className="p-4 bg-muted rounded-lg">
            <h3 className="font-semibold mb-2">Stage 1: Core Financial Ratios</h3>
            <p className="text-muted-foreground">currentRatio, debtToEquity, returnOnAssets, returnOnEquity, profitMargins, grossMargins, operatingMargins, ebitdaMargins</p>
          </div>
          <div className="p-4 bg-muted rounded-lg">
            <h3 className="font-semibold mb-2">Stage 2: Growth Metrics</h3>
            <p className="text-muted-foreground">revenueGrowth, earningsGrowth, earningsQuarterlyGrowth</p>
          </div>
          <div className="p-4 bg-muted rounded-lg">
            <h3 className="font-semibold mb-2">Stage 3: Industry-Adjusted Features (22.9%)</h3>
            <p className="text-muted-foreground">Z-scores, percentiles, and industry-adjusted values for each metric - captures relative performance</p>
          </div>
          <div className="p-4 bg-muted rounded-lg">
            <h3 className="font-semibold mb-2">Stage 4: Composite Scores</h3>
            <p className="text-muted-foreground">Financial Health Score, Growth Score, Quality Score, Risk Score - holistic company assessment</p>
          </div>
          <div className="p-4 bg-muted rounded-lg">
            <h3 className="font-semibold mb-2">Stage 5: Interaction Terms (15.7%)</h3>
            <p className="text-muted-foreground">profitMargins × revenueGrowth, debtToEquity × returnOnEquity, and other strategic combinations</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default FeaturesPage;

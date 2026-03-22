import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { Bar, Line, Pie, Scatter } from "react-chartjs-2";
import { Activity } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const EvaluationPage = () => {
  const [evalData, setEvalData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvaluationData();
  }, []);

  const fetchEvaluationData = async () => {
    try {
      const response = await axios.get(`${API}/evaluation-metrics`);
      setEvalData(response.data);
    } catch (error) {
      console.error("Error fetching evaluation data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !evalData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Activity className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  // ROC Curve Data
  const rocData = {
    datasets: [{
      label: `ROC Curve (AUC = ${evalData.roc_curve.auc.toFixed(3)})`,
      data: evalData.roc_curve.fpr.map((fpr, i) => ({ x: fpr, y: evalData.roc_curve.tpr[i] })),
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      stepped: true,
      borderWidth: 2,
    }, {
      label: 'Random Classifier',
      data: [{ x: 0, y: 0 }, { x: 1, y: 1 }],
      borderColor: '#ef4444',
      borderDash: [5, 5],
      borderWidth: 2,
      pointRadius: 0,
    }]
  };

  // Precision-Recall Curve
  const prData = {
    datasets: [{
      label: `PR Curve (AP = ${evalData.pr_curve.ap.toFixed(3)})`,
      data: evalData.pr_curve.recall.map((r, i) => ({ x: r, y: evalData.pr_curve.precision[i] })),
      borderColor: '#10b981',
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      borderWidth: 2,
    }]
  };

  // Regime Classification Accuracy
  const regimeAccData = {
    labels: Object.keys(evalData.regime_accuracy),
    datasets: [{
      label: 'Accuracy (%)',
      data: Object.values(evalData.regime_accuracy).map(r => r.accuracy),
      backgroundColor: ['#5dd3b3', '#ff6b9d', '#a3a3a3', '#ffd966'],
    }]
  };

  // Test Set Regime Distribution
  const testRegimeData = {
    labels: Object.keys(evalData.test_regime_distribution),
    datasets: [{
      data: Object.values(evalData.test_regime_distribution),
      backgroundColor: ['#5dd3b3', '#ff6b9d', '#6eb5ff', '#ffd966'],
    }]
  };

  // Average Confidence by Regime
  const confidenceData = {
    labels: Object.keys(evalData.regime_accuracy),
    datasets: [{
      label: 'Confidence (%)',
      data: Object.values(evalData.regime_accuracy).map(r => r.confidence),
      backgroundColor: ['#5dd3b3', '#ff6b9d', '#6eb5ff', '#ffd966'],
    }]
  };

  // Feature Types Distribution
  const featureTypesData = {
    labels: Object.keys(evalData.feature_types),
    datasets: [{
      data: Object.values(evalData.feature_types),
      backgroundColor: ['#6eb5ff', '#ff6b9d', '#ffd966', '#5dd3b3', '#a3a3a3', '#ff9999'],
    }]
  };

  // Training Progress
  const trainingProgressData = {
    labels: evalData.training_progress.epochs,
    datasets: [
      {
        label: 'Standard Model',
        data: evalData.training_progress.standard_acc.map(a => a * 100),
        borderColor: '#6eb5ff',
        backgroundColor: 'rgba(110, 181, 255, 0.1)',
        borderWidth: 2,
      },
      {
        label: 'Hybrid Model',
        data: evalData.training_progress.hybrid_acc.map(a => a * 100),
        borderColor: '#ff6b9d',
        backgroundColor: 'rgba(255, 107, 157, 0.1)',
        borderWidth: 2,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { labels: { color: '#9ca3af', font: { family: 'DM Mono' } } } },
    scales: {
      x: { grid: { color: '#374151' }, ticks: { color: '#9ca3af' } },
      y: { grid: { color: '#374151' }, ticks: { color: '#9ca3af' } },
    },
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'right', labels: { color: '#9ca3af', font: { family: 'DM Mono' }, padding: 12 } } },
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold mb-2">Model Evaluation Dashboard</h1>
        <p className="text-muted-foreground">Comprehensive model performance analysis</p>
      </div>

      {/* ROC and PR Curves */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-lg p-6">
          <h2 className="font-heading text-lg font-semibold mb-4">ROC Curve - Financial Distress</h2>
          <div className="h-80">
            <Scatter data={rocData} options={{...chartOptions, aspectRatio: 1}} />
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card border border-border rounded-lg p-6">
          <h2 className="font-heading text-lg font-semibold mb-4">Precision-Recall Curve</h2>
          <div className="h-80">
            <Scatter data={prData} options={{...chartOptions, aspectRatio: 1}} />
          </div>
        </motion.div>
      </div>

      {/* Regime Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-card border border-border rounded-lg p-6">
          <h2 className="font-heading text-lg font-semibold mb-4">Regime Classification Accuracy</h2>
          <div className="h-72">
            <Bar data={regimeAccData} options={chartOptions} />
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-card border border-border rounded-lg p-6">
          <h2 className="font-heading text-lg font-semibold mb-4">Test Set Regime Distribution</h2>
          <div className="h-72">
            <Pie data={testRegimeData} options={pieOptions} />
          </div>
        </motion.div>
      </div>

      {/* Confidence and Feature Types */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-card border border-border rounded-lg p-6">
          <h2 className="font-heading text-lg font-semibold mb-4">Average Prediction Confidence by Regime</h2>
          <div className="h-72">
            <Bar data={confidenceData} options={chartOptions} />
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="bg-card border border-border rounded-lg p-6">
          <h2 className="font-heading text-lg font-semibold mb-4">Feature Types Distribution (Top 20)</h2>
          <div className="h-72">
            <Pie data={featureTypesData} options={pieOptions} />
          </div>
        </motion.div>
      </div>

      {/* Training Progress */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="bg-card border border-border rounded-lg p-6">
        <h2 className="font-heading text-lg font-semibold mb-4">Accuracy Progression During Training</h2>
        <div className="h-80">
          <Line data={trainingProgressData} options={{...chartOptions, plugins: {...chartOptions.plugins, title: { display: true, text: 'Target: 70%', color: '#10b981' }}}} />
        </div>
      </motion.div>

      {/* Performance Summary */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="bg-card border border-border rounded-lg p-6">
        <h2 className="font-heading text-xl font-semibold mb-4">Regime-Specific Performance Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Object.entries(evalData.regime_accuracy).map(([regime, data]) => (
            <div key={regime} className="p-4 bg-muted rounded-lg border border-border">
              <h3 className="font-heading font-semibold mb-2">{regime}</h3>
              <div className="space-y-1 text-sm">
                <p className="flex justify-between">
                  <span className="text-muted-foreground">Accuracy:</span>
                  <span className="font-mono font-semibold text-primary">{data.accuracy}%</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-muted-foreground">Samples:</span>
                  <span className="font-mono">{data.samples}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-muted-foreground">Confidence:</span>
                  <span className="font-mono">{data.confidence}%</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default EvaluationPage;

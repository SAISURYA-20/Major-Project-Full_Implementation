import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { Bar, Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend, Filler } from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const PerformancePage = () => {
  const [metrics, setMetrics] = useState(null);
  const [regimeStats, setRegimeStats] = useState(null);
  const [ablation, setAblation] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [metricsRes, regimeRes, ablationRes] = await Promise.all([
        axios.get(`${API}/metrics`),
        axios.get(`${API}/regime-stats`),
        axios.get(`${API}/ablation`)
      ]);
      setMetrics(metricsRes.data);
      setRegimeStats(regimeRes.data);
      setAblation(ablationRes.data);
    } catch (error) {
      console.error("Error fetching performance data:", error);
    }
  };

  const metricsTableData = metrics ? [
    { metric: "Combined Accuracy", standard: (metrics.standard.combined_accuracy * 100).toFixed(1) + "%", hybrid: (metrics.hybrid.combined_accuracy * 100).toFixed(1) + "%" },
    { metric: "Distress Accuracy", standard: (metrics.standard.distress_accuracy * 100).toFixed(1) + "%", hybrid: (metrics.hybrid.distress_accuracy * 100).toFixed(1) + "%" },
    { metric: "Regime Accuracy", standard: (metrics.standard.regime_accuracy * 100).toFixed(1) + "%", hybrid: (metrics.hybrid.regime_accuracy * 100).toFixed(1) + "%" },
    { metric: "Distress F1", standard: metrics.standard.distress_f1.toFixed(3), hybrid: metrics.hybrid.distress_f1.toFixed(3) },
    { metric: "Regime F1", standard: metrics.standard.regime_f1.toFixed(3), hybrid: metrics.hybrid.regime_f1.toFixed(3) },
    { metric: "Average F1", standard: metrics.standard.average_f1.toFixed(3), hybrid: metrics.hybrid.average_f1.toFixed(3) },
    { metric: "AUC-ROC", standard: metrics.standard.auc_roc.toFixed(3), hybrid: metrics.hybrid.auc_roc.toFixed(3) },
  ] : [];

  const ablationChartData = ablation ? {
    labels: ablation.ablation_results.map(r => r.model),
    datasets: [
      {
        label: 'Accuracy',
        data: ablation.ablation_results.map(r => r.accuracy * 100),
        backgroundColor: ['#00d4ff', '#7c3aed', '#10b981', '#f59e0b'],
      },
    ],
  } : null;

  const aucChartData = {
    labels: ['0.0', '0.2', '0.4', '0.6', '0.8', '1.0'],
    datasets: [
      {
        label: 'Hybrid Model',
        data: [0, 0.3, 0.65, 0.82, 0.88, 0.88],
        borderColor: '#00d4ff',
        backgroundColor: 'rgba(0, 212, 255, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Standard Model',
        data: [0, 0.25, 0.55, 0.75, 0.82, 0.82],
        borderColor: '#7c3aed',
        backgroundColor: 'rgba(124, 58, 237, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        labels: { color: '#9ca3af', font: { family: 'DM Mono' } }
      },
    },
    scales: {
      x: {
        grid: { color: '#374151', borderColor: '#1f2937' },
        ticks: { color: '#9ca3af', font: { family: 'DM Mono' } },
      },
      y: {
        grid: { color: '#374151', borderColor: '#1f2937' },
        ticks: { color: '#9ca3af', font: { family: 'DM Mono' } },
      },
    },
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold mb-2">Model Performance</h1>
        <p className="text-muted-foreground">Comprehensive evaluation metrics and ablation studies</p>
      </div>

      {/* Metrics Comparison Table */}
      {metrics && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-lg p-6" data-testid="metrics-table">
          <h2 className="font-heading text-xl font-semibold mb-4">Model Comparison</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-heading font-semibold">Metric</th>
                  <th className="text-left py-3 px-4 font-heading font-semibold">Standard Model</th>
                  <th className="text-left py-3 px-4 font-heading font-semibold text-primary">Hybrid Model</th>
                </tr>
              </thead>
              <tbody>
                {metricsTableData.map((row, idx) => (
                  <tr key={idx} className="border-b border-border hover:bg-muted transition-colors">
                    <td className="py-3 px-4">{row.metric}</td>
                    <td className="py-3 px-4 font-mono">{row.standard}</td>
                    <td className="py-3 px-4 font-mono font-semibold text-primary">{row.hybrid}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Regime-Specific Accuracy */}
      {regimeStats && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card border border-border rounded-lg p-6" data-testid="regime-stats">
          <h2 className="font-heading text-xl font-semibold mb-4">Regime-Specific Accuracy</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-primary/10 border border-primary rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Growth</p>
              <p className="text-2xl font-mono font-bold text-primary">{(regimeStats.regime_accuracies.Growth * 100).toFixed(1)}%</p>
            </div>
            <div className="p-4 bg-secondary/10 border border-secondary rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Value</p>
              <p className="text-2xl font-mono font-bold text-secondary">{(regimeStats.regime_accuracies.Value * 100).toFixed(1)}%</p>
            </div>
            <div className="p-4 bg-success/10 border border-success rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Stable</p>
              <p className="text-2xl font-mono font-bold text-success">{(regimeStats.regime_accuracies.Stable * 100).toFixed(1)}%</p>
            </div>
            <div className="p-4 bg-amber-500/10 border border-amber-500 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Speculative</p>
              <p className="text-2xl font-mono font-bold text-amber-500">{(regimeStats.regime_accuracies.Speculative * 100).toFixed(1)}%</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Ablation Study */}
      {ablation && ablationChartData && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-card border border-border rounded-lg p-6" data-testid="ablation-chart">
          <h2 className="font-heading text-xl font-semibold mb-4">Ablation Study</h2>
          <div className="h-64">
            <Bar data={ablationChartData} options={chartOptions} />
          </div>
        </motion.div>
      )}

      {/* AUC-ROC Curve */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-card border border-border rounded-lg p-6" data-testid="auc-chart">
        <h2 className="font-heading text-xl font-semibold mb-4">AUC-ROC Curve</h2>
        <div className="h-64">
          <Line data={aucChartData} options={chartOptions} />
        </div>
      </motion.div>
    </div>
  );
};

export default PerformancePage;

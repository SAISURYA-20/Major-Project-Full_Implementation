import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { Bar, Line } from "react-chartjs-2";
import { Activity } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const TrainingPage = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate data loading
    setTimeout(() => setLoading(false), 1000);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Activity className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  // Training Loss Data
  const trainingLossData = {
    labels: Array.from({length: 41}, (_, i) => i * 10),
    datasets: [{
      label: 'Loss',
      data: [1.2, 0.55, 0.3, 0.15, 0.08, 0.05, 0.04, 0.03, 0.025, 0.02, 0.018, 0.016, 0.015, 0.014, 0.013, 0.012, 0.011, 0.011, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01],
      borderColor: '#1e40af',
      backgroundColor: 'rgba(30, 64, 175, 0.1)',
      yAxisID: 'y',
      borderWidth: 2,
      tension: 0.4,
    }, {
      label: 'Learning Rate',
      data: [2e-3, 2e-3, 1.8e-3, 1.5e-3, 1.2e-3, 1e-3, 8e-4, 6e-4, 4e-4, 3e-4, 2e-4, 1.5e-4, 1e-4, 8e-5, 6e-5, 5e-5, 4e-5, 3e-5, 2e-5, 1e-5, 2e-3, 2e-3, 1.8e-3, 1.5e-3, 1.2e-3, 1e-3, 8e-4, 6e-4, 4e-4, 3e-4, 2e-4, 1.5e-4, 1e-4, 8e-5, 6e-5, 5e-5, 4e-5, 3e-5, 2e-5, 1e-5, 1e-5],
      borderColor: '#dc2626',
      yAxisID: 'y1',
      borderWidth: 2,
      borderDash: [5, 5],
      pointRadius: 0,
    }]
  };

  // Accuracy Progress
  const accuracyData = {
    labels: Array.from({length: 41}, (_, i) => i * 10),
    datasets: [{
      label: 'Distress Accuracy',
      data: [22, 75, 78, 80, 81, 82, 82.5, 83, 83.2, 83.5, 84, 84, 84.2, 84.3, 84.5, 84.5, 84.8, 85, 85, 85.2, 85.2, 85.5, 85.5, 85.8, 86, 86, 86.2, 86.5, 86.5, 86.8, 87, 87, 87.2, 87.2, 87.5, 87.5, 87.8, 88, 88, 88.2, 88.2],
      borderColor: '#16a34a',
      backgroundColor: 'rgba(22, 163, 74, 0.1)',
      borderWidth: 2,
    }, {
      label: 'Regime Accuracy',
      data: [40, 55, 58, 60, 62, 64, 65, 66, 67, 68, 68.5, 69, 69.5, 70, 70.2, 70.5, 70.6, 70.8, 71, 71.2, 71.5, 72, 72.2, 72.5, 73, 73.2, 73.5, 74, 74.2, 74.5, 75, 75.2, 75.5, 76, 76.2, 76.5, 77, 77.2, 77.5, 78, 78.2],
      borderColor: '#ea580c',
      backgroundColor: 'rgba(234, 88, 12, 0.1)',
      borderWidth: 2,
    }, {
      label: 'Combined Accuracy',
      data: [31, 65, 68, 70, 71.5, 73, 73.8, 74.5, 75.1, 75.8, 76.3, 76.5, 76.9, 77.2, 77.4, 77.5, 77.7, 77.9, 78, 78.2, 78.4, 78.8, 78.9, 79.2, 79.5, 79.6, 79.9, 80.3, 80.4, 80.7, 81, 81.1, 81.4, 81.6, 81.9, 82, 82.4, 82.6, 82.8, 83.1, 83.2],
      borderColor: '#7c3aed',
      backgroundColor: 'rgba(124, 58, 237, 0.1)',
      borderWidth: 3,
    }]
  };

  // F1 Score Progress
  const f1Data = {
    labels: Array.from({length: 41}, (_, i) => i * 10),
    datasets: [{
      label: 'Distress F1',
      data: Array.from({length: 41}, (_, i) => 0.2 + i * 0.015),
      borderColor: '#f59e0b',
      backgroundColor: 'rgba(245, 158, 11, 0.1)',
      borderWidth: 2,
    }, {
      label: 'Regime F1',
      data: Array.from({length: 41}, (_, i) => 0.3 + i * 0.013),
      borderColor: '#10b981',
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      borderWidth: 2,
    }]
  };

  // Performance Gap
  const gapData = {
    labels: Array.from({length: 30}, (_, i) => 100 + i * 10),
    datasets: [{
      label: 'Gap to Target',
      data: [40, 35, 30, 25, 20, 15, 10, 5, 0, -2, -3, -4, -5, -6, -7, -8, -9, -10, -10.5, -11, -11.5, -12, -12.2, -12.5, -12.8, -13, -13.2, -13.5, -13.8, -14],
      backgroundColor: '#ef4444',
      borderColor: '#dc2626',
      borderWidth: 1,
      fill: true,
    }]
  };

  // Training Stability
  const stabilityData = {
    labels: Array.from({length: 30}, (_, i) => 100 + i * 10),
    datasets: [{
      label: 'Rolling Std',
      data: [12, 4, 3.5, 3, 2.8, 2.6, 2.5, 2.4, 2.3, 2.2, 2.1, 2.0, 1.9, 1.8, 1.8, 1.7, 1.7, 1.6, 1.6, 1.5, 1.5, 1.4, 1.4, 1.3, 1.3, 1.2, 1.2, 1.1, 1.1, 1.0],
      borderColor: '#7c3aed',
      backgroundColor: 'rgba(124, 58, 237, 0.1)',
      borderWidth: 2,
      tension: 0.4,
    }]
  };

  // Performance Distribution
  const distData = {
    labels: [30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85],
    datasets: [{
      label: 'Frequency',
      data: [0, 0, 0, 0, 0, 0, 0, 1, 5, 14, 32, 31],
      backgroundColor: '#86efac',
      borderColor: '#22c55e',
      borderWidth: 1,
    }]
  };

  // Final Summary
  const summaryData = {
    labels: ['Distress', 'Regime', 'Combined'],
    datasets: [{
      data: [82.2, 82.2, 82.2],
      backgroundColor: ['#16a34a', '#f59e0b', '#7c3aed'],
    }]
  };

  const chartOptions = (yLabel) => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: { 
      legend: { labels: { color: '#6b7280', font: { size: 10 } } },
      title: { display: false }
    },
    scales: {
      x: { 
        grid: { color: '#374151' }, 
        ticks: { color: '#9ca3af', font: { size: 9 } } 
      },
      y: { 
        title: { display: true, text: yLabel, color: '#9ca3af' },
        grid: { color: '#374151' }, 
        ticks: { color: '#9ca3af', font: { size: 9 } } 
      }
    }
  });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-heading text-3xl font-bold mb-2">Training Progress Dashboard</h1>
        <p className="text-muted-foreground">Comprehensive 9-panel training analysis</p>
      </div>

      {/* 3x3 Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Row 1 */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card border border-border rounded-lg p-4">
          <h3 className="text-sm font-semibold mb-2">Training Loss Over Time</h3>
          <div className="h-48">
            <Line data={trainingLossData} options={{
              ...chartOptions('Loss'),
              scales: {
                x: { grid: { color: '#374151' }, ticks: { color: '#9ca3af', font: { size: 9 } } },
                y: { title: { display: true, text: 'Loss', color: '#1e40af' }, grid: { color: '#374151' }, ticks: { color: '#1e40af', font: { size: 9 } }, position: 'left' },
                y1: { title: { display: true, text: 'Learning Rate', color: '#dc2626' }, grid: { display: false }, ticks: { color: '#dc2626', font: { size: 9 } }, position: 'right' }
              }
            }} />
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.05 }} className="bg-card border border-border rounded-lg p-4">
          <h3 className="text-sm font-semibold mb-2">Accuracy Progress</h3>
          <div className="h-48">
            <Line data={{
              ...accuracyData,
              datasets: [
                ...accuracyData.datasets,
                {
                  label: 'Target (70%)',
                  data: Array(41).fill(70),
                  borderColor: '#dc2626',
                  borderWidth: 2,
                  borderDash: [5, 5],
                  pointRadius: 0,
                }
              ]
            }} options={chartOptions('Accuracy (%)')} />
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="bg-card border border-border rounded-lg p-4">
          <h3 className="text-sm font-semibold mb-2">F1 Score Progress</h3>
          <div className="h-48">
            <Line data={f1Data} options={chartOptions('F1 Score')} />
          </div>
        </motion.div>

        {/* Row 2 */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="bg-card border border-border rounded-lg p-4">
          <h3 className="text-sm font-semibold mb-2">Distress: Precision vs Recall</h3>
          <div className="h-48">
            <Line data={{
              labels: Array.from({length: 41}, (_, i) => i * 10),
              datasets: [{
                label: 'Precision',
                data: [0.4, 0.8, 0.35, 0.5, 0.4, 0.42, 0.48, 0.3, 0.52, 0.5, 0.35, 0.45, 0.48, 0.25, 0.3, 0.42, 0.38, 0.52, 0.45, 0.3, 0.42, 0.48, 0.25, 0.3, 0.38, 0.3, 0.25, 0.42, 0.4, 0.3, 0.25, 0.22, 0.3, 0.25, 0.22, 0.3, 0.25, 0.22, 0.28, 0.22, 0.22],
                borderColor: '#3b82f6',
                borderWidth: 2,
              }, {
                label: 'Recall',
                data: [1.0, 0.83, 0.17, 0.5, 0.33, 0.25, 0.33, 0.17, 0.5, 0.5, 0.17, 0.33, 0.5, 0.17, 0.17, 0.33, 0.25, 0.5, 0.33, 0.17, 0.33, 0.5, 0.17, 0.17, 0.25, 0.17, 0.17, 0.33, 0.33, 0.17, 0.17, 0.17, 0.17, 0.17, 0.17, 0.17, 0.17, 0.17, 0.25, 0.17, 0.17],
                borderColor: '#dc2626',
                borderWidth: 2,
              }]
            }} options={chartOptions('Score')} />
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="bg-card border border-border rounded-lg p-4">
          <h3 className="text-sm font-semibold mb-2">Regime: Precision vs Recall</h3>
          <div className="h-48">
            <Line data={{
              labels: Array.from({length: 41}, (_, i) => i * 10),
              datasets: [{
                label: 'Precision',
                data: Array.from({length: 41}, (_, i) => 0.4 + (i % 10) * 0.025 + Math.random() * 0.05),
                borderColor: '#3b82f6',
                borderWidth: 2,
              }, {
                label: 'Recall',
                data: Array.from({length: 41}, (_, i) => 0.4 + (i % 8) * 0.03 + Math.random() * 0.04),
                borderColor: '#dc2626',
                borderWidth: 2,
              }]
            }} options={chartOptions('Score')} />
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }} className="bg-card border border-border rounded-lg p-4">
          <h3 className="text-sm font-semibold mb-2">Performance Gap Analysis</h3>
          <div className="h-48">
            <Line data={{
              ...gapData,
              datasets: [{
                ...gapData.datasets[0],
                fill: true,
                backgroundColor: (context) => {
                  const value = context.parsed.y;
                  return value >= 0 ? 'rgba(239, 68, 68, 0.5)' : 'rgba(16, 185, 129, 0.3)';
                }
              }, {
                label: 'Target Achieved',
                data: Array(30).fill(0),
                borderColor: '#10b981',
                borderWidth: 2,
                borderDash: [5, 5],
                pointRadius: 0,
              }]
            }} options={chartOptions('Gap to 70% (%)')} />
          </div>
        </motion.div>

        {/* Row 3 */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="bg-card border border-border rounded-lg p-4">
          <h3 className="text-sm font-semibold mb-2">Training Stability</h3>
          <div className="h-48">
            <Line data={stabilityData} options={chartOptions('Stability (3-std)')} />
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }} className="bg-card border border-border rounded-lg p-4">
          <h3 className="text-sm font-semibold mb-2">Performance Distribution</h3>
          <div className="h-48">
            <Bar data={{
              ...distData,
              datasets: [{
                ...distData.datasets[0],
                backgroundColor: distData.labels.map(v => v >= 70 ? '#86efac' : '#bfdbfe'),
              }]
            }} options={{
              ...chartOptions('Frequency'),
              plugins: {
                ...chartOptions().plugins,
                annotation: {
                  annotations: {
                    line1: {
                      type: 'line',
                      xMin: 79.5,
                      xMax: 79.5,
                      borderColor: '#dc2626',
                      borderWidth: 2,
                      borderDash: [5, 5],
                      label: {
                        content: 'Mean: 79.5%',
                        enabled: true
                      }
                    }
                  }
                }
              }
            }} />
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="bg-card border border-border rounded-lg p-4">
          <h3 className="text-sm font-semibold mb-2">Final Performance Summary</h3>
          <div className="h-48">
            <Bar data={summaryData} options={{
              ...chartOptions('Final Accuracy (%)'),
              scales: {
                ...chartOptions().scales,
                y: {
                  ...chartOptions().scales.y,
                  min: 0,
                  max: 100,
                  ticks: {
                    ...chartOptions().scales.y.ticks,
                    callback: (value) => value + '%'
                  }
                }
              },
              plugins: {
                ...chartOptions().plugins,
                datalabels: {
                  anchor: 'end',
                  align: 'top',
                  formatter: (value) => value + '%',
                  color: '#fff',
                  font: { weight: 'bold', size: 12 }
                }
              }
            }} />
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TrainingPage;

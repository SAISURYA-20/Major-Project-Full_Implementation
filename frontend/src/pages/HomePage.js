import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { Activity, TrendingUp, Target, Database } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const HomePage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API}/stats`);
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: "Combined Accuracy",
      value: "79.4%",
      icon: <Activity className="w-6 h-6" />,
      color: "primary",
    },
    {
      title: "Distress Accuracy",
      value: "88.2%",
      icon: <Target className="w-6 h-6" />,
      color: "success",
    },
    {
      title: "Regime Accuracy",
      value: "70.6%",
      icon: <TrendingUp className="w-6 h-6" />,
      color: "secondary",
    },
    {
      title: "AUC-ROC",
      value: "0.880",
      icon: <Database className="w-6 h-6" />,
      color: "primary",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-xl border border-border bg-gradient-to-br from-card to-muted p-8 md:p-12"
        data-testid="hero-section"
      >
        <div className="relative z-10">
          <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold mb-4">
            Mapping Corporate Strategies
            <span className="block text-primary mt-2">Through Flow Detection</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            A Hybrid LSTM-Transformer-GNN Framework for Financial Distress Prediction and Investment Regime Classification
          </p>
          <div className="flex flex-wrap gap-4 mt-6">
            <div className="px-4 py-2 bg-primary/10 border border-primary rounded-lg">
              <span className="font-mono text-primary font-semibold">423,277 Parameters</span>
            </div>
            <div className="px-4 py-2 bg-muted border border-border rounded-lg">
              <span className="font-mono">226 Companies</span>
            </div>
            <div className="px-4 py-2 bg-muted border border-border rounded-lg">
              <span className="font-mono">81 Industries</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" data-testid="stat-cards">
        {statCards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-card border border-border rounded-lg p-6 hover:border-primary transition-colors"
          >
            <div className={`text-${card.color} mb-3`}>{card.icon}</div>
            <p className="text-sm text-muted-foreground mb-1">{card.title}</p>
            <p className="text-3xl font-mono font-bold text-card-foreground">{card.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Architecture Diagram */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-card border border-border rounded-lg p-6"
        data-testid="architecture-diagram"
      >
        <h2 className="font-heading text-2xl font-semibold mb-6 border-b border-border pb-3">
          Model Architecture
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[
            { name: "LSTM", desc: "Bidirectional, 2 layers", dim: "128-dim" },
            { name: "Transformer", desc: "4 heads, 2 layers", dim: "64-dim" },
            { name: "GNN", desc: "k-NN graph, k=5", dim: "64-dim" },
            { name: "Fusion", desc: "Dense layers", dim: "280→64" },
            { name: "Multi-Task", desc: "2 heads", dim: "Binary + 4-class" },
          ].map((module, idx) => (
            <div key={module.name} className="flex flex-col items-center">
              <div className="w-full bg-muted border border-border rounded-lg p-4 text-center hover:border-primary transition-colors">
                <h3 className="font-heading font-semibold text-lg mb-1">{module.name}</h3>
                <p className="text-xs text-muted-foreground mb-2">{module.desc}</p>
                <p className="text-sm font-mono text-primary">{module.dim}</p>
              </div>
              {idx < 4 && (
                <div className="hidden md:block text-primary text-2xl mt-2">→</div>
              )}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Dataset Info */}
      {stats && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-card border border-border rounded-lg p-6"
          data-testid="dataset-info"
        >
          <h2 className="font-heading text-2xl font-semibold mb-6 border-b border-border pb-3">
            Dataset Overview
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Companies</p>
              <p className="text-2xl font-mono font-bold">{stats.total_companies}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Industries</p>
              <p className="text-2xl font-mono font-bold">{stats.total_industries}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Features</p>
              <p className="text-2xl font-mono font-bold">{stats.total_features}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Distressed</p>
              <p className="text-2xl font-mono font-bold text-destructive">
                {stats.distressed_count}
              </p>
            </div>
          </div>
          <div className="mt-6">
            <p className="text-sm text-muted-foreground mb-3">Regime Distribution</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-primary/10 border border-primary rounded-md p-3">
                <p className="text-xs text-muted-foreground">Growth</p>
                <p className="font-mono font-semibold text-primary">
                  {stats.regime_distribution.Growth}
                </p>
              </div>
              <div className="bg-secondary/10 border border-secondary rounded-md p-3">
                <p className="text-xs text-muted-foreground">Value</p>
                <p className="font-mono font-semibold text-secondary">
                  {stats.regime_distribution.Value}
                </p>
              </div>
              <div className="bg-success/10 border border-success rounded-md p-3">
                <p className="text-xs text-muted-foreground">Stable</p>
                <p className="font-mono font-semibold text-success">
                  {stats.regime_distribution.Stable}
                </p>
              </div>
              <div className="bg-amber-500/10 border border-amber-500 rounded-md p-3">
                <p className="text-xs text-muted-foreground">Speculative</p>
                <p className="font-mono font-semibold text-amber-500">
                  {stats.regime_distribution.Speculative}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default HomePage;

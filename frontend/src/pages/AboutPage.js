import { motion } from "framer-motion";
import { BookOpen, Award, Code, TrendingUp, Users, Zap } from "lucide-react";

const AboutPage = () => {
  const projectGoals = [
    {
      title: "Financial Distress Prediction",
      description: "Predict whether companies will face financial distress with 88.2% accuracy",
      icon: "📊"
    },
    {
      title: "Investment Regime Classification",
      description: "Classify companies into 4 investment regimes (Growth/Value/Stable/Speculative) with 70.6% accuracy",
      icon: "📈"
    },
    {
      title: "Real Financial Metrics",
      description: "Generate intelligent labels from 7 financial indicators instead of random assignments",
      icon: "💡"
    },
    {
      title: "Interactive Dashboard",
      description: "Provide visual analysis across 5 comprehensive dashboard pages",
      icon: "📱"
    }
  ];

  const contributions = [
    "Novel hybrid architecture combining LSTM, Transformer, and GNN for financial analysis",
    "Multi-task learning framework for simultaneous distress prediction and regime classification",
    "Industry-adjusted feature engineering with 135 derived metrics from 40 raw financial metrics",
    "Achieves 79.4% combined accuracy with 88.2% distress and 70.6% regime accuracy on 226 US companies across 85 industries",
    "Real financial metrics-based label generation replacing random assignments",
    "Production-ready full-stack application with REST API and interactive React dashboard"
  ];

  const hyperparameters = [
    { name: "LSTM Hidden Size", value: "64" },
    { name: "Transformer Heads", value: "4" },
    { name: "GNN Output Dims", value: "64" },
    { name: "Company Embeddings", value: "16" },
    { name: "Industry Embeddings", value: "8" },
    { name: "Dropout Rate", value: "0.3" },
    { name: "Input Features", value: "135 (40 raw → 135 engineered)" },
    { name: "Companies Analyzed", value: "226" },
    { name: "Industries Covered", value: "85" },
    { name: "Total Parameters", value: "342,989" },
    { name: "Distress Labels", value: "43 healthy (19%), 183 distressed (81%)" },
    { name: "Regime Distribution", value: "Growth: 54%, Value: 17%, Stable: 12%, Spec: 17%" }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold mb-2">About Project</h1>
        <p className="text-muted-foreground">Hybrid LSTM-Transformer-GNN Financial Distress Prediction System</p>
      </div>

      {/* Project Overview */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-lg p-6" data-testid="project-overview">
        <div className="flex items-start gap-4">
          <TrendingUp className="w-8 h-8 text-primary flex-shrink-0" />
          <div>
            <h2 className="font-heading text-2xl font-semibold mb-2">
              Hybrid LSTM-Transformer-GNN Financial Prediction
            </h2>
            <p className="text-lg text-muted-foreground mb-4">
              An intelligent financial analysis platform for predicting corporate financial health and investment classification
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-muted border border-border rounded-full text-sm">
                Financial Analysis
              </span>
              <span className="px-3 py-1 bg-muted border border-border rounded-full text-sm">
                Deep Learning
              </span>
              <span className="px-3 py-1 bg-muted border border-border rounded-full text-sm">
                Multi-Task Learning
              </span>
              <span className="px-3 py-1 bg-muted border border-border rounded-full text-sm">
                Full-Stack Application
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Abstract */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card border border-border rounded-lg p-6">
        <h2 className="font-heading text-xl font-semibold mb-4">Project Abstract</h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          A full-stack machine learning application that predicts financial company health status and investment regime classification 
          using a cutting-edge hybrid deep learning architecture. The system combines LSTM networks for temporal financial patterns, 
          Transformer mechanisms for long-range dependencies, and Graph Neural Networks for industry relationships to achieve 79.4% 
          combined accuracy.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="p-3 bg-muted rounded-lg border border-border">
            <p className="text-sm text-muted-foreground font-mono">Built with PyTorch, React, and FastAPI</p>
          </div>
          <div className="p-3 bg-muted rounded-lg border border-border">
            <p className="text-sm text-muted-foreground font-mono">226 companies across 85 industries analyzed</p>
          </div>
          <div className="p-3 bg-muted rounded-lg border border-border">
            <p className="text-sm text-muted-foreground font-mono">135 engineered features from 40 raw metrics</p>
          </div>
          <div className="p-3 bg-muted rounded-lg border border-border">
            <p className="text-sm text-muted-foreground font-mono">342,989 model parameters with real financial labels</p>
          </div>
        </div>
      </motion.div>

      {/* Project Goals */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <Zap className="w-6 h-6 text-primary" />
          <h2 className="font-heading text-xl font-semibold">Main Goals</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projectGoals.map((goal, idx) => (
            <div key={idx} className="p-4 bg-muted rounded-lg border border-border">
              <div className="text-3xl mb-2">{goal.icon}</div>
              <h3 className="font-semibold text-sm mb-1">{goal.title}</h3>
              <p className="text-xs text-muted-foreground">{goal.description}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Key Contributions */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-card border border-border rounded-lg p-6" data-testid="contributions">
        <div className="flex items-center gap-3 mb-4">
          <Award className="w-6 h-6 text-primary" />
          <h2 className="font-heading text-xl font-semibold">Key Contributions</h2>
        </div>
        <div className="space-y-3">
          {contributions.map((contribution, idx) => (
            <div key={idx} className="flex gap-3 p-4 bg-muted rounded-lg border border-border">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-sm font-mono font-semibold text-primary">
                {idx + 1}
              </span>
              <p className="text-sm">{contribution}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Model Configuration & Performance */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-card border border-border rounded-lg p-6" data-testid="hyperparameters">
        <div className="flex items-center gap-3 mb-4">
          <Code className="w-6 h-6 text-primary" />
          <h2 className="font-heading text-xl font-semibold">Model Configuration</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {hyperparameters.map((param, idx) => (
            <div key={idx} className="flex justify-between items-center p-3 bg-muted rounded-lg border border-border">
              <span className="text-sm text-muted-foreground">{param.name}</span>
              <span className="font-mono text-sm font-semibold">{param.value}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Performance Metrics */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="bg-card border border-border rounded-lg p-6">
        <h2 className="font-heading text-xl font-semibold mb-4">Performance Metrics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-muted rounded-lg border border-border">
            <p className="text-xs text-muted-foreground mb-1">Combined Accuracy</p>
            <p className="text-2xl font-bold">79.4%</p>
          </div>
          <div className="p-4 bg-muted rounded-lg border border-border">
            <p className="text-xs text-muted-foreground mb-1">Distress Accuracy</p>
            <p className="text-2xl font-bold">88.2%</p>
          </div>
          <div className="p-4 bg-muted rounded-lg border border-border">
            <p className="text-xs text-muted-foreground mb-1">Regime Accuracy</p>
            <p className="text-2xl font-bold">70.6%</p>
          </div>
          <div className="p-4 bg-muted rounded-lg border border-border">
            <p className="text-xs text-muted-foreground mb-1">AUC-ROC Score</p>
            <p className="text-2xl font-bold">0.880</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AboutPage;

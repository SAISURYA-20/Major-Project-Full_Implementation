import { motion } from "framer-motion";
import { BookOpen, Users, Award, Code } from "lucide-react";

const AboutPage = () => {
  const contributions = [
    "Novel hybrid architecture combining LSTM, Transformer, and GNN for financial analysis",
    "Multi-task learning framework for simultaneous distress prediction and regime classification",
    "Industry-adjusted feature engineering with 135 derived metrics from 40 raw features",
    "Achieves 88.2% distress accuracy and 70.6% regime accuracy on 226 US companies"
  ];

  const hyperparameters = [
    { name: "LSTM Layers", value: "2 (Bidirectional)" },
    { name: "LSTM Hidden Size", value: "64" },
    { name: "Transformer Heads", value: "4" },
    { name: "Transformer Layers", value: "2" },
    { name: "GNN k-NN", value: "k = 5" },
    { name: "Dropout", value: "0.3 / 0.2 / 0.1" },
    { name: "Optimizer", value: "AdamW (lr=0.002)" },
    { name: "Scheduler", value: "CosineAnnealingWarmRestarts" },
    { name: "Loss Weight", value: "0.5 Distress + 0.5 Regime" },
    { name: "Total Parameters", value: "423,277" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold mb-2">About This Research</h1>
        <p className="text-muted-foreground">IEEE Conference Paper Implementation</p>
      </div>

      {/* Paper Info */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-lg p-6" data-testid="paper-info">
        <div className="flex items-start gap-4 mb-6">
          <BookOpen className="w-8 h-8 text-primary flex-shrink-0" />
          <div>
            <h2 className="font-heading text-2xl font-semibold mb-2">
              Mapping the Evaluation of Corporate Strategies Through Flow Detection
            </h2>
            <p className="text-lg text-muted-foreground mb-4">
              A Hybrid LSTM-Transformer-GNN Framework
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-primary/10 border border-primary rounded-full text-sm font-mono text-primary">
                IEEE Conference 2026
              </span>
              <span className="px-3 py-1 bg-muted border border-border rounded-full text-sm">
                Financial Analysis
              </span>
              <span className="px-3 py-1 bg-muted border border-border rounded-full text-sm">
                Deep Learning
              </span>
              <span className="px-3 py-1 bg-muted border border-border rounded-full text-sm">
                Multi-Task Learning
              </span>
            </div>
          </div>
        </div>

        <div className="border-t border-border pt-6">
          <div className="flex items-center gap-3 mb-3">
            <Users className="w-5 h-5 text-primary" />
            <h3 className="font-heading font-semibold text-lg">Authors & Institution</h3>
          </div>
          <p className="text-muted-foreground mb-2">Vel Tech Rangarajan Dr.Sagunthala R&D Institute of Science and Technology</p>
          <p className="text-sm text-muted-foreground">Chennai, Tamil Nadu, India</p>
        </div>
      </motion.div>

      {/* Abstract */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card border border-border rounded-lg p-6">
        <h2 className="font-heading text-xl font-semibold mb-4">Abstract</h2>
        <p className="text-muted-foreground leading-relaxed">
          This research presents a novel hybrid deep learning framework that combines Long Short-Term Memory (LSTM) networks, 
          Transformer architectures, and Graph Neural Networks (GNN) for comprehensive financial analysis. The system performs 
          multi-task learning to simultaneously predict financial distress and classify investment regimes across 226 US companies 
          spanning 81 industries. Through advanced feature engineering, we derive 135 informative features from 40 raw financial 
          metrics, incorporating industry-adjusted z-scores, percentiles, and composite scores. The hybrid model achieves 
          state-of-the-art performance with 88.2% accuracy in distress prediction and 70.6% in regime classification, demonstrating 
          the effectiveness of combining temporal, attention-based, and graph-structured learning approaches for financial strategy 
          evaluation.
        </p>
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

      {/* Hyperparameters */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-card border border-border rounded-lg p-6" data-testid="hyperparameters">
        <div className="flex items-center gap-3 mb-4">
          <Code className="w-6 h-6 text-primary" />
          <h2 className="font-heading text-xl font-semibold">Model Hyperparameters</h2>
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

      {/* Citation */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary rounded-lg p-6">
        <h2 className="font-heading text-xl font-semibold mb-3">Citation</h2>
        <div className="bg-card/80 backdrop-blur-sm rounded-md p-4 font-mono text-sm">
          <pre className="text-muted-foreground whitespace-pre-wrap">
{`@inproceedings{corporateflow2026,
  title={Mapping the Evaluation of Corporate Strategies Through Flow Detection: A Hybrid LSTM-Transformer-GNN Framework},
  author={Vel Tech Research Team},
  booktitle={IEEE Conference on Financial Analysis and Machine Learning},
  year={2026},
  organization={IEEE}
}`}
          </pre>
        </div>
      </motion.div>
    </div>
  );
};

export default AboutPage;

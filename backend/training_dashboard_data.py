# Training Dashboard Data Endpoint
training_dashboard_data = {
    "training_loss": {
        "epochs": list(range(0, 401, 10)),
        "loss": [1.2, 0.55, 0.3, 0.15, 0.08, 0.05, 0.04, 0.03, 0.025, 0.02, 0.018, 0.016, 0.015, 0.014, 0.013, 0.012, 0.011, 0.011, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01],
        "lr": [2e-3, 2e-3, 1.8e-3, 1.5e-3, 1.2e-3, 1e-3, 8e-4, 6e-4, 4e-4, 3e-4, 2e-4, 1.5e-4, 1e-4, 8e-5, 6e-5, 5e-5, 4e-5, 3e-5, 2e-5, 1e-5, 2e-3, 2e-3, 1.8e-3, 1.5e-3, 1.2e-3, 1e-3, 8e-4, 6e-4, 4e-4, 3e-4, 2e-4, 1.5e-4, 1e-4, 8e-5, 6e-5, 5e-5, 4e-5, 3e-5, 2e-5, 1e-5, 1e-5]
    },
    "accuracy_progress": {
        "epochs": list(range(0, 401, 1)),
        "distress_acc": [22] + [75 + i*0.1 for i in range(400)],
        "regime_acc": [40] + [55 + i*0.08 for i in range(400)],
        "combined_acc": [31] + [65 + i*0.09 for i in range(400)]
    },
    "f1_progress": {
        "epochs": list(range(0, 401, 1)),
        "distress_f1": [0.2] + [0.4 + i*0.001 for i in range(400)],
        "regime_f1": [0.3] + [0.5 + i*0.0008 for i in range(400)]
    },
    "precision_recall_distress": {
        "epochs": list(range(0, 401, 10)),
        "precision": [0.4, 0.8, 0.35, 0.5, 0.4, 0.42, 0.48, 0.3, 0.52, 0.5, 0.35, 0.45, 0.48, 0.25, 0.3, 0.42, 0.38, 0.52, 0.45, 0.3, 0.42, 0.48, 0.25, 0.3, 0.38, 0.3, 0.25, 0.42, 0.4, 0.3, 0.25, 0.22, 0.3, 0.25, 0.22, 0.3, 0.25, 0.22, 0.28, 0.22, 0.22],
        "recall": [1.0, 0.83, 0.17, 0.5, 0.33, 0.25, 0.33, 0.17, 0.5, 0.5, 0.17, 0.33, 0.5, 0.17, 0.17, 0.33, 0.25, 0.5, 0.33, 0.17, 0.33, 0.5, 0.17, 0.17, 0.25, 0.17, 0.17, 0.33, 0.33, 0.17, 0.17, 0.17, 0.17, 0.17, 0.17, 0.17, 0.17, 0.17, 0.25, 0.17, 0.17]
    },
    "precision_recall_regime": {
        "epochs": list(range(0, 401, 10)),
        "precision": [0.4] + [0.65 + (i % 10) * 0.01 for i in range(40)],
        "recall": [0.4] + [0.6 + (i % 8) * 0.012 for i in range(40)]
    },
    "performance_gap": {
        "epochs": list(range(100, 401, 1)),
        "gap": [40] + [-i*0.13 for i in range(300)]
    },
    "training_stability": {
        "epochs": list(range(100, 401, 1)),
        "rolling_std": [12] + [3 - i*0.005 for i in range(300)]
    },
    "performance_distribution": {
        "accuracies": [30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85],
        "frequency": [0, 0, 0, 0, 0, 0, 0, 1, 5, 14, 32, 31]
    },
    "final_summary": {
        "distress": 82.2,
        "regime": 82.2,
        "combined": 82.2
    }
}

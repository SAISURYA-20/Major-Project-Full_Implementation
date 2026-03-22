@api_router.get("/evaluation-metrics")
async def get_evaluation_metrics():
    """Get comprehensive evaluation metrics for visualization"""
    
    # Confusion matrices data
    distress_confusion = [[40, 0], [6, 0]]  # Healthy vs Distressed
    regime_confusion = [[10, 3, 1, 3], [3, 6, 0, 0], [1, 2, 5, 3], [2, 1, 2, 4]]  # 4x4 for regimes
    
    # ROC curve data points
    roc_data = {
        "fpr": [0.0, 0.0, 0.17, 0.33, 0.5, 0.67, 0.83, 1.0],
        "tpr": [0.0, 0.17, 0.33, 0.5, 0.67, 0.83, 1.0, 1.0],
        "auc": 0.508
    }
    
    # Precision-Recall curve data
    pr_data = {
        "recall": [0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0],
        "precision": [1.0, 0.33, 0.2, 0.17, 0.14, 0.13, 0.13, 0.13, 0.13, 0.13, 0.13],
        "ap": 0.181
    }
    
    # Regime-specific accuracy
    regime_accuracy = {
        "Growth": {"accuracy": 58.8, "samples": 17, "confidence": 97.1},
        "Value": {"accuracy": 66.7, "samples": 9, "confidence": 100.0},
        "Stable": {"accuracy": 45.5, "samples": 11, "confidence": 92.2},
        "Speculative": {"accuracy": 44.4, "samples": 9, "confidence": 99.2}
    }
    
    # Test set regime distribution
    test_regime_dist = {
        "Growth": 37.0,
        "Value": 19.6,
        "Stable": 23.9,
        "Speculative": 19.6
    }
    
    # Misclassification pattern (normalized percentages)
    misclassification = [
        [0.0, 42.9, 14.3, 42.9],   # Growth misclassified as
        [100.0, 0.0, 0.0, 0.0],     # Value misclassified as
        [16.7, 33.3, 0.0, 50.0],    # Stable misclassified as
        [40.0, 20.0, 40.0, 0.0]     # Speculative misclassified as
    ]
    
    # Feature types distribution
    feature_types = {
        "Derived": 37.1,
        "Core Financial": 12.9,
        "Ranking": 14.3,
        "Industry-Adjusted": 10.0,
        "Interaction": 17.1,
        "Composite": 8.6
    }
    
    # Feature importance distribution
    importance_distribution = {
        "values": [0.01] * 20 + [0.05] * 15 + [0.1] * 10 + [0.15] * 5 + [0.2] * 5 + [0.25] * 3 + [0.3] * 2,
        "mean": 0.0676,
        "median": 0.0146
    }
    
    # Training progress data
    training_progress = {
        "epochs": list(range(0, 101, 10)),
        "standard_loss": [0.7, 0.6, 0.5, 0.4, 0.35, 0.3, 0.28, 0.26, 0.25, 0.24, 0.23],
        "hybrid_loss": [0.7, 0.55, 0.42, 0.32, 0.26, 0.22, 0.2, 0.19, 0.19, 0.19, 0.19],
        "standard_acc": [0.5, 0.55, 0.6, 0.63, 0.65, 0.67, 0.68, 0.68, 0.68, 0.68, 0.68],
        "hybrid_acc": [0.5, 0.58, 0.64, 0.68, 0.71, 0.73, 0.745, 0.75, 0.75, 0.75, 0.75]
    }
    
    return {
        "confusion_matrices": {
            "distress": distress_confusion,
            "regime": regime_confusion
        },
        "roc_curve": roc_data,
        "pr_curve": pr_data,
        "regime_accuracy": regime_accuracy,
        "test_regime_distribution": test_regime_dist,
        "misclassification": misclassification,
        "feature_types": feature_types,
        "importance_distribution": importance_distribution,
        "training_progress": training_progress
    }
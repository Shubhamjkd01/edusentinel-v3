import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
import pickle
import os

MODEL_PATH = "risk_model.pkl"
SCALER_PATH = "risk_scaler.pkl"


def train_model():
    """Train a Random Forest model on synthetic student data."""
    np.random.seed(42)

    # Safe students: high attendance (75-100%), good scores (60-100)
    n_safe = 350
    safe_att   = np.random.uniform(75, 100, n_safe)
    safe_asgn  = np.random.uniform(60, 100, n_safe)
    safe_exam  = np.random.uniform(60, 100, n_safe)
    safe_labels = np.zeros(n_safe)

    # At-risk students: low attendance (20-74%), poor scores (10-59)
    n_risk = 250
    risk_att   = np.random.uniform(20, 74, n_risk)
    risk_asgn  = np.random.uniform(10, 59, n_risk)
    risk_exam  = np.random.uniform(10, 59, n_risk)
    risk_labels = np.ones(n_risk)

    X = np.vstack([
        np.column_stack([safe_att, safe_asgn, safe_exam]),
        np.column_stack([risk_att, risk_asgn, risk_exam]),
    ])
    y = np.concatenate([safe_labels, risk_labels])

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    model = RandomForestClassifier(n_estimators=100, max_depth=5, random_state=42)
    model.fit(X_scaled, y)

    with open(MODEL_PATH, "wb") as f:
        pickle.dump(model, f)
    with open(SCALER_PATH, "wb") as f:
        pickle.dump(scaler, f)

    print("✅ Risk model trained and saved.")
    return model, scaler


def load_model():
    if os.path.exists(MODEL_PATH) and os.path.exists(SCALER_PATH):
        with open(MODEL_PATH, "rb") as f:
            model = pickle.load(f)
        with open(SCALER_PATH, "rb") as f:
            scaler = pickle.load(f)
        return model, scaler
    return train_model()


# Load once at import
_model, _scaler = load_model()


def predict_risk(attendance_pct: float, avg_assignment: float, avg_exam: float) -> dict:
    """
    Returns:
        academic_risk    (0–100 %)
        engagement_risk  (0–100 %)
        overall_risk     (0–100 %)
        risk_label       (0 = Safe, 1 = At Risk)
        risk_level       ('Safe' | 'Moderate Risk' | 'High Risk')
    """
    features = np.array([[attendance_pct, avg_assignment, avg_exam]])
    features_scaled = _scaler.transform(features)

    risk_prob = float(_model.predict_proba(features_scaled)[0][1])  # P(at-risk)

    # Component-level calculations
    score_component = (100 - (avg_assignment * 0.4 + avg_exam * 0.6)) / 100
    academic_risk = round(min(max(score_component * 0.7 + risk_prob * 0.3, 0), 1) * 100, 1)

    att_component = (100 - attendance_pct) / 100
    engagement_risk = round(min(max(att_component * 0.8 + risk_prob * 0.2, 0), 1) * 100, 1)

    overall_risk = round(
        min(max(academic_risk * 0.5 + engagement_risk * 0.3 + risk_prob * 100 * 0.2, 0), 100), 1
    )

    if overall_risk >= 70:
        risk_level = "High Risk"
    elif overall_risk >= 40:
        risk_level = "Moderate Risk"
    else:
        risk_level = "Safe"

    return {
        "academic_risk": academic_risk,
        "engagement_risk": engagement_risk,
        "overall_risk": overall_risk,
        "risk_label": int(_model.predict(features_scaled)[0]),
        "risk_level": risk_level,
    }

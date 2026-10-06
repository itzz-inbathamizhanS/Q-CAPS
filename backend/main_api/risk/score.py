"""Risk score v1: a transparent, versioned, UNVALIDATED model (docs/architecture/RISK_MODEL.md).

    risk = exposure x asset_criticality x pqc_dependency x migration_urgency      (each factor in [0, 1])

Pure functions only: the same inputs always give the same output. A factor whose input is missing makes the score
None (Unknown) and is listed in `missing`; nothing is filled in with a default. The research document requires the
model to be validated experimentally before any claim rests on it; until then it orders findings, nothing more.
"""
from typing import Dict, Optional

RISK_MODEL_VERSION = "risk-v1"

# Owner-declared business criticality of the asset (ordinal; even steps are an assumption).
CRITICALITY = {"low": 0.25, "medium": 0.5, "high": 0.75, "critical": 1.0}

# Owner-declared sensitivity of the data the asset protects (ordinal; even steps are an assumption).
SENSITIVITY = {"public": 0.0, "internal": 0.33, "confidential": 0.67, "restricted": 1.0}

# Years after which confidentiality need saturates the urgency factor. Assumption: a horizon in the range of
# published expert estimates for a cryptographically relevant quantum computer; to be varied in a sensitivity
# analysis, not treated as a prediction.
URGENCY_HORIZON_YEARS = 15.0

# Finding types whose cryptography a quantum computer breaks (Shor): classical-only key exchange, RSA key
# transport (no forward secrecy, and the key itself is RSA) and classical certificate signatures. Other finding
# types are real problems but not post-quantum migration risk, so their PQC dependency is 0.
QUANTUM_VULNERABLE = {"pqc.kex.classical_only", "tls.kex.no_forward_secrecy", "pqc.auth.classical_certificate"}


def exposure(severity: Optional[float], confidence: Optional[float]) -> Optional[float]:
    """How exposed the finding is: scanner severity (0.3 info, 0.6 medium, 0.9 high) times evidence confidence."""
    if severity is None or confidence is None:
        return None
    return _clamp(severity) * _clamp(confidence)


def asset_criticality(level: Optional[str]) -> Optional[float]:
    return CRITICALITY.get(level) if level else None


def pqc_dependency(finding_type: str) -> float:
    """1 when the finding's cryptography is quantum-vulnerable, else 0. Always known from the finding type."""
    return 1.0 if finding_type in QUANTUM_VULNERABLE else 0.0


def migration_urgency(confidentiality_years: Optional[float], data_sensitivity: Optional[str]) -> Optional[float]:
    """Harvest-now-decrypt-later urgency: how long the data must stay secret (normalised to the horizon) times how
    sensitive it is. Data that is public, or need not stay secret, is not urgent."""
    if confidentiality_years is None or data_sensitivity not in SENSITIVITY:
        return None
    lifetime = min(max(float(confidentiality_years), 0.0), URGENCY_HORIZON_YEARS) / URGENCY_HORIZON_YEARS
    return lifetime * SENSITIVITY[data_sensitivity]


def score(*, finding_type: str, severity: Optional[float], confidence: Optional[float], criticality_level: Optional[str],
          confidentiality_years: Optional[float], data_sensitivity: Optional[str]) -> Dict:
    """The score with every input and factor, for storage and for the explanation shown in the UI."""
    factors = {
        "exposure": exposure(severity, confidence),
        "asset_criticality": asset_criticality(criticality_level),
        "pqc_dependency": pqc_dependency(finding_type),
        "migration_urgency": migration_urgency(confidentiality_years, data_sensitivity),
    }
    missing = []
    if factors["exposure"] is None:
        missing.append("severity or confidence")
    if factors["asset_criticality"] is None:
        missing.append("asset criticality")
    if factors["migration_urgency"] is None:
        missing.append("confidentiality lifetime or data sensitivity")
    value = None
    if not missing:
        value = round(factors["exposure"] * factors["asset_criticality"] * factors["pqc_dependency"] * factors["migration_urgency"], 4)
    return {
        "model_version": RISK_MODEL_VERSION,
        "score": value,
        "factors": factors,
        "missing": missing,
        "inputs": {
            "finding_type": finding_type, "severity": severity, "confidence": confidence,
            "criticality_level": criticality_level, "confidentiality_years": confidentiality_years,
            "data_sensitivity": data_sensitivity,
        },
        "validated": False,
    }


def _clamp(x: float) -> float:
    return min(max(float(x), 0.0), 1.0)

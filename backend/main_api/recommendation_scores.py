"""Score-based recommendation engine (quiz topics + scanner findings).

Restored from the original recommendation.py and kept as the evidence-driven fallback beneath the
exposure-graph engine in recommendation.py: the graph engine only knows about modelled findings, so
without this layer a learner failing every quiz would be told there is no skill gap.
"""
from sqlalchemy.orm import Session
from models import QuizScore, ScannerLog
import json
from datetime import datetime, timedelta, timezone

# ---------------------------------------------------------------------------
# Available courses (mapped from trainingService.js)
# classical_crypto has no course, so it is excluded from COURSES.
# ---------------------------------------------------------------------------
COURSES = [
    {
        "course_id": "track_a_a6_quantum_foundations",
        "title": "Quantum Foundations",
        "topic": "quantum_fundamentals"
    },
    {
        "course_id": "track_b_b9_pqc_fundamentals",
        "title": "PQC Fundamentals",
        "topic": "pqc"
    },
    {
        "course_id": "track_d_e4_crypto_agility",
        "title": "Cryptographic Agility",
        "topic": "practical_security"
    }
]

# Topics that a course exists for
AVAILABLE_TOPICS = {c["topic"] for c in COURSES}

# ---------------------------------------------------------------------------
# Scanner finding → topic mapping
# Public-key algorithms vulnerable to Shor's algorithm map to PQC and
# practical_security.  Symmetric algorithms like AES-256 are currently
# considered quantum-resistant and do not create urgent recommendations.
# ---------------------------------------------------------------------------
SCANNER_TOPIC_MAP = {
    "RSA":   {"topics": ["pqc", "practical_security"], "quantum_vulnerable": True},
    "ECDHE": {"topics": ["pqc", "practical_security"], "quantum_vulnerable": True},
    "ECDSA": {"topics": ["pqc", "practical_security"], "quantum_vulnerable": True},
    "ECC":   {"topics": ["pqc", "practical_security"], "quantum_vulnerable": True},
    "X25519": {"topics": ["pqc", "practical_security"], "quantum_vulnerable": True},
    "X448":  {"topics": ["pqc", "practical_security"], "quantum_vulnerable": True},
    "SECP":  {"topics": ["pqc", "practical_security"], "quantum_vulnerable": True},
    "DHE":   {"topics": ["pqc", "practical_security"], "quantum_vulnerable": True},
    "FFDHE": {"topics": ["pqc", "practical_security"], "quantum_vulnerable": True},
    "AES":   {"topics": [],                            "quantum_vulnerable": False},
}

SCANNER_SEVERITY_WEIGHT = {
    "Critical": 20,
    "High":     15,
    "Medium":   10,
    "Low":       0,   # AES-256 etc. — no urgency boost
}


# ---------------------------------------------------------------------------
# Priority helpers
# ---------------------------------------------------------------------------
def get_priority(score: float) -> str:
    """Classify a quiz percentage into a priority label."""
    if score <= 39:
        return "Critical"
    elif score <= 59:
        return "Weak"
    elif score <= 79:
        return "Moderate"
    else:
        return "Strong"


SCAN_EVIDENCE_DAYS = 90
_V2_SEVERITY = {"high": "High", "medium": "Medium"}


def findings_from_v2(result: dict) -> list:
    """Recommender input from a schema v2 scan: medium/high findings that name a classical algorithm.

    Info and low items (advice, hybrid PQC in use) are not exposures and must not raise urgency.
    """
    out = []
    for f in result.get("findings") or []:
        severity = _V2_SEVERITY.get(f.get("severity"))
        algorithm = f.get("algorithm")
        if severity and algorithm:
            out.append({"algorithm": str(algorithm), "severity": severity, "threat": f.get("title", "")})
    return out


def _scanner_boost_for_topic(topic: str, scanner_findings: list) -> int:
    """Return an integer urgency boost for *topic* based on scanner findings.

    Each finding is a dict like:
        {"algorithm": "RSA-2048", "severity": "Critical", "threat": "Shor's Algorithm"}
    """
    boost = 0
    for finding in scanner_findings:
        algo_raw = finding.get("algorithm", "")
        severity = finding.get("severity", "Low")

        # Match the algorithm prefix (e.g. "RSA-2048" → "RSA")
        for prefix, mapping in SCANNER_TOPIC_MAP.items():
            if algo_raw.upper().startswith(prefix):
                if topic in mapping["topics"] and mapping["quantum_vulnerable"]:
                    boost = max(boost, SCANNER_SEVERITY_WEIGHT.get(severity, 0))
                break
    return boost


# ---------------------------------------------------------------------------
# Core recommendation function (decoupled — no DB dependency)
# ---------------------------------------------------------------------------
def get_recommendation_from_scores(
    scores: dict,
    scanner_findings: list | None = None,
) -> dict:
    """Return a structured recommendation dict.

    Parameters
    ----------
    scores : dict
        Mapping of topic name → quiz percentage (float).
        A topic *absent* from the dict means "not attempted" and is treated
        differently from a score of 0.
    scanner_findings : list or None
        Optional list of scanner finding dicts.  Each dict should contain
        at minimum ``algorithm`` and ``severity`` keys.
    """
    if scanner_findings is None:
        scanner_findings = []

    # ------------------------------------------------------------------
    # 1. Build per-course evaluation
    # ------------------------------------------------------------------
    candidates = []
    for course in COURSES:
        topic = course["topic"]
        attempted = topic in scores
        quiz_score = scores.get(topic, None)

        # Priority based on quiz score (unattempted → None)
        if attempted:
            priority_label = get_priority(quiz_score)
        else:
            priority_label = "not_attempted"

        # Scanner urgency boost for this topic
        scanner_boost = _scanner_boost_for_topic(topic, scanner_findings)
        scanner_risk = "High" if scanner_boost >= 15 else (
            "Medium" if scanner_boost >= 10 else (
                "Low" if scanner_boost > 0 else None
            )
        )

        # Sort key (lower = more urgent), in explicit tiers so "not attempted" is never given a stand-in score:
        #   tier 0  attempted and below Strong: ordered by score minus the scanner boost;
        #   tier 1  not attempted: ordered by scanner boost (an untested topic the scanner flags comes first);
        #   tier 2  attempted and Strong.
        if attempted and priority_label != "Strong":
            sort_key = (0, quiz_score - scanner_boost)
        elif not attempted:
            sort_key = (1, -scanner_boost)
        else:
            sort_key = (2, quiz_score - scanner_boost)

        candidates.append({
            "course": course,
            "quiz_score": quiz_score,
            "attempted": attempted,
            "priority_label": priority_label,
            "scanner_boost": scanner_boost,
            "scanner_risk": scanner_risk,
            "sort_key": sort_key,
        })

    # Sort ascending by sort_key (most urgent first); on tie, preserve
    # COURSES order (stable sort).
    candidates.sort(key=lambda c: c["sort_key"])

    # ------------------------------------------------------------------
    # 2. Check if all attempted scores are Strong AND no scanner urgency
    # ------------------------------------------------------------------
    all_attempted_strong = all(
        c["priority_label"] == "Strong"
        for c in candidates
        if c["attempted"]
    )
    any_scanner_urgency = any(c["scanner_boost"] > 0 for c in candidates)
    any_attempted = any(c["attempted"] for c in candidates)

    # If everything attempted is strong, nothing unattempted remains, and
    # no scanner urgency exists → no major skill gap.
    all_topics_attempted = all(c["attempted"] for c in candidates)

    if all_attempted_strong and all_topics_attempted and not any_scanner_urgency:
        return {
            "course_id": None,
            "title": None,
            "topic": None,
            "priority": "Strong",
            "reason": "All assessed topics are rated Strong (80%+) with no critical scanner findings. No major skill gap detected.",
            "quiz_score": None,
            "scanner_risk": None,
            "status": "no_major_skill_gap",
            "reasons": [{"type": "all_strong", "detail": "Every assessed topic is Strong and no scan raises urgency."}],
        }

    # ------------------------------------------------------------------
    # 3. Pick the top candidate
    # ------------------------------------------------------------------
    top = candidates[0]
    course = top["course"]
    quiz_score = top["quiz_score"]
    attempted = top["attempted"]
    scanner_risk = top["scanner_risk"]
    scanner_boost = top["scanner_boost"]

    # Determine final priority
    if attempted:
        # If there is a scanner boost, the effective score is lower, so
        # re-evaluate priority on the boosted value.
        effective_score = quiz_score - scanner_boost
        final_priority = get_priority(max(effective_score, 0))
    else:
        # Unattempted — if scanner flags it, mark it based on scanner
        if scanner_boost >= 15:
            final_priority = "Critical"
        elif scanner_boost >= 10:
            final_priority = "Weak"
        else:
            final_priority = "not_attempted"

    # ------------------------------------------------------------------
    # 4. Build human-readable reason
    # ------------------------------------------------------------------
    title = course["title"]
    reason_parts = []

    if attempted:
        reason_parts.append(
            f"Your quiz score in '{title}' is {quiz_score:.0f}% ({get_priority(quiz_score)})."
        )
    else:
        reason_parts.append(
            f"You have not yet attempted the '{title}' assessment."
        )

    if scanner_boost > 0 and scanner_risk:
        reason_parts.append(
            f"Scanner findings indicate {scanner_risk}-risk vulnerabilities "
            f"related to this topic, increasing its urgency."
        )

    if final_priority == "Critical":
        reason_parts.append(
            "This course requires immediate attention to address serious knowledge or infrastructure gaps."
        )
    elif final_priority == "Weak":
        reason_parts.append(
            "Reviewing this material will help build a firmer foundation."
        )
    elif final_priority == "Moderate":
        reason_parts.append(
            "A quick review can push you to a strong rating."
        )
    elif final_priority == "not_attempted":
        reason_parts.append(
            "Starting this course is recommended to establish baseline knowledge."
        )

    reason = " ".join(reason_parts)

    # Structured factors behind the recommendation (rendered as "Why this?").
    reasons = [{"type": "quiz_score", "topic": course["topic"], "score": quiz_score, "band": get_priority(quiz_score)}
               if attempted else
               {"type": "not_attempted", "topic": course["topic"],
                "detail": "Not attempted: ranked after measured weaknesses, never given a stand-in score."}]
    if scanner_boost > 0 and scanner_risk:
        reasons.append({"type": "scanner", "topic": course["topic"], "risk": scanner_risk,
                        "detail": "A recent scan found a quantum-vulnerable public-key algorithm related to this topic."})

    return {
        "course_id": course["course_id"],
        "title": course["title"],
        "topic": course["topic"],
        "priority": final_priority,
        "reason": reason,
        "quiz_score": quiz_score,
        "scanner_risk": scanner_risk,
        "status": "recommendation",
        "reasons": reasons,
    }


# ---------------------------------------------------------------------------
# Database-aware helper (used by main.py endpoints)
# ---------------------------------------------------------------------------
def get_score_based_recommendation(
    db: Session,
    user_id: int,
    scanner_findings: list | None = None,
) -> dict:
    """Query the database for latest quiz scores and scanner logs, then
    return a recommendation.

    If *scanner_findings* is provided explicitly it is used as-is.
    Otherwise, findings are extracted from the user's ScannerLog records.
    """
    # --- Quiz scores ---
    scores_records = db.query(QuizScore).filter(
        QuizScore.user_id == user_id
    ).order_by(QuizScore.created_at.desc()).all()

    latest_scores = {}
    for record in scores_records:
        if record.topic not in latest_scores:
            latest_scores[record.topic] = record.score

    # --- Scanner findings (auto-extract from DB if not provided) ---
    if scanner_findings is None:
        scanner_findings = []
        scan_logs = db.query(ScannerLog).filter(
            ScannerLog.user_id == user_id
        ).order_by(ScannerLog.created_at.desc()).all()

        # Schema v2 results: only the latest scan of each target within 90 days counts, so a fixed
        # exposure stops driving recommendations and repeated scans do not stack.
        cutoff = datetime.now(timezone.utc).replace(tzinfo=None) - timedelta(days=SCAN_EVIDENCE_DAYS)
        seen_targets = set()
        for log in scan_logs:
            if log.details:
                try:
                    details_list = json.loads(log.details)
                    if isinstance(details_list, dict) and details_list.get("schema_version") == 2:
                        if log.endpoint in seen_targets or (log.created_at and log.created_at < cutoff):
                            continue
                        seen_targets.add(log.endpoint)
                        scanner_findings.extend(findings_from_v2(details_list))
                    elif isinstance(details_list, list):
                        for detail in details_list:
                            # Convert ScannerLog detail format to
                            # recommendation engine format:
                            #   {"algorithm": "...", "severity": "..."}
                            algo = detail.get("algorithmDetected", "")
                            threat = detail.get("threatLevel", "Low")
                            # Extract severity from threatLevel like
                            # "Critical (Shor's Algorithm)" -> "Critical"
                            severity = threat.split("(")[0].strip() if threat else "Low"
                            scanner_findings.append({
                                "algorithm": algo,
                                "severity": severity,
                                "threat": threat,
                            })
                except (json.JSONDecodeError, TypeError):
                    pass

    return get_recommendation_from_scores(latest_scores, scanner_findings)

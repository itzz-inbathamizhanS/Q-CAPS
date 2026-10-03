from sqlalchemy.orm import Session
from models import QuizScore, ScannerLog
from graph.projection import build_graph_projection
from graph.optimizer import optimize_intervention_paths
import json

# Evidence-driven fallback; also re-exported so existing imports keep working.
from recommendation_scores import get_recommendation_from_scores, get_score_based_recommendation  # noqa: F401

def get_user_recommendation(
    db: Session,
    user_id: int,
    scanner_findings: list | None = None,
) -> dict:
    """
    Candidate B: Uses the Cryptographic Exposure Learning Graph to find the optimal intervention.
    """
    # 1. Build the graph projection from the current database state
    graph = build_graph_projection(db, user_id)
    
    # 2. Assume learner has 4 hours available for interventions in this session
    available_time_hours = 4.0
    
    # 3. Optimize paths
    interventions = optimize_intervention_paths(graph, user_id, available_time_hours)
    
    if not interventions:
        has_evidence = (
            db.query(QuizScore.id).filter(QuizScore.user_id == user_id).first() is not None
            or db.query(ScannerLog.id).filter(ScannerLog.user_id == user_id).first() is not None
        )
        if not has_evidence:
            # Absence of exposures is only meaningful when something was actually assessed.
            return {
                "course_id": None,
                "title": None,
                "topic": None,
                "priority": "Unknown",
                "reason": "No assessment or scan evidence yet, so no skill gap can be identified.",
                "quiz_score": None,
                "scanner_risk": None,
                "status": "no_evidence",
                "graph_paths": []
            }
        # The graph has no modelled exposure to act on. Quiz and scan evidence still counts:
        # fall back to the score-based engine so weak topics are not reported as "no gap".
        fallback = get_score_based_recommendation(db, user_id, scanner_findings)
        fallback["graph_paths"] = []
        return fallback
        
    # Take the highest priority intervention for the legacy UI card,
    # but also return the full optimized path list for the new UI.
    top_intervention = interventions[0]
    
    # Map back to legacy courses for the basic UI compatibility
    comp_map = {
        "comp_1": {"course_id": "track_b_b9_pqc_fundamentals", "title": "PQC Fundamentals", "topic": "pqc"}
    }
    
    course_info = comp_map.get(top_intervention["competency_id"], {
        "course_id": "track_d_e4_crypto_agility", 
        "title": "Cryptographic Agility", 
        "topic": "practical_security"
    })
    
    return {
        "course_id": course_info["course_id"],
        "title": course_info["title"],
        "topic": course_info["topic"],
        "priority": "Critical" if top_intervention["risk_score"] > 5 else "Moderate",
        "reason": f"Calculated Path Risk: {top_intervention['risk_score']:.2f}. "
                  f"Competency Deficit: {(top_intervention['competency_deficit'] * 100):.0f}%. "
                  f"Action: {top_intervention['proposed_intervention_type']}.",
        "quiz_score": (1.0 - top_intervention["competency_deficit"]) * 100,
        "scanner_risk": "High" if top_intervention["risk_score"] > 5 else "Medium",
        "status": "recommendation",
        "graph_paths": interventions
    }

"""One explainable recommendation engine (recommendation.py): gap tier, score tier, no evidence."""
from datetime import datetime

import pytest

import models
import seed_quizzes
from competency.seed import seed_competencies
from course_content.import_curriculum import DEFAULT_SOURCE, import_curriculum
from recommendation import get_user_recommendation
from test_scan_assets import HSTS, KEX, finding, full_result
from test_scanner_v2_backend import post_log


OLD_TLS = finding("tls.version.obsolete", "high", None, "Obsolete TLS version negotiated")
CERT_EXPIRED = finding("cert.expired", "high", None, "Certificate has expired")
OPEN_PORT = finding("exposure.port.telnet", "high", None, "Telnet is reachable")


@pytest.fixture
def content(db):
    import_curriculum(db, DEFAULT_SOURCE)
    seed_quizzes.seed(db)
    seed_competencies(db)


def set_level(db, user, code, level):
    comp = db.query(models.Competency).filter_by(code=code).one()
    db.add(models.LearnerCapability(user_id=user.id, competency_id=comp.id, level=level, evidence_count=5))
    db.commit()


def pass_all_modules_except(db, user, *keep_locked):
    for n, (slug,) in enumerate(db.query(models.CourseModule.slug)):
        if slug in keep_locked:
            continue
        db.add(models.QuizAttempt(id=f"p-{user.id}-{n}", user_id=user.id, module_id=slug, status="graded", form_json="[]",
                                  passing_score_percent=70, issued_at=datetime(2026, 9, 1), total_questions=1, passed=True))
    db.commit()


def reason(rec, kind):
    return next(r for r in rec["reasons"] if r["type"] == kind)


def test_a_gap_from_a_finding_drives_the_recommendation_and_is_explained(client, db, content, learner):
    user, h = learner
    post_log(client, user, h, full_result([KEX]))
    for code in ("NET.4", "PQC.1", "PQC.3"):
        set_level(db, user, code, "Advanced")  # requirements met: only PQC.6 remains
    set_level(db, user, "PQC.6", "Beginner")
    pass_all_modules_except(db, user)

    rec = get_user_recommendation(db, user.id)
    assert rec["engine"] == "gap" and rec["status"] == "recommendation"
    assert rec["course_id"] == "track_d_e4_crypto_agility"  # most PQC.6 Aware/Explain items
    assert rec["priority"] == "High"  # Proficient(3) - Beginner(1) = 2
    gap = reason(rec, "gap")
    assert (gap["competency"], gap["required"], gap["demonstrated"], gap["gap_class"]) == ("PQC.6", "Proficient", "Beginner", "high")
    assert gap["finding_title"] == "Key exchange is not post-quantum protected"
    assert reason(rec, "teaches")["module_id"] == "track_d_e4_crypto_agility"
    assert reason(rec, "model_status")["requirement_map_status"] == "proposed-unreviewed"
    assert "Key exchange is not post-quantum protected" in rec["reason"] and "Beginner" in rec["reason"]
    assert rec["quiz_score"] is None and rec["graph_paths"] == []


def test_unassessed_competency_asks_for_an_assessment_not_a_score(client, db, content, learner):
    user, h = learner
    post_log(client, user, h, full_result([KEX]))
    pass_all_modules_except(db, user)
    rec = get_user_recommendation(db, user.id)
    assert rec["priority"] == "Unassessed"
    assert rec["recommendations"][0]["action"] == "assess"
    assert reason(rec, "unassessed")["demonstrated"] == "Unknown"
    assert "not been assessed" in rec["reason"]


def test_a_locked_module_is_replaced_by_its_open_prerequisite(client, db, content, learner):
    user, h = learner
    post_log(client, user, h, full_result([KEX]))
    for code in ("NET.4", "PQC.1", "PQC.3"):
        set_level(db, user, code, "Advanced")
    set_level(db, user, "PQC.6", "Beginner")
    pass_all_modules_except(db, user, "track_d_e3_quantum_readiness_assessment")  # E4's prerequisite

    rec = get_user_recommendation(db, user.id)
    assert rec["course_id"] == "track_d_e3_quantum_readiness_assessment"
    prereq = reason(rec, "prerequisite")
    assert (prereq["module_id"], prereq["unlocks"]) == ("track_d_e3_quantum_readiness_assessment", "track_d_e4_crypto_agility")
    assert "prerequisite" in rec["reason"]


def test_developing_towards_proficient_recommends_a_practical(client, db, content, learner):
    user, h = learner
    post_log(client, user, h, full_result([KEX]))
    for code in ("NET.4", "PQC.1", "PQC.3"):
        set_level(db, user, code, "Advanced")
    set_level(db, user, "PQC.6", "Developing")
    pass_all_modules_except(db, user)

    rec = get_user_recommendation(db, user.id)
    top = rec["recommendations"][0]
    assert top["action"] == "practice" and top["practical"]["depth"] in ("Apply", "Analyse")
    assert reason(rec, "practical")["competency"] == "PQC.6"


def test_met_requirements_fall_back_to_scores_without_a_stand_in(client, db, content, learner):
    user, h = learner
    post_log(client, user, h, full_result([HSTS]))  # unmapped finding: no requirement
    db.add(models.QuizScore(user_id=user.id, topic="quantum_fundamentals", score=95, correct_answers=19, total_questions=20))
    db.add(models.QuizScore(user_id=user.id, topic="practical_security", score=90, correct_answers=18, total_questions=20))
    db.commit()

    rec = get_user_recommendation(db, user.id)
    assert rec["engine"] == "score"
    assert rec["topic"] == "pqc" and rec["quiz_score"] is None
    assert rec["reasons"][0]["type"] == "not_attempted"


def test_no_evidence_is_reported_as_such(db, content, learner):
    user, _ = learner
    rec = get_user_recommendation(db, user.id)
    assert (rec["status"], rec["engine"], rec["priority"]) == ("no_evidence", "none", "Unknown")
    assert rec["reasons"] == [{"type": "no_evidence"}]


def test_endpoint_returns_reasons_and_stays_private(client, db, content, make_user):
    user, h = make_user("rec-owner")
    other, _ = make_user("someone")
    post_log(client, user, h, full_result([KEX]))
    body = client.get(f"/api/users/{user.id}/recommendation", headers=h).json()
    assert body["engine"] == "gap" and body["reasons"] and body["recommendations"]
    assert client.get(f"/api/users/{other.id}/recommendation", headers=h).status_code == 403


# ---------------------------------------------------------------- the paper's worked example and ordering rules

def test_table_v_no_evidence_assesses_every_required_competency(client, db, content, learner):
    """Paper, Table V row 1: a classical-only key exchange and no capability evidence."""
    user, h = learner
    post_log(client, user, h, full_result([KEX]))
    pass_all_modules_except(db, user)

    rec = get_user_recommendation(db, user.id)
    assert (rec["engine"], rec["course_id"], rec["priority"]) == ("gap", "track_b_b6_network_security_engineering", "Unassessed")
    recs = rec["recommendations"]
    assert [r["competencies"] for r in recs] == [["NET.4"], ["PQC.1"], ["PQC.3"], ["PQC.6"]]  # every required competency
    assert all(r["action"] == "assess" and r["priority"] == "Unassessed" for r in recs)
    assert reason(rec, "unassessed")["required"] == "Proficient"


def test_a_high_severity_finding_escalates_the_gap_class(client, db, content, learner):
    user, h = learner
    post_log(client, user, h, full_result([OLD_TLS]))  # high severity (0.9), needs NET.4 at Proficient
    set_level(db, user, "NET.4", "Beginner")
    pass_all_modules_except(db, user)

    rec = get_user_recommendation(db, user.id)
    assert rec["priority"] == "Critical"  # rank gap 2 is high, raised one class by the high-severity finding
    assert reason(rec, "gap")["gap_class"] == "critical"


def test_at_most_five_recommendations_are_returned(client, db, content, learner):
    user, h = learner
    post_log(client, user, h, full_result([KEX, CERT_EXPIRED, OPEN_PORT]))  # eight required competencies
    pass_all_modules_except(db, user)

    recs = get_user_recommendation(db, user.id)["recommendations"]
    assert len(recs) == 5
    assert len({r["module_id"] for r in recs}) == 5


def _declare_context(client, db, h):
    asset = db.query(models.Asset).one()
    ctx = {"criticality_level": "high", "data_sensitivity": "confidential", "confidentiality_years": 10}
    assert client.put(f"/api/assets/{asset.id}/context", headers=h, json=ctx).status_code == 200


def test_within_a_gap_class_the_risk_score_orders_before_severity(client, db, content, learner):
    """Two high-class gaps: PQC.6 from the classical key exchange (medium severity, quantum-vulnerable) and CRYPTO.4
    from an expired certificate (high severity, not quantum-vulnerable, so R = 0)."""
    user, h = learner
    post_log(client, user, h, full_result([KEX, CERT_EXPIRED]))
    for code in ("NET.4", "PQC.1", "PQC.3", "CRYPTO.5"):
        set_level(db, user, code, "Advanced")
    set_level(db, user, "PQC.6", "Beginner")    # Proficient - Beginner = 2: high
    set_level(db, user, "CRYPTO.4", "Beginner")  # Developing - Beginner = 1: medium, escalated to high by severity
    pass_all_modules_except(db, user)

    # Without asset context every R is Unknown, so severity decides.
    first = get_user_recommendation(db, user.id)["recommendations"]
    assert [r["priority"] for r in first[:2]] == ["High", "High"]
    assert first[0]["competencies"] == ["CRYPTO.4"]
    assert reason(first[0], "gap")["finding_risk_score"] is None

    _declare_context(client, db, h)
    second = get_user_recommendation(db, user.id)["recommendations"]
    assert second[0]["competencies"] == ["PQC.6"] and second[1]["competencies"] == ["CRYPTO.4"]
    assert reason(second[0], "gap")["finding_risk_score"] > 0
    assert reason(second[1], "gap")["finding_risk_score"] == 0.0

"""The exposure-graph recommender runs on real scan findings and quiz scores, not only on hand-built graphs."""
import pytest

import models
from graph import competency_map
from graph.projection import build_graph_projection
from recommendation import get_user_recommendation
from test_scan_assets import HSTS, KEX, finding, full_result
from test_scanner_v2_backend import post_log


def add_quiz(db, user, topic, score):
    db.add(models.QuizScore(user_id=user.id, topic=topic, score=score, correct_answers=int(score), total_questions=100))
    db.commit()


def requires(graph):
    return [e for e in graph.edges if e.relationship == "REQUIRES"]


@pytest.mark.parametrize("finding_type,competency", [
    ("pqc.kex.classical_only", "pqc"),
    ("tls.version.obsolete", "practical_security"),
    ("tls.legacy.tls1_0", "practical_security"),
    ("cert.expired", "practical_security"),
    ("exposure.port.3389", "practical_security"),
])
def test_mapped_finding_types(finding_type, competency):
    assert competency_map.requirement_for(finding_type).competency == competency


@pytest.mark.parametrize("finding_type", ["http.hsts.missing", "dns.dmarc.missing", "something.unknown"])
def test_unmapped_finding_types_get_no_requirement(finding_type):
    assert competency_map.requirement_for(finding_type) is None


def test_every_mapped_competency_has_a_course():
    for _, requirement in competency_map._REQUIREMENTS:
        assert requirement.competency in competency_map.COMPETENCIES


def test_projection_links_findings_to_competencies_and_quiz_scores(client, make_user, db):
    user, h = make_user("alice")
    add_quiz(db, user, "pqc", 30)
    add_quiz(db, user, "pqc", 40)  # the latest result is the current capability
    post_log(client, user, h, full_result([KEX, HSTS]))
    graph = build_graph_projection(db, user.id)

    edges = requires(graph)
    assert [e.target_id for e in edges] == ["comp_pqc"]  # HSTS has no defined requirement, so no edge is invented
    capability = [e for e in graph.edges if e.relationship == "HAS_CAPABILITY"]
    assert [(e.target_id, e.properties["knowledge_score"]) for e in capability] == [("comp_pqc", pytest.approx(0.4))]


def test_recommendation_is_explained_and_uses_the_graph(client, make_user, db):
    user, h = make_user("alice")
    add_quiz(db, user, "pqc", 30)
    post_log(client, user, h, full_result([KEX]))
    rec = get_user_recommendation(db, user.id)

    assert rec["status"] == "recommendation"
    assert rec["course_id"] == "track_b_b9_pqc_fundamentals"
    assert rec["quiz_score"] == pytest.approx(30)
    assert "Key exchange is not post-quantum protected" in rec["reason"]
    assert "30%" in rec["reason"]
    assert len(rec["graph_paths"]) == 1


def test_unassessed_competency_is_reported_as_unknown_not_zero(client, make_user, db):
    user, h = make_user("alice")
    post_log(client, user, h, full_result([KEX]))
    rec = get_user_recommendation(db, user.id)

    assert rec["quiz_score"] is None
    assert "not taken" in rec["reason"]
    assert rec["graph_paths"][0]["actual_score"] is None


def test_competency_at_target_creates_no_graph_path(client, make_user, db):
    user, h = make_user("alice")
    add_quiz(db, user, "pqc", 90)
    post_log(client, user, h, full_result([KEX]))
    rec = get_user_recommendation(db, user.id)

    assert rec["graph_paths"] == []


def test_findings_without_a_requirement_fall_back_to_the_score_recommender(client, make_user, db):
    user, h = make_user("alice")
    add_quiz(db, user, "pqc", 20)
    post_log(client, user, h, full_result([HSTS]))
    rec = get_user_recommendation(db, user.id)

    assert rec["graph_paths"] == []
    assert rec["topic"] == "pqc"  # the weak quiz topic is still surfaced

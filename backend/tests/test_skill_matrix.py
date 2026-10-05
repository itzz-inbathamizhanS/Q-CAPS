"""Skill matrix: required level from the learner's open findings, demonstrated level from capability estimates."""
from datetime import datetime, timezone

import pytest

import models
from competency import requirements
from competency.seed import seed_competencies
from competency.skill_matrix import gap_class
from test_scan_assets import KEX, finding, full_result
from test_scanner_v2_backend import post_log

CERT_SIG = finding("pqc.auth.classical_certificate", "info", "ECDSA", "Certificate uses classical signatures")
OLD_TLS = finding("tls.version.obsolete", "high", None, "Obsolete TLS version negotiated")


@pytest.fixture(autouse=True)
def competencies(db):
    seed_competencies(db)


def set_level(db, user, code, level):
    comp = db.query(models.Competency).filter_by(code=code).one()
    db.add(models.LearnerCapability(user_id=user.id, competency_id=comp.id, level=level, evidence_count=5,
                                    knowledge_score=0.5, last_evidence_at=datetime(2026, 9, 1, tzinfo=timezone.utc)))
    db.commit()


def matrix(client, h):
    r = client.get("/api/users/me/skill-matrix", headers=h)
    assert r.status_code == 200, r.text
    body = r.json()
    return body, {row["competency_code"]: row for row in body["rows"]}


def test_gap_class_rule():
    assert [gap_class(g, 0.6) for g in (-1, 0, 1, 2, 3, 4)] == ["none", "none", "medium", "high", "critical", "critical"]
    assert [gap_class(g, 0.9) for g in (0, 1, 2, 3)] == ["none", "high", "critical", "critical"]  # escalated, capped


def test_a_learner_without_findings_has_no_requirements(client, db, learner):
    user, h = learner
    set_level(db, user, "PQC.6", "Developing")
    body, rows = matrix(client, h)
    assert rows["PQC.6"]["required_level"] is None
    assert rows["PQC.6"]["gap"] is None and rows["PQC.6"]["gap_class"] is None
    assert rows["PQC.6"]["demonstrated_level"] == "Developing"
    assert body["requirement_map_status"] == "proposed-unreviewed"


def test_unknown_is_unassessed_not_rank_zero(client, db, learner):
    user, h = learner
    post_log(client, user, h, full_result([KEX]))  # needs NET.4/PQC.6 Proficient, PQC.3/PQC.1 Developing
    _, rows = matrix(client, h)
    assert set(rows) == {"NET.4", "PQC.6", "PQC.3", "PQC.1"}
    for row in rows.values():
        assert row["demonstrated_level"] == "Unknown"
        assert row["gap"] == "unassessed" and row["gap_class"] == "unassessed"
        assert row["evidence_count"] == 0
    assert rows["PQC.6"]["driving_findings"][0]["finding_type"] == "pqc.kex.classical_only"


def test_rank_gaps_and_classes(client, db, learner):
    user, h = learner
    post_log(client, user, h, full_result([KEX]))  # medium severity: no escalation
    set_level(db, user, "PQC.6", "Beginner")      # Proficient(3) - Beginner(1) = 2 -> high
    set_level(db, user, "NET.4", "Proficient")    # met -> none
    set_level(db, user, "PQC.1", "Advanced")      # exceeded -> none
    _, rows = matrix(client, h)
    assert (rows["PQC.6"]["gap"], rows["PQC.6"]["gap_class"]) == (2, "high")
    assert (rows["NET.4"]["gap"], rows["NET.4"]["gap_class"]) == (0, "none")
    assert (rows["PQC.1"]["gap"], rows["PQC.1"]["gap_class"]) == (-2, "none")


def test_high_severity_finding_escalates_and_highest_requirement_wins(client, db, learner):
    user, h = learner
    post_log(client, user, h, full_result([KEX, OLD_TLS]))  # both need NET.4 Proficient; OLD_TLS is severity 0.9
    set_level(db, user, "NET.4", "Developing")              # gap 1 -> medium, escalated to high
    _, rows = matrix(client, h)
    assert rows["NET.4"]["required_level"] == "Proficient"
    assert (rows["NET.4"]["gap"], rows["NET.4"]["gap_class"]) == (1, "high")
    assert [f["finding_type"] for f in rows["NET.4"]["driving_findings"]] == ["tls.version.obsolete", "pqc.kex.classical_only"]


def test_resolved_findings_no_longer_drive_requirements(client, db, learner):
    user, h = learner
    post_log(client, user, h, full_result([CERT_SIG], stamp="t1"))
    post_log(client, user, h, full_result([], stamp="t2"))  # certificate check completed, finding resolved
    _, rows = matrix(client, h)
    assert "CRYPTO.4" not in rows


def test_other_users_findings_never_appear(client, db, make_user):
    owner, owner_h = make_user("owner")
    _, other_h = make_user("other")
    post_log(client, owner, owner_h, full_result([KEX]))
    _, rows = matrix(client, other_h)
    assert rows == {}


def test_admins_see_their_own_environment_not_everyone_elses(client, db, make_user):
    owner, owner_h = make_user("owner")
    _, admin_h = make_user("the-admin", "admin")
    post_log(client, owner, owner_h, full_result([KEX]))
    _, rows = matrix(client, admin_h)
    assert rows == {}


def test_rows_are_ordered_by_gap_severity(client, db, learner):
    user, h = learner
    post_log(client, user, h, full_result([KEX]))
    set_level(db, user, "PQC.6", "Beginner")   # high
    set_level(db, user, "PQC.3", "Beginner")   # Developing - Beginner = 1 -> medium
    body, _ = matrix(client, h)
    assert [r["gap_class"] for r in body["rows"]] == ["high", "medium", "unassessed", "unassessed"]


def test_requires_authentication(client):
    assert client.get("/api/users/me/skill-matrix").status_code == 401

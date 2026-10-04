"""Capability estimator (competency/capability.py): levels, recomputation from evidence, unknown is not zero."""
import json
from datetime import datetime, timedelta, timezone

import pytest

import models
from activities import catalogue
from competency import capability
from competency.capability import Evidence, level_for
from competency.seed import load_model, seed_competencies
from graph.projection import build_graph_projection

MODEL = load_model()
T0 = datetime(2026, 9, 1, tzinfo=timezone.utc)


def ev(aware=(), apply=(), analyse=(), practicals=()):
    """Evidence from lists of booleans per depth group; practicals as (depth, passed)."""
    e = Evidence()
    n = 0
    for depth, results in (("Aware", aware), ("Apply", apply), ("Analyse", analyse)):
        for ok in results:
            n += 1
            e.items[f"i{n}"] = (depth, ok, T0, "proposed-unreviewed")
    for k, (depth, passed) in enumerate(practicals):
        e.practicals[f"lab:{k}"] = (depth, passed, T0)
    return e


# ---------------------------------------------------------------- level rules (pure)

def test_fewer_than_three_scored_items_is_unknown_even_if_all_correct():
    assert level_for(ev(aware=[True, True]), MODEL) == "Unknown"
    assert level_for(ev(practicals=[("Apply", True)] * 5), MODEL) == "Unknown"


def test_beginner_developing_boundary_is_sixty_percent_of_aware_explain_items():
    assert level_for(ev(aware=[True, False, False]), MODEL) == "Beginner"                 # 33%
    assert level_for(ev(aware=[True, True, True, False, False]), MODEL) == "Developing"   # 60%
    assert level_for(ev(aware=[True, True, False, False, False]), MODEL) == "Beginner"   # 40%


def test_three_apply_items_without_aware_items_stay_beginner():
    # Developing is defined on Aware/Explain items; strong Apply answers alone do not skip it.
    assert level_for(ev(apply=[True, True, True]), MODEL) == "Beginner"


def test_proficient_needs_seventy_percent_on_apply_items_and_a_passed_practical():
    base = dict(aware=[True, True, True])
    assert level_for(ev(**base, apply=[True, True, True], practicals=[("Apply", True)]), MODEL) == "Proficient"
    assert level_for(ev(**base, apply=[True, True, True]), MODEL) == "Developing"                         # no practical
    assert level_for(ev(**base, apply=[True, True, True], practicals=[("Apply", False)]), MODEL) == "Developing"
    assert level_for(ev(**base, apply=[True, True, True], practicals=[("Explain", True)]), MODEL) == "Developing"  # too shallow
    assert level_for(ev(**base, apply=[True, True, False], practicals=[("Apply", True)]), MODEL) == "Developing"  # 67%


def test_advanced_needs_proficient_plus_seventy_percent_on_analyse_items():
    base = dict(aware=[True, True, True], apply=[True, True, True], practicals=[("Analyse", True)])
    assert level_for(ev(**base, analyse=[True, True, True]), MODEL) == "Advanced"
    assert level_for(ev(**base, analyse=[True, False]), MODEL) == "Proficient"
    # Analyse items alone do not make someone Advanced without the lower levels.
    assert level_for(ev(aware=[True, False, False], analyse=[True] * 5), MODEL) == "Beginner"


def test_thresholds_come_from_the_model_file():
    model = json.loads(json.dumps(MODEL))
    for level in model["capability_levels"]["levels"]:
        if level["id"] == "Developing":
            level["rule"]["min_share"] = 0.9
    assert level_for(ev(aware=[True, True, True, True, False]), MODEL) == "Developing"   # 80% >= 60%
    assert level_for(ev(aware=[True, True, True, True, False]), model) == "Beginner"     # 80% < 90%


# ---------------------------------------------------------------- recomputation from stored evidence

@pytest.fixture
def bank(db):
    seed_competencies(db)
    db.add(models.QuizModule(module_id="m1", title="M1", passing_score_percent=70, topic="pqc", reveal_answers=True))
    for i, depth in enumerate(["Aware", "Aware", "Explain", "Apply"], start=1):
        db.add(models.QuizItem(id=f"m1-q{i}", module_id="m1", prompt="p", options_json='["a","b"]', correct_index=0,
                               competency_id="PQC.6", depth=depth, tag_status="proposed-unreviewed"))
    db.add(models.QuizItem(id="m1-untagged", module_id="m1", prompt="p", options_json='["a","b"]', correct_index=0))
    db.commit()


_attempts = 0


def graded(db, user, answers, when):
    """Store a graded attempt with {item_id: correct} responses at time `when`."""
    global _attempts
    _attempts += 1
    aid = f"att-{_attempts}"
    db.add(models.QuizAttempt(id=aid, user_id=user.id, module_id="m1", status="graded", form_json="[]",
                              passing_score_percent=70, issued_at=when, graded_at=when, total_questions=len(answers)))
    for item_id, ok in answers.items():
        db.add(models.QuizResponse(attempt_id=aid, user_id=user.id, item_id=item_id, selected_original_index=0 if ok else 1,
                                   is_correct=ok, created_at=when))
    db.commit()


def cap(db, user, code="PQC.6"):
    comp = db.query(models.Competency).filter_by(code=code).one()
    return db.query(models.LearnerCapability).filter_by(user_id=user.id, competency_id=comp.id).one_or_none()


def test_scores_are_recomputed_and_can_go_down(db, bank, learner):
    user, _ = learner
    graded(db, user, {"m1-q1": True, "m1-q2": True, "m1-q3": True, "m1-q4": True}, T0)
    capability.recompute(db, user.id)
    first = cap(db, user)
    assert (first.knowledge_score, first.level) == (1.0, "Developing")  # Proficient also needs a practical

    graded(db, user, {"m1-q1": False, "m1-q2": False, "m1-q3": False, "m1-q4": True}, T0 + timedelta(days=1))
    capability.recompute(db, user.id)
    second = cap(db, user)
    assert second.knowledge_score == pytest.approx(0.25)
    assert second.level == "Beginner"
    assert second.knowledge_by_depth["aware_explain"] == {"correct": 0, "total": 3}
    assert second.knowledge_by_depth["apply"] == {"correct": 1, "total": 1}
    assert second.evidence_count == 4  # four distinct items, not eight responses
    assert second.model_version == str(MODEL["version"])


def test_only_the_latest_response_per_item_counts(db, bank, learner):
    user, _ = learner
    graded(db, user, {"m1-q1": False, "m1-q2": False, "m1-q3": False}, T0)
    graded(db, user, {"m1-q1": True}, T0 + timedelta(hours=1))
    capability.recompute(db, user.id)
    assert cap(db, user).knowledge_score == pytest.approx(1 / 3)


def test_ungraded_attempts_and_untagged_items_are_ignored(db, bank, learner):
    user, _ = learner
    graded(db, user, {"m1-untagged": True}, T0)
    db.add(models.QuizAttempt(id="issued", user_id=user.id, module_id="m1", status="issued", form_json="[]",
                              passing_score_percent=70, issued_at=T0, total_questions=1))
    db.add(models.QuizResponse(attempt_id="issued", user_id=user.id, item_id="m1-q1", selected_original_index=0, is_correct=True))
    db.commit()
    capability.recompute(db, user.id)
    assert db.query(models.LearnerCapability).count() == 0  # no evidence: no row, which reads as Unknown


def test_no_evidence_kind_is_none_not_zero(db, bank, learner):
    user, _ = learner
    graded(db, user, {"m1-q1": True, "m1-q2": False}, T0)
    capability.recompute(db, user.id)
    row = cap(db, user)
    assert row.level == "Unknown"
    assert row.procedural_score is None and row.operational_score is None and row.confidence is None
    assert row.knowledge_score == 0.5


def test_a_lab_is_passed_only_when_the_first_answer_was_correct(db, bank, learner, monkeypatch):
    user, _ = learner
    labs = {"lab-a": {"id": "lab-a", "competencies": [{"id": "PQC.6", "depth": "Apply"}]},
            "lab-b": {"id": "lab-b", "competencies": [{"id": "PQC.6", "depth": "Apply"}]}}
    monkeypatch.setattr(catalogue, "get_lab", labs.get)
    db.add_all([
        models.ActivityAttempt(user_id=user.id, activity_id="lab-a", correct=True, created_at=T0),
        models.ActivityAttempt(user_id=user.id, activity_id="lab-b", correct=False, created_at=T0),
        models.ActivityAttempt(user_id=user.id, activity_id="lab-b", correct=True, created_at=T0 + timedelta(minutes=1)),
    ])
    db.commit()
    capability.recompute(db, user.id)
    assert cap(db, user).procedural_score == 0.5


def test_mission_outcome_is_the_latest_finished_run(db, bank, learner, monkeypatch):
    user, _ = learner
    monkeypatch.setattr(catalogue, "get_mission", {"m-x": {"mission_id": "m-x", "competencies": [{"id": "PQC.6", "depth": "Analyse"}]}}.get)
    db.add_all([
        models.MissionRun(id="r1", user_id=user.id, mission_id="m-x", status="finished", band="success", state={}, created_at=T0),
        models.MissionRun(id="r2", user_id=user.id, mission_id="m-x", status="finished", band="failure", state={}, created_at=T0 + timedelta(days=1)),
        models.MissionRun(id="r3", user_id=user.id, mission_id="m-x", status="active", state={}, created_at=T0 + timedelta(days=2)),
    ])
    db.commit()
    capability.recompute(db, user.id)
    assert cap(db, user).procedural_score == 0.0


# ---------------------------------------------------------------- triggers, API and the graph

def test_grading_a_quiz_through_the_api_fills_capabilities(client, db, bank, learner):
    user, h = learner
    attempt = client.post("/api/quizzes/m1/attempts", headers=h).json()
    for q in attempt["questions"]:
        client.post(f"/api/quizzes/attempts/{attempt['attempt_id']}/answers", headers=h,
                    json={"item_id": q["item_id"], "selected_position": q["options"].index("a")})
    assert client.post(f"/api/quizzes/attempts/{attempt['attempt_id']}/submit", headers=h, json={"answers": []}).status_code == 200

    body = client.get(f"/api/users/{user.id}/capabilities", headers=h).json()
    assert [(c["competency_code"], c["level"], c["knowledge_score"]) for c in body] == [("PQC.6", "Developing", 1.0)]
    assert body[0]["competency_name"] == "hybrid modes and crypto-agility"
    assert body[0]["procedural_score"] is None

    # The exposure-graph recommender (Candidate B) receives the estimate.
    graph = build_graph_projection(db, user.id)
    comp = db.query(models.Competency).filter_by(code="PQC.6").one()
    edge = next(e for e in graph.edges if e.relationship == "HAS_CAPABILITY" and e.target_id == f"comp_{comp.id}")
    assert edge.properties["knowledge_score"] == 1.0


def test_capabilities_of_another_user_stay_forbidden(client, make_user):
    _, h = make_user("first")
    other, _ = make_user("second")
    assert client.get(f"/api/users/{other.id}/capabilities", headers=h).status_code == 403


def test_a_failed_recompute_does_not_fail_the_learners_action(db, learner, monkeypatch, caplog):
    user, _ = learner

    def boom(*a, **k):
        raise RuntimeError("estimator bug")
    monkeypatch.setattr(capability, "recompute", boom)
    capability.refresh(db, user.id, {"PQC.6"})
    assert "capability recompute failed" in caplog.text

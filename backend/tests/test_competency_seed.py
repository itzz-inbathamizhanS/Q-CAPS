from sqlalchemy import inspect, text

import database
import models
from competency.seed import load_model, model_competencies, seed_competencies


def test_every_model_competency_is_seeded(db):
    model = load_model()
    expected = {c["code"]: c["name"] for c in model_competencies(model)}
    assert expected  # 44 competencies in 8 domains in proposed-v1

    result = seed_competencies(db, model)

    rows = {c.code: c for c in db.query(models.Competency).all()}
    assert result["created"] == len(expected)
    assert {code: c.name for code, c in rows.items()} == expected
    assert {c.model_version for c in rows.values()} == {str(model["version"])}


def test_seeding_twice_changes_nothing(db):
    seed_competencies(db)
    count = db.query(models.Competency).count()

    again = seed_competencies(db)

    assert db.query(models.Competency).count() == count
    assert again["created"] == again["updated"] == 0
    assert again["unchanged"] == count


def test_seeding_updates_a_renamed_competency_and_keeps_retired_ones(db):
    model = load_model()
    seed_competencies(db, model)
    db.add(models.Competency(code="OLD.1", name="retired competency"))
    db.commit()
    model["domains"][0]["competencies"][0]["name"] = "renamed"
    first_code = model["domains"][0]["competencies"][0]["id"]

    result = seed_competencies(db, model)

    assert result["updated"] == 1
    assert db.query(models.Competency).filter_by(code=first_code).one().name == "renamed"
    assert db.query(models.Competency).filter_by(code="OLD.1").one() is not None


def test_existing_database_gains_the_column_without_losing_rows(db):
    db.close()
    with database.engine.begin() as conn:
        conn.execute(text("DROP TABLE competencies"))
        conn.execute(text(
            "CREATE TABLE competencies (id INTEGER PRIMARY KEY, code VARCHAR NOT NULL UNIQUE, name VARCHAR NOT NULL, "
            "description VARCHAR, prerequisites JSON, evidence_requirements JSON)"
        ))
        conn.execute(text("INSERT INTO competencies (code, name) VALUES ('PQC.6', 'old name')"))

    database.ensure_schema()

    cols = {c["name"] for c in inspect(database.engine).get_columns("competencies")}
    assert "model_version" in cols
    with database.SessionLocal() as session:
        row = session.query(models.Competency).filter_by(code="PQC.6").one()
        old_id = row.id
        seed_competencies(session)
        row = session.query(models.Competency).filter_by(code="PQC.6").one()
        assert row.id == old_id  # same row, updated in place
        assert row.model_version is not None

"""Load the competency model (content/curriculum/competency_model.json) into the competencies table.

    python -m competency.seed            # from backend/main_api

Idempotent upsert keyed on Competency.code (the model's competency id, e.g. "PQC.6"). Rows whose code is no longer
in the model are kept, because interventions and capability rows may reference them; they simply stop being
updated. The domain is the code prefix ("PQC" in "PQC.6"), so it needs no column. model_version records which
version of the model last wrote each row.
"""
import json
import os
from pathlib import Path
from typing import Dict, List

from sqlalchemy.orm import Session

import models

MODEL_PATH = Path(os.getenv("QCAPS_COMPETENCY_MODEL", Path(__file__).resolve().parents[3] / "content" / "curriculum" / "competency_model.json"))


def load_model(path: Path = MODEL_PATH) -> dict:
    with open(path, encoding="utf-8") as f:
        model = json.load(f)
    if not isinstance(model.get("domains"), list) or not model.get("version"):
        raise ValueError(f"{path} is not a competency model (needs 'version' and a 'domains' list)")
    return model


def model_competencies(model: dict) -> List[Dict[str, str]]:
    rows, seen = [], set()
    for domain in model["domains"]:
        for c in domain.get("competencies", []):
            code, name = c.get("id"), c.get("name")
            if not code or not name:
                raise ValueError(f"competency without id or name in domain {domain.get('id')!r}: {c!r}")
            if code in seen:
                raise ValueError(f"duplicate competency id {code!r}")
            seen.add(code)
            rows.append({"code": code, "name": name, "description": c.get("description"), "domain": domain.get("id")})
    return rows


def seed_competencies(db: Session, model: dict = None) -> dict:
    """Insert or update every competency in the model. Returns counts."""
    model = model or load_model()
    version = str(model["version"])
    existing = {c.code: c for c in db.query(models.Competency).all()}
    created = updated = unchanged = 0
    for row in model_competencies(model):
        current = existing.get(row["code"])
        if current is None:
            db.add(models.Competency(code=row["code"], name=row["name"], description=row["description"], model_version=version))
            created += 1
        elif (current.name, current.description, current.model_version) != (row["name"], row["description"], version):
            current.name, current.description, current.model_version = row["name"], row["description"], version
            updated += 1
        else:
            unchanged += 1
    db.commit()
    return {"model_version": version, "created": created, "updated": updated, "unchanged": unchanged}


if __name__ == "__main__":
    from database import Base, SessionLocal, engine, ensure_schema

    Base.metadata.create_all(bind=engine)
    ensure_schema()
    with SessionLocal() as session:
        print(seed_competencies(session))

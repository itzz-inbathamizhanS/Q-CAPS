from sqlalchemy import create_engine, inspect, text
from sqlalchemy.pool import StaticPool
import os
from sqlalchemy.orm import declarative_base, sessionmaker

DATABASE_URL = os.environ.get("QCAPS_DATABASE_URL", "sqlite:///./qcaps.db")

_engine_kwargs = {"connect_args": {"check_same_thread": False}}
if DATABASE_URL in ("sqlite://", "sqlite:///:memory:"):
    # In-memory SQLite is per-connection; share one connection (used by tests).
    _engine_kwargs["poolclass"] = StaticPool

engine = create_engine(DATABASE_URL, **_engine_kwargs)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def ensure_schema():
    """Idempotent additive changes that create_all() cannot apply to existing tables."""
    insp = inspect(engine)
    tables = set(insp.get_table_names())
    with engine.begin() as conn:
        if "users" in tables:
            cols = {c["name"] for c in insp.get_columns("users")}
            if "role" not in cols:
                conn.execute(text("ALTER TABLE users ADD COLUMN role VARCHAR NOT NULL DEFAULT 'learner'"))
            if engine.dialect.name == "sqlite":
                # SQLite cannot add a CHECK to an existing table; triggers give existing
                # databases the same guarantee as the model's ck_users_role constraint.
                for trigger, event in (("insert", "INSERT"), ("update", "UPDATE OF role")):
                    conn.execute(text(
                        f"CREATE TRIGGER IF NOT EXISTS trg_users_role_{trigger} BEFORE {event} ON users "
                        "WHEN NEW.role NOT IN ('learner', 'admin') "
                        "BEGIN SELECT RAISE(ABORT, 'invalid role'); END"
                    ))
        if "assets" in tables:
            cols = {c["name"] for c in insp.get_columns("assets")}
            if "owner_user_id" not in cols:
                conn.execute(text("ALTER TABLE assets ADD COLUMN owner_user_id INTEGER"))
            conn.execute(text("CREATE INDEX IF NOT EXISTS ix_assets_owner_user_id ON assets (owner_user_id)"))
        if "findings" in tables:
            cols = {c["name"] for c in insp.get_columns("findings")}
            if "title" not in cols:
                conn.execute(text("ALTER TABLE findings ADD COLUMN title VARCHAR"))
        if "competencies" in tables:
            cols = {c["name"] for c in insp.get_columns("competencies")}
            if "model_version" not in cols:
                conn.execute(text("ALTER TABLE competencies ADD COLUMN model_version VARCHAR"))
        if "learner_capabilities" in tables:
            cols = {c["name"] for c in insp.get_columns("learner_capabilities")}
            for name, sql_type in (("knowledge_by_depth", "JSON"), ("evidence_count", "INTEGER"),
                                   ("last_evidence_at", "DATETIME"), ("level", "VARCHAR"), ("model_version", "VARCHAR")):
                if name not in cols:
                    conn.execute(text(f"ALTER TABLE learner_capabilities ADD COLUMN {name} {sql_type}"))
        if "quiz_items" in tables:
            cols = {c["name"] for c in insp.get_columns("quiz_items")}
            if "tag_status" not in cols:
                conn.execute(text("ALTER TABLE quiz_items ADD COLUMN tag_status VARCHAR"))
        if "sections" in tables:
            cols = {c["name"] for c in insp.get_columns("sections")}
            if "summary" not in cols:
                conn.execute(text("ALTER TABLE sections ADD COLUMN summary VARCHAR(300)"))
            if "estimated_minutes" not in cols:
                conn.execute(text("ALTER TABLE sections ADD COLUMN estimated_minutes INTEGER"))
            if "sources" not in cols:
                conn.execute(text("ALTER TABLE sections ADD COLUMN sources JSON"))
            if "needs_verification" not in cols:
                conn.execute(text("ALTER TABLE sections ADD COLUMN needs_verification JSON"))
            # Progress left behind by sections deleted before the admin API cleaned it up (SQLite does
            # not enforce the ON DELETE CASCADE). Such rows point at nothing, or at a reused id.
            for table in ("checkpoint_passes", "section_completions"):
                if table in tables:
                    conn.execute(text(
                        f"DELETE FROM {table} WHERE section_id NOT IN (SELECT id FROM sections)"
                    ))

from datetime import datetime, timezone
from sqlalchemy import Boolean, CheckConstraint, Column, DateTime, Float, Index, Integer, String, Text, ForeignKey, JSON, UniqueConstraint
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, unique=True, index=True)
    hashed_password = Column(String, nullable=False)
    xp = Column(Integer, default=0)
    progress_data = Column(Text, nullable=True, default="{}")
    # Authoritative role, only ever changed server-side (CLI). Never read from a client.
    role = Column(String, nullable=False, default="learner", server_default="learner")

    __table_args__ = (
        CheckConstraint("role IN ('learner', 'admin')", name="ck_users_role"),
    )

class QuizScore(Base):
    __tablename__ = "quiz_scores"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False)
    topic = Column(String, nullable=False)
    score = Column(Float, nullable=False)
    correct_answers = Column(Integer, nullable=False)
    total_questions = Column(Integer, nullable=False)
    created_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc)
    )

class ScannerLog(Base):
    __tablename__ = "scanner_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False)
    endpoint = Column(String, nullable=False)
    status = Column(String, nullable=False)
    vulnerabilities_found = Column(Integer, default=0)
    details = Column(Text, nullable=True)
    created_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc)
    )

# --- V2 SCANNER MODELS ---

class ScanTarget(Base):
    __tablename__ = "scan_targets"
    id = Column(Integer, primary_key=True, index=True)
    hostname = Column(String, nullable=False, index=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class EvidenceCapsule(Base):
    __tablename__ = "evidence_capsules"
    id = Column(String, primary_key=True, index=True) # UUID
    target_id = Column(Integer, ForeignKey("scan_targets.id"))
    fingerprint_hash = Column(String, nullable=False, index=True)
    exposure_state = Column(String, nullable=False)
    full_capsule_json = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class CryptoDelta(Base):
    __tablename__ = "crypto_deltas"
    id = Column(Integer, primary_key=True, index=True)
    baseline_capsule_id = Column(String, ForeignKey("evidence_capsules.id"))
    current_capsule_id = Column(String, ForeignKey("evidence_capsules.id"))
    verification_status = Column(String, nullable=False)
    delta_json = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

# --- CANDIDATE A: CLOSURE LOOP MODELS ---

class Asset(Base):
    __tablename__ = "assets"
    id = Column(Integer, primary_key=True, index=True)
    organization_id = Column(Integer, index=True)
    canonical_target = Column(String, nullable=False, index=True)
    asset_type = Column(String, nullable=False)
    criticality = Column(Float, default=1.0)
    confidentiality_lifetime = Column(Integer, default=0) # Days
    owner_role = Column(String, nullable=True)
    # Set for assets created from a verified scan; NULL for shared/admin-managed assets.
    owner_user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

class Evidence(Base):
    __tablename__ = "evidence"
    id = Column(String, primary_key=True, index=True) # UUID
    scan_id = Column(String, index=True)
    asset_id = Column(Integer, ForeignKey("assets.id"))
    evidence_type = Column(String, nullable=False)
    normalized_payload = Column(JSON, nullable=False)
    payload_hash = Column(String, nullable=False, index=True)
    scanner_version = Column(String, nullable=False)
    classifier_version = Column(String, nullable=False)
    observed_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    confidence = Column(Float, nullable=False)
    authorization_context = Column(String, nullable=True)

class Finding(Base):
    __tablename__ = "findings"
    id = Column(String, primary_key=True, index=True) # UUID
    asset_id = Column(Integer, ForeignKey("assets.id"))
    evidence_id = Column(String, ForeignKey("evidence.id"))
    finding_type = Column(String, nullable=False)
    algorithm = Column(String, nullable=True)
    protocol = Column(String, nullable=True)
    severity = Column(Float, nullable=False)
    confidence = Column(Float, nullable=False)
    title = Column(String, nullable=True)
    migration_urgency = Column(Float, default=1.0)
    status = Column(String, nullable=False, default="OPEN")
    first_seen = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    last_seen = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class FindingRequirement(Base):
    """A requirement a finding creates and one competency it needs, derived from content/curriculum/requirement_map.json
    (competency/requirements.py). Rows are kept per map version so a result can be traced to the map that produced it."""
    __tablename__ = "finding_requirements"
    __table_args__ = (
        UniqueConstraint("finding_id", "requirement_id", "competency_code", "map_version", name="uq_finding_requirement"),
    )
    id = Column(Integer, primary_key=True)
    finding_id = Column(String, ForeignKey("findings.id"), nullable=False, index=True)
    requirement_id = Column(String, nullable=False)
    competency_code = Column(String, nullable=False, index=True)  # Competency.code, e.g. "PQC.6"
    required_level = Column(String, nullable=False)
    map_version = Column(String, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class Competency(Base):
    __tablename__ = "competencies"
    id = Column(Integer, primary_key=True, index=True)
    code = Column(String, nullable=False, unique=True)
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    prerequisites = Column(JSON, nullable=True)
    evidence_requirements = Column(JSON, nullable=True)
    # Version of content/curriculum/competency_model.json that last wrote this row (competency/seed.py).
    model_version = Column(String, nullable=True)

class LearnerCapability(Base):
    __tablename__ = "learner_capabilities"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    competency_id = Column(Integer, ForeignKey("competencies.id"))
    knowledge_score = Column(Float, default=0.0)
    procedural_score = Column(Float, default=0.0)
    operational_score = Column(Float, default=0.0)
    confidence = Column(Float, default=0.0)
    freshness = Column(Float, default=1.0)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

class Intervention(Base):
    __tablename__ = "interventions"
    id = Column(String, primary_key=True, index=True) # UUID
    finding_id = Column(String, ForeignKey("findings.id"))
    competency_id = Column(Integer, ForeignKey("competencies.id"))
    intervention_type = Column(String, nullable=False)
    module_id = Column(String, nullable=True)
    lab_template_id = Column(String, nullable=True)
    minimum_score = Column(Float, default=0.8)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class Verification(Base):
    __tablename__ = "verifications"
    id = Column(String, primary_key=True, index=True) # UUID
    intervention_id = Column(String, ForeignKey("interventions.id"))
    before_evidence_id = Column(String, ForeignKey("evidence.id"))
    after_evidence_id = Column(String, ForeignKey("evidence.id"))
    technical_result = Column(JSON, nullable=False)
    learner_result = Column(JSON, nullable=False)
    verifier_version = Column(String, nullable=False)
    verified_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class ClosureEvent(Base):
    __tablename__ = "closure_events"
    id = Column(String, primary_key=True, index=True) # UUID
    finding_id = Column(String, ForeignKey("findings.id"))
    intervention_id = Column(String, ForeignKey("interventions.id"))
    verification_id = Column(String, ForeignKey("verifications.id"))
    previous_state = Column(String, nullable=False)
    new_state = Column(String, nullable=False)
    reason = Column(String, nullable=False)
    event_hash = Column(String, nullable=False, unique=True)
    previous_event_hash = Column(String, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


# --- COURSE CONTENT (tracks -> modules -> sections) ---

def _utcnow():
    return datetime.now(timezone.utc)


class CourseTrack(Base):
    __tablename__ = "tracks"
    __table_args__ = (
        CheckConstraint("status IN ('draft', 'published')", name="ck_tracks_status"),
    )

    id = Column(Integer, primary_key=True)
    slug = Column(String(100), nullable=False, unique=True)
    code = Column(String(50), nullable=False)
    title = Column(String(200), nullable=False)
    subtitle = Column(String(300), nullable=True)
    description = Column(Text, nullable=True)
    accent_color = Column(String(20), nullable=True)
    meta = Column(JSON, nullable=True)  # certificate / capstone / entry-profile fields
    status = Column(String(20), nullable=False, default="draft", server_default="draft", index=True)
    sort_order = Column(Integer, nullable=False, default=0)
    imported_hash = Column(String(64), nullable=True)  # NULL = owned by an admin edit
    created_at = Column(DateTime, nullable=False, default=_utcnow)
    updated_at = Column(DateTime, nullable=False, default=_utcnow, onupdate=_utcnow)

    modules = relationship(
        "CourseModule", back_populates="track",
        cascade="all, delete-orphan", order_by="CourseModule.sort_order",
    )


class CourseModule(Base):
    __tablename__ = "modules"
    __table_args__ = (
        CheckConstraint("status IN ('draft', 'published')", name="ck_modules_status"),
        Index("ix_modules_track_order", "track_id", "sort_order"),
    )

    id = Column(Integer, primary_key=True)
    slug = Column(String(150), nullable=False, unique=True)
    track_id = Column(Integer, ForeignKey("tracks.id", ondelete="CASCADE"), nullable=False, index=True)
    code = Column(String(20), nullable=False)
    title = Column(String(200), nullable=False)
    subtitle = Column(String(300), nullable=True)
    level = Column(String(30), nullable=True)
    estimated_minutes = Column(Integer, nullable=False, default=0)
    xp = Column(Integer, nullable=False, default=0)
    recommendation_topic = Column(String(100), nullable=True)
    domain = Column(String(100), nullable=True)
    prerequisites = Column(JSON, nullable=False, default=list)
    unlocks = Column(String(150), nullable=True)
    learning_objectives = Column(JSON, nullable=False, default=list)
    wrap_up = Column(JSON, nullable=True)
    status = Column(String(20), nullable=False, default="draft", server_default="draft", index=True)
    sort_order = Column(Integer, nullable=False, default=0)
    imported_hash = Column(String(64), nullable=True)
    created_at = Column(DateTime, nullable=False, default=_utcnow)
    updated_at = Column(DateTime, nullable=False, default=_utcnow, onupdate=_utcnow)

    track = relationship("CourseTrack", back_populates="modules")
    sections = relationship(
        "CourseSection", back_populates="module",
        cascade="all, delete-orphan", order_by="CourseSection.sort_order",
    )


class CourseSection(Base):
    __tablename__ = "sections"
    __table_args__ = (
        CheckConstraint("status IN ('draft', 'published')", name="ck_sections_status"),
        UniqueConstraint("module_id", "slug", name="uq_sections_module_slug"),
        Index("ix_sections_module_order", "module_id", "sort_order"),
    )

    id = Column(Integer, primary_key=True)
    slug = Column(String(100), nullable=False)
    module_id = Column(Integer, ForeignKey("modules.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(200), nullable=False)
    summary = Column(String(300), nullable=True)  # one-line blurb for the module overview
    estimated_minutes = Column(Integer, nullable=True)
    blocks = Column(JSON, nullable=False, default=list)  # validated list of blocks
    # Book/standard references behind the lesson: [{book_id, title, authors, edition, year, locator, note}]
    sources = Column(JSON, nullable=True)
    # {"reason": str, "checked_on": "YYYY-MM-DD"?}: the source may be out of date for what the section states.
    needs_verification = Column(JSON, nullable=True)
    status = Column(String(20), nullable=False, default="draft", server_default="draft", index=True)
    sort_order = Column(Integer, nullable=False, default=0)
    imported_hash = Column(String(64), nullable=True)
    created_at = Column(DateTime, nullable=False, default=_utcnow)
    updated_at = Column(DateTime, nullable=False, default=_utcnow, onupdate=_utcnow)

    module = relationship("CourseModule", back_populates="sections")


class ContentAuditLog(Base):
    __tablename__ = "content_audit_log"
    __table_args__ = (
        Index("ix_content_audit_entity", "entity_type", "entity_id"),
    )

    id = Column(Integer, primary_key=True)
    actor_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    action = Column(String(20), nullable=False)       # create | update | delete | reorder
    entity_type = Column(String(20), nullable=False)  # track | module | section
    entity_id = Column(Integer, nullable=True)        # not an FK: the row may be deleted
    before = Column(JSON, nullable=True)
    after = Column(JSON, nullable=True)
    created_at = Column(DateTime, nullable=False, default=_utcnow, index=True)


# --- LEARNER PROGRESS THROUGH COURSE SECTIONS (server-authoritative) ---

class CheckpointPass(Base):
    """A learner answered a checkpoint correctly. Written only by the backend grader."""
    __tablename__ = "checkpoint_passes"
    __table_args__ = (
        UniqueConstraint("user_id", "section_id", "block_id", name="uq_checkpoint_pass"),
        Index("ix_checkpoint_passes_user_section", "user_id", "section_id"),
    )

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    section_id = Column(Integer, ForeignKey("sections.id", ondelete="CASCADE"), nullable=False)
    block_id = Column(String(40), nullable=False)
    passed_at = Column(DateTime, nullable=False, default=_utcnow)


class SectionCompletion(Base):
    """Explicit completion of a section that has no checkpoint (reading/watching only)."""
    __tablename__ = "section_completions"
    __table_args__ = (
        UniqueConstraint("user_id", "section_id", name="uq_section_completion"),
    )

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    section_id = Column(Integer, ForeignKey("sections.id", ondelete="CASCADE"), nullable=False, index=True)
    completed_at = Column(DateTime, nullable=False, default=_utcnow)

class QuizModule(Base):
    """Quiz metadata. Seeded from content/Quizzes; topic feeds the legacy QuizScore rows."""
    __tablename__ = "quiz_modules"

    module_id = Column(String, primary_key=True)
    title = Column(String, nullable=False)
    difficulty = Column(String, nullable=True)
    passing_score_percent = Column(Integer, nullable=False, default=70)
    topic = Column(String, nullable=False)
    # When False, a graded attempt reports only correct/incorrect, not the key or explanation.
    reveal_answers = Column(Boolean, nullable=False, default=True)


class QuizItem(Base):
    """One question. correct_index is server-side only and must never be serialised to clients."""
    __tablename__ = "quiz_items"

    id = Column(String, primary_key=True)
    module_id = Column(String, ForeignKey("quiz_modules.module_id"), nullable=False, index=True)
    prompt = Column(Text, nullable=False)
    options_json = Column(Text, nullable=False)
    correct_index = Column(Integer, nullable=False)
    explanation = Column(Text, nullable=True)
    # Filled in by curriculum tagging (Phase 2/5); nullable until then.
    competency_id = Column(String, nullable=True)
    depth = Column(String, nullable=True)
    lesson_id = Column(String, nullable=True)
    # proposed-unreviewed | reviewed | no-competency. Capability estimates report how many of their items were reviewed.
    tag_status = Column(String, nullable=True)
    active = Column(Boolean, nullable=False, default=True)


class QuizAttempt(Base):
    """A server-issued quiz form and its grading outcome."""
    __tablename__ = "quiz_attempts"

    id = Column(String, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    module_id = Column(String, ForeignKey("quiz_modules.module_id"), nullable=False, index=True)
    status = Column(String, nullable=False, default="issued")  # issued | graded | expired
    # [{"item_id": str, "order": [original option index shown at each position]}]
    form_json = Column(Text, nullable=False)
    passing_score_percent = Column(Integer, nullable=False)
    issued_at = Column(DateTime, nullable=False)
    graded_at = Column(DateTime, nullable=True)
    total_questions = Column(Integer, nullable=False)
    correct_answers = Column(Integer, nullable=True)
    score_percent = Column(Float, nullable=True)
    passed = Column(Boolean, nullable=True)
    xp_awarded = Column(Integer, nullable=False, default=0)


class QuizResponse(Base):
    """One answer within a graded attempt (unanswered items are stored with NULL selection)."""
    __tablename__ = "quiz_responses"

    id = Column(Integer, primary_key=True, index=True)
    attempt_id = Column(String, ForeignKey("quiz_attempts.id"), nullable=False, index=True)
    user_id = Column(Integer, nullable=False, index=True)
    item_id = Column(String, ForeignKey("quiz_items.id"), nullable=False, index=True)
    selected_original_index = Column(Integer, nullable=True)
    is_correct = Column(Boolean, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class ActivityCompletion(Base):
    """A practice lab or mission a learner has completed. The server awards XP and the badge,
    once per user and activity, so the client cannot claim them."""
    __tablename__ = "activity_completions"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    kind = Column(String, nullable=False)           # "lab" or "mission"
    activity_id = Column(String, nullable=False)
    xp_awarded = Column(Integer, nullable=False, default=0)
    badge = Column(String, nullable=True)
    completed_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    __table_args__ = (
        UniqueConstraint("user_id", "kind", "activity_id", name="uq_activity_completion"),
        CheckConstraint("kind IN ('lab', 'mission')", name="ck_activity_kind"),
    )


class MissionRun(Base):
    """One play-through of a mission. The state (variables, answers, hidden simulation data) lives
    here, so the outcome is computed by the server from the learner's choices."""
    __tablename__ = "mission_runs"

    id = Column(String, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    mission_id = Column(String, nullable=False)
    status = Column(String, nullable=False, default="active")   # "active" or "finished"
    state = Column(JSON, nullable=False)
    band = Column(String, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class ActivityAttempt(Base):
    """Every graded lab answer, so the XP of a lab can fall with the number of wrong answers before the right one."""
    __tablename__ = "activity_attempts"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    activity_id = Column(String, nullable=False, index=True)
    correct = Column(Boolean, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

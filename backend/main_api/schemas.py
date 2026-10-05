from datetime import datetime
from typing import Optional, List, Dict, Any, Union
import json
import unicodedata

from pydantic import BaseModel, Field, field_validator

MIN_PASSWORD_LENGTH = 8
MAX_PROGRESS_BYTES = 64 * 1024


class UserCreate(BaseModel):
    # Validated here because the name is shown to other users (leaderboard) and is the login key.
    name: str = Field(max_length=100)
    password: str = Field(min_length=MIN_PASSWORD_LENGTH, max_length=256)

    @field_validator("name")
    @classmethod
    def _clean_name(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("name must not be blank")
        if any(unicodedata.category(ch).startswith("C") for ch in v):
            raise ValueError("name must not contain control characters")
        return v

class UserLogin(BaseModel):
    name: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user_id: int
    user_name: str

class UserOut(BaseModel):
    id: int
    name: str
    xp: int
    readiness_score: Optional[int] = None  # None = no graded quiz evidence yet (unknown, not 0)
    global_rank: int
    progress_data: Optional[str] = "{}"

    class Config:
        orm_mode = True
        from_attributes = True

class ProgressUpdate(BaseModel):
    progress_data: str = Field(max_length=MAX_PROGRESS_BYTES)

    @field_validator("progress_data")
    @classmethod
    def _json_object(cls, v: str) -> str:
        try:
            parsed = json.loads(v)
        except ValueError:
            raise ValueError("progress_data must be a JSON object")
        if not isinstance(parsed, dict):
            raise ValueError("progress_data must be a JSON object")
        return v

class QuizSubmission(BaseModel):
    user_id: int
    topic: str
    correct_answers: int
    total_questions: int

class QuizScoreOut(BaseModel):
    id: int
    user_id: int
    topic: str
    score: float
    correct_answers: int
    total_questions: int
    created_at: datetime

    class Config:
        orm_mode = True
        from_attributes = True

class ScannerLogCreate(BaseModel):
    user_id: int
    endpoint: str = Field(max_length=300)
    status: str = Field(max_length=100)
    # Ignored: the server counts findings in the verified details. Kept for older clients.
    vulnerabilities_found: int = 0
    details: str = Field(max_length=256 * 1024)
    # Signed by the scanner over `details` (see scan_receipts.py).
    receipt: Optional[str] = Field(default=None, max_length=2048)

class ScannerLogSummary(BaseModel):
    id: int
    target: str
    created_at: datetime
    schema_version: Optional[int] = None
    mode: Optional[str] = None
    counts: Dict[str, int]
    key_exchange: Optional[str] = None
    findings: int

class ScannerLogOut(BaseModel):
    id: int
    user_id: int
    endpoint: str
    status: str
    vulnerabilities_found: int
    details: Optional[str]
    created_at: datetime
    xp_awarded: Optional[int] = None

    class Config:
        orm_mode = True
        from_attributes = True

class RecommendationOut(BaseModel):
    course_id: Optional[str] = None
    title: Optional[str] = None
    topic: Optional[str] = None
    priority: str
    reason: str
    quiz_score: Optional[float] = None
    scanner_risk: Optional[str] = None
    status: str = "recommendation"
    graph_paths: List[Dict[str, Any]] = []

# --- V2 SCANNER SCHEMAS ---

class EvidenceCapsuleCreate(BaseModel):
    scan_id: str
    target: str
    fingerprint_hash: str
    exposure_state: str
    full_capsule_json: Dict[str, Any]

class EvidenceCapsuleOut(BaseModel):
    id: str
    target_id: int
    fingerprint_hash: str
    exposure_state: str
    full_capsule_json: Dict[str, Any]
    created_at: datetime

    class Config:
        orm_mode = True
        from_attributes = True

class CryptoDeltaCreate(BaseModel):
    baseline_capsule_id: str
    current_capsule_id: str
    verification_status: str
    delta_json: Dict[str, Any]

class CryptoDeltaOut(BaseModel):
    id: int
    baseline_capsule_id: str
    current_capsule_id: str
    verification_status: str
    delta_json: Dict[str, Any]
    created_at: datetime

    class Config:
        orm_mode = True
        from_attributes = True

# --- CANDIDATE A: CLOSURE LOOP SCHEMAS ---

class AssetBase(BaseModel):
    organization_id: Optional[int] = None
    canonical_target: str
    asset_type: str
    criticality: float = 1.0
    confidentiality_lifetime: int = 0
    owner_role: Optional[str] = None

class AssetCreate(AssetBase):
    pass

class AssetOut(AssetBase):
    id: int
    created_at: datetime
    updated_at: datetime
    class Config:
        from_attributes = True

class EvidenceBase(BaseModel):
    scan_id: Optional[str] = None
    asset_id: Optional[int] = None
    evidence_type: str
    normalized_payload: Dict[str, Any]
    payload_hash: str
    scanner_version: str
    classifier_version: str
    confidence: float
    authorization_context: Optional[str] = None

class EvidenceCreate(EvidenceBase):
    pass

class EvidenceOut(EvidenceBase):
    id: str
    observed_at: datetime
    class Config:
        from_attributes = True

class FindingBase(BaseModel):
    asset_id: Optional[int] = None
    title: Optional[str] = None
    evidence_id: Optional[str] = None
    finding_type: str
    algorithm: Optional[str] = None
    protocol: Optional[str] = None
    severity: float
    confidence: float
    status: str = "OPEN"

class FindingCreate(FindingBase):
    pass

class FindingOut(FindingBase):
    id: str
    first_seen: datetime
    last_seen: datetime
    class Config:
        from_attributes = True

class ScannerAssetOut(BaseModel):
    id: int
    target: str
    created_at: datetime
    open_findings: int
    resolved_findings: int
    last_scanned: Optional[datetime] = None


class DrivingFinding(BaseModel):
    finding_id: str
    finding_type: str
    title: Optional[str] = None
    severity: float
    requirement_id: str
    required_level: str


class SkillMatrixRow(BaseModel):
    competency_code: str
    competency_name: Optional[str] = None
    required_level: Optional[str] = None  # None: no current requirement from the learner's open findings
    demonstrated_level: str  # Unknown when there is not enough evidence
    gap: Optional[Union[int, str]] = None  # rank difference, "unassessed" when demonstrated is Unknown, None without a requirement
    gap_class: Optional[str] = None  # critical | high | medium | none | unassessed (v1 rule, a hypothesis)
    driving_findings: List[DrivingFinding]
    evidence_count: int
    last_evidence_at: Optional[datetime] = None
    knowledge_score: Optional[float] = None
    procedural_score: Optional[float] = None


class SkillMatrixOut(BaseModel):
    competency_model_version: str
    levels_status: Optional[str] = None
    requirement_map_version: str
    requirement_map_status: str
    rows: List[SkillMatrixRow]


class FindingRequirementOut(BaseModel):
    requirement_id: str
    requirement: Optional[str] = None  # None when the row comes from an older map version than the one loaded
    pqc_relevant: Optional[bool] = None
    rationale: Optional[str] = None
    competency_code: str
    competency_name: Optional[str] = None
    required_level: str
    map_version: str
    map_status: Optional[str] = None  # e.g. "proposed-unreviewed": the mapping is a draft until experts review it


class ScannerFindingOut(BaseModel):
    id: str
    finding_type: str
    title: Optional[str] = None
    severity: str
    algorithm: Optional[str] = None
    status: str
    first_seen: datetime
    last_seen: datetime


class CompetencyBase(BaseModel):
    code: str
    name: str
    description: Optional[str] = None
    prerequisites: Optional[Dict[str, Any]] = None
    evidence_requirements: Optional[Dict[str, Any]] = None

class CompetencyCreate(CompetencyBase):
    pass

class CompetencyOut(CompetencyBase):
    id: int
    class Config:
        from_attributes = True

class LearnerCapabilityOut(BaseModel):
    """Estimated by competency/capability.py from stored evidence. None means no evidence of that kind."""
    id: int
    user_id: int
    competency_id: int
    competency_code: Optional[str] = None
    competency_name: Optional[str] = None
    knowledge_score: Optional[float] = None
    procedural_score: Optional[float] = None
    operational_score: Optional[float] = None
    confidence: Optional[float] = None
    freshness: Optional[float] = None
    knowledge_by_depth: Optional[dict] = None
    evidence_count: Optional[int] = None
    last_evidence_at: Optional[datetime] = None
    level: Optional[str] = None
    model_version: Optional[str] = None
    updated_at: datetime
    class Config:
        from_attributes = True

class InterventionBase(BaseModel):
    finding_id: Optional[str] = None
    competency_id: Optional[int] = None
    intervention_type: str
    module_id: Optional[str] = None
    lab_template_id: Optional[str] = None
    minimum_score: float = 0.8

class InterventionCreate(InterventionBase):
    pass

class InterventionOut(InterventionBase):
    id: str
    created_at: datetime
    class Config:
        from_attributes = True

class VerificationBase(BaseModel):
    intervention_id: Optional[str] = None
    before_evidence_id: Optional[str] = None
    after_evidence_id: Optional[str] = None
    technical_result: Dict[str, Any]
    learner_result: Dict[str, Any]
    verifier_version: str

class VerificationCreate(VerificationBase):
    pass

class VerificationOut(VerificationBase):
    id: str
    verified_at: datetime
    class Config:
        from_attributes = True

class ClosureEventBase(BaseModel):
    finding_id: Optional[str] = None
    intervention_id: Optional[str] = None
    verification_id: Optional[str] = None
    previous_state: str
    new_state: str
    reason: str
    event_hash: str
    previous_event_hash: Optional[str] = None

class ClosureEventCreate(ClosureEventBase):
    pass

class ClosureEventOut(ClosureEventBase):
    id: str
    created_at: datetime
    class Config:
        from_attributes = True

class QuizAttemptQuestion(BaseModel):
    item_id: str
    prompt: str
    options: List[str]  # already in the order shown to the learner; no answer key
    domain: Optional[str] = None  # reporting group of a diagnostic item


class QuizAttemptOut(BaseModel):
    attempt_id: str
    module_id: str
    title: str
    passing_score_percent: int
    total_questions: int
    issued_at: datetime
    expires_at: datetime
    questions: List[QuizAttemptQuestion]
    kind: Optional[str] = None  # "diagnostic" for the baseline/reassessment instrument
    attempt_purpose: Optional[str] = None  # diagnostic_pre | diagnostic_post, decided by the server


class DiagnosticDomainResult(BaseModel):
    domain: str
    total_questions: int
    correct_count: int
    percentage: int


class DiagnosticResult(BaseModel):
    attempt_id: str
    module_id: str
    attempt_purpose: Optional[str] = None
    graded_at: datetime
    total_questions: int
    correct_answers: int
    score_percent: float
    domains: List[DiagnosticDomainResult]


class QuizAnswerIn(BaseModel):
    item_id: str
    selected_position: int = Field(ge=0, le=50)


class QuizAttemptSubmit(BaseModel):
    answers: List[QuizAnswerIn] = Field(default_factory=list, max_length=200)


class QuizItemResult(BaseModel):
    item_id: str
    selected_position: Optional[int] = None
    correct: bool
    correct_position: Optional[int] = None  # only when the module reveals answers
    explanation: Optional[str] = None       # only when the module reveals answers


class QuizAttemptResult(BaseModel):
    attempt_id: str
    module_id: str
    total_questions: int
    correct_answers: int
    score_percent: float
    passed: bool
    passing_score_percent: int
    xp_awarded: int
    module_xp_awarded: int = 0
    graded_at: datetime
    items: List[QuizItemResult]


class QuizAnswerResult(BaseModel):
    item_id: str
    recorded: bool
    correct: Optional[bool] = None          # None when the module withholds feedback until grading
    correct_position: Optional[int] = None
    explanation: Optional[str] = None

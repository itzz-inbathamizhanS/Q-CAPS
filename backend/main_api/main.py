from fastapi import FastAPI, Depends, HTTPException, WebSocket, WebSocketDisconnect, Query, BackgroundTasks, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import func
from sqlalchemy.orm import Session
from typing import List

import models
import schemas
import quiz_service
import scan_receipts
import scan_report
from database import engine, Base, get_db, ensure_schema
from recommendation import get_user_recommendation
from leaderboard import get_leaderboard_data, get_user_rank
import logging
import os
import json
from datetime import datetime, timedelta, timezone
from passlib.context import CryptContext
import jwt
from fastapi.security import OAuth2PasswordBearer

# Candidate A Services
from services import evidence_service
from closure.engine import process_closure_verification
from course_content.admin_routes import create_admin_router
from course_content.public_routes import create_public_router
from activities import create_activities_router
from course_content.ratelimit import login_limiter
from config import load_jwt_secret

logger = logging.getLogger(__name__)

# Security Configurations
# The secret comes from QCAPS_JWT_SECRET (see config.load_jwt_secret): at least 32 characters,
# required when QCAPS_ENV=production, random per-process in development.
SECRET_KEY = load_jwt_secret()
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.environ.get("QCAPS_TOKEN_EXPIRE_MINUTES", 60 * 24))

pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("typ") is not None:
            raise ValueError("not an access token")  # e.g. a scan receipt signed with the same secret
        user_id = int(payload.get("sub"))
    except (jwt.PyJWTError, TypeError, ValueError):
        # Missing or non-numeric "sub" is an invalid credential, not a server error.
        raise credentials_exception
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if user is None:
        raise credentials_exception
    return user

def require_admin(current_user: models.User = Depends(get_current_user)):
    """Admin gate. get_current_user re-reads the user from the database on every request,
    so the role is always the stored one and nothing the client sends can change it."""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user

def asset_visible(db: Session, user: models.User, asset_id) -> bool:
    """Evidence, findings and interventions hang off assets. An asset created from a verified scan is
    private to the user who scanned it (and admins); assets without an owner are shared, admin-managed records."""
    if user.role == "admin" or asset_id is None:
        return True
    asset = db.query(models.Asset).filter(models.Asset.id == asset_id).first()
    return asset is None or asset.owner_user_id is None or asset.owner_user_id == user.id

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except Exception:
                pass

manager = ConnectionManager()

# Create SQLite database tables if they do not exist
Base.metadata.create_all(bind=engine)
ensure_schema()

app = FastAPI(
    title="Q-CAPS Analytics Backend",
    description="Backend for scoring, recommendations, and analytics",
    version="1.0.0"
)

# Allow React dev server origin
app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in os.environ.get("QCAPS_CORS_ORIGINS", "http://localhost:5173,http://localhost:3000").split(",") if o.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(create_public_router(get_current_user))
app.include_router(create_activities_router(get_current_user))
app.include_router(create_admin_router(require_admin))

@app.on_event("startup")
def seed_quiz_bank():
    """Populate the server-side item bank on first start (idempotent; CLI: python seed_quizzes.py)."""
    from database import SessionLocal
    from seed_quizzes import seed_if_empty, sync_tags
    from competency.seed import seed_competencies
    from competency.requirements import backfill
    with SessionLocal() as session:
        seed_if_empty(session)
        sync_tags(session)
        seed_competencies(session)
        backfill(session)

@app.get("/")
def root():
    return {
        "message": "Q-CAPS Analytics Backend is running"
    }

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy"
    }

@app.post("/api/auth/register", response_model=schemas.UserOut)
def register_user(user_in: schemas.UserCreate, db: Session = Depends(get_db)):
    # Check if user already exists
    existing_user = db.query(models.User).filter(func.lower(models.User.name) == user_in.name.lower()).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already registered")
        
    hashed_password = get_password_hash(user_in.password)
    db_user = models.User(name=user_in.name, hashed_password=hashed_password, xp=0)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    # Calculate rank and readiness score for user (initial is 0)
    rank = get_user_rank(db, db_user.id)
    
    return schemas.UserOut(
        id=db_user.id,
        name=db_user.name,
        xp=db_user.xp,
        readiness_score=None,  # no quiz evidence yet: unknown, as /profile reports it
        global_rank=rank,
        progress_data=db_user.progress_data or "{}"
    )

@app.post("/api/auth/login", response_model=schemas.Token)
def login(user_in: schemas.UserLogin, request: Request, db: Session = Depends(get_db)):
    client = request.client.host if request.client else "unknown"
    retry_after = login_limiter.hit((client, user_in.name.strip().lower()))
    if retry_after:
        raise HTTPException(
            status_code=429,
            detail=f"Too many sign-in attempts. Try again in {retry_after} seconds.",
            headers={"Retry-After": str(retry_after)},
        )
    user = db.query(models.User).filter(func.lower(models.User.name) == user_in.name.strip().lower()).first()
    if not user or not verify_password(user_in.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect username or password")
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user.id)}, expires_delta=access_token_expires
    )
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": user.id,
        "user_name": user.name
    }

@app.get("/api/auth/me")
def read_me(current_user: models.User = Depends(get_current_user)):
    """Who the server says the caller is. The frontend uses this only to show or hide the
    admin link; every admin endpoint enforces the role itself."""
    return {"id": current_user.id, "name": current_user.name, "role": current_user.role}

@app.websocket("/api/ws/leaderboard")
async def websocket_leaderboard(websocket: WebSocket, token: str = Query(None), db: Session = Depends(get_db)):
    if not token:
        await websocket.close(code=1008)
        return
        
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if not user_id:
            await websocket.close(code=1008)
            return
    except jwt.PyJWTError:
        await websocket.close(code=1008)
        return
        
    await manager.connect(websocket)
    try:
        while True:
            # We just keep the connection open, clients don't send data here.
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)

SERVER_OWNED_PROGRESS_KEYS = ("totalXp", "completedModules", "quizScores", "unlockedBadges", "completedEscapes", "completedMissions", "readinessScore", "xpAwardedModules")


@app.post("/api/users/{user_id}/progress")
def update_user_progress(user_id: int, progress: schemas.ProgressUpdate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to update this user's progress")
        
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # XP, completion, scores and badges are decided by the server; a client cannot store its own values for them.
    try:
        blob = json.loads(progress.progress_data or "{}")
    except ValueError:
        raise HTTPException(status_code=422, detail="progress_data must be JSON")
    if not isinstance(blob, dict):
        raise HTTPException(status_code=422, detail="progress_data must be a JSON object")
    for key in SERVER_OWNED_PROGRESS_KEYS:
        blob.pop(key, None)
    user.progress_data = json.dumps(blob)
    db.commit()
    return {"status": "success"}

@app.post("/api/quizzes/{module_id}/attempts", response_model=schemas.QuizAttemptOut)
def start_quiz_attempt(module_id: str, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    """Issue a server-built quiz form (shuffled, no answer keys)."""
    try:
        return quiz_service.issue_attempt(db, current_user, module_id)
    except quiz_service.QuizError as e:
        raise HTTPException(status_code=e.status_code, detail=e.detail)

@app.get("/api/diagnostic/results", response_model=List[schemas.DiagnosticResult])
def get_diagnostic_results(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    """The signed-in learner's graded diagnostic attempts (newest first) with per-domain results."""
    return quiz_service.diagnostic_results(db, current_user)

@app.post("/api/quizzes/attempts/{attempt_id}/answers", response_model=schemas.QuizAnswerResult)
def answer_quiz_question(attempt_id: str, answer: schemas.QuizAnswerIn, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    """Record and lock one answer; returns feedback so the UI can keep per-question explanations."""
    try:
        return quiz_service.record_answer(db, current_user, attempt_id, answer.item_id, answer.selected_position)
    except quiz_service.QuizError as e:
        raise HTTPException(status_code=e.status_code, detail=e.detail)

@app.post("/api/quizzes/attempts/{attempt_id}/submit", response_model=schemas.QuizAttemptResult)
def submit_quiz_attempt(attempt_id: str, body: schemas.QuizAttemptSubmit, background_tasks: BackgroundTasks, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    """Grade an issued attempt on the server. The score is computed here, never taken from the client."""
    try:
        result = quiz_service.grade_attempt(db, current_user, attempt_id, body.answers)
    except quiz_service.QuizError as e:
        raise HTTPException(status_code=e.status_code, detail=e.detail)
    background_tasks.add_task(manager.broadcast, json.dumps(get_leaderboard_data(db)))
    return result

@app.post("/api/quizzes/submit", response_model=schemas.QuizScoreOut, deprecated=True)
def submit_quiz_score(submission: schemas.QuizSubmission, background_tasks: BackgroundTasks, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    # Legacy endpoint: it trusts client-reported scores, so it is disabled unless explicitly enabled.
    if os.getenv("QCAPS_ENABLE_LEGACY_QUIZ_SUBMIT") != "1":
        raise HTTPException(status_code=410, detail="Client-reported quiz scores are no longer accepted; use /api/quizzes/{module_id}/attempts")
    if current_user.id != submission.user_id:
        raise HTTPException(status_code=403, detail="Not authorized to submit quiz for this user")

    # Verify user exists
    user = db.query(models.User).filter(models.User.id == submission.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    # Calculate percentage score
    if submission.total_questions <= 0:
        raise HTTPException(status_code=400, detail="Total questions must be greater than zero")
        
    if submission.correct_answers < 0:
        raise HTTPException(status_code=400, detail="Correct answers cannot be negative")
        
    if submission.correct_answers > submission.total_questions:
        raise HTTPException(status_code=400, detail="Correct answers cannot exceed total questions")
        
    score_pct = (submission.correct_answers / submission.total_questions) * 100
    
    # Store quiz score
    db_score = models.QuizScore(
        user_id=submission.user_id,
        topic=submission.topic,
        score=score_pct,
        correct_answers=submission.correct_answers,
        total_questions=submission.total_questions
    )
    db.add(db_score)
    
    # Award XP based on correct answers: 50 XP per correct answer
    xp_awarded = submission.correct_answers * 50
    user.xp += xp_awarded
    
    db.commit()
    db.refresh(db_score)
    db.refresh(user)
    
    background_tasks.add_task(manager.broadcast, json.dumps(get_leaderboard_data(db)))
    
    return db_score

@app.post("/api/scanner/log", response_model=schemas.ScannerLogOut)
def log_scanner_result(log_in: schemas.ScannerLogCreate, background_tasks: BackgroundTasks, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if current_user.id != log_in.user_id:
        raise HTTPException(status_code=403, detail="Not authorized to log scanner results for this user")

    user = db.query(models.User).filter(models.User.id == log_in.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # The result is relayed by the browser, so it is only accepted with the scanner's signed receipt,
    # and everything stored or awarded is derived from it rather than from client-supplied numbers.
    try:
        result = json.loads(log_in.details)
        scan_receipts.verify_receipt(log_in.receipt, SECRET_KEY, current_user.id, result)
    except ValueError as e:  # includes ReceiptError and malformed JSON
        raise HTTPException(status_code=422, detail=str(e) if isinstance(e, scan_receipts.ReceiptError) else "details must be the scanner's JSON result")
    details = scan_receipts.canonical_json(result)
    if db.query(models.ScannerLog.id).filter(models.ScannerLog.user_id == user.id, models.ScannerLog.details == details).first():
        raise HTTPException(status_code=409, detail="This scan result has already been recorded")
    findings = scan_receipts.count_findings(result)

    db_log = models.ScannerLog(
        user_id=user.id,
        endpoint=(result.get("target_url") if isinstance(result, dict) else None) or log_in.endpoint,
        status=log_in.status,
        vulnerabilities_found=findings,
        details=details
    )
    db.add(db_log)
    db.flush()

    target = db_log.endpoint
    day_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0, tzinfo=None)
    already_today = db.query(models.ScannerLog.id).filter(
        models.ScannerLog.user_id == user.id, models.ScannerLog.endpoint == target,
        models.ScannerLog.created_at >= day_start, models.ScannerLog.id != db_log.id).first() is not None
    # The first scan of a target each UTC day earns XP; repeats are recorded but earn none.
    xp_awarded = 0 if already_today else scan_receipts.xp_for(result)
    user.xp += xp_awarded

    # Verified full scans also update the asset, evidence and findings of the user. A failure here must not lose
    # the verified scan log or its XP, so it runs in a savepoint and is logged rather than raised.
    try:
        with db.begin_nested():
            evidence_service.ingest_scan(db, user, result)
    except Exception:
        logger.exception("Evidence ingestion failed for scan log %s", db_log.id)

    db.commit()
    db.refresh(db_log)
    db.refresh(user)

    background_tasks.add_task(manager.broadcast, json.dumps(get_leaderboard_data(db)))

    out = schemas.ScannerLogOut.model_validate(db_log)
    out.xp_awarded = xp_awarded
    return out

@app.get("/api/scanner/logs", response_model=List[schemas.ScannerLogSummary])
def list_scanner_logs(limit: int = 20, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    """The current user's recent scans, newest first, as display summaries."""
    limit = max(1, min(limit, 50))
    logs = db.query(models.ScannerLog).filter(models.ScannerLog.user_id == current_user.id)         .order_by(models.ScannerLog.created_at.desc(), models.ScannerLog.id.desc()).limit(limit).all()
    out = []
    for log in logs:
        try:
            result = json.loads(log.details or "")
        except ValueError:
            result = None
        out.append(schemas.ScannerLogSummary(id=log.id, target=log.endpoint, created_at=log.created_at, **scan_receipts.summarize(result)))
    return out


@app.get("/api/scanner/logs/{log_id}", response_model=schemas.ScannerLogOut)
def get_scanner_log(log_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    log = db.query(models.ScannerLog).filter(models.ScannerLog.id == log_id, models.ScannerLog.user_id == current_user.id).first()
    if not log:
        raise HTTPException(status_code=404, detail="Log not found")
    return log


@app.get("/api/scanner/logs/{log_id}/report")
def download_scan_report(log_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    log = db.query(models.ScannerLog).filter(models.ScannerLog.id == log_id, models.ScannerLog.user_id == current_user.id).first()
    if not log:
        raise HTTPException(status_code=404, detail="Log not found")
    return Response(
        content=scan_report.render_report(log),
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=threat_report_{log.id}.pdf"}
    )

@app.get("/api/leaderboard/rank")
def get_rank(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    rank = get_user_rank(db, current_user.id)
    return {"rank": rank}

def _finding_visible(db: Session, user: models.User, finding_id) -> bool:
    finding = db.query(models.Finding).filter(models.Finding.id == finding_id).first()
    return finding is None or asset_visible(db, user, finding.asset_id)


@app.get("/api/scanner/assets", response_model=List[schemas.ScannerAssetOut])
def list_scanner_assets(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    """Domains the user has scanned with verified ownership, with how many findings are open or resolved."""
    assets = db.query(models.Asset).filter(models.Asset.owner_user_id == current_user.id) \
        .order_by(models.Asset.created_at.desc(), models.Asset.id.desc()).all()
    out = []
    for asset in assets:
        statuses = [f.status for f in db.query(models.Finding).filter(models.Finding.asset_id == asset.id).all()]
        last = db.query(func.max(models.Evidence.observed_at)).filter(models.Evidence.asset_id == asset.id).scalar()
        out.append(schemas.ScannerAssetOut(
            id=asset.id, target=asset.canonical_target, created_at=asset.created_at,
            open_findings=statuses.count("OPEN"), resolved_findings=statuses.count("RESOLVED"), last_scanned=last))
    return out


@app.get("/api/scanner/assets/{asset_id}/findings", response_model=List[schemas.ScannerFindingOut])
def list_asset_findings(asset_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    asset = db.query(models.Asset).filter(models.Asset.id == asset_id, models.Asset.owner_user_id == current_user.id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    rows = db.query(models.Finding).filter(models.Finding.asset_id == asset.id).all()
    rows.sort(key=lambda f: (f.status != "OPEN", -f.severity, -(f.last_seen.timestamp() if f.last_seen else 0)))
    return [schemas.ScannerFindingOut(
        id=f.id, finding_type=f.finding_type, title=f.title, severity=evidence_service.severity_label(f.severity),
        algorithm=f.algorithm, status=f.status, first_seen=f.first_seen, last_seen=f.last_seen) for f in rows]


# --- CANDIDATE A: EVIDENCE-TO-COMPETENCY CLOSURE LOOP ROUTES ---

@app.post("/api/evidence", response_model=schemas.EvidenceOut)
def create_evidence(raw_scan: dict, db: Session = Depends(get_db), _admin: models.User = Depends(require_admin)):
    """Receives raw scan data, normalizes it, and stores it as Evidence."""
    evidence = evidence_service.create_evidence(db, raw_scan)
    return evidence

@app.get("/api/evidence/{evidence_id}", response_model=schemas.EvidenceOut)
def get_evidence(evidence_id: str, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    evidence = db.query(models.Evidence).filter(models.Evidence.id == evidence_id).first()
    if not evidence or not asset_visible(db, current_user, evidence.asset_id):
        raise HTTPException(status_code=404, detail="Evidence not found")
    return evidence

@app.post("/api/findings", response_model=schemas.FindingOut)
def create_finding(finding_in: schemas.FindingCreate, db: Session = Depends(get_db), _admin: models.User = Depends(require_admin)):
    import uuid
    finding = models.Finding(**finding_in.dict(), id=str(uuid.uuid4()))
    db.add(finding)
    db.commit()
    db.refresh(finding)
    return finding

@app.get("/api/findings/{finding_id}", response_model=schemas.FindingOut)
def get_finding(finding_id: str, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    finding = db.query(models.Finding).filter(models.Finding.id == finding_id).first()
    if not finding or not asset_visible(db, current_user, finding.asset_id):
        raise HTTPException(status_code=404, detail="Finding not found")
    return finding

@app.get("/api/findings/{finding_id}/interventions", response_model=List[schemas.InterventionOut])
def get_finding_interventions(finding_id: str, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    finding = db.query(models.Finding).filter(models.Finding.id == finding_id).first()
    if not finding or not asset_visible(db, current_user, finding.asset_id):
        raise HTTPException(status_code=404, detail="Finding not found")
    return db.query(models.Intervention).filter(models.Intervention.finding_id == finding_id).order_by(models.Intervention.created_at.desc()).all()

@app.get("/api/findings/{finding_id}/requirements", response_model=List[schemas.FindingRequirementOut])
def get_finding_requirements(finding_id: str, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    """The requirement this finding creates and the competencies (with required level) it needs, from the
    risk-to-skill map. An empty list means no rule maps this finding type (see requirement_map.json)."""
    finding = db.query(models.Finding).filter(models.Finding.id == finding_id).first()
    if not finding or not asset_visible(db, current_user, finding.asset_id):
        raise HTTPException(status_code=404, detail="Finding not found")
    from competency import requirements
    rows = (db.query(models.FindingRequirement).filter(models.FindingRequirement.finding_id == finding_id)
            .order_by(models.FindingRequirement.map_version, models.FindingRequirement.requirement_id, models.FindingRequirement.competency_code).all())
    names = {c.code: c.name for c in db.query(models.Competency).filter(
        models.Competency.code.in_([r.competency_code for r in rows])).all()} if rows else {}
    requirement_map = requirements.load_map()
    return [{**requirements.describe(r, requirement_map), "competency_name": names.get(r.competency_code)} for r in rows]

@app.get("/api/users/me/skill-matrix", response_model=schemas.SkillMatrixOut)
def get_my_skill_matrix(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    """Required vs demonstrated level per competency for the signed-in learner. Requirements come only from the
    learner's own open findings (and shared ownerless records); Unknown is reported as unassessed, never as rank 0."""
    from competency import skill_matrix
    return skill_matrix.build(db, current_user)

@app.get("/api/users/{user_id}/capabilities", response_model=List[schemas.LearnerCapabilityOut])
def get_user_capabilities(user_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if current_user.id != user_id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to view this user's capabilities")
    rows = (db.query(models.LearnerCapability, models.Competency)
            .join(models.Competency, models.Competency.id == models.LearnerCapability.competency_id)
            .filter(models.LearnerCapability.user_id == user_id).order_by(models.Competency.code).all())
    return [schemas.LearnerCapabilityOut.model_validate(cap).model_copy(update={"competency_code": comp.code, "competency_name": comp.name})
            for cap, comp in rows]

@app.post("/api/interventions", response_model=schemas.InterventionOut)
def create_intervention(intervention_in: schemas.InterventionCreate, db: Session = Depends(get_db), _admin: models.User = Depends(require_admin)):
    import uuid
    intervention = models.Intervention(**intervention_in.dict(), id=str(uuid.uuid4()))
    db.add(intervention)
    db.commit()
    db.refresh(intervention)
    return intervention

@app.get("/api/interventions/{id}", response_model=schemas.InterventionOut)
def get_intervention(id: str, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    intervention = db.query(models.Intervention).filter(models.Intervention.id == id).first()
    if not intervention or not _finding_visible(db, current_user, intervention.finding_id):
        raise HTTPException(status_code=404, detail="Intervention not found")
    return intervention

@app.post("/api/interventions/{id}/verify")
def verify_intervention(id: str, verification_data: dict, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    """
    verification_data should contain:
    - learner_result: dict
    - before_evidence_id: str
    - after_scan_raw: dict
    """
    intervention = db.query(models.Intervention).filter(models.Intervention.id == id).first()
    if not intervention or not _finding_visible(db, current_user, intervention.finding_id):
        raise HTTPException(status_code=404, detail="Intervention not found")

    before_evidence = db.query(models.Evidence).filter(models.Evidence.id == verification_data.get("before_evidence_id")).first()
    if not before_evidence or not asset_visible(db, current_user, before_evidence.asset_id):
        raise HTTPException(status_code=404, detail="Before evidence not found")
        
    # Create after evidence
    after_evidence = evidence_service.create_evidence(db, verification_data.get("after_scan_raw", {}))
    
    # Process closure
    closure_result = process_closure_verification(
        intervention.__dict__, 
        verification_data.get("learner_result", {}), 
        before_evidence.normalized_payload, 
        after_evidence.normalized_payload
    )
    
    # In a full implementation, we'd save Verification and ClosureEvent here
    if intervention.competency_id is not None:
        competency = db.get(models.Competency, intervention.competency_id)
        finding = db.get(models.Finding, intervention.finding_id)
        asset = db.get(models.Asset, finding.asset_id) if finding else None
        if competency and asset and asset.owner_user_id:
            from competency import capability
            capability.refresh(db, asset.owner_user_id, {competency.code})
    return closure_result

@app.get("/api/closures/{finding_id}")
def get_closures(finding_id: str, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if not _finding_visible(db, current_user, finding_id):
        return []  # indistinguishable from a finding that does not exist
    closures = db.query(models.ClosureEvent).filter(models.ClosureEvent.finding_id == finding_id).all()
    return closures

@app.get("/api/users/{user_id}/profile", response_model=schemas.UserOut)
def get_user_profile(user_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to view this user's profile")

    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    # Get all quiz scores to calculate readiness
    scores = db.query(models.QuizScore).filter(models.QuizScore.user_id == user_id).all()
    
    readiness_score = None  # no quiz evidence: report unknown rather than a score of 0
    if scores:
        # Mean of all server-graded quiz scores. XP is deliberately excluded: it is a gamification
        # counter (scans, first-time-correct bonuses), not a measure of capability, and the UI labels
        # this figure "Based on quiz performance".
        readiness_score = min(100, round(sum(s.score for s in scores) / len(scores)))
        
    rank = get_user_rank(db, user_id)
        
    return schemas.UserOut(
        id=user.id,
        name=user.name,
        xp=user.xp,
        readiness_score=readiness_score,
        global_rank=rank,
        progress_data=user.progress_data or "{}"
    )

@app.get("/api/users/{user_id}/recommendation", response_model=schemas.RecommendationOut)
def get_recommendation(user_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to view this user's recommendation")

    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    # Generate recommendation based on gaps
    recommendations = get_user_recommendation(db, user_id)
    
    if not recommendations:
        # Default recommendation if no data
        return schemas.RecommendationOut(
            course_id="track_a_a1_computing_foundations",
            title="Computing Foundations",
            topic="practical_security",
            priority="high",
            reason="Start your journey by building a strong foundation in computing and cybersecurity."
        )
        
    return recommendations

@app.get("/api/leaderboard")
def get_leaderboard(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    """
    Returns the top users sorted by XP in descending order.
    """
    try:
        return get_leaderboard_data(db)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    import os
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False)

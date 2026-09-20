from fastapi import FastAPI, Depends, HTTPException, WebSocket, WebSocketDisconnect, Query, BackgroundTasks, Response
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List

import models
import schemas
from database import engine, Base, get_db
from recommendation import get_user_recommendation
from leaderboard import get_leaderboard_data, get_user_rank
import os
import json
from datetime import datetime, timedelta
from passlib.context import CryptContext
import jwt
from fastapi.security import OAuth2PasswordBearer

# Security Configurations
SECRET_KEY = "qcaps_super_secret_jwt_key_for_development_only"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7 # 1 week

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
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except jwt.PyJWTError:
        raise credentials_exception
    user = db.query(models.User).filter(models.User.id == int(user_id)).first()
    if user is None:
        raise credentials_exception
    return user

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

app = FastAPI(
    title="Q-CAPS Analytics Backend",
    description="Backend for scoring, recommendations, and analytics",
    version="1.0.0"
)

# Allow React dev server origin
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
    existing_user = db.query(models.User).filter(models.User.name.ilike(user_in.name)).first()
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
        readiness_score=0,
        global_rank=rank,
        progress_data=db_user.progress_data or "{}"
    )

@app.post("/api/auth/login", response_model=schemas.Token)
def login(user_in: schemas.UserLogin, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.name.ilike(user_in.name)).first()
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

@app.post("/api/users/{user_id}/progress")
def update_user_progress(user_id: int, progress: schemas.ProgressUpdate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to update this user's progress")
        
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.progress_data = progress.progress_data
    db.commit()
    return {"status": "success"}

@app.post("/api/quizzes/submit", response_model=schemas.QuizScoreOut)
def submit_quiz_score(submission: schemas.QuizSubmission, background_tasks: BackgroundTasks, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
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
        
    db_log = models.ScannerLog(
        user_id=log_in.user_id,
        endpoint=log_in.endpoint,
        status=log_in.status,
        vulnerabilities_found=log_in.vulnerabilities_found,
        details=log_in.details
    )
    db.add(db_log)
    
    # Award XP for scanning based on vulnerabilities found
    xp_awarded = 10 + (log_in.vulnerabilities_found * 5)
    user.xp += xp_awarded
    
    db.commit()
    db.refresh(db_log)
    db.refresh(user)
    
    background_tasks.add_task(manager.broadcast, json.dumps(get_leaderboard_data(db)))
    
    return db_log

@app.get("/api/scanner/logs/{log_id}/report")
def download_scan_report(log_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    log = db.query(models.ScannerLog).filter(models.ScannerLog.id == log_id, models.ScannerLog.user_id == current_user.id).first()
    if not log:
        raise HTTPException(status_code=404, detail="Log not found")

    from reportlab.lib.pagesizes import letter
    from reportlab.pdfgen import canvas
    import io
    import json
    import textwrap

    buffer = io.BytesIO()
    p = canvas.Canvas(buffer, pagesize=letter)
    
    # Header
    p.setFont("Helvetica-Bold", 18)
    p.drawString(50, 750, "Q-CAPS Threat Analysis Report")
    
    p.setFont("Helvetica", 12)
    p.drawString(50, 720, f"Target Endpoint: {log.endpoint}")
    p.drawString(50, 700, f"Scan Status: {log.status.upper()}")
    p.drawString(50, 680, f"Timestamp: {log.created_at.strftime('%Y-%m-%d %H:%M:%S')} UTC")
    
    y = 640
    
    try:
        details_data = json.loads(log.details)
        
        # OSINT Section
        p.setFont("Helvetica-Bold", 14)
        p.drawString(50, y, "1. Domain Reconnaissance (OSINT)")
        y -= 20
        p.setFont("Helvetica", 10)
        
        osint = details_data.get("osint", {})
        if osint:
            p.drawString(60, y, f"Owner/Org: {osint.get('owner_organization', 'Unknown')}")
            y -= 15
            p.drawString(60, y, f"Registrar: {osint.get('registrar', 'Unknown')}")
            y -= 15
            p.drawString(60, y, f"Created: {osint.get('creation_date', 'Unknown')}")
            y -= 15
            p.drawString(60, y, f"Risk Level: {osint.get('risk_level', 'Unknown')}")
            y -= 25
            
            data_leaks = osint.get("data_leaks", {})
            breaches_found = data_leaks.get("breaches_found", 0)
            if breaches_found > 0:
                p.setFont("Helvetica-Bold", 10)
                p.setFillColorRGB(0.8, 0.1, 0.1)
                p.drawString(60, y, f"! WARNING: {breaches_found} Data Breaches Found in Dark Web / OSINT DB")
                p.setFillColorRGB(0, 0, 0)
                p.setFont("Helvetica", 10)
                y -= 15
                for b in data_leaks.get("breaches", []):
                    p.drawString(70, y, f"- {b.get('source')} ({b.get('date')}): {b.get('records_compromised')} records")
                    y -= 15
                    p.drawString(80, y, f"Types: {', '.join(b.get('data_types', []))}")
                    y -= 15
                y -= 10
        else:
            p.drawString(60, y, "No OSINT data available.")
            y -= 25

        # Infrastructure
        p.setFont("Helvetica-Bold", 14)
        p.drawString(50, y, "2. Infrastructure Analysis")
        y -= 20
        p.setFont("Helvetica", 10)
        infra = details_data.get("infrastructure", {})
        if infra:
            geo = infra.get("geo", {})
            p.drawString(60, y, f"IP Address: {geo.get('ip', 'Unknown')}")
            y -= 15
            p.drawString(60, y, f"Location: {geo.get('country', 'Unknown')}")
            y -= 15
            p.drawString(60, y, f"ISP: {geo.get('isp', 'Unknown')}")
            y -= 20
            
            p.setFont("Helvetica-Bold", 10)
            p.drawString(60, y, "Security Headers:")
            p.setFont("Helvetica", 10)
            y -= 15
            headers = infra.get("security_headers", {})
            p.drawString(70, y, f"HSTS Active: {headers.get('hsts', False)}")
            y -= 15
            p.drawString(70, y, f"Content-Security-Policy: {headers.get('content_security_policy', False)}")
            y -= 25
        else:
            p.drawString(60, y, "No infrastructure data available.")
            y -= 25

        # Cryptography
        p.setFont("Helvetica-Bold", 14)
        p.drawString(50, y, "3. Quantum Cryptography Threat Analysis")
        y -= 20
        p.setFont("Helvetica", 10)
        crypto = details_data.get("crypto", {})
        if crypto:
            p.drawString(60, y, f"Encryption Detected: {crypto.get('encryption_detected', 'Unknown')}")
            y -= 15
            q_status = crypto.get('quantum_status', 'Unknown')
            p.drawString(60, y, f"Quantum Readiness: {q_status.upper()}")
            y -= 25
            
            p.setFont("Helvetica-Bold", 10)
            p.drawString(60, y, "Identified Vulnerabilities:")
            p.setFont("Helvetica", 10)
            y -= 15
            vulns = crypto.get("vulnerabilities_found", [])
            if vulns:
                for v in vulns:
                    for line in textwrap.wrap(f"- {v}", width=80):
                        if y < 50:
                            p.showPage()
                            p.setFont("Helvetica", 10)
                            y = 750
                        p.drawString(70, y, line)
                        y -= 15
            else:
                p.drawString(70, y, "None detected.")
                y -= 15
        else:
            p.drawString(60, y, "No cryptographic data available.")
            y -= 25

    except Exception:
        # Fallback if not valid JSON
        p.setFont("Helvetica-Bold", 14)
        p.drawString(50, y, "Scan Details")
        p.setFont("Helvetica", 10)
        y -= 20
        for line in textwrap.wrap(log.details or "No details provided.", width=90):
            p.drawString(50, y, line)
            y -= 15

    p.showPage()
    p.save()
    buffer.seek(0)
    
    return Response(
        content=buffer.getvalue(),
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=threat_report_{log.id}.pdf"}
    )

@app.get("/api/users/{user_id}/profile", response_model=schemas.UserOut)
def get_user_profile(user_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to view this user's profile")

    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    # Get all quiz scores to calculate readiness
    scores = db.query(models.QuizScore).filter(models.QuizScore.user_id == user_id).all()
    
    readiness_score = 0
    if scores:
        avg_score = sum(s.score for s in scores) / len(scores)
        # Readiness is weighted average of quiz performance and XP
        readiness_score = min(100, int((avg_score * 0.7) + (min(user.xp, 1000) / 1000 * 30)))
        
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
def get_leaderboard(db: Session = Depends(get_db)):
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

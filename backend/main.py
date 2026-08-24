from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List

import models
import schemas
from database import engine, Base, get_db
from recommendation import get_user_recommendation
from leaderboard import get_leaderboard_data, get_user_rank

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

@app.post("/api/users", response_model=schemas.UserOut)
def create_user(user_in: schemas.UserCreate, db: Session = Depends(get_db)):
    # Create new user
    db_user = models.User(name=user_in.name, xp=0)
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
        global_rank=rank
    )

@app.post("/api/quizzes/submit", response_model=schemas.QuizScoreOut)
def submit_quiz_score(submission: schemas.QuizSubmission, db: Session = Depends(get_db)):
    # Verify user exists
    user = db.query(models.User).filter(models.User.id == submission.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    # Calculate percentage score
    if submission.total_questions <= 0:
        raise HTTPException(status_code=400, detail="Total questions must be greater than zero")
        
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
    
    return db_score

@app.post("/api/scanner/log", response_model=schemas.ScannerLogOut)
def log_scanner_result(log_in: schemas.ScannerLogCreate, db: Session = Depends(get_db)):
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
    db.commit()
    db.refresh(db_log)
    return db_log

@app.get("/api/users/{user_id}/quizzes", response_model=List[schemas.QuizScoreOut])
def get_user_quizzes(user_id: int, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    scores = db.query(models.QuizScore).filter(models.QuizScore.user_id == user_id).all()
    return scores

@app.get("/api/users/{user_id}/recommendation", response_model=schemas.RecommendationOut)
def get_recommendation(user_id: int, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    recommendation_data = get_user_recommendation(db, user_id)
    return recommendation_data

@app.get("/api/users/{user_id}/profile")
def get_user_profile(user_id: int, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    # Calculate readiness score (average of latest quiz scores across 4 topics)
    topics = ["quantum_fundamentals", "classical_crypto", "pqc", "practical_security"]
    topic_scores = {}
    for t in topics:
        # Get latest score for topic
        latest_attempt = db.query(models.QuizScore).filter(
            models.QuizScore.user_id == user_id,
            models.QuizScore.topic == t
        ).order_by(models.QuizScore.created_at.desc()).first()
        topic_scores[t] = latest_attempt.score if latest_attempt else 0.0
        
    readiness_score = int(sum(topic_scores.values()) / len(topics) + 0.5)
    
    # Calculate rank
    rank = get_user_rank(db, user_id)
    
    # Get recommendation
    rec = get_user_recommendation(db, user_id)
    
    # Calculate unlocked badges dynamically based on high scores (>= 80%)
    unlocked_badges = []
    if topic_scores.get("quantum_fundamentals", 0.0) >= 80:
        unlocked_badges.append("Quantum Novice")
    if topic_scores.get("classical_crypto", 0.0) >= 80:
        unlocked_badges.append("RSA Hacker")
    if topic_scores.get("pqc", 0.0) >= 80:
        unlocked_badges.append("Lattice Logic")
    if topic_scores.get("practical_security", 0.0) >= 80:
        unlocked_badges.append("Agility Master")
        
    return {
        "user_id": f"U-{user.id:06d}",
        "name": user.name,
        "email": f"{user.name.lower().replace(' ', '.')}@example.com",
        "readiness_score": readiness_score,
        "total_xp": user.xp,
        "global_rank": rank,
        "unlocked_badges": unlocked_badges,
        "recommended_next_module": rec["title"]
    }

@app.get("/api/leaderboard")
def get_leaderboard(db: Session = Depends(get_db)):
    return get_leaderboard_data(db)

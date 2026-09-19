from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List

import models
import schemas
from database import engine, Base, get_db, SessionLocal
from recommendation import get_user_recommendation
from leaderboard import get_leaderboard_data, get_user_rank
import sqlite3
import os

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
    # Check if user already exists
    existing_user = db.query(models.User).filter(models.User.name.ilike(user_in.name)).first()
    if existing_user:
        db_user = existing_user
    else:
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
        global_rank=rank,
        progress_data=db_user.progress_data or "{}"
    )

@app.post("/api/users/{user_id}/progress")
def update_user_progress(user_id: int, progress: schemas.ProgressUpdate, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.progress_data = progress.progress_data
    db.commit()
    return {"status": "success"}

@app.post("/api/quizzes/submit", response_model=schemas.QuizScoreOut)
def submit_quiz_score(submission: schemas.QuizSubmission, db: Session = Depends(get_db)):
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
    
    # Award XP for scanning based on vulnerabilities found
    xp_awarded = 10 + (log_in.vulnerabilities_found * 5)
    user.xp += xp_awarded
    
    db.commit()
    db.refresh(db_log)
    db.refresh(user)
    
    return db_log

@app.get("/api/users/{user_id}/profile", response_model=schemas.UserOut)
def get_user_profile(user_id: int, db: Session = Depends(get_db)):
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
def get_recommendation(user_id: int, db: Session = Depends(get_db)):
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

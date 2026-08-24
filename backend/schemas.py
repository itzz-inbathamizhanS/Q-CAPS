from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel

class UserCreate(BaseModel):
    name: str

class UserOut(BaseModel):
    id: int
    name: str
    xp: int
    readiness_score: int
    global_rank: int

    class Config:
        orm_mode = True
        from_attributes = True

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
    endpoint: str
    status: str
    vulnerabilities_found: int = 0
    details: Optional[str] = None

class ScannerLogOut(BaseModel):
    id: int
    user_id: int
    endpoint: str
    status: str
    vulnerabilities_found: int
    details: Optional[str]
    created_at: datetime

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

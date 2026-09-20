from datetime import datetime, timezone
from sqlalchemy import Column, DateTime, Float, Integer, String, Text
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, unique=True, index=True)
    hashed_password = Column(String, nullable=False)
    xp = Column(Integer, default=0)
    progress_data = Column(Text, nullable=True, default="{}")

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

"""Learner API for practice labs and missions. Grading, XP and badges are decided here."""
from typing import Callable, Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

import models
from database import get_db
from course_content.ratelimit import SlidingWindowLimiter
from . import service

# Labs allow retries by design; the limit only slows enumeration of the three options.
lab_limiter = SlidingWindowLimiter("QCAPS_LAB_RATE_LIMIT", 12, "QCAPS_LAB_RATE_WINDOW_SECONDS", 60)


# A mission can only be paid out once, so replaying it to read every branch is capped per hour.
run_limiter = SlidingWindowLimiter("QCAPS_RUN_RATE_LIMIT", 10, "QCAPS_RUN_RATE_WINDOW_SECONDS", 3600)


class LabAnswer(BaseModel):
    choice_id: str = Field(min_length=1, max_length=16)


class RunStart(BaseModel):
    photons: Optional[int] = None


class RunChoice(BaseModel):
    choice_id: str = Field(min_length=1, max_length=16)


class BB84Decision(BaseModel):
    sample_size: int
    decision: str


def create_activities_router(get_current_user: Callable) -> APIRouter:
    router = APIRouter(prefix="/api/activities", tags=["activities"])

    def run(fn, *args):
        try:
            return fn(*args)
        except service.ActivityError as exc:
            raise HTTPException(status_code=exc.status, detail=exc.detail)

    @router.get("/me")
    def my_progress(db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
        return service.progress(db, user)

    @router.post("/labs/{scenario_id}/answer")
    def answer_lab(scenario_id: str, body: LabAnswer, db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
        retry = lab_limiter.hit((user.id, scenario_id))
        if retry:
            raise HTTPException(status_code=429, detail=f"Too many attempts. Try again in {retry} seconds.", headers={"Retry-After": str(retry)})
        return run(service.answer_lab, db, user, scenario_id, body.choice_id)

    @router.post("/missions/{mission_id}/runs")
    def start_run(mission_id: str, body: RunStart, db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
        retry = run_limiter.hit((user.id, mission_id))
        if retry:
            raise HTTPException(status_code=429, detail=f"Too many runs. Try again in {retry} seconds.", headers={"Retry-After": str(retry)})
        return run(service.start_run, db, user, mission_id, body.photons)

    @router.post("/missions/runs/{run_id}/choose")
    def choose(run_id: str, body: RunChoice, db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
        return run(service.choose, db, user, run_id, body.choice_id)

    @router.post("/missions/runs/{run_id}/decide")
    def decide(run_id: str, body: BB84Decision, db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
        return run(service.decide_bb84, db, user, run_id, body.sample_size, body.decision)

    return router

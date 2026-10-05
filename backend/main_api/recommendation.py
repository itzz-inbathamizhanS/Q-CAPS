"""The recommendation engine (docs/architecture/RECOMMENDATIONS.md). One engine, three tiers, always explained.

1. Gap tier: skill-matrix rows with a gap (critical, high, medium) or an unassessed requirement, ordered by gap class,
   then the severity of the driving finding, then competency. Each is turned into a concrete next step (take a
   module quiz to get assessed, study a module, or do a practical) on a module whose prerequisites the learner has.
2. Score tier (recommendation_scores.py): when no finding creates a gap, quiz-topic scores and scanner context;
   unattempted topics are their own tier, never a stand-in score.
3. No evidence: nothing has been assessed or scanned, so no gap can be identified.

Every recommendation carries `reasons`: structured factors that produced it, rendered by the UI as "Why this?".
"""
from collections import defaultdict
from typing import Dict, List, Optional

from sqlalchemy.orm import Session

import models
from activities import catalogue
from competency import skill_matrix
from models import QuizScore, ScannerLog

# Evidence-driven fallback; also re-exported so existing imports keep working.
from recommendation_scores import get_recommendation_from_scores, get_score_based_recommendation  # noqa: F401

MAX_RECOMMENDATIONS = 5
GAP_PRIORITY = {"critical": "Critical", "high": "High", "medium": "Moderate", "unassessed": "Unassessed"}
DEPTHS_FOR_LEVEL = {"Developing": ("Aware", "Explain"), "Proficient": ("Apply",), "Advanced": ("Analyse",)}
LEVEL_RANK = {"Unknown": 0, "Beginner": 1, "Developing": 2, "Proficient": 3, "Advanced": 4}


def _scanner_risk(severity: float) -> str:
    return "High" if severity >= 0.8 else ("Medium" if severity >= 0.5 else "Info")


class _Catalogue:
    """Which course modules teach which competency, from the tagged quiz items of each module (diagnostics
    excluded), plus module order and prerequisites."""

    def __init__(self, db: Session):
        diagnostic = {m for (m,) in db.query(models.QuizModule.module_id).filter(models.QuizModule.kind == "diagnostic")}
        self.items: Dict[str, Dict[str, Dict[str, int]]] = defaultdict(lambda: defaultdict(lambda: defaultdict(int)))
        for module_id, code, depth in db.query(models.QuizItem.module_id, models.QuizItem.competency_id, models.QuizItem.depth) \
                .filter(models.QuizItem.competency_id.isnot(None), models.QuizItem.active.is_(True)):
            if module_id not in diagnostic:
                self.items[code][module_id][depth] += 1
        self.modules = {m.slug: m for m in db.query(models.CourseModule).all()}
        tracks = {t.id: t.sort_order for t in db.query(models.CourseTrack).all()}
        self.order = {slug: (tracks.get(m.track_id, 0), m.sort_order, slug) for slug, m in self.modules.items()}

    def teaching_module(self, code: str, depths: tuple) -> Optional[tuple]:
        """(module slug, items at the needed depths, all tagged items) of the module that teaches `code` best."""
        candidates = []
        for module_id, by_depth in self.items.get(code, {}).items():
            if module_id not in self.modules:
                continue
            at_depth = sum(n for d, n in by_depth.items() if d in depths)
            candidates.append((-at_depth, -sum(by_depth.values()), self.order[module_id], module_id, at_depth, sum(by_depth.values())))
        if not candidates:
            return None
        best = min(candidates)
        return best[3], best[4], best[5]

    def first_unmet_prerequisite(self, slug: str, passed: set, seen: Optional[set] = None) -> Optional[str]:
        """The earliest prerequisite (followed recursively) the learner has not passed, or None if the module is open."""
        seen = seen or set()
        module = self.modules.get(slug)
        for prereq in sorted(module.prerequisites or [], key=lambda s: self.order.get(s, (0, 0, s))) if module else []:
            if prereq in passed or prereq in seen:
                continue
            seen.add(prereq)
            deeper = self.first_unmet_prerequisite(prereq, passed, seen)
            return deeper or prereq
        return None


def _practical_for(code: str) -> Optional[dict]:
    """A lab or mission tagged with the competency at Apply depth or deeper (needed for Proficient)."""
    data = catalogue._load()
    for kind, entries, key in (("lab", data["labs"], "id"), ("mission", data["missions"], "mission_id")):
        for entry in sorted(entries.values(), key=lambda e: e[key]):
            for c in entry.get("competencies") or []:
                if c["id"] == code and c["depth"] in ("Apply", "Analyse"):
                    return {"kind": kind, "id": entry[key], "title": entry.get("title"), "depth": c["depth"],
                            "module_id": entry.get("module_id") or entry.get("linked_module_id")}
    return None


def _gap_recommendations(db: Session, user_id: int, matrix: dict) -> List[dict]:
    rows = [r for r in matrix["rows"] if r["gap_class"] in GAP_PRIORITY]
    rows.sort(key=lambda r: (list(GAP_PRIORITY).index(r["gap_class"]),
                             -max((f["severity"] for f in r["driving_findings"]), default=0), r["competency_code"]))
    if not rows:
        return []
    cat = _Catalogue(db)
    passed = {m for (m,) in db.query(models.QuizAttempt.module_id).filter(
        models.QuizAttempt.user_id == user_id, models.QuizAttempt.passed.is_(True), models.QuizAttempt.status == "graded")}
    map_status = {"type": "model_status", "requirement_map_version": matrix["requirement_map_version"],
                  "requirement_map_status": matrix["requirement_map_status"], "levels_status": matrix["levels_status"]}

    out: Dict[str, dict] = {}
    for row in rows:
        code, required, demonstrated = row["competency_code"], row["required_level"], row["demonstrated_level"]
        top = row["driving_findings"][0]
        reasons = [{
            "type": "gap" if row["gap_class"] != "unassessed" else "unassessed",
            "competency": code, "competency_name": row["competency_name"], "required": required,
            "demonstrated": demonstrated, "gap_class": row["gap_class"],
            "finding_id": top["finding_id"], "finding_title": top["title"] or top["finding_type"],
            "finding_severity": top["severity"], "requirement_id": top["requirement_id"],
            "other_findings": len(row["driving_findings"]) - 1,
        }]
        action, practical = None, None
        if row["gap_class"] == "unassessed":
            # No level yet: establish one before choosing training. The module with the most tagged items at any
            # depth gets the learner past the min_items_for_known threshold fastest.
            action = "assess"
            depths = ("Aware", "Explain", "Apply", "Analyse")
        elif required in ("Proficient", "Advanced") and LEVEL_RANK[demonstrated] >= LEVEL_RANK["Developing"]:
            # Knowledge is at Developing; Proficient also needs Apply items and a passed practical.
            action = "practice"
            depths = DEPTHS_FOR_LEVEL[required]
            practical = _practical_for(code)
        else:
            action = "learn"
            depths = DEPTHS_FOR_LEVEL.get(_next_level(demonstrated), ("Aware", "Explain"))
        teaching = cat.teaching_module(code, depths)
        if teaching is None and practical is None:
            reasons.append({"type": "no_content", "competency": code,
                            "detail": "No module or practical is tagged with this competency yet."})
            target, module_id = None, None
        else:
            module_id = (practical or {}).get("module_id") if practical and not teaching else teaching[0]
            if teaching:
                reasons.append({"type": "teaches", "module_id": teaching[0], "competency": code,
                                "items_at_depth": teaching[1], "tagged_items": teaching[2], "depths": list(depths)})
            if practical:
                reasons.append({"type": "practical", "competency": code, **practical})
            blocker = cat.first_unmet_prerequisite(module_id, passed) if module_id else None
            if blocker:
                reasons.append({"type": "prerequisite", "module_id": blocker, "unlocks": module_id})
                module_id, action, practical = blocker, "learn", None
            target = module_id
        reasons.append(map_status)

        key = target or f"none:{code}"
        if key in out:
            out[key]["reasons"].extend(r for r in reasons if r["type"] != "model_status")
            out[key]["competencies"].append(code)
            continue
        module = cat.modules.get(target) if target else None
        out[key] = {
            "module_id": target,
            "title": module.title if module else None,
            "code": module.code if module else None,
            "action": action if target else "none",
            "practical": practical,
            "competencies": [code],
            "priority": GAP_PRIORITY[row["gap_class"]],
            "scanner_risk": _scanner_risk(top["severity"]),
            "topic": module.recommendation_topic if module else None,
            "reasons": reasons,
        }
        if len(out) >= MAX_RECOMMENDATIONS:
            break
    return list(out.values())


def _next_level(level: str) -> str:
    return {"Unknown": "Developing", "Beginner": "Developing", "Developing": "Proficient"}.get(level, "Advanced")


def explain(rec: dict) -> str:
    """One readable sentence from the structured reasons, for the legacy `reason` field."""
    gap = next(r for r in rec["reasons"] if r["type"] in ("gap", "unassessed"))
    finding = f"open finding \"{gap['finding_title']}\""
    if gap["type"] == "unassessed":
        text = (f"Recommended because {finding} needs {gap['competency']} ({gap['competency_name']}) at {gap['required']} "
                f"and you have not been assessed on it yet")
    else:
        text = (f"Recommended because {finding} needs {gap['competency']} ({gap['competency_name']}) at {gap['required']} "
                f"and your demonstrated level is {gap['demonstrated']}")
    prereq = next((r for r in rec["reasons"] if r["type"] == "prerequisite"), None)
    if prereq:
        text += f"; {prereq['module_id']} comes first because it is a prerequisite of {prereq['unlocks']}"
    elif rec["action"] == "practice" and rec["practical"]:
        text += f"; a passed practical ({rec['practical']['title']}) is needed for Proficient"
    return text + "."


def get_user_recommendation(db: Session, user_id: int, scanner_findings: list | None = None) -> dict:
    user = db.get(models.User, user_id)
    matrix = skill_matrix.build(db, user) if user else {"rows": []}
    recs = _gap_recommendations(db, user_id, matrix) if user else []
    actionable = [r for r in recs if r["module_id"]]
    if actionable:
        top = actionable[0]
        return {
            "course_id": top["module_id"],
            "title": top["title"],
            "topic": top["topic"],
            "priority": top["priority"],
            "reason": explain(top),
            "quiz_score": None,
            "scanner_risk": top["scanner_risk"],
            "status": "recommendation",
            "engine": "gap",
            "reasons": top["reasons"],
            "recommendations": recs,
            "graph_paths": [],
        }

    has_evidence = (
        db.query(QuizScore.id).filter(QuizScore.user_id == user_id).first() is not None
        or db.query(ScannerLog.id).filter(ScannerLog.user_id == user_id).first() is not None
    )
    if not has_evidence:
        return {
            "course_id": None, "title": None, "topic": None, "priority": "Unknown",
            "reason": "No assessment or scan evidence yet, so no skill gap can be identified.",
            "quiz_score": None, "scanner_risk": None, "status": "no_evidence", "engine": "none",
            "reasons": [{"type": "no_evidence"}], "recommendations": recs, "graph_paths": [],
        }
    fallback = get_score_based_recommendation(db, user_id, scanner_findings)
    fallback.update(engine="score", recommendations=recs, graph_paths=[])
    return fallback

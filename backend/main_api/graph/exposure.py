"""Probability that a cryptographically relevant quantum computer (CRQC) arrives before an asset is migrated.

The Mosca inequality asks whether x + y > z, where x is how long the data must stay confidential, y is how long
migration takes and z is the (unknown) time until a CRQC. Instead of choosing a z, this uses the cumulative
probabilities published by an expert survey (crqc_timeline.json) and reports the result as an interval between the
survey's lower and upper curves. That interval is a range between two published curves, not a confidence interval.
See docs/research/COMPETENCY_ADJUSTED_MOSCA_SPEC.md.
"""
import json
from dataclasses import dataclass
from datetime import date
from pathlib import Path
from typing import Optional, Tuple

DATA_FILE = Path(__file__).parent / "data" / "crqc_timeline.json"
DAYS_PER_YEAR = 365.25


@dataclass(frozen=True)
class Horizon:
    years: float
    lower: float
    upper: float


@dataclass(frozen=True)
class Timeline:
    edition: str
    anchor: date
    horizons: Tuple[Horizon, ...]  # ascending by years; verified figures only
    caveats: Tuple[str, ...] = ()


@dataclass(frozen=True)
class ExposureEstimate:
    status: str  # "ok" or "unknown"
    p_low: Optional[float] = None
    p_high: Optional[float] = None
    reason: Optional[str] = None
    x_years: Optional[float] = None
    y_years: Optional[float] = None
    edition: Optional[str] = None
    caveats: Tuple[str, ...] = ()


def load_timeline(path: Path = DATA_FILE) -> Timeline:
    data = json.loads(Path(path).read_text(encoding="utf-8"))
    horizons = tuple(sorted(
        (Horizon(h["years"], h["lower"], h["upper"]) for h in data["horizons"] if h.get("verified") is True),
        key=lambda h: h.years))
    if not horizons:
        raise ValueError("crqc_timeline.json has no verified horizons")
    return Timeline(data["edition"], date.fromisoformat(data["anchor_date"]), horizons, tuple(data.get("caveats", ())))


def cumulative(timeline: Timeline, years: float, bound: str) -> Optional[float]:
    """Survey cumulative probability of a CRQC within `years` of the survey date; `bound` is "lower" or "upper".

    Piecewise-linear between published horizons with F(0) = 0 (a modelling choice). None beyond the last horizon:
    the survey does not support an answer there and the curve is never extrapolated.
    """
    if years < 0:
        raise ValueError("years must be non-negative")
    points = [(0.0, 0.0)] + [(h.years, getattr(h, bound)) for h in timeline.horizons]
    if years > points[-1][0]:
        return None
    for (x0, y0), (x1, y1) in zip(points, points[1:]):
        if years <= x1:
            return y0 + (y1 - y0) * (years - x0) / (x1 - x0)
    return points[-1][1]


def conditional_probability(timeline: Timeline, t_years: float, elapsed_years: float, bound: str) -> Optional[float]:
    """P(CRQC within t years from now | none has arrived yet), with the survey anchored `elapsed_years` ago."""
    f_now = cumulative(timeline, elapsed_years, bound)
    f_end = cumulative(timeline, elapsed_years + t_years, bound)
    if f_now is None or f_end is None:
        return None
    return (f_end - f_now) / (1.0 - f_now)


def _unknown(reason: str, timeline: Timeline, **kw) -> ExposureEstimate:
    return ExposureEstimate("unknown", reason=reason, edition=timeline.edition, caveats=timeline.caveats, **kw)


def estimate_exposure(
    *,
    confidentiality_days: Optional[float],
    migration_exec_days: Optional[float],
    deficit: Optional[float],
    hours_to_close: Optional[float],
    study_hours_per_day: Optional[float],
    timeline: Timeline,
    as_of: date,
) -> ExposureEstimate:
    """P(exposed) for one asset and finding as an interval, or Unknown with the reason.

    y = y_exec + deficit * hours_to_close / study_hours_per_day (study time converted to calendar days).
    Nothing is defaulted: a missing input yields Unknown rather than an estimate. A confidentiality_days of 0 is
    taken literally, so callers must pass None when the owner has not stated a lifetime.
    """
    if confidentiality_days is None:
        return _unknown("confidentiality lifetime not provided", timeline)
    if migration_exec_days is None:
        return _unknown("migration execution time not provided", timeline)
    if deficit is None:
        return _unknown("competency estimate not provided", timeline)
    if confidentiality_days < 0 or migration_exec_days < 0 or not 0.0 <= deficit <= 1.0:
        raise ValueError("inputs out of range")

    skill_days = 0.0
    if deficit > 0:
        if hours_to_close is None:
            return _unknown("hours needed to close the competency gap not provided", timeline)
        if study_hours_per_day is None or study_hours_per_day <= 0:
            return _unknown("learner study availability not provided", timeline)
        skill_days = deficit * hours_to_close / study_hours_per_day

    x_years = confidentiality_days / DAYS_PER_YEAR
    y_years = (migration_exec_days + skill_days) / DAYS_PER_YEAR
    elapsed = (as_of - timeline.anchor).days / DAYS_PER_YEAR
    if elapsed < 0:
        return _unknown("as-of date precedes the survey date", timeline, x_years=x_years, y_years=y_years)

    values = [conditional_probability(timeline, x_years + y_years, elapsed, b) for b in ("lower", "upper")]
    if any(v is None for v in values):
        return _unknown("beyond survey range", timeline, x_years=x_years, y_years=y_years)
    return ExposureEstimate("ok", min(values), max(values), None, x_years, y_years, timeline.edition, timeline.caveats)

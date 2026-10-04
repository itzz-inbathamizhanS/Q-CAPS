"""CRQC exposure probability from a survey curve: interpolation, anchoring, and Unknown instead of guessing."""
import json
from datetime import date

import pytest

from graph import exposure
from graph.exposure import Horizon, Timeline, estimate_exposure

# Synthetic curve so the arithmetic is checkable by hand; the real figures are covered by the provenance test.
TL = Timeline("test", date(2025, 1, 1), (Horizon(10, 0.2, 0.4), Horizon(20, 0.5, 0.8)))
Y = exposure.DAYS_PER_YEAR


def est(**kw):
    args = dict(confidentiality_days=5 * Y, migration_exec_days=5 * Y, deficit=0.0, hours_to_close=None,
                study_hours_per_day=None, timeline=TL, as_of=date(2025, 1, 1))
    args.update(kw)
    return estimate_exposure(**args)


def test_cumulative_interpolates_linearly_from_zero_and_never_extrapolates():
    assert exposure.cumulative(TL, 5, "lower") == pytest.approx(0.1)
    assert exposure.cumulative(TL, 15, "upper") == pytest.approx(0.6)
    assert exposure.cumulative(TL, 20, "upper") == pytest.approx(0.8)
    assert exposure.cumulative(TL, 20.01, "upper") is None


def test_probability_is_an_interval_between_the_two_curves():
    r = est()  # t = 10 years, survey date == today
    assert r.status == "ok"
    assert (r.p_low, r.p_high) == (pytest.approx(0.2), pytest.approx(0.4))


def test_horizons_are_anchored_to_the_survey_date_not_today():
    r = est(as_of=date(2030, 1, 1), confidentiality_days=2.5 * Y, migration_exec_days=2.5 * Y)  # e ~ 5y, t = 5y
    assert r.p_low == pytest.approx(0.1 / 0.9, rel=1e-2)   # (F(10)-F(5)) / (1-F(5)), lower curve
    assert r.p_high == pytest.approx(0.2 / 0.8, rel=1e-2)  # upper curve


def test_competency_gap_lengthens_migration_and_raises_exposure():
    skilled = est(deficit=0.0)
    unskilled = est(deficit=1.0, hours_to_close=10, study_hours_per_day=1)  # +10 calendar days
    assert unskilled.y_years == pytest.approx(skilled.y_years + 10 / Y)
    assert unskilled.p_high > skilled.p_high


@pytest.mark.parametrize("kw,reason", [
    (dict(migration_exec_days=None), "migration execution time not provided"),
    (dict(confidentiality_days=None), "confidentiality lifetime not provided"),
    (dict(deficit=None), "competency estimate not provided"),
    (dict(deficit=0.5, hours_to_close=None, study_hours_per_day=1), "hours needed to close the competency gap not provided"),
    (dict(deficit=0.5, hours_to_close=10, study_hours_per_day=None), "learner study availability not provided"),
    (dict(deficit=0.5, hours_to_close=10, study_hours_per_day=0), "learner study availability not provided"),
    (dict(confidentiality_days=30 * Y), "beyond survey range"),
    (dict(as_of=date(2024, 6, 1)), "as-of date precedes the survey date"),
])
def test_missing_or_unsupported_inputs_are_unknown_not_estimated(kw, reason):
    r = est(**kw)
    assert r.status == "unknown" and r.reason == reason and r.p_low is None and r.p_high is None


def test_study_availability_is_not_needed_when_there_is_no_gap():
    assert est(deficit=0.0, hours_to_close=None, study_hours_per_day=None).status == "ok"


def test_out_of_range_inputs_raise():
    with pytest.raises(ValueError):
        est(deficit=1.5)
    with pytest.raises(ValueError):
        est(migration_exec_days=-1)


def test_shipped_timeline_only_uses_verified_figures_with_provenance():
    raw = json.loads(exposure.DATA_FILE.read_text(encoding="utf-8"))
    for key in ("edition", "published", "landing_page_url", "pdf_url", "anchor_date", "caveats"):
        assert raw[key]
    loaded = exposure.load_timeline()
    assert [h.years for h in loaded.horizons] == [h["years"] for h in raw["horizons"] if h["verified"]]
    assert loaded.horizons[-1].years == 15  # nothing beyond the verified range is invented
    assert est(timeline=loaded, confidentiality_days=20 * Y).reason == "beyond survey range"

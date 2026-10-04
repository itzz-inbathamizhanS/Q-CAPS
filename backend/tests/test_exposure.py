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


def test_shipped_timeline_has_provenance():
    raw = json.loads(exposure.DATA_FILE.read_text(encoding="utf-8"))
    for key in ("edition", "published", "landing_page_url", "pdf_url", "anchor_date", "bound_meaning", "caveats"):
        assert raw[key]
    assert all(h["verified"] and h["pdf_page"] for h in raw["horizons"])
    loaded = exposure.load_timeline()
    assert [h.years for h in loaded.horizons] == [5, 10, 15, 20, 30]
    assert est(timeline=loaded, confidentiality_days=31 * Y).reason == "beyond survey range"  # never extrapolated


def test_shipped_horizons_are_reproduced_from_the_raw_counts():
    """The stored curves must equal the counts (PDF p.70) weighted by the assignment table (PDF p.71)."""
    raw = json.loads(exposure.DATA_FILE.read_text(encoding="utf-8"))
    n = raw["response_counts"]["respondents"]
    for h in raw["horizons"]:
        counts = raw["response_counts"]["by_horizon_years"][str(h["years"])]
        assert sum(counts) == n
        for bound, weights in (("lower", raw["assignment"]["pessimistic"]), ("upper", raw["assignment"]["optimistic"])):
            assert h[bound] == pytest.approx(sum(c * w for c, w in zip(counts, weights)) / n, abs=5e-5)


def test_shipped_horizons_match_the_figures_the_report_states():
    """Rounded values quoted in the report text: 28-49% at 10 years, 51-70% at 15 years (PDF p.6 and p.32)."""
    by_years = {h.years: h for h in exposure.load_timeline().horizons}
    assert (round(by_years[10].lower * 100), round(by_years[10].upper * 100)) == (28, 49)
    assert (round(by_years[15].lower * 100), round(by_years[15].upper * 100)) == (51, 70)
    assert round(by_years[5].upper * 100) == 15 and round(by_years[20].lower * 100) == 69

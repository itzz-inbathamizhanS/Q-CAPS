"""Beta-posterior competency deficit: sample size matters and an unassessed topic is Unknown."""
import pytest

from graph.competency_estimate import expected_deficit, posterior_expected_shortfall


def test_matches_closed_forms():
    # Beta(1, 1): integral of (T - c) over [0, T] is T^2 / 2.
    assert posterior_expected_shortfall(1, 1, 0.8) == pytest.approx(0.32, abs=1e-6)
    # Beta(2, 1) has density 2c, giving T^3 / 3.
    assert posterior_expected_shortfall(2, 1, 0.8) == pytest.approx(0.8 ** 3 / 3, abs=1e-6)


def test_unassessed_is_unknown_not_zero_or_half():
    assert expected_deficit(None, None, 0.8) is None
    assert expected_deficit(0, 0, 0.8) is None


def test_more_correct_answers_mean_a_smaller_deficit():
    deficits = [expected_deficit(k, 10, 0.8) for k in (0, 3, 6, 8, 10)]
    assert deficits == sorted(deficits, reverse=True)
    assert deficits[0] > 0.7 and deficits[-1] < 0.05


def test_same_percentage_with_more_items_is_more_certain():
    # 8/10 and 80/100 are both exactly at the 0.8 target; the larger sample leaves less chance the learner is below it.
    assert expected_deficit(80, 100, 0.8) < expected_deficit(8, 10, 0.8)


def test_a_failing_result_has_a_larger_deficit_with_more_evidence():
    assert expected_deficit(0, 40, 0.8) > expected_deficit(0, 5, 0.8)


def test_invalid_inputs_raise():
    with pytest.raises(ValueError):
        expected_deficit(11, 10, 0.8)
    with pytest.raises(ValueError):
        expected_deficit(1, 10, 1.5)

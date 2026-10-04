"""Competency estimate with uncertainty from graded quiz results.

A topic result of k correct out of n items is treated as evidence about the learner's true proficiency c in [0, 1],
with a flat Beta(1, 1) prior, giving a Beta(1 + k, 1 + n - k) posterior. The deficit used by the exposure model is the
posterior expectation of max(0, target - c), so a 5-item and a 50-item result with the same percentage give
different deficits. No assessment at all is Unknown (None), never zero and never 50%.

Only the latest graded attempt on a topic is used: retakes repeat items and follow training, so pooling attempts
would treat them as independent evidence. Recency weighting and IRT/Rasch ability estimates are later steps.
See docs/research/COMPETENCY_ADJUSTED_MOSCA_SPEC.md section 2.3.
"""
from math import exp, lgamma, log
from typing import Optional

_STEPS = 2000  # Simpson intervals; the Beta density is smooth for a, b >= 1


def _beta_pdf(c: float, a: float, b: float) -> float:
    if c <= 0.0 or c >= 1.0:
        # Finite limits for a, b >= 1; the endpoint is only reached by the integration grid.
        c = min(max(c, 1e-12), 1.0 - 1e-12)
    return exp(lgamma(a + b) - lgamma(a) - lgamma(b) + (a - 1) * log(c) + (b - 1) * log(1.0 - c))


def posterior_expected_shortfall(a: float, b: float, target: float) -> float:
    """E[max(0, target - c)] for c ~ Beta(a, b), by Simpson's rule on [0, target]."""
    if not 0.0 <= target <= 1.0:
        raise ValueError("target must be in [0, 1]")
    if target == 0.0:
        return 0.0
    h = target / _STEPS
    total = 0.0
    for i in range(_STEPS + 1):
        c = i * h
        weight = 1 if i in (0, _STEPS) else (4 if i % 2 else 2)
        total += weight * (target - c) * _beta_pdf(c, a, b)
    return total * h / 3.0


def expected_deficit(correct: Optional[int], total: Optional[int], target: float) -> Optional[float]:
    """Expected competency deficit in [0, target], or None when the topic has not been assessed."""
    if correct is None or total is None or total <= 0:
        return None
    if not 0 <= correct <= total:
        raise ValueError("correct must be between 0 and total")
    return posterior_expected_shortfall(1.0 + correct, 1.0 + total - correct, target)

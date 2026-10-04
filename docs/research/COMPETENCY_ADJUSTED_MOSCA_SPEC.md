# Competency-adjusted Mosca model: specification

Status: decisions approved by the project owner; implementation in progress (see section 8).
It replaces the unjustified constants in `backend/main_api/graph/risk_paths.py` and the greedy selection in
`graph/optimizer.py`.

Labels: **Existing** (in the code today), **Proposed**, **Assumption** (a value that must be chosen and
defended), **Hypothesis** (testable claim), **Evidence required**.

## 1. Problem with the current model

Existing, verified in the code:

| Item | Where | Problem |
|---|---|---|
| `risk = technical_risk * (0.2 + 0.8 * deficit)` | `risk_paths.py` | No source for 0.2 or 0.8. Unitless score that cannot be interpreted or compared. |
| `lifetime_factor = 1 + 0.1 * years` | `optimizer.py` | Arbitrary. Treats confidentiality lifetime as a multiplier instead of the quantity Mosca's inequality actually uses. |
| `time_cost = 2.0` hours per path | `optimizer.py` | Fixed. Two findings needing the same competency are charged twice, although one training covers both. |
| Greedy by risk | `optimizer.py` | Not optimal for a time-budget selection problem. |
| `risk_score > 5` means Critical | `recommendation.py` | Tied to the old scale. |

The graph path has never produced output on real data before commit 5022e63, so removing these terms changes no
stored result and needs no data migration.

## 2. Model

### 2.1 Mosca's inequality (background)

Exposure exists when `x + y > z`: `x` is how long the data must stay confidential, `y` is how long migration takes,
`z` is the time until a cryptographically relevant quantum computer (CRQC) exists. Citation to verify before use:
M. Mosca, "Cybersecurity in an era with quantum computers: will we be ready?", IEEE Security & Privacy, 2018.

### 2.2 Extension: `y` depends on measured competency

```
y = y_exec + y_skill          y_skill = d * H / A
```

| Symbol | Meaning | Source |
|---|---|---|
| `x` | confidentiality lifetime | `Asset.confidentiality_lifetime` (days, **Existing**), entered by the asset owner |
| `y_exec` | time to carry out the migration if the team already has the skills | **Required input** from the asset owner. No default. Stored with who entered it, when, and an optional free-text basis. Bounds enforced on the backend. Missing means the asset's result is `Unknown` ("migration execution time not provided") and the asset is excluded from optimization. Demo accounts get seeded values labelled `DEMO DATA`; that is a property of the demo data, not a code default. |
| `d` | competency deficit in [0, 1] | section 2.3 |
| `H` | study hours to close a full deficit | **Assumption**: the authored module durations. These are estimates, not measurements, and are labelled as such until study data replaces them. |
| `A` | study hours per calendar day | Declared by the **learner**, never by the asset owner (self-reported, labelled as such). When the owner and learner differ, the owner assigns a responsible learner and that learner's own declared availability is used. |

### 2.3 Competency estimate with uncertainty

**Existing:** latest quiz percentage per topic. **Proposed:** treat the learner's responses on a topic as `k` correct
of `n` and use a `Beta(1 + k, 1 + n - k)` posterior; the deficit is the posterior expectation of
`max(0, target - c)`. Unassessed (`n = 0`) is the flat prior, reported as Unknown, not zero and not 50%. Old
responses are down-weighted with `freshness_factor` (half-life is an **Assumption** until calibrated). This is
replaced by IRT or Rasch ability estimates once the item bank is calibrated.

### 2.4 The CRQC time: a distribution from a cited survey, not a chosen `z`

Source: Global Risk Institute / evolutionQ, *Quantum Threat Timeline Report 2025* (M. Mosca, M. Piani; March 2026;
26 experts). The event is "a quantum computer able to factorize a 2048-bit number in less than 24 hours" (PDF p.70).
The report publishes the raw response counts at 5, 10, 15, 20 and 30 years (PDF p.70) and the probability assigned
to each answer bin under an optimistic and a pessimistic reading (PDF p.71). The two curves are computed from those
tables, and a test recomputes them and checks them against the figures the report quotes (28-49% at 10 years,
51-70% at 15 years).

- Output is **P(exposed) reported as an interval** between the pessimistic (lower) and optimistic (upper) curves.
  The interval reflects the width of the answer bins the experts chose from, **not** disagreement among experts and
  not a confidence interval (PDF p.30).
- Figures live in a version-pinned data file, `backend/main_api/graph/data/crqc_timeline.json`, with edition,
  publication date, URLs, PDF page, raw counts and a `verified` flag.
- Horizons are anchored to the **survey date**, not today. The report gives no fielding date and aligns horizons to
  calendar years (PDF p.33; a 10-year horizon is roughly 2035, PDF p.54), so the anchor is year-level (2025-01-01) and the sensitivity
  analysis must vary it within 2025. With `e` the years elapsed since the survey and `F` the
  survey's cumulative curve, the probability that a CRQC arrives within `t` years from now, given none has
  arrived yet, is `(F(e + t) - F(e)) / (1 - F(e))`. Exposure uses `t = x + y`.
- Piecewise-linear interpolation between published horizons, with `F(0) = 0`. This is a modelling choice and is
  documented as one.
- No extrapolation past the last published horizon (30 years after the survey): the result is `Unknown`, "beyond survey range".
- NIST's RSA/ECC deprecation dates are policy deadlines, not CRQC estimates. They are kept out of this model and may
  appear later as a separate compliance overlay.
- If the UI needs a simpler view, reference years may be shown as values derived from the same curve and labelled
  as derived.

### 2.5 Selecting interventions

The decision unit is the **competency**, because one training covers every finding that needs it.

- `cost_c = d_c * H_c` hours. `gain_c` is the reduction in P(exposed) summed over the open findings that require
  `c` when `d_c` falls to 0. P(exposed) is an interval, so gains are intervals; ranking uses a stated rule
  (section 7, decision 2).
- Choose the set of competencies that maximizes total gain within the available hours: an exact 0/1 knapsack. The
  current greedy selection is kept only as the comparison baseline.
- Findings with no mapped competency (`competency_map.py`) and assets with no `y_exec` are excluded from
  optimization.

### 2.6 Explainability

Each recommendation states the finding, `x`, `y_exec`, `y_skill` (and that `A` is self-reported and `H` is an
authored estimate), the P(exposed) interval before and after training, the survey edition, and the competency
estimate with its uncertainty. No opaque score.

## 3. Hypotheses and evidence

| ID | Hypothesis | Measure | Evidence required |
|---|---|---|---|
| H1 | Ranking by competency-adjusted exposure differs materially from quiz-score-only ranking. | Kendall's tau and top-k overlap on real learner and scan data. | Offline, existing data only. |
| H2 | Learners given the competency-adjusted recommendation gain more on migration-relevant competencies than those given quiz-only or scanner-informed recommendations. | Pre/post gain on a fixed test form. | Randomized A/B study, ethics approval, recommendation logs. |
| H3 | Quiz mastery predicts successful remediation of the matching finding. | Verified-closure rate by pre-training score band. | Lab target and verified before/after scans. |

## 4. Sensitivity analysis (required)

Vary `y_exec` over a stated range, `H` by plus or minus 50%, `A`, the survey edition (when a second edition is
added) and the freshness half-life. Report whether the selected competency set and ranking stay stable. A result
that flips with a small change is reported as such.

## 5. Limitations

- `y_exec` is organisation-specific and cannot be measured here. The contribution is the coupling of `y` to
  measured competency, not an estimate of real migration duration.
- One learner is not a team. A team-level model is future work.
- `H` is an authored estimate and `A` is self-reported until study data exists.
- The survey reflects expert opinion at one point in time and is sensitive to who was surveyed.
- No novelty claim until a literature search covers existing quantum-risk and workforce-readiness models.

## 6. Removed

The `0.2 + 0.8 * deficit` multiplier and the `1 + 0.1 * years` lifetime factor are deleted outright, not kept as
fallbacks: data lifetime is `x` and competency enters through `y`, so keeping either would double-count. The
`risk_score > 5` Critical threshold is removed with them. `test_graph_optimizer.py` is rewritten against the new
objective.

## 7. Decisions on weighting, ranking and labels (approved)

1. **`asset.criticality` does not enter the ranking.** It is an uncalibrated owner input, and a hidden weight is what
   this redesign removes. It stays stored and displayed. Gain is the reduction in P(exposed) summed over findings,
   so the model reports exposure per asset and does not claim to rank assets by business impact.
2. **Ranking with intervals:** competencies are ordered by the lower bound of the gain (a recommendation then holds
   under the optimistic survey curve), with the upper bound as the tie-break.
3. **Labels come from the interval, not from a tuned cutoff.** 0.5 is the "more likely than not" point:
   - *Likely exposed*: P(exposed) lower bound is at least 0.5.
   - *Possibly exposed*: upper bound is at least 0.5 and lower bound is below 0.5.
   - *Unlikely within the survey range*: upper bound is below 0.5.
   - *Unknown*: shown as Unknown with its reason.
   The 0.5 value is a presentation threshold, not a calibrated risk tolerance, and the UI must show the interval too.

## 8. Implementation plan

1. `graph/exposure.py` and `graph/data/crqc_timeline.json`: pure functions for the cumulative curve, conditional
   probability, `y`, and the interval result with Unknown reasons; unit tests. (Verified horizons only.)
2. Done: all horizons computed from the PDF's raw counts; the fielding date is not stated in the report.
3. Beta-posterior competency estimate in the projection.
4. `y_exec` and learner availability: schema, validation, authorization, audit fields, demo seed.
5. Competency-level knapsack; rewrite the tests; recommendation text and dashboard panel.
6. Offline H1 analysis and the sensitivity report.

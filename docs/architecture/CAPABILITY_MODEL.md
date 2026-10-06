# Capability model

How Q-CAPS estimates a learner's capability per competency. Code: `backend/main_api/competency/capability.py`. Data:
table `learner_capabilities`. API: `GET /api/users/{user_id}/capabilities` (the user or an admin only; 403 otherwise).

Status: the level thresholds are **pilot hypotheses** (`competency_model.json`, `capability_levels.status`), and every
competency tag is **proposed-unreviewed** until an expert reviews it. Estimates are therefore provisional. Every row
records the `model_version` that produced it and how many of its items were reviewed (`knowledge_by_depth.reviewed_items`).

## Principles

1. **Recomputed, not accumulated.** Each estimate is computed from all stored evidence, every time. The old
   `update_capability_state` used `max()` and could never go down, so it is gone. The same evidence always gives
   the same estimate.
2. **Unknown is not zero.**
   - A score with no evidence of its kind is `null`.
   - A competency with fewer than `min_items_for_known` (3) scored quiz items is `Unknown`.
   - A competency with no evidence at all has no row. The skill matrix (T1.6) shows that as Unknown and never as
     rank 0 or 50%.
3. **Thresholds come from the model file.**
   - The level rules live in `competency_model.json`, under `capability_levels.levels[].rule`. Nothing is
     hard-coded.
   - A content test (`frontend/scripts/competency-validation.cjs`) checks that each rule matches its prose
     `evidence` text.

## Evidence

| Component | Source | Rule |
|---|---|---|
| `knowledge_score` | `quiz_responses` joined to `quiz_items` with `competency_id` and `depth`, graded attempts only | The **latest** graded response per item counts. Unanswered items in a submitted attempt were graded wrong and count as wrong. Share correct over those items. |
| `knowledge_by_depth` | same | `{correct, total}` for the Aware/Explain, Apply and Analyse groups, plus `reviewed_items`. |
| `procedural_score` | labs (`activity_attempts`) and missions (`mission_runs`) whose content carries a `competencies` tag | **Lab:** passed when the learner's *first* answer was correct. Retrying until correct completes the lab for XP but is not counted as a pass. **Mission:** the latest finished run counts; passed when its band is `success` or `partial`, the bands that also earn XP. **BB84 simulation:** the run now records `success` or `failure`. Score = passed / attempted. |
| `operational_score` | `verifications` of interventions for the competency, on assets the learner owns | Passed when the technical result shows `remediated` and `same_asset`. Nothing stores verifications yet (see T1.8), so this is `null` today. |
| `evidence_count` | | Distinct items, practicals and verifications. |
| `last_evidence_at` | | Newest evidence time. |
| `freshness` | | `1.0`, or `0.0` when the newest evidence is older than `stale_after_months` (12); `null` without evidence. |
| `confidence` | | `null`: not estimated. The level, `evidence_count` and depth counts carry the uncertainty. |

## Levels

The levels are applied in rank order. A level holds when its rule holds and the level it `requires` already holds.
The highest level that holds wins.

| Level | Rule (`competency_model.json`) |
|---|---|
| Unknown | fewer than 3 scored items |
| Beginner | at least 3 scored items |
| Developing | Beginner, and at least 60% correct on Aware/Explain items (at least one such item) |
| Proficient | Developing, at least 70% on Apply items, and one passed practical tagged at Apply or Analyse depth |
| Advanced | Proficient, and at least 70% on Analyse items. The alternative route, "a passed capstone component", cannot apply because the platform records no capstone evidence. |

Consequences worth knowing:

- **Apply items alone:** a learner who answers only Apply items stays Beginner, because Developing is defined on
  Aware/Explain items.
- **Item counts:** the 3-item threshold counts all scored items for the competency. A depth group with very few
  items can decide a level. The coverage report (`docs/curriculum/COMPETENCY_COVERAGE.md`) lists competencies with
  no Apply items or no practical; those cannot reach Proficient.

## When estimates are recomputed

| Event | Competencies recomputed |
|---|---|
| Quiz attempt graded (`quiz_service.grade_attempt`) | those of the attempt's tagged items |
| Lab answer (`activities.service.answer_lab`) | the lab's tags |
| Mission finished (`choose`, `decide_bb84`) | the mission's tags |
| Intervention verified (`POST /api/interventions/{id}/verify`) | the intervention's competency, for the asset owner |
| `python -m competency.capability`, `deploy_bootstrap.py`, demo account creation | all, for every user |

The learner's action is already stored when the recompute runs. If the recompute fails, the action is not failed:
the error is logged with its traceback and the next recompute repairs the estimate.

## Consumers

- The exposure-graph projection (`graph/projection.py`) turns each row into a `HAS_CAPABILITY` edge for the
  competency node `comp_{competency.id}`.
- The closure page shows a capability row.
- The skill matrix (`SKILL_MATRIX.md`) and the recommendation engine (`RECOMMENDATIONS.md`) build on these rows.

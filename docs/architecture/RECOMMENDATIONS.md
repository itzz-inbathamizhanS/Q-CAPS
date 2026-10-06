# Recommendations

One engine: `backend/main_api/recommendation.py`, served by `GET /api/users/{user_id}/recommendation` (the user only).
The Learning page and the Dashboard both use it. The browser-side engine (`learningRecommendation.ts`) and the
exposure-graph optimizer path were removed in T1.7.

## Tiers

1. **Gap tier (`engine: "gap"`).** The tier uses rows of the skill matrix (`SKILL_MATRIX.md`) that have a gap
   (critical, high or medium) or are `unassessed`.
   - **Order:** by gap class, then the severity of the most severe driving finding, then competency code. At most
     5 recommendations; two gaps that lead to the same module are merged into one recommendation.
   - **Action:**
     - `assess`: demonstrated is Unknown. The recommendation is the module with the most items tagged with the
       competency at any depth, so the learner passes the 3-item threshold fastest.
     - `practice`: the learner is at Developing or above and the requirement is Proficient or Advanced. The
       recommendation is a lab or mission tagged with the competency at Apply or Analyse depth, plus the module
       with the most items at the required depth.
     - `learn`: any other case. The recommendation is the module with the most items at the depth of the next
       level (Aware/Explain for Developing, Apply for Proficient, Analyse for Advanced).
   - **Choosing the module:** a module teaches a competency when its active quiz items are tagged with it.
     Diagnostics are excluded. Ties go to the module that comes first in the course.
   - **Prerequisites:** if the chosen module has a prerequisite the learner has not passed, the engine follows
     the chain and recommends the first open prerequisite instead, with a `prerequisite` reason.
2. **Score tier (`engine: "score"`).** Used when no open finding creates a gap: quiz-topic scores plus scanner
   context (`recommendation_scores.py`). Candidates are ranked in explicit tiers:
   - attempted topics below Strong (score minus the scanner boost);
   - then unattempted topics (most scanner-flagged first);
   - then Strong topics.

   **Unattempted topics are never given a stand-in score.** The old code ranked them as if the learner had scored
   50%.
3. **No evidence (`engine: "none"`, `status: "no_evidence"`).** Nothing has been assessed or scanned.

## Response

The legacy fields (`course_id`, `title`, `topic`, `priority`, `reason`, `quiz_score`, `scanner_risk`, `status`)
describe the top recommendation. The response also has these fields:

| Field | Meaning |
|---|---|
| `engine` | `gap`, `score` or `none` |
| `reasons` | Structured factors behind the top recommendation |
| `recommendations` | The ranked gap-tier list, each item with `module_id`, `action`, `practical`, `competencies`, `priority` and its own `reasons` |
| `graph_paths` | Deprecated and always `[]`. It is kept so that older clients do not break. |

Priority labels in the gap tier: critical → Critical, high → High, medium → Moderate, unassessed → Unassessed.

### Reason types

| `type` | Fields | Meaning |
|---|---|---|
| `gap` | competency, competency_name, required, demonstrated, gap_class, finding_id, finding_title, finding_severity, requirement_id, other_findings | An open finding needs a level above the demonstrated one |
| `unassessed` | same as `gap` | The required competency has no estimate yet |
| `teaches` | module_id, competency, items_at_depth, tagged_items, depths | Why this module was chosen |
| `practical` | kind, id, title, depth, module_id, competency | The practical needed for Proficient |
| `prerequisite` | module_id, unlocks | The chosen module is locked; this one comes first |
| `no_content` | competency | No module or practical is tagged with the competency |
| `model_status` | requirement_map_version, requirement_map_status, levels_status | The draft status of the models behind the result |
| `quiz_score` | topic, score, band | Score tier: the measured topic score |
| `not_attempted` | topic | Score tier: an untested topic (its own tier) |
| `scanner` | topic, risk | Score tier: scan context raised urgency |
| `all_strong` | | Score tier: no gap |
| `no_evidence` | | Nothing assessed or scanned |

The UI renders these reasons in a "Why this?" disclosure (`RecommendationReasons.tsx`). Finding reasons link to
the finding's closure page.

## Changed behaviour (T1.7)

- **`check_recommendation.py` test 7.** Its expectation changed: a scanner-flagged, measured Moderate topic now
  ranks before an unattempted topic. The old outcome depended on the 50% stand-in.
- **`graph/competency_map.py` is deleted.** The graph projection takes its `REQUIRES` edges from
  `finding_requirements`, so the system has one map from findings to competencies.
- **The graph optimizer (`graph/optimizer.py`, `graph/risk_paths.py`) is no longer used by any endpoint.** It
  is still covered by its own tests. Its risk formula uses constants that have no source, so it should be
  removed or redesigned before it is used again.

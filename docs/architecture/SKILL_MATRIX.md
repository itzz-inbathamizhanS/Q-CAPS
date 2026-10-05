# Skill matrix and gap classes

`GET /api/users/me/skill-matrix` (signed-in learner only). Code: `backend/main_api/competency/skill_matrix.py`.
UI: the Skills page (`SkillMatrixTable`).

## Rows

A row exists for every competency that is **required** (by an open finding) or **assessed** (has a capability row).

| Field | Meaning |
|---|---|
| `required_level` | The highest `required_level` among the `finding_requirements` of the learner's **open** findings, for the current requirement-map version. Scope: the learner's own assets plus shared, ownerless records. Admins get the same scope, not every user's assets. `null` means no current requirement. |
| `demonstrated_level` | `learner_capabilities.level` (`CAPABILITY_MODEL.md`), or `Unknown` without a row |
| `gap` | `rank(required) - rank(demonstrated)`. It is **`"unassessed"` when demonstrated is Unknown**, because Unknown is never rank 0. It is `null` when there is no requirement. |
| `gap_class` | Uses the v1 rule below; `unassessed` for Unknown; `null` without a requirement |
| `driving_findings` | The open findings that create the requirement (id, type, title, severity, requirement), most severe first |
| `evidence_count`, `last_evidence_at`, `knowledge_score`, `procedural_score` | From the capability row |

Level ranks come from `competency_model.json`: Unknown 0, Beginner 1, Developing 2, Proficient 3, Advanced 4.
They are used only when both levels are known.

## Gap class, v1 (a hypothesis, not a validated scale)

| Rank gap | Class |
|---|---|
| 3 or more | critical |
| 2 | high |
| 1 | medium |
| 0 or less | none (requirement met) |

If any driving finding has severity 0.9 or higher (a high finding), a positive gap is raised one class, capped at
critical. A met requirement is never escalated. The `pqc.auth.classical_certificate` planning finding has severity
0.3, so it never escalates.

Rows are ordered critical, high, medium, unassessed, none, then rows with no requirement.

## Display

- **Unknown** is shown in italics with a dashed underline and the tooltip "Fewer than 3 scored items for this
  competency", so it never looks like a low level.
- **Gap classes** are badges.
- **Driving findings** link to `/closure/{finding_id}`.
- **Draft labelling:** the page states the requirement-map version and its review status, and that the level
  thresholds are pilot hypotheses.

## Example

A learner whose verified scan found `pqc.kex.classical_only` (severity 0.6) and who has NET.4 at Developing:

| Competency | Required | Demonstrated | Gap | Class |
|---|---|---|---|---|
| NET.4 | Proficient | Developing | 1 | medium |
| PQC.6 | Proficient | Unknown | unassessed | unassessed |

If the same scan also found `tls.version.obsolete` (severity 0.9), which also needs NET.4 Proficient, the NET.4
row escalates to **high**.

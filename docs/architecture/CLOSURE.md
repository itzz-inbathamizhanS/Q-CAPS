# Closure loop: finding → requirement → gap → intervention → verification

UI: `/closure/:findingId` (`ClosurePage.tsx`). The scanner's asset panel links each tracked finding there, and so do
the skill matrix and the "Why this?" reasons. Backend: `closure/service.py`.

## What the page shows

The page reads only server data, and each section has its own loading and error state.

| Section | Source |
|---|---|
| Finding | `GET /api/findings/{id}` (404 for findings the user may not see) |
| Requirements | `GET /api/findings/{id}/requirements` (risk-to-skill map) |
| Your skill gaps | `GET /api/users/me/skill-matrix`, filtered to rows driven by this finding |
| Interventions | `GET /api/findings/{id}/interventions`. Admins create interventions; with none, the page says "No intervention assigned yet". |
| Evidence | `GET /api/evidence/{finding.evidence_id}` |
| Closure timeline | `GET /api/closures/{id}`, oldest first |

## Verification (`POST /api/interventions/{id}/verify`)

**Who:** the owner of the finding's asset, or an admin. Shared, ownerless records are verified by admins only (403
for anyone else). Users who cannot see the finding get 404.

**Input:** none. A body containing `learner_result`, `after_scan_raw` or `technical_result` is rejected with 422.
Both results are computed by the server:

| Result | Rule |
|---|---|
| Technical | The finding is `RESOLVED`. This means a later **verified** scan completed the check that supports the finding and no longer saw it (`evidence_service.ingest_scan`). If that check failed or did not run, the finding stays open. The before evidence is the last scan that observed the finding; the after evidence is the newest verified scan of the same asset. |
| Learner | The asset owner's capability estimate for the intervention's competency is recomputed first. It must reach the `required_level` that `finding_requirements` gives for that competency. Without a mapped requirement, the knowledge score must reach the intervention's `minimum_score`. |

| Outcome | When |
|---|---|
| `CLOSED` | Both results are met |
| `PARTIALLY_CLOSED` | One result is met |
| `OPEN` | Neither is met |

Every verification is stored in `verifications` with `verifier_version` set to `closure-v2`, and a
`closure_events` row is appended:

- **Hashing:** `event_hash` is the SHA-256 of the canonical JSON of the event's content plus
  `previous_event_hash`. The function `verify_chain` detects any edited or removed event.
- **Operational evidence:** the stored verification feeds the learner's `operational_score`
  (`CAPABILITY_MODEL.md`).

## What was wrong before (T1.8)

The implementation plan listed this loop as "already sound". It was not:

- **Client-supplied results.** The endpoint accepted `learner_result` (knowledge and procedural scores) and a raw
  "after" scan from the client, so a learner could close their own finding by sending numbers.
- **Broken asset check.** The verifier compared `asset_id` fields that normalized payloads do not contain, so any
  two scans counted as "the same asset". It also only looked at a PQC algorithm field.
- **Nothing was stored.** No verification or closure event was ever written, so no hash chain existed.

The old `closure/engine.py` and `closure/verifier.py` were removed; `closure/state_machine.py` (the status names) is
kept.

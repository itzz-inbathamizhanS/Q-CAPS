# Diagnostic assessment

The baseline and reassessment instrument. Before T1.5 it ran in the browser: `frontend/src/data/assessmentData.ts`
shipped the answer key (`correctOptionId`), scored the attempt client-side and kept the result in localStorage. It is
now a server-side quiz module and that file is gone.

## Instrument

| Item | Value |
|---|---|
| Content | `content/Quizzes/Diagnostic/DIAG-A_diagnostic_questions.json` (module `DIAG-A`, `"kind": "diagnostic"`) |
| Items | The 10 original questions over 4 domains, each tagged with a competency and depth (`proposed-unreviewed`) and a reporting `domain` |
| Draft parallel form | `content/drafts/DIAG-B_draft.json`, proposed-unreviewed and **not served** (see the note in the file) |

## How it differs from a module quiz

It uses the same endpoints as every quiz (`POST /api/quizzes/DIAG-A/attempts`, `/answers`, `/submit`), with these
differences, all decided on the server:

- **Fixed form.** Every item is issued (module quizzes draw up to 15 at random); only the order is shuffled.
- **No feedback, no key.** `reveal_answers` is false, so neither per-answer feedback nor the graded result
  contains the correct option or explanation.
- **No reward.** No XP, no module pass, and no `quiz_scores` row (that table feeds the legacy topic
  recommendations and readiness).
- **Purpose recorded.** `quiz_attempts.attempt_purpose` is `diagnostic_pre` for the learner's first graded
  diagnostic and `diagnostic_post` for any later one. The client cannot choose it.
- **Capability evidence.** The graded responses count as capability evidence like any tagged item
  (`CAPABILITY_MODEL.md`).

`GET /api/diagnostic/results` returns the signed-in learner's graded diagnostics, newest first, with per-domain
counts computed from the stored responses.

## Frontend

- **Assessment page.** `Assessment.tsx` starts an attempt, lets the learner move between and review answers,
  then submits all answers at once. It shows the result the server returns.
- **Skills and Learning pages.** Both read `/diagnostic/results`. Loading, error and no-result states are
  distinct.
- **Old localStorage results** are never imported, because they cannot be verified. The Skills page tells the
  learner once and clears the old entry.

## Limitations (reported, not fixed)

- **Too few items per competency.** Ten items over seven competencies is below the 3-items-per-competency
  threshold, so the diagnostic gives domain-level evidence and cannot move any competency out of Unknown on its
  own.
- **Retest effect.** Until DIAG-B is reviewed and calibrated against DIAG-A, a reassessment reuses DIAG-A. The
  result page tells the learner that part of any change may come from having seen the questions before.

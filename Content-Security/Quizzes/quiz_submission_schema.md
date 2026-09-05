# How Quizzes Connect to the Shared Data Schema

Two separate objects are involved — don't confuse them:

## 1. Question bank (what I built — `*_questions.json`)
This is **content**, owned by Aasif. Niranjan's frontend fetches this to render the quiz UI (question text, options, which one is correct, explanations). It is not part of `shared_data_schema.md` because it's never sent between team members over the API — it's static content.

## 2. Quiz Submission object (defined in `shared_data_schema.md` — owned jointly)
After a user finishes a quiz, Niranjan's frontend must package the result into **exactly** this shape before sending it to Vishnu Priya's backend:

```json
{
  "user_id": "U-992400",
  "module_id": "module_1_basics",
  "questions_answered": 7,
  "correct_answers": 6,
  "time_taken_seconds": 210,
  "passed": true
}
```

**How the frontend builds this from my question banks:**
- `module_id` → copy directly from the top of the question bank file (e.g. `"module_1_basics"`).
- `questions_answered` → `questions.length` (how many were in the quiz).
- `correct_answers` → count of user answers where their selected index matched `correct_index`.
- `time_taken_seconds` → frontend's own timer, started on quiz load, stopped on submit.
- `passed` → `(correct_answers / questions_answered) * 100 >= passing_score_percent` (the threshold is included in each question bank file).
- `user_id` → comes from the logged-in session (see `backend/README.md` — this is the `_id` returned at login).

**Action item for the team:** Niranjan and Vishnu Priya should confirm this mapping together before wiring `POST /api/submit-quiz`, since I (Aasif) don't own the frontend submit logic or the backend endpoint — I only own the content and the field names on my side (`module_id`, question data) that need to line up.

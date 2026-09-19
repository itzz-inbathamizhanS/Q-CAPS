# Q-CAPS UI Spec — Batch 1: Core Knowledge Layer
**Screens covered:** Dashboard, Curriculum Map, Course Module, Quiz Interface
**Grounded in real data from:** `MASTER_CURRICULUM_INDEX.md`, actual course/quiz files, `shared_data_schema.md`, `master_badges_and_certificates.md`
**Visual system:** follow `DESIGN_PLAN_FOR_STITCH.md` Section 2 (base palette/type) — this spec covers content and behavior, not color hex values, which are already locked.

---

## SCREEN 1: Dashboard

### Purpose
Landing page after login. Answers "where am I, what's next, how am I doing" in one glance.

### Data bindings (real fields, not invented ones)
Pulled directly from the Common User Profile object (`shared_data_schema.md`):
`readiness_score`, `total_xp`, `global_rank`, `unlocked_badges`, `recommended_next_module`.

### Layout (top to bottom)

**Region A — Stat strip** (4 items, horizontal row)
| Stat | Source field | Display format |
|---|---|---|
| Readiness | `readiness_score` | `78%` large numeral, small progress bar beneath |
| Total XP | `total_xp` | `14,850` large numeral, no bar |
| Rank | `global_rank` | `#142` — if `null` (new user), show `Unranked` instead of `#null` |
| Badges earned | `unlocked_badges.length` | `18 / 38` (38 = total badge count from `master_badges_and_certificates.md`, including capstones and certs) |

**Region B — "Continue" card** (single prominent card, not competing with Region A)
- Title: the exact string from `recommended_next_module` (e.g., `A1: Computing Foundations` for a new user — this is the corrected default, not the old stale one)
- One-line description: pulled from that module's course file frontmatter (e.g., A1's Learning Objectives, first bullet only, truncated)
- Primary button: **"Resume →"** — click navigates directly to the Course Module screen for that `module_id`, scrolled to the learner's last-read position if returning, or the top if first visit.
- **Empty/new-user state:** if `completed_modules` is empty, card reads "Start here" instead of "Continue" and always points to `track_a_a1_computing_foundations`.

**Region C — Track progress (4 rows, one per track)**
Each row: track letter badge (A/B/C/D), track name, a thin progress bar (`completed modules in track / total modules in track` — A=8, B=11, C=11, D=6), percentage label.
- **Click behavior:** clicking any track row navigates to the Curriculum Map screen, auto-expanded to that track.
- **Locked state:** Track B/C/D rows show a lock icon and are visually dimmed (not clickable-disabled, still clickable — clicking a locked track still navigates to Curriculum Map so the learner can see prerequisites, it just doesn't let them jump into a module).

**Region D — Recent badges strip** (horizontal scroll, max 8 visible)
Shows the most recently earned badges from `unlocked_badges`, newest first. Each badge: icon + exact badge string beneath (e.g., `Computing Foundations`). Click → navigates to Badges & Certificates screen, scrolled to that badge.
- **Empty state:** if `unlocked_badges` is empty, region shows a single dim placeholder card: "Your first badge is one quiz away" with a button linking to Region B's recommended module.

### Interaction summary
| Element | Click behavior |
|---|---|
| "Resume →" button (Region B) | → Course Module screen, `module_id = recommended_next_module`'s ID |
| Any track row (Region C) | → Curriculum Map, that track auto-expanded |
| Any badge (Region D) | → Badges & Certificates, scrolled to that badge |
| Stat strip items (Region A) | Not clickable — display only |

---

## SCREEN 2: Curriculum Map

### Purpose
The visual form of `MASTER_CURRICULUM_INDEX.md`. Shows the full A→B→C→D linear path and exactly where the learner is in it.

### Data bindings
Reads the full module list per track from `MASTER_CURRICULUM_INDEX.md`, cross-referenced against the learner's `completed_modules` array to determine each node's state.

### Layout

**Region A — Page header**
Title: "Curriculum Map." Subtitle: one line, e.g., "36 modules across 4 tracks — your path to PQCTP certification."
Overall progress bar: `completed_modules.length / 36`.

**Region B — 4 collapsible track sections, in fixed order A→B→C→D**

Each track section header shows:
- Track letter + name (e.g., "Track A — Foundations")
- Status tag: `Completed` (teal) / `In Progress` (amber) / `Locked` (dim, red-tinted lock icon) / `Not Started` (neutral)
- Module count: `8/8 complete` or `3/11 complete`
- Click anywhere on the header row → expands/collapses that track's module chain. Only one track needs to be expanded by default: whichever track contains the learner's current in-progress module (or Track A if brand new).

**Inside each expanded track — horizontal node chain** (one node per module, left to right, connected by a line):
- Node states: **Completed** (filled teal circle, checkmark), **Current** (outlined teal circle, pulsing dot — this is the one node allowed a subtle animation, per your design plan's "earned" exception), **Unlocked-not-started** (outlined neutral circle), **Locked** (dim, lock icon inside circle, no hover state).
- Beneath each node: the module's short label (e.g., `A1`, `A2`... `A8`) in mono, and on hover/tap, a tooltip showing the full title (e.g., "Computing Foundations") and the learner's quiz score if completed (e.g., "Score: 100%").
- **Click behavior:**
  - Completed/Current/Unlocked node → navigates to Course Module screen for that `module_id`.
  - Locked node → does NOT navigate. Instead shows an inline tooltip/toast: "Complete [previous module's title] to unlock" — pulled from the `unlocks` chain in `MASTER_CURRICULUM_INDEX.md`.

**Region C — Track D special case (certificate gate)**
Track D's section header, if Track C isn't fully complete, shows an extra sub-label: "Requires: Track C complete + Advanced Capstone" — since Track D depends on capstone completion, not just quiz passes, per the index's certificate logic.

### Interaction summary
| Element | Click behavior |
|---|---|
| Track section header | Expand/collapse that track's node chain |
| Completed/Current/Unlocked node | → Course Module screen for that module_id |
| Locked node | Inline "locked — requires X" tooltip, no navigation |
| Overall progress bar (Region A) | Not clickable — display only |

---

## SCREEN 3: Course Module Page

### Purpose
Renders one module's actual markdown content (e.g., `course/track-a-foundations/A1_computing_foundations.md`) as a real reading experience, not a raw markdown dump.

### Data bindings
Full course markdown file content, parsed into structured sections. Uses the file's own headers (`## 1.1 Computer Fundamentals`, etc.) as the section structure — **do not re-author content, render what's actually in the file.**

### Layout

**Region A — Module header** (sticky-lite, scrolls with page but stays visually anchored at top of content)
- Breadcrumb: `Track A / Foundations / A1: Computing Foundations` — each segment clickable (Track A → Curriculum Map at that track; Foundations → same; module name → no-op, already here)
- `module_id` shown in small mono text beneath, e.g., `track_a_a1_computing_foundations` — always visible for traceability, exactly as flagged in the design plan's cross-screen consistency rule.
- Estimated time (from the file's header metadata, e.g., "120 minutes")

**Region B — Learning Objectives** (rendered as a distinct callout block, not blended into body text — matches the file's own `## Learning Objectives` section)

**Region C — Body content**
Renders each numbered subsection (`1.1`, `1.2`, etc.) as its own block:
- Section heading
- Body paragraph(s) in the serif reading font
- **`🎨 Interactive/Visual Requirement` blocks are the one place this screen deviates from "render the markdown as-is"** — these should render as an actual embedded interactive placeholder component (not the raw text describing what it should be). For Batch 1, spec this as a bordered placeholder box reading "[Interactive component: see spec]" with the original requirement text visible in a collapsed `<details>`-style expander — this gives Niranjan a clear slot to build into without blocking the rest of the page.
- **Knowledge Check** (where present in the file) renders as an inline, single-question, non-graded mini-quiz: question text, options as clickable rows, immediate feedback shown below on selection, no page navigation, no score tracking — this is formative, not the real quiz.

**Region D — Module footer**
- Progress indicator: "Track A progress: 3/8 complete" with a thin bar
- Two buttons: **"← Previous"** (previous module in the track's unlock chain, per index) and **"Next: [next module title] →"**. If this is the last module before the quiz, the "Next" button instead reads **"Take the A1 Quiz →"** and navigates to the Quiz Interface screen for this `module_id`.
- **Locked-ahead edge case:** if the learner hasn't yet passed this module's quiz, the "Next" button is disabled/replaced with **"Complete the quiz to continue"**, since progression is quiz-gated per the unlock chain, not just reading-gated.

### Interaction summary
| Element | Click behavior |
|---|---|
| Breadcrumb track/section segments | → Curriculum Map, relevant track expanded |
| Interactive placeholder box | Expands the spec text (Batch 1); real component later replaces this entirely |
| Knowledge check option | Immediate inline feedback, no navigation, not scored |
| "Take the [X] Quiz →" | → Quiz Interface screen, this module_id |
| "← Previous" / "Next →" | → adjacent module's Course Module screen, per unlock chain |

---

## SCREEN 4: Quiz Interface

### Purpose
Renders one module's quiz JSON (e.g., `quizzes/track-a-foundations/A1_computing_foundations_questions.json`) as a real graded assessment.

### Data bindings
Reads `title`, `passing_score_percent`, and the `questions` array (each with `prompt`, `options`, `correct_index`, `explanation`) directly from the quiz file. On completion, posts to the backend in the exact shape from `quizzes/quiz_submission_schema.md`.

### Layout

**Region A — Progress header** (persistent across all questions)
- Progress dots: one per question, filled as answered, outlined for remaining (e.g., 5 dots for A1's 5-question quiz)
- `Question 3 / 5` label
- Pass benchmark shown once, at the start only: "Pass: 70%" (pulled from `passing_score_percent`)

**Region B — One question at a time** (not a long scroll — single question fills the main content area)
- `question.id` shown in small mono text (e.g., `a1-q3`) for traceability
- `question.prompt` as the main question text
- 4 answer rows (`question.options`), full-width, clickable — per `DESIGN.md`'s Selectable Answer Rows component spec (selected state before submission, correct/incorrect state after).

**On selection (before moving on):**
- Selected row highlights immediately (neutral "selected" state, not yet revealing right/wrong)
- A **"Submit answer"** button appears — this is a deliberate extra click, not auto-advance on select, so a learner can change their mind before committing.
- After submit: correct answer gets teal left-border + checkmark, if the learner's choice was wrong it gets red left-border + X, and `question.explanation` text slides in below regardless of right/wrong (this matches the file's data — every question has an explanation, not just wrong answers, since explanations reinforce correct reasoning too).
- **"Continue →"** button appears only after the explanation has been shown.

**Region C — Final score screen** (replaces the question area after the last question)
- Large score display: `4 / 5 correct (80%)`
- Pass/fail banner: if `score% >= passing_score_percent`, teal "Passed" banner with the badge award shown inline (exact badge string from `master_badges_and_certificates.md`, e.g., `Computing Foundations`); if below, amber "Not yet — try again" banner, no badge, no penalty for retrying.
- **On pass:** primary button reads **"Continue to [next module] →"**, mirroring the Course Module screen's footer logic — this is the actual unlock trigger for the next node in the Curriculum Map.
- **On fail:** primary button reads **"Retry quiz"** — regenerates the question sequence (same questions, can shuffle option order to avoid rote memorization of position rather than content) and resets progress dots.
- Secondary button, always present: **"Review lesson"** → back to this module's Course Module screen.

### Interaction summary
| Element | Click behavior |
|---|---|
| Answer row (before submit) | Highlights as selected, reveals "Submit answer" button |
| "Submit answer" | Locks in the answer, reveals correct/incorrect state + explanation |
| "Continue →" | Advances to next question, or to Region C if this was the last question |
| Pass banner "Continue to [next module] →" | → Course Module screen, next module_id; also fires the badge-award and mission_xp side effects per the submission schema |
| Fail banner "Retry quiz" | Resets to Question 1, same quiz |
| "Review lesson" | → Course Module screen, this module_id |

---

## Open questions for the team (flagging, not deciding unilaterally)
- Should the inline Knowledge Check (Course Module screen, Region C) count toward anything, or stay purely formative? Currently specced as purely formative — worth confirming with Vishnu Priya since it affects whether it needs a backend call at all.
- Retry quiz — should repeated fails be tracked anywhere (e.g., for the Skill-Gap Engine to notice a struggling learner), or is only the final passing attempt meaningful? Not specced here since it's a scoring-logic decision, not a UI one.

## Next batch
Auth + Badges & Certificates + Mission Hub — say when you're ready and I'll build those with the same level of detail.

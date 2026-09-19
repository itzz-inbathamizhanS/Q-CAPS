# Q-CAPS UI Spec — Batch 2: Auth + Badges & Certificates + Mission Hub
**Grounded in real data from:** `backend/auth.routes.js`, `backend/User.model.js`, `badges/master_badges_and_certificates.md`, `MASTER_CURRICULUM_INDEX.md`, `Mission/00_mission_layer_architecture.md`, the 2 built mission specs.
**Visual system:** per `DESIGN_PLAN_FOR_STITCH.md` — Auth/Badges use the base Knowledge Layer palette; Mission Hub is the deliberate bridge point into the Experience Layer (see Screen 3 below).

---

## SCREEN 1: Auth (Login / Signup)

### Purpose
Entry point. Backed by the real endpoints already built: `POST /api/auth/register`, `POST /api/auth/login`.

### Data bindings
Request/response shapes come directly from `backend/auth.routes.js` — this spec should not invent fields the backend doesn't return.

### Layout — Login mode (default view)
Single centered column, max-width ~400px, vertically centered in viewport (fixing the "stranded card" issue flagged in the Stitch review).

**Fields:**
- Email — text input, `type=email`
- Password — password input, with a show/hide toggle (eye icon, no label text needed)
- Primary button: **"Log in"**
- Secondary link, small text below: **"Don't have an account? Sign up"** → switches to Signup mode (same screen, no page reload — a mode toggle, not a separate route)

### Layout — Signup mode
Same centered column. Fields, in order:
- Name — text input
- Email — text input
- Password — password input + show/hide toggle. Beneath it, a live strength hint reflecting the backend's actual rule (`isStrongPassword`: ≥8 chars, at least one letter, one number) — shown as plain text, e.g., "At least 8 characters, with a letter and a number," turning teal-checked once satisfied rather than a generic strength meter (the backend doesn't score strength beyond this one rule, so the UI shouldn't imply it does).
- Role — this field exists in the backend (`student/employee/organization/instructor/researcher`) but **should be hidden for the default signup flow**, defaulting silently to `student`. Only show a role selector if the signup is reached via an "I'm an organization" or "I'm an instructor" entry point elsewhere (not specced yet — flag to the team if that flow is needed). Building it as always-visible would surface backend plumbing the average learner doesn't need to see.
- Primary button: **"Create account"**
- Secondary link: **"Already have an account? Log in"** → switches back to Login mode

### States
| State | Behavior |
|---|---|
| Submitting | Primary button shows a loading state (e.g., button text replaced with a small inline spinner), inputs disabled, no double-submit possible |
| Login: wrong email/password | Single generic error banner above the form: "Invalid email or password" — **exactly matching the backend's deliberately generic message** (per its anti-enumeration design in `auth.routes.js`). Do not build a UI that tries to be more specific than the backend actually is (e.g., never say "no account with that email" — the backend intentionally withholds that distinction). |
| Login: rate-limited | Backend returns "Too many attempts. Please try again later." — show verbatim, disable the form for a visible cooldown if the response includes retry timing, otherwise just show the message with no countdown. |
| Signup: email may already exist | Backend's generic message: "An account with this email may already exist." — show verbatim, same anti-enumeration reasoning. |
| Signup: weak password | Inline field-level error beneath the password input, using the backend's exact message: "Password must be at least 8 characters and include a letter and a number." |
| Success (either flow) | Store the returned `token`; navigate immediately to Dashboard. No intermediate "welcome" screen — the Dashboard's own empty/new-user states (specced in Batch 1) already handle first-time framing. |

### Interaction summary
| Element | Click behavior |
|---|---|
| "Log in" / "Create account" | POST to the matching endpoint; on success → Dashboard; on error → inline error per table above |
| "Sign up" / "Log in" toggle links | Switch form mode in place, clear any error state, do not navigate away from the screen |
| Show/hide password icon | Toggles input type between `password` and `text`, no other effect |

---

## SCREEN 2: Badges & Certificates

### Purpose
Displays `unlocked_badges` and certificate progress, sourced from `master_badges_and_certificates.md`'s full 38-badge + 5-certificate + PQCTP structure.

### Data bindings
- Badge grid: cross-references the learner's `unlocked_badges` array against the full badge list in `master_badges_and_certificates.md` (36 module badges + 4 capstone badges = 40, plus certificate-tier badges are shown separately in Region C, not mixed into this grid).
- Certificate section: a badge is "locked" until every module badge in that track is present in `unlocked_badges` AND (where applicable) the capstone badge — this is a computed state, not a stored field, per the "Implementation Notes" section of the badges file.

### Layout

**Region A — Summary header**
`18 / 40 badges earned` large numeral, small subtext showing certificate progress: `1 of 5 certificates earned`.

**Region B — Badge grid, grouped by track** (4 sub-sections: Track A, B, C, D — same order as Curriculum Map, plus a 5th small section for the 4 capstone-completion badges)
- Each badge: icon + exact badge string beneath (e.g., `Computing Foundations`, `PQC Mitigation Aware`)
- **Unlocked:** icon filled/colored, string in full-brightness text
- **Locked:** icon outline-only, string dimmed — **no lock icon overlay needed here** (unlike Curriculum Map nodes) since the badge shape itself already communicates state via fill vs. outline; adding a redundant lock icon would clutter a dense grid.
- Click behavior: unlocked badge → small detail popover showing which module/mission earned it and the date (if the backend tracks award timestamps — flag to Vishnu Priya if `unlocked_badges` needs to become an array of objects with dates rather than plain strings to support this; currently the schema only stores strings, so this detail popover may need to show "Earned" with no date until that's decided). Locked badge → popover showing the unlock trigger in plain language, e.g., "Pass the A8 quiz to earn this badge."

**Region C — Certificate tiers** (5 cards, one per tier: CQF, CQSE, QCE/PQC-E/QNE, QSA, plus PQCTP as a 6th "final" card visually distinct from the other 5 — larger, at the bottom, since it depends on all others)
Each certificate card:
- Certificate name + tier number
- Status: `Earned` (teal) / `In Progress — 6/8 modules` (amber, shows the actual completed-count from the relevant track) / `Locked` (dim)
- Requirements list (module badges needed + capstone), each line showing a checkmark if already satisfied
- **On earned:** a "Download certificate" button — note this is a **not-yet-built backend feature** (no certificate-generation endpoint exists yet); spec it as present in the UI but should call out to the team that the PDF-generation logic is unbuilt, so this button should show a "Coming soon" state rather than being wired to nothing.

**Track C special case:** the certificate card shows whichever of QCE/PQC-E/QNE the learner's capstone choice unlocked — the UI needs a computed field here too (which capstone path was selected), not something in the current schema. Flag to the team.

### Interaction summary
| Element | Click behavior |
|---|---|
| Unlocked badge (grid) | Opens detail popover — source module/mission |
| Locked badge (grid) | Opens detail popover — unlock requirement in plain language |
| Certificate card, earned | "Download certificate" — currently unbuilt backend, show "Coming soon" |
| Certificate card, in progress/locked | Not clickable, requirements list is informational only |

---

## SCREEN 3: Mission Hub

### Purpose
The deliberate bridge screen between Knowledge Layer chrome and Experience Layer content — per `DESIGN_PLAN_FOR_STITCH.md` Section 4.7, this is the one place base-palette UI and mission-specific palettes coexist on the same screen.

### Data bindings
Reads the 2 currently-built missions from `Mission/mission_bb84_diplomatic_channel.json` and `Mission/mission_pqc_migration_enterprise.json` — **only 2 missions exist right now**, this screen must not fabricate a larger mission catalog than actually exists (this was Stitch's exact mistake — inventing "Mission 03/04" that don't exist in the repo).

### Layout

**Region A — Hub header** (base Knowledge Layer palette)
Title: "Missions." Subtitle: "Learn by doing — apply what you've studied under real stakes." (echoing the design plan's positioning language). No fake stat counters (no invented "success rate," no invented "clearance level") — only real, derivable numbers: `2 missions available`.

**Region B — 2 mission cards, side by side** (this is where each card's visual treatment hints at its internal mission identity, per the design plan)

**Card 1 — BB84 mission:**
- Card background/border treatment hints at the ink-navy/parchment/teal palette (subtle — a left accent stripe in that mission's teal is enough, the card doesn't need to fully reskin itself, that happens once you enter)
- Title: "Secure the Diplomatic Channel" (from the mission's `title` field)
- Linked module tag: `track_c_c6_quantum_key_distribution` (mono, small)
- Role line: "You are the on-site quantum communications officer for a diplomatic mission." (from the mission's `role` field, verbatim)
- Lock state: **locked until the learner has reached Track C** (since it teaches C6 content) — show a lock + "Unlocks at Track C" if not yet reached, per the same locked-node pattern as Curriculum Map.
- Reward preview: "🏅 QKD Defender · +85 XP" (from the mission's `rewards` object)
- Button: **"Begin mission"** (or "Locked" if prerequisite not met)

**Card 2 — PQC Migration mission:**
- Card hints at the graphite/amber palette
- Title: "The Migration Mandate"
- Linked module tag: `track_d_e5_enterprise_pqc_migration`
- Role line: "You are the newly appointed Security Architect for a mid-size financial services company." (verbatim from spec)
- Lock state: locked until Track D reached
- Reward preview: "🏅 Migration Commander · +100 XP"
- Button: **"Begin mission"** / "Locked"

**Region C — Empty/future state** (honest, not fabricated)
Below the 2 real cards, a single low-emphasis note: "More missions coming as the curriculum grows." — no fake locked cards for missions that don't exist yet. This directly replaces Stitch's invented "Mission 03/04" cards.

### Interaction summary
| Element | Click behavior |
|---|---|
| "Begin mission" (unlocked) | → loads the mission's actual play experience (the working HTML prototypes for now; a ported React version once Niranjan builds it) |
| "Locked" state | Not clickable, shows the prerequisite tooltip on hover, same pattern as Curriculum Map locked nodes |
| Mission card (elsewhere on card, non-button area) | Optional: could open a short "briefing" preview without committing to start — not required, flag as a nice-to-have, not core |

---

## Open questions for the team (flagging, not deciding unilaterally)
- Certificate PDF generation — no backend endpoint exists. The UI is specced with a placeholder state, but this needs an actual owner (likely Vishnu Priya's backend or a new small service) before "Download certificate" can do anything real.
- Badge award timestamps — current schema stores `unlocked_badges` as plain strings with no date. If the badge detail popover (Screen 2) should show "earned on [date]," the schema needs to change to an array of objects. Flag to Vishnu Priya before building this popover in earnest.
- Track C capstone-choice tracking (which of QCE/PQC-E/QNE) — not in the current User schema. Needs a new field if Screen 2's certificate card is going to show the correct one automatically.

## Next batch
Mission Play screens (both types, building directly on the 2 working HTML prototypes) + Escape Room Lab screen. Say when you're ready.

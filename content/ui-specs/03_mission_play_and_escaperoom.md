# Q-CAPS UI Spec — Batch 3: Mission Play + Escape Room Lab
**Grounded in real data from:** the 2 working HTML prototypes (`Mission/prototypes/mission_bb84_diplomatic_channel.html`, `mission_pqc_migration_enterprise.html`), their source JSON specs, and `labs/escape_room_scenarios.json`.
**Note on this batch:** unlike Batches 1-2, the Mission Play logic already exists as *working code*, not just a spec — this document describes how to port that existing behavior into the app shell (nav, header, exit points), not invent new behavior. Where this spec adds something the prototypes don't have (e.g., an exit/pause control), it's called out explicitly as new.

---

## SCREEN 1: Mission Play — Type A (Simulation)
### Reference implementation: BB84 "Secure the Diplomatic Channel"

### Purpose
Full-screen, immersive mission experience. Live-simulated state (not pre-written branches) — the learner's choices genuinely compute the outcome via the rules already implemented in the prototype.

### What's different from a normal app screen
This screen **intentionally breaks from the base Knowledge Layer chrome.** No main nav bar, no stat strip, no track breadcrumb — the mission owns the full viewport, using its own palette (ink-navy/parchment/teal per the BB84 identity). This is the deliberate mode-shift the Mission Hub card previewed.

### Layout (ports directly from the existing HTML prototype structure)

**Region A — Mission masthead** (new — not in the current prototype, needed for app integration)
Small, unobtrusive top bar: mission title + a single **"Exit mission"** control (top-left, low visual weight — an ✕ or "← Exit" text link, not a prominent button, since exiting mid-mission should be possible but not tempting). Clicking it shows a confirmation: "Leave this mission? Your progress in this attempt won't be saved." → Exit confirms to Mission Hub; Cancel dismisses.
*Why this matters:* the standalone HTML prototype has no exit path since it was built to be viewed in isolation — this is the one real gap between "working prototype" and "integrated screen."

**Region B — Briefing** (ports directly from prototype's `.stamp` / `h1` / `.role` / `.briefing` blocks)
Mission stamp tag, title, role line, objective paragraph — verbatim from the mission JSON's `role`/`objective`/`environment` fields, exactly as already built.

**Region C — HUD** (ports directly from prototype's `.hud` div)
Live state variables: sifted key length, sample compared, observed error rate, mission status — updates in real time exactly as the existing JS already does (`renderTable`, `sampleErrorRate`, etc. — no changes needed to this logic).

**Region D — Stage sequence** (ports directly — Stages 1-5 exactly as built: Begin Transmission → Review Results → Sift the Key → Estimate Error Rate → Decide)
Each stage's existing interaction logic (photon table rendering, hypothesis textarea, sifting animation, error-rate gauge, accept/abort decision) carries over unchanged — this spec is not asking for these mechanics to be redesigned, they already work correctly per the original mission design (live-computed, not scripted).

**Region E — Outcome + Reveal** (ports directly from prototype's `.outcome` div)
Success/failure framing, the full concept-reveal explanation, badge award banner (`QKD Defender`, `+85 XP`) — unchanged.

**Region F — Post-mission return path** (new — not in the standalone prototype)
Beneath the existing outcome block, add: **"Return to Mission Hub"** (primary) and **"Retry mission"** (secondary — re-runs `beginTransmission`, generating a fresh random Eve-presence/error-rate, matching the prototype's existing `replayability_note`).

### Interaction summary
| Element | Behavior |
|---|---|
| "Exit mission" (Region A) | Confirmation dialog → Mission Hub (progress lost) or Cancel |
| All Stage 1-5 controls (Region D) | Unchanged from working prototype — no redesign needed |
| "Return to Mission Hub" (Region F, new) | → Mission Hub, mission marked complete if successful (fires the badge/XP award to the backend — needs the submission endpoint flagged in Batch 1/2's open questions) |
| "Retry mission" (Region F, new) | Resets all state variables, restarts at Stage 1 with fresh randomization |

---

## SCREEN 2: Mission Play — Type B (Decision Scenario)
### Reference implementation: PQC Migration "The Migration Mandate"

### Purpose
Same full-screen, mode-shifted treatment as Type A, but for staged decisions with persistent scoring rather than live simulation — porting the existing working prototype's logic.

### Layout (ports directly from the existing HTML prototype structure)

**Region A — Mission masthead** (new, same pattern as Type A — exit control + confirmation)

**Region B — Persistent HUD** (ports directly from prototype's sticky `.hud` — stays visible/sticky at top through all 4 stages, exactly as already built: Readiness, Continuity, Budget left, Months left, all live-updating via `applyDelta`)

**Region C — Environment brief** (ports directly — role, environment, objective, shown once at the top before Stage 1 begins)

**Region D — Stage sequence** (ports directly — the existing `stages` array rendering: narrative → prompt → 3 choices → feedback → continue button, exactly as built. The existing scoring logic (`selectChoice`, `applyDelta`) is correct and shouldn't be redesigned.)

**Region E — Final report / Outcome** (ports directly from prototype's `renderOutcome` — the 3-band outcome logic: success/partial/failure based on accumulated `readiness`/`continuity` scores, debrief text, badge award)

**Region F — Post-mission return path** (new, same pattern as Type A: "Return to Mission Hub" / "Retry mission" — retry resets `state` object and re-renders Stage 1)

### Interaction summary
Same table shape as Type A — only the underlying stage content differs (decision buttons vs. live simulation controls), the shell behavior (exit, return, retry) is identical across both mission types, which is intentional: **one consistent shell wrapping two different internal mechanics**, so future missions of either type plug into the same integration pattern.

### Note on future missions
Per `Mission/00_mission_layer_architecture.md`'s priority list, missions 3-5 (Shor's Algorithm, Noisy Processor Circuit Builder, Hybrid Handshake) aren't built yet. When they are, each should reuse **whichever of these two screen shells matches its `type` field** (`simulation` or `decision_scenario`) rather than inventing a third pattern — that consistency is what makes the Mission Hub's card-preview approach (Batch 2, Screen 3) scale cleanly as more missions get added.

---

## SCREEN 3: Escape Room Lab Scenario

### Purpose
A lighter-weight relative of a full mission — single decision point, no multi-stage state, no persistent HUD. Renders one scenario from `labs/escape_room_scenarios.json`.

### Data bindings
Each scenario object: `title`, `module_id`, `difficulty`, `setup`, `prompt`, `choices` (each with `text`, `correct`, `feedback`), `badge_awarded`, `mission_xp_awarded`.

### Layout
This screen stays **within the base Knowledge Layer chrome** (unlike full missions) — normal nav bar present, no full-screen mode-shift. This is a deliberate distinction from Screens 1-2: escape rooms are a lighter Knowledge Layer feature, not a full Experience Layer excursion, matching the architecture doc's description of them as a "lightweight ancestor" of missions.

**Region A — Scenario header**
Title, `module_id` tag (mono, small — e.g., `track_c_c10_pqc_attack_surface` for "The Combiner Bug Report"), difficulty tag (`novice`/`professional`/`quantum_expert` — reuse the same difficulty-tag styling as the Quiz screen for consistency).

**Region B — Setup** (the scenario's `setup` field, rendered as narrative body text)

**Region C — Prompt + choices**
`prompt` field as the decision question. 3 choice rows (full-width, same Selectable Answer Row component as the Quiz screen — reuse, don't reinvent) — but **unlike the quiz, options are not labeled A/B/C/D**, since escape room choices are meant to read as real decisions, not test answers.

**On selection:**
- Choice locks in immediately (single click, no separate "submit" step — unlike the Quiz screen's deliberate two-step confirm, since escape rooms are lower-stakes formative practice, not graded assessment)
- `feedback` text for that choice appears below, with a visual tone matching `correct: true/false` (teal border if correct, amber/red if not — but even incorrect choices show substantive feedback, not just "wrong," per the actual content already written in the scenarios file)
- If correct: badge award banner appears (`badge_awarded`, `mission_xp_awarded`) — e.g., "🏅 HNDL Responder · +50 XP"
- If incorrect: a **"Try again"** button appears instead of a badge banner, resetting only the choice selection (not the whole scenario) so the learner can pick a different option — escape rooms are meant to be solvable through iteration, per the original design brief's "wrong choices show consequences and loop back with a hint" intent.

**Region D — Footer**
"Back to [linked module]" link (→ Course Module screen for the scenario's `module_id`) and, if this scenario succeeded, "Next scenario →" if another escape room exists for a related module (currently only 7 scenarios total exist — 3 core + 4 track-capstone — so this button should gracefully hide rather than dead-end if there's no "next" one).

### Interaction summary
| Element | Behavior |
|---|---|
| Choice row | Locks in immediately, reveals feedback below |
| Correct choice | Badge/XP banner shown |
| Incorrect choice | "Try again" button, resets choice only |
| "Back to [module]" | → Course Module screen for `module_id` |
| "Next scenario →" | → next scenario if one exists; hidden otherwise |

---

## Open questions for the team (flagging, not deciding unilaterally)
- Mission completion persistence — same gap noted in Batch 1/2: there's no confirmed backend endpoint for mission/escape-room results yet (`quizzes/quiz_submission_schema.md` covers quizzes only). The "Return to Mission Hub" and badge-award moments in this batch assume that endpoint exists; it needs to be built (likely by Vishnu Priya) before these screens are fully functional, not just visually complete.
- Retry limits — none of the specs here impose a retry cap (missions or escape rooms). Worth a quick team decision on whether unlimited retries is intended long-term, or just fine for a first version.

## All 3 batches now complete
Full coverage: Dashboard, Curriculum Map, Course Module, Quiz, Auth, Badges & Certificates, Mission Hub, Mission Play (both types), Escape Room Lab — 9 screens total, every one grounded in real repo data, every click behavior named, every gap flagged rather than papered over.

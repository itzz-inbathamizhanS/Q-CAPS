# Q-CAPS Mission Layer — Architecture Specification
**Owner:** Aasif (Content Security) | **Status:** Proposed design, not yet built as UI — this document is the spec for Niranjan (frontend) and Vishnu Priya (scoring/backend) to build against.

## 1. The Core Idea
The existing platform teaches through a linear sequence: **Content → Quiz → Badge → Certificate.** This is necessary but not sufficient — a learner can pass every quiz while remaining a passive reader. The Mission Layer sits alongside (not replacing) that sequence, and reframes learning as **problem-solving under simulated stakes** rather than **information recall**.

The governing principle: **the learner isn't playing a game after learning — they're learning because they're playing.** A mission gives the learner a role, an objective, an environment, and a problem; they make decisions, the system reacts, something goes wrong, they investigate, apply what they know, and only then does the underlying concept get named and explained — after they've already discovered it experientially.

## 2. Two-Layer Platform Architecture
```
                    Q-CAPS PLATFORM
                         │
        ┌────────────────┴────────────────┐
        │                                 │
   KNOWLEDGE LAYER                   EXPERIENCE LAYER
   (already built)                  (this document)
        │                                 │
   Course Content (36 modules)          Missions
   Visual/Interactive specs             Simulations
   Quizzes (36)                         Decision Scenarios
   Knowledge Checks                     Attacks & Consequences
                                         Investigation Loops
        │                                 │
        └────────────────┬────────────────┘
                         │
                  SKILL / MASTERY
                         │
                 Badge / Certificate
```

**Critical design rule: not every module gets a mission.** Building 36 missions at equal depth would dilute quality and blow the timeline. Missions are reserved for concepts that are genuinely better learned by doing than by reading — see Section 6 for the prioritized list. Every module keeps its quiz regardless; missions are additive, not a replacement.

## 3. Mission Types
Two distinct technical patterns, chosen per-mission based on what the concept actually needs — don't force everything into one shape.

### Type A: SIMULATION
For concepts with genuine underlying mechanics the learner should manipulate directly (e.g., BB84's basis-matching, a noisy quantum circuit's probability distribution). The frontend maintains **live state** that responds to learner input in real time; there's no pre-written branch tree, the outcome is computed from the actual simulated mechanics.

### Type B: DECISION SCENARIO
For concepts that are fundamentally about judgment under tradeoffs (e.g., enterprise PQC migration prioritization). The frontend presents staged decision points; each choice updates tracked state variables (e.g., `readiness_score`, `business_continuity_score`) and unlocks the next stage with visible consequences. This is cheaper to build than live simulation and is the right fit whenever the "mechanic" is a real-world judgment call rather than a computable process.

The escape room labs already built (`labs/escape_room_scenarios.json`) are a **lightweight ancestor of Type B** — single-decision-point scenarios with immediate feedback. Missions extend that pattern into **multi-stage** sequences with persistent state across stages, which is the actual structural difference between "a scenario" and "a mission."

## 4. Mission Structure Template
Every mission, regardless of type, follows this shape:

```json
{
  "mission_id": "unique_snake_case_id",
  "title": "Player-facing mission name",
  "type": "simulation | decision_scenario",
  "linked_module_id": "the module_id from MASTER_CURRICULUM_INDEX.md this mission teaches/reinforces",
  "role": "Who the learner is playing (e.g., 'Security Engineer at a diplomatic agency')",
  "objective": "One-sentence goal stated in-world, not academically",
  "environment": "What resources/tools/context the learner has available",
  "state_variables": { "...": "the tracked values that change as the mission progresses" },
  "stages": [ "ordered sequence of stage objects — see Section 5" ],
  "resolution": {
    "success_condition": "...",
    "failure_condition": "...",
    "concept_reveal": "the explicit 'here's what you just discovered' explanation, shown ONLY after the learner has experienced it, not before"
  },
  "rewards": {
    "badge_awarded": "exact string per badges/master_badges_and_certificates.md convention",
    "mission_xp_awarded": "number, matches shared_data_schema.md's mission_xp_awarded convention"
  }
}
```

## 5. The Investigation Loop (applies within each stage)
This is the pedagogical engine — every stage should move through this sequence, not skip straight to explanation:

```
Decision → System Reacts → Something Changes/Goes Wrong → Investigate → Apply Knowledge → Resolve → (Concept named only now)
```

Concretely, for BB84 (fully specced in `missions/mission_bb84_diplomatic_channel.json`): the learner chooses bases, sends qubits, sees results — some outcomes look wrong (random-seeming mismatches). They investigate *why* before being told "basis mismatch causes random results." Then Eve is introduced as an anomaly to detect, not a fact to memorize.

## 6. Prioritized Mission List (recommended build order)
Not exhaustive — a living list. Priority given to modules where hands-on discovery adds the most value over reading:

| Priority | Mission | Linked module_id | Type | Status |
|---|---|---|---|---|
| 1 | The Diplomatic Channel (BB84) | `track_c_c6_quantum_key_distribution` | Simulation | **Built** — see `mission_bb84_diplomatic_channel.json` |
| 2 | Enterprise PQC Migration | `track_d_e5_enterprise_pqc_migration` | Decision Scenario | **Built** — see `mission_pqc_migration_enterprise.json` |
| 3 | Shor's Algorithm: RSA Under Fire | `track_c_c2_advanced_quantum_algorithms` / `track_b_b8_quantum_threats` | Decision Scenario (narrated attack, not live math) | Not yet built |
| 4 | Noisy Processor Circuit Builder | `track_a_a7_first_quantum_programming` | Simulation (live Qiskit-backed) | Not yet built |
| 5 | Hybrid Handshake Under Attack | `track_c_c11_pqc_defense_engineering` | Decision Scenario | Not yet built |

## 7. Data & Scoring Integration
Missions plug into the existing schema, not a parallel system:
- Mission completion should post to the same submission pattern as quizzes (see `quizzes/quiz_submission_schema.md`) — Vishnu Priya's backend needs a `mission_id` field alongside `module_id` to distinguish the two, or missions can reuse `module_id` with an added `"source": "mission"` tag. **Not yet decided — flag to Vishnu Priya before backend work starts.**
- `mission_xp_awarded` follows the same convention already established in `labs/escape_room_scenarios.json` and the Scanner Mission object in `shared_data_schema.md`.
- Badge strings follow the exact-string rule already established platform-wide.

## 8. What This Document Does NOT Cover
- Actual frontend implementation (React components, animation, live circuit simulation engines) — that's Niranjan's build, this is the spec he builds against.
- Backend endpoints for mission state persistence — that's Vishnu Priya's, informed by Section 7 above.
- The remaining 3 missions in the priority list beyond BB84 and PQC Migration — flagged as not-yet-built, available on request.

## 9. Positioning (for pitches, faculty review, or the research paper)
Per the design conversation that produced this document: don't position this as *"a gamified quantum learning platform"* — that's generic and undersells it. The sharper framing: **"A simulation-driven learning platform where learners acquire quantum cybersecurity skills by solving realistic technical problems."** Or simplest: **Learn by doing, not by reading about doing.**

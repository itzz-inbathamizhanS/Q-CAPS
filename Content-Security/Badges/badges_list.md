# Q-CAPS Badge List — Schema-Aligned Version

> **Critical rule from `shared_data_schema.md`:** the `unlocked_badges` array stores the exact display-name string (e.g. `"Quantum Novice"`, `"RSA Hacker"` — these two are the confirmed examples already in the schema doc). Whatever string is written here is what gets pushed into that array — no separate "badge ID" translation layer, to avoid the exact mismatch bug the schema doc warns about.

## Foundational Badges (Module Completion)
| Badge string (goes in `unlocked_badges`) | Icon Suggestion | Unlock Trigger |
|---|---|---|
| `Crypto Explorer` | Magnifying glass over a padlock | Pass `module_1_basics` quiz (≥70%) |
| `Quantum Novice` | Glowing atom/qubit sphere *(matches schema's own example exactly)* | Pass `module_2_quantum` quiz (≥70%) |
| `PQC Defender` | Shield with a lattice pattern | Pass `module_3_pqc_mitigation` quiz (≥70%) |
| `Foundations Complete` | Gold badge combining all 3 module icons | Pass all 3 module quizzes |

## Skill Progression Badges
| Badge string | Icon Suggestion | Unlock Trigger |
|---|---|---|
| `Quantum Beginner` | Bronze atom outline | Complete Initial Skill Assessment |
| `Migration Analyst` | Compass over a migrating server icon | Complete a full Skill-Gap → Training → Reassessment cycle |
| `Quantum Security Engineer` | Platinum shield with qubit core | Reach "Advanced" demonstrated competency level |

## Escape Room Lab Badges (matches `labs/escape_room_scenarios.json` `badge_awarded` fields exactly)
| Badge string | Icon Suggestion | Unlock Trigger |
|---|---|---|
| `HNDL Responder` | Hourglass with a lock breaking open | Correctly solve "The Patient Records Leak" |
| `Crypto-Agility Architect` | Chain link with a wrench | Correctly solve "The Cracked Chain of Trust" |
| `Symmetric Defender` | Doubled key icon | Correctly solve "The Overlooked AES Key" |
| `Escape Room Master` | Gold key ring | Solve all 3 escape room scenarios on first attempt (no retries) |

## Scan Engine Badges (coordinate with Inba — matches `shared_data_schema.md`'s own example `"RSA Hacker"`)
| Badge string | Icon Suggestion | Unlock Trigger |
|---|---|---|
| `RSA Hacker` | Cracked padlock icon *(matches schema's own example exactly)* | Run first authorized scan and correctly identify an RSA vulnerability |
| `Inventory Builder` | Stacked database icon | Build a crypto inventory of 10+ findings |
| `Migration Ready` | Green checkmark over a certificate | Complete a full readiness reassessment above 70/100 |

## Implementation Notes
- Backend flow: client action (quiz pass / scenario solve / scan result) → API call → **backend validates the condition server-side** (never trust a client-only "you passed!" flag) → exact badge string pushed to `unlocked_badges` on the `User` document (dedupe before saving) → response includes the updated array → frontend shows the unlock animation.
- Because `User.model.js` already has `unlocked_badges: [String]` matching this exactly, no extra mapping code is needed anywhere in the stack.
- Icon style: flat, single-accent-color line icons matching the platform's existing Tailwind design tokens — confirm with Niranjan before finalizing, don't hardcode colors here.

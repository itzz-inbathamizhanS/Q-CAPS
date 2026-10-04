// Generated from content/Mission
export interface MissionHud {
  key: string;
  label: string;
  start: number;
  suffix?: string;
  max?: number;
  warn_below?: number;
  warn_above?: number;
}

export interface MissionBand {
  id: string;
  title: string;
  text: string;
  requires: Record<string, { min?: number; max?: number }>;
}

export interface MissionOutcome {
  final_title: string;
  bands: MissionBand[];
}

export interface MissionData {
  mission_id: string;
  title: string;
  type: 'simulation' | 'decision_scenario';
  linked_module_id: string;
  section_id?: string;
  hud?: MissionHud[];
  outcome?: MissionOutcome;
  role: string;
  objective: string;
  environment: string;
  state_variables: Record<string, unknown>;
  stages: Record<string, unknown>[];
  resolution?: Record<string, unknown>;
  replayability_note?: string;
  rewards?: Record<string, unknown>;
  [key: string]: unknown;
}

export const missionsData: MissionData[] = [
  {
    "mission_id": "mission_agility_retrofit",
    "title": "The Agility Retrofit",
    "type": "decision_scenario",
    "linked_module_id": "track_d_e4_crypto_agility",
    "section_id": "sec-7",
    "role": "You are the software architect responsible for making a platform crypto-agile.",
    "objective": "Retrofit a crypto boundary across 20 services without breaking production.",
    "environment": "Twenty services call a cryptography library directly with algorithm names written in code. Stored hashes and ciphertexts exist in several databases.",
    "hud": [
      {
        "key": "agility",
        "label": "Cryptographic call sites behind the boundary",
        "start": 0,
        "suffix": "%",
        "max": 100
      },
      {
        "key": "stability",
        "label": "Production stability",
        "start": 100,
        "suffix": "%",
        "max": 100,
        "warn_below": 80
      },
      {
        "key": "months_used",
        "label": "Months used",
        "start": 0,
        "suffix": " mo",
        "warn_above": 8
      }
    ],
    "state_variables": {
      "agility": "Cryptographic call sites behind the boundary, starts at 0",
      "stability": "Production stability, starts at 100",
      "months_used": "Months used, starts at 0"
    },
    "stages": [
      {
        "stage_id": "s1",
        "narrative": "You start the retrofit.",
        "decision_prompt": "What is your first step?",
        "choices": [
          {
            "id": "a",
            "text": "Audit the call sites and library dependencies to establish a baseline and a metric."
          },
          {
            "id": "b",
            "text": "Rewrite all 20 services at once."
          },
          {
            "id": "c",
            "text": "Wrap one service and declare victory."
          }
        ]
      },
      {
        "stage_id": "s2",
        "narrative": "You design the boundary.",
        "decision_prompt": "What does its API look like?",
        "choices": [
          {
            "id": "a",
            "text": "A purpose-level API (seal, open, sign, verify) with the algorithm identifier inside the data, selected by policy."
          },
          {
            "id": "b",
            "text": "A thin wrapper that still takes algorithm names and key sizes."
          },
          {
            "id": "c",
            "text": "Let each team write its own helper functions."
          }
        ]
      },
      {
        "stage_id": "s3",
        "narrative": "Services store hashes and ciphertexts.",
        "decision_prompt": "How do you handle stored data?",
        "choices": [
          {
            "id": "a",
            "text": "Version the stored values, keep the old algorithm readable, re-protect in the background, and verify before removing old keys."
          },
          {
            "id": "b",
            "text": "Switch the algorithm and recompute stored hashes."
          },
          {
            "id": "c",
            "text": "Leave stored data on the old algorithm forever."
          }
        ]
      },
      {
        "stage_id": "s4",
        "narrative": "The boundary is in place.",
        "decision_prompt": "How do you keep it that way?",
        "choices": [
          {
            "id": "a",
            "text": "Add a CI rule that forbids direct cryptographic calls outside the boundary, an architecture-review checklist, and a drill that changes an algorithm."
          },
          {
            "id": "b",
            "text": "Write documentation only."
          },
          {
            "id": "c",
            "text": "Trust each team to remember."
          }
        ]
      },
      {
        "stage_id": "s5",
        "narrative": "The architecture board reviews the retrofit.",
        "decision_prompt": "Review the outcome.",
        "choices": []
      }
    ],
    "outcome": {
      "bands": [
        {
          "id": "success",
          "title": "Agile platform",
          "text": "SUCCESS. Most call sites are behind a boundary, production stayed stable, and the next algorithm change is a policy change.",
          "requires": {
            "agility": {
              "min": 70
            },
            "stability": {
              "min": 80
            },
            "months_used": {
              "max": 8
            }
          }
        },
        {
          "id": "partial",
          "title": "Partly agile",
          "text": "PARTIAL. Progress is real but incomplete, or it cost stability or time.",
          "requires": {
            "agility": {
              "min": 40
            },
            "stability": {
              "min": 60
            }
          }
        },
        {
          "id": "fail",
          "title": "Retrofit stalled",
          "text": "AT RISK. The platform is still hard-coded or became unstable.",
          "requires": {}
        }
      ],
      "final_title": "Agility Retrofit Concluded"
    },
    "resolution": {
      "concept_reveal": "Retrofit by measuring first, introducing a purpose-level boundary with the algorithm inside the data, migrating stored values with versions and a verified re-protection, and enforcing the boundary in CI. Rewriting everything at once or leaving stored data behind are the two classic failures."
    },
    "rewards": {
      "badge_awarded": "Retrofit Engineer",
      "mission_xp_awarded": 90
    },
    "replayability_note": "Alternative orders change stability and speed."
  },
  {
    "mission_id": "mission_bb84_diplomatic_channel",
    "title": "Secure the Diplomatic Channel",
    "type": "simulation",
    "linked_module_id": "track_c_c6_quantum_key_distribution",
    "role": "You are the on-site quantum communications officer for a diplomatic mission.",
    "objective": "Establish a shared secret key between Alice (your embassy) and Bob (the receiving embassy) that you can trust has not been intercepted.",
    "environment": "You have: a quantum channel (single-photon transmission), a classical channel (for comparing bases only — never the actual bit values), a photon source at Alice's end, polarization measurement equipment at Bob's end, and limited bandwidth (you can only send a few hundred photons before the diplomatic window closes).",
    "state_variables": {
      "alice_bits": "array of random 0/1 values generated per photon sent",
      "alice_bases": "array of randomly chosen '+' (rectilinear) or 'x' (diagonal) bases, one per photon",
      "bob_bases": "array of randomly chosen '+' or 'x' bases, independently chosen by Bob before measuring",
      "bob_results": "array of Bob's measured bit values — computed by the simulation engine per the rules in Stage 2",
      "matching_basis_mask": "boolean array — true where alice_bases[i] == bob_bases[i]",
      "sifted_key": "the subset of alice_bits (or bob_results) where matching_basis_mask is true",
      "eve_present": "boolean, hidden from the learner until Stage 4 — controls whether interception noise is injected",
      "sample_comparison_size": "number of sifted key bits the learner chooses to publicly compare to estimate error rate",
      "observed_error_rate": "computed percentage mismatch in the compared sample",
      "key_accepted": "boolean, learner's final decision"
    },
    "stages": [
      {
        "stage_id": "stage_1_setup",
        "narrative": "The mission briefing loads. You're told the basics of your equipment but NOT told how basis choice affects measurement — that's what you're about to discover.",
        "learner_action": "Choose a batch size (e.g., 50 photons) and click 'Begin Transmission.' Alice's bits and bases are randomly generated by the simulation; the learner does not choose Alice's values directly, only initiates the process — this mirrors real BB84 where the sender's choices are random, not learner-scripted.",
        "system_reaction": "For each photon, Bob independently and randomly chooses his own measurement basis ('+' or 'x') BEFORE seeing Alice's choice — the simulation should visually emphasize that Bob's basis choice happens with zero knowledge of Alice's.",
        "🎨 interactive_visual": "Photon-by-photon animation: each photon shown traveling from Alice to Bob with its (hidden from Bob) polarization, Bob's basis choice shown as a dial he sets independently, then a measurement result pops out."
      },
      {
        "stage_id": "stage_2_measure_and_notice",
        "narrative": "Transmission complete. Bob has a full set of measurement results. Something looks off.",
        "learner_action": "The learner views a table: Alice's basis, Bob's basis, Bob's result. They're prompted: 'Look at the rows where the bases DON'T match. What do you notice about Bob's results there?'",
        "system_reaction": "Simulation engine rule (not shown to learner yet, only its OUTPUT is shown): when bases match, Bob's result equals Alice's bit with certainty. When bases DON'T match, Bob's result is uniformly random (50/50), regardless of Alice's actual bit — this is the real quantum-mechanical behavior of measuring in an incompatible basis, computed honestly by the simulation, not faked.",
        "investigation_prompt": "The learner is asked to form a hypothesis before being told the answer: 'Why do you think mismatched-basis rows look random?' — free-text or multiple-choice reflection, not graded, just prompts genuine engagement before the reveal.",
        "concept_reveal_partial": "AFTER the learner submits a hypothesis (right or wrong): 'When Bob measures in a basis different from how Alice encoded the photon, quantum mechanics gives a random result — this isn't equipment error, it's fundamental. This is exactly why BB84 only keeps bits where the bases happened to match.'",
        "🎨 interactive_visual": "Highlight matching-basis rows in green, mismatched in red, with the random-looking red results visually 'shuffling' to emphasize their randomness."
      },
      {
        "stage_id": "stage_3_sift_the_key",
        "narrative": "Now that you understand why mismatched bases produce garbage, it's time to build the actual shared key.",
        "learner_action": "The learner publicly compares (over the classical channel) ONLY the basis choices (never the bit values) for each photon, discards every row where bases didn't match, and is left with the sifted key — roughly half the original transmission, as expected.",
        "system_reaction": "Sifted key is computed and displayed. Mission tracks `sifted_key` state variable.",
        "🎨 interactive_visual": "Animated 'sifting' where mismatched rows visibly fall away, leaving only the matched rows forming the key."
      },
      {
        "stage_id": "stage_4_security_alert",
        "narrative": "SECURITY ALERT: Your quantum channel has been compromised. (Internally: `eve_present` is now set to true for this run — the learner doesn't know this yet, only that something triggered the alert.)",
        "learner_action": "The learner is told error-checking is now mandatory before trusting this key. They choose a sample of bits from the sifted key to publicly compare (sacrificing those bits — they can't be used in the final key either way).",
        "system_reaction": "The simulation computes `observed_error_rate` honestly: with `eve_present = true`, an eavesdropper measuring photons in transit (necessarily guessing bases herself, same as Bob) introduces detectable disturbance — roughly 25% error rate in the compared sample, versus near-0% in a clean run. The exact rate should have realistic random variance, not a fixed constant, so repeated missions don't all show identically '25.00%.'",
        "investigation_prompt": "Learner is shown the observed error rate and asked: 'Based on this number, do you think this key is safe to use?' — before any threshold is given to them.",
        "🎨 interactive_visual": "A live-updating error-rate gauge as the learner selects more sample bits to compare — larger samples give a more statistically confident (and stable) reading, teaching sample-size intuition as a side effect."
      },
      {
        "stage_id": "stage_5_decide",
        "narrative": "You must decide: ACCEPT the key and use it, or ABORT and request retransmission.",
        "learner_action": "Binary decision: Accept or Abort.",
        "consequences": {
          "accept_with_low_error": "Correct call if error rate is near the expected quantum-channel-noise baseline (a few percent, representing normal equipment imperfection, not attack) — mission succeeds.",
          "accept_with_high_error": "Wrong call — mission fails with a debrief: 'You used a compromised key. In a real deployment, this would have handed Eve your diplomatic communications.'",
          "abort_with_low_error": "Overly cautious but not wrong — mission succeeds with a note: 'You were safe, but excessive caution costs operational time. In practice, thresholds are set statistically, not by gut feeling.'",
          "abort_with_high_error": "Correct call — mission succeeds. This is the intended 'win' path when `eve_present` is true."
        }
      }
    ],
    "resolution": {
      "success_condition": "Learner correctly aborts when error rate exceeds the normal noise baseline, or correctly accepts when it's within baseline.",
      "failure_condition": "Learner accepts a key with an error rate indicating interception.",
      "concept_reveal": "Full explanation shown at mission end regardless of outcome: 'BB84's security comes from a physical fact, not a policy: an eavesdropper (Eve) intercepting photons must also guess a measurement basis, exactly like Bob does. When her guess is wrong (which happens roughly half the time), she disturbs the photon's state — and that disturbance shows up as extra errors when Alice and Bob compare a sample of their sifted key. No amount of computing power lets Eve avoid this — it's a consequence of quantum measurement itself, not classical cryptography's computational hardness assumptions.' This explicitly ties back to the QKD-vs-PQC distinction taught in Track B/C: this security guarantee is physics-based, which is exactly why QKD doesn't need the 'is the math still hard against future computers' hedge that PQC does — but also why it needs specialized hardware PQC doesn't."
    },
    "rewards": {
      "badge_awarded": "QKD Defender",
      "mission_xp_awarded": 85
    },
    "replayability_note": "Each mission run should randomize eve_present and the specific error-rate variance, so replaying the mission doesn't always show the identical numbers — reinforces that the learner is reasoning about statistics, not memorizing a fixed scenario outcome.",
    "section_id": "sec-8"
  },
  {
    "mission_id": "mission_crypto_incident_commander",
    "title": "The Cryptographic Incident",
    "type": "decision_scenario",
    "linked_module_id": "track_d_e6_governance",
    "section_id": "sec-9",
    "role": "You are the incident commander for a cryptographic weakness. HYPOTHETICAL: the algorithm ALG-X is invented; no vulnerability is claimed for any real algorithm.",
    "objective": "Contain the exposure from a reported weakness in ALG-X without taking down the business.",
    "environment": "You have a cryptographic inventory. Two services select their algorithm from a policy file; a meter firmware updater has it compiled in (about 90 days to change); and a legacy ERP has no owner and an unknown algorithm setting.",
    "hud": [
      {
        "key": "exposure_contained",
        "label": "Exposure contained",
        "start": 0,
        "suffix": "%",
        "max": 100
      },
      {
        "key": "operations",
        "label": "Business operations",
        "start": 100,
        "suffix": "%",
        "max": 100,
        "warn_below": 70
      },
      {
        "key": "hours_elapsed",
        "label": "Hours elapsed",
        "start": 0,
        "suffix": " h",
        "warn_above": 24
      }
    ],
    "state_variables": {
      "exposure_contained": "Exposure contained, starts at 0",
      "operations": "Business operations, starts at 100",
      "hours_elapsed": "Hours elapsed, starts at 0"
    },
    "stages": [
      {
        "stage_id": "s1",
        "narrative": "A vendor advisory reports a weakness in ALG-X.",
        "decision_prompt": "What do you do first?",
        "choices": [
          {
            "id": "a",
            "text": "Query the inventory for affected assets, owners and switch methods, and start the incident process."
          },
          {
            "id": "b",
            "text": "Email all teams asking whether they use it."
          },
          {
            "id": "c",
            "text": "Wait for the vendor to confirm exploitation."
          }
        ]
      },
      {
        "stage_id": "s2",
        "narrative": "Two services select the algorithm from a policy file.",
        "decision_prompt": "How do you switch them?",
        "choices": [
          {
            "id": "a",
            "text": "Change the policy to the approved fallback for those assets and verify the result with discovery."
          },
          {
            "id": "b",
            "text": "Push an untested emergency change to everything, including the firmware."
          },
          {
            "id": "c",
            "text": "Disable ALG-X everywhere without checking who depends on it."
          }
        ]
      },
      {
        "stage_id": "s3",
        "narrative": "The firmware updater cannot change for 90 days and the ERP has no owner and an unknown setting.",
        "decision_prompt": "What do you do?",
        "choices": [
          {
            "id": "a",
            "text": "Apply compensating controls (isolate the ERP segment, restrict meter update traffic to a gateway), assign an owner and schedule the fix."
          },
          {
            "id": "b",
            "text": "Accept the risk without an owner's approval."
          },
          {
            "id": "c",
            "text": "Ignore the two assets."
          }
        ]
      },
      {
        "stage_id": "s4",
        "narrative": "The immediate exposure is handled.",
        "decision_prompt": "How do you close the incident?",
        "choices": [
          {
            "id": "a",
            "text": "Hold a lessons-learned review: inventory gaps, ownership, configuration-driven change; update the playbook and schedule a drill."
          },
          {
            "id": "b",
            "text": "Close the incident and move on."
          },
          {
            "id": "c",
            "text": "Blame the team that owned the ERP."
          }
        ]
      },
      {
        "stage_id": "s5",
        "narrative": "The risk committee reviews the response.",
        "decision_prompt": "Review the outcome.",
        "choices": []
      }
    ],
    "outcome": {
      "bands": [
        {
          "id": "success",
          "title": "Contained",
          "text": "SUCCESS. The exposure was contained quickly, operations held, and the gaps were turned into actions.",
          "requires": {
            "exposure_contained": {
              "min": 80
            },
            "operations": {
              "min": 70
            },
            "hours_elapsed": {
              "max": 24
            }
          }
        },
        {
          "id": "partial",
          "title": "Partly contained",
          "text": "PARTIAL. Part of the exposure was contained, but at a cost or with gaps left open.",
          "requires": {
            "exposure_contained": {
              "min": 50
            },
            "operations": {
              "min": 50
            }
          }
        },
        {
          "id": "fail",
          "title": "Exposure remains",
          "text": "AT RISK. Significant exposure remains or operations were badly harmed.",
          "requires": {}
        }
      ],
      "final_title": "Cryptographic Incident Concluded"
    },
    "resolution": {
      "concept_reveal": "A cryptographic incident is answered from preparation: an inventory to find affected assets, configuration-driven algorithm selection to switch quickly, owners for every asset, and compensating controls for what cannot be switched. The playbook is the same for a classical algorithm broken early or a flaw in a post-quantum implementation."
    },
    "rewards": {
      "badge_awarded": "Incident Commander",
      "mission_xp_awarded": 100
    },
    "replayability_note": "Choices trade speed against operational damage."
  },
  {
    "mission_id": "mission_discovery_sprint",
    "title": "The Discovery Sprint",
    "type": "decision_scenario",
    "linked_module_id": "track_d_e2_cryptographic_discovery",
    "section_id": "sec-2",
    "role": "You lead the cryptographic discovery sprint for an enterprise.",
    "objective": "Build a trustworthy asset picture within five weeks, inside your authorisation.",
    "environment": "The asset register is incomplete. You have authority over the corporate network and your own cloud accounts. Partners and other tenants are not yours.",
    "hud": [
      {
        "key": "coverage",
        "label": "Coverage of the estate",
        "start": 10,
        "suffix": "%",
        "max": 100
      },
      {
        "key": "data_quality",
        "label": "Quality of the data",
        "start": 80,
        "suffix": "%",
        "max": 100,
        "warn_below": 60
      },
      {
        "key": "scope_compliance",
        "label": "Scope compliance",
        "start": 100,
        "suffix": "%",
        "max": 100,
        "warn_below": 90
      },
      {
        "key": "weeks_used",
        "label": "Weeks used",
        "start": 0,
        "suffix": " wk",
        "warn_above": 5
      }
    ],
    "state_variables": {
      "coverage": "Coverage of the estate, starts at 10",
      "data_quality": "Quality of the data, starts at 80",
      "scope_compliance": "Scope compliance, starts at 100",
      "weeks_used": "Weeks used, starts at 0"
    },
    "stages": [
      {
        "stage_id": "s1",
        "narrative": "You must define the scope.",
        "decision_prompt": "What is in scope?",
        "choices": [
          {
            "id": "a",
            "text": "Define in-scope ranges with written authorisation from their owners, starting with networks and cloud accounts you own."
          },
          {
            "id": "b",
            "text": "Scan every address you can reach, including partners and other tenants."
          },
          {
            "id": "c",
            "text": "Rely on interviews only."
          }
        ]
      },
      {
        "stage_id": "s2",
        "narrative": "You choose methods.",
        "decision_prompt": "How do you collect the data?",
        "choices": [
          {
            "id": "a",
            "text": "Combine passive sources (flow logs, DNS, certificate transparency), active scans in agreed windows, and cloud inventory APIs."
          },
          {
            "id": "b",
            "text": "Run one aggressive full-port scan on production in business hours."
          },
          {
            "id": "c",
            "text": "Run one scan once and treat it as complete."
          }
        ]
      },
      {
        "stage_id": "s3",
        "narrative": "You have findings and the register.",
        "decision_prompt": "How do you reconcile them?",
        "choices": [
          {
            "id": "a",
            "text": "Compare both ways: list shadow assets (found, not registered) and stale records (registered, not found), and assign owners."
          },
          {
            "id": "b",
            "text": "Delete unknown assets from the report to keep it tidy."
          },
          {
            "id": "c",
            "text": "Add everything found to the register with no owner."
          }
        ]
      },
      {
        "stage_id": "s4",
        "narrative": "The sprint ends.",
        "decision_prompt": "How do you keep the picture current?",
        "choices": [
          {
            "id": "a",
            "text": "Schedule recurring discovery, alert on drift against the baseline, and keep the raw evidence."
          },
          {
            "id": "b",
            "text": "Hand over a one-off report."
          },
          {
            "id": "c",
            "text": "Ask teams to self-report each quarter."
          }
        ]
      },
      {
        "stage_id": "s5",
        "narrative": "The programme board reviews the sprint.",
        "decision_prompt": "Review the outcome.",
        "choices": []
      }
    ],
    "outcome": {
      "bands": [
        {
          "id": "success",
          "title": "Trustworthy picture",
          "text": "SUCCESS. The sprint produced a broad, reconciled, owner-assigned picture within authorisation and on time.",
          "requires": {
            "coverage": {
              "min": 65
            },
            "data_quality": {
              "min": 70
            },
            "scope_compliance": {
              "min": 90
            },
            "weeks_used": {
              "max": 5
            }
          }
        },
        {
          "id": "partial",
          "title": "Useful but incomplete",
          "text": "PARTIAL. The picture is useful but narrower, noisier or slower than it could have been.",
          "requires": {
            "coverage": {
              "min": 40
            },
            "scope_compliance": {
              "min": 70
            }
          }
        },
        {
          "id": "fail",
          "title": "Not trustworthy",
          "text": "AT RISK. The scope was breached or the result is too incomplete to rely on.",
          "requires": {}
        }
      ],
      "final_title": "Discovery Sprint Concluded"
    },
    "resolution": {
      "concept_reveal": "Discovery is authorised, multi-source and repeated. Reconcile findings with the register in both directions, keep unowned items visible, and treat any single scan as a lower bound."
    },
    "rewards": {
      "badge_awarded": "Sprint Scout",
      "mission_xp_awarded": 80
    },
    "replayability_note": "Scoping choices change coverage and compliance differently."
  },
  {
    "mission_id": "mission_flat_network_breach",
    "title": "Breach in the Flat Network",
    "type": "decision_scenario",
    "linked_module_id": "track_b_b6_network_security_engineering",
    "section_id": "sec-9",
    "role": "You are the network security engineer after a laptop compromise.",
    "objective": "Contain the breach and design segmentation so that the next compromise cannot reach the crown jewels.",
    "environment": "The internal network is flat: every internal address can reach every other, and the VPN trusts all internal addresses. Finance databases, domain controllers and backups share the network with laptops.",
    "hud": [
      {
        "key": "blast_radius",
        "label": "Systems reachable from a compromised host",
        "start": 100,
        "suffix": "%",
        "max": 100,
        "warn_above": 60
      },
      {
        "key": "operations_ok",
        "label": "Business operations",
        "start": 100,
        "suffix": "%",
        "max": 100,
        "warn_below": 70
      },
      {
        "key": "weeks_elapsed",
        "label": "Weeks elapsed",
        "start": 0,
        "suffix": " wk",
        "warn_above": 10
      }
    ],
    "state_variables": {
      "blast_radius": "Systems reachable from a compromised host, starts at 100",
      "operations_ok": "Business operations, starts at 100",
      "weeks_elapsed": "Weeks elapsed, starts at 0"
    },
    "stages": [
      {
        "stage_id": "s1",
        "narrative": "Logs show an attacker moving from a laptop towards the finance database.",
        "decision_prompt": "How do you contain the live incident?",
        "choices": [
          {
            "id": "a",
            "text": "Isolate the laptop and its credentials, apply a temporary rule blocking east-west traffic from it, and keep business traffic running."
          },
          {
            "id": "b",
            "text": "Shut the whole network down."
          },
          {
            "id": "c",
            "text": "Do nothing until the root cause is known."
          }
        ]
      },
      {
        "stage_id": "s2",
        "narrative": "Leadership wants segmentation. You have no map of who talks to whom.",
        "decision_prompt": "How do you start?",
        "choices": [
          {
            "id": "a",
            "text": "Capture flow data for two weeks to see which systems actually communicate, then write allow-lists from the evidence."
          },
          {
            "id": "b",
            "text": "Draw segments from the org chart and block everything else at once."
          },
          {
            "id": "c",
            "text": "Buy a bigger perimeter firewall."
          }
        ]
      },
      {
        "stage_id": "s3",
        "narrative": "You have flow data and can segment in phases.",
        "decision_prompt": "What do you segment first?",
        "choices": [
          {
            "id": "a",
            "text": "The crown jewels: finance databases, domain controllers and backups, with default-deny and monitored allow-lists."
          },
          {
            "id": "b",
            "text": "Segment building by building."
          },
          {
            "id": "c",
            "text": "Start with the guest Wi-Fi only."
          }
        ]
      },
      {
        "stage_id": "s4",
        "narrative": "Segments exist. Internal addresses are still implicitly trusted by the VPN and admin tools.",
        "decision_prompt": "What do you do about identity?",
        "choices": [
          {
            "id": "a",
            "text": "Apply zero-trust controls for admin access: MFA, per-request authorisation, just-in-time admin rights and no shared accounts."
          },
          {
            "id": "b",
            "text": "Keep trusting every internal address on the VPN."
          },
          {
            "id": "c",
            "text": "Rename the hosts so they are harder to guess."
          }
        ]
      },
      {
        "stage_id": "s5",
        "narrative": "The CISO reviews the programme.",
        "decision_prompt": "Review the outcome.",
        "choices": []
      }
    ],
    "outcome": {
      "bands": [
        {
          "id": "success",
          "title": "Contained and segmented",
          "text": "SUCCESS. The breach was contained without an outage, and the crown jewels now sit behind segments and identity-aware access.",
          "requires": {
            "blast_radius": {
              "max": 25
            },
            "operations_ok": {
              "min": 70
            },
            "weeks_elapsed": {
              "max": 10
            }
          }
        },
        {
          "id": "partial",
          "title": "Improved, not done",
          "text": "PARTIAL. The blast radius is smaller, but either it is still large or the programme cost too much disruption or time.",
          "requires": {
            "blast_radius": {
              "max": 60
            },
            "operations_ok": {
              "min": 50
            }
          }
        },
        {
          "id": "fail",
          "title": "Still flat",
          "text": "AT RISK. An attacker with one foothold can still reach most systems.",
          "requires": {}
        }
      ],
      "final_title": "Segmentation Programme Concluded"
    },
    "resolution": {
      "concept_reveal": "Segmentation and zero trust limit lateral movement: contain the foothold, map real flows, protect high-value assets first with default-deny, and authenticate and authorise every access instead of trusting network location (NIST SP 800-207)."
    },
    "rewards": {
      "badge_awarded": "Segmentation Architect",
      "mission_xp_awarded": 80
    },
    "replayability_note": "Different orders of work lead to different disruption; replay to compare."
  },
  {
    "mission_id": "mission_hybrid_pilot_lab",
    "title": "The Hybrid Pilot",
    "type": "decision_scenario",
    "linked_module_id": "track_b_b11_intermediate_pqc_labs",
    "section_id": "sec-6",
    "role": "You are the engineer piloting hybrid post-quantum key exchange on a TLS gateway.",
    "objective": "Turn on the hybrid key exchange in stages, find why some clients fail, and verify that it is really being used.",
    "environment": "A gateway serves partners and customers. In staging you enabled a hybrid X25519 plus ML-KEM-768 key exchange. A few client types fail to connect.",
    "hud": [
      {
        "key": "handshake_success",
        "label": "Successful handshakes",
        "start": 100,
        "suffix": "%",
        "max": 100,
        "warn_below": 95
      },
      {
        "key": "hybrid_share",
        "label": "Connections using the hybrid key exchange",
        "start": 0,
        "suffix": "%",
        "max": 100
      },
      {
        "key": "confidence",
        "label": "Team confidence",
        "start": 30,
        "suffix": "%",
        "max": 100,
        "warn_below": 40
      }
    ],
    "state_variables": {
      "handshake_success": "Successful handshakes, starts at 100",
      "hybrid_share": "Connections using the hybrid key exchange, starts at 0",
      "confidence": "Team confidence, starts at 30"
    },
    "stages": [
      {
        "stage_id": "s1",
        "narrative": "Some clients time out during the handshake after the change.",
        "decision_prompt": "How do you diagnose it?",
        "choices": [
          {
            "id": "a",
            "text": "Capture packets, compare the ClientHello size before and after, and test with and without the hybrid group to isolate the cause."
          },
          {
            "id": "b",
            "text": "Assume the library is buggy and disable the hybrid group permanently."
          },
          {
            "id": "c",
            "text": "Blame the clients and publish a notice."
          }
        ]
      },
      {
        "stage_id": "s2",
        "narrative": "The trace shows an older firewall mishandling the larger, multi-segment ClientHello.",
        "decision_prompt": "What do you do?",
        "choices": [
          {
            "id": "a",
            "text": "Update or reconfigure the firewall to handle the larger message, test again with the hybrid group, and keep the classical fallback enabled."
          },
          {
            "id": "b",
            "text": "Ask the vendor to fix it and enable hybrid for everyone meanwhile."
          },
          {
            "id": "c",
            "text": "Shrink the key share by removing the post-quantum component."
          }
        ]
      },
      {
        "stage_id": "s3",
        "narrative": "The fix works in staging. How do you start in production?",
        "decision_prompt": "What is the rollout plan?",
        "choices": [
          {
            "id": "a",
            "text": "Start with a 5% canary, with a stop rule on handshake failures and a one-step rollback."
          },
          {
            "id": "b",
            "text": "Enable it for all traffic at once."
          },
          {
            "id": "c",
            "text": "Skip the canary because staging passed."
          }
        ]
      },
      {
        "stage_id": "s4",
        "narrative": "The canary is clean. You want to widen it.",
        "decision_prompt": "How do you confirm the benefit?",
        "choices": [
          {
            "id": "a",
            "text": "Widen in steps and verify from handshakes that the hybrid group was actually negotiated, not just configured."
          },
          {
            "id": "b",
            "text": "Assume that configured means negotiated."
          },
          {
            "id": "c",
            "text": "Make hybrid mandatory now."
          }
        ]
      },
      {
        "stage_id": "s5",
        "narrative": "The change board reviews the pilot results.",
        "decision_prompt": "Review the outcome.",
        "choices": []
      }
    ],
    "outcome": {
      "bands": [
        {
          "id": "success",
          "title": "Pilot succeeded",
          "text": "SUCCESS. The pilot found and fixed the cause of the failures and shows measured hybrid use without harming connections.",
          "requires": {
            "handshake_success": {
              "min": 95
            },
            "hybrid_share": {
              "min": 45
            },
            "confidence": {
              "min": 70
            }
          }
        },
        {
          "id": "partial",
          "title": "Partly successful",
          "text": "PARTIAL. Some hybrid traffic is flowing, but failures or low confidence mean the rollout should pause.",
          "requires": {
            "handshake_success": {
              "min": 85
            },
            "hybrid_share": {
              "min": 20
            }
          }
        },
        {
          "id": "fail",
          "title": "Pilot stopped",
          "text": "AT RISK. The pilot caused failures or did not establish that the hybrid key exchange is in use.",
          "requires": {}
        }
      ],
      "final_title": "Hybrid Pilot Concluded"
    },
    "resolution": {
      "concept_reveal": "A post-quantum key share makes the ClientHello much larger, which can break middleboxes. Diagnose with packet captures, fix the cause, keep a classical fallback, roll out through a canary with a stop rule, and verify the negotiated group in the handshake rather than the configuration."
    },
    "rewards": {
      "badge_awarded": "Hybrid Pilot Lead",
      "mission_xp_awarded": 90
    },
    "replayability_note": "Alternative rollouts give different failure patterns."
  },
  {
    "mission_id": "mission_incident_ransomware_monday",
    "title": "Ransomware Monday",
    "type": "decision_scenario",
    "linked_module_id": "track_a_a4_cybersecurity_foundations",
    "section_id": "sec-8",
    "role": "You are the on-call security analyst at a mid-size company.",
    "objective": "Contain a ransomware outbreak, keep the evidence, and restore service without letting the attacker back in.",
    "environment": "A finance workstation shows a ransom note. File servers are busy. Offline backups from Friday night exist. There is a written incident plan with an incident manager, legal and communications contacts.",
    "hud": [
      {
        "key": "systems_safe",
        "label": "Systems unaffected",
        "start": 100,
        "suffix": "%",
        "max": 100,
        "warn_below": 60
      },
      {
        "key": "evidence_preserved",
        "label": "Evidence preserved",
        "start": 100,
        "suffix": "%",
        "max": 100,
        "warn_below": 50
      },
      {
        "key": "hours_elapsed",
        "label": "Hours elapsed",
        "start": 0,
        "suffix": "h",
        "warn_above": 36
      }
    ],
    "state_variables": {
      "systems_safe": "Systems unaffected, starts at 100",
      "evidence_preserved": "Evidence preserved, starts at 100",
      "hours_elapsed": "Hours elapsed, starts at 0"
    },
    "stages": [
      {
        "stage_id": "s1",
        "narrative": "08:10 Monday. A finance workstation displays a ransom note and its files carry a new extension. The file servers show rising activity.",
        "decision_prompt": "What is your first action?",
        "choices": [
          {
            "id": "a",
            "text": "Isolate the host from the network with the endpoint tool, leave it powered on, and open the incident process."
          },
          {
            "id": "b",
            "text": "Pull the power immediately."
          },
          {
            "id": "c",
            "text": "Wipe and reimage the machine so the user can work again."
          }
        ]
      },
      {
        "stage_id": "s2",
        "narrative": "The host is isolated, but logs show the same account touching three file shares in the last hour.",
        "decision_prompt": "What is the next move?",
        "choices": [
          {
            "id": "a",
            "text": "Disable the compromised account, block the lateral-movement paths, and use the logs to list which shares were touched."
          },
          {
            "id": "b",
            "text": "Pay the ransom to get the decryption key quickly."
          },
          {
            "id": "c",
            "text": "Wait for more information before acting."
          }
        ]
      },
      {
        "stage_id": "s3",
        "narrative": "The business asks for status and legal asks whether personal data was involved.",
        "decision_prompt": "How do you handle communication?",
        "choices": [
          {
            "id": "a",
            "text": "Follow the incident plan: the incident manager coordinates, legal and communications are engaged, and there is a single source of status."
          },
          {
            "id": "b",
            "text": "Let each team handle its own updates informally."
          },
          {
            "id": "c",
            "text": "Post a public status before the facts are verified."
          }
        ]
      },
      {
        "stage_id": "s4",
        "narrative": "Verified offline backups exist from Friday night. It is not yet confirmed that the attacker's persistence is removed.",
        "decision_prompt": "How do you recover?",
        "choices": [
          {
            "id": "a",
            "text": "Remove the attacker's access first (accounts, persistence, entry point), verify the backups are clean, then restore in priority order."
          },
          {
            "id": "b",
            "text": "Restore everything from backup immediately."
          },
          {
            "id": "c",
            "text": "Rebuild every system from scratch without analysis."
          }
        ]
      },
      {
        "stage_id": "s5",
        "narrative": "The incident manager prepares the post-incident report.",
        "decision_prompt": "Review the outcome.",
        "choices": []
      }
    ],
    "outcome": {
      "bands": [
        {
          "id": "success",
          "title": "Contained and recovered",
          "text": "SUCCESS. The outbreak was contained quickly, the evidence supports a root-cause analysis, and service was restored without reinfection.",
          "requires": {
            "systems_safe": {
              "min": 75
            },
            "evidence_preserved": {
              "min": 85
            },
            "hours_elapsed": {
              "max": 24
            }
          }
        },
        {
          "id": "partial",
          "title": "Recovered with gaps",
          "text": "PARTIAL. Service came back, but evidence loss or delay will make the root cause harder to prove and a repeat more likely.",
          "requires": {
            "systems_safe": {
              "min": 65
            },
            "evidence_preserved": {
              "min": 50
            },
            "hours_elapsed": {
              "max": 48
            }
          }
        },
        {
          "id": "fail",
          "title": "Outbreak not under control",
          "text": "AT RISK. Delay, lost evidence or an unsafe restore left systems exposed.",
          "requires": {}
        }
      ],
      "final_title": "Ransomware Monday Concluded"
    },
    "resolution": {
      "concept_reveal": "Incident response follows a lifecycle: preparation, detection and analysis, containment, eradication and recovery, and lessons learned (NIST SP 800-61). The order matters: contain without destroying evidence, remove the attacker before restoring, and communicate through one coordinated channel. Paying a ransom is not a containment step."
    },
    "rewards": {
      "badge_awarded": "Incident Handler",
      "mission_xp_awarded": 60
    },
    "replayability_note": "Choices change the sequence of consequences; replay to compare the paths."
  },
  {
    "mission_id": "mission_leaked_signing_key",
    "title": "The Leaked Signing Key",
    "type": "decision_scenario",
    "linked_module_id": "track_a_a5_cryptography_foundations",
    "section_id": "sec-11",
    "role": "You are the engineer responsible for your company's software signing.",
    "objective": "Recover from a leaked code-signing key without breaking customer trust.",
    "environment": "A private signing key was committed to a public repository six days ago. Customers verify your software updates against the matching public key.",
    "hud": [
      {
        "key": "trust_intact",
        "label": "Customer trust in updates",
        "start": 100,
        "suffix": "%",
        "max": 100,
        "warn_below": 60
      },
      {
        "key": "forgery_risk",
        "label": "Forgery risk",
        "start": 80,
        "suffix": "%",
        "max": 100,
        "warn_above": 50
      },
      {
        "key": "days_elapsed",
        "label": "Days elapsed",
        "start": 0,
        "suffix": " d",
        "warn_above": 5
      }
    ],
    "state_variables": {
      "trust_intact": "Customer trust in updates, starts at 100",
      "forgery_risk": "Forgery risk, starts at 80",
      "days_elapsed": "Days elapsed, starts at 0"
    },
    "stages": [
      {
        "stage_id": "s1",
        "narrative": "A scanner flags the key in a public repository. It has been there six days.",
        "decision_prompt": "What do you do first?",
        "choices": [
          {
            "id": "a",
            "text": "Treat the key as compromised: start revoking and rotating it, and record when it was exposed."
          },
          {
            "id": "b",
            "text": "Delete the file in a new commit and force-push."
          },
          {
            "id": "c",
            "text": "Wait for the next scheduled release to rotate the key."
          }
        ]
      },
      {
        "stage_id": "s2",
        "narrative": "Rotation is under way. You need to know which signatures are suspect.",
        "decision_prompt": "How do you handle existing signed artefacts?",
        "choices": [
          {
            "id": "a",
            "text": "Compare all artefacts signed since the exposure against your build records; re-sign genuine ones with the new key and flag any that have no record."
          },
          {
            "id": "b",
            "text": "Assume only the most recent release is affected."
          },
          {
            "id": "c",
            "text": "Invalidate everything ever signed, including years of releases, without review."
          }
        ]
      },
      {
        "stage_id": "s3",
        "narrative": "Customers' tools trust the old public key.",
        "decision_prompt": "How do you move customers to the new key safely?",
        "choices": [
          {
            "id": "a",
            "text": "Publish a signed advisory and the new key fingerprint through an independent channel, revoke the old key, and run a defined transition period."
          },
          {
            "id": "b",
            "text": "Silently ship the new key in the next update."
          },
          {
            "id": "c",
            "text": "Email customers the new key as an attachment."
          }
        ]
      },
      {
        "stage_id": "s4",
        "narrative": "The incident is contained. How do you prevent a repeat?",
        "decision_prompt": "What do you change?",
        "choices": [
          {
            "id": "a",
            "text": "Add secret scanning to CI, move signing keys into an HSM or key-management service, use short-lived signing identities, and review who has access."
          },
          {
            "id": "b",
            "text": "Run a developer awareness session only."
          },
          {
            "id": "c",
            "text": "Make the repository private and change nothing else."
          }
        ]
      },
      {
        "stage_id": "s5",
        "narrative": "The release manager reviews the incident outcome.",
        "decision_prompt": "Review the outcome.",
        "choices": []
      }
    ],
    "outcome": {
      "bands": [
        {
          "id": "success",
          "title": "Trust preserved",
          "text": "SUCCESS. The key was revoked quickly, the exposure window audited, customers moved to the new key on an independent channel, and controls added.",
          "requires": {
            "trust_intact": {
              "min": 70
            },
            "forgery_risk": {
              "max": 30
            },
            "days_elapsed": {
              "max": 5
            }
          }
        },
        {
          "id": "partial",
          "title": "Partly recovered",
          "text": "PARTIAL. The immediate danger is reduced, but forgery risk or customer trust remains weaker than it should be.",
          "requires": {
            "trust_intact": {
              "min": 50
            },
            "forgery_risk": {
              "max": 60
            }
          }
        },
        {
          "id": "fail",
          "title": "Still exposed",
          "text": "AT RISK. The key remains usable by an attacker or customers lost confidence in your updates.",
          "requires": {}
        }
      ],
      "final_title": "Key Compromise Concluded"
    },
    "resolution": {
      "concept_reveal": "A leaked private key is compromised for good. The response is revoke, rotate, scope the damage by the exposure window, and tell relying parties through a channel they can authenticate. Prevention is structural: keys in HSMs or key-management services, short lifetimes, and automatic secret scanning (NIST SP 800-57 on key management)."
    },
    "rewards": {
      "badge_awarded": "Key Custodian",
      "mission_xp_awarded": 60
    },
    "replayability_note": "Try the other options to see why each fails."
  },
  {
    "mission_id": "mission_pqc_migration_enterprise",
    "title": "The Migration Mandate",
    "type": "decision_scenario",
    "linked_module_id": "track_d_e5_enterprise_pqc_migration",
    "role": "You are the newly appointed Security Architect for a mid-size financial services company.",
    "objective": "Lead your organization through a quantum-safe migration before your board-mandated 18-month deadline, without causing a business-continuity incident.",
    "environment": "Your organization has: 10,000 employee/customer-facing devices, a legacy PKI with RSA-2048 certificates, a customer-facing TLS API layer, an internal VPN, and a 20-year regulatory data-retention requirement on customer financial records.",
    "state_variables": {
      "readiness_score": "0-100, starts at 12 (mostly unassessed)",
      "business_continuity_score": "0-100, starts at 100, decreases with risky/rushed decisions",
      "budget_remaining": "starts at 100 (percent), decreases per stage based on choices made",
      "time_remaining_months": "starts at 18, decreases per stage",
      "discovered_assets": "0 until Stage 1 is resolved",
      "chosen_algorithms": "map of asset-category to selected PQC algorithm, populated across Stage 3",
      "hybrid_mode_enabled": "boolean, set in Stage 3"
    },
    "stages": [
      {
        "stage_id": "stage_1_the_alert",
        "narrative": "🚨 Quantum Vulnerability Detected. Your compliance team flags that your organization's cryptographic posture has never been formally assessed against post-quantum risk. The board wants a plan in 2 weeks.",
        "decision_prompt": "What's your first move?",
        "choices": [
          {
            "id": "a",
            "text": "Immediately start migrating the customer-facing TLS API, since it's the most visible system."
          },
          {
            "id": "b",
            "text": "Commission a full cryptographic discovery and inventory before touching anything."
          },
          {
            "id": "c",
            "text": "Tell the board quantum computers don't exist yet, so there's no real urgency."
          }
        ]
      },
      {
        "stage_id": "stage_2_the_inventory_reveals",
        "narrative": "Discovery is complete. Your cryptographic inventory shows: 6,000 devices using RSA-2048 for TLS, 3,500 using ECDSA-256 for VPN authentication, and 500 legacy devices you can't easily update (embedded firmware, vendor-locked).",
        "decision_prompt": "How do you prioritize?",
        "choices": [
          {
            "id": "a",
            "text": "Migrate everything simultaneously to hit the deadline faster."
          },
          {
            "id": "b",
            "text": "Prioritize by risk: the systems protecting the 20-year-retention financial data first, piloted on a small subset before wider rollout."
          },
          {
            "id": "c",
            "text": "Deprioritize everything and focus only on the 500 legacy embedded devices since they're the hardest problem."
          }
        ]
      },
      {
        "stage_id": "stage_3_algorithm_selection",
        "narrative": "You've prioritized the TLS-facing RSA-2048 fleet and the VPN's ECDSA-256 authentication. Now you need to select PQC algorithms and decide on hybrid vs. pure deployment.",
        "decision_prompt": "For the TLS key exchange (currently RSA), what do you select?",
        "choices": [
          {
            "id": "a",
            "text": "ML-KEM, deployed in hybrid mode alongside the existing classical exchange."
          },
          {
            "id": "b",
            "text": "ML-KEM, pure PQC only, dropping the classical fallback immediately for maximum quantum-safety."
          },
          {
            "id": "c",
            "text": "SLH-DSA for the key exchange, since it's the most conservative option."
          }
        ]
      },
      {
        "stage_id": "stage_4_the_benchmark_surprise",
        "narrative": "Your pilot deployment (hybrid ML-KEM on 200 devices) is running. Performance monitoring shows a measurable latency increase on your oldest device tier — larger key sizes mean more handshake overhead.",
        "decision_prompt": "How do you respond?",
        "choices": [
          {
            "id": "a",
            "text": "Halt the entire migration until the performance issue is fully resolved for every device tier."
          },
          {
            "id": "b",
            "text": "Check whether the latency increase is actually noticeable to end users before deciding whether it's a real problem."
          },
          {
            "id": "c",
            "text": "Ignore it and proceed straight to full production rollout across all 10,000 devices."
          }
        ]
      },
      {
        "stage_id": "stage_5_final_report",
        "narrative": "18 months (adjusted by your time-management decisions) later, your board wants a final readiness report.",
        "decision_prompt": "Based on your accumulated readiness_score and business_continuity_score, the mission resolves automatically — no further choice here, but the outcome depends entirely on your path through Stages 1-4.",
        "outcome_bands": {
          "readiness_score_75_plus_and_continuity_60_plus": "SUCCESS — Full Migration Complete. Your board approves the final report; the organization is genuinely quantum-ready and didn't sacrifice operational stability to get there.",
          "readiness_score_50_to_74": "PARTIAL SUCCESS — Migration In Progress, On Track. You've made real, defensible progress but haven't finished — a realistic and common outcome for a first migration cycle.",
          "readiness_score_below_50_or_continuity_below_40": "AT RISK — the board is not satisfied. Debrief explains which specific decisions (traceable to the stage choices made) drove the shortfall, so the learner can see exactly where the path diverged."
        }
      }
    ],
    "resolution": {
      "success_condition": "Combined readiness_score and business_continuity_score both land in healthy ranges by Stage 5 — see outcome_bands above.",
      "failure_condition": "Either score falls critically low due to rushed, under-prepared, or poorly sequenced decisions.",
      "concept_reveal": "Full debrief shown at mission end: 'Real enterprise PQC migration isn't a single technical decision — it's a sequence: Discover, Inventory, Classify, Risk-Rank, Select PQC, Prototype, Benchmark, Pilot, Hybrid Migration, Production Rollout, Monitor, Retire. Skipping steps to move faster (as tempting as it is under a board deadline) is exactly what causes real-world migration failures. The tradeoffs you just navigated — speed vs. safety, aggressive vs. cautious algorithm choices, ignoring vs. investigating pilot data — are the actual judgment calls a Security Architect faces, not hypothetical exam questions.'"
    },
    "rewards": {
      "badge_awarded": "Migration Commander",
      "mission_xp_awarded": 100
    },
    "replayability_note": "Multiple valid paths exist through this mission — a cautious, slower path and a leaner, faster path can both reach SUCCESS if internally consistent (e.g., consistently risk-driven and evidence-based). The mission should NOT have one single 'correct' route; it should reward sound reasoning patterns across different valid strategies, mirroring how real migrations don't have one universally correct playbook either.",
    "section_id": "sec-12",
    "hud": [
      {
        "key": "readiness_score",
        "label": "Quantum Readiness",
        "start": 12,
        "suffix": "%",
        "max": 100
      },
      {
        "key": "business_continuity_score",
        "label": "Business Continuity",
        "start": 100,
        "suffix": "%",
        "max": 100,
        "warn_below": 70
      },
      {
        "key": "budget_remaining",
        "label": "Budget Remaining",
        "start": 100,
        "suffix": "%",
        "max": 100
      },
      {
        "key": "time_remaining_months",
        "label": "Timeline Left",
        "start": 18,
        "suffix": " Months",
        "warn_below": 7
      }
    ],
    "outcome": {
      "final_title": "Enterprise Migration Mandate Concluded",
      "bands": [
        {
          "id": "success",
          "title": "Full Migration Approved",
          "text": "SUCCESS: Full Migration Complete. Your board approves the final report; the organization is genuinely quantum-ready and did not sacrifice operational stability to get there.",
          "requires": {
            "readiness_score": {
              "min": 75
            },
            "business_continuity_score": {
              "min": 60
            }
          }
        },
        {
          "id": "partial",
          "title": "Partial Success: On Track",
          "text": "PARTIAL SUCCESS: Migration In Progress, On Track. You have made real, defensible progress but have not finished: a realistic and common outcome for a first migration cycle.",
          "requires": {
            "readiness_score": {
              "min": 50
            }
          }
        },
        {
          "id": "fail",
          "title": "Migration At Risk",
          "text": "AT RISK: The board is not satisfied. Rushed or improperly sequenced decisions compromised either cryptographic readiness or business continuity.",
          "requires": {}
        }
      ]
    }
  },
  {
    "mission_id": "mission_quantum_threat_briefing",
    "title": "The Quantum Threat Briefing",
    "type": "decision_scenario",
    "linked_module_id": "track_b_b8_quantum_threats",
    "section_id": "sec-8",
    "role": "You are the security architect asked to brief the executive team.",
    "objective": "Produce an accurate, credible threat model and a request the executives can act on.",
    "environment": "The company holds customer records with a 25-year retention requirement, signs software updates, and uses TLS everywhere. The board has heard that 'quantum will break all encryption'.",
    "hud": [
      {
        "key": "exposure_covered",
        "label": "Share of at-risk data covered by the plan",
        "start": 0,
        "suffix": "%",
        "max": 100
      },
      {
        "key": "credibility",
        "label": "Credibility with the board",
        "start": 70,
        "suffix": "%",
        "max": 100,
        "warn_below": 50
      },
      {
        "key": "months_used",
        "label": "Months used",
        "start": 0,
        "suffix": " mo",
        "warn_above": 6
      }
    ],
    "state_variables": {
      "exposure_covered": "Share of at-risk data covered by the plan, starts at 0",
      "credibility": "Credibility with the board, starts at 70",
      "months_used": "Months used, starts at 0"
    },
    "stages": [
      {
        "stage_id": "s1",
        "narrative": "You must decide what the threat model is about.",
        "decision_prompt": "How do you scope it?",
        "choices": [
          {
            "id": "a",
            "text": "Classify data by sensitivity and by how long it must stay secret, and find what is captured in transit or stored under public-key protection."
          },
          {
            "id": "b",
            "text": "List every system alphabetically with equal priority."
          },
          {
            "id": "c",
            "text": "Focus only on the biggest systems."
          }
        ]
      },
      {
        "stage_id": "s2",
        "narrative": "A director asks what exactly is broken and what is not.",
        "decision_prompt": "What is the correct technical answer?",
        "choices": [
          {
            "id": "a",
            "text": "Shor's algorithm breaks RSA, Diffie-Hellman and elliptic-curve cryptography on a large fault-tolerant machine; Grover's algorithm only gives a quadratic speedup against symmetric keys, so AES-256 and SHA-2/3 remain adequate."
          },
          {
            "id": "b",
            "text": "Double all symmetric key lengths urgently and leave the public-key systems as they are."
          },
          {
            "id": "c",
            "text": "All cryptography is equally broken."
          }
        ]
      },
      {
        "stage_id": "s3",
        "narrative": "The board asks when this will happen.",
        "decision_prompt": "How do you answer?",
        "choices": [
          {
            "id": "a",
            "text": "Present the planning inequality (is the time until a capable machine shorter than migration time plus data lifetime?) with scenarios, not a single predicted date."
          },
          {
            "id": "b",
            "text": "State a firm date, say 2029, for when encryption breaks."
          },
          {
            "id": "c",
            "text": "Say that no one can know, so no action is needed."
          }
        ]
      },
      {
        "stage_id": "s4",
        "narrative": "You must end with a request.",
        "decision_prompt": "What do you ask for?",
        "choices": [
          {
            "id": "a",
            "text": "Tie it to long-lived data and the published policy deadlines, and ask for a cryptographic inventory, a pilot and ownership."
          },
          {
            "id": "b",
            "text": "Warn that all encryption will fail and ask for an open budget."
          },
          {
            "id": "c",
            "text": "Send a technical paper with no recommendation."
          }
        ]
      },
      {
        "stage_id": "s5",
        "narrative": "The board decides.",
        "decision_prompt": "Review the outcome.",
        "choices": []
      }
    ],
    "outcome": {
      "bands": [
        {
          "id": "success",
          "title": "Plan approved",
          "text": "SUCCESS. The board understands what is and is not at risk and approves an inventory and pilot.",
          "requires": {
            "exposure_covered": {
              "min": 70
            },
            "credibility": {
              "min": 70
            },
            "months_used": {
              "max": 6
            }
          }
        },
        {
          "id": "partial",
          "title": "Partly persuaded",
          "text": "PARTIAL. The board will act, but on a narrower scope or with less trust than a stronger briefing would have earned.",
          "requires": {
            "exposure_covered": {
              "min": 40
            },
            "credibility": {
              "min": 50
            }
          }
        },
        {
          "id": "fail",
          "title": "Briefing not accepted",
          "text": "AT RISK. The briefing did not convince the board or did not cover the exposure.",
          "requires": {}
        }
      ],
      "final_title": "Threat Briefing Concluded"
    },
    "resolution": {
      "concept_reveal": "A defensible quantum threat model separates what is broken (public-key key establishment and signatures, by Shor) from what loses margin (symmetric keys and hashes, by Grover), ranks data by sensitivity and secrecy lifetime, and frames timing as the inequality 'time until a capable machine < migration time + data lifetime' instead of a predicted date."
    },
    "rewards": {
      "badge_awarded": "Briefing Officer",
      "mission_xp_awarded": 70
    },
    "replayability_note": "Alternative framings change how far the board trusts the plan."
  },
  {
    "mission_id": "mission_side_channel_report",
    "title": "The Side-Channel Report",
    "type": "decision_scenario",
    "linked_module_id": "track_c_c11_pqc_defense_engineering",
    "section_id": "sec-5",
    "role": "You are the maintainer of an ML-KEM implementation used by customers.",
    "objective": "Triage, fix and disclose a reported timing leak in decapsulation.",
    "environment": "A researcher reports that decapsulation takes measurably different time for valid and invalid ciphertexts, measured over the network from outside.",
    "hud": [
      {
        "key": "key_safety",
        "label": "Protection of key material",
        "start": 60,
        "suffix": "%",
        "max": 100,
        "warn_below": 50
      },
      {
        "key": "customer_trust",
        "label": "Customer trust",
        "start": 80,
        "suffix": "%",
        "max": 100,
        "warn_below": 60
      },
      {
        "key": "days_open",
        "label": "Days open",
        "start": 0,
        "suffix": " d",
        "warn_above": 14
      }
    ],
    "state_variables": {
      "key_safety": "Protection of key material, starts at 60",
      "customer_trust": "Customer trust, starts at 80",
      "days_open": "Days open, starts at 0"
    },
    "stages": [
      {
        "stage_id": "s1",
        "narrative": "The report arrives with a measurement script.",
        "decision_prompt": "How do you triage it?",
        "choices": [
          {
            "id": "a",
            "text": "Acknowledge it, reproduce locally with statistical timing tests, and treat it as exploitable until disproved."
          },
          {
            "id": "b",
            "text": "Dismiss it: network jitter hides any difference."
          },
          {
            "id": "c",
            "text": "Patch immediately without reproducing."
          }
        ]
      },
      {
        "stage_id": "s2",
        "narrative": "You find that the check comparing the re-encrypted ciphertext with the received one exits at the first differing byte.",
        "decision_prompt": "What is the right fix?",
        "choices": [
          {
            "id": "a",
            "text": "Use a constant-time comparison and a constant-time (mask-based) selection of the output secret, or move to a maintained constant-time implementation, and add tests."
          },
          {
            "id": "b",
            "text": "Add a random delay to the function."
          },
          {
            "id": "c",
            "text": "Allow the service only from the internal network."
          }
        ]
      },
      {
        "stage_id": "s3",
        "narrative": "A patch exists.",
        "decision_prompt": "How do you verify it?",
        "choices": [
          {
            "id": "a",
            "text": "Run statistical timing tests in CI with many measurements, and check that compiler optimisations or CPU behaviour have not reintroduced a branch."
          },
          {
            "id": "b",
            "text": "Run unit tests that check only that decapsulation is correct."
          },
          {
            "id": "c",
            "text": "Rely on code review alone."
          }
        ]
      },
      {
        "stage_id": "s4",
        "narrative": "The fix is ready to ship.",
        "decision_prompt": "How do you disclose it?",
        "choices": [
          {
            "id": "a",
            "text": "Publish a coordinated advisory with affected versions, the fix, mitigations and credit to the researcher, and advise key rotation where exposure is plausible."
          },
          {
            "id": "b",
            "text": "Ship the fix quietly with no notice."
          },
          {
            "id": "c",
            "text": "Hold the disclosure until after a marketing event."
          }
        ]
      },
      {
        "stage_id": "s5",
        "narrative": "The security team writes the post-mortem.",
        "decision_prompt": "Review the outcome.",
        "choices": []
      }
    ],
    "outcome": {
      "bands": [
        {
          "id": "success",
          "title": "Fixed and disclosed",
          "text": "SUCCESS. The leak was reproduced, fixed in constant time, verified, and disclosed responsibly.",
          "requires": {
            "key_safety": {
              "min": 85
            },
            "customer_trust": {
              "min": 80
            },
            "days_open": {
              "max": 10
            }
          }
        },
        {
          "id": "partial",
          "title": "Partly resolved",
          "text": "PARTIAL. The immediate risk is reduced, but verification, disclosure or timing could have been stronger.",
          "requires": {
            "key_safety": {
              "min": 65
            },
            "customer_trust": {
              "min": 60
            }
          }
        },
        {
          "id": "fail",
          "title": "Leak remains",
          "text": "AT RISK. The flaw remains exploitable or customers lost trust in how it was handled.",
          "requires": {}
        }
      ],
      "final_title": "Side-Channel Response Concluded"
    },
    "resolution": {
      "concept_reveal": "Timing side channels leak secrets through the duration of operations that depend on them. The cure is constant-time code (comparison and selection included), verified by statistical timing tests, plus responsible disclosure. Random delays and network restrictions are not fixes."
    },
    "rewards": {
      "badge_awarded": "Side-Channel Responder",
      "mission_xp_awarded": 100
    },
    "replayability_note": "Different triage and disclosure choices change trust and exposure."
  }
];

# Risk-to-skill mapping

Status: **proposed-unreviewed**. The mapping is a methodological claim: it states which competencies a person needs
to meet the requirement a scanner finding creates. No rule has been validated by an expert. Expert review (content
validity index and inter-rater agreement) is plan task T5.2.

## Chain

```
scanner finding --(requirement_map.json)--> requirement --> required competencies (with level)
                                                              |
             learner capability (T1.4) ---------------------> skill gap (T1.6) --> recommendation (T1.7)
```

## Data

| Item | Where |
|---|---|
| The map | `content/curriculum/requirement_map.json` |
| Loader, validation, matching, derivation | `backend/main_api/competency/requirements.py` |
| Derived rows | table `finding_requirements` (`finding_id`, `requirement_id`, `competency_code`, `required_level`, `map_version`, `created_at`); unique on (`finding_id`, `requirement_id`, `competency_code`, `map_version`) |
| API | `GET /api/findings/{finding_id}/requirements` |

### Map format

- **Top-level fields:** `version`, `status` and `competency_model_version` (the version of `competency_model.json`
  whose competency ids the map uses).
- **`rules`:** a list. Each rule has:
  - `requirement_id`, `requirement` (text) and `pqc_relevant`;
  - `match`, with exactly one of `finding_type` (exact) or `finding_type_prefix`;
  - `competencies`: a list of `{ "id", "required_level" }`. `required_level` is Developing, Proficient or Advanced;
    a requirement of Unknown or Beginner would mean no skill is needed;
  - `rationale` and `sources`.
- **`positive_evidence`:** finding types that show readiness (for example `pqc.kex.hybrid`) and create no
  requirement.
- **`unmapped_by_design`:** finding types for which no competency requirement is claimed yet (`http.*`, `dns.*`),
  each with a reason.

### Matching

The first rule whose `match` fits the finding type wins, so rules are listed most specific first. A finding type
that no rule matches must be listed in `positive_evidence` or `unmapped_by_design`. The test
`backend/tests/test_requirement_map.py` reads every finding id from `scanner_api/scanner/findings.py` and fails on
any gap.

### Current rules (proposed-v1)

| Finding type | Requirement | Competencies (required level) | PQC |
|---|---|---|---|
| `pqc.kex.classical_only` | REQ.KEX.HYBRID | NET.4 (Proficient), PQC.6 (Proficient), PQC.3 (Developing), PQC.1 (Developing) | yes |
| `pqc.auth.classical_certificate` | REQ.PKI.PQC_SIG | CRYPTO.4 (Proficient), PQC.3 (Developing), PQC.8 (Developing) | yes |
| `tls.kex.no_forward_secrecy` | REQ.TLS.FS | NET.4 (Proficient), CRYPTO.3 (Developing) | no |
| `tls.version.obsolete`, `tls.legacy.*` | REQ.TLS.VERSION | NET.4 (Proficient) | no |
| `cert.*` (expired, expiring, untrusted) | REQ.PKI.LIFECYCLE | CRYPTO.4 (Developing), CRYPTO.5 (Developing) | no |
| `exposure.port.*` | REQ.NET.EXPOSURE | NET.3 (Developing), SEC.2 (Developing) | no |
| `pqc.kex.hybrid`, `pqc.kex.hybrid_available` | none (positive evidence) | | yes |
| `http.*`, `dns.*` | none (unmapped by design) | | no |

## Derivation

- **During a scan:** `evidence_service.ingest_scan` handles verified full scans. After it opens or updates
  findings, it calls `requirements.derive_requirements` for each of them.
  - Derivation is idempotent for a given map version. Rows that still apply are kept, rows the map no longer
    produces are removed, and rows of other map versions are kept for traceability.
  - A finding without a rule stays a tracked finding without requirements and is counted as `unmapped` in the
    ingest summary. It is never dropped.
- **At start-up:** `requirements.backfill` derives requirements for findings that have no rows for the current
  map version.

### Info-level findings (fix for fact B7)

Only high and medium findings used to be tracked, so `pqc.auth.classical_certificate` (info) was never stored, even
though certificate migration is a core requirement. Info findings listed in `evidence_service.TRACKED_INFO` are now
tracked, with severity 0.3.

- **The 0.3 value:** it is ordinal only. It sorts these planning items after current exposures (medium is 0.6)
  and is not a calibrated risk. The API reports it as severity `info`.
- **Resolution:** `pqc.auth.*` findings resolve only after a later scan completes the `certificate` check without
  seeing them. If that check fails or does not run, the finding stays open.
- **Other info items stay untracked**, for example `pqc.kex.hybrid`, which is positive evidence, and
  `dns.caa.missing`.

## Versioning and review

- **Recording versions:** every derived row stores `map_version`, and the API returns `map_status`, so results
  always say which draft produced them.
- **Changing a rule:** bump `version`. Old rows stay, and new rows are derived for the new version on the next
  scan or at start-up.
- **After review:** when an expert round is accepted (T5.2), publish a new version (for example `reviewed-v1`) with
  `status` set to `reviewed`.

## Relation to `graph/competency_map.py`

`graph/competency_map.py` maps finding prefixes to two quiz topics for the exposure-graph recommender. It predates
this map and is a second, coarser mapping. T1.4 switches the graph projection to per-competency capability and
`finding_requirements`, and then retires `competency_map.py`, so that the system has a single mapping.

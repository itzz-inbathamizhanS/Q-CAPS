# Risk score v1 (unvalidated)

Code: `backend/main_api/risk/score.py` (pure functions), `risk/service.py` (storage). API: `GET /api/findings/{id}/risk`,
`PUT /api/assets/{id}/context`. UI: closure page ("Risk (unvalidated model)") and the scanner's verified-domain
panel (asset context form).

**Status: unvalidated.** This is the transparent prototype form proposed in the research document, §8.6. The
research document requires experimental validation before it can support any claim. Until then it is used to
*order* findings, and the UI says so. Every stored score has `validated: false` and its model version.

## Formula

```
risk = exposure × asset_criticality × pqc_dependency × migration_urgency      each factor in [0, 1]
```

| Factor | Derivation | Source | Assumptions |
|---|---|---|---|
| exposure | scanner severity × evidence confidence | `findings.severity` (0.9 high, 0.6 medium, 0.3 info) and `findings.confidence` (weighted count of observed scan evidence) | Both are ordinal; the product only orders findings |
| asset_criticality | low 0.25, medium 0.5, high 0.75, critical 1.0 | `assets.criticality_level`, declared by whoever manages the asset | Even steps |
| pqc_dependency | 1 if the finding's cryptography is broken by a quantum computer, otherwise 0 | the finding type: `pqc.kex.classical_only`, `tls.kex.no_forward_secrecy` (RSA key transport) and `pqc.auth.classical_certificate` are 1 | Binary; obsolete TLS versions and expired certificates are real problems but not PQC risk, so they score 0 here |
| migration_urgency | min(confidentiality years, 15) / 15 × sensitivity (public 0, internal 0.33, confidential 0.67, restricted 1) | `assets.confidentiality_years` and `assets.data_sensitivity` | The 15-year horizon is an assumption to vary in a sensitivity analysis, not a prediction of quantum timelines |

**Unknown is not zero.**

- **Missing context:** if criticality, sensitivity or confidentiality lifetime is missing, the score is `null`
  and `missing` lists what is needed. No default is filled in.
- **Legacy columns:** `assets.criticality` (default 1.0) and `confidentiality_lifetime` (default 0) predate this
  model. Nothing ever set them, so they are not used.

## Storage

- **History:** every computation inserts a `risk_scores` row with `model_version`, the exact `inputs`, every
  factor, `score` and `missing`. Rows are never edited, so the history stays traceable.
- **When scores are computed:**
  - when a verified scan opens or updates the finding;
  - when the asset context changes (every finding of the asset is rescored, and the change is audited as
    `asset.context`);
  - at start-up, for findings that have no score for the current model version.

## Who sets the context

The owner of a personal asset, the `org_admin` of an organization asset, or a platform admin
(`organizations/access.can_manage_asset`). Others get 404 for assets they cannot see and 403 for assets they can
see but not manage.

## Worked example (illustrative, not a result)

An organization's API server has a classical-only key exchange.

- **Scan:** medium severity 0.6, evidence confidence 0.8.
- **Declared context:** critical asset, confidential data, 10 years of confidentiality.

```
exposure          = 0.6 × 0.8              = 0.48
asset_criticality = critical               = 1.0
pqc_dependency    = classical key exchange = 1.0
migration_urgency = (10 / 15) × 0.67       ≈ 0.447
risk              = 0.48 × 1.0 × 1.0 × 0.447 ≈ 0.21
```

The same server's obsolete TLS version scores 0: it is a security problem with no post-quantum dependency.

## What validation needs

- **Sensitivity analysis:** vary the horizon, the step values and the severity mapping, and check that the
  ranking holds.
- **Expert agreement:** compare the model's ranking with expert rankings on the same findings.
- **Later:** relate the scores to remediation outcomes.

None of this has been done.

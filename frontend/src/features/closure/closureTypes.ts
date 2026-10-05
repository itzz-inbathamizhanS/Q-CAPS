export interface ClosureEvent {
  id: string;
  finding_id?: string;
  intervention_id?: string;
  verification_id?: string;
  previous_state: string;
  new_state: string;
  reason: string;
  event_hash: string;
  created_at: string;
}

export interface Finding {
  id: string;
  asset_id?: number;
  evidence_id?: string;
  finding_type: string;
  title?: string | null;
  algorithm?: string | null;
  protocol?: string | null;
  severity: number;
  confidence: number;
  migration_urgency: number;
  status: string;
  first_seen: string;
  last_seen: string;
}

/** GET /findings/{id}/risk: risk-v1, an unvalidated model. score null means Unknown (see missing). */
export interface RiskScore {
  finding_id: string;
  model_version: string;
  score: number | null;
  factors: { exposure: number | null; asset_criticality: number | null; pqc_dependency: number | null; migration_urgency: number | null };
  inputs: Record<string, unknown>;
  missing: string[];
  computed_at: string;
  validated: boolean;
}

/** Row of GET /findings/{id}/requirements (risk-to-skill map). */
export interface FindingRequirement {
  requirement_id: string;
  requirement: string | null;
  pqc_relevant: boolean | null;
  rationale: string | null;
  competency_code: string;
  competency_name: string | null;
  required_level: string;
  map_version: string;
  map_status: string | null;
}

/** Result of POST /interventions/{id}/verify; computed entirely by the server. */
export interface VerificationResult {
  status: string;
  verification_id: string;
  event_hash: string;
  technical_ok: boolean;
  learner_result_ok: boolean;
  technical: { remediated: boolean; same_asset: boolean; finding_status: string; rule: string };
  learner: { ok: boolean; competency: string | null; level?: string; required_level?: string | null; rule?: string; detail?: string };
  verifier_version: string;
}

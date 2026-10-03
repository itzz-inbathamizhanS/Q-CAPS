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
  algorithm?: string | null;
  protocol?: string | null;
  severity: number;
  confidence: number;
  migration_urgency: number;
  status: string;
  first_seen: string;
  last_seen: string;
}

export interface TechnicalDelta {
  remediated: boolean;
  same_asset: boolean;
  details: Record<string, unknown>;
}

export interface VerificationResult {
  status: string;
  technical_delta: TechnicalDelta;
  learner_result_ok: boolean;
  technical_ok: boolean;
}

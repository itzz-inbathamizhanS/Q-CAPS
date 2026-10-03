export interface Evidence {
  id: string;
  scan_id?: string;
  asset_id?: number;
  evidence_type: string;
  normalized_payload: Record<string, unknown>;
  payload_hash: string;
  scanner_version: string;
  classifier_version: string;
  confidence: number;
  observed_at: string;
}

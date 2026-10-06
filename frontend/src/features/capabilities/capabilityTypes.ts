export type CapabilityLevel = 'Unknown' | 'Beginner' | 'Developing' | 'Proficient' | 'Advanced';

export interface DepthCount {
  correct: number;
  total: number;
}

/** Row of GET /users/{id}/capabilities. Scores are null when there is no evidence of that kind (not zero). */
export interface LearnerCapability {
  id: number;
  user_id: number;
  competency_id: number;
  competency_code: string | null;
  competency_name: string | null;
  knowledge_score: number | null;
  procedural_score: number | null;
  operational_score: number | null;
  confidence: number | null;
  freshness: number | null;
  knowledge_by_depth: { aware_explain: DepthCount; apply: DepthCount; analyse: DepthCount; reviewed_items: number } | null;
  evidence_count: number | null;
  last_evidence_at: string | null;
  level: CapabilityLevel | null;
  model_version: string | null;
  updated_at: string;
}

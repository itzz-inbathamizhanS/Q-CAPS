export interface LearnerCapability {
  id: number;
  user_id: number;
  competency_id: number;
  knowledge_score: number;
  procedural_score: number;
  operational_score: number;
  confidence: number;
  freshness: number;
  updated_at: string;
}

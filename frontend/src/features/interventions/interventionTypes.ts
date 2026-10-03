export interface Intervention {
  id: string;
  finding_id?: string;
  competency_id?: number;
  intervention_type: string;
  module_id?: string;
  lab_template_id?: string;
  minimum_score: number;
  created_at: string;
}

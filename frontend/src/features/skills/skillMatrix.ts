import { useEffect, useState } from 'react';
import { api } from '@/services/backendService';

export type GapClass = 'critical' | 'high' | 'medium' | 'none' | 'unassessed';

export interface DrivingFinding {
  finding_id: string;
  finding_type: string;
  title: string | null;
  severity: number;
  requirement_id: string;
  required_level: string;
}

/** Row of GET /users/me/skill-matrix. */
export interface SkillMatrixRow {
  competency_code: string;
  competency_name: string | null;
  required_level: string | null; // null: no current requirement from the learner's open findings
  demonstrated_level: string; // "Unknown" when there is not enough evidence
  gap: number | 'unassessed' | null;
  gap_class: GapClass | null;
  driving_findings: DrivingFinding[];
  evidence_count: number;
  last_evidence_at: string | null;
  knowledge_score: number | null;
  procedural_score: number | null;
}

export interface SkillMatrix {
  competency_model_version: string;
  levels_status: string | null;
  requirement_map_version: string;
  requirement_map_status: string;
  rows: SkillMatrixRow[];
}

/** Throws on failure so the page can tell an error from an empty matrix. */
export async function fetchSkillMatrix(): Promise<SkillMatrix> {
  return (await api.get('/users/me/skill-matrix')).data as SkillMatrix;
}

export type SkillMatrixState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; matrix: SkillMatrix };

export function useSkillMatrix(): SkillMatrixState {
  const [state, setState] = useState<SkillMatrixState>({ status: 'loading' });
  useEffect(() => {
    let live = true;
    fetchSkillMatrix()
      .then((matrix) => live && setState({ status: 'ready', matrix }))
      .catch((e: unknown) => live && setState({ status: 'error', message: e instanceof Error ? e.message : 'Request failed' }));
    return () => {
      live = false;
    };
  }, []);
  return state;
}

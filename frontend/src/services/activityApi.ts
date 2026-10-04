import { api } from './backendService';

export interface ActivityAward {
  xp: number;
  badge: string | null;
}

export interface ActivityProgress {
  completed_labs: string[];
  completed_missions: string[];
  badges: string[];
  xp: number;
}

export interface LabAnswerResult {
  correct: boolean;
  feedback: string;
  awarded: ActivityAward | null;
}

export interface MissionChoiceResult {
  feedback: string;
  values: Record<string, number>;
  finished: boolean;
  band: string | null;
  awarded: ActivityAward | null;
}

export interface BB84Run {
  run_id: string;
  alice_bits: number[];
  alice_bases: string[];
  bob_bases: string[];
  bob_results: number[];
  sifted: number[];
}

export interface BB84Decision {
  correct: boolean;
  error_rate: number;
  eve_present: boolean;
  awarded: ActivityAward | null;
}

/** Practice labs and missions are graded by the server, which also awards XP and badges. */
export const fetchActivityProgress = async (): Promise<ActivityProgress> => (await api.get('/activities/me')).data;

export const answerLab = async (scenarioId: string, choiceId: string): Promise<LabAnswerResult> =>
  (await api.post(`/activities/labs/${encodeURIComponent(scenarioId)}/answer`, { choice_id: choiceId })).data;

export const startMissionRun = async (missionId: string): Promise<{ run_id: string; values: Record<string, number> }> =>
  (await api.post(`/activities/missions/${encodeURIComponent(missionId)}/runs`, {})).data;

export const chooseMissionOption = async (runId: string, choiceId: string): Promise<MissionChoiceResult> =>
  (await api.post(`/activities/missions/runs/${encodeURIComponent(runId)}/choose`, { choice_id: choiceId })).data;

export const startBB84Run = async (missionId: string, photons: number): Promise<BB84Run> =>
  (await api.post(`/activities/missions/${encodeURIComponent(missionId)}/runs`, { photons })).data;

export const decideBB84 = async (runId: string, sampleSize: number, decision: 'accept' | 'abort'): Promise<BB84Decision> =>
  (await api.post(`/activities/missions/runs/${encodeURIComponent(runId)}/decide`, { sample_size: sampleSize, decision })).data;

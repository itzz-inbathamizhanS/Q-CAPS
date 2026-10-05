import { api } from '@/services/backendService';
import { ClosureEvent, Finding, FindingRequirement, VerificationResult } from './closureTypes';

// These calls throw on failure so the closure page can tell "could not load" from "nothing recorded".
export const closureService = {
  getFinding: async (findingId: string): Promise<Finding> => (await api.get(`/findings/${findingId}`)).data,

  getRequirements: async (findingId: string): Promise<FindingRequirement[]> =>
    (await api.get(`/findings/${findingId}/requirements`)).data,

  getClosuresForFinding: async (findingId: string): Promise<ClosureEvent[]> => (await api.get(`/closures/${findingId}`)).data,

  /** The server computes both the technical and the learner result; nothing is sent but the request itself. */
  verifyIntervention: async (interventionId: string): Promise<VerificationResult> =>
    (await api.post(`/interventions/${interventionId}/verify`, {})).data,
};

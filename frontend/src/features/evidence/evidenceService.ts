import { api } from '@/services/backendService';
import { Evidence } from './evidenceTypes';

export const evidenceService = {
  /** Throws on failure (including 404 for evidence the user may not see). */
  getEvidence: async (evidenceId: string): Promise<Evidence> => (await api.get(`/evidence/${evidenceId}`)).data,
};

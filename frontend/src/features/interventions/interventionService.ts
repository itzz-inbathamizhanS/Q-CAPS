import { api } from '@/services/backendService';
import { Intervention } from './interventionTypes';

export const interventionService = {
  /** Throws on failure; an empty list means no intervention has been assigned. */
  getForFinding: async (findingId: string): Promise<Intervention[]> => (await api.get(`/findings/${findingId}/interventions`)).data,

  getIntervention: async (id: string): Promise<Intervention> => (await api.get(`/interventions/${id}`)).data,
};

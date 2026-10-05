import { api } from '@/services/backendService';
import { LearnerCapability } from './capabilityTypes';

export const capabilityService = {
  /** Throws on failure; an empty list means no capability evidence yet. */
  getUserCapabilities: async (userId: number): Promise<LearnerCapability[]> => (await api.get(`/users/${userId}/capabilities`)).data,
};

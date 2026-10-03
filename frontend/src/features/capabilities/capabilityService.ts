import { api } from '@/services/backendService';
import { LearnerCapability } from './capabilityTypes';

export const capabilityService = {
  getUserCapabilities: async (userId: number): Promise<LearnerCapability[]> => {
    try {
      const response = await api.get(`/users/${userId}/capabilities`);
      return response.data;
    } catch (error) {
      console.error('Error fetching capabilities:', error);
      return [];
    }
  }
};

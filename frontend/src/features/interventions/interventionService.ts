import { api } from '@/services/backendService';
import { Intervention } from './interventionTypes';

export const interventionService = {
  getForFinding: async (findingId: string): Promise<Intervention[]> => {
    try {
      const response = await api.get(`/findings/${findingId}/interventions`);
      return response.data;
    } catch (error) {
      console.error('Error fetching interventions for finding:', error);
      return [];
    }
  },

  getIntervention: async (id: string): Promise<Intervention | null> => {
    try {
      const response = await api.get(`/interventions/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching intervention:', error);
      return null;
    }
  }
};

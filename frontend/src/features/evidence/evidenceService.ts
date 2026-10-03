import { api } from '@/services/backendService';
import { Evidence } from './evidenceTypes';

export const evidenceService = {
  getEvidence: async (evidenceId: string): Promise<Evidence | null> => {
    try {
      const response = await api.get(`/evidence/${evidenceId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching evidence:', error);
      return null;
    }
  }
};

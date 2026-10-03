import { api } from '@/services/backendService';
import { ClosureEvent, Finding, VerificationResult } from './closureTypes';

export const closureService = {
  getFinding: async (findingId: string): Promise<Finding | null> => {
    try {
      const response = await api.get(`/findings/${findingId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching finding:', error);
      return null;
    }
  },

  getClosuresForFinding: async (findingId: string): Promise<ClosureEvent[]> => {
    try {
      const response = await api.get(`/closures/${findingId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching closures:', error);
      return [];
    }
  },

  verifyIntervention: async (interventionId: string, verificationData: Record<string, unknown>): Promise<VerificationResult | null> => {
    try {
      const response = await api.post(`/interventions/${interventionId}/verify`, verificationData);
      return response.data;
    } catch (error) {
      console.error('Error verifying intervention:', error);
      return null;
    }
  }
};

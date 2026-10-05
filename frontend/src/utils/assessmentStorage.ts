import { useAuthStore } from '@/features/auth/authStore';

// Before T1.5 the diagnostic was scored in the browser and its result kept in localStorage. Such results cannot
// be verified, so they are never imported: the learner is told once that the diagnostic must be retaken.
const legacyKey = () => `qcaps_latest_assessment_result_${useAuthStore.getState().userId || 'guest'}`;

export const hasLegacyLocalResult = (): boolean => {
  try {
    return localStorage.getItem(legacyKey()) != null;
  } catch {
    return false; // storage unavailable: there is nothing to tell the learner about
  }
};

export const clearLegacyLocalResult = (): void => {
  try {
    localStorage.removeItem(legacyKey());
  } catch {
    /* storage unavailable: nothing stored to clear */
  }
};
